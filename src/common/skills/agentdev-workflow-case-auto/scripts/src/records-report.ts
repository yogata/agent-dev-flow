/**
 * case-auto 取りまとめ経路の決定的部分（集約・報告生成・反映計画・部分成功照合・回復計画）。
 *
 * 本モジュールは I/O を行わない（純関数）。GitHub I/O は Custom Tool（agentdev_gh）経由、
 * 記録契機でのコメント投稿・本文更新、Epic 反映の書込み経路、失敗注入を伴う回復規律の実行は
 * 各正規所有に属する。本モジュールはそれらの書込み経路への入力を決定的に生成する。
 *
 * - 停止時集約報告: 対象群を完了済み / 進行中 / 未実行 / 観測不能に分類し、
 *   再開入口（Root Case 指定の次コマンド）と進行状況要素を含む報告構造を生成する
 *   （case-auto 実行契約の停止時報告要件、case-auto の取りまとめ責務）
 * - 反映計画: 記録契機ごとの反映対象を反映面（本文 / コメント / Epic）ごとに独立管理し、
 *   部分成功を区別する（case-auto の取りまとめ責務）
 * - 部分成功照合: 送信試行と読み戻し結果から不足分（未反映）を確定し、
 *   読み戻し未確認対象を再試行対象に含めない（重複投稿防止）
 * - 回復計画: 未反映対象と識別情報、および成果の確定と記録・終了処理の完了の区分を生成する
 *
 * 全関数は入力として与えられた現行観測のみに依存し、保持された旧状態を混入しない。
 * したがって再開時に durable state から再構成した最新観測を与えれば、
 * 停止時の集約を再利用せずに最新条件に基づく集約・計画が得られる。
 */

// ---------------------------------------------------------------------------
// 停止時集約報告
// ---------------------------------------------------------------------------

/** 対象（execution_unit / Issue）の停止時点での観測状態。 */
export type UnitObservationStatus =
  /** 実行結果確定かつ成功。 */
  | "completed"
  /** 進行中（実行結果未確定）。 */
  | "active"
  /** 未実行（未起動・開始条件未成立）。 */
  | "not-started"
  /** 観測不能。進行中と断定せず、観測不能であることを明示する。 */
  | "state-unknown";

/** 実行結果の確定値（委譲 result 4状態相当）。 */
export type UnitOutcome = "pass" | "blocked" | "failed" | "delegation-unavailable";

/** 停止時点での対象1件の観測レコード。 */
export interface UnitRecord {
  /** 対象識別子（Issue番号等）。 */
  target: string;
  /** orchestration stage（1〜4）。 */
  stage: number;
  /** 停止時点の観測状態。 */
  status: UnitObservationStatus;
  /** 実行結果確定値。後続不能確定（blocked / failed / delegation-unavailable）の対象に付与する。 */
  outcome?: UnitOutcome;
}

/** 停止時集約の分類結果。 */
export interface StopAggregation {
  completed: UnitRecord[];
  active: UnitRecord[];
  notStarted: UnitRecord[];
  stateUnknown: UnitRecord[];
}

/** 停止報告の文脈（集約対象外の報告要素。本モジュールは再解釈しない）。 */
export interface StopContext {
  /** 停止理由分類（STEP-4 の分類値をそのまま透過する）。 */
  stopReason: string;
  /** 再開に必要な次コマンド（Root Case 指定の再開入口。工程別 resume_command フィールドではない）。 */
  nextCommand: string;
  /** 再開点（どの durable state から再開するか）。 */
  resumeBasis: string;
  /** 最新記録参照（停止時点で最新の記録位置）。 */
  latestRecordRef: string;
  /** タイミング情報（開始時刻・停止時刻・経過時間等。人間が読める形式のまま透過）。 */
  timing?: string;
}

/** 停止時集約報告。 */
export interface StopReport {
  aggregation: StopAggregation;
  /** 集約の一行表記（完了済み n 件 / 進行中 n 件 / 未実行 n 件 / 観測不能 n 件）。 */
  summaryLine: string;
  /** 各対象の集約行（対象、stage、状態、確定結果）。 */
  unitLines: string[];
  /** 次コマンド行。 */
  nextCommandLine: string;
  /** 進行状況要素の行群（停止理由、次の行動、最新記録参照、タイミング）。 */
  presenceLines: string[];
}

const STATUS_JA: Record<UnitObservationStatus, string> = {
  completed: "完了済み",
  active: "進行中",
  "not-started": "未実行",
  "state-unknown": "観測不能",
};

const OUTCOME_JA: Record<UnitOutcome, string> = {
  pass: "pass",
  blocked: "blocked（後続不能確定）",
  failed: "failed（後続不能確定）",
  "delegation-unavailable": "delegation-unavailable（後続不能確定）",
};

/**
 * 対象群を完了済み / 進行中 / 未実行 / 観測不能に分類する。
 *
 * 入力の現行観測のみに依存する。状態不明（state-unknown）の対象は進行中に含めず、
 * 観測不能として独立分類する（観測不能を進行中と断定しない）。
 */
export function aggregateUnits(units: readonly UnitRecord[]): StopAggregation {
  const aggregation: StopAggregation = {
    completed: [],
    active: [],
    notStarted: [],
    stateUnknown: [],
  };
  for (const unit of units) {
    if (unit.status === "completed") aggregation.completed.push(unit);
    else if (unit.status === "active") aggregation.active.push(unit);
    else if (unit.status === "not-started") aggregation.notStarted.push(unit);
    else aggregation.stateUnknown.push(unit);
  }
  return aggregation;
}

function formatUnitLine(unit: UnitRecord): string {
  const outcome = unit.outcome === undefined ? "" : `、${OUTCOME_JA[unit.outcome]}`;
  return `- ${unit.target}（stage ${unit.stage}）: ${STATUS_JA[unit.status]}${outcome}`;
}

/**
 * 停止時集約報告を生成する。
 *
 * 完了済み / 進行中 / 未実行の各委譲単位と再開に必要な次コマンドを含め、
 * 観測不能対象は観測不能として明示する。後続不能確定（blocked / failed /
 * delegation-unavailable）の対象は完了済みには集約せず、確定結果を行に明示する。
 */
export function buildStopReport(
  units: readonly UnitRecord[],
  context: StopContext,
): StopReport {
  const aggregation = aggregateUnits(units);
  const summaryLine =
    `集約: 完了済み ${aggregation.completed.length} 件 / 進行中 ${aggregation.active.length} 件 / ` +
    `未実行 ${aggregation.notStarted.length} 件 / 観測不能 ${aggregation.stateUnknown.length} 件`;

  const unitLines = units.map(formatUnitLine);
  const nextCommandLine = `再開入口の次コマンド: ${context.nextCommand}（再開点: ${context.resumeBasis}）`;
  const presenceLines = [
    `停止理由分類: ${context.stopReason}`,
    `次の行動: ${context.nextCommand} で再開（${context.resumeBasis}）`,
    `最新記録参照: ${context.latestRecordRef}`,
    ...(context.timing === undefined ? [] : [`タイミング情報: ${context.timing}`]),
  ];

  return { aggregation, summaryLine, unitLines, nextCommandLine, presenceLines };
}

/** 停止時集約報告を記録コメントとして残せる Markdown 本文へ整形する。 */
export function formatStopReport(report: StopReport): string {
  const lines: string[] = ["### 停止時集約", report.summaryLine];
  if (report.unitLines.length > 0) {
    lines.push(...report.unitLines);
  }
  lines.push("### 次コマンド", report.nextCommandLine);
  lines.push("### 進行状況", ...report.presenceLines);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// 反映計画・部分成功照合・回復計画
// ---------------------------------------------------------------------------

/**
 * 記録契機。識別子は record-comments.ts の RECORD_KINDS
 * （hold / decision_change / completion）と共通語彙。
 * 着手・引き渡し・再開は記録契機から削除済み（着手は進行状況の開始日時、
 * 引き渡しと再開は本文・PR で工程移行を表現する）。
 */
export type RecordOccasion =
  /** 停止。 */
  | "hold"
  /** 判断変更。 */
  | "decision_change"
  /** 検証証拠（検証のみで完了する Issue の証拠）。 */
  | "completion";

/** 反映面（Case Issue 本文 / Case Issue コメント / Epic 本文）。 */
export type ApplyFace = "body" | "comment" | "epic";

/** 反映対象1件（記録契機 × 反映面 × 反映先識別）。 */
export interface ApplyTarget {
  occasion: RecordOccasion;
  face: ApplyFace;
  /** 反映先識別（Issue番号、Epic番号等）。 */
  destination: string;
}

/** 反映対象の正規キー（`<destination>/<face>/<occasion>`）。 */
export function applyTargetKey(target: ApplyTarget): string {
  return `${target.destination}/${target.face}/${target.occasion}`;
}

/**
 * 反映計画の入力。
 *
 * `readback` は読み戻しを実際に実施した対象のみを含める
 * （applied / missing）。読み戻し未実施の対象は含めない。
 */
export interface ApplyPlanRequest {
  /** 今回の記録契機で反映すべき対象一覧。 */
  targets: readonly ApplyTarget[];
  /** 送信試行済みの対象キー一覧（送信呼出を実行したもの）。 */
  sent?: readonly string[];
  /** 読み戻し結果（対象キー → applied / missing）。 */
  readback?: Readonly<Record<string, "applied" | "missing">>;
}

/** 反映計画（部分成功の区別）。 */
export interface ApplyPlan {
  /** 反映済み（読み戻しで存在確認済み）。再送しない（重複投稿防止）。 */
  applied: ApplyTarget[];
  /** 未反映（読み戻しで不足が確認されたもの）。再試行対象。 */
  retry: ApplyTarget[];
  /** 読み戻し未確認（送信試行済みだが読み戻し未実施）。まず読み戻し確認を行い、再試行対象に含めない。 */
  verifyFirst: ApplyTarget[];
  /** 未送信（初回反映対象）。 */
  pending: ApplyTarget[];
}

/**
 * 反映計画を生成する。
 *
 * - 読み戻しで存在確認できた対象は applied、不足確認された対象は retry
 * - 送信試行済みだが読み戻し未確認の対象は verifyFirst
 *   （読み戻し完了前に再試行すると重複投稿を生むため、verifyFirst を
 *   retry に含めないことが重複投稿防止の要である）
 * - 未送信の対象は pending（初回反映対象）
 */
export function planApply(request: ApplyPlanRequest): ApplyPlan {
  const sent = new Set(request.sent ?? []);
  const readback = request.readback ?? {};
  const plan: ApplyPlan = {
    applied: [],
    retry: [],
    verifyFirst: [],
    pending: [],
  };
  for (const target of request.targets) {
    const key = applyTargetKey(target);
    const observed = readback[key];
    if (observed === "applied") plan.applied.push(target);
    else if (observed === "missing") plan.retry.push(target);
    else if (sent.has(key)) plan.verifyFirst.push(target);
    else plan.pending.push(target);
  }
  return plan;
}

/** 反映計画に不足がないか（再試行対象と読み戻し未確認が残存するか）。 */
export function hasOutstandingFaces(plan: ApplyPlan): boolean {
  return plan.retry.length > 0 || plan.verifyFirst.length > 0 || plan.pending.length > 0;
}

/** 成果の確定と記録・終了処理の完了の区分。 */
export type CompletionState =
  /** 記録・終了処理完了（全反映対象が読み戻しで存在確認済み）。 */
  | "records-complete"
  /** 成果確定済み・記録未完了。成果確定を完了扱いにせず、終了処理を未完了として扱う。 */
  | "outcome-finalized-records-incomplete"
  /** 記録未完了（成果未確定を含む）。 */
  | "records-incomplete";

/** 未反映対象の回復項目。 */
export interface RecoveryItem {
  target: ApplyTarget;
  /** 未反映内容の要約（回復用ローカル記録は未反映内容と識別情報に限定する）。 */
  contentSummary: string;
}

/** 未反映の回復計画。 */
export interface RecoveryPlan {
  /** 未反映対象の再試行一覧（識別情報と未反映内容の要約のみを含む。第二の作業定義を構成しない）。 */
  recoveries: RecoveryItem[];
  /** 読み戻しで存在確認済みの対象キー（重複再送を防ぐ）。 */
  alreadyApplied: string[];
  /** 成果の確定と記録・終了処理の完了の区分。 */
  completionState: CompletionState;
}

/**
 * 部分成功の照合と未反映の回復計画を生成する。
 *
 * `planApply` の結果（または同入力）から、再試行対象と読み戻し未確認対象を
 * 未反映回復の対象として特定する。読み戻し未確認対象は回復計画上で
 * 「読み戻し確認→不足時再試行」の順に扱う（未確認のまま再送しない）。
 *
 * `outcomeFinalized` は成果（PR マージ、Issue クローズ等の処理成果）の確定の有無であり、
 * 記録・終了処理の完了とは区別して区分する。
 */
export function buildRecoveryPlan(
  request: ApplyPlanRequest,
  options: {
    outcomeFinalized: boolean;
    /** 未反映内容の要約（対象キー → 要約）。未指定時は固定文言。 */
    contentSummaries?: Readonly<Record<string, string>>;
  },
): RecoveryPlan {
  const plan = planApply(request);
  const recoveries: RecoveryItem[] = [];
  for (const target of plan.retry) {
    const key = applyTargetKey(target);
    recoveries.push({
      target,
      contentSummary: options.contentSummaries?.[key] ?? "読み戻しで不足が確認された未反映記録の再試行",
    });
  }
  for (const target of plan.verifyFirst) {
    const key = applyTargetKey(target);
    recoveries.push({
      target,
      contentSummary: options.contentSummaries?.[key] ?? "読み戻し確認後に不足が確定した場合に再試行（読み戻し未確認のため再送はしない）",
    });
  }

  const recordsComplete = !hasOutstandingFaces(plan);
  const completionState: CompletionState = recordsComplete
    ? "records-complete"
    : options.outcomeFinalized
      ? "outcome-finalized-records-incomplete"
      : "records-incomplete";

  return {
    recoveries,
    alreadyApplied: plan.applied.map(applyTargetKey),
    completionState,
  };
}
