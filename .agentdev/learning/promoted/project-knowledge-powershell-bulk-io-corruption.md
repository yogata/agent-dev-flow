# AGENTS.md 文字化け/改行破壊ガイドレールの PowerShell 標準 cmdlet 系への一般化

## 背景

Windows 環境で PowerShell 標準 cmdlet（Get-Content / Set-Content）により既存 UTF-8/LF ファイルを書き換えた結果、cp932 解釈による全面文字化け（PR 2458、AGENTS.md 既知事象と同一系統の再確認）と CRLF 行末の全面変化（PR 2434 / Issue 2430）が発生した。AGENTS.md の現行ガイドレールは Write ツール系（edit ツール優先・全面上書きは新規ファイル限定・cp932 化け実証済み）までしか一般化されておらず、PowerShell cmdlet 系が欠落している。

## 問題

- AGENTS.md ガイドレールが Write ツール系のみを対象とし、PowerShell 標準 cmdlet 経由の一括読み書きによる破壊（cp932 解釈・CRLF 書き出し）を規定していない
- 同系知見が deferred（L1231–1247、2026-08-18 の一括読み書き空ファイル破壊）にも存在し、再発が継続している

## 望ましい変更

AGENTS.md 行動規範へ「PowerShell 標準 cmdlet（Get-Content / Set-Content）経由の既存 UTF-8/LF ファイル一括読み書きは避け、edit ツール・node readFileSync/writeFileSync・[System.IO.File] 明示エンコーディングを標準とする」規定を1項目追加する。

## 対象範囲

### 対象

- AGENTS.md（行動規範への1項目追加）

### 対象外

- src/opencode/skills/agentdev-workflow-case-run/ 委譲手順への追記（別判断）
- クラス12（PowerShell パイプ/リダイレクト系の UTF-8 出力破壊）は今回の反映先確認が未了のため対象外（次回 living pool 再評価）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| agents | AGENTS.md | PowerShell cmdlet 系の破壊リスク（cp932・CRLF）と標準手段を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー）
- **該当ファイル**: AGENTS.md（Write ツール系規定のみ）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: Get-Content / Set-Content（CRLF 書き出し・cp932 解釈）への言及なし（現行文確認済み）

## 制約

- 既存 Write ツール規定と矛盾させない（一般化の位置づけで追記）
- repo 標準（UTF-8 BOM なし・LF）の記述と整合させる

## 受け入れ条件

- [ ] PowerShell cmdlet 系の破壊リスクと標準手段が AGENTS.md に明記されている
- [ ] 既存 Write ツール規定と矛盾がない

## 元learning item / 根拠

- **要約**: Windows PowerShell による既存 UTF-8/LF ファイルの書き換え破壊（cp932・CRLF、2件＋同系 deferred 1件）
- **根拠**: 「pwsh の Set-Content は CRLF を書き出すため LF 保持の全面置換は node の readFileSync/writeFileSync 併用が安全」「Windows PowerShell の Get-Content | Set-Content による UTF-8 ファイルの cp932 文字化け（再確認）」— 8軸評価 31/40（影響4・横展開4・反映先明確5・固有知識5）
- **再発条件**: pwsh の Get-Content/Set-Content 経由で既存 UTF-8/LF ファイルを書き換え
- **横展開可能性**: Windows＋PowerShell＋UTF-8/LF リポジトリの組合せ全般

## 推奨Issue分類

- **分類**: docs_chore
- **推奨ラベル**: documentation
- **関連Issue**: なし
