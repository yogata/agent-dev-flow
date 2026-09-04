---
id: intake-20260904-checker-stdout-encoding-doc-candidate-2561
title: checker stdout の cp932 パイプ再解釈による JSON パース破綻の恒久文書化（checker-cli-stdout-loss 知識文書への近縁現象追記候補）
created: 2026-09-04
status: inbox
---

## 概要
- PR: #2582（Issue #2561・ru-batch-20260903 Epic 1・OU-006 検査定義 yaml の checker 読込統合）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

Windows + bun 環境で checker の stdout を PowerShell パイプ（`| node -` 経由の JSON パース）へ渡すと、cp932 解釈による制御文字混入で JSON パースが失敗するケースを確認した。既存知識 `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md`（stdout ロス現象）と近縁だが現象は別（エンコーディング変換）。検証では spawnSync(encoding: utf8) 経由で回避した。PR 本文では「恒久文書化の要否は case-close 判断」とされていたため、知識文書追記候補として intake 化する。

## 変更候補

- `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md` に「stdout ロス」と「cp932 再解釈による制御文字混入」の区別と、spawnSync(encoding: utf8)・chcp 65001 による回避策を追記する
- 必要に応じて checker 出力を機械比較する検証手順（QG・docs-check 系）への注意書きを guides へ追加する

## 関連
- #2561 対応記録コメント（case-close・2026-09-04）
- PR #2582（merge commit 468b6687）
- learning inbox「Windows の bun checker stdout を PowerShell パイプへ渡すと cp932 再解釈で JSON パースが壊れる」エントリ
- `docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md`
