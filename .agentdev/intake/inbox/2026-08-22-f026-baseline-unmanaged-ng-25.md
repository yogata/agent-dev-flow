# baseline 未管理 NG 25 件（F-026）の解消 or baseline 承認の運用判断が必要（網羅監査 PC-11）

## 観測

REQ-045 網羅監査（PR #2374、Issue #2370）で、main HEAD（08f07f4d）時点の check_integrity.ts が exit=1 を返し、未管理（unmanaged）NG 25 件を報告していることを確認した（監査レポート F-026、問題クラス PC-11）。個別内容はレポートの各 F へ分解済みである。

## 今回扱わない理由

監査（#2370）は検出のみを行い修正は行わない契約である。NG の解消と baseline 承認の運用判断は横断正規化（#2371、REQ-046）の入力として引き継ぐ。case-close の capture 責務は回収・保存のみである。

## 影響

未管理 NG が残存する間、check_integrity は main HEAD で exit=1 を返し続け、機械検査による緑状態の固定ができない。

## レビューで決めること

- 25 件の個別解消（Wave 2 正規化での修正）と baseline 承認（既知違反としての管理）の区分け

## 根拠

- PR #2374 本文「Findings / Capture候補」intake 2、監査サマリ PC-11
- 監査レポート F-026（docs/reports/integrity/audits/req-045-consistency-audit-20260822.md）
