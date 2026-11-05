import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import {
  applyEpicChildStatusUpdates,
  assembleReport,
  classifyResourceRole,
  decideExitCode,
  deriveAcceptancePopulation,
  deriveCurrentWave,
  evaluateContractStateResidue,
  evaluateIntegrityMachineAcceptance,
  extractCompletionCheckboxes,
  isCloseOperationPermitted,
  runCloseMechanicalSteps,
  validateInput,
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
      creationRouteControlConfirmations: [
        {
          route: "arbitrary-path-creation",
          basis: "実行制限能力の消費確認記録の所在（Epic #3928 実現方針の enforcement 記録）",
          confirmedBy: "case-close-model",
        },
      ],
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
  headCommit?: string;
  remotesText?: string;
  worktreeListingText?: string;
  branchesText?: string;
  dedicatedAreaEntries?: readonly string[];
  osTempAreaMatches?: readonly string[];
  processLiveness?: Record<string, { alive: boolean; commandLine: string | null }>;
  listenPorts?: Record<string, { listening: boolean }>;
  remoteAbsenceInputs?: Record<string, unknown>;
  inspectionExitCodes?: Record<string, number>;
  missingPaths?: readonly string[];
} = {}): MechanicalRunner & {
  calls: { command: string; args: readonly string[]; cwd: string }[];
  writes: { absolutePath: string; content: string }[];
} {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  const writes: { absolutePath: string; content: string }[] = [];
  return {
    calls,
    writes,
    exists(absolutePath) {
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
        result.stdout = JSON.stringify({ mergeable: overrides.ghMergeable ?? "MERGEABLE" });
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
      if (spec.command === "git" && spec.args[0] === "rev-parse") {
        result.stdout = `${overrides.headCommit ?? "0275e2d7b1cd4517004a0e7b4a6fc0464de39416"}\n`;
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
      if (absolutePath.includes("verification-resources")) return overrides.ledgerText ?? "[]";
      if (absolutePath.endsWith("issue-body.md")) return overrides.issueBody ?? "";
      if (absolutePath.endsWith("epic-body.md")) return overrides.epicBody ?? "";
      return "";
    },
    writeTextFile(absolutePath, content) {
      writes.push({ absolutePath, content });
    },
    mkdirRecursive() {},
    gitCommonDir() {
      return "<repo>/.git";
    },
    sleep() {},
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

  test("実経路: リポジトリ全体の未追跡対象と状態記録パスを repoRoot で検査し、クリーンな場合は完了操作を許可する", () => {
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
  test("全ステップが成功し、報告は4要素を持ち終了コード 0 に対応する", () => {
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

  test("証拠が揃った対象は同一の実経路で終了操作を許可する（正常終了）", () => {
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
  test("実経路: クリーン構成（台帳記録ゼロ・観測ゼロ・制限確認あり）では照合が成立し完了操作を許可する", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const step = report.result.steps.find((s) => s.name === "verification-resource-reconciliation");
    expect(step?.status).toBe("pass");
    const reconciliation = report.diff.verificationResourceReconciliation as { permitted: boolean };
    expect(reconciliation.permitted).toBe(true);
    expect(report.diff.acceptanceGaps).toEqual([]);
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

  test("実経路: 終了判定記録をmain repo root固定の .agentdev/close-acceptance/issue-{NNNN}.json へ書き出す", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const write = runner.writes.find((w) => w.absolutePath === expectedPath);
    expect(write).toBeDefined();
    const record = JSON.parse(write?.content ?? "{}") as {
      issueNumber: number;
      judgedRevision: string;
      generatedAt: string;
      judgment: {
        reconciliationPermitted: boolean;
        acceptanceGapsRemaining: boolean;
        closeOperationPermitted: boolean;
      };
    };
    expect(record.issueNumber).toBe(3931);
    expect(record.judgedRevision).toBe("0275e2d7b1cd4517004a0e7b4a6fc0464de39416");
    expect(Number.isNaN(Date.parse(record.generatedAt))).toBe(false);
    expect(record.judgment.reconciliationPermitted).toBe(true);
    expect(record.judgment.closeOperationPermitted).toBe(true);
  });

  test("実経路: 照合拒否の場合も終了判定記録を書き出し、判定内容に拒否とfindingsを記録する", () => {
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      ledgerText: JSON.stringify([ledgerEntryJson()]),
      dedicatedAreaEntries: ["<repo>/tmp-area/verify-clone"],
    });
    runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const write = runner.writes.find((w) => w.absolutePath === expectedPath);
    expect(write).toBeDefined();
    const record = JSON.parse(write?.content ?? "{}") as {
      issueNumber: number;
      judgment: {
        reconciliationPermitted: boolean;
        closeOperationPermitted: boolean;
        findings: readonly { code: string }[];
      };
    };
    expect(record.judgment.reconciliationPermitted).toBe(false);
    expect(record.judgment.closeOperationPermitted).toBe(false);
    expect(record.judgment.findings.some((f) => f.code === "residual-uncollected")).toBe(true);
  });

  test("実経路: 終了判定記録を書き出せない場合はfail-closedで完了操作を拒否する", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    delete runner.writeTextFile;
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const reconciliation = report.diff.verificationResourceReconciliation as {
      acceptanceRecordWritten: boolean;
      findings: readonly { code: string }[];
    };

    expect(reconciliation.acceptanceRecordWritten).toBe(false);
    expect(reconciliation.findings.some((finding) => finding.code === "inspection-unavailable")).toBe(true);
    expect(isCloseOperationPermitted(report).permitted).toBe(false);
  });

  test("実filesystem: 終了判定記録はworktreeではなくmain repo rootへ書き出される", () => {
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
      judgment: { closeOperationPermitted: true },
    });
    expect(report.diff.verificationResourceReconciliation).toMatchObject({
      acceptanceRecordPath: recordPath,
      acceptanceRecordWritten: true,
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

  test("実経路: 受入未達（機械検出も実行制限も成立しない作成経路の残存）を報告JSONへ出力し終了操作を許可しない", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n", ledgerText: "[]" });
    const report = runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [soundPass("AC-1")],
        verificationResourceCheck: {
          ...verificationResourceCheck(),
          creationRouteControlConfirmations: [],
        },
      }),
      runner,
    );
    const gaps = report.diff.acceptanceGaps as readonly { code: string; route?: string }[];
    expect(
      gaps.some(
        (g) =>
          g.code === "creation-route-without-detection-or-enforcement" &&
          g.route === "arbitrary-path-creation",
      ),
    ).toBe(true);
    expect(isCloseOperationPermitted(report)).toEqual({
      permitted: false,
      reason: "acceptance-gap-remains",
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

  test("creationRouteControlConfirmations の形式違反（basis欠落）を拒否する", () => {
    const base = preMergeInput();
    const baseCheck = base.verificationResourceCheck;
    const broken = {
      ...base,
      verificationResourceCheck: {
        ...baseCheck,
        creationRouteControlConfirmations: [{ route: "arbitrary-path-creation", confirmedBy: "x" }],
      },
    };
    expect(() => validateInput(broken as unknown)).toThrow(/basis/);
  });
});
