# source_file 型への一律 role: index 宣言は定義所在ファイルを到達点から除外する粗い宣言

## 観測

`.agentdev/artifact-graph.yaml` の self-hosting augmentation で source_file 型へ一律 `role: index` を宣言した結果、README 等の索引・集約成果物がファイル層にのみ存在する本リポジトリ構造では、定義所在ファイル（REQ-020.md 等）のノードも対象となり、defined_in 依存の到達点が dependency 結果から除外される。ファイル単位の細分宣言は将来の改善候補（差分文書 §2.2 に記録）。

## 今回扱わない理由

PR 2262（Issue 2204）は semantics.ts の TIM 語彙カタログ定義への置換と標準候補数上限 12 の決定がスコープ。索引役割宣言の細分化は本決定の前提（増幅抑制を役割宣言で担保する運用）を維持した上での後続改善。

## 影響

dependency プロファイルの問い合わせ結果で、定義所在ファイル（REQ ファイル等）が候補から除外される。現行の代表ケース回帰では必須候補欠落なしと確認済み（PR 2262 検証結果）。

## レビューで決めること

- ファイル単位の細分宣言（node_type_roles の粒度変更、またはパス条件つき役割宣言）の要否
- 細分化する場合の宣言様式（TIM 語彙カタログ SPEC「索引・集約成果物の役割識別」節の拡張を伴うか）

## 根拠

- PR 2262 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2262）
