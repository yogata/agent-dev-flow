//
// case-ready 機械工程の script 入口（Definition 受入の機械部分）。
//
// Definition PR の忠実性・整合性・品質検査の実行、overlap 突合、AUTOGEN 対象
// block の再生成差分検出、traceability check（受入検査 phase）と、merge 後の
// canonical 再取得、draft/RU 削除の git rm と明示パス指定 commit（canonical 再
// 取得 phase）を 1 script の呼び出しに束ねる。GitHub I/O（pr_read、pr_merge、
// Issue 本文更新）は行わない。REQ/Decision/Design の保存実体（Capability Skill
// 委譲による保存手続き）は対象外であり、保存責務の委譲構造を変更しない。
//
// 入力: `--input` に機械工程入力 JSON ファイル。出力: stdout に報告 JSON
// （実行結果・差分・警告・提案本文の4要素）。終了コード: 成功 0、要判断 2、
// 失敗 1。対象品質ゲートの省略は入力検証で拒否し、ゲート実行体は起動前に
// 配布先での存在検査を行う（欠落時は正規の代替経路の案内を報告へ含めて
// fail-closed で停止する）。意味判断（検査結果の意味
// レビュー、受理判断）はモデルが agentdev_gh による I/O とともに担当する。
// 実装は inspect_cross_dependencies.ts と同じ作り（工程別個別 script、共通基盤
// なし）。overlap 突合は case-open スキル配下の共有単一実装
// （agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts）を
// 呼び出して再利用し、比較ロジックを再実装しない。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { consumeDefinitionTraceability, isReqRowId, REQ_ROW_ID_LIST_PATTERN, type DeferredObligation } from "../../../agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts --input <input.json> [--validate-input]
  --input           機械工程入力 JSON（phase、品質ゲート実行仕様、削除対象パス等）
  --validate-input  検証専用経路。入力 JSON の契約検証・既知 gate 引数契約検査・ゲート実行体の
                    存在確認のみを行い（worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル
                    変更なし）、報告 JSON を stdout へ出力する（合格 0 / 不合格 1）`;

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
  exists(absolutePath: string): boolean;
}

export interface GateCommandSpec {
  name: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export type AcceptancePhase = "acceptance-checks" | "canonical-and-cleanup";

export interface AcceptDefinitionInput {
  phase: AcceptancePhase;
  repoRoot: string;
  branch: string;
  prNumber: number;
  integrityGates?: readonly GateCommandSpec[];
  traceabilityGate?: GateCommandSpec;
  overlapGate?: GateCommandSpec;
  generateIndexesGate?: GateCommandSpec;
  autogenDerivedPaths?: readonly string[];
  /** canonical 再取得 phase の draft/RU 削除対象（repoRoot 相対）。 */
  removalPaths?: readonly string[];
  commitMessage?: string;
}

export interface StepRecord {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: Record<string, unknown>;
}

export interface AcceptDefinitionReport {
  result: {
    phase: AcceptancePhase;
    exitCategory: "success" | "needs-judgment" | "failure";
    steps: readonly StepRecord[];
  };
  diff: Record<string, unknown>;
  warnings: readonly string[];
  proposal: Record<string, string>;
}

/**
 * canonical 再取得（fetch / ff-only merge）失敗時に検出したローカル main と
 * origin/main の分岐状況。報告 JSON の canonical-reacquisition step detail の
 * divergence に出力する。検出は報告のみを目的とし、解消判断はモデルが
 * agentdev-git-worktree の「Squash merge 後分岐ハンドリング手順」へ接続して行う。
 */
export interface DivergenceDetail {
  /** ローカル main にのみ存在する commit 数（検出不能時は null）。 */
  ahead: number | null;
  /** origin/main にのみ存在する commit 数（検出不能時は null）。 */
  behind: number | null;
  /** ローカル main のみの commit 一覧（git log --oneline origin/main..main）。 */
  aheadCommits: readonly string[];
  /** origin/main のみの commit 一覧（git log --oneline main..origin/main）。 */
  behindCommits: readonly string[];
  /** 検出不能の理由（remote-tracking ref 不在、出力解釈失敗等）。検出成功時は空文字。 */
  detectionUnavailable: string;
}

/** 受入検査 phase で必須の品質ゲート（省略禁止）。 */
export const REQUIRED_GATES_ACCEPTANCE_CHECKS = [
  "integrity-checks",
  "traceability-check",
  "overlap-cross-check",
  "generate_indexes",
] as const;

/**
 * 欠落時に報告 JSON で案内する正規の代替経路（REQ 行の語彙）。
 * 代替経路の履行なしに検査を省略して成功扱いとしないため、欠落時は fail-closed
 * で停止し案内のみを行う。
 */
export const GATE_ALTERNATIVE_ROUTES: readonly string[] = [
  "evidence-preservation（証跡化）: ゲート実行体の欠落を検出事項として証跡化する（本報告 JSON の step detail と warnings、呼出側の検証差分記録への記録）",
  "manual-equivalent-procedure（手動相当手順）: 手動相当の手順で同等の検査を実施し、実行証跡（終了コード、標準出力・標準エラー）を記録する",
  "contrastive-no-worse-proof（対照実行による悪化ゼロ件の機械証明）: baseline 対照の対照実行で既知 fail の悪化ゼロ件を機械証明する",
];

const GATE_SCRIPT_EXTENSIONS = [".ts", ".mts", ".mjs", ".js", ".cjs"];

/**
 * ゲート実行体ファイル（スクリプトパス）の解決。command と args[0] のうち
 * パス区切りまたはスクリプト拡張子をもつ最初の要素を gate cwd 基準で解決する。
 * 実行体ファイルを特定できない場合は null（存在検査対象なし。command 自体の
 * 解決は実行基盤の責務で、ENOENT 等の実行時失敗は既存の実行経路が扱う）。
 */
export function resolveGateExecutablePath(spec: GateCommandSpec): string | null {
  const candidates = [spec.command, spec.args[0]];
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || candidate.length === 0) continue;
    const hasSeparator = /[\\/]/.test(candidate);
    const hasScriptExtension = GATE_SCRIPT_EXTENSIONS.some((ext) => candidate.toLowerCase().endsWith(ext));
    if (hasSeparator || hasScriptExtension) {
      return path.resolve(spec.cwd, candidate);
    }
  }
  return null;
}

export interface GateAvailabilityRecord {
  gate: string;
  available: boolean;
  resolvedExecutable: string | null;
  alternativeRoutes: readonly string[];
}

/**
 * 必須ゲート実行体の配布先での存在検査。欠落時は fail-closed の対象として
 * 検出し、正規の代替経路の案内を報告へ含める。
 */
export function evaluateGateAvailability(
  gates: readonly GateCommandSpec[],
  exists: (absolutePath: string) => boolean,
): { records: readonly GateAvailabilityRecord[]; missing: readonly string[] } {
  const records = gates.map((gate) => {
    const executable = resolveGateExecutablePath(gate);
    const available = executable === null || exists(executable);
    return {
      gate: gate.name,
      available,
      resolvedExecutable: executable,
      alternativeRoutes: available ? [] : GATE_ALTERNATIVE_ROUTES,
    };
  });
  return {
    records,
    missing: records.filter((record) => !record.available).map((record) => record.gate),
  };
}

export class MechanicalInputError extends Error {}

function fail(message: string): never {
  throw new MechanicalInputError(message);
}

function parseArgs(argv: readonly string[]): { input: string; validateOnly: boolean } {
  let input: string | null = null;
  let validateOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input" && argv[i + 1] !== undefined) {
      input = argv[++i] ?? null;
    } else if (arg === "--validate-input") {
      validateOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${USAGE}\n`);
      process.exit(0);
    } else {
      fail(`unknown argument: ${arg}\n${USAGE}`);
    }
  }
  if (input === null) fail(`--input is required\n${USAGE}`);
  return { input, validateOnly };
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
  validated: AcceptDefinitionInput,
  exists: (absolutePath: string) => boolean,
): { ok: boolean; report: Record<string, unknown> } {
  const gates = [
    ...(validated.integrityGates ?? []),
    validated.traceabilityGate,
    validated.overlapGate,
    validated.generateIndexesGate,
  ].filter((gate): gate is GateCommandSpec => gate != null);
  for (const gate of gates) {
    preValidateGateSpec(gate);
  }
  const availability = evaluateGateAvailability(gates, exists);
  const report = {
    ok: availability.missing.length === 0,
    mode: "validate-input",
    script: "accept_definition_checks",
    inputValidation: "pass",
    gatePreValidation: "pass",
    gateAvailability: availability,
    sideEffects: "none",
  };
  return { ok: availability.missing.length === 0, report };
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
  { flag: "--req", pattern: REQ_ROW_ID_LIST_PATTERN },
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

export interface KnownOverlapGateInput extends KnownGateInvocation {
  inputPath: string;
  root: string;
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
    if (!isReqRowId(id)) {
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

/** overlap 突合（共有単一実装）の gate spec を既知入力型と下位契約から固定生成する。 */
export function buildKnownOverlapCheckSpec(input: KnownOverlapGateInput): GateCommandSpec {
  return toGateSpec("overlap-cross-check", input, ["--input", input.inputPath, "--root", input.root]);
}

/** generate_indexes の gate spec を既知入力型から固定生成する。 */
export function buildKnownGenerateIndexesSpec(input: KnownGateInvocation): GateCommandSpec {
  return toGateSpec("generate_indexes", input, []);
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

/** 入力 JSON を検証する。必須品質ゲートの欠落（省略）を拒否する。 */
export function validateInput(value: unknown): AcceptDefinitionInput {
  if (typeof value !== "object" || value === null) fail("input must be a JSON object");
  const v = value as Record<string, unknown>;
  if (v.phase !== "acceptance-checks" && v.phase !== "canonical-and-cleanup") {
    fail('phase must be "acceptance-checks" or "canonical-and-cleanup"');
  }
  for (const field of ["repoRoot", "branch"] as const) {
    if (typeof v[field] !== "string" || (v[field] as string).length === 0) {
      fail(`input.${field} is required`);
    }
  }
  if (typeof v.prNumber !== "number") fail("input.prNumber is required");
  if (v.phase === "acceptance-checks") {
    const missing: string[] = [];
    if (!Array.isArray(v.integrityGates) || v.integrityGates.length === 0) missing.push("integrity-checks");
    if (v.traceabilityGate == null) missing.push("traceability-check");
    if (v.overlapGate == null) missing.push("overlap-cross-check");
    if (v.generateIndexesGate == null) missing.push("generate_indexes");
    if (missing.length > 0) {
      fail(`required quality gates are missing from input (omission forbidden): ${missing.join(", ")}`);
    }
  } else {
    const missing: string[] = [];
    const removals = Array.isArray(v.removalPaths) ? (v.removalPaths as string[]) : [];
    if (removals.length > 0 && (typeof v.commitMessage !== "string" || (v.commitMessage as string).length === 0)) {
      missing.push("commit-message");
    }
    if (missing.length > 0) {
      fail(`required inputs are missing for canonical-and-cleanup phase: ${missing.join(", ")}`);
    }
  }
  return {
    phase: v.phase,
    repoRoot: v.repoRoot as string,
    branch: v.branch as string,
    prNumber: v.prNumber as number,
    integrityGates: Array.isArray(v.integrityGates)
      ? (v.integrityGates as GateCommandSpec[]).map((gate, index) => requireGateSpec(gate, `integrityGates[${index}]`))
      : undefined,
    traceabilityGate: v.traceabilityGate != null ? requireGateSpec(v.traceabilityGate, "traceabilityGate") : undefined,
    overlapGate: v.overlapGate != null ? requireGateSpec(v.overlapGate, "overlapGate") : undefined,
    generateIndexesGate: v.generateIndexesGate != null ? requireGateSpec(v.generateIndexesGate, "generateIndexesGate") : undefined,
    autogenDerivedPaths: Array.isArray(v.autogenDerivedPaths) ? (v.autogenDerivedPaths as readonly string[]) : [],
    removalPaths: Array.isArray(v.removalPaths) ? (v.removalPaths as readonly string[]) : undefined,
    commitMessage: typeof v.commitMessage === "string" ? v.commitMessage : undefined,
  };
}

/** 報告 JSON を組み立てる（実行結果・差分・警告・提案本文の4要素）。 */
export function assembleReport(
  phase: AcceptancePhase,
  steps: readonly StepRecord[],
  diff: Record<string, unknown>,
  warnings: readonly string[],
  proposal: Record<string, string>,
): AcceptDefinitionReport {
  const hasFail = steps.some((step) => step.status === "fail");
  const hasWarn = steps.some((step) => step.status === "warn");
  return {
    result: {
      phase,
      exitCategory: hasFail ? "failure" : hasWarn ? "needs-judgment" : "success",
      steps,
    },
    diff,
    warnings,
    proposal,
  };
}

export function decideExitCode(report: AcceptDefinitionReport): number {
  if (report.result.exitCategory === "failure") return 1;
  if (report.result.exitCategory === "needs-judgment") return 2;
  return 0;
}

function runSpec(runner: MechanicalRunner, spec: GateCommandSpec): CommandResult {
  return runner.run({ command: spec.command, args: spec.args, cwd: spec.cwd, timeoutMs: spec.timeoutMs });
}

/**
 * canonical 再取得の fetch / ff-only merge 失敗時の分岐検出（報告専用）。
 * ローカル main と origin/main の ahead/behind の件数とコミット一覧を検出する。
 * 検出は報告への反映のみを目的とし、reset / rebase 等の解消操作は実行しない。
 * 検出自体の失敗（remote-tracking ref 不在等）はエラーとせず検出不能を記録する
 * （分岐ハンドリング手順の手順0と同様、比較不能をエラー扱いにしない）。
 */
function detectDivergence(runner: MechanicalRunner, repoRoot: string): DivergenceDetail {
  const count = runner.run({
    command: "git",
    args: ["rev-list", "--left-right", "--count", "main...origin/main"],
    cwd: repoRoot,
  });
  if (count.exitCode !== 0) {
    return {
      ahead: null,
      behind: null,
      aheadCommits: [],
      behindCommits: [],
      detectionUnavailable: count.stderr.trim() || `git rev-list exited with ${count.exitCode}`,
    };
  }
  const [aheadRaw, behindRaw] = count.stdout.trim().split(/\s+/);
  const ahead = Number.parseInt(aheadRaw ?? "", 10);
  const behind = Number.parseInt(behindRaw ?? "", 10);
  if (!Number.isFinite(ahead) || !Number.isFinite(behind)) {
    return {
      ahead: null,
      behind: null,
      aheadCommits: [],
      behindCommits: [],
      detectionUnavailable: `unexpected rev-list output: ${count.stdout.trim()}`,
    };
  }
  const aheadLog = runner.run({ command: "git", args: ["log", "--oneline", "origin/main..main"], cwd: repoRoot });
  const behindLog = runner.run({ command: "git", args: ["log", "--oneline", "main..origin/main"], cwd: repoRoot });
  const logFailed = aheadLog.exitCode !== 0 || behindLog.exitCode !== 0;
  return {
    ahead,
    behind,
    aheadCommits: aheadLog.exitCode === 0 ? splitLogLines(aheadLog.stdout) : [],
    behindCommits: behindLog.exitCode === 0 ? splitLogLines(behindLog.stdout) : [],
    detectionUnavailable: logFailed ? "commit listing (git log) failed" : "",
  };
}

function splitLogLines(stdout: string): readonly string[] {
  return stdout
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.length > 0);
}

/** 機械工程を実行し、報告 JSON を返す（省略なし。失敗時は途中結果とともに fail を返す）。 */
export function runAcceptDefinitionChecks(
  input: AcceptDefinitionInput,
  runner: MechanicalRunner,
): AcceptDefinitionReport {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];
  const diff: Record<string, unknown> = {};
  const proposal: Record<string, string> = {};
  let deferredTraceabilityObligations: readonly DeferredObligation[] = [];
  const repoRoot = path.resolve(input.repoRoot);

  if (input.phase === "acceptance-checks") {
    for (const spec of [...(input.integrityGates ?? []), input.overlapGate, input.generateIndexesGate, input.traceabilityGate]) {
      if (spec != null) preValidateGateSpec(spec);
    }
    const availability = evaluateGateAvailability(
      [...(input.integrityGates ?? []), input.overlapGate, input.generateIndexesGate, input.traceabilityGate].filter(
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
      return assembleReport(input.phase, steps, diff, warnings, proposal);
    }
    const targetRevision = runner
      .run({ command: "git", args: ["rev-parse", "HEAD"], cwd: repoRoot })
      .stdout.trim();
    const integrityResults: Record<string, GateExecutionEvidence> = {};
    let integrityFail = false;
    for (const gate of input.integrityGates ?? []) {
      const result = runSpec(runner, gate);
      integrityResults[gate.name] = buildGateEvidence(gate, result, targetRevision);
      if (result.exitCode !== 0) integrityFail = true;
    }
    steps.push({
      name: "definition-acceptance-checks",
      status: integrityFail ? "fail" : "pass",
      detail: integrityResults,
    });
    if (integrityFail) {
      warnings.push("Definition integrity/quality check failed");
      return assembleReport(input.phase, steps, diff, warnings, proposal);
    }

    if (input.overlapGate) {
      const overlap = runSpec(runner, input.overlapGate);
      let overlapSummary = "";
      if (overlap.exitCode === 0) {
        try {
          // 要約は engine 報告 JSON 契約（CrossDependencyInspectionReport）に従う。
          // warnings は condition_a 配下の構造化警告結果であり、報告に存在しない
          // top-level warnings を参照しない。対応要件行は repository top-level の
          // traceability sidecar（agentdev-workflow-case-ready.yaml）を正とする。
          const parsed = JSON.parse(overlap.stdout) as {
            condition_a?: { warnings?: unknown };
            detection_unavailable?: unknown;
          };
          const warnings = parsed.condition_a?.warnings;
          const warningCount = Array.isArray(warnings) ? warnings.length : 0;
          const unavailableCount = Array.isArray(parsed.detection_unavailable) ? parsed.detection_unavailable.length : 0;
          overlapSummary = `warnings=${warningCount} detection_unavailable=${unavailableCount}`;
        } catch {
          overlapSummary = "report parse failed";
        }
      }
      steps.push({
        name: "overlap-cross-check",
        status: overlap.exitCode === 0 ? "pass" : "fail",
        detail: {
          summary: overlapSummary,
          ...buildGateEvidence(input.overlapGate, overlap, targetRevision),
        },
      });
      if (overlap.exitCode !== 0) {
        warnings.push("overlap cross-dependency inspection failed");
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
    }

    if (input.generateIndexesGate) {
      const gen = runSpec(runner, input.generateIndexesGate);
      let diffOutput = "";
      if (gen.exitCode === 0) {
        const derivedPaths = input.autogenDerivedPaths ?? [];
        const gitDiff = runner.run({
          command: "git",
          args: ["diff", "--stat", "--", ...derivedPaths],
          cwd: repoRoot,
        });
        diffOutput = gitDiff.stdout.trim();
        if (diffOutput.length > 0) {
          runner.run({ command: "git", args: ["checkout", "--", ...derivedPaths], cwd: repoRoot });
          warnings.push("AUTOGEN derived files differ after regeneration (restore applied). Regeneration diff must be resolved before merge");
        }
      }
      steps.push({
        name: "autogen-regeneration-diff",
        status: gen.exitCode === 0 ? (diffOutput.length > 0 ? "warn" : "pass") : "fail",
        detail: {
          diffStat: diffOutput,
          ...buildGateEvidence(input.generateIndexesGate, gen, targetRevision),
        },
      });
      diff.autogenRegeneration = { exitCode: gen.exitCode, diffStat: diffOutput };
      if (gen.exitCode !== 0) {
        warnings.push("generate_indexes failed");
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
    }

    if (input.traceabilityGate) {
      const check = runSpec(runner, input.traceabilityGate);
      const reqFilter = extractFlagValue(input.traceabilityGate.args, "--req");
      const consumption = consumeDefinitionTraceability({
        exitCode: check.exitCode,
        stdout: check.stdout,
        targetReqIds: reqFilter === null ? [] : reqFilter.split(","),
      });
      const deferred = consumption.deferredObligations;
      deferredTraceabilityObligations = deferred;
      steps.push({
        name: "traceability-check",
        status: consumption.status,
        detail: {
          summary: consumption.summary,
          deferredObligations: deferred,
          ...buildGateEvidence(input.traceabilityGate, check, targetRevision),
        },
      });
      if (consumption.blocking) {
        warnings.push(`traceability readiness gate failed: ${consumption.reason ?? consumption.summary}`);
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
      if (deferred.length > 0) {
        warnings.push("missing-implementation and missing-verification remain raw checker failures; case-ready defers them to case-run and case-close");
      }
    }

    proposal.acceptance_summary = [
      `Definition PR #${input.prNumber} の受入検査（忠実性・整合性・品質検査、overlap 突合、AUTOGEN 再生成差分検出、traceability check）を script 内で実行した。`,
      ...(deferredTraceabilityObligations.length > 0
        ? [`checker の missing-implementation / missing-verification は raw fail のまま case-run / case-close へ deferred: ${deferredTraceabilityObligations.map((obligation) => `${obligation.check} (${obligation.reqIds.join(", ")})`).join("; ")}`]
        : []),
      "意味レビューと受理判断はモデルが行う。",
    ].join("\n");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }

  const fetchResult = runner.run({ command: "git", args: ["fetch", "origin", "main"], cwd: repoRoot });
  if (fetchResult.exitCode !== 0) {
    steps.push({
      name: "canonical-reacquisition",
      status: "fail",
      detail: { stage: "fetch", stderr: fetchResult.stderr.trim(), divergence: detectDivergence(runner, repoRoot) },
    });
    warnings.push("git fetch origin main failed");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  const ffMerge = runner.run({ command: "git", args: ["merge", "--ff-only", "origin/main"], cwd: repoRoot });
  const head = ffMerge.exitCode === 0
    ? runner.run({ command: "git", args: ["rev-parse", "HEAD"], cwd: repoRoot }).stdout.trim()
    : "";
  // 分岐検出は失敗時のみ実行する（対象は fetch / ff-only merge の失敗時。要件対応は traceability sidecar 参照）。
  // 検出結果は detail への出力のみで、script は reset / rebase 等の解消操作を実行しない。
  const divergence = ffMerge.exitCode === 0 ? null : detectDivergence(runner, repoRoot);
  steps.push({
    name: "canonical-reacquisition",
    status: ffMerge.exitCode === 0 ? "pass" : "fail",
    detail: {
      head,
      stderrTail: ffMerge.exitCode === 0 ? "" : ffMerge.stderr.trim().slice(-400),
      stderr: ffMerge.exitCode === 0 ? "" : ffMerge.stderr.trim(),
      ...(divergence === null ? {} : { divergence }),
    },
  });
  if (ffMerge.exitCode !== 0) {
    warnings.push("canonical re-acquisition (ff-only merge) failed");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }

  const removals = input.removalPaths ?? [];
  if (removals.length === 0) {
    diff.head = head;
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  // 冪等化前置き: git rm の前にインデックスの削除状態を確認する。
  // 前回実行の git rm 済みでインデックスから消えたパスは pathspec 不一致で停止するため
  // rm 対象から除外し skip を記録する。
  const removalTargets: string[] = [];
  const removalSkips: string[] = [];
  for (const path of removals) {
    const indexed = runner.run({ command: "git", args: ["ls-files", "--", path], cwd: repoRoot });
    if (indexed.exitCode === 0 && indexed.stdout.trim().length > 0) {
      removalTargets.push(path);
    } else {
      removalSkips.push(path);
    }
  }
  if (removalSkips.length > 0) {
    // untracked のため git rm 対象から除外されたパスの報告へ、保存時の git
    // 永続化が未実施の疑い（永続化漏れの可能性）を明示する。Form Zero 契約と
    // cleanup の fail-closed 動作は変更しない。
    warnings.push(
      "skippedPaths (untracked, excluded from git rm) indicate possible missing persistence at save time (draft/RU files not committed by req-define explicit-path commit)",
    );
  }
  if (removalTargets.length > 0) {
    const rm = runner.run({ command: "git", args: ["rm", "--", ...removalTargets], cwd: repoRoot });
    if (rm.exitCode !== 0) {
      steps.push({
        name: "draft-ru-removal-commit",
        status: "fail",
        detail: { stage: "git rm", targets: removalTargets, skippedPaths: removalSkips, stderr: rm.stderr.trim() },
      });
      warnings.push("git rm of draft/RU paths failed");
      return assembleReport(input.phase, steps, diff, warnings, proposal);
    }
  }
  const staged = runner.run({ command: "git", args: ["status", "--short"], cwd: repoRoot });
  // git status --short の各行は "XY <path>" の2列形式。trim 前の raw 行の列位置で判定する
  // （trim すると未ステージ行〔X 列が空白〕の先頭列が Y 列にずれ、staged と誤判定する）。
  const stagedEntries = staged.stdout
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.length >= 2);
  // インデックスへステージされた行のみが対象（X 列〔line[0]〕が空白=未ステージ、"??"=未追跡は除外。Y 列〔line[1]〕は working tree 側）。
  const stagedOnly = stagedEntries.filter((line) => line[0] !== " " && line[0] !== "?");
  const foreignStaged = stagedOnly.filter(
    (entry) => !removals.some((target) => entry.endsWith(target)),
  );
  if (foreignStaged.length > 0) {
    steps.push({
      name: "draft-ru-removal-commit",
      status: "fail",
      detail: { stage: "staged-entries-check", stagedEntries, removals, skippedPaths: removalSkips },
    });
    warnings.push("staged entries outside the removal paths detected (wait and re-confirm before commit)");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  const commit = runner.run({ command: "git", args: ["commit", "-m", input.commitMessage ?? ""], cwd: repoRoot });
  const commitHead = commit.exitCode === 0
    ? runner.run({ command: "git", args: ["rev-parse", "HEAD"], cwd: repoRoot }).stdout.trim()
    : "";
  steps.push({
    name: "draft-ru-removal-commit",
    status: commit.exitCode === 0 ? "pass" : "fail",
    detail: {
      removedPaths: removalTargets,
      skippedPaths: removalSkips,
      head: commitHead,
      stderrTail: commit.exitCode === 0 ? "" : commit.stderr.trim().slice(-400),
      stderr: commit.exitCode === 0 ? "" : commit.stderr.trim(),
    },
  });
  if (commit.exitCode !== 0) {
    warnings.push("draft/RU removal commit failed");
  }
  diff.removedPaths = removalTargets;
  diff.head = commitHead;

  return assembleReport(input.phase, steps, diff, warnings, proposal);
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
    const normalized: AcceptDefinitionInput = {
      ...validated,
      repoRoot: path.resolve(validated.repoRoot),
    };
    const runner: MechanicalRunner = {
      exists(absolutePath) {
        return fs.existsSync(absolutePath);
      },
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
    };
    const report = runAcceptDefinitionChecks(normalized, runner);
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
