# case-run command の孤立した ### Step 7-1 見出し

## 観測内容

`src/opencode/commands/agentdev/case-run.md` の workflow 節に親 Step 7 を持たない `### Step 7-1` が単独で存在し、command-file-format SPEC の連番規則と不整合である。

## 影響

- 連番規則違反の見出し構造が残存し、参照解決・機械検査の妨げとなる

## 課題

command 側の修正対象として連番規則への適合（親見出しの復元または番号の振り直し）を実施する。Workflow Skill 側（agentdev-workflow-case-run）の対応工程識別子（STEP-S5-1）との対応表記も併せて確認する。

## 既存要件・成果物との関連

- 対象: src/opencode/commands/agentdev/case-run.md workflow 節
- SPEC: command-file-format 連番規則
- 対応: agentdev-workflow-case-run STEP-S5-1

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 3
- 元 item: intake-2026-08-16-ou010-case-run-orphan-step7-1-heading.md
