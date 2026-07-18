# Intake Item: docs/guides/project-docs-and-specs.md の REQ 範囲記載陳腐化

## 発生源

- docs-check 実行日時: 2026-07-18
- 検査スクリプト: check_integrity.ts (Canonical / req-range-staleness)
- 検査ルート: intake
- 原因分類: 確認済（REQ-0162 追加時のガイド更新漏れ）

## 問題

`docs/guides/project-docs-and-specs.md` が「REQ-0101 から REQ-0161」までの範囲と記載しているが、実際の active REQ ファイルは REQ-0162 まで存在する（53ファイル）。REQ-0162 追加時に同ガイドの範囲記載が更新されなかった。

検出1件:

- ファイル: `docs/guides/project-docs-and-specs.md`
- 記載: `REQ-0101 から REQ-0161`
- 実態: 最終 active REQ は `REQ-0162`（53ファイル）

## 推奨修正対象

`docs/guides/project-docs-and-specs.md` の REQ 範囲記載を `REQ-0161` → `REQ-0162` へ更新する。

予防策検討（別件）: REQ 新規採番時に `docs/guides/project-docs-and-specs.md` の範囲記載を自動更新する仕組み、または req-save が同ガイドの範囲チェックを行う仕組みを検討すると再発防止になる可能性。本 item は修正自体が主目的で、予防策は知見として記録。

昇格先候補: intake-promote で採否判断。修正は1ファイル1行変更のため単純だが、docs 整合性に関わるためガイド全体の精査を含めてもよい。

## 関連

- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（Canonical セクション）
- 対象ファイル: `docs/guides/project-docs-and-specs.md`
- 関連 REQ: REQ-0101（文書・REQ管理基準）、REQ-0162（最新 active REQ）
