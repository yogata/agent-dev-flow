# Design Principles

## 1. work_type 分類の存在理由

Issue の種別に応じて異なるワークフローを適用する。work_type と scale の組み合わせで workflow_route を導出する（REQ-0104）。

### work_type / scale / workflow_route 導出ルール

| work_type | scale | workflow_route | 経路 |
|---|---|---|---|
| bugfix | — | direct_case | req-define → case-open → case-run → case-close |
| feature | standard | req_backed_case | req-define → req-save → case-open → case-run → case-close |

---

## 2. 要件と仕様の分離理由

要件（Requirements: WHAT）と仕様（Specifications: HOW）を明確に分離して管理する。
