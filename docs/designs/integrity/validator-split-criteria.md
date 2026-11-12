---
title: validator 分割基準
status: accepted
created: 2026-07-07
updated: 2026-08-20
---

# validator 分割基準

本 Design は agent-dev-flow リポジトリのみに適用される。

## 目的

check_changed_docs.ts の validator を分割する基準を実装詳細Design として文書化する（targeted-docs-guard-implementation.md Phase 6）。
内部 validator 構成表は [references/validator-internal-config.md](references/validator-internal-config.md) へ分離した。

## validator の責務境界

各 validator は単一の検査関心を担う。
検査関心が異なる場合は別 validator へ分割する。
検査関心と IR ルールの対応は 1:1 を要求せず、1 validator が複数の IR ルールを包括カバーしてよい（REQ-010-009）。

- Workflow Skill 構造検査（「単独起動」禁止等）の正本を1箇所に寄せ、check_workflow_preventive.ts と lint_skills.ts が独立保持する同一検査の重複を解消する（B3-5b）。大規模検査器（check_integrity）と専用検査器の責務境界を確定する
- 統合対象として削除する検査と、判定段階が異なるため意図的に残す検査を名簿として区別し、残す根拠を記録する

## ファイルサイズ上限

1 validator の実装サイズは 250 LOC を目安とする。
超過時は検査関心の分離可能性を評価し、複数関心が混在する場合は分割する。
250 LOC は目安であり、単一関心に集中している場合は超過を許容する。

## 関心分離ルール

1 validator = 1 検査関心。
1 つの validator が複数の異なる検査カテゴリ（strict と heuristic、document-drift と broken-reference 等）を混在させることを避ける。
severity が異なる検査を同一 validator に混在させる場合は、出力時の severity 上書き可能性をレビューする。

## check_changed_docs.ts の validator 構成

check_changed_docs.ts の内部 validator 構成（changed file resolver、workflow profile resolver、coupled file resolver、targeted check runner、JSON/text reporter）は [references/validator-internal-config.md](references/validator-internal-config.md) へ分離した。
各 validator は独立してテスト可能であり、他 validator への実行時依存を持たない。
reporter は [integrity-contracts.md](integrity-contracts.md) TargetedDocsReport 型契約に従う。
