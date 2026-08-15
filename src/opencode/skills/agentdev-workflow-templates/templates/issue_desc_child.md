---
name: Child Issue Description
about: Epic配下の子Issue本文テンプレート
labels: enhancement, feature
---

## 親Issue
<!-- 【必須】 -->

Parent: #{epic_number}

## 概要
<!-- 【必須】 -->

{summary}

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
  - 詳細は agentdev-workflow-templates SPEC「test strategy 記述ガイドライン」参照 -->
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

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。case-open が新規 Issue 作成時に付与する必須セクション。本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。case-run は本セクション存在有無で新旧 Issue を識別する -->
### 変更対象成果物
- （artifact type と対象パスのリスト）

### 必須品質統制
- （artifact-quality-control-routing SPEC に基づく能力キーと検証項目）

### 関連 ADR 拘束条件
- （該当 ADR と完了条件/test strategy への反映）

### scope-affecting impact candidate
- （case-open が事前探索した候補）

### adversarial-review 発動契約（任意）
- （ユーザー明示指定時のみ記録）

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。disposition 明細の重複転記は行わない。「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #{epic_number} の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

{additional_context}
