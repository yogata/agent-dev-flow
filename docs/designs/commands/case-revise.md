---
title: case-revise Design
status: accepted
created: 2026-09-14
updated: "2026-10-08"
---

<!-- ADF-COVERS(design): REQ-062-006, REQ-101-017, REQ-101-018, REQ-101-019 -->

# case-revise Command Design

本 Design が定義する case-revise は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。例外経路段階であり、case-auto の例外経路解決（Root Case 指定に基づく再合意済み Definition 変更の解決）から駆動される。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

case-revise の公開契約を定義する。case-revise は req-define で再合意済みの Definition 変更を既存 Case へ反映する主フローの例外経路コマンドである（REQ-062）。

## 公開 interface

- 入力: Root Case、req-define で再合意済みの差分（draft）
- 出力: 設計修正PR（canonical Definition に実変更がある場合のみ）、case-ready への引き継ぎ
- 副作用: 設計修正PRの作成、影響ある Issue の再評価マーキング

## 内部構成

- 実変更判定: canonical Definition との差分比較で実変更の有無を判定する。実変更がなければ Definition の修正を反映する PR を作成せず case-ready へ移行する（空の PR を作らない）
- 影響再評価: Definition 変更の影響がある Issue のみを再評価対象とする。影響なしと確認できた完了済み Issue は維持する
- 再確定の委譲: execution contract / execution structure の再確定は case-ready が行う（case-revise 完了後は case-ready を経由）

## 停止条件

- 再合意済みでない変更の反映要求（req-define へ差し戻し）
- 同一再合意内容に対応する既存の設計修正PRの検出（重複生成禁止、既存 PR を再利用）

## 冪等性

同じ再合意内容に対応する既存の設計修正PRを重複生成しない。中断済み成果物は巻き戻さない。

## 合意変更反映と証拠鮮度（REQ-101-017〜019、RU-20261004-08）

再合意済み Definition 変更の反映における受け入れ義務保存の実行時投影。

- 合意変更の取り扱いで、変更の記録、影響対象への変更到達、下流消費成果物への反映、消費担当による最新条件の受領、反映後成果物の読み戻し確認を区別する。重要条件の変更が影響対象へ未反映である間は、古い契約による新規実行または最終受け入れを行わない。
- 合意変更、評価範囲の変更、または検証対象成果物の内容・リビジョンの変更により、既存の証拠、チェック済み項目、N/A 判定、pass 判定が引き続き有効かを影響範囲単位で確認する。影響する既判定は再評価するまで受け入れ根拠へ再利用しない。
- 実行中・完了済みの作業についても、継続・停止・修正・再検証の必要性を影響範囲単位で判断する。
- 影響しない作業や証拠を一律に停止・破棄しない。Epic 完了済み Issue の影響再評価は既存の巻き戻し禁止契約に従う。
- 「合意変更が上流入力にのみ反映され、古い Execution Contract のまま dispatch する」シナリオと「影響する旧証拠・旧判定を再評価せず受け入れ根拠に再利用する」シナリオを、実経路に接続した決定的回帰試験で拒否する。
