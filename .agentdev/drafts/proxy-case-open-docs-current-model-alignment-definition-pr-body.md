## 概要

docs 現行モデル整合と圧縮基盤（topic_slug: docs-current-model-alignment-and-compression-foundation、source_rus: RU-20261001-01）の Definition 変更である。REQ-096 / DEC-048 の判断アーキテクチャと REQ-001 の文書種別責務を canonical Definition へ意味的に行き渡らせる。新規 REQ・新規 Decision・accepted Decision 本文の変更は行わない。合意済み本文の正は draft-data artifact_actions content である。

- 要件行 3件の意味更新: REQ-034-032（REQ-096 確定権限3分類ベースの自律解決境界）、REQ-061-003（人間留保判断・既存安全境界の操作承認ベースの HITL 条件）、REQ-032-025 と適用範囲（見送り記録保存先を対応記録コメントへ限定、Design 本体保存を除去）
- Design 7件の現行化: case-auto.md（語彙写像横断適用・bounded parent decision resolution・停止理由分類の REQ-096-012 対応）、case-ready.md（判断境界の REQ-061-003 更新後本文と同一意味への更新、ADF-COVERS(design): REQ-061-003 宣言追記）、system.md（コマンド概要要約の現行化）、agentdev-design-file-manager.md（accepted 昇格の対応記録要求廃止・昇格は状態更新のみ）、case-close.md（見送り記録保存先の対応記録コメント限定・冪等認定参照先同期）、v3-v4-crosswalk.md（現行処遇記録契約の現在形保持・本体再編段階記録の履歴委ね）、v4-migration-and-release.md（現行移行・release 契約の現在形保持・Sequence 等履歴の除去）
- 参照追随: docs/designs/README.md の crosswalk・migration 行から後続 v4 Implementation Sequence 参照を除去（AG-004 の (b) 参照付け替え）

## 実行識別情報

- adf_case: ADF_CASE_PLACEHOLDER（Root Case 起票後に確定）
- adf_execution_unit: N/A（実行構成未確定。case-ready が確定する）

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | 新規 | 修正済み | 既出 | 撤回 | 無効 |
|---|---|---|---|---|---|---|---|
| case-open | traceability check（行限定 REQ-034-032,REQ-061-003,REQ-032-025） | pass 9 / fail 0（missing-design 0件ゲート達成。本ブランチで REQ-061-003 宣言追記により解消） | 0 | 1（REQ-061-003 missing-design） | 0 | 0 | 0 |
| case-open | traceability check（全体スコープ） | missing-design 765 / missing-implementation 108 / missing-verification 34。main（8c471d3e）比 missing-design −1（REQ-061-003 解消）で新規 fail なし。765/108/34 は main 既存債務 | 0 | 1（REQ-061-003） | 906（main 既存債務） | 0 | 0 |
| case-open | coverage --req REQ-061-003 | design 対応 1件（docs/designs/commands/case-ready.md）実測帰着 | 0 | 1 | 0 | 0 | 0 |
| case-open | check_integrity（definition/issue-pending @ 92edf6ae） | 新規 unmanaged NG 4件は全て main 既存債務（REQ-003-055 phantom citation ×3: v4-responsibility-boundaries.md:44/67、REQ-003.md:56。gh-direct-invocation warning ×1: worktree-operations.md:276）。自 Case 変更起因 0件。baseline 不変更 | 0 | 0 | 4（main 既存債務） | 0 | 0 |
| case-open | check_autogen_freshness | 検出鮮度違反 0件（再生成不要） | 0 | 0 | 0 | 0 | 0 |
| case-open | generate_indexes.ts | no changes（REQ 行の本文意味更新のみで索引対象に差分なし。派生物の同一 PR 含入なし） | 0 | 0 | 0 | 0 | 0 |
| case-open | 文字列検証 | 旧語彙（一意に回答・一意確定・新しい意味判断）が語彙写像対象4ファイルで 0件。旧本文の出現 0件・新本文の出現確認 8件。Stage 参照（後続 v4 Implementation Sequence・第13段/16段/17段）が移行2文書から 0件。UTF-8 BOM なし 11ファイル確認 | 0 | 0 | 0 | 0 | 0 |

## 完了条件

- [ ] case-ready が Definition PR 受入検査（忠実性・整合性・品質・overlap 突合・isDraft false）を pass し merge する
- [ ] merge 後の canonical Definition で REQ-034-032 / REQ-061-003 / REQ-032-025 が更新後本文であること

## 備考

- 本 PR は gh exit 66 起動環境障害の blocked 判定後に永続化された payload から resume 実行される（definition/issue-pending @ 92edf6ae を definition/issue-{N} へ改名後 push）
- 横断依存検査（inspect_cross_dependencies.ts、population 2）: 条件(a) 0件、条件(b) traceability-policy・sidecar の2領域で需要検出（当Case REQ-061-003/REQ-032-025/REQ-034-032 は既存行の意味更新のみで policy/sidecar 追随不要判断済み、#3289 REQ-097-001..004。行集合は分離、gate_effect: none）
