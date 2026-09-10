<!-- ADF-COVERS(implementation): REQ-053-023 -->
# STEP-5: Decision 状態評価・Issue 作成（Epic flow / Standard flow、issue-creation-flows）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-5 詳細である。
> Decision 状態評価（STEP-5-0）と、Epic flow（STEP-5-1〜5-5）・Standard flow（STEP-5-6〜5-8）の制御、GitHub Issue 作成手続きを提供する。

## Purpose

STEP-5-0 で関連 proposed Decision の受理評価（accepted 遷移または HITL/開始阻止）を完了させた後、Epic flow（STEP-5-1〜5-5）または Standard flow（STEP-5-6〜5-8）の制御に従い GitHub Issue を作成し、OU 結果を書き戻す。

## Input Resolution

1. SSoT 再構成: execution structure、Issue 本文候補、対象 REQ 群、関連Decision（Decision frontmatter `related_reqs` 宣言を正規情報源とする。`docs/decisions/README.md` の関連 REQ 索引は補助参照）
2. identifier 保持: `{epic_number}`、子Issue 番号、OU ID
3. 最小 scalar: 子Issue 並列数（最大5件）
4. runtime artifact: Issue 本文候補ファイル

## Preconditions

- STEP-3 で execution structure が確定している
- STEP-4 で adversarial-review skip または review 完了（unresolved なし）
- STEP-5-0 で Decision 状態評価が完了している（評価対象 0 件確認、または全評価対象の受理評価完了。停止条件該当時は STEP-5-0 内で停止し、以降の手順へ進まない）

## Result

- Decision 状態評価の完了（評価対象 0 件確認の記録、または accepted 遷移 + 承認記録追記、または HITL 判断確定）
- GitHub Issue 作成済み（親Epic + 子Issue群、または Standard Issue）
- OU 結果の書き戻し（`operation_units` の `result` フィールド）

## Procedure

実行ルート（Epic flow / Standard flow）は STEP-3 の execution structure による。
STEP-5-0 はルート非依存の共通前置工程であり、各 flow の手順より前に 1 回実行する。

### STEP-5-0: Decision 状態評価（Issue 作成前工程）

Standard flow、Epic flow、混在構成の全ルートで、最初の GitHub Issue 作成呼び出しの前に 1 回実行する。
Epic flow では Epic Issue 作成前に、構成確定後の全対象 REQ 群を評価対象とする（混在構成では Epic Issue 作成が最初の Issue 作成呼び出しであるため、全対象 REQ 群の評価をその前に完了させる）。

#### 評価対象の特定

1. 当該 Case の対象 REQ を特定する（Issue 構成の入力である要件doc / REQ ファイルから導出）
2. `docs/decisions/DEC-*.md` の全 Decision の frontmatter `related_reqs` から、対象 REQ を含む宣言を持つ Decision を列挙する。`docs/decisions/README.md` の関連 REQ 索引（AUTOGEN `decision-related-req-table`）は補助参照であり、列挙の正は frontmatter 宣言とする
3. 列挙のうち frontmatter `status` が `proposed` のものを評価対象とする（`accepted` / `superseded` / `deprecated` は対象外。再実行時に既に accepted へ遷移済みの Decision はこの限定により自動的に除外される）。評価対象 0 件の場合は 0 件確認を評価記録へ記録し、既存フローを継続する（エラー停止しない）
4. 関連の特定は本手順（正規情報源）のみを用いる。本文の意味・文字列類似・周辺参照等の意味推測で補完しない。特定の過程で Decision の `related_reqs` フィールド欠落、または解釈不能な宣言（REQ 識別子（REQ-{NNNN}）形式外の値等）に遭遇した場合は意味推測で補完せず、フィールド整備（宣言付与）を促す停止理由として報告し、Case を開始しない。related_reqs 宣言を持たない対象 REQ は関連 Decision なしとして扱う（欠落検出の対象は、宣言を持たない REQ 参照ではなく、frontmatter フィールド自体の欠落・形式不正である）

本手順（手順1〜4）の特定結果は、STEP-2 の関連 Decision 拘束条件の特定と反映（execution contract 確定ステップ）および STEP-5-6（Standard flow「関連Decision特定」）で再利用し、重複特定を行わない。

#### 受理評価と遷移

各評価対象について、req-define での合意内容（要件doc の Decision 判断記録）と現行の REQ・Design・実装の状態を照合し、受理可否が一意に確定できるか判定する。
判定境界は HITL 移送条件の共通原則（一意に確定できる事項は自律処理、判断材料不足・未解決矛盾等の HITL 移送条件該当事項のみユーザー判断へ）および workflow-contracts Design の HITL 移送条件一覧に従う。共通原則の正規所有は docs 配下の委譲時判断・承認・副作用境界 REQ である。

- **一意確定できる場合**: 既存ライフサイクル規則（proposed → accepted）に従い、frontmatter `status` を `accepted` へ変更し、本文末尾に「## 承認記録」セクションを patterns.md Design「承認記録セクション形式（正規所有）」節の正規形式で追記してから、Case 作成を継続する。形式の具体文言（日付、status 遷移、承認根拠を含む1文形式）は同節を正とし、本 reference では複製しない。ファイル操作の安全手続きは `agentdev-decision-file-manager` に従う
- **一意に確定できない場合**: ユーザー判断を求める（HITL）。ユーザー判断で受理が確定した場合は承認の旨を承認根拠として遷移する
- **受理不能または判断情報不足の場合**: proposed のまま変更せず、Case を開始せず停止し、停止理由を報告する

#### 評価記録

評価記録には、評価対象の Decision 識別子、照合した合意内容と現行 REQ・Design・実装の状態、一意確定 / 非確定の分岐とその根拠、遷移結果（accepted 遷移 + 承認記録追記の完了、HITL 判断確定、または停止理由）を記録する。判定記録から一意確定と非確定の分岐を再構成できることを完了条件とする。

#### 冪等（再実行時）

- 再実行時、手順3の proposed 限定により既に accepted へ遷移済みの Decision は評価対象から除外される。重複する状態遷移、重複する承認記録セクションを生成しない

#### 完了条件

- 評価対象 0 件確認の記録、または全評価対象の受理評価完了（accepted 遷移 + 承認記録追記済み、または HITL 判断確定済み）のいずれかであること。未解決の評価対象が残る状態で後続手順（最初の GitHub Issue 作成）へ進まない

## Epic flow（STEP-5-1〜5-5、`scale: large` またはマルチREQ または複数 OU）

### STEP-5-1: テンプレート読込

`agentdev-workflow-templates` の選定ルールに従いテンプレートを読み込む。
詳細は `agentdev-issue-management` を参照。
Epic flow は STEP-3 のルーティングにより開始。
マルチREQ/ 単一REQ の差分（分解ソース、Wave テーブル列、子Issue 数上限、子Issue 内容ソース、子Issue 追加要素）の詳細は `agentdev-epic-tracker` を参照。

### STEP-5-2: Epic Issue 本文生成

STEP-3 の自律構成分析結果に基づき Epic 本文を構築。
詳細、委譲接続点は `agentdev-issue-management` を参照。

### STEP-5-3: Epic Issue 作成

ラベル `enhancement`, `feature`, `epic`。
`agentdev_gh` の issue_create 操作で本文を書き込み → VERIFY。
呼出は `agentdev-issue-management` の標準呼出形式手順（本文・タイトルの二重引用符回避、labels 引数の明示）に従う。
Issue 番号を `{epic_number}` として記録。
実行識別情報セクションの自己参照値（`adf_case`）は、作成済み Epic 本文のステータス追跡テーブル更新（STEP-5-5）と同一の Issue 本文更新手続きで確定番号へ埋め戻す。

### STEP-5-4: 子Issue 作成（並列化）

- **Issue 化単位**: OU 単位（command 不変条件）
- **子Issue 本文**: `Parent: #{epic_number}`（command 不変条件）、対象 OU ID、紐づく REQ/Decision/Design 識別子を記載
- **並列化**: 子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化（3つの「5件」文脈のうち case-run Wave 内子 Issue 並列上限と同一、後述）
- **作成後埋め戻しは不要**: 子Issue の実行識別情報セクションは作成時に確定する（`adf_case` は親 Epic Issue 番号を記録、`adf_execution_unit` は flow 種別のみを記録し、対象 Issue 番号は本子 Issue の番号を正として導出する）
- **直列集約**: Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は親が直列集約（command 不変条件: 全子Issue 作成完了後の一括更新で維持）
- **前工程完了度属性の埋め込み**: 各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（3段階: 完全完了/ 検証のみ/ 補完あり、epic-wave-model Design extension 経由）

詳細、委譲接続点は `agentdev-issue-management` を参照。

### STEP-5-5: Epic Issue 本文更新

詳細、委譲接続点は `agentdev-issue-management` を参照。
本 STEP の Issue 本文更新で、Epic 本文実行識別情報セクションの自己参照値（`adf_case`）を STEP-5-3 で確定した Epic Issue 番号へ埋め戻す。

#### STEP-5-5-1: OU 結果の書き戻し

`operation_units` セクションがある場合、作成した Issue/Epic 番号を当該 OU の `result` に書き戻す。

**Epic flow 完了後、共通終了処理（STEP-6 termination-and-cleanup）を必ず実行すること。**

## Standard flow（STEP-5-6〜5-8、`scale: standard` またはフィールドなし、単一 OU）

### STEP-5-6: 関連Decision特定

STEP-5-0「評価対象の特定」の結果（Decision frontmatter `related_reqs` による正規情報源特定の結果）を再利用し、重複特定を行わない。単一REQ Epic flow の内容反映にも活用する。

### STEP-5-7: ラベル付与

`agentdev-workflow-lifecycle` に従う。

### STEP-5-8: GitHub Issue 作成

`agentdev_gh` の issue_create 操作→ VERIFY。呼出は `agentdev-issue-management` の標準呼出形式手順（本文・タイトルの二重引用符回避、labels 引数の明示）に従う。
作成後、`agentdev_gh` の issue_update 操作で実行識別情報セクションの自己参照値（`adf_case`）を作成確定番号へ埋め戻し、VERIFY する（STEP-2 の 2-7 参照）。

#### STEP-5-8-1: OU 結果の書き戻し

`operation_units` セクションがある場合、作成した Issue 番号を当該 OU の `result` に書き戻す。

## 並列上限と3つの「5件」文脈

case-open、case-auto、case-run で参照される「5件」上限は文脈ごとに区別される（epic-wave-model Design「並列上限と停止条件の整理」セクション参照）。

| 文脈 | 上限 | 説明 |
|---|---|---|
| (1) case-run Wave 内子 Issue 並列 | 5件 | 同一 Wave 内 case-run サブエージェント並列起動上限 |
| (2) case-auto Phase 2 同時起動数 | 5件 | Phase 分離モデルにおける case-run bg task 同時起動数 |
| (3) execution_unit 全体並列 | 上限なし | 必須依存がない execution_unit 群は全て並列実行可能 |

case-open の STEP-5-4「子 Issue 作成の並列化」は **(1) に該当**。
3文脈は別なので混同しない。

## Evidence

- Decision 状態評価の評価記録（評価対象、判定根拠（合意内容と現行状態の照合結果）、遷移結果。停止時は停止理由）、作成済み Issue 番号（Epic、子Issue 群、Standard）、`agentdev_gh` 操作結果（読み戻し検証済み）、OU 結果書き戻し状態、実行識別情報セクション自己参照値の埋め戻し状態

## Completion Verification

- STEP-5-0 の完了条件（評価対象 0 件確認の記録、または全評価対象の受理評価完了）を満たしていること。遷移対象の Decision は frontmatter `status` が `accepted` であり、承認記録セクションが追記済みであること。全ての Issue 作成で VERIFY 合格済みであること。子Issue 本文の先頭行に `Parent: #{epic_number}` があること。全子Issue 作成完了後に Epic 本文ステータス追跡テーブルを更新していること（部分更新でないこと）。実行識別情報セクションの自己参照値が全て確定番号へ埋め戻されていること

## Resume-Idempotency

- Issue 番号（durable state）で作成済みを判定し、未作成分のみ作成する。Epic 本文更新は直列集約（単一書き手）で再実行冪等
- Decision 状態評価は frontmatter `status`（durable state）で再実行済みを判定し、既に accepted の Decision を評価対象から除外する。重複する状態遷移・承認記録を生成しない

## resume point

- 親Epic Issue 番号（`{epic_number}`）
- 子Issue 作成状態（作成済み数 / 残数、各 Issue 番号、実行識別情報自己参照値の埋め戻し状態）
- Wave 1 配置状態、Epic 本文ステータス追跡テーブル更新状態
- Standard Issue 番号、OU 結果書き戻し状態、実行識別情報自己参照値の埋め戻し状態
- Decision 状態評価の完了状態（評価対象 0 件確認記録、または評価対象ごとの受理評価結果と遷移・承認記録追記状態）

## 関連 STEP

- 前: STEP-4（adversarial-review-integration）
- 次: STEP-6（termination-and-cleanup）

## 関連 Capability Skill

- `agentdev-issue-management`: Issue 操作の安全手続き、委譲接続点
- `agentdev-decision-file-manager`: Decision frontmatter `status` 変更（proposed → accepted）、承認記録セクション追記の安全手続き、存在確認
- `agentdev-epic-tracker`: Epic 本文、Wave 構成、子Issue 上限
- Custom Tool `agentdev_gh`: Issue 作成（VERIFY は Tool 内部）
- `agentdev-workflow-templates`: テンプレート選定
- `agentdev-workflow-lifecycle`: ラベル付与

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（Standard flow の動作、出力形式は Epic flow 追加による影響を受けない）
- 不変条件（子Issue 本文の先頭行に `Parent: #{epic_number}` を必ず含める）
- 不変条件（全子Issue の作成完了後に Epic 本文のステータス追跡テーブルを更新、部分更新禁止）
- 不変条件（成果物本文 verbatim、LF・空行・インデント保持）
- ガードレール（Issue 本文は `agentdev_gh` の操作引数で渡す。実装詳細は Tool 内部、`POL-gh-io-delegation`）
