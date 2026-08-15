# STEP-3: docs 検証・SPEC 確定（docs-and-spec-promotion）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-3 詳細である。docs/ 検証、targeted docs guard、IR-{NNN} check_extensions.ts、SPEC 確定フロー（draft → accepted 昇格）を提供する。

## Purpose

PR マージ前の docs 検証、拡張検査、配布依存境界 最終 gate を実施し、SPEC 確定フロー（draft → accepted 昇格）を処理する。

## Input Resolution

1. SSoT 再構成: PR 変更ファイル一覧、PR 本文（`## SPEC確定候補`）、対象 SPEC frontmatter `status`
2. identifier 保持: PR番号、Issue番号、SPEC パス
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- 単一 Issue クローズ ルート
- STEP-2 で QG-4 合格

## Result

- docs/ 検証合格（targeted docs guard、IR-{NNN}、配布依存境界 最終 gate）
- SPEC 確定フロー処理完了（昇格 / spec-save 提案 / 見送り）

## Procedure

### docs/ 検証

機能追加固有の検証（REQ作成、インデックス記載、spec更新、ADR作成）および全 work_type 共通の関連ドキュメント整合性確認、README 索引整合性確認。不足時は警告表示してユーザー判断を仰ぐ。PR 本文の `## SPEC確定候補` セクションから SPEC 確定フロー（Step 3-2）を実行する。

**文書分類ポリシー適合確認**: document-model SPEC（extension 経由）の Document Classification Policy に基づき、最終ドキュメント状態が分類ポリシーに適合していることを確認する。

### Step 3-1: close 時 SPEC/ commands/ skills 更新漏れの局所確認

実装完了、PR マージ前に、SPEC 本文と実装の最終矛盾確認、command 定義の更新漏れ、skill 責務境界の変更漏れを確認。更新漏れ検出時は警告表示してユーザー判断。局所予防の範囲で `/agentdev/inspect-docs` の全体意味レビューの代替ではない。

#### extensions 整合性検査（IR-{NNN}、REQ）

当該 PR が次のいずれかを変更した場合、`check_extensions.ts` を strict 実行し、IR-{NNN} 違反がないことを確認する。

- `.opencode/commands/agentdev/**/*.md`
- `.opencode/skills/agentdev-*/SKILL.md`
- `.opencode/skills/agentdev-*/references/**/*.md`
- `.agentdev/extensions/**`

違反時はマージを停止しユーザー判断を仰ぐ。

#### targeted docs guard（REQ）

変更ファイルと連動ファイルに対し targeted docs guard を実行（case-close はマージ後 main 環境で実行されるため `--files` を使用）。

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_changed_docs.ts --workflow case-close --files <PR 変更ファイル一覧> --json`
- **`<PR 変更ファイル一覧>`**: space 区切り推奨、comma 区切り、混在も可
- **PowerShell での複数パス指定**: 配列変数経由（`$files = @('a.md','b.md')` を `--files $files` で渡す）または個別渡しとし、引用符まとめ渡し（`--files "a.md b.md"`）は使用しない
- **モード使い分けの標準**: コミット前の worktree 上での検証は `--base-ref`、コミット後・PR 作成後の main 環境は `--files`（case-close はマージ後 main 環境で実行されるため `--files` を使用）
- **JSON 出力の `failures`**: strict severity が含まれる場合はマージを停止し対象ファイルを修正して再実行
- **`full_docs_check_recommended`**: true の場合は全体監査（self-hosting リポジトリ限定の自己監査コマンド）の実行をユーザーに提案
- **draft → accepted 等の SPEC status 変更時**: `spec_readme_update_required` を Step 3-2 SPEC 確定フローに反映
- **`files_checked` 空時の確認（REQ）**: targeted docs guard の JSON 出力で `files_checked` が空の場合、検査見逃しリスクとして扱い、`warnings` 配列の警告を確認、`--files` 指定の妥当性を確認、必要に応じて再実行または手動確認、空の理由が正当であることを確認してから続行する

#### 配布依存境界の最終変更経路 gate（REQ-{NNNN}-{NNN} 再利用、REQ-{NNNN}-{NNN}、DEC-{N}）

PR 変更ファイルが `--profile source` の配布 command/skill ソース面に含まれる場合、PR マージ前に配布依存境界の最終 gate を実行する。本 gate は共用 detector（`.opencode/skills/<integrity-detector-skill>/scripts/lib/distribution-boundary.ts`）を経由する adapter（`check_distribution_boundary.ts`）経路であり、REQ-{NNNN}-{NNN} の最終 gate 基底を再利用する（REQ-{NNNN}-{NNN}、DEC-{N} 決定4）。adapter が bypass されても最終 gate で停止する（DEC-{N} 決定3、4）。trigger 条件は detector の `--profile source` が分類する配布ソース面を基準とする（case-run Step 7-1 と同一。junction 領域は git 非追跡のため PR 差分に現れず、junction を trigger にすると gate が不発になる）

- **実行コマンド**: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`
- **検査対象**: PR HEAD の worktree（マージ前の実際の PR ブランチ内容）を検査する。現在の main 状態ではなく、PR で提案されている実際の変更内容を検査対象とする（Oracle finding 5: inspect PR head before merge）
- **`--profile source`**: case-close は PR マージ前に実行され、配布ソース面を検査するため `source` を使用する（junction は原本への鏡像）
- **検査エラーの扱い**: 読込不能、未分類エントリ、adapter 起動失敗は全て gate-not-passed として扱う（DEC-{N} 決定5、TS-{NNN}）。clean として通過させない。違反時はマージを停止しユーザー判断を仰ぐ
- **検出結果の記録**: 検出事項（failures）は PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録する（既に case-run Step 7-1 で記録済みの場合は上書きせず、case-close で新たに検出された事項のみ追記）

### Step 3-2: SPEC 確定フロー

PR 本文の `## SPEC確定候補` セクション（case-run/ driver が記録）を読み取り、SPEC の確定、昇格を処理する。セクション不存在・空の場合はスキップ。

| 処理パターン | 条件 | アクション |
|---|---|---|
| (a) case-close 内で SPEC 昇格 | 対象 SPEC の `status` が `draft`、実装が SPEC 内容を検証済み | 対象 SPEC の `status` を `draft` → `accepted` に昇格（編集スコープ: プロジェクトの SPEC ファイル群） |
| (b) spec-save 再起動の提案 | SPEC 確定候補が SPEC ファイル未保存 | `/agentdev/spec-save` の再実行を提案し case-close は完了させる |
| (c) 見送り | 確定不要と判断 | 候補を Findings/ Capture候補 に準じて記録し後続へ委ねる |

SPEC status 昇格タイミング（draft → accepted）の詳細、frontmatter `status` と `updated` の更新、SPEC 確定候補処理の詳細は `agentdev-spec-file-manager/references/spec-lifecycle-application.md` を参照。

## case-close が使用する検査ツール

- `check_changed_docs.ts`（`--workflow case-close`、`--files <PR 変更ファイル一覧>`、targeted docs guard で実行、AG-{NNN}）
- `check_extensions.ts`（IR-{NNN}、配布物パターンのいずれかを変更した場合に実行）
- `check_distribution_boundary.ts`（`--profile source`、PR 変更ファイルが配布 command/skill ソース面に含まれる場合に実行、DEC-{N} 決定4、REQ-{NNNN}-{NNN} 最終 gate 基底再利用）
- test_strategy（QG-4 完了条件確認）

## Evidence

- targeted docs guard、check_extensions.ts、check_distribution_boundary.ts の各 JSON 結果、SPEC 確定フローの処理パターン（a/b/c）

## Completion Verification

- targeted docs guard の `failures` に strict severity を含まないこと。check_extensions.ts の IR-{NNN} 違反がないこと。配布依存境界 最終 gate が合格（または違反時はマージ停止）であること

## Resume-Idempotency

- 各検査は読取であり再実行可能。SPEC 昇格は frontmatter `status`（durable state）で判定し、`accepted` 済みの場合は再昇格しない

## resume point

- docs/ 検証結果（targeted docs guard、IR-{NNN} check_extensions.ts）
- SPEC 確定フロー処理結果（昇格 a / 提案 b / 見送り c）
- `spec_readme_update_required` 状態

## 関連 STEP

- 前: STEP-2（issue-resolution-and-qg4）
- 次: STEP-4（pr-merge-and-conflict）

## 関連 Capability Skill

- `agentdev-spec-file-manager`: SPEC status 昇格、spec-lifecycle-application
- integrity checker skill（self-hosting リポジトリ限定）: check_changed_docs.ts、check_extensions.ts
- `agentdev-project-extensions`: document-model SPEC extension 経由（Document Classification Policy）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G09（機能追加で docs/ 更新がない場合の警告表示と停止確認）
- G21/G22/G23（SPEC status 昇格は case-close の責務、SPEC 確定候補の処理は PR 本文の `## SPEC確定候補` を入力とし `## Findings / Capture候補` とは区別）
