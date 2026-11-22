import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import {
  collectOpencodeMetrics,
  parseCliArgs,
} from "./collect-opencode-metrics.ts";

function fixtureDb(): Database {
  const db = new Database(":memory:");
  db.run(
    "CREATE TABLE session(id TEXT PRIMARY KEY, parent_id TEXT, time_created INTEGER)",
  );
  db.run(
    "CREATE TABLE message(id TEXT PRIMARY KEY, session_id TEXT, time_created INTEGER, data TEXT)",
  );
  db.run(
    "CREATE TABLE part(id TEXT PRIMARY KEY, session_id TEXT, message_id TEXT, data TEXT)",
  );

  const sess = db.query(
    "INSERT INTO session(id, parent_id, time_created) VALUES (?, ?, ?)",
  );
  sess.run("ses1", null, 1000);
  sess.run("ses2", null, 2000);
  sess.run("ses3", "ses1", 3000);

  const msg = db.query(
    "INSERT INTO message(id, session_id, time_created, data) VALUES (?, ?, ?, ?)",
  );
  const user = (id: string, sid: string, t: number) =>
    msg.run(id, sid, t, JSON.stringify({ role: "user" }));
  const assistant = (id: string, sid: string, t: number, input: number) =>
    msg.run(
      id,
      sid,
      t,
      JSON.stringify({ role: "assistant", tokens: { input, output: 10 } }),
    );

  user("u1a", "ses1", 1100);
  user("u1b", "ses1", 1500);
  assistant("m1a", "ses1", 1200, 100);
  assistant("m1b", "ses1", 1300, 200);
  assistant("m1c", "ses1", 1600, 400);
  user("u2a", "ses2", 2100);
  assistant("m2a", "ses2", 2200, 300);
  user("u3a", "ses3", 3100);
  assistant("m3a", "ses3", 3200, 999);

  const part = db.query(
    "INSERT INTO part(id, session_id, message_id, data) VALUES (?, ?, ?, ?)",
  );
  const toolInput = JSON.stringify({ command: "x" });
  part.run(
    "p1a", "ses1", "m1a",
    JSON.stringify({ type: "tool", tool: "bash", state: { input: { command: "x" }, output: "out" } }),
  );
  part.run(
    "p1b", "ses1", "m1b",
    JSON.stringify({ type: "tool", tool: "bash", state: { input: { command: "x" }, output: "out" } }),
  );
  part.run(
    "p1c", "ses1", "m1c",
    JSON.stringify({ type: "tool", tool: "background_output", state: { input: { task_id: "t1" }, output: "hello" } }),
  );
  part.run(
    "p3a", "ses3", "m3a",
    JSON.stringify({ type: "tool", tool: "bash", state: { input: { command: "x" }, output: "out" } }),
  );
  return db;
}

const baseOpts = { since: 0, until: 4000, population: "all" as const, sessionLimit: 500 };

describe("collect_opencode_metrics: 六指標の集計（全母集団）", () => {
  test("指標定義どおりの値を返す", () => {
    const db = fixtureDb();
    try {
      const report = collectOpencodeMetrics(db, ":memory:", baseOpts);
      expect(report.ok).toBe(true);
      expect(report.sessions).toBe(3);
      // user メッセージ 4 件 / セッション 3 件（user 0 件のセッションは 0 として分母に含む）
      expect(report.metrics.turns_per_session).toBeCloseTo(4 / 3, 10);
      // セッションごとの最初の assistant 入力: 100, 300, 999
      expect(report.metrics.turn1_input_tokens_avg).toBeCloseTo(1399 / 3, 10);
      // assistant 入力全体の平均: (100+200+400+300+999)/5
      expect(report.metrics.context_tokens_avg).toBeCloseTo(399.8, 10);
      // tool part 4 件 / assistant メッセージ 5 件
      expect(report.metrics.tool_parts_per_assistant_msg).toBeCloseTo(0.8, 10);
      // "hello" の UTF-8 バイト数
      expect(report.metrics.background_output_bytes_avg).toBe(5);
      // 同一セッション内の同一 (tool, 入力) 重複: ses1 の bash 同一入力 2 件 → 超過 1
      // ses3 の同一入力 bash は別セッションのため計上しない
      expect(report.metrics.tool_output_reread_total).toBe(1);
    } finally {
      db.close();
    }
  });
});

describe("collect_opencode_metrics: root 母集団限定", () => {
  test("子セッションを母集団から除外して集計する", () => {
    const db = fixtureDb();
    try {
      const report = collectOpencodeMetrics(db, ":memory:", {
        ...baseOpts,
        population: "roots",
      });
      expect(report.sessions).toBe(2);
      expect(report.metrics.turns_per_session).toBeCloseTo(1.5, 10);
      expect(report.metrics.turn1_input_tokens_avg).toBeCloseTo(200, 10);
      expect(report.metrics.context_tokens_avg).toBeCloseTo(250, 10);
      expect(report.metrics.tool_parts_per_assistant_msg).toBeCloseTo(0.75, 10);
      expect(report.metrics.tool_output_reread_total).toBe(1);
    } finally {
      db.close();
    }
  });
});

describe("collect_opencode_metrics: 空母集団", () => {
  test("対象 0 件は失敗ではなく全指標 null で返す", () => {
    const db = fixtureDb();
    try {
      const report = collectOpencodeMetrics(db, ":memory:", {
        ...baseOpts,
        since: 9e15,
        until: 9e15 + 1000,
      });
      expect(report.ok).toBe(true);
      expect(report.sessions).toBe(0);
      expect(report.metrics.turns_per_session).toBeNull();
      expect(report.metrics.context_tokens_avg).toBeNull();
      expect(report.metrics.tool_output_reread_total).toBeNull();
    } finally {
      db.close();
    }
  });
});

describe("collect_opencode_metrics: CLI 引数の検証", () => {
  test("有効な引数は受理し、不正な引数は fail-closed で拒否する", () => {
    const ok = parseCliArgs(["--db", "x.db", "--since", "1000", "--until", "2026-01-01T00:00:00Z"]);
    expect("args" in ok).toBe(true);
    if ("args" in ok) {
      expect(ok.args.population).toBe("all");
      expect(ok.args.since).toBe(1000);
      expect(ok.args.until).toBe(Date.parse("2026-01-01T00:00:00Z"));
    }

    expect("error" in parseCliArgs(["--population", "bogus"])).toBe(true);
    expect("error" in parseCliArgs(["--session-limit", "0"])).toBe(true);
    expect("error" in parseCliArgs(["--unknown", "x"])).toBe(true);
    const reversed = parseCliArgs(["--db", "x.db", "--since", "2000", "--until", "1000"]);
    expect("error" in reversed).toBe(true);
  });
});
