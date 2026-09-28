---
id: PATTERNS-V3-MIGRATION-OLD-NOTATION-INCIDENT
title: "v3.0.0 移行後の旧 REQ 表記残存事象の記録（patterns.md 件数固定記述禁止の根拠）"
status: accepted
created: 2026-09-29
source_issue: "#3233"
---

# v3.0.0 移行後の旧 REQ 表記残存事象の記録

本 Report は `docs/designs/foundations/patterns.md`「REQ 範囲の現行仕様と表記」節から移動した履歴叙述を保持する（Design の記述対象外: 作業履歴・監査結果・評価結果・実測値。document-model.md 準拠。Case #3233・AG-016(d)）。

## 事象

v3.0.0 移行後に旧表記（REQ-001〜0133、25 件）が残存した。

## 未検出の経緯

当該残存を IR-042（hardcoded-req-count）、IR-018（REQ 範囲表記鮮度）が検出しなかった理由は、両ルールが full-audit gate で検出器実装を持たず（regression_test は手動確認、`check_integrity.ts` 未実装）、v3.0.0 移行以降に full-audit が実行されていなかったためである（実行頻度の欠如）。

## 残置事項

表記形式の対象漏れの有無は検出器不在のため未検証であり、検出器実装時に確認する（patterns.md 本節へ参照を残置）。
