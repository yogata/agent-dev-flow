---
title: "`agentdev-git-worktree-test-fallback` Design"
status: draft
created: "2026-08-09"
updated: "2026-09-02"
---
<!-- ADF-COVERS(implementation): REQ-018-001, REQ-018-002 -->
<!-- ADF-COVERS(implementation): REQ-057-012 -->
<!-- ADF-COVERS(implementation): REQ-057-014 -->

# `agentdev-git-worktree-test-fallback` Design

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

本手順は ir035 worktree 誤検出、check_extensions の cwd 依存・順序依存・worktree junction 失敗等、6件の反復観測クラスに根拠する。
個別是正（checker 実装修正）は本 Design の手順確定とは分離して実施できる。

## junction 投影残滓（stale junction）の自己修復

`.opencode/skills/` 配下の junction セットは、src 側の skill 追加・削除の後に再構築されるまで次の状態に陥り得る。
状態の判定は次のとおり行う。

- 未構築: `src/opencode/skills/` 配下に存在する skill 名に対応する junction が `.opencode/skills/` 配下に存在しない
- stale 残存: `.opencode/skills/` 配下に存在する junction のリンク先が存在しない（src 側で削除済みの skill 名に対応する junction が残存する）

未構築・stale 残存のいずれも、当該環境での skills_structure 系テストを環境依存 fail にし、N/M 件数突合と QG-4 判定にノイズを与える。
帰属確認手順で環境起因と判定された fail のうち、本節の状態判定に該当するものは、検査側の修正ではなく次の修復を先に実施する。

修復は junction セットの再構築（`install-consumer-opencode.ps1 -Mode apply` の再実行）によって行う。
`.opencode/skills/*` は gitignore 対象の局所運用タスクであり、修復は PR 成果外として実施する。

## 関連

- REQ-018（worktree 構造的制約とテスト fallback）
- agentdev-git-worktree skill（worktree ライフサイクル管理を所管）
