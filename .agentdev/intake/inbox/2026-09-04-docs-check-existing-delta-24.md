---
id: intake-20260904-docs-check-existing-delta-24
title: docs-check 既存 delta 24 件の分類・処分候補（OU-001 検証時に検出・対象範囲外として記録）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2575（Issue #2554 / 親 Epic #2553・ru-batch-20260903 Epic 1 Wave 1・OU-001 検証）
- PR: #2577（Issue #2555 / 親 Epic #2553・同 Epic Wave 2・OU-002 実装。同一 IR-055 delta 16 件の再確認と補足）
- 検出工程: case-run Round A（OU-001 TS-001 検証、実行日 2026-09-04）
## 内容
docs-check（check_integrity.ts、profile source）全体の exit code 1 の原因となる new unmanaged NG 24 件を検出した。DEC-023 注記現行化とは無関係の既存 delta であり、OU-001 の対象範囲外のため修正せず記録のみ（PR 本文 Findings セクションからの capture 回収）:
- runtime-unresolved-reference 16 件（REQ-017 / REQ-004 等の 3 桁 ID 参照、IR-055 delta。src/opencode 配下 command/skill/template）
- expanded-readme-sync 1 件（third-party-sync が system.md 入口表に未登録）
- broken-req-ref 1 件（REQ-0108 参照、REQ ファイル不在。content-corruption-checker.md）
- index-generation-consistency 1 件（req-health-metrics.md AUTOGEN 不整合、generate_indexes 再生成要）
- draft-spec-staleness 2 件、unresolved-placeholder 3 件（WARNING）
親 Epic の後続 Wave / backlog-review 経由での分類・処分候補。

## 補足（2026-09-04・PR #2577 からの capture 回収）

PR #2577（OU-002 検証）が同一の IR-055 delta 16 件を再確認した（worktree と main HEAD の両方で 16 件・pre-existing 確定）。重複 item 化を避け本 item に補足する:

- 根本原因候補: 本バッチ前工程（req-save 81fb807f / 13bb90a9・design-save 1ed5e79a / e0a8f496）で配布物へ追加された REQ-017-017 等の参照行が IR-055 baseline に未登録
- 処分候補: baseline 更新（check_integrity.ts の `--update-ir055-baseline`）または参照の厳格化
- 回帰テスト: bun test check_integrity の「配布物に新規（delta from baseline）runtime-unresolved-reference 違反がないこと」（Issue #1782）