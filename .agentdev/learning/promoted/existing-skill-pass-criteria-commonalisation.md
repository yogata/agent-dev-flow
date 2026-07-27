# pass_criteria 共通化による文字列一致要求の回避ガイド

## 背景

case-close QG-4 で Issue #1760 の完了条件「REQ-0129-012 が存在し、『対応要否と対応形態を分けて判定』『恒久契約候補以外を RU 生成経路へ送らない』『独立して再評価』を含むこと」を評価した際、REQ-0129-012 の実際の content（artifact_actions ACT-REQ-003 経由で req-save が verbatim 挿入）は「backlog-review は上流の恒久契約候補判定を独立して再評価し、恒久契約として不適格な成果物を RU 化しないこと」となっており、pass_criteria の期待文字列と一致しなかった。意味的等価性を確認の上、F-001「意味的等価・承認」として処理した。

## 問題

複数 REQ への共通 pass_criteria を起票する場合、各 REQ の pipeline stage（promote 系、review 系等）の違いを吸収せず文字列一致を要求する表現を起票すると、QG-4 評価時に REQ content と pass_criteria 期待値の食い違いが発生する。REQ ごとの pipeline stage の違いが content 表現に反映されるため、共通 pass_criteria は実態に合わなくなる。

## 望ましい変更

case-open 時の test strategy 起票で、複数 REQ の共通 pass_criteria を避け REQ ごとの個別期待値を記述する、または pass_criteria に「意味的等価を許容」旨を明記する運用ガイドを `agentdev-workflow-templates`（issue_desc_*.md テンプレートの test strategy 記述ガイド）と `agentdev-req-analysis`（pass_criteria 記述基準）へ整備する。

## 対象範囲

### 対象

- `agentdev-workflow-templates` issue_desc_*.md テンプレートの test strategy 記述ガイド
- `agentdev-req-analysis` の pass_criteria 記述基準

### 対象外

- REQ-0129-012 本体の content 修正（別 Issue の対象）
- QG-4 評価ロジックの変更（意味的等価性確認は case-close エージェントの判断で対応済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-workflow-templates/`（issue_desc_*.md テンプレート、SKILL.md の test strategy 記述ガイド） | 複数 REQ 共通 pass_criteria のリスクと REQ 個別期待値記述の推奨ガイドを追記 |
| skill | `src/opencode/skills/agentdev-req-analysis/`（SKILL.md の pass_criteria 記述基準） | pipeline stage 別の content 表現差異を吸収するための「意味的等価許容」明記ガイドラインを追記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: `docs/specs/skills/agentdev-workflow-templates.md`、`docs/specs/skills/agentdev-req-analysis.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: workflow-templates SPEC はテンプレート管理と review_dispositions 証跡セクションを規定するが、test strategy の pass_criteria 記述品質ガイドは未規定。req-analysis SPEC はチェックボックス品質基準（測定可能、一意、実装可能）を規定するが、共通化・意味的等価は未規定

## 制約

- 既存のテンプレート構造（`<!-- 【必須】 -->` マーカー、セクション順序）を維持する
- REQ-0129-012 の content 自体は backlog-review の責務範囲であり、本対応では変更しない
- 機械的なチェックではなく運用ガイドの追記で対応する（自動化は次段階）
- 問題クラス3（存在確認 vs diff 確認）と併せて1つの「test strategy 記述ガイドライン」へ統合することも検討（実装時に判断）

## 受け入れ条件

- [ ] `agentdev-workflow-templates` issue_desc_*.md テンプレートの test strategy 記述ガイドに、複数 REQ 共通 pass_criteria のリスクと REQ 個別期待値記述の推奨が明記されていること
- [ ] `agentdev-req-analysis` の pass_criteria 記述基準に、pipeline stage 別の content 表現差異を吸収する「意味的等価許容」ガイドラインが明記されていること
- [ ] 既存の test strategy テンプレート構造と競合しないこと

## 元learning item / 根拠

- **要約**: 複数 REQ 共通 pass_criteria は pipeline stage 差異を吸収できず QG-4 で調整が必要になる
- **根拠**: case-close QG-4 で Issue #1760 の完了条件（REQ-0129-012 含む）が、REQ-0129-012 content と文字列一致せず。意味的等価性を確認の上 F-001「意味的等価・承認」として処理
- **再発条件**: 複数 REQ で共通の観測可能振る舞いを追加する Issue の test_strategy で、pass_criteria を共通化して文字列一致を要求した場合
- **横展開可能性**: 複数 REQ への共通 pass_criteria を書く全ケース。AgentDevFlow 固有の pipeline stage 別表現問題

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, test-strategy
- **関連Issue**: Issue #1760, PR #1763, REQ-0129-012, REQ-0127-023, REQ-0128-010, Epic #1758
