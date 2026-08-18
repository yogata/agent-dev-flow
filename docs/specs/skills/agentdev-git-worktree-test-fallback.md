---
title: "agentdev-git-worktree 構造系テスト fallback 契約"
status: draft
created: "2026-08-09"
updated: "2026-08-18"
---

# agentdev-git-worktree 構造系テスト fallback 契約

agentdev-git-worktree skill に関連する構造系テスト（commands_e2e、skills_structure、templates_structure 等）の worktree 環境向け fallback 契約。
worktree junction 未設定環境でのテスト実行保証と、worktree 固有の構造的制約の明示を扱う。

## fallback 対象

- 構造系テスト（commands_e2e、skills_structure、templates_structure 等）は worktree junction 未設定時に src/opencode/ への fallback で実行する
- worktree の独立 working tree に起因する構造的制約を次のとおり取り扱う
  - gitignore 対象ファイル受け渡し不可（必要に応じて `git add -f` を使用）
  - junction 依存 checker は junction 未設定時に skip する

## 帰属確認手順（worktree・実行形態環境差の検査失敗）

worktree・実行形態の環境差（junction 未伝播、node_modules 未伝播、実行順序依存）に由来する検査失敗の帰属確認は、次の二段階手順を標準とする。

1. 単体再実行: 当該検査のみを単独で再実行し、恒常失敗か環境依存かを切り分ける
2. base/main 再現: 単体再実行で残存する失敗を main 等価環境で再現確認し、再現しない場合は環境起因として扱う

main 等価再現の手順は次のとおりである。

- 一時 junction: worktree 側へ main の `.opencode/` 等価の junction を一時設定して再実行する
- src 側代替経路: `--profile source` 等の実行プロファイルで src/opencode/ 側の資産を直接参照して再実行する
- 依存再導入: `bun install --cwd` で当該ツリーの node_modules を再設定して再実行する

本手順は ir035 worktree 誤検出、check_extensions の cwd 依存・順序依存・worktree junction 失敗等、6件の反復観測クラスに根拠する。個別是正（checker 実装修正）は本 SPEC の手順確定とは分離して実施できる。

## 関連

- REQ-018（worktree 構造的制約とテスト fallback）
- agentdev-git-worktree skill（worktree ライフサイクル管理を所管）
