# 並行PR逐次マージ時のコンフリクト自動リトライ

## 背景

Epic Orchestratorモード等で複数PRを逐次squash mergeする際、先行PRのマージがbase branchを更新し、後続PRのマージが「base branch was modified」エラーやコンフリクトで失敗する事象が3件発生した。並行PR開発の頻度増加に伴い再発がほぼ確実であり、マージ失敗時のリトライ・rebase手順の標準化が必要。

## 問題

case-close Step 4のPRマージに自動リトライ機構がなく、base branch更新によるマージ失敗時の手動対応コストが高い。並行Wave実行で特に顕著になる。

## 望ましい変更

case-close Step 4のPRマージに以下を追加:
1. マージ失敗時の自動リトライ（間隔5秒、最大5回）
2. リトライで解決しない場合のrebase + conflict resolution → force push → retryのワークフロー
3. マージ前の`git merge origin/main --no-commit`による競合事前確認
4. 並行Wave実行ガイドに共通変更の独立PR化を推奨する記述

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` — Step 4のPRマージ手順
- `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` — エラー回復マップ

### 対象外

- agentdev-gh-cli skill（マージ操作自体はgh CLIの機能）
- case-run の実装フェーズ
- テンプレートファイル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 4にマージリトライロジック（間隔5秒・最大5回）とrebase手順を追加 |
| skill | `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | マージ失敗時のエラー回復パターンを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（一部）
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md` Step 4, `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` Section 2（Permission denied時のリトライ）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: case-close Step 4にマージ失敗時のリトライ・rebase手順が存在しない。worktree-operations.mdにはPermission denied時のリトライ（2回）があるが、マージコンフリクト向けではない。agentdev-gh-cliのVERIFY操作は書き込み後の検証のみで、マージ自体のリトライは対象外

## 制約

- マージリトライは冪等であること（同一PRの重複マージを防ぐ）
- rebase時はforce pushが必要だが、PRのcommit historyが変わる点に注意
- squash merge済みの判定を正確に行うこと（`state: MERGED`確認）
- 既存のPermission deniedリトライパターンと統一的なリトライ戦略とすること

## 受け入れ条件

- [ ] case-close Step 4にマージ失敗時の自動リトライ（間隔5秒・最大5回）が追加されている
- [ ] リトライ上限到達時のrebase手順が定義されている
- [ ] 並行Wave実行で共通変更の独立PR化が推奨されている
- [ ] 既存のマージフローに後方互換性がある

## 元learning item / 根拠

- **要約**: 並行PR逐次マージ時のコンフリクト・base branch更新によるマージ失敗
- **根拠**: 同一ファイルまたは同一ベースブランチを変更する複数PRを逐次マージする際、先行PRのマージがbase branchを更新し、後続PRのsquash mergeが失敗する事象が3件（同一ファイルコンフリクト2件 + base branch modification 1件）発生
- **再発条件**: (1) 複数PRが同一ファイルの同じ箇所を変更、(2) 逐次マージ、(3) 後続PRがrebaseなしでマージを試みる
- **横展開可能性**: 並行PR開発全般で発生。Epicの多Wave実行で特に顕著。TypeScript/Node.jsプロジェクトに限定されない

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: なし
