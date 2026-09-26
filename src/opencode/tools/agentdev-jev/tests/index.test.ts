// agentdev-jev 操作統合テスト（観測永続化・final result 反映）。
//
// TS-001: 1 semantic evaluation = 1 observation（1 JSON）、実行元 Workflow と評価種別の識別 field、
//         観測単位集約入力の不在
// TS-002: confidence は evaluation 単位のみ（質問単位複製なし・provider 返却時のみ）
// TS-004: final result は evaluator 成功観測のみ、差異理由分類は差異時のみ
// TS-006: not_configured・入力検証失敗は観測なし、呼出し開始後の失敗は失敗観測（分類 + 最小 diagnostic）
// TS-007: 永続化失敗は fail-open（評価結果維持 + 識別可能 warning）、evaluator 成功後の観測存在

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

function evaluateRequest(overrides: Record<string, unknown> = {}) {
  return {
    operation: "evaluate",
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    observationMetadata: {
      workflow: "learning-promote",
      evaluationKind: "evaluation",
      subject: "inbox エントリ 1件",
      sourceRevision: SOURCE_REVISION,
    },
    ...overrides,
  };
}

describe("1 semantic evaluation = 1 observation（TS-001）", () => {
  test("評価1件から観測1件が生成され、Workflow と評価種別を識別できる", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    const persisted = result.success.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    expect(persisted.writtenPath).toBe(`.agentdev/jev-observations/${persisted.observationId}.json`);
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.schemaVersion).toBe(2);
    expect(content.workflow).toBe("learning-promote");
    expect(content.evaluationKind).toBe("evaluation");
    expect(content.subject).toBe("inbox エントリ 1件");
    expect(content.sourceRevision).toBe(SOURCE_REVISION);
    const results = content.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0]?.questionId).toBe("q1");
    expect(results[0]?.value).toBe(true);
    expect(results[0]?.probabilityDistribution).toBeDefined();
    expect(content.failure).toBeUndefined();
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toHaveLength(1);
  });

  test("observationMetadata 未提供は invalid_input で観測を生成しない（観測の一意識別を保証）", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, {
      operation: "evaluate",
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
    }, { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failure.kind).toBe("invalid_input");
    expect(result.failure.detail).toContain("observationMetadata");
    const dir = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(dir).toBeNull();
  });

  test("複数質問の評価も観測は1件（results の questionId で質問と1対1対応）", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, evaluateRequest({
      questions: [
        { id: "qa", form: "boolean", prompt: "質問A" },
        { id: "qb", form: "choice", prompt: "質問B", options: ["採用", "却下"] },
      ],
    }), { resolveProvider: () => mockProvider({
      async evaluate() {
        return {
          requestedModel: "mock/jev",
          confidenceRaw: 0.7,
          answers: {
            qa: { value: 0.9 },
            qb: { value: "却下", probabilities: { 採用: 0.3, 却下: 0.7 } },
          },
        };
      },
    }) });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toHaveLength(1);
    const persisted = result.success.observation;
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    const results = content.results as Array<Record<string, unknown>>;
    expect(results.map((r) => r.questionId)).toEqual(["qa", "qb"]);
    expect(results[1]?.value).toBe("却下");
  });
});

describe("confidence の evaluation 単位意味論（TS-002）", () => {
  test("provider が返した confidence は観測に evaluation 単位で1回のみ保存される（質問単位複製なし）", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    expect(result.success.confidence).toBeCloseTo(0.91);
    const persisted = result.success.observation;
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.confidence).toBeCloseTo(0.91);
    const results = content.results as Array<Record<string, unknown>>;
    for (const result of results) {
      expect(result.confidence).toBeUndefined();
    }
  });

  test("provider が confidence を返さない evaluation では confidence を保存しない", async () => {
    const worktree = await tempWorktree();
    const provider = mockProvider({
      async evaluate() {
        return { requestedModel: "mock/jev", answers: { q1: { value: 0.8 } } };
      },
    });
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => provider });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    expect(result.success.confidence).toBeUndefined();
    const persisted = result.success.observation;
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    expect(content.confidence).toBeUndefined();
  });
});

describe("基本判断経路の観測生成条件（TS-006）", () => {
  test("not_configured は観測を生成しない（未設定は呼出し前判定）", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => null });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("not_configured");
    expect(payload.observation).toBeUndefined();
    const dir = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(dir).toBeNull();
  });

  test("入力検証失敗も観測を生成しない", async () => {
    const worktree = await tempWorktree();
    const result = await runAgentdevJevOperation(worktree, evaluateRequest({ state: "" }), { resolveProvider: () => mockProvider() });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("invalid_input");
    expect(payload.observation).toBeUndefined();
    const dir = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(dir).toBeNull();
  });

  test("呼出し開始後の失敗は失敗分類と最小 diagnostic を持つ失敗観測を生成する", async () => {
    const worktree = await tempWorktree();
    const provider = mockProvider({
      async evaluate() {
        throw Object.assign(new Error("overloaded"), { statusCode: 429 });
      },
    });
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => provider });
    const payload = result as JevEvaluateResult;
    expect(payload.ok).toBe(false);
    if (payload.ok) return;
    expect(payload.failure.kind).toBe("rate_limited");
    const persisted = payload.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    const content = await readObservationJson(worktree, persisted.writtenPath);
    const failure = content.failure as Record<string, unknown>;
    expect(failure.kind).toBe("rate_limited");
    expect(String(failure.detail)).toContain("overloaded");
    expect(content.results).toBeUndefined();
    expect(content.confidence).toBeUndefined();
  });

  test("実評価の呼出し時間が記録され、inputTokens は provider 返却時のみ保存される", async () => {
    const worktree = await tempWorktree();
    let clock = 1000;
    const providerWithTokens = mockProvider();
    const withTokens = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => providerWithTokens, now: () => ++clock });
    expect(withTokens.ok).toBe(true);
    if (!withTokens.ok || withTokens.operation !== "evaluate") return;
    const persistedWith = withTokens.success.observation;
    if (!persistedWith || !("observationId" in persistedWith)) return;
    const contentWith = await readObservationJson(worktree, persistedWith.writtenPath);
    expect(typeof contentWith.durationMs).toBe("number");
    expect(contentWith.durationMs).toBeGreaterThan(0);
    expect(contentWith.inputTokens).toBe(589);

    const providerNoTokens = mockProvider({
      async evaluate() {
        return { requestedModel: "mock/jev", confidenceRaw: 0.9, answers: { q1: { value: 0.8 } } };
      },
    });
    const withoutTokens = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => providerNoTokens, now: () => ++clock });
    if (!withoutTokens.ok || withoutTokens.operation !== "evaluate") return;
    const persistedWithout = withoutTokens.success.observation;
    if (!persistedWithout || !("observationId" in persistedWithout)) return;
    const contentWithout = await readObservationJson(worktree, persistedWithout.writtenPath);
    expect(contentWithout.inputTokens).toBeUndefined();
  });
});

describe("最終判断の観測反映（TS-004）", () => {
  async function evaluateOnce(worktree: string): Promise<string> {
    const evaluated = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => mockProvider() });
    if (!evaluated.ok || evaluated.operation !== "evaluate") throw new Error("evaluate failed");
    const persisted = evaluated.success.observation;
    if (!persisted || !("observationId" in persisted)) throw new Error("observation missing");
    return persisted.observationId;
  }

  test("evaluator 成功観測へ最終判断結果が保持される", async () => {
    const worktree = await tempWorktree();
    const observationId = await evaluateOnce(worktree);
    const written = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: true }] },
      },
    }) as JevObservationWriteResult;
    expect(written.ok).toBe(true);
    const content = await readObservationJson(worktree, `.agentdev/jev-observations/${observationId}.json`);
    const finalResult = content.finalResult as { results: Array<Record<string, unknown>> };
    expect(finalResult.results[0]?.questionId).toBe("q1");
    expect(finalResult.results[0]?.value).toBe(true);
    expect(finalResult.results[0]?.differenceReason).toBeUndefined();
  });

  test("失敗観測への最終判断反映は拒否される（失敗観測への重複保存なし）", async () => {
    const worktree = await tempWorktree();
    const provider = mockProvider({
      async evaluate() {
        throw Object.assign(new Error("gateway error"), { statusCode: 503 });
      },
    });
    const evaluated = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => provider });
    expect(evaluated.ok).toBe(false);
    const persisted = (evaluated as { observation?: { observationId?: string } }).observation;
    if (!persisted?.observationId) throw new Error("failure observation missing");
    const written = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId: persisted.observationId,
      observation: { schemaVersion: 2, finalResult: { results: [{ questionId: "q1", value: true }] } },
    }) as JevObservationWriteResult;
    expect(written.ok).toBe(false);
    if (!written.ok) expect(written.failure.detail).toContain("evaluator-success");
  });

  test("最終判断が evaluator 返却結果と一致する場合、差異理由分類は記録されない", async () => {
    const worktree = await tempWorktree();
    const observationId = await evaluateOnce(worktree);
    const written = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: true }] },
      },
    }) as JevObservationWriteResult;
    expect(written.ok).toBe(true);
    const content = await readObservationJson(worktree, `.agentdev/jev-observations/${observationId}.json`);
    const finalResult = content.finalResult as { results: Array<Record<string, unknown>> };
    expect(finalResult.results[0]?.differenceReason).toBeUndefined();
  });

  test("最終判断が evaluator 返却結果と異なる場合、4分類のいずれかの差異理由が記録される", async () => {
    const worktree = await tempWorktree();
    const observationId = await evaluateOnce(worktree);
    const written = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: false, differenceReason: "semantic_disagreement" }] },
      },
    }) as JevObservationWriteResult;
    expect(written.ok).toBe(true);
    const content = await readObservationJson(worktree, `.agentdev/jev-observations/${observationId}.json`);
    const finalResult = content.finalResult as { results: Array<Record<string, unknown>> };
    expect(finalResult.results[0]?.value).toBe(false);
    expect(finalResult.results[0]?.differenceReason).toBe("semantic_disagreement");
  });

  test("不一致な最終判断への差異理由は4分類のみ受理され、一致時に differenceReason を付けると拒否される", async () => {
    const worktree = await tempWorktree();
    const observationId = await evaluateOnce(worktree);
    const wrongReason = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: true, differenceReason: "semantic_disagreement" }] },
      },
    }) as JevObservationWriteResult;
    expect(wrongReason.ok).toBe(false);
    if (!wrongReason.ok) expect(wrongReason.failure.detail).toContain("differenceReason");
    const invalidReason = await runAgentdevJevOperation(worktree, {
      operation: "observation_write",
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: false, differenceReason: "model_mood" }] },
      },
    }) as JevObservationWriteResult;
    expect(invalidReason.ok).toBe(false);
  });

  test("追記は冪等で重複 JSON を生成しない", async () => {
    const worktree = await tempWorktree();
    const observationId = await evaluateOnce(worktree);
    const request = {
      operation: "observation_write" as const,
      observationId,
      observation: {
        schemaVersion: 2,
        finalResult: { results: [{ questionId: "q1", value: false, differenceReason: "unknown" }] },
      },
    };
    await runAgentdevJevOperation(worktree, request);
    const again = await runAgentdevJevOperation(worktree, request) as JevObservationWriteResult;
    expect(again.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${observationId}.json`]);
  });
});

describe("fail-open と中断耐性（TS-007）", () => {
  test("観測の永続化のみに失敗しても評価結果は維持され、識別可能な warning が構造化情報に含まれる", async () => {
    const worktree = await tempWorktree();
    await fs.mkdir(path.join(worktree, ".agentdev"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "jev-observations"), "not-a-dir", "utf8");
    const result = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => mockProvider() });
    expect(result.ok).toBe(true);
    if (!result.ok || result.operation !== "evaluate") return;
    expect(result.success.results[0]?.value).toBe(true);
    const persisted = result.success.observation;
    expect(persisted && "warning" in persisted).toBe(true);
    if (!persisted || !("warning" in persisted)) return;
    expect(persisted.warning).toContain("observation write failed");
  });

  test("evaluator 成功後の時点で観測ファイルが存在する（永続化成功後の中断でも観測は失われない）", async () => {
    const worktree = await tempWorktree();
    const evaluated = await runAgentdevJevOperation(worktree, evaluateRequest(), { resolveProvider: () => mockProvider() });
    expect(evaluated.ok).toBe(true);
    if (!evaluated.ok || evaluated.operation !== "evaluate") return;
    const persisted = evaluated.success.observation;
    expect(persisted && !("warning" in persisted)).toBe(true);
    if (!persisted || !("observationId" in persisted)) return;
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${persisted.observationId}.json`]);
    const content = await readObservationJson(worktree, persisted.writtenPath);
    const results = content.results as Array<Record<string, unknown>>;
    expect(results[0]?.value).toBe(true);
    expect(results[0]?.probabilityDistribution).toBeDefined();
    expect(content.confidence).toBeCloseTo(0.91);
  });
});
