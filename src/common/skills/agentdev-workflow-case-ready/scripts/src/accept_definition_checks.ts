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
// 実装は inspect_cross_dependencies.ts と同じ作り（工程別個別 script）であり、
// ゲート実行体の解決と可用性検査、引数検査、--validate-input 相当の入力検査実行
// など反復可能な機械処理に限り agentdev-artifact-validation 所有の共有 lib を
// supported lib interface 経由で利用する。工程固有のゲート選択・順序・実行条件・
// 結果解釈は本入口が所有し続ける。overlap 突合は case-open スキル配下の共有単一実装
// （agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts）を
// 呼び出して再利用し、比較ロジックを再実装しない。
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { consumeDefinitionTraceability, isReqRowId, REQ_ROW_ID_LIST_PATTERN, type DeferredObligation } from "../../../agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts";
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
  type GateExecutionEvidence,
  type KnownArgContract,
  type KnownTraceabilityGateInput,
} from "../lib/gate-execution.ts";
// 正規所有1点（agentdev-artifact-validation scripts/lib/gate-execution.ts）への再エクスポート。
// 入口の公開名と単体テストの import 名を維持する（supported lib interface 経由）。
export {
  buildGateEvidence,
  buildKnownGenerateIndexesSpec,
  buildKnownOverlapCheckSpec,
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
  KnownOverlapGateInput,
  KnownTraceabilityGateInput,
  KnownWorkflowGateInput,
} from "../lib/gate-execution.ts";

const USAGE = `usage: bun ./src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts --input <input.json> [--validate-input]
  --input           機械工程入力 JSON（phase、品質ゲート実行仕様、削除対象パス等）
  --validate-input  検証専用経路。入力 JSON の契約検証・既知 gate 引数契約検査・ゲート実行体の
                    存在確認のみを行い（worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル
                    変更なし）、報告 JSON を stdout へ出力する（合格 0 / 不合格 1）`;

/** script が外部処理を呼び出す経路。単体テストでは偽 runner を注入する。 */
export interface MechanicalRunner {
  run(spec: CommandSpec): CommandResult;
  exists(absolutePath: string): boolean;
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
  validated: AcceptDefinitionInput,
  exists: (absolutePath: string) => boolean,
): { ok: boolean; report: Record<string, unknown> } {
  const gates = [
    ...(validated.integrityGates ?? []),
    validated.traceabilityGate,
    validated.overlapGate,
    validated.generateIndexesGate,
  ].filter((gate): gate is GateCommandSpec => gate != null);
  return runGatePreValidation("accept_definition_checks", gates, KNOWN_GATE_ARG_CONTRACTS, exists);
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
export function buildKnownTraceabilityCheckSpec(input: KnownTraceabilityGateInput): GateCommandSpec {
  return sharedBuildKnownTraceabilityCheckSpec(input, isReqRowId);
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
