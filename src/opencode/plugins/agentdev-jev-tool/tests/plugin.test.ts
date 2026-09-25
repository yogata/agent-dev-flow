// agentdev-jev-tool Plugin（登録配線）のテスト。
// not_configured 経路（API key 未設定）と provider 偽実装による evaluate / observation_write 経路を実測する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevJevToolDefinition, createAgentdevJevToolPlugin, REQUEST_PROPERTY_SCHEMA } from "../plugin.ts";
import { validateCompletionObservation } from "../../../tools/agentdev-jev/observation.ts";
import type { JevProvider } from "../../../tools/agentdev-jev/provider.ts";

function context(worktree: string) {
  return { sessionID: "s", directory: worktree, worktree } as Parameters<ReturnType<typeof createAgentdevJevToolDefinition>["execute"]>[1];
}

async function tempWorktree(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "jev-plugin-"));
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

  test("公開スキーマは 2段階書込み契約の入力（observationId・observationMetadata・recordState）を含む", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as {
      properties: {
        observationId: { type: string };
        observationMetadata: { type: string };
        observation: { oneOf: Array<{ properties: { recordState?: { enum: readonly string[] } } }> };
      };
    };
    expect(schema.properties.observationId.type).toBe("string");
    expect(schema.properties.observationMetadata.type).toBe("object");
    // observation 入力は observationId の有無で 2 分岐する（追記完成 / legacy 完成新規書込み）
    const branches = schema.properties.observation.oneOf;
    expect(branches).toHaveLength(2);
    const fullBranch = branches.find((b) => b.properties.recordState?.enum?.includes("partial"));
    const completionBranch = branches.find((b) => b.properties.recordState?.enum?.includes("complete") && !b.properties.recordState?.enum?.includes("partial"));
    expect(fullBranch?.properties.recordState?.enum).toEqual(["partial", "complete"]);
    expect(completionBranch?.properties.recordState?.enum).toEqual(["complete"]);
  });

  test("completion 追記分岐の入力 schema は実装受理条件（completion allowlist）と一致する", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as {
      properties: {
        observation: {
          oneOf: Array<{
            properties: Record<string, unknown>;
            required?: string[];
            additionalProperties?: boolean;
          }>;
        };
      };
    };
    const completionBranch = schema.properties.observation.oneOf.find((b) => {
      const recordState = b.properties?.recordState as { enum?: string[] } | undefined;
      return recordState?.enum?.includes("complete") === true && !recordState.enum.includes("partial");
    });
    expect(completionBranch).toBeDefined();
    // top-level: 追記専用形（schemaVersion / recordState / judgments のみ）
    expect(Object.keys(completionBranch!.properties).sort()).toEqual(["judgments", "recordState", "schemaVersion"]);
    expect(completionBranch!.additionalProperties).toBe(false);
    // judgment 単位: 追記対象 field（llmFinalJudgment / llmTreatment）のみ completion 系操作の入力として示される
    const judgments = completionBranch!.properties.judgments as {
      minItems?: number;
      items: { properties: Record<string, unknown>; required?: string[]; additionalProperties?: boolean };
    };
    expect(judgments.minItems).toBe(1);
    expect(Object.keys(judgments.items.properties).sort()).toEqual(["judgmentId", "llmFinalJudgment", "llmTreatment", "questionForm"]);
    expect(judgments.items.required).toEqual(["judgmentId", "questionForm", "llmFinalJudgment", "llmTreatment"]);
    expect(judgments.items.additionalProperties).toBe(false);
    // 実装受理条件との実測一致: 追記専用形は受理し、run 級 field の混入は拒否する
    const appendOnly = {
      schemaVersion: 1,
      judgments: [{ judgmentId: "q1", questionForm: "boolean", llmFinalJudgment: "最終判断", llmTreatment: "unchanged" }],
    };
    expect(validateCompletionObservation(appendOnly).ok).toBe(true);
    const runLevelMixed = {
      ...appendOnly,
      workflow: "wf",
      provider: "p",
      requestedModel: "m",
      sourceRevision: "r",
      outcome: "completed",
      durationMs: 1,
      inputs: { requestDigest: "0".repeat(64) },
    };
    expect(validateCompletionObservation(runLevelMixed).ok).toBe(false);
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
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => null });
    const result = await definition.execute({ request }, context(worktree));
    const payload = JSON.parse(result.output) as { ok: boolean; failure?: { kind: string; retryable: boolean }; observation?: Record<string, unknown> };
    expect(payload.ok).toBe(false);
    expect(payload.failure?.kind).toBe("not_configured");
    expect(payload.failure?.retryable).toBe(false);
    expect(payload.observation && "observationId" in payload.observation).toBe(true);
  });

  test("provider 偽実装で正規化済み結果を返す", async () => {
    const worktree = await tempWorktree();
    const provider: JevProvider = {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        return { requestedModel: "mock/jev", confidenceRaw: 0.7, answers: { q1: { value: 0.9 } } };
      },
    };
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => provider });
    const result = await definition.execute({ request }, context(worktree));
    const payload = JSON.parse(result.output) as { ok: boolean; success?: { confidence: number; results: Array<{ value: boolean }>; observation?: Record<string, unknown> } };
    expect(payload.ok).toBe(true);
    expect(payload.success?.confidence).toBeCloseTo(0.7);
    expect(payload.success?.results[0]?.value).toBe(true);
    const observation = payload.success?.observation;
    expect(observation && "observationId" in observation && observation.recordState === "partial").toBe(true);
  });

  test("provider 障害は構造化失敗（自動 retry なし）を返す", async () => {
    const worktree = await tempWorktree();
    const provider: JevProvider = {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        throw Object.assign(new Error("overloaded"), { statusCode: 429 });
      },
    };
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => provider });
    const result = await definition.execute({ request }, context(worktree));
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

  test("observationId 付きは evaluate 時点部分レコードを追記完成させる（同一 JSON・recordState complete）", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => null });
    const evaluated = await definition.execute({
      request: {
        operation: "evaluate",
        state: "判断状態",
        instructions: "評価指示",
        questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
      },
    }, context(worktree));
    const evaluatePayload = JSON.parse(evaluated.output) as {
      ok: boolean;
      failure?: { kind: string };
      observation?: { observationId?: string; writtenPath?: string };
    };
    expect(evaluatePayload.ok).toBe(false);
    const partialId = evaluatePayload.observation?.observationId;
    if (!partialId || !evaluatePayload.observation?.writtenPath) throw new Error("partial observation missing");

    const completed = await definition.execute({
      request: {
        operation: "observation_write",
        observationId: partialId,
        observation: {
          schemaVersion: 1,
          judgments: [{ judgmentId: "q1", questionForm: "boolean", llmFinalJudgment: "採用", llmTreatment: "unchanged" }],
        },
      },
    }, context(worktree));
    const completePayload = JSON.parse(completed.output) as { ok: boolean; success?: { observationId: string } };
    expect(completePayload.ok).toBe(true);
    expect(completePayload.success?.observationId).toBe(partialId);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${partialId}.json`), "utf8")) as {
      recordState: string;
      judgments: Array<Record<string, unknown>>;
      outcome: string;
    };
    expect(content.recordState).toBe("complete");
    expect(content.outcome).toBe("not_configured");
    expect(content.judgments[0]?.llmFinalJudgment).toBe("採用");
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${partialId}.json`]);
  });
});
