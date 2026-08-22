---
name: Bug Report
about: バグの報告
labels: bug
---

## 説明
<!-- 【必須】 -->

[何が起きているかの説明]

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: workflow-contracts Design「ADF 実行識別情報の記録契約」に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: （対象 Case の Issue 番号。#N 形式。本 Issue 自身の番号）
- adf_phase: case-open
- adf_execution_unit: （実行単位。standard:#N 形式。execution_unit 構成の既存定義に従い、新規の識別体系を並立させない）
- adf_upstream_confirmed: （前工程で確定した事項。req-save、design-save の commit SHA と確定済み REQ、Decision、Design の識別子を識別子中心で記録。前工程がない場合は N/A）
- adf_harness_ref: （任意。harness 側識別子（OpenCode session ID 等）。取得可能な場合のみ記載し、省略できる）

## 再現手順
<!-- 【必須】 -->

1. [手順1]
2. [手順2]
3. [手順3]

## 期待される動作
<!-- 【必須】 -->

[本来どう動くべきか]

## 実際の動作（オプション）
<!-- 【任意】 -->

[実際の動作]

## スクリーンショット、動画（オプション）
<!-- 【任意】 -->

[スクリーンショットや動画]

## 完了条件
<!-- 【必須】 -->

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
<!-- 構造変更（command、skill、template の構造様式変更）を伴う場合、当該構造を固定する契約テストの期待値更新を完了条件へ明示的に含める -->
- [ ] [完了条件を記述（「何を満たせば完了か」をチェックボックスで定義）]

## テスト戦略
<!-- 【必須】 -->

<!-- テスト戦略: 各項目を verification（検証手順）/ pass_criteria（合格基準）/ on_failure（不合格時の処置）の3要素構造で記述 -->
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

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。転記対象がない場合は「該当なし」と記載する -->
[review_dispositions の転記内容。
各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。
該当なしの場合は「該当なし」]

## 補足情報（オプション）
<!-- 【任意】 -->

[その他の情報]
