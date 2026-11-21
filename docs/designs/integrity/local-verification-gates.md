---
title: ローカル検証ゲート Design
status: draft
created: 2026-11-18
updated: "2026-11-21"
---

<!-- ADF-COVERS(design):（pre-push のみのローカル検証ゲートの実行契約。REQ-116 型の covers 宣言） -->

# ローカル検証ゲート Design

agent-dev-flow ソースリポジトリ専用のローカル検証ゲートの実行契約を所有する。配布物には
含めない（配布写像は trusted-distribution-gate/manifest.ts の限定列挙で scripts/git-hooks/ は
対象外）。pre-commit と minimal-gate は廃止した（2026-11-21。ローカルの実験・途中コミットの
摩擦ゼロ化と非同期キュー前提との整合。歴史は Git ログが唯一の正本である）。

## pre-push（scripts/git-hooks/pre-push）

シェル本体は既存の正規決定論的チェッカーを呼ぶだけの薄いラッパーとする。フック側に独自の
しきい値判定・ファイルサイズ計算・非同期キュー（learning/intake/backlog/inspect）の滞留監視
ロジックは一切持たせない。REPO_ROOT は git rev-parse --show-toplevel を起点とする
（worktree 環境対応）。

- Step 1: bun run .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts
  （インデックス鮮度チェック）。
- Step 2: bun run .opencode/skills/repo-agentdev-integrity/scripts/cli.ts（全量整合性チェック）。
- Step 3: bun test ./src/common/skills/repo-agentdev-integrity/scripts/（検証エンジンのテスト
  スイート。REQ-060 の実行形態に従い、リポジトリルート cwd と ./ 付き相対パスで実行する）。
  git push がフックへ渡す GIT_DIR・GIT_WORK_TREE・GIT_INDEX_FILE 等の環境変数は、テスト
  スイートが生成するネスト git フィクスチャの操作が外側の実リポジトリへ横取りされ、ブランチ・
  設定・リモートを破壊するのを防ぐため、Step 3 の実行時のみ無効化する
  （Step 1・2 は実リポジトリ自身を検査するため無効化しない）。
- いずれかの失敗は非ゼロ終了で push を物理ブロックする。

## セットアップ（scripts/setup-hooks.ts）

git rev-parse --git-common-dir と --show-toplevel で通常クローンと worktree の双方に対応する。
git config core.hooksPath scripts/git-hooks を冪等に設定（設定済みはスキップ）、pre-push への
実行権限（fs.chmodSync 0o755）を付与、.gitattributes へ scripts/git-hooks/* text eol=lf を
追記する（CRLF 混入による実行エラー防止）。README-INSTALL.md のセットアップ手順に
bun run scripts/setup-hooks.ts の実行と git config --get core.hooksPath の確認を記載する。
ルート package.json は存在しないため scripts セクション追記は適用外とする。

## 対象外

検証エンジン自体のアーキテクチャ（integrity-engine-plugin-architecture Design）、GitHub Actions・CI
（導入しない方針）、トレーサビリティ検証の検出内容（agentdev-traceability Design）。
