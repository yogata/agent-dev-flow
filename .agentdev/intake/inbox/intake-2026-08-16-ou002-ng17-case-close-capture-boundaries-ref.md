# Intake Item: N17 command-capture-duty — case-close.md（配布物コマンド）への capture-boundaries 参照追加

## 発生源

- PR: #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2)
- 発生 phase: case-run 検証（check_integrity NG 由来分類）
- capture 分類: intake（配布物是正候補）

## 問題

`src/opencode/commands/agentdev/case-close.md` が capture-boundaries 参照の記述を持たない（#2071 以降欠落、command-capture-duty として NG 検出）。OU-002 では配布物コマンドの編集が範囲外のため承認済み baseline entry（provenance: 実欠陥）で暫定管理している。Wave 2 case-close の QG-4 検証では、baseline 登録パス（`src/opencode/commands/agentdev/case-close.md`）と main リポジトリ junction 環境の検出パス（`.opencode/commands/agentdev/case-close.md`、src/ への junction で同一実体）の bucket key 不一致により、機械 delta 上「新規かつ未管理 1件」と計上されることを確認済み（2026-08-15 report-5 に同一パスで観測済みのため N17 は新規ではない）。

## 推奨対応

OU-007 配布物是正の流れで case-close.md へ capture-boundaries 参照を追加し、baseline entry を除去する。併せて baseline entry のパス bucket key を検出パス表記（または checker 側のパス正規化）へ揃える検討を行う。

## 関連

- Issue: #2136 (CLOSED), Epic: #2134
- PR: #2151 (Findings / Capture候補 セクション intake 3、Level 2 rebase note Findings)
- baseline: .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json N17 entry
- 観測記録側: intake-2026-08-16-ou007-worktree-selfcheck-ng17-preexisting.md（#2152 close 時点の観測。#2151 マージ済みのため promote 時に reject 判定候補）
