---
title: checker 実行契約と検出基盤規則
status: accepted
created: 2026-08-15
updated: 2026-09-02
---
<!-- ADF-COVERS(implementation): REQ-002-035 -->
<!-- ADF-COVERS(implementation): REQ-010-062 -->
<!-- ADF-COVERS(implementation): REQ-010-010 -->
<!-- ADF-COVERS(implementation): REQ-057-004 -->
<!-- ADF-COVERS(implementation): REQ-057-018 -->

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
- AUTOGEN retired 参照行領域の免除: AUTOGEN ブロック内の retired 参照行（機械生成領域として生成された索引行）は、retired 成果物残存検出の免除対象とする方針とする。機械生成領域への手動是正要求を行わない
- em-dash 導入時のゲート方針: em-dash（—）を配布文書へ導入する場合は、意図しない異言語文字・記号の混入を検出する既存 checker の許容更新（導入対象の明示）を同一 PR で行うことを方針とする。checker 実装自体の変更は別 Case の責務であり、本 Design は方針のみを所有する
- check_integrity の typecheck 対象外範囲: check_integrity（docs-check）の typecheck 対象は現行の対象範囲に限定し、配布 skill scripts 全体への対象拡張は行わない（対象拡張は本方針の対象外）。対象範囲の拡張判断は別途設計判断を要する
- traceability corpus の拡張子方針: traceability の対応宣言コーパスの走査対象拡張子は現行の `.md`、`.ts` に限定する。`.ps1` 等の実装スクリプトは対応宣言の保持者（正規成果物）ではないため、DEFAULT_SCAN_EXTENSIONS へ追加せず、対象外として明示する

## 宣言的データ YAML の schema 原則

検出用の宣言的データ YAML（retired-artifact-registry、command-format-rules、delegation-contract-patterns、
distribution-targets、obsolete-path-map、obsolete-vocabulary-map、skill-projection-manifest）は、
正となる schema を Design が所有する。各 YAML は検出用ビューであり、
正規契約の情報源とはしない。
YAML と正 Design の不一致は検査で検出対象とする。

## data yaml 宣言的データ運用

data yaml の新設は、当該 yaml を読み込む消費者実装（checker スクリプト側の検査処理と契約テスト）を
同一 PR で同時に確定する。
消費者を実装しない data yaml の単独新設、単独拡張を許容しない。

- **新設**: data yaml を追加する変更は、当該 yaml を読み込む checker 実装と契約テストを同一 PR に含める。
  既存 data yaml の拡張（キー追加、検出語彙追加等）も同一契約に従う
- **同期**: data yaml と消費者の不一致は drift 検査で strict fail として検出する。
  「パターンマッチ・網羅検査設計の標準規約」の宣言的データの silent skip 禁止と同一規定であり、
  黙って読み飛ばさない
- **検出ビュー**: data yaml は検出用ビューであり、正規契約の情報源とはしない
  （「宣言的データ YAML の schema 原則」準拠）

実装実例（新設時の消費者実装同時確定の参照例）:

- `data/obsolete-vocabulary-map.yaml`: 消費者は check_integrity.ts の IR-065 / IR-066 語彙パターン検査
  （IR065_VOCAB_PATTERNS / IR066_VOCAB_PATTERNS 定数）。語彙 ID 集合と rule 割当の不一致は
  obsolete-vocabulary-map-drift 検査が strict fail で検出する（REQ-047-004）
- `data/skill-projection-manifest.yaml`: 消費者は check_integrity.ts の IR-068 skill-projection-manifest
  検査（src 側スキル集合と投影スキル集合の突合）。manifest と src のスキル集合不一致は strict fail で
  検出する。worktree（junction 未伝播）では投影比較を info で skip する

## detector 命名規約

detector 実装は IR 識別子に基づく命名規約（checkIR_NNN_ 関数接頭辞、@ir タグ等）を持ち、
IR から detector 実装への機械的逆引きを可能にする。共用 detector を許容する場合（retired REQ-028-001 由来）も、
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

checker 実行契約の補完（RU-0003 + RU-0009 data yaml 追随を同一ファイルへ集約）:

- CLI 引数解析は bun parseargs 標準APIへの移行を約束し、独自解析の二重経路を残さない（REQ-044-001 準拠）
- 再帰ファイル探索は node:fs glob（新規 glob 共通ヘルパー限定）へ移行し、エラー伝播方針を明記する
- 列挙件数突合規約と checker 起動 cwd 前提を契約化する（走査信頼性）
- data yaml 宣言的データ運用: data yaml 新設時は消費者実装を同時確定する

## 工程連動索引再生成前置との整合

REQ 行 append を伴う工程（req-save の REQ 追記等）では、AUTOGEN 対象索引（docs/requirements/README.md、req-health-metrics.md 計測例等）の同 commit 再生成を前置として実行する（工程連動再生成前置）。本前置は、case-run 前置 gate の AUTOGEN 索引再生成 前置 gate（PR 対象ファイルに AUTOGEN 生成元文書の変更を含む場合に再生成を委譲へ先行して強制する）と工程側前置として整合し、REQ 行 append 後の鮮度検査（check_autogen_freshness）が exit 0 となることを期待値とする。

AG-009(a)（Issue #2386 由来の既存対応計画 ID。本前置とは別の取り組み）の領域（REQ-010-059 gate 仕様およびその本体実装）は本前置の対象外であり、不変である。本前置は gate 仕様を変更せず、工程手順の前置としての整合注記を所有するに留まる。

## 対象外

- 各 checker の個別検出ロジック、検出シグナル、severity 判定（各 checker の Design と IR カタログ）
- targeted docs guard のモード使い分け・引数形式の詳細（targeted-docs-guard-implementation Design）
- AUTOGEN block ID の棚卸し規定（autogen-freshness-gate Design）
- Workflow / Capability 機械分類規則（workflow-skill-model Design）

## See Also

- integrity-contracts.md（スクリプト契約、NG baseline 運用、除外設定の文書化要件）
- targeted-docs-guard-implementation.md（guard 実行契約）
- workflows/workflow-skill-model.md（Workflow / Capability 機械分類表）
