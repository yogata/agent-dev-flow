---
title: ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）
status: draft
created: 2026-09-18
updated: 2026-09-18
---
<!-- ADF-COVERS(design): REQ-088-001, REQ-088-002, REQ-088-003, REQ-088-004, REQ-088-005, REQ-088-006, REQ-088-007 -->

# ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 目的と適用範囲

v4 の目的（要件に基づく AI・人間の継続的ソフトウェア開発のための標準 Operating Model と実行基盤。汎用ワークフローエンジンでない）、適用範囲、標準語彙（REQ、Decision、Design、work_type、scale、Epic、Wave、Case、Intake、Learning、Backlog、Quality/Verification/Evidence、Traceability、Project Extensions）とプロセス/実装分離原則。

## 三層責務モデル

ADF Runtime / ADF Standard Operating Model / Project Model の各層の責務定義、層間契約、現行 Command/Skill/docs/checker/sidecar の三層への再分類方針（完全な再分類一覧は v3-v4-crosswalk Design が所有）。

- ADF Runtime: durable state、resume/recovery、authority/side-effect control、idempotency/concurrency、deterministic execution、adapter execution
- ADF Standard Operating Model: requirements-driven lifecycle、REQ/Decision/Design の意味、work_type/scale/Epic/Wave、Case lifecycle、Quality/Verification/Evidence/Gate、Intake/Learning/Backlog loop、標準的な人間・AI 協業境界、bootstrap/migration/self-hosting の標準境界
- Project Model: 当該 Project の REQ、accepted Decision、accepted/current Design、architecture/project policy/quality policy、Knowledge、Backlog/current initiatives、Project-specific extension/configuration、current operating state

現行 Command/Skill/docs をそのまま三層へ割り当てるのではなく、各成果物がどの責務を実現する手段かを再分類する（再分類の完全な一覧は v3-v4-crosswalk Design が所有）。

## Project Contract の論理ビュー

Project Contract は、新しい単一巨大文書ではなく、AI が新しい session から Project の現在契約を再構成するための論理的情報集合である。

- 再構成要素: purpose/goals/non-goals、REQ、accepted Decision、accepted/current Design、architecture invariants、project policy、quality/evidence policy、reusable Knowledge、current development direction、active work（10 項目）
- 各要素について canonical owner、更新契機、寿命を定義する
- AI による再構成手順: 新規 session は上記要素の canonical owner から現在契約を再構成し、単一巨大文書に依存しない

## 情報寿命モデル

8 寿命（ADF lifetime、Project lifetime、Architecture lifetime、Requirement lifetime、Change/Case lifetime、Runtime lifetime、reusable Knowledge、未評価 Observation）の定義、各寿命の artifact 種別と canonical owner と昇格条件、Learning/Observation の無条件 REQ 昇格禁止の昇格ガード。

- ルール・情報の寿命を少なくとも 8 種で区別し、各寿命について適切な artifact 種別、canonical owner、昇格条件を定義する
- Learning/Observation が無条件に REQ へ昇格しない構造を作る

## 中核文書モデル

REQ / Decision / Design / Implementation / Evidence の意味境界（What/Why/How/実体/根拠）、更新条件、Decision の現行状態反映と履歴保持の両立方式。

- REQ: 何が成立しなければならないか。外部契約、期待状態、安定した制約を所有（What）
- Decision: なぜその選択をしたか。将来の agent が repository の現状だけから再発見できない判断理由、制約、トレードオフを所有（Why）
- Design: REQ と Decision をどの構造・状態・責務・実現方式で成立させるかを所有（How）
- Implementation: Design を実体化するコード・設定・成果物（実体）
- Evidence: REQ/acceptance が成立したと確認する根拠（根拠）
- Decision の結果を REQ/Design の現行状態へ反映することと、Decision 自体を履歴的根拠として保持することを両立させる
