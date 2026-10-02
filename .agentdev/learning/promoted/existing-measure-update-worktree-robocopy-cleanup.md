# Windows worktree remove の Filename too long 部分失敗時の robocopy 掃除手順の追記

処分区分: 5 既存対策の更新（fix gap）

## 背景

Case #3304 STEP-6-1 の worktree クリーンアップで、Windows 環境の `git worktree remove` が `Filename too long` で部分失敗した。robocopy /MIR による残存ディレクトリ掃除で完遂した。

## 問題

worktree-operations.md の worktree 削除手順に、Windows のパス長制限による部分失敗時の代替掃除手順の記載がない。部分失敗したまま放置すると worktree 登録残存・ディレクトリ残存で後続 worktree 操作が失敗する。

## 望ましい変更

worktree-operations.md の削除手順に「Filename too long 等で部分失敗した場合の robocopy /MIR 手順」を追記する:

1. 空ディレクトリを準備し `robocopy <空dir> <残存worktree dir> /MIR` でミラー削除
2. robocopy の終了コード 0-7 を成功と見なす
3. 残存ファイル 0 件を検証してから `rmdir` で除去
4. `git worktree prune` で登録を整理

## 対象範囲

### 対象

- src/common/skills/agentdev-git-worktree/references/worktree-operations.md（worktree 削除手順節）

### 対象外

- git 側の long path 設定変更（core.longpaths 等の環境設定は利用者判断）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | 削除手順へ robocopy /MIR による代替掃除手順を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: worktree-operations.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Windows パス長制限による部分失敗時の代替手順の記載なし

## 制約

- robocopy /MIR は指定方向を誤ると実ファイルを消すため、空ディレクトリ → 残存ディレクトリの方向を明記する
- AGENTS.md の Windows ファイル操作規律（PowerShell 標準 cmdlet の一括読み書き回避）に抵触しない手順とする

## 受け入れ条件

- [ ] 削除手順に robocopy /MIR 手順（方向・成功コード・検証・prune）が追記されている

## 元learning item / 根拠

- **要約**: Windows で git worktree remove が Filename too long で部分失敗した際の掃除実績
- **根拠**: 2026-10-01 Case #3304 STEP-6-1: robocopy /MIR（空 dir ミラー・rc 0-7 成功・残存 0 件検証後 rmdir）で解消
- **再発条件**: Windows で長いパスを持つ worktree を削除する場合
- **横展開可能性**: Windows 環境での全 worktree クリーンアップ

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation, windows
- **関連Issue**: Case #3304
