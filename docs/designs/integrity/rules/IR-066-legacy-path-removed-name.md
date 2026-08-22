---
title: "IR-066: legacy-path-removed-name"
status: accepted
created: 2026-08-22
updated: 2026-08-22
---

# IR-066: legacy-path-removed-name

| Field | Value |
|-------|-------|
| rule_id | IR-066 |
| description | 現行参照として残る旧パスおよび削除済み名称を検出する。対象は `docs/specs/` パス、`.agentdev/graph/` パス、`agentdev-artifact-graph`、`check_graph`、廃止スキル名（`agentdev-spec-compliance`、`agentdev-adr-guidelines`、`agentdev-adr-file-manager`、`agentdev-doc-map`、`agentdev-workflow-reporting`）（REQ-010-067）。Issue #2383 (b) v1〜v4 監査観点再走査の採用分として旧 command 名 `inspect-extensions`（DEC-006 で廃止）と旧スキル名 `agentdev-spec-file-manager`、`agentdev-workflow-spec-save`（SPEC→Design 再定義、Issue #2349 で改称）を追加 |
| severity | heuristic |
| category | obsolete-structure |
| detection_method | `check_integrity.ts` による行単位走査。検出パターンはスクリプト内 `IR066_VOCAB_PATTERNS` 定数、許容条件の運用データは `data/obsolete-vocabulary-map.yaml` が宣言する。IR-065 と同一の走査・許容基盤を共有する |
| affected_artifacts | [docs/designs/**, docs/requirements/*.md, docs/decisions/*.md, docs/guides/*.md, src/opencode/**, .opencode/commands/**, .agentdev/extensions/**]（詳細は yaml scope） |
| related_req | [REQ-010-067, REQ-010-068, REQ-010-070] |
| related_design | [../integrity-rule-catalog.md, data/obsolete-vocabulary-map.yaml] |
| gate_level | full-audit |
| false_positive_risk | 低〜中。IR-065 と同一の許容条件（履歴マーカー、superseded Decision、否定文脈、existence_probe、exemption_files）を適用する。廃止スキル名の検出は REQ-0108-262（検出パターン縮小）で除外された語彙のうち Wave 1 監査が fail 実在を確認した語彙に限定する。追加採用語彙（inspect-extensions 等 3 種）は v1〜v4 再走査で現行参照残存 0 件を確認した上で採用しており、DEC-006（inspect-extensions 廃止の移行記録）は exemption_files に登録する |
| regression_test | `check_integrity.test.ts` describe "IR-065/IR-066 obsolete-vocabulary & legacy-path" および describe "IR-066 vocabulary extension (Issue #2383 (b) resweep adoption)"。正常例・違反例・境界例・許容例・再現例（F-01 stale junction 旧称）の 5 種 fixture |
| finding_route | intake |
| triage_action | 新規検出は現行参照（実在パス・現行スキル名）への置換または履歴注記化。導入時点の既知違反は 0 件（baseline 空、追加採用語彙も 0 件） |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | `docs/specs/` 旧パス参照が現行文書に残存しないこと | heuristic fail |
| 2 | `.agentdev/graph/` 旧パス参照が現行参照として残存しないこと（否定文脈は許容） | heuristic fail |
| 3 | 削除済み機能名（`agentdev-artifact-graph`、`check_graph`）が現行参照として残存しないこと | heuristic fail |
| 4 | 廃止スキル名（`agentdev-spec-compliance` 等 5 種）が現行の委譲先・参照先として使用されないこと | heuristic fail |
| 5 | 廃止 command 名 `inspect-extensions`（DEC-006）が現行の委譲先として使用されないこと | heuristic fail |
| 6 | 旧スキル名 `agentdev-spec-file-manager`、`agentdev-workflow-spec-save`（Issue #2349 改称前）が現行参照として使用されないこと | heuristic fail |

## 廃止語彙と REQ-0108-262 との関係

v2:REQ-0108-262（検出パターン縮小）は旧ハイフン区切りスキル名・snake_case コマンド名等を「現行 docs での誤使用リスクが解消されたため」検出対象から除外した。本ルールは Wave 1 監査（AUDIT-REQ-045-CONSISTENCY 観点V4/V9）が実際に fail の実在を確認した語彙（F-003〜F-007 の廃止スキル名、F-014 の旧パス系）に限定して検出を復活させる。REQ-010-067 が旧パス・削除済み名称の検出を要件行として正規契約化したことに基づく。

## v1〜v4 監査観点再走査での採用（Issue #2383 (b)、REQ-010-070）

Wave 1 監査の取りこぼし 2 件（監査観点 V1 `（ADR）` 注記、V4 `agentdev-spec-compliance` 参照）は Issue #2372 の IR-065/IR-066 導入時に既に検査体系へ組み込まれており、再走査の結果これらの新規クラス重複追加は不採用とした。再走査で検出された網羅ギャップは、旧 command 名 `inspect-extensions` が監査観点 V4 のスイープパターンに含まれる一方で IR-066 語彙から漏れていた点、および F-01 の stale junction 旧称 2 件（`agentdev-spec-file-manager`、`agentdev-workflow-spec-save`）が語彙化されていない点である。この 2 点を採用し語彙へ追加した。不採用候補の詳細は Issue #2383 の PR 本文「Findings / Capture候補」に記録する。

## exemption（許容条件）

IR-065 と同一（`data/obsolete-vocabulary-map.yaml` が宣言）。existence_probe により、語彙に対応する実体（例: `src/opencode/skills/agentdev-spec-compliance/`）が実在する場合は当該語彙の検出を skip する。DEC-006.md（inspect-extensions 廃止と責務移管の移行記録）は exemption_files に追加した。

## baseline 運用

導入時点（Issue #2372、2026-08-22）の既知違反は 0 件。Issue #2383 (b) の語彙拡張時点でも既知違反は 0 件（DEC-006 exemption 適用後）。新規検出は即時に heuristic fail として報告する。

## See Also

- [IR-065-obsolete-vocabulary-current-use.md](IR-065-obsolete-vocabulary-current-use.md)
- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- `docs/reports/integrity/audits/req-045-consistency-audit-20260822.md`（F-003〜F-007、F-014）
