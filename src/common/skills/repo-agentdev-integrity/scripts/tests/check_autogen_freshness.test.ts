// ADF-COVERS(verification): REQ-010-059
/**
 * check_autogen_freshness.test.ts — bun:test 単体テスト。
 *
 * 合成コンテンツを用いて鮮度種別判定 (rename / status_change / content_change) と
 * report 生成ロジックを検証する。リポジトリ実状態に依存しない。
 */
import { describe, expect, test, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  CATALOG_BLOCK_ID,
  DECISION_BASELINE_TABLE_BLOCK_ID,
  DECISION_RETIRED_TABLE_BLOCK_ID,
  findAutogenBlocks,
  generateCatalogEntries,
} from "../generate_indexes.ts";
import {
  buildBlockTargets,
  classifyStaleness,
  findFirstMismatch,
  parseTableRow,
  scanBlocks,
  truncateForLog,
} from "../check_autogen_freshness.ts";
import { rules as registryRules } from "../../rules/index.ts";
import { findRepoRoot } from "../../lib/cli_utils.ts";

// ─── findFirstMismatch ───────────────────────────────────────────────────

describe("findFirstMismatch", () => {
  test("同一配列は -1", () => {
    expect(findFirstMismatch(["a", "b"], ["a", "b"])).toBe(-1);
  });

  test("不一致インデックスを返す", () => {
    expect(findFirstMismatch(["a", "b"], ["a", "c"])).toBe(1);
  });

  test("長さが異なる場合は超過最初インデックス", () => {
    expect(findFirstMismatch(["a"], ["a", "b"])).toBe(1);
    expect(findFirstMismatch(["a", "b"], ["a"])).toBe(1);
  });

  test("両方空配列は -1", () => {
    expect(findFirstMismatch([], [])).toBe(-1);
  });
});

// ─── truncateForLog ──────────────────────────────────────────────────────

describe("truncateForLog", () => {
  test("undefined は <missing>", () => {
    expect(truncateForLog(undefined)).toBe("<missing>");
  });

  test("max 以下は trim して返す", () => {
    expect(truncateForLog("  hello  ")).toBe("hello");
  });

  test("max 超は切り詰めて …", () => {
    const long = "x".repeat(100);
    const out = truncateForLog(long, 10);
    expect(out.length).toBe(10);
    expect(out.endsWith("…")).toBe(true);
  });
});

// ─── parseTableRow ───────────────────────────────────────────────────────

describe("parseTableRow", () => {
  test("通常行はセル配列", () => {
    expect(parseTableRow("| a | b | c |")).toEqual(["a", "b", "c"]);
  });

  test("前後空白を trim", () => {
    expect(parseTableRow("  | a | b |  ")).toEqual(["a", "b"]);
  });

  test("セパレータ行は null", () => {
    expect(parseTableRow("|---|---|")).toBeNull();
    expect(parseTableRow("| --- | --- |")).toBeNull();
    expect(parseTableRow("|:---:|---:|")).toBeNull();
  });

  test("表行でないは null", () => {
    expect(parseTableRow("not a table row")).toBeNull();
    expect(parseTableRow("- bullet")).toBeNull();
  });
});

// ─── classifyStaleness ───────────────────────────────────────────────────

describe("classifyStaleness", () => {
  const GENERIC_BLOCK_ID = "generic-metrics-block";

  test("行数増減は rename", () => {
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      ["| a | 1 | accepted | q |"],
      ["| a | 1 | accepted | q |", "| b | 2 | draft | w |"],
      1,
    );
    expect(result.kind).toBe("rename");
    expect(result.detail).toContain("size differs");
    expect(result.detail).toContain("delta=+1");
  });

  test("行数減少も rename、delta 負", () => {
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      ["| a | 1 | accepted | q |", "| b | 2 | draft | w |"],
      ["| a | 1 | accepted | q |"],
      1,
    );
    expect(result.kind).toBe("rename");
    expect(result.detail).toContain("delta=-1");
  });

  test("status 列構造を持たない表の同行変化は content_change", () => {
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      ["| quality/foo.md | 100 | draft | quality |"],
      ["| quality/foo.md | 100 | accepted | quality |"],
      0,
    );
    expect(result.kind).toBe("content_change");
  });

  test("同行でも key 列が異なる場合は content_change", () => {
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      ["| quality/old.md | 100 | accepted | quality |"],
      ["| quality/new.md | 100 | accepted | quality |"],
      0,
    );
    expect(result.kind).toBe("content_change");
  });

  test("Decision baseline 同行 status 列変化は status_change", () => {
    const result = classifyStaleness(
      DECISION_BASELINE_TABLE_BLOCK_ID,
      ["| DEC-001 | タイトル | proposed | 2026-01-01 |"],
      ["| DEC-001 | タイトル | accepted | 2026-01-01 |"],
      0,
    );
    expect(result.kind).toBe("status_change");
    expect(result.detail).toContain("Decision status changed");
  });

  test("Decision retired 同行 status 列変化は status_change", () => {
    const result = classifyStaleness(
      DECISION_RETIRED_TABLE_BLOCK_ID,
      ["| DEC-001 | x | accepted |"],
      ["| DEC-001 | x | superseded |"],
      0,
    );
    expect(result.kind).toBe("status_change");
    expect(result.detail).toContain("Retired Decision status changed");
  });

  test("行長さ同じ・表以外の変化は content_change", () => {
    const result = classifyStaleness(
      CATALOG_BLOCK_ID,
      ["- [IR-001: old title](rules/IR-001-x.md)"],
      ["- [IR-001: new title](rules/IR-001-x.md)"],
      0,
    );
    expect(result.kind).toBe("content_change");
    expect(result.detail).toContain("content differs");
  });

  test("行数値変化は content_change", () => {
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      ["| quality/foo.md | 100 | accepted | quality |"],
      ["| quality/foo.md | 105 | accepted | quality |"],
      0,
    );
    expect(result.kind).toBe("content_change");
  });

  test("不一致インデックスが本文範囲外でも安全に判定", () => {
    // currentBody が空で expectedBody のみ存在する場合の mismatchIndex=0
    const result = classifyStaleness(
      GENERIC_BLOCK_ID,
      [],
      ["| quality/foo.md | 100 | accepted | quality |"],
      0,
    );
    expect(result.kind).toBe("rename");
  });
});

// ─── findAutogenBlocks 統合テスト（生成スクリプト側からの再エクスポート） ─

describe("findAutogenBlocks integration", () => {
  test("AUTOGEN block を正しく抽出", () => {
    const content = [
      "intro line",
      "<!-- AUTOGEN:BEGIN:id=test-block -->",
      "| col1 | col2 |",
      "|------|------|",
      "| a | b |",
      "<!-- AUTOGEN:END -->",
      "outro line",
    ].join("\n");
    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe("test-block");
    expect(blocks[0].currentBody).toEqual([
      "| col1 | col2 |",
      "|------|------|",
      "| a | b |",
    ]);
  });

  test("backtick 囲み説明文を marker と誤認しない", () => {
    const content = [
      "本文中に `<!-- AUTOGEN:BEGIN:id=foo -->` と書いても marker 扱いしない",
      "<!-- AUTOGEN:BEGIN:id=real -->",
      "body",
      "<!-- AUTOGEN:END -->",
    ].join("\n");
    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe("real");
  });

  test("複数 block を順序保持で抽出", () => {
    const content = [
      "<!-- AUTOGEN:BEGIN:id=b1 -->",
      "body1",
      "<!-- AUTOGEN:END -->",
      "middle",
      "<!-- AUTOGEN:BEGIN:id=b2 -->",
      "body2",
      "<!-- AUTOGEN:END -->",
    ].join("\n");
    const blocks = findAutogenBlocks(content);
    expect(blocks.map((b) => b.id)).toEqual(["b1", "b2"]);
  });
});

// ─── scanBlocks による改変カタログ fixture の鮮度検出（REQ-122-006 単一ソース鮮度）──
// 改変 AUTOGEN ブロック fixture（.agentdev/tmp/ スクラッチ、REQ-118 の後片付け対象）
// を scanBlocks 経由で検出することを検証する。生成側の再生成による上書き実証は
// generate_indexes_catalog.test.ts が担当する（生成側と検出側の分業）。

const REPO_ROOT = findRepoRoot(import.meta.dir);
const REAL_CATALOG_CONTENT = fs.readFileSync(
  path.join(REPO_ROOT, "docs", "designs", "integrity", "integrity-rule-catalog.md"),
  "utf-8",
);
const TMP_BASE = path.join(REPO_ROOT, ".agentdev", "tmp");
fs.mkdirSync(TMP_BASE, { recursive: true });
const TAMP_TMP_ROOT = fs.mkdtempSync(path.join(TMP_BASE, "genidx-autogen-tamper-"));
const TAMP_DOCS_INTEGRITY_DIR = path.join(TAMP_TMP_ROOT, "docs", "designs", "integrity");
const TAMP_RULES_DIR = path.join(TAMP_DOCS_INTEGRITY_DIR, "rules");
const TAMP_CATALOG_PATH = path.join(TAMP_DOCS_INTEGRITY_DIR, "integrity-rule-catalog.md");

if (!fs.existsSync(TAMP_RULES_DIR)) {
  fs.mkdirSync(TAMP_RULES_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(TAMP_RULES_DIR, "IR-001-req-frontmatter-id-filename.md"),
    ["---", "id: IR-001", "---", "", "# IR-001: fixture", ""].join("\n"),
    "utf-8",
  );
  fs.writeFileSync(TAMP_CATALOG_PATH, REAL_CATALOG_CONTENT, "utf-8");
}

const TAMP_TARGETS = buildBlockTargets(TAMP_TMP_ROOT).filter(
  (t) => t.file === TAMP_CATALOG_PATH,
);

describe("scanBlocks による改変カタログ fixture の鮮度検出", () => {
  test("buildBlockTargets はカタログ期待値を rules レジストリから導出する", () => {
    expect(TAMP_TARGETS).toHaveLength(1);
    expect(TAMP_TARGETS[0]!.blockId).toBe(CATALOG_BLOCK_ID);
    expect(TAMP_TARGETS[0]!.expected).toEqual(generateCatalogEntries(registryRules));
  });

  test("未改変 fixture は finding なし", () => {
    const { findings } = scanBlocks(TAMP_TARGETS, TAMP_TMP_ROOT);
    expect(findings).toEqual([]);
  });

  test("AUTOGEN ブロック本文のエントリ行削除は rename として検出される", () => {
    const fresh = fs.readFileSync(TAMP_CATALOG_PATH, "utf-8");
    const firstEntry = generateCatalogEntries(registryRules)[0]!;
    fs.writeFileSync(TAMP_CATALOG_PATH, fresh.replace(`${firstEntry}\n`, ""), "utf-8");
    const { findings } = scanBlocks(TAMP_TARGETS, TAMP_TMP_ROOT);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.kind).toBe("rename");
    expect(findings[0]!.block_id).toBe(CATALOG_BLOCK_ID);
  });

  test("AUTOGEN ブロック同行の手編集は content_change として検出される", () => {
    fs.writeFileSync(TAMP_CATALOG_PATH, REAL_CATALOG_CONTENT, "utf-8");
    const ir061Idx = registryRules.findIndex((r) => r.id === "IR-061");
    const entry = generateCatalogEntries(registryRules)[ir061Idx]!;
    const fresh = fs.readFileSync(TAMP_CATALOG_PATH, "utf-8");
    fs.writeFileSync(
      TAMP_CATALOG_PATH,
      fresh.replace(entry, `${entry.slice(0, -1)}（手編集）`),
      "utf-8",
    );
    const { findings } = scanBlocks(TAMP_TARGETS, TAMP_TMP_ROOT);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.kind).toBe("content_change");
    expect(findings[0]!.block_id).toBe(CATALOG_BLOCK_ID);
  });

  afterAll(() => {
    fs.rmSync(TAMP_TMP_ROOT, { recursive: true, force: true });
  });
});
