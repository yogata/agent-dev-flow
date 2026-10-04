// Epic 反映エンジン: 実行構成表への子状態書込み、per-Epic exclusive
// serialization, and lost-update prevention.
//
// The coordination write path (工程記録の取りまとめ) reflects child status
// into the execution-structure table of the Epic Issue body, serialized with
// the closing write path (case-close) under the per-Epic single-writer
// contract. Epic 本文への書き込みは実行構成の状態反映と全体条件評価の更新に
// 限定される（hidden HTML comment block 等の第二の恒常的状態台帳を持たない）。
// 停止理由・再開条件・検証証拠は子 Issue の記録コメントが正であり、Epic 本文へは
// 複製しない。再試行は継続条件成立と旧実行終了確認のうえ resetChildToPending で
// pending へ戻す（completed からの戻しは禁止）。
//
// Record trigger identifiers are the single vocabulary shared with the
// coordination comment path (record-comments.ts in agentdev-workflow-case-run
// and the issue_comment_record_* templates).
//
// Lost-update prevention contract: every write goes through
// latest-fetch -> merge -> update. The merge functions in this module never
// take a stale snapshot; callers must re-read the latest body inside the
// write gate and apply the merge to what was read (see createEpicWriteGate).
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
