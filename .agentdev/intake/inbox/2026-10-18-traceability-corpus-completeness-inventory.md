# traceability check コーパス全体の既存完全性欠落の棚卸しと policy optional 指定の処置判断候補

- 出所: Case #3793（PR #3800）case-close Capture 回収（PR 本文 Findings、工程記録〔検証証拠〕commentId 6251242290）
- 種別: トレーサビリティ完全性の棚卸し候補（人間判断待ち）
- 事実: traceability check のコーパス全体実行（PR #3800 の検証実行時）で missing-design 669 行 / missing-implementation 98 行 / missing-verification 13 行の既存欠落が観測された（主に REQ-001 系等の旧要件行。本件対象 REQ-111-014〜016 は含まれない。lifecycle gate 完全性の判定には影響しない到達目標状態の診断指標）
- 提案: コーパス全体の完全性欠落の棚卸しと、`traceability/policy.yaml` の optional 列挙への処置判断（旧要件行を optional と明示するか、欠落行を解消するか）を人間が判断する
- 対象: traceability/policy.yaml、docs/designs/foundations/v4-traceability-model.md（completeness の 2 層）
