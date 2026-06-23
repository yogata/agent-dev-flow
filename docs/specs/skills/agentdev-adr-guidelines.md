---
title: agentdev-adr-guidelines SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-adr-guidelines SPEC

## 目的

ADR 作成の必要性判定基準、作成ガイドライン、ライフサイクル定義を提供し、アーキテクチャ上重要であるかどうかを判定する。

## 適用対象

- アーキテクチャ変更の提案、技術スタック選定、取り返しがつかない技術的判断を行う際
- req-define Step 5（ADR 判断）、Step 5-0（既存 ADR 重複確認）、Step 5-1（ADR 禁止ゲート）、Step 5-3（作業手段 ADR 拒否ゲート）

## 提供する判断、操作

- ADR 作成推奨基準（アーキテクチャ上の重要性、長期的影響、逆転の困難さ）
- ADR 作成不可条件（仕様変更のみ、command 動作仕様、workflow 定義等）
- ADR ライフサイクル（proposed → accepted → deprecated / superseded）
- 作業手段 ADR 拒否ゲート（削除、廃止、移行、統合、再構築、完全削除そのものを主題にした ADR 候補は除外）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- Architecturally Significant な決定に対してのみ ADR を作成
- accepted 後は不変、変更時は新規 ADR 作成
- 単なる廃止、削除、移行は新規 ADR ではなく `retire` / `supersede` で処理（REQ-0101-044/045）
- 既存 ADR との意味的重複確認（REQ-0101-051、重複時は UPDATE 推奨）

## 対象外

- ADR ファイルの作成、管理（`agentdev-adr-file-manager` 担当）
- 要件分析手法（`agentdev-req-analysis` 担当）
- 実装計画

## 検証観点

- ADR 作成推奨基準に該当するか
- ADR 作成不可条件に該当しないか
- 既存 ADR との重複がないか
- false negative を防止できているか

## See Also

- [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)
- [agentdev-architecture-advisory.md](agentdev-architecture-advisory.md)
- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [commands/req-define.md](../commands/req-define.md)
- REQ-0101（文書、REQ 管理基準）
- REQ-0112（ADR ライフサイクル標準化）
