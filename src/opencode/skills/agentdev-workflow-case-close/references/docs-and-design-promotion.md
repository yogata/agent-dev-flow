<!-- ADF-COVERS(implementation): REQ-032-024, REQ-032-025, REQ-032-026 -->

# STEP-3: docs 検証・Design 確定（docs-and-spec-promotion）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の制御平面（STEP 一覧）STEP-3 詳細である。
> docs/ 検証、targeted docs guard、check_extensions.ts、Design 確定フロー（draft → accepted 昇格）を提供する。

## Purpose

PR マージ前の docs 検証、拡張検査、配布依存境界 最終 gate を実施し、Design 確定フロー（draft → accepted 昇格）を処理する。

## Input Resolution

1. SSoT 再構成: PR 変更ファイル一覧、PR 本文（`## Design確定候補`、補助入力）、対象 REQ（Issue 本文の REQ 参照から導出）、正規 Design 文書の ADF-COVERS 宣言（implementation 役割）と frontmatter `status`
2. identifier 保持: PR番号、Issue番号、Design パス
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- 単一 Issue クローズ ルート
- STEP-2 で QG-4 合格

## Result

- docs/ 検証合格（targeted docs guard、配布依存境界 最終 gate）
- Design 状態評価（棚卸し制）の全件評価完了（統合後の全候補が 昇格 / design-save 提案 / 見送り のいずれかの評価結果を持つ。0 件の場合は 0 件確認を記録）

## Procedure

### docs/ 検証

機能追加固有の検証（REQ作成、インデックス記載、spec更新、Decision作成）および全 work_type 共通の関連ドキュメント整合性確認、README 索引整合性確認。
不足時は警告表示してユーザー判断を仰ぐ。
Design 状態評価（棚卸し制、STEP-3-2）を実行する。PR 本文の `## Design確定候補` セクションは補助入力である。

**文書分類ポリシー適合確認**: document-model Design（extension 経由）の Document Classification Policy に基づき、最終ドキュメント状態が分類ポリシーに適合していることを確認する。

### STEP-3-1: close 時 Design/ commands/ skills 更新漏れの局所確認

実装完了、PR マージ前に、Design 本文と実装の最終矛盾確認、command 定義の更新漏れ、skill 責務境界の変更漏れを確認。
更新漏れ検出時は警告表示してユーザー判断。
局所予防の範囲で `/agentdev/inspect-docs` の全体意味レビューの代替ではない。

#### extensions 整合性検査

当該 PR が次のいずれかを変更した場合、`check_extensions.ts` を strict 実行し、違反がないことを確認する。

- `.opencode/commands/agentdev/**/*.md`
- `.opencode/skills/agentdev-*/SKILL.md`
- `.opencode/skills/agentdev-*/references/**/*.md`
- `.agentdev/extensions/**`

違反時はマージを停止しユーザー判断を仰ぐ。

#### targeted docs guard

変更ファイルと連動ファイルに対し targeted docs guard を実行（case-close はマージ後 main 環境で実行されるため `--files` を使用）。

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow case-close --files <PR 変更ファイル一覧> --json`
- **`<PR 変更ファイル一覧>`**: space 区切り推奨、comma 区切り、混在も可
- **PowerShell での複数パス指定**: 配列変数経由（`$files = @('a.md','b.md')` を `--files $files` で渡す）または個別渡しとし、引用符まとめ渡し（`--files "a.md b.md"`）は使用しない
- **モード使い分けの標準**: `--base-ref` によるコミット済み差分ベースの検出はコミット後・push 前の実行に限定し、コミット前の worktree 上での検証は untracked ファイルを含む `--files` による明示指定を標準とする（case-close はマージ後 main 環境で実行されるため `--files` を使用）
- **JSON 出力の `failures`**: strict severity が含まれる場合はマージを停止し対象ファイルを修正して再実行
- **`full_docs_check_recommended`**: true の場合は全体監査（self-hosting リポジトリ限定の自己監査コマンド）の実行をユーザーに提案
- **draft → accepted 等の Design status 変更時**: `spec_readme_update_required` を STEP-3-2 Design 確定フローに反映
- **`files_checked` 空時の確認**: targeted docs guard の JSON 出力で `files_checked` が空の場合、検査見逃しリスクとして扱い、`warnings` 配列の警告を確認、`--files` 指定の妥当性と検査対象 root の解決（配置先起点の誤リポジトリ検査でないこと）を確認、`files_checked` の内容と検査対象変更ファイルの一致を確認、必要に応じて再実行または手動確認、空の理由が正当であることを確認してから続行する

#### 配布依存境界の最終変更経路 gate

PR 変更ファイルが `--profile source` の配布 command/skill ソース面に含まれる場合、PR マージ前に配布依存境界の最終 gate を実行する。
本 gate は共用 detector（`.opencode/skills/<integrity-detector-skill>/scripts/lib/distribution-boundary.ts`）を経由する adapter（`check_distribution_boundary.ts`）経路であり、配布依存境界 Design の最終 gate 基底を再利用する。
adapter が bypass されても最終 gate で停止する。
trigger 条件は detector の `--profile source` が分類する配布ソース面を基準とする（case-run command STEP-S5 と同一。junction 領域は git 非追跡のため PR 差分に現れず、junction を trigger にすると gate が不発になる）

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`
- **検査対象**: PR HEAD の worktree（マージ前の実際の PR ブランチ内容）を検査する。現在の main 状態ではなく、PR で提案されている実際の変更内容を検査対象とする（Oracle finding 5: inspect PR head before merge）
- **`--profile source`**: case-close は PR マージ前に実行され、配布ソース面を検査するため `source` を使用する（junction は原本への鏡像）
- **検査エラーの扱い**: 読込不能、未分類エントリ、adapter 起動失敗は全て gate-not-passed として扱う。clean として通過させない。違反時はマージを停止しユーザー判断を仰ぐ
- **検出結果の記録**: 検出事項（failures）は PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録する（既に case-run command STEP-S5 で記録済みの場合は上書きせず、case-close で新たに検出された事項のみ追記）

#### full integrity suite 実行（bun test 実行形態契約）

QG-4 の full integrity suite 合格基準により検証スイート全体（bun test 全件）を実行する場合、bun test 実行形態契約に従う。
3 cwd 分割実行、依存パッケージ前置、環境ラベルを含む正規形契約の本体は `agentdev-quality-gates/references/qg-4-final-acceptance.md` を参照。

- **実行コマンド**: `bun test ./.opencode/skills/<integrity-detector-skill>/scripts/`。`./` prefix 付きで対象ディレクトリを明示指定する（必須ステップ）
- **N/M 件数突合**: 実行結果の「Ran N tests across M files」の N/M 件数突合を実施する（必須ステップ）。直前実績と比較して件数が急減していないかの妥当性を検証する。固定値の期待値化は行わない
- **証拠記録**: 実行 cwd と起動コマンド形式（prefix・パス指定を含む）を PR 本文のテスト結果の証拠へ明記する
- **cwd 依存テスト混在スイートの運用注記**: 対象スイートには cwd 依存テストが混在するため、カレントディレクトトリビアな実行（`bun test` 単体等）で代替しない

### STEP-3-2: Design 状態評価フロー（棚卸し制）

対象 REQ に基づく draft Design 棚卸し列挙と、PR 本文の `## Design確定候補` セクション（case-run/ driver が記録）の申告候補を統合し、Design の確定、昇格を処理する。
申告セクションは補助入力であり、セクション不存在・空の場合も棚卸し列挙を実行する（申告の不在を理由に棚卸しを省略しない）。
契約の正は case-close Design「Design 状態評価の棚卸し制（STEP-3 拡張）」であり、本 STEP はその workflow 側実装である。

#### 棚卸し列挙

1. 当該 Case の対象 REQ を特定する（Issue 本文の REQ 参照から導出。REQ ファイル単位の近似列挙を許容）
2. 正規 Design 文書（Design 一覧表が status を追跡する docs 配下の正規成果物。`<designs/README.md>` が追跡情報源）から、
   当該 REQ を ADF-COVERS 宣言（implementation 役割）でカバーし frontmatter status が draft の Design を
   逆算列挙する。projection 配下は対象外とし、列挙対象は正規成果物のみとする。
   ADF-COVERS 宣言の解析は `agentdev-traceability` の能力（coverage）を参照できる（fail-open。
   不在・実行失敗・空結果時は正規成果物の直接走査（`rg` 等）で継続する）
3. PR 本文「Design 確定候補」セクションの申告候補を列挙結果へ統合する（同一 Design は 1 候補にまとめ、
   二重処理しない。申告のみ存在する Design も評価対象に含める）
4. 統合後の候補が 0 件の場合は 0 件確認を記録して Design 状態評価を正常完了する（エラー停止しない）

#### 全件評価

| 処理パターン | 条件 | アクション |
|---|---|---|
| (a) case-close 内で Design 昇格 | 統合後の候補 Design の `status` が `draft`、STEP-3-1「Design 本文と実装の最終矛盾確認」により実装・検証との整合を確認済み | 対象 Design の `status` を `draft` → `accepted` に昇格し、Design 一覧表（Design README）の status 列を同時更新する（編集スコープ: プロジェクトの Design ファイル群） |
| (b) design-save 再起動の提案 | Design 確定候補が Design ファイル未保存 | `/agentdev/design-save` の再実行を提案し case-close は完了させる |
| (c) 見送り | 整合確認の結果、当該 Case で確定できないと判断 | 見送り理由と再評価契機を対応記録コメントの検証差分へ記録し、Design ファイル本体へ最小限の経緯記録を追記する。Design 本体への追記はライフサイクル経緯の最小記録に限り、設計内容としての未確定事項・将来計画・判断宣告の追記を含まない |

- 見送り（評価実施・確定不可）と未評価（評価未実施）を区別して記録する
- 新規の一時成果物種別・新規ドメイン状態は作らない（見送り記録は既存チャネル〔対応記録コメント、Design ファイル本体〕に保存する）
- **完了ゲート**: 統合後の全候補が (a) 昇格または (c) 見送りのいずれかの評価結果を持つことを case-close 完了条件に含める。評価結果のない候補（未評価）が残る場合は完了扱いにしない（停止または継続扱い）

#### 冪等（再実行）

- accepted 済み Design は棚卸し列挙の評価対象から除外する（重複する状態遷移・承認記録を生成しない）
- 同一 Case 再実行では既存の見送り記録を評価結果として認定し、重複する見送り記録を生成しない

Design status 昇格タイミング（draft → accepted）の詳細、frontmatter `status` と `updated` の更新、Design 確定候補処理の詳細は `agentdev-design-file-manager/references/design-lifecycle-application.md` を参照。

## case-close が使用する検査ツール

- `check_changed_docs.ts`（`--workflow case-close`、`--files <PR 変更ファイル一覧>`、targeted docs guard で実行）
- `check_extensions.ts`（配布物パターンのいずれかを変更した場合に実行）
- `check_distribution_boundary.ts`（`--profile source`、PR 変更ファイルが配布 command/skill ソース面に含まれる場合に実行）
- `bun test ./.opencode/skills/<integrity-detector-skill>/scripts/`（full integrity suite 実行、QG-4 合格基準による検証で実行）
- test_strategy（QG-4 完了条件確認）

**checker コマンドの実行経路（安定実行経路）**: stdout 証跡（機械可読レポート）を要する checker の実行は、モジュール import 経由（`node --experimental-strip-types`）を標準経路とする。bun run 等の CLI 経由で実行する場合は、Windows + bun 環境で process.exit の終了タイミングにより stdout レポートが失われることがあるため、process.exit 前に stdout の flush を保証する終了手順を例外経路として用いる。契約は checker 実行契約（checker 実行契約と検出基盤規則 Design）「安定実行経路」節を参照する。

**checker コマンドの stdout 退避形式**: 上記 checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出等の観測対象）であるため、実行と stdout 取得は 検証コマンドの stdout 証跡退避形式（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。
非ゼロ exit 時も JSON レポート（stdout）を Evidence として保持し、`>` リダイレクトや PowerShell 変数格納で退避しない。

## Evidence

- targeted docs guard、check_extensions.ts、check_distribution_boundary.ts の各 JSON 結果、Design 状態評価（棚卸し制）の列挙結果・統合結果・全件評価結果（処理パターン a/b/c、0 件確認の有無）
- full integrity suite 実行時: 「Ran N tests across M files」の N/M 件数突合結果、実行 cwd と起動コマンド形式

## Completion Verification

- targeted docs guard の `failures` に strict severity を含まないこと。check_extensions.ts の違反がないこと。配布依存境界 最終 gate が合格（または違反時はマージ停止）であること
- full integrity suite 実行時: N/M 件数突合にて直前実績と比較して件数の急減がないことを確認済みであること

## Resume-Idempotency

- 各検査は読取であり再実行可能。Design 昇格は frontmatter `status`（durable state）で判定し、`accepted` 済みの場合は再昇格しない。同一 Case 再実行では既存の見送り記録を評価結果として認定し、重複する見送り記録を生成しない

## resume point

- docs/ 検証結果（targeted docs guard、check_extensions.ts）
- Design 状態評価（棚卸し制）処理結果（列挙候補一覧、統合結果、全候補の評価結果（昇格 a / 提案 b / 見送り c）、0 件確認の有無）
- `spec_readme_update_required` 状態

## 関連 STEP

- 前: STEP-2（issue-resolution-and-qg4）
- 次: STEP-4（pr-merge-and-conflict）

## 関連 Capability Skill

- `agentdev-design-file-manager`: Design status 昇格、design-lifecycle-application
- integrity checker skill（self-hosting リポジトリ限定）: check_changed_docs.ts、check_extensions.ts
- `agentdev-project-extensions`: document-model Design extension 経由（Document Classification Policy）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（機能追加で docs/ 更新がない場合の警告表示と停止確認）
- ガードレール・不変条件（Design status 昇格は case-close の責務、Design 状態評価は棚卸し列挙を正とし PR 本文の `## Design確定候補` 申告を補助入力として統合し、`## Findings / Capture候補` とは区別）
