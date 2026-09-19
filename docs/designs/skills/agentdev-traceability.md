---
title: agentdev-traceability Design
status: accepted
created: "2026-08-21"
updated: "2026-09-17"
---

<!-- ADF-COVERS(design): REQ-012-027, REQ-012-028, REQ-012-033, REQ-012-042, REQ-012-045, REQ-012-047, REQ-012-048, REQ-012-051, REQ-012-054, REQ-012-055 -->
<!-- ADF-COVERS(implementation): REQ-012-030, REQ-012-043, REQ-012-044, REQ-012-045, REQ-012-046, REQ-012-047, REQ-012-048, REQ-012-049, REQ-012-050, REQ-012-051 -->
<!-- ADF-COVERS(implementation): REQ-057-030 -->

## 目的

標準配布スキル `agentdev-traceability` は、ADF v4 Traceability モデル（foundations/v4-traceability-model.md）に基づき、要件と成果物の明示的な対応関係について coverage、impact、check の3能力を提供する。
正規成果物を直接走査し、対応関係をその場で解決する（REQ-012、DEC-017。前身機能の廃止と移行の経緯は DEC-017 が記録する）。

## 適用対象

**USE FOR**: coverage、impact、check の実行、sidecar と policy.yaml の読み込みと正規化、inline declaration の解析と検査、sidecar の作成・更新手順と検証スコープポリシーの利用手順の提供
**DO NOT USE FOR**: 一般文書探索、任意経路探索、構造診断、依存関係探索、派生索引の生成・鮮度管理、対応関係の意味推定

## 対応関係データの取得と正規化

- 対応関係データの正規情報源は、リポジトリ top-level `traceability/` 配下の component / package 単位 sidecar（`traceability/<component-slug>.yaml`）と検証スコープポリシー（`traceability/policy.yaml`）、および producer-only artifact に許容された inline declaration とする
- sidecar と policy.yaml の schema は ADF v4 Traceability モデル（foundations/v4-traceability-model.md）が所有する。本 skill は sidecar を読み込み、component、artifact パス、role、要件行 ID の組を論理的な対応関係へ正規化する。本 skill は ADF 自身の個別 REQ と個別成果物との対応データを保持しない
- inline declaration は `ADF-COVERS(<role>): <REQ-ID>{, <REQ-ID>}*` 形式（role は decision / design / implementation / verification、REQ-ID は `REQ-{NNNN}-{MMM}` 形式の要件行ID）とし、producer-only artifact の各ファイル種別のコメント記法（Markdown は HTML コメント、TypeScript は `//` 等）の内部に1行で記述する。マーカー文字列 `ADF-COVERS(...)` 自体はファイル種別に依存しない。consumer distribution closure（src/opencode/**）に含まれる成果物では使用しない
- sidecar と inline declaration は同一の論理的な対応関係へ正規化され、coverage、impact、check から同一に扱われる。同一論理関係の不整合な重複は check が検出する
- 解析は行単位のパターン照合で行い、意味推定を行わない。存在しない要件IDへの参照は check が検出する
- 解析対象は正規宣言位置（ファイル種別のコメント記法内部の宣言行、および `traceability/` 配下の YAML）に限定する。本文 prose（見出し・段落・箇条書き等の本文テキスト）内の宣言マーカー形状の言及は、正規宣言位置の文字列一致対象から除外する（説明文コンテキスト対象外判定）。対象外判定は真の malformed 宣言（正規位置にあるが形式不備の宣言）の検出を縮退させない
- 宣言の REQ-ID は子要件行 ID（`REQ-{NNNN}-{MMM}` 形式）で指定する。親要件 ID のみの参照（子行番号を伴わない bare ID）は対応宣言の配置対象とならず、check は bare ID 参照を欠落報告の計上対象とし得るため、参照側は子行 ID の個別指定運用をとる
- sidecar の作成・更新は case-run（実装対応・検証対応）と Design 確定工程（Design 対応）が担う。本 skill は sidecar の作成・更新方法と検証スコープポリシーの利用方法、要件・Design・実装・検証変更時の対応関係更新手順、check 結果の解釈を利用知識として提供する
- 実行記録・docs 本文では宣言マーカー形状を例示しない。形状の言及が必要な文脈では、解析で宣言と解釈されない一般化表現（パターン名・契約名での記述）を使う。この規則は表現回避の運用規則であり、正規宣言の削除・変更を要求しない

## 公開能力

### coverage

- 要件起点: 対応する Decision、Design 文書、実装成果物、検証手段を役割付きで返す
- 成果物起点: 当該成果物が対応する要件を返す
- 明示された対応関係を全件返し、候補数上限、ランキング、探索深度によって黙って切り捨てない
- 役割付き出力の解釈は呼出側の責務であり、coverage 側で役割毎の絞り込みを行わない。coverage を配布物の ADF-COVERS 除去可否判定（cleanup 突合）における集約済み実装対応の認定根拠として使用しない。配布対象成果物の対応関係は sidecar のみに保持され、配布物本体に対応宣言は存在しないため、cleanup 突合の判定根拠は配布物本文の producer 側 metadata 0件突合へ置き換わる（integrity/distribution-boundary.md 参照）

### impact

- 要件起点: 当該要件へ明示的に対応する成果物を変更時の再確認候補として返す
- 成果物起点: 当該成果物が対応する要件を経由して、同じ要件へ対応する他成果物を再確認候補として返す
- 成果物 ↔ 要件 ↔ 成果物の範囲を超えて探索しない（任意深度のグラフ探索を行わない）
- 空結果を「影響なし」の証明として扱わない。空結果である旨を明示して返す

### check

次を決定的に検査する。
検査結果は項目ごとに pass / fail（欠落種別、対象要件、対象成果物付き）で返す。

- 不正な対応関係記述（sidecar および inline declaration の形式・構文違反）
- 未知の成果物役割（decision / design / implementation / verification 以外の role）
- 存在しない要件行への参照（sidecar、inline declaration、policy.yaml の optional 列挙を含む）
- 存在しない、または取得不能な artifact path（sidecar 参照先のファイル不在・読取不能を含む）
- Design 対応の欠落（現行要件行で0件。全現行要件行が計上対象）
- 実装対応の欠落（現行要件行で0件。全現行要件行が計上対象）
- 検証対応の欠落（検証スコープポリシーが required と判定する現行要件行で0件。Decision 対応の欠落は計上しない）
- 検証スコープポリシーの不正（`traceability/policy.yaml` の schema 違反、default 値不正、optional 列挙の要件行 ID 形式違反、存在しない要件行の列挙、policy 読取不能）
- 同一論理関係の不整合な重複（同一 artifact パス × role × 要件行 ID の組み合わせが sidecar と inline declaration の間、または同一情報源内で矛盾する状態）

検証スコープポリシーは `traceability/policy.yaml` から解決する。
policy.yaml が存在しない場合、全現行要件行を検証対応 required として扱う（未指定 = required の安全側既定）。
policy.yaml が読取不能または schema 不適合の場合、検証対応の要否判定を不能として当該検査を不合格にする（完全性判定不能を合格として扱わない）。
Decision 対応の欠落は不合格としない。

## advisory 能力と品質ゲートとしての check の境界

- coverage と impact は補助的・advisory な能力であり、対応関係と変更影響の確認を支援する
- coverage / impact を補助情報として利用する工程では、当該機能の不在または実行失敗のみを理由に workflow を恒常停止させず、独立した正規成果物確認へ fallback できる（fail-open）
- workflow が対応完全性を完了条件として要求する時点（case-ready の ready 遷移条件、case-close の最終完全性検査）では、check が正常に完全性判定できていない状態（実行不能、読取不能、判定不能）を pass として扱わない（fail-closed）
- 「対応関係が完全である」と「完全性を検査できなかった」を区別して返す

## 実装構成

- 標準実装は `traceability/` 配下の sidecar・policy.yaml と、正規成果物（docs/requirements/、docs/designs/、実装・検証成果物）を直接走査する。`.agentdev/graph/` 等の派生 Graph を必須入力・必須生成物としない
- sidecar および policy.yaml の読み込みは決定的な YAML 解析で行い、schema 不適合・未知キーを黙って読み飛ばさない（checker 実行契約 Design の宣言的データの silent skip 禁止と同一規定）
- 将来、直接走査が実運用上の問題として観測された場合、coverage、impact、check の外部契約を変えずにキャッシュまたは索引を追加できる構造とする
- OpenFastTrace、Eclipse Capra、専用グラフDBを標準実行依存として導入しない

## 対象外

- ワークフロー統合の工程割り当て（REQ-021、各 command Design）
- 性能の数値基準（受け入れ基準を設けない）

## v4 責務分類

ADF v4 の責務分類（正典: DEC-036、foundations/v4-responsibility-boundaries Design）における本 Design の 3 区分（semantic 担当 / deterministic 委譲先 / 知識提供）。分類の正本は Root Case #3011 の分類語彙表であり、本節はその確定値を記録する。

- **semantic 担当**: 0 件（対応解釈は知識提供）
- **deterministic 委譲先**: traceability extraction / evidence aggregation / validation → scripts/src/check.ts・coverage.ts・impact.ts + lib
- **知識提供**: coverage/impact/check の解釈
