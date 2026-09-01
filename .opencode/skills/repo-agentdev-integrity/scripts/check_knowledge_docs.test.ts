// ADF-COVERS(verification): REQ-010-068, REQ-056-010, REQ-056-011
/**
 * check_knowledge_docs.test.ts — bun:test 単体テスト。
 *
 * REQ-010-068 に従い、正常例、違反例、境界例、許容例、再現例を含む回帰テストを提供する。
 * 合成ディレクトリ（mkdtemp）を検査対象とし、リポジトリ実状態に依存しない。
 */
import { describe, expect, test, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AREA_README_FILENAME,
  REQUIRED_SECTIONS,
  extractHeadings,
  findMissingSections,
  isKebabCaseSlug,
  scanKnowledgeDocs,
} from "./check_knowledge_docs.ts";

// ─── fixture helper ──────────────────────────────────────────────────────

let tempRoots: string[] = [];

function makeTempRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), "check-knowledge-docs-test-"));
  tempRoots.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempRoots) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // cleanup failure must not mask test results
    }
  }
  tempRoots = [];
});

function writeKnowledgeDoc(root: string, fileName: string, body?: string): string {
  const area = join(root, "docs", "knowledge");
  mkdirSync(area, { recursive: true });
  const filePath = join(area, fileName);
  writeFileSync(
    filePath,
    body ??
      `---
title: 正常な知識
created: 2026-09-01
updated: 2026-09-01
---

## 知識内容

内容。

## 適用条件

条件。

## 適用対象

対象。

## 根拠

根拠。

## 関連知識

関連。
`,
    "utf-8",
  );
  return filePath;
}

// ─── 純関数: extractHeadings / findMissingSections / isKebabCaseSlug ────

describe("extractHeadings", () => {
  test("見出しテキストを trim して返す", () => {
    expect(extractHeadings("##  知識内容  \n")).toEqual(["知識内容"]);
  });

  test("見出しレベル1〜6を許容する", () => {
    expect(extractHeadings("# 知識内容\n###### 適用条件")).toEqual([
      "知識内容",
      "適用条件",
    ]);
  });

  test("非見出し行は無視する（行全体マッチ統一規約）", () => {
    expect(extractHeadings("本文に知識内容という語があっても見出しではない")).toEqual([]);
    expect(extractHeadings("####### 知識内容")).toEqual([]); // レベル7は見出しでない
  });

  test("CRLF 行を許容する", () => {
    expect(extractHeadings("## 適用条件\r\n")).toEqual(["適用条件"]);
  });
});

describe("findMissingSections", () => {
  test("必須5項目が揃えば欠落なし（正常例）", () => {
    const content = REQUIRED_SECTIONS.map((s) => `## ${s}`).join("\n");
    expect(findMissingSections(content)).toEqual([]);
  });

  test("1項目でも欠落すれば欠落として報告する（違反例）", () => {
    const content = REQUIRED_SECTIONS.filter((s) => s !== "根拠")
      .map((s) => `## ${s}`)
      .join("\n");
    expect(findMissingSections(content)).toEqual(["根拠"]);
  });

  test("全欠落は5項目を報告する（違反例）", () => {
    expect(findMissingSections("# タイトルのみ")).toEqual([...REQUIRED_SECTIONS]);
  });
});

describe("isKebabCaseSlug", () => {
  test("kebab-case は合格（境界例: 1文字、数字、ハイフン連結）", () => {
    expect(isKebabCaseSlug("a")).toBe(true);
    expect(isKebabCaseSlug("20260901")).toBe(true);
    expect(isKebabCaseSlug("risk-boundary-extraction")).toBe(true);
  });

  test("大文字・アンダースコア・前後ハイフンは不合格（違反例）", () => {
    expect(isKebabCaseSlug("My-Slug")).toBe(false);
    expect(isKebabCaseSlug("my_slug")).toBe(false);
    expect(isKebabCaseSlug("-leading")).toBe(false);
    expect(isKebabCaseSlug("trailing-")).toBe(false);
    expect(isKebabCaseSlug("double--hyphen")).toBe(false);
  });
});

// ─── scanKnowledgeDocs（領域構造検査） ───────────────────────────────────

describe("scanKnowledgeDocs", () => {
  test("正常例: 完備した知識文書と領域 README は違反0件", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(root, "risk-boundary-extraction.md");
    const area = join(root, "docs", "knowledge");
    writeFileSync(join(area, AREA_README_FILENAME), "# 知識（Knowledge）\n", "utf-8");

    const result = scanKnowledgeDocs(root);
    expect(result.findings).toEqual([]);
    expect(result.filesScanned).toBe(2);
    expect(result.areaPresent).toBe(true);
  });

  test("違反例: slug 違反（大文字・アンダースコア）を検出する", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(root, "My-Slug.md");
    writeKnowledgeDoc(root, "my_slug.md");

    const result = scanKnowledgeDocs(root);
    const kinds = result.findings.filter((f) => f.kind === "invalid-slug");
    expect(kinds).toHaveLength(2);
    expect(kinds.map((f) => f.file)).toContain("docs/knowledge/My-Slug.md");
    expect(kinds.map((f) => f.file)).toContain("docs/knowledge/my_slug.md");
  });

  test("違反例: 必須セクション欠落を検出する", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(
      root,
      "incomplete-doc.md",
      "---\ntitle: 不完全\ncreated: 2026-09-01\nupdated: 2026-09-01\n---\n\n## 知識内容\n\n本文。\n",
    );

    const result = scanKnowledgeDocs(root);
    const missing = result.findings.filter((f) => f.kind === "missing-required-section");
    expect(missing).toHaveLength(4); // 適用条件、適用対象、根拠、関連知識
    expect(missing.every((f) => f.file === "docs/knowledge/incomplete-doc.md")).toBe(true);
  });

  test("違反例: サブディレクトリと非 Markdown ファイルを正規配置違反として検出する", () => {
    const root = makeTempRoot();
    const area = join(root, "docs", "knowledge");
    mkdirSync(area, { recursive: true });
    mkdirSync(join(area, "nested"), { recursive: true });
    writeFileSync(join(area, "nested", "extra.md"), "# extra\n", "utf-8");
    writeFileSync(join(area, "notes.txt"), "not a knowledge doc\n", "utf-8");

    const result = scanKnowledgeDocs(root);
    const placements = result.findings.filter((f) => f.kind === "non-regular-placement");
    expect(placements).toHaveLength(2);
    expect(placements.map((f) => f.file)).toContain("docs/knowledge/nested");
    expect(placements.map((f) => f.file)).toContain("docs/knowledge/notes.txt");
  });

  test("境界例: 領域 README は kebab-case 検査と必須セクション検査の対象外", () => {
    const root = makeTempRoot();
    const area = join(root, "docs", "knowledge");
    mkdirSync(area, { recursive: true });
    writeFileSync(join(area, AREA_README_FILENAME), "# 案内のみ（5項目なし）\n", "utf-8");

    const result = scanKnowledgeDocs(root);
    expect(result.findings).toEqual([]);
    expect(result.filesScanned).toBe(1);
  });

  test("境界例: 本文が空でも必須見出しが揃っていれば合格（REQ-056-011 意味検査非対象の固定）", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(root, "empty-bodies.md", REQUIRED_SECTIONS.map((s) => `## ${s}`).join("\n"));

    const result = scanKnowledgeDocs(root);
    expect(result.findings).toEqual([]);
  });

  test("境界例: 領域未設置は違反としない", () => {
    const root = makeTempRoot();
    mkdirSync(root, { recursive: true });

    const result = scanKnowledgeDocs(root);
    expect(result.findings).toEqual([]);
    expect(result.areaPresent).toBe(false);
    expect(result.filesScanned).toBe(0);
  });

  test("許容例: 見出し前後の空白とレベル3見出しは合格する", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(
      root,
      "loose-heading-format.md",
      REQUIRED_SECTIONS.map((s) => `###   ${s}  `).join("\n"),
    );

    const result = scanKnowledgeDocs(root);
    expect(result.findings).toEqual([]);
  });

  test("再現例: 必須語が本文（非見出し行）にのみ出現する文書は欠落として検出する", () => {
    const root = makeTempRoot();
    writeKnowledgeDoc(
      root,
      "prose-only.md",
      "---\ntitle: 散文のみ\ncreated: 2026-09-01\nupdated: 2026-09-01\n---\n\n知識内容と適用条件を本文に書いたが見出しにしていない。\n",
    );

    const result = scanKnowledgeDocs(root);
    const missing = result.findings.filter((f) => f.kind === "missing-required-section");
    expect(missing).toHaveLength(5);
  });
});
