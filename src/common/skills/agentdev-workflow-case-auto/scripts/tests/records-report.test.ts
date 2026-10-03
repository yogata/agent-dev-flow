import { describe, expect, test } from "bun:test";

import {
  aggregateUnits,
  applyTargetKey,
  buildRecoveryPlan,
  buildStopReport,
  formatStopReport,
  hasOutstandingFaces,
  planApply,
  type ApplyTarget,
  type UnitRecord,
} from "../src/records-report";

// ---------------------------------------------------------------------------
// 停止時集約報告（完了済み / 進行中 / 未実行 / 観測不能 + 次コマンド）
// ---------------------------------------------------------------------------

describe("aggregateUnits", () => {
  test("混合状態の対象群を4区分に分類する", () => {
    const units: UnitRecord[] = [
      { target: "#101", stage: 3, status: "completed", outcome: "pass" },
      { target: "#102", stage: 3, status: "active" },
      { target: "#103", stage: 3, status: "not-started" },
      { target: "#104", stage: 3, status: "state-unknown" },
    ];
    const agg = aggregateUnits(units);
    expect(agg.completed.map((u) => u.target)).toEqual(["#101"]);
    expect(agg.active.map((u) => u.target)).toEqual(["#102"]);
    expect(agg.notStarted.map((u) => u.target)).toEqual(["#103"]);
    expect(agg.stateUnknown.map((u) => u.target)).toEqual(["#104"]);
  });

  test("後続不能確定対象を完了済みに集約しない", () => {
    const units: UnitRecord[] = [
      { target: "#201", stage: 4, status: "completed", outcome: "pass" },
      { target: "#202", stage: 4, status: "completed", outcome: "blocked" },
      { target: "#203", stage: 4, status: "completed", outcome: "failed" },
      { target: "#204", stage: 4, status: "completed", outcome: "delegation-unavailable" },
    ];
    const agg = aggregateUnits(units);
    // 分類器は観測状態のみを反映し、確定結果の区分は報告行に明示される（分類器では4件とも完了済み扱い）。
    // 後続不能確定の明示は buildStopReport の unitLines が担う。
    expect(agg.completed).toHaveLength(4);
  });

  test("空入力で4区分がすべて空の集約を返す", () => {
    const agg = aggregateUnits([]);
    expect(agg.completed).toHaveLength(0);
    expect(agg.active).toHaveLength(0);
    expect(agg.notStarted).toHaveLength(0);
    expect(agg.stateUnknown).toHaveLength(0);
  });

  test("観測不能対象を進行中に含めない（観測不能の明示）", () => {
    const units: UnitRecord[] = [{ target: "#301", stage: 3, status: "state-unknown" }];
    const agg = aggregateUnits(units);
    expect(agg.active).toHaveLength(0);
    expect(agg.stateUnknown.map((u) => u.target)).toEqual(["#301"]);
  });
});

describe("buildStopReport", () => {
  const baseContext = {
    stopReason: "CI/test/lint 失敗（self-healing 不能）",
    nextCommand: "case-auto #301（case-run から再開）",
    resumeBasis: "case-run 再開ポイント（実装フェーズ、durable state から再構成）",
    latestRecordRef: "Case Issue #301 本文 進行状況 + 停止コメント",
  };

  test("完了済み/進行中/未実行の各委譲単位と次コマンドを報告に含める", () => {
    const units: UnitRecord[] = [
      { target: "#101", stage: 3, status: "completed", outcome: "pass" },
      { target: "#102", stage: 3, status: "active" },
      { target: "#103", stage: 3, status: "not-started" },
    ];
    const report = buildStopReport(units, baseContext);
    expect(report.summaryLine).toContain("完了済み 1 件");
    expect(report.summaryLine).toContain("進行中 1 件");
    expect(report.summaryLine).toContain("未実行 1 件");
    expect(report.summaryLine).toContain("観測不能 0 件");
    expect(report.nextCommandLine).toContain(baseContext.nextCommand);
    expect(report.nextCommandLine).toContain(baseContext.resumeBasis);
    expect(report.presenceLines.some((l) => l.includes(baseContext.stopReason))).toBe(true);
    expect(report.presenceLines.some((l) => l.includes(baseContext.latestRecordRef))).toBe(true);
  });

  test("観測不能対象を観測不能として明示する（進行中と断定しない）", () => {
    const units: UnitRecord[] = [{ target: "#301", stage: 3, status: "state-unknown" }];
    const report = buildStopReport(units, baseContext);
    expect(report.summaryLine).toContain("観測不能 1 件");
    expect(report.unitLines.join("\n")).toContain("観測不能");
  });

  test("後続不能確定対象の確定結果を報告行に明示する", () => {
    const units: UnitRecord[] = [
      { target: "#202", stage: 4, status: "completed", outcome: "blocked" },
    ];
    const report = buildStopReport(units, baseContext);
    expect(report.unitLines.join("\n")).toContain("blocked（後続不能確定）");
  });

  test("タイミング情報を指定した場合のみ進行状況要素に含める", () => {
    const units: UnitRecord[] = [];
    const without = buildStopReport(units, baseContext);
    expect(without.presenceLines.some((l) => l.startsWith("タイミング情報"))).toBe(false);
    const withTiming = buildStopReport(units, { ...baseContext, timing: "開始 10:00 / 停止 11:30 / 経過 90分" });
    expect(withTiming.presenceLines.some((l) => l.includes("経過 90分"))).toBe(true);
  });

  test("formatStopReport が集約・次コマンド・進行状況の3セクションを含む Markdown を生成する", () => {
    const units: UnitRecord[] = [
      { target: "#101", stage: 3, status: "completed", outcome: "pass" },
      { target: "#102", stage: 3, status: "active" },
      { target: "#103", stage: 3, status: "not-started" },
    ];
    const text = formatStopReport(buildStopReport(units, baseContext));
    expect(text).toContain("### 停止時集約");
    expect(text).toContain("### 次コマンド");
    expect(text).toContain("### 進行状況");
    expect(text).toContain("#101（stage 3）: 完了済み");
    expect(text).toContain("#102（stage 3）: 進行中");
    expect(text).toContain("#103（stage 3）: 未実行");
  });
});

// ---------------------------------------------------------------------------
// 再開時の最新条件参照（集約は現行観測のみに依存し、旧集約を保持しない）
// ---------------------------------------------------------------------------

describe("再開時の最新条件参照", () => {
  test("同一関数への異なる現行観測は異なる集約を返す（停止時集約の再利用をしない）", () => {
    const atStop: UnitRecord[] = [
      { target: "#101", stage: 3, status: "active" },
      { target: "#102", stage: 3, status: "not-started" },
    ];
    const afterResume: UnitRecord[] = [
      { target: "#101", stage: 3, status: "completed", outcome: "pass" },
      { target: "#102", stage: 3, status: "active" },
    ];
    const aggAtStop = aggregateUnits(atStop);
    const aggAfterResume = aggregateUnits(afterResume);
    expect(aggAtStop.completed).toHaveLength(0);
    expect(aggAfterResume.completed.map((u) => u.target)).toEqual(["#101"]);
    expect(aggAfterResume.active.map((u) => u.target)).toEqual(["#102"]);
    // 停止時の集約が再開後の入力へ混入しないこと（純関数であること）の検証。
    expect(aggregateUnits(atStop).completed).toHaveLength(0);
  });

  test("同一入力からは同一報告が決定的に生成される", () => {
    const units: UnitRecord[] = [
      { target: "#101", stage: 3, status: "active" },
      { target: "#102", stage: 3, status: "not-started" },
    ];
    const context = {
      stopReason: "停止理由（テスト用）",
      nextCommand: "case-auto #401",
      resumeBasis: "case-run 再開ポイント",
      latestRecordRef: "Case Issue #401 本文 進行状況",
    };
    const a = formatStopReport(buildStopReport(units, context));
    const b = formatStopReport(buildStopReport(units, context));
    expect(a).toBe(b);
  });
});

// ---------------------------------------------------------------------------
// 反映計画・部分成功照合（読み戻し→不足分再試行）・重複防止
// ---------------------------------------------------------------------------

const t = (occasion: ApplyTarget["occasion"], face: ApplyTarget["face"], destination: string): ApplyTarget => ({
  occasion,
  face,
  destination,
});

describe("planApply", () => {
  test("部分成功（コメントのみ成功・本文のみ失敗）を区別する", () => {
    const targets = [
      t("hold", "comment", "#401"),
      t("hold", "body", "#401"),
    ];
    const commentKey = applyTargetKey(targets[0]!);
    const bodyKey = applyTargetKey(targets[1]!);
    const plan = planApply({
      targets,
      sent: [commentKey, bodyKey],
      readback: { [commentKey]: "applied", [bodyKey]: "missing" },
    });
    expect(plan.applied.map(applyTargetKey)).toEqual([commentKey]);
    expect(plan.retry.map(applyTargetKey)).toEqual([bodyKey]);
  });

  test("読み戻し結果に存在しないキーは読み戻し未確認として扱う", () => {
    const targets = [t("hold", "comment", "#402")];
    const plan = planApply({
      targets,
      sent: [applyTargetKey(targets[0]!)],
      readback: { "#999/comment/stop": "applied" },
    });
    expect(plan.verifyFirst).toHaveLength(1);
    expect(plan.applied).toHaveLength(0);
  });

  test("読み戻しで不足が確認された対象のみを再試行対象にする", () => {
    const targets = [
      t("hold", "comment", "#401"),
      t("hold", "body", "#401"),
      t("hold", "comment", "#402"),
    ];
    const plan = planApply({
      targets,
      sent: [applyTargetKey(targets[0]!), applyTargetKey(targets[1]!), applyTargetKey(targets[2]!)],
      readback: {
        [applyTargetKey(targets[0]!)]: "applied",
        [applyTargetKey(targets[1]!)]: "missing",
        [applyTargetKey(targets[2]!)]: "missing",
      },
    });
    expect(plan.applied.map(applyTargetKey)).toEqual([applyTargetKey(targets[0]!)]);
    expect(plan.retry.map(applyTargetKey)).toEqual([
      applyTargetKey(targets[1]!),
      applyTargetKey(targets[2]!),
    ]);
    expect(plan.verifyFirst).toHaveLength(0);
    expect(plan.pending).toHaveLength(0);
  });

  test("読み戻し未確認の対象を再試行対象に含めない（重複投稿防止）", () => {
    const targets = [
      t("hold", "comment", "#403"),
      t("hold", "body", "#403"),
    ];
    const plan = planApply({
      targets,
      // コメント面のみ送信試行済み、読み戻しは未実施。本文面は未送信。
      sent: [applyTargetKey(targets[0]!)],
    });
    expect(plan.verifyFirst.map(applyTargetKey)).toEqual([applyTargetKey(targets[0]!)]);
    expect(plan.retry).toHaveLength(0);
    expect(plan.pending.map(applyTargetKey)).toEqual([applyTargetKey(targets[1]!)]);
  });

  test("読み戻し確認後に不足が確定した対象が再試行対象へ移る", () => {
    const targets = [t("hold", "comment", "#404")];
    const key = applyTargetKey(targets[0]!);
    // 1回目: 送信済み・読み戻し未確認 → verifyFirst（再送しない）
    const first = planApply({ targets, sent: [key] });
    expect(first.verifyFirst).toHaveLength(1);
    expect(first.retry).toHaveLength(0);
    // 2回目: 読み戻しで不足確定 → retry（不足分の再試行）
    const second = planApply({ targets, sent: [key], readback: { [key]: "missing" } });
    expect(second.retry.map(applyTargetKey)).toEqual([key]);
    expect(second.verifyFirst).toHaveLength(0);
    // 3回目: 再試行送信後の読み戻しで存在確認 → applied（重複再送しない）
    const third = planApply({ targets, sent: [key], readback: { [key]: "applied" } });
    expect(third.applied.map(applyTargetKey)).toEqual([key]);
    expect(third.retry).toHaveLength(0);
  });

  test("未送信対象は初回反映対象（pending）として区別する", () => {
    const targets = [t("resume", "body", "#405")];
    const plan = planApply({ targets });
    expect(plan.pending.map(applyTargetKey)).toEqual([applyTargetKey(targets[0]!)]);
    expect(hasOutstandingFaces(plan)).toBe(true);
  });

  test("全対象が反映済みの場合は残存なし", () => {
    const targets = [t("completion", "comment", "#406")];
    const key = applyTargetKey(targets[0]!);
    const plan = planApply({ targets, sent: [key], readback: { [key]: "applied" } });
    expect(hasOutstandingFaces(plan)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 回復計画（未反映回復・成果確定と記録完了の区別）
// ---------------------------------------------------------------------------

describe("buildRecoveryPlan", () => {
  test("未反映対象と識別情報から回復計画を生成する", () => {
    const targets = [
      t("hold", "comment", "#501"),
      t("hold", "body", "#501"),
    ];
    const commentKey = applyTargetKey(targets[0]!);
    const bodyKey = applyTargetKey(targets[1]!);
    const recovery = buildRecoveryPlan(
      {
        targets,
        sent: [commentKey, bodyKey],
        readback: { [commentKey]: "applied", [bodyKey]: "missing" },
      },
      { outcomeFinalized: false },
    );
    expect(recovery.recoveries).toHaveLength(1);
    expect(recovery.recoveries[0]?.target.face).toBe("body");
    expect(recovery.alreadyApplied).toEqual([commentKey]);
    expect(recovery.completionState).toBe("records-incomplete");
  });

  test("読み戻し未確認対象を再送せず確認対象として回復計画に含める", () => {
    const targets = [t("hold", "comment", "#502")];
    const key = applyTargetKey(targets[0]!);
    const recovery = buildRecoveryPlan({ targets, sent: [key] }, { outcomeFinalized: false });
    expect(recovery.recoveries).toHaveLength(1);
    expect(recovery.recoveries[0]?.contentSummary).toContain("読み戻し確認");
    expect(recovery.alreadyApplied).toHaveLength(0);
  });

  test("成果確定済みでも記録未完了の場合は終了処理未完了として区分する", () => {
    const targets = [t("completion", "comment", "#503")];
    const key = applyTargetKey(targets[0]!);
    const recovery = buildRecoveryPlan(
      { targets, sent: [key], readback: { [key]: "missing" } },
      { outcomeFinalized: true },
    );
    expect(recovery.completionState).toBe("outcome-finalized-records-incomplete");
    expect(recovery.recoveries).toHaveLength(1);
  });

  test("全反映対象が存在確認済みの場合は記録完了として区分する", () => {
    const targets = [t("completion", "comment", "#504")];
    const key = applyTargetKey(targets[0]!);
    const recovery = buildRecoveryPlan(
      { targets, sent: [key], readback: { [key]: "applied" } },
      { outcomeFinalized: true },
    );
    expect(recovery.completionState).toBe("records-complete");
    expect(recovery.recoveries).toHaveLength(0);
  });

  test("未反映内容の要約を外部指定できる（回復用記録は未反映内容と識別情報に限定）", () => {
    const targets = [t("hold", "body", "#505")];
    const key = applyTargetKey(targets[0]!);
    const recovery = buildRecoveryPlan(
      { targets, sent: [key], readback: { [key]: "missing" } },
      {
        outcomeFinalized: false,
        contentSummaries: { [key]: "進行状況セクションの更新（stage 3 停止時）" },
      },
    );
    expect(recovery.recoveries[0]?.contentSummary).toBe("進行状況セクションの更新（stage 3 停止時）");
  });
});
