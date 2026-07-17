---
description: PRをマージし、対応記録を追記し、Caseをクローズしてブランチを削除する。Epic Issue番号入力時は現在 Wave の一括クローズ（Epic Wave クローズ）を行う
agent: sisyphus
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

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-close.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- **単一 Issue クローズ時**: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- **Epic Wave クローズ時**: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 手順

### Step 1: Issue番号解決

ユーザー入力またはセッション内会話から番号を取得。
複数候補時は直近を優先して確認。
検出不可時はユーザーに指定を求めて停止

 - **Epic Issue 判定**: 解決した Issue番号の本文を `agentdev-gh-cli` の安全な読み取り手順で取得し、ステータス追跡テーブル（Wave/子Issue 構成、`agentdev-epic-tracker` の新4列/旧4列形式）が存在するか確認。テーブル存在時は **Epic Wave クローズ**（Step E1〜E6）へ分岐。テーブル不存在時は **単一 Issue クローズ**（Step 1-1〜）へ進む（後方互換）

**Epic Wave クローズ**（`case-close #epic` 受領時、Step 1 から分岐）:

`case-close` が Epic Issue番号を受領した場合の Wave 単位クローズフロー。
現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic status table を更新する。
最終 Wave 判定後に Epic Issue クローズ または 残 Wave 通知を行う。

**E1. Epic Issue 本文読込**: `agentdev-gh-cli` の安全な読み取り手順で Epic Issue 本文を取得。ステータス追跡テーブル（新4列形式: `#`/ `Issue`/ `ステータス`/ `内容`、または旧4列形式）を解析し、Wave 構成、各子Issue のステータス（`pending`/ `ready`/ `running`/ `completed`/ `blocked`/ `failed`）、PR番号リンクを抽出

**E2. 現在 Wave 特定**: ステータス追跡テーブルから、`running` ステータスの子Issue が属する Wave を「現在 Wave」として特定。`running` が存在しない場合、Wave 番号昇順で最も若い未完了 Wave（`completed` 以外の子Issue を含む Wave）を現在 Wave とする

**E3. PR作成済み子Issue 特定**: 現在 Wave 内の `running` ステータス子Issue を「PR作成済み子Issue」として特定。
各子Issue に紐づく PR 番号を子Issue 本文、PR 一覧取得手続き（`agentdev-gh-cli`、検索条件: `Closes #N`）等で特定。
`running` 以外のステータス（`pending`/ `ready`/ `blocked`/ `failed`）は本フローの対象外

**E4. 各子Issue の PR マージ、子Issue クローズ（準並列化、REQ）**: E3 で特定した子Issue を準並列化で処理する。
並列実行可能な処理（PR情報取得、Issue本文読取、完了条件チェック事前評価等）と直列集約が必要な処理（squash merge、Epic本文ステータス追跡テーブル更新等）を分離する。
個別リスト（並列対象/直列集約対象）は case-close command SPEC（extension 経由）Step E4 を参照:
 - **PR マージ**: PR merge 手続き（squash 方式、`agentdev-gh-cli`）を実行（Step 4 の squash merge リトライ、フォールバック手順に準拠）
 - **子Issue クローズ**: Issue close 手続き（理由: completed、`agentdev-gh-cli`）
 - **完了条件チェックボックス評価**: QG-4 に従い子Issue 本文の完了条件を最終評価、更新
 - **Capture 回収**: 各子Issue の PR 本文から intake/ learning を分離回収（Step 10 相当、Epic 横断回収）
 - **コンフリクト解消**: rebase による機械的コンフリクト解消は停止条件外とする（REQ Level1）。rebase で解消不能なコンフリクトは実装変更を行わず case-auto へエスカレーションする（REQ、REQ Level2/3、Step 4-2 参照）

**E5. Epic status table 更新（単一書き手: case-close）**: E4 でクローズした各子Issue のステータスを `running` → `completed ([PR#N](URL))` に更新。`agentdev-epic-tracker` スキルの正規表現パターン（running → completed）に従い、`agentdev-issue-management` の安全手順、`agentdev-gh-cli` の VERIFY 操作で本文を再取得し検証
 - **Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが実施する**（単一書き手制約）。case-run は読み取るのみ（書き込まない）。case-auto は Wave 反復制御のみ（直接書き込まない）

**E6. 最終 Wave 判定**: ステータス追跡テーブル全体を再確認し、全子Issue が `completed` かを判定（`blocked`/ `failed` は終了状態だが `completed` とはみなさない）:
 - **E6a. 最終 Wave（全子Issue completed）**: Epic Issue 自体を Issue close 手続き（理由: completed、`agentdev-gh-cli`）でクローズ→ Epic レベルの最終処理（Step 10/ Step 11 相当の Epic 横断 capture 回収、`.agentdev/` 永続化、学びの検知）→ Epic 完了報告（Step 12 相当）
 - **E6b. 最終 Wave 以外**: 残 Wave 状況を通知して停止:
 - 完了 Wave 一覧（Wave 番号、子Issue 番号、PR 番号）
 - 残 Wave 一覧（Wave 番号、対象子Issue 番号、各ステータス）
 - 次実行可能 Issue（依存が満たされた `pending` 子Issue のうち最も若い番号、存在しない場合は「次 Wave の case-run 完了待ち」と明記）

**単一 Issue クローズ**（従来フロー、後方互換）:

**Step 1-1**: 重複ファイルチェック（merge/pull 実行前）。`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャ（`references/git-common-procedures.md` Section 7）に従い、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出、停止条件の判定を行う。PR 補助データ読込手続き（`agentdev-gh-cli`）実行不可時は後方互換性として Step 9（実行前同期）でフォールバック検出を維持する

### Step 2: 前提確認

達成判定、完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価、更新する。判定基準、検査観点は同スキルの `.opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md` を参照:
 - **完了条件チェックボックス評価、更新は case-close の責務**（QG-4）。case-run、実行担当サブエージェント、外部実行バックエンドは完了条件チェックボックスを更新しない。case-close は case-run/ 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
 - unchecked項目を達成判定（証拠ソース、`agentdev-workflow-orchestration` のプロトコルに従い）し `[x]` に更新
 - 達成不可項目を自律解決判定（変更対象分類×検証種別分類）
 - Issue 本文更新手続き（`agentdev-gh-cli`）で完了条件を反映 → VERIFY
 - **事後確認（再読込 VERIFY）**: 更新後にIssue本文を再読込し、完了条件セクションの全 `- [ ]` が `[x]` に反映されていることを確認。未反映の場合は再更新（最大2回）し、それでも失敗する場合は構造化エラーで停止
 - 未達項目が残る場合 → 構造化エラーで停止（G08）
 - **test strategy 処理完了確認（REQ）**: Issue 本文のテスト戦略セクションに含まれる全 test strategy 項目（verification / pass_criteria / on_failure の3要素構造）が「合格」または PR 本文の `## Findings / Capture候補` セクションへの Findings 記録済み（record-in-findings）であることを確認する。判定基準、検査観点は QG-4 の「test strategy 処理完了」検査観点（`qg-4-final-acceptance.md`）を参照。未処理の test strategy 項目が残る場合、完了扱いとせず構造化エラーで停止する（G08）。Issue 本文にテスト戦略セクションが存在しない場合は本確認を skip する
 - PR存在確認

### Step 3: docs/ 検証

機能追加固有の検証（REQ作成、インデックス記載、spec更新、ADR作成）および全work_type共通の関連ドキュメント整合性確認。
DOC-MAP整合性確認。
不足時は警告表示してユーザー判断を仰ぐ。
PR 本文の `## SPEC確定候補` セクションから SPEC 確定フロー（Step 3-2）を実行する
  - **文書分類ポリシー適合確認**: document-model SPEC（extension 経由）の Document Classification Policy に基づき、最終ドキュメント状態が分類ポリシーに適合していることを確認する

**Step 3-1**: close 時 SPEC/ commands/ skills 更新漏れの局所確認（実装完了、PRマージ前に、今回の変更に伴う以下の更新漏れを局所的に確認する）:
 - SPEC 本文と実装の最終矛盾確認
 - 変更に伴う command 定義の更新漏れ
 - 変更に伴う skill 責務境界の変更漏れ
 - 更新漏れを検出した場合は警告表示してユーザー判断を仰ぐ
 - **局所予防の範囲**: この確認は close 時の局所的な漏れ検出であり、`/agentdev/inspect-docs` の全体意味レビューの代替ではない
  - **extensions 整合性検査（IR-056、REQ）**: 当該 PR が `.opencode/commands/agentdev/**/*.md`、`.opencode/skills/agentdev-*/SKILL.md`、`.opencode/skills/agentdev-*/references/**/*.md`、`.agentdev/extensions/**` のいずれかを変更した場合、`check_extensions.ts` を strict 実行し、IR-056 違反がないことを確認する。違反時はマージを停止しユーザー判断を仰ぐ
   - **targeted docs guard（REQ）**: 変更ファイルと連動ファイルに対し targeted docs guard を実行する。PR 変更ファイル一覧は PR 補助データ読込手続き（`agentdev-gh-cli`、PR 変更ファイル一覧取得）で取得する（case-close はマージ後 main 環境で実行されるため `--files` を使用。`--base-ref` は worktree 環境（マージ前、case-run 等）向け）。実行コマンド:

    ```bash
    bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
      --workflow case-close --files <PR 変更ファイル一覧> --json
    ```

   JSON 出力の `failures` に strict severity が含まれる場合はマージを停止し、対象ファイルを修正して再実行する。`full_docs_check_recommended` が true の場合は `/repo/docs-check`（全体監査）の実行をユーザーに提案する。draft→accepted 等の SPEC status 変更時は `spec_readme_update_required` を Step 3-2 SPEC 確定フローに反映する
   - **files_checked 空時の確認（REQ）**: targeted docs guard の JSON 出力で `files_checked` が空の場合、検査見逃しリスクとして扱う。`warnings` 配列に検査対象ファイル未検出の警告が出力されるため、以下を確認する。確認を経ずに `files_checked` 空のまま完了扱いとしない:
     1. 警告を検査見逃しのリスクとして認識する
     2. `--files` 指定の妥当性を確認する（PR 変更ファイル一覧の再取得、パス指定の確認）
     3. 必要に応じて `--files` を修正して再実行、または対象ファイルを手動確認する
     4. 空の理由が正当（対象ファイルが本当に変更されていない等）であることを確認してから続行する

**Step 3-2**: SPEC 確定フロー。
PR 本文の `## SPEC確定候補` セクション（case-run/ driver が記録）を読み取り、SPEC の確定、昇格を処理する。
セクションが存在しない、空の場合はスキップする:
 - **SPEC確定候補の提示**: SPEC確定候補一覧（対象 SPEC、内容、分類）をユーザーに提示する
 - **確定判断**: 各候補について以下のいずれかをユーザー承認のもと選択する:
 - (a) **case-close 内で SPEC 昇格**: 対象 SPEC の `status` を `draft` → `accepted` に昇格する（編集スコープ: `docs/specs/**`）。実装が SPEC 内容を検証済みであることを確認できた場合
 - (b) **spec-save 再起動の提案**: SPEC確定候補が SPEC ファイル未保存（新規 SPEC 候補、追記候補）の場合、`/agentdev/spec-save` の再実行を提案し case-close は完了させる
 - (c) **見送り**: 確定不要と判断した場合、候補を Findings/ Capture候補 に準じて記録し後続へ委ねる
 - **SPEC status 昇格タイミング（draft → accepted）**: 以下の両方を満たした場合に昇格させる:
 - 対象 SPEC が `status: draft` であること
 - 今回の実装（PR）が当該 SPEC の内容を検証（実装と整合）したことを case-close Step 3 の docs/検証で確認できたこと
  - 昇格時は SPEC frontmatter `status` を `accepted` に更新し、`updated` 日付を更新する

### case-close が使用する検査ツール

case-close が使用する検査ツール（[integrity-contracts.md](../../../../docs/specs/integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow case-close、--files <PR 変更ファイル一覧>）: Step 3-1 targeted docs guard で実行（AG-003）
- check_extensions.ts（IR-056）: `.opencode/commands/agentdev/**/*.md`, `.opencode/skills/agentdev-*/SKILL.md`, `.opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行（Step 3-1）
- test_strategy: QG-4 完了条件確認（REQ-0131-026）

※上記は全て肯定表現である（REQ-0144-002, REQ-0144-003 準拠）。

### Step 4: PRマージ

**Step 4-0: squash merge 前の mergeable UNKNOWN ポーリング（REQ）**。
`agentdev-gh-cli` の「squash merge 前の mergeable UNKNOWN ポーリング」手続き（`references/standard-procedures.md` 該当セクション、REQ）に従い、対象 PR の `mergeable` 状態事前確認、`UNKNOWN` ポーリング待機（最大60秒・10秒間隔）、上限超過時の構造化エラー停止、待機中の `CONFLICTING` 遷移検出を自動分岐させ、コンフリクト解消パス（Step 4-2）へ即時接続する。

  - PR merge 手続き（squash 方式、`agentdev-gh-cli`）を実行 → HEAD commit hash 記録（`agentdev-git-worktree` skill に従い）
  - **Squash merge失敗時の自動リトライ**:
  - 失敗時は5秒待機して再試行
  - 最大5回リトライ（初期試行 + 5回リトライ）
  - 各リトライ試行をログ記録
  - **全リトライ失敗時のフォールバック**: フォールバック手順は template (`.opencode/commands/agentdev/templates/case-close/standard.md`) を参照
  - 対応記録コメントをIssueに追加 → テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` から Readして `agentdev-gh-cli` の VERIFY 操作に従って内容検証
  - **`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない。アクティブ worktree に checkout されたブランチで `--delete-branch` を使用すると local 削除が失敗し remote 削除フェーズへ到達しない。ブランチ削除は Step 7 で独立実施する（REQ）

**Step 4-1: Squash merge 後のローカル先行 commit 検出、処理（REQ）**。
squash merge 完了後、ローカルに remote 未 push の先行 commit が存在する場合、`agentdev-git-worktree` の「Squash merge 後分岐ハンドリング手順（REQ）」（`references/git-common-procedures.md` 該当セクション）に従い、ローカル先行 commit 検出、内容重複確認、reset を実行する。本処理により `git pull --ff-only` 失敗を予防する

**Step 4-2: コンフリクト解消 rebase パス（REQ/002、REQ/025）**。
squash merge がコンフリクトで失敗した場合（Step 4 のリトライ全失敗後、エラー原因がコンフリクトの場合）に実行する機械的解消パス（コンフリクト解消モデル Level 1）。
`agentdev-git-worktree` の「コンフリクト解消 rebase パス（REQ）」（`references/git-common-procedures.md` 該当セクション）に従い、rebase による機械的解消を試みる。**実装変更は行わず** rebase のみ試みる。rebase 自動解決時は squash merge（Step 4）へ戻り再マージ、rebase コンフリクト発生時は case-auto へエスカレーションして停止する（コンフリクト解消モデル Level 2/3 は case-auto の責務）

### Step 5: Post-merge テスト戦略検証

マージ後のみ確認可能な項目（CI通過等）を反映。Issue 本文更新手続き（`agentdev-gh-cli`）で更新 → VERIFY

### Step 6: Issueクローズ

Issue close 手続き（理由: completed、`agentdev-gh-cli`）

### Step 7: ブランチ、worktree削除

`agentdev-git-worktree` の worktree削除手順に従う:
 - 未コミット変更検出（`agentdev-git-worktree` skill に従い）
 - squash merge 済みの場合 → 当該 worktree が隔離されている（専用 worktree + branch で index が独立）場合のみ `git checkout .` で破棄可。**共有作業ツリー（main worktree）では `git checkout .` は禁止**（他セッション変更の無差別破壊）。本 Step は worktree 削除フェーズ内の隔離 worktree でのみ実行する
  - runtime workspace のクリーンアップは harness の責務（REQ-0162-002）。case-close は関与しない
 - worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）
 - ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）
 - リモートブランチ削除
 - 削除失敗時は警告表示して停止すること

### Step 8: 親Epic Issue更新

`agentdev-epic-tracker` スキル参照:
 - Issue本文から Parent Issue番号を特定（`Parent: #{N}` パターン）
 - Parent なし → スキップ
 - ステータストラッキング表を更新 → `agentdev-gh-cli` VERIFY
 - 子Issue状態事前取得: Issue 補助データ読込手続き（`agentdev-gh-cli`）で全子Issueの OPEN/CLOSED 状態を一覧取得しログ出力（例: `子Issue状態一覧: #N1 (OPEN), #N2 (CLOSED), ...`）
 - Epic自動クローズ判定: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

### Step 9: 実行前同期

**Step 9-1**: Step 1-1（重複ファイルチェック）再実行。
`git pull --ff-only` 直前に、`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャ（`references/git-common-procedures.md` Section 7）を再実行する（L-013、PR #1128 由来）。
  - 共有 main worktree で Step 1-1 実行時点から Step 9 実行までの間に並列セッションが加えた未コミット変更を検知するためである
  - 重複ファイルを検出した場合、構造化エラーで停止しユーザーによる対応（stash/commit/checkout）を促すこと

**Step 9-2: git main 同期リスク事前検出、代替同期手順選択（REQ）**。
`agentdev-git-worktree` の「git main 同期リスク事前検出プロシージャ（REQ）」（`references/git-common-procedures.md` Section 9）に従い、worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスク事前検出と代替同期手順選択を実行する。暗黙の手順順序依存を明示的な事前チェックに置き換える（3件の pull 失敗事象に基づく）。

`agentdev-git-worktree` に従い `git pull --ff-only` を実行。ローカル変更事前チェック、hash検証、不一致時は評価、承認のやり直し

### Step 10: 学びの検知、抽出

`agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断:
 - ユーザーに学びの有無を問うことは禁止
 - 学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知
 - 採用済み成果物取り込み判定 → `agentdev-learning-pipeline`（manual reference）の deferred ルール
 - **Capture 回収責務**: PR 本文の `## Findings / Capture候補` セクションから intake/ learning を分離回収する。intake 候補は `.agentdev/intake/inbox/` に保存し、learning 候補は `.agentdev/learning/inbox.md` に保存する。Epic 横断回収
 - **Capture 境界**: intake/ learning 境界は `agentdev-workflow-orchestration` を参照
 - intake と learning を別々の成果物として扱う
 - **一時会話コンテキスト不入力**: case-run の一時会話コンテキスト（ローカル変数、中間ファイル等）を capture の入力として使用しない。capture 情報の入力源は PR 本文のみ

### Step 11: ドメイン状態永続化

`agentdev-git-worktree` に従い `.agentdev/` 配下を commit/push。learning と intake を同一 commit に含める

> **auto-close 回避の留意点**: 本コマンド名 `case-close` は "close" を含む複合語である。コミットメッセージに `(case-close #N)` 等のコマンド名と Issue 番号の近接表記を用いると、GitHub が "close" を auto-close キーワードと誤認し Issue を意図せずクローズするリスクがある。コミットメッセージのフォーマットは `agentdev-conventional-commits` skill の「GitHub auto-close 回避ガイドライン」に従い、コマンド名と Issue 番号を分離し `#` 記号による近接参照を避けること（例: `case-close for Issue N`）。

### Step 12: 完了報告

完了報告templateに従って出力。結果状態に応じた種別を選択:
 - 全系統成功 → .opencode/commands/agentdev/templates/case-close/standard.md
 - .agentdev push失敗 → .opencode/commands/agentdev/templates/case-close/`agentdev-push-failed`.md
 - ブランチ、worktree削除失敗 → .opencode/commands/agentdev/templates/case-close/worktree-cleanup-failed.md
 - GitHub完了後に .agentdev push失敗の場合は standard 種別 を使用してはならない
 - **結果状態の分離報告**: GitHub側完了状態、`.agentdev` 永続化状態、ブランチ削除状態を独立して報告

## ガードレール

- G01: 未マージPRはクローズしない
- G02: Issue番号省略は同一セッション内で作成済みの場合のみ
- G03: Issue番号解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等は禁止。ユーザー入力またはセッション内会話からのみ
- G04: Epic自動クローズは全子IssueがCLOSEDの場合のみ
- G05: ブランチ、worktree削除は必ず実行。失敗時は警告表示して停止
- G06: `git pull --ff-only` は必ず実行。pull前ローカル変更チェック、hash検証必須
- G07: PRのCI通過確認。CI失敗時は case-run に差し戻す
 - G08: 未達チェックボックスが残る場合、構造化エラーで停止。チェックボックス更新後は必ず再読込して反映を確認
- G09: 機能追加で docs/ 更新がない場合、警告表示して停止確認
- G10: テスト戦略チェックボックスを必ず更新
- G11: コメントテンプレートの【必須】セクション確認
- G12: GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲（gh コマンド直接記述禁止、REQ）
- G13: 学びの検知はエージェント自律。ユーザーに問わない
- G14: gh CLI出力読み取りは `agentdev-gh-cli` の安全な手順に従う
- G15: intake と learning を混合した単一成果物にしない（`agentdev-workflow-orchestration` の capture 境界に準拠）
- G16: 今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない
- G17: Step 11 の commit は並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）で実行する。`git add` は capture 成果物の専用サブディレクトリ（`.agentdev/learning/`、`.agentdev/intake/`）または明示パスに限定し、`.agentdev/` 全体の一括スコープにしないこと。他パスを巻き込まない
- G18: learning と intake を同一 commit に含める
- G19: Step 12 は結果状態を分離して報告。`.agentdev` push失敗時は完了扱いにしない
- G20: 完了条件チェックボックスの評価、更新は case-close の専任責務。case-run/ driver/ 外部実行バックエンドは更新しない。case-close は別コンテキストで Issue 本文を再読込して最終完了判定し、更新後に再読込 VERIFY を必ず実施する
- G21: case-close の capture 責務は「回収・保存」（recover and save）。PR 本文から intake/ learning を分離回収しドメイン状態に保存する。境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照
- G22: SPEC status 昇格（draft → accepted）は case-close の責務。昇格は対象 SPEC が `draft` かつ今回の実装が SPEC 内容を検証済みの場合のみ実施する。spec-save は accepted を付与しない
- G23: SPEC確定候補の処理（Step 3-2）は PR 本文の `## SPEC確定候補` セクションを入力とし、`## Findings / Capture候補` とは区別して扱う
- G24: Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが実施する（単一書き手制約）。case-run は Epic Issue 本文を読み取るのみで書き込まない。case-auto は Wave 反復制御のみ行い Epic Issue 本文に直接書き込まない。last-write-wins 競合防止は case-close の単一書き手で維持される
- G25: Epic Wave クローズ（Step E1〜E6）は Epic Issue番号入力時（ステータス追跡テーブル存在時）のみ実行。単一 Issue番号入力時は従来フロー（単一 Issue クローズ Step 1-1〜）を維持する（後方互換）
- G26: Epic Wave クローズ時の PR マージ、子Issue クローズは現在 Wave の `running` 子Issue のみを対象とする。`pending`/ `ready`/ `blocked`/ `failed` は対象外。`blocked`/ `failed` を `completed` に上書きしない（べき等性、`agentdev-epic-tracker` 準拠）
- G27: squash merge 実行前に PR の mergeable 状態を事前確認し、UNKNOWN の場合は最大60秒（10秒間隔）ポーリング待機すること（REQ）。上限超過時はマージを中止し構造化エラーで停止する。ポーリングを省略して UNKNOWN 状態のままマージを試行してはならない
- G28: `git pull --ff-only` 実行前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出し、検出時に安全な代替同期手順を選択すること（REQ）。暗黙の手順順序依存で pull を継続してはならない



