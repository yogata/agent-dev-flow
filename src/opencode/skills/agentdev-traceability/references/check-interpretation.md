# check 結果の解釈と coverage / impact の利用方法

本 reference は、check の9検出項目の finding の読み方と解消手順、および coverage / impact の利用方法と結果の読み方を提供する。
検査契約の正本は producer 側リポジトリの `agentdev-traceability` Design と ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）が所有する。本 reference は正本を参照して使うための解釈手順を記述し、規範の独立定義を行わない。

## check の実行と出力の読み方

check は `src/check.ts` を `--root <repo-root>` 付きで実行する。出力は次の構造を持つ JSON である。

- `checks`: 検査項目（`kind`）ごとに `status`（`pass` / `fail`）と `findings` を返す
- `summary`: pass / fail の件数
- 終了コード: 検査 fail ありは 2、実行エラーは 1

読み方の原則:

- findings は項目ごとに欠落種別、対象要件行 ID、対象成果物パス、理由を伴う。対象が特定できない汎用エラーとしては報告しない
- `--req` で完全性検査（missing 系）の対象を限定できる。対象行は1つずつ列挙する（`..` 範囲構文は展開されない）
- 実行不能・読取不能・判定不能の状態を合格として扱わない（fail-closed）。対応完全性を完了条件とする工程では、check が「完全性を検査できなかった」状態と「対応関係が完全である」状態を区別して扱う

## 9検出項目の finding 解釈

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

補足:

- Decision 対応の欠落はどの検出項目にも計上されない（対応完全性規則の任意役割）。Decision の有無を理由に対応関係を追加・修正する必要はない
- 検証スコープポリシーが存在しない場合、全現行要件行が `missing-verification` の計上対象になる（安全側既定）。これは検査の誤動作ではなく規定の挙動である。任意行として扱いたい要件行は policy へ明示登録する
- findings の解消は対応関係データの修正のみで行い、要件そのものや検査基準を改変しない

## completeness の 2 層解釈（lifecycle gate と corpus）

missing 系検出項目（`missing-design` / `missing-implementation` / `missing-verification`）の完全性は、ADF v4 Traceability モデル Design（v4-traceability-model、docs/designs/<foundations/v4-traceability-model>.md）「completeness の 2 層」節の定義に従い、次の2層で解釈する。

| 層 | 対象 scope | 判定性格 | 運用 |
|---|---|---|---|
| lifecycle gate completeness | 対象要件行 scope（当該 Case の対象要件行） | fail-closed | case-ready のトレーサビリティ完全性ゲート、case-close の QG-4 が対象要件行の design 対応・implementation 対応・verification 対応（policy が required と判定する行）の欠落を不合格とする |
| corpus completeness | corpus 全体（全現行要件行） | advisory・fail-open | missing 系の計数を診断指標として数値追跡する。corpus の到達目標状態の診断に用い、lifecycle gate の判定には使用しない |

- 完全性規則を規定する要件行群は corpus の到達目標状態を定め、lifecycle gate での判定対象（対象要件行 scope）はワークフロー統合側の要件行群が所有する。この区分の正は v4-traceability-model Design「解釈 clause」節を参照する
- corpus 債務方針: v4 移行期間の corpus 計数（missing-design・missing-implementation の既知債務）は診断指標として数値追跡し、是正評価は full validation（第13段）で行う。corpus 計数は lifecycle gate を阻害しない（v4-traceability-model Design「corpus 債務方針」節）
- check を `--root` 指定のみで実行した場合の missing 系計数は corpus completeness（corpus 全体）の診断指標である。lifecycle gate の完全性判定は `--req` で対象要件行へ限定した実行で導出する（fail-closed）

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
