# STEP-5/6: Post-merge・Issue クローズ・クリーンアップ・Capture 回収・永続化（cleanup-and-capture）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-5, STEP-6 詳細である。
> Post-merge テスト戦略検証、実証最終クローズ（最終評価結果の導出と Issue 最終コメント正規記録）、Issue クローズ、worktree/branch 削除、親Epic 自動クローズ判定、実行前同期（統合先ブランチ）、Capture 回収、学び検知、ドメイン状態永続化、正式化経路案内、完了報告を提供する。

## 目次

- STEP-5: Post-merge テスト戦略検証・実証最終クローズ・Issue クローズ
- STEP-6: クリーンアップ・Capture 回収・永続化

## STEP-5: Post-merge テスト戦略検証・実証最終クローズ・Issue クローズ

### Purpose

マージ後のみ確認可能な項目（CI 通過等）を反映して Issue 本文を更新する。
実証Caseで実証全体の最終 case-close に該当する場合は最終評価結果を導出して Issue 最終コメントへ正規記録し、Issue をクローズする。

### Input Resolution

1. SSoT 再構成: PR の CI 状態、Issue 本文（テスト戦略チェックボックス、実証Case状態情報、評価契約）、実証に属する PR 本文群（実行条件・測定結果・観察結果・証拠・評価結果）
2. identifier 保持: Issue番号、PR番号、統合先ブランチ
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 単一 Issue クローズ ルート
- STEP-4 で PR マージ完了

### Procedure

#### STEP-5-1: Post-merge テスト戦略検証

マージ後のみ確認可能な項目（CI通過等）を反映。
`agentdev_gh` の issue_update 操作で更新 → VERIFY。

#### STEP-5-2: 実証最終クローズ（実証Caseの最終 case-close 時のみ）

Issue 本文の実証Case状態情報（対象評価ブランチ等の永続記録）から実証Caseと判定され、かつ当該 Issue が実証全体の最終 case-close に該当する場合に実行する。該当しない場合はスキップする（通常Caseの挙動を変更しない）。

- **新しい評価を開始しない**: 最終 case-close で新しい評価を始めない。事前の評価契約（Issue 本文の正規記録）と蓄積済み証拠（各 PR 本文の実行条件・測定結果・観察結果・証拠・評価結果）から最終結果を導出する
- **最終評価結果の正規記録**: 導出した最終評価結果（採用、不採用、判定不能、未確定の区別を含む）を Issue 最終コメントとして正規記録する（`agentdev_gh` の issue_comment 操作。成功応答は読み戻し検証済み）。評価ブランチ削除後も Issue/PR から結果と証拠を追跡できる構成とする
- **評価契約の書き換え禁止**: 実証全体の最終完了後は当該実証の評価契約および最終結果を書き換えない

#### STEP-5-3: Issue クローズ

`agentdev_gh` の issue_close 操作（理由: completed）。

### Result

- CI 通過確認、Issue 本文更新
- 実証最終クローズ時: 最終評価結果の導出と Issue 最終コメント正規記録完了
- Issue close 完了

### Evidence

- CI 状態確認結果、Issue 本文更新の VERIFY 結果、実証最終クローズ実施時は最終評価結果の導出根拠（評価契約・蓄積済み証拠との対応）と Issue 最終コメントの VERIFY 結果、Issue close 結果

### Completion Verification

- テスト戦略チェックボックスが更新済みであり（command 不変条件）、Issue がクローズ済みであること。実証最終クローズ該当時は新しい評価を開始せず Issue 最終コメントへ最終評価結果が正規記録済みであること

### Resume-Idempotency

- Issue の OPEN/CLOSED 状態（durable state）で再開点を判定する。クローズ済み Issue の再クローズは行わない。最終評価結果の正規記録済み Issue 最終コメント（durable state）の再記録を行わない

## STEP-6: クリーンアップ・Capture 回収・永続化

### Purpose

worktree/branch 削除、親Epic 自動クローズ判定、実行前同期、Capture 回収、学び検知、ドメイン状態永続化、tmp/ 残存確認、完了報告を実施する。

### Input Resolution

1. SSoT 再構成: PR 本文（`## Findings / Capture候補`）、Epic Issue 本文（`Parent: #{N}`、子Issue 状態）、git 状態
2. identifier 保持: Issue番号、親Epic 番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 単一 Issue クローズ ルート
- STEP-5 で Issue クローズ完了

### Procedure

#### STEP-6-1: ブランチ、worktree 削除

`agentdev-git-worktree` の worktree 削除手順に従う。

- **未コミット変更検出**: `agentdev-git-worktree` skill に従い
- **squash merge 済みの場合**: 当該 worktree が隔離されている（専用 worktree + branch で index が独立）場合のみ `git checkout .` で破棄可
- **共有作業ツリー（main worktree）では `git checkout .` は禁止**（他セッション変更の無差別破壊）
- 本 Step は worktree 削除フェーズ内の隔離 worktree でのみ実行する
- **runtime workspace のクリーンアップは harness 側の責務**（charter 原則、harness 分離モデル Design 参照）、case-close は関与しない
- worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）
- ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）
- リモートブランチ削除
- 削除失敗時は警告表示して停止すること

#### STEP-6-2: 親Epic Issue 更新

`agentdev-epic-tracker` スキル参照。

- **Issue 本文から Parent Issue 番号を特定**: `Parent: #{N}` パターン
- **Parent なし** → スキップ
- **ステータストラッキング表を更新** → `agentdev_gh` issue_update（読み戻し検証済み）
- **子Issue 状態事前取得**: `agentdev_gh` の issue_read 操作で全子Issue の OPEN/CLOSED 状態を一覧取得しログ出力
- **Epic 自動クローズ判定**: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

#### STEP-6-3: 実行前同期

##### STEP-6-3-1: 重複ファイルチェック再実行

`git pull --ff-only` 直前に、`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャを再実行する（L-013、PR #1128 由来、共有 main worktree で STEP-1-1 実行時点から STEP-6-3-1 実行までの間に並列セッションが加えた未コミット変更を検知するため）。
重複ファイルを検出した場合、構造化エラーで停止しユーザーによる対応（stash/commit/checkout）を促すこと。

##### STEP-6-3-2: 統合先ブランチ同期リスク事前検出・代替同期手順選択

`git pull --ff-only` 直前に、`agentdev-git-worktree` の「git 統合先同期リスク事前検出プロシージャ」に従い、worktree 状態（dirty tree）・並列実行による ref lock 競合・統合先以外のブランチ占有の3リスク事前検出と代替同期手順選択を実行する。
同期対象のブランチは当該 Case の統合先（通常Caseは既定 main、実証Caseは対象評価ブランチ）である。通常Caseの `main` 同期手続きは従来どおりである。
`agentdev-git-worktree` に従い `git pull --ff-only` を実行（ローカル変更事前チェック、hash 検証、不一致時は評価・承認のやり直し）。

#### STEP-6-4: 学びの検知・抽出・Capture 回収

##### 学び検知

`agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断（**ユーザーに学びの有無を問うことは禁止**）。

- 学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知
- 採用済み成果物取り込み判定 → `agentdev-learning-pipeline`（manual reference）の deferred ルール

##### Capture 回収責務

PR 本文の `## Findings / Capture候補` セクションから intake/ learning を分離回収する。

- **intake 候補**: `.agentdev/intake/inbox/`
- **learning 候補**: `.agentdev/learning/inbox.md`
- **Epic 横断回収**: Epic 単位で一括回収
- **Capture 境界**: intake/ learning 境界は `agentdev-workflow-orchestration`（capture-boundaries）を参照。intake と learning を別々の成果物として扱う
- **一時会話コンテキスト不入力**: case-run の一時会話コンテキスト（ローカル変数、中間ファイル等）を capture の入力として使用しない。capture 情報の入力源は PR 本文のみ
- **実証Caseの capture 回収の扱い**: 実証Caseで評価ブランチ上で回収した intake/learning capture は、main 側パイプラインへ反映する（main 側の `.agentdev/` へ回収して永続化する）、または PR 本文記録を正として main 側から追跡可能な形で処理する。評価ブランチ削除によって capture が失われないことを確認する

#### STEP-6-5: ドメイン状態永続化

`agentdev-git-worktree` に従い `.agentdev/` 配下を commit/push。
learning と intake を同一 commit に含める。

> **auto-close 回避の留意点**: 本コマンド名 `case-close` は "close" を含む複合語。
> コミットメッセージに `(case-close #N)` 等のコマンド名と Issue 番号の近接表記を用いると、GitHub が "close" を auto-close キーワードと誤認し Issue を意図せずクローズするリスクがある。
> コミットメッセージのフォーマットは `agentdev-conventional-commits` skill の「GitHub auto-close 回避ガイドライン」に従い、コマンド名と Issue 番号を分離し `#` 記号による近接参照を避けること（例: `case-close for Issue N`）

#### STEP-6-6: tmp/ 残存確認

当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことを確認する。
残存時は workflow 側 cleanup 規定（当該実行内での削除）に従って処理し、残存ファイルと対応結果を STEP-6-7 の完了報告に明示する。

#### STEP-6-7: 完了報告

完了報告 template に従って出力。
結果状態に応じた種別を選択。

| 結果状態 | template 種別 |
|---|---|
| 全系統成功 | `.opencode/commands/agentdev/templates/case-close/standard.md` |
| `.agentdev` push 失敗 | `agentdev-push-failed.md` |
| ブランチ・worktree 削除失敗 | `worktree-cleanup-failed.md` |

GitHub 完了後に `.agentdev` push 失敗の場合は standard 種別を使用してはならない。
**結果状態の分離報告**: GitHub 側完了状態、`.agentdev` 永続化状態、ブランチ削除状態を独立して報告。

**実証Caseの正式化経路案内（実証全体の最終 case-close 時）**: 実証Caseで実証全体の最終 case-close に該当する場合（Standard 実証では当該 Standard Issue の case-close）、正式化経路として `req-define <実証Issue>`（Standard では当該 Standard Issue を指定）を利用者へ明示する。Epic 実証の正式化案内は Epic Wave クローズの最終 Wave 判定（E6）で行い、Epic 中間Waveでは正式化案内を出さない。case-close は後続 req-define を自動実行しない。

### Result

- worktree/branch 削除完了
- 親Epic 自動クローズ判定・更新完了
- 実行前同期完了（統合先ブランチへの `git pull --ff-only`）
- Capture 回収完了（intake/learning 分離、実証Caseは main 側パイプラインへ反映または PR 本文記録を正として追跡可能）
- 学び検知完了
- `.agentdev/` 永続化完了
- tmp/ 残存確認完了（残存時は対応結果を報告）
- 完了報告出力（実証全体の最終 case-close 時は正式化経路案内を含む）

### Evidence

- worktree・ブランチ削除結果、親Epic 更新の VERIFY 結果、重複ファイルチェックとリスク検出結果、Capture 回収ファイル群、`.agentdev/` commit hash と push 結果、tmp/ 残存確認結果、完了報告出力（実証最終クローズ時は正式化経路案内を含む）

### Completion Verification

- worktree/branch 削除が完了（失敗時は警告表示して停止）していること。Capture 回収が intake/learning 分離済みであること（実証Caseは評価ブランチ削除後も追跡可能であること）。結果状態の分離報告（GitHub 側、`.agentdev` 永続化、ブランチ削除）がなされていること。当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（残存時は対応結果を報告済みであること）

### Resume-Idempotency

- worktree・ブランチの非存在、Capture 回収済みファイル、`.agentdev/` の commit/push 状態（durable state）で再開点を判定する。削除済みリソースの再削除、回収済み capture の再回収を行わない

## resume point

- CI 通過状態、Issue close 状態
- 実証最終クローズ状態（実証Case判定、最終評価結果の導出と Issue 最終コメント正規記録済み否か）
- worktree/branch 削除状態
- 親Epic 自動クローズ判定結果、子Issue 状態一覧
- 実行前同期状態（重複ファイルチェック、統合先ブランチ同期リスク検出）
- Capture 回収状態（intake/learning 分離、実証Caseは main 側反映・追跡可能化の別）
- 学び検知状態、`.agentdev/` commit/push 状態

## 関連 STEP

- 前: STEP-4（pr-merge-and-conflict）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- Custom Tool `agentdev_gh`: Issue 本文更新、Issue close、対応記録コメント、子Issue 状態取得
- `agentdev-git-worktree`: worktree/branch 削除、重複ファイルチェック、git 統合先同期リスク検出、`git pull --ff-only`、並列実行安全ステージング
- `agentdev-epic-tracker`: 親Epic Issue 本文ステータステーブル更新、Epic 自動クローズ判定
- `agentdev-learning-capture`: 学び検知・抽出（エージェント自律）
- `agentdev-learning-pipeline`: deferred ルール、採用済み成果物取り込み判定
- `agentdev-intake-pipeline`: intake inbox への Capture 回収
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離）
- `agentdev-workflow-templates`: 完了報告 template
- `agentdev-conventional-commits`: GitHub auto-close 回避ガイドライン
- `agentdev-project-extensions`: project extension 読込

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（ブランチ、worktree 削除は必ず実行、失敗時は警告表示して停止）
- 不変条件（`git pull --ff-only` は必ず実行、pull 前 ローカル変更チェック、hash 検証必須）
- 不変条件（テスト戦略チェックボックスを必ず更新）
- 不変条件（コメントテンプレートの【必須】セクション確認）
- 不変条件（学びの検知はエージェント自律、ユーザーに問わない）
- 不変条件（intake と learning を混合した単一成果物にしない、learning と intake を同一 commit に含める、今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない）
- 不変条件（実証全体の最終 case-close は新しい評価を始めず評価契約と蓄積済み証拠から最終評価結果を導出し Issue 最終コメントへ正規記録する、実証Caseの最終 case-close の完了報告は正式化経路 req-define <実証Issue> を案内し後続 req-define を自動実行しない）
- ガードレール（STEP-6-5 の commit は並列実行安全ステージングプロシージャに従い、明示パスでステージ、`git add` は `.agentdev/` 全体の一括スコープにしない）
- 不変条件（STEP-6-6 は当該実行で `.agentdev/tmp/` に作成した一時ファイルの残存なしを確認、残存時は cleanup 規定に従い処理して報告）
- 不変条件（STEP-6-7 は結果状態を分離して報告、`.agentdev` push 失敗時は完了扱いにしない）
- ガードレール・不変条件（case-close の capture 責務は「回収・保存」、Design status 昇格は case-close の責務、Design 確定候補の処理は `## Design確定候補` を入力とし `## Findings / Capture候補` とは区別）
- ガードレール（`git pull --ff-only` 実行前に worktree 状態・ref lock 競合・統合先以外のブランチ占有の3リスクを事前検出し代替同期手順を選択、同期対象は当該 Case の統合先ブランチ）
