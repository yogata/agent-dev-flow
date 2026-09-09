// ADF-COVERS(implementation): REQ-053-025, REQ-053-026, REQ-053-027, REQ-053-028, REQ-053-029, REQ-053-030, REQ-053-031
// ADF-COVERS(implementation): REQ-052-002, REQ-052-004, REQ-052-006, REQ-052-007
// agentdev-textlint-guard Plugin（pre-write 検査入口）。
//
// OpenCode の tool.execute.before フックで write / edit / apply_patch の完成予定全文を
// メモリ上で再構成し、共通基盤（lib/）で検査する。拒否対象の違反が1件でもあれば
// フックが例外を投げて tool 全体を実行しない（複数ファイル操作は全体拒否）。
// ディスクへ書いてから戻す方式はとらない。
//
// fail-closed（検査不能は拒否）:
//   - プロジェクトルートを解決できない
//   - 設定を解釈できない（対象外ファイルへの操作も含めて拒否）
//   - tool 入力不正・再構成不能・必要ファイルの読込失敗
//   - 検査異常終了（エンジン・規則の実行失敗）
//
// 設定は hook ごとに変更を検知し、修復後の次回操作から再起動なしに反映する。
// 対象外ファイルだけの正常な操作には一般文章検査を適用しない。
// ルート外への参照は安全に分類できないパスとして拒否する。
// 本 Plugin は配布種別 Plugin / Hook（汎用）。Plugin source に ADF repository 判定分岐を
// 持たず、repo-local 除外にも登録しない。

import { formatConfigError, loadGuardConfig, type GuardConfigResult } from "./lib/config.ts";
import { prepareInspection, inspectText, type InspectPrepared } from "./lib/inspect.ts";
import { resolveProjectRoot, toRootRelative } from "./lib/project.ts";
import {
  reconstructApplyPatch,
  reconstructEdit,
  reconstructWrite,
  type ReconstructionResult,
} from "./lib/reconstruct.ts";
import { formatOutcome } from "./lib/results.ts";
import { discoverProjectPrh, formatProjectPrhError } from "./lib/terminology.ts";
import { isTargetPath } from "./lib/targets.ts";

// OpenCode plugin plumbing 型（@opencode-ai/plugin 1.18.x と同じ形状。
// 本 plugin が消費するフィールドのみ宣言する。依存ゼロを保つため直接 import しない）。

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
  readonly worktree?: unknown;
  readonly directory?: unknown;
  readonly project?: unknown;
  readonly [key: string]: unknown;
};

export type PluginServer = (input: PluginInput) => Promise<PluginHooks>;

export const GUARDED_TOOLS: readonly string[] = ["write", "edit", "apply_patch"];

export class GuardBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardBlockError";
  }
}

/** フック実装（テスト可能な分離点）。projectRoot を注入できる。 */
export function makeGuardHooks(projectRoot: string): PluginHooks {
  return {
    "tool.execute.before": async (hookInput, hookOutput) => {
      if (!GUARDED_TOOLS.includes(hookInput.tool)) return;
      const detail = await guardOperation(hookInput.tool, hookOutput.args, projectRoot);
      if (detail !== null) throw new GuardBlockError(detail);
    },
  };
}

/** 1 tool 呼び出しの検査。拒否理由（null なら許可）。 */
export async function guardOperation(
  tool: string,
  args: Record<string, unknown>,
  projectRoot: string,
): Promise<string | null> {
  // 1) 設定とプロジェクト用語辞書の読込み（hook ごと）。解釈不能・読込み不能は
  //    対象外ファイルへの操作も含めて拒否する（fail-closed）。
  const configResult: GuardConfigResult = loadGuardConfig(projectRoot);
  if (!configResult.ok) {
    return formatConfigError(configResult);
  }
  const projectPrh = discoverProjectPrh(projectRoot);
  if (!projectPrh.ok) {
    return formatProjectPrhError(projectPrh);
  }

  // 2) 完成予定全文の再構成
  let reconstruction: ReconstructionResult;
  if (tool === "write") {
    reconstruction = reconstructWrite(args as never);
  } else if (tool === "edit") {
    reconstruction = reconstructEdit(args as never);
  } else {
    reconstruction = reconstructApplyPatch(args as never, projectRoot);
  }
  if (!reconstruction.ok) {
    return `agentdev-textlint-guard: cannot verify ${tool} (${reconstruction.detail}); blocked per fail-closed`;
  }

  // 3) 対象解決（ルート外拒否 + 検査対象抽出）
  const targetWrites: { rel: string; content: string }[] = [];
  for (const planned of reconstruction.writes) {
    for (const effective of effectivePaths(planned)) {
      const rel = toRootRelative(projectRoot, effective.path);
      if (rel === null) {
        return `agentdev-textlint-guard: ${tool} targets a path outside the project root (${effective.path}); blocked per fail-closed`;
      }
      if (effective.kind !== "delete" && isTargetPath(rel, configResult.config)) {
        targetWrites.push({ rel, content: planned.content });
      }
    }
  }
  if (targetWrites.length === 0) return null;

  // 4) 検査（共通基盤）
  let prepared: InspectPrepared;
  try {
    prepared = await prepareInspection(projectRoot);
  } catch (e) {
    return `agentdev-textlint-guard: inspection preparation crashed (${e instanceof Error ? e.message : String(e)}); blocked per fail-closed`;
  }
  if (!prepared.ok) return prepared.detail;
  const fileResults = [];
  for (const target of targetWrites) {
    const result = await inspectText(prepared, projectRoot, target.rel, target.content);
    if (!result.ok) return result.detail;
    fileResults.push(result.result);
  }
  const outcome = { files: fileResults, hardCount: fileResults.reduce((acc, f) => acc + f.hardCount, 0) };
  if (outcome.hardCount > 0) {
    return `agentdev-textlint-guard: ${tool} rejected because the planned content contains ${outcome.hardCount} hard violation(s). Nothing was written to disk.\n${formatOutcome(outcome)}`;
  }
  return null;
}

function effectivePaths(planned: { absolutePath: string; movePath?: string; kind: string }): { path: string; kind: string }[] {
  if (planned.movePath !== undefined) {
    // move は変更先の対象判定と存在する完成予定内容を確認する
    return [{ path: planned.movePath, kind: planned.kind }];
  }
  return [{ path: planned.absolutePath, kind: planned.kind }];
}

const server: PluginServer = async (input) => {
  const resolved = resolveProjectRoot(input);
  if (!resolved.ok) {
    // プロジェクトルートを解決できない場合も fail-closed とする:
    // 実行時に一切の write/edit/apply_patch を許可しないフックを返す。
    return {
      "tool.execute.before": async (hookInput) => {
        if (!GUARDED_TOOLS.includes(hookInput.tool)) return;
        throw new GuardBlockError(
          `agentdev-textlint-guard: ${resolved.reason}; blocked per fail-closed`,
        );
      },
    };
  }
  return makeGuardHooks(resolved.root);
};

export default {
  id: "agentdev-textlint-guard",
  server,
} as const;
