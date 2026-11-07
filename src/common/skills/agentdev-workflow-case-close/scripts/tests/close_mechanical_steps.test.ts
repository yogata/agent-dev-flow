import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import {
  applyEpicChildStatusUpdates,
  assembleReport,
  decideExitCode,
  deriveAcceptancePopulation,
  deriveCurrentWave,
  evaluateContractStateResidue,
  evaluateIntegrityMachineAcceptance,
  extractCompletionCheckboxes,
  isCloseOperationPermitted,
  resolveCloseAcceptanceRecordPath,
  runCloseMechanicalSteps,
  serializeCloseAcceptanceRecord,
  validateInput,
  type CloseMechanicalInput,
  type CommandResult,
  type GateCommandSpec,
  type IntegrityFailureOrigin,
  type IntegrityMachineAcceptanceRecord,
  type MechanicalRunner,
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
    issueNumber: 3931,
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
  currentBranch?: string;
  issueBody?: string;
  epicBody?: string;
  integrityExitCodes?: Record<string, number>;
  previousAcceptanceRecord?: string;
  acceptanceRecordIssueNumber?: number;
  missingPaths?: readonly string[];
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
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--show-current") {
        result.stdout = overrides.currentBranch ?? "case-100";
      }
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--list") {
        result.stdout = "";
      }
      if (spec.command === "git" && spec.args[0] === "diff") {
        result.stdout = "";
      }
      if (spec.args.includes("check_autogen_freshness")) {
        result.stdout = JSON.stringify({ compared: 4, changed: 0 });
      }
      for (const [gateName, exitCode] of Object.entries(overrides.integrityExitCodes ?? {})) {
        if (spec.args.includes(gateName)) result.exitCode = exitCode;
      }
      return result;
    },
    readTextFile(absolutePath) {
      const existingFile = files.get(absolutePath);
      if (existingFile !== undefined) return existingFile;
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
    const noIssueNumber = { ...base, issueNumber: undefined };
    expect(() => validateInput(noIssueNumber)).toThrow(/target-issue-number/);
    const badIssueNumber = { ...base, issueNumber: 0 };
    expect(() => validateInput(badIssueNumber)).toThrow(/target-issue-number/);
    const fractionalIssueNumber = { ...base, issueNumber: 1.5 };
    expect(() => validateInput(fractionalIssueNumber)).toThrow(/target-issue-number/);
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
      reason: "contract-state-residue-unresolved",
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
  test("全品質ゲートと機械工程が実行され、報告 JSON が組み上がる", () => {
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

  test("実経路: Epic最終close構成（対象PRが既にmerge済み・mergeable=UNKNOWN・state=MERGED）ではmerge前提成立として pass になり終了操作が許可される", () => {
    const runner = fakeRunner({
      ghMergeable: "UNKNOWN",
      ghPrState: "MERGED",
      issueBody: "- [x] 条件1\n",
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
      issueNumber: 3942,
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





// ---------------------------------------------------------------
// 終了判定記録（.agentdev/close-acceptance/）の書出しと回収。
// 様式の正は検証に伴う一時資材の取扱いと後片付け責任 Design「終了操作の
// 安全境界と終了判定記録（維持機構）」節。判定内容は必須完了条件の評価結果で、
// 旧台帳照合の結果は含まない。
// ---------------------------------------------------------------
describe("終了判定記録の書出し（変更後の正規完了判定への適合）", () => {
  test("終了判定記録のissue番号はreaderと同じ4桁ゼロ埋めのパスへ解決する", () => {
    expect(resolveCloseAcceptanceRecordPath("<repo>", 12)).toBe(
      path.join("<repo>", ".agentdev", "close-acceptance", "issue-0012.json"),
    );
  });

  test("実経路: 必須項目（対象Issue番号・判定対象版・判定生成時刻・判定内容）と受理状態をmain repo rootへ書き出す", () => {
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n" });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    expect(report.result.exitCategory).toBe("success");
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const recordWrites = runner.writes.filter((w) => w.absolutePath === expectedPath);
    expect(recordWrites.length).toBeGreaterThanOrEqual(1);
    const recordText = recordWrites[recordWrites.length - 1]?.content ?? "{}";
    const record = JSON.parse(recordText) as Record<string, unknown>;
    expect(record.issueNumber).toBe(3931);
    expect(record.targetRevision).toBe("2026-11-05T08:00:00Z");
    expect(Number.isNaN(Date.parse(String(record.generatedAt)))).toBe(false);
    expect(record.accepted).toBe(true);
    expect(record.judgment).toMatchObject({ determined: true, closeAllowed: true, blockingUnmet: [] });
    expect(report.diff.closeAcceptanceRecord).toMatchObject({
      targetRevision: "2026-11-05T08:00:00Z",
      accepted: true,
      written: true,
    });
  });

  test("様式契約: 直列化出力が必須項目を含み、旧台帳照合結果フィールドを含まない", () => {
    const serialized = serializeCloseAcceptanceRecord({
      issueNumber: 3931,
      targetRevision: "2026-11-05T08:00:00Z",
      generatedAt: "2026-11-05T09:00:00.000Z",
      accepted: true,
      judgment: { determined: true, closeAllowed: true, populationState: "populated", blockingUnmet: [] },
    });
    const record = JSON.parse(serialized) as Record<string, unknown>;
    for (const field of ["issueNumber", "targetRevision", "generatedAt", "accepted", "judgment"]) {
      expect(Object.keys(record)).toContain(field);
    }
    for (const legacyField of ["ledger", "ledgerState", "reconciliation", "findings", "gaps", "caseId", "caseCreationScope", "attributionUnknown"]) {
      expect(Object.keys(record)).not.toContain(legacyField);
    }
    expect(serialized.endsWith("\n")).toBe(true);
  });

  test("実経路: 判定内容は必須完了条件の評価結果（拒否理由の必須未達条件IDを含む）を記録する", () => {
    const runner = fakeRunner({ issueBody: "- [ ] 条件1\n- [ ] 条件2\n" });
    runCloseMechanicalSteps(
      preMergeInput({
        acceptanceVerdicts: [
          soundPass("AC-1"),
          { conditionId: "AC-2", required: true, category: "fail", grounds: {} },
        ],
      }),
      runner,
    );
    const expectedPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const recordWrites = runner.writes.filter((w) => w.absolutePath === expectedPath);
    const record = JSON.parse(recordWrites[recordWrites.length - 1]?.content ?? "{}") as {
      accepted: boolean;
      judgment: { determined: boolean; closeAllowed?: boolean; blockingUnmet?: string[] };
    };
    expect(record.accepted).toBe(false);
    expect(record.judgment.determined).toBe(true);
    expect(record.judgment.closeAllowed).toBe(false);
    expect(record.judgment.blockingUnmet).toEqual(["AC-2"]);
  });

  test("後段gate失敗時は受理なしの記録を書き出し、旧accepted記録を無効化する（issue_reopen 無効化の維持）", () => {
    const issueUpdatedAt = "2026-11-05T08:00:00Z";
    const input = {
      ...preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      issueUpdatedAt,
    } as unknown as CloseMechanicalInput;
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      integrityExitCodes: { "textlint-final-check": 1 },
      previousAcceptanceRecord: JSON.stringify({
        issueNumber: 3931,
        targetRevision: issueUpdatedAt,
        generatedAt: "2026-11-05T07:00:00Z",
        accepted: true,
        judgment: { determined: true, closeAllowed: true, blockingUnmet: [] },
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

  test("実経路: pre-merge 開始時のprovisional書出しは受理なし・判定内容未確定で旧記録を上書き無効化し、受理成立時はaccepted記録へ最終書出しされる", () => {
    const runner = fakeRunner({
      issueBody: "- [ ] 条件1\n",
      previousAcceptanceRecord: JSON.stringify({
        issueNumber: 3931,
        targetRevision: "2026-11-04T08:00:00Z",
        generatedAt: "2026-11-04T09:00:00.000Z",
        accepted: true,
        judgment: { determined: true, closeAllowed: true, blockingUnmet: [] },
      }),
    });
    const report = runCloseMechanicalSteps(
      preMergeInput({ acceptanceVerdicts: [soundPass("AC-1")] }),
      runner,
    );
    const recordPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const recordWrites = runner.writes.filter((w) => w.absolutePath === recordPath);
    expect(recordWrites.length).toBe(2);
    const provisionalRecord = JSON.parse(recordWrites[0]?.content ?? "{}") as {
      accepted: boolean;
      judgment: { determined: boolean };
    };
    expect(provisionalRecord.accepted).toBe(false);
    expect(provisionalRecord.judgment.determined).toBe(false);
    const finalRecord = JSON.parse(recordWrites[1]?.content ?? "{}") as {
      accepted: boolean;
      judgment: { determined: boolean; closeAllowed?: boolean };
    };
    expect(finalRecord.accepted).toBe(true);
    expect(finalRecord.judgment.determined).toBe(true);
    expect(finalRecord.judgment.closeAllowed).toBe(true);
    expect(report.result.exitCategory).toBe("success");
  });

  test("実経路: 終了判定記録を書き出せない場合はfail-closedで完了操作を拒否する", () => {
    const recordPath = path.join("<repo>", ".agentdev", "close-acceptance", "issue-3931.json");
    const runner = fakeRunner({
      issueBody: "- [x] 条件1\n",
      previousAcceptanceRecord: JSON.stringify({
        issueNumber: 3931,
        targetRevision: "2026-11-05T08:00:00Z",
        generatedAt: "2026-11-05T07:00:00Z",
        accepted: true,
        judgment: { determined: true, closeAllowed: true, blockingUnmet: [] },
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

  test("実filesystem: 終了判定記録はworktreeではなくmain repo rootへ書き出される", () => {
    const tempRoot = fs.mkdtempSync(
      path.join(REPO_ROOT, "src/common/skills/agentdev-workflow-case-close/scripts/.close-acceptance-test-"),
    );
    testDirectories.push(tempRoot);
    const runner = fakeRunner({ issueBody: "- [x] 条件1\n" });
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
});

describe("終了判定記録の回収実行面（post-merge）", () => {
  interface InMemoryRunner extends MechanicalRunner {
    files: Map<string, string>;
    deleted: string[];
    setFile(absolutePath: string, content: string): void;
  }

  function normalizePathKey(absolutePath: string): string {
    return absolutePath.replace(/\\/g, "/");
  }

  function inMemoryRunner(initialFiles: Record<string, string> = {}): InMemoryRunner {
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

  const ACCEPTANCE_RECORD_PATH = "C:/repo/main/.agentdev/close-acceptance/issue-3934.json";

  function postMergeInputWithReclamation(overrides: {
    acceptanceRecord?: string | null;
    terminalOperationCompleted?: boolean;
  } = {}): { input: CloseMechanicalInput; runner: InMemoryRunner } {
    const runner = inMemoryRunner();
    if (overrides.acceptanceRecord !== null) {
      runner.setFile(ACCEPTANCE_RECORD_PATH, overrides.acceptanceRecord ?? JSON.stringify({ issue: 3934, verdict: "pass" }));
    }
    const input: CloseMechanicalInput = {
      phase: "post-merge",
      worktreeRoot: ".worktrees/100-case",
      repoRoot: "C:/repo/main",
      branch: "case-100",
      prNumber: 200,
      reclamation: {
        closeAcceptanceRecord: {
          recordPath: ACCEPTANCE_RECORD_PATH,
          terminalOperationCompleted: overrides.terminalOperationCompleted ?? true,
        },
      },
    };
    return { input, runner };
  }

  test("post-merge で終了判定記録を回収する", () => {
    const { input, runner } = postMergeInputWithReclamation();
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "close-acceptance-reclamation");
    expect(step?.status).toBe("pass");
    expect(runner.files.has(ACCEPTANCE_RECORD_PATH)).toBe(false);
    expect((report.diff.reclamation as { closeAcceptanceRecordStatus?: string }).closeAcceptanceRecordStatus).toBe("reclaimed");
  });

  test("終了操作未完了の回収要求は保持として返し削除しない", () => {
    const { input, runner } = postMergeInputWithReclamation({ terminalOperationCompleted: false });
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "close-acceptance-reclamation");
    expect(step?.status).toBe("pass");
    expect(runner.files.has(ACCEPTANCE_RECORD_PATH)).toBe(true);
    expect((report.diff.reclamation as { closeAcceptanceRecordStatus?: string }).closeAcceptanceRecordStatus).toBe("retained");
  });

  test("記録不在の回収は冪等にrecord-missingとして報告する", () => {
    const { input, runner } = postMergeInputWithReclamation({ acceptanceRecord: null });
    const report = runCloseMechanicalSteps(input, runner);
    const step = report.result.steps.find((s) => s.name === "close-acceptance-reclamation");
    expect(step?.status).toBe("pass");
    expect((report.diff.reclamation as { closeAcceptanceRecordStatus?: string }).closeAcceptanceRecordStatus).toBe("record-missing");
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
    const badRecordPath = JSON.parse(JSON.stringify(base));
    (badRecordPath.reclamation as { closeAcceptanceRecord: { recordPath: string } }).closeAcceptanceRecord.recordPath = "";
    expect(() => validateInput(badRecordPath)).toThrow();
    const badCompleted = JSON.parse(JSON.stringify(base));
    (badCompleted.reclamation as { closeAcceptanceRecord: { terminalOperationCompleted: unknown } }).closeAcceptanceRecord.terminalOperationCompleted = "yes";
    expect(() => validateInput(badCompleted)).toThrow();
    const valid = validateInput(JSON.parse(JSON.stringify(base)));
    expect(valid.reclamation?.closeAcceptanceRecord?.recordPath).toBe(ACCEPTANCE_RECORD_PATH);
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
    expect(lifecycle).toContain(
      "終了判定記録の様式は、対象 Issue 番号、判定対象版（close 時点の対象を識別する版情報）、判定生成時刻、判定内容（変更後の正規完了判定: 必須完了条件の評価結果。旧台帳照合の結果は含まない）を含み",
    );
    expect(lifecycle).toContain("issue_reopen は当該 Issue の終了判定記録を無効化する");
    expect(lifecycle).toContain("終了操作の前提条件としての機械受理の判定");
  });
});








