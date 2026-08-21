---
title: checker 実行契約と検出基盤規則
status: accepted
created: 2026-08-15
updated: 2026-08-20
---
<!-- ADF-COVERS(implementation): REQ-002-035 -->
<!-- ADF-COVERS(implementation): REQ-010-062 -->
<!-- ADF-COVERS(implementation): REQ-010-010 -->

# checker 実行契約と検出基盤規則

検査 checker の実行契約、検出対象の除外規定、宣言的データ YAML の schema 原則、detector の命名規約を
正規所有する。
配備先の一貫性（RU-0004 と RU-0007 で対象 checker が重複する両 RU の連携注記）を本 Design で担保する。

## 目的

実装済み checker 資産の実行手段、標準実行経路、検出対象除外規定、検出基盤の設計規則を契約化し、
検証実施の属人化と誤検出の反復を防止する。

## checker 共通実行契約

- 起動手段はスクリプト契約（integrity-contracts）に従い bun run で実行する
- check_extensions.ts の --scenario モードは、変更経路 routing 等の分岐候補探索における標準実行手段とする。
実行プロファイルは対象変更（extension、command、skill）の種別に応じて選択する
- 共通 CLI 契約（--help、--json、--dry-run、exit code 0/1/2、stdout 機械可読出力）に従う

## パターンマッチ・網羅検査設計の標準規約

checker の新規実装・修正時に適用するパターンマッチと網羅検査の設計標準を次のとおり確定する。

- 行全体マッチの統一: 検出パターンは行全体（`^...$` 相当）とのマッチで設計し、部分一致による誤検出を構造的に防ぐ
- 列挙ベース網羅検査と件数整合の二重確認: 対象集合の走査は列挙ベース（例: `Get-ChildItem -Recurse` + `-LiteralPath`、`fs.readdirSync` 再帰）で行い、列挙件数と期待件数の整合を突合する二重確認を持つ
- 階層 ID 検索の3点設計: 階層 ID（`REQ-NNN-NNN` 等）の検索は (1) 単独出現、(2) 行 ID としての先頭出現、(3) 前置一致除外（長い ID への部分一致を検出としない）の3点を満たす設計とする
- 宣言的データの silent skip 禁止: 宣言的データ（YAML）の読み込みで schema 不適合・未知キーを検出した場合、黙って読み飛ばさずエラーまたは警告として報告する。当該契約は契約テストで固定する

既存 checker のマッチ実装の一括変更は要求しない。本規約は新規実装・修正時の標準として適用する。

## 検出対象除外規定

- 検出対象除外の正規所有は本 Design とする。checker 実装は本 Design の列挙に従い、列挙外の除外を独自に追加しない
- 除外は対象ファイル単位とし、根拠（ルール自己参照、履歴参照領域、検出原理上の技術的除外）を文書化する。
広域 glob による検出回避と検出無効化を許容しない（NG 隠蔽禁止、integrity-contracts と同一規定）
- targeted docs guard は frontmatter または配置ディレクトリに基づく Design 判定を行い、非 Design ファイル
（baseline snapshot、歴史記録ファイル等）の Design README 登録候補誤検出を抑止する
- 歴史記録ファイル（docs/designs/integrity/audits/、baselines/ 等）は DEC-013 AG-008 適用範囲の
残存参照判定の対象外とする

検出対象除外の正規列挙を次のとおり確定する。

- node_modules 系: git 管理外ディレクトリ（`node_modules/` 等）はスキャン対象から除外する
- frontmatter 信号キー: `baseline_for`、`audit_for` を検出制御用の正規信号キーとして列挙する。これらのキーを持つファイルは監査記録・baseline としての免除規定に従う
- 監査記録・AUTOGEN に対する免除: 監査記録（audits/、baselines/ 配下の Report）と AUTOGEN ブロックは、歴史記録・機械生成領域として該当検出の免除対象とする

## 宣言的データ YAML の schema 原則

検出用の宣言的データ YAML（retired-artifact-registry、command-format-rules、delegation-contract-patterns、
distribution-targets）は、正となる schema を Design が所有する。各 YAML は検出用ビューであり、
正規契約の情報源とはしない。
YAML と正 Design の不一致は検査で検出対象とする。

## detector 命名規約

detector 実装は IR 識別子に基づく命名規約（checkIR_NNN_ 関数接頭辞、@ir タグ等）を持ち、
IR から detector 実装への機械的逆引きを可能にする。共用 detector を許容する場合（REQ-028-001）も、
当該 IR への到達性を逆引き結果から追跡できることを維持する。

## 再帰ファイル探索と CLI 引数解析の標準API移行

checker 群の再帰ファイル探索と CLI 引数解析の標準 API への移行契約を次のとおり定める。

- 再帰的にディレクトリを列挙する独自実装（listFilesRecursive、listMarkdownRecursive、walkMarkdown 等の再帰関数）は `node:fs` の `glob` / `globSync` へ移行する。移行対象の抽出は影響範囲走査（`src/opencode/skills/agentdev-*/scripts/**`、`.opencode/skills/repo-agentdev-integrity/scripts/**` の再帰列挙実装）で確定する
- 単一ディレクトリ直下だけを列挙する単純な `readdirSync`、`Dirent` / `stat` による属性判定は移行対象外とする。標準化だけを理由に glob へ変更しない
- `.agentdev`、`.opencode` 等の隠しディレクトリを明示的な探索対象から除外しない。既存のパス正規化、列挙結果の決定性、存在しないディレクトリの扱い、symlink/junction の探索範囲を維持する
- 列挙順は glob の暗黙順序に依存せず、決定性が必要な処理では正規化後のパスを sort して後段へ渡す
- CLI 引数構文解析（オプション値、真偽値オプション、短縮オプション、位置引数、サブコマンド、未知オプション）は `node:util.parseArgs` を使用する。`cli_utils.ts`（整合性検査共通 CLI 契約）を初期移行対象とする
- オプション間依存（例: `--profile release` 時の `--archive` 必須）、許容値、必須性等の ADF 固有意味検証は ADF 側の明示的な検証として後段に残す
- 引数エラー時の終了コード、stdout、stderr は既存契約から変更しない。共通 CLI 契約（`--help`、`--json`、`--dry-run`、exit code 0/1/2、stdout 機械可読出力）は維持する
- 移行前に各処理の現在の受理・拒否挙動（正常入力、空入力、値欠落、未知オプション、短縮オプション、位置引数、サブコマンド、重複オプション、`--`、`--option=value`、再帰列挙の対象ファイル集合・リンク追跡・隠しディレクトリ・欠落ディレクトリ挙動）をテストデータとして固定する
- 標準 API が受理できる形式を、その事実だけで新規の公開 CLI 仕様として追加しない。既存仕様で保証していない形式の公開仕様化を行わない
- 対応する ADF 実行環境で `node:fs` glob または `node:util.parseArgs` が利用不能な場合は代替 API へ無断変更せず blocked として再判断する

## 対象外

- 各 checker の個別検出ロジック、検出シグナル、severity 判定（各 checker の Design と IR カタログ）
- targeted docs guard のモード使い分け・引数形式の詳細（targeted-docs-guard-implementation Design）
- AUTOGEN block ID の棚卸し規定（autogen-freshness-gate Design）
- Workflow / Capability 機械分類規則（workflow-skill-model Design）

## See Also

- integrity-contracts.md（スクリプト契約、NG baseline 運用、除外設定の文書化要件）
- targeted-docs-guard-implementation.md（guard 実行契約）
- workflows/workflow-skill-model.md（Workflow / Capability 機械分類表）
