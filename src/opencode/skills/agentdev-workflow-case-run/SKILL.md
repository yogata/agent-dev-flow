---
name: agentdev-workflow-case-run
description: "case-run command の workflow 実装本体。単一 Issue 実行（single workflow）と Epic Wave 実行（epic-wave workflow）の 1:N 分離構成、実行担当サブエージェント委譲（最大5件並列）、fan-out・fan-in、partial result、child task recovery、result 4状態処理を所有する。USE FOR: case-run 実行時の workflow 制御（single Issue 実行・Epic Wave 実行・再開フェーズ判定・委譲・前置/最終 gate）。DO NOT USE FOR: 実装実行そのもの（委譲内の実行担当サブエージェントが担う）、単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-run workflow スキル

case-run command の workflow 実装本体。単一 Issue または単一 Wave の実行を実行担当サブエージェントへ委譲し、その result を処理する制御構造を所有する。case-run 本体は orchestration に専念し、実装実行そのものは行わない。

単一 Issue 実行と Epic Wave 実行は制御構造に実質差異があるため、DEC-{N} の 1:N 分割基準により single workflow と epic-wave workflow の2 workflow として分離する。本 SKILL.md は両 workflow の control plane（選択 dispatch、STEP 一覧、遷移）を所有し、実行契約差異を明示する。

case-run command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `<workflows/workflow-skill-model>` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-run.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-run command の公開契約のみを前提とする。SPEC ディレクトリの内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **SPEC 内部パスの固定知識化の禁止**: extension に列挙されていない SPEC 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- Issue番号またはURL（単一 Issue 実行モード）
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## 副作用

- worktree・ブランチ作成（`agentdev-git-worktree` 経由）
- 実行担当サブエージェント起動（adapter skill 読込、委譲 prompt 内で実行 command 指定）
- 親Epic ステータス更新（STEP-S3、`agentdev-epic-tracker` 経由）
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-run command の worktree 隔離に従う）

## Workflow 構成（1:N 分離、DEC-{N}）

単一 Issue 実行と Epic Wave 実行は operation 差ではなく制御構造の実質差異であるため、1 workflow への統合ではなく2 workflow への分離を採る。

- **single workflow**: 対象1 Issue。準備・委譲・クリーンアップの3フェーズを順次実行する
- **epic-wave workflow**: 対象は現在 ready な Wave の子Issue 群（最大5件並列）。fan-out（子Issue ごとの worktree と委譲）と fan-in（全委譲完了待機・結果集約）を制御する

workflow 選択は STEP-S1 の実行モード分岐で確定する（引数が Epic Issue 番号か否か）。Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、本 workflow は1 Wave の実行（PR作成まで）で return する。

### 実行契約差異（single vs Epic Wave）

| 契約軸 | single workflow | epic-wave workflow |
|---|---|---|
| target cardinality | 1 Issue | 現在 ready な Wave の子Issue 群（1 Wave 分、上限は並列数と同じ5件） |
| parallelism | 委譲1件（直列） | 子Issue 並列委譲 最大5件（3つの「5件」文脈の (1)） |
| fan-out / fan-in | fan-out なし。委譲1件の result を直接処理 | fan-out（子Issueごとの worktree+委譲起動）→ fan-in（全委譲完了待機・結果収集） |
| child task recovery | 対象外（委譲1件） | 子 task 異常終了・破棄検知時は worktree git status と残留変更で帰属を確認し、個別に blocked/failed 分離。帰属不明は強制 commit しない |
| partial result | 委譲 result が4状態のいずれか1つ | 子Issue ごとの result を独立して保持。一部 blocked/failed でも完了済み子Issue の PR は有効（partial result 許容） |
| Wave-level completion | Issue 単位の完了（PR 作成）で終了 | 1 Wave の全委譲 result 収集と Wave 完了報告で return。Wave 境界（マージ）と次 Wave 進行は扱わない（case-close + 再実行） |

## Control Plane（STEP 一覧）

各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。会話コンテキストに依存せず、durable state（GitHub Issue/PR、Issue コメント、worktree・ブランチの存在、PR URL）から再開点を再構成する。

### single workflow（単一 Issue 実行モード）

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-S1 | フェーズ判定・再開ポイント検出 | case-run 起動（Issue番号受領） | 実行モード確定（single）、再開フェーズ判定、引き継ぎ停止判定 | [references/single.md](references/single.md) |
| STEP-S2 | Issue 抽出・確認・判定 | 実行モード確定（single） | 要件doc・受け入れ基準抽出、関連Decision 確認、work_type metadata 整合確認、execution contract 消費境界適用 | [references/single.md](references/single.md) |
| STEP-S3 | Worktree 作成・ブランチ準備・前置 gate 群 | Issue 判定完了 | worktree+ブランチ作成（べき等）、前置 gate 群（precondition / staleness / targeted docs / 事前委譲チェック）合格、L2 計測 | [references/single.md](references/single.md) |
| STEP-S4 | 実行担当サブエージェント委譲 | STEP-S3 合格（worktree 内検証済み） | 委譲起動、L2 計測、経路G（adapter 委譲内 adversarial-review） | [references/delegation-and-result.md](references/delegation-and-result.md) |
| STEP-S5 | result 処理・配布依存境界 最終 gate | 委譲 result 受領 | result 4状態処理、配布依存境界 最終 gate 判定、L2 受け渡し | [references/delegation-and-result.md](references/delegation-and-result.md) |
| STEP-S6 | worktree クリーンアップ確認・完了報告 | result 処理完了（completed-pr 時は最終 gate 合格後） | 未コミット変更確認、完了報告（L2 内訳含む） | [references/single.md](references/single.md) |

### epic-wave workflow（`case-run #epic` 受領時）

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-W1 | Epic Issue 解析・Wave 選択 | case-run 起動（Epic Issue番号受領） | 現在 ready な Wave の子Issue 群確定（入力ソース無区別、REQ/088） | [references/epic-wave.md](references/epic-wave.md) |
| STEP-W2 | fan-out 準備 | Wave 子Issue 群確定 | `git fetch origin`、子Issue ごとの worktree+ブランチ、前置 gate 群適用（STEP-S3 と同一契約） | [references/epic-wave.md](references/epic-wave.md) |
| STEP-W3 | fan-out 並列委譲 | fan-out 準備完了 | 子Issue 並列委譲（最大5件、STEP-S4 と同一委譲契約）、L2 計測 | [references/epic-wave.md](references/epic-wave.md) |
| STEP-W4 | fan-in・結果集約 | 全委譲完了（または異常検知） | 子Issue ごとの result 収集、partial result 保持、child task recovery | [references/epic-wave.md](references/epic-wave.md) |
| STEP-W5 | Wave 完了報告・return | 結果集約完了 | 1 Wave 分の完了報告（result 状態別一覧）、return（Wave 境界は扱わない） | [references/epic-wave.md](references/epic-wave.md) |

### STEP 間の依存と分岐

- **single**: STEP-S1（single 判定）→ STEP-S2 → STEP-S3 → STEP-S4 → STEP-S5 → STEP-S6。worktree+ブランチ既存時は STEP-S3 の作成をスキップ（べき等）。result が blocked / failed / delegation-unavailable 時は STEP-S5 で停止（STEP-S6 の報告のみ）
- **epic-wave**: STEP-S1（epic 判定）→ STEP-W1 → STEP-W2 → STEP-W3 → STEP-W4 → STEP-W5。子Issue ごとの委譲は STEP-S4/S5 と同一契約で並列適用する
- **最終 gate 違反**: STEP-S5 で配布依存境界 最終 gate 違反時、PR 本文に `### distribution-boundary` を記録して停止（adapter result は上書きしない）

### resume protocol

- 再開点は durable state から再構成する: worktree・ブランチの存在（準備フェーズ完了）、PR の存在と PR URL（委譲完了）、Issue コメント（blocked/failed の SSoT）、Epic Issue 本文のステータス追跡テーブル（Wave 進行）
- フェーズ再開条件: 準備フェーズ（worktree+ブランチが存在しない）、委譲フェーズ（PR 未作成かつ result 未確定）、クリーンアップフェーズ（result が completed-pr）
- 会話コンテキスト・自然言語の前 STEP result のみを resume source としない。親子 task 状態は Harness から復元し、完了済み子Issue 状態を durable domain state（PR・Issue コメント）と再構成して fan-in 判定を行う

### termination

- 正常終了: single は PR 作成確認とクリーンアップ完了報告まで。epic-wave は1 Wave 分の result 集約と Wave 完了報告まで
- 停止終了: blocked / failed（Issue コメント SSoT）、delegation-unavailable（Issue を pending へ戻す）、配布依存境界 最終 gate 違反（PR 本文 SSoT）、worktree precondition gate 失敗（実行担当サブエージェント起動前に停止）
- 引き継ぎ停止: Issue 本文に `agentdev_handoff: true` を含む場合、リポジトリ種別に応じた停止判定（`agentdev-workflow-lifecycle` runtime-package-boundary）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-workflow-orchestration`: 再開ポイント判定、状態機械、CI 対応ループ、capture 境界、障害伝播
- `agentdev-case-run-execution-adapter`: 実行担当サブエージェント委譲の adapter protocol、result 4状態契約、経路G
- `agentdev-git-worktree`: worktree 作成・削除、worktree 内判定ヘルパー、並列実行安全ステージング
- `agentdev-workflow-lifecycle`: work_type 判定、引き継ぎ停止判定（runtime-package-boundary）
- `agentdev-epic-tracker`: Epic Issue 本文読込、Wave 子Issue 特定、親Epic ステータス更新
- `agentdev-req-analysis`: チェックボックス品質基準
- `agentdev-quality-gates`: QG-{N} 前置 staleness check
- `agentdev-gh-cli`: Issue 本文読取等の I/O 手続き
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `agentdev-artifact-graph`: トレーサビリティ派生索引への高位問い合わせ（実行対象と正規成果物の実現関係確認のみ。fail-open）
- integrity checker skill（repo-local）: check_changed_docs.ts（targeted docs guard）、check_extensions.ts（IR-{NNN}）、check_distribution_boundary.ts（配布依存境界）

## Artifact Graph 利用

本スキルは `agentdev-artifact-graph` が提供するトレーサビリティ派生索引への高位問い合わせのうち implementation を、既に決定された実装対象（Issue 本文）と正規成果物の実現関係確認（STEP-S2 の関連Decision確認、委譲内 context 再確認）に利用できる。問い合わせ目的とワークフローの割り当ては `agentdev-artifact-graph` SPEC（ワークフロー利用）が正規所有し、本スキルは TIM、派生索引、問い合わせ内部規則を独自に再定義しない。問い合わせ目的を指定し、返された候補を用いて判断する。

- トレーサビリティ問い合わせを利用して新規の依存関係、実行構成、Wave 構成、実行順序を設計しない。依存関係と実行構成の決定責務は上流工程（case-open の execution_unit 構成、Epic Wave モデル）が所有する
- 問い合わせ結果は候補提供であり、実現関係の確認は正規成果物本文と `rg` 等の独立探索で行う。Issue scope、完了条件、REQ、Decision、SPEC、必須品質統制の変更が必要な候補は blocked として case-update 連携とし、scope の自律拡大は行わない
- 派生索引の不在、生成失敗、空結果、候補過多だけを理由として「関係なし」「影響なし」と判断しない
- 派生索引が不在、破損、生成失敗、問い合わせ失敗、候補過多の場合は、README 索引、正規成果物の直接読取、`rg`、ファイル探索などの代替探索で workflow を継続する（fail-open）。正規成果物そのものの異常と派生索引側の異常を区別する

## Workflow Extension 読込

本スキルは workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-run.yaml`、`kind: workflow-extension`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。必要に応じて internal workflow extension（`.agentdev/extensions/skills/agentdev-workflow-case-run/internal.yaml`、`kind: internal-workflow-extension`）を追加で読む。いずれも Workflow Skill のみが読み、case-run command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する。

## 共通制約

- **スコープ**: 単一 Issue または単一 Wave のみを処理する。Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない（workflow-contracts SPEC SC-{NNN}、extension 経由で解決）
- **実装実行の非所有**: case-run 本体は work plan 生成、実装、TDD、乖離検出、specs 更新、PR 本文作成、PR 作成を行わない（実行担当サブエージェント責務、adapter protocol 参照）
- **SSoT**: blocked/failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト、中間ファイルは SSoT としない
- **完了条件チェックボックス**: case-run、実行担当サブエージェントは完了条件チェックボックスを更新しない（case-close QG-{N} の責務）
- **Findings / SPEC確定候補**: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` と `## SPEC確定候補` に記録する（別セクション、混在させない）。case-run の capture 責務は記録のみ
- **外部実行ハーネスの中間成果物**: plan artifact 等を AgentDevFlow の永続成果物として扱わず、最終結果は PR URL で受領する
- **L2 タイムスタンプ**: worktree 設定、実行担当サブエージェント実行、worktree クリーンアップの各開始・終了時刻（JST）を計測し、完了報告の L2 内訳に含める（case-auto の L1 内訳の入力）

## See Also

- **`<workflows/workflow-skill-model>` SPEC**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` SPEC**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-run command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
