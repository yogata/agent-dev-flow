// TS-004 既存ローカルIssue資産の互換試験（REQ-099-008、REQ-099-009）。
//
// docs/designs/local/local-case-file.md と case-schema/rules/*.yaml の現行スキーマに
// 準拠した既存資産（representative asset）を fixture として配置し、
// 追加変換なしでの読み書き、採番空間の維持、状態写像（tracking 6 状態の
// 導出と GitHub 三段写像）が単一の Local 実装（両ホスト接続の共通正本）で
// 成立することを検証する。スキーマ違反資産は変換で直さず読み取りを拒否する
// （fail-closed 維持の確認）。

import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createLocalRunner,
  type LocalIssueFrontmatter,
} from "../runner-local.ts";
import type { GhRunnerRequest } from "../../../runner.ts";

function makeIssuesDir(): string {
  return fs.mkdtempSync(path.join(import.meta.dir, "tmp-ts004-assets-"));
}

function fmText(overrides: Partial<LocalIssueFrontmatter>): string {
  const fm: LocalIssueFrontmatter = {
    id: "issue-0007",
    title: "件名",
    role: "tracking",
    status: "in-discussion",
    created_at: "2026-09-01T09:00:00+09:00",
    updated_at: "2026-09-02T10:00:00+09:00",
    closed_at: "",
    labels: ["task"],
    ...overrides,
  };
  const lines = [
    "---",
    `id: ${fm.id}`,
    `title: "${fm.title}"`,
    `role: ${fm.role}`,
    `status: ${fm.status}`,
    `created_at: "${fm.created_at}"`,
    `updated_at: "${fm.updated_at}"`,
    `closed_at: "${fm.closed_at}"`,
    `labels: [${fm.labels.join(", ")}]`,
  ];
  if (fm.comment_seq !== undefined) lines.push(`comment_seq: ${fm.comment_seq}`);
  lines.push("---");
  return lines.join("\n");
}

function writeIssue(issuesDir: string, n: number, content: string): void {
  fs.writeFileSync(path.join(issuesDir, `issue-${String(n).padStart(4, "0")}.md`), content, "utf8");
}

async function run(issuesDir: string, request: GhRunnerRequest) {
  const runner = createLocalRunner({ issuesDir });
  return runner.run(request);
}

describe("TS-004 既存資産の読み書き（追加変換なし）", () => {
  test("現行スキーマの tracking 資産は role/kind/trackingState/state を導出され、更新で本文・コメント実体が不変", async () => {
    const issuesDir = makeIssuesDir();
    const original = [
      fmText({ id: "issue-0007", title: "既存追跡", status: "in-discussion", labels: ["task"], comment_seq: 2 }),
      "",
      "## 背景",
      "",
      "既存の検討事項本文。",
      "",
      "## 検討経過",
      "",
      "### c01 2026-09-01T10:00:00+09:00",
      "",
      "1 件目の検討経過。",
      "",
      "### c02 2026-09-02T10:00:00+09:00",
      "",
      "2 件目の検討経過。",
      "",
    ].join("\n");
    writeIssue(issuesDir, 7, original);
    const read = await run(issuesDir, { operation: "issue_read", args: { number: 7 } });
    expect(read.ok).toBe(true);
    if (read.ok) {
      const p = read.payload as Record<string, unknown>;
      expect(p.title).toBe("既存追跡");
      expect(p.role).toBe("tracking");
      expect(p.kind).toBe("task");
      expect(p.trackingState).toBe("in-discussion");
      expect(p.state).toBe("open");
      expect(p.body).toBe(original);
    }
    const update = await run(issuesDir, {
      operation: "issue_update",
      args: { number: 7, title: "既存追跡（改題）" },
    });
    expect(update.ok).toBe(true);
    const after = fs.readFileSync(path.join(issuesDir, "issue-0007.md"), "utf8");
    expect(after).toContain('title: "既存追跡（改題）"');
    expect(after).toContain("### c01 2026-09-01T10:00:00+09:00");
    expect(after).toContain("1 件目の検討経過。");
    expect(after).toContain("既存の検討事項本文。");
    const list = await run(issuesDir, { operation: "comment_list", args: { number: 7 } });
    expect(list.ok).toBe(true);
    if (list.ok) {
      const p = list.payload as { comments: { commentId: string; body: string }[] };
      expect(p.comments.map((c) => c.commentId)).toEqual(["issue-0007-c01", "issue-0007-c02"]);
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });

  test("現行スキーマの case 資産は PR 系状態写像（status: active かつマージ結果未記録 → MERGEABLE）を維持する", async () => {
    const issuesDir = makeIssuesDir();
    const original = [
      fmText({ id: "issue-0012", title: "既存Case", role: "case", status: "active", labels: ["feature"] }),
      "",
      "## 目的",
      "",
      "既存 Case 本文。",
      "",
      "## 作業ログ",
      "",
      "### c01 2026-09-01T11:00:00+09:00",
      "",
      "実装完了。",
      "",
      "## Design確定候補",
      "",
      "該当なし",
      "",
      "## Findings / Capture候補",
      "",
      "### intake",
      "",
      "該当なし",
      "",
      "### learning",
      "",
      "該当なし",
      "",
      "## マージ前確認",
      "",
      "### PR title: 既存Case の確認",
      "",
      "PR 本文",
      "",
    ].join("\n");
    writeIssue(issuesDir, 12, original);
    const mergeable = await run(issuesDir, { operation: "pr_mergeable", args: { number: 12 } });
    expect(mergeable.ok).toBe(true);
    if (mergeable.ok) {
      const p = mergeable.payload as Record<string, unknown>;
      expect(p.mergeable).toBe("MERGEABLE");
    }
    const prRead = await run(issuesDir, { operation: "pr_read", args: { number: 12 } });
    expect(prRead.ok).toBe(true);
    if (prRead.ok) {
      const p = prRead.payload as Record<string, unknown>;
      expect(p.title).toBe("既存Case の確認");
      expect(String(p.body)).toContain("## マージ前確認");
      expect(String(p.body)).toContain("## Findings / Capture候補");
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("TS-004 採番空間の維持", () => {
  test("既存資産が存在する採番空間での起票は既存最大 + 1 を採番し欠番を再利用しない", async () => {
    const issuesDir = makeIssuesDir();
    writeIssue(issuesDir, 7, [
      fmText({ id: "issue-0007", title: "唯一の既存資産", status: "on-hold", labels: ["risk"] }),
      "",
      "本文",
      "",
    ].join("\n"));
    const created = await run(issuesDir, {
      operation: "issue_create",
      args: { title: "新規", body: "本文", labels: [], role: "case" },
    });
    expect(created.ok).toBe(true);
    if (created.ok) {
      const p = created.payload as Record<string, unknown>;
      expect(p.number).toBe(8);
    }
    expect(fs.existsSync(path.join(issuesDir, "issue-0008.md"))).toBe(true);
    expect(fs.existsSync(path.join(issuesDir, "issue-0007.md"))).toBe(true);
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("TS-004 状態写像の逸脱なし（tracking 6 状態）", () => {
  test("tracking の status 値域 6 状態は issue_read の trackingState と GitHub 三段写像へ逸脱なく導出される", async () => {
    const states: { status: string; expectedTrackingState: string; expectedState: string; closedAt: string }[] = [
      { status: "created", expectedTrackingState: "created", expectedState: "open", closedAt: "" },
      { status: "in-discussion", expectedTrackingState: "in-discussion", expectedState: "open", closedAt: "" },
      { status: "on-hold", expectedTrackingState: "on-hold", expectedState: "open", closedAt: "" },
      { status: "ready", expectedTrackingState: "ready", expectedState: "open", closedAt: "" },
      { status: "resolved", expectedTrackingState: "resolved", expectedState: "open", closedAt: "" },
      { status: "closed", expectedTrackingState: "closed", expectedState: "closed", closedAt: "2026-09-03T09:00:00+09:00" },
    ];
    const issuesDir = makeIssuesDir();
    for (const [i, s] of states.entries()) {
      const n = i + 1;
      writeIssue(issuesDir, n, [
        fmText({
          id: `issue-${String(n).padStart(4, "0")}`,
          status: s.status,
          labels: ["task"],
          closed_at: s.closedAt,
        }),
        "",
        "本文",
        "",
      ].join("\n"));
    }
    for (const [i, s] of states.entries()) {
      const n = i + 1;
      const read = await run(issuesDir, { operation: "issue_read", args: { number: n } });
      expect(read.ok).toBe(true);
      if (read.ok) {
        const p = read.payload as Record<string, unknown>;
        expect(p.trackingState).toBe(s.expectedTrackingState);
        expect(p.state).toBe(s.expectedState);
      }
    }
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});

describe("TS-004 スキーマ違反資産の fail-closed（変換で直さず拒否）", () => {
  test("status 値域外の資産は読み取りを失敗させ、追加変換を行わない", async () => {
    const issuesDir = makeIssuesDir();
    writeIssue(issuesDir, 7, [
      fmText({ id: "issue-0007", status: "unknown-state", labels: ["task"] }),
      "",
      "本文",
      "",
    ].join("\n"));
    const read = await run(issuesDir, { operation: "issue_read", args: { number: 7 } });
    expect(read.ok).toBe(false);
    const raw = fs.readFileSync(path.join(issuesDir, "issue-0007.md"), "utf8");
    expect(raw).toContain("status: unknown-state");
    fs.rmSync(issuesDir, { recursive: true, force: true });
  });
});
