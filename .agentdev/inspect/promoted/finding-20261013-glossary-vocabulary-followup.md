# glossary・vocabulary-registry への phase コマンド・工程駆動用語の追随追加

- 出所: inspect-docs 20261013T090730Z GR08（backlog-auto stage 1。REQ 担当 F3-DR1・Decision 担当 F5 統合）
- 種別: 表現是正（新規コマンド・用語の案内追随）
- 対象: docs/guides/glossary.md:7-28（コマンド表）および用語各節、docs/designs/authoring/vocabulary-registry.md

## GR08: guides（語彙整備: 新規コマンド・用語の案内欠落）

- category: guides（語彙整備: 新規コマンド・用語の案内欠落。REQ 担当 F3-DR1・Decision 担当 F5 の統合）
- target: `docs/guides/glossary.md:7-28`（コマンド表）および用語各節、`docs/designs/authoring/vocabulary-registry.md`
- evidence: 他の公開コマンド13件は全て「コマンド」表に掲載される一方、delta で追加された phase 系5コマンドの掲載がない。「工程駆動実行」「変更駆動」「検討テーマ」「テーマ正本」「外部AI検討」「工程遷移」「後継経路」等の REQ-110/111・DEC-057/058 で導入された中核用語も glossary・vocabulary-registry の双方に未登録（grep 0件確認）。delta 内で glossary は更新済み（ローカル版パス修正）だが工程駆動系は未追加。
- severity: low
- confidence: high（欠落は事実）/ medium（glossary・語彙レジストリに網羅義務の明文はない）
- source_of_truth: REQ-110/111、DEC-057/058、src/common/commands/agentdev/README.md:22-26、REQ-094（用語選択基準）
- recommended_route: 表現是正候補（コマンド表への5コマンド追記と主要用語の追加を検討）。網羅検査は docs-check ルール候補（新 REQ 主要語彙と glossary の差分検査）。
- ng_classification: 今回修正対象候補（欠落は今回 delta 由来）。
- notes: glossary は選択掲載スタイルであり、必須欠落とは断定しない。

## 処置方針

1. glossary.md のコマンド表へ phase 系5コマンド（phase-tasks-create / phase-tasks-update / phase-artifacts-update / phase-review / phase-transition）を追記する（既存13コマンド全掲載の事実との整合）
2. 「工程駆動実行」「変更駆動」「検討テーマ」「テーマ正本」「外部AI検討」「工程遷移」「後継経路」等の中核用語の glossary・vocabulary-registry への追加を検討する
3. 新規コマンド・新 REQ 主要語彙と glossary の差分検査（網羅検査）は docs-check ルール候補として、採用済み成果物の受け入れ条件に含める（独立 route 化しない）

## 処置判断の根拠（inspect-promote 2026-10-13）

- glossary.md 全文中の `phase-` 記述が 0件であることを grep 実確認（コマンド表への追随漏れは既存13コマンド全掲載の事実と対比して確定）
- 選択掲載スタイルのため必須欠落とは断定しないが、追記内容は一意（5コマンド）であり追随漏れの是正要求として成立

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: glossary の phase 記述 0件（grep 実確認）と既存コマンド全掲載の事実で追随漏れを再確認。
- Jev 評価: promote（0.77）で最終判断と一致（観測 20261013T094827Z-5dc0 d17）。
