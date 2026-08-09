# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## Windows PowerShell で gh pr create --body-file が多重エンコード化け、gh api PATCH で修復した事象

- **問題事象**: Windows PowerShell 環境で gh pr create --body-file に UTF-8 BOM なしファイルを渡して PR を作成したところ、PR 本文が多重エンコード化け（UTF-8 バイト列を ASCII 数字文字列として展開した状態）になった。chcp 65001 + PYTHONIOENCODING=utf-8 のコンソールエンコーディング初期化を実施しても防止できなかった。
- **発生局面**: 実装（case-run インライン実行での PR 作成、PR #1976 経路D learning-promote）
- **検知方法**: PR 作成後に PR 本文を目視確認した際、日本語が数値列へ破損していることを発見
- **根本原因**: agentdev-gh-cli standard-procedures.md「コンソールエンコーディング初期化」（Section 2 Step 0 の3行）は gh CLI の stdout/引数渡し経路の一部を保護するが、gh pr create --body-file の本文読み込み経路において Windows 環境固有の多重エンコード変換を完全には防止できない。ファイル本文の decode 経路が Step 0 のコンソールコードページ切替えとは独立して cp932 影響を受ける場合がある。
- **自律対応内容**: gh pr create で一旦 PR を作成した後、Node.js で本文を UTF-8 JSON ファイルへ書き出し、gh api -X PATCH /repos/{owner}/{repo}/pulls/{N} --input <JSON> 経由で PR 本文を上書き修復した。
- **ユーザー確認有無**: なし（エージェント自律で検知・修復）
- **ADR/REQ/spec影響**: あり。agentdev-gh-cli SPEC / standard-procedures.md の WRITE 手続き（PR 作成）において、--body-file のみで本文化けが残るリスクと gh api PATCH による修復経路の標準化が必要。RU-0005 AG-001（--title inline 禁止、title 修正は REST API PATCH 標準手続き）と同種の経路分離問題だが本文側。
- **横展開観点**: Windows 環境で gh CLI の WRITE 操作（Issue 作成、Issue 本文更新、PR 作成、コメント追加）全般で、--body-file 指定でも本文 decode 経路の cp932 影響を完全排除できない可能性。Step 0 実施を前提としつつ、作成後の本文 VERIFY（読み戻し）で化け検出を必須化すべき。
- **再発条件**: Windows PowerShell/pwsh 環境で gh pr create --body-file（または gh issue create --body-file）を日本語本文付きで実行し、コンソールエンコーディング初期化後でも本文 decode 経路が cp932 影響を受ける条件。
- **予防策候補**: (1) WRITE 後 VERIFY で本文を読み戻し mojibake 検出を必須化、(2) 本文化け検出時は gh api -X PATCH --input <JSON>（Node.js UTF-8 書き出し）で修復する標準手順を standard-procedures.md へ追記、(3) title 修正 REST API PATCH 標準手続きと対になる本文修正手順の整備。
- **想定反映先**: .opencode/skills/agentdev-gh-cli/references/standard-procedures.md（WRITE 手続きセクション、VERIFY セクション）、verify.md（mojibake 検出観点）
- **関連**: PR #1976（経路D learning-promote）、PR #1973（Wave 1、本件発生時は観測されず本文正常を確認済み）、agentdev-gh-cli standard-procedures.md Section 2 Step 0、RU-0005 AG-001/AG-002
- **タグ**: `#windows` `#encoding` `#gh-cli` `#write-procedure` `#verify`
