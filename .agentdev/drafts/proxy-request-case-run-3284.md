# gh write-proxy request — DEL-3284-1（Case #3278 合意・外側 Supervisor write-proxy 運用）

## context

- 委譲: DEL-3284-1 / Case #3278（Root Case）/ Epic #3280 Wave 2-3 / 対象 Issue #3284
- 障害: agentdev_gh pr_create が gh exit 66（serve 全体劣化の可能性）で 2 回失敗（初回 + 契約上限の追試 1 回）。stderr 空・起動環境障害の兆候。委譲契約の gh 障害時プロトコルに基づき本 proxy package を作成
- 実装 commit: `258f9f6e`（branch `docs/issue-3284`、origin push 済み。push は gh 障害の影響を受けず成功）
- PR 不在確認済み: `gh pr list --head docs/issue-3284` = 空・`gh pr view docs/issue-3284` = not found（package 作成時点）

## exact operation

- operation: pr_create
- title: `Wave 2: RA-002 配布command定義の HITL・自律確定表現更新（Case #3278 OU-004）`
- base: `main`
- head: `docs/issue-3284`
- body: 本ディレクトリの `pr-body-3284.md` 全文を verbatim で使用（UTF-8 BOM なし・LF・本文先頭に ADF-COVERS(implementation): REQ-096-023 コメント行を含む）

## 事前条件

1. PR（head `docs/issue-3284` → base `main`）が存在しないこと（重複作成防止。作成前に再確認すること）
2. head branch `docs/issue-3284` の先端が `258f9f6e` であること
3. 操作は pr_create に限定（merge・Issue close・ラベル操作・コメント書込みは本 request の対象外）

## read-back 期待値（作成後の検証基準）

| 項目 | 期待値 |
|---|---|
| state | OPEN |
| base | main |
| head | docs/issue-3284（head sha = 258f9f6e） |
| changed files | 9件: `src/opencode/commands/agentdev/{intake-promote,learning-promote,inspect-promote,backlog-review,case-auto,req-define,README}.md`（7件変更）+ `traceability/ra002-commands-correction.yaml`（新規）+ `traceability/src-opencode-correction.yaml`（変更） |
| title | 上記 exact 文字列と一致 |

- body 必須セクション（全 9 セクション）: `実行識別情報` / `概要` / `変更内容` / `検証差分` / `adversarial-review 非発動記録` / `Findings / Capture候補` / `Design確定候補` / `関連`
- 実行識別情報セクション内に `adf_delegation: DEL-3284-1` を含むこと

## 作成後の検証手順

1. `gh pr view <number> --json state,baseRefName,headRefName,files,title` で上記 read-back 期待値を確認
2. body が `pr-body-3284.md` と verbatim 一致することを確認（セクション見出し9種の存在確認で代用可）
3. 確認結果の記録: read-back 確認の結果は Issue #3284 へのコメント記録は本 request の対象外のため、本ファイル末尾へ追記するか case-close 引き継ぎ情報として Supervisor 側で保持する

## 禁止事項（Supervisor proxy 側にも適用）

- gh CLI 直接書込みによる本 request 以外の操作（merge・close・Epic #3280 本文更新・完了条件チェックボックス更新は case-close 責務のため禁止）
