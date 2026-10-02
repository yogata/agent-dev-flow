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
  type SenpiToolDefinition,
} from "../registration.ts";
import type { SenpiToolContext } from "../../tool-registration.ts";
import { createCliRunner } from "../../../../common/tools/agentdev-gh/runner-cli.ts";
import {
  createGitHubStub,
  mainOperationSequence,
  toStepResult,
  type StepOutcome,
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
    expect(read?.kind).toBe("task");
    expect(read?.trackingState).toBe("created");
    const close = outcomes.find((o) => o.step.operation === "issue_close")?.result.payload as Record<string, unknown>;
    expect(close?.state).toBe("closed");
    const reopen = outcomes.find((o) => o.step.operation === "issue_reopen")?.result.payload as Record<string, unknown>;
    expect(reopen?.state).toBe("open");
    expect(stub.issues[0]?.labels).toContain("agentdev-tracking-status/in-discussion");
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
    expect(raw).toContain("title: \"統合試験 追跡Issue\"");
    expect(raw).toContain("status: in-discussion");
    expect(raw).toContain("## 検討経過");
    expect(raw.includes("\r\n")).toBe(false);
    const bytes = fs.readFileSync(issueFile);
    expect(bytes[0]).toBe(0x2d);
    const read = outcomes.find((o) => o.step.operation === "issue_read")?.result.payload as Record<string, unknown>;
    expect(read?.trackingState).toBe("created");
    const close = outcomes.find((o) => o.step.operation === "issue_close")?.result.payload as Record<string, unknown>;
    expect(close?.state).toBe("closed");
    const reopen = outcomes.find((o) => o.step.operation === "issue_reopen")?.result.payload as Record<string, unknown>;
    expect(reopen?.state).toBe("open");
    const commentList = outcomes.find((o) => o.step.operation === "comment_list")?.result.payload as Record<string, unknown>;
    expect((commentList?.comments as unknown[]).length).toBe(1);
    fs.rmSync(worktree, { recursive: true, force: true });
  });
});
