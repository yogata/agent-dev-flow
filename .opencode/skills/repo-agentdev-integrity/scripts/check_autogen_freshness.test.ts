// ADF-COVERS(verification): REQ-010-059
/**
 * check_autogen_freshness.test.ts — bun:test 単体テスト。
 *
 * 合成コンテンツを用いて鮮度種別判定 (rename / status_change / content_change) と
 * report 生成ロジックを検証する。リポジトリ実状態に依存しない。
 */
import { describe, expect, test } from "bun:test";
import {
  CATALOG_PRE_BLOCK_ID,
  DECISION_BASELINE_TABLE_BLOCK_ID,
  DECISION_RETIRED_TABLE_BLOCK_ID,
  findAutogenBlocks,
} from "./generate_indexes.ts";
import {
  classifyStaleness,
  findFirstMismatch,
  parseTableRow,
  truncateForLog,
} from "./check_autogen_freshness.ts";

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
      CATALOG_PRE_BLOCK_ID,
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
