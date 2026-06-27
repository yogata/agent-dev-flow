# X-7 backticks 運用基準 SPEC の完全策定と残カタログ

## 観察

Issue #1118（doc-quality-system OU-002 Epic）は X-1〜X-7 横断是正と X-7 SPEC 運用基準策定を掲げたが、完了条件 AG-008〜AG-012 は未完了のままクローズされた。X-7（識別子と散文普通名詞の境界揺れ）については、AG-011「backticks 有無混用の運用基準が SPEC として策定されていること」を完結条件としていた。

PR #1122（partial PR）は X-6 と X-2 テーブルセルのみ是正し、X-2 本文・X-1/X-3/X-4/X-5・X-7 を明示的に follow-up に回した。完了条件 checkbox でも AG-008（完全カタログ）、AG-010（残パターン）、AG-011（X-7 SPEC）、AG-012（残 finding 0）はすべて `- [ ]` のまま残置した。

## 修正されなかった理由

- AG-008: 7 ディレクトリ × X-1〜X-7 の完全カタログ再生成は follow-up 课题とした
- AG-010: X-2 本文（370 件、文脈判定必要）、X-1/X-3/X-4/X-5、X-7 は優先度順是正の残パターン
- AG-011: X-7 SPEC 運用基準は未対応（follow-up）
- AG-012: X-1/X-3/X-4/X-5/X-2 本文/X-7 の finding 0 達成は follow-up

後続 Epic #1231（docs 機械判定可能な表記是正）と子 Issue #1232〜#1239 が X-1/X-4/X-5/X-6 の大部分を対応し、Issue #1164（backticks SPEC 策定完結）と #1262（X-7 件数確定のため inspect-docs 再実行）で X-7 SPEC は完了度が上がった。ただし PR #1282 は「X-7 (backticks 識別子/一般名詞境界) の実残存件数確定のため inspect-docs 再実行が必要（別途対応）」と記録し、完全解消は別途対応として残置している。

## 課題

- X-7 SPEC（`backticks-identifier-threshold.md`）の accepted 昇格判断と、運用実績の蓄積状況
- X-2 本文（370 件）の查読是正完了確認（OU-002 Wave 1/2 子 Issue での消化状況）
- 完全カタログ（AG-008）の再生成要否と、現在の残件数の確定
- Issue #1118 完了条件 AG-008/AG-010/AG-011/AG-012 の最終受け入れ判断

## 根拠

PR #1122 本文（完了条件）より引用:

> - [ ] **AG-008**（カタログ再生成）: 部分対応。本 PR で是正した X-6/X-2 テーブルセルの裏付け証拠（件数・ファイル・行）は上記に提示。完全カタログ（7 ディレクトリ × X-1〜X-7）は follow-up。
> - [ ] **AG-010**（優先度順是正）: 部分対応。X-6（第 2 優先）と X-2 テーブルセル（第 1 優先の機械安全部分）を是正。X-2 本文 ` — `、X-1/X-3/X-4/X-5、X-7 は follow-up。
> - [ ] **AG-011**（X-7 SPEC 運用基準）: 未対応。follow-up。
> - [ ] **AG-012**（finding 0 件）: 部分対応。X-6 は対象 7 ディレクトリで 0 件達成。X-2 テーブルセル `| — |` は対象 7 ディレクトリで 0 件達成（規範記述ファイルを除く）。X-1/X-3/X-4/X-5/X-2 本文/X-7 は follow-up。

PR #1282 本文より引用:

> X-7 (backticks 識別子/一般名詞境界) の実残存件数確定のため inspect-docs 再実行が必要（別途対応）

## 観測元

- Issue #1118（doc-quality-system OU-002 Epic）
- PR #1122（partial PR）
- 後続 Epic: Issue #1231 および子 Issue #1232〜#1239
- X-7 SPEC 策定: Issue #1164 / PR #1165
- X-7 件数確定: Issue #1262 / PR #1282
- 出典: RU-0009（`.agentdev/backlog/req-units/RU-0009.md`）
