---
title: agentdev-traceability Design
status: draft
created: "2026-08-21"
updated: "2026-08-21"
---

## 目的

標準配布スキル `agentdev-traceability` は、最小 TIM（foundations/traceability-model.md）に基づき、要件と成果物の明示的な対応関係について coverage、impact、check の3能力を提供する。正規成果物を直接走査し、対応関係をその場で解決する。旧 `agentdev-artifact-graph` の後継であり、旧公開APIとの互換層を持たない（REQ-012、DEC-017）。

## 適用対象

**USE FOR**: coverage、impact、check の実行、対応宣言の解析と検査
**DO NOT USE FOR**: 一般文書探索、任意経路探索、構造診断、依存関係探索、派生索引の生成・鮮度管理、対応関係の意味推定

## 対応宣言の表記（正規情報源）

- 対応宣言は対応する成果物自身が保持し、中央台帳（traceability.yaml 等）を新設しない
- 宣言形式: `ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*`（role は design / implementation / verification、REQ-ID は `REQ-{NNNN}-{MMM}` 形式の要件行ID）
- 宣言は各ファイル種別のコメント記法（Markdown は HTML コメント、TypeScript は `//` 等）の内部に1行で記述する。マーカー文字列 `ADF-COVERS(...)` 自体はファイル種別に依存しない
- 1ファイルに複数の宣言行を含められる。解析結果は和集合とする
- 解析は行単位のパターン照合で行い、意味推定を行わない。存在しない要件IDへの参照は check が検出する

## 公開能力

### coverage

- 要件起点: 対応する Design 文書、実装成果物、検証手段を役割付きで返す
- 成果物起点: 当該成果物が対応する要件を返す
- 明示された対応関係を全件返し、候補数上限、ランキング、探索深度によって黙って切り捨てない

### impact

- 要件起点: 当該要件へ明示的に対応する成果物を変更時の再確認候補として返す
- 成果物起点: 当該成果物が対応する要件を経由して、同じ要件へ対応する他成果物を再確認候補として返す
- 成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索しない（任意深度のグラフ探索を行わない）
- 空結果を「影響なし」の証明として扱わない。空結果である旨を明示して返す

### check

次を決定的に検査する。検査結果は項目ごとに pass / fail（欠落種別、対象要件、対象成果物付き）で返す。

- 不正な対応宣言（形式・構文違反）
- 未知の成果物役割
- 存在しない要件への参照
- 実装対応の欠落（現行要件で0件）
- 検証対応の欠落（現行要件で0件）
- 対応宣言の根拠箇所を取得できない状態（ファイル不在・読取不能）

## 実装構成

- 標準実装は正規成果物（docs/requirements/、docs/designs/、実装・検証成果物）を直接走査する。`.agentdev/graph/` 等の派生 Graph を必須入力・必須生成物としない
- 現行 Artifact Graph のファイル探索、Markdown 解析、要件ID解決、存在確認等の実装資産は、本 Design に適合する場合のみ再利用する（graph 生成、鮮度管理、拡張機構は再利用しない）
- 将来、直接走査が実運用上の問題として観測された場合、coverage、impact、check の外部契約を変えずにキャッシュまたは索引を追加できる構造とする
- OpenFastTrace、Eclipse Capra、専用グラフDBを標準実行依存として導入しない

## 対象外

- 旧公開API（neighbors、path、provenance、related、dependency、implementation、diagnostics）の互換層
- ワークフロー統合の工程割り当て（REQ-021、各 command Design）
- 性能の数値基準（受け入れ基準を設けない）
