// TS-012 必須能力欠落環境試験（OpenCode 側スライス、REQ-099-015）。
//
// 必須能力（Local バックエンド実装）を意図的に欠落させた投影環境で
// 対象操作を起動し、未対応が既存契約（構造化失敗・fail-closed）に沿って
// 報告されること、GitHub 実装への暗黙 fallback が発生しないことを検証する。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevGhToolDefinition, type ToolContext } from "../plugin.ts";

function makeContext(worktree: string): ToolContext {
  return { sessionID: "test", directory: worktree, worktree };
}

describe("TS-012 必須能力欠落環境（Local 実装投影の破損時に暗黙 fallback しない）", () => {
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
    const result = await def.execute({ request: { operation: "issue_read", number: 1 } }, makeContext(worktree));
    const parsed = JSON.parse(result.output) as {
      ok: boolean;
      failure: { kind: string; detail: string };
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("config-uninterpretable");
    expect(parsed.failure.detail).toContain("must not silently fall back to the GitHub implementation");
    expect(result.metadata?.ok).toBe(false);
    fs.rmSync(worktree, { recursive: true, force: true });
  });

  test("リポジトリ解決不能は実行可能と判定せず config-uninterpretable で報告する（既存契約の再確認）", async () => {
    const worktree = fs.mkdtempSync(path.join(os.tmpdir(), "ts012-opencode-repo-"));
    const def = createAgentdevGhToolDefinition({ resolveRepo: () => null });
    const result = await def.execute({ request: { operation: "issue_read", number: 1 } }, makeContext(worktree));
    const parsed = JSON.parse(result.output) as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("config-uninterpretable");
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});
