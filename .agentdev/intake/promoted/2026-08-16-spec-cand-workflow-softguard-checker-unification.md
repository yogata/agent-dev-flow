# Workflow Skill soft guard 機械検査の二重定義解消（lint_skills AG-004 と check_workflow_preventive item 3 の検出語統一）

## 観測内容

Workflow Skill soft guard の機械検査は lint_skills.ts（AG-004 簡潔トリガー項「単独起動」）と check_workflow_preventive.ts（リテラル「soft guard」）の二重定義状態にある。agentdev-skill-authoring SPEC「Workflow Skill Soft Guard（REQ-027-002）」節が簡潔トリガー項を正とする以上、両 checker の検出語を簡潔トリガー項へ揃えることが望ましい。

## 影響

- 同一の soft guard 契約を2つの checker が異なる検出語で検証するため、SPEC と checker の検証結果が乖離する
- 後述の check_workflow_preventive item 3 のリテラル要求が AG-004 SPEC と矛盾する検証不通過を生む（intake-2026-08-16-ou002-checker-softguard-literal-requirement.md と統合候補）

## 課題

check_workflow_preventive item 3 の検出語を簡潔トリガー項方式へ揃える checker 更新を個別 Issue 化する。SPEC 本文の確定は spec-save 手続きの範囲。

## 既存要件・成果物との関連

- 対象: check_workflow_preventive.ts、lint_skills.ts（AG-004）
- SPEC: agentdev-skill-authoring「Workflow Skill Soft Guard（REQ-027-002）」節

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2185 (Issue #2180 / OU-002, Epic #2178 Wave 2) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-workflow-softguard-checker-unification.md
