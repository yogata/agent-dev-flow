---
title: "IR-063: guardrail-number-invariant"
status: accepted
created: 2026-08-22
updated: 2026-08-22
---

# IR-063: guardrail-number-invariant

| Field | Value |
|-------|-------|
| rule_id | IR-063 |
| description | 公開 command（`src/opencode/commands/agentdev/*.md` 直下、templates/ と README.md は対象外）のガードレール番号（Gxx）について、開始番号（G01 起点）、欠番なし（連番）、重複なし、本文参照の全定義への解決を検証する（REQ-010-064） |
| severity | strict |
| category | document-drift |
| detection_method | `check_integrity.ts` による定義行抽出（`^[-*]\s+(?:\*\*)?`?G(\d{2})`?(?:\*\*)?\s*[:：]`、Wave 1 監査 AUDIT-REQ-045-CONSISTENCY 観点V6 と同一パターン）と本文参照抽出（定義行以外の `\bG\d{2}\b`）の突合。開始番号違反（evidence `start-number:Gxx`）、欠番（`gap:Gxx`）、重複（`duplicate:Gxx`）、未定義参照（`undefined-reference:Gxx`）を検出する |
| affected_artifacts | [src/opencode/commands/agentdev/*.md] |
| related_req | [REQ-010-064, REQ-010-068] |
| related_design | [../integrity-rule-catalog.md, ../../authoring/command-file-format.md] |
| gate_level | full-audit |
| false_positive_risk | 低。Gxx 定義を持たない command は検査対象外（ガードレール定義は必須でない）。定義抽出パターンが様式変更に追随しない場合、未定義参照検出として顕在化する（過検出方向、REQ-010 の false positive 許容・false negative 減少方針に合致） |
| regression_test | `check_integrity.test.ts` describe "IR-063 guardrail-number-invariant"。正常例・違反例・境界例・許容例・再現例（Wave 1 F-009 の req-define 形式）の 5 種 fixture |
| finding_route | intake |
| triage_action | 新規検出時は是正（G01 開始・連番への再採番）または baseline 承認。既知違反 14 command 分（140 検出）は NG baseline（provenance `issue-2372-ir063-initial-baseline`）で管理し、B-01（Gxx 採番規則の Design 確定、AUDIT-REQ-045 blocked）解消後に是正する |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | ガードレール番号の定義は G01 から開始すること | strict fail |
| 2 | 定義番号は欠番なく連番であること | strict fail |
| 3 | 同一番号の定義は 1 回のみであること | strict fail |
| 4 | 本文中の Gxx 参照は同一ファイル内の定義へ解決されること | strict fail |

## 対象範囲と B-01/B-02 との関係

検査対象は `src/opencode/commands/agentdev/*.md` 直下（公開 command）。repo-local command（`.opencode/commands/repo/`）とスキル側の Gxx 定義・参照は対象外である。これは Wave 1 監査の blocked B-02（Gxx・工程ラベル参照の修飾形式と、スキル・repo-local 側の G 番号定義の可否）が未確定であるためであり、本ルールは B-02 の判断を代行しない。

REQ-010-064 が「開始番号（G01 起点）、欠番、重複、および定義されていないガードレール番号への本文参照を検出すること」を要件行として正規契約化したことに基づき、当該検出意味論を本ルールの canonical な契約とする（Wave 2 NORMALIZATION-REQ-046 は B-01 blocked のため再採番を実施していない。既知違反の是正は B-01 の Design 確定後に行う）。

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| `templates/` サブディレクトリ | テンプレートの番号は様式例示 |
| `README.md` | command 定義ではない |
| Gxx 定義を持たない command | ガードレール定義は必須でない |

## baseline 運用

導入時点（Issue #2372、2026-08-22）の既知違反は 14 command 分（start-number 5 件、gap 135 件。Wave 2 記録「非 G01 開始または欠番: 14 ファイル」と一致）。NG baseline additions manifest（provenance `issue-2372-ir063-initial-baseline`）で登録し、baseline-known は info 降格、新規違反のみ strict fail とする（delta 運用）。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- `docs/reports/integrity/audits/req-045-consistency-audit-20260822.md`（F-009、B-01）
- `docs/reports/integrity/normalizations/req-046-normalization-20260822.md`（§4）
