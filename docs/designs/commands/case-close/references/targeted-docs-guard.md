---
title: targeted docs guard (v2:REQ-0158-003)
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-close.md から参照される詳細仕様（遅延読み込み）。 -->

# targeted docs guard (v2:REQ-0158-003)

## targeted docs guard (v2:REQ-0158-003)

case-close 工程で targeted docs guard を実行する。
対象は PR で変更されたファイルと連動ファイル（`docs/README.md`、`docs/designs/README.md`）。

changed-path routing と配布依存境界の検出経路は共有境界 adapter へ接続する（DEC-014）。
最終 gate 基底は REQ-010-012 を再利用し、検査エラー（検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗）は gate-not-passed として扱い、clean として通過させない（DEC-014 決定5、`integrity/distribution-boundary.md`「検査エラーの意味」）。

- 実行タイミング: docs/ 検証の一部。変更ファイル対象の targeted docs guard を実行し、draft→accepted 等の Design status 変更時の `docs/designs/README.md` 同期、Issue/PR で宣言した文書更新対象と実変更ファイルの対応、旧Design直下パス混入検出、local版旧生成方式語彙混入検出、full docs-check 実行要否判定を行う
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/cli.ts --workflow case-close --files <PR 変更ファイル一覧> --json`。PR 変更ファイル一覧は Custom Tool `agentdev_gh`（pr_changed_files）で取得する（case-close はマージ後 main 環境で実行されるため `--files` を使用。`--base-ref` は worktree 環境（マージ前、case-run 等）向け）
- `full_docs_check_recommended` が true の場合: case-close 完了判定の追加確認として扱う。integrity rule 追加・削除・大幅変更、docs/designs の大規模移動・改名、repo-agentdev-integrity の検査スコープ変更、文書分類・責務境界の基準変更を検出した場合は `/repo/docs-check`（全体監査）の実行を推奨する
- 失敗時: 検査対象文書（PR 変更ファイル、`docs/designs/README.md`、`docs/README.md`）を修正して再実行する

JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`unchecked_reasons`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。
`failure` は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ。
`unchecked_reasons` は入力から除外されたパスと理由（not-found / out-of-profile）を持ち、`files_checked` と PR 変更ファイルの一致確認（不一致の検出）に使用する。

<!-- ADF-COVERS(implementation): REQ-032-023 -->
本 Design の検査実行結果突合（files_checked が空または検査対象変更ファイルと不一致の場合を
検査見逃しとして扱い、確認なく合格扱いとしない）が REQ-032-023 を実装する。
