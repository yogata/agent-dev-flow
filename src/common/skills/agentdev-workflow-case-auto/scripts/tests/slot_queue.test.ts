import { describe, expect, test } from "bun:test";

import {
  DEFAULT_MAX_ACTIVE_ISSUE_TASKS,
  planSlotAdmissions,
  type SlotCandidate,
} from "../src/slot_queue";
import type { ChildExecutionRecord } from "../src/wave-gate";

function satisfied(issue: string): ChildExecutionRecord {
  return {
    issue,
    status: "outcome-determined",
    outcome: "pass",
    ownRequiredConditionsMet: true,
    acceptance: { closeAllowed: true },
  };
}

function outcomeOf(
  issue: string,
  outcome: ChildExecutionRecord["outcome"],
): ChildExecutionRecord {
  return { issue, status: "outcome-determined", outcome };
}

function recordsOf(
  ...records: ChildExecutionRecord[]
): ReadonlyMap<string, ChildExecutionRecord> {
  return new Map(records.map((record) => [record.issue, record]));
}

function candidate(issue: string, dependsOn: readonly string[] = []): SlotCandidate {
  return { issue, dependsOn };
}

describe("依存未充足子 Issue の投入拒否", () => {
  test("依存先が完了していない子は投入しない", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#200", ["#100"])],
      records: recordsOf({ issue: "#100", status: "active" }),
      activeIssues: [],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#200", reason: "dependency-not-satisfied" },
    ]);
  });

  test("blocked / failed / delegation-unavailable の依存先は依存充足とみなさず投入しない", () => {
    for (const outcome of ["blocked", "failed", "delegation-unavailable"] as const) {
      const plan = planSlotAdmissions({
        candidates: [candidate("#201", ["#101"])],
        records: recordsOf(outcomeOf("#101", outcome)),
        activeIssues: [],
      });
      expect(plan.admissions).toEqual([]);
      expect(plan.notAdmitted[0]?.reason).toBe("dependency-not-satisfied");
    }
  });

  test("依存先が完了していれば投入する（Wave 収束は前提としない）", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#200", ["#100"])],
      records: recordsOf(satisfied("#100"), { issue: "#300", status: "active" }),
      activeIssues: ["#300"],
    });
    // 無関係の子 #300 が実行中（Wave 非収束）でも、依存充足済みの #200 は即時投入される
    // （完了即次投入）。
    expect(plan.admissions).toEqual(["#200"]);
    expect(plan.activeAfterPlan).toEqual(["#300", "#200"]);
  });

  test("依存関係のある Definition merge が進行中の場合、当該統合を伴う投入を保留する（排他維持）", () => {
    const plan = planSlotAdmissions({
      candidates: [
        { issue: "#200", dependsOn: ["#100"], requiresDependentMerge: true },
      ],
      records: recordsOf(satisfied("#100")),
      activeIssues: [],
      dependentMergeInFlight: "definition/issue-100",
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#200", reason: "definition-merge-exclusive" },
    ]);

    const afterMerge = planSlotAdmissions({
      candidates: [
        { issue: "#200", dependsOn: ["#100"], requiresDependentMerge: true },
      ],
      records: recordsOf(satisfied("#100")),
      activeIssues: [],
      dependentMergeInFlight: null,
    });
    expect(afterMerge.admissions).toEqual(["#200"]);
  });
});

describe("共有 active Issue task 枠の上限超過防止と空き枠補充", () => {
  test("上限を超える投入を行わず、残候補を no-active-slot で報告する", () => {
    const plan = planSlotAdmissions({
      candidates: [
        candidate("#1"),
        candidate("#2"),
        candidate("#3"),
        candidate("#4"),
        candidate("#5"),
        candidate("#6"),
      ],
      records: recordsOf(),
      activeIssues: [],
      maxActive: 5,
    });
    expect(plan.admissions).toEqual(["#1", "#2", "#3", "#4", "#5"]);
    expect(plan.notAdmitted).toEqual([{ issue: "#6", reason: "no-active-slot" }]);
    expect(plan.activeAfterPlan).toHaveLength(5);
  });

  test("既存 active を計上した上で空き枠だけを補充する（横断補充）", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#10"), candidate("#11")],
      records: recordsOf(),
      activeIssues: ["#1", "#2", "#3", "#4"],
      maxActive: 5,
    });
    expect(plan.admissions).toEqual(["#10"]);
    expect(plan.notAdmitted).toEqual([{ issue: "#11", reason: "no-active-slot" }]);
  });

  test("上限の既定値は case-auto Design が所有する数値（5）である", () => {
    expect(DEFAULT_MAX_ACTIVE_ISSUE_TASKS).toBe(5);
  });

  test("上限を超える入力でも計画後の active が上限を超過しない（並列実行下の上限超過 0 件）", () => {
    const candidates = Array.from({ length: 12 }, (_, i) => candidate(`#${i + 1}`));
    const plan = planSlotAdmissions({
      candidates,
      records: recordsOf(),
      activeIssues: ["#90", "#91", "#92"],
    });
    expect(plan.activeAfterPlan.length).toBeLessThanOrEqual(5);
  });
});

describe("再開時の二重起動防止と状態管理", () => {
  test("active な対象を二重投入しない", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#100")],
      records: recordsOf(),
      activeIssues: ["#100"],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([{ issue: "#100", reason: "already-active" }]);
  });

  test("完了済み（outcome pass）の対象を未完了に戻して再投入しない", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#100")],
      records: recordsOf(satisfied("#100")),
      activeIssues: [],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#100", reason: "already-completed" },
    ]);
  });

  test("受入評価が拒否している子は完了済みと分類せず投入しない（拒否結果の消費）", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#100")],
      records: recordsOf({
        ...satisfied("#100"),
        acceptance: { closeAllowed: false, rejectionReason: "acceptance-denied:必須未達残存" },
      }),
      activeIssues: [],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#100", reason: "acceptance-refused" },
    ]);
  });

  test("受入評価が拒否している依存先は依存充足せず、後続の子も投入しない", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#200", ["#100"])],
      records: recordsOf({
        ...satisfied("#100"),
        acceptance: { closeAllowed: false, rejectionReason: "acceptance-denied" },
      }),
      activeIssues: [],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#200", reason: "dependency-not-satisfied" },
    ]);
  });

  test("状態不明の対象は投入せず、報告する（実行枠の解放はしない）", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#100")],
      records: recordsOf({ issue: "#100", status: "state-unknown" }),
      activeIssues: ["#100"],
    });
    expect(plan.admissions).toEqual([]);
    expect(plan.notAdmitted).toEqual([{ issue: "#100", reason: "already-active" }]);

    const unobserved = planSlotAdmissions({
      candidates: [candidate("#101")],
      records: recordsOf({ issue: "#101", status: "state-unknown" }),
      activeIssues: [],
    });
    expect(unobserved.admissions).toEqual([]);
    expect(unobserved.notAdmitted).toEqual([
      { issue: "#101", reason: "state-unknown" },
    ]);
  });

  test("同一候補の重複投入（計画内重複）を行わない", () => {
    const plan = planSlotAdmissions({
      candidates: [candidate("#100"), candidate("#100")],
      records: recordsOf(),
      activeIssues: [],
      maxActive: 5,
    });
    expect(plan.admissions).toEqual(["#100"]);
    expect(plan.notAdmitted).toEqual([
      { issue: "#100", reason: "already-active" },
    ]);
  });
});

describe("投入順序の決定性と Epic 実行構成表の状態整合", () => {
  test("同一入力から同一の計画を返す（決定的）", () => {
    const input = {
      candidates: [candidate("#1"), candidate("#2", ["#1"]), candidate("#3")],
      records: recordsOf(satisfied("#1")),
      activeIssues: ["#90"],
    };
    const first = planSlotAdmissions(input);
    const second = planSlotAdmissions(input);
    expect(first).toEqual(second);
  });

  test("投入順序によらず、対象の観測状態から同一の状態分類が得られる", () => {
    // スロット型キューの投入順（依存充足順）を変えても、完了・未完了・実行中の
    // 分類は観測状態のみから決まる（Epic 実行構成表の状態更新が投入順序に依存しない）。
    const records = recordsOf(
      satisfied("#1"),
      { issue: "#2", status: "active" },
      { issue: "#3", status: "pending" },
    );
    const orderA = planSlotAdmissions({
      candidates: [candidate("#3"), candidate("#2"), candidate("#1")],
      records,
      activeIssues: [],
      maxActive: 5,
    });
    const orderB = planSlotAdmissions({
      candidates: [candidate("#1"), candidate("#3"), candidate("#2")],
      records,
      activeIssues: [],
      maxActive: 5,
    });
    const classify = (plan: ReturnType<typeof planSlotAdmissions>) => ({
      completed: plan.notAdmitted.filter((n) => n.reason === "already-completed").map((n) => n.issue).sort(),
      held: plan.notAdmitted.filter((n) => n.reason !== "already-completed" && n.reason !== "no-active-slot").map((n) => n.issue).sort(),
    });
    expect(classify(orderA)).toEqual(classify(orderB));
    expect(classify(orderA).completed).toEqual(["#1"]);
  });
});
