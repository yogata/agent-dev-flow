# issue-lifecycle-records.md の完了済み変更指示の現在形残置

- **分類**: inspect finding promote（DS-05・severity low・confidence medium-high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定

## 観測（evidence・実測確認済み）

- `docs/designs/workflows/issue-lifecycle-records.md:37`:「検証スクリプト（record-comments.ts）、Epic 反映エンジン（epic-reflect.ts）、反映計画（records-report.ts）は、コメント生成契機の縮小に追随して start / handoff / resume 系の生成・反映経路を削除する。」（実読確認済み）
- 実装は 9a8933fb（2026-10-03）で完了済み。record-comments.ts の現況に start/handoff/resume 系の生成経路なしを再確認（該当語彙の一致は startDate/startIndex 等のコード内部識別子のみ）
- 同節の残存語彙契約（hold/decision_change/検証証拠の三者共有）は現行契約として有効

## 影響課題

読者が当該節を未完了の変更指示と誤認する恐れがある。

## 対応候補

docs-check route: 現行形の記述に是正（完了済み旨への書き換え）。完了済み変更指示語の陳腐化検出は文脈依存のため機械化困難として inspect-docs（意味診断）継続扱い。

## 既存要件関連

実装（src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts 現況）を正とする DRIFT 是正。

## 統合注記（backlog-review での統合判定候補）

20260926 defer DS-03（v4-traceability-model の時制問題）と同種の時制是正カテゴリ。DS-03 は defer 残置のため本件は単独対応。
