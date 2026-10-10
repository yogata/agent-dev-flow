// v5-migration 非破壊検証ツールのテスト（OU-0007 / Issue #3592 / REQ-109）
// ADF-COVERS(verification): REQ-109-001, REQ-109-002, REQ-109-003, REQ-109-004, REQ-109-005, REQ-109-007, REQ-109-008
//
// 検証対象: scripts/consumer/v5-migration/verify-migration.ts
// 契約: docs/designs/foundations/v4-migration-and-release.md「v4 → v5 移行手順と検証」節
// （手順 3: 非破壊構築と非破壊検証・手順 4: 切替と移行結果の確定）・REQ-109-001/002/003/
// 004/005/007/008。
// 検証観点: 正常系の成功確定判定・欠落・不整合・検証不能の検出と検出明細（対象と理由の
// 特定）・対応先パス変更でも意味保全を合格とする（REQ-109-001）・baseline 対照の非計上・
// 読み取り専用・JSON 出力。

import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const SCRIPT = path.join(import.meta.dir, "verify-migration.ts");
const INVENTORY = path.join(import.meta.dir, "inventory.ts");
const BUILD = path.join(import.meta.dir, "build-staging.ts");

interface RunResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function run(args: string[]): RunResult {
  const r = spawnSync("bun", args, { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function runVerify(root: string, mapping: string, staging: string, baseline?: string, json?: boolean): RunResult {
  const args = [SCRIPT, "--root", root, "--mapping", mapping, "--staging", staging];
  if (baseline) args.push("--baseline", baseline);
  if (json) args.push("--json");
  return run(args);
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

interface Fixture {
  readonly base: string;
  readonly root: string;
  readonly staging: string;
  readonly mapping: string;
}

const MAPPING_HEADER = ["# 対応表（人手確定済み）", "", "## migration mapping", "", "| 移行元パス | 移行先パス（staging 相対） | 処遇 | 処理状態 | 対応根拠 |", "|---|---|---|---|---|"];

function baseMapping(): string[] {
  return [
    "| .agentdev/intake/inbox/item-a.md | .agentdev/intake/inbox/item-a.md | keep | raw item（未処理） | 同一移行 |",
    "| .agentdev/learning/inbox.md | .agentdev/learning/inbox.md | keep | 未整理（learning-promote 待ち） | 同一移行 |",
    "| docs/requirements/REQ-001.md | docs/requirements/REQ-001.md | keep | — | 同一移行 |",
    "| docs/decisions/DEC-001.md | docs/decisions/DEC-001.md | retire | — | 後継なし廃止の記録 |",
  ];
}

// 移行元 fixture を作り、inventory → build まで実際の手順で実行して staging を用意する。
// expectBuildFail は verify の異常系入力（語彙外等）を含む対応表のため build 失敗を許容する
function makeFixture(mappingRows: string[], expectBuildFail = false): Fixture {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "adf-vm5-"));
  const root = path.join(base, "root");
  const staging = path.join(base, "staging");
  const mapping = path.join(base, "mapping.md");
  write(path.join(root, ".agentdev", "intake", "inbox", "item-a.md"), "内容 本文 #1234\n");
  write(path.join(root, ".agentdev", "learning", "inbox.md"), "# 学び\n\n## エントリ1\n");
  write(path.join(root, "docs", "requirements", "REQ-001.md"), "要件本文\n");
  write(path.join(root, "docs", "decisions", "DEC-001.md"), "決定本文\n");
  write(mapping, [...MAPPING_HEADER, ...mappingRows, ""].join("\n"));
  const f: Fixture = { base, root, staging, mapping };
  const inv = run([INVENTORY, "--root", root]);
  if (inv.status !== 0) throw new Error("inventory fixture 失敗");
  const b = run([BUILD, "--root", root, "--mapping", mapping, "--staging", staging]);
  if (b.status !== 0 && !expectBuildFail) throw new Error("build fixture 失敗: " + b.stderr);
  return f;
}

function cleanup(f: Fixture): void {
  fs.rmSync(f.base, { recursive: true, force: true });
}

describe("v5-migration 非破壊検証ツール", () => {
  test("正常系: 全項目対応表記録済み・内容一致・処理状態一致で移行成功として確定可能（exit 0）", () => {
    const f = makeFixture(baseMapping());
    try {
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("- 欠落: 0 件 / 不整合: 0 件 / 検証不能: 0 件");
      expect(r.stdout).toContain("移行成功として確定可能");
      expect(r.stdout).toContain("切替操作自体は本検証の対象外）");
    } finally {
      cleanup(f);
    }
  });

  test("staging 側実体の欠落を検出し成功確定を拒否する（REQ-109-005）", () => {
    const f = makeFixture(baseMapping());
    try {
      fs.rmSync(path.join(f.staging, "docs", "requirements", "REQ-001.md"));
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("移行成功として確定できない");
      expect(r.stdout).toContain("staging-missing");
      expect(r.stdout).toContain("staging 側実体がありません");
    } finally {
      cleanup(f);
    }
  });

  test("対応表に未記録のインベントリ項目を欠落として検出する（REQ-109-005・008）", () => {
    const rows = baseMapping().filter((l) => !l.includes("DEC-001"));
    const f = makeFixture(rows);
    try {
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("inventory-item-unmapped");
      expect(r.stdout).toContain("docs/decisions/DEC-001.md");
      expect(r.stdout).toContain("対応表に記録されていません");
    } finally {
      cleanup(f);
    }
  });

  test("staging 側内容不一致を不整合として検出する（REQ-109-005）", () => {
    const f = makeFixture(baseMapping());
    try {
      write(path.join(f.staging, "docs", "requirements", "REQ-001.md"), "書換え本文\n");
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("content-hash-mismatch");
      expect(r.stdout).toContain("内容ハッシュが移行元と不一致");
    } finally {
      cleanup(f);
    }
  });

  test("未処理改善情報の処理状態不一致を不整合として検出する（REQ-109-007）", () => {
    const rows = baseMapping().map((l) => l.replace("raw item（未処理）", "処理済み"));
    const f = makeFixture(rows);
    try {
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("process-state-mismatch");
      expect(r.stdout).toContain("処理状態が移行元の値と不一致");
    } finally {
      cleanup(f);
    }
  });

  test("対応表の移行元パス虚参照を検証不能として検出する（REQ-109-008）", () => {
    const rows = [...baseMapping(), "| docs/requirements/REQ-999.md | docs/requirements/REQ-999.md | keep | — | |"];
    const f = makeFixture(rows, true);
    try {
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("mapping-src-not-in-inventory");
      expect(r.stdout).toContain("虚参照");
    } finally {
      cleanup(f);
    }
  });

  test("処遇語彙外を検証不能として検出する（REQ-109-008）", () => {
    const f = makeFixture(baseMapping());
    try {
      const replaced = baseMapping().map((l) => l.replace("| keep |", "| merge |"));
      write(f.mapping, [...MAPPING_HEADER, ...replaced, ""].join("\n"));
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(2);
      expect(r.stdout).toContain("unknown-disposition");
      expect(r.stdout).toContain("処遇語彙外");
    } finally {
      cleanup(f);
    }
  });

  test("対応先パスが移行元と異なる保全は合格とする（REQ-109-001: 旧配置パスの一致を合否条件にしない）", () => {
    const rows = baseMapping().map((l) => l.replace("| .agentdev/intake/inbox/item-a.md | .agentdev/intake/inbox/item-a.md |", "| .agentdev/intake/inbox/item-a.md | v5/inbox/items/item-a.md |"));
    const f = makeFixture(rows);
    try {
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("移行成功として確定可能");
      expect(fs.existsSync(path.join(f.staging, "v5", "inbox", "items", "item-a.md"))).toBe(true);
    } finally {
      cleanup(f);
    }
  });

  test("baseline 対照は合否に非計上であり、baseline 以降の進行差分を対照情報として報告する（DEC-056）", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "adf-vm5b-"));
    const root = path.join(base, "root");
    const staging = path.join(base, "staging");
    const mapping = path.join(base, "mapping.md");
    try {
      write(path.join(root, "docs", "requirements", "REQ-001.md"), "要件本文 v1\n");
      const git = (args: string[]): void => {
        const r = spawnSync("git", ["-c", "user.email=t@example.com", "-c", "user.name=t", ...args], { cwd: root, encoding: "utf8" });
        if (r.status !== 0) throw new Error("git 失敗: " + r.stderr);
      };
      spawnSync("git", ["init"], { cwd: root });
      spawnSync("git", ["add", "."], { cwd: root });
      git(["commit", "-m", "baseline"]);
      git(["tag", "baseline-v4"]);
      // baseline 以降に移行元が進行（baseline と移行元現行が差分）
      write(path.join(root, "docs", "requirements", "REQ-001.md"), "要件本文 v2（baseline 以降の進行）\n");
      write(mapping, [...MAPPING_HEADER, "| docs/requirements/REQ-001.md | docs/requirements/REQ-001.md | keep | — | 同一移行 |", ""].join("\n"));
      const b = run([BUILD, "--root", root, "--mapping", mapping, "--staging", staging]);
      expect(b.status).toBe(0);
      const r = runVerify(root, mapping, staging, "baseline-v4");
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("baseline 対照（baseline-v4）");
      expect(r.stdout).toContain("baseline 以降の進行差分 1 件");
      expect(r.stdout).toContain("移行元現行が正");
      expect(r.stdout).toContain("移行成功として確定可能");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  test("verify は読み取り専用である（実行前後で移行元・staging とも不変）", () => {
    const f = makeFixture(baseMapping());
    try {
      const beforeRoot = snapshotTree(f.root);
      const beforeStaging = snapshotTree(f.staging);
      const r = runVerify(f.root, f.mapping, f.staging);
      expect(r.status).toBe(0);
      const afterRoot = snapshotTree(f.root);
      const afterStaging = snapshotTree(f.staging);
      expect([...afterRoot.keys()].sort()).toEqual([...beforeRoot.keys()].sort());
      expect([...afterStaging.keys()].sort()).toEqual([...beforeStaging.keys()].sort());
    } finally {
      cleanup(f);
    }
  });

  test("--json で機械可読出力を返す（checker 共通 CLI 契約）", () => {
    const f = makeFixture(baseMapping());
    try {
      const ok = runVerify(f.root, f.mapping, f.staging, undefined, true);
      expect(ok.status).toBe(0);
      const parsed = JSON.parse(ok.stdout);
      expect(parsed.ok).toBe(true);
      expect(parsed.summary.missing).toBe(0);
      expect(parsed.summary.inconsistent).toBe(0);
      expect(parsed.summary.unverifiable).toBe(0);
      expect(parsed.findings).toEqual([]);
      fs.rmSync(path.join(f.staging, ".agentdev", "intake", "inbox", "item-a.md"));
      const ng = runVerify(f.root, f.mapping, f.staging, undefined, true);
      expect(ng.status).toBe(2);
      const parsedNg = JSON.parse(ng.stdout);
      expect(parsedNg.ok).toBe(false);
      expect(parsedNg.summary.missing).toBe(1);
      expect(parsedNg.findings.length).toBe(1);
    } finally {
      cleanup(f);
    }
  });
});
