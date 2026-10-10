# check 結果の解釈と coverage / impact / links / inventory / reuse の利用方法

本 reference は、check の11検出項目の finding の読み方と解消手順、および coverage / impact / links / inventory / reuse の利用方法と結果の読み方を提供する。
検査契約の正本は producer 側リポジトリの `agentdev-traceability` Design と ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）が所有する。本 reference は正本を参照して使うための解釈手順を記述し、規範の独立定義を行わない。

## check の実行と出力の読み方

check は `src/check.ts` を `--root <repo-root>` 付きで実行する。出力は次の構造を持つ JSON である。

- `checks`: 検査項目（`kind`）ごとに `status`（`pass` / `fail`）と `findings` を返す
- `summary`: pass / fail の件数
- `structuralOnly`: 常に `true`。check は構造検査（対応関係の存在と参照整合）のみを担い、check の pass は要求内容の充足（意味的品質）の証明ではない。check 合格を完了判定へ直結させない
- 終了コード: 検査 fail ありは 2、実行エラーは 1

読み方の原則:

- findings は項目ごとに欠落種別、対象要件行 ID、対象成果物パス、理由を伴う。対象が特定できない汎用エラーとしては報告しない
- `--req` で完全性検査（missing 系）の対象を限定できる。対象行は1つずつ列挙する（`..` 範囲構文は展開されない）
- 実行不能・読取不能・判定不能の状態を合格として扱わない（fail-closed）。対応完全性を完了条件とする工程では、check が「完全性を検査できなかった」状態と「対応関係が完全である」状態を区別して扱う

## 11検出項目の finding 解釈

| kind | 意味 | 主な原因と解消手順 |
|---|---|---|
| `malformed-declarations` | sidecar または inline declaration の形式・構文違反 | 宣言行・YAML を正規形式へ修正する。形式の正本は ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）と `agentdev-traceability` Design |
| `unknown-roles` | decision / design / implementation / verification 以外の role | role キーを4種のいずれかへ修正する |
| `unknown-req-refs` | 存在しない要件行 ID への参照（sidecar、inline declaration、policy.yaml の optional 列挙を含む） | 要件行 ID の誤記を修正する。参照先が廃止済み要件行の場合は後継要件行へ対応付け替える、または対応関係を削除する |
| `invalid-artifact-paths` | 存在しない、または取得不能な artifact path（sidecar 参照先のファイル不在・読取不能を含む） | sidecar のパスを成果物の現行リポジトリ相対パスへ更新する。成果物を削除した場合は対応関係ごと整理する |
| `missing-design` | Design 対応の欠落（現行要件行で0件） | 該当要件行を実現する現在の設計へ Design 対応を追加する。Design 確定工程（Definition 保存）で成立させる（Design 対応0件のまま実装着手しない） |
| `missing-implementation` | 実装対応の欠落（現行要件行で0件） | 該当要件行を実際に実現する永続成果物へ実装対応を sidecar（または producer-only artifact の inline declaration）へ追加する |
| `missing-verification` | 検証対応の欠落（検証スコープポリシーが required と判定する現行要件行のみ計上） | 恒続的な検証手段を用意し検証対応を追加する。恒続的に検証可能な対象を持たない行のみ、検証スコープポリシー（`traceability/policy.yaml`）の `optional` へ明示登録する |
| `policy-invalid` | 検証スコープポリシーの不正（schema 違反、default 値不正、optional 列挙の要件行 ID 形式違反、存在しない要件行の列挙、policy 読取不能） | `traceability/policy.yaml` を正規 schema へ修正する。policy の不正は検証対応の要否判定全体を不能にするため、他の missing 系判定の前に解消する |
| `duplicate-inconsistencies` | 同一 artifact パス × role × 要件行 ID の組み合わせが sidecar と inline declaration の間、または同一情報源内で矛盾する状態 | 保持したい保存方式へ統一する（sidecar と inline の重複の整理、または同一情報源内の矛盾の解消）。移行中の矛盾は移行完了時に解消する |
| `malformed-links` | 隣接工程間対応の宣言形式・構文違反（inline 宣言の形式不備・不明方向、sidecar links セクションの schema 不正） | 宣言行・sidecar links セクションを正規形式へ修正する。書式は本スキル SKILL.md「links 宣言」節と references/sidecar-and-policy.md。方向は upstream（下流→上流）のみ許容する |
| `dangling-links` | links の source / target 参照先の不存在 | 参照先パスを成果物の現行リポジトリ相対パスへ更新する。成果物を削除した場合は links 対応ごと整理する。参照先が採用されていない参照例の成果物である場合は links 対応を削除してよい |

補足:

- Decision 対応の欠落はどの検出項目にも計上されない（対応完全性規則の任意役割）。Decision の有無を理由に対応関係を追加・修正する必要はない
- 検証スコープポリシーが存在しない場合、全現行要件行が `missing-verification` の計上対象になる（安全側既定）。これは検査の誤動作ではなく規定の挙動である。任意行として扱いたい要件行は policy へ明示登録する
- findings の解消は対応関係データの修正のみで行い、要件そのものや検査基準を改変しない

## --req 限定実行時の検出結果計上性格判定（3段判定）

check を `--req` で対象要件行へ限定した実行では、検出された finding の計上性格を次の3段で判定する。3段判定は、限定実行の結果を対象要件行の判定（lifecycle gate 判定）と corpus 既存状態へ正しく振り分けるための運用手順であり、check の検出条件・判定・計上自体を変更しない。

| 段 | 判定内容 | 扱い方 |
|---|---|---|
| 1. 対象帰属 | finding の reqId が `--req` で指定した対象要件行集合に含まれる（対象行の missing 系欠落、対象行に関係する宣言不備・重複等） | 対象要件行への計上として扱う。lifecycle gate 判定の対象であり、fail-closed で処理する（対象範囲内で解消するか blocked まで維持） |
| 2. 対象外既出 | finding が対象要件行集合外の既存状態に由来する（対象外要件行の既知債務、対象外パスの既存不備等）。限定実行の走査範囲で観測された既出の検出 | 対象要件行への計上としない。既出として検証記録に残し、是正は所管の Case または corpus 債務方針（本 reference「completeness の 2 層解釈」参照）で扱う。対象要件行の判定を不合格にしない |
| 3. 検査不能 | 実行不能・読取不能・前提崩れ（`--root` の解決失敗、policy 読取不能、検査対象の見かけ上の全件欠落等） | 計上性格の判定以前に完全性判定不能である。合格として扱わない（fail-closed）。実行前提を修正して再実行する |

判定手順:

1. finding に reqId が付与されている場合、その reqId が `--req` 対象集合に含まれるかを確認する。含まれれば段1、含まれなければ段2
2. 検査自体が成立していない形跡（実行エラー、policy 読取不能、検査対象の見かけ上の全件欠落）がある場合は段1・段2の判定を行わず段3として扱う
3. 段判定の結果は、段と判定根拠を伴って検証記録へ残す

## completeness の 2 層解釈（lifecycle gate と corpus）

missing 系検出項目（`missing-design` / `missing-implementation` / `missing-verification`）の完全性は、ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）「completeness の 2 層」節の定義に従い、次の2層で解釈する。

| 層 | 対象 scope | 判定性格 | 運用 |
|---|---|---|---|
| lifecycle gate completeness | 対象要件行 scope（当該 Case の対象要件行） | fail-closed | case-ready のトレーサビリティ完全性ゲート、case-close の QG-4 が対象要件行の design 対応・implementation 対応・verification 対応（policy が required と判定する行）の欠落を不合格とする |
| corpus completeness | corpus 全体（全現行要件行） | advisory・fail-open | missing 系の計数を診断指標として数値追跡する。corpus の到達目標状態の診断に用い、lifecycle gate の判定には使用しない |

- 完全性規則を規定する要件行群は corpus の到達目標状態を定め、lifecycle gate での判定対象（対象要件行 scope）はワークフロー統合側の要件行群が所有する。この区分の正は v4-traceability-model Design「解釈 clause」節を参照する
- corpus 債務方針: v4 移行期間の corpus 計数（missing-design・missing-implementation の既知債務）は診断指標として数値追跡し、是正評価は full validation（第13段）で行う。corpus 計数は lifecycle gate を阻害しない（v4-traceability-model Design「corpus 債務方針」節）
- check を `--root` 指定のみで実行した場合の missing 系計数は corpus completeness（corpus 全体）の診断指標である。lifecycle gate の完全性判定は `--req` で対象要件行へ限定した実行で導出する（fail-closed）

## inline 宣言の役割タグと coverage 役割解釈の関係

成果物本文に埋め込まれる inline 宣言の役割タグ（design、implementation、verification の役割名を丸括弧で付与した宣言形式）は、coverage / check の4役割（decision / design / implementation / verification）と対応して解釈される。

- **役割タグ → 役割の対応**: design 役割タグ付き inline 宣言は design 役割の対応関係、implementation 役割タグ付きは implementation 役割、verification 役割タグ付きは verification 役割として coverage の役割付き対応関係に帰属する。coverage `--req` の出力（`relations`、`counts`）では、inline 宣言由来の対応はこの役割で分類されて返る
- **decision 役割に対応するタグは inline 宣言に通常存在しない**: Decision 対応は対応完全性規則の任意役割であり、Decision 文書からの対応付けは sidecar 側の `decision` セクションまたは Design 文書内の Decision 参照から解釈される（inline タグの欠如は decision 対応の欠落を意味しない。Decision 対応はどの検出項目にも計上されない）
- **coverage 実装の役割解釈仕様は現状正**: 本節は現行 coverage 実装の解釈を説明するものであり、実装仕様の変更を要求しない。coverage は advisory・fail-open であり、対応完全性の完了条件判定は check の責務（本reference「completeness の 2 層解釈」節）
- **タグ形式の正本**: inline 宣言の書式と配置規約の正は ADF v4 Traceability モデル Design（v4-traceability-model）と `agentdev-traceability` Design である。形式違反は check の `malformed-declarations` として検出される

## coverage の利用方法

coverage は対応する対応関係を問い合わせる能力であり、補助的（advisory）な能力として fail-open で運用する。

- 要件起点: `--req REQ-{NNNN}-{MMM}` で、対応する Decision、Design 文書、実装成果物、検証手段を役割付きで全件返す。候補数上限、ランキング、探索深度による切り捨ては行わない
- 成果物起点: `--artifact <path>` で、当該成果物が対応する要件を返す（逆引き）
- 出力の読み方: `relations` が役割付き対応関係の全件、`counts` が役割別件数。成果物起点で対応が無い場合は `emptyResult: true` を伴う
- 空結果の解釈: 要件起点の空結果は「対応関係が未整備であること」を示す。実装・検証が行われていないことの証明ではない
- 機能の不在・実行失敗時に workflow を恒常停止させず、正規成果物の直接読取等の独立した確認へ fallback する（fail-open）。coverage を対応完全性の完了条件の判定根拠に使わない（完全性判定は check の責務）

## impact の利用方法

impact は変更時の再確認候補を提示する能力であり、coverage と同様に advisory で fail-open である。

- 要件起点: `--req REQ-{NNNN}-{MMM}` で、当該要件へ明示的に対応する成果物を再確認候補として返す
- 成果物起点: `--artifact <path>` で、当該成果物が対応する要件を経由して、同じ要件へ対応する他成果物を再確認候補として返す
- 探索範囲は成果物 ↔ 要件 ↔ 成果物（固定2ホップ）であり、任意深度のグラフ探索を行わない
- 出力の読み方: 成果物起点では `viaRequirements`（経由要件）と `recheckCandidates`（再確認候補）を返す
- 空結果は「影響なし」の証明として扱わない。空結果である旨（`emptyResult: true` と note）を明示して受け取り、判断は呼出側の工程が行う

## links の利用方法

links は採用された隣接工程間対応の双方向追跡であり、advisory で fail-open である。

- `--artifact <path>` で、当該成果物の `upstream`（宣言そのまま・下流→上流）と `downstream`（逆引き・上流→下流）を固定 1 ホップで返す。任意深度のグラフ探索を行わない
- 空結果は「隣接工程が存在しない」ことの証明ではない。links 宣言の不在は採用されていない詳細工程への対応を強制せず、check の不合格にも計上しない
- 出力の読み方: `upstream` / `downstream` が相手側の成果物パスと宣言種別（`origin`）の列挙、`emptyResult` が双方向とも空である旨の明示
- links 対応は covers の対応完全性の代替にならない。links で追跡をグループ化しても、グループ内の個別に有効な要求・受け入れ条件の covers 計上と検証義務は消えない

## inventory の利用方法

inventory は正規成果物の棚卸しと宣言外候補の発見であり、advisory で fail-open である。

- `--root` のみで実行し、直接走査で発見した実在成果物（`corpusArtifacts`）と、covers・links いずれの宣言にも現れない実在成果物の発見候補（`discoveredCandidates`）を返す
- 発見候補を対応関係の欠落と誤判定しない。採用されていない参照例の成果物・対応不要の成果物を含み得る。棚卸しの結果は候補提供であり、対応関係の作成・修正の最終判断は各工程が行う
- 出力の読み方: `declaredArtifacts` が covers 宣言に現れる artifact 集合、`linkedArtifacts` が links 宣言に現れる source / target 集合。`note` に解釈の注意が常に付く
- 棚卸しの結果を対応完全性の合格条件にしない（完全性判定は check の責務）

## reuse の利用方法

reuse は変更前の証拠を再利用する場合の構造的適用可否確認であり、構造検査のみを担い、適用可否を合格判定しない。

- `--evidence <path>` で証拠成果物の存在・読取可能性、証拠自身の対応関係（`declaredRelations`）、links の双方向（`upstreamArtifacts` / `downstreamArtifacts`）を列挙する。`--revision` で証拠の版識別子を結果に記録できる（解決・比較は行わない）
- `manualConfirmation` に構造検査で解決しない確認事項（版の適合、条件の適合）を返す。これらの確認を経ない証拠再利用を変更反映完了の根拠にしない
- 実装上の局所試験（構造検査・局所テスト等）に合格しても、対象の受け入れ条件に関する最終的な実証が不足する場合は完了と判定しない。最終受入は現在有効な条件から必要な検証を各工程が独立に評価する
- 出力の読み方: `structuralStatus` が `confirmed` の場合は対象が存在し宣言関係を列挙した状態を示す（適用可否の合格ではない）。`evidence-not-found` の場合は証拠そのものが現在の走査対象に存在しない
