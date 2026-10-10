// v5-migration inventory 生成ツールのテスト（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(verification): REQ-109-002, REQ-109-003, REQ-109-007
//
// 検証対象: scripts/consumer/v5-migration/inventory.ts
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 1: 意味インベントリ）・REQ-109-002/003/007。
// 検証観点: markdown レポート出力・3 系統の列挙（正規情報 / 対応関係表現 / 未処理改善情報）・
// 内容・処理状態・参照関係の属性・空確認（欠落と誤判定しない）・決定性・読み取り専用・
// 存在しない root への空振り正常終了。

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adf-inv5-"));
  // C 系統（未処理改善情報）
  write(path.join(dir, ".agentdev", "intake", "inbox", "item-a.md"), "内容 本文 #1234 参照\n");
  write(path.join(dir, ".agentdev", "learning", "inbox.md"), "# 学び\n\n## エントリ1\n\n## エントリ2\n");
  write(path.join(dir, ".agentdev", "backlog", "req-units", ".gitkeep"), "");
  write(path.join(dir, ".agentdev", "backlog", "req-units", "RU-1.md"), "RU 本文\n");
  write(path.join(dir, ".agentdev", "inspect", "inbox", "f1.md"), "finding #99\n");
  write(path.join(dir, ".agentdev", "blocked", "b1.md"), "blocked 記録\n");
  write(path.join(dir, ".agentdev", "intake", "promoted", ".gitkeep"), "");
  write(path.join(dir, ".agentdev", "learning", "deferred.md"), "# deferred pool\n\n## エントリD\n");
  fs.mkdirSync(path.join(dir, ".agentdev", "learning", "promoted"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".agentdev", "drafts"), { recursive: true });
  // A 系統（有効な正規情報）
  write(path.join(dir, "docs", "requirements", "REQ-001.md"), "---\nid: REQ-001\n---\n要件本文\n");
  write(path.join(dir, "docs", "requirements", "retired", "REQ-013.md"), "---\nid: REQ-013\n---\n廃止済み\n");
  write(path.join(dir, "docs", "decisions", "DEC-001.md"), "---\nid: DEC-001\nstatus: accepted\n---\n本文\n");
  write(path.join(dir, "docs", "decisions", "DEC-002.md"), "---\nid: DEC-002\nstatus: superseded\nsuperseded_by: DEC-001\n---\n本文\n");
  write(path.join(dir, "docs", "designs", "foundations", "design-a.md"), "---\nstatus: accepted\n---\n本文\n");
  write(path.join(dir, "docs", "designs", "foundations", "design-b.md"), "frontmatter なし本文\n");
  // B 系統（対応関係表現）
  write(path.join(dir, "src", "foo.ts"), "// ADF-COVERS(implementation): REQ-001-001\nexport const x = 1;\n");
  write(path.join(dir, "src", "foo.test.ts"), "// ADF-COVERS(verification): REQ-001-001\n");
  write(path.join(dir, "traceability", "sidecar.yaml"), "component: c1\nimplementation:\n  src/foo.ts:\n    - REQ-001-001\n");
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

describe("v5-migration inventory 生成ツール", () => {
  test("markdown レポートを生成する（見出し・Summary・semantic inventory・空確認・mapping 雛形）", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("# v4→v5 Migration Inventory Report");
      expect(r.stdout).toContain("## Summary");
      expect(r.stdout).toContain("## semantic inventory");
      expect(r.stdout).toContain("## 空確認");
      expect(r.stdout).toContain("## migration mapping（全項目雛形・要人手確定）");
      expect(r.stdout).toContain("keep / redefine / supersede / retire / defer");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("A 系統: 要件・廃止済み要件・Decision（status）・Design を列挙する", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("docs/requirements/REQ-001.md");
      expect(r.stdout).toContain("docs/requirements/retired/REQ-013.md");
      expect(r.stdout).toContain("廃止済み・世代境界を含む列挙");
      expect(r.stdout).toContain("docs/decisions/DEC-001.md");
      expect(r.stdout).toContain("docs/decisions/DEC-002.md");
      expect(r.stdout).toContain("superseded (superseded_by DEC-001)");
      expect(r.stdout).toContain("docs/designs/foundations/design-a.md");
      expect(r.stdout).toContain("docs/designs/foundations/design-b.md");
      expect(r.stdout).toContain("accepted 相当");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("B 系統: inline 宣言と sidecar を列挙する", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("src/foo.ts");
      expect(r.stdout).toContain("src/foo.test.ts");
      expect(r.stdout).toContain("traceability/sidecar.yaml");
      expect(r.stdout).toContain("inline 宣言");
      expect(r.stdout).toContain("sidecar");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("C 系統: 未処理改善情報の内容・処理状態・参照関係を列挙する", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain(".agentdev/intake/inbox/item-a.md");
      expect(r.stdout).toContain("raw item（未処理）");
      expect(r.stdout).toContain(".agentdev/learning/inbox.md");
      expect(r.stdout).toContain("未整理（learning-promote 待ち）");
      expect(r.stdout).toContain(".agentdev/learning/deferred.md");
      expect(r.stdout).toContain("分類済み living pool（prune 禁止）");      expect(r.stdout).toContain(".agentdev/backlog/req-units/RU-1.md");
      expect(r.stdout).toContain(".agentdev/inspect/inbox/f1.md");
      expect(r.stdout).toContain(".agentdev/blocked/b1.md");
      // 参照関係（#NNN 出現件数）
      const itemRow = r.stdout.split("\n").find((l) => l.includes(".agentdev/intake/inbox/item-a.md"));
      expect(itemRow).toContain("| 1 件 |");
      // 内容（sha256-12/bytes）
      expect(itemRow).toMatch(/\|\s*[0-9a-f]{12}\/\d+B\s*\|/);
      // .gitkeep は列挙しない
      expect(r.stdout).not.toContain(".gitkeep");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("空確認: 空の配置を欠落と誤判定しない", () => {
    const dir = makeFixture();
    try {
      const r = runInventory(dir);
      expect(r.status).toBe(0);
      const section = r.stdout.slice(r.stdout.indexOf("## 空確認"), r.stdout.indexOf("## migration mapping"));
      expect(section).toContain("intake/promoted | 空（正規消費済み相当または未処理なし");
      expect(section).toContain("learning/promoted | 空（正規消費済み相当または未処理なし");
      expect(section).toContain("drafts | 空（正規消費済み相当または未処理なし");
      expect(section).toContain("issues | 空（未生成）");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("mapping 雛形が列挙全項目を 1 項目ずつ含む（手順 4 前提条件の記録単位）", () => {
    const dir = makeFixture();
    try {
      const inv = runInventory(dir);
      const invSection = inv.stdout.slice(inv.stdout.indexOf("## semantic inventory"), inv.stdout.indexOf("## 空確認"));
      const itemRows = invSection.split("\n").filter((l) => /^\| [ABC] \|/.test(l)).length;
      const mapSection = inv.stdout.slice(inv.stdout.indexOf("## migration mapping"));
      const mapRows = mapSection.split("\n").filter((l) => /^\| \./.test(l) || /^\| src\//.test(l) || /^\| docs\//.test(l) || /^\| traceability\//.test(l)).length;
      expect(mapRows).toBe(itemRows);
      expect(mapRows).toBeGreaterThan(0);
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
    const r = runInventory(path.join(os.tmpdir(), "adf-inv5-nonexistent-xyz"));
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("合計: 0 件");
  });
});
