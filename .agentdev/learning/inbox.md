# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-22: 配布物への concrete-id・producer metadata の混入を配布依存境界検査が検出

- **問題事象**: Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載したところ、配布依存境界 source profile で 69 failures を検出した。
- **発生局面**: case-run（DEL-3056-1）。Jev 先行評価 Tool 新設と6系統 Workflow reference 追記時。
- **検知方法**: check_distribution_boundary.ts --profile source（case-run STEP-S5 と case-close 最終 gate）。
- **根本原因**: 配布物は `REQ-{NNNN}` プレースホルダ形式が慣行であり、対応宣言は traceability sidecar（`traceability/*.yaml`）に置くのが正。inline declaration は producer 側成果物（docs 配下・producer 専用スクリプト）限定。
- **自律対応内容**: 配布物から concrete-id と ADF-COVERS 宣言を除去し、sidecar（traceability/agentdev-jev.yaml 等 7 件）へ対応宣言を登録し直し、failures 0 に解消（PR #3058 merge 済み）。
- **ユーザー確認の有無**: なし（case-run 内で自律修正・検証差分に記録）。
- **Decision/REQ/spec影響**: なし（既存の配布依存境界 Design〔DEC-014・REQ-029〕と traceability sidecar 正規配置の再適用）。
- **横展開観点**: tools / plugins / skills 配下の新規配布物を作成する全 Case で再発し得る。
- **再発条件**: 新規配布物の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合。
- **予防策候補**: 「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を実装系 Skill 実行時・case-run の確認観点として明示する。
- **想定反映先**: 配布依存境界 Design の運用ガイド、または case-run 実行系の確認観点（REQ 化は learning-promote で判断）。
- **関連**: Case #3056、PR #3058、traceability/agentdev-jev.yaml、配布依存境界（DEC-014・REQ-029）。
- **タグ**: #distribution-boundary #concrete-id #traceability-sidecar

---
