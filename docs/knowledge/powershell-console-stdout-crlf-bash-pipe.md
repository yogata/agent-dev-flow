---
title: PowerShell コンソール標準出力の CRLF が bash パイプ受信の行指向処理を破壊する問題
created: 2026-09-24
updated: 2026-09-24
---

# PowerShell コンソール標準出力の CRLF が bash パイプ受信の行指向処理を破壊する問題

## 知識内容

PowerShell の `[Console]::WriteLine` は行末に CRLF を出力する。LF 前提の bash パイプ（`base64 -d` 等の行指向処理）へ stdout を渡すと、各行末の CR が残ってデコード・処理が失敗する。末尾行のみ CR が剥がれて一部成功するため、失敗が末尾以外に分散し検出が遅延する。

標準回避手段: PowerShell から外部へ stdout を渡す場合は `[Console]::OpenStandardOutput()` への LF 付きバイト直書きを標準手段とする。実測では HKCU 環境変数列挙 14変数中13エントリがデコード失敗した状態を、OpenStandardOutput + LF 付きバイト直書きへの修正と fix-and-reverify により 0 malformed に解消した。

本書は PowerShell 経由の破壊リスクのうち、コンソール標準出力（stdout パイプ面）の CRLF 問題を対象とする。ファイル I/O 系の破壊（cp932 再解釈・CRLF 全面書き出し）は [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md) を参照する。

## 適用条件

- Windows 環境（win32）で PowerShell を使用し、その標準出力を bash 側へパイプ・連携する場合。
- bash 側の受信処理が行指向（LF 前提のデコード、base64 -d、行単位の parse 等）である場合。

## 適用対象

- PowerShell から生成した文字列（base64 エンコード結果、環境変数列挙、JSON 行等）を bash の行指向ツールへ渡す全処理。
- supervisor 環境向け credential 供給ブリッジ等の PowerShell・bash 混在連携（[supervisor-bridge-credential-supply.md](supervisor-bridge-credential-supply.md) の base64 ASCII stdout 回避の実例。本書は WriteLine CRLF の一般化記載を補う）。

## 根拠

- TS-004 導入検証の HKCU 環境変数列挙実測（Case #3080 case-run 実行中）: 列挙エントリのデコード失敗（14変数中13エントリ）を検知、`[Console]::OpenStandardOutput()` への LF 付きバイト直書き修正で 0 malformed に解消（PR #3082 検証差分）。
- learning クラス2（2026-09-24 評価、問題クラス2。8軸評価 26/40、project knowledge（category 4）として新規知識化確定）。

## 関連知識

- [windows-powershell-bulk-io-corruption.md](windows-powershell-bulk-io-corruption.md)（PowerShell 経由のファイル I/O 系破壊リスク。本書は stdout パイプ面の隣接知見）。
- [supervisor-bridge-credential-supply.md](supervisor-bridge-credential-supply.md)（base64 ASCII stdout の回避実例）。
