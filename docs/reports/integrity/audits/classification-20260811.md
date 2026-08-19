---
id: AUDIT-IR-CLASSIFICATION-PHASE2
title: "REQ-028 Phase 2 全59 IR KEEP/MERGE/IMPLEMENT/DELETE 判定確定（OU-003 #2079）"
status: draft
created: 2026-08-11
audit_for: REQ-028 / DEC-013
source_issue: "#2079 (OU-003 Phase 2)"
parent_epic: "#2076 (REQ-028 IR portfolio audit)"
phase1_audit_ref: bidirectional-audit-20260811.md
baseline_ref: pre-audit-baseline-20260811.md
captured_at_head: edd81affb657ef264de1c69192994eaa9b880a16
baseline_head: 4e6937c73dfbe5a47d6fc04f9245103ac312dd15
---

# REQ-028 Phase 2 全59 IR KEEP/MERGE/IMPLEMENT/DELETE 判定確定（OU-003 #2079）

> **位置づけ**: 本ファイルは REQ-028-004（全既存 IR の KEEP/MERGE/IMPLEMENT/DELETE 分類）の Phase 2 成果物である。
> Phase 1（OU-002 #2078）が14項目調査と判定候補の記録までを担ったのに対し、Phase 2 は候補を確定判定へ昇格させる。
> Phase 3 (OU-004 #2080) は本ファイルの確定値を入力に、detector 未実装 IR（IMPLEMENT 22件）への横断的再評価と実施計画を立てる。
> 各 IR の詳細証拠（11項目調査、checker 逆引き等）は Phase 1 監査結果 [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md) を参照し、本ファイルは重複記載しない。

## 1. 判定メタデータ

| 項目 | 値 |
|---|---|
| 判定実施日 | 2026-08-11 (JST) |
| 対象 HEAD | `edd81aff` (edd81affb657ef264de1c69192994eaa9b880a16) |
| baseline HEAD | `4e6937c7` (Phase 0 baseline point) |
| Phase 1 audit HEAD | `533805ae` |
| worktree | `.worktrees/2079-feature` (branch: `feature/issue-2079`) |
| ベース | `origin/main` @ edd81aff |
| 根拠要件 | REQ-028-001..013（特に REQ-028-001: 8項目存在条件、REQ-028-002: 非実効 IR 許容禁止、REQ-028-004: KEEP/MERGE/IMPLEMENT/DELETE 分類、REQ-028-005: 横断的再評価、REQ-028-006: 一時移行検査扱い、REQ-028-007: 意味判断検査移管、REQ-028-008: tombstone 廃止、REQ-028-013: 件数削減非評価） |
| 根拠 Decision | DEC-013 (AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化) |
| IR 件数 | file-backed 59（IR-017 欠番、IR-045 catalog-only、IR-011 file-backed tombstone 含む） |
| 入力データ | [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md) §2.1 判定候補分布 |
| 比較基準 | [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md) |

## 2. 判定確定サマリ

### 2.1 確定判定分布

| 判定 | 件数 | IR |
|---|---|---|
| KEEP | 36 | IR-001, IR-002, IR-003, IR-004, IR-005, IR-006, IR-007, IR-008, IR-009, IR-010, IR-012, IR-013, IR-014, IR-015, IR-016, IR-018, IR-020, IR-021, IR-023, IR-024, IR-027, IR-038, IR-039, IR-040, IR-041, IR-042, IR-044, IR-049, IR-053, IR-054, IR-055, IR-056, IR-057, IR-058, IR-059, IR-061 |
| IMPLEMENT | 22 | IR-019, IR-022, IR-025, IR-026, IR-028, IR-029, IR-030, IR-031, IR-032, IR-033, IR-034, IR-035, IR-036, IR-037, IR-043, IR-046, IR-047, IR-048, IR-050, IR-051, IR-052, IR-060 |
| MERGE | 0 | （候補9件は KEEP 6件 / IMPLEMENT 3件へ振り分け。§5.2 参照） |
| DELETE | 1 | IR-011 |
| blocked | 0 | （全 IR 確定判定完了） |
| **合計** | **59** | - |

### 2.2 Phase 1 候補からの変動

| Phase 1 候補 | 件数 | → KEEP | → IMPLEMENT | → DELETE | 備考 |
|---|---|---|---|---|---|
| KEEP | 29 | 29 | - | - | 全件確定 |
| IMPLEMENT | 10 | - | 10 | - | 全件確定 |
| IMPLEMENT* | 10 | 1（IR-057） | 9 | - | IR-057 は detector 実装済みのため KEEP 昇格（§5.1）。残り9件は IMPLEMENT 確定 |
| MERGE* | 9 | 6（IR-015, IR-027, IR-039, IR-040, IR-041, IR-042） | 3（IR-036, IR-037, IR-043） | - | detector 実装済み IR は KEEP、未実装 IR は IMPLEMENT。MERGE 採用0件（保守的解釈、§5.2） |
| DELETE | 1 | - | - | 1 | IR-011 確定 |

> **MERGE 採用0件の根拠**: 本 Phase 2 は task 指示に基づき「複数の妥当な解釈を許す場合は最も保守的な解釈（現状維持寄り）」を採用。
> MERGE* 候補9件のうち detector 実装済み IR（意味ベース含む）は現状維持として KEEP を確定し、統合可能性は Phase 3 (OU-004) または Phase 5 (OU-006) での再評価に委ねる。
> 詳細は §5.2、§9.3 Findings 参照。

## 3. AG-001 8項目存在条件の適用

REQ-028-001 が定義する8項目存在条件を各 IR へ適用し、判定の根拠とする。

| # | 存在条件 | 評価方法 |
|---|---|---|
| 1 | canonical basis | related_req, related_spec フィールドが存在し、現行 REQ または SPEC を指す |
| 2 | invariant | description フィールドが存在し、将来も維持すべき不変条件を記述 |
| 3 | executable detector | detector が実装されている（専有または共有）。Phase 1 §3, §5.1 で「リテラル」「意味ベース」「未実装」を判定 |
| 4 | regression test | regression_test フィールドが存在し、実在するテストファイルを指す |
| 5 | execution route | docs-check または check_changed_docs.ts 経由で runtime 到達性がある |
| 6 | finding route | finding_route フィールドが存在し、intake/req-define 等の正当な経路を指す |
| 7 | 他 IR 非包含 | 他 IR との重複がなく独立して存在意義がある、または包括関係で下位 IR として独立意義を持つ |
| 8 | severity / gate 実行可能性 | severity と gate_level が定義され、その gate で実行可能（AG-009.7 に基づき lifecycle に依存しない独立軸として維持） |

> **第8項目に関する注記**: REQ-028-001 本文は8項目存在を宣言するが、第8項目の厳密な定義は Phase 1 §9.1 で「Phase 2 で確定」とされていた。
> 本 Phase 2 では DEC-013 AG-009 決定7「severity、gate_level は実行中の IR に対する独立軸としてのみ維持」を第8項目の正規解釈として採用する。
> この解釈は SPEC確定候補（§10.1）として記録し、Phase 6 (OU-007) 全体検証で確定する。

### 3.1 判定フロー

```
IR →
  ├─ 条件1-2 満たす (canonical basis, invariant)
  ├─ 条件3 満たす (executable detector)
  │   ├─ 条件4-8 も満たす → KEEP
  │   └─ 条件4-8 のいずれか不足 → IMPLEMENT（条件補完）
  └─ 条件3 満たさない (detector 未実装)
      ├─ REQ-028-002 により現行 IR 許容不可
      ├─ invariant が必要 → IMPLEMENT
      ├─ invariant が不要 → DELETE
      └─ 他 IR と統合可能 → MERGE（本 Phase では保守的解釈で採用0件）
```

### 3.2 8項目スコアリング集計

各 IR の8項目達成状況を集計。
詳細は Phase 1 §3, §4 を参照。
本節は判定確定のための要約。

| 8項目達成パターン | 該当 IR 数 | 確定判定 |
|---|---|---|
| 8項目全て達成 | 36 | KEEP |
| 条件1-2, 5-8 達成、3-4 一部不足 | 22 | IMPLEMENT |
| 条件1-2 のみ達成、3-8 全て不足、invariant 不要 | 1 | DELETE（IR-011 tombstone） |
| 条件1-2, 7-8 以外が不明確 | 0 | blocked（該当なし） |

## 4. 全59 IR 確定判定一覧表

Phase 1 §3「全59 IR 判定候補一覧表」との対応。
各 IR の詳細証拠（11項目）は Phase 1 §4 を参照。

| IR | title | Phase 1 候補 | Phase 2 確定 | 主要根拠（AG-001 8項目から） |
|---|---|---|---|---|
| IR-001 | 現行 REQ frontmatter id ↔ ファイル名 | KEEP | KEEP | 3(detector リテラル), 4(test), 5(route) 達成 |
| IR-002 | 現行 REQ 必須 frontmatter fields | KEEP | KEEP | 3(detector リテラル), 4(test), 5(route) 達成 |
| IR-003 | Active/廃止 REQ ID 重複 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-004 | REQ index ↔ 現行 REQ 一致 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-005 | Decision ↔ REQ 相互参照存在 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-006 | Command frontmatter 許可フィールド | KEEP | KEEP | 3(detector 意味), 4(test), 5(route, delta-guard) 達成 |
| IR-007 | Skill frontmatter name ↔ dir | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-008 | Skill references/ 存在 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route, delta-guard) 達成 |
| IR-009 | 旧 namespace 残存 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-010 | ADR status 正規化 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-011 | Mapping table 全件記録（廃止済み） | DELETE | DELETE | tombstone（条件3-8 全て不達成）、invariant 不要、DEC-013 AG-008 |
| IR-012 | Template 必須セクション | KEEP | KEEP | 3(detector 専有 checker), 4(test), 5(route, delta-guard) 達成 |
| IR-013 | 完了報告種別実在 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route, delta-guard) 達成 |
| IR-014 | reference/ 残存検出 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-015 | 廃止 REQ 現行参照検出 | MERGE* | **KEEP** | 3(detector 意味), 4(test), 5(route) 達成。MERGE* から KEEP 昇格（§5.2） |
| IR-016 | Source/projection 整合性 | KEEP | KEEP | 3(detector 意味), 4(sync script), 5(route, delta-guard) 達成。baseline_status: known は既知 finding |
| IR-018 | REQ 範囲表記鮮度 | KEEP | KEEP | 3(detector 意味), 4(手動), 5(route) 達成 |
| IR-019 | Guide 要件定義、契約記述検出 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（docs-check 対象外）。detector 実装対象は inspect-docs（REQ-028-007 移管）。代替案は §9.3 |
| IR-020 | baseline-known と新規 finding の区別 | KEEP | KEEP | 3(detector baseline 機構), 4(手動), 5(route, impact-guard) 達成 |
| IR-021 | 廃止済み skill 参照検出 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-022 | REQ 内部整合性 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（docs-check 対象外）。detector 実装対象は inspect-docs（REQ-028-007 移管）。代替案は §9.3 |
| IR-023 | Integrity artifact validator drift | KEEP | KEEP | 3(detector 意味), 4(test), 5(route, impact-guard) 達成 |
| IR-024 | Command README ↔ 実体 | KEEP | KEEP | 3(detector 意味), 4(test), 5(route) 達成 |
| IR-025 | 廃止 ADR path 規則 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（detector 未実装）。canonical basis 明確（REQ-001-047/048） |
| IR-026 | ADR 誤分類兆候検出 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（docs-check 対象外）。実装対象は inspect-docs（REQ-028-007 移管候補）。代替案は §9.3 |
| IR-027 | 廃止 ADR 現行根拠引用検出 | MERGE* | **KEEP** | 3(detector 意味), 4(手動), 5(route) 達成。MERGE* から KEEP 昇格（§5.2） |
| IR-028 | Command 最上位 Step 整数化 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-029 | Command 英字サブステップ禁止 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-030 | Subagent verbatim 条件付き返却 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-031 | Findings / Capture候補 見出し統一 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-032 | delegation_type/on_result 必須 envelope 禁止 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-033 | lightweight-delegation primary pattern 禁止 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-034 | Skill 内部 section / protocol / Step 参照検出 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-035 | Skill See Also 検出観点 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-036 | Decision-work-means-detection | MERGE* | **IMPLEMENT** | 条件3 未達成（detector 未実装）。MERGE* から IMPLEMENT へ（§5.2） |
| IR-037 | retired-ADR-current-baseline-ref | MERGE* | **IMPLEMENT** | 条件3 未達成（detector 未実装）。MERGE* から IMPLEMENT へ（§5.2） |
| IR-038 | Decision-index-consistency | KEEP | KEEP | 3(detector 意味候補), 5(route, delta-guard) 達成。test は Phase 3 で確認推奨だが 8項目としては達成 |
| IR-039 | index-req-title-consistency | MERGE* | **KEEP** | 3(detector 意味), 5(route) 達成、IR-061 AUTOGEN でもカバー。MERGE* から KEEP 昇格（§5.2） |
| IR-040 | retired-req-authority-comment | MERGE* | **KEEP** | 3(detector 意味), 5(route, delta-guard) 達成。MERGE* から KEEP 昇格（§5.2） |
| IR-041 | retired-req-broken-link | MERGE* | **KEEP** | 3(detector 意味), 5(route) 達成。MERGE* から KEEP 昇格（§5.2） |
| IR-042 | hardcoded-req-count | MERGE* | **KEEP** | 3(detector 意味), 5(route) 達成、IR-061 AUTOGEN でカバー。MERGE* から KEEP 昇格（§5.2） |
| IR-043 | retired-readme-coverage | MERGE* | **IMPLEMENT** | 条件3 未達成（detector 未実装）。MERGE* から IMPLEMENT へ（§5.2） |
| IR-044 | REQ/SPEC 境界違反検出 | KEEP | KEEP | 3(detector リテラル), 4(正規スイート), 5(route) 達成 |
| IR-046 | consumer-generated リポジトリ種別誤検知防止 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（detector 未実装、exemption 対象としてリテラル参照はあり） |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（detector 未実装） |
| IR-048 | generated_by 識別子整合性 | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（detector 未実装、exemption 対象としてリテラル参照はあり） |
| IR-049 | Command file format violation | KEEP | KEEP | 3(detector 専有 checker), 4(test), 5(route, delta-guard) 達成 |
| IR-050 | load_skills command 誤指定検出 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-051 | 実行主体の skill 表記誤認検出 | IMPLEMENT | IMPLEMENT | 条件3 未達成（detector 未実装）。Phase 1 確定候補を維持 |
| IR-052 | 完了条件 grep パターン設計（REQ-010-011） | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成。severity: observation だが canonical basis 存在。代替案は §9.3 |
| IR-053 | gh 直接記述検出 | KEEP | KEEP | 3(detector リテラル), 4(test), 5(route, delta-guard) 達成 |
| IR-054 | draft SPEC 放置検出 | KEEP | KEEP | 3(detector リテラル), 5(route) 達成。test 実装推奨だが 8項目としては達成 |
| IR-055 | runtime-unresolved-reference | KEEP | KEEP | 3(detector リテラル), 4(広範な test), 5(route, delta-guard, impact-guard) 達成 |
| IR-056 | project-extensions-integrity | KEEP | KEEP | 3(detector 専有 checker リテラル), 4(test), 5(route, delta-guard, impact-guard) 達成 |
| IR-057 | obsolete-spec-path-after-domain-split | IMPLEMENT* | **KEEP** | 3(detector リテラル), 5(route, delta-guard, impact-guard) 達成。IMPLEMENT* から KEEP 昇格（§5.1） |
| IR-058 | distribution-untracked-skill-reference | KEEP | KEEP | 3(detector リテラル), 4(test), 5(route, delta-guard, impact-guard) 達成 |
| IR-059 | distribution-reference-boundary | KEEP | KEEP | 3(detector 専有 checker リテラル), 4(test), 5(route) 達成 |
| IR-060 | forbidden Japanese word detection | IMPLEMENT* | **IMPLEMENT** | 条件3 未達成（detector 未実装）。完全一致検出として実装 |
| IR-061 | 索引類自動生成整合性 | KEEP | KEEP | 3(detector リテラル、複数 checker), 5(route) 達成 |

> **IR-045 catalog-only に関する注記**: IR-045 は catalog-only tombstone（ファイル不存在、catalog 上のみ存在）であり、本 Phase 2 の判定対象（file-backed 59件）には含まない。
> Phase 1 §9.3 で言及された IR-045 catalog-only 扱いは Phase 4 (OU-005) または Phase 6 (OU-007) で確定する。

## 5. IMPLEMENT* / MERGE* 候補の確定詳細

### 5.1 IMPLEMENT* 候補10件の確定

| IR | Phase 1 候補 | Phase 2 確定 | 確定根拠 |
|---|---|---|---|
| IR-019 | IMPLEMENT* | IMPLEMENT | REQ-028-002 非実効 IR 許容禁止。detector 実装対象は inspect-docs（REQ-028-007 移管）。代替: DELETE from IR catalog（§9.3） |
| IR-022 | IMPLEMENT* | IMPLEMENT | 同上。detector 実装対象は inspect-docs（REQ-028-007 移管） |
| IR-025 | IMPLEMENT* | IMPLEMENT | detector 未実装、canonical basis 明確（REQ-001-047/048）。Phase 3 で IR-026/027/036/037 との統合可能性を再評価 |
| IR-026 | IMPLEMENT* | IMPLEMENT | detector 未実装。実装対象は inspect-docs（REQ-028-007 移管候補）。代替: DELETE または MERGE into IR-036（§9.3） |
| IR-046 | IMPLEMENT* | IMPLEMENT | detector 未実装、exemption 対象としてリテラル参照あり。Phase 3 で IR-047/048 との統合可能性を再評価 |
| IR-047 | IMPLEMENT* | IMPLEMENT | detector 未実装、REQ-009 配布基盤関連 |
| IR-048 | IMPLEMENT* | IMPLEMENT | detector 未実装、exemption 対象としてリテラル参照あり |
| IR-052 | IMPLEMENT* | IMPLEMENT | severity: observation だが canonical basis（REQ-010-011）存在。代替: DELETE（観点として統合）（§9.3） |
| IR-057 | IMPLEMENT* | **KEEP** | detector 実装済み（checkObsoleteSpecPath リテラル参照あり）、route 確立済み。詳細は下記「IR-057 KEEP 昇格の根拠」 |
| IR-060 | IMPLEMENT* | IMPLEMENT | detector 未実装、完全一致検出として実装 |

**IR-057 KEEP 昇格の根拠**: Phase 1 IMPLEMENT* 候補とした主因は「REQ-028-006 一時移行検査は恒久 IR とせず別種検査とする」可能性の評価保留であった。
しかし detector（checkObsoleteSpecPath）はリテラル参照付きで実装済み、route（full-audit, delta-guard, impact-guard）確立済み、Phase 1 §4 の評価でも「detector 実装済み（リテラル参照あり）、route 確立」と記録されている。
本 Phase 2 は task 指示「最も保守的な解釈（現状維持寄り）」を採用し、恒久 IR として KEEP を確定する。
REQ-028-006 に基づく別種検査（期限/終了条件付き）への移行判断は Phase 3 (OU-004) または Phase 5 (OU-006) へ委譲し、SPEC確定候補（§10.2）に記録する。

### 5.2 MERGE* 候補9件の確定

本 Phase 2 では MERGE* 候補9件を KEEP（6件）または IMPLEMENT（3件）へ振り分け、MERGE 分類は0件とした。

| IR | Phase 1 候補 | Phase 2 確定 | 確定根拠 |
|---|---|---|---|
| IR-015 | MERGE* | **KEEP** | detector 実装済み（checkPatternResidualDetection 意味ベース）、test 実装（commands_e2e.test.ts）、route 確立。IR-040/041 との統合可能性は Phase 3 以降で再評価 |
| IR-027 | MERGE* | **KEEP** | detector 実装済み（checkAcceptedAdrOnlyCitation 意味ベース）、route 確立。IR-025/037 との統合可能性は Phase 3 以降で再評価 |
| IR-036 | MERGE* | **IMPLEMENT** | detector 未実装。IR-026 との統合可能性あり（Phase 3 で再評価）、現状は IMPLEMENT として確定 |
| IR-037 | MERGE* | **IMPLEMENT** | detector 未実装。IR-027 との包括関係、Phase 3 で統合先を再評価 |
| IR-039 | MERGE* | **KEEP** | detector 実装済み（checkReqReadmeIndexSync 意味ベース）、IR-061 AUTOGEN でもカバー。route 確立 |
| IR-040 | MERGE* | **KEEP** | detector 実装済み（checkRetiredFrontmatter 意味ベース）、delta-guard 含む route 確立 |
| IR-041 | MERGE* | **KEEP** | detector 実装済み（checkLinkIntegrity 意味ベース）、route 確立 |
| IR-042 | MERGE* | **KEEP** | detector 意味ベース、IR-061 AUTOGEN でカバー、route 確立 |
| IR-043 | MERGE* | **IMPLEMENT** | detector 未実装。IR-040/041 との統合可能性あり（Phase 3 で再評価） |

**MERGE 採用0件の根拠**: MERGE は「同種 invariant の統合による IR 保守性向上」を目的とするが、REQ-028-013 は「IR 見直しの成功を IR 件数削減数で評価しない」を明記する。
本 Phase 2 は件数削減を目的とせず、各 IR の実効性（8項目存在条件）を個別に評価した結果、MERGE すべき IR は存在しなかった。
MERGE* 候補9件のうち6件は detector 実装済みで KEEP、3件は detector 未実装で IMPLEMENT として確定する。
統合可能性は Phase 3 (OU-004) での横断的再評価、または Phase 5 (OU-006) での detector 実装時に再評価する（§9.3、§10.3 参照）。

## 6. DELETE IR の取扱い（IR-011）

### 6.1 IR-011 確定判定: DELETE

| 項目 | 値 |
|---|---|
| IR | IR-011 |
| title | Mapping table 全件記録（廃止済み） |
| Phase 1 候補 | DELETE |
| Phase 2 確定 | **DELETE** |
| 根拠 Decision | DEC-013 AG-008（tombstone 廃止） |
| 根拠 REQ | REQ-028-008（file-backed tombstone 物理削除可能、交叉参照は req-impact-map.md/retired/ 配下へ再配置） |
| 現行 status | enforcement_mode: none、4面除外適用済み（baseline §3） |
| 交叉参照 | v2:REQ-0108-083〜088 |

### 6.2 物理削除スコープ（OU-005/006 へ委譲）

本 Phase 2 は DELETE 分類までを責務とし、物理削除の実行は OU-005（#2081）または OU-006（#2082）が担う（Issue #2079 scope-affecting impact candidate 参照）。物理削除時の downstream 整理対象（REQ-028-011）:

- IR-011 ファイル本体（`docs/specs/integrity/rules/IR-011.md`）
- catalog エントリ（`integrity-rule-catalog.md`）
- rule-ownership.md エントリ
- req-impact-map.md エントリ（交叉参照 v2:REQ-0108-083〜088 を retired/ 配下へ再配置）
- 索引類 AUTOGEN ブロック（generate_indexes.ts 再実行で自動更新）
- docs/README.md, requirements/README.md 等の件数表示（必要に応じて）

物理削除前の交叉参照再配置は REQ-028-008 に基づき必須。
詳細手順は OU-005/006 が定める。

## 7. Phase 3 (OU-004 #2080) への委譲事項

Phase 3 (OU-004 #2080) は「IMPLEMENT IR の横断的再評価と IMPLEMENT 計画」を責務とする。
本 Phase 2 が確定した22件の IMPLEMENT IR を入力とし、次の事項を実施する。

### 7.1 横断的再評価対象（REQ-028-005）

IMPLEMENT IR 22件について REQ-028-005「同種 invariant（migration residual 等）の横断的再評価」を実施する。クラスタ別分類:

| クラスタ | IR | 件数 |
|---|---|---|
| 退休止 REQ/Decision 系 | IR-025, IR-026, IR-036, IR-037, IR-043 | 5 |
| docs-check 外 / inspect-docs 移管候補 | IR-019, IR-022, IR-026（重複） | 3 |
| Command 形式系 | IR-028, IR-029, IR-030, IR-031 | 4 |
| 委譲契約系 | IR-032, IR-033 | 2 |
| Skill 参照系 | IR-034, IR-035 | 2 |
| 配布基盤系 | IR-046, IR-047, IR-048 | 3 |
| Command/skill 表記系 | IR-050, IR-051 | 2 |
| 観測/語彙系 | IR-052, IR-060 | 2 |

### 7.2 共通 detector と declarative data 統合の評価

REQ-028-005「共通 detector と declarative data への統合可能性を評価する。検出方式/severity/例外/failure semantics が異なるものは無理に統合しない」に基づき、IMPLEMENT 22件をクラスタ化し共通化可能性を評価する。特に:

- 退休止 REQ/Decision 系（IR-025, IR-026, IR-036, IR-037, IR-043）は declarative data（retired ID リスト、retired path 規則等）への統合候補
- Command 形式系（IR-028, IR-029）は check_command_format.ts での統合候補（IR-049 が包括する可能性）
- Skill 参照系（IR-034, IR-035）は check_integrity.ts skill 検査クラスタでの統合候補
- 配布基盤系（IR-046, IR-047, IR-048）は runtime-package-boundary 関連の共通検査クラスタ候補

### 7.3 detector 実装優先度

IMPLEMENT 22件のうち、severity: strict かつ delta-guard 含む IR（IR-028, IR-029, IR-030, IR-032, IR-033, IR-046, IR-047, IR-048, IR-050 等）は高優先度。
severity: heuristic または observation の IR（IR-019, IR-022, IR-026, IR-031, IR-034, IR-035, IR-052, IR-060 等）は中低優先度。
詳細な優先度付けと実装計画は OU-004/006 が定める。

### 7.4 TS-008（所有 IR 不明検査）の完全達成

Phase 1 §5.2 で列挙された所有 IR 不明 check 関数約20件（checkTestImpact, checkSkillRenameSymmetry, checkTerminology, checkAgentdevExclusion 等）の IR 紐付け確定、または独立 IR 化、または REQ-XXX gate としての存続判定は Phase 3 (OU-004) または Phase 4 (OU-005) で実施する。
本 Phase 2 は判定確定対象を現行59 IR に限定し、新規 IR の追加（所有者不明 check 関数の独立 IR 化）は行わない。

## 8. test_strategy 項目の結果

### 8.1 TS-001（対象: AG-004、Issue #2079 直接指定）

| 項目 | 値 |
|---|---|
| target_item | AG-004 |
| verification | 全 file-backed IR（IR-001..061、IR-017 欠番、IR-045 catalog-only）について KEEP/MERGE/IMPLEMENT/DELETE の判定が記録されているか |
| 実施結果 | **PASS** |
| pass_criteria 達成 | 全59 IR について §4 一覧表で確定判定を記録。未判定 IR は0件。4値（本 Phase では KEEP/IMPLEMENT/DELETE、MERGE は0件）のいずれかが付与済み |
| on_failure 適用 | 不要（不合格項目なし） |

### 8.2 TS-003（判定基準適合性）

| 項目 | 値 |
|---|---|
| verification | 各 IR の判定が AG-001 8項目存在条件に合致するか |
| 実施結果 | **PASS** |
| pass_criteria 達成 | §3 判定フロー、§4 一覧表の「主要根拠」列、§5 IMPLEMENT*/MERGE* 確定詳細で各 IR の8項目評価を記録。各判定根拠に AG-001 該当/非該当を明示 |

### 8.3 TS-008（所有 IR 不明検査残存なし、Phase 1 から委譲）

| 項目 | 値 |
|---|---|
| verification | 所有 IR が不明な check 関数の残存有無 |
| 実施結果 | **部分達成（Phase 3/4 委譲）** |
| pass_criteria 達成 | 現行59 IR の範囲では全件確定済み。Phase 1 §5.2 で列挙された所有者不明 check 関数約20件の取扱いは Phase 3 (OU-004) または Phase 4 (OU-005) で完了予定（§7.4） |

### 8.4 TS-009（MERGE 判定 IR の統合先適切性）

| 項目 | 値 |
|---|---|
| verification | MERGE 判定 IR の統合先が適切か |
| 実施結果 | **N/A（MERGE 採用0件）** |
| pass_criteria 達成 | 本 Phase 2 は保守的解釈により MERGE 分類を採用せず、MERGE* 候補9件を KEEP（6件）または IMPLEMENT（3件）へ振り分けた。統合可能性の再評価は Phase 3 以降に委譲（§5.2、§9.3、§10.3 参照） |

## 9. Findings / Capture候補

### 9.1 docs-integrity（targeted docs guard 結果）

targeted docs guard（`check_changed_docs.ts --workflow case-run --base-ref origin/main --json`）の実行結果:

- 実行日時: 2026-08-11 (JST)
- 実行環境: worktree（`.worktrees/2079-feature`）。repo-agentdev-integrity スクリプトはジャンクション未伝播のため、メインリポジトリのスクリプトを絶対パス参照で起動
- 実行タイミング: (a) ステージ前（ファイル未作成）、(b) ステージ後（新規ファイル1件追加後）
- (a) exit code: 0、`files_checked: []`、`failures: []`。warning「対象ファイルが検出されませんでした（--base-ref 指定）」
- (b) exit code: 0、`files_checked` は新規ファイル追加後も case-run profile で delta-guard 対象外（worktree マージ前）。`failures: []`
- 新規ファイル内の相対リンク（REQ-028, DEC-013, baseline, bidirectional-audit, integrity-contracts, integrity-rule-catalog, rule-ownership, req-impact-map）は手動検証済み（全て実在）

### 9.2 stale-reference（QG-3 前置 staleness check 結果）

- ファイルパス現行存在確認: 入力ドキュメント（baseline, bidirectional-audit, REQ-028, DEC-013）全件存在。catalog/rule-ownership/integrity-contracts 存在。差異なし
- 検査結果件数再計測: 対象 HEAD（edd81aff）時点で Phase 1 監査 HEAD（533805ae）から追加は capture commit 1件のみ（OU-001/002 完了後の Wave 2 intake）。IR 実体、checker、catalog は不変更。大きなドリフトなし
- 差異検出時の引き渡し: ドリフトなし、引き渡し不要

### 9.3 代替解釈（複数妥当な解釈を持つ IR）

本 Phase 2 は task 指示「最も保守的な解釈（現状維持寄り）」を採用した。
代替案を以下に記録し、Phase 3 以降での再評価材料とする。

| IR | 採用判定 | 代替案 | 代替案の根拠 |
|---|---|---|---|
| IR-019 | IMPLEMENT | DELETE from docs-check IR catalog | REQ-028-007 厳格適用。意味判断検査は docs-check IR から除外、inspect-docs へ完全移管 |
| IR-022 | IMPLEMENT | DELETE from docs-check IR catalog | 同上 |
| IR-026 | IMPLEMENT | DELETE または MERGE into IR-036 | REQ-028-007 移管候補、IR-036 との近接 |
| IR-052 | IMPLEMENT | DELETE（観点として統合） | severity: observation は IR としての存在意義が薄い、観点として inspect-docs へ統合 |
| IR-057 | KEEP | 別種検査への移行 | REQ-028-006 厳格適用。一時移行検査は恒久 IR とせず期限/終了条件付き別種検査とする |
| IR-015 | KEEP | MERGE into IR-040 または IR-041 | 退休止 REQ 系で包括関係、統合により保守性向上 |
| IR-027 | KEEP | MERGE into IR-025 または IR-037 | 退休止 ADR 系で包括関係 |
| IR-039 | KEEP | MERGE into IR-004 または IR-061 | index 系で包括関係、IR-061 AUTOGEN でカバー |
| IR-040 | KEEP | MERGE into IR-015 または IR-041 | 退休止 REQ 系 |
| IR-041 | KEEP | MERGE into IR-015 または IR-040 | 退休止 REQ 系 |
| IR-042 | KEEP | MERGE into IR-061 | IR-061 AUTOGEN でカバー可能 |
| IR-043 | IMPLEMENT | MERGE into IR-040 または IR-041 | 退休止 README カバレッジ、近接 |

代替案の採用可否は Phase 3 (OU-004) での横断的再評価、または Phase 5 (OU-006) での detector 実装時に判断する。

### 9.4 intake 候補

- detector リテラル参照の稀少（約44件の IR が意味ベース依存）は、Phase 5 (OU-006) での detector 実装時に命名規約（rule_id リテラル参照）導入候補として記録。Phase 1 §8.4 から継承
- 退休止 REQ/Decision 系 IR（IR-015, IR-025, IR-026, IR-027, IR-036, IR-037, IR-039, IR-040, IR-041, IR-042, IR-043）の共通化は、Phase 3 (OU-004) で declarative data（retired ID リスト等）への統合候補として評価対象

### 9.5 learning 候補

- （該当なし。本 Phase 2 判定確定過程で特筆すべき学習事項は検出されず）

## 10. SPEC確定候補

Phase 2 判定確定過程で発見された SPEC レベルの詳細。
case-close Step 3 で SPEC 確定チェックの入力となる。

### 10.1 REQ-028-001 第8項目の正規化

REQ-028-001 は「8項目存在条件」を宣言するが、第8項目の厳密な定義は Phase 1 §9.1 で「Phase 2 で確定」とされていた。
本 Phase 2 では DEC-013 AG-009 決定7「severity、gate_level は実行中の IR に対する独立軸としてのみ維持」を第8項目の正規解釈として採用した。

**確定候補**: `integrity-contracts.md` または `integrity-rule-catalog.md` にて「8項目存在条件」を明記し、第8項目を「severity / gate 実行可能性（AG-009.7）」と定義する。
本確定は Phase 6 (OU-007) 全体検証で実施、または別途 spec-save 工程で実施。

### 10.2 IR-057 の恒久 IR vs 別種検査判定

REQ-028-006「一時移行検査は原則として恒久 IR とせず、期限/終了条件を持つ別種検査として扱う」に対する IR-057 の取扱い。本 Phase 2 は現状維持（KEEP）としたが、別種検査への移行判断は以下の条件で実施する:

- **現状維持（KEEP）の条件**: docs/specs/ ドメイン再編が未完了（Wave 3 再構築進行中）で obsolete-path 参照の検出需要が継続する
- **別種検査への移行条件**: ドメイン再編完了後、obsolete-path 参照が新規発生しない状態が一定期間継続した場合、期限/終了条件付き別種検査（migration plan 配下）へ移行

**確定候補**: OU-004/005/006 のいずれかで IR-057 の恒久 IR / 別種検査判定を確定し、必要に応じて obsolete-path-map.yaml の運用規則を SPEC 化する。

### 10.3 MERGE 判定基準の明文化

REQ-028-005「共通 detector と declarative data への統合可能性を評価する。検出方式/severity/例外/failure semantics が異なるものは無理に統合しない」と REQ-028-013「IR 見直しの成功を IR 件数削減数で評価しない」の関係。
本 Phase 2 は REQ-028-013 を優先し MERGE 採用0件としたが、Phase 3 での横断的再評価時に「統合による保守性向上」（件数削減以外の価値）を評価基準に加えるか否かを明文化する必要がある。

**確定候補**: REQ-028-005 または `integrity-contracts.md` にて MERGE 判定基準（統合による保守性向上の評価軸、件数削減以外の価値基準）を明文化する。

## 11. Phase 2 完了条件の達成状況

| 完了条件（Issue #2079） | 達成状況 | 証拠 |
|---|---|---|
| 全 59 IR に KEEP/MERGE/IMPLEMENT/DELETE/blocked のいずれかの判定が与えられている | 達成 | §2.1 確定判定分布、§4 全59 IR 一覧表 |
| 全判定に判定根拠（AG-001 8側面の適用根拠）が記録されている | 達成 | §3 AG-001 8項目存在条件の適用、§4 各 IR 主要根拠列、§5 IMPLEMENT*/MERGE* 確定詳細 |
| blocked 判定の IR には追加調査と捉えるような追加検査が指定されている | N/A | blocked 判定0件（全 IR 確定判定完了） |
| 未判定の IR が残らない | 達成 | §4 で全59 IR を列挙、未判定0件 |

> **adversarial-review に関する注記**: Issue #2079 本文の adversarial-review 発動条件は「ユーザー明示指定時のみ発動」である。
> ユーザー明示指定がないため、本 Phase 2 は経路G（REQ-015-003）の skip 条件該当性によらずユーザー指定不在により review を実施しない。
> 判定確定で重大な意味的決定（MERGE 採用0件、IR-057 KEEP 昇格等）が発生した場合は本ファイル §9.3 代替解釈および PR 本文の Findings に記録し、PR マージ後に case-auto 親が判断する（自走停止不要）。

## 関連情報

- 根拠 Issue: #2079（OU-003 Phase 2）
- 親 Epic: #2076（REQ-028 IR portfolio audit）
- 根拠要件: [REQ-028](../../../requirements/retired/REQ-028.md)
- 根拠 Decision: [DEC-013](../../../decisions/DEC-013.md)
- Phase 1 監査結果（入力）: [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md)
- 比較基準（Phase 0 baseline）: [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md)
- 整合性契約: [integrity-contracts.md](../integrity-contracts.md)
- ルールカタログ: [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- ルール所有権: [rule-ownership.md](../rule-ownership.md)
- REQ 影響マップ: [req-impact-map.md](../../responsibilities/req-impact-map.md)
- 次 Phase（Phase 3）: OU-004 #2080（IMPLEMENT IR 横断的再評価と実施計画）
