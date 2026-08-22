---
name: Child Issue Description
about: Epic配下の子Issue本文テンプレート
labels: enhancement, feature
---

Parent: #{epic_number}

<!-- Parent 配置正規形: 子Issue 本文の先頭行に Parent: #N を配置する（agentdev-epic-tracker 親Epic検出、case-open 不変条件と整合）。旧「## 親Issue」セクション内配置（先行実績 #2092 形式等）は移行措置として後方互換で検出する -->

## 概要
<!-- 【必須】 -->

{summary}

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: workflow-contracts Design「ADF 実行識別情報の記録契約」に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: （対象 Case の Issue 番号。#N 形式。親 Epic Issue の番号）
- adf_phase: case-open
- adf_execution_unit: （実行単位。standard:#N 形式。本子 Issue の番号。execution_unit 構成の既存定義に従い、新規の識別体系を並立させない）
- adf_upstream_confirmed: （前工程で確定した事項。req-save、design-save の commit SHA と確定済み REQ、Decision、Design の識別子を識別子中心で記録。前工程がない場合は N/A）
- adf_harness_ref: （任意。harness 側識別子（OpenCode session ID 等）。取得可能な場合のみ記載し、省略できる）

## 対象範囲
<!-- 【必須】 -->

{scope}

## REQ参照
<!-- 【必須】 -->

REQ-{req_number}

## 提案内容
<!-- 【必須】 -->

{solution}

## 完了条件
<!-- 【必須】 -->

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
<!-- 構造変更（command、skill、template の構造様式変更）を伴う場合、当該構造を固定する契約テストの期待値更新を完了条件へ明示的に含める -->
- [ ] [完了条件を記述（「何を満たせば完了か」をチェックボックスで定義）]

## テスト戦略
<!-- 【必須】 -->

<!-- テスト戦略: case-open が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
<!-- pass_criteria 記述ガイド（AG-{NNN}）:
  - 共通 pass_criteria は複数 REQ の pipeline stage 違いで QG-{N} 食い違いを生むため、REQ 単位の個別期待値を推奨
  - 「変更対象外 REQ の変更がないこと」は「diff がないこと」として表現し、「存在しないこと」とは書かない
  - 「存在しないこと」は新規作成禁止（例: REQ-NNNN が存在しないこと）の場合のみ使用。既存 REQ の変更有無検証には使用しない
  - 構造変更を伴う場合は、当該構造を固定する契約テストの期待値更新を pass_criteria の検証対象に含める
  - 詳細は agentdev-workflow-templates Design「test strategy 記述ガイドライン」参照 -->
- id: TS-{NNN}
 target_item: [検証対象]
 verification: |
 [検証手順]
 pass_criteria: |
 [合格基準]
  on_failure: |
 [不合格時の処置]

## Execution Contract
<!-- 【必須】 -->

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。
case-open が新規 Issue 作成時に付与する必須セクション。
本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。
case-run は本セクション存在有無で新旧 Issue を識別する -->
### 統合先
- （Case に割り当てられた統合先ブランチ。既定値 main）

### 変更対象成果物
- （artifact type と対象パスのリスト）

### 必須品質統制
- （artifact-quality-control-routing Design に基づく能力キーと検証項目）

### 関連 ADR 拘束条件
- （該当 ADR と完了条件/test strategy への反映）

### scope-affecting impact candidate
- （case-open が事前探索した候補）

### adversarial-review 発動契約（任意）
- （ユーザー明示指定時のみ記録）

### 実証Case識別情報（実証Caseの場合のみ）
<!-- 実証Case識別情報: 実証フラグ、対象評価ブランチ、所属実証単位、評価契約（実証・評価ワークフロー契約の投影）を記録する。通常Caseでは本サブセクションを省略する。実証Case専用要素（評価契約・対象評価ブランチ）は presence-based 判定の新契約必須セクション一覧に含めない -->
- （実証Caseの場合: 実証フラグ、対象評価ブランチ、所属実証単位、評価契約）

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。
disposition 明細の重複転記は行わない。
「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #{epic_number} の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

{additional_context}
