// ADF-COVERS(implementation): REQ-053-025, REQ-053-027, REQ-053-029, REQ-053-030
// agentdev-textlint-guard 共通実行基盤: Plugin 設定の読込みと検証。
//
// 固定パス .agentdev/config/plugins/agentdev-textlint-guard.yaml を読む。
// 初期形式は version: 1 と additional_targets の文字列配列だけを扱う。
// - 設定なし: 標準対象だけの正常状態
// - 構文・型・バージョン・許可項目・ルート内パスの妥当性を検証する
// - 不正な設定はエラー詳細（原因と設定パス）を返し、呼出側は write/edit/apply_patch を
//   対象外ファイルへの操作も含めて拒否する（fail-closed）
// - 設定は hook ごとに mtime で変更を検知し、修復後の次回操作から再起動なしに反映する
// - 設定ファイル自身の修復だけを許可する例外は設けない
//
// YAML 解析は依存ゼロのサブセットパーサーとする（本設定スキーマは
// version スカラーと additional_targets 文字列配列のみ。既存の宣言ファイル
// パーサーと同じ方針）。許容範囲外の構文はすべて設定エラーとして扱う。

import * as fs from "node:fs";
import * as path from "node:path";

export const CONFIG_RELATIVE_PATH = ".agentdev/config/plugins/agentdev-textlint-guard.yaml";
export const CONFIG_VERSION = 1;

/** 検証済み設定。additional_targets はルート相対 glob（正規化済み、ルート内保証済み）。 */
export interface GuardConfig {
  readonly additionalTargets: readonly string[];
}

export type GuardConfigResult =
  | { readonly ok: true; readonly config: GuardConfig; readonly present: boolean }
  | { readonly ok: false; readonly present: boolean; readonly detail: string; readonly configPath: string };

export function configPathFor(root: string): string {
  return path.join(root, ...CONFIG_RELATIVE_PATH.split("/"));
}

interface CachedConfig {
  readonly mtimeMs: number;
  readonly size: number;
  readonly result: GuardConfigResult;
}

let cache: { readonly key: string; readonly entry: CachedConfig } | null = null;

/** 設定の読込み（hook ごとの変更検知つきキャッシュ）。テストはこのキャッシュを明示的に無効化できる。 */
export function loadGuardConfig(root: string): GuardConfigResult {
  const configPath = configPathFor(root);
  let stat: fs.Stats | null = null;
  try {
    stat = fs.statSync(configPath);
  } catch {
    // 設定なしは標準対象だけの正常状態
    const result: GuardConfigResult = { ok: true, config: { additionalTargets: [] }, present: false };
    cache = null;
    return result;
  }
  if (
    cache !== null &&
    cache.key === configPath &&
    cache.entry.mtimeMs === stat.mtimeMs &&
    cache.entry.size === stat.size
  ) {
    return cache.entry.result;
  }
  const result = readAndValidate(configPath, stat);
  cache = { key: configPath, entry: { mtimeMs: stat.mtimeMs, size: stat.size, result } };
  return result;
}

/** テスト用: 設定キャッシュの無効化。 */
export function invalidateConfigCache(): void {
  cache = null;
}

function readAndValidate(configPath: string, stat: fs.Stats): GuardConfigResult {
  if (!stat.isFile()) {
    return {
      ok: false,
      present: true,
      configPath,
      detail: `config path is not a regular file (${configPath})`,
    };
  }
  let text: string;
  try {
    text = fs.readFileSync(configPath, "utf8");
  } catch (e) {
    return readFailure(configPath, e);
  }
  const parsed = parseConfigYaml(text);
  if (!parsed.ok) {
    return { ok: false, present: true, configPath, detail: `${parsed.detail} (${configPath})` };
  }
  const targets: string[] = [];
  for (const raw of parsed.additionalTargets) {
    const normalized = validateTargetGlob(raw);
    if (!normalized.ok) {
      return { ok: false, present: true, configPath, detail: `${normalized.detail} (${configPath})` };
    }
    targets.push(normalized.glob);
  }
  return { ok: true, config: { additionalTargets: targets }, present: true };
}

function readFailure(configPath: string, e: unknown): GuardConfigResult {
  const reason = e instanceof Error ? e.message : String(e);
  return { ok: false, present: true, configPath, detail: `cannot read config file: ${reason} (${configPath})` };
}

type ParsedYaml =
  | { readonly ok: true; readonly additionalTargets: readonly string[] }
  | { readonly ok: false; readonly detail: string };

/**
 * 本設定スキーマ専用の YAML サブセットパーサー。
 * 許容するのは次の形式のみ（空行・コメント行（# 開始）は除外）:
 *   version: 1
 *   additional_targets: []            （空配列のフロー形式）
 *   additional_targets:
 *     - docs-extra/**\/*.md           （ブロック配列項目）
 * 他のキー・入れ子・複雑なスカラーはすべて設定エラーとして拒否する。
 */
export function parseConfigYaml(text: string): ParsedYaml {
  const meaningful: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const noIndent = rawLine.replace(/^[\t ]+/, "");
    if (noIndent.length === 0 || noIndent.startsWith("#")) continue;
    const indented = rawLine !== noIndent;
    meaningful.push(indented ? `~${noIndent}` : noIndent);
  }
  if (meaningful.length === 0) {
    return { ok: false, detail: "config file is empty" };
  }
  let sawVersion = false;
  let sawTargets = false;
  let flowTargets: string[] | null = null;
  const blockTargets: string[] = [];
  for (const line of meaningful) {
    const isItem = line.startsWith("~- ");
    if (isItem) {
      const value = line.slice(3).trim();
      const unquoted = unquote(value);
      if (unquoted === null) {
        return { ok: false, detail: `additional_targets entry is not a string: ${value}` };
      }
      blockTargets.push(unquoted);
      continue;
    }
    if (line.startsWith("~")) {
      return { ok: false, detail: `unexpected nested syntax: ${line.slice(1)}` };
    }
    const sep = line.indexOf(":");
    if (sep <= 0) {
      return { ok: false, detail: `unrecognized line: ${line}` };
    }
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (key === "version") {
      if (sawVersion) return { ok: false, detail: "duplicate key: version" };
      sawVersion = true;
      if (value !== String(CONFIG_VERSION)) {
        return { ok: false, detail: `unsupported config version: ${value} (expected ${CONFIG_VERSION})` };
      }
      continue;
    }
    if (key === "additional_targets") {
      if (sawTargets) return { ok: false, detail: "duplicate key: additional_targets" };
      sawTargets = true;
      if (value === "") continue;
      if (value === "[]") {
        flowTargets = [];
        continue;
      }
      return { ok: false, detail: `unrecognized additional_targets value: ${value} (use a block list or [])` };
    }
    return { ok: false, detail: `unknown config key: ${key}` };
  }
  if (!sawVersion) {
    return { ok: false, detail: `missing required key: version (expected ${CONFIG_VERSION})` };
  }
  if (flowTargets !== null && blockTargets.length > 0) {
    return { ok: false, detail: "additional_targets has both flow and block entries" };
  }
  return { ok: true, additionalTargets: flowTargets ?? blockTargets };
}

function unquote(value: string): string | null {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  // YAML 型付きスカラー（数値・真偽・null）は文字列配列の項目として受け付けない
  if (/^-?\d+(\.\d+)?$/.test(value) || value === "true" || value === "false" || value === "null" || value === "~") {
    return null;
  }
  if (/^[^\s"']+$/.test(value)) return value;
  return null;
}

/** 追加対象 glob の検証。ルート相対（先頭 / 、.. 、絶対パス、バックスラッシュは拒否）。 */
export function validateTargetGlob(
  raw: string,
): { readonly ok: true; readonly glob: string } | { readonly ok: false; readonly detail: string } {
  if (raw.length === 0) {
    return { ok: false, detail: "additional_targets entry must not be empty" };
  }
  if (raw.includes("\\")) {
    return { ok: false, detail: `additional_targets entry must use / separators: ${raw}` };
  }
  if (raw.startsWith("/")) {
    return { ok: false, detail: `additional_targets entry must be root-relative (no leading /): ${raw}` };
  }
  if (raw === ".." || raw.startsWith("../")) {
    return { ok: false, detail: `additional_targets entry must stay inside the project root: ${raw}` };
  }
  if (/^[A-Za-z]:/.test(raw)) {
    return { ok: false, detail: `additional_targets entry must not be an absolute path: ${raw}` };
  }
  return { ok: true, glob: raw };
}

/** 設定エラー文言（原因 + 設定パス + 修復案内）。 */
export function formatConfigError(result: Extract<GuardConfigResult, { ok: false }>): string {
  return (
    `agentdev-textlint-guard: config is uninterpretable: ${result.detail}. ` +
    `Fix the config file with an external editor; write, edit, and apply_patch stay blocked (including writes to non-target files) until the config is valid. Config path: ${result.configPath}`
  );
}
