# proxy request: case-close Epic #3280 最終 Wave クローズ + Root Case #3278 クローズ（DEL-3280-4）

- 生成: 2026-10-01 / case-close workflow executor（委譲単位 DEL-3280-4）
- 障害: agentdev_gh の副作用操作（issue_update #3280 Epic body 更新）が gh exit 66（stderr 空・起動環境失敗）で初回 + 追試 1回の計 2回失敗。serve 全体劣化のため Case #3278 で合意済みの外側 Supervisor write-proxy 運用へ切替（DEL-3280-3 前例と同一形式）。読み取りは gh CLI 直接実行で実施済み（Tool contingency contract sanctioned）。書き込みの gh CLI 直接実行は行っていない（agentdev-gh-write-guard 契約どおり）
- 判断はすべて case-close 側で完了済み（QG-4 総合判定 pass・AC-1〜23 判定表・Epic 完了条件 4件評価・Root Case 状態遷移 ready→closed・capture 分類）。下記 payload は byte-exact で適用すること（本文の再生成・要約・再フォーマットをしない）
- payload は `<!-- PAYLOAD:... BEGIN -->` 〜 `<!-- PAYLOAD:... END -->` マーカー間のテキストをそのまま使う（UTF-8・LF/CRLF は GitHub 側正規化に任せる）

## 判断サマリ（case-close 実行済み）

- QG-4 総合判定: pass（観点 1〜10・不合格 0。機械受理基準 7受理由件完備・fail 由来分類由来不明 0）
- 横断検証（merge 後 main 8c6c0560 実測）: full integrity suite 3352 pass 実質（fail 3件は subprocess timeout 状態依存・単独再実行全非再現・由来不明 0）・AUTOGEN 鮮度 green・textlint hard 0・UTF-8 0件・配布依存境界 source+link 両 profile failures 0・check_extensions newNg 0
- トレーサビリティ独立再検査: REQ-096 missing-implementation 8行・missing-verification 30行 = baseline 値と完全一致（増分 0の機械証明: sidecar 実質削除 0・REQ 行 ID 変化 0）。REQ-003/090/002 関連行も baseline 不変。完全性ゲートは Case #3278 確定済み合意（intake 2026-10-01-3287 起票済み・後続対応）に従い「増分 0・baseline 不変」確認をもって扱う
- AC-1〜23: pass 17 / not applicable 6 / fail 0 / blocked 0。TS-003・TS-021 全スコープ残存検索 pass
- Design 状態評価（棚卸し制）: 統合候補 0件・0件確認（promote系 3件すべて status accepted）
- Capture 回収: intake 1件新規（.agentdev/intake/inbox/2026-10-01-3280-inspect-promote-frontmatter-confidence-vocabulary.md）。learning なし（判断記録のみ）。別 commit で永続化済み
- 完了条件チェックボックス評価: Epic 4件すべて成立 → [x] 化 payload に証拠簡記付き。子 Issue 4件は既に全 [x]・CLOSED（本 package の対象外）
- クローズ順序: Epic #3280 先・Root Case #3278 後（QG-4 合格後のみ Root をクローズ）

## 操作リスト（実行順序・依存・中止規則）

各操作は agentdev_gh Custom Tool 経由で実行する（gh CLI 直接書き込み禁止）。失敗時は反復リトライしない（1操作あたり最大1回の追試）。追試も失敗した場合は以後の依存操作を実行せず停止して結果を報告する。

1. issue_update #3280（body = PAYLOAD:epic-3280-body）→ read-back 1
2. comment_create #3280（body = PAYLOAD:comment-3280）→ read-back 2
3. issue_close #3280（reason: completed）→ read-back 3
4. issue_update #3278（body = PAYLOAD:root-3278-body）→ read-back 4（操作 3 の close 成功後にのみ実行）
5. issue_close #3278（reason: completed）→ read-back 5

依存規則: 4〜5 は操作 3（Epic close）が成功した後にのみ実行する。Epic 先・Root 後の順序を変更しない。

## 事前条件（冪等再実行）

- issue_update #3280: 事前に issue_read で Epic 完了条件チェックボックスが未 [] のままか確認。すでに payload と同一（全 [x] 化済み）なら body 更新をスキップ
- comment_create #3280: 既存コメントに「Wave 3 最終クローズ・DEL-3280-4」を含む対応記録コメントが存在するならスキップ（二重投稿禁止）
- issue_close #3280: state=OPEN のときのみ実行。CLOSED 済みならスキップ
- issue_update #3278: 事前に issue_read で状態行が「- 状態: ready」のままであることを確認。すでに「- 状態: closed」なら body 更新をスキップ
- issue_close #3278: state=OPEN のときのみ実行。CLOSED 済みならスキップ
- Epic close が不合格の場合（QG-4 不合格等）Root はクローズしない（本 package では QG-4 pass 判定済みのため発生しないが、外側 Supervisor は操作 3 の結果を必ず確認してから 4〜5 を実行する）

## 操作定義（exact operation + 構造化引数）

- 操作1: agentdev_gh { "operation": "issue_update", "number": 3280, "body": <PAYLOAD:epic-3280-body> }
- 操作2: agentdev_gh { "operation": "comment_create", "number": 3280, "body": <PAYLOAD:comment-3280> }
- 操作3: agentdev_gh { "operation": "issue_close", "number": 3280, "reason": "completed" }
- 操作4: agentdev_gh { "operation": "issue_update", "number": 3278, "body": <PAYLOAD:root-3278-body> }
- 操作5: agentdev_gh { "operation": "issue_close", "number": 3278, "reason": "completed" }

commit message に close キーワード（fixes/closes/resolves 等）を追加しない（GitHub auto-close 回避・agentdev-conventional-commits ガイドライン）。

## read-back 期待値

- read-back 1（issue_read 3280）: state=OPEN・完了条件チェックボックス [x] 4件 / [ ] 0件・各項に「case-close QG-4」証拠簡記が存在・他セクション（分解テーブル・実行順序・ステータス追跡 counts pending 0/running 0/completed 4/blocked 0/failed 0・補足情報）は verbatim 不変
- read-back 2（comment_list 3280）: 本コメント（冒頭「## case-close 対応記録（Epic #3280 Wave 3 最終クローズ・DEL-3280-4）」）が存在
- read-back 3（issue_read 3280）: state=CLOSED・stateReason=COMPLETED
- read-back 4（issue_read 3278）: 状態行「- 状態: closed（2026-10-01・Epic #3280 Wave 3 最終 close QG-4 合格に伴う Root Case クローズ・DEL-3280-4...」に更新・resume_command 記載なし（blocked 遷移なし）・次工程行「なし（完了...」・Definition Package・Execution Contract・レビュー判断等の他セクションは verbatim 不変
- read-back 5（issue_read 3278）: state=CLOSED・stateReason=COMPLETED

## QG-4 実行証跡（case-close 実行・2026-10-01・merge 後 main 8c6c0560）

詳細は PAYLOAD:comment-3280 の「full integrity suite 実行証跡」「横断検証結果」テーブルを正とする。主要コマンド列:

- bun test ./.opencode/skills/repo-agentdev-integrity/scripts/（timeout 600s・2回実行・stdout/stderr 分離退避）
- bun test ./src/opencode/skills/ ／ bun test ./.opencode/plugins/ ./scripts/
- bun run .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts
- bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --base-ref e541536c4f096ba0c34907498ebe5b756d6de585 --json
- bun run .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile source --json ／ --profile link --json
- bun run .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts --json
- bun run .opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.ts --root .
- bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .
- bun src/check.ts --root C:/Users/ogatay/work/agent-dev-flow --req <REQ-096-001〜030 / REQ-003 全27行 / REQ-090 全27行 / REQ-002 全37行>
- rg 検索系: TS-003（状態ベース人間判断要求）・TS-021(a)(b)(c)(d)・TS-022（T2 記述維持）

## PAYLOAD:epic-3280-body

<!-- PAYLOAD:epic-3280-body BEGIN -->
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
| 2-1 | #3282 | completed | Wave 2: RA-003 正典 REQ 行の語彙・参照横断更新 + README 索引・AUTOGEN 更新（OU-002 の実現面） |
| 2-2 | #3283 | completed | Wave 2: RA-001 + RA-005 Workflow Skill 判断規則の新モデル適用と Jev 参照整理（OU-003 の実現面） |
| 2-3 | #3284 | completed | Wave 2: RA-002 配布 command 定義の HITL・自律確定表現更新（OU-004 の実現面） |

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
| pending | 0 |
| running | 0 |
| completed | 4 |
| blocked | 0 |
| failed | 0 |

## 完了条件

<!-- 完了条件: Epic全体の完了判定条件 -->
- [x] 全 Child Issue（4件）の完了条件チェックボックスが成立していること — case-close QG-4（Wave 3・DEL-3280-4）: #3281 7件/#3282 8件/#3283 6件/#3284 4件・unchecked 0件・全 CLOSED を Issue 本文再読で機械確認
- [x] REQ-096-001〜030 の受入条件 AC-1〜23（TS-001〜TS-023）が全 Case スコープで成立していること（各子 TS スライスの pass 記録 + 検索系 TS-003/TS-021 の全スコープ残存検索 + AC別記録）— case-close QG-4: AC別記録 pass 17 / not applicable 6（TS-005/006/009/010/014/023 は durable state に個別定義の実在なし〔rg 実測・#3283 対応記録の前例どおり〕）/ fail 0 / blocked 0。TS-003・TS-021 の全スコープ残存検索は merge 後 main 8c6c0560 で実施。AC 判定表の正は本 Issue の Wave 3 対応記録コメント
- [x] README 索引（docs/README.md・docs/requirements/README.md・docs/decisions/README.md）と docs/designs/quality/req-health-metrics.md AUTOGEN が実現面変更後に再生成されていること — case-close QG-4: check_autogen_freshness 6 files・findings 0（merge 後 main 8c6c0560 実測・green）。再生成は Wave 2-1（#3282）で完了（generate_indexes.ts no changes・手書き文現行性確認済み）
- [x] T1/T2境界維持（REQ-096-028・TS-022）、単一RU維持（CR-004）、旧モデル残存除去（REQ-096-023・TS-021）を確認済み。Issue closed・PR merged を完了証拠とする — case-close QG-4: REQ-096 対象外節の T2 記述 2件維持・本 Case 変更は語彙/参照整理で T2 非該当・Epic execution_unit は単一 RU（全12工程）を維持・TS-021 全スコープ (a)(b)(c)(d) 残存 0件（移管記録行・REQ-034-032 既知残存〔intake 起票済み〕は契約対象外）。完了証拠: 子 Issue 4件 CLOSED・PR #3285/#3286/#3287/#3288 MERGED

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


<!-- PAYLOAD:epic-3280-body END -->

## PAYLOAD:comment-3280

<!-- PAYLOAD:comment-3280 BEGIN -->
## case-close 対応記録（Epic #3280 Wave 3 最終クローズ・DEL-3280-4）

Wave 3 検証フェーズ（AC-1〜23 集約・QG-4 最終完了判定）を完了し、Epic #3280 を close（completed）した。検証は merge 後 main 8c6c0560（全 merge 取り込み済み・main root read-only 検査）で実施。case-run（各子 PR 本文検証差分）・中間 Wave 対応記録コメントとの差分で finding を分類する。

### QG-4 判定（総合: pass・不合格 0）

| 観点 | 検証結果 | 判定 |
|---|---|---|
| 1 完了条件チェックボックス全達成 | 完了条件 4件を達成判定し [x] 化（各項に評価根拠簡記付き・Epic 本文更新） | pass |
| 2 CI 通過確認 | 本 Wave は PR なし（検証フェーズ。子 4 PR はすべて MERGED 済み・CI checks 未定義 repo） | N/A |
| 3 docs 整合性 | README 索引・AUTOGEN 再生成済み（check_autogen_freshness 6 files・findings 0・green） | pass |
| 4 文書分類ポリシー適合 | targeted docs guard warnings 0（failures 0 / files_checked 115） | pass |
| 5 close 時更新漏れ（局所確認） | check_extensions ok=true / newNg 0・配布依存境界 source+link 両 profile failures 0 | pass |
| 6 test strategy 処理完了 | AC-1〜23 判定表（下記）で全 AC 処理済み（pass 17 / not applicable 6 / fail 0 / blocked 0） | pass |
| 7 機械横断是正の再 grep 証拠 | TS-021 全スコープ (a)(b)(c)(d) 再 grep 残存 0件（移管記録行・REQ-034-032 既知残存〔intake 起票済み〕は契約対象外・下記明細） | pass |
| 8 PR 対象範囲 vs 全体 | 横断是正・集計値条件は全体評価スコープ → merge 後 main 8c6c0560 で全スコープ再評価実施済み | pass |
| 9 識別子中心評価 | 完了条件は識別子中心（REQ-096-028・TS-022・CR-004・TS-021）。件数等は補助値 | N/A |
| 10 フル suite 機械受理 | 正規ランナー構成確認・3 cwd 分割実行・環境ラベル・件数突合・fail 全件由来分類（由来不明 0）完備（下記証跡） | pass |

### full integrity suite 実行証跡（merge 後 main・QG-4 機械受理基準）

- 正規ランナー構成確認: root package.json なし（workspace 構成なし）・bun 1.3.6・integrity suite は bun test 正規形（bun test 実行形態契約どおり）
- 環境ラベル: 実行環境 = main root（C:/Users/ogatay/work/agent-dev-flow・branch main・HEAD 8c6c0560）／ junction 伝播状態 = main root・.opencode/skills/agentdev-* junction 構成存在（stale なし・link profile 実効実行を可能にする構成）／ 依存パッケージ状態 = integrity scripts・project-extensions scripts の node_modules 存在確認済み・bun install 未実施（既存解決済み環境を利用）
- 分割① integrity suite: bun test ./.opencode/skills/repo-agentdev-integrity/scripts/（timeout 600s 明示）→ 第1回 2648 pass / 2 fail / 6781 expect / 2650 tests across 107 files（267.54s）・フル再実行 2649 pass / 1 fail / 同件数（265.49s）
- 分割② src 側 skill script: bun test ./src/opencode/skills/ → 102 pass / 0 fail / 199 expect / 102 tests across 9 files（104.00ms）
- 分割③ plugins・repo ルート系: bun test ./.opencode/plugins/ ./scripts/ → 600 pass / 0 fail / 174241 expect / 600 tests across 30 files（117.11s）
- 件数突合: ① 2650×2回・② 102・③ 600 = 合計 3352 tests / 146 files。直前実績（Wave 1: 2650 / Wave 2-2: 2639）と比較し急減なし
- fail 由来分類: 3件（IR-055 回帰 15s timeout・NG21 N17 15s timeout・TS-011f 5s timeout）はいずれも subprocess 起動 timeout 起因。単独再実行で全非再現（check_integrity.test.ts 176 pass / 0 fail・check_changed_docs.test.ts 54 pass / 0 fail）・フル再実行では fail テストが各回で異なる = 状態依存・相互作用由来（Windows 環境の負荷変動）。本 Case 変更（docs 語彙移行・参照整理）との因果なし。変更由来 0 / pre-existing 0 / 不明 0・状態依存（timeout）3件として分類し由来不明 0。baseline 基準: 本検証は merge 後 main HEAD 8c6c0560 実測

### 横断検証結果（merge 後 main 8c6c0560 実測）

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-close | targeted docs guard（check_changed_docs.ts --workflow case-close --base-ref e541536c〔Definition PR #3279 merge 直前 commit〕） | pass（failures 0 / warnings 0 / files_checked 115） | 既出 0 / 新規 0 |
| case-close | AUTOGEN 鮮度（check_autogen_freshness.ts） | green（findings 0 / 6 files） | 既出 0 / 新規 0 |
| case-close | textlint 共通基盤（agentdev-textlint-guard gate.ts） | PASS（544 files・hard violations 0） | 既出 0 / 新規 0 |
| case-close | UTF-8 健全性（check_content_corruption.ts） | pass（broken-emphasis / control-char / invalid-unicode / foreign-script / simplified-chinese / stale-reference すべて 0件） | 既出 0 / 新規 0 |
| case-close | 配布依存境界 source profile | ok=true / failures 0 / scanned 359（rules 286・concrete 系 hits すべて 0） | 既出 0 / 新規 0 |
| case-close | 配布依存境界 link profile（merge 後 main root・正規実行環境） | ok=true / failures 0 / scanned 359（zero-targets ではない実効実行・Wave 2 の worktree zero-targets 環境制約を本検証で解消） | 既出（Wave 2 無効実行の本検証での採用実行）/ 新規 0 |
| case-close | extensions 整合性検査（check_extensions.ts） | ok=true / failures 0 / newNg 0（baselineKnown 0 / approvedAdditions 0） | 既出 0 / 新規 0 |
| case-close | トレーサビリティ check（agentdev-traceability check --req REQ-096-001〜030） | 7検査 pass（malformed / unknown-roles / unknown-req-refs / invalid-artifact-paths / missing-design / policy-invalid / duplicate-inconsistencies）・missing-implementation 8行（010/014/021/025/027/028/029/030）・missing-verification 30行（全行） | 既出（baseline 値と完全一致・#3283 対応記録の 8行/30行と同一）/ 新規 0 |
| case-close | 同 check 増分 0 の機械証明 | sidecar diff 2016c03d..main は insertions のみ（112 insertions・実質削除 0）・REQ-003/002/090 の REQ 行 ID 変化 0・REQ-096 missing-implementation は Wave 1 時点 25行 → Wave 2 で 17行解消 → 現行 8行・missing-verification 30行不変 | — |
| case-close | トレーサビリティ check（REQ-003 全27行 / REQ-090 全27行 / REQ-002 全37行） | REQ-003: missing-design 27行（design 役割宣言を持たない baseline 既存・他 8検査 pass）／ REQ-090: 全 9検査 pass ／ REQ-002: missing-design 37行・missing-implementation 5行（baseline 既存・REQ-002 は文言無変更〔REQ-030-004〕・RA-002 は command 定義実装） | 既出（baseline 不変・sidecar 削除 0・REQ 行 ID 変化 0で増分 0）/ 新規 0 |
| case-close | 完全性ゲートの取扱い | REQ-096 missing-verification 30行・missing-implementation 8行は Case #3278 確定済み合意（intake 2026-10-01-3287 起票済み・case-ready ready 記録「missing-implementation / missing-verification は case-run 対応作成分・case-close QG-4 最終検査〔ready 拒否条件外〕」）に従い「増分 0・baseline 不変」の確認をもって扱う。新規解消は intake 経由の後続対応 | — |
| case-close | TS-003 全スコープ残存検索（rg・docs/ src/opencode/ traceability/・merge 後 main） | pass — 状態のみを理由とする人間判断要求規則 0件。「確信度」hit は決定的カテゴリ名（REQ-036-021 契約・Jev 不適用の決定的基準を auto-promote-and-review.md に明記）・診断メタデータ confidence・否定的言及（case-ready decision-acceptance・inspect-promote hitl-and-disposition）・正典記述（REQ-096 本体）のみ | 既出（各子スライス pass と整合）/ 新規 0 |
| case-close | TS-021(a) 全スコープ（REQ-003-055/056 残存参照） | pass — 参照 3件すべて移管記録行（REQ-003.md 56行・v4-responsibility-boundaries.md 44/67行）・契約対象外 | 既出 / 新規 0 |
| case-close | TS-021(b) 全スコープ（semantic 6項目・deterministic 11項目の旧列挙正典参照） | pass — 旧列挙正典参照 0件。v4-responsibility-boundaries.md 写像表（102-112行）は移行先定義として必須・検索対象外。REQ-027.md 17行・command-file-format.md 40行・artifact-responsibilities.md 109行の「semantic 担当 / deterministic 委譲先 / 知識提供」は DEC-036 決定(2)(3) 分類参照（DEC-048 部分置換契約「決定(2)(3) 由来の DEC-036 参照は維持」に整合） | 新規 0（DEC-036 維持参照の位置づけ補足記録） |
| case-close | TS-021(c) 全スコープ（一意性中心自律確定語彙） | pass — 正規契約としての一意性中心自律確定規則の残存 0件。hit は REQ-034-032 系既知残存（intake 2026-10-01-3282 起票済み・対象範囲外合意）・DEC 承認記録（履歴記録）・DEC-048/REQ-096/v4-responsibility-boundaries の否定的言及・閉包条件記述（新モデル構成要素） | 既出（REQ-034-032・intake 起票済み）/ 新規 0 |
| case-close | TS-021(d) 全スコープ（REQ-090-024 旧閉包条件の直接列挙） | pass — 旧直接列挙 0件（6系統 18箇所は REQ-{NNNN} 参照形式・v4-responsibility-boundaries 111行は写像表） | 既出（#3283 対応記録と整合）/ 新規 0 |
| case-close | TS-022 T1/T2 境界維持 | pass — REQ-096 対象外節の T2 記述 2件維持（64/65行）・REQ-096-028 存在・本 Case 変更（語彙/参照整理）は T2 非該当 | 既出 0 / 新規 0 |

### AC-1〜23 判定表（Epic 完了条件 2 の AC別記録）

| AC | TS | 判定 | 根拠 |
|---|---|---|---|
| AC-1 | TS-001 | pass | #3283 スライス（PR #3287・判断方法3分類帰属判別・6系統＋品質ゲート＋case-run/close/revise/open） |
| AC-2 | TS-002 | pass | #3283 スライス（確定権限3分類判定表突合・主要判断の確定権限判別） |
| AC-3 | TS-003 | pass | #3282/#3284 スライス + 全スコープ残存検索 0件（本検証・merge 後 main） |
| AC-4 | TS-004 | pass | #3281/#3283 スライス（引き上げ条件完全一覧の正典整合・旧 REQ-003-055 委任正典参照 0件） |
| AC-5 | TS-005 | not applicable | durable state に本 Case の個別定義が実在しない（rg 実測・#3283 対応記録の前例どおり） |
| AC-6 | TS-006 | not applicable | 同上（#3283 対応記録で公式記録済み） |
| AC-7 | TS-007 | pass | #3283 スライス（閉包条件 REQ-096 参照化・評価器固有形式からの独立）+ 全スコープ TS-021(d) 0件 |
| AC-8 | TS-008 | pass | #3283 スライス（Jev 恒久原則言及 0件・Stage 1 観測契約の位置づけ維持） |
| AC-9 | TS-009 | not applicable | durable state に個別定義の実在なし（rg 実測） |
| AC-10 | TS-010 | not applicable | 同上 |
| AC-11 | TS-011 | pass | #3283 スライス（品質ゲート所有範囲を判定・原因分類に限定・不合格→人間判断直結規則 0件） |
| AC-12 | TS-012 | pass | #3282/#3283 スライス（case-run 裁量範囲と対象範囲変更の区分・REQ-031-004） |
| AC-13 | TS-013 | pass | #3282/#3283 スライス（case-auto 非中央判断者性・REQ-034-038） |
| AC-14 | TS-014 | not applicable | durable state に個別定義の実在なし（#3283 対応記録） |
| AC-15 | TS-015 | pass | #3283 スライス（TS-013/TS-015 併記・stop-and-decision-resolution 4分類の確定権限明示） |
| AC-16 | TS-016 | pass | #3282/#3283 スライス（promote 系自律確定判定基準の確定権限ベース化） |
| AC-17 | TS-017 | pass | #3283 スライス（case-close 自律確定の導出ベース明示・QG-4） |
| AC-18 | TS-018 | pass | #3283 スライス（promote 系自律確定の確定権限ベース〔TS-016/TS-018 併記〕） |
| AC-19 | TS-019 | pass | #3283 スライス（adversarial-review read-only 境界・最終確定権限非取得維持） |
| AC-20 | TS-020 | pass | #3283 スライス（backlog-review 統合・分割の委譲裁量/人間判断区分明示） |
| AC-21 | TS-021 | pass | 4子スライス + 全スコープ (a)(b)(c)(d) 残存 0件（本検証・既知残存は intake 起票済み・契約対象外） |
| AC-22 | TS-022 | pass | T1/T2 境界維持（REQ-096-028・本検証） |
| AC-23 | TS-023 | not applicable | durable state に個別定義の実在なし（rg 実測） |

計: pass 17 / not applicable 6 / fail 0 / blocked 0。not applicable 6件（TS-005/006/009/010/014/023）は、case-ready が子 Issue へ投影した TS のみが実行対象である本 Case の durable state 契約において、いずれの子にも投影されず durable state（子 Issue 本文・PR 本文・durable state 全体の rg 実測）に個別定義が実在しない検証項目。Wave 2-2 対応記録で前例化・親 case-auto completed-pr 独立検証済みの取扱いを踏襲する。

### Design 状態評価（棚卸し制・Wave 3 集約）

- 棚卸し列挙: REQ-096 を implementation 役割 ADF-COVERS 宣言する docs 配下 Design = promote系 3件（docs/designs/commands/{intake-promote,learning-promote,inspect-promote}.md・coverage 実測 136 対応関係のうち implementation docs 3件）。いずれも status: accepted → 冪等除外対象・昇格対象 0件
- PR 本文 Design確定候補: 4 PR とも「なし」→ 統合後候補 0件・0件確認（Design 状態評価正常完了）

### Epic 完了条件チェックボックス評価（4件）

1. 全 Child Issue 完了: #3281 7件/#3282 8件/#3283 6件/#3284 4件・unchecked 0件・全 CLOSED（Issue 本文再読で機械確認）→ 成立
2. AC-1〜23 成立: 上記判定表のとおり（pass 17 / n/a 6 / fail 0・TS-003/TS-021 全スコープ検索済み・AC別記録は本コメント）→ 成立
3. README 索引・AUTOGEN 再生成: Wave 2-1 で実行（generate_indexes.ts no changes・手書き文現行性確認済み）+ 本検証で check_autogen_freshness 0件（merge 後 main・green）→ 成立
4. T1/T2・単一 RU・残存除去・完了証拠: TS-022 pass・Epic execution_unit 単一 RU（全12工程）維持・TS-021 全スコープ pass・子 Issue 4件 CLOSED・PR #3285/#3286/#3287/#3288 MERGED → 成立

### 検証差分（前段 case-run / 中間 Wave 対応記録との差分）

- 新規 0 / 修正済み 0 / 撤回 0 / 無効 0
- 既出: REQ-034-032 語彙既知残存（intake 2026-10-01-3282 起票済み・後続対応合意）／ REQ-096 missing-verification 30行・missing-implementation 8行（intake 2026-10-01-3287 起票済み）／ inspect-promote frontmatter description「高確信度」語彙残存（#3284 PR Findings・frontmatter 無変更制約 → intake 2026-10-01-3280 として本 Wave で回収）

### Capture 回収判断（本検証の新規 Findings）

- full integrity suite の subprocess timeout 状態依存 fail（15s/5s timeout・単独再実行で全非再現・フル再実行各回で fail テストが異なる）: learning 非配置（判断記録のみ）。fail 由来分類契約（agentdev-quality-gates qg-4-final-acceptance「fail 由来分類」節）の手順（単独再実行 → フル再実行 → 状態依存性確認）で既存契約どおり処理できたため新規の問題回避知見なし
- inspect-promote frontmatter「高確信度」語彙統一候補: intake 配置（.agentdev/intake/inbox/2026-10-01-3280-inspect-promote-frontmatter-confidence-vocabulary.md・別 commit で永続化済み）

### 備考

- 本 Wave は gh exit 66（serve 全体劣化・stderr 空）のため、GitHub 書き込み一式を proxy package（.agentdev/drafts/proxy-request-case-close-final-3280.md）へ移管。判断（QG-4・AC 判定・完了条件評価・Root 状態遷移・capture 分類）は case-close 側で全確定済み

<!-- PAYLOAD:comment-3280 END -->

## PAYLOAD:root-3278-body

<!-- PAYLOAD:root-3278-body BEGIN -->
## 概要
<!-- 【必須】 -->

ADF全体の判断アーキテクチャを、判断方法3分類（決定的処理・閉じた意味評価・開いた推論）と確定権限3分類（正規契約からの導出・委譲された裁量・人間に留保された判断）を独立軸とする統一モデルへ再設計する。新規横断REQ（REQ-096）と後継Decision（DEC-048、DEC-036決定(1)の二分法を部分置換しHarness/Backend adapter境界・投影・拡張責務はDEC-036維持）を正典として確立し、REQ-003（委譲時判断・承認・副作用境界へ責務限定、promote系自律確定原則055/056をREQ-096へ一般化移管）、REQ-090（Jev実証・観測契約へ位置づけ）、REQ-002（正典宣言の再指定）、DEC-039（決定(5)参照再指定）を再編する。12ワークフロー（req-define、case-open、case-ready、case-run、品質ゲート、case-auto、case-close、case-revise、intake-promote、learning-promote、inspect-promote、backlog-review）へ適用し、旧判断モデル（状態のみの人間判断規則、一意性中心の自律確定規則、二分法語彙、評価器固有語彙の上位露出、重複判断層）を残存なく除去する。評価器実測に依存する最終確定主体の変更はT2対象として本要件の完了条件に含めない。

work_type: feature / scale: large（draft-data 合意値）。機能要件、非機能要件、制約、対象外、受け入れ条件は draft-data の合意済み入力を反映し新規に作成しない（REQ-030-004）。

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3278
- adf_execution_unit: epic #3280（Epic flow。Wave 1〜3・Child Issue #3281〜#3284）
- adf_harness_ref: N/A（本stage委譲の委譲識別情報ブロックなし）

## 対象 REQ
<!-- 【必須】 -->

- REQ-096: ADF判断アーキテクチャ（判断方法・確定権限・人間判断境界）〔新規作成・ACT-REQ-001〕
- REQ-003: 委譲時の判断・承認・副作用境界〔REQ-003-055/056 削除・適用範囲修正・ACT-REQ-002〕
- REQ-090: Jev 先行評価の実運用組込み（Stage 1: 観測可能化）〔目的追記・REQ-090-024 置換・ACT-REQ-003〕
- REQ-002: 配布成果物の責務境界〔目的の導入段落の正典宣言更新・ACT-REQ-004〕

## Definition Package
<!-- 【必須】 -->

<!-- Definition Package: case-open が壁打ち済み内容から生成し Root Case に関連付ける。
構成は case-open / case-ready Design に従う（要件行、Decision、Design、Issue 構成案、受入条件一式）。
realization_actions は構成要素として保持する（構造化ハンドオフ）。case-open は execution contract を確定しない -->
- 要件行: REQ-096 新規30行（REQ-096-001〜030〔ACT-REQ-001〕）、REQ-003-055/056 の2行削除と適用範囲修正〔ACT-REQ-002〕、REQ-090 目的追記と REQ-090-024 行置換〔ACT-REQ-003〕、REQ-002 目的の導入段落変更（要件行 REQ-002-035/040 は文言無変更）〔ACT-REQ-004〕。変更後本文の原本は draft-data の ACT-REQ-001〜004 content ブロック（draft: .agentdev/drafts/req-draft-adf-judgment-architecture-redesign.md。case-ready 成功後に削除。原本は canonical Definition〔merge 済み docs〕へ移行）
- Decision: DEC-048 新規〔ACT-DEC-001。accepted 遷移済み（case-ready 受理評価 REQ-030-005・2026-10-01）〕、DEC-039 決定(5) 参照再指定（DEC-036→DEC-048・非意味修正）と frontmatter relations 追記〔ACT-DEC-002〕、DEC-036 frontmatter 部分置換記録（superseded_by: DEC-048・status: accepted 維持・DEC-028/047 前例準拠）〔ACT-DEC-003〕。原本は draft-data の ACT-DEC-001〜003 content ブロック
- Design: docs/designs/foundations/v4-responsibility-boundaries.md（HITL 判断確定原則節の拡張 + 新節「ADF判断アーキテクチャ詳細基準」〔ACT-DESIGN-001〕）、docs/designs/commands/intake-promote.md〔ACT-DESIGN-002〕、docs/designs/commands/learning-promote.md〔ACT-DESIGN-003〕、docs/designs/commands/inspect-promote.md〔ACT-DESIGN-004〕（各 ADF-COVERS 宣言と「自律確定とHITL境界/フォールバック」節の REQ-003-055/056 参照置換）、docs/designs/responsibilities/custom-tool-contracts.md（Jev 先行評価節の REQ-090-024 参照整理〔ACT-DESIGN-005〕）。原本は draft-data の ACT-DESIGN-001〜005 content ブロック
- Issue 構成案: case_open_hints.epic_needed=true。OU-001（REQ-096 create + DEC-048 create・scale large・単独実行・recommended_order 1）、OU-002（REQ-003 再編 + Design 4件〔v4-responsibility-boundaries・intake-promote・learning-promote・inspect-promote〕・depends_on: OU-001）、OU-003（REQ-090 再編 + custom-tool-contracts・depends_on: OU-001）、OU-004（REQ-002 再編 + DEC-039/DEC-036 更新・depends_on: OU-001）。Wave 1: OU-001（正典確立）→ Wave 2: OU-002/003/004 並行 + RA-001〜005 実現面作業 → Wave 3: 検証一括（TS-001〜TS-023、特に TS-021 残存検索）と README 索引・AUTOGEN 更新。構成の最終確定（Epic / Child Issue / Wave 作成）は case-ready が実行する
- 受入条件一式: AC-1〜23 ↔ TS-001〜TS-023（draft-data test_strategy。検証結果は pass/fail/blocked/not applicable で AC別記録。AC-1〜23 → 23/23 欠落なし、12工程 → 12/12 欠落なし〔draft 照合記録〕）。T1/T2境界維持（REQ-096-028・TS-022）、単一RU維持（CR-004）、旧モデル残存除去（REQ-096-023・TS-021）を含む。Issue closed・PR merged を完了証拠とする
- realization_actions: RA-001（12ワークフローと品質ゲートの判断規則ブロックの新モデル適用）、RA-002（配布 command 定義の HITL・自律確定・状態ベース表現の更新）、RA-003（正典REQ行の語彙・参照の横断更新。REQ-036/037/038/041 本文の REQ-003-055 参照の REQ-096 参照化を含む〔宣言系でなく check gate 外だが dangling 必須解消〕）、RA-004（トレーサビリティ整合と v4 責務分類語彙の移行）、RA-005（Workflow Skill の Jev 適用判断記述の参照整理。.agentdev/jev-observations/ と .local/ は保護）。execution contract への投影確定は case-ready（DEC-026 構造化ハンドオフ）
- Definition PR: merge 済み: #3279（squash merge 2016c03dbd0a831b232c57a5fe3f80aa51eb479a。3検査 pass・追加承認なしで自動確定。IR-055 warning_total_cap 51→53 引上げは受入時の親判断としてユーザー事前承認済み〔PR #3279 本文記録・PR #3271 前例準拠〕で適用）

## Execution Contract
<!-- 【必須】 -->

<!-- case-ready が canonical Definition 確定後に確定する。
各要素は合意済み Definition の投影であり、新規作成しない。
runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は含めない -->
- 対象範囲: 合意済み draft-data（AC-1〜23、全12工程、単一RU CR-004）。Definition 側（REQ-096 新規30行・REQ-003-055/056 削除・REQ-090 再編・REQ-002 正典宣言・DEC-048/039/036・Design 5件）は canonical 保存済み。実行対象は実現面 RA-001〜005 と検証 TS-001〜023。T2（評価器実測に依存する最終確定主体の変更）は対象外（REQ-096-028・TS-022）
- 変更対象成果物: RA-004 = traceability/ + docs/designs/skills/_template.md + docs/designs/skills/ 配下 33件 + docs/designs/foundations/{workflow-skill-model,v4-runtime-execution-model}.md + docs/designs/integrity/rule-ownership.md + docs/designs/README.md + docs/designs/commands/ 配下参照ファイル。RA-003 = docs/requirements/{REQ-003,005,006,031,034,036,037,038,041,061}.md + docs/designs/workflows/v4-delegation-contracts.md + 索引派生物（docs/README.md・docs/requirements/README.md・docs/decisions/README.md・docs/designs/quality/req-health-metrics.md）。RA-001+RA-005 = src/opencode/skills/agentdev-workflow-*/（SKILL.md + references/*.md）+ src/opencode/skills/agentdev-quality-gates/** + src/opencode/skills/agentdev-workflow-orchestration/references/*.md。RA-002 = src/opencode/commands/agentdev/{intake-promote,learning-promote,inspect-promote,backlog-review,case-auto,req-define}.md。保護: .agentdev/jev-observations/**、.local/**
- 関連 REQ / Decision / Design: REQ-096（主対象）・REQ-003・REQ-090・REQ-002 ／ DEC-048（accepted）・DEC-039・DEC-036 ／ v4-responsibility-boundaries・intake-promote・learning-promote・inspect-promote・custom-tool-contracts
- 完了条件: Epic #3280 の全 Child Issue（#3281〜#3284）完了条件成立、AC-1〜23（TS-001〜023）の全 Case スコープ成立（AC別記録）、README 索引・AUTOGEN 再生成、旧モデル残存 0件（TS-021 全スコープ）、T1/T2境界維持（TS-022）。Issue closed・PR merged を完了証拠とする
- テスト戦略: 各子 Issue 本文のテスト戦略（TS 3要素構造 verification/pass_criteria/on_failure）を正とする。検索系 TS-003/TS-021 は各子が自スコープスライスを実行し、全スコープ残存検索は Wave 3（Epic 完了条件・case-close QG-4）で実施する。AC別記録は pass/fail/blocked/not applicable を AC-1〜23 ごとに Epic 完了条件で集約する
- 必須品質統制: document 変更 = 文書品質査読（textlint 共通基盤: agentdev-textlint-guard 標準規則 + プロジェクト用語 prh 辞書）、skill 変更 = Skill 品質査読（agentdev-skill-authoring 基準）、command 変更 = Command 品質（agentdev-command-authoring 基準）、索引派生物 = generate_indexes.ts 再生成後 check_autogen_freshness 0件、traceability = coverage/check 整合（REQ-096 missing-design 非包含の維持）、UTF-8 健全性（BOM/CR/U+FFFD 0件）
- scope-affecting impact candidate: RA-004 の 33件 skill Design 語彙移行 → ADF-COVERS 宣言・traceability sidecar の REQ 参照変化（変更後 check 再実行）、RA-003 の REQ 行更新 → 索引派生物鮮度（IR-061 非発生確認）、RA-001 の workflow skill 判断規則変更 → case-run/close 実行時判断への影響（TS スライス確認）、RA-002 配布物変更 → command 索引整合
- review 発動契約: 該当なし（ユーザー明示指定なし。上流 req-define STEP-8 adversarial-review 済み・unresolved なし）
- work_type / scale / Issue structure: feature / large / Epic（#3280・Child Issue 4件・Wave 1〜3。単一RU CR-004 維持）

## Case 状態と次工程
<!-- 【必須】 -->

- 状態: closed（2026-10-01・Epic #3280 Wave 3 最終 close QG-4 合格に伴う Root Case クローズ・DEL-3280-4。resume_command: なし〔blocked 遷移なし・ready から closed へ正常終了。review→closed 直接遷移ではなく既存 Case 状態モデル上の正常完了〕）
- Definition PR: merge 済み: #3279（2016c03dbd0a831b232c57a5fe3f80aa51eb479a）
- 実行構造: Epic（#3280。Child Issue #3281〜#3284・Wave 1〜3・依存構造 OU-001 → OU-002/003/004）→ 全完了（子 Issue 4件 CLOSED・PR #3285/#3286/#3287/#3288 MERGED・Epic #3280 CLOSED completed。QG-4 判定表と AC-1〜23 判定表の正は Epic #3280 Wave 3 対応記録コメント）
- 次工程: なし（完了。REQ-096 missing-verification 30行・missing-implementation 8行の残余は intake 2026-10-01-3287・inspect-promote frontmatter 語彙統一候補は intake 2026-10-01-3280 を経て後続対応）

## レビュー判断
<!-- 【必須】 -->

該当なし（draft-data の review_dispositions は省略〔session由来構造化要件入力を直接処理〕。上流 req-define STEP-8 adversarial-review は findings 22件〔本質的12件・非本質的10件〕を Reviewee 反証・convergence audit の上すべて処置済み、unresolved なユーザー判断事項なし〔draft 照合記録〕）

## 補足情報（オプション）

- draft（SSoT）: .agentdev/drafts/req-draft-adf-judgment-architecture-redesign.md（# draft-data YAML ブロックが原本）
- 冪等キー: topic_slug=adf-judgment-architecture-redesign / 対象 REQ=REQ-096 / created_at=2026-10-01T02:36:51+09:00
- トレーサビリティポリシー追随: REQ 行追加（REQ-096-001〜030）に伴う traceability/policy.yaml の追随要否を STEP-3 で確認（REQ-030-015）
- design 対応事前確認: 既存行の意味変更（REQ-003-055/056 削除・REQ-090-024 置換）の coverage --req 実査を STEP-3 で実施（case-open Design「意味変更行の design 対応事前確認」節）
- STEP-3 完了記録（2026-10-01）: coverage --req 実査結果 — REQ-003-055/056 は design 役割対応 0件（implementation 3件のみ〔promote系3Design〕で削除後は現行要件行外。implementation 宣言追随は ACT-DESIGN-002/003/004 に組込み済み）、REQ-090-024 は design 対応あり（docs/designs/responsibilities/custom-tool-contracts.md design 役割。ACT-DESIGN-005 が参照整理実施）→ design 対応が欠落する意味変更行なし。トレーサビリティポリシー追随判断 — REQ-096-001〜030 の policy optional 登録は不要（検証対応 required が draft test_strategy TS-001〜023 で全行定義済み、default: required のままで整合。判断理由記録: REQ-030-015）、REQ-003-055/056 の policy.yaml optional エントリ2行削除（:74-75）を Definition PR 構成要素に含める（policy 編集は同一 Definition 変更として Definition PR 経由のみ）。REQ-096-001〜030 の design 対応は ACT-DESIGN-001（v4-responsibility-boundaries.md への ADF-COVERS(design) 宣言追加）で担保する（missing-design 0 件ゲート・増分ベース）
- 適用対象12ワークフロー: req-define、case-open、case-ready、case-run、品質ゲート、case-auto、case-close、case-revise、intake-promote、learning-promote、inspect-promote、backlog-review
- 冪等検出: 既存 Root Case / 既存 Definition PR なし（open/closed 全検索、2026-10-01 case-open STEP-5 実施）
- adversarial-review（case-open 側）: skip（Root Case 本文候補と Definition Package 構成案は draft-data の機械的投影のみで新規の意味的決定を含まない。REQ-015-003 skip 条件該当。上流 req-define STEP-8 で findings 処置済み・unresolved なし）
- STEP-4 完了記録（2026-10-01）: Definition branch definition/issue-3278（origin/main HEAD 0dbfcd81 起・スタックなし）、commit 9b80dc6c（Definition 本体・17ファイル）+ 0873da01（IR-061 再同期）を push 済み。missing-design 0 件ゲート達成（REQ-096-001〜030 全30行の coverage --req 実測帰着）。check_integrity 実測 ok=791/ng=1（IR-055 のみ。main 既存 NG 52>51 + 本 PR 起因 +1。cap 引上げ 51→53 は parent decision 事項として PR #3279 本文に記録）、check_autogen_freshness 0件、UTF-8 健全性 17ファイル 0件。Definition PR 作成済み: #3279（pr_create は gh exit 66 で2回失敗後、harness 再起動を経て冪等再実行で作成・PR 残骸不在確認済み・重複生成なし）
- STEP-5 完了記録（2026-10-01）: 冪等再実行確認 — 既存 Root Case / 既存 Definition PR 再利用判定（重複生成なし・2件目不生成・不足分のみ処理）。横断依存検査 — 共有エンジン（inspect_cross_dependencies.ts）実行、mode: case-open、population 1（自 Case のみ）、条件(a) 同一パス重複警告 0件、条件(b) 共有領域重複需要 0件（shared_areas は project extension 定義なし〔fail-open〕）、detection_unavailable: 未クローズ Case 群の現時点再取得不能（gh exit 66 再発・最終実測は STEP-2 冪等検出時の open issue 0件）を比較の黙示省略なしで報告、gate_effect: none。Epic 構成投入のため同一投入内（Wave 内）重複は case-ready 前置検出へ委譲
- STEP-6 完了記録（2026-10-01）: deviation capture — learning 1件（gh exit 66 が serve 再起動後も約8呼出で再発する劣化サイクルの観測と多段 lifecycle 冪等再実行の実効性）を Split Rule で learning 分類し .agentdev/learning/inbox.md へ保存、git 永続化済み（commit 97ee6a74・push 済み）。intake はなし（修正対象は harness 側責務で ADF 配布物スコープ外）
- GitHub I/O 起動環境障害記録: Custom Tool `agentdev_gh` issue_create が gh exit 66（起動環境失敗・stderr 空）で2回失敗し blocked 停止（停止理由分類: 運用上の前提不足〔ツール操作不足〕）。REQ-093 診断手順（gh auth status / gh repo view 実査・読取操作 fallbacks 契約確認）実施後、harness 再起動による回復手段が適用され、疎通確認（issue_read ok）後に冪等再実行で本 Issue を作成した（残骸不在確認済み・重複生成なし）。読み取り操作は gh CLI 手動フォールバック（Tool contingency contract sanctioned）で実施。副作用操作は代替なし・継続不可（fail-closed）のため手動 gh WRITE は行っていない
- case-ready STEP-1 完了記録（2026-10-01・infra-transient 中断後の resume 前実施分）: 忠実性確認 pass — draft-data ACT ブロック突合 23/23（REQ-096・DEC-048 は full-file 完全一致、REQ-003/090/002・DEC-039/036・Design 5件・policy.yaml は宣言・参照・文言レベルで突合合格）。整合性検査 pass — 17ファイルの id↔filename・README entry・frontmatter 整合を確認（check_integrity ok=791 記録と整合）。品質検査 — CI なし（no checks reported）、case-open STEP-4 の branch HEAD 実測記録（check_integrity ok=791/ng=1〔IR-055 のみ〕・autogen 0件・UTF-8 0件）を確認。IR-055 warning_total_cap 51→53 は受入時の親判断としてユーザー事前承認済み（PR #3279 本文記録・PR #3271 前例準拠の解消経路）。isDraft: false を merge 前に確認済み。gh exit 66 による infra-transient 停止（pr_read 2回失敗）のため merge 以降を resume 停止
- case-ready resume 完了記録（2026-10-01）: merge merge 済み確認 — Definition PR #3279 squash merge（merge commit 2016c03dbd0a831b232c57a5fe3f80aa51eb479a・Supervisor write-proxy 実行・2026-10-01T05:29:07+09:00。main HEAD 実測一致・17ファイル canonical 確認済み） ／ Decision 受理 DEC-048 proposed→accepted 遷移実行（commit af378585・受理可否は合意済み内容と merge 済み main 状態の照合から一意に確定・承認記録追記・索引再生成）。DEC-039（決定(5) 再指定 + relations 追記）・DEC-036（superseded_by: DEC-048・accepted 維持）は merge 内容で確認済み。IR-055 warning_total_cap 51→53 適用（commit fc443bca・適用後 check_integrity ng=0） ／ traceability check 機械実行 coverage --req REQ-096-001〜030 実測: 全30行 × design 1件（v4-responsibility-boundaries.md）。check（REQ-096 スコープ）: missing-design pass・policy 有効・malformed-declarations / unknown-req-refs / invalid-artifact-paths pass。missing-implementation / missing-verification は case-run 対応作成分・case-close QG-4 最終検査（ready 拒否条件外） ／ Jev 逐次経路 Standard/Epic 確定 = Epic・必須・一貫（観測 20260930T203606Z-c76f・confidence 0.61・LLM 最終判断は Jev 結果と一致〔observation_write 済み〕）、Wave 構成 = 並列可・必須依存なし（観測 20260930T203635Z-6e81・LLM 最終判断一致。重複検出 0件のため処置 choice 不生成〔条件付き化契約〕）、スコープ重複 = なし（観測 20260930T203653Z-00c8・LLM 最終判断一致。重複なしのため処置 choice 不生成） ／ 横断依存検査 共有エンジン（inspect_cross_dependencies.ts）実行、mode: case-ready、population 1（未クローズ Case 群の実測 = 自 Case のみ〔2026-10-01 手動 gh CLI 実測・detection_unavailable なし〕）、条件(a) 0件、条件(b) 0件（shared_areas は project extension 定義なし〔fail-open〕）、gate_effect: none、検査入力は検査後に削除済み ／ draft/RU 削除と main 同期は ready 遷移後の STEP-7 で実施（削除対象: draft 1件〔.agentdev/drafts/req-draft-adf-judgment-architecture-redesign.md・untracked〕・RU なし）

<!-- PAYLOAD:root-3278-body END -->

