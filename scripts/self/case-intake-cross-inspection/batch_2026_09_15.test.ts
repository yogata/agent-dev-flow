// ADF-COVERS(verification): REQ-061-030
//
// TS-005: 2026-09-15 の 20 Case バッチ要約データ（Root Case 本文 execution contract
// 相当、case-ready 側検出源の再現）を fixture として再現適用し、検出条件 (b)
// トレーサビリティポリシー（検証対応任意行）未登録の重複需要として
// policy スナップショット依存の 10 Case が検出されることを検証する。
// 検出数 = 10 が合格条件であり、(a) 同一パス重複の併検出を妨げないが (a) 単独での
// 合格は合格とみなさないため、本テストは (b) の検出結果そのものを比較対象とする。
// カタログから policy への移行（DEC-030 決定4）に伴い、共有領域は
// トレーサビリティポリシー（traceability-policy）を正とする。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { inspectCrossDependencies } from "../../../src/opencode/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_engine.ts";
import type { CrossDependencyInspectionInput } from "../../../src/opencode/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts";

const FIXTURE_DIR = path.join(import.meta.dir, "fixtures", "batch-2026-09-15");

const POLICY_DEPENDENT_CASES = [
  "#2822", "#2823", "#2824", "#2825", "#2831",
  "#2832", "#2833", "#2846", "#2856", "#2858",
] as const;

function loadBatchInput(): CrossDependencyInspectionInput {
  return JSON.parse(
    fs.readFileSync(path.join(FIXTURE_DIR, "cases.json"), "utf-8"),
  ) as CrossDependencyInspectionInput;
}

describe("TS-005: 2026-09-15 の 20 Case バッチ再現", () => {
  test("条件 (b) で policy スナップショット未登録の 10 Case が検出される", () => {
    const input = loadBatchInput();
    const report = inspectCrossDependencies(input, (rel) =>
      fs.readFileSync(path.join(FIXTURE_DIR, rel), "utf-8"),
    );

    expect(report.ok).toBe(true);
    expect(report.mode).toBe("case-ready");
    expect(report.scan.population_count).toBe(20);

    // 合格条件: 条件 (b) の検出数 = 10（(a) 単独の合格は合格とみなさない）
    expect(report.condition_b.length).toBe(1);
    const policyArea = report.condition_b[0];
    expect(policyArea?.area_id).toBe("traceability-policy");
    expect(policyArea?.case_count).toBe(10);
    expect(policyArea?.demand_cases.map((c) => c.case_ref)).toEqual(
      [...POLICY_DEPENDENT_CASES].sort(),
    );

    // 要約データの行集合の総和（48行）が未登録需要として検出される
    const totalRows = policyArea?.demand_cases.reduce(
      (sum, c) => sum + c.unregistered_rows.length,
      0,
    );
    expect(totalRows).toBe(48);

    // 独立 10 Case（batch-A..J）は検出対象外（対象行はスナップショット登録済み）
    for (const demand of policyArea?.demand_cases ?? []) {
      expect(demand.case_ref.startsWith("batch-")).toBe(false);
    }
  });

  test("条件 (a) は本バッチでは検出せず、(b) 単独で合格条件を満たす", () => {
    const input = loadBatchInput();
    const report = inspectCrossDependencies(input, (rel) =>
      fs.readFileSync(path.join(FIXTURE_DIR, rel), "utf-8"),
    );
    expect(report.condition_a.count).toBe(0);
    expect(report.condition_b[0]?.case_count).toBe(10);
  });

  test("冪等再実行でも同一の警告（10 Case 検出）が再提示される", () => {
    const input = loadBatchInput();
    const read = (rel: string): string => fs.readFileSync(path.join(FIXTURE_DIR, rel), "utf-8");
    const first = inspectCrossDependencies(input, read);
    const second = inspectCrossDependencies(input, read);
    expect(second).toEqual(first);
    expect(second.condition_b[0]?.case_count).toBe(10);
  });

  test("CLI 経由（repo root cwd・./ 付きパス指定・REQ-060 形態）でも 10 Case が検出される", () => {
    const repoRoot = path.resolve(import.meta.dir, "..", "..", "..");
    const inputPath = path.join(FIXTURE_DIR, "cases.json");
    const result = Bun.spawnSync([
      process.execPath,
      "./src/opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts",
      "--input",
      inputPath,
      "--root",
      FIXTURE_DIR,
    ], {
      cwd: repoRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(result.exitCode).toBe(0);
    const report = JSON.parse(new TextDecoder().decode(result.stdout)) as {
      condition_b: { area_id: string; case_count: number }[];
    };
    expect(report.condition_b[0]?.area_id).toBe("traceability-policy");
    expect(report.condition_b[0]?.case_count).toBe(10);
  });
});
