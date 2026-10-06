# STEP-2 / STEP-3: Root Case 確立と Definition Package 生成（root-case-and-definition-package）


> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-2、STEP-3 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は両 STEP の実行詳細を提供する。

## Purpose

合意済み要件doc から Root Case を GitHub Issue として確立し、壁打ち済み内容を Definition Package として生成して Root Case に関連付ける。

## Input Resolution

1. SSoT 再構成: 要件doc（構造化 `draft-data`。`agreed_items`、`artifact_actions`、`operation_units`、`realization_actions`、`review_dispositions`、`case_open_hints`）
2. identifier 保持: 対象 REQ 番号
3. 最小 scalar: work_type、topic-slug
4. runtime artifact: なし

## Preconditions

- STEP-1 の引き継ぎ判定が通過している
- adversarial-review が完了または skip 済みである（references/adversarial-review-integration.md）

## Procedure

### STEP-2: Root Case 確立

#### extension rules の前置読込（最初の書込みより前）

Root Case 本文候補の生成を含む最初の docs 編集・GitHub 書込みに先立って、project extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`）の rules を読み込む（不在・破損時は `agentdev-project-extensions` の契約に従い標準動作を継続する）。rules の読込を最初の書込みの後段に配置し、投稿後の遡及適用になる配置順序違反を発生させない。extension rules の適用（yomiyasu rule に基づく推敲・lint 等）は各 rule の when 条件に従い、本 STEP 以降の最初の該当書込みの前に適用済みとする。

#### preflight 設定検証（Root Case 確立の preflight）

GitHub Issue/PR を使用するリポジトリ種別のみ実施する。GitHub Issue/PR を使用しないローカル版では本検証をスキップする。

1. 読取専用の repo meta 照会（`gh repo view --json deleteBranchOnMerge` を正規手段）で GitHub repo 設定 deleteBranchOnMerge が true であることを検証する。Custom Tool `agentdev_gh` の操作カタログは拡張しない（読取専用 repo meta 照会はローカル環境確認〔gh auth status と同格〕扱いの bash 実行 Harness 依存。agentdev-gh Local 実装への影響なし）
2. 設定が true でない場合は「設定無効」として警告報告する
3. 照会自体が失敗する場合（gh 認証不良・ネットワーク不調等）は「設定照会不能」として警告報告する
4. 両者を区別した警告として報告し、当該設定理由だけでは case-open を blocked に停止しない。設定照会不能は実操作の安全性の証明ではない。実操作の認証・権限・必要な読取・書込み等の成立を確認できない場合は、既存の安全契約（agentdev_gh の config-uninterpretable fail-closed、実操作失敗時の警告と停止）に従って停止する

Root Case 本文候補の生成は preflight 設定検証の警告報告後に行う（最初の GitHub Issue 作成前に本検証を完了させる。設定理由による blocked 通過条件は撤廃済み）。

1. Root Case 本文候補を生成する。本文は要件doc の合意済み入力を投影し、機能要件、非機能要件、制約、対象外、受け入れ条件を新規に作成しない。テンプレートは `agentdev-workflow-templates` の選定ルールに従う（Root Case 用テンプレート、【必須】セクション完備）
2. Root Case のタイトルは合意済みの対象・目的から主題を生成し、`<workflows/issue-title-policy>` Design（Issue タイトル記述規則）の役割別書式に従う（Root Case は Case 接頭辞書式。書式の具体と主題原則は同 Design を参照し、本手順では複製しない）
3. 実行識別情報セクションを本文へ記録しない（Issue 本文には実行識別情報セクションを設けない。`agentdev-workflow-templates` Design「実行識別情報・検証差分のテンプレートセクション形式」節）
4. `review_dispositions` は本文へ全件転記しない。採用内容（accepted disposition）は本文の該当章（対象範囲、実現方針、完了条件の検証方法）へ反映し、必要な採否理由だけをコメントへ残す
5. 曖昧性が残らず Root Case を確立できる場合にのみ、`agentdev_gh` の issue_create で Root Case を作成する（VERIFY）
6. 検索・整理用ラベル（work_type 等）の付与は任意である。付与義務と起票時の既定付与は設けない（REQ-005-005 の任意付与契約）。構造・役割ラベルの物理写像は Tool 内部の責務であり本手順の対象外である
7. Root Case 確立後の状態は open とし、実装開始を許可しない

### STEP-3: Definition Package 生成と関連付け

1. 要件行（REQ 変更後本文）、Decision、Design、Issue 構成案（`operation_units`、`case_open_hints` 由来）、受入条件一式を Case 単位で集約し Definition Package を生成する
1.5. **artifact_actions 適用前検証**: draft/RU の実測時点と適用時点の間で並行 merge 等により合意入力が陳腐化している可能性があるため、Definition Package の docs への適用（書込み）前に次の3点を検証する。（1）採番衝突検査: REQ 行 ID・Decision 番号の採番（max+1 割当て等）後に、適用時点の現行コーパスとの既存 ID 突合により衝突 0 件を確認する。（2）target 系パス実在検証: `artifact_actions` の target 系パス（target_design 等）の実在とドメイン配置（designs/ 配下の適切なドメインディレクトリ）を確認する。（3）可変メタデータ再実測: frontmatter の `updated` 等の可変メタデータは draft/RU 実測時点の値を引き継がず、適用時点で再実測・確定する。いずれかの検証で差異を検出した場合は適用を中止して要件doc・RU へ差し戻し、非公式の補完を行わない
1.6. **対象セクションの適用直前照合**: append / update を既存文書へ書き込む直前に、組立時に使用した対象セクション・anchor・旧文と適用先の現状を照合する。一致した場合のみ、既存の Definition 保存内部責務（case-ready / case-revise）を通じて適用する。不一致の場合は書込み前に停止し、差異を提示して影響する変更・判断を再確認する。古い本文で新しい編集を上書きしない。見出しは完全一致のみで照合する。正規契約は case-ready Design「Definition 適用直前の対象セクション照合」節が所有し、本手順は新しい適用経路を設けない
2. REQ 行追加を伴う Definition Package 生成時、トレーサビリティポリシー更新の追随要否を確認する。REQ 行の新設・追記を含む場合は、当該行のトレーサビリティポリシー（検証対応を任意とする要件行の明示登録）への追随要否を確認し、必要な policy エントリ追加を Definition Package の構成要素として含める。policy 編集は当該要件行の変更と同一の Definition 変更として扱うため Definition PR 経由以外の適用経路を取らない（直接 main へ適用しない）。policy 登録が不要と判断した場合は、その判断理由を Definition Package 構成案に記録する
3. REQ 行変更（新規行の追加・移管・廃止等）を伴う場合、対象 REQ 行をカバーする Design の ADF-COVERS 宣言（design、implementation 役割）の追随要否を確認する。宣言の追加・更新が必要な場合は Definition Package の構成要素として含める。Definition PR の作成前にトレーサビリティ check（`agentdev-traceability`）で当該 REQ 行の missing-design が 0 件であることを確認する（missing-design 0 件ゲート）
4. 意味変更行の design 対応事前確認: 対象要件行のうち既存行の意味変更を含む場合、`agentdev-traceability` の coverage --req による当該行の design 対応有無の事前確認を実施する。design 対応が欠落する意味変更行を検出した場合は、当該行の design 対応を artifact_actions（artifact: design）へ組込んだ上で合意を完了する。事前確認を省略した Case は case-ready の lifecycle gate completeness（fail-closed）で停止し得る（missing-design 既知債務の範囲で発生余地がある）。missing-design 0 件ゲート（上記3）が増分ベース〔新規行のみ〕であることへの予防手順として位置づける（正規所有は case-open Design「意味変更行の design 対応事前確認」節）
4.5. **traceability 実行手順（coverage/check の役割分担と参照追随の網羅検索）**: トレーサビリティ確認は coverage と check を役割分担に従って併用する。coverage（`--req` は要件行 ID の個別カンマ指定）は advisory な実測確認・欠落特定（design・implementation・verification 対応の有無の実測帰着確認）に用い、check が正規の完全性判定（fail-closed）を担う。check は `--req` で完全性検査の対象行を限定しても形式検査系 findings（malformed-declarations 等）はコーパス全体に対して出力されるため、結果解釈で対象限定の範囲を区別する。REQ 行の廃止・移管を伴う場合の参照追随は、sidecar 全件検索（repository top-level `traceability/` 配下）と inline 宣言（`.agentdev/extensions/skills/*.yaml` の ADF-COVERS 宣言を含む）の網羅検索で実施し、対照実行（変更前後の check 結果の対照）により検出差分の変更起因を分離する。`docs/reports/` 配下は履歴記録領域として corpus 走査対象から除外されており、Report 文書内の REQ 行 ID 参照は対応関係管理対象外である（除外の正規根拠は checker 実行契約 Design「検出対象除外規定」）
5. Issue 構成案に物理削除を伴う docs-chore OU が含まれる場合、当該 OU の対象範囲に extensions、templates 等の実行時設定からの参照を明示的に含める。削除対象の参照先を事前確認し、OU 分割時は他 OU・実行時設定からの参照責務に隙間がないか検査する（原本は `<workflows/references/execution-unit-construction>` Design「docs-chore OUの削除起因参照追随」節。根拠事例: E6-2〔Epic #2984 コメント記録〕、Case #2979）。checkExtensions 等の fan-in 事後検査は維持する
6. `realization_actions` は Definition Package の構成要素として保持する（構造化ハンドオフ: DEC-{N}）。case-open が execution contract を確定しない
6.5. 受け入れ義務の忠実性照合を実施する: 合意済み入力の必須受け入れ義務との照合を下記「受け入れ義務の忠実性照合（STEP-3 実行時）」節の手順で実施する。抑止条件（欠落・縮小・反転の検出）と投影不完全の処置を完了するまで手順 7 へ進まない
7. 生成した Definition Package を Root Case に関連付ける（Definition Package を独立した Issue 本文物項目として生成しない〔Issue Execution Contract REQ 条項、case-open 実行契約 REQ〕。所在は Definition PR と case-ready の canonical 再取得経路から相関する）
8. Definition Package の構成、索引・補助メタデータの具体形式は case-open / case-ready Design の管理下とする

### 受け入れ義務の忠実性照合（STEP-3 実行時）

既存文書を更新する `artifact_actions` は、適用直前に現行原文の対象見出しと旧文を照合する。見出しは完全一致で一意に特定し、旧文の期待件数も一致した場合だけ既存の case-ready / case-revise Definition 保存内部責務で適用する。差異または曖昧性があれば書込みを中止して要件doc・RU へ差し戻し、新しい適用経路を設けない。

正規所有は case-open Design「受け入れ義務保存の投影」節であり、本節は STEP-3 の実行手順を提供する。

1. **照合対象の確定**: 合意済み入力（最新の RU・要件doc）から必須受け入れ義務（目的、対象範囲、禁止、対象外、受け入れ条件、必須検証義務）を列挙する。照合の起点は投影後の成果物ではなく最新の合意済み入力とする
2. **忠実性照合（最新の合意済み入力起点）**: 列挙した各義務について、Definition Package（Root Case 本文候補を含む投影後成果物）の対応する記載を確認する。投影後の成果物だけの自己整合確認（Package 内項目の整合確認）を忠実性確認の代替としない。欠落（義務に対応する記載がない）、縮小（義務の評価範囲・対象範囲が合意済み入力より狭い）、反転（義務と逆の意味の記載）を検出した場合は Root Case の確定・実行へ進まず、Definition Package の構成へ戻して該当箇所を修正する
3. **義務対応の意味保持確認**: 各義務の対応先について、対応先の存在確認に留まらず元の義務の意味、評価範囲、禁止事項が保持されていることを確認する
4. **投影不完全の処置**: どこにも対応しない受け入れ義務を検出した場合は、非該当（not applicable）として扱わず投影不完全として処置する。Definition Package の構成へ戻して対応先を追加し、対応先のない義務を残したまま手順 7 以降へ進まない
5. **下流検証基準への確定**: 必要情報と確認根拠を Definition Package へ保持した後、当該成果物を下流の検証基準とする

### 並行 case-open の作業隔離

並行して case-open を実行する場合、Definition 変更作業（branch 作成、ファイル編集）の起点で次の作業隔離手順を実行する。正規所有は case-open Design「並行 case-open の作業隔離規律」節であり、本節は STEP-2 / STEP-3 の実行手順を提供する。

1. **Case 専用 worktree の前置**: Definition 変更作業は Case 専用 worktree（`.worktrees/{N}-definition`）で行う。共有 working tree での Definition 変更作業を行わない
2. **Definition branch の origin/main HEAD からの独立作成**: Definition branch は origin/main HEAD から独立して作成する（`git fetch origin` 後の origin/main HEAD を作成元とする）。兄弟 Case の Definition commit を含むスタック構造を作らない。branch 命名は既存規定に従い、本手順は branch 作成元と作業隔離のみを扱う
3. **1-writer 前提侵害の検知と早期断念**: worktree 内の `git status` 確認により、in-scope 外の書込み混入（worktree 1-writer 前提の侵害）を検知した場合は直ちに停止する（早期断念）。検知した書込みを Definition 変更に含めない

## Result

- Root Case GitHub Issue 作成済み（対象 REQ 番号埋め込み、状態 open）
- Definition Package 生成済み、Root Case 関連付け済み
- 受け入れ義務の忠実性照合結果（欠落・縮小・反転の有無、投影不完全の有無と処置）

## Evidence

- Root Case Issue 番号、本文生成根拠、Definition Package の構成要素と関連付け状態
- 受け入れ義務の忠実性照合の実行証跡（照合対象の義務列挙、最新の合意済み入力起点の照合結果、検出時は抑止と構成差し戻し・投影不完全処置の記録）

## Completion Verification

- GitHub Issue/PR を使用するリポジトリ種別では、preflight 設定検証が実施済みであり（設定無効・設定照会不能時は区別した警告が報告済みであり、設定理由だけでは後続処理を停止していないこと。実操作の安全性確認不能時は既存の安全契約に従って停止済みであること）、ローカル版ではスキップされていること
- 最初の docs 編集・GitHub 書込み（Root Case 本文候補の生成を含む）の前に extension rules の前置読込が実施されていること
- Definition Package の docs 適用前に artifact_actions 適用前検証（採番衝突検査・target 系パス実在検証・可変メタデータ再実測）が実施され、差異検出時は適用中止と要件doc・RU への差し戻しが行われていること
- append / update の書込み直前に、組立時の対象セクション・anchor・旧文と適用先の現状が照合され、一致時のみ既存の Definition 保存内部責務で適用されていること。不一致時は書込み前に停止し、差異を提示して影響する判断を再確認していること
- Root Case 本文に対象 REQ 番号が埋め込まれていること
- Definition Package が Root Case に関連付けられ、構成要素が揃っていること
- REQ 行追加を伴う場合はトレーサビリティポリシー追随要否の確認（必要エントリの Definition 包含、または不要判断の記録）が行われていること
- REQ 行変更を伴う場合は Design の ADF-COVERS 宣言追随要否の確認（必要な宣言の Definition 包含）が行われていること
- 既存行の意味変更を含む場合は、coverage --req による design 対応有無の事前確認が実施され、design 対応が欠落する意味変更行の artifact_actions（artifact: design）への組込み（または欠落行なしの確認記録）が行われていること
- 物理削除を伴う docs-chore OU を含む場合は、当該 OU の対象範囲への実行時設定参照の明示包含が確認されていること
- 受け入れ義務の忠実性照合が投影後成果物の自己整合ではなく最新の合意済み入力起点で実施されていること。欠落・縮小・反転検出時に Root Case の確定・実行を抑止して構成へ戻した記録があること。対応先のない義務が投影不完全として処置され（非該当扱いではなく）、下流検証基準の確定まで完了していること
- 並行 case-open 実行時に、Definition 変更作業が Case 専用 worktree かつ origin/main HEAD 起点の独立 branch で行われ、1-writer 侵害の検知手順が実行されていること
- 状態が open であり実装開始が許可されていないこと

## Resume-Idempotency

- 再実行時は冪等キーで既存 Root Case を検出し再利用する（STEP-5）。2件目の Root Case を作成しない

## resume point

- preflight 設定検証の実施状態（GitHub Issue/PR 使用リポジトリ種別。警告報告済みの再確認時は再照会する）
- Root Case Issue 番号と作成状態、Definition Package の生成・関連付け状態

## 関連 STEP

- 前: STEP-1（handoff）
- 次: STEP-4 / STEP-5（definition-pr-and-idempotency）
