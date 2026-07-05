# learning ドメイン archive/active.md 参照残存の一括是正

## 観測内容

PR #1402（Epic #1395 Wave 3, Issue #1398）のリネーム完了後（`archive/active.md` → `deferred.md`）、以下3ファイルに `archive/active.md` への参照が残留している。合計11箇所。

### 残留1: learning-pipeline/SKILL.md（5箇所）

`src/opencode/skills/agentdev-learning-pipeline/SKILL.md`:
- L27: アーティファクト lifecycle 表の `archive/active.md` 行
- L205: living pool 維持の記述
- L219: 廃棄カテゴリ10 deferred の記述
- L351: prune 対象特定の記述
- L373: prune 非対象の記述

SPEC 側（`docs/specs/skills/agentdev-learning-pipeline.md` L28）は `deferred.md` に更新済みのため、SPEC↔実装本文の不整合が発生している。

### 残留2: learning-capture/SKILL.md（2箇所）

`src/opencode/skills/agentdev-learning-capture/SKILL.md`:
- L69: 過去の学び参照として `archive/active.md`
- L71: 存在しない場合のファイル作成対象に `archive/active.md`

### 残留3: learning-capture/references/example.md（4箇所）

`src/opencode/skills/agentdev-learning-capture/references/example.md`:
- L160, L162, L163, L173

## 影響

- 学習ヘルパー skill 利用者が古いパス（`.agentdev/learning/archive/active.md`）を参照し、存在しないファイルへアクセスするリスク
- learning-pipeline では SPEC↔実装本文の不整合が発生
- learning-capture 層が `archive/active.md` を参照・作成しようとする記述が不正確（`archive/active.md` は廃止、`deferred.md` は learning-promote のみが管理、capture が作成対象とするのは inbox.md のみが正しい）

## 課題

- learning-pipeline/SKILL.md の5箇所を `deferred.md` に更新し、AG-005 多状態 living pool 記述を SPEC L28 と整合させる
- learning-capture/SKILL.md の2箇所を削除するか、`deferred.md` に置き換えるか、inbox.md のみに役割を限定する記述に修正するか
- learning-capture/references/example.md の4箇所を削除するか、`deferred.md` に置き換えるか
- 3ファイルを同一 PR で一括是正する

## 既存要件との関連

- PR #1402 Findings F-001（learning-pipeline）、F-002（learning-capture SKILL）、F-003（learning-capture example）
- Epic #1395 Wave 3 Issue #1398（OU-015 learning-pipeline SPEC、OU-011 learning-promote SPEC が対象、capture 層は明示対象外）
- AG-005 多状態 living pool（deferred.md）
