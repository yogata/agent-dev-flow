# STEP-3: 構成判定・preflight（execution-unit-and-preflight）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-3 詳細である。
> execution_unit 構成（連結成分アルゴリズム、3軸判断）と規模判定、構成生成事前検証（preflight）を提供する。

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

停止条件、禁止事項、構成生成事前検証（preflight）の詳細は `agentdev-epic-tracker` を参照。

### 規模判定（単一REQの場合）

- `scale: large` → **単一REQ Epic flow**（STEP-5 Epic flow へ）
- `scale: standard` / フィールドなし → **Standard flow**（STEP-5 Standard flow へ）

### 構成生成事前検証（preflight）

Standard/Epic/混在構成の全ルートで GitHub Issue 作成前に共通の事前検証を実施。

**5項目**:

1. 各 Epic の子 Issue 数が10件以下
2. 各 Wave の同時実行対象が5件以下
3. 各 Standard Issue と子 Issue が1つの OU に対応
4. 必須依存関係が維持される
5. 全 OU が execution_unit へ割当・欠落重複なし

**検証失敗時**: 上限超過または構成不備を検出した場合は Issue 作成呼び出しを行わず停止する。
検証失敗時はドラフト削除、RU ファイル削除を実施せず再開可能な状態で停止。

## Result

- execution structure 確定（Standard flow / 単一REQ Epic flow / マルチREQ Epic flow、Wave 構成）
- preflight 5項目 合格

## Evidence

- 実行ルート判定根拠（入力要件doc数、`scale`）、execution_unit 構成（OU → Wave → Issue マッピング）、preflight 5項目の検証結果

## Completion Verification

- preflight 5項目が全て合格であること（不合格時は Issue 作成を行わず停止）

## Resume-Idempotency

- 構成判定は draft-data からの読取であり副作用を持たない。検証失敗で停止した場合は同一 draft から再実行できる（ドラフト・RU は削除しないため再開可能）

## resume point

- 実行ルート判定結果（Standard / 単一REQ Epic / マルチREQ Epic）
- execution_unit 構成（OU → Wave → Issue マッピング）
- preflight 検証結果

## 関連 STEP

- 前: STEP-2（issue-body-and-execution-contract）
- 次: STEP-4（adversarial-review-integration）

## 関連 Capability Skill

- `agentdev-epic-tracker`: execution_unit 構成アルゴリズム、Wave 構成、子Issue 上限、自律構成生成
- `agentdev-workflow-lifecycle`: scale 判定（standard/large）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（子Issue 最大10件まで、Epic 1件あたり）
- 不変条件（Wave 単位のみの子Issue 構造禁止、OU 単位で作成）
- 不変条件（マルチREQ Epic flow は複数REQ 入力時または `scale: large` 設定時のみ、単一REQ Epic flow は `scale: large` 明示時のみ）
- 不変条件（自律的な要件分析に基づく Epic/子Issue 構造生成、機能要件・非機能要件・対象外・受け入れ条件の新規作成禁止、Issue 化単位は OU 単位）
