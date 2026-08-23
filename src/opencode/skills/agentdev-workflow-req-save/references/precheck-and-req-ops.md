# STEP-1〜4: 事前チェック・読込・検証・REQ ファイル操作（precheck-and-req-ops）

> 本 reference は `agentdev-workflow-req-save` SKILL.md の STEP-1〜STEP-4 詳細である。
> 事前チェック（no-op 判定）、ドラフト読込、ドラフト検証、REQ ファイル操作を提供する。

## 目次

- STEP-1: 事前チェック
- STEP-2: ドラフト読込
- STEP-3: ドラフト検証・処理対象確定
- STEP-4: REQ ファイル操作

## STEP-1: 事前チェック

### Purpose

`draft-data` の `artifact_actions` から処理要否を判定する（no-op 判定）。

### Input Resolution

1. SSoT 再構成: `.agentdev/drafts/req-draft-*.md` の `# draft-data` block
2. identifier 保持: topic-slug
3. 最小 scalar: なし
4. runtime artifact: ドラフトファイル

### Preconditions

- req-save command が起動している

### Procedure

`draft-data` の `artifact_actions` を確認し、`artifact: req` または `artifact: decision` の entry が含まれるか判定する。
REQ/Decision 対象 artifact_actions がない場合は no-op 完了とする（後続の case-open へ進むよう完了報告で案内）。
`work_type` による停止は廃止する。
旧形式 draft（`artifact_actions` フィールドなし）の場合は従来どおり全 req-operation を処理する（後方互換）。

### Result

- 処理要否判定（no-op or 継続）

### Evidence

- `artifact_actions` の entry 種別一覧

### Completion Verification

- no-op 判定時に REQ/Decision entry が実際に0件であること

### Resume-Idempotency

- 読取のみで副作用を持たない。再実行時は同一判定になる

## STEP-2: ドラフト読込

### Purpose

対象ドラフトを特定し、読込時点の commit hash を記録する。

### Input Resolution

1. SSoT 再構成: `.agentdev/drafts/req-draft-*.md`（最新の1件を対象）
2. identifier 保持: topic-slug
3. 最小 scalar: 読込時 commit hash
4. runtime artifact: ドラフトファイル

### Preconditions

- STEP-1 で処理対象ありと判定されている

### Procedure

`.agentdev/drafts/req-draft-*.md` を読み込み、最新の1件を対象とする。
見つからない場合はエラーで中止する（先に `/agentdev/req-define` を実行するよう案内）。
**読込時 hash 記録**: `git rev-parse HEAD` で読込時点の commit hash を記録する。

### Result

- ドラフト読込済み、読込時 commit hash 記録済み

### Evidence

- 対象ドラフトパス、読込時 commit hash

### Completion Verification

- 対象ドラフトが一意に特定され、hash が記録されていること

### Resume-Idempotency

- 読取のみで副作用を持たない。再実行時は最新ドラフトと最新 hash を再取得する

## STEP-3: ドラフト検証・処理対象確定

### Purpose

draft-data の必須フィールドを検証し、処理対象 entry を確定する。

### Input Resolution

1. SSoT 再構成: draft-data
2. identifier 保持: OU ID（指定時）
3. 最小 scalar: なし
4. runtime artifact: ドラフトファイル

### Preconditions

- STEP-2 でドラフトが読み込まれている

### Procedure

`draft-data` の必須フィールド（artifact_actions、operation_units、topic_slug）が存在することを確認する。
欠損時はエラーで中止する。

- **分類ゲート検査**: CREATE 対象 REQ の要件テーブル検査。**文書分類適合確認**: REQ/Decision 保存前のドキュメント種別確認。詳細、委譲接続点は `agentdev-req-file-manager` を参照
- **REQ/Decision artifact_actions 処理ゲート**: ドラフトの `artifact_actions` から `artifact: req`/ `artifact: decision` の entry を処理対象とする（draft 全体を処理し、OU ごとに分割しない）。`artifact_actions` に REQ/Decision entry がない場合は no-op 完了とする。`operation_units` 存在時は OU ID 指定があれば当該 OU 配下のみ、未指定時は draft 全体を処理対象とする。`artifact_actions` フィールドがない（旧形式 draft）の場合は従来どおり全 req-operation を処理する（後方互換）。`artifact: design` の entry は design-save コマンドの対象であり処理しない

### Result

- 必須フィールド検証結果、処理対象 entry 一覧

### Evidence

- 検証結果、処理対象 entry の種別と target

### Completion Verification

- 必須フィールドが全て存在すること。処理対象に `artifact: design` を含まないこと

### Resume-Idempotency

- 検証は読取のみで副作用を持たない

## STEP-4: REQ ファイル操作

### Purpose

処理対象 entry を REQ/Decision ファイルへ保存する（決定的スクリプト適用、QG-1 相当検証込み）。

### Input Resolution

1. SSoT 再構成: `docs/requirements/**`、`docs/decisions/**` の既存ファイル
2. identifier 保持: REQ番号、要件行ID、Decision番号
3. 最小 scalar: なし
4. runtime artifact: ドラフト、`requirements-review-finding` 検出事項（SPLIT 検出時）

### Preconditions

- STEP-3 で処理対象が確定している

### Procedure

`agentdev-req-file-manager` の判定ロジックと採番ルールに従って実行する。
STEP-3 で処理対象とした `artifact_actions`（`artifact: req`/ `artifact: decision`）の全 entry を処理する（draft 全体を処理し、OU ごとの消費は行わない）。
`artifact_actions` フィールドがない場合は従来どおり全 req-operation を処理する（後方互換）。
委譲接続点: サブエージェントは CREATE/APPEND/UPDATE 候補、SPLIT 候補、REQ 再構成候補を返し、親エージェントがファイル保存を行う（詳細は `agentdev-req-file-manager` 参照）。

- **決定的処理のスクリプト呼出**: REQ番号採番、要件行ID採番、frontmatter id↔ファイル名整合性確認は `agentdev-artifact-validation` の公開検証契約および `agentdev-req-file-manager` SKILL.md「Scripts（決定的処理）」で規定する決定的スクリプトを bash 経由で呼び出して実行する。LLM 推論で代替しない。具体的な CLI 形式、stdin JSON 入力、stdout schema は同 SKILL.md を参照
- **QG-1（適用結果の整合性検証）**: REQ/Decision ファイル保存前に `agentdev-quality-gates` の QG-1 を実行する。採番結果、マージ結果、インデックス、変更範囲の妥当性を決定的スクリプトの JSON 結果で機械的に確認する。fail 時は保存を停止し req-define へ差り戻す。req-save の QG-1 は内容の品質を再検証せず、それは req-define の QG-1 の責務である
- **検証対応要否の未分類検出・記録（段階ゲート）**: REQ ファイル操作の完了後、今回保存した新規 REQ の全要件行または APPEND で追加した要件行を対象に、検証対応要否の分類状態を導出する。分類状態の導出定義（未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録）はトレーサビリティモデル「対応関係の完全性規則」が正規所有する。導出は `agentdev-traceability` の check（`bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req <対象要件行のカンマ区切り>`）で機械的に行い、`missing-verification` の findings を未分類行として採用する（終了コード 2 は検査 fail を示すものであり JSON は読み取れる）。check が実行不能な場合はカタログ登録状態と検証対応宣言の有無を定義どおり手動確認する。検出した未分類行は STEP-11 の OU 結果書き戻しと STEP-12 の完了報告に明示的に記録する。**未分類行の存在だけを理由として req-save を失敗させない**。保存時点で未分類となることは新規要件行の既定の状態であり、分類の完了（検証対応任意行としてのカタログ登録、または検証対応宣言を持つ恒久検証手段の整備）は case-open または実装着手前までの必須条件として後続工程が担う
- **語彙・責務・runtime境界矛盾の防止**: STEP-4 完了後に既知の矛盾を検出可能な範囲で防止する。**Catalog entry 確認（APPEND 時）**: 関連 integrity-rule-catalog Design（extension 経由）の catalog entry 有無を確認、未記載時はユーザーへ追記を促す（`docs/designs/` 配下は直接編集しない G02）。**複数 REQ/Decision ファイルの3フェーズ分離**: 採番バッチ[直列] / ファイル作成[並列・最大5件] / インデックス更新[直列]。各詳細は `agentdev-req-file-manager` を参照

### Result

- REQ/Decision ファイル保存済み（QG-1 検証合格）
- 検証対応要否未分類行の検出結果（未分類行の有無と要件行ID一覧）

### Evidence

- 保存ファイルパス群、決定的スクリプトの JSON 結果、QG-1 判定、未分類検出の check 結果（または定義どおりの手動確認結果）

### Completion Verification

- 処理対象 entry 全てが保存済みであり、QG-1 が合格であること。保存対象の新規 REQ または追加要件行の未分類検出が実施済みであり、その結果が後続 STEP の記録対象として確定していること（未分類行の有無は保存の成否に影響しない）

### Resume-Idempotency

- 保存済み REQ ファイルの存在（durable state）で再開点を判定する。再実行時は既存採番・既存ファイルを検出し、未保存分のみ処理する（rerun idempotency）。partial failure 時は保存済みファイルを残したまま未完了分を再処理する

## 関連 STEP

- 前: なし（workflow 開始）
- 次: STEP-5（indexes-and-persistence.md）

## 関連 Capability Skill

- `agentdev-req-file-manager`: 判定ロジック、採番ルール、3フェーズ分離
- `agentdev-artifact-validation`: 決定的スクリプト、公開検証契約
- `agentdev-quality-gates`: QG-1 適用結果整合性検証
- `agentdev-traceability`: 検証対応要否未分類行の導出（check。段階ゲートの検出手段）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（REQ/Decision 対象 artifact_actions がない場合は no-op 完了）
- G02・不変条件（ファイル編集スコープ）
- 不変条件（REQ番号は連番・一意、空き番号再利用禁止）
- 不変条件（要件doc構造は doc_requirement.md テンプレート厳密準拠）
