# doc-diagnostics の削除済み agentdev-doc-map 言及残存

## 観測内容

agentdev-doc-diagnostics の description と references/finding-output-contract.md が、REQ-013 段階4a で削除済みの agentdev-doc-map を「探索順」担当として言及している。

## 影響

- 読む agent が存在しないスキルを辿る恐れがある
- 配布物の参照整合性が損なわれている

## 課題

description・references から agentdev-doc-map への言及を除去する。

## 既存要件・成果物との関連

- 対象: agentdev-doc-diagnostics SKILL.md description、references/finding-output-contract.md
- 関連: agentdev-doc-map 削除（REQ-013 段階4a）

## 出典

- 発生日: 2026-08-15
- 取得元: inspect 系診断・観測
- 元 item: intake-2026-08-15-doc-diagnostics-deleted-doc-map-mention.md
- 注記: 同スキル内の関連残存（探索順委譲先表記、旧手順番号参照）は別 promoted item 2件。3件の統合可否は backlog-review で判断
