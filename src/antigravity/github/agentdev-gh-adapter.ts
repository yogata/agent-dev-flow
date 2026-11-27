// Antigravity ホスト接続領域の agentdev_gh adapter（Custom Tool 未登録ホスト向けの操作契約提供面）。
//
// Antigravity は Custom Tool を登録できないため、GitHub 操作は本 adapter が共通の
// agentdev_gh 操作契約（engine・操作スペック・VERIFY）を提供する。実行経路は
// 導入先リポジトリの .agentdev/config/github-route.json から解決する。
// プラグイン経路は Antigravity の GitHub プラグイン（利用者が構成する MCP
// サーバー）に接続するが、その tool 面は公開情報では確認できないため mapping の
// 能力表が全操作を未確認として停止させる（実機確認は利用者が行う）。利用者の
// 明示判断による切替後は gh 経路（既存の gh 用 runner）を使う。
// agent は本ファイルを導入先リポジトリ root から bun で起動する:
//   bun .agents/agentdev/antigravity/github/agentdev-gh-adapter.ts --input request.json
// （起動手順の案内は agentdev-host-github-guidance スキルが所有する）

import * as fs from "node:fs";
import {
  createAgentdevGhRouteAdapterSurface,
  type AgentdevGhAdapterSurface,
  type AgentdevGhRouteAdapterDeps,
} from "../../common/tools/agentdev-gh/route-adapter.ts";
import { runAgentdevGhAdapterCli } from "../../common/tools/agentdev-gh/route-adapter-cli.ts";
import {
  createPluginRunner,
  type PluginTransport,
} from "../../common/tools/agentdev-gh/plugin-runner.ts";
import type { GhRunner } from "../../common/tools/agentdev-gh/runner.ts";
import { createAntigravityPluginMapping } from "./antigravity-plugin-mapping.ts";

/** 未確認の tool 面を持つ transport（mapping が全操作を停止するため呼ばれない）。 */
const UNCONFIRMED_FACE_TRANSPORT: PluginTransport = {
  async invoke() {
    return {
      ok: false,
      kind: "plugin-unavailable",
      error:
        "the Antigravity GitHub plugin tool face is unconfirmed; confirm the capabilities " +
        "on the real host and update the capability table before use",
    };
  },
};

/** プラグイン経路の runner（Antigravity の mapping と停止 transport を組む）。 */
export function createAntigravityPluginRouteRunner(repo: string): GhRunner {
  return createPluginRunner(
    createAntigravityPluginMapping({ repo }),
    UNCONFIRMED_FACE_TRANSPORT,
  );
}

/** Antigravity adapter の既定 deps（経路設定の host キーとプラグイン runner 構築）。 */
export const antigravityAgentdevGhAdapterDeps: AgentdevGhRouteAdapterDeps = {
  host: "antigravity",
  createPluginRunnerOf: createAntigravityPluginRouteRunner,
};

/** Antigravity 向けの操作契約 surface（共通 helper と同じ形。テストが利用する）。 */
export function createAntigravityAgentdevGhSurface(): AgentdevGhAdapterSurface {
  return createAgentdevGhRouteAdapterSurface(antigravityAgentdevGhAdapterDeps);
}

if (import.meta.main) {
  process.exitCode = await runAgentdevGhAdapterCli(
    antigravityAgentdevGhAdapterDeps,
    process.cwd(),
    process.argv.slice(2),
    {
      readFile: (p) => fs.readFileSync(p, "utf8"),
      stdout: (t) => process.stdout.write(`${t}\n`),
    },
  );
}
