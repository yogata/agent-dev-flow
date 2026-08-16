# Intake Item: case-run command の孤立した ### Step 7-1 見出し

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-run 実装（順序ラベル統一の棚卸し）
- capture 分類: intake（具体的検討候補）

## 問題

`src/opencode/commands/agentdev/case-run.md` の workflow 節に親 Step 7 を持たない `### Step 7-1` が単独で存在し、command-file-format SPEC の連番規則と不整合。

## 推奨対応

command 側の修正対象として連番規則への適合（親見出しの復元または番号の振り直し）を実施する。Workflow Skill 側（agentdev-workflow-case-run）の対応工程識別子（STEP-S5-1）との対応表記も併せて確認する。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (Findings / Capture候補 セクション intake 3)
