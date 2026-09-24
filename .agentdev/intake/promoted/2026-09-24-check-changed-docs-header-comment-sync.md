# check_changed_docs.ts ファイル冒頭ヘッダコメントの旧文言残存（--help 出力外のソース内部コメント）

## 観測内容

check_changed_docs.ts L20-21（ファイル冒頭ヘッダコメント）に旧文言「--base-ref <git-ref> git diff の base ref（worktree 環境向け。--files と排他）」が残存している。

- Case #3084（PR #3096、check_changed_docs.ts ヘルプ文言の正典不整合是正）の実装時に確認。当該箇所は --help 出力外のソース内部コメントであり、本 Case の Execution Contract 修正対象 3 箇所（L52-56 / L188 / L190）外のため本 PR では修正していない。
- check_distribution_boundary.ts 等の他 checker 同種文言と同系の表記。RD-002 deferred pool への記録済みという主張は未確認のため、事実としては扱わない（未確認注記）。

## 影響

利用者がヘッダコメントから誤った CLI 契約（--files と排他等）を把握するおそれがある。動作への影響はない。

## 課題

ヘッダコメントの文言を正典契約へ整合させる是正。正典: コミット前 = --files 標準、--base-ref = コミット後・push 前限定、両者は排他でなくいずれか必須（check_changed_docs.ts L53-55、REQ-031-026、docs/designs/integrity/targeted-docs-guard-implementation.md）。処分区分候補: document_correction（低〜中優先度）。

## 既存要件との関連

REQ-031-026 が正典契約を規定。ヘッダコメント側が未同期の状態。
