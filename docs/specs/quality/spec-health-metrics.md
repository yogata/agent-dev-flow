---
title: SPEC 健全性メトリクス
status: accepted
created: 2026-06-26
updated: 2026-06-26
---

# SPEC 健全性メトリクス

SPEC の肥大化、関心ズレ、放置を定量的に検出するための閾値を定義する。
req-health-metrics.md と対となる SPEC 健全性の定量メトリクスであり、REQ/SPEC 健全性の双方向メトリクスを構成する（REQ-0155-001, REQ-0156-007）。

## 適用範囲

- **対象**: docs/specs/ 配下の SPEC ファイル（commands/, skills/, workflows/, ドメインディレクトリ配下）
- **対象外**: REQ, ADR, guides, DOC-MAP, .agentdev/ 配下のドラフト

## 測定対象と計測方法

| メトリクス | 定義 | 計測方法 |
|---|---|---|
| SPEC 行数 | SPEC ファイルの本文行数 | frontmatter、HTML コメントを除く本文行数 |
| status 放置期間 | draft status の SPEC が最終更新から現在までの日数 | frontmatter updated 日付から現在までの日数 |
| ドメイン分類適合 | SPEC が document-model.md のドメイン分類に従って配置されているか | ファイルパスと document-model.md ドメイン定義の照合 |

## 閾値とシグナル

### SPEC 行数

| SPEC 行数 | シグナル | 判定 |
|---|---|---|
| 0〜300 | +0 | 健全 |
| 301〜500 | +1 | 肥大化傾向。分割検討 |
| 501 以上 | +2 | 肥大化。分割推奨 |

### status 放置期間（draft SPEC）

| 放置期間 | シグナル | 判定 |
|---|---|---|
| 0〜30 日 | +0 | 健全 |
| 31〜90 日 | +1 | 放置傾向。case-close での昇格を促進 |
| 91 日以上 | +2 | 放置。IR-054 対象 |

### ドメイン分類適合

| 状態 | シグナル | 判定 |
|---|---|---|
| ドメイン分類に適合 | +0 | 健全 |
| ドメイン未分類（直下残留） | +1 | 分類候補。inspect/backlog で移送検討 |

## SPEC 計測例（参照値）

本 SPEC の閾値を docs/specs/ 配下の SPEC に適用した結果の参照値。
定期計測時の推移比較に使用する。

<!-- AUTOGEN:BEGIN:id=spec-metrics-measurement-example -->
| SPEC | SPEC 行数 | status | ドメイン分類 |
|---|---|---|---|
| foundations/document-model.md | 477 | accepted | foundations |
| responsibilities/artifact-contracts.md | 317 | accepted | responsibilities |
| responsibilities/document-type-responsibilities.md | 311 | accepted | responsibilities |
| workflows/epic-wave-model.md | 304 | accepted | workflows |
| local/runtime-package-boundary.md | 291 | accepted | local |
| integrity/integrity-contracts.md | 264 | accepted | integrity |
| commands/case-run.md | 255 | accepted | commands |
| workflows/backlog-artifact-lifecycle.md | 249 | accepted | workflows |
| integrity/integrity-rule-catalog.md | 241 | accepted | integrity |
| local/local-case-file.md | 241 | accepted | local |
| README.md | 228 | - | uncategorized |
| local/local-generation.md | 217 | accepted | local |
| commands/req-define.md | 213 | accepted | commands |
| commands/case-close.md | 201 | accepted | commands |
| commands/case-auto.md | 193 | accepted | commands |
| skills/agentdev-gh-cli.md | 192 | accepted | skills |
| commands/case-open.md | 186 | accepted | commands |
| workflows/delegation-contracts.md | 185 | accepted | workflows |
| quality/quality-gates.md | 181 | accepted | quality |
| workflows/workflow-contracts.md | 167 | accepted | workflows |
| integrity/index-auto-generation.md | 158 | accepted | integrity |
| foundations/patterns.md | 142 | accepted | foundations |
| foundations/project-extensions.md | 138 | accepted | foundations |
| commands/spec-save.md | 137 | accepted | commands |
| foundations/design-principles.md | 136 | accepted | foundations |
| commands/req-save.md | 133 | accepted | commands |
| foundations/harness-separation-model.md | 121 | accepted | foundations |
| responsibilities/req-impact-map.md | 115 | accepted | responsibilities |
| integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md | 110 | accepted | integrity |
| authoring/command-file-format.md | 108 | accepted | authoring |
| responsibilities/artifact-responsibilities.md | 106 | accepted | responsibilities |
| integrity/rules/IR-044-req-spec-boundary-violation-detection.md | 105 | accepted | integrity |
| quality/req-health-metrics.md | 105 | accepted | quality |
| commands/backlog-review.md | 104 | accepted | commands |
| foundations/system.md | 99 | accepted | foundations |
| workflows/capture-boundaries.md | 93 | accepted | workflows |
| commands/learning-promote.md | 88 | accepted | commands |
| commands/inspect-docs.md | 85 | accepted | commands |
| commands/intake-promote.md | 84 | accepted | commands |
| local/audit-ledger-lifecycle.md | 83 | accepted | local |
| integrity/rule-ownership.md | 79 | accepted | integrity |
| commands/inspect-promote.md | 77 | accepted | commands |
| commands/inspect-extensions.md | 75 | accepted | commands |
| commands/inspect-skills.md | 75 | accepted | commands |
| skills/agentdev-skill-authoring.md | 74 | accepted | skills |
| commands/intake-from-github.md | 70 | accepted | commands |
| quality/spec-health-metrics.md | 70 | accepted | quality |
| integrity/rules/IR-054-draft-spec-abandonment-detection.md | 69 | accepted | integrity |
| integrity/rules/IR-058-distribution-untracked-skill-reference.md | 69 | accepted | integrity |
| commands/case-update.md | 68 | accepted | commands |
| skills/agentdev-project-extensions.md | 68 | accepted | skills |
| commands/intake-capture.md | 67 | accepted | commands |
| skills/agentdev-doc-writing.md | 67 | accepted | skills |
| skills/agentdev-workflow-templates.md | 66 | accepted | skills |
| skills/agentdev-issue-management.md | 65 | accepted | skills |
| foundations/numbering-policy.md | 64 | accepted | foundations |
| integrity/rules/IR-055-runtime-unresolved-reference.md | 63 | accepted | integrity |
| skills/agentdev-quality-gates.md | 62 | accepted | skills |
| integrity/targeted-docs-guard-implementation.md | 61 | accepted | integrity |
| skills/agentdev-req-file-manager.md | 61 | accepted | skills |
| integrity/rules/IR-060-forbidden-japanese-word-detection.md | 60 | accepted | integrity |
| responsibilities/responsibility-boundary-purification.md | 60 | accepted | responsibilities |
| skills/agentdev-req-analysis.md | 60 | accepted | skills |
| integrity/docs-spec-rebuild-integrity.md | 59 | accepted | integrity |
| skills/agentdev-git-worktree.md | 59 | accepted | skills |
| skills/agentdev-workflow-lifecycle.md | 59 | accepted | skills |
| skills/agentdev-case-run-execution-adapter.md | 57 | accepted | skills |
| skills/agentdev-workflow-orchestration.md | 57 | accepted | skills |
| integrity/rules/IR-056-project-extensions-integrity.md | 56 | accepted | integrity |
| skills/agentdev-intake-pipeline.md | 56 | accepted | skills |
| skills/agentdev-backlog-integration.md | 55 | accepted | skills |
| skills/agentdev-epic-tracker.md | 55 | accepted | skills |
| skills/agentdev-command-authoring.md | 54 | accepted | skills |
| skills/agentdev-inspect-skills.md | 54 | accepted | skills |
| skills/agentdev-learning-pipeline.md | 54 | accepted | skills |
| skills/agentdev-req-structure-diagnostics.md | 54 | accepted | skills |
| integrity/backticks-identifier-threshold.md | 53 | accepted | integrity |
| skills/agentdev-adr-file-manager.md | 53 | accepted | skills |
| skills/agentdev-adr-guidelines.md | 53 | accepted | skills |
| skills/agentdev-workflow-routing.md | 52 | accepted | skills |
| skills/agentdev-architecture-advisory.md | 51 | accepted | skills |
| skills/agentdev-conventional-commits.md | 51 | accepted | skills |
| skills/agentdev-doc-map.md | 51 | accepted | skills |
| skills/agentdev-learning-capture.md | 51 | accepted | skills |
| skills/agentdev-command-creator.md | 48 | accepted | skills |
| integrity/rules/IR-059-distribution-reference-boundary.md | 46 | accepted | integrity |
| integrity/rules/IR-052-completion-grep-pattern-design.md | 40 | accepted | integrity |
| integrity/rules/IR-036-adr-work-means-detection.md | 39 | accepted | integrity |
| integrity/rules/IR-061-index-generation-consistency.md | 39 | accepted | integrity |
| integrity/validator-split-criteria.md | 35 | accepted | integrity |
| integrity/rules/IR-025-retired-adr-path-rule.md | 31 | accepted | integrity |
| quality/quality-specs.md | 27 | accepted | quality |
| integrity/rules/IR-001-req-frontmatter-id-filename.md | 21 | accepted | integrity |
| integrity/rules/IR-002-req-required-frontmatter.md | 21 | accepted | integrity |
| integrity/rules/IR-003-active-retired-req-id-conflict.md | 21 | accepted | integrity |
| integrity/rules/IR-004-req-index-actual-consistency.md | 21 | accepted | integrity |
| integrity/rules/IR-005-adr-req-bidirectional-reference.md | 21 | accepted | integrity |
| integrity/rules/IR-006-command-allowed-frontmatter.md | 21 | accepted | integrity |
| integrity/rules/IR-007-skill-name-dir-match.md | 21 | accepted | integrity |
| integrity/rules/IR-008-skill-references-existence.md | 21 | accepted | integrity |
| integrity/rules/IR-009-obsolete-namespace-residual.md | 21 | accepted | integrity |
| integrity/rules/IR-010-adr-status-normalization.md | 21 | accepted | integrity |
| integrity/rules/IR-011-mapping-table-full-coverage.md | 21 | accepted | integrity |
| integrity/rules/IR-012-template-required-sections.md | 21 | accepted | integrity |
| integrity/rules/IR-013-variant-path-existence.md | 21 | accepted | integrity |
| integrity/rules/IR-014-singular-reference-dir-residual.md | 21 | accepted | integrity |
| integrity/rules/IR-015-retired-req-current-ref-detection.md | 21 | accepted | integrity |
| integrity/rules/IR-016-source-projection-integrity.md | 21 | accepted | integrity |
| integrity/rules/IR-017-docmap-actual-consistency.md | 21 | accepted | integrity |
| integrity/rules/IR-018-req-range-notation-freshness.md | 21 | accepted | integrity |
| integrity/rules/IR-019-guide-req-contract-content-detection.md | 21 | accepted | integrity |
| integrity/rules/IR-020-baseline-known-vs-new-finding.md | 21 | accepted | integrity |
| integrity/rules/IR-021-retired-skill-reference-detection.md | 21 | accepted | integrity |
| integrity/rules/IR-022-req-internal-consistency.md | 21 | accepted | integrity |
| integrity/rules/IR-023-integrity-artifact-validator-drift.md | 21 | accepted | integrity |
| integrity/rules/IR-024-command-readme-actual.md | 21 | accepted | integrity |
| integrity/rules/IR-026-adr-misclassification-sign.md | 21 | accepted | integrity |
| integrity/rules/IR-027-retired-adr-current-authority-citation.md | 21 | accepted | integrity |
| integrity/rules/IR-028-command-top-step-int-only.md | 21 | accepted | integrity |
| integrity/rules/IR-029-command-alphabet-substep-prohibition.md | 21 | accepted | integrity |
| integrity/rules/IR-030-subagent-verbatim-conditional-return.md | 21 | accepted | integrity |
| integrity/rules/IR-031-findings-capture-heading-unification.md | 21 | accepted | integrity |
| integrity/rules/IR-032-delegation-type-on-result-envelope-prohibition.md | 21 | accepted | integrity |
| integrity/rules/IR-033-lightweight-delegation-primary-pattern-prohibition.md | 21 | accepted | integrity |
| integrity/rules/IR-034-skill-internal-section-step-reference-detection.md | 21 | accepted | integrity |
| integrity/rules/IR-035-skill-see-also-detection-perspective.md | 21 | accepted | integrity |
| integrity/rules/IR-037-retired-adr-current-baseline-ref.md | 21 | accepted | integrity |
| integrity/rules/IR-038-adr-index-consistency.md | 21 | accepted | integrity |
| integrity/rules/IR-039-index-req-title-consistency.md | 21 | accepted | integrity |
| integrity/rules/IR-040-retired-req-authority-comment.md | 21 | accepted | integrity |
| integrity/rules/IR-041-retired-req-broken-link.md | 21 | accepted | integrity |
| integrity/rules/IR-042-hardcoded-req-count.md | 21 | accepted | integrity |
| integrity/rules/IR-043-retired-readme-coverage.md | 21 | accepted | integrity |
| integrity/rules/IR-046-consumer-generated-repo-type-fp-prevention.md | 21 | accepted | integrity |
| integrity/rules/IR-047-src-opencode-local-link-origin-dir-structure.md | 21 | accepted | integrity |
| integrity/rules/IR-048-generated-by-identifier-integrity.md | 21 | accepted | integrity |
| integrity/rules/IR-049-command-file-format-violation.md | 21 | accepted | integrity |
| integrity/rules/IR-050-load-skills-command-mis-specification.md | 21 | accepted | integrity |
| integrity/rules/IR-051-executor-skill-notation-misrecognition.md | 21 | accepted | integrity |
| integrity/rules/IR-053-gh-direct-invocation-detection.md | 21 | accepted | integrity |

計測日: 2026-07-20。
<!-- AUTOGEN:END -->

SPEC 行数は frontmatter、HTML コメントを除く本文行数。

## 他 SPEC、スキルとの関係

- **req-health-metrics.md**: REQ 健全性メトリクス。本 SPEC は SPEC 健全性メトリクスとして対をなす（REQ/SPEC 双方向メトリクス）
- **document-model.md**: ドメイン分類の定義元。本 SPEC のドメイン分類適合判定が参照する
- **integrity-rule-catalog.md IR-054**: draft SPEC 放置検出ルール。本 SPEC の放置期間閾値と連動する
- **REQ-0154**: SPEC status 追跡と draft 放置検出。本 SPEC の放置期間メトリクスと連動する

## 機械化境界

本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **inspect-docs / inspect-skills**: 定期診断で本 SPEC の閾値を適用
- **case-close**: draft → accepted 昇格時に放置期間をリセット
- **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC に基づく SPEC 計測例テーブルを実ファイルから再生成する（SC-002）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

本 SPEC 自体は計測ロジックを実装しない。
閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。
