// 観測書込み支援（REQ-090-006）のテスト。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { defaultObservationId, requestDigest, validateObservation, writeObservation } from "../observation.ts";
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
});

describe("defaultObservationId", () => {
  test("timestamp ベースの一意 ID を生成する", () => {
    const id = defaultObservationId(new Date("2026-09-22T00:00:00Z"));
    expect(id).toMatch(/^20260922T000000Z-[0-9a-f]{4}$/);
  });
});
