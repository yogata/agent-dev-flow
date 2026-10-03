---
name: Bug Report
about: バグの報告
labels: bug
---

<!-- Tracking 行配置正規形: 追跡Issueから要件化された Case Issue は、本文冒頭ブロックに `Tracking: #N` を1行で記載する（複数の元追跡Issueがある場合は `Tracking: #N, #M` 形式。case-open Design「Case Issue 本文の元追跡Issue参照形式」節参照）。追跡Issueを起源としない通常の Case Issue には Tracking 行を記載しない（元追跡Issueが判明している場合のみ case-open が記載する） -->

## 説明
<!-- 【必須】 -->

[何が起きているかの説明]

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: （対象 Case の Issue 番号。#N 形式。本 Issue 自身の番号）
- adf_execution_unit: （実行単位の flow 種別。standard。対象 Issue 番号は本 Issue の番号を正として導出する）
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
evidence.path には promote 済み成果物等の削除可能性があるパスを記録する場合、path 単独に依存せず、prune 後も識別可能な代替識別子（RU 番号、learning タイトル、関連 Case 番号）を併記する（evidence 記録規約: `agentdev-workflow-templates` Design「review_dispositions 証跡セクション」参照）。
該当なしの場合は「該当なし」]

## 現在地
<!-- 【必須】 -->

<!-- 現在地: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照を読み取れる内容を保持する。
進行状態は 未着手 / 実行中 / 待機 / 終了 の4値で表示し、待機には理由と次の行動を、終了には完了・中止の区別を付す。
進行状態は正規状態と記録契機から写像される表示であり、独立して更新・判断される第二の進行管理を構成しない。
着手以降、記録契機（着手、引き渡し、停止、再開、判断変更、完了）に応じて case-auto 等の進行スキルとコードが更新する。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->

- 工程: case-open
- 進行状態: 未着手
- 次の行動: [次に実行する行動]
- 担当役割: [実行担当 / 取りまとめ / 判定主体のいずれか]
- 停止・待機理由: 該当なし
- 最新記録参照: 該当なし

## 結果
<!-- 【必須】 -->

<!-- 結果: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
成果物、最終判定とその根拠、残件の扱いを読み取れる内容を保持する。
完了判定は case-close 等の判定主体が完了条件と証拠を照合して確定し、実行の申告だけで完了扱いとしない -->

- 成果物: 該当なし
- 最終判定と根拠: 該当なし
- 残件の扱い: 該当なし

## 補足情報（オプション）
<!-- 【任意】 -->

[その他の情報]
