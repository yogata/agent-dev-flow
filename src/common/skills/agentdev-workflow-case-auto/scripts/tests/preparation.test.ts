import { expect, test } from "bun:test";
import {
  planNextDispatch, verifyPreparation,
  type DispatchSnapshot, type Preparation, type PreparationReceipt, type RunningTask,
} from "../src/preparation.ts";

const base = "a".repeat(40);
const next = "b".repeat(40);
const preparation: Preparation = {
  id: "2/codex", issue: "2", baseSha: base, definitionConfirmed: true,
  independentOfUnmergedChanges: true, contractReflectionConfirmed: true,
  writePaths: ["src/codex"], readPaths: ["src/shared/interface.ts"], tests: ["codex-tests"],
};
const closing: RunningTask = {
  kind: "case-close", id: "close", issue: "epic", coveredIssues: ["1"],
  writePaths: ["docs/result.md"], readPaths: ["src/predecessor"],
};
const state: DispatchSnapshot = {
  nowMs: 20_000, lastStartMs: 10_000, observationComplete: true, baseSha: base,
  active: [closing], preparations: [preparation], attemptedPreparations: [],
  formal: [{ issue: "2", dependsOn: ["1"], contractReflectionConfirmed: true,
    writePaths: ["src/codex"], readPaths: [] }],
  records: [{ issue: "1", status: "outcome-determined", outcome: "pass",
    ownRequiredConditionsMet: true, acceptance: { closeAllowed: true } }],
  protectedPaths: ["src/distribution/files.json"],
};

test("preparation can start while covered case-close holds the formal dependency", () => {
  expect(planNextDispatch(state)).toEqual({ kind: "preparation", preparation });
  expect(planNextDispatch({ ...state, active: [] })).toEqual({ kind: "case-run", issue: "2" });
  expect(planNextDispatch({ ...state, records: [], active: [] }).kind).toBe("wait");
});

test("a fourth worker may fill the fifth slot including case-close; a sixth waits", () => {
  const active: RunningTask[] = [closing, ...[3, 4, 5, 6].map((id): RunningTask => ({
    kind: "case-run", id: String(id), issue: String(id), writePaths: [], readPaths: [],
  }))];
  expect(planNextDispatch({ ...state, active: active.slice(0, 4) }).kind).toBe("preparation");
  expect(planNextDispatch({ ...state, active })).toEqual({ kind: "wait", reason: "no-active-slot" });
  expect(planNextDispatch({ ...state, observationComplete: false }).kind).toBe("wait");
});

test("starts one task at an interval of at least ten seconds and prioritizes formal work", () => {
  expect(planNextDispatch({ ...state, nowMs: 19_999 })).toEqual({
    kind: "wait", reason: "start-interval", retryAtMs: 20_000,
  });
  const ready = { issue: "3", dependsOn: [], contractReflectionConfirmed: true };
  expect(planNextDispatch({ ...state, formal: [...state.formal, ready] }))
    .toEqual({ kind: "case-run", issue: "3" });
  expect(planNextDispatch({ ...state, active: [], closing: { ...closing, kind: "case-close" } }).kind)
    .toBe("case-close");
});

test("rejects shared paths, Windows aliases, unfinished interfaces, and replayed preparations", () => {
  for (const invalid of [
    { ...preparation, writePaths: ["Docs/result.md"] },
    { ...preparation, writePaths: ["src/distribution"] },
    { ...preparation, writePaths: ["src/codex/../antigravity"] },
    { ...preparation, readPaths: ["docs/result.md"] },
    { ...preparation, writePaths: ["src/predecessor/impl.ts"] },
    { ...preparation, independentOfUnmergedChanges: false },
    { ...preparation, definitionConfirmed: false },
    { ...preparation, baseSha: next },
  ]) expect(planNextDispatch({ ...state, preparations: [invalid] }).kind).toBe("wait");
  expect(planNextDispatch({ ...state, attemptedPreparations: [preparation.id] }).kind).toBe("wait");
  expect(planNextDispatch({ ...state, active: [{ ...closing, writePaths: undefined }] }).kind).toBe("wait");
});

test("recovery retains running preparation and never replaces the formal dependency gate", () => {
  const active: RunningTask[] = [{ kind: "preparation", id: preparation.id, issue: "2",
    writePaths: preparation.writePaths, readPaths: preparation.readPaths }];
  expect(planNextDispatch({ ...state, active }).kind).toBe("wait");
  expect(planNextDispatch({ ...state, active: [], attemptedPreparations: [preparation.id] }))
    .toEqual({ kind: "case-run", issue: "2" });
});

test("adopts only scoped, verified receipts and rechecks a moved base", () => {
  const receipt: PreparationReceipt = {
    verifiedBaseSha: base, commitSha: "c".repeat(40), changedPaths: ["src/codex/index.ts"],
    passedTests: ["codex-tests"], officialBaseSha: base, protectedPaths: [],
  };
  expect(verifyPreparation(preparation, receipt)).toBe(true);
  expect(verifyPreparation(preparation, { ...receipt, changedPaths: ["src/codex-other/index.ts"] })).toBe(false);
  expect(verifyPreparation(preparation, { ...receipt, passedTests: [] })).toBe(false);
  expect(verifyPreparation(preparation, { ...receipt, officialBaseSha: next })).toBe(false);
  expect(verifyPreparation(preparation, { ...receipt, officialBaseSha: next,
    baseChangedPaths: ["src/shared/interface.ts"] })).toBe(false);
  expect(verifyPreparation(preparation, { ...receipt, officialBaseSha: next,
    baseChangedPaths: ["src/predecessor/index.ts"] })).toBe(true);
});
