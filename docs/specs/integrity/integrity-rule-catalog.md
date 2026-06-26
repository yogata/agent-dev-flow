---
updated: 2026-06-26
---

# 整合性ルールカタログ

整合性検査の全ルールを定義するカタログ（REQ-0108-150, 151）。
各ルールは 15 以上のフィールドを持つ。

> **リポジトリローカル文脈**: 整合性検査は `/repo/docs-check` コマンドと `repo-agentdev-integrity` skill により実行されるリポジトリローカル自己監査である（ADR-0106）。AgentDevFlow の consumer 配布対象外。語彙レジストリは `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` に配置する。

## スキーマ

| Field | 型 | 説明 |
|-------|------|------|
| rule_id | string | 一意識別子 (例: IR-001) |
| description | string | ルールの説明 |
| severity | enum | strict / heuristic / observation |
| category | enum | document-drift / broken-reference / obsolete-structure / canonical-conflict / workflow-gap / integrity-rule-gap |
| detection_method | string | 検出方法（正規表現、構造解析、存在確認等） |
| affected_artifacts | list[str] | 対象アーティファクト種別 |
| related_req | list[str] | 関連 REQ ID |
| related_spec | list[str] | 関連 SPEC ファイル |
| gate_level | enum | full-audit / delta-guard / impact-guard |
| false_positive_risk | string | 誤検知リスクと対策 |
| regression_test | string | 回帰テストの有無、ID |
| baseline_status | enum | known / new / resolved |
| finding_route | enum | intake / intake+learning / req-define / learning / none |
| triage_action | string | 新規検出時の対応アクション |
| last_verified | date | 最終検証日 |

## ルール

- [IR-001: 現行 REQ frontmatter id ↔ ファイル名](rules/IR-001-req-frontmatter-id-filename.md)

- [IR-002: 現行 REQ 必須 frontmatter fields](rules/IR-002-req-required-frontmatter.md)

- [IR-003: Active/廃止 REQ ID 重複](rules/IR-003-active-retired-req-id-conflict.md)

- [IR-004: REQ index ↔ 現行 REQ 一致](rules/IR-004-req-index-actual-consistency.md)

- [IR-005: ADR ↔ REQ 相互参照存在](rules/IR-005-adr-req-bidirectional-reference.md)

- [IR-006: Command frontmatter 許可フィールド](rules/IR-006-command-allowed-frontmatter.md)

- [IR-007: Skill frontmatter name ↔ dir](rules/IR-007-skill-name-dir-match.md)

- [IR-008: Skill references/ 存在](rules/IR-008-skill-references-existence.md)

- [IR-009: 旧 namespace 残存](rules/IR-009-obsolete-namespace-residual.md)

- [IR-010: ADR status 正規化](rules/IR-010-adr-status-normalization.md)

- [IR-011: Mapping table 全件記録](rules/IR-011-mapping-table-full-coverage.md)

- [IR-012: Template 必須セクション](rules/IR-012-template-required-sections.md)

- [IR-013: 完了報告種別実在](rules/IR-013-variant-path-existence.md)

- [IR-014: reference/ 残存検出](rules/IR-014-singular-reference-dir-residual.md)

- [IR-015: 廃止 REQ 現行参照検出](rules/IR-015-retired-req-current-ref-detection.md)

- [IR-016: Source/projection 整合性](rules/IR-016-source-projection-integrity.md)

- [IR-017: DOC-MAP ↔ 実体整合性](rules/IR-017-docmap-actual-consistency.md)

- [IR-018: REQ 範囲表記鮮度](rules/IR-018-req-range-notation-freshness.md)

- [IR-019: Guide 要件定義、契約記述検出](rules/IR-019-guide-req-contract-content-detection.md)

- [IR-020: 基準既知（baseline-known）と新規 finding の区別](rules/IR-020-baseline-known-vs-new-finding.md)

- [IR-021: 廃止済み skill 参照検出](rules/IR-021-retired-skill-reference-detection.md)

- [IR-022: REQ 内部整合性](rules/IR-022-req-internal-consistency.md)

- [IR-023: Integrity artifact validator drift](rules/IR-023-integrity-artifact-validator-drift.md)

- [IR-024: Command README ↔ 実体](rules/IR-024-command-readme-actual.md)

- [IR-025: 廃止 ADR path 規則](rules/IR-025-retired-adr-path-rule.md)

- [IR-026: ADR 誤分類兆候検出](rules/IR-026-adr-misclassification-sign.md)

- [IR-027: 廃止 ADR 現行根拠引用検出](rules/IR-027-retired-adr-current-authority-citation.md)

- [IR-028: Command 最上位 Step 整数化](rules/IR-028-command-top-step-int-only.md)

- [IR-029: Command 英字サブステップ禁止](rules/IR-029-command-alphabet-substep-prohibition.md)

- [IR-030: Subagent verbatim 条件付き返却](rules/IR-030-subagent-verbatim-conditional-return.md)

- [IR-031: Findings / Capture候補 見出し統一](rules/IR-031-findings-capture-heading-unification.md)

- [IR-032: delegation_type/on_result 必須 envelope 禁止](rules/IR-032-delegation-type-on-result-envelope-prohibition.md)

- [IR-033: lightweight-delegation primary pattern 禁止](rules/IR-033-lightweight-delegation-primary-pattern-prohibition.md)

- [IR-034: Skill 内部 section / protocol / Step 参照検出](rules/IR-034-skill-internal-section-step-reference-detection.md)

- [IR-035: Skill See Also 検出観点](rules/IR-035-skill-see-also-detection-perspective.md)

- [IR-036: ADR-work-means-detection](rules/IR-036-adr-work-means-detection.md)

- [IR-037: retired-ADR-current-baseline-ref](rules/IR-037-retired-adr-current-baseline-ref.md)

- [IR-038: ADR-index-consistency](rules/IR-038-adr-index-consistency.md)

- [IR-039: index-req-title-consistency](rules/IR-039-index-req-title-consistency.md)

- [IR-040: retired-req-authority-comment](rules/IR-040-retired-req-authority-comment.md)

- [IR-041: retired-req-broken-link](rules/IR-041-retired-req-broken-link.md)

- [IR-042: hardcoded-req-count](rules/IR-042-hardcoded-req-count.md)

- [IR-043: retired-readme-coverage](rules/IR-043-retired-readme-coverage.md)

- [IR-044: REQ/SPEC 境界違反検出](rules/IR-044-req-spec-boundary-violation-detection.md)

### IR-045: （削除）docs 日本語表現、文意整合検査

> **削除済み（REQ-0108-255/256, REQ-0108-262）**: IR-045 の検査は docs-check の機械検出対象から除外し、agentdev-doc-writing スキル配下へ移譲した。docs-check は意味判断を要する文意整合検査を保持しない（機械化原則 REQ-0108-056/254/261/262）。catalog↔実装双方向同期運用手順（REQ-0145-003）に従い baseline_status: resolved の上で本エントリを削除した。IR-045 識別子は REQ-0108-255/256、`vocabulary-registry.md`「文意品質検出対象語（IR-045）」で文意品質検出対象語の参照として残る。新規検出時の復活運用（REQ-0145-003）に従い、必要に応じて docs-check 検出対象への復活を検討する。

- [IR-046: consumer-generated リポジトリ種別誤検知防止](rules/IR-046-consumer-generated-repo-type-fp-prevention.md)

- [IR-047: src/opencode-local/ link 先原本領域ディレクトリ構成](rules/IR-047-src-opencode-local-link-origin-dir-structure.md)

- [IR-048: generated_by 識別子整合性](rules/IR-048-generated-by-identifier-integrity.md)

- [IR-049: Command file format violation](rules/IR-049-command-file-format-violation.md)

- [IR-050: load_skills command 誤指定検出](rules/IR-050-load-skills-command-mis-specification.md)

### IR-051: 実行主体の skill 表記誤認検出

| Field | Value |
|-------|-------|
| rule_id | IR-051 |
| description | docs/SPEC/command/skill で 既知 command 名（`/agentdev/*`、`/ulw-loop` 等）、既知 harness 名（oh-my-openagent 等）、既知 subagent 名（Sisyphus-Junior 等）が「スキル」「skill」と表記されていることを検出すること（REQ-0108-261）。実行主体の分類（command / skill / subagent / harness）は `docs/specs/document-type-responsibilities.md`「実行主体分類の査読基準」に定義される |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 既知 command 名、harness 名、subagent 名（語彙レジストリ `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` 参照）の出現位置から一定文字距離内（同一段落、同行、隣接リスト項目等）の「スキル」「skill」表記を検出。コードブロック内の例示、IR ルール本文中のパターン説明、誤認説明の否定文脈（「skill ではない」等）は除外対象 |
| affected_artifacts | [REQ, SPEC, guides, commands, skills] |
| related_req | [REQ-0108-261, REQ-0140-027, REQ-0125-010] |
| related_spec | [integrity-contracts.md, document-type-responsibilities.md] |
| gate_level | full-audit |
| false_positive_risk | 高。文脈判断が必要（例: 「agentdev-doc-writing skill」は正当、「ulw-loop skill」は誤認）。意味判断を要する境界ケースは inspect-skills（REQ-0125-010）、doc-writing（REQ-0140-027）が意味的診断を担う。本ルールは機械的パターンマッチングで判定可能な範囲（既知名 + 近接 skill 表記）に限定 |
| regression_test | (追加予定)。既知 true positive として OU-001 修正前の ulw-loop 委譲契約バグ周辺の skill 表記を回帰テストで検証 |
| baseline_status | new |
| finding_route | intake |
| triage_action | command/harness/subagent 名の「スキル」「skill」表記を正しい分類名（command / harness / subagent）に修正 |
| last_verified | 2026-06-22 |

### IR-052: 完了条件 grep パターン設計（REQ-0145-011）

| Field | Value |
|-------|-------|
| rule_id | IR-052 |
| description | 完了条件 grep パターン（機械的 checkbox 検出、`- [ ]` / `- [x]` カウント）は、否定文脈、anti-pattern 例示を「未達」として捕捉しないこと（REQ-0145-011）。本ルールは grep ベース検出を実装する際の設計基準であり、現在の QG-4 完了条件評価は推論ベース（case-close Step 4）であるため、grep 実装追加時に適用する |
| severity | observation |
| category | integrity-rule-gap |
| detection_method | 設計基準ルール（実装時の静的レビュー）。grep ベース checkbox 検出を実装する場合、除外条件、スコープ段階化をコードレビューで確認 |
| affected_artifacts | [case-close, case-auto, quality-gates] |
| related_req | [REQ-0145-011] |
| related_spec | [integrity-contracts.md, quality-gates.md] |
| gate_level | full-audit |
| false_positive_risk | 高。現在実装なし。grep 実装時に否定文脈除外、anti-pattern 例示除外を誤ると true negative を取りこぼす |
| regression_test | (grep 実装追加時) |
| baseline_status | new |
| finding_route | none |
| triage_action | grep ベース完了条件検出を実装する際、本ルールの設計基準（除外条件、スコープ段階化）を満たすこと |
| last_verified | 2026-06-22 |

#### IR-052 設計基準（REQ-0145-011）

grep ベースの完了条件 checkbox 検出（`- [ ]` / `- [x]`）を実装する場合、以下の除外条件、スコープ段階化を満たすこと:

| 除外条件 | 対象例 | 理由 |
|----------|--------|------|
| 否定文脈 | 「〜を含めない」「〜以外」「〜を禁止」 | 否定表現は未達ではなく要件の一部 |
| anti-pattern 例示 | 「次のように書かないこと: `- [ ] X`」 | 例示は未達ではなく説明 |
| コードブロック内 | ` ``` ` で囲まれた領域 | 例示、テンプレートは未達ではなく記述 |
| 引用、メタ文 | 「Issue 本文に `- [ ]` が含まれる」 | メタ記述は未達ではなく説明 |

スコープ段階化:
1. Issue 本文の完了条件セクション（`## 完了条件` 配下）のみを対象
2. 上記除外条件を適用後、残った `- [ ]` を未達として報告
3. `- [x]` は達成済みとして扱い、未達カウントから除外

現在の QG-4 完了条件評価は推論ベース（case-close Step 4、agent が各 checkbox の達成を意味判断）。
grep ベース実装は推論ベースを置き換えるのではなく、補助的機械検出として追加する場合に本基準を適用する。

### IR-053: gh 直接記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-053 |
| description | command/skill 定義中の gh CLI 直接呼出し（gh issue/pr create/edit/view/comment/merge/close/list/status 等）を検出すること（REQ-0152-001）。gh CLI 直接記述は agentdev-gh-cli 手続き委譲基盤（REQ-0149）経由を原則とし、command/skill 定義への直接埋め込みを禁止する。検出パターン・除外対象の詳細は inspect-skills 診断観点 gh-direct-invocation-leak（PR #1107）と整合する（REQ-0152-002） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 対象ファイル（src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md）から gh CLI 直接呼出しパターン（gh (issue|pr) (create|edit|view|comment|merge|close|list|status)）を正規表現で検出。除外対象（src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md、REQ-0149-003 許容ファイル）を適用後に報告する |
| affected_artifacts | [src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md] |
| related_req | [REQ-0152-001, REQ-0152-002, REQ-0149-003] |
| related_spec | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。agentdev-gh-cli 許容ファイル（standard-procedures.md）を除外対象に含めない場合 false positive が発生する。除外リストの厳密な適用で抑制する |
| regression_test | (追加予定)。gh 直接記述を含むテストデータ（fixture）で検出されること、standard-procedures.md で検出されないことを検証する |
| baseline_status | new |
| finding_route | intake |
| triage_action | 検出された gh 直接記述を agentdev-gh-cli 手続き委譲に置き換える。除外対象外の正当な gh 記述（standard-procedures.md 内）はそのまま |
| last_verified | (新規登録時) |

### IR-054: draft SPEC 放置検出

| Field | Value |
|-------|-------|
| rule_id | IR-054 |
| description | draft status の SPEC（`docs/specs/**/*.md`、frontmatter `status: draft`、ADR-0123 定義）が一定期間更新されず放置されることを検出すること（REQ-0154-002）。本ルールは draft SPEC の `updated` frontmatter と実行日の差分が閾値を超過した場合に報告する。status 値そのものの変更、accepted SPEC の陳腐化は対象外（REQ-0154 適用範囲外） |
| severity | heuristic |
| category | document-drift |
| detection_method | (1) `docs/specs/**/*.md` から frontmatter `status: draft` の SPEC を抽出（`accepted`、`status` なしは対象外）。(2) 各 draft SPEC の frontmatter `updated`（YYYY-MM-DD）を基準日として読み取る。(3) 実行日（today）と `updated` の差分日数を算出。(4) 差分日数が閾値（30日、後述「IR-054 閾値設計」参照）を超過した場合、draft 放置候補として報告 |
| affected_artifacts | [docs/specs/**/*.md（frontmatter `status: draft` のみ）] |
| related_req | [REQ-0154-002, REQ-0108-150, REQ-0108-151] |
| related_spec | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。`updated` frontmatter が実態と乖離している場合（更新忘れ）、放置でない SPEC が報告される。レポートは候補提示であり、SPEC owner による確認を前提とする。`updated` frontmatter 自体の正確性は別ルール（REQ-0108-002 必須 field、既存）で担保する |
| regression_test | (追加予定)。既知 true positive として `updated` を閾値以上過去日とした draft SPEC fixture が報告されること、accepted SPEC、status なし SPEC が報告されないことを検証する |
| baseline_status | new |
| finding_route | intake |
| triage_action | 報告された draft SPEC を (a) accepted へ昇格（case-close SPEC 確定チェック）、(b) 内容更新のうえ `updated` を最新化、(c) 廃止判断のいずれかへ分類する |
| last_verified | (新規登録時) |

#### IR-054 閾値設計（REQ-0154-002）

draft SPEC 放置検出の閾値、判定アルゴリズム、レポート形式を規定する。本節が SPEC 詳細の原本であり、docs-check 実装（`check_integrity.ts`）は本節に従う。

**閾値**:

| 項目 | 値 | 根拠 |
|------|------|------|
| 基準日 | frontmatter `updated`（YYYY-MM-DD） | SPEC ファイルが最後に編集された日。ADR-0123 で SPEC lifecycle のメタデータとして定義済み |
| 比較日 | docs-check 実行日（today） | 定期実行、PR 実行時の現在日 |
| 期間閾値 | 30日 | SPEC が draft から accepted へ昇格するまでの妥当な作業期間。RU-0001 先例（draft SPEC 放置問題）の再発防止を目的とし、放置と正常進行の境界を区別する |

閾値は本 SPEC で固定値（30日）とする。環境変数等での上書きは行わず、必要に応じて本 SPEC の改訂（REQ-0154-002 に基づく SPEC 更新）で変更する。

**判定アルゴリズム**:

```
for each file in glob('docs/specs/**/*.md'):
    frontmatter = parse_yaml_frontmatter(file)
    if frontmatter.status != 'draft':
        continue  # accepted または status なしは対象外
    if not frontmatter.updated:
        continue  # updated frontmatter なしは別ルール（IR-002 相当）対象
    age_days = today - parse_date(frontmatter.updated, '%Y-%m-%d')
    if age_days > 30:
        report(file, age_days, frontmatter.updated)
```

**レポート形式**:

draft 放置候補は docs-check の検出事項（finding）形式で報告する。

```
IR-054: draft SPEC 放置候補
  対象: docs/specs/commands/case-run.md
  status: draft
  最終更新日: 2026-06-21
  経過日数: 35日（閾値30日超過）
```

**対象外**:

| 対象外 | 理由 |
|--------|------|
| frontmatter `status: accepted` の SPEC | accepted SPEC は SPEC lifecycle の最終状態。陳腐化検出は別課題（本ルール対象外、REQ-0154-002 は draft のみ対象） |
| frontmatter `status` なしの SPEC | status 付与自体が別課題（REQ-0154-001 の SSoT 表で `-` 表示）。本ルールは status が存在し `draft` である SPEC のみ対象 |
| ADR-0123 で定義された status 値の変更 | REQ-0154 適用範囲外 |



| Level | Description | Trigger |
|-------|-------------|---------|
| full-audit | 全ルールを実行 | 定期実行、重大変更後 |
| delta-guard | 変更関連ルールのみ実行 | PR 作成時、通常開発時 |
| impact-guard | 影響範囲ルールのみ実行 | 特定アーティファクト変更時 |

## docs-check 項目役割範囲（REQ-0145-004）

docs-check（`/repo/docs-check`、`check_integrity.ts`）と skill 定義（SKILL.md、references/）の責務分担。
検出ルールは docs-check が機械的検出を担い、skill 定義は判定基準、運用手順の説明を担う。

### バックエンド対象 vs skill 定義対象

| 項目 | docs-check（バックエンド） | skill 定義（references/） |
|------|---------------------------|---------------------------|
| 検出パターン（正規表現、構造判定） | ✓ 実装 | ✗ 参照のみ |
| severity 分類（strict/heuristic/observation） | ✓ 実装 | ✗ 運用基準の説明のみ |
| exemption 条件の判定 | ✓ 実装 | ✗ 境界ケースの文書化のみ |
| baseline_status 管理 | ✓ 実行時更新 | ✗ 運用手順の説明のみ |
| 新規ルール追加判定フロー | ✗ | ✓ SKILL.md に定義（下記「新規カテゴリ追加判定フロー」参照） |
| catalog↔実装同期運用 | ✗ | ✓ integrity-contracts.md に定義 |

### 対象ファイル設計

| 対象 | 拡張子 | 備考 |
|------|--------|------|
| 検査対象 | `.md` のみ | Markdown 形式の永続文書（REQ/ADR/SPEC/guides/DOC-MAP/SKILL.md/command 定義） |
| 除外 | `retired/` 配下 | 履歴参照用、検出対象外 |
| 除外 | code block 内部 | 例示、パターン説明は検出対象外 |
| 正当使用例外 | vocabulary-registry.md / integrity-rule-catalog.md / gate-levels.md / remediation-routing.md | 検出ルール自体の記述、正規語彙の対照表 |

### NG ルール間依存関係マップ

主要な NG ルールの依存関係。
あるルールの修正が他ルールに影響する場合の参照用。

```
checkReferencePathIntegrity (REQ-0145-010)
├── depends on → SCRIPT_TEMPLATE_REF_PATTERNS（正規表現定義）
├── depends on → resolveReferencePath（パス解決・src fallback）
└── affects → checkObsoleteReferenceDirs（reference/ vs references/）

checkSourceProjectionConsistency
├── depends on → isInsideWorktree（worktree skip・REQ-0145-010）
├── depends on → listDirs（junction 対応付きディレクトリ一覧）
└── affects → checkBrokenJunctions（projection 側 junction 健全性）

checkReqSpecBoundaryViolation (IR-044)
├── depends on → IR044_SIGNAL_PATTERNS（SPEC 詳細キーワード）
├── depends on → META 規則行 exemption（行構造マッチ・REQ-0145-012）
└── affects → なし（独立ルール）。文脈 exemption は inspect-docs へ委譲（REQ-0108-259/262）

checkWorkflowStatusProhibition
├── depends on → sixPhasePattern（6-phase + stateWord）
├── depends on → isInsideCodeSpan（enum リテラル除外・REQ-0145-002）
└── affects → なし（独立ルール）
```

### 新規カテゴリ追加判定フロー（REQ-0145-005）

新規 NG ルール、検査カテゴリを追加する際の副作用評価フロー。
`repo-agentdev-integrity` SKILL.md が主体となり、以下を満たしてから追加する。

1. **既存 NG への副作用評価**: 新ルールが既存ルールの誤検知を増加させないか。特に exemption 条件、baseline_status、severity 分類の整合性を確認する
2. **catalog エントリ追加**: `integrity-rule-catalog.md` に 15 フィールド以上の IR エントリを `baseline_status: new` で追加する
3. **実装追加**: `check_integrity.ts` に検出関数を実装する。exemption 条件、false_positive_risk を実装に反映する
4. **テストデータ更新**: `check_integrity.test.ts` の有効なテストデータ（valid fixture）が新ルールで NG とならないことを確認する（drift detection smoke test）
5. **vocabulary-registry 同期**: 新ルールが語彙検出に関わる場合、`vocabulary-registry.md` を更新する
6. **categoryToCheckPattern map 更新**: `check_integrity.ts` の category-to-check-pattern map に新カテゴリを追加する（skill-category-gap 解消、REQ-0144-005）

追加可否判定: 上記 1-6 全て満たす場合のみ追加可。
副作用が確認できない場合は追加を見送り、別途 inspect-docs / inspect-skills で評価する。

### docs-check バックエンド適用範囲（REQ-0145-004）

`check_integrity.ts`（docs-check バックエンド）と inspect-* skills の項目役割範囲を以下の通り確定する。対象ファイル設計（`.md` のみ）、NG ルール間依存関係マップと合わせて明文化する。

| バックエンド | 適用範囲 | 根拠 |
|--------------|----------|------|
| `check_integrity.ts`（docs-check + IR ルール） | REQ/SPEC/reference 整合性の**決定論的**検出。frontmatter 許可フィールド、ID 一意性、リンク到達性、Step 形式、namespace legacy 残存、ADR status 正規化、draft SPEC 放置検出等、本カタログ（IR-001〜IR-054、IR-045 は docs-check 対象外として削除済み）が定義する検出 | 機械的検出層（[integrity-contracts.md](integrity-contracts.md)「3層検出構造の責務分担」、REQ-0108-056/254/261/262） |
| inspect-* skills（inspect-docs / inspect-skills） | 配布物整合性検査（REQ-0142-006/007）。構文健全性の重複検出、文意保持の意味解析、責務説明照合など意味判断を含む診断 | 意味的診断層。詳細は [docs-spec-rebuild-integrity.md](docs-spec-rebuild-integrity.md)「検査バックエンド責務分担」参照 |

**配布物整合性検査（REQ-0142-006/007）は `check_integrity.ts` に追加しない**。配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅し、意味的診断は inspect-* skills に集約する。これにより `categoryToCheckPattern` map への新カテゴリ追加（skill-category-gap、REQ-0108-161/171、REQ-0144-005）を不要とし、ターゲットング隠退化を防ぐ。

### check_integrity test suite 責務分担（REQ-0144-008/009）

check_integrity に関わる test suite 2系統の責務分担。

| test file | 責務 | 根拠 |
|-----------|------|------|
| scripts/tests/check_integrity.test.ts | fixture drift detection・Issue #657 regression 専用・copyScripts 環境下の drift 自動検出 | REQ-0144-009 |
| scripts/check_integrity.test.ts | IR-044 正規スイート・check_integrity.ts ルール適合検証 | REQ-0144-008 |

両ファイルの使い分け基準（regression 検出 vs ルール適合検証）を明文化し、後続エージェントが誤ったファイルを編集するリスクを排除する。

## メタ整合性

本カタログ自体の整合性を以下で担保する:
- 各ルールのフィールド数 ≥ 15
- 全ルールに related_req を持つ
- gate_level が 3 層のいずれか
- severity が strict/heuristic/observation のいずれか
