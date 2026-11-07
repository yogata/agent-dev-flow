// TS-003 全組合せ統合試験（Senpi 側スライス、REQ-099-007）。
//
// Senpi 登録 surface（createAgentdevGhSenpiRegistration の execute）を通して、
// GitHub バックエンドとローカルIssueバックエンドのそれぞれで Tool 操作契約の
// 主要操作一連（起票・読取・更新・状態遷移・コメントと読み戻し検証）が成立する
// ことを検証する。ローカル組合せは Senpi 向け投影構造（LOCAL_RUNNER_PROJECTION が
// 共通正本の Local 実装へ接続）を一時 worktree に再現し、既定の runner 選択経路
// （投影検出 → LocalRunner 構築）まで含めて実行する。

import { describe, expect, test } from "bun:test";
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
  createGitHubStub,
  localIssueUpdatedAt,
  makeCloseAcceptanceFixture,
  mainOperationSequence,
  runCaseIssueCloseRoute,
  toStepResult,
  type StepOutcome,
  type StepResult,
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

async function runSequence(
  registration: SenpiToolDefinition,
  worktree: string,
  commentRef: string,
): Promise<StepOutcome[]> {
  const outcomes: StepOutcome[] = [];
  for (const step of mainOperationSequence(commentRef)) {
    const result = await registration.execute(
      { request: { operation: step.operation, ...step.args } },
      makeContext(worktree),
    );
    outcomes.push({ step, result: toStepResult(step.operation, JSON.parse(result.output)) });
  }
  return outcomes;
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
    const outcomes = await runSequence(registration, worktree, "1");
    const failed = outcomes.filter((o) => !o.result.ok);
    expect(failed).toEqual([]);
    const read = outcomes.find((o) => o.step.operation === "issue_read")?.result.payload as Record<string, unknown>;
    expect(read?.title).toBe("統合試験 追跡Issue");
    expect(read?.role).toBe("tracking");
    expect(read?.closeReason).toBeNull();
    const close = outcomes.find((o) => o.step.operation === "issue_close")?.result.payload as Record<string, unknown>;
    expect(close?.state).toBe("closed");
    const reopen = outcomes.find((o) => o.step.operation === "issue_reopen")?.result.payload as Record<string, unknown>;
    expect(reopen?.state).toBe("open");
    expect(stub.issues[0]?.labels).toContain("tracking");
    expect(stub.issues[0]?.labels.filter((l: string) => l.startsWith("agentdev-"))).toEqual([]);
    const commentCreate = outcomes.find((o) => o.step.operation === "comment_create")?.result.payload as Record<string, unknown>;
    expect(String(commentCreate?.commentId)).toBe("1");
    const commentList = outcomes.find((o) => o.step.operation === "comment_list")?.result.payload as Record<string, unknown>;
    expect((commentList?.comments as unknown[]).length).toBe(1);
    const commentDelete = outcomes.find((o) => o.step.operation === "comment_delete")?.result;
    expect(commentDelete?.ok).toBe(true);
    expect(stub.comments.length).toBe(0);
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe("TS-003 Senpi×ローカルIssue（投影検出 → LocalRunner による主要操作一連）", () => {
  test("Senpi 向け投影構造で主要操作が実ファイルの読み書きと読み戻し検証つきで成立する", async () => {
    const worktree = makeWorktree();
    writeLocalRunnerProjection(worktree);
    const registration = createAgentdevGhSenpiRegistration({ resolveRepo: () => "local/issues" });
    const outcomes = await runSequence(registration, worktree, "issue-0001-c01");
    const failed = outcomes.filter((o) => !o.result.ok);
    expect(failed).toEqual([]);
    const issueFile = path.join(worktree, ".agentdev", "issues", "issue-0001.md");
    expect(fs.existsSync(issueFile)).toBe(true);
    const raw = fs.readFileSync(issueFile, "utf8");
    expect(raw).toContain("title: \"統合試験 追跡Issue 更新後\"");
    expect(raw).toContain("status: in-discussion");
    expect(raw).toContain("labels: []");
    expect(raw).toContain("## 検討経過");
    expect(raw.includes("\r\n")).toBe(false);
    const bytes = fs.readFileSync(issueFile);
    expect(bytes[0]).toBe(0x2d);
    const read = outcomes.find((o) => o.step.operation === "issue_read")?.result.payload as Record<string, unknown>;
    expect(read?.role).toBe("tracking");
    expect(read?.closeReason).toBeNull();
    const close = outcomes.find((o) => o.step.operation === "issue_close")?.result.payload as Record<string, unknown>;
    expect(close?.state).toBe("closed");
    const reopen = outcomes.find((o) => o.step.operation === "issue_reopen")?.result.payload as Record<string, unknown>;
    expect(reopen?.state).toBe("open");
    const commentList = outcomes.find((o) => o.step.operation === "comment_list")?.result.payload as Record<string, unknown>;
    expect((commentList?.comments as unknown[]).length).toBe(1);
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});

describe("TS-007 終了経路シナリオ（issue_close の終了前提検証・Senpi 登録表面）", () => {
  function expectRefused(
    outcomes: { label: string; result: StepResult; stateAfterRefusal?: unknown }[],
    label: string,
    kind: string,
  ): void {
    const refused = outcomes.find((o) => o.label === label);
    expect(refused).toBeDefined();
    expect(refused?.result.ok).toBe(false);
    expect(refused?.result.failure?.kind).toBe(kind);
    expect(refused?.stateAfterRefusal).toBe("open");
  }

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
    const outcomes = await runCaseIssueCloseRoute(async (step) => {
      const result = await registration.execute(
        { request: { operation: step.operation, ...step.args } },
        makeContext(worktree),
      );
      return toStepResult(step.operation, JSON.parse(result.output));
    }, fixture, () => stub.issues[0]?.updated_at ?? "2026-10-01T00:00:00Z");
    for (const label of [
      "〔1〕記録なし拒否",
      "〔2〕形式不正拒否",
      "〔3〕対象不一致拒否",
      "〔4〕判定不成立拒否",
      "〔5〕判定対象版不一致（過去の合格結果の再利用）拒否",
      "〔6〕旧様式（台帳照合結果のみ）の受理なし拒否",
    ]) {
      expectRefused(outcomes, label, "verification-incomplete");
    }
    const closed = outcomes.find((o) => o.label === "検証成立時の終了");
    expect(closed?.result.ok).toBe(true);
    const read = outcomes.find((o) => o.label === "読み戻し(closed)");
    expect((read?.result.payload as Record<string, unknown> | null)?.state).toBe("closed");
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
    const outcomes = await runCaseIssueCloseRoute(async (step) => {
      const result = await registration.execute(
        { request: { operation: step.operation, ...step.args } },
        makeContext(worktree),
      );
      return toStepResult(step.operation, JSON.parse(result.output));
    }, fixture, () => localIssueUpdatedAt(path.join(worktree, ".agentdev", "issues"), 1));
    for (const label of [
      "〔1〕記録なし拒否",
      "〔2〕形式不正拒否",
      "〔3〕対象不一致拒否",
      "〔4〕判定不成立拒否",
      "〔5〕判定対象版不一致（過去の合格結果の再利用）拒否",
      "〔6〕旧様式（台帳照合結果のみ）の受理なし拒否",
    ]) {
      expectRefused(outcomes, label, "verification-incomplete");
    }
    const closed = outcomes.find((o) => o.label === "検証成立時の終了");
    expect(closed?.result.ok).toBe(true);
    const issueFile = path.join(worktree, ".agentdev", "issues", "issue-0001.md");
    expect(fs.readFileSync(issueFile, "utf8")).toContain("status: closed");
    fs.rmSync(worktree, { recursive: true, force: true });
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });
});
