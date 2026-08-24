// agentdev-gh-write-guard Plugin（決定5、多層 enforcement の適用対象拡張）。
//
// OpenCode の tool.execute.before フックでコマンド実行系ツール（既定: bash）の
// コマンド文字列を検査し、Custom Tool（agentdev-gh 等）の正規経路を迂回する
// 生 gh WRITE を実行前に拒否する。モデルの遵守判断に委ねない機械的な拒否である。
//
// fail-closed:
//   - 設定を解釈できない: 検査対象ツールは安全性を確認できないため block
//   - 強制処理自体が異常終了した: 検出器の例外は throw に変換し block
//   - 必須検証が完了できない: 検査対象ツールでコマンド引数が検証不能なら block
//
// 検出ルール（読み取り系の許容等を含む禁止範囲）は Design
// custom-tool-contracts.md「迂回防止」が所有する。


import {
  detectGhWriteCommand,
  formatBlockReason,
  type GhWriteVerdict,
} from "./lib/gh-command-detector.ts";
import {
  interpretGuardConfigFromEnv,
  type GuardConfig,
  type GuardConfigResult,
} from "./lib/guard-config.ts";

// OpenCode plugin plumbing types（@opencode-ai/plugin 1.3.x と同じ形状。
// 本 plugin が消費するフィールドのみ宣言する）。

export type ToolExecuteBeforeInput = {
  readonly tool: string;
  readonly sessionID: string;
  readonly callID: string;
};

export type ToolExecuteBeforeOutput = {
  readonly args: Record<string, unknown>;
};

export type PluginHooks = {
  "tool.execute.before"?(
    input: ToolExecuteBeforeInput,
    output: ToolExecuteBeforeOutput,
  ): Promise<void>;
};

export type PluginInput = {
  readonly worktree: string;
  readonly directory: string;
  readonly project: { readonly worktree: string };
  readonly [key: string]: unknown;
};

export type PluginServer = (input: PluginInput) => Promise<PluginHooks>;

export type DetectFn = (command: string) => GhWriteVerdict;

export class GuardBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardBlockError";
  }
}

function extractCommand(tool: string, args: Record<string, unknown>): string {
  const command = args.command;
  if (typeof command !== "string" || command.length === 0) {
    throw new GuardBlockError(
      `agentdev-gh-write-guard: cannot verify ${tool} invocation (command argument is missing or not a string); blocked per fail-closed`,
    );
  }
  return command;
}

/**
 * フック実装（テスト可能な分離点）。detect と configResult を注入できる。
 * 設定解釈に失敗している場合、検査対象と判定できる既定ツール（bash）を
 * 安全性確認不能として block する。
 */
export function makeGuardHooks(
  detect: DetectFn,
  configResult: GuardConfigResult,
): PluginHooks {
  const enforcedTools: readonly string[] = configResult.ok
    ? configResult.config.enforcedTools
    : ["bash"];
  return {
    "tool.execute.before": async (hookInput, hookOutput) => {
      const isEnforced =
        enforcedTools.includes(hookInput.tool) ||
        (!configResult.ok && hookInput.tool === "bash");
      if (!isEnforced) return;
      if (!configResult.ok) {
        throw new GuardBlockError(
          `agentdev-gh-write-guard: guard config is uninterpretable (${configResult.detail}); blocked ${hookInput.tool} per fail-closed`,
        );
      }
      const command = extractCommand(hookInput.tool, hookOutput.args);
      let verdict: GhWriteVerdict;
      try {
        verdict = detect(command);
      } catch (e) {
        throw new GuardBlockError(
          `agentdev-gh-write-guard: detection crashed (${e instanceof Error ? e.message : String(e)}); blocked ${hookInput.tool} per fail-closed`,
        );
      }
      if (verdict.kind === "block") {
        throw new GuardBlockError(formatBlockReason(verdict));
      }
    },
  };
}

/** 既定の検出関数。 */
export const defaultDetect: DetectFn = detectGhWriteCommand;

const server: PluginServer = async (_input) => {
  const configResult = interpretGuardConfigFromEnv(process.env);
  return makeGuardHooks(defaultDetect, configResult);
};

export default {
  id: "agentdev-gh-write-guard",
  server,
} as const;

export type { GuardConfig };
