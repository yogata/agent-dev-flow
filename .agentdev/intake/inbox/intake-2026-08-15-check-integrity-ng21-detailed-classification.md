# intake: check_integrity.ts 実行時 NG=21 の詳細分類（由来精査・解消計画の独立確認候補）

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- Issue: #2108（OU-008a 全受け入れ条件再検証）
- 取得元: PR #2118 本文「## Findings / Capture候補」>「### intake」

## 問題事象

`check_integrity.ts` 実行時の NG=21（ADR-006 / REQ-0145 参照、pre-audit-baseline-20260811.md・agentdev-doc-map.md への broken link、AUTOGEN 不整合 4件等）が残存している。OU-008a v1/v2 の spot-check では legacy・superseded 由来の pre-existing と整合するが、TS-005 の列挙対象外のため AC 判定には用いられておらず、21件全件の詳細分類は独立した確認候補のままになっている。

## 影響

- NG=21 が「参考記録」扱いで未整理のため、remediation 後も check_integrity が exit 1 を返し続け、新規 NG の検出ノイズになる
- v2 記録の内訳（broken-file-link 11 / index-generation-consistency 4 / broken-adr-ref 2 / broken-req-ref 1 / command-capture-duty 1 / skill-category-gap 1 / workflow-status-prohibition 1）が分類まで精査されていない

## 発生局面

検証（OU-008a TS-005 実行時の参考記録、v1・v2 ともに同数・同分類）

## 検知方法

`check_integrity.ts` 実行時の NG=21 集計行（v2 §2.3: OK 223 / NG 21 / Warning 9 / Info 129、いずれも legacy・superseded・AUTOGEN 由来の pre-existing で route=intake）。

## 想定される対応方向

- 21件全件の由来分類（legacy / superseded / AUTOGEN / 実欠陥）を独立作業として精査する
- 分類結果に応じた解消計画（リンク修正、index 再生成、参照更新）を立案する
- 部分重複する既存 intake と統合して扱うかは backlog-review で判断する

## 関連

- Epic: #2099, Issue: #2108（OU-008a）, PR: #2118
- v2 報告（issuecomment-5299817790）§2.3 の参考記録
- 部分重複（AUTOGEN 4件分）: intake-2026-08-11-autogen-block-inconsistency.md（generate_indexes.ts 再実行による解消候補）
- 部分重複（generate_indexes 欠陥）: intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md
- ng-baseline: `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md`

## 出典引用

PR #2118 本文「## Findings / Capture候補」>「### intake」より:

> 発見元: 本 PR の参考実行。内容: check_integrity.ts 実行時の ng=21（ADR-006 / REQ-0145 参照、pre-audit-baseline-20260811.md・agentdev-doc-map.md への broken link、AUTOGEN 不整合 4件等）。spot-check では legacy・superseded 由来の pre-existing と整合するが、TS-005 の列挙対象外のため AC 判定には用いていない。詳細分類は独立した確認候補。分類: intake

## タグ

#intake #check-integrity #ng-classification #broken-link #pre-existing #epic-2099
