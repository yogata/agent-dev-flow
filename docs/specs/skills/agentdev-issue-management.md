---
title: `agentdev-issue-management` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-18
---

# `agentdev-issue-management` SPEC

## 目的

GitHub Issue の作成、更新、リンク、確認を安全に行うための操作手順を提供し、`agentdev-gh-cli` の VERIFY 操作と連携する。

## 適用対象

- case-open、case-update、case-close での Issue 操作後の VERIFY 手順
- Parent/Child リンク確認（`Parent: #{N}` パターン検証）
- Epic ステータス追跡テーブル更新の安全手順
- `--body-file` 使用時の検証

## 提供する判断、操作

- Issue 操作の安全性手順（各書き込み操作ごとに個別 VERIFY）
- Parent/Child リンク確認（正規表現パターン）
- Epic テーブル更新手順
- Issue 本文生成（REQ 読解、テンプレート充足検査、完了条件候補抽出）
- 子 Issue 作成、Epic Issue 本文更新、`--body-file` 使用時の検証

## 参照する references

- `references/issue-operation-safety.md`

## 現在の動作

- 各書き込み操作ごとに個別に VERIFY を実行
- `agentdev-gh-cli` の安全な読み取り手順と連携
- 子 Issue 本文先頭行に `Parent: #{epic_number}` を必ず含める
- 全子 Issue 作成完了後に Epic 本文ステータス追跡テーブルを更新（部分更新禁止）

## 委譲接続点と本文受け渡し

case-open がサブエージェントへ本文生成を委譲する接続点（Step 2/6/8/9）では、本文候補をメッセージ本文ではなくファイルパスで受け渡す（REQ-0132-024/025/026）。

- サブエージェントは生成した本文候補を `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）により一時ファイル（`$env:TEMP/agentdev/case-open-body-{ou_id}-{timestamp}.md` 等）へ保存し、親エージェントへはファイルパスを返す
- 親エージェントは受領したファイルパスを `gh --body-file` で直接渡す。本文テキストをメッセージ本文で再送、再構成してはならない
- これにより、サブエージェント→親エージェント間のメッセージ本文圧縮、Markdown レンダリング正規化による LF・空行欠損を構造的に排除する
- 親エージェントが本文修正（変数置換漏れ、前工程完了度属性の埋め込み等）を行う場合も、修正後の本文を改めてファイル保存し、そのファイルを `gh --body-file` で渡す

## 対象外

- Epic/child Issue の作成順序（case-open 責務）
- Issue 本文の構造、テンプレート（`agentdev-workflow-templates` 担当）
- RU 削除（case-open 責務）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- リンク整合性（Parent/Child）
- テーブル構造の維持
- プレースホルダー残存の非検証

## See Also

- [agentdev-gh-cli.md](agentdev-gh-cli.md)
- [agentdev-workflow-templates.md](agentdev-workflow-templates.md)
- [agentdev-epic-tracker.md](agentdev-epic-tracker.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-update.md](../commands/case-update.md)
- [commands/case-close.md](../commands/case-close.md)

