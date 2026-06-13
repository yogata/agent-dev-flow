# SPEC 打消し線残存 + REQ 旧 status 語彙の checker 例外不足

## 観測

2 種類の document drift が混在する:

### 1. 打消し線残存（doc 修正対象）

- `docs/specs/integrity-contracts.md:85` — `~~pattern 定義妥当性（REQ-0108-026〜038, 反転済）~~ → frontmatter 禁止フィールド検査に統合済`
- `docs/specs/system.md:41` — `~~case-close で取り込み済み staging stub を…~~`

いずれも REQ-0101-041（履歴は Update Notes へ）および REQ-0108-204（打消し線検出）に抵触。実在する doc 修正対象。

### 2. 旧 status 語彙の negative example（checker 例外追加対象）

- `docs/requirements/REQ-0101.md:42` (REQ-0101-028) と `docs/requirements/REQ-0112.md:16` (REQ-0112-001) は `superseded-by:[ADR-XXXX]` を含む
- いずれも正規化ルールにおいて「使用しないこと」として引用される **negative example**
- REQ-0108-237（negative example は検査例外）がこのケースを想定しているが、checker に例外が未実装

## 影響

- 打消し線: 文書可読性の低下。REQ-0101-041 違反
- 旧語彙: checker が正常な negative example に警告を発し、ノイズを生成

## 課題

### 打消し線（1）
当該行を Update Notes へ移動または削除する。

### 旧語彙（2）
checker（`workflow-status-prohibition` 系）に negative example の例外ルールを追加する。文書側を修正すると正規化ルールの説明が破綻するため、checker 側の修正が正しい。

## 既存要件との関連

- **REQ-0101-028 / REQ-0101-041**: frontmatter 正規化ルール・履歴の Update Notes 移行
- **REQ-0108-204**: 打消し線検出
- **REQ-0108-237**: negative example は検査例外

## 対応方針の方向性

- 打消し線: doc 修正（document-drift、軽微）
- 旧語彫: checker 例外追加（integrity-rule-gap）。checker-FP-calibration artifact と同系列
- REQ-0108-222（同一是正方針で統合可否判断）に照らし、分離も統合も可能

## 元 item 参照

- `.agentdev/intake/inbox/2026-06-14-document-drift-strikethrough-and-old-status-vocab.md`
