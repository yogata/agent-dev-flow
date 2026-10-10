// agentdev-traceability 配布スキルの棚卸し（inventory）能力の検証。
// 対応関係: REQ-107-003（sidecar 正規配置・traceability/agentdev-traceability.yaml）。
//
// - 正規成果物を宣言済みの対応関係と独立に直接走査で棚卸しし、宣言外の
//   実在成果物・追跡候補を発見候補として扱えること
// - 発見候補は advisory であり、対応関係の欠落と誤判定しないこと
// - covers と links のいずれの宣言にも現れる成果物は発見候補から除外されること

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildInventory } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/inventory.ts";
import { scanCorpus } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/check.ts";
import { currentRequirementLineIds } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/requirements.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-inventory-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  writeFixture("docs/requirements/REQ-901.md", [
    "| ID | 要件 |",
    "|---|---|",
    "| REQ-900-301 | 例 |",
  ]);
  // covers 宣言済みの成果物
  writeFixture("docs/designs/inv-spec.md", ["# 設計"]);
  writeFixture("traceability/inv-component.yaml", [
    "component: inv-component",
    "design:",
    "  docs/designs/inv-spec.md:",
    "    - REQ-900-301",
  ]);
  // links 宣言済みの成果物（covers には現れない）
  writeFixture("src/inv-linked.ts", ["// ADF-LINKS(upstream): docs/designs/inv-spec.md"]);
  // 宣言外の実在成果物（発見候補）
  writeFixture("docs/designs/undeclared-artifact.md", ["# 宣言外の成果物"]);
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("棚卸しと発見候補（REQ-107-003）", () => {
  it("宣言済み対応関係と独立に直接走査し、宣言外の実在成果物を発見候補として返す", () => {
    const inventory = buildInventory(ROOT);
    expect(inventory.corpusArtifacts).toContain("docs/designs/undeclared-artifact.md");
    expect(inventory.discoveredCandidates).toEqual(["docs/designs/undeclared-artifact.md"]);
    expect(inventory.emptyResult).toBe(false);
  });

  it("covers 宣言済みと links 宣言済みの成果物は発見候補から除外される", () => {
    const inventory = buildInventory(ROOT);
    expect(inventory.discoveredCandidates).not.toContain("docs/designs/inv-spec.md");
    expect(inventory.discoveredCandidates).not.toContain("src/inv-linked.ts");
    expect(inventory.declaredArtifacts).toContain("docs/designs/inv-spec.md");
    expect(inventory.linkedArtifacts).toContain("src/inv-linked.ts");
    expect(inventory.linkedArtifacts).toContain("docs/designs/inv-spec.md");
  });

  it("発見候補は advisory であり対応関係の欠落として判定しない", () => {
    const inventory = buildInventory(ROOT);
    // note が欠落と誤判定しない旨を保持する（advisory・候補提供の明示）
    expect(inventory.note).toContain("欠落を意味しない");
    // 発見候補の存在は check を不合格にしない
    const scan = scanCorpus(ROOT);
    const report = runChecks(scan, currentRequirementLineIds(ROOT), { completenessReqIds: ["REQ-900-301"] });
    expect(report.checks["missing-design"].findings).toEqual([]);
  });
});
