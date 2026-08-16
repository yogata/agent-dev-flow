# Intake Item: SPEC確定候補 — 計測日導出の安定化（index-auto-generation / autogen-freshness-gate）

## 発生源

- PR: #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

`generate_indexes.ts` は計測日を `new Date()`（実行時日付）で導出するため、計測日を含む AUTOGEN ブロック（req-metrics-measurement-example / spec-metrics-measurement-example）は日次で鮮度を失い IR-061 が再検出する構造である。PR #2151 の再生成（計測日 2026-08-16）も翌日に陳腐化する。

## 推奨対応

`index-auto-generation` SPEC / `autogen-freshness-gate` SPEC で計測日導出の安定化（例: 対象ドキュメント群の最終コミット日付の利用）を確定判断する。

## 関連

- Issue: #2136 (CLOSED), Epic: #2134
- PR: #2151 (SPEC確定候補 セクション 1)
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md N20/N21・残存課題「計測日の日次陳腐化構造」
