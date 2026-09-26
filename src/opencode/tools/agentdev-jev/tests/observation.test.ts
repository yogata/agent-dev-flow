// 観測書込み支援（形式検証・1 evaluation = 1 observation の書込み・final result 追記）のテスト。
//
// TS-001: 評価1件 = 観測1ファイル
// TS-002: 質問単位の confidence 複製・代替生成 field は schema が許容しない
// TS-005: source revision 必須、判断入力全文の非保存、最小 snapshot、provider・model 構成値の非必須
// TS-006: 失敗観測は呼出し開始後の失敗分類のみ
// TS-007: 書込み失敗は構造化失敗（fail-open。他パスを変更しない）

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { appendFinalResult, defaultObservationId, requestDigest, validateFinalResultObservation, validateObservation, writeEvaluationObservation } from "../observation.ts";
import type { JevObservation } from "../contracts.ts";

const DIGEST = "a".repeat(64);

async function listRelative(root: string): Promise<string[]> {
  const entries: string[] = [];
  async function walk(dir: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const rel = path.relative(root, path.join(dir, entry.name)).split(path.sep).join("/");
      if (entry.isDirectory()) {
        entries.push(`${rel}/`);
        await walk(path.join(dir, entry.name));
      } else {
        entries.push(rel);
      }
    }
  }
  await walk(root);
  return entries;
}

function successObservation(overrides: Partial<JevObservation> = {}): JevObservation {
  return {
    schemaVersion: 2,
    observationId: "obs-fixture",
    workflow: "learning-promote",
    evaluationKind: "evaluation",
    subject: "inbox エントリ 1件",
    sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    durationMs: 120,
    inputTokens: 300,
    inputs: { requestDigest: DIGEST },
    results: [
      {
        questionId: "j1",
        questionForm: "boolean",
        value: true,
        probabilityDistribution: { true: 0.8, false: 0.2 },
      },
    ],
    confidence: 0.91,
    ...overrides,
  };
}

function failureObservation(overrides: Partial<JevObservation> = {}): JevObservation {
  return {
    schemaVersion: 2,
    observationId: "obs-fixture",
    workflow: "learning-promote",
    evaluationKind: "evaluation",
    subject: "inbox エントリ 1件",
    sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    durationMs: 45,
    inputs: { requestDigest: DIGEST },
    failure: { kind: "timeout", detail: "AbortError: aborted" },
    ...overrides,
  };
}

describe("validateObservation", () => {
  test("evaluator 成功観測を受理する", () => {
    expect(validateObservation(successObservation()).ok).toBe(true);
  });

  test("失敗観測（呼出し開始後の失敗分類）を受理する", () => {
    expect(validateObservation(failureObservation()).ok).toBe(true);
  });

  test("results と failure は排他必須（どちらも無い・双方有りの観測を拒否する）", () => {
    const neither = successObservation() as unknown as Record<string, unknown>;
    delete neither.results;
    expect(validateObservation(neither).ok).toBe(false);
    const both = successObservation({ failure: { kind: "timeout", detail: "x" } });
    expect(validateObservation(both).ok).toBe(false);
  });

  test("schemaVersion 1 の履歴観測を現行観測として受理しない", () => {
    const legacy = {
      schemaVersion: 1,
      workflow: "learning-promote",
      judgmentKind: "evaluation",
      subject: "履歴",
      provider: "mock",
      requestedModel: "mock/jev",
      sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
      outcome: "completed",
      durationMs: 100,
      inputs: { requestDigest: DIGEST },
      judgments: [],
      recordState: "complete",
    };
    expect(validateObservation(legacy).ok).toBe(false);
  });

  test("未知 field を拒否する", () => {
    const observation = successObservation() as unknown as Record<string, unknown>;
    observation.unexpected = 1;
    const result = validateObservation(observation);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("unexpected");
  });

  test("failure observation への confidence・finalResult 付与を拒否する", () => {
    const withConfidence = failureObservation({ confidence: 0.9 });
    expect(validateObservation(withConfidence).ok).toBe(false);
    const withFinal = failureObservation({ finalResult: { results: [{ questionId: "j1", value: true }] } });
    expect(validateObservation(withFinal).ok).toBe(false);
  });

  test("confidence は [0,1] の数値のみ受理する", () => {
    const observation = successObservation({ confidence: 1.5 });
    expect(validateObservation(observation).ok).toBe(false);
  });

  test("失敗分類は呼出し開始後の5分類のみ受理する", () => {
    const notConfigured = failureObservation({ failure: { kind: "not_configured" as never, detail: "unset" } });
    expect(validateObservation(notConfigured).ok).toBe(false);
    const invalidInput = failureObservation({ failure: { kind: "invalid_input" as never, detail: "bad input" } });
    expect(validateObservation(invalidInput).ok).toBe(false);
  });

  test("failure.detail（最小 diagnostic）の欠落を拒否する", () => {
    const observation = failureObservation({ failure: { kind: "timeout", detail: "" } });
    expect(validateObservation(observation).ok).toBe(false);
  });

  test("requestDigest は sha256 hex 64 桁を要求する", () => {
    const observation = successObservation();
    observation.inputs.requestDigest = "not-a-digest";
    expect(validateObservation(observation).ok).toBe(false);
  });

  test("source revision は必須、identity は省略可能（provider・model 構成値は必須保存しない）", () => {
    const observation = successObservation();
    expect(validateObservation(observation).ok).toBe(true);
    expect(observation.identity).toBeUndefined();
    const withoutRevision = successObservation() as unknown as Record<string, unknown>;
    delete withoutRevision.sourceRevision;
    expect(validateObservation(withoutRevision).ok).toBe(false);
    const withIdentity = successObservation({ identity: { resolvedModel: "mock/jev-0721" } });
    expect(validateObservation(withIdentity).ok).toBe(true);
  });

  test("finalResult は evaluator 返却結果と1対1対応し、不一致時のみ差異理由を受理する", () => {
    const matching = successObservation({ finalResult: { results: [{ questionId: "j1", value: true }] } });
    expect(validateObservation(matching).ok).toBe(true);
    const differing = successObservation({ finalResult: { results: [{ questionId: "j1", value: false, differenceReason: "semantic_disagreement" }] } });
    expect(validateObservation(differing).ok).toBe(true);
    const matchingWithReason = successObservation({ finalResult: { results: [{ questionId: "j1", value: true, differenceReason: "semantic_disagreement" }] } });
    expect(validateObservation(matchingWithReason).ok).toBe(false);
    const unknownReason = successObservation({ finalResult: { results: [{ questionId: "j1", value: false, differenceReason: "mood" as never }] } });
    expect(validateObservation(unknownReason).ok).toBe(false);
    const missingQuestion = successObservation({ finalResult: { results: [] } });
    expect(validateObservation(missingQuestion).ok).toBe(false);
    const unrelatedQuestion = successObservation({ finalResult: { results: [{ questionId: "j2", value: true }] } });
    expect(validateObservation(unrelatedQuestion).ok).toBe(false);
  });
});

describe("requestDigest", () => {
  test("同一入力から同一 digest、異なる入力から異なる digest", () => {
    const d1 = requestDigest("状態", "指示", undefined, "[]");
    const d2 = requestDigest("状態", "指示", undefined, "[]");
    const d3 = requestDigest("状態2", "指示", undefined, "[]");
    expect(d1).toBe(d2);
    expect(d1).not.toBe(d3);
    expect(d1).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("writeEvaluationObservation", () => {
  test("評価1件につき1ファイルを原子的に書き込む（TS-001）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await writeEvaluationObservation(worktree, successObservation());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.success.writtenPath).toMatch(/^\.agentdev\/jev-observations\/[^/]+\.json$/);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${result.success.observationId}.json`]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${result.success.observationId}.json`), "utf8"));
    expect(content.observationId).toBe(result.success.observationId);
    expect(content.workflow).toBe("learning-promote");
    expect(content.evaluationKind).toBe("evaluation");
  });

  test("連続する2評価は2ファイルを生成する（観測単位の集約を行わない）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await writeEvaluationObservation(worktree, successObservation());
    await writeEvaluationObservation(worktree, successObservation());
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toHaveLength(2);
  });

  test("書込み先が衝突する場合も例外を出さず構造化失敗を返し、jev-observations/ 以外を変更しない（TS-007）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await fs.mkdir(path.join(worktree, ".agentdev"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "jev-observations"), "not-a-dir", "utf8");
    const before = await listRelative(worktree);
    const result = await writeEvaluationObservation(worktree, successObservation());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.retryable).toBe(false);
      expect(result.failure.detail).toContain("observation write failed");
    }
    const after = await listRelative(worktree);
    expect(after).toEqual(before);
  });

  test("書込み成功時も jev-observations/ 以外の正規状態パスを変更しない", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await fs.mkdir(path.join(worktree, ".agentdev", "intake", "inbox"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "intake", "inbox", "item.md"), "x", "utf8");
    const before = await listRelative(worktree);
    await writeEvaluationObservation(worktree, successObservation());
    const after = await listRelative(worktree);
    const added = after.filter((p) => !before.includes(p));
    expect(added.length).toBeGreaterThan(0);
    expect(added.every((p) => p.startsWith(".agentdev/jev-observations/"))).toBe(true);
  });

  test("検証不合格は書込みせず構造化失敗を返す", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const invalid = successObservation() as unknown as Record<string, unknown>;
    invalid.schemaVersion = 1;
    const result = await writeEvaluationObservation(worktree, invalid as unknown as JevObservation);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
    const exists = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(exists).toBeNull();
  });
});

describe("appendFinalResult", () => {
  async function seedSuccess(worktree: string): Promise<string> {
    const result = await writeEvaluationObservation(worktree, successObservation());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("seed failed");
    return result.success.observationId;
  }

  test("evaluator 成功観測の同一 JSON へ最終判断結果を追記する（重複 JSON なし）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const observationId = await seedSuccess(worktree);
    const result = await appendFinalResult(worktree, observationId, { results: [{ questionId: "j1", value: false, differenceReason: "deterministic_override" }] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.success.writtenPath).toBe(`.agentdev/jev-observations/${observationId}.json`);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual([`${observationId}.json`]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", `${observationId}.json`), "utf8"));
    const finalResult = content.finalResult as { results: Array<Record<string, unknown>> };
    expect(finalResult.results[0]?.value).toBe(false);
    expect(finalResult.results[0]?.differenceReason).toBe("deterministic_override");
    expect((content.results as Array<unknown>)).toHaveLength(1);
    expect(content.workflow).toBe("learning-promote");
  });

  test("失敗観測への追記は拒否する（最終判断結果は evaluator 成功観測に限定）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const seeded = await writeEvaluationObservation(worktree, failureObservation());
    expect(seeded.ok).toBe(true);
    if (!seeded.ok) return;
    const result = await appendFinalResult(worktree, seeded.success.observationId, { results: [{ questionId: "j1", value: true }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("evaluator-success");
  });

  test("存在しない observationId は invalid_input で失敗する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await appendFinalResult(worktree, "missing-1", { results: [{ questionId: "j1", value: true }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("not found");
  });

  test("パス構成要素を含む observationId は拒否する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await appendFinalResult(worktree, "../escape", { results: [{ questionId: "j1", value: true }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
  });

  test("現行契約外の観測（履歴形式）への追記は拒否する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await fs.mkdir(path.join(worktree, ".agentdev", "jev-observations"), { recursive: true });
    const legacy = {
      schemaVersion: 1,
      workflow: "learning-promote",
      judgmentKind: "evaluation",
      subject: "履歴",
      provider: "mock",
      requestedModel: "mock/jev",
      sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
      outcome: "completed",
      durationMs: 100,
      inputs: { requestDigest: DIGEST },
      judgments: [{ judgmentId: "j1", questionForm: "boolean", jevResult: true, confidence: 0.8, llmFinalJudgment: "採用", llmTreatment: "unchanged" }],
      recordState: "complete",
    };
    await fs.writeFile(path.join(worktree, ".agentdev", "jev-observations", "legacy-1.json"), JSON.stringify(legacy, null, 2), "utf8");
    const result = await appendFinalResult(worktree, "legacy-1", { results: [{ questionId: "j1", value: true }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("current-contract");
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "legacy-1.json"), "utf8"));
    expect(content.finalResult).toBeUndefined();
  });

  test("1対1対応を満たさない追記（評価返却結果に無い質問・欠落質問）は拒否する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const observationId = await seedSuccess(worktree);
    const unknownQuestion = await appendFinalResult(worktree, observationId, { results: [{ questionId: "j9", value: true }] });
    expect(unknownQuestion.ok).toBe(false);
    const empty = await appendFinalResult(worktree, observationId, { results: [] });
    expect(empty.ok).toBe(false);
  });
});

describe("validateFinalResultObservation", () => {
  test("schemaVersion 2 の final result 追記入力を受理する", () => {
    const result = validateFinalResultObservation({
      schemaVersion: 2,
      finalResult: { results: [{ questionId: "j1", value: true }] },
    });
    expect(result.ok).toBe(true);
  });

  test("run 級 field の再送を拒否する（追記入力は最終判断結果のみ）", () => {
    const result = validateFinalResultObservation({
      schemaVersion: 2,
      workflow: "learning-promote",
      finalResult: { results: [{ questionId: "j1", value: true }] },
    });
    expect(result.ok).toBe(false);
  });

  test("finalResult 欠落と schemaVersion 違反を拒否する", () => {
    expect(validateFinalResultObservation({ schemaVersion: 2 }).ok).toBe(false);
    expect(validateFinalResultObservation({ schemaVersion: 1, finalResult: { results: [{ questionId: "j1", value: true }] } }).ok).toBe(false);
  });
});

describe("defaultObservationId", () => {
  test("timestamp ベースの一意 ID を生成する", () => {
    const id = defaultObservationId(new Date("2026-09-22T00:00:00Z"));
    expect(id).toMatch(/^20260922T000000Z-[0-9a-f]{4}$/);
  });
});
