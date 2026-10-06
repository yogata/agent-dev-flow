import { describe, expect, test } from "bun:test";

import {
  applyDefinitionEdit,
  assembleReport,
  decideExitCode,
  runPrepareDefinitionPr,
  validateInput,
  type CommandResult,
  type DefinitionEdit,
  type GateCommandSpec,
  type MechanicalRunner,
  type PrepareDefinitionPrInput,
} from "../src/prepare_definition_pr";

function gate(name: string): GateCommandSpec {
  return {
    name,
    command: "bun",
    args: ["./checker.ts", "--gate", name],
    cwd: "C:/repo/.worktrees/10-definition",
    timeoutMs: 60000,
  };
}

const EDIT: DefinitionEdit = {
  path: "docs/req-index/REQ-TARGET.md",
  oldText: "| REQ-NNNN-NNN | 旧文 |",
  newText: "| REQ-NNNN-NNN | 新文 |",
};

function input(overrides: Partial<PrepareDefinitionPrInput> = {}): PrepareDefinitionPrInput {
  return {
    repoRoot: "C:/repo",
    worktreeRoot: ".worktrees/10-definition",
    branch: "definition/issue-10",
    baseRef: "origin/main",
    rootCaseId: "#10",
    definitionEdits: [EDIT],
    requiresIndexRegeneration: true,
    stagePaths: ["docs/req-index/REQ-TARGET.md", "docs/README.md"],
    commitMessage: "docs(definition): REQ-NNNN-NNN 更新 (Refs #10)",
    traceabilityReqIds: ["REQ-NNNN-NNN"],
    generateIndexesGate: gate("generate_indexes"),
    checkIntegrityGate: gate("check_integrity"),
    traceabilityGate: gate("traceability-check"),
    ...overrides,
  };
}

const REQ_BODY = "# REQ-TARGET\n\n| REQ-NNNN-010 | 他行 |\n| REQ-NNNN-NNN | 旧文 |\n";

function fakeRunner(overrides: {
  existingWorktrees?: string[];
  currentBranch?: string;
  files?: Record<string, string>;
} = {}): MechanicalRunner & { calls: { command: string; args: readonly string[]; cwd: string }[]; written: Record<string, string> } {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  const written: Record<string, string> = {};
  return {
    calls,
    written,
    run(spec) {
      calls.push({ command: spec.command, args: spec.args, cwd: spec.cwd });
      const result: CommandResult = { exitCode: 0, stdout: "", stderr: "" };
      if (spec.command === "git" && spec.args[0] === "worktree" && spec.args[1] === "list") {
        result.stdout = (overrides.existingWorktrees ?? [])
          .map((wt) => `worktree ${wt}`)
          .join("\n");
      }
      if (spec.command === "git" && spec.args[0] === "branch" && spec.args[1] === "--show-current") {
        result.stdout = overrides.currentBranch ?? "definition/issue-10";
      }
      if (spec.command === "git" && spec.args[0] === "status") {
        result.stdout = " M docs/req-index/REQ-TARGET.md\n M docs/README.md\n";
      }
      if (spec.command === "git" && spec.args[0] === "rev-parse") {
        result.stdout = "abc123\n";
      }
      return result;
    },
    readTextFile(absolutePath) {
      const files = overrides.files ?? {};
      if (absolutePath.endsWith("REQ-TARGET.md")) {
        return files["REQ-TARGET.md"] ?? REQ_BODY;
      }
      return files[absolutePath] ?? "";
    },
    writeTextFile(absolutePath, content) {
      written[absolutePath] = content;
    },
    exists() {
      return true;
    },
  };
}

describe("入力検証（品質ゲートの省略禁止・明示パス stage）", () => {
  test("必須品質ゲートが欠落する入力を拒否する", () => {
    const base = input() as unknown as Record<string, unknown>;
    for (const field of ["generateIndexesGate", "checkIntegrityGate", "traceabilityGate"]) {
      const broken = { ...base, [field]: undefined };
      expect(() => validateInput(broken)).toThrow(/omission forbidden/);
    }
  });

  test("スイープ stage（空の stagePaths）を拒否する", () => {
    const broken = input({ stagePaths: [] });
    expect(() => validateInput(broken as unknown as Record<string, unknown>)).toThrow(/stagePaths/);
  });

  test("正規入力を受領する", () => {
    const validated = validateInput(input() as unknown as Record<string, unknown>);
    expect(validated.branch).toBe("definition/issue-10");
  });
});

describe("REQ 行編集の適用", () => {
  test("旧文を一意に特定して置換する", () => {
    const updated = applyDefinitionEdit(REQ_BODY, EDIT);
    expect(updated).toContain("| REQ-NNNN-NNN | 新文 |");
    expect(updated).not.toContain("旧文");
    expect(updated).toContain("| REQ-NNNN-010 | 他行 |");
  });

  test("旧文が見つからない場合は失敗する", () => {
    expect(() => applyDefinitionEdit(REQ_BODY, { ...EDIT, oldText: "存在しない" })).toThrow(/not found/);
  });

  test("旧文が複数箇所にある場合は失敗する（一意性）", () => {
    const duplicated = `${REQ_BODY}| REQ-NNNN-NNN | 旧文 |\n`;
    expect(() => applyDefinitionEdit(duplicated, EDIT)).toThrow(/not unique/);
  });
});

describe("機械工程の実行（worktree・編集・品質ゲート・明示パス stage・commit）", () => {
  test("新規 worktree 作成から commit までを実行し、報告は4要素で成功を返す", () => {
    const runner = fakeRunner();
    const report = runPrepareDefinitionPr(input(), runner);
    const stepNames = report.result.steps.map((s) => s.name);
    expect(stepNames).toEqual([
      "worktree-create",
      "definition-edit",
      "generate_indexes",
      "stage-and-commit",
      "check_integrity",
      "traceability-check",
    ]);
    expect(report.result.exitCategory).toBe("success");
    expect(decideExitCode(report)).toBe(0);
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(Object.keys(runner.written).length).toBe(1);
    expect(runner.written["C:\\repo\\.worktrees\\10-definition\\docs\\requirements\\REQ-TARGET.md"] ?? Object.values(runner.written)[0]).toContain("新文");
    const addCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "add");
    expect(addCall?.args.slice(1)).toEqual(["--", "docs/req-index/REQ-TARGET.md", "docs/README.md"]);
    const commitCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "commit");
    expect(commitCall).toBeDefined();
    expect(report.diff.head).toBe("abc123");
    expect(report.proposal.pr_title).toContain("#10");
  });

  test("既存 worktree が期待 branch 上にある場合は再利用する（冪等）", () => {
    const runner = fakeRunner({
      existingWorktrees: ["C:\\repo\\.worktrees\\10-definition"],
      currentBranch: "definition/issue-10",
    });
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.steps[0]?.name).toBe("worktree-create");
    expect(report.result.steps[0]?.detail).toMatchObject({ reused: true });
    expect(decideExitCode(report)).toBe(0);
    expect(runner.calls.some((c) => c.args[0] === "add" && c.command === "git" && c.args[1] === "worktree")).toBe(false);
  });

  test("既存 worktree が別 branch の場合は冪等再利用を拒否して失敗を返す", () => {
    const runner = fakeRunner({
      existingWorktrees: ["C:\\repo\\.worktrees\\10-definition"],
      currentBranch: "other-branch",
    });
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
  });

  test("check_integrity 失敗時は以後の工程を省略せず途中結果とともに失敗を返す", () => {
    const runner = fakeRunner();
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "bun" && spec.args.includes("check_integrity")) {
        return { exitCode: 3, stdout: "", stderr: "integrity NG" };
      }
      return originalRun(spec);
    };
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
    expect(report.warnings.join("\n")).toContain("check_integrity failed");
    // commit 済み HEAD に対する検査のため、commit は実行された後に check_integrity が失敗する
    const commitCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "commit");
    expect(commitCall).toBeDefined();
  });

  test("dry-run は編集の書込みと stage・commit を実行せず計画を報告する", () => {
    const runner = fakeRunner();
    const report = runPrepareDefinitionPr(input({ dryRun: true }), runner);
    expect(Object.keys(runner.written)).toHaveLength(0);
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "add")).toBe(false);
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "commit")).toBe(false);
    expect(decideExitCode(report)).toBe(0);
    expect(report.warnings.join("\n")).toContain("dry-run");
  });
});

describe("報告 JSON の4要素組み立て", () => {
  test("実行結果・差分・警告・提案本文の4要素を常に保持する", () => {
    const report = assembleReport(
      false,
      [{ name: "s1", status: "warn", detail: {} }],
      { changedFiles: [] },
      [],
      { pr_title: "t" },
    );
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(decideExitCode(report)).toBe(2);
  });
});
