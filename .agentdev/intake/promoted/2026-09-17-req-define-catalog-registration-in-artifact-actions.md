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

## intake-promote 確定注記（2026-09-18、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用（前提現行化）」で自律確定した。

- 前提現行化（必須）: verification-scope-catalog は DEC-030（accepted、2026-09-17）で廃止され物理削除済み。検証対応要否は traceability/policy.yaml へ移行（未指定 = required、任意行は明示登録制、Case #2936 Wave 4-1 / PR #2952 で移行完了）。本 item の課題は「新規 REQ CREATE を含む draft は traceability/policy.yaml への検証対応要否判断（optional 登録または required 許容）を artifact_actions に含める規則」として現行化して扱うこと。
- 根底の failure mode は現行モデルでも反転存続する（未指定 = required のため、policy 判断を含めない新規 REQ CREATE の Definition は case-ready トレーサビリティ完全性ゲートで fail し得る）。現行 req-define Design の artifact_actions 生成規則に policy 登録の規定は確認できない（grep レベル）。規則追加要否の判断時に req-define Design の全文精査を backend 側で行うこと。
- 観測時点の「未分類」停止は旧モデルの語彙である点にも注意（現行は未分類状態なし）。
