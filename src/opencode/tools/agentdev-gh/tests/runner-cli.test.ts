// GitHub 実装（CliRunner）のテスト。
//
// gh 実行は注入された偽 exec で置き換え、実コマンドを実行しない。
// 検証観点: 引数組み立て（シェル不使用の引数配列、--input ファイル渡し、
// inline --title/--body 不使用）、一時ファイルの BOM なし UTF-8 と必ず削除、
// 終了コードと JSON 解析の失敗分類、gh pr view 応答の正規化。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { createCliRunner, type GhExec } from "../runner-cli.ts";
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

  test("issue_comment は body 省略時にコメント一覧を返す", async () => {
    const { exec, calls } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify([
        { body: "1件目", created_at: "2026-08-25T01:00:00Z", html_url: "https://example/c/1" },
        { body: "2件目", created_at: "2026-08-25T02:00:00Z", html_url: "https://example/c/2" },
      ]),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), {
      operation: "issue_comment",
      args: { number: 7 },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      const comments = payload.comments as Record<string, unknown>[];
      expect(comments.length).toBe(2);
      expect(comments[0]?.body).toBe("1件目");
      expect(comments[0]?.createdAt).toBe("2026-08-25T01:00:00Z");
    }
    expect(calls[0]?.args).toContain("repos/owner/repo/issues/7/comments");
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

  test("issue_reopen は state=open の PATCH を送り open を確認する", async () => {
    const tempDir = makeTempDir();
    let body = "";
    const { exec, calls } = fakeExec((call) => {
      const i = call.args.indexOf("--input");
      if (i >= 0) body = fs.readFileSync(call.args[i + 1] as string, "utf8");
      return {
        status: 0,
        stdout: JSON.stringify({ number: 7, state: "OPEN" }),
        stderr: "",
      };
    });
    const reply = await run(exec, tempDir, { operation: "issue_reopen", args: { number: 7 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ number: 7, state: "open" });
    }
    expect(JSON.parse(body)).toEqual({ state: "open", state_reason: null });
    expect(calls[0]?.args.slice(0, 4)).toEqual(["api", "-X", "PATCH", "repos/owner/repo/issues/7"]);
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

  test("pr_read は gh pr view の OPEN/MERGED を小文字へ正規化する", async () => {
    const { exec } = fakeExec(() => ({
      status: 0,
      stdout: JSON.stringify({ number: 9, title: "P", state: "MERGED", mergeable: "MERGEABLE" }),
      stderr: "",
    }));
    const reply = await run(exec, makeTempDir(), { operation: "pr_read", args: { number: 9 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ number: 9, title: "P", state: "merged", mergeable: "MERGEABLE" });
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
