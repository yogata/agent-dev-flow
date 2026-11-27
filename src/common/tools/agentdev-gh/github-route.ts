// agentdev-gh Custom Tool の GitHub 実行経路の設定読み取り。
//
// 導入先リポジトリの .agentdev/config/github-route.json を読み、Codex と
// Antigravity のそれぞれの GitHub 実行経路（プラグイン経由 / gh CLI 経由）を
// 解決する。ホスト接続領域の adapter が GitHub 操作の前に本境界経由で経路を
// 解決する。JSON 解析などの純粋な判定は parseGithubRouteConfig に集約し、
// ファイル I/O は resolveGithubRoute 側に置く。
//
// 経路の推定はしない。記録のないホストは plugin 扱いとし、設定が読めない
// または値が不正な場合は既定経路へも gh 経路へも暗黙に切り替えず失敗を返す
// （呼び出し側は GitHub 操作の前に停止する）。重複キーは最後の値で確定
// させず不正として拒否する（切替スクリプト側の検査と同一規則）。

import * as fs from "node:fs";
import * as path from "node:path";

/** GitHub 実行経路の設定を持つホスト（固定順）。 */
export type GithubRouteHost = "codex" | "antigravity";

/** GitHub 実行経路。plugin はホストの GitHub プラグイン、gh は gh CLI。 */
export type GithubRoute = "plugin" | "gh";

/** 経路設定の対象ホスト（固定順。設定ファイルのキー集合の正）。 */
export const GITHUB_ROUTE_HOSTS: readonly GithubRouteHost[] = ["codex", "antigravity"];

/** 導入先リポジトリのルートから見た経路設定ファイルの相対パス。 */
export const GITHUB_ROUTE_CONFIG_RELATIVE_PATH = ".agentdev/config/github-route.json";

const ROUTE_VALUES: readonly GithubRoute[] = ["plugin", "gh"];

/** 経路設定ファイルの解析結果。不正な内容は経路を推定せず detail を返す。 */
export type GithubRouteConfigParseResult =
  | {
      readonly ok: true;
      readonly routes: Readonly<Record<GithubRouteHost, GithubRoute>>;
    }
  | { readonly ok: false; readonly kind: "config-invalid"; readonly detail: string };

/** 1 ホストの経路解決結果。読めない・不正のいずれも既定経路へ代替しない。 */
export type GithubRouteResolution =
  | { readonly ok: true; readonly route: GithubRoute }
  | {
      readonly ok: false;
      readonly kind: "config-unreadable" | "config-invalid";
      readonly detail: string;
    };

function invalid(detail: string): GithubRouteConfigParseResult {
  return { ok: false, kind: "config-invalid", detail };
}

function parseRouteValue(value: unknown): GithubRoute | null {
  if (value === undefined) return "plugin";
  if (typeof value !== "string") return null;
  if (!ROUTE_VALUES.includes(value as GithubRoute)) return null;
  return value as GithubRoute;
}

/** 文書中のオブジェクトキー位置の文字列トークン（閉じ引用符の後がコロン）。 */
const KEY_POSITION_TOKEN = /"(?:[^"\\]|\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4}))*"\s*:/g;

/** キー位置トークンを JSON 文字列として復号し、出現順のキー名一覧を返す。 */
function keyNamesInDocumentOrder(text: string): string[] {
  return [...text.matchAll(KEY_POSITION_TOKEN)].map((m) => {
    const token = m[0].replace(/\s*:$/, "");
    return JSON.parse(token) as string;
  });
}

/**
 * 経路設定ファイルの内容を解析する（純粋関数、例外を投げない）。
 * 先頭の UTF-8 BOM は許容する。空または空白のみの内容、不正な JSON、
 * オブジェクト以外（配列、null、プリミティブ）、重複キー、未知のキー、
 * 値が plugin / gh 以外のキーのいずれも不正とする。キーの欠落は
 * plugin 扱いであるため解析に成功する。
 */
export function parseGithubRouteConfig(text: string): GithubRouteConfigParseResult {
  const withoutBom = text.startsWith("\uFEFF") ? text.slice(1) : text;
  if (withoutBom.trim().length === 0) {
    return invalid("route config file is empty");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(withoutBom);
  } catch (error) {
    return invalid(`route config file is not valid JSON: ${String(error)}`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return invalid("route config file must be a JSON object");
  }
  const record = parsed as Record<string, unknown>;
  const seenKeys = new Set<string>();
  for (const name of keyNamesInDocumentOrder(withoutBom)) {
    if (seenKeys.has(name)) {
      return invalid(`route config file has a duplicate key: ${name}`);
    }
    seenKeys.add(name);
  }
  const routes: Partial<Record<GithubRouteHost, GithubRoute>> = {};
  for (const key of Object.keys(record)) {
    if (!GITHUB_ROUTE_HOSTS.includes(key as GithubRouteHost)) {
      return invalid(`route config file has an unknown key: ${key}`);
    }
  }
  for (const host of GITHUB_ROUTE_HOSTS) {
    const route = parseRouteValue(record[host]);
    if (route === null) {
      return invalid(`route config file has an invalid value for ${host}`);
    }
    routes[host] = route;
  }
  return {
    ok: true,
    routes: routes as Readonly<Record<GithubRouteHost, GithubRoute>>,
  };
}

/**
 * 導入先リポジトリの経路設定から指定ホストの実行経路を解決する。
 * ファイル不在は plugin 扱いの成功、それ以外の読取失敗は
 * config-unreadable、内容の解析失敗は config-invalid として失敗を返す。
 */
export function resolveGithubRoute(
  repoRoot: string,
  host: GithubRouteHost,
): Promise<GithubRouteResolution> {
  const configPath = path.join(
    repoRoot,
    ...GITHUB_ROUTE_CONFIG_RELATIVE_PATH.split("/"),
  );
  let text: string;
  try {
    text = fs.readFileSync(configPath, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT") {
      return Promise.resolve({ ok: true, route: "plugin" });
    }
    return Promise.resolve({
      ok: false,
      kind: "config-unreadable",
      detail: `route config file could not be read (${code ?? String(error)}): ${configPath}`,
    });
  }
  const parsed = parseGithubRouteConfig(text);
  if (!parsed.ok) {
    return Promise.resolve(parsed);
  }
  return Promise.resolve({ ok: true, route: parsed.routes[host] });
}
