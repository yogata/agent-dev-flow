# Intake Item: check_command_format.test.ts command-format-zero-substep 違反 (Step N-0 命名)

## 発生源

- PR: #1529 (Issue #1528, Standard flow)
- 発生 phase: case-run テスト結果 / case-close QG-4
- capture 分類: intake (具体的修正対象 = command 定義 Step 命名規約)

## 問題

`check_command_format.test.ts` の `command-format-zero-substep` 検査が case-auto.md / case-close.md / req-save.md の既存 `Step N-0` 命名で違反を発生させる。事前由来の失敗であり、本 PR #1529 とは無関係（main でも同一）。

`Step N-0` リネーム（例: `Step 4-0` → `Step 4-1` 等）は SPEC/他ドキュメントの参照を含む広範囲 refactor となるため、Issue #1528 のスコープ外とした。

## 推奨修正対象

別途 inspect または case で対応候補:

1. `Step N-0` 命名を許容するよう check_command_format の検査基準を調整、または
2. 該当 command の `Step N-0` を別命名へ一括リネーム（SPEC、他ドキュメントの参照更新を含む広範囲 refactor）

影響範囲調査が必要なため inspect 系コマンドでの finding 化が適切。

## 関連

- PR: #1529 (Findings / Capture候補 セクション「事前由来テスト失敗（参考記録）」)
- 対象テスト: check_command_format.test.ts (command-format-zero-substep)
- 対象ファイル: src/opencode/commands/agentdev/case-auto.md, case-close.md, req-save.md
