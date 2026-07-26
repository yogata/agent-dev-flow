# Intake Item: REQ-006 目的節へ REQ-011 相互参照缺失

## 発生源

- PR: #1827 (Issue #1822 / OU-001, Epic #1821 Wave 1)
- 発生 phase: case-run acceptance criteria 検証（TS-005: AG-006 REQ-006 の関連 REQ 維持）
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

REQ-011-017（external execution boundary 正規所有）、REQ-011-018（harness execution mechanism の ADF 規範所有対象外）の新設により、REQ-006（case 実行オーケストレーション）と REQ-011（I/O 境界と外部連携手段）の関係が SPEC `docs/specs/responsibilities/responsibility-boundary-purification.md` L66 の 4 用語セクションで確立された。しかし `docs/requirements/REQ-006.md` の目的節（L12-15）と対象外節（L136-144）に REQ-011 への言及がない。

TS-005（REQ-006 の関連 REQ 維持）は RU-0025 UPDATE で既存関連（REQ-002/003/005/007/008）が削除されていないことをもって PASS とした。REQ-011 は元来 REQ-006 に相互参照がなく、UPDATE でも削除されていないため保存解釈で合格。ただし SPEC 上で 4 用語が両 REQ にまたがって定義されたため、相互参照を追記することが望ましい。

## 推奨修正対象

`docs/requirements/REQ-006.md` 目的節（L12-15 付近）または対象外節（L136-144 付近）。

- 修正候補: external execution boundary（REQ-011-017）と harness execution mechanism（REQ-011-018）の正規所有者が REQ-011 である旨を、REQ-006 目的節または対象外節へ相互参照として付与

## 推奨対応

別 req-define / req-save で REQ-006 目的節（または対象外節）へ REQ-011 参照を追記する UPDATE を起票する。RU-0025 由来の新規関係を REQ 間で明示するための整理。req-save scope であり case-run scope では編集できないため、本 intake 経由で次工程へ委ねる。

## 関連

- references: docs/requirements/REQ-006.md (L12-15 目的節, L136-144 対象外節)
- SPEC 起点: docs/specs/responsibilities/responsibility-boundary-purification.md (L66, L72-74 4 用語セクション)
- Issue: #1822 (CLOSED/COMPLETED), Epic: #1821 (CLOSED/COMPLETED)
- PR: #1827 (Findings / Capture候補 セクション「REQ-006 へ REQ-011 相互参照缺失」)
- test strategy: TS-005 (保存解釈で PASS)
