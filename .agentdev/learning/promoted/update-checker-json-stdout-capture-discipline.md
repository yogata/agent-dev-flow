# checker --json 取得時の stdout 単独キャプチャ規律（メッセージ連結 variant）

## 背景

Case #3146（case-open STEP-4、Definition PR 検査期待値確定前の branch HEAD 実測）で check_integrity.ts --json の出力を node で JSON.parse したところ、JSON 直後に "Report written to: ..." メッセージ行が連結され SyntaxError で解析失敗した。

## 問題

- 観測された現象: --json stdout を機械解析した際、レポート書込みメッセージが JSON と連結して JSON.parse が失敗する
- **事実修正（コード実証）**: 現行 check_integrity.ts は "Report written to:" を console.error（stderr: L11352）で出力しており、git 履歴上 #611（2026-06-06、e32b9352）以降不変。元学びの「checker が stdout へ連結出力する」という根本原因記述は現行実装と不整合
- 混入の最有力説明は呼出側の stdout/stderr 統合キャプチャ（`2>&1` 付き実行、ハーネス bash のストリーム統合等。実証なし・推定）

## 望ましい変更

checker --json 出力を機械解析する工程では stdout を単独キャプチャする（stderr を統合しない）規律を確立し、既存知識文書の variant 群に当該 variant（メッセージ連結による JSON.parse 失敗）を追記する。

## 対象範囲

### 対象

- docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（variant 追記）
- checker --json を機械解析する工程（QG 検証、case-run / case-close 検証、worktree 実測）

### 対象外

- check_integrity.ts 側の出力分離（実装済みのため不要）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | メッセージ連結 variant と stdout 単独キャプチャ規律を追記 |

## 既存対策確認

- **確認結果**: なし（fix gap）
- **該当ファイル**: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md（stdout ロス・末尾破損・cp932 パイプ破壊等の variant 群を保有）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 当該 variant（stderr 由来メッセージの統合キャプチャ混入）と stdout 単独キャプチャ規律が未記載

## 制約

- 元学びの checker 側原因記述（stdout 連結出力）を知識として残さないこと（現行実装と不整合のため）
- 呼出側ストリーム統合の推定である旨を明記すること（実証なし）

## 受け入れ条件

- [ ] 知識文書に当該 variant と stdout 単独キャプチャ規律が記載されること
- [ ] checker 側原因説が知識として混入しないこと

## 元 learning item / 根拠

- inbox 2026-09-26「check_integrity --json の stdout にレポート書込みメッセージが混入し機械的 JSON 解析が壊れる」（Case #3146、PR #3152）: "Report written" 分割 workaround で実測取得
- 事実修正根拠: check_integrity.ts L11352 console.error 実読、git log -S "Report written to" が e32b9352（#611, 2026-06-06）のみ
