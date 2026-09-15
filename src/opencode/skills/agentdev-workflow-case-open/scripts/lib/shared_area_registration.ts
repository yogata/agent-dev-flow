// ADF-COVERS(implementation): REQ-061-030
//
// 共有領域の正規成果物実ファイルの現行登録状態の機械的読取。
// 共有領域は「複数 Case から新規行登録需要が発生し得る共有カタログ・索引・宣言領域」
// として一般化して定義し、本モジュールは入力された相対パスのファイル内容から
// 登録済み要件行ID集合を抽出する。特定プロジェクトの具体パスは参照しない
// （プロジェクト側は project-extensions の既存の拡張点で解決した値を入力する）。

import type { SharedAreaKind } from "./cross_dependency_types.ts";

// 単一ID または `REQ-{NNN}-{MMM}..REQ-{NNN}-{MMM}` 形式の範囲を 1 トークンとして抽出する。
const REQ_ROW_SPAN_RE = /REQ-\d{3,4}-\d{3}(?:\.\.REQ-\d{3,4}-\d{3})?/g;

export function readSharedAreaRegistration(
  kind: SharedAreaKind,
  content: string,
): Set<string> {
  switch (kind) {
    case "req-row-list":
      return collectReqRowListEntries(content);
    case "adf-covers-declarations":
      return collectDeclarationReqRows(content);
    case "req-row-mentions":
      return collectReqRowMentions(content);
  }
}

// カタログ形式: 箇条書きエントリは 1 行 1 エントリ。
// `- REQ-{NNN}-{MMM}..REQ-{NNN}-{MMM}: 説明` / `- REQ-{NNN}-{MMM}: 説明` の両形式の登録行を
// 扱う。見出し行や本文中の言及は登録とはみなさない（エントリ行のみを対象とする）。
function collectReqRowListEntries(content: string): Set<string> {
  const registered = new Set<string>();
  for (const line of content.split(/\r?\n/)) {
    const entry = line.match(/^\s*[-*]\s+(.*)$/);
    if (!entry || entry[1] === undefined) continue;
    collectSpans(registered, entry[1]);
  }
  return registered;
}

// 対応宣言領域形式: 宣言行の ID リストを登録状態とする。
// 正規表現リテラル内の丸括弧はエスケープしており、本ファイル本文が
// 宣言コーパス走査で宣言行として誤検出されない構造としている。
function collectDeclarationReqRows(content: string): Set<string> {
  const registered = new Set<string>();
  const declarationLineRe =
    /^\s*(?:<!--|\/\/)\s*ADF-COVERS\((?:design|implementation|verification)\):\s*([^>]*?)(?:-->\s*)?$/;
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(declarationLineRe);
    if (!m || m[1] === undefined) continue;
    collectSpans(registered, m[1]);
  }
  return registered;
}

// 索引等の緩い形式: ファイル本文に現れる要件行IDをすべて登録済みとみなす。
function collectReqRowMentions(content: string): Set<string> {
  const registered = new Set<string>();
  collectSpans(registered, content);
  return registered;
}

function collectSpans(registered: Set<string>, text: string): void {
  REQ_ROW_SPAN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REQ_ROW_SPAN_RE.exec(text)) !== null) {
    for (const id of expandSpan(m[0])) registered.add(id);
  }
}

// 範囲は同一 REQ 番号内でのみ展開する。組不出来な範囲は両端の ID のみ登録する。
function expandSpan(span: string): string[] {
  const ids = span.split("..");
  const first = ids[0];
  const second = ids[1];
  if (first === undefined) return [];
  if (second === undefined) return [first];
  const prefix = reqPrefixOf(first);
  if (prefix === null || prefix !== reqPrefixOf(second)) return [first, second];
  const start = rowNumberOf(first);
  const end = rowNumberOf(second);
  if (start === null || end === null || start > end || end - start > 999) {
    return [first, second];
  }
  const out: string[] = [];
  for (let row = start; row <= end; row++) {
    out.push(`${prefix}${String(row).padStart(3, "0")}`);
  }
  return out;
}

function reqPrefixOf(id: string): string | null {
  const m = id.match(/^(REQ-\d{3,4}-)/);
  return m?.[1] ?? null;
}

function rowNumberOf(id: string): number | null {
  const m = id.match(/-(\d{3})$/);
  if (!m || m[1] === undefined) return null;
  const parsed = Number.parseInt(m[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
}
