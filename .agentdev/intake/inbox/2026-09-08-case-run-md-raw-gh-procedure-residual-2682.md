---
id: intake-20260908-case-run-md-raw-gh-procedure-residual-2682
title: case-run.md の raw gh 手続き記述残存（L200/L216）の Custom Tool 操作名表記への統一
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2685（Issue #2682・Epic #2681 Wave 1・OU-001 I/O 境界系移管完了整合）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

docs/designs/commands/case-run.md L200/L216 に `gh pr view --json files`、`gh pr merge --squash` の現行文脈記述が残存する。case-run.md は stage 0（design-save commit 1a104944）の Design 適用対象外であり、OU-001 の zero-check (a)/(b) にも非該当のため PR #2685 では未修正。GitHub I/O 正規境界（Custom Tool `agentdev_gh`、REQ-011・custom-tool-contracts.md）への統一が完了した現行体系では、後続の移管仕上げ候補として処置が望ましい。

## 変更候補
- case-run.md L200/L216 の raw gh 手続き記述を Custom Tool 操作名（pr_changed_files / pr_merge 等）表記へ統一する
- 処置時は同一形式の既存書き換えパターン（stage 0 の case-close.md「現在の動作」セクション、PR #2685 の TS-006 zero-check 是正）を踏襲する

## 関連
- Issue #2682（クローズ済み。OU-001）
- PR #2685（squash merge commit 23721a2c）
- docs/designs/commands/case-run.md L200/L216
- docs/designs/responsibilities/custom-tool-contracts.md（正規所有 Design）
