# intake: 配布物機械検査の既存 finding 群の段階解消候補（Epic #2752 W1 集約観察）

- **発生源**: PR #2759（Issue #2754 / Epic #2752 W1）の Findings/intake 記録を回収
- **capture 元**: case-close Epic Wave 1 境界（Epic #2752、case-close）
- **captured_at**: 2026-09-10

## 内容

配布物機械検査で継続検出されている既存 finding 3 種。いずれも base（209bad13）既出で、Epic #2752 ケースのマージ後も増分なし。後続 backlog・inspect 経路での処置候補として集約する。

| # | 対象 | 検出 check | 概要 |
|---|---|---|---|
| 1 | 既存配布物 10 ファイル | 配布依存境界 concrete-id / IR-055 | 配布物本文に残存する本体内部 ID（REQ-NNN-NNN、IR-NNN）・docs/designs/ パス表記。ID 参照の正規置き場は docs 配下の正規成果物側であり、配布物は概念語で記述する運用が望ましい（PR 2759 では本変更分を実践済み） |
| 2 | docs/designs/skills/agentdev-doc-diagnostics.md:104、docs/designs/commands/case-close.md:243 | traceability 宣言パーサ | 本文中の括弧付き宣言表記が不完全宣言（malformed-declaration）として検出（base 由来 pre-existing）。概要説明では括弧なし表記で回避可能（配布物側では PR 2759/2760 で実践済み） |
| 3 | lint_skills description 集約 | lint_skills | description 集約予算警告（total 17506 > 350×50、base 時点から存在する傾向管理 warning）。description を持つ新規/変更 skill 追加時に計画的な縮約が望ましい |

## 補足

- 処置の要否・優先度は intake-promote の review で判定すること。#1 は段階的な概念語化、#2 は括弧なし表記への置換、#3 は description 縮約の方針決定が候補
- 本 Epic の blocker（diagnostic-categories.md:139 の `.agentdev/issues` 参照、子Issue #2754）は Issue コメントで追跡中のため本 item の対象外
