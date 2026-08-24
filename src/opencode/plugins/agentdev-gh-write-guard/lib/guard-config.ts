// ガード設定の解釈（fail-closed）。
//
// 設定を解釈できない場合、検査対象ツールの安全性を確認できないため
// 対象副作用（コマンド実行）を block する。設定が存在しない場合は
// 既定設定（bash のみ検査）を採用し、失敗扱いとしない。


export interface GuardConfig {
  /** 検査対象のコマンド実行系ツール名。既定は bash のみ。 */
  readonly enforcedTools: readonly string[];
}

export type GuardConfigResult =
  | { readonly ok: true; readonly config: GuardConfig }
  | { readonly ok: false; readonly detail: string };

const DEFAULT_ENFORCED_TOOLS: readonly string[] = ["bash"];

/** 設定環境変数名（存在しない場合は既定設定）。 */
export const GUARD_CONFIG_ENV = "AGENTDEV_GH_WRITE_GUARD_CONFIG";

function isValidToolName(v: unknown): v is string {
  return typeof v === "string" && /^[a-z][a-z0-9_-]*$/.test(v);
}

/** 生設定値の解釈。スキーマ違反は失敗（fail-closed）。 */
export function interpretGuardConfig(raw: unknown): GuardConfigResult {
  if (raw === undefined || raw === null) {
    return { ok: true, config: { enforcedTools: DEFAULT_ENFORCED_TOOLS } };
  }
  let decoded: unknown = raw;
  if (typeof decoded === "string") {
    try {
      decoded = JSON.parse(decoded);
    } catch (e) {
      return { ok: false, detail: `config is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
  }
  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded)) {
    return { ok: false, detail: "config must be an object when present" };
  }
  const obj = decoded as Record<string, unknown>;
  if (obj.enforcedTools === undefined) {
    return { ok: true, config: { enforcedTools: DEFAULT_ENFORCED_TOOLS } };
  }
  if (!Array.isArray(obj.enforcedTools) || obj.enforcedTools.length === 0) {
    return { ok: false, detail: "config.enforcedTools must be a non-empty array when present" };
  }
  if (!obj.enforcedTools.every(isValidToolName)) {
    return { ok: false, detail: "config.enforcedTools entries must be tool names" };
  }
  return { ok: true, config: { enforcedTools: obj.enforcedTools } };
}

/** 環境変数から設定を読み込む。変数がなければ既定設定。 */
export function interpretGuardConfigFromEnv(
  env: Record<string, string | undefined>,
): GuardConfigResult {
  const raw = env[GUARD_CONFIG_ENV];
  if (raw === undefined) {
    return { ok: true, config: { enforcedTools: DEFAULT_ENFORCED_TOOLS } };
  }
  return interpretGuardConfig(raw);
}
