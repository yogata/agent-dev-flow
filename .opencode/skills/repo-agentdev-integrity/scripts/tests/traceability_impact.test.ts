// ADF-COVERS(verification): REQ-012-046
//
// agentdev-traceability 配布スキル impact の公開契約検証（OU-002、Issue #2360）。
// 探索範囲の上限（成果物 ↔ 要件 ↔ 成果物、固定2ホップ）、
// 空結果の扱い（「影響なし」の証明としない）。

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { impactByArtifact, impactByRequirement } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/query.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-imp-${crypto.randomUUID().slice(0, 8)}`;
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

describe("impact（要件起点）", () => {
  it("当該要件へ明示的に対応する成果物を再確認候補として返す", () => {
    writeFixture("docs/d1.md", [decl("design", "REQ-900-001")]);
    writeFixture("src/i1.ts", [decl("implementation", "REQ-900-001")]);
    writeFixture("tests/v1.test.ts", [decl("verification", "REQ-900-001")]);
    const { declarations } = scanCorpus(ROOT);
    const result = impactByRequirement(declarations, "REQ-900-001");
    expect(result.mode).toBe("requirement");
    expect(result.recheckCandidates).toHaveLength(3);
    const roles = result.recheckCandidates.map((c) => c.role).sort();
    expect(roles).toEqual(["design", "implementation", "verification"]);
  });

  it("対応のない要件は空結果を明示し、影響なしの証明として扱わない（AC-005）", () => {
    const { declarations } = scanCorpus(ROOT);
    const result = impactByRequirement(declarations, "REQ-900-999");
    expect(result.emptyResult).toBe(true);
    expect(result.recheckCandidates).toEqual([]);
    expect(result.note).toBeDefined();
    expect(result.note).toContain("影響なし");
    // 「影響なし」と断定するフィールドを持たない
    expect(JSON.stringify(result)).not.toMatch(/"(impactNone|noImpact|proved)"\s*:\s*true/);
  });
});

describe("impact（成果物起点）", () => {
  it("対応要件を経由して同じ要件へ対応する他成果物を再確認候補として返す（起点自身を除く）", () => {
    writeFixture("src/start.ts", [decl("implementation", "REQ-900-201, REQ-900-202")]);
    writeFixture("docs/other-design.md", [decl("design", "REQ-900-201")]);
    writeFixture("src/other-impl.ts", [decl("implementation", "REQ-900-202")]);
    writeFixture("tests/other-test.test.ts", [decl("verification", "REQ-900-201, REQ-900-202")]);
    const { declarations } = scanCorpus(ROOT);
    const result = impactByArtifact(declarations, "src/start.ts");
    expect(result.viaRequirements).toHaveLength(2);
    // other-test.test.ts は2つの経由要件それぞれから候補となる（file:line:viaReqId 単位）
    expect(result.recheckCandidates).toHaveLength(4);
    const files = [...new Set(result.recheckCandidates.map((c) => c.file))].sort();
    expect(files).toEqual([
      "docs/other-design.md",
      "src/other-impl.ts",
      "tests/other-test.test.ts",
    ]);
    // 起点成果物自身を候補に含めない
    expect(result.recheckCandidates.every((c) => c.file !== "src/start.ts")).toBe(true);
    // 経由要件が候補ごとに保持される
    expect(result.recheckCandidates.every((c) => c.viaReqId.startsWith("REQ-900-2"))).toBe(true);
  });

  it("成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索しない（AC-004、固定2ホップ）", () => {
    // 経路: a → R1 → b → R2 → c。a 起点の候補は b までであり、R2 と c を含まない。
    writeFixture("chain/a.md", [decl("implementation", "REQ-900-301")]);
    writeFixture("chain/b.md", [decl("implementation", "REQ-900-301"), decl("design", "REQ-900-302")]);
    writeFixture("chain/c.md", [decl("implementation", "REQ-900-302")]);
    const { declarations } = scanCorpus(ROOT);
    const result = impactByArtifact(declarations, "chain/a.md");
    expect(result.recheckCandidates).toHaveLength(1);
    expect(result.recheckCandidates[0]?.file).toBe("chain/b.md");
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("REQ-900-302");
    expect(serialized).not.toContain("chain/c.md");
  });

  it("どの要件にも対応しない成果物は空結果を明示する", () => {
    writeFixture("lonely/x.md", ["# 対応宣言なし"]);
    const { declarations } = scanCorpus(ROOT);
    const result = impactByArtifact(declarations, "lonely/x.md");
    expect(result.emptyResult).toBe(true);
    expect(result.recheckCandidates).toEqual([]);
    expect(result.note).toContain("影響なし");
  });

  it("同じ要件を経由する複数ホップ候補を重なく返す", () => {
    writeFixture("dup/base.md", [decl("implementation", "REQ-900-401")]);
    writeFixture("dup/x.md", [decl("verification", "REQ-900-401"), decl("design", "REQ-900-401")]);
    const { declarations } = scanCorpus(ROOT);
    const result = impactByArtifact(declarations, "dup/base.md");
    // x.md の2宣言は同一ファイル内の別行なので2件（file:line:viaReqId 単位）
    expect(result.recheckCandidates).toHaveLength(2);
  });
});
