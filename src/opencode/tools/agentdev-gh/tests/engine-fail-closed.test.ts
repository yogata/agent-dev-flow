// fail-closed 実行ゲートの異常系テスト（TS 相当: 強制機能の fail-closed）。
//
// 設定解釈不能・パス解決不能・強制処理異常終了・必須検証未了の4異常系を
// 意図的に発生させ、対象副作用が実行されず（または完了せず）、成功扱いに
// ならないことを検証する。FakeRunner は応答を返した時点を副作用の完了と
// みなす（throw は副作用完了なし）。


import { describe, expect, test } from "bun:test";
import type { GhToolFailure, GhToolRequest } from "../contracts.ts";
import {
  buildGhToolEnv,
  type PathProber,
} from "../engine.ts";
import { runAgentdevGhOperation } from "../index.ts";
import type { GhRunner, GhRunnerReply, GhRunnerRequest } from "../runner.ts";

const VALID_CONFIG = { repo: "owner/repo" };

const okProber: PathProber = { tempDir: () => "/tmp" };
const brokenProber: PathProber = { tempDir: () => null };

class FakeRunner implements GhRunner {
  readonly requests: GhRunnerRequest[] = [];
  readonly completed: GhRunnerRequest[] = [];
  private readonly handler: (request: GhRunnerRequest) => Promise<GhRunnerReply>;

  constructor(handler: (request: GhRunnerRequest) => Promise<GhRunnerReply>) {
    this.handler = handler;
  }

  async run(request: GhRunnerRequest): Promise<GhRunnerReply> {
    this.requests.push(request);
    const reply = await this.handler(request);
    if (reply.ok) this.completed.push(request);
    return reply;
  }
}

function assertFailureKind(
  failure: GhToolFailure | undefined,
  kind: GhToolFailure["kind"],
): void {
  expect(failure).toBeDefined();
  expect(failure?.kind).toBe(kind);
}

describe("異常系1: 設定を解釈できない（config-uninterpretable）", () => {
  test.each([
    ["非オブジェクト", "not-an-object"],
    ["repo 形式不正", { repo: "invalid" }],
    ["repo 欠落", {}],
    ["apiBaseUrl 形式不正", { repo: "owner/repo", apiBaseUrl: "http://insecure" }],
  ])("環境構築に失敗し、runner は一度も呼ばれない（%s）", async (_label, rawConfig) => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(rawConfig, okProber, runner);
    expect(env.ok).toBe(false);
    if (!env.ok) assertFailureKind(env.failure, "config-uninterpretable");
    expect(runner.requests).toEqual([]);
  });

  test("副作用操作を実行しても成功扱いにならない（実行前に失敗）", async () => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv({ repo: 123 }, okProber, runner);
    expect(env.ok).toBe(false);
    expect(runner.requests.length).toBe(0);
  });
});

describe("異常系2: 対象パスを安全に解決できない（path-unresolvable）", () => {
  test("環境構築に失敗し、runner は一度も呼ばれない", () => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(VALID_CONFIG, brokenProber, runner);
    expect(env.ok).toBe(false);
    if (!env.ok) assertFailureKind(env.failure, "path-unresolvable");
    expect(runner.requests).toEqual([]);
  });

  test("空文字列の一時ディレクトリも解決不能扱い", () => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(VALID_CONFIG, { tempDir: () => "" }, runner);
    expect(env.ok).toBe(false);
    expect(runner.requests).toEqual([]);
  });
});

describe("異常系3: 強制処理自体が異常終了した（enforcement-crashed）", () => {
  test("runner が例外を投げた場合、成功を返さない", async () => {
    const runner = new FakeRunner(async () => {
      throw new Error("gh crashed");
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_comment",
      number: 5,
      body: "text",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "enforcement-crashed");
    expect(runner.completed.length).toBe(0);
  });

  test("runner が実行失敗応答を返した場合、成功を返さない", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "gh: command failed",
      exitCode: 1,
    }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_close",
      number: 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "enforcement-crashed");
    expect(runner.completed.length).toBe(0);
  });
});

describe("異常系4: 必須検証が完了できない（verification-incomplete）", () => {
  function createRequest(): GhToolRequest {
    return { operation: "issue_create", title: "T", body: "B", labels: [] };
  }

  test("読み戻し（VERIFY）が不一致の場合、成功を返さない", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_create") {
        return { ok: true, payload: { number: 42, url: "https://example/i/42" } };
      }
      // 読み戻し: title 不一致
      return {
        ok: true,
        payload: { number: 42, title: "different", body: "B", state: "open" },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, createRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      assertFailureKind(result.failure, "verification-incomplete");
      expect(result.failure.retryable).toBe(false);
    }
  });

  test("読み戻しが見つからない場合、成功を返さない", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_create") {
        return { ok: true, payload: { number: 42, url: "https://example/i/42" } };
      }
      return { ok: false, error: "not found", exitCode: 1 };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, createRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
  });

  test("読み戻し中に runner が例外を投げた場合も verification-incomplete", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_create") {
        return { ok: true, payload: { number: 42, url: "https://example/i/42" } };
      }
      throw new Error("read-back crashed");
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, createRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
  });
});

describe("入力解釈と実行の正常系", () => {
  test("入力が操作契約に合致しない場合は invalid-input", async () => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_create",
      title: "",
      body: "B",
      labels: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "invalid-input");
    expect(runner.requests.length).toBe(0);
  });

  test("未知の操作名は invalid-input", async () => {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, { operation: "repo_delete" });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "invalid-input");
  });

  test("VERIFY 通過時のみ成功を返す（issue_create）", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_create") {
        return { ok: true, payload: { number: 42, url: "https://example/i/42" } };
      }
      return {
        ok: true,
        payload: { number: 42, title: "T", body: "B", state: "open" },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_create",
      title: "T",
      body: "B",
      labels: [],
    });
    expect(result.ok).toBe(true);
    expect(runner.requests.length).toBe(2);
    expect(runner.requests[0]?.operation).toBe("issue_create");
    expect(runner.requests[1]?.operation).toBe("issue_read");
  });

  test("title と body の両方を指定した issue_update は両方を検証に使う", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_update") {
        return { ok: true, payload: { number: 7, url: "https://example/i/7" } };
      }
      // 読み戻し: title のみ反映済み、body は旧のまま（body が検証対象なら失敗する）
      return {
        ok: true,
        payload: { number: 7, title: "new-title", body: "old-body", state: "open" },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 7,
      title: "new-title",
      body: "new-body",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
    expect(runner.requests[0]?.args).toEqual({
      number: 7,
      title: "new-title",
      body: "new-body",
    });
  });

  test("title と body の両方を反映した issue_update は成功する", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_update") {
        return { ok: true, payload: { number: 7, url: "https://example/i/7" } };
      }
      return {
        ok: true,
        payload: { number: 7, title: "new-title", body: "new-body", state: "open" },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 7,
      title: "new-title",
      body: "new-body",
    });
    expect(result.ok).toBe(true);
  });
});
