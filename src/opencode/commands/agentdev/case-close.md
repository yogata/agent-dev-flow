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

## 手順

### Step 1: Issue番号解決

ユーザー入力またはセッション内会話から番号を取得。複数候補時は直近を優先して確認。検出不可時はユーザーに指定を求めて停止

**Epic Issue 判定**: 解決した Issue番号の本文を `agentdev-gh-cli` の安全な読み取り手順で取得し、ステータス追跡テーブル（`agentdev-epic-tracker` の新4列/旧4列形式）が存在するか確認。テーブル存在時は **Epic Wave クローズ**（Step E1〜E6）へ分岐。テーブル不存在時は **単一 Issue クローズ**（Step 1-1〜）へ進む（後方互換）

### Epic Wave クローズ（`case-close #epic` 受領時、Step 1 から分岐）

現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic status table を更新する。最終 Wave 判定後に Epic Issue クローズ または 残 Wave 通知を行う。E1（Epic Issue 本文読込、ステータス追跡テーブル解析）、E2（現在 Wave 特定）、E3（PR作成済み子Issue 特定）、E4（各子Issue の PR マージ・子Issue クローズ・完了条件チェックボックス評価・Capture 回収・コンフリクト解消の準並列化、REQ）、E5（Epic status table 更新、単一書き手 case-close のみ）、E5b（Epic Issue 完了条件チェックボックス最終評価・更新、QG-4 観点8、中間 Wave vs 最終 Wave 評価スコープ切替）、E6（最終 Wave 判定: 全子Issue completed なら Epic クローズ、以外は残 Wave 通知）の詳細手順、判定基準、再読込 VERIFY、未達項目残存時の停止条件は `agentdev-epic-tracker` を正とする

**単一 Issue クローズ**（従来フロー、後方互換）:

**Step 1-1**: 重複ファイルチェック（merge/pull 実行前）。`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャに従い、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出、停止条件の判定を行う。PR 補助データ読込手続き（`agentdev-gh-cli`）実行不可時は後方互換性として Step 9（実行前同期）でフォールバック検出を維持する

### Step 2: 前提確認

達成判定、完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価、更新する。判定基準、検査観点は同スキル（`agentdev-quality-gates`）の QG-4 を参照

- **完了条件チェックボックス評価、更新は case-close の責務**（QG-4）。case-run、実行担当サブエージェント、外部実行バックエンドは完了条件チェックボックスを更新しない。case-close は case-run/ 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
- **PR 対象範囲 vs 全体 評価スコープ判定（QG-4 観点8）**: unchecked 完了条件を達成判定する前に、各完了条件の評価スコープ（PR 対象範囲 or 全体）を QG-4 観点8「PR 対象範囲 vs 全体 判定マトリクス」に従い決定する（境界ケース #1532/TS-006 由来）。手順、再 grep/再検査/再計測、事後確認（再読込 VERIFY）、未達項目残存時の停止（G08）、test strategy 処理完了確認（REQ、未処理項目が残る場合は構造化エラーで停止）の詳細は `agentdev-quality-gates` の QG-4 を参照。PR 存在確認

### Step 3: docs/ 検証

機能追加固有の検証（REQ作成、インデックス記載、spec更新、ADR作成）および全work_type共通の関連ドキュメント整合性確認、README 索引整合性確認。不足時は警告表示してユーザー判断を仰ぐ。PR 本文の `## SPEC確定候補` セクションから SPEC 確定フロー（Step 3-2）を実行する。**文書分類ポリシー適合確認**: document-model SPEC（extension 経由）の Document Classification Policy に基づき、最終ドキュメント状態が分類ポリシーに適合していることを確認する

**Step 3-1**: close 時 SPEC/ commands/ skills 更新漏れの局所確認（実装完了、PRマージ前に、SPEC 本文と実装の最終矛盾確認、command 定義の更新漏れ、skill 責務境界の変更漏れを確認、更新漏れ検出時は警告表示してユーザー判断、局所予防の範囲で `/agentdev/inspect-docs` の全体意味レビューの代替ではない）。**extensions 整合性検査（IR-056、REQ）**: 当該 PR が `.opencode/commands/agentdev/**/*.md`、`.opencode/skills/agentdev-*/SKILL.md`、`.opencode/skills/agentdev-*/references/**/*.md`、`.agentdev/extensions/**` のいずれかを変更した場合、`check_extensions.ts` を strict 実行し、IR-056 違反がないことを確認する。違反時はマージを停止しユーザー判断を仰ぐ。**targeted docs guard（REQ）**: 変更ファイルと連動ファイルに対し targeted docs guard を実行（case-close はマージ後 main 環境で実行されるため `--files` を使用）。実行コマンド `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --files <PR 変更ファイル一覧> --json`（`<PR 変更ファイル一覧>` は space 区切り推奨、comma 区切り、混在も可）。JSON 出力の `failures` に strict severity が含まれる場合はマージを停止し対象ファイルを修正して再実行。`full_docs_check_recommended` が true の場合は `/repo/docs-check`（全体監査）の実行をユーザーに提案する。draft→accepted 等の SPEC status 変更時は `spec_readme_update_required` を Step 3-2 SPEC 確定フローに反映する。**files_checked 空時の確認（REQ）**: targeted docs guard の JSON 出力で `files_checked` が空の場合、検査見逃しリスクとして扱い、`warnings` 配列の警告を確認、`--files` 指定の妥当性を確認、必要に応じて再実行または手動確認、空の理由が正当であることを確認してから続行する

**Step 3-2**: SPEC 確定フロー。PR 本文の `## SPEC確定候補` セクション（case-run/ driver が記録）を読み取り、SPEC の確定、昇格を処理する。セクション不存在・空の場合はスキップ。(a) **case-close 内で SPEC 昇格**: 対象 SPEC の `status` を `draft` → `accepted` に昇格（編集スコープ: `docs/specs/**`、実装が SPEC 内容を検証済みの場合）。(b) **spec-save 再起動の提案**: SPEC確定候補が SPEC ファイル未保存の場合、`/agentdev/spec-save` の再実行を提案し case-close は完了させる。(c) **見送り**: 確定不要と判断した場合、候補を Findings/ Capture候補 に準じて記録し後続へ委ねる。SPEC status 昇格タイミング（draft → accepted）の詳細、frontmatter `status` と `updated` の更新、SPEC 確定候補処理の詳細は `agentdev-spec-file-manager/references/spec-lifecycle-application.md` を参照

### case-close が使用する検査ツール

case-close が使用する検査ツール（integrity 契約 SPEC「Workflow × 使用ツールマトリックス」参照）: check_changed_docs.ts（--workflow case-close、--files <PR 変更ファイル一覧>、Step 3-1 targeted docs guard で実行、AG-003）、check_extensions.ts（IR-056、`.opencode/commands/agentdev/**/*.md`, `.opencode/skills/agentdev-*/SKILL.md`, `.opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行、Step 3-1）、test_strategy（QG-4 完了条件確認）。上記は全て肯定表現である

### Step 4: PRマージ

**Step 4-0**: squash merge 前の mergeable UNKNOWN ポーリング。`agentdev-gh-cli` の「squash merge 前の mergeable UNKNOWN ポーリング」手続きに従い、対象 PR の `mergeable` 状態事前確認、`UNKNOWN` ポーリング待機、上限超過時の構造化エラー停止、待機中の `CONFLICTING` 遷移検出を自動分岐させ、コンフリクト解消パス（Step 4-2）へ即時接続する。ポーリング間隔・上限値は gh-cli 手続き側が所有する（AG-001）。PR merge 手続き（squash 方式、`agentdev-gh-cli`）を実行 → HEAD commit hash 記録（`agentdev-git-worktree` skill に従い）。**Squash merge 失敗時のリトライ**: `agentdev-gh-cli` の「squash merge リトライ手続き」に従う（待機間隔・最大試行回数は gh-cli 手続き側が所有、AG-001、各試行のログ記録、全試行失敗時のフォールバックは template `.opencode/commands/agentdev/templates/case-close/standard.md` 参照）。対応記録コメントを Issue に追加（テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` から Read して `agentdev-gh-cli` の VERIFY 操作に従って内容検証）。**`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない（アクティブ worktree に checkout されたブランチで local 削除が失敗し remote 削除フェーズへ到達しないため）。ブランチ削除は Step 7 で独立実施する（REQ）

**Step 4-1**: Squash merge 後のローカル先行 commit 検出、処理（REQ）。squash merge 完了後、ローカルに remote 未 push の先行 commit が存在する場合、`agentdev-git-worktree` の「Squash merge 後分岐ハンドリング手順（REQ）」に従い、ローカル先行 commit 検出、内容重複確認、reset を実行する。本処理により `git pull --ff-only` 失敗を予防する

**Step 4-2**: コンフリクト解消 rebase パス（REQ/002、REQ/025）。squash merge がコンフリクトで失敗した場合（Step 4 のリトライ全失敗後、エラー原因がコンフリクトの場合）に実行する機械的解消パス（コンフリクト解消モデル Level 1）。`agentdev-git-worktree` の「コンフリクト解消 rebase パス（REQ）」に従い、rebase による機械的解消を試みる（**実装変更は行わず** rebase のみ）。rebase 自動解決時は squash merge（Step 4）へ戻り再マージ、rebase コンフリクト発生時は case-auto へエスカレーションして停止する（コンフリクト解消モデル Level 2/3 は case-auto の責務）

### Step 5: Post-merge テスト戦略検証

マージ後のみ確認可能な項目（CI通過等）を反映。Issue 本文更新手続き（`agentdev-gh-cli`）で更新 → VERIFY

### Step 6: Issueクローズ

Issue close 手続き（理由: completed、`agentdev-gh-cli`）

### Step 7: ブランチ、worktree削除

`agentdev-git-worktree` の worktree削除手順に従う: 未コミット変更検出（`agentdev-git-worktree` skill に従い）。squash merge 済みの場合 → 当該 worktree が隔離されている（専用 worktree + branch で index が独立）場合のみ `git checkout .` で破棄可。**共有作業ツリー（main worktree）では `git checkout .` は禁止**（他セッション変更の無差別破壊）。本 Step は worktree 削除フェーズ内の隔離 worktree でのみ実行する。runtime workspace のクリーンアップは harness の責務、case-close は関与しない。worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）。ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）。リモートブランチ削除。削除失敗時は警告表示して停止すること

### Step 8: 親Epic Issue更新

`agentdev-epic-tracker` スキル参照: Issue本文から Parent Issue番号を特定（`Parent: #{N}` パターン）。Parent なし → スキップ。ステータストラッキング表を更新 → `agentdev-gh-cli` VERIFY。子Issue状態事前取得: Issue 補助データ読込手続き（`agentdev-gh-cli`）で全子Issueの OPEN/CLOSED 状態を一覧取得しログ出力。Epic自動クローズ判定: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

### Step 9: 実行前同期

**Step 9-1**: Step 1-1（重複ファイルチェック）再実行。`git pull --ff-only` 直前に、`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャを再実行する（L-013、PR #1128 由来、共有 main worktree で Step 1-1 実行時点から Step 9 実行までの間に並列セッションが加えた未コミット変更を検知するため）。重複ファイルを検出した場合、構造化エラーで停止しユーザーによる対応（stash/commit/checkout）を促すこと。**Step 9-2**: git main 同期リスク事前検出、代替同期手順選択（REQ）。`agentdev-git-worktree` の「git main 同期リスク事前検出プロシージャ（REQ）」に従い、worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスク事前検出と代替同期手順選択を実行する。`agentdev-git-worktree` に従い `git pull --ff-only` を実行（ローカル変更事前チェック、hash検証、不一致時は評価・承認のやり直し）

### Step 10: 学びの検知、抽出

`agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断（ユーザーに学びの有無を問うことは禁止）。学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知。採用済み成果物取り込み判定 → `agentdev-learning-pipeline`（manual reference）の deferred ルール。**Capture 回収責務**: PR 本文の `## Findings / Capture候補` セクションから intake/ learning を分離回収する（intake 候補は `.agentdev/intake/inbox/`、learning 候補は `.agentdev/learning/inbox.md`、Epic 横断回収）。**Capture 境界**: intake/ learning 境界は `agentdev-workflow-orchestration`（capture-boundaries）を参照。intake と learning を別々の成果物として扱う。**一時会話コンテキスト不入力**: case-run の一時会話コンテキスト（ローカル変数、中間ファイル等）を capture の入力として使用しない。capture 情報の入力源は PR 本文のみ

### Step 11: ドメイン状態永続化

`agentdev-git-worktree` に従い `.agentdev/` 配下を commit/push。learning と intake を同一 commit に含める

> **auto-close 回避の留意点**: 本コマンド名 `case-close` は "close" を含む複合語。コミットメッセージに `(case-close #N)` 等のコマンド名と Issue 番号の近接表記を用いると、GitHub が "close" を auto-close キーワードと誤認し Issue を意図せずクローズするリスクがある。コミットメッセージのフォーマットは `agentdev-conventional-commits` skill の「GitHub auto-close 回避ガイドライン」に従い、コマンド名と Issue 番号を分離し `#` 記号による近接参照を避けること（例: `case-close for Issue N`）

### Step 12: 完了報告

完了報告templateに従って出力。結果状態に応じた種別を選択: 全系統成功 → `.opencode/commands/agentdev/templates/case-close/standard.md`、`.agentdev` push失敗 → `agentdev-push-failed.md`、ブランチ・worktree削除失敗 → `worktree-cleanup-failed.md`。GitHub完了後に `.agentdev` push失敗の場合は standard 種別 を使用してはならない。**結果状態の分離報告**: GitHub側完了状態、`.agentdev` 永続化状態、ブランチ削除状態を独立して報告

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
- G17: Step 11 の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する。`git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`、`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体の一括スコープにしないこと
- G19: Step 12 は結果状態を分離して報告。`.agentdev` push失敗時は完了扱いにしない
- G21/G22/G23: case-close の capture 責務は「回収・保存」（PR 本文から intake/ learning を分離回収しドメイン状態に保存、capture 境界は `agentdev-workflow-orchestration` 参照）。SPEC status 昇格（draft → accepted）は case-close の責務（対象 SPEC が `draft` かつ今回の実装が SPEC 内容を検証済みの場合のみ、spec-save は accepted を付与しない）。SPEC確定候補の処理（Step 3-2）は PR 本文の `## SPEC確定候補` を入力とし `## Findings / Capture候補` とは区別
- G24/G25/G26: Epic Issue 本文ステータス追跡テーブルの更新は case-close のみ（単一書き手制約、case-run は読み取りのみ、case-auto は Wave 反復制御のみ直接書き込まない、last-write-wins 競合防止は case-close の単一書き手で維持）。Epic Wave クローズ（Step E1〜E6）は Epic Issue番号入力時（ステータス追跡テーブル存在時）のみ実行、単一 Issue番号入力時は従来フローを維持（後方互換）。Epic Wave クローズ時の PR マージ・子Issue クローズは現在 Wave の `running` 子Issue のみ対象（`pending`/ `ready`/ `blocked`/ `failed` は対象外、`blocked`/ `failed` を `completed` に上書きしない、べき等性、`agentdev-epic-tracker` 準拠）
- G27/G28: squash merge 実行前に PR の mergeable 状態を事前確認し UNKNOWN の場合は mergeable になるまでポーリング待機（待機間隔・上限は `agentdev-gh-cli` の mergeable UNKNOWN ポーリング手続きが所有、AG-001、上限超過時はマージ中止し構造化エラーで停止、ポーリング省略して UNKNOWN 状態のままマージ試行禁止）。`git pull --ff-only` 実行前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出し、検出時に安全な代替同期手順を選択（REQ、暗黙の手順順序依存で pull を継続しない）



