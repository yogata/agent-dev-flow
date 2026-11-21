---
title: case-close Design
status: accepted
created: 2026-06-21
updated: "2026-11-18"
---

<!-- ADF-COVERS(implementation): REQ-021-018, REQ-021-019, REQ-021-022, REQ-021-025 -->
<!-- ADF-COVERS(design): REQ-021-018, REQ-021-025, REQ-021-027 -->
<!-- ADF-COVERS(design): REQ-032-007, REQ-032-013 -->
<!-- ADF-COVERS(design): REQ-032-001, REQ-032-002, REQ-032-003, REQ-032-004, REQ-032-005, REQ-032-006, REQ-032-008, REQ-032-009, REQ-032-010, REQ-032-011, REQ-032-012, REQ-032-014, REQ-032-015, REQ-032-016, REQ-032-017, REQ-032-018, REQ-032-019, REQ-032-020, REQ-032-021, REQ-032-022, REQ-032-023, REQ-032-024, REQ-032-025, REQ-032-026, REQ-032-027 -->
<!-- ADF-COVERS(design): REQ-032-042, REQ-032-043, REQ-032-044, REQ-032-045, REQ-032-046 -->
<!-- ADF-COVERS(implementation): REQ-032-001, REQ-032-002, REQ-032-003, REQ-032-004, REQ-032-005, REQ-032-006, REQ-032-007, REQ-032-008, REQ-032-009, REQ-032-010, REQ-032-011, REQ-032-012, REQ-032-013, REQ-032-014, REQ-032-015, REQ-032-016, REQ-032-017, REQ-032-018, REQ-032-019, REQ-032-020, REQ-032-021, REQ-032-022 -->
<!-- ADF-COVERS(implementation): REQ-035-001, REQ-035-003, REQ-035-009, REQ-035-010 -->
<!-- ADF-COVERS(implementation): REQ-003-015, REQ-003-016, REQ-003-019, REQ-003-026, REQ-006-105, REQ-032-001, REQ-032-002, REQ-032-003, REQ-032-004, REQ-032-005, REQ-032-007, REQ-032-008, REQ-032-010, REQ-032-012, REQ-032-013, REQ-032-014, REQ-032-015, REQ-032-016, REQ-032-017, REQ-032-018, REQ-032-019, REQ-032-020, REQ-032-021 -->
<!-- ADF-COVERS(implementation): REQ-032-024, REQ-032-025, REQ-032-026 -->
<!-- ADF-COVERS(implementation): REQ-021-030 -->
<!-- ADF-COVERS(design): REQ-021-030 -->
<!-- ADF-COVERS(design): REQ-032-029 -->
<!-- ADF-COVERS(design): REQ-032-031, REQ-032-032, REQ-032-033, REQ-032-034, REQ-032-035, REQ-032-036, REQ-032-037, REQ-032-038, REQ-032-039 -->
<!-- ADF-COVERS(design): REQ-032-040, REQ-032-041（QG-4 file-level split 標準化と bun 版更新時再検証の実行構成設計） -->
<!-- ADF-COVERS(design): REQ-030-032 -->
<!-- ADF-COVERS(design): REQ-032-047, REQ-032-048（QG-4 最終受け入れの検証義務に基づく試験範囲選択と最終受け入れ判定の design 実体） -->

# case-close Design

本 Design は骨格（公開契約と制御フロー）と references/ 詳細仕様の2層構成である。クローズ手順の詳細・検査手順・評価規則の詳細は references/case-close/ 配下へ分離している。通常経路で全 reference を無条件読込せず、必要な条件に応じて遅延読み込みする。

本 Design が定義する case-close は公開 command ではなく内部 lifecycle 段階である。公開 UX は要求入口（req-define、backlog-auto）と標準実行コマンド case-auto へ収斂しており、本段階は case-auto の orchestration から駆動される。本 Design は内部 lifecycle 段階の契約を定める正規文書である。
## 目的

PR をマージし、Case に記録を追記し、クローズ後に worktree とブランチを削除する。
レビュー完了フェーズ。
Epic Issue番号入力時は現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic 本文の実行構成表を更新する（Epic Wave クローズ）。

**完了条件チェックボックスの評価、更新は case-close の専任責務**（REQ-032-001）。
case-run / 実行担当サブエージェント / 外部実行バックエンドは完了条件チェックボックスを更新しない。

**Epic Issue 本文（実行構成表）への書き込みは per-Epic の単一書き手による排他制御の下で実施する**（DEC-039、REQ-035-001）。

**責務境界（REQ-003-007）**: 完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）。
コンフリクト解消の実装変更、オーケストレーション級判断（マージ順序変更、blocked 単位の隔離）は case-auto の責務（`docs/designs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）。

## 承認・HITL 境界

- QG-4 合格後の squash merge、Issue close、Capture 回収は自動実行する（case-close 自身の承認点を持たない）。
- QG-4 不合格、mergeable CONFLICTING の解消不能時はマージせず停止し、ユーザー判断を求める（実装変更による解消は case-auto レベルの判断）。

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- 単一 Issue クローズ時: マージ済みPR、クローズ済みCase、削除済みローカルブランチ、worktree
- Epic Wave クローズ時: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- GitHub API: squash merge（Custom Tool `agentdev_gh` の pr_merge、リトライ最大5回、フォールバック手順あり）、Issue クローズ（Custom Tool `agentdev_gh` の issue_close、reason: completed）、Issue 本文更新（Custom Tool `agentdev_gh` の issue_update、VERIFY 付き）、mergeable 状態取得（Custom Tool `agentdev_gh` の pr_mergeable、squash merge 前の mergeable UNKNOWN ポーリング、REQ-031-017、最大60秒・10秒間隔）
- git 操作: `git pull --ff-only`、`git fetch origin main:main`（非 main ブランチ占有時の代替同期、REQ-031-008）、`git add` / `git commit` / `git push`（`.agentdev/` 配下、明示パスステージング。並行 Case git 規律は REQ-030-017）
- worktree / ローカルブランチ削除: `agentdev-git-worktree` 手順に従う。リモートブランチ削除は GitHub の deleteBranchOnMerge 自動削除に委譲し case-close は実行しない（REQ-032-029、REQ-009-052）
- capture 回収: PR 本文から intake / learning を分離回収し `.agentdev/intake/inbox/`、`.agentdev/learning/inbox/` へ保存
- deviation capture（自工程）: case-close 実行中に実観測した deviation を agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
  保存先は capture-boundaries.md の Split Rule に従う。
- git 永続化: capture 成果物を case-close 自身の既存 commit/push 処理内で永続化。
- 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。
- Epic Issue 単一書き手: case-close は Epic Issue への記録を一手に担う（per-Epic 単一書き手制約）。
- Design status 昇格: `docs/designs/**` の `status: draft` → `accepted` 昇格（docs 検証の Design 確定フロー）

## git 操作と worktree クリーンアップ

共有作業ツリーでのステージ、コミット、削除は、当該コマンドが所有する明示パスだけを対象とする。

`git add -A`、`git add .`、`git commit -a`、`git checkout .`、`git reset --hard`、`git stash` のように他セッションの変更を巻き込む操作は使用しない。

変更と削除は同じ処理単位で明示パスによりステージしてコミットし、未ステージのまま残さない。

worktree を削除する前に、未追跡ファイルだけを対象とする cleanup を実行し、追跡対象ファイルを変更しない。

削除時にファイルハンドルなどの一時的な失敗が起きた場合は、OS に依存しない回数制限付きの再試行を行う。

再試行後も削除できない場合は、必要な `prune` と追跡対象ファイルの復元を実施して状態を確認し、削除失敗を報告して停止する。

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-case-close`）が正規情報源である。

### 入力判定

- Issue番号解決: ユーザー入力またはセッション内会話から取得。Tool 操作契約（Custom Tool `agentdev_gh`）で本文取得
  - Epic Issue 判定（実行構成表の存在確認）。存在時は Epic Wave クローズへ分岐

### Epic Wave クローズ（REQ-032-015〜022）

詳細は references/close-procedures.md を参照（遅延読み込み）。
### Epic Issue 完了条件チェックボックス最終評価・更新

詳細は references/close-procedures.md を参照（遅延読み込み）。
### 単一 Issue クローズ（従来フロー、後方互換）

詳細は references/close-procedures.md を参照（遅延読み込み）。
### 最終検証の実行（検証義務に基づく試験範囲選択）と tmp 残存確認

詳細は references/close-procedures.md を参照（遅延読み込み）。
## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、case-auto の orchestration による Workflow Skill load 時に本 Design が読み込まれる（DEC-010。第4段以降は command 定義の実行時投影ではなく直接読込）。
- workflow 実装本体（単一 Issue クローズと Epic Wave クローズの STEP 構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-close`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、case-auto orchestration の委譲制御と Workflow Skill description の DO NOT USE FOR トリガーにより実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## トレーサビリティ能力の利用（QG-4 独立再検査）

case-close は QG-4 の一部として、対象要件行の設計根拠対応、implementation 対応、verification 対応の完全性を `agentdev-traceability` の check で対応関係全体（正規成果物の inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う）から独立して再検査する（REQ-021-018）。
case-run 側の事前検査とは独立に実施する。検証手段との対応関係と「今回その検証を実行して合格したか」という実行結果（Issue, PR, QG の記録）を分離して扱う（REQ-021-019）。

- 対象要件行に、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応、implementation 対応、または policy が required と判定する要件行の verification 対応の欠落が残る場合はマージせず停止する。Decision 対応の欠落は QG-4 の不合格条件に含めない
- 不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻せる
- verification 対応の完全性判定は、project-level verification policy が required と判定する要件行のみを計上する。policy の正規情報源は `traceability/policy.yaml`（既定 required、optional な要件行のみ明示、未指定の要件行は required）であり、policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない
- QG-4 は対象要件行に必要な設計根拠、実装、検証の対応を確認し、未解決の不合格が 0 件であることを完了条件とする（REQ-021-018/024/025）。全体の対応完全性は診断として扱う（traceability-model Design）。
- check 自体が正常に完全性を判定できなかった場合（check 実行不能、検査対象の取得不能等）は、対応完全性の合格として扱わず、検査不能の旨を報告してマージに進まない
- 正規成果物側の実不整合が確認された場合は、既存の品質ゲート, 受け入れ条件に従って fail とする

## 参照する横断 Design

- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（Pattern Taxonomy（file-pipeline））
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 回収（intake/learning 分離））
- [foundations/runtime-execution-model.md](../foundations/runtime-execution-model.md)（Epic Issue 本文の直列化〔per-Epic 単一書き手〕。Epic Wave クローズ運用は本 Design「Epic Wave クローズ」節）
- [workflows/collaboration-loop.md](../workflows/collaboration-loop.md)（v3 ライフサイクル Design からの吸収記録: REQ ファイル整合性検査・README 索引影響規則の帰属〔agentdev-req-file-manager・agentdev-artifact-validation の各 Design 参照〕）
- [quality-gate-model.md](../quality/quality-gate-model.md)（QG-4）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（旧旧パス検出ルール（削除済み） obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (v2:REQ-0158-003)

詳細は references/targeted-docs-guard.md を参照（遅延読み込み）。
## 対象外

- 未マージPRのクローズ
- `gh issue list` / `gh issue status` 等による Issue番号解決（ユーザー入力またはセッション内会話からのみ）
- Epic 自動クローズ判定での全子Issue CLOSED 以外のクローズ
- ブランチ、worktree 削除失敗時の継続（警告表示して停止）
- `git pull --ff-only` 省略、pull 前 hash 検証省略
- CI 失敗時のマージ続行（case-run へ差し戻し）
- 未達チェックボックス残存時の完了扱い（構造化エラー停止）
- 機能追加で docs/ 更新がない場合の完了続行（警告表示して停止確認）
- 学び有無のユーザー確認（エージェント自律）
- intake と learning の混合単一成果物
- 今回の完了条件未対応事項の intake への逃がし
- 共有作業ツリーでの `git checkout .`（REQ-030-017。他セッション変更の無差別破壊）
- 完了条件チェックボックス評価の他コマンド委譲（case-close 専任責務、`POL-completion-checkbox-single-writer`）
- Design status 昇格の他コマンド委譲（case-close 責務、Definition 保存 / Design 保存内部責務は accepted を付与しない）
- Epic Issue 本文実行構成表の子状態更新の他コマンド書き込み（case-close 単一書き手、`POL-epic-tracking-single-writer`）

## 検証観点

- QG-4（Final Acceptance Gate）: 前提確認で Issue 本文の完了条件チェックボックスを最終評価、更新
- チェックボックス事後確認: 更新後に Issue 本文を再読込し全 `- [ ]` が `[x]` に反映されたことを確認（最大2回）
- Squash merge リトライ: 最大5回（5秒待機付き）
- mergeable UNKNOWN ポーリング（REQ-031-017）: squash merge 前に Custom Tool `agentdev_gh` の pr_mergeable で mergeable・mergeStateStatus 状態を事前確認、UNKNOWN 時は最大60秒（10秒間隔）でポーリング、上限超過時はマージ中止・構造化エラー停止
- git main 同期リスク事前検出（REQ-031-008）: `git pull --ff-only` 直前に worktree 状態・並列実行 ref lock 競合・非 main ブランチ占有の3リスクを事前検出、検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main`）を選択
- 出力制約: 成果物本文（PR本文、commit message）は verbatim で返す（別途成果物パス、根拠、親判断事項は圧縮）
- 結果状態分離報告: GitHub側、`.agentdev` 永続化、ローカルブランチ削除状態を独立して報告。報告次元の定義はローカルブランチ削除状態に確定し、remote ブランチの削除は GitHub 側の deleteBranchOnMerge 自動削除であり ADF の保証対象外

## 停止状態

- QG-4 前提確認で完了条件チェックボックスの未完了（`- [ ]` 残存）を検出した場合（評価エラーで停止する。部分的なチェック済み化は行わない）。
- mergeable UNKNOWN ポーリング上限超過時（マージ中止、構造化エラー停止）。
- squash merge のコンフリクトが rebase で解消不能な場合（実装変更を伴う解消は行わず、case-auto レベル判断へエスカレーションして停止）。
- 最終 Wave で完了条件が残る場合（Epic クローズせずエラー停止、残 Wave 通知へ整理）。
- worktree、ローカルブランチ削除のリトライ上限超過時（`prune` と復元を実施し、削除失敗を報告して停止。リトライ上限条項はローカルブランチ・worktree 削除に適用される）。

## Design 状態評価の棚卸し制（STEP-3 拡張）

詳細は references/design-inventory-and-final-eval.md を参照（遅延読み込み）。
## 完了条件単位の最終評価と非循環証拠（REQ-032-031〜038、RU-20261004-08）

詳細は references/design-inventory-and-final-eval.md を参照（遅延読み込み）。
## 機械工程の script 呼び出し契約（RU-0162）

詳細は references/script-invocation.md を参照（遅延読み込み）。
## reference 選択表

通常経路で全 reference を無条件読込しない。必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| クローズ手順の詳細（Epic Wave クローズ・チェックボックス最終評価・単一 Issue クローズ・最終検証） の詳細が必要な場合 | references/close-procedures.md |
| targeted docs guard (v2:REQ-0158-003) の詳細が必要な場合 | references/targeted-docs-guard.md |
| Design 状態評価の棚卸し制と完了条件単位の最終評価 の詳細が必要な場合 | references/design-inventory-and-final-eval.md |
| 機械工程の script 呼び出し契約 の詳細が必要な場合 | references/script-invocation.md |

## See Also

- [case-run.md](case-run.md)（前段コマンド）
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-workflow-case-close` skill（workflow 実装本体（単一 Issue クローズ、Epic Wave クローズ））
- `agentdev-quality-gates` skill（QG-4）
- `agentdev-git-worktree` skill（worktree、ブランチ削除）
- `agentdev-epic-tracker` skill（実行構成表の子状態更新）
- `agentdev-learning-capture` skill（学びの検知）
- `agentdev-learning-pipeline` skill（deferred/ ルール）
- `agentdev-workflow-orchestration` skill（Capture 境界、達成判定プロトコル）
- Custom Tool `agentdev_gh`（GitHub I/O 操作契約。[custom-tool-contracts.md](../responsibilities/custom-tool-contracts.md)）
- `agentdev-issue-management` skill（Issue 操作安全性）
- REQ-006（case-close / 完了処理）
- v2:REQ-0137（並列実行安全 git 操作規律）
- REQ-003（コンフリクト解消モデルと実行時間観測）
- REQ-011（完了条件チェックボックス case-close 専任）
- v2:ADR-0125（Epic Issue 本文単一書き手）
- v2:ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
