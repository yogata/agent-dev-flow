---
title: agentdev-architecture-advisory SPEC
status: draft
created: 2026-06-21
updated: 2026-06-22
---

# agentdev-architecture-advisory SPEC（アーキテクチャ助言、req-define 事前確認）

## 目的

req-define が要件を確定する前にアーキテクチャ上の影響を確認するための oracle として助言を提供し、最終判断は親エージェントが行う。

## 適用対象

- req-define Step 4（要件展開）後、Step 5（ADR 判断）前
- 既存 REQ/ADR/SPEC との衝突可能性、ADR 作成候補、責務境界変更候補がある場合
- 外部アーキテクチャ助言エージェント（oracle）の接続点

## 提供する判断、操作

- 推奨方針、設計リスク、ADR 要否判断、SPEC 分離候補、衝突解消方針、根拠ファイル、確信度の提供
- 助言内容を4分類に振り分け: 確定事項（confirmed）/ 推定事項（inferred）/ ユーザー確認事項（user-decision）/ ブロッカー（blocker）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- oracle の助言のみを根拠にドラフト本文へ確定事項を混入させない（REQ-0139-002/004）
- 外部助言エージェントが利用できない場合はブロッカーとして報告
- oracle はファイル編集主体ではない（REQ-0139-003）
- oracle 入力: 要件候補、既存 REQ/ADR/SPEC の矛盾候補、ADR 候補、SPEC 候補、責務境界変更、未解決分岐、具体質問
- oracle 出力: 推奨方向、主要な設計リスク、ADR create/update/unnecessary 判断、SPEC 分離候補、矛盾解消提案、根拠参照、確信度

## 対象外

- 実装実行（case-run 責務）
- 実行計画確認（momus 責務）
- ADR 判断の確定、記録（req-define 親エージェント責務）
- ファイル編集

## 検証観点

- 助言内容が既存文書またはユーザー合意で裏付けられているか
- 裏付けのない内容を要件本文へ確定事項として混入していないか
- ブロッカー分類の適切性

## See Also

- [agentdev-adr-guidelines.md](agentdev-adr-guidelines.md)
- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [commands/req-define.md](../commands/req-define.md)
- REQ-0139（外部エージェント統合契約）
