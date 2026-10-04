# REQ-101 行番号 005 の無記録欠落

- **分類**: inspect finding promote（RQ-01・severity low・confidence medium・Jev 分類は defer 意見・semantic_disagreement により promote を確定）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定（採番確認を git 追跡で完了した後の確定）

## 観測（evidence・実測確認済み）

- `docs/requirements/REQ-101.md:21-22` で行連番が REQ-101-004 → REQ-101-006 と飛び、005 が存在しない（実読確認済み）
- リポジトリ全体で REQ-101-005 への参照なし
- git 追跡（inspect-promote 2026-10-05 実施）: REQ-101-005 は e7c2626b（Case #3391・REQ-101 新設）で採番され、b5e1ee3a（Case #3407・Issue タイトル・本文・工程記録の簡素化）で削除された。**意図的な行削除であり、Case #3407 の変更履歴に紐づく**
- REQ-101-006/007 は docs/designs/workflows/issue-lifecycle-records.md から参照されており、行 ID 振替えを採る場合は参照更新を伴う
- 移管記録・欠番注記は REQ-101.md に存在しない

## 影響課題

numbering-policy の採番是正規定上、中間欠落は明記が原則の状態が未充足。将来の baseline ファントム引用の温床になり得る。

## 対応候補

docs-check route: 欠番記録の追加、または行 ID 振替え（参照更新込み）。**20260926 defer RQ-13（説明なき行欠番の集約・inbox 残置中）の集約判断と整合して処置方法を決定すること**（RQ-13 の行単位廃止台帳 方針確定時に本件も対象に含める）。

## 既存要件関連

numbering-policy.md（採番規則・欠番の扱い）。REQ-101 は 2026-10-03/04 新設のため今回対象期間内。

## 統合注記（backlog-review での統合判定候補）

RQ-13（20260926 defer・行欠番集約）への個別インスタンスとして関連。RQ-13 自体は defer 残置のため、本件のみ promoted。
