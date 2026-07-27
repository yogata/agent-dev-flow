# gh-cli 一時ファイル配置と cleanup の標準化

## 背景

case-auto run（8 draft 並列処理）で、gh-cli 手続きに従い作成した一時ファイル（body file, JSON payload 等）が `.agentdev/drafts/` へ残存し続けた（23件）。本来 `$env:TEMP/agentdev/` 配置 + 使用後削除と規定されるが、サブエージェントが並列 cp932 衝突回避のため workspace-local へ退避し、cleanup を実施しなかった。ユーザー確定事項として「`.agentdev/tmp/` 配置、cleanup 必須」が確定した。

## 問題

gh-cli standard-procedures.md は一時ファイル配置として `$env:TEMP/agentdev/` を指定するが、Windows 環境で `$env:TEMP` が `C:\WINDOWS\TEMP`（システム共有）へ解決し、並列タスクが cp932 で同名ファイルを上書きする問題がある。また cleanup が I/O 手続きと一体化しておらず後段注記（L83/L96/L111）のみで省略可能なため、サブエージェントが配置場所を逸脱した際に cleanup も漏れる。

## 望ましい変更

`agentdev-gh-cli` references/standard-procedures.md の一時ファイル手続きにおいて、(1) 配置場所を `.agentdev/tmp/`（workspace-local）へ変更、(2) create → gh実行 → VERIFY → cleanup を1手順ユニットとし cleanup を省略不可ステップにする、の2点を追記する。

## 対象範囲

### 対象

- `agentdev-gh-cli` references/standard-procedures.md（L45, L62-64, L83, L96, L111 周辺）

### 対象外

- READ 手続きの配置場所（Node.js execSync で取得するため $env:TEMP でも cp932 衝突は発生しないが、整理統一のため .agentdev/tmp/ へ統一）
- 一時スクリプトファイル（`.js` ファイル）の配置（L111 で `$env:TEMP/agentdev/` 指定、本対応で .agentdev/tmp/ へ統一）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | (1) 一時ファイル配置を `$env:TEMP/agentdev/` から `.agentdev/tmp/`（workspace-local）へ変更、(2) cleanup を I/O 手続きと一体化し省略不可ステップ化 |

## 既存対策確認

- **確認結果**: 既存対策一部あり（不完全）
- **該当ファイル**: `docs/specs/skills/agentdev-gh-cli.md` L65（references 参照）、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` L62, L83, L96
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: standard-procedures.md L62 で `$env:TEMP/agentdev/gh-temp-{timestamp}.md` 配置を指定、L83/L96 で cleanup を規定済み。ただし (1) ユーザー確定事項「`.agentdev/tmp/` 配置」が未反映、(2) cleanup が後段注記のみで手続きと一体化しておらず省略可能

## 制約

- 既存の `[System.IO.File]::WriteAllText`（UTF-8 BOM なし）規定、`--body-file` 使用規定との両立関係を維持する
- `.agentdev/tmp/` は workspace-local であり git 管理対象外（`.gitignore` で既に除外想定、要確認）
- 並列実行時のファイル名衝突を避けるため、タイムスタンプ + PID 等の識別子をファイル名に含める運用を維持する
- 本対応は standard-procedures.md の手続き追記のみ。既存手続きの全面再設計は行わない

## 受け入れ条件

- [ ] `agentdev-gh-cli` references/standard-procedures.md で一時ファイル配置が `.agentdev/tmp/`（workspace-local）へ変更されていること
- [ ] cleanup が create → gh実行 → VERIFY → cleanup の1手順ユニットに組み込まれ、省略不可ステップとして明記されていること
- [ ] 並列実行時の cp932 衝突回避が `.agentdev/tmp/` 配置で担保されること（workspace-local であるため）

## 元learning item / 根拠

- **要約**: gh-cli 一時ファイルは $env:TEMP 並列非安全 + cleanup 非一体化で残存しやすく、配置と cleanup の標準化が必要
- **根拠**: case-auto run（8 draft 並列処理）で23件の一時ファイルが `.agentdev/drafts/` へ残存。サブエージェントが並列 cp932 衝突回避のため workspace-local へ退避し cleanup 省略
- **再発条件**: 並列 case-open/case-close 実行時、または `$env:TEMP` が共有領域へ解決される環境での gh WRITE 操作
- **横展開可能性**: 全 gh WRITE 操作。Windows で特に顕著。非 Windows でも cleanup 漏れは発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, windows, gh-cli
- **関連Issue**: case-auto run 2026-07-26〜27（8 draft, 21 OU）、ユーザー確定事項「`.agentdev/tmp/` 配置、cleanup 必須」
