// agentdev_third_party Custom Tool の公開入口・登録構造。
//
// 登録構造は操作契約（contracts.ts）、fail-closed 実行ゲート（engine.ts）、
// 取得プロファイル（acquisition.ts）、source URL 判定（source-url.ts）、
// 宣言読込（declaration.ts）、取得トランスポート（transport.ts）を
// 単一の Tool 定義へ接続する。
// ツール名・公開単位の詳細は Design `custom-tool-contracts.md` の所有事項である。


import type { TpResult } from "./contracts.ts";
import { executeAcquire, type TpToolEnv } from "./engine.ts";

/** Tool の公開名。命名は Design の所有事項（仮確定、Design確定候補参照）。 */
export const AGENTDEV_THIRD_PARTY_TOOL_NAME = "agentdev_third_party";

/** Tool の説明（利用者への公開契約の要約）。 */
export const AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION =
  "Structured third-party Skill acquisition with a verified operation contract. " +
  "Acquires declared skills from GitHub sources (single SKILL.md or Skill directory) into " +
  ".opencode/skills/<name>/ with non-destructive placement, refuses to overwrite unmanaged " +
  "existing placements, and verifies the placement by read-back before success is returned " +
  "(fail-closed).";

/** 操作を1件実行する。戻り値の型が成功/失敗を強制する（TpResult）。 */
export async function runAgentdevThirdPartyOperation(
  env: TpToolEnv,
  rawRequest: unknown,
): Promise<TpResult> {
  return executeAcquire(env, rawRequest);
}

export { buildTpToolEnv, validateAcquireRequest, type TpPathProber, type TpToolEnv } from "./engine.ts";
export { createGitHubSourceFetcher, type SourceFetcher, type GitHubFetcherEndpoints } from "./transport.ts";
export type {
  AcquireReport,
  AcquisitionProfile,
  PlannedTarget,
  TargetResult,
  TpFailure,
  TpRequest,
  TpResult,
  TpSuccess,
  UnmanagedConflict,
} from "./contracts.ts";
export { PROVENANCE_FILENAME, classifyExisting } from "./acquisition.ts";
export { resolveSourceUrl } from "./source-url.ts";
export { parseDeclaration, validateSkillName } from "./declaration.ts";
