# STEP-5/6: Post-merge・Issue クローズ・クリーンアップ・Capture 回収・永続化（cleanup-and-capture）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-5, STEP-6 詳細である。Post-merge テスト戦略検証、Issue クローズ、worktree/branch 削除、親Epic 自動クローズ判定、実行前同期、Capture 回収、学び検知、ドメイン状態永続化、完了報告を提供する。

## STEP-5: Post-merge テスト戦略検証・Issue クローズ

### 開始条件

- 単一 Issue クローズ ルート
- STEP-4 で PR マージ完了

### Step 5: Post-merge テスト戦略検証

マージ後のみ確認可能な項目（CI通過等）を反映。Issue 本文更新手続き（`agentdev-gh-cli`）で更新 → VERIFY。

### Step 6: Issue クローズ

Issue close 手続き（理由: completed、`agentdev-gh-cli`）。

### 結果

- CI 通過確認、Issue 本文更新
- Issue close 完了

## STEP-6: クリーンアップ・Capture 回収・永続化

### 開始条件

- 単一 Issue クローズ ルート
- STEP-5 で Issue クローズ完了

### Step 7: ブランチ、worktree 削除

`agentdev-git-worktree` の worktree 削除手順に従う。

- **未コミット変更検出**: `agentdev-git-worktree` skill に従い
- **squash merge 済みの場合**: 当該 worktree が隔離されている（専用 worktree + branch で index が独立）場合のみ `git checkout .` で破棄可
- **共有作業ツリー（main worktree）では `git checkout .` は禁止**（他セッション変更の無差別破壊）
- 本 Step は worktree 削除フェーズ内の隔離 worktree でのみ実行する
- **runtime workspace のクリーンアップは harness の責務**、case-close は関与しない
- worktree remove → Permission denied 時は停止（リトライは skill 定義に従う）
- ローカルブランチ削除（squash merge 後の条件付き `-D` は skill 定義に従う）
- リモートブランチ削除
- 削除失敗時は警告表示して停止すること

### Step 8: 親Epic Issue 更新

`agentdev-epic-tracker` スキル参照。

- **Issue 本文から Parent Issue 番号を特定**: `Parent: #{N}` パターン
- **Parent なし** → スキップ
- **ステータストラッキング表を更新** → `agentdev-gh-cli` VERIFY
- **子Issue 状態事前取得**: Issue 補助データ読込手続き（`agentdev-gh-cli`）で全子Issue の OPEN/CLOSED 状態を一覧取得しログ出力
- **Epic 自動クローズ判定**: 全子Issue CLOSED → 自動クローズ。1件以上 OPEN → スキップ

### Step 9: 実行前同期

#### Step 9-1: 重複ファイルチェック再実行

`git pull --ff-only` 直前に、`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャを再実行する（L-013、PR #1128 由来、共有 main worktree で STEP-1-1 実行時点から STEP-9 実行までの間に並列セッションが加えた未コミット変更を検知するため）。重複ファイルを検出した場合、構造化エラーで停止しユーザーによる対応（stash/commit/checkout）を促すこと。

#### Step 9-2: git main 同期リスク事前検出・代替同期手順選択（REQ）

`agentdev-git-worktree` の「git main 同期リスク事前検出プロシージャ（REQ）」に従い、worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスク事前検出と代替同期手順選択を実行する。`agentdev-git-worktree` に従い `git pull --ff-only` を実行（ローカル変更事前チェック、hash 検証、不一致時は評価・承認のやり直し）。

### Step 10: 学びの検知・抽出・Capture 回収

#### 学び検知

`agentdev-learning-capture` スキル（manual reference）に従い、エージェントが自ら学びの有無を判断（**ユーザーに学びの有無を問うことは禁止**）。

- 学びあり → `.agentdev/learning/inbox.md` に直接追記 → 通知
- 採用済み成果物取り込み判定 → `agentdev-learning-pipeline`（manual reference）の deferred ルール

#### Capture 回収責務

PR 本文の `## Findings / Capture候補` セクションから intake/ learning を分離回収する。

- **intake 候補**: `.agentdev/intake/inbox/`
- **learning 候補**: `.agentdev/learning/inbox.md`
- **Epic 横断回収**: Epic 単位で一括回収
- **Capture 境界**: intake/ learning 境界は `agentdev-workflow-orchestration`（capture-boundaries）を参照。intake と learning を別々の成果物として扱う
- **一時会話コンテキスト不入力**: case-run の一時会話コンテキスト（ローカル変数、中間ファイル等）を capture の入力として使用しない。capture 情報の入力源は PR 本文のみ

### Step 11: ドメイン状態永続化

`agentdev-git-worktree` に従い `.agentdev/` 配下を commit/push。learning と intake を同一 commit に含める。

> **auto-close 回避の留意点**: 本コマンド名 `case-close` は "close" を含む複合語。コミットメッセージに `(case-close #N)` 等のコマンド名と Issue 番号の近接表記を用いると、GitHub が "close" を auto-close キーワードと誤認し Issue を意図せずクローズするリスクがある。コミットメッセージのフォーマットは `agentdev-conventional-commits` skill の「GitHub auto-close 回避ガイドライン」に従い、コマンド名と Issue 番号を分離し `#` 記号による近接参照を避けること（例: `case-close for Issue N`）

### Step 12: 完了報告

完了報告 template に従って出力。結果状態に応じた種別を選択。

| 結果状態 | template 種別 |
|---|---|
| 全系統成功 | `.opencode/commands/agentdev/templates/case-close/standard.md` |
| `.agentdev` push 失敗 | `agentdev-push-failed.md` |
| ブランチ・worktree 削除失敗 | `worktree-cleanup-failed.md` |

GitHub 完了後に `.agentdev` push 失敗の場合は standard 種別を使用してはならない。**結果状態の分離報告**: GitHub 側完了状態、`.agentdev` 永続化状態、ブランチ削除状態を独立して報告。

### 結果

- worktree/branch 削除完了
- 親Epic 自動クローズ判定・更新完了
- 実行前同期完了（`git pull --ff-only`）
- Capture 回収完了（intake/learning 分離）
- 学び検知完了
- `.agentdev/` 永続化完了
- 完了報告出力

## resume point

- CI 通過状態、Issue close 状態
- worktree/branch 削除状態
- 親Epic 自動クローズ判定結果、子Issue 状態一覧
- 実行前同期状態（重複ファイルチェック、リスク検出）
- Capture 回収状態（intake/learning 分離）
- 学び検知状態、`.agentdev/` commit/push 状態

## 関連 STEP

- 前: STEP-4（pr-merge-and-conflict）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-gh-cli`: Issue 本文更新、Issue close、対応記録コメント VERIFY、子Issue 状態取得
- `agentdev-git-worktree`: worktree/branch 削除、重複ファイルチェック、git main 同期リスク検出、`git pull --ff-only`、並列実行安全ステージング
- `agentdev-epic-tracker`: 親Epic Issue 本文ステータステーブル更新、Epic 自動クローズ判定
- `agentdev-learning-capture`: 学び検知・抽出（エージェント自律）
- `agentdev-learning-pipeline`: deferred ルール、採用済み成果物取り込み判定
- `agentdev-intake-pipeline`: intake inbox への Capture 回収
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離）
- `agentdev-workflow-templates`: 完了報告 template
- `agentdev-conventional-commits`: GitHub auto-close 回避ガイドライン
- `agentdev-project-extensions`: project extension 読込

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G05（ブランチ、worktree 削除は必ず実行、失敗時は警告表示して停止）
- G06（`git pull --ff-only` は必ず実行、pull 前 ローカル変更チェック、hash 検証必須）
- G10（テスト戦略チェックボックスを必ず更新）
- G11（コメントテンプレートの【必須】セクション確認）
- G13（学びの検知はエージェント自律、ユーザーに問わない）
- G15/G16/G18（intake と learning を混合した単一成果物にしない、learning と intake を同一 commit に含める、今回の完了条件に含まれる未対応事項を intake に逃がして完了扱いにしない）
- G17（Step 11 の commit は並列実行安全ステージングプロシージャに従い、明示パスでステージ、`git add` は `.agentdev/` 全体の一括スコープにしない）
- G19（Step 12 は結果状態を分離して報告、`.agentdev` push 失敗時は完了扱いにしない）
- G21/G22/G23（case-close の capture 責務は「回収・保存」、SPEC status 昇格は case-close の責務、SPEC 確定候補の処理は `## SPEC確定候補` を入力とし `## Findings / Capture候補` とは区別）
- G27/G28（`git pull --ff-only` 実行前に worktree 状態・ref lock 競合・非 main ブランチ占有の3リスクを事前検出し代替同期手順を選択）
