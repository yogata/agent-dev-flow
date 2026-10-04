# 採用済み成果物: textlint gate の worktree 単独実行時の --root パス形式注意と 0 inspected PASS の扱い

## 観測内容

textlint gate（agentdev-textlint-guard gate.ts）を worktree 内で単独実行する場合の運用上の注意。

1. vendor 依存の生成（plugin package で bun install + build:engine）が前提となる
2. `--root` に Git Bash 形式パス（`$(pwd)` の `/c/...`）を渡すと対象解決が空振りして「0 inspected で PASS」になる

検査対象 0 件の PASS を品質確認として扱わない運用上の注意。

## 影響

対象解決の空振りが検証の偽陽性（0 件検査での PASS）を生み、品質ゲートとしての実効性を損なう可能性。現行 gate.ts は対象 0 件を異常扱いしない（PASS メッセージを出す）。

## 課題

対象解決 0 件時の fail-closed 化（checker 側の異常扱い）、または実行手順側の Windows 形式パス明示の規律化の対応候補。優先度は中程度（運用回避可能だが検査基盤の健全性に関わる）。

## 既存要件との関連

- agentdev-textlint-guard gate（REQ-053 系・REQ-010-074/075 系の textlint 統制）
- worktree 検証時の textlint 実行手順（agentdev-git-worktree references）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-textlint-gate-worktree-root-path-zero-inspected-pass.md`（分類採用により削除済み）
- 観測元: PR #3417（Issue #3412・DEL-3412-1）本文 Findings / Capture候補 intake セクション
- captured_at_commit: 469af6c5f54a3f68d225913ab470d6609eff8234
- 現行源検証（intake-promote・ad6e8341・読取のみ）: gate.ts に対象 0 件時の異常扱い（fail-closed）が未実装であることを確認（L76 の PASS メッセージ生成のみ）
