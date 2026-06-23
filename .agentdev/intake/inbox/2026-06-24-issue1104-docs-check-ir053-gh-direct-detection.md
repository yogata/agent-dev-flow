# /repo/docs-check IR カタログに gh 直接記述検出ルールが不在

## 発生源

- Issue: #1104
- PR: #1107 (merged, squash b17d3b1)
- 発生日: 2026-06-24

## 内容

`/repo/docs-check`（repo-agentdev-integrity）の IR カタログ（IR-001〜IR-052）には、gh コマンド直接記述を検出する機械的ルールが存在しない。

Issue #1104 では inspect-skills 診断観点として gh 直接記述検出を追加し、command/skill 配下で委譲漏れを検出できるようにした（agentdev-inspect-skills SKILL.md に `gh-direct-invocation-leak` ラベル、agentdev-gh-cli SPEC に検出スコープ・除外対象を正典化）。

しかし inspect-skills はエージェント実行型の検出であり、`/repo/docs-check` による自動・機械的担保とは独立している。gh 直接記述の委譲漏れを CI 等の自動実行で継続的に検出するには、IR-053 として IR カタログ（`docs/specs/integrity-rule-catalog.md`）への登録と、`check_integrity.ts` への実装が必要。

現状では inspect-skills を都度実行しない限り委譲漏れは検出されず、新規 command/skill 追加時に gh 直接記述が紛れ込む false negative リスクが残る。

## 推奨対応先

別 Issue として切り出すことを推奨（本 Issue #1104 のスコープは inspect-skills 検出辞書の正典化まで）。

作業候補:
- IR カタログ（`docs/specs/integrity-rule-catalog.md`）に IR-053「gh 直接記述検出」を登録
- `check_integrity.ts`（repo-agentdev-integrity）に検出実装を追加
- スキャン対象: `src/opencode/commands/agentdev/*.md`, `src/opencode/skills/agentdev-*/**/*.md`
- 除外対象: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（REQ-0149-003 許容ファイル）
- 検出パターン: `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`（inspect-skills 診断観点と整合）

## 現在の追跡状態

- PR #1107 Findings / Capture候補に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
