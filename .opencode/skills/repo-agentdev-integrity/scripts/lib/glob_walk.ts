// node:fs glob ベースの再帰列挙共有ヘルパー（OU-002、checker-execution-contracts Design
// 「再帰ファイル探索と CLI 引数解析の標準API移行」節）。
//
// 旧 readdirSync 再帰実装との外部契約維持:
// - 列挙対象は走査ルート配下の全エントリ（拡張子フィルタは呼び出し側指定）
// - symlink/junction ディレクトリは下降しない（lstat の reparse/symlink 判定で
//   祖先ディレクトリを検査し、リンク経由のパスを除外）
// - filesOnly 指定時は lstat の isFile 判定で通常ファイルのみ返す
//   （Dirent.isFile() と同一 semantics: リンクファイルは除外）
// - 存在しないディレクトリは空配列（エラー送出なし）
// - 戻り値は forward slash 正規化済み相対パスの sort 順（列挙決定性）
//
// 既知の表現力上限（実行環境の node:fs glob 仕様に由来、文書化済み）:
// - ワイルドカードはドット始まりパス要素を列挙できない。走査ルート直下の
//   ドット名ディレクトリは単一階層 readdir で発見して cwd 直指定の glob で
//   列挙する。それより深い位置のドット名ディレクトリ・ドットファイルは
//   列挙不能（本リポジトリの走査対象ツリーに該当は存在しない）

import * as path from "path";
import * as fs from "fs";

export interface GlobWalkOptions {
  /** エントリ名の拡張子フィルタ（例: [".md", ".ts"]）。未指定時は全エントリ */
  readonly extensions?: readonly string[];
  /** 指定ディレクトリ名を含むサブツリーを列挙から除外（例: ["node_modules", ".git"]） */
  readonly skipDirNames?: readonly string[];
  /** lstat の isFile 判定で通常ファイルのみ返す（旧 Dirent.isFile() 相当） */
  readonly filesOnly?: boolean;
}

function hasNoLinkAncestor(rootDir: string, segments: readonly string[]): boolean {
  for (let i = 1; i < segments.length; i++) {
    try {
      if (fs.lstatSync(path.join(rootDir, ...segments.slice(0, i))).isSymbolicLink()) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function collectGlobMatches(
  rootDir: string,
  cwd: string,
  prefix: readonly string[],
  opts: GlobWalkOptions | undefined,
  out: string[],
): void {
  let matches: string[] = [];
  try {
    matches = fs.globSync("**/*", { cwd }) as string[];
  } catch (error) {
    // ENOENT（走査ルート欠落）は空扱い。それ以外は握り潰さず伝播させる
    // （旧実装も readdirSync のエラーを握り潰さなかった）。
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
  for (const match of matches) {
    const segments = [...prefix, ...match.replace(/\\/g, "/").split("/")];
    const name = segments[segments.length - 1];
    if (opts?.skipDirNames?.some((d) => segments.slice(0, -1).includes(d))) continue;
    if (opts?.extensions && !opts.extensions.some((e) => name.endsWith(e))) continue;
    if (opts?.filesOnly) {
      try {
        if (!fs.lstatSync(path.join(rootDir, ...segments)).isFile()) continue;
      } catch {
        continue;
      }
    }
    if (!hasNoLinkAncestor(rootDir, segments)) continue;
    out.push(segments.join("/"));
  }
}

export function globWalkRel(rootDir: string, opts?: GlobWalkOptions): string[] {
  const out: string[] = [];
  collectGlobMatches(rootDir, rootDir, [], opts, out);

  // 走査ルート直下のドット名ディレクトリ（ワイルドカードで列挙不可）の補助列挙
  let topEntries: import("fs").Dirent[] = [];
  try {
    topEntries = fs.readdirSync(rootDir, { withFileTypes: true }) as import("fs").Dirent[];
  } catch {
    topEntries = [];
  }
  for (const ent of topEntries) {
    if (!ent.isDirectory() || !ent.name.startsWith(".")) continue;
    collectGlobMatches(rootDir, path.join(rootDir, ent.name), [ent.name], opts, out);
  }
  return out.sort();
}
