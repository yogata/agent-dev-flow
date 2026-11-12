# integrity suite の relied-diff / allocation / 上位層 docs 検査系テストの repo-state 独立性の課題（並行 Case の merge により fail し得る）

## 観測事実

- Case #4005（PR #4020 本文 Findings/intake 候補・検証差分 #4 の対照実行）で記録。integrity suite の relied-diff（AC01〜AC09・T1〜T5）・allocation round-trip・上位層 Tool 操作契約系テストは git history・docs text 依存で、並行 Case の merge により fail し得る。固定基線時点 `474180ed` では T6 のみ・implementation-free main root（`409e13a50`）でも同一 fail 集合が再現し、並行 merge 由来の環境起因・実装起因 0 と突合した。
- 本受入では fail 全件（23 件）を例外台帳（Root Case #4005 コメント 6812474387）として承認済み。テスト自体が特定 repo 状態（docs 記述・git history のエッジ構成）に依存するため、並行 run の進行で既知集合が変動する。

## 処置候補

- 上記テスト群の repo-state 独立性の是正（fixture 化・docs 記述の実在確認への変換等）を promote 判断で評価する。2026-11-08-bun-test-preexisting-baseline-fails.md（pre-existing fail の baseline 処置）は同一領域の別観点。promote 時に両記録を突合して統合判断すること。

## 関連

- Case #4005・PR #4020（検証差分 #4）・Root Case #4005 コメント 6812474387・2026-11-08-bun-test-preexisting-baseline-fails.md
