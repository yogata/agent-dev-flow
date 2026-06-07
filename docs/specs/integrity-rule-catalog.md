# Integrity Rule Catalog

Integrity 検査の全 rule を定義する catalog（REQ-0108-150, 151）。各 rule は 15 以上の field を持つ。

> **Repo-local context**: integrity 検査は `/repo/integrity-check` コマンドと `repo-agentdev-integrity` skill により実行される repo-local 自己監査である（ADR-0106）。AgentDevFlow の consumer 配布対象外。語彙レジストリは `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` に配置する。

## Schema

| Field | 型 | 説明 |
|-------|------|------|
| rule_id | string | 一意識別子 (例: IR-001) |
| description | string | Rule の説明 |
| severity | enum | strict / heuristic / observation |
| category | enum | document-drift / broken-reference / obsolete-structure / canonical-conflict / workflow-gap / integrity-rule-gap |
| detection_method | string | 検出方法（正規表現・構造解析・存在確認等） |
| affected_artifacts | list[str] | 対象 artifact 種別 |
| related_req | list[str] | 関連 REQ ID |
| related_spec | list[str] | 関連 SPEC ファイル |
| gate_level | enum | full-audit / delta-guard / impact-guard |
| false_positive_risk | string | 誤検知リスクと対策 |
| regression_test | string | 回帰テストの有無・ID |
| baseline_status | enum | known / new / resolved |
| finding_route | enum | intake / intake+learning / req-define / learning / none |
| triage_action | string | 新規検出時の対応アクション |
| last_verified | date | 最終検証日 |

## Rules

### IR-001: Active REQ frontmatter id ↔ filename

| Field | Value |
|-------|-------|
| rule_id | IR-001 |
| description | Active REQ の frontmatter id とファイル名（REQ-NNNN.md）が一致すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter id 抽出 → filename と照合 |
| affected_artifacts | [active REQ] |
| related_req | [REQ-0108-001, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。id/filename の不一致は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | frontmatter id または filename を修正 |
| last_verified | 2026-06-06 |

### IR-002: Active REQ 必須 frontmatter fields

| Field | Value |
|-------|-------|
| rule_id | IR-002 |
| description | Active REQ に id, title, created, updated, tags が存在すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter field 存在確認 |
| affected_artifacts | [active REQ] |
| related_req | [REQ-0108-001] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。必須 field 欠落は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 欠落 field を追加 |
| last_verified | 2026-06-06 |

### IR-003: Active/retired REQ ID 重複

| Field | Value |
|-------|-------|
| rule_id | IR-003 |
| description | active REQ と retired REQ の間で ID 重複がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | ID set の intersection 確認 |
| affected_artifacts | [active REQ, retired REQ] |
| related_req | [REQ-0108-082] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | なし |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 重複 ID を解消 |
| last_verified | 2026-06-06 |

### IR-004: REQ index ↔ active REQ 一致

| Field | Value |
|-------|-------|
| rule_id | IR-004 |
| description | docs/requirements/README.md の active REQ 一覧と実際の REQ ファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README から REQ ID 抽出 → glob 結果と照合 |
| affected_artifacts | [REQ index, active REQ] |
| related_req | [REQ-0108-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | README に REQ 追加/削除 |
| last_verified | 2026-06-06 |

### IR-005: ADR ↔ REQ 相互参照存在

| Field | Value |
|-------|-------|
| rule_id | IR-005 |
| description | ADR の Related REQ セクションの REQ ID と、REQ の ADR index からの参照が双方向に存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | ADR から REQ ID 抽出 → 存在確認、逆方向も確認 |
| affected_artifacts | [ADR, REQ, ADR index] |
| related_req | [REQ-0108-005] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。retired REQ 参照は別 rule で判定 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照を追加/修正 |
| last_verified | 2026-06-06 |

### IR-006: Command frontmatter 許可フィールド

| Field | Value |
|-------|-------|
| rule_id | IR-006 |
| description | Command frontmatter に description と agent のみが存在すること。implementation_pattern, secondary_pattern, load_skills, pattern, workflow_route, branch_type, labels は禁止 |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter field 列挙 → 許可リストと照合 |
| affected_artifacts | [commands] |
| related_req | [REQ-0103-015, REQ-0108-046, 095-099, 108, 124, 129] |
| related_spec | [integrity-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | command_fixtures.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 禁止 field を frontmatter から削除 |
| last_verified | 2026-06-06 |

### IR-007: Skill frontmatter name ↔ dir

| Field | Value |
|-------|-------|
| rule_id | IR-007 |
| description | .opencode/skills/{dir}/SKILL.md の frontmatter name が {dir} と一致すること |
| severity | strict |
| category | document-drift |
| detection_method | directory 名と frontmatter name の比較 |
| affected_artifacts | [skills] |
| related_req | [REQ-0108-092] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | lint_skills.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | frontmatter name または directory 名を修正 |
| last_verified | 2026-06-06 |

### IR-008: Skill references/ 存在

| Field | Value |
|-------|-------|
| rule_id | IR-008 |
| description | SKILL.md が参照する references/ ファイルが存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | SKILL.md 内のパス抽出 → 存在確認 |
| affected_artifacts | [skills, skill references] |
| related_req | [REQ-0108-110, 115-120] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。裸参照の解決ルールに注意 |
| regression_test | check_reference_paths.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照先を作成または参照を修正 |
| last_verified | 2026-06-06 |

### IR-009: 旧 namespace 残存

| Field | Value |
|-------|-------|
| rule_id | IR-009 |
| description | 旧コマンド名、旧パス、二重 prefix、bare slash command form が docs/specs/guides に残存しないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | 正規表現パターンマッチ |
| affected_artifacts | [REQ, SPEC, guides, skills, commands] |
| related_req | [REQ-0108-016] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。検出対象外パスの設定に注意 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 旧 namespace を更新 |
| last_verified | 2026-06-06 |

### IR-010: ADR status 正規化

| Field | Value |
|-------|-------|
| rule_id | IR-010 |
| description | ADR status が正規形式であること。旧形式 superseded-by:[ADR-XXXX] を検出 |
| severity | strict |
| category | obsolete-structure |
| detection_method | frontmatter status field 検査 |
| affected_artifacts | [ADR] |
| related_req | [REQ-0108-121] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | ADR status を正規形式に更新 |
| last_verified | 2026-06-06 |

### IR-011: Mapping table 全件記録

| Field | Value |
|-------|-------|
| rule_id | IR-011 |
| description | 全 retired REQ が mapping-table.md に記録されていること |
| severity | strict |
| category | document-drift |
| detection_method | retired REQ ファイル一覧と mapping-table の照合 |
| affected_artifacts | [retired REQ, mapping-table] |
| related_req | [REQ-0108-083-088] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | mapping-table にエントリ追加 |
| last_verified | 2026-06-06 |

### IR-012: Template 必須セクション

| Field | Value |
|-------|-------|
| rule_id | IR-012 |
| description | Template ファイルに frontmatter と必須セクション（<!-- 【必須】 -->）が存在すること |
| severity | strict |
| category | document-drift |
| detection_method | template ファイルの構造検証 |
| affected_artifacts | [templates] |
| related_req | [REQ-0108 (workflow template 構造)] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | check_templates.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 必須セクションを追加 |
| last_verified | 2026-06-06 |

### IR-013: 完了報告 variant 実在

| Field | Value |
|-------|-------|
| rule_id | IR-013 |
| description | Command 定義が参照する variant path が templates/ に実在すること |
| severity | strict |
| category | broken-reference |
| detection_method | command 本文から variant path 抽出 → 存在確認 |
| affected_artifacts | [commands, templates] |
| related_req | [REQ-0108-089-091] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | variant を作成または参照を修正 |
| last_verified | 2026-06-06 |

### IR-014: reference/ 残存検出

| Field | Value |
|-------|-------|
| rule_id | IR-014 |
| description | .opencode/skills/**/reference/ (単数形) ディレクトリが残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | glob で reference/ ディレクトリ検索 |
| affected_artifacts | [skills] |
| related_req | [REQ-0103-013, 039, REQ-0108-039, 040, 094] |
| related_spec | [artifact-responsibilities.md] |
| gate_level | full-audit |
| false_positive_risk | なし |
| regression_test | lint_skills.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | reference/ を references/ にリネーム |
| last_verified | 2026-06-06 |

### IR-015: Retired REQ 現行参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-015 |
| description | Retired REQ が現行要件判断の第一参照として案内されていないこと |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の retired REQ 参照検出・コンテキスト判定 |
| affected_artifacts | [REQ, SPEC, guides] |
| related_req | [REQ-0108-070-074, 136] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。mapping-table 等の履歴参照は除外 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照に [retired] 注記を追加 |
| last_verified | 2026-06-06 |

### IR-016: Source/projection 整合性

| Field | Value |
|-------|-------|
| rule_id | IR-016 |
| description | src/opencode/ と .opencode/ (projection) の間に divergence がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | sync-opencode.ps1 -Mode check 相当の比較 |
| affected_artifacts | [commands, skills, templates] |
| related_req | [REQ-0103-048-052, REQ-0108-143-144] |
| related_spec | [system.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。junction 壊れは確実な NG |
| regression_test | (sync script で検証) |
| baseline_status | known |
| finding_route | intake |
| triage_action | sync-opencode.ps1 -Mode apply を実行 |
| last_verified | 2026-06-06 |

### IR-017: DOC-MAP ↔ 実体整合性

| Field | Value |
|-------|-------|
| rule_id | IR-017 |
| description | DOC-MAP が参照するファイルが存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | DOC-MAP 内のリンク抽出 → 存在確認 |
| affected_artifacts | [DOC-MAP] |
| related_req | [REQ-0108-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | DOC-MAP エントリを更新 |
| last_verified | 2026-06-06 |

### IR-018: REQ 範囲表記鮮度

| Field | Value |
|-------|-------|
| rule_id | IR-018 |
| description | AGENTS.md、SPEC、guides の REQ 範囲表記が実際の active REQ 数と一致すること |
| severity | heuristic |
| category | document-drift |
| detection_method | N件・through 等の表記と glob 結果の照合 |
| affected_artifacts | [AGENTS.md, SPEC, guides] |
| related_req | [REQ-0108-140] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。表記揺れの判定に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 表記を実際の REQ 数に更新 |
| last_verified | 2026-06-06 |

### IR-019: Guide MUST/SHALL 検出

| Field | Value |
|-------|-------|
| rule_id | IR-019 |
| description | Guide ファイル内に MUST/SHALL 表現が含まれていないこと（非規範性宣言のメタ文を除く） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 正規表現で MUST/SHALL パターン検出 |
| affected_artifacts | [guides] |
| related_req | [REQ-0108-138] |
| related_spec | [document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。引用・メタ文の除外に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | guide から MUST/SHALL を削除、SPEC へ誘導 |
| last_verified | 2026-06-06 |

### IR-020: Baseline-known vs new finding 区別

| Field | Value |
|-------|-------|
| rule_id | IR-020 |
| description | Baseline (.agentdev/integrity/baseline.json) に記録された known finding と新規 finding が区別されていること |
| severity | heuristic |
| category | integrity-rule-gap |
| detection_method | baseline.json の known_findings と現行 finding の比較 |
| affected_artifacts | [baseline, integrity reports] |
| related_req | [REQ-0108-145, 148] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, impact-guard |
| false_positive_risk | 中。baseline の陳腐化判定に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | none |
| triage_action | baseline を更新 |
| last_verified | 2026-06-06 |

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
| detection_method | REQ 内の SHALL/MUST/SHALL NOT 抽出 → 矛盾検出 |
| affected_artifacts | [active REQ] |
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

### IR-025: Retired ADR path 規則

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
| description | current ADR に技術判断不在・REQ/SPEC 相当内容の混入・ADR-0103 適合外・文書種別不一致の兆候がないこと（REQ-0112-043） |
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

### IR-027: Retired ADR 現行根拠引用検出

| Field | Value |
|-------|-------|
| rule_id | IR-027 |
| description | 現行 docs 内で retired ADR（`docs/adr/retired/`）が現行根拠として引用されていないこと。履歴参照には retired path と [retired] 注記を必須とする（REQ-0112-048） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の retired ADR 参照検出・コンテキスト判定 |
| affected_artifacts | [REQ, SPEC, guides] |
| related_req | [REQ-0112-048, REQ-0112-050] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照の文脈判定に注意 |
| regression_test | (手動確認) |
| baseline_status | known |
| finding_route | intake |
| triage_action | 参照に [retired] 注記を追加、または current ADR へ更新 |
| last_verified | 2026-06-08 |

## Gate Levels

| Level | Description | Trigger |
|-------|-------------|---------|
| full-audit | 全 rule を実行 | 定期実行、重大変更後 |
| delta-guard | 変更関連 rule のみ実行 | PR 作成時、通常開発時 |
| impact-guard | 影響範囲 rule のみ実行 | 特定 artifact 変更時 |

## Meta-Integrity

本 catalog 自体の整合性を以下で担保する:
- 各 rule の field 数 ≥ 15
- 全 rule に related_req を持つ
- gate_level が 3 層のいずれか
- severity が strict/heuristic/observation のいずれか
