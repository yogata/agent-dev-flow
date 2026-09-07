---
id: intake-20260907-issue-management-reference-break-candidate-2638
title: agentdev-workflow-case-open から agentdev-issue-management への案内で参照先に「識別子中心記載ガイドライン」本文が不在（参照切れ候補）
created: 2026-09-07
status: inbox
---

## 概要
- PR: #2643（Issue #2638・Epic #2633 Wave 1・OU-005 case-open 事前状態の実測確認規律の配布物反映）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

`agentdev-workflow-case-open` の `references/issue-body-and-execution-contract.md` 2-3 は「詳細・記載例は `agentdev-issue-management` 参照」と案内するが、参照先スキル内に識別子中心記載ガイドラインの本文が確認できない（`rg "識別子中心" src/opencode/skills/agentdev-issue-management` で 0 件）。PR 本文では参照切れ候補として追跡 Issue 化が提案されている。

## 変更候補

- 参照先実在確認: `agentdev-issue-management` の SKILL.md / references 配下に識別子中心記載のガイドライン本文が存在するかを機械検索で確認する
- 不在が確定した場合: (a) 当該案内文の参照先を実在する正規参照点へ修正、(b) または `agentdev-issue-management` 側に不足するガイドライン本文を新設する。いずれを選ぶかは参照の意味（案内 vs 正規所有）で判断する
- 追跡 Issue 化の要否判断（参照切れは意味整合性の診断対象にもなり得るため inspect-docs との重複確認）

## 関連
- Issue #2638（クローズ済み。OU-005）
- PR #2643（merge commit 2bbad7ee）
- `agentdev-workflow-case-open/references/issue-body-and-execution-contract.md`（STEP-2 詳細）
- `agentdev-issue-management` SKILL.md（参照先候補スキル）
