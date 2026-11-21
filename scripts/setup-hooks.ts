// ADF-COVERS(implementation): REQ-122-010
// scripts/setup-hooks.ts — ローカル検証ゲートのセットアップ入口。
// DEC-021（scripts 公開入口の2本固定）の3本への限定拡張（DEC-066 決定3）。
// 実行契約は ACT-DESIGN-002「セットアップ（scripts/setup-hooks.ts）」が所有する。
//
// 使い方（リポジトリルートをカレントディレクトリとして実行する。通常クローンと
// worktree の双方に対応する）:
//   bun run scripts/setup-hooks.ts
//
// 行う処理（冪等。再実行時は設定済みの処理をスキップして報告する）:
//   1. git config core.hooksPath scripts/git-hooks の設定（設定済みはスキップ）
//   2. scripts/git-hooks/pre-push への実行権限付与（fs.chmodSync 0o755。
//      git index 上の実行権限も best-effort で付与する。Unix クローン実効性のため）
//   3. .gitattributes への scripts/git-hooks/* text eol=lf 追記（記載済みはスキップ。
//      CRLF 混入による hook 実行エラー防止）
//
// ルート package.json は存在しないため scripts セクション追記は適用外とする（CR-006）。

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

const EXIT_OK = 0;
const EXIT_ERROR = 1;

const HOOKS_PATH_SETTING = "scripts/git-hooks";
const HOOK_FILES = ["pre-push"] as const;
const GITATTRIBUTES_LINE = "scripts/git-hooks/* text eol=lf";

function runGit(args: readonly string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf-8",
    maxBuffer: 8 * 1024 * 1024,
  }) as string;
}

function runGitQuiet(args: readonly string[], cwd: string): string | null {
  try {
    return runGit(args, cwd);
  } catch {
    return null;
  }
}

function trim(value: string | null): string {
  return (value ?? "").trim();
}

interface StepOutcome {
  detail: string;
}

function configureHooksPath(repoRoot: string): StepOutcome {
  const current = runGitQuiet(["config", "--get", "core.hooksPath"], repoRoot);
  const normalized = trim(current ?? "");
  if (normalized === HOOKS_PATH_SETTING) {
    return { detail: `core.hooksPath は設定済みのためスキップしました（${HOOKS_PATH_SETTING}）` };
  }
  runGit(["config", "core.hooksPath", HOOKS_PATH_SETTING], repoRoot);
  const verify = trim(runGitQuiet(["config", "--get", "core.hooksPath"], repoRoot) ?? "");
  if (verify !== HOOKS_PATH_SETTING) {
    throw new Error(`core.hooksPath の設定検証に失敗しました（期待: ${HOOKS_PATH_SETTING}、実測: ${verify || "(unset)"}）`);
  }
  return { detail: `core.hooksPath を設定しました（${HOOKS_PATH_SETTING}）` };
}

function grantExecutePermissions(repoRoot: string): string[] {
  const lines: string[] = [];
  for (const hookFile of HOOK_FILES) {
    const hookPath = path.join(repoRoot, "scripts", "git-hooks", hookFile);
    if (!fs.existsSync(hookPath)) {
      throw new Error(
        `hook スクリプトが存在しません: ${path.relative(repoRoot, hookPath)}（スクリプト同梱状態を確認してください）`,
      );
    }
    fs.chmodSync(hookPath, 0o755);
    lines.push(`実行権限を付与しました: ${path.relative(repoRoot, hookPath)} (0o755)`);
  }
  // git index 上の実行権限（Unix クローンでの実効性）。index 未登録のファイルは
  // 対象外とし、案内表示のみ（セットアップ自体は継続）。
  const tracked = HOOK_FILES.filter((f) => {
    const listing = runGitQuiet(["ls-files", "--", `scripts/git-hooks/${f}`], repoRoot);
    return trim(listing).length > 0;
  });
  if (tracked.length === 0) {
    lines.push(
      "案内: git index 上の実行権限付与はスキップされました（ファイルが未コミットの場合は発生します。コミット後に再実行すると付与されます）",
    );
  } else {
    runGit(["update-index", "--chmod=+x", ...tracked.map((f) => `scripts/git-hooks/${f}`)], repoRoot);
    lines.push(`git index 上の実行権限を付与しました（update-index --chmod=+x: ${tracked.join(", ")}）`);
  }
  return lines;
}

function appendGitattributes(repoRoot: string): StepOutcome {
  const gitattributesPath = path.join(repoRoot, ".gitattributes");
  const existing = fs.readFileSync(gitattributesPath, "utf-8");
  const hasLine = existing
    .split(/\r?\n/)
    .some((line) => line.trim() === GITATTRIBUTES_LINE);
  if (hasLine) {
    return { detail: ".gitattributes の eol=lf 記載は既存のためスキップしました" };
  }
  // UTF-8（BOM なし）+ LF で追記する（末尾改行の有無を吸収して1行追加）。
  const separator = existing.endsWith("\n") || existing.length === 0 ? "" : "\n";
  fs.writeFileSync(
    gitattributesPath,
    `${existing}${separator}# Git hooks（Git-for-Windows bash で実行されるため LF 固定。CRLF 混入による実行エラー防止）\n${GITATTRIBUTES_LINE}\n`,
    "utf-8",
  );
  return { detail: `.gitattributes に追記しました: ${GITATTRIBUTES_LINE}` };
}

function main(): number {
  // worktree 対応: --show-toplevel は worktree root を返す（通常クローンでは repo root）。
  let repoRoot: string;
  try {
    repoRoot = trim(runGit(["rev-parse", "--show-toplevel"], process.cwd()));
  } catch {
    process.stderr.write(
      "[setup-hooks] git リポジトリの外から実行されました。リポジトリルート（または worktree root）で実行してください。\n",
    );
    return EXIT_ERROR;
  }
  // --git-common-dir は通常クローンで相対 ".git"、worktree で絶対パスを返す。
  const commonDir = trim(runGitQuiet(["rev-parse", "--git-common-dir"], repoRoot) ?? "");
  const inWorktree = path.isAbsolute(commonDir);

  console.log(`[setup-hooks] 対象リポジトリルート: ${repoRoot}${inWorktree ? "（worktree）" : ""}`);

  const outcomes: string[] = [];
  try {
    const hooksPathOutcome = configureHooksPath(repoRoot);
    outcomes.push(hooksPathOutcome.detail);
    outcomes.push(...grantExecutePermissions(repoRoot));
    const gitattributesOutcome = appendGitattributes(repoRoot);
    outcomes.push(gitattributesOutcome.detail);
  } catch (e) {
    process.stderr.write(
      `[setup-hooks] セットアップに失敗しました: ${e instanceof Error ? e.message : String(e)}\n`,
    );
    for (const line of outcomes) {
      console.log(`[setup-hooks] 実行済み処理: ${line}`);
    }
    return EXIT_ERROR;
  }

  for (const line of outcomes) {
    console.log(`[setup-hooks] ${line}`);
  }
  console.log(
    "[setup-hooks] 確認: git config --get core.hooksPath が scripts/git-hooks を返すことを確認してください。",
  );
  console.log("[setup-hooks] 完了しました。以後の push でローカル検証ゲート（pre-push）が動作します。");
  return EXIT_OK;
}

process.exit(main());
