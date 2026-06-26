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

### IR-021: 廃止済み skill 参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-021 |
| description | agentdev-workflow-reporting 等の廃止済み skill への参照が残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | 正規表現で廃止 skill 名検出 |
| affected_artifacts | [commands, skills, SPEC] |
| related_req | [REQ-0108-126-128] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 廃止 skill 参照を削除 |
| last_verified | 2026-06-06 |

### IR-022: REQ 内部整合性

| Field | Value |
|-------|-------|
| rule_id | IR-022 |
| description | 同一 REQ 内で同一実体が一方で要求され他方で禁止されていないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | REQ 内の強制条件、禁止事項の抽出 → 矛盾検出 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-139, 149] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。意味判断が必要な場合あり |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | req-define |
| triage_action | REQ の矛盾を解消 |
| last_verified | 2026-06-06 |

### IR-023: Integrity artifact validator drift

| Field | Value |
|-------|-------|
| rule_id | IR-023 |
| description | Integrity scripts/tests/fixtures/SKILL.md/SPEC 間で drift がないこと |
| severity | heuristic |
| category | integrity-rule-gap |
| detection_method | script の検査カテゴリと SKILL.md/SPEC の定義照合 |
| affected_artifacts | [integrity scripts, SKILL.md, SPEC] |
| related_req | [REQ-0108-147] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, impact-guard |
| false_positive_risk | 中 |
| regression_test | prevention_gates.test.ts |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | drift を解消 |
| last_verified | 2026-06-06 |

### IR-024: Command README ↔ 実体

| Field | Value |
|-------|-------|
| rule_id | IR-024 |
| description | .opencode/commands/agentdev/README.md の一覧と実際のコマンドファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README からコマンド名抽出 → glob と照合 |
| affected_artifacts | [command README, commands] |
| related_req | [REQ-0101-026, REQ-0108-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | README にコマンド追加/削除 |
| last_verified | 2026-06-06 |

### IR-025: 廃止 ADR path 規則

| Field | Value |
|-------|-------|
| rule_id | IR-025 |
| description | 旧番号帯 ADR（ADR-0001〜0099）が `docs/adr/retired/` に配置されていること。`docs/adr/` 直下に旧番号帯 ADR が残存していないこと（REQ-0112-047, 048） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `docs/adr/ADR-0*.md`（ADR-0000〜ADR-0099）の存在確認 |
| affected_artifacts | [ADR] |
| related_req | [REQ-0112-047, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | なし。番号帯マッチングは確実 |
| regression_test | (追加予定) |
| baseline_status | known |
| finding_route | intake |
| triage_action | 旧番号帯 ADR を `docs/adr/retired/` に移動 |
| last_verified | 2026-06-08 |

### IR-026: ADR 誤分類兆候検出

| Field | Value |
|-------|-------|
| rule_id | IR-026 |
| description | 現行 ADR に技術判断不在、REQ/SPEC 相当内容の混入、ADR-0103 適合外、文書種別不一致の兆候がないこと（REQ-0112-043） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | ADR 本文の内容分析（技術判断の有無、REQ/SPEC 相当キーワード検出） |
| affected_artifacts | [current ADR] |
| related_req | [REQ-0112-043, REQ-0112-031, REQ-0112-032, REQ-0112-033] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。意味判断が必要なため observation として報告 |
| regression_test | (手動確認) |
| baseline_status | known |
| finding_route | req-define |
| triage_action | ADR 誤分類兆候を確認し、必要に応じて REQ/SPEC 移管を検討 |
| last_verified | 2026-06-08 |

### IR-027: 廃止 ADR 現行根拠引用検出

| Field | Value |
|-------|-------|
| rule_id | IR-027 |
| description | 現行 docs 内で 廃止 ADR（`docs/adr/retired/`）が現行根拠として引用されていないこと。履歴参照には廃止パス（`retired/`）と [retired] 注記を必須とする（REQ-0112-048） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の 廃止 ADR 参照検出、コンテキスト判定 |
| affected_artifacts | [REQ, SPEC, guides] |
| related_req | [REQ-0112-048, REQ-0112-050] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照の文脈判定に注意 |
| regression_test | (手動確認) |
| baseline_status | known |
| finding_route | intake |
| triage_action | 参照に [retired] 注記を追加、または現行 ADR へ更新 |
| last_verified | 2026-06-08 |

### IR-028: Command 最上位 Step 整数化

| Field | Value |
|-------|-------|
| rule_id | IR-028 |
| description | Command の最上位 Step 見出し、参照が整数のみであり、`Step N.M` 形式の小数 Step が残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode/commands/agentdev/*.md` を対象に `Step \d+\.\d+` を検出。projection 側または integrity rule 内の旧語検出用文字列は REQ-0119-021 により除外 |
| affected_artifacts | [commands, command projection, integrity rules] |
| related_req | [REQ-0119-005, REQ-0119-007, REQ-0119-021] |
| related_spec | [artifact-contracts.md, workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。旧語検出用の正規表現文字列と projection 側の残存確認文は除外が必要 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 小数 Step を整数 Step または N-M 形式のサブステップへ置換 |
| last_verified | 2026-06-12 |

### IR-029: Command 英字サブステップ禁止

| Field | Value |
|-------|-------|
| rule_id | IR-029 |
| description | Command の Step 見出し、参照に `10a` / `11c` などの英字サブステップが残存せず、必要なサブステップは `N-M` 形式で表記されていること |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode/commands/agentdev/*.md` を対象に Step 文脈の `[0-9][a-z]` を検出し、N-M 形式への統一を確認 |
| affected_artifacts | [commands, command projection, integrity rules] |
| related_req | [REQ-0119-006, REQ-0119-021] |
| related_spec | [artifact-contracts.md, workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。一般語、旧語検出用文字列、projection 側の確認文は除外が必要 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 英字サブステップを N-M 形式へ置換 |
| last_verified | 2026-06-12 |

### IR-030: Subagent verbatim 条件付き返却

| Field | Value |
|-------|-------|
| rule_id | IR-030 |
| description | Subagent 返却契約で、成果物本文のみ verbatim とし、判定結果、調査過程、中間ログ、読解メモへ一律 verbatim を要求していないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | Command/SPEC/skill references 内の `verbatim` 周辺文脈を確認し、成果物本文条件付き表現か、一律 verbatim 禁止の検出用文字列かを判定 |
| affected_artifacts | [commands, skills, SPEC, integrity rules] |
| related_req | [REQ-0119-013, REQ-0119-021] |
| related_spec | [workflow-contracts.md, artifact-contracts.md, artifact-responsibilities.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 高。検出用文字列、REQ本文、旧語説明、成果物本文の正当な verbatim 指示を文脈判定する必要がある |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake+learning |
| triage_action | 一律 verbatim 指示を、成果物本文のみ verbatim、その他は要約/根拠/capture候補へ圧縮する表現に更新 |
| last_verified | 2026-06-12 |

### IR-031: Findings / Capture候補 見出し統一

| Field | Value |
|-------|-------|
| rule_id | IR-031 |
| description | 現行 docs/source の Findings/Intake 系見出しが `Findings / Capture候補` に統一され、旧語は projection 側または integrity rule の検出目的に限って残存していること |
| severity | heuristic |
| category | obsolete-structure |
| detection_method | `Findings`, `Capture候補`, `Intake` 周辺の見出しを検出し、current/source の見出し統一と REQ-0119-021 の検出目的例外を判定 |
| affected_artifacts | [commands, command projection, SPEC, integrity rules] |
| related_req | [REQ-0119-014, REQ-0119-020, REQ-0119-021] |
| related_spec | [workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 高。通常語としての findings、旧語検出パターン、projection 側の比較対象を除外する必要がある |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 見出しを `Findings / Capture候補` に統一し、保存判断は親エージェントへ保持する |
| last_verified | 2026-06-12 |

### IR-032: delegation_type/on_result 必須 envelope 禁止

| Field | Value |
|-------|-------|
| rule_id | IR-032 |
| description | `delegation_type` / `on_result` がサブエージェント委譲の必須 envelope として扱われず、必要な場合のみ参考ラベルまたは親側の扱いとして記述されていること |
| severity | strict |
| category | canonical-conflict |
| detection_method | `delegation_type` / `on_result` 周辺文脈を検出し、必須 envelope 表現ではなく任意、参考分類の表現であることを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-017, REQ-0119-018] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。taxonomy 定義、任意ラベル説明、旧語検出用文字列は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 必須 envelope 表現を削除し、inputs / side_effect_boundary / output_contract / capture_handoff 中心の契約に更新 |
| last_verified | 2026-06-12 |

### IR-033: lightweight-delegation primary pattern 禁止

| Field | Value |
|-------|-------|
| rule_id | IR-033 |
| description | `lightweight-delegation` が primary pattern として扱われず、主要な実装分類に重ねる委譲の扱いとして記述されていること |
| severity | strict |
| category | canonical-conflict |
| detection_method | `lightweight-delegation` 周辺文脈を検出し、primary pattern 宣言、frontmatter pattern、実装分類としての扱いがないことを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-015, REQ-0119-016] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。`primary pattern ではない` という否定表現と検出用文字列は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | primary pattern としての記述を削除し、重ねる委譲、manager-orchestrator との差分として説明する |
| last_verified | 2026-06-12 |

### IR-034: Skill 内部 section / protocol / Step 参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-034 |
| description | command から skill 内部の protocol 名、Step 名、Section 名、見出し名への参照、自然言語ラベルから存在しないファイル名を推測させる参照、skill 側に command 固有 Step 番号を一次情報として保持する記述を検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | command 定義本文、SKILL.md 本文から skill 内部 section 名、protocol 名、Step 名への直接参照パターンを検出 |
| affected_artifacts | [commands, skills] |
| related_req | [REQ-0108-244] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。検出パターン例示、検査ルール自体の記述は対象外 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 参照先を正規の公開 API（SKILL.md description / USE FOR）に置き換える |
| last_verified | 2026-06-14 |

### IR-035: Skill See Also 検出観点

| Field | Value |
|-------|-------|
| rule_id | IR-035 |
| description | skill の `See Also` に実行判断材料（委譲先、責務境界、禁止条件、停止条件）が含まれている、`DO NOT USE FOR` と `See Also` の重複、skill が全コマンド一覧等の別 SSoT 管理対象を保持していることを検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | SKILL.md の `See Also` セクションから実行判断材料、DO NOT USE FOR 重複、別 SSoT 一覧を検出 |
| affected_artifacts | [skills] |
| related_req | [REQ-0108-245] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。補助導線として必要な参照は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 実行判断材料を SKILL.md 本文に移動、See Also を関連スキルへの導線のみに整理する |
| last_verified | 2026-06-14 |

### IR-036: ADR-work-means-detection

| Field | Value |
|-------|-------|
| rule_id | IR-036 |
| description | 承認済み ADR（frontmatter `status: accepted`）のタイトル、本文に作業手段（削除、廃止、移行、完全削除、統合、再構築）の混入を検出すること（REQ-0108-249）。作業手段を主題とする ADR は作成不可であるため、承認済み ADR にこれらが主題として含まれていないかを検査する。`deprecated`、`superseded` 等の非承認ステータス ADR は frontmatter `status` フラグにより機械的に除外する（REQ-0101-043/044 は承認済み ADR のみを対象とするため） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | (1) frontmatter `status` field 抽出 → `status: accepted` のみ検査対象とし、`deprecated`/`superseded`/`proposed` 等は機械的除外。(2) 承認済み ADR のタイトル、Decision セクションから作業手段キーワード（削除、廃止、移行、完全削除、統合、再構築）を検出し、主題か背景記述かを判定 |
| affected_artifacts | [accepted ADR（frontmatter `status: accepted` のみ。`deprecated`/`superseded` は status flag で除外）] |
| related_req | [REQ-0108-249, REQ-0101-043, REQ-0101-044, REQ-0101-045] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。Context（背景）セクションでの作業手段言及は許容されるため、Decision セクションの主題判定に注意。非承認ステータス ADR（例: ADR-0113 `status: deprecated`）は frontmatter `status` フラグで確実に除外されるため、当該 ADR の作業手段言及は検出対象外となる（履歴参照として扱う） |
| regression_test | (追加予定)。`status: deprecated` ADR が除外されること、`status: accepted` ADR の作業手段主題が検出されることを検証する |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 作業手段を主題とする ADR を retire/supersede または REQ/case へ移管 |
| last_verified | 2026-06-24 |

#### IR-036 適用範囲（deprecated ADR 除外判定）

IR-036 は REQ-0101-043/044（承認済み ADR の記述対象制約）の機械検査として機能する。
REQ-0101-043/044 は「承認済み ADR」を対象とするため、IR-036 の検査対象も frontmatter `status: accepted` の ADR に限定する。

**除外判定（機械的）**:

| frontmatter `status` 値 | IR-036 適用 | 根拠 |
|--------------------------|-------------|------|
| `accepted` | 適用（検査対象） | REQ-0101-043/044 の対象 |
| `deprecated` | 除外 | 当該 ADR の決定内容は現行基盤に反映されていない（履歴参照）。作業手段言及が残っていても現行判断ではないため検出不要 |
| `superseded` | 除外 | 後継 ADR に置き換え済み。旧 ADR の Decision は歴史記録 |
| `proposed` | 除外 | 未承認のため現行判断ではない |

**代表例**: ADR-0113（`status: deprecated`、diagnostics → inspect 改名により現行根拠として非適用）。Decision セクションに「完全削除」等の作業手段言及が残存するが、当該 ADR は非承認ステータスのため IR-036 の検査対象外となる。ADR-0113 ファイル自体の編集（`retired/` 移動、Decision セクション再分類）は ADR 整理フロー（別 RU）で扱い、本ルールの機械的除外判定とは独立させる。

### IR-037: retired-ADR-current-baseline-ref

| Field | Value |
|-------|-------|
| rule_id | IR-037 |
| description | 廃止 ADR（`docs/adr/retired/`）が現行基準（current baseline）として参照、案内されていないこと（REQ-0108-250）。Current Baseline View、後継ADRの Related Decisions、REQ/SPEC の現行根拠で 廃止 ADR が現行扱いされていないかを検査する |
| severity | strict |
| category | canonical-conflict |
| detection_method | 廃止 ADR 番号が現行基準文脈（Current Baseline View、現行根拠引用、後継指定なしの参照）に出現していないかを検出 |
| affected_artifacts | [ADR, ADR index, REQ, SPEC] |
| related_req | [REQ-0108-250, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照 `(retired)` 注記付きの言及は除外 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 ADR への現行参照を後継 ADR へ更新、または `(retired)` 注記を付与 |
| last_verified | 2026-06-16 |

### IR-038: ADR-index-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-038 |
| description | 承認済み ADR（`docs/adr/ADR-*.md`）と 廃止 ADR（`docs/adr/retired/ADR-*.md`）の index（`docs/adr/README.md`）整合性を検査すること（REQ-0108-251）。Current Baseline View に承認済み ADR が過不足なく記載され、Retired View に 廃止 ADR が過不足なく記載されていること |
| severity | strict |
| category | document-drift |
| detection_method | `docs/adr/README.md` の Current Baseline View / Retired View と実 ADR ファイル一覧の双方向差分を検出 |
| affected_artifacts | [ADR, ADR index] |
| related_req | [REQ-0108-251, REQ-0112-047, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。ファイル一覧と index の差分は確実 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | README.md の該当 View に ADR を追加/削除 |
| last_verified | 2026-06-16 |

### IR-039: index-req-title-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-039 |
| description | 索引文書（DOC-MAP、requirements/README、mapping-table）の REQ タイトルが各 REQ ファイル frontmatter title と一致すること |
| severity | strict |
| category | document-drift |
| detection_method | 各索引から REQ タイトル抽出 → 対応 REQ ファイル frontmatter title と文字列照合 |
| affected_artifacts | [DOC-MAP, REQ index, mapping-table, 現行 REQ] |
| related_req | [REQ-0108-003, REQ-0101-063, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。title 文字列の直接比較 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 索引の REQ タイトルを frontmatter title に一致させる |
| last_verified | 2026-06-17 |

### IR-040: retired-req-authority-comment

| Field | Value |
|-------|-------|
| rule_id | IR-040 |
| description | 現行 docs の HTMLコメント（出典標識: provenance marker 含む）が 廃止 REQ ID を単独参照しないこと。検出範囲は HTMLコメントのみに限定し、本文の意味解析は対象外（REQ-0101-063） |
| severity | strict |
| category | canonical-conflict |
| detection_method | `<!-- ... REQ-0NNN ... -->` 形式の HTMLコメントから 廃止 REQ ID を抽出し、後継 現行 REQ への併記がないか検出 |
| affected_artifacts | [REQ, SPEC, guides, ADR] |
| related_req | [REQ-0101-063, REQ-0108-070] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。HTMLコメント構文に限定した機械的検出 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 REQ の HTMLコメント参照を後継 現行 REQ へ置換 |
| last_verified | 2026-06-17 |

### IR-041: retired-req-broken-link

| Field | Value |
|-------|-------|
| rule_id | IR-041 |
| description | 廃止 REQ ファイルへのリンクが `retired/` パス接頭辞を使用すること |
| severity | strict |
| category | broken-reference |
| detection_method | Markdown リンク `[REQ-0NNN](../requirements/REQ-0NNN.md)` から 廃止 REQ への直接パス（retired/ なし）を検出 |
| affected_artifacts | [REQ, SPEC, guides, ADR] |
| related_req | [REQ-0108-070, REQ-0101-063] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。廃止 REQ ID 集合とリンク先パスの照合 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 REQ へのリンク先を `retired/` パスに修正 |
| last_verified | 2026-06-17 |

### IR-042: hardcoded-req-count

| Field | Value |
|-------|-------|
| rule_id | IR-042 |
| description | docs 内の REQ 件数、範囲の固定表記が実際の 現行 REQ ファイル数と一致すること |
| severity | heuristic |
| category | document-drift |
| detection_method | N件、範囲表記（REQ-0101〜0NNN 等）抽出 → glob による実際の 現行 REQ ファイル数と照合 |
| affected_artifacts | [SPEC, guides, AGENTS.md] |
| related_req | [REQ-0108-140, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。表記揺れ、retired 除外の判定に注意 |
| regression_test | (手動確認) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 固定表記を実際の REQ ファイル数、範囲に更新 |
| last_verified | 2026-06-17 |

### IR-043: retired-readme-coverage

| Field | Value |
|-------|-------|
| rule_id | IR-043 |
| description | retired/README.md が全 廃止 REQ のエントリを含むこと |
| severity | strict |
| category | document-drift |
| detection_method | 廃止 REQ ファイル一覧と retired/README.md のエントリを双方向差分で照合 |
| affected_artifacts | [廃止 REQ, retired README] |
| related_req | [REQ-0108-083, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。ファイル一覧とエントリの差分 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | retired/README.md に欠落する 廃止 REQ エントリを追加 |
| last_verified | 2026-06-17 |

### IR-044: REQ/SPEC 境界違反検出

| Field | Value |
|-------|-------|
| rule_id | IR-044 |
| description | 現行 REQ 要件行の主たる文意がスキーマフィールド、enum 値一覧、テストデータ詳細（fixture detail）、チェッカー個別ルール、誤検知（false positive）抑制方式、Step 番号直接参照、Phase 番号、内部アルゴリズム、具体的な作業履歴のいずれかである場合、当該 SPEC 詳細の混入を検出すること（REQ-0108-259, REQ-0108-260, REQ-0108-262, REQ-0101-067〜069, REQ-0136-031）。Step 番号直接参照は現行 REQ の記述制約（REQ-0136-031）に違反する SPEC 詳細混入の代表例であり、検出シグナル、exemption 条件の詳細は下位セクション「IR-044 Step 番号直接参照検出」に配置する。exemption は META 規則行（機械的行構造マッチ）のみとし、文脈解釈を要する免除は inspect-docs へ委譲する（REQ-0145-002, REQ-0145-012）。詳細は下位セクション「IR-044 exemption 条件」 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 REQ 要件行から SPEC 詳細キーワード（スキーマ、enum、テストデータ、チェッカー個別ルール、FP 抑制、Step 番号直接参照、Phase 番号、内部アルゴリズム、作業履歴）をパターンマッチで検出。Step 番号直接参照は `Step N`、`ステップ N`、`手順 N`（N は数字、範囲表現 `N-M` 含む）の正規表現パターンで検出する（実装: `check_integrity.ts` の `IR044_SIGNAL_PATTERNS` Step number エントリ）。検出後、META 規則行 exemption（REQ-NNNN-MMM 形式 + enum/format 等の列挙パターンを行構造で機械判定、REQ-0145-012）のみを適用する。文脈解釈を要する免除（否定文脈、委譲文脈、メタスコープルール文脈、振る舞い述語文脈、安定契約パターン）は実施せず inspect-docs へ委譲する（REQ-0108-259, REQ-0145-002） |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-259, REQ-0108-260, REQ-0108-262, REQ-0101-067, REQ-0101-068, REQ-0101-069, REQ-0145-002, REQ-0145-012, REQ-0136-031] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。文脈解釈を要する免除（否定文脈、委譲文脈、メタスコープルール文脈、振る舞い述語文脈、安定契約パターン）は docs-check では実施せず inspect-docs へ委譲したため（REQ-0108-259/262, REQ-0145-002）、純粋なパターンマッチの false positive は inspect-docs での意味的再評価で事後処理する。META 規則行 exemption は行構造の機械判定に限定し、件数・内容を規定する SPEC 詳細列挙行は免除しない（REQ-0145-012）。Step 番号直接参照パターンは数字を伴わない「Step 番号」「ステップ番号」語句を検出対象とせず、REQ-0136-031 自身（原則宣言の META 規則行）を誤検知しない。これは語句「番号」と数字リテラルの機械的区別により保証し、文脈免除には依存しない。既知の true positive が META exemption により誤って免除されないことを回帰テストで検証する |
| regression_test | `scripts/check_integrity.test.ts` の IR-044 正規スイート（REQ-9001〜REQ-9007）が真陽性保護と exemption 境界を検証する。Step 番号直接参照の true positive として REQ-9005（`Step 3`）を含み、手順 N パターン、REQ-0136-031 META 規則行の誤検知非検出を追加固定する（REQ-0108-259, REQ-0108-055 準拠） |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 該当要件行の詳細を SPEC、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに移管し、REQ 側は外部契約、状態要件の要約に置き換える。Step 番号直接参照の triage は機能名・フェーズ名参照への置換とする（REQ-0136-031）。文脈免除の境界判定は inspect-docs が担う |
| last_verified | 2026-06-26 |

#### IR-044 exemption 条件

IR-044 の exemption は META 規則行（機械的行構造マッチ）のみに限定する（REQ-0108-259, REQ-0145-002, REQ-0145-012）。文脈解釈を要する免除（isNegationContext / isDelegationContext / isMetaScopeRuleContext / isBehaviorPredicateContext / IR044_STABLE_CONTRACT_PATTERN）は docs-check から廃止し inspect-docs へ委譲した（REQ-0108-262）。

**META 規則行 exemption（機械判定のみ）**:

REQ/SPEC 責務範囲を規定する META 規則行（enum/format/schema 等 SPEC 対象種別を名指しして責務境界を宣言する行）を機械的に判定し免除する。判定は行構造のパターンマッチ（REQ-NNNN-MMM 形式 + enum/format 等の列挙パターン）に限定し、意味判断は含めない。

| 対象 | 判定 | 根拠 |
|------|------|------|
| REQ-NNNN-MMM 形式 + SPEC 種別列挙（enum/format/schema 等）を名指しする責務範囲規定行 | 免除（META 規則行） | REQ-0145-012。当該行は SPEC 詳細の記述ではなく責務範囲の規定 |
| SPEC 詳細そのものを列挙する行（enum 値 A/B/C の一覧、テストデータ（fixture）の具体件数と内容の羅列） | 免除しない（true positive 候補） | 件数・内容を規定する行は責務範囲規定ではない |

**inspect-docs へ委譲した文脈免除（docs-check 対象外）**:

| 文脈 | 委譲先 | 根拠 |
|------|--------|------|
| isNegationContext（否定文脈: 「〜しない」「〜以外」等） | inspect-docs | 文脈解釈を要する（REQ-0108-259, REQ-0145-002） |
| isDelegationContext（委譲文脈: 「委譲先」「切り出し先」等） | inspect-docs | 文脈解釈を要する |
| isMetaScopeRuleContext（メタスコープルール文脈の意味判断範囲） | inspect-docs | 意味判断を要する範囲は META 規則行の機械判定を超える |
| isBehaviorPredicateContext（振る舞い述語文脈） | inspect-docs | 存在・状態述語の意味判断を要する |
| IR044_STABLE_CONTRACT_PATTERN（安定契約例外 REQ-0101-069） | inspect-docs | 安定契約判定は意味判断を要する |

**true positive 保護（回帰テスト）**:

回帰テストで既知の true positive（SPEC 詳細が REQ に残留している実例）が META 規則行 exemption により誤って免除されないことを検証する（REQ-0108-259, REQ-0108-055 準拠）。保護対象の真陽性は件数・内容を規定する SPEC 詳細の残留であり、META 規則行（責務範囲規定）には該当しないことをテストで固定する。

**是正済み経緯（保護対象から除外）**: REQ-0114-082、REQ-0144-008 は #1109 PR で SPEC 詳細が REQ から SPEC へ移行済みであり、真陽性保護対象から除外する（REQ-0144-017）。当該 REQ は SPEC 詳細を残留させないため META 規則行 exemption の誤免除検証の根拠とならない。保護対象の真陽性は、件数・内容を規定する SPEC 詳細の残留実例に限定する。この明記により RU-0011（検出ロジック改良）実施前に同箇所を根拠としたテスト設計の前提崩壊を防ぐ。REQ-0102-070、REQ-0151-007 は AG-002（OU-002 と source_ru 同じ RU-0003 だが別 AG/ACT）で Step 番号直接参照から機能名・フェーズ名参照へ是正済みであり、真陽性保護対象から除外する。当該 REQ は Step 番号直接参照を残留させないため、Step 番号検出の回帰テスト根拠とならない（AG-003、REQ-0136-031 の case-open 由来）。

#### IR-044 Step 番号直接参照検出

REQ-0136-031 が宣言する「現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照する」原則に基づく検出セクション（REQ-0136-031 の検出委譲先 SPEC 配置）。本セクションは Step 番号直接参照パターンの機械検出仕様を規定し、exemption 境界を明示する。

**検出パターン（機械判定）**:

Step 番号直接参照は次の正規表現パターンで検出する（実装: `check_integrity.ts` の `IR044_SIGNAL_PATTERNS` Step number エントリ）。

| パターン | 正規表現 | 検出例 |
|---------|---------|--------|
| `Step N`（英語、範囲含む） | `\bStep\s*\d+(?:\s*[-–]\s*\d+)?\b` | `Step 3`、`Step 4-6`、`Step  2` |
| `ステップ N`（カタカナ、範囲含む） | `ステップ\s*\d+(?:\s*[-–]\s*\d+)?` | `ステップ 3`、`ステップ3` |
| `手順 N`（漢字、範囲含む） | `手順\s*\d+(?:\s*[-–]\s*\d+)?` | `手順 4`、`手順4-5` |

N は数字（`\d+`）。範囲表現（`N-M`、`N–M`）を含む。検出対象は現行 REQ 要件行（`| REQ-NNNN-NNN | description |` 形式のテーブル行）のみ。

**非検出語句（false positive 抑制）**:

次の語句は数字リテラルを伴わない「番号」語であり、検出対象外とする。これにより原則宣言の META 規則行（REQ-0136-031 自身を含む）が語句「Step 番号」を含んでも true positive として誤検知されない。本境界は語句と数字リテラルの機械的区別により保証し、文脈免除に依存しない。

| 語句 | 取扱い | 根拠 |
|------|--------|------|
| `Step 番号`、`ステップ番号`、`手順番号` | 非検出 | 「番号」は数字リテラルではなく一般名詞。原則宣言、責務規定の META 規則行で使用される |
| `Step番号`（空白なし） | 非検出 | 同上 |

**exemption 条件（Step 番号直接参照固有）**:

Step 番号直接参照パターンは他の SPEC 詳細キーワードと同じく META 規則行 exemption のみを適用する。Step 番号直接参照に固有の文脈免除は設けない。SPEC ファイル、コマンドリファレンス、テスト戦略セクションにおける Step 番号参照は対象外（`affected_artifacts: [現行 REQ]`）であり、exemption ではなく検出スコープ外として扱う。文脈解釈を要する免除は inspect-docs へ委譲する（REQ-0145-002, REQ-0145-012）。

**severity / 分類**:

Step 番号直接参照は REQ レベルの記述制約違反（REQ-0136-031）であり、IR-044 全体と同じく severity: `heuristic`、category: `canonical-conflict` に分類する。REQ 要件行が SPEC 詳細（Step 番号）へ依存すると SPEC↔command の Step 構成変更が REQ 側へ波及し、REQ と SPEC の責務分離（REQ-0136 体系）を損なう。

**回帰テスト**:

`scripts/check_integrity.test.ts` の IR-044 正規スイートが次を検証する。

- `Step 3` 形式の true positive 検出（REQ-9005）
- `手順 N` 形式の true positive 検出（REQ-9008）
- REQ-0136-031 META 規則行（`Step 番号` 語句のみ、数字なし）の false positive 非検出（REQ-9009）

### IR-045: （削除）docs 日本語表現、文意整合検査

> **削除済み（REQ-0108-255/256, REQ-0108-262）**: IR-045 の検査は docs-check の機械検出対象から除外し、agentdev-doc-writing スキル配下へ移譲した。docs-check は意味判断を要する文意整合検査を保持しない（機械化原則 REQ-0108-056/254/261/262）。catalog↔実装双方向同期運用手順（REQ-0145-003）に従い baseline_status: resolved の上で本エントリを削除した。IR-045 識別子は REQ-0108-255/256、`vocabulary-registry.md`「文意品質検出対象語（IR-045）」で文意品質検出対象語の参照として残る。新規検出時の復活運用（REQ-0145-003）に従い、必要に応じて docs-check 検出対象への復活を検討する。

### IR-046: consumer-generated リポジトリ種別誤検知防止

| Field | Value |
|-------|-------|
| rule_id | IR-046 |
| description | `.opencode/commands/agentdev/` が実ディレクトリ（非ジャンクション）かつ `generated_by: local-opencode-transform` 識別子を含む場合、当該リポジトリを consumer-generated として扱い、IR-016（Source/projection 整合性）の source/projection divergence 対象から除外すること（REQ-0141-007, 011）。ローカル版生成物はジャンクションではなく実ファイル配置であるため、IR-016 の「ジャンクション破損」判定が誤検知となるのを防ぐ |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | `.opencode/commands/agentdev/` がジャンクション、シンボリックリンクでないことを確認後、配下のファイルから `generated_by: local-opencode-transform` 識別子を検出。識別子検出時は consumer-generated と判定し IR-016 を適用除外とする |
| affected_artifacts | [.opencode/commands/agentdev/, .opencode/skills/agentdev-*/] |
| related_req | [REQ-0141-007, REQ-0141-011, REQ-0141-014] |
| related_spec | [runtime-package-boundary.md, local-generation.md] |
| gate_level | full-audit |
| false_positive_risk | 低。ジャンクション検出と `generated_by` 識別子検出の組合せで確実に判定可能 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | IR-016 を consumer-generated リポジトリでは適用除外とする。識別子不在の場合は IR-016 を通常適用する |
| last_verified | 2026-06-20 |

### IR-047: src/opencode-local/ link 先原本領域ディレクトリ構成

| Field | Value |
|-------|-------|
| rule_id | IR-047 |
| description | `src/opencode-local/` はローカル版 link 先原本領域であり、許容されたディレクトリ構成（`README.md`, `agentdev-gh-cli/`）のみを保持すること（REQ-0141-004, ADR-0131 decision #3）。`agentdev-gh-cli/` 配下に `SKILL.md`, `references/`, `case-schema/` を保持する（`case-schema/` は `agentdev-gh-cli/` 配下のディレクトリとして扱う）。禁止パス（`requirements/`, `specs/`, `_conv/`, `commands/`, `skills/`, `transform/`, `generation-flow.md`）を作成しないこと（REQ-0141-005, ADR-0131 decision #4） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode-local/` 配下のディレクトリ、ファイル一覧を取得し、許容リスト（`README.md`, `agentdev-gh-cli/`）外のトップレベルパスを検出。`agentdev-gh-cli/case-schema/` は `agentdev-gh-cli/` 配下の許容ディレクトリとして扱う |
| affected_artifacts | [src/opencode-local/] |
| related_req | [REQ-0141-003, REQ-0141-004, REQ-0141-005, REQ-0134] |
| related_spec | [local-generation.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | なし。パスの直接比較による機械的検出 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 許容リスト外のディレクトリ、ファイルを削除し、`src/opencode-local/` を link mode の原本構成（`README.md`, `agentdev-gh-cli/`）へ復元。導入先リポジトリは unlink / relink により link を張り直す（ADR-0131 decision #1） |
| last_verified | 2026-06-24 |

### IR-048: generated_by 識別子整合性

| Field | Value |
|-------|-------|
| rule_id | IR-048 |
| description | ローカル版生成物に `generated_by: local-opencode-transform` 識別情報が付与されていること（REQ-0141-011）。同名ファイル上書きは識別子が一致する場合のみ許可され、識別子不在、異なる識別子のファイルを上書きしてはならないこと（REQ-0141-012, 013） |
| severity | strict |
| category | canonical-conflict |
| detection_method | `.opencode/commands/agentdev/**/*.md` と `.opencode/skills/agentdev-*/**/*.md` から frontmatter またはメタ識別子中の `generated_by` を抽出し、`local-opencode-transform` と一致することを確認。同名ファイル上書き時の識別子整合性はローカル版生成プロセスが `## 変換仕様` ガードレールで検証 |
| affected_artifacts | [.opencode/commands/agentdev/, .opencode/skills/agentdev-*/] |
| related_req | [REQ-0141-011, REQ-0141-012, REQ-0141-013] |
| related_spec | [local-generation.md, local-transform.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。生成物への識別子付与方式（frontmatter vs ヘッダコメント）の揺れ、AgentDevFlow 本体原本（識別子なし）との混同に注意 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 識別子付与方式を `local-generation.md` の定義に統一。競合ファイルは手動マージまたは識別子付与後に再生成 |
| last_verified | 2026-06-20 |

### IR-049: Command file format violation

| Field | Value |
|-------|-------|
| rule_id | IR-049 |
| description | command 定義ファイル（`src/opencode/commands/agentdev/*.md`、`.opencode/commands/repo/*.md`）が `docs/specs/command-file-format.md` のフォーマット規約に適合すること（REQ-0143）。検出項目: Step 0 使用、非連番 Step 番号、ゼロ起点サブステップ（Step N-0）、numbered list 主手順、G01 形式以外のガードレール番号 |
| severity | strict |
| category | document-drift |
| detection_method | `check_command_format.ts` により command 定義ファイルを走査。`## 手順` 配下の Step 見出し、参照、numbered list、ガードレール番号を正規表現で検出し、command-file-format.md の規約と照合 |
| affected_artifacts | [commands] |
| related_req | [REQ-0143, REQ-0108] |
| related_spec | [command-file-format.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。正規表現による機械的検出。`## 手順` 配下判定、ガードレール行（`- G\d+:`）の形式照合により誤検知リスクを最小化 |
| regression_test | check_command_format.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 対象 command ファイルのフォーマット違反を修正（Step 0 → Step 1、numbered list → ### Step N 見出し、ゼロ起点サブステップ → Step N-1、非 G01 ガードレール番号 → G01 形式） |
| last_verified | 2026-06-22 |

### IR-050: load_skills command 誤指定検出

| Field | Value |
|-------|-------|
| rule_id | IR-050 |
| description | `load_skills=["..."]` 形式で command 名（`/` 先頭識別子、`/agentdev/*` 等の公開 command 名、`/ulw-loop` 等の外部 command 名、`agentdev-` プレフィックスを持たない command 識別子）が指定されていることを検出すること（REQ-0108-261）。command 名は `load_skills` の対象ではなく委譲 prompt 内で `/ulw-loop` 等の command 指定として扱うべきものであるため、`load_skills` への指定は文書種別責務境界違反である |
| severity | strict |
| category | canonical-conflict |
| detection_method | `load_skills\s*=\s*\["([^"]+)"\]` パターンから各要素を抽出し、各要素が `/` 先頭形式（command 名）であるか、`agentdev-*` プレフィックスを持たない既知 command 名（語彙レジストリ `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` 参照）であるかを照合。コードブロック内の例示、検出用文字列、IR ルール本文中のパターン説明は除外対象 |
| affected_artifacts | [commands, skills, SPEC] |
| related_req | [REQ-0108-261, REQ-0140-027, REQ-0125-010] |
| related_spec | [integrity-contracts.md, document-type-responsibilities.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。`/` 先頭形式は確実な command 名指示。`agentdev-*` プレフィックスを持たない識別子は語彙レジストリとの照合で判定。コードブロック例示、IR パターン説明は除外が必要 |
| regression_test | (追加予定)。既知 true positive として OU-001 修正前の `load_skills=["ulw-loop"]` を回帰テストで検証 |
| baseline_status | new |
| finding_route | intake |
| triage_action | `load_skills=["..."]` の command 名を skill 名（`agentdev-*`）に修正、または委譲 prompt 内で command を指定する形式（`prompt="/ulw-loop Implement Issue #N: ..."`）に変更 |
| last_verified | 2026-06-22 |

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
