---
title: "IR-063: common-policy-identifier-invariant"
status: accepted
created: 2026-08-22
updated: 2026-08-24
---

# IR-063: common-policy-identifier-invariant

| Field | Value |
|-------|-------|
| rule_id | IR-063 |
| description | 配布物（command・skill・template）の共通ポリシー意味識別子（`POL-`）について、registry に定義された識別子への解決（未定義参照なし）、registry 内の重複定義なし、registry 外定義なし、および廃止済み Gxx 表記の配布物残存なしを検証する（REQ-051-005、REQ-010-064） |
| severity | strict |
| category | document-drift |
| detection_method | `check_integrity.ts` による registry 定義行抽出（`^[-*]\s+\*\*(POL-[a-z0-9-]+)\*\*`）と配布物本文抽出（`\bPOL-[a-z0-9-]+\b`、`\bG\d{2}\b`）の突合。未定義参照（evidence `undefined-reference:POL-*`）、重複定義（`duplicate-definition:POL-*`）、registry 外定義（`definition-outside-registry:POL-*`）、廃止済み Gxx 表記残存（`residual-gxx:Gxx`）を検出する |
| affected_artifacts | [src/opencode/commands/agentdev/**, src/opencode/skills/agentdev-*/**] |
| related_req | [REQ-051-005, REQ-051-006, REQ-010-064, REQ-010-068] |
| related_design | [../integrity-rule-catalog.md, ../../authoring/command-file-format.md] |
| gate_level | full-audit |
| false_positive_risk | 低。registry ファイル自身は様式例示を含む定義の実体であるため参照検査の対象外とする。`\bG\d{2}\b` は `AG-005` 等の別名前空間に一致しない |
| regression_test | `check_integrity.test.ts` describe "IR-063 common-policy-identifier-invariant"。正常例・違反例・境界例・許容例・再現例（Issue #2429 移行前に配布 command へ残存していた旧 Gxx 定義行様式）の 5 種 fixture |
| finding_route | intake |
| triage_action | 新規検出時は是正（registry 定義の追加、または識別子参照・Gxx 表記の除去）。Gxx 連番制度は廃止済みのため再採番による是正は行わない |
| last_verified | 2026-08-24 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 共通ポリシー意味識別子の定義は registry に1回のみであること（重複定義なし） | strict fail |
| 2 | 配布物の識別子参照は registry の定義へ解決されること（未定義参照なし） | strict fail |
| 3 | 識別子の定義形式は registry 外の配布物に現れないこと | strict fail |
| 4 | 廃止済み Gxx 表記が配布物に残存しないこと | strict fail |

## 対象範囲

検査対象は配布物（`src/opencode/commands/agentdev/**`（templates/ 含む）、`src/opencode/skills/agentdev-*/**` の .md 全体）である。repo-local command（`.opencode/commands/repo/`）は配布対象外のため機械検査の対象外とする。

ガードレール識別体系の規約（Command 固有境界の ID 不要、共通ポリシーの意味識別子、正規所有先への移管）は `authoring/command-file-format` Design「ガードレール識別体系」が所有し、識別子の定義実体は `agentdev-command-authoring` の共通ポリシー意味識別子 registry（`common-policy-identifiers.md`）が保持する。本ルールは検出意味論のみを所有する。

## 前身検査（Gxx 連番検査）の廃止

本ルールは、公開 command のガードレール番号（Gxx）不変量検査（開始番号の起点固定・欠番なし・重複なし・未定義参照、Issue #2372、REQ-010-064 旧文）を置換したものである。旧検査の既知違反 14 command 分（140 検出、NG baseline provenance `issue-2372-ir063-initial-baseline`）は、連番制度の廃止（REQ-051、DEC-022 決定7）に伴う配布物の記述移管の完了をもって baseline から削除した。旧検査の識別子引用（REQ-046-006、REQ-010-064）は置換済みの現行要件行を指す。

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| registry ファイル自身 | 定義の実体であり、様式例示（`POL-xxx`）を含むため参照検査の対象外 |
| registry 所有 skill を含まない配布ツリー | registry 所有 skill（`agentdev-command-authoring`）自体が存在しない最小構成（テスト fixture 等）は本検査の適用対象外 |
| repo-local command（`.opencode/commands/repo/`） | 配布対象外のため機械検査の対象外 |

## baseline 運用

新体系の検査は移行完了時点で既知違反 0 であるため、NG baseline エントリを持たない。新規違反は strict fail として扱う。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- `docs/designs/authoring/command-file-format.md`（ガードレール識別体系）
