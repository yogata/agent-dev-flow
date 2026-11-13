// TS-003 全組合せ統合試験（Senpi 側スライス、REQ-099-007）。
//
// Senpi 登録 surface（createAgentdevGhSenpiRegistration の execute）を通して、
// GitHub バックエンドとローカルIssueバックエンドのそれぞれで Tool 操作契約の
// 主要操作一連（起票・読取・更新・状態遷移・コメントと読み戻し検証）が成立する
// ことを検証する。ローカル組合せは Senpi 向け投影構造（LOCAL_RUNNER_PROJECTION が
// 共通正本の Local 実装へ接続）を一時 worktree に再現し、既定の runner 選択経路
// （投影検出 → LocalRunner 構築）まで含めて実行する。
//
// 判定の所属（B3-5e）: 一連の実行、読み戻し検証、物理ラベル写像、終了経路の
// 判定は共通側 helper（src/common/tools/agentdev-gh/tests/four-combination-shared.ts、
// missing-capability-shared.ts）へ移設済みである。本ファイルは接続差の試験のみを
// 保持する（Senpi 登録 surface の構築、SenpiToolContext 形、投影パス
// LOCAL_RUNNER_PROJECTION の解決）。

import { describe, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createAgentdevGhSenpiRegistration,
  LOCAL_RUNNER_PROJECTION,
} from "../registration.ts";
import type { SenpiToolContext, SenpiToolDefinition } from "../../tool-registration.ts";
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

function makeContext(worktree: string): SenpiToolContext {
  return { worktree };
}

function makeWorktree(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ts003-senpi-"));
}

function writeLocalRunnerProjection(worktree: string): void {
  const projectionDir = path.join(worktree, path.dirname(LOCAL_RUNNER_PROJECTION));
  fs.mkdirSync(projectionDir, { recursive: true });
  const rel = path.relative(projectionDir, CANONICAL_LOCAL_RUNNER).replaceAll("\\", "/");
  const shim = `export { createLocalRunner, validateLocalIssue } from ${JSON.stringify(rel)};\n`;
  fs.writeFileSync(path.join(projectionDir, "runner-local.ts"), shim, "utf8");
}

/** Senpi 登録 surface を共通判定 helper の共通形へ接続する（接続差の接続点）。 */
function senpiSurface(registration: SenpiToolDefinition): HostToolSurface {
  return (args, worktree) => registration.execute(args, makeContext(worktree));
}

describe("TS-003 Senpi×GitHub（Tool 操作契約の主要操作一連と読み戻し検証）", () => {
  test("登録 surface 経由で GitHub バックエンドの主要操作が検証つきで成立する", async () => {
    const worktree = makeWorktree();
    const tempDir = makeWorktree();
    const stub = createGitHubStub();
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => createCliRunner({ repo: "owner/repo", tempDir, exec: stub.exec }),
    });
    const outcomes = await runSurfaceSequence(senpiSurface(registration), worktree, "1");
    assertGitHubSequenceOutcomes(outcomes, stub);
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("TS-003 Senpi×ローカルIssue（投影検出 → LocalRunner による主要操作一連）", () => {
  test("Senpi 向け投影構造で主要操作が実ファイルの読み書きと読み戻し検証つきで成立する", async () => {
    const worktree = makeWorktree();
    writeLocalRunnerProjection(worktree);
    const registration = createAgentdevGhSenpiRegistration({ resolveRepo: () => "local/issues" });
    const outcomes = await runSurfaceSequence(senpiSurface(registration), worktree, "issue-0001-c01");
    assertLocalSequenceOutcomes(outcomes, worktree);
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});

describe("TS-007 終了経路シナリオ（issue_close の終了前提検証・Senpi 登録表面）", () => {
  test("Senpi×GitHub: 機械受理不成立時の終了操作が実行されない", async () => {
    const worktree = makeWorktree();
    const tempDir = makeWorktree();
    const fixture = makeCloseAcceptanceFixture("ts007-senpi-gh-");
    const stub = createGitHubStub();
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "owner/repo",
      createRunner: () => createCliRunner({ repo: "owner/repo", tempDir, exec: stub.exec, closeAcceptanceIo: fixture.io }),
      closeAcceptanceIo: fixture.io,
    });
    const surface = senpiSurface(registration);
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

  test("Senpi×ローカルIssue: 機械受理不成立時の終了操作が実行されない", async () => {
    const worktree = makeWorktree();
    writeLocalRunnerProjection(worktree);
    const fixture = makeCloseAcceptanceFixture("ts007-senpi-local-");
    const registration = createAgentdevGhSenpiRegistration({
      resolveRepo: () => "local/issues",
      closeAcceptanceIo: fixture.io,
    });
    const surface = senpiSurface(registration);
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
