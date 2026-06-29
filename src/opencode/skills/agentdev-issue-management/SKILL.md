---
name: agentdev-issue-management
description: Enforces safe GitHub Issue operation procedures for creation, update, linking, and verification across case-open/case-close/case-update. Operation skill (like `agentdev-gh-cli`) providing safe procedures, NOT judgment criteria. Coordinates with `agentdev-gh-cli` VERIFY operations. USE FOR: GitHub Issue作成、更新、リンク、確認の安全手順、Issue操作後のVERIFY手順、Parent/Child Issue間リンク確認（Parent: #N パターン検証）、Epic Issueステータス追跡テーブル更新の安全手順、Issue更新時の前後内容比較手順、Issue内容検証手続き（`agentdev-gh-cli` VERIFY 連携）. DO NOT USE FOR: Epic/child Issue作成順序（case-open command）、Issue本文構造（template）、RU削除（req-file-manager）、完了報告、work_type判定（workflow-lifecycle）、gh CLI のエンコーディング、ファイル書き込み安全性（`agentdev-gh-cli`）.
---

# `agentdev-issue-management`

GitHub Issue の作成、更新、リンク、確認を安全に行うための操作手順を提供するスキル。
`agentdev-gh-cli` の VERIFY 操作（書き込み内容検証）と連携し、Issue 操作特有の安全性要件を補完する。

## USE FOR

- GitHub Issue の作成、更新、リンク、確認の安全手順
- Issue 操作後の VERIFY 手順（内容反映確認）
- Parent/Child Issue 間のリンク確認（`Parent: #N` パターン検証、双方向リンク確認）
- Epic Issue のステータス追跡テーブル更新の安全手順
- Issue 更新時の前後内容比較手順
- Issue 内容検証手続き（`agentdev-gh-cli` VERIFY との連携）

## DO NOT USE FOR

- Epic/child Issue の作成順序、Wave スケジューリング → `case-open` command
- Issue 本文の構造、テンプレート → `agentdev-workflow-templates`
- RU ファイルの削除手順 → `agentdev-req-file-manager`
- 完了報告テンプレート → `agentdev-workflow-templates`
- work_type 判定、ラベル体系 → `agentdev-workflow-lifecycle`
- gh CLI のエンコーディング、ファイル書き込み安全性の基本手順 → `agentdev-gh-cli`

## 対象コマンド

| コマンド | 本スキルの利用目的 |
|----------|-------------------|
| `case-open` | Issue 作成後の VERIFY、Parent/Child リンク確認、Epic ステータス追跡テーブル更新の安全手順 |
| `case-close` | Issue 本文更新時の前後内容比較、コメント追記後の VERIFY、Parent Issue 本文更新の安全手順 |
| `case-update` | Issue 本文更新、コメント追加後の通常検証、前後内容比較 |

## references/ 構成一覧

| トピック | 参照先 |
|----------|--------|
| Issue 操作の安全性手順（作成後確認、Parent/Child リンク確認、Epic テーブル更新、前後内容比較、VERIFY 連携、禁止事項） | `references/issue-operation-safety.md` |

## 動作指針

- 本スキルの各手順は `agentdev-gh-cli` の読み取り手続きおよび VERIFY 操作と連携する。読み取り、書き込みの基本安全性は `agentdev-gh-cli` を参照すること。
- Issue 操作特有の安全性要件（リンク確認、テーブル整合性、前後比較、プレースホルダー残存検証）を本スキルが補完する。
- 各書き込み操作（作成、更新、コメント追加）ごとに個別に VERIFY を実行すること（一括検証は不可）。

## See Also

- `agentdev-gh-cli`（gh CLI のエンコーディング、ファイル書き込み安全性、VERIFY 操作（書き込み内容検証）の基本手順。本スキルの各手順は `agentdev-gh-cli` の VERIFY 操作およびリトライロジックと連携する。）
- `agentdev-workflow-templates`（Issue 本文の構造、テンプレート（`issue_desc_feature.md`, `issue_desc_bug.md`, `issue_desc_epic.md`, `issue_desc_child.md`）、コメントテンプレート、完了報告テンプレート、リポジトリ参照リンク規約。）

## 禁止事項

- 本スキルで Issue 本文の構造、テンプレートを定義しないこと（`agentdev-workflow-templates` の責務）
- 本スキルで Epic/child Issue の作成順序、Wave スケジューリングを定義しないこと（`case-open` command の責務）
- 本スキルで RU 削除、完了報告を扱わないこと（`agentdev-req-file-manager`/ テンプレートの責務）
- 本スキルで work_type 判定、ラベル体系を扱わないこと（`agentdev-workflow-lifecycle` の責務）

