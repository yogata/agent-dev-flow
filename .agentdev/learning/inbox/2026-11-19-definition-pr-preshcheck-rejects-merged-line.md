---
id: learn-20261119-definition-pr-preshcheck-rejects-merged-line
created_at: 2026-11-19
source: case-open deviation capture (Root Case #4162)
status: inbox
---
# draft の行統合を伴う置換後全文が設計PR機械工程の行構造事前確認で fail-closed 拒否される

- 問題事象: case-open STEP-4 の機械工程入力組立で、REQ-048 目的節第2段落の置換後全文（draft ACT-REQ-001〔1〕）が旧文の2行（「…生実行履歴を使って」と「各機構の便益…」）を1行へ統合する行構成（4行→3行）であり、prepare_definition_pr.ts の行構造事前確認（REQ-030-030）が「definition edit fails the line structure pre-check (newText must preserve the line separation of oldText and may only add lines): docs/requirements/REQ-048.md (oldText: 4 lines, newText: 3 lines)」で終了コード 1 により fail-closed 拒否した。同一入力の他の9編集（DEC-027・DEC-064 の frontmatter と本文注記、REQ-048 の updated と REQ-048-012・016 行、design-principles の updated と原則3行）は入力検証を通過していた
- 発生局面: case-open STEP-4 機械工程の --validate-input（Root Case #4162、draft req-draft-hypothesis-driven-control-changes、RU-0303）
- 検知方法: --validate-input の機械検証（stderr エラーメッセージと終了コード 1。副作用なし経路での早期検出）
- 根本原因: draft 側の組立検査（assemble-draft-section v0.2.0、assembly_evidence 済み）は段落内の折返し位置変更（行統合）を受理する一方、case-open の機械工程（REQ-030-030 の行区切り保全事前確認）は oldText から newText への行数減少を一律に拒否する。両契約の間で、行統合を含む正当な合意済み置換を機械工程へ投入できない契約ギャップが存在する
- 自律対応内容: draft の content を権威とし、newText の再折返しによる機械的回避は行わなかった（合意 edit_sha256 との対応喪失、REQ-030-027 verbatim 包含突合の粒度変更、非公式補完のいずれにも該当するため）。REQ-030-030 に従い適用を中止し fail-closed で停止した。設計PRは作成していない（Root Case #4162 は作成済み・open、冪等再利用可能）
- ユーザー確認有無: あり（停止報告と再開情報の提示。draft 再組立と機械工程契約の例外規定のいずれで解消するかは利用者判断）
- Decision/REQ/spec 影響: REQ-030-030（行構造事前確認）、REQ-030-027（verbatim 包含突合）、req-define の draft 組立契約（assemble-draft-section）
- 横展開観点: REQ/Design の段落置換を含む他の draft も、置換後全文が旧文より物理行数を減らす構成の場合に同一の拒否を受ける。draft 組立時に「置換後全文の行数が旧文の行数を下回らないこと」を事前確認すれば予防できる
- 再発条件: artifact_actions の update 系 content が、対象セクション内の旧文の2行以上を1行へ統合する（行数を減らす）構成で組まれた場合
- 予防策候補: （1）req-define 側組立検査への行数不減少事前確認の追加、（2）機械工程契約への段落単位の意味等価を条件とした行統合例外規定の追加。両案とも利用者判断と別件対応が必要
- 想定反映先: req-define の組立検査（assemble-draft-section）改訂 Case、または prepare_definition_pr 入力契約改訂 Case
- 関連: Case #4162、REQ-030-027、REQ-030-030、draft req-draft-hypothesis-driven-control-changes（ACT-REQ-001〔1〕・assembly_evidence ASM-REQ-048-PURPOSE）
- タグ: 機械工程、fail-closed、契約ギャップ、検知系
