# STEP-E1〜E6: Epic Wave クローズ（epic-wave-close）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-E1〜E6 詳細である。Epic Issue 番号入力時（ステータス追跡テーブル存在時）の現在 Wave の一括クローズ、Epic status table 更新、最終 Wave 判定を提供する。

## 開始条件

- STEP-1 で Epic Issue と判定（ステータス追跡テーブル存在）

## 結果

- 現在 Wave の全子Issue マージ、クローズ完了
- Epic status table 更新完了（単一書き手 case-close のみ）
- Epic Issue 完了条件チェックボックス最終評価・更新（QG-4 観点8、中間 Wave vs 最終 Wave 評価スコープ切替）
- 最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）

## 手順

現在 Wave の PR 作成済み子Issue を一括マージ、クローズし、Epic status table を更新する。最終 Wave 判定後に Epic Issue クローズ または 残 Wave 通知を行う。

### E1: Epic Issue 本文読込・ステータス追跡テーブル解析

Epic Issue 本文を読み込み、ステータス追跡テーブル（`agentdev-epic-tracker` の新4列/旧4列形式）を解析。

### E2: 現在 Wave 特定

ステータス追跡テーブルから現在 Wave（`running` 状態の子Issue を含む Wave）を特定。

### E3: PR 作成済み子Issue 特定

現在 Wave の PR 作成済み子Issue（`running` 状態）を特定。`pending`/ `ready`/ `blocked`/ `failed` 状態の子Issue は対象外（べき等性）。

### E4: 各子Issue の PR マージ・子Issue クローズ・完了条件チェックボックス評価・Capture 回収・コンフリクト解消の準並列化（REQ）

各子Issue について次を**準並列**で実行する。

- PR マージ（STEP-4 の PR マージ手続きに準拠、mergeable UNKNOWN ポーリング、squash merge、先行 commit 検出、コンフリクト Level 1 rebase）
- 子Issue クローズ（Issue close 手続き）
- 完了条件チェックボックス評価・更新（QG-4、観点8 PR対象範囲 vs 全体）
- Capture 回収（PR 本文の `## Findings / Capture候補` から intake/learning 分離）
- コンフリクト解消（Level 1 rebase パス、Level 2/3 は case-auto エスカレーション）

### E5: Epic status table 更新（単一書き手 case-close のみ）

Epic Issue 本文のステータス追跡テーブルを更新。**単一書き手制約**: case-close のみが実施（case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない、last-write-wins 競合防止）。

### E5b: Epic Issue 完了条件チェックボックス最終評価・更新

QG-4 観点8 に基づく評価スコープ切替（中間 Wave vs 最終 Wave）を実施し、Epic Issue の完了条件チェックボックスを最終評価・更新する。

### E6: 最終 Wave 判定

- **全子Issue completed** → Epic Issue クローズ
- **以外** → 残 Wave 通知（次 Wave の case-run 実行をユーザーに促す）

## 重要: 対象外・禁止事項

- `pending`/ `ready`/ `blocked`/ `failed` 状態の子Issue は対象外
- `blocked`/ `failed` を `completed` に上書きしない（べき等性）
- `agentdev-epic-tracker` 準拠

詳細手順、判定基準、再読込 VERIFY、未達項目残存時の停止条件は `agentdev-epic-tracker` を正とする。

## resume point

- Epic Issue 本文、ステータス追跡テーブル解析状態
- 現在 Wave 特定状態
- PR 作成済み子Issue 一覧、各子Issue のマージ・クローズ・評価状態
- Epic status table 更新状態、Epic Issue 完了条件チェックボックス評価状態
- 最終 Wave 判定結果

## 関連 STEP

- 前: STEP-1（issue-resolution-and-qg4、Epic ルート分岐）
- 次: なし（Epic Wave クローズ workflow 終了、または case-auto Wave 反復制御へ戻る）

## 関連 Capability Skill

- `agentdev-epic-tracker`: E1〜E6 詳細手順、判定基準、子Issue 状態 enum、再読込 VERIFY、未達項目残存時の停止条件
- `agentdev-gh-cli`: Epic Issue 本文読込・更新、子Issue PR マージ・クローズ、mergeable UNKNOWN ポーリング、対応記録コメント、VERIFY
- `agentdev-git-worktree`: squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス（Level 1）
- `agentdev-quality-gates`: QG-4 完了条件チェックボックス評価・更新、観点8 評価スコープ切替
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離、Epic 横断回収）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: Capture 回収

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G04（Epic 自動クローズは全子Issue が CLOSED の場合のみ）
- G08/G20（未達チェックボックスが残る場合の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務）
- G24/G25/G26（Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手、case-run は読み取りのみ、case-auto は直接書き込まない、Epic Wave クローズは現在 Wave の `running` 子Issue のみ対象、`blocked`/ `failed` を `completed` に上書きしない、べき等性）
