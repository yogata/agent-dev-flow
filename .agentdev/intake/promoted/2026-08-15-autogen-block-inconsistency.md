# AUTOGEN ブロック不整合4件（IR-061 違反）の再生成による解消

## 観測内容

Phase 0 baseline 記録で検出された AUTOGEN ブロック不整合4件が IR-061 違反に該当する。generate_indexes.ts の再実行で即時解消可能だが、同ツールが docs/adr/README.md 前提で dry-run 実行不能な前提障害がある。IR-061 自体が存在条件を満たす IR のため、自身の検査違反の解消が求められる。

## 影響

- IR-061（AUTOGEN 整合）が自身の検査違反状態にあり、検査の権威性が損なわれている
- AUTOGEN ブロックと実体の乖離が継続する

## 課題

generate_indexes.ts の前提障害修正（promoted item 2026-08-15-generate-indexes-requires-removed-adr-readme）を先行させたうえで、再実行により4件の不整合を解消する。即時対応か Epic 内対応かの優先度は backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: AUTOGEN ブロック不整合4件、generate_indexes.ts（前提）
- 関連: IR-061、Epic #2076 Phase 0 baseline、promoted item 2026-08-15-generate-indexes-requires-removed-adr-readme（先行依存）

## 出典

- 発生日: 2026-08-11
- 取得元: Phase 0 baseline 記録時の観測
- 元 item: intake-2026-08-11-autogen-block-inconsistency.md
