// agentdev-gh-tool Plugin のテスト。
//
// 登録形状（registry が要求する args/description/execute）、実行の差し替え
// （投影パスの Local 実装検出）、fail-closed 出力（リポジトリ解決不能）を検証する。
// Local 実装の検出は scripts-behavior 形式の一時フィクスチャで行う（実環境に触れない）。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createAgentdevGhToolDefinition,
  createAgentdevGhToolPlugin,
  type ToolContext,
} from "../plugin.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../../../tools/agentdev-gh/runner.ts";

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
      createRunner: () => fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1 })),
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

  test("args.request の JSON Schema は10操作を enum で公開する", async () => {
    const server = createAgentdevGhToolPlugin({
      resolveRepo: () => "owner/repo",
      createRunner: () => fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1 })),
    });
    const hooks = await server({ worktree: "C:/w", directory: "C:/w" });
    const def = ((hooks as { tool: Record<string, unknown> }).tool["agentdev_gh"] ?? {}) as {
      args: { request: { properties: { operation: { enum: string[] } }; required: string[] } };
    };
    expect(def.args.request.properties.operation.enum).toHaveLength(10);
    expect(def.args.request.required).toEqual(["operation"]);
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
            payload: { number: 7, title: "T", body: "B", state: "open" },
          };
        }
        return { ok: false, error: "unexpected op", exitCode: 1 };
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
          return { ok: true, payload: { number: 8, title: "different", body: "B", state: "open" } };
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
      createRunner: () => fakeRunner(async () => ({ ok: false, error: "unused", exitCode: 1 })),
    });
    const result = await def.execute({ request: { operation: "issue_read", number: 7 } }, makeContext("C:/w"));
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("config-uninterpretable");
  });
});

describe("ローカル版差し替え（投影パスの Local 実装検出）", () => {
  test("投影パスに runner-local.ts がある場合は Local 実装を使用する", async () => {
    const worktree = fs.mkdtempSync(path.join(import.meta.dir, "tmp-plugin-local-"));
    const projectionDir = path.join(worktree, ".opencode", "tools", "agentdev-gh");
    fs.mkdirSync(projectionDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectionDir, "runner-local.ts"),
      [
        'import type { GhRunner } from "../../../../../../../src/opencode/tools/agentdev-gh/runner.ts";',
        "export function createLocalRunner(options: { casesDir: string }): GhRunner {",
        "  return {",
        "    async run(request) {",
        "      if (request.operation === \"issue_read\") {",
        "        return { ok: true, payload: { number: 1, title: \"LOCAL\", body: \"B\", state: \"open\" } };",
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
    const worktree = fs.mkdtempSync(path.join(import.meta.dir, "tmp-plugin-gh-"));
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "owner/repo",
      createRunner: () =>
        fakeRunner(async (request) => {
          if (request.operation === "issue_read") {
            return { ok: true, payload: { number: 2, title: "GITHUB", body: "B", state: "open" } };
          }
          return { ok: false, error: "unexpected", exitCode: 1 };
        }),
    });
    const result = await def.execute({ request: { operation: "issue_read", number: 2 } }, makeContext(worktree));
    const parsed = JSON.parse(result.output) as { ok: boolean; success?: { title: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.success?.title).toBe("GITHUB");
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});

