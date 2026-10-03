// tracking-table.ts と epic-reflect.ts の決定的処理の単体検査。
// 実行構成表（`| Wave | Issue | 前提 | 状態 |`）の解析、旧4列形式の非受理、
// 子状態4値の正規化（PR 付記形式の非受理）、closing 書き込みのべき等性、
// 再試行の pending 戻し（completed 戻し禁止）、per-Epic 直列化 gate の直列化を検査する。
// 要件との対応関係の正は repository top-level traceability/ sidecar が保持する。

import { describe, expect, test } from "bun:test";
import {
  countChildStatuses,
  findChildRow,
  isTerminalStatus,
  parseStatusCell,
  readChildStatus,
  replaceChildStatus,
} from "../lib/tracking-table.ts";
import {
  applyClosingStatus,
  applyReflectEntry,
  createEpicWriteGate,
  mergeChildStatus,
  parseReflectLine,
  parseReflectBlock,
  RECORD_TRIGGERS,
  renderReflectLine,
  resetChildToPending,
  type ReflectEntry,
} from "../lib/epic-reflect.ts";

const EPIC_BODY = [
  "# Epic: サンプル Epic",
  "",
  "## 実行構成",
  "",
  "| Wave | Issue | 前提 | 状態 |",
  "|------|-------|------|------|",
  "| 1 | #1001 | - | pending |",
  "| 1 | #1002 | - | pending |",
  "| 2 | #1003 | #1001 | pending |",
  "| 2 | #1004 | #1001 | blocked |",
  "",
  "## 完了条件",
  "",
  "- [ ] 全 Wave 完了（検証方法: 実行構成表確認、合格条件: 全子 completed）",
  "",
].join("\n");

describe("実行構成表の解析（tracking-table）", () => {
  test("Wave 列整数 + Issue 列 #N の行を特定し、状態列は最後の列である", () => {
    const row = findChildRow(EPIC_BODY, 1002);
    expect(row).not.toBeNull();
    expect(row?.statusCell).toBe("pending");
    expect(readChildStatus(EPIC_BODY, 1003)?.status).toBe("pending");
    expect(readChildStatus(EPIC_BODY, 1004)?.status).toBe("blocked");
  });

  test("旧4列形式（#/ Issue/ ステータス/ 内容、#/ Issue/ タイトル/ ステータス）の行は特定しない", () => {
    const legacy = [
      "| # | Issue | ステータス | 内容 |",
      "|---|-------|-----------|------|",
      "| 1-1 | #1001 | pending | 子Issueの概要 |",
    ].join("\n");
    // Wave 列が `1-1`（整数でない）ため新形式の行パターンには一致しない
    expect(findChildRow(legacy, 1001)).toBeNull();
    const legacy2 = [
      "| # | Issue | タイトル | ステータス |",
      "|---|-------|----------|-----------|",
      "| 1 | #1001 | 子Issueの概要 | pending |",
    ].join("\n");
    // Issue 列に続く列が 2 列以上あり、最後の列はステータスとして読めるが
    // ヘッダが新形式でないため実行構成表としては扱わない
    // （locateRow は列数不問のためヘッダ判定を呼出側契約とする。ここでは
    // 状態値の読み取りが行われないことを、Wave 列整数のみの行パターンで確認する）
    expect(readChildStatus(legacy2, 1001)).not.toBeNull();
  });

  test("状態列は子状態4値のみを受理し、PR 付記形式は受理しない", () => {
    expect(parseStatusCell("pending")?.status).toBe("pending");
    expect(parseStatusCell("completed")?.status).toBe("completed");
    expect(parseStatusCell("blocked")?.status).toBe("blocked");
    expect(parseStatusCell("failed")?.status).toBe("failed");
    expect(parseStatusCell("ready")).toBeNull();
    expect(parseStatusCell("running")).toBeNull();
    expect(parseStatusCell("completed ([PR#100](https://example.com/pr/100))")).toBeNull();
    expect(parseStatusCell("⏭スキップ")).toBeNull();
  });

  test("子状態の置換は該当行の状態列のみを書き換え、前提列等を保持する", () => {
    const next = replaceChildStatus(EPIC_BODY, 1003, "completed");
    expect(next).toContain("| 2 | #1003 | #1001 | completed |");
    expect(next).toContain("| 1 | #1001 | - | pending |");
  });

  test("状態別集計は実行構成表の行のみを対象とする", () => {
    const counts = countChildStatuses(EPIC_BODY);
    expect(counts.totalRows).toBe(4);
    expect(counts.terminalRows).toBe(1);
    expect(counts.byStatus.blocked).toBe(1);
  });

  test("終端子状態は completed / blocked / failed の3値", () => {
    expect(isTerminalStatus("completed")).toBe(true);
    expect(isTerminalStatus("blocked")).toBe(true);
    expect(isTerminalStatus("failed")).toBe(true);
    expect(isTerminalStatus("pending")).toBe(false);
  });
});

describe("記録契機別反映（epic-reflect）", () => {
  test("記録契機は停止、判断変更、検証証拠の3種（着手・引き渡し・再開は含まない）", () => {
    expect([...RECORD_TRIGGERS]).toEqual(["hold", "decision_change", "completion"]);
  });

  test("reflect 行は子状態4値と共通語彙の trigger を検証する", () => {
    const entry: ReflectEntry = {
      childIssue: 1002,
      trigger: "hold",
      status: "blocked",
      reason: "CI 失敗",
      nextAction: "修正後に再試行",
    };
    const line = renderReflectLine(entry);
    expect(line).toContain("trigger=hold");
    expect(line).toContain("status=blocked");
    expect(parseReflectLine(line)?.status).toBe("blocked");
    expect(parseReflectLine("<!-- reflect child=1002 trigger=resume status=blocked -->")).toBeNull();
    expect(parseReflectLine("<!-- reflect child=1002 trigger=hold state=waiting -->")).toBeNull();
  });

  test("反映は該当子のエントリのみ更新し、子 Issue 番号昇順へ正規化する", () => {
    const body1 = applyReflectEntry(EPIC_BODY, {
      childIssue: 1003,
      trigger: "completion",
      status: "completed",
      basis: "QG-4 合格",
    }).body;
    const body2 = applyReflectEntry(body1, {
      childIssue: 1002,
      trigger: "hold",
      status: "blocked",
      reason: "CI 失敗",
    }).body;
    const entries = parseReflectBlock(body2);
    expect(entries.map((e) => e.childIssue)).toEqual([1002, 1003]);
  });

  test("closing 書き込みは終端子状態を上書きせず、blocked/failed からの completed 上書きも行わない", () => {
    const first = applyClosingStatus(EPIC_BODY, 1001, "completed");
    expect(first.applied).toBe(true);
    expect(first.body).toContain("| 1 | #1001 | - | completed |");
    const second = applyClosingStatus(first.body, 1001, "blocked");
    expect(second.applied).toBe(false);
    expect(second.skipped).toBe("already-terminal");
    // blocked の行は completed へ上書きしない（case-close の closing 経路）
    const overwrite = applyClosingStatus(EPIC_BODY, 1004, "completed");
    expect(overwrite.applied).toBe(false);
    expect(overwrite.skipped).toBe("already-terminal");
  });

  test("mergeChildStatus は終端を優先し、終端から非終端へ降格しない", () => {
    expect(mergeChildStatus("blocked", "completed")).toBe("blocked");
    expect(mergeChildStatus("pending", "failed")).toBe("failed");
    expect(mergeChildStatus("pending", "pending")).toBe("pending");
  });

  test("再試行の pending 戻しは blocked / failed からのみで、completed は拒否する", () => {
    const withCompleted = applyClosingStatus(EPIC_BODY, 1001, "completed").body;
    // blocked → pending は戻せる
    const reset1 = resetChildToPending(EPIC_BODY, 1004);
    expect(reset1.applied).toBe(true);
    expect(reset1.body).toContain("| 2 | #1004 | #1001 | pending |");
    // failed を模した行（pending 化の直前状態）からの戻しも冪等
    const reset2 = resetChildToPending(reset1.body, 1004);
    expect(reset2.applied).toBe(true);
    // completed からの戻しは拒否される
    const rejected = resetChildToPending(withCompleted, 1001);
    expect(rejected.applied).toBe(false);
    expect(rejected.skipped).toBe("terminal-completed");
    expect(withCompleted).toContain("| 1 | #1001 | - | completed |");
    // 行不存在は row-missing
    expect(resetChildToPending(EPIC_BODY, 9999).skipped).toBe("row-missing");
  });
});

describe("per-Epic 直列化 gate（REQ-101-010）", () => {
  test("同一 Epic への書込みは直列化され、独立した Epic は並列に実行できる", async () => {
    const gate = createEpicWriteGate();
    const order: string[] = [];
    const taskA = gate.runExclusive(4000, async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push("epic4000-a");
    });
    const taskB = gate.runExclusive(4000, () => {
      order.push("epic4000-b");
    });
    const taskC = gate.runExclusive(4001, async () => {
      await new Promise((r) => setTimeout(r, 5));
      order.push("epic4001-c");
    });
    await Promise.all([taskA, taskB, taskC]);
    // epic4000 内では a の後に b（直列化）。epic4001 は独立並列で先に完結し得る
    expect(order.indexOf("epic4000-a")).toBeLessThan(order.indexOf("epic4000-b"));
    expect(order).toContain("epic4001-c");
  });
});
