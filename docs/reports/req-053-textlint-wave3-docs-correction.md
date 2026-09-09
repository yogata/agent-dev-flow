---
id: REQ-053-TEXTLINT-WAVE3-DOCS-CORRECTION
title: "textlint Wave3 docs 系表層是正の実行記録"
status: accepted
created: 2026-09-09
source_issue: "#2737"
parent_epic: "#2734"
---

<!-- ADF-COVERS(implementation): REQ-053-013, REQ-053-019, REQ-053-037, REQ-053-038 -->

# textlint Wave3 docs 系表層是正の実行記録

本 Report は、textlint 是正キャンペーン Epic（#2734）Wave 3（Issue #2737、RA-004 docs 系分割）の実行記録である。Wave2（docs/reports/req-053-textlint-wave2-calibration.md）の正式初期判定で拒否対象違反（hardCount）が 0 と機械実測されており、docs 系の是正対象（拒否対象違反を持つファイル）は空集合である。このため本 Wave における表層是正の実施対象は存在せず、本 Report は実ファイル変更ゼロの下で、固定規則による docs 系全対象の最終判定、REQ-053-019 の完了証拠契約に基づくファイル単位記録、文字コード機械検査、検査群の実行結果を記録する。

実行環境は worktree `.worktrees/2737-refactor`、base 7ff5327d（origin/main と同一）。実行識別情報（委譲単位 DEL-2737-1）と最終 HEAD の確定値（コミットハッシュ）は該当 PR 本文に記録する。本 Report 自身は `docs/reports/**` 既定除外により textlint 検査対象外である（REQ-053-039）。REQ-053-013（是正時の意味保存契約、意味を一義的に復元できない箇所の推測修正禁止）について、本 Wave では是正編集の実施対象が存在しなかったため、本契約に抵触する修正は 0 件であり、blocked 記録も発生していない。

## 1. 最終判定（固定規則による gate.ts 機械実行）

実行形式: `bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . --json`（2026-09-09 実測）。

| 項目 | 実測値 |
|---|---|
| 規則構成 | Wave2 固定（規則構成ハッシュ `8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73`。規則・option・severity・依存版の変更なし） |
| 解決対象ファイル数（全体） | 493 |
| docs 系対象ファイル数 | 263 |
| 拒否対象違反（hardCount） | 0（全体・docs 系とも。終了コード 0） |
| 検査不能 | 0 |
| 助言指摘（docs 系） | 2,328 件 / 201 ファイル（助言なし 62 ファイル） |

既知差異: Issue #2737 本文の「264ファイル」は case-open 時のベースライン参考値である。実測 263 は Wave2 実測（全体 493）と同一の対象解決下の値であり、#2731 corpus 移動由来の差異（PR #2745 / #2747 の stale-reference 記録と同内容）を引き継ぐ。差異の内訳は docs 系 263 / commands 47 / skills 174 / additional 9（合計 493）である。

### 1.1 docs 系の規則別助言件数（CR-001 記録）

助言対象の指摘（2,328 件）は CR-001 により是正完了条件の対象外であり、本 Wave では助言件数の削減を目的とした編集を実施していない。内訳を本節に記録する。

| 規則 | 助言件数 |
|---|---|
| preset-ja-technical-writing/sentence-length | 1491 |
| preset-ja-technical-writing/no-mix-dearu-desumasu | 210 |
| preset-ja-technical-writing/ja-no-mixed-period | 158 |
| preset-ja-technical-writing/ja-no-successive-word | 88 |
| preset-ja-technical-writing/ja-no-redundant-expression | 81 |
| preset-ja-technical-writing/no-doubled-joshi | 76 |
| preset-ai-writing/no-ai-colon-continuation | 74 |
| preset-ai-writing/ai-tech-writing-guideline | 37 |
| preset-ja-technical-writing/max-comma | 29 |
| preset-ja-technical-writing/arabic-kanji-numbers | 27 |
| preset-ja-technical-writing/max-ten | 19 |
| preset-ja-technical-writing/max-kanji-continuous-len | 14 |
| preset-ai-writing/no-ai-hype-expressions | 6 |
| preset-ja-technical-writing/no-doubled-conjunction | 6 |
| preset-ja-technical-writing/no-exclamation-question-mark | 6 |
| preset-ai-writing/no-ai-list-formatting | 4 |
| preset-ja-technical-writing/ja-no-weak-phrase | 2 |

## 2. ファイル単位記録（REQ-053-019、docs 系 263 ファイル全件）

記録規約: 初期判定は Wave2 正式初期判定と同一規則構成による本 Wave 実行（gate.ts）での判定である。修正有無は本 Wave でのファイル実体の変更の有無（本 Wave は実施ゼロ）である。確認した品質観点は「表層」（固定規則による拒否対象違反と助言の確認、第 1 節）と「文字コード」（UTF-8 妥当性・BOM なし・LF、第 4 節）の 2 点である。最終判定は 2 観点の全項目合格を条件とする。残存不備は拒否対象違反の残存を意味し、全行 0 件である。助言件数は第 1.1 節の CR-001 対象外の記録として別列に示す。blocked 判断必要事項は本 Wave で発生していない。

| ファイルパス | 初期判定 | 修正有無 | 確認した品質観点 | 助言（件） | 最終判定 | 残存不備 | blocked 判断必要事項 |
|---|---|---|---|---|---|---|---|
| docs/decisions/DEC-001.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/decisions/DEC-002.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/decisions/DEC-003.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/decisions/DEC-004.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/decisions/DEC-005.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/decisions/DEC-006.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/decisions/DEC-007.md | 合格 | 修正不要 | 表層・文字コード | 17 | 合格 | なし | なし |
| docs/decisions/DEC-008.md | 合格 | 修正不要 | 表層・文字コード | 15 | 合格 | なし | なし |
| docs/decisions/DEC-009.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/decisions/DEC-010.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/decisions/DEC-011.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/decisions/DEC-012.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/decisions/DEC-013.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/decisions/DEC-014.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/decisions/DEC-015.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/decisions/DEC-016.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/decisions/DEC-017.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/decisions/DEC-019.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/decisions/DEC-020.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/decisions/DEC-021.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/decisions/DEC-022.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/decisions/DEC-023.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/decisions/DEC-024.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/decisions/DEC-025.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/decisions/DEC-026.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/decisions/DEC-027.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/decisions/DEC-028.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/decisions/README.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/authoring/command-file-format.md | 合格 | 修正不要 | 表層・文字コード | 15 | 合格 | なし | なし |
| docs/designs/authoring/dependency-version-compatibility.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/designs/authoring/vocabulary-registry.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/designs/commands/_template.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/commands/backlog-auto.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/commands/backlog-review.md | 合格 | 修正不要 | 表層・文字コード | 30 | 合格 | なし | なし |
| docs/designs/commands/case-auto.md | 合格 | 修正不要 | 表層・文字コード | 76 | 合格 | なし | なし |
| docs/designs/commands/case-close.md | 合格 | 修正不要 | 表層・文字コード | 46 | 合格 | なし | なし |
| docs/designs/commands/case-open.md | 合格 | 修正不要 | 表層・文字コード | 68 | 合格 | なし | なし |
| docs/designs/commands/case-run.md | 合格 | 修正不要 | 表層・文字コード | 84 | 合格 | なし | なし |
| docs/designs/commands/case-update.md | 合格 | 修正不要 | 表層・文字コード | 8 | 合格 | なし | なし |
| docs/designs/commands/design-save.md | 合格 | 修正不要 | 表層・文字コード | 45 | 合格 | なし | なし |
| docs/designs/commands/inspect-docs.md | 合格 | 修正不要 | 表層・文字コード | 15 | 合格 | なし | なし |
| docs/designs/commands/inspect-promote.md | 合格 | 修正不要 | 表層・文字コード | 21 | 合格 | なし | なし |
| docs/designs/commands/inspect-skills.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/designs/commands/intake-capture.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/commands/intake-from-github.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/commands/intake-promote.md | 合格 | 修正不要 | 表層・文字コード | 18 | 合格 | なし | なし |
| docs/designs/commands/issue.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/commands/learning-promote.md | 合格 | 修正不要 | 表層・文字コード | 18 | 合格 | なし | なし |
| docs/designs/commands/req-define.md | 合格 | 修正不要 | 表層・文字コード | 72 | 合格 | なし | なし |
| docs/designs/commands/req-save.md | 合格 | 修正不要 | 表層・文字コード | 20 | 合格 | なし | なし |
| docs/designs/commands/third-party-sync.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/foundations/decision-lifecycle.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/foundations/design-principles.md | 合格 | 修正不要 | 表層・文字コード | 20 | 合格 | なし | なし |
| docs/designs/foundations/document-model.md | 合格 | 修正不要 | 表層・文字コード | 50 | 合格 | なし | なし |
| docs/designs/foundations/harness-separation-model.md | 合格 | 修正不要 | 表層・文字コード | 18 | 合格 | なし | なし |
| docs/designs/foundations/numbering-policy.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/designs/foundations/patterns.md | 合格 | 修正不要 | 表層・文字コード | 15 | 合格 | なし | なし |
| docs/designs/foundations/project-extensions.md | 合格 | 修正不要 | 表層・文字コード | 23 | 合格 | なし | なし |
| docs/designs/foundations/references/concrete-abstraction.md | 合格 | 修正不要 | 表層・文字コード | 13 | 合格 | なし | なし |
| docs/designs/foundations/references/verification-scope-catalog.md | 合格 | 修正不要 | 表層・文字コード | 40 | 合格 | なし | なし |
| docs/designs/foundations/system.md | 合格 | 修正不要 | 表層・文字コード | 143 | 合格 | なし | なし |
| docs/designs/foundations/traceability-model.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/integrity/autogen-freshness-gate.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/integrity/backticks-identifier-threshold.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/integrity/checker-execution-contracts.md | 合格 | 修正不要 | 表層・文字コード | 35 | 合格 | なし | なし |
| docs/designs/integrity/content-corruption-checker.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/designs/integrity/distribution-boundary.md | 合格 | 修正不要 | 表層・文字コード | 13 | 合格 | なし | なし |
| docs/designs/integrity/docs-spec-rebuild-integrity.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/designs/integrity/index-auto-generation.md | 合格 | 修正不要 | 表層・文字コード | 23 | 合格 | なし | なし |
| docs/designs/integrity/integrity-contracts.md | 合格 | 修正不要 | 表層・文字コード | 67 | 合格 | なし | なし |
| docs/designs/integrity/integrity-rule-catalog.md | 合格 | 修正不要 | 表層・文字コード | 25 | 合格 | なし | なし |
| docs/designs/integrity/prose-quality-sentinel-checks.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/designs/integrity/references/targeted-docs-guard-implementation-details.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/designs/integrity/references/validator-internal-config.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rule-ownership.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-001-req-frontmatter-id-filename.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-002-req-required-frontmatter.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-003-active-retired-req-id-conflict.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-004-req-index-actual-consistency.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-005-adr-req-bidirectional-reference.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-006-command-allowed-frontmatter.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-007-skill-name-dir-match.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-008-skill-references-existence.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-009-obsolete-namespace-residual.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-010-adr-status-normalization.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-012-template-required-sections.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-013-variant-path-existence.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-014-singular-reference-dir-residual.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-015-retired-req-current-ref-detection.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-016-source-projection-integrity.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-018-req-range-notation-freshness.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-020-baseline-known-vs-new-finding.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-021-retired-skill-reference-detection.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-023-integrity-artifact-validator-drift.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-024-command-readme-actual.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-025-retired-adr-path-rule.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-027-retired-adr-current-authority-citation.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-028-command-top-step-int-only.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-029-command-alphabet-substep-prohibition.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-030-subagent-verbatim-conditional-return.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-031-findings-capture-heading-unification.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-032-delegation-type-on-result-envelope-prohibition.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-033-lightweight-delegation-primary-pattern-prohibition.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-034-skill-internal-section-step-reference-detection.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-035-skill-see-also-detection-perspective.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-037-retired-adr-current-baseline-ref.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-038-decision-index-consistency.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-039-index-req-title-consistency.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-040-retired-req-authority-comment.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-041-retired-req-broken-link.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-042-hardcoded-req-count.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-043-retired-readme-coverage.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-044-req-spec-boundary-violation-detection.md | 合格 | 修正不要 | 表層・文字コード | 12 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-047-src-opencode-local-link-origin-dir-structure.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-048-generated-by-identifier-integrity.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-049-command-file-format-violation.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-050-load-skills-command-mis-specification.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-051-executor-skill-notation-misrecognition.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-052-completion-grep-pattern-design.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-054-draft-spec-abandonment-detection.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-056-project-extensions-integrity.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-058-distribution-untracked-skill-reference.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-059-distribution-reference-boundary.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-061-index-generation-consistency.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-062-reference-path-existence.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-063-common-policy-identifier-invariant.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-064-unresolved-placeholder.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-065-obsolete-vocabulary-current-use.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-066-legacy-path-removed-name.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/integrity/rules/IR-068-skill-projection-manifest.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/integrity/targeted-docs-guard-implementation.md | 合格 | 修正不要 | 表層・文字コード | 28 | 合格 | なし | なし |
| docs/designs/integrity/test-impact-detection-gate.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/integrity/validator-split-criteria.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/local/install-script-usability.md | 合格 | 修正不要 | 表層・文字コード | 24 | 合格 | なし | なし |
| docs/designs/local/local-case-file.md | 合格 | 修正不要 | 表層・文字コード | 23 | 合格 | なし | なし |
| docs/designs/local/runtime-package-boundary.md | 合格 | 修正不要 | 表層・文字コード | 57 | 合格 | なし | なし |
| docs/designs/local/third-party-skill-management.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/quality/design-health-metrics.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/quality/quality-gates.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/designs/quality/quality-specs.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/quality/req-health-metrics.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/designs/quality/textlint-quality-runtime.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/designs/README.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/designs/responsibilities/artifact-contracts.md | 合格 | 修正不要 | 表層・文字コード | 41 | 合格 | なし | なし |
| docs/designs/responsibilities/artifact-quality-control-routing.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/designs/responsibilities/artifact-responsibilities.md | 合格 | 修正不要 | 表層・文字コード | 12 | 合格 | なし | なし |
| docs/designs/responsibilities/custom-tool-contracts.md | 合格 | 修正不要 | 表層・文字コード | 29 | 合格 | なし | なし |
| docs/designs/responsibilities/document-type-responsibilities.md | 合格 | 修正不要 | 表層・文字コード | 29 | 合格 | なし | なし |
| docs/designs/responsibilities/req-impact-map.md | 合格 | 修正不要 | 表層・文字コード | 11 | 合格 | なし | なし |
| docs/designs/responsibilities/responsibility-boundary-purification.md | 合格 | 修正不要 | 表層・文字コード | 23 | 合格 | なし | なし |
| docs/designs/skills/_template.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/designs/skills/agentdev-adversarial-review.md | 合格 | 修正不要 | 表層・文字コード | 32 | 合格 | なし | なし |
| docs/designs/skills/agentdev-architecture-advisory.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-artifact-validation.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/designs/skills/agentdev-backlog-integration.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/designs/skills/agentdev-case-run-execution-adapter.md | 合格 | 修正不要 | 表層・文字コード | 27 | 合格 | なし | なし |
| docs/designs/skills/agentdev-command-authoring.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/skills/agentdev-command-creator.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-conventional-commits.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/skills/agentdev-decision-file-manager.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/skills/agentdev-decision-guidelines.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/skills/agentdev-design-file-manager.md | 合格 | 修正不要 | 表層・文字コード | 13 | 合格 | なし | なし |
| docs/designs/skills/agentdev-doc-diagnostics.md | 合格 | 修正不要 | 表層・文字コード | 9 | 合格 | なし | なし |
| docs/designs/skills/agentdev-epic-tracker.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-git-worktree-test-fallback.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/skills/agentdev-git-worktree.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/skills/agentdev-inspect-skills.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/skills/agentdev-intake-pipeline.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/skills/agentdev-issue-management.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-issue-tracking.md | 合格 | 修正不要 | 表層・文字コード | 8 | 合格 | なし | なし |
| docs/designs/skills/agentdev-learning-capture.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/skills/agentdev-learning-pipeline.md | 合格 | 修正不要 | 表層・文字コード | 17 | 合格 | なし | なし |
| docs/designs/skills/agentdev-project-extensions.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/designs/skills/agentdev-quality-gates.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/designs/skills/agentdev-req-analysis.md | 合格 | 修正不要 | 表層・文字コード | 13 | 合格 | なし | なし |
| docs/designs/skills/agentdev-req-file-manager.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/skills/agentdev-req-structure-diagnostics.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-skill-authoring.md | 合格 | 修正不要 | 表層・文字コード | 24 | 合格 | なし | なし |
| docs/designs/skills/agentdev-traceability.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/designs/skills/agentdev-workflow-backlog-auto.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/designs/skills/agentdev-workflow-lifecycle.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-workflow-orchestration.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-workflow-routing.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/designs/skills/agentdev-workflow-templates.md | 合格 | 修正不要 | 表層・文字コード | 15 | 合格 | なし | なし |
| docs/designs/workflows/backlog-artifact-lifecycle.md | 合格 | 修正不要 | 表層・文字コード | 17 | 合格 | なし | なし |
| docs/designs/workflows/capture-boundaries.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/designs/workflows/delegation-contracts.md | 合格 | 修正不要 | 表層・文字コード | 30 | 合格 | なし | なし |
| docs/designs/workflows/epic-wave-model.md | 合格 | 修正不要 | 表層・文字コード | 29 | 合格 | なし | なし |
| docs/designs/workflows/input-resolution-and-durable-state.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/designs/workflows/references/execution-unit-construction.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/designs/workflows/step-reference-contract.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/designs/workflows/workflow-contracts.md | 合格 | 修正不要 | 表層・文字コード | 41 | 合格 | なし | なし |
| docs/designs/workflows/workflow-skill-model.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/guides/artifacts-and-state.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/guides/charter.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/guides/command-selection.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/guides/consumer-project-setup.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/guides/diagnostics-and-maintenance.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/guides/glossary.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/guides/intake-learning-backlog-flow.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/guides/project-docs-and-specs.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/guides/quickstart.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/guides/README.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/guides/req-case-flow.md | 合格 | 修正不要 | 表層・文字コード | 14 | 合格 | なし | なし |
| docs/guides/troubleshooting.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | 合格 | 修正不要 | 表層・文字コード | 10 | 合格 | なし | なし |
| docs/knowledge/README.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/knowledge/windows-powershell-bulk-io-corruption.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/README.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/README.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/requirements/REQ-001.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-002.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-003.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-004.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-005.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-006.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/requirements/REQ-007.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-008.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/requirements/REQ-009.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-010.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/requirements/REQ-011.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-012.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-014.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-015.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-016.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/requirements/REQ-017.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-018.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-019.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/requirements/REQ-021.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-027.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-029.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-030.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-031.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-032.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-033.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-034.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-035.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-036.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-037.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-038.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-039.md | 合格 | 修正不要 | 表層・文字コード | 5 | 合格 | なし | なし |
| docs/requirements/REQ-041.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-044.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-045.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-046.md | 合格 | 修正不要 | 表層・文字コード | 0 | 合格 | なし | なし |
| docs/requirements/REQ-047.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-048.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-049.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-050.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/requirements/REQ-051.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-052.md | 合格 | 修正不要 | 表層・文字コード | 4 | 合格 | なし | なし |
| docs/requirements/REQ-053.md | 合格 | 修正不要 | 表層・文字コード | 2 | 合格 | なし | なし |
| docs/requirements/REQ-054.md | 合格 | 修正不要 | 表層・文字コード | 7 | 合格 | なし | なし |
| docs/requirements/REQ-055.md | 合格 | 修正不要 | 表層・文字コード | 1 | 合格 | なし | なし |
| docs/requirements/REQ-056.md | 合格 | 修正不要 | 表層・文字コード | 6 | 合格 | なし | なし |
| docs/requirements/REQ-057.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |
| docs/requirements/REQ-058.md | 合格 | 修正不要 | 表層・文字コード | 3 | 合格 | なし | なし |

## 3. 集計（ファイル単位結果との一致確認）

| 集計値 | 件数 |
|---|---|
| 対象ファイル数 | 263 |
| 修正不要 | 263 |
| 修正実施 | 0 |
| 最終判定 合格 | 263 |
| 最終判定 不合格 | 0 |
| blocked | 0 |
| 拒否対象違反の残存 | 0 |
| 助言あり（CR-001 対象外） | 201 |
| 助言なし | 62 |

集計値は第 2 節のファイル単位結果と同一入力（gate.ts --json の機械出力）から機械生成され、生成スクリプトの段階で一致を検証している。

## 4. 文字コード機械検査（TS-008）

検査方式: node スクリプト（readFileSync + fatal TextDecoder）による docs 系 263 ファイル全件の機械検査（2026-09-09 実測）。

| 検査項目 | 結果 |
|---|---|
| UTF-8 としての妥当性（fatal TextDecoder） | 263 / 263 合格（違反 0） |
| UTF-8 BOM の検出 | 0 件 |
| CRLF（CR 文字）の検出 | 0 件（全 LF） |

本 Wave では実ファイル変更ゼロのため、本節は現行状態の維持証明である。

## 5. 検査群実行（TS-006）

worktree（HEAD と同一内容、実行記録追加前の実測）で検査群を実行した。実行記録追加後の最終再検証結果は該当 PR 本文の検証差分セクションに記録する。

| 検査 | 結果 |
|---|---|
| integrity suite（bun test ./.opencode/skills/repo-agentdev-integrity/scripts/） | 2557 pass / 1 fail / 104 ファイル（234.52 秒実測） |
| targeted docs guard（check_changed_docs.ts --workflow case-run --base-ref main） | violations 0（docs 差分なし時点） |
| traceability check（check.ts --req REQ-053-013,REQ-053-036,REQ-053-039,REQ-057-021） | missing-implementation が REQ-053-013 の 1 件のみ（本 Report の covers 宣言により解消見込み、追加後再実行を PR 本文に記録）。REQ-053-036 / REQ-053-039 / REQ-057-021 は合格 |
| AUTOGEN 鮮度 gate（generate_indexes.ts） | no changes (already up-to-date) |

integrity suite の 1 fail は IR-055 runtime-unresolved-reference の新規 delta 1 件（第 6 節）であり、docs 系の変更に起因しない。既知の環境由来 fail（Wave2 で確認済みのサブプロセス spawn timeout。baseline-known 閾値テストの 5 秒タイムアウト）は単独再実行で由来分類済みであり、今回のフル実行では出現しなかった。

## 6. IR-055 新規 delta の由来（REQ-057-024 対応の現状記録）

IR-055 runtime-unresolved-reference の検出 90 件の内訳は baseline-known 89 件（info、heuristic 49 + strict 40）と新規 1 件（warning、heuristic）である。新規 1 件の由来は次のとおりであり、本 Wave の変更（docs/reports/ への実行記録追加）には起因しない。

| 項目 | 内容 |
|---|---|
| 検出箇所 | `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` 146 行目（`docs/designs/local/runtime-package-boundary.md` 参照） |
| 導入元 | commit 57f63087（PR #2715、2026-09-09、「docs(skill): 境界跨ぎ編集の永続化確認手順を配布参照へ明文化 Refs #2707」） |
| 検出内容 | 配布物から `docs/designs/` への参照（consumer 環境で未解決になり得る IR-055 heuristic 違反） |
| 本 Wave での対応 | src/opencode/** は Wave4（#2738）の並列実行領域のため修正せず、由来を本節に記録 |

baseline 再生成の主責任は Wave5 である（REQ-057-024）。上記 1 件の修正先（配布参照の解消または baseline 登録の判断）は Wave4 / Wave5 への引き継ぎ事項である。

## 7. Wave5 への引き継ぎ

| 引き継ぎ事項 | 内容 |
|---|---|
| 規則構成ハッシュ | 本 Wave は Wave2 固定値 `8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73` から未変更（第 1 節） |
| 拒否対象違反 | 初期判定 0 → 最終 0 を維持（REQ-053-020 の初期ゼロ維持に合致） |
| IR-055 新規 delta | 第 6 節の 1 件（PR #2715 由来）。Wave5 の baseline 再生成時の判断対象 |
| 助言指摘 | docs 系 2,328 件（CR-001 対象外、第 1.1 節に内訳） |
