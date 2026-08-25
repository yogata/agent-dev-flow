# check_integrity 残存 NG のうち F-020×3・F-028×1 の解消 or baseline 承認の判断が残存（Wave 2 正規化後、25 → 9 減の残分）

## 観測

REQ-046 横断正規化（PR #2375、Issue #2371）により check_integrity.ts の new unmanaged NG は 25 → 9 に減少した。残る 9 件のうち F-017×5 は対象外領域（docs/guides）の参考記録（intake item 2026-08-22-guides-old-spec-path-broken-links-5.md で回収済み）であり、F-020（workflow-status-prohibition 過検出候補）×3 の NG と F-028（proposed DEC-017 の現行基盤引用）×1 の WARNING が blocked 報告（B-04/B-06）として残存している。

## 今回扱わない理由

F-020 は検出意図の確認待ち（check_integrity.ts は本 PR で無変更）、F-028 は DEC-017 の受理判断待ちであり、いずれも修正方法を一意に導けないため横断正規化の安全境界（REQ-046-009）により修正せず blocked として報告された。case-close の capture 責務は回収・保存のみである。

## 影響

残存 NG/WARNING の解消または baseline 承認が行われるまで、check_integrity.ts は main HEAD で exit 1 を返し続ける（機械検査による緑状態の固定ができない）。

## レビューで決めること

- F-020 の検出意図確認（過検出なら検出規則の修正、意図的なら baseline 承認）
- F-028 の DEC-017 受理判断と引用是正の要否
- 先行 intake item（2026-08-22-f026-baseline-unmanaged-ng-25.md、25 件時点の区分け判断）の後続状態として扱うか

## 根拠

- PR #2375 本文「Findings / Capture候補」intake 4、「blocked 報告」表 B-04/B-06、「機械検査 NG 推移（F-026 集計の解消）」
- 正規化ログ docs/reports/integrity/normalizations/req-046-normalization-20260822.md
