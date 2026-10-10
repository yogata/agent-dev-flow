// 採用宣言ファイルの読み込みと解析（YAML 標準 API 委譲）。
// - YAML 解析は保証サブセット（anchor、alias、カスタムタグ、複数ドキュメントを除く）
//   に従い標準 API（Bun.YAML.parse）へ委譲する
// - 宣言ファイル不在、読取不能、schema 不適合を区別し、
//   いずれも黙って読み飛ばさない（silent skip 禁止）

import { readFileSync } from "node:fs";
import { DEFAULT_DECLARATION_PATH, validateConventions, type AdoptedConventions, type SchemaIssue } from "./schema.ts";

export type LoadedConventions =
  | { readonly status: "absent"; readonly file: string; readonly declarations: null; readonly issues: readonly SchemaIssue[] }
  | { readonly status: "unreadable"; readonly file: string; readonly declarations: null; readonly issues: readonly SchemaIssue[]; readonly detail: string }
  | { readonly status: "invalid"; readonly file: string; readonly declarations: null; readonly issues: readonly SchemaIssue[] }
  | { readonly status: "loaded"; readonly file: string; readonly declarations: AdoptedConventions; readonly issues: readonly SchemaIssue[] };

export function defaultDeclarationPath(): string {
  return DEFAULT_DECLARATION_PATH;
}

/**
 * 対象プロジェクト root から採用宣言を読み込み、検証済みの採用規約へ正規化する。
 * 宣言ファイル不在は absent、IO 由来の読取不能は unreadable、
 * YAML 解析失敗と schema 不適合は invalid として区別して返す。
 */
export function loadConventions(root: string, file?: string): LoadedConventions {
  const declarationFile = (file ?? DEFAULT_DECLARATION_PATH).replace(/\\/g, "/");
  let text: string;
  try {
    text = readFileSync(`${root}/${declarationFile}`, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT") {
      return { status: "absent", file: declarationFile, declarations: null, issues: [] };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { status: "unreadable", file: declarationFile, declarations: null, issues: [], detail: message };
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: "invalid", file: declarationFile, declarations: null, issues: [{ path: "", detail: `YAML 解析失敗: ${message}` }] };
  }
  const result = validateConventions(parsed);
  if (result.declarations === null) {
    return { status: "invalid", file: declarationFile, declarations: null, issues: result.issues };
  }
  return { status: "loaded", file: declarationFile, declarations: result.declarations, issues: [] };
}
