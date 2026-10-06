import { describe, expect, test } from "bun:test";

import {
  assembleReport,
  decideExitCode,
  runAcceptDefinitionChecks,
  validateInput,
  type AcceptDefinitionInput,
  type CommandResult,
  type GateCommandSpec,
  type MechanicalRunner,
} from "../src/accept_definition_checks";

function gate(name: string): GateCommandSpec {
  return {
    name,
    command: "bun",
    args: ["./checker.ts", "--gate", name],
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
    traceabilityGate: gate("traceability-check"),
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
} = {}): MechanicalRunner & { calls: { command: string; args: readonly string[]; cwd: string }[] } {
  const calls: { command: string; args: readonly string[]; cwd: string }[] = [];
  return {
    calls,
    run(spec) {
      calls.push({ command: spec.command, args: spec.args, cwd: spec.cwd });
      const result: CommandResult = { exitCode: 0, stdout: "", stderr: "" };
      if (spec.command === "bun" && spec.args.includes("overlap-cross-dependencies")) {
        result.stdout = JSON.stringify(overrides.overlapReport ?? { warnings: [] });
      }
      if (spec.command === "bun" && spec.args.includes("traceability-check")) {
        result.stdout = JSON.stringify({ summary: { pass: 9, fail: 0 } });
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
    const runner = fakeRunner();
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
    const runner = fakeRunner();
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
