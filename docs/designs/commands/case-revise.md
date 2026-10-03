---
title: case-revise Design
status: accepted
created: 2026-09-14
updated: "2026-09-19"
---

# case-revise Command Design

本 Design が定義する case-revise は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。例外経路段階であり、case-auto の例外経路解決（Root Case 指定に基づく再合意済み Definition 変更の解決）から駆動される。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

case-revise の公開契約を定義する。case-revise は req-define で再合意済みの Definition 変更を既存 Case へ反映する主フローの例外経路コマンドである（REQ-062）。

## 公開 interface

- 入力: Root Case、req-define で再合意済みの差分（draft）
- 出力: Definition Amendment PR（canonical Definition に実変更がある場合のみ）、case-ready への引き継ぎ
- 副作用: Definition Amendment PR の作成、影響ある Issue の再評価マーキング

## 内部構成

- 実変更判定: canonical Definition との差分比較で実変更の有無を判定する。実変更がなければ Amendment PR を作成せず case-ready へ移行する（空の Amendment PR を作らない）
- 影響再評価: Definition 変更の影響がある Issue のみを再評価対象とする。影響なしと確認できた完了済み Issue は維持する
- 再確定の委譲: execution contract / execution structure の再確定は case-ready が行う（case-revise 完了後は case-ready を経由）

## 停止条件

- 再合意済みでない変更の反映要求（req-define へ差し戻し）
- 同一再合意内容に対応する既存 Amendment PR の検出（重複生成禁止、既存 PR を再利用）

## 冪等性

同じ再合意内容に対応する既存 Amendment PR を重複生成しない。中断済み成果物は巻き戻さない。
