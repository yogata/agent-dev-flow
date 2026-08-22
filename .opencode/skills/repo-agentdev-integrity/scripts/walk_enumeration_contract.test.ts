// ADF-COVERS(verification): REQ-044-001, REQ-044-003
/**
 * 再帰列挙契約の回帰テスト（OU-002、TS-003）。
 *
 * 再帰ファイル探索実装の移行（node:fs glob / globSync への委譲）に先立ち、
 * 各検査器の再帰列挙の現在の受理・拒否挙動をテストデータとして固定する。
 * 移行後も本テストが green であることが、列挙対象ファイル集合・リンク追跡・
 * 隠しディレクトリ・欠落ディレクトリ挙動・列挙決定性の維持証拠となる
 * （checker-execution-contracts Design「再帰ファイル探索と CLI 引数解析の標準API移行」節）。
 *
 * 固定する挙動:
 * - 対象ファイル集合（拡張子フィルタ、単一ディレクトリと再帰の違い）
 * - ディレクトリ単位のスキップ（node_modules / .git は実装ごとに異なる）
 * - symlink / junction ディレクトリを下降しない、リンクファイルをファイルとして報告しない
 * - リポジトリルート直下の隠しディレクトリ（.opencode 等）を列挙対象に含める
 * - 存在しないディレクトリは空（エラー送出なし）
 * - 列挙結果は正規化後パスの sort 順で決定的
 */

import { describe, expect, test } from "bun:test";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { listFilesRecursive, listYamlFilesRecursive, listMarkdownFiles } from "./check_extensions.ts";
import { listFilesRecursive as listFilesRecursivePreventive } from "./check_workflow_preventive.ts";
import { listMarkdownRecursive as listMarkdownRecursiveExecutor } from "./check_executor_notation.ts";
import { listMarkdownRecursive as listMarkdownRecursiveDelegation } from "./check_delegation_contract_residual.ts";
import { listMarkdownRecursive as listMarkdownRecursiveRetired } from "./check_retired_artifact_residual.ts";
import { walkMarkdown, collectMarkdownTree, walkAllFiles } from "./check_integrity.ts";
import { discoverTestFiles } from "./check_test_impact.ts";
import { collectReferenceMarkdownFiles } from "./lint_skills.ts";

const ROOTS: string[] = [];

function buildFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-walk-contract-"));
  ROOTS.push(root);
  for (const d of ["sub/deep", "node_modules", ".git", "refs/nested"]) {
    fs.mkdirSync(path.join(root, ...d.split("/")), { recursive: true });
  }
  const files: Record<string, string> = {
    "a.md": "a",
    "notes.md": "n",
    "b.yaml": "b",
    "c.yml": "c",
    "t.ts": "t",
    "skip.txt": "s",
    "sub/x.md": "x",
    "sub/deep/y.md": "y",
    "sub/e.yml": "e",
    "node_modules/nm.md": "nm",
    ".git/gm.md": "gm",
    "refs/r1.md": "r1",
    "refs/nested/r2.md": "r2",
    "refs/skip.txt": "st",
  };
  for (const [relPath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, ...relPath.split("/")), content);
  }
  return root;
}

interface LinkFixture {
  root: string;
  junctionCreated: boolean;
  fileLinkCreated: boolean;
}

function buildLinkFixture(): LinkFixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-walk-links-"));
  ROOTS.push(root);
  fs.mkdirSync(path.join(root, "realdir"), { recursive: true });
  fs.writeFileSync(path.join(root, "plain.md"), "p");
  fs.writeFileSync(path.join(root, "realdir", "inner.md"), "i");
  let junctionCreated = true;
  try {
    // junction は Windows で昇格不要。失敗時（非 Windows 等）は当該検証をスキップ。
    fs.symlinkSync(path.join(root, "realdir"), path.join(root, "jdir"), "junction");
  } catch {
    junctionCreated = false;
  }
  let fileLinkCreated = true;
  try {
    fs.symlinkSync(path.join(root, "plain.md"), path.join(root, "slink.md"), "file");
  } catch {
    fileLinkCreated = false;
  }
  return { root, junctionCreated, fileLinkCreated };
}

function buildTestImpactFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-testimpact-"));
  ROOTS.push(root);
  const layout: Record<string, string> = {
    "a.test.ts": "a",
    "sub/b.test.ts": "b",
    "sub/plain.ts": "p",
    ".opencode/skills/demo/x.test.ts": "x",
    "node_modules/d.test.ts": "d",
    // 任意階層の node_modules 配下も除外する（Issue #2383 (c)、PR 2357 観測の依存テスト混入）
    "src/opencode/skills/demo/scripts/node_modules/zod/lib/n.test.ts": "n",
    ".worktrees/e.test.ts": "e",
    ".git/f.test.ts": "f",
    "docs/requirements/retired/g.test.ts": "g",
    "docs/decisions/retired/i.test.ts": "i",
    "src/h.test.ts": "h",
  };
  for (const [relPath, content] of Object.entries(layout)) {
    fs.mkdirSync(path.join(root, ...relPath.split("/").slice(0, -1)), { recursive: true });
    fs.writeFileSync(path.join(root, ...relPath.split("/")), content);
  }
  return root;
}

function rel(root: string, files: readonly string[]): string[] {
  return files.map((f) => path.relative(root, f).replace(/\\/g, "/"));
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

describe("再帰列挙契約: 対象ファイル集合と拡張子フィルタ（固定データ）", () => {
  test("check_extensions listFilesRecursive: 全ファイル・forward slash・sort 済み", () => {
    const root = buildFixture();
    const out = listFilesRecursive(root);
    expect(sorted(rel(root, out))).toEqual([
      ".git/gm.md",
      "a.md",
      "b.yaml",
      "c.yml",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "refs/skip.txt",
      "skip.txt",
      "sub/deep/y.md",
      "sub/e.yml",
      "sub/x.md",
      "t.ts",
    ]);
  });

  test("check_extensions listYamlFilesRecursive: yaml/yml のみ", () => {
    const root = buildFixture();
    const out = listYamlFilesRecursive(root);
    expect(sorted(rel(root, out))).toEqual(["b.yaml", "c.yml", "sub/e.yml"]);
  });

  test("check_extensions listMarkdownFiles(recursive=false): 直下の .md のみ", () => {
    const root = buildFixture();
    const out = listMarkdownFiles(root, false);
    expect(sorted(rel(root, out))).toEqual(["a.md", "notes.md"]);
  });

  test("check_workflow_preventive listFilesRecursive: 拡張子フィルタ付き", () => {
    const root = buildFixture();
    expect(sorted(rel(root, listFilesRecursivePreventive(root, [".md", ".ts"])))).toEqual([
      ".git/gm.md",
      "a.md",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "sub/deep/y.md",
      "sub/x.md",
      "t.ts",
    ]);
    expect(sorted(rel(root, listFilesRecursivePreventive(root)))).toEqual([
      ".git/gm.md",
      "a.md",
      "b.yaml",
      "c.yml",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "refs/skip.txt",
      "skip.txt",
      "sub/deep/y.md",
      "sub/e.yml",
      "sub/x.md",
      "t.ts",
    ]);
  });

  test("check_executor_notation listMarkdownRecursive: node_modules/.git をスキップ", () => {
    const root = buildFixture();
    expect(sorted(rel(root, listMarkdownRecursiveExecutor(root)))).toEqual([
      "a.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "sub/deep/y.md",
      "sub/x.md",
    ]);
  });

  test("check_delegation/retired listMarkdownRecursive: スキップなしで全 .md", () => {
    const root = buildFixture();
    const expected = [
      ".git/gm.md",
      "a.md",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "sub/deep/y.md",
      "sub/x.md",
    ];
    expect(sorted(rel(root, listMarkdownRecursiveDelegation(root)))).toEqual(expected);
    expect(sorted(rel(root, listMarkdownRecursiveRetired(root)))).toEqual(expected);
  });

  test("check_integrity walkMarkdown / collectMarkdownTree / walkAllFiles", () => {
    const root = buildFixture();
    const mdAcc: string[] = [];
    walkMarkdown(root, mdAcc);
    const expectedMd = [
      ".git/gm.md",
      "a.md",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "sub/deep/y.md",
      "sub/x.md",
    ];
    expect(sorted(rel(root, mdAcc))).toEqual(expectedMd);
    expect(sorted(rel(root, collectMarkdownTree(root)))).toEqual(expectedMd);

    const allAcc: string[] = [];
    walkAllFiles(root, allAcc);
    expect(sorted(rel(root, allAcc))).toEqual([
      ".git/gm.md",
      "a.md",
      "b.yaml",
      "c.yml",
      "node_modules/nm.md",
      "notes.md",
      "refs/nested/r2.md",
      "refs/r1.md",
      "sub/deep/y.md",
      "sub/e.yml",
      "sub/x.md",
    ]);
  });

  test("lint_skills collectReferenceMarkdownFiles: references 配下の .md を再帰収集", () => {
    const root = buildFixture();
    const out = collectReferenceMarkdownFiles(path.join(root, "refs"));
    expect(sorted(rel(root, out))).toEqual(["refs/nested/r2.md", "refs/r1.md"]);
  });
});

describe("再帰列挙契約: 欠落ディレクトリとリンク追跡", () => {
  test("存在しないディレクトリは空を返し例外を送出しない", () => {
    const root = buildFixture();
    const missing = path.join(root, "does", "not", "exist");
    expect(listFilesRecursive(missing)).toEqual([]);
    expect(listYamlFilesRecursive(missing)).toEqual([]);
    expect(listMarkdownFiles(missing, false)).toEqual([]);
    expect(listFilesRecursivePreventive(missing)).toEqual([]);
    expect(listMarkdownRecursiveExecutor(missing)).toEqual([]);
    expect(listMarkdownRecursiveDelegation(missing)).toEqual([]);
    expect(listMarkdownRecursiveRetired(missing)).toEqual([]);
    const mdAcc: string[] = [];
    walkMarkdown(missing, mdAcc);
    expect(mdAcc).toEqual([]);
    expect(collectMarkdownTree(missing)).toEqual([]);
    const allAcc: string[] = [];
    walkAllFiles(missing, allAcc);
    expect(allAcc).toEqual([]);
    expect(discoverTestFiles(missing, "**/*.test.ts")).toEqual([]);
    expect(collectReferenceMarkdownFiles(missing)).toEqual([]);
  });

  test("junction/symlink ディレクトリを下降せず、リンクファイルを報告しない", () => {
    const { root, junctionCreated, fileLinkCreated } = buildLinkFixture();
    const rels = sorted(rel(root, listFilesRecursive(root)));
    expect(rels).toContain("plain.md");
    expect(rels).toContain("realdir/inner.md");
    if (junctionCreated) {
      expect(rels.some((r) => r.startsWith("jdir/"))).toBe(false);
    }
    if (fileLinkCreated) {
      expect(rels).not.toContain("slink.md");
    }
  });
});

describe("再帰列挙契約: check_test_impact のテストファイル発見", () => {
  test("隠しディレクトリ配下を含み、除外ディレクトリを除く（決定的 sort）", () => {
    const root = buildTestImpactFixture();
    const out = discoverTestFiles(root, "**/*.test.ts");
    // 現行のパターン解釈では "**/" 先頭パターンは必ず / を含む相対パスのみ
    // マッチする（リポジトリルート直下のファイルは対象外）。
    expect(rel(root, out)).toEqual([
      ".opencode/skills/demo/x.test.ts",
      "src/h.test.ts",
      "sub/b.test.ts",
    ]);
    // 決定性: 同一入力から同一順序
    expect(discoverTestFiles(root, "**/*.test.ts")).toEqual(out);
  });
});

process.on("exit", () => {
  for (const r of ROOTS) {
    try {
      fs.rmSync(r, { recursive: true, force: true });
    } catch {
      // tmp クリーンアップはベストエフォート
    }
  }
});
