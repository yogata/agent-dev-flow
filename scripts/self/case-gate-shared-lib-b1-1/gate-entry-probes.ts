// B1-1（Issue #4014・委譲 DEL-4014-1）特性化テスト用の runner 注入プローブ。
//
// 3入口実装を MechanicalRunner 注入で起動し、ゲート呼び出しの対象・順序・条件・
// 結果解釈と失敗分岐の副作用なしを観測するための最小構成を提供する。
// 本プローブは入口実装の公開エクスポート（runPrepareDefinitionPr 等）だけに
// 依存し、内部実装には依存しない。テスト本体は characterization.test.ts。

import * as path from "node:path";
import { REPO_ROOT } from "./characterization-lib.ts";

import {
  runPrepareDefinitionPr,
  runValidateInputOnly,
  validateInput,
  type CommandResult,
  type GateCommandSpec,
  type MechanicalRunner,
  type PrepareDefinitionPrInput,
} from "../../../src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts";

import {
  runAcceptDefinitionChecks,
  type AcceptDefinitionInput,
} from "../../../src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts";

import {
  runCloseMechanicalSteps,
  type CloseMechanicalInput,
} from "../../../src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts";

import { traceabilityReport } from "../../../src/common/skills/agentdev-workflow-case-open/scripts/tests/traceability-report-fixture.ts";

export const PROBE_WORKTREE_ROOT = ".worktrees/del4014-probe-wt";

export interface ProbeGateCall {
  gate: string;
  command: string;
  args: readonly string[];
  cwd: string;
}

function probeGateSpec(name: string, extraArgs: readonly string[] = []): GateCommandSpec {
  return {
    name,
    command: "bun",
    args: [".agentdev/tmp/del4014-char/fixture-gate.ts", "--gate", name, ...extraArgs],
    cwd: REPO_ROOT,
    timeoutMs: 60000,
  };
}

/** gate 実行の stdout（traceability-check は正規 fixture 契約の checker 報告を返す）。 */
function gateStdout(args: readonly string[]): string {
  const gate = args[args.indexOf("--gate") + 1] ?? "";
  if (gate !== "traceability-check") return "";
  return traceabilityReport(["REQ-000-001"]);
}

export interface PrepareProbeResult {
  report: ReturnType<typeof runPrepareDefinitionPr>;
  gateCalls: readonly ProbeGateCall[];
  gitCalls: readonly ProbeGateCall[];
  writes: readonly string[];
}

/** prepare の正常系（worktree 新規作成 → 編集 → ゲート3連 → stage・commit）。 */
export function runPrepareHappyPath(): PrepareProbeResult {
  const gateCalls: ProbeGateCall[] = [];
  const gitCalls: ProbeGateCall[] = [];
  const writes: string[] = [];
  const input: PrepareDefinitionPrInput = {
    repoRoot: REPO_ROOT,
    worktreeRoot: PROBE_WORKTREE_ROOT,
    branch: "definition/issue-10",
    baseRef: "origin/main",
    rootCaseId: "#10",
    definitionEdits: [
      {
        path: "docs/probe-target.md",
        oldText: "| REQ-NNNN-010 | old |\n",
        newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n",
      },
    ],
    requiresIndexRegeneration: true,
    stagePaths: ["docs/probe-target.md"],
    commitMessage: "probe commit",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: probeGateSpec("generate_indexes"),
    checkIntegrityGate: probeGateSpec("check_integrity"),
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
  };
  const runner: MechanicalRunner = {
    run(spec) {
      const call: ProbeGateCall = { gate: spec.args[spec.args.indexOf("--gate") + 1] ?? "", command: spec.command, args: spec.args, cwd: spec.cwd };
      if (spec.command === "git") {
        gitCalls.push(call);
        if (spec.args[0] === "worktree" && spec.args[1] === "list") {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        if (spec.args[0] === "rev-parse") {
          return { exitCode: 0, stdout: "def0123\n", stderr: "" };
        }
        return { exitCode: 0, stdout: "", stderr: "" };
      }
      gateCalls.push(call);
      return { exitCode: 0, stdout: gateStdout(spec.args), stderr: "" };
    },
    readTextFile(absolutePath) {
      void absolutePath;
      return "| REQ-NNNN-010 | old |\n";
    },
    writeTextFile(absolutePath, content) {
      writes.push(`${absolutePath} (${content.length} chars)`);
    },
    exists() {
      return true;
    },
  };
  const report = runPrepareDefinitionPr(input, runner);
  return { report, gateCalls, gitCalls, writes };
}

/** prepare の gate 不在失敗分岐（git 操作に到達しない）。 */
export function runPrepareMissingGate(): { report: ReturnType<typeof runPrepareDefinitionPr>; allCalls: readonly ProbeGateCall[] } {
  const allCalls: ProbeGateCall[] = [];
  const missing = { ...probeGateSpec("check_integrity"), args: [".agentdev/tmp/del4014-char/missing-gate.ts", "--gate", "check_integrity"] };
  const input: PrepareDefinitionPrInput = {
    repoRoot: REPO_ROOT,
    worktreeRoot: PROBE_WORKTREE_ROOT,
    branch: "definition/issue-10",
    baseRef: "origin/main",
    rootCaseId: "#10",
    definitionEdits: [
      {
        path: "docs/probe-target.md",
        oldText: "| REQ-NNNN-010 | old |\n",
        newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n",
      },
    ],
    requiresIndexRegeneration: true,
    stagePaths: ["docs/probe-target.md"],
    commitMessage: "probe commit",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: probeGateSpec("generate_indexes"),
    checkIntegrityGate: missing,
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
  };
  const runner: MechanicalRunner = {
    run(spec) {
      allCalls.push({ gate: spec.args[spec.args.indexOf("--gate") + 1] ?? "", command: spec.command, args: spec.args, cwd: spec.cwd });
      return { exitCode: 0, stdout: "", stderr: "" };
    },
    readTextFile() {
      return "";
    },
    writeTextFile(absolutePath) {
      allCalls.push({ gate: "(write)", command: "(write)", args: [absolutePath], cwd: "" });
    },
    exists(absolutePath) {
      return !absolutePath.includes("missing-gate");
    },
  };
  const report = runPrepareDefinitionPr(input, runner);
  return { report, allCalls };
}

export function validateInputOnlyHappy(exists: (p: string) => boolean) {
  const input = validateInput({
    repoRoot: REPO_ROOT,
    worktreeRoot: PROBE_WORKTREE_ROOT,
    branch: "definition/issue-10",
    baseRef: "origin/main",
    rootCaseId: "#10",
    definitionEdits: [
      {
        path: "docs/probe-target.md",
        oldText: "| REQ-NNNN-010 | old |\n",
        newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n",
      },
    ],
    stagePaths: ["docs/probe-target.md"],
    commitMessage: "probe",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: probeGateSpec("generate_indexes"),
    checkIntegrityGate: probeGateSpec("check_integrity"),
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
  });
  return runValidateInputOnly(input, exists);
}

export function validateInputOnlyMissing(exists: (p: string) => boolean) {
  const input = validateInput({
    repoRoot: REPO_ROOT,
    worktreeRoot: PROBE_WORKTREE_ROOT,
    branch: "definition/issue-10",
    baseRef: "origin/main",
    rootCaseId: "#10",
    definitionEdits: [
      {
        path: "docs/probe-target.md",
        oldText: "| REQ-NNNN-010 | old |\n",
        newText: "| REQ-NNNN-010 | old |\n| REQ-NNNN-011 | new |\n",
      },
    ],
    stagePaths: ["docs/probe-target.md"],
    commitMessage: "probe",
    traceabilityReqIds: ["REQ-000-001"],
    generateIndexesGate: probeGateSpec("generate_indexes"),
    checkIntegrityGate: probeGateSpec("check_integrity"),
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
  });
  const withMissingGate: PrepareDefinitionPrInput = {
    ...input,
    checkIntegrityGate: { ...probeGateSpec("check_integrity"), args: [".agentdev/tmp/del4014-char/missing-gate.ts", "--gate", "check_integrity"] },
  };
  return runValidateInputOnly(withMissingGate, exists);
}

export interface AcceptProbeResult {
  report: ReturnType<typeof runAcceptDefinitionChecks>;
  gateCalls: readonly ProbeGateCall[];
}

/** accept の正常系（acceptance-checks phase）。 */
export function runAcceptHappyPath(): AcceptProbeResult {
  const gateCalls: ProbeGateCall[] = [];
  const input: AcceptDefinitionInput = {
    phase: "acceptance-checks",
    repoRoot: REPO_ROOT,
    branch: "definition/issue-10",
    prNumber: 20,
    integrityGates: [probeGateSpec("check_integrity")],
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
    overlapGate: probeGateSpec("overlap-cross-check"),
    generateIndexesGate: probeGateSpec("generate_indexes"),
    autogenDerivedPaths: ["docs/README.md"],
  };
  const runner = {
    run(spec: { command: string; args: readonly string[]; cwd: string }): CommandResult {
      const gate = spec.args[spec.args.indexOf("--gate") + 1] ?? "";
      const call: ProbeGateCall = { gate, command: spec.command, args: spec.args, cwd: spec.cwd };
      if (spec.command === "git") {
        if (spec.args[0] === "rev-parse") {
          return { exitCode: 0, stdout: "abc456\n", stderr: "" };
        }
        return { exitCode: 0, stdout: "", stderr: "" };
      }
      gateCalls.push(call);
      let stdout = gateStdout(spec.args);
      if (gate === "overlap-cross-check") {
        stdout = JSON.stringify({ condition_a: { warnings: [] }, detection_unavailable: [] });
      }
      return { exitCode: 0, stdout, stderr: "" };
    },
    exists() {
      return true;
    },
  };
  const report = runAcceptDefinitionChecks(input, runner);
  return { report, gateCalls };
}

/** accept の gate 不在失敗分岐（git 操作に到達しない）。 */
export function runAcceptMissingGate(): { report: ReturnType<typeof runAcceptDefinitionChecks>; allCalls: readonly ProbeGateCall[] } {
  const allCalls: ProbeGateCall[] = [];
  const input: AcceptDefinitionInput = {
    phase: "acceptance-checks",
    repoRoot: REPO_ROOT,
    branch: "definition/issue-10",
    prNumber: 20,
    integrityGates: [
      { ...probeGateSpec("check_integrity"), args: [".agentdev/tmp/del4014-char/missing-gate.ts", "--gate", "check_integrity"] },
    ],
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
    overlapGate: probeGateSpec("overlap-cross-check"),
    generateIndexesGate: probeGateSpec("generate_indexes"),
  };
  const runner = {
    run(spec: { command: string; args: readonly string[]; cwd: string }): CommandResult {
      allCalls.push({ gate: spec.args[spec.args.indexOf("--gate") + 1] ?? "", command: spec.command, args: spec.args, cwd: spec.cwd });
      return { exitCode: 0, stdout: "", stderr: "" };
    },
    exists(absolutePath: string) {
      return !absolutePath.includes("missing-gate");
    },
  };
  const report = runAcceptDefinitionChecks(input, runner);
  return { report, allCalls };
}

/** close の pre-merge gate 不在失敗分岐（外部コマンドに到達しない）。 */
export function runCloseMissingGatePreMerge(): {
  report: ReturnType<typeof runCloseMechanicalSteps>;
  externalCalls: readonly ProbeGateCall[];
} {
  const externalCalls: ProbeGateCall[] = [];
  const input: CloseMechanicalInput = {
    phase: "pre-merge",
    worktreeRoot: ".worktrees/del4014-probe-wt",
    repoRoot: REPO_ROOT,
    branch: "feature/issue-4014",
    prNumber: 0,
    generateIndexesGate: probeGateSpec("generate_indexes"),
    traceabilityGate: probeGateSpec("traceability-check", ["--req", "REQ-000-001"]),
    integrityGates: [
      { ...probeGateSpec("full-integrity-suite"), args: [".agentdev/tmp/del4014-char/missing-gate.ts", "--gate", "full-integrity-suite"] },
    ],
    textlintGate: probeGateSpec("textlint-final-check"),
    issueBodyPath: ".agentdev/tmp/del4014-char/issue-body.md",
    issueUpdatedAt: "2026-11-11T00:00:00.000Z",
    issueNumber: 4014,
    contractStateCheck: { contractStatePaths: ["docs/probe-target.md"], approvalEntries: ["- probe condition"] },
  };
  const runner = {
    run(spec: { command: string; args: readonly string[]; cwd: string }): CommandResult {
      externalCalls.push({ gate: spec.args[spec.args.indexOf("--gate") + 1] ?? "", command: spec.command, args: spec.args, cwd: spec.cwd });
      return { exitCode: 0, stdout: "", stderr: "" };
    },
    readTextFile(absolutePath: string) {
      void absolutePath;
      return "";
    },
    sleep(_ms: number) {},
    exists(absolutePath: string) {
      return !absolutePath.includes("missing-gate");
    },
    writeTextFile(absolutePath: string, content: string) {
      void absolutePath;
      void content;
    },
    mkdirRecursive(absolutePath: string) {
      void absolutePath;
    },
    gitCommonDir() {
      return `${path.join(REPO_ROOT, ".git")}/`;
    },
  };
  const report = runCloseMechanicalSteps(input, runner);
  return { report, externalCalls };
}

export const lastPreparedWrites: readonly string[] = [];
