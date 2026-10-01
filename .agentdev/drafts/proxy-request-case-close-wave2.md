# proxy request: case-close Epic #3280 Wave 2 boundary close（DEL-3280-3）

- 生成: 2026-10-01 / case-close workflow executor（委譲単位 DEL-3280-3）
- 障害: agentdev_gh の副作用操作（pr_merge #3286 squash）が gh exit 66（stderr 空・起動環境失敗）で初回 + 追試 1回の計 2回失敗。serve 全体劣化のため Case #3278 で合意済みの外側 Supervisor write-proxy 運用へ切替。読み取りは gh CLI 直接実行で実施済み（Tool contingency contract sanctioned）。書き込みの gh CLI 直接実行は行っていない（agentdev-gh-write-guard 契約どおり）
- 判断はすべて case-close 側で完了済み（QG・チェックボックス評価・Epic 表更新内容・capture 分類）。下記 payload は byte-exact で適用すること（本文の再生成・要約・再フォーマットをしない）
- payload は `<!-- PAYLOAD:... BEGIN -->` 〜 `<!-- PAYLOAD:... END -->` マーカー間のテキストをそのまま使う（UTF-8・LF/CRLF は GitHub 側正規化に任せる）

## 判断サマリ（case-close 実行済み）

- QG（merge 前・各 PR head worktree で実行済み・証跡は末尾）: 3 PR とも不合格 0。配布依存境界 source profile 2件 pass（failures 0）。link profile は worktree zero-targets（環境制約）だが host root では実行可能（failures 0・merge 前状態）→ merge 後の投影 sync 後再実行を Wave 3 最終 close の正規スコープとして記録
- トレーサビリティ独立再検査: 新規増分 0。#3284 分は missing-implementation 4行→0行解消。残余（missing-implementation 8行・missing-verification 30行）は main baseline 既存（先行状態）で Wave 3 / intake 記録の管理対象
- Design 状態評価（E4-3）: 3 PR 本文とも「Design確定候補: なし」→ Wave 内統合候補 0件・0件確認（昇格対象なし）
- Capture 回収: 完了済み（.agentdev/learning/inbox.md 2件追記・.agentdev/intake/inbox/ 4件新規。別 commit で永続化）
- 完了条件チェックボックス評価: #3282 8/8・#3283 6/6・#3284 4/4（最終条件「PR merge 済み」は merge で成立。payload に証拠簡記入り）
- Epic #3280 完了条件チェックボックス（4件）は E5-1 契約により中間 Wave のため verbatim 維持（Wave 3 最終 close の対象）

## 操作リスト（実行順序・依存・中止規則）

各操作は agentdev_gh Custom Tool 経由で実行する（gh CLI 直接書き込み禁止）。失敗時は反復リトライしない（1操作あたり最大1回の追試）。追試も失敗した場合は以後の依存操作を実行せず停止して結果を報告する。

1. pr_merge #3286（squash）→ read-back 1
2. pr_merge #3287（squash）→ read-back 2
3. pr_merge #3288（squash）→ read-back 3
4. issue_update #3282（body = PAYLOAD:issue-3282-body）→ comment_create #3282（body = PAYLOAD:comment-3282）→ issue_close #3282（reason: completed）
5. issue_update #3283（body = PAYLOAD:issue-3283-body）→ comment_create #3283（body = PAYLOAD:comment-3283）→ issue_close #3283（reason: completed）
6. issue_update #3284（body = PAYLOAD:issue-3284-body）→ comment_create #3284（body = PAYLOAD:comment-3284）→ issue_close #3284（reason: completed）
7. issue_update #3280（body = PAYLOAD:epic-3280-body）— 3 Issue の close 完了後に実行

依存規則: 4〜6 は各自 PR の merge 成功後にのみ実行する。7 は 4〜6 の close がすべて成功した後にのみ実行する。merge 順序の推奨は #3286 → #3287 → #3288（変更ファイル集合は互いに素のため順序依存なし）。

## 事前条件（冪等再実行）

- pr_merge: 事前に pr_read で state=OPEN かつ mergeable=MERGEABLE を確認。state=MERGED 済みならスキップ（再マージ禁止）
- issue_update: 事前に issue_read で該当チェックボックスが未 []] のままか確認。すでに payload と同一（全 [x] 化済み）なら body 更新をスキップ
- issue_close: state=OPEN のときのみ実行。CLOSED 済みならスキップ
- Epic issue_update: 分解テーブル 2-1/2-2/2-3 が completed 済みかつ counts が 目標値（pending 0 / completed 4）ならスキップ
- merge は --delete-branch 相当を行わない（Custom Tool 契約どおり。ブランチ削除は親 case-auto の cleanup 責務）

## 操作定義（exact operation + 構造化引数）

- 操作1: agentdev_gh { "operation": "pr_merge", "number": 3286, "method": "squash" }
- 操作2: agentdev_gh { "operation": "pr_merge", "number": 3287, "method": "squash" }
- 操作3: agentdev_gh { "operation": "pr_merge", "number": 3288, "method": "squash" }
- 操作4a: agentdev_gh { "operation": "issue_update", "number": 3282, "body": <PAYLOAD:issue-3282-body> }
- 操作4b: agentdev_gh { "operation": "comment_create", "number": 3282, "body": <PAYLOAD:comment-3282> }
- 操作4c: agentdev_gh { "operation": "issue_close", "number": 3282, "reason": "completed" }
- 操作5a: agentdev_gh { "operation": "issue_update", "number": 3283, "body": <PAYLOAD:issue-3283-body> }
- 操作5b: agentdev_gh { "operation": "comment_create", "number": 3283, "body": <PAYLOAD:comment-3283> }
- 操作5c: agentdev_gh { "operation": "issue_close", "number": 3283, "reason": "completed" }
- 操作6a: agentdev_gh { "operation": "issue_update", "number": 3284, "body": <PAYLOAD:issue-3284-body> }
- 操作6b: agentdev_gh { "operation": "comment_create", "number": 3284, "body": <PAYLOAD:comment-3284> }
- 操作6c: agentdev_gh { "operation": "issue_close", "number": 3284, "reason": "completed" }
- 操作7: agentdev_gh { "operation": "issue_update", "number": 3280, "body": <PAYLOAD:epic-3280-body> }

merge commit message は PR タイトル既定（PR 本文末尾の Refs 記法は close キーワードではないため auto-close 発生なし）。close キーワード（fixes/closes/resolves 等）を追加しないこと。

## read-back 期待値

- read-back 1〜3（pr_read 3286/3287/3288）: state=MERGED・mergeCommit 記録（各 squash merge commit hash を結果報告に含める）
- issue_read 3282: state=CLOSED（stateReason=COMPLETED）・完了条件チェックボックス [x] 8件 / []] 0件・対応記録コメント（DEL-3280-3）1件存在
- issue_read 3283: state=CLOSED・[x] 6件 / []] 0件・対応記録コメント 1件存在
- issue_read 3284: state=CLOSED・[x] 4件 / []] 0件・対応記録コメント 1件存在
- issue_read 3280: 分解テーブル 2-1/2-2/2-3 が completed・ステータス追跡 counts が pending 0 / running 0 / completed 4 / blocked 0 / failed 0・実行順序テーブル・Epic 完了条件チェックボックス（4件 []]）・他セクションは verbatim 不変

## merge 後の main 同期手順（記録・GitHub 書き込み後のローカル手順）

1. host リポジトリ root で git pull --ff-only origin main（worktree .worktrees/{3282,3283,3284}-docs と branch は親 case-auto が管理・本 close では削除しない）
2. 横断検証（正規所有: Epic #3280 Wave 3 検証フェーズ・最終 close QG-4）: bun test ./.opencode/skills/repo-agentdev-integrity/scripts/（full integrity suite）・check_autogen_freshness.ts --json（AUTOGEN 鮮度。committer date drift 検出時は generate_indexes.ts による再生成経路。境界 close 自身は索引を直接編集しない）・check_distribution_boundary.ts --profile link --json（host root・投影 sync 後）・--profile source --json
3. Wave 3 は子 Issue なし・case-close QG-4 が AC-1〜23 集約と対応完全性の最終検査を所有

## QG 実行証跡（case-close 実行・2026-10-01）

- targeted docs guard（#3282 head）: bun ./.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts --workflow case-close --base-ref origin/main --json --root .worktrees/3282-docs → failures 0 / warnings 0（10 files + coupled 3 READMEs）
- AUTOGEN 鮮度（#3282 head）: bun ./.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts --json --root .worktrees/3282-docs → findings 0 / 6 files scanned
- textlint gate ×3: bun ./src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .worktrees/{3282,3283,3284}-docs --json → hardCount 0（#3282 head は 545 files 計上）
- UTF-8 ×3: 変更 10 / 35 / 9 ファイルの BOM・CR・U+FFFD → すべて 0件
- integrity suite（#3283 head・worktree cwd）: bun test ./.opencode/skills/repo-agentdev-integrity/scripts/ → 2639 pass / 0 fail / 6768 expect / 107 files（PR #3287 記録 2639/0 と同数）
- 配布依存境界 source ×2: bun ./.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts --profile source --json .worktrees/{3283,3284}-docs → ok true / failures 0 / scanned 359・rules 286（両 PR 記録と同数）
- 配布依存境界 link（#3284 head + host root）: worktree → zero-targets:link（環境制約・検査不能を記録）/ host root → ok true / failures 0 / scanned 359（merge 前状態の baseline 記録）
- トレーサビリティ独立再検査: bun src/check.ts --root <各root> --req <対象行カンマ列挙>（#3282: REQ-005-029,REQ-006-114,REQ-031-004,REQ-034-038,REQ-036-018,REQ-037-003,REQ-038-002,REQ-041-008,REQ-061-002,REQ-061-021 / #3283: REQ-090-024 + REQ-096-001〜030 / #3284: REQ-096-015,018,020,023,024）。worktree vs main baseline 突合: #3282 完全一致・増分 0 ／ #3283 missing-implementation 25→8（8行とも baseline 既存）・missing-verification 30→30 不変 ／ #3284 missing-implementation 4→0（解消）・missing-verification 5→5 不変
- TS スライス再実行: #3282（REQ-003-055/056 0件・「一意に確定/一意に回答可能」は REQ-034-032 の既知残存のみ・状態理由人間判断要求 0件）/ #3283（(a)(c) 0件・閉包条件 18箇所すべて正典参照形式）/ #3284（すべて 0件）

## PAYLOAD:issue-3282-body

<!-- PAYLOAD:issue-3282-body BEGIN -->
Parent: #3280

<!-- Parent 配置正規形: 子Issue 本文の先頭行に Parent: #N を配置する（agentdev-epic-tracker 親Epic検出、case-open 不変条件と整合）。 -->

## 概要

Wave 2（並列）: RA-003「正典REQ行の語彙・参照の横断更新（所有権移動を伴わない再分類）」を実装し、RA-003 起因の README 索引・AUTOGEN 派生物を再生成する。OU-002（REQ-003 再編・promote系境界）の実現面に相当。

## 実行識別情報

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3280
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲

- docs/requirements/REQ-003.md: REQ-003-021/022/023 の参照再結線（文言は委譲時境界として残置・無変更）
- docs/requirements/REQ-005.md: REQ-005-029「新しい意味判断」語彙の再分類
- docs/requirements/REQ-006.md: REQ-006-114 resume_command 判定語彙
- docs/requirements/REQ-031.md: REQ-031-004 blocked 判定の原因別化
- docs/requirements/REQ-034.md: REQ-034-038 停止理由の原因別化
- docs/requirements/REQ-036.md / REQ-037.md / REQ-038.md: 目的節の REQ-003-055 引用の REQ-096 参照化 + REQ-036-018 / REQ-037-003 / REQ-038-002 の確定権限ベース化
- docs/requirements/REQ-041.md: REQ-041-008「REQ-003-055 の promote 系共通原則」参照の REQ-096 参照化（移管後に dangling になるため必須）
- docs/requirements/REQ-061.md: REQ-061-002/021 自動確定・受理評価の確定権限ベース化
- docs/designs/workflows/v4-delegation-contracts.md: 185行付近「一意に回答可能」の「正規契約から導出可能」語彙化
- README 索引・AUTOGEN 派生物の再生成: docs/README.md（REQ 件数・手書き文の現行化）、docs/requirements/README.md、docs/decisions/README.md、docs/designs/quality/req-health-metrics.md（generate_indexes.ts 実行 + 手書き文確認）

## REQ参照

REQ-003

関連: REQ-096、REQ-002、DEC-048、v4-responsibility-boundaries Design

## 提案内容

旧判断モデル語彙（一意性中心、状態ベース引き上げ、新しい意味判断）の残存を、正典 REQ 行レベルで除去し REQ-096 へ参照整合させる。すべての変更は合意済み draft-data の RA-003 責務記述の機械的適用であり、意味の選択・対象範囲変更を含まない（委譲された裁量の範囲）。

## 完了条件

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
- [x] REQ-003-021/022/023 が文言無変更で残置され、参照先が新モデルへ再結線されていること（証拠: 本 Issue 変更差分は REQ-003.md を含まず文言無変更を確認。参照再結線の現行性は #3279/#3281 確立分を TS-021(a) スライス再検証〔case-close DEL-3280-3〕で確認）
- [x] REQ-005-029・REQ-006-114・REQ-031-004・REQ-034-038・REQ-061-002/021 が新モデル語彙（判断方法3分類・確定権限3分類・原因別処理）へ更新されていること（証拠: PR #3286 差分 10 ファイルの該当 REQ 行更新を case-close 再読で確認）
- [x] REQ-036/037/038 の目的節 REQ-003-055 引用が REQ-096 参照化され、REQ-036-018/REQ-037-003/REQ-038-002 が確定権限ベースの判定文言へ更新されていること（証拠: PR #3286 差分で REQ-096 参照化と確定権限ベース文言を case-close 再読で確認）
- [x] REQ-041-008 が REQ-096 参照へ更新され dangling が解消されていること（証拠: REQ-096-018 参照化を PR #3286 差分で確認。traceability check の unknown-req-refs 0〔case-close 再実行〕）
- [x] v4-delegation-contracts.md の「一意に回答可能」が「正規契約から導出可能」語彙へ更新されていること（証拠: PR #3286 差分で語彙化を確認。TS-021(c) スライス再検証で対象範囲内の残存 0〔REQ-034-032 は対象範囲外・intake 記録済み〕）
- [x] generate_indexes.ts 実行により README 索引・req-health-metrics.md AUTOGEN が再生成され、手書き文の現行性（REQ 件数等）が確認されていること（証拠: generate_indexes.ts は no changes〔PR 記録〕。check_autogen_freshness findings 0・6 files scanned を case-close 再実行で確認）
- [x] 自スコープの TS-003・TS-012・TS-013・TS-016・TS-021 検査 pass（TS-021 は自変更対象パスのスライス実行）（証拠: TS-003・TS-021 スライスを case-close で再実行し pass。TS-012/013/016 は PR #3286 検証差分 pass を確認）
- [x] 変更は PR として main へ merge 済みであること（完了証拠: Issue closed・PR merged）（証拠: PR #3286 を main へ squash merge 済み・本 Issue を closed へ遷移〔case-close DEL-3280-3〕）

## テスト戦略

<!-- テスト戦略: case-ready が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
- id: TS-003（自スコープスライス）
  target_item: AG-002（本 Issue 変更 REQ ファイル分）
  verification: |
    rg により本 Issue の変更対象 REQ ファイルを検索し、難易度・確信度・評価器間不一致・結果状態・意味判断であること・一意解でないことだけを理由に人間判断を要求する規則の残存を検出する。原因・権限に基づく引き上げ条件は対象外。
  pass_criteria: |
    状態のみを理由とする人間判断要求規則が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出行を原因別処理または確定権限判定に基づく文言へ修正して再検証する。
- id: TS-012
  target_item: AG-007（REQ-031-004 更新後）
  verification: |
    REQ-031-004 更新後の文言を確認し、case-run の Issue 対象範囲内の内部実装判断・修正・追加検証が委譲された裁量として記述され、対象範囲・完了条件・受け入れ条件の変更が同じ裁量に含まれていないことを確認する。
  pass_criteria: |
    case-run の裁量範囲と対象範囲変更の区分が正規契約に存在すること。
  on_failure: |
    fix-and-reverify: REQ-031-004 の文言を修正して再検証する。
- id: TS-013
  target_item: AG-007（REQ-034 関連行更新後）
  verification: |
    REQ-034-038 更新後の文言を確認し、case-auto が中央判断者にならないこと、工程進行・実行調整・限定的な親判断解決への委譲された裁量適用が規定されていることを確認する。
  pass_criteria: |
    case-auto の非中央判断者性と自身の工程制御の裁量適用が正規契約に存在すること。
  on_failure: |
    fix-and-reverify: case-auto 関連行を修正して再検証する。
- id: TS-016
  target_item: AG-007（REQ-036-018・REQ-037-003・REQ-038-002 更新後）
  verification: |
    promote系3REQ の更新後の文言を確認し、「一意に確定できるか」ではなく正規契約からの導出または委譲された裁量の範囲で自律確定可否を判定する文言へ更新されていることを確認する。
  pass_criteria: |
    promote系3REQの自律確定判定基準が確定権限ベースに更新されていること。
  on_failure: |
    fix-and-reverify: promote系REQの該当行を修正して再検証する。
- id: TS-021（自スコープスライス）
  target_item: AG-008（本 Issue 変更対象パス分）
  verification: |
    rg により本 Issue の変更対象 REQ ファイル・v4-delegation-contracts.md を検索し、(a) REQ-003-055/056 残存参照（移管記録行は対象外）、(c) 「一意に確定」中心の自律確定語彙の残存を検出する。
  pass_criteria: |
    (a)(c) の残存が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出残存を新モデル参照へ置換して再検証する。

## Execution Contract

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。
case-ready が新規 Issue 作成時に付与する必須セクション。
本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。
case-run は本セクション存在有無で新旧 Issue を識別する -->
### 統合先
- main

### 変更対象成果物
- document: docs/requirements/{REQ-003,REQ-005,REQ-006,REQ-031,REQ-034,REQ-036,REQ-037,REQ-038,REQ-041,REQ-061}.md、docs/designs/workflows/v4-delegation-contracts.md、docs/README.md、docs/requirements/README.md、docs/decisions/README.md、docs/designs/quality/req-health-metrics.md

### 必須品質統制
- document 変更: 文書品質査読能力（textlint 共通基盤: agentdev-textlint-guard 標準規則 + プロジェクト用語 prh 辞書）
- 索引派生物: generate_indexes.ts 実行後の check_autogen_freshness 0件・IR-061 非発生
- トレーサビリティ整合: REQ 行編集時は agentdev-traceability coverage/check で整合確認（REQ-096 missing-design 非包含の維持）
- UTF-8 健全性: BOM なし・CR なし・U+FFFD なし（edit ツールまたは node の明示エンコーディング指定を使用）

### 関連 ADR 拘束条件
- DEC-048: 参照先の正典は DEC-048/REQ-096（決定(1) 系）。DEC-036 決定(2)(3) 由来の参照は変更しない
- DEC-039: 副作用実行権限の境界 — commit/push/merge は既存の安全境界に従う

### scope-affecting impact candidate
- REQ 行の文言更新により traceability sidecar の対応関係・req-health-metrics の鮮度計測が変動し得る → 変更後に索引再生成と traceability check を実行する
- docs/README.md の REQ 件数・手書き文は REQ 追加/削除が無くても語彙更新で現行化確認が必要

### 実現面の変更方針（realization_actions 由来）

<!-- 実現面の変更方針: case-ready が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。 -->

- **RA-003**: concern: 正典REQ行の語彙・参照の横断更新（所有権移動を伴わない再分類）。responsibility: 次の既存REQ行・REQ本文記述を新モデル語彙・参照へ更新する: REQ-003-021/022/023（参照再結線のみ、文言は委譲時境界として残置）、REQ-005-029（「新しい意味判断」語彙の再分類）、REQ-006-114（resume_command 判定語彙）、REQ-031-004（blocked 判定の原因別化）、REQ-034-038（停止理由の原因別化）、REQ-061-002/021（自動確定・受理評価の確定権限ベース化）、REQ-036（目的節の REQ-003-055 引用 + REQ-036-018）、REQ-037（目的節の REQ-003-055 引用 + REQ-037-003）、REQ-038（目的節の REQ-003-055 引用 + REQ-038-002）（promote系自律確定基準の確定権限ベース化と REQ-003-055 参照の REQ-096 参照化）、REQ-041-008（「REQ-003-055 の promote 系共通原則」参照の REQ-096 参照化。移管後に dangling になるため必須）、v4-delegation-contracts.md:185「一意に回答可能」の「正規契約から導出可能」語彙化。ownership_hints: docs/requirements/REQ-003.md、docs/requirements/REQ-005.md、docs/requirements/REQ-006.md、docs/requirements/REQ-031.md、docs/requirements/REQ-034.md、docs/requirements/REQ-036.md、docs/requirements/REQ-037.md、docs/requirements/REQ-038.md、docs/requirements/REQ-041.md、docs/requirements/REQ-061.md、docs/designs/workflows/v4-delegation-contracts.md。intent: 旧判断モデル語彙（一意性中心、状態ベース引き上げ、新しい意味判断）の残存を、正典REQ行レベルで除去し REQ-096 へ参照整合させる。verification_refs: TS-003, TS-012, TS-013, TS-016, TS-021。source_items: AG-008, AG-010。加えて本 Issue 固有の派生物作業: RA-003 の REQ 行更新後に README 索引・AUTOGEN（docs/README.md・docs/requirements/README.md・docs/decisions/README.md・docs/designs/quality/req-health-metrics.md）を generate_indexes.ts で再生成し、手書き文を現行化する

### adversarial-review 発動契約（任意）
- 該当なし（ユーザー明示指定なし）

## レビュー判断

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。
disposition 明細の重複転記は行わない。「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #3280 の「レビュー判断」セクションを参照すること。

## 補足情報

- 対象 Case: #3278（Root Case）。実行構造: Epic #3280 Wave 2-1（並列・前提 #3281）
- 保護対象: .agentdev/jev-observations/**、.local/**、ADF-COVERS 宣言行は変更時に削除しない（参照先更新のみ）
- 競合回避: Wave 2 の他子 Issue（#3283 = src/opencode/skills/**、#3284 = src/opencode/commands/**）とは変更対象ファイル集合が互いに素

<!-- PAYLOAD:issue-3282-body END -->

## PAYLOAD:comment-3282

<!-- PAYLOAD:comment-3282 BEGIN -->
## case-close 対応記録（Epic #3280 Wave 2 境界クローズ・DEL-3280-3）

PR #3286 を main へ squash merge し、完了条件チェックボックス 8/8 を成立させて本 Issue を close した。case-run（PR 本文検証差分）との差分で finding を分類する。

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-close | 完了条件チェックボックス評価（8項目） | 8/8 成立（最終条件「PR merge 済み」は本 merge で成立）。評価根拠は Issue 本文の各項へ簡記 | 既出 0 / 新規 0 |
| case-close | targeted docs guard（check_changed_docs.ts --workflow case-close --base-ref origin/main --root .worktrees/3282-docs） | pass（failures 0 / warnings 0） | 既出 0 / 新規 0 |
| case-close | AUTOGEN 鮮度（check_autogen_freshness.ts --root .worktrees/3282-docs） | pass（findings 0・6 files scanned。PR 記録と同数） | 既出 0 / 新規 0 |
| case-close | textlint 共通基盤（agentdev-textlint-guard gate.ts --root .worktrees/3282-docs） | pass（hard violations 0） | 既出 0 / 新規 0 |
| case-close | UTF-8 健全性（変更 10 ファイルの BOM/CR/U+FFFD 決定的検査） | pass（0件） | 既出 0 / 新規 0 |
| case-close | TS-003・TS-021 スライス再実行（rg・変更 10 ファイル） | pass。TS-021(c) は REQ-034-032 の既知残存のみ（対象範囲外・PR 記録どおり） | 既出 1（REQ-034-032 語彙残存）/ 新規 0 |
| case-close | トレーサビリティ独立再検査（agentdev-traceability check --req 対象 10行・worktree と main baseline 突合） | worktree と main が完全一致（missing-design 6行・missing-implementation 1行〔REQ-006-114〕は baseline 既存・新規増分 0）。missing-verification は対象 10行すべて pass | 既出（baseline 既存 7行・増分 0）/ 新規 0 |
| case-close | 配布依存境界 最終 gate（E4-1） | 変更ファイルは docs/** のみで source profile 配布ソース面に非包含のため gate スキップ（契約どおり） | 新規 0 |
| case-close | Design 状態評価（E4-3・棚卸し制） | PR 本文申告「Design確定候補: なし」を確認。Wave 内統合候補 0件のため 0件確認を記録（昇格対象なし） | 新規 0 |

Capture 回収: REQ-034-032 語彙 → .agentdev/intake/inbox/2026-10-01-3282-req034-032-unique-answerable-vocabulary.md（intake）、REQ-036-021 確信度語彙 → .agentdev/learning/inbox.md（learning）。内容は PR #3286 本文 Findings を正とする。

備考: merge 後 main の横断検証（full integrity suite・AUTOGEN 鮮度・link profile 含む配布依存境界）は Epic #3280 Wave 3（検証フェーズ・最終 close QG-4）の正規スコープ。
<!-- PAYLOAD:comment-3282 END -->

## PAYLOAD:issue-3283-body

<!-- PAYLOAD:issue-3283-body BEGIN -->
Parent: #3280

<!-- Parent 配置正規形: 子Issue 本文の先頭行に Parent: #N を配置する（agentdev-epic-tracker 親Epic検出、case-open 不変条件と整合）。 -->

## 概要

Wave 2（並列）: RA-001「12ワークフローと品質ゲートの判断規則ブロックの新モデル適用」と RA-005「Workflow Skill の Jev 適用判断記述の参照整理」を実装する。両者は同一ファイル族（src/opencode/skills/agentdev-workflow-*）を扱うため単一実行単位に集約した。OU-003（REQ-090 Jev 適用契約）の実現面に相当し、RA-001 の横断適用を Wave 2-2 で担う。

## 実行識別情報

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3280
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲

- src/opencode/skills/agentdev-workflow-req-define、agentdev-workflow-case-open、agentdev-workflow-case-ready、agentdev-workflow-case-run、agentdev-workflow-case-auto、agentdev-workflow-case-close、agentdev-workflow-case-revise、agentdev-workflow-intake-promote、agentdev-workflow-learning-promote、agentdev-workflow-inspect-promote、agentdev-workflow-backlog-review の各 SKILL.md および references 配下の判断規則記述（HITL 境界、自律確定条件、停止理由、委譲契約）の新モデル（判断方法3分類・確定権限3分類・原因別処理）語彙と基準への書換
- src/opencode/skills/agentdev-quality-gates の SKILL.md および references 配下の当該記述の新モデル適用
- src/opencode/skills/agentdev-workflow-orchestration/references/*.md の当該記述の新モデル適用
- 6系統 Workflow Skill（learning-promote、req-define、case-ready〔Epic/Wave 構成判断〕、intake-promote、inspect-promote、backlog-review）の Jev 適用判断単位 reference 記述のうち、閉包条件（REQ-090-024）を直接列挙する箇所の REQ-096 参照への整理

## REQ参照

REQ-090

関連: REQ-096、DEC-048、DEC-039、v4-responsibility-boundaries Design

## 提案内容

各ワークフローの局所判断規則を横断原則（REQ-096）に整合させ、状態ベースの引き上げ・一意性ベースの自律確定の残存を除去する。評価器固有語彙の上位露出を整理し、閉包条件の正典を REQ-096 に一元化する。局所判断の所有は各ワークフローが維持する（中央判断機構を新設しない）。

## 完了条件

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
- [x] 11 Workflow Skill（req-define、case-open、case-ready、case-run、case-auto、case-close、case-revise、intake-promote、learning-promote、inspect-promote、backlog-review）+ agentdev-quality-gates の判断規則ブロック（HITL 境界・自律確定条件・停止理由・委譲契約）が新モデル語彙と基準へ適用されていること（証拠: PR #3287 変更 26 ファイル〔11 Workflow Skill + quality-gates の SKILL.md/references〕の適用を case-close 再読で確認）
- [x] 各ワークフローの主要判断について判断方法（決定的処理・閉じた意味評価・開いた推論）と確定権限（導出・裁量・人間留保）の帰属が正規契約（SKILL.md / references）から判別できること（証拠: TS-001/TS-002 pass を PR #3287 検証差分で確認し、帰属明示の実文を case-close 再読で確認）
- [x] RA-005: 6系統 Workflow Skill の Jev 適用判断節の REQ-090-024 直接列挙が REQ-096 参照へ整理されていること（観測契約の本文は変更しない）（証拠: case-close 再検証で「閉包条件」記述 18箇所〔6系統×3〕がすべて REQ-{NNNN} プレースホルダ + v4-responsibility-boundaries Design 正典節参照形式であることを確認・旧直接列挙 0件。観測契約本文は変更ファイル集合外）
- [x] .agentdev/jev-observations/** と .local/** に混入・削除・変更がないこと（証拠: PR #3287 の変更ファイル集合は src/opencode/skills/** と traceability/** のみで .agentdev 配下を含まないことを git diff で確認〔case-close〕）
- [x] 自スコープの TS-001・TS-002・TS-006・TS-007・TS-008・TS-009・TS-011〜TS-015・TS-017〜TS-020・TS-021 検査 pass（TS-021 は自変更対象パスのスライス実行。TS-019 は REQ-014/015 との整合確認）（証拠: TS-021(a)(c)(d) スライスと integrity suite 2639 pass / 0 fail〔PR 記録と同数〕を case-close で再実行し pass。TS-006/TS-009/TS-014 は durable state に個別定義が実在せず、AC別記録は Epic #3280 契約どおり Wave 3 検証フェーズ〔最終 close QG-4〕で集約。親 case-auto の completed-pr 独立検証済み）
- [x] 変更は PR として main へ merge 済みであること（完了証拠: Issue closed・PR merged）（証拠: PR #3287 を main へ squash merge 済み・本 Issue を closed へ遷移〔case-close DEL-3280-3〕）

## テスト戦略

<!-- テスト戦略: case-ready が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
- id: TS-001（自スコープスライス）
  target_item: AG-001（本 Issue 変更 workflow skill 分）
  verification: |
    本 Issue の変更対象 SKILL.md/references から主要判断の判断方法3分類の帰属を抽出し、正規所有契約上で判別できることを確認する。
  pass_criteria: |
    対象 workflow skill の主要判断の判断方法帰属が正規契約から判別できること。
  on_failure: |
    fix-and-reverify: 判別できない判断帰属を該当 REQ 行または判断記述へ追記して再検証する。
- id: TS-002（自スコープスライス）
  target_item: AG-002（本 Issue 変更 workflow skill 分）
  verification: |
    確定権限3分類判定表（v4-responsibility-boundaries Design）と突合し、対象 workflow skill の主要判断の確定権限境界が判別できることを確認する。
  pass_criteria: |
    主要判断の確定権限が判別できること。
  on_failure: |
    fix-and-reverify: 判定表の行を補完して再検証する。
- id: TS-007
  target_item: AG-006
  verification: |
    RA-005 適用後の Jev 適用判断節を確認し、閉包条件が REQ-096 参照へ整理され評価器固有形式（質問型、確信度、確率形式、評価器名）からの独立が維持されていることを確認する。
  pass_criteria: |
    閉包条件の正典が評価器非依存の形で REQ-096 に存在し、Jev 適用判断節が REQ-096 を参照すること。
  on_failure: |
    fix-and-reverify: 閉包条件の参照整理を修正して再検証する。
- id: TS-008
  target_item: AG-006
  verification: |
    対象 workflow skill 全体から「Jev」を検索し、恒久的な最終確定原則としての言及が REQ-090 の適用契約・DEC-044 の観測契約・DEC-046 の実行基盤の範囲に限定されていることを確認する（参照行・索引行は対象外）。
  pass_criteria: |
    Jev 逐次経路が実証・観測契約として識別され、恒久原則としての言及が 0件であること。
  on_failure: |
    fix-and-reverify: 該当言及を実証契約の位置づけへ修正して再検証する。
- id: TS-011
  target_item: AG-007
  verification: |
    agentdev-quality-gates の SKILL.md/references 更新後の文言を確認し、証拠・合否判定・乖離・失敗原因の分類を所有し、不合格のみで人間判断へ送る規則がなく、不合格後の修正を品質ゲートが所有していないことを確認する。
  pass_criteria: |
    品質ゲートの所有範囲が判定・原因分類に限定され、不合格→人間判断の直結規則が 0件であること。
  on_failure: |
    fix-and-reverify: 品質ゲートの記述を修正して再検証する。
- id: TS-021（自スコープスライス）
  target_item: AG-008（本 Issue 変更対象パス分）
  verification: |
    rg により本 Issue の変更対象 SKILL.md/references を検索し、(a) REQ-003-055/056 残存参照（移管記録行は対象外）、(c) 「一意に確定」中心の自律確定語彙、(d) REQ-090-024 旧閉包条件の直接列挙の残存を検出する。
  pass_criteria: |
    (a)(c)(d) の残存が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出残存を新モデル参照へ置換して再検証する。

## Execution Contract

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。
case-ready が新規 Issue 作成時に付与する必須セクション。
本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。
case-run は本セクション存在有無で新旧 Issue を識別する -->
### 統合先
- main

### 変更対象成果物
- skill: src/opencode/skills/agentdev-workflow-*/SKILL.md、src/opencode/skills/agentdev-workflow-*/references/*.md（判断規則記述・Jev 適用判断節）、src/opencode/skills/agentdev-quality-gates/**、src/opencode/skills/agentdev-workflow-orchestration/references/*.md

### 必須品質統制
- skill 変更: Skill 品質査読能力（agentdev-skill-authoring の品質基準。trigger 記述・構造・責務境界の維持）
- document 変更（references）: 文書品質査読能力（textlint 共通基盤）
- UTF-8 健全性: BOM なし・CR なし・U+FFFD なし（edit ツールまたは node の明示エンコーディング指定を使用）

### 関連 ADR 拘束条件
- DEC-048: 局所判断の所有は各ワークフローが維持。中央判断ルーター・共通判断台帳・評価器の動的振り分けを新設しない
- DEC-039: 副作用実行権限の境界 — commit/push/merge は既存の安全境界に従う
- REQ-090: Jev は Stage 1 観測契約 — 観測契約本文（custom-tool-contracts）は本 Issue で変更しない

### scope-affecting impact candidate
- Workflow Skill の判断規則記述変更は case-run/case-close の実行時判断（停止理由分類・自律確定判定）に影響し得る → TS-001/002/010〜018 スライスで帰属判別可能性を確認する
- Jev 適用判断節の参照整理は .agentdev/jev-observations/ の既存観測（識別子・意味）に影響しない（観測識別子の安定性契約）

### 実現面の変更方針（realization_actions 由来）

<!-- 実現面の変更方針: case-ready が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。 -->

- **RA-001**: concern: 12ワークフローと品質ゲートの判断規則ブロックの新モデル適用。responsibility: 各 Workflow Skill（agentdev-workflow-req-define、case-open、case-ready、case-run、case-auto、case-close、case-revise、intake-promote、learning-promote、inspect-promote、backlog-review）および agentdev-quality-gates の SKILL.md と references 配下の判断規則記述（HITL 境界、自律確定条件、停止理由、委譲契約）を新モデル（判断方法3分類・確定権限3分類・原因別処理）の語彙と基準へ書き換える。局所判断の所有は各ワークフローが維持する。ownership_hints: src/opencode/skills/agentdev-workflow-*/SKILL.md、src/opencode/skills/agentdev-workflow-*/references/*.md、src/opencode/skills/agentdev-quality-gates/**、src/opencode/skills/agentdev-workflow-orchestration/references/*.md。intent: 各ワークフローの局所判断規則を横断原則（REQ-096）に整合させ、状態ベースの引き上げ・一意性ベースの自律確定の残存を除去する。verification_refs: TS-001, TS-002, TS-011, TS-012, TS-013, TS-014, TS-015, TS-016, TS-017, TS-018。source_items: AG-007
- **RA-005**: concern: Workflow Skill の Jev 適用判断記述の参照整理。responsibility: 6系統 Workflow Skill（learning-promote、req-define、Epic/Wave 構成判断、intake-promote、inspect-promote、backlog-review）の Jev 適用判断単位の reference 記述のうち、閉包条件（REQ-090-024）を直接列挙する箇所を REQ-096 参照へ整理する。観測 JSON（.agentdev/jev-observations/）と .local/ 配下のファイルは他作業の状態として保護し、混入・削除・変更を行わない。ownership_hints: src/opencode/skills/agentdev-workflow-*/references/*.md の Jev 適用判断節。intent: 評価器固有語彙の上位露出を整理し、閉包条件の正典を REQ-096 に一元化する。verification_refs: TS-007, TS-008, TS-021。source_items: AG-006, AG-011

### adversarial-review 発動契約（任意）
- 該当なし（ユーザー明示指定なし）

## レビュー判断

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。
disposition 明細の重複転記は行わない。「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #3280 の「レビュー判断」セクションを参照すること。

## 補足情報

- 対象 Case: #3278（Root Case）。実行構造: Epic #3280 Wave 2-2（並列・前提 #3281）
- 保護対象: .agentdev/jev-observations/**、.local/**、ADF-COVERS 宣言行は変更時に削除しない（参照先更新のみ）
- 競合回避: Wave 2 の他子 Issue（#3282 = docs/**、#3284 = src/opencode/commands/**）とは変更対象ファイル集合が互いに素。RA-001 と RA-005 を同一子へ集約したのは同一ファイル族（agentdev-workflow-*）の競合回避が理由

<!-- PAYLOAD:issue-3283-body END -->

## PAYLOAD:comment-3283

<!-- PAYLOAD:comment-3283 BEGIN -->
## case-close 対応記録（Epic #3280 Wave 2 境界クローズ・DEL-3280-3）

PR #3287 を main へ squash merge し、完了条件チェックボックス 6/6 を成立させて本 Issue を close した。case-run（PR 本文検証差分）との差分で finding を分類する。

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-close | 完了条件チェックボックス評価（6項目） | 6/6 成立（最終条件「PR merge 済み」は本 merge で成立）。評価根拠は Issue 本文の各項へ簡記 | 既出 0 / 新規 0 |
| case-close | 配布依存境界 最終 gate（E4-1・source profile） | pass（check_distribution_boundary.ts --profile source --root .worktrees/3283-docs。failures 0・scanned 359・concrete 系 hits すべて 0。PR 記録と同数） | 既出 0 / 新規 0 |
| case-close | integrity suite（bun test ./.opencode/skills/repo-agentdev-integrity/scripts/・worktree 3283） | pass（2639 pass / 0 fail・6768 expect・107 files。PR 記録と同数） | 既出 0 / 新規 0 |
| case-close | textlint 共通基盤（gate.ts --root .worktrees/3283-docs） | pass（hard violations 0） | 既出 0 / 新規 0 |
| case-close | UTF-8 健全性（変更 35 ファイルの BOM/CR/U+FFFD 決定的検査） | pass（0件） | 既出 0 / 新規 0 |
| case-close | TS-021 スライス再実行（(a) REQ-003-055/056・(c) 一意に確定/一意に回答可能・(d) 旧閉包条件列挙） | pass（(a)(c) 0件。(d) は「閉包条件」18箇所〔6系統×3〕がすべて REQ-{NNNN} プレースホルダ + Design 正典節参照形式・旧直接列挙 0件） | 既出 0 / 新規 0 |
| case-close | トレーサビリティ独立再検査（check --req REQ-090-024 + REQ-096-001〜030・worktree と main baseline 突合） | missing-design は pass（0件）。missing-implementation は main 25行 → worktree 8行（REQ-096-010/014/021/025/027/028/029/030・すべて baseline 既存・新規増分 0・本 Issue 対象範囲外）。missing-verification 30行は baseline から不変（先行状態） | 既出（missing-implementation 8行・missing-verification 30行）/ 新規 0 |
| case-close | 完了条件第5項の評価注記 | TS-006/TS-009/TS-014 は durable state に個別定義が実在せず、AC別記録は Epic 契約どおり Wave 3 検証フェーズ（最終 close QG-4）で集約（PR 検証差分の明細対象外・親 case-auto completed-pr 独立検証済み） | 新規 0（評価注記・不合格なし） |
| case-close | Design 状態評価（E4-3・棚卸し制） | PR 本文申告「Design確定候補: なし」を確認。Wave 内統合候補 0件のため 0件確認を記録（昇格対象なし） | 新規 0 |

Capture 回収: REQ-096 missing-verification 全行残存・missing-implementation 8行残余の整理 → .agentdev/intake/inbox/2026-10-01-3287-req096-verification-artifacts-and-implementation-remainder.md（intake・PR #3288 Findings と統合）、link profile の worktree zero-targets / host root 実行可の運用知見 → .agentdev/learning/inbox.md（learning）。

備考: merge 後 main の横断検証（full integrity suite・AUTOGEN 鮮度・link profile 含む配布依存境界）は Epic #3280 Wave 3（検証フェーズ・最終 close QG-4）の正規スコープ。
<!-- PAYLOAD:comment-3283 END -->

## PAYLOAD:issue-3284-body

<!-- PAYLOAD:issue-3284-body BEGIN -->
Parent: #3280

<!-- Parent 配置正規形: 子Issue 本文の先頭行に Parent: #N を配置する（agentdev-epic-tracker 親Epic検出、case-open 不変条件と整合）。 -->

## 概要

Wave 2（並列）: RA-002「配布 command 定義の HITL・自律確定・状態ベース表現の更新」を実装する。OU-004（REQ-002 正典宣言・DEC-039/DEC-036 更新）の実現面に相当し、配布物と正典（REQ-096）の判断境界表現の一致を担保する。

## 実行識別情報

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3280
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲

- src/opencode/commands/agentdev/intake-promote.md
- src/opencode/commands/agentdev/learning-promote.md
- src/opencode/commands/agentdev/inspect-promote.md
- src/opencode/commands/agentdev/backlog-review.md
- src/opencode/commands/agentdev/case-auto.md
- src/opencode/commands/agentdev/req-define.md

（各ファイルの HITL・自律確定・停止条件の表現を持つ部分が対象。command 定義の構造・工程・frontmatter は変更しない）

## REQ参照

REQ-002

関連: REQ-096、DEC-048、v4-responsibility-boundaries Design

## 提案内容

配布物と正典（REQ-096）の判断境界表現の一致を担保する。HITL・自律確定・停止条件の表現を新モデル（判断方法3分類・確定権限3分類・原因別処理）へ更新する。表現更新のみで command の工程構造・入出力契約は変更しない（委譲された裁量の範囲）。

## 完了条件

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
- [x] 6件の command 定義の HITL・自律確定・停止条件表現が新モデル語彙へ更新されていること（工程構造・frontmatter・入出力契約は無変更）（証拠: PR #3288 変更 9 ファイル〔commands 6 + README + sidecar 2〕の適用を case-close 再読で確認。frontmatter 無変更）
- [x] command 定義内の判断境界表現が正典（REQ-096・v4-responsibility-boundaries Design）と一致していること（証拠: REQ-096 判定表基準との語彙一致を PR #3288 差分と検証差分で確認。REQ-034-038〔#3282〕との合流後一致は PR 本文 Findings 記録どおり）
- [x] 自スコープの TS-003・TS-021 検査 pass（TS-021 は自変更対象パスのスライス実行）（証拠: TS-003・TS-021(a)(c) スライスを case-close で再実行し残存 0件を確認〔frontmatter description の「高確信度」は intake 記録済みの既知残余・frontmatter 無変更制約〕）
- [x] 変更は PR として main へ merge 済みであること（完了証拠: Issue closed・PR merged）（証拠: PR #3288 を main へ squash merge 済み・本 Issue を closed へ遷移〔case-close DEL-3280-3〕）

## テスト戦略

<!-- テスト戦略: case-ready が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
- id: TS-003（自スコープスライス）
  target_item: AG-002（本 Issue 変更 command 定義分）
  verification: |
    rg により本 Issue の変更対象 command 定義を検索し、難易度・確信度・結果状態・意味判断であること・一意解でないことだけを理由に人間判断を要求する規則の残存を検出する。原因・権限に基づく引き上げ条件は対象外。
  pass_criteria: |
    状態のみを理由とする人間判断要求規則が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出行を原因別処理または確定権限判定に基づく文言へ修正して再検証する。
- id: TS-021（自スコープスライス）
  target_item: AG-008（本 Issue 変更対象パス分）
  verification: |
    rg により本 Issue の変更対象 command 定義を検索し、(a) REQ-003-055/056 残存参照（移管記録行は対象外）、(c) 「一意に確定」中心の自律確定語彙の残存を検出する。
  pass_criteria: |
    (a)(c) の残存が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出残存を新モデル参照へ置換して再検証する。

## Execution Contract

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。
case-ready が新規 Issue 作成時に付与する必須セクション。
本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。
case-run は本セクション存在有無で新旧 Issue を識別する -->
### 統合先
- main

### 変更対象成果物
- command: src/opencode/commands/agentdev/{intake-promote,learning-promote,inspect-promote,backlog-review,case-auto,req-define}.md

### 必須品質統制
- command 変更: Command 品質能力（agentdev-command-authoring の品質基準。frontmatter・工程構造・DoD の維持）
- document 変更: 文書品質査読能力（textlint 共通基盤）
- UTF-8 健全性: BOM なし・CR なし・U+FFFD なし（edit ツールまたは node の明示エンコーディング指定を使用）

### 関連 ADR 拘束条件
- DEC-048: HITL 境界表現は正典（REQ-096・判定表）と一致させる。状態ベース引き上げを残存させない
- DEC-039: 副作用実行権限の境界 — commit/push/merge は既存の安全境界に従う

### scope-affecting impact candidate
- command 定義は配布物であり、consumer project への配布整合（src/opencode/commands/README.md の索引）へ影響し得る → 工程追加が無い場合も README 記載との整合を確認する
- case-auto.md の停止理由分類表現の更新は case-auto orchestration の停止伝播に影響し得る → REQ-034-038（Wave 2-1 で更新）との語彙一致を確認する

### 実現面の変更方針（realization_actions 由来）

<!-- 実現面の変更方針: case-ready が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。 -->

- **RA-002**: concern: 配布 command 定義の HITL・自律確定・状態ベース表現の更新。responsibility: src/opencode/commands/agentdev/*.md のうち HITL・自律確定・停止条件の表現を持つ command 定義（intake-promote、learning-promote、inspect-promote、backlog-review、case-auto、req-define 等）の当該表現を新モデルへ更新する。ownership_hints: src/opencode/commands/agentdev/intake-promote.md、src/opencode/commands/agentdev/learning-promote.md、src/opencode/commands/agentdev/inspect-promote.md、src/opencode/commands/agentdev/backlog-review.md、src/opencode/commands/agentdev/case-auto.md、src/opencode/commands/agentdev/req-define.md。intent: 配布物と正典（REQ-096）の判断境界表現の一致を担保する。verification_refs: TS-003, TS-021。source_items: AG-007, AG-008

### adversarial-review 発動契約（任意）
- 該当なし（ユーザー明示指定なし）

## レビュー判断

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。
disposition 明細の重複転記は行わない。「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #3280 の「レビュー判断」セクションを参照すること。

## 補足情報

- 対象 Case: #3278（Root Case）。実行構造: Epic #3280 Wave 2-3（並列・前提 #3281）
- 保護対象: .agentdev/jev-observations/**、.local/**、ADF-COVERS 宣言行は変更時に削除しない（参照先更新のみ）
- 競合回避: Wave 2 の他子 Issue（#3282 = docs/**、#3283 = src/opencode/skills/**）とは変更対象ファイル集合が互いに素

<!-- PAYLOAD:issue-3284-body END -->

## PAYLOAD:comment-3284

<!-- PAYLOAD:comment-3284 BEGIN -->
## case-close 対応記録（Epic #3280 Wave 2 境界クローズ・DEL-3280-3）

PR #3288 を main へ squash merge し、完了条件チェックボックス 4/4 を成立させて本 Issue を close した。case-run（PR 本文検証差分）との差分で finding を分類する。

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-close | 完了条件チェックボックス評価（4項目） | 4/4 成立（最終条件「PR merge 済み」は本 merge で成立）。評価根拠は Issue 本文の各項へ簡記 | 既出 0 / 新規 0 |
| case-close | 配布依存境界 最終 gate（E4-1・source profile） | pass（check_distribution_boundary.ts --profile source --root .worktrees/3284-docs。failures 0・scanned 359。PR 記録と同数） | 既出 0 / 新規 0 |
| case-close | 配布依存境界 link profile（case-run 未実行分の追試） | worktree は zero-targets:link（junction 非展開・環境制約により検査不能）。host root（メインリポジトリ）では実行可能: failures 0・scanned 359（merge 前状態）。merge 後の投影 sync 後再実行は Wave 3 最終 close の正規スコープとして記録（不合格確定ではない） | 既出 1（link profile 未実行・本実行で追試記録）/ 新規 0 |
| case-close | textlint 共通基盤（gate.ts --root .worktrees/3284-docs） | pass（hard violations 0） | 既出 0 / 新規 0 |
| case-close | UTF-8 健全性（変更 9 ファイルの BOM/CR/U+FFFD 決定的検査） | pass（0件） | 既出 0 / 新規 0 |
| case-close | TS-003・TS-021 スライス再実行（rg・変更 command 定義 6 件） | pass（状態理由の人間判断要求 0件・(a)(c) 0件。frontmatter description の「高確信度」は intake 記録済みの既知残余） | 既出 1（frontmatter 高確信度）/ 新規 0 |
| case-close | トレーサビリティ独立再検査（check --req REQ-096-015/018/020/023/024・worktree と main baseline 突合） | missing-design pass・missing-implementation は main 4行 → worktree 0行（sidecar 宣言追加で解消・PR 記録と整合）。missing-verification 5行は baseline から不変（先行状態） | 修正済み（REQ-096-015/020/023/024 の missing-implementation 解消〔REQ-096-018 は baseline で既に解消済み〕）/ 既出（missing-verification 5行） |
| case-close | Design 状態評価（E4-3・棚卸し制） | PR 本文申告「Design確定候補: なし」を確認。Wave 内統合候補 0件のため 0件確認を記録（昇格対象なし） | 新規 0 |

Capture 回収: inspect-promote.md frontmatter「高確信度」→ .agentdev/intake/inbox/2026-10-01-3288-inspect-promote-frontmatter-confidence-term.md（intake）、src-opencode-correction.yaml component 再編 → .agentdev/intake/inbox/2026-10-01-3288-traceability-sidecar-component-reorganization.md（intake）、REQ-096 検証対応・実現面残余は #3287 分と統合のうえ intake 記録済み。

備考: merge 後 main の横断検証（full integrity suite・AUTOGEN 鮮度・link profile 含む配布依存境界）は Epic #3280 Wave 3（検証フェーズ・最終 close QG-4）の正規スコープ。
<!-- PAYLOAD:comment-3284 END -->

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

<!-- PAYLOAD:epic-3280-body END -->
