# draft Design の陳腐化 2 件（IR-054、30 日超）

## 観測

2026-09-03 の docs-check（check_integrity）で、draft 状態の Design 2 件が draft-spec-staleness [WARNING]（IR-054、閾値 30 日）として検出された:

- docs/designs/skills/agentdev-artifact-validation.md（updated 2026-07-24、41 日）
- docs/designs/skills/agentdev-design-file-manager.md（updated 2026-07-28、37 日）

triage 選択肢は checker の案内どおり (a) case-close の Design 確定による accepted 昇格、(b) 内容更新と updated 更新、(c) retire の 3 経路。

原因分類: **仮説**（両 Design が対応する Case の case-close 時に昇格されず draft 残留した可能性。経緯の追跡は未実施）

## 影響

- draft Design の滞留が続き、本文の現行性が保証されない（IR-054 の管理意図どおり、30 日超の draft は現行性リスク）
- agentdev-design-file-manager は design-save / case-close の実行時に正規参照点として使われており、draft のまま参照される状態が続く

## レビューで決めること

- 両 Design の triage 判定（accepted 昇格 / 更新 / retire のいずれか）
- 昇格する場合の対応 Case と昇格経路（case-close Design 確定の利用）
- agentdev-artifact-validation の検証契約が現行 REQ と整合しているかの確認（昇格前の再確認）

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（WARNING draft-spec-staleness ×2、IR-054）
- docs/designs/skills/agentdev-artifact-validation.md、docs/designs/skills/agentdev-design-file-manager.md（status: draft、updated の各日付）
