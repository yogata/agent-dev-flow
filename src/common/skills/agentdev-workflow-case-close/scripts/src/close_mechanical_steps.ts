//
// case-close 機械工程の script 入口（機械工程の script 呼び出し契約節に基づく
// 工程別 script。契約の正は case-close Design「機械工程の script 呼び出し契約」節）。
//
// mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の
// 解析と状態更新、完了条件チェックボックス評価の機械的抽出（受入評価の母集団
// 導出と final-acceptance.ts の evaluateFinalAcceptance への接続を兼ねる）、
// AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、worktree/branch
// クリーンアップを1 script の呼び出しに束ねる。受入評価の拒否・未確定は報告
// JSON（diff.acceptanceEvaluation と isCloseOperationPermitted）を通じて既存の
// 終了操作（STEP-5 の issue_close、E1〜E6 の Epic 終了・Wave クローズ）の実行
// 抑制として消費される。GitHub I/O（pr_merge、issue_close、Issue 本文更新）
// は行わない（読み取り系 gh pr view のみ）。意味判断（警告の重要度評価、Design
// 確定判断、未達判定の確定、完了条件単位の判定入力の組み立て）はモデルが担当する。
//
// 入力: `--input` に機械工程入力 JSON ファイル。出力: stdout に報告 JSON
// （実行結果・差分・警告・提案本文の4要素）。終了コード: 成功 0、要判断 2、
// 失敗 1。script は処理を省略せず、失敗時は途中結果とともに非 0 で終了する。
// 対象品質ゲート（traceability check、full integrity suite、AUTOGEN 再生成差分
// 検出、textlint 最終検査）の省略は入力検証で拒否する。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import {
  countChildStatuses,
  parseStatusCell,
  readChildStatus,
  replaceChildStatus,
  type PersistedStatus,
} from "../../../agentdev-epic-tracker/scripts/lib/tracking-table.ts";
import {
  evaluateFinalAcceptance,
  type ConditionPopulation,
  type ConditionVerdict,
  type CrossObligation,
  type FinalAcceptanceResult,
  type SubjectKind,
} from "./final-acceptance.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts --input <input.json>
  --input  機械工程入力 JSON（phase、worktree_root、PR番号、品質ゲート実行仕様等）`;

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
  sleep(ms: number): void;
}

export interface GateCommandSpec {
  name: string;
  command: string;
  args: readonly string[];
  cwd: string;
  timeoutMs?: number;
}

export interface CloseMechanicalInput {
  phase: "pre-merge" | "post-merge";
  worktreeRoot: string;
  repoRoot: string;
  branch: string;
  prNumber: number;
  issueBodyPath?: string;
  epicBodyPath?: string;
  epicChildStatusUpdates?: readonly { issue: number; status: PersistedStatus }[];
  mergeablePolling?: { intervalSeconds: number; maxAttempts: number };
  generateIndexesGate?: GateCommandSpec;
  autogenDerivedPaths?: readonly string[];
  traceabilityGate?: GateCommandSpec;
  integrityGates?: readonly GateCommandSpec[];
  textlintGate?: GateCommandSpec;
  cleanup?: { removeWorktree: boolean; removeBranch: string | null };
  acceptanceSubjectKind?: SubjectKind;
  acceptanceVerdicts?: readonly ConditionVerdict[];
  acceptanceCrossObligations?: readonly CrossObligation[];
  acceptanceEmptyBasis?: string;
}

export interface StepRecord {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: Record<string, unknown>;
}

export interface CloseMechanicalReport {
  result: {
    phase: "pre-merge" | "post-merge";
    exitCategory: "success" | "needs-judgment" | "failure";
    steps: readonly StepRecord[];
  };
  diff: Record<string, unknown>;
  warnings: readonly string[];
  proposal: Record<string, string>;
}

/** pre-merge 段階で必須の品質ゲート（省略禁止）。 */
export const REQUIRED_GATES_PRE_MERGE = [
  "generate_indexes",
  "traceability-check",
  "full-integrity-suite",
  "textlint-final-check",
] as const;

/** post-merge 段階で必須のステップ（品質ゲートはマージ前に完了済み）。 */
export const REQUIRED_STEPS_POST_MERGE = [
  "post-merge-local-state-check",
  "cleanup-worktree-branch",
] as const;

/** 入力・契約違反。CLI 入口はこのエラーを標準エラー出力と終了コード 1 へ変換する。 */
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

/** 入力 JSON を検証する。必須品質ゲートの欠落（省略）は失敗とする。 */
export function validateInput(value: unknown): CloseMechanicalInput {
  if (typeof value !== "object" || value === null) fail("input must be a JSON object");
  const v = value as Record<string, unknown>;
  if (v.phase !== "pre-merge" && v.phase !== "post-merge") {
    fail('phase must be "pre-merge" or "post-merge"');
  }
  for (const field of ["worktreeRoot", "repoRoot", "branch"] as const) {
    if (typeof v[field] !== "string" || (v[field] as string).length === 0) {
      fail(`input.${field} is required`);
    }
  }
  if (typeof v.prNumber !== "number") fail("input.prNumber is required");
  const input = v as unknown as CloseMechanicalInput;
  if (input.phase === "pre-merge") {
    const missing: string[] = [];
    if (v.generateIndexesGate == null) missing.push("generate_indexes");
    if (v.traceabilityGate == null) missing.push("traceability-check");
    if (!Array.isArray(v.integrityGates) || v.integrityGates.length === 0) {
      missing.push("full-integrity-suite");
    }
    if (v.textlintGate == null) missing.push("textlint-final-check");
    if (typeof v.issueBodyPath !== "string" || (v.issueBodyPath as string).length === 0) {
      missing.push("issue-body-extraction");
    }
    if (missing.length > 0) {
      fail(
        `required quality gates are missing from input (omission forbidden): ${missing.join(", ")}`,
      );
    }
  }
  return input;
}

/**
 * 完了条件チェックボックスの機械的抽出（評価はモデルが担当する）。
 * 入力契約は LF 正規化済みの本文であり、CRLF は呼び出し側が
 * issueBodyPath 読取直後に LF へ正規化して渡す。
 */
export function extractCompletionCheckboxes(
  issueBody: string,
): { total: number; checked: number; items: readonly { text: string; checked: boolean }[] } {
  const items: { text: string; checked: boolean }[] = [];
  for (const line of issueBody.split("\n")) {
    const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.*)$/);
    if (!match) continue;
    items.push({ text: (match[2] ?? "").trim(), checked: match[1] !== " " });
  }
  return { total: items.length, checked: items.filter((i) => i.checked).length, items };
}

/**
 * 完了条件チェックボックス抽出の結果から受入評価の母集団を導出する
 * （抽出フェーズが母集団導出を兼ねる。case-close Design「機械工程の script
 * 呼び出し契約」節）。抽出失敗は extractionSucceeded: false とし、空の抽出を
 * 「条件なし」へ変換しない（0 件抽出は emptyBasis を根拠に主張される）。
 * 完了条件チェックボックスはすべて必須完了条件であるため、総数を必須数として
 * 扱う。
 */
export function deriveAcceptancePopulation(
  extraction: { total: number } | null,
  emptyBasis?: string,
): ConditionPopulation {
  if (extraction === null) {
    return {
      extractionSucceeded: false,
      contractConditionCount: null,
      contractRequiredCount: null,
    };
  }
  return {
    extractionSucceeded: true,
    contractConditionCount: extraction.total,
    contractRequiredCount: extraction.total,
    emptyBasis: extraction.total === 0 ? emptyBasis : undefined,
  };
}

/** 報告 JSON に含める受入評価の結果（母集団・判定・拒否理由）。 */
export interface AcceptanceEvaluationReport {
  determined: boolean;
  population: ConditionPopulation;
  closeAllowed?: boolean;
  populationState?: string;
  violations?: unknown;
  blockingUnmet?: readonly string[];
  blockingCrossObligations?: readonly string[];
}

/**
 * 報告 JSON から終了操作（issue_close、Epic 終了、Wave クローズ）の実行可否を
 * 決定的に判定する。既存終了経路（case-close STEP-5、E1〜E6）が消費する gate
 * であり、受入評価の拒否・未確定は終了操作の前提を満たさない。
 */
export function isCloseOperationPermitted(
  report: CloseMechanicalReport,
): { permitted: boolean; reason?: string } {
  const evaluation = report.diff.acceptanceEvaluation as
    | AcceptanceEvaluationReport
    | undefined;
  if (evaluation === undefined || evaluation.determined !== true) {
    return { permitted: false, reason: "acceptance-evaluation-undetermined" };
  }
  if (evaluation.closeAllowed !== true) {
    return { permitted: false, reason: "acceptance-denied" };
  }
  if (report.result.exitCategory === "failure") {
    return { permitted: false, reason: "mechanical-failure" };
  }
  return { permitted: true };
}

/**
 * 実行構成表から現在 Wave を特定する（投入順序に依存しない決定的導出）。
 * 現在 Wave は非終端（pending）行を含む最小 Wave 番号。全行が終端状態の場合は
 * null（反復完遂）。
 */
export function deriveCurrentWave(
  body: string,
): { currentWave: number | null; waves: readonly { wave: number; total: number; terminal: number }[] } {
  const rowLinePattern = /^\|\s*(\d+)\s*\|\s*#\d+\s*\|/;
  const waveStats = new Map<number, { total: number; terminal: number }>();
  for (const line of body.split("\n")) {
    const match = line.match(rowLinePattern);
    if (!match) continue;
    const wave = Number(match[1]);
    const cells = line.split("|");
    const statusIndex = cells.length - 2;
    const parsed = parseStatusCell(cells[statusIndex] ?? "");
    if (!parsed) continue;
    const stat = waveStats.get(wave) ?? { total: 0, terminal: 0 };
    stat.total += 1;
    if (parsed.status !== "pending") stat.terminal += 1;
    waveStats.set(wave, stat);
  }
  const waves = [...waveStats.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([wave, stat]) => ({ wave, total: stat.total, terminal: stat.terminal }));
  const current = waves.find((w) => w.terminal < w.total);
  return { currentWave: current ? current.wave : null, waves };
}

/** Epic 実行構成表の子状態更新を適用した本文候補を生成する（書込みはモデルが行う）。 */
export function applyEpicChildStatusUpdates(
  body: string,
  updates: readonly { issue: number; status: PersistedStatus }[],
): { body: string; applied: readonly number[]; skipped: readonly { issue: number; reason: string }[] } {
  let current = body;
  const applied: number[] = [];
  const skipped: { issue: number; reason: string }[] = [];
  for (const update of updates) {
    const existing = readChildStatus(current, update.issue);
    if (existing === null) {
      skipped.push({ issue: update.issue, reason: "row-not-found" });
      continue;
    }
    if (existing.status !== "pending") {
      skipped.push({ issue: update.issue, reason: `already-${existing.status}` });
      continue;
    }
    const replaced = replaceChildStatus(current, update.issue, update.status);
    if (replaced === null) {
      skipped.push({ issue: update.issue, reason: "replace-failed" });
      continue;
    }
    current = replaced;
    applied.push(update.issue);
  }
  return { body: current, applied, skipped };
}

/** 報告 JSON を組み立てる（実行結果・差分・警告・提案本文の4要素）。 */
export function assembleReport(
  phase: CloseMechanicalInput["phase"],
  steps: readonly StepRecord[],
  diff: Record<string, unknown>,
  warnings: readonly string[],
  proposal: Record<string, string>,
): CloseMechanicalReport {
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

/** 報告から終了コードを決定する（成功 0、要判断 2、失敗 1）。 */
export function decideExitCode(report: CloseMechanicalReport): number {
  if (report.result.exitCategory === "failure") return 1;
  if (report.result.exitCategory === "needs-judgment") return 2;
  return 0;
}

function runSpec(runner: MechanicalRunner, spec: GateCommandSpec): CommandResult {
  return runner.run({ command: spec.command, args: spec.args, cwd: spec.cwd, timeoutMs: spec.timeoutMs });
}

function runAcceptanceEvaluation(
  input: CloseMechanicalInput,
  population: ConditionPopulation,
  steps: StepRecord[],
): AcceptanceEvaluationReport {
  if (input.acceptanceVerdicts === undefined) {
    // 判定入力未提供時は受入評価は未確定（未確定は終了操作の前提を満たさない）。
    return { determined: false, population };
  }
  const evaluation = evaluateFinalAcceptance({
    subjectKind: input.acceptanceSubjectKind ?? "child-issue",
    population,
    verdicts: input.acceptanceVerdicts,
    crossObligations: input.acceptanceCrossObligations,
  });
  steps.push({
    name: "final-acceptance-evaluation",
    status: evaluation.closeAllowed ? "pass" : "fail",
    detail: {
      subjectKind: input.acceptanceSubjectKind ?? "child-issue",
      closeAllowed: evaluation.closeAllowed,
      populationState: evaluation.populationState,
      violations: evaluation.violations,
      blockingUnmet: evaluation.blockingUnmet,
      blockingCrossObligations: evaluation.blockingCrossObligations,
    },
  });
  return {
    determined: true,
    population,
    closeAllowed: evaluation.closeAllowed,
    populationState: evaluation.populationState,
    violations: evaluation.violations,
    blockingUnmet: evaluation.blockingUnmet,
    blockingCrossObligations: evaluation.blockingCrossObligations,
  };
}

/** 機械工程を実行し、報告 JSON を返す（省略なし。失敗時は fail step を含める）。 */
export function runCloseMechanicalSteps(
  input: CloseMechanicalInput,
  runner: MechanicalRunner,
): CloseMechanicalReport {
  const steps: StepRecord[] = [];
  const warnings: string[] = [];
  const diff: Record<string, unknown> = {};
  const proposal: Record<string, string> = {};
  const worktreeCwd = path.resolve(input.repoRoot, input.worktreeRoot);

  if (input.phase === "pre-merge") {
    const polling = input.mergeablePolling ?? { intervalSeconds: 10, maxAttempts: 30 };
    let mergeable = "UNKNOWN";
    let attempts = 0;
    for (; attempts < polling.maxAttempts; attempts++) {
      const view = runner.run({
        command: "gh",
        args: ["pr", "view", String(input.prNumber), "--json", "mergeable,mergeStateStatus,state"],
        cwd: input.repoRoot,
      });
      if (view.exitCode !== 0) {
        steps.push({ name: "mergeable-polling", status: "fail", detail: { error: view.stderr.trim() } });
        return assembleReport(input.phase, steps, diff, warnings, proposal);
      }
      const parsed = JSON.parse(view.stdout) as { mergeable?: string };
      mergeable = parsed.mergeable ?? "UNKNOWN";
      if (mergeable === "MERGEABLE") break;
      if (mergeable === "CONFLICTING") break;
      runner.sleep(polling.intervalSeconds * 1000);
    }
    steps.push({
      name: "mergeable-polling",
      status: mergeable === "MERGEABLE" ? "pass" : "warn",
      detail: { mergeable, attempts: attempts + 1 },
    });
    if (mergeable !== "MERGEABLE") {
      warnings.push(`mergeable state is ${mergeable} after polling (要判断)`);
    }

    const status = runner.run({ command: "git", args: ["status", "--porcelain"], cwd: worktreeCwd });
    const branch = runner.run({ command: "git", args: ["branch", "--show-current"], cwd: worktreeCwd });
    const dirty = status.stdout.trim().length > 0;
    const branchOk = branch.stdout.trim() === input.branch;
    steps.push({
      name: "pre-merge-local-state-check",
      status: dirty || !branchOk ? "fail" : "pass",
      detail: { worktreeDirty: dirty, currentBranch: branch.stdout.trim(), expectedBranch: input.branch },
    });
    if (dirty) warnings.push("worktree has uncommitted changes before squash merge");
    if (!branchOk) warnings.push("worktree is not on the expected branch");

    let extraction: ReturnType<typeof extractCompletionCheckboxes> | null = null;
    if (input.issueBodyPath) {
      // CRLF→LF 正規化の前置。Windows CRLF 既定環境で issueBodyPath ファイルが
      // CRLF で書き出されても checkbox 認識が欠落しないようにするため、
      // 読取直後（checkbox 抽出前）のこの位置で入力契約を満たす。
      const body = runner.readTextFile(input.issueBodyPath).replace(/\r\n/g, "\n");
      extraction = extractCompletionCheckboxes(body);
      steps.push({
        name: "completion-checkbox-extraction",
        status: "pass",
        detail: { total: extraction.total, checked: extraction.checked },
      });
      proposal.completion_checkboxes = JSON.stringify(extraction.items, null, 2);
    } else {
      steps.push({
        name: "completion-checkbox-extraction",
        status: "fail",
        detail: { reason: "issueBodyPath is required for machine extraction" },
      });
    }

    // 抽出フェーズが受入評価の母集団導出を兼ねる。抽出失敗は
    // extractionSucceeded: false の母集団になり、受入評価で fail-closed に
    // 拒否される（空の抽出を「条件なし」へ変換しない）。
    const acceptancePopulation = deriveAcceptancePopulation(
      extraction,
      input.acceptanceEmptyBasis,
    );
    diff.acceptanceEvaluation = runAcceptanceEvaluation(
      input,
      acceptancePopulation,
      steps,
    );

    if (input.generateIndexesGate) {
      const gen = runSpec(runner, input.generateIndexesGate);
      const derivedPaths = input.autogenDerivedPaths ?? [];
      let diffOutput = "";
      if (gen.exitCode === 0) {
        const gitDiff = runner.run({
          command: "git",
          args: ["diff", "--stat", "--", ...derivedPaths],
          cwd: worktreeCwd,
        });
        diffOutput = gitDiff.stdout.trim();
        if (diffOutput.length > 0) {
          runner.run({ command: "git", args: ["checkout", "--", ...derivedPaths], cwd: worktreeCwd });
          warnings.push("AUTOGEN derived files differ after regeneration (restore applied). Regenerate and include in the PR before merge");
        }
      }
      steps.push({
        name: "autogen-regeneration-diff",
        status: gen.exitCode === 0 ? (diffOutput.length > 0 ? "warn" : "pass") : "fail",
        detail: { exitCode: gen.exitCode, diffStat: diffOutput },
      });
      diff.autogenRegeneration = { exitCode: gen.exitCode, diffStat: diffOutput };
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
    }

    const integrityResults: Record<string, { exitCode: number; stdout: string }> = {};
    let integrityFail = false;
    for (const gate of input.integrityGates ?? []) {
      const result = runSpec(runner, gate);
      integrityResults[gate.name] = { exitCode: result.exitCode, stdout: result.stdout };
      if (result.exitCode !== 0) integrityFail = true;
    }
    steps.push({
      name: "full-integrity-suite",
      status: integrityFail ? "fail" : "pass",
      detail: integrityResults,
    });

    if (input.textlintGate) {
      const lint = runSpec(runner, input.textlintGate);
      steps.push({
        name: "textlint-final-check",
        status: lint.exitCode === 0 ? "pass" : "fail",
        detail: { exitCode: lint.exitCode, stderrTail: lint.stderr.trim().slice(-400) },
      });
    }

    if (input.epicBodyPath && input.epicChildStatusUpdates) {
      const epicBody = runner.readTextFile(input.epicBodyPath);
      const waveInfo = deriveCurrentWave(epicBody);
      const applied = applyEpicChildStatusUpdates(epicBody, input.epicChildStatusUpdates);
      steps.push({
        name: "epic-table-analysis",
        status: applied.skipped.length > 0 ? "warn" : "pass",
        detail: {
          currentWave: waveInfo.currentWave,
          waves: waveInfo.waves,
          applied: applied.applied,
          skipped: applied.skipped,
          terminalCounts: countChildStatuses(epicBody),
        },
      });
      proposal.epic_body = applied.body;
      if (applied.skipped.length > 0) {
        warnings.push(
          `epic child status update skipped: ${applied.skipped.map((s) => `#${s.issue}(${s.reason})`).join(", ")}`,
        );
      }
    }
  } else {
    const removed = runner.run({
      command: "git",
      args: ["worktree", "remove", worktreeCwd],
      cwd: input.repoRoot,
    });
    let branchDeleted: CommandResult | null = null;
    if (input.cleanup?.removeBranch) {
      branchDeleted = runner.run({
        command: "git",
        args: ["branch", "-d", input.cleanup.removeBranch],
        cwd: input.repoRoot,
      });
    }
    const branchGone = runner.run({
      command: "git",
      args: ["branch", "--list", input.branch],
      cwd: input.repoRoot,
    });
    const cleanupOk =
      (input.cleanup?.removeWorktree === false || removed.exitCode === 0) &&
      (branchDeleted === null || branchDeleted.exitCode === 0) &&
      branchGone.stdout.trim().length === 0;
    steps.push({
      name: "post-merge-local-state-check",
      status: "pass",
      detail: { postMerge: true, repoRoot: input.repoRoot },
    });
    steps.push({
      name: "cleanup-worktree-branch",
      status: cleanupOk ? "pass" : "warn",
      detail: {
        worktreeRemoveExitCode: removed.exitCode,
        branchDeleteExitCode: branchDeleted?.exitCode ?? null,
        branchListOutput: branchGone.stdout.trim(),
      },
    });
    if (!cleanupOk) warnings.push("worktree/branch cleanup did not fully complete (要判断)");
  }

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
    const repoRootAbsolute = path.resolve(validated.repoRoot);
    const normalized: CloseMechanicalInput = { ...validated, repoRoot: repoRootAbsolute };
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
      sleep(ms) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
      },
    };
    const report = runCloseMechanicalSteps(normalized, runner);
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
