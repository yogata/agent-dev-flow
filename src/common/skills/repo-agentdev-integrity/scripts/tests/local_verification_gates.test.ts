// ADF-COVERS(verification): REQ-122-008, REQ-122-009, REQ-122-010
// ローカル検証ゲート（scripts/git-hooks/pre-commit・pre-push、scripts/setup-hooks.ts）の
// 恒常的契約検証（DEC-066 決定1〜3、docs/designs/integrity/local-verification-gates.md）。
// hook 契約の決定的機械検査（shebang・LF 固定・worktree 対応・--no-verify 案内・
// bun test 実行形態・セットアップ資産の成立）を行う。
// テスト実行 cwd はリポジトリルート（REQ-060 bun test 実行形態）を前提とする。

import { test, expect } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const PRE_COMMIT_PATH = path.join(REPO_ROOT, "scripts", "git-hooks", "pre-commit");
const PRE_PUSH_PATH = path.join(REPO_ROOT, "scripts", "git-hooks", "pre-push");
const SETUP_HOOKS_PATH = path.join(REPO_ROOT, "scripts", "setup-hooks.ts");
const GITATTRIBUTES_PATH = path.join(REPO_ROOT, ".gitattributes");

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf-8");
}

function countCarriageReturns(content: string): number {
  let count = 0;
  for (const byte of Buffer.from(content, "utf-8")) {
    if (byte === 0x0d) count += 1;
  }
  return count;
}

test("REQ-122-008/009: hook スクリプトが存在し bash 薄ラッパー契約を満たす", () => {
  for (const hookPath of [PRE_COMMIT_PATH, PRE_PUSH_PATH]) {
    expect(fs.existsSync(hookPath)).toBe(true);
    const content = fs.readFileSync(hookPath, "utf-8");
    const lines = content.split("\n");
    expect(lines[0]).toBe("#!/usr/bin/env bash");
    expect(content).toContain("set -euo pipefail");
  }
});

test("REQ-122-008/009: hook スクリプトは LF 固定（CRLF 混入により Git-for-Windows bash で実行破壊するため）", () => {
  expect(countCarriageReturns(fs.readFileSync(PRE_COMMIT_PATH, "utf-8"))).toBe(0);
  expect(countCarriageReturns(fs.readFileSync(PRE_PUSH_PATH, "utf-8"))).toBe(0);
});

test("REQ-122-008: pre-commit は REPO_ROOT を git rev-parse --show-toplevel 起点（worktree 対応）とし、失敗時に --no-verify 案内を出す", () => {
  const content = fs.readFileSync(PRE_COMMIT_PATH, "utf-8");
  expect(content).toContain('REPO_ROOT="$(git rev-parse --show-toplevel)"');
  expect(content).toContain("--no-verify");
});

test("REQ-122-008: pre-commit は src/ ステージング検出時の投影自動実行（self-sync.ps1 -Mode apply）と .opencode/ 自動ステージを行う", () => {
  const content = fs.readFileSync(PRE_COMMIT_PATH, "utf-8");
  expect(content).toContain("self-sync.ps1");
  expect(content).toContain("-Mode apply");
  expect(content).toContain("git diff --cached --name-only");
  expect(content).toMatch(/git add -- "\$p"/);
});

test("REQ-122-008: pre-commit は cli.ts --changed 差分整合性チェックとインデックス鮮度チェック（docs/・src/ 変更時）を実行する", () => {
  const content = fs.readFileSync(PRE_COMMIT_PATH, "utf-8");
  expect(content).toContain('bun run "$CLI" --root "$REPO_ROOT" --changed');
  expect(content).toContain("check_autogen_freshness.ts");
  expect(content).toMatch(/docs\/\*\|src\/\*/);
});

test("REQ-122-009: pre-push は cli.ts 全量実行・トレーサビリティ検証・検証エンジン テストスイートの 3 Step を実行する", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  expect(content).toContain('bun run "$CLI" --root "$REPO_ROOT"');
  expect(content).toContain("agentdev-traceability/scripts/src/check.ts");
  expect(content).toContain("bun test");
});

test("REQ-122-009: pre-push の bun test 実行形態はリポジトリルート cwd と ./ 付き相対パス（REQ-060）に従う", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  expect(content).toMatch(/ENGINE_TEST_TARGET="\.\/\./);
  expect(content).toMatch(/cd "\$REPO_ROOT" && env -u GIT_DIR [^\n]*bun test "\$ENGINE_TEST_TARGET"/);
});

test("REQ-122-009: pre-push Step 3 はフック環境変数（GIT_DIR 等）を無効化してテストスイートを実行する", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  // git push がフックへ渡す GIT_* 環境変数が残ると、テストスイートのネスト git フィクスチャの操作が
  // 外側の実リポジトリへ横取りされ、ブランチ・設定・リモートが破壊される。無効化を必須とする。
  expect(content).toMatch(/env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE/);
  expect(content).toContain("-u GIT_QUARANTINE_PATH");
  expect(content).toContain("-u GIT_OBJECT_DIRECTORY");
  expect(content).toContain("-u GIT_ALTERNATE_OBJECT_DIRECTORIES");
  expect(content).toContain("-u GIT_PREFIX");
});

test("REQ-122-009: pre-push Step 2 は corpus 完全性（missing-*）を advisory・fail-open として層別し、構造検査 fail はブロックする", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  expect(content).toContain("missing-design");
  expect(content).toContain("missing-implementation");
  expect(content).toContain("missing-verification");
  expect(content).toContain("advisory");
  expect(content).toMatch(/構造検査 fail/);
  // check.ts の実行エラー（終了コード 1）は fail-closed でブロックする
  expect(content).toMatch(/TRACE_EXIT" -eq 1/);
});

test("REQ-122-010: setup-hooks.ts が存在し core.hooksPath 冪等設定・実行権限付与・.gitattributes 追記を実装する", () => {
  expect(fs.existsSync(SETUP_HOOKS_PATH)).toBe(true);
  const content = fs.readFileSync(SETUP_HOOKS_PATH, "utf-8");
  expect(content).toContain('"config", "--get", "core.hooksPath"');
  expect(content).toContain('"config", "core.hooksPath", HOOKS_PATH_SETTING');
  expect(content).toContain("fs.chmodSync(hookPath, 0o755)");
  expect(content).toContain("writeFileSync");
  expect(content).toContain("GITATTRIBUTES_LINE");
  expect(content).toContain('rev-parse", "--show-toplevel"');
});

test("REQ-122-010: .gitattributes に scripts/git-hooks/* text eol=lf が存在する", () => {
  const gitattributes = fs.readFileSync(GITATTRIBUTES_PATH, "utf-8");
  const lines = gitattributes.split(/\r?\n/).map((line) => line.trim());
  expect(lines).toContain("scripts/git-hooks/* text eol=lf");
});
