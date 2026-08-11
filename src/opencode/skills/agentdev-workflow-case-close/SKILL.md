---
name: agentdev-workflow-case-close
description: "case-close command の workflow 実装本体。PR マージ（squash merge、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase）、QG-4 最終完了判定ゲート（完了条件チェックボックス評価・更新、観点8）、docs 検証・SPEC 確定（targeted docs guard、IR-056、SPEC status 昇格）、Capture 回収（PR 本文→intake/learning 分離）、Epic Wave クローズ（E1〜E6、単一書き手）を所有する。USE FOR: case-close command 実行時の workflow 制御（単一 Issue クローズ・Epic Wave クローズ・PR マージ・QG-4・SPEC 確定・Capture 回収・クリーンアップ・永続化）。DO NOT USE FOR: Issue 実装（case-run）、要件doc 作成（req-define）、Issue 作成（case-open）、最大自走 orchestration（case-auto）、work_type 判定（agentdev-workflow-lifecycle）、gh CLI I/O 手続き（agentdev-gh-cli）、QG-4 検査規則の定義（agentdev-quality-gates）、Epic 進捗追跡ロジック（agentdev-epic-tracker）、SPEC ファイル管理（agentdev-spec-file-manager）、git worktree 操作（agentdev-git-worktree）、学び検知・capture pipeline（agentdev-learning-capture / agentdev-learning-pipeline / agentdev-intake-pipeline）、直接起動（Workflow Skill。対応する /agentdev/* command の工程経由で利用し、単独の skill 起動は REQ-{NNNN}-{NNN} soft guard で抑制）。"
---

# case-close workflow スキル

case-close command の workflow 実装本体。PR マージから Issue クローズ、Capture 回収、ドメイン状態永続化、完了報告までの制御構造、QG-4 最終完了判定ゲート（完了条件チェックボックス評価・更新）、SPEC 確定（draft → accepted 昇格）、Epic Wave クローズ（E1〜E6、単一書き手）を所有する。

case-close command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}〜004）。

## 原本（SSoT）

本スキルの原本仕様は SKILL.md（control plane）と `references/` 配下（各 STEP 詳細）が担う。
Workflow Skill 固有契約（Command / Workflow Skill / Capability Skill 責務、1:N 分割基準、依存方向、配置契約）は `docs/specs/<workflows/workflow-skill-model>.md` SPEC が正規所有する。
extension（`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR、`agentdev-skill-authoring` 準拠）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）と case-close command の公開契約のみを前提とする。`docs/specs/**` 内部構成は仮定しない
2. **extension の読込契約**: 呼び出し元 command から渡された解決済み文脈を優先し、不足分のみ skill extension を読む。reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## USE FOR

- case-close command の実行時 workflow 制御（全 STEP）
- 単一 Issue クローズフロー（Step 1-1, Step 2〜12）
- Epic Wave クローズフロー（Step E1〜E6、子Issue 一括マージ・クローズ、Epic status table 更新）
- QG-4 最終完了判定ゲート（完了条件チェックボックス評価・更新、観点8 PR対象範囲 vs 全体）
- docs 検証・SPEC 確定（targeted docs guard、IR-056 check_extensions.ts、SPEC status 昇格）
- PR マージ（squash merge、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase）
- Capture 回収（PR 本文 → intake/ learning 分離、Capture 境界準拠）
- クリーンアップ（worktree/branch 削除、親Epic 自動クローズ判定、実行前同期、学び検知、永続化、完了報告）

## DO NOT USE FOR

- 要件doc 作成、壁打ち（`/agentdev/req-define`）
- REQ/Decision/SPEC ファイル保存（`/agentdev/req-save`、`/agentdev/spec-save`）
- Issue 作成（`/agentdev/case-open`）
- Issue 実装、実行担当サブエージェント委譲（`/agentdev/case-run`）
- case-auto 自走 orchestration、Wave 反復制御、コンフリクト Level 2/3 解消（`/agentdev/case-auto`）
- work_type 判定、フェーズ定義（`agentdev-workflow-lifecycle`）
- gh CLI I/O 手続き、VERIFY（`agentdev-gh-cli`）
- QG-4 検査規則の定義、観点8 判定マトリクス（`agentdev-quality-gates`）
- Epic 進捗追跡ロジック、Wave スケジューリング（`agentdev-epic-tracker`）
- SPEC ファイル管理、target_area、spec-lifecycle-application 詳細（`agentdev-spec-file-manager`）
- git worktree 操作、rebase、mergeable UNKNOWN ポーリング手続きの詳細（`agentdev-git-worktree`）
- 学び検知・capture pipeline（`agentdev-learning-capture` / `agentdev-learning-pipeline` / `agentdev-intake-pipeline`）

## 入力

- case-close command から渡される Issue 番号（単一 Issue または Epic Issue）
- PR 番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- PR squash merge、Issue close、Issue コメント追加、Epic Issue 本文ステータステーブル更新（`agentdev-gh-cli` 経由、case-close 単一書き手）
- worktree/ ブランチ削除（local + remote）
- SPEC `status` frontmatter 昇格（draft → accepted、対象 SPEC が draft かつ今回の実装が SPEC 内容を検証済みの場合）
- `.agentdev/learning/inbox.md`、`.agentdev/intake/inbox/` への Capture 回収、`.agentdev/` 配下 commit/push
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-close command の worktree 隔離に従う）

## Control Plane（STEP 一覧）

case-close workflow は次の STEP で構成する。Epic Wave クローズは STEP-1 のルーティングで分岐し、E1〜E6 として並列記述する。各 STEP は resume point を持つ（DEC-{N}、`docs/specs/<workflows/step-reference-contract>.md`）。会話コンテキストに依存せず、durable state（GitHub Issue/PR、`.agentdev/`、commit hash、SPEC status）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | Issue 番号解決・ルーティング | Issue 番号受領 | 単一 Issue クローズ or Epic Wave クローズのルート確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-2 | QG-4 達成判定 | ルート確定（単一 Issue） | 完了条件チェックボックス評価・更新、観点8 評価スコープ確定 | [references/issue-resolution-and-qg4.md](references/issue-resolution-and-qg4.md) |
| STEP-3 | docs 検証・SPEC 確定 | QG-4 合格 | targeted docs guard、IR-056 check_extensions.ts、SPEC status 昇格 | [references/docs-and-spec-promotion.md](references/docs-and-spec-promotion.md) |
| STEP-4 | PR マージ・コンフリクト解消 | docs 検証合格 | マージ済みPR、HEAD commit hash 記録、コンフリクト Level 1 解消 or case-auto エスカレーション | [references/pr-merge-and-conflict.md](references/pr-merge-and-conflict.md) |
| STEP-5 | Post-merge・Issue クローズ | PR マージ完了 | CI 通過確認、Issue 本文更新、Issue close | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-6 | クリーンアップ・Capture 回収・永続化 | Issue クローズ完了 | worktree/branch 削除、親Epic 自動クローズ、実行前同期、Capture 回収、学び検知、`.agentdev/` 永続化、完了報告 | [references/cleanup-and-capture.md](references/cleanup-and-capture.md) |
| STEP-E1〜E6 | Epic Wave クローズ | Epic Issue 番号受領、ステータス追跡テーブル存在 | 現在 Wave の子Issue 一括マージ・クローズ、Epic status table 更新、最終 Wave 判定 | [references/epic-wave-close.md](references/epic-wave-close.md) |

### STEP 間の依存と分岐

- **単一 Issue クローズ**: STEP-1（単一 ルート）→ STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6
- **Epic Wave クローズ**: STEP-1（Epic ルート、ステータス追跡テーブル存在時）→ STEP-E1〜E6
- **コンフリクトエスカレーション**: STEP-4 で Level 1 rebase 失敗時、case-auto Level 2/3 エスカレーションへ（本 workflow の対象外）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する（REQ-{NNNN}-{NNN}）。

- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 PR対象範囲 vs 全体 判定マトリクス
- `agentdev-gh-cli`: PR merge / mergeable UNKNOWN ポーリング / Issue close / VERIFY
- `agentdev-git-worktree`: 重複ファイルチェック、squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス、worktree 削除、実行前同期リスク検出
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル、E1〜E6 詳細、子Issue 状態 enum、Epic 自動クローズ判定
- `agentdev-spec-file-manager`: SPEC status 昇格（draft → accepted）、spec-lifecycle-application
- `agentdev-workflow-templates`: 対応記録コメント、完了報告テンプレート
- `agentdev-learning-capture`: 学び検知・抽出（エージェント自律）
- `agentdev-learning-pipeline`: deferred ルール、採用済み成果物取り込み判定
- `agentdev-intake-pipeline`: intake inbox への Capture 回収
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離）
- `agentdev-conventional-commits`: GitHub auto-close 回避ガイドライン
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- `repo-agentdev-integrity`: check_changed_docs.ts（targeted docs guard）、check_extensions.ts（IR-056）

## internal Workflow Extension 読込

本スキルは internal Workflow Extension（`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`）を読み込む場合がある（REQ-{NNNN}-{NNN}、DEC-{N}）。Workflow Skill のみが読み、case-close command は直接読まない。標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行する。

## 共通制約

- **完了条件チェックボックス評価・更新は case-close の専任責務**: case-run/ driver/ 外部実行バックエンドは更新しない。case-close は別コンテキストで Issue 本文を再読込し、PR 本文を capture 入力源として最終完了判定する
- **Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手**: case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない（last-write-wins 競合防止）
- **Capture 境界**: intake/ learning を別々の成果物として扱い、PR 本文のみを capture 入力源とする（一時会話コンテキスト不入力）
- **`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない（アクティブ worktree で local 削除が失敗するため）。ブランチ削除は独立 STEP で実施
- **GitHub auto-close 回避**: commit message でコマンド名と Issue 番号を分離し、`#` 記号による近接参照を避ける

## See Also

- **`docs/specs/<workflows/workflow-skill-model>.md`**: Workflow Skill 固有契約の正規所有者
- **`docs/specs/<workflows/step-reference-contract>.md`**: STEP reference 構造、resume point
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-close command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
