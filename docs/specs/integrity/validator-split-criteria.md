---
title: validator 分割基準
status: draft
created: 2026-07-07
updated: 2026-07-07
---

# validator 分割基準

本 SPEC は agent-dev-flow リポジトリのみに適用される。

## 目的

check_changed_docs.ts の内部 validator 構成と、validator を分割する基準を実装詳細SPEC として文書化する（REQ-0158 Phase 6）。

## validator の責務境界

各 validator は単一の検査関心を担う。検査関心が異なる場合は別 validator へ分割する。検査関心と IR ルールの対応は 1:1 を要求せず、1 validator が複数の IR ルールを包括カバーしてよい（REQ-0108-269）。

## ファイルサイズ上限

1 validator の実装サイズは 250 LOC を目安とする。超過時は検査関心の分離可能性を評価し、複数関心が混在する場合は分割する。250 LOC は目安であり、単一関心に集中している場合は超過を許容する。

## 関心分離ルール

1 validator = 1 検査関心。1 つの validator が複数の異なる検査カテゴリ（strict と heuristic、document-drift と broken-reference 等）を混在させることを避ける。severity が異なる検査を同一 validator に混在させる場合は、出力時の severity 上書き可能性をレビューする。

## check_changed_docs.ts の validator 構成

check_changed_docs.ts は以下の処理層（validator）で構成する:

| validator | 責務 |
|---|---|
| changed file resolver | --files または --base-ref から files_checked を生成する |
| workflow profile resolver | --workflow 値に応じた profileFor() 適用と rules 選択を行う |
| coupled file resolver | 連動ファイル（README、DOC-MAP、mapping-table 等）を特定する |
| targeted check runner | files_checked と coupled_files_checked に対し profile rules を実行する |
| JSON/text reporter | TargetedDocsReport 形式で JSON/text 出力を生成する |

各 validator は独立してテスト可能であり、他 validator への実行時依存を持たない。reporter は TargetedDocsReport 型契約（[integrity-contracts.md](integrity-contracts.md) TargetedDocsReport 型契約）に従う。
