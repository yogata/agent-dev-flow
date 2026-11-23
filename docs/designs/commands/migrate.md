---
title: migrate Design
status: draft
created: 2026-11-23
updated: 2026-11-23
---

<!-- ADF-COVERS(design): REQ-126-001, REQ-126-002 -->

# migrate Design

## 目的

利用プロジェクトの .agentdev/ 配下の構成を配布版の正規構造へ移行する公開コマンドである。構成移行を専用入口へ集約し、install.ps1 と通常コマンドを移行処理から分離する。

## 入力

- 移行の指示（自然言語。省略時は検知結果から対象を解決する）
- .agentdev/install-state.json の記録版とチェックアウトの src/common/VERSION の差分
- install.ps1 -Check の検知結果（旧構造痕跡・版不一致・未移行）

## 出力

- 移行の結果（適用した差分仕様、旧新対応、引き継いだ情報とその内容・処理状態、削除した旧痕跡、決定論的検証の結果）
- 移行不能・要判断事項は、不足する情報とユーザー判断の内容を分離した報告

## 副作用

- .agentdev/ 配下の旧配置から新配置への移動・改名、旧痕跡の削除（削除はユーザー確認後）
- install.ps1 -Check の実行

## 現在の動作

- 公開目的: .agentdev/ の構成移行を版別差分仕様と最新の正規構造に基づく推論移行と決定論的事後検証に分離して実行する
- 必須順序: 現状把握（版差分・旧痕跡の検知）→ 差分仕様の解決 → ユーザー確認 → 移行実行 → 旧痕跡削除 → 決定論的検証（install.ps1 -Check 再実行）→ 報告。検証が成立するまで完了を示さない
- 利用 skill: `agentdev-workflow-migrate`（workflow 実装本体への委譲。差分仕様の解決、削除判断のユーザー確認、決定論的検証を同スキルが所有する）

## 参照する横断 Design

- [workflows/workflow-skill-model.md](../workflows/workflow-skill-model.md)（Command / Workflow Skill 責務分離）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（委譲契約）

## 対象外

- チェックアウトの取得・更新とプロジェクション配置（install.ps1 の責務）
- 旧パスへのフォールバック、互換シム
- REQ/Decision/Design 等の正規成果物の内容変換
- 検証不成立の成功扱い

## 検証観点

- 決定論的事後検証（install.ps1 -Check）が版一致・旧痕跡不在を決定論的に判定すること
- 配布された入口から差分仕様と最新の構造を解決でき、旧構造からの実行時に検証不成立を成功扱いしないこと
