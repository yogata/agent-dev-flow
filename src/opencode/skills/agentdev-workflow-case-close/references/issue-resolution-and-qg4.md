# STEP-1/2: Issue 番号解決・QG-4 達成判定（issue-resolution-and-qg4）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-1, STEP-2 詳細である。
> Issue 番号解決・ルーティング（単一 vs Epic Wave）と QG-4 最終完了判定ゲートを提供する。

## STEP-1: Issue 番号解決・ルーティング

### Purpose

Issue 番号を解決し、単一 Issue クローズと Epic Wave クローズの処理ルートを確定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（ステータス追跡テーブル有無、`agentdev-gh-cli` の安全な読み取り手順）
2. identifier 保持: Issue番号（ユーザー入力またはセッション内会話）
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- case-close command から Issue 番号が渡されている

### Procedure

ユーザー入力またはセッション内会話から番号を取得。
複数候補時は直近を優先して確認。
検出不可時はユーザーに指定を求めて停止。

**Epic Issue 判定**: 解決した Issue 番号の本文を `agentdev-gh-cli` の安全な読み取り手順で取得し、ステータス追跡テーブル（`agentdev-epic-tracker` の新4列/旧4列形式）が存在するか確認。

- **テーブル存在時**: **Epic Wave クローズ**（STEP-E1〜E6、[references/epic-wave-close.md](epic-wave-close.md)）へ分岐
- **テーブル不存在時**: **単一 Issue クローズ**（STEP-1-1〜）へ進む（後方互換）

### STEP-1-1: 重複ファイルチェック（merge/pull 実行前、単一 Issue クローズ時）

`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャに従い、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出、停止条件の判定を行う。
PR 補助データ読込手続き（`agentdev-gh-cli`）実行不可時は後方互換性として STEP-6（実行前同期）でフォールバック検出を維持する。

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

1. SSoT 再構成: Issue 本文（完了条件チェックボックス）、PR 本文（capture 入力源）、test strategy セクション
2. identifier 保持: Issue番号、PR番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 単一 Issue クローズ ルート（STEP-1 でテーブル不存在判定）

### Procedure

達成判定、完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価、更新する。
判定基準、検査観点は `agentdev-quality-gates` の QG-4 を参照。

- **完了条件チェックボックス評価・更新は case-close の責務**（QG-4）。case-run、実行担当サブエージェント、外部実行バックエンドは完了条件チェックボックスを更新しない。case-close は case-run/ 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
- **検証対応要否の段階ゲート（完了阻止）**: 完了条件チェックボックスの評価とは別に、対象要件行（当該 Case の Issue 本文が対象とする要件行）の検証対応要否の分類状態を判定する。対象要件行に未分類の行（検証対応宣言なし かつ 検証対応要否カタログ未登録）が残る場合、または検証対応必須行に恒久検証対応が存在しない場合、当該 Case を**完了として扱わない**（チェックボックスが全て checked でも完了扱いにしない）。導出定義はトレーサビリティモデル「対応関係の完全性規則」が正規所有し、`agentdev-traceability` の check（`--req` で対象要件行に限定、`missing-verification` の findings を未分類行・恒久検証対応欠落行として扱う）で機械的に導出する。check が実行不能な場合はカタログ登録状態と検証対応宣言の有無を定義どおり手動確認する。**検証対応任意行（カタログ登録行）に恒久的な検証手段が存在しないことだけを理由として完了を阻害しない**。判定の所有は本 Workflow Skill が保持し、command 定義へ複製しない。ゲート停止の状態は REQ ファイル、検証対応要否カタログ、対応宣言という durable state から再構成可能である。実行の詳細は SKILL.md「トレーサビリティ能力の利用（QG-4 独立再検査）」参照
- **PR 対象範囲 vs 全体 評価スコープ判定（QG-4 観点8）**: unchecked 完了条件を達成判定する前に、各完了条件の評価スコープ（PR 対象範囲 or 全体）を QG-4 観点8「PR 対象範囲 vs 全体 判定マトリクス」に従い決定する（境界ケース #1532 由来）
- 手順、再 grep/再検査/再計測、事後確認（再読込 VERIFY）、未達項目残存時の停止（G08）、test strategy 処理完了確認（未処理項目が残る場合は構造化エラーで停止）の詳細は `agentdev-quality-gates` の QG-4 を参照
- PR 存在確認

### Result

- 完了条件チェックボックス評価・更新完了（再読込 VERIFY 済み）
- 観点8 評価スコープ確定
- test strategy 処理完了確認
- 検証対応要否の分類状態判定結果（未分類行・検証対応必須行の恒久検証対応欠落の有無）

### Evidence

- 完了条件チェックボックスの評価結果と更新後の再読込 VERIFY 結果、観点8 評価スコープ判定、test strategy 処理完了状態、段階ゲートの判定根拠（check の JSON 結果または定義どおりの手動確認結果）

### Completion Verification

- 未達チェックボックスが残っていないこと（残る場合は構造化エラーで停止）。更新後の再読込 VERIFY が合格であること。対象要件行に未分類の行が残らず、検証対応必須行の恒久検証対応が存在すること（未分類残存または恒久検証対応欠落時は完了として扱わない。検証対応任意行に恒久的な検証手段が存在しないことだけを理由とした阻止は行わない）

### Resume-Idempotency

- Issue 本文のチェックボックス状態（durable state、更新後に再読込）で評価済み否かを再構成する。更新済みチェックボックスを再評価しない

## resume point

- Issue 番号解決状態、Epic Wave vs 単一 Issue ルート判定
- 重複ファイルチェック結果（単一 Issue ルート）
- QG-4 完了条件チェックボックス評価・更新状態、観点8 評価スコープ

## 関連 STEP

- 前: なし（workflow 開始）
- 次（単一 Issue ルート）: STEP-3（docs-and-spec-promotion）
- 次（Epic Wave ルート）: STEP-E1〜E6（epic-wave-close）

## 関連 Capability Skill

- `agentdev-gh-cli`: Issue 本文読取、安全な読み取り手順
- `agentdev-epic-tracker`: Epic Issue 判定、ステータス追跡テーブル形式
- `agentdev-git-worktree`: 重複ファイルチェックプロシージャ
- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 判定マトリクス
- `agentdev-traceability`: 検証対応要否未分類行・恒久検証対応欠落行の導出（check。段階ゲートの完了阻止判定手段）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G01（未マージ PR はクローズしない）
- 不変条件（Issue 番号省略は同一セッション内で作成済みの場合のみ）
- 不変条件（Issue 番号解決に Issue/PR 一覧取得手続き等は禁止）
- G08・不変条件（未達チェックボックス残存時の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務）
