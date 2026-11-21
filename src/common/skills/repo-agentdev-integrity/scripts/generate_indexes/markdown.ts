// Markdown frontmatter 解析・本文表抽出・共通ファイル読取
// （generate_indexes.ts 分割モジュール）。

const fs = require("fs") as typeof import("fs");

/**
 * Markdown frontmatter をパースする（cli_utils/check_integrity と同等 logic に
 * 加えて YAML ブロックスカラ対応を持つ）。戻り値は key→string|string[] の Map。
 * frontmatter なしは null。
 *
 * ブロックスカラ（`|`、`|-`、`|+`、`>`、`>-`、`>+`）は、キー行より深いインデントの
 * 後続行を改行結合した 1 文字列として値に格納する（DEC frontmatter の
 * supersede_note 等）。同等 logic の簡易パーサーがブロックスカラ指示子を
 * リテラル値（"|"）として読み、注記レンダリングを破損させる（〔|〕出力）
 * ことを防ぐ（index-auto-generation.md 注記形式契約・ACT-DESIGN-035）。
 */
export function parseFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1]!.trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];
  let blockKey: string | null = null;
  let blockIndent: number | null = null;
  const blockLines: string[] = [];

  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }

  function flushBlockScalar() {
    if (blockKey !== null) {
      result[blockKey] = blockLines.join("\n");
    }
    blockKey = null;
    blockIndent = null;
    blockLines.length = 0;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (blockKey !== null) {
      if (trimmed === "") {
        blockLines.push("");
        continue;
      }
      const indent = line.length - line.trimStart().length;
      if (blockIndent === null) blockIndent = indent;
      if (indent >= blockIndent) {
        blockLines.push(line.slice(blockIndent));
        continue;
      }
      // ブロックスカラ領域の終端（より浅いインデントの行）。通常パースへ続く。
      flushBlockScalar();
    }

    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey !== null) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    flushArray();
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (value === "") {
      currentKey = key;
      currentArray.length = 0;
    } else if (/^[|>][+-]?$/.test(value)) {
      // YAML ブロックスカラ開始。後続の深いインデント行を収集する。
      blockKey = key;
      blockIndent = null;
      blockLines.length = 0;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  flushBlockScalar();
  flushArray();
  return result;
}

export function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return null;
  }
}

export function listFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return (fs.readdirSync(dirPath) as string[])
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    return [];
  }
}

/**
 * 本文の Field/Value Markdown 表から指定 field の list 値を抽出する。
 * 形式: `| related_req | [REQ-0108-001, REQ-0101] |` → ["REQ-0108-001", "REQ-0101"]
 */
export function parseBodyTableArray(content: string, field: string): string[] {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    // | field | value | 形式
    const match = trimmed.match(
      new RegExp(`^\\|\\s*${field}\\s*\\|\\s*(.+?)\\s*\\|$`, "i"),
    );
    if (!match) continue;
    let value = match[1]!.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1);
    }
    return value
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);
  }
  return [];
}

/**
 * 表セル内のパイプ・改行を回避する（catalog/rule-ownership 形式と同一）。
 */
export function sanitizeTableCell(text: string): string {
  return text.replace(/\|/g, "/").replace(/\n/g, " ");
}
