---
title: checker 実行契約と検出基盤規則
status: draft
created: 2026-08-15
updated: 2026-08-15
spec_logical_division: cross_cutting_contract
canonical_owner: checker-execution-contracts
---

# checker 実行契約と検出基盤規則

検査 checker の実行契約、検出対象の除外規定、宣言的データ YAML の schema 原則、detector の命名規約を
正規所有する。配備先の一貫性（RU-0004 と RU-0007 で対象 checker が重複する両 RU の連携注記）を本 SPEC で担保する。

## 目的

実装済み checker 資産の実行手段、標準実行経路、検出対象除外規定、検出基盤の設計規則を契約化し、
検証実施の属人化と誤検出の反復を防止する。

## checker 共通実行契約

- 起動手段はスクリプト契約（integrity-contracts）に従い bun run で実行する
- check_extensions.ts の --scenario モードは、変更経路 routing 等の分岐候補探索における標準実行手段とする。
実行プロファイルは対象変更（extension、command、skill）の種別に応じて選択する
- 共通 CLI 契約（--help、--json、--dry-run、exit code 0/1/2、stdout 機械可読出力）に従う

## 検出対象除外規定

- 検出対象除外の正規所有は本 SPEC とする。checker 実装は本 SPEC の列挙に従い、列挙外の除外を独自に追加しない
- 除外は対象ファイル単位とし、根拠（ルール自己参照、履歴参照領域、検出原理上の技術的除外）を文書化する。
広域 glob による検出回避と検出無効化を許容しない（NG 隠蔽禁止、integrity-contracts と同一規定）
- targeted docs guard は frontmatter または配置ディレクトリに基づく SPEC 判定を行い、非 SPEC ファイル
（baseline snapshot、歴史記録ファイル等）の SPEC README 登録候補誤検出を抑止する
- 歴史記録ファイル（docs/specs/integrity/audits/、baselines/ 等）は DEC-013 AG-008 適用範囲の
残存参照判定の対象外とする

## 宣言的データ YAML の schema 原則

検出用の宣言的データ YAML（retired-artifact-registry、command-format-rules、delegation-contract-patterns、
distribution-targets）は、正となる schema を SPEC が所有する。各 YAML は検出用ビューであり、
正規契約の情報源とはしない。YAML と正 SPEC の不一致は検査で検出対象とする。

## detector 命名規約

detector 実装は IR 識別子に基づく命名規約（checkIR_NNN_ 関数接頭辞、@ir タグ等）を持ち、
IR から detector 実装への機械的逆引きを可能にする。共用 detector を許容する場合（REQ-028-001）も、
当該 IR への到達性を逆引き結果から追跡できることを維持する。

## 対象外

- 各 checker の個別検出ロジック、検出シグナル、severity 判定（各 checker の SPEC と IR カタログ）
- targeted docs guard のモード使い分け・引数形式の詳細（targeted-docs-guard-implementation SPEC）
- AUTOGEN block ID の棚卸し規定（autogen-freshness-gate SPEC）
- Workflow / Capability 機械分類規則（workflow-skill-model SPEC）

## See Also

- integrity-contracts.md（スクリプト契約、NG baseline 運用、除外設定の文書化要件）
- targeted-docs-guard-implementation.md（guard 実行契約）
- workflows/workflow-skill-model.md（Workflow / Capability 機械分類表）
