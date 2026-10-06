import { describe, expect, test } from "bun:test";

import {
  drainSkippableQueue,
  enqueueSkippable,
  type HitlQuestion,
} from "../src/hitl_queue";

function question(
  id: string,
  kind: HitlQuestion["kind"],
  summary = `summary:${id}`,
): HitlQuestion {
  return {
    id,
    kind,
    summary,
    defaultSafeBehavior: "警告の記録と継続",
  };
}

describe("スキップ可能キューへの投入", () => {
  test("警告・確認・選択肢提示はキューへ投入できる", () => {
    let queue: readonly HitlQuestion[] = [];
    for (const kind of ["warning", "confirmation", "choice"] as const) {
      const result = enqueueSkippable(queue, question(`q-${kind}`, kind));
      expect(result.accepted).toBe(true);
      queue = result.queue;
    }
    expect(queue.map((q) => q.kind)).toEqual(["warning", "confirmation", "choice"]);
  });

  test("人間に留保された判断の新規確定は投入を拒否する（ブロッキング維持）", () => {
    const result = enqueueSkippable([], question("q-r", "reserved-judgment"));
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("留保された判断");
    expect(result.queue).toEqual([]);
  });

  test("既存の安全境界が要求する操作承認は投入を拒否する（ブロッキング維持）", () => {
    const result = enqueueSkippable(
      [],
      question("q-s", "safety-operation-approval"),
    );
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain("操作承認");
    expect(result.queue).toEqual([]);
  });

  test("同一識別子の重複投入を拒否する", () => {
    const first = enqueueSkippable([], question("q-1", "warning"));
    const second = enqueueSkippable(first.queue, question("q-1", "warning"));
    expect(second.accepted).toBe(false);
    expect(second.queue).toHaveLength(1);
  });
});

describe("stage 境界・完了報告での一括取り出し", () => {
  test("投入順を保持して全件を取り出す", () => {
    let queue: readonly HitlQuestion[] = [];
    queue = enqueueSkippable(queue, question("w-1", "warning")).queue;
    queue = enqueueSkippable(queue, question("c-1", "confirmation")).queue;
    queue = enqueueSkippable(queue, question("w-2", "warning")).queue;

    const drained = drainSkippableQueue(queue);
    expect(drained.map((q) => q.id)).toEqual(["w-1", "c-1", "w-2"]);
    expect(drained.every((q) => q.defaultSafeBehavior.length > 0)).toBe(true);
  });

  test("キューが空の場合は空の一覧を返す", () => {
    expect(drainSkippableQueue([])).toEqual([]);
  });
});
