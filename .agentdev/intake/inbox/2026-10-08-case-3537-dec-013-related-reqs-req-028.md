# DEC-013 related_reqs の REQ-028 残存（retired REQ への現行 Decision 参照）を後続で判断する

## 内容

Case 3537（Wave 2-5）の全面再評価処遇判定で、DEC-013（accepted・現行）の frontmatter related_reqs に REQ-028（前回 retire 済み）が残存していることを確認した。retired REQ への現行 Decision からの関連宣言参照であり、IR-015（廃止 REQ 現行参照検出）の検出対象外領域。REQ-103-029（範囲外の発見は別課題として記録）により本委譲では変更せず記録のみ。

## 影響

機械検査では検出されず、retired REQ 参照の整合性が手動確認に依存し続ける。REQ-103-020（歴史記録の保全）と現行関連宣言（REQ-059）の境界解釈が未確定のまま残る。

## 提案

REQ-059（Decision↔REQ 関連宣言管理）の観点で、現行 Decision が retired REQ を related_reqs に保持し続ける妥当性（歴史記録としての保持 vs 現行参照の除去）を判断する。除去する場合は IR-015 検出対象の拡張（related_reqs 領域の検査追加）を同時に評価する。

## 根拠

Case 3537 の PR 3544 本文「Findings / Capture候補」intake 節と処遇判定一覧（DEC-013 行の根拠記録）。

https://github.com/yogata/agent-dev-flow/pull/3544
