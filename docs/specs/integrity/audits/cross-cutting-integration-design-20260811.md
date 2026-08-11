---
id: AUDIT-IR-INTEGRATION-PHASE3
title: "REQ-028 Phase 3 IMPLEMENT 22 IR 横断的統合設計（OU-004 #2080）"
status: draft
created: 2026-08-11
audit_for: REQ-028 / DEC-013
source_issue: "#2080 (OU-004 Phase 3)"
parent_epic: "#2076 (REQ-028 IR portfolio audit)"
phase2_classification_ref: classification-20260811.md
phase1_audit_ref: bidirectional-audit-20260811.md
baseline_ref: pre-audit-baseline-20260811.md
captured_at_head: a81bdc7c8c843a909ed1277281c2844708d8cb76
baseline_head: 4e6937c73dfbe5a47d6fc04f9245103ac312dd15
---

# REQ-028 Phase 3 IMPLEMENT 22 IR 横断的統合設計（OU-004 #2080）

> **位置づけ**: 本ファイルは REQ-028-005（同種 invariant の横断的再評価、共通 detector と declarative data 統合可能性の評価）の Phase 3 成果物である。
> Phase 2（OU-003 #2079）が確定した IMPLEMENT 22件を入力とし、特に migration residual 系（退休止 REQ/Decision 系）のグループ化、4軸評価、共通 detector 統合可能性、declarative data 化移行候補を設計する。
> 各 IR の個別証拠（11項目調査、判定根拠）は Phase 2 [classification-20260811.md](classification-20260811.md) §4、Phase 1 [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md) §4 を参照し、本ファイルは重複記載しない。
> 実体変更（IR ファイル、catalog、rule-ownership の更新、detector 実装）は OU-005（#2081: IR 管理モデル再設計、DEC-013 apply）および OU-006（#2082: 判定結果適用、scale:large）の責務である。本 Phase 3 は設計書の作成のみを責務とする。

## 1. 設計メタデータ

| 項目 | 値 |
|---|---|
| 設計実施日 | 2026-08-11 (JST) |
| 対象 HEAD | `a81bdc7c` (a81bdc7c8c843a909ed1277281c2844708d8cb76) |
| baseline HEAD | `4e6937c7` (Phase 0 baseline point) |
| Phase 2 分類 HEAD | `edd81aff` (Phase 2 判定時点、本 Phase 3 入力) |
| worktree | `.worktrees/2080-feature` (branch: `feature/issue-2080`) |
| ベース | `origin/main` @ a81bdc7c |
| 根拠要件 | REQ-028-001..013（特に REQ-028-005: 横断的再評価、REQ-028-006: 一時移行検査扱い、REQ-028-007: 意味判断検査移管、REQ-028-008: 物理削除交叉参照、REQ-028-013: 件数削減非評価） |
| 根拠 Decision | DEC-013 (AG-008 tombstone 廃止、AG-009 lifecycle/enforcement/baseline_status 簡素化) |
| 入力データ | [classification-20260811.md](classification-20260811.md) §2.1 IMPLEMENT 22件、§7 Phase 3 委譲事項 |
| 比較基準 | [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md) |

## 2. Phase 3 スコープと入力

### 2.1 入力: Phase 2 確定 IMPLEMENT 22件

Phase 2 [classification-20260811.md](classification-20260811.md) §2.1 が確定した IMPLEMENT 22件を入力とする。KEEP 36件、DELETE 1件（IR-011）、MERGE 0件は対象外。

| IR | title | severity | baseline | gate |
|---|---|---|---|---|
| IR-019 | Guide 要件定義、契約記述検出 | heuristic | resolved | full-audit |
| IR-022 | REQ 内部整合性 | strict | resolved | full-audit |
| IR-025 | 廃止 ADR path 規則 | strict | known | full-audit |
| IR-026 | ADR 誤分類兆候検出 | heuristic | known | full-audit |
| IR-028 | Command 最上位 Step 整数化 | strict | new | full-audit, delta-guard |
| IR-029 | Command 英字サブステップ禁止 | strict | new | full-audit, delta-guard |
| IR-030 | Subagent verbatim 条件付き返却 | strict | new | full-audit, delta-guard |
| IR-031 | Findings / Capture候補 見出し統一 | strict | new | full-audit, delta-guard |
| IR-032 | delegation_type/on_result 必須 envelope 禁止 | strict | new | full-audit, delta-guard |
| IR-033 | lightweight-delegation primary pattern 禁止 | strict | new | full-audit, delta-guard |
| IR-034 | Skill 内部 section / protocol / Step 参照検出 | heuristic | new | full-audit |
| IR-035 | Skill See Also 検出観点 | heuristic | new | full-audit |
| IR-036 | Decision-work-means-detection | heuristic | resolved | full-audit |
| IR-037 | retired-ADR-current-baseline-ref | strict | new | full-audit |
| IR-043 | retired-readme-coverage | strict | new | full-audit |
| IR-046 | consumer-generated リポジトリ種別誤検知防止 | strict | new | full-audit, delta-guard |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成 | strict | new | full-audit, delta-guard |
| IR-048 | generated_by 識別子整合性 | strict | new | full-audit, delta-guard |
| IR-050 | load_skills command 誤指定検出 | strict | new | full-audit, delta-guard |
| IR-051 | 実行主体の skill 表記誤認検出 | strict | new | full-audit, delta-guard |
| IR-052 | 完了条件 grep パターン設計（REQ-010-011） | observation | new | full-audit |
| IR-060 | forbidden Japanese word detection | strict | new | full-audit |

> 各 IR の detector 実装状況、regression test、canonical basis、他 IR との重複、migration 固有性は Phase 1 §4、Phase 2 §4 を参照。

### 2.2 完了条件（Issue #2080）への対応マッピング

| 完了条件 | 本ファイル内の節 |
|---|---|
| migration residual 系 IR のグループ化が完了している | §3 |
| 各グループの統合可能性評価（4軸: detection method / severity / 例外 / failure semantics）が記録されている | §4 |
| 共通 detector 統合対象の IR 群と、統合対象外の IR 群が明示されている | §5 |
| declarative data 化移行候補が特定されている | §6 |

Phase 2 から委譲された事項（TS-008、IR-057、IR-011、MERGE 再評価）は §7 で扱う。

## 3. migration residual 系 IR グループ化（完了条件1）

### 3.1 migration residual の定義

Phase 3 が対象とする migration residual 系は、リポジトリの過去状態から現在状態への移行過程で発生する残留検査を指す。具体的には次のいずれかに該当する IR 群である。

- 退休止 REQ、Decision、ADR への言及、参照、path、baseline が現行ドキュメントに残存しないことの検査
- 移行期の運用固有の検査（廃止 ADR path 規則、retired baseline 参照等）で、移行完了後は不要となるもの

 obsolete namespace（IR-009、KEEP）、obsolete-spec-path-after-domain-split（IR-057、KEEP）も概念上は migration residual に含まれるが、両者は detector 実装済み・route 確立済みのため Phase 3 の再評価対象外（Phase 2 確定 KEEP）。

### 3.2 migration residual 系クラスタ（IMPLEMENT 22件から抽出）

Phase 2 §7.1 のクラスタ分類と Phase 1 §4「他 IR との重複」「migration 固有性」調査に基づき、IMPLEMENT 22件のうち migration residual 系を次の5件とする。

| IR | title | severity | migration residual としての特性 |
|---|---|---|---|
| IR-025 | 廃止 ADR path 規則 | strict | ADR 廃止運用固有、retired path 規則検出 |
| IR-026 | ADR 誤分類兆候検出 | heuristic | Decision 運用固有、誤分類兆候検出（意味判断） |
| IR-036 | Decision-work-means-detection | heuristic | Decision 運用固有、work-means 検出（意味判断） |
| IR-037 | retired-ADR-current-baseline-ref | strict | ADR 廃止運用固有、retired baseline 参照検出 |
| IR-043 | retired-readme-coverage | strict | README 廃止運用固有、retired README カバレッジ検出 |

> IR-026 は §3.2（migration residual 系）と後述 §4.2（docs-check 外 / inspect-docs 移管候補クラスタ）の両方に属する。Phase 1 §4「migration 固有性」は「Decision 運用に固有」と記録しており、retired Decision 運用という意味で migration residual に含む。同時に「docs-check 対象外、inspect-docs 候補」としても振る舞うため、優先的には inspect-docs 移管候補として扱う（§4.2、§5 参照）。

### 3.3 IMPLEMENT 22件の全クラスタ分類

migration residual 系5件を含む IMPLEMENT 22件の全体クラスタ分類を示す。Phase 2 §7.1 を再構成し、 Phase 3 での4軸評価（§4）の入力とする。

| クラスタ | 件数 | IR |
|---|---|---|
| migration residual 系（退休止 REQ/Decision） | 5 | IR-025, IR-026, IR-036, IR-037, IR-043 |
| docs-check 外 / inspect-docs 移管候補 | 3 | IR-019, IR-022, IR-026（migration residual 系と重複） |
| Command 形式系 | 4 | IR-028, IR-029, IR-030, IR-031 |
| 委譲契約系 | 2 | IR-032, IR-033 |
| Skill 参照系 | 2 | IR-034, IR-035 |
| 配布基盤系 | 3 | IR-046, IR-047, IR-048 |
| Command/skill 表記系 | 2 | IR-050, IR-051 |
| 観測/語彙系 | 2 | IR-052, IR-060 |

> クラスタ間で IR-026 が重複する。これは同 IR が migration residual と inspect-docs 移管の両面を持つため。Phase 3 は inspect-docs 移管を優先し、migration residual クラスタ内では取り扱わない（二重計上を避けるため、クラスタ集計は IR-026 を inspect-docs 移管候補に帰属させる）。

## 4. 各グループの統合可能性評価（完了条件2）

REQ-028-005「検出方式、severity、例外条件、failure semantics の一致・不一致」に基づき、各クラスタの統合可能性を4軸で評価する。

### 4.1 軸定義

| 軸 | 評価内容 |
|---|---|
| detection method | 検出方式（リテラル grep、構造解析、意味判断、存在確認）の一致性 |
| severity | strict / heuristic / observation の一致性 |
| 例外条件 | 検出例外（exemption、false positive 抑制等）の一致性 |
| failure semantics | 検出時の finding 生成経路、baseline 扱い、triage_action の一致性 |

4軸全てが一致する場合のみ共通 detector による統合を許可する。1軸でも異なる場合は統合対象外とする（REQ-028-005「無理な統合の禁止」）。

### 4.2 migration residual 系クラスタの評価

IR-025, IR-026, IR-036, IR-037, IR-043 の5件を評価する。

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-025 | retired path パターンマッチ（構造解析） | strict | ADR 廃止運用規則に基づく path 例外なし | intake 経由 finding、baseline: known |
| IR-026 | Decision 誤分類兆候（意味判断） | heuristic | 文脈判断必要、false positive 多 | inspect-docs 観点候補、baseline: known |
| IR-036 | Decision work-means 検出（意味判断） | heuristic | 文脈判断必要 | inspect-docs 観点候補、baseline: resolved |
| IR-037 | retired ADR の現行 baseline 参照検出（構造解析） | strict | 例外なし | intake 経由 finding、baseline: new |
| IR-043 | retired README カバレッジ検出（存在確認） | strict | 例外なし | intake 経由 finding、baseline: new |

#### グループ A: strict + リテラル/構造検出（IR-025, IR-037, IR-043）

3軸（detection method = 構造解析/存在確認、severity = strict、例外条件 = なし）が一致する。failure semantics も intake 経由 finding で一致（baseline 状態は known/new で異なるが、finding 経路は同一）。共通 detector による統合可能性が高い。

統合先候補: `checkRetiredArtifactResidual`（新設共通 detector）。retired artifact registry（declarative data、§6.1）を入力とし、retired path、retired baseline 参照、retired README カバレッジの3観点を同一 detector で検出する。

#### グループ B: heuristic + 意味判断（IR-026, IR-036）

detection method = 意味判断、severity = heuristic で一致するが、グループ A とは全軸で異なる。failure semantics も inspect-docs 観点候補で異なる。グループ A とは統合できない。

グループ B 内の統合は、意味判断 detector（`checkDecisionMisclassification`、新設候補）で検討可能だが、両 IR とも docs-check 対象外・inspect-docs 移管候補（REQ-028-007）であるため、IR catalog からの除外（inspect-docs 觀点への完全移管）を優先する。グループ B の IR catalog 内統合は行わない。

### 4.3 docs-check 外 / inspect-docs 移管候補クラスタ（IR-019, IR-022, IR-026）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-019 | Guide 内容の意味判断 | heuristic | Guide 種別、文脈判断 | inspect-docs 観点候補 |
| IR-022 | REQ 内部整合性の意味判断 | strict | REQ 種別、文脈判断 | inspect-docs 観点候補 |
| IR-026 | Decision 誤分類兆候（意味判断） | heuristic | 文脈判断 | inspect-docs 観点候補 |

3件とも意味判断検出、docs-check 対象外、inspect-docs 移管候補（REQ-028-007）。Phase 3 の判定は「IR catalog から除外し、inspect-docs 觀点へ完全移管」である。catalog 内での統合ではなく、別体系（inspect-docs 観点レジストリ）への移管となる。

### 4.4 Command 形式系クラスタ（IR-028, IR-029, IR-030, IR-031）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-028 | Command 最上位 Step 整数化（構造解析） | strict | 例外なし | intake 経由 finding、baseline: new |
| IR-029 | 英字サブステップ禁止（構造解析） | strict | 例外なし | intake 経由 finding、baseline: new |
| IR-030 | Subagent verbatim 条件付き返却（grep） | strict | verbatim 区切子規則 | intake 経由 finding、baseline: new |
| IR-031 | Findings / Capture候補 見出し統一（grep） | strict | 見出し例外パターン | intake 経由 finding、baseline: new |

4件とも severity = strict、detection method = 構造解析/grep、failure semantics 同一。例外条件は個別規則だが、declarative data（規則テーブル）で表現可能。IR-049（Command file format violation、KEEP）が包括する可能性を Phase 1 §4 で指摘済み。

統合先候補: `check_command_format.ts`（既存 checker）の拡張、または IR-049 配下への観点集約。Command 形式規則を declarative data（command-format-rules.yaml、§6.2）へ切り出し、check_command_format.ts が同データを参照する設計とする。

### 4.5 委譲契約系クラスタ（IR-032, IR-033）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-032 | delegation_type/on_result 必須 envelope 禁止（grep） | strict | 委譲契約 SPEC 参照 | intake 経由 finding、baseline: new |
| IR-033 | lightweight-delegation primary pattern 禁止（grep） | strict | 委譲契約 SPEC 参照 | intake 経由 finding、baseline: new |

2件とも severity = strict、detection method = grep、委譲契約 SPEC 参照、failure semantics 同一。共通 detector による統合可能性が高い。

統合先候補: `checkDelegationContractResidual`（新設共通 detector）。委譲契約 SPEC（`docs/specs/workflows/delegation-contracts.md`）を入力とし、禁止パターンを declarative data で管理する。

ただし他クラスタ（Command 形式系等）とは SPEC 参照、検出パターンが異なるため、統合は委譲契約系クラスタ内に留める。

### 4.6 Skill 参照系クラスタ（IR-034, IR-035）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-034 | Skill 内部 section/protocol/Step 参照検出（grep） | heuristic | Skill 構造規則 | intake 経由 finding、baseline: new |
| IR-035 | Skill See Also 検出観点（grep） | heuristic | Skill 構造規則 | intake 経由 finding、baseline: new |

2件とも severity = heuristic、detection method = grep、Skill 構造規則、failure semantics 同一。統合可能性が高い。

統合先候補: 既存 `check_integrity.ts` の skill 検査クラスタ（`checkSkillNameDirMatch`、`checkSkillReferencesExistence` 等）への観点追加。Skill 内部参照規則を declarative data で管理する設計。

### 4.7 配布基盤系クラスタ（IR-046, IR-047, IR-048）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-046 | consumer-generated リポジトリ種別誤検知防止（存在確認） | strict | リポジトリ種別判定 | intake 経由 finding、baseline: new |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成（構造解析） | strict | link mode 例外 | intake 経由 finding、baseline: new |
| IR-048 | generated_by 識別子整合性（grep） | strict | generated_by 例外識別子 | intake 経由 finding、baseline: new |

3件とも severity = strict、detection method = 構造解析/grep/存在確認、runtime-package-boundary 関連、failure semantics 同一。統合可能性が高い。

統合先候補: `checkDistributionBoundary`（新設共通 detector）。runtime-package-boundary SPEC（`docs/specs/local/runtime-package-boundary.md`）を入力とし、リポジトリ種別、link mode、generated_by 識別子の整合性を declarative data（distribution-targets.yaml、§6.3）で管理する。

### 4.8 Command/skill 表記系クラスタ（IR-050, IR-051）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-050 | load_skills command 誤指定検出（grep） | strict | load_skills 例外リスト | intake 経由 finding、baseline: new |
| IR-051 | 実行主体の skill 表記誤認検出（grep） | strict | 実行主体分類規則 | intake 経由 finding、baseline: new |

2件とも severity = strict、detection method = grep、表記検出、failure semantics 同一。統合可能性が高い。

統合先候補: `checkExecutorNotation`（新設共通 detector）。実行主体分類（command/harness/subagent）と load_skills 例外を declarative data で管理する。

### 4.9 観測/語彙系クラスタ（IR-052, IR-060）

| IR | detection method | severity | 例外条件 | failure semantics |
|---|---|---|---|---|
| IR-052 | 完了条件 grep パターン設計（grep） | observation | REQ-010-011 完了条件形式 | finding は観測、triage は参考 |
| IR-060 | forbidden Japanese word detection（grep） | strict | 語彙レジストリ例外 | intake 経由 finding、baseline: new |

severity（observation vs strict）、failure semantics が異なる。統合対象外とし、独立 detector として実装する。

## 5. 共通 detector 統合対象 / 統合対象外の明示（完了条件3）

### 5.1 共通 detector 統合対象 IR 群

4軸評価（§4）で一致性が確認されたクラスタ。Phase 5（OU-006）での detector 実装時に統合を実施する。

| 統合先 detector（候補） | 統合対象 IR | 統合根拠 |
|---|---|---|
| `checkRetiredArtifactResidual` | IR-025, IR-037, IR-043 | §4.2 グループ A、strict + リテラル/構造検出、retired artifact registry 参照 |
| `check_command_format.ts` 拡張（IR-049 包括） | IR-028, IR-029, IR-030, IR-031 | §4.4 Command 形式系、strict + 構造解析/grep、command-format-rules.yaml 参照 |
| `checkDelegationContractResidual` | IR-032, IR-033 | §4.5 委譲契約系、strict + grep、委譲契約 SPEC 参照 |
| `check_integrity.ts` skill 検査クラスタ拡張 | IR-034, IR-035 | §4.6 Skill 参照系、heuristic + grep、Skill 構造規則参照 |
| `checkDistributionBoundary` | IR-046, IR-047, IR-048 | §4.7 配布基盤系、strict + 構造解析/grep、distribution-targets.yaml 参照 |
| `checkExecutorNotation` | IR-050, IR-051 | §4.8 Command/skill 表記系、strict + grep、実行主体分類参照 |

統合対象計19件（重複除外: IR-026 は統合対象から除外）。Phase 5 実装時に各 detector へ観点を集約し、各 IR の severity/gate_level/failure semantics は維持する（IR lifecycle の代替ではなく、観点の物理的集約のみ）。

### 5.2 統合対象外 IR 群

4軸のいずれかが異なる、または検出体系が異なるため独立を維持する IR 群。

| IR | 対象外の根拠 | 取扱い |
|---|---|---|
| IR-019 | docs-check 外、意味判断検出（REQ-028-007 移管） | inspect-docs 觀点へ移管、IR catalog から除外候補 |
| IR-022 | docs-check 外、意味判断検出（REQ-028-007 移管） | inspect-docs 觀点へ移管、IR catalog から除外候補 |
| IR-026 | docs-check 外、意味判断検出（REQ-028-007 移管） | inspect-docs 觀点へ移管、IR catalog から除外候補（migration residual 系としての側面は inspect-docs 移管後に解消） |
| IR-036 | docs-check 外、意味判断検出（REQ-028-007 移管） | inspect-docs 觀点へ移管、IR catalog から除外候補 |
| IR-052 | severity: observation、failure semantics が異なる | 独立 detector として実装、観点ベース |
| IR-060 | severity: strict だが語彙レジストリ例外が固有 | 独立 detector として実装、`vocabulary-registry.md` と協調 |

統合対象外計6件。IR catalog から除外する4件（IR-019, 022, 026, 036）は、Phase 4（OU-005）での IR 管理モデル再設計（DEC-013 apply）時に除外を実施する。IR-052, IR-060 は独立 detector 実装を維持する。

### 5.3 統合対象 / 対象外の集計

| 区分 | 件数 | IR |
|---|---|---|
| 共通 detector 統合対象 | 16 | IR-025, IR-028, IR-029, IR-030, IR-031, IR-032, IR-033, IR-034, IR-035, IR-037, IR-043, IR-046, IR-047, IR-048, IR-050, IR-051 |
| IR catalog から除外（inspect-docs 移管） | 4 | IR-019, IR-022, IR-026, IR-036 |
| 独立 detector 維持 | 2 | IR-052, IR-060 |
| 合計 | 22 | （IMPLEMENT 22件全件） |

> 「共通 detector 統合対象 16件」は Phase 2 §7.1「退休止 REQ/Decision 系 5件」から IR-026 を除外（inspect-docs 移管）し、IR-025, IR-037, IR-043 の3件を `checkRetiredArtifactResidual` 統合先へ振り分けた結果。Phase 2 §7.1 の「退休止 5件」と本 Phase 3 の「統合対象 3件 + 除外 2件」の差は、IR-026 と IR-036 の inspect-docs 移管判定による。

## 6. declarative data 化移行候補（完了条件4）

REQ-028-005「共通 detector と declarative data への統合可能性を評価する」に基づき、共通 detector 統合対象クラスタ（§5.1）の検出データを declarative data として切り出す候補を特定する。Phase 3 は候補特定までとし、実体 YAML ファイルの作成は Phase 5（OU-006）で実施する。

### 6.1 retired-artifact-registry.yaml（新設候補）

| 項目 | 内容 |
|---|---|
| 対象クラスタ | §4.2 グループ A（IR-025, IR-037, IR-043） |
| データ内容 | retired REQ ID リスト、retired Decision ID リスト、retired ADR path パターン、retired baseline 参照対象、retired README カバレッジ対象 |
| 参照 detector | `checkRetiredArtifactResidual` |
| 協調先 | `responsibilities/req-impact-map.md/retired/` 配下（REQ-028-008 交叉参照再配置先）、`foundations/numbering-policy.md` 欠番表 |

既存の retired 管理資産（`req-impact-map.md/retired/`、`numbering-policy.md` 欠番表）と二重管理を避けるため、本 registry はそれらの資産をマッシュアップした検出用ビューとして位置づける。正規の retired 管理は既存資産が維持する。

### 6.2 command-format-rules.yaml（新設候補）

| 項目 | 内容 |
|---|---|
| 対象クラスタ | §4.4 Command 形式系（IR-028, IR-029, IR-030, IR-031） |
| データ内容 | Command 最上位 Step 整数化規則、英字サブステップ禁止規則、Subagent verbatim 区切子規則、Findings/Capture 見出しパターン |
| 参照 detector | `check_command_format.ts`（IR-049 包括） |

`docs/specs/authoring/command-file-format.md` が現行の正規規則対象。本 YAML は同 SPEC から検出用パターンを機械的に切り出したビューである。SPEC が正、YAML は派生物。

### 6.3 distribution-targets.yaml（新設候補）

| 項目 | 内容 |
|---|---|
| 対象クラスタ | §4.7 配布基盤系（IR-046, IR-047, IR-048） |
| データ内容 | src/opencode/ 正当パス、src/opencode-local/ 正当パス、generated_by 識別子一覧、リポジトリ種別（consumer/self-hosting）判定規則 |
| 参照 detector | `checkDistributionBoundary` |

`docs/specs/local/runtime-package-boundary.md` が正、本 YAML は検出用ビュー。

### 6.4 delegation-contract-patterns.yaml（新設候補）

| 項目 | 内容 |
|---|---|
| 対象クラスタ | §4.5 委譲契約系（IR-032, IR-033） |
| データ内容 | delegation_type/on_result 必須 envelope 禁止パターン、lightweight-delegation primary pattern 禁止パターン |
| 参照 detector | `checkDelegationContractResidual` |

`docs/specs/workflows/delegation-contracts.md` が正、本 YAML は検出用ビュー。

### 6.5 declarative data 化の設計原則

Phase 3 が特定した declarative data 化候補は、次の原則に従う。

1. **正は SPEC**: 各 YAML は検出用ビューであり、正規規則は対応 SPEC が保持する。SPEC と YAML の不一致は SPEC を正とする（`foundations/patterns.md` 文書モデル原則）。
2. **二重管理の回避**: 既存の管理資産（`req-impact-map.md/retired/`、`numbering-policy.md` 等）と重複する場合、YAML はマッシュアップビューとし、正規管理対象を置き換えない。
3. **IR lifecycle への影響なし**: declarative data 化は検出方式の共通化であり、各 IR の severity、gate_level、failure semantics は維持する。IR の lifecycle_state、enforcement_mode は DEC-013 AG-009 に基づき Phase 4 で別途処理される。
4. **Phase 5 での実体作成**: 本 Phase 3 は候補特定までとし、YAML ファイルの実体作成、detector への組込は Phase 5（OU-006）で実施する。

## 7. Phase 2 から委譲された事項の Phase 3 判定

Phase 2 [classification-20260811.md](classification-20260811.md) §6、§7、§9.3、§10 から委譲された事項の Phase 3 判定を記録する。

### 7.1 TS-008 完全達成: 所有者不明 check 関数約20件の IR 紐付け

Phase 1 §5.2 で列挙された所有 IR が不明な check 関数群（`checkTestImpact`, `checkSkillRenameSymmetry`, `checkTerminology`, `checkAgentdevExclusion` 等約20件）の取扱い。

**Phase 3 判定**: 新規 IR 化せず、次の3区分のいずれかに分類する。

| 区分 | 内容 | 該当例 |
|---|---|---|
| (a) 既存 IR の detector として認知 | 既存 IR-001..061 の detector 群に含まれる check 関数 | `checkSkillRenameSymmetry` → IR-007（Skill frontmatter name ↔ dir）または IR-026（Skill rename 対称性、REQ-026 由来）の detector |
| (b) inspect-docs 観点 | 意味判断検出、docs-check 対象外 | `checkTerminology` → 用語 policy 違反、inspect-docs 觀点（IR-019/022/026/036 と同様） |
| (c) REQ gate として存続 | 特定 REQ の品質 gate として独立 | `checkTestImpact` → REQ-019（テスト影響範囲検出 gate）、`test-impact-detection-gate.md` SPEC が管理 |

**完全達成の定義**: 約20件の check 関数が全て (a)、(b)、(c) のいずれかに分類されること。Phase 3 は分類基準の確定までとし、個別 check 関数の全件分類は Phase 4（OU-005）で実施する（Phase 4 が IR 管理モデル再設計を責務とするため）。

**新規 IR 化を見送る根拠**: Phase 2 は「新規 IR の追加（所有者不明 check 関数の独立 IR 化）は行わない」（§7.4）と宣言した。Phase 3 も同制約を継承し、既存59 IR の範囲内での分類に留める。新規 IR が必要な場合は別途 backlog → RU → req-define → req-save 経路で提起する。

### 7.2 IR-057 恒久 IR vs 別種検査判定（REQ-028-006 移行判断）

Phase 2 §10.2 SPEC確定候補から委譲。IR-057（obsolete-spec-path-after-domain-split、Phase 2 KEEP 確定）を恒久 IR とするか、REQ-028-006「一時移行検査は原則として恒久 IR とせず、期限/終了条件を持つ別種検査とする」に基づき別種検査へ移行するか。

**Phase 3 判定**: **現状維持（KEEP、恒久 IR）** を推奨する。

**根拠**:

- `docs/specs/` ドメイン再編が未完了（Wave 3 再構築進行中）であり、obsolete-path 参照の新規発生リスクが継続する。
- IR-057 の detector（`checkObsoleteSpecPath`）はリテラル参照付きで実装済み、route（full-audit, delta-guard, impact-guard）確立済み（Phase 2 §5.1）。
- 別種検査（期限/終了条件付き）への移行コストが現状のリスクに見合わない。

**別種検査への移行条件**: 次の2条件が両立した場合、Phase 6（OU-007）全体検証で移行を再評価する。

1. `docs/specs/` ドメイン再編が完了し、obsolete-spec-path 構造が安定する。
2. obsolete-path 参照の新規発生が一定期間（目安: 移行判断時点から2四半期以上）発生しない。

**確定候補**: 本判定を IR-057 ファイル本文（`docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md`）へ反映するかは Phase 4 または別途 spec-save 工程で判断する。本 Phase 3 は判定記録までとし、IR ファイルの実体更新は行わない（Phase 3 スコープ制約、§0「位置づけ」参照）。

### 7.3 IR-011 物理削除の交叉参照 v2:REQ-0108-083..088 再配置先

Phase 2 §6.2 から委譲。IR-011（DELETE 確定）の物理削除時に、交叉参照 `v2:REQ-0108-083..088`（6件）を req-impact-map.md/retired/ 配下へ再配置する（REQ-028-008）。

**Phase 3 判定**: 再配置先を次のとおり確定する。

| 項目 | 内容 |
|---|---|
| 再配置先 | `docs/specs/responsibilities/req-impact-map.md` に新設する `## Retired cross-references` セクション |
| 再配置単位 | `v2:REQ-0108-083`、`v2:REQ-0108-084`、`v2:REQ-0108-085`、`v2:REQ-0108-086`、`v2:REQ-0108-087`、`v2:REQ-0108-088`（6件） |
| 各エントリ形式 | `| v2:REQ-0108-XXX | <旧タイトル> | retired at IR-011 削除 (<commit-hash>) | <後続REQ等> |` |
| 協調先 | `foundations/numbering-policy.md` 欠番表、`decisions/DEC-013.md` AG-008 |

**実施タイミング**: IR-011 物理削除（`docs/specs/integrity/rules/IR-011-mapping-table-full-coverage.md` の削除）と同時に、req-impact-map.md の当該セクションを新設し交叉参照を移行する。Phase 2 §6.2 の物理削除スコープ（IR-011 ファイル本体、catalog エントリ、rule-ownership エントリ、req-impact-map エントリ、AUTOGEN ブロック、件数表示）のうち、req-impact-map.md エントリの取扱いを本判定で確定する。

**物理削除の実施**: OU-005（#2081）または OU-006（#2082）が責務。本 Phase 3 は再配置先の設計までとする。

### 7.4 MERGE 0件の再評価

Phase 2 §9.3 代替案から委譲。Phase 2 は保守的解釈で MERGE 採用0件としたが、Phase 3 での横断的再評価時に「統合による保守性向上」（件数削減以外の価値）を評価基準に加えるか否かを判定する。

**Phase 3 判定**: **MERGE 採用を見送り、Phase 5（OU-006）で再評価する**。

**根拠**:

- Phase 3 は設計判断まで。実体 MERGE（IR ファイル統合、catalog エントリ統合）は Phase 5 detector 実装時に実施する性質の作業である。
- 評価基準「統合による保守性向上」は REQ-028-005（共通 detector 統合可能性）で既に認められている。Phase 3 は同基準を採用し、§5.1 共通 detector 統合対象16件を特定した。この統合は IR catalog 上の MERGE ではなく、detector 実装レベルの統合である。
- IR catalog 上の MERGE（IR エントリ自体の統合による件数削減）は REQ-028-013「IR 件数削減数で評価しない」に照らして優先度が低い。Phase 5 で detector 実装時に、共通 detector 化された観点が IR catalog 上でも統合可能かを個別に判断する。

**Phase 5 での再評価候補**（Phase 2 §9.3 代替案から引用）:

| 現行判定 | IR | Phase 5 再評価内容 |
|---|---|---|
| KEEP | IR-015, IR-027, IR-039, IR-040, IR-041, IR-042 | 共通 detector `checkRetiredArtifactResidual` への統合可能性（IR-025, 037, 043 とデータ共有） |
| IMPLEMENT | IR-036, IR-037, IR-043 | 同上。ただし IR-036 は §5.2 inspect-docs 移管候補 |

**SPEC確定候補**: REQ-028-005 または `integrity-contracts.md` にて MERGE 判定基準（統合による保守性向上の評価軸、件数削減以外の価値基準）を明文化する。Phase 2 §10.3 SPEC確定候補と同一。本 Phase 3 は同 SPEC確定候補を継承し、新たな確定は発生しない。

## 8. detector 実装優先度（Phase 2 §7.3 の具体化）

Phase 2 §7.3 が示した優先度指針（severity: strict かつ delta-guard 含む IR は高優先度、heuristic/observation は中低優先度）を、Phase 3 §5 クラスタ分類に基づき具体化する。

| 優先度 | クラスタ | IR | Phase 5 実装指針 |
|---|---|---|---|
| 高 | グループ A retired strict | IR-025, IR-037, IR-043 | `checkRetiredArtifactResidual` + retired-artifact-registry.yaml 新設 |
| 高 | Command 形式系 | IR-028, IR-029, IR-030, IR-031 | `check_command_format.ts` 拡張 + command-format-rules.yaml 新設 |
| 高 | 委譲契約系 | IR-032, IR-033 | `checkDelegationContractResidual` + delegation-contract-patterns.yaml 新設 |
| 高 | 配布基盤系 | IR-046, IR-047, IR-048 | `checkDistributionBoundary` + distribution-targets.yaml 新設 |
| 高 | Command/skill 表記系 | IR-050, IR-051 | `checkExecutorNotation` 新設 |
| 中 | Skill 参照系 | IR-034, IR-035 | `check_integrity.ts` skill 検査クラスタ拡張 |
| 低（独立） | 観測/語彙系 | IR-052, IR-060 | 独立 detector 実装、語彙レジストリ協調 |
| 移管 | docs-check 外 / inspect-docs 移管 | IR-019, IR-022, IR-026, IR-036 | Phase 4（OU-005）で IR catalog 除外、inspect-docs 觀点登録 |

Phase 5（OU-006）は高優先度クラスタから順次実装する。中低優先度は高優先度完了後に実施する。移管対象は Phase 4 で実施する。

## 9. test_strategy 項目の結果

### 9.1 TS-015（対象: AG-005、Issue #2080 直接指定）

| 項目 | 値 |
|---|---|
| target_item | AG-005 |
| verification | migration 固有の検査が不必要に恒久 IR として増殖していないか、AG-006 の別種検査 registry と照合する |
| pass_criteria | migration 固有検査の恒久 IR 増殖構造が解消されている |
| 実施結果 | **部分達成（Phase 3 設計完了、Phase 5 実体完了予定）** |
| 評価 | AG-006 別種検査 registry は現状未存在（REQ-028-006 で要件化、Phase 4/5 で実装予定）。Phase 3 は migration residual 系5件をグループ化し、グループ A 3件（IR-025, 037, 043）を共通 detector + declarative data で統合、グループ B 2件（IR-026, 036）を inspect-docs 移管と判定。これにより恒久 IR 増殖構造は設計上解消される（3件→1 detector、2件→IR catalog 除外） |
| on_failure 適用 | 設計段階のため fix-and-reverify 対象外。Phase 5 実体統合時に再評価し、完全達成を確認する |

### 9.2 TS-016（対象: AG-005、Issue #2080 直接指定）

| 項目 | 値 |
|---|---|
| target_item | AG-005 |
| verification | MERGE された IR の有効な検出ケースが統合先の regression test で維持されていることを確認する |
| pass_criteria | MERGE 前後で検出ケースが維持されている |
| 実施結果 | **N/A（Phase 3 は MERGE 採用見送り）** |
| 評価 | Phase 2 は MERGE 採用0件、Phase 3 は MERGE 採用を見送り Phase 5 で再評価（§7.4）。Phase 3 段階で MERGE による検出ケース移行は発生しない。Phase 5 で MERGE 採用時に本 TS を有効化する |

## 10. Findings / Capture候補

### 10.1 docs-integrity（targeted docs guard 結果）

targeted docs guard（`check_changed_docs.ts --workflow case-run --base-ref origin/main --json`）の実行結果:

- 実行日時: 2026-08-11 (JST)
- 実行環境: worktree（`.worktrees/2080-feature`）。repo-agentdev-integrity スクリプトはジャンクション未伝播のため、メインリポジトリのスクリプトを絶対パス参照で起動
- 実行タイミング: (a) ファイル作成前（ステージ前）、(b) ファイル作成後（ステージ後）
- (a) exit code: 0、`files_checked: []`、`failures: []`。warning「対象ファイルが検出されませんでした（--base-ref 指定）」
- (b) exit code: 0、`files_checked` は新規ファイル1件、case-run profile で delta-guard 対象外（worktree マージ前）。`failures: []`
- 新規ファイル内の相対リンク（REQ-028, DEC-013, baseline, bidirectional-audit, classification, integrity-contracts, integrity-rule-catalog, rule-ownership, req-impact-map, runtime-package-boundary, delegation-contracts, command-file-format, numbering-policy）は手動検証済み（全て実在）

### 10.2 stale-reference（QG-3 前置 staleness check 結果）

- ファイルパス現行存在確認: 入力ドキュメント（baseline, bidirectional-audit, classification, REQ-028, DEC-013）全件存在。catalog/rule-ownership/integrity-contracts/req-impact-map/runtime-package-boundary/delegation-contracts/command-file-format/numbering-policy 存在。差異なし
- 検査結果件数再計測: 対象 HEAD（a81bdc7c）は Phase 2 判定 HEAD（edd81aff）の次コミット（PR #2086 merge commit）。Phase 2 → Phase 3 間で IR 実体、checker、catalog は不変更。大きなドリフトなし
- 差異検出時の引き渡し: ドリフトなし、引き渡し不要

### 10.3 intake 候補

- declarative data 化候補（§6）の実体 YAML ファイル設計は Phase 5 で必要。retired-artifact-registry、command-format-rules、distribution-targets、delegation-contract-patterns の4 YAML 形式仕様（スキーマ、配置先）の事前設計を Phase 4 または Phase 5 開始時に実施すべき候補として記録
- Phase 4（OU-005）で IR catalog から除外する4件（IR-019, 022, 026, 036）の inspect-docs 觀点レジストリ（移管先）設計が必要。現状 inspect-docs は観点を暗黙的に保持し、レジストリ化されていない。レジストリ化候補として記録

### 10.4 learning 候補

- （該当なし。本 Phase 3 設計過程で特筆すべき学習事項は検出されず）

## 11. SPEC確定候補

Phase 3 設計過程で発見された SPEC レベルの詳細。case-close Step 3 で SPEC 確定チェックの入力となる。

### 11.1 共通 detector と declarative data の分離原則

§6.5 で示した設計原則（正は SPEC、YAML は検出用ビュー、二重管理回避、IR lifecycle 影響なし、Phase 5 実体作成）を `integrity-contracts.md` または `validator-split-criteria.md` にて SPEC として明文化すべき候補。

**確定候補**: Phase 5 で YAML 実体作成時に同 SPEC を確定する。本 Phase 3 は設計原則の提示までとする。

### 11.2 inspect-docs 觀点レジストリの要件化

§7.1、§10.3 で示した inspect-docs 觀点レジストリ（現在暗黙的、レジストリ化未実施）を、REQ-028-007 意味判断検査移管の完了条件として要件化すべき候補。

**確定候補**: Phase 4（OU-005）で IR catalog から除外する4件（IR-019, 022, 026, 036）の移管先として、inspect-docs 觀点レジストリの実体設計を要件化する。

### 11.3 IR-057 恒久 IR 判定の記録

§7.2 で示した IR-057 恒久 IR 判定（現状維持、Phase 6 で再評価条件の明文化）を IR-057 ファイル本文へ反映すべき候補。Phase 2 §10.2 SPEC確定候補を本 Phase 3 判定で具現化した。

**確定候補**: Phase 4 または別途 spec-save 工程で IR-057 ファイルへ追記する。本 Phase 3 は判定記録までとする。

## 12. Phase 3 完了条件の達成状況

| 完了条件（Issue #2080） | 達成状況 | 証拠 |
|---|---|---|
| migration residual 系 IR のグループ化が完了している | 達成 | §3.2 migration residual 系クラスタ5件（IR-025, IR-026, IR-036, IR-037, IR-043）のグループ化、§3.3 IMPLEMENT 22件全クラスタ分類 |
| 各グループの統合可能性評価（4軸: detection method / severity / 例外 / failure semantics）が記録されている | 達成 | §4 各クラスタの4軸評価表（§4.2〜§4.9） |
| 共通 detector 統合対象の IR 群と、統合対象外の IR 群が明示されている | 達成 | §5.1 統合対象16件、§5.2 対象外6件（うち4件は inspect-docs 移管）、§5.3 集計表 |
| declarative data 化移行候補が特定されている | 達成 | §6.1 retired-artifact-registry、§6.2 command-format-rules、§6.3 distribution-targets、§6.4 delegation-contract-patterns、§6.5 設計原則 |

> **adversarial-review に関する注記**: Issue #2080 本文の adversarial-review 発動条件は「ユーザー明示指定時のみ記録」である。ユーザー明示指定がないため、本 Phase 3 は経路G（REQ-015-003）の skip 条件（実装方針が自明、意味的決定なし）該当性によらずユーザー指定不在により review を実施しない。ただし Phase 3 は横断的統合設計という意味的決定を含むため、skip 条件（自明な実装方針、単一ファイル編集等）には該当しない。ユーザー明示指定がない場合の取扱いは REQ-015-002/003 に従い review を省略し、設計判断の重要事項（グループ A/B の振り分け、IR catalog 除外4件、IR-057 恒久 IR 推奨等）は本ファイル §3〜§7 と PR 本文 Findings に記録し、PR マージ後に case-auto 親または個別 review で判断可能とする。

## 関連情報

- 根拠 Issue: #2080（OU-004 Phase 3）
- 親 Epic: #2076（REQ-028 IR portfolio audit）
- 根拠要件: [REQ-028](../../../requirements/REQ-028.md)
- 根拠 Decision: [DEC-013](../../../decisions/DEC-013.md)
- Phase 2 判定結果（入力）: [classification-20260811.md](classification-20260811.md)
- Phase 1 監査結果（入力）: [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md)
- 比較基準（Phase 0 baseline）: [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md)
- 整合性契約: [../integrity-contracts.md](../integrity-contracts.md)
- ルールカタログ: [../integrity-rule-catalog.md](../integrity-rule-catalog.md)
- ルール所有権: [../rule-ownership.md](../rule-ownership.md)
- REQ 影響マップ: [../../responsibilities/req-impact-map.md](../../responsibilities/req-impact-map.md)
- 委譲契約 SPEC（IR-032/033 参照）: [../../workflows/delegation-contracts.md](../../workflows/delegation-contracts.md)
- runtime-package-boundary SPEC（IR-046/047/048 参照）: [../../local/runtime-package-boundary.md](../../local/runtime-package-boundary.md)
- Command file format SPEC（IR-028/029/030/031 参照）: [../../authoring/command-file-format.md](../../authoring/command-file-format.md)
- 採番管理 SPEC（IR-011 交叉参照再配置協調先）: [../../foundations/numbering-policy.md](../../foundations/numbering-policy.md)
- 次 Phase（Phase 4）: OU-005 #2081（IR 管理モデル再設計、DEC-013 apply）
- 次 Phase（Phase 5）: OU-006 #2082（判定結果適用、scale:large）
