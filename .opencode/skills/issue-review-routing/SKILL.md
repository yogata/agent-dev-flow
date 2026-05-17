---
name: issue-review-routing
description: Provides review rejection handling flows and issue-next inference rules for post-review scenarios. USE FOR: handling review NG results, determining next command after review rejection, classifying rejection types (spec-bug, impl-bug, scope-creep), or resolving Epic-related command inference. DO NOT USE FOR: general command execution, requirement analysis, or implementation planning.
---

# Issue Review Routing スキル

issue-*系コマンドのレビューNG時の対応フロー・issue-next推論ルールを提供する。

- **知識ベース**: レビューNG時の対応フロー、issue-next推論ルール
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

## USE FOR

- レビューNG結果の処理
- レビュー拒否後の次のコマンド決定
- 拒否タイプの分類（spec-bug, impl-bug, scope-creep）
- Epic関連コマンド推論の解決

## DO NOT USE FOR

- 一般的なコマンド実行
- 要件分析
- 実装計画

## 対象コマンド

| コマンド | 使用目的 |
|----------|----------|
| issue-work | レビューNG対応フロー参照 |
| issue-update | レビューNGコメント投稿フロー参照 |
| issue-next | 次アクション推論ルール参照 |

## reference/ 構成一覧

| ファイル | 内容 |
|---------|------|
| review-ng.md | レビューNG理由の定義・対応フロー・--review-ngフラグ |
| issue-next-rules.md | issue-next推論ルール・Epic関連推論ルール |

## See Also

- issue-lifecycle: Phase定義・SSoT遷移・パターン判定基準
- issue-reporting: 完了報告フォーマットとチェックボックス更新ルール