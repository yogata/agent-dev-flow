# /repo/docs-check IR カタログに gh 直接記述検出ルールが不在

## 観測内容

`/repo/docs-check`（repo-agentdev-integrity）の IR カタログ（IR-001〜IR-052）には、gh コマンド直接記述を検出する機械的ルールが存在しない。
Issue #1104 では inspect-skills 診断観点として gh 直接記述検出を追加し（agentdev-inspect-skills SKILL.md に `gh-direct-invocation-leak` ラベル、agentdev-gh-cli SPEC に検出スコープ・除外対象を正典化）した。
しかし inspect-skills はエージェント実行型検出であり、`/repo/docs-check` による自動・機械的担保とは独立している。

## 影響

inspect-skills を都度実行しない限り委譲漏れは検出されず、新規 command/skill 追加時に gh 直接記述が紛れ込む false negative リスクが残る。
gh 直接記述の委譲漏れを CI 等の自動実行で継続的に検出するには、IR-053 としての登録と実装が必要。

## 課題

gh 直接記述検出を機械的ルール（IR-053）として IR カタログへ登録し、check_integrity.ts へ実装する。

## 既存要件との関連

- Issue #1104、PR #1107（merged, squash b17d3b1）
- 正典化済み: agentdev-inspect-skills SKILL.md（`gh-direct-invocation-leak` ラベル）、agentdev-gh-cli SPEC（検出スコープ・除外対象）
- 除外対象: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（REQ-0149-003 許容ファイル）

## 対応方針の方向性

- IR カタログ（`docs/specs/integrity-rule-catalog.md`）に IR-053「gh 直接記述検出」を登録する
- `check_integrity.ts`（repo-agentdev-integrity）に検出実装を追加する
- スキャン対象: `src/opencode/commands/agentdev/*.md`, `src/opencode/skills/agentdev-*/**/*.md`
- 検出パターン: `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)`（inspect-skills 診断観点と整合）
