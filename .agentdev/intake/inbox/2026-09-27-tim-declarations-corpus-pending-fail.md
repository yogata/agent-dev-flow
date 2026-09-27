# intake: TIM 対応宣言コーパス（REQ-012-026〜042 実装対応宣言テスト 2 件）の先行 fail 残存

- 観測日: 2026-09-27
- 観測元: Case #3166 case-close（PR #3168 本文 Findings / Capture候補 の intake 候補回収）
- 種別: 既存残課題の新規決定候補

## 候補: REQ-012 系 TIM 宣言整備の実施

- **実観測事実**: tim_declarations_contract.test.ts の REQ-012-026〜042 実装対応宣言テスト 2 件が main 現行でも fail（先行状態・Case #3166 の変更と無関係の TIM 宣言コーパス側の未整備）。full integrity suite は bun test 2638 中 2636 pass・2 fail（case-run 実績 2627 中 2625 pass と同一 fail 集合・本変更非由来を確認済み）
- **問題構造**: REQ-012 系の TIM 宣言整備が未実施のまま残存し、integrity suite の strict pass を常時 2 件阻害している
- **検討対象**: REQ-012-026〜042 の実装対応宣言の整備（TIM 宣言コーパス側の未整備分の補完）
- **関連**: Case #3166、PR #3168、tim_declarations_contract.test.ts、REQ-012（成果物トレーサビリティ）
