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

