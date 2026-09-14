# STEP-4 / STEP-5: 実変更判定・Definition PR 作成と冪等再実行（definition-pr-and-idempotency）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-4、STEP-5 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は両 STEP の実行詳細を提供する。

## Purpose

canonical Definition との実変更を判定し、実変更がある場合のみ Draft Definition PR を作成する。
再実行時は既存 Root Case と既存 Draft Definition PR を再利用し、不足分だけを処理して重複生成しない。

## Input Resolution

1. SSoT 再構成: Definition Package（STEP-3 生成）、canonical Definition（merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態）
2. identifier 保持: 対象 REQ 番号、Root Case Issue 番号、既存 Draft Definition PR 番号
3. 最小 scalar: 実変更判定結果
4. runtime artifact: canonical Definition との差分

## Preconditions

- STEP-3 の Definition Package 生成と関連付けが完了している
- canonical Definition が取得できること。判定対象を取得できない場合は実変更判定を行わず停止する（停止理由を報告する）

## Procedure

### STEP-4: 実変更判定と Definition PR 作成

1. 実変更判定: Definition Package と canonical Definition を比較する（definition-readiness Design「canonical Definition の判定」）。差分が空の場合は実変更なし → PR を作成せず STEP-5 へ進む。実変更のない Case（bugfix / maintenance / docs_chore 等では作成しない）
2. 実変更がある場合: 実変更を Case 単位で 1 件の Draft Definition PR として集約し作成する。1 Case につき 2 件以上作成しない
3. PR 作成は `agentdev_gh` の pr_create で行う（VERIFY）。PR 本文は verbatim で記録する

### STEP-5: 冪等再実行確認

1. 冪等キー（definition-readiness Design「冪等キー」）で既存成果物を検出する: 既存 Root Case、既存 Draft Definition PR
2. 検出した成果物を再利用し、重複生成しない。Root Case の重複は STEP-2 で、Draft Definition PR の重複は STEP-4 で排除する
3. 不足分だけを処理する: Root Case が存在し Definition PR が存在しない場合は STEP-4 の手順で PR のみ作成する。Root Case が存在しない場合は STEP-2 から実行する。両者とも存在する場合は新規生成を行わない
4. 重複生成がないことを確認し、結果を記録する

## Result

- 実変更判定結果（実変更あり / なし）
- Draft Definition PR 作成結果（実変更時のみ。Case 単位 1 件）
- 冪等確認結果（既存成果物の再利用、重複生成なし、不足分のみ処理）

## Evidence

- 実変更判定根拠（canonical Definition との差分）、作成した PR 番号、既存成果物の検出結果

## Completion Verification

- 実変更がない Case について Draft Definition PR が存在しないこと
- 実変更がある Case について Draft Definition PR が 1 件であること
- 再実行時に Root Case と Draft Definition PR の件数が増加しないこと

## Resume-Idempotency

- 実変更判定は読取と判定のみで副作用を持たない。PR 作成は既存 PR がある場合は skip する。再実行時は冪等キーで同一の再利用判定に到達する

## resume point

- 実変更判定結果、PR 作成状態、既存成果物の検出結果

## 関連 STEP

- 前: STEP-2 / STEP-3（root-case-and-definition-package）
- 次: STEP-6（capture-and-completion）
