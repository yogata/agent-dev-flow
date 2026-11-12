/**
 * Frontmatter と ID 形式の parse ヘルパー（純粋関数）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 */

export type { Frontmatter } from "../../../agentdev-artifact-validation/scripts/lib/frontmatter.ts";

export {
  parseFrontmatter,
  extractReqNumber,
  extractCompositeIdNumbers,
} from "../../../agentdev-artifact-validation/scripts/lib/frontmatter.ts";
