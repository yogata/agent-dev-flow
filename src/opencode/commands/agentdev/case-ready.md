---
description: Root Case の Definition を受入し実行準備完了（ready）へ遷移させる
---

# Case実行準備

Root Case の Definition 受入と実行準備完了（ready）への状態遷移を行う。
本コマンドは Definition 受入準備フェーズ（case-open）と実装実行フェーズ（case-run）の境界に位置する。
Definition PR が存在する場合、req-define で合意済みの意味内容に対する忠実な投影であること、整合性、必要な品質検査を確認し、merge 実行前に pr_read の isDraft で Draft 状態を確認した上で、新しい意味判断が不要なら追加承認なしで自動確定・merge する。
isDraft: true の場合は pr_merge を実行せず、GitHub Draft PR が正規 lifecycle 外であり merge 不可であることを理由として blocked で停止する（draft 解除の自動実行、raw gh WRITE による復旧は行わない）。
新しい Decision、意味変更、対象範囲拡大、意味的な不整合解消等が必要な場合は停止し HITL とする。
merge 後に canonical Definition を再取得し、execution contract 確定、Standard / Epic 確定、検証対応要否の最終ゲート、ready 遷移、draft / RU 削除を実行する。

## 入力

- Root Case（Issue 番号または URL。case-open が作成した状態 open の Root Case）
- 関連する req_draft（存在する場合）
- Definition PR / Definition Amendment PR（存在する場合）

## 出力

- ready 状態の Root Case
- 確定済み execution contract（Root Case 本文へ確定）
- 実行構造（Standard は Root Case 自身を単一 execution unit。Epic は Child Issue と Wave / 依存構造）
- 完了報告（case-ready 完了報告テンプレート）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-case-ready` スキルへ委譲する。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造は同スキルの制御平面（control plane）が所有する。
Issue 本文・PR 本文・コメントのテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（【必須】セクションの完備確認、【任意】は内容がある場合のみ含める）。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- 新しい意味判断を必要としない Definition PR は追加の人間承認を要求せず自動的に確定・merge する。merge 後に canonical Definition を再取得し、以降の処理をその基準で行う。merge は巻き戻さない
- 機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず、合意済み Definition を execution contract へ投影する
- runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は事前確定せず case-run の安全検査として維持する
- 再実行時は merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分だけを処理する
- 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）。capture 本文は完了報告に含めず、保存した成果物のパス・分類・保存結果のみを `Capture結果` 小節へ含める
- GitHub の読み取りは Custom Tool `agentdev_gh` の読み取り操作（issue_read、pr_read、comment_list 等）経由で行う。work_type 判定基準と固有ルールは `agentdev-workflow-lifecycle` を参照する
- Root Case 本文、Issue 本文、コメントの成果物本文は verbatim で返す（LF・空行・インデントを含む行構造を保持）。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

否定規則は破壊的操作・state 破壊等の硬い境界に限定する:

- 共有作業ツリーでスイープ操作（`git add -A`/ `git add .`/ `git add --all`/ `git commit -a`/ `git checkout .`/ `git reset --hard`/ `git stash`/ 非所有パスへの `git checkout -- <path>`/ `git restore <path>`）は実行しない。`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス指定（`git add <path>`）+ `git commit -- <paths>`（--only pathspec 形式）で行う
- draft（`.agentdev/drafts/req-draft-*.md`）と RU（`.agentdev/backlog/req-units/RU-*.md`）は成功時のみ削除する。blocked、failed、中断時は保持する
- Root Case 本文、Epic Issue 本文、子 Issue 本文、コメントは Custom Tool `agentdev_gh` の操作（issue_update、issue_create、pr_create、comment_create、pr_merge）で投入する。文字コード・一時ファイル等の実装詳細は Tool 内部に隠蔽される（`POL-gh-io-delegation`）
- Epic Issue 本文のステータス追跡テーブルは更新しない（単一書き手は case-close）
