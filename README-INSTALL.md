# AgentDevFlow Release Archive — Install Guide

この README は release archive（`agentdev-release-<sha>.zip`）を受け取った利用者向けの導入手順書である。archive には AgentDevFlow 配布物（command / skill / reference / template / script）が実ファイルとして格納されており、Windows junction や Unix symlink に依存しない。

## 同梱内容

```
agentdev-release-<sha>/
  src/opencode/commands/agentdev/**.md
  src/opencode/skills/agentdev-*/**/**
  src/opencode/skills/japanese-tech-writing/**/**
  scripts/install-from-archive.ps1
  README-INSTALL.md
```

`scripts/install-from-archive.ps1` は配布物を `.opencode/` 配下へ実ファイルとして配置する導入スクリプトである。archive は配布物の自己完結を保証し、展開先リポジトリの `src/opencode/` 状態に依存しない。

## 前提

- Windows PowerShell 5.1 以降、または PowerShell 7 (`pwsh`)
- 展開先リポジトリのルートに書き込み権限

## 導入手順

```powershell
# 1. archive を一時ディレクトリへ展開
$temp = "<任意の一時ディレクトリ>"
Expand-Archive -LiteralPath "agentdev-release-<sha>.zip" -DestinationPath $temp -Force

# 2. 展開先のルート（archive 内の agentdev-release-<sha>/）を特定
$unpackedRoot = Join-Path $temp "agentdev-release-<sha>"

# 3. install-from-archive.ps1 を実行
& (Join-Path $unpackedRoot "scripts\install-from-archive.ps1") `
    -Source (Join-Path $unpackedRoot "src\opencode") `
    -Target (Join-Path $unpackedRoot ".opencode") `
    -Mode copy
```

導入完了後、`<unpackedRoot>/.opencode/commands/agentdev/` と `<unpackedRoot>/.opencode/skills/agentdev-*/` が実ファイルとして配置される。

## 終了コード

| コード | 意味 |
|--------|------|
| 0      | 成功（全配置完了、内容一致） |
| 4      | 配置先に既存ファイルがあり、内容が異なる（上書きせず停止） |
| 5      | 必須ディレクトリの作成に失敗、または Source が存在しない |

終了コード 4 の場合は、配置先を一旦退避するか削除してから再実行すること。

## 整合性検査

配布物の整合性は、host 側（agent-dev-flow リポジトリ）の `repo-agentdev-integrity` スキルが提供する `check_integrity.ts --profile installed` で検査する。archive 自体には checker を同梱しない（archive 自己完結と検査実行の分離、移行計画 §7.5）。

```powershell
bun run <host>/.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts `
    --profile installed `
    --root <unpackedRoot>
```

## 関連

- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §7（host 側の normative）
- 仕様: `<integrity-contracts>` SPEC「実行プロファイル分離（source/installed/release）」
