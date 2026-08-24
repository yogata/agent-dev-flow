# single workflow: 単一 Issue 実行（single）

> 本 reference は `agentdev-workflow-case-run` SKILL.md の single workflow 詳細である。
> STEP-S1〜S3（フェーズ判定から前置 gate 群まで）と STEP-S6（クリーンアップ・完了報告）を所有する。
> STEP-S4/S5 は [references/delegation-and-result.md](delegation-and-result.md) を参照。

## 目次

- STEP-S1: フェーズ判定・再開ポイント検出
- STEP-S2: Issue 抽出・確認・判定
- STEP-S3: Worktree 作成・ブランチ準備・前置 gate 群
- STEP-S6: worktree クリーンアップ確認・完了報告

## STEP-S1: フェーズ判定・再開ポイント検出

### Purpose

実行モード（single / epic-wave）を確定し、durable state から再開フェーズを判定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（`agentdev_gh` issue_read）、Epic Issue 本文（ステータス追跡テーブル有無）
2. identifier 保持: Issue番号（ユーザー入力またはセッション内会話）
3. 最小 scalar: なし
4. runtime artifact: なし（会話コンテキストのみに依存しない）

### Preconditions

- case-run command から Issue番号または URL が渡されている

### Procedure

`agentdev-workflow-orchestration` に従い再開フェーズを判定する（Issue番号解決、引数パース、妥当性確認、実行パス分岐、成果物チェックの詳細は同 skill 参照）。
再開が必要なフェーズをユーザーに通知する（準備フェーズから開始する場合は省略）。
実行モード分岐: 引数が Epic Issue 番号の場合は epic-wave workflow（[references/epic-wave.md](epic-wave.md)）へ。
それ以外は本 workflow（STEP-S2）へ。

**前工程からの引き継ぎ停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐する（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）。
self-hosting リポジトリでは履歴メタデータとして通常の case workflow を実施、consumer リポジトリでは実装を開始せず停止し agent-dev-flow repository への手動取り込み対象として報告する。

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
- **統合先判定（実証Case判定）**: Issue 本文の実証Case識別情報（対象評価ブランチ等の実証状態の永続記録）から当該 Case の統合先を確定する。実証Case識別情報がある場合は実証Caseとして評価ブランチを統合先とし、ない場合は通常Caseとして main（既定）を統合先とする。実証は work_type とは別の性質として扱い、work_type へ新値を追加しない
- **工程間構造化文脈の初期文脈利用**: 前工程（case-open、case-auto 等）から構造化文脈が引き継がれている場合、前工程で確定した事項を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認は維持する。手動起動等で構造化文脈が引き継がれていない場合は、durable state（Issue 本文、要件doc、REQ/Decision/Design）から入力解決を行う（形式と制約は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎ参照）
- **execution contract 消費境界**: 完了条件、test strategy、必須品質統制を実行契約として扱う。不足・曖昧さ・矛盾・実現不能を検出した場合は自律補完せず blocked とする。test strategy を新規設計せず記録済み項目を実行する。必須品質統制の適用要否を再判断しない。work_type/scale/Issue structure を再分類して実行契約を変更しない
  - runtime-only 判断の維持: worktree 状態確認、QG-3 前置 staleness check、実 diff 検査、実装結果・test 実行結果は case-run の安全検査として維持する
  - blocked 遷移と case-update 連携: 完了条件の不足・曖昧さ・矛盾・実現不能、scope-affecting impact candidate の発見、関連 ADR への適合確認で新たな拘束の必要性検出、必須品質統制の追加変更必要性、Issue metadata・構造・実態の矛盾検出時は blocked とし、Issue 更新は case-update へ委譲する（case-run 単独では Issue 本文を書き換えない）
  - 新旧 Issue 互換運用: execution contract 必須セクション（Execution Contract セクション、必須品質統制セクション）存在有無で新旧 Issue を識別する（presence-based 判定）。必須セクション不存在の legacy Issue は、新契約項目欠落のみを理由に一律 blocked にしない
  - work_type/scale 確認の縮約: work_type 確認は再分類ではなく metadata 整合確認へ縮約して維持する

### Result

- 要件doc・受け入れ基準抽出済み、関連Decision確認済み、work_type metadata 整合確認済み、統合先判定済み（通常Caseは main、実証Caseは評価ブランチ）、execution contract 消費境界適用済み

### Evidence

- Issue 本文読取結果、関連Decision 一覧、統合先判定結果（実証Case識別情報の有無と対象評価ブランチ）、消費境界判定結果（blocked 時はその理由）

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

- **Worktree 作成・ブランチ準備**: `agentdev-git-worktree` に従って実行する。作成元は当該 Case の統合先（通常Caseは既定 main、実証Caseは評価ブランチ）を明示的に指定する。通常Caseの worktree 起点は従来どおり main を維持する。べき等チェック: worktree 既存時は作成をスキップする。Wave 実行時、PR merge 後再開時は worktree 作成前に `git fetch origin` を実行し統合先の鮮度を確認する（同期基準・鮮度確認も同一の統合先を参照）
- **L2 タイムスタンプ計測**: 本 Step の開始時刻・終了時刻（JST）を記録し、worktree 設定時間を計測する（完了報告の L2 内訳に含める）
- **STEP-S3-1 親Epic ステータス更新**: `agentdev-epic-tracker` 参照
- **STEP-S3-2 worktree precondition gate**: `agentdev-git-worktree` の「worktree 内判定ヘルパー」に従い、当該 Issue の worktree+ブランチが作成済みであり、現在 worktree 内にいることを検証する。検証失敗時（worktree 未作成、メインリポジトリにいる）は実行担当サブエージェントを起動せず停止し、STEP-S3 へ戻るようユーザーに報告する
- **STEP-S3-3 QG-3 前置 staleness check**: `agentdev-quality-gates` の「case-run 前置 staleness check」に従い、ファイルパス現行存在確認、検査結果件数再計測、差異検出時の引き渡し・case-update 連携を実行する。本検査は QG-3 本体（委譲先が実施する PR 作成直前ゲート）とは独立した前置検査であり、QG-3 deviation 分類運用、QG-3 本体実施要否には影響しない
- **STEP-S3-4 docs/** 変更時の targeted docs guard: PR 対象ファイルに docs/** 変更を含む場合、委譲前に targeted docs guard を行う（`bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow case-run --base-ref <ベース> --json`、変更ファイルは worktree 内の git diff から取得。モード使い分けの標準は コミット前の worktree 上での検証 = `--base-ref`、コミット後・PR 作成後の main 環境 = `--files`。PowerShell で `--files` に複数パスを渡す場合は配列変数経由または個別渡しとし、引用符まとめ渡しは使用しない）。docs/** 変更を含まない PR ではスキップする。検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` に `### docs-integrity` 小見出しで記録する（実行担当サブエージェント責務）
- **STEP-S3-5 配布依存境界の事前委譲 gate**: PR 対象ファイルに `src/opencode/{commands,skills}/**` 変更を含む場合、委譲前に事前 gate を必須実行する（オプション扱いは廃止）。本 gate と STEP-S5 の最終 gate（実装後）は重畳する検査経路であり、事前 gate を実施しても最終 gate を省略しない。事前 gate は次の2点を検証する
  - 反映経路の確認: 配布物の変更が src 側（原本パス `src/opencode/{commands,skills}/**`）に位置することを確認する。`.opencode/` 投影パスへの直接変更を検出した場合は違反として扱う（配布物の変更は原本経由のみ許容）
  - ベースライン取得: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json` を委譲前時点（base 状態）の worktree で実行し、base の違反ベースラインを取得する。ベースラインは委譲プロンプトに引き渡し、委譲先が最終 gate の違反を当該変更起因と既存起因に判別する入力とする
  - 違反を検出した場合は委譲プロンプトで実行担当サブエージェントに引き渡す。src/opencode 変更を含まない PR ではスキップする
- **STEP-S3-6 AUTOGEN 索引再生成 前置 gate**: PR 対象ファイルに AUTOGEN 生成元文書（REQ 実ファイル、Decision 実ファイル、Design 実ファイル群。件数・一覧・status 別ビュー・行数計測の AUTOGEN ブロック生成元。生成元の具体的なパス構成は対象リポジトリの integrity 検査 skill の定義に従う）の変更を含む場合、AUTOGEN 索引の再生成を委譲に先行して強制する
  - 検出: worktree の git diff（統合先との比較）で AUTOGEN 生成元文書の変更（本文行数変更、rename、status 変更を含む）の有無を判定する。worktree 作成直後で diff が空の場合は Issue 本文の対象範囲・変更対象成果物の計画対象で判定する
  - 強制内容: 検出時は委譲プロンプトに「実装完了前に AUTOGEN 索引再生成を実行し、再生成結果を PR 対象に含める」ことを必須指示として引き渡す（任意手順として扱わない）。再生成コマンドは `bun run .opencode/skills/<integrity-detector-skill>/scripts/generate_indexes.ts`（worktree 内で実行）
  - 目的: SPEC 行数変更に伴う索引陳腐化を実装後の整合性検査で検出して停止する事態（PR #2253 の E5b 停止）の再発防止であり、索引再生成を前段の必須手順に位置付ける
  - AUTOGEN 生成元文書を含まない PR ではスキップする

**case-run が使用する検査ツール**（integrity 契約 Design「Workflow × 使用ツールマトリックス」参照）: check_changed_docs.ts（--workflow case-run、docs/** 変更を含む場合に委譲前に実行）、check_extensions.ts（`.opencode/commands/agentdev/**/*.md`、`.opencode/skills/agentdev-*/SKILL.md`、`.opencode/skills/agentdev-*/references/**/*.md`、`.agentdev/extensions/**` のいずれかを変更した場合に実行）、check_distribution_boundary.ts（--profile source / --profile link、STEP-S3-5 で base ベースライン取得、STEP-S5 で実装後の src 側原本面と .opencode 投影面を検査）、generate_indexes.ts（AUTOGEN 索引再生成、STEP-S3-6 の必須指示に基づき委譲内で実行）、test_strategy（Issue 完了条件検証）

**checker コマンドの stdout 退避形式**: 上記 checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出等の観測対象）であるため、実行と stdout 取得は 検証コマンドの stdout 証跡退避形式（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。
非ゼロ exit 時も JSON レポート（stdout）を Evidence として保持し、`>` リダイレクトや PowerShell 変数格納で退避しない。

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
- 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness 側の責務であり（charter 原則、harness 分離モデル Design 参照）、case-run は関与しない
- **tmp/ 残存確認**: 当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことを確認する。残存時は workflow 側 cleanup 規定（当該実行内での削除）に従って処理し、残存ファイルと対応結果を完了報告に明示する
- 完了報告 template に従って出力する（実行担当サブエージェント result 状態、PR番号を含める）
- 本 Step（worktree クリーンアップ）の開始時刻・終了時刻（JST）を記録し、worktree クリーンアップ時間を計測する。完了報告に L2 タイムスタンプ内訳（worktree 設定時間、実行担当サブエージェント実行時間、worktree クリーンアップ時間）を含める

### Result

- worktree 状態・tmp/ 残存確認結果、完了報告（result 状態、PR番号、L2 内訳）

### Evidence

- git status 結果、tmp/ 残存確認結果、完了報告出力

### Completion Verification

- 完了報告に result 状態と L2 内訳が含まれていること
- 当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（残存時は対応結果を報告済みであること）

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

- ガードレール（全ファイル操作は worktree 内で実行、`POL-worktree-isolation`）
- ガードレール・不変条件（STEP-S3 precondition gate、worktree root 相対パス引き渡し）
- ガードレール・不変条件（QG-3 前置 staleness check、差異検出時の引き渡しと case-update 連携）

## 関連ガイドライン

- **テスト戦略（TS）標準手順**: 関数削除を伴う Issue の test strategy には、削除対象関数の全使用箇所 grep 確認手順を含める（L-014、PR #1140 / #1139 Epic #1138 由来。詳細は `agentdev-req-analysis` 参照）
- **エラー処理**: エラー発生時の対応は `agentdev-workflow-orchestration` に従う。result が blocked/failed の場合、Issue コメント（SSoT）を参照して停止理由、再開ポイントをユーザーに報告する
