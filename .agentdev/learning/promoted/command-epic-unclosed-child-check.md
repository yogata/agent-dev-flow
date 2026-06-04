# Epic Orchestrator完了後の子Issue未クローズ残存パターン対策

## 背景

Epic Orchestratorモードの完了報告後、子Issueが未クローズのまま残存するパターンが観測された。case-closeのEpic検出時（Step 8）に子Issue状態の事前チェックがないため、親Epicの自動クローズ判定が不正確になる可能性がある。

## 問題

1. Orchestrator完了報告に未クローズ子Issue数の明記がない
2. case-close Step 8のEpic検出時に子Issue状態の事前チェックがない
3. 全子Issueの完了確認が不明確

## 望ましい変更

1. Orchestrator完了報告に未クローズ子Issue数を明記するセクションを追加
2. case-close Step 8に子Issue状態の事前チェック手順を追加
   - `gh issue view {parent}` で子Issue一覧を取得
   - 各子Issueのステータスを確認
   - 未クローズ子Issueがある場合は警告表示

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` — Step 8の親Epic Issue更新
- `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` — Orchestrator完了報告

### 対象外

- agentdev-epic-tracker skill（ステータストラッキング表の更新は既存手順通り）
- case-runの実装フェーズ
- テンプレートファイル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 8に子Issue状態の事前チェック手順を追加 |
| skill | `.opencode/skills/agentdev-workflow-orchestration/references/self-healing-and-errors.md` | 完了報告に未クローズ子Issue数の明記を推奨 |

## 既存対策確認

- **確認結果**: 既存対策あり（一部）
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md` Step 8, `.opencode/skills/agentdev-epic-tracker/SKILL.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: case-close Step 8にEpic自動クローズ判定（全子Issue CLOSED → 自動クローズ）はあるが、子Issue状態の事前チェック（未クローズ子Issueの警告表示）がない。agentdev-epic-trackerにはステータストラッキング表の更新手順があるが、Orchestrator完了報告時の子Issue状態確認は対象外

## 制約

- 子Issue状態の事前チェックは`gh issue view {parent}`で実施（API呼び出しの最小化）
- 警告表示は停止ではなく、ユーザーへの情報提供として扱う
- Epic自動クローズの既存判定基準（全子Issue CLOSED）を変更しない

## 受け入れ条件

- [ ] case-close Step 8に子Issue状態の事前チェック手順が追加されている
- [ ] 未クローズ子Issueがある場合の警告表示が定義されている
- [ ] Orchestrator完了報告に未クローズ子Issue数を明記することが推奨されている
- [ ] 既存のEpic自動クローズ判定基準が維持されている

## 元learning item / 根拠

- **要約**: Epic Orchestrator完了後の子Issue未クローズ残存パターン
- **根拠**: Orchestratorモードの完了報告後、子Issueが未クローズのまま残存するパターンが観測された。case-closeのEpic検出時に子Issue状態の事前チェックがないため、未クローズ子Issueに気づかず親Epicの自動クローズ判定が不正確になる可能性がある
- **再発条件**: (1) Epic Orchestratorモードで複数子Issueを実行、(2) 子Issueの一部が未完了、(3) 完了報告で子Issue状態を確認しない
- **横展開可能性**: Epic Orchestratorモード全般で発生可能。複数子Issueを持つEpicの運用で共通

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: なし
