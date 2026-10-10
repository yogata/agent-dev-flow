// v5-migration 非破壊 staging 構築ツールのテスト（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(verification): REQ-109-002, REQ-109-004, REQ-109-006, REQ-109-007
//
// 検証対象: scripts/consumer/v5-migration/build-staging.ts
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 2: 対応付け・手順 3: 非破壊構築）・REQ-109-002/004/006/007。
// 検証観点: 対応表に基づく staging 構築・retire/defer の構築留保（留保を欠落・廃止として
// 扱わない）・移行元の非破壊・冪等再実行・fail-closed（語彙外・虚参照・staging 構成違反・
// 対応先決定未了）。

import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const SCRIPT = path.join(import.meta.dir, "build-staging.ts");

interface RunResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function runBuild(root: string, mapping: string, staging: string): RunResult {
  const r = spawnSync("bun", [SCRIPT, "--root", root, "--mapping", mapping, "--staging", staging], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function write(abs: string, content: string): void {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
}

function sha256(abs: string): string {
  return createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
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
        out.set(path.relative(root, abs), sha256(abs));
      }
    }
  }
  return out;
}

const MAPPING_HEADER = ["# 対応表（人手確定済み）", "", "## migration mapping", "", "| 移行元パス | 移行先パス（staging 相対） | 処遇 | 処理状態 | 対応根拠 |", "|---|---|---|---|---|"];

interface Fixture {
  readonly root: string;
  readonly staging: string;
  readonly mapping: string;
}

function makeFixture(): Fixture {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "adf-mig5-"));
  const root = path.join(base, "src-root");
  const staging = path.join(base, "staging");
  const mapping = path.join(base, "mapping.md");
  write(path.join(root, ".agentdev", "intake", "inbox", "item-a.md"), "内容 本文\n");
  write(path.join(root, ".agentdev", "learning", "inbox.md"), "# 学び\n");
  write(path.join(root, "docs", "requirements", "REQ-001.md"), "要件本文\n");
  write(path.join(root, "docs", "decisions", "DEC-001.md"), "決定本文\n");
  write(path.join(root, "docs", "designs", "foundations", "design-a.md"), "設計本文\n");
  write(mapping, [...MAPPING_HEADER, "| .agentdev/intake/inbox/item-a.md | .agentdev/intake/inbox/item-a.md | keep | raw item（未処理） | 同一移行 |", "| .agentdev/learning/inbox.md | .agentdev/learning/inbox.md | keep | 未整理（learning-promote 待ち） | 同一移行 |", "| docs/requirements/REQ-001.md | docs/requirements/REQ-001.md | redefine | — | v5 で意味継承の上で再定義 |", "| docs/decisions/DEC-001.md | docs/decisions/DEC-001.md | supersede | — | 後継判断が確定済み |", "| docs/designs/foundations/design-a.md |  | defer | — | v5 採用可否を留保 |", ""].join("\n"));
  return { root, staging, mapping };
}

describe("v5-migration 非破壊 staging 構築ツール", () => {
  test("対応表に基づき keep / redefine / supersede を staging へ構築する", () => {
    const f = makeFixture();
    try {
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("- copy: 4 件 / 留保（retire・defer・copy しない）: 1 件");
      expect(sha256(path.join(f.staging, ".agentdev", "intake", "inbox", "item-a.md"))).toBe(sha256(path.join(f.root, ".agentdev", "intake", "inbox", "item-a.md")));
      expect(sha256(path.join(f.staging, "docs", "requirements", "REQ-001.md"))).toBe(sha256(path.join(f.root, "docs", "requirements", "REQ-001.md")));
      expect(sha256(path.join(f.staging, "docs", "decisions", "DEC-001.md"))).toBe(sha256(path.join(f.root, "docs", "decisions", "DEC-001.md")));
      expect(fs.existsSync(path.join(f.staging, "docs", "designs", "foundations", "design-a.md"))).toBe(false);
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("retire / defer は構築を留保する（留保を欠落・廃止として扱わない）", () => {
    const f = makeFixture();
    try {
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      expect(fs.existsSync(path.join(f.staging, "docs", "designs", "foundations", "design-a.md"))).toBe(false);
      // defer 行自体は対応表に記録済みである（検証の対象として残る）
      const mappingTxt = fs.readFileSync(f.mapping, "utf8");
      expect(mappingTxt).toContain("| docs/designs/foundations/design-a.md |  | defer |");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("移行元は非破壊である（実行前後で移行元ツリーのファイル一覧・内容ハッシュが不変）", () => {
    const f = makeFixture();
    try {
      const before = snapshotTree(f.root);
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      const after = snapshotTree(f.root);
      expect([...after.keys()].sort()).toEqual([...before.keys()].sort());
      for (const [k, v] of before) {
        expect(after.get(k)).toBe(v);
      }
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("冪等である（再実行で同一結果）", () => {
    const f = makeFixture();
    try {
      const a = runBuild(f.root, f.mapping, f.staging);
      const first = snapshotTree(f.staging);
      const b = runBuild(f.root, f.mapping, f.staging);
      const second = snapshotTree(f.staging);
      expect(a.status).toBe(0);
      expect(b.status).toBe(0);
      expect([...second.keys()].sort()).toEqual([...first.keys()].sort());
      for (const [k, v] of first) {
        expect(second.get(k)).toBe(v);
      }
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("staging が移行元 root の内部にある構成を拒否する（非破壊原則）", () => {
    const f = makeFixture();
    try {
      const inner = path.join(f.root, ".agentdev-v5-staging");
      const r = runBuild(f.root, f.mapping, inner);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("非破壊原則");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("対応先パスが空の keep 行を fail-closed で停止する", () => {
    const f = makeFixture();
    try {
      write(f.mapping, [...MAPPING_HEADER, "| docs/requirements/REQ-001.md |  | keep | — | |", ""].join("\n"));
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("defer");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("処遇語彙外の値を fail-closed で停止する", () => {
    const f = makeFixture();
    try {
      write(f.mapping, [...MAPPING_HEADER, "| docs/requirements/REQ-001.md | docs/requirements/REQ-001.md | merge | — | |", ""].join("\n"));
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("処遇語彙外");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("対応表の移行元パス虚参照を fail-closed で停止する", () => {
    const f = makeFixture();
    try {
      write(f.mapping, [...MAPPING_HEADER, "| docs/requirements/REQ-999.md | docs/requirements/REQ-999.md | keep | — | |", ""].join("\n"));
      const r = runBuild(f.root, f.mapping, f.staging);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("虚参照");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });

  test("mapping ファイル不在・表なしで fail-closed で停止する", () => {
    const f = makeFixture();
    try {
      const r1 = runBuild(f.root, path.join(f.root, "no-such-mapping.md"), f.staging);
      expect(r1.status).toBe(1);
      write(f.mapping, "# 表なし文書\n");
      const r2 = runBuild(f.root, f.mapping, f.staging);
      expect(r2.status).toBe(1);
      expect(r2.stderr).toContain("1 行も検出できませんでした");
    } finally {
      fs.rmSync(path.dirname(f.root), { recursive: true, force: true });
    }
  });
});
