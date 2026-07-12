---
description: 単一 Issue または単一 Wave（Epic Issue 指定時: 現在 ready な Wave の子Issue を並列実行）を実行担当サブエージェントへ委譲し、result を処理する。worktree前提、委譲、結果処理を責務とする。3フェーズ構成でべき等性、再開ポイントを提供
agent: sisyphus
---

# 実装パイプライン

Case に対して実装実行を実行担当サブエージェント経由で委譲し、その result を処理する。
case-run 本体は orchestration に専念し、実装実行そのものは行わない。
常に git worktree を使用。

**スコープ**: case-run は単一 Issue または単一 Wave を処理する。
Epic 全体（複数 Wave）の処理、Wave 境界（PR マージ）は case-close の責務であり、case-run は扱わない。
1 Wave の実行（PR作成まで）で return する。
複数 Issue の一括実行、Wave 順序制御にまたがるオーケストレーションは case-auto の責務（workflow-contracts SPEC SC-008、extension 経由で解決）。

3フェーズ構成で各フェーズは独立して再実行可能（べき等性）。
フェーズ間エラー時は Step 1 の再開判定から再開できる。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-run.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号またはURL（要件doc埋め込み済み）— 単一 Issue 実行モード
- Epic Issue番号またはURL（Epic Wave 実行モード、`case-run #epic`）
- ブランチ名（自動生成または指定）

## 出力

- 成功: 実装済みブランチ + GitHub PR（実行担当サブエージェントが作成）。**case-run の成功成果は PR 作成である**。Epic Wave 実行時は子Issue ごとに PR が作成される
- blocked / failed / delegation-unavailable: blocker 詳細は Issue コメントに SSoT として記録される（実行担当サブエージェント責務）

## フェーズ構成

| フェーズ | Steps | 再開条件 |
|---|---|---|
| 準備フェーズ | 2-5 | worktree+ブランチが存在しない |
| 実行担当サブエージェント委譲フェーズ | 6-7 | PRが未作成 または 実行担当サブエージェント result 未確定 |
| クリーンアップフェーズ | 8 | 実行担当サブエージェント result = completed-pr |

## 手順

### Step 1: フェーズ判定（再開ポイント検出、実行モード分岐）

`agentdev-workflow-orchestration` に従い、再開フェーズを判定する。
Issue番号解決、引数パース、妥当性確認、実行パス分岐、成果物チェックの詳細は同skill参照。

- **再開ポイントの報告**: 再開が必要なフェーズをユーザーに通知。準備フェーズから開始する場合は省略

**実行モード分岐**:

1. **単一 Issue 実行モード**: 引数が非 Epic Issue 番号の場合。当該1 Issue を実行担当サブエージェントに委譲する（委譲 prompt 内で実行 command を指定、後述 Step 2-8）

2. **Epic Wave 実行モード（`case-run #epic`）**: 引数が Epic Issue 番号の場合。
Epic Issue 本文から現在 ready な Wave の子Issue を特定し、各子Issue を並列委譲する（最大5件、委譲 prompt 内で実行 command を指定）。
詳細は後述「Epic Wave 実行モード」セクション

いずれのモードでも他Issue の実装履歴や Epic 全体の実装過程を前提としない。

**前工程からの引き継ぎ停止判定**: Issue 本文、要件doc本文に `agentdev_handoff: true` が含まれる場合、実装を開始せず停止する。
agent-dev-flow repository への手動取り込み対象として報告する。
判定は `agentdev-workflow-lifecycle` に従う

### Step 2: Issue本文から要件docと受け入れ基準を抽出

**べき等性**: worktreeとブランチが既に存在する場合、Step 5をスキップして Step 6 へ移行。

`agentdev-req-analysis` のチェックボックス品質基準で検証

### Step 3: 関連ADR特定

`docs/adr/README.md` を読み込み、関連ADRを特定。関連ADRがあれば個別に読み込み、実装がADRの決定事項に矛盾しないことを確認

### Step 4: work_type 判定

`agentdev-workflow-lifecycle` に従い bugfix/feature/maintenance/docs_chore を判定。
scale は feature のみ standard/large。
workflow_route は都度導出し保存しない

### Step 5: Worktree作成、ブランチ準備

`agentdev-git-worktree` に従って実行。
`origin/main` をベースとして明示的に指定。
べき等チェック: worktree既存時は作成スキップ。
**Wave 実行時、PR merge 後再開時は worktree 作成前に `git fetch origin` を実行し origin/main の鮮度を確認すること**。
詳細手順は `agentdev-git-worktree` 参照

**L2 タイムスタンプ計測（REQ、REQ）**: 本 Step の開始時刻、終了時刻（JST）を記録し、worktree 設定時間を計測する。計測結果は Step 8 完了報告の L2 内訳に含める

**Step 5-1**: 親Epicステータス更新（`agentdev-epic-tracker` 参照）

**Step 5-2**: worktree precondition gate（実行担当サブエージェント起動前の隔離検証）。`agentdev-git-worktree` の検証ヘルパー（`references/worktree-operations.md` の「worktree 内判定ヘルパー」参照）に従い、当該 Issue の worktree+ブランチが作成済みであることを検証する:

- **検証1**: `git worktree list` の出力に当該 Issue の worktree（`.worktrees/{N}-{type}`）が含まれること
- **検証2**: `git rev-parse --show-toplevel`（worktree 内で実行）の結果がメインリポジトリルートと**一致しない**こと（現在 worktree 内にいることの確認）

**検証失敗時（worktree 未作成、メインリポジトリにいる）**: 実行担当サブエージェントを起動**せず**停止し、Step 5（Worktree作成、ブランチ準備）へ戻るようユーザーに報告する。
Step 6 へ進んではならない。

本 gate は 適用範囲対象外「case-run の worktree 隔離フェーズ（構造的に保証済み）」の前提を保護する機構である。
worktree 隔離が構造的に保証されているという前提を、実行時に検証して担保する。

### Step 5-3: QG-3 前置 staleness check（実装作業開始前、REQ〜034）

本 Step は QG-3 本体（Step 6 委譲先が実施する PR 作成直前ゲート）とは独立した前置検査であり、QG-3 deviation 分類（spec-bug 等）運用を変更しない（REQ）。staleness check は実装開始前の入力妥当性検査であり、QG-3 本体の実施要否には影響しない。

**検証項目**:

1. **ファイルパス現行存在確認**: Issue 本文が参照するファイルパス（command 定義、SPEC、template 等）が現行リポジトリに存在するか確認する。Issue 作成時点から移動、改名、削除されたパスを検出対象とする（REQ）
2. **検査結果件数再計測**: Issue 本文の事前状態セクションが列挙する検査結果件数（NG 件数、IR 違反件数等）を再計測し、Issue 本文記載値と比較する。件数は変動しやすい実測値スナップショットであるため、差異の有無のみを判定材料とする（REQ）

**差異検出時のアクション**（REQ、REQ）:

差異を検出した場合、case-run は以下を実施する:

1. 検出結果（対象パス、Issue 本文記載値、現行値）を Step 6 委譲プロンプトに含めて実行担当サブエージェントへ引き渡す。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで差異内容を記録する（Findings 記録は実行担当サブエージェント責務）
2. case-update へ連携し、Issue 本文の参照パス・件数の更新を委譲する
3. case-run 単独では Issue 本文を書き換えない（Issue 本文更新は case-update の責務）

差異非検出時はそのまま Step 6 へ進む。staleness check の差異有無によらず QG-3 本体（Step 6 委譲先）の実施要否は変更しない。

**QG-3 本体との関係**: staleness check は QG-3 本体（PR 作成直前の実装充足・乖離ゲート）とは独立した前置検査である。QG-3 が実装結果に対するゲートであるのに対し、staleness check は実装開始前の入力妥当性検査である。両者は順序依存を持たない。

### Step 5-4: docs/** 変更時の targeted docs guard（REQ-0130-035）

PR 対象ファイルに docs/** 変更を含む場合、Step 6（実行担当サブエージェント起動）の委譲前に targeted docs guard を実行する（REQ-0130-035）。本検査は QG-3 本体・QG-3 前置 staleness check（Step 5-3）とは独立した前置 docs 整合性検査であり、3つの検査は順序依存を持たず、それぞれの実施要否に影響しない（REQ-0130-033 準拠）。

**実行条件**:

- PR 対象ファイルに docs/** 変更を含む場合に実行する。docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）ではスキップする（REQ-0130-007 の QG-3 限定原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）

**実行コマンド**:

```bash
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
  --workflow case-run --base-ref origin/main --json
```

変更ファイルは worktree 内の git diff から取得する（`--base-ref origin/main` または `--files <changed-paths>`）。case-run は worktree 環境（マージ前）で実行されるため `--base-ref` を使用する（`--files` は case-close 等、main 環境（マージ後）向け）。case-run プロファイル固有の追加ルールとして `full_docs_check_recommended` 判定は持たない（case-close の責務）。

**検出結果の記録、連携**:

- 検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` セクションに `### docs-integrity` 小見出しで記録する（実行担当サブエージェント責務）
- case-update へ連携し、Issue 本文の更新を委譲する（case-run 単独では Issue 本文を書き換えない、REQ-0130-034 準拠）

### case-run が使用する検査ツール

case-run が使用する検査ツール（[integrity-contracts.md](../../../../docs/specs/integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- check_changed_docs.ts（--workflow case-run）: PR 対象ファイルに docs/** 変更を含む場合、Step 6 委譲前に実行（AG-002、Step 5-4「docs/** 変更時の targeted docs guard（REQ-0130-035）」参照）
- check_extensions.ts（IR-056）: `.opencode/commands/agentdev/**/*.md`, `.opencode/skills/agentdev-*/SKILL.md`, `.opencode/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行
- test_strategy: Issue 完了条件検証（REQ-0130-029/030）

※上記は全て肯定表現である（REQ-0144-002, REQ-0144-003 準拠）。

### Step 6: 実行担当サブエージェント起動（委譲）

実装実行を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲する（委譲 prompt 内で実行 command を指定）。起動手段は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）。
adapter protocol は `agentdev-case-run-execution-adapter` skill 参照。

**L2 タイムスタンプ計測（REQ、REQ）**: 委譲起動直前、直後に壁時計タイムスタンプ（JST、REQ の時刻形式に準拠）を記録し、実行担当サブエージェント実行時間を計測する。
併せて Step 5（Worktree作成）の開始、終了時刻、Step 8（worktree クリーンアップ）の開始、終了時刻を記録し、worktree 設定/クリーンアップ時間を計測する。
計測した L2 タイムスタンプは Step 7 result、Step 8 完了報告に含める（case-auto が L1 計測で case-run 委譲の壁時計時間を読み取る際の内訳として使用）

**委譲プロンプト**: 実行 command を prompt 内で指定し Issue #N の実装を指示する（command の具体名は AGENTS.md 参照）。
Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報）が含まれ得る。
実行担当サブエージェントはこれを参考情報として扱い、束縛されない。

**staleness check 結果の引き渡し（REQ）**: Step 5-3 で差異を検出した場合、委譲プロンプトに差異内容（対象パス、Issue 本文記載値、現行値）を含める。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで当該差異を記録し、case-update への連携を示す（Issue 本文の単独書き換えは行わない、REQ）。差異非検出時は引き渡し不要。

**test strategy 項目の test-fix ループ（REQ）**: Issue 本文のテスト戦略セクションに test strategy 項目（3要素構造: verification / pass_criteria / on_failure）が含まれる場合、委譲契約は各項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントに要求する。
実行担当サブエージェントの具体的責務は `agentdev-case-run-execution-adapter` スキル（REQ）参照。

**実行担当サブエージェントの責務**: 委譲 prompt 内で指定された実行 command による目標分解（Issue を success criteria に分解）、各 criterion に observable evidence を要求、品質ゲート（code review + QA review + gate review）の実行、test strategy 項目の test-fix ループ（各項目ごとの検証、不合格時処置、全項目処理までの反復、REQ）。
ランタイム作業領域（実行監査トレイル等）は worktree 配下に配置され、worktree 削除時に破棄される。
各ツール呼び出しは120秒 timeout で保護される。

**委譲起動失敗、異常終了時の扱い**: 実行担当サブエージェントの委譲起動失敗、異常終了時は即 `failed` とせず**実装完了、検証未完了**として扱う。委譲起動不能の場合は `delegation-unavailable` として報告する（REQ-0162-003/004）。
詳細な事後処理（worktree の `git status` で未コミット変更確認、残留箇所の grep と手動修正）は `agentdev-case-run-execution-adapter` スキル参照。

- **case-run が直接行わない（実行担当サブエージェントの責務）**: work plan生成、実装実行、TDD、乖離検出（QG-3）、specs更新、関連ドキュメント整合性確認、ローカル検証、PR本文作成、PR作成、デプロイ検証
- **実行担当サブエージェントへの引き渡し**: 割り当てられた1 Issue の Issue番号、worktree root（相対パス指定、worktree内制約）、ブランチ名。実行担当サブエージェントはこの1 Issue のみを実装対象とする（Wave全体や他子Issue のオーケストレーションは含まない）
- **PR URL 受領**: 実行担当サブエージェントが直接 PR 作成を行い、PR URL を委譲 result として返却する（PR URL フォールバック検索は使用しない）
- 外部実行ハーネスの plan artifact 等の中間成果物の内部構造に依存した処理、検証を行わない。最終結果は PR URL で受領する
- 実行担当サブエージェントが Issue 完了条件チェックボックスを更新しない（case-close QG-4 の責務）
- Findings/ Capture 候補は実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する
- **外部実行手段の中間成果物**: 外部実行手段の plan artifact 等の中間成果物を AgentDevFlow の永続成果物（draft/Issue/PR/REQ/ADR/SPEC）として扱わない
- **SPEC確定候補**: 実装時に発見された SPEC レベルの詳細（SPEC に記載すべき schema、enum、判定表、内部アルゴリズム等、実装で判明した仕様詳細）は、実行担当サブエージェントが PR 本文の `## SPEC確定候補` セクションに記録する。`## Findings / Capture候補`（本筋外発見、intake/learning 候補）とは別セクションとし、混在させない。SPEC確定候補は case-close Step 3 で SPEC 確定チェックの入力となり、draft → accepted 昇格または spec-save 再起動の判断材料となる

### Step 7: 実行担当サブエージェント result 処理

実行担当サブエージェントが返す4状態（`agentdev-case-run-execution-adapter` の result 契約）のいずれかを処理する:

- **completed-pr**: 実装完了、PR作成済み。PR番号を受け取りクリーンアップStepへ。成功成果は PR 作成である
- **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
- **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
- **delegation-unavailable**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す（REQ-0162-004）

**L2 タイムスタンプ受け渡し（REQ）**: result 状態（completed-pr/blocked/failed）にかかわらず、Step 5（worktree 設定）、Step 6（実行担当サブエージェント実行）で計測した L2 タイムスタンプを result に含める。case-auto は本 L2 内訳を case-run 委譲の L1 壁時計時間の内訳として読み取る

### Step 8: worktree クリーンアップ確認 + 完了報告

- 未コミット変更あり: 報告してユーザーの指示に従う。自動的な破棄、コミットは行わない
- 未コミット変更なし: 完了報告へ。runtime workspace のクリーンアップは harness の責務であり、case-run は関与しない（REQ-0162-002）
- 完了報告templateに従って出力（実行担当サブエージェント result 状態、PR番号を含める）
- **L2 タイムスタンプ計測（REQ、REQ）**: 本 Step（worktree クリーンアップ）の開始時刻、終了時刻（JST）を記録し、worktree クリーンアップ時間を計測する。完了報告に L2 タイムスタンプ内訳（worktree 設定時間、実行担当サブエージェント実行時間、worktree クリーンアップ時間）を含める

## Epic Wave 実行モード（`case-run #epic` 受領時）

以下のフローに基づく。
Epic Issue 番号を受け取った場合、以下のフローで現在 ready な Wave の子Issue を並列実行する。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等、Epic Issue 本文から進行状況判定）。

**Epic Issue の入力ソース（REQ/088）**: Epic Issue は本来の Epic flow（マルチREQ、`scale: large`）に加え、Standard flow 起因の独立 OU 自動 Epic 化（case-open が `depends_on` 空、L0 相当の独立 OU を検出して Epic 化）によるものも含む。
case-run は入力ソースを区別せず、Epic Wave モデル（ADR、最大5件並列委譲）で一様に処理する。
case-run 側の新規機能追加は不要で、入力としての Epic Issue が増えるのみである。

1. **Epic Issue 本文読込**: Epic Issue 本文から子Issue一覧、Wave 構成、ステータス追跡テーブルを読み取る（永続状態を SSoT とする）

2. **現在 ready な Wave の子Issue 特定**: ステータス追跡テーブルから現在 ready な Wave の子Issue を特定する。
`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択する。
ただし前提Issue が blocked/failed の場合は `pending` のまま選択対象外

3. **`git fetch origin` 実行**: 各子Issue の worktree 作成前に `git fetch origin` を実行し、origin/main の鮮度を確認する。詳細手順は `agentdev-git-worktree` 参照

4. **子Issue の worktree 作成**: 各子Issue について Step 5（Worktree作成、ブランチ準備）、Step 5-2（precondition gate）、Step 5-3（QG-3 前置 staleness check）を実行する

5. **各子Issue を並列委譲**: 各子Issue を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ並列委譲する。
委譲の起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）。
**最大5件**まで同時起動。
委譲プロンプトは実行 command を prompt 内で指定し Issue #N の実装を指示する（command の具体名は AGENTS.md 参照）

6. **全委譲完了待機**: 全委譲の完了を待つ。各委譲は Step 7 の result 処理と同じ4状態を返す

7. **結果収集**: 各子Issue の result（completed-pr / blocked / failed / delegation-unavailable）を収集する。子Issue ごとに worktree は独立しており、他子Issue の結果に依存しない（子Issue の結果は親コンテキストではなく永続状態に記録）

8. **return**: 収集した結果（子Issue ごとの PR番号、blocked/failed の理由）を報告して return する。
Wave 境界（PR マージ）は case-close の責務。
`completed-pr` となった子Issue を次 Wave へ進めるためには、case-close でマージ後に再度 `case-run #epic` を実行する（べき等）


## テスト戦略（TS）標準手順

関数削除を伴う Issue の test strategy 標準手順（L-014、PR #1140 / #1139 Epic #1138 由来）。
共用関数の包括的削除による破壊的変更を防止する。

- 関数削除を伴う Issue の test strategy に、削除対象関数の全使用箇所 grep 確認手順を追加すること
- 標準手順: 削除対象関数名で `scripts/` 配下を grep（例: `grep -rn "funcName" scripts/`）し、対象スコープ外の使用箇所が 0 件であることを確認する
- 対象スコープ外に残存する使用箇所がある場合、削除を中止し Findings に記録する

## エラー処理


エラー発生時の対応は `agentdev-workflow-orchestration` に従う。
実行担当サブエージェント result が blocked/ failed の場合、Issue コメント（SSoT）を参照して停止理由、再開ポイントをユーザーに報告する。
実行担当サブエージェント内の自律修正ループ（同一入力の機械的再試行、検証ループ）は `agentdev-case-run-execution-adapter`/ `agentdev-workflow-orchestration` に従う。

## ガードレール

### orchestration、委譲境界
- G01: 壁打ち禁止（構造的実行フェーズ、実装は実行担当サブエージェント経由）
- G02: 実装で判明した制約はREQを黙って変更せず、実行担当サブエージェントが乖離として報告しユーザー承認後に反映
- G04: 全ファイル操作はworktree内で実行
- G05: Issue番号省略は同一セッション内で作成済みの場合のみ
- G06: Issue番号解決に Issue/PR 一覧取得手続き（`agentdev-gh-cli`）等の open issue 一覧取得は禁止
- G10: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G11: case-run は単一 Issue または単一 Wave（Epic 指定時: 現在 ready な Wave の子Issue を並列実行、最大5件）のみを処理する。Epic 全体（複数 Wave）の一括実行、Wave 境界（PR マージ）は扱わない。Wave 境界は case-close の責務
- G22: case-run は実装実行を実行担当サブエージェントへ委譲し、自ら work plan生成、実装、乖離検出、specs更新、PR作成を行わない。adapter protocol は `agentdev-case-run-execution-adapter` 参照
- G23: 実行担当サブエージェント result の4状態（completed-pr/blocked/failed/delegation-unavailable）は `agentdev-case-run-execution-adapter` の result 契約に従う。成功成果は PR 作成である
- G24: 完了条件チェックボックスの評価、更新は case-close QG-4 の責務。case-run、実行担当サブエージェントは完了条件チェックボックスを更新しない
- G25: blocked/ failed の詳細本文 SSoT は Issue コメント。completed の SSoT は PR 本文。一時会話コンテキスト、中間ファイルは SSoT としない
- G26: 外部実行ハーネスの plan artifact 等の中間成果物の内部構造に依存した処理、検証を行わない。最終結果は PR URL で受領する。
- G29: 外部実行手段の中間成果物を AgentDevFlow の永続成果物として扱わない
- G30: Step 6（実行担当サブエージェント起動）の前に worktree+ブランチが作成済みであることを検証すること（Step 5-2 precondition gate）。未作成時、メインリポジトリにいる場合は実行担当サブエージェントを起動禁止（適用範囲対象外「case-run の worktree 隔離フェーズ（構造的に保証済み）」の前提保護）
- G31: 実行担当サブエージェントへの引き渡しで worktree root（相対パス、`.worktrees/{N}-{type}/`）を必ず含め、メインリポジトリパスを渡さないこと
- G32: Epic Wave 実行モードでは1 Wave のみ実行し PR 作成で return する。Wave 境界（PR マージ）は case-close へ委譲する
- G33: case-run は実装作業開始前に QG-3 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測）を実行する（REQ）。本検査は QG-3 本体とは独立した前置検査であり、QG-3 deviation 分類（spec-bug 等）運用を変更しない（REQ）
- G34: case-run は staleness check で差異を検出した場合、検出結果を Step 6 委譲プロンプトで実行担当サブエージェントに引き渡し、PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで記録する（実行担当サブエージェント責務、REQ）。差異検出時は case-update へ連携する
- G35: case-run は staleness check で差異を検出した場合でも Issue 本文を単独で書き換えず、case-update の責務として委譲する（REQ）

### 本筋外発見の退避方針

intake/ learning 境界は `agentdev-workflow-orchestration` を参照する。
実行担当サブエージェントが PR 本文の `## Findings / Capture候補` に記録する。

- G14: スコープ拡大禁止。発見は記録し修正は後続処理に委ねる
- G15: intake 候補を PR 本文の `## Findings / Capture候補` に記録。`.agentdev/intake/inbox/` の直接変更禁止
- G16: learning 候補を intake 候補と区別して記録
- G17: intake/learning 候補を混ぜた単一成果物にしない。capture 境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` を参照（case-run の capture 責務は記録のみ）
- G21: `.agentdev/learning/inbox.md` の直接変更禁止。capture 情報は PR 本文経由のみ case-close に引き継ぐ
- G27: SPEC確定候補（実装で発見された SPEC レベル詳細）は PR 本文の `## SPEC確定候補` セクションに記録し、`## Findings / Capture候補` とは混在させない。SPEC確定候補の確定、SPEC ファイルへの反映判断は case-close の責務



