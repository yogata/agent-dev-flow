# agentdev-gh Local 実装 Tool（ローカル版）

Custom Tool `agentdev_gh` の Local 実装（REQ-011-006、DEC-004）。同一の操作契約
（`src/opencode/tools/agentdev-gh/contracts.ts` の10操作）を、GitHub Issue/PR の代わりに
Case ファイル（`.agentdev/cases/case-{NNNN}.md`）の読み書きへ読み替える `GhRunner` 実装（`runner-local.ts`）を提供する。

本ディレクトリは旧 agentdev-gh-cli スキル（ローカル版）の後継であり、I/O 正規経路としての
スキルは解消済み（REQ-011-001）。上位 command / skill は GitHub 版と同じく Custom Tool
`agentdev_gh` の操作契約のみを参照し、ローカル版であることを意識しない。

## 接続方式

`scripts/install.ps1 -Mode apply -LocalMode` は `.opencode/tools/agentdev-gh/` の junction 先を
`src/opencode/tools/agentdev-gh/` から本ディレクトリ（`src/opencode-local/agentdev-gh-cli/`）へ
差し替える。登録 Plugin（`src/opencode/plugins/agentdev-gh-tool/`）は投影パスの
`runner-local.ts` を検出した場合に本実装を使用する。

## 読み替え規則（操作契約の写像）

| 操作 | Case ファイル上の読み替え先 |
|---|---|
| `issue_create` | Case ファイル新規作成（採番: 既存最大 + 1、4 桁ゼロ埋め、欠番再利用なし） |
| `issue_read` | Case ファイル全文読込（frontmatter + 本文）。state は status の非終端 → `open`、終端 → `closed` |
| `issue_update` | Case ファイル全文をそのまま反映（`updated_at` 更新は呼び出し側の責務。読み戻し検証は全文一致を要求する） |
| `issue_comment` | `## 作業ログ` へ追記（セクション未存在時は `## Design確定候補` / `## Findings / Capture候補` の直前に新設） |
| `issue_close` | `status: closed`（`not_planned` は `cancelled`）+ `closed_at` 更新 |
| `pr_create` | 最新 Case へ `## マージ前確認` セクション追記（`### PR title: {title}` + 本文）。操作契約上 pr_create は番号を持たないため、対象は最新 Case |
| `pr_read` | 最後の `## マージ前確認` から title を抽出。state は `## マージ結果` 記録済み → `merged`、それ以外は status から写像 |
| `pr_merge` | `## マージ結果` へ記録（操作、実行日時、結果 `PASS`）。GitHub PR 取り込みは実行しない |
| `pr_changed_files` | 空配列（ローカルに変更ファイル一覧は不存在。Git worktree の実状態が正） |
| `pr_mergeable` | `status: review` → `MERGEABLE`、それ以外 → `UNKNOWN` |

出力 URL は Case ファイルの絶対パス（GitHub 実装の Issue/PR URL に代わる一意識別子）。

Case ファイルのスキーマ、status 状態遷移、見出し一覧の操作用定義は [case-schema/case-file.md](case-schema/case-file.md)。意味仕様の正本は `docs/designs/local/local-case-file.md`。

## 非担当（REQ-011-020）

本文生成、完了判定、Epic 依存判定、capture 分類を担当しない。セクションへの振り分け等の
内容Routing は呼び出し側の責務であり、本 Tool は I/O と読み戻し検証のみを担う。

## テスト実行

```bash
bun test        # cwd: src/opencode-local/agentdev-gh-cli
```
