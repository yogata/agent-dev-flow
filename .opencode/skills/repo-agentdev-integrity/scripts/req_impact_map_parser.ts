/**
 * Parser for `docs/specs/req-impact-map.md` (REQ-0136-040, Issue #898 Task 1.2).
 *
 * Extracts two structures:
 *  - **Impact Matrix**: REQ × 影響する Rule IDs × 影響する Artifact rows
 *  - **Delta Guard table**: 変更種別 × 実行 Rules rows (under
 *    "### Delta Guard Rule Selection")
 *
 * Rule-ID cells may be a CSV (`IR-001, IR-002`), a range
 * (`IR-001~IR-024 (全件)`), or an em-dash placeholder (`—`). Ranges are
 * expanded to the literal ID list written; `(全件)` / `(infrastructure)`
 * annotations are dropped from the parsed list but preserved in `raw`.
 */
const RULE_ID_RE = /\bIR-(\d{3})\b/g;
const RANGE_RE = /IR-(\d{3})\s*[~〜]\s*IR-(\d{3})/;
const TABLE_ROW_RE = /^\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/;

export class ReqImpactMapParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReqImpactMapParseError";
  }
}

export interface ImpactMatrixEntry {
  reqId: string;
  title: string;
  ruleIds: string[];
  artifacts: string[];
  raw: string;
}

export interface DeltaGuardEntry {
  changeType: string;
  ruleIds: string[];
  raw: string;
}

export interface ReqImpactMap {
  impactMatrix: ImpactMatrixEntry[];
  deltaGuardTable: DeltaGuardEntry[];
}

function padRuleId(n: number): string {
  return `IR-${String(n).padStart(3, "0")}`;
}

function expandRangeOnce(cell: string): string[] {
  const m = cell.match(RANGE_RE);
  if (!m) return [];
  const start = parseInt(m[1], 10);
  const end = parseInt(m[2], 10);
  if (end < start) return [];
  const out: string[] = [];
  for (let i = start; i <= end; i++) out.push(padRuleId(i));
  return out;
}

function parseRuleIdCell(cell: string): string[] {
  const trimmed = cell.trim();
  if (trimmed === "" || trimmed === "—" || trimmed === "-") return [];
  const range = expandRangeOnce(trimmed);
  if (range.length > 0) return range;
  const ids = trimmed.match(RULE_ID_RE);
  return ids ? Array.from(new Set(ids)) : [];
}

function parseArtifactCell(cell: string): string[] {
  const trimmed = cell.trim();
  if (trimmed === "" || trimmed === "—" || trimmed === "-") return [];
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isReqId(token: string): boolean {
  return /^REQ-\d{4}$/.test(token.trim());
}

function extractSection(content: string, header: string): string {
  const re = new RegExp(
    `^${header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
    "m",
  );
  const startMatch = content.match(re);
  if (!startMatch || startMatch.index === undefined) {
    throw new ReqImpactMapParseError(
      `section "${header}" not found in req-impact-map`,
    );
  }
  const afterStart = content.slice(startMatch.index + startMatch[0].length);
  const nextHeader = afterStart.match(/^#{1,6}\s+/m);
  return nextHeader && nextHeader.index !== undefined
    ? afterStart.slice(0, nextHeader.index)
    : afterStart;
}

function parseTableRows(section: string): string[][] {
  const rows: string[][] = [];
  for (const line of section.split("\n")) {
    const m = line.match(TABLE_ROW_RE);
    if (!m) continue;
    const cells = line
      .slice(line.indexOf("|") + 1, line.lastIndexOf("|"))
      .split("|")
      .map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    rows.push(cells);
  }
  return rows;
}

function parseImpactMatrix(section: string): ImpactMatrixEntry[] {
  const rows = parseTableRows(section);
  if (rows.length === 0) {
    throw new ReqImpactMapParseError("Impact Matrix has no data rows");
  }
  const entries: ImpactMatrixEntry[] = [];
  for (const cells of rows) {
    if (cells.length < 4) continue;
    const reqId = cells[0].trim();
    if (!isReqId(reqId)) continue;
    const raw = cells[2];
    entries.push({
      reqId,
      title: cells[1].trim(),
      ruleIds: parseRuleIdCell(raw),
      artifacts: parseArtifactCell(cells[3]),
      raw,
    });
  }
  if (entries.length === 0) {
    throw new ReqImpactMapParseError("Impact Matrix has no REQ-* rows");
  }
  return entries;
}

function parseDeltaGuardTable(section: string): DeltaGuardEntry[] {
  const rows = parseTableRows(section);
  if (rows.length === 0) {
    throw new ReqImpactMapParseError("Delta Guard table has no data rows");
  }
  const entries: DeltaGuardEntry[] = [];
  for (const cells of rows) {
    if (cells.length < 2) continue;
    const changeType = cells[0].trim();
    if (!changeType || changeType === "変更種別") continue;
    const raw = cells[1];
    entries.push({
      changeType,
      ruleIds: parseRuleIdCell(raw),
      raw,
    });
  }
  if (entries.length === 0) {
    throw new ReqImpactMapParseError("Delta Guard table has no 変更種別 rows");
  }
  return entries;
}

export function parseReqImpactMap(content: string): ReqImpactMap {
  if (!content || content.trim().length === 0) {
    throw new ReqImpactMapParseError("impact-map content is empty");
  }
  if (!/^#\s+REQ Impact Map/m.test(content)) {
    throw new ReqImpactMapParseError(
      "missing top-level '# REQ Impact Map' header",
    );
  }
  const matrixSection = extractSection(content, "## Impact Matrix");
  const deltaSection = extractSection(
    content,
    "### Delta Guard Rule Selection",
  );
  return {
    impactMatrix: parseImpactMatrix(matrixSection),
    deltaGuardTable: parseDeltaGuardTable(deltaSection),
  };
}

export function lookupImpactMatrix(
  map: ReqImpactMap,
  reqId: string,
): ImpactMatrixEntry | undefined {
  return map.impactMatrix.find((e) => e.reqId === reqId);
}

export function lookupDeltaGuard(
  map: ReqImpactMap,
  changeType: string,
): DeltaGuardEntry | undefined {
  return map.deltaGuardTable.find((e) => e.changeType === changeType);
}
