// v4-migration inventory 生成ツールのテスト（OU-002・TS-005）
//
// 検証対象: scripts/consumer/v4-migration/inventory.ts
// 契約: docs/designs/foundations/v4-migration-and-release.md「移行ツール群」節・
// 要件doc TS-005（inventory.test.ts pass・markdown レポート出力・読み取り専用の
// 実証〔実行前後で対象ツリー不変〕・存在しないパス・空 .agentdev への空振り正常終了）

import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const SCRIPT = path.join(import.meta.dir, "inventory.ts");

interface RunResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function runInventory(root: string): RunResult {
  const r = spawnSync("bun", [SCRIPT, "--root", root], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function write(abs: string, content: string): void {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

function makeFixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adf-inv-"));
  write(path.join(dir, ".agentdev", "intake", "inbox", "item-a.md"), "x");
  write(path.join(dir, ".agentdev", "learning", "inbox.md"), "x");
  write(path.join(dir, ".agentdev", "learning", "promoted", "learn-1.md"), "x");
  write(path.join(dir, ".agentdev", "backlog", "req-units", ".gitkeep"), "");
  write(path.join(dir, ".agentdev", "backlog", "req-units", "ru-1.md"), "x");
  write(path.join(dir, ".agentdev", "drafts", "req-draft-x.md"), "x");
  write(path.join(dir, ".agentdev", "inspect-docs", "promoted", "f1.md"), "x");
  write(path.join(dir, ".agentdev", "issues", "draft-1.md"), "x");
  write(path.join(dir, "docs", "requirements", "REQ-001.md"), "---\nid: REQ-001\nupdated: \"2026-09-01\"\n---\n本文\n");
  write(path.join(dir, "docs", "decisions", "DEC-001.md"), "---\nid: DEC-001\nstatus: accepted\n---\n本文\n");
  write(path.join(dir, "docs", "decisions", "DEC-002.md"), "---\nid: DEC-002\nstatus: superseded\nsuperseded_by: DEC-001\n---\n本文\n");
  write(path.join(dir, "docs", "designs", "foundations", "design-a.md"), "---\nstatus: accepted\n---\n本文\n");
  write(
    path.join(dir, "docs", "designs", "foundations", "references", "crosswalk-inventory.md"),
    "| ID | 処遇 | 型 | 段 | 確定 | 備考 |\n|---|---|---|---|---|---|\n| REQ-001 | redefine | ― | 1 | planned | 対象行 |\n| REQ-002 | keep | ― | ― | executed | 対象外行 |\n",
  );
  return dir;
}

function snapshotTree(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const stack: string[] = [root];
  while (stack.length > 0) {
    const cur = stack.pop() as string;
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const abs = path.join(cur, e.name);
      if (e.isDirectory()) {
        stack.push(abs);
      } else {
        out.set(
          path.relative(root, abs),
          createHash("sha256").update(fs.readFileSync(abs)).digest("hex"),
        );
      }
    }
  }
  return out;
}

describe("v4-migration inventory 生成ツール", () => {
  test("fixture から markdown レポートを生成する（見出し・semantic inventory 表・mapping 雛形表・件数）", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("# v4 Migration Inventory Report");
      expect(r.stdout).toContain("## Summary");
      expect(r.stdout).toContain("## semantic inventory");
      expect(r.stdout).toContain("## mapping 雛形");
      expect(r.stdout).toContain(".agentdev/intake/inbox/item-a.md");
      expect(r.stdout).toContain(".agentdev/learning/promoted/learn-1.md");
      expect(r.stdout).toContain(".agentdev/backlog/req-units/ru-1.md");
      expect(r.stdout).toContain(".agentdev/drafts/req-draft-x.md");
      expect(r.stdout).toContain(".agentdev/inspect-docs/promoted/f1.md");
      expect(r.stdout).toContain(".agentdev/issues/draft-1.md");
      expect(r.stdout).toContain("docs/requirements/REQ-001.md");
      expect(r.stdout).toContain("docs/decisions/DEC-001.md");
      expect(r.stdout).toContain("superseded (superseded_by DEC-001)");
      expect(r.stdout).toContain("docs/designs/foundations/design-a.md");
      expect(r.stdout).toContain("crosswalk-inventory.md :: REQ-001");
      expect(r.stdout).not.toContain("crosswalk-inventory.md :: REQ-002");
      expect(r.stdout).not.toContain(".gitkeep");
      expect(r.stdout).toContain("未評価 Observation");
      expect(r.stdout).toContain("reusable Knowledge");
      expect(r.stdout).toContain("Change/Case lifetime");
      expect(r.stdout).toContain("Requirement lifetime");
      expect(r.stdout).toContain("Architecture lifetime");
      expect(r.stdout).toContain("- 合計: 13 件");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("決定的である（同一入力に対して同一出力）", () => {
    const dir = makeFixture();
    try {
      const a = runInventory(dir);
      const b = runInventory(dir);
      expect(a.status).toBe(0);
      expect(b.status).toBe(0);
      expect(a.stdout).toBe(b.stdout);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("読み取り専用である（実行前後で対象ツリーのファイル一覧・内容ハッシュが不変）", () => {
    const dir = makeFixture();
    try {
      const before = snapshotTree(dir);
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      const after = snapshotTree(dir);
      expect([...after.keys()].sort()).toEqual([...before.keys()].sort());
      for (const [k, v] of before) {
        expect(after.get(k)).toBe(v);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("存在しない root に対して exit 0 で空レポートを出力する", () => {
    const r = runInventory(path.join(os.tmpdir(), "adf-inv-nonexistent-xyz"));
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("# v4 Migration Inventory Report");
    expect(r.stdout).toContain("合計: 0 件");
  });

  test("空 .agentdev に対して exit 0 で空レポートを出力する", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adf-inv-empty-"));
    try {
      fs.mkdirSync(path.join(dir, ".agentdev"), { recursive: true });
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("合計: 0 件");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("領域別の分類（8 寿命分類）と mapping 雛形の配置（5 分類）が Design 契約どおり", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      const lines = r.stdout.split("\n");
      const intakeRow = lines.find((l) => l.includes(".agentdev/intake/inbox/item-a.md"));
      expect(intakeRow).toContain("未評価 Observation");
      expect(intakeRow).toContain("保持");
      const learningRow = lines.find((l) => l.includes(".agentdev/learning/inbox.md"));
      expect(learningRow).toContain("reusable Knowledge");
      const issuesRow = lines.find((l) => l.includes(".agentdev/issues/draft-1.md"));
      expect(issuesRow).toContain("Change/Case lifetime");
      expect(issuesRow).toContain("変換");
      const mappingSection = r.stdout.slice(r.stdout.indexOf("## mapping 雛形"));
      expect(mappingSection).toContain("repo 内正規状態（.agentdev/ Git 管理ドメイン状態）");
      expect(mappingSection).toContain("GitHub 正規状態（Issue/PR の権威記録先）");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});