---
title: STEP Reference Contract
status: draft
created: 2026-08-10
updated: 2026-08-15
---

<!-- canonical_owner: step-reference-contract / spec_logical_division: cross_cutting_contract（ACT-SPEC-002 rationale より） -->

# STEP Reference Contract

## 目的

STEP reference の構造、開始条件、結果、証拠、完了確認、べき等性を定義する。
DEC-011（STEP resume point と会話記憶非依存）の実装詳細を正規所有する。

## STEP reference 構成要素

- Purpose: 当該STEP の目的
- Input Resolution: 必要入力の解決方法（durable state優先順位に従う）
- Preconditions: 開始条件
- Procedure: 実行手順
- Result: 実行結果
- Evidence: 実行証拠
- Completion Verification: 完了確認基準
- Resume-Idempotency: 再開時のべき等性保証

### 標準見出し形式（機械検査可能な標準見出し群）

8要素は機械検査可能な標準見出し群として確定する。
新規作成する STEP reference の標準形式は `### Purpose`、`### Input Resolution`、`### Preconditions`、`### Procedure`、`### Result`、`### Evidence`、`### Completion Verification`、`### Resume-Idempotency` の8見出しである（見出し文言を固定し、翻訳、alias を持たない）。

現行実装には次の表現変種が存在し、いずれも8要素を含む点で等価である。

| 変種 | 形式 | 該当例 |
|---|---|---|
| h3 見出し形式（標準） | `### Purpose` 〜 `### Resume-Idempotency` | Wave 2 移行の Workflow Skill（req-define、req-save、spec-save、case-run、case-update、case-auto、intake-promote、learning-promote、backlog-review 等） |
| h2 見出し形式 | `## Purpose` 〜 `## Resume-Idempotency` | Wave 1 移行の case-open、case-close の一部 reference |
| STEP 見出し + リスト形式 | `## STEP-N` 見出し配下に `- **Purpose**:` 等のリスト | inspect-promote |

既存変種から標準形式への移行は必須としない（要素群の等価性をもって準拠とみなす）。
STEP model 対象外型（capture-only 型、read-only-diagnostic 型）の工程一覧は resume point を持たないため、本形式の適用対象外である。

## STEP transition

Workflow Skill の SKILL.md（control plane）が所有する。
reference 間で重複定義しない。

## STEP 識別子

workflow 内安定識別子。
command 固定番号とは区別する。
