// agentdev-textlint-guard 工程接続: 用途別入口と機械確認可能な結果。
//
// 検査の用途（書込み前検査、通常最終検査、必須独立検査、結果表示）は正規契約から
// 決定的に選択され、LLM が毎回の検査範囲・目的・再利用可否を選択しない
// （case-run Design「case-run が使用する検査ツール」節、case-close Design
// 「保存済み検証証跡の解析と再実行条件の適用」節）。同じ判定を各呼出元で
// 再実装させないため、用途決定（resolveInspectionPurpose）、入口起動（runInspection）、
// 結果の完全消費と進行判定（acceptForProgress）を本モジュールに一元化する。
//
// 結果は機械確認可能な形式（用途、対象範囲、対象状態、完了状態、合否、実規則実行数と
// 再利用数）で返し、表示用結果と工程受理用結果を混同しない（display は検査を起動せず、
// startedInspection: false を必ず含む）。
//
// 用途決定の正規契約対応:
// - pre-write-hook は plugin hook 内部で固定（書込み前検査）
// - case-run / docs-check / case-close の最終検査は通常最終検査（final。case-close Design
//   は「その内部で同一性が機械検証できた対象の規則実行省略が許容される」を明示）
// - QG-4 独立再検査等、正規契約上の独立要求が存在する実行は必須独立検査
//   （independent。requiresIndependentInspection で要求する）
// - 表示・解析のみは display（検査を起動したものとして扱わない）
//
// 開始・終了時照合: 検査の開始時・終了時に対象集合、本文、検査条件を
// 照合し、変化が生じた場合は未完了・未確定として工程の受理を拒否する。

import * as fs from "node:fs";
import * as path from "node:path";
import type { GuardConfig } from "./config.ts";
import { enumerateTargetFiles } from "./targets.ts";
import { computeFileIdentityKey } from "./identity.ts";
import { prepareInspectionContext, type InspectEnvironment, type PreparedInspectionContext } from "./inspect.ts";
import { canonicalJson, sha256Hex } from "./hash.ts";
import { formatOutcome } from "./results.ts";
import type { FileInspectionResult, InspectionOutcome } from "./results.ts";
import { loadStoredFileResult, storeFileResult } from "./result-store.ts";
import { lintTargetsInParallel } from "./workers/pool.ts";

export type InspectionPurpose = "pre-write" | "final" | "independent" | "display";

export interface EngineeringContext {
  readonly workflow: "case-run" | "case-close" | "docs-check" | "manual-display" | "pre-write-hook";
  /** 正規契約上の独立要求（QG-4 独立再検査等）が存在する実行で true。 */
  readonly requiresIndependentInspection?: boolean;
}

/** 用途の決定的選択（正規契約 → 用途。LLM は選択しない）。 */
export function resolveInspectionPurpose(context: EngineeringContext): InspectionPurpose {
  if (context.workflow === "pre-write-hook") return "pre-write";
  if (context.workflow === "manual-display") return "display";
  if (context.requiresIndependentInspection === true) return "independent";
  return "final";
}

/** 機械確認可能な検査実行結果。 */
export interface InspectionRunResult {
  readonly schemaVersion: 1;
  readonly purpose: InspectionPurpose;
  /** 検査を実際に起動したか。display は常に false（検査起動として扱わない）。 */
  readonly startedInspection: boolean;
  readonly targetScope: {
    readonly count: number;
    readonly targets: readonly string[];
  };
  readonly targetState: {
    readonly conditionsTracked: boolean;
    readonly startSnapshot: string;
    readonly endSnapshot: string;
    readonly snapshotsMatched: boolean;
  };
  readonly completion: "completed" | "incomplete";
  readonly ok: boolean;
  readonly hardCount: number;
  readonly ruleExecutions: {
    readonly actual: number;
    readonly reused: number;
  };
  readonly files: readonly FileInspectionResult[];
  readonly detail?: string;
}

export interface RunInspectionOptions {
  readonly env?: InspectEnvironment;
  /** ワーカー並列実行の上書き（maxWorkers 0 で逐次）。 */
  readonly maxWorkers?: number;
}

type TargetRead =
  | {
      readonly ok: true;
      readonly targets: readonly string[];
      readonly texts: ReadonlyMap<string, string>;
      readonly snapshot: string;
    }
  | { readonly ok: false; readonly detail: string };

interface SnapshotInputs {
  readonly config: GuardConfig;
  readonly conditionsHash: string;
}

/** 対象全件の列挙と実ファイル全文取得を行い、対象集合・本文・検査条件のスナップショットを計算する。 */
function readTargets(root: string, inputs: SnapshotInputs): TargetRead {
  const targets = enumerateTargetFiles(root, inputs.config);
  const texts = new Map<string, string>();
  const rows: string[] = [];
  for (const rel of targets) {
    const abs = path.join(root, ...rel.split("/"));
    let text: string;
    try {
      text = fs.readFileSync(abs, "utf8");
    } catch (e) {
      return {
        ok: false,
        detail: `agentdev-textlint-guard: cannot read target file ${rel} (${e instanceof Error ? e.message : String(e)}); final gate fails per fail-closed`,
      };
    }
    texts.set(rel, text);
    rows.push(`${rel}\t${sha256Hex(text)}`);
  }
  const snapshot = sha256Hex([canonicalJson(targets), rows.join("\n"), inputs.conditionsHash].join("\n"));
  return { ok: true, targets, texts, snapshot };
}

/** 直近の工程受理用 run 結果の保存先（実行時データ。配布・投影の対象外）。 */
export const LAST_RUN_RELATIVE_DIRECTORY = ".agentdev/cache/agentdev-textlint-guard/last-run/v1";

function lastRunPathFor(root: string, purpose: InspectionPurpose): string {
  return path.join(root, ...LAST_RUN_RELATIVE_DIRECTORY.split("/"), `${purpose}.json`);
}

function saveLastRun(root: string, result: InspectionRunResult): void {
  try {
    const dir = path.dirname(lastRunPathFor(root, result.purpose));
    fs.mkdirSync(dir, { recursive: true });
    const tempPath = `${lastRunPathFor(root, result.purpose)}.tmp-${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(result, null, 2), "utf8");
    fs.renameSync(tempPath, lastRunPathFor(root, result.purpose));
  } catch {
    // 直近 run の保存失敗は検査結果の信頼性に影響しない（display の availability が下がるだけ）
  }
}

function loadLastRun(root: string, purposes: readonly InspectionPurpose[]): InspectionRunResult | null {
  for (const purpose of purposes) {
    try {
      const parsed = JSON.parse(fs.readFileSync(lastRunPathFor(root, purpose), "utf8")) as InspectionRunResult | null;
      if (parsed !== null && typeof parsed === "object" && parsed.schemaVersion === 1 && parsed.startedInspection === true) {
        return parsed;
      }
    } catch {
      // 欠落・破損は次の purpose へ
    }
  }
  return null;
}

/**
 * 通常最終検査（final）または必須独立検査（independent）の入口。
 * 対象全件の列挙と全文取得を毎回行い、final では同一性が機械検証できた対象だけ
 * 規則実行を省略して保存済み結果を再利用し、independent では保存結果を利用せず
 * 対象全件の規則を実行する。検査中に変化が生じた場合は未完了として受理を拒否する。
 */
export async function runInspection(
  root: string,
  purpose: "final" | "independent",
  options: RunInspectionOptions = {},
): Promise<InspectionRunResult> {
  const base = (partial: Partial<InspectionRunResult>): InspectionRunResult => ({
    schemaVersion: 1,
    purpose,
    startedInspection: true,
    targetScope: { count: 0, targets: [] },
    targetState: {
      conditionsTracked: false,
      startSnapshot: "",
      endSnapshot: "",
      snapshotsMatched: false,
    },
    completion: "incomplete",
    ok: false,
    hardCount: 0,
    ruleExecutions: { actual: 0, reused: 0 },
    files: [],
    ...partial,
  });

  const preparedResult = await prepareInspectionContext(root, options.env);
  if (!preparedResult.ok) {
    const result = base({ detail: preparedResult.detail });
    saveLastRun(root, result);
    return result;
  }
  const context = preparedResult.context;

  const startInputs: SnapshotInputs = {
    config: context.prepared.config,
    conditionsHash: context.conditions.trackable ? context.conditions.conditionsHash : "untracked",
  };
  const startRead = readTargets(root, startInputs);
  if (!startRead.ok) {
    const result = base({ detail: startRead.detail });
    saveLastRun(root, result);
    return result;
  }
  if (startRead.targets.length === 0) {
    const result = base({
      targetState: {
        conditionsTracked: context.conditions.trackable,
        startSnapshot: startRead.snapshot,
        endSnapshot: startRead.snapshot,
        snapshotsMatched: true,
      },
      detail:
        "0 target file(s) inspected; the target resolution must not resolve to zero targets (fail-closed)",
    });
    saveLastRun(root, result);
    return result;
  }

  const conditionsTracked = context.conditions.trackable;
  const conditionsHash = context.conditions.trackable ? context.conditions.conditionsHash : "";
  const reuse = purpose === "final" && conditionsTracked;
  const reusable = new Map<string, FileInspectionResult>();
  const toInspect: { readonly rel: string; readonly text: string }[] = [];
  for (const rel of startRead.targets) {
    const text = startRead.texts.get(rel);
    if (text === undefined) continue;
    if (reuse) {
      const key = computeFileIdentityKey(context.root, rel, text, conditionsHash);
      const stored = loadStoredFileResult(context.root, key, rel);
      if (stored !== null) {
        reusable.set(rel, stored);
        continue;
      }
    }
    toInspect.push({ rel, text });
  }

  const inspected = await lintTargetsInParallel(
    context,
    toInspect,
    options.maxWorkers !== undefined ? { maxWorkers: options.maxWorkers } : {},
  );
  const files: FileInspectionResult[] = [];
  let failureDetail: string | null = null;
  for (const rel of startRead.targets) {
    const reusedResult = reusable.get(rel);
    if (reusedResult !== undefined) {
      files.push(reusedResult);
      continue;
    }
    const outcome = inspected.get(rel);
    if (outcome === undefined) {
      // ワーカー異常・タイムアウト・保存結果欠落を含め、未検査対象を欠落させない（fail-closed）
      files.push({ path: rel, findings: [], hardCount: 0 });
      failureDetail =
        failureDetail ??
        `agentdev-textlint-guard: inspection did not complete for ${rel}; blocked per fail-closed`;
      continue;
    }
    if (!outcome.ok) {
      failureDetail = failureDetail ?? outcome.detail;
      files.push({ path: rel, findings: [], hardCount: 0 });
      continue;
    }
    if (reuse) {
      // 実検査に成功した結果を保存する（正常完了した合格・不合格のみ。保存失敗は許容）
      storeInspectedResult(context, rel, startRead.texts.get(rel) ?? "", outcome.result);
    }
    files.push(outcome.result);
  }

  // 終了時照合: 対象集合、本文、検査条件を現在入力で再計算する
  const endRead = readTargets(root, context.recomputeSnapshotInputs());
  const snapshotsMatched = endRead.ok && endRead.snapshot === startRead.snapshot;
  const hardCount = files.reduce((acc, f) => acc + f.hardCount, 0);
  const actualCount = toInspect.length;
  const reusedCount = reusable.size;
  const incompleteDetail =
    failureDetail ??
    (endRead.ok
      ? undefined
      : endRead.detail) ??
    (!snapshotsMatched
      ? "agentdev-textlint-guard: targets, contents, or inspection conditions changed during the run; the run is incomplete and must not be accepted"
      : undefined);

  const result = base({
    targetScope: { count: startRead.targets.length, targets: [...startRead.targets] },
    targetState: {
      conditionsTracked: context.conditions.trackable,
      startSnapshot: startRead.snapshot,
      endSnapshot: endRead.ok ? endRead.snapshot : "",
      snapshotsMatched,
    },
    completion: failureDetail === null && snapshotsMatched && endRead.ok ? "completed" : "incomplete",
    ok: failureDetail === null && snapshotsMatched && endRead.ok && hardCount === 0,
    hardCount,
    ruleExecutions: { actual: actualCount, reused: reusedCount },
    files,
    ...(incompleteDetail !== undefined ? { detail: incompleteDetail } : {}),
  });
  saveLastRun(root, result);
  return result;
}

function storeInspectedResult(
  context: PreparedInspectionContext,
  rel: string,
  text: string,
  result: FileInspectionResult,
): void {
  if (!context.conditions.trackable) return;
  const key = computeFileIdentityKey(context.root, rel, text, context.conditions.conditionsHash);
  storeFileResult(context.root, key, rel, result);
}

/**
 * 結果表示の入口。検査を起動せず、直近の工程受理用 run 結果（final / independent）を
 * 読み戻して表示する。再表示・再解析のみで検査を起動したものとして扱わない
 * （startedInspection: false で機械的に区別する）。
 */
export async function runDisplay(root: string): Promise<InspectionRunResult> {
  const stored = loadLastRun(root, ["final", "independent"]);
  if (stored === null) {
    return {
      schemaVersion: 1,
      purpose: "display",
      startedInspection: false,
      targetScope: { count: 0, targets: [] },
      targetState: { conditionsTracked: false, startSnapshot: "", endSnapshot: "", snapshotsMatched: false },
      completion: "incomplete",
      ok: false,
      hardCount: 0,
      ruleExecutions: { actual: 0, reused: 0 },
      files: [],
      detail: "no completed inspection run is available for display; start a final or independent inspection first",
    };
  }
  return {
    schemaVersion: 1,
    purpose: "display",
    startedInspection: false,
    targetScope: stored.targetScope,
    targetState: stored.targetState,
    completion: stored.completion,
    ok: stored.ok,
    hardCount: stored.hardCount,
    ruleExecutions: stored.ruleExecutions,
    files: stored.files,
    detail: `display of the last ${stored.purpose} run (source saved at ${LAST_RUN_RELATIVE_DIRECTORY}/${stored.purpose}.json)`,
  };
}

export interface ProgressDecision {
  readonly accepted: boolean;
  readonly reason: string | null;
}

/**
 * 完結した結果の受理と進行判定（case-run / case-close 等の呼出元は本関数だけを使う）。
 * 不合格・未完了・対象欠落・不完全出力・不適切な用途（display）の結果で進行しない。
 */
export function acceptForProgress(result: InspectionRunResult): ProgressDecision {
  if (result.purpose === "display" || !result.startedInspection) {
    return {
      accepted: false,
      reason: "a display result does not start an inspection and must not drive progress ",
    };
  }
  if (result.completion !== "completed") {
    return { accepted: false, reason: `run did not complete: ${result.detail ?? "incomplete"}` };
  }
  if (!result.targetState.snapshotsMatched) {
    return {
      accepted: false,
      reason: "targets, contents, or inspection conditions changed during the run (start/end snapshot mismatch)",
    };
  }
  if (result.purpose === "independent" && result.ruleExecutions.reused > 0) {
    return {
      accepted: false,
      reason: "an independent inspection must not reuse stored file results ",
    };
  }
  if (result.targetScope.count === 0) {
    return { accepted: false, reason: "0 target file(s) inspected; the run is invalid (fail-closed)" };
  }
  if (result.files.length !== result.targetScope.count) {
    return { accepted: false, reason: "inspected result is missing some targets (fail-closed)" };
  }
  if (!result.ok) {
    return {
      accepted: false,
      reason: `hard violations remain (${result.hardCount}); see the findings section (an unrunnable inspection must not pass)`,
    };
  }
  return { accepted: true, reason: null };
}

/** テキスト整形（CLI 人間向け出力）。機械確認は InspectionRunResult（JSON）を使う。 */
export function formatRunResult(result: InspectionRunResult): string {
  const outcome: InspectionOutcome = { files: result.files, hardCount: result.hardCount };
  const body = formatOutcome(outcome);
  const summary =
    `run: purpose=${result.purpose} started=${result.startedInspection} completion=${result.completion} ` +
    `ok=${result.ok} targets=${result.targetScope.count} executed=${result.ruleExecutions.actual} reused=${result.ruleExecutions.reused}`;
  return body.length > 0 ? `${body}\n${summary}` : summary;
}
