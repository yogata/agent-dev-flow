// agentdev-traceability 配布スキルの証拠再利用確認（reuse）能力の検証。
// 対応関係: REQ-107-008（sidecar 正規配置・traceability/agentdev-traceability.yaml）。
//
// - 変更前の証拠を再利用する場合、その証拠が現在の対象に構造的に到達できるかを
//   確認し、証拠自身の対応関係と links の双方向を列挙できること
// - 版・条件の適合は意味的品質検証であり、本確認は合格判定を返さず
//   manualConfirmation に確認事項を明示すること

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateEvidenceReuse } from "../../../../../src/common/skills/agentdev-traceability/scripts/lib/reuse.ts";

const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `trace-reuse-${crypto.randomUUID().slice(0, 8)}`;
const ROOT = join(TEMP_BASE, RUN_ID);

function writeFixture(rel: string, lines: readonly string[]): void {
  const filePath = join(ROOT, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

// フィクスチャ用の covers 宣言行生成。テストソース内にマーカー文字列を直接記述すると
// TIM コーパス走査（.ts 拡張子走査）で実宣言として誤検出されるため、
// テンプレート埋め込み経由で組み立てる。
function decl(role: string, ids: string): string {
  return `<!-- ADF-COVERS(${role}): ${ids} -->`;
}

beforeAll(() => {
  mkdirSync(ROOT, { recursive: true });
  // 証拠成果物（covers 宣言 + links 宣言を保持する）
  writeFixture("docs/reports-archived/prior-run.md", [
    "# 前回検証記録",
    decl("verification", "REQ-900-401"),
    "<!-- ADF-LINKS(upstream): docs/designs/ru-spec.md -->",
  ]);
  // 証拠の上流成果物
  writeFixture("docs/designs/ru-spec.md", ["# 設計"]);
  // 証拠を上流として参照する下流成果物
  writeFixture("src/consumer.ts", [
    "// ADF-LINKS(upstream): docs/reports-archived/prior-run.md",
    "export const y = 2;",
  ]);
  // 証拠が対応する要件行
  writeFixture("docs/requirements/REQ-900d.md", [
    "| ID | 要件 |",
    "|---|---|",
    "| REQ-900-401 | 例 |",
  ]);
});
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true });
});

describe("証拠再利用の構造的適用可否確認（REQ-107-008）", () => {
  it("実在証拠の構造確認と対応関係列挙を行い、版を記録する", () => {
    const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/prior-run.md", "1a3575149f838093e5b5ac80e395ceb662beb506");
    expect(result.exists).toBe(true);
    expect(result.structuralStatus).toBe("confirmed");
    expect(result.revision).toBe("1a3575149f838093e5b5ac80e395ceb662beb506");
    expect(result.declaredRelations).toEqual([
      { role: "verification", reqIds: ["REQ-900-401"] },
    ]);
    expect(result.upstreamArtifacts).toEqual(["docs/designs/ru-spec.md"]);
    expect(result.downstreamArtifacts).toEqual(["src/consumer.ts"]);
  });

  it("不在証拠を evidence-not-found として報告する", () => {
    const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/gone.md");
    expect(result.exists).toBe(false);
    expect(result.existsReason).toBe("file-not-found");
    expect(result.structuralStatus).toBe("evidence-not-found");
    expect(result.declaredRelations).toEqual([]);
  });

  it("適用可否の合格判定を返さず、版・条件の確認事項を manualConfirmation に明示する", () => {
    const result = evaluateEvidenceReuse(ROOT, "docs/reports-archived/prior-run.md");
    // 構造検査の confirmed は適用可否の合格ではない
    expect(result.structuralStatus).toBe("confirmed");
    expect(result.manualConfirmation.length).toBeGreaterThan(0);
    const joined = result.manualConfirmation.join("\n");
    expect(joined).toContain("版の適合");
    expect(joined).toContain("条件の適合");
    expect(result.note).toContain("合格判定しない");
  });
});
