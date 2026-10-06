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
// 失敗 1。対象品質ゲートの省略は入力検証で拒否する。意味判断（検査結果の意味
// レビュー、受理判断）はモデルが agentdev_gh による I/O とともに担当する。
// 実装は inspect_cross_dependencies.ts と同じ作り（工程別個別 script、共通基盤
// なし）。overlap 突合は case-open スキル配下の共有単一実装
// （agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts）を
// 呼び出して再利用し、比較ロジックを再実装しない。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts --input <input.json>
  --input  機械工程入力 JSON（phase、品質ゲート実行仕様、削除対象パス等）`;

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

/** script が外部処理を呼び出す経路。単体テストでは偽 runner を注入する。 */
export interface MechanicalRunner {
  run(spec: CommandSpec): CommandResult;
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

/** 受入検査 phase で必須の品質ゲート（省略禁止）。 */
export const REQUIRED_GATES_ACCEPTANCE_CHECKS = [
  "integrity-checks",
  "traceability-check",
  "overlap-cross-check",
  "generate_indexes",
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

/** 機械工程を実行し、報告 JSON を返す（省略なし。失敗時は途中結果とともに fail を返す）。 */
export function runAcceptDefinitionChecks(
  input: AcceptDefinitionInput,
  runner: MechanicalRunner,
): AcceptDefinitionReport {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];
  const diff: Record<string, unknown> = {};
  const proposal: Record<string, string> = {};
  const repoRoot = path.resolve(input.repoRoot);

  if (input.phase === "acceptance-checks") {
    const integrityResults: Record<string, { exitCode: number }> = {};
    let integrityFail = false;
    for (const gate of input.integrityGates ?? []) {
      const result = runSpec(runner, gate);
      integrityResults[gate.name] = { exitCode: result.exitCode };
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
          const parsed = JSON.parse(overlap.stdout) as { warnings?: unknown[]; detection_unavailable?: unknown };
          overlapSummary = `warnings=${parsed.warnings?.length ?? 0} detection_unavailable=${parsed.detection_unavailable != null}`;
        } catch {
          overlapSummary = "report parse failed";
        }
      }
      steps.push({
        name: "overlap-cross-check",
        status: overlap.exitCode === 0 ? "pass" : "fail",
        detail: { exitCode: overlap.exitCode, summary: overlapSummary },
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
        detail: { exitCode: gen.exitCode, diffStat: diffOutput },
      });
      diff.autogenRegeneration = { exitCode: gen.exitCode, diffStat: diffOutput };
      if (gen.exitCode !== 0) {
        warnings.push("generate_indexes failed");
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
    }

    if (input.traceabilityGate) {
      const check = runSpec(runner, input.traceabilityGate);
      let summary = "";
      if (check.exitCode === 0) {
        try {
          const parsed = JSON.parse(check.stdout) as { summary?: { pass?: number; fail?: number } };
          summary = `pass=${parsed.summary?.pass ?? "?"} fail=${parsed.summary?.fail ?? "?"}`;
        } catch {
          summary = "report parse failed";
        }
      }
      steps.push({
        name: "traceability-check",
        status: check.exitCode === 0 ? "pass" : "fail",
        detail: { exitCode: check.exitCode, summary },
      });
      if (check.exitCode !== 0) {
        warnings.push("traceability check failed");
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
    }

    proposal.acceptance_summary = [
      `Definition PR #${input.prNumber} の受入検査（忠実性・整合性・品質検査、overlap 突合、AUTOGEN 再生成差分検出、traceability check）を script 内で実行した。`,
      "意味レビューと受理判断はモデルが行う。",
    ].join("\n");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }

  const fetchResult = runner.run({ command: "git", args: ["fetch", "origin", "main"], cwd: repoRoot });
  if (fetchResult.exitCode !== 0) {
    steps.push({
      name: "canonical-reacquisition",
      status: "fail",
      detail: { stage: "fetch", stderr: fetchResult.stderr.trim() },
    });
    warnings.push("git fetch origin main failed");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  const ffMerge = runner.run({ command: "git", args: ["merge", "--ff-only", "origin/main"], cwd: repoRoot });
  const head = ffMerge.exitCode === 0
    ? runner.run({ command: "git", args: ["rev-parse", "HEAD"], cwd: repoRoot }).stdout.trim()
    : "";
  steps.push({
    name: "canonical-reacquisition",
    status: ffMerge.exitCode === 0 ? "pass" : "fail",
    detail: { head, stderrTail: ffMerge.exitCode === 0 ? "" : ffMerge.stderr.trim().slice(-400) },
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
  const rm = runner.run({ command: "git", args: ["rm", "--", ...removals], cwd: repoRoot });
  if (rm.exitCode !== 0) {
    steps.push({
      name: "draft-ru-removal-commit",
      status: "fail",
      detail: { stage: "git rm", stderr: rm.stderr.trim() },
    });
    warnings.push("git rm of draft/RU paths failed");
    return assembleReport(input.phase, steps, diff, warnings, proposal);
  }
  const staged = runner.run({ command: "git", args: ["status", "--short"], cwd: repoRoot });
  const stagedEntries = staged.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  // インデックスへステージされた行のみが対象（先頭列が空白=未ステージ、"??"=未追跡は除外）。
  const stagedOnly = stagedEntries.filter((entry) => entry[0] !== " " && entry[0] !== "?");
  const foreignStaged = stagedOnly.filter(
    (entry) => !removals.some((target) => entry.endsWith(target)),
  );
  if (foreignStaged.length > 0) {
    steps.push({
      name: "draft-ru-removal-commit",
      status: "fail",
      detail: { stage: "staged-entries-check", stagedEntries, removals },
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
      removedPaths: removals,
      head: commitHead,
      stderrTail: commit.exitCode === 0 ? "" : commit.stderr.trim().slice(-400),
    },
  });
  if (commit.exitCode !== 0) {
    warnings.push("draft/RU removal commit failed");
  }
  diff.removedPaths = removals;
  diff.head = commitHead;

  return assembleReport(input.phase, steps, diff, warnings, proposal);
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
    const normalized: AcceptDefinitionInput = {
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
