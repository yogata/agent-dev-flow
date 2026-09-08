// ADF-COVERS(verification): REQ-011-025, REQ-011-026, REQ-011-027, REQ-011-029, REQ-011-030
//
// GitHub 実装（CliRunner）のテスト。
//
// gh 実行は注入された偽 exec で置き換え、実コマンドを実行しない。
// 検証観点: 引数組み立て（シェル不使用の引数配列、--input ファイル渡し、
// inline --title/--body 不使用）、一時ファイルの BOM なし UTF-8 と必ず削除、
// 終了コードと JSON 解析の失敗分類、gh pr view 応答の正規化。
// GitHub REST 相当のステートフルスタブ（githubStub）では engine 経由の
// 実操作（追跡軸保持、再オープン遷移、一覧完全性、部分更新）を検証する。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { createCliRunner, type GhExec } from "../runner-cli.ts";
import { buildGhToolEnv } from "../engine.ts";
import { runAgentdevGhOperation } from "../index.ts";
import type { GhRunnerReply, GhRunnerRequest } from "../runner.ts";

interface ExecCall {
  readonly file: string;
  readonly args: readonly string[];
}

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(import.meta.dir, "tmp-runner-cli-"));
  return dir;
}

function fakeExec(
  handler: (call: ExecCall) => { status: number | null; stdout: string; stderr: string },
): { exec: GhExec; calls: ExecCall[] } {
  const calls: ExecCall[] = [];
  const exec: GhExec = (file, args) => {
    const call = { file, args };
    calls.push(call);
    return handler(call);
  };
  return { exec, calls };
}

async function run(
  exec: GhExec,
  tempDir: string,
  request: GhRunnerRequest,
): Promise<GhRunnerReply> {
  const runner = createCliRunner({ repo: "owner/repo", tempDir, exec });
  return runner.run(request);
}

describe("CliRunner: 引数組み立ての環境依存隠蔽", () => {
  test("issue_create は title/body を --input の JSON ファイルで投入し inline 引数を使わない", async () => {
    const tempDir = makeTempDir();
    let writtenBody = "";
    const { exec, calls } = fakeExec((call) => {
      const inputFlag = call.args.indexOf("--input");
      if (inputFlag >= 0) {
        writtenBody = fs.readFileSync(call.args[inputFlag + 1] as string, "utf8");
      }
      return {
        status: 0,
        stdout: JSON.stringify({ number: 42, html_url: "https://example/i/42" }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, {
      operation: "issue_create",
      args: { title: "日本語タイトル", body: "本文\n複数行", labels: ["feature"] },
    });
    expect(reply.ok).toBe(true);
    expect(calls.length).toBe(1);
    const args = calls[0]?.args ?? [];
    expect(args).not.toContain("--title");
    expect(args).not.toContain("--body");
    const parsed = JSON.parse(writtenBody) as Record<string, unknown>;
    expect(parsed.title).toBe("日本語タイトル");
    expect(parsed.body).toBe("本文\n複数行");
    expect(parsed.labels).toEqual(["feature"]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("一時ファイルは BOM なし UTF-8 で、操作後に削除される", async () => {
    const tempDir = makeTempDir();
    let tempFile = "";
    const { exec } = fakeExec((call) => {
      const inputFlag = call.args.indexOf("--input");
      if (inputFlag >= 0) {
        tempFile = call.args[inputFlag + 1] as string;
      }
      return {
        status: 0,
        stdout: JSON.stringify({ number: 1, html_url: "https://example/i/1" }),
        stderr: "",
      };
    });
    await run(exec, tempDir, { operation: "issue_create", args: { title: "t", body: "b", labels: [] } });
    expect(tempFile.length).toBeGreaterThan(0);
    expect(fs.existsSync(tempFile)).toBe(false);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("gh 実行失敗時も一時ファイルを削除する", async () => {
    const tempDir = makeTempDir();
    let tempFile = "";
    const { exec } = fakeExec((call) => {
      const inputFlag = call.args.indexOf("--input");
      if (inputFlag >= 0) {
        tempFile = call.args[inputFlag + 1] as string;
      }
      return { status: 1, stdout: "", stderr: "gh: create failed" };
    });
    const reply = await run(exec, tempDir, {
      operation: "issue_create",
      args: { title: "t", body: "b", labels: [] },
    });
    expect(reply.ok).toBe(false);
    if (!reply.ok) {
      expect(reply.error).toContain("create failed");
      expect(reply.exitCode).toBe(1);
    }
    expect(fs.existsSync(tempFile)).toBe(false);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("起動失敗（gh 不在）は exitCode null で失敗する", async () => {
    const { exec } = fakeExec(() => ({ status: null, stdout: "", stderr: "" }));
    const reply = await run(exec, makeTempDir(), {
      operation: "issue_read",
      args: { number: 5 },
    });
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.exitCode).toBeNull();
  });

  test("応答が JSON でない場合は失敗する", async () => {
    const { exec } = fakeExec(() => ({ status: 0, stdout: "not json", stderr: "" }));
    const reply = await run(exec, makeTempDir(), { operation: "issue_read", args: { number: 5 } });
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.error).toContain("not valid JSON");
  });
});

describe("CliRunner: 各操作の API 写像", () => {
  test("issue_read は REST GET で state を正規化して返す", async () => {
    const { exec, calls } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 7,
        title: "T",
        body: "B",
        state: "OPEN",
        labels: [{ name: "bug" }],
        state_reason: null,
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "issue_read", args: { number: 7 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({
        number: 7,
        title: "T",
        body: "B",
        state: "open",
        labels: ["bug"],
        role: "case",
        kind: null,
        trackingState: null,
        closeReason: null,
      });
    }
    expect(calls[0]?.args).toContain("repos/owner/repo/issues/7");
  });

  test("issue_read は追跡Issueラベルから role/kind/trackingState を導出する", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 8,
        title: "追跡",
        body: "B",
        state: "open",
        labels: [
          { name: "agentdev-tracking" },
          { name: "agentdev-kind/risk" },
          { name: "agentdev-tracking-status/on-hold" },
        ],
        state_reason: null,
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "issue_read", args: { number: 8 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.role).toBe("tracking");
      expect(payload.kind).toBe("risk");
      expect(payload.trackingState).toBe("on-hold");
      expect(payload.closeReason).toBeNull();
    }
  });

  test("issue_read はクローズ済み追跡Issueの closeReason を導出する", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 9,
        title: "追跡",
        body: "B",
        state: "closed",
        labels: [{ name: "agentdev-tracking" }, { name: "agentdev-kind/task" }],
        state_reason: "not_planned",
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "issue_read", args: { number: 9 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.trackingState).toBe("closed");
      expect(payload.closeReason).toBe("not_planned");
    }
  });

  test("issue_create は role/kind を物理ラベルへ写像して投入する", async () => {
    const tempDir = makeTempDir();
    let body = "";
    const { exec } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) body = fs.readFileSync(call.args[i + 1] as string, "utf8");
      return {
        status: 0,
        stdout: JSON.stringify({ number: 42, html_url: "https://example/i/42" }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, {
      operation: "issue_create",
      args: { title: "課題", body: "B", labels: [], role: "tracking", kind: "problem" },
    });
    expect(reply.ok).toBe(true);
    const parsed = JSON.parse(body) as Record<string, unknown>;
    expect(parsed.labels).toEqual([
      "agentdev-tracking",
      "agentdev-kind/problem",
      "agentdev-tracking-status/created",
    ]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_update は追跡Issueの状態ラベルを現状取得の上で置換する", async () => {
    const tempDir = makeTempDir();
    const patches: string[] = [];
    const { exec, calls } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) patches.push(fs.readFileSync(call.args[i + 1] as string, "utf8"));
      if (call.args.includes("PATCH")) {
        return {
          status: 0,
          stdout: JSON.stringify({ number: 8, html_url: "https://example/i/8" }),
          stderr: "",
        };
      }
      return {
        status: 0,
        stdout: JSON.stringify({
          number: 8,
          title: "追跡",
          body: "B",
          state: "open",
          labels: [
            { name: "agentdev-tracking" },
            { name: "agentdev-kind/idea" },
            { name: "agentdev-tracking-status/created" },
          ],
          state_reason: null,
        }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, {
      operation: "issue_update",
      args: { number: 8, trackingState: "on-hold" },
    });
    expect(reply.ok).toBe(true);
    const patch = JSON.parse(patches[0] ?? "") as Record<string, unknown>;
    expect(patch.labels).toEqual([
      "agentdev-tracking",
      "agentdev-kind/idea",
      "agentdev-tracking-status/on-hold",
    ]);
    expect(calls.some((c) => c.args.includes("repos/owner/repo/issues/8"))).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_update は case の Issue への kind 指定を拒否する", async () => {
    const tempDir = makeTempDir();
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 7,
        title: "T",
        body: "B",
        state: "open",
        labels: [{ name: "bug" }],
        state_reason: null,
      }),
      stderr: "",
    }));
    const reply = await run(exec, tempDir, {
      operation: "issue_update",
      args: { number: 7, kind: "problem" },
    });
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.error).toContain("tracking issues");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_list は PR を除外し role/kind/trackingState で絞り込む", async () => {
    const issue = (
      n: number,
      labels: string[],
      state: string,
      stateReason: string | null,
      pullRequest: boolean,
    ) => ({
      number: n,
      title: `issue-${n}`,
      html_url: `https://example/i/${n}`,
      state,
      state_reason: stateReason,
      labels: labels.map((name) => ({ name })),
      ...(pullRequest ? { pull_request: { url: `https://example/p/${n}` } } : {}),
    });
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify([
        issue(1, ["enhancement"], "open", null, false),
        issue(2, ["agentdev-tracking", "agentdev-kind/risk", "agentdev-tracking-status/on-hold"], "open", null, false),
        issue(3, ["agentdev-tracking", "agentdev-kind/task"], "closed", "completed", false),
        issue(4, ["agentdev-tracking"], "open", null, true),
      ]),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), {
      operation: "issue_list",
      args: { role: "tracking" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      const issues = payload.issues as Record<string, unknown>[];
      expect(issues.map((i) => i.number)).toEqual([2, 3]);
      expect(issues[0]?.trackingState).toBe("on-hold");
      expect(issues[1]?.trackingState).toBe("closed");
      expect(issues[1]?.closeReason).toBe("completed");
    }
  });

  test("issue_reopen は case の Issue を state=open の PATCH で戻す（追跡ラベル不改変）", async () => {
    const tempDir = makeTempDir();
    const patches: string[] = [];
    const { exec, calls } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) {
        patches.push(fs.readFileSync(call.args[i + 1] as string, "utf8"));
        return {
          status: 0,
          stdout: JSON.stringify({ number: 7, state: "OPEN", labels: [{ name: "bug" }] }),
          stderr: "",
        };
      }
      return {
        status: 0,
        stdout: JSON.stringify({
          number: 7,
          title: "T",
          body: "B",
          state: "CLOSED",
          labels: [{ name: "bug" }],
          state_reason: "completed",
        }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, { operation: "issue_reopen", args: { number: 7 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({
        number: 7,
        state: "open",
        before: {
          state: "closed",
          labels: ["bug"],
          role: "case",
          kind: null,
          trackingState: null,
          closeReason: null,
        },
      });
    }
    expect(JSON.parse(patches[0] ?? "")).toEqual({ state: "open", state_reason: null });
    expect(calls.some((c) => c.args.slice(0, 4).includes("repos/owner/repo/issues/7"))).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_close は state_reason を含む PATCH で閉じる", async () => {
    const tempDir = makeTempDir();
    let body = "";
    const { exec, calls } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) body = fs.readFileSync(call.args[i + 1] as string, "utf8");
      return {
        status: 0,
        stdout: JSON.stringify({ number: 7, state: "closed" }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, {
      operation: "issue_close",
      args: { number: 7, reason: "not_planned" },
    });
    expect(reply.ok).toBe(true);
    expect(JSON.parse(body)).toEqual({ state: "closed", state_reason: "not_planned" });
    expect(calls[0]?.args.slice(0, 4)).toEqual(["api", "-X", "PATCH", "repos/owner/repo/issues/7"]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("pr_read は gh pr view の OPEN/MERGED を小文字へ正規化し body を含む", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 9,
        title: "P",
        body: "PR 本文",
        state: "MERGED",
        mergeable: "MERGEABLE",
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "pr_read", args: { number: 9 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({
        number: 9,
        title: "P",
        body: "PR 本文",
        state: "merged",
        mergeable: "MERGEABLE",
      });
    }
  });

  test("pr_read は body 欠落（null）応答を空文字へ正規化する", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 9,
        title: "P",
        body: null,
        state: "OPEN",
        mergeable: "UNKNOWN",
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "pr_read", args: { number: 9 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.body).toBe("");
    }
  });

  test("pr_changed_files は files[].path を文字列配列へ抽出する", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({
        number: 9,
        files: [{ path: "a.md" }, { path: "src/b.ts" }],
      }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "pr_changed_files", args: { number: 9 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ number: 9, files: ["a.md", "src/b.ts"] });
    }
  });

  test("pr_merge は merge_method を含む PUT で merged を確認する", async () => {
    const tempDir = makeTempDir();
    let body = "";
    const { exec, calls } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) body = fs.readFileSync(call.args[i + 1] as string, "utf8");
      return { status: 0, stdout: JSON.stringify({ merged: true, sha: "abc" }), stderr: "" };
    });
    const reply = await run(exec, tempDir, {
      operation: "pr_merge",
      args: { number: 9, method: "squash" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ number: 9, merged: true });
    }
    expect(JSON.parse(body)).toEqual({ merge_method: "squash" });
    expect(calls[0]?.args.slice(0, 4)).toEqual(["api", "-X", "PUT", "repos/owner/repo/pulls/9/merge"]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("pr_merge の応答が merged でない場合は失敗する", async () => {
    const tempDir = makeTempDir();
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({ merged: false, message: "Pull Request is not mergeable" }),
      stderr: "",
    }));
    const reply = await run(exec, tempDir, { operation: "pr_merge", args: { number: 9, method: "squash" } });
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.error).toContain("not mergeable");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("draft を指定した pr_create は draft: true を投入する", async () => {
    const tempDir = makeTempDir();
    let body = "";
    const { exec } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) body = fs.readFileSync(call.args[i + 1] as string, "utf8");
      return {
        status: 0,
        stdout: JSON.stringify({ number: 10, html_url: "https://example/p/10" }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, {
      operation: "pr_create",
      args: { title: "P", body: "B", base: "main", head: "feature/x", draft: true },
    });
    expect(reply.ok).toBe(true);
    const parsed = JSON.parse(body) as Record<string, unknown>;
    expect(parsed.draft).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

// ---------------------------------------------------------------------------
// GitHub REST 相当のステートフルスタブ（engine 経由の実操作検証）
// ---------------------------------------------------------------------------

interface StubIssue {
  readonly number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  state_reason: string | null;
  labels: string[];
}

interface StubComment {
  id: number;
  number: number;
  body: string;
  created_at: string;
  updated_at: string;
}

interface StubPr {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed" | "merged";
  mergeable: string;
}

interface GithubStub {
  readonly exec: GhExec;
  readonly issues: StubIssue[];
  readonly comments: StubComment[];
  readonly prs: StubPr[];
  readonly requests: string[];
  readonly patches: { readonly path: string; readonly body: Record<string, unknown> }[];
  /** true にすると comments 一覧 GET を 500 エラーにする（読み戻し失敗の注入用）。 */
  failCommentsList: boolean;
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

const NOT_FOUND = { status: 1, stdout: "", stderr: "gh: Not Found (HTTP 404)" };

function githubStub(init: {
  issues?: StubIssue[];
  comments?: StubComment[];
  prs?: StubPr[];
}): GithubStub {
  const issues = init.issues ?? [];
  const comments = init.comments ?? [];
  const prs = init.prs ?? [];
  const requests: string[] = [];
  const patches: { path: string; body: Record<string, unknown> }[] = [];
  const stub: GithubStub = {
    issues,
    comments,
    prs,
    requests,
    patches,
    failCommentsList: false,
    exec: (_file, args) => {
      if (args[0] !== "api") {
        if (args[0] === "pr" && args[1] === "view") {
          const n = Number.parseInt(args[2] ?? "", 10);
          const pr = prs.find((p) => p.number === n);
          if (pr === undefined) return NOT_FOUND;
          return {
            status: 0,
            stdout: JSON.stringify({
              number: pr.number,
              title: pr.title,
              body: pr.body,
              state: pr.state.toUpperCase(),
              mergeable: pr.mergeable,
            }),
            stderr: "",
          };
        }
        return { status: 1, stdout: "", stderr: `stub: unexpected command ${args.join(" ")}` };
      }
      const method = args[1] === "-X" ? (args[2] as string) : "GET";
      const rawPath = args[1] === "-X" ? (args[3] as string) : (args[1] as string);
      const [path, query] = rawPath.split("?");
      const params = new URLSearchParams(query ?? "");
      requests.push(`${method} ${rawPath}`);
      const inputFlag = args.indexOf("--input");
      const inputBody = inputFlag >= 0
        ? (JSON.parse(fs.readFileSync(args[inputFlag + 1] as string, "utf8")) as Record<string, unknown>)
        : {};
      if (method !== "GET") {
        patches.push({ path: path ?? rawPath, body: inputBody });
      }

      if (path === "repos/owner/repo/issues" && method === "GET") {
        const stateFilter = params.get("state") ?? "all";
        const labelsFilter = (params.get("labels") ?? "")
          .split(",")
          .filter((l) => l.length > 0)
          .map((l) => decodeURIComponent(l));
        const perPage = Number.parseInt(params.get("per_page") ?? "100", 10);
        const page = Number.parseInt(params.get("page") ?? "1", 10);
        let filtered = issues.filter((i) => stateFilter === "all" || i.state === stateFilter);
        if (labelsFilter.length > 0) {
          filtered = filtered.filter((i) => labelsFilter.every((l) => i.labels.includes(l)));
        }
        const slice = filtered.slice((page - 1) * perPage, page * perPage);
        return { status: 0, stdout: JSON.stringify(slice.map(issueJson)), stderr: "" };
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
          return { status: 0, stdout: JSON.stringify(issueJson(issue)), stderr: "" };
        }
        return { status: 0, stdout: JSON.stringify(issueJson(issue)), stderr: "" };
      }
      const commentsOfMatch = /^repos\/owner\/repo\/issues\/(\d+)\/comments$/.exec(path ?? "");
      if (commentsOfMatch !== null && method === "GET") {
        if (stub.failCommentsList) {
          return { status: 1, stdout: "", stderr: "gh: Server Error (HTTP 500)" };
        }
        const n = Number.parseInt(commentsOfMatch[1] ?? "", 10);
        const perPage = Number.parseInt(params.get("per_page") ?? "100", 10);
        const page = Number.parseInt(params.get("page") ?? "1", 10);
        const list = comments.filter((c) => c.number === n);
        const slice = list.slice((page - 1) * perPage, page * perPage);
        return { status: 0, stdout: JSON.stringify(slice.map(commentJson)), stderr: "" };
      }
      if (commentsOfMatch !== null && method === "POST") {
        const n = Number.parseInt(commentsOfMatch[1] ?? "", 10);
        const comment: StubComment = {
          id: comments.length + 1,
          number: n,
          body: String(inputBody.body ?? ""),
          created_at: "2026-09-08T00:00:00Z",
          updated_at: "2026-09-08T00:00:00Z",
        };
        comments.push(comment);
        return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
      }
      const commentMatch = /^repos\/owner\/repo\/issues\/comments\/(\d+)$/.exec(path ?? "");
      if (commentMatch !== null) {
        const id = Number.parseInt(commentMatch[1] ?? "", 10);
        const comment = comments.find((c) => c.id === id);
        if (comment === undefined) return NOT_FOUND;
        if (method === "PATCH") {
          if (typeof inputBody.body === "string") comment.body = inputBody.body;
          comment.updated_at = "2026-09-08T01:00:00Z";
          return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
        }
        if (method === "DELETE") {
          comments.splice(comments.indexOf(comment), 1);
          // 204 No Content: 本文なし
          return { status: 0, stdout: "", stderr: "" };
        }
        return { status: 0, stdout: JSON.stringify(commentJson(comment)), stderr: "" };
      }
      const pullMatch = /^repos\/owner\/repo\/pulls\/(\d+)$/.exec(path ?? "");
      if (pullMatch !== null && method === "PATCH") {
        const n = Number.parseInt(pullMatch[1] ?? "", 10);
        const pr = prs.find((p) => p.number === n);
        if (pr === undefined) return NOT_FOUND;
        if (typeof inputBody.title === "string") pr.title = inputBody.title;
        if (typeof inputBody.body === "string") pr.body = inputBody.body;
        return {
          status: 0,
          stdout: JSON.stringify({ number: n, html_url: `https://example/p/${n}` }),
          stderr: "",
        };
      }
      return { status: 1, stdout: "", stderr: `stub: unhandled ${method} ${rawPath}` };
    },
  };
  return stub;
}

async function runOp(
  exec: GhExec,
  tempDir: string,
  request: unknown,
): Promise<ReturnType<typeof runAgentdevGhOperation>> {
  const runner = createCliRunner({ repo: "owner/repo", tempDir, exec });
  const env = buildGhToolEnv({ repo: "owner/repo" }, { tempDir: () => tempDir }, runner);
  if (!env.ok) throw new Error("env build failed");
  return runAgentdevGhOperation(env.env, request);
}

function trackingIssue(overrides: Partial<StubIssue> = {}): StubIssue {
  return {
    number: 8,
    title: "追跡",
    body: "B",
    state: "open",
    state_reason: null,
    labels: [
      "agentdev-tracking",
      "agentdev-kind/risk",
      "agentdev-tracking-status/on-hold",
      "priority",
    ],
    ...overrides,
  };
}

describe("CliRunner + engine: issue_update の追跡軸保持（部分更新不変条件・TS-001）", () => {
  test("(a) labels のみ更新で追跡軸が保持され Case 化しない", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ issues: [trackingIssue()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "issue_update",
      number: 8,
      labels: ["enhancement"],
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 8 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      expect(read.success.role).toBe("tracking");
      expect(read.success.kind).toBe("risk");
      expect(read.success.trackingState).toBe("on-hold");
      expect(read.success.labels).toContain("enhancement");
      expect(read.success.labels).not.toContain("priority");
      expect(read.success.labels).toContain("agentdev-kind/risk");
      expect(read.success.labels).toContain("agentdev-tracking-status/on-hold");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("(b) kind のみ更新で状態軸と通常ラベルが保持される", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ issues: [trackingIssue()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "issue_update",
      number: 8,
      kind: "task",
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 8 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      expect(read.success.kind).toBe("task");
      expect(read.success.trackingState).toBe("on-hold");
      expect(read.success.role).toBe("tracking");
      expect(read.success.labels).toContain("priority");
      expect(read.success.labels).not.toContain("agentdev-kind/risk");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("(c) trackingState のみ更新で kind と通常ラベルが保持される", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ issues: [trackingIssue()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "issue_update",
      number: 8,
      trackingState: "ready",
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 8 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      expect(read.success.trackingState).toBe("ready");
      expect(read.success.kind).toBe("risk");
      expect(read.success.role).toBe("tracking");
      expect(read.success.labels).toContain("priority");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("CliRunner + engine: issue_reopen の状態遷移（TS-002）", () => {
  test("クローズ済み追跡Issueは in-discussion へ遷移し kind と通常ラベルを保持する", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      issues: [
        trackingIssue({
          number: 9,
          state: "closed",
          state_reason: "completed",
          labels: ["agentdev-tracking", "agentdev-kind/task", "agentdev-tracking-status/resolved", "priority"],
        }),
      ],
    });
    const result = await runOp(stub.exec, tempDir, { operation: "issue_reopen", number: 9 });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 9 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      expect(read.success.state).toBe("open");
      expect(read.success.trackingState).toBe("in-discussion");
      expect(read.success.kind).toBe("task");
      expect(read.success.labels).toContain("priority");
      expect(read.success.labels).toContain("agentdev-tracking-status/in-discussion");
      expect(read.success.labels).not.toContain("agentdev-tracking-status/resolved");
    }
    const patch = stub.patches.find((p) => p.path === "repos/owner/repo/issues/9");
    expect(patch?.body.state).toBe("open");
    expect(patch?.body.labels).toEqual([
      "agentdev-tracking",
      "agentdev-kind/task",
      "agentdev-tracking-status/in-discussion",
      "priority",
    ]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("open 済み追跡Issueへの reopen 再実行は冪等に成功する（ラベル再構成なし）", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      issues: [
        trackingIssue({
          number: 11,
          labels: ["agentdev-tracking", "agentdev-kind/idea", "agentdev-tracking-status/in-discussion"],
        }),
      ],
    });
    const first = await runOp(stub.exec, tempDir, { operation: "issue_reopen", number: 11 });
    expect(first.ok).toBe(true);
    const second = await runOp(stub.exec, tempDir, { operation: "issue_reopen", number: 11 });
    expect(second.ok).toBe(true);
    const patch = stub.patches.find((p) => p.path === "repos/owner/repo/issues/11");
    expect(patch?.body.labels).toBeUndefined();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("Case Issue への reopen には追跡状態遷移を適用しない", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      issues: [
        {
          number: 12,
          title: "Case",
          body: "B",
          state: "closed",
          state_reason: "completed",
          labels: ["bug"],
        },
      ],
    });
    const result = await runOp(stub.exec, tempDir, { operation: "issue_reopen", number: 12 });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 12 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "issue_read") {
      expect(read.success.role).toBe("case");
      expect(read.success.labels).toEqual(["bug"]);
    }
    const patch = stub.patches.find((p) => p.path === "repos/owner/repo/issues/12");
    expect(patch?.body.labels).toBeUndefined();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("CliRunner + engine: 一覧完全性（TS-008 / TS-009）", () => {
  test("comment_list は35件フィクスチャで全件を返す（30件黙示切断なし）", async () => {
    const tempDir = makeTempDir();
    const comments: StubComment[] = Array.from({ length: 35 }, (_, i) => ({
      id: i + 1,
      number: 7,
      body: `コメント ${i + 1}`,
      created_at: "2026-09-08T00:00:00Z",
      updated_at: "2026-09-08T00:00:00Z",
    }));
    const stub = githubStub({ comments });
    const result = await runOp(stub.exec, tempDir, {
      operation: "comment_list",
      number: 7,
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "comment_list") {
      expect(result.success.comments.length).toBe(35);
      expect(result.success.comments[0]?.commentId).toBe("1");
      expect(result.success.comments[34]?.commentId).toBe("35");
      expect(result.success.comments[0]?.body).toBe("コメント 1");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("comment_list は複数ページ（100 + 30）を完全取得する", async () => {
    const tempDir = makeTempDir();
    const comments: StubComment[] = Array.from({ length: 130 }, (_, i) => ({
      id: i + 1,
      number: 7,
      body: `c${i + 1}`,
      created_at: "2026-09-08T00:00:00Z",
      updated_at: "2026-09-08T00:00:00Z",
    }));
    const stub = githubStub({ comments });
    const result = await runOp(stub.exec, tempDir, { operation: "comment_list", number: 7 });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "comment_list") {
      expect(result.success.comments.length).toBe(130);
    }
    expect(stub.requests.filter((r) => r.includes("/comments?")).length).toBe(2);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("comment_list は安全上限到達時に operation-failed を返す", async () => {
    const tempDir = makeTempDir();
    const comments: StubComment[] = Array.from({ length: 1001 }, (_, i) => ({
      id: i + 1,
      number: 7,
      body: `c${i + 1}`,
      created_at: "2026-09-08T00:00:00Z",
      updated_at: "2026-09-08T00:00:00Z",
    }));
    const stub = githubStub({ comments });
    const result = await runOp(stub.exec, tempDir, { operation: "comment_list", number: 7 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("operation-failed");
      expect(result.failure.retryable).toBe(true);
      expect(result.failure.detail).toContain("safety page limit");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_list は安全上限到達時に再試行可能な失敗（operation-failed）を返す", async () => {
    const tempDir = makeTempDir();
    const issues: StubIssue[] = Array.from({ length: 1000 }, (_, i) => ({
      number: i + 1,
      title: `i${i + 1}`,
      body: "B",
      state: "open" as const,
      state_reason: null,
      labels: [],
    }));
    const stub = githubStub({ issues });
    const result = await runOp(stub.exec, tempDir, { operation: "issue_list" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("operation-failed");
      expect(result.failure.retryable).toBe(true);
      expect(result.failure.detail).toContain("safety page limit");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_list は狭いフィルタ（kind）をサーバ側絞り込みクエリへ推送する", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      issues: [
        trackingIssue({ number: 1, labels: ["agentdev-tracking", "agentdev-kind/problem"] }),
        trackingIssue({ number: 2, labels: ["agentdev-tracking", "agentdev-kind/risk"] }),
        { number: 3, title: "case", body: "B", state: "open", state_reason: null, labels: ["bug"] },
      ],
    });
    const result = await runOp(stub.exec, tempDir, {
      operation: "issue_list",
      kind: "problem",
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "issue_list") {
      expect(result.success.issues.map((i) => i.number)).toEqual([1]);
    }
    expect(
      stub.requests.some((r) => r.includes("labels=agentdev-kind%2Fproblem")),
    ).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("issue_list は複数ページ（150件 = 100 + 50）を完全取得する", async () => {
    const tempDir = makeTempDir();
    const issues: StubIssue[] = Array.from({ length: 150 }, (_, i) => ({
      number: i + 1,
      title: `i${i + 1}`,
      body: "B",
      state: "open" as const,
      state_reason: null,
      labels: [],
    }));
    const stub = githubStub({ issues });
    const result = await runOp(stub.exec, tempDir, { operation: "issue_list" });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "issue_list") {
      expect(result.success.issues.length).toBe(150);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("CliRunner + engine: pr_update と pr_read（TS-010 / TS-011）", () => {
  function stubPr(): StubPr {
    return { number: 9, title: "旧タイトル", body: "旧本文", state: "open", mergeable: "MERGEABLE" };
  }

  test("(a) title のみ更新: 未指定の body は保持される", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ prs: [stubPr()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "pr_update",
      number: 9,
      title: "新タイトル",
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "pr_read", number: 9 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "pr_read") {
      expect(read.success.title).toBe("新タイトル");
      expect(read.success.body).toBe("旧本文");
    }
    const patch = stub.patches.find((p) => p.path === "repos/owner/repo/pulls/9");
    expect(patch?.body).toEqual({ title: "新タイトル" });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("(b) body のみ更新: 未指定の title は保持される", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ prs: [stubPr()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "pr_update",
      number: 9,
      body: "新本文",
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "pr_read", number: 9 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "pr_read") {
      expect(read.success.title).toBe("旧タイトル");
      expect(read.success.body).toBe("新本文");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("(c) title と body の両方を更新すると両方が反映される", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ prs: [stubPr()] });
    const result = await runOp(stub.exec, tempDir, {
      operation: "pr_update",
      number: 9,
      title: "新タイトル",
      body: "新本文",
    });
    expect(result.ok).toBe(true);
    const read = await runOp(stub.exec, tempDir, { operation: "pr_read", number: 9 });
    expect(read.ok).toBe(true);
    if (read.ok && read.success.operation === "pr_read") {
      expect(read.success.title).toBe("新タイトル");
      expect(read.success.body).toBe("新本文");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("pr_mergeable は単一読取の正規化結果（UNKNOWN 含む）を返し、連続読取値変化だけで失敗しない", async () => {
    const tempDir = makeTempDir();
    const pr = stubPr();
    pr.mergeable = "UNKNOWN";
    const stub = githubStub({ prs: [pr] });
    const first = await runOp(stub.exec, tempDir, { operation: "pr_mergeable", number: 9 });
    expect(first.ok).toBe(true);
    if (first.ok && first.success.operation === "pr_mergeable") {
      expect(first.success.mergeable).toBe("UNKNOWN");
    }
    pr.mergeable = "MERGEABLE";
    const second = await runOp(stub.exec, tempDir, { operation: "pr_mergeable", number: 9 });
    expect(second.ok).toBe(true);
    if (second.ok && second.success.operation === "pr_mergeable") {
      expect(second.success.mergeable).toBe("MERGEABLE");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("CliRunner + engine: Comment CRUD（TS-012 / TS-014）", () => {
  test("comment_create は commentId を文字列で返し、クローズ済み Issue でも本文照合で成功する", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      issues: [
        { number: 7, title: "T", body: "B", state: "closed", state_reason: "completed", labels: [] },
      ],
    });
    const result = await runOp(stub.exec, tempDir, {
      operation: "comment_create",
      number: 7,
      body: "追加コメント",
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.success.operation === "comment_create") {
      expect(result.success.commentId).toBe("1");
      expect(result.success.url).toBe("https://example/c/1");
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("comment_update は commentId で対象を更新し読み戻しで本文を確認する", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      comments: [
        { id: 101, number: 7, body: "元本文", created_at: "2026-09-08T00:00:00Z", updated_at: "2026-09-08T00:00:00Z" },
      ],
    });
    const result = await runOp(stub.exec, tempDir, {
      operation: "comment_update",
      commentId: "101",
      body: "修正本文",
    });
    expect(result.ok).toBe(true);
    expect(stub.comments[0]?.body).toBe("修正本文");
    expect(
      stub.patches.some((p) => p.path === "repos/owner/repo/issues/comments/101"),
    ).toBe(true);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("comment_delete は対象コメントの不在を確認して成功する", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({
      comments: [
        { id: 101, number: 7, body: "削除対象", created_at: "2026-09-08T00:00:00Z", updated_at: "2026-09-08T00:00:00Z" },
        { id: 102, number: 7, body: "残存", created_at: "2026-09-08T00:00:00Z", updated_at: "2026-09-08T00:00:00Z" },
      ],
    });
    const result = await runOp(stub.exec, tempDir, {
      operation: "comment_delete",
      commentId: "101",
    });
    expect(result.ok).toBe(true);
    expect(stub.comments.map((c) => c.id)).toEqual([102]);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("Comment WRITE 成功後に読み戻し（comment_list）のみ失敗する場合は verification-incomplete", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({ issues: [trackingIssue({ number: 7 })] });
    const created = await runOp(stub.exec, tempDir, {
      operation: "comment_create",
      number: 7,
      body: "本文",
    });
    expect(created.ok).toBe(true);
    stub.failCommentsList = true;
    const second = await runOp(stub.exec, tempDir, {
      operation: "comment_create",
      number: 7,
      body: "本文2",
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.failure.kind).toBe("verification-incomplete");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("存在しない commentId への comment_update は operation-failed（invalid-input とならない）", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({});
    const result = await runOp(stub.exec, tempDir, {
      operation: "comment_update",
      commentId: "999",
      body: "本文",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("operation-failed");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("存在しない Issue 番号への issue_read は operation-failed（invalid-input とならない）", async () => {
    const tempDir = makeTempDir();
    const stub = githubStub({});
    const result = await runOp(stub.exec, tempDir, { operation: "issue_read", number: 999 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("operation-failed");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("HTTP 422 相当の gh 失敗は operation-failed に分類される", async () => {
    const tempDir = makeTempDir();
    const { exec } = fakeExec(() => ({
      status: 1,
      stdout: "",
      stderr: "gh: Validation Failed (HTTP 422)",
    }));
    const reply = await run(exec, tempDir, { operation: "issue_read", args: { number: 5 } });
    expect(reply.ok).toBe(false);
    if (!reply.ok) {
      expect(reply.failureClass).toBe("operation-failed");
      expect(reply.exitCode).toBe(1);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("Tool/runner 異常（gh 起動失敗）は enforcement-crashed に分類される", async () => {
    const tempDir = makeTempDir();
    const { exec } = fakeExec(() => ({ status: null, stdout: "", stderr: "" }));
    const reply = await run(exec, tempDir, { operation: "issue_read", args: { number: 5 } });
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.failureClass).toBe("enforcement-crashed");
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
