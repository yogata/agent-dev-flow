# 配布bundleの資産相対解決

## 背景
offline bundleのruntime解決をビルド場所から独立させる必要がある。

## 問題
辞書等のruntime資産やライブラリ既定解決がビルド場所の絶対パスに依存すると、worktree削除後のstandalone実行に失敗する。

## 望ましい変更
必要なデータ資産を実ファイルで同梱し、公式上書き経路で配布物相対へ解決する。bundle単体実行で検証する。

## 対象範囲
### 対象
- bundleに同梱するデータ資産、相対解決、standalone検証
### 対象外
- runtimeでnode_modulesを再取得する方式

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge / procedures | offline bundle手順（未特定） | 資産同梱と配置独立検証を記録 |

## 既存対策確認
- **確認結果**: 明示契約は未確認
- **該当ファイル**: なし
- **ギャップ分類**: なし
- **ギャップ詳細**: 配布場所独立の資産解決手順が未整備

## 制約
ビルド時絶対パスを配布bundleへ焼き付けない。

## 受け入れ条件
- [ ] 必須資産がbundleに同梱される
- [ ] clone先やworktreeが異なっても同じ解決結果になる
- [ ] ビルド元削除後のstandalone実行に成功する

## 元learning item / 根拠
- **要約**: Bun.buildの配置場所依存回避
- **根拠**: #4のrequire.resolve展開観測とoffline bundle検証
- **再発条件**: build-time解決結果をruntimeへそのまま持ち込む場合
- **横展開可能性**: データ資産を含む全standalone bundle

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2725
