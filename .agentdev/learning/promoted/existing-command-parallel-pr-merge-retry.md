# 並行PR逐次マージ時のコンフリクト自動リトライ・リカバリ強化

## 背景

Epic Orchestratorや複数Issueの並列開発で、同一ファイルまたは同一base branchに対する複数PRを逐次squash mergeする運用が定着している。先行PRのマージがbase branchを更新するたびに後続PRのマージが失敗し、手動rebase・force pushを繰り返す非効率が常態化している。3件のlearning entryで確認された反復パターンであり、自動リトライと標準リカバリ手順の組み込みで大幅に改善可能。

## 問題

case-closeのStep 4（PRマージ）に以下が欠けている:
1. squash merge失敗時の自動リトライロジック（間隔・上限なし）
2. rebase + conflict resolution → force pushの標準ワークフロー
3. 並行PR間の変更ファイル重複の事前検知

現状はマージ失敗毎にエージェントが即座に判断し、手動でrebase等を実行している。

## 望ましい変更

case-closeのStep 4に以下を追加:
- squash merge失敗時の自動リトライ（間隔5秒、最大5回）
- リトライ全滅時のrebase手順: `git rebase origin/main` → コンフリクト解消 → `git push --force-with-lease` → マージ再試行
- 並行PR間の変更ファイル重複がある場合の事前警告

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` — Step 4（PRマージ）のエラー回復手順

### 対象外

- agentdev-gh-cli SKILL.md — 既にVERIFY操作の3段リトライがあるため
- case-run — 実行時のマージではないため
- 他コマンド・スキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 4にマージリトライロジック（5秒間隔・最大5回）とrebase標準手順を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Step 4にworktree removeのPermission denied時の停止は記載があるが、PRマージ失敗時のリトライ・rebase手順が一切ない。マージ失敗はエージェントの即時判断に委ねられている。

## 制約

- 既存のStep構造とMUST/MUST NOTルールを維持する
- 新しい外部依存（スリープコマンド等）を追加しない（PowerShellの`Start-Sleep`は使用可）
- Epic OrchestratorモードのStep構造との整合性を保つ
- rebase時のforce pushは`--force-with-lease`を使用し`--force`は禁止

## 受け入れ条件

- [ ] case-close Step 4にマージ失敗時の自動リトライ手順（間隔5秒、最大5回）が追加されている
- [ ] リトライ全滅時のrebase + force-with-lease + 再マージ手順が追加されている
- [ ] MUST NOTとして`git push --force`（--force-with-lease以外）が禁止されている
- [ ] 既存のStep 4のガードレール・MUST NOTルールとの整合性が保たれている

## 元learning item / 根拠

- **要約**: 同一ファイル・同一base branchを変更する並行PRの逐次マージでコンフリクト・base branch modificationエラーが反復発生
- **根拠**: 3件のlearning entryで確認。兄弟PRの同一テストファイル末尾追記、並行PRでのpath正規化重複、Epic子Issueの逐次squash mergeでbase branch更新検出
- **再発条件**: (1) 同一ファイルを変更する複数PRが存在、(2) 逐次マージ、(3) 後続PRがrebaseなしでマージを試みる
- **横展開可能性**: 並行PR開発全般。Epic多Wave実行で特に顕著

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #503, #504, #511, #512, #513, Epic #559
