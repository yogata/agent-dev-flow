// agentdev-textlint-guard 共通実行基盤: SHA-256 ハッシュヘルパー。
//
// ファイル単位結果の同一性判定（REQ-053-042）と規則構成ハッシュ
// （textlint-quality-runtime.md「規則校正と移行検証」節）が共有する
// 決定的ハッシュ手順。内容はすべて SHA-256（hex、64 文字）で表現する。

import { createHash } from "node:crypto";
import * as fs from "node:fs";

/** 文字列の SHA-256（hex）。 */
export function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** ファイル内容の SHA-256（hex）。読込み失敗は例外として呼出側へ伝播する。 */
export function sha256FileHex(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

/** 辞書順の決定的文字列比較（locale に依存しない）。 */
export function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * canonical JSON（キー辞書順）の直列化。同一データから同一文字列を生成する。
 * 配列は順序を保持する（並び順が意味を持つため）、オブジェクトのキーのみ正規化する。
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const type = typeof value;
  if (type === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => compareStrings(a, b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  if (type === "number" || type === "boolean" || type === "string") return JSON.stringify(value);
  if (type === "undefined") return "null";
  // 関数・symbol 等は規則 options に出現しない（出現したら追跡不能として扱う）。
  throw new Error(`canonicalJson: unsupported value type (${type})`);
}
