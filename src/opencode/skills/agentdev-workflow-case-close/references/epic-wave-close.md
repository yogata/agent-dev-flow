# STEP-E1〜E6: Epic Wave クローズ（epic-wave-close）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-E1〜E6 詳細である。Epic Issue 番号入力時（ステータス追跡テーブル存在時）の現在 Wave の一括クローズ、Epic status table 更新、最終 Wave 判定を提供する。

## 開始条件

- STEP-{N} で Epic Issue と判定（ステータス追跡テーブル存在）

## 結果

- 現在 Wave の全子Issue マージ、クローズ完了（E4-0 最終 gate 違反子Issue は `blocked` としてマージ対象外、Epic status table へ反映）
- Epic status table 更新完了（単一書き手 case-close のみ）
- Epic Issue 完了条件チェックボックス最終評価・更新（QG-{N} 観点8、中間 Wave vs 最終 Wave 評価スコープ切替）
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

各子Issue について次を**準並列**で実行する。ただし各子Issue の PR マージへ進む前に、当該子Issue の PR HEAD で配布依存境界の最終 gate（STEP-{N} Step 3-1「配布依存境界の最終変更経路 gate」と同一手続き）を必ず実行する。single-Issue ルート（STEP-{N}）と Epic Wave ルート（本 STEP）で同一の最終 gate を経由し、どちらかのルートだけ gate を省略しない（DEC-{N}「事前書き込み gate と最終 gate の契約」、 配布依存境界 SPEC）。

#### E4-0: 各子Issue の配布依存境界 最終 gate（マージ前、single-Issue STEP-{N} Step 3-1 と同一手続き）

各子Issue の PR マージへ進む前に、当該 PR の変更ファイルに `.opencode/{commands,skills}/**` を含む場合、配布依存境界の最終 gate を実行する。含まない PR（docs のみ等）ではスキップする。手続きの正規所有者は STEP-{N} Step 3-1（[docs-and-spec-promotion.md](docs-and-spec-promotion.md)）であり、本 STEP は同一手続きを Epic Wave の各子Issue に適用する。

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`。検査対象は当該子Issue PR の HEAD（マージ前の実際の PR ブランチ内容）。現在の main 状態ではなく、PR で提案されている実際の変更内容を検査する
- **`--profile source`**: case-close は PR マージ前に実行され、原本領域 `.opencode/` を直接検査するため `source` を使用する
- **検査エラーの扱い**: 読込不能、未分類エントリ、adapter 起動失敗は全て gate-not-passed として扱う（DEC-{N} 決定5、TS-{NNN}）。clean として通過させない
- **gate 違反時**: 当該子Issue の PR マージを中止し、PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録する（既に case-run Step 7-1 で記録済みの場合は上書きせず、case-close で新たに検出された事項のみ追記）。当該子Issue は後続 E4-1 シーケンスへ進めず、E5 Epic status table で `blocked` 状態として記録する（`agentdev-epic-tracker` 準拠、`completed` へ上書きしない、べき等性）

#### E4-1: 各子Issue のマージ並列シーケンス（gate 合格子Issue のみ）

E4-0 を合格した子Issue について次を**準並列**で実行する。gate 違反子Issue は本シーケンスの対象外とする。

- PR マージ（STEP-{N} の PR マージ手続きに準拠、mergeable UNKNOWN ポーリング、squash merge、先行 commit 検出、コンフリクト Level 1 rebase）
- 子Issue クローズ（Issue close 手続き）
- 完了条件チェックボックス評価・更新（QG-{N}、観点8 PR対象範囲 vs 全体）
- Capture 回収（PR 本文の `## Findings / Capture候補` から intake/learning 分離）
- コンフリクト解消（Level 1 rebase パス、Level 2/3 は case-auto エスカレーション）

### E5: Epic status table 更新（単一書き手 case-close のみ）

Epic Issue 本文のステータス追跡テーブルを更新。**単一書き手制約**: case-close のみが実施（case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない、last-write-wins 競合防止）。

### E5b: Epic Issue 完了条件チェックボックス最終評価・更新

QG-{N} 観点8 に基づく評価スコープ切替（中間 Wave vs 最終 Wave）を実施し、Epic Issue の完了条件チェックボックスを最終評価・更新する。

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
- PR 作成済み子Issue 一覧、各子Issue の E4-0 最終 gate 結果（合格 / 違反 / スキップ）
- 各子Issue のマージ・クローズ・評価状態（E4-1 対象は E4-0 合格子Issue のみ）
- Epic status table 更新状態、Epic Issue 完了条件チェックボックス評価状態
- 最終 Wave 判定結果

## 関連 STEP

- 前: STEP-{N}（issue-resolution-and-qg4、Epic ルート分岐）
- 次: なし（Epic Wave クローズ workflow 終了、または case-auto Wave 反復制御へ戻る）

## 関連 Capability Skill

- `agentdev-epic-tracker`: E1〜E6 詳細手順、判定基準、子Issue 状態 enum、再読込 VERIFY、未達項目残存時の停止条件
- `agentdev-gh-cli`: Epic Issue 本文読込・更新、子Issue PR マージ・クローズ、mergeable UNKNOWN ポーリング、対応記録コメント、VERIFY
- `agentdev-git-worktree`: squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス（Level 1）
- `agentdev-quality-gates`: QG-{N} 完了条件チェックボックス評価・更新、観点8 評価スコープ切替
- `agentdev-workflow-orchestration`: capture 境界（intake/learning 分離、Epic 横断回収）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: Capture 回収
- integrity checker skill（repo-local）: E4-0 配布依存境界 最終 gate（check_distribution_boundary.ts、single-Issue STEP-{N} Step 3-1 と同一 detector、IR-{NNN}/046/047/048）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G04（Epic 自動クローズは全子Issue が CLOSED の場合のみ）
- G08/G20（未達チェックボックスが残る場合の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務）
- G24/G25/G26（Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手、case-run は読み取りのみ、case-auto は直接書き込まない、Epic Wave クローズは現在 Wave の `running` 子Issue のみ対象、`blocked`/ `failed` を `completed` に上書きしない、べき等性）
- E4-0 gate 違反子Issue は `blocked` へ遷移し E4-1 マージ並列シーケンスの対象外、`completed` へ上書きしない（べき等性、G24/G25/G26 準拠）
