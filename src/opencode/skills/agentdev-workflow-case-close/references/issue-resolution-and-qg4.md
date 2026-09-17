<!-- ADF-COVERS(implementation): REQ-032-027, REQ-021-027 -->
# STEP-1/2: Issue 番号解決・QG-4 達成判定（issue-resolution-and-qg4）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の制御平面（STEP 一覧）STEP-1, STEP-2 詳細である。
> Issue 番号解決・ルーティング（単一 vs Epic Wave）と QG-4 最終完了判定ゲートを提供する。

## STEP-1: Issue 番号解決・ルーティング

### Purpose

Issue 番号を解決し、単一 Issue クローズと Epic Wave クローズの処理ルートを確定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（ステータス追跡テーブル有無、`agentdev_gh` の issue_read 操作）
2. identifier 保持: Issue番号（ユーザー入力またはセッション内会話）
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- case-close command から Issue 番号が渡されている

### Procedure

ユーザー入力またはセッション内会話から番号を取得。
複数候補時は直近を優先して確認。
検出不可時はユーザーに指定を求めて停止。

**Epic Issue 判定**: 解決した Issue 番号の本文を `agentdev_gh` の issue_read 操作で取得し、ステータス追跡テーブル（`agentdev-epic-tracker` の新4列/旧4列形式）が存在するか確認。

- **テーブル存在時**: **Epic Wave クローズ**（STEP-E1〜E6、[references/epic-wave-close.md](epic-wave-close.md)）へ分岐
- **テーブル不存在時**: **単一 Issue クローズ**（STEP-1-1〜）へ進む（後方互換）

### STEP-1-1: 重複ファイルチェック（merge/pull 実行前、単一 Issue クローズ時）

`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャに従い、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出、停止条件の判定を行う。
`agentdev_gh` の pr_changed_files / pr_mergeable 操作実行不可時は後方互換性として STEP-6（実行前同期）でフォールバック検出を維持する。

### Result

- 処理ルート確定（単一 Issue クローズ or Epic Wave クローズ）
- 単一 Issue クローズ時: 重複ファイルチェック結果

### Evidence

- Issue 番号の入手経路、Issue 本文読取結果、ステータス追跡テーブル有無の判定根拠、重複ファイルチェック結果

### Completion Verification

- 処理ルートが一意に確定していること

### Resume-Idempotency

- 読取と判定のみで副作用を持たない。再実行時は同一 Issue 本文から同一ルート判定に到達する

## STEP-2: QG-4 達成判定（前提確認）

### Purpose

Issue 本文の完了条件チェックボックスを最終評価・更新し、達成判定（QG-4）を行う。

### Input Resolution

1. SSoT 再構成: Issue 本文（完了条件チェックボックス）、PR 本文（capture 入力源）、test strategy セクション、SSoT コメント（verify-only closure 時の判定根拠）
2. identifier 保持: Issue番号、PR番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 単一 Issue クローズ ルート（STEP-1 でテーブル不存在判定）

### Procedure

達成判定、完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価、更新する。
判定基準、検査観点は `agentdev-quality-gates` の QG-4 を参照。

- **完了条件チェックボックス評価・更新は case-close の責務**（QG-4）。case-run、実行担当サブエージェント、外部実行バックエンドは完了条件チェックボックスを更新しない。case-close は case-run/ 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
- **トレーサビリティ check の実行前提**: 下記の段階ゲートで check を実行する際は、`agentdev-traceability` SKILL.md「実行方法」節の実行前提に従う（`--req` は要件行IDの個別カンマ指定のみ受理し `..` 形式の範囲構文は非対応、`--root` は検証対象リポジトリのルート明示、宣言の走査対象は拡張子・除外ディレクトリの前提どおり）。前提を満たさない実行の結果は QG-4 の判定根拠に使わない
- **検証対応の3完全性ゲート（完了阻止）**: 完了条件チェックボックスの評価とは別に、対象要件行（当該 Case の Issue 本文が対象とする要件行）の Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性を判定する。対象要件行に Design 対応、implementation 対応、または required 行の verification 対応の欠落が残る場合、当該 Case を**完了として扱わない**（チェックボックスが全て checked でも完了扱いにしない）。`agentdev-traceability` の check（`--req` で対象要件行に限定、`missing-design` / `missing-implementation` / `missing-verification` の findings を該当行の完了阻止条件として扱う）で機械的に導出する。check が正常に完全性を判定できなかった場合（check 実行不能、検査対象の取得不能等）は対応完全性の合格として扱わず、検査不能の旨を報告してマージに進まない（fail-closed）。**policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない**。Decision 対応の欠落は完了阻止条件に含めない。判定の所有は本 Workflow Skill が保持し、command 定義へ複製しない。ゲート停止の状態は REQ ファイル、トレーサビリティポリシー、対応宣言という durable state から再構成可能である。実行の詳細は SKILL.md「トレーサビリティ能力の利用（QG-4 独立再検査）」参照
- **worktree root 起点の完全性判定時の再実行（誤差し戻し防止）**: traceability check を worktree root 起点で実行して検出対象の完全性が確定できない場合、main 側 root で check を再実行し、トレーサビリティポリシー登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない。再実行は読取系 check の実行のみで行い、GitHub I/O・Tool 操作契約は変更しない
- **PR 対象範囲 vs 全体 評価スコープ判定（QG-4 観点8）**: unchecked 完了条件を達成判定する前に、各完了条件の評価スコープ（PR 対象範囲 or 全体）を QG-4 観点8「PR 対象範囲 vs 全体 判定マトリクス」に従い決定する（境界ケース #1532 由来）
- 手順、再 grep/再検査/再計測、事後確認（再読込 VERIFY）、未達項目残存時の停止（完了条件評価専任責務）、test strategy 処理完了確認（未処理項目が残る場合は構造化エラーで停止）の詳細は `agentdev-quality-gates` の QG-4 を参照
- PR 存在確認
- **verify-only closure の QG-4 達成判定（SSoT コメント参照）**: verify-only closure（PR も carrier commit も存在しない Issue 完了）では、case-run が記録した SSoT コメント（Issue コメント）の実行コマンド列と検証結果を判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、SSoT コメントが検証証跡の恒久記録の正となる。SSoT コメントから次の3点を確認する:
  - 3検査（配布依存境界・IR-{NNN}・トレーサビリティ）の実行記録と新規違反 0 件確認
  - integrity suite の N/M 件数突合と直前実績比較
  - 実行コマンド列の再実行可能性（実行 cwd・実行形態の記載）
  SSoT コメントが存在しない verify-only closure、または SSoT コメントに検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない。docs_chore 特例フロー（main 直接 commit が存在する PR なし完了）は本手順の対象外であり、直接 commit 内容で QG-4 を検証する

### Result

- 完了条件チェックボックス評価・更新完了（再読込 VERIFY 済み）
- 観点8 評価スコープ確定
- test strategy 処理完了確認
- 対象要件行の3完全性判定結果（Design 対応・implementation 対応・required 行 verification 対応の欠落の有無）
- verify-only closure 時: SSoT コメント参照手順の確認結果（3検査記録、件数突合、再実行可能性）

### Evidence

- 完了条件チェックボックスの評価結果と更新後の再読込 VERIFY 結果、観点8 評価スコープ判定、test strategy 処理完了状態、段階ゲートの判定根拠（check の JSON 結果または定義どおりの手動確認結果）
- verify-only closure 時: SSoT コメントの参照結果（3検査の実行記録と新規違反 0 件確認、integrity suite の N/M 件数突合と直前実績比較、実行コマンド列の再実行可能性確認）

### Completion Verification

- 未達チェックボックスが残っていないこと（残る場合は構造化エラーで停止）。更新後の再読込 VERIFY が合格であること。対象要件行に Design 対応・implementation 対応の欠落が残らず、policy が required と判定する要件行の verification 対応が存在すること（該当行の欠落残存時は完了として扱わない。policy が optional と明示した要件行の verification 対応欠落は完了阻止の理由にしない。Decision 対応の欠落は完了阻止条件に含めない）。verify-only closure 時は SSoT コメントが存在し検証結果の記載が欠落していないこと（SSoT コメント不在または検証結果記載欠落時は完了として扱わない）

### Resume-Idempotency

- Issue 本文のチェックボックス状態（durable state、更新後に再読込）で評価済み否かを再構成する。更新済みチェックボックスを再評価しない
- verify-only closure 時は対象 Issue のコメント一覧（durable state、`agentdev_gh` の comment_list）から SSoT コメントの有無を再構成する。SSoT コメント不在時の完了抑止は再実行時も維持する

## resume point

- Issue 番号解決状態、Epic Wave vs 単一 Issue ルート判定
- 重複ファイルチェック結果（単一 Issue ルート）
- QG-4 完了条件チェックボックス評価・更新状態、観点8 評価スコープ、verify-only closure 時の SSoT コメント参照状態

## 関連 STEP

- 前: なし（workflow 開始）
- 次（単一 Issue ルート）: STEP-3（docs-and-spec-promotion）
- 次（Epic Wave ルート）: STEP-E1〜E6（epic-wave-close）

## 関連 Capability Skill

- Custom Tool `agentdev_gh`: Issue 本文読取
- `agentdev-epic-tracker`: Epic Issue 判定、ステータス追跡テーブル形式
- `agentdev-git-worktree`: 重複ファイルチェックプロシージャ
- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 判定マトリクス
- `agentdev-traceability`: Design 対応・implementation 対応・required 行 verification 対応欠落行の導出（check。3完全性ゲートの完了阻止判定手段）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（未マージ PR はクローズしない）
- 不変条件（Issue 番号省略は同一セッション内で作成済みの場合のみ）
- 不変条件（Issue 番号解決に Issue/PR 一覧取得手続き等は禁止）
- ガードレール・不変条件（未達チェックボックス残存時の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務、`POL-completion-checkbox-single-writer`）
