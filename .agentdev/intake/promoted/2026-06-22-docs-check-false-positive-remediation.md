# docs-check 偽陽性問題の是正（case-run references チェッカー・worktree source-projection-sync）

## 観測

`/repo/docs-check` において、2 つの偽陽性 NG が報告され続けている。いずれも checker 側のコンテキスト考慮不足・環境起因の問題。

### 偽陽性一覧

1. **case-run references checker 誤判定**（`reference-path-existence` ルール）: `src/opencode/commands/agentdev/case-run.md` に記載された `references/worktree-operations.md` が、case-run.md のファイル位置からの相対パスと誤解され「実在しない」と判定。本来は agentdev-git-worktree スキル内の `references/` ファイルを指すコンテキスト依存参照。
2. **worktree での source-projection-sync 偽陽性**: Worktree (`.worktrees/1000-feature`) 内で `source-projection-sync` ルールが 27 件 NG を報告。原因は Windows + junction 環境の worktree で `.opencode/skills/agentdev-*` の junction link が未伝播。Main repo では 0 件になる偽陽性。

## 影響

- docs-check が意図的ではない文脈で偽陽性 NG を出し続け、本当の NG が埋もれるノイズになる
- QG-3/QG-4 判定時に毎回エージェントが手動で「pre-existing で Stream B 由来ではない」と分類する手間が発生
- worktree で `/repo/docs-check` を実行する case-run/case-close のローカル検証で常に 27 件の NG が報告される

## 課題

### case-run references checker
- 対応方針の選択: (a) checker 側のコンテキスト考慮機能追加、(b) コマンドファイル側でスキル references を完全修飾で記述、(c) 自然文表現に変更して誤検出を回避
- 他のコマンド・スキルファイルで同様のパターン（コンテキスト依存参照）が潜在しているか確認

### worktree source-projection-sync
- 対応方針の選択: (a) `check_integrity.ts` の `source-projection-sync` ルールが worktree 実行を検知して skip する改良、(b) 運用回避（main repo で再実行）の継続
- 改良コストと運用コストのトレードオフ評価
- 類似の「環境由来の偽陽性」パターンが他ルールでも潜在している可能性の確認

## 既存要件との関連

- docs-check の整合性検査（REQ-0108 関連）
- 既知問題記載: `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`・`references/subagent-protocol.md`

## 根拠

- 元 inbox item:
  - `2026-06-21-issue1000-case-run-references-checker-misjudge.md`
  - `2026-06-21-issue1000-docs-check-worktree-false-positive.md`
- Issue #1000
