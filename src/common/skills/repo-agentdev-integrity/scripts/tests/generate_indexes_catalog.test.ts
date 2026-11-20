/**
 * generate_indexes_catalog.test.ts — カタログ自動生成の registry 単一ソース化検証。
 *
 * DEC-065 決定3（カタログ自動生成の単一ソース = rules/index.ts レジストリ）、
 * REQ-122-003（残存23コアルールの4分類構成維持）、REQ-122-006（カタログ自動生成）、
 * REQ-122-011（IR-075 新設・Wave-4 登録）に対応する focused test。レジストリの
 * 4分類割当と IR-075 を固定値としてレジストリと突合し、手編集カタログの再生成による
 * 上書き（単一ソース化）を純文字列 fixture で実証する。
 *
 * 改変 AUTOGEN ブロック fixture の鮮度検出（scanBlocks 経路）は
 * check_autogen_freshness.test.ts が担当する（生成側と検出側の分業）。
 */
import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  CATALOG_BLOCK_ID,
  findAutogenBlocks,
  generateCatalogEntries,
  replaceAutogenBlock,
} from "../generate_indexes.ts";
import { rules as registryRules } from "../../rules/index.ts";
import { findRepoRoot } from "../../lib/cli_utils.ts";

const REPO_ROOT = findRepoRoot(import.meta.dir);
const REAL_CATALOG_PATH = path.join(
  REPO_ROOT,
  "docs",
  "designs",
  "integrity",
  "integrity-rule-catalog.md",
);

/**
 * 残存22ルールの4分類割当。
 */
const WAVE1_CATEGORIES = [
  {
    name: "スキーマ・ID・ファイル名整合",
    ids: ["IR-001", "IR-002", "IR-007", "IR-044", "IR-070"],
  },
  {
    name: "リンク・参照パス・未解決プレースホルダ",
    ids: ["IR-008", "IR-013", "IR-055", "IR-062", "IR-063", "IR-064", "IR-067", "IR-071"],
  },
  {
    name: "自動生成・インデックス・投影同期",
    ids: ["IR-004", "IR-016", "IR-024", "IR-061", "IR-068"],
  },
  {
    name: "配布境界",
    ids: ["IR-053", "IR-056", "IR-058", "IR-059"],
  },
] as const;

/** Wave-4（Issue #4156、REQ-122-011）で登録した新設ルール。文書サイズ・行数上限カテゴリ。 */
const WAVE4_RULE_IDS = ["IR-075"] as const;

describe("rules registry（カタログ単一ソース）", () => {
  test("残存22ルール + IR-075（Wave-4 登録）と IR 番号順で完全一致する", () => {
    expect(registryRules.map((r) => r.id)).toEqual([
      "IR-001", "IR-002", "IR-004", "IR-007", "IR-008", "IR-013",
      "IR-016", "IR-024", "IR-044", "IR-053", "IR-055", "IR-056", "IR-058",
      "IR-059", "IR-061", "IR-062", "IR-063", "IR-064", "IR-067", "IR-068",
      "IR-070", "IR-071", "IR-075",
    ]);
  });

  test("確定の4分類割当（5+8+5+4）が registry から IR-075 を除いた集合を重複・過不足なく覆う", () => {
    const coreIds = registryRules
      .map((r) => r.id)
      .filter((id) => !WAVE4_RULE_IDS.includes(id as "IR-075"))
      .sort();
    const assigned = WAVE1_CATEGORIES.flatMap((c) => [...c.ids]).sort();
    expect(assigned).toHaveLength(22);
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(assigned).toEqual(coreIds);
    expect(WAVE1_CATEGORIES.map((c) => c.name)).toEqual([
      "スキーマ・ID・ファイル名整合",
      "リンク・参照パス・未解決プレースホルダ",
      "自動生成・インデックス・投影同期",
      "配布境界",
    ]);
    expect(WAVE1_CATEGORIES.map((c) => c.ids.length)).toEqual([5, 8, 5, 4]);
  });

  test("Wave-4 登録の IR-075 が registry に存在し 23 構成である（REQ-122-011）", () => {
    expect(registryRules.map((r) => r.id)).toContain("IR-075");
    expect(registryRules).toHaveLength(23);
  });
});

describe("generateCatalogEntries（registry → カタログ行）", () => {
  const entries = generateCatalogEntries(registryRules);

  test("登録ルール1件につき1行を出力する（重複なし・23 行構成）", () => {
    expect(entries).toHaveLength(23);
    expect(new Set(entries).size).toBe(entries.length);
  });

  test("各行は registry の id/title/slug から正規形式でレンダリングされる", () => {
    entries.forEach((line, i) => {
      const rule = registryRules[i]!;
      expect(line).toBe(
        `- [${rule.id}: ${rule.title}](rules/IR-${rule.id.slice(3)}-${rule.slug}.md)`,
      );
    });
  });

  test("冪等である（同一 registry からの再呼出は同一行列）", () => {
    expect(generateCatalogEntries(registryRules)).toEqual(entries);
  });

  test("カタログリンク先の IR 規則文書が rules/IR-NNN-slug.md として実在する", () => {
    for (const rule of registryRules) {
      const docPath = path.join(
        REPO_ROOT,
        "docs",
        "designs",
        "integrity",
        "rules",
        `IR-${rule.id.slice(3)}-${rule.slug}.md`,
      );
      expect(fs.existsSync(docPath)).toBe(true);
    }
  });
});

describe("カタログ再生成（単一ソース強制）", () => {
  const catalogContent = fs.readFileSync(REAL_CATALOG_PATH, "utf-8");
  const entries = generateCatalogEntries(registryRules);

  test("現行カタログの AUTOGEN ブロック本文は registry 生成物と一致する", () => {
    const block = findAutogenBlocks(catalogContent).find(
      (b) => b.id === CATALOG_BLOCK_ID,
    );
    expect(block).toBeDefined();
    expect(block!.currentBody).toEqual(entries);
  });

  test("現行カタログへの再生成は冪等で差分なし", () => {
    expect(replaceAutogenBlock(catalogContent, CATALOG_BLOCK_ID, entries)).toBe(
      catalogContent,
    );
  });

  test("手編集されたカタログ本文は再生成により registry 値へ上書きされる", () => {
    const ir061Index = registryRules.findIndex((r) => r.id === "IR-061");
    expect(ir061Index).toBeGreaterThan(-1);
    const tampered = catalogContent.replace(
      entries[ir061Index]!,
      "- [IR-061: 手編集された偽タイトル](rules/IR-061-index-generation-consistency.md)",
    );
    expect(tampered).not.toBe(catalogContent);
    expect(replaceAutogenBlock(tampered, CATALOG_BLOCK_ID, entries)).toBe(
      catalogContent,
    );
  });

  test("エントリ行削除されたカタログ本文も再生成により復元される", () => {
    const removed = catalogContent.replace(`${entries[0]!}\n`, "");
    expect(removed).not.toBe(catalogContent);
    expect(replaceAutogenBlock(removed, CATALOG_BLOCK_ID, entries)).toBe(
      catalogContent,
    );
  });
});
