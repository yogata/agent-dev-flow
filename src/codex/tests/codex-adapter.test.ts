//
// Codex ホストの agentdev_gh adapter（操作契約 surface と CLI）のテスト。
//
// プラグイン経路（既定）を偽 transport のステートフル stub で通しで検証する
// （実ネットワークなし）。主要操作系列が engine の VERIFY を通過すること、
// コメント削除（tool 面に無い操作）が設計どおり停止すること、読み戻し照合
// だけが失敗する状態が成功扱いにならないことを検証する。CLI は実起動
// （bun spawn）で引数異常とトークン未設定の停止を検証する。
//

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { mainOperationSequence, executeStepOnSurface } from "../../common/tools/agentdev-gh/tests/four-combination-shared.ts";
import { createPluginRunner, type PluginTransport } from "../../common/tools/agentdev-gh/plugin-runner.ts";
import {
  createAgentdevGhRouteAdapterSurface,
  runAgentdevGhRouteAdapter,
  type AgentdevGhRouteAdapterDeps,
} from "../../common/tools/agentdev-gh/route-adapter.ts";
import { createCodexPluginRouteRunner } from "../github/agentdev-gh-adapter.ts";
import { createCodexPluginMapping } from "../github/codex-plugin-mapping.ts";

const REPO = "owner/repo";

interface StubIssue {
  readonly number: number;
  title: string;
  body: string;
  state: string;
  state_reason: string | null;
  labels: string[];
}

interface StubComment {
  readonly id: number;
  readonly number: number;
  body: string;
}

function issueJson(issue: StubIssue): Record<string, unknown> {
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    state_reason: issue.state_reason,
    labels: issue.labels.map((name) => ({ name })),
    updated_at: "2026-11-27T00:00:00Z",
    html_url: `https://example/i/${issue.number}`,
  };
}

function commentJson(comment: StubComment): Record<string, unknown> {
  return {
    id: comment.id,
    body: comment.body,
    created_at: "2026-11-27T00:00:00Z",
    updated_at: "2026-11-27T00:00:00Z",
    html_url: `https://example/i/${comment.number}#issuecomment-${comment.id}`,
    issue_url: `https://api.github.com/repos/${REPO}/issues/${comment.number}`,
  };
}

/** tool 面（GitHub hosted MCP server の tool 引数・応答）のステートフル stub。 */
function createPluginFaceStub(tamperCommentReadback = false): {
  transport: PluginTransport;
  issues: StubIssue[];
  comments: StubComment[];
} {
  const issues: StubIssue[] = [];
  const comments: StubComment[] = [];
  const transport: PluginTransport = {
    async invoke(call) {
      const a = call.args as Record<string, unknown>;
      if (call.tool === "issue_write" && a.method === "create") {
        const issue: StubIssue = {
          number: issues.length + 1,
          title: String(a.title ?? ""),
          body: String(a.body ?? ""),
          state: "open",
          state_reason: null,
          labels: Array.isArray(a.labels) ? (a.labels as string[]) : [],
        };
        issues.push(issue);
        return { ok: true, payload: issueJson(issue) };
      }
      if (call.tool === "issue_write" && a.method === "update") {
        const issue = issues.find((i) => i.number === a.issue_number);
        if (issue === undefined) return { ok: false, kind: "operation-failed", error: "not found" };
        if (typeof a.title === "string") issue.title = a.title;
        if (typeof a.body === "string") issue.body = a.body;
        if (Array.isArray(a.labels)) issue.labels = [...(a.labels as string[])];
        if (a.state === "open" || a.state === "closed") {
          issue.state = a.state;
          issue.state_reason = (a.state_reason as string | null) ?? null;
        }
        return { ok: true, payload: issueJson(issue) };
      }
      if (call.tool === "issue_read" && a.method === "get") {
        const issue = issues.find((i) => i.number === a.issue_number);
        if (issue === undefined) return { ok: false, kind: "operation-failed", error: "not found" };
        return { ok: true, payload: issueJson(issue) };
      }
      if (call.tool === "issue_read" && a.method === "get_comments") {
        const page = typeof a.page === "number" ? a.page : 1;
        const perPage = typeof a.perPage === "number" ? a.perPage : 100;
        const of = comments.filter((c) => c.number === a.issue_number);
        const start = (page - 1) * perPage;
        const slice = of.slice(start, start + perPage).map(commentJson);
        if (tamperCommentReadback) {
          for (const entry of slice) entry.body = "tampered";
        }
        return { ok: true, payload: slice };
      }
      if (call.tool === "add_issue_comment") {
        const comment: StubComment = {
          id: comments.length + 1,
          number: a.issue_number as number,
          body: String(a.body ?? ""),
        };
        comments.push(comment);
        return { ok: true, payload: commentJson(comment) };
      }
      if (call.tool === "update_issue_comment") {
        const comment = comments.find((c) => c.id === a.comment_id);
        if (comment === undefined) return { ok: false, kind: "operation-failed", error: "not found" };
        comment.body = String(a.body ?? "");
        return { ok: true, payload: commentJson(comment) };
      }
      return { ok: false, kind: "operation-unsupported", error: `stub: unhandled tool ${call.tool}` };
    },
  };
  return { transport, issues, comments };
}
function depsWithTransport(transport: PluginTransport): AgentdevGhRouteAdapterDeps {
  return {
    host: "codex",
    createPluginRunnerOf: (repo) => createPluginRunner(createCodexPluginMapping({ repo }), transport),
    resolveRepo: () => ({ repo: REPO }),
  };
}

function makeTempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "codex-adapter-"));
}

function rmrf(p: string): void {
  fs.rmSync(p, { recursive: true, force: true });
}

describe("Codex adapter / プラグイン経路（既定）の操作契約", () => {
  test("主要操作系列（コメント削除を除く）が engine の VERIFY を通過する", async () => {
    const stub = createPluginFaceStub();
    const surface = createAgentdevGhRouteAdapterSurface(depsWithTransport(stub.transport));
    const root = makeTempRoot();
    try {
      const steps = mainOperationSequence("1").filter((s) => s.operation !== "comment_delete");
      const outcomes = [];
      for (const step of steps) {
        outcomes.push(await executeStepOnSurface(surface, root, step));
      }
      expect(outcomes.every((o) => o.ok)).toBe(true);
      expect(stub.issues).toHaveLength(1);
      expect(stub.issues[0]?.labels).toContain("tracking");
      expect(stub.issues[0]?.state).toBe("open");
      expect(stub.comments).toHaveLength(1);
      expect(stub.comments[0]?.body).toBe("検討経過 更新後");
    } finally {
      rmrf(root);
    }
  });

  test("コメント削除は tool 面に操作が無いため設計どおり停止する", async () => {
    const stub = createPluginFaceStub();
    const root = makeTempRoot();
    try {
      const surface = createAgentdevGhRouteAdapterSurface(depsWithTransport(stub.transport));
      const outcome = await executeStepOnSurface(surface, root, { operation: "comment_delete", args: { commentId: "1" } });
      expect(outcome.ok).toBe(false);
      expect(outcome.failure?.kind).toBe("operation-failed");
      expect(outcome.failure?.detail).toContain("does not provide the operation: comment_delete");
      expect(stub.comments).toHaveLength(0);
    } finally {
      rmrf(root);
    }
  });

  test("読み戻し照合だけが失敗する状態は成功扱いにならない（verification-incomplete）", async () => {
    const stub = createPluginFaceStub(true);
    const root = makeTempRoot();
    try {
      const surface = createAgentdevGhRouteAdapterSurface(depsWithTransport(stub.transport));
      const outcome = await executeStepOnSurface(surface, root, { operation: "comment_create", args: { number: 1, body: "本文" } });
      expect(outcome.ok).toBe(false);
      expect(outcome.failure?.kind).toBe("verification-incomplete");
      expect(stub.comments).toHaveLength(1);
    } finally {
      rmrf(root);
    }
  });

  test("トークン未設定のプラグイン経路は操作の前に停止する（plugin-unavailable）", async () => {
    const root = makeTempRoot();
    try {
      const deps: AgentdevGhRouteAdapterDeps = {
        host: "codex",
        createPluginRunnerOf: (repo) => createCodexPluginRouteRunner(repo, null),
        resolveRepo: () => ({ repo: REPO }),
      };
      const r = await runAgentdevGhRouteAdapter(deps, root, { operation: "issue_read", number: 1 });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.failure.kind).toBe("operation-failed");
        expect(r.failure.detail).toContain("GITHUB_PAT_TOKEN is not set");
      }
    } finally {
      rmrf(root);
    }
  });
});

describe("Codex adapter / CLI の実起動", () => {
  const ADAPTER = path.resolve(import.meta.dir, "../github/agentdev-gh-adapter.ts");

  function runCli(args: readonly string[], cwd: string, env: Record<string, string>): { status: number | null; stdout: string; stderr: string } {
    const r = spawnSync("bun", [ADAPTER, ...args], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
  }

  test("--input を欠く場合は invalid-input で終了 1", () => {
    const r = runCli([], makeTempRoot(), { AGENTDEV_GH_REPO: REPO });
    expect(r.status).toBe(1);
    const parsed = JSON.parse(r.stdout) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("invalid-input");
  });

  test("プラグイン経路・トークンなしは plugin 停止の JSON を出して終了 1", () => {
    const root = makeTempRoot();
    try {
      const requestFile = path.join(root, "request.json");
      fs.writeFileSync(requestFile, JSON.stringify({ operation: "issue_read", number: 1 }));
      const r = runCli(["--input", requestFile], root, { AGENTDEV_GH_REPO: REPO, GITHUB_PAT_TOKEN: "" });
      expect(r.status).toBe(1);
      const parsed = JSON.parse(r.stdout) as { ok: boolean; failure: { kind: string; detail: string } };
      expect(parsed.ok).toBe(false);
      expect(parsed.failure.detail).toContain("GITHUB_PAT_TOKEN is not set");
    } finally {
      rmrf(root);
    }
  });
});
