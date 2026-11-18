---
title: targeted docs guard validator 内部構成
status: accepted
created: 2026-08-20
updated: "2026-11-18"
---

# targeted docs guard validator 内部構成

> 本ファイルは `docs/designs/integrity/validator-split-criteria.md` から移管した targeted docs guard（旧 check_changed_docs.ts。現行実装は検証エンジン cli.ts --workflow モードの engine targeted-gate）の内部 validator 構成を保持する。
> Design 本体は分割基準（契約）のみを残し、内部 validator 構成表は本ファイルへ分離した。

## targeted docs guard の validator 構成

targeted docs guard（engine targeted-gate）は以下の処理層（validator）で構成する。

| validator | 責務 |
|---|---|
| changed file resolver | --files または --base-ref から files_checked を生成する（--files は実在確認、--base-ref は git diff base...HEAD。除外入力は unchecked_reasons へ記録する） |
| workflow profile resolver | --workflow 値に応じて検査規則（rules）を選ぶ処理（profileFor() の適用）を行う |
| coupled file resolver | 連動ファイル（README 等）を特定する |
| targeted check runner | files_checked と coupled_files_checked に対し残存ルール（rules レジストリ）を選択実行し、違反を対象集合に限定して報告する |
| JSON/text reporter | TargetedDocsReport 形式で JSON/text 出力を生成する |

各 validator は独立してテスト可能であり、他 validator への実行時依存を持たない。
reporter は TargetedDocsReport 型契約（[integrity-contracts.md](../integrity-contracts.md) TargetedDocsReport 型契約）に従う。
