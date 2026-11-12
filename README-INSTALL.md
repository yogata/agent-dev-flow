# AgentDevFlow Release Archive — Install Guide

この README は release archive（`agentdev-release-<sha>.zip`）を受け取った利用者向けの導入手順書である。archive には AgentDevFlow 配布物（command / skill / reference / template / script）が実ファイルとして格納されており、Windows junction や Unix symlink に依存しない。archive はマルチホスト正本モデル（共通正本 `src/common/` とホスト接続領域 `src/opencode/`）の構成で生成される。

## 同梱内容

```
agentdev-release-<sha>/
  src/common/commands/agentdev/**.md
  src/common/skills/agentdev-*/**
  src/common/tools/agentdev-*/**
  src/opencode/plugins/agentdev-*/**
  scripts/install.ps1
  README-INSTALL.md
  THIRD-PARTY-NOTICES.md
```

`scripts/install.ps1`（archive 版 installer）は archive 内の `src/` ツリー（共通正本 `src/common/` と OpenCode 接続領域 `src/opencode/plugins/`）を `.opencode/` 配下へ実ファイルとして配置する導入スクリプトである。archive は配布物の自己完結を保証し、展開先リポジトリの `src/` 状態に依存しない。archive 版は junction を作成しない archive 固有の導入契約を持つ（通常 checkout 版 `scripts/install.ps1` とは別の installation projection である）。

third-party 依存の実体（`vendor/` 配下の engine bundle と kuromoji 辞書）は同梱しない。agentdev-textlint-guard plugin は版固定情報（`package.json` + `bun.lock`）のみを配布し、依存は導入時に生成する（THIRD-PARTY-NOTICES.md に依存とライセンス種別の通知を記載する）。

## 前提

- Windows PowerShell 5.1 以降、または PowerShell 7 (`pwsh`)
- 展開先リポジトリのルートに書き込み権限

## 導入手順

展開元（archive を一時展開したディレクトリ）と導入先（製品リポジトリ）は別パスである。`-Target` は製品リポジトリ側の `.opencode` を指定し、一時展開先を指定しない。

```powershell
# 1. 導入先（製品リポジトリ）のルートを特定
$repoRoot = "<導入先リポジトリのルート>"

# 2. archive を一時ディレクトリへ展開（展開元。この配下は導入先ではない）
$temp = "<任意の一時ディレクトリ>"
Expand-Archive -LiteralPath "agentdev-release-<sha>.zip" -DestinationPath $temp -Force

# 3. 展開先のルート（archive 内の agentdev-release-<sha>/）を特定
$unpackedRoot = Join-Path $temp "agentdev-release-<sha>"

# 4. scripts/install.ps1（archive 版 installer）を実行
#    -Source: 展開元（一時展開ディレクトリ内の src/）
#    -Target: 導入先（製品リポジトリ側の .opencode/）
& (Join-Path $unpackedRoot "scripts\install.ps1") `
    -Source (Join-Path $unpackedRoot "src") `
    -Target (Join-Path $repoRoot ".opencode") `
    -Mode copy
```

導入完了後、`<repoRoot>/.opencode/commands/agentdev/` と `<repoRoot>/.opencode/skills/agentdev-*/` が実ファイルとして配置される。一時展開先（`$unpackedRoot`）には配置が発生しない。

## 導入時の依存生成手順（agentdev-textlint-guard plugin）

installer は導入先（`<repoRoot>/.opencode/`）に依存実体（`vendor/` 配下の engine bundle と kuromoji 辞書）が不完全な場合、終了コード 6 で停止し、導入手順を案内する。案内に従い、導入先の plugin package 配下（`<repoRoot>/.opencode/plugins/agentdev-textlint-guard/`）で依存を生成してから installer を再実行する。

```powershell
# 依存生成（bun install はネットワーク取得を含む。導入先側の plugin package で実施）
Push-Location (Join-Path $repoRoot ".opencode\plugins\agentdev-textlint-guard")
bun install
bun run build:engine
Pop-Location

# installer 再実行（上記「導入手順」の 4 を再実行）
& (Join-Path $unpackedRoot "scripts\install.ps1") `
    -Source (Join-Path $unpackedRoot "src") `
    -Target (Join-Path $repoRoot ".opencode") `
    -Mode copy
```

依存生成の完了後、textlint 検査は空のパッケージキャッシュ・ネットワーク遮断下でも動作する（node_modules は不要）。

## third-party 成果物の導入（consumer）

AgentDevFlow が依存する third-party 成果物には2つの形態がある。宣言の場所、解決手順、配置先、drift 検知の意味が形態ごとに異なる。

| 形態 | 宣言の場所 | 解決手順 | 配置先 | drift 検知の意味 |
|------|-----------|---------|--------|-----------------|
| Skill 形式 | `src/third-party/skills.yaml`（本体管理）または `.agentdev/third-party/skills.yaml`（consumer 管理。本体管理が不在の環境で使う） | 取得機構（Custom Tool `agentdev_third_party` または同 package 内 CLI）が宣言に基づき取得 | `.opencode/skills/<name>/` | 宣言済みで配置が欠落する場合、導入系 installer が終了コード 7 で停止し取得手段を案内する |
| package 形式 | plugin package 配下の `package.json` + `bun.lock`（版固定情報） | 導入時生成（`bun install` + `bun run build:engine`。前節の手順） | plugin 配下の依存成果物領域（`node_modules/`・`vendor/`） | 依存実体が未生成・不完全な場合、installer が終了コード 6 で停止し生成手順を案内する |

環境ツール（bun、git、gh、OpenCode 自身）は動作環境にあたり、third-party 成果物の対象外です。

### Skill 形式の導入手順（consumer）

consumer リポジトリで third-party Skill を導入する手順は次の2段階で完結する。

1. 宣言ファイルを `.agentdev/third-party/skills.yaml` として作成する

   ```yaml
   schema_version: "1.0"
   skills:
     - name: example-skill
       source: https://github.com/<owner>/<repo>/tree/<commit-hash>/<skill-directory>
   ```

   `name` は kebab-case で記述する（`agentdev-` と `repo-` の接頭辞は使用できない）。`source` は commit hash 固定の GitHub URL で版固定を表現する（単一 SKILL.md を指す blob URL も指定できる）。

2. 取得機構の CLI を実行する（リポジトリルートをカレントディレクトリとして実行する）

   ```powershell
   bun .opencode/tools/agentdev-third-party/cli.ts           # 宣言の全件を取得
   bun .opencode/tools/agentdev-third-party/cli.ts --dry-run # 取得計画の表示のみ
   ```

CLI は取得結果を読み戻しで検証してから成功を返す（fail-closed）。宣言ファイルが両候補とも存在しない環境では、CLI は取得しない。作成先を案内して停止する。導入済み Skill の更新は CLI の再実行で行う。

installer（`scripts/install.ps1`）は宣言済み Skill が `.opencode/skills/<name>/` へ配置済みであることを検査する。宣言済みで配置が欠落する場合は終了コード 7 で停止するため、上記の CLI を実行してから installer を再実行する。宣言ファイルが両候補とも存在しない環境では、この検査を飛ばして正常に完了する（third-party Skill の前提がない環境として扱う）。

## 終了コード

| コード | 意味 |
|--------|------|
| 0      | 成功（全配置完了、内容一致） |
| 4      | 配置先に既存ファイルがあり、内容が異なる（上書きせず停止） |
| 5      | 必須ディレクトリの作成に失敗、または Source が存在しない |
| 6      | textlint guard plugin の依存実体（vendor）が配置先に未生成または不完全（「導入時の依存生成手順」を実行してから再実行） |
| 7      | third-party Skill（Skill 形式）が宣言済みで `.opencode/skills/<name>/` への配置が欠落（「third-party 成果物の導入」の CLI を実行してから再実行） |

終了コード 4 の場合は、配置先を一旦退避するか削除してから再実行すること。

## 整合性検査

配布物の整合性は、host 側（agent-dev-flow リポジトリ）の `repo-agentdev-integrity` スキルが提供する `check_integrity.ts --profile installed` で検査する。archive 自体には checker を同梱しない（archive 自己完結と検査実行の分離）。正の仕様は `<integrity-contracts>` Design「実行プロファイル分離（source/installed/release）」である。

```powershell
bun run <host>/.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts `
    --profile installed `
    --root <repoRoot>
```

`--root` には導入先リポジトリのルートを指定する（checker は `<root>/.opencode/` 配下の配置を検査する）。導入先リポジトリに正本ツリー（`src/common/`・`src/opencode/`）が存在しない環境では、checker は正本必須ディレクトリの欠落を環境由来の NG として報告する（checker 全体の終了コードは非ゼロになる）。配置の整合性は、投影系の finding（`projection_missing` / `projection_extra` / `content_mismatch` / `broken_junction`）が 0 件であることで確認する。

## 関連

- 仕様: `<integrity-contracts>` Design「実行プロファイル分離（source/installed/release）」
