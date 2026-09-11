# Bun.buildのrequire.resolve絶対パス展開

## 背景
配置場所独立のoffline bundleを検証した。

## 問題
Bun.buildは`require.resolve`をビルド時の絶対パスへ展開し、ビルド元worktree削除後にruntime解決不能となる。

## 望ましい変更
runtime資産は実ファイルとして同梱し、既定解決がビルド場所を参照する依存は公式の上書き経路で配布物相対へ固定する。

## 対象範囲
### 対象
- offline bundleの資産同梱と依存解決方式
### 対象外
- Bun.build自体の変更

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge / constraints | offline bundle運用手順（未特定） | build-time path焼き付きの回避条件を記録 |

## 既存対策確認
- **確認結果**: 既存の明示契約は確認できず
- **該当ファイル**: なし
- **ギャップ分類**: なし
- **ギャップ詳細**: 配置場所独立性の検証知識が未整備

## 制約
ビルド時の絶対パスをruntimeの必須解決経路に残さない。

## 受け入れ条件
- [ ] runtime資産がbundleとともに配布される
- [ ] ビルド元ディレクトリ削除後もstandalone実行できる
- [ ] 配布物相対の解決を検証する

## 元learning item / 根拠
- **要約**: Bun.buildのrequire.resolve展開による配置依存
- **根拠**: PR #2730でビルド時絶対パスの焼き付きとworktree削除後の解決不能を確認
- **再発条件**: require.resolve依存を未検証のままoffline bundle化する場合
- **横展開可能性**: Bunで配置場所独立bundleを作る全ケース

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2725
