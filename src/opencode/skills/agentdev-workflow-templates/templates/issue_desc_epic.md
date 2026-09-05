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

<!-- 実行識別情報: workflow-contracts Design「ADF 実行識別情報の記録契約」に基づく構造化識別情報セクション。
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

<!-- 分解テーブル正規形（agentdev-epic-tracker 新4列形式と整合）: 「#」列は {wave}-{seq} 形式（例: 1-1）、Issue 列は #N のみ（OU ID 等の付記は内容列へ）、ステータス初期値は pending -->
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
転記対象がない場合は「該当なし」と記載する -->
{review_dispositions}

## 補足情報
<!-- 【任意】 -->

{additional_context}


