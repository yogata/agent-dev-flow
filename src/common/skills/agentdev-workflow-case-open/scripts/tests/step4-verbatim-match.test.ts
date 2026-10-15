import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REFERENCE_PATH = resolve(import.meta.dir, "../../references/definition-pr-and-idempotency.md");

function step4Section(content: string): string {
  const start = content.indexOf("### STEP-4:");
  const end = content.indexOf("### STEP-5:", start);
  return content.slice(start, end);
}

describe("STEP-4 verbatim 包含突合手順の規定", () => {
  const content = readFileSync(REFERENCE_PATH, "utf8");
  const step4 = step4Section(content);

  test("STEP-4 節が抽出できる", () => {
    expect(step4.startsWith("### STEP-4:")).toBe(true);
    expect(step4.length).toBeGreaterThan(0);
  });

  test("artifact_actions 適用後の verbatim 包含突合手順が規定されている", () => {
    expect(step4).toContain("artifact_actions 適用後の verbatim 包含突合");
    expect(step4).toContain("逐語的に含まれることを機械的検索で確認する");
  });

  test("突合不成立時の fail-closed 抑止が規定されている", () => {
    expect(step4).toContain("不成立とする");
    expect(step4).toContain("PR を作成せず停止する（fail-closed）");
  });

  test("PR 本文検証記録の根拠規定が適用後成果物への突合結果である", () => {
    expect(step4).toContain("適用後成果物への突合結果を根拠として記載する");
    expect(step4).toContain("適用予定内容だけを適用済みの証拠として記録しない");
  });

  test("既存の script 呼出フローと冪等再実行契約との非競合が規定されている", () => {
    expect(step4).toContain("冪等再実行手順を維持する");
    expect(step4).toContain("欠落を再適用する場合は DefinitionEdit の旧文完全一致契約に従う");
  });

  test("docs/README.md 手動管理区間の件数照合手順が規定されている", () => {
    expect(step4).toContain("docs/README.md 手動管理区間の件数照合");
    expect(step4).toContain("初回の変更・検証範囲に含める");
    expect(step4).toContain("機械検索で突合し");
    expect(step4).toContain("明示パス指定補正 commit");
    expect(step4).toContain("件数不一致の残存を成功扱いにしない");
  });
});
