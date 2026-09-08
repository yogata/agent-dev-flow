---
id: intake-20260908-pr-create-number-contract-migration-confirm-2691
title: pr_create の number フィールド拒否（入力契約厳格化）に対する Local 版移行時の対象特定手段確認
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2691（Issue #2687・Epic #2686 Wave 1・OU-001 GitHub 版操作契約実装）
- 発見経路: case-run 互換性確認 → case-close Capture 回収（PR 本文「Findings/ Capture候補」セクション由来）

## 内容

pr_create は入力契約厳格化（操作単位の入力定義、REQ-011-028）により number フィールドを拒否するようになった。現時点で number を渡す正規呼び出し元は存在しない（agentdev-case-run-execution-adapter の手順文は title/body/base/head/draft のみ）が、子 Issue #2689（OU-002）の ADF 内部呼出元移行時に Local 版 runner の pr_create 対象特定ヒント（従来 number で渡していた）の代替手段を確認する必要がある。

## 変更候補
- #2689 の呼出元移行作業での確認項目として扱う（Local 版 runner の pr_create 対象特定ヒントの代替手段を Design 既存の写像規則で確認）

## 関連
- Issue #2687（クローズ済み。OU-001）
- Issue #2689（OU-002: ADF 内部呼出元の Comment 操作移行と issue_comment 廃止。pending）
- PR #2691（squash merge commit af697092）
