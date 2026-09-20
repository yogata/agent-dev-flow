---
title: "IR-070: design-frontmatter-required-keys"
status: accepted
created: 2026-09-20
updated: 2026-09-20
---

# IR-070: design-frontmatter-required-keys

| Field | Value |
|-------|-------|
| rule_id | IR-070 |
| description | docs/designs/** の Design frontmatter は `title` / `status` / `created` / `updated` を必須キーとして機械検査する。キー欠落、行頭空白付きキー行によるキー名破損（正典の検出列挙における「updated値のキー名欠落」）、値形式不正（created / updated の ISO 8601 日付形式、status の draft / accepted 値域）を検出する（checker-execution-contracts Design「Design frontmatter 必須キー検証観点」節の実現、Case #3042 Wave 2・RA-006） |
| severity | strict |
| category | document-drift |
| detection_method | `check_design_frontmatter.ts`（repo-local 独立 checker）による走査。(1) `docs/designs/**/*.md` を `globWalkRel`（node:fs glob 共有ヘルパー）で列挙し、列挙件数と検査対象・対象外の件数整合を report に含める（二重確認）。(2) 除外規定（README.md、`references/` / `audits/` / `baselines/` 配下、`baseline_for` / `audit_for` 信号キー保持ファイル）を適用する。(3) frontmatter ブロック抽出と ISO 8601 日付妥当性は Knowledge frontmatter 検査（`check_knowledge_docs.ts`）と同一実装を import して用いる（REQ-010-062: 既存 checker 規則からの期待値導出）。(4) 必須キー（`title` / `status` / `created` / `updated`）の欠落・空値、クォート剥がし後の日付形式、status 値域、行頭空白付き必須キー行を検出する |
| affected_artifacts | [docs/designs/**/*.md] |
| related_req | [REQ-010-062, REQ-010-068, REQ-010-070] |
| related_design | [../checker-execution-contracts.md, ../integrity-rule-catalog.md, ../../foundations/patterns.md] |
| gate_level | full-audit |
| false_positive_risk | 低。検出対象は frontmatter 構造（機械的パターンマッチ）。`README.md`（Design インデックス）と `references/` 配下（親 Design の補助資料で Design 索引の独立行対象外）は Design 文書として独立管理されないため対象外（対象範囲判定は checker の `isExcludedDesignFile`）。YAML フロースカラーの引用符付き日付値（Design corpus の正規運用）は引用符を剥がした値で検査するため誤検出しない。`updated >= created` の順序比較は正典の検出列挙（キー欠落・キー名欠落・値形式不正）に含まれないため本ルールの検出対象外とする |
| regression_test | `check_design_frontmatter.test.ts`（REQ-010-068 準拠、38 tests）。正常例（必須キー充足・draft/accepted・引用符付き日付）、違反例（missing-frontmatter・キー欠落・空値・ISO 形式違反・status 値域違反）、境界例（片側引用符・サブディレクトリ README.md・非 Markdown ファイル・領域未設置）、許容例（references/ 配下・baseline_for 信号キー・順序不一致）、再現例（RA-005 実被害形状: integrity-contracts.md の行頭空白付き ` updated:` 行と v4-collaboration-loop.md の updated 欠落）の 5 種 fixture |
| finding_route | intake |
| triage_action | frontmatter の修復で解消する: 行頭空白付きキー行は行頭空白の除去、必須キー欠落はキー追加、値形式不正は値の是正。checker は `/repo/docs-check` STEP-1 の正規実行経路で実行される |
| last_verified | 2026-09-20 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | docs/designs/** の Design 文書（除外規定適用後）が frontmatter ブロック（先頭 `---` 〜 閉じ `---`）を持つこと | strict fail |
| 2 | frontmatter が必須キー `title` / `status` / `created` / `updated` をすべて保持し、空値でないこと | strict fail |
| 3 | frontmatter 内に行頭空白付きの必須キー行が存在しないこと（キー名破損の検出） | strict fail |
| 4 | `created` / `updated` が ISO 8601 日付（YYYY-MM-DD、カレンダー妥当）であること（引用符剥がし後の値で判定） | strict fail |
| 5 | `status` が `draft` / `accepted` のいずれかであること | strict fail |

## 対象範囲判定と exemption（許容条件）

| 対象 | 理由 |
|------|------|
| ファイル名 `README.md` | Design インデックスであり Design 文書ではない。repo-agentdev-integrity SKILL.md の Designs 検査カテゴリ規定（README.md は Design inventory/status 同期検査でのみ対象、Design 本文検査では除外）と整合 |
| `references/` サブディレクトリ配下 | 親 Design の補助資料（詳細・実装固有事項）であり Design 索引の独立行対象外（docs/designs/README.md「references/ の Design は親 Design 行の備考欄で言及し、独立行としては登録しない」）。frontmatter を持たない references 文書（例: foundations/references/crosswalk-inventory.md）は Design frontmatter 規約の適用対象外 |
| `audits/` / `baselines/` 配下 | 歴史記録・baseline（checker-execution-contracts Design「検出対象除外規定」の正規列挙） |
| `baseline_for` / `audit_for` 信号キー保持ファイル | 監査記録・baseline としての免除規定（checker-execution-contracts Design「検出対象除外規定」） |
| `updated >= created` の順序比較 | 正典の検出列挙「キー欠落、updated値のキー名欠落、値形式不正」に含まれないため検出対象外。既知の順序不一致（rules/IR-006・IR-057 の updated が created より前）は本ルールでは検出しない |

## baseline 運用

導入時点（Case #3042 Wave 2、2026-09-20）の現行リポジトリは、Design corpus の必須キー欠落 2 件（integrity/integrity-contracts.md の行頭空白付き ` updated:` 行、workflows/v4-collaboration-loop.md の updated 欠落）を同一 PR で修復済みのため、本ルールによる既知違反は存在せず NG baseline の追加登録は行わない。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [checker-execution-contracts.md](../checker-execution-contracts.md)（Design frontmatter 必須キー検証観点の正典・checker 共通実行契約）
- [../../foundations/patterns.md](../../foundations/patterns.md)（Design frontmatter 形式: status は draft / accepted）
- `check_knowledge_docs.ts`（repo-local: `.opencode/skills/repo-agentdev-integrity/scripts/check_knowledge_docs.ts`。同一検出基準の参照元・共有純関数の所有者）
