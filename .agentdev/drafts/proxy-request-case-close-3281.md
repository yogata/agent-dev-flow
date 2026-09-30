# case-close proxy request package — Epic #3280 Wave 1 boundary close (Issue #3281 / PR #3285)

- adf_delegation: DEL-3280-2
- 生成: 2026-10-01（case-close workflow executor）
- 原因: serve 全体の agentdev_gh gh exit 66 劣化。pr_merge #3285 が初回＋追試行1回の2回とも失敗したため、gh 障害時プロトコル（Case #3278 合意・外側 Supervisor write-proxy 運用）へ切替
- 確定済み判断: QG docs 検証全項目 pass・完了条件チェックボックス 7件評価完了・Epic 表更新内容確定・capture 分離判断完了。Supervisor は書き込み実行と読み戻し検証のみを行い、判断の代行は行わない
- 補助 payload（同ディレクトリ・UTF-8 BOM なし）:
  - proxy-case-close-3281-issue-3281-body.md（Issue #3281 更新後本文全文）
  - proxy-case-close-3281-comment-3281.md（Issue #3281 対応記録コメント全文）
  - proxy-case-close-3281-epic-3280-body.md（Epic #3280 更新後本文全文）

## 実行順序付き操作リスト（ある操作が失敗したら残りを中止して報告する）

| # | 操作 | 対象 | 概要 |
|---|---|---|---|
| 1 | pr_merge | PR #3285 | squash merge（base main）。--delete-branch 相当は使用しない（local checkout 副作用禁止） |
| 2 | issue_update | Issue #3281 | 本文を proxy-case-close-3281-issue-3281-body.md の全文へ差し替え（title 変更なし） |
| 3 | comment_create | Issue #3281 | proxy-case-close-3281-comment-3281.md の全文をコメント投稿 |
| 4 | issue_close | Issue #3281 | reason: completed |
| 5 | issue_update | Epic #3280 | 本文を proxy-case-close-3281-epic-3280-body.md の全文へ差し替え（title 変更なし） |

依存: 操作2 は 操作1 の成功後のみ実行。操作3 は 操作2 の後。操作4 は 操作3 の後。操作5 は 操作4 の後（操作4 失敗時でも 操作5 のみは実行可とする〔Epic 表は実態反映。ただし報告に明記すること〕）。

## 各操作の exact operation 名と構造化引数

### 1. pr_merge
```json
{"operation": "pr_merge", "number": 3285, "method": "squash"}
```

### 2. issue_update #3281
```json
{"operation": "issue_update", "number": 3281, "body": "<proxy-case-close-3281-issue-3281-body.md の全文をそのまま設定>"}
```
title は変更しない（payload に title は含めない。現在の title を維持）。

### 3. comment_create #3281
```json
{"operation": "comment_create", "number": 3281, "body": "<proxy-case-close-3281-comment-3281.md の全文をそのまま設定>"}
```

### 4. issue_close #3281
```json
{"operation": "issue_close", "number": 3281, "reason": "completed"}
```

### 5. issue_update #3280
```json
{"operation": "issue_update", "number": 3280, "body": "<proxy-case-close-3281-epic-3280-body.md の全文をそのまま設定>"}
```
title は変更しない。

## 事前条件

- 操作1: PR #3285 state=OPEN・mergeable=MERGEABLE（2026-10-01 実測済み・head 02e905cbb7400dcb787cbcd9ada0c118d5bff8b9・base main・mergeStateStatus CLEAN）。実行前に `gh pr view 3285 --json state,mergeable` で再確認し、state=MERGED へ変わっている場合は操作1をスキップして操作2から続行する
- 操作2〜5: 直前操作の成功。各操作の実行は agentdev_gh（または Supervisor の write-proxy 経路）で行い、gh CLI 直接書き込みは行わない
- 読み戻し検証は gh CLI 読み取りでよい（sanctioned）

## read-back 期待値（検証可能な形式）

- 操作1後: `gh pr view 3285 --json state,mergeCommit` → state=MERGED・mergeCommit.oid が 40桁 hash。merge commit hash（short 可）を報告に記録する
- 操作2後: `gh issue view 3281 --json body --jq .body` → `- [x] ` で始まる行が 7行・`- [ ] ` で始まる行が 0行・`case-close QG` の文字列出現 6箇所以上
- 操作3後: `gh issue view 3281 --json comments`（または comments API）→ 「## 対応記録（case-close・DEL-3280-2）」で始まるコメントが 1件存在
- 操作4後: `gh issue view 3281 --json state,stateReason` → state=CLOSED・stateReason=COMPLETED
- 操作5後: `gh issue view 3280 --json body --jq .body` → `| 1-1 | #3281 | completed | ` 行が 1件存在・`| pending | 3 |` 存在・`| completed | 1 |` 存在・`| pending | 4 |` 不存在・`| 1-1 | #3281 | pending |` 不存在

## merge 後の main 同期手順

1. メインリポジトリ root（C:/Users/ogatay/work/agent-dev-flow）で `git pull --ff-only origin main`（merge 後の main を取得）
2. merge commit 確認: `git log --oneline -1 origin/main`
3. ローカル検証（推奨・読み取りのみ）:
   - `rg -n "semantic 担当|deterministic 委譲先" docs/designs/skills/` → ヒット 0件期待
   - `rg -n "REQ-003-05[56]" docs/designs/commands/` → ヒット 0件期待
   - `bun run ./.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts --json` → findings 0期待。squash merge の committer date 置換で計測日 drift を検出した場合、generate_indexes.ts 再生成は次回 docs commit 経路へ記録（境界 close 自身は索引を直接編集しない）
4. worktree .worktrees/3281-docs と branch docs/issue-3281 の削除は行わない（親 case-auto の Wave 反復制御が cleanup 判断を所有）

## 判断記録（確定済み・Supervisor が再判断しないこと）

- QG docs 検証: 全項目 pass。証跡は対応記録コメント payload 内の検証差分テーブル（検証種別・結果・件数突合を記録済み）
- 完了条件チェックボックス 7件: 全て達成（1〜6 は QG 実測で証明・7 は merge 後に成立）
- Epic 表更新: 分解テーブル 1-1 行 completed・追跡テーブル pending 3 / completed 1 のみ変更。他行・Epic 完了条件チェックボックス（4件）は verbatim 維持（中間 Wave のため E5-1 契約により未更新）
- capture 回収: learning 0件・intake 0件（判断根拠は対応記録コメント payload 内「Capture 回収判断」）
- 本 package の対象外: Wave 2（#3282〜#3284）の開始・Root Case #3278 のクローズ・Epic 完了条件チェックボックスの更新・他行のステータス書き換え
