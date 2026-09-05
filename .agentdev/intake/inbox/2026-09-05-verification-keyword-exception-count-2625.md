---
id: intake-20260905-verification-keyword-exception-count-2625
title: Issue #2625 補足情報の検証語除外一覧「除外 7ファイル」表記と列挙実体8件の乖離の補正候補
created: 2026-09-05
status: inbox
---

## 概要
- PR: #2629（Issue #2625・Epic #2624 Wave 1・OU-001 撤回インベントリ Report の正規化・保存）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

Issue #2625 補足情報の検証語除外一覧は「MERGE 統合先等の無関係文脈 7ファイルは除外」と表記されているが、列挙実体は 5件の個別ファイル（retired/REQ-028.md:38、decision-lifecycle.md:101、document-model.md:608、agentdev-adversarial-review.md:168、adversarial-review-protocol.md:200）+ docs/reports/integrity/audits/ 3件の計 8件である（case-run 側で grep 再検証済み）。正規化済み Report（docs/reports/experiment-case-withdrawal-inventory.md §6.2）は列挙実体を正として記録済みであり、Report が OU-002〜004 の検証の正となるため実行上の支障はない。Issue 本文側の表記補正の要否が残る。

## 変更候補

- Issue #2625 本文（補足情報の検証語定義箇所）の「除外 7ファイル」表記を列挙実体（5件 + audits 3件）に合わせる補正の要否判定（intake-promote で判断）。#2625 はクローズ済みのため、補正する場合は case-update または後続 Issue への反映となる
- OU-002 以降の検証実行時は Report §6.2 の列挙実体 8件を正として使用することを確認

## 関連
- #2625 対応記録コメント（case-close・2026-09-05）
- PR #2629（merge commit 54c4befe）
- docs/reports/experiment-case-withdrawal-inventory.md §6.2
- learning inbox「req-define 時点の行番号実測に漏れがある場合、Report 側の実測修正を正として後続 OU は修正済み行番号を使用する」エントリ
