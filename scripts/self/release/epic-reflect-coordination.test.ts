// ADF-COVERS(verification): REQ-101-001, REQ-101-014, REQ-035-001
//
// Decisive regression verification for the coordination reflect write path
// (REQ-101: Case Issue 工程記録モデル / REQ-035: per-Epic single writer):
//   - TS-005 (1) completion-order independence: parallel child completion in
//     different orders converges to the same Epic aggregate (lost update
//     free, latest-fetch -> merge -> update discipline).
//   - TS-005 (2) overall completion is recorded with its evaluation basis and
//     is distinct from child completion: all children terminal without an
//     overall-criteria evaluation does NOT mark the Epic complete.
//   - per-Epic exclusive serialization: closing writes (case-close) and
//     coordination writes share one gate and never interleave.
//   - closing writes are idempotent and never overwrite terminal rows.
//   - CLI (scripts/src/reflect.ts) is deterministic on identical input.
//
// The tests drive the actual reflect engine shipped in the distribution
// (src/common/skills/agentdev-epic-tracker/scripts/lib) and pin the
// canonical wording of the coordination reference.

import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as path from "path";
import {
  applyClosingStatus,
  applyReflectEntry,
  createEpicWriteGate,
  evaluateOverallCompletion,
  parseReflectBlock,
  RECORD_TRIGGERS,
  REFLECT_BLOCK_BEGIN,
  renderOverallLine,
  upsertOverallEvaluation,
  type ReflectEntry,
} from "../../../src/common/skills/agentdev-epic-tracker/scripts/lib/epic-reflect.ts";
import {
  countChildStatuses,
  readChildStatus,
  replaceChildStatus,
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
// Fixture: an Epic body with the canonical 4-column tracking table.
// ---------------------------------------------------------------------------

const CHILDREN = [41, 42, 43, 44, 45, 46];

function epicBodyFixture(): string {
  const rows = CHILDREN.map(
    (n, i) => `| 1-${i + 1} | #${n} | pending | 子Issue ${n} の概要 |`,
  ).join("\n");
  return [
    "# Epic: 記録モデル実装",
    "",
    "## Epicステータス",
    "",
    "| # | Issue | ステータス | 内容 |",
    "|---|-------|-----------|------|",
    rows,
    "",
    "## 完了条件",
    "",
    "- [ ] 全 Wave 完了",
    "",
  ].join("\n");
}

function entry(partial: Partial<ReflectEntry> & { childIssue: number }): ReflectEntry {
  return {
    trigger: "completion",
    phase: "case-run",
    state: "ended",
    endedKind: "completed",
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// TS-005 (1): completion-order independence / lost update prevention
// ---------------------------------------------------------------------------

describe("TS-005 Epic 子状態集約の完了順序非依存（lost update なし）", () => {
  // Sequential merge of one coordination report stream onto the LATEST body
  // (the discipline every real write path follows: read latest, merge, write).
  function runStream(order: number[]): string {
    let body = epicBodyFixture();
    for (const child of order) {
      // coordination reflect write for one record trigger
      body = applyReflectEntry(
        body,
        child % 2 === 0
          ? entry({ childIssue: child, trigger: "hold", state: "waiting", waitingReason: `CI 失敗 #${child}` })
          : entry({ childIssue: child, trigger: "start", state: "running" }),
      ).body;
      // another trigger for the same child (hold then resume / start then completion)
      body = applyReflectEntry(
        body,
        child % 2 === 0
          ? entry({ childIssue: child, trigger: "resume", state: "running" })
          : entry({ childIssue: child, trigger: "completion", state: "ended", endedKind: "completed", prNumber: 900 + child }),
      ).body;
    }
    return body;
  }

  test("異なる完了順序で最終集約が同一（順序非依存）", () => {
    const forward = runStream([...CHILDREN]);
    const reverse = runStream([...CHILDREN].reverse());
    const shuffled = runStream([44, 41, 46, 42, 45, 43]);
    expect(reverse).toBe(forward);
    expect(shuffled).toBe(forward);
  });

  test("後続更新が先行更新を上書き消去しない（他子のエントリ保持）", () => {
    let body = epicBodyFixture();
    body = applyReflectEntry(body, entry({ childIssue: 41, trigger: "completion", state: "ended", endedKind: "completed", prNumber: 941 })).body;
    body = applyReflectEntry(body, entry({ childIssue: 42, trigger: "hold", state: "waiting", waitingReason: "判断待ち" })).body;
    const entries = parseReflectBlock(body);
    expect(entries).toHaveLength(2);
    const e41 = entries.find((e) => e.childIssue === 41);
    const e42 = entries.find((e) => e.childIssue === 42);
    expect(e41?.state).toBe("ended");
    expect(e41?.prNumber).toBe(941);
    expect(e42?.state).toBe("waiting");
    expect(e42?.waitingReason).toBe("判断待ち");
  });

  test("集約エントリは子Issue番号昇順へ正規化される", () => {
    let body = epicBodyFixture();
    body = applyReflectEntry(body, entry({ childIssue: 45, trigger: "start", state: "running" })).body;
    body = applyReflectEntry(body, entry({ childIssue: 42, trigger: "start", state: "running" })).body;
    body = applyReflectEntry(body, entry({ childIssue: 44, trigger: "start", state: "running" })).body;
    const entries = parseReflectBlock(body);
    expect(entries.map((e) => e.childIssue)).toEqual([42, 44, 45]);
  });

  test("同一子の再反映は置換であり、最古の本文を書き戻さない", () => {
    let body = epicBodyFixture();
    body = applyReflectEntry(body, entry({ childIssue: 43, trigger: "hold", state: "waiting", waitingReason: "旧理由" })).body;
    body = applyReflectEntry(body, entry({ childIssue: 43, trigger: "resume", state: "running" })).body;
    const entries = parseReflectBlock(body);
    expect(entries).toHaveLength(1);
    expect(entries[0].state).toBe("running");
  });
});

// ---------------------------------------------------------------------------
// Closing write path: idempotent, terminal-safe, merge-disciplined
// ---------------------------------------------------------------------------

describe("closing 書き込みと取りまとめ反映の共存（per-Epic 単一書き手）", () => {
  test("closing 書き込みは該当子の行のみを変更し集約セクションを消去しない", () => {
    let body = epicBodyFixture();
    body = applyReflectEntry(body, entry({ childIssue: 42, trigger: "completion", state: "ended", endedKind: "completed", prNumber: 942 })).body;
    const before = parseReflectBlock(body);
    const closing = applyClosingStatus(body, 42, {
      status: "completed",
      prNumber: 942,
      prUrl: "https://example.test/pr/942",
    });
    expect(closing.applied).toBe(true);
    // reflect block survives the closing write verbatim
    expect(parseReflectBlock(closing.body)).toEqual(before);
    expect(readChildStatus(closing.body, 42)?.status).toBe("completed");
    expect(readChildStatus(closing.body, 42)?.prNumber).toBe(942);
    // unrelated rows untouched
    expect(readChildStatus(closing.body, 43)?.status).toBe("pending");
  });

  test("closing 書き込みはべき等であり終了状態を上書きしない", () => {
    let body = epicBodyFixture();
    body = applyClosingStatus(body, 44, { status: "blocked" }).body;
    const again = applyClosingStatus(body, 44, { status: "completed", prNumber: 1, prUrl: "https://x" });
    expect(again.applied).toBe(false);
    expect(again.skipped).toBe("already-terminal");
    expect(readChildStatus(body, 44)?.status).toBe("blocked");
  });

  test("closing 書き込みは新4列形式の内容列を保持する（status 列のみ置換）", () => {
    const closing = applyClosingStatus(epicBodyFixture(), 41, {
      status: "completed",
      prNumber: 900,
      prUrl: "https://example.test/pr/900",
    });
    expect(closing.applied).toBe(true);
    const row = closing.body.split("\n").find((l) => l.includes("| #41 |")) ?? "";
    expect(row).toBe(
      "| 1-1 | #41 | completed ([PR#900](https://example.test/pr/900)) | 子Issue 41 の概要 |",
    );
  });

  test("記録契機の英語識別子はコメント検証経路と Epic 反映経路で同一語彙", async () => {
    const { RECORD_KINDS } = await import(
      "../../../src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts"
    );
    expect([...RECORD_TRIGGERS]).toEqual([...RECORD_KINDS]);
  });

  test("語彙外の reflect 行が既存ブロックにあれば適用せず本文を変更しない（静的破棄の防止）", () => {
    let body = applyReflectEntry(epicBodyFixture(), entry({ childIssue: 42, trigger: "start", state: "running" })).body;
    const unparseableLine = "<!-- reflect child=41 trigger=halt phase=case-run state=waiting -->";
    body = body.replace(REFLECT_BLOCK_BEGIN, [REFLECT_BLOCK_BEGIN, unparseableLine].join("\n"));
    const result = applyReflectEntry(body, entry({ childIssue: 41, trigger: "hold", state: "waiting", waitingReason: "CI" }));
    expect(result.applied).toBe(false);
    expect(result.unparseableLines).toEqual([unparseableLine]);
    expect(result.body).toBe(body);
    const kept = parseReflectBlock(result.body);
    expect(kept.map((e) => e.childIssue)).toEqual([42]);
  });

  test("mergeChildStatus: 終了状態は非終了状態に劣らず、既存終了状態は降格しない", async () => {
    const { mergeChildStatus } = await import(
      "../../../src/common/skills/agentdev-epic-tracker/scripts/lib/epic-reflect.ts"
    );
    expect(mergeChildStatus("pending", "completed")).toBe("completed");
    expect(mergeChildStatus("completed", "running" as never)).toBe("completed");
    expect(mergeChildStatus("blocked", "pending")).toBe("blocked");
    expect(mergeChildStatus("pending", "running" as never)).toBe("running");
  });

  test("存在しない子行の closing 書き込みはスキップ（row-missing）", () => {
    const result = applyClosingStatus(epicBodyFixture(), 999, { status: "failed" });
    expect(result.applied).toBe(false);
    expect(result.skipped).toBe("row-missing");
  });
});

// ---------------------------------------------------------------------------
// per-Epic exclusive serialization (closing + coordination share one gate)
// ---------------------------------------------------------------------------

describe("per-Epic 直列化 gate（closing と取りまとめの局所直列化）", () => {
  test("同一 Epic の書込みタスクは直列化され interleave しない", async () => {
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
      persistedBody = applyReflectEntry(latest, entry({ childIssue: 42, trigger: "hold", state: "waiting", waitingReason: "CI" })).body;
    };
    const closingWrite = async () => {
      const latest = persistedBody;
      persistedBody = applyClosingStatus(latest, 43, { status: "completed", prNumber: 943, prUrl: "u" }).body;
    };
    await gate.runExclusive("E", coordWrite);
    await gate.runExclusive("E", closingWrite);

    // both writes survived (no lost update)
    const entries = parseReflectBlock(persistedBody);
    expect(entries.map((e) => e.childIssue)).toContain(42);
    expect(readChildStatus(persistedBody, 43)?.status).toBe("completed");
    // and the coordination entry for 42 was not erased by the closing write
    expect(entries.find((e) => e.childIssue === 42)?.state).toBe("waiting");
  });
});

// ---------------------------------------------------------------------------
// TS-005 (2): overall completion vs child completion
// ---------------------------------------------------------------------------

describe("TS-005 全体完了判定（子完了と区別・評価根拠付き記録）", () => {
  test("全子完了でも全体条件未評価なら全体完了にならない", () => {
    let body = epicBodyFixture();
    for (const c of CHILDREN) {
      body = replaceChildStatus(body, c, `completed ([PR#${900 + c}](https://example.test/pr/${900 + c}))`)!;
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
      childStatuses: Object.fromEntries(CHILDREN.slice(0, 5).map((c) => [c, "completed" as const]).concat([[46, "running" as const]])),
      evaluatedCriteria: [
        { criterion: "全Wave完了", met: false, basis: "Wave 2 未着手" },
      ],
    });
    expect(evaluation.overallCompleted).toBe(false);
    expect(evaluation.unmetChildren).toEqual([46]);
    expect(evaluation.unmetCriteria).toEqual(["全Wave完了"]);
    expect(evaluation.basis).toContain("#46");
    expect(evaluation.basis).toContain("全Wave完了");
    expect(evaluation.basis).toContain("Wave 2 未着手");
  });

  test("全子終了かつ全条件達成のときのみ overallCompleted=true", () => {
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

  test("全体評価レコードは Epic 本文へ記録され子完了のみの状態では完了扱いにならない", () => {
    let body = epicBodyFixture();
    // all children terminal (closing writes done)
    for (const c of CHILDREN) {
      body = applyClosingStatus(body, c, { status: "completed", prNumber: 900 + c, prUrl: "https://x" }).body;
    }
    // criteria NOT evaluated yet -> recorded evaluation says not completed
    const evalNotYet = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [],
    });
    body = upsertOverallEvaluation(body, evalNotYet);
    expect(body).toContain("<!-- agentdev:epic-overall begin -->");
    expect(renderOverallLine(evalNotYet)).toContain("completed=false");
    // later, criteria evaluated and met -> overall completion recorded
    const evalDone = evaluateOverallCompletion({
      childIssues: CHILDREN,
      childStatuses: Object.fromEntries(CHILDREN.map((c) => [c, "completed" as const])),
      evaluatedCriteria: [{ criterion: "全Wave完了", met: true, basis: "収束済み" }],
    });
    body = upsertOverallEvaluation(body, evalDone);
    expect(body.match(/agentdev:epic-overall begin/g)).toHaveLength(1);
    expect(renderOverallLine(evalDone)).toContain("completed=true");
    expect(body).toContain("収束済み");
  });
});

// ---------------------------------------------------------------------------
// Distribution wording pins (canonical discipline text exists in artifacts)
// ---------------------------------------------------------------------------

describe("配布物の規律文言 pin", () => {
  test("epic-tracker SKILL.md に記録契機別反映・排他制御・最新取得→マージ→更新の規律がある", () => {
    const skill = read(EPIC_TRACKER_SKILL_REL);
    expect(skill).toContain("取りまとめによる記録契機別 Epic 反映");
    expect(skill).toContain("start");
    expect(skill).toContain("handoff");
    expect(skill).toContain("hold");
    expect(skill).toContain("resume");
    expect(skill).toContain("decision_change");
    expect(skill).toContain("completion");
    expect(skill).toContain("per-Epic 単一書き手");
    expect(skill).toContain("最新取得 → マージ → 更新");
    expect(skill).toContain("全体条件評価（子完了と全体完了の区別）");
  });

  test("coordination reference に反映手順・直列化手順・部分成功回復がある", () => {
    const ref = read(EPIC_TRACKER_REF_REL);
    expect(ref).toContain("直列化手順");
    expect(ref).toContain("最新取得→マージ→更新の規律");
    expect(ref).toContain("部分成功の区別と読み戻し再試行");
    expect(ref).toContain("全体条件評価の記録");
    expect(ref).toContain("agentdev:epic-reflect begin");
    expect(ref).toContain("agentdev:epic-overall begin");
  });

  test("case-close は closing 書き込みと取りまとめ反映の直列化を宣言する", () => {
    expect(read(CASE_CLOSE_SKILL_REL)).toContain("同一の per-Epic 排他制御・局所直列化");
    const epicRef = read(CASE_CLOSE_EPIC_REL);
    expect(epicRef).toContain("取りまとめ反映との直列化");
    expect(epicRef).toContain("集約セクションと他の子の状態を消去しない");
  });

  test("case-auto は取りまとめ反映を per-Epic 排他制御の下で宣言する", () => {
    const skill = read(CASE_AUTO_SKILL_REL);
    expect(skill).toContain("取りまとめによる記録契機別 Epic 反映");
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

  test("reflect: 同一入力で同一出力（決定的）", () => {
    const args = [
      "reflect",
      "--epic-body",
      "@BODY@",
      "--report",
      JSON.stringify({ childIssue: 42, trigger: "hold", phase: "case-run", state: "waiting", waitingReason: "CI 失敗", nextAction: "修正後に再実行" }),
    ];
    const a = runCli(args, epicBodyFixture());
    const b = runCli(args, epicBodyFixture());
    expect(a.json.ok).toBe(true);
    expect(b.json.ok).toBe(true);
    expect(a.json.body).toBe(b.json.body);
    const body = a.json.body as string;
    const entries = parseReflectBlock(body);
    expect(entries).toHaveLength(1);
    expect(entries[0].waitingReason).toBe("CI 失敗");
  });

  test("closing: べき等置換と既存終了状態の保護", () => {
    const args = ["closing", "--epic-body", "@BODY@", "--child", "43", "--status", "completed", "--pr", "943", "--pr-url", "https://example.test/pr/943"];
    const first = runCli(args, epicBodyFixture());
    expect(first.json.ok).toBe(true);
    expect(first.json.applied).toBe(true);
    const second = runCli(args, first.json.body as string);
    expect(second.json.ok).toBe(true);
    expect(second.json.applied).toBe(false);
    expect(second.json.skipped).toBe("already-terminal");
  });

  test("overall: 子完了のみでは completed=false を記録", () => {
    let body = epicBodyFixture();
    for (const c of CHILDREN) {
      body = applyClosingStatus(body, c, { status: "completed", prNumber: 900 + c, prUrl: "https://x" }).body;
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
    expect(result.json.body as string).toContain("agentdev:epic-overall begin");
  });
});
