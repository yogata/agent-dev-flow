/**
 * Frontmatter と ID 形式の parse ヘルパー（純粋関数）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 * extractAdrNumber のみ、ADR 採番契約が正規文書から導出不能なため
 * 本スキルの局所定義を維持する（該当統合の停止。導出根拠の記録は case 実行 PR 本文参照）。
 */

export type { Frontmatter } from "../../../agentdev-artifact-validation/scripts/lib/frontmatter.ts";

export {
  parseFrontmatter,
  extractReqNumber,
  extractCompositeIdNumbers,
} from "../../../agentdev-artifact-validation/scripts/lib/frontmatter.ts";

/** `ADR-NNNN` 形式から数値を取り出す。未整形式は null。 */
export function extractAdrNumber(id: string): number | null {
  const m = /^ADR-(\d{3,4})$/.exec(id);
  return m && m[1] ? parseInt(m[1], 10) : null;
}
