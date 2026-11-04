import { describe, expect, test } from "bun:test";
import {
  buildRevisionRecord,
  resolveRecordedAt,
  summarizeReliedDiffReport,
} from "../lib/revision-record.ts";
import type { ImpactInputState, RevisionItem } from "../lib/revision-record.ts";

const RESOLVED_IMPACT: ImpactInputState = {
  resolved: true,
  reliedCommit: "aaa1111bbb2222ccc3333ddd4444eee5555ffff6",
  headCommit: "fff000eee111ddd222ccc333bbb444aaa5556667",
  comparisonRange: "aaa1111bbb2222ccc3333ddd4444eee5555ffff6..fff000eee111ddd222ccc333bbb444aaa5556667",
  fullyPropagated: "no",
  note: "",
};

const UNRESOLVED_IMPACT: ImpactInputState = {
  resolved: false,
  reliedCommit: null,
  headCommit: "fff000eee111ddd222ccc333bbb444aaa5556667",
  comparisonRange: "unresolved",
  fullyPropagated: "undetermined",
  note: "依拠版の解決不能・比較基準の未確定のため影響分類を取得できていない",
};

function item(overrides: Partial<RevisionItem> = {}): RevisionItem {
  return {
    path: "docs/designs/workflows/example.md",
    outcome: "updated",
    reason: "上流の変更に追随して更新した",
    verification: "typecheck を実行し合格した",
    evidenceReuse: null,
    ...overrides,
  };
}

const RECORDED_AT = "2026-11-04T00:00:00Z";

describe("影響評価の入力の抽出（summarizeReliedDiffReport）", () => {
  test("依拠版が解決した出力から取得状態を抽出する", () => {
    const state = summarizeReliedDiffReport({
      mode: "relied-diff",
      reliedCommit: RESOLVED_IMPACT.reliedCommit,
      headCommit: RESOLVED_IMPACT.headCommit,
      comparisonRange: RESOLVED_IMPACT.comparisonRange,
      basisNote: null,
      impacts: [],
      downstream: null,
      evidence: { status: "confirmed", freshPaths: [], stalePaths: [], note: "" },
      fullyPropagated: "no",
      emptyResult: false,
    });
    expect(state.resolved).toBe(true);
    expect(state.note).toBe("");
  });

  test("依拠版が未解決の出力（comparisonRange: unresolved）を未取得として扱う", () => {
    const state = summarizeReliedDiffReport({
      mode: "relied-diff",
      reliedCommit: null,
      headCommit: RESOLVED_IMPACT.headCommit,
      comparisonRange: "unresolved",
      basisNote: null,
      impacts: [],
      downstream: null,
      evidence: { status: "unconfirmed", freshPaths: [], stalePaths: [], note: "" },
      fullyPropagated: "undetermined",
      emptyResult: false,
    });
    expect(state.resolved).toBe(false);
    expect(state.note.length).toBeGreaterThan(0);
  });

  test("mode が relied-diff でない入力は例外（fail-closed）", () => {
    expect(() => summarizeReliedDiffReport({ mode: "other" })).toThrow();
    expect(() => summarizeReliedDiffReport("not-an-object")).toThrow();
    expect(() => summarizeReliedDiffReport(null)).toThrow();
  });

  test("必須フィールドの型不備は例外（fail-closed）", () => {
    expect(() =>
      summarizeReliedDiffReport({
        mode: "relied-diff",
        reliedCommit: 123,
        headCommit: RESOLVED_IMPACT.headCommit,
        comparisonRange: "x..y",
        fullyPropagated: "no",
      }),
    ).toThrow();
  });
});

describe("改訂実行記録の生成（buildRevisionRecord）", () => {
  test("全下流対象が完了し影響評価の入力が取得済みなら completed", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [
        item(),
        item({
          path: "docs/designs/workflows/other.md",
          outcome: "no-update",
          reason: "現行上流と整合する根拠（対象節の現行本文と上流版の照合）を確認した",
          verification: null,
        }),
        item({
          path: "docs/designs/workflows/new.md",
          outcome: "created",
          reason: "下流成果物が不在のため作成した",
        }),
      ],
      approval: "利用者の明示指示（対象: 対象節の更新、範囲: 該当節のみ）",
      notices: [{ stage: "pre", reference: "完了報告の事前通知記録" }],
    });
    expect(record.completion).toBe("completed");
    expect(record.excludedFromCompletion.length).toBe(0);
    expect(record.resumeTargets.length).toBe(0);
    expect(record.items.every((entry) => entry.completed)).toBe(true);
  });

  test("未確認の対象は完了側から除外され incomplete", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [item({ outcome: "unconfirmed", reason: "依拠版が特定できず影響分類を確定できない", verification: null })],
      approval: "利用者の明示指示",
      notices: [],
    });
    expect(record.completion).toBe("incomplete");
    expect(record.excludedFromCompletion.length).toBe(1);
    expect(record.resumeTargets.length).toBe(0);
  });

  test("処理失敗・未処理の対象は再開対象として列挙される", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [
        item({ path: "a.md", outcome: "failed", reason: "保存の機械検査で不合格", verification: null }),
        item({ path: "b.md", outcome: "pending", reason: "中断により未処理", verification: null }),
        item({ path: "c.md" }),
      ],
      approval: "利用者の明示指示",
      notices: [],
    });
    expect(record.completion).toBe("incomplete");
    expect(record.resumeTargets.map((entry) => entry.path)).toEqual(["a.md", "b.md"]);
    expect(record.excludedFromCompletion.map((entry) => entry.path)).toEqual(["a.md", "b.md"]);
  });

  test("旧証拠の適用可能性が stale / unconfirmed の対象は完了側から除外する", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [
        item({ path: "a.md", evidenceReuse: "stale", reason: "旧証拠の対象版と現行版が不一致" }),
        item({ path: "b.md", evidenceReuse: "unconfirmed", reason: "依拠版が特定できない", verification: "再検証を実施したが旧証拠の適用可能性を確認できなかった" }),
        item({ path: "c.md", evidenceReuse: "applicable" }),
      ],
      approval: "利用者の明示指示",
      notices: [],
    });
    expect(record.completion).toBe("incomplete");
    expect(record.items.find((entry) => entry.path === "a.md")?.completed).toBe(false);
    expect(record.items.find((entry) => entry.path === "b.md")?.completed).toBe(false);
    expect(record.items.find((entry) => entry.path === "c.md")?.completed).toBe(true);
  });

  test("影響評価の入力が未取得なら全下流対象を完了側に含めない（REQ-106-012 の機械規則）", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: UNRESOLVED_IMPACT,
      items: [item(), item({ path: "b.md", outcome: "no-update", reason: "整合根拠を確認した", verification: null })],
      approval: "利用者の明示指示",
      notices: [],
    });
    expect(record.completion).toBe("incomplete");
    expect(record.excludedFromCompletion.length).toBe(2);
    expect(record.items.every((entry) => !entry.completed)).toBe(true);
    expect(record.resumeTargets.length).toBe(0);
  });

  test("空の下流列挙（後続工程なし等）は影響評価の入力が取得済みなら completed", () => {
    const record = buildRevisionRecord({
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [],
      approval: "利用者の明示指示",
      notices: [],
    });
    expect(record.completion).toBe("completed");
    expect(record.excludedFromCompletion.length).toBe(0);
  });

  test("承認範囲の記録が空なら例外（REQ-111-025 の fail-closed）", () => {
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [],
        approval: "   ",
        notices: [],
      }),
    ).toThrow();
  });

  test("更新・作成に検証結果がなければ例外（REQ-106-013 の機械規則）", () => {
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item({ verification: null })],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item({ outcome: "created", verification: "  " })],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
  });

  test("根拠のない項目・重複 path・語彙外は例外（fail-closed）", () => {
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item({ reason: " " })],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item(), item()],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item({ outcome: "unknown-outcome" as RevisionItem["outcome"] })],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [item({ evidenceReuse: "stale-maybe" as RevisionItem["evidenceReuse"] })],
        approval: "利用者の明示指示",
        notices: [],
      }),
    ).toThrow();
  });

  test("通知の時点区分の重複・語彙外・空参照は例外（REQ-111-026 の fail-closed）", () => {
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [],
        approval: "利用者の明示指示",
        notices: [
          { stage: "pre", reference: "事前通知の記録" },
          { stage: "pre", reference: "重複" },
        ],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [],
        approval: "利用者の明示指示",
        notices: [{ stage: "unknown" as never, reference: "記録" }],
      }),
    ).toThrow();
    expect(() =>
      buildRevisionRecord({
        recordedAt: RECORDED_AT,
        impactInput: RESOLVED_IMPACT,
        items: [],
        approval: "利用者の明示指示",
        notices: [{ stage: "post", reference: " " }],
      }),
    ).toThrow();
  });

  test("同一入力から同一 JSON（決定性）", () => {
    const input = {
      recordedAt: RECORDED_AT,
      impactInput: RESOLVED_IMPACT,
      items: [item(), item({ path: "b.md", outcome: "no-update", reason: "根拠", verification: null })],
      approval: "利用者の明示指示",
      notices: [{ stage: "pre" as const, reference: "事前通知の記録" }],
    };
    const first = buildRevisionRecord(input);
    const second = buildRevisionRecord(input);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  test("記録日時は操作時点の時計からのみ取得し、無効な時計は例外", () => {
    expect(resolveRecordedAt(() => new Date("2026-11-04T00:00:00Z"))).toBe("2026-11-04T00:00:00.000Z");
    const brokenClock = () => new Date(Number.NaN);
    expect(() => resolveRecordedAt(brokenClock)).toThrow();
  });
});
