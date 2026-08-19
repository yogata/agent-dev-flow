---
description: PRをマージし、対応記録を追記し、Caseをクローズしてブランチを削除する。Epic Issue番号入力時は現在 Wave の一括クローズ（Epic Wave クローズ）を行う
---

# 完了処理

PRをマージし、Caseに記録を追記し、クローズ後にworktreeとブランチを削除する。
レビュー完了フェーズ。
Epic Issue番号入力時は現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic status table を更新する（Epic Wave クローズ）。

**完了条件チェックボックスの評価、更新は case-close の専任責務**。
case-run/ driver/ 外部実行バックエンドが完了条件チェックボックスを更新しない。
case-close は PR 作成後に別コンテキストで Issue 本文の完了条件を再読込し、PR 本文を capture 入力源として最終完了判定する。

**Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが実施する**（単一書き手制約）。
case-run は Epic Issue 本文を読み取るのみ（書き込まない）。
case-auto は Wave 反復制御のみ行い、Epic Issue 本文に直接書き込まない。
last-write-wins 競合防止は case-close の単一書き手で維持される。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-close`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-close.yaml`、kind: workflow-extension）を読み込む（ADR）。
extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。
存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。
詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-close` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルが6 STEP（+ Epic Wave クローズ E1〜E6）の control plane として制御構造を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 Issue 番号解決・ルーティング | PR + Issue 番号（またはセッション内作成済み） | 解決済み Issue/PR 番号・ルーティング結果 | 番号がユーザー入力またはセッション内会話から解決されていること（単一 Issue / Epic Wave の判定を含む） |
| STEP-2 QG-4 達成判定 | 対象 Issue 確定 | 完了条件評価結果 | PR 本文を capture 入力源として完了条件を再読込・評価していること（未達チェックボックス残存時は構造化エラー停止） |
| STEP-3 docs 検証・SPEC 確定 | QG 判定済み | docs 検証結果・SPEC 確定結果 | 機能追加で docs/ 更新がない場合は警告停止確認済みであること |
| STEP-4 PR マージ・コンフリクト解消 | docs 検証通過 | マージ済みPR（squash merge） | CI 通過確認済み、mergeable 状態事前確認済みであること |
| STEP-5 Post-merge・Issue クローズ | マージ済み | クローズ済み Issue・テスト戦略チェックボックス更新 | チェックボックス更新後の再読込 VERIFY 済みであること |
| STEP-6 クリーンアップ・Capture 回収・永続化 | クローズ済み | ブランチ・worktree 削除、capture 成果物、git 永続化 | intake/learning の分離回収が同一 commit に含まれていること |

Epic Wave クローズ（Epic Issue番号入力時のみ。STEP-1 から分岐し、単一 Issue番号入力時は従来フローを維持）:

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-E1 対象 Wave の子Issue・PR 特定 | Epic Issue 本文のステータス追跡テーブル存在 | 対象子Issue・PR リスト（現在 Wave の `running` のみ） | `pending`/ `ready`/ `blocked`/ `failed` を対象に含めていないこと |
| STEP-E2 各子Issue PR の CI 確認・マージ | 対象リスト確定 | マージ済みPR 群 | 各 PR の CI 通過・mergeable 確認済みであること |
| STEP-E3 子Issue クローズ・チェックボックス評価 | マージ済み | クローズ済み子Issue 群 | 各子Issue の完了条件評価・テスト戦略チェックボックス更新が済んでいること |
| STEP-E4 Epic ステータス追跡テーブル更新 | 子Issue クローズ済み | 更新済み Epic 本文（単一書き手） | `blocked`/ `failed` を `completed` に上書きしていないこと（べき等性、`agentdev-epic-tracker` 準拠） |
| STEP-E5 最終 Wave 判定 | テーブル更新済み | Epic クローズ実施 または 残 Wave 通知 | 全子Issue が CLOSED の場合のみ Epic 自動クローズであること |
| STEP-E6 Wave クリーンアップ・完了報告 | 判定済み | ブランチ・worktree 削除、完了報告 | 結果状態の分離報告がされていること |

**共通ルール**（全 STEP 適用）: VERIFY（gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証）、コメントテンプレート選定・準拠（`agentdev-workflow-templates` の選定ルール、【必須】セクション確認、欠落時は再生成）

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-close` が所有する。
同 Workflow Skill は `/agentdev/case-close` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。
OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- Issue番号の省略は同一セッション内で作成済みの場合に限り、番号解決はユーザー入力またはセッション内会話から行う
- ブランチ・worktree 削除は必ず実行し、失敗時は警告表示して停止する。`git pull --ff-only` は pull 前ローカル変更チェック・hash 検証とともに実行する
- 機能追加で docs/ 更新がない場合は警告表示して停止確認する。テスト戦略チェックボックスは必ず更新する
- コメントテンプレートの【必須】セクションを確認してから投稿する
- 学びの検知はエージェント自律で行う（ユーザーに問わない）
- capture 責務は「回収・保存」である: PR 本文から intake/ learning を分離回収してドメイン状態に保存し、同一 commit に含める（capture 境界（capture-boundaries）は `agentdev-workflow-orchestration` 参照）。SPEC確定候補の処理は PR 本文の `## SPEC確定候補` を入力とし、`## Findings / Capture候補` とは区別する
- 完了報告は結果状態を分離して報告する（`.agentdev` push 失敗時は完了扱いにしない）。今回の完了条件に含まれる未対応事項は intake 記録として明示し、完了扱いには含めない
- ドメイン状態永続化の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: 未マージPRはクローズしない
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ実行する
- G08: 未達チェックボックスが残る場合は構造化エラーで停止する。完了条件チェックボックスの評価・更新は case-close の専任責務であり、case-run/ 実行担当サブエージェントは更新しない（PR 作成後に別コンテキストで Issue 本文を再読込し、PR 本文を capture 入力源として最終完了判定する。チェックボックス更新後は再読込して反映を VERIFY する）
- G12: GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲する（gh コマンド直接記述は禁止。gh CLI 出力読み取りも `agentdev-gh-cli` の安全な手順に従う）
- G17: ドメイン状態永続化の `git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`、`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体への一括スコープは行わない
- G21: SPEC status 昇格（draft → accepted）は、対象 SPEC が `draft` かつ今回の実装が SPEC 内容を検証済みの場合のみ実行する（spec-save は accepted を付与しない）
- G24: Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが行う（単一書き手制約。case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない。last-write-wins 競合防止は case-close の単一書き手で維持する）。Epic Wave クローズ時の PR マージ・子Issue クローズは現在 Wave の `running` 子Issue のみを対象とし、`blocked`/ `failed` を `completed` に上書きしない（べき等性、`agentdev-epic-tracker` 準拠）
- G27: squash merge 実行前に PR の mergeable 状態を事前確認し、UNKNOWN の場合は mergeable になるまでポーリング待機する（待機間隔・上限は `agentdev-gh-cli` の mergeable UNKNOWN ポーリング手続きが所有。上限超過時はマージ中止して構造化エラーで停止。ポーリング省略して UNKNOWN 状態のままマージ試行は禁止）。`git pull --ff-only` 実行前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出し、検出時は安全な代替同期手順を選択する



