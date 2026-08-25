---
title: `agentdev-issue-management` Design
status: accepted
created: 2026-06-21
updated: 2026-08-25
---

# `agentdev-issue-management` Design

## 目的

GitHub Issue の作成、更新、リンク、確認を安全に行うための操作手順を提供する。対象は Case Issue と追跡Issueの双方であり、Issue 操作安全性の共通能力として機能する。I/O は GitHub I/O を担う Custom Tool（agentdev_gh）の操作契約経由で行う（REQ-011）。

## 適用対象

- case-open、case-update、case-close、/agentdev/issue での Issue 操作後の VERIFY 手順
- Parent/Child リンク確認（`Parent: #{N}` パターン検証）
- Epic ステータス追跡テーブル更新の安全手順
- 追跡Issueと Case Issue の関連参照の整合確認

## 提供する判断、操作

- Issue 操作の安全性手順（各書き込み操作ごとに個別 VERIFY。Tool は VERIFY を完了してから成功を返す）
- Parent/Child リンク確認（正規表現パターン）
- Epic テーブル更新手順
- Issue 本文生成（REQ 読解、テンプレート充足検査、完了条件候補抽出）
- 子 Issue 作成、Epic Issue 本文更新の前後比較

## 参照する references

- `references/issue-operation-safety.md`

## 現在の動作

- 各書き込み操作ごとに個別に読み戻し検証（VERIFY）を実行する。VERIFY は Tool 操作契約内で完結する
- 子 Issue 本文先頭行に `Parent: #{epic_number}` を必ず含める（Epic/child 専用形式）
- 全子 Issue 作成完了後に Epic 本文ステータス追跡テーブルを更新する（部分更新禁止）

## 委譲接続点と本文受け渡し

case-open がサブエージェントへ本文生成を委譲する接続点では、本文候補をメッセージ本文ではなくファイルパスで受け渡す（REQ-006-024/025/026）。

- サブエージェントは生成した本文候補を UTF-8（BOM なし）の一時ファイルへ保存し、親エージェントへはファイルパスを返す
- 親エージェントは受領したファイルパスを Tool 操作契約の本文指定に渡す。本文テキストをメッセージ本文で再送、再構成しない
- これにより、サブエージェントと親エージェント間のメッセージ本文圧縮、Markdown レンダリング正規化による LF・空行欠損を構造的に排除する
- 親エージェントが本文修正（変数置換漏れ、前工程完了度属性の埋め込み等）を行う場合も、修正後の本文を改めてファイル保存し、そのファイルを Tool 操作契約へ渡す

## case-open Design との連動

Case Issue 本文から元追跡Issueへの参照形式は、Epic/child 専用の `Parent: #N` 形式とは別形式として case-open Design 側で定義する。本 Design は参照形式の定義を所有せず、定義された形式のリンク整合確認のみを担う。

## 対象外

- Epic/child Issue の作成順序（case-open 責務）
- Issue 本文の構造、テンプレート（`agentdev-workflow-templates` 担当）
- 追跡Issueの論理スキーマ（agentdev-issue-tracking Design が所有）
- RU 削除（case-open 責務）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- リンク整合性（Parent/Child、追跡Issueと Case Issue の関連）
- テーブル構造の維持
- プレースホルダー残存の非検証

## See Also

- [agentdev-issue-tracking.md](agentdev-issue-tracking.md)
- [agentdev-gh-cli.md](agentdev-gh-cli.md)
- [agentdev-workflow-templates.md](agentdev-workflow-templates.md)
- [agentdev-epic-tracker.md](agentdev-epic-tracker.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-update.md](../commands/case-update.md)
- [commands/case-close.md](../commands/case-close.md)

