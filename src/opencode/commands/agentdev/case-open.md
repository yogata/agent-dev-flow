---
description: 要件定義をもとにGitHub Issueを作成する
---

# Case登録

要件定義（req-define）の結果をもとにGitHub Issueを作成する。
①壁打ち→②構造的実行フェーズの境界。

**draft-data 入力**: case-open は構造化 `draft-data`（`# draft-data` fenced YAML block）を入力として読み取る。
draft 全体の `agreed_items`、`artifact_actions`、`operation_units` を処理対象とし、OU ごとにスライスせず draft 全体の合意結果を取り扱う。
`auto_gate.auto_ready` が false、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する。
`conflict_resolutions` に記録済みの衝突については同じ内容をユーザーへ再確認しない

## 入力

- req-defineで生成された要件doc（構造化 `draft-data` 形式。チェックボックス付き）

## 出力

- GitHub Issue（ラベル付き、要件doc埋め込み）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-open` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- ADR・specs の内容は Issue 本文の生成に反映する
- Issue 本文・コメントのテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（【必須】セクションの完備確認、【任意】は内容がある場合のみ含める）
- Standard flow の動作・出力形式は Epic flow 追加の影響を受けないものとする（後方互換）
- Issue 化単位は OU 単位とし、子Issue は OU 単位で作成して対応 OU 経由で REQ/Decision/Design へのトレーサビリティを保持する（Wave 単位のみの子Issue 構造は作らない）。case-open は自律的な要件分析に基づいて Epic Issue または子 Issue 構造を生成し、機能要件・非機能要件・対象外・受け入れ条件は要件doc由来のものを用いる
- マルチREQ Epic flow は複数REQドキュメント入力時または draft-meta に `scale: large` 設定時に実行し、単一REQ Epic flow は `scale: large` 明示時に実行する
- 子Issue 本文の先頭行には `Parent: #{epic_number}` を含める（親子関係の追跡用）
- Case に割り当てられた統合先（既定値 main）を Issue 本文の execution contract へ記録する。実証Caseの場合は実証Case識別情報（実証フラグ、対象評価ブランチ、所属実証単位）と評価契約を Issue 本文へ永続記録する。評価結果の採否（採用、不採用、判定不能）自体を Issue 完了条件へ含めない
- Epic ステータス追跡テーブルは全子Issue の作成完了後に一括更新する
- preflight で req-define 未実行・要件docのチェックボックス空を検出した場合は警告する。feature の場合は対応する REQ ファイルの存在を確認する
- GitHub の読み取りは Custom Tool `agentdev_gh` の読み取り操作（issue_read、pr_read 等）経由で行う。work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）の成果物本文は verbatim で返す（LF・空行・インデントを含む行構造を保持）。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す
- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）。capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）は実行しない。`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス指定（`git add <path>`/ `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行う。draft/RU 削除は同一ステップで即時ステージ・コミットし未ステージ残存を許さない（Form Zero）
- Issue 本文（Standard/Epic/子Issue/完了報告コメント全て）は Custom Tool `agentdev_gh` の操作（issue_create、issue_update、issue_comment）で投入する。文字コード・一時ファイル等の実装詳細は Tool 内部に隠蔽される（`POL-gh-io-delegation`）


