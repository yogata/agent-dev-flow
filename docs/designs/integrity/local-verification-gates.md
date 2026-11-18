---
title: ローカル検証ゲート Design
status: draft
created: 2026-11-18
updated: "2026-11-18"
---

<!-- ADF-COVERS(design): REQ-122-008, REQ-122-009, REQ-122-010, REQ-122-015（ローカル検証ゲートと最終検証の実行契約。REQ-116 型の covers 宣言） -->

# ローカル検証ゲート Design

バージョン管理された Git Hook による決定論的ローカル検証ゲートの実行契約を所有する
（ローカル Git Hook 決定論的ゲート Decision の実行契約）。

## pre-commit（scripts/git-hooks/pre-commit、目標2秒）

シェルスクリプト本体は薄いラッパーとし、実処理は TypeScript（Bun 実行）または #!/usr/bin/env bash
（set -euo pipefail）で明確なエラーメッセージを出力する構成とする。REPO_ROOT は
git rev-parse --show-toplevel を起点とする（worktree 環境対応）。

- Step 1（src/ → .opencode/ 自動投影・同期）: git diff --cached --name-only に src/ 配下のファイルが
  含まれる場合のみ投影・ビルドスクリプトを自動実行し、投影で更新された .opencode/ 配下の差分を
  git add .opencode/ でステージングへ追加する（投影忘れによる IR-016 違反の未然防止）。
- Step 2（差分整合性チェック）: bun run "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/cli.ts" --changed
  を実行し、ステージングされたファイルに関連する IR ルールのみを高速検証する。
- Step 3（インデックス鮮度チェック）: docs/ や src/ に変更が含まれる場合
  bun run "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts" を実行する。
- いずれかの失敗は非ゼロ終了でコミットを物理ブロックする。緊急バイパス規定として
  git commit --no-verify の許容をエラーメッセージに案内する。

## pre-push（scripts/git-hooks/pre-push、目標10秒）

- Step 1: cli.ts 全量実行（全24+IR-075 ルールをリポジトリ全体へ適用）。
- Step 2: トレーサビリティ検証（bun run "$REPO_ROOT/src/common/skills/agentdev-traceability/scripts/src/check.ts"
  または投影先スクリプト）。
- Step 3: bun test "$REPO_ROOT/.opencode/skills/repo-agentdev-integrity/scripts/"（実行形態は REQ-060 に従う）。

## セットアップ（scripts/setup-hooks.ts）

git rev-parse --git-common-dir と --show-toplevel で通常クローンと worktree の双方に対応する。
git config core.hooksPath scripts/git-hooks を冪等に設定（設定済みはスキップ）、両フックスクリプトへ
実行権限（fs.chmodSync 0o755）を付与、.gitattributes へ scripts/git-hooks/* text eol=lf を追記する
（CRLF 混入による実行エラー防止）。README-INSTALL.md のセットアップ手順に
bun run scripts/setup-hooks.ts の実行と git config --get core.hooksPath の確認を記載する。
ルート package.json は存在しないため scripts セクション追記は適用外とする。

## 対象外

検証エンジン自体のアーキテクチャ（integrity-engine-plugin-architecture Design）、GitHub Actions・CI
（導入しない方針）、トレーサビリティ検証の検出内容（agentdev-traceability Design）。
