---
title: checker 実行契約と検出基盤規則
status: accepted
created: 2026-08-15
updated: 2026-10-07
---
<!-- ADF-COVERS(implementation): REQ-002-035 -->
<!-- ADF-COVERS(implementation): REQ-010-062 -->
<!-- ADF-COVERS(implementation): REQ-010-010 -->
<!-- ADF-COVERS(design): REQ-018-004 -->
<!-- ADF-COVERS(implementation): REQ-061-037 -->
<!-- ADF-COVERS(design): REQ-061-037 -->
<!-- ADF-COVERS(implementation): REQ-060-006 -->
<!-- ADF-COVERS(design): REQ-007-016, REQ-060-001, REQ-060-002, REQ-060-003, REQ-060-007 -->
<!-- ADF-COVERS(design): REQ-010-078, REQ-010-079 -->
<!-- ADF-COVERS(implementation): REQ-010-078, REQ-010-079 -->

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
- CLI 用分割スクリプト（`*_cli.ts` 等）は直接起動時にも検査を実行する top-level エントリポイントを持つことを標準とする。export-only のスクリプトは直接起動で無出力・exit 0 の無検証成功を生むため採用しない。check_distribution_boundary_cli.ts の正規起動経路は check_distribution_boundary.ts 経由（bun run、exit 0/1/2）であることを明示する

## パターンマッチ・網羅検査設計の標準規約

checker の新規実装・修正時に適用するパターンマッチと網羅検査の設計標準を次のとおり確定する。

- 行全体マッチの統一: 検出パターンは行全体（`^...$` 相当）とのマッチで設計し、部分一致による誤検出を構造的に防ぐ
- 列挙ベース網羅検査と件数整合の二重確認: 対象集合の走査は列挙ベース（例: `Get-ChildItem -Recurse` + `-LiteralPath`、`fs.readdirSync` 再帰）で行い、列挙件数と期待件数の整合を突合する二重確認を持つ
- 階層 ID 検索の3点設計: 階層 ID（`REQ-NNN-NNN` 等）の検索は (1) 単独出現、(2) 行 ID としての先頭出現、(3) 前置一致除外（長い ID への部分一致を検出としない）の3点を満たす設計とする
- 宣言的データの silent skip 禁止: 宣言的データ（YAML）の読み込みでスキーマ不適合・未知キーを検出した場合、黙って読み飛ばさずエラーまたは警告として報告する。当該契約は契約テストで固定する

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
- traceability corpus の走査対象方針: traceability corpus の一次走査対象は、リポジトリ top-level `traceability/` 配下の YAML ファイル（component / package 単位 sidecar、`policy.yaml`）とする。sidecar と policy.yaml は対応関係と検証スコープの正規情報源であり、拡張子 `.yaml` / `.yml` を走査対象へ追加する。inline declaration（producer-only artifact の ADF-COVERS 宣言行）の走査対象拡張子は現行の `.md`、`.ts` を維持する。inline declaration は producer-only serialization であり、対応関係の完全性判定は sidecar を正規情報源として行うため、inline 走査の拡張子制限が完全性判定を制限しない
- docs/reports（履歴参照領域）: `docs/reports/` 配下（監査・評価・観測の Report）は履歴記録領域として各検出の対象から除外する。IR-067 の docs/reports 免除・REQ-053-039（歴史記録是正対象外）と同一の位置づけであり、traceability corpus の走査対象からも除外する。Report 文書内の REQ 行 ID 参照は歴史記録として対応関係管理対象外とする

## baseline 退避物と BaselineFile の役割分離と合否判定基準

baseline 退避物（checker 実行 stdout の退避。ok/failures/stats 形式）と delta 検査用 BaselineFile（entries 形式）は別役割である。退避物は比較証跡であり、BaselineFile は delta 検査の入力である。両者の形式非互換は欠陥ではなく役割差とする。

合否判定基準:
- 既知違反の合否は failures の一致（件数と内容）で判定する
- 分類層（severity・bucket 別）の件数一致を確認する
- scanned 件数差は環境差（走査環境・OS・junction 状態に由来）として不合格根拠にしない
- BaselineFile の全量再生成は cap 更新（増分反映）と使い分け、全量再生成時は従来の approved provenance を引き継ぐことを確認する（provenance 保全）

## 宣言的データ YAML の schema 原則

検出用の宣言的データ YAML（retired-artifact-registry、command-format-rules、delegation-contract-patterns、
distribution-targets、obsolete-path-map、obsolete-vocabulary-map、skill-projection-manifest）は、
正となるスキーマを Design が所有する。各 YAML は検出用ビューであり、
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

### 宣言的データ読込原則

検査対象の定義データ（検査ルール・配布対象一覧等）は宣言的データファイル（yaml）を原本とし、checker は定義をコード内に複製せず原本を読み込んで検査を実行する。原本欠損時は検査を実行せず fail-closed で停止する。command-format-rules.yaml・distribution-targets.yaml は本原則の適用対象とする（読込統合: ru-batch-20260903）。

## detector 命名規約

detector 実装は IR 識別子に基づく命名規約（checkIR_NNN_ 関数接頭辞、@ir タグ等）を持ち、
IR から detector 実装への機械的逆引きを可能にする。共用 detector を許容する場合も、
当該 IR への到達性を逆引き結果から追跡できることを維持する。

## 再帰ファイル探索と CLI 引数解析の標準API移行

checker 群の再帰ファイル探索と CLI 引数解析の標準 API への移行契約を次のとおり定める。

- 再帰的にディレクトリを列挙する独自実装（listFilesRecursive、listMarkdownRecursive、walkMarkdown 等の再帰関数）は `node:fs` の `glob` / `globSync` へ移行する。移行対象の抽出は影響範囲走査（`src/common/skills/agentdev-*/scripts/**`、`.opencode/skills/repo-agentdev-integrity/scripts/**` の再帰列挙実装）で確定する
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

case-close は REQ 行 append を伴う Definition 変更のマージ (squash merge) 後、AUTOGEN 対象索引の再生成を標準工程として実行する。再生成は index-auto-generation Design の計測日導出規則 (対象ドキュメント群の最終コミット日付の最大値) に従い、autogen-freshness gate が同一 commit で失敗しないことを確認して完了とする。

REQ 行 append を伴う工程（Definition 保存（case-ready / case-revise）の REQ 追記等）では、AUTOGEN 対象索引（docs/requirements/README.md、req-health-metrics.md 計測例等）の同 commit 再生成を前置として実行する（工程連動再生成前置）。本前置は、case-run 前置 gate の AUTOGEN 索引再生成 前置 gate（PR 対象ファイルに AUTOGEN 生成元文書の変更を含む場合に再生成を委譲へ先行して強制する）と工程側前置として整合し、REQ 行 append 後の鮮度検査（check_autogen_freshness）が exit 0 となることを期待値とする。

AG-009(a)（既存対応計画 ID。本前置とは別の取り組み）の領域（REQ-010-059 gate 仕様およびその本体実装）は本前置の対象外であり、不変である。本前置は gate 仕様を変更せず、工程手順の前置としての整合注記を所有するに留まる。

## 手動管理の索引一覧と実ファイル配置の整合（docs-check 検査対象）

docs-check は、手動管理の索引一覧（docs/README.md ガイド一覧を含む）と実ファイル配置の整合を検査対象とする（REQ-010-078、REQ-010-079）。

- docs/README.md のガイド一覧は docs/guides/ 配下の実ガイドファイル一覧と一致すること（一覧と実ファイルの差分なし）
- docs/knowledge/README.md「現在の知識文書」一覧は docs/knowledge/ 配下の実知識文書一覧と一致し、件数表記は実ファイル数と一致すること
- knowledge README 列挙整合の正規検査経路は check_knowledge_docs.ts とし、docs/README.md ガイド一覧等の手動管理索引は README 突合系検査の組合せで整合を検査する。手動管理の一覧更新漏れ（実ファイルの追加・削除に対する一覧の追随漏れ）は本整合検査の検出対象とする

## IR-055 warning 総数 ratchet と baseline provenance の実行契約

IR-055 warning 総数 ratchet（ir-055-baseline.json の warning_total_cap 比較）の実行面の契約を次のとおり確定する。baseline 運用の正規所有は integrity-contracts.md とし、本節は実行面のみを所有する。

- warning 総数が warning_total_cap を超過した場合は、明細再取得（check_integrity.ts 実行による実測）で起因を特定してから処置する。起因の分類は true positive（当該箇所の是正）と baseline-known（provenance 付き baseline または恒久免除レジストリ baselines/exemptions.json への追加）の2系統とする
- warning_total_cap の引上げは --raise-warning-cap 明示フラグ経由のみ許容する。無条件の cap 引上げを禁止する。baseline 値（entries の count）は check_integrity.ts 実行の実測値に更新し、cap 値を実測に併せ替えない
- baseline エントリおよび恒久免除レジストリへの追加は、provenance（起因の由来、正当化の参照先 rationale_ref、適用日）付きでのみ許容する。無条件 baseline 追加を禁止する

## 対象外

- 各 checker の個別検出ロジック、検出シグナル、severity 判定（各 checker の Design と IR カタログ）
- targeted docs guard のモード使い分け・引数形式の詳細（targeted-docs-guard-implementation Design）
- AUTOGEN block ID の棚卸し規定（autogen-freshness-gate Design）
- Workflow / Capability 機械分類規則（workflow-skill-model Design）
- check_workflow_preventive.ts の extractYamlField（単一トップレベルフィールドの正規表現抽出）は宣言的データ読込原則の意図的な適用対象外とする。根拠: Issue #2352 の移行対象からの意図的除外、PR #2355 での ambiguous 判定記録、抽出対象が単一行 `field: value` 意味に限定され構造化 YAML 解析を必要としないこと。Bun.YAML 委譲の共有 lib（resolveExtensionState 系）とは責務が異なるため二重経路には該当しない（RU-0004 対象外明示。ユーザー決定 2026-09-04）

## 安定実行経路

stdout 証跡を要する checker（機械可読レポートを stdout 出力する checker）の実行は、モジュール import 経由（node --experimental-strip-types）を標準経路とする。Windows + bun 環境では bun run 経由の process.exit 実行で stdout レポートが失われることがあるため、CLI 経由で実行する場合は process.exit 前に stdout の flush を保証する終了手順を例外経路として用いる。

安定実行経路の詳細は docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md を参照する。

### ESM 互換性要件

checker は module import 経由（node --experimental-strip-types）での実行を前提とする。CommonJS API
（`require.main`、`require` 等）への依存は、`import.meta.main`、`node:module` の `createRequire` 等による
互換化を行うか、CLI 例外経路での実行に限定する。新規 checker は import 経由での実行を必須とし、
既存 checker の互換化は本契約の要件として段階的に適用する。

### link profile 実効実行要件

- link profile は main root を位置引数 `repoRoot` に指定して読取専用で実行する（worktree 汎用手順の読取専用実行・環境ラベル規定と整合）。
- worktree 内実行は junction 未伝播により concrete-id 0件の無効実行になり得る。link profile を worktree で実行した
  場合は実行環境ラベルを記録し、結果の採用可否を環境ラベルで判定する（REQ-018-004 の環境差区分に従う）。
- source profile と link profile の対比表を検証結果の解釈に用いる。
- worktree を検査対象とする checker の起動契約: 検査 skill は host 側配置を起点として起動し、検査対象 worktree の
  絶対パスを `--root`（相当の repoRoot 明示指定）で指定して起動する。worktree への検査 skill 複製と配置先起点の
  起動は標準としない。
- 検査対象 root の誤解決（配置先起点の誤リポジトリ検査）と `files_checked` 空は検査見逃しとして扱う。
  `files_checked` の内容と検査対象 worktree の変更ファイルの一致確認を検査結果の採用前の手順とする（REQ-010-076）。
- 読み取り専用検査であり worktree への書込みを行わない。worktree 分離原則（POL-worktree-isolation）との関係:
  検査は worktree の分離を壊さない読み取り専用操作として実行され、検査対象 root の明示指定と結果採用前の一致確認の
  みを worktree 外（host 側）で行う。

実行記録には、次の環境ラベルを必ず付す。

| 項目 | 記録内容 |
|---|---|
| 実行環境 | main root または worktree root の別とパス |
| junction 伝播状態 | worktree の `.opencode/skills/agentdev-*` 未伝播、または main root の junction 構成の状態 |
| 依存パッケージ状態 | `node_modules` の伝播状態、`bun install` の要否および実施状況 |

checker の stdout 証跡は、実行プロセスの終了状態と stdout を分離して退避する。非ゼロ終了時も
機械可読な stdout を保持し、source profile と link profile の実行結果・環境ラベル・対比表を同一の
検証記録から追跡できるようにする。

本節は checker の実行契約だけを所有する。AG-005（`agentdev-skill-authoring`）の規則は
command/skill の記述品質を所有し、worktree 汎用手順は `agentdev-git-worktree` の references が所有する。
両者の手順を本 Design に重複記載せず、checker の実行結果解釈に必要な範囲だけを参照する。

- Bun ランタイム API（Bun.YAML 等）に依存する checker は bun 経由（`bun run`）で実行する。node の安定実行経路は Bun ランタイム API に依存しない checker に適用され、依存する checker には適用されない

IR-072 の PR 期間判定は author date（git log %as）を基準とする。採用理由: 対象期間の実施として意味があるのは変更が書かれた日付（author date）であり、マージ時刻や rebase による commit 日付の付け替えの影響を受けないためである。既知限界: 複数日にまたがって作成された PR では author date が期間境界を跨ぎ得るため、境界日付の取り扱い（含む/含まない）は checker 出力の解釈時に注意を要する。

### worktree 環境での checker 実行 fallback（junction 未伝播時の SoT 直参照）

worktree 環境で .opencode/skills/* junction を前提とする検査（docs/designs 側リンク検査、
IR-062 reference-path-existence を含む）を実行する場合、junction 未伝播時には検査対象パスを
source パス（SoT パス = 検査 root（--root 指定の対象 worktree）直下の src/common/ 配下。
同一チェックアウト内）へ直参照 fallback して検査を実行する。
メインリポジトリ作業コピー側の src/opencode へ解決することは誤解決（誤リポジトリ検査）として禁止する。

- fallback 判定は junction（または投影ディレクトリ）の不在を検出した時点で行う
- fallback で実行可能な検査は実行し、実行不能な既知 skip は環境差（REQ-018-004 の環境差扱い）として区別記録する
- fallback を使用した検査では、実行環境（worktree / main、junction 伝播状態）を環境ラベルとして検証記録に明記する（REQ-018 の環境ラベル契約に従う）
- worktree 単独実行で junction 依存検査が必要な場合は、temp 領域への junction 投影構成を前置手順として実施してから検査する（投影構成を作業 worktree へ適用しない）
- fallback 経路で検査対象が 0 件（zero-targets）に解決された場合は、検査を実施していない無効分類として記録し、合格として扱わない
- main root での再実行へ切替える条件（投影構成が不能・fallback で検査対象が空・結果の信頼性が確保できない場合）は main root 実体 + --root 明示指定による読取専用再実行とする
- 本 fallback は REQ-018「junction を前提とする構造系テストは source パス（SoT パス）への fallback で実行される」規約の checker への適用であり、worktree 作成工程（junction 自動化）を変更しない
- 環境差の由来分離・明示記録の運用は docs/knowledge/worktree-environment-fail-classification.md を参照する

### baseline 未整備環境での対照実行の実行契約

baseline 未整備環境での gate 実行に伴う対照実行（同一 detector・同一引数を baseline commit と変更 HEAD で同一環境再実行）の判定手順と記録形式は、NG baseline 運用手順（integrity-contracts.md「baseline 未整備環境での対照実行による合格判定」）が正規所有する。本 Design は実行面の次の事項のみを所有する。

- 対照実行の両系統（baseline commit 側・変更 HEAD 側）の実行は、本 Design の checker 共通実行契約と worktree 検査対象 checker の起動契約（host 側起点、repoRoot 明示指定、読取専用）に従う
- 両系統の実行には環境ラベルを必ず付す。環境ラベルが一致しない実行間の結果比較は delta 0 の証拠として採用しない（同一環境再実行の要求）
- baseline commit 側の実行は detached worktree（worktree 汎用手順の baseline 比較手順）で行い、作業中 worktree の stash 往復を行わない

## bun test 実行形態契約（単独実行・ファイル単体指定を含む）

bun test の全ての実行は、フル suite の 3 cwd 分割正規形（agentdev-quality-gates が正規所有）に
加えて、次の実行形態に統一する。本節は bun test 単独実行・ファイル単体指定時の一般規約を所有し、
フル suite 合格判定の実行形態契約（QG-4）を侵食しない。

- 起動 cwd はリポジトリルート（main root または worktree root）に統一する。scripts 配下等、
  repo root 以外を cwd にした実行を標準としない
- 対象パスは `./` 付き相対パスとして指定する。`.opencode/...` のような `./` なし表記は bun test の
  パスフィルタで no test files matched となり 0 件実行になるため標準としない。
  ファイル単体指定も `./` 付きとする
- 依存整備の要否は、正規テストが参照する package 境界ごとに必要な依存が解決可能な状態であることを
  環境 precondition として判定する。リポジトリルートの package.json / node_modules の有無のみで
  整備要否を判定しない
- worktree で依存が未解決の場合は、依存を所有する package ディレクトリを対象とする bun install、
  または agentdev-git-worktree 契約に従う main 側 node_modules への junction のいずれかの正規手段で
  依存解決状態を確立してからテストを実行する。bun install を一般原則としてリポジトリルートで
  実行しない（node_modules 未伝播の依存解決 fail 予防。詳細は agentdev-git-worktree の
  worktree 構造的制約を参照）

逸脱時の検知条件（次のシグナルが観測された場合は実行形態逸脱を疑う）:

- REPO_ROOT を cwd からの相対解決で求めるテストの fail（repo root 以外の cwd 起動時に発生。
  全件が環境依存 fail として観測され得る）
- bun test 出力に no test files matched が含まれ、実行件数 0 件となる（`./` なしパス指定時）
- 依存解決失敗（Cannot find package 等）が worktree node_modules 未伝播由来で発生

QG-4 フル suite 正規形（3 cwd 分割実行、正規ランナー構成確認、環境ラベル、fail 由来分類）は
agentdev-quality-gates が正規所有する。本節はその所有権を変更せず、単独実行・ファイル単体指定時の
一般規約と正規形への参照を提供する。

### 実行形態規律（集約）

- tsc（typecheck）は対象 package 配下を cwd として実行する
- bun test は worktree root を cwd とし `./` 付きパス指定で実行する（既存正規形）
- worktree 再作成後は bun install を前置する（依存パッケージの未伝播対策）
- 分割実行②の対象で未収録の配置（tools 等）がないかを実行前に確認する
- checker の ESM 互換性は個別差があるため、実行不能な checker は bun 経由（モジュール import）へ切替える

- 起動 cwd・ランナー・パス指定形式に起因する fail は実行形態由来として分類する（REQ-007-016）。実行形態由来の fail は実装由来（当該変更起因）と区別して記録し、本節の規律へ適合させて再実行した結果を採用する
### タイムアウト値

bun test 実行のタイムアウトは標準 300 秒、上限 600 秒とする。実測（2026-10 時点の主スイート）
は 197〜235 秒であり、上限到達時は検査の分離実行を検討する。既定値・上限値の変更は本 Design の
変更として扱う（REQ-060-007 の手段詳細の分離先。inspect finding RQ-34/RQ-05 の defer を引き継ぐ）。

### bun test と typecheck の併用指針

bun test の pass は型整合を保証しない。配布物（.ts・型定義を含む成果物）を変更する場合は、bun test に加えて typecheck（tsc --noEmit、対象 package 配下 cwd）を併用して型不整合の検出漏れを防ぐ。型定義変更を伴う変更では、当該変更と同一変更単位で型参照側の追随を確認する。併用指針の観点記録は docs/knowledge/structure-migration-followup-checklist.md が参照先である。

### check_integrity テストスイート内の結果共有契約

check_integrity.test.ts の回帰試験群は、同一テスト実行内で対象ルート・実効引数・入力状態（固定データ、宣言的定義、baseline 等）が同じ検査について検査器起動を1回に集約し、その結果を複数の確認で共有できる。本契約はテストスイートの実行形態に関する内部契約であり、検査ルール、検出能力、既存の確認内容、最終品質ゲートを変更しない。

- 結果共有は既存の準備処理（beforeAll 等）と明示的な結果変数で構成し、実行をまたぐ永続キャッシュや汎用キャッシュ基盤を作らない
- 実リポジトリ回帰の4確認は1回の検査結果を共有する。個々のテスト名と確認内容を維持して失敗箇所を識別でき、共有結果を各テストが変更して他の確認を汚染しない
- 不変の固定データは同一ルート・同一実効引数・同一入力状態の組合せごとに1回だけ検査する。引数や入力が異なる結果を混用しない
- baseline 更新、入力編集、引数差、出力形式差、レポート保存等の状態変更操作を検証する試験は不変結果の共有へ混ぜない。状態変更前後は順序を維持し、変更後に新しく検査する。独立起動そのものを確認する試験の呼出しも維持する
- 共有対象群の各テストは選択実行時に必要な初期化を自身で行い、他テストの先行実行に依存して成立しない（ファイル単体指定の実行契約維持）
- 初期化失敗、子プロセス起動失敗、異常終了、JSON 解釈失敗、不完全な必須結果は明確な試験失敗とし、空の結果や既定値で成功扱いにしない
- 実行後に元の固定データ・baseline・作業リポジトリへ意図しない変更や不要なレポートを残さない。自分の生成物だけを後片付けし、既存の未追跡ファイルを削除しない
- 効果測定は同一条件（マシン、Bun 版、検査入力、配置、コマンド）で変更前後を複数回計測し、成功結果、所要時間、中央値・最大値、検査起動回数を記録する。件数一致だけで検出能力の同等性を証明したことにしない

## Design frontmatter 必須キー検証観点

docs/designs/** のDesign frontmatterは `title` / `status` / `created` / `updated` を必須キーとして機械検査する。キー欠落、`updated` 値のキー名欠落、値形式不正を検出し、既存のKnowledge frontmatter必須キー検査と同じ検出基準で整合性ルールカタログへ登録する。

## 実行系の実機制約（node/bun）

checker 系スクリプトは bun 前提で記述されており、node 実行系（node --experimental-strip-types 等）での実行は
require is not defined で失敗する。安定実行経路は bun run を使用する（Case #3252 実績）。
spawnSync 型テストの固定 timeout は検査対象規模の増加（third-party 配布物追加等）で超過し得るため、
実測分布に基づく値（30〜60秒）を設定し、baseline 対照実行（main と PR head の同条件比較）を
環境起因切り分けの標準手順とする。

## See Also

- integrity-contracts.md（スクリプト契約、NG baseline 運用、除外設定の文書化要件）
- targeted-docs-guard-implementation.md（guard 実行契約）
- workflows/workflow-skill-model.md（Workflow / Capability 機械分類表）
