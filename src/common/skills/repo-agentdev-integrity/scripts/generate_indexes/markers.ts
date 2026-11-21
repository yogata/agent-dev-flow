// AUTOGEN マーカー検出とブロック操作（generate_indexes.ts 分割モジュール）。
//
// 自動生成マーカー形式（SC-002 Design、IR-061 準拠）:
//   <!-- AUTOGEN:BEGIN:id=<id> -->
//   ... 自動生成領域 ...
//   <!-- AUTOGEN:END -->
//
// 検出は行全体一致方式（Issue #1771）。説明文中の backtick 囲み（インラインコード）
// marker 文字列を実 marker と誤認しないため、部分一致（line.includes）ではなく
// 行全体が正規マーカー形式に一致するかで判定する。backtick 文脈判定のような
// 部分一致ロジックは併用しない（index-auto-generation.md「AUTOGEN marker 検出契約」）。

/** AUTOGEN:BEGIN マーカー行全体一致パターン。id は非空白文字列。 */
const AUTOGEN_BEGIN_LINE_RE = /^\s*<!-- AUTOGEN:BEGIN:id=(\S+) -->\s*$/;
/** AUTOGEN:END マーカー行全体一致パターン。 */
const AUTOGEN_END_LINE_RE = /^\s*<!-- AUTOGEN:END -->\s*$/;

/**
 * 行全体が AUTOGEN:BEGIN マーカー形式（`<!-- AUTOGEN:BEGIN:id=<id> -->`）に一致するか判定する。
 * backtick 囲み等の部分一致は行全体一致判定で自動的に除外される。
 */
export function isAutogenBeginLine(line: string): boolean {
  return AUTOGEN_BEGIN_LINE_RE.test(line);
}

/**
 * 行全体が AUTOGEN:END マーカー形式（`<!-- AUTOGEN:END -->`）に一致するか判定する。
 */
export function isAutogenEndLine(line: string): boolean {
  return AUTOGEN_END_LINE_RE.test(line);
}

/**
 * AUTOGEN:BEGIN マーカー行から id を抽出する。
 * 行全体が BEGIN マーカー形式に一致しない場合は null を返す。
 */
export function extractAutogenBeginId(line: string): string | null {
  const match = line.match(AUTOGEN_BEGIN_LINE_RE);
  return match ? (match[1] ?? null) : null;
}

export interface AutogenBlock {
  id: string;
  /** マーカー開始行から終了行まで（マーカー自身を含む）。 */
  startLine: number;
  endLine: number;
  /** 現在のコードブロック内行配列（マーカー間、マーカー自身は含まず）。 */
  currentBody: string[];
}

/**
 * content から指定 id の AUTOGEN ブロックを検出する。
 * マーカー形式:
 *   <!-- AUTOGEN:BEGIN:id=<id> -->
 *   ... content ...
 *   <!-- AUTOGEN:END -->
 */
export function findAutogenBlocks(content: string): AutogenBlock[] {
  const lines = content.split("\n");
  const blocks: AutogenBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const beginId = extractAutogenBeginId(line!);
    if (beginId !== null) {
      const startLine = i;
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j]!)) {
        body.push(lines[j]!);
        j++;
      }
      if (j >= lines.length) {
        // 終了マーカー不在は壊れた状態。読み飛ばす。
        i++;
        continue;
      }
      blocks.push({
        id: beginId,
        startLine,
        endLine: j,
        currentBody: body,
      });
      i = j + 1;
    } else {
      i++;
    }
  }
  return blocks;
}

/**
 * 指量 id の AUTOGEN ブロック本文を newBody で置換した content を返す。
 * ブロック未検出時は content を unchanged で返す（呼び出し元で検出）。
 */
export function replaceAutogenBlock(
  content: string,
  id: string,
  newBody: string[],
): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let i = 0;
  let replaced = false;
  while (i < lines.length) {
    const line = lines[i];
    if (extractAutogenBeginId(line!) === id && !replaced) {
      // 開始マーカー → newBody → 終了マーカーへ置換。
      out.push(line!);
      for (const bodyLine of newBody) {
        out.push(bodyLine);
      }
      // 終了マーカーまで進める。
      let j = i + 1;
      while (j < lines.length && !isAutogenEndLine(lines[j]!)) {
        j++;
      }
      if (j < lines.length) {
        out.push(lines[j]!);
        i = j + 1;
        replaced = true;
      } else {
        // 終了マーカー不在。残りを出力して終了。
        i = i + 1;
        replaced = true;
      }
    } else {
      out.push(line!);
      i++;
    }
  }
  return out.join("\n");
}

// ─── AUTOGEN block ID レジストリ ─────────────────────────────────────────────

// catalog 内の AUTOGEN ブロック ID（レジストリ単一ソース。DEC-065 決定3 により
// rules/index.ts のレジストリから生成する単一ブロック構成へ再編）。
export const CATALOG_BLOCK_ID = "catalog-ir-entries";

// rule-ownership 内の AUTOGEN ブロック ID（IR 別関連マッピング appendix）。
export const RULE_OWNERSHIP_BLOCK_ID = "rule-ownership-ir-crossref";

// req-impact-map 内の AUTOGEN ブロック ID（REQ → 影響する Rule IDs の逆方向対応）。
// IR 文書 frontmatter related_req から導出する（rule-ownership.md
// 「対応表の機械検証への移行（B3-1）」、REQ-047-013）。
export const REQ_IMPACT_MAP_BLOCK_ID = "req-impact-map-req-ir-crossref";

// docs/decisions/README.md 内の AUTOGEN block ID。
// index-auto-generation Design「AUTOGEN block ID 命名パターン」採用 ID 参照例の
// Decision README 系。旧 ADR README（docs/adr/README.md、adr-* block ID 群）は
// DEC-009 で廃止済みであり採用しない。
export const DECISION_BASELINE_COUNT_BLOCK_ID = "decision-baseline-count";
export const DECISION_BASELINE_TABLE_BLOCK_ID = "decision-baseline-table";
export const DECISION_STATUS_ACCEPTED_BLOCK_ID = "decision-status-accepted";
export const DECISION_STATUS_PROPOSED_BLOCK_ID = "decision-status-proposed";
export const DECISION_STATUS_SUPERSEDED_BLOCK_ID =
  "decision-status-superseded";
export const DECISION_STATUS_DEPRECATED_BLOCK_ID =
  "decision-status-deprecated";

// Decision README 関連REQ表（REQ-059-002、REQ-059-003）。
// 混合領域構成: 生成処理は Decision 列と関連REQ列のみ上書きし、
// 「説明」列（人手判断列）は現在の README 内容から抽出して保持する
// （index-auto-generation.md「Decision 関連REQ表の自動生成」）。
export const DECISION_RELATED_REQ_TABLE_BLOCK_ID = "decision-related-req-table";

// docs/requirements/README.md 内の AUTOGEN block ID（AG-009）。
export const REQ_ACTIVE_COUNT_BLOCK_ID = "req-active-count";
export const REQ_ACTIVE_TABLE_BLOCK_ID = "req-active-table";

// docs/README.md「要件」セクション冒頭の件数表明 AUTOGEN ブロック ID（AG-006候補2・Phase E 残）。
export const README_REQ_SUMMARY_COUNT_BLOCK_ID = "readme-req-summary-count";
export const README_REQ_SUMMARY_TABLE_BLOCK_ID = "readme-req-summary-table";

// docs/README.md「## Decision」セクションの Decision 静的表 AUTOGEN block ID
// （index-auto-generation.md「AUTOGEN block ID 命名パターン」採用 ID 参照例）。
export const README_DECISION_SUMMARY_TABLE_BLOCK_ID =
  "readme-decision-summary-table";
