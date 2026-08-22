# 対象外領域（docs/guides）の旧 SPEC パス broken link 5 件（網羅監査 F-017 の対象外観測）

## 観測

REQ-045 網羅監査（PR #2374、Issue #2370）の実行中に、監査対象範囲外の docs/guides 配下で旧 SPEC パスへの broken link 5 件を観測した（`consumer-project-setup.md` の `../specs/local/...` 等、監査レポート F-017）。本監査の対象範囲外のため修正せず参考記録とした。

## 今回扱わない理由

監査 Issue #2370 の対象範囲（REQ-045-001）は docs/guides を含まず、監査は検出事項の修正を行わない契約である（修正は横断正規化 #2371 の責務）。case-close の capture 責務は回収・保存のみである。

## 影響

guides 配下の旧パス参照が残存する限り、利用者が旧 SPEC パスへ到達できない状態が継続する。

## レビューで決めること

- guides 配下の旧 SPEC パス是正の要否と優先度（Wave 2 横断正規化 #2371 の対象に含めるか）

## 根拠

- PR #2374 本文「Findings / Capture候補」intake 1
- 監査レポート F-017（docs/reports/integrity/audits/req-045-consistency-audit-20260822.md）
