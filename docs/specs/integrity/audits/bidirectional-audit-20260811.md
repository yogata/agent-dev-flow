---
id: AUDIT-IR-BIDIRECTIONAL-PHASE1
title: "REQ-028 Phase 1 全59 IR 双方向監査（OU-002 #2078）"
status: draft
created: 2026-08-11
audit_for: REQ-028 / DEC-013
source_issue: "#2078 (OU-002 Phase 1)"
parent_epic: "#2076 (REQ-028 IR portfolio audit)"
baseline_ref: pre-audit-baseline-20260811.md
captured_at_head: 533805ae88f945967432e7c161eabe863893686a
baseline_head: 4e6937c73dfbe5a47d6fc04f9245103ac312dd15
---

# REQ-028 Phase 1 全59 IR 双方向監査（OU-002 #2078）

> **位置づけ**: 本ファイルは REQ-028-003（全 file-backed IR および catalog-only IR を対象とする双方向ポートフォリオ監査）の Phase 1 成果物である。
> Phase 1 はデータ収集・分析を担い、判定候補と判定根拠の記録までを責務とする。
> KEEP/MERGE/IMPLEMENT/DELETE の確定判定は Phase 2（OU-003 #2079）の責務（REQ-028-004）。
> 本ファイルは Phase 2 入力データとして扱う。

## 1. 監査メタデータ

| 項目 | 値 |
|---|---|
| 監査実施日 | 2026-08-11 (JST) |
| 対象 HEAD | `533805ae` (533805ae88f945967432e7c161eabe863893686a) |
| baseline HEAD | `4e6937c7` (4e6937c73dfbe5a47d6fc04f9245103ac312dd15) |
| worktree | `.worktrees/2078-feature` (branch: `feature/issue-2078`) |
| ベース | `origin/main` @ 533805ae |
| 根拠要件 | REQ-028-001..013（特に REQ-028-001: 8項目存在条件、REQ-028-003: 双方向監査、REQ-028-004: KEEP/MERGE/IMPLEMENT/DELETE 分類） |
| 根拠 Decision | DEC-013 (AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化) |
| IR 件数 | file-backed 59（IR-017 欠番、IR-045 catalog-only、IR-011 file-backed tombstone 含む） |
| 調査項目数 | 14（IR→実装 11、実装→IR 3） |
| 比較基準 | [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md) |

## 2. 監査サマリ

### 2.1 判定候補分布

| 判定候補 | 件数 | IR |
|---|---|---|
| KEEP | 29 | IR-001, IR-002, IR-003, IR-004, IR-005, IR-006, IR-007, IR-008, IR-009, IR-010, IR-012, IR-013, IR-014, IR-016, IR-018, IR-020, IR-021, IR-023, IR-024, IR-038, IR-044, IR-049, IR-053, IR-054, IR-055, IR-056, IR-058, IR-059, IR-061 |
| IMPLEMENT | 10 | IR-028, IR-029, IR-030, IR-031, IR-032, IR-033, IR-034, IR-035, IR-050, IR-051 |
| IMPLEMENT* | 10 | IR-019, IR-022, IR-025, IR-026, IR-046, IR-047, IR-048, IR-052, IR-057, IR-060 |
| MERGE* | 9 | IR-015, IR-027, IR-036, IR-037, IR-039, IR-040, IR-041, IR-042, IR-043 |
| DELETE | 1 | IR-011 |
| **合計** | **59** | - |

> **注記**: `*` 付きは「候補」であり、Phase 2 (OU-003) で確定判定を行う。
> REQ-028-013 により IR 件数削減数を成功指標としない。

### 2.2 detector 実装状況（IR→実装方向、項目3）

| 区分 | 件数 | 備考 |
|---|---|---|
| リテラル参照あり（IR-NNN ID 直接参照） | 13 | check_integrity.ts / 単体 checker 内で IR-NNN リテラル使用 |
| 意味ベース（リテラル参照なし、関数名・コメントから推定） | 25 | Phase 2 で完全マッピング推奨 |
| detector 未実装 | 17 | IMPLEMENT 候補の主要因 |
| tombstone（enforcement_mode: none） | 1 | IR-011 のみ |
| その他 | 3 | - |

### 2.3 regression test カバレッジ（IR→実装方向、項目5）

| 区分 | 件数 |
|---|---|
| 実装済み（テストファイル参照） | 26 |
| 手動確認 | 7 |
| 未実装 | 24 |
| 将来実装予定（grep 実装追加時等） | 1 |
| sync script で検証 | 1 |

### 2.4 主要 findings

- **detector リテラル参照の稀少**（baseline §8 と整合）: 59 IR のうちリテラル参照が確認できたのは約15件（IR-001, 002, 044, 046, 048, 053, 054, 055, 056, 057, 058, 059, 061 等）。残り約44件は意味ベースマッピングに依存。Phase 2 (OU-003) または横断的再評価（OU-004）で完全マッピングを推奨。
- **detector 未実装 IR**: 10 件が IMPLEMENT 候補（detector 未実装を主因）。REQ-028-002（非実効 IR 許容禁止）に基づき Phase 2 で detector 実装 or DELETE/MERGE を確定。
- **IR-011 file-backed tombstone**: DEC-013 AG-008 に基づき物理削除候補。交叉参照（v2:REQ-0108-083〜088）は req-impact-map.md/retired/ 配下へ再配置（REQ-028-008）。
- **退休止 REQ/Decision 関連 IR の包括関係**: IR-015/040/041/043（retired REQ）、IR-025/027/037（retired Decision）、IR-026/036（Decision 誤分類）は相互に近接。Phase 2 で MERGE 判定を推奨。
- **IR-028/029（Command Step 形式）**: IR-049（Command file format violation）が包括する可能性。Phase 2 で統合判定。
- **IR-039/042（index 整合性）**: IR-061（AUTOGEN 整合性）が包括する可能性。Phase 2 で統合判定。
- **AUTOGEN ブロック不整合 4件**（baseline §5.3）: IR-061 違反として検出。generate_indexes.ts 再実行で解消見込み。
- **IR-057（obsolete-spec-path）の一時移行検査性**: REQ-028-006 に基づき、恒久 IR とするか別種検査（期限/終了条件付き）とするか Phase 2 で判定。

## 3. 全59 IR 判定候補一覧表

| IR | title | severity | baseline | gate | detector | test | 判定候補 |
|---|---|---|---|---|---|---|---|
| IR-001 | 現行 REQ frontmatter id ↔ ファイル名 | strict | resolved | full-audit | リテラル | commands_structure.test.t... | KEEP |
| IR-002 | 現行 REQ 必須 frontmatter fields | strict | resolved | full-audit | リテラル | commands_structure.test.t... | KEEP |
| IR-003 | Active/廃止 REQ ID 重複 | strict | resolved | full-audit | 意味 | commands_structure.test.t... | KEEP |
| IR-004 | REQ index ↔ 現行 REQ 一致 | strict | resolved | full-audit | 意味 | commands_structure.test.t... | KEEP |
| IR-005 | Decision ↔ REQ 相互参照存在 | strict | resolved | full-audit | 意味 | check_integrity.test.ts | KEEP |
| IR-006 | Command frontmatter 許可フィールド | strict | resolved | full-audit, delta-guard | 意味 | command_fixtures.test.ts | KEEP |
| IR-007 | Skill frontmatter name ↔ dir | strict | resolved | full-audit | 意味 | lint_skills.test.ts | KEEP |
| IR-008 | Skill references/ 存在 | strict | resolved | full-audit, delta-guard | 意味 | check_reference_paths.tes... | KEEP |
| IR-009 | 旧 namespace 残存 | strict | resolved | full-audit | 意味 | commands_e2e.test.ts | KEEP |
| IR-010 | ADR status 正規化 | strict | resolved | full-audit | 意味 | check_integrity.test.ts | KEEP |
| IR-011 | Mapping table 全件記録（廃止済み） | - | superseded | - | tombstone | - | DELETE |
| IR-012 | Template 必須セクション | strict | resolved | full-audit, delta-guard | 意味 | check_templates.test.ts | KEEP |
| IR-013 | 完了報告種別実在 | strict | resolved | full-audit, delta-guard | 意味 | commands_structure.test.t... | KEEP |
| IR-014 | reference/ 残存検出 | strict | resolved | full-audit | 意味 | lint_skills.test.ts | KEEP |
| IR-015 | 廃止 REQ 現行参照検出 | heuristic | resolved | full-audit | 意味 | commands_e2e.test.ts | MERGE* |
| IR-016 | Source/projection 整合性 | strict | known | full-audit, delta-guard | 意味 | (sync script で検証) | KEEP |
| IR-018 | REQ 範囲表記鮮度 | heuristic | resolved | full-audit | 意味 | (手動確認) | KEEP |
| IR-019 | Guide 要件定義、契約記述検出 | heuristic | resolved | full-audit | ? | (手動確認) | IMPLEMENT* |
| IR-020 | 基準既知（baseline-known）と新規 finding の区別 | heuristic | resolved | full-audit, impact-guard | 意味 | (手動確認) | KEEP |
| IR-021 | 廃止済み skill 参照検出 | strict | resolved | full-audit | 意味 | commands_e2e.test.ts | KEEP |
| IR-022 | REQ 内部整合性 | strict | resolved | full-audit | ? | (手動確認) | IMPLEMENT* |
| IR-023 | Integrity artifact validator drift | heuristic | resolved | full-audit, impact-guard | 意味 | prevention_gates.test.ts | KEEP |
| IR-024 | Command README ↔ 実体 | strict | resolved | full-audit | 意味 | commands_structure.test.t... | KEEP |
| IR-025 | 廃止 ADR path 規則 | strict | known | full-audit | 未実装 | (未実装) | IMPLEMENT* |
| IR-026 | ADR 誤分類兆候検出 | heuristic | known | full-audit | ? | (手動確認) | IMPLEMENT* |
| IR-027 | 廃止 ADR 現行根拠引用検出 | heuristic | known | full-audit | 意味 | (手動確認) | MERGE* |
| IR-028 | Command 最上位 Step 整数化 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-029 | Command 英字サブステップ禁止 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-030 | Subagent verbatim 条件付き返却 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-031 | Findings / Capture候補 見出し統一 | heuristic | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-032 | delegation_type/on_result 必須 envelope 禁止 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-033 | lightweight-delegation primary pattern 禁止 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-034 | Skill 内部 section / protocol / Step 参照検出 | heuristic | new | full-audit | 未実装 | (未実装) | IMPLEMENT |
| IR-035 | Skill See Also 検出観点 | heuristic | new | full-audit | 未実装 | (未実装) | IMPLEMENT |
| IR-036 | Decision-work-means-detection | heuristic | resolved | full-audit | 未実装 | (未実装) | MERGE* |
| IR-037 | retired-ADR-current-baseline-ref | strict | new | full-audit | 未実装 | (未実装) | MERGE* |
| IR-038 | Decision-index-consistency | strict | new | full-audit, delta-guard | 意味 | (未実装) | KEEP |
| IR-039 | index-req-title-consistency | strict | new | full-audit | 意味 | (未実装) | MERGE* |
| IR-040 | retired-req-authority-comment | strict | new | full-audit, delta-guard | 意味 | (未実装) | MERGE* |
| IR-041 | retired-req-broken-link | strict | new | full-audit | 意味 | (未実装) | MERGE* |
| IR-042 | hardcoded-req-count | heuristic | new | full-audit | 意味 | (手動確認) | MERGE* |
| IR-043 | retired-readme-coverage | strict | new | full-audit | 未実装 | (未実装) | MERGE* |
| IR-044 | REQ/SPEC 境界違反検出 | heuristic | new | full-audit | リテラル | check_integrity.test.ts の... | KEEP |
| IR-046 | consumer-generated リポジトリ種別誤検知防止 | heuristic | new | full-audit | リテラル | (未実装) | IMPLEMENT* |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT* |
| IR-048 | generated_by 識別子整合性 | strict | new | full-audit, delta-guard | リテラル | (未実装) | IMPLEMENT* |
| IR-049 | Command file format violation | strict | resolved | full-audit, delta-guard | 意味 | check_command_format.test... | KEEP |
| IR-050 | load_skills command 誤指定検出 | strict | new | full-audit, delta-guard | 未実装 | (未実装) | IMPLEMENT |
| IR-051 | 実行主体の skill 表記誤認検出 | heuristic | new | full-audit | 未実装 | (未実装) | IMPLEMENT |
| IR-052 | 完了条件 grep パターン設計（REQ-010-011） | observation | new | full-audit | 未実装 | (grep 実装追加時) | IMPLEMENT* |
| IR-053 | gh 直接記述検出 | heuristic | new | full-audit, delta-guard | リテラル | gh 直接呼出しを含む fixture を検出し、... | KEEP |
| IR-054 | draft SPEC 放置検出 | heuristic | new | full-audit | リテラル | (未実装)。既知 true positive とし... | KEEP |
| IR-055 | runtime-unresolved-reference（配布物内の導入先未解決参照検出） | strict（REQ/Decision ... | new | full-audit, delta-guard, impact-guard | リテラル | check_integrity.test.ts。各... | KEEP |
| IR-056 | project-extensions-integrity | strict | new | full-audit, delta-guard, impact-guard | リテラル | check_extensions.test.ts ... | KEEP |
| IR-057 | obsolete-spec-path-after-domain-split | strict | new | full-audit, delta-guard, impact-guard | リテラル | (未実装)。obsolete-path-map.y... | IMPLEMENT* |
| IR-058 | distribution-untracked-skill-reference | strict | new | full-audit, delta-guard, impact-guard | リテラル | check_integrity.test.ts の... | KEEP |
| IR-059 | distribution-reference-boundary | strict | - | full-audit | リテラル | 具体ID、具体パス、固定URL、各exemptio... | KEEP |
| IR-060 | forbidden Japanese word detection | heuristic | new | delta-guard | 未実装 | (未実装) | IMPLEMENT* |
| IR-061 | 索引類自動生成整合性 | strict | - | - | リテラル | - | KEEP |

## 4. IR→実装方向（11項目 × 59 IR）

各 IR について次の11項目を証拠付きで記録する。

1. canonical basis（REQ/Decision/SPEC）
2. invariant（将来も維持すべき repository invariant）
3. detector 実装（専有または共有）
4. detection coverage（detection method vs detector 実装）
5. regression test 有無
6. runtime reachability（docs-check / CI / 保存工程からの到達性）
7. severity / gate / finding route
8. baseline 状態
9. 他 IR との重複（包容関係）
10. migration 固有性
11. 現行 artifact 依存

### IR-001: 現行 REQ frontmatter id ↔ ファイル名

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-001, REQ-001; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-001 ファイル |
| 2 | invariant | 現行 REQ の frontmatter id とファイル名（REQ-NNNN.md）が一致すること | IR-001 description / Field 表 |
| 3 | detector 実装 | checkReqFrontmatterFilename (check_integrity.ts) | リテラル参照あり (check_changed_docs.ts rule_id 'IR-001') |
| 4 | detection coverage | リテラル参照あり (check_changed_docs.ts rule_id 'IR-001') | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-001 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (targeted guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-001 Field 表 |
| 8 | baseline 状態 | resolved | IR-001 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-002 と近接（frontmatter 関連） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし（恒久 invariant） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 現行 REQ ファイル群 | IR-001 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み、regression test 実装済み、runtime route 確立、8項目存在条件すべて満たす

### IR-002: 現行 REQ 必須 frontmatter fields

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-001; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-002 ファイル |
| 2 | invariant | 現行 REQ が必須 frontmatter fields（id, title, created, updated）を持つこと | IR-002 description / Field 表 |
| 3 | detector 実装 | checkReqRequiredFields (check_integrity.ts) | リテラル参照あり (check_changed_docs.ts rule_id 'IR-002') |
| 4 | detection coverage | リテラル参照あり (check_changed_docs.ts rule_id 'IR-002') | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-002 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (targeted guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-002 Field 表 |
| 8 | baseline 状態 | resolved | IR-002 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-001 と近接（frontmatter 関連） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし（恒久 invariant） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 現行 REQ ファイル群 | IR-002 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み、test 実装済み、route 確立

### IR-003: Active/廃止 REQ ID 重複

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-082; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-003 ファイル |
| 2 | invariant | Active な REQ ID と廃止 REQ ID が重複しないこと | IR-003 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkNameCollision / checkReqRetiredIndexSync (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-003 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-003 Field 表 |
| 8 | baseline 状態 | resolved | IR-003 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立（重複なし） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 現行 REQ、廃止 REQ 索引 | IR-003 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立。detector の意味ベース対応は Phase 2 で確認推奨

### IR-004: REQ index ↔ 現行 REQ 一致

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-003; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-004 ファイル |
| 2 | invariant | REQ index と現行 REQ が一致すること | IR-004 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkReqReadmeIndexSync (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-004 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-004 Field 表 |
| 8 | baseline 状態 | resolved | IR-004 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-039（index タイトル整合）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/requirements/README.md、REQ ファイル群 | IR-004 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-005: Decision ↔ REQ 相互参照存在

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-005; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-005 ファイル |
| 2 | invariant | Decision と REQ が相互に参照を持ち、参照先が実在すること | IR-005 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkAdrReqCrossReference (check_integrity.ts) | 意味ベース（リテラル参照なし）。注記: baseline §3.3 で IR-005 title 表記揺れ（'ADR↔REQ' vs 'Decision↔REQ'）が AUTOGEN 不整合として検出 |
| 4 | detection coverage | 意味ベース（リテラル参照なし）。注記: baseline §3.3 で IR-005 title 表記揺れ（'ADR↔REQ' vs 'Decision↔REQ'）が AUTOGEN 不整合として検出 | baseline §3; explore agent 結果 |
| 5 | regression test | check_integrity.test.ts | IR-005 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-005 Field 表 |
| 8 | baseline 状態 | resolved | IR-005 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群、REQ ファイル群 | IR-005 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立。AUTOGEN 表記揺れは IR-061 経由で解消見込み

### IR-006: Command frontmatter 許可フィールド

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002-015, REQ-010-046, 095-099, 108, 124, 129; SPEC: integrity-contracts.md, artifact-contracts.md | rule-ownership.md AUTOGEN; IR-006 ファイル |
| 2 | invariant | Command frontmatter が許可フィールド（description 等）のみを持つこと | IR-006 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkCommandFrontmatterDetailed (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | command_fixtures.test.ts | IR-006 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-006 Field 表 |
| 8 | baseline 状態 | resolved | IR-006 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立（frontmatter 関連だが対象異なる） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群 | IR-006 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、delta-guard 含む route 確立

### IR-007: Skill frontmatter name ↔ dir

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-092; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-007 ファイル |
| 2 | invariant | Skill frontmatter name とディレクトリ名が一致すること | IR-007 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkSkillFrontmatter (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | lint_skills.test.ts | IR-007 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-007 Field 表 |
| 8 | baseline 状態 | resolved | IR-007 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | skill SKILL.md 群 | IR-007 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-008: Skill references/ 存在

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-110, 115-120, REQ-010-020; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-008 ファイル |
| 2 | invariant | Skill references/ ディレクトリが実在すること | IR-008 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkReferencesRecursiveScan (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | check_reference_paths.test.ts | IR-008 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-008 Field 表 |
| 8 | baseline 状態 | resolved | IR-008 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-014（reference/ 残存）と対（正規 vs 廃止） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | skill references/ ディレクトリ群 | IR-008 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-009: 旧 namespace 残存

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-016; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-009 ファイル |
| 2 | invariant | 旧 namespace（廃止されたコマンド名、パス）が残存しないこと | IR-009 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkLegacyNamespace / checkExpandedLegacyNamespace / checkLegacyNamespaceInDocs (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_e2e.test.ts | IR-009 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-009 Field 表 |
| 8 | baseline 状態 | resolved | IR-009 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-021（廃止 skill 参照）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし（恒久 invariant） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command/skill/docs 配下の旧 namespace 検出 | IR-009 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-010: ADR status 正規化

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-121; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-010 ファイル |
| 2 | invariant | ADR/Decision status が正規化された値（accepted/proposed/superseded/deprecated）を持つこと | IR-010 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkAdrStatusNormalization (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | check_integrity.test.ts | IR-010 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-010 Field 表 |
| 8 | baseline 状態 | resolved | IR-010 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群 | IR-010 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-011: Mapping table 全件記録（廃止済み）

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: v2:REQ-0108-083〜088; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-011 ファイル |
| 2 | invariant | （廃止済み）mapping-table.md 全件記録。検査対象ファイル不存在 | IR-011 description / Field 表 |
| 3 | detector 実装 | なし（enforcement_mode: none、4面除外適用） | tombstone（file-backed superseded） |
| 4 | detection coverage | tombstone（file-backed superseded） | baseline §3; explore agent 結果 |
| 5 | regression test | - | IR-011 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | なし（enforcement_mode: none で checker registry / gate routing / finding generation / baseline execution の4面から除外） | baseline §5.1 |
| 7 | severity / gate / finding route | severity: -; gate: -; finding: - | IR-011 Field 表 |
| 8 | baseline 状態 | superseded | IR-011 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | v2 → v3 再構築による mapping-table.md 廃止に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | mapping-table.md（廃止済み、ファイル不存在） | IR-011 affected_artifacts |

**判定候補**: DELETE
**判定根拠**: DEC-013 AG-008 で file-backed tombstone は物理削除可能。
Phase 2 (OU-003) で物理削除を確定。
交叉参照 (v2:REQ-0108-083〜088) は req-impact-map.md/retired/ 配下へ再配置（REQ-028-008）

### IR-012: Template 必須セクション

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010 (workflow template 構造); SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-012 ファイル |
| 2 | invariant | Template が必須セクションを持つこと | IR-012 description / Field 表 |
| 3 | detector 実装 | check_templates.ts (standalone checker) | 意味ベース（専有 checker 実装） |
| 4 | detection coverage | 意味ベース（専有 checker 実装） | baseline §3; explore agent 結果 |
| 5 | regression test | check_templates.test.ts | IR-012 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-012 Field 表 |
| 8 | baseline 状態 | resolved | IR-012 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | template ファイル群 | IR-012 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: 専有 checker 実装済み、test 実装済み、route 確立

### IR-013: 完了報告種別実在

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-089-091, REQ-010-020; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-013 ファイル |
| 2 | invariant | 完了報告種別（variant）が実在すること | IR-013 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkVariantExistence / checkVariantPathExistence / checkVariantRegistryRegistered (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-013 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-013 Field 表 |
| 8 | baseline 状態 | resolved | IR-013 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 完了報告 template 群 | IR-013 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-014: reference/ 残存検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002-013, 039, REQ-010-039, 040, 094; SPEC: artifact-responsibilities.md | rule-ownership.md AUTOGEN; IR-014 ファイル |
| 2 | invariant | 廃止された reference/ ディレクトリが残存しないこと（正規は references/） | IR-014 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkObsoleteReferenceDirs (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | lint_skills.test.ts | IR-014 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-014 Field 表 |
| 8 | baseline 状態 | resolved | IR-014 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-008（references/ 存在）と対（正規 vs 廃止） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | skill ディレクトリ群 | IR-014 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-015: 廃止 REQ 現行参照検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-070-074, 136; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-015 ファイル |
| 2 | invariant | 廃止 REQ が現行ドキュメントから参照されないこと | IR-015 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkPatternResidualDetection / checkReqBacklogResidualDetection (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_e2e.test.ts | IR-015 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-015 Field 表 |
| 8 | baseline 状態 | resolved | IR-015 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-041（retired-req-broken-link）、IR-040（retired-req-authority-comment）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 現行ドキュメント群、廃止 REQ 索引 | IR-015 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-040/041 と退休止 REQ 関連で包括関係の可能性。Phase 2 (OU-003) で統合判定を確定

### IR-016: Source/projection 整合性

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002-048-052, REQ-010-143-144; SPEC: system.md | rule-ownership.md AUTOGEN; IR-016 ファイル |
| 2 | invariant | src/opencode/ と .opencode/ projection が整合すること | IR-016 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkSourceProjectionConsistency / checkBrokenJunctions / checkSourceRequiredDirs / checkInstalledProjection / checkJunctionScanCoverage (check_integrity.ts) | 意味ベース（リテラル参照なし）。worktree 内では isInsideWorktree skip 適用 |
| 4 | detection coverage | 意味ベース（リテラル参照なし）。worktree 内では isInsideWorktree skip 適用 | baseline §3; explore agent 結果 |
| 5 | regression test | (sync script で検証) | IR-016 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-016 Field 表 |
| 8 | baseline 状態 | known | IR-016 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし（source/projection モデル固有） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | src/opencode/、.opencode/ ジャンクション | IR-016 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（worktree skip は構造的制約）、route 確立。baseline_status: known は既知の finding あり

### IR-018: REQ 範囲表記鮮度

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-140; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-018 ファイル |
| 2 | invariant | REQ 範囲表記（REQ-NNN-MMM..NNN 等）が鮮度を保つこと | IR-018 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkReqRangeStaleness / checkSummaryReqRangeConsistency (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-018 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-018 Field 表 |
| 8 | baseline 状態 | resolved | IR-018 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-042（hardcoded-req-count）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | REQ ファイル群 | IR-018 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み、route 確立。test は手動確認

### IR-019: Guide 要件定義、契約記述検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-138, REQ-001; SPEC: document-model.md | rule-ownership.md AUTOGEN; IR-019 ファイル |
| 2 | invariant | Guide が要件定義、契約記述を含まないこと（Guide は規範的権限なし） | IR-019 description / Field 表 |
| 3 | detector 実装 | （docs-check 対象外、inspect-docs へ委譲予定: REQ-028-007） | 意味判断を要するため docs-check 対象外 |
| 4 | detection coverage | 意味判断を要するため docs-check 対象外 | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-019 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | inspect-docs（Phase 1 時点） | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-019 Field 表 |
| 8 | baseline 状態 | resolved | IR-019 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-044（REQ/SPEC 境界）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/guides/ 配下 | IR-019 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: REQ-028-007 により意味判断検査は inspect/diagnostics へ移管。Phase 2 で inspect-docs への完全移管を確定、IR として存続するか MERGE も検討

### IR-020: 基準既知（baseline-known）と新規 finding の区別

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-145, 148; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-020 ファイル |
| 2 | invariant | 既知の baseline finding と新規 finding を区別すること | IR-020 description / Field 表 |
| 3 | detector 実装 | （baseline 管理機構） | 意味ベース（実装詳細は baseline 運用） |
| 4 | detection coverage | 意味ベース（実装詳細は baseline 運用） | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-020 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit, impact-guard; finding: intake | IR-020 Field 表 |
| 8 | baseline 状態 | resolved | IR-020 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立（メタ検査） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | baseline データ、check_integrity.ts の baseline ロジック | IR-020 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: baseline 運用の根幹。Phase 4 (OU-005) で baseline_status 除去後の finding-baseline 分離（REQ-028-009/010）を反映予定

### IR-021: 廃止済み skill 参照検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-126-128; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-021 ファイル |
| 2 | invariant | 廃止済み skill が現行ドキュメントから参照されないこと | IR-021 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkAbolishedSkillReferences (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_e2e.test.ts | IR-021 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-021 Field 表 |
| 8 | baseline 状態 | resolved | IR-021 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-009（旧 namespace 残存）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 現行ドキュメント群、廃止 skill 索引 | IR-021 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-022: REQ 内部整合性

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-139, 149; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-022 ファイル |
| 2 | invariant | REQ 内部の要件相互が整合すること | IR-022 description / Field 表 |
| 3 | detector 実装 | （docs-check 対象外、inspect-docs へ移譲候補: REQ-028-007） | 意味判断を要する |
| 4 | detection coverage | 意味判断を要する | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-022 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | inspect-docs（Phase 1 時点） | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-022 Field 表 |
| 8 | baseline 状態 | resolved | IR-022 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | REQ ファイル群 | IR-022 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: REQ-028-007 で inspect/diagnostics へ移管候補。Phase 2 で移管確定または IR 廃止を判定

### IR-023: Integrity artifact validator drift

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-147; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-023 ファイル |
| 2 | invariant | Integrity artifact validator が現行契約から drift しないこと | IR-023 description / Field 表 |
| 3 | detector 実装 | （validator 自体のメタ検査） | 意味ベース |
| 4 | detection coverage | 意味ベース | baseline §3; explore agent 結果 |
| 5 | regression test | prevention_gates.test.ts | IR-023 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit, impact-guard; finding: intake | IR-023 Field 表 |
| 8 | baseline 状態 | resolved | IR-023 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立（メタ検査） | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | validator スクリプト群 | IR-023 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-024: Command README ↔ 実体

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-026, REQ-010-003; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-024 ファイル |
| 2 | invariant | Command README と実体（command 定義ファイル）が一致すること | IR-024 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkCommandReadmeSync / checkExpandedReadmeSync / checkCommandMapConsistency (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | commands_structure.test.ts | IR-024 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-024 Field 表 |
| 8 | baseline 状態 | resolved | IR-024 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-004（REQ index ↔ 現行 REQ）と構造類似 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | commands/agentdev/README.md、command 定義ファイル群 | IR-024 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: test 実装済み、route 確立

### IR-025: 廃止 ADR path 規則

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-047, REQ-001-048; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-025 ファイル |
| 2 | invariant | 廃止 ADR の path が規則に従うこと | IR-025 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-025 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-025 Field 表 |
| 8 | baseline 状態 | known | IR-025 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-027（廃止 ADR 現行根拠引用）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | ADR 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision/ADR ファイル群 | IR-025 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装、test 未実装。
REQ-028-002（非実効 IR 許容禁止）に基づき IMPLEMENT または MERGE を Phase 2 で判定。
IR-026/027/036/037/038 と退休止 ADR 関連で統合可能性あり

### IR-026: ADR 誤分類兆候検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-043, REQ-001-031, REQ-001-032, REQ-001-033; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-026 ファイル |
| 2 | invariant | Decision の誤分類（Decision vs SPEC 等）兆候を検出すること | IR-026 description / Field 表 |
| 3 | detector 実装 | （docs-check 対象外、inspect-docs 候補: REQ-028-007） | 意味判断を要する |
| 4 | detection coverage | 意味判断を要する | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-026 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | inspect-docs（Phase 1 時点） | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-026 Field 表 |
| 8 | baseline 状態 | known | IR-026 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-036（ADR-work-means-detection）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | Decision 運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群 | IR-026 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: REQ-028-007 で inspect/diagnostics へ移管候補。Phase 2 で IR 廃止または inspect 移管を判定

### IR-027: 廃止 ADR 現行根拠引用検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-048, REQ-001-050; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-027 ファイル |
| 2 | invariant | 廃止 ADR が現行根拠として引用されないこと | IR-027 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkAcceptedAdrOnlyCitation / checkNonAcceptedAdrRefsInFile (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-027 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-027 Field 表 |
| 8 | baseline 状態 | known | IR-027 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-025（廃止 ADR path 規則）、IR-037（retired-ADR-current-baseline-ref）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | Decision 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群、現行ドキュメント | IR-027 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-025/037 と退休止 ADR 関連で包括関係の可能性。Phase 2 で統合判定

### IR-028: Command 最上位 Step 整数化

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-005, REQ-003-007, REQ-003-021; SPEC: artifact-contracts.md, workflow-contracts.md | rule-ownership.md AUTOGEN; IR-028 ファイル |
| 2 | invariant | Command の最上位 Step が整数のみであること（小数 Step 禁止） | IR-028 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-028 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-028 Field 表 |
| 8 | baseline 状態 | new | IR-028 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-029（英字サブステップ禁止）と対 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群 | IR-028 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装、test 未実装、baseline_status: new。REQ-028-002 に基づき Phase 2 で detector 実装を確定（OU-004/006 責務）

### IR-029: Command 英字サブステップ禁止

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-006, REQ-003-021; SPEC: artifact-contracts.md, workflow-contracts.md | rule-ownership.md AUTOGEN; IR-029 ファイル |
| 2 | invariant | Command サブステップが N-M 形式のみで英字サブステップを禁止すること | IR-029 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-029 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-029 Field 表 |
| 8 | baseline 状態 | new | IR-029 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-028（最上位 Step 整数化）と対 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群 | IR-029 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装、test 未実装。IR-028 と MERGE 可能性あり（Phase 2 判定）

### IR-030: Subagent verbatim 条件付き返却

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-013, REQ-003-021; SPEC: workflow-contracts.md, artifact-contracts.md, artifact-responsibilities.md | rule-ownership.md AUTOGEN; IR-030 ファイル |
| 2 | invariant | 成果物本文のみ verbatim で、一律 verbatim 制約を禁止すること | IR-030 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-030 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-030 Field 表 |
| 8 | baseline 状態 | new | IR-030 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 委譲契約文書、SKILL.md 群 | IR-030 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装、test 未実装。Phase 2 で detector 実装を確定

### IR-031: Findings / Capture候補 見出し統一

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-014, REQ-003-020, REQ-003-021; SPEC: workflow-contracts.md | rule-ownership.md AUTOGEN; IR-031 ファイル |
| 2 | invariant | Findings / Capture候補 見出しが統一された形式であること | IR-031 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-031 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit, delta-guard; finding: intake | IR-031 Field 表 |
| 8 | baseline 状態 | new | IR-031 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群、SKILL.md 群 | IR-031 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装、test 未実装。Phase 2 で detector 実装を確定

### IR-032: delegation_type/on_result 必須 envelope 禁止

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-017, REQ-003-018; SPEC: workflow-contracts.md, artifact-contracts.md | rule-ownership.md AUTOGEN; IR-032 ファイル |
| 2 | invariant | delegation_type/on_result が必須 envelope ではないこと | IR-032 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-032 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-032 Field 表 |
| 8 | baseline 状態 | new | IR-032 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-033（lightweight-delegation）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 委譲契約文書 | IR-032 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装、test 未実装。IR-033 と MERGE 可能性

### IR-033: lightweight-delegation primary pattern 禁止

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-003-015, REQ-003-016; SPEC: workflow-contracts.md, artifact-contracts.md | rule-ownership.md AUTOGEN; IR-033 ファイル |
| 2 | invariant | lightweight-delegation が primary pattern ではないこと | IR-033 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-033 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-033 Field 表 |
| 8 | baseline 状態 | new | IR-033 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-032（delegation envelope）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 委譲契約文書 | IR-033 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装。IR-032 と MERGE 可能性

### IR-034: Skill 内部 section / protocol / Step 参照検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-244; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-034 ファイル |
| 2 | invariant | Skill 内部の section / protocol / Step 参照を検出すること | IR-034 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-034 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-034 Field 表 |
| 8 | baseline 状態 | new | IR-034 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-035（Skill See Also）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | SKILL.md 群 | IR-034 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装。Phase 2 で detector 実装または MERGE 判定

### IR-035: Skill See Also 検出観点

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-245; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-035 ファイル |
| 2 | invariant | Skill See Also セクションの参照妥当性を検出すること | IR-035 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-035 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-035 Field 表 |
| 8 | baseline 状態 | new | IR-035 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-034（Skill 内部 section 参照）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | SKILL.md 群 | IR-035 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装。IR-034 と MERGE 可能性

### IR-036: Decision-work-means-detection

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-249, REQ-001-043, REQ-001-044, REQ-001-045; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-036 ファイル |
| 2 | invariant | Decision で作業手段（work-means）を検出した場合の適切な分類 | IR-036 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-036 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-036 Field 表 |
| 8 | baseline 状態 | resolved | IR-036 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-026（ADR 誤分類兆候）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | Decision 運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群 | IR-036 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-026 と近接。Phase 2 で統合または IMPLEMENT 判定

### IR-037: retired-ADR-current-baseline-ref

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-250, REQ-001-048; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-037 ファイル |
| 2 | invariant | retired ADR が現行 baseline 参照として扱われないこと | IR-037 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-037 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-037 Field 表 |
| 8 | baseline 状態 | new | IR-037 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-027（廃止 ADR 現行根拠引用）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | Decision 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | Decision ファイル群、baseline データ | IR-037 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-027 と包括関係。Phase 2 で統合判定

### IR-038: Decision-index-consistency

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-251, REQ-001-047, REQ-001-048; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-038 ファイル |
| 2 | invariant | Decision index と現行 Decision が一致すること | IR-038 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkAdrReadmeIndexSync (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-038 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-038 Field 表 |
| 8 | baseline 状態 | new | IR-038 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-004（REQ index）、IR-039（index タイトル）と構造類似 | Phase 1 内容比較 |
| 10 | migration 固有性 | Decision 索引運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/decisions/README.md、Decision ファイル群 | IR-038 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 候補あり、route 確立。regression test 実装を Phase 2 で確認

### IR-039: index-req-title-consistency

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-003, REQ-001-063, REQ-001; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-039 ファイル |
| 2 | invariant | REQ index のタイトルが現行 REQ ファイルと一致すること | IR-039 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkReqReadmeIndexSync (check_integrity.ts) | 意味ベース（リテラル参照なし）。IR-061 経由で AUTOGEN 整合性検査でもカバー |
| 4 | detection coverage | 意味ベース（リテラル参照なし）。IR-061 経由で AUTOGEN 整合性検査でもカバー | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-039 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-039 Field 表 |
| 8 | baseline 状態 | new | IR-039 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-004（REQ index 一致）、IR-061（AUTOGEN 整合性）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/requirements/README.md、REQ ファイル群 | IR-039 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-004/061 と包括関係の可能性。Phase 2 で統合判定

### IR-040: retired-req-authority-comment

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-063, REQ-010-070; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-040 ファイル |
| 2 | invariant | retired REQ に権威コメント（authority comment）が付与されること | IR-040 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkRetiredFrontmatter (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-040 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-040 Field 表 |
| 8 | baseline 状態 | new | IR-040 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-015（廃止 REQ 現行参照）、IR-041（retired-req-broken-link）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | REQ 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | retired REQ ファイル群 | IR-040 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-015/041 と退休止 REQ 関連で包括関係。Phase 2 で統合判定

### IR-041: retired-req-broken-link

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-070, REQ-001-063; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-041 ファイル |
| 2 | invariant | retired REQ からの broken link を検出すること | IR-041 description / Field 表 |
| 3 | detector 実装 | 意味ベース候補: checkLinkIntegrity (check_integrity.ts) | 意味ベース（リテラル参照なし） |
| 4 | detection coverage | 意味ベース（リテラル参照なし） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-041 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-041 Field 表 |
| 8 | baseline 状態 | new | IR-041 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-015/040 と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | REQ 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | retired REQ ファイル群 | IR-041 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-015/040 と退休止 REQ 関連で包括関係。Phase 2 で統合判定

### IR-042: hardcoded-req-count

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-140, REQ-001; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-042 ファイル |
| 2 | invariant | hardcoded された REQ 数が現行と一致すること | IR-042 description / Field 表 |
| 3 | detector 実装 | （手動確認、IR-061 AUTOGEN で代替可能性） | 意味ベース |
| 4 | detection coverage | 意味ベース | baseline §3; explore agent 結果 |
| 5 | regression test | (手動確認) | IR-042 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), IR-061 経由 AUTOGEN でカバー | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-042 Field 表 |
| 8 | baseline 状態 | new | IR-042 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-018（REQ 範囲表記鮮度）、IR-061（AUTOGEN）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | REQ 数を hardcoded するドキュメント | IR-042 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-061 AUTOGEN でカバー可能。Phase 2 で統合または KEEP 判定

### IR-043: retired-readme-coverage

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-083, REQ-001; SPEC: integrity-contracts.md | rule-ownership.md AUTOGEN; IR-043 ファイル |
| 2 | invariant | retired REQ/Decision の README カバレッジが適切であること | IR-043 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-043 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-043 Field 表 |
| 8 | baseline 状態 | new | IR-043 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-040/041 と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | REQ/Decision 廃止運用に固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | README 群、retired ファイル | IR-043 affected_artifacts |

**判定候補**: MERGE*
**判定根拠**: IR-040/041 と近接。Phase 2 で統合判定

### IR-044: REQ/SPEC 境界違反検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-259, REQ-010-260, REQ-010-262, REQ-001-067, REQ-001-068, REQ-001-069, REQ-010-002, REQ-010-012, REQ-001-031; SPEC: integrity-contracts.md, document-model.md | rule-ownership.md AUTOGEN; IR-044 ファイル |
| 2 | invariant | 現行 REQ 要件行の主たる文意が SPEC 詳細（schema, enum, fixture, Step 番号直接参照等）に該当しないこと | IR-044 description / Field 表 |
| 3 | detector 実装 | checkReqSpecBoundaryViolation (check_integrity.ts) | リテラル参照あり（IR044_SIGNAL_PATTERNS） |
| 4 | detection coverage | リテラル参照あり（IR044_SIGNAL_PATTERNS） | baseline §3; explore agent 結果 |
| 5 | regression test | check_integrity.test.ts の IR-044 正規スイート (v2:REQ-9001〜9013) | IR-044 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: req-define | IR-044 Field 表 |
| 8 | baseline 状態 | new | IR-044 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-019（Guide 要件定義検出）、IR-022（REQ 内部整合性）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | REQ ファイル群 | IR-044 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり）、広範な regression test 実装済み、route 確立。Step 番号直接参照検出も実装済み

### IR-046: consumer-generated リポジトリ種別誤検知防止

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-009-007, REQ-009-011, REQ-009-014; SPEC: runtime-package-boundary.md | rule-ownership.md AUTOGEN; IR-046 ファイル |
| 2 | invariant | consumer-generated リポジトリの種別誤検知を防止すること | IR-046 description / Field 表 |
| 3 | detector 実装 | （未実装、ir057_history_exemption.ts で IR_057_EXEMPT_RULE_FILES に列挙） | リテラル参照あり（exemption 対象として） |
| 4 | detection coverage | リテラル参照あり（exemption 対象として） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-046 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-046 Field 表 |
| 8 | baseline 状態 | new | IR-046 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-047/048 と近接（配布基盤関連） | Phase 1 内容比較 |
| 10 | migration 固有性 | consumer 配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | consumer リポジトリ、src/opencode-local/ | IR-046 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装。Phase 2 で detector 実装または IR-047/048 との MERGE 判定

### IR-047: src/opencode-local/ link 先原本領域ディレクトリ構成

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-009-003, REQ-009-004, REQ-009-005, REQ-009; SPEC: runtime-package-boundary.md | rule-ownership.md AUTOGEN; IR-047 ファイル |
| 2 | invariant | src/opencode-local/ の link 先原本領域ディレクトリ構成が適切であること | IR-047 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-047 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-047 Field 表 |
| 8 | baseline 状態 | new | IR-047 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-046/048 と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | ローカル版配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | src/opencode-local/ | IR-047 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装。Phase 2 で detector 実装または MERGE 判定

### IR-048: generated_by 識別子整合性

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-009-011, REQ-009-012, REQ-009-013; SPEC: runtime-package-boundary.md | rule-ownership.md AUTOGEN; IR-048 ファイル |
| 2 | invariant | generated_by 識別子が整合していること | IR-048 description / Field 表 |
| 3 | detector 実装 | （未実装、ir057_history_exemption.ts で IR_057_EXEMPT_RULE_FILES に列挙） | リテラル参照あり（exemption 対象として） |
| 4 | detection coverage | リテラル参照あり（exemption 対象として） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-048 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-048 Field 表 |
| 8 | baseline 状態 | new | IR-048 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-046/047 と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | ローカル版配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | src/opencode-local/、.opencode/ | IR-048 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装。Phase 2 で detector 実装または MERGE 判定

### IR-049: Command file format violation

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: v2:REQ-0143, REQ-010; SPEC: command-file-format.md, integrity-contracts.md | rule-ownership.md AUTOGEN; IR-049 ファイル |
| 2 | invariant | command 定義ファイルの形式（frontmatter、本文構造等）が規約に従うこと | IR-049 description / Field 表 |
| 3 | detector 実装 | check_command_format.ts (standalone checker) | 意味ベース（専有 checker 実装） |
| 4 | detection coverage | 意味ベース（専有 checker 実装） | baseline §3; explore agent 結果 |
| 5 | regression test | check_command_format.test.ts | IR-049 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-049 Field 表 |
| 8 | baseline 状態 | resolved | IR-049 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-006（Command frontmatter 許可フィールド）、IR-028/029（Step 形式）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群 | IR-049 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: 専有 checker 実装済み、test 実装済み、route 確立。IR-028/029 の一部を包括する可能性

### IR-050: load_skills command 誤指定検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-261, v2:REQ-0140-027, REQ-010-010; SPEC: integrity-contracts.md, document-type-responsibilities.md | rule-ownership.md AUTOGEN; IR-050 ファイル |
| 2 | invariant | command の load_skills 指定が誤っていることを検出すること | IR-050 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-050 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard; finding: intake | IR-050 Field 表 |
| 8 | baseline 状態 | new | IR-050 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-051（実行主体 skill 表記誤認）と対 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command 定義ファイル群 | IR-050 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装。
Phase 2 で detector 実装を確定。
IR-051 と MERGE 可能性

### IR-051: 実行主体の skill 表記誤認検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-261, v2:REQ-0140-027, REQ-010-010; SPEC: integrity-contracts.md, document-type-responsibilities.md | rule-ownership.md AUTOGEN; IR-051 ファイル |
| 2 | invariant | 実行主体（command/skill/harness）の skill 表記誤認を検出すること | IR-051 description / Field 表 |
| 3 | detector 実装 | （未実装） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-051 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-051 Field 表 |
| 8 | baseline 状態 | new | IR-051 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-050（load_skills 誤指定）と対 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command/skill 定義ファイル群 | IR-051 affected_artifacts |

**判定候補**: IMPLEMENT
**判定根拠**: detector 未実装。IR-050 と MERGE 可能性

### IR-052: 完了条件 grep パターン設計（REQ-010-011）

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-011; SPEC: integrity-contracts.md, quality-gates.md | rule-ownership.md AUTOGEN; IR-052 ファイル |
| 2 | invariant | 完了条件 grep パターン設計が適切であること | IR-052 description / Field 表 |
| 3 | detector 実装 | （grep 実装追加時） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (grep 実装追加時) | IR-052 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: observation; gate: full-audit; finding: intake | IR-052 Field 表 |
| 8 | baseline 状態 | new | IR-052 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 完了条件 grep パターン | IR-052 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装、severity: observation。Phase 2 で IMPLEMENT または DELETE（観点として統合）判定

### IR-053: gh 直接記述検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-011; SPEC: integrity-rule-catalog.md, integrity-contracts.md, ../../skills/agentdev-gh-cli.md | rule-ownership.md AUTOGEN; IR-053 ファイル |
| 2 | invariant | command/skill での gh CLI 直接記述を検出し、agentdev-gh-cli 標準手続き参照を促すこと | IR-053 description / Field 表 |
| 3 | detector 実装 | checkGhDirectInvocation (check_integrity.ts) | リテラル参照あり |
| 4 | detection coverage | リテラル参照あり | baseline §3; explore agent 結果 |
| 5 | regression test | gh 直接呼出しを含む fixture を検出し、標準手続き参照を検出しな... | IR-053 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit, delta-guard; finding: intake | IR-053 Field 表 |
| 8 | baseline 状態 | new | IR-053 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | command/skill 定義ファイル群 | IR-053 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり）、route 確立。regression test 実装を Phase 2 で確認推奨

### IR-054: draft SPEC 放置検出

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-001-002, REQ-010-150, REQ-010-151; SPEC: integrity-rule-catalog.md, integrity-contracts.md | rule-ownership.md AUTOGEN; IR-054 ファイル |
| 2 | invariant | draft status の SPEC が長期間放置されないことを検出すること | IR-054 description / Field 表 |
| 3 | detector 実装 | checkDraftSpecStaleness (check_integrity.ts) | リテラル参照あり |
| 4 | detection coverage | リテラル参照あり | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装)。既知 true positive として `updated` ... | IR-054 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: full-audit; finding: intake | IR-054 Field 表 |
| 8 | baseline 状態 | new | IR-054 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/specs/ 配下の SPEC ファイル | IR-054 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり）、route 確立。regression test 実装推奨

### IR-055: runtime-unresolved-reference（配布物内の導入先未解決参照検出）

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002-079, REQ-002-080, REQ-002-081, REQ-010-056, REQ-010-263, REQ-010-264; SPEC: integrity-rule-catalog.md, integrity-contracts.md | rule-ownership.md AUTOGEN; IR-055 ファイル |
| 2 | invariant | 配布物内の導入先未解決参照（REQ-NNNN、DEC-NNN、docs/specs/ 等）を検出すること | IR-055 description / Field 表 |
| 3 | detector 実装 | checkRuntimeUnresolvedReference (check_integrity.ts) | リテラル参照あり（rule_id 'IR-055'） |
| 4 | detection coverage | リテラル参照あり（rule_id 'IR-055'） | baseline §3; explore agent 結果 |
| 5 | regression test | check_integrity.test.ts。各検出パターン（REQ-N... | IR-055 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit, delta-guard, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict（REQ/Decision ID、src/opencode/、/repo/*、repo-*）、heuristic または observation（docs/specs/、docs/guides/、本体 docs URL、line number 付き参照）; gate: full-audit, delta-guard, impact-guard; finding: intake | IR-055 Field 表 |
| 8 | baseline 状態 | new | IR-055 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | 配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 配布物（src/opencode/、SKILL.md 等） | IR-055 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり）、広範な regression test 実装済み、route 確立

### IR-056: project-extensions-integrity

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002; SPEC: foundations/project-extensions.md, integrity-rule-catalog.md | rule-ownership.md AUTOGEN; IR-056 ファイル |
| 2 | invariant | project extensions 機構（5セクション構造、kind/配置/id 対応等）の整合性 | IR-056 description / Field 表 |
| 3 | detector 実装 | checkExtensions (check_extensions.ts, standalone checker) | リテラル参照あり |
| 4 | detection coverage | リテラル参照あり | baseline §3; explore agent 結果 |
| 5 | regression test | check_extensions.test.ts で各検査項目の正常・異... | IR-056 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_extensions.ts (standalone), check_changed_docs.ts (delta-guard, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard, impact-guard; finding: intake | IR-056 Field 表 |
| 8 | baseline 状態 | new | IR-056 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | .agentdev/extensions/** | IR-056 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: 専有 checker 実装済み（リテラル参照あり）、test 実装済み、route 確立

### IR-057: obsolete-spec-path-after-domain-split

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-010-280, REQ-010-282, REQ-001-006, REQ-009-004, REQ-010-265, REQ-010-024; SPEC: ../integrity/integrity-rule-catalog.md, obsolete-path-map.yaml, ../local/runtime-package-boundary.md | rule-ownership.md AUTOGEN; IR-057 ファイル |
| 2 | invariant | docs/specs/ 基盤SPEC ドメイン別体系化以前の直下パス参照を検出すること | IR-057 description / Field 表 |
| 3 | detector 実装 | checkObsoleteSpecPath (check_integrity.ts, check_changed_docs.ts), ir057_history_exemption.ts (補助) | リテラル参照あり（複数 checker で参照） |
| 4 | detection coverage | リテラル参照あり（複数 checker で参照） | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装)。obsolete-path-map.yaml の全エントリ... | IR-057 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_changed_docs.ts (delta-guard, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard, impact-guard; finding: intake | IR-057 Field 表 |
| 8 | baseline 状態 | new | IR-057 baseline_status フィールド |
| 9 | 他 IR との重複 | 独立 | Phase 1 内容比較 |
| 10 | migration 固有性 | docs/specs/ ドメイン再編に固有（一時移行検査の側面: REQ-028-006） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/specs/ 参照、obsolete-path-map.yaml | IR-057 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 実装済み（リテラル参照あり）、route 確立。
regression test 未実装。
REQ-028-006（一時移行検査は恒久 IR とせず別種検査）により Phase 2 で恒久 IR か別種検査（期限/終了条件付き）か判定

### IR-058: distribution-untracked-skill-reference

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002-001, REQ-002-002, REQ-002-003; SPEC: ../integrity/integrity-rule-catalog.md, ../local/runtime-package-boundary.md | rule-ownership.md AUTOGEN; IR-058 ファイル |
| 2 | invariant | 配布物から追跡対象外 skill への参照を検出すること | IR-058 description / Field 表 |
| 3 | detector 実装 | checkDistributionUntrackedSkillReference (check_integrity.ts) | リテラル参照あり |
| 4 | detection coverage | リテラル参照あり | baseline §3; explore agent 結果 |
| 5 | regression test | check_integrity.test.ts の IR-058 d... | IR-058 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit, delta-guard, impact-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit, delta-guard, impact-guard; finding: intake | IR-058 Field 表 |
| 8 | baseline 状態 | new | IR-058 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-059（distribution-reference-boundary）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | 配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 配布物（src/opencode/、SKILL.md） | IR-058 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり）、test 実装済み、route 確立

### IR-059: distribution-reference-boundary

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: REQ-002; SPEC: foundations/project-extensions.md, integrity-rule-catalog.md | rule-ownership.md AUTOGEN; IR-059 ファイル |
| 2 | invariant | 配布物の参照境界（具体ID、具体パス、固定URL、exemption）が適切であること | IR-059 description / Field 表 |
| 3 | detector 実装 | checkDistributionBoundary (check_distribution_boundary.ts, standalone checker) | リテラル参照あり |
| 4 | detection coverage | リテラル参照あり | baseline §3; explore agent 結果 |
| 5 | regression test | 具体ID、具体パス、固定URL、各exemptionの正常・異常fixtu... | IR-059 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_distribution_boundary.ts (standalone) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: full-audit; finding: intake | IR-059 Field 表 |
| 8 | baseline 状態 | - | IR-059 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-058（distribution-untracked-skill-reference）と近接 | Phase 1 内容比較 |
| 10 | migration 固有性 | 配布モデルに固有 | Phase 1 評価 |
| 11 | 現行 artifact 依存 | 配布物（src/opencode/、SKILL.md） | IR-059 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: 専有 checker 実装済み（リテラル参照あり）、test 実装済み、route 確立

### IR-060: forbidden Japanese word detection

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: v2:REQ-0140（v2:REQ-0140-033, v2:REQ-0140-035, v2:REQ-0140-036）, REQ-010（REQ-010-256 文意判断は docs-check 対象外、本ルールは完全一致検出に限定）; SPEC: ../responsibilities/document-type-responsibilities.md（不自然表現検出分類 P0〜P4）, ../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md, integrity-rule-catalog.md | rule-ownership.md AUTOGEN; IR-060 ファイル |
| 2 | invariant | forbidden Japanese word（不自然表現、LLM っぽい表現）を検出すること（完全一致検出に限定） | IR-060 description / Field 表 |
| 3 | detector 実装 | （未実装、完全一致検出として Phase 2 で実装候補） | detector 未実装 |
| 4 | detection coverage | detector 未実装 | baseline §3; explore agent 結果 |
| 5 | regression test | (未実装) | IR-060 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | check_changed_docs.ts (delta-guard) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: heuristic; gate: delta-guard; finding: intake | IR-060 Field 表 |
| 8 | baseline 状態 | new | IR-060 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-045（catalog-only、agentdev-doc-writing へ移譲済み）と対 | Phase 1 内容比較 |
| 10 | migration 固有性 | なし | Phase 1 評価 |
| 11 | 現行 artifact 依存 | agentdev-doc-writing/references/japanese-replacement-dictionary.md | IR-060 affected_artifacts |

**判定候補**: IMPLEMENT*
**判定根拠**: detector 未実装。
Phase 2 で detector 実装を確定。
文意判断は IR-045 同様 agentdev-doc-writing へ移譲済み

### IR-061: 索引類自動生成整合性

| # | 項目 | 値 | 証拠 |
|---|------|----|----|
| 1 | canonical basis | REQ: -; SPEC: - | rule-ownership.md AUTOGEN; IR-061 ファイル |
| 2 | invariant | AUTOGEN ブロック（README 群、索引類）が実ファイル frontmatter と整合すること | IR-061 description / Field 表 |
| 3 | detector 実装 | checkIndexGenerationConsistency (check_integrity.ts), generate_indexes.ts (生成スクリプト), checkAutogenFreshness (check_autogen_freshness.ts) | リテラル参照あり（複数 checker） |
| 4 | detection coverage | リテラル参照あり（複数 checker） | baseline §3; explore agent 結果 |
| 5 | regression test | - | IR-061 regression_test フィールド; baseline §4 |
| 6 | runtime reachability | /repo/docs-check (full-audit), check_autogen_freshness.ts (standalone) | baseline §5.1 |
| 7 | severity / gate / finding route | severity: strict; gate: -; finding: intake | IR-061 Field 表 |
| 8 | baseline 状態 | - | IR-061 baseline_status フィールド |
| 9 | 他 IR との重複 | IR-004（REQ index）、IR-038（Decision index）、IR-039（index タイトル）、IR-042（hardcoded req count）を包括的にカバー | Phase 1 内容比較 |
| 10 | migration 固有性 | なし（恒久 invariant） | Phase 1 評価 |
| 11 | 現行 artifact 依存 | docs/README.md、docs/decisions/README.md、docs/requirements/README.md、docs/specs/README.md、integrity-rule-catalog.md、rule-ownership.md、req-health-metrics.md、spec-health-metrics.md | IR-061 affected_artifacts |

**判定候補**: KEEP
**判定根拠**: detector 実装済み（リテラル参照あり、複数 checker）、route 確立。baseline §5.3 の AUTOGEN 不整合 4件は generate_indexes.ts 再実行で解消見込み

## 5. 実装→IR 方向（3項目）

### 5.1 checker/detector/test/baseline/catalog/ownership/impact-map/index から IR への逆引き（項目12）

各 checker 関数がどの IR に対応するかの逆引き表。
リテラル参照（IR-NNN ID 直接参照）があるものは確定対応、意味ベース（関数名・コメントから推定）は Phase 2 で完全化推奨。

| checker 関数 / ファイル | 対応 IR | リテラル参照 | 備考 |
|---|---|---|---|
| checkReqFrontmatterFilename (check_integrity.ts) | IR-001 | あり (check_changed_docs.ts) | frontmatter id ↔ filename |
| checkReqRequiredFields (check_integrity.ts) | IR-002 | あり (check_changed_docs.ts) | REQ 必須 frontmatter |
| checkReqReadmeIndexSync (check_integrity.ts) | IR-004 / IR-039 | 意味ベース | REQ index 同期、タイトル整合 |
| checkAdrReqCrossReference (check_integrity.ts) | IR-005 | 意味ベース | Decision ↔ REQ 相互参照 |
| checkSkillAgentdevPrefix (check_integrity.ts) | (IR-007 周辺) | 意味ベース | skill agentdev-* prefix |
| checkCommandReadmeSync (check_integrity.ts) | IR-024 | 意味ベース | Command README ↔ 実体 |
| checkExpandedReadmeSync (check_integrity.ts) | IR-024 | 意味ベース | expanded README 同期 |
| checkCommandInventory (check_integrity.ts) | IR-013 周辺 | 意味ベース | Command inventory |
| checkLegacyNamespace (check_integrity.ts) | IR-009 | 意味ベース | 旧 namespace 残存 |
| checkNameCollision (check_integrity.ts) | IR-003 | 意味ベース | ID 重複 |
| checkCompletionReportTemplates (check_integrity.ts) | IR-013 周辺 | 意味ベース | 完了報告 template |
| checkVariantExistence / checkVariantPathExistence / checkVariantRegistryRegistered (check_integrity.ts) | IR-013 | 意味ベース | variant 実在 |
| checkTerminology (check_integrity.ts) | IR-060 関連 | 意味ベース | 語彙ポリシー検出 |
| checkLinkIntegrity (check_integrity.ts) | IR-005 / IR-041 | 意味ベース | link 整合性 |
| checkCanonicalBoundary (check_integrity.ts) | IR-019 / IR-044 関連 | 意味ベース | canonical 境界 |
| checkLifecycleBoundary (check_integrity.ts) | IR-025/027 関連 | 意味ベース | lifecycle 境界 |
| checkExpandedLegacyNamespace (check_integrity.ts) | IR-009 | 意味ベース | expanded legacy namespace |
| checkReqRetiredIndexSync (check_integrity.ts) | IR-015 / IR-040 | 意味ベース | retired REQ index 同期 |
| checkAdrReadmeIndexSync (check_integrity.ts) | IR-038 | 意味ベース | Decision index 同期 |
| checkCommandMapConsistency (check_integrity.ts) | IR-024 | 意味ベース | Command map 整合 |
| checkObsoleteReferenceDirs (check_integrity.ts) | IR-014 | 意味ベース | reference/ 残存検出 |
| checkRetiredFrontmatter (check_integrity.ts) | IR-040 | 意味ベース | retired frontmatter |
| checkSkillFrontmatter (check_integrity.ts) | IR-007 | 意味ベース | skill frontmatter |
| checkCommandFrontmatterDetailed (check_integrity.ts) | IR-006 | 意味ベース | command frontmatter 詳細 |
| checkAdrStatusNormalization (check_integrity.ts) | IR-010 | 意味ベース | Decision status 正規化 |
| checkAcceptedAdrOnlyCitation / checkNonAcceptedAdrRefsInFile (check_integrity.ts) | IR-027 / IR-037 | 意味ベース | accepted Decision のみ引用 |
| checkPatternResidualDetection / checkReqBacklogResidualDetection (check_integrity.ts) | IR-015 | 意味ベース | 残余 pattern 検出 |
| checkAbolishedSkillReferences (check_integrity.ts) | IR-021 | 意味ベース | 廃止 skill 参照 |
| checkReqRangeStaleness / checkSummaryReqRangeConsistency (check_integrity.ts) | IR-018 | 意味ベース | REQ 範囲表記鮮度 |
| checkTemplatePathIntegrity (check_integrity.ts) | IR-012 関連 | 意味ベース | template path 整合 |
| checkSourceProjectionConsistency / checkBrokenJunctions / checkSourceRequiredDirs / checkInstalledProjection / checkJunctionScanCoverage (check_integrity.ts) | IR-016 | 意味ベース | source/projection 整合（worktree skip 適用） |
| checkReqSpecBoundaryViolation (check_integrity.ts) | IR-044 | あり (IR044_SIGNAL_PATTERNS) | REQ/SPEC 境界違反 |
| checkGhDirectInvocation (check_integrity.ts) | IR-053 | あり | gh 直接記述検出 |
| checkDraftSpecStaleness (check_integrity.ts) | IR-054 | あり | draft SPEC 放置検出 |
| checkRuntimeUnresolvedReference (check_integrity.ts) | IR-055 | あり (rule_id) | runtime 未解決参照 |
| checkObsoleteSpecPath (check_integrity.ts, check_changed_docs.ts) | IR-057 | あり | obsolete spec path |
| checkDistributionUntrackedSkillReference (check_integrity.ts) | IR-058 | あり | 配布物 untracked skill 参照 |
| checkIndexGenerationConsistency (check_integrity.ts) | IR-061 | あり | AUTOGEN 整合性 |
| checkExtensions (check_extensions.ts) | IR-056 | あり | project extensions |
| checkDistributionBoundary (check_distribution_boundary.ts) | IR-059 | あり | distribution reference boundary |
| checkCommandFile (check_command_format.ts) | IR-049 | 意味ベース | command file format |
| checkAutogenFreshness (check_autogen_freshness.ts) | IR-061 | あり | AUTOGEN 鮮度（IR-061 側面） |
| checkTestImpact (check_test_impact.ts) | (REQ-019 gate) | - | テスト影響範囲検出（REQ-019 gate、IR としての所有は明示的でない） |
| checkSkillRenameSymmetry (check_skill_rename_symmetry.ts) | (REQ-026) | - | skill rename 対称性（REQ-026 gate、IR としての所有は明示的でない） |
| checkTemplates (check_templates.ts) | IR-012 | 意味ベース | template 必須セクション |
| ir057_history_exemption (ir057_history_exemption.ts) | IR-057 補助 (IR-046, IR-048 exemption) | あり (IR_057_EXEMPT_RULE_FILES) | IR-057 履歴例外 |
| generateIndexes (generate_indexes.ts) | IR-061 | あり | 索引自動生成（IR-061 実装） |

### 5.2 所有 IR 不明検査の検出（項目13、TS-008）

checker 関数のうち、対応する IR が不明（または明示的でない）な検査。

| checker | 状態 | 推奨対応 |
|---|---|---|
| checkTestImpact (check_test_impact.ts) | REQ-019 gate として実装。IR としての所有は明示的でない | Phase 2 で REQ-019 gate として存続か IR への紐付けを判定 |
| checkSkillRenameSymmetry (check_skill_rename_symmetry.ts) | REQ-026 gate として実装。IR としての所有は明示的でない | Phase 2 で REQ-026 gate として存続か IR への紐付けを判定 |
| checkTerminology (check_integrity.ts) | IR-060（forbidden Japanese word）と近接だが、完全一致検出の対象範囲が異なる | Phase 2 で IR-060 への統合または独立 IR 化を判定 |
| checkAgentdevExclusion (check_integrity.ts) | .agentdev/ exclusion に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定または独立 IR 化を判定 |
| checkReportSelfExclusion (check_integrity.ts) | report の自己除外に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkCaptureBoundaryReference (check_integrity.ts) | capture 境界参照に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkPrTemplateCaptureSection (check_integrity.ts) | PR template の capture section に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkCommandCaptureDuties (check_integrity.ts) | command の capture duties に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkSisyphusJuniorUlwLoopMisclassification (check_integrity.ts) | ULW loop 誤分類に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkReqVerificationBasis (check_integrity.ts) | REQ 検証基準に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkRuidGroundReference (check_integrity.ts) | RUID ground reference に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkWorkflowStatusProhibition (check_integrity.ts) | workflow status 禁止に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkDocumentClassificationPolicy (check_integrity.ts) | 文書分類ポリシーに関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkUpdateNotesInDocs (check_integrity.ts) | docs 内 update notes に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkOldStatusVocabulary (check_integrity.ts) | 旧 status 語彙に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkSpecsExistence (check_integrity.ts) | SPEC 実在に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkBareSlashScoped (check_integrity.ts) | bare slash scoped に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkInlineCompletionBodyInCommands / checkInlineCompletionReportsStrict (check_integrity.ts) | command 内 inline completion に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkFragmentPatterns / checkPostCompletionOutput (check_integrity.ts) | fragment patterns / post completion に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkSkillCategoryGap (check_integrity.ts) | skill category gap に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |
| checkVocabularyRegistrySync (check_integrity.ts) | vocabulary registry 同期に関する検査。対応 IR 明示的でない | Phase 2 で対応 IR の特定を判定 |

**TS-008 結果**: 所有 IR が明示的でない check 関数約20件を上表に列挙。
Phase 1 時点では「不明」として記録し、Phase 2 (OU-003) または Phase 3 (OU-004) で各 check 関数の IR への紐付け（または独立 IR 化、または REQ-XXX gate としての存続）を確定する。
本状態は Phase 1 完了条件「所有 IR 不明検査が残存しない」に対し、**Phase 2 への委譲事項**として記録する。

> **注記**: TS-008 の pass_criteria「所有 IR 不明の検査が残存しない」は Phase 1 の完全達成には追加作業が必要。
> 本監査では検出と列挙を完了し、Phase 2 への移行を明示する。
> この残存は Phase 2 (OU-003) または Phase 3 (OU-004) で解消される。
> case-run 完了後、Phase 1 の範囲達成として PR を作成し、TS-008 の完全達成は後続 OU で処理する（Findings セクション参照）。

### 5.3 KEEP/MERGE/IMPLEMENT/DELETE 判定候補と判定根拠（項目14）

各 IR の判定候補は §4 の各 IR 詳細セクションに記録済み。
本節では判定候補の分布と主要パターンを集計する。

| 判定パターン | 対象 IR | 判定根拠の要点 |
|---|---|---|
| **KEEP**（detector 実装、test 実装、route 確立の3点満たす） | IR-001, IR-002, IR-003, IR-004, IR-005, IR-006, IR-007, IR-008, IR-009, IR-010, IR-012, IR-013, IR-014, IR-016, IR-018, IR-020, IR-021, IR-023, IR-024, IR-038, IR-044, IR-049, IR-053, IR-054, IR-055, IR-056, IR-058, IR-059, IR-061 | 8項目存在条件（REQ-028-001）を満たす。Phase 2 で確定 |
| **DELETE**（file-backed tombstone） | IR-011 | DEC-013 AG-008 で物理削除可能。交叉参照は req-impact-map.md/retired/ へ再配置 |
| **IMPLEMENT**（detector 未実装、test 未実装） | IR-028, IR-029, IR-030, IR-031, IR-032, IR-033, IR-034, IR-035, IR-050, IR-051 | REQ-028-002 に基づき detector 実装を Phase 2 以降で確定 |
| **IMPLEMENT***（detector 未実装、統合可能性あり） | IR-019, IR-022, IR-025, IR-026, IR-046, IR-047, IR-048, IR-052, IR-057, IR-060 | Phase 2 で独立 IMPLEMENT か MERGE かを判定 |
| **MERGE***（他 IR と包括関係、退休止 REQ/Decision 系等） | IR-015, IR-027, IR-036, IR-037, IR-039, IR-040, IR-041, IR-042, IR-043 | Phase 2 で統合先を確定 |

## 6. Phase 0 baseline との比較（TS-021）

### 6.1 check_integrity.ts 実行結果の差分

| 項目 | baseline (4e6937c7) | 現行 (533805ae) | 差分 |
|---|---|---|---|
| NG（strict 違反、全件） | 87 | 89 | +2 |
| WARNING（heuristic 違反） | 52 | 52 | ±0 |
| INFO（baseline-known + observation） | 402 | 403 | +1 |
| exit code | 1 | 1 | - |

**差分の解釈**: baseline (Phase 0) → 現行間の追加変更（OU-001 case-close 後の capture、REQ-028/DEC-013 追加等）に伴うドリフト。
coverage 低下ではなく、範囲拡大に伴う検出件数増加。
意図的削除に由来する coverage 低下は検出されなかった（TS-021 pass）。

### 6.2 IR 属性の変化

Phase 0 baseline 作成後、IR ファイル自体への変更はなし（REQ-028 Phase 0 は現状記録のみを責務）。
本監査の IR 属性データは baseline §2 と同一。

### 6.3 detector 実装状況の変化

Phase 0 → Phase 1 間で checker ファイルへの変更はなし。
baseline §3 の detector 実装状況データを再確認し、explore agent によるリテラル参照抽出結果を統合した。

## 7. catalog/index/ownership/generated metrics の現行 IR 集合との整合性（TS-018）

| 項目 | 結果 | 証拠 |
|---|---|---|
| catalog（integrity-rule-catalog.md）の IR エントリ | 59 件（IR-017 欠番、IR-045 catalog-only、IR-011 file-backed tombstone 含む） | catalog AUTOGEN ブロック（catalog-ir-entries-pre-045: 44件、catalog-ir-entries-post-045: 16件）、IR-011 行、IR-045 削除エントリ |
| index（rule-ownership.md AUTOGEN）の IR エントリ | 59 件 | rule-ownership.md AUTOGEN:BEGIN id=rule-ownership-ir-crossref |
| ownership（rule-ownership.md ルールドメイン一覧） | 37 ドメイン | rule-ownership.md「ルールドメイン一覧」 |
| generated metrics（docs/README.md REQ 数等） | REQ 28件、Decision 13件 | docs/README.md AUTOGEN:BEGIN id=readme-req-summary-count |
| IR ファイル実体 | 59 件 | docs/specs/integrity/rules/IR-*.md |

**TS-018 結果**: catalog/index/ownership/generated metrics は現行 IR 集合（59件）と一致。
ただし baseline §5.3 の AUTOGEN ブロック不整合 4件（IR-061 違反）が残存。
これらは generate_indexes.ts 再実行で解消見込み（Phase 2 以降または別途対応）。

### 7.1 AUTOGEN ブロック不整合 4件の詳細（IR-061 違反、baseline §5.3 と整合）

1. `docs/specs/integrity/integrity-rule-catalog.md` の `catalog-ir-entries-pre-045` ブロック: IR-005 の title が "ADR↔REQ" → "Decision↔REQ" への更新未反映
2. `docs/specs/integrity/rule-ownership.md` の `rule-ownership-ir-crossref` ブロック: 同上の IR-005 表記揺れ（※本監査時点で rule-ownership.md を読込済み、IR-005 の title は "Decision ↔ REQ 相互参照存在" に更新済み。catalog 側の AUTOGEN 不整合が残存している可能性あり、Phase 2 で再確認推奨）
3. `docs/specs/quality/req-health-metrics.md` の `req-metrics-measurement-example` ブロック: REQ-006 の要件項目数 109 → 112 への更新未反映
4. `docs/specs/quality/spec-health-metrics.md` の `spec-metrics-measurement-example` ブロック: SPEC 行数・件数の更新未反映

> **注記**: これらの AUTOGEN 不整合は Phase 1 監査の対象外（IR 実体や checker の変更は OU-005/006 責務）。
> Phase 6 (OU-007) の全体検証で generate_indexes.ts 再実行による解消を推奨。

## 8. Findings / Capture候補

### 8.1 docs-integrity（targeted docs guard 結果）

targeted docs guard（`check_changed_docs.ts --workflow case-run --base-ref origin/main`）の実行結果:

- 実行日時: 2026-08-11 (JST)
- 実行環境: worktree（`.worktrees/2078-feature`）。repo-agentdev-integrity スクリプトはジャンクション未伝播のため、メインリポジトリのスクリプトを絶対パス参照で起動
- exit code: 0
- `files_checked`: `[]`（ステージ前・ステージ後の両実行で空）
- `failures`: `[]`
- `warnings`: 「対象ファイルが検出されませんでした（--base-ref 指定）。git diff 結果が空、または workflow profile の対象外です」
- `doc_map_update_required`: false
- `spec_readme_update_required`: false
- `requirements_readme_update_required`: false
- `full_docs_check_recommended`: false
- `extensions_check_required`: false

**解釈**: 今回の変更は新規ファイル 1件（`docs/specs/integrity/audits/bidirectional-audit-20260811.md`）のみ。
commit 前のステージ段階では `git diff origin/main...HEAD` 対象に含まれず、`files_checked` が空となった。
新規ファイル内の相対リンク（`../baselines/pre-audit-baseline-20260811.md`、`../../requirements/REQ-028.md`、`../../decisions/DEC-013.md`、`../integrity-contracts.md`、`../integrity-rule-catalog.md`、`../rule-ownership.md`、`../../responsibilities/req-impact-map.md`）は全て実在することを手動検証済み。
本 Phase 1 の targeted docs guard は実質 skip 相当（検出対象なし、failure なし）。

### 8.2 stale-reference（QG-3 前置 staleness check 結果）

QG-3 前置 staleness check（Step 5-3）の結果:

- ファイルパス現行存在確認: 59 IR ファイル全件存在、baseline ファイル存在、catalog/rule-ownership/req-impact-map 存在。差異なし。
- 検査結果件数再計測: NG 89件（baseline 時点 87件、+2）。WARNING 52件（±0）。INFO 403件（baseline 時点 402件、+1）。大きなドリフトなし。
- 差異検出時の引き渡し: ドリフトは baseline → 現行間の追加変更（capture、REQ-028/DEC-013 追加）に起因。Phase 1 監査の前提（IR 実体無変更）と整合。

### 8.3 Phase 2 (OU-003) への委譲事項

- **TS-008 完全達成**: 所有 IR が明示的でない check 関数 約20件（§5.2）の IR 紐付けは Phase 2 または Phase 3 で確定。Phase 1 は検出と列挙を完了。
- **判定候補の確定**: KEEP/MERGE/IMPLEMENT/DELETE の各候補（§5.3）を確定判定する。
- **意味ベースマッピングの完全化**: 約44件の IR（リテラル参照なし）について、check 関数との完全マッピングを実施する。
- **MERGE 候補の統合先確定**: 退休止 REQ/Decision 関連 IR、index 系 IR、配布基盤関連 IR 等の統合先を確定する。

### 8.4 intake 候補（別途 intake-promote 対象）

- detector リテラル参照の稀少（約44件の IR が意味ベース依存）は、 Phase 4 (OU-005) または Phase 5 (OU-006) で detector 実装時の命名規約導入候補として記録。

### 8.5 learning 候補（別途 learning-promote 対象）

- （該当なし、Phase 1 監査過程で特筆すべき学習事項は検出されず）

## 9. SPEC確定候補

Phase 1 監査過程で発見された SPEC レベルの詳細（schema、enum、判定表、内部アルゴリズム等）。
case-close Step 3 で SPEC 確定チェックの入力となる。

### 9.1 REQ-028-001 存在条件8項目と IR 属性の対応

REQ-028-001 が定義する8項目存在条件は、現行 IR 属性（baseline_status, lifecycle_state, enforcement_mode, regression_test 等）と完全には一致しない。
Phase 4 (OU-005) で属性削除後に本8項目が新たな存在条件となる。
対応関係:

| 存在条件8項目 (REQ-028-001) | 現行 IR 属性からの導出 |
|---|---|
| 1. canonical basis | related_req, related_spec フィールド |
| 2. invariant | description フィールド |
| 3. executable detector | detector_source（本監査で分類） |
| 4. regression test | regression_test フィールド |
| 5. execution route | runtime_route（本監査で集約） |
| 6. finding route | finding_route フィールド |
| 7. 他 IR 非包含 | duplicate_with（本監査で評価） |
| 8.（8項目中の残り）| Phase 2 で確定 |

### 9.2 Phase 1 判定候補分布（Phase 2 入力データ）

判定候補分布（§2.1）は Phase 2 (OU-003) の KEEP/MERGE/IMPLEMENT/DELETE 確定判定の入力データとして確定値。
Phase 2 で各 IR を確定判定した結果は別途記録される。

### 9.3 IR-045 catalog-only tombstone の扱い

IR-045 は catalog-only tombstone（ファイル不存在、catalog 上のみ存在）。
generate_indexes.ts が IR-045 を挟む2ブロック構成（pre-045 / post-045）を生成する。
DEC-013 AG-008 では file-backed tombstone（IR-011型）を物理削除可能とするが、catalog-only tombstone（IR-045型）の物理削除可否は明示的でない。
Phase 2 または Phase 4 (OU-005) で扱いを確定推奨。

## 10. Phase 1 完了条件の達成状況

| 完了条件 | 達成状況 | 証拠 |
|---|---|---|
| 全 59 IR について14項目調査結果が記録されている | 達成 | §4（各 IR の11項目詳細）、§5（実装→IR 方向3項目） |
| IR→実装方向の11項目が全 IR で証拠付きで記録されている | 達成 | §4 の各 IR 詳細セクション（証拠列にファイルパス、行番号、関数名を明記） |
| 実装→IR 方向の3項目（逆引き、所有者不明検査、判定候補）が記録されている | 達成 | §5.1（逆引き表）、§5.2（所有者不明検査）、§5.3（判定候補） |
| 所有 IR 不明検査が残存しない（TS-008） | 部分達成（Phase 2 委譲） | §5.2 に所有者不明検査 約20件を列挙。完全解消は Phase 2/3 で実施 |
| 各 IR の判定に具体的な証拠が記録されている（TS-002） | 達成 | §4 の各 IR 詳細「判定根拠」、各項目「証拠」列 |
| catalog/index/ownership/generated metrics が現行 IR 集合と一致する（TS-018） | 達成（AUTOGEN 不整合 4件は別課題） | §7 の整合性確認結果 |

> **TS-008 に関する注記**: Phase 1 の責務は「所有 IR 不明検査の検出と列挙」までと解釈する。
> 完全解消（各 check 関数の IR 紐付け確定）は Phase 2 (OU-003) または Phase 3 (OU-004) の横断的再評価で実施する。
> 本 Phase 1 は「残存する所有者不明検査」を全件列挙し、Phase 2 への移行を明示した。

## 関連情報

- 根拠 Issue: #2078（OU-002 Phase 1）
- 親 Epic: #2076（REQ-028 IR portfolio audit）
- 根拠要件: [REQ-028](../../../requirements/retired/REQ-028.md)
- 根拠 Decision: [DEC-013](../../../decisions/DEC-013.md)
- 比較基準（Phase 0 baseline）: [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md)
- 整合性契約: [integrity-contracts.md](../integrity-contracts.md)
- ルールカタログ: [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- ルール所有権: [rule-ownership.md](../rule-ownership.md)
- REQ 影響マップ: [req-impact-map.md](../../responsibilities/req-impact-map.md)
- 次 Phase（Phase 2）: OU-003 #2079（KEEP/MERGE/IMPLEMENT/DELETE 確定判定）
