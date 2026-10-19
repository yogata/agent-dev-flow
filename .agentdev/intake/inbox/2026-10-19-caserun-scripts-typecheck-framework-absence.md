# case-run scripts テスト領域の型検査枠組み不在（tsconfig 管理方式の未確定）

- 出所: case-close Capture 回収（Case Issue #3814 / PR #3815 `## Findings / Capture候補` 第2項。親 Epic #3803）
- 種別: テスト領域の型検査基盤整備の検討候補（要否判断は別工程）
- 事実: `src/common/skills/agentdev-workflow-case-run/scripts/tests/` のテストファイルは package.json / tsconfig を持たず、typecheck は近接 package の型環境（typescript + @types/bun を bun install した上で変更 .ts を単体指定した tsc --noEmit）で実施された（PR #3815 検証差分参照）。HOLD_AND_CONTINUE_TOKENS の宣言のみの未使用状態がこの不在下で長期未検出だった（同日 learning entry 参照）
- 提案: テストファイルの型検査を恒常的に担う配置方式（local package tsconfig 統合・typecheck gate 組込み）の要否を検討する。REQ-112 / REQ-113（local package tsconfig 二重管理統合・typecheck gate 組込み）の範囲との接続確認候補。統合する場合は case-run scripts/tests への適用範囲と実行経路（bun test 併用指針との整合）を確認する
- 対象: src/common/skills/agentdev-workflow-case-run/scripts/tests/（tsconfig 管理不在領域）、REQ-112 / REQ-113（local package tsconfig 統合・typecheck gate。接続確認先）、checker 実行契約 Design「bun test と typecheck の併用指針」節（併用契約の参照点）
