//
// Release 系 OperationSpec（specs-release.ts）の verify 読み戻し照合の単体テスト。
//
// gh 実行は注入したモック runner で置き換え、実コマンドを実行しない。
// 検証観点: 公開反映の伝播遅延を待機付き再照合で吸収すること、読み戻しの
// 不変フィールド（タイトル・本文・prerelease）不一致を失敗にすること、
// RC（prerelease=true）の公開後も prerelease の読み戻し整合を保つこと。
//


import { describe, expect, test } from "bun:test";
import { AGENTDEV_GH_OPERATION_SPECS } from "../index.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../runner.ts";

function specOf(operation: string) {
  const spec = AGENTDEV_GH_OPERATION_SPECS.find((s) => s.operation === operation);
  if (spec === undefined) throw new Error(`spec missing for operation: ${operation}`);
  return spec;
}

function publishRunnerReply(): Record<string, unknown> {
  return {
    tagName: "v1.2.3",
    title: "v1.2.3",
    body: "本文",
    draft: false,
    prerelease: false,
    url: "https://example/r/1",
    publishedAt: "2026-10-20T01:00:00Z",
    alreadyPublished: false,
  };
}

function readReply(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    tagName: "v1.2.3",
    title: "v1.2.3",
    body: "本文",
    draft: false,
    prerelease: false,
    url: "https://example/r/1",
    publishedAt: "2026-10-20T01:00:00Z",
    ...overrides,
  };
}

function okReply(payload: Record<string, unknown>): GhRunnerReply {
  return { ok: true, payload };
}

/** run 応答の列を順に返すモック runner（尽きたら最後の応答を繰り返す）。 */
function mockRunner(replies: GhRunnerReply[]): GhRunner {
  let call = 0;
  return {
    run(_request: GhRunnerRequest): Promise<GhRunnerReply> {
      const reply = replies[Math.min(call, replies.length - 1)] as GhRunnerReply;
      call += 1;
      return Promise.resolve(reply);
    },
  };
}

async function runVerify(readOverrides: Record<string, unknown>[]): Promise<boolean> {
  const spec = specOf("release_publish");
  const validated = spec.validate({
    operation: "release_publish",
    tagName: "v1.2.3",
    approvalBasis: "HITL 質問 ID: Q-1、回答の記録参照: Q-1-answer",
  });
  if (!validated.ok) throw new Error("request validation failed");
  const runnerReply = publishRunnerReply();
  const success = spec.parseSuccess(runnerReply);
  if (success === null) throw new Error("runner reply does not match the success contract");
  const runner = mockRunner(readOverrides.map((o) => okReply(readReply(o))));
  return spec.verify(runner, validated.request, success, runnerReply);
}

describe("release_publish verify の読み戻し照合（モック runner 単体）", () => {
  test("公開済みの読み戻しが初回で一致する場合は再照合なしで成功する", async () => {
    const verified = await runVerify([{ publishedAt: "2026-10-20T01:00:00Z" }]);
    expect(verified).toBe(true);
  });

  test("公開反映の伝播遅延（初回読戻しが draft のまま）を待機付き再照合で吸収する", async () => {
    const verified = await runVerify([
      { draft: true, publishedAt: null },
      { draft: false },
    ]);
    expect(verified).toBe(true);
  });

  test("読み戻しの不変フィールド（タイトル）が runner 応答と不一致の場合は失敗する", async () => {
    const verified = await runVerify([{ title: "改変されたタイトル" }]);
    expect(verified).toBe(false);
  });

  test("読み戻しの不変フィールド（prerelease・本文）が runner 応答と不一致の場合は失敗する", async () => {
    const bodyChanged = await runVerify([{ body: "改変された本文" }]);
    expect(bodyChanged).toBe(false);
    const prereleaseChanged = await runVerify([{ prerelease: true }]);
    expect(prereleaseChanged).toBe(false);
  });

  test("RC（prerelease=true）の公開後も読み戻しの prerelease 整合を保つ", async () => {
    const spec = specOf("release_publish");
    const validated = spec.validate({
      operation: "release_publish",
      tagName: "v6.0.0-rc.1",
      approvalBasis: "HITL 質問 ID: Q-2、回答の記録参照: Q-2-answer",
    });
    if (!validated.ok) throw new Error("request validation failed");
    const runnerReply = {
      ...publishRunnerReply(),
      tagName: "v6.0.0-rc.1",
      prerelease: true,
      url: "https://example/r/2",
    };
    const success = spec.parseSuccess(runnerReply);
    if (success === null) throw new Error("runner reply does not match the success contract");
    const runner = mockRunner([
      okReply(readReply({ tagName: "v6.0.0-rc.1", prerelease: true, url: "https://example/r/2" })),
    ]);
    const verified = await spec.verify(runner, validated.request, success, runnerReply);
    expect(verified).toBe(true);
  });
});
