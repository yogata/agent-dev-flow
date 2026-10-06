# REQ-014 と REQ-015 の「原則実行」「スキップ条件」規範の二重記述

- **分類**: inspect finding promote（F-03・severity medium・confidence medium・Jev 分類 defer 0.61 → promote 是正〔semantic_disagreement〕・adversarial-review で promote 支持確認）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/requirements/REQ-014.md:32`（REQ-014-013）「adversarial-review を原則実行し、ユーザー明示指定を通常発動の必須条件としないこと（default-on）」↔ `REQ-015.md:25`（REQ-015-002）「対象7コマンドでは adversarial-review を原則実行すること」— default-on 規範の実質重複
- `REQ-014.md:33`（REQ-014-014）「スキップ条件は各呼出元の…正規所有者で明示的かつ判定可能に定め」↔ `REQ-015.md:26`（REQ-015-003）「各呼出元の正規所有者が定義したスキップ条件に該当する場合…省略して従来フローを継続できること」— スキップ規範の二重記述
- `REQ-014.md:30`（REQ-014-011）の正規所有者マトリックス・重複規範禁止と緊張

## 影響課題

adversarial-review（Stream A/B）で確認された補正事項:

- **意図的二段構成の可能性**: REQ-014.md:11-12 の目的節「本 REQ は共通契約層を定義し、各 command の呼出統合は REQ-015 が所有する」、REQ-014.md:41 適用範囲「default-on + skip policy（REQ-014-013/014）」、REQ-015.md:44 対象外「共通 caller integration 契約（REQ-014）」が二段構成（共通契約 vs caller 適用）を宣言しており、意図的構成である可能性が高い
- **完全同一ではない**: REQ-015-002 は default-on に加え「専用検出・専用フラグを持たない」追加規範を含む。REQ-014-014（定義所在の規範）と REQ-015-003（該当時の省略許可の規範）は視点が異なる
- それでも REQ-014-011（重複規範禁止）との緊張は実在し、REQ 同士の矛盾・正規所有行の単一化は req-define の再合意でしか解決できない。defer では解決導線が閉じる（req-define 壁打ちが唯一の解決手段であり、その入口は RU 化のみ）

## 対応候補

req-define 再壁打ち: (a) 意図的二段構成であることを両 REQ に明文化して緊張解消、または (b) 一方を規範宣言行・他方を参照行へ単一化。正規所有行の選択は req-define の判断事項（inspect-promote では決定しない）。

## 既存要件関連

REQ-014-011（正規所有者マトリックス・重複規範禁止）、REQ-014-013/014、REQ-015-002/003。

## 統合注記（backlog-review での統合判定候補）

単独 RU 化推奨（req-define 再壁打ち route は本件のみ）。docs 修正 RU との束ねは不適切（解決手段が異なる）。
