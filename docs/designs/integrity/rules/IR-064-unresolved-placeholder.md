---
title: "IR-064: unresolved-placeholder"
status: accepted
created: 2026-08-22
updated: 2026-08-22
---

# IR-064: unresolved-placeholder

| Field | Value |
|-------|-------|
| rule_id | IR-064 |
| description | 実行時配布対象（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`）に残る未解決プレースホルダーを検出する。(a) TODO/FIXME/XXX/HACK の bare トークン（strict）、(b) ID 系プレースホルダー（`REQ-{NNNN}`、`DEC-{N}` 等）の本文裸出力（heuristic）。正規テンプレート内の意図的なプレースホルダーは対象種別と許容条件に従い誤検出しない（REQ-010-065） |
| severity | strict（TODO 系）/ heuristic（ID プレースホルダー裸出力） |
| category | document-drift |
| detection_method | `check_integrity.ts` による行単位走査。TODO 系は `\b(TODO\|FIXME\|XXX\|HACK)\b`、ID 系は `\b(?:REQ\|DEC\|ADR\|AG\|QG\|IR\|RU\|TS\|OU\|AC\|CR\|EC\|SC\|ACT\|DD\|DESIGN\|RD\|SPEC\|WS\|GMT)-\{[^}]*\}`（文書 ID 系接頭辞の限定列挙。Wave 1 監査観点V5 と同じ限定方針） |
| affected_artifacts | [src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/**/*.md] |
| related_req | [REQ-010-065, REQ-010-068] |
| related_design | [../integrity-rule-catalog.md] |
| gate_level | full-audit |
| false_positive_risk | 低〜中。許容条件（下表）で様式例示を除外する。ID 接頭辞の限定列挙により `UTF-{N}` 等の非 ID 様式（文字コード表記）は検出しない。裸出力の様式確定（backtick 包囲の義務化等）は未確定のため heuristic とし、baseline で既知を管理する |
| regression_test | `check_integrity.test.ts` describe "IR-064 unresolved-placeholder"。正常例・違反例・境界例・許容例・再現例（観点V5 パターン）の 5 種 fixture |
| finding_route | intake |
| triage_action | TODO 系の新規検出は即時是正（解決または非配布文書への移動）。ID プレースホルダー裸出力の新規検出は backtick・括弧への整形容式化または具体 ID 解決。既知 48 件は NG baseline（provenance `issue-2372-ir064-initial-baseline`）で管理 |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | TODO/FIXME/XXX/HACK の bare トークンが配布対象に残存しないこと（引用「」内列挙、code span/block 内は対象外） | strict fail |
| 2 | ID 系プレースホルダーの本文裸出力がないこと（code span・括弧内・テンプレートは対象外） | heuristic fail |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| `src/opencode/commands/agentdev/templates/`、`src/opencode/skills/*/templates/`、`_template.md` | 正規テンプレート内の意図的なプレースホルダー |
| code block（``` 囲み）内 | 例示・パターン説明 |
| code span（backtick 囲み）内 | 様式例示（`` `REQ-{NNNN}` `` 等） |
| 括弧（ASCII/全角）内 | 委譲注記様式（`（DEC-{N}、REQ-{NNNN}-{NNN}）`） |
| 全角引用「」内 | 検出キーワードの列挙例示（「TODO」「FIXME」等） |
| 表の根拠列・検出器語彙・パターン定義内の裸出力 | 正規様式の文脈許容。IR-{NNNN} 等の ID プレースホルダーは本文中では backtick 包囲を正とするが、表の根拠列・検出器語彙・パターン定義内など様式上 backtick 包囲が成立しない領域は裸出力を許容する。許容領域の定義は distribution-boundary Design の除外規則と一致させる |

## baseline 運用

導入時点（Issue #2372、2026-08-22）の既知違反は ID プレースホルダー裸出力 48 件（TODO 系は 0 件）。裸出力は委譲注記様式として一貫使用されているが、様式の正規契約（backtick 包囲等）が未確定のため heuristic とし、NG baseline additions manifest（provenance `issue-2372-ir064-initial-baseline`）で管理する。様式の正規化は Design 確定候補・intake 経由で判断する。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- `docs/reports/integrity/audits/req-045-consistency-audit-20260822.md`（観点V5）
