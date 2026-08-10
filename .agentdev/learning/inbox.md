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

## gh pr create --title --body-file で Step 0 encoding 初期化3行前置にも関わらず --body-file 本文が cp932 二重エンコード mojibake（第3の経路）

- **問題事象**: case-run（PR #2059 作成）で `agentdev-gh-cli` SPEC Section 2 Step 0 のコンソールエンコーディング初期化3行を前置した上で `gh pr create --title "..." --body-file <UTF-8 BOM なし file>` を実行した。結果、PR 本文（body）が cp932 二重エンコード mojibake を発生した。`--title` と `--body-file` を同時渡しする `gh pr create` 複合呼び出しで、Step 0 を前置しても body 側に mojibake が残る事象を観測。修復のために `gh api --input <JSON>` 経由（REST API 直接呼出し、JSON ファイル渡し）へ切り替えて本文を再設定した。
- **発生局面**: 実装（case-run 内の PR 作成、worktree 上での実行）
- **検知方法**: PR 作成後の読み戻し VERIFY（Node.js execSync 経由 `gh pr view --json body`）で本文の日本語が文字化けしていることを検知
- **根本原因**: `gh pr create --title --body-file` の呼び出しで、`--title` 引数の inline 日本語（RU-0005 AG-001 で禁止されているが発生）と `--body-file` の file 読み取り経路が同時に存在する場合、Step 0 のコンソールコードページ切替えが `--body-file` の decode 経路へ波及しなかった可能性。OU2（Step 0 省略で `--body-file` mojibake）や OU4（git commit -F 省略で mojibake）とは異なり、Step 0 を前置しても `gh pr create` の複合引数（`--title` + `--body-file` 同時）で body 側に mojibake が残る第3の経路
- **自律対応内容**: `gh pr create` の本文設定を破棄し、`gh api --input <JSON>` 経由（JSON ファイルに title と body を纏めて格納、REST API へ file 渡し）で PR 本文を再設定。読み戻し VERIFY で mojibake 解消を確認後、後続工程へ進行
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: あり（`agentdev-gh-cli` SPEC Section 2 Step 0 の `--body-file` 保証が `gh pr create --title --body-file` 複合呼び出しで成立しない事象。RU-0005 AG-001 の `--title` inline 禁止規定と Step 0 の組合せでも body 側保護が不十分な可能性）。learning-promote で SPEC 改修要否（`gh pr create` 時の `--title`/`--body-file` 分離、REST API 経由推奨化等）を評価する対象
- **横展開観点**: Windows 環境の gh CLI WRITE 操作で `--title` と `--body-file` を同時に渡す手続き（`gh pr create`、`gh issue create` 等）。Step 0 前置であっても `--title` inline の混入は `--body-file` 側へ cp932 影響を波及させうるため、`--title` は REST API PATCH 経由（RU-0005 AG-002）、`--body-file` は別立てで渡す分離構成、または全本文を `gh api --input <JSON>` 経由で処理することを検討
- **再発条件**: Windows PowerShell/pwsh 環境で `gh pr create --title "日本語" --body-file <file>` を実行する際、Step 0 初期化3行を前置しても `--title` inline が同時に存在する場合
- **予防策候補**: `gh pr create --title --body-file` の複合呼び出しを避け、(1) ASCII 仮 title で `gh pr create --body-file` のみ実行、(2) 別途 REST API PATCH（RU-0005 AG-002）で日本語 title を設定、の2段階シーケンスを SPEC 標準とすること。または `gh pr create` 自体を `gh api --input <JSON>` 経由へ切替えること
- **想定反映先**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` PR 作成手続き（`gh pr create --title --body-file` 複合呼び出しから2段階シーケンスへの標準化候補）、RU-0005 AG-001/AG-002（`--title` inline 禁止と REST API PATCH 標準の組合せ拡張候補）
- **関連**: PR #2059, Issue #2058, RU-0007 OU-006 case-run, OU2 capture entry（PR #2051, Step 0 省略で `--body-file` mojibake）, OU4 capture entry（PR #2055, git commit -F 省略で mojibake）, `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` Section 2 Step 0, RU-0005 AG-001/AG-002
- **タグ**: `#encoding` `#gh-cli` `#windows` `#mojibake` `#pr-create` `#spec-gap`

