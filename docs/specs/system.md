# System Specification

## コマンドシステム

### AgentDevFlow コマンド群

AgentDevFlow（agentdev namespace）は3つのパイプラインで構成され、開発ワークフローを提供する。コマンドごとに適切なagentをfrontmatterに指定。対話系コマンド（req-define, intake-review）は prometheus、ファイル操作系コマンドは sisyphus。

#### req/case パイプライン

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち）。単体実行時にStep 0でセッションコンテキスト検知を行い、既存要件情報を推論・引き継ぎして適切なStepへルーティングする | prometheus |
| `/agentdev/req-save` | 要件定義の保存 | sisyphus |
| `/agentdev/case-open` | Issue登録（Epic + 子Issue一括作成対応） | sisyphus |
| `/agentdev/case-run` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。Step 11にローカル検証・デプロイ検証を含み、各検証失敗時の自律修正ループ（最大3回）を備える。複数Issueの並列実行に対応 | sisyphus |
| `/agentdev/case-update` | Issue更新 | sisyphus |
| `/agentdev/case-close` | 完了処理 | sisyphus |

#### learning パイプライン

学びの3層パイプライン（キャプチャ→分析→昇華）を提供する。基本方針は「実観測ベース、出口を厳しく」。

| コマンド/スキル | 役割 | 層 | 特徴 |
|---|---|---|---|
| `agentdev-learning-capture`（スキル） | エージェント主体で学びを検知・抽出・自律蓄積 | キャプチャ層 | 13項目形式、実観測ベース（実際に検知・回避・修正した問題のみ）、ユーザー承認なしで直接inbox.mdに蓄積 |
| `/agentdev/learning-refine` | 問題クラス分類→8軸評価→archive移動。Input/Output/Steps中心の薄いコマンド | 分析層 | evaluation-report.md生成、refine時prune（任意）、`agentdev-learning-pipeline` skill参照 |
| `/agentdev/learning-promote` | 昇華判定→Requirement Source staging stub生成。直接反映禁止 | 昇華層 | 11処分区分+duplicate、既存対策照合、promote時prune（必須）、`agentdev-learning-pipeline` skill参照、req-defineへの明示入力ファイル案内付き |

**データフロー**: `inbox.md` →（learning-refine）→ `archive.md` + `evaluation-report.md` →（learning-promote）→ `elevation-staging/`（Requirement Source形式）

**エントリ形式**: 13項目形式（問題事象/発生局面/検知方法/根本原因/自律対応内容/ユーザー確認有無/ADR・REQ・spec影響/横展開観点/再発条件/予防策候補/想定反映先/関連/タグ）

**データファイル**:
- `inbox.md`: 未処理の学び（agentdev-learning-captureで追加）
- `archive.md`: 生きている learning プール（未処分・保留中・再評価対象）。prune・promote時pruneで動的に変化
- `evaluation-report.md`: 評価済み中間レポート（毎回上書き、長期履歴ではない）
- `elevation-staging/`: Requirement Source形式スタブファイル（背景/問題/望ましい変更/対象範囲/反映先候補テーブル/既存対策確認/制約/完了条件/元learning item/推奨Issue分類）。req-define明示入力ファイル経由で実装に移行

**反映ルート**: stagingスタブ（Requirement Source形式）→ `/agentdev/req-define`（明示入力ファイル指定）→ `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`

**Staging Stub Archive**: case-close で消費済み staging stub を `elevation-staging/archive/` に移動する。consumed 判定は機械的4条件（Issueにstubパス記録 + PRマージ済み + Issue completed close + case-close正常完了）で行い、意味的一致検証はしない。移動前に stub 本文に `## 消費記録` セクション（Issue #, PR #, 消費日, 処理）を追記する。同名ファイル既存時は上書きしない。不採用 stub は対象外。`agentdev-learning-pipeline` skill に archive ルールを定義し、case-close が同 skill を load して実行する

#### intake ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/intake-capture` | 手動で気づき・課題を inbox.md に素早く記録 | sisyphus |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出して `.agentdev/intake/inbox/` に保存 | sisyphus |
| `/agentdev/intake-review` | inbox.md の未処理エントリを一括レビューし、処分判定（保留/却下/昇華候補）を行う | prometheus |
| `/agentdev/intake-promote` | review 済み intake item を req-define / intake-open 用入力 artifact に整形 | sisyphus |
| `/agentdev/intake-open` | intake-promote 生成 artifact から GitHub Issue を作成 | sisyphus |

intake 系コマンドは `.agentdev/intake/` 更新前後に git 永続化を実行する（REQ-0025）:
- 実行前同期: `.agentdev/intake/` 更新前に `git pull --ff-only` を実行し、リモートの最新状態を取得
- scoped commit + push: 更新後に `.agentdev/intake/` 配下のみを `git add` → commit → push

#### integrity ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンドの整合性を検証 | sisyphus |

### 品質メトリクス

`deviation-check`: 乖離検出時に品質メトリクスを自動収集する。メトリクス定義は `docs/specs/quality-specs.md` で管理。型チェック・Lint・ビルド・テスト結果を収集し、乖離検出報告に併記してPR本文に反映する。

### 安全性スキル

`agentdev-gh-cli`: Windows PowerShell環境でのgh CLI使用時の安全性を確保する。WRITE操作（`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` でBOMなしUTF-8ファイル作成、`--body-file` / `-F` 経由で指定）、READ操作（Node.js `execSync` でpwshパイプラインをバイパスしUTF-8出力を直接取得）、VERIFY操作（書き込み後の読み戻し検証）の3つをカバーし、文字化け防止と内容品質を担保する。VERIFY操作は3観点（エンコーディング・Markdown構造・テンプレート必須セクション）で検証し、失敗時は3段階分類（同一内容リトライ・内容再生成・停止・ユーザー報告）で対応する。case-open、case-run、case-closeの各書き込み操作後に適用する。

### 整合性検査スキル

`agentdev-integrity`: 横断的整合性検査の orchestration を担う。検査カテゴリ（REQ/ADR/Skill/Command/Template/Workflow）、結果分類（NG/warning/info）、レポート Schema（JSON/Markdown）を定義する。スクリプト実体は `agentdev-integrity/scripts/` 配下に配置し、`/agentdev/integrity-check` command は薄い入口として維持する。レポート出力先: `.agentdev/integrity/reports/`。

### .opencode/ ディレクトリ責務

`.opencode/` ディレクトリは OpenCode プラグイン設定の配置場所であり、以下の責務を持つ。

**配置対象**（SHALL）:
- `commands/`: コマンド定義ファイル
- `skills/`: スキル定義ファイル（SKILL.md）
- プラグイン設定ファイル
- custom tool 設定
- 依存 manifest（runtime に必要なもののみ）

**禁止事項**（SHALL）:
- 汎用 TypeScript 検証プロジェクトの配置を禁止する（`.opencode/src/`、`.opencode/tests/`、`package.json`、`tsconfig.json` 等）
- `.agentdev/` への検証コード・実装コード移動を禁止する（`.agentdev/` は AgentDevFlow の canonical domain state directory）

### スクリプト配置方針

スキル同梱スクリプトは該当 skill 配下の `scripts/` に配置する（SHALL）。各スクリプトは TypeScript (bun runtime) で実装し、共通 CLI 契約に準拠する。

**配置ルール**（SHALL）:

| 用途 | 配置先 | 例 |
|------|--------|-----|
| skill 専用スクリプト | `<skill>/scripts/` | `agentdev-gh-cli/scripts/verify_body.ts` |
| 横断的検査スクリプト | `agentdev-integrity/scripts/` | `agentdev-integrity/scripts/check_integrity.ts` |
| 共通 CLI ユーティリティ | `agentdev-integrity/scripts/cli_utils.ts` | `parseArgs`, `formatJsonReport` 等 |

**共通 CLI 契約**（SHALL）:
- `--help`, `--json`, `--dry-run` オプションをサポートする
- exit code: 0 (OK), 1 (NG/warning), 2 (error)
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行（プロンプト禁止）
- 破壊的変更禁止（自動修正は別モード）

**テスト**（SHALL）:
- テストファイルはスクリプトと同ディレクトリに `*.test.ts` として併置する
- `bun test` で実行可能であること

**禁止**（SHALL）:
- `.opencode/src/`、`.opencode/tests/`、`.opencode/tsconfig.json` の配置
- `.agentdev/` へのスクリプト配置
- 新規 Shell / Python スクリプトの追加（既存は維持）

### テスト・Package Manifest 配布方針

コマンド・スキルの配布時におけるテスト・package manifest の取り扱い:

- runtime に必要な manifest のみ配布する（SHALL）
- テストファイルは配布対象外とする（SHALL）
- テスト・package manifest の分散配置を禁止する（SHALL）
- 配布対象は一元管理する（SHALL）
- 配布制御は `.gitignore` ではなく配布時 exclude で行う（SHALL）

### Epic（大規模Issue分割フロー）

規模判定条件（3条件のいずれか1つ）を満たす場合、`scale: large`（Epic）として扱う:
1. 複数モジュール跨ぎ（UI + API + DB等）
2. 単一PRでのPR肥大化リスク
3. 段階的リリースが必要

**ワークフロー**: `/agentdev/req-define`（規模判定）→ `/agentdev/req-save` → `/agentdev/case-open`（Epic + 子Issue一括作成）→ `/agentdev/case-run`（子Issue並列実行）→ 各 `/agentdev/case-close` → Epic自動クローズ

**データフロー**: 1ドラフト → 1 REQ → Epic + N子Issue（REQ分割なし）

### Issueテンプレートの完了条件セクション

Issueテンプレート（`issue_desc_*.md`）に`完了条件`セクションを【必須】項目として配置する。

**適用テンプレート**: `issue_desc_feature.md`, `issue_desc_bug.md`, `issue_desc_child.md`, `issue_desc_backlog_child.md`

**Epicテンプレートの扱い**: `issue_desc_epic.md`, `issue_desc_backlog_epic.md`には`完了条件`セクションを追加せず、既存の`完了条件`にEpic全体の完了判定条件としての明確化コメントを付与する。

**コマンドへの反映**: `case-open`のguardrailで`完了条件`を必須セクションとして確認する。`case-run`のStep 7で完了条件品質ゲートを実施し、完了判定はPlanではなく`完了条件`を参照する。

### Epic自動クローズ

`case-close` Step 8 で親Epic本文更新後、Epic内の全子Issue状態を確認し、全完了時にEpicを自動クローズする。子Issue残存時はスキップし完了報告に状況を表示する。

### Epicステータス追跡

`agentdev-epic-tracker`: 親Epic Issueのステータス追跡テーブル（`| # | Issue | ステータス | 内容 |` 4列形式）を更新する知識ベース。ステータス値は `☐ 未着手` / `🔄 進行中` / `✅ 完了 ([PR#N](URL))` / `❌ 対処不要` の4値。`case-run` Phase A で `🔄 進行中` に更新し、`case-close` Step 8 で `✅ 完了 ([PR#N](URL))` に更新する。`❌ 対処不要` は手動設定のみの終了状態。Epic自動クローズ判定では `❌ 対処不要` を `✅ 完了` と同等の終了状態として扱う。多重Issueモードでは親エージェントがWave開始前に一括更新する。

### 自律修正ループ（Self-Healing Loop）

`case-run` の Step 11a（ローカル検証）および Step 11c（CI/CD検証）で、検証失敗時にユーザー判断を待たずに実装フェーズ（Step 6）へループバックし自律的に修正を試みる仕組み。

**カウント規則**: 11a と 11c のカウントは独立管理。最大各3回。

**修正範囲**: 既存要件範囲内の実装・テスト・設定不備に限定。要件変更・仕様判断・スコープ変更を伴う修正は禁止。

**停止条件**（7項目のいずれかに該当で即座停止・ユーザー報告）: (a) 要件・仕様・スコープ変更必要、(b) REQ・ADR・specs変更判断必要、(c) 既存仕様逸脱、(d) 破壊的変更必要、(e) 外部サービス・CI環境・権限・Secrets不足、(f) flaky判別不能、(g) 3回上限超過。

**テスト期待値**: テストが間違っていると自律判断できる場合のみ修正対象。判別不能時は停止条件に該当。

**3回超過時の報告内容**: 失敗項目一覧、エラーログ要約、各試行の修正内容、原因候補、停止の判断理由。

**責務分離**: `case-close` はCI/CD通過確認のみ（失敗時は case-run に差し戻し）。`case-update` はCI/CD修正の管轄外（REQ更新・レビューNGコメント・Issue本文更新のみ）。

### Post-Run Capture

`case-run` および `case-close` での本筋外発見の退避仕様。intake と learning の split rule は `capture-boundaries.md` を SSoT とする。

**case-run 退避方針**（REQ-0019-009~012）:
- 作業中に本筋外の不整合・規約違反・小改善候補を見つけた場合、完了条件を勝手に拡大して修正してはならない（MUST NOT）
- 本筋外の発見を intake 候補として記録する（SHOULD）
- 作業中の失敗・回避・判断ミスを learning 候補として区別する（SHOULD）
- intake 候補と learning 候補を混ぜた単一成果物にしない（SHALL）

**case-close post-run capture**（REQ-0019-013~020）:
- 完了処理中に発見した具体的な修正対象を intake item として自律保存する（SHALL）
- 曖昧な候補は自律保存せず完了報告に候補として提示する（SHALL）
- intake item の保存先は `.agentdev/intake/inbox/` に限定する（SHALL）
- intake と learning を別成果物として扱い、件数・保存先・次ステップを別々に表示する（SHALL）
- 既存の learning capture の原則を維持する（SHALL）

### 関連ドキュメントの要件達成対象化

実装コード・設定だけでなく、関連ドキュメント（README.md、system.md、patterns.md、guides等）も要件達成の一部として扱う。全パターン（A/B/C/D）共通。

**探索責務**（`case-run` Step 6）: 実装コード・設定・スキーマ・cron・環境変数・API・関連ドキュメントを対象に影響範囲を探索する。req-defineに明記されていないことを理由に更新対象外にはできない（SHALL）。

**更新責務**（`case-run` Step 10）: 変更後仕様と矛盾する既存ドキュメントを同一Issue内で更新する。更新漏れがある場合は要件未充足とみなす（SHALL）。

**完了確認**（`case-close` Step 3）: 実装コード・設定・関連ドキュメントが要件と矛盾していないことを確認する（SHALL）。旧仕様の記述が残っている場合、変更後仕様と矛盾しないことを確認する（SHALL）。矛盾するドキュメント更新漏れがある場合は完了不可（SHALL）。

**req-define の責務**: 関連ドキュメントの個別ファイル列挙をユーザーに求めない。責務は要件の壁打ち・構造化に専念する。
