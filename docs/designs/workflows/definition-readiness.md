---
title: Definition Readiness Design
status: accepted
created: 2026-09-14
updated: "2026-09-17"
---

# Definition Readiness Design

## 目的

Definition Package、Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キー、backend 意味論の物理写像を定義する（REQ-030、REQ-061、REQ-062、REQ-083）。

本 Design は ADF-COVERS 宣言を持たないため、REQ 対応の確定は PR 記録にもとづく REQ ファイル単位の近似判定（PR #2817 が REQ-061/REQ-005 対応を記録、Case #2806 closed）に基づく。2026-09-15 に REQ-032-025 の評価契約に従う棚卸し評価の結果、status を draft から accepted へ昇格した（RU-0015、Case #2848）。

## Definition Package

- 構成: 要件行（REQ 変更後本文）、Decision、Design、Issue 構成案（operation_units、case_open_hints 由来）、受入条件一式を Case 単位で集約したパッケージ
- 生成: case-open が req_draft から生成し Root Case に関連付ける
- 索引・補助メタデータの具体形式は本 Design の管理下（draft の対象外）

## Definition PR lifecycle

- Definition PR: canonical Definition に実変更がある場合のみ case-open が Case 単位で 1 件作成する。実変更のない Case（bugfix / maintenance / docs_chore 等、REQ-005-007 系）では作成しない
- Definition Amendment PR: case-revise が再合議済みの実変更がある場合のみ作成する
- 作成形態: Definition PR / Definition Amendment PR は GitHub Draft PR ではなく通常 Pull Request として作成する。ADF の正規 lifecycle は GitHub Draft PR を状態として使用せず、GitHub Draft PR を生成する入力は agentdev_gh の公開契約に存在しない（REQ-083-001、REQ-083-004、REQ-011-031）
- ブランチ命名: Definition PR は definition/issue-{N}、Definition Amendment PR は definition-amend/issue-{N} を使用し、実装系 feature/issue-{N} と名前空間を区別する（REQ-083-002）
- Draft 状態の検出: case-ready は merge 実行前に pr_read の isDraft で Draft 状態を確認する。isDraft: true の Definition PR / Definition Amendment PR は外部変更・既存成果物・旧版由来を含む正規 lifecycle 外の異常状態として pr_merge を実行せず blocked で停止する。draft 解除の自動実行、raw gh WRITE による復旧は行わない（REQ-061-032、REQ-083-001）
- 確定: case-ready が忠実性・整合性・品質検査を確認し、新しい意味判断が不要な場合追加承認なしで merge する
- merge 後: merge を巻き戻さず、canonical Definition を基準に再開する

## canonical Definition の判定

- canonical: merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態
- 実変更判定: canonical との差分が空の場合は Definition PR / Amendment PR を作成しない

## 冪等キー

- Root Case、Definition PR、Amendment PR、Child Issue、Wave / 依存関係、Decision 受理記録の重複生成検出に使う内部検索キー（識別子、関連付け、時点情報の組）は本 Design の管理下とする

## backend 意味論の物理写像

- GitHub backend: Definition PR / Definition Amendment PR を通常 Pull Request として使用する。Pull Request の実際の Draft 状態は pr_read の isDraft に写像する（REQ-011-032）
- local backend: Definition の「未確定 → 確定」を同等に表現する PR 相当状態（ローカルIssue のマージ結果セクション等への写像）、ファイル配置、内部写像は本 Design と local-case-file Design が所有する。GitHub Draft PR に相当する状態を持たないため pr_read の isDraft は false を返す。上位 command / workflow は物理表現を直接判別しない
