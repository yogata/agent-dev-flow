# bash ツール永続シェルの cwd 保持による worktree 空ディレクトリ残留

## 背景

case-close の worktree 削除（git worktree remove）が Permission denied で部分失敗した後、`git worktree prune` で管理情報は削除できたが、空になった `.worktrees/{N}-{type}` ディレクトリが Device or resource busy で削除できず残留した（case 2791）。git worktree list からは消滅済み、ブランチ削除も完了しており、git 管理状態としては問題ない。

## 問題

- bash ツールが workdir パラメータで worktree 内を指定して実行した永続シェルセッションが、当該ディレクトリをカレントディレクトリ（またはハンドル）として保持し続ける
- worktree の git 管理情報削除後も OS レベルでディレクトリエントリが掴まれたままになり、rm -rf / rmdir が失敗する
- 削除手順（worktree-operations.md）にこの現象への言及がなく、完了判定を誤る可能性がある

## 望ましい変更

worktree 削除手順に次のいずれかを追記する: (1) 削除前に worktree 内を workdir として使用したシェルセッションの cwd をリポジトリルートへ明示的に移動（解放）する、または (2) 空ディレクトリ残留は git 管理状態（worktree list・ブランチ削除の完了）のみで完了判定し、残留を警告記録して処理を完了する。

## 対象範囲

- 対象: worktree を削除する全手順（case-close の worktree クリーンアップ等）、worktree 内を workdir に指定したシェル実行があった Case の削除工程
- 対象外: worktree の git 管理操作自体（remove / prune / ブランチ削除は既存手順どおり）、追跡済みファイルの削除（禁止事項は維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 「削除手順」へのシェルハンドル起因の残留と完了判定基準の追記 |
| knowledge | docs/knowledge/（新規知識文書候補） | 永続シェル cwd 保持による空ディレクトリ残留の切り分け知見 |

## 既存対策確認

- 確認結果: 部分的に既存（Permission denied 時のリトライ 3 回・リトライ前の復元は規定済み）
- 該当ファイル: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md「削除手順」
- ギャップ分類: fix gap
- ギャップ詳細: リトライで解決しないシェルハンドル起因の残留パターンと「git 管理状態のみで完了判定」する基準が未記載

## 制約

- 完了判定を git 管理状態（worktree list からの消滅・ブランチ削除）で行う（空ディレクトリの物理削除を完了条件にしない）
- 追跡済みファイルの削除禁止（既存規定を維持）

## 受け入れ条件

- [ ] worktree 削除手順にシェル cwd 解放または残留許容の判断基準が追記されている
- [ ] 空ディレクトリ残留時の警告記録と git 管理状態による完了判定が明記されている

## 元learning item / 根拠

- 要約: bash ツール永続シェルの cwd 保持により worktree 削除後に空ディレクトリが残留する事象と、git 管理状態のみによる完了判定
- 根拠: inbox 2026-09-13（case 2791: Permission denied → リトライ 3 回 → prune 成功 → rm -rf / rmdir が Device or resource busy で失敗。find でディレクトリが空であることは確認済み。git 側の削除は完了）
- 再発条件: worktree を workdir に指定してシェルコマンドを実行した後、同一セッションで worktree ディレクトリを削除した場合
- 横展開可能性: worktree を削除する全手順（case-close に限らない）、workdir 指定のシェル実行を伴う Case のクリーンアップ全般

## 推奨Issue分類

- 分類: fix（既存手順の補強）
- 推奨ラベル: documentation, agentdev, worktree
- 関連Issue: なし（case 2791 = Issue 2792 / PR 2792 の知見）
