# agentdev-gh Local 実装 Tool（ローカル版）

Custom Tool `agentdev_gh` の Local 実現（REQ-011-006、DEC-004）。同一の操作契約
（`src/opencode/tools/agentdev-gh/contracts.ts` の12操作）を、GitHub Issue/PR の代わりに
ローカルIssue（`.agentdev/issues/issue-{NNNN}.md`、単一採番空間、role 条件付きスキーマ）の
読み書きへ読み替える `GhRunner` 実現（`runner-local.ts`）を提供する。

本ディレクトリは旧 agentdev-gh-cli スキル（ローカル版）の後継であり、I/O 正規経路としての
スキルは解消済み（REQ-011-001）。上位 command / skill は GitHub 版と同じく Custom Tool
`agentdev_gh` の操作契約のみを参照し、ローカル版であることを意識しない。

## 接続方式

`scripts/install.ps1 -Mode apply -LocalMode` は `.opencode/tools/agentdev-gh/` の junction 先を
`src/opencode/tools/agentdev-gh/` から本ディレクトリ（`src/opencode-local/agentdev-gh-cli/`）へ
差し替える。登録 Plugin（`src/opencode/plugins/agentdev-gh-tool/`）は投影パスの
`runner-local.ts` を検出した場合に本実装を使用する。

## 読み替え規則（操作契約の写像）

| 操作 | ローカルIssue上の読み替え先 |
|---|---|
| `issue_create` | ローカルIssue新規作成（採番: 既存最大 + 1、4 桁ゼロ埋め、role をまたぐ単一空間、欠番再利用なし）。`role: tracking` は kind と初期状態 起票（created）を設定 |
| `issue_read` | ローカルIssue全文読込（frontmatter + 本文）。state は role ごとの終端判定（非終端 → `open`、終端 → `closed`）。role/kind/trackingState を導出して返す |
| `issue_update` | 本文指定時はローカルIssue全文をそのまま反映（`updated_at` 更新は呼び出し側の責務。読み戻し検証は全文一致を要求）。title/labels/kind/trackingState 指定時は frontmatter を書き換える |
| `issue_comment` | role 分岐のコメント相当セクションへ追記（tracking: `## 検討経過` へ `### {日時}` エントリ、case: `## 作業ログ`）。body 省略時はコメント履歴を読み取る |
| `issue_close` | tracking: `status: closed`（両 reason 共通）。case: `status: closed`（`not_planned` は `cancelled`）+ `closed_at` 更新 |
| `issue_list` | `.agentdev/issues/` のスキャンと role/kind/trackingState/state/labels/search による絞り込み |
| `issue_reopen` | tracking の `closed` → `in-discussion` + `closed_at` クリア。case は終端状態からの遷移なしとして拒否 |
| `pr_create` | 最新の role: case ローカルIssueへ `## マージ前確認` セクション追記（`### PR title: {title}` + 本文）。操作契約上 pr_create は番号を持たないため |
| `pr_read` | 最後の `## マージ前確認` から title を抽出。state は `## マージ結果` 記録済み → `merged`、それ以外は status から写像 |
| `pr_merge` | `## マージ結果` へ記録（操作、実行日時、結果 `PASS`）。GitHub PR 取り込みは実行しない。失敗・未完了時の `status: blocked` への更新は `issue_update`（本文全文反映）で構成する |
| `pr_changed_files` | 空配列（ローカルに変更ファイル一覧は不存在。Git worktree の実状態が正） |
| `pr_mergeable` | `status: review` → `MERGEABLE`、それ以外 → `UNKNOWN` |

出力 URL はローカルIssueファイルの絶対パス（GitHub 実装の Issue/PR URL に代わる一意識別子）。

ローカルIssueのスキーマ（role 条件付きの status・labels・見出し、採番）の操作用定義は
[case-schema/case-file.md](case-schema/case-file.md)。意味仕様の正本は `docs/designs/local/local-case-file.md`。

## role 条件付きスキーマの機械検証

本実装は role ごとの必須メタデータ、status 値域、labels 値域、closed_at 条件、許可操作
（PR 系操作の role: case 限定、case 終端状態の reopen 拒否）を機械検証する。
スキーマ違反のローカルIssueへの読み取りは失敗し、成功扱いとしない。

## 非担当（REQ-011-020）

本文生成、完了判定、Epic 依存判定、capture 分類を担当しない。セクションへの振り分け等の
内容Routing は呼び出し側の責務であり、本 Tool は I/O と読み戻し検証のみを担う。

## テスト実行

```bash
bun test        # cwd: src/opencode-local/agentdev-gh-cli
```
