# docs/designs/local/adf-simplification-deferred-records.md の frontmatter updated 陈腐化（IR-072 NG・既存問題）

## 観測内容

- check_integrity が IR-072（req-updated-freshness）で NG 1件を報告している。対象は docs/designs/local/adf-simplification-deferred-records.md。frontmatter updated 2026-11-13 に対し最終 content-change commit が 2026-11-14 で、updated が古い。
- Epic #4054 の 7 委譲すべてが同一 signature を確認し、base commit 7c8931e32 対照で delta 0（本バッチ非起因の既存問題）を証跡化している。integrity レポートは route: intake を案内している。
- Epic #4054 の完了条件には含まれず、各委譲の委譲指示でも「既知 NG・do not fix」として事前告知されていた。

## 影響

- IR-072 の既知 NG 1件が継続報告される（base 起因の既存問題として証跡化済み）。実修復と baseline 登録のいずれかへ分類する判断（integrity-contracts.md「既知残存違反の統一選択基準」参照）が別作業単位として未了。

## 課題

- docs/designs/local/adf-simplification-deferred-records.md の frontmatter updated を最終 content-change commit 日付へ進行する（IR-072 の正規処置）。実修復または baseline 登録のいずれかへ分類する判断（integrity-contracts.md「既知残存違反の統一選択基準」参照）を別作業単位で行う。

## 既存要件との関連

- Epic #4054・PR #4062/#4064/#4063/#4065/#4066/#4067 本文 Findings（対反証として記録済み）
- IR-072（req-updated-freshness）・docs/designs/local/adf-simplification-deferred-records.md

## 突合対象

- 2026-11-13-ir072-req-updated-freshness-known-ng-remediation.md（同 IR の残存 NG 全体の是正候補）
