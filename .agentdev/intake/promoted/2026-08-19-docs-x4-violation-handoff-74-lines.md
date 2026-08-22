# docs 側一文一行違反74行の是正用要件doc 化（特定結果の引き渡し受領）

## 観測

Issue 2235（OU-0018）の完了形として、docs 側一文一行機械判定（X-4）違反行の特定結果が PR 2275 本文へ引き渡された。

- docs/requirements/**: 22違反行（retired/ 4行を含む）
- docs/decisions/**: 52違反行

Issue 起票時記載（11行・46行）からの増分は RU-0063 計測後の docs 追加に由来する。実測値のファイル・行単位の全リストは PR 2275 本文の details 2件に記録済み。

## 今回扱わない理由

CR-011 境界により、docs 側本文の編集は後続の req-save / Decision 更新手続き（是正用の別要件doc）が所有する。Issue 2235 は特定・引き渡しまでを完了とした。

## 影響

要件doc 化までの間、docs 側74行の違反が残存する。REQ/DEC ファイルは配布物と異なり文書構造変更を伴うため、機械是正ではなく要件経由のは正判断が必要。

## レビューで決めること

- 是正用要件doc の作成単位（requirements と decisions の分離・統合）
- retired/ 4行の扱い（retired 文書は是正対象外とするか）
- 実測値（22行・52行）ベースの取捨基準

## 根拠

- PR 2275 本文「docs 側違反行特定結果（是正用要件doc 入力・編集なし）」節・「Findings / Capture候補」4件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2275）
