// TS-003 全組合せ統合試験の共有 helper（REQ-099-007）。
//
// 4組合せ（OpenCode×GitHub、OpenCode×ローカルIssue、Senpi×GitHub、
// Senpi×ローカルIssue）で共通の Tool 操作契約の主要操作一連
// （起票・読取・更新・状態遷移・コメントと読み戻し検証）を実行する。
// GitHub バックエンドは gh CLI を実行しないステートフルスタブで置き換え、
// Local バックエンドは一時 issuesDir の実ファイルで検証する。
// engine（runAgentdevGhOperation）の VERIFY を通過した操作だけが
// ok:true を返すため、ok:true の連なりが読み戻し検証の証跡になる。

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { GhExec, GhSpawnError } from "./runner-cli.ts";

interface StubIssue {
  readonly number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  state_reason: string | null;
  labels: string[];
}

interface StubComment {
  readonly id: number;
  readonly number: number;
  body: string;
  readonly created_at: string;
  updated_at: string;
}

function issueJson(issue: StubIssue): Record<string, unknown> {
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state.toUpperCase(),
    state_reason: issue.state_reason,
    labels: issue.labels.map((name) => ({ name })),
    html_url: `https://example/i/${issue.number}`,
  };
}

function commentJson(comment: StubComment): Record<string, unknown> {
  return {
    id: comment.id,
    body: comment.body,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    html_url: `https://example/c/${comment.id}`,
    issue_url: `https://api.github.com/repos/owner/repo/issues/${comment.number}`,
  };
}

export interface GitHubStub {
  readonly exec: GhExec;
  readonly issues: StubIssue[];
  readonly comments: StubComment[];
}

const NOT_FOUND = { status: 1, stdout: "", stderr: "gh: Not Found (HTTP 404)" };

/** gh REST 相当のステートフルスタブ（issue/comment 系の主要操作のみ）。 */
export function createGitHubStub(init: { issues?: StubIssue[]; comments?: StubComment[] } = {}): GitHubStub {
  const issues = init.issues ?? [];
  const comments = init.comments ?? [];
  const nextIssueNumber = () => issues.reduce((m, i) => Math.max(m, i.number), 0) + 1;
  const exec: GhExec = (_file, args) => {
    if (args[0] !== "api") {
      return { status: 1, stdout: "", stderr: `stub: unexpected command ${args.join(" ")}` };
    }
    const method = args[1] === "-X" ? (args[2] as string) : "GET";
    const rawPath = args[1] === "-X" ? (args[3] as string) : (args[1] as string);
    const [path] = rawPath.split("?");
    const inputFlag = args.indexOf("--input");
    const inputBody = inputFlag >= 0
      ? (JSON.parse(fs.readFileSync(args[inputFlag + 1] as string, "utf8")) as Record<string, unknown>)
      : {};
    if (path === "repos/owner/repo/issues" && method === "POST") {
      const issue: StubIssue = {
        number: nextIssueNumber(),
        title: String(inputBody.title ?? ""),
        body: String(inputBody.body ?? ""),
        state: "open",
        state_reason: null,
        labels: (inputBody.labels as string[] | undefined ?? []).filter((l) => typeof l === "string"),
      };
      issues.push(issue);
      return {
        status: 0,
        stdout: JSON.stringify({ ...issueJson(issue), number: issue.number, html_url: `https://example/i/${issue.number}` }),
        stderr: "",
      };
    }
    const issueMatch = /^repos\/owner\/repo\/issues\/(\d+)$/.exec(path ?? "");
    if (issueMatch !== null) {
      const n = Number.parseInt(issueMatch[1] ?? "", 10);
      const issue = issues.find((i) => i.number === n);
      if (issue === undefined) return NOT_FOUND;
      if (method === "PATCH") {
        if (typeof inputBody.title === "string") issue.title = inputBody.title;
        if (typeof inputBody.body === "string") issue.body = inputBody.body;
        if (Array.isArray(inputBody.labels)) {
          issue.labels = inputBody.labels.filter((l): l is string => typeof l === "string");
        }
        if (inputBody.state === "open" || inputBody.state === "closed") {
          issue.state = inputBody.state;
          issue.state_reason = (inputBody.state_reason as string | null) ?? null;
        }
      }
      return { status: 0, stdout: JSON.stringify(issueJson(issue)), stderr: "" };
    }
    const commentsOfMatch = /^repos\/owner\/repo\/issues\/(\d+)\/comments$/.exec(path ?? "");
    if (commentsOfMatch !== null) {
      const n = Number.parseInt(commentsOfMatch[1] ?? "", 10);
      if (method === "GET") {
        const list = comments.filter((c) => c.number === n);
        return { status: 0, stdout: JSON.stringify(list.map(commentJson)), stderr: "" };
      }
      if (method === "POST") {
        const comment: StubComment = {
          id: comments.length + 1,
          number: n,
          body: String(inputBody.body ?? ""),
          created_at: "2026-10-02T00:00:00Z",
          updated_at: "2026-10-02T00:00:00Z",
        };
        comments.push(comment);
        return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
      }
      return { status: 1, stdout: "", stderr: `stub: unhandled ${method} comments` };
    }
    const commentMatch = /^repos\/owner\/repo\/issues\/comments\/(\d+)$/.exec(path ?? "");
    if (commentMatch !== null) {
      const id = Number.parseInt(commentMatch[1] ?? "", 10);
      const comment = comments.find((c) => c.id === id);
      if (comment === undefined) return NOT_FOUND;
      if (method === "PATCH") {
        if (typeof inputBody.body === "string") {
          comment.body = inputBody.body;
          comment.updated_at = "2026-10-02T01:00:00Z";
        }
        return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
      }
      if (method === "DELETE") {
        comments.splice(comments.indexOf(comment), 1);
        return { status: 0, stdout: "", stderr: "" };
      }
      return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
    }
    return { status: 1, stdout: "", stderr: `stub: unhandled ${method} ${rawPath}` };
  };
  return { exec, issues, comments };
}

export interface OperationStep {
  readonly operation: string;
  readonly args: Record<string, unknown>;
}

export interface StepResult {
  readonly operation: string;
  readonly ok: boolean;
  readonly payload: Record<string, unknown> | null;
  readonly failure: { kind: string; detail: string } | null;
}

/**
 * Tool 操作契約の主要操作一連（起票・読取・更新・状態遷移・コメント）を
 * 呼び出し順序依存の系列として返す。tracking Issue 1 件を起票してから
 * 読取 → 状態更新 → コメント CRUD → クローズ → 再オープンの順に遷移する。
 * commentId の物理形はバックエンドごとに異なるため、commentRef で与える。
 */
export function mainOperationSequence(commentRef: string): OperationStep[] {
  return [
    { operation: "issue_create", args: { title: "統合試験 追跡Issue", body: "TS-003 本文", labels: [], role: "tracking", kind: "task" } },
    { operation: "issue_read", args: { number: 1 } },
    { operation: "issue_update", args: { number: 1, trackingState: "in-discussion" } },
    { operation: "comment_create", args: { number: 1, body: "検討経過 1 件目" } },
    { operation: "comment_list", args: { number: 1 } },
    { operation: "comment_update", args: { commentId: commentRef, body: "検討経過 更新後" } },
    { operation: "issue_close", args: { number: 1, reason: "completed" } },
    { operation: "issue_reopen", args: { number: 1 } },
    { operation: "comment_delete", args: { commentId: commentRef } },
  ];
}

export function sequenceBody(): string {
  return "TS-003 本文";
}

export interface StepOutcome {
  readonly step: OperationStep;
  readonly result: StepResult;
}

export function toStepResult(operation: string, raw: unknown): StepResult {
  const parsed = raw as { ok: boolean; success?: Record<string, unknown>; failure?: { kind: string; detail?: string } };
  if (parsed.ok) {
    return { operation, ok: true, payload: parsed.success ?? null, failure: null };
  }
  return {
    operation,
    ok: false,
    payload: null,
    failure: { kind: parsed.failure?.kind ?? "unknown", detail: parsed.failure?.detail ?? "" },
  };
}

/** 一時ディレクトリ（テスト終了後に削除する呼び出し側の責務）。 */
export function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export type { GhSpawnError };
