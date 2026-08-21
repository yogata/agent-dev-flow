// ADF-COVERS(verification): REQ-012-045
//
// agentdev-traceability 配布スキル coverage の公開契約検証（OU-002、Issue #2360）。
// 全件返却（候補数上限・ランキング・探索深度による黙った切り捨ての不在）、
// 要件起点・成果物起点の双方向、空結果と基盤障害の区別。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { coverageByArtifact, coverageByRequirement } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/query.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-cov-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。実リポジトリのコーパス走査での誤検出を避けるため
// マーカーはパーツ結合経由で組み立てる。
function decl(role: string, ids: string): string {
  return `<!-- ${MARKER}(${role}): ${ids} -->`;
}

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("coverage（要件起点）", () => {
  it("1要件に複数役割の対応成果物があるとき全件を役割付きで返す（RU-0002 検証: 正常系）", () => {
    writeFixture("docs/designs/x.md", [decl("design", "REQ-900-001")]);
    writeFixture("src/a.ts", [decl("implementation", "REQ-900-001")]);
    writeFixture("src/b.ts", [decl("implementation", "REQ-900-001, REQ-900-002")]);
    writeFixture("tests/v.test.ts", [decl("verification", "REQ-900-001")]);
    const { declarations } = scanCorpus(ROOT);
    const result = coverageByRequirement(declarations, "REQ-900-001");
    expect(result.mode).toBe("requirement");
    expect(result.relations).toHaveLength(4);
    expect(result.counts).toEqual({
      design: 1,
      implementation: 2,
      verification: 1,
      total: 4,
    });
    expect(result.truncated).toBe(false);
    expect(result.emptyResult).toBe(false);
  });

  it("大量の宣言があっても全件を返し、候補数上限によって切り捨てない（AC-003）", () => {
    const lines = Array.from({ length: 30 }, (_, i) =>
      decl("implementation", `REQ-900-0${String(10 + i).padStart(2, "0")}`),
    );
    lines.push(decl("implementation", "REQ-900-010"));
    writeFixture("docs/big.md", lines);
    const { declarations } = scanCorpus(ROOT);
    const result = coverageByRequirement(declarations, "REQ-900-010");
    expect(result.relations).toHaveLength(2);
    const all = coverageByRequirement(declarations, "REQ-900-010");
    expect(all.counts.total).toBe(2);
    // 30宣言すべてが要件単位で取得可能（切り捨てなし）
    const totalDecls = declarations.filter((d) =>
      d.reqIds.some((id) => id.startsWith("REQ-900-0")),
    ).length;
    expect(totalDecls).toBeGreaterThanOrEqual(31);
  });

  it("対応宣言のない要件は空結果として返す（空状態と基盤障害の区別）", () => {
    const { declarations } = scanCorpus(ROOT);
    const result = coverageByRequirement(declarations, "REQ-900-999");
    expect(result.relations).toEqual([]);
    expect(result.emptyResult).toBe(true);
    expect(result.truncated).toBe(false);
  });
});

describe("coverage（成果物起点）", () => {
  it("1成果物から複数要件への対応を全件返す（RU-0002 検証: 逆引き）", () => {
    writeFixture("src/multi.ts", [
      decl("implementation", "REQ-900-101, REQ-900-102"),
      decl("verification", "REQ-900-101"),
    ]);
    const { declarations } = scanCorpus(ROOT);
    const result = coverageByArtifact(declarations, "src/multi.ts");
    expect(result.mode).toBe("artifact");
    expect(result.artifact).toBe("src/multi.ts");
    expect(result.relations).toHaveLength(3);
    const reqIds = result.relations.map((r) => r.reqId).sort();
    expect(reqIds).toEqual(["REQ-900-101", "REQ-900-101", "REQ-900-102"]);
    expect(result.truncated).toBe(false);
  });

  it("対応宣言のない成果物は空結果（emptyResult）として返す", () => {
    writeFixture("docs/plain.md", ["# 宣言のない文書"]);
    const { declarations } = scanCorpus(ROOT);
    const result = coverageByArtifact(declarations, "docs/plain.md");
    expect(result.relations).toEqual([]);
    expect(result.emptyResult).toBe(true);
  });
});
