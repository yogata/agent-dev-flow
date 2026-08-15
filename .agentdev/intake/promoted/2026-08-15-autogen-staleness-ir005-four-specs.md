# 4 SPEC の AUTOGEN ブロック陳腐化（IR-005 表記ずれ、測定 block 古データ）

## 観測内容

4 SPEC で AUTOGEN ブロックの陳腐化が残存している。IR-005 の ADR→Decision 表記ずれ、rule-ownership の用語 drift、2 つの metrics block の古データ。`generate_indexes.ts` の再生成で解消可能だが、同ツールが docs/adr/README.md 前提で dry-run 実行不能な前提障害がある（別 item「generate_indexes.ts が削除済み ADR README 前提で実行不能」と連動）。

## 影響

- AUTOGEN ブロックの内容と実体の乖離が読む agent に誤情報を与える
- IR-061（AUTOGEN 整合）違反状態が継続する

## 課題

generate_indexes.ts の前提障害修正（別 item）を先行させた上で、4 SPEC の AUTOGEN ブロックを再生成する。実行順序の依存関係を backlog-review の depends_on 解決で明確化する。

## 既存要件・成果物との関連

- 対象: 陳腐化した 4 SPEC（IR-005 関連、rule-ownership、metrics 2件）
- 関連: generate_indexes.ts 前提障害（promoted item「2026-08-15-generate-indexes-requires-removed-adr-readme」）、IR-061

## 出典

- 発生日: 2026-08-15
- 取得元: 検査・観測
- 元 item: intake-2026-08-15-autogen-staleness-ir005-four-specs.md
