/**
 * 書込み時引用識別子実在検証スクリプト（第4共通検証）。
 *
 * 正規成果物（REQ、Design、Decision）の初回作成・増分更新の書込み時に、
 * 文書本文・表中に引用する要件行 ID が docs/requirements の要件行テーブルに
 * 実在することを検査する。検査は同じ変更で作成される参照先を含む適用後状態で
 * 評価し、参照先の保存順序だけを理由に不合格としない。
 *
 * 突合規則と免除規則は整合性ルール referenced-req-row-existence の
 * 書込み時適用版である:
 * - 行 ID インデックスは要件行テーブル（表行）から構築し、本文言及を実在扱いにしない
 * - 免除: code span / fenced code block、AUTOGEN ブロック、テンプレート領域、
 *   整合性ルール説明文、履歴領域（retired、docs/reports/）、v2: 歴史識別子プレフィックス
 * - プレースホルダー様式例示（REQ-0NN-NNN、REQ-{NNNN}-{NNN} 等の非数字形式）は
 *   正規表現上マッチしないため誤検出しない
 * - 既定では各数値セグメントを最小1桁とし、桁数上限を設けない（旧番号帯を
 *   書込み時版の既定で除外しない）。プロジェクトの採番に従って idPattern で上書きできる。
 *
 * I/O:
 *   入力: argv --root <repo-root> --file <repo-relative-path> [--file ...]
 *              [--id-pattern <regex-source>]
 *         または stdin に JSON { root: string, files: [{ path, content? }], idPattern? }
 *         content を指定したエントリは未ディスクの適用後本文として扱う。
 *         要件行テーブルファイルの content はインデックスの適用後上書きに使う
 *         （同じ変更で作成される参照先を含む適用後状態評価）。
 *   出力: stdout に JSON { ok, errors[], warnings[], checkedFiles, missing: [{id, file, line}] }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitJson, emitError } from "../lib/result.ts";

export type ReqRowRef = { path: string; content: string };

export type ReqRowExistenceResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  checkedFiles: number;
  missing: Array<{ id: string; file: string; line: number }>;
};

export type ReqRowCheckInput = {
  root: string;
  files: Array<{ path: string; content?: string | null }>;
  idPattern?: string;
};

/**
 * 書込み時版の既定 ID 正規表現（regex source）。
 * v2: 歴史識別子プレフィックス免除、前置一致除外、後置数字除外を含む。
 * 受理は形式妥当性のみ（REQ- 接頭辞・ハイフン区切り・数値セグメント2つ・
 * 各セグメント最小1桁）。桁数上限なし（受理上限撤廃 Decision 参照）。
 * 後置数字除外（(?!\d)）により長い行番号の部分一致を防ぐ。
 */
export const DEFAULT_ID_PATTERN =
  "(?<!v2:)(?<![\\w-])REQ-\\d+-\\d+(?![\\w-])";

/** Windows パス区切りを POSIX に正規化する。 */
export function toPosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * 要件行テーブルを含む（インデックス構築対象となる）repo-relative パスか判定する。
 * docs/requirements 直下と retired/ 配下の REQ-{NNNN}.md / REQ-{NNNN}.md。
 */
export function isRequirementTablePath(relPosixPath: string): boolean {
  return /^docs\/requirements\/(retired\/)?REQ-\d+\.md$/.test(relPosixPath);
}

/**
 * 書込み検証対象外の免除パスか判定する（テンプレート領域、整合性ルール説明文、履歴領域）。
 */
export function isExemptTargetPath(relPosixPath: string): boolean {
  const p = relPosixPath;
  if (p.endsWith("_template.md")) return true;
  if (p.includes("/templates/")) return true;
  if (/^docs\/designs\/integrity\/rules\/IR-[^/]*\.md$/.test(p)) return true;
  if (p.startsWith("docs/requirements/retired/")) return true;
  if (p.startsWith("docs/decisions/retired/")) return true;
  if (p.startsWith("docs/reports/")) return true;
  return false;
}

/** 当該行内の指定文字位置が code span 内か判定する（行頭側のバッククォート数が奇数）。 */
export function isInsideCodeSpan(line: string, charIndex: number): boolean {
  let backtickCount = 0;
  for (let i = 0; i < charIndex && i < line.length; i++) {
    if (line[i] === "`") backtickCount++;
  }
  return backtickCount % 2 === 1;
}

/** 当該行が fenced code block 内か判定する（``` トグル）。 */
export function isInsideCodeBlock(
  lines: readonly string[],
  lineIndex: number,
): boolean {
  let inCode = false;
  for (let i = 0; i <= lineIndex && i < lines.length; i++) {
    if (/^\s*```/.test(lines[i]!)) inCode = !inCode;
  }
  if (/^\s*```/.test(lines[lineIndex] ?? "")) {
    let countAbove = 0;
    for (let i = 0; i < lineIndex; i++) {
      if (/^\s*```/.test(lines[i]!)) countAbove++;
    }
    return countAbove % 2 === 1;
  }
  return inCode;
}

/** AUTOGEN ブロック（機械生成領域）内の行をマスクする。 */
export function buildAutogenLineMask(lines: readonly string[]): boolean[] {
  const mask = new Array<boolean>(lines.length).fill(false);
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    if (/<!--\s*AUTOGEN:BEGIN/.test(lines[i]!)) inBlock = true;
    mask[i] = inBlock;
    if (/<!--\s*AUTOGEN:END\s*-->/.test(lines[i]!)) inBlock = false;
  }
  return mask;
}

/**
 * 1つの本文から要件行テーブル（表行）に出現する要件行 ID を収集する（純粋関数）。
 * 表行先頭出現を実在の正とし、本文言及を収集しない。
 */
export function collectRequirementRowIds(
  content: string,
  pattern: RegExp,
): Set<string> {
  const rows = new Set<string>();
  for (const line of content.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(line)) !== null) {
      rows.add(m[0]);
    }
  }
  return rows;
}

/**
 * 要件行インデックスを構築する（純粋関数）。
 * base はディスク上の既存テーブル群、overlay は同じ変更で作成・更新される
 * 参照先の適用後本文群であり、同パスの base は overlay（適用後状態）で置き換わる。
 */
export function buildRequirementRowIndex(
  baseFiles: readonly ReqRowRef[],
  overlayFiles: readonly ReqRowRef[],
  pattern: RegExp,
): Set<string> {
  const overlayPaths = new Set(overlayFiles.map((f) => toPosixPath(f.path)));
  const rows = new Set<string>();
  for (const f of baseFiles) {
    if (overlayPaths.has(toPosixPath(f.path))) continue;
    for (const id of collectRequirementRowIds(f.content, pattern)) rows.add(id);
  }
  for (const f of overlayFiles) {
    for (const id of collectRequirementRowIds(f.content, pattern)) rows.add(id);
  }
  return rows;
}

/**
 * 1つの本文から、インデックスに存在しない要件行 ID の引用を検出する（純粋関数）。
 * code block、AUTOGEN ブロック、code span 内は免除する。
 */
export function findPhantomCitations(
  target: ReqRowRef,
  rowIndex: ReadonlySet<string>,
  pattern: RegExp,
): Array<{ id: string; line: number }> {
  const phantoms: Array<{ id: string; line: number }> = [];
  const lines = target.content.split("\n");
  const autogenMask = buildAutogenLineMask(lines);
  const reportedOnLine = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    if (isInsideCodeBlock(lines, i)) continue;
    if (autogenMask[i]) continue;
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(lines[i]!)) !== null) {
      if (isInsideCodeSpan(lines[i]!, m.index)) continue;
      const id = m[0];
      const dedupeKey = `${i}:${id}`;
      if (reportedOnLine.has(dedupeKey)) continue;
      reportedOnLine.add(dedupeKey);
      if (rowIndex.has(id)) continue;
      phantoms.push({ id, line: i + 1 });
    }
  }
  return phantoms;
}

/**
 * 書込み時引用識別子実在検証のメイン純粋関数。
 * targets は書込み対象の適用後本文群（免除パスは検証対象外）。
 */
export function checkReqRowExistence(
  targets: readonly ReqRowRef[],
  rowIndex: ReadonlySet<string>,
  pattern: RegExp,
): ReqRowExistenceResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: Array<{ id: string; file: string; line: number }> = [];
  let checkedFiles = 0;
  for (const target of targets) {
    const relPath = toPosixPath(target.path);
    if (isExemptTargetPath(relPath)) {
      warnings.push(`exempt path skipped: ${relPath}`);
      continue;
    }
    checkedFiles++;
    for (const phantom of findPhantomCitations(target, rowIndex, pattern)) {
      missing.push({ id: phantom.id, file: relPath, line: phantom.line });
      errors.push(
        `phantom REQ row citation '${phantom.id}' at ${relPath}:${phantom.line} ` +
          `(no requirement row exists in docs/requirements)`,
      );
    }
  }
  return { ok: errors.length === 0, errors, warnings, checkedFiles, missing };
}

/** root の docs/requirements（現行 + retired）から既存テーブルを repo-relative パス付きで読み込む。 */
function readBaseTableFiles(root: string): ReqRowRef[] {
  const reqDir = join(root, "docs", "requirements");
  const files: ReqRowRef[] = [];
  const dirs: Array<{ abs: string; rel: string }> = [
    { abs: reqDir, rel: "docs/requirements" },
    { abs: join(reqDir, "retired"), rel: "docs/requirements/retired" },
  ];
  for (const dir of dirs) {
    let names: string[];
    try {
      names = readdirSync(dir.abs);
    } catch {
      continue;
    }
    for (const name of names
      .filter((n) => /^REQ-\d+\.md$/.test(n))
      .sort()) {
      try {
        files.push({
          path: `${dir.rel}/${name}`,
          content: readFileSync(join(dir.abs, name), "utf-8"),
        });
      } catch {
        // 読めないテーブルは既存インデックスから除外する（検証対象の状態のみで評価）
      }
    }
  }
  return files;
}

function compilePattern(idPattern: string | undefined): RegExp {
  const source = idPattern ?? DEFAULT_ID_PATTERN;
  try {
    return new RegExp(source, "g");
  } catch (e) {
    emitError(`invalid --id-pattern regex: ${source} (${String(e)})`);
  }
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function resolveFileContent(
  root: string,
  entry: { path: string; content?: string | null },
): string {
  if (typeof entry.content === "string") return entry.content;
  return readFileSync(join(root, toPosixPath(entry.path)), "utf-8");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let input: ReqRowCheckInput | null = null;

  const rootIdx = args.indexOf("--root");
  if (rootIdx >= 0) {
    const root = args[rootIdx + 1];
    if (!root) emitError("Usage: --root <repo-root> requires a value");
    const files: Array<{ path: string; content?: string | null }> = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--file") {
        const p = args[i + 1];
        if (!p) emitError("--file requires a repo-relative path value");
        files.push({ path: p });
      }
    }
    if (files.length === 0) {
      emitError(
        "Usage: check-req-row-existence --root <repo-root> --file <repo-relative-path> [--file ...] [--id-pattern <regex>]",
      );
    }
    const patternIdx = args.indexOf("--id-pattern");
    const idPattern =
      patternIdx >= 0 ? (args[patternIdx + 1] ?? undefined) : undefined;
    input = { root, files, idPattern };
  } else {
    const stdinContent = await readStdin();
    if (!stdinContent) {
      emitError(
        "Usage: check-req-row-existence --root <repo-root> --file <repo-relative-path> [...]  OR  stdin JSON { root, files: [{ path, content? }], idPattern? }",
      );
    }
    let parsed: ReqRowCheckInput;
    try {
      parsed = JSON.parse(stdinContent) as ReqRowCheckInput;
    } catch {
      emitError(`Invalid JSON on stdin: ${stdinContent}`);
    }
    if (
      typeof parsed.root !== "string" ||
      !Array.isArray(parsed.files) ||
      parsed.files.length === 0
    ) {
      emitError(
        'stdin JSON must be { root: string, files: [{ path: string, content?: string }], idPattern?: string } with at least one file',
      );
    }
    input = parsed;
  }

  const pattern = compilePattern(input.idPattern);

  // 適用後状態のインデックス: 既存テーブル（base）+ 同一変更で作成される参照先（overlay）
  const baseFiles = readBaseTableFiles(input.root);
  const overlayFiles: ReqRowRef[] = [];
  const targets: ReqRowRef[] = [];
  for (const entry of input.files) {
    const content = resolveFileContent(input.root, entry);
    const relPosix = toPosixPath(entry.path);
    if (isRequirementTablePath(relPosix)) {
      overlayFiles.push({ path: relPosix, content });
    }
    targets.push({ path: entry.path, content });
  }
  const rowIndex = buildRequirementRowIndex(baseFiles, overlayFiles, pattern);

  emitJson(checkReqRowExistence(targets, rowIndex, pattern));
}

if (import.meta.main) {
  await main();
}
