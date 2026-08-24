// Local 実装（LocalRunner）のテスト。
//
// 一時ディレクトリで Case ファイルの読み書きを検証する（実環境に触れない）。
// 検証観点: 採番、frontmatter 形状、LF・BOM なし、status → state 写像、
// セクション追記規則、同一操作契約での engine 経由実行（VERIFY 読み戻し）。


import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { createLocalRunner } from "../runner-local.ts";
import { buildGhToolEnv, type GhToolEnv } from "../../../opencode/tools/agentdev-gh/engine.ts";
import { runAgentdevGhOperation } from "../../../opencode/tools/agentdev-gh/index.ts";
import type { GhRunnerReply, GhRunnerRequest } from "../../../opencode/tools/agentdev-gh/runner.ts";

function makeCasesDir(): string {
  return fs.mkdtempSync(path.join(import.meta.dir, "tmp-local-runner-"));
}

function makeEnv(casesDir: string): GhToolEnv {
  const runner = createLocalRunner({ casesDir });
  const result = buildGhToolEnv(
    { repo: "local/cases" },
    { tempDir: () => path.join(casesDir, "..", "tmp") },
    runner,
  );
  if (!result.ok) throw new Error("env build failed");
  return result.env;
}

async function run(casesDir: string, request: GhRunnerRequest): Promise<GhRunnerReply> {
  const runner = createLocalRunner({ casesDir });
  return runner.run(request);
}

function readCaseFile(casesDir: string, n: number): string {
  return fs.readFileSync(path.join(casesDir, `case-${String(n).padStart(4, "0")}.md`), "utf8");
}

describe("LocalRunner: issue 系の読み替え", () => {
  test("issue_create は採番して Case ファイルを作成する（LF・BOM なし）", async () => {
    const casesDir = makeCasesDir();
    const reply = await run(casesDir, {
      operation: "issue_create",
      args: { title: "日本語タイトル", body: "## 目的\n\n本文", labels: ["feature"] },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.number).toBe(1);
      expect(String(payload.url)).toContain("case-0001.md");
    }
    const raw = readCaseFile(casesDir, 1);
    expect(raw.startsWith("---\n")).toBe(true);
    expect(raw).toContain('id: case-0001');
    expect(raw).toContain('title: "日本語タイトル"');
    expect(raw).toContain("status: open");
    expect(raw).toContain("closed_at: \"\"");
    expect(raw).toContain("labels: [feature]");
    expect(raw).toContain("## 目的");
    expect(raw.includes("\r\n")).toBe(false);
    const bytes = fs.readFileSync(path.join(casesDir, "case-0001.md"));
    expect(bytes[0]).toBe(0x2d); // '-' (BOM 0xEF でない)
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("採番は既存最大 + 1（欠番再利用なし）", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "A", body: "a", labels: [] } });
    await run(casesDir, { operation: "issue_create", args: { title: "B", body: "b", labels: [] } });
    fs.rmSync(path.join(casesDir, "case-0001.md"));
    const reply = await run(casesDir, { operation: "issue_create", args: { title: "C", body: "c", labels: [] } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).number).toBe(3);
    }
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("issue_read は全文と state 写像（非終端 → open）を返す", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "本文", labels: [] } });
    const reply = await run(casesDir, { operation: "issue_read", args: { number: 1 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      const payload = reply.payload as Record<string, unknown>;
      expect(payload.title).toBe("T");
      expect(payload.state).toBe("open");
      expect(String(payload.body).startsWith("---\n")).toBe(true);
      expect(String(payload.body)).toContain("本文");
    }
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("issue_update の body は全文をそのまま反映する（updated_at 自動更新なし）", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "本文", labels: [] } });
    const read = await run(casesDir, { operation: "issue_read", args: { number: 1 } });
    if (!read.ok) throw new Error("read failed");
    const original = (read.payload as Record<string, unknown>).body as string;
    const next = original.replace("本文", "更新後の本文");
    const reply = await run(casesDir, { operation: "issue_update", args: { number: 1, body: next } });
    expect(reply.ok).toBe(true);
    expect(readCaseFile(casesDir, 1)).toBe(next);
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("issue_comment は ## 作業ログ を ## Design確定候補 の前に新設して追記する", async () => {
    const casesDir = makeCasesDir();
    fs.writeFileSync(
      path.join(casesDir, "case-0001.md"),
      '---\nid: case-0001\ntitle: "T"\nstatus: running\ncreated_at: "2026-08-25T00:00:00Z"\nupdated_at: "2026-08-25T00:00:00Z"\nclosed_at: ""\nlabels: []\n---\n\n本文\n\n## Design確定候補\n\n候補\n',
      "utf8",
    );
    const reply = await run(casesDir, { operation: "issue_comment", args: { number: 1, body: "追記コメント" } });
    expect(reply.ok).toBe(true);
    const raw = readCaseFile(casesDir, 1);
    const worklogAt = raw.indexOf("## 作業ログ");
    const designAt = raw.indexOf("## Design確定候補");
    expect(worklogAt).toBeGreaterThan(-1);
    expect(designAt).toBeGreaterThan(worklogAt);
    expect(raw).toContain("追記コメント");
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("issue_close は status と closed_at を更新する（not_planned → cancelled）", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "b", labels: [] } });
    const reply = await run(casesDir, {
      operation: "issue_close",
      args: { number: 1, reason: "not_planned" },
    });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).state).toBe("closed");
    }
    const raw = readCaseFile(casesDir, 1);
    expect(raw).toContain("status: cancelled");
    expect(raw).not.toContain('closed_at: ""');
    fs.rmSync(casesDir, { recursive: true, force: true });
  });
});

describe("LocalRunner: pr 系の読み替え", () => {
  test("pr_create は マージ前確認 セクションに PR title を記録する", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "b", labels: [] } });
    const reply = await run(casesDir, {
      operation: "pr_create",
      args: { title: "PR日本語タイトル", body: "## マージ前確認\n\n内容", base: "main", head: "feature/x" },
    });
    expect(reply.ok).toBe(true);
    const raw = readCaseFile(casesDir, 1);
    expect(raw).toContain("## マージ前確認");
    expect(raw).toContain("### PR title: PR日本語タイトル");
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("pr_merge は マージ結果 を記録し、pr_read は merged を返す", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "b", labels: [] } });
    await run(casesDir, {
      operation: "pr_create",
      args: { title: "P", body: "本文", base: "main", head: "feature/x" },
    });
    const merged = await run(casesDir, { operation: "pr_merge", args: { number: 1, method: "squash" } });
    expect(merged.ok).toBe(true);
    expect(readCaseFile(casesDir, 1)).toContain("## マージ結果");
    const read = await run(casesDir, { operation: "pr_read", args: { number: 1 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      expect((read.payload as Record<string, unknown>).state).toBe("merged");
    }
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("pr_mergeable は status: review の場合 MERGEABLE", async () => {
    const casesDir = makeCasesDir();
    fs.writeFileSync(
      path.join(casesDir, "case-0002.md"),
      '---\nid: case-0002\ntitle: "T"\nstatus: review\ncreated_at: "2026-08-25T00:00:00Z"\nupdated_at: "2026-08-25T00:00:00Z"\nclosed_at: ""\nlabels: []\n---\n\n本文\n',
      "utf8",
    );
    const reply = await run(casesDir, { operation: "pr_mergeable", args: { number: 2 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).mergeable).toBe("MERGEABLE");
    }
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("pr_changed_files は空配列を返す（ローカルに変更一覧は不存在）", async () => {
    const casesDir = makeCasesDir();
    await run(casesDir, { operation: "issue_create", args: { title: "T", body: "b", labels: [] } });
    const reply = await run(casesDir, { operation: "pr_changed_files", args: { number: 1 } });
    expect(reply.ok).toBe(true);
    if (reply.ok) {
      expect((reply.payload as Record<string, unknown>).files).toEqual([]);
    }
    fs.rmSync(casesDir, { recursive: true, force: true });
  });
});

describe("同一操作契約での engine 経由実行（VERIFY 読み戻し）", () => {
  test("issue_create → issue_read の VERIFY を通過する", async () => {
    const casesDir = makeCasesDir();
    const env = makeEnv(casesDir);
    const result = await runAgentdevGhOperation(env, {
      operation: "issue_create",
      title: "日本語タイトル",
      body: "本文",
      labels: [],
    });
    expect(result.ok).toBe(true);
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("issue_close → state 読み戻しの VERIFY を通過する", async () => {
    const casesDir = makeCasesDir();
    const env = makeEnv(casesDir);
    await runAgentdevGhOperation(env, { operation: "issue_create", title: "T", body: "B", labels: [] });
    const result = await runAgentdevGhOperation(env, { operation: "issue_close", number: 1 });
    expect(result.ok).toBe(true);
    fs.rmSync(casesDir, { recursive: true, force: true });
  });

  test("pr_create / pr_merge の VERIFY を通過する", async () => {
    const casesDir = makeCasesDir();
    const env = makeEnv(casesDir);
    await runAgentdevGhOperation(env, { operation: "issue_create", title: "T", body: "B", labels: [] });
    const pr = await runAgentdevGhOperation(env, {
      operation: "pr_create",
      title: "PRタイトル",
      body: "PR本文",
      base: "main",
      head: "feature/x",
    });
    expect(pr.ok).toBe(true);
    const merged = await runAgentdevGhOperation(env, {
      operation: "pr_merge",
      number: 1,
      method: "squash",
    });
    expect(merged.ok).toBe(true);
    fs.rmSync(casesDir, { recursive: true, force: true });
  });
});
