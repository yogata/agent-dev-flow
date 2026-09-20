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

1. Root Case 本文候補を生成する。本文は要件doc の合意済み入力を投影し、機能要件、非機能要件、制約、対象外、受け入れ条件を新規に作成しない。テンプレートは `agentdev-workflow-templates` の選定ルールに従う（Root Case 用テンプレート、【必須】セクション完備）
2. 実行識別情報セクションを `agentdev-workflow-templates` の規約に従い記録する
3. `review_dispositions` が存在する場合は転記規則に従い「レビュー判断」セクションへ転記する
4. 曖昧性が残らず Root Case を確立できる場合にのみ、`agentdev_gh` の issue_create で Root Case を作成する（VERIFY）
5. ラベルは `agentdev-workflow-lifecycle` の work_type 判定に従い付与する
6. Root Case 確立後の状態は open とし、実装開始を許可しない

### STEP-3: Definition Package 生成と関連付け

1. 要件行（REQ 変更後本文）、Decision、Design、Issue 構成案（`operation_units`、`case_open_hints` 由来）、受入条件一式を Case 単位で集約し Definition Package を生成する
2. REQ 行追加を伴う Definition Package 生成時、トレーサビリティポリシー更新の追随要否を確認する。REQ 行の新設・追記を含む場合は、当該行のトレーサビリティポリシー（検証対応を任意とする要件行の明示登録）への追随要否を確認し、必要な policy エントリ追加を Definition Package の構成要素として含める。policy 編集は当該要件行の変更と同一の Definition 変更として扱うため Definition PR 経由以外の適用経路を取らない（直接 main へ適用しない）。policy 登録が不要と判断した場合は、その判断理由を Definition Package 構成案に記録する
3. REQ 行変更（新規行の追加・移管・廃止等）を伴う場合、対象 REQ 行をカバーする Design の ADF-COVERS 宣言（design、implementation 役割）の追随要否を確認する。宣言の追加・更新が必要な場合は Definition Package の構成要素として含める。Definition PR の作成前にトレーサビリティ check（`agentdev-traceability`）で当該 REQ 行の missing-design が 0 件であることを確認する（missing-design 0 件ゲート）
4. Issue 構成案に物理削除を伴う docs-chore OU が含まれる場合、当該 OU の対象範囲に extensions、templates 等の実行時設定からの参照を明示的に含める。削除対象の参照先を事前確認し、OU 分割時は他 OU・実行時設定からの参照責務に隙間がないか検査する（原本は `<workflows/references/execution-unit-construction>` Design「docs-chore OUの削除起因参照追随」節。根拠事例: E6-2〔Epic #2984 コメント記録〕、Case #2979）。checkExtensions 等の fan-in 事後検査は維持する
5. `realization_actions` は Definition Package の構成要素として保持する（構造化ハンドオフ: DEC-{N}）。case-open が execution contract を確定しない
6. 生成した Definition Package を Root Case に関連付ける（Root Case 本文の Definition Package セクションへ所在を記録する）
7. Definition Package の構成、索引・補助メタデータの具体形式は case-open / case-ready Design の管理下とする

## Result

- Root Case GitHub Issue 作成済み（対象 REQ 番号埋め込み、状態 open）
- Definition Package 生成済み、Root Case 関連付け済み

## Evidence

- Root Case Issue 番号、本文生成根拠、Definition Package の構成要素と関連付け状態

## Completion Verification

- Root Case 本文に対象 REQ 番号が埋め込まれていること
- Definition Package が Root Case に関連付けられ、構成要素が揃っていること
- REQ 行追加を伴う場合はトレーサビリティポリシー追随要否の確認（必要エントリの Definition 包含、または不要判断の記録）が行われていること
- REQ 行変更を伴う場合は Design の ADF-COVERS 宣言追随要否の確認（必要な宣言の Definition 包含）が行われていること
- 物理削除を伴う docs-chore OU を含む場合は、当該 OU の対象範囲への実行時設定参照の明示包含が確認されていること
- 状態が open であり実装開始が許可されていないこと

## Resume-Idempotency

- 再実行時は冪等キーで既存 Root Case を検出し再利用する（STEP-5）。2件目の Root Case を作成しない

## resume point

- Root Case Issue 番号と作成状態、Definition Package の生成・関連付け状態

## 関連 STEP

- 前: STEP-1（handoff）
- 次: STEP-4 / STEP-5（definition-pr-and-idempotency）
