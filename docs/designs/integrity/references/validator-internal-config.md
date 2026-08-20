---
title: check_changed_docs.ts validator 内部構成
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# check_changed_docs.ts validator 内部構成

> 本ファイルは `docs/designs/integrity/validator-split-criteria.md` から移管した check_changed_docs.ts の内部 validator 構成を保持する。
> Design 本体は分割基準（契約）のみを残し、内部 validator 構成表は本ファイルへ分離した。

## check_changed_docs.ts の validator 構成

check_changed_docs.ts は以下の処理層（validator）で構成する。

| validator | 責務 |
|---|---|
| changed file resolver | --files または --base-ref から files_checked を生成する |
| workflow profile resolver | --workflow 値に応じた profileFor() 適用と rules 選択を行う |
| coupled file resolver | 連動ファイル（README 等）を特定する |
| targeted check runner | files_checked と coupled_files_checked に対し profile rules を実行する |
| JSON/text reporter | TargetedDocsReport 形式で JSON/text 出力を生成する |

各 validator は独立してテスト可能であり、他 validator への実行時依存を持たない。
reporter は TargetedDocsReport 型契約（[integrity-contracts.md](../integrity-contracts.md) TargetedDocsReport 型契約）に従う。
