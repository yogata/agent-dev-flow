# Intake Item: check_integrity.ts（IR-061）の decision-* block 検査未実装と ADR/DOC-MAP 残余参照

## 発生源

- PR: #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1)
- 発生 phase: case-run 検証（AUTOGEN 再生成後の check_integrity 由来分類）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

`check_integrity.ts` の `checkIndexGenerationConsistency` は旧 `adr-*` block（docs/adr 不在下で skip）と `docmap-inventory`（DOC-MAP 不在下で skip）の検査は残存し、`docs/decisions/README.md` の `decision-*` block は IR-061 検査対象外のまま。ADR/DOC-MAP 系残余参照（`docs/adr` パス参照、`ADR_*_BLOCK_ID` import 等）も残存する。OU-002（#2136、check_integrity NG 由来分類）での処理を想定。PR #2148 の AUTOGEN 再生成により OU-002 参照元の NG は 21→17 に減少済み。

## 推奨対応

OU-002（#2136）の実装時に IR-061 の decision-* block 検査への移行と残余参照の由来做類を含めて処理する。

## 関連

- Issue: #2135 (CLOSED), Epic: #2134
- PR: #2148 (Findings / Capture候補 セクション intake 1)
- 現行 generate_indexes.ts は `collectAdrFiles`・`generateDocMapInventory` 等を check_integrity.ts（IR-061）向けに温存
