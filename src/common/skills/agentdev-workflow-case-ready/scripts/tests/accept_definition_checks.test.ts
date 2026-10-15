import { describe, expect, test } from "bun:test";

import { traceabilityReportFromArgs } from "../../../agentdev-workflow-case-open/scripts/tests/traceability-report-fixture";

import {
  assembleReport,
  buildGateEvidence,
  buildKnownGenerateIndexesSpec,
  buildKnownOverlapCheckSpec,
  buildKnownTraceabilityCheckSpec,
  buildKnownWorkflowIntegrityGateSpec,
  decideExitCode,
  preValidateGateSpec,
  runAcceptDefinitionChecks,
  validateInput,
  type AcceptDefinitionInput,
  type CommandResult,
  type GateCommandSpec,
  type GateExecutionEvidence,
  type MechanicalRunner,
} from "../src/accept_definition_checks";

function gate(name: string, args: readonly string[] = ["./checker.ts", "--gate", name]): GateCommandSpec {
  return {
    name,
    command: "bun",
    args,
    cwd: "C:/repo",
    timeoutMs: 60000,
  };
}

function acceptanceInput(overrides: Partial<AcceptDefinitionInput> = {}): AcceptDefinitionInput {
  return {
    phase: "acceptance-checks",
    repoRoot: "C:/repo",
    branch: "definition/issue-10",
    prNumber: 20,
    integrityGates: [gate("check_integrity"), gate("check_changed_docs")],
    traceabilityGate: gate("traceability-check", [
      "./traceability-check.ts",
      "--root",
      "C:/repo",
      "--req",
      ["REQ", "061", "023"].join("-"),
    ]),
    overlapGate: gate("overlap-cross-dependencies"),
    generateIndexesGate: gate("generate_indexes"),
    autogenDerivedPaths: ["docs/README.md", "docs/decisions/README.md"],
    ...overrides,
  };
}

function cleanupInput(overrides: Partial<AcceptDefinitionInput> = {}): AcceptDefinitionInput {
  return acceptanceInput({
    phase: "canonical-and-cleanup",
    removalPaths: [".agentdev/drafts/req-draft-case-x.md", ".agentdev/backlog/req-units/RU-0001.md"],
    commitMessage: "chore(case-ready): remove consumed draft and RU after case-ready",
    ...overrides,
  });
}

function fakeRunner(overrides: {
  overlapReport?: Record<string, unknown>;
  autogenDiff?: string;
  integrityFailGate?: string;
  ffMergeFails?: boolean;
  indexedPaths?: readonly string[];
  statusOutput?: string;
} = {}): MechanicalRunner & { calls: { command: string; args: readonly string[]; cwd: string }[] } {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  return {
    calls,
    run(spec) {
      calls.push({ command: spec.command, args: spec.args, cwd: spec.cwd });
      const result: CommandResult = { exitCode: 0, stdout: "", stderr: "" };
      if (spec.command === "bun" && spec.args.includes("overlap-cross-dependencies")) {
        result.stdout = JSON.stringify(
          overrides.overlapReport ?? { condition_a: { warnings: [] }, detection_unavailable: [] },
        );
      }
      if (spec.command === "bun" && spec.args.includes("--req")) {
        result.stdout = traceabilityReportFromArgs(spec.args);
      }
      if (spec.command === "bun" && overrides.integrityFailGate && spec.args.includes(overrides.integrityFailGate)) {
        result.exitCode = 3;
        result.stderr = "integrity NG";
      }
      if (spec.command === "git" && spec.args[0] === "diff") {
        result.stdout = overrides.autogenDiff ?? "";
      }
      if (spec.command === "git" && spec.args[0] === "merge" && overrides.ffMergeFails) {
        result.exitCode = 1;
        result.stderr = "not possible to fast-forward";
      }
      if (spec.command === "git" && spec.args[0] === "rev-parse") {
        result.stdout = "abc123\n";
      }
      if (spec.command === "git" && spec.args[0] === "ls-files") {
        result.stdout = overrides.indexedPaths?.includes(spec.args.at(-1) ?? "") ? `${spec.args.at(-1)}\n` : "";
      }
      if (spec.command === "git" && spec.args[0] === "status") {
        result.stdout = overrides.statusOutput ?? "D  .agentdev/drafts/req-draft-case-x.md\nD  .agentdev/backlog/req-units/RU-0001.md\n";
      }
      return result;
    },
  };
}

describe("入力検証（品質ゲートの省略禁止）", () => {
  test("受入検査 phase で必須品質ゲートが欠落する入力を拒否する", () => {
    const base = acceptanceInput() as unknown as Record<string, unknown>;
    for (const field of ["traceabilityGate", "overlapGate", "generateIndexesGate"]) {
      const broken = { ...base, [field]: undefined };
      expect(() => validateInput(broken)).toThrow(/omission forbidden/);
    }
    const noIntegrity = { ...base, integrityGates: [] };
    expect(() => validateInput(noIntegrity)).toThrow(/omission forbidden/);
  });

  test("canonical 再取得 phase は削除対象指定時のみ commit message を必須とする", () => {
    const base = cleanupInput() as unknown as Record<string, unknown>;
    const noPaths = { ...base, removalPaths: [] };
    expect(() => validateInput(noPaths)).not.toThrow();
    const withPathsNoMessage = { ...base, commitMessage: undefined };
    expect(() => validateInput(withPathsNoMessage)).toThrow(/commit-message/);
  });
});

describe("受入検査 phase（忠実性・整合性・品質検査、overlap 突合、AUTOGEN 差分検出、traceability）", () => {
  test("全ゲートを実行し、報告は4要素で成功を返す", () => {
    const runner = fakeRunner();
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const stepNames = report.result.steps.map((s) => s.name);
    expect(stepNames).toEqual([
      "definition-acceptance-checks",
      "overlap-cross-check",
      "autogen-regeneration-diff",
      "traceability-check",
    ]);
    expect(report.result.exitCategory).toBe("success");
    expect(decideExitCode(report)).toBe(0);
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(report.proposal.acceptance_summary).toContain("意味レビュー");
  });

  test("overlap 突合は case-open 配下の共有単一実装を呼び出す（比較ロジックの再実装を行わない）", () => {
    const runner = fakeRunner();
    const overlapGate: GateCommandSpec = {
      name: "overlap-cross-dependencies",
      command: "bun",
      args: [
        "./src/common/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts",
        "--input",
        "input.json",
      ],
      cwd: "C:/repo",
    };
    runAcceptDefinitionChecks(acceptanceInput({ overlapGate }), runner);
    const overlapCall = runner.calls.find((c) => c.command === "bun" && c.args[0]?.includes("inspect_cross_dependencies"));
    expect(overlapCall).toBeDefined();
    expect(overlapCall?.cwd).toBe("C:/repo");
  });

  test("detection_unavailable が空配列のとき summary は 0 件を表示する", () => {
    const runner = fakeRunner({ overlapReport: { condition_a: { warnings: [] }, detection_unavailable: [] } });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const overlap = report.result.steps.find((s) => s.name === "overlap-cross-check");
    expect(overlap?.status).toBe("pass");
    expect(overlap?.detail.summary).toBe("warnings=0 detection_unavailable=0");
  });

  test("detection_unavailable が1件のとき summary は実件数を表示する", () => {
    const runner = fakeRunner({
      overlapReport: {
        condition_a: { warnings: [] },
        detection_unavailable: [{ source: "issue", ref: "#999", reason: "fetch failed" }],
      },
    });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const overlap = report.result.steps.find((s) => s.name === "overlap-cross-check");
    expect(overlap?.status).toBe("pass");
    expect(overlap?.detail.summary).toBe("warnings=0 detection_unavailable=1");
  });

  test("要約は engine 報告 JSON 契約の condition_a.warnings と detection_unavailable を実件数で反映する（TS-001）", () => {
    const runner = fakeRunner({
      overlapReport: {
        condition_a: {
          warnings: [{ path: "src/a.ts", cases: ["#101", "#102"] }],
          count: 1,
        },
        detection_unavailable: [{ source: "issue", ref: "#999", reason: "fetch failed" }],
      },
    });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const overlap = report.result.steps.find((s) => s.name === "overlap-cross-check");
    expect(overlap?.status).toBe("pass");
    expect(overlap?.detail.summary).toBe("warnings=1 detection_unavailable=1");
  });

  test("AUTOGEN 再生成差分を検出した場合は警告とともに要判断を返す（復元を実施）", () => {
    const runner = fakeRunner({ autogenDiff: " docs/README.md | 2 +-\n" });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const autogen = report.result.steps.find((s) => s.name === "autogen-regeneration-diff");
    expect(autogen?.status).toBe("warn");
    expect(report.result.exitCategory).toBe("needs-judgment");
    expect(decideExitCode(report)).toBe(2);
    expect(report.warnings.join("\n")).toContain("AUTOGEN");
    expect(runner.calls.some((c) => c.command === "git" && c.args[0] === "checkout")).toBe(true);
  });

  test("整合性検査の失敗時は後続ゲートを実行せず失敗を返す", () => {
    const runner = fakeRunner({ integrityFailGate: "check_integrity" });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    expect(report.result.exitCategory).toBe("failure");
    expect(decideExitCode(report)).toBe(1);
    const overlapCall = runner.calls.find((c) => c.args.includes("overlap-cross-dependencies"));
    expect(overlapCall).toBeUndefined();
  });
});

describe("canonical 再取得 phase（merge 後 canonical 再取得、draft/RU 削除 commit）", () => {
  test("fetch と ff-only merge で canonical を再取得し、明示パス指定で draft/RU を削除 commit する", () => {
    const runner = fakeRunner({ indexedPaths: [".agentdev/drafts/req-draft-case-x.md", ".agentdev/backlog/req-units/RU-0001.md"] });
    const report = runAcceptDefinitionChecks(cleanupInput(), runner);
    const stepNames = report.result.steps.map((s) => s.name);
    expect(stepNames).toEqual(["canonical-reacquisition", "draft-ru-removal-commit"]);
    expect(decideExitCode(report)).toBe(0);
    expect(runner.calls.some((c) => c.command === "git" && c.args.join(" ") === "fetch origin main")).toBe(true);
    expect(runner.calls.some((c) => c.command === "git" && c.args.join(" ") === "merge --ff-only origin/main")).toBe(true);
    const rmCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "rm");
    expect(rmCall?.args.slice(1)).toEqual(["--", ".agentdev/drafts/req-draft-case-x.md", ".agentdev/backlog/req-units/RU-0001.md"]);
    expect(report.diff.removedPaths).toHaveLength(2);
    expect(report.diff.head).toBe("abc123");
  });

  test("ff-only merge が失敗する場合は削除 commit を行わず失敗を返す", () => {
    const runner = fakeRunner({ ffMergeFails: true });
    const report = runAcceptDefinitionChecks(cleanupInput(), runner);
    expect(report.result.exitCategory).toBe("failure");
    const rmCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "rm");
    expect(rmCall).toBeUndefined();
  });

  test("削除対象以外のステージを検出した場合は commit を行わず待機を報告する（被害側防御）", () => {
    const runner = fakeRunner({ indexedPaths: [".agentdev/drafts/req-draft-case-x.md", ".agentdev/backlog/req-units/RU-0001.md"] });
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "git" && spec.args[0] === "status") {
        return { exitCode: 0, stdout: "D  .agentdev/drafts/req-draft-case-x.md\nM  docs/unrelated.md\n", stderr: "" };
      }
      return originalRun(spec);
    };
    const report = runAcceptDefinitionChecks(cleanupInput(), runner);
    expect(report.result.exitCategory).toBe("failure");
    const commitCall = runner.calls.find((c) => c.command === "git" && c.args[0] === "commit");
    expect(commitCall).toBeUndefined();
    expect(report.warnings.join("\n")).toContain("wait and re-confirm");
  });

  test("未ステージ modified の XY 行は X 列が空白のため staged 扱いしない", () => {
    const runner = fakeRunner({
      indexedPaths: [".agentdev/drafts/req-draft-case-x.md", ".agentdev/backlog/req-units/RU-0001.md"],
      statusOutput: "D  .agentdev/drafts/req-draft-case-x.md\n M docs/unrelated.md\nD  .agentdev/backlog/req-units/RU-0001.md\n",
    });

    const report = runAcceptDefinitionChecks(cleanupInput(), runner);

    expect(report.result.exitCategory).toBe("success");
    expect(runner.calls.some((call) => call.command === "git" && call.args[0] === "commit")).toBe(true);
  });

  test("既にインデックスから削除済みの removal は git rm 対象から除外して skip を報告する", () => {
    const runner = fakeRunner({ indexedPaths: [".agentdev/backlog/req-units/RU-0001.md"] });

    const report = runAcceptDefinitionChecks(cleanupInput(), runner);
    const rmCall = runner.calls.find((call) => call.command === "git" && call.args[0] === "rm");
    const cleanupStep = report.result.steps.find((step) => step.name === "draft-ru-removal-commit");

    expect(rmCall?.args).toEqual(["rm", "--", ".agentdev/backlog/req-units/RU-0001.md"]);
    expect(cleanupStep?.detail.skippedPaths).toEqual([".agentdev/drafts/req-draft-case-x.md"]);
  });
});

describe("報告 JSON の4要素組み立て", () => {
  test("実行結果・差分・警告・提案本文の4要素を常に保持する", () => {
    const report = assembleReport(
      "acceptance-checks",
      [{ name: "s1", status: "pass", detail: {} }],
      {},
      [],
      { acceptance_summary: "s" },
    );
    expect(Object.keys(report).sort()).toEqual(["diff", "proposal", "result", "warnings"]);
    expect(decideExitCode(report)).toBe(0);
  });
});

describe("検査証拠の一括保存と結果消費（標準出力・標準エラー・終了コード・対象版・実行条件）", () => {
  test("整合性検査の stdout・stderr 全文と実行条件・対象版を一回の実行から detail へ保存する", () => {
    const runner = fakeRunner();
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "bun" && spec.args.includes("check_changed_docs")) {
        return { exitCode: 0, stdout: "", stderr: "integrity report only in stderr" };
      }
      return originalRun(spec);
    };
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const step = report.result.steps.find((s) => s.name === "definition-acceptance-checks");
    const saved = step?.detail["check_changed_docs"] as GateExecutionEvidence;
    expect(saved.exitCode).toBe(0);
    expect(saved.stdout).toBe("");
    expect(saved.stderr).toBe("integrity report only in stderr");
    expect(saved.targetRevision).toBe("abc123");
    expect(saved.executedCommand.command).toBe("bun");
    expect(saved.executedCommand.args).toContain("check_changed_docs");
    expect(saved.executedCommand.cwd).toBe(gate("check_changed_docs").cwd);
    expect(saved.executedCommand.timeoutMs).toBe(60000);
  });

  test("traceability check の stdout 報告全文を summary 文字列に代えて保存せず併せて保持する", () => {
    const traceabilityGate = buildKnownTraceabilityCheckSpec({
      command: "bun",
      scriptArgs: ["./checker.ts", "traceability-check"],
      cwd: gate("traceability-check").cwd,
      root: "C:/repo",
      reqIds: ["REQ-061-049"],
    });
    const report = runAcceptDefinitionChecks(acceptanceInput({ traceabilityGate }), fakeRunner());
    const step = report.result.steps.find((s) => s.name === "traceability-check");
    expect(step?.detail.stdout).toBe(traceabilityReportFromArgs(traceabilityGate.args));
    expect(step?.detail.summary).toBe("pass=11 fail=0");
    expect(step?.detail.targetRevision).toBe("abc123");
    expect(step?.detail.targetPaths).toEqual(["C:/repo"]);
  });

  test("非ゼロ終了の整合性検査は証拠を保存し、後続ゲートを実行しない（後続抑止の維持）", () => {
    const runner = fakeRunner({ integrityFailGate: "check_integrity" });
    const report = runAcceptDefinitionChecks(acceptanceInput(), runner);
    const saved = report.result.steps[0]?.detail["check_integrity"] as GateExecutionEvidence;
    expect(saved.exitCode).toBe(3);
    expect(saved.stderr).toBe("integrity NG");
    expect(runner.calls.filter((c) => c.args.includes("overlap-cross-dependencies"))).toHaveLength(0);
    expect(runner.calls.filter((c) => c.args.includes("traceability-check"))).toHaveLength(0);
  });

  test("同一条件の検査の再実行が発生しない（各ゲート1回、対象版取得1回）", () => {
    const runner = fakeRunner();
    runAcceptDefinitionChecks(acceptanceInput(), runner);
    expect(runner.calls.filter((c) => c.args.includes("check_integrity"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.args.includes("check_changed_docs"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.args.some((arg) => arg.includes("traceability-check")))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.args.includes("overlap-cross-dependencies"))).toHaveLength(1);
    expect(runner.calls.filter((c) => c.command === "git" && c.args[0] === "rev-parse")).toHaveLength(1);
  });

  test("ff-only merge 失敗時に標準エラーの全文を保存する（末尾切り捨てに代えない）", () => {
    const longStderr = `prefix-${"E".repeat(500)}`;
    const runner = fakeRunner({ ffMergeFails: true });
    const originalRun = runner.run.bind(runner);
    runner.run = (spec) => {
      if (spec.command === "git" && spec.args[0] === "merge") {
        return { exitCode: 1, stdout: "", stderr: longStderr };
      }
      return originalRun(spec);
    };
    const report = runAcceptDefinitionChecks(cleanupInput(), runner);
    const step = report.result.steps.find((s) => s.name === "canonical-reacquisition");
    expect(step?.detail.stderr).toBe(longStderr);
    expect((step?.detail.stderrTail as string).length).toBe(400);
  });
});

describe("既知検査入力の事前検証と固定生成（不正入力は検査を開始せず拒否）", () => {
  test("不正な --req 値（範囲構文）の gate spec で高価な検査を開始せず拒否する", () => {
    const runner = fakeRunner();
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--req", "REQ-061-001..REQ-061-050"],
    };
    expect(() => runAcceptDefinitionChecks(acceptanceInput({ traceabilityGate }), runner)).toThrow(/--req/);
    expect(runner.calls).toHaveLength(0);
  });

  test("--req の不正形式を検査を開始せず拒否する", () => {
    const runner = fakeRunner();
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--req", "REQ-061-1"],
    };
    expect(() => runAcceptDefinitionChecks(acceptanceInput({ traceabilityGate }), runner)).toThrow(/--req/);
    expect(runner.calls).toHaveLength(0);
  });

  test("非空必須 flag の空値を検査を開始せず拒否する", () => {
    const runner = fakeRunner();
    const traceabilityGate: GateCommandSpec = {
      ...gate("traceability-check"),
      args: ["./checker.ts", "--root", ""],
    };
    expect(() => runAcceptDefinitionChecks(acceptanceInput({ traceabilityGate }), runner)).toThrow(/--root/);
    expect(runner.calls).toHaveLength(0);
  });

  test("正当な入力では必要検査が実行される（固定生成 spec の実経路）", () => {
    const runner = fakeRunner();
    const traceabilityGate = buildKnownTraceabilityCheckSpec({
      command: "bun",
      scriptArgs: ["./checker.ts"],
      cwd: gate("traceability-check").cwd,
      root: "C:/repo",
      reqIds: ["REQ-061-049", "REQ-061-050"],
    });
    const report = runAcceptDefinitionChecks(acceptanceInput({ traceabilityGate }), runner);
    expect(report.result.steps[3]?.detail.stdout).toBe(traceabilityReportFromArgs(traceabilityGate.args));
    expect(report.result.steps.map((step) => [step.name, step.status])).toEqual([
      ["definition-acceptance-checks", "pass"],
      ["overlap-cross-check", "pass"],
      ["autogen-regeneration-diff", "pass"],
      ["traceability-check", "pass"],
    ]);
    expect(report.result.exitCategory).toBe("success");
    const traceCall = runner.calls.find((c) => c.args.includes("--req"));
    expect(traceCall?.args.slice(-2)).toEqual(["--req", "REQ-061-049,REQ-061-050"]);
  });

  test("固定生成: 下位契約の許容集合外 workflow 値を検査 spec の生成時に拒否する", () => {
    expect(() =>
      buildKnownWorkflowIntegrityGateSpec({
        command: "bun",
        scriptArgs: ["./check_changed_docs.ts"],
        cwd: "C:/repo",
        workflow: "design-sav",
        allowedWorkflowValues: ["req-save", "design-save", "case-run", "case-close", "docs-check"],
        root: "C:/repo",
      }),
    ).toThrow(/workflow value is rejected/);
  });

  test("固定生成: 許容集合内の workflow 値の spec は事前検証を通過して実行される", () => {
    const runner = fakeRunner();
    const spec = buildKnownWorkflowIntegrityGateSpec({
      command: "bun",
      scriptArgs: ["./check_changed_docs.ts"],
      cwd: "C:/repo",
      workflow: "design-save",
      allowedWorkflowValues: ["req-save", "design-save", "case-run", "case-close", "docs-check"],
      root: "C:/repo",
    });
    expect(() => preValidateGateSpec(spec)).not.toThrow();
    const report = runAcceptDefinitionChecks(acceptanceInput({ integrityGates: [spec] }), runner);
    expect(report.result.exitCategory).toBe("success");
    const call = runner.calls.find((c) => c.args.includes("--workflow"));
    expect(call?.args).toEqual(["./check_changed_docs.ts", "--workflow", "design-save", "--root", "C:/repo"]);
  });

  test("固定生成: buildKnownTraceabilityCheckSpec は REQ 行 ID 形式を生成時に検証する", () => {
    expect(() =>
      buildKnownTraceabilityCheckSpec({
        command: "bun",
        scriptArgs: ["./checker.ts"],
        cwd: "C:/repo",
        root: "C:/repo",
        reqIds: ["REQ-061-49"],
      }),
    ).toThrow(/invalid requirement row id/);
  });

  test("固定生成: overlap と generate_indexes の spec は下位契約に沿った args を持つ", () => {
    const overlap = buildKnownOverlapCheckSpec({
      command: "bun",
      scriptArgs: ["./inspect_cross_dependencies.ts"],
      cwd: "C:/repo",
      inputPath: "input.json",
      root: "C:/repo",
    });
    expect(overlap.name).toBe("overlap-cross-check");
    expect(overlap.args).toEqual(["./inspect_cross_dependencies.ts", "--input", "input.json", "--root", "C:/repo"]);
    const gen = buildKnownGenerateIndexesSpec({ command: "bun", scriptArgs: ["./generate_indexes.ts"], cwd: "C:/repo" });
    expect(gen.name).toBe("generate_indexes");
    expect(gen.args).toEqual(["./generate_indexes.ts"]);
  });

  test("必須品質ゲートの省略拒否は入力検証（validateInput）で行われる", () => {
    const base = acceptanceInput() as unknown as Record<string, unknown>;
    expect(() => validateInput({ ...base, traceabilityGate: undefined })).toThrow(/omission forbidden/);
  });
});

describe("実行証跡の構築（buildGateEvidence）", () => {
  test("実行条件・終了コード・標準出力・標準エラー・対象版・対象パスを記録する", () => {
    const spec: GateCommandSpec = { ...gate("traceability-check"), args: ["./checker.ts", "--root", "C:/repo", "traceability-check"] };
    const evidence = buildGateEvidence(
      spec,
      { exitCode: 2, stdout: "report", stderr: "warn" },
      "abc123",
    );
    expect(evidence.exitCode).toBe(2);
    expect(evidence.stdout).toBe("report");
    expect(evidence.stderr).toBe("warn");
    expect(evidence.targetRevision).toBe("abc123");
    expect(evidence.targetPaths).toEqual(["C:/repo"]);
    expect(evidence.executedCommand.timeoutMs).toBe(60000);
  });
});
