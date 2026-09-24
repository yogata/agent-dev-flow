// agentdev-jev 操作統合テスト（evaluate 時点書込み・observation_write 追記完成。REQ-090-013）。
//
// TS-001: evaluate 完了直後（observation_write 前）の部分レコード存在と Jev 側観測項目、
//         observation_write 後の 1実行 1 JSON と完了状態 field、not_configured 完了の部分レコード
// TS-002: 完了状態 field の機械判別、二重 observation_write の冪等性、1 run 複数 evaluate の重複なし
// TS-003: evaluate 成功後に observation_write を呼ばずプロセス中断相当でも部分レコードが残存する

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { runAgentdevJevOperation } from "../index.ts";
import type { JevEvaluateResult, JevObservationWriteResult } from "../contracts.ts";
import type { JevProvider } from "../provider.ts";

const SOURCE_REVISION = "c6c15e72e5cae9ba8c3a957e32662704db94283c";

function mockProvider(overrides: Partial<JevProvider> = {}): JevProvider {
  return {
    providerId: "mock",
    requestedModel: "mock/jev",
    isConfigured: () => true,
    async evaluate() {
      return { requestedModel: "mock/jev", confidenceRaw: 0.91, inputTokens: 589, answers: { q1: { value: 0.8 } } };
    },
    ...overrides,
  };
}

async function tempWorktree(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "jev-index-"));
}

async function readObservationJson(worktree: string, relative: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(path.join(worktree, relative.replace(/\//g, path.sep)), "utf8")) as Record<string, unknown>;
}

describe("evaluate 時点書込み（TS-001）", () => {
  test("evaluate 完了直後に部分レコードが存在し Jev 側観測項目が読み取れる（recordState partial）", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
      observationMetadata: {
        workflow: "learning-promote",
        judgmentKind: "evaluation",
        subject: "inbox エントリ 1件",
        sourceRevision: SOURCE_REVISION,
      },
    }, { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    const persisted = result.success.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    expect(persisted.recordState).toBe("partial");
    expect(persisted.writtenPath).toBe(`.agentdev/jev-observations/${persisted.observationId}.json`);
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.recordState).toBe("partial");
    expect(content.outcome).toBe("completed");
    expect(content.workflow).toBe("learning-promote");
    expect(content.judgmentKind).toBe("evaluation");
    expect(content.subject).toBe("inbox エントリ 1件");
    expect(content.sourceRevision).toBe(SOURCE_REVISION);
    expect(content.provider).toBe("mock");
    expect(content.requestedModel).toBe("mock/jev");
    expect(content.inputTokens).toBe(589);
    const judgment = (content.judgments as Array<Record<string, unknown>>)[0] as Record<string, unknown>;
    expect(judgment.judgmentId).toBe("q1");
    expect(judgment.jevResult).toBe(true);
    expect(judgment.confidence).toBeCloseTo(0.91);
    expect(judgment.probabilityDistribution).toBeDefined();
    expect(judgment.llmFinalJudgment).toBeUndefined();
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toHaveLength(1);
  });

  test("not_configured 完了でも部分レコードが作成される", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    }, { resolveProvider: () => null });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("not_configured");
    const persisted = payload.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.recordState).toBe("partial");
    expect(content.outcome).toBe("not_configured");
    expect(content.durationMs).toBe(0);
    const judgment = (content.judgments as Array<Record<string, unknown>>)[0] as Record<string, unknown>;
    expect(judgment.failureKind).toBe("not_configured");
  });

  test("provider API 失敗でも失敗分類を含む部分レコードが作成される（jev_failed）", async () => {
    const worktree = await tempWorktree();
    const provider = mockProvider({
      async evaluate() {
        throw Object.assign(new Error("overloaded"), { statusCode: 429 });
      },
    });
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
      observationMetadata: { workflow: "intake-promote", judgmentKind: "classification", subject: "item 1件", sourceRevision: SOURCE_REVISION },
    }, { resolveProvider: () => provider });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("rate_limited");
    const persisted = payload.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.recordState).toBe("partial");
    expect(content.outcome).toBe("jev_failed");
    expect(content.provider).toBe("mock");
    const judgment = (content.judgments as Array<Record<string, unknown>>)[0] as Record<string, unknown>;
    expect(judgment.failureKind).toBe("rate_limited");
  });

  test("invalid_input（評価未実施）は部分レコードを作成しない", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    }, { resolveProvider: () => mockProvider() });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("invalid_input");
    expect(payload.observation).toBeUndefined();
    const exists = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(exists).toBeNull();
  });

  test("書込み失敗時も評価結果は維持され、独立した warning を返す（REQ-090-013）", async () => {
    const worktree = await tempWorktree();
    await fs.mkdir(path.join(worktree, ".agentdev"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "jev-observations"), "not-a-dir", "utf8");
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    }, { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    expect(result.success.confidence).toBeCloseTo(0.91);
    expect(result.success.results[0]?.value).toBe(true);
    const persisted = result.success.observation;
    expect(persisted && "warning" in persisted).toBe(true);
    if (!persisted || !("warning" in persisted)) return;
    expect(persisted.warning).toContain("partial observation write failed");
  });
});

describe("observation_write 追記完成（TS-001・TS-002）", () => {
  const evaluateRequest = {
    operation: "evaluate",
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    observationMetadata: {
      workflow: "learning-promote",
      judgmentKind: "evaluation",
      subject: "inbox エントリ 1件",
      sourceRevision: SOURCE_REVISION,
    },
  };

  test("observation_write が同一 JSON を完成させる（LLM field 追記・recordState complete・1実行 1 JSON）", async () => {
    const worktree = await tempWorktree();
    const evaluated = await runAgentdevJevOperation(worktree, evaluateRequest, { resolveProvider: () => mockProvider() });
    expect(evaluated.ok).toBe(true);
    if (!evaluated.ok || evaluated.operation !== "evaluate") return;
    const partial = evaluated.success.observation;
    if (!partial || !("observationId" in partial)) throw new Error("partial observation missing");

    const completed = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId: partial.observationId,
      observation: {
        schemaVersion: 1,
        judgments: [
          {
            judgmentId: "q1",
            questionForm: "boolean",
            llmFinalJudgment: "採用",
            llmTreatment: "unchanged",
          },
        ],
      },
    });
    expect(completed.ok).toBe(true);
    const completedPayload = completed as JevObservationWriteResult;
    if (!completedPayload.ok) return;
    expect(completedPayload.success.observationId).toBe(partial.observationId);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${partial.observationId}.json`]);
    const content = await readObservationJson(worktree, completedPayload.success.writtenPath);
    expect(content.recordState).toBe("complete");
    const judgment = (content.judgments as Array<Record<string, unknown>>)[0] as Record<string, unknown>;
    expect(judgment.llmFinalJudgment).toBe("採用");
    expect(judgment.llmTreatment).toBe("unchanged");
    expect(judgment.jevResult).toBe(true);
    expect(judgment.confidence).toBeCloseTo(0.91);
    expect(content.inputs).toBeDefined();
  });

  test("二重 observation_write は冪等で重複作成しない（TS-002）", async () => {
    const worktree = await tempWorktree();
    const evaluated = await runAgentdevJevOperation(worktree, evaluateRequest, { resolveProvider: () => mockProvider() });
    if (!evaluated.ok || evaluated.operation !== "evaluate") throw new Error("evaluate failed");
    const partial = evaluated.success.observation;
    if (!partial || !("observationId" in partial)) throw new Error("partial observation missing");
    const completionRequest = {
      operation: "observation_write",
      observationId: partial.observationId,
      observation: {
        schemaVersion: 1,
        judgments: [{ judgmentId: "q1", questionForm: "boolean", llmFinalJudgment: "採用", llmTreatment: "unchanged" }],
      },
    };
    await runAgentdevJevOperation(worktree, completionRequest);
    const again = await runAgentdevJevOperation(worktree, completionRequest);
    expect(again.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${partial.observationId}.json`]);
    const content = await readObservationJson(worktree, `.agentdev/jev-observations/${partial.observationId}.json`);
    const judgments = content.judgments as Array<Record<string, unknown>>;
    expect(judgments).toHaveLength(1);
    expect(judgments[0]?.llmFinalJudgment).toBe("採用");
    expect(content.recordState).toBe("complete");
  });

  test("1 run 内の複数 evaluate は同一 observationId で同一 JSON へ追記する（TS-002: 破壊・重複なし）", async () => {
    const worktree = await tempWorktree();
    const requestA = {
      operation: "evaluate",
      state: "判断状態A",
      instructions: "評価指示",
      questions: [{ id: "qa", form: "boolean", prompt: "質問A" }],
      observationMetadata: { observationId: "run-multi", workflow: "backlog-review", judgmentKind: "integration", subject: "採用済み成果物", sourceRevision: SOURCE_REVISION },
    };
    const requestB = {
      operation: "evaluate",
      state: "判断状態B",
      instructions: "評価指示",
      questions: [{ id: "qb", form: "boolean", prompt: "質問B" }],
      observationMetadata: { observationId: "run-multi", workflow: "backlog-review", judgmentKind: "integration", subject: "採用済み成果物", sourceRevision: SOURCE_REVISION },
    };
    const first = await runAgentdevJevOperation(worktree, requestA, { resolveProvider: () => mockProvider() });
    const second = await runAgentdevJevOperation(worktree, requestB, { resolveProvider: () => mockProvider() });
    expect(first.ok && second.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["run-multi.json"]);
    const content = await readObservationJson(worktree, ".agentdev/jev-observations/run-multi.json");
    const judgments = content.judgments as Array<Record<string, unknown>>;
    expect(judgments).toHaveLength(2);
    expect(judgments.map((j) => j.judgmentId).sort()).toEqual(["qa", "qb"]);
    expect(content.recordState).toBe("partial");
  });
});

describe("委譲境界死亡の再現検証（TS-003）", () => {
  test("evaluate 成功後に observation_write を呼ばずに中断しても部分レコードが残存する", async () => {
    const worktree = await tempWorktree();
    const evaluated = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
      observationMetadata: {
        workflow: "req-define",
        judgmentKind: "architecture-impact",
        subject: "要件 1件",
        sourceRevision: SOURCE_REVISION,
      },
    }, { resolveProvider: () => mockProvider() });
    expect(evaluated.ok).toBe(true);
    if (!evaluated.ok || evaluated.operation !== "evaluate") return;
    const partial = evaluated.success.observation;
    expect(partial && !("warning" in partial)).toBe(true);
    if (!partial || !("observationId" in partial)) return;
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${partial.observationId}.json`]);
    const content = await readObservationJson(worktree, partial.writtenPath);
    expect(content.recordState).toBe("partial");
    const judgment = (content.judgments as Array<Record<string, unknown>>)[0] as Record<string, unknown>;
    expect(judgment.jevResult).toBe(true);
    expect(judgment.confidence).toBeCloseTo(0.91);
    expect(judgment.probabilityDistribution).toBeDefined();
  });
});
