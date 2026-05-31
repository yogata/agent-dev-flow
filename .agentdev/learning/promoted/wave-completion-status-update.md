# Epic Orchestrator全Wave完了後のステータス更新ステップ追加

## 背景

Epic #421のステータス追跡テーブルで、子Issue #422/#425/#423/#424が`🔄 進行中`のままだった。Epic OrchestratorのWave開始時に親エージェントが一括で`🔄 進行中`に更新したが、完了時の更新はcase-closeの責務とされており、各サブエージェントは完了報告のみ行った。

## 問題

Epic Orchestratorの全Wave完了後、親エージェントが該当Waveの子Issueステータスを一括更新するステップが明示的に定義されていない。Wave開始時の一括更新はStep 3aに存在するが、全Wave完了後はspecs更新のみでステータス更新がない。

## 望ましい変更

workflow-orchestrationスキルのStep 4（全Wave完了後）に、親エージェントが各Waveの子Issueステータスを一括更新するステップを追加する。case-closeの個別更新と重複する場合は、Epic Orchestrator側での一括更新を優先とする。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`（Step 4 全Wave完了後）

### 対象外

- epic-trackerスキル（既にWave完了時ステータス更新セクションあり）
- case-closeコマンド

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | Step 4に全Wave完了後のステータス一括更新ステップを追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`、`.opencode/skills/agentdev-epic-tracker/SKILL.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: ステータス更新手順は存在するが、Epic Orchestratorの全Wave完了後に親が明示的にステータス更新を実行するステップが欠落

## 制約

- 既存のStep 3a（Wave開始時の一括更新）を変更しない
- case-closeでの個別更新との重複を考慮（Epic Orchestrator側で一括更新を優先）
- epic-trackerの既存セクションと矛盾しない

## 受け入れ条件

- [ ] workflow-orchestration SKILL.mdのStep 4に全Wave完了後のステータス一括更新ステップが追加されている
- [ ] case-closeとの責務境界が明記されている
- [ ] 既存のStep 3aの内容が変更されていない

## 元learning item / 根拠

- **要約**: Epic Orchestrator分散実行後のステータス更新漏れ予防
- **根拠**: Epic #421で5子Issue中4件のステータスが進行中のままだった。Wave開始時の一括更新はあるが完了時の更新がない
- **再発条件**: Epic OrchestratorでWave完了後にステータステーブルを更新しない場合
- **横展開可能性**: 高い。分散実行全般で発生

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Epic #421
