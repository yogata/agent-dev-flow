//
// Codex GitHub プラグイン transport（createCodexMcpTransport）のテスト。
//
// MCP streamable HTTP の呼出しを偽 post で検証する（実ネットワークなし）。
// 検証観点: トークン未設定の停止、初期化ハンドシェイクの失敗分類
// （認証拒否・接続不能・事前切断）、tools/call の結果取り出し
// （JSON・SSE 枠・text 以外）、失敗分類（tool 面未提供・実行失敗・結果不明）。
//

import { describe, expect, test } from "bun:test";
import {
  CODEX_GITHUB_MCP_TOKEN_ENV,
  createCodexMcpTransport,
  type McpHttpPost,
  type McpHttpPostResult,
} from "../github/codex-mcp-transport.ts";
import type { PluginCall, PluginTransportReply } from "../../common/tools/agentdev-gh/plugin-runner.ts";

const SERVER = "https://example.test/mcp/";
const CALL: PluginCall = { tool: "issue_read", args: { owner: "o", repo: "r", method: "get", issue_number: 1 } };

function jsonReply(status: number, body: unknown, sessionId: string | null = null): McpHttpPostResult {
  return { status, contentType: "application/json", text: JSON.stringify(body), sessionId };
}

function sseReply(status: number, body: unknown): McpHttpPostResult {
  return { status, contentType: "text/event-stream", text: `event: message\ndata: ${JSON.stringify(body)}\n\n`, sessionId: null };
}

function initOk(sessionId: string | null = null): McpHttpPostResult {
  return jsonReply(200, { jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: {} } }, sessionId);
}

interface PostLog {
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body: string;
}

/** 偽 post: 初期化は成功し、tools/call の応答を差し替えられる。 */
function postWithCallReply(
  callReply: () => McpHttpPostResult | Promise<McpHttpPostResult>,
  log: PostLog[] = [],
  sessionId: string | null = null,
): McpHttpPost {
  return async (url, headers, body) => {
    log.push({ url, headers, body });
    const method = (JSON.parse(body) as { method: string }).method;
    if (method === "initialize") return initOk(sessionId);
    if (method === "notifications/initialized") return { status: 202, contentType: "application/json", text: "", sessionId: null };
    return callReply();
  };
}

async function invokeWith(
  callReply: () => McpHttpPostResult | Promise<McpHttpPostResult>,
  log: PostLog[] = [],
  sessionId: string | null = null,
): Promise<PluginTransportReply> {
  const transport = createCodexMcpTransport({ token: "secret-token", serverUrl: SERVER, post: postWithCallReply(callReply, log, sessionId) });
  return transport.invoke(CALL);
}

function expectUnavailable(reply: PluginTransportReply, part: string): void {
  expect(reply.ok).toBe(false);
  if (!reply.ok) {
    expect(reply.kind).toBe("plugin-unavailable");
    expect(reply.error).toContain(part);
  }
}

function expectFailed(reply: PluginTransportReply, part: string): void {
  expect(reply.ok).toBe(false);
  if (!reply.ok) {
    expect(reply.kind).toBe("operation-failed");
    expect(reply.error).toContain(part);
  }
}

describe("codex-mcp-transport の停止系", () => {
  test("トークン未設定は plugin-unavailable（post を呼ばない）", async () => {
    const log: PostLog[] = [];
    const transport = createCodexMcpTransport({ token: null, serverUrl: SERVER, post: postWithCallReply(() => jsonReply(200, {}), log) });
    const reply = await transport.invoke(CALL);
    expectUnavailable(reply, `${CODEX_GITHUB_MCP_TOKEN_ENV} is not set`);
    expect(log).toHaveLength(0);
  });

  test("初期化の認証拒否（401）は plugin-unavailable", async () => {
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async () => jsonReply(401, { error: { code: -32001, message: "unauthorized" } }),
    });
    expectUnavailable(await transport.invoke(CALL), "rejected the token (HTTP 401)");
  });

  test("初期化の接続失敗（throw）は plugin-unavailable", async () => {
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async () => { throw new Error("ECONNREFUSED"); },
    });
    expectUnavailable(await transport.invoke(CALL), "cannot reach");
  });

  test("初期化の非 2xx は plugin-unavailable", async () => {
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async () => jsonReply(503, {}),
    });
    expectUnavailable(await transport.invoke(CALL), "HTTP 503");
  });

  test("初期化ハンドシェイク後の事前切断（通知の throw）は plugin-unavailable", async () => {
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async (_url, _headers, body) => {
        const method = (JSON.parse(body) as { method: string }).method;
        if (method === "initialize") return initOk();
        if (method === "notifications/initialized") throw new Error("socket hang up");
        return jsonReply(200, {});
      },
    });
    expectUnavailable(await transport.invoke(CALL), "dropped before the tool call");
  });
});
describe("codex-mcp-transport の tools/call", () => {
  test("結果の text ブロックから JSON payload を取り出し、tools/call の引数とヘッダを送る", async () => {
    const log: PostLog[] = [];
    const reply = await invokeWith(
      () => jsonReply(200, {
        jsonrpc: "2.0",
        id: 2,
        result: { content: [{ type: "text", text: JSON.stringify({ number: 7, title: "t" }) }] },
      }),
      log,
    );
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ number: 7, title: "t" });
    }
    const callPost = log.find((p) => (JSON.parse(p.body) as { method: string }).method === "tools/call");
    expect(callPost).toBeDefined();
    expect((JSON.parse(callPost?.body ?? "{}") as { params: { name: string; arguments: unknown } }).params).toEqual({
      name: "issue_read",
      arguments: CALL.args,
    });
    expect(callPost?.headers.Authorization).toBe("Bearer secret-token");
    expect(callPost?.headers.Accept).toContain("text/event-stream");
    expect(callPost?.url).toBe(SERVER);
  });

  test("セッション id があれば以後の POST へ伝える", async () => {
    const log: PostLog[] = [];
    const reply = await invokeWith(
      () => jsonReply(200, { jsonrpc: "2.0", id: 2, result: { content: [{ type: "text", text: "{}" }] } }),
      log,
      "session-abc",
    );
    expect(reply.ok).toBe(true);
    const callPost = log.find((p) => (JSON.parse(p.body) as { method: string }).method === "tools/call");
    expect(callPost?.headers["Mcp-Session-Id"]).toBe("session-abc");
    const notificationPost = log.find((p) => (JSON.parse(p.body) as { method: string }).method === "notifications/initialized");
    expect(notificationPost?.headers["Mcp-Session-Id"]).toBe("session-abc");
  });

  test("SSE 枠の応答でも JSON-RPC メッセージを取り出す", async () => {
    const reply = await invokeWith(() => sseReply(200, {
      jsonrpc: "2.0",
      id: 2,
      result: { content: [{ type: "text", text: JSON.stringify({ items: [] }) }] },
    }));
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect(reply.payload).toEqual({ items: [] });
    }
  });

  test("tool 面に無い tool 名（Unknown tool）は operation-unsupported", async () => {
    const reply = await invokeWith(() => jsonReply(200, {
      jsonrpc: "2.0",
      id: 2,
      error: { code: -32602, message: "Unknown tool: delete_issue_comment" },
    }));
    expect(reply.ok).toBe(false);
    if (!reply.ok) {
      expect(reply.kind).toBe("operation-unsupported");
      expect(reply.error).toContain("delete_issue_comment");
    }
  });

  test("tool の実行エラー（isError）は operation-failed に本文を運ぶ", async () => {
    const reply = await invokeWith(() => jsonReply(200, {
      jsonrpc: "2.0",
      id: 2,
      result: { isError: true, content: [{ type: "text", text: "issue not found" }] },
    }));
    expectFailed(reply, "issue not found");
  });

  test("tools/call の JSON-RPC error（tool 面以外）は operation-failed", async () => {
    const reply = await invokeWith(() => jsonReply(200, {
      jsonrpc: "2.0",
      id: 2,
      error: { code: -32000, message: "rate limited" },
    }));
    expectFailed(reply, "rate limited");
  });

  test("実行中の接続切断は結果不明として operation-failed（再実行しない）", async () => {
    const log: PostLog[] = [];
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async (_url, _headers, body) => {
        log.push({ url: _url, headers: _headers, body });
        const method = (JSON.parse(body) as { method: string }).method;
        if (method === "initialize") return initOk();
        if (method === "notifications/initialized") return { status: 202, contentType: "application/json", text: "", sessionId: null };
        throw new Error("connection reset");
      },
    });
    const reply = await transport.invoke(CALL);
    expectFailed(reply, "result is unknown");
    expect(log).toHaveLength(3);
  });

  test("プラグイン復旧後の再開: 最初の呼出しが利用不能でも次の呼出しから成功する", async () => {
    let invokeCount = 0;
    const transport = createCodexMcpTransport({
      token: "secret-token",
      serverUrl: SERVER,
      post: async (_url, _headers, body) => {
        const method = (JSON.parse(body) as { method: string }).method;
        if (method === "notifications/initialized") {
          return { status: 202, contentType: "application/json", text: "", sessionId: null };
        }
        if (method === "tools/call") {
          return jsonReply(200, {
            jsonrpc: "2.0",
            id: 2,
            result: { content: [{ type: "text", text: JSON.stringify({ number: 7 }) }] },
          });
        }
        invokeCount += 1;
        if (invokeCount === 1) return jsonReply(503, {});
        return initOk();
      },
    });
    const first = await transport.invoke(CALL);
    expectUnavailable(first, "HTTP 503");
    const second = await transport.invoke(CALL);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.payload).toEqual({ number: 7 });
    }
  });

  test("text ブロックが JSON でない場合は operation-failed", async () => {
    const reply = await invokeWith(() => jsonReply(200, {
      jsonrpc: "2.0",
      id: 2,
      result: { content: [{ type: "text", text: "not json" }] },
    }));
    expectFailed(reply, "text content is not JSON");
  });

  test("text ブロックが無い場合は operation-failed", async () => {
    const reply = await invokeWith(() => jsonReply(200, {
      jsonrpc: "2.0",
      id: 2,
      result: { content: [{ type: "image", data: "..." }] },
    }));
    expectFailed(reply, "without text content");
  });
});
