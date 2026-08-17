# command の workflow 節の残る非標準順序ラベル（工程-N）

## 観測内容

`src/opencode/commands/agentdev/intake-capture.md`（工程-1〜5）と `src/opencode/commands/agentdev/intake-from-github.md`（工程-1〜8）の公開順序要約が Command 標準（`### Step N` 形式、command-file-format SPEC）に適合しない。対応 Workflow Skill 側（agentdev-workflow-intake-capture / intake-from-github）は PR #2153 で STEP-N 形式へ統一済みである。

## 影響

- command-file-format SPEC の順序ラベル様式に対する違反状態が intake 系 2 コマンドに残存する

## 課題

command 定義と commands_e2e.test.ts 期待値は OU-003 系の管理対象のため、そちらの再構成時に `### Step N` 形式へ揃える。

## 既存要件・成果物との関連

- 対象: src/opencode/commands/agentdev/intake-capture.md、intake-from-github.md、commands_e2e.test.ts 期待値
- SPEC: command-file-format（`### Step N` 形式）
- 実績: PR #2153（Workflow Skill 側は統一済み）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou010-command-workflow-section-nonstandard-labels.md
