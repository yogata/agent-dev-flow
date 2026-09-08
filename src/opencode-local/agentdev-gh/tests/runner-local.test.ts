// ADF-COVERS(verification): REQ-011-024, REQ-011-025, REQ-011-026, REQ-011-027, REQ-011-030
// Local 実装（LocalRunner）のテスト。
//
// 一時ディレクトリでローカルIssue（.agentdev/issues/issue-{NNNN}.md）の読み書きを
// 検証する（実環境に触れない）。検証観点: 単一採番空間、role 条件付きスキーマ
// （status 値域、labels 値域、closed_at 条件、許可操作）、Comment CRUD の c{NN}
// 物理写像（commentId、comment_seq 最高水位標、旧形式冪等移行、c01 束ね、原子的書込み、
// UTF-8 BOM なし）、論理 PR 本文（3セクション直列化と PR タイトル行）の round-trip、
// PR 系操作の role: case 限定、engine 経由の VERIFY 読み戻し。


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

describe("LocalRunner: Comment CRUD（c{NN} 物理写像）", () => {
  test("comment_create は commentId（文字列）を返し、comment_list で本文が読み戻し一致する（TS-004）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    const created = await run(issuesDir, {
      operation: "comment_create",
      args: { number: 1, body: "1件目の検討\n複数行" },
    });
    expect(created.ok).toBe(true);
    if (created.ok) {
      const payload = created.payload as Record<string, unknown>;
      expect(typeof payload.commentId).toBe("string");
      expect(payload.commentId).toBe("issue-0001-c01");
      expect(String(payload.url)).toContain("issue-0001.md");
    }
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.length).toBe(1);
      expect(comments[0]?.commentId).toBe("issue-0001-c01");
      expect(comments[0]?.body).toBe("1件目の検討\n複数行");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("comment_list の要素は commentId/body/createdAt/updatedAt/url を過不足なく返し、未更新は updatedAt=createdAt（TS-005・両 role）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "C", body: "b", labels: ["feature"], role: "case" },
    });
    for (const number of [1, 2]) {
      await run(issuesDir, { operation: "comment_create", args: { number, body: "コメント" } });
      const listed = await run(issuesDir, { operation: "comment_list", args: { number } });
      expect(listed.ok).toBe(true);
      if (listed.ok) {
        const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
        expect(comments.length).toBe(1);
        expect(Object.keys(comments[0] ?? {}).sort()).toEqual(
          ["body", "commentId", "createdAt", "updatedAt", "url"].sort(),
        );
        expect(comments[0]?.createdAt).toBe(comments[0]?.updatedAt);
      }
    }
    const trackingRaw = readIssueFile(issuesDir, 1);
    expect(trackingRaw).toContain("### c01 ");
    expect(trackingRaw).toContain("## 検討経過");
    const caseRaw = readIssueFile(issuesDir, 2);
    expect(caseRaw).toContain("### c01 ");
    expect(caseRaw).toContain("## 作業ログ");
    expect(caseRaw).toContain("comment_seq: 1");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("comment_update は対象 commentId のみ更新し、他コメントは不変で読み戻し一致する（TS-006）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "task" },
    });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "1件目" } });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "2件目" } });
    const updated = await run(issuesDir, {
      operation: "comment_update",
      args: { commentId: "issue-0001-c01", body: "1件目（修正）" },
    });
    expect(updated.ok).toBe(true);
    if (updated.ok) {
      const payload = updated.payload as Record<string, unknown>;
      expect(payload.commentId).toBe("issue-0001-c01");
      expect(payload.number).toBe(1);
    }
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.map((c) => c.commentId)).toEqual(["issue-0001-c01", "issue-0001-c02"]);
      expect(comments[0]?.body).toBe("1件目（修正）");
      expect(comments[1]?.body).toBe("2件目");
      expect(String(comments[1]?.createdAt)).toBe(String(comments[1]?.updatedAt));
    }
    const raw = readIssueFile(issuesDir, 1);
    expect(raw).toMatch(/### c01 \S+ \(updated \S+\)/);
    expect(raw).toContain("comment_seq: 2");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("comment_delete 後に対象が comment_list に存在せず他は保持され、欠番は再利用されない（TS-007）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "idea" },
    });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "1件目" } });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "2件目" } });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "3件目" } });
    const removed = await run(issuesDir, {
      operation: "comment_delete",
      args: { commentId: "issue-0001-c02" },
    });
    expect(removed.ok).toBe(true);
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.map((c) => c.commentId)).toEqual(["issue-0001-c01", "issue-0001-c03"]);
    }
    const next = await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "4件目" } });
    expect(next.ok).toBe(true);
    if (next.ok) {
      expect((next.payload as Record<string, unknown>).commentId).toBe("issue-0001-c04");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("実ファイルで35件コメントのローカルIssueから comment_list が全件返却する（TS-008 Local 分）", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "C", body: "b", labels: [], role: "case" },
    });
    for (let i = 1; i <= 35; i++) {
      const reply = await run(issuesDir, {
        operation: "comment_create",
        args: { number: 1, body: `作業ログ ${i}` },
      });
      expect(reply.ok).toBe(true);
    }
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.length).toBe(35);
      expect(comments[0]?.commentId).toBe("issue-0001-c01");
      expect(comments[34]?.commentId).toBe("issue-0001-c35");
      expect(comments[34]?.body).toBe("作業ログ 35");
    }
    expect(readIssueFile(issuesDir, 1)).toContain("comment_seq: 35");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("コメント書込は原子的（一時ファイル残留なし）で UTF-8（BOM なし）・LF を保持する", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "日本語コメント" } });
    await run(issuesDir, { operation: "comment_update", args: { commentId: "issue-0001-c01", body: "修正コメント" } });
    await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "追加" } });
    await run(issuesDir, { operation: "comment_delete", args: { commentId: "issue-0001-c02" } });
    const residue = fs.readdirSync(issuesDir).filter((f) => f.endsWith(".tmp"));
    expect(residue).toEqual([]);
    const file = path.join(issuesDir, "issue-0001.md");
    const bytes = fs.readFileSync(file);
    expect(bytes[0]).toBe(0x2d); // '-'（BOM 0xEF でない）
    const raw = fs.readFileSync(file, "utf8");
    expect(raw).toContain("修正コメント");
    expect(raw).not.toContain("追加");
    expect(raw.includes("\r\n")).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("旧形式（### {ISO 8601}）エントリは最初のコメント書込で冪等移行し、採番は単調増加する", async () => {
    const issuesDir = makeIssuesDir();
    fs.writeFileSync(
      path.join(issuesDir, "issue-0001.md"),
      [
        "---",
        'id: issue-0001',
        'title: "旧形式"',
        "role: tracking",
        "status: in-discussion",
        'created_at: "2026-08-25T00:00:00Z"',
        'updated_at: "2026-08-25T00:00:00Z"',
        'closed_at: ""',
        "labels: [problem]",
        "---",
        "",
        "## 本文",
        "",
        "内容",
        "",
        "## 検討経過",
        "",
        "### 2026-08-25T01:00:00Z",
        "",
        "1件目（旧形式）",
        "",
        "### 2026-08-25T02:00:00Z",
        "",
        "2件目（旧形式）",
        "",
      ].join("\n") + "\n",
      "utf8",
    );
    const derived = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(derived.ok).toBe(true);
    if (derived.ok) {
      const comments = (derived.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.map((c) => c.commentId)).toEqual(["issue-0001-c01", "issue-0001-c02"]);
      expect(comments[0]?.createdAt).toBe("2026-08-25T01:00:00Z");
    }
    expect(readIssueFile(issuesDir, 1)).not.toContain("comment_seq");
    const created = await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "3件目" } });
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect((created.payload as Record<string, unknown>).commentId).toBe("issue-0001-c03");
    }
    const migrated = readIssueFile(issuesDir, 1);
    expect(migrated).toContain("### c01 2026-08-25T01:00:00Z");
    expect(migrated).toContain("### c02 2026-08-25T02:00:00Z");
    expect(migrated).toContain("### c03 ");
    expect(migrated).toContain("comment_seq: 3");
    expect(migrated).not.toContain("### 2026-08-25T01:00:00Z\n");
    // 冪等性: 移行済みファイルへの追加書込で既存採番は変化しない。
    const again = await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "4件目" } });
    expect(again.ok).toBe(true);
    const remigrated = readIssueFile(issuesDir, 1);
    expect(remigrated).toContain("### c01 2026-08-25T01:00:00Z");
    expect(remigrated).toContain("comment_seq: 4");
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.map((c) => c.commentId)).toEqual([
        "issue-0001-c01",
        "issue-0001-c02",
        "issue-0001-c03",
        "issue-0001-c04",
      ]);
      expect(comments[0]?.body).toBe("1件目（旧形式）");
      expect(comments[1]?.body).toBe("2件目（旧形式）");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("role: case の無区切り作業ログは初回コメント操作時に c01 へ束ねられ、新規は c02 以降に採番される", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: {
        title: "C",
        body: ["## 背景", "", "本文", "", "## 作業ログ", "", "過去の作業記録A", "過去の作業記録B", ""].join("\n"),
        labels: ["feature"],
        role: "case",
      },
    });
    const derived = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(derived.ok).toBe(true);
    if (derived.ok) {
      const comments = (derived.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.length).toBe(1);
      expect(comments[0]?.commentId).toBe("issue-0001-c01");
      expect(String(comments[0]?.body)).toContain("過去の作業記録A");
      expect(String(comments[0]?.body)).toContain("過去の作業記録B");
    }
    const created = await run(issuesDir, { operation: "comment_create", args: { number: 1, body: "新規コメント" } });
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect((created.payload as Record<string, unknown>).commentId).toBe("issue-0001-c02");
    }
    const raw = readIssueFile(issuesDir, 1);
    expect(raw.indexOf("過去の作業記録A")).toBeLessThan(raw.indexOf("新規コメント"));
    expect(raw).toContain("comment_seq: 2");
    const listed = await run(issuesDir, { operation: "comment_list", args: { number: 1 } });
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      const comments = (listed.payload as Record<string, unknown>).comments as Record<string, unknown>[];
      expect(comments.map((c) => c.commentId)).toEqual(["issue-0001-c01", "issue-0001-c02"]);
      expect(comments[0]?.body).toBe("過去の作業記録A\n過去の作業記録B");
      expect(comments[1]?.body).toBe("新規コメント");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("存在しない対象への Comment 操作は operation-failed、commentId 形式違反は invalid-input", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "T", body: "本文", labels: [], role: "tracking", kind: "problem" },
    });
    const missingIssue = await run(issuesDir, { operation: "comment_list", args: { number: 9 } });
    expect(missingIssue.ok).toBe(false);
    if (!missingIssue.ok) expect(missingIssue.failureClass).toBe("operation-failed");
    const missingComment = await run(issuesDir, {
      operation: "comment_update",
      args: { commentId: "issue-0001-c99", body: "x" },
    });
    expect(missingComment.ok).toBe(false);
    if (!missingComment.ok) expect(missingComment.failureClass).toBe("operation-failed");
    const badFormat = await run(issuesDir, {
      operation: "comment_delete",
      args: { commentId: "999" },
    });
    expect(badFormat.ok).toBe(false);
    if (!badFormat.ok) expect(badFormat.failureClass).toBe("invalid-input");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: 論理 PR 本文（3セクション直列化と PR タイトル行）", () => {
  function caseIssueBody(): string {
    return [
      "## 背景",
      "",
      "Case 本文",
      "",
      "## Design確定候補",
      "",
      "- 候補1",
      "",
      "## Findings / Capture候補",
      "",
      "### intake",
      "",
      "- なし",
      "",
      "### learning",
      "",
      "- なし",
      "",
    ].join("\n");
  }

  async function setupPrIssue(issuesDir: string): Promise<void> {
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "C", body: caseIssueBody(), labels: ["feature"], role: "case" },
    });
    await run(issuesDir, {
      operation: "pr_create",
      args: { title: "旧タイトル", body: "マージ前確認本文", base: "main", head: "feature/x", number: 1 },
    });
  }

  test("pr_read は3セクションの定義順直列化を body として返す（TS-010 前提）", async () => {
    const issuesDir = makeIssuesDir();
    await setupPrIssue(issuesDir);
    const read = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      const payload = read.payload as Record<string, unknown>;
      expect(payload.title).toBe("旧タイトル");
      const body = String(payload.body);
      expect(body.indexOf("## マージ前確認")).toBeLessThan(body.indexOf("## Design確定候補"));
      expect(body.indexOf("## Design確定候補")).toBeLessThan(body.indexOf("## Findings / Capture候補"));
      expect(body).toContain("### PR title: 旧タイトル");
      expect(body).toContain("マージ前確認本文");
      expect(body).toContain("### intake");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("(a) title のみ / (b) body のみ / (c) 両方の pr_update が pr_read で round-trip 保持する（TS-010 Local 分）", async () => {
    const issuesDir = makeIssuesDir();
    await setupPrIssue(issuesDir);

    const before = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(before.ok).toBe(true);
    const beforeBody = String((before.ok ? before.payload as Record<string, unknown> : {}).body);

    const titleOnly = await run(issuesDir, {
      operation: "pr_update",
      args: { number: 1, title: "新タイトル" },
    });
    expect(titleOnly.ok).toBe(true);
    const afterTitle = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(afterTitle.ok).toBe(true);
    if (afterTitle.ok) {
      const payload = afterTitle.payload as Record<string, unknown>;
      expect(payload.title).toBe("新タイトル");
      expect(String(payload.body)).toBe(
        beforeBody.replace("### PR title: 旧タイトル", "### PR title: 新タイトル"),
      );
    }

    const expectedAfterBody = beforeBody
      .replace("### PR title: 旧タイトル", "### PR title: 新タイトル")
      .replace("マージ前確認本文", "更新後本文");
    const bodyOnly = await run(issuesDir, {
      operation: "pr_update",
      args: { number: 1, body: expectedAfterBody },
    });
    expect(bodyOnly.ok).toBe(true);
    const afterBody = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(afterBody.ok).toBe(true);
    if (afterBody.ok) {
      const payload = afterBody.payload as Record<string, unknown>;
      expect(payload.title).toBe("新タイトル");
      expect(String(payload.body)).toBe(expectedAfterBody);
    }

    const nextBody = String((afterBody.ok ? afterBody.payload as Record<string, unknown> : {}).body);
    const expectedAfterBoth = nextBody
      .replace("### PR title: 新タイトル", "### PR title: 最終タイトル")
      .replace("- 候補1", "- 候補1（確定）");
    const both = await run(issuesDir, {
      operation: "pr_update",
      args: { number: 1, title: "最終タイトル", body: expectedAfterBoth },
    });
    expect(both.ok).toBe(true);
    const afterBoth = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(afterBoth.ok).toBe(true);
    if (afterBoth.ok) {
      const payload = afterBoth.payload as Record<string, unknown>;
      expect(payload.title).toBe("最終タイトル");
      expect(String(payload.body)).toBe(expectedAfterBoth);
    }
    // PR タイトル行の置換は frontmatter の title（ローカルIssue側タイトル）を変更しない。
    expect(readIssueFile(issuesDir, 1)).toContain('title: "C"');
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("マージ前確認セクション不在時は pr_read / pr_update が operation-failed になる", async () => {
    const issuesDir = makeIssuesDir();
    await run(issuesDir, {
      operation: "issue_create",
      args: { title: "C", body: caseIssueBody(), labels: ["feature"], role: "case" },
    });
    const read = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(read.ok).toBe(false);
    if (!read.ok) expect(read.failureClass).toBe("operation-failed");
    const update = await run(issuesDir, { operation: "pr_update", args: { number: 1, title: "x" } });
    expect(update.ok).toBe(false);
    if (!update.ok) expect(update.failureClass).toBe("operation-failed");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("PR タイトルの正は最後の マージ前確認 セクション内のタイトル行に統一される", async () => {
    const issuesDir = makeIssuesDir();
    await setupPrIssue(issuesDir);
    await run(issuesDir, {
      operation: "pr_create",
      args: { title: "2回目タイトル", body: "2回目本文", base: "main", head: "feature/y", number: 1 },
    });
    const read = await run(issuesDir, { operation: "pr_read", args: { number: 1 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      const payload = read.payload as Record<string, unknown>;
      expect(payload.title).toBe("2回目タイトル");
      const body = String(payload.body);
      expect(body).toContain("2回目本文");
      expect(body).not.toContain("マージ前確認本文");
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

  test("issue_reopen は tracking の クローズ済み から再検討へ戻し、open 済みは冪等に成功し、case は拒否する", async () => {
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
    expect(notClosed.ok).toBe(true);
    if (notClosed.ok) {
      const before = (notClosed.payload as Record<string, unknown>).before as Record<string, unknown>;
      expect(before.state).toBe("open");
      expect(before.trackingState).toBe("in-discussion");
    }
    expect(readIssueFile(issuesDir, 1)).toContain("status: in-discussion");
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
  test("起票→保留→解決→クローズ→再オープンが読み戻し検証を通る", async () => {
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

describe("LocalRunner: GitHub 版共通契約 parity（TS-015）", () => {
  test("対象操作の入力・出力構造、状態遷移、成功意味が共通契約を満たす", async () => {
    const issuesDir = makeIssuesDir();
    const env = makeEnv(issuesDir);
    const created = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "Parity",
      body: "本文",
      labels: [],
      role: "tracking",
      kind: "task",
    });
    expect(created.ok).toBe(true);

    const comment = await runAgentdevGhOperation(env, {
      operation: "comment_create",
      number: 1,
      body: "コメント",
    });
    expect(comment.ok).toBe(true);
    if (!comment.ok || comment.success.operation !== "comment_create") throw new Error("comment_create failed");
    expect(typeof comment.success.commentId).toBe("string");

    const listed = await runAgentdevGhOperation(env, {
      operation: "comment_list",
      number: 1,
    });
    expect(listed.ok).toBe(true);
    if (!listed.ok || listed.success.operation !== "comment_list") throw new Error("comment_list failed");
    expect(listed.success.comments[0]?.commentId).toBe(comment.success.commentId);
    expect(listed.success.comments[0]?.body).toBe("コメント");
    expect(typeof listed.success.comments[0]?.createdAt).toBe("string");
    expect(typeof listed.success.comments[0]?.updatedAt).toBe("string");
    expect(typeof listed.success.comments[0]?.url).toBe("string");

    const updated = await runAgentdevGhOperation(env, {
      operation: "comment_update",
      commentId: comment.success.commentId,
      body: "更新コメント",
    });
    expect(updated.ok).toBe(true);
    const deleted = await runAgentdevGhOperation(env, {
      operation: "comment_delete",
      commentId: comment.success.commentId,
    });
    expect(deleted.ok).toBe(true);

    const closed = await runAgentdevGhOperation(env, {
      operation: "issue_close",
      number: 1,
      reason: "completed",
    });
    expect(closed.ok).toBe(true);
    const reopened = await runAgentdevGhOperation(env, {
      operation: "issue_reopen",
      number: 1,
    });
    expect(reopened.ok).toBe(true);
    if (reopened.ok && reopened.success.operation === "issue_reopen") {
      expect(reopened.success.state).toBe("open");
    }

    const listedIssues = await runAgentdevGhOperation(env, {
      operation: "issue_list",
      state: "open",
      role: "tracking",
    });
    expect(listedIssues.ok).toBe(true);
    if (listedIssues.ok && listedIssues.success.operation === "issue_list") {
      expect(listedIssues.success.issues.some((issue) => issue.number === 1)).toBe(true);
    }

    const caseCreated = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "Case parity",
      body: "## Design確定候補\n\n- なし\n\n## Findings / Capture候補\n\n### intake\n\n- なし\n\n### learning\n\n- なし",
      labels: ["feature"],
      role: "case",
    });
    expect(caseCreated.ok).toBe(true);
    const prCreated = await runAgentdevGhOperation(env, {
      operation: "pr_create",
      title: "Parity PR",
      body: "マージ前確認本文",
      base: "main",
      head: "feature/parity",
    });
    expect(prCreated.ok).toBe(true);
    const prRead = await runAgentdevGhOperation(env, {
      operation: "pr_read",
      number: 2,
    });
    expect(prRead.ok).toBe(true);
    if (prRead.ok && prRead.success.operation === "pr_read") {
      expect(prRead.success.title).toBe("Parity PR");
      expect(prRead.success.body).toContain("## マージ前確認");
      expect(prRead.success.body).toContain("## Design確定候補");
      expect(prRead.success.body).toContain("## Findings / Capture候補");
    }
    const prUpdated = await runAgentdevGhOperation(env, {
      operation: "pr_update",
      number: 2,
      title: "Updated parity PR",
    });
    expect(prUpdated.ok).toBe(true);
    const mergeable = await runAgentdevGhOperation(env, {
      operation: "pr_mergeable",
      number: 2,
    });
    expect(mergeable.ok).toBe(true);
    if (mergeable.ok && mergeable.success.operation === "pr_mergeable") {
      expect(["MERGEABLE", "UNKNOWN"]).toContain(mergeable.success.mergeable);
    }
    const caseReopen = await runAgentdevGhOperation(env, {
      operation: "issue_reopen",
      number: 2,
    });
    expect(caseReopen.ok).toBe(false);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});
