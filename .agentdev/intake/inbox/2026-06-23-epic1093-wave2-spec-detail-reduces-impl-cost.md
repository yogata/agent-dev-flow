# SPEC 詳細規定による case-run 実装コスト低下（再利用可能知見）

## 発生源

- Epic: #1093 (Wave 2)
- Issue: #1095 (REQ-0150)
- PR: #1099 (merged, squash b2fc0491)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション）

## 内容

Wave 1 で改訂された SPEC 群（特に `local-generation.md`）が「ローカル版 agentdev-gh-cli のディレクトリツリー」まで詳細に規定していた。実装者は SPEC をトレースするだけで済んだ。SPEC の事前確定は case-run 実装コストを下げる。

## 推奨対応先

- backlog-review で「SPEC 詳細度と実装コストの相関ガイドライン」を RU 候補として評価
- 適用範囲: spec-save 時の SPEC 記述粒度の指針。ディレクトリツリー・手続き一覧・ファイル命名規則まで SPEC に含めるかの判断基準
- 類例: 本 Epic #1093 Wave 1 SPEC 群、Epic #1028 SPEC 群

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 2 close より）
- intake-promote 判断待ち
