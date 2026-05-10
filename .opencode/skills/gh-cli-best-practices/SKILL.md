---
name: gh-cli-best-practices
description: Enforces safe GitHub CLI usage on Windows (PowerShell/cmd) by routing all multi-line body content through temporary files to prevent encoding and escaping errors. USE FOR: running gh issue/pr/release commands with --body or --body-file, reading gh command output safely on Windows, or writing Issue/PR content. DO NOT USE FOR: basic gh commands without body content, non-Windows environments, or general git operations.
---

# gh-cli-best-practices

## 動作指針

Windows上の標準シェル（PowerShell/cmd.exe）の制約を回避するため、以下の手順を強制する。

## WRITE操作（書き込み安全性）

### 1. 禁止事項

- `gh` コマンドの引数として `--body "..."` を直接使用することを禁止する。
- `<<EOF` (HEREDOC) 構文によるファイル作成を禁止する。
- PowerShell のファイル書き込みコマンド（`Out-File`, `Set-Content`, `>` リダイレクト, `>>` 追記リダイレクト, `New-Item`（コンテンツ付き）, `[IO.File]::WriteAllText`, `[IO.File]::WriteAllLines`）による一時ファイル作成を禁止する。
- **理由**: Windows環境では PowerShell のファイル書き込みコマンドがシステムデフォルトエンコーディング（Shift-JIS 等）を使用するため、UTF-8 での保存が保証されない。

### 2. 標準手順

1. テキスト（Issue本文、PR説明など）を **OpenCode の Write tool** を使用して一時ファイル `.sisyphus/tmp/gh-temp-{timestamp}.md` に書き出す。**PowerShell のファイル書き込みコマンド（Out-File, Set-Content, > 等）は使用禁止（Section 1 参照）。**
2. 保存形式は **UTF-8 (BOMなし)**、改行コードは **LF** とする。
3. `gh` コマンド実行時に `--body-file`, `--notes-file`, `--comment-file` 等、`--*-file` 形式のオプションで該当ファイルを指定する。
4. 実行完了後、一時ファイルを削除する。

## READ操作（読み取り安全性）

### 3. 安全な読み取り手順

1. `gh` コマンドの出力を一時ファイル `.sisyphus/tmp/gh-read-{timestamp}.md` にリダイレクトする（PowerShell 7 (pwsh): `gh ... > .sisyphus/tmp/gh-read-{timestamp}.md`）。**本スキルは PowerShell 7 (pwsh) 環境を前提とする**（pwsh の `>` リダイレクトは UTF-8 を生成する）。Windows PowerShell 5.x では `>` が UTF-16LE を生成するため使用不可（Section 4 参照）。
2. Read tool で一時ファイルを読み取る。
3. 読み取り完了後、一時ファイルを削除する。
4. 保存形式は **UTF-8 (BOMなし)**、改行コード **LF** とする。

### 4. 読み取り禁止事項

- `gh` コマンドの出力をPowerShell変数に直接格納することを禁止（`$var = gh ...`）。
- `gh` コマンドの出力をサブ式で直接使用することを禁止（`$(gh ...)`）。
- Windows PowerShell 5.x での `>` リダイレクトによる出力保存を禁止する（UTF-16LE になるため）。
- Windows PowerShell 5.x での `Out-File -Encoding utf8` による出力保存を禁止する（BOM 付き UTF-8 になるため）。
- **理由**: Windows PowerShellはUTF-8出力をShift-JISとして解釈し、日本語が文字化けするため。Windows PowerShell 5.x の `>` リダイレクトは UTF-16LE、`Out-File -Encoding utf8` は BOM 付き UTF-8 を生成し、いずれも「UTF-8 (BOMなし)」の要件に違反するため。
