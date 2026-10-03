---
title: Windows checker 実行時の --root 引数への MSYS 形式パス指定破損
created: 2026-10-03
updated: 2026-10-03
---

# Windows checker 実行時の --root 引数への MSYS 形式パス指定破損

## 知識内容

Windows 実行環境で checker（integrity 検査・traceability check 等）の `--root` に MSYS 形式パス（`/c/Users/...`）を渡すと、Windows プログラム側のパス解決では `/c/` がドライブ接頭辞として解決されず、実在しない root として扱われる。checker の fail-closed 契約により検査対象が見かけ上全件欠落するため、走査が静かに空振りし、「実行できた検査」の結果として無効な証跡が残る。正しい形式は Windows 形式絶対パスであり、`C:/Users/...` 形式の forward slash 記法を推奨する。加えて、bash から引用符なしの backslash 形式（`C:\Users\...`）を渡すと bash の escape 解釈で backslash が落ちてパスが破損するため、引数段階では引用符付きの backslash 形式または forward slash 形式で渡す。

## 適用条件

- Windows + Git Bash（MSYS）環境で、checker・検査スクリプトの `--root`（repoRoot 明示指定）にパスを渡す場合
- checker stdout の機械可読 JSON を検証記録として退避・突合する場合（検査対象件数の突合で欠落を検知する）

## 適用対象

- `--root` を受け取る checker 全般（check_distribution_boundary.ts、check_changed_docs.ts、check_knowledge_docs.ts、agentdev-traceability の coverage / impact / check 等）
- worktree を検査対象とする main root 実体起動の読取系 checker 実行

## 根拠

- worktree 操作手順の `--root` パス形式規約（`src/common/skills/agentdev-git-worktree/references/worktree-operations.md`「main root 実体 + --root 指定による読取系 checker 実行手順」の手順 3）
- REQ-012-058（traceability 標準機能の運用手順は、Windows 実行環境でのパス引数形式制約の注意を含めて配布 skill の運用文書が保持する）

## 関連知識

- [windows-git-bash-inline-content-corruption.md](windows-git-bash-inline-content-corruption.md)
- [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md)
- [checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md)
