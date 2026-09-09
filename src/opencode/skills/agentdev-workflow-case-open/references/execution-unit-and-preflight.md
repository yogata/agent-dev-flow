# STEP-3: 構成判定・preflight（execution-unit-and-preflight）

<!-- ADF-COVERS(implementation): REQ-030-022, REQ-035-012 -->

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-3 詳細である。
> execution_unit 構成（連結成分アルゴリズム、3軸判断）と規模判定、構成生成事前検証（preflight）を提供する。

## 目次

- マルチREQ 入力判定
- 自律構成生成（OU モード、複数REQ時）
- 規模判定（単一REQの場合）
- 構成生成事前検証（preflight）

## Purpose

execution_unit 構成（連結成分アルゴリズム、3軸判断）と規模判定により実行ルートを確定し、構成生成事前検証（preflight）を実施する。

## Input Resolution

1. SSoT 再構成: 要件doc（`operation_units`、`depends_on`、`scale`）、関連 REQ/Decision
2. identifier 保持: OU ID、REQ-ID
3. 最小 scalar: 子Issue 数、Wave 同時実行数（preflight 上限検証）
4. runtime artifact: なし

## Preconditions

- STEP-2 で Issue 本文候補（execution contract 確定済み）が生成されている

## Procedure

### マルチREQ 入力判定

入力要件doc数を確認。

- **単一REQ** → 規模判定（後述）へ
- **複数REQ または draft-meta `scale: large`** → **マルチREQ Epic flow**（STEP-5 issue-creation-flows の Epic flow へ）
- **OU モード時**: STEP-1 で選択した OU が複数または `scale: large` を含む場合 → Epic flow に分岐

### 自律構成生成（OU モード、複数REQ時）

ドラフトの `operation_units` を読み取り要件分析に基づき Epic/Wave/Issue 構造を自律生成（req-define 出力は参考情報、case-open が最終構造を決定）。

- **独立 OU の自動 Epic 化**: 複数の独立 OU（`depends_on` 空、L0 相当）を検出時、Wave 1 に全 OU 配置。独立 OU 1件のみなら Standard flow（command 不変条件）
- **Wave テーブル「実行方法」列**: L0/L1 → 並列、L2/L3 → 直列
- **Wave 配置の確定前**: Wave 構成の変更ファイル重複前置検出（後述）を実施し、重複時の処置判断を Wave 構成の判断として確定する

停止条件、禁止事項、構成生成事前検証（preflight）の詳細は `agentdev-epic-tracker` を参照。

### Wave 構成の変更ファイル重複前置検出

Wave 構成を確定する前に、同一 Wave 候補の OU 間で変更対象ファイル集合の重複をファイル単位で前置検出する。
前置検出契約の正は epic-wave-model Design「execution_unit 構成の依存ヒントと Wave 構成の重複前置検出契約」節である。
Wave 構成を持つルート（OU モードの Epic flow、単一REQ Epic flow）で適用する。Wave 構成を持たない Standard flow では比較対象がないため適用外である。

**比較対象**: 各 OU の realization_actions・artifact_actions の対象（推定変更ファイル、変更対象成果物）。
パスをファイル単位の集合として Wave 候補内で交差を取る。

**手順**:

1. Wave 候補ごとに、所属 OU の変更対象ファイル集合を作成する（要件doc の `realization_actions`・`artifact_actions`、Issue 化後は子 Issue 本文「実現面の変更方針」「変更対象成果物」に対応）
2. Wave 候補内で同一ファイルを含む OU の組を検出する
3. 重複検出時は Wave 分離・変更対象分割・重複許容の3決定肢から Wave 構成の判断として決定し、判断記録を残す。重複許容時は衝突解消の担当とマージ順序を事前記録する
4. 判断結果を Wave 構成へ反映する。前置検出と判断は回復の発生確率を下げる予防であり、Level 1〜3 コンフリクト解消（回復）契約を弱めない

**比較省略の禁止**: 変更対象集合が取得不能またはファイル粒度に展開不能な OU がある場合は、比較を省略せず検出不能として報告し判断を求める。

**case-auto 配下の判断委譲**: 重複時の判断・検出不能時の判断は decision_context による親判断解決へ委譲する。

**不変事項**: execution_unit 間並列可否の判定軸（必須依存の連結成分のみ）を前置検出で置き換えない。mergeable 作成時状態のみで Wave の安全性を判断しない。

### 規模判定（単一REQの場合）

- `scale: large` → **単一REQ Epic flow**（STEP-5 Epic flow へ）
- `scale: standard` / フィールドなし → **Standard flow**（STEP-5 Standard flow へ）

### 構成生成事前検証（preflight）

Standard/Epic/混在構成の全ルートで GitHub Issue 作成前に共通の事前検証を実施。

**6項目**:

1. 各 Epic の子 Issue 数が10件以下
2. 各 Wave の同時実行対象が5件以下
3. 各 Standard Issue と子 Issue が1つの OU に対応
4. 必須依存関係が維持される
5. 全 OU が execution_unit へ割当・欠落重複なし
6. 対象要件行に検証対応要否が未分類の行が残っていないこと

**検証失敗時**: 上限超過、構成不備、または対象要件行の未分類残存を検出した場合は Issue 作成呼び出しを行わず停止する。
検証失敗時はドラフト削除、RU ファイル削除を実施せず再開可能な状態で停止。

**検証対応要否の未分類残存チェック（第6項目、段階ゲート）**:

- **導出**: 分類状態の導出定義（未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録）はトレーサビリティモデル「対応関係の完全性規則」が正規所有する。対象要件行（本 workflow が Issue 化する要件行）について `agentdev-traceability` の check（`bun .opencode/skills/agentdev-traceability/scripts/src/check.ts --root . --req <対象要件行のカンマ区切り>`）で機械的に導出し、`missing-verification` の findings を未分類行として扱う（終了コード 2 は検査 fail を示すものであり JSON は読み取れる）。check が実行不能な場合はカタログ登録状態と検証対応宣言の有無を定義どおり手動確認する
- **停止と再開**: 未分類行が残る場合は Issue を作成せずに停止する。req-save の完了報告に記録された未分類行の検出結果を参照し、分類完了を case-open または実装着手前までの必須条件として扱う。分類は、検証対応任意行として検証対応要否カタログへ登録するか、検証対応宣言を持つ恒久検証手段を整備することで完了する。分類完了後の再実行は draft-data から再開できる（durable state から再構成）
- **判定の所有**: 本ゲートの判定は本 Workflow Skill が保持し、command 定義へ複製しない

## Result

- execution structure 確定（Standard flow / 単一REQ Epic flow / マルチREQ Epic flow、Wave 構成）
- Wave 構成の重複前置検出結果と判断記録（重複なし、3決定肢の判断、検出不能報告のいずれか。Wave 構成を持つルートのみ）
- preflight 6項目 合格（対象要件行の検証対応要否未分類残存チェックを含む）

## Evidence

- 実行ルート判定根拠（入力要件doc数、`scale`）、execution_unit 構成（OU → Wave → Issue マッピング）、preflight 6項目の検証結果（未分類残存チェックの check 結果または定義どおりの手動確認結果を含む）
- Wave 構成の重複前置検出の比較結果、重複検出時の判断記録（Wave 分離・変更対象分割・重複許容、重複許容時の衝突解消の担当とマージ順序の事前記録）、検出不能報告（比較不能 OU が存在した場合）

## Completion Verification

- preflight 6項目が全て合格であること（不合格時は Issue 作成を行わず停止。未分類行残存時も Issue を作成しない）
- Wave 構成を持つルートでは、Wave 候補間の変更対象ファイル集合比較が省略されていないこと（比較不能 OU がある場合は検出不能として報告済みであること）。重複検出時は3決定肢の判断と判断記録があること

## Resume-Idempotency

- 構成判定は draft-data からの読取であり副作用を持たない。検証失敗で停止した場合は同一 draft から再実行できる（ドラフト・RU は削除しないため再開可能）

## resume point

- 実行ルート判定結果（Standard / 単一REQ Epic / マルチREQ Epic）
- execution_unit 構成（OU → Wave → Issue マッピング）
- Wave 構成の重複前置検出の判断記録
- preflight 検証結果

## 関連 STEP

- 前: STEP-2（issue-body-and-execution-contract）
- 次: STEP-4（adversarial-review-integration）

## 関連 Capability Skill

- `agentdev-epic-tracker`: execution_unit 構成アルゴリズム、Wave 構成、子Issue 上限、自律構成生成
- `agentdev-workflow-lifecycle`: scale 判定（standard/large）
- `agentdev-traceability`: 検証対応要否未分類行の導出（check。段階ゲートの停止判定手段）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（子Issue 最大10件まで、Epic 1件あたり）
- 不変条件（Wave 単位のみの子Issue 構造禁止、OU 単位で作成）
- 不変条件（マルチREQ Epic flow は複数REQ 入力時または `scale: large` 設定時のみ、単一REQ Epic flow は `scale: large` 明示時のみ）
- 不変条件（自律的な要件分析に基づく Epic/子Issue 構造生成、機能要件・非機能要件・対象外・受け入れ条件の新規作成禁止、Issue 化単位は OU 単位）
- 不変条件（対象要件行に検証対応要否が未分類の行が残る場合は Issue を作成せず停止）
