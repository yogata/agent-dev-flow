// TS-012 必須能力欠落環境試験（OpenCode 側スライス、REQ-099-015）。
//
// 必須能力（Local バックエンド実装）を意図的に欠落させた投影環境で
// 対象操作を起動し、未対応が既存契約（構造化失敗・fail-closed）に沿って
// 報告されること、GitHub 実装への暗黙 fallback が発生しないことを検証する。
//
// 判定の所属（B3-5e）: fail-closed 判定の本体は共通側 helper
// （src/common/tools/agentdev-gh/tests/missing-capability-shared.ts）へ移設済みである。
// 本ファイルは接続差の試験のみを保持する（破損投影 fixture を OpenCode 向け投影パス
// .opencode/tools/agentdev-gh/ へ配置し、OpenCode 登録 surface を構築して共通判定へ渡す）。

import { describe, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevGhToolDefinition, type ToolContext } from "../plugin.ts";
import {
  assertBrokenLocalProjectionFailsClosed,
  assertUnresolvedRepoFailsClosed,
  type HostToolSurface,
} from "../../../../common/tools/agentdev-gh/tests/missing-capability-shared.ts";

function makeContext(worktree: string): ToolContext {
  return { sessionID: "test", directory: worktree, worktree };
}

function opencodeSurface(def: ReturnType<typeof createAgentdevGhToolDefinition>): HostToolSurface {
  return (args, worktree) => def.execute(args, makeContext(worktree));
}

describe("TS-012 必須能力欠落環境（OpenCode 接続差: 投影パスと登録 surface）", () => {
  test("投影パスに createLocalRunner を持たない runner-local.ts がある場合、GitHub 実装へ切替えず構造化失敗を返す", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "ts012-opencode-"));
    const projectionDir = path.join(worktree, ".opencode", "tools", "agentdev-gh");
    fs.mkdirSync(projectionDir, { recursive: true });
    fs.writeFileSync(
      path.join(projectionDir, "runner-local.ts"),
      "export const broken = true;\n",
      "utf8",
    );
    const def = createAgentdevGhToolDefinition({ resolveRepo: () => "local/issues" });
    await assertBrokenLocalProjectionFailsClosed(opencodeSurface(def), worktree);
    fs.rmSync(worktree, { recursive: true, force: true });
  });

  test("リポジトリ解決不能は実行可能と判定せず config-uninterpretable で報告する（既存契約の再確認）", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "ts012-opencode-repo-"));
    const def = createAgentdevGhToolDefinition({ resolveRepo: () => null });
    await assertUnresolvedRepoFailsClosed(opencodeSurface(def), worktree);
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});
