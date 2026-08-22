---
title: "IR-067: referenced-req-row-existence"
status: accepted
created: 2026-08-22
updated: 2026-08-22
---

# IR-067: referenced-req-row-existence

| Field | Value |
|-------|-------|
| rule_id | IR-067 |
| description | docs 本文が引用する階層 REQ 行 ID（`REQ-NNN-NNN`、現行3桁番号帯）の実在性を機械検査する。引用先の行 ID が docs/requirements の要件行テーブルに存在しない場合（ファントム引用: 未コミット草案番号の引用残存、要件分割前の旧行 ID 残存）に検出する。テンプレート・例示のプレースホルダー（`REQ-010-NNN`、`REQ-{NNNN}-{NNN}` 等の非数字形式）は正規表現上マッチせず誤検出しない（REQ-010-065 許容条件準拠、REQ-010-069） |
| severity | strict |
| category | document-drift |
| detection_method | `check_integrity.ts`（`checkReferencedReqRowExistence`）による走査。(1) `docs/requirements/*.md` と `retired/*.md` の表行（`\|` 先頭行）から行 ID インデックスを構築、(2) docs 本文（docs/designs、docs/requirements、docs/decisions、docs/guides、src/opencode、.opencode/commands、.agentdev/extensions、ルート README.md、docs/README.md）の引用を突合する。階層 ID 検索の3点設計（checker-execution-contracts Design）: v2: プレフィックス許容、表行先頭出現を実在の正とする、前置一致除外（旧4桁番号帯 `REQ-NNNN-NNN` は検出対象外） |
| affected_artifacts | [docs/designs/**, docs/requirements/*.md, docs/decisions/*.md, docs/guides/*.md, src/opencode/**, .opencode/commands/**, .agentdev/extensions/**, README.md, docs/README.md] |
| related_req | [REQ-010-069, REQ-010-065, REQ-010-068] |
| related_design | [../integrity-rule-catalog.md, ../checker-execution-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴・様式領域を免除する: `v2:` プレフィックス付き歴史識別子、code span / code block、テンプレート領域（`_template.md`、`templates/`）、IR ルール説明文（v2:REQ-0145-015）、AUTOGEN ブロック（checker-execution-contracts 検出対象除外規定）、retired ディレクトリ、`docs/reports/`。導入時点の既知違反（要件分割由来の旧行 ID 引用）は NG baseline で管理する |
| regression_test | `check_integrity.test.ts` describe "IR-067 referenced-req-row-existence (REQ-010-069, Issue #2383 (a))"。正常例（実在行 ID の引用）・違反例（ファントム行 ID）・境界例（v2: プレフィックス・プレースホルダー・旧4桁番号帯・code span）・許容例（_template.md・AUTOGEN ブロック・IR ルール説明文）・再現例（PR 2284 ファントム引用パターン）の 5 種 fixture |
| finding_route | intake |
| triage_action | 新規検出（baseline 超過分）は引用先の再同定（現行要件行への置換、または履歴注記化・削除）。導入時点の既知違反は要件分割（2026-08-14、REQ-006 分割等）由来の旧行 ID 引用であり、docs コーパス是正（RU-0002/RU-0001、OU-007/OU-010 スコープ）で解消する。旧4桁番号帯（`REQ-0136-029` 等、F-04）は本ルールの検出対象外とし OU-007 の是正対象とする |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 引用された行 ID（`REQ-NNN-NNN`）が docs/requirements の要件行テーブル（現行または retired）に実在すること | strict fail |
| 2 | 行 ID インデックスは表行（`\|` 先頭行）から構築され、本文言及を実在扱いにしないこと（定義と引用の区別） | 設計要件 |
| 3 | プレースホルダー様式例示（非数字形式）を誤検出しないこと（REQ-010-065） | 設計要件 |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| `v2:REQ-NNN-NNN` プレフィックス付き | 歴史識別子（旧番号帯の正規参照形式） |
| `REQ-010-NNN`、`REQ-{NNNN}-{NNN}` 等の非数字形式 | プレースホルダー様式例示（REQ-010-065 許容条件。正規表現上マッチしない） |
| code span / fenced code block 内 | 様式例示 |
| `_template.md`、`src/opencode/commands/agentdev/templates/`、`src/opencode/skills/*/templates/` | テンプレート領域 |
| `docs/designs/integrity/rules/IR-*.md` | 例示用 ID を含む自己参照的資料（v2:REQ-0145-015、他検出関数と同一） |
| AUTOGEN ブロック内の行 | 機械生成領域（checker-execution-contracts 検出対象除外規定） |
| `docs/requirements/retired/`、`docs/decisions/retired/`、`docs/reports/` | 履歴領域 |
| 旧4桁番号帯 `REQ-NNNN-NNN`（v2: なし） | 検出対象外（前置一致除外。F-04 是正は OU-007 スコープ） |

## baseline 運用

導入時点（Issue #2383、2026-08-22）の既知違反は 318 件（要件分割由来の旧行 ID 引用。内訳: REQ-006 分割系が大半、docs/designs と docs/decisions に集中）。NG baseline additions（provenance `issue-2383-ir067-initial-baseline`）で管理し、行 ID 引用のコーパス是正は OU-007（RU-0002 docs 正規化）・OU-010（RU-0001 コーパス機械是正）スコープで実施する。baseline 登録後、新規のファントム引用（未コミット草案番号の混入等、PR 2284 再現パターン）は即時に strict fail として検出する。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- [checker-execution-contracts.md](../checker-execution-contracts.md)（階層 ID 検索の3点設計、検出対象除外規定）
