// 観測書込み支援（REQ-090-006）のテスト。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { completeObservation, defaultObservationId, requestDigest, upsertPartialObservation, validateCompletionObservation, validateObservation, writeObservation } from "../observation.ts";
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

function baseObservation(overrides: Partial<JevObservation> = {}): JevObservation {
  return {
    schemaVersion: 1,
    workflow: "learning-promote",
    judgmentKind: "evaluation",
    subject: "inbox エントリ 1件",
    provider: "mock",
    requestedModel: "mock/jev",
    sourceRevision: "c6c15e72e5cae9ba8c3a957e32662704db94283c",
    outcome: "completed",
    durationMs: 120,
    inputs: { requestDigest: DIGEST },
    judgments: [
      {
        judgmentId: "j1",
        questionForm: "boolean",
        jevResult: true,
        probabilityDistribution: { true: 0.8, false: 0.2 },
        confidence: 0.8,
        llmFinalJudgment: "採用",
        llmTreatment: "unchanged",
      },
    ],
    ...overrides,
  };
}

describe("validateObservation", () => {
  test("有効な観測を受理する", () => {
    expect(validateObservation(baseObservation()).ok).toBe(true);
  });

  test("not_configured の実行は judgments 空で受理する", () => {
    const result = validateObservation(baseObservation({ outcome: "not_configured", durationMs: 0, judgments: [] }));
    expect(result.ok).toBe(true);
  });

  test("completed は jevResult・confidence・probabilityDistribution を要求する", () => {
    const observation = baseObservation();
    delete (observation.judgments[0] as Record<string, unknown>).confidence;
    const result = validateObservation(observation);
    expect(result.ok).toBe(false);
  });

  test("未知 field（閾値依存の分類結果など）を拒否する", () => {
    const observation = baseObservation() as unknown as Record<string, unknown>;
    observation.confidenceClassification = "high";
    const result = validateObservation(observation);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("confidenceClassification");
  });

  test("llmTreatment は unchanged/corrected のみ", () => {
    const observation = baseObservation() as unknown as Record<string, unknown>;
    (observation.judgments as Array<Record<string, unknown>>)[0]!["llmTreatment"] = "promising";
    const result = validateObservation(observation);
    expect(result.ok).toBe(false);
  });

  test("requestDigest は sha256 hex 64 桁を要求する", () => {
    const observation = baseObservation();
    observation.inputs.requestDigest = "not-a-digest";
    expect(validateObservation(observation).ok).toBe(false);
  });
});

describe("validateObservation recordState（REQ-090-013）", () => {
  function partialJudgment() {
    return {
      judgmentId: "j1",
      questionForm: "boolean" as const,
      jevResult: true,
      probabilityDistribution: { true: 0.8, false: 0.2 },
      confidence: 0.8,
    };
  }

  test("recordState partial は LLM field 省略を受理する", () => {
    const observation = baseObservation({ recordState: "partial" });
    (observation.judgments as Array<Record<string, unknown>>)[0] = partialJudgment();
    const result = validateObservation(observation);
    expect(result.ok).toBe(true);
  });

  test("recordState complete（明示）は LLM field を要求する", () => {
    const observation = baseObservation({ recordState: "complete" });
    delete (observation.judgments[0] as Record<string, unknown>).llmFinalJudgment;
    delete (observation.judgments[0] as Record<string, unknown>).llmTreatment;
    const result = validateObservation(observation);
    expect(result.ok).toBe(false);
  });

  test("recordState 省略は complete 相当（LLM field 必須・後方互換）", () => {
    const observation = baseObservation();
    delete (observation.judgments[0] as Record<string, unknown>).llmTreatment;
    expect(validateObservation(observation).ok).toBe(false);
  });

  test("recordState の不正値を拒否する", () => {
    const observation = baseObservation() as unknown as Record<string, unknown>;
    observation.recordState = "draft";
    expect(validateObservation(observation).ok).toBe(false);
  });

  test("partial 判定でも LLM field の不正値は拒否する", () => {
    const observation = baseObservation({ recordState: "partial" });
    (observation.judgments as Array<Record<string, unknown>>)[0] = {
      ...partialJudgment(),
      llmTreatment: "promising",
    };
    expect(validateObservation(observation).ok).toBe(false);
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

describe("writeObservation", () => {
  test("1実行 = 1 JSON ファイルを原子的に書き込む", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await writeObservation(worktree, baseObservation(), { generateObservationId: () => "id-1" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.success.writtenPath).toBe(".agentdev/jev-observations/id-1.json");
      expect(result.success.observationId).toBe("id-1");
    }
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["id-1.json"]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "id-1.json"), "utf8"));
    expect(content.observationId).toBe("id-1");
    expect(content.workflow).toBe("learning-promote");
    expect(content.judgments).toHaveLength(1);
  });

  test("書込み先が衝突する場合も例外を出さず構造化失敗を返し、jev-observations/ 以外を変更しない（TS-004・TS-005）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await fs.mkdir(path.join(worktree, ".agentdev"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "jev-observations"), "not-a-dir", "utf8");
    const before = await listRelative(worktree);
    const result = await writeObservation(worktree, baseObservation(), { generateObservationId: () => "id-bad" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.retryable).toBe(false);
      expect(result.failure.detail).toContain("observation write failed");
    }
    const after = await listRelative(worktree);
    expect(after).toEqual(before);
  });

  test("書込み成功時も jev-observations/ 以外のパスを変更しない（TS-005: 正規 domain state 非混入）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await fs.mkdir(path.join(worktree, ".agentdev", "intake", "inbox"), { recursive: true });
    await fs.writeFile(path.join(worktree, ".agentdev", "intake", "inbox", "item.md"), "x", "utf8");
    const before = await listRelative(worktree);
    await writeObservation(worktree, baseObservation(), { generateObservationId: () => "id-4" });
    const after = await listRelative(worktree);
    const added = after.filter((p) => !before.includes(p));
    expect(added).toEqual([".agentdev/jev-observations/", ".agentdev/jev-observations/id-4.json"]);
  });

  test("複数判断は同一 JSON 内 judgments に格納される", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const observation = baseObservation({
      judgments: [
        baseObservation().judgments[0] as never,
        {
          judgmentId: "j2",
          questionForm: "choice",
          jevResult: "採用",
          probabilityDistribution: { 採用: 0.6, 却下: 0.4 },
          confidence: 0.6,
          llmFinalJudgment: "却下",
          llmTreatment: "corrected",
        },
      ],
    });
    const result = await writeObservation(worktree, observation, { generateObservationId: () => "id-2" });
    expect(result.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["id-2.json"]);
  });

  test("検証不合格は書込みせず構造化失敗を返す", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const invalid = baseObservation();
    (invalid as unknown as Record<string, unknown>).schemaVersion = 2;
    const result = await writeObservation(worktree, invalid as unknown as JevObservation, { generateObservationId: () => "id-3" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
    const exists = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(exists).toBeNull();
  });

  test("完成書込みには recordState complete を永続化する（機械判別可能な完了状態 field）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await writeObservation(worktree, baseObservation(), { generateObservationId: () => "id-rec" });
    expect(result.ok).toBe(true);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "id-rec.json"), "utf8"));
    expect(content.recordState).toBe("complete");
  });

  test("recordState partial の直接書込みは拒否する（部分レコードは evaluate 時点書込みのみ）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const partial = baseObservation({ recordState: "partial" });
    delete (partial.judgments[0] as Record<string, unknown>).llmFinalJudgment;
    delete (partial.judgments[0] as Record<string, unknown>).llmTreatment;
    const result = await writeObservation(worktree, partial, { generateObservationId: () => "id-partial" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("completion write only");
    const exists = await fs.stat(path.join(worktree, ".agentdev", "jev-observations")).catch(() => null);
    expect(exists).toBeNull();
  });
});

describe("upsertPartialObservation（evaluate 時点書込み・REQ-090-013）", () => {
  function partialObservation(overrides: Partial<JevObservation> = {}): JevObservation {
    const base = baseObservation({ recordState: "partial", ...overrides });
    delete (base.judgments[0] as Record<string, unknown>).llmFinalJudgment;
    delete (base.judgments[0] as Record<string, unknown>).llmTreatment;
    return base;
  }

  test("observationId 未指定は新規 ID で部分レコードを作成する（recordState partial を永続化）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await upsertPartialObservation(worktree, partialObservation());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const content = JSON.parse(await fs.readFile(path.join(worktree, result.success.writtenPath), "utf8"));
    expect(content.observationId).toBe(result.success.observationId);
    expect(content.recordState).toBe("partial");
    expect(content.judgments[0].llmFinalJudgment).toBeUndefined();
    expect(content.judgments[0].jevResult).toBe(true);
    expect(content.judgments[0].confidence).toBe(0.8);
  });

  test("observationId 指定時は既存 partial JSON 内 judgments へ追記する（重複 JSON を生成しない）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const first = await upsertPartialObservation(worktree, partialObservation(), { observationId: "run-1" });
    expect(first.ok).toBe(true);
    const second = await upsertPartialObservation(
      worktree,
      partialObservation({
        judgments: [
          {
            judgmentId: "j2",
            questionForm: "choice",
            jevResult: "採用",
            probabilityDistribution: { 採用: 0.6, 却下: 0.4 },
            confidence: 0.6,
          },
        ],
      }),
      { observationId: "run-1" },
    );
    expect(second.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["run-1.json"]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "run-1.json"), "utf8"));
    expect(content.judgments).toHaveLength(2);
    expect(content.recordState).toBe("partial");
  });

  test("同一 judgmentId の再 upsert は上書きで冪等（JSON 破壊・判断重複なし）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await upsertPartialObservation(worktree, partialObservation(), { observationId: "run-idem" });
    const again = await upsertPartialObservation(worktree, partialObservation(), { observationId: "run-idem" });
    expect(again.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["run-idem.json"]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "run-idem.json"), "utf8"));
    expect(content.judgments).toHaveLength(1);
  });

  test("observationId 指定で既存 complete JSON に衝突した場合は失敗する（完成レコードの部分上書き禁止）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await writeObservation(worktree, baseObservation(), { generateObservationId: () => "done-1" });
    const result = await upsertPartialObservation(worktree, partialObservation(), { observationId: "done-1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("already completed");
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["done-1.json"]);
  });

  test("不安全な observationId（路径構成要素）は拒否する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await upsertPartialObservation(worktree, partialObservation(), { observationId: "../escape" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
    const exists = await fs.stat(path.join(worktree, ".agentdev")).catch(() => null);
    expect(exists).toBeNull();
  });

  test("検証不合格（workflow 空等）は書込みせず構造化失敗を返す", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const invalid = partialObservation({ workflow: "" });
    const result = await upsertPartialObservation(worktree, invalid, { observationId: "run-bad" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
    const exists = await fs.stat(path.join(worktree, ".agentdev")).catch(() => null);
    expect(exists).toBeNull();
  });
});

describe("completeObservation（observation_write 追記完成 mode・REQ-090-013）", () => {
  function completionJudgments(): JevObservation["judgments"] {
    return [
      {
        judgmentId: "j1",
        questionForm: "boolean",
        llmFinalJudgment: "採用",
        llmTreatment: "unchanged",
      },
    ];
  }

  async function seedPartial(worktree: string): Promise<void> {
    const base = baseObservation({ recordState: "partial" });
    delete (base.judgments[0] as Record<string, unknown>).llmFinalJudgment;
    delete (base.judgments[0] as Record<string, unknown>).llmTreatment;
    const result = await upsertPartialObservation(worktree, base, { observationId: "run-c" });
    expect(result.ok).toBe(true);
  }

  test("同一 JSON へ LLM field を追記し recordState を complete へ更新する（1実行 1 JSON 維持）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await seedPartial(worktree);
    const result = await completeObservation(worktree, "run-c", completionJudgments());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.success.writtenPath).toBe(".agentdev/jev-observations/run-c.json");
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["run-c.json"]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "run-c.json"), "utf8"));
    expect(content.recordState).toBe("complete");
    expect(content.judgments[0].llmFinalJudgment).toBe("採用");
    expect(content.judgments[0].llmTreatment).toBe("unchanged");
    expect(content.judgments[0].jevResult).toBe(true);
    expect(content.workflow).toBe("learning-promote");
  });

  test("二重 observation_write は冪等（重複作成なし・同一結果）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await seedPartial(worktree);
    await completeObservation(worktree, "run-c", completionJudgments());
    const again = await completeObservation(worktree, "run-c", completionJudgments());
    expect(again.ok).toBe(true);
    const files = await fs.readdir(path.join(worktree, ".agentdev", "jev-observations"));
    expect(files).toEqual(["run-c.json"]);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "run-c.json"), "utf8"));
    expect(content.recordState).toBe("complete");
    expect(content.judgments).toHaveLength(1);
  });

  test("LLM field 欠落の完成要求は validateCompletionObservation が拒否する（部分レコードのまま残す）", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await seedPartial(worktree);
    const completion = validateCompletionObservation({
      schemaVersion: 1,
      judgments: [
        {
          judgmentId: "j1",
          questionForm: "boolean",
          llmFinalJudgment: "採用",
        },
      ],
    });
    expect(completion.ok).toBe(false);
    const content = JSON.parse(await fs.readFile(path.join(worktree, ".agentdev", "jev-observations", "run-c.json"), "utf8"));
    expect(content.recordState).toBe("partial");
  });

  test("validateCompletionObservation は Jev 側観測項目・run 級 field を要求しない（LLM field のみ）", () => {
    const result = validateCompletionObservation({
      schemaVersion: 1,
      judgments: [{ judgmentId: "j1", llmFinalJudgment: "却下", llmTreatment: "corrected" }],
    });
    expect(result.ok).toBe(true);
  });

  test("validateCompletionObservation は recordState partial を拒否する", () => {
    const result = validateCompletionObservation({
      schemaVersion: 1,
      recordState: "partial",
      judgments: [{ judgmentId: "j1", llmFinalJudgment: "却下", llmTreatment: "corrected" }],
    });
    expect(result.ok).toBe(false);
  });

  test("存在しない observationId は invalid_input で失敗する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    const result = await completeObservation(worktree, "missing-1", completionJudgments());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.detail).toContain("not found");
  });

  test("不安全な observationId は拒否する", async () => {
    const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "jev-obs-"));
    await seedPartial(worktree);
    const result = await completeObservation(worktree, "sub/dir", completionJudgments());
    expect(result.ok).toBe(false);
  });
});

describe("defaultObservationId", () => {
  test("timestamp ベースの一意 ID を生成する", () => {
    const id = defaultObservationId(new Date("2026-09-22T00:00:00Z"));
    expect(id).toMatch(/^20260922T000000Z-[0-9a-f]{4}$/);
  });
});
