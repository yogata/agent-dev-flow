---
id: intake-20260905-distribution-boundary-baseline-refresh-candidate-2599
title: 配布依存境界ベースライン（222cd93d 時点）と現行実行結果の差異解消とベースライン再取得の候補
created: 2026-09-05
status: inbox
---

## 概要
- PR: #2612（Issue #2599・Epic #2596 Wave 2・OU-002 REQ-048 同期義務）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

配布依存境界ベースライン（main repo @ 222cd93d 事前取得、concrete-id 16件 pre-existing）と現行 main repo working tree の実行結果（source / link 両 profile で違反0件・EXIT=0）に差異がある。本変更（PR #2612）は docs のみで配布物に触れないため本変更起因の新規違反はないが、ベースライン16件は 222cd93d 以降の別 Case で解消済みの可能性がある。

## 変更候補

- OU-003（Issue #2600、RED #2569 解消・issue_desc_epic/child 3件解消）後に配布依存境界ベースラインを再取得する
- ベースライン再取得手順（対象 commit、profile、エントリ集合の記録先）を明示する

## 関連
- PR #2612（merge commit b50a3098）
- Issue #2599 対応記録コメント（case-close・2026-09-05）
- Epic #2596（OU-003 / #2600 でのベースライン再取得を推奨）
