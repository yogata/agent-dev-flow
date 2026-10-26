// runValidateInputOnly（--validate-input 検証専用経路）の単体検証。
// 入力検証・gate 引数契約検査・ゲート実行体存在確認のみで ok を返し、副作用を持たない。
import { describe, expect, test } from "bun:test";
import { runValidateInputOnly, type PrepareDefinitionPrInput } from "../src/prepare_definition_pr.ts";

const cwd = process.cwd().replaceAll("\\", "/");
const gateScript = import.meta.dir + "/../package.json";

function mk(name: string, args: string[]) {
  return { name, command: "bun", args, cwd };
}

function consumerFixture(): PrepareDefinitionPrInput {
  return {
    repoRoot: cwd,
    worktreeRoot: ".worktrees/x",
    branch: "definition/issue-9",
    baseRef: "origin/main",
    rootCaseId: "#9",
    definitionEdits: [{ path: "a.md", oldText: "o", newText: "n" }],
    requiresIndexRegeneration: false,
    stagePaths: ["a.md"],
    commitMessage: "m",
    traceabilityReqIds: ["REQ-" + "001-001"],
    generateIndexesGate: mk("generate_indexes", [gateScript]),
    checkIntegrityGate: mk("check_integrity", [gateScript, "--profile", "source"]),
    traceabilityGate: mk("traceability-check", [gateScript, "--root", cwd, "--req", "REQ-" + "001-001"]),
  };
}

describe("runValidateInputOnly (verification-only entry)", () => {
  test("ok: true with all gate executables present (consumer-condition fixture)", () => {
    const outcome = runValidateInputOnly(consumerFixture(), () => true);
    expect(outcome.ok).toBe(true);
    const report = outcome.report as { ok: boolean; mode: string; script: string; sideEffects: string; gateAvailability: { missing: unknown[] } };
    expect(report.mode).toBe("validate-input");
    expect(report.script).toBe("prepare_definition_pr");
    expect(report.sideEffects).toBe("none");
    expect(report.gateAvailability.missing).toHaveLength(0);
  });

  test("ok: false and missing gate names when a gate executable is absent", () => {
    const outcome = runValidateInputOnly(consumerFixture(), () => false);
    expect(outcome.ok).toBe(false);
    const report = outcome.report as { gateAvailability: { missing: string[] } };
    expect(report.gateAvailability.missing.length).toBeGreaterThan(0);
  });

  test("rejects an invalid gate flag contract before availability checks (fail-closed)", () => {
    // 正常 fixture から --req 値のみを不正値（空セグメント）へ置換した不正入力を注入する
    // （意図的な契約違反注入のため、入力型への再適合はさせない）。
    const broken = structuredClone(consumerFixture()) as PrepareDefinitionPrInput;
    broken.traceabilityGate!.args = [
      gateScript, "--root", cwd, "--req", "REQ-" + "1-",
    ];
    expect(() => runValidateInputOnly(broken, () => true)).toThrow(/--req/);
  });
});
