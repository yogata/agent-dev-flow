---
description: 単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。worktree前提、委譲、結果処理を責務とする。3フェーズ構成でべき等性、再開ポイントを提供
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で委譲し、その result を処理する。case-run 本体は orchestration に専念し、実装実行そのものは行わない。常に git worktree を使用

**スコープ**: case-run は単一 Issue または単一 Wave を処理する。Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、case-run は扱わない。1 Wave の実行（PR作成まで）で return する。複数 Issue の一括実行、Wave 順序制御にまたがるオーケストレーションは case-auto の責務（workflow-contracts SPEC SC-008、extension 経由で解決）。3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。フェーズ間エラー時は Step 1 の再開判定から再開できる

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-run.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号またはURL（要件doc埋め込み済み）— 単一 Issue 実行モード
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## フェーズ構成（case-run internal lifecycle）

本節の「フェーズ」は case-run internal lifecycle（単一 Issue または Wave 内の準備、実装、提出）を指す。case-auto が管理する orchestration stage（command 間進行、stage 1 case-open / stage 2 case-run / stage 3 case-close）とは別の概念（responsibility-boundary-purification SPEC「case 実行責務の 4 用語と所有者」参照）。case-run は case-run internal lifecycle のみを所有し、orchestration stage を複製しない。3フェーズ: 準備フェーズ（Steps 2-5、再開条件: worktree+ブランチが存在しない）、実行担当サブエージェント委譲フェーズ（Steps 6-7、再開条件: PR未作成 or result 未確定）、クリーンアップフェーズ（Step 8、再開条件: result=completed-pr）。各フェーズは独立して再実行可能（べき等性）

## 手順

### Step 1: フェーズ判定（再開ポイント検出、実行モード分岐）

`agentdev-workflow-orchestration` に従い、再開フェーズを判定する（Issue番号解決、引数パース、妥当性確認、実行パス分岐、成果物チェックの詳細は同 skill 参照）。再開が必要なフェーズをユーザーに通知（準備フェーズから開始する場合は省略）。**実行モード分岐**: (1) 単一 Issue 実行モード（引数が非 Epic Issue 番号の場合、当該1 Issue を実行担当サブエージェントに委譲、後述 Step 2-8）、(2) Epic Wave 実行モード（`case-run #epic`、引数が Epic Issue 番号の場合、現在 ready な Wave の子Issue を並列委譲 最大5件、詳細は後述「Epic Wave 実行モード」セクション）。いずれのモードでも他Issue の実装履歴や Epic 全体の実装過程を前提としない

**前工程からの引き継ぎ停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）: self-hosting リポジトリ（ジャンクション or 実ディレクトリ）では履歴メタデータとして通常の case workflow を実施、consumer リポジトリ（コピー配置等）では実装を開始せず停止し agent-dev-flow repository への手動取り込み対象として報告

### Step 2〜4: 抽出・確認・判定

- **Step 2**: Issue本文から要件docと受け入れ基準を抽出（べき等性: worktreeとブランチが既に存在する場合、Step 5をスキップして Step 6 へ移行）。`agentdev-req-analysis` のチェックボックス品質基準で検証
- **Step 3**: 関連ADR特定（`docs/adr/README.md` を読み込み、関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認）
- **Step 4**: work_type 判定（`agentdev-workflow-lifecycle` に従い bugfix/feature/maintenance/docs_chore を判定、scale は feature のみ standard/large、workflow_route は都度導出し保存しない）

### Step 5: Worktree作成、ブランチ準備

`agentdev-git-worktree` に従って実行。`origin/main` をベースとして明示的に指定。べき等チェック: worktree既存時は作成スキップ。**Wave 実行時、PR merge 後再開時は worktree 作成前に `git fetch origin` を実行し origin/main の鮮度を確認すること**。詳細手順は `agentdev-git-worktree` 参照

**L2 タイムスタンプ計測（REQ）**: 本 Step の開始時刻、終了時刻（JST）を記録し、worktree 設定時間を計測する。計測結果は Step 8 完了報告の L2 内訳に含める

**Step 5-1**: 親Epicステータス更新（`agentdev-epic-tracker` 参照）

**Step 5-2**: worktree precondition gate（実行担当サブエージェント起動前の隔離検証）。`agentdev-git-worktree` の「worktree 内判定ヘルパー」に従い、当該 Issue の worktree+ブランチが作成済みであり、現在 worktree 内にいることを検証する。検証失敗時（worktree 未作成、メインリポジトリにいる）は実行担当サブエージェントを起動**せず**停止し、Step 5（Worktree作成、ブランチ準備）へ戻るようユーザーに報告する。Step 6 へ進んではならない。本 gate は適用範囲対象外「case-run の worktree 隔離フェーズ（構造的に保証済み）」の前提を保護する機構である

### Step 5-3: QG-3 前置 staleness check（実装作業開始前、REQ〜034）

`agentdev-quality-gates` の「case-run 前置 staleness check（REQ〜034）」に従い、ファイルパス現行存在確認、検査結果件数再計測、差異検出時の引き渡し・case-update 連携を実行する。本検査は QG-3 本体（Step 6 委譲先が実施する PR 作成直前ゲート）とは独立した前置検査であり、QG-3 deviation 分類運用、QG-3 本体実施要否には影響しない。差異非検出時はそのまま Step 5-4 へ進む

### Step 5-4: docs/** 変更時の targeted docs guard

PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当サブエージェント起動）の委譲前に targeted docs guard を行う。本検査は QG-3 本体・QG-3 前置 staleness check（Step 5-3）とは独立した前置 docs 整合性検査であり、3つの検査は順序依存を持たず、それぞれの実施要否に影響しない

**実行条件**: PR 対象ファイルに docs/** 変更を含む場合に実行する。docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）ではスキップする（QG-3 限定原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）

**実行コマンド**: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-run --base-ref origin/main --json`。変更ファイルは worktree 内の git diff から取得する（`--base-ref origin/main` または `--files <changed-paths>`）。case-run は worktree 環境（マージ前）で実行されるため `--base-ref` を使用する（`--files` は case-close 等、main 環境（マージ後）向け）。case-run プロファイル固有の追加ルールとして `full_docs_check_recommended` 判定は持たない（case-close の責務）

**検出結果の記録、連携**: 検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` セクションに `### docs-integrity` 小見出しで記録する（実行担当サブエージェント責務）。case-update へ連携し、Issue 本文の更新を委譲する（case-run 単独では Issue 本文を書き換えない）

### case-run が使用する検査ツール

case-run が使用する検査ツール（integrity 契約 SPEC「Workflow × 使用ツールマトリックス」参照）: check_changed_docs.ts（--workflow case-run、PR 対象ファイルに docs/** 変更を含む場合に Step 6 委譲前に実行、AG-002）、check_extensions.ts（IR-056、`.opencode/commands/agentdev/**/*.md`, `.opencode/skills/agentdev-*/SKILL.md`, `.opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行）、test_strategy（Issue 完了条件検証）。上記は全て肯定表現である

### Step 6: 実行担当サブエージェント起動（委譲）

実装実行を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲する（委譲 prompt 内で実行 command を指定）。起動手段は AGENTS.md および references/<harness>.md 参照。adapter protocol は `agentdev-case-run-execution-adapter` skill 参照

**L2 タイムスタンプ計測（REQ）**: 委譲起動直前・直後に壁時計タイムスタンプ（JST、REQ の時刻形式に準拠）を記録し、実行担当サブエージェント実行時間を計測。併せて Step 5（Worktree作成）と Step 8（worktree クリーンアップ）の開始・終了時刻を記録する。計測した L2 タイムスタンプは Step 7 result、Step 8 完了報告に含める（case-auto が L1 計測で case-run 委譲の壁時計時間を読み取る際の内訳として使用）

**委譲プロンプト、staleness check 結果の引き渡し（REQ）、test strategy 項目の test-fix ループ（REQ）、実行担当サブエージェントの責務（目標分解、各 criterion に observable evidence を要求、品質ゲートの実行、test-fix ループ）、委譲起動失敗・異常終了時の扱い（即 `failed` とせず実装完了・検証未完了として扱う）の詳細は `agentdev-case-run-execution-adapter` スキルを参照**

**case-run が直接行わない（実行担当サブエージェントの責務）**: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証。**実行担当サブエージェントへの引き渡し**: 割り当てられた1 Issue の Issue番号、worktree root（相対パス指定、worktree内制約）、ブランチ名。**PR URL 受領**: 実行担当サブエージェントが直接 PR 作成を行い、PR URL を委譲 result として返却する（PR URL フォールバック検索は使用しない）。**外部実行ハーネスの中間成果物**: plan artifact 等の中間成果物を AgentDevFlow の永続成果物として扱わない、最終結果は PR URL で受領する。**完了条件チェックボックス**: 実行担当サブエージェントは完了条件チェックボックスを更新しない（case-close QG-4 の責務）。**Findings/Capture 候補**: 実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する。**SPEC確定候補**: 実装時に発見された SPEC レベルの詳細（schema、enum、判定表、内部アルゴリズム等）は、実行担当サブエージェントが PR 本文の `## SPEC確定候補` セクションに記録する（`## Findings / Capture候補` とは別セクション、混在させない）。SPEC確定候補は case-close Step 3 で SPEC 確定チェックの入力となる

### Step 6-1: adapter 委譲内 adversarial-review 統合（経路G、REQ-015-010/011）

case-run 経路G の adversarial-review 挿入境界。本 Step は case-run 本体の Step 構造へ review 呼出を直接挿入せず、Step 6 委譲内で実施される review 統合を宣言する。挿入境界、委譲内実施、実装方針限定、blocked 遷移の正規所有者は case-run command SPEC「adversarial-review 挿入境界（経路G: adapter 委譲内）」節であり、本 Step は実行時投影先である。adapter 委譲内の内部手続き（実装方針形成、review 呼出、結果反映、blocked 遷移）の詳細は `agentdev-case-run-execution-adapter` スキル（SPEC「adversarial-review 統合（実装方針→review→結果反映）」節、references/adversarial-review-integration.md）を参照。

**case-run 本体は実装方針を生成・審査しない（REQ-015-010）**: 実装方針の形成、adversarial-review 呼出、結果反映は Step 6 委譲内で agentdev-case-run-execution-adapter の委譲契約に従い、最初の実装変更前に実施する。case-run 本体（Step 1〜8 の orchestration）が実装方針を生成、保持、審査するステップを新設しない。委譲 result（4状態）のみで adapter 委譲内の結果を受領する。

**実装方針限定（REQ-015-010）**: adapter 委譲内で形成する実装方針は、既確定 Issue 本文、REQ、ADR、SPEC を実現する内部選択（関数配置、命名、データ構造の選択、実装の並び順等）に限定する。実装方針は既確定文書へ矛盾しない内部選択の範囲内で review 審議対象となる。実装方針が既確定 Issue/REQ/ADR/SPEC の変更、追加、撤回を必要とする場合、実行担当サブエージェントは実装を開始せず blocked へ遷移する。

**blocked 遷移（REQ-015-010、REQ-015-011）**: adapter 委譲内で次のいずれかに該当する場合、実行担当サブエージェントは result を `blocked` として返却する。(1) 実装方針が既確定 Issue/REQ/ADR/SPEC の変更、追加、撤回を必要とする（REQ-015-010）。(2) 要件、仕様に問題（欠落、矛盾、曖昧さ、実現不可能な条件等）を検出した（REQ-015-011）。(3) adversarial-review 審議で unresolved な本質的争点またはユーザー判断事項が残り、実装の最初の変更（不可逆処理）へ進めない（REQ-014-009）。blocked 詳細本文は Issue コメントに SSoT として記録され、Step 7 で処理される。実行担当サブエージェントは要件、仕様問題を検出した場合、勝手に仕様変更、REQ 黙示変更、ADR 再解釈を行わず、必ず blocked 経路へ入る（G02）。

**発動条件（REQ-015-002）**: adversarial-review は任意助言手段であり、ユーザーが明示的に指定した場合にのみ発動する（REQ-014-001、REQ-015-002）。発動条件判定は adapter 委譲内で実行担当サブエージェントが行う。case-run 本体は発動条件の有無を判定、伝達しない。

**従来フロー維持（REQ-015-003）**: 発動条件非該当時（ユーザー明示指定なし）、呼出失敗時（REQ-014-010）のいずれの場合も、adapter 委譲内の従来フロー（実装方針形成、実装、検証、PR 作成）を維持する。review 呼出を行わず、実装方針形成から直接実装、検証、PR 作成へ進む。case-run 本体の従来フロー（Step 1〜8）も維持し、Step 6 委譲の結果は Step 7 で4状態として受領する。

**accepted finding 反映と再 review（REQ-014-006/007）**: accepted finding の実装方針への反映は adapter 委譲内の実行担当サブエージェント責務である。反映後に実装方針の意味内容が変更された場合、adapter 委譲内で必要な既存検証を再実行し、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる。同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。

### Step 7: 実行担当サブエージェント result 処理

実行担当サブエージェントが返す4状態（`agentdev-case-run-execution-adapter` の result 契約）のいずれかを処理する:

- **completed-pr**: 実装完了、PR作成済み。PR番号を受け取りクリーンアップStepへ。成功成果は PR 作成である
- **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
- **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
- **delegation-unavailable**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す

**L2 タイムスタンプ受け渡し（REQ）**: result 状態（completed-pr/blocked/failed）にかかわらず、Step 5（worktree 設定）、Step 6（実行担当サブエージェント実行）で計測した L2 タイムスタンプを result に含める。case-auto は本 L2 内訳を case-run 委譲の L1 壁時計時間の内訳として読み取る

### Step 8: worktree クリーンアップ確認 + 完了報告

- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
- 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness の責務であり、case-run は関与しない
- 完了報告templateに従って出力（実行担当サブエージェント result 状態、PR番号を含める）
- **L2 タイムスタンプ計測（REQ、REQ）**: 本 Step（worktree クリーンアップ）の開始時刻、終了時刻（JST）を記録し、worktree クリーンアップ時間を計測する。完了報告に L2 タイムスタンプ内訳（worktree 設定時間、実行担当サブエージェント実行時間、worktree クリーンアップ時間）を含める

## Epic Wave 実行モード（`case-run #epic` 受領時）

Epic Issue 番号を受け取った場合、現在 ready な Wave の子Issue を並列実行する。1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。同一コマンド再実行で次 Wave に進む（べき等、Epic Issue 本文から進行状況判定）。**Epic Issue の入力ソース（REQ/088）**: Epic Issue は本来の Epic flow（マルチREQ、`scale: large`）に加え、Standard flow 起因の独立 OU 自動 Epic 化（case-open が `depends_on` 空、L0 相当の独立 OU を検出して Epic 化）によるものも含む。case-run は入力ソースを区別せず、Epic Wave モデル（ADR、最大5件並列委譲）で一様に処理する。フロー詳細（Epic Issue 本文読込、現在 ready な Wave の子Issue 特定、`git fetch origin` 実行、子Issue の worktree 作成、各子Issue の並列委譲、全委譲完了待機、結果収集、return）は `agentdev-epic-tracker` を参照。Wave 境界（PR マージ）は case-close の責務。`completed-pr` となった子Issue を次 Wave へ進めるためには、case-close でマージ後に再度 `case-run #epic` を実行する（べき等）


## テスト戦略（TS）標準手順

関数削除を伴う Issue の test strategy 標準手順（L-014、PR #1140 / #1139 Epic #1138 由来）。共用関数の包括的削除による破壊的変更を防止する。関数削除を伴う Issue の test strategy に、削除対象関数の全使用箇所 grep 確認手順を追加する（標準手順: 削除対象関数名で `scripts/` 配下を grep し、対象スコープ外の使用箇所が 0 件であることを確認、残存する場合は削除を中止し Findings に記録）。詳細は `agentdev-req-analysis` を参照

## エラー処理

エラー発生時の対応は `agentdev-workflow-orchestration` に従う。実行担当サブエージェント result が blocked/ failed の場合、Issue コメント（SSoT）を参照して停止理由、再開ポイントをユーザーに報告する。実行担当サブエージェント内の自律修正ループ（同一入力の機械的再試行、検証ループ）は `agentdev-case-run-execution-adapter`/ `agentdev-workflow-orchestration` に従う

## ガードレール

### orchestration、委譲境界
- G01: 壁打ち禁止（構造的実行フェーズ、実装は実行担当サブエージェント経由）
- G02: 実装で判明した制約はREQを黙って変更せず、実行担当サブエージェントが乖離として報告しユーザー承認後に反映
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等の open issue 一覧取得は禁止
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G11/G22/G23/G32: case-run は単一 Issue または単一 Wave（Epic 指定時: 現在 ready な Wave の子Issue を並列実行、最大5件）のみを処理。Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない（Wave 境界は case-close の責務）。実装実行を実行担当サブエージェントへ委譲し、自ら work plan生成、実装、乖離検出、specs更新、PR作成を行わない（adapter protocol は `agentdev-case-run-execution-adapter` 参照）。実行担当サブエージェント result の4状態（completed-pr/blocked/failed/delegation-unavailable）は `agentdev-case-run-execution-adapter` の result 契約に従い、成功成果は PR 作成。Epic Wave 実行モードでは1 Wave のみ実行し PR 作成で return する
- G24: 完了条件チェックボックスの評価、更新は case-close QG-4 の責務。case-run、実行担当サブエージェントは完了条件チェックボックスを更新しない
- G25: blocked/ failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト、中間ファイルは SSoT としない
- G26/G29: 外部実行ハーネスの plan artifact 等の中間成果物を AgentDevFlow の永続成果物として扱わず、内部構造に依存した処理・検証を行わない。最終結果は PR URL で受領する
- G30/G31: Step 6（実行担当サブエージェント起動）の前に worktree+ブランチが作成済みであることを Step 5-2 precondition gate で検証すること。未作成時・メインリポジトリにいる場合は実行担当サブエージェントを起動禁止。実行担当サブエージェントへの引き渡しで worktree root（相対パス、`.worktrees/{N}-{type}/`）を必ず含め、メインリポジトリパスを渡さないこと
- G33/G34/G35: case-run は実装作業開始前に QG-3 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測）を実行（REQ、QG-3 本体とは独立、QG-3 deviation 分類運用を変更しない）。差異検出時は検出結果を Step 6 委譲プロンプトで実行担当サブエージェントに引き渡し、PR 本文の `## Findings / Capture候補` に `### stale-reference` 小見出しで記録（実行担当サブエージェント責務）。case-update へ連携し、case-run は Issue 本文を単独で書き換えない（case-update の責務）

### 本筋外発見の退避方針

intake/ learning 境界は `agentdev-workflow-orchestration`（capture-boundaries）を参照。実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15/G16/G17/G21: intake 候補、learning 候補を区別して記録し混ぜた単一成果物にしない。`.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md` の直接変更禁止。capture 情報は PR 本文経由のみ case-close に引き継ぐ（capture 境界の詳細は `agentdev-workflow-orchestration` 参照、case-run の capture 責務は記録のみ）
- G27: SPEC確定候補（実装で発見された SPEC レベル詳細）は PR 本文の `## SPEC確定候補` セクションに記録し、`## Findings / Capture候補` とは混在させない。SPEC確定候補の確定、SPEC ファイルへの反映判断は case-close の責務



