# Intake Item: command の workflow 節の残る非標準順序ラベル（工程-N）

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-run 実装（順序ラベル3変種統一の棚卸し）
- capture 分類: intake（具体的検討候補）

## 問題

`src/opencode/commands/agentdev/intake-capture.md`（工程-1〜5）と `src/opencode/commands/agentdev/intake-from-github.md`（工程-1〜8）の公開順序要約が Command 標準（`### Step N` 形式、command-file-format SPEC）に適合しない。対応 Workflow Skill 側（agentdev-workflow-intake-capture / intake-from-github）は PR #2153 で STEP-N 形式へ統一済み。

## 推奨対応

command 定義と commands_e2e.test.ts 期待値は OU-003 系の管理対象のため、そちらの再構成時に `### Step N` 形式へ揃える。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (Findings / Capture候補 セクション intake 2)
