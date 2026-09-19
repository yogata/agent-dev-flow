---
title: `agentdev-workflow-routing` Design
status: accepted
created: 2026-06-21
updated: 2026-07-18
---
<!-- ADF-COVERS(implementation): REQ-034-021 -->

# `agentdev-workflow-routing` Design

## 目的

レビュー NG 時の対応フロー、次コマンド推論ルールを提供し、拒否タイプの分類と次のコマンド決定を支援する。

## 適用対象

- レビュー NG 結果の処理（レビュー NG 後の case-run 再開、Definition 変更時は case-revise → case-ready 経路）
- レビュー拒否後の次のコマンド決定
- 拒否タイプの分類（spec-bug / impl-bug / scope-creep / no-deviation）
- Epic 関連コマンド推論の解決

## 提供する判断、操作

- レビュー NG 理由の定義、対応フロー（フラグなしの現行経路）
- 次コマンド推論ルール（Epic 関連推論ルール含む）
- QG-3 乖離検出結果の引用（レビュー NG 対応時）

## 参照する references

- `references/review-ng.md`
- `references/next-command-rules.md`

## 現在の動作

- 宣言的定義のみを提供
- 手順、手続きは含まない
- エージェントが自律的に判断できることをユーザーに確認しない

## 対象外

- 一般的なコマンド実行
- 要件分析（`agentdev-req-analysis` 担当）
- 実装計画

## 検証観点

- 拒否タイプを正しく分類しているか（spec-bug / impl-bug / scope-creep / no-deviation）
- 次コマンド推論ルールに従っているか
- レビュー NG 時の案内経路が現行契約（フラグなし経路）と一致しているか
- QG-3 乖離検出結果を引用しているか

## See Also

- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [agentdev-quality-gates.md](agentdev-quality-gates.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-revise.md](../commands/case-revise.md)
- REQ-031（case-run 実行契約）

