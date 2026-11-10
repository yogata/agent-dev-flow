---
draft_type: req_draft
topic_slug: install-check-probe-close-mechanical-steps-gates-lag
status: draft
created_at: "2026-11-10T18:59:05+09:00"
source_rus:
  - RU-0271
---

# draft-data

```yaml
# work_type: bugfix（正常に導入された consumer で誤 divergence が報告される検査の誤検知の解消。Decision 判断対象なしのため feature 昇格なし）
work_type: bugfix

scale: standard

summary: >
  scripts/install.ps1 の check モードが構成する close_mechanical_steps 用検査入力（fixture）が、
  コミット 1fdf576b5 で close_mechanical_steps.ts の --validate-input に追加された必須品質ゲート
  （issue-updated-at、target-issue-number）を含まず、正常に導入された consumer リポジトリでも
  divergence 1 件を誤報告する状態を解消する。検査入力は検証対象 script の必須入力を過不足なく
  含み、script 側の必須入力追加に追随する契約を REQ-009-054 として要件化し、検証方法を定める
  Design（install-script-usability.md）の該当記述を同期する。実現面は install.ps1 の
  New-MechanicalStepProbeInput の close_mechanical_steps fixture へ issueUpdatedAt・issueNumber
  を追加する。close_mechanical_steps.ts 本体は変更しない。

agentdev_handoff: true

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      導入時整合検査（check モード）の機械工程 script 前提検査の検査入力は、検証対象 script の
      入力検証経路（--validate-input）が必須とする品質ゲート等の必須入力を過不足なく含み、
      検証対象 script 側の必須入力の追加・変更に追随すること。検査入力の陳腐化に起因する誤
      divergence を導入時整合検査の報告に含めないこと。REQ-009 の新規要件行 REQ-009-054 として
      要件化する（RU-0271 要件化の方向に基づく。REQ-009-053 行の更新ではなく近接行の追加とする
      構造選択は CR-001 参照）。
  - id: AG-002
    content: |
      REQ-009-053 が参照する導入・検査の Design（docs/designs/local/install-script-usability.md
      「機械工程 script の実行時前提の導入時検証」節）のうち、機械工程 script の検証方法を定める
      検査入力（fixture）構成の記述を現行に合わせて更新すること。具体的には (1) 節見出しの対象
      REQ 参照へ REQ-009-054 を追加、(2) 検査入力 fixture 構成の bullet へ「検査入力は検証対象
      script の入力検証経路（--validate-input）が必須とする品質ゲート等の必須入力を過不足なく
      含み、検証対象 script 側の必須入力の追加・変更に追随する。検査入力の陳腐化に起因する誤
      divergence を導入時整合検査の報告に含めない」を追記、(3) ADF-COVERS(design) 宣言へ
      REQ-009-054 を追加、の3点。
  - id: AG-003
    content: |
      scripts/install.ps1 の New-MechanicalStepProbeInput 関数が生成する close_mechanical_steps
      用検査入力（fixture）へ、close_mechanical_steps.ts の --validate-input（validateInput）が
      pre-merge で必須とする issueUpdatedAt（非空文字列）と issueNumber（1 以上の整数）を含める
      こと。これにより正常に導入された consumer リポジトリの -Mode check で Mechanical-step
      script prerequisites が 4 対象・divergence 0 件となる。close_mechanical_steps.ts 本体の
      必須ゲート要件（コミット 1fdf576b5 で追加済み）は変更しない。check モードの判定・集計
      ロジック本体も変更しない。scripts/consumer/archive/install.ps1 は当該検査を含まないため
      対象外。consumer リポジトリ側の再導入・再検査の実施も本 Case の対象外
      （RU-0271 対象外宣言どおり上流の修正のみが対象）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-009.md
    target_area: 要件
    source_items: [AG-001]
    content: |
      | REQ-009-054 | 導入時整合検査（check モード）の機械工程 script 前提検査の検査入力は、検証対象 script の入力検証経路（--validate-input）が必須とする品質ゲート等の必須入力を過不足なく含み、検証対象 script 側の必須入力の追加・変更に追随すること。検査入力の陳腐化に起因する誤 divergence を導入時整合検査の報告に含めないこと |
    notes: >-
      挿入位置は要件テーブルの REQ-009-053 行の直後（テーブルを空行で分断しない）。
      組立検査（assemble-draft-section.ts）は事前条件の機械確認済み（対象見出し「要件」一意、
      アンカー文面「検証対象とする機械工程 script の範囲と検証方法を導入・検査の Design が
      定めること |」が節内に1回のみ出現）。新規行の追加は既存行を一切変更しないため
      検査器の replace 契約（旧文完全消去）と非互換であり、新規行生成として適用する
      （assembly_evidence 対象外の理由。adversarial-review で確認済み）。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/local/install-script-usability.md
    target_design:
      operation: update
      domain: local
      slug: install-script-usability
    target_area: install.ps1 -Mode check の検査カタログ
    source_items: [AG-002]
    content: |
      （1）節見出しの更新: 「### 機械工程 script の実行時前提の導入時検証（REQ-009-053）」を
      「### 機械工程 script の実行時前提の導入時検証（REQ-009-053、REQ-009-054）」へ。
      （2）同節の検査入力 fixture 構成 bullet（「検査入力は、配布先の実際の consumer 条件のうち
      書式・存在・パス条件の水準を表現する fixture で構成する:」で始まる行）末尾の
      「入力書式の契約は script 契約の既定に従う」を
      「入力書式の契約は script 契約の既定に従い、検査入力は、検証対象 script の入力検証経路
      （--validate-input）が必須とする品質ゲート等の必須入力を過不足なく含み、検証対象 script
      側の必須入力の追加・変更に追随する。検査入力の陳腐化に起因する誤 divergence を導入時整合
      検査の報告に含めない」へ置換。
      （3）frontmatter 直後の ADF-COVERS(design) 宣言「<!-- ADF-COVERS(design): REQ-009-053 -->」を
      「<!-- ADF-COVERS(design): REQ-009-053, REQ-009-054 -->」へ更新。
      （1）（2）は assemble-draft-section.ts による組立検査済み（assembly_evidence 参照）。
      （3）は最初の見出しより前に位置し見出し節の外のため機械組立の対象外（case-ready 適用時は
      対象行の直接更新）。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0271 の要件化の方向は「REQ-009-053 の行更新または近接行の追加」の両方を許容していた
    resolution: >-
      近接行の追加（REQ-009-054 新設）を採用。REQ-009-053 の命題（導入時整合検査が実行時前提の
      不一致を検出できること）と新命題（検査入力が必須入力を過不足なく含み追随すること）は別の
      測定可能命題であり、行を分けることで各命題が一意になる（チェックボックス品質基準）。
      REQ-009-053 行の意味変更とならないため design 対応事前確認の対象も増えない。RU-0271 の
      要件化の方向（利用者が 2026-11-10 に了承済みの合意内容）が行更新または近接行追加の双方を
      許容しており、本構造選択は委譲された裁量の範囲である。なお req-define 実行時に REQ-009 の
      SPLIT 予兆計測（合計シグナル 3: 要件行数 53・複数関心混在・影響アーティファクト種別数 3 超）
      を確認する質問に対し監督者（supervisor）による代理回答（そのまま APPEND）がなされたが、
      これは利用者への提示でも利用者の回答でもない。REQ-009 の SPLIT 要否自体は利用者判断として
      未確定であり、REQ-009 の構造再編が必要と判断された場合は inspect-docs / backlog 経由で
      別案件として利用者に提案する。本 draft の REQ-009-054 追加は RU-0271 の合意内容（既存契約）
      と req-health-metrics Design の合計シグナル 3 の扱い（APPEND の場合は理由を明記）に基づき、
      APPEND 理由の明記とともに実行するものである。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0271
    target_req: REQ-009
    target_design: docs/designs/local/install-script-usability.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      修正着手前に、consumer 導入形態を再現した検証環境で scripts/install.ps1 -Mode check を
      実行し、Mechanical-step prerequisites に close_mechanical_steps の divergence 1 件
      （required quality gates are missing from input (omission forbidden): issue-updated-at,
      target-issue-number）が出ることを記録する。2026-11-10 の非公開 consumer リポジトリでの
      観測（RU-0271 Source Summary に記録済み）が同一事象の実測であるため、修正着手前の
      再実行が困難な場合は当該観測記録をもって再現記録とする。
    pass_criteria: |
      修正着手前の時点で、close_mechanical_steps の divergence 1 件（上記2語句の omission）
      が確認・記録されていること、または RU-0271 Source Summary の 2026-11-10 観測記録が
      再現記録として引用されていること。
    on_failure: |
      fix-and-reverify。再現が確認できない場合は修正対象の特定（fixture 欠落と divergence の
      対応）をやり直す。誤差がある場合も修正を先行させず原因を特定する。
  - id: TS-002
    target_item: AG-001
    verification: |
      修正後、同一条件の consumer 導入形態を再現した検証環境（GitHub 版隔離検証環境〔REQ-116〕
      または consumer 導入形態を再現した checkout）で scripts/install.ps1 -Mode check を実行し、
      Mechanical-step script prerequisites の検査結果を確認する。検証環境の選択は case-run が
      行い、consumer リポジトリ側の操作を本 Case の実行に含めない（RU-0271 対象外宣言どおり）。
    pass_criteria: |
      Mechanical-step script prerequisites が 4 対象（prepare_definition_pr、
      accept_definition_checks、close_mechanical_steps、cross-dependency）すべてで divergence
      0 件であること。
    on_failure: |
      fix-and-reverify。残存 divergence の内容を確認し、fixture の必須入力過不足を是正して
      再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      上流リポジトリ（agent-dev-flow 本体）自身の検査（docs-check、textlint 最終検査、
      install.ps1 の上流条件での -Mode check 等、Case の実行経路で稼働する上流検査）を
      実行する。
    pass_criteria: |
      上流リポジトリ自身の検査で新たな divergence が発生しないこと（既存の検査結果と比較して
      新規の失敗が 0 件であること）。
    on_failure: |
      fix-and-reverify。新たな divergence の原因を特定し、修正を反映して再検証する。
  - id: TS-004
    target_item: AG-001
    verification: |
      本 Case の変更差分（PR の files changed）を機械的に確認し、
      src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      が変更差分に含まれないことを確認する。変更対象は scripts/install.ps1、
      docs/requirements/REQ-009.md、docs/designs/local/install-script-usability.md の
      3ファイルに限定される。
    pass_criteria: |
      変更差分に close_mechanical_steps.ts を含まないこと（検査入力側のみの修正であること）。
    on_failure: |
      fix-and-reverify。close_mechanical_steps.ts への変更が混入した場合は当該変更を差し戻し、
      検査入力側（install.ps1）のみの修正に分離して再検証する。
  - id: TS-005
    target_item: AG-002
    verification: |
      更新後の docs/designs/local/install-script-usability.md「機械工程 script の実行時前提の
      導入時検証」節の記述と、現行の close_mechanical_steps.ts validateInput が pre-merge で
      必須とする入力（issueUpdatedAt: 非空文字列、issueNumber: 1 以上の整数、および既存の
      品質ゲート群）を機械的に照合する。REQ-009-054 行と Design bullet の文言が同一契約を
      表現していることを確認する。
    pass_criteria: |
      Design 記述が現行の validateInput の必須入力と過不足なく対応し、REQ-009-054 行と Design
      記述の間に契約のずれがないこと。docs-check（textlint を含む）が合格すること。
    on_failure: |
      fix-and-reverify。Design 記述または REQ 行の文言を現行実装と一致するよう修正して再検証する。

realization_actions:
  - id: RA-001
    concern: install.ps1 の close_mechanical_steps 検査入力（fixture）への必須入力追加
    responsibility: |
      scripts/install.ps1 の New-MechanicalStepProbeInput 関数（「# --- Mechanical-step
      script prerequisite check (REQ-009-053) ---」節）の close_mechanical_steps Kind が返す
      fixture ハッシュテーブルへ、close_mechanical_steps.ts の validateInput が pre-merge で
      必須とする次の2フィールドを追加する: issueUpdatedAt（非空文字列。ISO 8601 形式の
      Case 非依存の固定サンプル値）、issueNumber（1 以上の整数。probe 用の固定値）。
      既存フィールド（phase、worktreeRoot、repoRoot、branch、prNumber、issueBodyPath、
      generateIndexesGate、traceabilityGate、integrityGates、textlintGate、
      contractStateCheck）は変更しない。他 Kind（prepare_definition_pr、
      accept_definition_checks、cross-dependency）の fixture は変更しない。
    ownership_hints:
      - scripts/install.ps1 の New-MechanicalStepProbeInput（873 行目起、close_mechanical_steps Kind は 914 行目起）
      - 必須入力の正: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts の validateInput（pre-merge の missing チェック、503-528 行目付近）
      - script 契約: src/common/skills/agentdev-workflow-case-close/scripts/README.md（issueNumber・issueUpdatedAt の入力定義）
    intent: |
      fixture が close_mechanical_steps.ts の --validate-input の必須品質ゲートを過不足なく
      満たすようにし、正常に導入された consumer での誤 divergence（issue-updated-at、
      target-issue-number の omission 報告）を解消する。検証専用経路（--validate-input）の
      入力のみの変更であり、worktree 作成・ゲート実行等の実行ステップには影響しない
      （check モードの非破壊契約 REQ-050-005 維持）。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0271
    source_item: install-check-probe-close-mechanical-steps-gates-lag
    disposition: covered
    reason_code: fully_reflected
    reason: |
      RU-0271 の全構成要素（目的、対象、対象外、正規所有者とアンカー、依存関係、要件化の方向、
      決定的受け入れ条件 1〜4、Source Summary の事実関係）を AG-001〜AG-003、ACT-REQ-001、
      ACT-DESIGN-001、RA-001、TS-001〜TS-005 へ反映した。決定的受け入れ条件は TS-001〜TS-004
      が対応する。対象外宣言（close_mechanical_steps.ts 本体、check モード判定・集計ロジック、
      scripts/consumer/archive/install.ps1、consumer 側再導入・再検査）は AG-003 と TS-002 の
      verification に反映した。要件化の方向（REQ-009-053 行更新または近接行追加）は CR-001 の
      とおり近接行追加（REQ-009-054）として確定した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0271.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/local/install-script-usability.md
    target_content_sha256: d2e60146ed6d09629ab5f9a58494a61497456f8156b40306128621e475437367
    check_scope:
      heading: install.ps1 -Mode check の検査カタログ
      start_line: 103
      end_line: 136
    execution_conditions:
      operation: replace
      edit_sha256: 31e604b62af2b06b7a116ae076e18b72074d3c4296fc8bb952ba08afbf047ff9
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-10T09:54:47.321Z"
  - target_file: docs/designs/local/install-script-usability.md
    target_content_sha256: d2e60146ed6d09629ab5f9a58494a61497456f8156b40306128621e475437367
    check_scope:
      heading: 機械工程 script の実行時前提の導入時検証（REQ-009-053）
      start_line: 124
      end_line: 136
    execution_conditions:
      operation: replace
      edit_sha256: 9e6edc03280ac5c1339939b93f3f016c5dfa1189273a256f0f1dc8249169b844
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-10T09:57:23.000Z"

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

## 対象と背景

非公開 consumer リポジトリの ADF 最新化直後の `-Mode check` で、close_mechanical_steps の divergence 1 件（`issue-updated-at`、`target-issue-number` の omission）が観測された（2026-11-10、RU-0271 Source Summary）。原因はコミット 1fdf576b5 が close_mechanical_steps.ts の `--validate-input`（validateInput）に必須品質ゲート（issueUpdatedAt・issueNumber）を追加した一方、install.ps1 の New-MechanicalStepProbeInput が生成する検査入力に両フィールドの追加が追随していなかったこと。上流リポジトリ自身の check では consumer 条件検査が実行されないため上流では検出されなかった。

## 主要な判断（出所別。2026-11-10 訂正済み）

**既存契約（RU-0271 合意内容。利用者が 2026-11-10 に了承）で決まること**:
- REQ-009-053 の行更新または近接行の追加として要件化すること（要件化の方向）
- 決定的受け入れ条件 1〜4（TS-001〜004 が対応）と対象外宣言（close_mechanical_steps.ts 本体、check モード判定・集計ロジック、`scripts/consumer/archive/install.ps1`、consumer 側再導入・再検査の実施）

**今回の明示指示（2026-11-10、利用者）で決まること**:
- RU-0271 を req-define と case-auto で適用すること。case-auto の実行確認は監督側が別途行う（本 workflow は訂正 draft の保存・報告まで）

**委譲された裁量として本 workflow が決めたこと**:
- 近接行追加（REQ-009-054 新設）の構造選択。REQ-009-053 の命題（検出能力）と新命題（検査入力の妥当性）は別の測定可能命題（CR-001）
- Decision 不要判断（DEC-016 副作用ゼロ原則・DEC-021 公開入口2本固定の枠内の不備是正）
- work_type: bugfix、scale: standard、単一 Issue 構成

**人の判断が必要で未確定なこと（本 draft では確定しない）**:
- REQ-009 の SPLIT 要否自体（SPLIT 予兆計測は合計シグナル 3: 要件行数 53・複数関心混在・影響アーティファクト種別数 3 超）。req-define 実行時に出した確認質問には監督者（supervisor）による代理回答（そのまま APPEND）がなされたが、これは利用者への提示でも利用者の回答でもないため、SPLIT 要否は利用者判断として未確定である。REQ-009 の構造再編が必要と判断された場合は inspect-docs / backlog 経由で別案件として利用者に提案する。本 draft の REQ-009-054 追加は RU-0271 の合意内容と req-health-metrics Design の合計シグナル 3 の扱い（APPEND の場合は理由を明記）に基づく

**非公開情報の取り扱い（2026-11-10 訂正）**:
- draft から非公開 consumer リポジトリの名称・コミットハッシュを除去した（RU-0271 本文は参照専用のため変更しない）。上流リポジトリのコミット（1fdf576b5 等）は公開情報のためそのまま記載する。非公開リポジトリの名前・詳細を公開 Issue・PR・コミットへ新たに載せない

## adversarial-review の結果（STEP-8）

審議で accepted となった 3 finding を反映済み: fixture 追加フィールドの値仕様を RA-001 へ明記（F-B1）、TS-001 に修正着手前条件と既観測の引用代替を明記（F-B3）、TS-002 に検証環境の選択肢と out_of_repo_operations の扱いを明記（F-B4）。却下・影響なしの finding 6件（F-A1〜A5、F-B2、F-B5、F-B6）は反証により確定。

## 組立検査の記録

Design 更新（節見出し・bullet の2操作）は assemble-draft-section.ts で組立検査済み（assembly_evidence に evidence 記録、target_content_sha256 は同一ファイル状態 d2e60146… から検査）。ADF-COVERS(design) 宣言行は最初の見出しより前に位置し見出し節の外のため機械組立対象外（ACT-DESIGN-001 content に適用内容を記録）。REQ-009-054 新規行の追加は、既存行を一切変更しない追加であるため検査器の replace 契約（旧文完全消去）と非互換であり、事前条件（対象見出しの一意性・アンカー文面の節内一意性）の機械確認済みの上、新規行生成として適用する（ACT-REQ-001 notes に記録）。

## 検証時の一時資材

組立検査の入力・実行・結果ファイルは `.agentdev/integrity/reports/ru0271-assembly/`（非永続・git 管理対象外領域）に一時配置した。検証完了後、本 Case の実行時に削除する（REQ-118 の検証資材取扱い契約に従う）。
