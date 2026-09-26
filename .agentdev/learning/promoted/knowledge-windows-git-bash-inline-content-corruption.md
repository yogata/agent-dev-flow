# Windows Git Bash 経由の inline・heredoc コンテンツ伝達破損（2機構）

## 背景

Case #3142（DEL-3142-1）で bash から `node -e` へ正規表現を inline 記述した際、Git Bash の escape 解釈によりパターンが変質し checker 出力解析が破損した。 Case #3158（DEL-3158-1）では bash heredoc（`<<'EOF'`）で日本語を含む長大なファイル内容を書き出した際、中途で打ち切られファイルが不完全になった。

## 問題

Windows 環境の bash ラッパー経由でコードや長大な日本語コンテンツを機械伝達すると、shell 解釈層で内容が変質・欠落する。 機構は2種類があり、検知方法が異なる:

1. **argv escape 解釈**（Case #3142）: バックスラッシュを含む正規表現リテラルを shell 引数経由で inline 記述すると node 到達時点でパターンが変質する。 検知: 解析結果が期待と不一致
2. **heredoc stdin の中途打ち切り**（Case #3158）: 日本語を含む長大なコンテンツを heredoc で stdin 経由書き出すと中途で打ち切られる。 検知: 書き出し結果の内容突合

## 望ましい変更

該当コンテンツは shell 経由をやめ、project root 内の一時ファイル経由を標準手段とする:

- ファイル書き出し: Write ツール（新規一時ファイル、UTF-8 BOM なし確認済み）→ node fs.copyFileSync でバイトコピー → 正規パスへ配置 → 一時ファイル削除
- スクリプト実行: 正規表現を含む解析コードは project root 内の一時スクリプトファイルへ配置して実行し、検査後に削除

## 対象範囲

### 対象

- worktree-operations.md「書込み guard 運用指針」節（標準手段の知見拡張）
- checker 出力の機械解析・ファイル配置を行う全工程（case-run / case-close / inspect 系）

### 対象外

- PowerShell 経由のファイル I/O（AGENTS.md・docs/knowledge/windows-powershell-bulk-io-corruption.md 既存知識の対象）
- 「node -e + PowerShell 単一引用符ヒアドキュメント」代替技法（CL-3 成果物側に集約。本知識と補完関係）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/（新規知識文書候補） | 2機構（escape 解釈・heredoc 打ち切り）の個別検知方法とファイルベース標準手段 |
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 書込み guard 運用指針節への標準手段集約（CL-3 成果物と相互参照） |

## 既存対策確認

- **確認結果**: なし（fix gap 相当の新規知識）
- **該当ファイル**: docs/knowledge/windows-powershell-bulk-io-corruption.md（PowerShell ファイル I/O）、docs/knowledge/powershell-console-stdout-crlf-bash-pipe.md（PS→bash パイプ CRLF）— いずれも Git Bash inline・heredoc は未カバー。 worktree-operations.md に heredoc・一時スクリプトの知識なし（L196 のパス backslash 警告のみ）
- **ギャップ分類**: なし（新規知識）
- **ギャップ詳細**: 2機統の破損知見と標準手順が未整備

## 制約

- 「shell inline 一律禁止」へ過剰一般化しない（PowerShell 単一引用符ヒアドキュメントは素通し可能な代替技法。CL-3 成果物参照）
- 一時ファイルは project root 内限定・commit 対象外・検査後削除

## 受け入れ条件

- [ ] 2機構が別個の検知方法として記録されること（統合記述で潰さない）
- [ ] ファイルベース伝達の標準手順（Write→copyFileSync、一時スクリプト実行）が記載されること

## 元 learning item / 根拠

- inbox 2026-09-26「bash の node -e への正規表現 inline 記述は Git Bash の escape 解釈で破損する（checker 出力解析は一時スクリプトファイル経由が確実）」（Case #3142、PR #3154、DEL-3142-1）
- inbox 2026-09-27「Windows 環境の bash heredoc で日本語を含む長大なファイル内容を書き出すと中途で打ち切られる」（Case #3158、PR #3160、DEL-3158-1）: Write ツール→copyFileSync 手順で解消、新規ファイルへの Write が UTF-8 BOM なしで書き出されることを小さな検証ファイルで事前確認済み
- review F-1 限定条件: 2機構（argv escape 解釈による文字列変質／heredoc stdin の中途打ち切り）は別個の検知方法として記録する
