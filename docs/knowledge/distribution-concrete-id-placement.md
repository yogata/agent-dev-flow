---
title: 配布物への concrete ID 記載は ADF-COVERS 宣言コメント位置に限る
created: 2026-09-13
updated: 2026-09-13
---

# 配布物への concrete ID 記載は ADF-COVERS 宣言コメント位置に限る

## 知識内容

配布 skill（SKILL.md・references）の本文 prose へ REQ/Decision の具体 ID（例: `REQ-038-006` 形式）を記載すると、配布依存境界 gate の concrete-id 違反として failure が検出される。consumer 環境で ID が解決不能になるための設計制約である。取り扱いは次のとおりである。

1. 配布物への REQ/DEC 参照は ADF-COVERS 対応宣言コメント（`<!-- ADF-COVERS(implementation): REQ-NNN-NNN -->` 等）の正規位置に限って記載する。
2. 本文では概念名参照を使い、具体 ID は宣言コメント位置へ集約する。
3. 本文に具体番号を書ける ID ファミリーは STEP/QG に限定される。REQ/DEC/Design の具体番号は本文に書けない（ID ファミリー制限の詳細は配布依存境界 Design の正規規定に従う）。
4. traceability 対応宣言（missing-implementation 解消）と concrete-id 違反回避の両立様式は、既存前例（harness-delegation.md の宣言コメント様式）を参照する。

ADF-COVERS 宣言の形式（role・参照形式）は traceability の正規契約が所有する。本知識は記載位置の整理に留まる。

## 適用条件

- 配布 skill（SKILL.md・references）の作成・更新時に REQ/Decision を参照する場合。
- traceability 対応宣言を付与する場合。

## 適用対象

- `src/opencode/skills/` 配下の配布物全般。
- docs/ 配下の正規成果物（REQ/Decision/Design 本体）、非配布ファイルは対象外（concrete-id 検査の適用外）。

## 根拠

- case 2789: analysis-and-review.md の STEP-1 Purpose へ REQ-038-006 を prose 記載した結果 gate failure となり、宣言コメント付与で解消（inbox 2026-09-13）。
- deferred 2026-07-22: DERIVE 宣言に内部 ID を含めると IR-055 strict violation。
- deferred 2026-08-15: STEP 表で具体番号を書ける ID ファミリーは STEP/QG に限定。
- 発生4件相当の集約知識化。

## 関連知識

- [baseline-known 違反の一般化置換は検出器パターンと突合してから行う](baseline-substitution-vocabulary-crosscheck.md)（同一検査体系の baseline-known 解消運用）。
