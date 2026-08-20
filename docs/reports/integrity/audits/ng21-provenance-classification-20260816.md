---
id: AUDIT-NG21-PROVENANCE-OU002
title: "check_integrity NG=21 由来分類と解消記録（OU-002 #2136）"
status: accepted
created: 2026-08-16
audit_for: REQ-010 / DEC-013
source_issue: "#2136 (OU-002)"
parent_epic: "#2134 (横断整合性是正)"
source_ru: "RU-0003 (AG-005, TS-003)"
baseline_ref: pre-audit-baseline-20260811.md
observed_report: ".agentdev/integrity/reports/2026-08-15-integrity-report-5.md（メインリポジトリ、Wave 1 マージ前観測）"
captured_at_head: 40b5d880
---

# check_integrity NG=21 由来分類と解消記録（OU-002 #2136）

> **位置づけ**: 本ファイルは RU-0003（AG-005）に由来する「check_integrity NG=21 全件の由来分類と解消」の実行記録である。
> 対象の NG=21 は 2026-08-15（Wave 1 マージ前）の `check_integrity.ts --json` 実行で観測された `level=ng` 21 件である。
> index-generation-consistency 系4件は OU-001（#2135、PR #2148）の AUTOGEN 再生成結果を参照して分類した（本 OU の必須依存）。
> 編集方針は Issue #2136 の実行契約に従い、docs/** の broken reference 修正と承認済み baseline entry の二手段で解消した。

## 1. 判定メタデータ

| 項目 | 値 |
|---|---|
| 判定実施日 | 2026-08-16 (JST) |
| 対象 HEAD | `40b5d880`（Wave 1 マージ後。OU-001 の AUTOGEN 再生成結果を含む） |
| worktree | `.worktrees/2136-feature` (branch: `feature/issue-2136`) |
| 元 NG=21 観測時点 | 2026-08-15 14:15、`.agentdev/integrity/reports/2026-08-15-integrity-report-5.md`（REQ 35件、 Specs 164件 の時点） |
| 観測時点の内訳 | LinkIntegrity 14、LifecycleBoundary 1、integrity-rule-gap 1、CaptureBoundary 1、IndexGenerationConsistency 4 |
| 根拠要件 | REQ-010（自己監査・検出・診断責務）、RU-0003（AG-005、TS-003） |
| 根拠 Decision | DEC-013（解消不能な既知欠陥は承認済み baseline entry として管理） |
| baseline 手続き | [integrity-contracts.md](../integrity-contracts.md)「NG baseline 運用手順」 |
| 比較基準 | [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md)（REQ-028 監査系の旧来の参照記録） |

## 2. 由来分類表（21件全件）

由来ラベルは legacy / superseded / AUTOGEN / 実欠陥 の4種とする。
解消状態は fixed-here（本 OU で修正）/ already-resolved-by-OU-001（Wave 1 で解消済み）/ regenerated-here（本 OU で AUTOGEN 再生成）/ approved-baseline-entry（承認済み baseline entry として管理）の4種とする。

| # | 検出 | 対象 | 観測内容 | 由来ラベル | 解消手段 | 解消状態 |
|---|---|---|---|---|---|---|
| N01 | broken-adr-ref | `docs/requirements/REQ-021.md` | v2:ADR-006 参照（移行済み ADR。現 DEC-006） | legacy | baseline entry（docs/requirements/** は本 OU の編集禁止範囲） | approved-baseline-entry |
| N02 | broken-req-ref | `docs/specs/authoring/vocabulary-registry.md` | v2:REQ-0145-007 の旧表記（v2: 接頭辞なし） | superseded | `v2:REQ-0145-007` 表記へ更新、参照先 repo-local パスへ修正 | fixed-here |
| N03 | broken-file-link | `docs/specs/integrity/audits/bidirectional-audit-20260811.md` | `../../requirements/REQ-028.md`（深さ不足） | legacy | `../../../requirements/REQ-028.md` へ修正 | fixed-here |
| N04 | broken-file-link | `docs/specs/integrity/audits/bidirectional-audit-20260811.md` | `../../decisions/DEC-013.md`（深さ不足） | legacy | `../../../decisions/DEC-013.md` へ修正 | fixed-here |
| N05 | broken-file-link | `docs/specs/integrity/audits/final-reverification-20260811.md` | `pre-audit-baseline-20260811.md`（baselines/ 配下への相対不足、3箇所） | legacy | `../baselines/pre-audit-baseline-20260811.md` へ修正（3箇所） | fixed-here |
| N06 | broken-file-link | 同上 | 同上（2箇所目） | legacy | 同上 | fixed-here |
| N07 | broken-file-link | 同上 | 同上（3箇所目） | legacy | 同上 | fixed-here |
| N08 | broken-file-link | `docs/specs/integrity/audits/final-reverification-20260811.md` | `../../decisions/DEC-013.md`（深さ不足） | legacy | `../../../decisions/DEC-013.md` へ修正 | fixed-here |
| N09 | broken-file-link | `docs/specs/integrity/audits/final-reverification-20260811.md` | `../../requirements/REQ-028.md`（深さ不足） | legacy | `../../../requirements/REQ-028.md` へ修正 | fixed-here |
| N10 | broken-file-link | `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md` | `../../requirements/REQ-028.md`（深さ不足） | legacy | `../../../requirements/REQ-028.md` へ修正 | fixed-here |
| N11 | broken-file-link | `docs/specs/integrity/baselines/pre-audit-baseline-20260811.md` | `../../decisions/DEC-013.md`（深さ不足） | legacy | `../../../decisions/DEC-013.md` へ修正 | fixed-here |
| N12 | broken-adr-ref | `docs/specs/skills/agentdev-artifact-graph.md` | v2:ADR-006 参照（現 DEC-006） | legacy | DEC-006 参照へ更新 | fixed-here |
| N13 | broken-file-link | `docs/specs/skills/agentdev-doc-diagnostics.md` | `agentdev-doc-map.md`（DOC-MAP 依存除去済み、REQ-013） | superseded | See Also の当該行を除去 | fixed-here |
| N14 | broken-file-link | `docs/specs/skills/agentdev-req-file-manager.md` | `agentdev-doc-map.md`（同上） | superseded | See Also の当該行を除去 | fixed-here |
| N15 | workflow-status-prohibition | `docs/specs/foundations/system.md:163` | SPEC 本文中の durable state 列挙行（frontmatter 項目名 title/status/created/updated を含む）が 6 マイクロフェーズ検出に一致 | 実欠陥 | baseline entry（SPEC 本文の記述再構成は本 OU の範囲外。検出器の列挙行除外も checker 側変更） | approved-baseline-entry |
| N16 | skill-category-gap | `.opencode/skills/repo-agentdev-integrity/SKILL.md` | 検査カテゴリ「Skill rename 対称性」が gap detector の category-to-check-pattern map に未登録 | 実欠陥 | baseline entry（map 追加と対象スクリプト登録は checker 側変更。検証能力自体は `check_skill_rename_symmetry.ts` が既に提供） | approved-baseline-entry |
| N17 | command-capture-duty | `src/opencode/commands/agentdev/case-close.md` | capture-boundaries 参照の記述欠落 | 実欠陥 | baseline entry（配布物コマンドの編集は本 OU の範囲外。OU-007 配布物是正で参照追加を予定） | approved-baseline-entry |
| N18 | index-generation-consistency | `docs/specs/integrity/integrity-rule-catalog.md` | IR-005 表記の AUTOGEN ブロック不整合（ADR ↔ REQ → Decision ↔ REQ） | AUTOGEN | OU-001（PR #2148）の再生成で解消済み | already-resolved-by-OU-001 |
| N19 | index-generation-consistency | `docs/specs/integrity/rule-ownership.md` | 同上の IR-005 表記不整合 | AUTOGEN | OU-001（PR #2148）の再生成で解消済み | already-resolved-by-OU-001 |
| N20 | index-generation-consistency | `docs/specs/quality/req-health-metrics.md` | req-metrics-measurement-example ブロックの陈腐化（OU-001 が 2026-08-15 に再生成後、計測日導出の暫定陳腐化） | AUTOGEN | 本 OU で generate_indexes.ts を再実行（計測日 2026-08-16） | regenerated-here |
| N21 | index-generation-consistency | `docs/specs/quality/spec-health-metrics.md` | spec-metrics-measurement-example ブロックの陈腐化（同上） | AUTOGEN | 本 OU で generate_indexes.ts を再実行（計測日 2026-08-16） | regenerated-here |

### 2.1 分類集計

| 由来ラベル | 件数 | 該当 |
|---|---|---|
| legacy | 11 | N01, N03〜N12 |
| superseded | 3 | N02, N13, N14 |
| 実欠陥 | 3 | N15, N16, N17 |
| AUTOGEN | 4 | N18〜N21 |

| 解消状態 | 件数 | 該当 |
|---|---|---|
| fixed-here | 13 | N02〜N14 |
| already-resolved-by-OU-001 | 2 | N18, N19 |
| regenerated-here | 2 | N20, N21 |
| approved-baseline-entry | 4 | N01, N15, N16, N17 |

N03〜N11 の深さ不足は、audits/・baselines/ サブディレクトリ配下への移設時に相対リンクの深さを更新しなかった移設起因である。
同一ディレクトリの `classification-20260811.md`・`cross-cutting-integration-design-20260811.md` が当初から `../../../` 表記であることが、修正後の表記の妥当性の根拠である。

## 3. NG=21 外の warning レベルの扱い

元観測時点で warning 12 件（Decision 引用 11 件、ir035 See Also 1 件）があり、本 OU の分類対象外である。
ただし完了条件「新規かつ未管理の NG が 0 件」の達成性に関わるため、以下の処置を行った。

| 区分 | 件数 | 処置 |
|---|---|---|
| accepted 以外の Decision 引用（DEC-005 superseded、DEC-008/015/016 proposed） | 11 | 承認済み baseline entry として登録（provenance: proposed-decision-citation / superseded）。Decision の昇格または SPEC 再構成のいずれかで解消される既知事項であり、docs 横断是正（OU-009）の対象 |
| ir035 See Also 参照切れ（`agentdev-adr-guidelines`、旧名称） | 1 | 本 OU で修正（`agentdev-decision-file-manager` へ更新。repo-local skill ファイルの broken reference） |
| ir035 See Also 参照（worktree 環境残差） | 4 | 無処置。worktree の junction 未伝播に由来する環境差分であり、メインリポジトリでは当該ディレクトリ（agentdev-req-file-manager、agentdev-decision-file-manager、agentdev-gh-cli、agentdev-workflow-templates）が存在するため検出されない |

## 4. 承認済み baseline entry

`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` へ `--update-ng-baseline --ng-baseline-additions` で追加した承認済み entry の一覧。
各 entry は provenance（由来ラベル）と reason（承認理由）を持つ。

| bucket（category/check/file） | 件数 | provenance | 承認理由の要旨 |
|---|---|---|---|
| LinkIntegrity / broken-adr-ref / `docs/requirements/REQ-021.md` | 1 | legacy | v2:ADR-006 は DEC-006 へ移行済み。docs/requirements/** は本 OU の編集禁止範囲のため、参照更新（DEC-006 へ）を別工程で実施するまでの承認 |
| LifecycleBoundary / workflow-status-prohibition / `docs/specs/foundations/system.md` | 1 | 実欠陥 | SPEC 本文の正当な durable state 列挙行が検出パターンに一致する既知欠陥。SPEC 再構成または検出器の列挙行除外までの承認 |
| integrity-rule-gap / skill-category-gap / `.opencode/skills/repo-agentdev-integrity/SKILL.md` | 1 | 実欠陥 | category-to-check-pattern map への登録遗漏。checker 側変更として map 追加と `check_skill_rename_symmetry.ts` の対象登録を行うまでの承認 |
| CaptureBoundary / command-capture-duty / `src/opencode/commands/agentdev/case-close.md` | 1 | 実欠陥 | capture-boundaries 参照の記述欠落。配布物コマンドの編集を要し、OU-007 の配布物是正で実施するまでの承認 |
| Decision / accepted-adr-only-citation（SPEC 7ファイル） | 11 | proposed-decision-citation 10、superseded 1 | proposed Decision を根拠として引用する意図的な記述。Decision の accepted 昇格または SPEC 再構成（OU-009）で解消するまでの承認 |

## 5. 検証結果（TS-003）

| 項目 | 値 |
|---|---|
| 実行コマンド | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json` |
| 修正前（本 worktree、HEAD 40b5d880） | NG 19 件、Warning 15 件、新規かつ未管理 34 件（delta） |
| 元観測時点（メインリポジトリ、Wave 1 前） | NG 21 件、Warning 12 件 |
| 修正・再生成・baseline 適用後 | NG 0 件、Warning 4 件（ir035 の worktree 環境残差のみ）。delta 報告: `4 baseline-known (demoted to info), 14 approved additions (provenance-tracked, demoted to info), 4 new unmanaged NG`。新規かつ未管理 4 件は全て ir035 で junction 未伝播由来（worktree の `.opencode/skills/agentdev-*` は 0 ディレクトリ、メインリポジトリは 48 ディレクトリで See Also 参照先4件すべて実在） |

判定: 21件全件に由来ラベルが付き、実欠陥分類のうち本 OU で修正可能な全件（N02〜N14、N20〜N21）を解消した。
残る N01/N15/N16/N17 は provenance・reason を付与した承認済み baseline entry として管理する（`ng-baseline.json` への追加 15 entry = N01/N15/N16/N17 の4件 + Decision 引用 warning 11件）。
メインリポジトリ（junction 実在環境）では新規かつ未管理の NG は 0 件となる。

回帰確認: `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` 全 1991 test 合格（83 ファイル、fail 0）。

## 6. 残存課題

- **計測日の日次陳腐化構造（N20/N21 の再発要因）**: `generate_indexes.ts` は計測日を実行時の日付で導出する。このためコミット済み AUTOGEN ブロックは翌日に鮮度を失い、index-generation-consistency が再検出する構造である。本 OU の再生成は 2026-08-16 時点の整合を回復する暫定解であり、恒久解決には計測日導出の安定化（例: 最終コミット日付の利用）が必要である。SPEC確定候補として PR 本文に記録した。
- **N01 の参照更新**: REQ-021 本文の v2:ADR-006 参照は DEC-006 への更新が正解であるが、docs/requirements/** が本 OU の編集禁止範囲であるため未実施。req-save 工程または docs 横断是正（OU-009）での更新を提案する。
- **N16 の map 登録遗漏**: `check_integrity.ts` の `categoryToCheckPattern` map と対象スクリプト一覧への `check_skill_rename_symmetry.ts` 登録は checker 側変更で解消する。次回 checker 改修時に反映する。
- **N17 の capture-boundaries 参照**: `src/opencode/commands/agentdev/case-close.md` への capture-boundaries 参照追加は配布物是正（OU-007）の対象である。
- **ir035 の worktree 誤検出**: ir035-skill-see-also-reference は `.opencode/skills/` のディレクトリ実在のみを検証するため、junction 未伝播の worktree 環境で誤検出する。`src/opencode/skills/` への fallback 実装（OU-004 と同種の環境依存解消）を提案する。

## 7. 関連情報

- 根拠 Issue: #2136（OU-002）
- 親 Epic: #2134（横断整合性是正、OU-001〜OU-010）
- 依存: OU-001（#2135、PR #2148。AUTOGEN 再生成結果）
- 整合性契約: [integrity-contracts.md](../integrity-contracts.md)
- ルールカタログ: [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- 比較基準（REQ-028 監査系 baseline 記録）: [pre-audit-baseline-20260811.md](../baselines/pre-audit-baseline-20260811.md)
- Phase 1 双方向監査: [bidirectional-audit-20260811.md](bidirectional-audit-20260811.md)
