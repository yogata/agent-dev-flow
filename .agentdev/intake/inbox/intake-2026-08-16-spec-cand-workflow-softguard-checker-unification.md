# Intake Item: Workflow Skill soft guard 機械検査の二重定義解消（lint_skills AG-004 と check_workflow_preventive item 3 の検出語統一）

## 発生源

- PR: #2185 (Issue #2180 / OU-002, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

Workflow Skill soft guard の機械検査は lint_skills.ts（AG-004 簡潔トリガー項「単独起動」）と check_workflow_preventive.ts（リテラル「soft guard」）の二重定義状態にある。agentdev-skill-authoring SPEC「Workflow Skill Soft Guard（REQ-027-002）」節が簡潔トリガー項を正とする以上、両 checker の検出語を簡潔トリガー項へ揃えることが望ましい。

## 推奨対応

check_workflow_preventive item 3 の検出語を簡潔トリガー項方式へ揃える checker 更新を個別 Issue 化する。SPEC 本文の確定は本 case-close の責務外とし backlog 化する。

## 関連

- Issue: #2180 (CLOSED), Epic: #2178
- PR: #2185 (SPEC確定候補 セクション 1)