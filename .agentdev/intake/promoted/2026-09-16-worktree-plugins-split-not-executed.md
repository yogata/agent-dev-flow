# worktree で bun test plugins 分割（.opencode/plugins）が junction 未伝播により不在

## 観測内容

worktree 環境では `.opencode/plugins` が junction 未伝播のため存在せず、bun test 3 分割正規形の plugins 分割（`bun test ./.opencode/plugins/ ./scripts/`）が `./scripts/` のみ実行となる。動作としては妥当だが、plugins 分割が実行されないことが実行ログから読み取りにくく、検証カバレッジの見落としリスクがある（Case #2831/#2846 で観測）。

## 影響

- worktree 実行時の検証カバレッジの見落としリスク（検出自体は main 側 full-audit で担保されているため実害は限定的）

## 課題（対応候補と判断材料）

- worktree 実行時の plugins 分割の代替手段（main root から `--root` または cd による plugins 対象の実行等）を bun test 正規形の運用注記に明示する
- または worktree 前提での分割正規形の環境差を QG-4 reference に補足する
- **統合候補**: 同一ドメイン（bun test 正規形の環境前提）の intake item「bun install がリポジトリルート package.json 不在で実行不能」（2026-09-16）と単一 RU への統合を backlog-review で検討すること

## 既存要件との関連

- REQ-060 系（bun test 実行形態統一、RU-0003 由来）・QG-4 reference: 環境差補足の対象契約

## 根拠

- 観測元: PR #2876 本文（Case #2831）、PR #2879 本文（Case #2846）の bun test 3 分割実行記録
- 観測時 commit: PR #2876/#2879 head
- 現状: worktree は `.opencode/plugins` 不在のため plugins 対象 0 件で分割実行が成立（検出自体は main 側 full-audit で担保）
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: PR 実行記録 2 件で裏付け、明記対象が具体。優先度低）
