---
title: ADF v4 Traceability モデル（Change / Evidence 中心）
status: accepted
created: 2026-09-18
updated: "2026-10-09"
---

<!-- ADF-COVERS(design): REQ-012-026, REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042, REQ-012-054, REQ-012-052, REQ-012-053, REQ-012-056, REQ-012-057, REQ-012-058, REQ-012-059, REQ-002-048 -->
<!-- ADF-COVERS(implementation): REQ-012-027, REQ-012-028, REQ-012-029, REQ-012-030, REQ-012-031, REQ-012-032, REQ-012-033, REQ-012-034, REQ-012-035, REQ-012-036, REQ-012-037, REQ-012-038, REQ-012-039, REQ-012-040, REQ-012-041, REQ-012-042 -->
<!-- ADF-COVERS(design): REQ-106-001, REQ-106-002, REQ-106-003, REQ-106-004, REQ-106-005, REQ-106-006, REQ-106-007, REQ-106-008, REQ-106-009, REQ-107-001, REQ-107-002, REQ-107-003, REQ-107-004, REQ-107-005, REQ-107-006, REQ-107-007, REQ-107-008 -->
<!-- ADF-COVERS(implementation): REQ-106-001, REQ-106-002, REQ-106-003, REQ-106-004, REQ-106-005, REQ-106-006, REQ-106-007, REQ-106-008, REQ-106-009, REQ-107-001, REQ-107-002, REQ-107-003, REQ-107-004, REQ-107-005, REQ-107-006, REQ-107-007, REQ-107-008（v5 変更影響・追跡品質検証の設計・構成実体は本 Design 本文の v5 語義更新節が所有する） -->

# ADF v4 Traceability モデル（Change / Evidence 中心）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。あわせて本 Design は REQ-107（ADF v5 工程間追跡と品質検証の責務分離）と DEC-054（ADF v5 追跡・品質検証モデル）に基づく v5 追跡語義（標準関係、設計根拠対応の条件付き化、構造検査と意味品質検証の分離）を、v4 語義の搬送範囲とともに所有する。

本 Design は DEC-037（Traceability の Change / Evidence 中心への再中心化）の Design 実体である。DEC-037 の標準関係構造（covers 単独の標準コア関係）は DEC-054 が covers と採用された隣接工程間対応へ拡張した。モデル要素、完全性規則、保存方式、直接走査、用語政策の所有対応は吸収節に定める。

## 4 問いへの回答能力

Traceability の主目的は次の 4 問いに答えられることである。

- この要求は何によって設計・実装されているか
- 今回の Change はどの要求・判断・設計へ影響したか
- acceptance・requirement を何の Evidence で満たしたか
- 変更時に再検証すべき関連範囲は何か

全 artifact の恒久的完全グラフ維持だけを目的としない。

### 4 問い × 能力写像

4 問いに対して、標準能力（coverage、impact、check）のどの組合せが答えるかを写像する。

| 問い | 標準能力 | 合成レシピ区分 | 判定性格 |
|---|---|---|---|
| Q1: 要求の設計・実装根拠 | coverage（要件起点） | 単一能力 | check の判定項目（fail-closed） |
| Q2: Change の影響範囲 | coverage（成果物起点逆引き）と impact の合成 | 合成レシピ。成果物と要件と成果物の固定 2 ホップで構成し、それを超えて探索しない（REQ-012-046） | advisory。結果は over-approximation（影響候補の上乗せ列挙）であり、空結果を影響なしの証明として扱わない |
| Q3: acceptance・requirement の Evidence | coverage（verification 役割）と Evidence ソースの接続 | 単一能力と識別子結合 | 検証手段の対応は本モデル、実行結果は Issue / PR / QG が所有する（Evidence 第一級の位置づけ節） |
| Q4: 再検証すべき関連範囲 | impact（固定 2 ホップ） | 単一能力 | advisory（fail-open） |

- Q2 と Q4 の impact は Decision 対応を含む範囲で解決する。Decision 列は decision 対応が存在する範囲で advisory として含める（REQ-012-036。Decision 対応の欠落は不合格としない）
- Change 起点の単一問い合わせ契約（Change の指定を起点に Q2 から Q4 を一括回答する契約）は現時点で存在しない。後続段階の未解決事項として明記する

### 判定性格の定義

| 判定性格 | 定義 | 実行不能・違反時の扱い |
|---|---|---|
| fail-closed | 判定の実行不能を合格として扱わない契約 | 不合格または停止とする（REQ-012-056） |
| fail-open | 実行不能を処理の妨げにしない契約 | 検出不能の旨を報告して継続する |
| advisory | 結果に強制力を持たない助言 | 採否は判断者が決める。空結果を証明として扱わない |

## 標準関係の構造（v5 語義）

本 Design が扱う標準関係は、covers 対応関係と、プロジェクトの採用した工程に基づく隣接工程間の対応関係である（REQ-012-027、REQ-107-001）。

- **covers 対応関係**: 成果物が要件へ明示的に対応する対応関係。decision / design / implementation / verification の 4 役割を持つ
- **採用された隣接工程間対応**: プロジェクトの採用した隣接工程の成果物・追跡単位を明示的に関連付ける対応関係。上流と下流を双方向に追跡できる（REQ-107-001）。宣言と保存は採用規約機構（v5-adopted-conventions Design「宣言と保存」節）が所有し、物理形式は REQ-107 適用範囲の対象外とする。機械解決の実装面は後続の実装 Design が所有する

標準関係の境界は次の 2 条である。

- 採用された隣接工程間対応は有界な標準関係である。多数の関係型の持ち込み（REQ-012-039）や汎用の関係拡張機構の新設（REQ-012-040）に該当しない
- すべての成果物に要件との重複した直接対応を必須とせず、採用された隣接工程間対応で追跡できる（REQ-107-002）。実装・検証の要件側直接対応の義務（実装成果物 1 件以上、検証対応必須行の検証手段 1 件以上）は REQ-012-032 が維持する。存在しない詳細工程への対応を強制しない。未採用の参照例の工程を判定基準に含めない点は、v5-adopted-conventions Design「未採用参照例を欠落と誤判定しない判定規則」節に従う

## 永続情報と導出可能情報の分離

v4 の意味モデルから永続すべき関係（Change の Evidence・impact、要求実現関係）と導出可能な関係を分離する基準。現行 sidecar/policy/checker 形式を前提とせず、DEC-030 機構のうち拡張して搬送する範囲と再導出する範囲の判定。

- Case/Change の Evidence と impact を第一級とする
- DEC-030 の sidecar/policy/producer-consumer 機構は、永続情報として価値がある範囲で拡張して搬送する（機構の廃止ではなく、中心の移動と必要永続情報/導出可能情報の分離）

### 永続・導出分離判定結果

| 区分 | 対象 | 根拠 |
|---|---|---|
| 永続 | covers 対応関係（decision / design / implementation / verification の 4 役割）と採用された隣接工程間の対応関係 | 要件実現関係と採用された隣接工程間の追跡関係は Change をまたいで恒常的に参照される（REQ-012-027、REQ-012-028、REQ-107-001） |
| 永続 | トレーサビリティポリシー（traceability/policy.yaml の検証対応要否） | 検証対応要否は宣言であるため導出できない（REQ-012-051） |
| 導出 | 影響範囲（impact の実行結果） | 正規成果物の直接走査からその場で再計算できる（REQ-012-048） |
| 導出 | Evidence 実行結果（Issue / PR / QG の記録） | Issue / PR / QG が所有し、DEC-038 の durable state 配置に従う（REQ-021-019） |
| 導出 | corpus 集計値（missing-design、missing-implementation 等の計数） | 宣言からの集計で再現できる診断指標である（completeness の 2 層節） |

## DEC-030 機構の搬送範囲

DEC-030（トレーサビリティ標準機能への一般化と producer / consumer 境界の確立）の機構上の決定は、次の範囲で本 Design が搬送する。この表は DEC-037 relations の reason が述べる維持範囲の正である。

| DEC-030 機構 | 処遇 | 本 Design での扱い |
|---|---|---|
| sidecar / policy スキーマ（component / package 単位、最小データ構成） | 搬送 | 前提を解除して判定した結果、現行形式を搬送する。スキーマ詳細の正は skills/agentdev-traceability.md（REQ-012-053） |
| 直接走査（派生索引不採用） | 搬送 | 正規成果物の直接走査で対応関係をその場で解決する（DEC-017 決定2 の維持。REQ-012-048） |
| coverage / impact / check の 3 能力 | 搬送 | 標準公開能力は変更しない（REQ-012-044）。4 問い × 能力写像表に従う |
| fail-closed と fail-open の境界 | 搬送 | check は fail-closed、coverage と impact は advisory・fail-open で運用する（REQ-012-056） |
| producer / consumer 境界（inline は producer 側のみ、配布閉包純度） | 搬送 | REQ-012-054 と REQ-029 の現行契約を維持する |
| global completeness 規則（全要件行の対応完全性） | 2 層化として再定義 | completeness の 2 層節へ移管する（DEC-017 決定4 の移行完了条件は履行済みの履歴） |

## completeness の 2 層

global completeness の位置づけ（診断・影響分析の必要性から completeness を再設計する方針）を 2 層に分解する。

| 層 | 対象 scope | 判定性格 | 運用 |
|---|---|---|---|
| lifecycle gate completeness | 対象要件行 scope（当該 Case の対象要件行） | fail-closed（case-ready のトレーサビリティ完全性ゲート、case-close の QG-4） | 対象要件行の設計根拠対応（プロジェクトの採用した工程・成果物規約が要求するもの。独立 Design 文書を必須とする採用の場合は Design 対応）、implementation 対応、検証対応（policy が required と判定する行）の欠落を不合格とする（REQ-021-018、REQ-021-024、REQ-021-025） |
| corpus completeness | corpus 全体（全現行要件行） | advisory・fail-open（診断指標の数値追跡） | 計数を v4 移行期間の既知債務として追跡し、到達目標状態の診断に使う。lifecycle gate の判定に使用しない |

### 解釈 clause

REQ-012-029（実装対応）、REQ-012-030（検証対応・policy が required と判定する行）、REQ-012-031（設計根拠対応）は corpus の到達目標状態を規定する要件行である。lifecycle gate での判定対象（対象要件行 scope）は REQ-021-018、REQ-021-024、REQ-021-025 が所有する。REQ-012-031 は、プロジェクトの採用した工程・成果物規約が認める適切な成果物から設計内容と根拠を確認できることを規定し、独立した Design 文書の存在を一律の必須条件としない。Design 対応の欠落計上は、採用規約が独立 Design 文書を必須とする採用の場合に限る。現行の移行期デフォルト（REQ-105-008。本リポジトリの現に実効している運用は独立 Design 文書を要求する）では、全現行要件行が計上対象として解決される。REQ 行の文言変更を伴う再定義は REQ-107 定義適用（REQ-012-027/031/032/047、REQ-021-018/024/025 等の行 ID 不変再定義）として完了済みである。

### corpus 債務方針

missing-design 942 件と missing-implementation 111 件（2026-09-19 時点の baseline @54c0fde3）は v4 移行期間の既知債務である。missing-design の計上は、採用規約が独立 Design 文書を必須とする採用の場合の Design 対応欠落として語義づけられる（解釈 clause 参照）。corpus 値の是正は第13段 full validation で評価し、lifecycle gate を阻害しない。corpus 計数の増減は診断指標として追跡する。

## Evidence 第一級の位置づけ

- Evidence の定義は v4-quality-gate-model（Quality 5 概念分解の Evidence）が所有する。本 Design は定義を重複させず、検証手段と Evidence ソース（Issue / PR / QG）の関係と識別子結合のみを記述する
- 検証手段はトレーサビリティ（verification 役割の対応関係）が扱い、実行結果は Issue / PR / QG が扱う。特定時点の検証結果を対応関係として保存しない（REQ-021-019）
- Q3 への回答は、verification 役割の coverage と Evidence ソースの識別子結合の合成で行う
- 識別子結合は、検証手段の対応関係（REQ 行 ID と verification 役割）と実行結果の記録（Issue 番号、PR 番号、Gate 実行記録）を結び付ける。結合の永続化は Issue / PR / QG 側が担う

## 構造検査と意味品質検証の分離

本 Design が扱う構造検査（check、対応関係の存在と参照整合の検査）と、要求内容の充足を確認する意味的品質検証は、別の責務である（REQ-107-004、REQ-107-005、DEC-054）。

- check の pass は、対応関係の構造整合（関係の存在、参照先の解決、宣言形式の妥当性）に関する判定である。対応関係の存在だけで、要求内容の充足（意味的品質）を合格としない
- トレーサビリティ機構に恒久的な意味品質検証ゲートを追加しない（DEC-054）。意味的品質検証は各工程の内容確認と最終受入（REQ-107-007）が別責務として所有する
- 見出しや説明節の存在だけで孤立設計事項として一律に不合格としない（REQ-107-005）。設計根拠対応の判定は採用規約が要求する成果物の成立に基づき、文書内の見出しや説明節の存在を機械的な合格条件・不合格条件にしない
- 追跡関係の粒度（グループ化、範囲宣言）によって、グループ内の個別に有効な要求・受け入れ条件の検証義務を消さない（REQ-107-006）。check の計上と lifecycle gate の判定は子要件行単位を維持する

## 用語

- TIM（最小トレーサビリティモデル）は、v4 Traceability モデルの要求実現関係部分（covers 対応関係、採用された隣接工程間対応、4 役割、対応完全性規則）の旧設計名称である。単なる旧称ではなく、本 Design の要求実現関係部分を指す包摂型の用語橋である。既存文書の TIM 語は本 Design の当該部分を読むものとして解釈する。TIM の標準コア関係の語義は REQ-107 定義適用に伴い、covers 単独から covers と採用された隣接工程間対応（標準関係の構造節）へ更新済みである
- 日本語本文の正式用語は「対応関係」「対応付け」を用いる（DEC-017 決定5 の維持、REQ-012-042）。coverage / covers は機械識別子または外部標準との対応説明に限定する

## traceability-model.md からの吸収節

本節は次の規定の所有対応を定める。規定の再掲は行わない。

| 承継対象 | 承継先 |
|---|---|
| モデル要素（要件行、covers、4 役割の対応関係） | 本 Design の要求実現関係部分（用語節の TIM 定義）と REQ-012 |
| 対応関係の完全性規則 | 本 Design の completeness の 2 層節 |
| 保存方式（sidecar と inline、同一論理対応関係への正規化） | REQ-012-053、REQ-012-054 と skills/agentdev-traceability.md |
| 直接走査（派生索引不採用） | 本 Design の DEC-030 機構の搬送範囲表 |
| 用語政策（「対応関係」「対応付け」） | 本 Design の用語節 |
| 工程割当（req-define から case-close までの利用、作成、検査の割当） | REQ-021 と各 command Design が所有する。本 Design は再掲しない |

## 関係

- 本 Design は DEC-037 の Design 実体である。DEC-037 の標準関係構造（covers 単独の標準コア関係）は DEC-054 が covers と採用された隣接工程間対応へ拡張した（部分置換）。拡張後の語義は本 Design の標準関係の構造節が所有する
- foundations/traceability-model.md は crosswalk 第7段の実行（物理削除）をもって権威を本 Design へ移行する。移行までの間は両 Design の要求実現関係部分の宣言が重複する（移行期間の許容状態）
