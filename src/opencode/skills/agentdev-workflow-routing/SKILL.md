---
name: agentdev-workflow-routing
description: Provides review rejection handling flows and next-command inference rules for post-review scenarios. USE FOR: handling review NG results, determining next command after review rejection, classifying rejection types (spec-bug, impl-bug, scope-creep), or resolving Epic-related command inference. DO NOT USE FOR: general command execution, requirement analysis, or implementation planning.
---

# レビュー後ルーティングスキル

agentdev系コマンドのレビューNG時の対応フロー、次コマンド推論ルールを提供する。

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-workflow-routing` SPEC](../../../../docs/specs/skills/agentdev-workflow-routing.md) である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

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
| case-run | レビューNG対応フロー参照 |
| case-update | レビューNGコメント投稿フロー参照 |

## references/ 構成一覧

| ファイル | 内容 |
|---------|------|
| review-ng.md | レビューNG理由の定義、対応フロー、--review-ngフラグ |
| next-command-rules.md | 次コマンド推論ルール、Epic関連推論ルール |

## See Also

- `agentdev-workflow-lifecycle`: Phase定義、SSoT遷移、パターン判定基準