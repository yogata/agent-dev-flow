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
  const repoRoot = path.resolve(input.repoRoot);
  const worktreeAbs = path.resolve(repoRoot, input.worktreeRoot);
  const worktreeCwd = worktreeAbs;

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
        exitCode: gen.exitCode,
        executed: input.requiresIndexRegeneration,
        stderrTail: gen.exitCode === 0 ? "" : gen.stderr.trim().slice(-400),
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
        detail: { exitCode: check.exitCode, stderrTail: check.exitCode === 0 ? "" : check.stderr.trim().slice(-400) },
      });
      if (check.exitCode !== 0) {
        warnings.push("check_integrity failed");
        return assembleReport(false, steps, diff, warnings, proposal);
      }
    }

    if (input.traceabilityGate) {
      const check = runSpec(runner, input.traceabilityGate);
      let summary = "";
      let gateFailed = check.exitCode !== 0;
      if (check.exitCode === 0 || check.exitCode === 2) {
        try {
          const parsed = JSON.parse(check.stdout) as {
            summary?: { pass?: number; fail?: number };
            checks?: Record<string, { status?: string; findings?: readonly { reqId?: string }[] }>;
          };
          summary = `pass=${parsed.summary?.pass ?? "?"} fail=${parsed.summary?.fail ?? "?"}`;
          const targetedReqIds = input.traceabilityReqIds ?? [];
          const checks = parsed.checks ?? {};
          gateFailed =
            Object.keys(checks).length === 0 ||
            Object.entries(checks).some(([name, result]) => {
              if (result.status !== "fail") return false;
              if (name !== "missing-design") return true;
              return targetedReqIds.length === 0 || result.findings?.some(
                (finding) => finding.reqId !== undefined && targetedReqIds.includes(finding.reqId),
              ) === true;
            });
        } catch {
          summary = "report parse failed";
          gateFailed = true;
        }
      }
      steps.push({
        name: "traceability-check",
        status: gateFailed ? "fail" : "pass",
        detail: { exitCode: check.exitCode, summary, reqIds: input.traceabilityReqIds ?? [] },
      });
      if (gateFailed) {
        warnings.push("traceability check failed");
        return assembleReport(false, steps, diff, warnings, proposal);
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
    "- generate_indexes / check_integrity / traceability check: 本 script 実行内で成功",
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
