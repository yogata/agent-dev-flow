/**
 * 完了済み過去工程の改訂実行記録の生成と変更反映完了判定（決定的処理）。
 *
 * - 依拠版基準の影響評価の入力（relied-diff 公開 CLI の出力）の取得状態と、
 *   下流対象ごとの処置結果から、変更反映完了の判定、完了側に含めない対象、
 *   再開に必要な情報を決定的に導出する
 * - 依拠版の解決不能・影響評価の入力の取得失敗・未確認・処理失敗・旧証拠の
 *   適用不能は完了側に含めない（fail-closed。失敗を空の変更集合として隠蔽しない）
 * - 承認範囲の記録なしでは改訂実行記録を生成しない（有効な承認の対象・内容・
 *   範囲の記録が必須）
 * - 通知の時点区分（事前通知・追加通知・結果説明）を stage ごとに区別して保持する
 * - 本 lib は記録の保存を行わない（stdout 出力の様式と機械生成のみ。
 *   保存先への書込みは保存する操作〔成果物反映 Workflow Skill〕の責務）
 * - 記録量は下流対象の列挙数に比例し、正規成果物や差分の本文を複写しない
 */

/** 下流対象ごとの処置結果の区分。 */
export type RevisionItemOutcome =
  | "updated" // 更新実施、検証済み
  | "created" // 作成実施、検証済み
  | "no-update" // 更新不要（現行上流との整合根拠を確認済み）
  | "unconfirmed" // 未確認（完了側から除外。確認の解消が対象）
  | "failed" // 処理失敗（完了側から除外。再開対象）
  | "pending"; // 未処理（完了側から除外。再開対象）

/** 再利用する旧検証証拠の現在の対象・版・条件への適用可能性。 */
export type EvidenceApplicability = "applicable" | "stale" | "unconfirmed";

/** 通知の時点区分。正規反映前の事前通知（pre）、実行中の追加通知（in-progress）、反映後の結果説明（post）。 */
export type NoticeStage = "pre" | "in-progress" | "post";

const ITEM_OUTCOMES: readonly RevisionItemOutcome[] = [
  "updated",
  "created",
  "no-update",
  "unconfirmed",
  "failed",
  "pending",
];

const EVIDENCE_APPLICABILITIES: readonly EvidenceApplicability[] = [
  "applicable",
  "stale",
  "unconfirmed",
];

const NOTICE_STAGES: readonly NoticeStage[] = ["pre", "in-progress", "post"];

export interface RevisionItem {
  /** 下流対象（正規成果物または下流工程の対象）の識別。リポジトリ相対パス等。 */
  readonly path: string;
  /** 処置結果の区分。 */
  readonly outcome: RevisionItemOutcome;
  /** 根拠（実施した更新内容、更新不要の整合根拠、未確認・失敗の理由）。全区分で必須。 */
  readonly reason: string;
  /** 実施した検証とその結果。updated / created では必須。 */
  readonly verification: string | null;
  /** 旧検証証拠の適用可能性。旧証拠を再利用しない対象は null。 */
  readonly evidenceReuse: EvidenceApplicability | null;
}

export interface NoticeEntry {
  readonly stage: NoticeStage;
  /** 通知の記録参照（実行記録から時点区分を確認できるための参照先）。 */
  readonly reference: string;
}

/** 依拠版基準の影響評価の入力の取得状態（relied-diff 公開 CLI の出力から抽出）。 */
export interface ImpactInputState {
  /** 依拠版の解決と影響分類の取得に成功したか。失敗・未解決は false。 */
  readonly resolved: boolean;
  readonly reliedCommit: string | null;
  readonly headCommit: string | null;
  readonly comparisonRange: string | null;
  readonly fullyPropagated: string | null;
  /** 未取得・未解決の場合の理由。取得済みの場合は空文字。 */
  readonly note: string;
}

export interface RevisionRecordInput {
  /** 記録生成時点の時計から取得した記録日時（ISO 8601 UTC）。入力本文の日付を代用しない。 */
  readonly recordedAt: string;
  readonly impactInput: ImpactInputState;
  readonly items: readonly RevisionItem[];
  /** 適用した承認の対象・内容・範囲の記録。空文字は不可（fail-closed）。 */
  readonly approval: string;
  readonly notices: readonly NoticeEntry[];
}

export interface RevisionRecordItem extends RevisionItem {
  /** 変更反映完了の判定の完了側に含める対象か。 */
  readonly completed: boolean;
}

export interface RevisionRecordOutput {
  readonly recordedAt: string;
  readonly impactInput: ImpactInputState;
  readonly approval: string;
  readonly notices: readonly NoticeEntry[];
  readonly items: readonly RevisionRecordItem[];
  /** 変更反映完了の判定。依拠版の解決不能・取得失敗・未確認・処理失敗・旧証拠不適合の残存は incomplete。 */
  readonly completion: "completed" | "incomplete";
  /** 完了側に含めない対象とその理由（対象ごとの記録）。 */
  readonly excludedFromCompletion: readonly { path: string; reason: string }[];
  /** 未成立の更新・再検証（再開対象）と再開に必要な情報。 */
  readonly resumeTargets: readonly { path: string; reason: string }[];
}

/**
 * 記録操作時点の時計から記録日時（ISO 8601 UTC）を取得する。
 * 時計が無効（時刻を取得できない）な場合は日時を捏造せず例外で失敗を明示する（fail-closed）。
 */
export function resolveRecordedAt(clock: () => Date = () => new Date()): string {
  const date = clock();
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    throw new Error("記録日時を取得できない（時計が無効）。日時を捏造せず、取得失敗を明示する");
  }
  return date.toISOString();
}

/**
 * relied-diff 公開 CLI の出力（JSON）から影響評価の入力の取得状態を抽出する。
 * 必須フィールドの欠落・様式不備は例外（fail-closed。破損入力を黙って無視しない）。
 * 依拠版の解決不能・影響分類の未確定（fullyPropagated: undetermined）は
 * resolved: false として扱い、影響評価の入力の未取得と同じく完了側に含めない。
 */
export function summarizeReliedDiffReport(report: unknown): ImpactInputState {
  if (typeof report !== "object" || report === null || Array.isArray(report)) {
    throw new Error("影響評価の入力（relied-diff 出力）が JSON オブジェクトでない（fail-closed）");
  }
  const record = report as Record<string, unknown>;
  if (record["mode"] !== "relied-diff") {
    throw new Error(`影響評価の入力が relied-diff の出力でない（fail-closed）: mode=${String(record["mode"])}`);
  }
  const reliedCommit = asOptionalString(record["reliedCommit"], "reliedCommit");
  const headCommit = asOptionalString(record["headCommit"], "headCommit");
  const comparisonRange = asOptionalString(record["comparisonRange"], "comparisonRange");
  const fullyPropagated = asOptionalString(record["fullyPropagated"], "fullyPropagated");
  const resolved = reliedCommit !== null && comparisonRange !== null && comparisonRange !== "unresolved" &&
    fullyPropagated !== null && fullyPropagated !== "undetermined";
  const note = resolved
    ? ""
    : "依拠版の解決不能・比較基準の未確定のため影響分類を取得できていない。正規成果物・承認・検証記録・Git 履歴から依拠版を確認し、公開 CLI で再実行するまで完了側に含めない";
  return { resolved, reliedCommit, headCommit, comparisonRange, fullyPropagated, note };
}

function asOptionalString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new Error(`影響評価の入力のフィールド ${field} が文字列でない（fail-closed）`);
  }
  return value;
}

/**
 * 改訂実行記録を生成する（決定的。同一入力から同一 JSON）。
 * 判定規則:
 * - 承認範囲の記録が空なら例外（有効な承認の対象・内容・範囲の記録なしでは確定しない）
 * - 下流対象の path 重複、語彙外の区分、検証結果なしの updated / created、
 *   根拠なしの項目、語彙外・空参照の通知時点区分は例外（fail-closed。修正して再実行）
 * - 影響評価の入力が未取得・未解決なら全下流対象を完了側から除外する
 * - 未確認・処理失敗・未処理・旧証拠の適用不能（stale / unconfirmed）は
 *   完了側に含めない。failed / pending は再開対象として列挙する
 */
export function buildRevisionRecord(input: RevisionRecordInput): RevisionRecordOutput {
  if (input.approval.trim().length === 0) {
    throw new Error("適用した承認の対象・内容・範囲の記録が空で改訂実行記録を生成できない（fail-closed）");
  }
  if (!Number.isFinite(new Date(input.recordedAt).getTime())) {
    throw new Error(`記録日時が不正（fail-closed）: ${input.recordedAt}`);
  }

  const seen = new Set<string>();
  for (const item of input.items) {
    if (!(ITEM_OUTCOMES as readonly string[]).includes(item.outcome)) {
      throw new Error(`下流対象の処置結果区分が不正（fail-closed）: ${String(item.outcome)}`);
    }
    if (item.path.trim().length === 0) {
      throw new Error("下流対象の識別が空（fail-closed）");
    }
    if (seen.has(item.path)) {
      throw new Error(`下流対象の識別が重複している（fail-closed）: ${item.path}`);
    }
    seen.add(item.path);
    if (item.reason.trim().length === 0) {
      throw new Error(`下流対象の根拠が空（fail-closed）: ${item.path}`);
    }
    if ((item.outcome === "updated" || item.outcome === "created") &&
      (item.verification === null || item.verification.trim().length === 0)) {
      throw new Error(
        `更新・作成した下流対象に実施した検証の結果がなく記録を確定しない（fail-closed）: ${item.path}`,
      );
    }
    if (item.evidenceReuse !== null && !(EVIDENCE_APPLICABILITIES as readonly string[]).includes(item.evidenceReuse)) {
      throw new Error(`旧検証証拠の適用可能性区分が不正（fail-closed）: ${String(item.evidenceReuse)}`);
    }
  }

  // 通知の時点区分は語彙と記録参照のみを検証する。同一区分の複数回は許容する
  // （事前通知・実行中の追加通知・反映後の結果説明の 3 時点区分の確認可能性が義務。
  //   実行中の追加通知は新たな影響の判明ごとに複数回あり得る）
  for (const notice of input.notices) {
    if (!(NOTICE_STAGES as readonly string[]).includes(notice.stage)) {
      throw new Error(`通知の時点区分が不正（fail-closed）: ${String(notice.stage)}`);
    }
    if (notice.reference.trim().length === 0) {
      throw new Error(`通知の記録参照が空（fail-closed）: ${notice.stage}`);
    }
  }

  const inputUnavailable = !input.impactInput.resolved;
  const items = input.items.map((item): RevisionRecordItem => {
    const evidenceStale = item.evidenceReuse === "stale" || item.evidenceReuse === "unconfirmed";
    let completed: boolean;
    if (inputUnavailable) {
      completed = false;
    } else if (item.outcome === "unconfirmed" || item.outcome === "failed" || item.outcome === "pending") {
      completed = false;
    } else {
      completed = !evidenceStale;
    }
    return { ...item, completed };
  });

  const excludedFromCompletion = items
    .filter((item) => !item.completed)
    .map((item) => ({
      path: item.path,
      reason: inputUnavailable
        ? `影響評価の入力が取得できていないため完了側に含めない。${item.reason}`
        : item.reason,
    }));

  const resumeTargets = items
    .filter((item) => !inputUnavailable && (item.outcome === "failed" || item.outcome === "pending"))
    .map((item) => ({ path: item.path, reason: item.reason }));

  const completion: "completed" | "incomplete" =
    inputUnavailable || items.some((item) => !item.completed) ? "incomplete" : "completed";

  return {
    recordedAt: input.recordedAt,
    impactInput: input.impactInput,
    approval: input.approval,
    notices: [...input.notices],
    items,
    completion,
    excludedFromCompletion,
    resumeTargets,
  };
}
