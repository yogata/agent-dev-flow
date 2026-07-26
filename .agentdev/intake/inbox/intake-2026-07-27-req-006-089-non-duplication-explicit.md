# Intake Item: REQ-006-089 へ case-run internal lifecycle 非複製の明示記載缺失

## 発生源

- PR: #1827 (Issue #1822 / OU-001, Epic #1821 Wave 1)
- 発生 phase: case-run acceptance criteria 検証（TS-002: AG-001 orchestration stage の所有者）
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/requirements/REQ-006.md` の REQ-006-089（case-auto orchestration stage モデル）は、case-auto が orchestration stage を所有することを示すが、case-run internal lifecycle を複製しない 旨の明示記載がない。TS-002 pass_criteria は当該明示記載を要求するが、現行 REQ-006-089 本文は「orchestration stage モデルを採用し」までで止まる。

非複製原則自体は SPEC `docs/specs/responsibilities/responsibility-boundary-purification.md` L78-79 および配布 command（case-auto.md, case-run.md）に明記済みであり、機能的欠陥はない。しかし REQ-006-089 は当該原則の正規 REQ 所有位置として、明示記載を備えることが望ましい。

## 推奨修正対象

`docs/requirements/REQ-006.md` REQ-006-089 行（L109）。

- 現行: `case-auto は orchestration stage モデル（stage 1 case-open 順次、stage 2 case-run 並列、stage 3 case-close 順次）を採用し各 orchestration stage を前 stage 完了後に開始すること`
- 修正候補: 上記に続き `case-run internal lifecycle を複製しないこと` を付与

## 推奨対応

別 req-define / req-save で REQ-006-089 へ「case-run internal lifecycle を複製しない」を追記する UPDATE を起票する。REQ-006 の UPDATE は req-save scope であり case-run scope では編集できないため、本 intake 経由で次工程へ委ねる。

## 関連

- references: docs/requirements/REQ-006.md (L109, REQ-006-089)
- SPEC 補完: docs/specs/responsibilities/responsibility-boundary-purification.md (L78-79)
- Issue: #1822 (CLOSED/COMPLETED), Epic: #1821 (CLOSED/COMPLETED)
- PR: #1827 (Findings / Capture候補 セクション「REQ-006-089 の非複製明記缺失」)
- test strategy: TS-002 (record-in-findings 扱いで合格)
