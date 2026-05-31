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
| `/agentdev/case-close` | 完了処理（達成判定プロトコル付き完了ゲート: 未チェック項目の即時停止→根拠探索→[x]更新→構造化エラーの段階的フロー） | sisyphus |

#### learning パイプライン

学びの3層パイプライン（キャプチャ→分析→昇華）を提供する。基本方針は「実観測ベース、出口を厳しく」。

| コマンド/スキル | 役割 | 層 | 特徴 |
|---|---|---|---|
| `agentdev-learning-capture`（スキル） | エージェント主体で学びを検知・抽出・自律蓄積 | キャプチャ層 | 13項目形式、実観測ベース（実際に検知・回避・修正した問題のみ）、ユーザー承認なしで直接inbox.mdに蓄積 |
| `/agentdev/learning-refine` | 問題クラス分類→8軸評価→archive移動。Input/Output/Steps中心の薄いコマンド | 分析層 | evaluation-report.md生成、refine時prune（任意）、`agentdev-learning-pipeline` skill参照 |
| `/agentdev/learning-promote` | 昇華判定→promoted artifact 生成。直接反映禁止 | 昇華層 | 11処分区分+duplicate、既存対策照合、promote時prune（必須）、`agentdev-learning-pipeline` skill参照 |

**データフロー**: `inbox.md` →（learning-refine）→ `archive/active.md` + `evaluation-report.md` →（learning-promote）→ `promoted/`（フラット構造）→（backlog-review → backlog-save）→ `.agentdev/backlog/req-units/RU-*.md`

**エントリ形式**: 13項目形式（問題事象/発生局面/検知方法/根本原因/自律対応内容/ユーザー確認有無/ADR・REQ・spec影響/横展開観点/再発条件/予防策候補/想定反映先/関連/タグ）

**データファイル**:
- `inbox.md`: 未整理 learning entry の active queue。capture で蓄積し、refine 成功後にクリアされる。永続ストレージではない
- `archive/active.md`: living pool（終端保管ではない。`archive` は終端保管を意味しない）。未処分・保留中・再評価対象の entry を保持し、promote の入力として参照される。prune・promote時pruneで動的に変化
- `evaluation-report.md`: refine/promote 間の境界 artifact（毎回上書き、長期履歴ではない）
- `promoted/`: 昇華判定済み artifact の配置先（フラット構造）。backlog-review → backlog-save が読み込み、RU 生成成功後に削除。`.opencode/` や実装コードへの直接反映禁止

**反映ルート**: promoted artifact → `/agentdev/backlog-review` → `/agentdev/backlog-save`（RU 生成）→ `/agentdev/req-define`（RU を Requirement Source として読み込み）→ `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`

**Staging Stub Archive**: ~~case-close で取り込み済み staging stub を `elevation-staging/archive/` に移動する機能は廃止（`elevation-staging/` 自体が `promoted/` に統一されたため）~~。RU 化後の promoted artifact は backlog-save が削除する。imported 判定に基づく archive 移動は行わない。`agentdev-learning-pipeline` skill に archive ルールが定義されていたが、新アーキテクチャでは backlog-save が削除を担当する（REQ-0105）

#### intake ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/intake-capture` | 手動で気づき・課題を `.agentdev/intake/inbox/` に素早く記録 | sisyphus |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出して `.agentdev/intake/inbox/` に保存 | sisyphus |
| `/agentdev/intake-review` | inbox の未処理 item をレビューし、採用（accepted）・保留（inbox）・却下（archive/rejected）に振り分ける | prometheus |
| `/agentdev/intake-promote` | accepted item を promoted artifact（フラット構造）に整形し、`promoted/` に保存。accepted item は archive/promoted に移動。frontmatter は持たない | sisyphus |

intake 系コマンドは `.agentdev/intake/` 更新前後に git 永続化を実行する（REQ-0108）:
- 実行前同期: `.agentdev/intake/` 更新前に `git pull --ff-only` を実行し、リモートの最新状態を取得
- scoped commit + push: 更新後に `.agentdev/intake/` 配下のみを `git add` → commit → push

#### integrity ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンドの整合性を検証 | sisyphus |

#### REQ再構成レビューワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/req-restructure-review` | REQ体系の健全性を診断し、再構成の推奨アクションを提示 | prometheus |

### 品質メトリクス

`deviation-check`: 乖離検出時に品質メトリクスを自動収集する。メトリクス定義は `docs/specs/quality-specs.md` で管理。型チェック・Lint・ビルド・テスト結果を収集し、乖離検出報告に併記してPR本文に反映する。

### 安全性スキル

`agentdev-gh-cli`: Windows PowerShell環境でのgh CLI使用時の安全性を確保する。WRITE操作（`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` でBOMなしUTF-8ファイル作成、`--body-file` / `-F` 経由で指定）、READ操作（Node.js `execSync` でpwshパイプラインをバイパスしUTF-8出力を直接取得）、VERIFY操作（書き込み後の読み戻し検証）の3つをカバーし、文字化け防止と内容品質を担保する。VERIFY操作は4観点（エンコーディング・Markdown構造・テンプレート必須セクション・リポジトリ参照リンク正規化）で検証し、失敗時は3段階分類（同一内容リトライ・内容再生成・停止・ユーザー報告）で対応する。リポジトリ参照リンク正規化は `verify_body.ts` の `checkLinkNormalization` で実行し、Markdownリンク内の相対パス・裸パスを検出する。case-open、case-run、case-close、case-updateの各書き込み操作後に適用する。

### 整合性検査スキル

`agentdev-integrity`: 横断的整合性検査の orchestration を担う。検査カテゴリ（REQ/ADR/Skill/Command/Template/Workflow/Link/Canonical/Lifecycle/Namespace/ImplementationPattern）、17集合の全文書 artifact をスキャンし、inventory整合性・link整合性・canonical境界・lifecycle境界・旧namespace残存・implementation pattern診断を検査する。implementation pattern診断は pattern 定義妥当性、secondary pattern 検証、command-map.md整合性、load_skills過剰/不足診断、skill USE FOR/DO NOT USE FOR整合性、未使用skill 5カテゴリ分類、recommendation candidate 分類をカバーする（REQ-0108-026~038）。Finding 分類（document-drift/broken-reference/obsolete-structure/canonical-conflict/workflow-gap/integrity-rule-gap）と route 判定（intake/intake+learning/req-define/learning/none）を定義する。結果分類（NG/warning/info）、レポート Schema（JSON/Markdown）、レポート出力先: `.agentdev/integrity/reports/`。スクリプト実体は `agentdev-integrity/scripts/` 配下に配置し、`/agentdev/integrity-check` command は薄い入口として維持する。

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

`agentdev-epic-tracker`: 親Epic Issueのステータス追跡テーブル（`| # | Issue | ステータス | 内容 |` 4列形式）を更新する知識ベース。ステータス値は `☐ 未着手` / `🔄 進行中` / `✅ 完了 (PR#N: URL)` / `❌ 対処不要` の4値。`case-run` Phase A で `🔄 進行中` に更新し、`case-close` Step 8 で `✅ 完了 (PR#N: URL)` に更新する。`❌ 対処不要` は手動設定のみの終了状態。Epic自動クローズ判定では `❌ 対処不要` を `✅ 完了` と同等の終了状態として扱う。多重Issueモードでは親エージェントがWave開始前に一括更新する。

### 自律修正ループ（Self-Healing Loop）

`case-run` の Step 11a（ローカル検証）および Step 11c（CI/CD検証）で、検証失敗時にユーザー判断を待たずに実装フェーズ（Step 6）へループバックし自律的に修正を試みる仕組み。

**カウント規則**: 11a と 11c のカウントは独立管理。最大各3回。

**修正範囲**: 既存要件範囲内の実装・テスト・設定不備に限定。要件変更・仕様判断・スコープ変更を伴う修正は禁止。

**停止条件**（7項目のいずれかに該当で即座停止・ユーザー報告）: (a) 要件・仕様・スコープ変更必要、(b) REQ・ADR・specs変更判断必要、(c) 既存仕様逸脱、(d) 破壊的変更必要、(e) 外部サービス・CI環境・権限・Secrets不足、(f) flaky判別不能、(g) 3回上限超過。

**テスト期待値**: テストが間違っていると自律判断できる場合のみ修正対象。判別不能時は停止条件に該当。

**3回超過時の報告内容**: 失敗項目一覧、エラーログ要約、各試行の修正内容、原因候補、停止の判断理由。

**責務分離**: `case-close` はCI/CD通過確認のみ（失敗時は case-run に差し戻し）。`case-update` はCI/CD修正の管轄外（REQ更新・レビューNGコメント・Issue本文更新のみ）。

### case-close 達成判定プロトコル

`case-close` Step 2 でIssue本文の未チェック項目に対して達成判定を行う。即時停止ではなく、5条件プロトコル（完了状態特定・証拠存在・直接対応・反証なし・理由記録可能）に基づき根拠付きで判定する。達成→`[x]`更新、未達→自律解決判定へ進む。

**自律解決判定**: 5条件プロトコルで達成不可の項目について、PR diffの変更対象分類×チェックボックス要求検証種別分類に基づき自律解決可否を判定する。検証適用不能（変更対象に対して要求検証が直接証拠にならない）または代替検証実施（代替手段で直接証拠を得られる）の場合→`[x]`更新（適用不能理由を記録）。自律解決不能→`[ ]`維持。Issue本文更新後に再取得・再検証し、未達項目残存時は構造化エラーで停止する。全項目達成時のみPR merge/Issue closeに進む（REQ-0106〜022）。

**証拠ソース**: PR本文、PR差分、コミット内容、CI結果、Issueコメント、PRコメント、実装済みファイル内容。

**責務境界**: `case-run` のチェックボックス更新責務は維持される。`case-close` は最終セーフティネットとして動作する（REQ-0106, 014）。

### Post-Run Capture

`case-run` および `case-close` での本筋外発見の退避仕様。

詳細は以下を参照:
- split rule（intake / learning 境界）: [capture-boundaries.md](../../.opencode/skills/agentdev-workflow-lifecycle/reference/capture-boundaries.md)
- case-run 退避方針: [case-run.md](../../.opencode/commands/agentdev/case-run.md) Guardrails
- case-close post-run capture: [case-close.md](../../.opencode/commands/agentdev/case-close.md) Steps

### 関連ドキュメントの要件達成対象化

実装コード・設定だけでなく、関連ドキュメント（README.md、system.md、patterns.md、guides等）も要件達成の一部として扱う。全パターン（A/B/C/D）共通。

**探索責務**（`case-run` Step 6）: 実装コード・設定・スキーマ・cron・環境変数・API・関連ドキュメントを対象に影響範囲を探索する。req-defineに明記されていないことを理由に更新対象外にはできない（SHALL）。

**更新責務**（`case-run` Step 10）: 変更後仕様と矛盾する既存ドキュメントを同一Issue内で更新する。更新漏れがある場合は要件未充足とみなす（SHALL）。

**完了確認**（`case-close` Step 3）: 実装コード・設定・関連ドキュメントが要件と矛盾していないことを確認する（SHALL）。旧仕様の記述が残っている場合、変更後仕様と矛盾しないことを確認する（SHALL）。矛盾するドキュメント更新漏れがある場合は完了不可（SHALL）。

**req-define の責務**: 関連ドキュメントの個別ファイル列挙をユーザーに求めない。責務は要件の壁打ち・構造化に専念する。

### REQ体系基準構造

旧REQ群（REQ-0001〜0040）を現行仕様基準として再構成した新基準REQ群（REQ-0101〜0109）を主参照とする。旧REQは履歴として保持し、分類（retained / partially superseded / superseded）に基づき扱う。

**新基準REQ群構成**（REQ-0109 に基づく）:

| REQ | 領域 |
|-----|------|
| REQ-0101 | REQ/ADR/SPEC/DOC-MAP基準構造 |
| REQ-0102 | req-define / req-save / REQ分類ゲート |
| REQ-0103 | Command/Skill/Template/Script責任分界 |
| REQ-0104 | AgentDevFlow command protocol |
| REQ-0105 | intake/learning/backlog-review/backlog-save/RU lifecycle |
| REQ-0106 | case-run/case-close/post-run capture |
| REQ-0107 | reporting/GitHub body/link/writing quality |
| REQ-0108 | integrity/validation/tests |
| REQ-0109 | REQ再構成運用 |

**旧REQ分類**:
- `retained`: 現行仕様としてそのまま有効（15件）
- `partially superseded`: 一部が新基準REQに移行、残りは現行有効（19件）
- `superseded`: 全面置き換え済み、履歴参照のみ（5件）

**対応表**: `docs/requirements/mapping-table.md` に旧REQ↔新基準REQの全40件の対応関係を記録。

### REQ分類ゲート

`req-define` / `req-save` に反映作業混入防止のゲートを設ける（REQ-0109〜016）。

**反映作業の定義**: 更新・削除・移動・名称変更・廃止・置換・参照修正・インデックス修正・整合性修正。

**req-define 分類ゲート**（Step 4c）: 要件展開後に各候補を「変更後仕様」/「反映作業」に分類する。反映作業のみの候補は独立要件行として採用しない（SHALL）。

**req-save 分類ゲート**（Step 3a）: CREATE対象REQの保存前に、要件行に反映作業のみの行が混入していないか検査する。検出時は保存を停止し、該当行・理由・移送先を報告する（SHALL）。
