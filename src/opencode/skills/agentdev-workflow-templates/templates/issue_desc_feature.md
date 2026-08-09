---
name: Feature Request
about: 機能リクエスト
labels: enhancement
---

## 概要
<!-- 【必須】 -->

[機能の概要（一言で説明）]

## 課題
<!-- 【必須】 -->

[解決したい課題]

## 提案内容
<!-- 【必須】 -->

[提案する解決策]

## ユースケース（オプション）
<!-- 【任意】 -->

[想定される使用例]

## 代替案（オプション）
<!-- 【任意】 -->

[検討した代替案]

## 完了条件
<!-- 【必須】 -->

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
- [ ] [完了条件を記述（「何を満たせば完了か」をチェックボックスで定義）]

## テスト戦略
<!-- 【必須】 -->

<!-- テスト戦略: 各項目を verification（検証手順）/ pass_criteria（合格基準）/ on_failure（不合格時の処置）の3要素構造で記述 -->
<!-- pass_criteria 記述ガイド（AG-006）:
  - 共通 pass_criteria は複数 REQ の pipeline stage 違いで QG-4 食い違いを生むため、REQ 単位の個別期待値を推奨
  - 「変更対象外 REQ の変更がないこと」は「diff がないこと」として表現し、「存在しないこと」とは書かない
  - 「存在しないこと」は新規作成禁止（例: REQ-NNNN が存在しないこと）の場合のみ使用。既存 REQ の変更有無検証には使用しない
  - 詳細は agentdev-workflow-templates SPEC「test strategy 記述ガイドライン」参照 -->
- id: TS-001
 target_item: [検証対象]
 verification: |
 [検証手順]
 pass_criteria: |
 [合格基準]
  on_failure: |
 [不合格時の処置]

## Execution Contract
<!-- 【必須】 -->

<!-- Execution Contract: REQ-017 Issue Execution Contract。case-open が新規 Issue 作成時に付与する必須セクション。本セクションの存在有無が presence-based 判定の識別子となる（AG-012、REQ-017-014）。case-run は本セクション存在有無で新旧 Issue を識別する -->
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

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。転記対象がない場合は「該当なし」と記載する -->
[review_dispositions の転記内容。各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。該当なしの場合は「該当なし」]

## 補足情報（オプション）
<!-- 【任意】 -->

[その他の情報]
