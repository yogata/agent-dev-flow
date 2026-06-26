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
- [ ] [完了条件を記述（「何を満たせば完了か」をチェックボックスで定義）]

## テスト戦略
<!-- 【必須】 -->

<!-- テスト戦略: case-open が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
- id: TS-001
 target_item: [検証対象]
 verification: |
 [検証手順]
 pass_criteria: |
 [合格基準]
 on_failure: |
 [不合格時の処置]

## 補足情報
<!-- 【任意】 -->

{additional_context}
