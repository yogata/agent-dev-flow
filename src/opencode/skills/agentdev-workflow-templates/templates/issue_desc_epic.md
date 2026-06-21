---
name: Epic Issue Description
about: 大規模機能追加用Epic Issue本文テンプレート
labels: enhancement, feature, epic
---

## 概要
<!-- 【必須】 -->

{summary}

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

| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| {seq} | #{child_issue} | pending | {child_1_title} |
| {seq} | #{child_issue} | pending | {child_2_title} |

## 実行順序
<!-- 【必須】 -->

ケースオープン時に Wave テーブルが自動生成される。手動での編集は可能だが、列構造を維持すること。

| Wave | Issue | 実行方法 | 前提 |
|------|-------|----------|------|
| 1 | #{child1_N} | 並列 | — |
| 2 | #{child2_N} | 並列 | #{child1_N} |

## ステータス追跡
<!-- 【必須】 -->

子Issue 実行状態 enum（`pending`/ `ready`/ `running`/ `completed`/ `blocked`/ `failed`）。`⏭スキップ` は採用しない。

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

## 補足情報
<!-- 【任意】 -->

{additional_context}


