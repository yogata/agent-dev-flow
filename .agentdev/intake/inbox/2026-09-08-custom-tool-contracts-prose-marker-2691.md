---
id: intake-20260908-custom-tool-contracts-prose-marker-2691
title: custom-tool-contracts.md 91行目の散文中 ADF-COVERS マーカーが malformed-declaration として検出される
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2691（Issue #2687・Epic #2686 Wave 1・OU-001 GitHub 版操作契約実装）
- 発見経路: case-run トレーサビリティ check → case-close トレーサビリティ独立再検査（main af697092 上で再現確認）→ Capture 回収（PR 本文「Findings/ Capture候補」セクション由来）

## 内容

docs/designs/responsibilities/custom-tool-contracts.md 91行目（移管記録節）の散文が ADF-COVERS(implementation) マーカーを文中に含み、agentdev-traceability check の malformed-declarations（「ADF-COVERS マーカーが既知ロールとともにあるが、宣言形式（コロンと REQ-{NNNN}-{MMM} の ID リスト）を満たさない」）として検出される。配布物でない docs であり workflow 上の実害は限定的だが、マーカー文字列の文中使用は検査妨害になる。case-close 検証差分では fail-open 運用下で既知 finding（既出）として扱い、本 Case（#2687）では docs 編集禁止のため対象外として記録。

## 変更候補
- 91行目の散文中マーカー文字列を宣言形式と区別される表現へ言い換える（backticks 外の宣言形式文字列の回避）

## 関連
- Issue #2687（クローズ済み。OU-001）
- PR #2691（squash merge commit af697092）
- docs/designs/responsibilities/custom-tool-contracts.md 91行目
