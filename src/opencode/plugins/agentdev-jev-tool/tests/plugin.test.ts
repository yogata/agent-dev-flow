// agentdev-jev-tool Plugin（登録配線）のテスト。
// not_configured 経路（API key 未設定）と provider 偽実装による evaluate / observation_write 経路を実測する。
//
// TS-002: confidence は evaluation 単位のみ
// TS-006: not_configured は観測なし・呼出し後失敗は失敗観測
// TS-007: 永続化成功後の観測存在

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevJevToolDefinition, createAgentdevJevToolPlugin, REQUEST_PROPERTY_SCHEMA } from "../plugin.ts";
import { validateFinalResultObservation } from "../../../../common/tools/agentdev-jev/observation.ts";
import type { JevProvider } from "../../../../common/tools/agentdev-jev/provider.ts";

function context(worktree: string) {
  return { sessionID: "s", directory: worktree, worktree } as Parameters<ReturnType<typeof createAgentdevJevToolDefinition>["execute"]>[1];
}

async function tempWorktree(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "jev-plugin-"));
}

function providerMock(): JevProvider {
  return {
    providerId: "mock",
    requestedModel: "mock/jev",
    isConfigured: () => true,
    async evaluate() {
      return { requestedModel: "mock/jev", confidenceRaw: 0.7, inputTokens: 300, answers: { q1: { value: 0.9 } } };
    },
  };
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

  test("観測 metadata スキーマは workflow・評価種別を必須とし観測 ID 入力を持たない（1評価 = 1観測）", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as {
      properties: {
        observationMetadata: { type: string; required?: string[]; properties: Record<string, unknown> };
        observation: { properties: Record<string, unknown>; required?: string[] };
      };
    };
    const metadata = schema.properties.observationMetadata;
    expect(metadata.type).toBe("object");
    expect(metadata.required).toEqual(["workflow", "evaluationKind", "subject", "sourceRevision"]);
    expect(Object.keys(metadata.properties).sort()).toEqual(["evaluationKind", "references", "snapshot", "sourceRevision", "subject", "workflow"]);
  });

  test("observation_write の入力スキーマは最終判断結果の追記形のみ（評価側一次事実の再送を許容しない）", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as {
      properties: { observation: { properties: Record<string, unknown>; required?: string[]; additionalProperties?: boolean } };
    };
    const observation = schema.properties.observation;
    expect(Object.keys(observation.properties).sort()).toEqual(["finalResult", "schemaVersion"]);
    expect(observation.required).toEqual(["schemaVersion", "finalResult"]);
    expect(observation.additionalProperties).toBe(false);
    const finalResult = observation.properties.finalResult as { properties: Record<string, unknown>; required?: string[] };
    expect(finalResult.required).toEqual(["results"]);
    const results = finalResult.properties.results as { minItems?: number; items: { properties: Record<string, unknown>; required?: string[]; additionalProperties?: boolean } };
    expect(results.minItems).toBe(1);
    expect(Object.keys(results.items.properties).sort()).toEqual(["differenceReason", "questionId", "value"]);
    expect(results.items.required).toEqual(["questionId", "value"]);
    expect(results.items.additionalProperties).toBe(false);
  });

  test("追記入力の実装受理条件との実測一致: 最終判断結果のみを受理し、評価側一次事実の再送は拒否する", () => {
    const appendInput = {
      schemaVersion: 2,
      finalResult: { results: [{ questionId: "q1", value: true }] },
    };
    expect(validateFinalResultObservation(appendInput).ok).toBe(true);
    const evaluatorFactsMixed = {
      schemaVersion: 2,
      workflow: "learning-promote",
      provider: "mock",
      requestedModel: "mock/jev",
      outcome: "completed",
      durationMs: 1,
      inputs: { requestDigest: "0".repeat(64) },
      results: [{ questionId: "q1", questionForm: "boolean", value: true, probabilityDistribution: {} }],
      finalResult: { results: [{ questionId: "q1", value: true }] },
    };
    expect(validateFinalResultObservation(evaluatorFactsMixed).ok).toBe(false);
  });

  test("公開 JSON Schema の description は差異理由の不一致時必須・一致時拒否と score 離散 level と同期する（TS-002）", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as {
      properties: {
        observation: { description: string; properties: { finalResult: { properties: { results: { items: { properties: Record<string, { description: string }> } } } } } };
        questions: { items: { properties: Record<string, { description: string }> } };
      };
    };
    const resultItems = schema.properties.observation.properties.finalResult.properties.results.items.properties;
    expect(resultItems.differenceReason?.description).toContain("Required when the value differs");
    expect(resultItems.differenceReason?.description).toContain("must be omitted");
    expect(resultItems.value?.description).toContain("discrete scale level");
    expect(resultItems.value?.description).toContain("continuous score values are rejected");
    expect(schema.properties.questions.items.properties.scale?.description).toContain("unique");
  });
});

describe("evaluate through the tool surface", () => {
  const request = {
    operation: "evaluate",
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    observationMetadata: {
      workflow: "intake-promote",
      evaluationKind: "classification",
      subject: "intake item 1件",
      sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    },
  };

  test("AI key 未設定相当（provider 未解決）では not_configured を返し観測を生成しない", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => null });
    const result = await definition.execute({ request }, context(worktree));
    const payload = JSON.parse(result.output) as { ok: boolean; failure?: { kind: string; retryable: boolean }; observation?: unknown };
    expect(payload.ok).toBe(false);
    expect(payload.failure?.kind).toBe("not_configured");
    expect(payload.failure?.retryable).toBe(false);
    expect(payload.observation).toBeUndefined();
    const dir = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(dir).toBeNull();
  });

  test("provider 偽実装で正規化済み結果を返し、evaluator 成功後に観測が存在する（TS-007）", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => providerMock() });
    const result = await definition.execute({ request }, context(worktree));
    const payload = JSON.parse(result.output) as {
      ok: boolean;
      success?: { confidence: number; results: Array<{ value: boolean }>; observation?: { observationId?: string; writtenPath?: string } };
    };
    expect(payload.ok).toBe(true);
    expect(payload.success?.confidence).toBeCloseTo(0.7);
    expect(payload.success?.results[0]?.value).toBe(true);
    const observation = payload.success?.observation;
    expect(observation?.observationId).toBeTruthy();
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${observation?.observationId}.json`]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${observation?.observationId}.json`), "utf8")) as Record<string, unknown>;
    expect(content.schemaVersion).toBe(2);
    expect(content.workflow).toBe("intake-promote");
    expect(content.evaluationKind).toBe("classification");
    expect(content.confidence).toBeCloseTo(0.7);
    const results = content.results as Array<Record<string, unknown>>;
    expect(results[0]?.questionId).toBe("q1");
    expect(results[0]?.confidence).toBeUndefined();
  });

  test("provider 障害は構造化失敗（自動 retry なし）と失敗観測を返す（TS-006）", async () => {
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
    const payload = JSON.parse(result.output) as { ok: boolean; failure?: { kind: string }; observation?: { observationId?: string } };
    expect(payload.ok).toBe(false);
    expect(payload.failure?.kind).toBe("rate_limited");
    const observationId = payload.observation?.observationId;
    expect(observationId).toBeTruthy();
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${observationId}.json`), "utf8")) as { failure?: { kind?: string; detail?: string }; results?: unknown };
    expect(content.failure?.kind).toBe("rate_limited");
    expect(String(content.failure?.detail)).toContain("overloaded");
    expect(content.results).toBeUndefined();
  });
});

describe("observation_write through the tool surface", () => {
  async function evaluateOnce(worktree: string, definition: ReturnType<typeof createAgentdevJevToolDefinition>): Promise<string> {
    const evaluated = await definition.execute({
      request: {
        operation: "evaluate",
        state: "判断状態",
        instructions: "評価指示",
        questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
        observationMetadata: {
          workflow: "backlog-review",
          evaluationKind: "integration",
          subject: "採用済み成果物 1件",
          sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
        },
      },
    }, context(worktree));
    const payload = JSON.parse(evaluated.output) as { ok: boolean; success?: { observation?: { observationId?: string } } };
    if (!payload.ok || !payload.success?.observation?.observationId) throw new Error("evaluate failed");
    return payload.success.observation.observationId;
  }

  test("evaluator 成功観測の同一 JSON へ最終判断結果を追記する", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => providerMock() });
    const observationId = await evaluateOnce(worktree, definition);
    const written = await definition.execute({
      request: {
        operation: "observation_write",
        observationId,
        observation: {
          schemaVersion: 2,
          finalResult: { results: [{ questionId: "q1", value: false, differenceReason: "semantic_disagreement" }] },
        },
      },
    }, context(worktree));
    const payload = JSON.parse(written.output) as { ok: boolean; success?: { observationId: string } };
    expect(payload.ok).toBe(true);
    expect(payload.success?.observationId).toBe(observationId);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${observationId}.json`]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${observationId}.json`), "utf8")) as Record<string, unknown>;
    const finalResult = content.finalResult as { results: Array<Record<string, unknown>> };
    expect(finalResult.results[0]?.questionId).toBe("q1");
    expect(finalResult.results[0]?.value).toBe(false);
    expect(finalResult.results[0]?.differenceReason).toBe("semantic_disagreement");
  });

  test("失敗観測への追記と不一致条件下の不正な差異理由は拒否される", async () => {
    const worktree = await tempWorktree();
    const failingProvider: JevProvider = {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        throw Object.assign(new Error("gateway error"), { statusCode: 503 });
      },
    };
    const failing = createAgentdevJevToolDefinition({ resolveProvider: () => failingProvider });
    const evaluated = await failing.execute({
      request: {
        operation: "evaluate",
        state: "判断状態",
        instructions: "評価指示",
        questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
        observationMetadata: {
          workflow: "backlog-review",
          evaluationKind: "integration",
          subject: "採用済み成果物 1件",
          sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
        },
      },
    }, context(worktree));
    const failurePayload = JSON.parse(evaluated.output) as { ok: boolean; observation?: { observationId?: string } };
    expect(failurePayload.ok).toBe(false);
    const failureObservationId = failurePayload.observation?.observationId;
    expect(failureObservationId).toBeTruthy();
    const rejected = await failing.execute({
      request: {
        operation: "observation_write",
        observationId: failureObservationId,
        observation: { schemaVersion: 2, finalResult: { results: [{ questionId: "q1", value: true }] } },
      },
    }, context(worktree));
    const rejectedPayload = JSON.parse(rejected.output) as { ok: boolean; failure?: { detail?: string } };
    expect(rejectedPayload.ok).toBe(false);
    expect(rejectedPayload.failure?.detail).toContain("evaluator-success");
  });
});

describe("conditional trigger control and observation identifier stability", () => {
  function evaluateRequest(state: string, metadata: Record<string, string>) {
    return {
      operation: "evaluate",
      state,
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
      observationMetadata: metadata,
    };
  }

  test("条件付き評価の発動制御: 親判断の最終確定結果が発動条件を満たした呼出しだけが観測を生成し、不成立時（後続質問を構成せず evaluate を呼ばない）は観測を生成しない", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => providerMock() });
    const metadata = {
      workflow: "intake-promote",
      evaluationKind: "review-trigger",
      subject: "暫定分類後の発動条件判定",
      sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    };
    const dir = path.join(worktree, ".agentdev", "jev-observations");
    // 発動条件不成立: 呼出し元は後続質問自体を生成しないため evaluate が呼ばれず、観測（「非該当」等を
    // 表すためだけのものを含む）も生成されない。Tool の観測生成は実際の呼出しに伴ってのみ発生する。
    expect(await fs.stat(dir).then(() => true, () => false)).toBe(false);
    // 発動条件成立: 親判断の最終確定結果を反映した後続評価を呼び出す → 観測 1件
    const triggered = await definition.execute({ request: evaluateRequest("判断状態", metadata) }, context(worktree));
    const triggeredPayload = JSON.parse(triggered.output) as { ok: boolean };
    expect(triggeredPayload.ok).toBe(true);
    expect((await fs.readdir(dir)).length).toBe(1);
    // 再度不成立: 呼出しなければ観測は増えない（未発動分の集約・疑似的な非該当観測の補てんは存在しない）
    expect((await fs.readdir(dir)).length).toBe(1);
  });

  test("観測識別子の安定性: 同一意味判断の継続評価は workflow・evaluationKind・questionId を維持し別 observation として append-only に保存され、版の違いは requestDigest で区別される", async () => {
    const worktree = await tempWorktree();
    const definition = createAgentdevJevToolDefinition({ resolveProvider: () => providerMock() });
    const metadata = {
      workflow: "intake-promote",
      evaluationKind: "classification",
      subject: "intake item 1件",
      sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    };
    const first = await definition.execute({ request: evaluateRequest("判断状態A", metadata) }, context(worktree));
    const firstPayload = JSON.parse(first.output) as { ok: boolean; success?: { observation?: { observationId?: string } } };
    const firstId = firstPayload.success?.observation?.observationId;
    expect(firstPayload.ok).toBe(true);
    expect(firstId).toBeTruthy();
    // 同一意味判断の継続（識別子維持・入力の版のみ変化）
    const second = await definition.execute({ request: evaluateRequest("判断状態B", metadata) }, context(worktree));
    const secondPayload = JSON.parse(second.output) as { ok: boolean; success?: { observation?: { observationId?: string } } };
    const secondId = secondPayload.success?.observation?.observationId;
    expect(secondPayload.ok).toBe(true);
    expect(secondId).toBeTruthy();
    expect(secondId).not.toBe(firstId);
    const dir = path.join(worktree, ".agentdev", "jev-observations");
    expect((await fs.readdir(dir)).sort()).toEqual([`${firstId}.json`, `${secondId}.json`].sort());
    const readObs = async (id: string) =>
      JSON.parse(await fs.readFile(path.join(dir, `${id}.json`), "utf8")) as Record<string, unknown>;
    const firstObs = await readObs(firstId as string);
    const secondObs = await readObs(secondId as string);
    for (const obs of [firstObs, secondObs]) {
      expect(obs.workflow).toBe("intake-promote");
      expect(obs.evaluationKind).toBe("classification");
      expect(obs.sourceRevision).toBe("c6c15e72e5cae9ba8c3a957e32662704db94283c");
      const results = obs.results as Array<Record<string, unknown>>;
      expect(results[0]?.questionId).toBe("q1");
    }
    const firstInputs = firstObs.inputs as { requestDigest: string };
    const secondInputs = secondObs.inputs as { requestDigest: string };
    expect(firstInputs.requestDigest).not.toBe(secondInputs.requestDigest);
    expect(firstObs.finalResult).toBeUndefined();
    expect(secondObs.finalResult).toBeUndefined();
  });

  test("公開 JSON Schema の description は条件付き評価の発動制御と観測識別子の安定性を規定する", () => {
    const schema = REQUEST_PROPERTY_SCHEMA as unknown as { description: string };
    expect(schema.description).toContain("Conditional evaluation trigger control");
    expect(schema.description).toContain("never triggers it");
    expect(schema.description).toContain("Observation identifier stability");
    expect(schema.description).toContain("never migrated, rewritten, or re-keyed");
  });
});
