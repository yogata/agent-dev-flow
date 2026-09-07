# repo-local 資産の裸 REQ 表記現行化

## 観測内容
repo-agentdev-integrity の SKILL.md、check_integrity.ts、cli_utils.ts、cli_utils.test.ts に裸の `REQ-0145-014` 表記が残る。配布物側の同種表記は既に現行化されたが、repo-local 資産は対象外だった。

## 影響
過去版番号の裸表記が現行番号参照と混同され、v2 表記規約と repo-local 資産の間に不整合が残る。

## 課題
正当な裸参照と区別しながら、該当箇所を `v2:REQ-0145-014` へ現行化するか判断する。

## 既存要件・正規成果物との関連
Issue #2571、PR #2590、REQ-057-014 系、repo-agentdev-integrity の repo-local 資産。
