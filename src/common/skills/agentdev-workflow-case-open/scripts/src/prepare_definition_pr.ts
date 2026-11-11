//
// case-open STEP-4 機械工程の script 入口（実変更判定と Definition PR 作成の機械部分）。
//
// 専用 worktree 作成、Definition branch 作成、REQ 行編集、generate_indexes、
// check_integrity、traceability check、明示パス指定 stage・commit までを 1 script
// の呼び出しに束ねる。GitHub I/O（pr_create による PR 作成）は行わない（報告 JSON
// の提案本文をモデルが意味レビューし、agentdev_gh 経由で作成する）。
//
// 入力: `--input` に機械工程入力 JSON ファイル。出力: stdout に報告 JSON
// （実行結果・差分・警告・提案本文の4要素）。終了コード: 成功 0、要判断 2、失敗 1。
// 対象品質ゲート（generate_indexes、check_integrity、traceability check）の省略は
// 入力検証で拒否し、ゲート実行体は起動前に配布先での存在検査を行う（欠落時は
// 正規の代替経路の案内を報告へ含めて fail-closed で停止する）。意味判断（実変更
// 判定の確定、警告の重要度評価）はモデルが担当する。実装は
// inspect_cross_dependencies.ts と同じ作り（工程別個別 script）であり、ゲート実行体
// の解決と可用性検査、引数検査、--validate-input 相当の入力検査実行など反復可能な
// 機械処理に限り agentdev-artifact-validation 所有の共有 lib を supported lib
// interface 経由で利用する。工程固有のゲート選択・順序・実行条件・結果解釈は
// 本入口が所有し続ける。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { consumeDefinitionTraceability, isReqRowId, REQ_ROW_ID_LIST_PATTERN, type DeferredObligation } from "../lib/definition-traceability-gate.ts";
import {
  buildGateEvidence,
  buildKnownGateArgContracts,
  buildKnownTraceabilityCheckSpec as sharedBuildKnownTraceabilityCheckSpec,
  evaluateGateAvailability,
  extractFlagValue,
  fail,
  GATE_ALTERNATIVE_ROUTES,
  MechanicalInputError,
  parseGateCliArgs,
  preValidateGateSpecWithContracts,
  requireGateSpec,
  runGatePreValidation,
  type CommandResult,
  type CommandSpec,
  type GateCommandSpec,
  type KnownArgContract,
  type KnownTraceabilityGateInput,
} from "../lib/gate-execution.ts";

// 正規所有1点（agentdev-artifact-validation scripts/lib/gate-execution.ts）への再エクスポート。
// 入口の公開名と単体テストの import 名を維持する（supported lib interface 経由）。
export {
  buildGateEvidence,
  buildKnownCheckIntegritySpec,
  buildKnownGenerateIndexesSpec,
  buildKnownWorkflowIntegrityGateSpec,
  evaluateGateAvailability,
  extractFlagValue,
  GATE_ALTERNATIVE_ROUTES,
  MechanicalInputError,
  resolveGateExecutablePath,
} from "../lib/gate-execution.ts";
export type {
  CommandResult,
  CommandSpec,
  GateAvailabilityRecord,
  GateCommandSpec,
  GateExecutionEvidence,
  KnownArgContract,
  KnownGateInvocation,
  KnownTraceabilityGateInput,
  KnownWorkflowGateInput,
} from "../lib/gate-execution.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts --input <input.json> [--validate-input]
  --input           機械工程入力 JSON（worktree、branch、Definition 編集内容、品質ゲート実行仕様等）
  --validate-input  検証専用経路。入力 JSON の契約検証・既知 gate 引数契約検査・ゲート実行体の
                    存在確認のみを行い（worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル
                    変更なし）、報告 JSON を stdout へ出力する（合格 0 / 不合格 1）`;

export interface MechanicalRunner {
  run(spec: CommandSpec): CommandResult;
  readTextFile(absolutePath: string): string;
  writeTextFile(absolutePath: string, content: string): void;
  exists(absolutePath: string): boolean;
}

export interface DefinitionEdit {
  /** worktree root 相対の対象ファイルパス。 */
  path: string;
  /** 置換対象の旧文（完全一致・一意であること）。 */
  oldText: string;
  /** 置換後の新文。 */
  newText: string;
}

export interface PrepareDefinitionPrInput {
  repoRoot: string;
  /** Definition 専用 worktree root（repoRoot 相対）。 */
  worktreeRoot: string;
  branch: string;
  baseRef: string;
  rootCaseId: string;
  definitionEdits: readonly DefinitionEdit[];
  requiresIndexRegeneration: boolean;
  /** 明示パス指定 stage の対象（worktree root 相対）。スイープ操作は行わない。 */
  stagePaths: readonly string[];
  commitMessage: string;
  traceabilityReqIds?: readonly string[];
  /**
   * REQ 行ID 書式の producer 固有制約（任意の設定値。正規表現ソース文字列）。
   * 実行前提は workflow 側で Project Extensions（`.agentdev/extensions/`）等の
   * プロジェクト固有値から解決し、明示入力として渡す。script 側の既定は
   * 桁数を固定しない許容書式（traceability checker 契約）であり、producer の
   * 採番桁数の前提を既定値として保持しない。与えられた制約は許容書式の範囲内の
   * 追加照合として適用する。
   */
  reqRowIdPattern?: string;
  generateIndexesGate?: GateCommandSpec;
  checkIntegrityGate?: GateCommandSpec;
  traceabilityGate?: GateCommandSpec;
  /** 変更を適用・commit せず、検証と計画の報告のみを行う（効果測定・冪等確認用）。 */
  dryRun?: boolean;
}

export interface StepRecord {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: Record<string, unknown>;
}

export interface PrepareDefinitionPrReport {
  result: {
    exitCategory: "success" | "needs-judgment" | "failure";
    dryRun: boolean;
    steps: readonly StepRecord[];
  };
  diff: Record<string, unknown>;
  warnings: readonly string[];
  proposal: Record<string, string>;
}

/** 必須品質ゲート（省略禁止）。 */
export const REQUIRED_GATES = [
  "generate_indexes",
  "check_integrity",
  "traceability-check",
] as const;

function parseArgs(argv: readonly string[]): { input: string; validateOnly: boolean } {
  return parseGateCliArgs(argv, USAGE);
}

/**
 * 検証専用経路（--validate-input）の実行。入力検証（validateInput）と既知 gate
 * 引数契約の事前検査（preValidateGateSpec）とゲート実行体の存在確認
 * （evaluateGateAvailability の exists 確認）のみを行い、worktree 作成・
 * ゲート実行・git/gh 操作・管理対象ファイルの変更を行わない（check モードの
 * 非破壊契約）。検証不合格（入力検証・引数契約の失敗を含む）は既存の
 * error: stderr + 終了コード 1 契約で失敗する。検証合格時は報告 JSON
 * （ok: true）を stdout へ出力して終了コード 0 を返す。
 */
export function runValidateInputOnly(
  validated: PrepareDefinitionPrInput,
  exists: (absolutePath: string) => boolean,
): { ok: boolean; report: Record<string, unknown> } {
  const gates = [
    validated.generateIndexesGate,
    validated.checkIntegrityGate,
    validated.traceabilityGate,
  ].filter((gate): gate is GateCommandSpec => gate != null);
  return runGatePreValidation("prepare_definition_pr", gates, KNOWN_GATE_ARG_CONTRACTS, exists);
}

/**
 * 末尾の行末改行 1 個を正規化して論理行配列化する。oldText・newText 末尾の
 * 行末改行の有無に検証結果が依存しないようにするための正規化である。
 */
function toLogicalLines(text: string): readonly string[] {
  const lines = text.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/**
 * DefinitionEdit の行構造事前確認（入力 JSON 組立後・適用前の機械検証）。
 * newText は oldText の行区切りを保全し、行の追加のみを許す。次の2規則を
 * oldText 末尾の行末改行の有無に依存しない方法で検証する:
 * - 行数下限: newText の行数が oldText の行数を下回る編集（行の削除・統合による
 *   行区切りの欠落）を拒否する
 * - 連結検出: newText が oldText（末尾の行末改行 1 個を除いた接頭辞）を保持し
 *   追加内容が空でない場合、追加内容は行頭から始まる（"\n" 直後である）ことを
 *   要求する。追加行が oldText の末尾行に連結された編集（Case #3779 の行区切り
 *   欠落の組立形状）を拒否する
 * 当該確認は適用後の受入検査（artifact_actions の verbatim 包含突合）を代替しない。
 */
function validateEditLineStructure(edit: DefinitionEdit): void {
  const oldLines = toLogicalLines(edit.oldText);
  const newLines = toLogicalLines(edit.newText);
  if (newLines.length < oldLines.length) {
    fail(
      `definition edit fails the line structure pre-check (newText must preserve the line separation of oldText and may only add lines): ${edit.path} (oldText: ${oldLines.length} lines, newText: ${newLines.length} lines)`,
    );
  }
  const oldPrefix = edit.oldText.endsWith("\n") ? edit.oldText.slice(0, -1) : edit.oldText;
  if (oldPrefix.length > 0 && edit.newText.startsWith(oldPrefix) && edit.newText.length > oldPrefix.length) {
    const appended = edit.newText.slice(oldPrefix.length);
    if (!appended.startsWith("\n")) {
      fail(
        `definition edit fails the line structure pre-check (appended content must start on a new line, not concatenated onto the last line of oldText): ${edit.path}`,
      );
    }
  }
}

/** 入力 JSON を検証する。必須品質ゲートの省略、スイープ stage、編集の行構造事前確認不合格を拒否する。 */
export function validateInput(value: unknown): PrepareDefinitionPrInput {
  if (typeof value !== "object" || value === null) fail("input must be a JSON object");
  const v = value as Record<string, unknown>;
  for (const field of ["repoRoot", "worktreeRoot", "branch", "baseRef", "rootCaseId", "commitMessage"] as const) {
    if (typeof v[field] !== "string" || (v[field] as string).length === 0) {
      fail(`input.${field} is required`);
    }
  }
  if (!Array.isArray(v.definitionEdits)) fail("input.definitionEdits must be an array");
  for (const edit of v.definitionEdits as DefinitionEdit[]) {
    if (typeof edit.path !== "string" || typeof edit.oldText !== "string" || typeof edit.newText !== "string") {
      fail("input.definitionEdits entries must contain path, oldText, newText");
    }
    validateEditLineStructure(edit);
  }
  if (!Array.isArray(v.stagePaths) || v.stagePaths.length === 0) {
    fail("input.stagePaths must be a non-empty array (explicit path staging)");
  }
  const missing: string[] = [];
  if (v.generateIndexesGate == null) missing.push("generate_indexes");
  if (v.checkIntegrityGate == null) missing.push("check_integrity");
  if (v.traceabilityGate == null) missing.push("traceability-check");
  if (missing.length > 0) {
    fail(`required quality gates are missing from input (omission forbidden): ${missing.join(", ")}`);
  }
  const traceabilityGate = requireGateSpec(v.traceabilityGate, "traceabilityGate");
  validateTraceabilityReqIds(
    v.traceabilityReqIds,
    traceabilityGate,
    typeof v.reqRowIdPattern === "string" ? v.reqRowIdPattern : undefined,
  );
  return {
    repoRoot: v.repoRoot as string,
    worktreeRoot: v.worktreeRoot as string,
    branch: v.branch as string,
    baseRef: v.baseRef as string,
    rootCaseId: v.rootCaseId as string,
    definitionEdits: v.definitionEdits as readonly DefinitionEdit[],
    requiresIndexRegeneration: v.requiresIndexRegeneration === true,
    stagePaths: v.stagePaths as readonly string[],
    commitMessage: v.commitMessage as string,
    traceabilityReqIds: v.traceabilityReqIds as readonly string[],
    reqRowIdPattern: typeof v.reqRowIdPattern === "string" ? v.reqRowIdPattern : undefined,
    generateIndexesGate: requireGateSpec(v.generateIndexesGate, "generateIndexesGate"),
    checkIntegrityGate: requireGateSpec(v.checkIntegrityGate, "checkIntegrityGate"),
    traceabilityGate,
    dryRun: v.dryRun === true,
  };
}

/**
 * 判定対象 REQ 集合（traceabilityReqIds）の存在・有効性を実行前に検証する（fail-closed）。
 * 書式検証は桁数を固定しない許容書式（traceability checker 契約と同じ REQ-{NNNN}-{MMM}
 * 形式）で行い、producer 固有の追加制約（reqRowIdPattern の設定値）が与えられた場合は
 * 許容書式の範囲内の追加照合として適用する。欠落・空・形式不正・gate 実行範囲
 * （--req 指定）との不整合は、検査や worktree 操作を開始せず MechanicalInputError で
 * 拒否する。空配列への暗黙正規化は行わない。
 */
function validateTraceabilityReqIds(
  value: unknown,
  traceabilityGate: GateCommandSpec,
  reqRowIdPattern?: string,
): void {
  if (!Array.isArray(value)) {
    fail("input.traceabilityReqIds is required when the traceability gate is enabled (implicit normalization to an empty array is not allowed)");
  }
  const reqIds = value as readonly unknown[];
  if (reqIds.length === 0) {
    fail("input.traceabilityReqIds must be a non-empty array");
  }
  const producerPattern = compileProducerReqRowIdPattern(reqRowIdPattern);
  for (const id of reqIds) {
    if (typeof id !== "string" || !isReqRowId(id)) {
      fail(`input.traceabilityReqIds contains an invalid requirement row id: ${String(id)}`);
    }
    if (producerPattern !== null && !producerPattern.test(id)) {
      fail(`input.traceabilityReqIds violates the configured producer requirement row id pattern: ${String(id)}`);
    }
  }
  const gateReqScope = extractFlagValue(traceabilityGate.args, "--req");
  if (gateReqScope !== reqIds.join(",")) {
    fail(`input.traceabilityReqIds does not match the traceability gate execution scope (--req): declared=[${reqIds.join(", ")}], gate=${gateReqScope ?? "(absent)"}`);
  }
}

/** producer 固有の REQ 行ID 制約（設定値）を追加照合として編成する（構文検証のみ。実効範囲は許容書式との共通部分）。 */
function compileProducerReqRowIdPattern(patternSource?: string): RegExp | null {
  if (typeof patternSource !== "string" || patternSource.length === 0) return null;
  try {
    return new RegExp(`^(?:${patternSource})$`);
  } catch (error) {
    fail(`input.reqRowIdPattern is not a valid regular expression: ${String(error)}`);
  }
}

/**
 * 既知 gate 引数契約（正規所有1点の構成から組み立てる。--req の受理パターンのみ
 * definition-traceability-gate の REQ_ROW_ID_LIST_PATTERN を注入する）。
 */
export const KNOWN_GATE_ARG_CONTRACTS: readonly KnownArgContract[] =
  buildKnownGateArgContracts(REQ_ROW_ID_LIST_PATTERN);

/**
 * 既知 gate 入力の事前検証。高価な検査の開始前に必須引数・対象・パス・許容値を
 * 検証し、不正値は検査を開始せず MechanicalInputError で拒否する。形状検査だけでなく
 * 下位引数の値（--req の範囲構文、許容集合外の値等）も拒否する。未知 flag は
 * 検証対象外とし、任意コマンドの汎用解釈器を作らない。
 */
export function preValidateGateSpec(spec: GateCommandSpec): void {
  preValidateGateSpecWithContracts(spec, KNOWN_GATE_ARG_CONTRACTS);
}

/** traceability check の gate spec を既知入力型と下位契約から固定生成する。 */
export function buildKnownTraceabilityCheckSpec(
  input: KnownTraceabilityGateInput,
  producerPattern?: RegExp | null,
): GateCommandSpec {
  return sharedBuildKnownTraceabilityCheckSpec(input, isReqRowId, producerPattern);
}

/** 編集をファイル内容へ適用する（旧文は完全一致・一意。該当なしは失敗）。 */
export function applyDefinitionEdit(content: string, edit: DefinitionEdit): string {
  const first = content.indexOf(edit.oldText);
  if (first === -1) {
    fail(`definition edit target not found: ${edit.path}`);
  }
  const second = content.indexOf(edit.oldText, first + 1);
  if (second !== -1) {
    fail(`definition edit target is not unique: ${edit.path}`);
  }
  return content.slice(0, first) + edit.newText + content.slice(first + edit.oldText.length);
}

/** 報告 JSON を組み立てる（実行結果・差分・警告・提案本文の4要素）。 */
export function assembleReport(
  dryRun: boolean,
  steps: readonly StepRecord[],
  diff: Record<string, unknown>,
  warnings: readonly string[],
  proposal: Record<string, string>,
): PrepareDefinitionPrReport {
  const hasFail = steps.some((step) => step.status === "fail");
  const hasWarn = steps.some((step) => step.status === "warn");
  return {
    result: {
      exitCategory: hasFail ? "failure" : hasWarn ? "needs-judgment" : "success",
      dryRun,
      steps,
    },
    diff,
    warnings,
    proposal,
  };
}

export function decideExitCode(report: PrepareDefinitionPrReport): number {
  if (report.result.exitCategory === "failure") return 1;
  if (report.result.exitCategory === "needs-judgment") return 2;
  return 0;
}

function runSpec(runner: MechanicalRunner, spec: GateCommandSpec): CommandResult {
  return runner.run({ command: spec.command, args: spec.args, cwd: spec.cwd, timeoutMs: spec.timeoutMs });
}

/**
 * 計測日収束補正。check_integrity 報告から
 * req-updated-freshness NG（frontmatter updated が commit author date と不一致の
 * 対象ファイル）と IndexGenerationConsistency（req-metrics 計測日 AUTOGEN の 1 日
 * 遅れ）を検出し、(a) generate_indexes 再実行、(b) frontmatter updated を commit
 * author date へ追随させる編集適用、(c) 明示パス指定の補正 commit、を script 内で
 * 完結させる。trigger 条件が満たされない場合は補正 step を生成しない（既存の
 * 一巡実行の挙動を変えない）。計測日のずれを内容変更として扱わない。
 */
export function runMeasurementDateConvergence(
  runner: MechanicalRunner,
  input: PrepareDefinitionPrInput,
  worktreeCwd: string,
  checkStdout: string,
  head: string,
): { steps: StepRecord[]; warnings: string[] } {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];

  const freshnessTargets = extractFreshnessTargets(checkStdout);
  const hasMeasurementDrift = /IndexGenerationConsistency/.test(checkStdout) &&
    /計測日/.test(checkStdout);
  if (freshnessTargets.length === 0 && !hasMeasurementDrift) {
    return { steps, warnings };
  }

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const commitDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const touchedPaths: string[] = [];
  const alreadyConvergedTargets: string[] = [];
  const unresolvedTargets: { target: string; reason: string }[] = [];
  if (freshnessTargets.length > 0) {
    for (const rel of freshnessTargets) {
      const abs = path.resolve(worktreeCwd, rel);
      if (!runner.exists(abs)) {
        unresolvedTargets.push({ target: rel, reason: "file-missing" });
        continue;
      }
      const content = runner.readTextFile(abs);
      const m = content.match(/^updated: ?"?([0-9]{4}-[0-9]{2}-[0-9]{2})"?/m);
      if (m === null || m[1] === undefined) {
        unresolvedTargets.push({ target: rel, reason: "frontmatter-updated-not-found" });
        continue;
      }
      if (m[1] === commitDate) {
        alreadyConvergedTargets.push(rel);
        continue;
      }
      const replaced = m[0].replace(m[1], commitDate);
      runner.writeTextFile(abs, content.replace(m[0], replaced));
      touchedPaths.push(rel);
    }
    steps.push({
      name: "measurement-convergence",
      status: unresolvedTargets.length > 0 ? "fail" : "pass",
      detail: {
        trigger: "req-updated-freshness",
        frontmatterUpdatedTargets: touchedPaths,
        alreadyConvergedTargets,
        unresolvedTargets,
        commitDate,
      },
    });
    if (unresolvedTargets.length > 0) {
      warnings.push(
        `measurement convergence left NG-reported targets unapplied (fail-closed difference check): ${unresolvedTargets.map((u) => `${u.target} (${u.reason})`).join(", ")}`,
      );
    }
  }
  if (hasMeasurementDrift) {
    steps.push({
      name: "measurement-convergence",
      status: "pass",
      detail: {
        trigger: "req-metrics-measurement-example",
        plannedAction: "regenerate indexes via generateIndexesGate after freshness commit",
        head,
      },
    });
  }

  if (touchedPaths.length > 0) {
    const add = runner.run({ command: "git", args: ["add", "--", ...touchedPaths], cwd: worktreeCwd });
    if (add.exitCode !== 0) {
      steps.push({
        name: "measurement-convergence",
        status: "fail",
        detail: { stage: "stage-failed", stderr: add.stderr.trim().slice(-400) },
      });
      warnings.push("measurement convergence staging failed");
      return { steps, warnings };
    }
    const message = `chore(definition): 計測日収束と frontmatter updated 追随の補正（measurement-convergence step）`;
    const commit = runner.run({ command: "git", args: ["commit", "-m", message], cwd: worktreeCwd });
    if (commit.exitCode !== 0) {
      steps.push({
        name: "measurement-convergence",
        status: "fail",
        detail: { stage: "commit-failed", stderr: commit.stderr.trim().slice(-400) },
      });
      warnings.push("measurement convergence commit failed");
      return { steps, warnings };
    }
    steps.push({
      name: "measurement-convergence",
      status: "pass",
      detail: { stage: "converged", stagedPaths: touchedPaths, commitMessage: message },
    });
  }

  if (hasMeasurementDrift && input.generateIndexesGate != null) {
    const gen = runSpec(runner, input.generateIndexesGate);
    steps.push({
      name: "measurement-convergence",
      status: gen.exitCode === 0 ? "pass" : "fail",
      detail: {
        action: "generate_indexes rerun",
        executedCommand: {
          command: input.generateIndexesGate.command,
          args: input.generateIndexesGate.args,
          cwd: input.generateIndexesGate.cwd,
        },
        exitCode: gen.exitCode,
        stderrTail: gen.exitCode === 0 ? "" : gen.stderr.trim().slice(-400),
      },
    });
    if (gen.exitCode !== 0) {
      warnings.push("measurement convergence generate_indexes rerun failed");
    }
  }

  return { steps, warnings };
}

/**
 * check_integrity 報告から req-updated-freshness NG の対象ファイル（repo root 相対）を
 * 抽出する。報告行「- **[NG]** req-updated-freshness: ... for <target>: ... (<repo-relative-path>) → route:」
 * の対象パス括弧を機械解釈し、REQ ファイル名のみ報告（「for REQ-NNN.md:」形式）とプレフィックス
 * 付き報告の双方を括弧内の repo root 相対パスとして一律捕捉する。req-updated-freshness 以外の
 * 報告行と clean な対象は補正対象に含めない（過剰適用にならない）。
 */
export function extractFreshnessTargets(checkStdout: string): readonly string[] {
  const targets: string[] = [];
  const lineRe = /- \*\*\[NG\]\*\* req-updated-freshness: .*\(((?:docs|src|scripts)[^\s:)]*\.md)\) → route:/;
  for (const line of checkStdout.split("\n")) {
    const m = lineRe.exec(line);
    if (m !== null && m[1] !== undefined && !targets.includes(m[1])) {
      targets.push(m[1]);
    }
  }
  return targets;
}

/** 機械工程を実行し、報告 JSON を返す（省略なし。失敗時は途中結果とともに fail を返す）。 */
export function runPrepareDefinitionPr(
  input: PrepareDefinitionPrInput,
  runner: MechanicalRunner,
): PrepareDefinitionPrReport {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];
  const diff: Record<string, unknown> = {};
  const proposal: Record<string, string> = {};
  let deferredTraceabilityObligations: readonly DeferredObligation[] = [];
  const repoRoot = path.resolve(input.repoRoot);
  const worktreeAbs = path.resolve(repoRoot, input.worktreeRoot);
  const worktreeCwd = worktreeAbs;

  for (const spec of [input.generateIndexesGate, input.checkIntegrityGate, input.traceabilityGate]) {
    if (spec != null) preValidateGateSpec(spec);
  }

  const availability = evaluateGateAvailability(
    [input.generateIndexesGate, input.checkIntegrityGate, input.traceabilityGate].filter(
      (spec): spec is GateCommandSpec => spec != null,
    ),
    (absolutePath) => runner.exists(absolutePath),
  );
  steps.push({
    name: "gate-availability",
    status: availability.missing.length > 0 ? "fail" : "pass",
    detail: { gates: availability.records },
  });
  if (availability.missing.length > 0) {
    warnings.push(
      `required gate executable is missing in the deployment environment (omission and success are not allowed): ${availability.missing.join(", ")}. alternative routes: ${GATE_ALTERNATIVE_ROUTES.join(" / ")}`,
    );
    return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
  }

  const worktreeList = runner.run({ command: "git", args: ["worktree", "list", "--porcelain"], cwd: repoRoot });
  const normalize = (p: string): string => path.resolve(p).replace(/\\/g, "/").toLowerCase();
  const worktreeExists = worktreeList.stdout
    .split("\n")
    .some((line) => line.startsWith("worktree ") && normalize(line.slice("worktree ".length)) === normalize(worktreeAbs));
  if (!worktreeExists) {
    const created = runner.run({
      command: "git",
      args: ["worktree", "add", worktreeAbs, "-b", input.branch, input.baseRef],
      cwd: repoRoot,
    });
    steps.push({
      name: "worktree-create",
      status: created.exitCode === 0 ? "pass" : "fail",
      detail: { worktreeRoot: input.worktreeRoot, branch: input.branch, baseRef: input.baseRef, exitCode: created.exitCode },
    });
    if (created.exitCode !== 0) {
      warnings.push(`worktree creation failed: ${created.stderr.trim()}`);
      return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
    }
  } else {
    const branchAt = runner.run({ command: "git", args: ["branch", "--show-current"], cwd: worktreeCwd });
    const reuseOk = branchAt.stdout.trim() === input.branch;
    steps.push({
      name: "worktree-create",
      status: reuseOk ? "pass" : "fail",
      detail: { reused: true, currentBranch: branchAt.stdout.trim(), expectedBranch: input.branch },
    });
    if (!reuseOk) {
      warnings.push("existing worktree is not on the expected Definition branch (冪等再利用不能)");
      return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
    }
  }

  let editFail = false;
  const editedPaths: string[] = [];
  const preCommitRevision = runner
    .run({ command: "git", args: ["rev-parse", "HEAD"], cwd: worktreeCwd })
    .stdout.trim();
  for (const edit of input.definitionEdits) {
    const abs = path.resolve(worktreeCwd, edit.path);
    let content: string;
    try {
      content = runner.readTextFile(abs);
    } catch (error) {
      steps.push({
        name: "definition-edit",
        status: "fail",
        detail: { path: edit.path, error: String(error) },
      });
      editFail = true;
      continue;
    }
    try {
      const updated = applyDefinitionEdit(content, edit);
      if (input.dryRun !== true) {
        runner.writeTextFile(abs, updated);
      }
      editedPaths.push(edit.path);
    } catch (error) {
      steps.push({
        name: "definition-edit",
        status: "fail",
        detail: { path: edit.path, error: error instanceof Error ? error.message : String(error) },
      });
      editFail = true;
    }
  }
  if (!editFail) {
    steps.push({
      name: "definition-edit",
      status: "pass",
      detail: { editedPaths, dryRun: input.dryRun === true },
    });
  }
  if (editFail) {
    warnings.push("definition edit failed on at least one target file");
    return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
  }

  if (input.generateIndexesGate) {
    const gen = runSpec(runner, input.generateIndexesGate);
    steps.push({
      name: "generate_indexes",
      status: gen.exitCode === 0 ? "pass" : "fail",
      detail: {
        executed: input.requiresIndexRegeneration,
        stderrTail: gen.exitCode === 0 ? "" : gen.stderr.trim().slice(-400),
        ...buildGateEvidence(input.generateIndexesGate, gen, preCommitRevision),
      },
    });
    if (gen.exitCode !== 0) {
      warnings.push("generate_indexes failed");
      return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
    }
  }

  // check_integrity は stage-and-commit の後に実行する。frontmatter updated と git log author date の
  // 突合型検査は未 commit 変更が含まれる working tree では構造的に不一致となるため、
  // check_integrity と traceability-check は commit 済み HEAD に対して実行する。
  // dry-run では commit が行われないため両ゲートを skip して警告に記録する。
  const changed = runner.run({ command: "git", args: ["status", "--porcelain"], cwd: worktreeCwd });
  const changedFiles = changed.stdout
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter((line) => line.length > 0);
  diff.changedFiles = changedFiles;

  if (input.dryRun === true) {
    steps.push({
      name: "stage-and-commit",
      status: "pass",
      detail: { dryRun: true, plannedStagePaths: input.stagePaths, commitMessage: input.commitMessage },
    });
    warnings.push("dry-run: stage and commit were not executed");
    warnings.push("dry-run: check_integrity and traceability-check run after commit; skipped in dry-run");
  } else {
    const add = runner.run({ command: "git", args: ["add", "--", ...input.stagePaths], cwd: worktreeCwd });
    if (add.exitCode !== 0) {
      steps.push({ name: "stage-and-commit", status: "fail", detail: { stage: "failed", stderr: add.stderr.trim() } });
      warnings.push("explicit path staging failed");
      return assembleReport(false, steps, diff, warnings, proposal);
    }
    const commit = runner.run({ command: "git", args: ["commit", "-m", input.commitMessage], cwd: worktreeCwd });
    let head = "";
    if (commit.exitCode === 0) {
      const headResult = runner.run({ command: "git", args: ["rev-parse", "HEAD"], cwd: worktreeCwd });
      head = headResult.stdout.trim();
    }
    steps.push({
      name: "stage-and-commit",
      status: commit.exitCode === 0 ? "pass" : "fail",
      detail: {
        stagedPaths: input.stagePaths,
        head,
        stderrTail: commit.exitCode === 0 ? "" : commit.stderr.trim().slice(-400),
        stderr: commit.exitCode === 0 ? "" : commit.stderr.trim(),
      },
    });
    if (commit.exitCode !== 0) {
      warnings.push("commit failed");
      return assembleReport(false, steps, diff, warnings, proposal);
    }
    diff.head = head;

    if (input.checkIntegrityGate) {
      const check = runSpec(runner, input.checkIntegrityGate);
      steps.push({
        name: "check_integrity",
        status: check.exitCode === 0 ? "pass" : "fail",
        detail: {
          stderrTail: check.exitCode === 0 ? "" : check.stderr.trim().slice(-400),
          ...buildGateEvidence(input.checkIntegrityGate, check, head),
        },
      });

      // 計測日収束補正。check_integrity 報告の計測日不整合
      // （req-metrics-measurement-example の IndexGenerationConsistency）と
      // req-updated-freshness NG を trigger 条件として検出し、
      // (a) generate_indexes 再実行（req-metrics 計測日 AUTOGEN 更新）と
      // (b) frontmatter updated の commit author date 追随を明示パス指定の
      // 補正 commit で script 内完結させる。既存 contingency 手順の機械化であり、
      // 計測日のずれを内容変更として扱わない。
      const convergence = runMeasurementDateConvergence(runner, input, worktreeCwd, check.stdout, head);
      if (convergence.steps.length > 0) {
        steps.push(...convergence.steps);
        warnings.push(...convergence.warnings);
      }

      if (check.exitCode !== 0) {
        warnings.push("check_integrity failed");
        return assembleReport(false, steps, diff, warnings, proposal);
      }
    }

    if (input.traceabilityGate) {
      const check = runSpec(runner, input.traceabilityGate);
      const consumption = consumeDefinitionTraceability({
        exitCode: check.exitCode,
        stdout: check.stdout,
        targetReqIds: input.traceabilityReqIds ?? [],
      });
      const deferred = consumption.deferredObligations;
      const status = consumption.status;
      deferredTraceabilityObligations = deferred;
      steps.push({
        name: "traceability-check",
        status,
        detail: {
          summary: consumption.summary,
          reqIds: input.traceabilityReqIds ?? [],
          deferredObligations: deferred,
          ...buildGateEvidence(input.traceabilityGate, check, head),
        },
      });
      if (consumption.blocking) {
        warnings.push(`traceability stage gate failed: ${consumption.reason ?? consumption.summary}`);
        return assembleReport(false, steps, diff, warnings, proposal);
      }
      if (deferred.length > 0) {
        warnings.push("missing-implementation and missing-verification remain raw checker failures and are deferred to case-run and case-close");
      }
    }
  }

  proposal.pr_title = `docs(definition): Definition 変更 (${input.rootCaseId})`;
  proposal.pr_body = [
    "## 目的",
    "",
    `${input.rootCaseId} の Definition 変更を canonical Definition へ反映する。`,
    "",
    "## 変更内容",
    "",
    ...editedPaths.map((p) => `- ${p}`),
    "",
    "## 検証",
    "",
    "- generate_indexes / check_integrity: 本 script 実行内で成功",
    deferredTraceabilityObligations.length === 0
      ? "- traceability stage gate: 対象 REQ の Design 対応と構造・policy 検査に合格"
      : `- traceability stage gate: Design 対応と構造・policy 検査に合格。checker の missing-implementation / missing-verification は raw fail のまま case-run / case-close へ deferred: ${deferredTraceabilityObligations.map((obligation) => `${obligation.check} (${obligation.reqIds.join(", ")})`).join("; ")}`,
  ].join("\n");

  return assembleReport(input.dryRun === true, steps, diff, warnings, proposal);
}

function main(): void {
  try {
    const { input, validateOnly } = parseArgs(process.argv.slice(2));
    let raw: string;
    try {
      raw = fs.readFileSync(input, "utf-8");
    } catch (error) {
      fail(`cannot read input file: ${input} (${String(error)})`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      fail(`input is not valid JSON: ${String(error)}`);
    }
    const validated = validateInput(parsed);
    if (validateOnly) {
      const outcome = runValidateInputOnly(validated, (absolutePath) => fs.existsSync(absolutePath));
      process.stdout.write(`${JSON.stringify(outcome.report, null, 2)}\n`);
      process.exit(outcome.ok ? 0 : 1);
    }
    const normalized: PrepareDefinitionPrInput = {
      ...validated,
      repoRoot: path.resolve(validated.repoRoot),
    };
    const runner: MechanicalRunner = {
      run(spec) {
        const result = spawnSync(spec.command, [...spec.args], {
          cwd: spec.cwd,
          encoding: "utf-8",
          timeout: spec.timeoutMs,
          maxBuffer: 64 * 1024 * 1024,
        });
        return {
          exitCode: result.status ?? 1,
          stdout: result.stdout ?? "",
          stderr: result.stderr ?? "",
        };
      },
      readTextFile(absolutePath) {
        return fs.readFileSync(absolutePath, "utf-8");
      },
      writeTextFile(absolutePath, content) {
        fs.writeFileSync(absolutePath, content, "utf-8");
      },
      exists(absolutePath) {
        return fs.existsSync(absolutePath);
      },
    };
    const report = runPrepareDefinitionPr(normalized, runner);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(decideExitCode(report));
  } catch (error) {
    if (error instanceof MechanicalInputError) {
      process.stderr.write(`error: ${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}

const isDirectExecution = process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.path);
if (isDirectExecution) {
  main();
}
