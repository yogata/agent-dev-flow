# vocabulary-registry の実在スキル表が網羅性を欠く（現行約 50 スキル中 26 語の列挙、監査未指摘の既存状態）

## 観測

REQ-046 横断正規化（PR #2375、Issue #2371）の作業中に、`.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` の実在スキル表が現行約 50 スキル中 26 語の列挙に留まることを確認した。Wave 1 監査（REQ-045）では指摘されていない既存状態である。

## 今回扱わない理由

語彙表と `src/opencode/skills` 実在スキルの突合検査の整備は新規の機械検査設計を要する。本 Issue の対象は監査で fail 判定された事項の是正であり、監査未指摘の既存状態は対象外。case-close の capture 責務は回収・保存のみである。

## 影響

語彙表の実在スキル列挙が陳腐化したまま残る限り、語彙対照を参照する検査・是正の精度が列挙の品質に依存する。

## レビューで決めること

- 語彙表と `src/opencode/skills` 実在の突合検査を #2372（docs-check 新規機械検査クラス、REQ-010-064〜068）の整備候補に含めるか

## 根拠

- PR #2375 本文「Findings / Capture候補」intake 2
