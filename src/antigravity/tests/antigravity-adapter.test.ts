//
// Antigravity ホストの agentdev_gh adapter のテスト。
//
// プラグイン経路（既定）は能力表が全操作を未確認として停止させること、
// gh 経路（切替後）は共通判定（読み戻し検証）を通過すること、CLI が
// 停止応答を JSON で返すことを検証する（実ネットワーク・実 gh なし）。
//

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertGitHubSequenceOutcomes,
  createGitHubStub,
  executeStepOnSurface,
  runSurfaceSequence,
} from "../../common/tools/agentdev-gh/tests/four-combination-shared.ts";
import type { GhExec } from "../../common/tools/agentdev-gh/runner-cli.ts";
import {
  createAgentdevGhRouteAdapterSurface,
  type AgentdevGhRouteAdapterDeps,
} from "../../common/tools/agentdev-gh/route-adapter.ts";
import { antigravityAgentdevGhAdapterDeps } from "../github/agentdev-gh-adapter.ts";

const REPO = "owner/repo";

function makeTempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "antigravity-adapter-"));
}

function writeRoute(root: string, content: string): void {
  fs.mkdirSync(path.join(root, ".agentdev", "config"), { recursive: true });
  fs.writeFileSync(path.join(root, ".agentdev", "config", "github-route.json"), content, "utf8");
}

function rmrf(p: string): void {
  fs.rmSync(p, { recursive: true, force: true });
}

describe("Antigravity adapter / プラグイン経路（既定）の停止", () => {
  test("能力表が未確認のため全操作が停止応答を返す（gh へ切り替わらない）", async () => {
    const root = makeTempRoot();
    try {
      const deps: AgentdevGhRouteAdapterDeps = {
        ...antigravityAgentdevGhAdapterDeps,
        resolveRepo: () => ({ repo: REPO }),
      };
      const surface = createAgentdevGhRouteAdapterSurface(deps);
      const outcome = await executeStepOnSurface(surface, root, {
        operation: "issue_create",
        args: { title: "t", body: "b", labels: [], role: "tracking" },
      });
      expect(outcome.ok).toBe(false);
      expect(outcome.failure?.kind).toBe("operation-failed");
      expect(outcome.failure?.detail).toContain("does not provide the operation: issue_create");
    } finally {
      rmrf(root);
    }
  });
});

describe("Antigravity adapter / gh 経路（切替後）", () => {
  test("gh 経路の設定で主要操作系列が共通判定（読み戻し検証）を通過する", async () => {
    const root = makeTempRoot();
    try {
      writeRoute(root, '{"antigravity":"gh"}');
      const stub = createGitHubStub();
      const exec: GhExec = (file, args) =>
        args[0] === "repo"
          ? { status: 0, stdout: REPO, stderr: "" }
          : stub.exec(file, args);
      const deps: AgentdevGhRouteAdapterDeps = {
        host: "antigravity",
        createPluginRunnerOf: () => {
          throw new Error("the plugin runner must not be built on the gh route");
        },
        resolveRepo: () => ({ repo: REPO }),
        execGh: exec,
      };
      const surface = createAgentdevGhRouteAdapterSurface(deps);
      const outcomes = await runSurfaceSequence(surface, root, "1");
      assertGitHubSequenceOutcomes(outcomes, stub);
    } finally {
      rmrf(root);
    }
  });
});

describe("Antigravity adapter / CLI の実起動", () => {
  const ADAPTER = path.resolve(import.meta.dir, "../github/agentdev-gh-adapter.ts");

  test("プラグイン経路（既定）は未確認停止の JSON を出して終了 1", () => {
    const root = makeTempRoot();
    try {
      const requestFile = path.join(root, "request.json");
      fs.writeFileSync(requestFile, JSON.stringify({ operation: "issue_read", number: 1 }));
      const r = spawnSync("bun", [ADAPTER, "--input", requestFile], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, AGENTDEV_GH_REPO: REPO },
      });
      expect(r.status).toBe(1);
      const parsed = JSON.parse(r.stdout ?? "") as { ok: boolean; failure: { kind: string; detail: string } };
      expect(parsed.ok).toBe(false);
      expect(parsed.failure.detail).toContain("does not provide the operation: issue_read");
    } finally {
      rmrf(root);
    }
  }, 60000);
});
