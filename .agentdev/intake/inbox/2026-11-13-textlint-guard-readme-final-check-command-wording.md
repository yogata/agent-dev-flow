# textlint-guard README「最終検査の実行」節のコマンド表記揺れ（bun run 形式と bun 直実行）

## 観測事実

- Epic 4026 Wave 2（PR 4042、Issue 4030 対応）の本文 Findings で、textlint-guard README の「最終検査の実行」節のコマンド例（`bun run` 形式）と実際の推奨実行形態（`bun <path>` 直実行）の表記揺れが報告された。当該 PR では無変更（検証は `bun <path>` 形式で実行・合格）。

## 具体的な修正対象

- textlint-guard plugin README（src/opencode/plugins/agentdev-textlint-guard/ 配下および配布物側）の最終検査コマンド例を、実際の推奨実行形態（`bun <path>` 直実行）へ統一する。docs-chore 系の小規模変更として実施できる候補。

## 関連

- Epic 4026・PR 4042 本文 Findings / Capture候補（Issue 4030 対応）
- agentdev-textlint-guard plugin README
