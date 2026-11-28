// Codex ホスト接続領域の agentdev_gh adapter（Custom Tool 未登録ホスト向けの操作契約提供面）。
//
// Codex は Custom Tool を登録できないため、GitHub 操作は本 adapter が共通の
// agentdev_gh 操作契約（engine・操作スペック・VERIFY）を提供する。実行経路は
// 導入先リポジトリの .agentdev/config/github-route.json から解決し、既定は
// プラグイン経路（Codex の GitHub プラグイン = GitHub hosted MCP server）、
// 利用者の明示判断による切替後は gh 経路（既存の gh 用 runner）を使う。
// agent は本ファイルを導入先リポジトリ root から bun で起動する:
//   bun .agents/agentdev/codex/github/agentdev-gh-adapter.ts --input request.json
// （起動手順の案内は agentdev-host-github-guidance スキルが所有する）

import * as fs from "node:fs";
import {
  createAgentdevGhRouteAdapterSurface,
  type AgentdevGhAdapterSurface,
  type AgentdevGhRouteAdapterDeps,
} from "../../common/tools/agentdev-gh/route-adapter.ts";
import { runAgentdevGhAdapterCli } from "../../common/tools/agentdev-gh/route-adapter-cli.ts";
import { createPluginRunner } from "../../common/tools/agentdev-gh/plugin-runner.ts";
import type { GhRunner } from "../../common/tools/agentdev-gh/runner.ts";
import { CODEX_GITHUB_MCP_TOKEN_ENV, createCodexMcpTransport } from "./codex-mcp-transport.ts";
import { createCodexPluginMapping } from "./codex-plugin-mapping.ts";

/** プラグイン経路の runner（Codex の mapping と transport を組む）。 */
export function createCodexPluginRouteRunner(
  repo: string,
  token: string | null = process.env[CODEX_GITHUB_MCP_TOKEN_ENV] ?? null,
): GhRunner {
  return createPluginRunner(
    createCodexPluginMapping({ repo }),
    createCodexMcpTransport({ token }),
  );
}

/** Codex adapter の既定 deps（経路設定の host キーとプラグイン runner 構築）。 */
export const codexAgentdevGhAdapterDeps: AgentdevGhRouteAdapterDeps = {
  host: "codex",
  createPluginRunnerOf: (repo) => createCodexPluginRouteRunner(repo),
};

/** Codex 向けの操作契約 surface（共通 helper と同じ形。テストが利用する）。 */
export function createCodexAgentdevGhSurface(): AgentdevGhAdapterSurface {
  return createAgentdevGhRouteAdapterSurface(codexAgentdevGhAdapterDeps);
}

if (import.meta.main) {
  process.exitCode = await runAgentdevGhAdapterCli(
    codexAgentdevGhAdapterDeps,
    process.cwd(),
    process.argv.slice(2),
    {
      readFile: (p) => fs.readFileSync(p, "utf8"),
      stdout: (t) => process.stdout.write(`${t}\n`),
    },
  );
}
