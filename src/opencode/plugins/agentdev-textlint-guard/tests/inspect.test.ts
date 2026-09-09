// ADF-COVERS(verification): REQ-053-025, REQ-053-028, REQ-053-031, REQ-053-037
//
// TS-001: 共通基盤の検査契約。
// - 標準規則を固定した版で読み込み、正常例・既知違反・助言だけの入力を検査する
// - 拒否対象を拒否し、助言だけの入力は通過する
// - 結果に位置、rule ID、該当箇所と利用可能な修正情報がある
// - 独自の一般文章 detector を持たない（規則構成は採用プリセット + prh のみ）

import { describe, expect, test } from "bun:test";
import { prepareInspection, inspectText } from "../lib/inspect.ts";
import { invalidateConfigCache } from "../lib/config.ts";
import { formatFinding } from "../lib/results.ts";

const CLEAN_TEXT = `# 見出し

これは検査対象の正常な文章である。文は短く保つ。
`;

const HARD_TEXT = `# 見出し

半角カナが混入した文章\uFF71\uFF72\uFF73。
`;

const ADVICE_TEXT = `# 見出し

これは重要かもしれません。それは適切ではないでしょうか。長くなりがちな文を意識して書く必要があると思われる。
`;

describe("共通基盤の検査（TS-001）", () => {
  test("正常例は拒否対象違反ゼロで通過する", async () => {
    const prepared = await prepareInspection(process.cwd());
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", CLEAN_TEXT);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.hardCount).toBe(0);
  });

  test("既知違反（半角カナ）は拒否対象として検出する", async () => {
    const prepared = await prepareInspection(process.cwd());
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", HARD_TEXT);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.hardCount).toBeGreaterThan(0);
    const hard = r.result.findings.filter((f) => f.severity === "hard");
    expect(hard.some((f) => f.ruleId === "preset-ja-technical-writing/no-hankaku-kana")).toBe(true);
  });

  test("制御文字・ゼロ幅スペース・NFD も拒否対象として検出する", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const cases: Array<[string, string]> = [
      ["制御文字", "文章\u0001混入"],
      ["ゼロ幅スペース", "文章\u200B混入"],
      ["NFD 濁点", "文\u304B\u3099混入"],
    ];
    for (const [label, text] of cases) {
      const r = await inspectText(prepared, process.cwd(), "docs/sample.md", text);
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.result.hardCount).toBeGreaterThan(0);
      expect(r.result.findings.some((f) => f.severity === "hard")).toBe(true);
      void label;
    }
  });

  test("助言だけの入力は通過する（検査不合格の根拠にしない）", async () => {
    const prepared = await prepareInspection(process.cwd());
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", ADVICE_TEXT);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.hardCount).toBe(0);
    expect(r.result.findings.some((f) => f.severity === "advice")).toBe(true);
  });

  test("結果に位置・rule ID・該当箇所・修正情報の形式がある", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", HARD_TEXT);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const finding = r.result.findings.find((f) => f.severity === "hard");
    expect(finding).toBeDefined();
    if (finding !== undefined) {
      expect(finding.line).toBeGreaterThan(0);
      expect(finding.column).toBeGreaterThan(0);
      expect(finding.path).toBe("docs/sample.md");
      const formatted = formatFinding(finding);
      expect(formatted).toContain("docs/sample.md:");
      expect(formatted).toContain("[拒否]");
      expect(formatted).toContain(finding.ruleId);
    }
  });

  test("prh の修正候補（replacement）を保持する", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    // 標準辞書の登録語（監査証跠の誤変換）を検出し、replacement（修正指針）を保持する。
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", "監査証跠を残す。");
    expect(r.ok).toBe(true);
    if (r.ok) {
      const hits = r.result.findings.filter((f) => f.ruleId === "prh" && f.severity === "hard");
      expect(hits.length).toBeGreaterThan(0);
      const firstHit = hits[0];
      expect(firstHit).toBeDefined();
      if (firstHit !== undefined) {
        expect(firstHit.replacement).toBe("監査証跡");
      }
    }
  });

  test("対象外拡張子は検査しない（一般文章検査の適用外）", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "src/main.ts", "ｱｲｳ");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result.findings).toHaveLength(0);
      expect(r.result.hardCount).toBe(0);
    }
  });

  test("規則構成が warning に下げた規則の報告は助言として分類する（plain object report 回帰）", async () => {
    const prepared = await prepareInspection(process.cwd());
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.composition.hardRuleIds).not.toContain("preset-ai-writing/ai-tech-writing-guideline");
    // ai-tech-writing-guideline は RuleError を介さず report するため kernel の
    // severity は error 固定になる。構成の hardRuleIds が正となり助言に分類されること。
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", "# 見出し\n\n必要に応じて設定を変更する。\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "preset-ai-writing/ai-tech-writing-guideline");
    expect(hits.length).toBeGreaterThan(0);
    for (const f of hits) {
      expect(f.severity).not.toBe("hard");
    }
    expect(r.result.hardCount).toBe(0);
  });

  test("規則構成は採用プリセット + prh のみ（独自 detector を持たない）", async () => {
    invalidateConfigCache();
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const prefixes = new Set(prepared.composition.rules.map((r) => r.ruleId.split("/")[0]));
    expect([...prefixes].sort()).toEqual([
      "preset-ai-writing",
      "preset-ja-technical-writing",
      "prh",
    ]);
  });

  test("漢字 10 字以内の正規複合名詞は max-kanji-continuous-len で指摘しない（corpus 校正 max 10）", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", "# 見出し\n\n現行成果物体系の整合性網羅監査を実行する。\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "preset-ja-technical-writing/max-kanji-continuous-len");
    expect(hits).toHaveLength(0);
  });

  test("漢字 11 字以上の連続は助言として検出する（corpus 校正 max 10）", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", "# 見出し\n\n外部実行手段中間成果物を検査する。\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "preset-ja-technical-writing/max-kanji-continuous-len");
    expect(hits.length).toBeGreaterThan(0);
    for (const f of hits) expect(f.severity).not.toBe("hard");
  });

  test("「- **用語**: 説明」の定義リストは no-ai-list-formatting で指摘しない（corpus 校正 disableBoldListItems）", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const text = "# 見出し\n\n- **Harness依存**: 説明文である。\n- **正規パス**: 別の説明である。\n";
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "preset-ai-writing/no-ai-list-formatting");
    expect(hits).toHaveLength(0);
  });

  test("「**重要**」の注意喚起ブロックは no-ai-emphasis-patterns で指摘しない（corpus 校正 disableInfoPatterns）", async () => {
    const prepared = await prepareInspection(process.cwd());
    if (!prepared.ok) return;
    const text = "# 見出し\n\n**重要**\n\nこれは注意喚起の本文である。\n\n**注意**\n\n別の注意喚起である。\n";
    const r = await inspectText(prepared, process.cwd(), "docs/sample.md", text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "preset-ai-writing/no-ai-emphasis-patterns");
    expect(hits).toHaveLength(0);
  });
});
