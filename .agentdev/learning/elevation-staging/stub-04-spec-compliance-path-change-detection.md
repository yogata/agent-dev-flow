# spec-compliance 旧パス参照検出の追加

## 背景

ファイル移動・rename 時にコマンドファイルと REQ ファイルの参照更新のみ考慮し、スキル参照ファイル（reference/）・セクション見出しの更新を見落とす問題が3回発生（評価スコア 27/40）。問題クラス4のうち spec-compliance に反映すべき内容。

## 問題

ファイル移動・rename 時に旧パスの全文検索が不十分で、スキル参照ファイル（reference/）に旧パス参照が残存する。またサブエージェント委譲編集後のファイル全体の旧概念参照残存も見落とされる。

## 望ましい変更

`agentdev-spec-compliance` スキルの乖離検出観点に以下を追加:
- 変更ファイルの旧パスを全文検索し、スキル参照ファイル（reference/）の旧パス残存を検出する手順
- ファイル全体（冒頭の要約・説明文、セクション間の相互参照を含む）で旧概念キーワードの grep 検索を含める手順

## 対象範囲

### 対象

- `.opencode/skills/agentdev-spec-compliance/SKILL.md`

### 対象外

- adr-file-manager スキル（別スタブ stub-05 で対応）
- case-run コマンドの検証ステップ自体

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-spec-compliance/SKILL.md` | 乖離検出観点に「スキル参照ファイルの旧パス残存」「旧概念キーワードのファイル全体 grep」を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-spec-compliance/SKILL.md`
- **ギャップ分類**: fix gap（path change detection なし）
- **ギャップ詳細**: 乖離検出の観点に「旧パス全文検索」「スキル参照ファイルの旧パス残存」が含まれていない

## 制約

- spec-compliance の既存の乖離検出セクションに観点を追加する形で対応
- 検出手順は grep ベースで自動化可能なものに限定

## 受け入れ条件

- [ ] 乖離検出観点に「変更ファイルの旧パス全文検索」が追加されている
- [ ] 乖離検出観点に「スキル参照ファイル（reference/）の旧パス残存チェック」が追加されている
- [ ] ファイル全体での旧概念キーワード grep 検索が含まれている

## 元learning item / 根拠

- **要約**: ファイル移動・rename 時の参照整合性見落とし（3件）のうち spec-compliance 反映分
- **根拠**: pr_desc.md 移動時に artifact-boundaries.md の旧パス参照見落とし。requirements-review-finding-protocol.md の旧概念参照残存。ファイル冒頭の要約文は個別セクション変更時に見落とされやすい
- **再発条件**: スキル参照ファイルにパスを記載している状態で、そのパスが変更されるファイル移動・rename を実行する場合
- **横展開可能性**: 高（ドキュメント体系を持つプロジェクト全般で発生）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #260, PR #261, Issue #270, PR #271
