// ADF-COVERS(verification): REQ-053-004, REQ-053-024, REQ-053-030
//
// TS-002: プロジェクト固有用語と構造除外。
// - 慣行パスのプロジェクト prh 辞書を散文で検出し、修正指針（replacement）を返す
// - inline code と fenced code を誤検出しない（prh 規則は Str 節点のみを検査し、
//   checkCodeComment 既定 [] のため CodeBlock は検査しない）
// - 辞書なしでも標準規則は有効（REQ-053-024）
// - 辞書の追加合成で標準規則・標準対象を無効化できない（辞書経路に無効化手段がない。
//   設定経路の無効化禁止は config.test.ts / targets.test.ts / plugin.test.ts が検査）
// - 辞書の追加・削除は再起動なしで次回検査から反映される（REQ-053-030）
// - 読込み不能な辞書は検査不能として fail-closed（対象外ファイルへの操作も含め拒否は
//   plugin 側の guardOperation 経由で検査）

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { prepareInspection, inspectText } from "../lib/inspect.ts";
import { discoverProjectPrh, projectPrhPathFor } from "../lib/terminology.ts";
import { guardOperation } from "../plugin.ts";

const TERM_DOC = ["version: 1", "rules:", "  - expected: 要求仕様書", "    pattern: /要件定義書/"].join("\n");

const PROSE = "# 見出し\n\n要件定義書を参照する。\n";
const TERM_IN_INLINE = "# 見出し\n\n`要件定義書` を inline code で書く。\n";
const TERM_IN_FENCED = "# 見出し\n\n```\n要件定義書\n```\n";
const TERM_IN_FENCED_LANG = "# 見出し\n\n```js\nconst s = \"要件定義書\";\n```\n";

function makeProject(files: Record<string, string> = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adftl-term-"));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, ...rel.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  return root;
}

function writeTermDict(root: string, content: string): void {
  const abs = projectPrhPathFor(root);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

describe("discoverProjectPrh（慣行パスの辞書発見）", () => {
  test("辞書なしは null（標準構成だけの正常状態）", () => {
    const root = makeProject();
    expect(discoverProjectPrh(root)).toEqual({ ok: true, path: null });
  });

  test("辞書ありは絶対パスを返す", () => {
    const root = makeProject();
    writeTermDict(root, TERM_DOC);
    const result = discoverProjectPrh(root);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.path).toBe(projectPrhPathFor(root));
  });

  test("パスがディレクトリの場合は検査不能エラー", () => {
    const root = makeProject();
    fs.mkdirSync(projectPrhPathFor(root), { recursive: true });
    const result = discoverProjectPrh(root);
    expect(result.ok).toBe(false);
  });
});

describe("プロジェクト用語の検出と構造除外（TS-002）", () => {
  test("用語を散文で検出し、replacement（修正指針）を返す", async () => {
    const root = makeProject();
    writeTermDict(root, TERM_DOC);
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const prhPaths = prepared.composition.prhRulePaths;
    expect(prhPaths[prhPaths.length - 1]).toBe(projectPrhPathFor(root));
    const r = await inspectText(prepared, root, "docs/a.md", PROSE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const hits = r.result.findings.filter((f) => f.ruleId === "prh");
    expect(hits.length).toBeGreaterThan(0);
    const hard = hits.find((f) => f.severity === "hard");
    expect(hard).toBeDefined();
    if (hard !== undefined) {
      expect(hard.message).toContain("要求仕様書");
      expect(hard.replacement).toBe("要求仕様書");
    }
  });

  test("inline code と fenced code は誤検出しない", async () => {
    const root = makeProject();
    writeTermDict(root, TERM_DOC);
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    for (const [label, text] of [
      ["inline code", TERM_IN_INLINE],
      ["fenced code", TERM_IN_FENCED],
      ["fenced code (lang)", TERM_IN_FENCED_LANG],
    ] as const) {
      const r = await inspectText(prepared, root, "docs/a.md", text);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.result.findings.filter((f) => f.ruleId === "prh")).toHaveLength(0);
      }
      void label;
    }
  });

  test("辞書対象外の表現は検出しない", async () => {
    const root = makeProject();
    writeTermDict(root, TERM_DOC);
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const r = await inspectText(prepared, root, "docs/a.md", "# 見出し\n\n対象外の通常の文章である。\n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.findings.filter((f) => f.ruleId === "prh")).toHaveLength(0);
  });

  test("辞書なしでも標準規則は有効（REQ-053-024）", async () => {
    const root = makeProject();
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.composition.hardRuleIds).toContain("preset-ja-technical-writing/no-hankaku-kana");
    const r = await inspectText(prepared, root, "docs/a.md", "# 見出し\n\n半角カナ\uFF71\uFF72\uFF73混入。\n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result.hardCount).toBeGreaterThan(0);
  });

  test("辞書ありでも標準規則・標準辞書は無効化されない（追加合成）", async () => {
    const root = makeProject();
    writeTermDict(root, TERM_DOC);
    const prepared = await prepareInspection(root);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const ruleIds = prepared.composition.rules.map((r) => r.ruleId);
    for (const standard of [
      "preset-ja-technical-writing/no-hankaku-kana",
      "preset-ai-writing/no-ai-hype-expressions",
      "prh",
    ]) {
      expect(ruleIds).toContain(standard);
    }
    const pluginDir = path.resolve(import.meta.dir, "..");
    expect(prepared.composition.prhRulePaths[0]).toBe(path.join(pluginDir, "rules", "default-prh.yml"));
  });

  test("辞書の追加と削除は再起動なしで次回検査に反映される（REQ-053-030）", async () => {
    const root = makeProject();
    const without = await prepareInspection(root);
    expect(without.ok).toBe(true);
    if (!without.ok) return;
    {
      const r = await inspectText(without, root, "docs/a.md", PROSE);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.result.findings.filter((f) => f.ruleId === "prh")).toHaveLength(0);
    }
    writeTermDict(root, TERM_DOC);
    const withDict = await prepareInspection(root);
    expect(withDict.ok).toBe(true);
    if (!withDict.ok) return;
    {
      const r = await inspectText(withDict, root, "docs/a.md", PROSE);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.result.findings.filter((f) => f.ruleId === "prh").length).toBeGreaterThan(0);
    }
    fs.rmSync(projectPrhPathFor(root));
    const removed = await prepareInspection(root);
    expect(removed.ok).toBe(true);
    if (!removed.ok) return;
    {
      const r = await inspectText(removed, root, "docs/a.md", PROSE);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.result.findings.filter((f) => f.ruleId === "prh")).toHaveLength(0);
    }
  });

  test("読込み不能な辞書（ディレクトリ）は全書込み操作を fail-closed で拒否する", async () => {
    const root = makeProject();
    fs.mkdirSync(projectPrhPathFor(root), { recursive: true });
    const target = await guardOperation("write", { filePath: path.join(root, "docs", "a.md"), content: PROSE }, root);
    expect(target).toContain("project prh dictionary is unreadable");
    const nonTarget = await guardOperation("write", { filePath: path.join(root, "src", "main.ts"), content: "x" }, root);
    expect(nonTarget).toContain("project prh dictionary is unreadable");
    expect(nonTarget).toContain("external editor");
  });

  test("型を満たさない prh 辞書も検査不能として fail-closed する（妥当性は prh 規則が検証）", async () => {
    const root = makeProject();
    writeTermDict(root, "version: 1\nrules: 5\n");
    const detail = await guardOperation("write", { filePath: path.join(root, "docs", "a.md"), content: PROSE }, root);
    expect(detail).not.toBeNull();
    expect(detail).toContain("blocked per fail-closed");
  });
});
