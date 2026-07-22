/**
 * Frontmatter と ID 形式の parse ヘルパー（純粋関数）。
 *
 * Markdown ヘッダの `---` 区切り frontmatter を抽出し、
 * REQ-NNNN / ADR-NNNN / REQ-NNNN-MMM 形式の ID から番号を取り出す。
 */

export type Frontmatter = Record<string, string>;

/**
 * Markdown 本文から frontmatter ブロックを抽出してパースする。
 * frontmatter がない場合は null を返す。
 *
 * 対応 YAML サブセット:
 *   - `key: value` 単純スカラー
 *   - 値のクォート（"…" / '…'）は除去
 *   - 配列や入れ子には未対応（本スキルの frontmatter はフラット scalar 的運用）
 */
export function parseFrontmatter(content: string): Frontmatter | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match || match[1] === undefined) return null;
  return parseYamlScalars(match[1]);
}

function parseYamlScalars(yaml: string): Frontmatter {
  const result: Frontmatter = {};
  for (const line of yaml.split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!m || m[1] === undefined || m[2] === undefined) continue;
    const key = m[1];
    const raw = m[2].trim();
    result[key] = stripQuotes(raw);
  }
  return result;
}

function stripQuotes(value: string): string {
  if (value.length < 2) return value;
  const first = value[0]!;
  const last = value[value.length - 1]!;
  if (first === last && (first === '"' || first === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

/** `REQ-NNNN` 形式から数値を取り出す。未整形式は null。 */
export function extractReqNumber(id: string): number | null {
  const m = /^REQ-(\d{4})$/.exec(id);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** `ADR-NNNN` 形式から数値を取り出す。未整形式は null。 */
export function extractAdrNumber(id: string): number | null {
  const m = /^ADR-(\d{4})$/.exec(id);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** `REQ-NNNN-MMM` 形式から { req, row } を取り出す。未整形式は null。 */
export function extractCompositeIdNumbers(
  id: string,
): { req: number; row: number } | null {
  const m = /^REQ-(\d{4})-(\d{3})$/.exec(id);
  if (!m || !m[1] || !m[2]) return null;
  return { req: parseInt(m[1], 10), row: parseInt(m[2], 10) };
}
