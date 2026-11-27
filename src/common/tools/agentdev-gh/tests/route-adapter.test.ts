//
// route-adapter（ホスト接続 adapter 共通部）のテスト。
//
// 経路解決の停止系（repo 解決不能・設定読取不能・設定不正）、gh 経路の事前確認
// （認証失敗で操作前に停止）、gh 経路の主要操作系列（共通判定・読み戻し検証）、
// plugin 経路の runner 委譲、CLI の引数・ファイル異常と終了コード写像を検証する。
// 実ネットワークも実 gh も使わない（gh はスタブ、plugin 経路は停止 runner）。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  assertGitHubSequenceOutcomes,
  createGitHubStub,
  runSurfaceSequence,
  type GhSpawnError,
} from "./four-combination-shared.ts";
import type { GhExec } from "../runner-cli.ts";
import {
  createAgentdevGhRouteAdapterSurface,
  runAgentdevGhRouteAdapter,
  type AgentdevGhRouteAdapterDeps,
} from "../route-adapter.ts";
import { runAgentdevGhAdapterCli } from "../route-adapter-cli.ts";
import type { GhRunner } from "../runner.ts";

const REPO = "owner/repo";

const STOP_RUNNER: GhRunner = {
  async run() {
    return {
      ok: false,
      error: "plugin route stopped by the fake runner",
      exitCode: null,
      failureClass: "operation-failed",
    };
  },
};

function depsOf(overrides: Partial<AgentdevGhRouteAdapterDeps> = {}): AgentdevGhRouteAdapterDeps {
  return {
    host: "codex",
    createPluginRunnerOf: () => STOP_RUNNER,
    resolveRepo: () => ({ repo: REPO }),
    ...overrides,
  };
}

function makeTempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "route-adapter-"));
}

function writeRoute(root: string, content: string): void {
  fs.mkdirSync(path.join(root, ".agentdev", "config"), { recursive: true });
  fs.writeFileSync(path.join(root, ".agentdev", "config", "github-route.json"), content, "utf8");
}

function stubGhExecWithPreflight(): { exec: GhExec; stub: ReturnType<typeof createGitHubStub> } {
  const stub = createGitHubStub();
  const exec: GhExec = (file, args) =>
    args[0] === "repo"
      ? { status: 0, stdout: REPO, stderr: "" }
      : stub.exec(file, args);
  return { exec, stub };
}

function rmrf(p: string): void {
  fs.rmSync(p, { recursive: true, force: true });
}

describe("route-adapter の停止系（経路と repo の解決）", () => {
  test("repo が解決できない場合は操作の前に config-uninterpretable で停止する", async () => {
    const deps = depsOf({
      resolveRepo: () => ({
        repo: null,
        diagnostics: {
          attemptedMeans: ["AGENTDEV_GH_REPO environment variable (not set)", "gh repo view"],
          ghExitCode: 1,
          ghStderrSummary: "not a git repository",
        },
      }),
    });
    const r = await runAgentdevGhRouteAdapter(deps, makeTempRoot(), { operation: "issue_read", number: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.kind).toBe("config-uninterpretable");
      expect(r.failure.detail).toContain("cannot resolve the target repository");
    }
  });

  test("経路設定が読めない（ディレクトリ）場合は config-uninterpretable で停止する", async () => {
    const root = makeTempRoot();
    try {
      fs.mkdirSync(path.join(root, ".agentdev", "config", "github-route.json"), { recursive: true });
      const r = await runAgentdevGhRouteAdapter(depsOf(), root, { operation: "issue_read", number: 1 });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.failure.kind).toBe("config-uninterpretable");
        expect(r.failure.detail).toContain("config-unreadable");
      }
    } finally {
      rmrf(root);
    }
  });

  test("経路設定が不正な JSON の場合は plugin runner を呼ばず停止する", async () => {
    const root = makeTempRoot();
    try {
      writeRoute(root, "{invalid");
      let pluginRunnerBuilt = false;
      const deps = depsOf({
        createPluginRunnerOf: () => {
          pluginRunnerBuilt = true;
          return STOP_RUNNER;
        },
      });
      const r = await runAgentdevGhRouteAdapter(deps, root, { operation: "issue_read", number: 1 });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.failure.kind).toBe("config-uninterpretable");
        expect(r.failure.detail).toContain("config-invalid");
      }
      expect(pluginRunnerBuilt).toBe(false);
    } finally {
      rmrf(root);
    }
  });
});
describe("route-adapter の gh 経路", () => {
  test("事前確認（gh repo view）が失敗すれば操作前に停止し、何も書かない", async () => {
    const root = makeTempRoot();
    try {
      writeRoute(root, '{"codex":"gh"}');
      const stub = createGitHubStub();
      const exec: GhExec = (file, args) =>
        args[0] === "repo"
          ? { status: 1, stdout: "", stderr: "gh: authentication required" }
          : stub.exec(file, args);
      const deps = depsOf({ execGh: exec });
      const r = await runAgentdevGhRouteAdapter(deps, root, {
        operation: "issue_create",
        title: "t",
        body: "b",
        labels: [],
        role: "case",
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.failure.kind).toBe("config-uninterpretable");
        expect(r.failure.detail).toContain("gh route preflight failed");
        expect(r.failure.detail).toContain("authentication required");
      }
      expect(stub.issues).toHaveLength(0);
    } finally {
      rmrf(root);
    }
  });

  test("gh 経路の設定で主要操作系列が共通判定（読み戻し検証）を通過する", async () => {
    const root = makeTempRoot();
    try {
      writeRoute(root, '{"codex":"gh"}');
      const { exec, stub } = stubGhExecWithPreflight();
      const surface = createAgentdevGhRouteAdapterSurface(depsOf({ execGh: exec }));
      const outcomes = await runSurfaceSequence(surface, root, "1");
      assertGitHubSequenceOutcomes(outcomes, stub);
    } finally {
      rmrf(root);
    }
  });
});

describe("route-adapter の plugin 経路", () => {
  test("設定のないホストは plugin 経路として runner を委譲する", async () => {
    const root = makeTempRoot();
    try {
      const r = await runAgentdevGhRouteAdapter(depsOf(), root, { operation: "issue_read", number: 1 });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.failure.kind).toBe("operation-failed");
        expect(r.failure.detail).toContain("plugin route stopped by the fake runner");
      }
    } finally {
      rmrf(root);
    }
  });

  test("plugin 経路の失敗は暗黙に gh へ切り替わらない（runner の失敗をそのまま返す）", async () => {
    const root = makeTempRoot();
    try {
      const stub = createGitHubStub();
      const exec: GhExec = (file, args) =>
        args[0] === "repo" ? { status: 0, stdout: REPO, stderr: "" } : stub.exec(file, args);
      const r = await runAgentdevGhRouteAdapter(depsOf({ execGh: exec }), root, {
        operation: "issue_create",
        title: "t",
        body: "b",
        labels: [],
        role: "case",
      });
      expect(r.ok).toBe(false);
      expect(stub.issues).toHaveLength(0);
    } finally {
      rmrf(root);
    }
  });
});

describe("route-adapter CLI", () => {
  function ioOf(outputs: string[]) {
    return {
      readFile: (p: string) => fs.readFileSync(p, "utf8"),
      stdout: (t: string) => outputs.push(t),
    };
  }

  test("--input が無い場合は使い方の invalid-input で終了 1", async () => {
    const outputs: string[] = [];
    const code = await runAgentdevGhAdapterCli(depsOf(), makeTempRoot(), [], ioOf(outputs));
    expect(code).toBe(1);
    const parsed = JSON.parse(outputs[0] ?? "{}") as { ok: boolean; failure: { kind: string } };
    expect(parsed.ok).toBe(false);
    expect(parsed.failure.kind).toBe("invalid-input");
  });

  test("要求ファイルが読めない場合は invalid-input で終了 1", async () => {
    const root = makeTempRoot();
    try {
      const outputs: string[] = [];
      const code = await runAgentdevGhAdapterCli(depsOf(), root, ["--input", path.join(root, "missing.json")], ioOf(outputs));
      expect(code).toBe(1);
      const parsed = JSON.parse(outputs[0] ?? "{}") as { ok: boolean; failure: { kind: string; detail: string } };
      expect(parsed.ok).toBe(false);
      expect(parsed.failure.kind).toBe("invalid-input");
      expect(parsed.failure.detail).toContain("missing.json");
    } finally {
      rmrf(root);
    }
  });

  test("gh 経路で成功すれば結果 JSON を出力して終了 0、失敗なら終了 1", async () => {
    const root = makeTempRoot();
    try {
      writeRoute(root, '{"codex":"gh"}');
      const { exec, stub } = stubGhExecWithPreflight();
      const deps = depsOf({ execGh: exec });
      const requestFile = path.join(root, "request.json");
      fs.writeFileSync(requestFile, JSON.stringify({
        operation: "issue_create",
        title: "CLI での起票",
        body: "b",
        labels: [],
        role: "case",
      }));
      const okOutputs: string[] = [];
      const okCode = await runAgentdevGhAdapterCli(deps, root, ["--input", requestFile], ioOf(okOutputs));
      expect(okCode).toBe(0);
      expect((JSON.parse(okOutputs[0] ?? "{}") as { ok: boolean }).ok).toBe(true);
      expect(stub.issues).toHaveLength(1);

      const readOutputs: string[] = [];
      fs.writeFileSync(requestFile, JSON.stringify({ operation: "issue_read", number: 999 }));
      const failCode = await runAgentdevGhAdapterCli(deps, root, ["--input", requestFile], ioOf(readOutputs));
      expect(failCode).toBe(1);
      expect((JSON.parse(readOutputs[0] ?? "{}") as { ok: boolean }).ok).toBe(false);
    } finally {
      rmrf(root);
    }
  });
});

export type { GhSpawnError };
