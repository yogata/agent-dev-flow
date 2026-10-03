// Coordination reflect engine: record-trigger based Epic reflection,
// per-Epic exclusive serialization, and lost-update prevention.
//
// The coordination write path (工程記録の取りまとめ) reflects child status
// per record trigger (hold / decision_change / completion) into the Epic
// Issue body, serialized with the closing write path (case-close) under the
// per-Epic single-writer contract. 廃止記録契機（着手 start / 引き渡し handoff /
// 再開 resume）の反映経路は削除済みであり、再試行は継続条件成立と旧実行終了
// 確認のうえ resetChildToPending で pending へ戻す（completed からの戻しは禁止）。
//
// Record trigger identifiers are the single vocabulary shared with the
// coordination comment path (record-comments.ts in agentdev-workflow-case-run
// and the issue_comment_record_* templates). parseReflectLine rejects values
// outside RECORD_TRIGGERS so that a vocabulary mismatch can never silently
// drop an existing entry.
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
//   <!-- reflect child=42 trigger=hold status=blocked reason="waiting for CI" next="retry" -->
//   <!-- reflect child=43 trigger=completion status=completed basis="QG-4 合格" -->
//   <!-- agentdev:epic-reflect end -->
//
//   <!-- agentdev:epic-overall begin -->
//   <!-- overall completed=false children=5/6 criteria=1/2 unmetChildren="#46" unmetCriteria="全Wave完了" basis="..." -->
//   <!-- agentdev:epic-overall end -->
//
// Pure logic only: no fs, no network, no wall clock.

import {
  type PersistedStatus,
  isTerminalStatus,
  readChildStatus,
  replaceChildStatus,
} from "./tracking-table.ts";

// ---------------------------------------------------------------------------
// Record triggers (engineering-record vocabulary, shared with record-comments.ts)
// ---------------------------------------------------------------------------

export const RECORD_TRIGGERS = [
  "hold",
  "decision_change",
  "completion",
] as const;

export type RecordTrigger = (typeof RECORD_TRIGGERS)[number];

export interface ReflectEntry {
  childIssue: number;
  trigger: RecordTrigger;
  /** Epic 実行構成表の子状態（pending / completed / blocked / failed）。 */
  status: PersistedStatus;
  /** 停止理由・判断変更の撤回対象等（trigger = hold / decision_change）。 */
  reason?: string;
  nextAction?: string;
  /** 検証証拠・完了確定の根拠（trigger = completion）。 */
  basis?: string;
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
    `status=${entry.status}`,
  ];
  if (entry.reason) fields.push(`reason=${quoteValue(entry.reason)}`);
  if (entry.nextAction) fields.push(`next=${quoteValue(entry.nextAction)}`);
  if (entry.basis) fields.push(`basis=${quoteValue(entry.basis)}`);
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
  const status = fields.get("status");
  if (!Number.isInteger(childIssue) || childIssue <= 0) return null;
  if (!trigger || !(RECORD_TRIGGERS as readonly string[]).includes(trigger)) {
    return null;
  }
  if (!status || !(["pending", "completed", "blocked", "failed"] as readonly string[]).includes(status)) {
    return null;
  }
  return {
    childIssue,
    trigger: trigger as RecordTrigger,
    status: status as PersistedStatus,
    reason: fields.get("reason"),
    nextAction: fields.get("next"),
    basis: fields.get("basis"),
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
  /** Non-empty when the existing block contains reflect lines whose trigger or
   * status is outside the vocabulary. The body is returned unchanged and the
   * caller must not write it (the dropped lines would be a lost update). */
  unparseableLines?: string[];
}

function collectUnparseableReflectLines(latestBody: string): string[] {
  const lines = latestBody.split("\n");
  const begin = lines.indexOf(REFLECT_BLOCK_BEGIN);
  const end = lines.indexOf(REFLECT_BLOCK_END);
  const unparseable: string[] = [];
  if (begin === -1 || end === -1 || end < begin) return unparseable;
  for (let i = begin + 1; i < end; i++) {
    const line = lines[i] ?? "";
    if (line.trim().startsWith("<!-- reflect ") && parseReflectLine(line) === null) {
      unparseable.push(line);
    }
  }
  return unparseable;
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
  const unparseableLines = collectUnparseableReflectLines(latestBody);
  if (unparseableLines.length > 0) {
    return { body: latestBody, applied: false, unparseableLines };
  }
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
 * 状態列は子状態4値のみ（PR 番号・URL は付記しない）。
 */
export interface ClosingApplyResult {
  body: string;
  applied: boolean;
  skipped: "already-terminal" | "row-missing" | null;
}

export function applyClosingStatus(
  latestBody: string,
  childIssue: number,
  status: PersistedStatus,
): ClosingApplyResult {
  const current = readChildStatus(latestBody, childIssue);
  if (!current) {
    return { body: latestBody, applied: false, skipped: "row-missing" };
  }
  if (isTerminalStatus(current.status)) {
    return { body: latestBody, applied: false, skipped: "already-terminal" };
  }
  const next = replaceChildStatus(latestBody, childIssue, status);
  if (next === null) {
    return { body: latestBody, applied: false, skipped: "row-missing" };
  }
  return { body: next, applied: true, skipped: null };
}

/**
 * 再試行 pending 戻し（blocked / failed は未完了）。
 * 継続条件の成立と旧実行の終了確認は呼び出し側の判断であり、本関数は
 * 決定的な状態書込みのみを行う。completed は終端であり pending へ戻さない。
 */
export interface ResetToPendingResult {
  body: string;
  applied: boolean;
  skipped: "row-missing" | "terminal-completed" | null;
}

export function resetChildToPending(
  latestBody: string,
  childIssue: number,
): ResetToPendingResult {
  const current = readChildStatus(latestBody, childIssue);
  if (!current) {
    return { body: latestBody, applied: false, skipped: "row-missing" };
  }
  if (current.status === "completed") {
    return { body: latestBody, applied: false, skipped: "terminal-completed" };
  }
  if (current.status === "pending") {
    return { body: latestBody, applied: true, skipped: null };
  }
  const next = replaceChildStatus(latestBody, childIssue, "pending");
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
  /** All child issues of the Epic (execution-structure table rows). */
  childIssues: number[];
  /** Latest status per child issue (from the execution-structure table). */
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
