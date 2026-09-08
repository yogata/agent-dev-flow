// ADF-COVERS(verification): REQ-011-023, REQ-011-025, REQ-011-028, REQ-011-029
//
// fail-closed 実行ゲートの異常系テスト（TS 相当: 強制機能の fail-closed）。
//
// 設定解釈不能・パス解決不能・強制処理異常終了・必須検証未了の4異常系を
// 意図的に発生させ、対象副作用が実行されず（または完了せず）、成功扱いに
// ならないことを検証する。FakeRunner は応答を返した時点を副作用の完了と
// みなす（throw は副作用完了なし）。加えて入力契約違反の構造化エラー
// （フィールド名特定）と runner 失敗クラスの engine 分類を検証する。


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

describe("異常系3: Tool / runner 自体の異常（enforcement-crashed）", () => {
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

  test("runner が enforcement-crashed クラスの失敗応答を返した場合は enforcement-crashed", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "failed to start gh",
      exitCode: null,
      failureClass: "enforcement-crashed",
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

describe("外部操作の失敗（operation-failed）と失敗分類の分離", () => {
  test("runner の外部操作失敗（HTTP 404 相当）は operation-failed に分類される", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "gh: Not Found (HTTP 404)",
      exitCode: 1,
      failureClass: "operation-failed",
    }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_close",
      number: 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      assertFailureKind(result.failure, "operation-failed");
      expect(result.failure.retryable).toBe(true);
    }
    expect(runner.completed.length).toBe(0);
  });

  test("存在しない Issue 番号への issue_read は invalid-input ではなく operation-failed", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "gh: Not Found (HTTP 404)",
      exitCode: 1,
      failureClass: "operation-failed",
    }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_read",
      number: 999999,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "operation-failed");
  });

  test("存在しない commentId への comment_update は invalid-input ではなく operation-failed", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "gh: Not Found (HTTP 404)",
      exitCode: 1,
      failureClass: "operation-failed",
    }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "comment_update",
      commentId: "999999",
      body: "text",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "operation-failed");
  });

  test("runner の入力契約違反クラスは invalid-input に分類される", async () => {
    const runner = new FakeRunner(async () => ({
      ok: false,
      error: "issue_update kind/trackingState apply only to tracking issues",
      exitCode: 0,
      failureClass: "operation-failed",
    }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 7,
      kind: "problem",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "operation-failed");
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
      return { ok: false, error: "not found", exitCode: 1, failureClass: "operation-failed" };
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

  test("Comment WRITE の読み戻しのみ失敗する場合は verification-incomplete（対象コメント不在）", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "comment_create") {
        return {
          ok: true,
          payload: { commentId: "101", url: "https://example/c/101" },
        };
      }
      if (request.operation === "comment_list") {
        return { ok: true, payload: { number: 7, comments: [] } };
      }
      return { ok: false, error: "unused", exitCode: 1, failureClass: "operation-failed" };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "comment_create",
      number: 7,
      body: "本文",
    });
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
        return {
          ok: true,
          payload: {
            number: 7,
            url: "https://example/i/7",
            before: { state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
          },
        };
      }
      // 読み戻し: title のみ反映済み、body は旧のまま（body が検証対象なら失敗する）
      return {
        ok: true,
        payload: { number: 7, title: "new-title", body: "old-body", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
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
        return {
          ok: true,
          payload: {
            number: 7,
            url: "https://example/i/7",
            before: { state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
          },
        };
      }
      return {
        ok: true,
        payload: { number: 7, title: "new-title", body: "new-body", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
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

  test("issue_update の応答が実行前状態（before）を欠く場合は検証未了として成功しない", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_update") {
        return { ok: true, payload: { number: 7, url: "https://example/i/7" } };
      }
      return {
        ok: true,
        payload: { number: 7, title: "T", body: "B", state: "open", labels: [], role: "case", kind: null, trackingState: null, closeReason: null },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 7,
      title: "T",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
  });
});

describe("操作単位の入力定義（構造化 invalid-input・フィールド名特定）", () => {
  async function invalidInput(
    rawRequest: unknown,
  ): Promise<{ kind: string; detail: string; runnerCalls: number }> {
    const runner = new FakeRunner(async () => ({ ok: true, payload: {} }));
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    if (!env.ok) throw new Error("env build failed");
    const result = await runAgentdevGhOperation(env.env, rawRequest);
    if (result.ok) throw new Error("expected invalid-input but got success");
    return {
      kind: result.failure.kind,
      detail: result.failure.detail,
      runnerCalls: runner.requests.length,
    };
  }

  test("契約外フィールドを含む要求は副作用発生前に invalid-input で拒否されフィールド名が特定できる", async () => {
    const r = await invalidInput({ operation: "issue_read", number: 5, milestone: "v1" });
    expect(r.kind).toBe("invalid-input");
    expect(r.detail).toContain("unknown-field");
    expect(r.detail).toContain("milestone");
    expect(r.runnerCalls).toBe(0);
  });

  test.each([
    ["issue_create は title 欠落で invalid-input（missing-field: title）", { operation: "issue_create", body: "B", labels: [] }, "title"],
    ["issue_create は labels 欠落で invalid-input（missing-field: labels）", { operation: "issue_create", title: "T", body: "B" }, "labels"],
    ["issue_read は number 欠落で invalid-input（missing-field: number）", { operation: "issue_read" }, "number"],
    ["comment_update は commentId 欠落で invalid-input（missing-field: commentId）", { operation: "comment_update", body: "B" }, "commentId"],
    ["comment_delete は commentId 欠落で invalid-input（missing-field: commentId）", { operation: "comment_delete" }, "commentId"],
    ["pr_merge は method 欠落で invalid-input（missing-field: method）", { operation: "pr_merge", number: 1 }, "method"],
  ])("%s", async (_label, rawRequest, field) => {
    const r = await invalidInput(rawRequest);
    expect(r.kind).toBe("invalid-input");
    expect(r.detail).toContain("missing-field");
    expect(r.detail).toContain(field);
    expect(r.runnerCalls).toBe(0);
  });

  test.each([
    ["issue_update の空更新は empty-update で拒否される", { operation: "issue_update", number: 7 }, "empty-update"],
    ["pr_update の空更新は empty-update で拒否される", { operation: "pr_update", number: 7 }, "empty-update"],
    ["issue_update の終端 trackingState は invalid-field で拒否される", { operation: "issue_update", number: 7, trackingState: "closed" }, "invalid-field"],
    ["comment_create の空 body は invalid-field で拒否される", { operation: "comment_create", number: 7, body: "" }, "invalid-field"],
    ["pr_create の draft に真偽値以外は invalid-field で拒否される", { operation: "pr_create", title: "T", body: "B", base: "main", head: "x", draft: "yes" }, "invalid-field"],
  ])("%s", async (_label, rawRequest, code) => {
    const r = await invalidInput(rawRequest);
    expect(r.kind).toBe("invalid-input");
    expect(r.detail).toContain(code);
    expect(r.runnerCalls).toBe(0);
  });
});

describe("issue_update の追跡軸保持 VERIFY（部分更新不変条件）", () => {
  const BEFORE = {
    state: "open",
    labels: ["agentdev-tracking", "agentdev-kind/risk", "agentdev-tracking-status/on-hold", "priority"],
    role: "tracking",
    kind: "risk",
    trackingState: "on-hold",
    closeReason: null,
  };

  test("labels のみ更新で追跡ラベルが剥離した場合（旧挙動）は verification-incomplete となる", async () => {
    // 修正前の CliRunner 挙動: labels のみ更新で追跡ラベルが剥離し Case 化しても
    // VERIFY が通過してしまった。before 基準の照合はこれを検出する。
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_update") {
        return {
          ok: true,
          payload: { number: 8, url: "https://example/i/8", before: BEFORE },
        };
      }
      // 読み戻し: 追跡ラベルが剥離し role が case 化した応答
      return {
        ok: true,
        payload: {
          number: 8,
          title: "追跡",
          body: "B",
          state: "open",
          labels: ["enhancement"],
          role: "case",
          kind: null,
          trackingState: null,
          closeReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 8,
      labels: ["enhancement"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
  });

  test("追跡軸が保持され要求通常ラベルが包含される場合は成功する", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_update") {
        return {
          ok: true,
          payload: { number: 8, url: "https://example/i/8", before: BEFORE },
        };
      }
      return {
        ok: true,
        payload: {
          number: 8,
          title: "追跡",
          body: "B",
          state: "open",
          labels: [
            "agentdev-tracking",
            "agentdev-kind/risk",
            "agentdev-tracking-status/on-hold",
            "enhancement",
            "priority",
          ],
          role: "tracking",
          kind: "risk",
          trackingState: "on-hold",
          closeReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_update",
      number: 8,
      labels: ["enhancement"],
    });
    expect(result.ok).toBe(true);
  });
});

describe("issue_reopen の状態遷移 VERIFY", () => {
  test("クローズ済み追跡Issueの reopen は in-discussion 遷移・kind/通常ラベル保持を確認して成功する", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_reopen") {
        return {
          ok: true,
          payload: {
            number: 9,
            state: "open",
            before: {
              state: "closed",
              labels: ["agentdev-tracking", "agentdev-kind/task"],
              role: "tracking",
              kind: "task",
              trackingState: "closed",
              closeReason: "completed",
            },
          },
        };
      }
      return {
        ok: true,
        payload: {
          number: 9,
          title: "T",
          body: "B",
          state: "open",
          labels: ["agentdev-tracking", "agentdev-kind/task", "agentdev-tracking-status/in-discussion", "priority"],
          role: "tracking",
          kind: "task",
          trackingState: "in-discussion",
          closeReason: null,
          stateReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_reopen",
      number: 9,
    });
    expect(result.ok).toBe(true);
  });

  test("クローズ済み追跡Issueが in-discussion へ遷移していない場合は成功しない", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_reopen") {
        return {
          ok: true,
          payload: {
            number: 9,
            state: "open",
            before: {
              state: "closed",
              labels: ["agentdev-tracking", "agentdev-kind/task"],
              role: "tracking",
              kind: "task",
              trackingState: "closed",
              closeReason: "completed",
            },
          },
        };
      }
      return {
        ok: true,
        payload: {
          number: 9,
          title: "T",
          body: "B",
          state: "open",
          labels: ["agentdev-tracking", "agentdev-kind/task"],
          role: "tracking",
          kind: "task",
          trackingState: "created",
          closeReason: null,
          stateReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_reopen",
      number: 9,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) assertFailureKind(result.failure, "verification-incomplete");
  });

  test("Case Issue への reopen は追跡状態遷移を要求せず open で成功する", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_reopen") {
        return {
          ok: true,
          payload: {
            number: 10,
            state: "open",
            before: {
              state: "closed",
              labels: ["bug"],
              role: "case",
              kind: null,
              trackingState: null,
              closeReason: null,
            },
          },
        };
      }
      return {
        ok: true,
        payload: {
          number: 10,
          title: "T",
          body: "B",
          state: "open",
          labels: ["bug"],
          role: "case",
          kind: null,
          trackingState: null,
          closeReason: null,
          stateReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_reopen",
      number: 10,
    });
    expect(result.ok).toBe(true);
  });

  test("open 済み追跡Issueへの reopen 再実行は現状維持のまま冪等に成功する", async () => {
    const runner = new FakeRunner(async (request) => {
      if (request.operation === "issue_reopen") {
        return {
          ok: true,
          payload: {
            number: 11,
            state: "open",
            before: {
              state: "open",
              labels: ["agentdev-tracking", "agentdev-kind/idea", "agentdev-tracking-status/in-discussion"],
              role: "tracking",
              kind: "idea",
              trackingState: "in-discussion",
              closeReason: null,
            },
          },
        };
      }
      return {
        ok: true,
        payload: {
          number: 11,
          title: "T",
          body: "B",
          state: "open",
          labels: ["agentdev-tracking", "agentdev-kind/idea", "agentdev-tracking-status/in-discussion"],
          role: "tracking",
          kind: "idea",
          trackingState: "in-discussion",
          closeReason: null,
          stateReason: null,
        },
      };
    });
    const env = buildGhToolEnv(VALID_CONFIG, okProber, runner);
    expect(env.ok).toBe(true);
    if (!env.ok) return;
    const result = await runAgentdevGhOperation(env.env, {
      operation: "issue_reopen",
      number: 11,
    });
    expect(result.ok).toBe(true);
  });
});
