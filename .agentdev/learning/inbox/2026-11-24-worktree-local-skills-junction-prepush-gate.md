---
id: 2026-11-24-worktree-local-skills-junction-prepush-gate
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 PR #4219 本文 Findings の回収)
status: unreviewed
---

# pre-push ゲートは worktree 内で起動されるため .opencode/skills/agentdev-* の junction が未伝播だと Step 1・2 が起動しない

- **問題事象**: worktree から push すると pre-push フックは worktree の中で `.opencode/skills/repo-agentdev-integrity/scripts/` を起動する。`lib/extensions-integrity.ts` は `../../agentdev-project-extensions/scripts/lib/extension_state.ts` を import するため、`.opencode/skills/agentdev-*` の junction が未伝播の worktree では Step 1・Step 2 が module not found で起動しない（exit 1）。`node_modules` の junction だけでは解消しない
- **発生局面**: 実装（Issue #4218 の case-run、ゲート事前実行 1 回目。2026-11-24 01:15 JST）
- **検知方法**: ゲート事前実行の stderr（`Cannot find module '../../agentdev-project-extensions/scripts/lib/extension_state.ts'`、`.opencode/skills/repo-agentdev-integrity/lib/extensions-integrity.ts` から）
- **根本原因**: git 管理外の junction は worktree へ伝播しない（既存 entry `2026-11-21-worktree-prepush-junction-unpropagation` と同根の構造的制約）
- **自律対応内容**: worktree 自身の `src/common/skills/` 配下へ向ける junction を worktree-local に作成した（`.opencode/skills/agentdev-project-extensions` と `.opencode/skills/agentdev-artifact-validation` の 2 件を親セッションが作成。後者の要否は単独では確認していない）。Step 1〜3 が合格し push できた。push 後は junction のエントリだけを削除し、参照先は残した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行時の対処経路の観測であり、正規成果物への変更なし）
- **横展開観点**: worktree でゲートを通す場合は、依存パッケージの整備に加えて、`.opencode/skills/agentdev-*` の junction が import 解決に必要かを確認する
- **再発条件**: `.opencode/skills/agentdev-*` の junction が未伝播の worktree から push した場合に毎回再発する（構造的制約）
- **予防策候補**: worktree 依存整備の正規手順への統合（既存 intake `2026-11-23-worktree-dependency-setup-normalization` に同一の統合課題がある）
- **想定反映先**: worktree-operations.md
- **関連**: `.agentdev/learning/inbox/2026-11-21-worktree-prepush-junction-unpropagation.md`（同根制約の初回観測。worktree 内正本を target とする変種の記載あり）、`.agentdev/learning/inbox/2026-11-23-worktree-prepush-workaround-refspec-push.md`（対処経路 3 種）、`.agentdev/intake/inbox/2026-11-23-worktree-dependency-setup-normalization.md`、Issue #4218、PR #4219
- **タグ**: `#worktree` `#pre-push` `#junction`
