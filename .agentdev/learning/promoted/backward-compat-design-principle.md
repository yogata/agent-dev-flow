# コマンド設計ガイドラインへの後方互換性維持原則の明文化

## 背景

既存コマンドに複数Issue並列実行を追加した際（issue-work: 135行→244行）、既存の単一Issueフローを壊さずに新機能を組み込む必要があった。またskill rename時にdelegate agentがgit mvを使わずWrite/Deleteで実装した事例もあった。

## 問題

コマンド設計ガイドライン（command-authoring references）に、後方互換性を維持する拡張パターンの設計原則が明文化されていない。既存コマンドへの新機能追加時に、既存フローを壊すリスクがある。

## 望ましい変更

command-authoring referencesに後方互換性維持の設計原則を追加する。具体的には：
1. 既存Stepの内容不変 + 分岐点のみで新規パスを注入するパターン
2. ディレクトリリネームには`git mv`を使用する原則
3. 新規パスと既存パスの明示的な分離

## 対象範囲

### 対象

- `.opencode/skills/agentdev-command-authoring/references/`（設計原則）

### 対象外

- 個別コマンド定義
- case-runコマンド

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-command-authoring/references/` | 後方互換性維持の設計原則を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-command-authoring/references/`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 「条件分岐の境界（if/elseの分岐点）」のみ言及。後方互換性維持の設計原則なし

## 制約

- 既存のcommand-authoring referencesを変更しない
- 新規セクションとして追加
- 具体的なパターン例を含める

## 受け入れ条件

- [ ] command-authoring referencesに後方互換性維持の設計原則が追加されている
- [ ] 分岐点のみの変更パターンが例示されている
- [ ] git mvを使用すべき場面が明記されている
- [ ] 既存のreferencesの内容が変更されていない

## 元learning item / 根拠

- **要約**: コマンド拡張時の後方互換性維持パターンの明文化
- **根拠**: 2件の事例（Markdownコマンド定義の段階的拡張、skill rename時のdirectory move）で、既存フローを壊さない拡張パターンが確立されていたが明文化されていなかった
- **再発条件**: 既存コマンドに新機能・新モードを追加する場合、ファイル・ディレクトリのリネームを委譲する場合
- **横展開可能性**: 中程度。コマンド拡張時に発生

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: なし
