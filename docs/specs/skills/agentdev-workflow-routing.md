---
title: agentdev-workflow-routing SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-workflow-routing SPEC

## 目的

レビュー NG 時の対応フロー・次コマンド推論ルールを提供し、拒否タイプの分類と次のコマンド決定を支援する。

## 適用対象

- レビュー NG 結果の処理（case-update `--review-ng` 時）
- レビュー拒否後の次のコマンド決定
- 拒否タイプの分類（spec-bug / impl-bug / scope-creep / no-deviation）
- Epic 関連コマンド推論の解決

## 提供する判断・操作

- レビュー NG 理由の定義・対応フロー・`--review-ng` フラグの扱い
- 次コマンド推論ルール（Epic 関連推論ルール含む）
- QG-3 乖離検出結果の引用（`--review-ng` 時）

## 参照する references

- `references/review-ng.md`
- `references/next-command-rules.md`

## 現在の動作

- 宣言的定義のみを提供
- 手順・手続きは含まない
- エージェントが自律的に判断できることをユーザーに確認しない

## 対象外

- 一般的なコマンド実行
- 要件分析（`agentdev-req-analysis` 担当）
- 実装計画

## 検証観点

- 拒否タイプを正しく分類しているか（spec-bug / impl-bug / scope-creep / no-deviation）
- 次コマンド推論ルールに従っているか
- `--review-ng` フラグを適切に使用しているか
- QG-3 乖離検出結果を引用しているか

## See Also

- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [agentdev-quality-gates.md](agentdev-quality-gates.md)
- [commands/case-update.md](../commands/case-update.md)
- REQ-0133 — case-update / Issue更新
