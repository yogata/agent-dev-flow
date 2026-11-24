---
id: 2026-11-24-git-cherry-minus-line-equals-squash-merged
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 のローカル分岐削除での観測)
status: unreviewed
---

# git cherry は upstream に同等コミットがある場合に `-` 行を出力する

- **問題事象**: squash merge 済みのローカル分岐 `chore/issue-4218`（main から 1 コミット先行）に対して `git cherry origin/main chore/issue-4218` を実行すると、`- 558581b431a687a4c06f45e74953eee9b741b10c` の 1 行が出力された。worktree-operations.md の判定基準は「出力が空」であるため、文字どおりには squash merge 済みと読めない
- **発生局面**: 運用（Issue #4218 の case-close、ローカル分岐の削除。2026-11-24 13:33 JST）
- **検知方法**: 分岐削除前の条件確認で cherry の出力を読み、対照実行（upstream を squash commit の親にする）で符号の意味を確かめた
- **根本原因**: 判定基準は出力が空になることを前提としている（同等コミットを出力しない git の挙動を前提にしていたと考えられる）。実行環境の git 2.56.1.vfs.0.1 は同等コミットを `-` 付きで出力する
- **自律対応内容**: `+` 行がないこと、対照実行で `+` が出ること、分岐先端と main の AGENTS.md の blob が同一であること（`00899d948a425afe9766f030975696d0d242ef8e`）を確認して squash merge 測みと判定し、条件付き `-D` で分岐を削除した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（手順書の記載との差は intake として分離）
- **横展開観点**: `git cherry` の結果は行の有無ではなく符号で読む（`+` は upstream に取り込み済みでない変更、`-` は同等コミットが upstream にある）
- **再発条件**: git 2.56.1.vfs.0.1 で squash merge 済みの単一コミット分岐を `git cherry` で判定するとき
- **予防策候補**: 判定基準を「`+` で始まる行がないこと」へ改める
- **想定反映先**: `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`（「squash merge 後の条件付き `-D` 許可」）
- **関連**: `.agentdev/intake/inbox/2026-11-24-git-cherry-criterion-sign-output.md`、Issue #4218
- **タグ**: `#git` `#worktree` `#squash-merge`
