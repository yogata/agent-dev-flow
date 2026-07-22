# 採番管理 SPEC 候補（REQ/ADR/IR の欠番・未使用番号の扱い統一）

## 観測内容

- 発見 PR #1597、発見 Issue #1596（ともに CLOSED）。発見セクションは PR 本文 `## SPEC確定候補` SC-001（case-close Step 3-2 (c) 見送り）。
- Issue #1596 の監査フェーズで REQ-0157（REQ 系の純粋な未使用番号）と IR-045（IR 系の欠番、IR-044 → IR-046）を検出。両者の取り扱いについて系間で方針が統一されていない。
- 現状: `docs/requirements/README.md` に「未使用番号は欠番として維持、再利用しない」の記載あり（REQ 系のみ）。IR 系（`docs/specs/integrity/rules/IR-*.md`）には同様の明文化なし。ADR 系（`docs/adr/ADR-*.md`）にも採番管理 SPEC なし。

## 影響

低〜中。欠番・未使用番号の取り扱いが担当者・系によりブレる潜在リスク。直ちに壊れるものではないが、監査で継続検出される。

## 課題

REQ/ADR/IR の採番管理（欠番・未使用番号の扱い、採番割当責務、番号 schema、ファイル名対応規則）を統一する SPEC が未整備。REQ 系にのみ部分整備が存在し、IR 系・ADR 系が未カバー。

## 既存要件・仕様との関連

- REQ-0157: REQ 系純粋未使用番号（検出事例）。
- IR-045: IR 系欠番 IR-044 → IR-046（検出事例）。
- SC-001（PR #1597 SPEC 確定候補）: 本件のトレーサビリティ ID。
- 監査台帳 AG-005 セクション F-003, F-004: 検出元。
- `docs/requirements/README.md`: REQ 系の欠番維持方針記載（既存の部分整備。IR 系・ADR 系は陳腐化ではなく未整備）。

## 対応方針の方向性

採番管理 SPEC（仮称 `docs/specs/foundations/numbering-policy.md` または `docs/specs/responsibilities/` 配下）を新設し、REQ/ADR/IR の欠番・未使用番号の扱いを統一する。具体項目:

1. 欠番・未使用番号の取り扱い（維持・再利用不可・リサイクル条件等）。
2. 採番割当の責務所在（req-save, adr file manager, spec-save 等）。
3. 番号 schema（REQ-{NNNN}, ADR-{NNNN}, IR-{NNN} 等の桁数・接頭辞）。
4. 番号とファイル名の対応規則。

本件は work_type=maintenance かつ artifact_actions=[]（CR-006 制約）のため case-close Step 3-2 で見送り (c)。再編フェーズ以降の req-define / spec-save で判断する。
