#!/usr/bin/env bun
//
// OpenCode セッション履歴データベースからの実行観測六指標集計（読取専用）。
// 同一の期間・母集団定義で前後の集計値を比較することを目的とし、
// データベースへの書込みを一切行わない（readonly 接続）。
//
// 使用方法:
//   bun scripts/self/observability/collect-opencode-metrics.ts \
//     [--db <path>] [--since <ms|ISO>] [--until <ms|ISO>] \
//     [--population all|roots] [--session-limit 500]
//
// 指標の定義（前後比較では同一の定義と母集団を用いる）:
// 1. turns_per_session             : セッションあたり user メッセージ数の平均（呼出回数近似）
// 2. turn1_input_tokens_avg        : 最初の assistant メッセージのコンテキストトークン（input + cache）の平均
// 3. context_tokens_avg            : assistant メッセージのコンテキストトークン（input + cache）平均（コンテキストサイズ近似）
// 4. tool_parts_per_assistant_msg  : assistant メッセージあたり tool part 数の平均
// 5. background_output_bytes_avg   : background_output ツール出力のバイト数平均
// 6. tool_output_reread_total      : 同一セッション内の同一 (tool, 入力) 重複出現の超過件数合計（再読込近似）

import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface MetricsOptions {
  since: number;
  until: number;
  population: "all" | "roots";
  sessionLimit: number;
}

export interface MetricsReport {
  ok: boolean;
  error?: string;
  db: string;
  population: "all" | "roots";
  since: number;
  until: number;
  sessions: number;
  metrics: {
    turns_per_session: number | null;
    turn1_input_tokens_avg: number | null;
    context_tokens_avg: number | null;
    tool_parts_per_assistant_msg: number | null;
    background_output_bytes_avg: number | null;
    tool_output_reread_total: number | null;
  };
}

interface SessionRow {
  id: string;
  parent_id: string | null;
  time_created: number;
}

interface MessageRow {
  id: string;
  session_id: string;
  time_created: number;
  data: string;
}

interface PartRow {
  id: string;
  session_id: string;
  data: string;
}

interface MessageData {
  role?: unknown;
  tokens?: { input?: unknown; cache?: { read?: unknown; write?: unknown } };
}

interface PartData {
  type?: unknown;
  tool?: unknown;
  state?: {
    input?: unknown;
    output?: unknown;
    metadata?: { output?: unknown };
  };
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function collectOpencodeMetrics(
  db: Database,
  dbLabel: string,
  opts: MetricsOptions,
): MetricsReport {
  const report: MetricsReport = {
    ok: true,
    db: dbLabel,
    population: opts.population,
    since: opts.since,
    until: opts.until,
    sessions: 0,
    metrics: {
      turns_per_session: null,
      turn1_input_tokens_avg: null,
      context_tokens_avg: null,
      tool_parts_per_assistant_msg: null,
      background_output_bytes_avg: null,
      tool_output_reread_total: null,
    },
  };

  const populationFilter =
    opts.population === "roots" ? " AND parent_id IS NULL" : "";
  const sessions = db
    .query(
      `SELECT id, parent_id, time_created FROM session
       WHERE time_created >= ? AND time_created < ?${populationFilter}
       ORDER BY time_created, id LIMIT ?`,
    )
    .all(opts.since, opts.until, opts.sessionLimit) as SessionRow[];
  report.sessions = sessions.length;
  if (sessions.length === 0) {
    return report;
  }

  db.query(
    "CREATE TEMP TABLE IF NOT EXISTS target_sessions(id TEXT PRIMARY KEY)",
  ).run();
  db.query("DELETE FROM target_sessions").run();
  const insert = db.query(
    "INSERT INTO target_sessions(id) VALUES (?) ON CONFLICT(id) DO NOTHING",
  );
  for (const s of sessions) insert.run(s.id);

  const messages = db
    .query(
      `SELECT m.id, m.session_id, m.time_created, m.data
       FROM message m JOIN target_sessions t ON m.session_id = t.id
       ORDER BY m.session_id, m.time_created, m.id`,
    )
    .all() as MessageRow[];
  const parts = db
    .query(
      `SELECT p.id, p.session_id, p.data
       FROM part p JOIN target_sessions t ON p.session_id = t.id`,
    )
    .all() as PartRow[];

  const userCountBySession = new Map<string, number>();
  const firstAssistantInput = new Map<string, number>();
  const assistantInputs: number[] = [];
  let toolPartCount = 0;
  const backgroundOutputBytes: number[] = [];
  const toolInputOccurrences = new Map<string, number>();

  for (const m of messages) {
    let parsed: MessageData;
    try {
      parsed = JSON.parse(m.data) as MessageData;
    } catch {
      continue;
    }
    if (parsed.role === "user") {
      userCountBySession.set(
        m.session_id,
        (userCountBySession.get(m.session_id) ?? 0) + 1,
      );
      continue;
    }
    if (parsed.role !== "assistant") continue;
    const tokens = parsed.tokens;
    const input = tokens?.input;
    if (typeof input !== "number") continue;
    const cacheRead = tokens?.cache?.read;
    const cacheWrite = tokens?.cache?.write;
    const contextTokens =
      input +
      (typeof cacheRead === "number" ? cacheRead : 0) +
      (typeof cacheWrite === "number" ? cacheWrite : 0);
    assistantInputs.push(contextTokens);
    if (!firstAssistantInput.has(m.session_id)) {
      firstAssistantInput.set(m.session_id, contextTokens);
    }
  }

  for (const p of parts) {
    let parsed: PartData;
    try {
      parsed = JSON.parse(p.data) as PartData;
    } catch {
      continue;
    }
    if (parsed.type !== "tool" || typeof parsed.tool !== "string") continue;
    toolPartCount += 1;
    const output =
      parsed.state?.output ?? parsed.state?.metadata?.output ?? null;
    if (parsed.tool === "background_output" && typeof output === "string") {
      backgroundOutputBytes.push(Buffer.byteLength(output, "utf-8"));
    }
    const key = `${p.session_id}:${parsed.tool}:${JSON.stringify(parsed.state?.input ?? null)}`;
    toolInputOccurrences.set(key, (toolInputOccurrences.get(key) ?? 0) + 1);
  }

  let rereadTotal = 0;
  for (const count of toolInputOccurrences.values()) {
    if (count >= 2) rereadTotal += count - 1;
  }

  const userTotal = [...userCountBySession.values()].reduce((a, b) => a + b, 0);
  report.metrics = {
    // セッションあたり user メッセージ数の平均。user メッセージ 0 件のセッションは 0 として母集団に含める。
    turns_per_session: userTotal / sessions.length,
    turn1_input_tokens_avg: avg([...firstAssistantInput.values()]),
    context_tokens_avg: avg(assistantInputs),
    tool_parts_per_assistant_msg: toolPartCount / assistantInputs.length,
    background_output_bytes_avg: avg(backgroundOutputBytes),
    tool_output_reread_total: rereadTotal,
  };
  return report;
}

function homeDirFromEnv(env: Record<string, string | undefined>): string | null {
  for (const key of ["USERPROFILE", "HOME"] as const) {
    const value = env[key];
    if (value !== undefined && value.length > 0) return value;
  }
  const fallback = homedir();
  return fallback.length > 0 ? fallback : null;
}

export function resolveDefaultDbPath(
  env: Record<string, string | undefined>,
  exists: (path: string) => boolean,
): string | null {
  const fromEnv = env.OPENCODE_DB;
  if (fromEnv !== undefined && fromEnv.length > 0) return fromEnv;
  const home = homeDirFromEnv(env);
  const homeDefault =
    home === null ? null : join(home, ".local", "share", "opencode", "opencode.db");
  const candidates: string[] = [];
  const xdg = env.XDG_DATA_HOME;
  if (xdg !== undefined && xdg.length > 0) {
    candidates.push(join(xdg, "opencode", "opencode.db"));
  }
  if (homeDefault !== null) candidates.push(homeDefault);
  const localAppData = env.LOCALAPPDATA;
  if (localAppData !== undefined && localAppData.length > 0) {
    candidates.push(join(localAppData, "opencode", "opencode.db"));
  }
  for (const candidate of candidates) {
    if (exists(candidate)) return candidate;
  }
  return homeDefault;
}

function defaultDbPath(): string | null {
  return resolveDefaultDbPath(process.env, existsSync);
}

function parseTime(value: string, flag: string): { ms: number } | { error: string } {
  if (/^\d+$/.test(value)) return { ms: Number(value) };
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return { error: `${flag} is not ms or ISO: ${value}` };
  return { ms: parsed };
}

export function parseCliArgs(argv: string[]):
  | { args: MetricsOptions & { db: string | null } }
  | { error: string } {
  const args = {
    db: defaultDbPath(),
    since: Date.now() - 24 * 3600 * 1000,
    until: Date.now(),
    population: "all" as "all" | "roots",
    sessionLimit: 500,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) return { error: `missing value for ${flag}` };
    i += 1;
    switch (flag) {
      case "--db":
        args.db = value;
        break;
      case "--since":
      case "--until": {
        const t = parseTime(value, flag);
        if ("error" in t) return t;
        if (flag === "--since") args.since = t.ms;
        else args.until = t.ms;
        break;
      }
      case "--population":
        if (value !== "all" && value !== "roots") {
          return { error: `--population must be all or roots, got ${value}` };
        }
        args.population = value;
        break;
      case "--session-limit": {
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) {
          return { error: `--session-limit must be a positive integer, got ${value}` };
        }
        args.sessionLimit = n;
        break;
      }
      default:
        return { error: `unknown flag: ${flag}` };
    }
  }
  if (args.since >= args.until) {
    return { error: `--since (${args.since}) must be earlier than --until (${args.until})` };
  }
  if (args.db === null) {
    return { error: "database path unresolved: set --db or OPENCODE_DB" };
  }
  return { args };
}

function main(): number {
  const parsed = parseCliArgs(process.argv.slice(2));
  if ("error" in parsed) {
    console.error(`error: ${parsed.error}`);
    return 1;
  }
  const a = parsed.args;
  let db: Database;
  try {
    db = new Database(a.db, { readonly: true });
  } catch (error) {
    console.error(`error: database open failed (readonly): ${String(error)}`);
    return 1;
  }
  let report: MetricsReport;
  try {
    report = collectOpencodeMetrics(db, a.db, {
      since: a.since,
      until: a.until,
      population: a.population,
      sessionLimit: a.sessionLimit,
    });
  } finally {
    db.close();
  }
  console.log(JSON.stringify(report, null, 2));
  return report.ok ? 0 : 1;
}

if (import.meta.main) {
  process.exit(main());
}
