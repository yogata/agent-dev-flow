// vendored engine bundle 再生成時の焼き付き絶対パス検出・無害化自己検査。
// runtime-package-boundary.md「vendored bundle 再生成時の焼き付き絶対パス自己検査」契約の実装。
// 運用知識は docs/knowledge/bun-offline-bundle-placement-independent-build.md を参照する。
//
// Bun.build は kuromojin 既定 dicPath 用 require.resolve 等をビルド時の絶対パスへ
// 展開し得る（ビルド元 worktree パスを含む）。焼き付きは JS 文字列リテラル内に
// ビルド環境の絶対パスとして現れるため、バンドル後コードテキストを走査する。
// - 機械的に無害化可能なパス（buildRoot 配下）は配布物相対パスへ置換して出力する
// - buildRoot 配下と判定できないパスは無害化不能として unresolved に返し、
//   build 側が fail させる（fail-closed）

import * as path from "node:path";

/** 検出された焼き付き絶対パス1件。 */
export interface EmbeddedAbsolutePath {
  /** コードテキスト上のマッチ（JS 文字列リテラル内エスケープを含む生テキスト）。 */
  readonly raw: string;
  /** raw の JS 文字列エスケープ（\\ 区切り）を解除した実パス表現。 */
  readonly decoded: string;
}

/** 無害化できた焼き付きパス1件。 */
export interface SanitizedAbsolutePath extends EmbeddedAbsolutePath {
  /** 置換後テキスト（buildRoot 相対の POSIX 区切りパス）。 */
  readonly to: string;
}

export interface AbsolutePathGuardResult {
  /** 焼き付きパスを無害化したコード（無害化対象が無い場合は元のコードと同一）。 */
  readonly code: string;
  /** 無害化できた焼き付きパス（buildRoot 配下）。 */
  readonly sanitized: readonly SanitizedAbsolutePath[];
  /** 無害化できなかった焼き付きパス（buildRoot 配下でない）。空でなければ build を fail させる。 */
  readonly unresolved: readonly EmbeddedAbsolutePath[];
}

// JS 文字列リテラル内のエスケープ形: C:\\Users\\... （テキスト上は 2連バックスラッシュ）。
// URL（://）や正規表現リテラル（p:/...）と構造的に衝突しない。
const WIN_ESCAPED_PATTERN =
  /[A-Za-z]:\\\\(?:[A-Za-z0-9_.@ -]+\\\\)*[A-Za-z0-9_.@ -]+/g;
// スラッシュ正規形: C:/Users/... （:// は除外）。
const WIN_FORWARD_PATTERN =
  /[A-Za-z]:\/(?!\/)(?:[A-Za-z0-9_.@ -]+\/)*[A-Za-z0-9_.@ -]+/g;
// POSIX 絶対パス: /Users/... /home/... 等（:// の直後と識別子直後は除外）。
const POSIX_PATTERN =
  /(?<![A-Za-z0-9_:])\/(?:Users|home|root|tmp|mnt|opt|workspace)\/(?:[A-Za-z0-9_.@-]+\/)*[A-Za-z0-9_.@-]+/g;

const PATTERNS: readonly RegExp[] = [
  WIN_ESCAPED_PATTERN,
  WIN_FORWARD_PATTERN,
  POSIX_PATTERN,
];

/** raw の JS 文字列エスケープ（\\ 区切り）を解除して実パス表現へ戻す。 */
function decodePath(raw: string): string {
  return raw.includes("\\\\") ? raw.replaceAll("\\\\", "\\") : raw;
}

/** 実パス表現から焼き付き元のドライブ・区切り様式を判定する（無害化の path 計算に使う）。 */
function isWindowsStylePath(decoded: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(decoded);
}

/** buildRoot 相対の POSIX 区切りパスを返す（無害化後の置換テキスト）。 */
function toRelativePosix(buildRoot: string, decoded: string): string {
  const rel = isWindowsStylePath(decoded)
    ? path.win32.relative(buildRoot, decoded)
    : path.relative(buildRoot, decoded);
  return rel.split("\\").join("/");
}

/** 実パス表現が buildRoot 配下（機械的な無害化が可能な範囲）かを判定する。 */
function isUnderBuildRoot(decoded: string, buildRoot: string): boolean {
  const rel = isWindowsStylePath(decoded)
    ? path.win32.relative(buildRoot, decoded)
    : path.relative(buildRoot, decoded);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

/** コードテキストから焼き付き絶対パスを検出する（重複 raw は 1 件にまとめる）。 */
export function searchEmbeddedAbsolutePaths(code: string): EmbeddedAbsolutePath[] {
  const found = new Map<string, EmbeddedAbsolutePath>();
  for (const pattern of PATTERNS) {
    for (const m of code.matchAll(pattern)) {
      const raw = m[0];
      if (raw === undefined || raw.length === 0) continue;
      if (!found.has(raw)) found.set(raw, { raw, decoded: decodePath(raw) });
    }
  }
  return [...found.values()];
}

/**
 * 焼き付き絶対パスの検出・無害化自己検査。
 * buildRoot 配下のパスは相対パスへ無害化し、それ以外は unresolved として返す。
 */
export function guardEmbeddedAbsolutePaths(
  code: string,
  buildRoot: string,
): AbsolutePathGuardResult {
  const sanitized: SanitizedAbsolutePath[] = [];
  const unresolved: EmbeddedAbsolutePath[] = [];
  let next = code;
  for (const found of searchEmbeddedAbsolutePaths(code)) {
    if (!isUnderBuildRoot(found.decoded, buildRoot)) {
      unresolved.push(found);
      continue;
    }
    const to = toRelativePosix(buildRoot, found.decoded);
    sanitized.push({ ...found, to });
    next = next.split(found.raw).join(to);
  }
  return { code: next, sanitized, unresolved };
}
