# Intake Item: 採番管理 SPEC 候補（REQ/ADR/IR の欠番・未使用番号の扱い統一）

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 発見セクション: PR 本文 `## SPEC確定候補` SC-001（case-close Step 3-2 (c) 見送り）
- 検査ルート: case-close Step 3-2 SPEC 確定フロー
- 原因分類: SPEC 候補（artifact_actions 空制約により case-close では新規 SPEC 作成せず見送り）

## 問題

Issue #1596 の監査フェーズで検出された REQ-0157（REQ 系の純粋な未使用番号）と IR-045（IR 系の欠番、IR-044 → IR-046）の取り扱いについて、REQ と IR で方針が統一されていない。

現状:
- `docs/requirements/README.md` に「未使用番号は欠番として維持、再利用しない」の記載あり（REQ 系）
- IR 系（`docs/specs/integrity/rules/IR-*.md`）には同様の明文化なし
- ADR 系（`docs/adr/ADR-*.md`）にも採番管理 SPEC なし

## 推奨修正対象

採番管理 SPEC（仮称 `docs/specs/foundations/numbering-policy.md` または `docs/specs/responsibilities/` 配下）を新設し、REQ/ADR/IR の欠番・未使用番号の扱いを統一する。

1. 欠番・未使用番号の取り扱い（維持・再利用不可・リサイクル条件等）
2. 採番割当の責務所在（req-save, adr file manager, spec-save 等）
3. 番号 schema（REQ-{NNNN}, ADR-{NNNN}, IR-{NNN} 等の桁数・接頭辞）
4. 番号とファイル名の対応規則

本 Issue（#1596）は work_type=maintenance かつ artifact_actions=[] で「REQ/ADR/SPEC 変更なし」制約（CR-006）のため、case-close Step 3-2 で見送り (c) とし、再編フェーズ以降の req-define / spec-save で判断する。

昇格先候補: intake-promote で採否判断。採用時は再編フェーズの SPEC 新設 RU として backlog 化。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`（AG-005 セクション F-003, F-004）
- 既存関連: `docs/requirements/README.md`（REQ 系の欠番維持方針記載）
- 関連 intake item: `intake-2026-07-19-audit-ledger-governance-index-inconsistencies.md`（F-003, F-004 を包摂）
- トレーサビリティ: PR #1597 SPEC確定候補 SC-001
