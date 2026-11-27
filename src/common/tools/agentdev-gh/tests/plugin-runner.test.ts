//
// 新ホスト接続境界（createPluginRunner）のテスト。
//
// 偽 mapping と偽 transport で置き換え、実プラグインも実ネットワークも使わない。
// 検証観点: 対応判定の停止（transport 不呼出し）、plan 空配列の停止、
// transport 失敗種別ごとの失敗応答と以後呼出しの抑制、成功経路の
// 応答順解釈と応答の透過、transport 例外の拒否伝播。

import { describe, expect, test } from "bun:test";
import {
  createPluginRunner,
  type PluginCall,
  type PluginMapping,
  type PluginTransport,
  type PluginTransportReply,
} from "../plugin-runner.ts";
import type { GhRunnerReply, GhRunnerRequest } from "../runner.ts";

const REQUEST: GhRunnerRequest = { operation: "issue_read", args: {} };

interface FakeMapping extends PluginMapping {
  readonly planRequests: readonly GhRunnerRequest[];
  readonly interpretInputs: ReadonlyArray<{
    readonly request: GhRunnerRequest;
    readonly payloads: readonly unknown[];
  }>;
}

function fakeMapping(options: {
  supports?: (operation: string) => boolean;
  plan?: (request: GhRunnerRequest) => readonly PluginCall[];
  interpret?: (request: GhRunnerRequest, payloads: readonly unknown[]) => GhRunnerReply;
} = {}): FakeMapping {
  const planRequests: GhRunnerRequest[] = [];
  const interpretInputs: Array<{
    request: GhRunnerRequest;
    payloads: readonly unknown[];
  }> = [];
  return {
    planRequests,
    interpretInputs,
    supports: options.supports ?? (() => true),
    plan: (request) => {
      if (options.plan) return options.plan(request);
      planRequests.push(request);
      return [{ tool: "get_issue", args: { number: 1 } }];
    },
    interpret: (request, payloads) => {
      if (options.interpret) return options.interpret(request, payloads);
      interpretInputs.push({ request, payloads });
      return { ok: true, payload: { payloads } };
    },
  };
}

interface FakeTransport extends PluginTransport {
  readonly calls: ReadonlyArray<PluginCall>;
}

function fakeTransport(
  handler: (call: PluginCall) => PluginTransportReply,
): FakeTransport {
  const calls: PluginCall[] = [];
  return {
    calls,
    invoke: (call) => {
      calls.push(call);
      return Promise.resolve(handler(call));
    },
  };
}

function okTransport(): FakeTransport {
  return fakeTransport((call) => ({ ok: true, payload: { tool: call.tool } }));
}

describe("createPluginRunner の停止境界", () => {
  test("対応しない操作は失敗応答を返し transport を呼ばない", async () => {
    const mapping = fakeMapping({ supports: (operation) => operation !== "issue_read" });
    const transport = okTransport();
    const runner = createPluginRunner(mapping, transport);
    const reply = await runner.run(REQUEST);
    expect(reply.ok).toBe(false);
    if (!reply.ok) {
      expect(reply.failureClass).toBe("operation-failed");
      expect(reply.exitCode).toBeNull();
      expect(reply.error).toContain("issue_read");
    }
    expect(transport.calls).toHaveLength(0);
    expect(mapping.interpretInputs).toHaveLength(0);
  });

  test("plan が空配列のときは transport を呼ばず同じ停止に収斂する", async () => {
    const mapping = fakeMapping({ plan: () => [] });
    const transport = okTransport();
    const runner = createPluginRunner(mapping, transport);
    const reply = await runner.run(REQUEST);
    expect(reply.ok).toBe(false);
    if (!reply.ok) {
      expect(reply.failureClass).toBe("operation-failed");
      expect(reply.error).toContain("issue_read");
    }
    expect(transport.calls).toHaveLength(0);
  });
});

describe("createPluginRunner の transport 失敗", () => {
  for (const kind of ["plugin-unavailable", "operation-unsupported", "operation-failed"] as const) {
    test(`${kind}: transport のエラー文言を運び、以後の呼出しを行わない`, async () => {
      const mapping = fakeMapping({
        plan: () => [
          { tool: "get_issue", args: { number: 1 } },
          { tool: "get_issue_comments", args: { number: 1 } },
        ],
      });
      const transport = fakeTransport((call) => {
        if (call.tool === "get_issue") {
          return { ok: false, kind, error: `boom: ${kind}` };
        }
        return { ok: true, payload: null };
      });
      const runner = createPluginRunner(mapping, transport);
      const reply = await runner.run(REQUEST);
      expect(reply.ok).toBe(false);
      if (!reply.ok) {
        expect(reply.failureClass).toBe("operation-failed");
        expect(reply.error).toBe(`boom: ${kind}`);
      }
      // 最初の呼出しが失敗したため、2件目は発行されない。
      expect(transport.calls).toHaveLength(1);
      expect(mapping.interpretInputs).toHaveLength(0);
    });
  }
});

describe("createPluginRunner の成功経路", () => {
  test("payload を実行順に interpret へ渡し、応答をそのまま返す", async () => {
    const expectedReply: GhRunnerReply = { ok: true, payload: { number: 1 } };
    const interpretPayloads: Array<readonly unknown[]> = [];
    const mapping = fakeMapping({
      plan: () => [
        { tool: "get_issue", args: { number: 1 } },
        { tool: "get_issue_comments", args: { number: 1 } },
      ],
      interpret: (_request, payloads) => {
        interpretPayloads.push(payloads);
        return expectedReply;
      },
    });
    const transport = okTransport();
    const runner = createPluginRunner(mapping, transport);
    const reply = await runner.run(REQUEST);
    expect(reply).toBe(expectedReply);
    expect(interpretPayloads).toEqual([
      [{ tool: "get_issue" }, { tool: "get_issue_comments" }],
    ]);
    expect(mapping.interpretInputs).toHaveLength(0);
  });

  test("transport が投げた例外は run の拒否として伝播する", async () => {
    const mapping = fakeMapping();
    const transport = fakeTransport(() => {
      throw new Error("transport crashed");
    });
    const runner = createPluginRunner(mapping, transport);
    await expect(runner.run(REQUEST)).rejects.toThrow("transport crashed");
  });
});
