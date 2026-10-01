# proxy-case-open: Root Case 起票・Definition PR 作成 resume 手順（gh exit 66 blocked 時の payload）

> 本 package は case-open workflow の GitHub 副作用が agentdev_gh 起動環境障害（gh exit 66・stderr 空・全操作）で blocked となった際の resume payload である。
> 先行完了済み（gh 非依存）: Definition 変更 11ファイル編集・検査実測・commit（definition/issue-pending @ 92edf6ae）、冪等残骸確認、横断依存検査、adversarial-review skip 判定、Definition Package 生成。

## 永続化時点の durable state（2026-10-01、base 8c471d3e）

- Definition branch: ローカル definition/issue-pending、HEAD 92edf6ae（11 files changed, 65 insertions, 72 deletions）。worktree: .worktrees/pending-definition
- 冪等残骸: Root Case 0件（open issue は無関連 #3289 のみ、topic_slug タイトル検索 0件）、open PR 0件、remote definition/* branch なし（gh CLI 読取で確認済み）
- draft / RU: 未削除（削除は case-ready の責務）

## resume 手順（gh 回復確認後、最小 gh 呼出）

1. 疎通確認: agentdev_gh issue_read（任意の軽量読取）で ok: true を確認する。失敗が継続する場合は blocked を維持する
2. 残骸再確認（gh CLI 読取可）: issue_list / search で Root Case 未起票・definition/* branch 未push を再確認する。残骸検出時はそれを正として扱い本手順の該当工程を skip する
3. Root Case 起票: agentdev_gh issue_create に次を渡す。
   - title: Root Case: docs 現行モデル整合と圧縮基盤 — REQ-034-032・REQ-061-003・REQ-032-025 更新と Design 7件更新・純化・入口統合（docs-current-model-alignment-and-compression-foundation）
   - labels: [maintenance]
   - body: 本ディレクトリの proxy-case-open-docs-current-model-alignment-root-case-body.md の内容を verbatim で渡す
4. branch 改名と push: git -C .worktrees/pending-definition branch -m definition/issue-pending definition/issue-{N} の後、git push -u origin definition/issue-{N}。push 出力で refspec を確認する
5. Definition PR 作成: agentdev_gh pr_create に次を渡す。
   - title: docs(definitions): REQ-034-032/REQ-061-003/REQ-032-025 を REQ-096 判断アーキテクチャへ意味更新し Design 7件の判断境界・証跡保存契約・移行文書を現行化
   - head: definition/issue-{N} / base: main
   - body: proxy-case-open-docs-current-model-alignment-definition-pr-body.md の内容（実行識別情報の ADF_CASE_PLACEHOLDER を手順3の Issue 番号へ置換した上で verbatim 渡し。置換済み本文を改めてファイル保存してから渡す）
6. Root Case 本文の埋め戻し: agentdev_gh issue_update（number: {N}）で root-case-body.md の ADF_CASE_PLACEHOLDER を #N へ、DEFINITION_PR_PLACEHOLDER を Definition Package セクション内に PR 番号参照へ、DEFINITION_PR_PLACEHOLDER2 を 作成済み: PR番号 へ置換した本文で更新する。置換済み本文をファイル保存してから渡す（verbatim 維持）
7. 検証: issue_read / pr_read で読み戻し、本文・ラベル・head/base を確認する
8. proxy payload の始末: 消費後に本ファイル群（proxy-case-open-docs-current-model-alignment-*.md 3件）を削除して commit する（先例: consume proxy request after external Supervisor recovery pass）

## 検査実測値（Definition PR 本文の検証期待値。再実行時は再実測で置換）

- traceability check（行限定 REQ-034-032,REQ-061-003,REQ-032-025）: pass 9 / fail 0（missing-design 0件。REQ-061-003 は ADF-COVERS(design) 宣言追記で解消）
- traceability check（全体）: missing-design 765（main 比 −1）/ missing-implementation 108 / missing-verification 34。全て main 既存債務、新規 fail なし
- coverage --req REQ-061-003: design 対応 1件（case-ready.md）
- check_integrity: 新規 unmanaged NG 4件は全て main 既存債務（REQ-003-055 phantom ×3、gh-direct-invocation warning ×1）。自 Case 起因 0件、baseline 不変更
- check_autogen_freshness: 0件。generate_indexes.ts: no changes（派生物の PR 含入なし）
- 横断依存検査: 条件(a) 0件、条件(b) 2領域で需要検出（行集合分離、gate_effect: none。3選択肢は case-auto の decision_context 親判断解決へ委譲）

## 冪等キー

- topic_slug: docs-current-model-alignment-and-compression-foundation
- draft: .agentdev/drafts/req-draft-docs-current-model-alignment-and-compression-foundation.md
- source_rus: [RU-20261001-01]
- Definition branch commit: 92edf6ae（definition/issue-pending → definition/issue-{N} へ改名）
