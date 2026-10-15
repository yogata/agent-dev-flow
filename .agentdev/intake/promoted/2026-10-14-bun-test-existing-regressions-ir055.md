# IR-055 delta 回帰テストとローカルIssue role 条件付きスキーマテストの既存失敗を解消する

## 観測内容

2026-10-14 時点の bun test 全件実行で、IR-055 delta 回帰テストとローカルIssue role 条件付きスキーマテストが origin/main 無変更の比較用 worktree でも同一失敗を再現（既存債務・再現性あり）。bun test 実行時に src/common 配下 fixture で LF→CRLF 変換 warning が出力される環境要因の併記あり。

## 背景（実行 Case で扱わなかった理由）

Root Case #3675 は docs 現行化バッチであり、本 Case 起因の影響は 0件（pin 型・anchor 型期待値結合テスト含む）であることを確認済み。テスト修正はコード変更を伴うため本筋外。既存処遇として Issue #3684（IR-068/IR-055 債務の処遇 Case）が存在する。

## 影響

bun test 全件実行が既存債務起因で fail し、本 Case 起因 0件の分離証明（比較 worktree での再現確認）を毎回実施する手間が生じる。

## 課題（後段 review で決めること）

- IR-055 delta 回帰の baseline 更新（--update-ir055-baseline）の可否とタイミング
- ローカルIssue role 条件付きスキーマテストの期待値修正方針
- LF→CRLF warning の fixture 対策（.gitattributes 等の設定調整）の要否

## 既存要件・既存処遇との関連

- 既存処遇: Issue #3684（IR-068/IR-055 債務の処遇 Case）。統合・依存解決は後段 review で実施する
- 代替識別子: PR #3698 本文「Findings/ Capture候補」intake 4件目「Root Case #3675 の検証差分この行」

## 根拠

- 観測元: Root Case #3675（case-run 検証、2026-10-14。実行 cwd と起動コマンド形式は PR #3698 本文「テスト結果」参照）
- 証拠: bun test 全件実行（2909 tests across 115 files）の再現性ある失敗 2件。origin/main 無変更比較 worktree で同一再現を機械確認
