---
title: STEP Reference Contract
status: draft
created: 2026-08-10
updated: 2026-08-10
spec_logical_division: cross_cutting_contract
canonical_owner: step-reference-contract
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

## STEP transition

Workflow Skill の SKILL.md（control plane）が所有する。reference 間で重複定義しない。

## STEP 識別子

workflow 内安定識別子。command 固定番号とは区別する。
