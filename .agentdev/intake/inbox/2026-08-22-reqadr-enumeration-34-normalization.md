# REQ/ADR/ 種別列挙 34 件の一括正規化要否（IR-065 で検出可能になった Wave 2 対象外領域）

## 観測

IR-065（obsolete-vocabulary-current-use）の導入により、配布スキル本文・extensions yaml の「REQ/ADR/Design」種別列挙 34 件が検出可能になった（provenance: issue-2372-ir065-initial-baseline、Wave 2 の観点V1 は種別列挙を検出対象外だった領域）。

## 今回扱わない理由

「REQ/ADR/Design」から「REQ/Decision/Design」への正規化は Wave 2（REQ-046 横断正規化）が対象外とした領域であり、一括正規化の要否は新規の判断事項である。case-close の capture 責務は回収・保存のみである。

## 影響

正規化しない場合、34 件は baseline-known（info）のまま残存する。正規化する場合は baseline エントリの削除（是正完了反映）を伴う配布物横断の変更となる。

## レビューで決めること

- 種別列挙「REQ/ADR/Design」を「REQ/Decision/Design」へ一括正規化するか
- 正規化する場合の実施単位（単独 case か、B-01/B-02 解消と同時か）

## 根拠

- PR #2376 本文「Findings / Capture候補」intake 2、「baseline 運用」節
- data/obsolete-vocabulary-map.yaml（REQ/ADR/ 種別列挙の検出定義）
