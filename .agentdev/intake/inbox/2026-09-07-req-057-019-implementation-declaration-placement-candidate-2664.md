---
id: intake-20260907-req-057-019-implementation-declaration-placement-candidate-2664
title: REQ-057-019 配布物是正の implementation 対応宣言の正規配置先判断（docs 正規成果物様式の検討）
created: 2026-09-07
status: inbox
---

## 概要
- PR: #2677（Issue #2664・Epic #2653 Wave 1・OU-0002 配布物 concrete REQ 行 ID 是正 10箇所）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

配布物本文中の concrete REQ 行 ID inline 記載排除（REQ-057-019）について、当該是正の implementation 対応宣言（ADF-COVERS）が docs 配下の正規成果物に未配置である。配布物側は対応宣言を置けないため、配置先（例: distribution-boundary.md への REQ-002-027 様式準拠）の可否判断が必要である。宣言欠落行は repo 全体で多数存在する既存状態（漸進モデル）の一部であり、REQ-008-060 等も同状態である。traceability check は REQ-057-019 を verification-present として完了阻害なしと判定済み（implementation 宣言は agentdev-skill-authoring Design に既存存在）。

## 変更候補

- implementation 対応宣言の配置先となる正規成果物（例: docs/designs/integrity/distribution-boundary.md）と宣言様式（REQ-002-027 準拠）を確定する
- 宣言欠落行が多数存在する既存状態の扱い（漸進モデルの維持 or 一括是正）を backlog 側で判断する

## 関連
- Issue #2664（クローズ済み。OU-0002）
- PR #2677（squash merge commit 622cb977）
- docs/designs/skills/agentdev-skill-authoring.md（REQ-057-019 の implementation 宣言既存配置先）
- docs/designs/skills/agentdev-doc-writing.md（REQ-057-019 の verification 宣言既存配置先）
