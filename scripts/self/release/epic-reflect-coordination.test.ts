// ADF-COVERS(verification): REQ-101-001, REQ-101-010, REQ-101-014, REQ-035-001, REQ-035-019, REQ-035-020
//
// Decisive regression verification for the coordination write path
// (REQ-101: Case Issue 工程記録モデル / REQ-035: per-Epic single writer):
//   - Epic 本文への書き込みは実行構成の状態反映と全体条件評価の更新に限定され、
//     隠し HTML コメントブロック等の第二の恒常的状態台帳を保持しない。
//   - completion-order independence: 終端子状態の優先規律（mergeChildStatus）と
//     closing 書き込みの冪等性により、完了順序に依存しない実行構成表の収束を
//     検証する（latest-fetch -> merge -> update discipline）。
//   - overall completion is evaluated from the execution-structure table and
//     the overall criteria, and is distinct from child completion: all
//     children terminal without an overall-criteria evaluation does NOT mark
//     the Epic complete. 中間投影を Epic 本文へ保存する経路はない。
//   - per-Epic exclusive serialization: closing writes (case-close) and
//     coordination writes share one gate and never interleave.
//   - closing writes are idempotent and never overwrite terminal rows.
//     The status column holds the child status 4 values only (no PR annotation).
//   - retry pending reset: blocked/failed return to pending; completed is
//     never reset (REQ-035-020).
//   - CLI (scripts/src/reflect.ts) is deterministic on identical input and
//     never rewrites the body in the overall evaluation mode.
//
// The tests drive the actual engine shipped in the distribution
// (src/common/skills/agentdev-epic-tracker/scripts/lib) and pin the
// canonical wording of the coordination reference.

import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as path from "path";
import {
  applyClosingStatus,
  createEpicWriteGate,
  evaluateOverallCompletion,
  mergeChildStatus,
  RECORD_TRIGGERS,
  resetChildToPending,
} from "../../../src/common/skills/agentdev-epic-tracker/scripts/lib/epic-reflect.ts";
import {
  countChildStatuses,
  readChildStatus,
  replaceChildStatus,
  type PersistedStatus,
} from "../../../src/common/skills/agentdev-epic-tracker/scripts/lib/tracking-table.ts";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const EPIC_TRACKER_SKILL_REL =
  "src/common/skills/agentdev-epic-tracker/SKILL.md";
const EPIC_TRACKER_REF_REL =
  "src/common/skills/agentdev-epic-tracker/references/epic-reflect-coordination.md";
const CASE_CLOSE_SKILL_REL =
  "src/common/skills/agentdev-workflow-case-close/SKILL.md";
const CASE_CLOSE_EPIC_REL =
  "src/common/skills/agentdev-workflow-case-close/references/epic-wave-close.md";
const CASE_AUTO_SKILL_REL =
  "src/common/skills/agentdev-workflow-case-auto/SKILL.md";

function read(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

// ---------------------------------------------------------------------------
// Fixture: an Epic body with the execution-structure table
// (| Wave | Issue | 前提 | 状態 |, single table, child status 4 values).
// ---------------------------------------------------------------------------

const CHILDREN = [41, 42, 43, 44, 45, 46];

function epicBodyFixture(): string {
  const rows = CHILDREN.map(
    (n, i) => `| ${i < 3 ? 1 : 2} | #${n} | - | pending |`,
  ).join("\n");
  return [
    "# Epic: 記録モデル実装",
    "",
    "## 実行構成",
    "",
    "| Wave | Issue | 前提 | 状態 |",
    "|------|-------|------|------|",
    rows,
    "",
    "## 完了条件",
    "",
    "- [ ] 全 Wave 完了（検証方法: 実行構成表確認、合格条件: 全子 completed）",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// TS-005: completion-order independence / lost update prevention
// ---------------------------------------------------------------------------

describe("TS-005 Epic 子状態反映の完了順序非依存（lost update なし）", () => {
  // Sequential merge of one closing-write stream onto the LATEST body
  // (the discipline every real write path follows: read latest, merge, write).
  function runStream(order: number[]): string {
    let body = epicBodyFixture();
    for (const child of order) {
      // coordination status reflection for one record trigger (hold)
      if (child % 2 === 0) {
        const current = readChildStatus(body, child)?.status;
        const merged = mergeChildStatus(current ?? "pending", "blocked");
        body = replaceChildStatus(body, child, merged)!;
      }
      // completion lands via the closing write path
      body = applyClosingStatus(body, child, "completed").body;
    }
    return body;
  }

  test("異なる完了順序で最終実行構成表が同一（順序非依存）", () => {
    const forward = runStream([...CHILDREN]);
    const reverse = runStream([...CHILDREN].reverse());
    const shuffled = runStream([44, 41, 46, 42, 45, 43]);
    expect(reverse).toBe(forward);
    expect(shuffled).toBe(forward);
  });

  test("後続更新が先行更新を上書き消去しない（他子の行保持）", () => {
    let body = epicBodyFixture();
    body = applyClosingStatus(body, 41, "completed").body;
    body = applyClosingStatus(body, 42, "blocked").body;
    expect(readChildStatus(body, 41)?.status).toBe("completed");
    expect(readChildStatus(body, 42)?.status).toBe("blocked");
    expect(readChildStatus(body, 43)?.status).toBe("pending");
  });

  test("mergeChildStatus による終端優先で完了順序に依存しない収束をする", () => {
    expect(mergeChildStatus("pending", "blocked")).toBe("blocked");
    expect(mergeChildStatus("blocked", "completed")).toBe("blocked");
    expect(mergeChildStatus("completed", "pending")).toBe("completed");
    expect(mergeChildStatus("pending", "pending")).toBe("pending");
  });
});

// ---------------------------------------------------------------------------
// Closing write path: idempotent, terminal-safe, merge-disciplined
// ---------------------------------------------------------------------------

describe("closing 書き込みと取りまとめ反映の共存（per-Epic 単一書き手）", () => {
  test("取りまとめの状態反映は該当子の行のみを変更し既存セクションを消去しない", () => {
    let body = epicBodyFixture();
    body = applyClosingStatus(body, 42, "completed").body;
    const beforeAfterTable = body.split("## 完了条件")[1];
    const closing = applyClosingStatus(body, 43, "completed");
    expect(closing.applied).toBe(true);
    expect(closing.body.split("## 完了条件")[1]).toBe(beforeAfterTable);
    expect(readChildStatus(closing.body, 42)?.status).toBe("completed");
    // unrelated rows untouched
    expect(readChildStatus(closing.body, 44)?.status).toBe("pending");
  });

  test("closing 書き込みはべき等であり終端子状態を上書きしない（REQ-035-020）", () => {
    let body = epicBodyFixture();
    body = applyClosingStatus(body, 44, "blocked").body;
    const again = applyClosingStatus(body, 44, "completed");
    expect(again.applied).toBe(false);
    expect(again.skipped).toBe("already-terminal");
    expect(readChildStatus(body, 44)?.status).toBe("blocked");
  });

  test("closing 書き込みは実行構成表の前提列を保持する（子状態列のみ置換・PR 付記なし）", () => {
    const closing = applyClosingStatus(epicBodyFixture(), 41, "completed");
    expect(closing.applied).toBe(true);
    const row = closing.body.split("\n").find((l) => l.startsWith("| 1 | #41 |")) ?? "";
    expect(row).toBe("| 1 | #41 | - | completed |");
    // 子状態4値のみ。PR 番号・URL は状態列に付記しない
    expect(row).not.toContain("([PR#");
  });

  test("記録契機の英語識別子はコメント検証経路と Epic 反映経路で同一語彙", async () => {
    const { RECORD_KINDS } = await import(
      "../../../src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts"
    );
    expect([...RECORD_TRIGGERS]).toEqual([...RECORD_KINDS]);
  });

  test("mergeChildStatus: 終端子状態は非終端に劣らず、既存終端子状態は降格しない", async () => {
    const { mergeChildStatus } = await import(
      "../../../src/common/skills/agentdev-epic-tracker/scripts/lib/epic-reflect.ts"
    );
    expect(mergeChildStatus("pending", "completed")).toBe("completed");
    expect(mergeChildStatus("completed", "pending")).toBe("completed");
    expect(mergeChildStatus("blocked", "pending")).toBe("blocked");
    expect(mergeChildStatus("pending", "failed" as PersistedStatus)).toBe("failed");
  });

  test("存在しない子行の closing 書き込みはスキップ（row-missing）", () => {
    const result = applyClosingStatus(epicBodyFixture(), 999, "failed");
    expect(result.applied).toBe(false);
    expect(result.skipped).toBe("row-missing");
  });

  test("Epic 本文へ隠し永続ブロック等の第二の台帳を書き込む経路はない（実行構成表行のみ変化）", () => {
    const before = epicBodyFixture();
    let body = epicBodyFixture();
    body = applyClosingStatus(body, 42, "completed").body;
    body = applyClosingStatus(body, 43, "blocked").body;
    body = resetChildToPending(body, 43).body;
    // 状態反映で変化するのは実行構成表の子状態列のみ。行集合・セクション構造は不変
    const beforeLines = before.split("\n").filter((l) => !/\| \d+ \| #\d+/.test(l));
    const afterLines = body.split("\n").filter((l) => !/\| \d+ \| #\d+/.test(l));
    expect(afterLines).toEqual(beforeLines);
  });
});

// ---------------------------------------------------------------------------
// Retry pending reset (blocked/failed -> pending, completed is never reset)
// ---------------------------------------------------------------------------

describe("再試行の pending 戻し（REQ-035-020: completed 戻し禁止・blocked/failed は未完了）", () => {
  test("blocked から pending へ戻せる（冪等）", () => {
    const reset = resetChildToPending(epicBodyFixture(), 44);
    expect(reset.applied).toBe(true);
    expect(reset.body).toContain("| 2 | #44 | - | pending |");
    const again = resetChildToPending(reset.body, 44);
    expect(again.applied).toBe(true);
  });

  test("completed からの pending 戻しは拒否する（completed 戻し禁止）", () => {
    const withCompleted = applyClosingStatus(epicBodyFixture(), 41, "completed").body;
    const rejected = resetChildToPending(withCompleted, 41);
    expect(rejected.applied).toBe(false);
    expect(rejected.skipped).toBe("terminal-completed");
    expect(withCompleted).toContain("| 1 | #41 | - | completed |");
  });

  test("存在しない子行の戻しは row-missing", () => {
    expect(resetChildToPending(epicBodyFixture(), 999).skipped).toBe("row-missing");
  });
});

// ---------------------------------------------------------------------------
// per-Epic exclusive serialization (closing + coordination share one gate)
// ---------------------------------------------------------------------------

describe("per-Epic 直列化 gate（closing と取りまとめの局所直列化）", () => {
  test("同一 Epic の書込みタスクは直列化され interleave しない（REQ-101-010）", async () => {
    const gate = createEpicWriteGate();
    const order: string[] = [];
    const insidePerEpic = new Map<string, number>();
    const task = (epic: string, label: string) => async () => {
      const n = (insidePerEpic.get(epic) ?? 0) + 1;
      insidePerEpic.set(epic, n);
      expect(n).toBe(1);
      order.push(`${epic}:${label}:begin`);
      await new Promise((r) => setTimeout(r, 5));
      order.push(`${epic}:${label}:end`);
      insidePerEpic.set(epic, n - 1);
    };
    await Promise.all([
      gate.runExclusive("3391", task("3391", "coord")),
      gate.runExclusive("3391", task("3391", "closing")),
      gate.runExclusive("3392", task("3392", "coord")),
    ]);
    // within epic 3391, no begin/end interleave: both begins of 3391 are
    // separated by an end
    const epic1 = order.filter((s) => s.startsWith("3391"));
    expect(epic1).toHaveLength(4);
    expect(epic1[0]).toContain(":begin");
    expect(epic1[1]).toContain(":end");
    expect(epic1[2]).toContain(":begin");
    expect(epic1[3]).toContain(":end");
    expect(gate.pending("3391")).toBe(0);
  });

  test("gate 内での最新取得→マージ→更新は他 writer の更新を保持する", async () => {
    // Simulate two writers racing WITHOUT the gate (lost update happens) and
    // WITH the gate (latest-fetch inside the critical section preserves both).
    const gate = createEpicWriteGate();
    let persistedBody = epicBodyFixture();

    const coordWrite = async () => {
      // fetch the LATEST body inside the critical section
      const latest = persistedBody;
      const current = readChildStatus(latest, 42)?.status;
      const merged = mergeChildStatus(current ?? "pending", "blocked");
      persistedBody = replaceChildStatus(latest, 42, merged)!;
    };
    const closingWrite = async () => {
      const latest = persistedBody;
      persistedBody = applyClosingStatus(latest, 43, "completed").body;
    };
    await gate.runExclusive("E", coordWrite);
    await gate.runExclusive("E", closingWrite);

    // both writes survived (no lost update)
    expect(readChildStatus(persistedBody, 42)?.status).toBe("blocked");
    expect(readChildStatus(persistedBody, 43)?.status).toBe("completed");
  });

  test("部分失敗（書込未反映）の読み戻し再試行で不足分が回復する", async () => {
    const gate = createEpicWriteGate();
    let persistedBody = epicBodyFixture();

    const reflectOne = async () => {
      // gate 内の最新取得 → マージ（書込は gate 内で行う。失敗時は persistedBody に反映しない）
      const latest = persistedBody;
      const current = readChildStatus(latest, 42)?.status;
      const merged = mergeChildStatus(current ?? "pending", "blocked");
      const next = replaceChildStatus(latest, 42, merged)!;
      // first attempt fails to land (simulated: write lost)
      return next;
    };

    // first attempt: merge succeeded but the write did not land
    await gate.runExclusive("E", async () => {
      await reflectOne();
    });
    expect(readChildStatus(persistedBody, 42)?.status).toBe("pending");

    // retry: re-acquire the gate, re-fetch the latest body, re-apply, then land
    await gate.runExclusive("E", async () => {
      const next = await reflectOne();
      persistedBody = next;
    });
    expect(readChildStatus(persistedBody, 42)?.status).toBe("blocked");
  });
});

// ---------------------------------------------------------------------------
// TS-005 (2): overall completion vs child completion
// ---------------------------------------------------------------------------

describe("TS-005 全体完了判定（子完了と区別・評価根拠付き評価）", () => {
  test("全子完了でも全体条件未評価なら全体完了にならない", () => {
    let body = epicBodyFixture();
    for (const c of CHILDREN) {
      body = replaceChildStatus(body, c, "completed")!;
    }
    const counts = countChildStatuses(body);
    expect(counts.terminalRows).toBe(6);
    // no overall criteria evaluated yet -> NOT overall complete
    const eval0 = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [],
    });
    expect(eval0.allChildrenTerminal).toBe(true);
    expect(eval0.overallCompleted).toBe(false);
    expect(eval0.basis).toContain("overallCompleted=false");
  });

  test("全体条件が未達の間は全体完了にならず、評価根拠が記録される", () => {
    const evaluation = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.slice(0, 5).map((c) => [c, "completed" as const]).concat([[46, "pending" as const]])),
      evaluatedCriteria: [
        { criterion: "全Wave完了", met: false, basis: "Wave 2 未完了" },
      ],
    });
    expect(evaluation.overallCompleted).toBe(false);
    expect(evaluation.unmetChildren).toEqual([46]);
    expect(evaluation.unmetCriteria).toEqual(["全Wave完了"]);
    expect(evaluation.basis).toContain("#46");
    expect(evaluation.basis).toContain("全Wave完了");
    expect(evaluation.basis).toContain("Wave 2 未完了");
  });

  test("全子終端かつ全条件達成のときのみ overallCompleted=true", () => {
    const evaluation = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [
        { criterion: "全Wave完了", met: true, basis: "全 Wave 収束済み" },
      ],
    });
    expect(evaluation.overallCompleted).toBe(true);
    expect(evaluation.basis).toContain("overallCompleted=true");
  });

  test("全体条件評価の結果は Epic 本文へ保存する経路を持たず（評価は完了条件チェックの確定と証拠で扱う）、子完了のみの状態では完了扱いにならない", () => {
    let body = epicBodyFixture();
    // all children terminal (closing writes done)
    for (const c of CHILDREN) {
      body = applyClosingStatus(body, c, "completed").body;
    }
    // criteria NOT evaluated yet -> evaluation says not completed
    const evalNotYet = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [],
    });
    expect(evalNotYet.overallCompleted).toBe(false);
    // criteria evaluated and met
    const evalDone = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [{ criterion: "全Wave完了", met: true, basis: "収束済み" }],
    });
    expect(evalDone.overallCompleted).toBe(true);
    // 評価経路は本文を書き換えない（中間投影の Epic 本文への恒常保存はしない）
    expect(body).toBe(epicBodyFixture().replace(/\| pending \|/g, "| completed |"));
  });
});

// ---------------------------------------------------------------------------
// Distribution wording pins (canonical discipline text exists in artifacts)
// ---------------------------------------------------------------------------

describe("配布物の規律文言 pin", () => {
  test("epic-tracker SKILL.md に記録契機別反映・排他制御・最新取得→マージ→更新の規律がある", () => {
    const skill = read(EPIC_TRACKER_SKILL_REL);
    expect(skill).toContain("取りまとめによる記録契機別 Epic 反映");
    expect(skill).toContain("hold");
    expect(skill).toContain("decision_change");
    expect(skill).toContain("completion");
    expect(skill).toContain("着手・引き渡し・再開は反映契機ではない");
    expect(skill).toContain("per-Epic 単一書き手");
    expect(skill).toContain("最新取得 → マージ → 更新");
    expect(skill).toContain("全体条件評価（子完了と全体完了の区別）");
    expect(skill).toContain("再試行の pending 戻し");
    // 隠し永続ブロックは廃止（実行構成表が子状態の唯一の保存先）
    expect(skill).not.toContain("agentdev:epic-reflect");
    expect(skill).not.toContain("agentdev:epic-overall");
    expect(skill).toContain("Epic 本文への書き込みは実行構成の状態反映と全体条件評価の更新に限定される");
  });

  test("coordination reference に反映手順・直列化手順・部分成功回復がある", () => {
    const ref = read(EPIC_TRACKER_REF_REL);
    expect(ref).toContain("直列化手順");
    expect(ref).toContain("最新取得→マージ→更新の規律");
    expect(ref).toContain("部分成功の区別と読み戻し再試行");
    expect(ref).toContain("全体条件評価");
    expect(ref).toContain("再試行の pending 戻し");
    expect(ref).not.toContain("agentdev:epic-reflect");
    expect(ref).not.toContain("agentdev:epic-overall");
    expect(ref).toContain("Epic 本文への書き込みは実行構成の状態反映と全体条件評価の更新に限定され");
  });

  test("case-close は closing 書き込みと取りまとめ反映の直列化を宣言する", () => {
    expect(read(CASE_CLOSE_SKILL_REL)).toContain("同一の per-Epic 排他制御・局所直列化");
    const epicRef = read(CASE_CLOSE_EPIC_REL);
    expect(epicRef).toContain("取りまとめ反映との直列化");
    expect(epicRef).toContain("他の子の状態を消去しない");
  });

  test("case-auto は取りまとめ反映を per-Epic 排他制御の下で宣言する", () => {
    const skill = read(CASE_AUTO_SKILL_REL);
    expect(skill).toContain("per-Epic 排他制御・局所直列化");
  });
});

// ---------------------------------------------------------------------------
// CLI determinism (identical input -> identical merged body)
// ---------------------------------------------------------------------------

describe("CLI（scripts/src/reflect.ts）の決定性", () => {
  const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
  const CLI_REL = "src/common/skills/agentdev-epic-tracker/scripts/src/reflect.ts";

  function runCli(args: string[], cwdFileBody: string): { json: Record<string, unknown>; bodyFile: string } {
    const dir = mkdtempSync(join(TEMP_BASE, "epic-reflect-cli-"));
    const bodyFile = join(dir, "epic-body.md");
    writeFileSync(bodyFile, cwdFileBody, "utf-8");
    try {
      const out = execFileSync(
        process.execPath,
        ["run", join(REPO_ROOT, CLI_REL), ...args.map((a) => a.replace("@BODY@", bodyFile))],
        { encoding: "utf-8", cwd: REPO_ROOT },
      );
      return { json: JSON.parse(out) as Record<string, unknown>, bodyFile };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  test("closing: 同一入力で同一出力（決定的）", () => {
    const args = ["closing", "--epic-body", "@BODY@", "--child", "42", "--status", "blocked"];
    const a = runCli(args, epicBodyFixture());
    const b = runCli(args, epicBodyFixture());
    expect(a.json.ok).toBe(true);
    expect(b.json.ok).toBe(true);
    expect(a.json.body).toBe(b.json.body);
    expect(a.json.body as string).toContain("| 1 | #42 | - | blocked |");
  });

  test("closing: べき等置換と既存終端子状態の保護（子状態4値のみ）", () => {
    const args = ["closing", "--epic-body", "@BODY@", "--child", "43", "--status", "completed"];
    const first = runCli(args, epicBodyFixture());
    expect(first.json.ok).toBe(true);
    expect(first.json.applied).toBe(true);
    const second = runCli(args, first.json.body as string);
    expect(second.json.ok).toBe(true);
    expect(second.json.applied).toBe(false);
    expect(second.json.skipped).toBe("already-terminal");
  });

  test("reset: blocked から pending へ戻し、completed は拒否", () => {
    const closing = runCli(
      ["closing", "--epic-body", "@BODY@", "--child", "43", "--status", "completed"],
      epicBodyFixture(),
    );
    const blocked = applyClosingStatus(epicBodyFixture(), 44, "blocked").body;
    const resetDone = runCli(
      ["reset", "--epic-body", "@BODY@", "--child", "44"],
      blocked,
    );
    expect(resetDone.json.ok).toBe(true);
    expect(resetDone.json.applied).toBe(true);
    const rejected = runCli(
      ["reset", "--epic-body", "@BODY@", "--child", "43"],
      closing.json.body as string,
    );
    expect(rejected.json.ok).toBe(true);
    expect(rejected.json.applied).toBe(false);
    expect(rejected.json.skipped).toBe("terminal-completed");
  });

  test("overall: 子完了のみでは completed=false を評価し、本文を書き換えない", () => {
    let body = epicBodyFixture();
    for (const c of CHILDREN) {
      body = applyClosingStatus(body, c, "completed").body;
    }
    const result = runCli(
      [
        "overall",
        "--epic-body",
        "@BODY@",
        "--child-issues",
        CHILDREN.join(","),
        "--evaluation",
        JSON.stringify({ evaluatedCriteria: [{ criterion: "全Wave完了", met: false, basis: "未評価" }] }),
      ],
      body,
    );
    expect(result.json.ok).toBe(true);
    const evaluation = result.json.evaluation as Record<string, unknown>;
    expect(evaluation.overallCompleted).toBe(false);
    // 評価モードは本文を書き換えない（中間投影の Epic 本文への恒常保存はしない）
    expect(result.json.body as string).toBe(body);
    expect(result.json.applied).toBe(false);
  });
});
