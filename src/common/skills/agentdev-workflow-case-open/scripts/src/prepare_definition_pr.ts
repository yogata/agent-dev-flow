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
// 入力検証で拒否する。意味判断（実変更判定の確定、警告の重要度評価）はモデルが
// 担当する。実装は inspect_cross_dependencies.ts と同じ作り（工程別個別 script、
// 共通基盤なし）。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { consumeDefinitionTraceability, type DeferredObligation } from "../lib/definition-traceability-gate.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts --input <input.json>
  --input  機械工程入力 JSON（worktree、branch、Definition 編集内容、品質ゲート実行仕様等）`;

export interface CommandSpec {
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * 1回の検査実行から保存する実行証跡。標準出力・標準エラーは全文を保持し、
 * 末尾抜粋や集計要約で原結果を代替しない。実行条件は実行コマンド・引数・
 * 作業ディレクトリ・指定された実行上限と対応付けて記録する。
 */
export interface GateExecutionEvidence {
  executedCommand: {
    command: string;
    args: readonly string[];
    cwd: string;
    timeoutMs?: number;
  };
  exitCode: number;
  stdout: string;
  stderr: string;
  /** 検査対象の版（実行時点の HEAD。取得できない場合は空文字）。 */
  targetRevision: string;
  /** 既知パス引数（--root、--input、--artifact、--files）から解決できた検査対象パス。 */
  targetPaths: readonly string[];
}

/** script が外部処理を呼び出す経路。単体テストでは偽 runner を注入する。 */
export interface MechanicalRunner {
  run(spec: CommandSpec): CommandResult;
  readTextFile(absolutePath: string): string;
  writeTextFile(absolutePath: string, content: string): void;
  exists(absolutePath: string): boolean;
}

export interface GateCommandSpec {
  name: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
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

export class MechanicalInputError extends Error {}

function fail(message: string): never {
  throw new MechanicalInputError(message);
}

function parseArgs(argv: readonly string[]): { input: string } {
  let input: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${USAGE}`);
    }
  }
  if (input === null) fail(`--input is required\n${USAGE}`);
  return { input };
}

function requireGateSpec(value: unknown, field: string): GateCommandSpec {
  if (typeof value !== "object" || value === null) {
    fail(`input.${field} is required (quality gate omission is not allowed)`);
  }
  const v = value as Record<string, unknown>;
  if (typeof v.command !== "string" || !Array.isArray(v.args) || typeof v.cwd !== "string") {
    fail(`input.${field} must contain command (string), args (string[]), cwd (string)`);
  }
  return {
    name: typeof v.name === "string" ? v.name : field,
    command: v.command,
    args: v.args as readonly string[],
    cwd: v.cwd,
    timeoutMs: typeof v.timeoutMs === "number" ? v.timeoutMs : undefined,
  };
}

/** 入力 JSON を検証する。必須品質ゲートの欠落（省略）とスイープ stage を拒否する。 */
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
    traceabilityReqIds: Array.isArray(v.traceabilityReqIds) ? (v.traceabilityReqIds as readonly string[]) : [],
    generateIndexesGate: requireGateSpec(v.generateIndexesGate, "generateIndexesGate"),
    checkIntegrityGate: requireGateSpec(v.checkIntegrityGate, "checkIntegrityGate"),
    traceabilityGate: requireGateSpec(v.traceabilityGate, "traceabilityGate"),
    dryRun: v.dryRun === true,
  };
}

/**
 * 既知 flag の値契約（配布下位検査の契約由来）。未知 flag は検証対象外とする。
 */
export interface KnownArgContract {
  flag: string;
  values?: readonly string[];
  pattern?: RegExp;
  nonEmpty?: boolean;
}

export const KNOWN_GATE_ARG_CONTRACTS: readonly KnownArgContract[] = [
  { flag: "--req", pattern: /^(REQ-\d{3}-\d{3})(,REQ-\d{3}-\d{3})*$/ },
  { flag: "--profile", values: ["source", "link"] },
  { flag: "--fail-level", values: ["strict", "warning"] },
  { flag: "--workflow", pattern: /^[a-z][a-z0-9-]*$/ },
  { flag: "--root", nonEmpty: true },
  { flag: "--input", nonEmpty: true },
  { flag: "--artifact", nonEmpty: true },
  { flag: "--evidence", nonEmpty: true },
  { flag: "--revision", nonEmpty: true },
  { flag: "--files", nonEmpty: true },
  { flag: "--base-ref", nonEmpty: true },
];

/** 検査対象パスとして解決対象とする既知パス引数。 */
const PATH_FLAG_CONTRACTS = ["--root", "--input", "--artifact", "--files"] as const;

/** 報告 JSON に記録する意味のある flag の値を抽出する（--flag value / --flag=value の両形式）。 */
export function extractFlagValue(args: readonly string[], flag: string): string | null {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (arg === flag && args[i + 1] !== undefined) {
      return args[i + 1] ?? null;
    }
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }
  return null;
}

/**
 * 既知 gate 入力の事前検証。高価な検査の開始前に必須引数・対象・パス・許容値を
 * 検証し、不正値は検査を開始せず MechanicalInputError で拒否する。形状検査だけでなく
 * 下位引数の値（--req の範囲構文、許容集合外の値等）も拒否する。未知 flag は
 * 検証対象外とし、任意コマンドの汎用解釈器を作らない。
 */
export function preValidateGateSpec(spec: GateCommandSpec): void {
  for (const contract of KNOWN_GATE_ARG_CONTRACTS) {
    const value = extractFlagValue(spec.args, contract.flag);
    if (value === null) continue;
    if (contract.nonEmpty === true && value.trim().length === 0) {
      fail(`${contract.flag} requires a non-empty value`);
    }
    if (contract.values && !contract.values.includes(value)) {
      fail(`${contract.flag} must be one of: ${contract.values.join(", ")} (got: ${value})`);
    }
    if (contract.pattern && !contract.pattern.test(value)) {
      fail(`${contract.flag} value does not match the subordinate command contract: ${value}`);
    }
  }
}

/** 既知の下位検査の呼出形態（実体パスの解決は呼び出し側手順が行う）。 */
export interface KnownGateInvocation {
  command: string;
  scriptArgs: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface KnownWorkflowGateInput extends KnownGateInvocation {
  workflow: string;
  /** 下位 checker 契約が定める --workflow 値の許容集合。 */
  allowedWorkflowValues: readonly string[];
  root: string;
}

export interface KnownTraceabilityGateInput extends KnownGateInvocation {
  root: string;
  reqIds: readonly string[];
}

function toGateSpec(
  name: string,
  invocation: KnownGateInvocation,
  trailingArgs: readonly string[],
): GateCommandSpec {
  return {
    name,
    command: invocation.command,
    args: [...invocation.scriptArgs, ...trailingArgs],
    cwd: invocation.cwd,
    ...(invocation.timeoutMs !== undefined ? { timeoutMs: invocation.timeoutMs } : {}),
  };
}

function requireReqIdList(reqIds: readonly string[]): string {
  for (const id of reqIds) {
    if (!/^REQ-\d{3}-\d{3}$/.test(id)) {
      fail(`invalid requirement row id: ${id}`);
    }
  }
  return reqIds.join(",");
}

/** workflow 値付き integrity gate（check_changed_docs 等の下位契約）を既知入力型から固定生成する。 */
export function buildKnownWorkflowIntegrityGateSpec(input: KnownWorkflowGateInput): GateCommandSpec {
  if (!input.allowedWorkflowValues.includes(input.workflow)) {
    fail(`workflow value is rejected by the subordinate checker contract (allowed: ${input.allowedWorkflowValues.join(", ")}): ${input.workflow}`);
  }
  return toGateSpec("integrity-check", input, ["--workflow", input.workflow, "--root", input.root]);
}

/** traceability check の gate spec を既知入力型と下位契約から固定生成する。 */
export function buildKnownTraceabilityCheckSpec(input: KnownTraceabilityGateInput): GateCommandSpec {
  return toGateSpec("traceability-check", input, ["--root", input.root, "--req", requireReqIdList(input.reqIds)]);
}

/** generate_indexes の gate spec を既知入力型から固定生成する。 */
export function buildKnownGenerateIndexesSpec(input: KnownGateInvocation): GateCommandSpec {
  return toGateSpec("generate_indexes", input, []);
}

/** check_integrity の gate spec を既知入力型から固定生成する。 */
export function buildKnownCheckIntegritySpec(input: KnownGateInvocation): GateCommandSpec {
  return toGateSpec("check_integrity", input, []);
}

function resolveTargetPaths(args: readonly string[]): string[] {
  const found: string[] = [];
  for (const flag of PATH_FLAG_CONTRACTS) {
    const value = extractFlagValue(args, flag);
    if (value !== null && value.trim().length > 0) {
      found.push(value);
    }
  }
  return found;
}

/** 1回の検査実行から実行証跡を構築する（終了コード取得のための再実行を不要にする）。 */
export function buildGateEvidence(
  spec: GateCommandSpec,
  result: CommandResult,
  targetRevision: string,
): GateExecutionEvidence {
  return {
    executedCommand: {
      command: spec.command,
      args: spec.args,
      cwd: spec.cwd,
      ...(spec.timeoutMs !== undefined ? { timeoutMs: spec.timeoutMs } : {}),
    },
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    targetRevision,
    targetPaths: resolveTargetPaths(spec.args),
  };
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
    const { input } = parseArgs(process.argv.slice(2));
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
