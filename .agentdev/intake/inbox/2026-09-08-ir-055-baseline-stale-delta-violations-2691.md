---
id: intake-20260908-ir-055-baseline-stale-delta-violations-2691
title: IR-055 baseline が #2583 以降の配布物 .md 変更を未反映で delta 違反4件を発生させている
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2691（Issue #2687・Epic #2686 Wave 1・OU-001 GitHub 版操作契約実装）
- 発見経路: case-run TS-014 / bun test split 1 → case-close Capture 回収（PR 本文「Findings/ Capture候補」セクション由来）

## 内容

IR-055 baseline（.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json）が最終更新（1be0adb3, #2583）以降の配布物 .md 変更（#2630/#2646/#2647/#2668/#2675）を反映しておらず、新規 delta 違反4件（worktree-operations.md、agentdev-issue-management/SKILL.md、qg-4-final-acceptance.md）が main の integrity suite（bun test split1）を fail させ続けている。main 0d71056a 時点で発生する既知欠陥であり、PR #2691 は当該 .md を無変更のため本 PR 起因ではない（fail 由来分類: known-defect として case-close 検証差分へ記録済み）。

## 変更候補
- ir-055-baseline.json の再生成、または該当箇所の参照解消（配布物 .md 側の該当表現修正）を実施する
- baseline 更新漏れを検出するための仕組み（配布物 .md 変更 PR での IR-055 delta 前置確認等）の検討

## 関連
- Issue #2687（クローズ済み。OU-001）
- PR #2691（squash merge commit af697092）
- .opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json（最終更新 1be0adb3, #2583）
- #2630/#2646/#2647/#2668/#2675（baseline 未更新のまま配布物 .md を変更した PR 群）
