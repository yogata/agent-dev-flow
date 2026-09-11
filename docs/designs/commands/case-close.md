---
title: case-close Design
status: accepted
created: 2026-06-21
updated: 2026-09-11
---

<!-- ADF-COVERS(implementation): REQ-021-018, REQ-021-019, REQ-021-022, REQ-021-025 -->
<!-- ADF-COVERS(implementation): REQ-032-001, REQ-032-002, REQ-032-003, REQ-032-004, REQ-032-005, REQ-032-006, REQ-032-007, REQ-032-008, REQ-032-009, REQ-032-010, REQ-032-011, REQ-032-012, REQ-032-013, REQ-032-014, REQ-032-015, REQ-032-016, REQ-032-017, REQ-032-018, REQ-032-019, REQ-032-020, REQ-032-021, REQ-032-022 -->
<!-- ADF-COVERS(implementation): REQ-035-001, REQ-035-003, REQ-035-009, REQ-035-010 -->
<!-- ADF-COVERS(implementation): REQ-057-004 -->
<!-- ADF-COVERS(implementation): REQ-003-015, REQ-003-016, REQ-003-019, REQ-003-026, REQ-006-105, REQ-032-001, REQ-032-002, REQ-032-003, REQ-032-004, REQ-032-005, REQ-032-007, REQ-032-008, REQ-032-010, REQ-032-012, REQ-032-013, REQ-032-014, REQ-032-015, REQ-032-016, REQ-032-017, REQ-032-018, REQ-032-019, REQ-032-020, REQ-032-021 -->
<!-- ADF-COVERS(implementation): REQ-032-024, REQ-032-025, REQ-032-026 -->

# case-close Design

## 目的

PR をマージし、Case に記録を追記し、クローズ後に worktree とブランチを削除する。
レビュー完了フェーズ。
Epic Issue番号入力時は現在 Wave の PR作成済み子Issue を一括マージ、クローズし、Epic status table を更新する（Epic Wave クローズ）。

**完了条件チェックボックスの評価、更新は case-close の専任責務**（REQ-011）。
case-run / 実行担当サブエージェント / 外部実行バックエンドは完了条件チェックボックスを更新しない。

**Epic Issue 本文ステータス追跡テーブルの更新は case-close のみが実施する**（v2:ADR-0125 単一書き手制約）。

**責務境界（REQ-003-007）**: 完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）。
コンフリクト解消の実装変更、オーケストレーション級判断（マージ順序変更、blocked 単位の隔離）は case-auto の責務（`docs/designs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）。

## 承認・HITL 境界

- QG-4 合格後の squash merge、Issue close、Capture 回収は自動実行する（case-close 自身の承認点を持たない）。
- QG-4 不合格、mergeable CONFLICTING の解消不能時はマージせず停止し、ユーザー判断を求める（実装変更による解消は case-auto レベルの判断）。

## 入力

- Issue番号（単一 Issue または Epic Issue）
- PR番号（または自動検出、Epic Wave クローズ時は各子Issue の PR を Epic Issue 本文から特定）

## 出力

- 単一 Issue クローズ時: マージ済みPR、クローズ済みCase、削除済みブランチ、worktree
- Epic Wave クローズ時: 現在 Wave の全子Issue マージ、クローズ、Epic status table 更新、最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 副作用

- GitHub API: squash merge（Custom Tool `agentdev_gh` の pr_merge、リトライ最大5回、フォールバック手順あり）、Issue クローズ（Custom Tool `agentdev_gh` の issue_close、reason: completed）、Issue 本文更新（Custom Tool `agentdev_gh` の issue_update、VERIFY 付き）、mergeable 状態取得（Custom Tool `agentdev_gh` の pr_mergeable、squash merge 前の mergeable UNKNOWN ポーリング、REQ-006-028、最大60秒・10秒間隔）
- git 操作: `git pull --ff-only`、`git fetch origin main:main`（非 main ブランチ占有時の代替同期、REQ-006-029）、`git add` / `git commit` / `git push`（`.agentdev/` 配下、明示パスステージング、v2:REQ-0137-002/005）
- worktree / ブランチ削除: `agentdev-git-worktree` 手順に従う
- capture 回収: PR 本文から intake / learning を分離回収し `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` へ保存
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
  - Epic Issue 判定（ステータス追跡テーブル存在確認）。存在時は Epic Wave クローズへ分岐

### Epic Wave クローズ（REQ-006-021/022/023/027）

- Epic Issue 本文読込（ステータス追跡テーブル（新4列/旧4列形式）を解析）
- 現在 Wave 特定（`running` ステータスの子Issue が属する Wave）。`running` がない場合は Wave 番号昇順で最も若い未完了 Wave
- PR作成済み子Issue 特定（現在 Wave 内の `running` 子Issue）
- 各子Issue のクローズ処理を準並列化する（REQ-006-027）
  - 並列実行: PR情報取得、PR変更ファイル取得、Issue本文読取、PR本文読取、完了条件チェック事前評価、capture候補抽出、Design確定候補確認、worktree/branch削除前チェック
  - 直列集約: squash merge、main pull&hash確認、Epic本文ステータス追跡テーブル更新、.agentdev永続化commit&push、branch/worktree最終削除
  - rebase による機械的コンフリクト解消は停止条件外（REQ-003-006 Level1）。解消不能時は case-auto へエスカレーション（REQ-006-025、REQ-003-002 Level2/3）
- Epic status table 更新（単一書き手: case-close、v2:ADR-0125）（`running` → `completed ([PR#N](URL))` に更新）

### Epic Issue 完了条件チェックボックス最終評価・更新

Epic status table 更新の後、最終 Wave 判定の前に実施する。
Epic Issue 本文の `## 完了条件` セクションを読み込み、全完了条件を QG-4 に従い評価・更新する（REQ-011 完了条件チェックボックス評価の case-close 専任責務、Epic Wave 経路への明示適用、`POL-completion-checkbox-single-writer`）。

#### 評価対象スコープ（QG-4 観点8）

- **中間 Wave**: 当該 Wave でマージされた PR の対象範囲に属する完了条件のみ `[ ]` → `[x]` とする（PR 対象範囲）。他 Wave の完了条件は `[ ]` のまま残す。
- **最終 Wave**: Epic Issue の全完了条件を評価する（全体評価スコープ）。実装完了している完了条件を `[ ]` → `[x]` に更新する。

#### 再読込 VERIFY

更新後に Epic Issue 本文を再読込し、対象完了条件の `- [ ]` が0件であることを確認する（最大2回）。

- 1回目の再読込で `- [ ]` が0件なら最終 Wave 判定へ進む。
- 1回目で `- [ ]` が残る場合は更新を再試行し、再度再読込（2回目）。
- 2回目でも `- [ ]` が残る場合は構造化エラーで停止する（後述「未達項目残存時の停止」）。

#### 未達項目残存時の停止

最終 Wave で実装完了していない完了条件（`- [ ]`）が残る場合、case-close は構造化エラーで停止する（未達項目残存時停止の Epic Wave 経路への明示適用）。
中間 Wave で他 Wave の完了条件が `[ ]` のまま残ることは停止条件ではない（対象外 Wave の完了条件は評価対象外のため）。

停止時の出力には以下を含める:
- 残存する未達完了条件の一覧
- 対応する子Issue のステータス（completed / blocked / failed）
- 再開コマンド候補

- 最終 Wave 判定（全子Issue completed なら Epic クローズ）。それ以外は残 Wave 通知

### 単一 Issue クローズ（従来フロー、後方互換）

- 重複ファイルチェック（`git status --short` と PR 変更ファイル一覧取得（Custom Tool `agentdev_gh` の pr_changed_files）で重複検出）
- 前提確認（達成判定、完了ゲート（QG-4）に従い完了条件チェックボックスを最終評価、更新）。`[x]` 反映事後確認（再読込 VERIFY、最大2回）。未達項目残存時は構造化エラー停止
- docs/ 検証（機能追加固有検証（REQ作成、インデックス、spec更新、Decision）、関連ドキュメント整合性確認、README 索引整合性）
  - close 時 Design / commands / skills 更新漏れの局所確認
  - Design 確定フロー（v2:ADR-0123 Decision #4, REQ-001-015）（対象 REQ に基づく draft Design 棚卸し列挙と、PR 本文 `## Design確定候補` セクションの申告候補（補助入力）の統合による全件評価、確定判断（(a) 昇格 / (b) design-save 再起動提案 / (c) 見送り）。申告の有無に関わらず棚卸し列挙を実行する）
  - AUTOGEN block 索引再生成差分検出（project extension checks 経由）。docs/ 検証の後、generate_indexes.ts --dry-run を実行し AUTOGEN block の再生成差分を検出する。本検証は case-close の手順を直接編集せず、Workflow Skill extension（.agentdev/extensions/skills/agentdev-workflow-case-close.yaml）の checks セクション経由で導入する（project-extensions Design 準拠）。case-close は dry-run/差分検査で停止し、直接編集・commit しない。差分がある場合は case-run へ差戻し、再生成（実 commit）は case-run が行う。複数 PR 跨ぎでの AUTOGEN block 再生成漏れを防止する。Epic Wave クローズ経路では Epic Issue 完了条件チェックボックス最終評価の前段に同等の dry-run/diff による索引健全性検証を適用する（Epic Issue クローズ時の索引検証は case_open_hints 参照）
- PRマージ（squash merge（Custom Tool `agentdev_gh` の pr_merge、リトライ最大5回、フォールバック手順）、対応記録コメント追記）
  - squash merge 前の mergeable UNKNOWN ポーリング（REQ-006-028）（Custom Tool `agentdev_gh` の pr_mergeable で mergeable 状態を取得し、UNKNOWN の場合は最大60秒・10秒間隔でポーリング待機。上限超過時はマージ中止・構造化エラー停止。CONFLICTING 遷移時はコンフリクト解消 rebase パスへ分岐）
  - Squash merge 後のローカル先行 commit 検出、処理（REQ-003-005）（`git log origin/{branch}..HEAD --oneline` で検出、内容重複確認後に `git reset --hard origin/{branch}` で reset（`agentdev-git-worktree` の squash merge 後分岐ハンドリング手順参照））
  - コンフリクト解消 rebase パス（REQ-003-001/002、REQ-006-024/025）（squash merge 失敗時）。squash merge がコンフリクトで失敗した場合、`git rebase` による機械的解消を試みる。rebase が自動解決した場合は再マージ（PR マージへ戻る）。rebase 自体がコンフリクトを発生した場合は実装変更を行わず case-auto へエスカレーションし停止する（コンフリクト解消モデル Level 1、`docs/designs/commands/case-auto.md` コンフリクト解消モデル Level 2/3 参照）
- Post-merge テスト戦略検証（CI通過等の反映）
- Issueクローズ（Custom Tool `agentdev_gh` の issue_close、reason: completed）
- ブランチ、worktree削除（`agentdev-git-worktree` 手順）。未コミット変更検出、共有作業ツリーでの `git checkout .` 禁止（v2:REQ-0137-001）
- 親Epic Issue更新（`agentdev-epic-tracker`、Epic 自動クローズ判定）
- 実行前同期（`git pull --ff-only`、hash 検証）
  - git main 同期リスク事前検出、代替同期手順選択（REQ-006-029）（`git pull --ff-only` 直前に worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出。検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main` による非チェックアウト同期）を選択。`agentdev-git-worktree` の git main 同期リスク事前検出プロシージャ参照）
- 学びの検知、抽出（`agentdev-learning-capture`、ユーザーに学び有無を問わない（エージェント自律）、Capture 回収（PR 本文から intake/learning を分離））
- ドメイン状態永続化（`.agentdev/` 配下を commit/push（learning と intake を同一 commit））
- 完了報告（結果状態の分離報告（GitHub側、`.agentdev`、ブランチ削除））

### full integrity suite 実行と tmp 残存確認

- full integrity suite 実行（QG-4 合格基準）: bun test 実行形態は 3 cwd 分割正規形に従う（① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テストの3分割。各実行の cwd はリポジトリルートに統一、`./` prefix 付きの対象ディレクトリ明示指定、分割② 前の依存パッケージ前置、N/M 件数突合、固定値の期待値化なし、カレントディレクトリトリビアな実行の禁止）。実行形態契約の正は agentdev-quality-gates Design「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」と同スキル references/qg-4-final-acceptance.md が所有する
- 配布物変更を含む case の3検査結果確認: case-close の最終 gate で配布物変更を含む case を検証する場合、配布依存境界・IR-055・traceability の3検査の実行結果（case-run での commit 前実行記録）を確認する。case-run で3検査が実行されていない配布物変更を検出した場合は、検査を実行して新規違反 0 件を確認してからマージに進む。base 既知違反と新規違反の分離突合を省略せず、baseline 既知違反の無断削除・隠蔽を受け入れない
- tmp 残存確認: 単一 Issue ルートの正常終了を前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことをクリーンアップ工程で確認する。Epic Wave ルートでは、当該 Wave スコープの一時成果物（draft、RU、検出事項等の未消化ドメイン状態）の残留と `.agentdev/tmp/` 一時ファイルの残存がないことを確認し、残留時は当該 Wave を完了扱いにしない

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/case-close.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（単一 Issue クローズと Epic Wave クローズの STEP 構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-case-close`）が所有し、本 Design はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## トレーサビリティ能力の利用（QG-4 独立再検査）

case-close は QG-4 の一部として、対象要件の実装対応と検証対応の完全性を `agentdev-traceability` の check で正規成果物から独立して再検査する（REQ-021-018）。
case-run 側の事前検査とは独立に実施する。検証手段との対応関係と「今回その検証を実行して合格したか」という実行結果（Issue, PR, QG の記録）を分離して扱う（REQ-021-019）。

- 対象要件に実装対応または検証対応の欠落が残る場合はマージせず停止する
- 不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻せる
- QG-4 の対応完全性検査は有効である。全現行要件の実装対応と検証対応必須行の検証対応が成立し、check の未解決不合格が0件であることを移行完了条件とする（DEC-017 決定4）。検証対応の完全性判定は検証対応必須行のみを計上する（検証対応任意行はトレーサビリティモデルの検証対応要否カタログが宣言する）
- agentdev-traceability の不在、実行失敗、空結果、候補過多だけを理由に case-close を失敗させない（fail-open）。正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する
- 正規成果物側の実不整合が確認された場合は、既存の品質ゲート, 受け入れ条件に従って fail とする

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（Pattern Taxonomy（file-pipeline））
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 回収（intake/learning 分離））
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（Epic Wave クローズモデル）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（REQ ファイル整合性検査）
- [quality-gates.md](../quality/quality-gates.md)（QG-4）
- [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md)（IR-057 obsolete-spec-path-after-domain-split、targeted docs guard 連携）

## targeted docs guard (v2:REQ-0158-003)

case-close 工程で targeted docs guard を実行する。
対象は PR で変更されたファイルと連動ファイル（`docs/README.md`、`docs/designs/README.md`）。

changed-path routing と配布依存境界の検出経路は共有境界 adapter へ接続する（DEC-014）。
最終 gate 基底は REQ-010-012 を再利用し、検査エラー（検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗）は gate-not-passed として扱い、clean として通過させない（DEC-014 決定5、`integrity/distribution-boundary.md`「検査エラーの意味」）。

- 実行タイミング: docs/ 検証の一部。変更ファイル対象の targeted docs guard を実行し、draft→accepted 等の Design status 変更時の `docs/designs/README.md` 同期、Issue/PR で宣言した文書更新対象と実変更ファイルの対応、旧Design直下パス混入検出（IR-057）、local版旧生成方式語彙混入検出、full docs-check 実行要否判定を行う
- 実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --files <PR 変更ファイル一覧> --json`。PR 変更ファイル一覧は Custom Tool `agentdev_gh`（pr_changed_files）で取得する（case-close はマージ後 main 環境で実行されるため `--files` を使用。`--base-ref` は worktree 環境（マージ前、case-run 等）向け）
- `full_docs_check_recommended` が true の場合: case-close 完了判定の追加確認として扱う。integrity rule 追加・削除・大幅変更、docs/designs の大規模移動・改名、repo-agentdev-integrity の検査スコープ変更、文書分類・責務境界の基準変更を検出した場合は `/repo/docs-check`（全体監査）の実行を推奨する
- 失敗時: 検査対象文書（PR 変更ファイル、`docs/designs/README.md`、`docs/README.md`）を修正して再実行する

JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。
`failure` は `rule_id`、`severity`、`file`、`line`、`message`、`expected` を持つ。

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
- 共有作業ツリーでの `git checkout .`（v2:REQ-0137-001、他セッション変更の無差別破壊）
- 完了条件チェックボックス評価の他コマンド委譲（case-close 専任責務、`POL-completion-checkbox-single-writer`）
- Design status 昇格の他コマンド委譲（case-close 責務、design-save は accepted を付与しない）
- Epic Issue 本文ステータス追跡テーブルの他コマンド書き込み（case-close 単一書き手、`POL-epic-tracking-single-writer`）

## 検証観点

- QG-4（Final Acceptance Gate）: 前提確認で Issue 本文の完了条件チェックボックスを最終評価、更新
- チェックボックス事後確認: 更新後に Issue 本文を再読込し全 `- [ ]` が `[x]` に反映されたことを確認（最大2回）
- Squash merge リトライ: 最大5回（5秒待機付き）
- mergeable UNKNOWN ポーリング（REQ-006-028）: squash merge 前に `gh pr view --json mergeable,mergeStateStatus` で事前確認、UNKNOWN 時は最大60秒（10秒間隔）でポーリング、上限超過時はマージ中止・構造化エラー停止
- git main 同期リスク事前検出（REQ-006-029）: `git pull --ff-only` 直前に worktree 状態・並列実行 ref lock 競合・非 main ブランチ占有の3リスクを事前検出、検出時に安全な代替同期手順（直列化待機、`git fetch origin main:main`）を選択
- 出力制約: 成果物本文（PR本文、commit message）は verbatim で返す（別途成果物パス、根拠、親判断事項は圧縮）
- 結果状態分離報告: GitHub側、`.agentdev` 永続化、ブランチ削除状態を独立して報告

## 停止状態

- QG-4 前提確認で完了条件チェックボックスの未完了（`- [ ]` 残存）を検出した場合（評価エラーで停止する。部分的なチェック済み化は行わない）。
- mergeable UNKNOWN ポーリング上限超過時（マージ中止、構造化エラー停止）。
- squash merge のコンフリクトが rebase で解消不能な場合（実装変更を伴う解消は行わず、case-auto レベル判断へエスカレーションして停止）。
- 最終 Wave で完了条件が残る場合（Epic クローズせずエラー停止、残 Wave 通知へ整理）。
- worktree、ブランチ削除のリトライ上限超過時（`prune` と復元を実施し、削除失敗を報告して停止）。

## Design 状態評価の棚卸し制（STEP-3 拡張）

本節の追加に伴い、既存の申告制記述（docs-and-design-promotion.md STEP-3-2 の
「セクション不存在・空の場合はスキップ」、case-close Design の Design 確定フロー欄の
PR 本文読取記述、design-lifecycle-application.md の旧昇格条件文言「実装が Design 内容を
検証済み」）は本契約へ書き換える（adversarial-review F3）。

### 棚卸し列挙手順

1. 当該 Case の対象 REQ を特定する（Issue 本文の REQ 参照から導出。行レベルの導出は
   現行の正規記録先に存在しないため、REQ ファイル単位の近似列挙を許容する。
   行レベルの正規記録先が確定した場合は行レベル判定へ昇格する）（adversarial-review F2）
2. docs/designs/** の正規成果物から、当該 REQ を ADF-COVERS 宣言（implementation 役割）で
   カバーし frontmatter status が draft の Design を逆算列挙する（projection 配下は対象外）
3. PR 本文「Design 確定候補」セクションの申告候補を列挙結果へ統合する（重複は 1 件にまとめ、
   二重処理しない）。申告は補助入力であり、申告の不在を理由に棚卸しを省略しない
4. 列挙結果が 0 件の場合は 0 件確認を記録して Design 状態評価を正常完了する

列挙の限界: 列挙は ADF-COVERS 宣言に基づく近似であり、宣言を持たない draft Design は
漏れ得る（宣言付与は REQ-057-023 の段階的付与契約に従い、棚卸しが宣言を要求しない）。
漏れの補完経路は PR 申告の補助入力、inspect-docs の Design DRIFT 診断、宣言付与慣行の
継続である。本棚卸しに完全性保証を持たせない（adversarial-review F1）。

### 評価と記録

- 各候補について、当該 Case の実装・検証結果と Design の現在構造との整合を確認し、
  昇格（draft → accepted、designs/README.md status 列の同時更新）または見送りを確定する。
  整合確認の証拠は STEP-3-1（docs 検証・局所確認）の「Design 本文と実装の最終矛盾確認」
  結果に基づき、根拠を対応記録コメントへ残す（adversarial-review F3）
- 見送り時は見送り理由と再評価契機を対応記録コメントの検証差分へ記録し、Design ファイル本体へ
  最小限の経緯記録を追記する。新規の一時成果物種別・新規ドメイン状態は作らない。
  Design 本体への追記はライフサイクル経緯の最小記録であり、REQ-057-015 が禁止する
  設計内容としての未確定事項・将来計画・判断宣告ではない（整合条項、adversarial-review F6）
- 見送り（評価実施・確定不可）と未評価（評価未実施）を区別して記録する

### 完了ゲートと適用範囲

- 全候補が昇格または見送りのいずれかの評価結果を持つことを case-close 完了条件へ含める。
  評価結果のない候補が残る場合、単一 Issue ルート（STEP-3）と Epic Wave ルート（E4）の
  両方で完了扱いにしない
- Epic Wave ルートでは、各子 Issue の棚卸し列挙を Wave 内で集約し、同一 draft Design の
  評価は直列集約段で一元実行する（子 Issue 並列評価による二重評価・競合評価
  〔片昇格と片見送りの混在〕・見送り記録の二重生成を防止する）
  （adversarial-review F4）
- 再実行時は accepted 済み Design を評価対象から除外し、同一 Case 再実行では既存の
  見送り記録を評価結果として認定して重複する記録を生成しない（adversarial-review F5）

## See Also

- [case-run.md](case-run.md)（前段コマンド）
- [case-auto.md](case-auto.md)（自走モード）
- `agentdev-workflow-case-close` skill（workflow 実装本体（単一 Issue クローズ、Epic Wave クローズ））
- `agentdev-quality-gates` skill（QG-4）
- `agentdev-git-worktree` skill（worktree、ブランチ削除）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- `agentdev-learning-capture` skill（学びの検知）
- `agentdev-learning-pipeline` skill（deferred.md ルール）
- `agentdev-workflow-orchestration` skill（Capture 境界、達成判定プロトコル）
- Custom Tool `agentdev_gh`（GitHub I/O 操作契約。[custom-tool-contracts.md](../responsibilities/custom-tool-contracts.md)）
- `agentdev-issue-management` skill（Issue 操作安全性）
- REQ-006（case-close / 完了処理）
- v2:REQ-0137（並列実行安全 git 操作規律）
- REQ-003（コンフリクト解消モデルと実行時間観測）
- REQ-011（完了条件チェックボックス case-close 専任）
- v2:ADR-0125（Epic Issue 本文単一書き手）
- v2:ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
