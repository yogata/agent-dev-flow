# Windows 固有制約によるスクリプト・ツール破壊の回避（PS5.1 文言化け・worktree 部分削除）

## 背景

Case #3236（PR #3238）と Case #3239（PR #3241）で、Windows 固有の制約がスクリプト表示文言と worktree クリーンアップを破壊する事象がそれぞれ観測された。いずれも既存の知識文書・手順書の対象範囲外の機構であり、再発防止の知識として整備が必要である。

## 問題

1. **PowerShell 5.1 実行経路の案内文言化け**: archive installer は release archive 生成スクリプトから Windows PowerShell 5.1 で起動される経路を持ち、BOM なし UTF-8 スクリプト内の多バイト文言が ANSI（cp932）デコードで文字化けする。
2. **bun install 済み worktree の部分削除**: `git worktree remove` が bun install で生成された node_modules 深階層（Windows MAX_PATH 超過）の削除に失敗し、管理登録は解除されるがディスクに src 等が部分残存する（error: failed to delete ... Filename too long）。

## 望ましい変更

- PowerShell 5.1 で実行され得るスクリプト（installer 系・導入系）の表示文言は ASCII 限定を既定とする規律を、既存の PowerShell 破壊知識文書に追記する。
- worktree remove の失敗フォールバック手順（`git worktree prune` → node `fs.rmSync(path, {recursive:true, force:true})` → `ls` による消滅確認 → ブランチ削除は管理登録解除後）を worktree 削除手順に追記する。

## 対象範囲

### 対象

- `docs/knowledge/windows-powershell-bulk-io-corruption.md`（文言規律の追記）
- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` 削除手順節（フォールバック手順の追記）
- `scripts/consumer/archive/` 配下スクリプトの文言規律（既に install.ps1 は ASCII 限定適用済み）

### 対象外

- checkout consumer 版・self-sync 版スクリプトの文言（日本語のまま維持。PS5.1 経路での起動がないため）
- junction reparse 系の既知削除失敗手順（別系統・既存対応あり）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-powershell-bulk-io-corruption.md | PS5.1 実行経路スクリプトの表示文言は ASCII 限定とする規律の追記（installer 系・導入系スクリプト全般） |
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 削除手順節へ MAX_PATH 超過による worktree remove 部分削除のフォールバック手順（prune + fs.rmSync recursive + 消滅確認 + ブランチ削除順序）を追記 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/knowledge/windows-powershell-bulk-io-corruption.md、src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 知識文書は PS 一括読み書き破壊（ファイル I/O）を対象とし、表示文言（stdout）面と installer 系文言規律は未カバー。worktree-operations.md 削除手順は untracked ファイルの前置削除を保有するが、worktree remove 自体の失敗フォールバック（MAX_PATH 系）は未記載

## 制約

- guard の fail-closed 動作・正規手順（node fs 系）は維持する。回避ではなく手順の追記で対処する
- junction 削除フォールバック手順（既存）との混同に注意 — 本件は reparse point ではなくパス長上限に起因する別系統である

## 受け入れ条件

- [ ] 知識文書に PS5.1 実行経路の文言規律（ASCII 限定既定）が追記されている
- [ ] worktree-operations.md 削除手順に MAX_PATH 起因の失敗フォールバック手順が追記されている
- [ ] 追記内容が Case #3236/#3239 の実測（PR #3238/#3241）と整合している

## 元learning item / 根拠

- **要約**: Windows 固有制約（PS5.1 ANSI デコード・MAX_PATH 超過）によるスクリプト表示文言の文字化けと worktree クリーンアップの部分削除失敗、およびその回避手段
- **根拠**: (1) PS5.1 は BOM なし UTF-8 を ANSI デコードし多バイト文言が化ける（install.ps1 を ASCII 限定化で解消、checkout consumer 版・self-sync 版は日本語維持）。AGENTS.md の PowerShell 一括読み書き禁止規律（cp932 破壊）と同根。(2) bun install 依存ツリーのパス長が Windows 上限を超え git 内部の削除処理が辿れない。`git worktree prune` → node `fs.rmSync(recursive, force)` → `ls` 消滅確認で完全削除、ブランチ削除は管理登録解除後に実施（junction reparse 事象とは別系統）
- **再発条件**: PS5.1 実行経路スクリプトへの多バイト文言埋込み、bun install 済み worktree の git worktree remove 実行
- **横展開可能性**: Windows+BOMなしUTF-8+bun install 環境のスクリプト・クリーンアップ全般で発生し得る

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（Case #3236・#3239、PR #3238・#3241 由来）
