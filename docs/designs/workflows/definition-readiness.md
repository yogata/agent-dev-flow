---
title: Definition Readiness Design
status: draft
created: 2026-09-14
updated: "2026-09-14"
---

# Definition Readiness Design

## 目的

Definition Package、Draft Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キー、backend 意味論の物理写像を定義する（REQ-030、REQ-061、REQ-062）。

## Definition Package

- 構成: 要件行（REQ 変更後本文）、Decision、Design、Issue 構成案（operation_units、case_open_hints 由来）、受入条件一式を Case 単位で集約したパッケージ
- 生成: case-open が req_draft から生成し Root Case に関連付ける
- 索引・補助メタデータの具体形式は本 Design の管理下（draft の対象外）

## Definition PR lifecycle

- Draft Definition PR: canonical Definition に実変更がある場合のみ case-open が Case 単位で 1 件作成する。実変更のない Case（bugfix / maintenance / docs_chore 等、REQ-005-007 系）では作成しない
- Definition Amendment PR: case-revise が再合議済みの実変更がある場合のみ作成する
- 確定: case-ready が忠実性・整合性・品質検査を確認し、新しい意味判断が不要な場合追加承認なしで merge する
- merge 後: merge を巻き戻さず、canonical Definition を基準に再開する

## canonical Definition の判定

- canonical: merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態
- 実変更判定: canonical との差分が空の場合は Definition PR / Amendment PR を作成しない

## 冪等キー

- Root Case、Definition PR、Amendment PR、Child Issue、Wave / 依存関係、Decision 受理記録の重複生成検出に使う内部検索キー（識別子、関連付け、時点情報の組）は本 Design の管理下とする

## backend 意味論の物理写像

- GitHub backend: Draft Definition PR / Definition Amendment PR を使用する
- local backend: Definition の「未確定 → 確定」を同等に表現する PR 相当状態（ローカルIssue のマージ結果セクション等への写像）、ファイル配置、内部写像は本 Design と local-case-file Design が所有する。上位 command / workflow は物理表現を直接判別しない
