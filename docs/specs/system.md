# System Specification

## コマンドシステム

### AgentDevFlow コマンド群

AgentDevFlow（`/agentdev/*` コマンド体系）は3つのパイプラインで構成され、開発ワークフローを提供する。コマンドごとに適切なagentをfrontmatterに指定。対話系コマンド（req-define）は prometheus、ファイル操作系コマンドは sisyphus。

#### req/case パイプライン

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち）。単体実行時にStep 0でセッションコンテキスト検知を行い、既存要件情報を推論・引き継ぎして適切なStepへルーティングする | prometheus |
| `/agentdev/req-save` | 要件定義の保存 | sisyphus |
| `/agentdev/spec-save` | SPEC候補の保存・確定（req-define で分離された SPEC候補を `docs/specs/` へ。feature かつ SPEC候補がある場合のみ） | sisyphus |
| `/agentdev/case-open` | Issue登録（Epic + 子Issue一括作成対応） | sisyphus |
| `/agentdev/case-run` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。Step 11にローカル検証・デプロイ検証を含み、各検証失敗時の自律修正ループ（最大3回）を備える。複数Issueの並列実行に対応 | sisyphus |
| `/agentdev/case-update` | Issue更新 | sisyphus |
| `/agentdev/case-close` | 完了処理（達成判定プロトコル付き完了ゲート: 未チェック項目の即時停止→根拠探索→[x]更新→構造化エラーの段階的フロー） | sisyphus |
| `/agentdev/case-auto` | 最大自走モード。要件docから req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close を順次自走実行（明示指定時のみ。標準ワークフローの置き換えではない） | sisyphus |

#### learning パイプライン

学びの2層パイプライン（キャプチャ→昇華）を提供する。基本方針は「実観測ベース、出口を厳しく」。

| コマンド/スキル | 役割 | 層 | 特徴 |
|---|---|---|---|
| `agentdev-learning-capture`（スキル） | エージェント主体で学びを検知・抽出・自律蓄積 | キャプチャ層 | 13項目形式、実観測ベース（実際に検知・回避・修正した問題のみ）、ユーザー承認なしで直接inbox.mdに蓄積 |
| `/agentdev/learning-promote` | learning entry を分析・分類・昇華判定し、promoted artifact を生成する。promoted artifact は backlog-review 経由で RU 化する | 昇華層 | 11処分区分+duplicate、既存対策照合、promote時prune（必須）、`agentdev-learning-pipeline` skill参照 |

**データフロー**: `inbox.md` + `archive/active.md` →（learning-promote で分析・分類・昇華判定・HITL確認・実行）→ `promoted/`（フラット構造）→（backlog-review）→ `.agentdev/backlog/req-units/RU-*.md`

**エントリ形式**: 13項目形式（問題事象/発生局面/検知方法/根本原因/自律対応内容/ユーザー確認有無/ADR・REQ・spec影響/横展開観点/再発条件/予防策候補/想定反映先/関連/タグ）

**データファイル**:
- `inbox.md`: 未整理 learning entry の active queue。capture で蓄積し、promote 成功後にクリアされる。永続ストレージではない
- `archive/active.md`: living pool（終端保管ではない。`archive` は終端保管を意味しない）。未処分・保留中・再評価対象の entry を保持し、promote の入力として参照される。prune・promote時pruneで動的に変化
- `promoted/`: 昇華判定済み artifact の配置先（フラット構造）。backlog-review が読み込み、RU 生成成功後に削除。promoted artifact は backlog-review 経由で RU 化する

**反映ルート**: promoted artifact → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define`（RU を読み込み）→ `/agentdev/req-save` → `/agentdev/spec-save`（SPEC候補がある場合）→ `/agentdev/case-open` → `/agentdev/case-run`

#### intake ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/intake-capture` | 手動で気づき・課題を `.agentdev/intake/inbox/` に素早く記録 | sisyphus |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出して `.agentdev/intake/inbox/` に保存 | sisyphus |
| `/agentdev/intake-promote` | inbox item を内部レビュー・HITL確認後に promoted artifact（フラット構造）に整形し、`promoted/` に保存。frontmatter は持たない | sisyphus |

intake 系コマンドは `.agentdev/intake/` 更新前後に git 永続化を実行する（REQ-0108）:
- 実行前同期: `.agentdev/intake/` 更新前に `git pull --ff-only` を実行し、リモートの最新状態を取得
- scoped commit + push: 更新後に `.agentdev/intake/` 配下のみを `git add` → commit → push

#### integrity ワークフロー

docs-check は `/repo/*` コマンド体系の配布対象リポジトリ内コマンドである（ADR-0106、REQ-0108-156）。AgentDevFlow の配布コマンドではなく、AgentDevFlow本体リポジトリの自己監査コマンドである。

| コマンド | 役割 | エージェント |
|---|---|---|
| `/repo/docs-check` | AgentDevFlow本体リポジトリの自己監査（配布対象外） | sisyphus |

#### inspect ワークフロー

| コマンド | 役割 | エージェント |
|---|---|---|
| `/agentdev/inspect-docs` | docs 全体の意味整合レビューと REQ 再構成診断（REQ-0109） | prometheus |
| `/agentdev/inspect-skills` | Command/Skill 参照妥当性・構造の検出（REQ-0125） | prometheus |
| `/agentdev/inspect-promote` | 検出 finding の分類・昇格（REQ-0126） | prometheus |

### 品質ゲート

品質ゲート（QG-1〜QG-4）は `docs/specs/quality-gates.md` で定義する。case-run が QG-1〜QG-3（ローカル検証・CI検証・乖離検出）、case-close が QG-4（最終完了判定ゲート）を担う。詳細は同 SPEC および `agentdev-quality-gates` skill を参照。

### 安全性スキル

`agentdev-gh-cli`: Windows PowerShell環境でのgh CLI使用時の安全性を確保する。WRITE操作（`[System.IO.File]::WriteAllText` + `UTF8Encoding($false)` でBOMなしUTF-8ファイル作成、`--body-file` / `-F` 経由で指定）、READ操作（Node.js `execSync` でpwshパイプラインをバイパスしUTF-8出力を直接取得）、VERIFY操作（書き込み後の読み戻し検証）の3つをカバーし、文字化け防止と内容品質を担保する。VERIFY操作は4観点（エンコーディング・Markdown構造・テンプレート必須セクション・リポジトリ参照リンク正規化）で検証し、失敗時は3段階分類（同一内容リトライ・内容再生成・停止・ユーザー報告）で対応する。リポジトリ参照リンク正規化は `verify_body.ts` の `checkLinkNormalization` で実行し、Markdownリンク内の相対パス・裸パスを検出する。case-open、case-run、case-close、case-updateの各書き込み操作後に適用する。

### 整合性検査スキル

`repo-agentdev-integrity`: AgentDevFlow本体リポジトリの横断的整合性検査の orchestration を担う配布対象外スキル（ADR-0106）。AgentDevFlow の配布対象外であり、適用プロジェクトでは利用しない。検査カテゴリ（REQ/ADR/Skill/Command/Template/Workflow/Link/Canonical/Lifecycle/Namespace）に基づき、`docs/`・`src/opencode/`・`.opencode/` 下の全文書 artifact をスキャンし、inventory整合性・link整合性・canonical境界・lifecycle境界・旧namespace残存・frontmatter禁止フィールド検査を実施する。ADR 検査は current ADR collection（`docs/adr/ADR-01XX.md`）と retired ADR collection（`docs/adr/retired/ADR-00XX.md`）を区別する（REQ-0112-050）。frontmatter検査は dev メタデータの混入を検出する（REQ-0108-022/024/028, REQ-0108-095~098）。ReferencePath検査は per-reference OK結果に `file`/`line`/`evidence` を含め（REQ-0108-117）、同一skill内裸参照を許容し（REQ-0108-118）、別skillにのみ存在する裸参照を strict NG として検出する（REQ-0108-119）。Finding 分類（document-drift/broken-reference/obsolete-structure/canonical-conflict/workflow-gap/integrity-rule-gap）と route 判定（intake, intake+learning, req-define, learning, none）を定義する。結果分類（NG/warning/info）、レポート Schema（JSON/Markdown）、レポート出力先: `.agentdev/integrity/reports/`。スクリプト実体は `repo-agentdev-integrity/scripts/` 配下に配置し、`/repo/docs-check` command は薄い入口として維持する。配布対象外であるため `src/opencode/` に原本を持たず、`.opencode/` に直接配置される。語彙レジストリは `repo-agentdev-integrity/references/vocabulary-registry.md` に配置する。

### .opencode/ ディレクトリ責務

`.opencode/` ディレクトリは OpenCode プラグイン設定の配置先である（ADR-0105）。原本は `src/opencode/` に配置し、`.opencode/` は junction/symlink による配置先として機能する。

**配置対象**:
- `commands/`: コマンド定義ファイル（原本: `src/opencode/commands/`）
- `skills/`: スキル定義ファイル（原本: `src/opencode/skills/`）
- プラグイン設定ファイル
- custom tool 設定
- 依存 manifest（runtime に必要なもののみ）

**配置対象外**（許可される配置先は「スクリプト配置方針」を参照）:
- 汎用 TypeScript 検証プロジェクト（`.opencode/src/`、`.opencode/tests/`、`package.json`、`tsconfig.json` 等）は、`.opencode/` 配下ではなく repo-local 検証用ディレクトリに配置する
- 検証コード・実装コードは、`.agentdev/`（AgentDevFlow の domain state directory）ではなく、各 skill 配下の `scripts/` または `repo-agentdev-integrity/scripts/` に配置する

### スクリプト配置方針

スキル同梱スクリプトは該当 skill 配下の `scripts/` に配置する。各スクリプトは TypeScript (bun runtime) で実装し、共通 CLI 契約に準拠する。

**配置ルール**:

| 用途 | 配置先 | 例 |
|------|--------|-----|
| skill 専用スクリプト | `<skill>/scripts/` | `agentdev-gh-cli/scripts/verify_body.ts` |
| 横断的検査スクリプト | `repo-agentdev-integrity/scripts/`（repo-local） | `repo-agentdev-integrity/scripts/check_integrity.ts` |
| 共通 CLI ユーティリティ | `repo-agentdev-integrity/scripts/cli_utils.ts`（repo-local） | `parseArgs`, `formatJsonReport` 等 |

**共通 CLI 契約**:
- `--help`, `--json`, `--dry-run` オプションをサポートする
- exit code: 0 (OK), 1 (NG/warning), 2 (error)
- stdout = 機械可読出力、stderr = 診断メッセージ
- 非対話実行（プロンプト禁止）
- 破壊的変更禁止（自動修正は別モード）

**テスト**:
- テストファイルはスクリプトと同ディレクトリに `*.test.ts` として併置する
- `bun test` で実行可能であること

**配置先の限定**:
- TypeScript スクリプト・テストコードは `<skill>/scripts/` または `repo-agentdev-integrity/scripts/` に配置する（`.opencode/src/`・`.opencode/tests/`・`.opencode/tsconfig.json`・`.agentdev/` は配置対象外）
- スクリプト言語は TypeScript (bun runtime) を使用する（既存の Shell / Python スクリプトは維持）

### テスト・Package Manifest 配布方針

コマンド・スキルの配布時におけるテスト・package manifest の取り扱い:

- runtime に必要な manifest のみ配布する
- テストファイルは配布対象外とする
- テスト・package manifest は各 skill 配下に一元配置する
- 配布対象は一元管理する
- 配布制御は `.gitignore` ではなく配布時 exclude で行う

### Epic（大規模Issue分割フロー）

規模判定条件（3条件のいずれか1つ）を満たす場合、`scale: large`（Epic）として扱う:
1. 複数モジュール跨ぎ（UI + API + DB等）
2. 単一PRでのPR肥大化リスク
3. 段階的リリースが必要

**ワークフロー**: `/agentdev/req-define`（規模判定）→ `/agentdev/req-save` → `/agentdev/spec-save`（SPEC候補がある場合）→ `/agentdev/case-open`（Epic + 子Issue一括作成）→ `/agentdev/case-run`（子Issue並列実行）→ 各 `/agentdev/case-close` → Epic自動クローズ

**データフロー**: 1ドラフト → 1 REQ → Epic + N子Issue（REQ分割なし）

### Issueテンプレートの完了条件セクション

Issueテンプレート（`issue_desc_*.md`）に`完了条件`セクションを【必須】項目として配置する。

**適用テンプレート**: `issue_desc_feature.md`, `issue_desc_bug.md`, `issue_desc_child.md`, `issue_desc_backlog_child.md`

**Epicテンプレートの扱い**: `issue_desc_epic.md`, `issue_desc_backlog_epic.md`には`完了条件`セクションを追加せず、既存の`完了条件`にEpic全体の完了判定条件としての明確化コメントを付与する。

**コマンドへの反映**: `case-open`のguardrailで`完了条件`を必須セクションとして確認する。`case-run`は実装計画（Plan）の参照先として`完了条件`を使用するが、完了条件チェックボックスの評価・更新は行わない（case-close QG-4 の専任責務、ADR-0114）。

### Epic自動クローズ

`case-close` Step 8 で親Epic本文更新後、Epic内の全子Issue状態を確認し、全完了時にEpicを自動クローズする。子Issue残存時はスキップし完了報告に状況を表示する。

### Epicステータス追跡

`agentdev-epic-tracker`: 親Epic Issueのステータス追跡テーブル（`| # | Issue | ステータス | 内容 |` 4列形式）を更新する知識ベース。子Issue 実行状態 enum は `pending` / `ready` / `running` / `completed` / `blocked` / `failed` の6値（REQ-0106-030、workflow-contracts.md「子Issue実行状態 enum」参照）。`⏭スキップ` は採用しない。`case-auto` が子Issue を選択して `case-run` に渡す際に `running` に更新し、`case-close` 完了時に `completed` に更新する。`blocked` は自動継続不可、`failed` は実行失敗を示す終了状態。Epic自動クローズ判定では `completed` を終了状態として扱う。Wave status は保存せず、Wave 内 Issue 状態から導出する。

### 自律修正ループ（Self-Healing Loop）

`case-run` の Step 11-1（ローカル検証）および Step 11-3（CI/CD検証）で、検証失敗時にユーザー判断を待たずに実装フェーズ（Step 6）へループバックし自律的に修正を試みる仕組み。

**カウント規則**: 11-1 と 11-3 のカウントは独立管理。最大各3回。

**修正範囲**: 既存要件範囲内の実装・テスト・設定不備に限定。要件変更・仕様判断・スコープ変更を伴う修正は禁止。

**停止条件**（7項目のいずれかに該当で即座停止・ユーザー報告）: (a) 要件・仕様・スコープ変更必要、(b) REQ・ADR・specs変更判断必要、(c) 既存仕様逸脱、(d) 破壊的変更必要、(e) 外部サービス・CI環境・権限・Secrets不足、(f) flaky判別不能、(g) 3回上限超過。

**テスト期待値**: テストが間違っていると自律判断できる場合のみ修正対象。判別不能時は停止条件に該当。

**3回超過時の報告内容**: 失敗項目一覧、エラーログ要約、各試行の修正内容、原因候補、停止の判断理由。

**責務分離**: `case-close` はCI/CD通過確認のみ（失敗時は case-run に差し戻し）。`case-update` はCI/CD修正の管轄外（REQ更新・レビューNGコメント・Issue本文更新のみ）。

### case-close 達成判定プロトコル

`case-close` Step 2 でIssue本文の未チェック項目に対して達成判定を行う。即時停止ではなく、5条件プロトコル（完了状態特定・証拠存在・直接対応・反証なし・理由記録可能）に基づき根拠付きで判定する。達成→`[x]`更新、未達→自律解決判定へ進む。

**自律解決判定**: 5条件プロトコルで達成不可の項目について、PR diffの変更対象分類×チェックボックス要求検証種別分類に基づき自律解決可否を判定する。検証適用不能（変更対象に対して要求検証が直接証拠にならない）または代替検証実施（代替手段で直接証拠を得られる）の場合→`[x]`更新（適用不能理由を記録）。自律解決不能→`[ ]`維持。Issue本文更新後に再取得・再検証し、未達項目残存時は構造化エラーで停止する。全項目達成時のみPR merge/Issue closeに進む（REQ-0106〜022）。

**証拠ソース**: PR本文、PR差分、コミット内容、CI結果、Issueコメント、PRコメント、実装済みファイル内容。

**責務境界**: 完了条件チェックボックスの評価・更新は `case-close` QG-4 の専任責務である（ADR-0114）。`case-run`・実行担当サブエージェント・外部実行バックエンドは完了条件チェックボックスを更新しない。`case-close` は `case-run` / 実行担当サブエージェントとは別コンテキストで、PR 作成後に独立して完了条件を再読込して最終完了判定する。

### Post-Run Capture

`case-run` および `case-close` での本筋外発見の退避仕様。

Capture 境界の一次参照は `agentdev-workflow-orchestration` skill の `references/capture-boundaries.md` に定義する。詳細は以下を参照:
- capture 境界定義（intake / learning 境界・Split Rule・コマンド責務境界）: `agentdev-workflow-orchestration/references/capture-boundaries.md`
- case-run 退避方針: [case-run.md](../../.opencode/commands/agentdev/case-run.md) Guardrails
- case-close post-run capture: [case-close.md](../../.opencode/commands/agentdev/case-close.md) Steps

### 関連ドキュメントの要件達成対象化

実装コード・設定だけでなく、関連ドキュメント（README.md、system.md、patterns.md、guides等）も要件達成の一部として扱う。全 work_type 共通。

**探索責務**（`case-run` Step 6）: 実装コード・設定・スキーマ・cron・環境変数・API・関連ドキュメントを対象に影響範囲を探索する。req-defineに明記されていないことを理由に更新対象外にはできない。

**更新責務**（`case-run` Step 10）: 変更後仕様と矛盾する既存ドキュメントを同一Issue内で更新する。更新漏れがある場合は要件未充足とみなす。

**完了確認**（`case-close` Step 3）: 実装コード・設定・関連ドキュメントが要件と矛盾していないことを確認する。旧仕様の記述が残っている場合、変更後仕様と矛盾しないことを確認する。矛盾するドキュメント更新漏れがある場合は完了不可。

**req-define の責務**: 関連ドキュメントの個別ファイル列挙をユーザーに求めない。責務は要件の壁打ち・構造化に専念する。

### REQ体系基準構造

旧REQ群（REQ-0001〜0050 [全てretired]）を現行仕様基準として再構成した新基準REQ群（REQ-0101〜REQ-0133、REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は retired）を主参照とする。旧REQは履歴として保持し、移行分類（migrated / retired-no-successor / historical-only）に基づき扱う（REQ-0109）。

**新基準REQ群構成**（REQ-0109 に基づく）:

active REQ の一覧・範囲は `docs/requirements/README.md` を正とする（REQ-0101〜REQ-0133、25件）。本SPECではREQ一覧を複製せず、README.md を参照する。

**旧REQ移行分類**（REQ-0109, mapping-table.md）:
- `migrated`: 新active REQへ要件内容を移行した
- `retired-no-successor`: 最新方針では不要なため新active REQへ移行しない
- `historical-only`: 当時の判断・経緯として残すが現行要件ではない

**対応表**: `docs/requirements/mapping-table.md` に旧REQ↔新基準REQの全50件の対応関係を記録。

### REQ分類ゲート

`req-define` / `req-save` に反映作業混入防止のゲートを設ける（REQ-0109〜016）。

**反映作業の定義**: 更新・削除・移動・名称変更・廃止・置換・参照修正・インデックス修正・整合性修正。

**req-define 分類ゲート**（Step 4c）: 要件展開後に各候補を「変更後仕様」/「反映作業」に分類する。反映作業のみの候補は独立要件行として採用しない。

**req-save 分類ゲート**（Step 3a）: CREATE対象REQの保存前に、要件行に反映作業のみの行が混入していないか検査する。検出時は保存を停止し、該当行・理由・移送先を報告する。
