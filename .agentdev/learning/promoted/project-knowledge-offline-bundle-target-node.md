# Windows/Bun offline bundleの生成条件

## 背景
Windows/Bunで配布用単一ESM bundleを生成した際、consumer実行時の互換性問題が発生した。

## 問題
`target: node`を指定せず、`// @bun`バナーを残したbundleはconsumer側でUTF-8 parse errorになり得る。

## 望ましい変更
offline bundle生成時のtargetをnodeに固定し、生成後に`// @bun`バナーを除去する。配布同梱前にconsumer実行系で起動確認する。

## 対象範囲
### 対象
- Windows/Bunのoffline bundle生成・同梱・起動検証手順
### 対象外
- consumer側の個別ランタイム変更

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge / procedures | offline bundle生成手順（未特定） | target、バナー除去、consumer起動確認を明記 |

## 既存対策確認
- **確認結果**: 既存の明示手順は確認できず
- **該当ファイル**: なし
- **ギャップ分類**: なし
- **ギャップ詳細**: 配布bundle生成条件の正規知識が未整備

## 制約
bundleはnode_modulesやビルド環境のBun固有構文に依存させない。

## 受け入れ条件
- [ ] bundle生成設定に`target: node`がある
- [ ] `// @bun`バナーを除去している
- [ ] consumer実行系で起動できる

## 元learning item / 根拠
- **要約**: Windows/Bun offline bundleの生成条件固定
- **根拠**: PR #2729でtarget指定とバナー除去なしのconsumer parse errorを確認
- **再発条件**: Bun既定設定のままbundleを配布する場合
- **横展開可能性**: Windows/Bunでoffline配布を行う全ケース

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2724
