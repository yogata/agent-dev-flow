# case-close STEP-4-3 の auto-close 回避に branch HEAD commit message のキーワード確認を前置する

## 背景

case-close STEP-4-3 の「PR タイトル事前変更」（issue_update で Conventional Commits + (Refs #N) 形式へ変更）を実施したが、squash merge commit のタイトルには反映されなかった（PR #2957）。本リポジトリの squash merge 設定は 1-commit PR で commit message を採用するため、branch HEAD の元 commit メッセージがそのまま squash タイトルになった。幸い当該 commit message に auto-close キーワードを含まず Issue 誤 close は発生しなかったが、手順の保護は偶然に依存していた。

## 問題

squash コミットタイトルの由来はリポジトリ設定（PR title 優先 vs commit message 優先）に依存する。現行 case-close reference の STEP-4-3 は「PR タイトル事前変更」のみを auto-close 回避手段として規定し、1-commit PR で commit message が squash タイトルに採用される環境を想定していない。commit message 優先設定のリポジトリで branch HEAD commit message に fixes/closes/resolves + 近接参照が含まれたまま merge すると、Issue の意図しない auto-close が発生する。

## 望ましい変更

case-close STEP-4-3 の前置として、branch HEAD commit message の auto-close キーワード確認（fixes/closes/resolves + Issue 近接参照なし）を追加する。PR タイトル事前変更は補助手段とし、merge 前に squash タイトルの実際の由来（リポジトリ設定・PR commit 数）を確認する運用を併記する。

## 対象範囲

### 対象

- agentdev-workflow-case-close の STEP-4-3（references/pr-merge-and-conflict.md）

### 対象外

- リポジトリ側の squash merge 設定変更（GitHub 設定は運用対象外）
- pr_merge 操作の Tool 実装（既存・不変）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md | STEP-4-3 の前置に「branch HEAD commit message の auto-close キーワード確認（fixes/closes/resolves + 近接参照なし）」を追加。PR タイトル事前変更は commit message 採用環境では補助手段である旨を注記 |
| Design | docs/designs/commands/case-close.md（該当 Design） | PR merge 前チェックの観点追記候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md（STEP-4-3）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 現行 STEP-4-3 は「マージ実行前に issue_update で PR タイトルを Conventional Commits + (Refs #N) 形式へ変更する」のみを規定。1-commit PR で squash タイトルが commit message 由来になる環境（本リポジトリで実証済み）では、PR タイトル変更は squash タイトルを制御できず、branch HEAD commit message の確認が保護の実体になるが未規定

## 制約

- Issue の close は case-close が明示 close で完結する設計であり、auto-close キーワード混入の排除は merge 前の最終防壁である
- 確認対象は branch HEAD の commit message（squash 採用源）。全 commit の精査は要求しない
- リポジトリ設定の差異（PR title 優先 / commit message 優先）を判定できない場合は commit message 確認を常に実施する安全側で運用する

## 受け入れ条件

- [ ] STEP-4-3 の手順に branch HEAD commit message の auto-close キーワード確認が merge 前チェックとして記載されていること
- [ ] 1-commit PR・commit message 採用設定環境で PR タイトル事前変更が squash タイトルを制御できない旨の注記があること
- [ ] 確認でキーワードを検出した場合の扱い（commit message 修正・rebase 等）が手順に含まれること

## 元learning item / 根拠

- **要約**: PR タイトル事前変更は 1-commit PR の squash タイトルを制御できない（リポジトリ設定が commit message 採用のため）。auto-close 回避の担保は branch HEAD commit message 自体に auto-close キーワードを含めないことでも成立する
- **根拠**: Case #2954（2026-09-18、case-close STEP-4-3・PR #2957 squash merge）。merge 後の git log --oneline origin/main で squash commit タイトルが branch HEAD の元 commit message（5ccfa74c）由来と確認。元 message に auto-close キーワードなしのため誤 close は未発生（Issue は case-close の明示 close で完了）
- **再発条件**: commit message 優先設定のリポジトリで、case-close が branch HEAD commit message の auto-close キーワードを確認せず merge した場合
- **横展開可能性**: squash merge と auto-close キーワードを持つ GitHub 運用全般で発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: workflow, github
- **関連Issue**: Case #2954、PR #2957
