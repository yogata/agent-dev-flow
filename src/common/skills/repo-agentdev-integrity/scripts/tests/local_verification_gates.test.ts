// ADF-COVERS(verification): REQ-122-009, REQ-122-010
// ローカル検証ゲート（scripts/git-hooks/pre-push、scripts/setup-hooks.ts）の恒常的契約検証
// （docs/designs/integrity/local-verification-gates.md）。
// pre-push は既存の正規決定論的チェッカーを呼ぶだけの薄いラッパーであり、フック独自の
// しきい値判定・ファイルサイズ計算・キュー監視を持たないことを検査する
// （pre-commit・minimal-gate は 2026-11-21 に廃止。単一ゲート構成）。
// テスト実行 cwd はリポジトリルート（REQ-060 bun test 実行形態）を前提とする。

import { test, expect } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const HOOKS_DIR = path.join(REPO_ROOT, "scripts", "git-hooks");
const PRE_PUSH_PATH = path.join(HOOKS_DIR, "pre-push");
const SETUP_HOOKS_PATH = path.join(REPO_ROOT, "scripts", "setup-hooks.ts");
const GITATTRIBUTES_PATH = path.join(REPO_ROOT, ".gitattributes");

function countCarriageReturns(content: string): number {
  let count = 0;
  for (const byte of Buffer.from(content, "utf-8")) {
    if (byte === 0x0d) count += 1;
  }
  return count;
}

test("REQ-122-009: pre-push が存在し bash 薄ラッパー契約を満たす（shebang・set -euo pipefail・REPO_ROOT 起点）", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  expect(content.split("\n")[0]).toBe("#!/usr/bin/env bash");
  expect(content).toContain("set -euo pipefail");
  expect(content).toContain('REPO_ROOT="$(git rev-parse --show-toplevel)"');
});

test("REQ-122-009: pre-push は LF 固定（CRLF 混入により Git-for-Windows bash で実行破壊するため）", () => {
  expect(countCarriageReturns(fs.readFileSync(PRE_PUSH_PATH, "utf-8"))).toBe(0);
});

test("REQ-122-009: pre-commit・minimal-gate は存在しない（単一ゲート構成）", () => {
  expect(fs.existsSync(path.join(HOOKS_DIR, "pre-commit"))).toBe(false);
  expect(fs.existsSync(path.join(HOOKS_DIR, "minimal-gate.mjs"))).toBe(false);
});

test("REQ-122-009: pre-push は既存チェッカー3呼び出しの薄いラッパーである", () => {
  const content = fs.readFileSync(PRE_PUSH_PATH, "utf-8");
  expect(content).toContain(".opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts");
  expect(content).toContain(".opencode/skills/repo-agentdev-integrity/scripts/cli.ts");
  expect(content).toContain("bun test ./src/common/skills/repo-agentdev-integrity/scripts/");
  // 独自ゲートロジックの残存なし: しきい値判定・キュー監視・トレーサビリティ検証は持たない
  expect(content).not.toContain("minimal-gate");
  expect(content).not.toContain("agentdev-traceability");
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
