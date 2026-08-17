# 計測日導出の安定化（index-auto-generation / autogen-freshness-gate、SPEC確定候補）

## 観測内容

`generate_indexes.ts` は計測日を `new Date()`（実行時日付）で導出するため、計測日を含む AUTOGEN ブロック（req-metrics-measurement-example / spec-metrics-measurement-example）は日次で鮮度を失い IR-061 が再検出する構造である。PR #2151 の再生成（計測日 2026-08-16）も翌日に陳腐化する。

## 影響

- 日次で IR-061（AUTOGEN 鮮度）違反が構造的に再発生し、checker 結果のノイズとなる

## 課題

`index-auto-generation` SPEC / `autogen-freshness-gate` SPEC で計測日導出の安定化（例: 対象ドキュメント群の最終コミット日付の利用）を確定判断する。

## 既存要件・成果物との関連

- SPEC: index-auto-generation、autogen-freshness-gate
- 実装: generate_indexes.ts（計測日導出）
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md N20/N21・残存課題「計測日の日次陳腐化構造」

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-autogen-measurement-date-stability.md
