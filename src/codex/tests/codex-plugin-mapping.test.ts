// Codex GitHub プラグイン対応付け（純粋な PluginMapping）のテスト。
//
// 20 操作の全量について、capability 表との一致、plan の tool 名と引数（明示的な
// owner/repo 注入）、MCP/REST 形 fixture の interpret が操作スペックの parseSuccess
// に受理されることを、fake transport を介した createPluginRunner 駆動で検証する。
// unsupported 操作は plan が空で transport が 1 度も呼ばれないことを検証する。

import { describe, expect, test } from "bun:test";
import { GH_TOOL_OPERATIONS, type GhToolOperation } from "../../common/tools/agentdev-gh/contracts.ts";
import { AGENTDEV_GH_OPERATION_SPECS } from "../../common/tools/agentdev-gh/index.ts";
import {
  createPluginRunner,
  type PluginCall,
  type PluginTransport,
} from "../../common/tools/agentdev-gh/plugin-runner.ts";
import { CODEX_PLUGIN_CAPABILITIES, createCodexPluginMapping } from "../github/codex-plugin-mapping.ts";

const REPO = "octo/hello";
const OWNER = "octo";
const NAME = "hello";
const ISSUES_URL = `https://github.com/${REPO}/issues`;

function specOf(operation: GhToolOperation) {
  const spec = AGENTDEV_GH_OPERATION_SPECS.find((s) => s.operation === operation);
  if (spec === undefined) throw new Error(`spec not found: ${operation}`);
  return spec;
}

type Route = (call: PluginCall, index: number) => unknown;

function fakeTransport(route: Route) {
  const calls: PluginCall[] = [];
  const transport: PluginTransport = {
    async invoke(call) {
      calls.push(call);
      return { ok: true, payload: route(call, calls.length - 1) };
    },
  };
  return { transport, calls };
}

async function runOp(operation: GhToolOperation, args: Record<string, unknown>, route: Route) {
  const { transport, calls } = fakeTransport(route);
  const runner = createPluginRunner(createCodexPluginMapping({ repo: REPO }), transport);
  const reply = await runner.run({ operation, args });
  return { reply, calls };
}

function restIssue(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    number: 7,
    title: "issue title",
    body: "issue body",
    state: "open",
    labels: [{ name: "area" }],
    state_reason: null,
    updated_at: "2026-11-01T00:00:00Z",
    html_url: `${ISSUES_URL}/7`,
    ...overrides,
  };
}

function restPr(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    number: 5,
    title: "pr title",
    body: "pr body",
    state: "open",
    merged: false,
    mergeable: true,
    draft: false,
    base: { ref: "main" },
    head: { ref: "feature" },
    html_url: `${ISSUES_URL}/5`,
    ...overrides,
  };
}

function restComment(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 1,
    body: "c1",
    created_at: "2026-11-02T00:00:00Z",
    updated_at: "2026-11-03T00:00:00Z",
    html_url: `${ISSUES_URL}/7#issuecomment-1`,
    issue_url: `${ISSUES_URL}/7`,
    ...overrides,
  };
}

function restRelease(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    tag_name: "v1.0.0",
    name: "r1",
    body: "rb",
    draft: false,
    prerelease: false,
    published_at: "2026-11-20T00:00:00Z",
    html_url: `https://github.com/${REPO}/releases/tag/v1.0.0`,
    ...overrides,
  };
}

function fullPage(): unknown[] {
  return Array.from({ length: 100 }, (_, i) => restIssue({ number: i + 1 }));
}

interface SupportedScenario {
  readonly args: Record<string, unknown>;
  readonly fixtures: readonly unknown[];
  readonly expectedCalls: readonly PluginCall[];
  readonly expectedSuccess: Record<string, unknown>;
}

const SUPPORTED_SCENARIOS: Readonly<Record<string, SupportedScenario>> = {
  issue_create: {
    args: { title: "t", body: "b", labels: ["a"], role: "case" },
    fixtures: [restIssue({ number: 12, html_url: `${ISSUES_URL}/12` })],
    expectedCalls: [
      { tool: "issue_write", args: { owner: OWNER, repo: NAME, method: "create", title: "t", body: "b", labels: ["a"] } },
    ],
    expectedSuccess: { operation: "issue_create", number: 12, url: `${ISSUES_URL}/12` },
  },
  issue_read: {
    args: { number: 7 },
    fixtures: [restIssue()],
    expectedCalls: [
      { tool: "issue_read", args: { owner: OWNER, repo: NAME, method: "get", issue_number: 7 } },
    ],
    expectedSuccess: {
      operation: "issue_read",
      number: 7,
      title: "issue title",
      body: "issue body",
      state: "open",
      labels: ["area"],
      role: "case",
      closeReason: null,
      updatedAt: "2026-11-01T00:00:00Z",
    },
  },
  issue_update: {
    args: { number: 7, title: "new title" },
    fixtures: [restIssue(), restIssue({ title: "new title" })],
    expectedCalls: [
      { tool: "issue_read", args: { owner: OWNER, repo: NAME, method: "get", issue_number: 7 } },
      { tool: "issue_write", args: { owner: OWNER, repo: NAME, method: "update", issue_number: 7, title: "new title" } },
    ],
    expectedSuccess: { operation: "issue_update", number: 7, url: `${ISSUES_URL}/7` },
  },
  issue_close: {
    args: { number: 7, reason: "not_planned" },
    fixtures: [restIssue({ state: "closed", state_reason: "not_planned" })],
    expectedCalls: [
      { tool: "issue_write", args: { owner: OWNER, repo: NAME, method: "update", issue_number: 7, state: "closed", state_reason: "not_planned" } },
    ],
    expectedSuccess: { operation: "issue_close", number: 7, state: "closed" },
  },
  issue_reopen: {
    args: { number: 7 },
    fixtures: [restIssue({ state: "closed", state_reason: "not_planned" }), restIssue()],
    expectedCalls: [
      { tool: "issue_read", args: { owner: OWNER, repo: NAME, method: "get", issue_number: 7 } },
      { tool: "issue_write", args: { owner: OWNER, repo: NAME, method: "update", issue_number: 7, state: "open" } },
    ],
    expectedSuccess: { operation: "issue_reopen", number: 7, state: "open" },
  },
  issue_list: {
    args: { state: "open", labels: ["area"] },
    fixtures: [[
      restIssue(),
      restIssue({ number: 8, html_url: `${ISSUES_URL}/8`, labels: [{ name: "area" }, { name: "tracking" }], state: "closed", state_reason: "completed" }),
    ]],
    expectedCalls: [
      { tool: "list_issues", args: { owner: OWNER, repo: NAME, perPage: 100, state: "open", labels: ["area"] } },
    ],
    expectedSuccess: {
      operation: "issue_list",
      issues: [
        { number: 7, title: "issue title", url: `${ISSUES_URL}/7`, state: "open", labels: ["area"], role: "case", closeReason: null },
        { number: 8, title: "issue title", url: `${ISSUES_URL}/8`, state: "closed", labels: ["area", "tracking"], role: "tracking", closeReason: "completed" },
      ],
    },
  },
  pr_create: {
    args: { title: "t", body: "d", base: "main", head: "feature" },
    fixtures: [restPr()],
    expectedCalls: [
      { tool: "create_pull_request", args: { owner: OWNER, repo: NAME, title: "t", body: "d", head: "feature", base: "main" } },
    ],
    expectedSuccess: { operation: "pr_create", number: 5, url: `${ISSUES_URL}/5` },
  },

  pr_read: {
    args: { number: 5 },
    fixtures: [restPr()],
    expectedCalls: [
      { tool: "pull_request_read", args: { owner: OWNER, repo: NAME, method: "get", pullNumber: 5 } },
    ],
    expectedSuccess: {
      operation: "pr_read",
      number: 5,
      title: "pr title",
      body: "pr body",
      state: "open",
      mergeable: "MERGEABLE",
      isDraft: false,
    },
  },
  pr_mergeable: {
    args: { number: 5 },
    fixtures: [restPr()],
    expectedCalls: [
      { tool: "pull_request_read", args: { owner: OWNER, repo: NAME, method: "get", pullNumber: 5 } },
    ],
    expectedSuccess: { operation: "pr_mergeable", number: 5, mergeable: "MERGEABLE" },
  },
  pr_merge: {
    args: { number: 5, method: "squash" },
    fixtures: [{ merged: true }],
    expectedCalls: [
      { tool: "merge_pull_request", args: { owner: OWNER, repo: NAME, pullNumber: 5, merge_method: "squash" } },
    ],
    expectedSuccess: { operation: "pr_merge", number: 5, merged: true },
  },
  pr_changed_files: {
    args: { number: 5 },
    fixtures: [[{ filename: "a.ts" }, { filename: "b.ts" }], []],
    expectedCalls: [
      { tool: "pull_request_read", args: { owner: OWNER, repo: NAME, method: "get_files", pullNumber: 5, page: 1, perPage: 100 } },
      { tool: "pull_request_read", args: { owner: OWNER, repo: NAME, method: "get_files", pullNumber: 5, page: 2, perPage: 100 } },
    ],
    expectedSuccess: { operation: "pr_changed_files", number: 5, files: ["a.ts", "b.ts"] },
  },
  pr_update: {
    args: { number: 5, title: "nt" },
    fixtures: [restPr()],
    expectedCalls: [
      { tool: "update_pull_request", args: { owner: OWNER, repo: NAME, pullNumber: 5, title: "nt" } },
    ],
    expectedSuccess: { operation: "pr_update", number: 5, url: `${ISSUES_URL}/5` },
  },

  comment_create: {
    args: { number: 7, body: "c" },
    fixtures: [restComment({ id: 99, body: "c", html_url: `${ISSUES_URL}/7#issuecomment-99` })],
    expectedCalls: [
      { tool: "add_issue_comment", args: { owner: OWNER, repo: NAME, issue_number: 7, body: "c" } },
    ],
    expectedSuccess: { operation: "comment_create", commentId: "99", url: `${ISSUES_URL}/7#issuecomment-99` },
  },
  comment_list: {
    args: { number: 7 },
    fixtures: [[restComment()], []],
    expectedCalls: [
      { tool: "issue_read", args: { owner: OWNER, repo: NAME, method: "get_comments", issue_number: 7, page: 1, perPage: 100 } },
      { tool: "issue_read", args: { owner: OWNER, repo: NAME, method: "get_comments", issue_number: 7, page: 2, perPage: 100 } },
    ],
    expectedSuccess: {
      operation: "comment_list",
      number: 7,
      comments: [
        { commentId: "1", body: "c1", createdAt: "2026-11-02T00:00:00Z", updatedAt: "2026-11-03T00:00:00Z", url: `${ISSUES_URL}/7#issuecomment-1` },
      ],
    },
  },
  comment_update: {
    args: { commentId: "99", body: "n" },
    fixtures: [restComment({ id: 99, body: "n", html_url: `${ISSUES_URL}/7#issuecomment-99` })],
    expectedCalls: [
      { tool: "update_issue_comment", args: { owner: OWNER, repo: NAME, comment_id: 99, body: "n" } },
    ],
    expectedSuccess: { operation: "comment_update", commentId: "99", url: `${ISSUES_URL}/7#issuecomment-99` },
  },
  release_list: {
    args: {},
    fixtures: [[restRelease()], []],
    expectedCalls: [
      { tool: "list_releases", args: { owner: OWNER, repo: NAME, page: 1, perPage: 100 } },
      { tool: "list_releases", args: { owner: OWNER, repo: NAME, page: 2, perPage: 100 } },
    ],
    expectedSuccess: {
      operation: "release_list",
      releases: [
        { tagName: "v1.0.0", title: "r1", draft: false, prerelease: false, url: `https://github.com/${REPO}/releases/tag/v1.0.0` },
      ],
    },
  },
  release_read: {
    args: { tagName: "v1.0.0" },
    fixtures: [restRelease()],
    expectedCalls: [
      { tool: "get_release_by_tag", args: { owner: OWNER, repo: NAME, tag: "v1.0.0" } },
    ],
    expectedSuccess: {
      operation: "release_read",
      tagName: "v1.0.0",
      title: "r1",
      body: "rb",
      draft: false,
      prerelease: false,
      url: `https://github.com/${REPO}/releases/tag/v1.0.0`,
      publishedAt: "2026-11-20T00:00:00Z",
    },
  },
};

const UNSUPPORTED_OPERATIONS = ["comment_delete", "release_create", "release_publish"] as const;

const UNSUPPORTED_ARGS: Readonly<Record<string, Record<string, unknown>>> = {
  comment_delete: { commentId: "99" },
  release_create: { tagName: "v1.0.0", title: "t", body: "b", prerelease: false },
  release_publish: { tagName: "v1.0.0", approvalBasis: "HITL 質問 ID: q1、回答の記録参照: rec-1" },
};

describe("Codex GitHub プラグイン対応付け", () => {
  test("20 操作の全量が capability 表に 1 件ずつ並び、supports が表と一致する", () => {
    const mapping = createCodexPluginMapping({ repo: REPO });
    expect(CODEX_PLUGIN_CAPABILITIES).toHaveLength(20);
    for (const operation of GH_TOOL_OPERATIONS) {
      const entries = CODEX_PLUGIN_CAPABILITIES.filter((c) => c.operation === operation);
      expect(entries).toHaveLength(1);
      const capability = entries[0];
      if (capability === undefined) throw new Error(`missing capability: ${operation}`);
      expect(mapping.supports(operation)).toBe(capability.supported);
    }
  });

  test("capability 表の supported の基準（17 supported / 3 unsupported）が宣言どおりである", () => {
    const supported = CODEX_PLUGIN_CAPABILITIES.filter((c) => c.supported);
    const unsupported = CODEX_PLUGIN_CAPABILITIES.filter((c) => !c.supported);
    expect(supported).toHaveLength(17);
    expect(unsupported.map((c) => c.operation).sort()).toEqual([...UNSUPPORTED_OPERATIONS].sort());
    expect(unsupported.every((c) => c.supported === false && c.tools.length === 0)).toBe(true);
  });

  for (const [operation, scenario] of Object.entries(SUPPORTED_SCENARIOS)) {
    test(`supported 操作 ${operation}: plan の tool 名と引数（明示 owner/repo）と interpret の parseSuccess 受容`, async () => {
      const op = operation as GhToolOperation;
      const { reply, calls } = await runOp(op, scenario.args, (_call, index) => scenario.fixtures[index]);
      expect(calls).toEqual(scenario.expectedCalls);
      expect(calls).toHaveLength(scenario.expectedCalls.length);
      expect(reply.ok).toBe(true);
      if (!reply.ok) throw new Error(reply.error);
      expect(specOf(op).parseSuccess(reply.payload)).toEqual(scenario.expectedSuccess);
    });
  }

  test("issue_update の labels 要求は副作用前に空 plan で停止する", async () => {
    const { reply, calls } = await runOp(
      "issue_update",
      { number: 7, labels: ["area"] },
      () => restIssue(),
    );
    expect(calls).toHaveLength(0);
    expect(reply.ok).toBe(false);
    if (!reply.ok) expect(reply.error).toContain("does not provide the operation: issue_update");
  });

  test("issue_list の search 軸は tool face と意味が異なるため空 plan で停止する", async () => {
    const { reply, calls } = await runOp("issue_list", { search: "test title" }, () => []);
    expect(calls).toHaveLength(0);
    expect(reply.ok).toBe(false);
  });

  for (const operation of UNSUPPORTED_OPERATIONS) {
    test(`unsupported 操作 ${operation}: plan が空で transport が 1 度も呼ばれない`, async () => {
      const op = operation as GhToolOperation;
      const { reply, calls } = await runOp(op, UNSUPPORTED_ARGS[operation] ?? {}, () => {
        throw new Error("transport must not be invoked for unsupported operations");
      });
      expect(calls).toHaveLength(0);
      expect(reply.ok).toBe(false);
      if (!reply.ok) expect(reply.error).toContain(`does not provide the operation: ${operation}`);
    });
  }

  test.each([true, false, null])("pr_mergeable は REST mergeable=%s を 3 値へ正規化する", async (mergeable) => {
    const expected = mergeable === true ? "MERGEABLE" : mergeable === false ? "CONFLICTING" : "UNKNOWN";
    const { reply } = await runOp("pr_mergeable", { number: 5 }, () => restPr({ mergeable }));
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(specOf("pr_mergeable").parseSuccess(reply.payload)).toEqual({
        operation: "pr_mergeable",
        number: 5,
        mergeable: expected,
      });
    }
  });

  test("pr_read は merged=true の REST 応答を state=merged へ正規化する", async () => {
    const { reply } = await runOp(
      "pr_read",
      { number: 5 },
      () => restPr({ state: "closed", merged: true }),
    );
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(specOf("pr_read").parseSuccess(reply.payload)).toMatchObject({ state: "merged", mergeable: "MERGEABLE" });
    }
  });

  test.each([
    { operation: "issue_list" as const, args: {}, fixtures: () => [fullPage()] },
    { operation: "comment_list" as const, args: { number: 7 }, fixtures: () => [fullPage(), fullPage()] },
    { operation: "pr_changed_files" as const, args: { number: 5 }, fixtures: () => [fullPage(), fullPage()] },
    { operation: "release_list" as const, args: {}, fixtures: () => [fullPage(), fullPage()] },
  ])("一覧操作 $operation は最終ページ満杯（100 件）を不完全として成功扱いにしない", async ({ operation, args, fixtures }) => {
    const { reply, calls } = await runOp(operation, args, (_call, index) => fixtures()[index]);
    expect(calls.length).toBeGreaterThan(0);
    expect(reply.ok).toBe(false);
  });

  test("repo が owner/name で解釈できない場合は全操作が空 plan で停止する", async () => {
    const { transport, calls } = fakeTransport(() => restIssue());
    const runner = createPluginRunner(createCodexPluginMapping({ repo: "not-a-slug" }), transport);
    const reply = await runner.run({ operation: "issue_read", args: { number: 7 } });
    expect(calls).toHaveLength(0);
    expect(reply.ok).toBe(false);
    expect(reply.ok === false && reply.failureClass === "operation-failed").toBe(true);
  });
});
