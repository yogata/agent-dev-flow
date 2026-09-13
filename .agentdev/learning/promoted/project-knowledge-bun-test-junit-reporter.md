# bun test の fail 証跡取得は junit reporter で構造化する

## 背景

非 TTY（リダイレクト）環境で bun test の出力を log ファイルへ保存した際、fail 行が CR（キャリッジリターン）/ ANSI エスケープの上書き描画により log ファイル上に実質残らない環境がある（case 2777）。base と現行の fail 差分分離が必要な検証で、目視分離が不能になった。

## 問題

- bun test の進捗表示が CR 上書き + ANSI カラーコード前提の形式で出力され、非 TTY 環境でも上書き前の fail 行が保存されない場合がある
- 標準出力の tail 集計行だけでは証跡として不十分（fail ケース単位の同定が不可能）
- checker CLI の stdout 消失（process.exit flush・cp932 再解釈）とは別現象（checker-cli-stdout-loss-on-windows-bun.md との判別が必要）

## 望ましい変更

fail 差分が必要な検証では `--reporter=junit --reporter-outfile` で構造化出力を取得し、XML 解析（ElementTree 等）で fail ケース名を機械抽出する。標準出力の tail 集計行だけを証跡としない。

## 対象範囲

- 対象: bun test の結果を証跡として保存する全検証工程（case-run / case-close の QG 検証、CI 代替のローカル検証）、fail 差分分離
- 対象外: checker CLI の stdout 証跡（checker-cli-stdout-loss-on-windows-bun.md の対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| knowledge | docs/knowledge/（新規知識文書） | junit reporter による構造化証跡取得の知識化 |
| Design | docs/designs/integrity/checker-execution-contracts.md | bun test 実行形態契約への証跡形式補足 |
| knowledge | docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md | 関連知識への相互参照（現象の判別） |

## 既存対策確認

- 確認結果: checker stdout 系の知識は既存、bun test runner 出力の fail 行消失（CR/ANSI 上書き）は未カバー
- 該当ファイル: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
- ギャップ分類: fix gap
- ギャップ詳細: 対象（checker CLI プロセス）と原因（process.exit flush・cp932）が異なる別現象のため、bun test runner 出力の知識が不在

## 制約

- junit XML の解析は機械的に行う（目視での XML 読み取りは証跡手法としない）
- 実行コマンド列（reporter オプション付き）を証跡に併記し再実行可能性を保つ

## 受け入れ条件

- [ ] junit reporter による構造化取得手順（オプション・解析方法）が文書化されている
- [ ] 標準出力 tail のみを証跡としない運用が明記されている
- [ ] checker stdout 消失知識との判別点が整理されている

## 元learning item / 根拠

- 要約: bun test の fail 行が CR/ANSI 上書きで log に残らない環境での junit reporter 構造取得
- 根拠: inbox 2026-09-12（base 2486 pass/4 fail/4 errors と変更後 2488 pass/4 fail/4 errors の差分分離が必要な場面で log に fail 行なし。junit reporter + XML 解析で fail ケース抽出、差分 0 を確認）
- 再発条件: 非 TTY 環境で bun test の標準出力を証跡保存に使う場合
- 横展開可能性: bun test の結果を証跡とする全検証工程、CI ログ保存

## 推奨Issue分類

- 分類: feature（検証手段の知識化）
- 推奨ラベル: documentation, agentdev, testing
- 関連Issue: なし（case 2777 の知見）
