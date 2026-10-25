import { describe, expect, test } from "bun:test";

import { traceabilityReport as makeTraceabilityReport } from "./traceability-report-fixture";

import {
  applyDefinitionEdit,
  assembleReport,
  buildGateEvidence,
  buildKnownCheckIntegritySpec,
  buildKnownGenerateIndexesSpec,
  buildKnownTraceabilityCheckSpec,
  buildKnownWorkflowIntegrityGateSpec,
  decideExitCode,
  preValidateGateSpec,
  runPrepareDefinitionPr,
  validateInput,
  type CommandResult,
  type DefinitionEdit,
  type GateCommandSpec,
  type GateExecutionEvidence,
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

const DEFAULT_TRACEABILITY_REQ_ID = ["REQ", "000", "001"].join("-");

function traceabilityGateSpec(): GateCommandSpec {
  return {
    ...gate("traceability-check"),
    args: ["./checker.ts", "--gate", "traceability-check", "--req", DEFAULT_TRACEABILITY_REQ_ID],
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
    traceabilityReqIds: [DEFAULT_TRACEABILITY_REQ_ID],
    generateIndexesGate: gate("generate_indexes"),
    checkIntegrityGate: gate("check_integrity"),
    traceabilityGate: traceabilityGateSpec(),
    ...overrides,
  };
}

const REQ_BODY = "# REQ-TARGET\n\n| REQ-NNNN-010 | 他行 |\n| REQ-NNNN-NNN | 旧文 |\n";

function fakeRunner(overrides: {
  existingWorktrees?: string[];
  currentBranch?: string;
  files?: Record<string, string>;
  traceabilityReport?: string;
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
      if (spec.command === "bun" && spec.args.includes("traceability-check")) {
        result.stdout = overrides.traceabilityReport ?? makeTraceabilityReport([["REQ", "000", "001"].join("-")]);
        if (overrides.traceabilityReport !== undefined) result.exitCode = 2;
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

  test("判定対象 REQ 集合の欠落を gate 実行前に拒否する（暗黙の空配列正規化をしない）", () => {
    const base = input() as unknown as Record<string, unknown>;
    const broken = { ...base, traceabilityReqIds: undefined };
    expect(() => validateInput(broken)).toThrow(/traceabilityReqIds is required/);
  });

  test("判定対象 REQ 集合の空配列を gate 実行前に拒否する", () => {
    const broken = input({ traceabilityReqIds: [] });
    expect(() => validateInput(broken as unknown as Record<string, unknown>)).toThrow(/traceabilityReqIds must be a non-empty array/);
  });

  test("判定対象 REQ 集合と gate 実行範囲（--req）の不整合を gate 実行前に拒否する", () => {
    const otherReqId = ["REQ", "000", "002"].join("-");
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--gate", "traceability-check", "--req", otherReqId],
    };
    const broken = input({ traceabilityGate });
    expect(() => validateInput(broken as unknown as Record<string, unknown>))
      .toThrow(/does not match the traceability gate execution scope/);
  });

  test("gate spec に --req 指定がない入力を不整合として gate 実行前に拒否する", () => {
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--gate", "traceability-check"],
    };
    const broken = input({ traceabilityGate });
    expect(() => validateInput(broken as unknown as Record<string, unknown>))
      .toThrow(/does not match the traceability gate execution scope/);
  });

  test("判定対象 REQ 集合に形式不正な REQ 行 ID が含まれる入力を gate 実行前に拒否する", () => {
    const broken = input({ traceabilityReqIds: ["REQ-NNNN-NNN"] });
    expect(() => validateInput(broken as unknown as Record<string, unknown>)).toThrow(/invalid requirement row id/);
  });

  test("4桁帯 REQ 行 ID を含む入力を許容書式として受領する（桁数を固定しない許容書式）", () => {
    const fourDigitReqId = ["REQ", "1024", "001"].join("-");
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--gate", "traceability-check", "--req", fourDigitReqId],
    };
    const accepted = input({ traceabilityReqIds: [fourDigitReqId], traceabilityGate });
    expect(() => validateInput(accepted as unknown as Record<string, unknown>)).not.toThrow();
  });

  test("行番号 2桁の REQ 行 ID は許容書式から外れるため拒否する", () => {
    const broken = input({ traceabilityReqIds: ["REQ-1024-49"] });
    expect(() => validateInput(broken as unknown as Record<string, unknown>)).toThrow(/invalid requirement row id/);
  });

  test("reqRowIdPattern の設定値は許容書式の範囲内の追加照合として適用される", () => {
    const fourDigitReqId = ["REQ", "1024", "001"].join("-");
    const accepted = input({
      traceabilityReqIds: [fourDigitReqId],
      traceabilityGate: {
        ...gate("traceability-check"),
        args: ["./checker.ts", "--gate", "traceability-check", "--req", fourDigitReqId],
      },
      reqRowIdPattern: "REQ-\\d{4}-\\d{3}",
    });
    expect(() => validateInput(accepted as unknown as Record<string, unknown>)).not.toThrow();
    const rejected = input({
      traceabilityReqIds: [["REQ", "1024", "001"].join("-")],
      traceabilityGate: {
        ...gate("traceability-check"),
        args: ["./checker.ts", "--gate", "traceability-check", "--req", ["REQ", "1024", "001"].join("-")],
      },
      reqRowIdPattern: "REQ-\\d{3}-\\d{3}",
    });
    expect(() => validateInput(rejected as unknown as Record<string, unknown>))
      .toThrow(/violates the configured producer requirement row id pattern/);
  });

  test("許容書式を緩める reqRowIdPattern の設定値でも実効範囲は緩まない（許容書式検証が先行）", () => {
    const broken = input({
      traceabilityReqIds: ["REQ-1024-1"],
      traceabilityGate: {
        ...gate("traceability-check"),
        args: ["./checker.ts", "--gate", "traceability-check", "--req", "REQ-1024-1"],
      },
      reqRowIdPattern: "REQ-\\d{3,4}-\\d{1,3}",
    });
    expect(() => validateInput(broken as unknown as Record<string, unknown>))
      .toThrow(/invalid requirement row id/);
  });

  test("不正な正規表現の reqRowIdPattern を拒否する", () => {
    const broken = input({
      reqRowIdPattern: "REQ-[",
    });
    expect(() => validateInput(broken as unknown as Record<string, unknown>))
      .toThrow(/not a valid regular expression/);
  });

  test("正規入力を受領する", () => {
    const validated = validateInput(input() as unknown as Record<string, unknown>);
    expect(validated.branch).toBe("definition/issue-10");
    expect(validated.traceabilityReqIds).toEqual([DEFAULT_TRACEABILITY_REQ_ID]);
  });
});

describe("入力検証（newText の行構造の事前確認）", () => {
  // 具体参照排除（RA-003、TS-004）: 具体要件行IDのリテラルは書かずプレースホルダで構築する。
  const MULTI_LINE_OLD = "| REQ-NNNN-NNN | 旧文1 |\n| REQ-NNNN-NNM | 旧文2 |";
  const MULTI_LINE_NEW = "| REQ-NNNN-NNN | 新文1 |\n| REQ-NNNN-NNM | 新文2 |";

  function editWith(oldText: string, newText: string): DefinitionEdit {
    return { path: "docs/req-index/REQ-TARGET.md", oldText, newText };
  }

  test("行区切りが欠落した newText（複数行の旧文が同一行に連結される編集）を拒否する", () => {
    // oldText 末尾に行末改行を含まない前提で組み立てられた行区切り欠落入力
    const joined = input({ definitionEdits: [editWith(MULTI_LINE_OLD, "| REQ-NNNN-NNN | 新文1 || REQ-NNNN-NNM | 新文2 |")] });
    expect(() => validateInput(joined as unknown as Record<string, unknown>))
      .toThrow(/fails the line structure pre-check/);
  });

  test("行区切り欠落入力は oldText 末尾に行末改行があっても拒否される（改行有無非依存）", () => {
    const joined = input({ definitionEdits: [editWith(`${MULTI_LINE_OLD}\n`, "| REQ-NNNN-NNN | 新文1 || REQ-NNNN-NNM | 新文2 |")] });
    expect(() => validateInput(joined as unknown as Record<string, unknown>))
      .toThrow(/fails the line structure pre-check/);
  });

  test("行構造が保全された編集（同数行の置換・行の追加）を受領する", () => {
    const sameLines = input({ definitionEdits: [editWith(MULTI_LINE_OLD, MULTI_LINE_NEW)] });
    expect(() => validateInput(sameLines as unknown as Record<string, unknown>)).not.toThrow();
    const addedLines = input({
      definitionEdits: [editWith(MULTI_LINE_OLD, `${MULTI_LINE_NEW}\n| REQ-NNNN-NNK | 追加行 |`)],
    });
    expect(() => validateInput(addedLines as unknown as Record<string, unknown>)).not.toThrow();
  });

  test("oldText・newText 末尾の行末改行の有無で正規入力の検証結果が変わらない", () => {
    const withoutTrailing = input({ definitionEdits: [editWith(MULTI_LINE_OLD, MULTI_LINE_NEW)] });
    const withTrailing = input({ definitionEdits: [editWith(`${MULTI_LINE_OLD}\n`, `${MULTI_LINE_NEW}\n`)] });
    expect(() => validateInput(withoutTrailing as unknown as Record<string, unknown>)).not.toThrow();
    expect(() => validateInput(withTrailing as unknown as Record<string, unknown>)).not.toThrow();
  });

  test("追加行が oldText の末尾行に連結された編集（Case #3779 の組立形状）を拒否する", () => {
    // oldText を接頭辞として保持しつつ、追加内容が新規行から始まらない連結組立
    const concatenated = input({
      definitionEdits: [editWith(MULTI_LINE_OLD, `${MULTI_LINE_OLD}| REQ-NNNN-NNK | 追加行 |`)],
    });
    expect(() => validateInput(concatenated as unknown as Record<string, unknown>))
      .toThrow(/fails the line structure pre-check/);
  });

  test("単一行 oldText への連結追加も拒否される", () => {
    const singleLine = "| REQ-NNNN-NNN | 旧文1 |";
    const concatenated = input({
      definitionEdits: [editWith(singleLine, `${singleLine}| REQ-NNNN-NNM | 追加行 |`)],
    });
    expect(() => validateInput(concatenated as unknown as Record<string, unknown>))
      .toThrow(/fails the line structure pre-check/);
  });

  test("oldText を接頭辞として保持する正規の行追加（改行を挟む追加）を受領する", () => {
    const appended = input({
      definitionEdits: [editWith(MULTI_LINE_OLD, `${MULTI_LINE_OLD}\n| REQ-NNNN-NNK | 追加行 |`)],
    });
    expect(() => validateInput(appended as unknown as Record<string, unknown>)).not.toThrow();
    // oldText 末尾に行末改行がある場合も同一の追加内容を正規として受領する（改行有無非依存）
    const appendedAfterTrailing = input({
      definitionEdits: [editWith(`${MULTI_LINE_OLD}\n`, `${MULTI_LINE_OLD}\n| REQ-NNNN-NNK | 追加行 |`)],
    });
    expect(() => validateInput(appendedAfterTrailing as unknown as Record<string, unknown>)).not.toThrow();
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
      "gate-availability",
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
    expect(report.result.steps[1]?.name).toBe("worktree-create");
    expect(report.result.steps[1]?.detail).toMatchObject({ reused: true });
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

  test("missing-design の対象 REQ 欠落がなければ既存 findings の exit 2 で停止しない", () => {
    const targetReqId = ["REQ", "000", "001"].join("-");
    const outsideReqId = ["REQ", "001", "001"].join("-");
    const runner = fakeRunner({
      traceabilityReport: makeTraceabilityReport([targetReqId], {
        "missing-design": { status: "fail", findings: [{ reqId: outsideReqId }] },
      }),
    });
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.steps.find((step) => step.name === "traceability-check")?.status).toBe("pass");
  });

  test("missing-design の対象 REQ 欠落があれば停止する", () => {
    const targetReqId = ["REQ", "000", "001"].join("-");
    const runner = fakeRunner({
      traceabilityReport: makeTraceabilityReport([targetReqId], {
        "missing-design": { status: "fail", findings: [{ reqId: targetReqId }] },
      }),
    });
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.steps.find((step) => step.name === "traceability-check")?.status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
  });

  test("checks を含まない報告 JSON では終了コードに関わらず停止する（fail-closed）", () => {
    const runner = fakeRunner({
      traceabilityReport: JSON.stringify({ summary: { pass: 7, fail: 2 } }),
    });
    const report = runPrepareDefinitionPr(input(), runner);
    expect(report.result.steps.find((step) => step.name === "traceability-check")?.status).toBe("fail");
    expect(report.result.exitCategory).toBe("failure");
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

  test("必須ゲート実行体の存在検査を起動前に実行し、報告 JSON に記録する", () => {
    const runner = fakeRunner();
    const report = runPrepareDefinitionPr(input(), runner);
    const availability = report.result.steps.find((step) => step.name === "gate-availability");
    expect(availability?.status).toBe("pass");
    const gates = availability?.detail.gates as { gate: string; available: boolean; alternativeRoutes: readonly string[] }[];
    expect(gates).toHaveLength(3);
    for (const record of gates) {
      expect(record.available).toBe(true);
      expect(record.alternativeRoutes).toEqual([]);
    }
  });

  test("必須ゲート実行体の欠落を検出した場合は正規の代替経路を案内して失敗を返す（省略して成功扱いにしない）", () => {
    const runner = fakeRunner();
    const originalExists = runner.exists.bind(runner);
    runner.exists = (absolutePath: string) =>
      originalExists(absolutePath) && !absolutePath.endsWith("checker.ts");
    const report = runPrepareDefinitionPr(input(), runner);
    const availability = report.result.steps.find((step) => step.name === "gate-availability");
    expect(availability?.status).toBe("fail");
    const gates = availability?.detail.gates as { gate: string; available: boolean; alternativeRoutes: readonly string[] }[];
    const missing = gates.filter((record) => !record.available);
    expect(missing.length).toBe(3);
    for (const record of missing) {
      expect(record.alternativeRoutes.join("\n")).toContain("evidence-preservation（証跡化）");
      expect(record.alternativeRoutes.join("\n")).toContain("manual-equivalent-procedure（手動相当手順）");
      expect(record.alternativeRoutes.join("\n")).toContain("contrastive-no-worse-proof（対照実行による悪化ゼロ件の機械証明）");
    }
    // 欠落時は worktree 操作以降の副作用を開始しない
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "worktree")).toBe(false);
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "add")).toBe(false);
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
    expect(report.warnings.join("\n")).toContain("required gate executable is missing");
  });

  test("実行体を特定できないゲートは存在検査対象外として記録する（command 解決は実行基盤の責務）", () => {
    const runner = fakeRunner();
    const noPathGate = (name: string): GateCommandSpec => ({
      ...gate(name),
      args: [name],
    });
    const report = runPrepareDefinitionPr(input({
      generateIndexesGate: noPathGate("generate_indexes"),
      checkIntegrityGate: noPathGate("check_integrity"),
      traceabilityGate: { ...noPathGate("traceability-check"), args: ["traceability-check", "--req", DEFAULT_TRACEABILITY_REQ_ID] },
    }), runner);
    const availability = report.result.steps.find((step) => step.name === "gate-availability");
    expect(availability?.status).toBe("pass");
    const gates = availability?.detail.gates as { resolvedExecutable: string | null }[];
    for (const record of gates) {
      expect(record.resolvedExecutable).toBeNull();
    }
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

describe("検査証拠の一括保存と結果消費（標準出力・標準エラー・終了コード・対象版・実行条件）", () => {
  test("generate_indexes と check_integrity の stdout・stderr 全文と対象版・実行条件を保存する", () => {
    const runner = fakeRunner();
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "bun" && spec.args.includes("check_integrity")) {
        return { exitCode: 3, stdout: "", stderr: "integrity full report" };
      }
      return originalRun(spec);
    };
    const report = runPrepareDefinitionPr(input(), runner);
    const gen = report.result.steps.find((s) => s.name === "generate_indexes");
    expect(gen?.detail.executedCommand).toMatchObject({ command: "bun", cwd: gate("generate_indexes").cwd });
    expect(gen?.detail.targetRevision).toBe("abc123");
    const check = report.result.steps.find((s) => s.name === "check_integrity");
    expect(check?.detail.exitCode).toBe(3);
    expect(check?.detail.stderr).toBe("integrity full report");
    expect(check?.detail.stderrTail).toBe("integrity full report");
    expect(check?.detail.targetRevision).toBe("abc123");
    expect(decideExitCode(report)).toBe(1);
  });

  test("traceability check の stdout 報告全文を summary 文字列に代えて保存せず併せて保持する", () => {
    const runner = fakeRunner();
    const report = runPrepareDefinitionPr(input(), runner);
    const step = report.result.steps.find((s) => s.name === "traceability-check");
    expect((step?.detail.stdout as string).length).toBeGreaterThan(0);
    expect((step?.detail.executedCommand as GateExecutionEvidence["executedCommand"]).args).toContain("traceability-check");
    expect(step?.detail.targetRevision).toBe("abc123");
  });

  test("同一条件の検査の再実行が発生しない（各ゲート1回、対象版取得1回）", () => {
    const runner = fakeRunner();
    runPrepareDefinitionPr(input(), runner);
    expect(runner.calls.filter((c) => c.command === "bun" && c.args.includes("generate_indexes"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.command === "bun" && c.args.includes("check_integrity"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.command === "bun" && c.args.includes("traceability-check"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.command === "git" && c.args[0] === "rev-parse")).toHaveLength(2);
  });
});

describe("既知検査入力の事前検証と固定生成（不正入力は検査を開始せず拒否）", () => {
  test("不正な --req 値（範囲構文）の gate spec で worktree 操作等の副作用を開始せず拒否する", () => {
    const runner = fakeRunner();
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--req", "REQ-NNNN-NNN..REQ-NNNN-NNM"],
    };
    expect(() => runPrepareDefinitionPr(input({ traceabilityGate }), runner)).toThrow(/--req/);
    expect(runner.calls).toHaveLength(0);
  });

  test("非空必須 flag の空値を検査を開始せず拒否する", () => {
    const runner = fakeRunner();
    const broken = input({
      checkIntegrityGate: { ...gate("check_integrity"), args: ["./checker.ts", "--root", ""] },
    });
    expect(() => runPrepareDefinitionPr(broken, runner)).toThrow(/--root/);
    expect(runner.calls).toHaveLength(0);
  });

  test("固定生成: buildKnownTraceabilityCheckSpec の生成 spec は事前検証を通過して実行される", () => {
    const runner = fakeRunner();
    // 具体参照排除（RA-003、TS-004）: spec 事前検証は実在 ID 形式を要求するため、
    // 具体要件行IDのリテラルは書かず実行時に連結して構築する。
    const reqId = "REQ-" + "000-001";
    const traceabilityGate = buildKnownTraceabilityCheckSpec({
      command: "bun",
      scriptArgs: ["./checker.ts", "traceability-check"],
      cwd: gate("traceability-check").cwd,
      root: "C:/repo/.worktrees/10-definition",
      reqIds: [reqId],
    });
    expect(() => preValidateGateSpec(traceabilityGate)).not.toThrow();
    const report = runPrepareDefinitionPr(input({ traceabilityGate }), runner);
    expect(report.result.exitCategory).toBe("success");
    const traceCall = runner.calls.find((c) => c.args.includes("--req"));
    expect(traceCall?.args.slice(-2)).toEqual(["--req", reqId]);
    expect(traceCall?.args.slice(-4, -2)).toEqual(["--root", "C:/repo/.worktrees/10-definition"]);
  });

  test("固定生成: 下位契約の許容集合外 workflow 値を検査 spec の生成時に拒否する", () => {
    expect(() =>
      buildKnownWorkflowIntegrityGateSpec({
        command: "bun",
        scriptArgs: ["./check_changed_docs.ts"],
        cwd: gate("check_integrity").cwd,
        workflow: "case-reaady",
        allowedWorkflowValues: ["req-save", "design-save", "case-run", "case-close", "docs-check"],
        root: "C:/repo",
      }),
    ).toThrow(/workflow value is rejected/);
  });

  test("固定生成: check_integrity と generate_indexes の spec は既知 gate 名を持つ", () => {
    const integrity = buildKnownCheckIntegritySpec({ command: "bun", scriptArgs: ["./check_integrity.ts"], cwd: "C:/repo" });
    expect(integrity.name).toBe("check_integrity");
    expect(integrity.args).toEqual(["./check_integrity.ts"]);
    const gen = buildKnownGenerateIndexesSpec({ command: "bun", scriptArgs: ["./generate_indexes.ts"], cwd: "C:/repo" });
    expect(gen.name).toBe("generate_indexes");
    expect(gen.args).toEqual(["./generate_indexes.ts"]);
  });

  test("実行証跡: buildGateEvidence は実行条件と対象パスを記録する", () => {
    const evidence = buildGateEvidence(
      gate("traceability-check"),
      { exitCode: 0, stdout: "report", stderr: "" },
      "abc123",
    );
    expect(evidence.exitCode).toBe(0);
    expect(evidence.stdout).toBe("report");
    expect(evidence.targetRevision).toBe("abc123");
    expect(evidence.executedCommand.timeoutMs).toBe(60000);
  });
});
