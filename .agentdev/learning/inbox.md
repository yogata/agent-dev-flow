# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## gh CLI WRITE 操作で Step 0 encoding 初期化を省略し --body-file 本文が mojibake（--title は正常）

- **問題事象**: PR 本文の初回作成時、`agentdev-gh-cli` SPEC Section 2 Step 0 のコンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を省略して `gh pr edit --body-file` を実行した。結果、PR 本文（body）のみ mojibake が発生し、`--title`（日本語含む）は正常にレンダリングされた。非対称な症状（title OK / body mojibake）を観測。
- **発生局面**: 実装（case-run 内の PR 作成・本文設定）
- **検知方法**: PR 作成後の読み戻し VERIFY（Node.js execSync 経由 `gh pr view --json body`）で本文の日本語が文字化けしていることを検知
- **根本原因**: SPEC Section 2 Step 0 のコンソールエンコーディング初期化を前置しなかった。Step 0 は gh CLI がコンソールコードページを参照してメタデータや引数を符号化する経路に対する必須対策。省略時の症状が `--title` と `--body-file` で非対称になる観測事実は、引数 decode 経路とファイル読み取り経路の cp932 影響差分を示唆する
- **自律対応内容**: `gh pr edit` で本文を再設定（Step 0 初期化を前置して再実行）、その後 Node.js execSync で読み戻し VERIFY を実施して mojibake 解消を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（`agentdev-gh-cli` SPEC Section 2 Step 0 既存規定の再確認事象。SPEC 改修不要、運用遵守の提醒）
- **横展開観点**: Windows 環境の全 gh WRITE 手続き（Issue 作成/更新、PR 作成、コメント追加、PR merge、Issue close、title 修正 REST API PATCH）で Step 0 の3行を前置すること。Linux/macOS/WSL では不要
- **再発条件**: Windows PowerShell/pwsh 環境で gh WRITE 操作を実行する際、Step 0 のコンソールエンコーディング初期化を省略した場合
- **予防策候補**: gh WRITE 操作を実行する command/skill が SPEC Section 2 Step 0 の3行を必須前置することを手続き上で保証（既 SPEC 規定の運用徹底）
- **想定反映先**: なし（既 SPEC `agentdev-gh-cli` Section 2 Step 0 に網羅。本エントリは運用インシデント記録）
- **関連**: PR #2051, Issue #2050, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0, RU-0005 AG-001
- **タグ**: `#encoding` `#gh-cli` `#windows` `#mojibake` `#spec-compliance`

## git commit -F <file> で encoding 初期化を省略し commit message が cp932 二重エンコード mojibake

- **問題事象**: case-run 内で `git commit -F <file>` により commit message を file から読み込ませて作成した際、コンソールエンコーディング初期化3行（`[Console]::OutputEncoding` / `$OutputEncoding` / `chcp 65001`）を前置しなかった。UTF-8 BOM なしで作成した commit message file が cp932 二重エンコードで読み込まれ、commit message の日本語が mojibake 破損した。PR 上で commit title と本文の日本語が文字化けしていることを観測。
- **発生局面**: 実装（case-run 内の commit 作成、worktree 上での実装 commit）
- **検知方法**: PR 作成後の読み戻し VERIFY（`gh pr view --json title,headRefOid` と `git log --oneline -1` の commit message 確認）で日本語文字化けを検知
- **根本原因**: `git commit -F <file>` は file 内容を commit message へ読み込むが、pwsh 環境でコンソールコードページが cp932 (932) の場合、git が file 読み取り時にも cp932 として decode し、UTF-8 バイト列を cp932 → UTF-8 の二重エンコードで解釈して mojibake が発生する。`agentdev-gh-cli` SPEC Section 2 Step 0 は gh CLI WRITE 操作向けだが、`git commit -F` 等 file 読み取り経路でも同等のコンソールエンコーディング初期化が必要という知見。OU2 capture（gh CLI `--body-file` mojibake、PR #2051）とは発生経路が異なる（gh CLI ではなく git CLI 直接操作）が、根本対策は同一
- **自律対応内容**: worktree 上で `git commit --amend -F <file>` により commit message を再作成（encoding 初期化3行を前置して再実行）、`git push --force-with-lease origin refactor/issue-2054` で遠隔へ反映。PR 上の commit message で mojibake 解消を確認後、PR merge へ進行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（`agentdev-gh-cli` SPEC Section 2 Step 0 の対象範囲が gh CLI WRITE 手続きに限定されており、`git commit -F` 等の git CLI 直接操作時の encoding 初期化要件が明文化されていない可能性あり。本エントリは運用インシデント記録として蓄積し、learning-promote で SPEC 改修要否を評価する対象とする）
- **横展開観点**: Windows 環境の全 git WRITE 操作（`git commit -F`、`git commit -m`、`git tag -F`、`git tag -m`、`git merge` 等、message file を読み込む経路）で Step 0 の3行を前置すること。Linux/macOS/WSL では不要。本知見は gh CLI 直接操作（OU2 capture）と git CLI 直接操作の両方に共通する根底要件
- **再発条件**: Windows PowerShell/pwsh 環境で `git commit -F <file>` を実行する際、コンソールエンコーディング初期化を省略した場合
- **予防策候補**: git WRITE 操作（commit/tag/merge 等、message file 経由）を実行する command/skill が SPEC Section 2 Step 0 の3行、または同等のコンソールエンコーディング初期化を必須前置すること。現 SPEC は gh CLI 向けだが、git CLI 直接操作時も同等の初期化が必要という知見の文書化（learning-promote で SPEC `agentdev-gh-cli` Section 2 Step 0 適用範囲拡張 または `agentdev-git-worktree` 等の git 操作 skill への注意喚起を評価）
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0（gh CLI 向け規定の git CLI 直接操作への適用範囲拡張候補）、または `agentdev-git-worktree` skill（git CLI 直接操作時の encoding 初期化要件の明文化候補）
- **関連**: PR #2055, Issue #2054, RU-0004 OU-001, OU2 capture entry（PR #2051, Issue #2050, gh CLI `--body-file` mojibake）, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0
- **タグ**: `#encoding` `#git-cli` `#windows` `#mojibake` `#commit-message` `#spec-compliance`

