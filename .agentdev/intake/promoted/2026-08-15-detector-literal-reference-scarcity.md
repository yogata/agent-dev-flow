# detector リテラル参照稀少（約44件の IR が意味ベース依存）への命名規約導入

## 観測内容

全59 IR のうち約44件が detector 実装とのリテラル参照を持たず意味ベース依存の状態。TS-008 完全達成や AG-005 横断的再評価を阻害する構造的要因になっている。

## 影響

- IR から detector 実装への機械的逆引きができない
- TS-008 完全達成および AG-005 横断的再評価が構造的に阻害される

## 課題

detector 命名規約（関数名 `checkIR_NNN_`、`@ir` タグ等）を導入し、機械的逆引きを可能にする。Phase 4/5 の作業スコープに含めるか独立作業とするかは backlog-review で優先度判断する。

## 既存要件・成果物との関連

- 対象: detector 関数命名規約、JSDoc タグ標準化
- 関連: TS-008、AG-005、Epic #2076（Phase 4/5）

## 出典

- 発生日: 2026-08-11
- 取得元: REQ-028 Phase 3 設計過程の観測
- 元 item: intake-2026-08-11-detector-literal-reference-scarcity.md
- 注記: intake-promote 経路C review で採用（item が backlog-review での優先度判断を明記）。Phase 進捗は backlog-review 分析時に再確認すること
