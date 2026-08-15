# intake: install スクリプトのウィザード・コメントヘルプ文言が provisioning 前提のまま残存（OU-003 対象）

## 発生日

2026-08-15

## 発生元

- 取得元: case-close Capture 回収（PR #2131 本文 `## Findings / Capture候補` intake セクション）

## 問題事象

scripts/install-consumer-opencode.ps1 から provisioning を削除した PR #2131（Issue #2128 / OU-001）マージ後も、ウィザード（Invoke-InstallWizard Q1）とコメントヘルプ DESCRIPTION が「apply: clone して実行」等の旧前提文言のまま残存している。実挙動（チェックアウト済み前提、provisioning 不実行）と文言が不一致。

## 影響

- 利用者がウィザード・ヘルプ経由で「apply が clone を代行する」と誤解する
- DEC-016（導入系スクリプトの副作用ゼロ原則）と案内文言の整合性が欠ける

## 発生局面

実装（OU-001 のスコープ宣言済み対象外。Issue #2128 の scope-affecting impact candidate に OU-003 担当として記載済み）

## 検知方法

PR #2131 のテスト戦略実施時の観測。

## 想定される対応方向

- OU-003（Issue #2130）がウィザード・ヘルプ文言の更新と -RepoUrl/-Branch 廃止を担当宣言済みのため、当該 Issue で解消予定。intake-promote は Issue #2130 との重複確認のうえ処分を判断する

## 関連

- Issue: #2128（OU-001、scope-affecting impact candidate）
- 担当宣言: Issue #2130（OU-003）
- PR: #2131
- 対象ファイル: scripts/install-consumer-opencode.ps1（Invoke-InstallWizard Q1、DESCRIPTION コメント）

## 出典引用

PR #2131 本文 `## Findings / Capture候補` intake セクションより:

> ウィザード（Invoke-InstallWizard Q1）とコメントヘルプ DESCRIPTION が「apply: clone して実行」等の旧前提文言のまま。本 Issue では対象外（OU-003 がウィザード・ヘルプ文言と -RepoUrl/-Branch 廃止を担当）

## タグ

#intake #install-script #wizard-wording #help-text #ou-003 #issue-2130
