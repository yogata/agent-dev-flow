---
draft_type: req_draft
topic_slug: agentdev-migration-2026-08
status: saved
created_at: 2026-08-06T00:00:00+09:00
source_plan: .omo/plans/agentdev-migration-2026-08-05.md
---

# draft-data

```yaml
# work_type: feature（SPEC 正規化に spec-save が必要なため。REQ 行追加なし、req-save は動的スキップ）
# scale: large（複数REQ 横断の適合化 + 実装スコープシグナル両方充足）
work_type: feature
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  2026-08-05版移行計画（.omo/plans/agentdev-migration-2026-08-05.md、Momus 承認済）を要件化する。
  移行は既存 REQ（REQ-001/002/009/010）が既に定める要件への適合化であり、REQ 行の新規追加・変更を伴わない。
  作業は SPEC 正規化（frontmatter 契約、配布物自己完結、整合性検査 profile 分離、command 薄型化、skill 段階的開示）と、
  配布物・checker・test の実装準拠から成り、WP-0..WP-6 の7工程に直列分解する。
  詳細な実装指示、ファイル一覧、QA シナリオ、回帰マトリクスは移行計画本体が正とし、本 draft は工程構造と SSoT 遷移契約を定義する。

# auto_gate: ユーザー承認（case-auto 再起動時「自律的に必要な対応を行い、完遂すること」）により
# per-WP human checkpoint を case-auto 自走へ変更（合意要件変更、停止条件 (1) のユーザー承認済み変更）
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
  override_reason: |
    ユーザーが case-auto 再起動時に「必要な情報はすべて渡している認識である。自律的に必要な対応を行い、完遂すること」と明示。
    元の stop_reasons（per-WP human checkpoint required）を case-auto 自走へ変更する合意要件変更の承認と解釈。
    各 WP の検証（§13.1 QA シナリオ、§7.7.1 回帰マトリクス）は case-auto が case-run インライン実行で代行する。

# agreed_items: WP-0..WP-6 の各工程の合意内容。詳細は移行計画本体へ委譲
agreed_items:
  - id: AG-001
    content: |
      WP-0 現状固定と事前状態確認。active な draft/RU/Issue/PR/inbox を取得し継続/隔離/完了を記録し、変更前の検査結果（Integrity Checker JSON/Markdown report、NG/warning カテゴリ別件数、IR-055/059/source-projection/index 整合性一覧）、command/SKILL.md 変更前行数、baseline 変更前状態を保存する。baseline/索引/検査結果は本工程で修正しない（移行計画 §4）。
  - id: AG-002
    content: |
      WP-1 基準文書・frontmatter・旧検査契約の正常化。配布command frontmatter を description 単一に統一し agent を必須/許可/有効値検査から除外、agent: を harness 側設定へ移管。壊れた commands_error_cases.test.ts を UTF-8 通常改行で再構成。lifecycle 誤検知（review 単語の旧6状態誤認）を修正。superseded ADR（ADR-005）の現行根拠参照を ADR-006 or 現行SPECへ更新。現行SPEC等の RU-xxxx 設計根拠参照を除去し本文へ直接記述（移行計画 §5）。
  - id: AG-003
    content: |
      WP-2 配布物の内部参照除去と自己完結化。runtime 配布面（src/opencode/{commands,skills}/**、references、templates、scripts、同梱README）から本体内部ID（REQ/ADR/IR/RU）と本体内部パス（docs/specs/**, src/opencode/** 等）を除去し契約名・意味名へ置換。harness 具体（エージェント名/timeout/retry）は harness 固有 reference へ分離。「不一致時は本体SPECを正とする」実行時契約を廃止。明示的 exemption 機構（exemptions.json）を導入し baseline と区別管理（移行計画 §6）。
  - id: AG-004
    content: |
      WP-3 Integrity Checker の実行プロファイル分離。check_integrity.ts に source/installed/release の3 profile を追加（新規 checker 増やさず）。source は配置先不在をNGとせず projection 検査を対象外化。installed は原本/配置先の集合・内容比較で配置漏れを検出。release は archive 展開→install→installed profile を host 側 checker（--root REQ-0145-014）で実行。検出力回帰マトリクス（意図的 violation × profile）で baseline 更新前に検出力維持を検証（移行計画 §7）。
  - id: AG-005
    content: |
      WP-4 command の薄型化。全公開command を150行以内（主要7command は100〜140行目標）へ縮約。入力/出力/高レベル工程/副作用境界/QG 呼出/停止条件/承認境界/SSoT 移行/skill 委譲境界/完了報告は command に残し、詳細分類表/script CLI例/正規表現/サブエージェント prompt/内部アルゴリズム/未採用候補は skill/reference へ移管。公開動作（入出力/状態遷移/停止条件）を変更しない（移行計画 §8）。
  - id: AG-006
    content: |
      WP-5 SKILL.md の段階的開示化。200行超の優先7 SKILL.md（req-analysis/learning-pipeline/adr-file-manager/skill-authoring/epic-tracker/case-run-execution-adapter/learning-capture）を原則200行以内へ縮約。詳細 schema/判定表/正規表現/具体例/例外回復/harness 起動方法は references へ分離し、各 SKILL.md に reference 選択表を配置。通常経路で全 reference を無条件読込しない（移行計画 §9）。
  - id: AG-007
    content: |
      WP-6 索引再生成・統合検証・Release Report。DOC-MAP/REQ/ADR/SPEC inventory、integrity rule catalog AUTOGEN、rule ownership appendix を再生成しべき等性（再実行差分0）を確認。原本→配置先を正規手順で配置し installed profile で一致確認。検証順序（TS型検査→Integrity単体→command/skill構造→template/reference path→index べき等→source/installed/release profile→S-001..S-010）を実行し Release Report を作成。§10.6.1 停止判定（conflicted/exemption 整合/回帰未解決）に該当しない場合のみ status: complete とする（移行計画 §10）。

# artifact_actions: SPEC 正規化のみ（artifact: spec）。REQ 行追加・ADR 新規はなし
# 1 action = 1 SPEC × 1 editing concern。target_area は主題で記述し、spec-save が実際の見出しを解決する
# 各 content は変更意図を正規に記述し、詳細 normative は移行計画 §X へ委譲する（soft contract）
artifact_actions:
  # target_area 修正方針（case-auto Phase 0、ユーザー承認「自律的に必要な対応を行い、完遂すること」に基づく）:
  # - ACT-SPEC-001/002/004: 論理節名 → 物理見出しへ修正（update でセクション置換）
  # - ACT-SPEC-003/005/006/007: 該当節不存在のため operation を spec-append へ変更（新規節追加）、content 先頭に見出し追加
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/foundations/patterns.md
    target_area: コマンド frontmatter 規約
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-command-authoring
    source_items: [AG-002]
    content: |
      command frontmatter の正規契約を description 単一へ変更する。agent を必須フィールド・許可フィールド・有効値検査の全てから除外する。REQ-002-022（配布command は harness 固有詳細を含まない）および ADR-001（harness 分離）に基づき、実行エージェント固定は harness 側設定へ移管し command frontmatter から除去する。詳細 normative は移行計画 §5.2。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/artifact-contracts.md
    target_area: コマンドフロントマター契約
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-command-authoring
    source_items: [AG-002, AG-003]
    content: |
      command frontmatter 契約を description 単一へ同期する（ACT-SPEC-001 と整合）。配布物自己完結と内部ID/内部パス排除の境界宣言を REQ-001-031/032、REQ-002-021..029 と整合させ、「不一致時は本体SPECを正とする」実行時契約を廃止し開発時 checker が SPEC と配布物の適合を保証する構造へ変更する旨を明記する。詳細 normative は移行計画 §5.2, §6.2。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-command-authoring.md
    target_area: command authoring 基準
    spec_logical_division: behavior
    canonical_owner: agentdev-command-authoring
    source_items: [AG-002, AG-005]
    content: |
      ## command authoring 基準

      command authoring SPEC の frontmatter 例、DoD、fixture 指針を description 単一契約へ更新する。command 薄型化の基準（入力/出力/高レベル工程/副作用境界/QG/停止条件/承認境界/委譲境界は command 残置、詳細分類表/script CLI例/正規表現/prompt 全文/未採用候補は skill/reference 移管、150行以内・主要7command は100〜140行）を REQ-002-001..004 と整合して明記する。詳細 normative は移行計画 §5.2, §8.1。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/quality/quality-specs.md
    target_area: 必須シナリオ（10シナリオ）
    spec_logical_division: behavior
    canonical_owner: agentdev-workflow-orchestration
    source_items: [AG-002]
    content: |
      必須シナリオ（S-001..S-010）説明中の RU-xxxx 設計根拠参照を除去し、必要な意味を本文へ直接記述する。REQ-001-030（永続文書の根拠参照は一時成果物識別子を含まない）に基づく。詳細 normative は移行計画 §5.6。
  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-append
    target: docs/specs/integrity/rules/IR-006-command-allowed-frontmatter.md
    target_area: IR-006 ルール定義
    spec_logical_division: cross_cutting_contract
    canonical_owner: repo-agentdev-integrity
    source_items: [AG-002]
    content: |
      ## IR-006 ルール定義

      IR-006（command 許可 frontmatter）のルール定義と実装を description 単一許可へ更新する。新規ルール化せず既存ルールの定義と checker 実装を更新する（移行計画 §2 固定方針）。rule-ownership.md 中の IR-006 所有権記述も整合させる。詳細 normative は移行計画 §5.2。
  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-append
    target: docs/specs/integrity/integrity-contracts.md
    target_area: 実行プロファイル分離
    spec_logical_division: behavior
    canonical_owner: repo-agentdev-integrity
    source_items: [AG-004]
    content: |
      ## 実行プロファイル分離（source/installed/release）

      check_integrity.ts の実行 profile（source/installed/release）分離契約を明記する。source は配置先不在をNGとせず projection 検査を対象外、installed は原本/配置先集合・内容比較で配置漏れ検出、release は archive 展開→install→installed profile を host 側 checker（--root）で実行、ZIP 非同梱 checker は host 起点とする。integrity-rule-catalog.md の該当 AUTOGEN 領域も整合させる。詳細 normative は移行計画 §7。
  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-skill-authoring.md
    target_area: skill authoring 段階的開示基準
    spec_logical_division: behavior
    canonical_owner: agentdev-skill-authoring
    source_items: [AG-006]
    content: |
      ## skill authoring 段階的開示基準

      skill 段階的開示の基準（SKILL.md は目的/USE FOR/入出力/副作用/責任境界/不変条件/判断順序/reference 選択条件/script-template 入口を保持、詳細 schema/判定表/正規表現/具体例/例外回復/harness 起動は references へ分離、原則200行以内、reference 選択表の必須配置、通常経路で全 reference 無条件読込しない）を REQ-002-014/015 と整合して明記する。詳細 normative は移行計画 §9.2, §9.3, §9.5, §9.6。

# conflict_resolutions: 壁打ちで解消された判断。後続コマンドは再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: 移行の work_type と経路（maintenance direct_case vs feature 経由）
    resolution: |
      feature に確定。根拠: 移行は SPEC 正規化を伴い spec-save による SPEC SSoT 遷移が必要なため。REQ 行の新規追加・変更はない（REQ-001/002/009/010 が既に要件を明記）ため req-save は動的スキップされ、spec-save → case-open → case-run → case-close の経路となる。SPEC 変更と実装は移行ブランチ内で完結し case-close（QG-3/4）で最終整合性を検証するため、spec-save と case-run の分離はブランチ内一時状態として管理可能。
  - id: CR-002
    conflict: Epic 規模移行のドラフト構造化（単一 Epic vs WP 毎分割）
    resolution: |
      単一 Epic ドラフト + 7 OU（WP-0..WP-6 各1件）に確定。根拠: 移行計画の連鎖依存（WP-1→2→3→4→5→6）と Momus 承認の整合性を保持しつつ、case-open が operation_units から Epic/子Issue 構成を生成する（G14）。要件行数は 51 を超えるが、Epic 構造（複数REQ 横断・OU 分解）として扱い、単一REQ の肥大化 SPLIT シグナルとは別軸。
  - id: CR-003
    conflict: 既存 REQ への UPDATE 要否
    resolution: |
      REQ 行の新規追加・変更は行わない。REQ-001（014/030/031/032/056..060）、REQ-002（001..004/014/015/021..029）、REQ-009（001..005）、REQ-010（005/008/009/053..058）が移行の実現対象要件を既に明記しており、移行はこれら既存要件への適合化（SPEC 正規化＋実装準拠）である。移行計画 §2「新規REQ作らない、既存正規所有者と既存checkerを修正する」と整合。

# operation_units: WP-0..WP-6 の7工程。case-open が Epic/子Issue 構成へ展開する
# 各 OU は移行計画の対応 WP を参照し、詳細実装指示は計画本体へ委譲する
operation_units:
  - ou_id: OU-001         # WP-0 現状固定・事前状態確認
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002         # WP-1 基準文書・frontmatter・旧検査契約の正常化
    target_spec: docs/specs/foundations/patterns.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003         # WP-2 配布物の内部参照除去と自己完結化
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004         # WP-3 Integrity Checker 実行プロファイル分離
    target_spec: docs/specs/integrity/integrity-contracts.md
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005         # WP-4 command の薄型化
    target_spec: docs/specs/skills/agentdev-command-authoring.md
    operation: update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006         # WP-5 SKILL.md の段階的開示化
    target_spec: docs/specs/skills/agentdev-skill-authoring.md
    operation: update
    scale: standard
    depends_on: [OU-005]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007         # WP-6 索引再生成・統合検証・Release Report
    operation: update
    scale: standard
    depends_on: [OU-006]
    recommended_order: 7
    issue_policy: single
    result: {}

# test_strategy: 各 AG の検証方法。verification / pass_criteria / on_failure の3要素必須
# 詳細 QA シナリオと回帰マトリクスは移行計画 §13.1, §13.2, §7.7.1 を正とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      .omo/plans/agentdev-migration-2026-08-05.preflight.md が存在し active draft/RU/Issue/PR/inbox の継続/隔離/完了が全件記録済であることを確認する。保存した baseline のハッシュが WP-0 開始前と一致することを git status で確認する（移行計画 §13.1 WP-0 行）。
    pass_criteria: |
      preflight.md に未決着0。baseline 配下が clean。変更前検査結果・行数・baseline 状態が再確認できる。
    on_failure: |
      fix-and-reverify。未決着の active 成果物は隔離または完了させ、所定の手続きで preflight.md を更新して再確認する。baseline が汚染されている場合は再取得する。
  - id: TS-002
    target_item: AG-002
    verification: |
      bun run check_integrity.ts --json > out.json を実行し report から rule command-inventory の finding を抽出する（移行計画 §13.1 WP-1 行）。併せて grep -rn "^agent:" src/opencode/commands/agentdev/ でマッチ0件、commands_error_cases.test.ts の全 case pass、lifecycle fixture（現行状態通過・旧状態失敗）、grep -rn "RU-[0-9]" docs/specs/ で設計根拠 RU 参照0件を確認する。
    pass_criteria: |
      rule command-inventory の finding のうち agent を含むもの 0件。agent: マッチ0件。fixture 全 pass。RU 設計根拠参照0件（履歴節除く）。
    on_failure: |
      fix-and-reverify。残存 agent: は harness 側設定へ移管し command から削除。fixture 失敗は実装不具合のため修正して再実行。RU 参照残りは本文へ意味を直接記述して除去。
  - id: TS-003
    target_item: AG-003
    verification: |
      bun run check_integrity.ts --profile source --json > out.json を実行する（移行計画 §13.1 WP-2 行）。runtime 配布面の IR-055 strict finding / IR-059 strict finding を確認する。baseline 件数を WP-0 保存値と比較する。exemptions.json の全 entry の rationale_ref が実在し review_status: accepted のみであることを確認する。
    pass_criteria: |
      IR-055 strict finding 0件、IR-059 strict finding 0件。baseline 件数は WP-0 値から増えていない。exemptions.json 整合。
    on_failure: |
      fix-and-reverify。残存内部ID/内部パスは契約名・意味名へ置換し文意と停止条件が弱まっていないか確認。baseline 増加は許容されないため該当 finding を解消。
  - id: TS-004
    target_item: AG-004
    verification: |
      移行計画 §7.7.1 検出力回帰マトリクスの全セル（source/installed/release × 意図的 violation、および負の確認3セル）を実行し、.omo/plans/agentdev-migration-2026-08-05.regression.md へ記録する。3 profile の report で profile フィールドが区別可能であることを確認する（移行計画 §13.1 WP-3 行）。
    pass_criteria: |
      回帰マトリクス全セルが期待 exit code・finding を生成。期待と異なるセル0。3 profile が同一 report 上で識別可能。
    on_failure: |
      fix-and-reverify。期待NGが発生しない profile は検出力低下のため実装を修正し再実行。baseline 更新には進めない。
  - id: TS-005
    target_item: AG-005
    verification: |
      src/opencode/commands/agentdev/*.md 全件の行数を計測する（移行計画 §13.1 WP-4 行）。bun run commands_structure.test.ts と runtime unresolved reference 検査を実行する。変更前後の公開入力/出力/状態遷移/停止条件の対応表で欠落がないか文書レビューする。
    pass_criteria: |
      全公開command 150行以内（主要7command は100〜140行）。commands_structure test exit 0。unresolved reference 検査 exit 0。公開契約対応表で欠落0。
    on_failure: |
      fix-and-reverify。150行超は詳細を skill/reference へ移管。参照先欠けは実在確認して修正。公開契約欠落は縮約方針見直し。
  - id: TS-006
    target_item: AG-006
    verification: |
      優先7 SKILL.md の行数を計測する（移行計画 §13.1 WP-5 行）。skill lint/structure 検査、reference path/distribution boundary 検査を実行する。各 SKILL.md に reference 選択表が存在することを確認する。
    pass_criteria: |
      優先7 SKILL.md 原則200行以内（超える場合は SPEC 根拠必須）。skill lint exit 0。リンク切れ0。reference 選択表あり。
    on_failure: |
      fix-and-reverify。200行超は詳細 schema/判定表/正規表現/具体例を references へ分離。リンク切れは参照先修正。
  - id: TS-007
    target_item: AG-007
    verification: |
      index generator を2回連続実行し差分0（べき等性）を確認する（移行計画 §13.1 WP-6 行）。S-001..S-010 必須シナリオを実行し証拠を記録する。Release Report の §10.5 記載項目と §10.6.1 推移表を確認する。
    pass_criteria: |
      index 再実行差分0。S-001..S-010 全シナリオ証拠記録・未実行0。Release Report status: complete（§10.6.1 停止判定該当なし）。
    on_failure: |
      fix-and-reverify。べき等性違反は generator 修正。S-* 未実行は blocker 扱い（外部環境不足含む）。停止判定該当は status: blocked で保持し未決事項を解消してから complete へ切替。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    Epic 親 Issue 1件 + 子 Issue 7件（OU-001..OU-007 = WP-0..WP-6）。各子 Issue は対応 WP の合意内容（AG-*）と SPEC action（ACT-SPEC-*）および移行計画 §X を本文に引用する。詳細実装指示・ファイル一覧・QA シナリオは移行計画本体（.omo/plans/agentdev-migration-2026-08-05.md）を正とし、各子 Issue から該当 WP 節へリンクする。
  wave_hints:
    - wave: 1
      units: [OU-001]
      reason: WP-0 事前状態確認・証拠取得は全工程の前提。
    - wave: 2
      units: [OU-002]
      reason: WP-1 frontmatter 契約正常化は WP-2 以降の配布物編集と checker 更新の前提（移行計画 §3）。
    - wave: 3
      units: [OU-003]
      reason: WP-2 内部参照除去は WP-3 検査基盤変更前に配布面を清浄化する必要がある。
    - wave: 4
      units: [OU-004]
      reason: WP-3 profile 分離は独立した検査基盤変更。
    - wave: 5
      units: [OU-005]
      reason: WP-4 command 薄型化は WP-5 skill 再編前に移管先を確定させる（移行計画 §3.1）。
    - wave: 6
      units: [OU-006]
      reason: WP-5 skill 段階的開示は WP-4 移管先確定に依存。
    - wave: 7
      units: [OU-007]
      reason: WP-6 統合検証・Release Report は全 WP 完了後。
```

# summary

本 draft は 2026-08-05 版移行計画（Momus 承認済）を要件化したものである。移行は既存 REQ（REQ-001/002/009/010）が既に定める要件への適合化であり、REQ 行の新規追加・変更を伴わない。したがって artifact_actions は SPEC 正規化（artifact: spec）のみで構成し、req-save は動的スキップ、spec-save → case-open → case-run → case-close の経路をとる。

工程は WP-0..WP-6 の7工程に直列分解し、各工程を operation_units（OU-001..OU-007）として case-open が Epic/子Issue 構成へ展開する。依存関係は移行計画 §3 の連鎖依存（WP-1→2→3→4→5→6）に従い、Wave 1..7 の直列構成を case_open_hints に示す。

詳細な実装指示、修正対象ファイル一覧、QA シナリオ、検出力回帰マトリクス、Release Report 記載項目は移行計画本体（.omo/plans/agentdev-migration-2026-08-05.md）が正であり、本 draft は工程構造と SSoT 遷移契約を定義する。auto_ready は false とし、7-WP 直列移行で per-WP 検証ゲート（§13.1 QA シナリオ、§7.7.1 回帰マトリクス）を人手確認する標準フローでの実行を前提とする。
