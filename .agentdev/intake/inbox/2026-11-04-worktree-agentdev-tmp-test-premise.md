# worktree での .agentdev/tmp 前提テスト（req-id-roundtrip ENOENT）

## 概要

`req-id-roundtrip.test.ts` が `mkdtemp(join(process.cwd(), ".agentdev/tmp/..."))` を前提とし、worktree（.agentdev 未整備）で ENOENT になる。worktree での full suite 実行時に環境依存 fail として毎回顕在化する。整備方針（worktree への tmp dir 事前作成、またはテスト側の自動作成）の検討候補。

## 根拠

- 観測元: PR #3904 本文 `## Findings / Capture候補`（### intake 第2項）、Issue #3902（case-close 対応記録コメント 6617043300）
- 元テキスト（PR 本文から逐語）:
  - 「**worktree での `.agentdev/tmp` 前提テスト**: `req-id-roundtrip.test.ts` が `mkdtemp(join(process.cwd(), ".agentdev/tmp/..."))` を前提とし、worktree（.agentdev 未整備）で ENOENT。worktree での full suite 実行時に環境依存 fail として毎回顕在化する。整備方針（worktree への tmp dir 事前作成 or テスト側の自動作成）の検討候補」
- case-close 実測: merge 直前 HEAD 9680a8eb1 と baseline afd9e0607（detached worktree）の双方で同一 error を再現（pre-existing 分類・環境依存）。`.agentdev/tmp/` はメインリポジトリ側では gitignore 管理対象の実行時領域であり worktree へ未伝播
