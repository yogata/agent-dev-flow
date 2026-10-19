# case-run scripts テスト領域の型検査枠組み不在（tsconfig 管理方式の未確定）

## 観測内容

- 出所: case-close Capture 回収（Case Issue #3814 / PR #3815 `## Findings / Capture候補` 第2項。親 Epic #3803）
- src/common/skills/agentdev-workflow-case-run/scripts/tests/ のテストファイルは package.json / tsconfig を持たず、typecheck は近接 package の型環境（typescript + @types/bun を bun install した上で変更 .ts を単体指定した tsc --noEmit）で実施された（PR #3815 検証差分参照）。
- HOLD_AND_CONTINUE_TOKENS の宣言のみの未使用状態がこの不在下で長期未検出だった（同日 learning entry 参照）。

## 影響

- テスト領域の型検査が恒常的な gate ではなく ad hoc 実行に依存しており、型の不整合が長期未検出になり得る実績がある。
- 恒常的な検査経路がないため、scripts/tests 配下の変更時の型検査の実施・省略が実行者の裁量に置かれている。

## 課題

- テストファイルの型検査を恒常的に担う配置方式（local package tsconfig 統合・typecheck gate 組込み）の要否が未確定。
- 統合する場合の case-run scripts/tests への適用範囲と実行経路（bun test 併用指針との整合）が未確認。
- 既存 REQ-112 / REQ-113 の範囲に case-run scripts/tests が含まれるかの接続確認が未実施（重複分析の入口。含まれる場合は新規 RU 化ではなく既存 REQ 範囲の接続となる）。

## 既存要件との関連

- REQ-112 / REQ-113（local package tsconfig 二重管理統合・typecheck gate 組込み。接続確認先）
- checker 実行契約 Design「bun test と typecheck の併用指針」節（併用契約の参照点）
- src/common/skills/agentdev-workflow-case-run/scripts/tests/（tsconfig 管理不在領域）

## 人間判断ポイント

- 型検査枠組み整備の要否と、REQ-112 / REQ-113 の範囲接続（適用範囲の拡張確認）か新規 RU 化かの方向性。
