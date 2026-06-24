---
updated: 2026-06-24
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

### IR-001: 現行 REQ frontmatter id ↔ ファイル名

| Field | Value |
|-------|-------|
| rule_id | IR-001 |
| description | 現行 REQ の frontmatter id とファイル名（REQ-NNNN.md）が一致すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter id 抽出 → ファイル名と照合 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-001, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。id/ファイル名 の不一致は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | frontmatter id またはファイル名を修正 |
| last_verified | 2026-06-06 |

### IR-002: 現行 REQ 必須 frontmatter fields

| Field | Value |
|-------|-------|
| rule_id | IR-002 |
| description | 現行 REQ に id, title, created, updated が存在すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter field 存在確認 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-001] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。必須 field 欠落は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 欠落 field を追加 |
| last_verified | 2026-06-06 |

### IR-003: Active/廃止 REQ ID 重複

| Field | Value |
|-------|-------|
| rule_id | IR-003 |
| description | 現行 REQ と 廃止 REQ の間で ID 重複がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | ID set の intersection 確認 |
| affected_artifacts | [現行 REQ, 廃止 REQ] |
| related_req | [REQ-0108-082] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | なし |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 重複 ID を解消 |
| last_verified | 2026-06-06 |

### IR-004: REQ index ↔ 現行 REQ 一致

| Field | Value |
|-------|-------|
| rule_id | IR-004 |
| description | docs/requirements/README.md の 現行 REQ 一覧と実際の REQ ファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README から REQ ID 抽出 → glob 結果と照合 |
| affected_artifacts | [REQ index, 現行 REQ] |
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
| false_positive_risk | 中。廃止 REQ 参照は別 rule で判定 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照を追加/修正 |
| last_verified | 2026-06-06 |

### IR-006: Command frontmatter 許可フィールド

| Field | Value |
|-------|-------|
| rule_id | IR-006 |
| description | Command frontmatter に description と agent のみが存在すること。pattern, workflow_route, branch_type, labels は禁止 |
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
| description | 全 廃止 REQ が mapping-table.md に記録されていること |
| severity | strict |
| category | document-drift |
| detection_method | 廃止 REQ ファイル一覧と mapping-table の照合 |
| affected_artifacts | [廃止 REQ, mapping-table] |
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

### IR-013: 完了報告種別実在

| Field | Value |
|-------|-------|
| rule_id | IR-013 |
| description | Command 定義が参照する種別パス（variant path）が templates/ に実在すること |
| severity | strict |
| category | broken-reference |
| detection_method | command 本文から種別パス（variant path）抽出 → 存在確認 |
| affected_artifacts | [commands, templates] |
| related_req | [REQ-0108-089-091] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 種別（variant）を作成または参照を修正 |
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

### IR-015: 廃止 REQ 現行参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-015 |
| description | 廃止 REQ が現行要件判断の第一参照として案内されていないこと |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の 廃止 REQ 参照検出、コンテキスト判定 |
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
| false_positive_risk | 低。ジャンクション（junction）破損は確実な NG |
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
| description | AGENTS.md、SPEC、guides の REQ 範囲表記が実際の 現行 REQ 数と一致すること |
| severity | heuristic |
| category | document-drift |
| detection_method | N件、through 等の表記と glob 結果の照合 |
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

### IR-019: Guide 要件定義、契約記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-019 |
| description | Guide ファイルが要件本文または契約本文を保持していないこと（REQ-0101）。語彙ベースの検出ではなく、guide が REQ/ADR/SPEC の責務を侵害する内容を保持していないかを検査する |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | Guide 内の要件定義表、契約記述、REQ 相当の振る舞い定義の検出。語彙ベースの判定ではなく構造的判定を主とし、強制条件表現は補助シグナル |
| affected_artifacts | [guides] |
| related_req | [REQ-0108-138, REQ-0101] |
| related_spec | [document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。引用、メタ文の除外に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | guide から要件本文、契約本文を削除し、REQ/ADR/SPEC への参照に置き換える |
| last_verified | 2026-06-06 |

### IR-020: 基準既知（baseline-known）と新規 finding の区別

| Field | Value |
|-------|-------|
| rule_id | IR-020 |
| description | 基準（`.agentdev/integrity/baseline.json`）に記録された known finding と新規 finding が区別されていること |
| severity | heuristic |
| category | integrity-rule-gap |
| detection_method | baseline.json の known_findings と現行 finding の比較 |
| affected_artifacts | [baseline, integrity reports] |
| related_req | [REQ-0108-145, 148] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, impact-guard |
| false_positive_risk | 中。基準（baseline）の陳腐化判定に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | none |
| triage_action | 基準（baseline）を更新 |
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
| description | 現行 REQ 要件行の主たる文意がスキーマフィールド、enum 値一覧、テストデータ詳細（fixture detail）、チェッカー個別ルール、誤検知（false positive）抑制方式、Step 番号、Phase 番号、内部アルゴリズム、具体的な作業履歴のいずれかである場合、当該 SPEC 詳細の混入を検出すること（REQ-0108-259, REQ-0108-260, REQ-0101-067〜069）。exemption 条件（isNegationContext / isDelegationContext、安定契約例外）は下位セクション「IR-044 exemption 条件」に詳細を記載 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 REQ 要件行の主たる文意からスキーマ、enum、テストデータ、チェッカー個別ルール、FP 抑制、Step 番号、Phase 番号、内部アルゴリズム、作業履歴キーワードをパターンマッチで検出。検出後、exemption 条件（isNegationContext / isDelegationContext / 安定契約例外）を満たす場合は warning から免除 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-259, REQ-0108-260, REQ-0101-067, REQ-0101-068, REQ-0101-069] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。REQ-0101-069 安定契約例外（公開コマンド名、公開入口、ドメイン状態位置づけ、他コマンド接続契約、利用者可視分類体系、安全境界、停止条件の大枠、後続工程が依存する安定した外部契約）に該当する要約残留、および isNegationContext / isDelegationContext 文脈での SPEC キーワード出現は検出対象外。詳細は下位セクション「IR-044 exemption 条件」 |
| regression_test | (追加予定)。既知の true positive が exemption により誤って免除されないことを回帰テストで検証する |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 該当要件行の詳細を SPEC、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに移管し、REQ 側は外部契約、状態要件の要約に置き換える |
| last_verified | 2026-06-21 |

#### IR-044 exemption 条件

IR-044 は isNegationContext と同列に isDelegationContext を exemption（免除）条件として扱う。
委譲、集約、切り出し、存在確認の文脈で SPEC キーワード（テストデータ、チェッカー等）が現れる場合、検出を warning から免除する（REQ-0108-259, AG-006 / ACT-SPEC-001）。

**exemption 対象文脈と代表キーワード**:

| 文脈述語 | 代表キーワード | 典型例 |
|---------|---------------|------|
| `isNegationContext` | 「〜しない」「〜以外」「〜を禁止」「〜を除く」「混入させない」「書かない」「含めない」「させない」「記述しない」 | 「SPEC キーワード X を要件行に書かない」「X 以外の用語」「SPEC 詳細を混入させない」 |
| `isDelegationContext` | 「委譲先」「集約先」「切り出し」「切り出す」「切り出し先」「routing」「経路分類名」「検証要件」「移送先」「移送」「参照先」「移管」「配置」「抽出」 | 「委譲先 SPEC にテストデータ詳細を配置」「routing 経路分類名『fixture』」「切り出し先 SPEC を参照」「切り出す基準」 |

**閾値、判定表（true positive 保護）**:

| 条件 | 判定 |
|------|------|
| SPEC キーワード単独で現れ、文脈述語なし | warning（true positive 候補） |
| SPEC キーワード + `isNegationContext` 成立 | 免除 |
| SPEC キーワード + `isDelegationContext` 成立 | 免除 |
| SPEC キーワード + `isNegationContext` + `isDelegationContext`（重なり） | 免除（OR 条件、いずれか一方が成立すれば免除） |
| SPEC キーワード + 安定契約例外（REQ-0101-069） | 免除（既存 `false_positive_risk` 記載通り） |
| SPEC キーワード + 委譲文脈キーワード + SPEC 詳細の平叙述（両立でない） | warning（true positive 候補） |

**境界ケース（exemption 適用外）**:

- 委譲文脈キーワードが SPEC 詳細の記述そのものである場合（例: 「委譲先 SPEC に fixture/checker の enum 一覧を列挙する」）は免除しない。委譲先を指す語（「委譲先」「集約先」「切り出し先」）と SPEC 詳細を並列表記する両立ケースに限り免除する。
- `isNegationContext` と `isDelegationContext` が同時出現する場合は OR 条件とし、いずれか一方が成立すれば免除する。
- 回帰テストで既知の true positive（SPEC 詳細が REQ に残留している実例）が免除されないことを検証する。exemption 実装後は既知の false positive 9 件（`.agentdev/drafts/req-spec-cleanup-plan.md` 参照）が cleanup plan から除外される。

### IR-045: docs 日本語表現、文意整合検査

| Field | Value |
|-------|-------|
| rule_id | IR-045 |
| description | docs/SPEC/REQ/command/skill の日本語表現、文意整合を検査すること。`read-only`/`Read-Only`/`read_only`/`read-only-diagnostic`/`advisor`/`advisory`/`architecture-affecting`/`Architecture advisory gate` 等の英字混じり抽象用語、読取専用セマンティクス、および `現行 REQ`/`廃止 REQ`/`accepted ADR`/`active docs`（修飾語）、`domain state`/`runtime command`/`command topology`/`provenance marker`/`upstream handoff`/`fixture detail`/`self-hosting`/`junction`/`session-sourced`/`top-level`（複合技術語）、`fixture`/`variant`/`provider`/`baseline`（専門カタカナ語）について、日本語説明の併記、文意に基づく自然な日本語化、許可/禁止操作の明示、具体許可操作への置換を検証する（REQ-0108, REQ-0140, REQ-0101-061）。推奨訳は docs/specs/document-type-responsibilities.md を参照 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 対象ファイル（`docs/**/*.md` ただし `docs/**/retired/**` は除外、`src/opencode/commands/**/*.md`、`src/opencode/skills/**/*.md`、`.opencode/commands/repo/**/*.md`、`.opencode/skills/repo-agentdev-integrity/**/*.md`）から検出対象語（`read-only`/`Read-Only`/`read_only`/`read-only-diagnostic`/`advisor`/`advisory`/`architecture-affecting`/`Architecture advisory gate`、および `現行 REQ`/`廃止 REQ`/`accepted ADR`/`active docs`、`domain state`/`runtime command`/`command topology`/`provenance marker`/`upstream handoff`/`fixture detail`/`self-hosting`/`junction`/`session-sourced`/`top-level`、`fixture`/`variant`/`provider`/`baseline`）を検出。識別子（enum 値、frontmatter field、ファイル名、ディレクトリ名、バッククォート内コード値）の場合は周辺に日本語説明が存在するか確認。`read-only` 検出時は同一段落または直後のリストで許可出力、禁止操作が記述されているか検証。YAML 例中の `read_only` は具体の許可操作に置換されているか検証。英字のみの見出し、英字混じり抽象見出しを検出。修飾語、複合技術語、専門カタカナ語の検出時は、文意に基づく自然な日本語化がされているか docs/specs/document-type-responsibilities.md の指針に合致しているかを検証 |
| affected_artifacts | [docs, REQ, SPEC, guides, commands, skills] |
| related_req | [REQ-0108, REQ-0140, REQ-0101] |
| related_spec | [integrity-contracts.md, document-type-responsibilities.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 高。英字混じり抽象用語の「抽象」判定、日本語説明充足度の判定に意味判断が必要。識別子として正当な英字語（enum 値等）は文脈判定で除外が必要 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 分類に基づき修正。NG（英字混じり抽象用語に日本語説明不在／`read-only` 宣言に反して出力生成、commit、push が許可されている）は許可/禁止操作を明示化、日本語説明を併記。WARNING（識別子は保持するが日本語説明が不十分）は説明を補強。OK（日本語名と識別子が両立し許可/禁止操作が明確）は対応不要。default severity は warning、accepted SPEC または 現行 REQ で NG 分類の場合は error に昇格 |
| last_verified | 2026-06-19 |

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

### IR-047: src/opencode-local/ 生成時ソース領域ディレクトリ構成

| Field | Value |
|-------|-------|
| rule_id | IR-047 |
| description | `src/opencode-local/` はローカル版生成時ソース領域であり、許容されたディレクトリ構成（`README.md`, `case-schema/`, `transform/`, `generation-flow.md`）のみを保持すること（REQ-0141-004）。禁止パス（`requirements/`, `specs/`, `_conv/`, `commands/`, `skills/`）を作成しないこと（REQ-0141-005） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode-local/` 配下のディレクトリ、ファイル一覧を取得し、許容リスト（`README.md`, `case-schema/`, `transform/`, `generation-flow.md`）外のパスを検出 |
| affected_artifacts | [src/opencode-local/] |
| related_req | [REQ-0141-003, REQ-0141-004, REQ-0141-005] |
| related_spec | [local-generation.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | なし。パスの直接比較による機械的検出 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 許容リスト外のディレクトリ、ファイルを削除し、`src/opencode-local/` を生成時ソース領域の構成に復元 |
| last_verified | 2026-06-20 |

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
├── depends on → isNegationContext / isDelegationContext（exemption）
├── depends on → IR044_STABLE_CONTRACT_PATTERN（REQ-0101-069 例外）
└── affects → なし（独立ルール）

checkWorkflowStatusProhibition
├── depends on → sixPhasePattern（6-phase + stateWord）
├── depends on → isInsideCodeSpan（enum リテラル除外・REQ-0145-002）
└── affects → なし（独立ルール）

checkLegacyNormativeMarkers
├── depends on → LEGACY_NORMATIVE_MARKER_PATTERNS
├── depends on → LEGACY_NORMATIVE_MARKER_EXEMPT_PATHS
└── affects → なし（独立ルール）

checkDocLanguageQuality (IR-045)
├── depends on → IR045_TARGET_TERMS
├── depends on → frontmatter skip・filename-link skip（REQ-0144-004）
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
| `check_integrity.ts`（docs-check + IR ルール） | REQ/SPEC/reference 整合性の**決定論的**検出。frontmatter 許可フィールド、ID 一意性、リンク到達性、Step 形式、namespace legacy 残存、ADR status 正規化等、本カタログ（IR-001〜IR-053）が定義する検出 | 機械的検出層（[integrity-contracts.md](integrity-contracts.md)「3層検出構造の責務分担」） |
| inspect-* skills（inspect-docs / inspect-skills） | 配布物整合性検査（REQ-0142-006/007）。構文健全性の重複検出、文意保持の意味解析、責務説明照合など意味判断を含む診断 | 意味的診断層。詳細は [docs-spec-rebuild-integrity.md](docs-spec-rebuild-integrity.md)「検査バックエンド責務分担」参照 |

**配布物整合性検査（REQ-0142-006/007）は `check_integrity.ts` に追加しない**。配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅し、意味的診断は inspect-* skills に集約する。これにより `categoryToCheckPattern` map への新カテゴリ追加（skill-category-gap、REQ-0108-161/171、REQ-0144-005）を不要とし、ターゲットング隠退化を防ぐ。

## メタ整合性

本カタログ自体の整合性を以下で担保する:
- 各ルールのフィールド数 ≥ 15
- 全ルールに related_req を持つ
- gate_level が 3 層のいずれか
- severity が strict/heuristic/observation のいずれか
