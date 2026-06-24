# X-7 識別子と一般名詞の区別（backticks 有無混用）は SPEC 運用基準策定を伴う独立 Issue が適切

## 発生源

- Issue: #1118 (partial)
- PR: #1122 (merged, squash bb13183)
- 発生日: 2026-06-24

## 内容

X-7（識別子と一般名詞の区別、backticks 有無混用）は Wave 2 全 Issue（#1076/#1078/#1079/#1080/#1086）で未対応であり、本 PR #1122 でも未対応である。Issue #1118 の完了条件 AG-011 は X-7 について「backticks 有無混用の運用基準が SPEC として策定されていること」を要求する。

X-7 は機械判定可能な閾値の定義を要し、`docs/specs/runtime-package-boundary.md` の良パターン一覧表の Type ID 列（識別子、本体は日本語）を展開基準に反映する必要がある。単一 PR で X-1〜X-6 と同時処理するには大きすぎるため、独立 Issue として分割することが適切。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- `runtime-package-boundary.md` の良パターン一覧表を基に、識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を定義する
- 機械判定可能なルールを SPEC（`docs/specs/` 配下、新設または既存拡張）として策定する
- 策定後に横断是正（機械置換または査読）を実施する

## 現在の追跡状態

- PR #1122 Findings / Capture候補（F-3）に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
