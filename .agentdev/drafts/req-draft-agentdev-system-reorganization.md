<!--
draft-meta
work_type: feature
scale: large
req-operation: mixed
adr-required: true
topic-slug: agentdev-system-reorganization
status: saved
epic_context_ru: RU-0001
source_rus:
  - RU-0001 (Epic context, not Issue-ized)
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-20260616-01
  - RU-20260616-02
  - RU-20260616-03
context_memo: MEMO-20260616-01.md (non-authoritative, RU本文優先)
-->

## 目的

AgentDevFlow の文書体系・ワークフロー・実行アーキテクチャを再編成し、薄い command、再利用 skill、機械検査、外部実行バックエンドを接続する self-hosting workflow system を確立する。

現行体系は以下の問題を持つ: REQ の分類階層が未確立で巨大受け皿 REQ が混在している、command 単位の責務所有が不明確である、移行・改名・廃止の完了状態が active REQ の主題として残っている、品質ゲートが体系化されていない、case-run が実装詳細を抱え込んでいる、docs 全体に旧構造・旧語彙・未実装仕様が残っている。

本要件docは、これらを包括的に解消する10個の操作単位（OU）を定義し、依存関係に基づく実行ウェーブ構造を提供する。RU-0001（REQ体系全体の再編成）は Epic 相当の統合コンテキストとして扱い、具体作業は子RUで分担する。

## 要件

### OU-01: REQ分類・粒度ルール確定（RU-0002）

| ID | 要件 |
|---|---|
| OU-01-001 | active REQ の各ファイルが、文書統治REQ、ワークフロー全体REQ、command-level REQ、artifact/runtime/skill責務REQ、validation/inspection REQ、ADR lifecycle REQ のいずれかの分類に属し、関心対象の総体として説明できること |
| OU-01-002 | 新規REQ作成基準が「既存active REQに吸収できない独立関心対象」に限定され、文書化されていること |
| OU-01-003 | command-level REQ が、公開commandの入力・出力・副作用境界・停止条件・他commandとの接続を持つ単位として定義されていること |
| OU-01-004 | SPECに置くべき schema/lifecycle/command topology/rule catalog/fixture detail を active REQ から切り出す基準が定義されていること |
| OU-01-005 | retire候補判定基準が、バグ修正由来・移行完了状態・他REQ吸収済み・作業手段主題の4類型で文書化されていること |
| OU-01-006 | SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT が inspect-docs 診断観点に加え、REQ運用品質維持の恒常的基準として参照可能であること |
| OU-01-007 | REQ-0116 の恒久分類内容が REQ-0101 + document-model に吸収され、REQ-0116 の単独REQ維持の必要性が再評価されていること |

### OU-02: ワークフロー全体REQ + command map確立（RU-0003）

| ID | 要件 |
|---|---|
| OU-02-001 | 全公開commandが、主フロー・最大自走入口・補助フロー・検出フロー・repo-local検査のいずれかに分類されていること |
| OU-02-002 | case-auto が標準フローを置換しない追加入口として位置づけられていること |
| OU-02-003 | REQ-0123 の題名・内容・関心対象が一致し、workflow-lifecycle 責務分界またはskill配置責務として読めること |
| OU-02-004 | workflow-contracts.md と REQ側の説明に矛盾がないこと |
| OU-02-005 | REQ が保証・制約・責務境界を持ち、詳細なI/O表やphase説明が SPEC 側に置かれていること |

### OU-03: req/case/intake/learning/backlog系 command REQ分割・再配置（RU-0004）

| ID | 要件 |
|---|---|
| OU-03-001 | req-define と req-save のREQ責務が分離または明確に区画化されていること |
| OU-03-002 | case-open が command-level REQ として明確化され、REQ-0104 内のcase-open詳細が移管されていること |
| OU-03-003 | case-run と case-close が別REQに分割され、完了ゲート・PR/Issue・post-run capture・worktree cleanup の所有先が明確化されていること |
| OU-03-004 | case-update の command-level REQ 所有先が確立されていること |
| OU-03-005 | REQ-0105 が intake-capture/intake-from-github、intake-promote、learning-promote、backlog-review、RU lifecycle を一体で抱え込まない構造になっていること |
| OU-03-006 | REQ-0114 が case-auto の orchestration/stopping boundary/input resolution に縮約され、各工程詳細が各command REQへ委譲されていること |
| OU-03-007 | 15公開commandのうち各 /agentdev/* command が明確なREQ所有先を持つこと |
| OU-03-008 | command REQ に SPEC schema や内部ファイル構造の詳細が過剰に残っていないこと |
| OU-03-009 | case-open/case-run/case-close/case-update の責務が断絶せず、主フロー内で接続していること |

### OU-04: 文書統治・ADR・artifact・runtime/skill責務の横断REQ統合（RU-0005）

| ID | 要件 |
|---|---|
| OU-04-001 | 文書分類定義の一次所有先が REQ-0101 + document-model に統一されていること |
| OU-04-002 | REQ-0112 が ADR lifecycle / ADR運用品質維持に絞られ、runtime独立性・work_type・command薄型化・state model が他REQ/SPECへ切り出されていること |
| OU-04-003 | REQ-0113 が Skill References SPEC分離基準として維持され、Epic追跡等の作業管理表現が除かれていること |
| OU-04-004 | REQ-0118 の edit safety 制約が REQ-0119 または REQ-0103 に吸収され、REQ-0118 の単独維持または退役判断が明示されていること |
| OU-04-005 | REQ-0119 が責務分界REQとして維持され、履歴・retired理由・ADR status作業結果が外されていること |
| OU-04-006 | REQ-0120 が Runtime Command Authoring 制約として REQ-0119/0103 へ統合されるか小REQとして再位置づけされていること |
| OU-04-007 | REQ-0121 が退役候補として評価され、runtime語彙部分が REQ-0120/0119 へ、integrity検査部分が REQ-0108 へ移管されていること |
| OU-04-008 | command/skill/subagent責務境界が REQ-0119 または SPEC で一貫していること |

### OU-05: docs-check / inspect-* / integrity系REQ再編（RU-0006）

| ID | 要件 |
|---|---|
| OU-05-001 | REQ-0108 が /repo/docs-check の恒久的な検査責務に絞られ、rule catalog・fixture・false positive抑制・checker実装詳細が SPEC/skill reference/script docs へ切り出されていること |
| OU-05-002 | REQ-0109 が inspect-docs command REQ として維持され、REQ体系意味レビュー・分類整合・再構成finding に絞られていること |
| OU-05-003 | inspect-skills と inspect-promote の command-level REQ 所有先が確立されていること |
| OU-05-004 | REQ-0115 の恒久要件が /repo/docs-check と inspect-docs へ移管され、退役候補として処理されていること |
| OU-05-005 | REQ-0124 が inspect命名の恒久制約だけを残し、改名完了記録・旧名除去作業が退役/Update Notes/mapping へ移されていること |
| OU-05-006 | active REQタイトルに docs-* command suite や diagnostics-* → inspect-* 完全直接移行 のような移行主題が残っていないこと |
| OU-05-007 | /repo/docs-check、inspect-docs、inspect-skills、inspect-promote の責務境界が重複しないこと |
| OU-05-008 | docs-check が意味レビューを代替せず、inspect-docs が機械検査を代替しないこと |
| OU-05-009 | 旧語検出が恒久的な検査要件として表現され、過去の改名作業そのものがREQ主題になっていないこと |

### OU-06: retire/merge/index/mapping-table/docs-check整合の完了（RU-0007）

| ID | 要件 |
|---|---|
| OU-06-001 | REQ-0110 と REQ-0117 が worktree cleanup信頼性として統合され、単独REQ維持の必要性が再評価されていること |
| OU-06-002 | 後続OUで吸収済みになったREQ（REQ-0115, REQ-0116, REQ-0118, REQ-0121, REQ-0124等）が retired へ移されていること |
| OU-06-003 | retired理由が mapping-table/retired文書/Update Notes に置かれ、active REQ本文の主題になっていないこと |
| OU-06-004 | active REQ一覧・範囲・タイトル・概要が AGENTS.md、docs index、DOC-MAP、requirements/README で全て一致していること |
| OU-06-005 | rule ownership / req-impact-map が再編後のREQ所有に合わせて更新されていること |
| OU-06-006 | docs-check/integrity検査で、再編に起因する stale REQ range・旧command名・壊れたリンク・retired参照が残らないこと |

### OU-07: ADR体系再編成（RU-0008）

| ID | 要件 |
|---|---|
| OU-07-001 | ADR-0113 の status が deprecated であり、現行判断の根拠として読めないこと |
| OU-07-002 | diagnostics-* → inspect-* について新規ADRが作成されていないこと |
| OU-07-003 | inspect-* の現行状態が REQ/SPEC 側に残り、ADR-0113 に依存しないこと |
| OU-07-004 | ADR-0110 の主題が DOC-MAP採用判断として読め、requirements/views廃止 が作業手段・結果として扱われていること |
| OU-07-005 | ADR README の Current Baseline View が accepted ADR のみを現行根拠として含み、superseded/deprecated ADR が混入していないこと |
| OU-07-006 | accepted ADR の一覧・status view・topic view・relation table が ADR本文 frontmatter と矛盾しないこと |
| OU-07-007 | 非 accepted ADR への参照が履歴参照として扱われ、現行根拠参照と混同されないこと |
| OU-07-008 | accepted ADR に削除・廃止・移行・完全削除そのものを主題にしたものが残っていないこと |

### OU-08: OMO委譲による実装計画・レビュー外部化とagentdev実行バックエンド境界（RU-20260616-01）

| ID | 要件 |
|---|---|
| OU-08-001 | case-run が1 Issue単位で外部実行バックエンド driver subagent に委譲すること |
| OU-08-002 | 外部実行バックエンド driver の adapter protocol を定義する独立 skill が存在すること |
| OU-08-003 | case-run 本体の責務が、Issue解決・worktree前提・複数Issue/Epic順序制御・driver起動・driver結果処理に整理されていること |
| OU-08-004 | driver result が completed(pr) / blocked / failed の3状態で定義されていること |
| OU-08-005 | completed(pr) が PR番号を伴うこと |
| OU-08-006 | case-run の成功成果が PR作成であること |
| OU-08-007 | blocked/failed の詳細本文が Issueコメントに SSoT として記録されること |
| OU-08-008 | driver が ADR/REQ/SPEC/docs/Issue本文/repository context を再確認し、回答可能な blocker を自律的に外部実行バックエンドへ差し戻せること |
| OU-08-009 | repository context で回答不能な blocker が Issueコメントに構造化して記録されること |
| OU-08-010 | Issue完了条件チェックボックスの評価・更新が、PR作成後に case-close が別コンテキストで行う責務として定義されていること |
| OU-08-011 | case-run・driver subagent・外部実行バックエンドが Issue本文の完了条件チェックボックスを更新する責務を持たないこと |
| OU-08-012 | Findings/Capture候補が存在する場合、PR本文に記述されること |
| OU-08-013 | case-close が引き続き PR本文を capture 入力源として扱い、Issue本文の完了条件を再読込して最終完了判定すること |
| OU-08-014 | 外部実行バックエンド側の plan artifact が agentdev から不透明な外部成果物として扱われること |
| OU-08-015 | 複数Issue/Epic Issue の orchestration が agentdev 側に残っていること |

### OU-09: agentdev-quality-gates 新設と agentdev-spec-compliance 削除（RU-20260616-02）

| ID | 要件 |
|---|---|
| OU-09-001 | docs/specs/quality-gates.md が新設され、QG-1〜QG-4の品質ゲートと機械化境界が定義されていること |
| OU-09-002 | agentdev-quality-gates skill が新設され、QG-1〜QG-4 の reference を持つこと |
| OU-09-003 | agentdev-spec-compliance skill ディレクトリが削除されていること |
| OU-09-004 | report_spec_compliance.md が削除されていること |
| OU-09-005 | active REQ/SPEC/command/skill から agentdev-spec-compliance を現行要求・現行仕様として扱う記述が削除または置換されていること |
| OU-09-006 | case-run の QG-3 が PR作成直前の実装充足・乖離ゲートに限定されていること |
| OU-09-007 | case-run の QG-3 から品質メトリクス収集・docs/全体grep・Document Classification Policy全体確認・case-update連携が除去されていること |
| OU-09-008 | Issue本文の完了条件チェックボックス評価・更新が case-close の責務として明記され、case-run に残っていないこと |
| OU-09-009 | case-open に QG-2、req-define/req-save に QG-1、case-close に QG-4 が明示されていること |
| OU-09-010 | case-auto が QG を再実装せず、構成コマンドのQGを継承する設計になっていること |
| OU-09-011 | active source/docs のgrepで、現行参照としての agentdev-spec-compliance/spec-compliance/report_spec_compliance.md が残っていないこと |
| OU-09-012 | docs/specs/quality-gates.md が DOC-MAP/specs README/rule ownership に登録されていること |

### OU-10: docs全体の再基準化・再発防止（RU-20260616-03）

| ID | 要件 |
|---|---|
| OU-10-001 | active docs が現行仕様だけを説明し、廃止済み機能・旧構造・検討経緯を現行仕様本文として保持しないこと |
| OU-10-002 | docs/specs/* が現在有効な仕様だけを、読みやすい日本語・明確な章立て・必要最小限のトレース情報で記述していること |
| OU-10-003 | SPEC に過去前提・移行経緯・将来予定・未実装予定・検討過程が混入していないこと |
| OU-10-004 | 英語用語が文脈上の実体に基づく自然な日本語に書き直され、内部処理段階名が上位docs本文に露出していないこと |
| OU-10-005 | 品質メトリクスの未実装契約が docs/specs/quality-specs.md および関連テンプレートから削除または現行実装に一致する形へ整理されていること |
| OU-10-006 | 原本（src/opencode/）と配置先（.opencode/）の用語が docs 全体で統一されていること |
| OU-10-007 | docs/README.md、docs/DOC-MAP.md、guides が入口・索引として整理され、REQ/ADR/SPEC本文を重複して保持していないこと |
| OU-10-008 | case-run の提出説明から Issue本文チェックボックス更新責務が外れ、case-close の完了判定へ整理されていること |
| OU-10-009 | req-define/req-save/case-run/case-close/inspect-docs/docs-check/関連スキル・テンプレートに、同種問題を再発させない確認観点が組み込まれていること |
| OU-10-010 | repo-agentdev-integrity の vocabulary registry/check rule/regression test に、旧記述パターンが反映されていること |
| OU-10-011 | 永続 docs に RU-ID を根拠として残していないこと |
| OU-10-012 | SPEC本文の過剰な REQ-ID 注記・HTMLコメントが削除または大幅に削減されていること |

## 適用範囲

- **対象**:
  - active REQ 22件（REQ-0101〜REQ-0124、REQ-0111/0122 retired除く）の分類・分割・統合・退役・再配置
  - active ADR 13件（ADR-0101〜ADR-0113）の status変更・主題圧縮・README整合
  - docs/specs/* 全体の再基準化・用語統一・可読性改善
  - docs/guides/*・docs/README.md・docs/DOC-MAP.md の整理
  - src/opencode/commands/agentdev/* の責務再編・品質ゲート参照追加
  - src/opencode/skills/agentdev-* の新設・削除・参照更新
  - .opencode/skills/repo-agentdev-integrity/ の検出ルール・語彙登録更新
  - 新規SPEC（quality-gates.md）・新規skill（agentdev-quality-gates, agentdev-execution-backend）の作成
  - 新規ADR（case-run実行バックエンド委譲）の作成
  - AGENTS.md・docs/requirements/README.md・mapping-table.md・req-impact-map.md・rule-ownership.md の索引更新
- **対象外**:
  - 外部実行バックエンド（OMO）本体の実装
  - OMO内部 plan artifact 構造の定義
  - retired REQ/ADR の本文書き換え（履歴領域として保持）
  - docs-check/integrity 以外のCI/CD基盤変更

## Requirement Source

- `.agentdev/backlog/req-units/RU-0001.md`（Epic context: REQ体系全体の再編成）
- `.agentdev/backlog/req-units/RU-0002.md`（REQ分類・粒度ルール確定）
- `.agentdev/backlog/req-units/RU-0003.md`（ワークフロー全体REQ + command map）
- `.agentdev/backlog/req-units/RU-0004.md`（command REQ分割・再配置）
- `.agentdev/backlog/req-units/RU-0005.md`（横断統治REQ統合）
- `.agentdev/backlog/req-units/RU-0006.md`（inspect/integrity系REQ再編）
- `.agentdev/backlog/req-units/RU-0007.md`（retire/merge/index整合）
- `.agentdev/backlog/req-units/RU-0008.md`（ADR体系再編成）
- `.agentdev/backlog/req-units/RU-20260616-01.md`（OMO委譲・実行バックエンド境界）
- `.agentdev/backlog/req-units/RU-20260616-02-quality-gates.md`（quality-gates新設・spec-compliance削除）
- `.agentdev/backlog/req-units/RU-20260616-03-docs-current-state-rebaseline-and-maintenance-contextual.md`（docs再基準化）
- `.agentdev/backlog/req-units/MEMO-20260616-01.md`（非権威補足コンテキスト、RU本文優先）

## 関連ドキュメント更新候補

### REQ ファイル（UPDATE/RETIRE/CREATE対象）

| REQ | 操作 | 担当OU |
|---|---|---|
| REQ-0101 | UPDATE（分類階層追加、REQ-0116吸収、active docs現行仕様化） | OU-01, OU-04, OU-10 |
| REQ-0102 | UPDATE（req-define/req-save責務分離、QG-1参照） | OU-03, OU-09 |
| REQ-0103 | UPDATE（配布物用語、artifact責務、edit safety吸収） | OU-04, OU-10 |
| REQ-0104 | UPDATE（ワークフロー全体REQ再定義、case-open詳細移管、case-run実行委譲） | OU-02, OU-03, OU-08 |
| REQ-0105 | SPLIT（intake/learning/backlog/RU lifecycle 分離） | OU-03 |
| REQ-0106 | SPLIT（case-run / case-close 分離、QG-3/QG-4、完了条件チェックボックス責務） | OU-03, OU-08, OU-09 |
| REQ-0107 | UPDATE | OU-03 |
| REQ-0108 | UPDATE（/repo/docs-check検査責務に絞る、旧語検出、SPEC可読性診断追加） | OU-05, OU-10 |
| REQ-0109 | UPDATE（inspect-docs command REQ化、SPLIT/MERGE等の恒常基準化） | OU-01, OU-05 |
| REQ-0110 | MERGE（REQ-0117と統合 → worktree cleanup信頼性） | OU-06 |
| REQ-0112 | UPDATE（ADR lifecycle に絞る） | OU-04 |
| REQ-0113 | UPDATE（Epic追跡表現除去） | OU-04 |
| REQ-0114 | UPDATE（orchestration/stopping/input に縮約） | OU-02, OU-03 |
| REQ-0115 | RETIRE（恒久要件をREQ-0108/0109へ移管後退役） | OU-05, OU-10 |
| REQ-0116 | RETIRE（REQ-0101へ吸収後退役） | OU-01, OU-04, OU-10 |
| REQ-0117 | MERGE（REQ-0110へ統合） | OU-06 |
| REQ-0118 | ABSORB/RETIRE（REQ-0119/0103へ吸収） | OU-04 |
| REQ-0119 | UPDATE（責務分界REQ維持、履歴除去） | OU-04 |
| REQ-0120 | ABSORB/REPOSITION（REQ-0119/0103へ統合または小REQ化） | OU-04 |
| REQ-0121 | RETIRE（語彙→REQ-0120/0119、integrity→REQ-0108） | OU-04 |
| REQ-0123 | UPDATE（題名・内容・関心対象の一致） | OU-02 |
| REQ-0124 | UPDATE/RETIRE（inspect命名恒久制約のみ残す） | OU-05 |
| case-open (新規) | CREATE（command-level REQ） | OU-03 |
| case-update (新規) | CREATE（command-level REQ） | OU-03 |
| case-run (新規/分割) | CREATE/SPLIT（REQ-0106から分割） | OU-03, OU-08 |
| case-close (新規/分割) | CREATE/SPLIT（REQ-0106から分割） | OU-03, OU-08 |
| inspect-skills (新規) | CREATE（command-level REQ） | OU-05 |
| inspect-promote (新規) | CREATE（command-level REQ） | OU-05 |

### ADR ファイル

| ADR | 操作 | 担当OU |
|---|---|---|
| ADR-0113 | UPDATE（status → deprecated） | OU-07 |
| ADR-0110 | UPDATE（主題をDOC-MAP採用判断に圧縮） | OU-07 |
| ADR README | UPDATE（Current Baseline View修正、superseded/deprecated分離） | OU-07 |
| 新規ADR（case-run実行バックエンド委譲） | CREATE | OU-08 |

### SPEC ファイル

| SPEC | 操作 | 担当OU |
|---|---|---|
| document-model.md | UPDATE（REQ分類軸、文書種別責務、SPEC書き方基準） | OU-01, OU-04, OU-10 |
| workflow-contracts.md | UPDATE（command分類map、用語統一） | OU-02, OU-10 |
| quality-gates.md | CREATE（QG-1〜QG-4、機械化境界） | OU-09 |
| system.md | UPDATE（RU候補→RU フロー、用語統一、完了条件責務） | OU-10 |
| quality-specs.md | UPDATE（未実装メトリクス削除） | OU-09, OU-10 |
| integrity-contracts.md | UPDATE（現行検査契約のみ） | OU-10 |
| integrity-rule-catalog.md | UPDATE | OU-05, OU-10 |
| artifact-contracts.md | UPDATE | OU-04, OU-10 |
| artifact-responsibilities.md | UPDATE | OU-04, OU-10 |
| design-principles.md | UPDATE（機械化境界参照） | OU-09, OU-10 |
| patterns.md | UPDATE | OU-10 |
| rule-ownership.md | UPDATE（再編後REQ所有、quality-gates domain） | OU-06, OU-09 |
| runtime-package-boundary.md | UPDATE | OU-04, OU-10 |
| req-impact-map.md | UPDATE（再編後REQ対応） | OU-06 |
| specs/README.md | UPDATE（quality-gates.md追加） | OU-09 |

### Command ファイル

| Command | 操作 | 担当OU |
|---|---|---|
| case-run.md | UPDATE（実行バックエンド委譲、QG-3参照、spec-compliance除去、完了条件チェックボックス責務分離） | OU-08, OU-09, OU-10 |
| case-close.md | UPDATE（QG-4参照、完了条件チェックボックス評価責務） | OU-08, OU-09, OU-10 |
| case-open.md | UPDATE（QG-2参照） | OU-09 |
| case-auto.md | UPDATE（case-run新境界追従、QG継承） | OU-08, OU-09 |
| case-update.md | UPDATE（spec-compliance参照除去） | OU-09 |
| req-define.md | UPDATE（QG-1参照、関連docs更新候補評価） | OU-09, OU-10 |
| req-save.md | UPDATE（QG-1参照、docs分類確認） | OU-09, OU-10 |
| inspect-docs.md | UPDATE（再発防止確認観点） | OU-10 |

### Skill ファイル

| Skill | 操作 | 担当OU |
|---|---|---|
| agentdev-quality-gates/ | CREATE（QG-1〜QG-4 reference） | OU-09 |
| agentdev-execution-backend/ | CREATE（driver adapter protocol） | OU-08 |
| agentdev-spec-compliance/ | DELETE | OU-09 |
| agentdev-workflow-orchestration/ | UPDATE（Epic vs 1-Issue OMO委譲境界） | OU-08 |
| agentdev-workflow-templates/ | UPDATE（品質メトリクス必須セクション削除） | OU-09, OU-10 |
| agentdev-no-ai-slop-writing/ | UPDATE（SPEC/Guide適用拡張） | OU-10 |
| agentdev-doc-map/ | UPDATE（旧参照除去） | OU-09, OU-10 |
| その他 agentdev-* skills | UPDATE（spec-compliance参照除去） | OU-09 |
| repo-agentdev-integrity/ | UPDATE（vocabulary registry、検出ルール、regression test） | OU-10 |

### 索引・ナビゲーション

| ファイル | 操作 | 担当OU |
|---|---|---|
| AGENTS.md | UPDATE（active REQ範囲、用語統一） | OU-06, OU-10 |
| docs/README.md | UPDATE（REQ一覧、用語統一） | OU-06, OU-10 |
| docs/DOC-MAP.md | UPDATE（quality-gates.md追加、旧参照除去） | OU-06, OU-09, OU-10 |
| docs/requirements/README.md | UPDATE（REQ一覧・範囲・分類） | OU-06 |
| docs/requirements/mapping-table.md | UPDATE（退役REQの移行判定） | OU-06 |
| docs/guides/*.md | UPDATE（用語統一、コマンドフロー説明、完了条件責務） | OU-10 |
| src/opencode/commands/agentdev/README.md | UPDATE（command一覧・分類） | OU-02 |

## ADR判断根拠

### OU-01〜OU-06: ADR不要

REQ分類ルール、ワークフローREQ、command分割、横断統治統合、inspect再編、retire/index整合は、全てREQ/SPEC運用レベルの変更である。「ADRを作成してはならない条件」（仕様変更、command動作仕様、workflow定義、命名規約、artifact contract変更、運用ルール）に該当する。技術スタック選定・アーキテクチャパターン・データモデル等の設計判断を含まない。

### OU-07: ADR不要（既存ADRのUPDATE/status変更のみ）

- ADR-0113 deprecated化: 「過去判断を現行基盤から外すだけの場合は、新規ADRではなくretire/supersedeで処理する」（REQ-0101-045）。新規ADR不要。
- ADR-0110 主題圧縮: accepted ADRの決定内容を意味変更しない範囲の調整。UPDATEで処理。
- diagnostics-* → inspect-*: MEMO明示「新規ADRを作らないこと」。REQ/SPEC側で扱う。
- Step 5-3（作業手段ADR拒否ゲート）: 削除・廃止・移行を主題にするものはADR候補から除外。

### OU-08: 新規ADR候補（要作成）

**判断**: case-run実行責務の外部実行バックエンド委譲は、新しいシステム境界の確立である。

**根拠**:
- アーキテクチャ上の重要性: agentdev（workflow state管理）と外部実行バックエンド（実装実行）の責務分界を確立する。case-runの構造を根本的に変更する。
- 長期的影響: 将来の開発において、実行関連機能はすべてこの境界に従う必要がある。
- 既存ADR重複確認: ADR-0112（サブエージェント委譲の一般化）は一般原則を扱う。本件は特定の実行バックエンド委譲パターンの確立であり、ADR-0112の適用を超える新規決定。重複なし。
- False Negative防止: 文書種別が境界上（REQ/SPECとADRの境界付近）。将来の設計・運用・文書システムを制約する決定を含むため、ADR側に寄せる。
- Step 5-1（ADR禁止ゲート）非該当: 単なる仕様変更・command動作仕様・workflow定義を超える、システム構造の意思決定。
- Step 5-3（作業手段ADR拒否ゲート）非該当: 削除・廃止・移行を主題としない。新規の委譲パターン確立が主題。

**新規ADR概要**: case-run は実装実行を外部実行バックエンドへ委譲し、自身は Issue/PR/worktree 状態の orchestration に専念する。driver subagent が委譲境界を担い、driver result は3状態（completed(pr)/blocked/failed）で定義する。

### OU-09: ADR不要

4品質ゲート体系化はSPECレベルの仕様定義。spec-compliance削除は運用ルール変更。「ADRを作成してはならない条件」（仕様変更、artifact contract変更、運用ルール）に該当。

### OU-10: ADR不要

docs品質改善・用語統一・再発防止は文書運用レベル。「ADRを作成してはならない条件」（運用ルール、命名規約）に該当。

## operation_units

### OU-01

- **ou_id**: OU-01
- **source_ru**: RU-0002
- **target_req**: REQ-0101 (UPDATE), REQ-0109 (UPDATE), document-model.md (SPEC UPDATE), REQ-0116 (RETIRE候補評価)
- **operation**: UPDATE
- **scale**: standard
- **depends_on**: []
- **recommended_order**: 1
- **issue_policy**: single
- **result**:
  - saved_reqs: [REQ-0101, REQ-0109]
  - operations:
    - REQ-0101: APPEND (REQ-0101-052〜057: REQ分類階層・粒度ルール・retire候補判定基準・文書分類ポリシー吸収評価)
    - REQ-0109: APPEND (REQ-0109-039: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT をREQ運用品質維持の恒常的基準として追加)
  - source_ru_mapping: RU-0002 → OU-01
  - case_open_input: { req_ids: [REQ-0101, REQ-0109], ou_id: OU-01, scale: standard, issue_policy: single }
  - adr_operations: none

### OU-02

- **ou_id**: OU-02
- **source_ru**: RU-0003
- **target_req**: REQ-0104 (UPDATE), REQ-0123 (UPDATE), REQ-0114 (UPDATE), workflow-contracts.md (SPEC UPDATE)
- **operation**: UPDATE
- **scale**: standard
- **depends_on**: [OU-01]
- **recommended_order**: 2
- **issue_policy**: single
- **result**: <!-- req-save/case-open が書き込む -->

### OU-03

- **ou_id**: OU-03
- **source_ru**: RU-0004
- **target_req**: REQ-0102 (UPDATE), REQ-0105 (SPLIT), REQ-0106 (SPLIT), REQ-0107 (UPDATE), REQ-0114 (UPDATE), case-open (CREATE), case-update (CREATE), case-run (CREATE/SPLIT), case-close (CREATE/SPLIT)
- **operation**: SPLIT/UPDATE/CREATE
- **scale**: large
- **depends_on**: [OU-02]
- **recommended_order**: 3
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

### OU-04

- **ou_id**: OU-04
- **source_ru**: RU-0005
- **target_req**: REQ-0101 (UPDATE), REQ-0103 (UPDATE), REQ-0112 (UPDATE), REQ-0113 (UPDATE), REQ-0116 (RETIRE), REQ-0118 (ABSORB/RETIRE), REQ-0119 (UPDATE), REQ-0120 (ABSORB/REPOSITION), REQ-0121 (RETIRE)
- **operation**: UPDATE/RETIRE
- **scale**: large
- **depends_on**: [OU-01, OU-02]
- **recommended_order**: 4
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

### OU-05

- **ou_id**: OU-05
- **source_ru**: RU-0006
- **target_req**: REQ-0108 (UPDATE), REQ-0109 (UPDATE), REQ-0115 (RETIRE), REQ-0124 (UPDATE/RETIRE), inspect-skills (CREATE), inspect-promote (CREATE)
- **operation**: UPDATE/RETIRE/CREATE
- **scale**: large
- **depends_on**: [OU-01, OU-02]
- **recommended_order**: 5
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

### OU-06

- **ou_id**: OU-06
- **source_ru**: RU-0007
- **target_req**: REQ-0110+REQ-0117 (MERGE), retired REQs (RETIRE: REQ-0115, REQ-0116, REQ-0118, REQ-0121, REQ-0124), indexes (AGENTS.md, docs/README.md, requirements/README.md, DOC-MAP.md, mapping-table.md, req-impact-map.md, rule-ownership.md)
- **operation**: MERGE/RETIRE/INDEX
- **scale**: standard
- **depends_on**: [OU-03, OU-04, OU-05]
- **recommended_order**: 7
- **issue_policy**: single
- **result**: <!-- req-save/case-open が書き込む -->

### OU-07

- **ou_id**: OU-07
- **source_ru**: RU-0008
- **target_req**: ADR-0113 (deprecated), ADR-0110 (UPDATE), ADR README (UPDATE)
- **operation**: UPDATE (ADR)
- **scale**: standard
- **depends_on**: [OU-01]
- **recommended_order**: 2
- **issue_policy**: single
- **result**: <!-- req-save/case-open が書き込む -->

### OU-08

- **ou_id**: OU-08
- **source_ru**: RU-20260616-01
- **target_req**: 新規ADR (CREATE: case-run実行バックエンド委譲), REQ-0104 (UPDATE), case-run REQ (UPDATE), case-close REQ (UPDATE), case-run.md (UPDATE), case-auto.md (UPDATE), agentdev-execution-backend/ (CREATE skill), agentdev-workflow-orchestration/ (UPDATE)
- **operation**: CREATE/UPDATE
- **scale**: large
- **depends_on**: [OU-03]
- **recommended_order**: 6
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

### OU-09

- **ou_id**: OU-09
- **source_ru**: RU-20260616-02
- **target_req**: quality-gates.md (CREATE SPEC), agentdev-quality-gates/ (CREATE skill), agentdev-spec-compliance/ (DELETE), REQ-0102 (UPDATE), REQ-0106 (UPDATE), case-run/case-open/case-close/req-define/req-save/case-auto (UPDATE commands), 複数REQ/SPEC (UPDATE), report_spec_compliance.md (DELETE)
- **operation**: CREATE/UPDATE/DELETE
- **scale**: large
- **depends_on**: []
- **recommended_order**: 2
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

### OU-10

- **ou_id**: OU-10
- **source_ru**: RU-20260616-03
- **target_req**: REQ-0101 (UPDATE), REQ-0103 (UPDATE), REQ-0108 (UPDATE), REQ-0115 (UPDATE), REQ-0116 (UPDATE), docs/** (UPDATE), commands/skills/templates (UPDATE), repo-agentdev-integrity/ (UPDATE)
- **operation**: UPDATE
- **scale**: large
- **depends_on**: []
- **recommended_order**: 8
- **issue_policy**: epic
- **result**: <!-- req-save/case-open が書き込む -->

## execution_groups

### EG-1: Wave 1 — 基盤確立

- **id**: EG-1
- **type**: sequential
- **purpose**: REQ分類・粒度ルールを確立し、後続全ウエーブの判断基盤を固定する
- **included_ou**: [OU-01]
- **rationale**: 全RUの前提となる分類ルールを最初に確立する。RU-0001（Epic context）に基づき、RU-0002を最初に処理する

### EG-2: Wave 2 — 構造枠組み確立

- **id**: EG-2
- **type**: parallel
- **purpose**: ワークフロー全体REQ、ADR体系、品質ゲート体系を並行して確立する
- **included_ou**: [OU-02, OU-07, OU-09]
- **rationale**: OU-02（ワークフローREQ）はOU-01完了後に実行可能。OU-07（ADR再編）はOU-01完了後に実行可能。OU-09（quality-gates）は依存なし。3者は対象REQ/ADRが重複しないため並行実行可能

### EG-3: Wave 3 — REQ分割・統合・再編

- **id**: EG-3
- **type**: parallel
- **purpose**: command REQ分割、横断統治統合、inspect/integrity再編を並行して実行する
- **included_ou**: [OU-03, OU-04, OU-05]
- **rationale**: OU-03/04/05は全てOU-01+OU-02完了後に実行可能。対象REQの重複が最小限のため並行実行可能。OU-03はcommand REQの物理的分割を含むため最大スケール

### EG-4: Wave 4 — 実行バックエンド境界確立

- **id**: EG-4
- **type**: sequential
- **purpose**: OMO委譲による case-run 実行バックエンド境界を確立する
- **included_ou**: [OU-08]
- **rationale**: OU-08はcommand REQ分割（OU-03）完了後に実行する。case-run/case-close の REQ 責務が確定した後に実行バックエンド委譲を適用する（MEMO 4.4）

### EG-5: Wave 5 — 最終整合

- **id**: EG-5
- **type**: sequential
- **purpose**: retire/merge/index/mapping-table整合を完了し、REQ体系の物理的一貫性を確保する
- **included_ou**: [OU-06]
- **rationale**: OU-06はOU-03/04/05の完了後に実行する。前段の統合・分割・退役判断が完了する前にindex/mapping/rule ownershipを更新すると再ずれが発生する（MEMO 4.2）

### EG-6: Wave 6 — docs再基準化

- **id**: EG-6
- **type**: sequential
- **purpose**: docs全体を再基準化し、全構造変更後の最終状態を文書体系へ反映する
- **included_ou**: [OU-10]
- **rationale**: OU-10はdocs全件を対象とするため、REQ/ADR/SPEC/command/skillの構造変更が全て完了した最後に実行する。構造変更前に実行すると、変更後のずれが再発する

## OU構造検証メモ

- 各OUに ou_id, target_req, operation が設定されている: OK
- execution_groups の included_ou が実在する ou_id を参照している: OK（OU-01〜OU-10全て実在）
- depends_on が実在する ou_id を参照している: OK
- result セクションが空である: OK（req-save/case-open が書き戻す）
