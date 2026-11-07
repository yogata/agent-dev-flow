# traceability/agentdev-workflow-case-close.yaml の旧機構モジュール対応行の RA-002 時整理

## 観測事実

- Case #3966（PR #3976）で close_mechanical_steps.ts の旧機構呼出が 0件化された。traceability sidecar（traceability/agentdev-workflow-case-close.yaml）には台帳系モジュール（verification-resources-ledger.ts・verification-resource-register.ts・deletion-confirmation.ts・verification-resource-reclamation.ts 台帳部分）への implementation / verification 対応行が、モジュール実存に対応して現行のまま残存する。
- 台帳系モジュール自体とそのテスト4件の削除は RA-002（#3970）が所有する。モジュール撤去時に REQ-118-001/002/003/004/006 等の撤去済み機構要件行の retired 判定と sidecar 対応の除去が必要になる。

## 具体的な修正対象

- RA-002（#3970）のモジュール削除時に、traceability/agentdev-workflow-case-close.yaml の旧機構モジュール対応行を削除し、撤去済み機構要件行（REQ-118-001/002/003/004/006 等）の retired 判定を実施する。
- sidecar 更新時に traceability check（対象要件行限定）の missing 系 findings が新規に立たないことを確認する。

## 関連

- Case #3966・PR #3976 本文 Findings・RA-002（#3970）・traceability/agentdev-workflow-case-close.yaml
