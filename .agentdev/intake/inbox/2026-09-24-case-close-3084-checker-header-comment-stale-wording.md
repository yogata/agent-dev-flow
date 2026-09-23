---
intake_type: workflow-observation
source_case: "#3084"
source_workflow: case-close
observed_at: 2026-09-24T02:56:00+09:00
status: unclassified
---

# 観測: check_changed_docs.ts ファイル冒頭ヘッダコメントの旧文言残存（--help 出力外のソース内部コメント）

## 観測内容

Case #3084（PR #3096、check_changed_docs.ts ヘルプ文言の正典不整合是正）の実装時に、check_changed_docs.ts L20-21（ファイル冒頭ヘッダコメント）に旧文言「--base-ref <git-ref> git diff の base ref（worktree 環境向け。--files と排他）」が残存していることを確認した。

- --help 出力外のソース内部コメントであり、本 Case の Execution Contract 修正対象 3 箇所（L52-56 / L188 / L190）外のため本 PR では修正していない。
- check_distribution_boundary.ts 等の他 checker 同種文言と同系（RD-002 deferred pool 記録済みの系譜。根本原因は checker 間 CLI 契約の推測流用）。

## 候補改善（要判断）

- check_changed_docs.ts L20-21 ヘッダコメントの文言を正典契約（コミット前 = --files 標準、--base-ref = コミット後・push 前限定、排他でなくいずれか必須）に整合させる是正候補。
- 他 checker（check_distribution_boundary.ts 等）の同種文言の一括棚卸し（RD-002 deferred pool と統合判断）。

## 関連

- Case #3084 / PR #3096（Findings intake 候補から回収）
- 正典 Design: docs/designs/integrity/targeted-docs-guard-implementation.md
