# check_integrity.ts（IR-061）の decision-* block 検査未実装と ADR/DOC-MAP 残余参照

## 観測内容

`check_integrity.ts` の `checkIndexGenerationConsistency` は旧 `adr-*` block（docs/adr 不在下で skip）と `docmap-inventory`（DOC-MAP 不在下で skip）の検査は残存し、`docs/decisions/README.md` の `decision-*` block は IR-061 検査対象外のまま。ADR/DOC-MAP 系残余参照（`docs/adr` パス参照、`ADR_*_BLOCK_ID` import 等）も残存する。OU-002（#2136、check_integrity NG 由来分類）での処理を想定。PR #2148 の AUTOGEN 再生成により OU-002 参照元の NG は 21→17 に減少済み。

## 影響

- decision README の AUTOGEN ブロックが IR-061 の鮮度検査対象外であり、陳腐化が機械検出されない
- 旧体系（adr/docmap）向けコードが残存し、保守対象が増えている

## 課題

IR-061 の decision-* block 検査への移行と残余参照の由来做類を含めて処理する。なお現行 generate_indexes.ts は `collectAdrFiles`・`generateDocMapInventory` 等を check_integrity.ts（IR-061）向けに温存していた（capture 当時の記録）。

## 既存要件・成果物との関連

- 対象: check_integrity.ts checkIndexGenerationConsistency、generate_indexes.ts
- 関連: ng-baseline N 系（OU-002 由来分類）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1) Findings / Capture候補 セクション intake 1
- 元 item: intake-2026-08-16-ou001-check-integrity-decision-block-migration.md
