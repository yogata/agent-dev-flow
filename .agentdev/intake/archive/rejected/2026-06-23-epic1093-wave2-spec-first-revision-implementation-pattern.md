# SPEC 先行改訂→実装 Wave の分割パターン（再利用可能知見）

## 発生源

- Epic: #1093 (Wave 2)
- Issue: #1095 (REQ-0150)
- PR: #1099 (merged, squash b2fc0491)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション）

## 内容

Wave 1 (#1094/PR #1098) で SPEC 群（local-case-file, local-generation, local-transform, agentdev-gh-cli）が「case-schema 吸収後の新パス」で事前改訂されていた。そのため Wave 2 は「SPEC に書かれた構造を実在化する」作業に凝縮された。SPEC 先行改訂→実装 Wave という分割パターンは、複数 Wave にまたがる大規模リファクタで有効だった。

## 推奨対応先

- backlog-review で「SPEC 先行改訂パターンのガイドライン化」を RU 候補として評価
- 適用範囲: 複数 Wave 構成の Epic で、アーキテクチャ判断（ADR）と SPEC 改訂を先頭 Wave に集約する計画手法
- 類似パターンの適用可能性: docs 体系変更を伴うリファクタ Epic 全般

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 2 close より）
- intake-promote 判断待ち
