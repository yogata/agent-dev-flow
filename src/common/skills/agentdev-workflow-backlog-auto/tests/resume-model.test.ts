import { describe, expect, test } from "bun:test";
import { executeE2e } from "./resume-model.ts";
import type { Operation, ResumeState } from "./resume-model.ts";

const initial: ResumeState = {
  setId: "set-a", progress: {}, artifacts: { reqDoc: null, issue: null }, creationLog: [], completed: false,
};

interface ResumeFixture {
  readonly name: string;
  readonly state: ResumeState;
  readonly expected: readonly Operation[];
  readonly created: readonly string[];
}

// 期待操作列は「一式再開経路」の中断点から独立に列挙する。公開入口 E2E の代替ではない。
const fixtures: readonly ResumeFixture[] = [
  { name: "RU 生成後", state: executeE2e(initial, { at: "review", window: "completed" }).state,
    expected: ["baseline", "define", "case-open", "run", "judge", "release"], created: ["set-a/reqdoc", "set-a/issue"] },
  { name: "基準点確定後", state: executeE2e(initial, { at: "baseline", window: "completed" }).state,
    expected: ["define", "case-open", "run", "judge", "release"], created: ["set-a/reqdoc", "set-a/issue"] },
  { name: "要件定義後", state: executeE2e(initial, { at: "define", window: "completed" }).state,
    expected: ["case-open", "run", "judge", "release"], created: ["set-a/issue"] },
  { name: "Issue 生成後・進捗記録前", state: executeE2e(initial, { at: "case-open", window: "effect" }).state,
    expected: ["case-open", "run", "judge", "release"], created: [] },
  { name: "実行中", state: executeE2e(initial, { at: "run", window: "effect" }).state,
    expected: ["run", "judge", "release"], created: [] },
  { name: "完遂済み・リリース保留",
    state: { ...executeE2e(initial, { at: "judge", window: "completed" }).state,
      progress: { review: "done", baseline: "done", define: "done", "case-open": "done", run: "done", judge: "done", release: "held" } },
    expected: ["release"], created: [] },
  { name: "リリース済み", state: executeE2e(initial).state, expected: [], created: [] },
];

describe("一式の保存状態からの再開模擬", () => {
  test.each([...fixtures])("$name: 別オブジェクトへ復元し完了済み操作を省略する", (fixture) => {
    const serialized = JSON.stringify(fixture.state);
    const restored: ResumeState = JSON.parse(serialized);
    const result = executeE2e(restored);
    expect(result.executed).toEqual([...fixture.expected]);
    expect(result.created).toEqual([...fixture.created]);
    expect(result.state.setId).toBe("set-a");
    expect(result.state.artifacts).toEqual({ reqDoc: "set-a/reqdoc", issue: "set-a/issue" });
    expect(result.state.creationLog).toEqual(["set-a/reqdoc", "set-a/issue"]);
    expect(result.state.completed).toBe(true);
    expect(JSON.stringify(restored)).toBe(serialized);
    expect(JSON.stringify(fixture.state)).toBe(serialized);
    expect(result.state).not.toBe(restored);
  });

  test("Issue の副作用成立と進捗未記録の窓を実際に表現する", () => {
    const stopped = executeE2e(initial, { at: "case-open", window: "effect" });
    expect(stopped.state.progress["case-open"]).toBe("interrupted");
    expect(stopped.state.artifacts.issue).toBe("set-a/issue");
    expect(stopped.state.creationLog).toEqual(["set-a/reqdoc", "set-a/issue"]);
    expect(stopped.state.completed).toBe(false);
    expect(stopped.executed).toEqual(["review", "baseline", "define", "case-open"]);
  });

  test("要件doc 生成後の進捗未記録でも既存識別子を再利用する", () => {
    const stopped = executeE2e(initial, { at: "define", window: "effect" });
    const serialized = JSON.stringify(stopped.state);
    const restored: ResumeState = JSON.parse(serialized);
    const resumed = executeE2e(restored);
    expect(resumed.executed).toEqual(["define", "case-open", "run", "judge", "release"]);
    expect(resumed.created).toEqual(["set-a/issue"]);
    expect(resumed.state.creationLog).toEqual(["set-a/reqdoc", "set-a/issue"]);
    expect(JSON.stringify(restored)).toBe(serialized);
  });

  test("再開前の保存状態を変更しない", () => {
    const first = executeE2e(initial, { at: "run", window: "effect" }).state;
    const before = JSON.stringify(first);
    executeE2e(first);
    expect(JSON.stringify(first)).toBe(before);
  });

  test("進行中の記録は新規実行と区別できる", () => {
    const inFlight = executeE2e(initial, { at: "run", window: "effect" }).state;
    expect(inFlight.setId).toBe("set-a");
    expect(inFlight.progress.run).toBe("interrupted");
    expect(inFlight.artifacts.issue).toBe("set-a/issue");
  });
});
