# proxy-case-close payload: Epic #3296 Wave 1 ステータス追跡テーブル更新（単一書き手・case-close 代行）

- 対象操作: Custom Tool `agentdev_gh` 相当の GitHub 書込み 1操作
  - ① `issue_update` #3296（body = 下記「① issue_update #3296 用 更新本文（verbatim）」への全体置換。変更点は Wave 1 の 3行のステータス pending → completed と ステータス追跡件数表の pending 8→5 / completed 0→3 のみ。他の節・行は現行本文どおり）
- 実行順序上の前提: 本 payload は OU-0001（#3297）・OU-0002（#3298）・OU-0003（#3299）の各 merge & close payload（proxy-case-close-docs-current-model-alignment-ou-000{1,2,3}-merge-and-close.md）の適用【後】に実行する（3 子 Issue の merged/closed が確定した後でテーブルを completed へ更新する。Epic 本文の単一書き手順守のため、Wave 1 の 3行をこの1回の body 置換でまとめて更新する）
- 単一書き手: Epic Issue 本文ステータス追跡テーブルの更新は case-close 単一書き手（POL-epic-tracking-single-writer）。本 payload は case-close DOWN 時の proxy 実行分であり、適用は1回のみ・冪等とする
- 冪等性: 適用前に現在の #3296 body を取得し、Wave 1 の 3行がすべて `pending` であることを確認する。3行とも既に `completed` で件数表も pending=5 / completed=3 の場合は本操作を skip する（適用済み）。一部のみ更新済みなど中間状態が検出された場合は、実際の PR #3305/#3306/#3307 の merged 状態と Issue #3297/#3298/#3299 の closed 状態に合わせて行単位で再合成してから置換する（merged かつ closed の子 Issue 行のみ completed とする）
- 現行本文の正: 適用時点で `agentdev_gh`（issue_read #3296）または raw gh 読取で取得した body。下記 verbatim 本文は 2026-10-01 時点の取得本文に Wave 1 完了分の編集を施したものである。適用時に現行本文と下記本文の差分が Wave 1 の 3行・件数表 2行 以外に存在する場合（他 Workflow による更新 등），現行本文を基準に同編集を再適用する

## ① issue_update #3296 用 更新本文（verbatim）

以下の markdown を #3296 の body として全体置換する（編集箇所: 分解テーブル Wave 1 の 3行 = `completed` 化、ステータス追跡件数表 = pending 5 / completed 3。Epic 完了条件チェックボックスは全 8 子 Issue 完了前のため更新しない）:

````markdown
## 概要
<!-- 【必須】 -->

Root Case #3293（docs-current-model-alignment-and-compression-foundation、work_type: maintenance / scale: large）の execution unit（Epic）である。8 OU（OU-0001〜OU-0008）の実現面変更 RA-001〜RA-006 を子 Issue として実行する。Definition 面（REQ-034-032・REQ-061-003・REQ-032-025 の意味更新、Design 7件 update、Design 管理インデックス追随）は Definition PR #3294 として merge 済みであり、本 Epic は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #3296（本 Epic Issue 自身の番号）
- adf_execution_unit: epic
- adf_harness_ref: N/A

## 課題
<!-- 【必須】 -->

判断アーキテクチャ（REQ-096 / DEC-048）と文書種別責務（REQ-001）の docs/** への意味統合は、REQ 行・正規 Design の Definition 面で完了済み（PR #3294 merge）。残存する実現面として、docs/designs/** 横断の現在形純化、移行文書の現在責務分離の実現面フォロー、入口文書の現在像統合、規範重複の限定的縮約、実行時投影（src/opencode/skills/**）と検証資産の最終同期が未実施であり、Root Case #3293 の完了条件（AC-01〜AC-15）の意味上の完了に到達していない。

## 提案内容
<!-- 【必須】 -->

8 OU を子 Issue として生成し、Wave 構成（Wave 1: OU-0001・OU-0002・OU-0003 並列 → Wave 2〜6: 直列）で実行する。全 OU 完了後の最終横断検証（TS-008 合格）を Epic 完了条件とする。

### 構成推論の根拠（3軸判断）

- 依存強度: 必須。全エッジが成立順序依存である（OU-0004 の純化は OU-0003 の Design 履歴再生成防止契約是正なしに実行すると履歴混入が再発する。OU-0006 は入口文書が REQ・Design 現行化後の現在像を反映する。OU-0007 は前段までの同一意味重複の確認後に縮約対象が確定する。OU-0008 は全文書変更後の最終同期である）。依存グラフは単一連結成分（根 3: OU-0001・OU-0002・OU-0003）
- Epic サイズ: 8 子 Issue（上限 10 以内）
- 機能的一貫性: 一貫。全 8 OU が「判断アーキテクチャと文書種別責務を docs/** 現行正規文書へ意味的に行き渡らせる」単一の意味変更連鎖（共通原則 → REQ → Design → 実行時投影 → 検証。RU §5.2 の完了単位）を共有する
- Wave 構成: Wave 1 内（OU-0001・OU-0002・OU-0003）は必須依存エッジ 0 件のため並列可。Wave 2〜6 は必須依存に従い直列（前 Wave 完了後に開始）
- Wave 重複前置検出: Wave 1 内で docs/designs/foundations/system.md を OU-0001 と OU-0002 が共有（OU-0001 = case-auto.md + system.md、OU-0002 = case-ready.md + system.md、OU-0003 = agentdev-design-file-manager.md + case-close.md）。system.md の主要編集（ACT-DESIGN-003）は Definition PR #3294 で単一実施済みであり、Wave 実行時に追加修正が生じる場合のみ衝突リスクがある。処置: 重複許容。衝突解消担当は後着 merge 側とし、case-auto orchestration の Wave 1 fan-in 順序に従う。衝突検出時は Level 1 rebase 手順（case-auto コンフリクト解消モデル）に従う。OU-0004 が docs/designs/commands/case-ready.md に触れ得る点（`## 対応記録` 見出し除去）は Wave 1（OU-0002）と異なる Wave であり同一 Wave 内重複ではない。OU-0006・OU-0007 は target_design を持たず、対象パスは RA-004・RA-006 の ownership_hints が所有する（REQ-061-019 の比較対象は検出不能として報告済み）

## REQ参照
<!-- 【必須】 -->

REQ-034、REQ-061、REQ-032（対象要件行: REQ-034-032・REQ-061-003・REQ-032-025。判断アーキテクチャの正は REQ-096 / DEC-048、文書種別責務の正は REQ-001）

## 分解
<!-- 【必須】 -->

<!-- 分解テーブル正規形（agentdev-epic-tracker 新4列形式と整合）: 「#」列は {wave}-{seq} 形式（例: 1-1）、Issue 列は #N のみ（OU ID 等の付記は内容列へ）、ステータス初期値は pending -->
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #3297 | completed | OU-0001: case-auto 実行時投影の判断境界現行化（AG-001・RA-002 case-auto 系） |
| 1-2 | #3298 | completed | OU-0002: case-ready 実行時投影の判断境界現行化（AG-001・RA-002 case-ready 系） |
| 1-3 | #3299 | completed | OU-0003: Design 保存契約現行化の実現面同期（AG-002・RA-001） |
| 2-1 | #3300 | pending | OU-0004: docs/designs/** 現在形純化スイープ（AG-003・RA-005） |
| 3-1 | #3301 | pending | OU-0005: 移行文書の現在責務分離の実現面フォロー（AG-004） |
| 4-1 | #3302 | pending | OU-0006: 入口文書の現在像統合（AG-005・RA-004） |
| 5-1 | #3303 | pending | OU-0007: 規範重複の限定的縮約（AG-006・RA-006 縮約） |
| 6-1 | #3304 | pending | OU-0008: 実装投影・検証の最終同期と最終横断検証（AG-007・RA-003） |

## 実行順序
<!-- 【必須】 -->

<!-- Wave テーブル正規形: Issue 列は #N のみ（OU ID 等の付記は前提列または分解テーブルの内容列へ） -->
| Wave | Issue | 実行方法 | 前提 |
|------|-------|----------|------|
| 1 | #3297 | 並列 | - |
| 1 | #3298 | 並列 | - |
| 1 | #3299 | 並列 | - |
| 2 | #3300 | 直列 | #3299 |
| 3 | #3301 | 直列 | #3300 |
| 4 | #3302 | 直列 | #3297, #3298, #3301 |
| 5 | #3303 | 直列 | #3299, #3302 |
| 6 | #3304 | 直列 | #3303 |

## ステータス追跡
<!-- 【必須】 -->

子Issue 実行状態 enum（`pending`/ `ready`/ `running`/ `completed`/ `blocked`/ `failed`）。
`⏭スキップ` は採用しない。

| 状態 | 件数 |
|------|------|
| pending | 5 |
| running | 0 |
| completed | 3 |
| blocked | 0 |
| failed | 0 |

## 完了条件
<!-- 【必須】 -->

<!-- 完了条件: Epic全体の完了判定条件 -->
- [ ] 全 8 子 Issue が完了（PR merge と Issue クローズを含む）していること
- [ ] Root Case #3293 の execution contract 完了条件（AC-01〜AC-15）がすべて成立していること
- [ ] 最終横断検証（TS-008: /repo/docs-check、inspect-docs、targeted docs guard、影響範囲検出に基づく既存試験、ADF-COVERS 対応宣言確認、AUTOGEN 索引再生成〔差分がある場合のみ既存生成器で〕、textlint 共通基盤検査）が合格していること（OU-0008 が実施し、結果を本 Issue の完了報告へ記録）

## Execution Contract
<!-- 【必須】 -->

<!-- Epic flow の場合は子 Issue 個別の実現面の変更方針が子 Issue 本文へ投影され、Epic 共通の実現面の変更方針のみ本セクションへ記録する -->

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

Epic 共通の実現面は「正規文書の現在契約を実行時投影・検証へ同一変更で反映し、新旧契約の併存を残さない」こと（RU §2.6）である。子 Issue 個別の RA 投影は各子 Issue 本文の「実現面の変更方針」セクションを正とする。

- RA-001: design-file-manager 実行時投影の保存契約同期（OU-0003。verification_refs: TS-003。source_items: AG-002）
- RA-002: case 系 workflow skill・reference の判断境界・見送り記録語彙同期（OU-0001〔case-auto 系〕・OU-0002〔case-ready 系〕・OU-0003〔case-close 系〕。verification_refs: TS-001, TS-002, TS-003。source_items: AG-001, AG-002）
- RA-003: 検証資産の同期（OU-0008。verification_refs: TS-008, TS-009。source_items: AG-007）
- RA-004: 入口文書の現在像への統合編集（OU-0006。verification_refs: TS-006。source_items: AG-005）
- RA-005: docs/designs/** 横断の現在形純化スイープ実行（OU-0004。verification_refs: TS-004。source_items: AG-003）
- RA-006: 規範重複の限定的縮約の実行と索引再生成（OU-0007〔縮約〕・OU-0008〔索引再生成〕。verification_refs: TS-007, TS-008。source_items: AG-006）

## レビュー判断
<!-- 【必須】 -->

- RD-001（source_item: RU-20261001-01-2.1-REQ005）: disposition: covered / reason_code: already_satisfied。REQ-005-029 は 2026-10-01 付で「人間に留保された判断（新しい意味判断、REQ-096 参照）を行わないこと」へ部分整列済み。括弧内の用語注記は REQ-096-027 と同型の正当な言及であり REQ-005 への追加操作は不要。TS-001 の網羅検索で同種残存の有無を再確認。evidence: docs/requirements/REQ-005.md、REQ-005-029（path 単独依存を避ける補助識別子: REQ-005 の判断権限関連行、Case #3293）
- RD-002（source_item: RU-20261001-01-2.1-inspect-promote-design）: disposition: covered / reason_code: already_satisfied。inspect-promote Design は「自律確定の判定位置とHITLフォールバック」節で既に REQ-096 を参照し frontmatter に ADF-COVERS(REQ-096-004/005/006/018/022) を持つ。判断境界の正規整列は成立済みで Design 保存操作は不要。残る HITL 言及の正当性は TS-001・TS-002 の横断検証で確認。evidence: docs/designs/commands/inspect-promote.md、自律確定の判定位置とHITLフォールバック節（Case #3293）
- RD-003（source_item: RU-20261001-01-6-work1-inventory）: disposition: covered / reason_code: superseded_by。RU §6 作業1 の横断インベントリ（単純検索 43 ファイル候補）は draft-data の実測基準（HEAD 8c471d3e で履歴候補表現 15 ファイル、`## 対応記録` 見出し 2 ファイル）へ更新して引き継ぐ。数値差はパターン集合の違いであり単純一致件数を欠陥件数とみなさない。インベントリの確定は RA-005・TS-004 の前置として実施時に完了。evidence: RU-20261001-01 §6 作業1（Case #3293）

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / Root Case #3293
- work_type: maintenance / scale: large（Root Case。子 Issue は scale: standard）
- adversarial-review: skip（REQ-015-003。Root Case 本文候補と Definition Package 構成案は合意済み draft-data の機械的投影のみ。ユーザー明示指定なし）
- AC-01〜AC-15 の本文と TS-001〜TS-009 の3要素（verification / pass_criteria / on_failure）の正は Root Case #3293 本文の execution contract セクションおよび各子 Issue 本文の「テスト戦略」セクション
- 作業基準版: agent-dev-flow-main-2026-10-01.zip（RU §5.3）。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない（RA-005・TS-004 の前置として case-run で実施）
- Definition 面の変更内容の正: Definition PR #3294（merge 済み）。draft-data の正（RU・agreed_items 等）は case-ready 完了時に削除されるため、Issue 本文と Git 履歴が恒久的な参照先である
````
