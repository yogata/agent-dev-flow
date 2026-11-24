---
id: 2026-11-24-git-cherry-criterion-sign-output
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 のローカル分岐削除での検出)
status: unreviewed
---

# worktree-operations.md の git cherry による squash merge 済み判定が実行環境の出力と合わない

- **課題**: `src/common/skills/agentdev-git-worktree/references/worktree-operations.md` の「squash merge 後の条件付き `-D` 許可」は、単一コミット構成の判定を「`git cherry origin/main {branch}` の出力が空」としている。git 2.56.1.vfs.0.1 では、upstream に同等コミットがある場合に `- <commit>` を 1 行出力するため、判定を文字どおりに適用すると squash merge 済みを未統合と誤る
- **期待する処分**: 判定基準を「`+` で始まる行がないこと」へ改める判断（`-` 行は upstream に同等コミットがあることを表す）
- **出典**: Issue #4218 の case-close（ローカル分岐 `chore/issue-4218` の削除）
- **実証根拠**: 2026-11-24 13:33 JST、git 2.56.1.vfs.0.1。`git cherry origin/main chore/issue-4218` は `- 558581b431a687a4c06f45e74953eee9b741b10c` を出力した（upstream に squash commit `c294f965d28fe56f8660123d818713fe08c43122` がある）。対照として upstream を squash commit の親にすると `+ 558581b431a687a4c06f45e74953eee9b741b10c` を出力した。分岐先端と main の AGENTS.md の blob は同一（`00899d948a425afe9766f030975696d0d242ef8e`）
- **関連 learning**: `.agentdev/learning/inbox/2026-11-24-git-cherry-minus-line-equals-squash-merged.md`
