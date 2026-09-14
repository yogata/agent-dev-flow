---
description: 合意済み要件docからRoot Case（GitHub Issue）を確立し Definition Package を生成する
---

# Case登録

合意済み要件doc から Root Case（GitHub Issue）を確立し、Definition Package を生成して関連付ける。
本コマンドは壁打ちフェーズ（req-define）と Definition 受入準備フェーズ（case-ready）の境界に位置する。
execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は行わない（case-ready 実行契約 REQ へ移管）。

**draft-data 入力**: case-open は構造化 `draft-data`（`# draft-data` fenced YAML block）を入力として読み取る。
draft 全体の `agreed_items`、`artifact_actions`、`operation_units`、`realization_actions` を処理対象とし、OU ごとにスライスせず draft 全体の合意結果を取り扱う。
`realization_actions`（実現面の変更方針: 構造化ハンドオフ）は新しい execution contract として確定せず、Definition Package の構成要素として保持する。
要件が曖昧で Root Case を確立できない場合、または未解決質問、未解決衝突、repo外操作、停止理由が残る場合は停止する。
`conflict_resolutions` に記録済みの衝突については同じ内容をユーザーへ再確認しない

## 入力

- req-define で生成・合意された要件doc（構造化 `draft-data` 形式。チェックボックス付き）

## 出力

- Root Case GitHub Issue（ラベル付き、対象 REQ 番号埋め込み、状態 open。実装開始は許可しない）
- Definition Package（要件doc から生成し Root Case に関連付ける。構成は definition-readiness Design）
- Draft Definition PR（canonical Definition に実変更がある場合のみ。Case 単位で 1 件）
- 完了報告（Root Case 完了報告テンプレート）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-open` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
Issue 本文・PR 本文・コメントのテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（【必須】セクションの完備確認、【任意】は内容がある場合のみ含める）。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず、合意済み入力を Definition Package と Root Case 本文へ反映する
- 新規 Decision は proposed のままとし、accepted への状態遷移を実行しない
- Root Case 確立後の状態は open とし、実装開始を許可しない。ready への遷移は case-ready が実行する
- 再実行時は既存 Root Case および既存 Draft Definition PR を再利用し、不足分だけを処理して重複生成しない
- canonical Definition に実変更がある場合のみ Draft Definition PR を作成し、Case 単位で 1 件とする。実変更がない場合は作成しない
- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）。capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める
- 上流工程（req-define）で確定した対象要件を Definition Package 経由で Root Case へ引き継ぐ。req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しない
- GitHub の読み取りは Custom Tool `agentdev_gh` の読み取り操作（issue_read、pr_read 等）経由で行う。work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- Root Case 本文、Draft Definition PR 本文の成果物本文は verbatim で返す（LF・空行・インデントを含む行構造を保持）。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）は実行しない。`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス指定（`git add <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行う
- draft（`.agentdev/drafts/req-draft-*.md`）と RU（`.agentdev/backlog/req-units/RU-*.md`）は削除しない。削除は case-ready が実行する
- Root Case 本文、Draft Definition PR 本文、コメントは Custom Tool `agentdev_gh` の操作（issue_create、pr_create、comment_create）で投入する。文字コード・一時ファイル等の実装詳細は Tool 内部に隠蔽される（`POL-gh-io-delegation`）
