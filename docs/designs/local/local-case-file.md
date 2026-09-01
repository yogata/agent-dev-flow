---
title: ローカルIssue共通スキーマ
status: accepted
created: 2026-06-20
updated: 2026-09-02
---
<!-- ADF-COVERS(implementation): REQ-009-014, REQ-009-026, REQ-009-027, REQ-009-028, REQ-009-029, REQ-009-030, REQ-009-031, REQ-009-032, REQ-009-033, REQ-009-034, REQ-009-037, REQ-009-039 -->
<!-- ADF-COVERS(implementation): REQ-011-007 -->

# ローカルIssue共通スキーマ

> **Scope**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である（REQ-001）。
> ローカル版 OpenCode 導入先リポジトリで運用されるローカルIssueの共通スキーマ、role 条件付きスキーマ、採番、見出しを定義する。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（REQ-001）。
> REQ-009 の詳細仕様を正とする。role、kind、状態の意味論は agentdev-issue-tracking Design を正とし、本 Design は物理表現の写像に徹する。
> ローカルIssue仕様の正本は本 Design であり、`src/opencode-local/agentdev-gh-cli/case-schema/` 配下の定義は操作用定義（正本ではない）とする。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）で、Issue / PR 相当の永続情報を保持するローカルIssueの構造を定義する（REQ-009-026〜033）。
ローカル版の Custom Tool（agentdev_gh の Local 実装）は本 Design に従って `.agentdev/issues/issue-{NNNN}.md` を読み書きする。上位の Command / Workflow / Capability は .agentdev/issues/ を直接読み書きせず、通常版と同一の Tool 操作契約経由でのみローカルIssueを操作する。

## 配置先と採番

- パス: `.agentdev/issues/issue-{NNNN}.md`
- `{NNNN}`: 4 桁ゼロ埋め番号（例: `0001`, `0042`）。GitHub Issue 番号に対応する一つの共通採番空間とし、role（tracking/case）ごとに採番を分けない
- 新規作成時は `.agentdev/issues/issue-*.md` の既存最大番号 + 1 を使用する。欠番は再利用しない（過去に削除、リネームされた番号を再採番しない）
- 同一番号のファイルが既に存在する場合、作成側は停止する（上書きしない）
- 複数プロセスによる同時作成の排他制御は対象外とする（暫定ローカル版の前提）
- リポジトリ管理対象: `.agentdev/issues/` 配下のローカルIssueは Issue / PR 相当の永続情報としてリポジトリ管理対象とする

## 共通メタデータ（YAML 前書き）

全ローカルIssueが持つ共通メタデータ。各フィールドの型、必須/任意、値域を定義する。

| フィールド | 型 | 必須/任意 | 値域、制約 |
|---|---|---|---|
| `id` | 文字列 | 必須 | `issue-{NNNN}` 形式。ファイル名 `issue-{NNNN}.md` と一致すること |
| `title` | 文字列 | 必須 | 自由記述。Issue の概要を簡潔に表す日本語または英語 |
| `role` | 文字列（enum） | 必須 | `tracking` / `case`。role の意味論は agentdev-issue-tracking Design が所有する |
| `status` | 文字列（enum） | 必須 | role ごとの値域（後述）から選択される |
| `created_at` | 文字列（日時） | 必須 | ISO 8601 形式（例: `2026-06-20T21:39:00+09:00`） |
| `updated_at` | 文字列（日時） | 必須 | ISO 8601 形式。最終更新日時 |
| `closed_at` | 文字列（日時）または空 | 条件付き必須 | role ごとの終端状態の場合のみ値を持つ。それ以外では空文字列またはフィールド値なし |
| `labels` | 配列（文字列） | 必須 | role ごとの値域（後述）から選定。補助分類であり状態遷移やワークフロー状態の代替として扱わない |

### YAML 前書きに含めないフィールド

`work_type`、`source`、`branch`、`base_branch` を YAML 前書きに持たせない。
ブランチ情報はブランチを使った場合のみ role: case の `## マージ結果` セクションに記録する。

## role: tracking の条件付きスキーマ

追跡Issueの物理表現。保持する情報の意味論（role、kind、状態と状態遷移、再評価・解決・反映追跡の意味）は agentdev-issue-tracking Design を正とする。

- `status` 値域: 追跡Issue 6状態の論理トークンと同一値（`created`、`in-discussion`、`on-hold`、`ready`、`resolved`、`closed`）。agentdev-issue-tracking Design の状態の三段写像に従う
- `labels` 値域: kind 4値（`problem`、`idea`、`task`、`risk`）からちょうど 1 つ。追加ラベルは許容しない（機械検証）。物理写像表の正は agentdev-issue-tracking Design
- 本文: 追跡Issue本文の標準構造（件名、背景、影響、関連成果物、選択肢、判断材料、不足情報、保留理由と再評価条件、解決結論、反映先と反映状態、関連 Case Issue 参照）に従う。Case 固有セクション（PR 相当セクション、マージ結果）を必須項目としない
- コメント相当履歴: GitHub Issue コメント相当の検討経過を、本文内の追記型コメント相当セクション（日時エントリの時系列）として保持する。物理表現は `## 検討経過` セクションに `### {ISO 8601 日時}` 見出しと本文からなる日時エントリの時系列とする
- クローズ: issue_close の reason（completed / not_planned）のいずれも `closed` へ遷移する。reason の詳細は `## 検討経過` の履歴で保持し、ローカル版 issue_read は closeReason を null として返す。再オープンは `closed` → `in-discussion` とする（agentdev-issue-tracking Design の再オープン遷移に従う）

## role: case の条件付きスキーマ

Case 実行の物理表現。旧ローカル Case ファイルの構造を引き継ぐ。

### status 値域（role: case）

| status | 意味 | 終端状態 |
|---|---|---|
| `open` | Case オープン済み、作業前 | いいえ |
| `running` | 作業中 | いいえ |
| `blocked` | 停止中（障害、未解決事項あり） | いいえ |
| `review` | 作業完了、レビュー対象 | いいえ |
| `closed` | 完了 | はい |
| `cancelled` | 中止 | はい |

`closed` と `cancelled` は終端状態とし、終端状態からの遷移は定義しない。

### 状態遷移表（role: case）

| 操作 | 変更前 status | 変更後 status |
|---|---|---|
| ローカル版 `case-open` | （新規作成） | `open` |
| ローカル版 `case-run` 開始 | `open` / `blocked` | `running` |
| ローカル版 `case-run` 完了 | `running` | `review` |
| ローカル版 `case-run` 停止 | `running` | `blocked` |
| ローカル版 `case-close` 停止 | `review` | `blocked` |
| ローカル版 `case-close` 再開 | `blocked` | `review` |
| ローカル版 `case-close` 完了 | `review` | `closed` |
| 明示中止 | `open` / `running` / `blocked` / `review` | `cancelled` |

再開経路と禁止遷移:

- ローカル版 `case-run` 停止後の再開経路: `blocked` → `running` → `review`
- ローカル版 `case-close` 停止後の再開経路: `blocked` → `review` → `closed`
- `blocked` から `closed` への直接遷移は禁止する。`blocked` から `closed` に至る場合は `review` を経由する

### labels 値域（role: case）

`feature`、`bugfix`、`maintenance`、`docs`、`refactor`、`chore`、`epic` から選定する。

### 本文構成（role: case）

Case ファイル本文は以下のセクション見出しを保持できる。`Design確定候補` と `Findings / Capture候補` は必須とする（GitHub 版で PR 本文が担っていた引き継ぎ情報の代替であり、case-close への引き継ぎ経路を失わせないため）。

| # | 見出し | 必須/任意 | 役割 |
|---|---|---|---|
| 1 | `## 入力` | 任意 | Case の入力情報（REQ パス、要件 doc パス、参照 Issue 等） |
| 2 | `## 背景` | 任意 | Case の背景説明 |
| 3 | `## 問題` | 任意 | Case が解決する問題 |
| 4 | `## 目的` | 任意 | Case の目的 |
| 5 | `## 対象範囲` | 任意 | Case の対象範囲 |
| 6 | `## 対象外` | 任意 | Case の対象外 |
| 7 | `## 受け入れ条件` | 任意 | Case の受け入れ条件 |
| 8 | `## 作業ログ` | 任意 | 作業の進行ログ。GitHub Issue コメント相当の内容を記録 |
| 9 | `## マージ前確認` | 任意 | マージ前確認事項。GitHub PR 本文の引き継ぎ情報の一部 |
| 10 | `## Design確定候補` | **必須** | Design 確定候補。GitHub PR 本文が担っていた引き継ぎ情報の代替 |
| 11 | `## Findings / Capture候補` | **必須** | Findings / Capture候補。下位に `### intake` と `### learning` サブ見出しを持つ |
| 12 | `## マージ結果` | 任意 | ローカル Git 上の取り込み結果。ブランチ情報は本セクションに記録する |
| 13 | `## 残課題` | 任意 | 残課題、フォローアップ項目 |
| 14 | `## 完了判定` | 任意 | 完了判定結果 |
| 15 | （自由拡張） | 任意 | 上記以外のセクションは必要に応じて追加可能 |

### closed_at の値条件（role: case）

`closed_at` は `status: closed`（クローズ日時）または `status: cancelled`（キャンセル日時）の場合のみ ISO 8601 形式で値を持ち、それ以外の `status` では空文字列またはフィールド値なしとする。

### マージ結果の記録方針（role: case）

`## マージ結果` セクションには、ローカル版 `case-close` がローカル Git 上で実施済みの取り込み、反映結果を記録する。GitHub PR 取り込みは実行しない。

必須記録項目: 実行した操作、関連するコミットハッシュ、実行日時、結果（`PASS` / `FAIL`）。
ブランチを使用した場合は取り込み先ブランチ、取り込み元ブランチも記録する（ブランチ未使用時はブランチ名の記録を必須としない）。
取り込み、反映結果が失敗または未完了の場合、ローカル版 `case-close` は `status` を `blocked` に更新し、理由を `## 残課題` に記録する。

## PR 系操作の対象解決

PR 系操作（pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable）の対象は role: case のローカルIssueに限る。ローカル版 Tool 実装は操作の対象解決時に role を検証し、role: tracking のローカルIssueへの PR 系操作を拒否する。pr_create は操作契約上対象番号を持たないため、最新の role: case ローカルIssueを対象として解決する。

## コメント読み替えの role 分岐

issue_comment の読み書きは、対象ローカルIssueの role により読み替え先を分岐する。

- role: tracking → 追記型コメント相当セクション（検討経過）
- role: case → `## 作業ログ` 等、Case 実行のコメント相当情報セクション

## role ごとの必須項目・状態値・許可操作の検証

ローカル版 Tool 実装は、role ごとの必須メタデータ、status 値域、許可操作を機械検証する。Case 固有セクション（PR 相当セクション、マージ結果）を role: tracking の必須項目としない。

case-schema 機械可読定義の更新方針: `src/opencode-local/agentdev-gh-cli/case-schema/rules/` の機械可読定義（frontmatter.yaml、status.yaml、labels.yaml、headings.yaml）を共通メタデータと role 条件付きスキーマへ拡張する。role ごとの値域・必須項目を定義へ反映し、本 Design と矛盾しないことを検証する。

## GitHub Issue / PR 置換対応表

ローカル版では GitHub Issue / PR が担う情報をローカルIssueに集約する。

| GitHub 版 | ローカル版 |
|---|---|
| GitHub Issue 本文 | ローカルIssue本文 |
| GitHub Issue コメント | role に応じたコメント相当セクション |
| GitHub Issue の状態 | ローカルIssueの `status`（role ごとの値域） |
| GitHub Issue のラベル | ローカルIssueの `labels`（role ごとの値域） |
| GitHub PR 本文 | role: case の `## マージ前確認` / `## Design確定候補` / `## Findings / Capture候補` |
| GitHub PR 取り込み結果 | role: case の `## マージ結果` |
| GitHub Issue のクローズ | 終端 `status` + `closed_at` |

ローカル版各コマンドの責務:

- ローカル版 `case-open`: Case Issue 作成ではなく role: case のローカルIssue作成を行う
- ローカル版 `case-run`: GitHub PR 作成ではなく role: case のローカルIssueへの PR 相当セクション追記を行う
- ローカル版 `case-close`: GitHub PR 取り込み / Issue クローズではなくローカルIssueの完了更新を行う
- `/agentdev/issue`: 追跡Issue操作を role: tracking のローカルIssueへ Tool 操作契約経由で実行する
- GitHub Issue 作成、PR 作成、PR 取り込み、Issue クローズおよび `gh issue` / `gh pr` をローカル版の必須操作にしない

runner-local 固有の前提と差分（REQ-011-006）: ローカル版の Tool 操作は、同一の操作契約で Case ファイル読み書きを実装した Local 実装 Tool 経由で実行する。GitHub 環境の存在を前提とせず、GitHub 版との差分は上記の物理写像への集約に限られる。操作順序、読み戻し検証（VERIFY）契約、失敗時動作は GitHub 版と同一である。

## 関連項目

- **関連 REQ**: REQ-009（ローカル版導入方式とローカルIssue運用）、REQ-049（追跡Issue管理機構）、REQ-011-006（Custom Tool の Local 実装差し替え）
- **関連 Design**: agentdev-issue-tracking.md（role、kind、状態の意味論の正）、custom-tool-contracts.md（Tool 操作契約）、runtime-package-boundary.md
