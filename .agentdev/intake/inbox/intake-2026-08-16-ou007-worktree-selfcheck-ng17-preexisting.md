# Intake Item: worktree 自己実行時の check_integrity ng 17件（audits/baselines 相対リンク切れ等）

## 発生源

- PR: #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2)
- 発生 phase: case-run 検証（check_integrity worktree 実行）
- capture 分類: intake（pre-existing 記録。HEAD と同一集合のため #2152 起因ではない）

## 問題

docs/specs/integrity/audits/、baselines/ 配下の相対リンク切れ（REQ-028.md、DEC-013.md、pre-audit-baseline-20260811.md 等）ほか、worktree 自己実行で ng 17件が残存する（#2152 の AUTOGEN 鮮度 2件解消後の残り。HEAD と同一集合）。

## 推奨対応

OU-002（Issue #2136、PR #2151）がまさにこの broken reference 一掃（legacy 分類 fixed-here 10、承認済み baseline 登録含む）を実施済み。PR #2151 は Wave 2 case-close で Level 1 rebase 失敗により case-auto Level 2 へエスカレーション中のため、#2151 のマージ完了をもって解消見込み。intake-promote 判定時点で #2151 が main 入りしていれば本 item は reject 可能。

## 関連

- Issue: #2141 (CLOSED), Epic: #2134
- PR: #2152 (Findings / Capture候補 セクション intake 3)
- 解消実施中: PR #2151 (Issue #2136, OPEN)
