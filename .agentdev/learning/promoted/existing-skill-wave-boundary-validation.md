# Wave境界横断残存参照検証の追加

## 背景

複数Wave構成のEpic実行時に、各Waveが独立して変更を行い、Wave境界で横断的な残存参照確認が実行されない。結果として、廃止コマンド名や旧namespaceの残存参照が最終コミット後に発見され、追加修正コミットが必要になる。spec compliance sweepでも手動整理の影響範囲リストに依存すると見落しが発生する。

## 問題

Wave完了時にスコープ横断的な残存参照検索が実行されないため、廃止コマンド名・旧namespace等の残存参照が各Waveの変更スコープ外に残る。

## 望ましい変更

workflow-orchestration skillのWave完了時プロトコルに、横断的残存参照チェックステップを追加する。またcase-runのguardrailsにnamespace変更時の全文grep sweepを追加する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` — Wave完了時チェック手順
- `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` — Wave境界エラーハンドリング
- `.opencode/commands/agentdev/case-run.md` — guardrails

### 対象外

- case-close、case-auto等の他コマンド
- check_integrity.ts の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | Wave完了時の横断残存参照チェックステップ追加 |
| skill | `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | Wave境界での廃止キーワード検証手順追加 |
| command | `.opencode/commands/agentdev/case-run.md` | namespace変更・コマンド廃止時の全文grep sweepをguardrail追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`、`.opencode/commands/agentdev/case-run.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: workflow-orchestrationにWave設計ガイダンスは存在するが、Wave完了時の横断的残存参照検証ステップが不在。case-runにspec compliance sweepは存在するが、namespace変更・コマンド廃止時の全文grep sweepがguardrail化されていない

## 制約

- Wave完了時チェックはEpic Orchestrator実行時のみ適用（単一Issue実行時は不要）
- 検索対象キーワードは実行コンテキストに応じて動的に決定する必要がある
- grep実行コストは低いため、過剰検出を許容して偽陽性は目視排除とする

## 受け入れ条件

- [ ] workflow-orchestrationのWave完了時プロトコルに横断残存参照チェック手順が追加されている
- [ ] case-runのguardrailsにnamespace変更・コマンド廃止時の全文grep sweepが追加されている
- [ ] 既存のWave設計ガイダンスと矛盾しない

## 元learning item / 根拠

- **要約**: 複数Wave構成のEpicで、各Waveが独立して参照更新を行う際、Wave境界での横断的残存参照確認が不足
- **根拠**: Epic Orchestrator Wave1→Wave2実行後に廃止コマンド名（intake-review, learning-refine, accepted/）の残存参照が6ファイルに残存。spec compliance sweepでも手動整理リスト外のworkflow-contracts.mdに古い参照が残存
- **再発条件**: 複数Wave/PRが同じファイル群を変更し、各スコープが独立して参照更新を行う場合
- **横展開可能性**: 複数Wave構成のEpic全般で発生し得る。namespace移行・コマンド廃止を伴う変更で特に高リスク

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #618, #619, #610, PR #624, #611
