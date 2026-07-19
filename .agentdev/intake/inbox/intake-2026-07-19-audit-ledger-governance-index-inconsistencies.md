# Intake Item: 監査台帳（PR #1597）で検出された ADR/REQ/IR 索引類の定量不整合 6件

## 発生源

- 発見日時: 2026-07-19
- 発見 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 発見セクション: PR 本文 `## Findings / Capture候補` intake サブセクション F-001〜F-006
- 検査ルート: case-run（監査フェーズ AG-001 実ファイル列挙 + AG-005 索引類照合時）
- 原因分類: 既存不整合（人手更新漏れ、追加時の整合性未確認）

## 問題

Issue #1596（AgentDevFlow 統合再編計画 第1フェーズ: 監査台帳生成）の AG-005（定量不整合検出）で検出された6件の不整合。いずれも監査台帳 `.agentdev/drafts/audit-ledger-governance-system-audit.md` に記録済み。

| ID | 対象 | 不整合内容 |
|----|------|-----------|
| F-001 | `docs/adr/README.md` L7 キャプション | 「承認済みステータス（accepted）の ADR-01XX **24件**」vs 実測 25 件。ADR-0137 追加時の更新漏れと推定 |
| F-002 | `docs/adr/README.md` L44-69 ステータス別ビュー accepted リスト | ADR-0137 が欠落。実測 accepted 25件 vs リスト 24件 |
| F-003 | REQ 採番体系 | REQ-0157 が `docs/requirements/REQ-0157.md`（root）にも `docs/requirements/retired/REQ-0157.md`（retired）にも存在しない純粋な未使用番号 |
| F-004 | IR 採番体系 | IR-045 が `docs/specs/integrity/rules/IR-045-*.md` として存在しない欠番。IR-044 → IR-046 |
| F-005 | `docs/adr/README.md` L109-119 トピック別ビュー「ワークフロー」 | ADR-0137 が含まれない |
| F-006 | `docs/requirements/REQ-0102.md` | 79要件行で肥大化。ライフサイクル分類・正規所有者属性の UPDATE 時に SPLIT 検討が必要（CR-004 由来） |

## 推奨修正対象

本 Issue は artifact_actions 空（REQ/ADR/SPEC 変更なし、4硬制約遵守）のため、修正は再編フェーズで実施する。

- F-001, F-002, F-005: `docs/adr/README.md` のキャプション「24件」→「25件」修正、accepted リストとトピック別ビュー「ワークフロー」に ADR-0137 を追加。再編フェーズで 1 PR にまとめて対応可能
- F-003: REQ-0157 の取り扱い（欠番維持か再利用か）を再編フェーズの req-define で確定。`docs/requirements/README.md` に「未使用番号は欠番として維持、再利用しない」の記載があるため、欠番維持が基本方針だが REQ/IR で方針統一が必要（SC-001 に接続）
- F-004: IR-045 の取り扱い。F-003 と同じく採番管理方針の対象（SC-001 に接続）
- F-006: REQ-0102 の SPLIT 検討。再編フェーズの req-define で分割単位を策定

昇格先候補: intake-promote で採否判断。採用時は再編フェーズの RU として backlog 化。

## 関連

- 発見元 PR: https://github.com/yogata/agent-dev-flow/pull/1597
- 発見元 Issue: https://github.com/yogata/agent-dev-flow/issues/1596
- 監査台帳: `.agentdev/drafts/audit-ledger-governance-system-audit.md`（AG-005 セクション）
- 関連 SPEC 候補: SC-001（採番管理 SPEC 候補、F-003/F-004 を包摂）、SC-002（索引類自動生成 SPEC 候補、F-001/F-002/F-005 の人手更新漏れを根絶する候補）
- 関連 CR: CR-004（REQ-0102 SPLIT 検討、F-006 由来）
- トレーサビリティ: PR #1597 Findings / Capture候補 intake セクション F-001〜F-006
