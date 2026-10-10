import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import {
  applyEpicChildStatusUpdates,
  assembleReport,
  decideExitCode,
  deriveAcceptancePopulation,
  deriveCurrentWave,
  extractCompletionCheckboxes,
  isCloseOperationPermitted,
  runCloseMechanicalSteps,
  validateInput,
  type CloseMechanicalInput,
  type CommandResult,
  type GateCommandSpec,
  type MechanicalRunner,
} from "../src/close_mechanical_steps";
import type { ConditionVerdict } from "../src/final-acceptance";

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
    ...overrides,
  };
}

function fakeRunner(overrides: {
  ghMergeable?: string;
  worktreeStatus?: string;
  currentBranch?: string;
  issueBody?: string;
  epicBody?: string;
} = {}): MechanicalRunner & { calls: { command: string; args: readonly string[]; cwd: string }[] } {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  return {
    calls,
    run(spec) {
      calls.push({ command: spec.command, args: spec.args, cwd: spec.cwd });
      const result: CommandResult = { exitCode: 0, stdout: "", stderr: "" };
      if (spec.command === "gh") {
        result.stdout = JSON.stringify({ mergeable: overrides.ghMergeable ?? "MERGEABLE" });
      }
      if (spec.command === "git" && spec.args[0] === "status") {
        result.stdout = overrides.worktreeStatus ?? "";
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
      return result;
    },
    readTextFile(absolutePath) {
      if (absolutePath.endsWith("issue-body.md")) return overrides.issueBody ?? "";
      if (absolutePath.endsWith("epic-body.md")) return overrides.epicBody ?? "";
      return "";
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
      population: { contractConditionCount: number; contractRequiredCount: number };
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
