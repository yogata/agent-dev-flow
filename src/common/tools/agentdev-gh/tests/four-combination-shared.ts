// TS-003 全組合せ統合試験の共有 helper（REQ-099-007）。
//
// 4組合せ（OpenCode×GitHub、OpenCode×ローカルIssue、Senpi×GitHub、
// Senpi×ローカルIssue）で共通の Tool 操作契約の主要操作一連
// （起票・読取・更新・状態遷移・コメントと読み戻し検証）を実行する。
// GitHub バックエンドは gh CLI を実行しないステートフルスタブで置き換え、
// Local バックエンドは一時 issuesDir の実ファイルで検証する。
// engine（runAgentdevGhOperation）の VERIFY を通過した操作だけが
// ok:true を返すため、ok:true の連なりが読み戻し検証の証跡になる。
//
// TS-007 終了経路シナリオ（issue_close の終了前提検証）も本 helper が共有する。
// Case Issue の終了は、main repo root 固定の機械受理の終了判定記録
// （.agentdev/close-acceptance/issue-{NNNN}.json）を経由しない限り拒否される
// （fail-closed）。記録の書出し本体は case-close 機械工程（別実行単位）の責務であり、
// 本シナリオは書出し相当の fixture で記録を用意して読み取り検証側を検証する。

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { CloseAcceptanceIo } from "../close-acceptance.ts";
import type { GhExec, GhSpawnError } from "../runner-cli.ts";

interface StubIssue {
  readonly number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  state_reason: string | null;
  labels: string[];
  /** GitHub API 準拠の updated_at（終了判定記録の判定対象版照合に使用）。 */
  updated_at?: string;
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
    updated_at: issue.updated_at ?? "2026-10-01T00:00:00Z",
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
        updated_at: "2026-10-01T00:00:00Z",
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
        issue.updated_at = "2026-10-01T01:00:00Z";
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
 * Tool 操作契約の主要操作一連（起票・読取・更新・コメント）を
 * 呼び出し順序依存の系列として返す。tracking Issue 1 件を起票してから
 * 読取 → 部分更新（role 不変条件）→ コメント CRUD → クローズ → 再オープンの順に
 * 遷移する。commentId の物理形はバックエンドごとに異なるため、commentRef で与える。
 */
export function mainOperationSequence(commentRef: string): OperationStep[] {
  return [
    { operation: "issue_create", args: { title: "統合試験 追跡Issue", body: "TS-003 本文", labels: [], role: "tracking" } },
    { operation: "issue_read", args: { number: 1 } },
    { operation: "issue_update", args: { number: 1, title: "統合試験 追跡Issue 更新後" } },
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

// -------------------------------------------------------------------------
// TS-007 終了経路シナリオ（issue_close の終了前提検証・Case Issue）
// -------------------------------------------------------------------------

/** 終了判定記録 fixture（main repo root 固定の保存場所と I/O 注入）。 */
export interface CloseAcceptanceFixture {
  /** fixture のメイン repo root（記録の保存場所の基準）。 */
  readonly mainRoot: string;
  /** main root の .git を指す I/O（engine の終了前提検証へ注入する）。 */
  readonly io: CloseAcceptanceIo;
}

/** 終了判定記録 fixture の作成（実 fs + gitCommonDir を main root の .git に固定）。 */
export function makeCloseAcceptanceFixture(prefix: string): CloseAcceptanceFixture {
  const mainRoot = fs.mkdtempSync(path.join(import.meta.dir, prefix));
  fs.mkdirSync(path.join(mainRoot, ".git"), { recursive: true });
  return {
    mainRoot,
    io: {
      exists: (p) => fs.existsSync(p),
      readTextFile: (p) => fs.readFileSync(p, "utf8"),
      gitCommonDir: () => path.join(mainRoot, ".git"),
    },
  };
}

function closeAcceptanceRecordPath(fixture: CloseAcceptanceFixture, issueNumber: number): string {
  return path.join(
    fixture.mainRoot,
    ".agentdev",
    "close-acceptance",
    `issue-${String(issueNumber).padStart(4, "0")}.json`,
  );
}

/** 終了判定記録の書出し（機械工程の書出し相当 fixture）。 */
export function writeCloseAcceptanceRecord(
  fixture: CloseAcceptanceFixture,
  issueNumber: number,
  record: Record<string, unknown>,
): void {
  const file = closeAcceptanceRecordPath(fixture, issueNumber);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(record), "utf8");
}

/** 生テキストの終了判定記録書出し（形式不正 fixture 用）。 */
export function writeRawCloseAcceptanceRecord(
  fixture: CloseAcceptanceFixture,
  issueNumber: number,
  raw: string,
): void {
  const file = closeAcceptanceRecordPath(fixture, issueNumber);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, raw, "utf8");
}

/** ローカルIssueファイルの updated_at（frontmatter）を読む（Local 組合せの判定対象版の観測値）。 */
export function localIssueUpdatedAt(issuesDir: string, issueNumber: number): string {
  const file = path.join(issuesDir, `issue-${String(issueNumber).padStart(4, "0")}.md`);
  const raw = fs.readFileSync(file, "utf8");
  const m = /^updated_at: "?([^"\n]+)"?$/m.exec(raw);
  if (m === null) throw new Error(`updated_at not found in ${file}`);
  return m[1]?.trim() ?? "";
}

export interface CaseCloseRouteOutcome {
  readonly label: string;
  readonly result: StepResult;
  readonly stateAfterRefusal?: unknown;
}

/**
 * Case Issue の終了経路シナリオ（TS-007）。
 * 起票 → 記録なし拒否 → 形式不正拒否 → 対象不一致拒否 → 判定不成立拒否 →
 * 判定対象版不一致（過去の合格結果の再利用）拒否 → 旧様式（台帳照合結果のみ）の
 * 受理なし拒否 → 検証成立時の終了 → 読み戻し、の順に実行する。記録の書出しは
 * 判定対象版（currentRevision の観測値）を用いて各拒否ケースごとに差し替える。
 * 〔6〕は旧台帳照合の結果のみを含み、判定内容（accepted・必須完了条件の評価結果）
 * を含まない旧様式相当の記録が様式不正として受理されないことを対照検証する。
 */
export async function runCaseIssueCloseRoute(
  execute: (step: OperationStep) => Promise<StepResult>,
  fixture: CloseAcceptanceFixture,
  currentRevision: () => string,
): Promise<CaseCloseRouteOutcome[]> {
  const outcomes: CaseCloseRouteOutcome[] = [];
  const run = async (label: string, step: OperationStep): Promise<StepResult> => {
    const result = await execute(step);
    if (step.operation === "issue_close" && !result.ok) {
      const read = await execute({ operation: "issue_read", args: { number: step.args.number } });
      outcomes.push({ label, result, stateAfterRefusal: read.payload?.state });
    } else {
      outcomes.push({ label, result });
    }
    return result;
  };
  const created = await run("起票(case)", {
    operation: "issue_create",
    args: { title: "統合試験 Case Issue", body: "TS-007 本文", labels: ["feature"], role: "case" },
  });
  if (!created.ok || created.payload === null) return outcomes;
  const issueNumber = Number(created.payload.number);
  const close = (reason = "completed"): OperationStep => ({
    operation: "issue_close",
    args: { number: issueNumber, reason },
  });
  await run("〔1〕記録なし拒否", close());
  writeRawCloseAcceptanceRecord(fixture, issueNumber, "not-json{{{");
  await run("〔2〕形式不正拒否", close());
  writeCloseAcceptanceRecord(fixture, issueNumber, {
    issueNumber: issueNumber + 1,
    targetRevision: currentRevision(),
    generatedAt: "2026-11-05T00:00:00Z",
    accepted: true,
  });
  await run("〔3〕対象不一致拒否", close());
  writeCloseAcceptanceRecord(fixture, issueNumber, {
    issueNumber,
    targetRevision: currentRevision(),
    generatedAt: "2026-11-05T00:00:00Z",
    accepted: false,
  });
  await run("〔4〕判定不成立拒否", close());
  writeCloseAcceptanceRecord(fixture, issueNumber, {
    issueNumber,
    targetRevision: "2020-01-01T00:00:00Z",
    generatedAt: "2026-11-05T00:00:00Z",
    accepted: true,
  });
  await run("〔5〕判定対象版不一致（過去の合格結果の再利用）拒否", close());
  // 旧様式相当: 旧台帳照合の結果のみを含み、判定内容（accepted）を含まない記録は
  // 様式不正として受理しない（旧台帳照合結果による終了は通過しない）。
  writeCloseAcceptanceRecord(fixture, issueNumber, {
    issueNumber,
    targetRevision: currentRevision(),
    generatedAt: "2026-11-05T00:00:00Z",
    verificationResources: { state: "confirmed-empty", entries: [] },
  });
  await run("〔6〕旧様式（台帳照合結果のみ）の受理なし拒否", close());
  writeCloseAcceptanceRecord(fixture, issueNumber, {
    issueNumber,
    targetRevision: currentRevision(),
    generatedAt: "2026-11-05T00:00:00Z",
    accepted: true,
  });
  await run("検証成立時の終了", close());
  await run("読み戻し(closed)", { operation: "issue_read", args: { number: issueNumber } });
  return outcomes;
}
