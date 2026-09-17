# 新規 REQ CREATE を含む draft は verification-scope-catalog 節登録を artifact_actions に含めるべき（プロセス改善候補）

## 観測
Case #2898（REQ-083 CREATE）では、req-define の draft に verification-scope-catalog への当該 REQ 節登録が artifact_actions に含まれておらず、case-ready の検証対応要否ゲートで REQ-083-001〜006 が未分類と判定され ready 未遷移で停止した。後追いで再合意（ACT-DESIGN-022、CR-006）により Definition Amendment PR #2900 でカタログ節を追加した。

## 今回扱わない理由
本 Case（Case #2898）は完了済み。req-define の draft 生成手順（artifact_actions 構成規則）の是正は本 Case 範囲外のプロセス改善。

## 影響
新規 REQ CREATE を含む draft が同じ構成で生成されるたびに、case-ready の検証対応要否ゲートで未分類停止が再発し、case-revise（Amendment PR）による後追い補完コストが発生する。req-define F-2 と同根の課題。

## レビューで決めること
req-define の draft 生成規則（artifact_actions）へ「新規 REQ CREATE を含む場合は verification-scope-catalog への当該 REQ 節登録を含める」規則の追加要否と、case-open / case-ready の冪等再実行との整合。既存学び（learning inbox.md 2026-09-16「docs_chore の REQ 行 APPEND では traceability の missing-verification（unclassified）が必ず残る」）との統合・分割判定。

## 根拠（任意）
Case #2898（Case 状態遷移記録・Issue コメント参照）、PR #2900（definition-amend/issue-2898、squash merge c6c2cce4）、Issue #2898 Execution Contract（case-ready 再実行記録）。
