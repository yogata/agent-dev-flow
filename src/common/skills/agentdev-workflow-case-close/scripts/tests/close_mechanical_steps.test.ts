import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";

import {
  applyEpicChildStatusUpdates,
  assembleReport,
  classifyResourceRole,
  DECLARED_DETECTION_SCOPES,
  decideExitCode,
  deriveAcceptanceGaps,
  deriveAcceptancePopulation,
  deriveCurrentWave,
  evaluateContractStateResidue,
  evaluateIntegrityMachineAcceptance,
  extractCompletionCheckboxes,
  isCloseOperationPermitted,
  REQUIRED_INSPECTION_SCOPES,
  resolveCloseAcceptanceRecordPath,
  runCloseMechanicalSteps,
  validateInput,
  type AcceptanceControlConnectionObservation,
  type CloseMechanicalInput,
  type CommandResult,
  type GateCommandSpec,
  type IntegrityFailureOrigin,
  type IntegrityMachineAcceptanceRecord,
  type MechanicalRunner,
  type InspectionCommandSpec,
  type VerificationResourceCheck,
} from "../src/close_mechanical_steps";
import type { ConditionPopulation, ConditionVerdict } from "../src/final-acceptance";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);
const testDirectories: string[] = [];

afterAll(() => {
  for (const directory of testDirectories) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function gate(name: string, cwd = "<repo>/.worktrees/100-case"): GateCommandSpec {
  return { name, command: "bun", args: ["./checker.ts", name], cwd, timeoutMs: 60000 };
}

function preMergeInput(overrides: Partial<CloseMechanicalInput> = {}): CloseMechanicalInput {
  return {
    phase: "pre-merge",
    worktreeRoot: ".worktrees/100-case",
    repoRoot: "<repo>",
    branch: "case-100",
    prNumber: 200,
    issueUpdatedAt: "2026-11-05T08:00:00Z",
    issueBodyPath: "<repo>/.agentdev/tmp/issue-body.md",
    generateIndexesGate: gate("generate_indexes"),
    traceabilityGate: gate("traceability-check"),
    integrityGates: [gate("check_integrity"), gate("check_autogen_freshness")],
    textlintGate: gate("textlint-final-check"),
    contractStateCheck: {
      contractStatePaths: [".agentdev/jev-observations", ".agentdev/learning/inbox.md"],
      approvalEntries: [],
    },
    verificationResourceCheck: {
      caseId: "3928",
      issueNumber: 3931,
      knownResidualEntries: [],
      deletionConfirmations: [],
      inspectionCommands: [
        inspectionCommand("dedicated-area-listing"),
        inspectionCommand("os-temp-area-scan"),
        inspectionCommand("process-liveness"),
        inspectionCommand("listen-port-check"),
        inspectionCommand("remote-absence-verification"),
      ],
    },
    ...overrides,
  };
}

function verificationResourceCheck(input: CloseMechanicalInput = preMergeInput()): VerificationResourceCheck {
  if (input.verificationResourceCheck === undefined) {
    throw new Error("test input must include verification resource reconciliation settings");
  }
  return input.verificationResourceCheck;
}

/** 検査コマンド仕様の標本（scope 名を args に含め、fakeRunner が scope 単位で応答する）。 */
function inspectionCommand(scope: string): InspectionCommandSpec & Pick<GateCommandSpec, "name"> {
  return {
    name: `verification-inspection-${scope}`,
    scope,
    command: "bun",
    args: ["./inspector.ts", scope],
    cwd: "<repo>",
  };
}

/** 台帳エントリの標本（verification-resources-ledger.ts の parseEntry 契約に準拠）。 */
function ledgerEntryJson(overrides: Partial<{
  id: string;
  kind: string;
  location: string;
  identifiers: Record<string, string>;
  ownership: string;
  childIssue: number | null;
  collectedAt: string | null;
  recordedBy: string;
  createdAt: string;
  registrationBasis: string;
}> = {}): Record<string, unknown> {
  return {
    id: "vr-3928-1",
    caseId: "3928",
    kind: "clone",
    location: "<repo>/tmp-area/verify-clone",
    identifiers: { path: "<repo>/tmp-area/verify-clone", repo: "example/verify-target" },
    collector: "case-run-delegation",
    ownership: "child",
    childIssue: 3931,
    recordedBy: "verification-resource-register",
    createdAt: "2026-11-05T09:00:00.000Z",
    collectedAt: null,
    ...overrides,
  };
}

function fakeRunner(overrides: {
  ghMergeable?: string;
  ghPrState?: string;
  worktreeStatus?: string;
  contractStateStatus?: string;
  contractStateStatusExit?: number;
  untrackedOutput?: string;
  untrackedExit?: number;
  gitignoredOutput?: string;
  currentBranch?: string;
  issueBody?: string;
  epicBody?: string;
  integrityExitCodes?: Record<string, number>;
  ledgerText?: string;
  ledgerMissing?: boolean;
  previousAcceptanceRecord?: string;
  acceptanceRecordIssueNumber?: number;
  remotesText?: string;
  worktreeListingText?: string;
  branchesText?: string;
  dedicatedAreaEntries?: readonly string[];
  osTempAreaMatches?: readonly string[];
  processLiveness?: Record<
    string,
    { alive: boolean; commandLine: string | null; parentPid?: string; startedAt?: string; cwd?: string }
  >;
  listenPorts?: Record<string, { listening: boolean }>;
  remoteAbsenceInputs?: Record<string, unknown>;
  inspectionExitCodes?: Record<string, number>;
  missingPaths?: readonly string[];
  processId?: number;
} = {}): MechanicalRunner & {
  calls: { command: string; args: readonly string[]; cwd: string }[];
  writes: { absolutePath: string; content: string }[];
  deletions: string[];
} {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  const writes: { absolutePath: string; content: string }[] = [];
  const deletions: string[] = [];
  const files = new Map<string, string>();
  const acceptanceRecordPath = path.join(
    "<repo>",
    ".agentdev",
    "close-acceptance",
    `issue-${overrides.acceptanceRecordIssueNumber ?? 3931}.json`,
  );
  if (overrides.previousAcceptanceRecord !== undefined) {
    files.set(acceptanceRecordPath, overrides.previousAcceptanceRecord);
  }
  return {
    calls,
    writes,
    deletions,
    exists(absolutePath) {
      if (files.has(absolutePath)) return true;
      if (absolutePath === acceptanceRecordPath) return false;
      if (absolutePath.includes("verification-resources") && overrides.ledgerMissing === true) {
        return false;
      }
      if (overrides.missingPaths?.includes(absolutePath)) return false;
      return true;
    },
    run(spec) {
      calls.push({ command: spec.command, args: spec.args, cwd: spec.cwd });
      const result: CommandResult = { exitCode: 0, stdout: "", stderr: "" };
      if (spec.command === "gh") {
        const ghPayload: { mergeable: string; state?: string } = {
          mergeable: overrides.ghMergeable ?? "MERGEABLE",
        };
        if (overrides.ghPrState !== undefined) ghPayload.state = overrides.ghPrState;
        result.stdout = JSON.stringify(ghPayload);
      }
      if (spec.command === "git" && spec.args[0] === "status") {
        result.stdout = spec.args.includes("--")
          ? (overrides.contractStateStatus ?? "")
          : (overrides.worktreeStatus ?? "");
        if (spec.args.includes("--")) result.exitCode = overrides.contractStateStatusExit ?? 0;
      }
      if (spec.command === "git" && spec.args[0] === "ls-files" && !spec.args.includes("-i")) {
        result.stdout = overrides.untrackedOutput ?? "";
        result.exitCode = overrides.untrackedExit ?? 0;
      }
      if (spec.command === "git" && spec.args[0] === "ls-files" && spec.args.includes("-i")) {
        result.stdout = overrides.gitignoredOutput ?? "";
      }
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--show-current") {
        result.stdout = overrides.currentBranch ?? "case-100";
      }
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--list") {
        result.stdout = spec.args.includes("--all") ? (overrides.branchesText ?? "") : "";
      }
      if (spec.command === "git" && spec.args[0] === "diff") {
        result.stdout = "";
      }
      if (spec.command === "git" && spec.args[0] === "remote") {
        result.stdout = overrides.remotesText ?? "";
      }
      if (spec.command === "git" && spec.args[0] === "worktree") {
        result.stdout = overrides.worktreeListingText ?? "";
      }
      if (spec.args.includes("dedicated-area-listing")) {
        result.stdout = JSON.stringify({ entries: overrides.dedicatedAreaEntries ?? [] });
      }
      if (spec.args.includes("os-temp-area-scan")) {
        result.stdout = JSON.stringify({ matches: overrides.osTempAreaMatches ?? [] });
      }
      if (spec.args.includes("process-liveness")) {
        result.stdout = JSON.stringify(overrides.processLiveness ?? {});
      }
      if (spec.args.includes("listen-port-check")) {
        result.stdout = JSON.stringify(overrides.listenPorts ?? {});
      }
      if (spec.args.includes("remote-absence-verification")) {
        result.stdout = JSON.stringify(overrides.remoteAbsenceInputs ?? {});
      }
      if (spec.args.includes("check_autogen_freshness")) {
        result.stdout = JSON.stringify({ compared: 4, changed: 0 });
      }
      for (const [gateName, exitCode] of Object.entries(overrides.integrityExitCodes ?? {})) {
        if (spec.args.includes(gateName)) result.exitCode = exitCode;
      }
      for (const [scope, exitCode] of Object.entries(overrides.inspectionExitCodes ?? {})) {
        if (spec.args.includes(scope)) result.exitCode = exitCode;
      }
      return result;
    },
    readTextFile(absolutePath) {
      const existingFile = files.get(absolutePath);
      if (existingFile !== undefined) return existingFile;
      if (absolutePath.includes("verification-resources")) return overrides.ledgerText ?? "[]";
      if (absolutePath.endsWith("issue-body.md")) return overrides.issueBody ?? "";
      if (absolutePath.endsWith("epic-body.md")) return overrides.epicBody ?? "";
      return "";
    },
    writeTextFile(absolutePath, content) {
      writes.push({ absolutePath, content });
      files.set(absolutePath, content);
    },
    removeFile(absolutePath) {
      deletions.push(absolutePath);
      files.delete(absolutePath);
    },
    mkdirRecursive() {},
    gitCommonDir() {
      return "<repo>/.git";
    },
    sleep() {},
    ...(overrides.processId !== undefined ? { processId: (): number => overrides.processId as number } : {}),
  };
}

describe("入力検証（品質ゲートの省略禁止）", () => {
  test("pre-merge で必須品質ゲートが欠落する入力を拒否する", () => {
    const base = preMergeInput() as unknown as Record<string, unknown>;
    for (const field of ["generateIndexesGate", "traceabilityGate", "textlintGate"]) {
      const broken = { ...base, [field]: undefined };
      expect(() => validateInput(broken)).toThrow(/omission forbidden/);
    }
    const noIntegrity = { ...base, integrityGates: [] };
    expect(() => validateInput(noIntegrity)).toThrow(/omission forbidden/);
    const noIssueBody = { ...base, issueBodyPath: undefined };
    expect(() => validateInput(noIssueBody)).toThrow(/omission forbidden/);
    const noContractStateCheck = { ...base, contractStateCheck: undefined };
    expect(() => validateInput(noContractStateCheck)).toThrow(/omission forbidden/);
  });

  test("契約状態記録検査の入力形式違反を拒否する", () => {
    const base = preMergeInput() as unknown as Record<string, unknown>;
    const badPaths = {
      ...base,
      contractStateCheck: { contractStatePaths: [""], approvalEntries: [] },
    };
    expect(() => validateInput(badPaths)).toThrow(/contractStatePaths/);
    const badEntries = {
      ...base,
      contractStateCheck: {
        contractStatePaths: [".agentdev/jev-observations"],
        approvalEntries: [null],
      },
    };
    expect(() => validateInput(badEntries)).toThrow(/approvalEntries/);
    const badConfirmed = {
      ...base,
      contractStateCheck: {
        contractStatePaths: [".agentdev/jev-observations"],
        approvalEntries: [],
        humanConfirmedPaths: [{ path: "stray.txt" }],
      },
    };
    expect(() => validateInput(badConfirmed)).toThrow(/humanConfirmedPaths/);
  });

  test("必須品質ゲートが揃った入力を受領する", () => {
    const validated = validateInput(preMergeInput() as unknown as Record<string, unknown>);
    expect(validated.phase).toBe("pre-merge");
  });
});

describe("件数突合 gate の報告保持", () => {
  test("gate の stdout 報告を機械工程レポートに含める", () => {
    const report = runCloseMechanicalSteps(preMergeInput(), fakeRunner());
    const integrity = report.result.steps.find((step) => step.name === "full-integrity-suite");
    expect(integrity?.detail).toMatchObject({
      check_autogen_freshness: { exitCode: 0, stdout: JSON.stringify({ compared: 4, changed: 0 }) },
    });
  });
});

describe("契約状態記録・未追跡残存検査（完了判定工程）", () => {
  test("決定的判定: 状態記録配下・承認一覧・人間確認済み・帰属不能の4分類", () => {
    const evaluation = evaluateContractStateResidue(
      {
        contractStatePaths: [".agentdev/jev-observations"],
        approvalEntries: [".agentdev/intake/inbox"],
        humanConfirmedPaths: [
          { path: "notes/stray.txt", basis: "Issue #100 コメントで本 Case 無関係と確認" },
        ],
      },
      "?? .agentdev/jev-observations/obs-1.json\n",
      [
        ".agentdev/jev-observations/obs-1.json",
        ".agentdev/intake/inbox/item-a.md",
        "notes/stray.txt",
        "notes/unattributed.txt",
      ].join("\n"),
    );
    expect(evaluation.committed).toBe(false);
    expect(evaluation.uncommittedStateRecords).toEqual([".agentdev/jev-observations/obs-1.json"]);
    expect(evaluation.approvedAllowances).toEqual([
      { path: ".agentdev/intake/inbox/item-a.md", entry: ".agentdev/intake/inbox" },
    ]);
    expect(evaluation.humanConfirmed).toEqual([
      { path: "notes/stray.txt", basis: "Issue #100 コメントで本 Case 無関係と確認" },
    ]);
    expect(evaluation.humanConfirmationItems).toEqual(["notes/unattributed.txt"]);
    expect(evaluation.untrackedTotal).toBe(4);
  });

  test("決定的判定: 状態記録パスが空の場合は commit 済み判定を空振りさせない（導出範囲は入力側の意味判断）", () => {
    const evaluation = evaluateContractStateResidue(
      { contractStatePaths: [], approvalEntries: [] },
      "",
      "notes/unattributed.txt\n",
    );
    expect(evaluation.committed).toBe(true);
    expect(evaluation.humanConfirmationItems).toEqual(["notes/unattributed.txt"]);
  });

  test("実経路: リポジトリ全体の未追跡対象と状態記録を検査し、外部制限の未達は受入gapチャネルで別に報告する", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n" });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("pass");
    const statusCall = runner.calls.find(
      (c) => c.command === "git" && c.args[0] === "status" && c.args.includes("--"),
    );
    expect(statusCall?.cwd).toBe("<repo>");
    expect(statusCall?.args).toEqual([
      "status",
      "--porcelain",
      "--",
      ".agentdev/jev-observations",
      ".agentdev/learning/inbox.md",
    ]);
    const untrackedCall = runner.calls.find(
      (c) => c.command === "git" && c.args[0] === "ls-files" && !c.args.includes("-i"),
    );
    expect(untrackedCall?.cwd).toBe("<repo>");
    expect(untrackedCall?.args).toEqual(["ls-files", "--others", "--exclude-standard"]);
    expect(report.result.exitCategory).toBe("success");
    expect(report.diff.acceptanceGaps).toHaveLength(0);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 未コミット契約状態記録の検出時は失敗で完了扱いにしない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      contractStateStatus: "?? .agentdev/jev-observations/obs-1.json\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "mechanical-failure",
    });
    const residue = report.diff.contractStateResidue as { uncommittedStateRecords: string[] };
    expect(residue.uncommittedStateRecords).toEqual([".agentdev/jev-observations/obs-1.json"]);
  });

  test("実経路: 帰属不能の未追跡残存は人間確認事項として報告し、確認なしに完了判定へ進めない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      untrackedOutput: "stray.txt\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("fail");
    const residue = report.diff.contractStateResidue as { humanConfirmationItems: string[] };
    expect(residue.humanConfirmationItems).toEqual(["stray.txt"]);
    expect(
      report.warnings.some((w) => w.includes("requires human confirmation")),
    ).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 人間確認済み記録が揃った再実行では同一実経路の再検証で通過する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      untrackedOutput: "stray.txt\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        contractStateCheck: {
          contractStatePaths: [".agentdev/jev-observations", ".agentdev/learning/inbox.md"],
          approvalEntries: [],
          humanConfirmedPaths: [
            { path: "stray.txt", basis: "対応記録コメントで本 Case 由来・起票済みと確認" },
          ],
        },
      }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("pass");
    const residue = report.diff.contractStateResidue as {
      humanConfirmed: { path: string; basis: string }[];
      humanConfirmationItems: string[];
    };
    expect(residue.humanConfirmed).toEqual([
      { path: "stray.txt", basis: "対応記録コメントで本 Case 由来・起票済みと確認" },
    ]);
    expect(residue.humanConfirmationItems).toEqual([]);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 承認一覧対象の未追跡検出は承認記録として報告し、対象外残存とは分離する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      untrackedOutput: "sandbox/keep.txt\nnotes.txt\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        contractStateCheck: {
          contractStatePaths: [".agentdev/jev-observations", ".agentdev/learning/inbox.md"],
          approvalEntries: ["sandbox"],
        },
      }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("fail");
    const residue = report.diff.contractStateResidue as {
      approvedAllowances: { path: string; entry: string }[];
      humanConfirmationItems: string[];
    };
    expect(residue.approvedAllowances).toEqual([{ path: "sandbox/keep.txt", entry: "sandbox" }]);
    expect(residue.humanConfirmationItems).toEqual(["notes.txt"]);
  });

  test("実経路: 検査対象 git コマンドの失敗は fail-closed で完了操作を抑止する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      untrackedExit: 128,
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "contract-state-residue-check");
    expect(step?.status).toBe("fail");
    expect((step?.detail as { gitCheckOk: boolean }).gitCheckOk).toBe(false);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// full integrity suite の機械受理基準（受理由件に従う判定と拒否経路の維持）
// ---------------------------------------------------------------------------

/**
 * 機械受理基準の記録実体（受理由件1〜10）を完備させた標本。
 * boolean 申告ではなく実体（確認結果、実行記録、環境ラベル3要素、件数、baseline、版）を持つ。
 */
function completeMachineAcceptanceRecord(
  overrides: Partial<IntegrityMachineAcceptanceRecord> = {},
): IntegrityMachineAcceptanceRecord {
  return {
    failureOrigins: [],
    observedFailCounts: [],
    runnerConstitution: {
      confirmedRunner: "bun test",
      basis: "package.json scripts.test = bun test を確認し正規ランナーと判定",
    },
    suiteRunRecords: [
      {
        split: "分割①",
        command: "bun test ./src/common/skills/",
        cwd: "<repo>",
        testCountSummary: "Ran 2909 tests across 96 files",
        exitCode: 0,
        scope: "./src/common/skills/",
      },
      {
        split: "分割②",
        command: "bun test ./.opencode/skills/repo-agentdev-integrity/scripts/",
        cwd: "<repo>",
        testCountSummary: "Ran 592 tests across 12 files",
        exitCode: 0,
        scope: "./.opencode/skills/repo-agentdev-integrity/scripts/",
      },
      {
        split: "分割③",
        command: "bun test ./.opencode/plugins/ ./scripts/",
        cwd: "<repo>",
        testCountSummary: "Ran 348 tests across 20 files",
        exitCode: 0,
        scope: "./.opencode/plugins/ ./scripts/",
      },
    ],
    environmentLabel: {
      runtime: "Windows / bash",
      junctionPropagation: "repo-* のみ伝播、agentdev-* 未伝播",
      dependencies: "bun install 済み（bun.lock 固定版）",
    },
    baselineReferenceCommit: "7bc435b76d20f74018bb8a32a746e2e1bf5abd60",
    runnerVersion: "bun 1.2.23",
    ...overrides,
  };
}

/** pre-existing 分類済み fail の標本（baseline 再現確認と登録所在の実体参照を持つ）。 */
function classifiedPreExistingFailure(gate: string): IntegrityFailureOrigin {
  return {
    gate,
    failureId: "known-suite-failure",
    origin: "pre-existing",
    baselineReproduction: {
      baselineCommit: "7bc435b76d20f74018bb8a32a746e2e1bf5abd60",
      method: "detached-worktree",
      sameFailureReproduced: true,
    },
    registrationRef: "PR 本文 検証差分セクション（機械受理基準の記録一式の登録）",
  };
}

describe("full integrity suite の機械受理基準（記録実体の検証と拒否経路の維持）", () => {
  test("(a) 記録実体が完備し pre-existing 分類済み fail を含む入力は規範の受理経路どおり close を許可する", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n- [x] 条件2\n",
      integrityExitCodes: { check_integrity: 1 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        integrityMachineAcceptance: completeMachineAcceptanceRecord({
          failureOrigins: [classifiedPreExistingFailure("check_integrity")],
          observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
        }),
        acceptanceVerdicts: [soundPass("AC-1"), soundPass("AC-2")],
      }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "full-integrity-suite");
    expect(step?.status).toBe("pass");
    // 検証ランナーの非ゼロ終了コードは成功へ変換されず、受理由件8の記録として保持される。
    expect(
      (step?.detail as Record<string, { exitCode: number; stdout: string }>).check_integrity,
    ).toEqual({
      exitCode: 1,
      stdout: "",
    });
    const diff = report.diff.integrityMachineAcceptance as {
      accepted: boolean;
      failedGateNames: string[];
      observedFailCounts: { gate: string; failCount: number }[];
    };
    expect(diff.accepted).toBe(true);
    expect(diff.failedGateNames).toEqual(["check_integrity"]);
    expect(diff.observedFailCounts).toEqual([{ gate: "check_integrity", failCount: 1 }]);
    expect(report.result.exitCategory).toBe("success");
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("(a') execution-form 分類は規律適合再実行結果の採用実体が揃った場合のみ受理される", () => {
    const adopted = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        failureOrigins: [
          {
            gate: "check_integrity",
            failureId: "junction-missing-failure",
            origin: "execution-form",
            conformanceReexecution: {
              evidencePath: ".agentdev/tmp/rerun-stdout.log",
              exitCode: 0,
              resolvedAfterConformingRerun: true,
            },
            registrationRef: "PR 本文 検証差分セクション",
          },
        ],
        observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
      }),
      [{ name: "check_integrity", exitCode: 1 }],
    );
    expect(adopted.accepted).toBe(true);

    const notResolved = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        failureOrigins: [
          {
            gate: "check_integrity",
            failureId: "junction-missing-failure",
            origin: "execution-form",
            conformanceReexecution: {
              evidencePath: ".agentdev/tmp/rerun-stdout.log",
              exitCode: 1,
              resolvedAfterConformingRerun: false,
            },
            registrationRef: "PR 本文 検証差分セクション",
          },
        ],
        observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
      }),
      [{ name: "check_integrity", exitCode: 1 }],
    );
    expect(notResolved.accepted).toBe(false);
    expect(notResolved.violations.map((v) => v.code)).toContain(
      "execution-form-reexecution-not-adopted",
    );

    const missingEntity = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        failureOrigins: [
          {
            gate: "check_integrity",
            failureId: "junction-missing-failure",
            origin: "execution-form",
            registrationRef: "PR 本文 検証差分セクション",
          },
        ],
        observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
      }),
      [{ name: "check_integrity", exitCode: 1 }],
    );
    expect(missingEntity.accepted).toBe(false);
    expect(missingEntity.violations.map((v) => v.code)).toContain(
      "execution-form-reexecution-not-adopted",
    );
  });

  test("(b) 由来不明 fail が残存する入力は fail-closed で拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n",
      integrityExitCodes: { check_integrity: 1 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        integrityMachineAcceptance: completeMachineAcceptanceRecord({
          failureOrigins: [
            {
              gate: "check_integrity",
              failureId: "unexplained-failure",
              origin: "unknown",
              registrationRef: "PR 本文 検証差分セクション",
            },
          ],
          observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
        }),
        acceptanceVerdicts: [soundPass("AC-1")],
      }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "full-integrity-suite");
    expect(step?.status).toBe("fail");
    const diff = report.diff.integrityMachineAcceptance as {
      accepted: boolean;
      violations: { code: string }[];
    };
    expect(diff.accepted).toBe(false);
    expect(diff.violations.map((v) => v.code)).toContain("unknown-origin-failure-remains");
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "mechanical-failure",
    });
  });

  test("(c) fail 残存時に機械受理基準の記録実体が欠落する入力は拒否する（記録不在・実体欠落・件数不一致）", () => {
    const missingRecord = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      fakeRunner({
        issueBody: "- [ ] 条件1\n",
        integrityExitCodes: { check_integrity: 1 },
      }),
    );
    const missingStep = missingRecord.result.steps.find(
      (s) => s.name === "full-integrity-suite",
    );
    expect(missingStep?.status).toBe("fail");
    const missingDiff = missingRecord.diff.integrityMachineAcceptance as {
      violations: { code: string }[];
    };
    expect(missingDiff.violations).toEqual([{ code: "machine-acceptance-record-missing" }]);
    expect(isCloseOperationPermitted(missingRecord).permitted).toBe(false);

    // 実体レコードの欠落: 環境ラベルの1要素でも欠ければ記録欠落として拒否する。
    const missingLabelElement = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        environmentLabel: {
          runtime: "Windows / bash",
          junctionPropagation: "",
          dependencies: "bun install 済み",
        },
      }),
      [],
    );
    expect(missingLabelElement.accepted).toBe(false);
    expect(missingLabelElement.violations.map((v) => v.code)).toContain(
      "record-missing:environment-label",
    );

    // 実行記録の実体欠落: 件数サマリーを持たない分割レコードは拒否する。
    const missingCountSummary = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        suiteRunRecords: [
          {
            split: "分割①",
            command: "bun test ./src/common/skills/",
            cwd: "<repo>",
            testCountSummary: "",
            exitCode: 0,
            scope: "./src/common/skills/",
          },
        ],
      }),
      [],
    );
    expect(missingCountSummary.accepted).toBe(false);
    expect(missingCountSummary.violations.map((v) => v.code)).toContain("suite-run-record-invalid");

    // 件数不一致: 観測 fail 件数 2 件に対し分類レコード 1 件では 1:1 突合が成立せず拒否する。
    const countMismatch = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        failureOrigins: [classifiedPreExistingFailure("check_integrity")],
        observedFailCounts: [{ gate: "check_integrity", failCount: 2 }],
      }),
      [{ name: "check_integrity", exitCode: 1 }],
    );
    expect(countMismatch.accepted).toBe(false);
    expect(countMismatch.violations).toContainEqual({
      code: "failure-origin-count-mismatch",
      gate: "check_integrity",
      expected: 2,
      actual: 1,
    });
  });

  test("(d) 未登録の既知欠陥を合格の根拠とする入力は拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n",
      integrityExitCodes: { check_integrity: 1 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        integrityMachineAcceptance: completeMachineAcceptanceRecord({
          failureOrigins: [
            { ...classifiedPreExistingFailure("check_integrity"), registrationRef: "" },
          ],
          observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
        }),
        acceptanceVerdicts: [soundPass("AC-1")],
      }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "full-integrity-suite");
    expect(step?.status).toBe("fail");
    const diff = report.diff.integrityMachineAcceptance as {
      violations: { code: string }[];
    };
    expect(diff.violations.map((v) => v.code)).toContain("unregistered-known-defect");
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("boolean 申告のみの旧形式記録（records フラグ）は実体検証を通過しない", () => {
    // 前実装の boolean 申告形状（records フラグ）を投入しても、実体（確認結果、
    // 実行記録、環境ラベル、件数、baseline、版）を欠く記録は受理されない。
    const legacyFlagRecord = {
      failureOrigins: [],
      observedFailCounts: [],
      records: {
        runnerConstitutionConfirmed: true,
        standardFormExecutionRecorded: true,
        environmentLabelRecorded: true,
        countReconciliationRecorded: true,
        baselineReferenceCommitRecorded: true,
        exitCodesRecordedWithoutConversion: true,
        runnerVersionRecorded: true,
        inspectionScopeRecorded: true,
      },
    } as unknown as IntegrityMachineAcceptanceRecord;
    const verdict = evaluateIntegrityMachineAcceptance(legacyFlagRecord, [
      { name: "check_integrity", exitCode: 1 },
    ]);
    // 実体配列（failureOrigins / observedFailCounts / suiteRunRecords）を欠く記録は
    // 記録不在として fail-closed に拒否され、フラグ申告では受理されない。
    expect(verdict.accepted).toBe(false);
    expect(verdict.violations).toEqual([{ code: "machine-acceptance-record-missing" }]);
  });

  test("分類記録が非ゼロ終了 gate を被覆しない入力は被覆外 gate として拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n",
      integrityExitCodes: { check_integrity: 1, check_autogen_freshness: 2 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        integrityMachineAcceptance: completeMachineAcceptanceRecord({
          failureOrigins: [classifiedPreExistingFailure("check_integrity")],
          observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
        }),
        acceptanceVerdicts: [soundPass("AC-1")],
      }),
      runner,
    );
    const diff = report.diff.integrityMachineAcceptance as {
      accepted: boolean;
      violations: { code: string; gate?: string }[];
    };
    expect(diff.accepted).toBe(false);
    expect(diff.violations).toContainEqual({
      code: "uncovered-failure-origin",
      gate: "check_autogen_freshness",
    });
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実体突合: ゼロ終了 gate への fail 分類・未実行 gate への分類・重複 provenance は拒否する", () => {
    // ゼロ終了 gate への fail 件数付与は gate 実行結果と矛盾するため拒否する。
    const passingGateConflict = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        observedFailCounts: [{ gate: "check_autogen_freshness", failCount: 1 }],
        failureOrigins: [classifiedPreExistingFailure("check_autogen_freshness")],
      }),
      [{ name: "check_autogen_freshness", exitCode: 0 }],
    );
    expect(passingGateConflict.accepted).toBe(false);
    const conflictCodes = passingGateConflict.violations.map((v) => v.code);
    expect(conflictCodes).toContain("fail-count-conflicts-with-passing-gate");
    expect(conflictCodes).toContain("failure-origin-conflicts-with-passing-gate");

    // 未実行 gate への分類は実行結果と突合できないため拒否する。
    const unexecutedGate = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        observedFailCounts: [{ gate: "ghost_gate", failCount: 1 }],
        failureOrigins: [classifiedPreExistingFailure("ghost_gate")],
      }),
      [{ name: "check_integrity", exitCode: 0 }],
    );
    expect(unexecutedGate.accepted).toBe(false);
    const unexecutedCodes = unexecutedGate.violations.map((v) => v.code);
    expect(unexecutedCodes).toContain("observed-fail-count-for-unexecuted-gate");
    expect(unexecutedCodes).toContain("failure-origin-for-unexecuted-gate");

    // 同一 gate 内で重複する provenance は1:1突合を歪めるため拒否する。
    const duplicateOrigin = evaluateIntegrityMachineAcceptance(
      completeMachineAcceptanceRecord({
        observedFailCounts: [{ gate: "check_integrity", failCount: 1 }],
        failureOrigins: [
          classifiedPreExistingFailure("check_integrity"),
          { ...classifiedPreExistingFailure("check_integrity") },
        ],
      }),
      [{ name: "check_integrity", exitCode: 1 }],
    );
    expect(duplicateOrigin.accepted).toBe(false);
    expect(duplicateOrigin.violations.map((v) => v.code)).toContain("duplicate-failure-origin");
  });

  test("fail 0 件の gate 構成では記録省略が受理され、記録実体が揃っていれば受理される", () => {
    const omitted = evaluateIntegrityMachineAcceptance(undefined, [
      { name: "check_integrity", exitCode: 0 },
      { name: "check_autogen_freshness", exitCode: 0 },
    ]);
    expect(omitted).toEqual({ accepted: true, violations: [] });
    const provided = evaluateIntegrityMachineAcceptance(completeMachineAcceptanceRecord(), [
      { name: "check_integrity", exitCode: 0 },
    ]);
    expect(provided).toEqual({ accepted: true, violations: [] });
  });
});

describe("完了条件チェックボックスの機械的抽出（評価はモデル）", () => {
  test("チェックボックス行を抽出し、未達数を数える", () => {
    const body = [
      "# Issue",
      "",
      "- [ ] 未達条件 A",
      "- [x] 達成条件 B",
      "- [X] 達成条件 C",
      "  - [ ] 入れ子は抽出対象外としない（行頭空白許容）",
      "本文ではなくコード内の `- [ ]` 風の文字列は抽出しない",
    ].join("\n");
    const extraction = extractCompletionCheckboxes(body);
    expect(extraction.total).toBe(4);
    expect(extraction.checked).toBe(2);
    expect(extraction.items[0]).toEqual({ text: "未達条件 A", checked: false });
    expect(extraction.items[1]).toEqual({ text: "達成条件 B", checked: true });
  });
});

describe("完了条件チェックボックスの CRLF 入力抽出（読取後の LF 正規化前置）", () => {
  const lines = [
    "# Issue",
    "",
    "- [ ] 未達条件 A",
    "- [x] 達成条件 B",
    "",
    "- [ ] 空行を挟んだ未達条件 C",
  ];

  test("CRLF 改行の issueBodyPath 入力が LF 入力と同一の抽出結果になる", () => {
    const lfReport = runCloseMechanicalSteps(
      preMergeInput(),
      fakeRunner({ issueBody: lines.join("\n") }),
    );
    const crlfReport = runCloseMechanicalSteps(
      preMergeInput(),
      fakeRunner({ issueBody: lines.join("\r\n") }),
    );
    expect(crlfReport.proposal.completion_checkboxes).toBe(
      lfReport.proposal.completion_checkboxes,
    );
  });

  test("CRLF 入力でも項目欠落・空行項目混入が発生しない", () => {
    const report = runCloseMechanicalSteps(
      preMergeInput(),
      fakeRunner({ issueBody: lines.join("\r\n") }),
    );
    const extractionStep = report.result.steps.find(
      (s) => s.name === "completion-checkbox-extraction",
    );
    expect(extractionStep?.detail).toEqual({ total: 3, checked: 1 });
    const items = JSON.parse(report.proposal.completion_checkboxes!) as {
      text: string;
      checked: boolean;
    }[];
    expect(items).toEqual([
      { text: "未達条件 A", checked: false },
      { text: "達成条件 B", checked: true },
      { text: "空行を挟んだ未達条件 C", checked: false },
    ]);
    expect(items.every((item) => item.text.length > 0)).toBe(true);
  });
});

describe("Epic 実行構成表の解析と現在 Wave 特定（投入順序に依存しない）", () => {
  const epicBody = [
    "## 実行構成",
    "",
    "| Wave | Issue | 前提 | 状態 |",
    "|---|---|---|---|",
    "| 1 | #101 | なし | completed |",
    "| 2 | #102 | #101 | pending |",
    "| 2 | #103 | なし | completed |",
    "| 3 | #104 | #102 | pending |",
  ].join("\n");

  test("現在 Wave は非終端行を含む最小 Wave から決定的に導出される", () => {
    const derived = deriveCurrentWave(epicBody);
    expect(derived.currentWave).toBe(2);
    expect(derived.waves).toEqual([
      { wave: 1, total: 1, terminal: 1 },
      { wave: 2, total: 2, terminal: 1 },
      { wave: 3, total: 1, terminal: 0 },
    ]);
  });

  test("投入順序が変わっても、永続状態からの現在 Wave 特定は同一である", () => {
    // スロット型キューの投入順（#104 を先に投入した等）に依存せず、
    // 実行構成表の永続状態のみから現在 Wave が導出される。
    const reordered = [
      "## 実行構成",
      "",
      "| Wave | Issue | 前提 | 状態 |",
      "|---|---|---|---|",
      "| 3 | #104 | #102 | pending |",
      "| 2 | #103 | なし | completed |",
      "| 2 | #102 | #101 | pending |",
      "| 1 | #101 | なし | completed |",
    ].join("\n");
    expect(deriveCurrentWave(reordered).currentWave).toBe(2);
  });

  test("全行が終端状態の Epic は現在 Wave なし（反復完遂）", () => {
    const allTerminal = epicBody
      .replace("| 2 | #102 | #101 | pending |", "| 2 | #102 | #101 | completed |")
      .replace("| 3 | #104 | #102 | pending |", "| 3 | #104 | #102 | completed |");
    expect(deriveCurrentWave(allTerminal).currentWave).toBeNull();
  });

  test("子状態更新は pending 行のみに適用し、確定済み終端状態を上書きしない", () => {
    const result = applyEpicChildStatusUpdates(epicBody, [
      { issue: 102, status: "completed" },
      { issue: 101, status: "failed" },
      { issue: 999, status: "completed" },
    ]);
    expect(result.applied).toEqual([102]);
    expect(result.skipped).toEqual([
      { issue: 101, reason: "already-completed" },
      { issue: 999, reason: "row-not-found" },
    ]);
    expect(result.body).toContain("| 2 | #102 | #101 | completed |");
    expect(result.body).toContain("| 1 | #101 | なし | completed |");
  });
});

describe("pre-merge 機械工程の実行（品質ゲート省略なし・報告 JSON 4要素）", () => {
  test("全品質ゲートと機械工程が実行され、4制御が接続された構成では報告 JSON が組み上がる", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n- [x] 条件2\n",
      epicBody: "| Wave | Issue | 前提 | 状態 |\n|---|---|---|---|\n| 1 | #101 | なし | pending |",
    });
    const input = preMergeInput({
      epicBodyPath: "<repo>/.agentdev/tmp/epic-body.md",
      epicChildStatusUpdates: [{ issue: 101, status: "completed" }],
    });
    const report = runCloseMechanicalSteps(input, runner);
    const stepNames = report.result.steps.map((s) => s.name);
    for (const required of [
      "gate-availability",
      "mergeable-polling",
      "pre-merge-local-state-check",
      "completion-checkbox-extraction",
      "autogen-regeneration-diff",
      "traceability-check",
      "full-integrity-suite",
      "textlint-final-check",
      "epic-table-analysis",
    ]) {
      expect(stepNames).toContain(required);
    }
    expect(report.result.exitCategory).toBe("success");
    expect(decideExitCode(report)).toBe(0);
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(report.proposal.epic_body).toContain("#101 | なし | completed |");
    expect(report.proposal.completion_checkboxes).toContain("条件1");
  });

  test("mergeable が CONFLICTING の場合は要判断（終了コード 2 相当）で警告を返す", () => {
    const runner = fakeRunner({ ghMergeable: "CONFLICTING", issueBody: "- [x] A\n" });
    const report = runCloseMechanicalSteps(preMergeInput(), runner);
    const polling = report.result.steps.find((s) => s.name === "mergeable-polling");
    expect(polling?.status).toBe("warn");
    expect(report.result.exitCategory).toBe("needs-judgment");
    expect(decideExitCode(report)).toBe(2);
    expect(report.warnings.join("\n")).toContain("CONFLICTING");
  });

  test("既知ゲート契約（--req の許容書式）と同一前提の入力検証で不正値を検査開始前に拒否する", () => {
    const runner = fakeRunner({ issueBody: "- [x] A\n" });
    // 空セグメント（REQ-1024-）は桁数上限なしの許容書式でも不正値。
    const broken = preMergeInput({
      traceabilityGate: {
        name: "traceability-check",
        command: "bun",
        args: ["./checker.ts", "traceability-check", "--req", "REQ-1024-"],
        cwd: "<repo>/.worktrees/100-case",
      },
    });
    expect(() => runCloseMechanicalSteps(broken, runner)).toThrow(/--req/);
    expect(runner.calls).toHaveLength(0);
  });

  test("4桁帯 REQ 行 ID を含む --req を許容書式として受け付ける", () => {
    const fourDigitReqId = ["REQ", "1024", "001"].join("-");
    const runner = fakeRunner({ issueBody: "- [x] A\n" });
    const report = runCloseMechanicalSteps(preMergeInput({
      traceabilityGate: {
        name: "traceability-check",
        command: "bun",
        args: ["./checker.ts", "traceability-check", "--req", fourDigitReqId],
        cwd: "<repo>/.worktrees/100-case",
      },
    }), runner);
    expect(report.result.steps.find((s) => s.name === "traceability-check")?.status).toBe("pass");
  });

  test("必須ゲート実行体の欠落を検出した場合は正規の代替経路を案内して失敗を返す（省略して成功扱いにしない）", () => {
    const runner = fakeRunner({ issueBody: "- [x] A\n" });
    const originalExists = runner.exists.bind(runner);
    runner.exists = (absolutePath: string) =>
      originalExists(absolutePath) && !absolutePath.endsWith("checker.ts");
    const report = runCloseMechanicalSteps(preMergeInput(), runner);
    const availability = report.result.steps.find((step) => step.name === "gate-availability");
    expect(availability?.status).toBe("fail");
    const gates = availability?.detail.gates as { gate: string; available: boolean; alternativeRoutes: readonly string[] }[];
    const missing = gates.filter((record) => !record.available);
    expect(missing.length).toBeGreaterThan(0);
    for (const record of missing) {
      expect(record.alternativeRoutes.join("\n")).toContain("evidence-preservation（証跡化）");
      expect(record.alternativeRoutes.join("\n")).toContain("manual-equivalent-procedure（手動相当手順）");
      expect(record.alternativeRoutes.join("\n")).toContain("contrastive-no-worse-proof（対照実行による悪化ゼロ件の機械証明）");
    }
    // 欠落時は mergeable ポーリング以降の工程を開始しない
    expect(runner.calls.some((c) => c.command === "gh")).toBe(false);
    expect(decideExitCode(report)).toBe(1);
    expect(report.warnings.join("\n")).toContain("required gate executable is missing");
  });

  test("worktree が未コミット変更を持つ場合は失敗（終了コード 1 相当）で非 0 を返す", () => {
    const runner = fakeRunner({ worktreeStatus: " M docs/x.md\n", issueBody: "- [x] A\n" });
    const report = runCloseMechanicalSteps(preMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
  });

  test("品質ゲートの実行が worktree cwd で発行され、読み取り系 gh pr view のみを GitHub I/O に使う", () => {
    const runner = fakeRunner({ issueBody: "- [x] A\n" });
    runCloseMechanicalSteps(preMergeInput(), runner);
    const ghCalls = runner.calls.filter((c) => c.command === "gh");
    expect(ghCalls.length).toBeGreaterThan(0);
    for (const call of ghCalls) {
      expect(call.args.slice(0, 2)).toEqual(["pr", "view"]);
    }
    const writeSubcommands = ["create", "merge", "close", "edit", "comment"];
    for (const call of ghCalls) {
      expect(writeSubcommands).not.toContain(call.args[1]);
    }
    const traceCall = runner.calls.find(
      (c) => c.command === "bun" && c.cwd === "<repo>/.worktrees/100-case",
    );
    expect(traceCall).toBeDefined();
  });
});

describe("pre-merge-local-state-check の機械自己出力の特定実体除外（除外根拠(1)・REQ-032-043/044）", () => {
  function mainRootPreMergeInput(): CloseMechanicalInput {
    return preMergeInput({
      worktreeRoot: ".",
      verificationResourceCheck: { ...verificationResourceCheck(), issueNumber: 3942 },
    });
  }

  test("main-root 構成で機械自身の終了判定記録書出しのみ dirty の場合、pre-merge-local-state-check は pass する", () => {
    const recordRelativePath = ".agentdev/close-acceptance/issue-3942.json";
    const runner = fakeRunner({
      worktreeStatus: `?? ${recordRelativePath}\n`,
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("pass");
    const detail = check?.detail as {
      worktreeDirty?: boolean;
      excludedSelfAcceptanceRecordPath?: string | null;
      excludedSelfRecordEntries?: string[];
    };
    expect(detail.worktreeDirty).toBe(false);
    expect(detail.excludedSelfAcceptanceRecordPath).toBe(recordRelativePath);
    expect(detail.excludedSelfRecordEntries).toEqual([`?? ${recordRelativePath}`]);
    expect(report.warnings.join("\n")).not.toContain("worktree has uncommitted changes");
  });

  test("main-root 構成でも終了判定記録以外の dirty は fail を維持する", () => {
    const runner = fakeRunner({
      worktreeStatus: " M docs/x.md\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    expect(report.warnings.join("\n")).toContain("worktree has uncommitted changes");
  });

  test("除外は特定実体に限定され、台帳パス等の他実体は継続 fail する", () => {
    const runner = fakeRunner({
      worktreeStatus:
        "?? .agentdev/close-acceptance/issue-3942.json\n?? .agentdev/tmp/verification-resources/3928.json\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    const detail = check?.detail as { excludedSelfRecordEntries?: string[] };
    expect(detail.excludedSelfRecordEntries).toEqual(["?? .agentdev/close-acceptance/issue-3942.json"]);
    expect(report.warnings.join("\n")).toContain("worktree has uncommitted changes");
  });

  test("対象番号と異なる終了判定記録ファイルは除外対象にならない", () => {
    const runner = fakeRunner({
      worktreeStatus: "?? .agentdev/close-acceptance/issue-3931.json\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    expect(report.warnings.join("\n")).toContain("worktree has uncommitted changes");
  });

  test("実porcelain: 完全未追跡ディレクトリの省略形（?? .agentdev/close-acceptance/）でも自己記録は実行時に除外される（実git出力形式）", () => {
    // 実git観測（2026-11-06・test-scoped temp repo での実測）:
    // `git status --porcelain` は完全未追跡ディレクトリを `?? .agentdev/close-acceptance/`
    // （ディレクトリ省略形）で出力し、`git status --porcelain -uall` はファイル形
    // `?? .agentdev/close-acceptance/issue-3948.json` を出力する。実行時不一致の再現入力。
    const runner = fakeRunner({
      worktreeStatus: "?? .agentdev/close-acceptance/\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("pass");
    const detail = check?.detail as {
      worktreeDirty?: boolean;
      excludedSelfAcceptanceRecordPath?: string | null;
      excludedSelfRecordEntries?: string[];
    };
    expect(detail.worktreeDirty).toBe(false);
    expect(detail.excludedSelfAcceptanceRecordPath).toBe(".agentdev/close-acceptance/issue-3942.json");
    expect(detail.excludedSelfRecordEntries).toEqual(["?? .agentdev/close-acceptance/"]);
    expect(report.warnings.join("\n")).not.toContain("worktree has uncommitted changes");
  });

  test("実porcelain: .agentdev 全体が未追跡のトップレベル省略形（?? .agentdev/）でも自己記録を含む省略形は実行時に除外される", () => {
    const runner = fakeRunner({
      worktreeStatus: "?? .agentdev/\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("pass");
    const detail = check?.detail as { worktreeDirty?: boolean; excludedSelfRecordEntries?: string[] };
    expect(detail.worktreeDirty).toBe(false);
    expect(detail.excludedSelfRecordEntries).toEqual(["?? .agentdev/"]);
  });

  test("実porcelain: 省略形ディレクトリに自己記録が実在しない構成では除外せず継続 fail する（実在確認のない包含除外をしない）", () => {
    const runner = fakeRunner({
      worktreeStatus: "?? .agentdev/close-acceptance/\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    // 異常構成（書出し済みのはずの自己記録が実在しない）では、省略形の包含除外をしない。
    const originalExists = runner.exists.bind(runner);
    runner.exists = (absolutePath: string) => {
      const normalized = absolutePath.replace(/\\/g, "/");
      if (normalized.endsWith(".agentdev/close-acceptance/issue-3942.json")) return false;
      return originalExists(absolutePath);
    };
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    expect(report.warnings.join("\n")).toContain("worktree has uncommitted changes");
  });

  test("実porcelain: 自己記録を含まない省略形ディレクトリ（subtree外）は除外しない", () => {
    const runner = fakeRunner({
      worktreeStatus: "?? docs/untracked-area/\n",
      issueBody: "- [x] A\n",
      acceptanceRecordIssueNumber: 3942,
    });
    const report = runCloseMechanicalSteps(mainRootPreMergeInput(), runner);
    const check = report.result.steps.find((s) => s.name === "pre-merge-local-state-check");
    expect(check?.status).toBe("fail");
    const detail = check?.detail as { excludedSelfRecordEntries?: string[] };
    expect(detail.excludedSelfRecordEntries).toEqual([]);
    expect(report.warnings.join("\n")).toContain("worktree has uncommitted changes");
  });
});

describe("post-merge 機械工程（squash merge 後ローカル状態検査とクリーンアップ）", () => {
  test("worktree/branch クリーンアップを実行し、成功時は報告 4要素で成功を返す", () => {
    const runner = fakeRunner();
    const report = runCloseMechanicalSteps(
      preMergeInput({
        phase: "post-merge",
        cleanup: { removeWorktree: true, removeBranch: "case-100" },
      }),
      runner,
    );
    const stepNames = report.result.steps.map((s) => s.name);
    expect(stepNames).toEqual(["post-merge-local-state-check", "cleanup-worktree-branch"]);
    expect(decideExitCode(report)).toBe(0);
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "worktree")).toBe(true);
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "branch" && c.args[1] === "-d")).toBe(true);
  });

  test("branch が残存する場合は要判断の警告を返す", () => {
    const runner = fakeRunner();
    runner.calls.length = 0;
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--list") {
        return { exitCode: 0, stdout: "case-100\n", stderr: "" };
      }
      return originalRun(spec);
    };
    const report = runCloseMechanicalSteps(
      preMergeInput({ phase: "post-merge", cleanup: { removeWorktree: true, removeBranch: "case-100" } }),
      runner,
    );
    expect(decideExitCode(report)).toBe(2);
    expect(report.warnings.join("\n")).toContain("cleanup");
  });
});

describe("報告 JSON の4要素組み立て", () => {
  test("実行結果・差分・警告・提案本文の4要素を常に保持する", () => {
    const report = assembleReport(
      "pre-merge",
      [{ name: "s1", status: "pass", detail: {} }],
      { key: "value" },
      ["warn message"],
      { epic_body: "..." },
    );
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(report.result.steps).toHaveLength(1);
    // 終了コードは step の成否から決定する。警告メッセージのみの報告は要判断ではなく
    // 成功（警告の重要度評価はモデルが報告 JSON の意味レビューで行う）。
    expect(decideExitCode(report)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 受入評価の接続（母集団導出 → evaluateFinalAcceptance → 終了操作抑制）
// ---------------------------------------------------------------------------

/** 正当な pass 判定の標本（final-acceptance.ts の契約に揃える）。 */
function soundPass(conditionId: string): ConditionVerdict {
  return {
    conditionId,
    required: true,
    category: "pass",
    grounds: {
      derivedFromContract: true,
      evidenceProvesSemanticProposition: true,
    },
  };
}

describe("抽出フェーズの母集団導出（deriveAcceptancePopulation）", () => {
  test("抽出成功は正規完了条件の取得状態を母集団へ反映する", () => {
    const population = deriveAcceptancePopulation({ total: 3 });
    expect(population).toEqual({
      extractionSucceeded: true,
      contractConditionCount: 3,
      contractRequiredCount: 3,
      emptyBasis: undefined,
    });
  });

  test("抽出失敗は extractionSucceeded: false の母集団になり、0 件（条件なし）へ変換しない", () => {
    const population = deriveAcceptancePopulation(null);
    expect(population).toEqual({
      extractionSucceeded: false,
      contractConditionCount: null,
      contractRequiredCount: null,
    });
  });

  test("0 件抽出は emptyBasis を根拠に主張され、根拠なしでは条件なしとして受理されない", () => {
    const withoutBasis = deriveAcceptancePopulation({ total: 0 });
    expect(withoutBasis.extractionSucceeded).toBe(true);
    expect(withoutBasis.contractConditionCount).toBe(0);
    expect(withoutBasis.emptyBasis).toBeUndefined();
    const withBasis = deriveAcceptancePopulation({ total: 0 }, "正規契約上の完了条件なし");
    expect(withBasis.emptyBasis).toBe("正規契約上の完了条件なし");
  });
});

describe("受入評価の実経路接続（final-acceptance-evaluation step と終了操作抑制）", () => {
  test("判定入力が未提供の場合は受入評価は未確定として報告され、終了操作は許可されない", () => {
    const runner = fakeRunner({ issueBody: "- [ ] 条件1\n- [x] 条件2\n" });
    const report = runCloseMechanicalSteps(preMergeInput(), runner);
    const evaluation = report.diff.acceptanceEvaluation as {
      determined: boolean;
      population: { contractConditionCount: number };
    };
    expect(evaluation.determined).toBe(false);
    expect(evaluation.population.contractConditionCount).toBe(2);
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "acceptance-evaluation-undetermined",
    });
  });

  test("拒否入力は final-acceptance-evaluation step を失敗にし、報告に母集団・判定・拒否理由を含め、終了操作を抑止する", () => {
    const runner = fakeRunner({ issueBody: "- [ ] 条件1\n- [ ] 条件2\n" });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [
          soundPass("AC-1"),
          { conditionId: "AC-2", required: true, category: "fail", grounds: {} },
        ],
      }),
      runner,
    );
    const evaluationStep = report.result.steps.find(
      (s) => s.name === "final-acceptance-evaluation",
    );
    expect(evaluationStep?.status).toBe("fail");
    const evaluation = report.diff.acceptanceEvaluation as {
      determined: boolean;
      closeAllowed: boolean;
      population: ConditionPopulation;
      blockingUnmet: string[];
    };
    expect(evaluation.determined).toBe(true);
    expect(evaluation.closeAllowed).toBe(false);
    expect(evaluation.population).toEqual({
      extractionSucceeded: true,
      contractConditionCount: 2,
      contractRequiredCount: 2,
      emptyBasis: undefined,
    });
    expect(evaluation.blockingUnmet).toEqual(["AC-2"]);
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "acceptance-denied",
    });
  });

  test("完了条件の証拠が揃った構成では機械受理が成立し終了操作が許可される", () => {
    const runner = fakeRunner({ issueBody: "- [ ] 条件1\n- [ ] 条件2\n" });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1"), soundPass("AC-2")],
      }),
      runner,
    );
    const evaluationStep = report.result.steps.find(
      (s) => s.name === "final-acceptance-evaluation",
    );
    expect(evaluationStep?.status).toBe("pass");
    expect(decideExitCode(report)).toBe(0);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("不足で停止した対象は修正後、同一の実経路の再検証で終了操作を許可する（fix-and-reverify）", () => {
    const denied = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [
          soundPass("AC-1"),
          { conditionId: "AC-2", required: true, category: "blocked", grounds: {} },
        ],
      }),
      fakeRunner({ issueBody: "- [ ] 条件1\n- [ ] 条件2\n" }),
    );
    expect(isCloseOperationPermitted(denied).permitted).toBe(false);
    const reverified = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1"), soundPass("AC-2")],
      }),
      fakeRunner({ issueBody: "- [ ] 条件1\n- [ ] 条件2\n" }),
    );
    expect(isCloseOperationPermitted(reverified)).toEqual({ permitted: true });
  });

  test("拒否・未確定の実経路では終了操作（issue_close 相当の gh 書込み）が呼び出されない", () => {
    const runner = fakeRunner({ issueBody: "- [ ] 条件1\n" });
    const denied = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [
          { conditionId: "AC-1", required: true, category: "fail", grounds: {} },
        ],
      }),
      runner,
    );
    expect(isCloseOperationPermitted(denied).permitted).toBe(false);
    // 報告 JSON に記録される gh 呼び出しは読み取り系（gh pr view）のみで、
    // issue_close・Issue 本文更新等の書込みを script が発行しない（agentdev_gh 境界）。
    for (const call of runner.calls.filter((c) => c.command === "gh")) {
      expect(call.args.slice(0, 2)).toEqual(["pr", "view"]);
    }
    const undetermined = runCloseMechanicalSteps(
      preMergeInput(),
      fakeRunner({ issueBody: "" }),
    );
    const evaluation = undetermined.diff.acceptanceEvaluation as { determined: boolean };
    expect(evaluation.determined).toBe(false);
    expect(isCloseOperationPermitted(undetermined).permitted).toBe(false);
  });

  test("機械工程が失敗している場合は受入評価が許可でも終了操作を許可しない", () => {
    const runner = fakeRunner({
      worktreeStatus: " M docs/x.md\n",
      issueBody: "- [ ] 条件1\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    expect(report.result.exitCategory).toBe("failure");
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "mechanical-failure",
    });
  });

  test("Epic ルートの受入評価は subjectKind epic で実行される", () => {
    const runner = fakeRunner({ issueBody: "" });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceSubjectKind: "epic",
        acceptanceVerdicts: [],
        acceptanceEmptyBasis: undefined,
      }),
      runner,
    );
    const evaluation = report.diff.acceptanceEvaluation as {
      closeAllowed: boolean;
      populationState: string;
    };
    // Epic Issue の抽出 0 件（本文に完了条件チェックボックスなし）は根拠なしでは
    // 条件なしとして受理されない（fail-closed）。
    expect(evaluation.closeAllowed).toBe(false);
    expect(evaluation.populationState).toBe("no-conditions-in-contract");
    const evaluationStep = report.result.steps.find(
      (s) => s.name === "final-acceptance-evaluation",
    );
    expect((evaluationStep?.detail as { subjectKind?: string }).subjectKind).toBe("epic");
  });

  test("実経路の reference pin: STEP-2 と STEP-5 が終了操作許可判定を実手順として参照する", () => {
    const step2 = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "src",
        "common",
        "skills",
        "agentdev-workflow-case-close",
        "references",
        "issue-resolution-and-qg4.md",
      ),
      "utf-8",
    );
    const step5 = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "src",
        "common",
        "skills",
        "agentdev-workflow-case-close",
        "references",
        "cleanup-and-capture.md",
      ),
      "utf-8",
    );
    for (const reference of [step2, step5]) {
      expect(reference).toContain("close_mechanical_steps.ts");
      expect(reference).toContain("isCloseOperationPermitted");
    }
    expect(step2).toContain("受入評価の母集団導入と終了操作への接続");
    expect(step2).toContain("evaluateFinalAcceptance");
    expect(step5).toContain("受入評価結果の確認");
    expect(step2).toContain("completion-checkbox-extraction");
  });
});

describe("一時資材と正式成果物の役割分類（REQ-118-003）", () => {
  test("根拠付きの正式成果物は回収対象外に分類する", () => {
    expect(
      classifyResourceRole({
        fileName: "test-data.json",
        extension: ".json",
        isGitTracked: true,
        roleBasis: { role: "official-artifact", basis: "repository artifact registry" },
      }),
    ).toEqual({ role: "official-artifact", basis: "repository artifact registry" });
  });

  test("根拠付きの実行時生成物は回収対象に分類する", () => {
    expect(
      classifyResourceRole({
        fileName: "expected-output.json",
        extension: ".json",
        isGitTracked: false,
        roleBasis: { role: "test-run-generated", basis: "test-run artifact record" },
      }),
    ).toEqual({ role: "test-run-generated", basis: "test-run artifact record" });
  });

  test("拡張子・test名・git追跡状態だけでは役割を確定しない", () => {
    expect(
      classifyResourceRole({
        fileName: "test-output.log",
        extension: ".log",
        isGitTracked: true,
      }),
    ).toEqual({ role: "undetermined", basis: null });
  });

  test("空の根拠は役割を確定せず未判定のまま扱う", () => {
    expect(
      classifyResourceRole({
        fileName: "procedure.md",
        roleBasis: { role: "official-artifact", basis: "  " },
      }),
    ).toEqual({ role: "undetermined", basis: null });
  });
});

describe("検証用一時資材の照合・完了拒否・終了判定記録書出し（REQ-032-043/044/045/046）", () => {
  test("終了判定記録のissue番号はreaderと同じ4桁ゼロ埋めのパスへ解決する", () => {
    expect(resolveCloseAcceptanceRecordPath("<repo>", 12)).toBe(
      path.join("<repo>", ".agentdev", "close-acceptance", "issue-0012.json"),
    );
  });

  test("後段gate失敗時は最終reader契約のaccepted=falseを記録し、HEADをtargetRevisionに流用しない", () => {
    const issueUpdatedAt = "2026-11-05T08:00:00Z";
    const input = {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt,
    } as unknown as CloseMechanicalInput;
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      integrityExitCodes: { "textlint-final-check": 1 },
      previousAcceptanceRecord: JSON.stringify({
        issueNumber: 3931,
        targetRevision: issueUpdatedAt,
        generatedAt: "2026-11-05T07:00:00Z",
        accepted: true,
      }),
    });

    const report = runCloseMechanicalSteps(input, runner);
    const recordPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const recordText = runner.writes.find((write) => write.absolutePath === recordPath)?.content;
    expect(recordText).toBeDefined();
    const record = JSON.parse(recordText ?? "{}") as Record<string, unknown>;

    expect(record).toMatchObject({
      issueNumber: 3931,
      targetRevision: issueUpdatedAt,
      accepted: false,
    });
    expect(JSON.parse(runner.readTextFile(recordPath))).toMatchObject({ accepted: false });
    expect(report.result.exitCategory).toBe("failure");
  });

  test("実経路: 呼出元の文字列申告（basis・confirmedBy・targetRevision）は受入gap導出の入力にならず、作成入口拒否を迂回した登録経路は申告で受理されない", () => {
    // ①迂回構成: 案件識別子を含まない・環境TEMP配下でもrepo配下でもない作成先が台帳へ登録されている
    // （TEMP の親ディレクトリ相当。プロジェクト親等の作成先違反）。
    const outsideLocation = path.join(path.dirname(tmpdir()), "adf-verify-clone-without-case-id");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({ location: outsideLocation, identifiers: { path: outsideLocation } }),
      ]),
    });
    const input = {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt: "2026-11-05T08:00:00Z",
      verificationResourceCheck: {
        ...verificationResourceCheck(),
        creationRouteControlConfirmations: [
          {
            route: "arbitrary-path-creation",
            basis: "enforcement succeeded",
            confirmedBy: "case-close-model",
            targetRevision: "2026-11-04T08:00:00Z",
          },
        ],
      },
    } as unknown as CloseMechanicalInput;
    const report = runCloseMechanicalSteps(input, runner);
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route: string }[];

    expect(gaps.some((gap) => gap.code === "creation-entry-rejection-disconnected")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: ①再評価は修正後の作成先境界を消費し、repo内正規一時領域配下の登録はgap化せず、正規一時領域外のrepo内パスはgap化する", () => {
    const mainRoot = REPO_ROOT;
    const repoTempLocation = path.join(mainRoot, ".agentdev", "tmp", "gap-test-regular-temp-entry");
    const repoOutsideTempArea = path.join(mainRoot, "src", "gap-test-outside-regular-temp-entry");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({ id: "vr-3928-1", location: repoTempLocation, identifiers: { path: repoTempLocation } }),
        ledgerEntryJson({ id: "vr-3928-2", location: repoOutsideTempArea, identifiers: { path: repoOutsideTempArea } }),
      ]),
    });
    runner.gitCommonDir = () => path.join(mainRoot, ".git");
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route: string }[];

    expect(
      gaps.some(
        (gap) => gap.code === "creation-entry-rejection-disconnected" && gap.route === repoTempLocation,
      ),
    ).toBe(false);
    expect(
      gaps.some(
        (gap) => gap.code === "creation-entry-rejection-disconnected" && gap.route === repoOutsideTempArea,
      ),
    ).toBe(true);
  });

  test("実経路: 4制御が接続された構成では受入gapが空で機械受理が成立する", () => {
    const tempLocation = path.join(tmpdir(), "adf-3928-verify-clone");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          location: tempLocation,
          identifiers: { path: tempLocation, repo: "example/verify-target" },
          collectedAt: "2026-11-05T10:00:00.000Z",
        }),
      ]),
      missingPaths: [tempLocation],
    });
    const input = {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt: "2026-11-05T08:00:00Z",
      verificationResourceCheck: {
        ...verificationResourceCheck(),
        deletionConfirmations: [
          {
            entryId: "vr-3928-1",
            identifiers: { path: tempLocation, repo: "example/verify-target" },
            confirmedBy: "user",
            confirmedAt: "2026-11-05T11:00:00Z",
          },
        ],
      },
    } as unknown as CloseMechanicalInput;
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    const reconciliation = report.diff.verificationResourceReconciliation as { permitted: boolean };

    expect(report.diff.acceptanceGaps).toHaveLength(0);
    expect(step?.status).toBe("pass");
    expect(reconciliation.permitted).toBe(true);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳登録済みの未回収一時資材が実物残存する場合は照合で検出し完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([ledgerEntryJson()]),
      dedicatedAreaEntries: ["<repo>/tmp-area/verify-clone"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    expect(step?.status).toBe("fail");
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "residual-uncollected")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳不在は記録欠落として拒否する（不在を作成物なしの根拠にしない）", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerMissing: true });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    expect(step?.status).toBe("fail");
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      ledgerState: string;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.ledgerState).toBe("missing");
    expect(reconciliation.findings.some((f) => f.code === "ledger-missing")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 導入時既知残存リスト記載の旧検証資材（RU-0255〜0260由来）が存在する限り拒否理由となり、リスト外の実在物は未登録として検出する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      osTempAreaMatches: [
        "<repo>/tmp-verify/adf-3928-ru-0255-remote-clone",
        "<repo>/tmp-verify/adf-3928-ru-0256-bare",
        "<repo>/tmp-verify/adf-3928-unlisted-residual",
      ],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          knownResidualEntries: [
            {
              location: "<repo>/tmp-verify/adf-3928-ru-0255-remote-clone",
              identifiers: { path: "<repo>/tmp-verify/adf-3928-ru-0255-remote-clone" },
            },
            {
              location: "<repo>/tmp-verify/adf-3928-ru-0256-bare",
              identifiers: { path: "<repo>/tmp-verify/adf-3928-ru-0256-bare" },
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      knownResidualStillPresent: readonly string[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.knownResidualStillPresent).toEqual([
      "<repo>/tmp-verify/adf-3928-ru-0255-remote-clone",
      "<repo>/tmp-verify/adf-3928-ru-0256-bare",
    ]);
    expect(reconciliation.findings.some((f) => f.code === "known-residual-still-present")).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) =>
          f.code === "unregistered-resource" &&
          f.detail.includes("adf-3928-unlisted-residual"),
      ),
    ).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 正規のgitignore運用領域（.agentdev/integrity/reports/ 等）に本件由来の未登録の実行時出力を置いた反例で検出・完了拒否される", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: [
        ".agentdev/integrity/reports/adf-3928-run-output.txt",
        "notes/unrelated-cache.txt",
      ].join("\n"),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) =>
          f.code === "unregistered-resource" &&
          f.detail.includes(".agentdev/integrity/reports/adf-3928-run-output.txt"),
      ),
    ).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳・終了判定記録自身と当該検査実行が作成記録付きで書き出す特定実体を未登録残存として誤検出しない", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: [
        ".agentdev/tmp/verification-resources/3928.json",
        ".agentdev/close-acceptance/issue-3931.json",
        ".agentdev/integrity/reports/inspector-stderr-3928.txt",
        ".agentdev/integrity/reports/adf-3928-unregistered.txt",
      ].join("\n"),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          inspectionArtifactPaths: [".agentdev/integrity/reports/inspector-stderr-3928.txt"],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      excludedObservations: readonly { path: string; basis: string }[];
      findings: readonly { code: string; detail: string }[];
    };
    const excludedPaths = reconciliation.excludedObservations.map((o) => o.path);
    expect(excludedPaths).toContain(".agentdev/tmp/verification-resources/3928.json");
    expect(excludedPaths).toContain(".agentdev/close-acceptance/issue-3931.json");
    expect(excludedPaths).toContain(".agentdev/integrity/reports/inspector-stderr-3928.txt");
    expect(
      reconciliation.findings.some(
        (f) =>
          f.code === "unregistered-resource" &&
          f.detail.includes(".agentdev/integrity/reports/adf-3928-unregistered.txt"),
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) =>
          f.code === "unregistered-resource" &&
          f.detail.includes("inspector-stderr-3928.txt"),
      ),
    ).toBe(false);
  });

  test("実経路: 終了判定記録をreaderの4-field契約でmain repo rootへ書き出す", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    expect(report.result.exitCategory).toBe("success");
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const recordWrites = runner.writes.filter((w) => w.absolutePath === expectedPath);
    expect(recordWrites.length).toBeGreaterThanOrEqual(1);
    const record = JSON.parse(recordWrites[recordWrites.length - 1]?.content ?? "{}") as {
      issueNumber: number;
      targetRevision: string;
      generatedAt: string;
      accepted: boolean;
    };
    expect(record.issueNumber).toBe(3931);
    expect(record.targetRevision).toBe("2026-11-05T08:00:00Z");
    expect(Number.isNaN(Date.parse(record.generatedAt))).toBe(false);
    expect(record.accepted).toBe(true);
    expect(Object.keys(record).sort()).toEqual(["accepted", "generatedAt", "issueNumber", "targetRevision"]);
    expect(report.diff.closeAcceptanceRecord).toMatchObject({
      targetRevision: "2026-11-05T08:00:00Z",
      accepted: true,
      written: true,
    });
  });

  test("実経路: 照合拒否の場合も終了判定記録を書き出し、判定内容に拒否とfindingsを記録する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([ledgerEntryJson()]),
      dedicatedAreaEntries: ["<repo>/tmp-area/verify-clone"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const write = runner.writes.find((w) => w.absolutePath === expectedPath);
    expect(write).toBeDefined();
    const record = JSON.parse(write?.content ?? "{}") as {
      issueNumber: number;
      targetRevision: string;
      accepted: boolean;
    };
    expect(record.targetRevision).toBe("2026-11-05T08:00:00Z");
    expect(record.accepted).toBe(false);
    const reconciliation = report.diff.verificationResourceReconciliation as {
      findings: readonly { code: string }[];
    };
    expect(reconciliation.findings.some((f) => f.code === "residual-uncollected")).toBe(true);
  });

  test("実経路: 終了判定記録を書き出せない場合はfail-closedで完了操作を拒否する", () => {
    const recordPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      previousAcceptanceRecord: JSON.stringify({
        issueNumber: 3931,
        targetRevision: "2026-11-05T08:00:00Z",
        generatedAt: "2026-11-05T07:00:00Z",
        accepted: true,
      }),
    });
    delete runner.writeTextFile;
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const acceptanceRecord = report.diff.closeAcceptanceRecord as { written: boolean; accepted: boolean };

    expect(acceptanceRecord.written).toBe(false);
    expect(acceptanceRecord.accepted).toBe(false);
    expect(runner.deletions).toContain(recordPath);
    expect(runner.exists(recordPath)).toBe(false);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実filesystem: reader契約の終了判定記録はworktreeではなくmain repo rootへ書き出される", () => {
    const tempRoot = fs.mkdtempSync(
      path.join(REPO_ROOT, "src/common/skills/agentdev-workflow-case-close/scripts/.close-acceptance-test-"),
    );
    testDirectories.push(tempRoot);
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    runner.gitCommonDir = () => path.join(tempRoot, ".git");
    runner.mkdirRecursive = (absolutePath) => fs.mkdirSync(absolutePath, { recursive: true });
    runner.writeTextFile = (absolutePath, content) => fs.writeFileSync(absolutePath, content, "utf-8");

    const report = runCloseMechanicalSteps(
      preMergeInput({
        repoRoot: tempRoot,
        worktreeRoot: "nested-worktree",
        acceptanceVerdicts: [soundPass("AC-1")],
      }),
      runner,
    );
    const recordPath = path.join(tempRoot, ".agentdev", "close-acceptance", "issue-3931.json");

    expect(fs.existsSync(recordPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(recordPath, "utf-8"))).toMatchObject({
      issueNumber: 3931,
      targetRevision: "2026-11-05T08:00:00Z",
      accepted: true,
    });
    expect(report.diff.closeAcceptanceRecord).toMatchObject({
      path: recordPath,
      written: true,
      accepted: true,
    });
  });

  test("実経路: 台帳のremote一時資材がremote列挙に現れない場合、認証・可視性・対象ID確認後も判断できないなら終了を拒否する（HTTP 404単独の不存在判定をしない）", () => {
    const remoteUrl = "https://github.com/example/adf-3928-verify-target";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      missingPaths: ["<repo>/tmp-area/verify-clone"],
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          kind: "remote",
          location: remoteUrl,
          identifiers: { url: remoteUrl },
        }),
      ]),
      remoteAbsenceInputs: {
        [remoteUrl]: {
          httpStatus404Observed: true,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "remote-absence-undetermined")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 認証・可視性・対象ID確認後の確定的不存在根拠が揃ったremote不存在は、回収確認（collectedAtと削除確認記録）が揃った場合に限り受理する", () => {
    const remoteUrl = "https://github.com/example/adf-3928-verify-target";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      missingPaths: ["<repo>/tmp-area/verify-clone"],
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          kind: "remote",
          location: remoteUrl,
          identifiers: { url: remoteUrl },
          collectedAt: "2026-11-05T10:00:00.000Z",
        }),
      ]),
      remoteAbsenceInputs: {
        [remoteUrl]: {
          httpStatus404Observed: false,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
          confirmedAbsenceEvidence: "gh repo view で不存在確認（認証・可視性・対象ID確認済み）",
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...verificationResourceCheck(),
          deletionConfirmations: [
            {
              entryId: "vr-3928-2",
              identifiers: { url: remoteUrl },
              confirmedBy: "利用者明示確認",
              confirmedAt: "2026-11-05T11:00:00.000Z",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toEqual([]);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 検査コマンドの失敗（非ゼロ終了）は検査器の異常としてfail-closedで完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      inspectionExitCodes: { "process-liveness": 128 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "inspection-unavailable" && f.detail.includes("process-liveness"),
      ),
    ).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: remote不存在確認の検査コマンド失敗（認証失敗相当）も検査器の異常として完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          kind: "remote",
          location: "https://github.com/example/adf-3928-verify-target",
          identifiers: { url: "https://github.com/example/adf-3928-verify-target" },
        }),
      ]),
      inspectionExitCodes: { "remote-absence-verification": 128 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "inspection-unavailable" && f.detail.includes("remote-absence-verification"),
      ),
    ).toBe(true);
  });

  test("実経路: 台帳不在の検査不能構成は受入未達として報告JSONへ出力し終了操作を許可しない", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerMissing: true });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; detail: string }[];
    const uninspectable = gaps.find((gap) => gap.code === "ledger-uninspectable");

    expect(uninspectable).toBeDefined();
    expect(uninspectable?.detail).toContain("ledger is missing");
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "verification-resource-reconciliation-denied",
    });
  });

  test("実経路: 台帳登録済み資材が削除確認記録なしに消失した場合に削除確認の不存在として完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      missingPaths: ["<repo>/tmp-area/verify-clone"],
      ledgerText: JSON.stringify([
        ledgerEntryJson({ collectedAt: "2026-11-05T10:00:00.000Z" }),
      ]),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "deletion-confirmation-missing")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 削除確認記録の識別情報が台帳エントリと一致しない場合は有効な削除確認として受理しない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      missingPaths: ["<repo>/tmp-area/verify-clone"],
      ledgerText: JSON.stringify([
        ledgerEntryJson({ collectedAt: "2026-11-05T10:00:00.000Z" }),
      ]),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...verificationResourceCheck(),
          deletionConfirmations: [
            {
              entryId: "vr-3928-1",
              identifiers: { path: "<repo>/tmp-area/different-clone" },
              confirmedBy: "利用者明示確認",
              confirmedAt: "2026-11-05T11:00:00.000Z",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "deletion-confirmation-missing")).toBe(true);
  });

  test("実経路: 台帳登録済み資材の実物の識別情報（PID・コマンドライン）が台帳記録と一致しない場合に識別情報の不一致として完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          kind: "dedicated-process",
          location: "process:pid=4321",
          identifiers: { pid: "4321", commandLine: "bun run verify-server.ts --port 4321" },
        }),
      ]),
      processLiveness: {
        "4321": { alive: true, commandLine: "bun run verify-server.ts --port 9999" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "identifier-mismatch")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳記録PIDの生存とlistenポートの生存を残存として検出する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          kind: "dedicated-server",
          location: "process:pid=4321",
          identifiers: { pid: "4321", commandLine: "bun run verify-server.ts --port 4321", listenPort: "4321" },
        }),
      ]),
      processLiveness: {
        "4321": { alive: true, commandLine: "bun run verify-server.ts --port 4321" },
      },
      listenPorts: {
        "4321": { listening: true },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "residual-uncollected")).toBe(true);
  });

  test("実経路: 台帳のremote・分岐の実物残存をremote列挙・branch列挙との突合で検出する", () => {
    const remoteUrl = "https://github.com/example/adf-3928-verify-target";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          kind: "remote",
          location: remoteUrl,
          identifiers: { url: remoteUrl },
        }),
      ]),
      remotesText: `origin\thttps://github.com/example/agent-dev-flow.git (fetch)\nverify-target\t${remoteUrl} (fetch)\n`,
      branchesText: "verify-target/adf-3928-verification\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "residual-uncollected")).toBe(true);
  });
});

describe("検証用一時資材の未記録entity消費・検査不能明示・既知残存識別情報消費（REQ-118-004/005/008・REQ-032-043/044 の実装完全化）", () => {
  // 旧専用process 3件と外部remote repo の実在事例を fixture 化したもの（実物の作成・観測は行わない）。
  const legacyProcessFixtures = {
    "37940": {
      alive: true,
      commandLine: "bun run verify-server.ts --port 4097",
      cwd: "C:/work/adf-ru0255-github-verify",
      startedAt: "2026-11-03T21:22:30Z",
    },
    "38944": {
      alive: true,
      commandLine: "bun run verify-server.ts --port 4099",
      cwd: "C:/work/adf-stage2-prep/verify-RU0258-public/env",
      startedAt: "2026-11-04T04:43:44Z",
    },
    "47140": {
      alive: true,
      commandLine: "bun run verify-server.ts --port 4212",
      cwd: "C:/work/adf-ru0255-local-verify",
      startedAt: "2026-11-04T09:15:00Z",
    },
  };
  const legacyListenPortFixtures = {
    "4097": { listening: true },
    "4099": { listening: true },
    "4212": { listening: true },
  };

  test("実経路: 観測結果に入った台帳未記録の旧専用process 3件相当（PID・コマンドライン・listenポート）を未登録資材として検出し完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: legacyProcessFixtures,
      listenPorts: legacyListenPortFixtures,
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    expect(step?.status).toBe("fail");
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    for (const pid of ["37940", "38944", "47140"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(true);
    }
    for (const port of ["4097", "4099", "4212"]) {
      expect(
        reconciliation.findings.some(
          (f) =>
            f.code === "unregistered-resource" &&
            f.detail.includes("listening port") &&
            f.detail.includes(port),
        ),
      ).toBe(true);
    }
    const processFinding = reconciliation.findings.find(
      (f) => f.code === "unregistered-resource" && f.detail.includes("pid 37940"),
    );
    expect(processFinding?.detail).toContain("adf-ru0255-github-verify");
    expect(processFinding?.detail).toContain("2026-11-03T21:22:30Z");
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳未記録の外部remote repo（URL・対象ID）のうち不存在確認が成立しない対象を未登録資材として検出し、確定的不存在は検出しない", () => {
    const confirmedAbsentUrl = "https://github.com/yogata/adf-ru0254-removed-verify";
    const remainingUrl = "https://github.com/yogata/adf-ru0255-github-verify";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      remoteAbsenceInputs: {
        [confirmedAbsentUrl]: {
          httpStatus404Observed: true,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
          confirmedAbsenceEvidence: "gh repo list の全件列挙に対象IDが現れず不存在確認済み",
        },
        [remainingUrl]: {
          httpStatus404Observed: false,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes(remainingUrl),
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some((f) => f.detail.includes(confirmedAbsentUrl)),
    ).toBe(false);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳不在時に process/listen/remote 3スコープが検査不能として明示報告され、空オブジェクト黙過にならない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerMissing: true,
      processLiveness: {
        "37940": legacyProcessFixtures["37940"]!,
      },
      listenPorts: { "4097": { listening: true } },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    expect(step?.status).toBe("fail");
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      ledgerState: string;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.ledgerState).toBe("missing");
    expect(reconciliation.findings.some((f) => f.code === "ledger-missing")).toBe(true);
    for (const scope of ["process-liveness", "listen-port-check", "remote-absence-verification"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "inspection-unavailable" && f.detail.includes(scope),
        ),
      ).toBe(true);
    }
    expect(reconciliation.permitted).toBe(false);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: entity 形根拠（process:pid=…/listen:port=…）を正規化後完全一致で消費し、根拠のない実体は拒否を維持する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "37940": { alive: true, commandLine: "外部共有 runtime process（根拠付き）" },
        "38944": { alive: true, commandLine: "根拠のない外部 process" },
      },
      listenPorts: { "4097": { listening: true }, "4099": { listening: true } },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            { path: "process:pid=37940", kind: "attribution", basis: "本件外共有 runtime process の帰属根拠（機械確認可能な記録参照）" },
            { path: "listen:port=4097", kind: "attribution", basis: "本件外共有 listener の帰属根拠（機械確認可能な記録参照）" },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=37940" && e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "listen:port=4097" && e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 38944"),
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("listening port") && f.detail.includes("4099"),
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: entity 形根拠は別 pid の根拠と非正式成果物の role を消費せず拒否を維持する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: { "37940": { alive: true, commandLine: "対象 process" } },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            { path: "process:pid=99999", kind: "attribution", basis: "別 pid の根拠" },
            { path: "process:pid=37940", kind: "role", role: "test-run-generated", basis: "非正式成果物の役割根拠は除外にならない" },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 37940"),
      ),
    ).toBe(true);
    expect(reconciliation.excludedObservations.length).toBe(0);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 検査実行自身の実行時プロセス（機械工程 pid とその観測子孫）を自己除外し、祖先と無関係プロセスは拒否を維持する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 4242,
      processLiveness: {
        "4": { alive: true, commandLine: "System", parentPid: "0" },
        "4242": { alive: true, commandLine: "機械工程自身", parentPid: "4", startedAt: "2026-11-06T09:00:00.000Z" },
        "5000": { alive: true, commandLine: "観測コマンド本体", parentPid: "4242", startedAt: "2026-11-06T09:00:01.000Z" },
        "5001": { alive: true, commandLine: "観測の子プロセス", parentPid: "5000", startedAt: "2026-11-06T09:00:02.000Z" },
        "38944": { alive: true, commandLine: "無関係な外部 process", parentPid: "777" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    for (const pid of ["4242", "5000", "5001"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(false);
      expect(
        reconciliation.excludedObservations.some(
          (e) => e.path === `process:pid=${pid}` && e.basis === "inspection-execution-runtime-process-self",
        ),
      ).toBe(true);
    }
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 38944"),
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 4"),
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 既知残存リストのpid・listenPort・branch識別情報を観測結果と照合し、生存確認と識別情報不一致を検出する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "37940": { alive: true, commandLine: "別プログラムがPIDを再利用して起動中" },
        "47140": { alive: false, commandLine: null },
      },
      listenPorts: { "4099": { listening: true } },
      branchesText: "verify-target/adf-ru0258-verification\n",
      remoteAbsenceInputs: {
        "https://github.com/yogata/adf-ru0255-github-verify": {
          httpStatus404Observed: false,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          knownResidualEntries: [
            {
              location: "process:pid=37940",
              identifiers: { pid: "37940", commandLine: "bun run verify-server.ts --port 4097" },
              note: "RU-0255 由来の旧専用process（導入時既知残存）",
            },
            {
              location: "listen:port=4099",
              identifiers: { listenPort: "4099" },
              note: "RU-0258 由来の旧listenポート",
            },
            {
              location: "branch:verify-target/adf-ru0258-verification",
              identifiers: { branch: "verify-target/adf-ru0258-verification" },
            },
            {
              location: "https://github.com/yogata/adf-ru0255-github-verify",
              identifiers: { url: "https://github.com/yogata/adf-ru0255-github-verify" },
            },
            {
              location: "process:pid=47140",
              identifiers: { pid: "47140" },
              note: "既に終了済みの旧専用process",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      knownResidualStillPresent: readonly string[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.knownResidualStillPresent).toEqual([
      "process:pid=37940",
      "listen:port=4099",
      "branch:verify-target/adf-ru0258-verification",
      "https://github.com/yogata/adf-ru0255-github-verify",
    ]);
    expect(
      reconciliation.findings.filter((f) => f.code === "known-residual-still-present").length,
    ).toBe(4);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "identifier-mismatch" && f.detail.includes("commandLine"),
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some((f) => f.detail.includes("pid 47140")),
    ).toBe(false);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳記録PIDと既知残存PIDに一致する観測entityは未登録二重検出しない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          kind: "dedicated-process",
          location: "process:pid=4321",
          identifiers: { pid: "4321", commandLine: "bun run verify-server.ts --port 4321" },
        }),
      ]),
      processLiveness: {
        "4321": { alive: true, commandLine: "bun run verify-server.ts --port 4321" },
        "37940": { alive: true, commandLine: "bun run verify-server.ts --port 4097" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 4321"),
      ),
    ).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 37940"),
      ),
    ).toBe(true);
  });

  test("宣言と実装の整合: process-liveness-commandline 宣言とentity系スコープの消費が対応し、検出範囲宣言の実物側網羅列挙が Design 正本に存在する", () => {
    expect(DECLARED_DETECTION_SCOPES).toContain("process-liveness-commandline");
    expect(DECLARED_DETECTION_SCOPES).toContain("known-residual-list");
    const lifecycle = fs.readFileSync(
      path.join(REPO_ROOT, "docs", "designs", "workflows", "verification-resource-lifecycle.md"),
      "utf-8",
    );
    expect(lifecycle).toContain("実物側網羅列挙");
    expect(lifecycle).toContain("照合されないentityも検出対象");
    expect(lifecycle).toContain("実装完全化");
  });

  test("case-close SKILL.md の OS 依存観測コマンド正規形の契約行が存在する", () => {
    const skill = fs.readFileSync(
      path.join(REPO_ROOT, "src", "common", "skills", "agentdev-workflow-case-close", "SKILL.md"),
      "utf-8",
    );
    expect(skill).toContain("OS 依存観測コマンド正規形");
    expect(skill).toContain("Get-CimInstance Win32_Process");
    expect(skill).toContain("Get-NetTCPConnection");
    expect(skill).toContain("gh repo list");
    expect(skill).toContain("tasklist");
    expect(skill).toContain("不正規形");
  });

  test("作成入口の作成先確認接続の契約行が case-open・case-run・adapter の各 SKILL.md に存在する", () => {
    for (const skillName of [
      "agentdev-workflow-case-open",
      "agentdev-workflow-case-run",
      "agentdev-case-run-execution-adapter",
    ]) {
      const skill = fs.readFileSync(
        path.join(REPO_ROOT, "src", "common", "skills", skillName, "SKILL.md"),
        "utf-8",
      );
      expect(skill).toContain("作成先確認");
      expect(skill).toContain("環境指定TEMP");
    }
  });
});

describe("検証用一時資材照合の入力検証（検査設定の省略禁止・検出範囲の解除不可）", () => {
  test("pre-merge で verificationResourceCheck の省略を拒否する（検査設定の解除でゼロ扱いにできない）", () => {
    const base = preMergeInput() as unknown as Record<string, unknown>;
    expect(() => validateInput({ ...base, verificationResourceCheck: undefined })).toThrow(
      /verification/,
    );
  });

  test("inspectionCommands の必須scope被覆欠落を拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const broken = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        inspectionCommands: [
          inspectionCommand("dedicated-area-listing"),
          inspectionCommand("process-liveness"),
        ],
      },
    };
    expect(() => validateInput(broken as unknown)).toThrow(/os-temp-area-scan/);
  });

  test("inspectionCommands の未知scopeを拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const broken = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        inspectionCommands: [
          ...baseCheck?.inspectionCommands ?? [],
          inspectionCommand("unspecified-scope"),
        ],
      },
    };
    expect(() => validateInput(broken as unknown)).toThrow(/unspecified-scope/);
  });

  test("pre-mergeでIssue更新時刻が欠落する入力を拒否する", () => {
    const base = preMergeInput();
    const broken = { ...base, issueUpdatedAt: undefined };
    expect(() => validateInput(broken as unknown)).toThrow(/issue-updated-at/);
  });

  test("observationExclusionGrounds の根拠が空の入力は一括除外の根拠なしとして拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const broken = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        observationExclusionGrounds: [
          { path: "docs/x.md", kind: "role", role: "official-artifact", basis: "   " },
        ],
      },
    };
    expect(() => validateInput(broken as unknown)).toThrow(/basis is required/);
  });

  test("observationExclusionGrounds の未知 kind と非正式成果物の role を拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const brokenKind = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        observationExclusionGrounds: [{ path: "docs/x.md", kind: "unspecified", basis: "root" }],
      },
    };
    expect(() => validateInput(brokenKind as unknown)).toThrow(/kind must be one of/);
    const brokenRole = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        observationExclusionGrounds: [
          { path: "docs/x.md", kind: "role", role: "test-run-generated", basis: "root" },
        ],
      },
    };
    expect(() => validateInput(brokenRole as unknown)).toThrow(/role must be official-artifact/);
  });

  test("observationExclusionGrounds の対象パス欠落を拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const broken = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        observationExclusionGrounds: [{ path: "  ", kind: "attribution", basis: "root" }],
      },
    };
    expect(() => validateInput(broken as unknown)).toThrow(/path is required/);
  });
});

describe("検証用一時資材の回収実行面（Wave-2: 台帳回収・終了判定記録回収）", () => {
  interface InMemoryLedgerRunner extends MechanicalRunner {
    files: Map<string, string>;
    deleted: string[];
    setFile(absolutePath: string, content: string): void;
  }

  function normalizePathKey(absolutePath: string): string {
    return absolutePath.replace(/\\/g, "/");
  }

  function inMemoryLedgerRunner(initialFiles: Record<string, string> = {}): InMemoryLedgerRunner {
    const files = new Map<string, string>(
      Object.entries(initialFiles).map(([key, value]) => [normalizePathKey(key), value]),
    );
    const deleted: string[] = [];
    const base = fakeRunner();
    return {
      ...base,
      files,
      deleted,
      setFile(absolutePath, content) {
        files.set(normalizePathKey(absolutePath), content);
      },
      exists(absolutePath: string) {
        return files.has(normalizePathKey(absolutePath));
      },
      readTextFile(absolutePath: string) {
        return files.get(normalizePathKey(absolutePath)) ?? "";
      },
      deleteFile(absolutePath: string) {
        files.delete(normalizePathKey(absolutePath));
        deleted.push(absolutePath);
      },
    };
  }

  const LEDGER_PATH = "C:/repo/main/.agentdev/tmp/verification-resources/3928.json";
  const ACCEPTANCE_RECORD_PATH = "C:/repo/main/.agentdev/close-acceptance/issue-3934.json";

  function reclaimedLedgerFile(): string {
    return JSON.stringify([
      {
        id: "vr-3928-1",
        caseId: "3928",
        kind: "clone",
        location: "C:/tmp/case-3928/verification-clone",
        identifiers: { path: "C:/tmp/case-3928/verification-clone" },
        collector: "case-run",
        ownership: "child",
        childIssue: 3930,
        recordedBy: "case-run",
        createdAt: "2026-11-05T12:00:00.000Z",
        collectedAt: "2026-11-05T13:00:00.000Z",
      },
    ]);
  }

  function postMergeInputWithReclamation(overrides: {
    ledgerFile?: string | null;
    acceptanceRecord?: boolean;
  } = {}): { input: CloseMechanicalInput; runner: ReturnType<typeof inMemoryLedgerRunner> } {
    const runner = inMemoryLedgerRunner();
    if (overrides.ledgerFile !== null) {
      runner.setFile(LEDGER_PATH, overrides.ledgerFile ?? reclaimedLedgerFile());
    }
    if (overrides.acceptanceRecord) {
      runner.setFile(ACCEPTANCE_RECORD_PATH, JSON.stringify({ issue: 3934, verdict: "pass" }));
    }
    const input: CloseMechanicalInput = {
      phase: "post-merge",
      worktreeRoot: ".worktrees/100-case",
      repoRoot: "C:/repo/main",
      branch: "case-100",
      prNumber: 200,
      reclamation: {
        ledger: {
          mainRepoRoot: "C:/repo/main",
          caseId: "3928",
          confirmation: {
            confirmedBy: "case-close 機械工程（削除確認フロー成立後の回収手続き）",
            confirmedAt: "2026-11-05T18:00:00.000Z",
            targetIds: ["vr-3928-1"],
          },
        },
        closeAcceptanceRecord: { recordPath: ACCEPTANCE_RECORD_PATH, terminalOperationCompleted: true },
      },
    };
    return { input, runner };
  }

  test("post-merge で台帳回収と終了判定記録回収を実行し、収束材料を proposal に記録する", () => {
    const { input, runner } = postMergeInputWithReclamation({ acceptanceRecord: true });
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "verification-resource-reclamation");
    expect(step?.status).toBe("pass");
    expect(runner.files.has(LEDGER_PATH)).toBe(false);
    expect(runner.files.has(ACCEPTANCE_RECORD_PATH)).toBe(false);
    expect(report.proposal.verification_resource_final_record).toContain("vr-3928-1");
    expect((report.diff.reclamation as { ledgerStatus?: string }).ledgerStatus).toBe("reclaimed");
    expect((report.diff.reclamation as { closeAcceptanceRecordStatus?: string }).closeAcceptanceRecordStatus).toBe("reclaimed");
  });

  test("台帳不在は記録欠落として報告し、作成物なしの根拠へ変換しない", () => {
    const { input, runner } = postMergeInputWithReclamation({ ledgerFile: null });
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "verification-resource-reclamation");
    expect((step?.detail as { ledgerStatus?: string }).ledgerStatus).toBe("ledger-missing");
    expect(report.warnings.some((w) => w.includes("no ledger file"))).toBe(true);
    expect(report.proposal.verification_resource_final_record).toBeUndefined();
  });

  test("未回収エントリが残る台帳の回収は実行せず fail step で報告する（全体未完了の維持）", () => {
    const { input, runner } = postMergeInputWithReclamation();
    runner.setFile(
      LEDGER_PATH,
      JSON.stringify([
        {
          id: "vr-3928-2",
          caseId: "3928",
          kind: "remote",
          location: "https://example.test/verification.git",
          identifiers: { url: "https://example.test/verification.git" },
          collector: "case-run",
          ownership: "common",
          childIssue: null,
          recordedBy: "case-run",
          createdAt: "2026-11-05T12:00:00.000Z",
          collectedAt: null,
        },
      ]),
    );
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "verification-resource-reclamation");
    expect(step?.status).toBe("fail");
    expect(runner.files.has(LEDGER_PATH)).toBe(true);
    expect(report.result.exitCategory).toBe("failure");
  });

  test("pre-merge で reclamation 指定を拒否する（回収は終了操作完了後の保持期間契約に従う）", () => {
    const runner = fakeRunner();
    const broken = preMergeInput({
      reclamation: {
        closeAcceptanceRecord: { recordPath: ACCEPTANCE_RECORD_PATH, terminalOperationCompleted: true },
      },
    } as Partial<CloseMechanicalInput>);
    expect(() => runCloseMechanicalSteps(broken, runner)).toThrow(/reclamation/);
  });

  test("入力検証は reclamation の契約違反を拒否する", () => {
    const base = postMergeInputWithReclamation().input as unknown as Record<string, unknown>;
    const badConfirmation = JSON.parse(JSON.stringify(base));
    (badConfirmation.reclamation as { ledger: { confirmation: unknown } }).ledger.confirmation = { confirmedBy: "", confirmedAt: "2026-11-05T18:00:00.000Z", targetIds: ["vr-3928-1"] };
    expect(() => validateInput(badConfirmation)).toThrow();
    const badRecordPath = JSON.parse(JSON.stringify(base));
    (badRecordPath.reclamation as { closeAcceptanceRecord: { recordPath: string } }).closeAcceptanceRecord.recordPath = "";
    expect(() => validateInput(badRecordPath)).toThrow();
    const badCompleted = JSON.parse(JSON.stringify(base));
    (badCompleted.reclamation as { closeAcceptanceRecord: { terminalOperationCompleted: unknown } }).closeAcceptanceRecord.terminalOperationCompleted = "yes";
    expect(() => validateInput(badCompleted)).toThrow();
    const valid = validateInput(JSON.parse(JSON.stringify(base)));
    expect(valid.reclamation?.ledger?.caseId).toBe("3928");
  });
});

// ---------------------------------------------------------------
// 受入未達gapの導出（4制御の実際の接続状態。REQ-118-004/005・REQ-032-046）。
// gap は作成入口の作成先拒否・帰属付き独立観測・回収照合・終了境界の
// 機械観測から導出し、申告文字列・スキル文面・空集合化では成立しない。
// ---------------------------------------------------------------
describe("受入未達gapの導出（4制御の実際の接続状態）", () => {
  function connectedObservation(): AcceptanceControlConnectionObservation {
    return {
      ledgerState: "present",
      creationDestinationRejections: [],
      declaredInspectionScopes: [...REQUIRED_INSPECTION_SCOPES],
      unavailableObservationScopes: [],
      reclamationUncoveredEntries: [],
      terminationRecordIssueNumber: 3931,
      terminationRecordPathResolvable: true,
      terminationRecordWriteCapable: true,
    };
  }

  test("4制御が接続された観測では受入gapが空である（機械受理が成立しうる構成）", () => {
    expect(deriveAcceptanceGaps(connectedObservation())).toHaveLength(0);
  });

  test("①作成入口の作成先拒否を迂回した登録経路は受入未達として導出される", () => {
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      creationDestinationRejections: [
        {
          entryId: "vr-3928-1",
          route: "C:/work/verify-clone-without-case-id",
          reason: "creation destination is not permitted",
        },
      ],
    });
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      code: "creation-entry-rejection-disconnected",
      route: "C:/work/verify-clone-without-case-id",
    });
    expect(gaps[0]?.detail).toContain("vr-3928-1");
    expect(gaps[0]?.detail).toContain("creation destination is not permitted");
  });

  test("②宣言観測スコープの被覆欠落は受入未達として導出される", () => {
    const partialScopes = [...REQUIRED_INSPECTION_SCOPES].filter((scope) => scope !== "os-temp-area-scan");
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      declaredInspectionScopes: partialScopes,
    });
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ code: "observation-scope-coverage-disconnected" });
    expect(gaps[0]?.detail).toContain("os-temp-area-scan");
  });

  test("②検査不能スコープ（観測実行失敗）は空の観測集合に変換せず受入未達として導出される", () => {
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      unavailableObservationScopes: ["os-temp-area-scan", "process-liveness"],
    });
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ code: "observation-unavailable" });
    expect(gaps[0]?.route).toContain("os-temp-area-scan");
    expect(gaps[0]?.route).toContain("process-liveness");
  });

  test("③回収済み実物消失エントリの削除確認被覆欠落は受入未達として導出される", () => {
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      reclamationUncoveredEntries: [
        { entryId: "vr-3928-1", route: "C:/work/temp/adf-3928-verify-clone" },
      ],
    });
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      code: "reclamation-reconciliation-disconnected",
      route: "C:/work/temp/adf-3928-verify-clone",
    });
    expect(gaps[0]?.detail).toContain("vr-3928-1");
  });

  test("④終了判定記録の書出し経路が接続されない観測は受入未達として導出される", () => {
    const brokenIssueNumber = deriveAcceptanceGaps({
      ...connectedObservation(),
      terminationRecordIssueNumber: null,
    });
    const brokenPath = deriveAcceptanceGaps({
      ...connectedObservation(),
      terminationRecordPathResolvable: false,
    });
    const brokenWrite = deriveAcceptanceGaps({
      ...connectedObservation(),
      terminationRecordWriteCapable: false,
    });
    expect(brokenIssueNumber).toHaveLength(1);
    expect(brokenPath).toHaveLength(1);
    expect(brokenWrite).toHaveLength(1);
    for (const gaps of [brokenIssueNumber, brokenPath, brokenWrite]) {
      expect(gaps[0]).toMatchObject({
        code: "termination-boundary-disconnected",
        route: "close-acceptance-record",
      });
    }
  });

  test("台帳不在は①②③の観測不能として受入未達を導出する（作成物ゼロの根拠にしない）", () => {
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      ledgerState: "missing",
    });
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      code: "ledger-uninspectable",
      route: "verification-resources-ledger",
    });
    expect(gaps[0]?.detail).toContain("ledger is missing");
  });

  test("複数の制御不備は単一化せず個別の受入未達として導出される", () => {
    const gaps = deriveAcceptanceGaps({
      ...connectedObservation(),
      creationDestinationRejections: [
        { entryId: "vr-3928-1", route: "C:/work/verify-clone", reason: "not permitted" },
      ],
      reclamationUncoveredEntries: [{ entryId: "vr-3928-2", route: "C:/work/temp/x" }],
    });
    expect(gaps).toHaveLength(2);
    expect(gaps.map((gap) => gap.code)).toEqual([
      "creation-entry-rejection-disconnected",
      "reclamation-reconciliation-disconnected",
    ]);
  });

  test("実経路: 検査コマンド失敗の検査不能スコープは受入gapとしても報告され完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      inspectionExitCodes: { "os-temp-area-scan": 1 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route: string }[];

    expect(gaps.some((g) => g.code === "observation-unavailable" && g.route.includes("os-temp-area-scan"))).toBe(
      true,
    );
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 回収済み実物消失エントリの削除確認被覆欠落は受入gapとしても報告され完了を拒否する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      missingPaths: ["<repo>/tmp-area/verify-clone"],
      ledgerText: JSON.stringify([ledgerEntryJson({ collectedAt: "2026-11-05T10:00:00.000Z" })]),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; detail: string }[];

    expect(gaps.some((g) => g.code === "reclamation-reconciliation-disconnected" && g.detail.includes("vr-3928-1"))).toBe(
      true,
    );
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 終了判定記録の書出し経路が接続されない構成（書出し能力欠落）は受入gapとして報告され完了を許可しない", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    runner.writeTextFile = undefined;
    runner.mkdirRecursive = undefined;
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string }[];

    expect(gaps.some((gap) => gap.code === "termination-boundary-disconnected")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });
});

// ---------------------------------------------------------------
// 終了判定記録（.agentdev/close-acceptance/）の参照 pin（Wave-2 #3932）。
// 書出し側（機械工程）と読み取り検証側（agentdev_gh issue_close 前提検証）の
// 契約の正は Design 文書に置かれており、本 pin はその契約行の存続を固定する。
// ---------------------------------------------------------------
describe("終了判定記録の契約参照 pin（custom-tool-contracts・verification-resource-lifecycle）", () => {
  test("issue_close の終了前提（Tool 実行境界）の契約行が Design 正本に存在する", () => {
    const toolContracts = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "docs",
        "designs",
        "responsibilities",
        "custom-tool-contracts.md",
      ),
      "utf-8",
    );
    expect(toolContracts).toContain("issue_close の終了前提（Case Issue）");
    expect(toolContracts).toContain(".agentdev/close-acceptance/issue-{NNNN}.json");
    expect(toolContracts).toContain("追跡Issue（tracking role）の終了には本前提を適用しない");
    expect(toolContracts).toContain("fail-closed");
    expect(toolContracts).toContain("REQ-052-018");
  });

  test("終了判定記録の様式（対象 Issue 番号・判定対象版・判定生成時刻・判定内容）の契約行がライフサイクル Design に存在する", () => {
    const lifecycle = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "docs",
        "designs",
        "workflows",
        "verification-resource-lifecycle.md",
      ),
      "utf-8",
    );
    expect(lifecycle).toContain("終了判定記録の様式は対象 Issue 番号、判定対象版（close 時点の対象を識別する版情報）、判定生成時刻、判定内容を含み");
    expect(lifecycle).toContain("issue_reopen は当該 Issue の終了判定記録を無効化する");
    expect(lifecycle).toContain("issue_close は、Case Issue（case role）への終了操作について、呼出元の申告によらず自ら終了判定記録を読み取り検証し");
  });
});

describe("観測の除外根拠入力表現と機械消費（除外根拠(2)(3)・REQ-118-005）", () => {
  /** 実git形式の gitignore 対象列挙（git ls-files -i --exclude-standard の相対パス出力形式）。 */
  const realGitIgnoreListing = [
    "docs/designs/workflows/verification-resource-lifecycle.md",
    "node_modules/shared-lib/index.js",
    "node_modules/unrelated-pkg/index.js",
  ].join("\n");

  function groundsInput(
    grounds: readonly {
      path: string;
      kind: string;
      role?: string;
      basis: string;
    }[],
  ): CloseMechanicalInput {
    return {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt: "2026-11-05T08:00:00Z",
      verificationResourceCheck: {
        ...verificationResourceCheck(),
        observationExclusionGrounds: grounds,
      },
    } as unknown as CloseMechanicalInput;
  }

  test("実観測: 役割根拠（正式成果物）・帰属根拠（本件外共有資材）の実体一致付き入力で機械層の除外消費が成立し、根拠のない実在物は未登録のまま維持される", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: `${realGitIgnoreListing}\n`,
    });
    const report = runCloseMechanicalSteps(
      groundsInput([
        {
          path: "docs/designs/workflows/verification-resource-lifecycle.md",
          kind: "role",
          role: "official-artifact",
          basis: "正式成果物: Design 正本文書（document-type-responsibilities の配置・git 追跡実体）",
        },
        {
          path: "node_modules/shared-lib/index.js",
          kind: "attribution",
          basis: "本件外共有資材: 共有 infra（Epic #3928 検証証拠 (iii) protected-shared 分類・帰属記録の実体一致）",
        },
      ]),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(reconciliation.excludedObservations).toEqual([
      { path: "docs/designs/workflows/verification-resource-lifecycle.md", basis: "official-artifact-role-basis" },
      { path: "node_modules/shared-lib/index.js", basis: "unrelated-shared-resource-attribution" },
    ]);
    expect(
      reconciliation.findings.filter((finding) => finding.code === "unregistered-resource"),
    ).toEqual([
      {
        code: "unregistered-resource",
        detail:
          "no ledger record or exclusion basis for the observed temporary resource: node_modules/unrelated-pkg/index.js (source: gitignored-output)",
      },
    ]);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実観測: 全実在物が根拠付きで被覆された構成では機械受理が成立する（実git/実観測の入力形式での正例）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: "docs/designs/workflows/verification-resource-lifecycle.md\nnode_modules/shared-lib/index.js\n",
    });
    const report = runCloseMechanicalSteps(
      groundsInput([
        {
          path: "docs/designs/workflows/verification-resource-lifecycle.md",
          kind: "role",
          role: "official-artifact",
          basis: "正式成果物: Design 正本文書（document-type-responsibilities の配置・git 追跡実体）",
        },
        {
          path: "node_modules/shared-lib/index.js",
          kind: "attribution",
          basis: "本件外共有資材: 共有 infra（Epic #3928 検証証拠 (iii) protected-shared 分類・帰属記録の実体一致）",
        },
      ]),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    expect(reconciliation.excludedObservations).toEqual([
      { path: "docs/designs/workflows/verification-resource-lifecycle.md", basis: "official-artifact-role-basis" },
      { path: "node_modules/shared-lib/index.js", basis: "unrelated-shared-resource-attribution" },
    ]);
  });

  test("実観測: 根拠入力は正規化後パスの完全一致でのみ消費され、prefix（ディレクトリ）一致では消費しない（広いpath/prefixだけでの正式成果物の除外をしない）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: `${realGitIgnoreListing}\n`,
    });
    const report = runCloseMechanicalSteps(
      groundsInput([
        {
          path: "docs/designs/workflows",
          kind: "role",
          role: "official-artifact",
          basis: "正式成果物のディレクトリ指定（prefix での一括指定は消費されない）",
        },
      ]),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some((finding) => finding.code === "unregistered-resource"),
    ).toBe(true);
  });

  test("実観測: 帰属根拠は既知残存リストの照合を上書きせず、既知残存の存在は継続して拒否理由となる（拒否負例の維持）", () => {
    const knownLocation = "C:/Users/ogatay/work/adf-ru0255-residual-clone";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      osTempAreaMatches: [knownLocation],
    });
    const input = {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt: "2026-11-05T08:00:00Z",
      verificationResourceCheck: {
        ...verificationResourceCheck(),
        knownResidualEntries: [
          {
            location: knownLocation,
            identifiers: { path: knownLocation, note: "RU-0255〜0260 era clone（導入時既知残存リスト）" },
          },
        ],
        observationExclusionGrounds: [
          {
            path: knownLocation,
            kind: "attribution",
            basis: "帰属申告（既知残存リストの記載と衝突する申告は照合を上書きしない）",
          },
        ],
      },
    } as unknown as CloseMechanicalInput;
    const report = runCloseMechanicalSteps(input, runner);
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some((finding) => finding.code === "known-residual-still-present"),
    ).toBe(true);
    expect(
      reconciliation.findings.some((finding) => finding.code === "unregistered-resource"),
    ).toBe(false);
  });
});

describe("新規作成判定と既存物照合の区別（REQ-118-005・REQ-032-043/044）", () => {
  test("実経路: 後追いの発生事実記録（evidenced-occurrence-record）の既存実在物は現在実行環境の作成先基準で違断せず、台帳記録の照合で消費される", () => {
    // 別実行環境（Hermes env-TEMP 相当の TMPDIR=C:/Users/ogatay/AppData/Local/hermes/cache/scratch）
    // で過去に作られた実在物の台帳記録。現在実行環境の env 解決 TEMP（node os.tmpdir()・
    // 本実行環境では C:\WINDOWS\TEMP 相当）の配下ではない別領域の所在であることを
    // 模擬パスで表現する（固定模擬パスの既存先例: verification-resources-ledger.test.ts）。
    const hermesTempLocation =
      "C:/Users/ogatay/AppData/Local/hermes/cache/scratch/case-3948/verification-cleanup-work-area";
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          location: hermesTempLocation,
          identifiers: { path: hermesTempLocation, inode: "47569271066421197" },
          recordedBy: "epic-final-close-observation-record",
          createdAt: "2026-11-05T12:00:00.000Z",
          registrationBasis: "evidenced-occurrence-record",
        }),
      ]),
      osTempAreaMatches: [hermesTempLocation],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route: string }[];
    expect(gaps.some((gap) => gap.code === "creation-entry-rejection-disconnected")).toBe(false);
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.findings.some((finding) => finding.code === "unregistered-resource")).toBe(false);
    expect(reconciliation.findings.some((finding) => finding.code === "residual-uncollected")).toBe(true);
  });

  test("実経路: 作成時機械登録（creation-time-machine-registration）のエントリの作成先違反は既存どおり受入gapとして報告される（作成入口接続確認の維持）", () => {
    const outsideLocation = path.join(path.dirname(tmpdir()), "adf-3948-creation-time-violation");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          location: outsideLocation,
          identifiers: { path: outsideLocation },
          registrationBasis: "creation-time-machine-registration",
        }),
      ]),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route: string }[];
    expect(gaps.some((gap) => gap.code === "creation-entry-rejection-disconnected")).toBe(true);
  });
});

describe("観測entity消費の識別経路拡張と自己除外の正規化（REQ-118-005・REQ-032-043/044・反例6677451423）", () => {
  test("実経路: 反例6677451423構成（pid100共有親/pid101検査自身/pid102無関係Case-worker）で自己除外は検査自身とその観測子孫に限られ、共有親と無関係兄弟はunregistered検出として残る", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 101,
      processLiveness: {
        "100": { alive: true, commandLine: "shared parent shell (unrelated to this case)", parentPid: "1" },
        "101": { alive: true, commandLine: "close-mechanical-steps inspection runner", parentPid: "100", startedAt: "2026-11-06T09:00:00.000Z" },
        "102": { alive: true, commandLine: "unrelated Case-worker process", parentPid: "100" },
        "1010": { alive: true, commandLine: "inspection child process spawned by the runner", parentPid: "101", startedAt: "2026-11-06T09:00:01.000Z" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    for (const pid of ["101", "1010"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(false);
      expect(
        reconciliation.excludedObservations.some(
          (e) => e.path === `process:pid=${pid}` && e.basis === "inspection-execution-runtime-process-self",
        ),
      ).toBe(true);
    }
    for (const pid of ["100", "102"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(true);
      expect(
        reconciliation.excludedObservations.some((e) => e.path === `process:pid=${pid}`),
      ).toBe(false);
    }
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: processId未提供時は自己除外を適用せず検査自身もunregistered検出する（未提供時の無根拠除外をしないfail-closed）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "101": { alive: true, commandLine: "close-mechanical-steps inspection runner" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 101"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some((e) => e.basis === "inspection-execution-runtime-process-self"),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 台帳記録pidがchurnしたtransient entityをcommandLine完全一致のper-entity帰属で消費し、PID不一致で未登録検出せずidentifier-mismatchも出さない（実体生存の回収拒否は維持）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-churn-1",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server",
          identifiers: {
            path: "<repo>/tmp-area/verify-server",
            pid: "1234",
            commandLine: "verify-server --port 4097",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server"],
      processLiveness: {
        "5678": { alive: true, commandLine: "verify-server --port 4097", startedAt: "2026-11-06T05:00:00.000Z" },
        "5679": { alive: true, commandLine: "an unrelated process with a different command line" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 5678"),
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5678" && e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(true);
    expect(reconciliation.findings.some((f) => f.code === "identifier-mismatch")).toBe(false);
    expect(
      reconciliation.findings.some((f) => f.code === "residual-uncollected" && f.detail.includes("vr-3928-churn-1")),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 5679"),
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: commandLineを観測できなかったentityは他の取得済み属性（startedAt）の完全一致で帰属確認を試み、一意に一致する場合は消費する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-churn-2",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server-2",
          identifiers: {
            path: "<repo>/tmp-area/verify-server-2",
            pid: "1234",
            commandLine: "verify-server --port 4098",
            startedAt: "2026-11-06T05:00:00.000Z",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server-2"],
      processLiveness: {
        "5678": { alive: true, commandLine: null, startedAt: "2026-11-06T05:00:00.000Z" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 5678"),
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5678" && e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: commandLineがnullで比較可能な他属性もないentityは帰属できずunregistered検出を維持する（確認不能なら拒否維持のfail-closed）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-nullcl-1",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server-3",
          identifiers: {
            path: "<repo>/tmp-area/verify-server-3",
            pid: "1234",
            commandLine: "verify-server --port 4099",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server-3"],
      processLiveness: {
        "5678": { alive: true, commandLine: null },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 5678"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 同一commandLineのentityが複数ある場合は一意に帰属できず両方ともunregistered検出を維持する（曖昧帰属の拒否）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-ambiguous-1",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-worker",
          identifiers: {
            path: "<repo>/tmp-area/verify-worker",
            pid: "1234",
            commandLine: "verify-worker",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-worker"],
      processLiveness: {
        "5678": { alive: true, commandLine: "verify-worker" },
        "5679": { alive: true, commandLine: "verify-worker" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    for (const pid of ["5678", "5679"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(true);
    }
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 同一属性を記録した台帳エントリが複数ある場合はどちらにも帰属せずunregistered検出を維持する（台帳エントリ間の排他帰属）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-exclusive-a",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-worker-a",
          identifiers: { path: "<repo>/tmp-area/verify-worker-a", pid: "1234", commandLine: "verify-worker" },
        }),
        ledgerEntryJson({
          id: "vr-3928-exclusive-b",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-worker-b",
          identifiers: { path: "<repo>/tmp-area/verify-worker-b", pid: "9999", commandLine: "verify-worker" },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-worker-a", "<repo>/tmp-area/verify-worker-b"],
      processLiveness: {
        "5678": { alive: true, commandLine: "verify-worker" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 5678"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: entity形根拠の属性識別（process:commandLine=…）は正規化後値完全一致かつ一意一致のentityのみ消費し、不一致entityはunregistered検出を維持する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "37940": { alive: true, commandLine: "外部共有 runtime process（根拠付き）" },
        "38944": { alive: true, commandLine: "根拠のない外部 process" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            {
              path: "process:commandLine=外部共有 runtime process（根拠付き）",
              kind: "attribution",
              basis: "本件外共有 runtime process の帰属根拠（機械確認可能な記録参照）",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=37940" && e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 38944"),
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: entity形根拠の属性識別は一致entityが複数では消費せず両方ともunregistered検出を維持する（属性一括除外の拒否）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "5678": { alive: true, commandLine: "dup-worker" },
        "5679": { alive: true, commandLine: "dup-worker" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            { path: "process:commandLine=dup-worker", kind: "attribution", basis: "本件外共有 worker の帰属根拠" },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    for (const pid of ["5678", "5679"]) {
      expect(
        reconciliation.findings.some(
          (f) => f.code === "unregistered-resource" && f.detail.includes(`pid ${pid}`),
        ),
      ).toBe(true);
    }
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });
});

describe("自己子孫閉包の時系列検証とcwd単独帰属の不成立（REQ-118-005・反例6678971153・#3954）", () => {
  test("実経路: 自己子孫閉包はparentPid一致だけでは追加せず、子のstartedAtが親より早い時系列矛盾のentityを自己除外に通さない（欠陥1の負例引き継ぎ）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "2026-11-06T15:00:00.000Z" },
        "7000": { alive: true, commandLine: "python unrelated-worker.py", startedAt: "2026-11-06T14:00:00.000Z", parentPid: "5000" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7000"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 自己子孫閉包はparentPidが一致しても時系列情報（startedAt）が取得できないentityを自己除外に通さない（欠落時のfail-closed）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "2026-11-06T15:00:00.000Z" },
        "7001": { alive: true, commandLine: "bun unrelated-worker.js", parentPid: "5000" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7001"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7001" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: Microsoft JSON日時形式のstartedAtを解析し、時系列順の正当な自己子孫を自己除外する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "/Date(1793949637187)/" },
        "7000": { alive: true, commandLine: "python unrelated-worker.py", startedAt: "/Date(1793949638187)/", parentPid: "5000" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7000"),
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
  });

  test("実経路: Microsoft JSON日時形式でも子のstartedAtが親より早ければ自己子孫として除外しない", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "/Date(1793949637187)/" },
        "7002": { alive: true, commandLine: "python unrelated-worker.py", startedAt: "/Date(1793949636187)/", parentPid: "5000" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7002"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7002" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(false);
  });

  test("実経路: Microsoft JSON日時形式でもDate表現可能範囲外のepoch値は有効な日時と解釈せず子を自己除外しない（supervisor反例verbatim・欠陥5の負例）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "2026-11-06T00:00:00Z" },
        "7000": { alive: true, parentPid: "5000", commandLine: "python unrelated-worker.py", startedAt: "/Date(9999999999999999)/" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7000"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: Microsoft JSON日時形式でも桁数過多で非有限になるepoch値は有効な日時と解釈せず子を自己除外しない（400桁の負例）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processId: 5000,
      processLiveness: {
        "5000": { alive: true, commandLine: "close-mechanical-steps inspection runner", startedAt: "2026-11-06T00:00:00Z" },
        "7003": { alive: true, parentPid: "5000", commandLine: "python unrelated-worker.py", startedAt: `/Date(${"9".repeat(400)})/` },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 7003"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=7003" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=5000" && e.basis === "inspection-execution-runtime-process-self",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 台帳記録pidがchurnしたentityはcwd一致だけでは帰属させず、commandLine・startedAtが観測できないentityは未登録検出を維持する（欠陥2の負例引き継ぎ・synthetic-E相当）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3954-cwd-1",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server-e",
          identifiers: {
            path: "<repo>/tmp-area/verify-server-e",
            pid: "100",
            commandLine: "synthetic-E-worker",
            cwd: "<repo>/tmp-area/verify-server-e",
            startedAt: "2026-11-06T05:00:00.000Z",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server-e"],
      processLiveness: {
        "300": { alive: true, commandLine: null, cwd: "<repo>/tmp-area/verify-server-e" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 300"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: commandLine・cwdの複数取得属性が台帳記録と完全一致するentityは従来どおり一意帰属する（正当な属性帰属の維持）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3954-cwd-2",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server-f",
          identifiers: {
            path: "<repo>/tmp-area/verify-server-f",
            pid: "100",
            commandLine: "synthetic-f-worker",
            cwd: "<repo>/tmp-area/verify-server-f",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server-f"],
      processLiveness: {
        "300": { alive: true, commandLine: "synthetic-f-worker", cwd: "<repo>/tmp-area/verify-server-f" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 300"),
      ),
    ).toBe(false);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=300" && e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });
});

describe("commandLine属性値へのFS正規化不適用（反例6679155719・#3954）", () => {
  test("実経路: 属性識別根拠のcommandLine値にFS正規化を適用せず、末尾/の有無が異なる引数値のentityを誤消費しない（--label=case/ と --label=case の負例）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "9000": { alive: true, commandLine: "node worker.js --label=case" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            {
              path: "process:commandLine=node worker.js --label=case/",
              kind: "attribution",
              basis: "本件外共有 worker の帰属根拠（機械確認可能な記録参照）",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 9000"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 属性識別根拠のcommandLine値と観測値は末尾/の有無まで含めてverbatim一致のみ消費する（根拠が/なし・観測が/ありの逆方向負例）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "9001": { alive: true, commandLine: "node worker.js --label=case/" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            {
              path: "process:commandLine=node worker.js --label=case",
              kind: "attribution",
              basis: "本件外共有 worker の帰属根拠（機械確認可能な記録参照）",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 9001"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 属性識別根拠のcommandLine値が観測値とverbatim一致するentityは従来どおり消費する（正当な属性消費の維持）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      processLiveness: {
        "9002": { alive: true, commandLine: "node worker.js --label=case/" },
        "9003": { alive: true, commandLine: "node worker.js --label=other" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("verified-conditions")],
        verificationResourceCheck: {
          ...baseCheck,
          observationExclusionGrounds: [
            {
              path: "process:commandLine=node worker.js --label=case/",
              kind: "attribution",
              basis: "本件外共有 worker の帰属根拠（機械確認可能な記録参照）",
            },
          ],
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.path === "process:pid=9002" && e.basis === "unrelated-shared-resource-attribution",
      ),
    ).toBe(true);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 9002"),
      ),
    ).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 9003"),
      ),
    ).toBe(true);
    expect(reconciliation.permitted).toBe(false);
  });

  test("実経路: 台帳帰属のcommandLine比較にもFS正規化を適用せず、末尾/の有無が異なる引数値のentityを誤帰属しない（両消費経路で同一の属性種別比較）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3954-cl-1",
          kind: "dedicated-process",
          location: "<repo>/tmp-area/verify-server-g",
          identifiers: {
            path: "<repo>/tmp-area/verify-server-g",
            pid: "100",
            commandLine: "node worker.js --label=case/",
            cwd: "<repo>/tmp-area/verify-server-g",
            startedAt: "2026-11-06T05:00:00.000Z",
          },
        }),
      ]),
      missingPaths: ["<repo>/tmp-area/verify-server-g"],
      processLiveness: {
        "9004": {
          alive: true,
          commandLine: "node worker.js --label=case",
          cwd: "<repo>/tmp-area/verify-server-g",
          startedAt: "2026-11-06T05:00:00.000Z",
        },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("verified-conditions")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      excludedObservations: readonly { path: string; basis: string }[];
    };
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 9004"),
      ),
    ).toBe(true);
    expect(
      reconciliation.excludedObservations.some(
        (e) => e.basis === "ledger-entry-attribute-attribution",
      ),
    ).toBe(false);
    expect(reconciliation.permitted).toBe(false);
  });
});

describe("案件作成範囲の母集団宣言（caseCreationScope）と範囲外 attribution-unknown 報告", () => {
  const caseScope = {
    caseIdentifiers: ["3928", "ru0255"],
    scopeAndLimits: "検出できる範囲と限界の宣言文（attribution-unknown 報告へそのまま記録される）",
  };

  test("実経路: 宣言時、案件識別子を含まない範囲外の未知（FS・process・listen・remote）は attribution-unknown 報告のみで完了拒否にならない", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: [
        "node_modules/shared-lib/cache.bin",
        ".agentdev/cache/other-run-artifact.json",
      ].join("\n"),
      processLiveness: {
        "800": { alive: true, commandLine: "C:\\Windows\\System32\\svchost.exe -k netsvcs" },
        "801": { alive: true, commandLine: null },
      },
      listenPorts: { "5354": { listening: true } },
      remoteAbsenceInputs: {
        "https://github.com/example/unrelated-verify-target": {
          httpStatus404Observed: true,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: caseScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
      attributionUnknown: {
        declared: boolean;
        caseIdentifiers: readonly string[];
        scopeAndLimits: string | null;
        entries: readonly { source: string; count: number; examples: readonly string[] }[];
      };
    };
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    expect(reconciliation.attributionUnknown.declared).toBe(true);
    expect(reconciliation.attributionUnknown.caseIdentifiers).toEqual(["3928", "ru0255"]);
    expect(reconciliation.attributionUnknown.scopeAndLimits).toBe(caseScope.scopeAndLimits);
    const counts = Object.fromEntries(
      reconciliation.attributionUnknown.entries.map((entry) => [entry.source, entry.count]),
    );
    expect(counts).toEqual({
      "gitignored-output": 2,
      "process-liveness": 2,
      "listen-port-check": 1,
      "remote-absence-verification": 1,
    });
    const fsEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "gitignored-output",
    );
    expect(fsEntry?.examples[0]).toContain("node_modules/shared-lib/cache.bin");
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 宣言時でも、案件識別子を含む範囲内の未登録（FS・process・remote）は従来どおり unregistered findings で完了を拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: ".agentdev/tmp/case-3928-unregistered-helper.js\n",
      processLiveness: {
        "900": { alive: true, commandLine: "node .agentdev/tmp/case-3928-unregistered-helper.js" },
      },
      listenPorts: {},
      remoteAbsenceInputs: {
        "https://github.com/yogata/adf-ru0255-unregistered-verify": {
          httpStatus404Observed: true,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: caseScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      attributionUnknown: { declared: boolean; entries: readonly unknown[] };
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.filter((f) => f.code === "unregistered-resource")).toHaveLength(3);
    expect(
      reconciliation.findings.some((f) => f.detail.includes("case-3928-unregistered-helper.js")),
    ).toBe(true);
    expect(reconciliation.findings.some((f) => f.detail.includes("pid 900"))).toBe(true);
    expect(
      reconciliation.findings.some((f) => f.detail.includes("adf-ru0255-unregistered-verify")),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.declared).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 宣言時でも台帳不在は記録欠落として拒否され、既知残存リスト記載の実在物は存在する限り拒否理由となる（維持）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerMissing: true,
      osTempAreaMatches: ["<repo>/tmp-verify/adf-3928-known-residual"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          knownResidualEntries: [
            {
              location: "<repo>/tmp-verify/adf-3928-known-residual",
              identifiers: { path: "<repo>/tmp-verify/adf-3928-known-residual" },
            },
          ],
          caseCreationScope: caseScope,
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      ledgerState: string;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.ledgerState).toBe("missing");
    expect(reconciliation.findings.some((f) => f.code === "ledger-missing")).toBe(true);
    expect(reconciliation.findings.some((f) => f.code === "known-residual-still-present")).toBe(true);
  });

  test("実経路: 宣言なしでは範囲外の未知も現行どおり unregistered findings として完了を拒否する（現行動作の維持）", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      gitignoredOutput: "node_modules/shared-lib/cache.bin\n",
      processLiveness: {
        "800": { alive: true, commandLine: "C:\\Windows\\System32\\svchost.exe -k netsvcs" },
      },
      listenPorts: { "5354": { listening: true } },
      remoteAbsenceInputs: {
        "https://github.com/example/unrelated-verify-target": {
          httpStatus404Observed: true,
          authenticationConfirmed: true,
          visibilityConfirmed: true,
          targetIdConfirmed: true,
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
      attributionUnknown: { declared: boolean; entries: readonly unknown[] };
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.filter((f) => f.code === "unregistered-resource")).toHaveLength(4);
    expect(reconciliation.attributionUnknown.declared).toBe(false);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("入力検証: caseCreationScope の空識別子・空宣言文は fail-closed で拒否する", () => {
    const baseCheck = verificationResourceCheck();
    expect(() =>
      validateInput(
        preMergeInput({
          verificationResourceCheck: {
            ...baseCheck,
            caseCreationScope: { caseIdentifiers: [], scopeAndLimits: "宣言" },
          },
        }),
      ),
    ).toThrow(/caseIdentifiers/);
    expect(() =>
      validateInput(
        preMergeInput({
          verificationResourceCheck: {
            ...baseCheck,
            caseCreationScope: { caseIdentifiers: ["3928"], scopeAndLimits: "   " },
          },
        }),
      ),
    ).toThrow(/scopeAndLimits/);
    expect(() =>
      validateInput(
        preMergeInput({
          verificationResourceCheck: {
            ...baseCheck,
            caseCreationScope: { caseIdentifiers: ["3928"], scopeAndLimits: "宣言" },
          },
        }),
      ),
    ).not.toThrow();
  });

  test("実経路: Epic最終close構成（対象PRが既にmerge済み・mergeable=UNKNOWN・state=MERGED）ではmerge前提成立として pass になり終了操作が許可される", () => {
    const runner = fakeRunner({
      ghMergeable: "UNKNOWN",
      ghPrState: "MERGED",
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const polling = report.result.steps.find((s) => s.name === "mergeable-polling");
    expect(polling?.status).toBe("pass");
    expect(polling?.detail).toMatchObject({ mergeable: "UNKNOWN", state: "MERGED", attempts: 1 });
    expect(report.result.exitCategory).toBe("success");
    expect(report.warnings.join("\n")).not.toContain("mergeable state");
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 開いている PR の mergeable=UNKNOWN は従来どおり要判断（warn）で終了操作を許可しない", () => {
    const runner = fakeRunner({
      ghMergeable: "UNKNOWN",
      ghPrState: "OPEN",
      issueBody: "- [x] 条件1\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        mergeablePolling: { intervalSeconds: 0, maxAttempts: 2 },
      }),
      runner,
    );
    const polling = report.result.steps.find((s) => s.name === "mergeable-polling");
    expect(polling?.status).toBe("warn");
    expect(polling?.detail).toMatchObject({ mergeable: "UNKNOWN", state: "OPEN", attempts: 3 });
    expect(report.result.exitCategory).toBe("needs-judgment");
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });
});

describe("案件作成範囲の導出訂正（専用領域・記録由来・識別子陽性シグナル。識別子の不在のみで範囲外へ認定しない）", () => {
  const declaredScope = {
    caseIdentifiers: ["3928", "ru0255"],
    scopeAndLimits: "宣言文（専用領域・台帳記載所在は名前を問わず範囲内。範囲外は関係記録のない共有/OS実体の帰属不明報告のみ）",
  };

  test("実経路: 専用領域（dedicated-area 観測）内の任意名未登録物は宣言識別子に依存せず未登録 findings で完了を拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      dedicatedAreaEntries: ["<repo>/tmp-dedicated/arbitrary.tmp"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      attributionUnknown: { entries: readonly { source: string; count: number }[] };
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("arbitrary.tmp"),
      ),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
  });

  test("実経路: 宣言識別子が本件と無関係（zzz）でも専用領域内の任意名未登録物は未登録拒否のままである（宣言の識別子内容が拒否を免れさせない）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      dedicatedAreaEntries: ["<repo>/tmp-dedicated/leftover.js"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          caseCreationScope: {
            caseIdentifiers: ["zzz"],
            scopeAndLimits: "本件専用領域内は名前を問わず対象（無関係識別子宣言での消費経路確認）",
          },
        },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("leftover.js"),
      ),
    ).toBe(true);
  });

  test("実経路: 番号なしでも台帳記載所在を commandLine で参照するプロセスは記録対応から範囲内と導出し未登録拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          ownership: "common",
          childIssue: null,
        }),
      ]),
      processLiveness: {
        "900": { alive: true, commandLine: "node <repo>/tmp-area/verify-clone/no-number-helper.js" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      attributionUnknown: { entries: readonly { source: string; count: number }[] };
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "unregistered-resource" && f.detail.includes("pid 900"))).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
  });

  test("実経路: 台帳記載所在 subtree 内の任意名 FS 実在物（gitignored 観測）は範囲内として未登録拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          ownership: "common",
          childIssue: null,
        }),
      ]),
      gitignoredOutput: "<repo>/tmp-area/verify-clone/no-number-run-output.tmp\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("no-number-run-output.tmp"),
      ),
    ).toBe(true);
  });

  test("入力検証: caseCreationScope.caseIdentifiers が caseId と無関係な場合は fail-closed で拒否する", () => {
    const baseCheck = verificationResourceCheck();
    expect(() =>
      validateInput(
        preMergeInput({
          verificationResourceCheck: {
            ...baseCheck,
            caseCreationScope: { caseIdentifiers: ["zzz"], scopeAndLimits: "宣言" },
          },
        }),
      ),
    ).toThrow(/caseId/);
    expect(() =>
      validateInput(
        preMergeInput({
          verificationResourceCheck: {
            ...baseCheck,
            caseCreationScope: { caseIdentifiers: ["adf-3928", "ru0255"], scopeAndLimits: "宣言" },
          },
        }),
      ),
    ).not.toThrow();
  });

  test("実経路: 接頭辞のみで本件識別子を含まない OS TEMP 走査合致物は範囲外の帰属不明報告のみ（共有領域・接頭辞全件の自動認定をしない）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      osTempAreaMatches: ["<repo>/tmp-scan-root/adf-unrelated-case-thing"],
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
      attributionUnknown: { entries: readonly { source: string; count: number }[] };
    };
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const osTempEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "os-temp-area",
    );
    expect(osTempEntry?.count).toBe(1);
  });

  test("実経路: 台帳の repo 直下単一セグメント所在（誤作成記録 Users・WINDOWS 等）を参照基準に使わず、C:\\Windows\\… を含む無関係 OS process は帰属不明報告のままにする", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([
        ledgerEntryJson({
          id: "vr-3928-2",
          location: "<repo>/WINDOWS",
          identifiers: { path: "<repo>/WINDOWS" },
          ownership: "common",
          childIssue: null,
        }),
      ]),
      processLiveness: {
        "800": { alive: true, commandLine: "C:\\Windows\\System32\\svchost.exe -k netsvcs" },
      },
      listenPorts: {},
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      attributionUnknown: { entries: readonly { source: string; count: number }[] };
    };
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const processEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "process-liveness",
    );
    expect(processEntry?.count).toBe(1);
  });

  test("実経路: 宣言時も対象の検査不能（観測コマンド失敗）は inspection-unavailable findings で完了を拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: "[]",
      inspectionExitCodes: { "process-liveness": 1 },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: { ...baseCheck, caseCreationScope: declaredScope },
      }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string }[];
    };
    expect(reconciliation.permitted).toBe(false);
    expect(reconciliation.findings.some((f) => f.code === "inspection-unavailable")).toBe(true);
  });
});

describe("台帳記載所在のパス境界（兄弟・類似名別所在の誤範囲内認定の訂正）", () => {
  const boundaryScope = {
    caseIdentifiers: ["3928"],
    scopeAndLimits:
      "台帳記載所在の実 subtree とその参照は名前を問わず範囲内。兄弟・類似名の別所在は範囲外（attribution-unknown 報告のみ）",
  };
  /** 台帳記載所在 <repo>/tmp-area/dedicated-run の台帳エントリ（回収済み・削除確認付きで findings を出さない）。 */
  const boundaryLedgerEntry = () =>
    ledgerEntryJson({
      id: "vr-3928-root",
      location: "<repo>/tmp-area/dedicated-run",
      identifiers: { path: "<repo>/tmp-area/dedicated-run" },
      collectedAt: "2026-11-05T10:00:00.000Z",
      registrationBasis: "evidenced-occurrence-record",
    });
  const boundaryCheck = (baseCheck: VerificationResourceCheck): VerificationResourceCheck => ({
    ...baseCheck,
    deletionConfirmations: [
      {
        entryId: "vr-3928-root",
        identifiers: { path: "<repo>/tmp-area/dedicated-run" },
        confirmedBy: "user",
        confirmedAt: "2026-11-05T10:01:00.000Z",
      },
    ],
    caseCreationScope: boundaryScope,
  });
  const boundaryRunner = (observed: {
    gitignoredOutput?: string;
    processLiveness?: Record<
      string,
      { alive: boolean; commandLine: string | null; cwd?: string }
    >;
  }) =>
    fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([boundaryLedgerEntry()]),
      missingPaths: ["<repo>/tmp-area/dedicated-run"],
      listenPorts: {},
      ...observed,
    });
  const readReconciliation = (report: ReturnType<typeof runCloseMechanicalSteps>) =>
    report.diff.verificationResourceReconciliation as {
      permitted: boolean;
      findings: readonly { code: string; detail: string }[];
      attributionUnknown: {
        declared: boolean;
        entries: readonly { source: string; count: number; examples: readonly string[] }[];
      };
    };

  test("実経路: 台帳記載所在の兄弟（dedicated-run-other）の gitignored 観測は範囲外の attribution-unknown 報告のみで完了拒否にしない（パス境界反例・FS）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      gitignoredOutput: "<repo>/tmp-area/dedicated-run-other/file.tmp\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    expect(reconciliation.attributionUnknown.declared).toBe(true);
    const fsEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "gitignored-output",
    );
    expect(fsEntry?.count).toBe(1);
    expect(fsEntry?.examples[0]).toContain("dedicated-run-other");
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳記載所在の実 subtree 内の任意名未登録物（gitignored 観測）は範囲内として未登録拒否を維持する（パス境界反例・FS の逆方向）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      gitignoredOutput: "<repo>/tmp-area/dedicated-run/unregistered-artifact.tmp\n",
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("unregistered-artifact.tmp"),
      ),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳記載所在の兄弟を cwd とする番号なし process は範囲外の attribution-unknown 報告のみ（パス境界反例・cwd の文字列含有誤認の訂正）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "700": { alive: true, commandLine: null, cwd: "<repo>/tmp-area/dedicated-run-other" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const processEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "process-liveness",
    );
    expect(processEntry?.count).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳記載所在の兄弟を commandLine で参照する番号なし process は範囲外の attribution-unknown 報告のみ（類似名別所在の部分一致を記録対応としない）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "701": { alive: true, commandLine: "node <repo>/tmp-area/dedicated-run-other/job.js" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const processEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "process-liveness",
    );
    expect(processEntry?.count).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳記載所在の実 subtree を commandLine で参照する番号なし process は範囲内として未登録拒否を維持する（パス区切り直後の subtree 参照・commandLine）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "704": { alive: true, commandLine: "node <repo>/tmp-area/dedicated-run/server.js" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 704"),
      ),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 台帳記載所在の別名（dedicated-run別）を commandLine で参照する番号なし process は範囲外の attribution-unknown 報告のみ（日本語名への引き延ばしを記録対応としない）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "705": {
          alive: true,
          commandLine: "node <repo>/tmp-area/dedicated-run別/server.js",
          cwd: "C:/other",
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const processEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "process-liveness",
    );
    expect(processEntry?.count).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳記載所在の別名（dedicated-run@other）を commandLine で参照する番号なし process は範囲外の attribution-unknown 報告のみ（記号を含む名への引き延ばしを記録対応としない）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "706": {
          alive: true,
          commandLine: "node <repo>/tmp-area/dedicated-run@other/server.js",
          cwd: "C:/other",
        },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(true);
    expect(reconciliation.findings).toHaveLength(0);
    const processEntry = reconciliation.attributionUnknown.entries.find(
      (entry) => entry.source === "process-liveness",
    );
    expect(processEntry?.count).toBe(1);
    expect(isCloseOperationPermitted(report)).toEqual({ permitted: true });
  });

  test("実経路: 台帳記載所在の実 subtree を cwd とする process は範囲内として未登録拒否を維持する（cwd の逆方向）", () => {
    const baseCheck = verificationResourceCheck();
    const runner = boundaryRunner({
      processLiveness: {
        "702": { alive: true, commandLine: null, cwd: "<repo>/tmp-area/dedicated-run/worker" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: boundaryCheck(baseCheck),
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 702"),
      ),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実経路: 宣言識別子に無くとも本チェックの正規識別子（評価単位 Issue 番号）を含む process は範囲内の陽性シグナルとして未登録拒否する", () => {
    const baseCheck = verificationResourceCheck();
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([boundaryLedgerEntry()]),
      missingPaths: ["<repo>/tmp-area/dedicated-run"],
      listenPorts: {},
      processLiveness: {
        "703": { alive: true, commandLine: "node helper-for-issue-3931.js" },
      },
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...baseCheck,
          deletionConfirmations: [
            {
              entryId: "vr-3928-root",
              identifiers: { path: "<repo>/tmp-area/dedicated-run" },
              confirmedBy: "user",
              confirmedAt: "2026-11-05T10:01:00.000Z",
            },
          ],
          caseCreationScope: {
            caseIdentifiers: ["adf-3928"],
            scopeAndLimits:
              "宣言識別子は adf-3928。正規識別子（caseId・評価単位 Issue 番号）を含む観測も範囲内の陽性シグナル",
          },
        },
      }),
      runner,
    );
    const reconciliation = readReconciliation(report);
    expect(reconciliation.permitted).toBe(false);
    expect(
      reconciliation.findings.some(
        (f) => f.code === "unregistered-resource" && f.detail.includes("pid 703"),
      ),
    ).toBe(true);
    expect(reconciliation.attributionUnknown.entries).toHaveLength(0);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });
});
