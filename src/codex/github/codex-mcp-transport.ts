// Codex ホストの GitHub プラグイン（GitHub hosted MCP server）への呼出し手段。
//
// Codex の GitHub プラグインは .mcp.json で GitHub の hosted MCP server を宣言し、
// トークンを GITHUB_PAT_TOKEN 環境変数から受ける。本 transport はその宣言と同じ
// 接続（サーバー URL とトークン）で MCP の streamable HTTP（JSON-RPC の HTTP POST）
// を話し、tools/call でプラグインの tool を呼ぶ。トークンが無い・接続できない・
// 認証が通らない場合は plugin-unavailable として失敗し、暗黙に gh CLI へ
// 切り替えない。tools/call の実行中に接続が切れた場合は結果が不明なため
// 再実行せず operation-failed を返す。

import type {
  PluginCall,
  PluginTransport,
  PluginTransportFailure,
  PluginTransportReply,
} from "../../common/tools/agentdev-gh/plugin-runner.ts";

/** プラグインが宣言する hosted MCP server の URL。 */
export const CODEX_GITHUB_MCP_SERVER_URL = "https://api.githubcopilot.com/mcp/";

/** トークンを宣言している環境変数（プラグインの .mcp.json と同じ名前）。 */
export const CODEX_GITHUB_MCP_TOKEN_ENV = "GITHUB_PAT_TOKEN";

const MCP_PROTOCOL_VERSION = "2025-06-18";
const MCP_METHOD_NOT_FOUND = -32601;

/** MCP の JSON-RPC 応答メッセージ。 */
interface JsonRpcMessage {
  readonly result?: unknown;
  readonly error?: { readonly code: number; readonly message: string };
}

/** MCP POST の応答（HTTP 層の詳細は隠蔽し、テストは post を差し替える）。 */
export interface McpHttpPostResult {
  readonly status: number;
  readonly contentType: string;
  readonly text: string;
  readonly sessionId: string | null;
}

export type McpHttpPost = (
  url: string,
  headers: Record<string, string>,
  body: string,
) => Promise<McpHttpPostResult>;

async function defaultPost(
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<McpHttpPostResult> {
  const res = await fetch(url, { method: "POST", headers, body });
  return {
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    text: await res.text(),
    sessionId: res.headers.get("mcp-session-id"),
  };
}

function tryParseJsonRpc(text: string): JsonRpcMessage | null {
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as JsonRpcMessage;
  } catch {
    return null;
  }
}

/** text/event-stream 応答の data 行（JSON-RPC メッセージの候補）を集める。 */
function sseDataLines(text: string): string[] {
  const lines: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      const data = line.slice(5).trim();
      if (data.length > 0 && data !== "[DONE]") lines.push(data);
    }
  }
  return lines;
}

/** JSON 応答と SSE 枠絡み応答のどちらでも JSON-RPC メッセージを取り出す。 */
function parseJsonRpcMessage(reply: McpHttpPostResult): JsonRpcMessage | null {
  const candidates = reply.contentType.includes("text/event-stream")
    ? sseDataLines(reply.text)
    : [reply.text.trim()];
  for (const candidate of candidates) {
    const message = tryParseJsonRpc(candidate);
    if (message !== null) return message;
  }
  return null;
}

/** MCP tool の結果（content ブロック配列）から最初の text ブロックを取り出す。 */
function textContentOf(result: unknown): string | null {
  if (typeof result !== "object" || result === null) return null;
  const content = (result as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  for (const block of content) {
    if (
      typeof block === "object" && block !== null &&
      (block as { type?: unknown }).type === "text" &&
      typeof (block as { text?: unknown }).text === "string"
    ) {
      return (block as { text: string }).text;
    }
  }
  return null;
}

export interface CodexMcpTransportOptions {
  /** プラグインの接続トークン。null（未設定）は plugin-unavailable として停止する。 */
  readonly token: string | null;
  /** プラグインが宣言するサーバー URL（既定は CODEX_GITHUB_MCP_SERVER_URL）。 */
  readonly serverUrl?: string;
  /** MCP POST の差し替え（既定は fetch）。 */
  readonly post?: McpHttpPost;
}

function unavailable(error: string): PluginTransportReply {
  return { ok: false, kind: "plugin-unavailable", error };
}

function failed(error: string): PluginTransportReply {
  return { ok: false, kind: "operation-failed", error };
}

function unsupported(error: string): PluginTransportReply {
  return { ok: false, kind: "operation-unsupported", error };
}

/** プラグインの tool が未知・未提供か（operation-unsupported 判定）。 */
function isToolFaceError(message: JsonRpcMessage & { error?: { code: number; message: string } }): boolean {
  const error = message.error;
  if (error === undefined) return false;
  if (error.code === MCP_METHOD_NOT_FOUND) return true;
  return /unknown tool|tool not found|unsupported tool|no such tool/i.test(error.message);
}

/** Codex の GitHub プラグインへの transport。毎呼出しで初期化ハンドシェイクを完結させる。 */
export function createCodexMcpTransport(options: CodexMcpTransportOptions): PluginTransport {
  const serverUrl = options.serverUrl ?? CODEX_GITHUB_MCP_SERVER_URL;
  const post = options.post ?? defaultPost;
  const baseHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "Authorization": `Bearer ${options.token ?? ""}`,
  });
  return {
    async invoke(call: PluginCall): Promise<PluginTransportReply> {
      if (options.token === null || options.token.length === 0) {
        return unavailable(
          `${CODEX_GITHUB_MCP_TOKEN_ENV} is not set; the Codex GitHub plugin is unavailable`,
        );
      }
      let initReply: McpHttpPostResult;
      try {
        initReply = await post(serverUrl, baseHeaders(), JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: { name: "agentdev-gh-adapter", version: "1.0.0" },
          },
        }));
      } catch (e) {
        return unavailable(
          `cannot reach the Codex GitHub plugin server: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
      if (initReply.status === 401 || initReply.status === 403) {
        return unavailable(`the Codex GitHub plugin server rejected the token (HTTP ${initReply.status})`);
      }
      if (initReply.status < 200 || initReply.status >= 300) {
        return unavailable(`the Codex GitHub plugin server is unavailable (HTTP ${initReply.status})`);
      }
      const initMessage = parseJsonRpcMessage(initReply);
      if (initMessage === null || initMessage.error !== undefined) {
        return unavailable("the Codex GitHub plugin server did not complete the MCP initialize handshake");
      }
      const sessionHeaders = initReply.sessionId !== null
        ? { ...baseHeaders(), "Mcp-Session-Id": initReply.sessionId }
        : baseHeaders();
      try {
        await post(serverUrl, sessionHeaders, JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
        }));
      } catch (e) {
        return unavailable(
          `the connection to the Codex GitHub plugin server dropped before the tool call: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
      let callReply: McpHttpPostResult;
      try {
        callReply = await post(serverUrl, sessionHeaders, JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: call.tool, arguments: call.args },
        }));
      } catch (e) {
        return failed(
          `the plugin call crashed after dispatch; the result is unknown and is not retried: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
      if (callReply.status === 401 || callReply.status === 403) {
        return unavailable(`the Codex GitHub plugin server rejected the token (HTTP ${callReply.status})`);
      }
      const message = parseJsonRpcMessage(callReply);
      if (message === null) {
        return failed(`the plugin reply is not a JSON-RPC message (HTTP ${callReply.status})`);
      }
      if (message.error !== undefined) {
        const detail = `tools/call ${call.tool} failed (${message.error.code}): ${message.error.message}`;
        return isToolFaceError(message) ? unsupported(detail) : failed(detail);
      }
      const result = message.result;
      if (typeof result !== "object" || result === null) {
        return failed(`tools/call ${call.tool} replied without a result object`);
      }
      if ((result as { isError?: unknown }).isError === true) {
        const text = textContentOf(result);
        return failed(`tools/call ${call.tool} replied with an error result: ${text ?? "(no text content)"}`);
      }
      const text = textContentOf(result);
      if (text === null) {
        return failed(`tools/call ${call.tool} replied without text content`);
      }
      try {
        return { ok: true, payload: JSON.parse(text) as unknown };
      } catch {
        return failed(`tools/call ${call.tool} text content is not JSON`);
      }
    },
  };
}

export type { PluginTransportFailure };
