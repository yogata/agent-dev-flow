---
title: Windows Git Bash 経由の inline・heredoc コンテンツ伝達破損（2機構）は別個の検知方法で判別する
created: 2026-09-27
updated: 2026-09-27
---

# Windows Git Bash 経由の inline・heredoc コンテンツ伝達破損（2機構）は別個の検知方法で判別する

## 知識内容

Windows 環境の bash ラッパー経由でコードや長大な日本語コンテンツを機械伝達すると、shell 解釈層で内容が変質・欠落する。破損機構は2種類あり、検知方法が異なるため別個に記録する（統合記述に潰さない）:

1. **argv escape 解釈による文字列変質**（Case #3142）: バックスラッシュを含む正規表現リテラルを shell 引数経由（`node -e` 等）で inline 記述すると、Git Bash の escape 解釈により node 到達時点でパターンが変質する。検知方法: 解析結果が期待と不一致
2. **heredoc stdin の中途打ち切り**（Case #3158）: 日本語を含む長大なコンテンツを heredoc（`<<'EOF'`）で stdin 経由書き出すと、中途で打ち切られファイルが不完全になる。検知方法: 書き出し結果の内容突合

該当コンテンツは shell 経由をやめ、ファイルベース伝達を標準手段とする:

- ファイル書き出し: Write ツール（新規一時ファイル。UTF-8 BOM なしで書き出されることを小さな検証ファイルで事前確認済み）→ node fs.copyFileSync でバイトコピー → 正規パスへ配置 → 一時ファイル削除
- スクリプト実行: 正規表現を含む解析コードは project root 内の一時スクリプトファイルへ配置して実行し、検査後に削除する

「shell inline 一律禁止」への過剰一般化をしない。PowerShell 単一引用符ヒアドキュメント（`node -e` + 単一引用符ヒアドキュメント）は素通し可能な代替技法であり、本知識と補完関係にある。

## 適用条件

- Windows Git Bash 経由で正規表現リテラルを含むコードを inline 引数で渡す場合（機構1）
- Windows Git Bash 経由で日本語を含む長大なコンテンツを heredoc で書き出す場合（機構2）
- checker 出力の機械解析・ファイル配置を行う場合

## 適用対象

- worktree-operations.md「書込み guard 運用指針」節の標準手段（RU-0152 で集約。将来 Case で反映）
- checker 出力の機械解析・ファイル配置を行う全工程（case-run / case-close / inspect 系）
- 対象外: PowerShell 経由のファイル I/O（windows-powershell-bulk-io-corruption.md の対象）

## 根拠

- Case #3142（DEL-3142-1）: bash から `node -e` へ正規表現を inline 記述した際、Git Bash の escape 解釈によりパターンが変質し checker 出力解析が破損（PR #3154）
- Case #3158（DEL-3158-1）: bash heredoc で日本語を含む長大なファイル内容を書き出した際、中途で打ち切られファイルが不完全に。Write ツール→copyFileSync 手順で解消（PR #3160）

## 関連知識

- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（PowerShell 経由ファイル I/O の破損。本知識は Git Bash inline・heredoc 系統）
- [PowerShell コンソール出力の CRLF 化と bash パイプ](powershell-console-stdout-crlf-bash-pipe.md)（PS→bash パイプ系統の別現象）
- worktree-operations.md「書込み guard 運用指針」節（RU-0152 での標準手段集約・相互参照先）
