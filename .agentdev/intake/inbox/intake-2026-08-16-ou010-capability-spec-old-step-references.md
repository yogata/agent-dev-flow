# Intake Item: Capability Skill・SPEC に残る旧 command 番号（Step N）への参照

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-run 実装（STEP 識別子実番号化に伴う解決先消失の棚卸し）
- capture 分類: intake（具体的検討候補、個別 Issue 化を推奨）

## 問題

OU-010 の実番号化で旧 command 番号の解決先が消失する参照のうち、本 Issue 対象範囲（16 Workflow Skill と scripts）外の残存:

- `agentdev-git-worktree/references/git-common-procedures.md`（case-close Step 9/9-1/9-2/4-1/4-2）
- `agentdev-gh-cli/references/standard-procedures.md`（case-close Step 4-0/4-2）
- `agentdev-quality-gates/references/*`（case-run Step 5-3/6/7/11-1）
- `agentdev-workflow-orchestration`（case-run Step 6 — 現行のどこにも存在しない stale 参照）
- `docs/specs/foundations/system.md`（各 command の旧 Step 番号記述）

注記: 挙げられた `agentdev-doc-diagnostics/references/diagnostic-routing.md`（inspect-docs 旧 Step 2〜13 表）は PR #2150（OU-008）のマージで解消済み（main で旧手順番号直参照 0 件を case-close が検証）。

## 推奨対応

command 再構成（OU-003 系）との整合を見ながら参照先更新の個別 Issue 化を推奨。stale 参照（workflow-orchestration の case-run Step 6）は優先的に除去する。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (Findings / Capture候補 セクション intake 1)
- 一部解消済み: PR #2150 (Issue #2142, CLOSED)
