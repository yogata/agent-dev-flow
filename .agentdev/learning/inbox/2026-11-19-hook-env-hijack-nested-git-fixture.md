---
id: learn-20261119-hook-env-hijack-nested-git-fixture
created_at: 2026-11-19
source: case-close capture (PR #4160)
status: inbox
---
# git push がフックへ渡す GIT_* 環境変数によるネスト git フィクスチャの横取り（実ブランチ汚染・リモート破壊・core.bare 混入）

- 問題事象: git push がフックへエクスポートする GIT_DIR・GIT_WORK_TREE・GIT_INDEX_FILE 等の環境変数を、pre-push フックのテストスイートが生成するネスト git フィクスチャの git 操作（init・commit・push）が引き継ぎ、外側の実リポジトリへ横取りされた。実ブランチへ fixture 由来のコミット 11 件が混入し、fixture 由来の git push によりリモートブランチが破壊（da7462bcc）、main リポジトリの .git/config へ core.bare=true が混入した
- 発生局面: case-run（Issue 4155・Case 4150 Wave-3・PR 4160 の前段。第 1 回 push〔15022942b push 時〕でフック Step 3 の bun test 実行中に発生）
- 検知方法: push 後のリポジトリ状態観察（実ブランチの不審コミット、リモートブランチ破壊、core.bare の混入）
- 根本原因: フック実行時の環境変数継承。git push はフックへ GIT_* 環境変数をエクスポートするが、フックの子プロセス（テストスイートが生成するネスト git リポジトリ）がこれらを引き継ぐと、フィクスチャの git 操作の対象が外側の実リポジトリ（GIT_DIR・GIT_INDEX_FILE）へ差し替わる
- 自律対応内容: pre-push hook Step 3 の bun test 実行時のみ env -u で 7 変数（GIT_DIR・GIT_WORK_TREE・GIT_INDEX_FILE・GIT_QUARANTINE_PATH・GIT_OBJECT_DIRECTORY・GIT_ALTERNATE_OBJECT_DIRECTORIES・GIT_PREFIX）を無効化（e4fa70573）。hook 契約テストへ環境変数無効化 pin を追加。実 push 2 回（branch 削除 push・再作成 push）で再発なしを実測確認
- ユーザー確認有無: なし（インシデント復旧〔main config 修復・worktree reset・リモート再生成〕は実測確認済み。根本対策は修正 PR 4160 として実装）
- Decision/REQ/spec 影響: docs/designs/integrity/local-verification-gates.md（draft、Step 3 実行契約の環境変数無効化として記載）
- 横展開観点: ネスト git リポジトリを扱うテスト・スクリプトは親プロセスの GIT_* 環境変数を前提にしない。フック・CI runner から起動される検証コードは env -u による環境分離を標準とする。テスト側の自己防衛（GIT_* 未設定を fixture 生成前に検証して fail する pin）を併置すると単独環境でも再発を防げる
- 再発条件: git push のフック・CI から、ネスト git フィクスチャ操作（init/commit/push を含む）を実行するテストを起動する場合
- 予防策候補: フック側の env -u 無効化（実装済み）に加え、push 後のリポジトリ完全性確認（core.bare・不審コミット・リモート状態）を push フローへ常設する
- 想定反映先: docs/designs/integrity/local-verification-gates.md（Step 3 実行契約）
- 関連: Case 4150、Issue 4155、PR 4160（Findings F1）
- タグ: git hook、環境変数、ネスト git、テストフィクスチャ、インシデント、根本対策
