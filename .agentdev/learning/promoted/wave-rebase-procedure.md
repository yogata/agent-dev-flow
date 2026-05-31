# Wave間リベース手順の追加

## 背景

Epic #421で5子IssueのPR（#427〜#431）がmainから独立分岐していたため、順次マージ時に6ファイルでマージコンフリクトが発生した。特にWave 3のPR #430はWave 1-2の変更と多数衝突した。Epic Orchestratorが各Waveのsubagentにmainベースのworktreeを提供し、先行Waveのマージ結果を後続Waveのブランチに取り込まなかったことが根本原因。

## 問題

Epic OrchestratorのWave実行プロトコルに、後続Wave開始時に先行Waveの累積マージ結果をrebaseする仕組みが欠落している。各Waveが独立してmainから分岐するため、順次マージ時にコンフリクトが頻発する。

## 望ましい変更

workflow-orchestrationスキルのWave実行プロトコル（Step 3）に、Wave完了後のrebase手順を追加する。後続Wave開始前にmainの最新状態（先行Waveのマージ結果を含む）をrebaseするステップを明示化する。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`（Wave実行プロトコル）

### 対象外

- case-runコマンド定義（別stubで対応）
- git-worktreeスキル
- Epic Trackerスキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-workflow-orchestration/SKILL.md` | Step 3 Wave実行プロトコルに、後続Wave開始前のrebase手順を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: Wave順次実行プロトコル（3a-e）は存在するが、Wave完了後に後続Waveのブランチをrebaseする手順が欠落

## 制約

- 既存のWave実行フロー（3a-e）を変更しない
- rebase手順は追加ステップとして挿入
- 後方互換性を維持（rebase失敗時のフォールバック手順を含む）

## 受け入れ条件

- [ ] workflow-orchestration SKILL.mdのWave実行プロトコルに後続Wave開始前のrebase手順が追加されている
- [ ] rebase失敗時のフォールバック手順が記載されている
- [ ] 既存のStep 3a-eの内容が変更されていない

## 元learning item / 根拠

- **要約**: 並列PR・Wave間のマージコンフリクト予防
- **根拠**: Epic #421で5PRが順次マージ時に6ファイルでコンフリクト。各Waveがmainから独立分岐していることが根本原因
- **再発条件**: 1 Epic内で複数Waveが共通ファイルを変更し、各ブランチがmainから独立分岐している場合
- **横展開可能性**: 高い。複数Wave/PRを扱う全Epicで発生する汎用問題

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Epic #421
