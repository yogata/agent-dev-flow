# ローカルIssue スキーマ定義

> **正本**: `docs/designs/local/local-case-file.md`（意味仕様の正本）。本ファイルは運用参照資料であり、Design と矛盾してはならない。
> **機械可読定義**: `case-schema/rules/*.yaml`（frontmatter、status、labels、headings）。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）において、Issue / PR 相当の永続情報を保持するローカルIssueの構造を定義する。
ローカルIssueは role（tracking / case）ごとの条件付きスキーマを持ち、ローカル版の Custom Tool（agentdev_gh の Local 実装）が本定義に従って `.agentdev/issues/issue-{NNNN}.md` を読み書きする。上位の Command / Workflow / Capability はローカルIssueを直接読み書きせず、通常版と同一の Tool 操作契約経由でのみ操作する。

## 配置先と採番

- パス: `.agentdev/issues/issue-{NNNN}.md`
- `{NNNN}`: 4 桁ゼロ埋め番号（例: `0001`, `0042`）。GitHub Issue 番号に対応する一つの共通採番空間とし、role（tracking/case）ごとに採番を分けない
- 新規作成時は `.agentdev/issues/issue-*.md` の既存最大番号 + 1 を使用する。欠番は再利用しない
- 同一番号のファイルが既に存在する場合、作成側は停止する（上書きしない）
- リポジトリ管理対象: `.agentdev/issues/` 配下のローカルIssueは Issue / PR 相当の永続情報としてリポジトリ管理対象とする

## YAML 前書きスキーマ（共通メタデータ）

全ローカルIssueが持つ共通メタデータ。機械可読定義は `rules/frontmatter.yaml` 参照。

| フィールド | 型 | 必須/任意 | 値域、制約 |
|---|---|---|---|
| `id` | 文字列 | 必須 | `issue-{NNNN}` 形式。ファイル名 `issue-{NNNN}.md` と一致 |
| `title` | 文字列 | 必須 | 自由記述。Issue の概要を簡潔に表す日本語または英語 |
| `role` | 文字列（enum） | 必須 | `tracking` / `case`。role の意味論は agentdev-issue-tracking Design が所有 |
| `status` | 文字列（enum） | 必須 | role ごとの値域（`rules/status.yaml`）から選択 |
| `created_at` | 文字列（日時） | 必須 | ISO 8601 形式 |
| `updated_at` | 文字列（日時） | 必須 | ISO 8601 形式。最終更新日時 |
| `closed_at` | 文字列（日時）または空 | 条件付き必須 | role ごとの終端状態の場合のみ値を持つ |
| `labels` | 配列（文字列） | 必須 | role ごとの値域（`rules/labels.yaml`）から選定 |

### YAML 前書きに含めないフィールド

`work_type`、`source`、`branch`、`base_branch` を YAML 前書きに持たせない。
ブランチ情報はブランチを使った場合のみ role: case の `## マージ結果` セクションに記録する。

### YAML 前書きの例

```yaml
---
id: issue-0042
title: "ユーザー認証機能を追加"
role: case
status: review
created_at: "2026-06-20T21:39:00+09:00"
updated_at: "2026-06-20T22:05:00+09:00"
closed_at: ""
labels: [feature]
---
```

## role: tracking の条件付きスキーマ（追跡Issue）

- `status` 値域: 追跡Issue 6 状態（起票 `created`、検討中 `in-discussion`、保留 `on-hold`、実行準備完了 `ready`、解決済み `resolved`、クローズ済み `closed`）。三段写像は agentdev-issue-tracking Design が所有
- `labels` 値域: kind（`problem`、`idea`、`task`、`risk`）からちょうど 1 つ
- 本文: 追跡Issue本文の標準構造（件名、背景、影響、関連成果物、選択肢、判断材料、不足情報、保留理由と再評価条件、解決結論、反映先と反映状態、関連 Case Issue 参照）に従う。Case 固有セクションを必須項目としない
- コメント相当履歴: `## 検討経過` セクションへ `### {ISO 8601 日時}` 見出し + 本文の日時エントリとして時系列で保持する

## role: case の条件付きスキーマ（Case Issue）

- `status` 値域: `open`、`running`、`blocked`、`review`、`closed`、`cancelled`（状態遷移表は `rules/status.yaml` 参照）
- `labels` 値域: `feature`、`bugfix`、`maintenance`、`docs`、`refactor`、`chore`、`epic`
- 本文構成: 15 セクション（`rules/headings.yaml` 参照）。`## Design確定候補` と `## Findings / Capture候補` は必須（GitHub 版で PR 本文が担っていた引き継ぎ情報の代替）
- `## マージ結果`: ローカル Git 上の取り込み結果（実行した操作、コミットハッシュ、実行日時、結果 `PASS` / `FAIL`）。失敗・未完了時は status を `blocked` へ更新し理由を `## 残課題` へ記録する

## PR 系操作の対象解決

PR 系操作（pr_create、pr_read、pr_merge、pr_changed_files、pr_mergeable）の対象は role: case のローカルIssueに限る。Local 実装 Tool は操作の対象解決時に role を検証し、role: tracking への PR 系操作を拒否する。

## コメント読み替えの role 分岐

issue_comment の読み書きは、対象ローカルIssueの role により読み替え先を分岐する。

- role: tracking → `## 検討経過`（日時エントリの時系列）
- role: case → `## 作業ログ`（Case 実行のコメント相当情報）

## GitHub Issue / PR 置換対応表

| GitHub 版 | ローカル版 |
|---|---|
| GitHub Issue 本文 | ローカルIssue本文 |
| GitHub Issue コメント | role に応じたコメント相当セクション（`## 検討経過` / `## 作業ログ`） |
| GitHub Issue の状態 | ローカルIssueの `status`（role ごとの値域） |
| GitHub Issue のラベル | ローカルIssueの `labels`（role ごとの値域） |
| GitHub PR 本文 | role: case の `## マージ前確認` / `## Design確定候補` / `## Findings / Capture候補` |
| GitHub PR 取り込み結果 | role: case の `## マージ結果` |
| GitHub Issue のクローズ | 終端 `status` + `closed_at` |

## 関連項目

- `docs/designs/local/local-case-file.md`: 意味仕様の正本 Design
- `rules/frontmatter.yaml`: YAML 前書きスキーマの機械可読定義
- `rules/status.yaml`: role 条件付き status 値域と状態遷移の機械可読定義
- `rules/labels.yaml`: role 条件付き labels 値域の機械可読定義
- `rules/headings.yaml`: role 条件付き見出し一覧の機械可読定義
- `docs/designs/skills/agentdev-issue-tracking.md`: role、kind、状態の意味論の正
