# STEP-3: 検出事項出力・永続化・完了報告（finding-output-and-persist）

> 本 reference は `agentdev-workflow-inspect-skills` SKILL.md の Control Plane STEP-3 詳細である。read-only-diagnostic型のため resume point を持たない（REQ-{NNNN}-{NNN}）。

## 開始条件

- STEP-2 の検出事項（分類、根拠、推奨 route 付き）の確定

## 結果

- 検出事項ファイル（`.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md`）
- `.agentdev/inspect/` 配下の commit/push、完了報告

## 手順

### Step 6: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-skills-finding-{topic}.md` へ出力する。

### Step 7: 実行前同期（git pull --ff-only）

- `git pull --ff-only` を実行する
- **失敗時**: 共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（自動解消しない）

### Step 8: .agentdev/inspect/ 変更の commit と push

`agentdev-git-worktree` の「ドメイン状態永続化プロシージャ」（並列実行安全ステージングプロシージャ含む）に従い、`.agentdev/inspect/` 配下の変更を commit/ push する。commit message は `chore(agentdev): capture inspect-skills finding`（Conventional Commits 形式）。変更なし時は commit/push せず完了報告で「変更なし」と報告する。push 失敗時は同プロシージャの構造化エラー形式で停止する（完了扱いにしない）。

### Step 9: 完了報告

完了報告 template（`.opencode/commands/agentdev/templates/inspect-skills/standard.md`）に従って出力する。

## エラー処理

| エラー | 対処 |
|--------|------|
| `git pull --ff-only` 失敗 | git-error-messages 共通 template の該当形式で表示して停止 |
| push 失敗 | ドメイン状態永続化プロシージャの構造化エラー形式で停止（完了扱いにしない） |

## 関連 STEP

- 前: STEP-2（skill-structure-diagnostics）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-git-worktree`: ドメイン状態永続化プロシージャ
- `agentdev-conventional-commits`: commit message 規約

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G02（GitHub Issue/PR を作成、更新しない）
- G03（RU、intake、learning、backlog 成果物を保存しない）
- G04（commit/ push は `.agentdev/inspect/` 配下の永続化のみ許可。branch/ worktree 操作は禁止）
