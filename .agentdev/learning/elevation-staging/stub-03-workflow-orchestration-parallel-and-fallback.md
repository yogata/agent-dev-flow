# workflow-orchestration 並列実行プロトコルと代替検証追加

## 背景

並列 delegate 時にファイル所有権の明示的分割がないためコンフリクトや検証漏れが発生（3件、評価スコア 28/40）。また `background_output` の "Task not found" エラーで成果物確認ができない問題も発生（1件、評価スコア 22/40）。両クラスとも反映先が `agentdev-workflow-orchestration` スキルであり統合して反映する。

## 問題

1. **ファイル所有権不在**: 複数エージェント/PR が同一または関連ファイルを変更する際、ファイル所有権の明示的分割と delegate 後の包括的検証が不十分なためコンフリクトや旧参照残存が発生
2. **background_output 信頼性**: `task(run_in_background=true)` で起動したサブエージェントの task_id が `background_output()` で "Task not found" エラーになる。セッション間引き継ぎまたはタイミングの問題

## 望ましい変更

`agentdev-workflow-orchestration` スキルに以下を反映:
- サブエージェント実行プロトコルに「ファイル所有権マトリクス」要件を追加
- delegate 前に各エージェントの担当ファイル（触るファイル・触らないファイル）を明示する手順を追加
- delegate 後は target list 以外も含めて grep で包括スキャンする検証ステップを追加
- `background_output` 失敗時のフォールバック検証手順（`git diff` 代替検証）を追加

## 対象範囲

### 対象

- `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`

### 対象外

- case-run コマンド自体の Step 構成
- 他のスキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | ファイル所有権マトリクス要件、フォールバック検証手順の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`
- **ギャップ分類**: fix gap（ファイル所有権マトリクスなし、フォールバック検証手順なし）
- **ギャップ詳細**: サブエージェント実行プロトコルにファイル所有権マトリクス要件が存在しない。background_output 失敗時の代替検証手順も未記載

## 制約

- スキルの追加内容は手順・ガイドラインレベル（コード変更ではない）
- 既存のサブエージェント実行セクションとの整合性を維持する

## 受け入れ条件

- [ ] ファイル所有権マトリクスの作成手順が delegate 前ステップに追加されている
- [ ] 各エージェントに「触ってはいけないファイル」の明示が必須として記載されている
- [ ] delegate 後の包括 grep スキャン手順が検証ステップに追加されている
- [ ] `background_output` 失敗時の `git diff` フォールバック検証手順が追加されている

## 元learning item / 根拠

- **要約**: 並列 delegate 時のコンフリクト・検証漏れ（3件）と background_output 信頼性問題（1件）の統合対応
- **根拠**: ファイル所有権の明示的分割なしに並列 delegate するとコンフリクト・旧参照残存が発生。background_output がセッション間で引き継がれず Task not found エラー
- **再発条件**: 並列 delegate で複数ファイルを変更する際、および background_output で並列タスク結果を取得する際
- **横展開可能性**: 高（並列 delegate パターン全般で適用可能）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #85, #86, #87, Issue #256, PR #257, Issue #306, PR #307, Issue #326, PR #327
