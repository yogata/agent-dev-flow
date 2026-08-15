# intake: README と consumer-project-setup guide の clone 前提導線が未更新（OU-002 対象）

## 発生日

2026-08-15

## 発生元

- 取得元: case-close Capture 回収（PR #2131 本文 `## Findings / Capture候補` intake セクション）

## 問題事象

install スクリプトがチェックアウト済み前提（provisioning 削除）へ変更された後も、README.md「適用プロジェクトへの導入」と docs/guides/consumer-project-setup.md の導線が clone 前提（スクリプトが clone を代行する前提）のまま未更新。

## 影響

- 利用手順書どおり進めた利用者が前提不一致に到達する（スクリプトはチェックアウト済み前提でエラー停止し案内を表示する）
- REQ-009-046〜048（provisioning 不実行、usable checkout 判定、ZIP 許容）と文書導線の乖離

## 発生局面

実装（OU-001 のスコープ宣言済み対象外。Issue #2128 の scope-affecting impact candidate に OU-002 担当として記載済み）

## 検知方法

PR #2131 のテスト戦略実施時の観測。

## 想定される対応方向

- OU-002（Issue #2129）が README・guide 導線更新を担当宣言済みのため、当該 Issue で解消予定。intake-promote は Issue #2129 との重複確認のうえ処分を判断する

## 関連

- Issue: #2128（OU-001、scope-affecting impact candidate）
- 担当宣言: Issue #2129（OU-002）
- PR: #2131
- 対象ファイル: README.md、docs/guides/consumer-project-setup.md

## 出典引用

PR #2131 本文 `## Findings / Capture候補` intake セクションより:

> README.md「適用プロジェクトへの導入」と docs/guides/consumer-project-setup.md の clone 前提導線が未更新（OU-002 対象）

## タグ

#intake #readme #consumer-setup-guide #install-flow #ou-002 #issue-2129
