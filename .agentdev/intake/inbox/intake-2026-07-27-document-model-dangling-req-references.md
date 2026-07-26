# Intake Item: document-model.md の dangling REQ 参照（REQ-001-056/058 再利用による顕在化）

## 発生源

- PR: #1819 (Issue #1816 / OU-004, Epic #1812 Wave 1)
- 発生 phase: case-run 検証（document-model SPEC「accepted ADR の意味的不変」節検証時、STEP 4 context 再確認）
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/specs/foundations/document-model.md` の `## accepted ADR の意味的不変` 節外（target_area 外）に、commit ed9ceb56 の REQ-001-056..060 APPEND によって意味が変化した REQ ID への参照が2箇所存在する。これらは commit ed9ceb56 より前から存在した dangling 参照（REQ-001-056/058 は当時未割当）が、APPEND によって実体のある別要件へ紐付けられたことで顕在化したもの。

## 推奨修正対象

`docs/specs/foundations/document-model.md` の2箇所:

1. **L27**: `（REQ-001-058）` を「新規ファイル分割は行わず、既存2ファイル間の重複削除で運用する」へ付与
   - 問題: REQ-001-058 は「後継 ADR を必要とする意味変更は6件」へ再利用された。参照先要件行と文意が不一致
   - 修正候補: 正しい REQ ID へ修正（候補: REQ-001-001 周辺、要確認）
2. **L139**: `廃止（retire）候補の判定基準（REQ-001-056）:`
   - 問題: REQ-001-056 は「accepted ADR を意味的に不変とし…」へ再利用された。参照先要件行と文意が不一致
   - 修正候補: 正しい REQ ID へ修正（候補: REQ-001-053 周辺の廃止関連、要確認）

## 推奨対応

別 Issue で正しい REQ ID へ修正。target_area（`## accepted ADR の意味的不変`）の検証結果には影響しないが、REQ ID 再利用の副作用として文意不整合が顕在化しているため、早めの cleanup が望ましい。

## 関連

- references: docs/specs/foundations/document-model.md (L27, L139)
- Issue: #1816 (CLOSED), Epic: #1812
- PR: #1819 (Findings / Capture候補 セクション)
- REQ: REQ-001-056（accepted ADR の意味的不変）、REQ-001-058（意味変更6件）
- commit: ed9ceb56（REQ-001-056..060 APPEND、dangling 参照顕在化の起点）
