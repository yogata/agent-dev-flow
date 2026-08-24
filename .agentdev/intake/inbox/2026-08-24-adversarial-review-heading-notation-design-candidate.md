# adversarial-review 挿入境界の節見出し表記規約の Design 明文化候補

## 観測

PR #2426（Issue #2425、経路ラベル廃止・呼出元名識別への切替）で、Command Design の「adversarial-review 挿入境界」節見出しに `adversarial-review 挿入境界（<呼出元コマンド名>）` 形式（case-run のみ位置修飾 `（case-run: adapter 委譲内）`、case-auto は受領側として `adversarial-review 由来の停止伝播（case-auto の停止伝播受領）`）を採用した。この表記規約は現時点で Design に明文化されておらず運用のみにとどまっている（PR #2426 本文「Design確定候補」1件目）。

## 今回扱わない理由

表記規約の Design（document-type-responsibilities または adversarial-review Design）への確定は case-close の Design確定処理（STEP-3-2）の対象だが、対象 Design は既存（draft なし）であり、文言のみの横断整合変更である本 Case の完了条件には含まれていない。規約確定は別案件として後続へ委ねる。

## 影響

なし（運用は PR #2426 で 8 Command Design に適用済み。未明文化の間は次回の同種変更時に表記がぶれる可能性がある）。

## レビューで決めること

- 表記規約を document-type-responsibilities と adversarial-review Design のどちらへ正規所有させるか
- 位置修飾（adapter 委譲内）と受領側表記（停止伝播受領）の例外形式の取り扱い

## 根拠

- PR #2426 本文「Design確定候補」1件目（発見元: case-run 実装時の表記採用）
- Issue #2425（REQ-014/015/016 横断整合）
