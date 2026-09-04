---
id: AUDIT-REQ-057-INTEGRITY-SUITE-IMPLEMENTATION
title: "REQ-057-011/012 integrity suite 実装完遂と宣言付与の監査記録"
status: accepted
created: 2026-09-04
audit_for: REQ-057-011 / REQ-057-012 / Issue #2569
parent_epic: "#2553 (ru-batch-20260903 Epic 1)"
base_ref: f1637373 (origin/main)
---

<!-- ADF-COVERS(implementation): REQ-057-011, REQ-057-012 -->

# REQ-057-011/012 integrity suite 実装完遂と宣言付与の監査記録

> **位置づけ**: 本ファイルは Issue #2569（OU-018）の実行成果物である。Case 冒頭の traceability check 現行計上再確認の結果、integrity suite 正規形実行の結果、REQ-057-011 / REQ-057-012 分の実装残存分特定結果、ADF-COVERS 実装対応宣言の付与状況を記録する。検証対応要否カタログ上、両 REQ 行は検証対応任意行であるが、本監査レポートは配置先カタログ (c)「テスト対象契約を所有する REQ のカバレージ記録または監査レポート」に従う宣言配置先でもある。監査時点の HEAD は f1637373（worktree `.worktrees/2569-case`、branch `case/issue-2569`）。

## 1. Case 冒頭の missing-implementation 現行計上再確認

Issue #2569 の完了条件1に基づき、Case 冒頭で traceability check の現行計上を再確認した。
実行コマンドと結果は次のとおりである。

```
bun run src/check.ts --root <worktree-root> --req REQ-057-011,REQ-057-012
```

| 検査 | 結果 | 件数 |
|---|---|---|
| missing-implementation | pass | 0 件（completenessScope: REQ-057-011、REQ-057-012） |
| missing-verification | pass | 0 件 |
| unknown-roles | pass | 0 件 |
| unknown-req-refs | pass | 0 件 |
| invalid-catalog-refs | pass | 0 件 |
| evidence-unavailable | pass | 0 件 |
| malformed-declarations | fail | 1 件（§4 由来分類を参照） |

coverage の現行計上（宣言の付与済み成果物）:

| REQ | role | 成果物 | 付与経緯 |
|---|---|---|---|
| REQ-057-011 | implementation | `check_workflow_preventive.test.ts`（冒頭コメント） | #2529（Issue #2511・OU-006、2026-09-02） |
| REQ-057-011 | verification | `check_workflow_preventive.test.ts`（冒頭コメント） | #2529（同上） |
| REQ-057-011 | implementation | `commands_e2e.test.ts`（冒頭コメント） | #2529（同上） |
| REQ-057-011 | verification | `commands_e2e.test.ts`（冒頭コメント） | #2529（同上） |
| REQ-057-012 | implementation | `docs/designs/skills/agentdev-git-worktree-test-fallback.md`（冒頭コメント） | #2536（Issue #2519・OU-007、2026-09-02） |
| REQ-057-012 | verification | `trusted-distribution-gate/archive-builder.test.ts`（冒頭コメント） | #2536（同上） |

再確認の結論: REQ-057-011 / REQ-057-012 分の missing-implementation 計上は 0 件であり、両 REQ の実装対応・検証対応宣言は先行マージ（#2529、#2536）で付与済みである。本 Issue は追加の欠落宣言を持たない。

## 2. 実装残存分の特定結果

Issue 本文の対象範囲ごとに、base f1637373 時点の現状から残存分を特定した。残存分は 0 件である。

| 対象範囲 | 現状 | 残存分 |
|---|---|---|
| `check_workflow_preventive.test.ts` の ≥18 比較 | `report.stats.public_commands` に対する最小件数下限（minimum floor）比較。Design（`agentdev-quality-gates.md`「full integrity suite 合格基準（QG-4）」節）が「期待値の導出には最小件数下限の検証を併設し、漏れ検出の意味を損なわない」ことを方針として明記しており Design 準拠 | なし |
| `commands_e2e.test.ts` の期待値 | `deriveExpectedCommands`（実コマンド列挙からの動的導出）導入済み。導出関数の動作確認テスト（新規コマンド追加が期待値へ反映されること）付き。`validCommands` は `EXPECTED_COMMANDS` から動的導出 | なし |
| `third-party-sync.md:24` の STEP 識別子 | `/\bSTEP-[A-Z]?\d/` 形式の Workflow Skill 内部 STEP 識別子は存在しない。`check_command_format.ts` の実行（exit 0）で確認 | なし |
| integrity suite テスト期待値（コマンド数・列挙） | 固定コマンド数期待値は存在しない。README listing 一致検査も `EXPECTED_COMMANDS`（動的導出）基準 | なし |
| REQ-057-012（flaky・並行衝突・title 不一致・型エラー・Tracking 行） | archive-builder staging テストの flaky 要因は #2536 で設計修正済み。正規形実行（§3）で REQ-057-012 起因の fail・error は発生しない。テンプレート Tracking 行保持は正規形実行の regression 系テストで検証済み | なし |

## 3. integrity suite 正規形実行（TS-018 検証）

QG-4 正規形（`agentdev-quality-gates` Design「bun test フル suite 正規形（実行形態契約）」節と `qg-4-final-acceptance.md` 参照）に従い、分割① integrity suite を実行した。

- **実行環境**: Windows（pwsh 7 経由 node spawnSync）、worktree `.worktrees/2569-case`、junction は部分的（`.opencode/skills/` は `repo-agentdev-integrity` のみが worktree 固有）、依存パッケージは `bun install`（integrity scripts 配下）と `bun install --cwd src/opencode/skills/agentdev-project-extensions/scripts`（zod 解決）を実施済み
- **起動コマンド**: `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/`（`./` prefix 付き、cwd は worktree root）
- **実行件数**: `Ran 2549 tests across 102 files`（2547 pass / 2 fail / 6324 expect() calls）

fail 全件の由来分類（baseline 基準: base f1637373、remediation 開始前）:

| fail | 由来分類 | 根拠 |
|---|---|---|
| `REQ-048-001/002/006 ... issue_desc_epic.md > 配布物内部 ID（REQ-XXXX 数字つき）を含まない` | 既知欠陥（REQ-048 スコープ・pre-existing flake） | Issue #2569 委譲時の構造化文脈が REQ-048 template 2 件を pre-existing と明示。REQ-048（実行観測基盤）のスコープであり REQ-057-011/012 と無関係 |
| `REQ-048-001/002/006 ... issue_desc_child.md > 配布物内部 ID（REQ-XXXX 数字つき）を含まない` | 同上 | 同上 |

REQ-057-011 / REQ-057-012 分の integrity suite 関連テストは全件 pass である。

## 4. malformed-declarations 1 件の由来分類

traceability check の malformed-declarations が 1 件 fail する。由来分類は既知欠陥（REQ-057-011/012 スコープ外）である。

- 検出対象: `scripts/lib/distribution-boundary.test.ts` L1367 のテストフィクスチャ文字列（`REQ-\u0030\u0031` 形式のエスケープを含む ADF-COVERS マーカー風文字列）
- 由来: #2578（OU-016・Issue #2558）が当該フィクスチャを追加した際、宣言形式（コロンと正規 REQ ID の ID リスト）を満たさない文字列が宣言コーパス走査の対象に含まれた
- 処置方針: 本監査では是正しない。当該テストは REQ-029（配布依存境界）系の契約テストであり、修正方針（フィクスチャ文字列の変更か、宣言走査対象の絞り込みか）は設計判断を伴う。PR 本文の Findings / Capture 候補へ記録し、追跡 Issue 化の候補とする

## 5. ADF-COVERS 実装対応宣言の付与状況

REQ-057-011 / REQ-057-012 に対する ADF-COVERS 実装対応宣言を、実装完遂の確認（§2）後、配置先カタログ（`artifact-responsibilities.md`「ADF-COVERS 実装対応宣言の正規配置先カタログ」）に従い本監査レポートへ付与する。

- **付与対象**: REQ-057-011、REQ-057-012
- **配置先カタログ区分**: (c) 検証コード（test）→ テスト対象契約を所有する REQ のカバレージ記録または監査レポート
- **付与形式**: 本ファイル冒頭の HTML コメント。正規形式（宣言ロール、コロン、正規 REQ ID の ID リスト）とする
- **先行付与の取扱い**: #2529 / #2536 で付与済みの既存宣言（§1 の coverage 計上）は保全する。本監査レポートへの付与は docs 配下正規成果物（REQ-057-005、REQ-057-019 準拠）への配置を補完するものであり、既存宣言の削除・移動を行わない
- **重複付与の回避**: 本付与は OU-016（#2558）との責務分界に従う。OU-016 は REQ-057-011/012 分を本 Issue（OU-018）の所有として付与しておらず、重複は生じない

## 6. 境界

- 本監査は REQ-057-011 / REQ-057-012 分のみを対象とする。他の REQ 行の宣言付与は OU-016 の段階的付与（残存分の後続 Case 継承）に属する
- 本監査は REQ/Design の内容判断・修正を行わない。integrity suite スクリプトの実装変更も行わない（残存分 0 件のため変更不要）
- 検証対応要否カタログ上、REQ-057-001..022 は検証対応任意行である。本監査の検証対応宣言の付与は任意行の枠組みを変更しない

## 7. 既知 fail の解消記録（事後追記、Issue #2600）

§3 に由来分類した fail 2件（`issue_desc_epic.md` / `issue_desc_child.md` の配布物内部 ID（REQ-XXXX 数字つき）検出）は、REQ-048 再構築 Epic #2596 Wave 3（Issue #2600、OU-003 / WP-03）の実行により解消された。本節は解消後の追記であり、§3 本体の監査時点記録を変更しない。

- **解消実行日**: 2026-09-05
- **解消内容**: `issue_desc_epic.md` / `issue_desc_child.md`（src 原本）から配布物内部 ID（REQ-017-017 の3箇所）を除去し、ID 非依存の表現（実現面投影契約への概念参照）へ変更した。あわせて契約テスト2本（execution_ident_contract.test.ts / verification_diff_contract.test.ts）を anti-shrink 契約（旧 REQ-048-019）の分解廃止（AG-005 合意）に伴い、新 REQ-048 の意図（相関・finding 比較能力の検証）へ再構成した
- **解消 PR**: （PR 番号は作成後に埋め戻し）
- **検証結果**: `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/execution_ident_contract.test.ts ./.opencode/skills/repo-agentdev-integrity/scripts/verification_diff_contract.test.ts` で 68 pass / 0 fail / 707 expect() calls（実行環境: worktree `.worktrees/2600-feature`、bun 1.3.6、Windows）
- **残存既知 fail の更新後一覧**: §3 の fail 2件はすべて解消。§4 の malformed-declarations 1件（`distribution-boundary.test.ts` フィクスチャ文字列由来）は本 Issue の対象外として残存（追跡 Issue 化候補のまま）
