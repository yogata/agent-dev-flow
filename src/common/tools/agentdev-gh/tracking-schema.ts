// 追跡Issueの物理写像モジュール（写像表の機械適用）。
//
// 論理値（role、kind、追跡Issue状態）と物理値（GitHub ラベル、REST メタデータ、
// ローカルIssueの frontmatter 値）の変換を単一の表として所有する。上位層は
// 論理値のみを操作契約で扱い、本モジュールの物理値を参照しない。
//
// 写像の意味（role の 2 値、kind の 4 値、状態の 6 値と三段写像）は論理スキーマ
// 一元管理 Design の確定事項に従う。本モジュールは機械適用のみを行い、写像の
// 意味判断を新規に所有しない。GitHub 物理ラベルによる追跡軸の機械識別は role
// のみであり、kind と非終端追跡Issue状態は GitHub ラベルへ写像せず、追跡Issue
// 本文標準構造の項目（kind、状態保持節）として表現する。旧追跡軸ラベルは廃止
// 済みであり、正規起票経路から再作成・付与しない。状態の三段写像
// （追跡Issue 6状態、GitHub open/closed、Tool issue_close reason の対応）は次のとおり:
//   起票/検討中/保留/実行準備完了/解決済み -> open（クローズしない。非終端状態は
//     本文の状態保持節で保持し、Tool は状態ラベルを付与・導出しない）
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

/** kind の全値域（論理値。Tool 操作契約の受理・導出には使用しない）。 */
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
export const TRACKING_ROLE_LABEL = "tracking";

/** role 物理ラベルを剥がした残りのラベル（通常ラベル）。 */
export function stripTrackingLabels(labels: readonly string[]): string[] {
  return labels.filter((l) => l !== TRACKING_ROLE_LABEL);
}

/**
 * 追跡Issueとして付与すべき物理ラベル群を構成する。
 * role 物理ラベルのみを追跡軸として付与し、既存ラベル（通常ラベル）を保持する。
 */
export function buildTrackingLabels(currentLabels: readonly string[]): string[] {
  return [...new Set([TRACKING_ROLE_LABEL, ...stripTrackingLabels(currentLabels)])];
}

// ---------------------------------------------------------------------------
// 論理値の導出（GitHub REST メタデータから）
// ---------------------------------------------------------------------------

/** GitHub REST メタデータから role を機械判定する。 */
export function deriveRole(labels: readonly string[]): IssueRole {
  return labels.includes(TRACKING_ROLE_LABEL) ? "tracking" : "case";
}

/**
 * GitHub state と state_reason からクローズ済みの close reason を導出する。
 * 非終端（open）と Case Issue は null を返す。非終端の現在状態は本文の状態保持節
 * が保持し、Tool は導出しない（三段写像の機械適用）。
 */
export function deriveCloseReason(
  labels: readonly string[],
  state: "open" | "closed",
  stateReason: string | null | undefined,
): CloseReason | null {
  if (deriveRole(labels) !== "tracking") return null;
  if (state === "closed") {
    return stateReason === "not_planned" ? "not_planned" : "completed";
  }
  return null;
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
 * トークンを採用する（ローカルIssue共通スキーマの role 条件付きスキーマに従う）。
 */
export const LOCAL_ROLE_TOKENS: readonly IssueRole[] = ["tracking", "case"];

/** ローカルIssue（role: tracking）の status 値域。論理状態トークンと同一。 */
export const LOCAL_TRACKING_STATUS_VALUES: readonly TrackingState[] = TRACKING_STATES;

/** 再オープン後の追跡Issue状態（クローズ済みからの再検討）。 */
export const REOPEN_TRACKING_STATE: TrackingState = "in-discussion";
