# intake: AUTOGEN ブロック陳腐化 4 SPEC（IR-005 の ADR→Decision 表記ずれ、測定 block 古データ）

## 発生日

2026-08-15

## 発生元

- Issue: 2129（OU-002）
- 取得元: PR 2133 本文 `## Findings / Capture候補` intake 節（case-run の /repo/docs-check 実行時に検出。.agentdev/ への書き込み禁止により intake item として未保存→case-close で回収）

## 問題事象

AUTOGEN ブロックの陳腐化が 4 SPEC で残存する。

- `docs/specs/integrity/integrity-rule-catalog.md`: IR-005 の ADR→Decision 表記ずれ
- `docs/specs/integrity/rule-ownership.md`: 同系の用語 drift
- `docs/specs/quality/req-health-metrics.md`: 測定 block の古データ
- `docs/specs/quality/spec-health-metrics.md`: 測定 block の古データ

`generate_indexes.ts` の再生成で解消可能。

## 影響

- `check_autogen_freshness.ts` が当該 block を stale として検出し続ける（TS-005 の docs-check 実行で EXIT 1 要因の一部）
- 索引の実体と frontmatter 実ファイルの乖離が持続する

## 発生局面

実装（case-run の /repo/docs-check 実行、既存指摘の観察）

## 検知方法

`check_autogen_freshness.ts` の stale AUTOGEN block 検出（PR 2133 テスト証拠 TS-005 に記録）。

## 想定される対応方向

- `generate_indexes.ts` を DEC モデル（`docs/decisions/` + `decision-*` block ID）へ追随させた上で再生成を実行する（前提: 後述の関連 item の解消）
- 既存 item `intake-2026-08-11-autogen-block-inconsistency.md`（integrity-rule-catalog と rule-ownership の 2 ファイルを記載）の補完位置づけ。本 item は 4 ファイル全体と IR-005 表記ずれの詳細を追加する
- 対応要否・優先度は backlog-review で判断する

## 関連

- Issue: 2129（OU-002）, PR: 2133
- 既存 intake: `.agentdev/intake/inbox/intake-2026-08-11-autogen-block-inconsistency.md`（同族・2 ファイル記載版）
- 関連 learning: `.agentdev/learning/inbox.md`「autogen-index-regeneration-diff 拡張check の指定ツール generate_indexes.ts が adr-to-decision rename 未追随で EXIT_ERROR」（stale 4件の観測記録を含む）
- 前提障害: `.agentdev/intake/inbox/intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md`（generate_indexes.ts が docs/adr/README.md 前提で実行不能）

## 出典引用

PR 2133 本文 `## Findings / Capture候補` intake 節より:

> AUTOGEN ブロック陳腐化: `docs/specs/integrity/integrity-rule-catalog.md`（IR-005 の ADR→Decision 表記ずれ）、`docs/specs/integrity/rule-ownership.md`、`docs/specs/quality/req-health-metrics.md`、`docs/specs/quality/spec-health-metrics.md`。`generate_indexes.ts` の再生成で解消可能

## タグ

#intake #autogen #stale-block #ir-005 #generate-indexes #pre-existing
