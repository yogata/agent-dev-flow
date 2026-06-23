# src/opencode-local/README.md の ADR-0126 時代記述残留

## 発生源

- Epic: #1093 (Wave 3)
- Issue: #1096 (REQ-0134 APPEND)
- PR: #1100 (merged, squash 27a28730)
- 発生日: 2026-06-23
- 処理: case-close Step 10 Capture 回収（PR 本文 Findings / Capture候補 intake セクション F-001）

## 内容

`src/opencode-local/README.md` は ADR-0126（superseded）時代の直接生成前提の記述が残っている。主な残留箇所:

- L3: 非正規文書注記が ADR-0126 を根拠にしている（ADR-0131 への更新なし）
- L7: 「ローカル版 OpenCode 生成のための…直接生成するため」と直接生成前提
- L95-L101: 「更新運用（全削除して作り直し）」（REQ-0141-033 由来）
- L109-L116: 「安全性制約」が全て ADR-0126 由来（generated_by 識別子、ジャンクション検出安全ゲート）
- L134: 関連項目が ADR-0126 のみ（ADR-0131 への参照なし）

ADR-0131 により導入方式は link mode へ統一されたが、README の説明文は ADR-0126 時代のまま更新されていない。

## 推奨対応先

- Wave 4 #1097（REQ-0141 link mode 前提への再構成 + local SPEC 改訂）の対象領域
- 同 Wave で `src/opencode-local/README.md` を ADR-0131 link mode 前提へ全面改訂すべき

## 現在の追跡状態

- intake inbox に保存（2026-06-23 Epic #1093 Wave 3 close より）
- intake-promote 判断待ち（Wave 4 #1097 への事前紐付け候補）
