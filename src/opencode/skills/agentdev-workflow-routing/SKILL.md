---
name: agentdev-workflow-routing
description: Provides review rejection handling flows and next-command inference rules for post-review scenarios. USE FOR: handling review NG results, determining the next command after review rejection, classifying rejection types (spec-bug, impl-bug, scope-creep), resolving Epic-related command inference. DO NOT USE FOR: general command execution, requirement analysis, implementation planning.
---

# レビュー後ルーティングスキル

agentdev系コマンドのレビューNG時の対応フロー、次コマンド推論ルールを提供する。

## 対象コマンド

| コマンド | 使用目的 |
|----------|----------|
| case-run | レビューNG対応フロー参照 |
| case-update | レビューNGコメント投稿フロー参照 |

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Workflow Skill としてレビュー後ルーティングルールを提供する。
本スキル自身は workflow STEP を所有せず、case-run / case-update の各 Workflow Skill が所有する STEP から参照される（`<workflows/workflow-skill-model>` Design）。

### ルーティング結果と Input Resolution

レビュー NG 時の次コマンド推論結果は、呼出元 STEP から次 STEP への遷移入力として扱われる。
Input Resolution は永続状態の優先順位（`<workflows/input-resolution-and-durable-state>` Design）に従い、ルーティング結果は自然言語の引き継ぎのみに依存せず、Issue ラベル、PR 番号等の identifier と組み合わせて復元される。

STEP reference 8 要素、STEP 識別子、永続状態復元契約は `<workflows/step-reference-contract>` Design に従う。
compaction 後の current STEP 復元、ToDo 使用、compaction 検出の実処理は harness 固有（AGENTS.md、harness reference）。

## 参考文献

| ファイル | 内容 |
|---------|------|
| review-ng.md | レビューNG理由の定義、対応フロー、--review-ngフラグ |
| next-command-rules.md | 次コマンド推論ルール、Epic関連推論ルール |

## See Also

- `agentdev-workflow-lifecycle`: Phase定義、SSoT遷移、パターン判定基準
