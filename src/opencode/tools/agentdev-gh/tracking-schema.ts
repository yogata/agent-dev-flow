// 追跡Issueの物理写像モジュール（写像表の機械適用）。
//
// 論理値（role、kind、追跡Issue状態）と物理値（GitHub ラベル、REST メタデータ、
// ローカルIssueの frontmatter 値）の変換を単一の表として所有する。上位層は
// 論理値のみを操作契約で扱い、本モジュールの物理値を参照しない。
//
// 写像の意味（role の 2 値、kind の 4 値、状態の 6 値と三段写像）は論理スキーマ
// 一元管理 Design の確定事項に従う。本モジュールは機械適用のみを行い、写像の
// 意味判断を新規に所有しない。状態の三段写像（追跡Issue 6状態、GitHub
// open/closed、Tool issue_close reason の対応）は次のとおり:
//   起票/検討中/保留/実行準備完了/解決済み -> open（クローズしない）
//   クローズ済み（反映完了）              -> closed / completed
//   クローズ済み（反映不要の確認完了）      -> closed / not_planned


/** Issue の論理 role。追跡Issue（tracking）と Case Issue（case）の 2 値。 */
export type IssueRole = "tracking" | "case";

/** 追跡Issueの論理 kind。problem、idea、task、risk の 4 値。 */
export type TrackingKind = "problem" | "idea" | "task" | "risk";

/** 追跡Issueの論理状態（6値）。クローズ済みのみ終端。 */
export type TrackingState =
  | "created" // 起票
  | "in-discussion" // 検討中
  | "on-hold" // 保留
  | "ready" // 実行準備完了
  | "resolved" // 解決済み（結論確定。open を維持する中間状態）
  | "closed"; // クローズ済み（反映完了または反映不要の確認完了）

/** GitHub 側の close reason（REST API state_reason）。 */
export type CloseReason = "completed" | "not_planned";

/** 追跡Issueの非終端状態（GitHub state は open のまま扱う 5 状態）。 */
export const NON_TERMINAL_TRACKING_STATES: readonly TrackingState[] = [
  "created",
  "in-discussion",
  "on-hold",
  "ready",
  "resolved",
];

/** 追跡Issue状態の全値域。 */
export const TRACKING_STATES: readonly TrackingState[] = [
  ...NON_TERMINAL_TRACKING_STATES,
  "closed",
];

/** kind の全値域。 */
export const TRACKING_KINDS: readonly TrackingKind[] = [
  "problem",
  "idea",
  "task",
  "risk",
];

// ---------------------------------------------------------------------------
// GitHub 物理写像（ラベル）
// ---------------------------------------------------------------------------

/**
 * role の物理ラベル。追跡Issueにのみ付与する。
 * 本ラベルを欠く Issue は role: case として機械判定する（既存 Case Issue は
 * role ラベルを持たないため、付与の有無のみで role を判定できる）。
 */
export const TRACKING_ROLE_LABEL = "agentdev-tracking";

/** kind の物理ラベルの接頭辞。`agentdev-kind/problem` の形式。 */
const KIND_LABEL_PREFIX = "agentdev-kind/";

/** 追跡Issue状態（非終端）の物理ラベルの接頭辞。`agentdev-tracking-status/on-hold` の形式。 */
const TRACKING_STATUS_LABEL_PREFIX = "agentdev-tracking-status/";

/** kind の論理値を物理ラベルへ写像する。 */
export function kindToLabel(kind: TrackingKind): string {
  return `${KIND_LABEL_PREFIX}${kind}`;
}

/** 非終端追跡Issue状態の論理値を物理ラベルへ写像する。 */
export function trackingStateToLabel(state: TrackingState): string | null {
  if (!NON_TERMINAL_TRACKING_STATES.includes(state)) return null;
  return `${TRACKING_STATUS_LABEL_PREFIX}${state}`;
}

/** 物理ラベルから kind 論理値を逆写像する。該当なしは null。 */
export function labelToKind(label: string): TrackingKind | null {
  if (!label.startsWith(KIND_LABEL_PREFIX)) return null;
  const value = label.slice(KIND_LABEL_PREFIX.length);
  return (TRACKING_KINDS as readonly string[]).includes(value)
    ? (value as TrackingKind)
    : null;
}

/** 物理ラベルから非終端追跡Issue状態を逆写像する。該当なしは null。 */
export function labelToTrackingState(label: string): TrackingState | null {
  if (!label.startsWith(TRACKING_STATUS_LABEL_PREFIX)) return null;
  const value = label.slice(TRACKING_STATUS_LABEL_PREFIX.length);
  return (NON_TERMINAL_TRACKING_STATES as readonly string[]).includes(value)
    ? (value as TrackingState)
    : null;
}

/** 追跡Issueの物理ラベル群（role、kind、非終端状態）を一括して剥がした残りのラベル。 */
export function stripTrackingLabels(labels: readonly string[]): string[] {
  return labels.filter(
    (l) =>
      l !== TRACKING_ROLE_LABEL &&
      !l.startsWith(KIND_LABEL_PREFIX) &&
      !l.startsWith(TRACKING_STATUS_LABEL_PREFIX),
  );
}

/**
 * 追跡Issueとして付与すべき物理ラベル群を構成する。
 * 既存ラベルのうち追跡Issue軸のラベルは置換し、それ以外は保持する。
 */
export function buildTrackingLabels(
  currentLabels: readonly string[],
  kind: TrackingKind,
  state: TrackingState,
): string[] {
  const stateLabel = trackingStateToLabel(state);
  const kept = stripTrackingLabels(currentLabels);
  const next = [TRACKING_ROLE_LABEL, kindToLabel(kind)];
  if (stateLabel !== null) next.push(stateLabel);
  return [...new Set([...next, ...kept])];
}

// ---------------------------------------------------------------------------
// 論理値の導出（GitHub REST メタデータから）
// ---------------------------------------------------------------------------

/** GitHub REST メタデータから role を機械判定する。 */
export function deriveRole(labels: readonly string[]): IssueRole {
  return labels.includes(TRACKING_ROLE_LABEL) ? "tracking" : "case";
}

/** GitHub REST メタデータから kind を導出する。 */
export function deriveKind(labels: readonly string[]): TrackingKind | null {
  for (const l of labels) {
    const kind = labelToKind(l);
    if (kind !== null) return kind;
  }
  return null;
}

/**
 * GitHub REST メタデータから追跡Issue状態を導出する（三段写像の機械適用）。
 * closed は state_reason によらずクローズ済み。closeReason に反映完了
 * （completed）と反映不要（not_planned）の別を返す。
 */
export function deriveTrackingState(
  labels: readonly string[],
  state: "open" | "closed",
  stateReason: string | null | undefined,
): { trackingState: TrackingState | null; closeReason: CloseReason | null } {
  if (deriveRole(labels) !== "tracking") {
    return { trackingState: null, closeReason: null };
  }
  if (state === "closed") {
    return {
      trackingState: "closed",
      closeReason: stateReason === "not_planned" ? "not_planned" : "completed",
    };
  }
  for (const l of labels) {
    const s = labelToTrackingState(l);
    if (s !== null) return { trackingState: s, closeReason: null };
  }
  return { trackingState: "created", closeReason: null };
}

/** 論理値の文字列表現を検証して TrackingState へ落とす。不正は null。 */
export function parseTrackingState(value: unknown): TrackingState | null {
  return typeof value === "string" &&
      (TRACKING_STATES as readonly string[]).includes(value)
    ? (value as TrackingState)
    : null;
}

/** 論理値の文字列表現を検証して TrackingKind へ落とす。不正は null。 */
export function parseTrackingKind(value: unknown): TrackingKind | null {
  return typeof value === "string" &&
      (TRACKING_KINDS as readonly string[]).includes(value)
    ? (value as TrackingKind)
    : null;
}

/** 論理値の文字列表現を検証して IssueRole へ落とす。不正は null。 */
export function parseIssueRole(value: unknown): IssueRole | null {
  return value === "tracking" || value === "case" ? value : null;
}

// ---------------------------------------------------------------------------
// ローカルIssue物理写像（frontmatter トークン）
// ---------------------------------------------------------------------------

/**
 * ローカルIssueの frontmatter トークン。role と追跡Issue状態は論理値と同一
 * トークンを採用し、kind は labels へ素の値として格納する（ローカルIssue
 * 共通スキーマの role 条件付きスキーマに従う）。
 */
export const LOCAL_ROLE_TOKENS: readonly IssueRole[] = ["tracking", "case"];

/** ローカルIssue（role: tracking）の status 値域。論理状態トークンと同一。 */
export const LOCAL_TRACKING_STATUS_VALUES: readonly TrackingState[] = TRACKING_STATES;

/** ローカルIssue（role: tracking）の labels 値域（kind と同値）。 */
export const LOCAL_TRACKING_LABEL_VALUES: readonly TrackingKind[] = TRACKING_KINDS;

/** 再オープン後の追跡Issue状態（クローズ済みからの再検討）。 */
export const REOPEN_TRACKING_STATE: TrackingState = "in-discussion";
