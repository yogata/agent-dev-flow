# Windows 依存生成済み worktree 削除失敗時の回復手順を worktree 手順へ補足する

## 背景

Windows 環境で plugin 依存生成済み（bun install + build:engine 済み、node_modules と textlint vendor 辞書を含む）worktree の `git worktree remove` が `error: failed to delete ... Filename too long` で失敗した（Case 3486・PR 3493）。worktree list からは登録が外れるが `.worktrees/` 配下にディレクトリ実体が残存し、Git Bash の rm でも長パスの個別削除が不可だった。node の `fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 })` で実体を削除し、`git worktree prune` と branch `-D` で整合を回復した。なお LongPathsEnabled 有効環境ではこの部分失敗が再現しないことが検証構成として記録されている（deferred 2026-10-05 移動分）。

## 問題

worktree 削除手順（worktree-operations.md）に、依存生成済み worktree での remove 失敗時の回復手順（node fs.rmSync → worktree prune → branch 削除の順序）と、検証時の環境ラベル（LongPathsEnabled 状態）の記録が補足されていない。AGENTS.md の「node fs API 標準手段」規律は存在するが、worktree 削除という具体手順への適用として明示されていない。

## 望ましい変更

agentdev-git-worktree skill の worktree-operations.md へ、Windows 環境で依存生成済み worktree の remove が Filename too long で失敗した場合の回復手順（node fs.rmSync → git worktree prune → branch 削除）と、環境ラベル（LongPathsEnabled 設定状態）の記録を補足する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`（worktree 削除手順）

### 対象外

- agentdev-git-worktree skill 本体（SKILL.md）の変更（配布 skill 変更は別 Case 対象。本成果物は情報提供）
- LongPathsEnabled の環境設定運用（検証構成の記録は対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | 依存生成済み worktree remove 失敗時の回復手順と環境ラベル記録の補足 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: worktree-operations.md の robocopy 手順、AGENTS.md 行動規範（PowerShell 一括 IO 禁止・node fs API 標準手段）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: node fs API 規律は存在するが、worktree 削除の回復手順（fs.rmSync → prune → branch 削除の順序）と環境依存の再現条件（LongPathsEnabled）が手順にない

## 制約

- skill 配布物（src/common/skills/agentdev-git-worktree/）の変更は別 Case 対象とし、本成果物は req-define への情報提供に留める
- junction・link profile 構造の変更は対象外

## 受け入れ条件

- [ ] worktree-operations.md に remove 失敗時の回復手順（node fs.rmSync → prune → branch 削除）が記載される
- [ ] LongPathsEnabled 状態の環境ラベル記録が検証構成に明記される

## 元learning item / 根拠

- **要約**: Windows MAX_PATH 起因の worktree 削除失敗は node fs.rmSync で回復する。回復手順と環境ラベルが手順にない（2件: inbox 1 + deferred 1）
- **根拠**: Case 3486・PR 3493（fs.rmSync recursive/force/maxRetries 3 で実体削除成功、prune と branch -D で整合）、deferred 2026-10-05 移動エントリ（LongPathsEnabled 有効環境では Filename too long 部分失敗が再現しない検証構成）
- **再発条件**: Windows 環境で bun install・build:engine（vendor 生成）を実施した worktree を case-close STEP-6-1 で削除する場合
- **横展開可能性**: Windows 環境のパス処理一般（PowerShell 一括 IO 禁止と同系統の Windows 知識群）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
