# STEP-6/7/9/10/11: 要件doc生成・判定・保存・確認・報告（draft-generation）

> 本 reference は `agentdev-workflow-req-define` SKILL.md の STEP-6、STEP-7、STEP-9、STEP-10、STEP-11 詳細である。
> 要件doc（draft-data）生成、work_type・Scale 判定、ドラフト保存、要件doc確認、完了報告を提供する。
> STEP-8（adversarial-review）は [references/adversarial-review-integration.md](adversarial-review-integration.md) 参照。

## 目次

- STEP-6: 要件doc生成
- STEP-7: work_type・Scale 判定
- STEP-9: ドラフト保存
- STEP-10: 要件doc確認
- STEP-11: 完了報告

## STEP-6: 要件doc生成

### Purpose

構造化 `draft-data` 形式で要件doc本文を生成する。

### Input Resolution

1. SSoT 再構成: テンプレート `.opencode/commands/agentdev/templates/req-define/req-draft.md`（Read）
2. identifier 保持: `new:{topic-slug}`、RU-ID
3. 最小 scalar: なし
4. runtime artifact: draft-data 下書き（STEP-2〜5 の確定内容）

### Preconditions

- STEP-5 の Decision判断が完了している

### Procedure

テンプレートを Read し、構造化 `draft-data` 形式に従って生成する。
原本は構造化された `# draft-data` fenced YAML block である。
STEP-5 の Decision禁止ゲート・STEP-4 の文書分類妥当性検証で分離した Design 候補は `artifact_actions`（`artifact: design`）として統合し、`## Design候補` 補助セクションは出力しない。
保存対象は単一の `artifact_actions` 配列に統合する。

各副ステップ（定義完全性ゲート QG-1、operation_units 生成、depends_on/recommended_order 定義、artifact_actions 生成、target_area/content 形式、Design action 分類根拠出力、test_strategy 生成、review_dispositions 生成）の詳細、フィールドスキーマ、委譲接続点は `agentdev-req-analysis` の req-define detailed gates、および req-define command Design（extension 経由）の各フィールドスキーマを参照。
`target_design`、`canonical_owner`、`on_failure`、`review_dispositions` の出力形式も同 Design を正とする。

### Result

- 構造化 `draft-data`（`work_type`, `scale`, `summary`, `auto_gate`, `agreed_items`, `artifact_actions`, `conflict_resolutions`, `operation_units`, `test_strategy`, `review_dispositions`, `case_open_hints`）

### Evidence

- 生成済み draft-data、QG-1 検証結果

### Completion Verification

- 必須 fields が揃い、`execution_groups` を含まないこと。Design 候補が `artifact_actions` へ統合済みであること

### Resume-Idempotency

- 生成は冪等である。再実行時は下書きの確定内容から同一構造を再生成する

## STEP-7: work_type・Scale 判定

### Purpose

work_type（4値）と scale（feature のみ）を確定する。

### Input Resolution

1. SSoT 再構成: なし（draft-data 内情報）
2. identifier 保持: なし
3. 最小 scalar: work_type、scale
4. runtime artifact: draft-data

### Preconditions

- STEP-6 で要件docが生成されている

### Procedure

- **work_type 判定**: ラベルに基づき4値分類（bugfix/feature/maintenance/docs_chore）する。bugfix + Decision必要時は feature に昇格する
- **Scale判断（feature のみ）**: `agentdev-workflow-lifecycle` で standard/large を判定する。large 時はユーザーと分解計画を協議する。実装スコープシグナル確認（ドラフト内に修正候補リスト、検出事項カタログ、影響ファイル一覧等の実装詳細セクション存在時に large 昇格判定、昇格理由をユーザー提示）の詳細は `agentdev-workflow-lifecycle` を参照

### Result

- work_type 確定、scale 確定（feature のみ）

### Evidence

- 判定根拠（ラベル、実装スコープシグナル）

### Completion Verification

- work_type が4値のいずれかであり、feature 以外で scale 判定を実施していないこと

### Resume-Idempotency

- 判定のみで副作用を持たない

## STEP-9: ドラフト保存

### Purpose

要件docをドラフトとして `.agentdev/drafts/` へ保存する。

### Input Resolution

1. SSoT 再構成: なし
2. identifier 保持: topic-slug
3. 最小 scalar: なし
4. runtime artifact: draft-data 本文

### Preconditions

- STEP-8 完了（review 反映済み）または skip 判定済み

### Procedure

全 work_type（feature/bugfix/maintenance/docs_chore）で `.agentdev/drafts/req-draft-{topic-slug}.md` に保存する。
STEP-6 の構造化 `draft-data` 形式（`# draft-data` fenced YAML block）で保存する。
標準データモデル fields を保持する。
`workflow_route` は派生値として保存しない。
後続工程の分岐は `artifact_actions` の存在で決定する（`artifact: req`/`adr` → req-save、`artifact: design` → design-save）。
`summary` 等の人間可読セクションは補助的であり下流処理の正として扱われない。

各副ステップ（実装詳細の分離、auto_gate 完了ゲート、未確定内容の auto_ready 抑止）の詳細、stop_reasons 記録形式、代表 fixture、引用誤検知除外パターンは req-define command Design（extension 経由）「未確定内容の auto_ready 抑止」節、および `agentdev-req-analysis` の req-define detailed gates を参照。

### Result

- `.agentdev/drafts/req-draft-{topic-slug}.md` 保存済み

### Evidence

- 保存ファイルパス、`auto_gate` フィールドの値

### Completion Verification

- ファイルが存在し、draft-data 形式として読み戻し可能であること

### Resume-Idempotency

- 同一 topic-slug への再保存は上書きであり冪等。保存済み draft の status は durable state として後続工程（req-save/design-save）が参照する

## STEP-10: 要件doc確認

### Purpose

生成した要件docをユーザーに提示する（承認は求めず提示のみ）。

### Input Resolution

1. SSoT 再構成: 保存済み draft ファイル
2. identifier 保持: topic-slug
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-9 でドラフトが保存されている

### Procedure

生成した要件docをユーザーに提示する（承認は求めず提示のみ）。
差し戻し時は壁打ち継続（STEP-2 へ）。
次コマンド実行を確定の意思表示として扱う。

各副ステップ（複数RU同時入力受付、統合/分離判定、操作単位ごとの出力生成、Epic 規模検出時の記録、Wave 候補/依存関係の記録、OU 構造検証）の詳細、委譲接続点は `agentdev-req-analysis` を参照。
統合/分離判定では生成ドラフト自身の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、req-health-metrics Design（extension 経由）の閾値で SPLIT シグナルを算出して合意内容に反映する（新規 CREATE ドラフトで要件行数が 51 行超の場合は SPLIT 要否をユーザーへ提案）。

### Result

- ユーザー提示済み、差し戻し判定結果

### Evidence

- 提示済み draft、SPLIT シグナル算出結果（該当時）

### Completion Verification

- 提示が完了していること。差し戻し時は STEP-2 へ遷移していること

### Resume-Idempotency

- 提示は読取のみで副作用を持たない

## STEP-11: 完了報告

### Purpose

work_type・scale に応じた種別の完了報告を出力する。

### Input Resolution

1. SSoT 再構成: 保存済み draft
2. identifier 保持: topic-slug
3. 最小 scalar: work_type、scale
4. runtime artifact: なし

### Preconditions

- STEP-10 の提示が完了している

### Procedure

完了報告 template に従って出力する。work_type に応じた種別を選択する:

- feature standard → `.opencode/commands/agentdev/templates/req-define/feature.md`
- feature large (Epic) 規模 → `.opencode/commands/agentdev/templates/req-define/feature-epic.md`
- bugfix/maintenance/docs_chore → `.opencode/commands/agentdev/templates/req-define/lightweight.md`

### Result

- 完了報告出力

### Evidence

- 完了報告本文（種別、draft パス）

### Completion Verification

- 選択種別が work_type・scale と一致していること

### Resume-Idempotency

- 報告のみで副作用を持たない

## 関連 STEP

- 前: STEP-5（requirement-development.md）、STEP-8（adversarial-review-integration.md）
- 次: なし（workflow 終了。後続は req-save / design-save / case-open）

## 関連 Capability Skill

- `agentdev-req-analysis`: detailed gates、SPLIT シグナル算出
- `agentdev-workflow-lifecycle`: work_type・Scale 判定

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（`.agentdev/drafts/**` のみ作成・編集許可）
- 不変条件（チェックボックスは測可能で一意）
- 不変条件（要件doc構造は req-draft.md テンプレート準拠）
- 不変条件（work_type 判定参照、Issue 階層非決定、operation_units 出力）
