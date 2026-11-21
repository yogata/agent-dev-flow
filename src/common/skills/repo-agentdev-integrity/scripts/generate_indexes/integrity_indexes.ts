// IR 系索引（catalog・rule-ownership appendix・req-impact-map 逆索引）の
// Markdown 生成（generate_indexes.ts 分割モジュール）。

import type { IrInfo, ReqInfo } from "./collectors.ts";
import { sanitizeTableCell } from "./markdown.ts";

/**
 * rules/index.ts のレジストリから catalog の AUTOGEN ブロック本文を生成する
 * （DEC-065 決定3: カタログ自動生成の単一ソース = rules レジストリ）。
 * IR-075 は Wave-4 でルール登録されるため、登録前は 24 構成となる。
 */
export function generateCatalogEntries(
  rules: readonly { id: string; title: string; slug: string }[],
): string[] {
  return rules.map((rule) => `- [${rule.id}: ${rule.title}](rules/IR-${rule.id.slice(3)}-${rule.slug}.md)`);
}

/**
 * rule-ownership appendix（IR 別関連マッピング）の表行を生成する。
 * 形式: `| IR-001 | title | REQ-0108-001, REQ-0101 | integrity-contracts.md |`
 */
function formatRuleOwnershipLine(info: IrInfo): string {
  const reqCell = info.relatedReq.length > 0 ? info.relatedReq.join(", ") : "-";
  const specCell =
    info.relatedDesign.length > 0 ? info.relatedDesign.join(", ") : "-";
  // 表セル内のパイプを回避するため改行・パイプを空白へ置換。
  const safeTitle = info.title.replace(/\|/g, "/").replace(/\n/g, " ");
  return `| ${info.id} | ${safeTitle} | ${reqCell} | ${specCell} |`;
}

export function generateRuleOwnershipAppendix(infos: IrInfo[]): string[] {
  const lines: string[] = [];
  lines.push("| IR ID | title | Related REQ | Related Design |");
  lines.push("|-------|-------|-------------|--------------|");
  for (const info of infos) {
    lines.push(formatRuleOwnershipLine(info));
  }
  return lines;
}

/**
 * IR frontmatter / Field-Value 表の related_req から REQ → IR の逆索引を導出する。
 * v2: 履歴参照と IR カタログの注記セル（非 ID 要素）は除外し、行レベル ID
 * （REQ-NNN-NNN）はファイルレベル（REQ-NNN）へ集約する。
 */
export function buildReqToIrIndex(infos: IrInfo[]): Map<string, string[]> {
  const reqToIrs = new Map<string, Set<string>>();
  for (const info of infos) {
    for (const raw of info.relatedReq) {
      const id = raw.trim();
      if (!id || id.startsWith("v2:") || id.startsWith("-")) continue;
      // 行レベル ID（REQ-NNN-NNN）はファイルレベル（REQ-NNN）へ集約する。
      // 注記付き要素（REQ-NNN (説明) 等）は ID prefix を正規化して採用する。
      const fileLevel = /^(REQ-\d+)(?:-\d+)?(?=\s|$)/.exec(id);
      if (!fileLevel) continue;
      const reqId = fileLevel[1];
      let set = reqToIrs.get(reqId!);
      if (!set) {
        set = new Set<string>();
        reqToIrs.set(reqId!, set);
      }
      set.add(info.id);
    }
  }
  const result = new Map<string, string[]>();
  for (const [reqId, irSet] of reqToIrs) {
    result.set(
      reqId,
      [...irSet].sort((a, b) => {
        const na = Number(a.slice(3));
        const nb = Number(b.slice(3));
        return na - nb;
      }),
    );
  }
  return result;
}

/**
 * req-impact-map 逆方向対応表（REQ → 影響する Rule IDs）の本文を生成する。
 * REQ タイトルは現行 REQ frontmatter から導出する。reqDir の実在 REQ ファイルと
 * 突合し、存在しない REQ ID は行に含めない（retired は導出対象外）。
 */
export function generateReqImpactMapCrossref(
  infos: IrInfo[],
  reqInfos: ReqInfo[],
): string[] {
  const reqToIrs = buildReqToIrIndex(infos);
  const titleById = new Map(reqInfos.map((r) => [r.id, r.title] as const));
  const reqIds = [...reqToIrs.keys()]
    .filter((id) => titleById.has(id))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  const lines: string[] = [];
  lines.push("| REQ | タイトル | 影響する Rule IDs |");
  lines.push("|-----|---------|------------------|");
  for (const reqId of reqIds) {
    const title = sanitizeTableCell(titleById.get(reqId) ?? "");
    const irCell = reqToIrs.get(reqId)!.join(", ");
    lines.push(`| [${reqId}](../../requirements/${reqId}.md) | ${title} | ${irCell} |`);
  }
  return lines;
}
