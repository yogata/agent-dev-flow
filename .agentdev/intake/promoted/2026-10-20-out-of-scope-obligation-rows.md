# 区分外達成義務行の後続別要求への切り出し（traceability check 区分外行）

## 観測内容

traceability check（コーパス全体・policy 登録後）で残る区分外達成義務行の個別解消は、Issue #3816 の対象範囲外として後続の別要求に切り出す対象である（REQ-021-031 の区分結果の反映）。

- missing-design 2 行: REQ-001-069、REQ-052-012（v4 cutover 以降の行。design 対応の未登録）
- missing-implementation 13 行: REQ-096-010、REQ-096-014、REQ-096-021、REQ-096-025、REQ-096-027、REQ-096-028、REQ-096-029、REQ-096-030、REQ-098-010、REQ-113-001、REQ-113-002
- missing-verification 2 行: REQ-113-001、REQ-113-002

注記: missing-implementation は「13 行」と記載される一方、列挙は 11 件であり、REQ-113-001・REQ-113-002 は missing-verification と重複する。対象行の正確な確定は後続分析（backlog-review 経由の RU 化時）で行う。

## 影響

- 対象行分の達成義務が coverage 上未充足のまま残り、後続要求化されないと backlog から漏れる。
- REQ-113 は missing-implementation と missing-verification の双方に係るため、RU 化時の統合・分割判断が必要。

## 課題

- 後続別要求としての切り出し（backlog-review 経由で RU 化）。
- 記載数（13 行）と列挙数（11 件）の不整合の解消。

## 既存要件との関連

- REQ-021-031（traceability 区分）、Issue #3816（対象範囲外の区分元）

## 出典

- 観測元: PR #3818 本文「## Findings/ Capture候補」セクション（intake 候補）
