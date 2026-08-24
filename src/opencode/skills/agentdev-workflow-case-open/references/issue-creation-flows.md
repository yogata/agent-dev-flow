# STEP-5: Issue 作成（Epic flow / Standard flow、issue-creation-flows）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-5 詳細である。
> Epic flow（STEP-5-1〜5-5）と Standard flow（STEP-5-6〜5-8）の制御、GitHub Issue 作成手続きを提供する。

## Purpose

Epic flow（STEP-5-1〜5-5）または Standard flow（STEP-5-6〜5-8）の制御に従い GitHub Issue を作成し、OU 結果を書き戻す。

## Input Resolution

1. SSoT 再構成: execution structure、Issue 本文候補、関連Decision（`docs/decisions<README>.md`）
2. identifier 保持: `{epic_number}`、子Issue 番号、OU ID
3. 最小 scalar: 子Issue 並列数（最大5件）
4. runtime artifact: Issue 本文候補ファイル

## Preconditions

- STEP-3 で execution structure が確定している
- STEP-4 で adversarial-review skip または review 完了（unresolved なし）

## Result

- GitHub Issue 作成済み（親Epic + 子Issue群、または Standard Issue）
- OU 結果の書き戻し（`operation_units` の `result` フィールド）

## Procedure

実行ルート（Epic flow / Standard flow）は STEP-3 の execution structure による。
各 flow の手順は以下のとおり。

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
Issue 作成手続き（`agentdev-gh-cli`）で本文を書き込み → VERIFY。
Issue 番号を `{epic_number}` として記録。
実行識別情報セクションの自己参照値（`adf_case`、`adf_execution_unit` の `epic:#N`）は、作成済み Epic 本文のステータス追跡テーブル更新（STEP-5-5）と同一の Issue 本文更新手続きで確定番号へ埋め戻す。

### STEP-5-4: 子Issue 作成（並列化）

- **Issue 化単位**: OU 単位（command 不変条件）
- **子Issue 本文**: `Parent: #{epic_number}`（command 不変条件）、対象 OU ID、紐づく REQ/Decision/Design 識別子を記載
- **並列化**: 子Issue 本文案作成、検査、Issue 作成は最大5件まで並列化（3つの「5件」文脈のうち case-run Wave 内子 Issue 並列上限と同一、後述）
- **作成後埋め戻し**: 各子Issue の作成後、Issue 本文更新手続き（`agentdev-gh-cli`）で実行識別情報セクションの自己参照値（`adf_execution_unit` の `standard:#N`）を作成確定番号へ埋め戻し、VERIFY する（`adf_case` は親 Epic Issue 番号で作成時に記録済み）
- **直列集約**: Epic Issue 作成、Wave 1 配置、Epic 本文ステータス追跡テーブル更新は親が直列集約（command 不変条件: 全子Issue 作成完了後の一括更新で維持）
- **前工程完了度属性の埋め込み**: 各子 Issue 本文の「## 補足情報」セクションに「前工程完了度」属性を埋め込む（3段階: 完全完了/ 検証のみ/ 補完あり、epic-wave-model Design extension 経由）

詳細、委譲接続点は `agentdev-issue-management` を参照。

### STEP-5-5: Epic Issue 本文更新

詳細、委譲接続点は `agentdev-issue-management` を参照。
本 STEP の Issue 本文更新で、Epic 本文実行識別情報セクションの自己参照値（`adf_case`、`adf_execution_unit`）を STEP-5-3 で確定した Epic Issue 番号へ埋め戻す。

#### STEP-5-5-1: OU 結果の書き戻し

`operation_units` セクションがある場合、作成した Issue/Epic 番号を当該 OU の `result` に書き戻す。

**Epic flow 完了後、共通終了処理（STEP-6 termination-and-cleanup）を必ず実行すること。**

## Standard flow（STEP-5-6〜5-8、`scale: standard` またはフィールドなし、単一 OU）

### STEP-5-6: 関連Decision特定

`docs/decisions<README>.md` から、単一REQ Epic flow の内容反映にも活用。

### STEP-5-7: ラベル付与

`agentdev-workflow-lifecycle` に従う。

### STEP-5-8: GitHub Issue 作成

Issue 作成手続き（`agentdev-gh-cli`）→ VERIFY。
作成後、Issue 本文更新手続き（`agentdev-gh-cli`）で実行識別情報セクションの自己参照値（`adf_case`、`adf_execution_unit` の `standard:#N`）を作成確定番号へ埋め戻し、VERIFY する（STEP-2 の 2-7 参照）。

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

- 作成済み Issue 番号（Epic、子Issue 群、Standard）、`agentdev-gh-cli` VERIFY 結果、OU 結果書き戻し状態、実行識別情報セクション自己参照値の埋め戻し状態

## Completion Verification

- 全ての Issue 作成で VERIFY 合格済みであること。子Issue 本文の先頭行に `Parent: #{epic_number}` があること。全子Issue 作成完了後に Epic 本文ステータス追跡テーブルを更新していること（部分更新でないこと）。実行識別情報セクションの自己参照値が全て確定番号へ埋め戻されていること

## Resume-Idempotency

- Issue 番号（durable state）で作成済みを判定し、未作成分のみ作成する。Epic 本文更新は直列集約（単一書き手）で再実行冪等

## resume point

- 親Epic Issue 番号（`{epic_number}`）
- 子Issue 作成状態（作成済み数 / 残数、各 Issue 番号、実行識別情報自己参照値の埋め戻し状態）
- Wave 1 配置状態、Epic 本文ステータス追跡テーブル更新状態
- Standard Issue 番号、OU 結果書き戻し状態、実行識別情報自己参照値の埋め戻し状態

## 関連 STEP

- 前: STEP-4（adversarial-review-integration）
- 次: STEP-6（termination-and-cleanup）

## 関連 Capability Skill

- `agentdev-issue-management`: Issue 操作の安全手続き、委譲接続点
- `agentdev-epic-tracker`: Epic 本文、Wave 構成、子Issue 上限
- `agentdev-gh-cli`: Issue 作成・VERIFY
- `agentdev-workflow-templates`: テンプレート選定
- `agentdev-workflow-lifecycle`: ラベル付与

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（Standard flow の動作、出力形式は Epic flow 追加による影響を受けない）
- 不変条件（子Issue 本文の先頭行に `Parent: #{epic_number}` を必ず含める）
- 不変条件（全子Issue の作成完了後に Epic 本文のステータス追跡テーブルを更新、部分更新禁止）
- 不変条件（成果物本文 verbatim、LF・空行・インデント保持）
- ガードレール（Issue 本文ファイル経由制約。実装詳細は `agentdev-gh-cli` の WRITE 標準手続きが所有、`POL-gh-io-delegation`）
