# case-run の checker 実行記録の PR 検証差分必須行化（E4-1 初検出の前置化）

## 背景

Case #3391 Wave 1 の #3397（PR #3402）で、PR 本文の検証差分に check_distribution_boundary の記録が存在せず、case-close E4-1 最終 gate で concrete-id 4 件 / concrete-path 2 件が初検出され、当該子 Issue が blocked（Wave 1 マージ対象外）になった。case-run STEP-S5 の事前 gate で検出・記録していれば Wave 境界の blocked と Wave 2 前提崩れを避けられた。

## 問題

case-run 側で配布物に concrete ID を含む実装を行った際、checker の実行・記録が手順上必須化されておらず、記録欠落自体を検査する仕組みがない。

## 望ましい変更

case-run STEP-S5 の checker 実行記録を PR 本文品質メトリクス表の必須行とする（記録欠落自体を検査する形）、または PR テンプレート（agentdev-workflow-templates）の品質メトリクス表へ配布依存境界行を必須追加する。

## 対象範囲

### 対象

- case-run command の STEP-S5 手順（配布依存境界 checker の実行・記録）
- PR テンプレート（agentdev-workflow-templates の品質メトリクス表）

### 対象外

- E4-1 最終 gate の基準・契約（現行どおり機能した）
- checker 本体の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布command | src/common/commands/agentdev/case-run.md 側手順 | checker 実行記録の必須行化 |
| template | agentdev-workflow-templates の PR テンプレート | 品質メトリクス表への配布依存境界行の必須追加 |

## 既存対策確認

- **確認結果**: 既存対策なし（記録欠落検出の仕組みなし）
- **該当ファイル**: なし
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 最終 gate（E4-1）での検出は機能したが、case-run 段階の前置検出・記録が必須化されていない

## 制約

- 二重構造（case-run 前置 + case-close 最終 gate）は維持する（最終 gate を廃止しない）

## 受け入れ条件

- [ ] case-run STEP-S5 で checker 実行記録が必須行として扱われる
- [ ] 記録欠落が検査可能な形式（テンプレート必須行等）になる

## 元learning item / 根拠

- **要約**: case-run 側の checker 記録欠落が E4-1 初検出・blocked に至った事象と前置化の候補（1件）
- **根拠**: Case #3391・PR #3402（E4-1 違反 6件で blocked → fix commit cc3bb90f で解消・再マージ 42d57d1e）
- **再発条件**: case-run 側で配布物に concrete ID を含む実装を行い checker を実行・記録せずに PR を作成する場合
- **横展開可能性**: 配布物変更を伴う全 case-run

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし
