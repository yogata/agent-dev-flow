---
title: Windows 環境の bash・Windows バイナリ間パス形式解釈差と checker --root 指定破損
created: 2026-10-03
updated: 2026-11-15
---

# Windows 環境の bash・Windows バイナリ間パス形式解釈差と checker --root 指定破損

## 知識内容

Windows 実行環境で checker（integrity 検査・traceability check 等）の `--root` に MSYS 形式パス（`/c/Users/...`）を渡すと、Windows プログラム側のパス解決では `/c/` がドライブ接頭辞として解決されず、実在しない root として扱われる。checker の fail-closed 契約により検査対象が見かけ上全件欠落するため、走査が静かに空振りし、「実行できた検査」の結果として無効な証跡が残る。正しい形式は Windows 形式絶対パスであり、`C:/Users/...` 形式の forward slash 記法を推奨する。加えて、bash から引用符なしの backslash 形式（`C:\Users\...`）を渡すと bash の escape 解釈で backslash が落ちてパスが破損するため、引数段階では引用符付きの backslash 形式または forward slash 形式で渡す。

### bash と Windows バイナリ（git・bun・node）間のパス形式解釈差（追記）

bash から Windows バイナリへパスを渡す実行全般で、次の変異が観測されている（Windows・bun 1.3.6 実測環境の範囲とし、全 Windows 版への一般化はしない）。

- **POSIX パスの直接渡し**: bash の POSIX パス（`/tmp` 等）を git・bun へ直接渡すと Windows バイナリ側で誤解釈される。Windows バイナリへ渡す前に `cygpath -m` による mixed 形式（`C:/Users/...`）変換を前置する
- **bun install --cwd の相対パス**: 相対パス指定が機能せず ENOENT となる場合がある。絶対パス指定へフォールバックする
- **backslash 形 cwd での bun run**: モジュール解決に失敗する場合がある。forward slash 形 cwd と直接実行形式（`node_modules/.bin/<cmd>` 直接起動等）の組合せが安定経路となる
- **リダイレクト先の相対パス**: 検査の stdout / stderr 退避ファイルのリダイレクト先を cwd 相対で指定すると実行時 cwd に依存して逸脱し得る。絶対パスで指定する

## 適用条件

- Windows + Git Bash（MSYS）環境で、checker・検査スクリプトの `--root`（repoRoot 明示指定）にパスを渡す場合
- checker stdout の機械可読 JSON を検証記録として退避・突合する場合（検査対象件数の突合で欠落を検知する）
- bash から Windows バイナリ（git・bun・node）へパス引数・cwd・リダイレクト先を渡す実行全般（cygpath 変換・絶対パス指定・forward slash cwd・リダイレクト先絶対パスの各規律）

## 適用対象

- `--root` を受け取る checker 全般（check_distribution_boundary.ts、check_changed_docs.ts、check_knowledge_docs.ts、agentdev-traceability の coverage / impact / check 等）
- worktree を検査対象とする main root 実体起動の読取系 checker 実行
- bash と Windows バイナリを連結する全経路（検証・機械工程・委譲での bun install・bun run・退避リダイレクト等）

## 根拠

- worktree 操作手順の `--root` パス形式規約（`src/common/skills/agentdev-git-worktree/references/worktree-operations.md`「main root 実体 + --root 指定による読取系 checker 実行手順」の手順 3）
- REQ-012-058（traceability 標準機能の運用手順は、Windows 実行環境でのパス引数形式制約の注意を含めて配布 skill の運用文書が保持する）
- checker 実行契約（docs/designs/integrity/checker-execution-contracts.md L196-198）のパス引数の絶対パス構成標準
- bash・Windows バイナリ間のパス形式解釈差 4 変異の Case 観測（#3967 cygpath なし TEMP・#3972 退避リダイレクト相対パス・#3988 bun install --cwd 相対パス ENOENT・#4054 backslash 形 cwd での bun run モジュール解決失敗。backlog-review 2026-11-15 で追記）

## 関連知識

- [windows-git-bash-inline-content-corruption.md](windows-git-bash-inline-content-corruption.md)
- [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md)
- [checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md)
