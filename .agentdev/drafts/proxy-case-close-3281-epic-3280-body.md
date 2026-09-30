## 概要

REQ-096「ADF判断アーキテクチャ（判断方法・確定権限・人間判断境界）」の実行構造を束ねる Epic Issue。Root Case: #3278（case-ready STEP-5 で Epic 確定）。Definition 側（REQ-096 新規・DEC-048 新規・REQ-003/090/002 再編・DEC-039/DEC-036 更新・Design 5件更新）は Definition PR #3279 の merge（main HEAD 2016c03dbd0a831b232c57a5fe3f80aa51eb479a）で canonical Definition として保存済み。残存実行対象は realization_actions 5件（RA-001〜005）と検証（AC-1〜23 ↔ TS-001〜023）。12ワークフローへの新判断モデル適用と旧モデル残存除去を実現面として実行する。

## 実行識別情報

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3280
- adf_execution_unit: epic
- adf_harness_ref: N/A

## 課題

OU-001〜004（正典確立: ACT-REQ-001 REQ-096 create + ACT-DEC-001 DEC-048 create、再編: ACT-REQ-002〜004 + ACT-DEC-002/003 + ACT-DESIGN-001〜005）は Definition PR #3279 の merge で canonical Definition として保存済み。残存は実現面: RA-001（12 Workflow Skill + agentdev-quality-gates の判断規則ブロック新モデル適用）、RA-002（配布 command 定義 6件の HITL・自律確定表現更新）、RA-003（正典 REQ 行の語彙・参照横断更新: 10 REQ + v4-delegation-contracts）、RA-004（トレーサビリティ整合 + v4 責務分類語彙移行: 33 skill Design + 正典参照更新）、RA-005（6系統 Workflow Skill の Jev 適用判断記述の参照整理）。RA-001 と RA-005 は同一ファイル族（agentdev-workflow-*）を扱い、単一 Issue では実行規模が大きいため、変更対象が競合しない実行単位への分解が必要。

## 提案内容

正典層の参照・語彙統合（RA-004）を Wave 1 に前置し、Wave 2 で REQ 行系（RA-003 + 索引派生物更新）、workflow skill 系（RA-001 + RA-005）、command 定義系（RA-002）を変更対象ファイル集合が互いに素な3子 Issue として並行実行する。Wave 3 は専任子 Issue を作成しない検証フェーズとする（各子が自 TS スライスを完了条件内で実行し、全子完了後に AC-1〜23 の集約確認。case-close QG-4 が対応完全性の最終検査を所有）。

## REQ参照

REQ-096

関連: REQ-003、REQ-090、REQ-002、DEC-048、DEC-039、DEC-036、v4-responsibility-boundaries Design

## 分解

<!-- 分解テーブル正規形（agentdev-epic-tracker 新4列形式と整合）: 「#」列は {wave}-{seq} 形式（例: 1-1）、Issue 列は #N のみ（OU ID 等の付記は内容列へ）、ステータス初期値は pending -->
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #3281 | completed | Wave 1: RA-004 トレーサビリティ整合・v4 責務分類語彙移行・正典参照更新（OU-001 正典層の実現面） |
| 2-1 | #3282 | pending | Wave 2: RA-003 正典 REQ 行の語彙・参照横断更新 + README 索引・AUTOGEN 更新（OU-002 の実現面） |
| 2-2 | #3283 | pending | Wave 2: RA-001 + RA-005 Workflow Skill 判断規則の新モデル適用と Jev 参照整理（OU-003 の実現面） |
| 2-3 | #3284 | pending | Wave 2: RA-002 配布 command 定義の HITL・自律確定表現更新（OU-004 の実現面） |

## 実行順序

<!-- Wave テーブル正規形: Issue 列は #N のみ（OU ID 等の付記は前提列または分解テーブルの内容列へ） -->
| Wave | Issue | 実行方法 | 前提 |
|------|-------|----------|------|
| 1 | #3281 | 単独 | - |
| 2 | #3282 | 並列 | #3281 |
| 2 | #3283 | 並列 | #3281 |
| 2 | #3284 | 並列 | #3281 |
| 3 | （子 Issue なし・検証フェーズ） | 単独 | #3282〜#3284 完了後。各子 TS スライス確認 + AC-1〜23 集約（case-close QG-4） |

## ステータス追跡

子Issue 実行状態 enum（`pending`/ `ready`/ `running`/ `completed`/ `blocked`/ `failed`）。
`⏭スキップ` は採用しない。

| 状態 | 件数 |
|------|------|
| pending | 3 |
| running | 0 |
| completed | 1 |
| blocked | 0 |
| failed | 0 |

## 完了条件

<!-- 完了条件: Epic全体の完了判定条件 -->
- [ ] 全 Child Issue（4件）の完了条件チェックボックスが成立していること
- [ ] REQ-096-001〜030 の受入条件 AC-1〜23（TS-001〜TS-023）が全 Case スコープで成立していること（各子 TS スライスの pass 記録 + 検索系 TS-003/TS-021 の全スコープ残存検索 + AC別記録）
- [ ] README 索引（docs/README.md・docs/requirements/README.md・docs/decisions/README.md）と docs/designs/quality/req-health-metrics.md AUTOGEN が実現面変更後に再生成されていること
- [ ] T1/T2境界維持（REQ-096-028・TS-022）、単一RU維持（CR-004）、旧モデル残存除去（REQ-096-023・TS-021）を確認済み。Issue closed・PR merged を完了証拠とする

## Execution Contract

<!-- Execution Contract: case-open が新規 Epic Issue 作成時に付与するセクション。
本セクションに実現面の変更方針（realization_actions 由来）の投影先を定義し、req-define が確定した内容を Epic 本文へ永続化する（Issue Execution Contract の実現面投影契約に従う）。
Epic flow の場合は子 Issue 個別の実現面の変更方針が子 Issue 本文へ投影され、Epic 共通の実現面の変更方針のみ本セクションへ記録する -->

### 実現面の変更方針（realization_actions 由来）

<!-- 実現面の変更方針: case-open が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。
投影対象がない場合は「該当なし」と記載する -->

- Epic 共通の実現面の変更方針: 該当なし（RA-001〜005 の個別投影は各子 Issue 本文の「実現面の変更方針」セクションを正とする。Wave 3 検証フェーズの運用: 各子が自 TS スライスを実行・記録し、AC-1〜23 の集約確認は case-close QG-4 が実施する。RA-003 起因の README 索引・AUTOGEN 再生成は Wave 2-1（#3282）の完了条件に含める）

## レビュー判断

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。
Epic flow の場合は全 disposition を Epic Issue へ転記する。
転記対象がない場合は「該当なし」と記録する。 -->
該当なし（draft-data の review_dispositions は省略〔session由来構造化要件入力を直接処理〕。上流 req-define STEP-8 adversarial-review は findings 22件〔本質的12件・非本質的10件〕を Reviewee 反証・convergence audit の上すべて処置済み、unresolved なユーザー判断事項なし。Root Case #3278「レビュー判断」セクションに転記済みのため重複転記しない）

## 補足情報

### 構成推論の根拠（case-ready 3軸判断・Jev 逐次経路）

- 連結成分（必須依存のみをエッジ）: 1 成分（OU-001 → OU-002/003/004）。単独根に非該当（複数 operation_unit を含む）→ Epic
- 依存強度: 必須（OU-002/003/004 は OU-001 が確立する正典（REQ-096・DEC-048・詳細基準節）を参照・適用する前提依存。draft depends_on 宣言どおり）
- Epic サイズ: 4 Child Issue（機械導出）。上限 10 以内
- 機能的一貫性: 一貫（全実行単位が単一主題「REQ-096 ADF判断アーキテクチャの実現」に帰属。無関係な operation_unit の集約なし）
- Jev 先行評価観測（.agentdev/jev-observations/）: Standard/Epic 確定 = Epic・必須・一貫（観測 20260930T203606Z-c76f・confidence 0.61・LLM 最終判断は Jev 結果と一致〔observation_write 済み〕）、Wave 構成 = 並列可・必須依存なし（観測 20260930T203635Z-6e81・LLM 最終判断一致。重複検出 0件のため処置 choice 不生成〔条件付き化契約〕）、スコープ重複 = なし（観測 20260930T203653Z-00c8・LLM 最終判断一致。重複なしのため処置 choice 不生成）
- 既存オープン Issue とのスコープ重複: なし（2026-10-01 実測: open issue は自 Case Root Case #3278 のみ。子 Issue 生成のスキップなし）

### Wave 重複前置検出結果（競合リスク情報）

- Wave 2 の3子 Issue 間の変更対象ファイル集合重複: 0件（Wave 2-1 #3282 = docs/requirements/{REQ-003,005,006,031,034,036,037,038,041,061}.md + docs/designs/workflows/v4-delegation-contracts.md + docs/README.md + docs/requirements/README.md + docs/decisions/README.md + docs/designs/quality/req-health-metrics.md ／ Wave 2-2 #3283 = src/opencode/skills/agentdev-workflow-*/（SKILL.md + references/*.md）+ src/opencode/skills/agentdev-quality-gates/** ／ Wave 2-3 #3284 = src/opencode/commands/agentdev/{intake-promote,learning-promote,inspect-promote,backlog-review,case-auto,req-define}.md。3集合は互いに素。比較対象集合はファイル粒度に展開可能であり検出不能はない）
- Wave 1（#3281 = traceability/ + docs/designs/skills/_template.md + docs/designs/skills/ 配下 33件 + docs/designs/foundations/{v4-runtime-execution-model,workflow-skill-model}.md + docs/designs/integrity/rule-ownership.md + docs/designs/README.md + docs/designs/commands/ 配下参照ファイル）と Wave 2 は前置依存で別 Wave のため同一 Wave 候補内比較の対象外
- docs/designs/README.md は Wave 1 のみ、docs/README.md は Wave 2-1 のみで別ファイル（競合なし）。#3282 の generate_indexes.ts 再生成は Wave 1 完了後に実行されるため #3281 の手書き文更新を取り込む（AUTOGEN block のみ再生成・手書き文は保持）
- 競合リスク情報: なし（一時直列化・変更対象調整・merge 順序事前記録・rebase・衝突解消担当の指定は不要）。重複検出時の処置ポリシー: 変更対象分割を第一選択（本構成では実施不要）

### Wave 構成

| Wave | 内容 | 実行方法 |
|------|------|---------|
| 1 | RA-004 正典参照・語彙移行とトレーサビリティ整合 | 単独（前置） |
| 2 | RA-003 + 索引派生物更新 ／ RA-001 + RA-005 ／ RA-002 | 並列（3子間必須依存なし・変更対象互いに素） |
| 3 | 検証フェーズ（専任子 Issue なし。各子 TS スライス + AC-1〜23 集約。README 索引・AUTOGEN 更新は Wave 2-1 完了条件に含める） | 単独（全子完了後） |

### OU と RA の割当根拠（case-ready 構成確定）

- 合意済み分解（case_open_hints.decomposition）: OU-001〜004 の REQ/Decision/Design 所有は Definition PR #3279 で canonical 保存済み。RA-001〜005 は「OU-002 以降と並行可能な実現面作業」として execution contract へ投影することが合意済み
- Wave 1 = OU-001 に RA-004 を割当: RA-004 の意図「移管・置換後の参照整合を保ち、dangling 参照と旧語彙の正典参照を残さない」は正典層の統合であり、正典確立 Wave（OU-001）に整合。RA-004 の traceability sidecar 更新は REQ-096 行（merge済み）参照化であり Wave 2 の REQ 行語彙更新に前置依存しない
- Wave 2 = OU-002 に RA-003（REQ 行ドメイン一致）+ 索引派生物再生成（RA-003 起因の派生物）、OU-003 に RA-001 + RA-005（同一ファイル族 src/opencode/skills/agentdev-workflow-* への集約で競合回避。RA-005 は Jev/REQ-090 関連で OU-003 と意味一致）、OU-004 に RA-002（配布 command 定義ドメイン。REQ-002 正典宣言との表現一致を OU-004 の REQ 参照下で確認）
- Wave 3 は合意 wave_hints の「検証一括 + README 索引・AUTOGEN 更新」に対応。README 索引・AUTOGEN 更新は RA-003 起因のため Wave 2-1 完了条件へ内置し、横断検証集約は case-close QG-4 が所有（専任子 Issue の新設は合意 OU 構成 4件を維持するため行わない）
