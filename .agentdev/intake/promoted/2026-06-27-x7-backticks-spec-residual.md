# X-7 backticks 運用基準 SPEC の完全策定と残カタログ

## 観測内容

Issue #1118（doc-quality-system OU-002 Epic）は X-1〜X-7 横断是正と X-7 SPEC 運用基準策定を掲げたが、完了条件 AG-008〜AG-012 は未完了のままクローズされた。PR #1122（partial PR）は X-6 と X-2 テーブルセルのみ是正し、X-2 本文・X-1/X-3/X-4/X-5・X-7 を follow-up に回した。

後続 Epic #1231（docs 機械判定可能な表記是正）と子 Issue #1232〜#1239 が X-1/X-4/X-5/X-6 の大部分を対応し、Issue #1164（backticks SPEC 策定完結）と #1262（X-7 件数確定のため inspect-docs 再実行）で X-7 SPEC は完了度が上がった。ただし PR #1282 は「X-7 の実残存件数確定のため inspect-docs 再実行が必要（別途対応）」と記録し、完全解消は別途対応として残置している。

未完了の完了条件:
- AG-008: 7 ディレクトリ × X-1〜X-7 の完全カタログ再生成
- AG-010: X-2 本文（370 件、文脈判定必要）、X-1/X-3/X-4/X-5、X-7 の残パターン是正
- AG-011: X-7 SPEC 運用基準策定（backticks 有無混用）
- AG-012: X-1/X-3/X-4/X-5/X-2 本文/X-7 の finding 0 達成

## 影響

- X-7 SPEC（`backticks-identifier-threshold.md`）の accepted 昇格判断が未確定。運用実績の蓄積状況が不明。
- 完全カタログ（AG-008）が未再生成のため、現在の残件数が確定していない。
- Issue #1118 の完了条件 AG-008/AG-010/AG-011/AG-012 の最終受け入れ判断が保留中。

## 課題

- X-7 SPEC の accepted 昇格判断と運用実績の蓄積状況の確定。
- X-2 本文（370 件）の查読是正完了確認（OU-002 Wave 1/2 子 Issue での消化状況）。
- 完全カタログ（AG-008）の再生成要否と、現在の残件数の確定。
- Issue #1118 完了条件 AG-008/AG-010/AG-011/AG-012 の最終受け入れ判断。
- PR #1282 が指摘した「X-7 実残存件数確定のための inspect-docs 再実行」の実施要否。

## 既存要件との関連

- 出典 RU: RU-0009（`.agentdev/backlog/req-units/RU-0009.md`）。
- X-7 SPEC 策定: Issue #1164 / PR #1165。
- X-7 件数確定: Issue #1262 / PR #1282。
- 関連 Epic: Issue #1231 および子 Issue #1232〜#1239。

## 観測元

- Issue #1118（doc-quality-system OU-002 Epic）
- PR #1122（partial PR）
- 後続 Epic: Issue #1231 および子 Issue #1232〜#1239
- X-7 SPEC 策定: Issue #1164 / PR #1165
- X-7 件数確定: Issue #1262 / PR #1282
