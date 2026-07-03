---
title: case-close SPEC
status: draft
created: 2026-06-21
updated: 2026-07-03
---

# case-close SPEC

## 目的

PR をマージし、Case に記録を追記し、クローズ後に worktree とブランチを削除する。
レビュー完了フェーズ。
Epic Issue番号入力時は現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic status table を更新する（Epic Wave クローズ）。

**完了条件チェックボックスの評価、更新は case-close の専任責務**（ADR-0114）。
case-run / Sisyphus-Junior / 外部実行バックエンドは完了条件チェックボックスを更新しない。

**Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが実施する**（ADR-0125 単一書き手制約）。

**責務境界（REQ-0151-007）**: 完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）。
コンフリクト解消の実装変更、オーケストレーション級判断（マージ順序変更、blocked 単位の隔離）は case-auto の責務（`docs/specs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）。

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- 単一 Issue クローズ時: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- Epic Wave クローズ時: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- GitHub API: `gh pr merge --squash`（リトライ最大5回、フォールバック手順あり）、`gh issue close --reason completed`、Issue 本文更新（`--body-file` + VERIFY）、`gh pr view --json mergeable,mergeStateStatus`（squash merge 前の mergeable UNKNOWN ポーリング、REQ-0131-028、最大60秒・10秒間隔）
- git 操作: `git pull --ff-only`、`git fetch origin main:main`（非 main ブランチ占有時の代替同期、REQ-0131-029）、`git add` / `git commit` / `git push`（`.agentdev/` 配下、明示パスステージング、REQ-0137-002/005）
- worktree / ブランチ削除: `agentdev-git-worktree` 手順に従う
- capture 回収: PR 本文から intake / learning を分離回収し `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` へ保存
- SPEC status 昇格: `docs/specs/**` の `status: draft` → `accepted` 昇格（Step 3-2）

## 現在の動作

### 入力判定

- Step 1: Issue番号解決（ユーザー入力またはセッション内会話から取得）。`agentdev-gh-cli` 安全読み取り手順で本文取得
 - Epic Issue 判定（ステータス追跡テーブル存在確認）。存在時は Epic Wave クローズ（Step E1〜E6）へ分岐

### Epic Wave クローズ（REQ-0131-021/022/023/027）

- Step E1: Epic Issue 本文読込（ステータス追跡テーブル（新4列/旧4列形式）を解析）
- Step E2: 現在 Wave 特定（`running` ステータスの子Issue が属する Wave）。`running` がない場合は Wave 番号昇順で最も若い未完了 Wave
- Step E3: PR作成済み子Issue 特定（現在 Wave 内の `running` 子Issue）
- Step E4: 各子Issue のクローズ処理を準並列化する（REQ-0131-027）
 - 並列実行: PR情報取得、PR変更ファイル取得、Issue本文読取、PR本文読取、完了条件チェック事前評価、capture候補抽出、SPEC確定候補確認、worktree/branch削除前チェック
 - 直列集約: squash merge、main pull&hash確認、Epic本文ステータス追跡テーブル更新、.agentdev永続化commit&push、branch/worktree最終削除
 - rebase による機械的コンフリクト解消は停止条件外（REQ-0151-006 Level1）。解消不能時は case-auto へエスカレーション（REQ-0131-025、REQ-0151-002 Level2/3）
- Step E5: Epic status table 更新（単一書き手: case-close、ADR-0125）（`running` → `completed ([PR#N](URL))` に更新）
- Step E6: 最終 Wave 判定（全子Issue completed なら Epic クローズ（Step E6a））。それ以外は残 Wave 通知（Step E6b）

### 単一 Issue クローズ（従来フロー、後方互換）

- Step 1-1: 重複ファイルチェック（`git status --short` と `gh pr view --json files` で重複検出）
- Step 2: 前提確認（達成判定、完了ゲート（QG-4）に従い完了条件チェックボックスを最終評価、更新）。`[x]` 反映事後確認（再読込 VERIFY、最大2回）。未達項目残存時は構造化エラー停止
- Step 3: docs/ 検証（機能追加固有検証（REQ作成、インデックス、spec更新、ADR）、関連ドキュメント整合性確認、DOC-MAP 整合性）
 - Step 3-1: close 時 SPEC / commands / skills 更新漏れの局所確認
 - Step 3-2: SPEC 確定フロー（ADR-0123 Decision #4, REQ-0136-015）（PR 本文の `## SPEC確定候補` セクション読取、確定判断（(a) 昇格 / (b) spec-save 再起動提案 / (c) 見送り））
- Step 4: PRマージ（`gh pr merge --squash`（リトライ最大5回、フォールバック手順）、対応記録コメント追記）
- Step 4-0: squash merge 前の mergeable UNKNOWN ポーリング（REQ-0131-028）（PR 補助データ読込（`agentdev-gh-cli`）で `gh pr view {N} --json mergeable,mergeStateStatus` を取得し、UNKNOWN の場合は最大60秒・10秒間隔でポーリング待機。上限超過時はマージ中止・構造化エラー停止。CONFLICTING 遷移時は Step 4-2 へ分岐）
- Step 4-1: Squash merge 後のローカル先行 commit 検出、処理（REQ-0146-005）（`git log origin/{branch}..HEAD --oneline` で検出、内容重複確認後に `git reset --hard origin/{branch}` で reset（`agentdev-git-worktree` の squash merge 後分岐ハンドリング手順参照））
- Step 4-2: コンフリクト解消 rebase パス（REQ-0151-001/002、REQ-0131-024/025）（squash merge 失敗時）。squash merge がコンフリクトで失敗した場合、`git rebase` による機械的解消を試みる。rebase が自動解決した場合は再マージ（Step 4 へ戻る）。rebase 自体がコンフリクトを発生した場合は実装変更を行わず case-auto へエスカレーションし停止する（コンフリクト解消モデル Level 1、`docs/specs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）
- Step 5: Post-merge テスト戦略検証（CI通過等の反映）
- Step 6: Issueクローズ（`gh issue close --reason completed`）
- Step 7: ブランチ、worktree削除（`agentdev-git-worktree` 手順）。未コミット変更検出、共有作業ツリーでの `git checkout .` 禁止（REQ-0137-001）
- Step 8: 親Epic Issue更新（`agentdev-epic-tracker`、Epic 自動クローズ判定）
- Step 9: 実行前同期（`git pull --ff-only`、hash 検証）
- Step 9-2: git main 同期リスク事前検出、代替同期手順選択（REQ-0131-029）（`git pull --ff-only` 直前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出。検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main` による非チェックアウト同期）を選択。`agentdev-git-worktree` の git main 同期リスク事前検出プロシージャ参照）
- Step 10: 学びの検知、抽出（`agentdev-learning-capture`、ユーザーに学び有無を問わない（G13）、Capture 回収（PR 本文から intake/learning を分離））
- Step 11: ドメイン状態永続化（`.agentdev/` 配下を commit/push（learning と intake を同一 commit））
- Step 12: 完了報告（結果状態の分離報告（GitHub側、`.agentdev`、ブランチ削除））

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（file-pipeline））
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 回収（intake/learning 分離））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave クローズモデル）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ ファイル整合性検査）
- [quality-gates.md](../quality/quality-gates.md)（QG-4）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (REQ-0158-003)

case-close 工程で targeted docs guard を実行する。対象は PR で変更されたファイルと連動ファイル（`docs/DOC-MAP.md`、`docs/README.md`、`docs/specs/README.md`）。

- 実行タイミング: Step 3（docs/ 検証）の一部。変更ファイル対象の targeted docs guard を実行し、draft→accepted 等の SPEC status 変更時の `docs/specs/README.md` 同期、Issue/PR で宣言した文書更新対象と実変更ファイルの対応、旧SPEC直下パス混入検出（IR-057）、local版旧生成方式語彙混入検出、full docs-check 実行要否判定を行う
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --base-ref <merge-base-ref> --json`
- `full_docs_check_recommended` が true の場合: case-close 完了判定の追加確認として扱う。integrity rule 追加・削除・大幅変更、DOC-MAP 構造変更、docs/specs の大規模移動・改名、repo-agentdev-integrity の検査スコープ変更、文書分類・責務境界の基準変更を検出した場合は `/repo/docs-check`（全体監査）の実行を推奨する
- 失敗時: 検査対象文書（PR 変更ファイル、`docs/DOC-MAP.md`、`docs/specs/README.md`、`docs/README.md`）を修正して再実行する

JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。`failure` は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ。

## 対象外

- 未マージPRのクローズ（G01）
- `gh issue list` / `gh issue status` 等による Issue番号解決（G03、ユーザー入力またはセッション内会話からのみ）
- Epic 自動クローズ判定での全子Issue CLOSED 以外のクローズ（G04）
- ブランチ、worktree 削除失敗時の継続（G05、警告表示して停止）
- `git pull --ff-only` 省略、pull 前 hash 検証省略（G06）
- CI 失敗時のマージ続行（G07、case-run へ差し戻し）
- 未達チェックボックス残存時の完了扱い（G08、構造化エラー停止）
- 機能追加で docs/ 更新がない場合の完了続行（G09、警告表示して停止確認）
- 学び有無のユーザー確認（G13、エージェント自律）
- intake と learning の混合単一成果物（G15）
- 今回の完了条件未対応事項の intake への逃がし（G16）
- 共有作業ツリーでの `git checkout .`（G17、REQ-0137-001、他セッション変更の無差別破壊）
- 完了条件チェックボックス評価の他コマンド委譲（G20、case-close 専任責務）
- SPEC status 昇格の他コマンド委譲（G22、case-close 責務、spec-save は accepted を付与しない）
- Epic Issue 本文ステータス追跡テーブルの他コマンド書き込み（G24、case-close 単一書き手）

## 検証観点

- QG-4（Final Acceptance Gate）: Step 2 で Issue 本文の完了条件チェックボックスを最終評価、更新
- チェックボックス事後確認: 更新後に Issue 本文を再読込し全 `- [ ]` が `[x]` に反映されたことを確認（最大2回）
- Squash merge リトライ: 最大5回（5秒待機付き）
- mergeable UNKNOWN ポーリング（REQ-0131-028）: squash merge 前に `gh pr view --json mergeable,mergeStateStatus` で事前確認、UNKNOWN 時は最大60秒（10秒間隔）でポーリング、上限超過時はマージ中止・構造化エラー停止
- git main 同期リスク事前検出（REQ-0131-029）: `git pull --ff-only` 直前に worktree 状態・並列実行 ref lock 競合・非 main ブランチ占有の3リスクを事前検出、検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main`）を選択
- 出力制約: 成果物本文（PR本文、commit message）は verbatim で返す（G10/G18、別途成果物パス、根拠、親判断事項は圧縮）
- 結果状態分離報告: GitHub側、`.agentdev` 永続化、ブランチ削除状態を独立して報告（G19）

## See Also

- [case-run.md](case-run.md)（前段コマンド）
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-quality-gates` skill（QG-4）
- `agentdev-git-worktree` skill（worktree、ブランチ削除）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- `agentdev-learning-capture` skill（学びの検知）
- `agentdev-learning-pipeline` skill（deferred.md ルール）
- `agentdev-workflow-orchestration` skill（Capture 境界、達成判定プロトコル）
- `agentdev-gh-cli` skill（gh CLI 安全使用）
- `agentdev-issue-management` skill（Issue 操作安全性）
- REQ-0131（case-close / 完了処理）
- REQ-0137（並列実行安全 git 操作規律）
- REQ-0151（コンフリクト解消モデルと実行時間観測）
- ADR-0114（完了条件チェックボックス case-close 専任）
- ADR-0125（Epic Issue 本文単一書き手）
- ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
