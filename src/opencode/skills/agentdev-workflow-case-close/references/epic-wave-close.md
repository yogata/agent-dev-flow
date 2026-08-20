# STEP-E1〜E6: Epic Wave クローズ（epic-wave-close）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-E1〜E6 詳細である。
> Epic Issue 番号入力時（ステータス追跡テーブル存在時）の現在 Wave の一括クローズ、Epic status table 更新、最終 Wave 判定、Epic 実証判定（共有評価ブランチ特定）と Epic 実証の最終 case-close（最終評価結果導出・正規記録、正式化案内）を提供する。

## Purpose

Epic Issue 番号入力時（ステータス追跡テーブル存在時）に現在 Wave の子Issue を一括マージ・クローズし、Epic status table を更新、最終 Wave 判定を行う。
Epic 実証（Epic Issue 本文の実証Case状態情報で共有評価ブランチが特定できる場合）は共有評価ブランチを統合先として各 Wave を連携させ、最終 Wave で実証全体の最終 case-close（最終評価結果の導出と Epic Issue 最終コメント正規記録、正式化経路案内）を実施する。

## Input Resolution

1. SSoT 再構成: Epic Issue 本文（ステータス追跡テーブル、実証Case状態情報、評価契約）、現在 Wave の子Issue 本文・PR 本文群
2. identifier 保持: Epic Issue番号、子Issue番号群、PR番号群、統合先ブランチ（通常 Epic Case は main、Epic 実証は共有評価ブランチ）
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- STEP-1 で Epic Issue と判定（ステータス追跡テーブル存在）

## Result

- 現在 Wave の全子Issue マージ、クローズ完了（E4-1 最終 gate 違反子Issue は `blocked` としてマージ対象外、Epic status table へ反映）
- Epic status table 更新完了（単一書き手 case-close のみ）
- Epic Issue 完了条件チェックボックス最終評価・更新（QG-4 観点8、中間 Wave vs 最終 Wave 評価スコープ切替）
- 最終 Wave 判定結果（Epic クローズ または 残 Wave 通知）
- Epic 実証の最終 Wave 判定時: 最終評価結果の導出と Epic Issue 最終コメント正規記録、正式化経路案内（中間Waveでは案内しない）

## Procedure

現在 Wave の PR 作成済み子Issue を一括マージ、クローズし、Epic status table を更新する。
最終 Wave 判定後に Epic Issue クローズ または 残 Wave 通知を行う。

### E1: Epic Issue 本文読込・ステータス追跡テーブル解析・Epic 実証判定

Epic Issue 本文を読み込み、ステータス追跡テーブル（`agentdev-epic-tracker` の新4列/旧4列形式）を解析。

**Epic 実証判定・統合先確定**: Epic Issue 本文の実証Case状態情報（対象評価ブランチ等の永続記録）から Epic 実証か否かを判定する。

- **Epic 実証（実証Case状態情報あり）**: 共有評価ブランチを特定し、当該 Epic 実証の統合先（共有評価ブランチ）を確定する。本 Wave の子Issue PR の base、各 squash merge 先は同一の共有評価ブランチを参照する
- **通常 Epic Case（実証Case状態情報なし）**: 従来どおり main を統合先とする

### E2: 現在 Wave 特定

ステータス追跡テーブルから現在 Wave（`running` 状態の子Issue を含む Wave）を特定。

### E3: PR 作成済み子Issue 特定

現在 Wave の PR 作成済み子Issue（`running` 状態）を特定。
`pending`/ `ready`/ `blocked`/ `failed` 状態の子Issue は対象外（べき等性）。

### E4: 各子Issue の PR マージ・子Issue クローズ・完了条件チェックボックス評価・Capture 回収・コンフリクト解消の準並列化

各子Issue について次を**準並列**で実行する。
ただし各子Issue の PR マージへ進む前に、当該子Issue の PR HEAD で配布依存境界の最終 gate（STEP-3-1「配布依存境界の最終変更経路 gate」と同一手続き）を必ず実行する。
single-Issue ルート（STEP-3）と Epic Wave ルート（本 STEP）で同一の最終 gate を経由し、どちらかのルートだけ gate を省略しない（配布依存境界 Design）。

#### E4-1: 各子Issue の配布依存境界 最終 gate（マージ前、single-Issue STEP-3-1 と同一手続き）

各子Issue の PR マージへ進む前に、当該 PR の変更ファイルが `--profile source` の配布 command/skill ソース面に含まれる場合、配布依存境界の最終 gate を実行する。
含まない PR（docs のみ等）ではスキップする。
trigger 条件は detector の `--profile source` が分類する配布ソース面を基準とする（case-run command STEP-S5 と同一）。
手続きの正規所有者は STEP-3-1（[docs-and-design-promotion.md](docs-and-design-promotion.md)）であり、本 STEP は同一手続きを Epic Wave の各子Issue に適用する。

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`。検査対象は当該子Issue PR の HEAD（マージ前の実際の PR ブランチ内容）。現在の main 状態ではなく、PR で提案されている実際の変更内容を検査する
- **checker コマンドの stdout 退避形式**: 本 gate の checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出）であるため、実行と stdout 取得は `agentdev-gh-cli` READ 手続きの「exit code が意味を持つコマンドの stdout 退避形式」に従う（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。非ゼロ exit 時も JSON レポートを証跡として保持する（手続きの正規所有者は STEP-3-1 と同一）
- **`--profile source`**: case-close は PR マージ前に実行され、配布ソース面を検査するため `source` を使用する（junction は原本への鏡像）
- **検査エラーの扱い**: 読込不能、未分類エントリ、adapter 起動失敗は全て gate-not-passed として扱う。clean として通過させない
- **gate 違反時**: 当該子Issue の PR マージを中止し、PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録する（既に case-run command STEP-S5 で記録済みの場合は上書きせず、case-close で新たに検出された事項のみ追記）。当該子Issue は後続 E4-2 シーケンスへ進めず、E5 Epic status table で `blocked` 状態として記録する（`agentdev-epic-tracker` 準拠、`completed` へ上書きしない、べき等性）

#### E4-2: 各子Issue のマージ並列シーケンス（gate 合格子Issue のみ）

E4-1 を合格した子Issue について次を**準並列**で実行する。
gate 違反子Issue は本シーケンスの対象外とする。

- PR マージ（STEP-4 の PR マージ手続き（squash merge 先の統合先解決を含む）に準拠、mergeable UNKNOWN ポーリング、squash merge、先行 commit 検出、コンフリクト Level 1 rebase）
- 子Issue クローズ（Issue close 手続き）
- 完了条件チェックボックス評価・更新（QG-4、観点8 PR対象範囲 vs 全体）
- Capture 回収（PR 本文の `## Findings / Capture候補` から intake/learning 分離）
- コンフリクト解消（Level 1 rebase パス、Level 2/3 は case-auto エスカレーション）

### E5: Epic status table 更新（単一書き手 case-close のみ）

Epic Issue 本文のステータス追跡テーブルを更新。
**単一書き手制約**: case-close のみが実施（case-run は読み取りのみ、case-auto は Wave 反復制御のみで直接書き込まない、last-write-wins 競合防止）。

### E5b: Epic Issue 完了条件チェックボックス最終評価・更新

QG-4 観点8 に基づく評価スコープ切替（中間 Wave vs 最終 Wave）を実施し、Epic Issue の完了条件チェックボックスを最終評価・更新する。

### E6: 最終 Wave 判定

- **全子Issue completed** → Epic Issue クローズ
- **以外** → 残 Wave 通知（次 Wave の case-run 実行をユーザーに促す）

**Epic 実証の最終 case-close（全子Issue completed で Epic クローズする場合のみ）**:

- **最終評価結果の導出**: 新しい評価を始めず、事前の評価契約（Epic Issue 本文の正規記録）と蓄積済み証拠（各子Issue の PR 本文の実行条件・測定結果・観察結果・証拠・評価結果）から最終評価結果を導出する
- **最終評価結果の正規記録**: 導出した最終評価結果を Epic Issue の最終コメントとして正規記録する（`agentdev-gh-cli` のコメント追加手続き → VERIFY）
- **正式化経路案内**: 正式化経路として `req-define <実証Issue>`（Epic 実証では Epic Issue を指定）を利用者へ明示する
- **Epic 中間Waveでの案内抑制**: 残 Wave が存在する中間Wave（残 Wave 通知側）では正式化案内を出さない
- **req-define 自動実行禁止**: case-close は後続 req-define を自動実行しない
- 通常 Epic Case（Epic 実証でない場合）は従来どおりの最終 Wave 判定とし、本処理を実施しない

## 重要: 対象外・禁止事項

- `pending`/ `ready`/ `blocked`/ `failed` 状態の子Issue は対象外
- `blocked`/ `failed` を `completed` に上書きしない（べき等性）
- `agentdev-epic-tracker` 準拠

詳細手順、判定基準、再読込 VERIFY、未達項目残存時の停止条件は `agentdev-epic-tracker` を正とする。

## Evidence

- Epic Issue 本文読取結果、Epic 実証判定根拠（実証Case状態情報と共有評価ブランチ）、E4-1 最終 gate の JSON 結果（子Issue 別）、マージ・クローズ結果、Epic status table 更新の VERIFY 結果、最終 Wave 判定根拠、Epic 実証最終クローズ時は最終評価結果の導出根拠と Epic Issue 最終コメントの VERIFY 結果

## Completion Verification

- E4-2 対象が E4-1 合格子Issue のみであること。`blocked`/`failed` を `completed` に上書きしていないこと。Epic status table 更新後の再読込 VERIFY が合格であること。Epic 実証の最終 Wave では新しい評価を開始せず最終評価結果が Epic Issue 最終コメントへ正規記録済みであり、正式化経路案内を含むこと（中間Waveでは案内していないこと）

## Resume-Idempotency

- Epic Issue 本文のステータス追跡テーブル（durable state、case-close 単一書き手）で子Issue のマージ・クローズ進捗を再構成する。処理済み子Issue の再マージを行わない

## resume point

- Epic Issue 本文、ステータス追跡テーブル解析状態、Epic 実証判定・統合先確定状態（共有評価ブランチ）
- 現在 Wave 特定状態
- PR 作成済み子Issue 一覧、各子Issue の E4-1 最終 gate 結果（合格 / 違反 / スキップ）
- 各子Issue のマージ・クローズ・評価状態（E4-2 対象は E4-1 合格子Issue のみ）
- Epic status table 更新状態、Epic Issue 完了条件チェックボックス評価状態
- Epic 実証の最終評価結果導出・Epic Issue 最終コメント正規記録状態、正式化案内実施状態
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
- integrity checker skill（自己ホストリポジトリ固有）: E4-1 配布依存境界 最終 gate（check_distribution_boundary.ts、single-Issue STEP-3-1 と同一 detector）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G04（Epic 自動クローズは全子Issue が CLOSED の場合のみ）
- G08・不変条件（未達チェックボックスが残る場合の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務）
- G24・不変条件（Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手、case-run は読み取りのみ、case-auto は直接書き込まない、Epic Wave クローズは現在 Wave の `running` 子Issue のみ対象、`blocked`/ `failed` を `completed` に上書きしない、べき等性）
- E4-1 gate 違反子Issue は `blocked` へ遷移し E4-2 マージ並列シーケンスの対象外、`completed` へ上書きしない（べき等性、case-close G24 準拠）
- 不変条件（Epic 実証の最終 Wave は新しい評価を始めず最終評価結果を Epic Issue 最終コメントへ正規記録し正式化経路 req-define <実証Issue> を案内する、Epic 中間Waveでは正式化案内を出さない、後続 req-define を自動実行しない）
