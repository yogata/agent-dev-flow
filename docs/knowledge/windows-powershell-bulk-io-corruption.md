---
title: Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク
created: 2026-09-01
updated: 2026-09-07
---

# Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク

## 知識内容

Windows 環境で PowerShell を既存ファイルへ使う場合、次の4系統の破壊リスクがある。

1. cp932 解釈による全面文字化け: Windows PowerShell の Get-Content は既定で ANSI（cp932）解釈するため、UTF-8（BOM なし）ファイルを Get-Content で読んで Set-Content で書き戻すと全面文字化けする（PR 2458・AGENTS.md 既知事象と同一系統の再確認）。
2. CRLF 書き出し: pwsh の Set-Content は既定で CRLF を書き出すため、LF 保持のままの全面置換はできず行末が全面変化する（PR 2434 / Issue 2430）。LF 保持の全面置換は node の readFileSync/writeFileSync 併用が安全。
3. リダイレクト経由の UTF-8 破壊: PowerShell のパイプ・リダイレクト・Out-File 経由で外部コマンド（checker、gh CLI、git 等）の stdout を受け取り、テキスト処理やファイル退避に使うと、コンソールコードページ（cp932）再解釈により UTF-8 出力が破壊される（PR #2440、PR #2459、PR #2595 の gh CLI 出力退避で確定確認）。
4. git show パイプの cp932 デコード: git show 等の出力をパイプでファイル化する場合も cp932 デコードにより破壊し得る（learning クラス2）。

標準回避手段: 既存 UTF-8/LF ファイルの一括読み書きには PowerShell 標準 cmdlet を使わず、edit ツール（per-line string replace）・node の readFileSync/writeFileSync・[System.IO.File] の明示エンコーディング指定を標準とする。Write ツールの全面上書きは新規ファイル作成に限定する。
コンソール出力退避の標準手順: 外部コマンドの stdout 取得・退避では node の execFileSync/spawnSync に `encoding: "utf8"` を明示し、writeFileSync（utf8）と組み合わせるか、[System.IO.File] の明示エンコーディング指定を使う。PowerShell のパイプ・リダイレクト・Out-File 経由の退避はコンソール出力退避全般の標準手順から除外する。

## 適用条件

- Windows 環境（win32）で PowerShell（pwsh / Windows PowerShell）を使用する場合。
- 対象ファイルが既存の UTF-8（BOM なし）・LF のファイルである場合（repo 標準の文字コード・行末）。
- 一括読み書き（全面読込→全面書込、置換、リダイレクト、パイプ出力のファイル化）を行う場合。

## 適用対象

- AGENTS.md ガイドレール（行動規範。PowerShell cmdlet 系の破壊リスク規定として追記対象）。
- case-run 委譲手順（src/opencode/skills/agentdev-workflow-case-run/ の実行担当サブエージェントへの委譲手順。追記は別判断）。
- checker stdout 退避（機械検査出力をファイルへ退避する場面。同じ破壊系統が適用される）。
- gh CLI 等の外部ツール出力の退避（`gh pr view --json` 、`git show` 等の出力退避。PR #2595 の case-close capture 回収で同一系統を再確認）。

## 根拠

- PR 2458（Get-Content / Set-Content による cp932 全面文字化け・AGENTS.md 既知事象の再確認）、PR 2434 / Issue 2430（Set-Content による CRLF 全面変化）、PR 2459（同系破壊の是正）。
- PR #2595（Issue #2594）case-close capture 回収: `gh pr view --json body` を Out-File 退避した際の cp932 文字化け。node execFileSync（encoding utf8）+ writeFileSync（utf8）で回避。項3規定化の第4観測。
- learning クラス2（git show パイプの cp932 デコード破壊。項4として記録）・クラス12（PowerShell パイプ/リダイレクト系の UTF-8 出力破壊。項3として規定化済み）。
- AGENTS.md 既知事象（Write ツール全面上書きの cp932 化け実証済み）。

## 関連知識

- Write ツール全面上書きの cp932 事象（AGENTS.md に実証済みの既知事象として記録。Write ツールは新規ファイル作成に限定）。
- edit ツール優先ガイドレール（既存 UTF-8（BOM なし）ファイルの編集は per-line string replace の edit ツールを優先する AGENTS.md 行動規範）。
- checker CLI の stdout ロス（Windows + bun）と encoding 破壊の区別（[checker-cli-stdout-loss-on-windows-bun.md](checker-cli-stdout-loss-on-windows-bun.md)。bun の process.exit による stdout ロス系統と本書の cp932 再解釈系統は別現象だが隣接）。
