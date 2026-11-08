// issue_close の終了前提検証（Case Issue）の試験（TS-007）。
//
// CliRunner（GitHub 実装のステートフルスタブ）+ engine の実行ゲートを通して、
// 拒否条件の全ケースで終了の副作用が実行されず構造化失敗を返すこと（fail-closed）、
// 追跡Issue（tracking role）に前提が適用されないこと、検証成立時のみ終了が実行されること、
// worktree コンテキストから main repo root 側の保存場所へ決定的に解決されることを
// 検証する。判定記録の様式検証と main repo root 解決の単体試験を含む。
// 判定記録の書出し本体は case-close 機械工程（別実行単位）の責務であり、
// 本試験は書出し相当の fixture で記録を用意して読み取り検証側を検証する。


import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  closeAcceptanceRecordFileName,
  defaultCloseAcceptanceIo,
  parseCloseAcceptanceRecord,
  resolveCloseAcceptanceRecordPath,
  resolveMainRepoRoot,
} from "../close-acceptance.ts";
import { buildGhToolEnv } from "../engine.ts";
import { runAgentdevGhOperation } from "../index.ts";
import { createCliRunner } from "../runner-cli.ts";
import { createLocalRunner } from "../local/runner-local.ts";
import {
  createGitHubStub,
  makeCloseAcceptanceFixture,
  writeCloseAcceptanceRecord,
  writeRawCloseAcceptanceRecord,
  type CloseAcceptanceFixture,
  type GitHubStub,
} from "./four-combination-shared.ts";

const VALID_CONFIG = { repo: "owner/repo" };

const createdDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(import.meta.dir, prefix));
  createdDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of createdDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

async function setupCaseIssue(
  fixture: CloseAcceptanceFixture,
  issueNumber: number,
): Promise<GitHubStub> {
  const stub = createGitHubStub();
  const runner = createCliRunner({ repo: "owner/repo", tempDir: makeTempDir("ts007-tmp-"), exec: stub.exec, closeAcceptanceIo: fixture.io });
  const env = buildGhToolEnv(VALID_CONFIG, { tempDir: () => makeTempDir("ts007-tmp-") }, runner);
  if (!env.ok) throw new Error("env build failed");
  const created = await runAgentdevGhOperation(env.env, {
    operation: "issue_create",
    title: "TS-007 Case Issue",
    body: "本文",
    labels: ["feature"],
    role: "case",
  }, { closeAcceptanceIo: fixture.io });
  if (!created.ok) throw new Error("case issue create failed");
  const issue = stub.issues.find((i) => i.number === issueNumber);
  if (issue === undefined) throw new Error("case issue not found in stub");
  return stub;
}

async function closeViaEngine(
  stub: GitHubStub,
  fixture: CloseAcceptanceFixture,
  issueNumber: number,
  deps: { closeAcceptanceIo?: CloseAcceptanceFixture["io"]; cwd?: string } = {},
): Promise<{ ok: boolean; kind: string | null; detail: string }> {
  const runner = createCliRunner({ repo: "owner/repo", tempDir: makeTempDir("ts007-tmp-"), exec: stub.exec, closeAcceptanceIo: deps.closeAcceptanceIo ?? fixture.io });
  const env = buildGhToolEnv(VALID_CONFIG, { tempDir: () => makeTempDir("ts007-tmp-") }, runner);
  if (!env.ok) throw new Error("env build failed");
  const depArgs: { closeAcceptanceIo: CloseAcceptanceFixture["io"]; cwd?: string } = {
    closeAcceptanceIo: deps.closeAcceptanceIo ?? fixture.io,
  };
  if (deps.cwd !== undefined) depArgs.cwd = deps.cwd;
  const result = await runAgentdevGhOperation(env.env, {
    operation: "issue_close",
    number: issueNumber,
    reason: "completed",
  }, depArgs);
  return {
    ok: result.ok,
    kind: result.ok ? null : result.failure.kind,
    detail: result.ok ? "" : result.failure.detail,
  };
}

function expectRefusal(
  outcome: { ok: boolean; kind: string | null; detail: string },
  issueStateShouldBeOpen: boolean,
  stub: GitHubStub,
  issueNumber: number,
): void {
  expect(outcome.ok).toBe(false);
  expect(outcome.kind).toBe("verification-incomplete");
  if (issueStateShouldBeOpen) {
    const issue = stub.issues.find((i) => i.number === issueNumber);
    expect(issue?.state).toBe("open");
  }
}

describe("issue_close の終了前提検証（CliRunner + engine・TS-007）", () => {
  test("〔1〕終了判定記録が存在しない場合は終了の副作用を実行せず構造化失敗を返す", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a1-");
    const stub = await setupCaseIssue(fixture, 1);
    const outcome = await closeViaEngine(stub, fixture, 1);
    expectRefusal(outcome, true, stub, 1);
    expect(outcome.detail).toContain("the close acceptance record is missing");
    expect(outcome.detail).toContain("issue-0001.json");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("〔2〕記録が読み取れない・形式不正の場合は拒否する", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a2-");
    const stub = await setupCaseIssue(fixture, 1);
    writeRawCloseAcceptanceRecord(fixture, 1, "not-json{{{");
    expectRefusal(await closeViaEngine(stub, fixture, 1), true, stub, 1);
    writeRawCloseAcceptanceRecord(fixture, 1, "[]");
    expectRefusal(await closeViaEngine(stub, fixture, 1), true, stub, 1);
    writeCloseAcceptanceRecord(fixture, 1, { issueNumber: 1, generatedAt: "2026-11-05T00:00:00Z", accepted: true });
    expectRefusal(await closeViaEngine(stub, fixture, 1), true, stub, 1);
    writeCloseAcceptanceRecord(fixture, 1, { issueNumber: 1, targetRevision: "", generatedAt: "2026-11-05T00:00:00Z", accepted: true });
    expectRefusal(await closeViaEngine(stub, fixture, 1), true, stub, 1);
    writeCloseAcceptanceRecord(fixture, 1, { issueNumber: "1", targetRevision: "2026-10-01T00:00:00Z", generatedAt: "2026-11-05T00:00:00Z", accepted: true });
    expectRefusal(await closeViaEngine(stub, fixture, 1), true, stub, 1);
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("〔3〕記録の対象 Issue 番号が対象と一致しない場合は拒否する", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a3-");
    const stub = await setupCaseIssue(fixture, 1);
    writeCloseAcceptanceRecord(fixture, 1, {
      issueNumber: 2,
      targetRevision: "2026-10-01T00:00:00Z",
      generatedAt: "2026-11-05T00:00:00Z",
      accepted: true,
    });
    const outcome = await closeViaEngine(stub, fixture, 1);
    expectRefusal(outcome, true, stub, 1);
    expect(outcome.detail).toContain("targets issue 2, not the requested issue 1");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("〔4〕判定が不成立（accepted=false）の場合は拒否する", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a4-");
    const stub = await setupCaseIssue(fixture, 1);
    writeCloseAcceptanceRecord(fixture, 1, {
      issueNumber: 1,
      targetRevision: stub.issues[0]?.updated_at ?? "",
      generatedAt: "2026-11-05T00:00:00Z",
      accepted: false,
    });
    const outcome = await closeViaEngine(stub, fixture, 1);
    expectRefusal(outcome, true, stub, 1);
    expect(outcome.detail).toContain("the judgment is not accepted");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("〔5〕判定対象版の不一致（過去の合格結果の再利用・issue_reopen後の旧記録）は拒否される", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a5-");
    const stub = await setupCaseIssue(fixture, 1);
    const firstRevision = stub.issues[0]?.updated_at ?? "";
    writeCloseAcceptanceRecord(fixture, 1, {
      issueNumber: 1,
      targetRevision: firstRevision,
      generatedAt: "2026-11-05T00:00:00Z",
      accepted: true,
    });
    const closed = await closeViaEngine(stub, fixture, 1);
    expect(closed.ok).toBe(true);
    // 再オープン後の旧記録: 対象版（updated_at）が再オープンで変化したため、
    // 過去の合格結果の再利用は拒否される。
    const runner = createCliRunner({ repo: "owner/repo", tempDir: makeTempDir("ts007-tmp-"), exec: stub.exec });
    const env = buildGhToolEnv(VALID_CONFIG, { tempDir: () => makeTempDir("ts007-tmp-") }, runner);
    if (!env.ok) throw new Error("env build failed");
    const reopened = await runAgentdevGhOperation(env.env, { operation: "issue_reopen", number: 1 }, {
      closeAcceptanceIo: fixture.io,
    });
    expect(reopened.ok).toBe(true);
    const refused = await closeViaEngine(stub, fixture, 1);
    expectRefusal(refused, false, stub, 1);
    expect(refused.detail).toContain("reusing a past acceptance result is refused");
    expect(refused.detail).toContain(firstRevision);
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("〔6〕worktree コンテキストからも main repo root 側の保存場所へ決定的に解決される", async () => {
    const parent = makeTempDir("ts007-repo-");
    const mainRoot = path.join(parent, "main");
    const worktreePath = path.join(parent, "wt");
    const git = (args: string[], cwd: string): void => {
      const r = spawnSync("git", args, { cwd, encoding: "utf8" });
      if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr}`);
    };
    fs.mkdirSync(mainRoot);
    git(["init"], mainRoot);
    git(["-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "--allow-empty", "-m", "init"], mainRoot);
    git(["worktree", "add", worktreePath, "HEAD"], mainRoot);
    const io = defaultCloseAcceptanceIo();
    const fromWorktree = resolveMainRepoRoot(io, worktreePath);
    const fromMain = resolveMainRepoRoot(io, mainRoot);
    expect(fromWorktree.ok).toBe(true);
    expect(fromMain.ok).toBe(true);
    if (fromWorktree.ok && fromMain.ok) {
      // Windows の temp パスは 8.3 表記・大文字小文字の表記ゆれがあるため、
      // 決定的解決の比較はケース非依存で行う。
      const normalize = (p: string): string => path.resolve(p).toLowerCase();
      expect(normalize(fromWorktree.root)).toBe(normalize(mainRoot));
      expect(normalize(fromMain.root)).toBe(normalize(mainRoot));
    }
    const recordPath = resolveCloseAcceptanceRecordPath(mainRoot, 12);
    expect(recordPath).toBe(path.join(mainRoot, ".agentdev", "close-acceptance", "issue-0012.json"));
    expect(closeAcceptanceRecordFileName(3932)).toBe("issue-3932.json");
    const revision = "2026-11-05T00:00:00.000Z";
    const fixture = { mainRoot, io };
    writeCloseAcceptanceRecord(fixture, 12, { issueNumber: 12, targetRevision: revision, generatedAt: "2026-11-05T01:00:00Z", accepted: true });
    const stub = createGitHubStub({ issues: [{ number: 12, title: "case", body: "body", state: "open", state_reason: null, labels: [], updated_at: revision }] });
    const cli = createCliRunner({ repo: "owner/repo", tempDir: parent, workspaceRoot: worktreePath, exec: stub.exec });
    expect((await cli.run({ operation: "issue_close", args: { number: 12 } })).ok).toBe(true);
    const issuesDir = path.join(worktreePath, ".agentdev", "issues");
    const local = createLocalRunner({ issuesDir, now: () => new Date(revision) });
    await local.run({ operation: "issue_create", args: { title: "case", body: "body", role: "case", labels: [] } });
    writeCloseAcceptanceRecord(fixture, 1, { issueNumber: 1, targetRevision: revision, generatedAt: "2026-11-05T01:00:00Z", accepted: true });
    expect((await local.run({ operation: "issue_close", args: { number: 1 } })).ok).toBe(true);
  });

  test("main repo root の解決不能は path-unresolvable として拒否する", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a7-");
    const stub = await setupCaseIssue(fixture, 1);
    const brokenIo: CloseAcceptanceFixture["io"] = {
      exists: () => false,
      readTextFile: () => "",
      gitCommonDir: () => null,
    };
    const outcome = await closeViaEngine(stub, fixture, 1, { closeAcceptanceIo: brokenIo });
    expect(outcome.ok).toBe(false);
    expect(outcome.kind).toBe("path-unresolvable");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("追跡Issue（tracking role）の終了に前提は適用されない", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a8-");
    const stub = createGitHubStub();
    const runner = createCliRunner({ repo: "owner/repo", tempDir: makeTempDir("ts007-tmp-"), exec: stub.exec });
    const env = buildGhToolEnv(VALID_CONFIG, { tempDir: () => makeTempDir("ts007-tmp-") }, runner);
    if (!env.ok) throw new Error("env build failed");
    const created = await runAgentdevGhOperation(env.env, {
      operation: "issue_create",
      title: "TS-007 追跡Issue",
      body: "本文",
      labels: [],
      role: "tracking",
    }, { closeAcceptanceIo: fixture.io });
    expect(created.ok).toBe(true);
    const outcome = await closeViaEngine(stub, fixture, 1);
    expect(outcome.ok).toBe(true);
    expect(stub.issues[0]?.state).toBe("closed");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("機械受理成立時のみ終了が実行され、検証成立時に終了の読み戻しまで確認される", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a9-");
    const stub = await setupCaseIssue(fixture, 1);
    const beforeClosed = await closeViaEngine(stub, fixture, 1);
    expect(beforeClosed.ok).toBe(false);
    expect(stub.issues[0]?.state).toBe("open");
    writeCloseAcceptanceRecord(fixture, 1, {
      issueNumber: 1,
      targetRevision: stub.issues[0]?.updated_at ?? "",
      generatedAt: "2026-11-05T00:00:00Z",
      accepted: true,
    });
    const closed = await closeViaEngine(stub, fixture, 1);
    expect(closed.ok).toBe(true);
    expect(stub.issues[0]?.state).toBe("closed");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("前提検査自体の異常終了は enforcement-crashed として成功扱いにならない", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a10-");
    const stub = await setupCaseIssue(fixture, 1);
    const crashingIo: CloseAcceptanceFixture["io"] = {
      exists: () => {
        throw new Error("io exploded");
      },
      readTextFile: () => "",
      gitCommonDir: () => path.join(fixture.mainRoot, ".git"),
    };
    const outcome = await closeViaEngine(stub, fixture, 1, { closeAcceptanceIo: crashingIo });
    expect(outcome.ok).toBe(false);
    expect(outcome.kind).toBe("enforcement-crashed");
    expect(stub.issues[0]?.state).toBe("open");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });

  test("対象 Issue の読み取り失敗は前提検証の失敗として対象副作用を実行しない", async () => {
    const fixture = makeCloseAcceptanceFixture("ts007-a11-");
    const stub = await setupCaseIssue(fixture, 1);
    const outcome = await closeViaEngine(stub, fixture, 999);
    expect(outcome.ok).toBe(false);
    expect(outcome.kind).toBe("operation-failed");
    fs.rmSync(fixture.mainRoot, { recursive: true, force: true });
  });
});

describe("終了判定記録の様式検証（parseCloseAcceptanceRecord）", () => {
  const baseRecord = {
    issueNumber: 3932,
    targetRevision: "2026-11-05T00:00:00Z",
    generatedAt: "2026-11-05T12:00:00Z",
    accepted: true,
  };

  test("Design 様式の4項目（対象 Issue 番号・判定対象版・判定生成時刻・判定内容）を検証する", () => {
    const parsed = parseCloseAcceptanceRecord(JSON.stringify(baseRecord));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.record.issueNumber).toBe(3932);
      expect(parsed.record.targetRevision).toBe("2026-11-05T00:00:00Z");
      expect(parsed.record.generatedAt).toBe("2026-11-05T12:00:00Z");
      expect(parsed.record.accepted).toBe(true);
    }
  });

  test("機械工程の報告詳細などの追加項目は様式束縛の対象外として受理する", () => {
    const parsed = parseCloseAcceptanceRecord(JSON.stringify({
      ...baseRecord,
      closeReviewReport: { worktree: "feature/issue-3932", verificationRows: 3 },
    }));
    expect(parsed.ok).toBe(true);
  });

  test("旧様式相当（旧台帳照合の結果のみを含み判定内容 accepted を含まない記録）は受理しない", () => {
    const parsed = parseCloseAcceptanceRecord(JSON.stringify({
      issueNumber: 3932,
      targetRevision: "2026-11-05T00:00:00Z",
      generatedAt: "2026-11-05T12:00:00Z",
      verificationResources: { state: "confirmed-empty", entries: [] },
    }));
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.detail).toContain("requires a boolean accepted");
    }
  });

  test.each([
    ["JSON 割れ", "not-json"],
    ["配列", "[]"],
    ["issueNumber 欠落", { targetRevision: "r", generatedAt: "2026-11-05T00:00:00Z", accepted: true }],
    ["issueNumber 非整数", { ...baseRecord, issueNumber: 1.5 }],
    ["targetRevision 欠落", { issueNumber: 1, generatedAt: "2026-11-05T00:00:00Z", accepted: true }],
    ["targetRevision 空", { ...baseRecord, targetRevision: "" }],
    ["generatedAt 非 ISO 8601", { ...baseRecord, generatedAt: "2026/11/05" }],
    ["accepted 非 boolean", { ...baseRecord, accepted: "yes" }],
  ])("様式不正（%s）は拒否する", (_label, raw) => {
    const parsed = parseCloseAcceptanceRecord(typeof raw === "string" ? raw : JSON.stringify(raw));
    expect(parsed.ok).toBe(false);
  });
});
