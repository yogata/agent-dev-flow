# intake: textlint gate の worktree 単独実行時の --root パス形式注意と 0 inspected PASS の扱い

## 内容

textlint gate（agentdev-textlint-guard gate.ts）を worktree 内で単独実行する場合の運用上の注意。

1. vendor 依存の生成（plugin package で bun install + build:engine）が前提となる
2. `--root` に Git Bash 形式パス（`$(pwd)` の `/c/...`）を渡すと対象解決が空振りして「0 inspected で PASS」になる

検査対象 0 件の PASS を品質確認として扱わない運用上の注意。対象解決 0 件時の fail-closed 化（checker 側の異常扱い）または実行手順側の Windows 形式パス明示の規律化候補。

## 根拠

- 観測元: PR #3417（Issue #3412・DEL-3412-1）本文 Findings / Capture候補 intake セクション
- 元テキスト: 「textlint gate を worktree 内で単独実行する場合、(1) vendor 依存の生成が前提となり、(2) --root に Git Bash 形式パス（$(pwd) の /c/...）を渡すと対象解決が空振りして「0 inspected で PASS」になる。検査対象 0 件の PASS を品質確認として扱わない運用上の注意」
- captured_at_commit: 469af6c5f54a3f68d225913ab470d6609eff8234
