# issue_list search のトークン正規化による偽陰性リスクの追記

処分区分: 5 既存対策の更新（fix gap）

## 背景

RU-0147 再実行で、issue_list の server-side search（title 検索）におけるトークン正規化の不一致により冪等検出が偽陰性になった。ハイフン入り識別子（例: RU-0147）は検索 API 側で正規化された形でトークン分割されるため、クエリ側の表記と一致せず、空の成功応答（検索結果 0 件の正常応答）が返る。

## 問題

issue-operation-safety.md の search 手順に以下の偽陰性リスクの記載がない:

1. ハイフン入り識別子の正規化形不一致による偽陰性
2. 空配列の成功応答は「対象 Issue が存在しない」ことの証拠にならない
3. unfiltered な一覧取得によるフォールバック確認が手順化されていない

偽陰性のまま新規起票すると重複 Issue が生成される。

## 望ましい変更

issue-operation-safety.md の search 節に、(1) トークン正規化不一致による偽陰性の注意、(2) 空配列成功応答を不存在の証拠としない原則、(3) unfiltered fallback（state 等のフィルタを外した一覧での再確認）を追記する。

## 対象範囲

### 対象

- src/common/skills/agentdev-issue-management/references/issue-operation-safety.md（search 手順節）

### 対象外

- agentdev_gh の search 実装変更（GitHub API 側仕様のため回避運用で対応）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-issue-management/references/issue-operation-safety.md | search 節へ偽陰性注意・不存在証拠の原則・unfiltered fallback を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: issue-operation-safety.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: search の偽陰性リスクと fallback 手順の記載なし

## 制約

- GitHub search API の正規化仕様は制御外のため、クライアント側の運用で対応する

## 受け入れ条件

- [ ] search 節に偽陰性リスクと unfiltered fallback 手順が記載されている

## 元learning item / 根拠

- **要約**: issue_list search のトークン正規化不一致による冪等検出の偽陰性
- **根拠**: 2026-09-30 RU-0147 再実行: ハイフン入り識別子の検索で空の成功応答が返り冪等検出が偽陰性になった
- **再発条件**: ハイフン・アンダースコア等を含む識別子で server-side search を利用した場合
- **横展開可能性**: agentdev_gh issue_list search を利用する全 workflow の冪等検出

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation
- **関連Issue**: RU-0147
