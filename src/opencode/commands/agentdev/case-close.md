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

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-close.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-close` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが6 STEP（+ Epic Wave クローズ E1〜E6）の control plane として制御構造を所有する。

### Step 1: Issue 番号解決・ルーティング

ユーザー入力・セッション会話から番号取得、Epic Issue 判定（ステータス追跡テーブル存在時は Epic Wave ルートへ）、単一 Issue ルートでは重複ファイルチェック（merge/pull 実行前）

### Step 2: QG-{N} 達成判定

完了条件チェックボックス評価・更新（case-close 専任責務）、観点8 PR対象範囲 vs 全体 評価スコープ判定、test strategy 処理完了確認

### Step 3: docs 検証・SPEC 確定

機能追加・共通検証、targeted docs guard（`--workflow case-close --files`）、IR-{NNN} check_extensions.ts、SPEC 確定フロー（昇格 / spec-save 提案 / 見送り）

### Step 4: PR マージ・コンフリクト解消

mergeable UNKNOWN ポーリング、squash merge、先行 commit 検出（REQ）、コンフリクト Level 1 rebase パス（実装変更せず rebase のみ、Level 2/3 は case-auto エスカレーション）、`--delete-branch` 使用禁止

### Step 5: Post-merge・Issue クローズ

CI 通過確認、Issue 本文更新、Issue close（理由: completed）

### Step 6: クリーンアップ・Capture 回収・永続化

worktree/branch 削除（隔離 worktree のみ `git checkout .` 可、main worktree は禁止）、親Epic 自動クローズ判定（全子Issue CLOSED）、実行前同期（重複ファイルチェック再実行、git main 同期リスク事前検出）、学び検知（エージェント自律）、Capture 回収（PR 本文→intake/learning 分離、Epic 横断回収）、`.agentdev/` commit/push、完了報告（結果状態の分離報告）

**Step E1〜E6: Epic Wave クローズ（Epic Issue 番号入力時のみ）**

現在 Wave の PR作成済み子Issue を一括マージ・クローズ、Epic status table 更新（単一書き手 case-close のみ）、最終 Wave 判定（全子Issue completed → Epic クローズ、以外は残 Wave 通知）

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-case-close` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

**共通ルール**（全 STEP 適用、詳細は workflow skill 参照）: VERIFY（gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証）、コメントテンプレート選定・準拠（`agentdev-workflow-templates` の選定ルール、【必須】セクション確認、欠落時は再生成）

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-close` が所有する。同 Workflow Skill は `/agentdev/case-close` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## ガードレール

- G01: 未マージPRはクローズしない
- G02: Issue番号省略は同一セッション内で作成済みの場合のみ
- G03: Issue番号解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等は禁止。ユーザー入力またはセッション内会話からのみ
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ
- G05: ブランチ、worktree削除は必ず実行。失敗時は警告表示して停止
- G06: `git pull --ff-only` は必ず実行。pull前ローカル変更チェック、hash検証必須
- G07: PRのCI通過確認。CI失敗時は case-run に差し戻す
- G08/G20: 未達チェックボックスが残る場合、構造化エラーで停止。チェックボックス更新後は必ず再読込して反映を確認。完了条件チェックボックスの評価・更新は case-close の専任責務（case-run/ driver/ 外部実行バックエンドは更新しない、別コンテキストで再読込し最終完了判定、更新後に再読込 VERIFY 必須）
- G09: 機能追加で docs/ 更新がない場合、警告表示して停止確認
- G10: テスト戦略チェックボックスを必ず更新
- G11: コメントテンネートの【必須】セクション確認
- G12/G14: GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲（gh コマンド直接記述禁止、REQ、gh CLI出力読み取りは `agentdev-gh-cli` の安全な手順に従う）
- G13: 学びの検知はエージェント自律。ユーザーに問わない
- G15/G16/G18: intake と learning を混合した単一成果物にしない（`agentdev-workflow-orchestration` capture 境界準拠）。learning と intake を同一 commit に含める。今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない
- G17: ドメイン状態永続化 STEP の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する。`git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`、`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体の一括スコープにしないこと
- G19: 完了報告 STEP は結果状態を分離して報告。`.agentdev` push失敗時は完了扱いにしない
- G21/G22/G23: case-close の capture 責務は「回収・保存」（PR 本文から intake/ learning を分離回収しドメイン状態に保存、capture 境界は `agentdev-workflow-orchestration` 参照）。SPEC status 昇格（draft → accepted）は case-close の責務（対象 SPEC が `draft` かつ今回の実装が SPEC 内容を検証済みの場合のみ、spec-save は accepted を付与しない）。SPEC確定候補の処理（docs 検証・SPEC 確定 STEP 内の SPEC 確定フロー）は PR 本文の `## SPEC確定候補` を入力とし `## Findings / Capture候補` とは区別
- G24/G25/G26: Epic Issue 本文ステータス追跡テーブルの更新は case-close のみ（単一書き手制約、case-run は読み取りのみ、case-auto は Wave 反復制御のみ直接書き込まない、last-write-wins 競合防止は case-close の単一書き手で維持）。Epic Wave クローズ（Step E1〜E6）は Epic Issue番号入力時（ステータス追跡テーブル存在時）のみ実行、単一 Issue番号入力時は従来フローを維持（後方互換）。Epic Wave クローズ時の PR マージ・子Issue クローズは現在 Wave の `running` 子Issue のみ対象（`pending`/ `ready`/ `blocked`/ `failed` は対象外、`blocked`/ `failed` を `completed` に上書きしない、べき等性、`agentdev-epic-tracker` 準拠）
- G27/G28: squash merge 実行前に PR の mergeable 状態を事前確認し UNKNOWN の場合は mergeable になるまでポーリング待機（待機間隔・上限は `agentdev-gh-cli` の mergeable UNKNOWN ポーリング手続きが所有、AG-{NNN}、上限超過時はマージ中止し構造化エラーで停止、ポーリング省略して UNKNOWN 状態のままマージ試行禁止）。`git pull --ff-only` 実行前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出し、検出時に安全な代替同期手順を選択（REQ、暗黙の手順順序依存で pull を継続しない）



