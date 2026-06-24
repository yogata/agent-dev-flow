# X-7 識別子と一般名詞の区別（backticks 有無混用）は SPEC 運用基準策定を伴う独立 Issue が適切

## 観測内容

X-7（識別子と一般名詞の区別、backticks 有無混用）は Wave 2 全 Issue（#1076/#1078/#1079/#1080/#1086）で未対応であり、本 PR #1122 でも未対応である。
Issue #1118 の完了条件 AG-011 は X-7 について「backticks 有無混用の運用基準が SPEC として策定されていること」を要求する。
X-7 は機械判定可能な閾値の定義を要し、`docs/specs/runtime-package-boundary.md` の良パターン一覧表の Type ID 列（識別子、本体は日本語）を展開基準に反映する必要がある。

## 影響

機械判定可能な閾値の定義がないため、横断是正（機械置換または査読）に着手できない。
単一 PR で X-1〜X-6 と同時処理するには大きすぎる。

## 課題

識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を SPEC として策定する。

## 既存要件との関連

- Issue #1118（partial）、PR #1122（merged, squash bb13183）
- 完了条件: AG-011（X-7 運用基準の SPEC 策定）
- 基準参照元: `docs/specs/runtime-package-boundary.md`（良パターン一覧表 Type ID 列）

## 対応方針の方向性

- `runtime-package-boundary.md` の良パターン一覧表を基に、識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を定義する
- 機械判定可能なルールを SPEC（`docs/specs/` 配下、新設または既存拡張）として策定する
- 策定後に横断是正（機械置換または査読）を実施する
