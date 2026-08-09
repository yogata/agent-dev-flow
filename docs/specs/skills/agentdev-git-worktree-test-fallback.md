---
title: "agentdev-git-worktree 構造系テスト fallback 契約"
status: draft
created: "2026-08-09"
updated: "2026-08-09"
---

# agentdev-git-worktree 構造系テスト fallback 契約

agentdev-git-worktree skill に関連する構造系テスト（commands_e2e、skills_structure、templates_structure 等）の worktree 環境向け fallback 契約。worktree junction 未設定環境でのテスト実行保証と、worktree 固有の構造的制約の明示を扱う。

## fallback 対象

- 構造系テスト（commands_e2e、skills_structure、templates_structure 等）は worktree junction 未設定時に src/opencode/ への fallback で実行する
- worktree の独立 working tree に起因する構造的制約を次のとおり取り扱う
  - gitignore 対象ファイル受け渡し不可（必要に応じて `git add -f` を使用）
  - junction 依存 checker は junction 未設定時に skip する

## 関連

- REQ-018（worktree 構造的制約とテスト fallback）
- agentdev-git-worktree skill（worktree ライフサイクル管理を所管）
