---
title: case-run Design
status: accepted
created: 2026-06-21
updated: "2026-11-18"
---

<!-- ADF-COVERS(implementation): REQ-021-015, REQ-021-016, REQ-021-017, REQ-021-019, REQ-021-020, REQ-021-022, REQ-035-002, REQ-122-012, REQ-122-014 -->
<!-- ADF-COVERS(implementation): REQ-119-004 -->
<!-- ADF-COVERS(design): REQ-021-015, REQ-021-016, REQ-031-006, REQ-031-015, REQ-031-016, REQ-031-027, REQ-031-033, REQ-031-034, REQ-031-035, REQ-035-012, REQ-035-021 -->
<!-- ADF-COVERS(design): REQ-031-036（委譲指示規律の docs 配下パス抽象化参照設計） -->
<!-- ADF-COVERS(design): REQ-108-017, REQ-108-018, REQ-108-019, REQ-108-020（重要変更の通知と結果説明節。AG-001・003〜005 に対応） -->
<!-- ADF-COVERS(design): REQ-031-001, REQ-031-002, REQ-031-003, REQ-031-004, REQ-031-005, REQ-031-007, REQ-031-008, REQ-031-009, REQ-031-010, REQ-031-011, REQ-031-013, REQ-031-014, REQ-031-017, REQ-031-018, REQ-031-019, REQ-031-020, REQ-031-021, REQ-031-022, REQ-031-023, REQ-031-024, REQ-031-025, REQ-031-026, REQ-031-028 -->
<!-- ADF-COVERS(implementation): REQ-015-010, REQ-015-011 -->
<!-- ADF-COVERS(implementation): REQ-017-007, REQ-017-008, REQ-017-010, REQ-017-011, REQ-017-013, REQ-017-016 -->
<!-- ADF-COVERS(implementation): REQ-031-001, REQ-031-002, REQ-031-003, REQ-031-004, REQ-031-005, REQ-031-006, REQ-031-007, REQ-031-008, REQ-031-009, REQ-031-010, REQ-031-011, REQ-031-012, REQ-031-013, REQ-031-014, REQ-031-015, REQ-031-016, REQ-031-017, REQ-031-018, REQ-031-019, REQ-031-020, REQ-031-021, REQ-031-022, REQ-031-023, REQ-031-024 -->
<!-- ADF-COVERS(implementation): REQ-007-001, REQ-007-002, REQ-007-003, REQ-007-004, REQ-007-005, REQ-031-001, REQ-031-002, REQ-031-003, REQ-031-004, REQ-031-005, REQ-031-006, REQ-031-009, REQ-031-010, REQ-031-011, REQ-031-012, REQ-031-015, REQ-031-016, REQ-031-017, REQ-031-018, REQ-031-019, REQ-031-020, REQ-031-021, REQ-031-022, REQ-031-023, REQ-031-024, REQ-035-011 -->
<!-- ADF-COVERS(design): REQ-017-022 -->
<!-- ADF-COVERS(implementation): REQ-104-009, REQ-104-010, REQ-104-011, REQ-104-012（採用規約の解決の実行経路接続節） -->

# case-run Design

本 Design は骨格（公開契約と制御フロー）と references/ 詳細仕様の2層構成である。gate 意味論・検査手順・検証記録・委譲モデルの詳細は references/case-run/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。

本 Design が定義する case-run は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。case-auto によるインライン実行の内部段階である点を含む。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

与えられた単一 Issue を実行担当サブエージェントへ委譲し、result を処理する。case-run は常に単一 Issue を処理し、Epic や Wave を処理対象とする実行契約は case-auto の orchestration が単一所有する（REQ-031-006、REQ-031-015、DEC-041）。
worktree前提、委譲、結果処理を責務とする。
3フェーズ構成でべき等性、再開ポイントを提供する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない（REQ-011、v2:ADR-0128）。
execution contract に投影された実現面の変更方針（realization_actions 由来。REQ-017）は既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、その範囲内の内部実装方針（関数配置、命名、データ構造、実装順序、具体的 diff）だけを決定する。実現責務の変更が必要と判断した場合は既存の blocked 境界に従う。
## 委譲契約

case-run から実行担当サブエージェントへの委譲契約を以下に正規化する。

- **委譲先**: case-run は実行担当サブエージェントへ実装作業を委譲する。起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-002-002）。
- **adapter skill**: AgentDevFlow 側の case-run 実行 adapter skill（`agentdev-case-run-execution-adapter`）を指定する。adapter skill は委譲契約、result 契約、worktree 隔離等の case-run 固有知識を提供する。adapter skill 経由で委譲を起動する。
- **委譲 prompt**: 実行 command を prompt 内に含めて委譲する。実行担当サブエージェントは prompt 内で指定された command を起動する。command の具体名は AGENTS.md および references/<harness>.md 参照。
- **実行主体分類**: 委譲 prompt 内で実行される command は skill ではなく command である。`load_skills` には command 名を指定せず、adapter skill 名を指定する。
- **完了条件の検証項目の test-fix ループ（REQ-031-008/030）**: 完了条件に検証項目（3要素構造: verification / pass_criteria / on_failure）が含まれる場合、委譲契約は各項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントに要求する。詳細な責務は adapter skill（`agentdev-case-run-execution-adapter`）が定義する。

## 承認・HITL 境界

- case-run 本体の承認点を持たない（Issue に確定済みの execution contract を再判断せず消費する）。
- result が blocked / failed の場合はユーザー判断待ちとして扱い、blocker 詳細は Issue コメントへ SSoT として記録する（Issue 本文更新は case-ready / case-revise の責務、REQ-031-010 準拠。case-run 単独では Issue 本文を書き換えない）。
- クリーンアップフェーズで未コミット変更を検出した場合は報告してユーザーの指示に従う（自動的な破棄、コミットを行わない）。

## 入力

- Issue番号またはURL（要件doc埋め込み済み）（単一 Issue 実行モード。case-run が受理するのは常に単一 Issue 入力であり、Epic Issue 入力経由の Wave 実行制御は case-auto の orchestration stage 3 へ移転済み（REQ-031-015、DEC-041）。Epic Issue 入力の扱いは現行実装に沿って case-auto 経由の正規呼出へ限定し、case-run 自身の Wave 構成読み取り・fan-out を行わない）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## 副作用

- worktree 作成: `.worktrees/{N}-{type}/`（`agentdev-git-worktree`）
- git fetch: Epic Wave 実行時、PR merge 後再開時に worktree 作成前に `git fetch origin` を実行し origin/main 鮮度確認（REQ-031-002）
- GitHub API: PR 作成は実行担当サブエージェントが実施。case-run 本体は Issue コメント読取のみ
- intake / learning capture: PR 本文記録のみ（直接 inbox 変更禁止）

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-run`）が正規情報源である。
Workflow Skill は常に単一 Issue 実行（single workflow）として動作する。Epic Wave 実行（epic-wave workflow）の実行契約は廃止され、Wave 実行制御は case-auto の orchestration stage 3 が単一所有する（REQ-031-015、DEC-041）。

### フェーズ判定（再開ポイント検出、実行モード分岐）

`agentdev-workflow-orchestration` に従い再開フェーズを判定。実行モード分岐:
- 単一 Issue 実行モード: case-run は常に単一 Issue を処理し、当該1 Issue を実行担当サブエージェントに委譲する。Epic Issue 入力経由での Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動は行わない（REQ-031-015）。Epic 再指定時の次 Wave 処理も引き受けない（Epic 全体の進行管理は case-auto が所有。REQ-031-016）

前工程からの引き継ぎ停止判定: `agentdev_handoff: true` 含まれる場合は実装開始せず停止

### 準備フェーズ

べき等性: worktreeとブランチが既に存在する場合、worktree作成をスキップして委譲フェーズへ移行

- Issue本文から要件docと受け入れ基準を抽出 → `agentdev-req-analysis` チェックボックス品質基準で検証
- 関連Decision特定、実装がDecision決定事項に矛盾しないことを確認
- work_type 判定（`agentdev-workflow-lifecycle`）
- Worktree作成、ブランチ準備（`agentdev-git-worktree`）（`origin/main` ベース明示指定、べき等チェック）
  - 親Epicステータス更新（`agentdev-epic-tracker`）
  - worktree precondition gate（worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`））。未作成時、メインリポジトリにいる場合は実行担当サブエージェント起動禁止

### 実行担当サブエージェント委譲フェーズ

- 実行担当サブエージェント起動（adapter protocol: `agentdev-case-run-execution-adapter`）（v2:ADR-0128, REQ-034-015/017）。委譲契約の詳細は前述「委譲契約」セクション参照。起動手段は AGENTS.md および references/<harness>.md 参照（REQ-002-002）
 - 委譲プロンプト: 実行 command を prompt 内で指定（command の具体名は AGENTS.md 参照）
 - 実行担当サブエージェント責務: 委譲 prompt 内で指定された command による目標分解、observable evidence 要求、品質ゲート（code review + QA review + gate review）、test strategy 項目の test-fix ループ（各項目ごとの検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復、REQ-031-009）
 - 委譲起動失敗、異常終了時の扱い: 即 `failed` とせず**実装完了、検証未完了**として扱う（REQ-031-004）。委譲起動不能の場合は `delegation-unavailable` として報告する（REQ-002-003/004）
 - 委譲起動手段が制限された harness での起動不能時経路（REQ-031-033）: 実行担当の接合を起動できない場合、直ちに delegation-unavailable と判断せず、能力検出→接合形態の決定（委譲実行者によるプロセス内直接実装と、result 4状態・3点ゲート・PR 本文 SSoT の契約 self-apply）→記録の経路に従う。本経路は起動前の事前判定であり、上記の起動後の事後処理規定と排他的でなく接続する。接合形態決定の実行詳細は adapter skill reference（harness-delegation.md）が所有し、配布 SKILL（`agentdev-case-run-execution-adapter` SKILL.md）の委譲契約自体は変更しない（REQ-031-007、起動手段は harness 責務）
 - case-run が直接行わない（実行担当サブエージェント責務）: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証
 - PR URL 受領: 実行担当サブエージェントが直接 PR 作成し PR URL を委譲 result として返却
 - Findings / Capture 候補: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録
 - Design確定候補: 実行担当サブエージェントが PR 本文の `## Design確定候補` セクションに記録（v2:ADR-0123 Decision #4, REQ-001-015）
- 実行担当サブエージェント result 処理（`agentdev-case-run-execution-adapter` result 契約の4状態のいずれかを処理）
 - completed-pr: 実装完了、PR作成済み。PR番号を受け取りクリーンアップフェーズへ
 - blocked: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み
 - failed: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み
  - delegation-unavailable: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す（REQ-002-004）

### case-run gate 意味論（前置 gate と最終 gate）

詳細は references/gate-semantics.md を参照（遅延読み込み）。
### Epic Wave 実行モードの廃止（Wave 実行制御の case-auto 移転）

詳細は references/gate-semantics.md を参照（遅延読み込み）。
### クリーンアップフェーズ

詳細は references/gate-semantics.md を参照（遅延読み込み）。
## 所有関係と委譲

詳細は references/supporting-sections.md を参照（遅延読み込み）。
## QG-3 前置 staleness check 手順（新規セクション）

詳細は references/qg3-and-docs-guard.md を参照（遅延読み込み）。
## docs/** 変更時の targeted docs guard（REQ-031-011）

詳細は references/qg3-and-docs-guard.md を参照（遅延読み込み）。
## verification-only PR（実装差分なし、検証のみ）

詳細は references/verify-only-pr.md を参照（遅延読み込み）。
## トレーサビリティ能力の利用

詳細は references/traceability-usage.md を参照（遅延読み込み）。
## 配布物本体 ADF-COVERS 宣言の除去可否判定（cleanup 判定）

詳細は references/traceability-usage.md を参照（遅延読み込み）。
## 参照する横断 Design

詳細は references/traceability-usage.md を参照（遅延読み込み）。
## execution contract 消費境界（新規セクション）

詳細は references/execution-contract-consumption.md を参照（遅延読み込み）。
## 採用規約の解決の実行経路接続（REQ-104）

本節は case-run（単一 Issue 実行）と ADF v5 採用規約機構（REQ-104）の接続を所有する。採用規約の解決の構造（解決手順、移行期デフォルトとの接続、判定規則）の正は v5 採用規約機構 Design「解決手順」「移行期デフォルトとの接続」「未採用参照例を欠落と誤判定しない判定規則」各節であり、本 Design は重複定義しない。

- 解決の参照（REQ-104-009）: case-run と実行担当サブエージェントの実行経路（Issue 受け入れ基準の判定、test strategy 項目の検証、品質ゲート適用）は、プロジェクトの採用済み工程・工程間関係・必須成果物を、採用規約の解決の公開操作契約（`agentdev-adopted-conventions` の resolve/evaluate script CLI）を経て参照し、解決結果を当該作業の判定基準として使う。
- 読取不能と移行期デフォルトの区別（REQ-104-009）: 解決が実行不能な場合（採用宣言の読取不能・schema 不適合、unresolvable）、実装・判定を進めず判断留保として扱い、全要件の不存在や全工程の省略として解釈しない。blocked の判定は本 Design「blocked 遷移と Issue 更新の取扱い」節に従う。採用宣言が存在しない場合の移行期デフォルト接続（transition-default）は、現行の正規成果物から呼出側の実行契約が意味判断を行う状態であり、読取不能の判断留保とは別の状態として扱い、留保をデフォルト接続へ自動降格しない。
- 成立判定の根拠（REQ-104-010）: 完了条件の検証は、解決結果に加えて対象作業の実際の実行とその証拠（正規成果物、操作結果、Git 履歴、検証証拠）とともに行い、解決の成立だけを合格の根拠にしない。
- 詳細工程採用状況に応じた判定（REQ-104-011）: 採用済み各工程は解決の scope（単独工程の実施の部分集合指定）で単独の作業単位として解決する。詳細工程を採用しないプロジェクトでは標準案（参照モデルの詳細工程）を未採用候補として扱い、未採用の参照工程を判定基準へ含めない。
- 欠落の根拠確認（REQ-104-012）: 採用済みで必須の成果物の欠落は検出結果（根拠確認要求）として提示し、作成・採用外明示・省略明示のいずれかに分類する根拠確認の実行経路を利用者が辿れる状態にする。根拠確認を経ない欠落を工程省略として合格させない。

## 作業用 worktree 作成元と PR base（REQ-031-024 の実行詳細）

詳細は references/supporting-sections.md を参照（遅延読み込み）。
## 対象外

- 壁打ち（構造的実行フェーズ、実装は 実行担当サブエージェント経由）
- 実装で判明した制約の REQ 黙示変更（実行担当サブエージェントが乖離として報告しユーザー承認後に反映）
- worktree 外でのファイル操作（`POL-worktree-isolation`）
- Issue番号省略時の `gh issue list` 等の open issue 一覧取得
- Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）（case-close 責務）
- case-run 本体による work plan生成、実装、乖離検出、specs更新、PR作成（実行担当サブエージェント責務）
- 実行担当サブエージェント result 以外の状態扱い（`agentdev-case-run-execution-adapter` result 契約に従う）
- 完了条件チェックボックスの評価、更新（case-close QG-4 責務、`POL-completion-checkbox-single-writer`）
- blocked / failed SSoT の一時会話コンテキスト、中間ファイル使用（Issue コメント、PR 本文が SSoT）
- 外部実行ハーネス中間成果物の内部構造依存処理、検証（REQ-003-007）
- 外部実行手段中間成果物の永続成果物扱い（REQ-003-007）
- worktree 未作成時、メインリポジトリでの 実行担当サブエージェント起動（worktree precondition gate）
- 実行担当サブエージェントへメインリポジトリパスを渡すこと（worktree root 相対パス指定）
- Epic Wave 実行モードの Wave 処理の引き受け（1 Wave を超える処理、Wave 境界（PR マージ）、Wave 構成の読み取りと fan-out。Wave 実行制御は case-auto stage 3 が単一所有し、Wave 境界（PR マージ）は case-close へ委譲）
- スコープ拡大、intake 候補の `.agentdev/intake/inbox/` 直接変更、learning 候補と intake 候補の混在、`.agentdev/learning/inbox/` 直接変更、Design確定候補と Findings の混在

## 検証観点

- worktree precondition gate: worktree+ブランチ作成済みを検証（`git worktree list` + `git rev-parse --show-toplevel`）。検証失敗時は 実行担当サブエージェント起動禁止
- 実行担当サブエージェント result 4状態（completed-pr / blocked / failed / delegation-unavailable）の取り扱い正確性
- PR URL 受領の確実性（`REQ-006-105..111` の PR URL 義務に伴い PR URL フォールバック検索不使用）
- Epic Wave 実行モードの Wave 単位処理の不実施（Wave 構成の読み取り、現在 Wave 判定、fan-out/fan-in、子 Issue 並列起動を行わない。REQ-031-015）、再開時の単一 Issue 冪等処理（REQ-031-016）
- 出力制約: PR 本文、commit message は verbatim で返す（成果物本文）

## case-auto 並列委譲モデル（REQ-034-027、REQ-031-015）

詳細は references/parallel-and-observability.md を参照（遅延読み込み）。
## L2 タイムスタンプ計測

詳細は references/parallel-and-observability.md を参照（遅延読み込み）。
## Phase 0 commit スコープ設計運用

詳細は references/parallel-and-observability.md を参照（遅延読み込み）。
## 停止状態

- result が blocked の場合（回答可能な blocker。詳細は Issue コメント SSoT。ユーザー判断待ちとして停止、Root Case 指定による正規再開経路）。
- result が failed の場合（repository context で回答不能な blocker。詳細は Issue コメント SSoT）。
- result が delegation-unavailable の場合（実行未試行のため Issue を `pending` に戻す、REQ-002-004）。
- 前工程からの引き継ぎ停止判定（`agentdev_handoff: true`）検出時（実装開始せず停止する）。
- worktree precondition gate 失敗時（worktree、ブランチ未作成なら実行担当サブエージェントを起動しない）。
- 完了条件の不足、曖昧さ、矛盾、実現不能の検出時（自律補完せず blocked とする。execution contract 消費境界参照）。

## 検証義務と検証手段の分離と検証基準の実装由来生成禁止（REQ-017-022、RU-20261004-08）

詳細は references/supporting-sections.md を参照（遅延読み込み）。
## reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| case-run gate 意味論（前置 gate と最終 gate）と Epic Wave 実行モードの廃止 の詳細が必要な場合 | references/gate-semantics.md |
| 所有関係と委譲・作業用 worktree 作成元と PR base・検証義務と検証手段の分離・v3 epic-wave-model 吸収 の詳細が必要な場合 | references/supporting-sections.md |
| QG-3 前置 staleness check と targeted docs guard の詳細が必要な場合 | references/qg3-and-docs-guard.md |
| verification-only PR（実装差分なし、検証のみ） の詳細が必要な場合 | references/verify-only-pr.md |
| トレーサビリティ能力の利用・cleanup 判定・参照する横断 Design と検査ツール の詳細が必要な場合 | references/traceability-usage.md |
| execution contract 消費境界 の詳細が必要な場合 | references/execution-contract-consumption.md |
| case-auto 並列委譲モデル・L2 タイムスタンプ計測・Phase 0 commit スコープ設計運用 の詳細が必要な場合 | references/parallel-and-observability.md |
| adversarial-review 挿入境界（case-run: adapter 委譲内） の詳細が必要な場合 | references/adversarial-review-insertion.md |

## See Also

- [case-open.md](case-open.md)（前段コマンド（Issue 作成））
- [case-close.md](case-close.md)（後続コマンド（PR マージ、Issue クローズ））
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-workflow-case-run` skill（workflow 実装本体（single workflow、epic-wave workflow、6軸実行契約差異））
- `agentdev-workflow-orchestration` skill（フェーズ判定、エラー処理）
- `agentdev-case-run-execution-adapter` skill（委譲統合、result 契約）
- `agentdev-git-worktree` skill（worktree 作成、precondition gate）
- `agentdev-workflow-lifecycle` skill（work_type 判定）
- `agentdev-req-analysis` skill（チェックボックス品質基準）
- `agentdev-epic-tracker` skill（実行構成表の読取と子状態更新）
- REQ-006（case-run / 実装パイプライン）
- REQ-003（外部エージェント統合契約）
- REQ-011（case-auto 最大自走モード）
- v2:ADR-0128（case-run 外部実行委譲）

## adversarial-review 挿入境界（case-run: adapter 委譲内）

詳細は references/adversarial-review-insertion.md を参照（遅延読み込み）。
## v3 epic-wave-model Design からの吸収

詳細は references/supporting-sections.md を参照（遅延読み込み）。
## 重要変更の通知と結果説明

実行担当サブエージェントへの委譲契約に、重要変更の識別と報告を含める。委譲先が実行中に重要変更を判明した場合は、その内容と影響を親側へ報告させ、その時点で未反映の重要変更は正規反映前に、判明時点ですでに反映済みの内容は反映済みである事実を区別して、利用者へ追加通知する。

完了報告には、実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。事前通知したが実施しなかった変更を実施済みと報告せず、一部成功・一部失敗・未確認・中断を区別して報告する。通知と承認は区別し、委譲された裁量の範囲内の実行は通知後に追加承認なしで継続する。既存の合意内容との照合、差分・影響評価、必要な更新・再検証を通知で代替しない。
