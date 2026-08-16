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

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-case-open`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-case-open.yaml`、kind: workflow-extension）を読み込む（ADR）。extension の5セクション（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）は標準動作に追加・拡張される（上書きではない）。存在しない場合は標準動作で続行し、破損時はエラー表示して当該 extension を無視し標準動作で続行する。詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-open` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが6 STEP の control plane として制御構造を所有する。各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 引き継ぎ・OU 選択 | 要件doc（構造化 `draft-data`）存在 | 処理対象 OU の確定 | `auto_gate.auto_ready` が true であり、未解決質問・未解決衝突・repo外操作・停止理由が残っていないこと |
| STEP-2 Issue 本文生成・execution contract 確定 | OU 選択済み | Issue 本文・execution contract | テンプレートの【必須】セクション（`完了条件` を含む）が完備していること |
| STEP-3 構成判定・preflight | 本文確定 | 構成判定結果（Epic flow / Standard flow）と preflight 結果 | 子Issue が Epic 1件あたり最大10件以内であること（超過時は作成前にエラー停止） |
| STEP-4 adversarial-review（経路F） | ユーザー明示指定時 | review 結果と反映後の本文 | accepted finding が本文へ反映されていること |
| STEP-5 Issue 作成（Epic flow / Standard flow） | preflight 通過 | GitHub Issue（ラベル付き、要件doc埋め込み） | gh CLI 書込後の VERIFY で作成内容が確認できること。子Issue 本文先頭行に `Parent: #{epic_number}` があること |
| STEP-6 終了処理・クリーンアップ | Issue 作成済み | Epic ステータス追跡テーブル更新・draft/RU 削除・完了報告 | 全子Issue 作成完了後にステータス追跡テーブルを一括更新していること（部分更新は行わない） |

**共通ルール**（全 STEP 適用）: VERIFY（gh CLI 書込後は毎回 `agentdev-gh-cli` VERIFY 操作で検証）、テンプレート選定・準拠（`agentdev-workflow-templates` の選定ルール、テンプレート読込後は毎回【必須】セクションの完備を確認、【任意】は内容がある場合のみ含める、欠落時は再生成）。子Issue 並列上限は case-run Wave 内子 Issue 並列と同一上限（5件）

**soft guard（REQ-{NNNN}-{NNN}、OpenCode 1.18.15 向け）**: 本コマンドの workflow 実装本体は `agentdev-workflow-case-open` が所有する。同 Workflow Skill は `/agentdev/case-open` command の工程経由でのみ利用し、単独起動（直接 skill 起動）を行わないこと。OpenCode 1.18.15 は skill 直接起動を機械的に防止できないため、本宣言を soft guard として機能させる。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- ADR・specs の内容は Issue 本文の生成に反映する
- Standard flow の動作・出力形式は Epic flow 追加の影響を受けないものとする（後方互換）
- Issue 化単位は OU 単位とし、子Issue は OU 単位で作成して対応 OU 経由で REQ/Decision/SPEC へのトレーサビリティを保持する（Wave 単位のみの子Issue 構造は作らない）。case-open は自律的な要件分析に基づいて Epic Issue または子 Issue 構造を生成し、機能要件・非機能要件・対象外・受け入れ条件は要件doc由来のものを用いる
- マルチREQ Epic flow は複数REQドキュメント入力時または draft-meta に `scale: large` 設定時に実行し、単一REQ Epic flow は `scale: large` 明示時に実行する
- 子Issue 本文の先頭行には `Parent: #{epic_number}` を含める（親子関係の追跡用）
- Epic ステータス追跡テーブルは全子Issue の作成完了後に一括更新する
- preflight で req-define 未実行・要件docのチェックボックス空を検出した場合は警告する。feature の場合は対応する REQ ファイルの存在を確認する
- gh CLI 出力の読み取りは `agentdev-gh-cli` の安全な読み取り手順に従う。work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）の成果物本文は verbatim で返す（LF・空行・インデントを含む行構造を保持）。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）。capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G23: 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）は実行しない。`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス指定（`git add <path>`/ `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行う。draft/RU 削除は同一ステップで即時ステージ・コミットし未ステージ残存を許さない（Form Zero）
- G25: Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）は文字列変数で持ち回らず `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）による UTF-{N} BOM なし LF 一時ファイル経由で `gh --body-file` へ渡す（テンプレート読込→変数置換→ファイル保存→gh CLI 渡しまでファイル経由で固定）



