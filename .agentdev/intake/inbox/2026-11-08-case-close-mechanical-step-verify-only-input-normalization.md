# case-close STEP-5 の verify-only closure 機械工程入力組み立て手順の正規化（ワークアラウンド除去）

## 観測事実

- close_mechanical_steps の mergeable-polling N/A 経路（prNumber 0・PR 不在構成）は、機械工程単体では PR #3982（Case #3979）で正規受理を実装・テスト済み（prNotApplicable pass・gh pr view 非発行・accepted=true 書出し・機械受理明示消費追加）。
- 一方、呼出側（case-close STEP-5・workflow skill 本文側の機械工程入力組み立て手順）は、#3972 verify-only closure close 実行時の学習記録（2026-11-08 実測）にある「prNumber 0 + mergeablePolling maxAttempts 0」のワークアラウンド構成を前提にした手順のままである。機械工程が prNumber 0 を正規受理する現行実装では、maxAttempts 0 を併用せず正規入力構成（prNumber 0・通常の mergeablePolling 設定）で起動する手順に追随すべきである。
- 計測 2026-11-08・Case #3979 / PR #3982 本文の Findings/Capture候補 intake より回収。

## 具体的な修正対象

- agentdev-workflow-case-close の workflow skill 本文・references（cleanup-and-capture.md 等の機械工程呼出手順）における verify-only closure 時の機械工程入力組み立て手順の正規化（ワークアラウンド構成〔mergeablePolling maxAttempts 0〕の除去・prNumber 0 正規構成への追随）。
- 対象は workflow skill 本文（配布手順記述）の変更であり、機械工程 script 本体は対象外（PR #3982 で完結済み）。

## 関連

- Case #3979、PR #3982（PR 本文 Findings/Capture候補 intake より回収・2026-11-08）
- 学習記録 2026-11-08 実測（#3972 verify-only closure close・ワークアラウンド構成の由来・Issue コメント issuecomment-6717844662）
