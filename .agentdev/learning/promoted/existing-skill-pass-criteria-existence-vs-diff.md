# pass_criteria 「存在しないこと」と「変更されていないこと」の使い分けガイド

## 背景

Issue #1760 の TS-003 pass_criteria は「REQ-0101-058、REQ-0136-033、REQ-0147-010、REQ-0140-043 が存在しないこと」と記述されていたが、REQ-0147.md には REQ-0147-010 が存在する（変更なし）。pass_criteria の存在確認表現が「変更されていないこと」を意図したにも関わらず「存在しないこと」と誤って記述されていた。REQ-0147-010 の存在自体は問題ない（変更されていないことが正しい状態）のため、pass_criteria 表現の誤りとして記録した。

## 問題

test strategy 起票時に「変更対象外 REQ の変更がないこと」を「存在しないこと」と誤表現すると、検証の意図（diff がないこと）と検証の表現（存在確認）がずれる。前者は誤って既存 REQ を隠蔽する可能性があり、後者が正確。存在確認は新規作成禁止（「REQ-0164 が存在しないこと」等）の場合のみ使用すべき。

## 望ましい変更

case-open 時の test strategy 起票で、変更対象外 REQ の検証は「diff がないこと」「変更されていないこと」で表現し、存在確認は新規作成禁止の場合のみ使用する運用ガイドを `agentdev-workflow-templates`（issue_desc_*.md テンプレートの test strategy 記述ガイド）と `agentdev-req-analysis`（pass_criteria 記述基準）へ整備する。

## 対象範囲

### 対象

- `agentdev-workflow-templates` issue_desc_*.md テンプレートの test strategy 記述ガイド
- `agentdev-req-analysis` の pass_criteria 記述基準

### 対象外

- 過去の test strategy 起票の遡及修正（将来の起票から適用）
- 機械的な表現チェックの実装（運用ガイドの追記で対応）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-templates/`（issue_desc_*.md テンプレート、SKILL.md の test strategy 記述ガイド） | 変更対象外 REQ 検証の正しい表現（diff がないこと）と存在確認の使用条件（新規作成禁止）を明記 |
| skill | `src/opencode/skills/agentdev-req-analysis/`（SKILL.md の pass_criteria 記述基準） | 「存在しないこと」と「変更されていないこと」の使い分け基準を追記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: `docs/specs/skills/agentdev-workflow-templates.md`、`docs/specs/skills/agentdev-req-analysis.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: workflow-templates SPEC はテンプレート管理を規定するが、test strategy の pass_criteria 表現ガイドは未規定。req-analysis SPEC はチェックボックス品質基準を規定するが、検証表現の使い分け（存在確認 vs diff 確認）は未規定

## 制約

- 既存のテンプレート構造（`<!-- 【必須】 -->` マーカー、セクション順序）を維持する
- 機械的なチェックではなく運用ガイドの追記で対応する
- 問題クラス2（共通化ガイド）と併せて1つの「test strategy 記述ガイドライン」にまとめることも検討（実装時に判断）

## 受け入れ条件

- [ ] `agentdev-workflow-templates` issue_desc_*.md テンプレートの test strategy 記述ガイドに、変更対象外 REQ 検証の正しい表現（diff がないこと）と存在確認の使用条件（新規作成禁止）が明記されていること
- [ ] `agentdev-req-analysis` の pass_criteria 記述基準に、「存在しないこと」と「変更されていないこと」の使い分け基準が明記されていること
- [ ] 既存の test strategy テンプレート構造と競合しないこと

## 元learning item / 根拠

- **要約**: pass_criteria で変更対象外 REQ を「存在しないこと」と誤表現すると、検証意図が不正確になる
- **根拠**: Issue #1760 TS-003 pass_criteria が「REQ-0147-010 が存在しないこと」と誤表現。REQ-0147-010 は存在する（変更なし）ため、正しい検証意図は「変更されていないこと」
- **再発条件**: 変更対象外 REQ を pass_criteria で検証する際、「存在しないこと」と誤って記述した場合
- **横展開可能性**: 変更対象外 REQ の検証全般。test strategy 記述の汎用ガイドライン

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, test-strategy
- **関連Issue**: Issue #1760, PR #1763, REQ-0147-010, Epic #1758
