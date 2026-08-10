---
title: Workflow Skill Model
status: draft
created: 2026-08-10
updated: 2026-08-10
spec_logical_division: cross_cutting_contract
canonical_owner: workflow-skill-model
---

<!-- canonical_owner: workflow-skill-model / spec_logical_division: cross_cutting_contract（ACT-SPEC-001 rationale より） -->

# Workflow Skill Model

## 目的

Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約を定義する。
DEC-010（責務3層分化と1:N分割原則）の実装詳細を正規所有する。

## Command 責務

公開interface（入出力契約・ガードレール）、workflow dispatch。workflow 実装本体は所有しない。

## Workflow Skill 責務

workflow 実装本体。SKILL.md = control plane（STEP transition・STEP間参照）、STEP = resume point 単位。
1:1 または 1:N で Command に対応する。1:N 分割基準: 制御構造に実質差異がある場合に分割評価。
operation 差だけの不必要分割は回避。

## Capability Skill 責務

複数workflow 共通能力。workflow 固有STEP から横断抽出。配置・参照契約は REQ-002-017 に従う。

## 依存方向

Command → Workflow Skill（名レベル参照）→ STEP reference（references/ 配下）。
Workflow Skill → Capability Skill（名レベル参照）。循環依存禁止。

## artifact-contracts.md からの委譲

artifact-contracts.md の肥大化シグナル（500行超）に対応し、Workflow Skill 固有契約は本SPEC へ委譲する。
