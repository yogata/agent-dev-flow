---
name: Epic Issue Description
about: 大規模機能追加用Epic Issue本文テンプレート
labels: enhancement, feature, epic
---

<!-- Tracking 行配置正規形: 追跡Issueから要件化された Case Issue は、本文冒頭ブロックに `Tracking: #N` を1行で記載する（複数の元追跡Issueがある場合は `Tracking: #N, #M` 形式。case-open Design「Case Issue 本文の元追跡Issue参照形式」節参照）。追跡Issueを起源としない通常の Case Issue には Tracking 行を記載しない（元追跡Issueが判明している場合のみ case-open が記載する） -->

## 概要
<!-- 【必須】 -->

{summary}

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: （対象 Case の Issue 番号。#N 形式。本 Epic Issue 自身の番号）
- adf_execution_unit: （実行単位の flow 種別。epic。対象 Issue 番号は本 Epic Issue の番号を正として導出する）
- adf_harness_ref: （任意。harness 側識別子（OpenCode session ID 等）。取得可能な場合のみ記載し、省略できる）

## 課題
<!-- 【必須】 -->

{problem}

## 提案内容
<!-- 【必須】 -->

{solution}

## REQ参照
<!-- 【必須】 -->

REQ-{req_number}

## 分解
<!-- 【必須】 -->

<!-- 分解テーブル正規形（agentdev-epic-tracker 新4列形式と整合）: 「#」列は {wave}-{seq} 形式（例: 1-1）、Issue 列は #N のみ（OU ID 等の付記は内容列へ）、ステータス初期値は pending。
内容列へ転記する子 Issue タイトルは子 Issue 作成時点の書式に従い、所属 Wave を先頭に置く Wave 付き Task 接頭辞書式とする。書式の具体は workflows/issue-title-policy Design（Issue タイトル記述規則）「Wave 投影」節を参照し、テンプレートは書式を複製しない。Epic 本文の Wave テーブルと子 Issue タイトルの一致を維持し、正規の構成変更で所属 Wave が変わった場合はタイトルを同期する -->
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| {wave}-{seq} | #{child_issue} | pending | {child_1_title} |
| {wave}-{seq} | #{child_issue} | pending | {child_2_title} |

## 実行順序
<!-- 【必須】 -->

ケースオープン時に Wave テーブルが自動生成される。
手動での編集は可能だが、列構造を維持すること。

<!-- Wave テーブル正規形: Issue 列は #N のみ（OU ID 等の付記は前提列または分解テーブルの内容列へ） -->
| Wave | Issue | 実行方法 | 前提 |
|------|-------|----------|------|
| 1 | #{child1_N} | 並列 | - |
| 2 | #{child2_N} | 並列 | #{child1_N} |

## ステータス追跡
<!-- 【必須】 -->

子Issue 実行状態 enum（`pending`/ `ready`/ `running`/ `completed`/ `blocked`/ `failed`）。
`⏭スキップ` は採用しない。

| 状態 | 件数 |
|------|------|
| pending | {total} |
| running | 0 |
| completed | 0 |
| blocked | 0 |
| failed | 0 |

## 完了条件
<!-- 【必須】 -->

<!-- 完了条件: Epic全体の完了判定条件 -->
{completion_criteria}

## Execution Contract
<!-- 【必須】 -->

<!-- Execution Contract: case-open が新規 Epic Issue 作成時に付与するセクション。
本セクションに実現面の変更方針（realization_actions 由来）の投影先を定義し、req-define が確定した内容を Epic 本文へ永続化する（Issue Execution Contract の実現面投影契約に従う）。
Epic flow の場合は子 Issue 個別の実現面の変更方針が子 Issue 本文へ投影され、Epic 共通の実現面の変更方針のみ本セクションへ記録する -->

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

<!-- 実現面の変更方針: case-open が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
req-define が確定した実現面の変更方針（正規所有責務、変更すべき実現面、変更意図、検証との対応）を失わず本文へ永続化する。
case-open 成功後は case-run が本文だけで変更責務、変更意図、検証方針を取得できる。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。
投影対象がない場合は「該当なし」と記載する -->

- （RA-{NNN} ごとに: concern、responsibility、ownership_hints、intent、verification_refs、source_items を記録）

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。
Epic flow の場合は全 disposition を Epic Issue へ転記する。
転記対象がない場合は「該当なし」と記載する。
evidence.path には promote 済み成果物等の削除可能性があるパスを記録する場合、path 単独に依存せず、prune 後も識別可能な代替識別子（RU 番号、learning タイトル、関連 Case 番号）を併記する（evidence 記録規約: `agentdev-workflow-templates` Design「review_dispositions 証跡セクション」参照） -->
{review_dispositions}

## 現在地
<!-- 【必須】 -->

<!-- 現在地: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照を読み取れる内容を保持する。
進行状態は 未着手 / 実行中 / 待機 / 終了 の4値で表示し、待機には理由と次の行動を、終了には完了・中止の区別を付す。
進行状態は正規状態と記録契機から写像される表示であり、独立して更新・判断される第二の進行管理を構成しない。
着手以降、記録契機（着手、引き渡し、停止、再開、判断変更、完了）に応じて case-auto 等の進行スキルとコードが更新する。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->

- 工程: case-ready
- 進行状態: 未着手
- 次の行動: [次に実行する行動]
- 担当役割: [実行担当 / 取りまとめ / 判定主体のいずれか]
- 停止・待機理由: 該当なし
- 最新記録参照: 該当なし

## 結果
<!-- 【必須】 -->

<!-- 結果: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
成果物、最終判定とその根拠、残件の扱いを読み取れる内容を保持する。
完了判定は case-close 等の判定主体が完了条件と証拠を照合して確定し、実行の申告だけで完了扱いとしない。
子 Issue の完了と Epic 全体の完了を区別して扱う -->

- 成果物: 該当なし
- 最終判定と根拠: 該当なし
- 残件の扱い: 該当なし

## 補足情報
<!-- 【任意】 -->

{additional_context}


