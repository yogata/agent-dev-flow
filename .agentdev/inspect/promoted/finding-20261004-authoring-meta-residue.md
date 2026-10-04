# Design 本文への執筆工程メタ記述残置

- **分類**: inspect finding promote（DS-04・severity low・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261004T162140Z（backlog-auto stage 1）。inspect-promote 2026-10-05 自律確定

## 観測（evidence・実測確認済み）

- `docs/designs/commands/case-ready.md:66`:「…実行時投影（直前セクションの直後に配置）。」
- `docs/designs/commands/case-revise.md:40`:「…実行時投影（冪等性セクションの直後に配置）。」
- いずれも配置位置指示は執筆時の作業指示であり読者に対する契約内容を持たない（082bb32a で導入。実読確認済み）

## 影響課題

軽微。Design 本文に執筆残渣が残り、契約記述と作業指示の混在を生む。

## 対応候補

docs-check route: 括弧句除去。「（…の直後に配置）」等の執筆メタ残渣検出の検査規則候補（低価値のため優先度は低い）。

## 既存要件関連

Design 記述様式（document-type-responsibilities）。

## 統合注記（backlog-review での統合判定候補）

なし（単独対応）。
