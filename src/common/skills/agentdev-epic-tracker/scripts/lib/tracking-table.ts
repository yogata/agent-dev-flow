// Epic 実行構成表（`| Wave | Issue | 前提 | 状態 |`）の解析と行単位の状態置換。
//
// Parses the single execution-structure table per Epic body and provides
// idempotent, row-scoped replacement used by both the closing write path
// (case-close) and the coordination reflect write path (工程記録の取りまとめ).
// 旧4列形式（# / Issue / ステータス / 内容、# / Issue / タイトル / ステータス）の
// 後方互換検出は行わない（新形式を唯一の現行形式とする）。
// 状態列は子状態4値のみ。PR 番号・URL は状態列に付記せず、子 Issue の結果・
// PR 自体から取得する。
//
// Pure functions only: no fs, no network. Callers own the read/write of the
// Epic Issue body (latest fetch -> merge -> update happens outside, then the
// merged body is written once).

export type PersistedStatus = "pending" | "completed" | "blocked" | "failed";

export const TERMINAL_STATUSES: readonly PersistedStatus[] = [
  "completed",
  "blocked",
  "failed",
];

export function isTerminalStatus(status: string): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export interface ParsedStatusCell {
  status: PersistedStatus;
}

/** Parse a status cell (pending / completed / blocked / failed の4値のみ).
 * Unknown values return null. */
export function parseStatusCell(cell: string): ParsedStatusCell | null {
  const simple = cell.trim().match(/^(pending|completed|blocked|failed)$/);
  if (!simple) return null;
  return { status: simple[1] as PersistedStatus };
}

/** 実行構成表のヘッダ行。本文に高々一つ存在する。 */
export const EXECUTION_TABLE_HEADER = "| Wave | Issue | 前提 | 状態 |";

interface LocatedRow {
  lineIndex: number;
  /** The row split by `|` (cells[0] and cells[length-1] are empty strings). */
  cells: string[];
  /** Index of the status cell in `cells`（最後の実質列）。 */
  statusIndex: number;
}

function rowPattern(childIssue: number): RegExp {
  return new RegExp(`^\\|\\s*\\d+\\s*\\|\\s*#${childIssue}\\s*\\|`);
}

function locateRow(body: string, childIssue: number): LocatedRow | null {
  const lines = body.split("\n");
  const p = rowPattern(childIssue);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!p.test(line)) continue;
    const cells = line.split("|");
    const statusIndex = cells.length - 2;
    if (statusIndex < 1) return null;
    return { lineIndex: i, cells, statusIndex };
  }
  return null;
}

/** Find the execution-structure table row of a child issue (null when absent). */
export function findChildRow(
  body: string,
  childIssue: number,
): { lineIndex: number; childIssue: number; statusCell: string } | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  return {
    lineIndex: row.lineIndex,
    childIssue,
    statusCell: (row.cells[row.statusIndex] ?? "").trim(),
  };
}

/** Read the persisted status of a child row (null when row/value unknown). */
export function readChildStatus(
  body: string,
  childIssue: number,
): ParsedStatusCell | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  return parseStatusCell(row.cells[row.statusIndex] ?? "");
}

/**
 * Replace the status cell of a child row with `statusText`.
 * Returns null when the row or its status cell is unknown. Only the status
 * cell of the matched row is rewritten; every other cell and line is
 * preserved verbatim (including the 前提 column).
 */
export function replaceChildStatus(
  body: string,
  childIssue: number,
  statusText: string,
): string | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  const lines = body.split("\n");
  const cells = row.cells.slice();
  cells[row.statusIndex] = ` ${statusText} `;
  lines[row.lineIndex] = cells.join("|");
  return lines.join("\n");
}

export interface ChildTerminalCounts {
  totalRows: number;
  terminalRows: number;
  byStatus: Record<string, number>;
}

/** Count persisted statuses across all execution-structure table child rows. */
export function countChildStatuses(body: string): ChildTerminalCounts {
  const lines = body.split("\n");
  const rowLinePattern = /^\|\s*\d+\s*\|\s*#\d+\s*\|/;
  const byStatus: Record<string, number> = {};
  let totalRows = 0;
  let terminalRows = 0;
  for (const line of lines) {
    if (!rowLinePattern.test(line)) continue;
    const cells = line.split("|");
    const statusIndex = cells.length - 2;
    if (statusIndex < 1) continue;
    const parsed = parseStatusCell(cells[statusIndex] ?? "");
    if (!parsed) continue;
    totalRows++;
    byStatus[parsed.status] = (byStatus[parsed.status] ?? 0) + 1;
    if (isTerminalStatus(parsed.status)) terminalRows++;
  }
  return { totalRows, terminalRows, byStatus };
}
