# SPEC確定候補: 「full integrity suite pass」受入れ基準の明文化

## 観測内容

「full integrity suite pass」の受入れ基準が明文化されていない。OU-008a の AC-17 判定は「bun test 全 green」基準で実施したが、実際には既知 intake 済み欠陥と環境依存欠陥が残存し、運用で補完した。さらに main repo 環境固有の fail も現れ、検証環境により fail 構成が変動することが判明した。

## 影響

- 受入れ判定の基準が環境により変動し、判定の一貫性が保てない
- 既知欠陥と新規欠陥の区別なく全 green を要求すると判定不能に陥る

## 課題

「full integrity suite pass」の受入れ基準（既知欠陥の扱い、環境依存の扱い、baseline 比較の要否）を品質ゲート側 SPEC または integrity 契約へ明文化する。

## 既存要件・成果物との関連

- 対象: 品質ゲート側 SPEC または integrity 契約
- 関連: OU-008a（AC-17）、AG 群

## 出典

- 発生日: 2026-08-15
- 取得元: OU-008a 検証実施時の観測（環境間 fail 構成変動）
- 元 item: intake-2026-08-15-spec-candidate-full-integrity-suite-acceptance-criteria.md
