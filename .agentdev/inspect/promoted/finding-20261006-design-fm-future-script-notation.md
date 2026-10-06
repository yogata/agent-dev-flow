# 実装済み search-target-area.ts の「将来追加」表記残置

- **分類**: inspect finding promote（F-06・severity low・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/designs/skills/agentdev-design-file-manager.md:29` に「Design 固有 script（`search-target-area.ts` 等、将来追加）の選択と呼出契約」と記載
- search-target-area.ts は `src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts` に実在（glob 実証済み）
- Design 自体は 2026-10-05（ce6bd072）更新済みだが当該表記は放置

## 影響課題

実装済み機能の「将来追加」表記により、Design の現行契約記述が実態と不整合。軽微だが確定した事実不整合（正解が一意）。

## 対応候補

docs 修正: 「将来追加」を削除し現行記述へ是正。

## 既存要件関連

agentdev-design-file-manager Design（script 呼出契約）。

## 統合注記（backlog-review での統合判定候補）

F-01/F-02/F-04/F-05 と同じ軽微 docs 修正グループ。単独でも束ねでも対応可能。
