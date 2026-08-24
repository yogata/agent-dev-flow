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

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-close` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- Issue番号の省略は同一セッション内で作成済みの場合に限り、番号解決はユーザー入力またはセッション内会話から行う
- ブランチ・worktree 削除は必ず実行し、失敗時は警告表示して停止する。`git pull --ff-only` は pull 前ローカル変更チェック・hash 検証とともに実行する
- 機能追加で docs/ 更新がない場合は警告表示して停止確認する。テスト戦略チェックボックスは必ず更新する
- コメントテンプレートの選定は `agentdev-workflow-templates` の選定ルールに従い、【必須】セクションを確認してから投稿する
- 学びの検知はエージェント自律で行う（ユーザーに問わない）
- capture 責務は「回収・保存」である: PR 本文から intake/ learning を分離回収してドメイン状態に保存し、同一 commit に含める（capture 境界（capture-boundaries）は `agentdev-workflow-orchestration` 参照）。Design確定候補の処理は PR 本文の `## Design確定候補` を入力とし、`## Findings / Capture候補` とは区別する
- squash merge 先と統合先ブランチ同期の対象は当該 Case の統合先を参照する（通常Caseは既定 main、実証Caseは対象評価ブランチ。統合先は Issue 本文の実証Case状態情報から確定）。通常Caseの squash merge 先は従来どおり main を基調とし、利用者向け操作と挙動を変更しない。統合先とブランチモデルの基盤契約は `agentdev-git-worktree` Design（extension 経由）参照
- 実証全体の最終 case-close は新しい評価を始めず、事前の評価契約と蓄積済み証拠から最終評価結果を導出し、Issue 最終コメントを正規記録とする。実証Caseの最終 case-close は正式化経路として req-define <実証Issue> を利用者へ明示する（Standard では Standard Issue、Epic では Epic Issue を指定）。Epic 中間Waveでは正式化案内を出さない。case-close は後続 req-define を自動実行しない
- 完了報告は結果状態を分離して報告する（`.agentdev` push 失敗時は完了扱いにしない）。今回の完了条件に含まれる未対応事項は intake 記録として明示し、完了扱いには含めない
- ドメイン状態永続化の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- 未マージPRはクローズしない
- Epic自動クローズは全子IssueがCLOSEDの場合のみ実行する
- 未達チェックボックスが残る場合は構造化エラーで停止する。完了条件チェックボックスの評価・更新は case-close の専任責務であり、case-run/ 実行担当サブエージェントは更新しない（PR 作成後に別コンテキストで Issue 本文を再読込し、PR 本文を capture 入力源として最終完了判定する。チェックボックス更新後は再読込して反映を VERIFY する）（`POL-completion-checkbox-single-writer`）
- GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲する（gh コマンド直接記述は禁止。gh CLI 出力読み取りも `agentdev-gh-cli` の安全な手順に従う）（`POL-gh-io-delegation`）
- ドメイン状態永続化の `git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`、`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体への一括スコープは行わない
- Design status 昇格（draft → accepted）は、対象 Design が `draft` かつ今回の実装が Design 内容を検証済みの場合のみ実行する（design-save は accepted を付与しない）
- Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが行う（単一書き手制約。case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない。last-write-wins 競合防止は case-close の単一書き手で維持する）。Epic Wave クローズ時の PR マージ・子Issue クローズは現在 Wave の `running` 子Issue のみを対象とし、`blocked`/ `failed` を `completed` に上書きしない（べき等性、`agentdev-epic-tracker` 準拠）（`POL-epic-tracking-single-writer`）
- squash merge 実行前に PR の mergeable 状態を事前確認し、UNKNOWN の場合は mergeable になるまでポーリング待機する（待機間隔・上限は `agentdev-gh-cli` の mergeable UNKNOWN ポーリング手続きが所有。上限超過時はマージ中止して構造化エラーで停止。ポーリング省略して UNKNOWN 状態のままマージ試行は禁止）。`git pull --ff-only` 実行前に worktree 状態（dirty tree）・並列実行による ref lock 競合・統合先以外のブランチ占有の3リスクを事前検出し、検出時は安全な代替同期手順を選択する（同期対象は当該 Case の統合先ブランチ）



