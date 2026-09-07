// Local 実装（LocalRunner）のテスト。
//
// 一時ディレクトリでローカルIssue（.agentdev/issues/issue-{NNNN}.md）の読み書きを
// 検証する（実環境に触れない）。検証観点: 単一採番空間、role 条件付きスキーマ
// （status 値域、labels 値域、closed_at 条件、許可操作）、role 分岐のコメント
// 読み替え、PR 系操作の role: case 限定、engine 経由の VERIFY 読み戻し。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createLocalRunner,
  validateLocalIssue,
  type LocalIssueFrontmatter,
} from "../runner-local.ts";
import { buildGhToolEnv, type GhToolEnv } from "../../../opencode/tools/agentdev-gh/engine.ts";
import { runAgentdevGhOperation } from "../../../opencode/tools/agentdev-gh/index.ts";
import type { GhRunnerReply, GhRunnerRequest } from "../../../opencode/tools/agentdev-gh/runner.ts";

function makeIssuesDir(): string {
  return fs.mkdtempSync(path.join(import.meta.dir, "tmp-local-runner-"));
}

function makeEnv(issuesDir: string): GhToolEnv {
  const runner = createLocalRunner({ issuesDir });
  const result = buildGhToolEnv(
    { repo: "local/issues" },
    { tempDir: () => path.join(issuesDir, "..", "tmp") },
    runner,
  );
  if (!result.ok) throw new Error("env build failed");
  return result.env;
}

async function run(issuesDir: string, request: GhRunnerRequest): Promise<GhRunnerReply> {
  const runner = createLocalRunner({ issuesDir });
  return runner.run(request);
}

function readIssueFile(issuesDir: string, n: number): string {
  return fs.readFileSync(path.join(issuesDir, `issue-${String(n).padStart(4, "0")}.md`), "utf8");
}

function baseFm(overrides: Partial<LocalIssueFrontmatter>): LocalIssueFrontmatter {
  return {
    id: "issue-0001",
    title: "件名",
    role: "case",
    status: "open",
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
    closed_at: "",
    labels: [],
    ...overrides,
  };
}

describe("LocalRunner: ローカルIssueの作成と採番", () => {
  test("issue_create は role: case のローカルIssueを採番どおり作成する（LF、BOM なし）", async () => {
    const issuesDir = makeIssuesDir();
    const reply = await run(issuesDir, {
      operation: "issue_create",
      args: { title: "件名", body: "## 目的\n\n本文", labels: ["feature"], role: "case" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.number).toBe(1);
      expect(String(payload.url)).toContain("issue-0001.md");
    }
    const raw = readIssueFile(issuesDir, 1);
    expect(raw.startsWith("---\n")).toBe(true);
    expect(raw).toContain("id: issue-0001");
    expect(raw).toContain('title: "件名"');
    expect(raw).toContain("role: case");
    expect(raw).toContain("status: open");
    expect(raw).toContain('closed_at: ""');
    expect(raw).toContain("labels: [feature]");
    expect(raw).toContain("## 目的");
    expect(raw.includes("\r\n")).toBe(false);
    const bytes = fs.readFileSync(path.join(issuesDir, "issue-0001.md"));
    expect(bytes[0]).toBe(0x2d); // '-'（BOM 0xEF でない）
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_create は role: tracking を kind 付きで作成し初期状態 起票 を与える", async () => {
    const issuesDir = makeIssuesDir();
    const reply = await run(issuesDir, {
      operation: "issue_create",
      args: { title: "リスク", body: "本文", labels: [], role: "tracking", kind: "risk" },
    });
    expect(reply.ok).toBe(true);
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toContain("role: tracking");
    expect(raw).toContain("status: created");
    expect(raw).toContain("labels: [risk]");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("tracking の issue_create は kind 欠落を拒否する", async () => {
    const issuesDir = makeIssuesDir();
    const reply = await run(issuesDir, {
      operation: "issue_create",
      args: { title: "無印", body: "本文", labels: [], role: "tracking" },
    });
    expect(reply.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("採番は role をまたぐ単一空間（既存最大 + 1、欠番再利用なし）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "A", body: "a", labels: [], role: "case" } });
    await run(issuesDir, { operation: "issue_create", args: { title: "B", body: "b", labels: [], role: "tracking", kind: "task" } });
    fs.rmSync(path.join(issuesDir, "issue-0001.md"));
    const reply = await run(issuesDir, {
      operation: "issue_create",
      args: { title: "C", body: "c", labels: [], role: "case" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).number).toBe(3);
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: role 条件付きスキーマの機械検証", () => {
  test("tracking の status は 6状態値域からのみ選択される", () => {
    for (const status of ["created", "in-discussion", "on-hold", "ready", "resolved"]) {
      expect(
        validateLocalIssue(baseFm({ role: "tracking", status, labels: ["problem"] }), "issue-0001.md").valid,
      ).toBe(true);
    }
    expect(
      validateLocalIssue(
        baseFm({ role: "tracking", status: "closed", labels: ["problem"], closed_at: "2026-08-25T00:00:00Z" }),
        "issue-0001.md",
      ).valid,
    ).toBe(true);
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "running", labels: ["problem"] }), "issue-0001.md").valid,
    ).toBe(false);
  });

  test("tracking の labels は kind 4値からちょうど1つを要求する", () => {
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "created", labels: ["risk"] }), "issue-0001.md").valid,
    ).toBe(true);
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "created", labels: [] }), "issue-0001.md").valid,
    ).toBe(false);
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "created", labels: ["risk", "task"] }), "issue-0001.md").valid,
    ).toBe(false);
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "created", labels: ["feature"] }), "issue-0001.md").valid,
    ).toBe(false);
  });

  test("case の status と labels は case 値域から選択される", () => {
    expect(validateLocalIssue(baseFm({ status: "review", labels: ["epic"] }), "issue-0001.md").valid).toBe(true);
    expect(validateLocalIssue(baseFm({ status: "created", labels: [] }), "issue-0001.md").valid).toBe(false);
    expect(validateLocalIssue(baseFm({ status: "open", labels: ["risk"] }), "issue-0001.md").valid).toBe(false);
  });

  test("closed_at は role ごとの終端状態でのみ値を持つ", () => {
    expect(
      validateLocalIssue(
        baseFm({ role: "tracking", status: "closed", labels: ["idea"], closed_at: "2026-08-25T00:00:00Z" }),
        "issue-0001.md",
      ).valid,
    ).toBe(true);
    expect(
      validateLocalIssue(baseFm({ role: "tracking", status: "created", labels: ["idea"], closed_at: "x" }), "issue-0001.md")
        .valid,
    ).toBe(false);
    expect(
      validateLocalIssue(baseFm({ status: "cancelled", closed_at: "2026-08-25T00:00:00Z" }), "issue-0001.md").valid,
    ).toBe(true);
    expect(validateLocalIssue(baseFm({ status: "review", closed_at: "x" }), "issue-0001.md").valid).toBe(false);
  });

  test("id は issue-{NNNN} 形式でファイル名と一致する", () => {
    expect(validateLocalIssue(baseFm({ id: "issue-0042" }), "issue-0042.md").valid).toBe(true);
    expect(validateLocalIssue(baseFm({ id: "case-0042" }), "issue-0042.md").valid).toBe(false);
    expect(validateLocalIssue(baseFm({ id: "issue-42" }), "issue-0042.md").valid).toBe(false);
  });
});

describe("LocalRunner: issue_read / issue_update / issue_list", () => {
  test("issue_read は全文と role メタデータを state 写像付きで返す", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "保留中", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, trackingState: "on-hold" },
    });
    const reply = await run(issuesDir, { operation: "issue_read", args: { number: 1 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.state).toBe("open");
      expect(payload.role).toBe("tracking");
      expect(payload.kind).toBe("problem");
      expect(payload.trackingState).toBe("on-hold");
      expect(String(payload.body).startsWith("---\n")).toBe(true);
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_update の trackingState は追跡Issue以外へ適用できず、終端状態は拒否する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "C", body: "b", labels: [], role: "case" } });
    const onCase = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, trackingState: "resolved" },
    });
    expect(onCase.ok).toBe(false);

    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "b", labels: [], role: "tracking", kind: "idea" },
    });
    const terminal = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 2, trackingState: "closed" },
    });
    expect(terminal.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_update の body はローカルIssue全文を反映し、スキーマ違反を拒否する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "C", body: "b", labels: [], role: "case" } });
    const current = await run(issuesDir, { operation: "issue_read", args: { number: 1 } });
    expect(current.ok).toBe(true);
    const raw = (current.ok ? current.payload as Record<string, unknown> : {}).body as string;
    const next = raw.replace("status: open", "status: running").replace(
      'updated_at: "',
      'updated_at: "',
    );
    const updated = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, body: next },
    });
    expect(updated.ok).toBe(true);
    expect(readIssueFile(issuesDir, 1)).toContain("status: running");

    const invalid = next.replace("role: case", "role: tracking");
    const rejected = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, body: invalid },
    });
    expect(rejected.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_update の labels は role 値域で検証される", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "C", body: "b", labels: [], role: "case" } });
    const ok = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, labels: ["maintenance"] },
    });
    expect(ok.ok).toBe(true);
    expect(readIssueFile(issuesDir, 1)).toContain("labels: [maintenance]");
    const ng = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 1, labels: ["risk"] },
    });
    expect(ng.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_list は role/kind/trackingState/state で絞り込む", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "Case A", body: "b", labels: ["feature"], role: "case" } });
    await run(issuesDir, { operation: "issue_create", args: { title: "保留", body: "b", labels: [], role: "tracking", kind: "problem" } });
    await run(issuesDir, { operation: "issue_update", args: { number: 2, trackingState: "on-hold" } });
    await run(issuesDir, { operation: "issue_create", args: { title: "解決", body: "b", labels: [], role: "tracking", kind: "idea" } });
    await run(issuesDir, { operation: "issue_update", args: { number: 3, trackingState: "resolved" } });

    const tracking = await run(issuesDir, { operation: "issue_list", args: { role: "tracking" } });
    expect(tracking.ok).toBe(true);
    if (tracking.ok) {
      const issues = (tracking.payload as Record<string, unknown>).issues as Record<string, unknown>[];
      expect(issues.map((i) => i.number)).toEqual([2, 3]);
    }
    const onHold = await run(issuesDir, {
      operation: "issue_list",
      args: { role: "tracking", trackingState: "on-hold" },
    });
    expect(onHold.ok).toBe(true);
    if (onHold.ok) {
      const issues = (onHold.payload as Record<string, unknown>).issues as Record<string, unknown>[];
      expect(issues.map((i) => i.number)).toEqual([2]);
    }
    const risky = await run(issuesDir, { operation: "issue_list", args: { kind: "risk" } });
    expect(risky.ok).toBe(true);
    if (risky.ok) {
      const issues = (risky.payload as Record<string, unknown>).issues as Record<string, unknown>[];
      expect(issues.length).toBe(0);
    }
    const cases = await run(issuesDir, { operation: "issue_list", args: { role: "case" } });
    expect(cases.ok).toBe(true);
    if (cases.ok) {
      const issues = (cases.payload as Record<string, unknown>).issues as Record<string, unknown>[];
      expect(issues.map((i) => i.number)).toEqual([1]);
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: コメントの role 分岐", () => {
  test("tracking は検討経過へ日時エントリで追記し、読取は時系列を返す", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    const first = await run(issuesDir, {
      operation: "issue_comment",
      args: { number: 1, body: "1件目の検討" },
    });
    expect(first.ok).toBe(true);
    const second = await run(issuesDir, {
      operation: "issue_comment",
      args: { number: 1, body: "2件目の検討" },
    });
    expect(second.ok).toBe(true);
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toContain("## 検討経過");
    expect((raw.match(/### 20/g) ?? []).length).toBe(2);
    expect(raw.indexOf("1件目の検討")).toBeLessThan(raw.indexOf("2件目の検討"));

    const read = await run(issuesDir, { operation: "issue_comment", args: { number: 1 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      const comments = (read.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.length).toBe(2);
      expect(comments[0]?.body).toContain("1件目の検討");
      expect(comments[1]?.body).toContain("2件目の検討");
      expect(typeof comments[0]?.createdAt).toBe("string");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("case は作業ログへ追記し、読取はセクション本文を1件で返す", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "C", body: "b", labels: [], role: "case" } });
    const added = await run(issuesDir, {
      operation: "issue_comment",
      args: { number: 1, body: "作業を開始した" },
    });
    expect(added.ok).toBe(true);
    expect(readIssueFile(issuesDir, 1)).toContain("## 作業ログ");
    const read = await run(issuesDir, { operation: "issue_comment", args: { number: 1 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      const comments = (read.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.length).toBe(1);
      expect(String(comments[0]?.body)).toContain("作業を開始した");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: クローズと再オープン", () => {
  test("tracking の close は両 reason で クローズ済み へ遷移する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "b", labels: [], role: "tracking", kind: "task" },
    });
    const completed = await run(issuesDir, {
      operation: "issue_close",
      args: { number: 1, reason: "completed" },
    });
    expect(completed.ok).toBe(true);
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toContain("status: closed");
    expect(raw).not.toContain('closed_at: ""');
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("case の close は reason で closed / cancelled を書き分ける", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "A", body: "b", labels: [], role: "case" } });
    await run(issuesDir, { operation: "issue_create", args: { title: "B", body: "b", labels: [], role: "case" } });
    await run(issuesDir, { operation: "issue_close", args: { number: 1, reason: "not_planned" } });
    await run(issuesDir, { operation: "issue_close", args: { number: 2 } });
    expect(readIssueFile(issuesDir, 1)).toContain("status: cancelled");
    expect(readIssueFile(issuesDir, 2)).toContain("status: closed");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("issue_reopen は tracking の クローズ済み から再検討へ戻し、case は拒否する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "b", labels: [], role: "tracking", kind: "problem" },
    });
    await run(issuesDir, { operation: "issue_close", args: { number: 1 } });
    const reopened = await run(issuesDir, { operation: "issue_reopen", args: { number: 1 } });
    expect(reopened.ok).toBe(true);
    if (reopened.ok) {
      expect((reopened.payload as Record<string, unknown>).state).toBe("open");
    }
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toContain("status: in-discussion");
    expect(raw).toContain('closed_at: ""');

    await run(issuesDir, { operation: "issue_create", args: { title: "C", body: "b", labels: [], role: "case" } });
    const caseReopen = await run(issuesDir, { operation: "issue_reopen", args: { number: 2 } });
    expect(caseReopen.ok).toBe(false);

    const notClosed = await run(issuesDir, { operation: "issue_reopen", args: { number: 1 } });
    expect(notClosed.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: PR 系操作の role: case 限定", () => {
  test("PR 系操作は role: tracking への適用を拒否する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "b", labels: [], role: "tracking", kind: "problem" },
    });
    for (const request of [
      { operation: "pr_create", args: { title: "P", body: "b", base: "main", head: "f", number: 1 } },
      { operation: "pr_read", args: { number: 1 } },
      { operation: "pr_merge", args: { number: 1, method: "squash" } },
      { operation: "pr_changed_files", args: { number: 1 } },
      { operation: "pr_mergeable", args: { number: 1 } },
    ] as GhRunnerRequest[]) {
      const reply = await run(issuesDir, request);
      expect(reply.ok).toBe(false);
      if (!reply.ok) expect(reply.error).toContain("role: case");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("pr_create は番号指定がなくても最新の role: case ローカルIssueを対象にする", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "Case", body: "b", labels: [], role: "case" } });
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "Tracking", body: "b", labels: [], role: "tracking", kind: "idea" },
    });
    const reply = await run(issuesDir, {
      operation: "pr_create",
      args: { title: "PR", body: "本文", base: "main", head: "feature/x" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).number).toBe(1);
    }
    expect(readIssueFile(issuesDir, 1)).toContain("### PR title: PR");
    expect(readIssueFile(issuesDir, 2)).not.toContain("### PR title: PR");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("pr_merge はマージ結果セクションへ記録する（REQ-009-033 の記録経路）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "Case", body: "b", labels: [], role: "case" } });
    await run(issuesDir, {
      operation: "pr_create",
      args: { title: "PR", body: "本文", base: "main", head: "feature/x" },
    });
    const merged = await run(issuesDir, { operation: "pr_merge", args: { number: 1, method: "squash" } });
    expect(merged.ok).toBe(true);
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toContain("## マージ結果");
    expect(raw).toContain("結果: PASS");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("失敗時の取り込み結果と status: blocked は issue_update 全文反映で記録できる", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, { operation: "issue_create", args: { title: "Case", body: "b", labels: [], role: "case" } });
    const current = await run(issuesDir, { operation: "issue_read", args: { number: 1 } });
    const raw = (current.ok ? current.payload as Record<string, unknown> : {}).body as string;
    const withFail = `${raw.replace(/\n+$/, "")}\n\n## マージ結果\n\n- 操作: ローカル取り込み\n- 実行日時: 2026-08-25T00:00:00Z\n- 結果: FAIL\n`.replace(
      "status: open",
      "status: blocked",
    );
    const updated = await run(issuesDir, { operation: "issue_update", args: { number: 1, body: withFail } });
    expect(updated.ok).toBe(true);
    const after = readIssueFile(issuesDir, 1);
    expect(after).toContain("status: blocked");
    expect(after).toContain("結果: FAIL");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: engine 経由の VERIFY（追跡Issueライフサイクル）", () => {
  test("起票→保留→解決→コメント→クローズ→再オープンが読み戻し検証を通る", async () => {
    const issuesDir = makeIssuesDir();
    const env = makeEnv(issuesDir);

    const created = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "様子見の論点",
      body: "## 背景\n\n本文",
      labels: [],
      role: "tracking",
      kind: "risk",
    });
    expect(created.ok).toBe(true);

    const held = await runAgentdevGhOperation(env, {
      operation: "issue_update",
      number: 1,
      trackingState: "on-hold",
    });
    expect(held.ok).toBe(true);

    const commented = await runAgentdevGhOperation(env, {
      operation: "issue_comment",
      number: 1,
      body: "再評価条件が成立した",
    });
    expect(commented.ok).toBe(true);

    const resolved = await runAgentdevGhOperation(env, {
      operation: "issue_update",
      number: 1,
      trackingState: "resolved",
    });
    expect(resolved.ok).toBe(true);

    const readResolved = await runAgentdevGhOperation(env, {
      operation: "issue_read",
      number: 1,
    });
    expect(readResolved.ok).toBe(true);
    if (readResolved.ok && readResolved.success.operation === "issue_read") {
      const s = readResolved.success;
      expect(s.trackingState).toBe("resolved");
      expect(s.state).toBe("open");
    }

    const closed = await runAgentdevGhOperation(env, {
      operation: "issue_close",
      number: 1,
      reason: "completed",
    });
    expect(closed.ok).toBe(true);

    const readClosed = await runAgentdevGhOperation(env, {
      operation: "issue_read",
      number: 1,
    });
    expect(readClosed.ok).toBe(true);
    if (readClosed.ok && readClosed.success.operation === "issue_read") {
      const s = readClosed.success;
      expect(s.state).toBe("closed");
      expect(s.trackingState).toBe("closed");
    }

    const reopened = await runAgentdevGhOperation(env, {
      operation: "issue_reopen",
      number: 1,
    });
    expect(reopened.ok).toBe(true);

    const readReopened = await runAgentdevGhOperation(env, {
      operation: "issue_read",
      number: 1,
    });
    expect(readReopened.ok).toBe(true);
    if (readReopened.ok && readReopened.success.operation === "issue_read") {
      const s = readReopened.success;
      expect(s.state).toBe("open");
      expect(s.trackingState).toBe("in-discussion");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});
