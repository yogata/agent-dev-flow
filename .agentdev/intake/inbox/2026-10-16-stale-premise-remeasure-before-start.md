# intake: 既存 fail を前提とする子 Issue の着手時再計測前置の運用候補

- **発見元**: PR #3750（子 Issue #3741 / OU-005 / DEL-3741-2 回収検証）
- **内容**: Issue #3741 の起票源 learning 記録は Case #3674 時点（baseline f6a842da）の計測に基づき、追跡Issue #3702 / PR #3720（462074e9）での修復後に陳腐化していた。既存 fail を前提とする子 Issue は、着手時に現行 main での再計測を前置すると起票前提の陳腐化を着手前に検知できる
- **状態**: 未対応（運用改善候補）。case-run 委譲プロンプトまたは learning-capture 条項への反映候補
- **識別子**: Issue #3702、PR #3720（462074e9）、Case #3729（PR #3750）
- **capture 由来**: case-close Capture 回収 2026-10-16（Epic #3732 / PR 本文 intake セクション）
