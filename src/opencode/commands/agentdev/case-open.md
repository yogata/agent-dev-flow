---
description: 要件定義をもとにGitHub Issueを作成する
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。①壁打ち→②構造的実行フェーズの境界。

**draft-data 入力**: case-open は構造化 `draft-data`（`# draft-data` fenced YAML block）を入力として読み取る。draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象とし、OU ごとにスライスせず draft 全体の合意結果を取り扱う。`auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する。`conflict_resolutions` に記録済みの衝突については同じ内容をユーザーへ再確認しない

## 入力

- req-defineで生成された要件doc（構造化 `draft-data` 形式。チェックボックス付き）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-open.yaml`）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-open` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが6 STEP の control plane として制御構造を所有する。

- **STEP-1** 引き継ぎ・OU 選択 — `agentdev_handoff: true` 判定、OU モード時は OU 選択ゲート
- **STEP-2** Issue 本文生成・execution contract 確定 — QG-{N} 検証、test_strategy 埋め込み、EC-{N}〜EC-{N} 確定
- **STEP-3** 構成判定・preflight — 単一REQ → Standard flow、複数REQ/`scale: large`/複数 OU → Epic flow、execution_unit 構成、preflight 5項目
- **STEP-4** adversarial-review（経路F）— default-on、skip 条件（Standard flow で単一 OU 機械的確定）該当時は省略、ユーザー明示指定時は強制発動、4パターン再実行ルール
- **STEP-5** Issue 作成（Epic flow / Standard flow）— Epic Issue + 子Issue（OU単位、最大5件並列）、または Standard Issue、OU 結果書き戻し
- **STEP-6** 終了処理・クリーンアップ — コメント追加、draft/RU 削除（Form Zero、即時 commit/push）、削除残存検証、完了報告

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-case-open` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

**共通ルール**（全 STEP 適用、詳細は workflow skill 参照）: VERIFY（gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証）、テンプレート準拠（テンプレート読込後は毎回【必須】セクションの完備を確認、【任意】は内容がある場合のみ含める、欠落時は再生成）。並列上限と3つの「5件」文脈（case-open の Step 8 子Issue 並列は case-run Wave 内子 Issue 並列と同一上限、5件）の詳細も workflow skill 参照

## ガードレール

### フェーズ制約
- G01: ADR、specsの内容はIssue本文の生成に反映すること

### 実行制約
- G03: 子Issue本文の先頭行に `Parent: #{epic_number}` を必ず含める（親子関係の追跡用）
- G04: 全子Issueの作成完了後にEpic本文のステータス追跡テーブルを更新する（部分更新は禁止）
- G05: 子Issueは最大10件まで（Epic 1件あたり）。子Issue 作成 STEP で子Issue数を確認し、超過時はEpic、子Issueいずれも作成せずエラーで停止
- G14: Wave単位のみの子Issue構造を作成してはならない。子Issue は OU 単位で作成し、対応 OU 経由で REQ/Decision/SPEC へのトレーサビリティを保持すること
- G15/G16: マルチREQ Epic flow は複数REQドキュメント入力時または draft-meta に `scale: large` 設定時のみ実行。単一REQ Epic flow は `scale: large` 明示時のみ

### 品質ゲート
- G06: req-define未実行の場合は警告
- G07: 要件docのチェックボックスが空の場合は警告
- G08: featureの場合、対応するREQファイルが存在することを確認
- G09: テンプレートの【必須】セクションが全て本文に含まれていることを確認してから Issue 作成手続き（`agentdev-gh-cli`）を実行。欠落時は再生成
- G10: `完了条件` セクションはテンプレートの【必須】セクション。準拠検証で必ず確認

### 委譲、参照制約
- G12: gh CLI出力を読み取る際は `agentdev-gh-cli` の安全な読み取り手順に従うこと
- G13: work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照

### 出力制約
- G02: Standard flowの動作、出力形式はEpic flow追加による影響を受けない
- G17: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す（LF・空行・インデントを含む行構造をbyte単位で保持、正規化・圧縮・空白挿入削除禁止）。委譲接続点（Issue 本文生成・Epic Issue 本文生成・子Issue 作成・Epic Issue 更新）と最終 gh CLI 渡し（Standard Issue 作成・コメント追加）の双方に適用。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### deviation capture 制約
- G18/G22: case-open は自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する。保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従い、`intake-capture` command 等、別 command を直接呼ばない。capture 本文は完了報告に含めず保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める

### OU 処理制約
- G19/G20/G21: case-open は自律的な要件分析に基づいて Epic Issue または子 Issue 構造を生成（複数 OU 存在時、単一 Issue 完結時は Epic を作成しない）。機能要件、非機能要件、対象外、受け入れ条件を新規作成しない。Issue 化単位は REQ doc 単位ではなく OU 単位

### 並列実行安全 git 操作制約
- G23/G24: 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）を実行せず、`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従う。ステージ・コミットは明示パス指定（`git add <path>`/ `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行い共有 index の他セッション変更を排出しない。draft/RU 削除は同一ステップで即時ステージ・コミットし未ステージ残存を許さない（Form Zero）。`git add` は `.agentdev/` 全体の一括スコープではなく明示パスに限定

### 本文 verbatim・ファイル経由制約
- G25: Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）は文字列変数で持ち回らず `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF-{N} BOM なし LF 一時ファイル経由で `gh --body-file` へ渡す。テンプレート読込→変数置換→ファイル保存→gh CLI 渡しまでファイル経由で固定し、親エージェントの本文再構成を禁止



