// ADF-COVERS(verification): REQ-011-028
//
// agentdev-gh-tool Plugin のテスト。
//
// 登録形状（registry が要求する args/description/execute）、実行の差し替え
// （投影パスの Local 実装検出）、fail-closed 出力（リポジトリ解決不能）を検証する。
// Local 実装の検出は scripts-behavior 形式の一時フィクスチャで行う（実環境に触れない）。
// 加えて公開スキーマと実行時 validator の一致性（実行時受理集合 ⊆ 公開スキーマ
// 許容集合）を検証する。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createAgentdevGhToolDefinition,
  createAgentdevGhToolPlugin,
  REQUEST_PROPERTY_SCHEMA,
  type ToolContext,
} from "../plugin.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../../tools/agentdev-gh/runner.ts";
import { AGENTDEV_GH_OPERATION_SPECS } from "../../../tools/agentdev-gh/index.ts";
import { GH_TOOL_OPERATIONS } from "../../../tools/agentdev-gh/contracts.ts";

function makeContext(worktree: string): ToolContext {
  return { sessionID: "s1", directory: worktree, worktree };
}

function fakeRunner(handler: (request: GhRunnerRequest) => Promise<GhRunnerReply>): GhRunner {
  return { run: handler };
}

describe("登録形状（OpenCode registry が要求する構造）", () => {
  test("plugin は tool.agentdev_gh に args/description/execute を持つ定義を返す", async () => {
    const server = createAgentdevGhToolPlugin({
      resolveRepo: () => "owner/repo",
      createRunner: () =>
        fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1, failureClass: "operation-failed" })),
    });
    const hooks = await server({ worktree: "C:/w", directory: "C:/w" });
    const tool = (hooks as { tool: Record<string, unknown> }).tool;
    expect(tool).toBeDefined();
    const def = tool["agentdev_gh"] as Record<string, unknown>;
    expect(typeof def.description).toBe("string");
    expect((def.description as string).length).toBeGreaterThan(0);
    expect(def.args).toBeDefined();
    const args = def.args as Record<string, unknown>;
    expect(Object.keys(args)).toEqual(["request"]);
    expect(typeof def.execute).toBe("function");
  });

  test("args.request の JSON Schema は16操作 + 温存中の issue_comment を enum で公開する", async () => {
    const server = createAgentdevGhToolPlugin({
      resolveRepo: () => "owner/repo",
      createRunner: () =>
        fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1, failureClass: "operation-failed" })),
    });
    const hooks = await server({ worktree: "C:/w", directory: "C:/w" });
    const def = ((hooks as { tool: Record<string, unknown> }).tool["agentdev_gh"] ?? {}) as {
      args: { request: { properties: Record<string, { type?: string; enum?: string[] }>; required: string[] } };
    };
    const request = def.args.request;
    expect(request.properties.operation?.enum).toHaveLength(17);
    expect(request.properties.operation?.enum).toContain("pr_update");
    expect(request.properties.operation?.enum).toContain("comment_create");
    expect(request.properties.operation?.enum).toContain("comment_list");
    expect(request.properties.operation?.enum).toContain("comment_update");
    expect(request.properties.operation?.enum).toContain("comment_delete");
    expect(request.properties.operation?.enum).toContain("issue_comment");
    expect(request.required).toEqual(["operation"]);
    expect(request.properties.commentId).toBeDefined();
    expect(request.properties.commentId?.type).toBe("string");
    expect(request.properties.labels).toBeDefined();
    expect(
      (request.properties.labels as { description: string }).description,
    ).toContain("issue_list");
    expect(
      (request.properties.labels as { description: string }).description,
    ).toContain("required for issue_create");
  });

  test("公開スキーマの operation enum は操作カタログと一致する", () => {
    const schemaEnum = REQUEST_PROPERTY_SCHEMA.properties.operation.enum;
    expect([...schemaEnum].sort()).toEqual([...GH_TOOL_OPERATIONS].sort());
  });
});

describe("公開スキーマと実行時 validator の一致性（実行時受理集合 ⊆ 公開スキーマ許容集合）", () => {
  /** 各操作の実行時 validator を通過する代表要求（validator 受理の最小証拠コーパス）。 */
  const VALID_CORPUS: Record<string, unknown>[] = [
    { operation: "issue_create", title: "T", body: "B", labels: ["bug"] },
    { operation: "issue_create", title: "T", body: "B", labels: [], role: "tracking", kind: "risk" },
    { operation: "issue_read", number: 7 },
    { operation: "issue_update", number: 7, title: "T" },
    { operation: "issue_update", number: 7, body: "B" },
    { operation: "issue_update", number: 7, labels: ["bug"] },
    { operation: "issue_update", number: 7, kind: "problem" },
    { operation: "issue_update", number: 7, trackingState: "ready" },
    { operation: "issue_close", number: 7 },
    { operation: "issue_close", number: 7, reason: "not_planned" },
    { operation: "issue_list" },
    { operation: "issue_list", role: "tracking", kind: "idea", state: "open", trackingState: "ready", labels: ["x"], search: "語" },
    { operation: "issue_reopen", number: 7 },
    { operation: "pr_create", title: "P", body: "B", base: "main", head: "feature/x" },
    { operation: "pr_create", title: "P", body: "B", base: "main", head: "feature/x", draft: true },
    { operation: "pr_read", number: 9 },
    { operation: "pr_merge", number: 9, method: "squash" },
    { operation: "pr_changed_files", number: 9 },
    { operation: "pr_mergeable", number: 9 },
    { operation: "pr_update", number: 9, title: "P" },
    { operation: "pr_update", number: 9, body: "B" },
    { operation: "pr_update", number: 9, title: "P", body: "B" },
    { operation: "comment_create", number: 7, body: "本文" },
    { operation: "comment_list", number: 7 },
    { operation: "comment_update", commentId: "101", body: "本文" },
    { operation: "comment_delete", commentId: "101" },
    { operation: "issue_comment", number: 7 },
    { operation: "issue_comment", number: 7, body: "本文" },
  ];

  test("実行時 validator が受理する全操作の要求は公開スキーマの許容集合に含まれる", () => {
    const properties = REQUEST_PROPERTY_SCHEMA.properties;
    for (const request of VALID_CORPUS) {
      const spec = AGENTDEV_GH_OPERATION_SPECS.find(
        (s) => s.operation === (request as { operation: string }).operation,
      );
      if (spec === undefined) throw new Error(`spec missing for corpus entry: ${JSON.stringify(request)}`);
      const validated = spec.validate(request);
      if (!validated.ok) {
        throw new Error(
          `corpus entry rejected by runtime validator: ${JSON.stringify(request)} (${validated.error.code} ${validated.error.field})`,
        );
      }
      for (const [key, value] of Object.entries(request)) {
        const prop = properties[key as keyof typeof properties] as
          | { type?: string; enum?: unknown[] }
          | undefined;
        if (prop === undefined) {
          throw new Error(`runtime-accepted field is not in the public schema: ${key}`);
        }
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (prop.type !== undefined && prop.type !== actualType) {
          const integerOk =
            prop.type === "integer" && actualType === "number" && Number.isInteger(value);
          if (!integerOk) {
            throw new Error(`field ${key}: schema type ${prop.type} does not accept ${actualType}`);
          }
        }
        if (prop.enum !== undefined && !prop.enum.includes(value)) {
          throw new Error(`field ${key}: value ${String(value)} is not in the schema enum`);
        }
      }
    }
  });

  test("全操作のスペックが定義されている（カタログと過不足なし）", () => {
    expect(AGENTDEV_GH_OPERATION_SPECS.length).toBe(GH_TOOL_OPERATIONS.length);
    const specOps = new Set(AGENTDEV_GH_OPERATION_SPECS.map((s) => s.operation));
    for (const op of GH_TOOL_OPERATIONS) {
      expect(specOps.has(op)).toBe(true);
    }
  });
});

describe("実行（注入 runner による成功・失敗）", () => {
  const deps = {
    resolveRepo: () => "owner/repo" as string | null,
    createRunner: () =>
      fakeRunner(async (request) => {
        if (request.operation === "issue_read") {
          return {
            ok: true,
            payload: { number: 7, title: "T", body: "B", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
          };
        }
        return { ok: false, error: "unexpected op", exitCode: 1, failureClass: "operation-failed" };
      }),
  };

  test("issue_read は検証通過時に ok:true を返す", async () => {
    const def = createAgentdevGhToolDefinition(deps);
    const result = await def.execute({ request: { operation: "issue_read", number: 7 } }, makeContext("C:/w"));
    const parsed = JSON.parse(result.output) as { ok: boolean };
    expect(parsed.ok).toBe(true);
    expect(result.metadata?.ok).toBe(true);
  });

  test("VERIFY 不一致は ok:false（verification-incomplete）を返す", async () => {
    const failing = {
      ...deps,
      createRunner: () =>
        fakeRunner(async (request) => {
          if (request.operation === "issue_create") {
            return { ok: true, payload: { number: 8, url: "https://example/i/8" } };
          }
          return { ok: true, payload: { number: 8, title: "different", body: "B", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null } };
        }),
    };
    const def = createAgentdevGhToolDefinition(failing);
    const result = await def.execute(
      { request: { operation: "issue_create", title: "T", body: "B", labels: [] } },
      makeContext("C:/w"),
    );
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("verification-incomplete");
  });

  test("リポジトリ解決不能は config-uninterpretable で fail-closed", async () => {
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => null,
      createRunner: () =>
        fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1, failureClass: "operation-failed" })),
    });
    const result = await def.execute({ request: { operation: "issue_read", number: 7 } }, makeContext("C:/w"));
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("config-uninterpretable");
  });

  test("契約外フィールドの要求は invalid-input を返す", async () => {
    const def = createAgentdevGhToolDefinition(deps);
    const result = await def.execute(
      { request: { operation: "issue_read", number: 7, assignee: "x" } },
      makeContext("C:/w"),
    );
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string; detail: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("invalid-input");
    expect(parsed.failure.detail).toContain("assignee");
  });
});

describe("ローカル版差し替え（投影パスの Local 実装検出）", () => {
  test("投影パスに runner-local.ts がある場合は Local 実装を使用する", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-plugin-local-"));
    const projectionDir = path.join(worktree, ".opencode", "tools", "agentdev-gh");
    fs.mkdirSync(projectionDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectionDir, "runner-local.ts"),
      [
        'import type { GhRunner } from "../../../../../../../src/opencode/tools/agentdev-gh/runner.ts";',
        "export function createLocalRunner(options: { issuesDir: string }): GhRunner {",
        "  return {",
        "    async run(request) {",
        "      if (request.operation === \"issue_read\") {",
        "        return { ok: true, payload: { number: 1, title: \"LOCAL\", body: \"B\", state: \"open\", labels: [], role: \"case\", kind: null, trackingState: null, closeReason: null } };",
        "      }",
        "      return { ok: false, error: \"local stub: unsupported op\", exitCode: null };",
        "    },",
        "  };",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "owner/repo",
    });
    const result = await def.execute({ request: { operation: "issue_read", number: 1 } }, makeContext(worktree));
    const parsed = JSON.parse(result.output) as { ok: boolean; success?: { title: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.success?.title).toBe("LOCAL");
    fs.rmSync(worktree, { recursive: true, force: true });
  });

  test("投影パスに runner-local.ts がない場合は GitHub 実装を使用する", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-plugin-gh-"));
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "owner/repo",
      createRunner: () =>
        fakeRunner(async (request) => {
          if (request.operation === "issue_read") {
            return { ok: true, payload: { number: 2, title: "GITHUB", body: "B", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null } };
          }
          return { ok: false, error: "unexpected", exitCode: 1, failureClass: "operation-failed" };
        }),
    });
    const result = await def.execute({ request: { operation: "issue_read", number: 2 } }, makeContext(worktree));
    const parsed = JSON.parse(result.output) as { ok: boolean; success?: { title: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.success?.title).toBe("GITHUB");
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});
