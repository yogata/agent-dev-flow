//
// Antigravity ホストの GitHub プラグイン対応付けの契約試験。
//
// 能力表が操作カタログの全操作を過不足なく持ち、全操作が未確認
//（supported: false）であること、未確認操作の plan が空配列で例外を投げない
// こと、interpret が不正な応答に対しても失敗 reply を返すこと、共通境界
//（createPluginRunner）が輸送を呼ばずに失敗で停止することを検証する。
//

import { describe, expect, test } from "bun:test";
import {
  GH_TOOL_OPERATIONS,
  type GhToolOperation,
} from "../../common/tools/agentdev-gh/contracts.ts";
import { createPluginRunner } from "../../common/tools/agentdev-gh/plugin-runner.ts";
import type { GhRunnerRequest } from "../../common/tools/agentdev-gh/runner.ts";
import {
  ANTIGRAVITY_PLUGIN_CAPABILITIES,
  createAntigravityPluginMapping,
} from "../github/antigravity-plugin-mapping.ts";

const REPO = "octo/hello";

/** 操作ごとの代表要求（plan / interpret が任意の引数でも例外を投げないことの検証に使う）。 */
function sampleRequest(operation: GhToolOperation): GhRunnerRequest {
  switch (operation) {
    case "release_create":
      return {
        operation,
        args: { tagName: "v1.0.0", title: "t", body: "b", prerelease: false },
      };
    case "release_read":
    case "release_publish":
      return {
        operation,
        args: { tagName: "v1.0.0", approvalBasis: "approval" },
      };
    case "comment_update":
    case "comment_delete":
      return { operation, args: { commentId: "1", body: "b" } };
    case "issue_create":
    case "pr_create":
      return {
        operation,
        args: {
          title: "t",
          body: "b",
          labels: [],
          base: "main",
          head: "topic",
        },
      };
    case "issue_list":
    case "release_list":
      return { operation, args: {} };
    default:
      return {
        operation,
        args: { number: 1, body: "b", method: "merge", reason: "completed" },
      };
  }
}

describe("Antigravity GitHub プラグイン対応付け", () => {
  const mapping = createAntigravityPluginMapping({ repo: REPO });

  test("能力表は操作カタログの20操作を過不足なく持つ", () => {
    const tableKeys = Object.keys(ANTIGRAVITY_PLUGIN_CAPABILITIES);
    expect(tableKeys.length).toBe(GH_TOOL_OPERATIONS.length);
    expect([...tableKeys].sort()).toEqual([...GH_TOOL_OPERATIONS].sort());
  });

  test("全操作が未確認であり、supports は能力表を唯一の参照元とする", () => {
    for (const operation of GH_TOOL_OPERATIONS) {
      const capability = ANTIGRAVITY_PLUGIN_CAPABILITIES[operation];
      expect(capability.supported).toBe(false);
      expect(capability.evidence).toBe("unconfirmed");
      expect(mapping.supports(operation)).toBe(
        capability.supported,
      );
    }
  });

  test("未確認操作の plan は空配列を返し例外を投げない", () => {
    for (const operation of GH_TOOL_OPERATIONS) {
      const calls = mapping.plan(sampleRequest(operation));
      expect(calls).toEqual([]);
    }
  });

  test("能力が確認された行は呼び出し計画を必ず持つ（表の更新だけで成立する）", () => {
    for (const operation of GH_TOOL_OPERATIONS) {
      if (!ANTIGRAVITY_PLUGIN_CAPABILITIES[operation].supported) continue;
      const calls = mapping.plan(sampleRequest(operation));
      expect(calls.length > 0).toBe(true);
    }
  });

  test("interpret は不正な応答に対しても失敗 reply を返し例外を投げない", () => {
    const malformedPayloads: readonly unknown[][] = [
      [],
      [null],
      [undefined],
      ["text"],
      [42],
      [{ unexpected: { nested: [1, 2, null] } }],
    ];
    for (const operation of GH_TOOL_OPERATIONS) {
      for (const payloads of malformedPayloads) {
        const reply = mapping.interpret(
          sampleRequest(operation),
          payloads,
        );
        expect(reply.ok).toBe(false);
        if (!reply.ok) {
          expect(reply.exitCode).toBeNull();
          expect(reply.failureClass).toBe("operation-failed");
          expect(reply.error.length > 0).toBe(true);
          expect(reply.error.includes(operation)).toBe(true);
        }
      }
    }
  });

  test("共通境界は輸送を呼ばずに全操作で失敗停止する", async () => {
    let invoked = 0;
    const transport = {
      invoke: async () => {
        invoked += 1;
        return {
          ok: false as const,
          kind: "plugin-unavailable" as const,
          error: "transport must not be invoked while capabilities are unconfirmed",
        };
      },
    };
    const runner = createPluginRunner(mapping, transport);
    for (const operation of GH_TOOL_OPERATIONS) {
      const reply = await runner.run(sampleRequest(operation));
      expect(reply.ok).toBe(false);
      if (!reply.ok) {
        expect(reply.failureClass).toBe("operation-failed");
        expect(reply.exitCode).toBeNull();
        expect(reply.error.length > 0).toBe(true);
      }
    }
    expect(invoked).toBe(0);
  });
});
