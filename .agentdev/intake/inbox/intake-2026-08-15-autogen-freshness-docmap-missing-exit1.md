# intake: check_autogen_freshness.ts が削除済み docs/DOC-MAP.md を必須対象とし EXIT 1（docmap-inventory）

## 発生日

2026-08-15

## 発生元

- Issue: 2129（OU-002）
- 取得元: PR 2133 本文 `## Findings / Capture候補` intake 節（case-run の /repo/docs-check 実行時に検出。.agentdev/ への書き込み禁止により intake item として未保存→case-close で回収）

## 問題事象

`check_autogen_freshness.ts` が block_id=docmap-inventory の検査で `docs/DOC-MAP.md` を前提としており、EXIT 1 を返す。`docs/DOC-MAP.md` は REQ-013（DOC-MAP 依存除去）で意図的に削除済み（commit 87f00c48、#1958）であり、検査ツールが削除後の構成に追従していない。

## 影響

- `/repo/docs-check`（TS-005 等）で EXIT 1 が常態化し、他の検知と混在して NG 判定の判別コストが増す
- 意図削除されたファイルを検査対象に残す構成は、freshness gate 全体の信頼性を下げる

## 発生局面

実装（case-run の /repo/docs-check 実行、既存指摘の観察）

## 検知方法

`check_autogen_freshness.ts` の実行で EXIT 1（block_id=docmap-inventory、PR 2133 テスト証拠 TS-005 に記録）。

## 想定される対応方向

- `check_autogen_freshness.ts` から docmap-inventory block 検査を除去、または `docs/DOC-MAP.md` 不存在時の skip を正当化する設定・実装変更
- DOC-MAP 削除（REQ-013）を横断是正する工程で配下 checker の追従検査が機能しなかった事例。類似の `generate_indexes.ts` 未追随（`intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md`）と同根の対応候補
- 対応要否・優先度は backlog-review で判断する

## 関連

- Issue: 2129（OU-002）, PR: 2133
- 削除由来: commit 87f00c48（DOC-MAP 削除 #1958、REQ-013 DOC-MAP 依存除去）
- 同根 item: `.agentdev/intake/inbox/intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md`

## 出典引用

PR 2133 本文 `## Findings / Capture候補` intake 節より:

> `docs/DOC-MAP.md` 欠落による `check_autogen_freshness.ts` EXIT 1（block_id=docmap-inventory）

## タグ

#intake #autogen-freshness #doc-map #deleted-file-residual #stale-tooling #pre-existing
