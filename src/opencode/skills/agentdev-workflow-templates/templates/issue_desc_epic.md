---
name: Epic Issue Description
about: 大規模機能追加用Epic Issue本文テンプレート
labels: enhancement, feature, epic
---

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
- adf_phase: case-open
- adf_execution_unit: （実行単位。epic:#N 形式。execution_unit 構成の既存定義に従い、新規の識別体系を並立させない）
- adf_upstream_confirmed: （前工程で確定した事項。req-save、design-save の commit SHA と確定済み REQ、Decision、Design の識別子を識別子中心で記録。前工程がない場合は N/A）
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

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。
Epic flow の場合は全 disposition を Epic Issue へ転記する。
転記対象がない場合は「該当なし」と記載する -->
{review_dispositions}

## 実証Case識別情報（実証Caseの場合のみ）
<!-- 【任意】 -->

<!-- 実証Case識別情報: 実証フラグ、対象評価ブランチ（Epic 実証では共有評価ブランチ）、所属実証単位を記録し、Epic Issue から共有評価ブランチを特定できるようにする。
通常Caseでは本セクションを省略する。
実証Case専用要素（評価契約・対象評価ブランチ）は presence-based 判定の新契約必須セクション一覧に含めない -->
- （実証Caseの場合: 実証フラグ、対象評価ブランチ、所属実証単位）

## 補足情報
<!-- 【任意】 -->

{additional_context}


