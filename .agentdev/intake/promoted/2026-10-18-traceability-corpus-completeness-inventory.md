# traceability check コーパス全体の既存完全性欠落の棚卸しと policy optional 指定の処置判断

## 観測内容

- 出所: Case #3793（PR #3800）case-close Capture 回収（PR 本文 Findings、工程記録〔検証証拠〕commentId 6251242290）
- traceability check のコーパス全体実行（PR #3800 の検証実行時）で missing-design 669 行 / missing-implementation 98 行 / missing-verification 13 行の既存欠落が観測された。
- 欠落は主に REQ-001 系等の旧要件行で、本件対象 REQ-111-014〜016 は含まれない。lifecycle gate 完全性の判定には影響しない、到達目標状態の診断指標である。

## 影響

- コーパス全体の traceability check 実行時に大量の既存欠落が常時報告され、診断指標の実質的なシグナル対ノイズ比を下げている。
- optional 列挙の処置方針が未決のままでは、新規検証行と既存欠落行の区別が運用上あい昧なまま継続する。

## 課題

- コーパス全体の完全性欠落の棚卸しが未実施。
- traceability/policy.yaml の optional 列挙への処置方針（旧要件行を optional と明示するか、欠落行を解消するか）が未決。

## 既存要件との関連

- traceability/policy.yaml（optional 列挙）
- docs/designs/foundations/v4-traceability-model.md（completeness の 2 層）

## 人間判断ポイント

- 旧要件行を optional と明示するか、欠落行を解消するかの方針判断（棚卸しの対象範囲と受け入れ条件に関わる判断）。
