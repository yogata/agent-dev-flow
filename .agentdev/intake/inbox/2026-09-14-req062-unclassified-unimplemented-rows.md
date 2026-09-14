# REQ-062（case-revise 実行契約）全 8 行が未分類・未実装のまま残存

## 概要

traceability check の verificationClassification により、REQ-062（case-revise 実行契約）の全 8 行（REQ-062-001..008）が未分類（unclassified）かつ未実装のまま残存していることが確認された。REQ-062 は本 Issue（#2809 / OU-004）対象外で別 OU（OU-005 / #2810）専属。

## 内容

- REQ-062-001..008 の実装対応宣言・検証対応宣言の付与は OU-005（#2810）の実装スコープで実施する
- 未分類残存は case-open / case-close の段階ゲートの完了阻止条件となるため、OU-005 実行時に宣言付与と恒久検証手段の整備を必須とする

## 根拠

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 Findings/Capture候補（intake 候補）、case-close（2026-09-14）で回収
- 元テキスト: PR #2817 本文「REQ-062（case-revise 実行契約）の全 8 行が未分類・未実装のまま残存（発見元: traceability check verificationClassification。REQ-062 は本 Issue 対象外で別 OU 専属）。分類: intake」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
