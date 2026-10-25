// runValidateInputOnly（--validate-input 検証専用経路）の単体検証（REQ-009-053、Case #3862）。
// 入力検証・gate 引数契約検査・ゲート実行体存在確認のみで ok を返し、副作用を持たない。
import { describe, expect, test } from "bun:test";
import { runValidateInputOnly } from "../src/accept_definition_checks.ts";

const cwd = process.cwd().replaceAll("\\", "/");
const gateScript = import.meta.dir + "/../package.json";

function mk(name: string, args: string[]) {
  return { name, command: "bun", args, cwd };
}

function consumerFixture() {
  return {
  phase: "acceptance-checks", repoRoot: cwd, branch: "definition/issue-9", prNumber: 9,
  integrityGates: [mk("integrity-check", [gateScript, "--workflow", "design-save", "--root", cwd])],
  traceabilityGate: mk("traceability-check", [gateScript, "--root", cwd, "--req", "REQ-001-001"]),
  overlapGate: mk("overlap-cross-check", [gateScript, "--input", "x.json", "--root", cwd]),
  generateIndexesGate: mk("generate_indexes", [gateScript]),
} as never;
}

describe("runValidateInputOnly (REQ-009-053 verification-only entry)", () => {
  test("ok: true with all gate executables present (consumer-condition fixture)", () => {
    const outcome = runValidateInputOnly(consumerFixture(), () => true);
    expect(outcome.ok).toBe(true);
    const report = outcome.report as { ok: boolean; mode: string; script: string; sideEffects: string; gateAvailability: { missing: unknown[] } };
    expect(report.mode).toBe("validate-input");
    expect(report.script).toBe("accept_definition_checks");
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
    const fixture = consumerFixture() as unknown as Record<string, unknown>;
    const traceKey = Object.keys(fixture).find((k) => k.toLowerCase().includes("traceability")) ?? "traceabilityGate";
    const trace = fixture[traceKey] as { args: string[] };
    const broken = JSON.parse(JSON.stringify(fixture)) as Record<string, unknown>;
    (broken[traceKey] as { args: string[] }).args = [...trace.args.slice(0, -1), "--req", "REQ-1-1"];
    expect(() => runValidateInputOnly(broken as never, () => true)).toThrow(/--req/);
  });
});
