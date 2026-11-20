// ADF-COVERS(verification): REQ-122-008, REQ-122-009, REQ-122-010
// ローカル検証ゲート（scripts/git-hooks/pre-commit・pre-push、scripts/setup-hooks.ts、
// scripts/git-hooks/minimal-gate.mjs）の恒常的契約検証（DEC-066 決定1〜3、
// docs/designs/integrity/local-verification-gates.md）。
// hook 契約の決定的機械検査（shebang・LF 固定・worktree 対応・--no-verify 案内・
// bun test 実行形態・セットアップ資産の成立）と、minimal-gate.mjs の挙動
// （新規ファイルのサイズ上限ブロック・既存超過ファイル編集の WARN・本文テキストの
// 非検査・墓標なし・WIP 滞留とガバナンス表面積の WARN）を行う。
// テスト実行 cwd はリポジトリルート（REQ-060 bun test 実行形態）を前提とする。

import { test, expect } from "bun:test";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const REPO_ROOT = process.cwd();
const PRE_COMMIT_PATH = path.join(REPO_ROOT, "scripts", "git-hooks", "pre-commit");
const PRE_PUSH_PATH = path.join(REPO_ROOT, "scripts", "git-hooks", "pre-push");
const SETUP_HOOKS_PATH = path.join(REPO_ROOT, "scripts", "setup-hooks.ts");
const GITATTRIBUTES_PATH = path.join(REPO_ROOT, ".gitattributes");
const GATE_SCRIPT_PATH = path.join(REPO_ROOT, "scripts", "git-hooks", "minimal-gate.mjs");
// git push のフックから export された GIT_* 変数がフィクスチャの git 操作を横取りしないよう除外する。
const CLEAN_ENV: Record<string, string> = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")),
);

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

// --- minimal-gate.mjs 挙動検証（一時フィクスチャリポジトリで実行） ---

function fixtureGit(cwd: string, args: string[]): void {
  const result = spawnSync("git", args, { cwd, env: CLEAN_ENV, encoding: "utf-8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
}

function makeFixtureRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mg-fixture-"));
  fixtureGit(dir, ["init", "--quiet"]);
  fixtureGit(dir, ["config", "user.email", "fixture@example.com"]);
  fixtureGit(dir, ["config", "user.name", "fixture"]);
  fs.writeFileSync(path.join(dir, "README.md"), "fixture\n", "utf-8");
  fixtureGit(dir, ["add", "-A"]);
  fixtureGit(dir, ["commit", "--quiet", "-m", "init"]);
  return dir;
}

function stageFixtureFile(cwd: string, rel: string, content: string): void {
  const p = path.join(cwd, ...rel.split("/"));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf-8");
  fixtureGit(cwd, ["add", "--", rel]);
}

function writeFixtureFile(cwd: string, rel: string, content: string): void {
  const p = path.join(cwd, ...rel.split("/"));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf-8");
}

function runGate(cwd: string): { status: number; out: string } {
  const result = spawnSync(process.execPath, [GATE_SCRIPT_PATH, "pre-commit"], {
    cwd,
    env: CLEAN_ENV,
    encoding: "utf-8",
  });
  return { status: result.status ?? -1, out: `${result.stdout ?? ""}\n${result.stderr ?? ""}` };
}

test("REQ-122-008: minimal-gate.mjs は総数検査・語彙スキャン・墓標監視を持たない", () => {
  const content = fs.readFileSync(GATE_SCRIPT_PATH, "utf-8");
  expect(content).toContain("FILE_SIZE_LIMITS");
  expect(content).toContain("WIP_QUEUE_DIRS");
  expect(content).not.toContain("ACCUMULATION_RE");
  expect(content).not.toContain("LEGACY_PATH_RES");
  expect(content).not.toContain("AREAS");
});

test("REQ-122-008: baseline・後方互換等を含む新規ファイルの本文はブロックしない", () => {
  const dir = makeFixtureRepo();
  try {
    stageFixtureFile(
      dir,
      "docs/migration-note.md",
      "# 説明\n後方互換のためのシム、baseline、retired 資産の説明文。\n",
    );
    const r = runGate(dir);
    expect(r.status).toBe(0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: 存在しない過去資産のパス（baselines/ 等）の新規追加は監視しない（墓標なし）", () => {
  const dir = makeFixtureRepo();
  try {
    stageFixtureFile(dir, "baselines/core.md", "x\n");
    stageFixtureFile(dir, "src/retired-map.ts", "export {};\n");
    const r = runGate(dir);
    expect(r.status).toBe(0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: 新規追加ファイルのサイズ上限超過はブロックする（.md 20KB・.ts 25KB）", () => {
  const dir = makeFixtureRepo();
  try {
    stageFixtureFile(dir, "docs/big-new.md", `${"x".repeat(21 * 1024)}\n`);
    expect(runGate(dir).status).toBe(1);
    fixtureGit(dir, ["rm", "--quiet", "--cached", "--", "docs/big-new.md"]);
    stageFixtureFile(dir, "src/big-new.ts", `export const a = "${"x".repeat(26 * 1024)}";\n`);
    expect(runGate(dir).status).toBe(1);
    fixtureGit(dir, ["rm", "--quiet", "--cached", "--", "src/big-new.ts"]);
    // RU-0304.md 級（17KB）の通常ドキュメントは通過する。
    stageFixtureFile(dir, "docs/normal-new.md", `${"x".repeat(17 * 1024)}\n`);
    expect(runGate(dir).status).toBe(0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: .agentdev/ 配下（一時ワークスペース）の新規ファイル超過は WARN 表示のみでブロックしない", () => {
  const dir = makeFixtureRepo();
  try {
    // 忠実な req-draft と同規模の 36KB 新規 .md でも終了コード 0。
    stageFixtureFile(dir, ".agentdev/drafts/req-draft-example.md", `${"x".repeat(36 * 1024)}\n`);
    const r = runGate(dir);
    expect(r.status).toBe(0);
    expect(r.out).toContain("WARN");
    expect(r.out).toContain(".agentdev/drafts/req-draft-example.md");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: 既存の上限超過ファイルを編集してもブロックせず WARN 表示（終了コード 0）", () => {
  const dir = makeFixtureRepo();
  try {
    stageFixtureFile(dir, "docs/big-old.md", `${"x".repeat(21 * 1024)}\n`);
    fixtureGit(dir, ["commit", "--quiet", "-m", "big"]);
    stageFixtureFile(dir, "docs/big-old.md", `${"x".repeat(21 * 1024 - 512)}\n`);
    const r = runGate(dir);
    expect(r.status).toBe(0);
    expect(r.out).toContain("WARN");
    expect(r.out).toContain("big-old.md");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: WIP キュー滞留は WARN 表示のみ（.gitkeep・README.md は集計から除外）", () => {
  const dir = makeFixtureRepo();
  try {
    // 10 実ファイル + README.md + .gitkeep×50 = 集計 10（目安 10 以下）→ WARN なし。
    for (let i = 0; i < 10; i++) {
      writeFixtureFile(dir, `.agentdev/backlog/req-units/RU-900${i}.md`, "x\n");
    }
    writeFixtureFile(dir, ".agentdev/backlog/req-units/README.md", "# backlog\n");
    for (let i = 0; i < 50; i++) {
      writeFixtureFile(dir, `.agentdev/learning/inbox/q${i}/.gitkeep`, "");
    }
    stageFixtureFile(dir, "one.txt", "x\n");
    const ok = runGate(dir);
    expect(ok.status).toBe(0);
    expect(ok.out).not.toContain("WARN");
    // 11 実ファイルで目安超過 → WARN 表示（終了コード 0）。
    writeFixtureFile(dir, ".agentdev/backlog/req-units/RU-9010.md", "x\n");
    const warned = runGate(dir);
    expect(warned.status).toBe(0);
    expect(warned.out).toContain("WARN");
    expect(warned.out).toContain("11");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: ガバナンス表面積（IR ルール 25・公開コマンド 15）超過は WARN 表示のみ", () => {
  const dir = makeFixtureRepo();
  try {
    for (let i = 0; i < 26; i++) {
      writeFixtureFile(dir, `src/common/skills/repo-agentdev-integrity/rules/ir-9${String(i).padStart(2, "0")}.ts`, "export {};\n");
    }
    for (let i = 0; i < 16; i++) {
      writeFixtureFile(dir, `src/common/commands/agentdev/cmd-${i}.md`, "# cmd\n");
    }
    stageFixtureFile(dir, "one.txt", "x\n");
    const r = runGate(dir);
    expect(r.status).toBe(0);
    expect(r.out).toContain("IR ルール 26 件");
    expect(r.out).toContain("公開コマンド 16 件");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("REQ-122-008: 総ファイル数・総容量の検査は行わない（1301 ファイルの追加増加も警告なし）", () => {
  const dir = makeFixtureRepo();
  try {
    fs.mkdirSync(path.join(dir, "many"), { recursive: true });
    for (let i = 0; i < 1301; i++) {
      fs.writeFileSync(path.join(dir, "many", `f${i}.txt`), "x\n");
    }
    fixtureGit(dir, ["add", "-A"]);
    fixtureGit(dir, ["commit", "--quiet", "-m", "many"]);
    stageFixtureFile(dir, "one-more.txt", "x\n");
    const r = runGate(dir);
    expect(r.status).toBe(0);
    expect(r.out).not.toContain("WARN");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
