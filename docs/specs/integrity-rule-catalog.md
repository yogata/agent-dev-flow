# Integrity Rule Catalog

Integrity 検査の全 rule を定義する catalog（REQ-0108-150, 151）。各 rule は 15 以上の field を持つ。

> **Repo-local context**: integrity 検査は `/repo/docs-check` コマンドと `repo-agentdev-integrity` skill により実行される repo-local 自己監査である（ADR-0106）。AgentDevFlow の consumer 配布対象外。語彙レジストリは `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` に配置する。

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
| description | Active REQ に id, title, created, updated が存在すること |
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

### IR-019: Guide 要件定義・契約記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-019 |
| description | Guide ファイルが要件本文または契約本文を保持していないこと（REQ-0116-017）。語彙ベースの検出ではなく、guide が REQ/ADR/SPEC の責務を侵害する内容を保持していないかを検査する |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | Guide 内の要件定義表・契約記述・REQ 相当の振る舞い定義の検出。語彙ベースの判定ではなく構造的判定を主とし、強制条件表現は補助シグナル |
| affected_artifacts | [guides] |
| related_req | [REQ-0108-138, REQ-0116-017] |
| related_spec | [document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。引用・メタ文の除外に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | guide から要件本文・契約本文を削除し、REQ/ADR/SPEC への参照に置き換える |
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
| detection_method | REQ 内の強制条件・禁止事項の抽出 → 矛盾検出 |
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

### IR-028: Command トップレベル Step 整数化

| Field | Value |
|-------|-------|
| rule_id | IR-028 |
| description | Command のトップレベル Step 見出し・参照が整数のみであり、`Step N.M` 形式の小数 Step が残存していないこと |
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
| description | Command の Step 見出し・参照に `10a` / `11c` などの英字サブステップが残存せず、必要なサブステップは `N-M` 形式で表記されていること |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode/commands/agentdev/*.md` を対象に Step 文脈の `[0-9][a-z]` を検出し、N-M 形式への統一を確認 |
| affected_artifacts | [commands, command projection, integrity rules] |
| related_req | [REQ-0119-006, REQ-0119-021] |
| related_spec | [artifact-contracts.md, workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。一般語・旧語検出用文字列・projection 側の確認文は除外が必要 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 英字サブステップを N-M 形式へ置換 |
| last_verified | 2026-06-12 |

### IR-030: Subagent verbatim 条件付き返却

| Field | Value |
|-------|-------|
| rule_id | IR-030 |
| description | Subagent 返却契約で、成果物本文のみ verbatim とし、判定結果・調査過程・中間ログ・読解メモへ一律 verbatim を要求していないこと |
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
| triage_action | 一律 verbatim 指示を、成果物本文のみ verbatim・その他は要約/根拠/capture候補へ圧縮する表現に更新 |
| last_verified | 2026-06-12 |

### IR-031: Findings / Capture候補 見出し統一

| Field | Value |
|-------|-------|
| rule_id | IR-031 |
| description | current docs/source の Findings/Intake 系見出しが `Findings / Capture候補` に統一され、旧語は projection 側または integrity rule の検出目的に限って残存していること |
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
| detection_method | `delegation_type` / `on_result` 周辺文脈を検出し、必須 envelope 表現ではなく任意・参考分類の表現であることを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-017, REQ-0119-018] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。taxonomy 定義・任意ラベル説明・旧語検出用文字列は許容 |
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
| detection_method | `lightweight-delegation` 周辺文脈を検出し、primary pattern 宣言・frontmatter pattern・実装分類としての扱いがないことを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-015, REQ-0119-016] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。`primary pattern ではない` という否定表現と検出用文字列は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | primary pattern としての記述を削除し、重ねる委譲・manager-orchestrator との差分として説明する |
| last_verified | 2026-06-12 |

### IR-034: Skill 内部 section / protocol / Step 参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-034 |
| description | command から skill 内部の protocol 名・Step 名・Section 名・見出し名への参照、自然言語ラベルから存在しないファイル名を推測させる参照、skill 側に command 固有 Step 番号を一次情報として保持する記述を検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | command 定義本文・SKILL.md 本文から skill 内部 section 名・protocol 名・Step 名への直接参照パターンを検出 |
| affected_artifacts | [commands, skills] |
| related_req | [REQ-0108-244] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。検出パターン例示・検査ルール自体の記述は対象外 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 参照先を正規の公開 API（SKILL.md description / USE FOR）に置き換える |
| last_verified | 2026-06-14 |

### IR-035: Skill See Also 検出観点

| Field | Value |
|-------|-------|
| rule_id | IR-035 |
| description | skill の `See Also` に実行判断材料（委譲先・責務境界・禁止条件・停止条件）が含まれている、`DO NOT USE FOR` と `See Also` の重複、skill が全コマンド一覧等の別 SSoT 管理対象を保持していることを検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | SKILL.md の `See Also` セクションから実行判断材料・DO NOT USE FOR 重複・別 SSoT 一覧を検出 |
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
| description | accepted ADR のタイトル・本文に作業手段（削除・廃止・移行・完全削除・統合・再構築）の混入を検出すること（REQ-0108-249）。作業手段を主題とする ADR は作成不可であるため、accepted ADR にこれらが主題として含まれていないかを検査する |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | accepted ADR のタイトル・Decision セクションから作業手段キーワード（削除・廃止・移行・完全削除・統合・再構築）を検出し、主題か背景記述かを判定 |
| affected_artifacts | [current ADR] |
| related_req | [REQ-0108-249, REQ-0101-044, REQ-0101-045] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。Context（背景）セクションでの作業手段言及は許容されるため、Decision セクションの主題判定に注意 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 作業手段を主題とする ADR を retire/supersede または REQ/case へ移管 |
| last_verified | 2026-06-16 |

### IR-037: retired-ADR-current-baseline-ref

| Field | Value |
|-------|-------|
| rule_id | IR-037 |
| description | retired ADR（`docs/adr/retired/`）が現行基盤（current baseline）として参照・案内されていないこと（REQ-0108-250）。Current Baseline View・後継ADRの Related Decisions・REQ/SPEC の現行根拠において retired ADR が現行扱いされていないかを検査する |
| severity | strict |
| category | canonical-conflict |
| detection_method | retired ADR 番号が current baseline 文脈（Current Baseline View・現行根拠引用・後継指定なしの参照）に出現していないかを検出 |
| affected_artifacts | [ADR, ADR index, REQ, SPEC] |
| related_req | [REQ-0108-250, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照 `(retired)` 注記付きの言及は除外 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | retired ADR への現行参照を後継 ADR へ更新、または `(retired)` 注記を付与 |
| last_verified | 2026-06-16 |

### IR-038: ADR-index-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-038 |
| description | accepted ADR（`docs/adr/ADR-*.md`）と retired ADR（`docs/adr/retired/ADR-*.md`）の index（`docs/adr/README.md`）整合性を検査すること（REQ-0108-251）。Current Baseline View に accepted ADR が過不足なく記載され、Retired View に retired ADR が過不足なく記載されていること |
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
