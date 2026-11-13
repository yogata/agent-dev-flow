// TS-003 全組合せ統合試験（OpenCode 側スライス、REQ-099-007）。
//
// OpenCode 登録 surface（createAgentdevGhToolDefinition の execute）を通して、
// GitHub バックエンドとローカルIssueバックエンドのそれぞれで Tool 操作契約の
// 主要操作一連（起票・読取・更新・状態遷移・コメントと読み戻し検証）が成立する
// ことを検証する。ローカル組合せは install -LocalMode 相当の投影構造
// （.opencode/tools/agentdev-gh/runner-local.ts が共通正本の Local 実装へ接続）
// を一時 worktree に再現し、既定の runner 選択経路（投影検出 → LocalRunner 構築）
// まで含めて実行する。
//
// 判定の所属（B3-5e）: 一連の実行、読み戻し検証、物理ラベル写像、終了経路の
// 判定は共通側 helper（src/common/tools/agentdev-gh/tests/four-combination-shared.ts、
// missing-capability-shared.ts）へ移設済みである。本ファイルは接続差の試験のみを
// 保持する（OpenCode 登録 surface の構築、ToolContext 形、投影パス
// .opencode/tools/agentdev-gh/ の解決）。

import { describe, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createAgentdevGhToolDefinition, type ToolContext } from "../plugin.ts";
import { createCliRunner } from "../../../../common/tools/agentdev-gh/runner-cli.ts";
import {
  assertCaseIssueCloseRoute,
  assertGitHubSequenceOutcomes,
  assertLocalSequenceOutcomes,
  createGitHubStub,
  executeStepOnSurface,
  localIssueUpdatedAt,
  makeCloseAcceptanceFixture,
  runCaseIssueCloseRoute,
  runSurfaceSequence,
  type HostToolSurface,
} from "../../../../common/tools/agentdev-gh/tests/four-combination-shared.ts";

const CANONICAL_LOCAL_RUNNER = path.resolve(
  import.meta.dir,
  "..",
  "..",
  "..",
  "..",
  "common",
  "tools",
  "agentdev-gh",
  "local",
  "runner-local.ts",
);

function makeContext(worktree: string): ToolContext {
  return { sessionID: "test", directory: worktree, worktree };
}

function makeWorktree(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ts003-opencode-"));
}

function writeLocalRunnerProjection(worktree: string): void {
  const projectionDir = path.join(worktree, ".opencode", "tools", "agentdev-gh");
  fs.mkdirSync(projectionDir, { recursive: true });
  const rel = path.relative(projectionDir, CANONICAL_LOCAL_RUNNER).replaceAll("\\", "/");
  fs.writeFileSync(
    path.join(projectionDir, "runner-local.ts"),
    `export { createLocalRunner, validateLocalIssue } from "${rel}";\n`,
    "utf8",
  );
}

/** OpenCode 登録 surface を共通判定 helper の共通形へ接続する（接続差の接続点）。 */
function opencodeSurface(def: ReturnType<typeof createAgentdevGhToolDefinition>): HostToolSurface {
  return (args, worktree) => def.execute(args, makeContext(worktree));
}

describe("TS-003 OpenCode×GitHub（Tool 操作契約の主要操作一連と読み戻し検証）", () => {
  test("登録 surface 経由で GitHub バックエンドの主要操作が検証つきで成立する", async () => {
    const worktree = makeWorktree();
    const tempDir = makeWorktree();
    const stub = createGitHubStub();
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "owner/repo",
      createRunner: () => createCliRunner({ repo: "owner/repo", tempDir, exec: stub.exec }),
    });
    const outcomes = await runSurfaceSequence(opencodeSurface(def), worktree, "1");
    assertGitHubSequenceOutcomes(outcomes, stub);
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("TS-003 OpenCode×ローカルIssue（投影検出 → LocalRunner による主要操作一連）", () => {
  test("install -LocalMode 相当の投影構造で主要操作が実ファイルの読み書きと読み戻し検証つきで成立する", async () => {
    const worktree = makeWorktree();
    writeLocalRunnerProjection(worktree);
    const def = createAgentdevGhToolDefinition({ resolveRepo: () => "local/issues" });
    const outcomes = await runSurfaceSequence(opencodeSurface(def), worktree, "issue-0001-c01");
    assertLocalSequenceOutcomes(outcomes, worktree);
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});

describe("TS-007 終了経路シナリオ（issue_close の終了前提検証・公開Tool表面）", () => {
  test("公開Toolへの直接呼出し経路: GitHub バックエンドで機械受理不成立時の終了操作が実行されない", async () => {
    const worktree = makeWorktree();
    const tempDir = makeWorktree();
    const fixture = makeCloseAcceptanceFixture("ts007-mainroot-gh-");
    const stub = createGitHubStub();
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "owner/repo",
      createRunner: () => createCliRunner({ repo: "owner/repo", tempDir, exec: stub.exec, closeAcceptanceIo: fixture.io }),
      closeAcceptanceIo: fixture.io,
    });
    const surface = opencodeSurface(def);
    const outcomes = await runCaseIssueCloseRoute(
      (step) => executeStepOnSurface(surface, worktree, step),
      fixture,
      () => stub.issues[0]?.updated_at ?? "2026-10-01T00:00:00Z",
    );
    assertCaseIssueCloseRoute(outcomes, { githubStub: stub });
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("ローカル版実装経路: 投影検出 → LocalRunner で機械受理不成立時の終了操作が実行されない", async () => {
    const worktree = makeWorktree();
    writeLocalRunnerProjection(worktree);
    const fixture = makeCloseAcceptanceFixture("ts007-mainroot-local-");
    const def = createAgentdevGhToolDefinition({
      resolveRepo: () => "local/issues",
      closeAcceptanceIo: fixture.io,
    });
    const surface = opencodeSurface(def);
    const outcomes = await runCaseIssueCloseRoute(
      (step) => executeStepOnSurface(surface, worktree, step),
      fixture,
      () => localIssueUpdatedAt(path.join(worktree, ".agentdev", "issues"), 1),
    );
    assertCaseIssueCloseRoute(outcomes, { localIssuesDir: path.join(worktree, ".agentdev", "issues") });
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });
});
