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
  beforeStatus: string;
  statusCell: string;
  afterStatus: string;
}

function rowPattern(childIssue: number): RegExp {
  return new RegExp(
    `^(\\|\\s*\\d+(?:-\\d+)?\\s*\\|\\s*#${childIssue}(?:\\s[^|]*)?\\|)(.*)(\\|)\\s*$`,
  );
}

function locateRow(body: string, childIssue: number): LocatedRow | null {
  const lines = body.split("\n");
  const p = rowPattern(childIssue);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(p);
    if (m) {
      return {
        lineIndex: i,
        beforeStatus: m[1],
        statusCell: m[2],
        afterStatus: m[3],
      };
    }
  }
  return null;
}

/** Find the tracking-table row of a child issue (null when absent). */
export function findChildRow(
  body: string,
  childIssue: number,
): { lineIndex: number; childIssue: number; statusCell: string } | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  return {
    lineIndex: row.lineIndex,
    childIssue,
    statusCell: row.statusCell,
  };
}

function statusFromCell(statusCell: string): ParsedStatusCell | null {
  const cells = statusCell
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  // The status value is the last table cell of the row (new format has no
  // title column; legacy format has one before it).
  for (let i = cells.length - 1; i >= 0; i--) {
    const parsed = parseStatusCell(cells[i]);
    if (parsed) return parsed;
  }
  return null;
}

/** Read the persisted status of a child row (null when row/value unknown). */
export function readChildStatus(
  body: string,
  childIssue: number,
): ParsedStatusCell | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  return statusFromCell(row.statusCell);
}

/**
 * Replace the status cell of a child row with `statusText`.
 * Returns null when the row does not exist. Only the status cell of the
 * matched row is rewritten; every other line is preserved verbatim.
 */
export function replaceChildStatus(
  body: string,
  childIssue: number,
  statusText: string,
): string | null {
  const row = locateRow(body, childIssue);
  if (!row) return null;
  const lines = body.split("\n");
  lines[row.lineIndex] =
    `${row.beforeStatus} ${statusText} ${row.afterStatus}`;
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
  const linePattern =
    /^\|\s*\d+(?:-\d+)?\s*\|\s*#\d+(?:\s[^|]*)?\|(.*)\|\s*$/;
  const byStatus: Record<string, number> = {};
  let totalRows = 0;
  let terminalRows = 0;
  for (const line of lines) {
    const m = line.match(linePattern);
    if (!m) continue;
    const parsed = statusFromCell(m[1]);
    if (!parsed) continue;
    totalRows++;
    byStatus[parsed.status] = (byStatus[parsed.status] ?? 0) + 1;
    if (isTerminalStatus(parsed.status)) terminalRows++;
  }
  return { totalRows, terminalRows, byStatus };
}
