# STEP-6 / STEP-7 / STEP-8: HITL 確定・処理実行・完了報告と永続化（hitl-and-disposition）

> 本 reference は `agentdev-workflow-inspect-promote` SKILL.md の Control Plane STEP-6〜STEP-8 詳細である。各 STEP は resume point を持つ（DEC-{N}、`<workflows/step-reference-contract>` SPEC）。

## STEP-6: HITL 確定（手動分類対象）

- **Purpose**: 自動 promote 対象外の検出事項について、ユーザーの明示的な承認を得て分類を確定する
- **Input Resolution**: STEP-5 の反映済み暫定分類結果（skip 時は STEP-3 の暫定分類結果）。検出事項本文は inbox ファイル（durable state）から読み取る
- **Preconditions**: STEP-5 完了または skip 条件該当、手動分類対象が1件以上存在
- **Procedure**: 自動 promote 対象外の検出事項はユーザーの明示的な承認なしに採用済み成果物を生成しない。分類結果を提示し、承認を得る
- **Result**: ユーザー承認済み分類結果（promote/defer/reject の確定）
- **Evidence**: 分類提示内容とユーザー承認の応答
- **Completion Verification**: 手動分類対象の全検出事項について承認応答を得たこと
- **Resume-Idempotency**: 承認状態は処理実行（STEP-7）の完了状態から逆算して再構成する。処理実行が済んでいない検出事項は承認未了と扱い、本 STEP から再開する（未承認の推定で処理を実行しない）

## STEP-7: 処理実行（promote / reject / defer）

- **Purpose**: 承認済み分類に従い、検出事項の配置変更（promote 保存、reject 削除、defer 残置）を実行する（finding disposition の出口 resume point）
- **Input Resolution**: STEP-6 の承認済み分類結果、`--auto` 時は STEP-4 の自動 promote 確定状態（auto-promote-log との突合）
- **Preconditions**: STEP-6 完了（手動分類対象）、STEP-4 完了（自動 promote 対象）
- **Procedure**:
  - **promote 処理**: 承認された promote 対象検出事項を `.agentdev/inspect/promoted/` へ保存する。元の inbox file は削除する
  - **reject 処理**: 承認された reject 対象検出事項は即時削除する。reject 時の commit message に却下理由を含める（監査証跡の補強）
  - **defer 処理**: defer となった検出事項は `.agentdev/inspect/inbox/` に残置する。intake/ learning 送付の推奨を報告する
- **Result**: 全検出事項の配置確定（promoted/ 保存済み、削除済み、inbox 残置）
- **Evidence**: 配置後のファイル構成（promoted/、inbox/）、reject を含む commit message
- **Completion Verification**: 全検出事項が promote（promoted/ 保存 + inbox 削除）/ reject（削除）/ defer（残置）/ 自動 promote（投入済み）のいずれかに確定していること
- **Resume-Idempotency**: promoted/ に保存済みの検出事項は promote 確定として再保存しない。inbox から削除済みは reject 確定として復元しない。inbox 残置は未確定または defer のため、auto-promote-log との突合で defer 確定か未処理かを判別する

## STEP-8: 完了報告・永続化

- **Purpose**: 分類結果と後続 route を報告し、`.agentdev/` 配下の変更を永続化する
- **Input Resolution**: STEP-7 の配置確定状態（`git diff --name-only` で `.agentdev/inspect/` および `.agentdev/intake/` 配下の変更を確認）
- **Preconditions**: STEP-7 完了
- **Procedure**:
  1. `git diff --name-only` で `.agentdev/inspect/` および `.agentdev/intake/` 配下の変更を確認する（auto-promote の intake/promoted/ 投入、promoted/ への保存、reject に伴う inbox 削除、auto-promote-log 更新を含む）
  2. **変更なし時**: commit/push せず「変更なし」と報告する
  3. **変更あり時**: `git add` は `.agentdev/inspect/` と `.agentdev/intake/` のみ対象とする。commit message は `chore(agentdev): promote inspect findings`（reject を含む場合は却下理由を含める）。`git push` を実行する。push 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（完了扱いにしない）
  4. 完了報告 template（`.opencode/commands/agentdev/templates/inspect-promote/standard.md`）に従い、promote/ defer/ reject/ auto-promote の判定結果と後続 route を提示する。`--auto` 実行時は投入件数、投入先一覧、ログパスを含める
- **Result**: 完了報告出力、`.agentdev/` 変更の commit/push
- **Evidence**: commit hash、push 実行結果、完了報告
- **Completion Verification**: 変更が commit/push 済みであること（または変更なし報告済み）、完了報告を出力したこと
- **Resume-Idempotency**: commit/push の対象は明示パスに限定され、再実行で未 commit 変更が残っていないかを `git diff --name-only` で再確認できる。push 済み commit の重複実行は発生しない（変更なし時は commit/push を行わない）

## エラー処理

| エラー | 対処 |
|--------|------|
| inbox が空 | 「対象なし」と報告して終了 |
| 検出事項ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| ユーザーが全件 defer | inbox に全件残置し、報告 |
| push 失敗 | git-error-messages 共通 template の該当形式で表示して停止（完了扱いにしない） |

## 関連 STEP

- 前: STEP-5（auto-promote-and-review）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（明示パス stage）
- `agentdev-conventional-commits`: commit message 規約

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G03（reject された検出事項は即時削除される。即時削除以外の取扱を禁止する）
- G04（defer された検出事項は `.agentdev/inspect/inbox/` に残す）
- G05（docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める）
