// agentdev-jev-tool Plugin（登録配線）のテスト。
// not_configured 経路（API key 未設定）と provider 偽実装による evaluate / observation_write 経路を実測する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevJevToolDefinition, createAgentdevJevToolPlugin, REQUEST_PROPERTY_SCHEMA } from "../plugin.ts";
import type { JevProvider } from "../../../tools/agentdev-jev/provider.ts";

function context(worktree: string) {
  return { sessionID: "s", directory: worktree, worktree } as Parameters<ReturnType<typeof createAgentdevJevToolDefinition>["execute"]>[1];
}

describe("plugin structure", () => {
  test("agentdev_jev tool を hooks として登録する", async () => {
    const hooks = await createAgentdevJevToolPlugin()({ worktree: "/tmp", directory: "/tmp" });
    expect(Object.keys(hooks.tool ?? {})).toEqual(["agentdev_jev"]);
  });

  test("公開スキーマは操作カタログ（evaluate / observation_write）を固定する", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as { properties: { operation: { enum: readonly string[] } } };
    expect(schema.properties.operation.enum).toEqual(["evaluate", "observation_write"]);
  });
});

describe("evaluate through the tool surface", () => {
  const request = {
    operation: "evaluate",
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
  };

  test("AI key 未設定相当（provider 未解決）では not_configured を返し API を呼ばない", async () => {
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => null });
    const result = await definition.execute({ request }, context("/tmp"));
    const payload = JSON.parse(result.output) as { ok: boolean; failure?: { kind: string; retryable: boolean } };
    expect(payload.ok).toBe(false);
    expect(payload.failure?.kind).toBe("not_configured");
    expect(payload.failure?.retryable).toBe(false);
  });

  test("provider 偽実装で正規化済み結果を返す", async () => {
    const provider: JevProvider = {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        return { requestedModel: "mock/jev", confidenceRaw: 0.7, answers: { q1: { value: 0.9 } } };
      },
    };
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => provider });
    const result = await definition.execute({ request }, context("/tmp"));
    const payload = JSON.parse(result.output) as { ok: boolean; success?: { confidence: number; results: Array<{ value: boolean }> } };
    expect(payload.ok).toBe(true);
    expect(payload.success?.confidence).toBeCloseTo(0.7);
    expect(payload.success?.results[0]?.value).toBe(true);
  });

  test("provider 障害は構造化失敗（自動 retry なし）を返す", async () => {
    const provider: JevProvider = {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        throw Object.assign(new Error("overloaded"), { statusCode: 429 });
      },
    };
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => provider });
    const result = await definition.execute({ request }, context("/tmp"));
    const payload = JSON.parse(result.output) as { ok: boolean; failure?: { kind: string } };
    expect(payload.ok).toBe(false);
    expect(payload.failure?.kind).toBe("rate_limited");
  });
});

describe("observation_write through the tool surface", () => {
  const observation = {
    schemaVersion: 1,
    workflow: "intake-promote",
    judgmentKind: "classification",
    subject: "intake item 1件",
    provider: "mock",
    requestedModel: "mock/jev",
    sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    outcome: "completed",
    durationMs: 50,
    inputs: { requestDigest: "b".repeat(64) },
    judgments: [
      {
        judgmentId: "j1",
        questionForm: "choice",
        jevResult: "採用",
        probabilityDistribution: { 採用: 0.6, 却下: 0.4 },
        confidence: 0.6,
        llmFinalJudgment: "採用",
        llmTreatment: "unchanged",
      },
    ],
  };

  test("観測 JSON を .agentdev/jev-observations/ へ書き込む", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-plugin-"));
    const definition = createAgentdevJevToolDefinition();
    const result = await definition.execute({ request: { operation: "observation_write", observation } }, context(worktree));
    const payload = JSON.parse(result.output) as { ok: boolean; success?: { writtenPath: string; observationId: string } };
    expect(payload.ok).toBe(true);
    expect(payload.success?.writtenPath).toBe(".agentdev/jev-observations/".concat(payload.success!.observationId, ".json"));
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toHaveLength(1);
  });
});
