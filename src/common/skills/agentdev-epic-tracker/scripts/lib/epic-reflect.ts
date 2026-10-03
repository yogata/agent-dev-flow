// Coordination reflect engine: record-trigger based Epic reflection,
// per-Epic exclusive serialization, and lost-update prevention.
//
// The coordination write path (工程記録の取りまとめ) reflects child progress
// per record trigger (start / handover / halt / resume / decision-change /
// completion) into the Epic Issue body, serialized with the closing write
// path (case-close) under the per-Epic single-writer contract.
//
// Lost-update prevention contract: every write goes through
// latest-fetch -> merge -> update. The merge functions in this module never
// take a stale snapshot; callers must re-read the latest body inside the
// write gate and apply the merge to what was read (see createEpicWriteGate).
//
// Machine-readable reflection blocks are plain HTML comments so they never
// alter the rendered Epic body:
//
//   <!-- agentdev:epic-reflect begin -->
//   <!-- reflect child=42 trigger=halt phase=case-run state=waiting reason="waiting for CI" next="retry" -->
//   <!-- reflect child=43 trigger=completion phase=case-run state=ended ended=completed pr=100 -->
//   <!-- agentdev:epic-reflect end -->
//
//   <!-- agentdev:epic-overall begin -->
//   <!-- overall completed=false children=5/6 criteria=1/2 unmetChildren="#46" unmetCriteria="全Wave完了" basis="..." -->
//   <!-- agentdev:epic-overall end -->
//
// Pure logic only: no fs, no network, no wall clock.

import {
  type ParsedStatusCell,
  type PersistedStatus,
  isTerminalStatus,
  readChildStatus,
  replaceChildStatus,
} from "./tracking-table.ts";

// ---------------------------------------------------------------------------
// Record triggers and progress state (engineering-record vocabulary)
// ---------------------------------------------------------------------------

export const RECORD_TRIGGERS = [
  "start",
  "handover",
  "halt",
  "resume",
  "decision-change",
  "completion",
] as const;

export type RecordTrigger = (typeof RECORD_TRIGGERS)[number];

export const PROGRESS_STATES = [
  "not-started",
  "running",
  "waiting",
  "ended",
] as const;

export type ProgressState = (typeof PROGRESS_STATES)[number];

export type EndedKind = "completed" | "aborted";

export interface ReflectEntry {
  childIssue: number;
  trigger: RecordTrigger;
  /** 工程 identifier (e.g. "case-run"). */
  phase: string;
  state: ProgressState;
  /** Required when state is "ended". */
  endedKind?: EndedKind;
  /** Required when state is "waiting" (halt). */
  waitingReason?: string;
  nextAction?: string;
  owner?: string;
  latestRecordRef?: string;
  /** Completion judgment basis (record trigger = completion). */
  resultBasis?: string;
  prNumber?: number;
  prUrl?: string;
}

// ---------------------------------------------------------------------------
// Serialization of the reflection block
// ---------------------------------------------------------------------------

function quoteValue(value: string): string {
  return /\s/.test(value) ? `"${value.replace(/"/g, "'")}"` : value;
}

function renderEntryFields(entry: ReflectEntry): string {
  const fields: string[] = [
    `child=${entry.childIssue}`,
    `trigger=${entry.trigger}`,
    `phase=${quoteValue(entry.phase)}`,
    `state=${entry.state}`,
  ];
  if (entry.endedKind) fields.push(`ended=${entry.endedKind}`);
  if (entry.waitingReason) fields.push(`reason=${quoteValue(entry.waitingReason)}`);
  if (entry.nextAction) fields.push(`next=${quoteValue(entry.nextAction)}`);
  if (entry.owner) fields.push(`owner=${quoteValue(entry.owner)}`);
  if (entry.latestRecordRef) fields.push(`ref=${quoteValue(entry.latestRecordRef)}`);
  if (entry.resultBasis) fields.push(`basis=${quoteValue(entry.resultBasis)}`);
  if (entry.prNumber !== undefined) fields.push(`pr=${entry.prNumber}`);
  if (entry.prUrl) fields.push(`prUrl=${quoteValue(entry.prUrl)}`);
  return fields.join(" ");
}

export function renderReflectLine(entry: ReflectEntry): string {
  return `<!-- reflect ${renderEntryFields(entry)} -->`;
}

export const REFLECT_BLOCK_BEGIN = "<!-- agentdev:epic-reflect begin -->";
export const REFLECT_BLOCK_END = "<!-- agentdev:epic-reflect end -->";

export function parseReflectLine(line: string): ReflectEntry | null {
  const m = line.match(/^<!--\s*reflect\s+(.+?)\s*-->$/);
  if (!m) return null;
  const fields = new Map<string, string>();
  const tokenPattern = /(\w+)=("(?:[^"]*)"|\S+)/g;
  let t: RegExpExecArray | null;
  while ((t = tokenPattern.exec(m[1])) !== null) {
    fields.set(t[1], t[2].replace(/^"(.*)"$/, "$1"));
  }
  const childIssue = Number(fields.get("child"));
  const trigger = fields.get("trigger");
  const state = fields.get("state");
  if (!Number.isInteger(childIssue) || childIssue <= 0) return null;
  if (!trigger || !(RECORD_TRIGGERS as readonly string[]).includes(trigger)) {
    return null;
  }
  if (!state || !(PROGRESS_STATES as readonly string[]).includes(state)) {
    return null;
  }
  return {
    childIssue,
    trigger: trigger as RecordTrigger,
    phase: fields.get("phase") ?? "",
    state: state as ProgressState,
    endedKind: fields.get("ended") as EndedKind | undefined,
    waitingReason: fields.get("reason"),
    nextAction: fields.get("next"),
    owner: fields.get("owner"),
    latestRecordRef: fields.get("ref"),
    resultBasis: fields.get("basis"),
    prNumber: fields.has("pr") ? Number(fields.get("pr")) : undefined,
    prUrl: fields.get("prUrl"),
  };
}

export function parseReflectBlock(body: string): ReflectEntry[] {
  const entries: ReflectEntry[] = [];
  const lines = body.split("\n");
  const begin = lines.indexOf(REFLECT_BLOCK_BEGIN);
  const end = lines.indexOf(REFLECT_BLOCK_END);
  if (begin === -1 || end === -1 || end < begin) return entries;
  for (let i = begin + 1; i < end; i++) {
    const entry = parseReflectLine(lines[i]);
    if (entry) entries.push(entry);
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Merge: latest body + one child report -> next body (order independent)
// ---------------------------------------------------------------------------

export interface ReflectApplyResult {
  body: string;
  applied: boolean;
}

/**
 * Merge one coordination report into the latest Epic body.
 *
 * Upgrades the child's own entry only; entries of other children are kept
 * verbatim (completion order must not erase earlier updates). Entries are
 * normalized to child-issue ascending order, so any completion order
 * produces the same final block.
 */
export function applyReflectEntry(
  latestBody: string,
  entry: ReflectEntry,
): ReflectApplyResult {
  const lines = latestBody.split("\n");
  const existing = parseReflectBlock(latestBody);
  const kept = existing.filter((e) => e.childIssue !== entry.childIssue);
  kept.push(entry);
  kept.sort((a, b) => a.childIssue - b.childIssue);
  const blockLines = [
    REFLECT_BLOCK_BEGIN,
    ...kept.map(renderReflectLine),
    REFLECT_BLOCK_END,
  ];
  const begin = lines.indexOf(REFLECT_BLOCK_BEGIN);
  const end = lines.indexOf(REFLECT_BLOCK_END);
  if (begin !== -1 && end !== -1 && end > begin) {
    lines.splice(begin, end - begin + 1, ...blockLines);
  } else {
    if (latestBody.length > 0 && !latestBody.endsWith("\n")) {
      lines.push("");
    }
    lines.push(...blockLines);
  }
  return { body: lines.join("\n"), applied: true };
}

/**
 * Closing write path: set the persisted terminal status of a child row.
 * Idempotent: a row already in a terminal state is never overwritten.
 */
export interface ClosingApplyResult {
  body: string;
  applied: boolean;
  skipped: "already-terminal" | "row-missing" | null;
}

export function applyClosingStatus(
  latestBody: string,
  childIssue: number,
  target: ParsedStatusCell,
): ClosingApplyResult {
  const current = readChildStatus(latestBody, childIssue);
  if (!current) {
    return { body: latestBody, applied: false, skipped: "row-missing" };
  }
  if (isTerminalStatus(current.status)) {
    return { body: latestBody, applied: false, skipped: "already-terminal" };
  }
  let cell: string;
  if (target.status === "completed" && target.prNumber !== undefined) {
    cell = `completed ([PR#${target.prNumber}](${target.prUrl ?? ""}))`;
  } else {
    cell = target.status;
  }
  const next = replaceChildStatus(latestBody, childIssue, cell);
  if (next === null) {
    return { body: latestBody, applied: false, skipped: "row-missing" };
  }
  return { body: next, applied: true, skipped: null };
}

/**
 * Same merge discipline for a persisted status value, shared by the
 * coordination completion path when the closing write has not landed yet.
 * Terminal overwrite rule: terminal beats non-terminal, and an existing
 * terminal value is never downgraded (completion order independent).
 */
export function mergeChildStatus(
  existing: PersistedStatus,
  incoming: PersistedStatus,
): PersistedStatus {
  if (isTerminalStatus(existing)) return existing;
  if (isTerminalStatus(incoming)) return incoming;
  return incoming;
}

// ---------------------------------------------------------------------------
// Overall completion evaluation (distinct from child completion)
// ---------------------------------------------------------------------------

export interface OverallCriterionInput {
  criterion: string;
  met: boolean;
  basis: string;
}

export interface OverallEvaluationInput {
  /** All child issues of the Epic (tracking-table rows). */
  childIssues: number[];
  /** Latest status per child issue (from the tracking table). */
  childStatuses: Record<number, PersistedStatus | undefined>;
  /** Overall completion criteria with their latest evaluation. */
  evaluatedCriteria: OverallCriterionInput[];
}

export interface OverallEvaluation {
  totalChildren: number;
  terminalChildren: number;
  allChildrenTerminal: boolean;
  criteriaTotal: number;
  criteriaMet: number;
  allCriteriaMet: boolean;
  /** True only when ALL children are terminal AND all criteria are met. */
  overallCompleted: boolean;
  unmetChildren: number[];
  unmetCriteria: string[];
  /** Human-readable evaluation basis composed from per-item bases. */
  basis: string;
}

export function evaluateOverallCompletion(
  input: OverallEvaluationInput,
): OverallEvaluation {
  const unmetChildren = input.childIssues.filter((c) => {
    const status = input.childStatuses[c];
    return !status || !isTerminalStatus(status);
  });
  const terminalChildren = input.childIssues.length - unmetChildren.length;
  const allChildrenTerminal = unmetChildren.length === 0;
  const criteriaTotal = input.evaluatedCriteria.length;
  const unmetCriteria = input.evaluatedCriteria
    .filter((c) => !c.met)
    .map((c) => c.criterion);
  const allCriteriaMet = criteriaTotal > 0 && unmetCriteria.length === 0;
  const overallCompleted = allChildrenTerminal && allCriteriaMet;
  const parts: string[] = [
    `children: ${terminalChildren}/${input.childIssues.length} terminal`,
    `criteria: ${criteriaTotal - unmetCriteria.length}/${criteriaTotal} met`,
  ];
  if (unmetChildren.length > 0) {
    parts.push(`unmet children: ${unmetChildren.map((c) => `#${c}`).join(", ")}`);
  }
  if (unmetCriteria.length > 0) {
    parts.push(`unmet criteria: ${unmetCriteria.join(", ")}`);
  }
  const metBases = input.evaluatedCriteria
    .filter((c) => c.basis.length > 0)
    .map((c) => `${c.criterion}: ${c.basis}`);
  if (metBases.length > 0) parts.push(metBases.join("; "));
  parts.push(`overallCompleted=${overallCompleted}`);
  return {
    totalChildren: input.childIssues.length,
    terminalChildren,
    allChildrenTerminal,
    criteriaTotal,
    criteriaMet: criteriaTotal - unmetCriteria.length,
    allCriteriaMet,
    overallCompleted,
    unmetChildren,
    unmetCriteria,
    basis: parts.join(" | "),
  };
}

export const OVERALL_BLOCK_BEGIN = "<!-- agentdev:epic-overall begin -->";
export const OVERALL_BLOCK_END = "<!-- agentdev:epic-overall end -->";

export function renderOverallLine(e: OverallEvaluation): string {
  const fields = [
    `completed=${e.overallCompleted}`,
    `children=${e.terminalChildren}/${e.totalChildren}`,
    `criteria=${e.criteriaMet}/${e.criteriaTotal}`,
    `unmetChildren=${e.unmetChildren.length > 0 ? e.unmetChildren.map((c) => `#${c}`).join(",") : "-"}`,
    `unmetCriteria=${e.unmetCriteria.length > 0 ? e.unmetCriteria.join(",") : "-"}`,
    `basis=${quoteValue(e.basis)}`,
  ];
  return `<!-- overall ${fields.join(" ")} -->`;
}

/** Record (or replace) the latest overall completion evaluation in the body. */
export function upsertOverallEvaluation(
  latestBody: string,
  evaluation: OverallEvaluation,
): string {
  const lines = latestBody.split("\n");
  const blockLines = [
    OVERALL_BLOCK_BEGIN,
    renderOverallLine(evaluation),
    OVERALL_BLOCK_END,
  ];
  const begin = lines.indexOf(OVERALL_BLOCK_BEGIN);
  const end = lines.indexOf(OVERALL_BLOCK_END);
  if (begin !== -1 && end !== -1 && end > begin) {
    lines.splice(begin, end - begin + 1, ...blockLines);
  } else {
    if (latestBody.length > 0 && !latestBody.endsWith("\n")) {
      lines.push("");
    }
    lines.push(...blockLines);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Per-Epic single-writer serialization (shared by closing and coordination)
// ---------------------------------------------------------------------------

export interface EpicWriteGate {
  /**
   * Run `task` exclusively per Epic. The closing write path (case-close) and
   * the coordination reflect path share the same gate instance, so writes
   * against one Epic Issue body are locally serialized; independent Epics
   * run in parallel. Inside the task, callers must re-read the latest body
   * and apply the merge functions to what they read.
   */
  runExclusive<T>(epicKey: string | number, task: () => Promise<T> | T): Promise<T>;
  /** Number of queued or running tasks for the Epic (0 when idle). */
  pending(epicKey: string | number): number;
}

export function createEpicWriteGate(): EpicWriteGate {
  const chains = new Map<string, Promise<unknown>>();
  const counts = new Map<string, number>();
  return {
    runExclusive<T>(epicKey: string | number, task: () => Promise<T> | T): Promise<T> {
      const key = String(epicKey);
      const prev = chains.get(key) ?? Promise.resolve();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      const next = prev.then(task, task);
      // keep the chain alive regardless of task outcome; do not leak rejections
      chains.set(
        key,
        next.then(
          () => undefined,
          () => undefined,
        ),
      );
      void next.finally(() => {
        const n = (counts.get(key) ?? 1) - 1;
        if (n <= 0) {
          counts.delete(key);
          chains.delete(key);
        } else {
          counts.set(key, n);
        }
      });
      return next;
    },
    pending(epicKey: string | number): number {
      return counts.get(String(epicKey)) ?? 0;
    },
  };
}
