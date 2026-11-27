import {
  DEFAULT_MAX_ACTIVE_ISSUE_TASKS,
  planSlotAdmissions,
  type SlotQueueInput,
} from "./slot_queue.ts";
import { canDispatchNewExecution, type ChildExecutionRecord } from "./wave-gate.ts";

export const START_INTERVAL_MS = 10_000;

export interface Preparation {
  id: string;
  issue: string;
  definitionConfirmed: boolean;
  contractReflectionConfirmed: boolean;
  independentOfUnmergedChanges: boolean;
  baseSha: string;
  writePaths: readonly string[];
  readPaths: readonly string[];
  tests: readonly string[];
}

export interface RunningTask {
  kind: "case-run" | "case-close" | "preparation";
  id: string;
  issue: string;
  writePaths?: readonly string[];
  readPaths?: readonly string[];
  coveredIssues?: readonly string[];
}

export interface DispatchSnapshot {
  nowMs: number;
  lastStartMs: number | null;
  observationComplete: boolean;
  baseSha: string;
  /** A closing predecessor and tasks of uncertain liveness are included until confirmed stopped. */
  active: readonly RunningTask[];
  records: readonly ChildExecutionRecord[];
  formal: readonly (SlotQueueInput["candidates"][number] & {
    contractReflectionConfirmed: boolean;
    writePaths?: readonly string[];
    readPaths?: readonly string[];
  })[];
  closing?: RunningTask & { kind: "case-close" };
  preparations: readonly Preparation[];
  attemptedPreparations: readonly string[];
  protectedPaths: readonly string[];
  dependentMergeInFlight?: string | null;
}

export type NextDispatch =
  | { kind: "case-run"; issue: string }
  | { kind: "case-close"; closing: RunningTask }
  | { kind: "preparation"; preparation: Preparation }
  | { kind: "wait"; reason: string; retryAtMs?: number };

const shared = [
  ".git", ".github", ".agentdev/project", ".agentdev/backlog", "docs", "traceability",
  "README.md", "README-INSTALL.md", "AGENTS.md", "package.json", "bun.lock",
];

function validPath(path: string): boolean {
  return typeof path === "string" && path.length > 0 && !/[\\:*?\[\]\x00-\x1f]/.test(path) &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== ".." &&
      !/[. ]$/.test(part));
}

function overlap(a: string, b: string): boolean {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
}

function intersects(paths: readonly string[], others: readonly string[]): boolean {
  return paths.some((path) => others.some((other) => overlap(path, other)));
}

const sha = (value: string) => /^[0-9a-f]{40}$/i.test(value);

/** Select exactly one launch from an observed stage-3 snapshot. */
export function planNextDispatch(input: DispatchSnapshot): NextDispatch {
  if (input.observationComplete !== true || !Number.isSafeInteger(input.nowMs) ||
      (input.lastStartMs !== null && !Number.isSafeInteger(input.lastStartMs))) {
    return { kind: "wait", reason: "observation-incomplete" };
  }
  if (input.active.length >= DEFAULT_MAX_ACTIVE_ISSUE_TASKS) {
    return { kind: "wait", reason: "no-active-slot" };
  }
  if (input.lastStartMs !== null && input.nowMs < input.lastStartMs + START_INTERVAL_MS) {
    return { kind: "wait", reason: "start-interval", retryAtMs: input.lastStartMs + START_INTERVAL_MS };
  }
  const activePreparations = input.active.filter((task) => task.kind === "preparation");
  const activeClosing = input.active.filter((task) => task.kind === "case-close");
  const closingIssues = new Set(activeClosing.flatMap((task) => [task.issue, ...(task.coveredIssues ?? [])]));
  const records = new Map(input.records.map((record) => [record.issue, record]));
  for (const issue of closingIssues) records.delete(issue);
  const adjacentToPreparation = (task: Pick<RunningTask, "writePaths" | "readPaths">) =>
    activePreparations.length > 0 &&
    (!task.writePaths?.every(validPath) || !task.readPaths?.every(validPath) ||
      activePreparations.some((active) => !active.writePaths || !active.readPaths ||
        intersects(task.writePaths!, [...active.writePaths, ...active.readPaths]) ||
        intersects(task.readPaths!, active.writePaths)));
  if (input.closing && !activeClosing.length && !adjacentToPreparation(input.closing)) {
    return { kind: "case-close", closing: input.closing };
  }
  const formal = input.formal.filter((candidate) =>
    !closingIssues.has(candidate.issue) && canDispatchNewExecution(candidate).allowed);
  const formalPlan = planSlotAdmissions({
    records,
    candidates: formal,
    activeIssues: input.active.filter((task) => task.kind === "case-run").map((task) => task.issue),
    dependentMergeInFlight: input.dependentMergeInFlight,
    maxActive: DEFAULT_MAX_ACTIVE_ISSUE_TASKS,
  });
  for (const issue of formalPlan.admissions) {
    if (!activePreparations.some((task) => task.issue === issue) &&
        !adjacentToPreparation(formal.find((candidate) => candidate.issue === issue)!)) {
      return { kind: "case-run", issue };
    }
  }
  if (formalPlan.admissions.length || input.closing || !activeClosing.length ||
      input.active.some((task) => !task.writePaths?.every(validPath) || !task.readPaths?.every(validPath)) ||
      !input.protectedPaths.every(validPath)) {
    return { kind: "wait", reason: "no-eligible-preparation" };
  }
  const writes = input.active.flatMap((task) => task.writePaths ?? []);
  const reads = input.active.flatMap((task) => task.readPaths ?? []);
  const protectedPaths = [...shared, ...input.protectedPaths];
  const waitingForDependency = new Set(formalPlan.notAdmitted
    .filter(({ reason }) => reason === "dependency-not-satisfied")
    .map(({ issue }) => issue));
  for (const preparation of input.preparations) {
    if (!preparation.id || !waitingForDependency.has(preparation.issue) ||
        input.attemptedPreparations.includes(preparation.id) ||
        input.active.some((task) => task.id === preparation.id) ||
        preparation.definitionConfirmed !== true ||
        !canDispatchNewExecution(preparation).allowed ||
        preparation.independentOfUnmergedChanges !== true ||
        !sha(preparation.baseSha) || preparation.baseSha !== input.baseSha ||
        !preparation.writePaths.length || !preparation.tests.length ||
        ![...preparation.writePaths, ...preparation.readPaths].every(validPath) ||
        preparation.tests.some((test) => typeof test !== "string" || !test.trim()) ||
        intersects(preparation.writePaths, protectedPaths) ||
        intersects([...preparation.writePaths, ...preparation.readPaths], writes) ||
        intersects(preparation.writePaths, reads)) {
      continue;
    }
    return { kind: "preparation", preparation };
  }
  return { kind: "wait", reason: "no-eligible-preparation" };
}

export interface PreparationReceipt {
  verifiedBaseSha: string;
  commitSha: string;
  changedPaths: readonly string[];
  passedTests: readonly string[];
  officialBaseSha: string;
  /** Derived from Git when the official base advanced. Undefined means unobserved. */
  baseChangedPaths?: readonly string[];
  protectedPaths: readonly string[];
}

/** Check an isolated receipt before the official worker tries to apply it. */
export function verifyPreparation(preparation: Preparation, receipt: PreparationReceipt): boolean {
  if (!sha(receipt.commitSha) || !sha(receipt.officialBaseSha) ||
      !sha(preparation.baseSha) || receipt.verifiedBaseSha !== preparation.baseSha ||
      !preparation.tests.length || !receipt.changedPaths.length ||
      ![...preparation.writePaths, ...preparation.readPaths,
        ...receipt.changedPaths, ...receipt.protectedPaths].every(validPath) ||
      !preparation.tests.every((test) => receipt.passedTests.includes(test))) return false;
  if (receipt.changedPaths.some((path) => !preparation.writePaths.some((scope) =>
    path.toLowerCase() === scope.toLowerCase() || path.toLowerCase().startsWith(scope.toLowerCase() + "/"))) ||
      intersects(receipt.changedPaths, [...shared, ...receipt.protectedPaths])) return false;
  return receipt.officialBaseSha === preparation.baseSha ||
    (receipt.baseChangedPaths !== undefined && receipt.baseChangedPaths.every(validPath) &&
      !intersects([...preparation.readPaths, ...preparation.writePaths], receipt.baseChangedPaths));
}

if (import.meta.main) {
  try {
    const input = JSON.parse(await Bun.stdin.text());
    if (Bun.argv[2] === "plan") console.log(JSON.stringify(planNextDispatch(input)));
    else if (Bun.argv[2] === "verify") console.log(JSON.stringify({
      reusable: verifyPreparation(input.preparation, input.receipt),
    }));
    else throw new Error("expected plan or verify");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
