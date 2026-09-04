---
id: intake-20260904-checker-esm-compat-candidate-2573
title: repo-agentdev-integrity checker 群の ESM 互換化（安定実行経路の import 標準を checker 全体へ適用するか否かの取り込み判断候補）
created: 2026-09-04
status: inbox
---

## 概要
- PR: #2586（Issue #2573・ru-batch-20260903 Batch 2・OU-023 stdout 証跡 checker の安定実行経路反映）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

安定実行経路（モジュール import 経由・`node --experimental-strip-types`）の標準化に対し、repo-agentdev-integrity の checker 群の多くが CommonJS 形式 API を含み ESM 経路では ReferenceError で実行不能であることを実証過程で確認した。`check_distribution_boundary.ts` / `check_extensions.ts` は `require.main === module`、`check_changed_docs.ts` / `check_knowledge_docs.ts` は `require` 使用。`check_content_corruption.ts`（`import.meta.main` 判定・require 不使用）のみ import 経路で実行可能。現行は CLI 実行時の stdout flush 保証例外経路で運用継続しており、PR 本文で「ESM 互換化の要否を後続の取り込み判断に委ねる」とされていたため、取り込み判断候補として intake 化する。

## 変更候補

- checker 群の ESM 互換化（`import.meta.main` 判定への統一、`node:module` createRequire 等の適用判断）を checker 実装変更として実施するか否かの判断
- 安定実行経路（checker-execution-contracts.md「安定実行経路」節）へ checker 実装側の互換性要件を追記するか否かの判断

## 関連
- #2573 対応記録コメント（case-close・2026-09-04）
- PR #2586（merge commit 3f878ae1）
- learning inbox「stdout 証跡 checker 群の多くは CommonJS 形式 API を含み、安定実行経路（ESM import 経由）では ReferenceError で実行不能」エントリ
- `docs/designs/integrity/checker-execution-contracts.md`「安定実行経路」節
