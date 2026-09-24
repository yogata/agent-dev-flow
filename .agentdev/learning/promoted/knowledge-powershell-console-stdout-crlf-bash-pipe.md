# PowerShell コンソール標準出力の CRLF が bash パイプ受信の行指向処理を破壊する問題

## 背景

14変数中13エントリがデコード失敗し、OpenStandardOutput + LF 付きバイト直書きで0 malformedに解消。

## 問題

[Console]::WriteLine の CRLF 出力が LF 前提の bash パイプ（base64 -d 等）と不整合。末尾行のみ成功するため検出が遅延する

## 望ましい変更

[Console]::OpenStandardOutput() + LF 付きバイト直書きを標準手段化

## 対象範囲

### 対象

- docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接知見候補。具体的な保存先は req-define が確定）

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接知見候補。具体的な保存先は req-define が確定） | なし。既存文書はファイルI/O系に限定され、本件は stdout パイプ面の別知見。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接知見候補。具体的な保存先は req-define が確定）
- **ギャップ分類**: なし（別面の知見）
- **ギャップ詳細**: なし。既存文書はファイルI/O系に限定され、本件は stdout パイプ面の別知見。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: PowerShell コンソール標準出力の CRLF が bash パイプ受信の行指向処理を破壊する問題
- **根拠**: 14変数中13エントリがデコード失敗し、OpenStandardOutput + LF 付きバイト直書きで0 malformedに解消。
- **再発条件**: evaluation-report の問題クラス2および原エントリを参照
- **横展開可能性**: Windows + PowerShell + bash 連携の全局面

### 原エントリ（証跡）

### Inbox 原文 1

## PowerShell WriteLine の CRLF 出力が bash パイプ受信の行指向処理を破壊する

- **問題事象**: PowerShell `[Console]::WriteLine` は CRLF を出力し、bash の `$(...)` パイプ受信では行末 CR が残って `base64 -d` 等の行指向処理が失敗する。末尾行のみ CR が剥がれて一部成功するため検出が遅れる
- **発生局面**: 実装（TS-004 導入検証の HKCU 環境変数列挙実測。Case #3080 case-run 実行中）
- **検知方法**: 列挙エントリのデコード失敗（14 変数中 13 エントリが失敗）
- **根本原因**: `[Console]::WriteLine` の CRLF 出力（コンソール標準の行末が LF 前提の bash パイプと不整合）
- **自律対応内容**: `[Console]::OpenStandardOutput()` への LF 付きバイト直書きへ修正し、fix-and-reverify で列挙完全性を 0 malformed に解消
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: `docs/knowledge/windows-powershell-bulk-io-corruption.md` の隣接系統（PowerShell 経由の外部連携処理全般）。本 Case の知識文書（supervisor-bridge-credential-supply.md）にも回避策を記載済み。learning inbox への昇格候補として PR 本文に記録されたものを case-close が回収
- **再発条件**: PowerShell 標準出力を bash 側の行指向ツールへパイプする全処理
- **予防策候補**: PowerShell から外部へ stdout を渡す場合は `[Console]::OpenStandardOutput()` + LF 付きバイト書き出しを標準手段とする旨を windows-powershell-bulk-io-corruption.md 系の知識へ追記する
- **想定反映先**: docs/knowledge/windows-powershell-bulk-io-corruption.md（隣接系統の追記候補）
- **関連**: PR #3082 検証差分 TS-004、docs/knowledge/supervisor-bridge-credential-supply.md
- **タグ**: `#windows` `#PowerShell` `#CRLF` `#bash連携`

---

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 2
- **確定処分**: project knowledge (category 4)
- **加重合計**: 26/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 14変数中13エントリの失敗だが fix-and-reverify で解消 |
| 横展開性 | 4/5 | Windows + PowerShell + bash 連携の全局面 |
| 反映先明確度 | 5/5 | 既存知識文書に隣接し反映経路が明確 |
| 自動化適性 | 3/5 | 手順知識として標準化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows 環境運用の中核的落とし穴 |
| 再発可能性 | 3/5 | PowerShell→bash パイプは頻出 |
| 費用対効果 | 4/5 | 知識追記のみで予防可能 |

### 判定基礎（evaluation-report verbatim）

### 問題クラス2: PowerShell コンソール標準出力の CRLF が bash 行指向処理を破壊
- **根本原因**: [Console]::WriteLine の CRLF 出力が LF 前提の bash パイプ（base64 -d 等）と不整合。末尾行のみ成功するため検出が遅延する
- **再発条件**: PowerShell 標準出力を bash 側の行指向ツールへパイプする全処理
- **予防策**: [Console]::OpenStandardOutput() + LF 付きバイト直書きを標準手段化

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | inbox 1件 |
| 影響度 | 2/5 | 14変数中13エントリのデコード失敗だが fix-and-reverify で解消 |
| 横展開性 | 4/5 | Windows + PowerShell + bash 連携の全局面 |
| 反映先明確度 | 5/5 | windows-powershell-bulk-io-corruption.md（隣接系統）と本 Case 知識文書に反映経路が明確 |
| 自動化適性 | 3/5 | 手順知識として標準化可能 |
| プロジェクト固有知識再利用性 | 4/5 | Windows 環境運用の中核的落とし穴 |
| 再発可能性 | 3/5 | PowerShell→bash パイプは頻出 |
| 費用対効果 | 4/5 | 知識追記のみで予防可能 |
| **加重合計** | **26/40** | |

- **推奨処分案**: project knowledge（category 4）— 既存知識文書 windows-powershell-bulk-io-corruption.md は「一括読み書きによるファイル破壊（cp932・Set-Content CRLF）」を対象とし、コンソール stdout パイプ経路の CRLF 問題（WriteLine → OpenStandardOutput LF バイト直書き）は未カバー。当該文書はファイル I/O 系にスコープを限定した文書であり手順の不備ではなく、本件は別面（stdout パイプ）の新規隣接知見であるため category 4（新規知識化）とし、category 5（既存文書の不備）としない。反映先の具体選択は req-define が確定する
- **既存対策照合**: windows-powershell-bulk-io-corruption.md（ファイルI/O系のみ・本件経路は未 coverage）/ supervisor-bridge-credential-supply.md（base64 ASCII stdout の回避実例あり、WriteLine CRLF の一般化記載なし）
- **エントリ一覧**: PowerShell WriteLine の CRLF 出力が bash パイプ受信の行指向処理を破壊する [inbox]

