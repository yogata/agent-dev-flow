// Decisive regression verification for REQ-034 (Wave composition purity and
// single ownership of the execution parallelism cap, DEC-041):
//   - TS-001 composition invariance: the Wave assignment derived from the
//     semantic dependency DAG does not change with runtime caps (3/5/10).
//   - TS-002 Wave representation has no cap: 6+ same-Wave child issues are
//     represented/persisted/resumed consistently; runtime batches are not
//     persisted as Wave splits.
//   - TS-003 shared cap: stage 3 active Issue tasks across Epics/Waves/
//     Standard Issues never exceed the shared cap and no nested path gains an
//     independent slot.
//   - TS-004 slot refill: a freed slot is refilled immediately across Epics
//     (mandatory cross-refill, no fixed batch).
//   - TS-005 Wave convergence vs dependency satisfaction are distinct gates.
//   - TS-006 resume: existing active tasks are counted, no double start, no
//     cap overflow, unknown-state tasks keep their slot, completed issues are
//     not re-run.
//   - TS-007 duplication detection is a conflict-risk signal only: same-file
//     independent issues stay in the same Wave, order-of-completion
//     dependencies become semantic (Wave split), undetectable sets are
//     reported and never treated as duplicate-free.
//
// The simulations are deterministic reference models (no randomness, no wall
// clock); the distribution-artifact probes pin the canonical wording of the
// case-run / case-auto / case-ready workflow skills.

// ADF-COVERS(verification): REQ-034-027, REQ-034-040, REQ-034-041, REQ-034-042, REQ-034-043, REQ-035-012, REQ-035-016, REQ-035-017, REQ-035-018, REQ-061-010, REQ-061-019, REQ-061-038

import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const CASE_RUN_SKILL_REL =
  "src/opencode/skills/agentdev-workflow-case-run/SKILL.md";
const CASE_RUN_DELEGATION_REL =
  "src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md";
const CASE_AUTO_SKILL_REL =
  "src/opencode/skills/agentdev-workflow-case-auto/SKILL.md";
const CASE_AUTO_ORCH_REL =
  "src/opencode/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md";
const CASE_READY_STRUCT_REL =
  "src/opencode/skills/agentdev-workflow-case-ready/references/execution-structure.md";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

// ---------------------------------------------------------------------------
// Deterministic reference model: Wave composition from the semantic DAG only.
// ---------------------------------------------------------------------------

type IssueId = string;
/** semantic dependency DAG: required deps only (execution-unit construction). */
type DepGraph = Record<IssueId, IssueId[]>;

/**
 * Deterministic Wave assignment = topological level of the semantic DAG.
 * Level 0 = issues with no unsatisfied required dep; assignment takes one
 * input: the DAG. No cap, file-overlap, or runtime signal is accepted.
 */
function computeWaves(nodes: IssueId[], deps: DepGraph): IssueId[][] {
  const done = new Set<IssueId>();
  const waves: IssueId[][] = [];
  const remaining = new Set(nodes);
  while (remaining.size > 0) {
    const level: IssueId[] = nodes.filter(
      (n) =>
        remaining.has(n) && (deps[n] ?? []).every((d) => done.has(d)),
    );
    if (level.length === 0) throw new Error("dependency cycle");
    for (const n of level) {
      remaining.delete(n);
      done.add(n);
    }
    waves.push(level);
  }
  return waves;
}

/**
 * Shared active-slot scheduler simulation. Deterministic: candidates are
 * started in list order whenever active < cap, events are processed in the
 * given order, each start takes `startInterval` logical ticks (the 10 s
 * startup spacing) and each run takes `duration` ticks from its start.
 */
function simulateSharedCap(
  candidates: Array<{ id: string; epic: string }>,
  events: Array<{ at: number; completed: string }>,
  cap: number,
  startInterval = 10,
  duration = 100,
) {
  let tick = 0;
  let nextStartTick = 0;
  const active = new Map<string, number>(); // id -> completion tick
  const started: Array<{ id: string; at: number; epic: string }> = [];
  const history: Array<{ at: number; active: number }> = [];
  const queue = [...candidates];
  let evIdx = 0;

  const tryStart = () => {
    while (queue.length > 0 && active.size < cap) {
      if (tick < nextStartTick) break;
      const cand = queue.shift()!;
      active.set(cand.id, tick + duration);
      started.push({ id: cand.id, at: tick, epic: cand.epic });
      nextStartTick = tick + startInterval;
    }
  };

  tryStart();
  while (active.size > 0 || queue.length > 0) {
    // tick advances to completions, external events, or the startup-spacing wake time
    const completions = [...active.values()];
    const wakes: number[] = completions;
    if (queue.length > 0 && active.size < cap) wakes.push(nextStartTick);
    if (evIdx < events.length) wakes.push(events[evIdx].at);
    if (wakes.length === 0) break;
    tick = Math.min(...wakes);
    history.push({ at: tick, active: active.size });
    while (evIdx < events.length && events[evIdx].at === tick) {
      active.delete(events[evIdx].completed);
      evIdx++;
    }
    for (const [id, t] of [...active.entries()]) {
      if (t === tick) active.delete(id);
    }
    tryStart();
  }
  return { started, history };
}

/** Results of one Wave's child issues (result 4-state + integration). */
type ChildResult = {
  issue: string;
  state: "pending" | "running" | "active" | "completed-pr" | "blocked" | "failed" | "delegation-unavailable";
  merged?: boolean;
};

/** REQ-035-016: Wave convergence = every child result is final. */
function waveConverged(results: ChildResult[]): boolean {
  return results.every((r) =>
    r.state === "completed-pr" || r.state === "blocked" ||
    r.state === "failed" || r.state === "delegation-unavailable",
  );
}

/** REQ-035-017: dependency satisfaction needs semantic deps met incl. merges. */
function dependencySatisfied(depResults: ChildResult[]): boolean {
  return depResults.every(
    (r) => r.state === "completed-pr" && r.merged === true,
  );
}

/**
 * REQ-034-041: resume accounting. Unknown-state tasks keep their slot until
 * their end is confirmed; completed issues are not re-run; active tasks are
 * counted (no double start, no cap overflow).
 */
function resumeAccounting(
  persisted: ChildResult[],
  candidates: string[],
  cap: number,
) {
  const kept = persisted.filter(
    (r) => r.state === "active" || r.state === "running" || r.state === "pending",
  );
  const slotHold = new Set(kept.map((r) => r.issue)); // unknown/active hold slots
  const completed = new Set(
    persisted.filter((r) => r.state === "completed-pr").map((r) => r.issue),
  );
  const restarted: string[] = [];
  for (const c of candidates) {
    if (slotHold.size >= cap) break;
    if (slotHold.has(c) || completed.has(c)) continue;
    slotHold.add(c);
    restarted.push(c);
  }
  return { slotHold: [...slotHold], restarted, completedNotReRun: [...completed] };
}

/** Conflict detection over declared change-target sets (TS-007). */
function detectConflicts(
  sets: Array<{ issue: string; files: string[] | null }>,
): { pairs: Array<[string, string]>; undetectable: string[] } {
  const pairs: Array<[string, string]> = [];
  const undetectable: string[] = [];
  for (const s of sets) if (s.files === null) undetectable.push(s.issue);
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i];
      const b = sets[j];
      if (a.files === null || b.files === null) continue; // not duplicate-free
      if (a.files.some((f) => b.files.includes(f))) pairs.push([a.issue, b.issue]);
    }
  }
  return { pairs, undetectable };
}

// ---------------------------------------------------------------------------
// TS-001 composition invariance (REQ-061-038)
// ---------------------------------------------------------------------------

describe("TS-001 composition invariance under runtime caps", () => {
  const nodes = ["A", "B", "C", "D", "E", "F", "G"];
  const deps: DepGraph = {
    A: [], B: [], C: [], D: [], E: [], F: [],
    G: ["A", "B", "C", "D", "E", "F"],
  };

  test("A-F with no required deps, G depending on all -> Wave1=A..F, Wave2=G", () => {
    expect(computeWaves(nodes, deps)).toEqual([
      ["A", "B", "C", "D", "E", "F"],
      ["G"],
    ]);
  });

  test("caps 3/5/10 yield the identical Wave composition (no cap input)", () => {
    // The composition function has no cap parameter by construction; feed the
    // cap as an ignored argument to mirror the contract boundary.
    const composition = computeWaves(nodes, deps);
    for (const cap of [3, 5, 10]) {
      const underCap = computeWaves(nodes, deps, cap as never);
      expect(underCap).toEqual(composition);
    }
  });

  test("8+ same-Wave issues keep one Wave (no cap-imposed split)", () => {
    const many = Array.from({ length: 12 }, (_, i) => `I${i}`);
    const independent: DepGraph = Object.fromEntries(many.map((n) => [n, []]));
    const waves = computeWaves(many, independent);
    expect(waves.length).toBe(1);
    expect(waves[0].length).toBe(12);
  });

  test("distribution artifact pins cap-independent composition (REQ-061-038)", () => {
    const structDoc = read(CASE_READY_STRUCT_REL);
    expect(structDoc).toMatch(/実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に適用しない/);
  });
});

// ---------------------------------------------------------------------------
// TS-002 Wave representation has no cap (REQ-061-010, DEC-041)
// ---------------------------------------------------------------------------

describe("TS-002 Wave representation, persistence and resume (no cap)", () => {
  const many = Array.from({ length: 12 }, (_, i) => `I${i}`);
  const independent: DepGraph = Object.fromEntries(many.map((n) => [n, []]));

  test("representation: 12 same-Wave child issues compose into a single Wave", () => {
    const waves = computeWaves(many, independent);
    expect(waves).toEqual([many]);
  });

  test("persistence+resume roundtrip keeps the same Wave and never persists runtime batches", () => {
    const composed = computeWaves(many, independent);
    const persisted = JSON.stringify({ waves: composed });
    const restored = JSON.parse(persisted) as { waves: IssueId[][] };
    expect(restored.waves).toEqual(composed);
    // runtime batches (cap 3) must not appear in the persisted Wave state
    expect(persisted).not.toMatch(/batch/i);
    // resuming recomputes the identical composition from the semantic DAG
    const resumed = computeWaves(many, independent);
    expect(resumed).toEqual(restored.waves);
  });

  test("runtime cap 3 batching does not change the Wave assignment", () => {
    const candidates = many.map((id) => ({ id, epic: "E1" }));
    const sim = simulateSharedCap(candidates, [], 3);
    // 4 runtime batches of starts, but the Wave composition stays 1 Wave
    expect(sim.started.length).toBe(12);
    expect(sim.history.filter((h) => h.active === 3).length).toBeGreaterThan(0);
    expect(computeWaves(many, independent)).toEqual([many]);
  });

  test("distribution artifact forbids persisting runtime batches as Wave splits", () => {
    const autoSkill = read(CASE_AUTO_SKILL_REL);
    expect(autoSkill).toMatch(/runtime 上の batch や一時直列化を Wave 分割として永続化しない/);
  });
});

// ---------------------------------------------------------------------------
// TS-003 shared cap across Epics / Waves / Standard (REQ-034-027)
// ---------------------------------------------------------------------------

describe("TS-003 shared active Issue task cap across Epics", () => {
  const epicA = ["A1", "A2", "A3", "A4"].map((id) => ({ id, epic: "EpicA" }));
  const epicB = ["B1", "B2", "B3"].map((id) => ({ id, epic: "EpicB" }));
  const standard = [{ id: "S1", epic: "standard" }];
  const candidates = [...epicA, ...epicB, ...standard];

  test("8 ready candidates under cap 5: never more than 5 active, all 8 started", () => {
    const sim = simulateSharedCap(candidates, [], 5);
    expect(sim.started.length).toBe(8);
    expect(Math.max(...sim.history.map((h) => h.active))).toBeLessThanOrEqual(5);
  });

  test("completions free slots across Epics (shared, not per-Epic)", () => {
    const sim = simulateSharedCap(
      candidates,
      [{ at: 100, completed: "A1" }],
      5,
    );
    // after A1 completes at tick 100, more than 5 issues eventually start
    const startedAfter100 = sim.started.filter((s) => s.at >= 100).length;
    expect(startedAfter100).toBeGreaterThanOrEqual(1);
    expect(Math.max(...sim.history.map((h) => h.active))).toBeLessThanOrEqual(5);
  });

  test("nested case-run path gains no independent slot (distribution artifacts)", () => {
    const runSkill = read(CASE_RUN_SKILL_REL);
    const runDelegation = read(CASE_RUN_DELEGATION_REL);
    const autoOrch = read(CASE_AUTO_ORCH_REL);
    expect(runSkill).toMatch(/case-auto の管理外の実行枠（独立実行枠）を生成できない/);
    expect(runDelegation).toMatch(/委譲1件の実装実行委譲/);
    expect(autoOrch).toMatch(/Epic・Wave・Standard Issue を横断して active Issue task 数が上限（5）を超えない/);
    // the legacy case-run parallel-delegation wording must be gone
    expect(runSkill).not.toMatch(/並列委譲（最大5件）|最大5件並列|最大 5 件並列/);
    expect(runDelegation).not.toMatch(/並列委譲（最大5件）|最大5件並列|最大 5 件並列/);
  });
});

// ---------------------------------------------------------------------------
// TS-004 slot refill (REQ-034-040)
// ---------------------------------------------------------------------------

describe("TS-004 empty-slot refill across Epics and Standard", () => {
  test("one result finalized refills the slot without waiting for the other 4", () => {
    const candidates = [
      ...["A1", "A2", "A3", "A4"].map((id) => ({ id, epic: "EpicA" })),
      ...["B1", "B2", "B3"].map((id) => ({ id, epic: "EpicB" })),
      { id: "S1", epic: "standard" },
    ];
    const sim = simulateSharedCap(
      candidates,
      [{ at: 100, completed: "A1" }],
      5,
    );
    // first wave: 5 starts (A1..A4, B1)
    expect(sim.started.slice(0, 5).map((s) => s.id)).toEqual(["A1", "A2", "A3", "A4", "B1"]);
    // refill happens after A1 completes (tick 100), not after all 5 finish
    const refill = sim.started[5];
    expect(refill).toBeDefined();
    expect(refill.at).toBe(100); // A1 completion tick
    // refill crosses Epics: the next candidate is from Epic B / Standard
    expect(["B2", "B3", "S1"]).toContain(refill.id);
  });

  test("distribution artifact pins mandatory cross-refill and no fixed batch", () => {
    const autoOrch = read(CASE_AUTO_ORCH_REL);
    expect(autoOrch).toMatch(/横断補充は best-effort でなく必須/);
    expect(autoOrch).toMatch(/最初に起動した全 task の完了を待つ固定 batch 方式を取らず、起動は実行進行中に継続する/);
  });
});

// ---------------------------------------------------------------------------
// TS-005 convergence vs dependency satisfaction (REQ-034-012, REQ-035-016/017)
// ---------------------------------------------------------------------------

describe("TS-005 Wave convergence and dependency satisfaction are distinct", () => {
  test("(a) pending/running/unknown remaining blocks the next Wave", () => {
    expect(waveConverged([
      { issue: "A1", state: "completed-pr" },
      { issue: "A2", state: "pending" },
    ])).toBe(false);
    expect(waveConverged([
      { issue: "A1", state: "completed-pr" },
      { issue: "A2", state: "running" },
    ])).toBe(false);
    expect(waveConverged([
      { issue: "A1", state: "completed-pr" },
      { issue: "A2", state: "active" },
    ])).toBe(false);
  });

  test("blocked/failed/delegation-unavailable count as converged (but not satisfied)", () => {
    const results: ChildResult[] = [
      { issue: "A1", state: "blocked" },
      { issue: "A2", state: "failed" },
      { issue: "A3", state: "delegation-unavailable" },
    ];
    expect(waveConverged(results)).toBe(true);
    expect(dependencySatisfied(results)).toBe(false);
  });

  test("(b) completed dependency whose integration (merge) is pending does not satisfy", () => {
    const dep: ChildResult[] = [{ issue: "A1", state: "completed-pr", merged: false }];
    expect(waveConverged(dep)).toBe(true);
    expect(dependencySatisfied(dep)).toBe(false);
    expect(dependencySatisfied([{ issue: "A1", state: "completed-pr", merged: true }])).toBe(true);
  });

  test("(c) failed dependency blocks the dependent issue from starting", () => {
    expect(dependencySatisfied([{ issue: "A1", state: "failed" }])).toBe(false);
    expect(dependencySatisfied([{ issue: "A1", state: "blocked" }])).toBe(false);
  });

  test("next Wave requires both gates (distribution artifacts)", () => {
    const autoSkill = read(CASE_AUTO_SKILL_REL);
    expect(autoSkill).toMatch(/Wave 収束と依存充足の両条件 gate/);
    expect(autoSkill).toMatch(/blocked、failed、delegation-unavailable は収束には該当し得るが依存充足とはみなさない/);
  });
});

// ---------------------------------------------------------------------------
// TS-006 resume (REQ-034-041)
// ---------------------------------------------------------------------------

describe("TS-006 resume accounting: no double start, no cap overflow", () => {
  const persisted: ChildResult[] = [
    { issue: "A1", state: "active" },
    { issue: "A2", state: "active" },
    { issue: "A3", state: "running" }, // state-unknown task: holds its slot
    { issue: "A4", state: "completed-pr" },
    { issue: "A5", state: "completed-pr" },
  ];
  const candidates = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "S1"];

  test("active/unknown tasks are counted, completed are not re-run, cap holds", () => {
    const res = resumeAccounting(persisted, candidates, 5);
    // active 2 + unknown 1 hold their slots; refill fills only the remaining 2
    expect(res.slotHold.slice(0, 3).sort()).toEqual(["A1", "A2", "A3"]);
    expect(res.slotHold.length).toBe(5);
    // completed issues are never re-run
    expect(res.completedNotReRun.sort()).toEqual(["A4", "A5"]);
    expect(res.restarted).not.toContain("A4");
    expect(res.restarted).not.toContain("A5");
    // refill starts only after the held slots, capped at 5 total
    expect(res.restarted.length).toBe(2);
    // no double start
    expect(new Set(res.slotHold).size).toBe(res.slotHold.length);
  });

  test("distribution artifact pins resume accounting rules", () => {
    const autoSkill = read(CASE_AUTO_SKILL_REL);
    expect(autoSkill).toMatch(/再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ/);
    expect(autoSkill).toMatch(/状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない/);
  });
});

// ---------------------------------------------------------------------------
// TS-007 duplication detection as conflict-risk signal (REQ-035-012/018, REQ-034-043, REQ-061-019)
// ---------------------------------------------------------------------------

describe("TS-007 duplication detection use (conflict risk, not Wave split)", () => {
  test("(a) same-file independent 2 issues stay in the same Wave", () => {
    const nodes = ["X1", "X2"];
    const deps: DepGraph = { X1: [], X2: [] };
    const waves = computeWaves(nodes, deps);
    expect(waves).toEqual([["X1", "X2"]]); // same Wave despite file overlap
    const detection = detectConflicts([
      { issue: "X1", files: ["src/shared.ts"] },
      { issue: "X2", files: ["src/shared.ts"] },
    ]);
    // conflict is reported as a runtime arbitration signal instead
    expect(detection.pairs).toContainEqual(["X1", "X2"]);
  });

  test("(b) order-of-completion dependency (API provider->consumer) splits Waves", () => {
    const nodes = ["api", "client"];
    const deps: DepGraph = { api: [], client: ["api"] }; // semantic dep recorded
    const waves = computeWaves(nodes, deps);
    expect(waves).toEqual([["api"], ["client"]]); // provider first, consumer later
  });

  test("(c) undetectable change-target set is reported and not treated as duplicate-free", () => {
    const detection = detectConflicts([
      { issue: "U1", files: null },
      { issue: "U2", files: ["src/a.ts"] },
    ]);
    expect(detection.undetectable).toEqual(["U1"]);
    // no pair is reported, but the issue is flagged as undetectable, not clean
    expect(detection.pairs).toEqual([]);
  });

  test("distribution artifacts pin the new meaning (no Wave split on file overlap)", () => {
    const structDoc = read(CASE_READY_STRUCT_REL);
    const autoOrch = read(CASE_AUTO_ORCH_REL);
    expect(structDoc).toMatch(/ファイル重複のみを理由とした Wave 分離を処置に含めない/);
    expect(structDoc).toMatch(/検出不能として報告し、無重複扱いしない/);
    expect(structDoc).toMatch(/成果の成立順序への依存（一方が作成する成果を他方が利用する等）が確認された場合は、それを意味的依存として Wave 構成に反映する/);
    expect(autoOrch).toMatch(/変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告する/);
  });
});
