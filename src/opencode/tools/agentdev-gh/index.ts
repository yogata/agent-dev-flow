// agentdev-gh Custom Tool の公開入口・登録構造（決定4）。
//
// 登録構造は操作カタログ（contracts.ts）、fail-closed 実行ゲート（engine.ts）、
// 操作スペック（specs-issue.ts / specs-pr.ts）を単一の Tool 定義へ接続する。
// ツール名・公開単位の詳細は Design `custom-tool-contracts.md` の所有事項である。
//
// gh CLI への具体的な実装（GhRunner 実装、harness への tool 登録配線）は
// GitHub I/O 移管の後続 Issue が本構造を再利用して接続する。


import {
  GH_TOOL_OPERATION_CATALOG,
  GH_TOOL_OPERATIONS,
  type GhToolResult,
} from "./contracts.ts";
import type { GhToolEnv, OperationSpec } from "./engine.ts";
import { executeOperation } from "./engine.ts";
import { ISSUE_OPERATION_SPECS } from "./specs-issue.ts";
import { PR_OPERATION_SPECS } from "./specs-pr.ts";

/** Tool の公開名。命名は Design の所有事項（仮確定、Design確定候補参照）。 */
export const AGENTDEV_GH_TOOL_NAME = "agentdev_gh";

/** Tool の説明（利用者への公開契約の要約）。 */
export const AGENTDEV_GH_TOOL_DESCRIPTION =
  "Structured GitHub issue/PR operations with a verified operation contract. " +
  "Each side-effect operation is read back and verified before success is returned.";

/** 操作ごとの入力説明（JSON Schema の description 相当の公開メタデータ）。 */
export interface OperationPublicContract {
  readonly operation: string;
  readonly sideEffect: boolean;
  readonly fallbacks: readonly string[];
  readonly canContinue: boolean;
}

/** 公開操作契約の一覧（モデル・利用者向けの契約公開。継続契約を含む）。 */
export const AGENTDEV_GH_PUBLIC_CONTRACTS: readonly OperationPublicContract[] =
  GH_TOOL_OPERATION_CATALOG.map((entry) => ({
    operation: entry.operation,
    sideEffect: entry.kind === "side-effect",
    fallbacks: entry.contingency.fallbacks,
    canContinue: entry.contingency.canContinue,
  }));

/** 全操作スペック（登録順はカタログ順に従う）。 */
export const AGENTDEV_GH_OPERATION_SPECS: readonly OperationSpec[] = [
  ...ISSUE_OPERATION_SPECS,
  ...PR_OPERATION_SPECS,
];

const SPECS_BY_OPERATION: ReadonlyMap<string, OperationSpec> = new Map(
  AGENTDEV_GH_OPERATION_SPECS.map((s) => [s.operation, s]),
);

/** 操作を1件実行する。戻り値の型が成功/失敗を強制する（GhToolResult）。 */
export async function runAgentdevGhOperation(
  env: GhToolEnv,
  rawRequest: unknown,
): Promise<GhToolResult> {
  if (typeof rawRequest !== "object" || rawRequest === null) {
    return {
      ok: false,
      failure: {
        kind: "invalid-input",
        retryable: true,
        detail: "request must be an object with an operation field",
        contingency: { fallbacks: [], canContinue: false },
      },
    };
  }
  const operation = (rawRequest as Record<string, unknown>).operation;
  if (typeof operation !== "string") {
    return {
      ok: false,
      failure: {
        kind: "invalid-input",
        retryable: true,
        detail: `operation must be one of: ${GH_TOOL_OPERATIONS.join(", ")}`,
        contingency: { fallbacks: [], canContinue: false },
      },
    };
  }
  const spec = SPECS_BY_OPERATION.get(operation);
  if (spec === undefined) {
    return {
      ok: false,
      failure: {
        kind: "invalid-input",
        retryable: true,
        detail: `unknown operation: ${operation} (supported: ${GH_TOOL_OPERATIONS.join(", ")})`,
        contingency: { fallbacks: [], canContinue: false },
      },
    };
  }
  return executeOperation(env, spec, rawRequest);
}

export { buildGhToolEnv, executeOperation } from "./engine.ts";
export type {
  GhToolConfig,
  GhToolEnv,
  GhToolPaths,
  OperationSpec,
  PathProber,
} from "./engine.ts";
export type { GhRunner, GhRunnerReply, GhRunnerRequest } from "./runner.ts";
