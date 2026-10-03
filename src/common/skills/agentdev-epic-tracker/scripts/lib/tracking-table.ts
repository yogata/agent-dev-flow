// Epic status tracking table parsing and per-row status replacement.
//
// Parses the 4-column status tracking tables written by case-open
// (new format: # / Issue / ステータス / 内容, legacy format: # / Issue /
// タイトル / ステータス) and provides idempotent, row-scoped replacement
// used by both the closing write path (case-close) and the coordination
// reflect write path (工程記録の取りまとめ).
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
  prNumber?: number;
  prUrl?: string;
}

/** Parse a status cell such as `pending`, `blocked`, or
 * `completed ([PR#100](https://...))`. Unknown values return null. */
export function parseStatusCell(cell: string): ParsedStatusCell | null {
  const trimmed = cell.trim();
  const simple = trimmed.match(/^(pending|completed|blocked|failed)$/);
  if (simple) return { status: simple[1] as PersistedStatus };
  const withPr = trimmed.match(/^completed \(\[PR#(\d+)\]\(([^)]+)\)\)$/);
  if (withPr) {
    return {
      status: "completed",
      prNumber: Number(withPr[1]),
      prUrl: withPr[2],
    };
  }
  return null;
}

interface LocatedRow {
  lineIndex: number;
  /** The row split by `|` (cells[0] and cells[length-1] are empty strings). */
  cells: string[];
  /** Index of the status cell in `cells`; -1 when the status cell is unknown. */
  statusIndex: number;
}

function rowPattern(childIssue: number): RegExp {
  return new RegExp(
    `^\\|\\s*\\d+(?:-\\d+)?\\s*\\|\\s*#${childIssue}(?:\\s[^|]*)?\\|`,
  );
}

/**
 * Resolve the status cell index of a row from the header of the table the
 * row belongs to (nearest header line above the row). The new 4-column
 * format (# / Issue / ステータス / 内容) keeps the status in column 3, the
 * legacy format (# / Issue / タイトル / ステータス) in the last column.
 * Rows without a readable header fall back to the last column (legacy).
 */
function statusIndexOf(
  lines: string[],
  rowLineIndex: number,
  cells: string[],
): number {
  const last = cells.length - 2;
  if (last < 1) return -1;
  let statusIndex = last;
  for (let i = rowLineIndex; i >= 0; i--) {
    if (/^\|\s*#\s*\|/.test(lines[i] ?? "")) {
      const headerCells = (lines[i] ?? "").split("|").map((c) => c.trim());
      const st = headerCells.indexOf("ステータス");
      if (st > 0) statusIndex = st;
      break;
    }
  }
  return parseStatusCell(cells[statusIndex] ?? "") ? statusIndex : -1;
}

function locateRow(body: string, childIssue: number): LocatedRow | null {
  const lines = body.split("\n");
  const p = rowPattern(childIssue);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const m = line.match(p);
    if (!m) continue;
    const cells = line.split("|");
    return { lineIndex: i, cells, statusIndex: statusIndexOf(lines, i, cells) };
  }
  return null;
}

/** Find the tracking-table row of a child issue (null when absent). */
export function findChildRow(
  body: string,
  childIssue: number,
): { lineIndex: number; childIssue: number; statusCell: string } | null {
  const row = locateRow(body, childIssue);
  if (!row || row.statusIndex < 0) return null;
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
  if (!row || row.statusIndex < 0) return null;
  return parseStatusCell(row.cells[row.statusIndex] ?? "");
}

/**
 * Replace the status cell of a child row with `statusText`.
 * Returns null when the row or its status cell is unknown. Only the status
 * cell of the matched row is rewritten; every other cell and line is
 * preserved verbatim (including the content column of the new format).
 */
export function replaceChildStatus(
  body: string,
  childIssue: number,
  statusText: string,
): string | null {
  const row = locateRow(body, childIssue);
  if (!row || row.statusIndex < 0) return null;
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

/** Count persisted statuses across all tracking-table child rows. */
export function countChildStatuses(body: string): ChildTerminalCounts {
  const lines = body.split("\n");
  const rowLinePattern =
    /^\|\s*\d+(?:-\d+)?\s*\|\s*#\d+(?:\s[^|]*)?\|/;
  const byStatus: Record<string, number> = {};
  let totalRows = 0;
  let terminalRows = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!rowLinePattern.test(line)) continue;
    const cells = line.split("|");
    const statusIndex = statusIndexOf(lines, i, cells);
    if (statusIndex < 0) continue;
    const parsed = parseStatusCell(cells[statusIndex] ?? "");
    if (!parsed) continue;
    totalRows++;
    byStatus[parsed.status] = (byStatus[parsed.status] ?? 0) + 1;
    if (isTerminalStatus(parsed.status)) terminalRows++;
  }
  return { totalRows, terminalRows, byStatus };
}
