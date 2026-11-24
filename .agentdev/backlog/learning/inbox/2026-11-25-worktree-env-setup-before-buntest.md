---
id: 2026-11-25-worktree-env-setup-before-buntest
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# worktree では環境を整えてから `bun test` を実行する

- **問題事象**: `.opencode/skills/agentdev-project-extensions` の junction と依存が無い状態では、checker が module 解決エラーで起動せず、`./src/` の suite は依存解決の失敗を fail として表示した（マージ結果 tree で整備前は 3676 pass / 4 fail / 4 errors、整備後は 3777 pass / 0 fail）
- **発生局面**: 実装（Issue #4222 の case-run、マージ結果 tree での検証。2026-11-25 JST）
- **検知方法**: bun test の集計の前後比較（`G/merge-buntest-src.*` と `G/merge2-buntest-src.*`）
- **根本原因**: git 管理外の junction と依存が一時 worktree へ伝播しない（構造的制約）
- **自律対応内容**: junction と依存を整備してから再実行して解消した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の環境整備の観測であり、正規成果物への影響なし）
- **横展開観点**: worktree で `bun test` を実行する前に環境整備を済ませる。整備前の失敗は依存解決の失敗であってコードの不具合と区別する
- **再発条件**: 環境未整備の worktree で `bun test` を実行する場合
- **予防策候補**: worktree 依存整備の正規手順への統合（既存 intake `2026-11-23-worktree-dependency-setup-normalization` に同一の統合課題がある）
- **想定反映先**: worktree-operations.md
- **関連**: `.agentdev/backlog/learning/inbox/2026-11-24-worktree-local-skills-junction-prepush-gate.md`（pre-push ゲートでの同根の観測）、PR #4225、Issue #4222
- **タグ**: `#worktree` `#bun-test` `#junction`
