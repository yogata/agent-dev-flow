---
id: learn-20261119-coverage-declaration-pin-follow-up
created_at: 2026-11-19
source: case-run deviation capture (Root Case #4150・PR #4161)
status: inbox
---
# 対応宣言の追記で inline 宣言 pin 型テストが fail し、同一 PR での追随更新規律の適用が漏れた

- 問題事象: bun test の固定値テスト（stage_gate_verification_classification の inline 宣言 pin）が対応宣言（traceability sidecar への verification 追記）で fail した。対応宣言の追記と pin 型テストの追随更新を同一 PR で完結させる規律（delegation-and-result.md の事前 grep 前置）の適用が漏れていた。pre-push Step 3 の attempt2 で検出し同一 PR で修正した
- 発生局面: case-run（Issue 4156・Case 4150 Wave-4・PR 4161・pre-push Step 3）
- 検知方法: pre-push Step 3（bun test）
- 根本原因: 対応宣言の追記（verification 追記・宣言 pin 期待値）と pin 型テストの期待値が乖離。pin 型テストの事前 grep 前置が省略されていた
- 自律対応内容: 同一 PR で pin を追随更新（feat(phase4) コミット内で修正）
- ユーザー確認有無: なし（pin の機械的追随）
- Decision/REQ/spec 影響: 特になし
- 横展開観点: 対応宣言（traceability sidecar・inline ADF-COVERS）の追記は pin 型テストを follower として同一 PR で更新する。変更前の pin 型テスト事前 grep（宣言・token・件数 pin）を前置で実行しないと追随漏れが起きる
- 再発条件: 対応宣言の追記を含む変更で pin 型テストを更新しない場合
- 予防策候補: delegation-and-result.md の事前 grep 前置を対応宣言変更の標準前置とする
- 想定反映先: agentdev-workflow-orchestration references/delegation-and-result.md、case-run の pin テスト追随規律
- 関連: Case 4150、Issue 4156、PR 4161（Findings F8）
- タグ: pin テスト、対応宣言、traceability、追随更新
