---
title: intake-triage Design
status: draft
created: 2026-11-18
updated: "2026-11-18"
---

<!-- ADF-COVERS(design): REQ-122-013（intake-triage コマンドの公開契約と3ルート自動振り分けの実行契約。REQ-116 型の covers 宣言） -->

# intake-triage Design

本 command は .agentdev/intake/inbox/ と .agentdev/learning/inbox/ に蓄積した項目を人手を介さず高速消化する
軽量自動トリアージコマンドである。公開コマンド分類（REQ-005-010）では補助フローに分類する。

## 入力

- .agentdev/intake/inbox/*.md と .agentdev/learning/inbox/*.md（.gitkeep 除外）

## 出力

- 処理結果サマリー（Route A 解決件数、Route B 破棄件数、Route C 昇格件数、残件 0 件の確認）
- Route C 生成物: .agentdev/backlog/req-units/ への要件ユニット（REQ-039-007 の採番規律を適用）

## 実行アルゴリズム

- Step 1（一括走査とクラスタリング）: 対象 inbox の全ファイルを読み込み、対象コンポーネント、関連 IR/REQ ID、
  問題の種類が重複・類似しているアイテムを1クラスタにグルーピングする。
- Step 2（3ルート自動振り分けと即時実行）:
  - Route A（即時決済 / Quick-Fix）: タイポ修正、リンク切れ修復、未使用キー削除、既存設計書への1〜2文追記等、
    設計判断を伴わず1〜2ファイルで完結する軽微修正。その場で対象ファイルを直接修正し、処理済み inbox
    ファイルを削除する。
  - Route B（即時破棄 / Drop）: DEC-064 の原則（後方互換不要・過剰監視の排除・実験優先）に照らして
    不要・陳腐化している提案。理由を記録せず即座に削除する（DEC-064 原則3の処分理由明示は測定待ち案件の
    スコープと解釈し、未処理 inbox 項目の即時トリアージ処分は適用外とする。破棄はサマリー件数で把握できる）。
  - Route C（バックログ昇格 / Promote）: 複数ファイルの構造変更や新規設計が必要な案件。クラスタ単位で
    統合した要件ユニットを .agentdev/backlog/req-units/ に生成（REQ-039-007 の採番規律・履歴検査を適用）
    し、元の inbox ファイルを削除する。
- Step 3（サマリー出力）: 処理結果（各ルート件数、残件 0 件の確認）を簡潔に報告する。

## 構成

- 正本: src/common/commands/agentdev/intake-triage.md（200行以内の軽量設計。command は薄い入口とし
  workflow 手順本体は Workflow Skill へ委譲する〔REQ-002-001/002〕）
- Workflow Skill: agentdev-workflow-intake-triage
- 設計書: docs/designs/commands/intake-triage.md（本 Design）

## 対象外

intake-promote の分類・評価・HITL（REQ-037）、backlog-review の統合判定（REQ-039）、learning-promote の
評価（REQ-038）、adversarial-review。

## 検証観点

- 3ルートの振り分け判定とクラスタリングの妥当性
- Route C の RU 採番が REQ-039-007 に従うこと
- 残件 0 件の確認とサマリー出力の完全性
