# STEP-6 / STEP-7 / STEP-8: 確定（自律確定判定と HITL 確定）・処理実行・完了報告と永続化（hitl-and-disposition）

> 本 reference は `agentdev-workflow-inspect-promote` SKILL.md の Control Plane STEP-6〜STEP-8 詳細である。
> 各 STEP は resume point を持つ（`<workflows/step-reference-contract>` Design）。

## STEP-6: 確定（自律確定判定と HITL 確定）

- **Purpose**: 分類・検証と必要な adversarial-review を経た検出事項について、自律確定判定と HITL 確定により分類を確定する
- **Input Resolution**: STEP-5 の反映済み暫定分類結果（skip 時は STEP-3 の暫定分類結果）。検出事項本文は inbox ファイル（durable state）から読み取る。自律確定可否の判定基準は横断契約Design（workflow-contracts Design「promote系判断確定とHITL境界」節、extension 経由で解決）の詳細判定表を正とし、本 reference は判定表を複製しない
- **Preconditions**: STEP-5 完了または skip 条件該当、確定対象の検出事項が1件以上存在
- **Procedure**:
  1. **自律確定判定**: 詳細判定表（自律確定可能要件、HITL移送条件）に従い、取得可能な根拠から promote / defer / reject を一意に確定できる検出事項をユーザー承認なしで確定する（REQ-{NNNN}-{NNN}）。モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない
  2. **部分自律確定**: 自律確定可能項目とユーザー判断必要項目が混在する場合、未決項目に依存しない項目を先行確定し、ユーザー判断必要項目のみ HITL 対象とする（REQ-{NNNN}-{NNN}）。単純な意見差・形式的最終確認のみを理由とするHITL移送を行わない
  3. **HITL 確定**: HITL移送条件に該当する検出事項のみ分類結果を提示して承認を得る。自律確定済み検出事項は確定内容の報告にとどめ、HITL 提示に含めない。全検出事項が自律確定可能な場合は HITL を発生させない
- **Result**: 確定済み分類結果（自律確定分とユーザー承認分の promote/defer/reject 確定）
- **Evidence**: 自律確定した検出事項ごとの判定と主要根拠、HITL不要と判断した理由、HITL 対象の分類提示内容とユーザー承認の応答（既存の分類結果・実行報告を利用し、新規永続成果物を必須としない）
- **Completion Verification**: 全検出事項が自律確定またはユーザー承認のいずれかで確定していること
- **Resume-Idempotency**: 確定状態は処理実行（STEP-7）の完了状態から逆算して再構成する。処理実行が済んでいない検出事項は未確定と扱い、本 STEP の自律確定判定から再開する（未承認の推定で処理を実行しない）。自律確定項目にユーザー承認は存在しないため、再開時は詳細判定表に従い再判定する

## STEP-7: 処理実行（promote / reject / defer）

- **Purpose**: 確定済み分類（自律確定分とユーザー承認分）に従い、検出事項の配置変更（promote 保存、reject 削除、defer 残置）を実行する（finding disposition の出口 resume point）
- **Input Resolution**: STEP-6 の確定済み分類結果、`--auto` 時は STEP-4 の自動 promote 確定状態（auto-promote-log との突合）
- **Preconditions**: STEP-6 完了（確定対象）、STEP-4 完了（自動 promote 対象）
- **Procedure**:
  - **promote 処理**: 確定済みの promote 対象検出事項（自律確定分を含む）を `.agentdev/inspect/promoted/` へ保存する。元の inbox file は削除する
  - **reject 処理**: 確定済みの reject 対象検出事項（自律確定分を含む）は即時削除する。reject 時の commit message に却下理由を含める（監査証跡の補強）
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
  3. **変更あり時**: `git add` は `.agentdev/inspect/` と `.agentdev/intake/` のみ対象とする。
commit message は `chore(agentdev): promote inspect findings`（reject を含む場合は却下理由を含める）。
`git push` を実行する。
push 失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（完了扱いにしない）
  4. 完了報告 template（`.opencode/commands/agentdev/templates/inspect-promote/standard.md`）に従い、promote/ defer/ reject/ auto-promote の判定結果と後続 route を提示する。`--auto` 実行時は投入件数、投入先一覧、ログパスを含める。自律確定した検出事項は判定結果、主要根拠、HITL不要と判断した理由を完了報告に含める（既存の実行報告を利用し、新規永続成果物を作成しない）
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

- G01（ユーザーの明示的な承認なしに採用済み成果物を生成しない。`--auto` による自動 promote 対象、および詳細判定表に従い自律確定した検出事項を除く）
- 不変条件（reject された検出事項は即時削除される。即時削除以外の取扱を禁止する）
- 不変条件（defer された検出事項は `.agentdev/inspect/inbox/` に残す）
- 不変条件（docs-check ルール／検査データ追加候補は独立 route とせず、採用済み成果物の要件化方向または受け入れ条件に含める）
