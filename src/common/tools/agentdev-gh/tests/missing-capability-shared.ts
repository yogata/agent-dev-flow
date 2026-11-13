// TS-012 必須能力欠落環境試験の共通判定部分（REQ-099-015、B3-5e により共通側へ移設）。
//
// OpenCode（src/opencode/plugins/agentdev-gh-tool/tests/）と Senpi
// （src/senpi/tools/agentdev-gh-tool/tests/）の missing-capability.test.ts が
// 独立保持していた同一判定（破損した Local 実装投影の fail-closed 報告、
// GitHub 実装への暗黙 fallback 不発生、リポジトリ解決不能の config-uninterpretable
// 報告）を一箇所へ集約する。各ホスト試験は接続差の試験のみを保持する
// （破損投影 fixture をホスト向け投影パスへ配置し、ホストの登録 surface を構築して
// 本 helper へ渡す）。

import { expect } from "bun:test";
import type { HostToolSurface } from "./four-combination-shared.ts";

export type { HostToolSurface };

/** 破損した Local 実装投影は構造化失敗で報告され GitHub 実装へ暗黙 fallback しない（共通判定）。 */
export async function assertBrokenLocalProjectionFailsClosed(
  surface: HostToolSurface,
  worktree: string,
): Promise<void> {
  const result = await surface({ request: { operation: "issue_read", number: 1 } }, worktree);
  const parsed = JSON.parse(result.output) as {
    ok: boolean;
    failure: { kind: string; detail: string };
  };
  expect(parsed.ok).toBe(false);
  expect(parsed.failure.kind).toBe("config-uninterpretable");
  expect(parsed.failure.detail).toContain("must not silently fall back to the GitHub implementation");
  expect(result.metadata?.ok).toBe(false);
}

/** リポジトリ解決不能は実行可能と判定せず config-uninterpretable で報告する（共通判定・既存契約の再確認）。 */
export async function assertUnresolvedRepoFailsClosed(
  surface: HostToolSurface,
  worktree: string,
): Promise<void> {
  const result = await surface({ request: { operation: "issue_read", number: 1 } }, worktree);
  const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
  expect(parsed.ok).toBe(false);
  expect(parsed.failure.kind).toBe("config-uninterpretable");
}
