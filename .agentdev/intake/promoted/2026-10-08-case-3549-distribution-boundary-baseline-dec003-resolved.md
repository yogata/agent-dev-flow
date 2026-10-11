# 配布境界 baseline の旧 req-draft パス DEC-003 エントリ resolved1 の棚卸しを確定する

## 観測内容

配布依存境界の baseline（check_distribution_boundary.ts の baseline 期待値集合）に残る旧パス src/opencode/commands/agentdev/templates/req-define/req-draft.md の DEC-003 エントリ（category concrete-id、baseline_count 1）が、現行リポジトリでは該当 0 件となっており、Case #3549 の最終 delta 実行で resolved: 1 として計上された（source / link 両 profile 同一。実測は .agentdev/tmp/case-3549/pr2/final-delta-{source,link}.stdout.json）。本 promote 実行時の再確認では、旧パスの後継にあたる現行参照（docs/designs/commands/req-define.md、docs/designs/responsibilities/artifact-contracts.md）が docs 側に存在し、旧パス該当 0 件の状況と整合する。Case #3549 は baseline 自体の更新を契約外として実施せず、棚卸しへ引き継いだ。

## 影響

baseline に残存する旧パスエントリが、今後の配布境界 delta 実行ごとに resolved: 1 として恒常的に計上され続ける。新規是正数と resolved 数の区別が曖昧になると、baseline cleanup の判断材料として不正確な計数が伝播するリスク。

## 課題（backlog-review 向け）

backlog-review（または後続の baseline 棚卸し機会）で、旧パス DEC-003 エントリの baseline からの削除（resolved 確定）を評価する。削除は baseline cleanup に該当するため、実施判断は棚卸し側の正式な処置判断として行う。Case #3549 時点では自動承認しない。

## 既存成果物との関連

- Case #3549（PR #3559）で baseline 更新を契約外として棚卸しへ引継ぐことが合意済み（PR 本文「品質メトリクス（checker 実行記録）」節・「Findings/ Capture候補（intake）」節）
- docs/knowledge/distribution-boundary-diff-normalized-matching.md は配布境界 diff の知識文書であり、本件の baseline cleanup 処置判断とは別物

## 元 intake item（参照）

- .agentdev/intake/inbox/2026-10-08-case-3549-distribution-boundary-baseline-dec003-resolved.md（本 promote 実行で削除）
- https://github.com/yogata/agent-dev-flow/issues/3549
