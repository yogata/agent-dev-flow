---
title: SPEC 健全性メトリクス
status: accepted
created: 2026-06-26
updated: 2026-07-24
---

# SPEC 健全性メトリクス

SPEC の肥大化、関心ズレ、放置を定量的に検出するための閾値を定義する。
req-health-metrics.md と対となる SPEC 健全性の定量メトリクスであり、REQ/SPEC 健全性の双方向メトリクスを構成する（v2:REQ-0155-001, REQ-001-007）。

## 適用範囲

- **対象**: docs/specs/ 配下の SPEC ファイル（commands/, skills/, workflows/, ドメインディレクトリ配下）
- **対象外**: REQ, ADR, guides, DOC-MAP, .agentdev/ 配下のドラフト

## 測定対象と計測方法

| メトリクス | 定義 | 計測方法 |
|---|---|---|
| SPEC行数 | SPECファイルの人手管理本文行数 | frontmatter、HTMLコメント、AUTOGENブロック全体を除外して計測する |
| status放置期間 | draft状態のSPECが最終更新から経過した日数 | frontmatter `updated`から算出する |
| ドメイン分類適合 | SPECが文書モデルの配置規則へ適合するか | ファイルパスとドメイン定義を照合する |
| 宣言率（spec_logical_division） | 主論理区分を宣言済みの SPEC 数 / 全 SPEC 数 | 下記「宣言率指標の定義」参照 |
| 宣言率（canonical_owner） | 正規所有対象を宣言済みの SPEC 数 / 全 SPEC 数 | 下記「宣言率指標の定義」参照 |

AUTOGENブロックは `AUTOGEN:BEGIN` マーカーから対応する `AUTOGEN:END` マーカーまでを除外する。本節をSPEC行数計測定義の正本とする。

### 宣言率指標の定義

宣言率は SPEC の主論理区分（`spec_logical_division`）、正規所有対象（`canonical_owner`）の宣言状況を機械的に集計する指標である（REQ-001-013、REQ-001-035、RU-0025、REQ-001）。

- **分子**: 宣言対象フィールド（`spec_logical_division` または `canonical_owner`）を frontmatter または冒頭宣言節のいずれかで宣言している SPEC ファイル数
- **分母**: `docs/specs/**/*.md` に存在する全 SPEC ファイル数（`_template.md` を除く）
- **計算方法**: 各 SPEC ファイルの frontmatter と冒頭宣言節を grep / parse し、対象フィールドの宣言有無を判定する。frontmatter 形式（YAML frontmatter 内の当該フィールド）と冒頭宣言節形式（`../foundations/document-model.md`「SPEC 宣言形式」が定義する冒頭宣言節内の当該フィールド）の両方を計測対象とし、いずれか一方でも宣言されていれば宣言済みと数える
- **unknown 扱い**: フィールド値が `unknown`、または欠落している SPEC は「未宣言」として扱い、分子に含めない（分母には含める）。警告モード運用（ADR-003 soft-contract）と整合し、欠落を理由に SPEC を拒否しない
- **閾値**: 設けない（警告モード）。不合格による保存拒否、配置一貫性検証の強制を行わない。段階適用（REQ-001-035）に従い、新規 SPEC から順次宣言付与を適用し、宣言率の推移を追跡する
- **再現性**: 同一 commit 状態に対して grep / parse 集計を行えば誰でも同一結果を得られる。集計ロジックは本 SPEC が定義し、実行は `inspect-docs`、`/repo/docs-check` が担う（本 SPEC 自体は計測ロジックを実装しない）

宣言率指標は警告モードで運用し、不合格閾値を設けない（REQ-001-035 段階適用、ADR-003 soft-contract）。新規 SPEC から順次宣言付与を適用し、段階的な宣言率向上を追跡する。

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
| foundations/document-model.md | 628 | accepted | foundations |
| responsibilities/artifact-contracts.md | 427 | accepted | responsibilities |
| integrity/integrity-contracts.md | 361 | accepted | integrity |
| responsibilities/document-type-responsibilities.md | 349 | accepted | responsibilities |
| commands/req-define.md | 330 | accepted | commands |
| local/runtime-package-boundary.md | 316 | accepted | local |
| workflows/epic-wave-model.md | 314 | accepted | workflows |
| workflows/backlog-artifact-lifecycle.md | 262 | accepted | workflows |
| commands/case-auto.md | 261 | accepted | commands |
| commands/case-run.md | 261 | accepted | commands |
| commands/case-open.md | 254 | accepted | commands |
| integrity/integrity-rule-catalog.md | 251 | accepted | integrity |
| commands/case-close.md | 244 | accepted | commands |
| README.md | 242 | - | uncategorized |
| local/local-case-file.md | 240 | accepted | local |
| workflows/workflow-contracts.md | 214 | accepted | workflows |
| workflows/delegation-contracts.md | 210 | accepted | workflows |
| skills/agentdev-gh-cli.md | 192 | accepted | skills |
| quality/quality-gates.md | 186 | accepted | quality |
| commands/spec-save.md | 180 | accepted | commands |
| foundations/design-principles.md | 158 | accepted | foundations |
| integrity/index-auto-generation.md | 156 | accepted | integrity |
| integrity/targeted-docs-guard-implementation.md | 151 | accepted | integrity |
| foundations/patterns.md | 147 | accepted | foundations |
| responsibilities/artifact-responsibilities.md | 145 | accepted | responsibilities |
| commands/backlog-review.md | 133 | accepted | commands |
| responsibilities/responsibility-boundary-purification.md | 128 | accepted | responsibilities |
| quality/req-health-metrics.md | 127 | accepted | quality |
| commands/req-save.md | 125 | accepted | commands |
| foundations/harness-separation-model.md | 124 | accepted | foundations |
| foundations/project-extensions.md | 123 | accepted | foundations |
| integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md | 118 | accepted | integrity |
| authoring/command-file-format.md | 115 | accepted | authoring |
| responsibilities/req-impact-map.md | 115 | accepted | responsibilities |
| quality/spec-health-metrics.md | 113 | accepted | quality |
| commands/learning-promote.md | 111 | accepted | commands |
| skills/agentdev-workflow-templates.md | 109 | accepted | skills |
| commands/intake-promote.md | 107 | accepted | commands |
| integrity/rules/IR-044-req-spec-boundary-violation-detection.md | 105 | accepted | integrity |
| workflows/capture-boundaries.md | 104 | accepted | workflows |
| foundations/system.md | 98 | accepted | foundations |
| skills/agentdev-adr-guidelines.md | 96 | accepted | skills |
| skills/agentdev-spec-file-manager.md | 88 | draft | skills |
| integrity/references/targeted-docs-guard-implementation-details.md | 87 | - | integrity |
| commands/inspect-docs.md | 85 | accepted | commands |
| commands/inspect-extensions.md | 84 | superseded | commands |
| skills/agentdev-doc-diagnostics.md | 83 | draft | skills |
| skills/agentdev-adr-file-manager.md | 82 | accepted | skills |
| skills/agentdev-artifact-validation.md | 81 | draft | skills |
| integrity/rule-ownership.md | 79 | accepted | integrity |
| commands/inspect-promote.md | 77 | accepted | commands |
| commands/inspect-skills.md | 75 | accepted | commands |
| skills/agentdev-skill-authoring.md | 74 | accepted | skills |
| commands/intake-from-github.md | 70 | accepted | commands |
| integrity/rules/IR-054-draft-spec-abandonment-detection.md | 69 | accepted | integrity |
| integrity/rules/IR-058-distribution-untracked-skill-reference.md | 69 | accepted | integrity |
| skills/agentdev-deep-review.md | 69 | draft | skills |
| commands/case-update.md | 68 | accepted | commands |
| skills/agentdev-project-extensions.md | 68 | accepted | skills |
| commands/intake-capture.md | 67 | accepted | commands |
| integrity/docs-spec-rebuild-integrity.md | 67 | accepted | integrity |
| skills/agentdev-doc-writing.md | 67 | accepted | skills |
| integrity/rules/IR-056-project-extensions-integrity.md | 66 | accepted | integrity |
| skills/agentdev-issue-management.md | 65 | accepted | skills |
| foundations/numbering-policy.md | 64 | accepted | foundations |
| integrity/rules/IR-055-runtime-unresolved-reference.md | 63 | accepted | integrity |
| skills/agentdev-quality-gates.md | 62 | accepted | skills |
| foundations/references/concrete-abstraction.md | 61 | accepted | foundations |
| skills/agentdev-req-file-manager.md | 61 | accepted | skills |
| workflows/references/execution-unit-construction.md | 61 | accepted | workflows |
| integrity/rules/IR-060-forbidden-japanese-word-detection.md | 60 | accepted | integrity |
| skills/agentdev-req-analysis.md | 60 | accepted | skills |
| skills/agentdev-git-worktree.md | 59 | accepted | skills |
| skills/agentdev-workflow-lifecycle.md | 59 | accepted | skills |
| skills/agentdev-case-run-execution-adapter.md | 57 | accepted | skills |
| skills/agentdev-workflow-orchestration.md | 57 | accepted | skills |
| skills/agentdev-intake-pipeline.md | 56 | accepted | skills |
| skills/agentdev-backlog-integration.md | 55 | accepted | skills |
| skills/agentdev-epic-tracker.md | 55 | accepted | skills |
| skills/agentdev-command-authoring.md | 54 | accepted | skills |
| skills/agentdev-inspect-skills.md | 54 | accepted | skills |
| skills/agentdev-learning-pipeline.md | 54 | accepted | skills |
| skills/agentdev-req-structure-diagnostics.md | 54 | accepted | skills |
| integrity/backticks-identifier-threshold.md | 53 | accepted | integrity |
| skills/agentdev-workflow-routing.md | 52 | accepted | skills |
| skills/agentdev-architecture-advisory.md | 51 | accepted | skills |
| skills/agentdev-conventional-commits.md | 51 | accepted | skills |
| skills/agentdev-doc-map.md | 51 | accepted | skills |
| skills/agentdev-learning-capture.md | 51 | accepted | skills |
| skills/agentdev-command-creator.md | 48 | accepted | skills |
| integrity/rules/IR-011-mapping-table-full-coverage.md | 46 | superseded | integrity |
| integrity/rules/IR-052-completion-grep-pattern-design.md | 40 | accepted | integrity |
| integrity/rules/IR-036-adr-work-means-detection.md | 39 | accepted | integrity |
| integrity/rules/IR-061-index-generation-consistency.md | 39 | accepted | integrity |
| integrity/rules/IR-059-distribution-reference-boundary.md | 37 | accepted | integrity |
| integrity/rules/IR-025-retired-adr-path-rule.md | 35 | accepted | integrity |
| quality/quality-specs.md | 27 | accepted | quality |
| integrity/validator-split-criteria.md | 25 | accepted | integrity |
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
| integrity/references/validator-internal-config.md | 20 | - | integrity |

計測日: 2026-07-27。
<!-- AUTOGEN:END -->

SPEC 行数は frontmatter、HTML コメントを除く本文行数。

## 他 SPEC、スキルとの関係

- **req-health-metrics.md**: REQ 健全性メトリクス。本 SPEC は SPEC 健全性メトリクスとして対をなす（REQ/SPEC 双方向メトリクス）
- **document-model.md**: ドメイン分類の定義元。本 SPEC のドメイン分類適合判定が参照する
- **integrity-rule-catalog.md IR-054**: draft SPEC 放置検出ルール。本 SPEC の放置期間閾値と連動する
- **REQ-001**: SPEC status 追跡と draft 放置検出。本 SPEC の放置期間メトリクスと連動する

## 機械化境界

本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

- **inspect-docs / inspect-skills**: 定期診断で本 SPEC の閾値を適用
- **case-close**: draft → accepted 昇格時に放置期間をリセット
- **生成スクリプト**（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）: 本 SPEC に基づく SPEC 計測例テーブルを実ファイルから再生成する（SC-002）。定期実行を前提とし、計測結果を実ファイルの最新状態に追従させる

本 SPEC 自体は計測ロジックを実装しない。
閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。

## SPEC 横断診断

SPEC 健全性診断は行数・status・配置に加え、主論理区分・正規所有対象（REQ-001-013、REQ-003-038）に基づく次の検出パターンを追加する（REQ-010-285、REQ-001）。

### 検出パターン

| パターン | 内容 |
|---|---|
| 主論理区分不明SPEC | 宣言節（frontmatter または冒頭宣言節）不在、または v2:REQ-0155-009 が定義する5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれにも該当しない |
| 正規所有対象不明SPEC | 関心キー宣言不在（REQ-001-013、REQ-003-038 違反） |
| 所有権重複 | 複数 SPEC が同一関心キーの正規所有を主張（REQ-003-038 違反） |
| 論理区分不当混在 | 1 SPEC に主従判別不能な複数区分が混在（REQ-001-013 違反） |
| 所有先なしパラメータ群 | パラメータSPEC の正規所有者が不在 |
| 実装/履歴混入 | SPEC に実装計画、マイルストーン、完了履歴が混入（REQ-001-060 違反） |
| REQ 規範重複 | SPEC 記述が REQ 要件と重複 |
| accepted 間分界不一致 | 複数 accepted SPEC 間で所有権が矛盾 |
| 実装-SPEC 所有不一致 | 実装側（src/opencode/）の所有者が SPEC 宣言と不一致 |

### 後方互換運用

宣言形式（主論理区分、正規所有対象）が未定義の既存 SPEC は警告モードで経過観察する（REQ-001-035）。強制ゲート（保存拒否条件: 重複所有、配置不一致）は SPEC 宣言形式の定義完了後に有効化し、段階適用（宣言形式定義 → 警告モード棚卸し → 重複解消 → 新規/変更 SPEC 強制 → 全件強制）とする。

### 機械化境界

上記検出パターンの機械判定可能範囲（frontmatter 宣言不在検出、所有権重複検出等）は docs-check が担う。文脈解釈を要する判定（論理区分不当混在、REQ 規範重複等）は inspect-docs / `agentdev-doc-writing` が担う（3層検出構造、REQ-010-254）。本 SPEC は検出パターンの定義のみを提供し、各実装を規定しない。
