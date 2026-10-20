# agentdev-gh Local 実装 Tool（ローカル版）

Custom Tool `agentdev_gh` の Local 実現。同一の操作契約
（`src/common/tools/agentdev-gh/contracts.ts` の20操作。Release 操作4操作は GitHub 接続専用で
Local 版は構造化失敗）を、GitHub Issue/PR の代わりに
ローカルIssue（`.agentdev/issues/issue-{NNNN}.md`、単一採番空間、role 条件付きスキーマ）の
読み書きへ読み替える `GhRunner` 実現（`runner-local.ts`）を提供する。

本ディレクトリはローカル版における Custom Tool `agentdev_gh` の Local 実装であり、ローカル版の
I/O 正規経路である。上位 command / skill は GitHub 版と同じく Custom Tool
`agentdev_gh` の操作契約のみを参照し、ローカル版であることを意識しない。

## 接続方式

`scripts/install.ps1 -Mode apply -LocalMode` は `.opencode/tools/agentdev-gh/` の junction 先を
GitHub 実装の engine 領域（`src/common/tools/agentdev-gh/`）から本ディレクトリ（`src/common/tools/agentdev-gh/local/`）へ
差し替える。登録 Plugin（`src/opencode/plugins/agentdev-gh-tool/`）は投影パスの
`runner-local.ts` を検出した場合に本実装を使用する。

## 読み替え規則（操作契約の写像）

| 操作 | ローカルIssue上の読み替え先 |
|---|---|
| `issue_create` | ローカルIssue新規作成（採番: 既存最大 + 1、4 桁ゼロ埋め、role をまたぐ単一空間、欠番再利用なし）。`role: tracking` は kind と初期状態 起票（created）を設定 |
| `issue_read` | ローカルIssue全文読込（frontmatter + 本文）。state は role ごとの終端判定（非終端 → `open`、終端 → `closed`）。role/kind/trackingState を導出して返す |
| `issue_update` | 本文指定時はローカルIssue全文をそのまま反映（`updated_at` 更新は呼び出し側の責務。読み戻し検証は全文一致を要求）。title/labels/kind/trackingState 指定時は frontmatter を書き換える |
| `issue_close` | tracking: `status: closed`（両 reason 共通）。case: `status: closed`（`not_planned` は `cancelled`）+ `closed_at` 更新 |
| `issue_list` | `.agentdev/issues/` のスキャンと role/kind/trackingState/state/labels/search による絞り込み |
| `issue_reopen` | tracking の `closed` → `in-discussion` + `closed_at` クリア。case は終端状態からの遷移なしとして拒否 |
| `pr_create` | 最新の role: case ローカルIssueへ `## マージ前確認` セクション追記（`### PR title: {title}` + 本文）。操作契約上 pr_create は番号を持たないため |
| `pr_read` | 最後の `## マージ前確認` から title を抽出し、body として論理 PR 本文（`## マージ前確認` / `## Design確定候補` / `## Findings / Capture候補` の3セクションの定義順直列化）を返す。state は `## マージ結果` 記録済み → `merged`、それ以外は status から写像 |
| `pr_merge` | `## マージ結果` へ記録（操作、コミットハッシュ、実行日時、結果）。関連コミットのローカル Git 実在を確認（VERIFY）してから記録する。取り込みの実行主体はローカル版 case-close（GitHub PR 取り込みは実行しない）。失敗・未完了の場合は呼出側（case-close）が status を `blocked` へ更新し `## 残課題` へ理由を記録する |
| `pr_changed_files` | 空配列（ローカルに変更ファイル一覧は不存在。Git worktree の実状態が正） |
| `pr_mergeable` | `status: active` かつ `## マージ結果` 未記録（マージ前確認セクションあり）→ `MERGEABLE`、それ以外 → `UNKNOWN` |
| `pr_update` | role: case の最後の `## マージ前確認` を対象に、PR タイトル行と本文の3論理セクションを項目単位で更新し、読み戻しで検証 |
| `comment_create`、`comment_list`、`comment_update`、`comment_delete` | role に応じたコメント相当セクション（tracking: `## 検討経過`、case: `## 作業ログ`）を `c{NN}` 形式で操作。公開 commentId は `issue-{NNNN}-c{NN}`、採番水位は frontmatter の `comment_seq` で管理 |

出力 URL はローカルIssueファイルの絶対パス（GitHub 実装の Issue/PR URL に代わる一意識別子）。

ローカルIssueのスキーマ（role 条件付きの status・labels・見出し、採番）の操作用定義は
[case-schema/case-file.md](case-schema/case-file.md)。意味仕様の正本は `docs/designs/local/local-case-file.md`。

Comment の本文は見出し直後の `### c{NN} {ISO 8601 日時}` から次のエントリまでを読み取り、本文と区切り空行を保持する。旧形式の日時見出しと case の見出しなし作業ログは、最初のコメント書込時に新形式へ移行する。

## 実装開始境界の情報取得（REQ-111-017）

実装の開始境界で呼び出し側（case 系 workflow）が照合する対象（Issue 本文の確定事項・未決事項・採用判断、blocked/failed の SSoT コメント、PR 本文の検証・Findings・Design確定候補情報）は、GitHub 版と同一の操作契約で取得できる。`issue_read` はローカルIssue全文（frontmatter + 本文）を返し、`comment_list` はコメント相当セクションの時系列エントリを返し、`pr_read` は `## マージ前確認` / `## Design確定候補` / `## Findings / Capture候補` の3論理セクションを定義順で直列化した本文を返す（`case-schema/case-file.md` の GitHub Issue / PR 置換対応表参照）。本 Tool は内容を解釈・選別せず全文と等価な構造を返すため、呼び出し側は版を意識せず GitHub 版と同一の照合を実行できる。機械検証は `tests/runner-local.test.ts`（issue_read 全文返却、pr_read 3セクション直列化、comment_list round-trip）が恒常的な検証手段である。

## role 条件付きスキーマの機械検証

本実装は role ごとの必須メタデータ、status 値域、labels 値域、closed_at 条件、許可操作
（PR 系操作の role: case 限定、case 終端状態の reopen 拒否）を機械検証する。
スキーマ違反のローカルIssueへの読み取りは失敗し、成功扱いとしない。

## 非担当

本文生成、完了判定、Epic 依存判定、capture 分類を担当しない。セクションへの振り分け等の
内容Routing は呼び出し側の責務であり、本 Tool は I/O と読み戻し検証のみを担う。

## テスト実行

```bash
bun test        # cwd: src/common/tools/agentdev-gh/local
```
