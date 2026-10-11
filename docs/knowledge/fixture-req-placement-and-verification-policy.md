---
title: fixture 検証の REQ 配置と verification policy 影響の前置（架空 REQ 配置と policy.yaml 有無確認）
created: 2026-10-11
updated: 2026-10-11
---

# fixture 検証の REQ 配置と verification policy 影響の前置（架空 REQ 配置と policy.yaml 有無確認）

## 知識内容

代表事例の fixture 構築で traceability check / v5 モード実証を繰り返す場合、fixture 設計時に次の 2 点を前置する。

1. **fixture root への REQ 行配置**: 架空 REQ ID を使う管理された検証対象では、fixture root に `docs/requirements/REQ-*.md` を要件テーブル行形式で配置する必要がある。REQ 行配置漏れは検証対象データの不備として検出に向かう。
2. **traceability/policy.yaml の有無確認**: policy.yaml が不在の場合は全要件行が検証対応必須として扱われ、検証対応宣言なしの fixture REQ 行は missing-verification として fail に向かう。fixture 内への policy.yaml 設置オプションを設計時に確認する。この前置がないと、初回実行者が traceability check の fail を検証対象データ由来か実装欠陥由来か区別できず誤判断し得る。

加えて、PR #3602 §3 の fixture 設計 3 点運用を手順に含める。

- fixture 内 git リポジトリによる成果物表出の代替
- 架空 REQ の配置（管理された検証対象としての架空 REQ ID 使用）
- GitHub 資産を作らない場合の検証対象内代替の明示

## 適用条件

- fixture ベースの v5 モード実行実証・検証を繰り返す場合。
- 架空 REQ ID を使う管理された検証対象を fixture に構築する場合。
- fixture 構築時に traceability check の fail の由来（検証対象データ由来か実装欠陥由来か）を分離する必要がある場合。

## 適用対象

- 代表事例 fixture 構築手順（PR #3602 §3 の fixture 設計運用）。
- checker 系検証・traceability check を fixture に対して実行する全工程。
- fixture root への REQ 行配置と policy.yaml 設置の設計判断。

## 根拠

- PR #3602 代表事例 (a)(b) の fixture 構築実績（PR 本文 §3 の記録が SSoT。worktree 内 fixture `.agentdev/tmp/DEL-3593-1/` case-a・case-b は worktree 側 gitignored 領域で永続対象外）。
- Issue #3593 コメント 6096682530: PR #3602 Design 確定候補評価の見送り記録。本知識はその再評価契機に対応する後続工程（learning-promote / backlog-review 経由の promoted 入力）で採否判断される前提の知見として整理。
- intake promoted 2026-10-10-case-3593-fixture-req-placement-and-verification-policy（backlog-review 2026-10-11 で知識化）。learning promoted / deferred に fixture 検証手順の同主題知見は存在しないことを promote 実行時に確認済み。

## 関連知識

- [checker fixture の import 共有 adversarial test パターン](checker-fixture-import-share-adversarial-test-pattern.md)（checker のテスト fixture パターンであり本知識は検証手順の REQ 配置・policy 影響と別主題）。
- [v5 baseline 確認情報の保存](v5-baseline-confirmation-info-preservation.md)（v5 モード検証の関連知見）。
