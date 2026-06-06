---
discovered_at: 2026-06-07
source: intake-promote inbox scan（19件一括処理）
tags: [intake, skill-documentation, spec-gap]
---

# Skill 文書整備残（merge 失敗パターン・SPEC rule・Intake 形式重複）

## 内容

複数の Issue/PR で skill 文書の整備残が intake 候補として記録されているが、未回収のまま残っている。

### 1. Merge 失敗パターン未記載

`self-healing-and-errors.md`（skill配下）に merge 失敗パターンの記載がない。case-close Step 4 の squash merge リトライ・rebase workflow fallback が追加されたが、自己修復ガイドへの反映が漏れている。

### 2. SPEC workflow status rule 未記載

workflow status 追加禁止ルールが SPEC に未記載。guides には記載済みだが、SPEC（workflow-contracts.md, document-model.md）への状態モデル制約追記が親 agent の Step 10 で対応される予定だった。

### 3. Intake Item 形式重複

intake-capture と intake-from-github の Intake Item 形式が重複している。共通フォーマットを skill reference に切り出すことで更なる入口化が可能だが、該当 Issue のスコープ外とされていた。

**根拠**: Issue #574（learning 4件）、PR #554
