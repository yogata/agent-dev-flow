# single workflow: 単一 Issue 実行（single）

> 本 reference は `agentdev-workflow-case-run` SKILL.md の single workflow 詳細である。STEP-S1〜S3（フェーズ判定から前置 gate 群まで）と STEP-S6（クリーンアップ・完了報告）を所有する。STEP-S4/S5 は [references/delegation-and-result.md](delegation-and-result.md) を参照。

## 目次

- STEP-S1: フェーズ判定・再開ポイント検出
- STEP-S2: Issue 抽出・確認・判定
- STEP-S3: Worktree 作成・ブランチ準備・前置 gate 群
- STEP-S6: worktree クリーンアップ確認・完了報告

## STEP-S1: フェーズ判定・再開ポイント検出

### Purpose

実行モード（single / epic-wave）を確定し、durable state から再開フェーズを判定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（`agentdev-gh-cli` 読取）、Epic Issue 本文（ステータス追跡テーブル有無）
2. identifier 保持: Issue番号（ユーザー入力またはセッション内会話）
3. 最小 scalar: なし
4. runtime artifact: なし（会話コンテキストのみに依存しない）

### Preconditions

- case-run command から Issue番号または URL が渡されている

### Procedure

`agentdev-workflow-orchestration` に従い再開フェーズを判定する（Issue番号解決、引数パース、妥当性確認、実行パス分岐、成果物チェックの詳細は同 skill 参照）。再開が必要なフェーズをユーザーに通知する（準備フェーズから開始する場合は省略）。実行モード分岐: 引数が Epic Issue 番号の場合は epic-wave workflow（[references/epic-wave.md](epic-wave.md)）へ。それ以外は本 workflow（STEP-S2）へ。

**前工程からの引き継ぎ停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐する（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）。self-hosting リポジトリでは履歴メタデータとして通常の case workflow を実施、consumer リポジトリでは実装を開始せず停止し agent-dev-flow repository への手動取り込み対象として報告する。

### Result

- 実行モード確定（single）、再開フェーズ判定結果、引き継ぎ停止判定結果

### Evidence

- Issue 本文読取結果、実行モード分岐の根拠（Epic 判定の有無）

### Completion Verification

- Issue番号が解決済みであり、実行モードが一意に確定していること

### Resume-Idempotency

- 再実行時は同じ durable state（Issue 本文、worktree・PR の存在）から同一のモード分岐・フェーズ判定に到達する。判定に副作用を持たない

## STEP-S2: Issue 抽出・確認・判定

### Purpose

対象 Issue の実行に必要な情報を抽出し、実行契約の消費境界を適用する。

### Input Resolution

1. SSoT 再構成: Issue 本文（要件doc、受け入れ基準、execution contract セクション）、`docs/decisions/README.md` と関連 Decision 本文
2. identifier 保持: Issue番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-S1 で single 実行モードが確定している

### Procedure

- Issue本文から要件docと受け入れ基準を抽出する（べき等性: worktree とブランチが既に存在する場合、STEP-S3 の作成処理をスキップする）。`agentdev-req-analysis` のチェックボックス品質基準で検証する
- 関連Decision特定: `docs/decisions/README.md` を読み込み、関連Decisionがあれば個別に読み込み、実装がDecisionの決定事項に矛盾しないことを確認する
- work_type 判定: `agentdev-workflow-lifecycle` に従い bugfix/feature/maintenance/docs_chore を判定する（scale は feature のみ standard/large、workflow_route は都度導出し保存しない）
- **execution contract 消費境界**: 完了条件、test strategy、必須品質統制を実行契約として扱う。不足・曖昧さ・矛盾・実現不能を検出した場合は自律補完せず blocked とする。test strategy を新規設計せず記録済み項目を実行する。必須品質統制の適用要否を再判断しない。work_type/scale/Issue structure を再分類して実行契約を変更しない
  - runtime-only 判断の維持: worktree 状態確認、QG-3 前置 staleness check、実 diff 検査、実装結果・test 実行結果は case-run の安全検査として維持する
  - blocked 遷移と case-update 連携: 完了条件の不足・曖昧さ・矛盾・実現不能、scope-affecting impact candidate の発見、関連 ADR への適合確認で新たな拘束の必要性検出、必須品質統制の追加変更必要性、Issue metadata・構造・実態の矛盾検出時は blocked とし、Issue 更新は case-update へ委譲する（case-run 単独では Issue 本文を書き換えない）
  - 新旧 Issue 互換運用: execution contract 必須セクション（Execution Contract セクション、必須品質統制セクション）存在有無で新旧 Issue を識別する（presence-based 判定）。必須セクション不存在の legacy Issue は、新契約項目欠落のみを理由に一律 blocked にしない
  - work_type/scale 確認の縮約: work_type 確認は再分類ではなく metadata 整合確認へ縮約して維持する

### Result

- 要件doc・受け入れ基準抽出済み、関連Decision確認済み、work_type metadata 整合確認済み、execution contract 消費境界適用済み

### Evidence

- Issue 本文読取結果、関連Decision 一覧、消費境界判定結果（blocked 時はその理由）

### Completion Verification

- 抽出情報が Issue 本文と一致し、実行契約の消費原則適用判断が記録されていること

### Resume-Idempotency

- Issue 本文からの抽出は読取のみで副作用を持たない。再実行時は同一の抽出結果になる

## STEP-S3: Worktree 作成・ブランチ準備・前置 gate 群

### Purpose

実行担当サブエージェント起動前の隔離環境を整え、前置 gate 群を合格させる。

### Input Resolution

1. SSoT 再構成: 対象 Issue 本文（変更対象ファイル等）、Epic Issue 本文（STEP-S3-1 親Epic ステータス更新時）
2. identifier 保持: Issue番号、ブランチ名（自動生成または指定）
3. 最小 scalar: L2 タイムスタンプ（本 Step 開始・終了時刻、JST）
4. runtime artifact: なし

### Preconditions

- STEP-S2 完了（Issue 判定済み）

### Procedure

- **Worktree 作成・ブランチ準備**: `agentdev-git-worktree` に従って実行する。ベースブランチを明示的に指定する。べき等チェック: worktree 既存時は作成をスキップする。Wave 実行時、PR merge 後再開時は worktree 作成前に `git fetch origin` を実行しベースの鮮度を確認する
- **L2 タイムスタンプ計測**: 本 Step の開始時刻・終了時刻（JST）を記録し、worktree 設定時間を計測する（完了報告の L2 内訳に含める）
- **STEP-S3-1 親Epic ステータス更新**: `agentdev-epic-tracker` 参照
- **STEP-S3-2 worktree precondition gate**: `agentdev-git-worktree` の「worktree 内判定ヘルパー」に従い、当該 Issue の worktree+ブランチが作成済みであり、現在 worktree 内にいることを検証する。検証失敗時（worktree 未作成、メインリポジトリにいる）は実行担当サブエージェントを起動せず停止し、STEP-S3 へ戻るようユーザーに報告する
- **STEP-S3-3 QG-3 前置 staleness check**: `agentdev-quality-gates` の「case-run 前置 staleness check」に従い、ファイルパス現行存在確認、検査結果件数再計測、差異検出時の引き渡し・case-update 連携を実行する。本検査は QG-3 本体（委譲先が実施する PR 作成直前ゲート）とは独立した前置検査であり、QG-3 deviation 分類運用、QG-3 本体実施要否には影響しない
- **STEP-S3-4 docs/** 変更時の targeted docs guard: PR 対象ファイルに docs/** 変更を含む場合、委譲前に targeted docs guard を行う（`bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow case-run --base-ref <ベース> --json`、変更ファイルは worktree 内の git diff から取得。モード使い分けの標準は コミット前の worktree 上での検証 = `--base-ref`、コミット後・PR 作成後の main 環境 = `--files`。PowerShell で `--files` に複数パスを渡す場合は配列変数経由または個別渡しとし、引用符まとめ渡しは使用しない）。docs/** 変更を含まない PR ではスキップする。検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` に `### docs-integrity` 小見出しで記録する（実行担当サブエージェント責務）
- **STEP-S3-5 配布依存境界の事前委譲チェック（オプション）**: PR 対象ファイルに `src/opencode/{commands,skills}/**` 変更を含む場合、委譲前に事前チェックを実施できる。本チェックは予備的であり、本式の最終 gate は STEP-S5（実装後）で実行される。事前チェックで違反を検出した場合は委譲プロンプトで実行担当サブエージェントに引き渡す

**case-run が使用する検査ツール**（integrity 契約 SPEC「Workflow × 使用ツールマトリックス」参照）: check_changed_docs.ts（--workflow case-run、docs/** 変更を含む場合に委譲前に実行）、check_extensions.ts（`.opencode/commands/agentdev/**/*.md`、`.opencode/skills/agentdev-*/SKILL.md`、`.opencode/skills/agentdev-*/references/**/*.md`、`.agentdev/extensions/**` のいずれかを変更した場合に実行）、check_distribution_boundary.ts（--profile source、STEP-S5 で実装後 worktree の実際の配布ソース面を検査）、test_strategy（Issue 完了条件検証）

**checker コマンドの stdout 退避形式**: 上記 checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出等の観測対象）であるため、実行と stdout 取得は `agentdev-gh-cli` READ 手続きの「exit code が意味を持つコマンドの stdout 退避形式」に従う（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。非ゼロ exit 時も JSON レポート（stdout）を Evidence として保持し、`>` リダイレクトや PowerShell 変数格納で退避しない。

### Result

- worktree+ブランチ作成済み（べき等）、前置 gate 群の判定結果、L2 タイムスタンプ記録済み

### Evidence

- worktree・ブランチの存在確認結果、各 gate の実行結果（JSON 等）、L2 タイムスタンプ

### Completion Verification

- STEP-S3-2 precondition gate が合格していること（不合格の場合は次 STEP へ進まない）

### Resume-Idempotency

- worktree・ブランチ既存時は作成をスキップする。gate 群は再実行可能であり、同一 worktree 状態に対して同一判定を返す

## STEP-S6: worktree クリーンアップ確認・完了報告

### Purpose

委譲 result を受領した後の worktree 状態を確認し、L2 内訳を含む完了報告を出力する。

### Input Resolution

1. SSoT 再構成: 委譲 result（PR URL、Issue コメント）、worktree の git status
2. identifier 保持: Issue番号、PR番号
3. 最小 scalar: L2 タイムスタンプ（本 Step 開始・終了時刻、JST）
4. runtime artifact: なし

### Preconditions

- STEP-S5 で result 処理完了（completed-pr 時は最終 gate 合格後）

### Procedure

- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
- 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness 側の責務であり（charter 原則、harness 分離モデル SPEC 参照）、case-run は関与しない
- 完了報告 template に従って出力する（実行担当サブエージェント result 状態、PR番号を含める）
- 本 Step（worktree クリーンアップ）の開始時刻・終了時刻（JST）を記録し、worktree クリーンアップ時間を計測する。完了報告に L2 タイムスタンプ内訳（worktree 設定時間、実行担当サブエージェント実行時間、worktree クリーンアップ時間）を含める

### Result

- worktree 状態確認結果、完了報告（result 状態、PR番号、L2 内訳）

### Evidence

- git status 結果、完了報告出力

### Completion Verification

- 完了報告に result 状態と L2 内訳が含まれていること

### Resume-Idempotency

- 報告のみの STEP であり副作用を持たない。再実行時は最新の git status と result から再構成する

## 関連 STEP

- 前: STEP-S5（delegation-and-result.md）
- 次: なし（workflow 終了）

## 関連 Capability Skill

- `agentdev-git-worktree`: worktree 作成、worktree 内判定ヘルパー
- `agentdev-epic-tracker`: 親Epic ステータス更新
- `agentdev-quality-gates`: QG-3 前置 staleness check
- `agentdev-workflow-orchestration`: 再開フェーズ判定
- `agentdev-req-analysis`: チェックボックス品質基準

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G04（全ファイル操作は worktree 内で実行）
- G30・不変条件（STEP-S3 precondition gate、worktree root 相対パス引き渡し）
- G33・不変条件（QG-3 前置 staleness check、差異検出時の引き渡しと case-update 連携）

## 関連ガイドライン

- **テスト戦略（TS）標準手順**: 関数削除を伴う Issue の test strategy には、削除対象関数の全使用箇所 grep 確認手順を含める（L-014、PR #1140 / #1139 Epic #1138 由来。詳細は `agentdev-req-analysis` 参照）
- **エラー処理**: エラー発生時の対応は `agentdev-workflow-orchestration` に従う。result が blocked/failed の場合、Issue コメント（SSoT）を参照して停止理由、再開ポイントをユーザーに報告する
