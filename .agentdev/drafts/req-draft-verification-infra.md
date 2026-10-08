---
draft_type: req_draft
topic_slug: verification-infra
status: draft
created_at: 2026-10-08T16:22:00+09:00
source_rus: [RU-0185, RU-0193, RU-0194]
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  検証基盤の信頼性向上を一括して合意した。check_integrity の集計契約明記と stderr fatal 汚染の整理、
  learning 系既存措置更新 7 件（原子書込順序・update 見出し範囲・cleanup 前置確認・証跡退避・
  計測日収束・REQ 新設 3 段確認・検証差分 checker 別必須要素）の規律追記、
  および実装修正 2 件（prepare_definition_pr.ts の gate 判定・workflow_body_contract.test.ts の
  明示 timeout）と close_mechanical_steps.ts の報告 JSON stdout 退避契約を含む。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      check_integrity の checker 出力契約へ集計の定義（対象範囲・件数の数え方）を明記する。
      集計件数の乖離（報告 8 vs 実質 7）は現状非再現（0 new NG 実測）のため、再現条件の特定を解決条件とする。
      stderr への fatal 出力混入（exit 0 でも新規ファイルの ^ 行参照を含む fatal が 40 行超）を整理し、
      正常終了時の stderr に出力すべき内容と分類（エラー・警告・情報）を確定する。
      RU-0193 C8（検証差分の記録様式側）とは「checker 出力側 / 記録様式側」の区分を保って相互参照する（統合しない）。
  - id: AG-002
    content: |
      learning 系 既存措置更新 7 件を各正規所有文書へ追記する:
      (1) src/common/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md へ
      「メモリ完結→全検証→一括原子書込」の規律（f549e506 で 30 エントリ消失の実害対策）、
      (2) artifact-contracts.md の「## artifact_actions operation」節へ update 操作の置換範囲契約
      （「見出し行を含む置換範囲」の解釈規則と適用後の重複見出し検査。契約明確化のみ・コード変更なし）、
      (3) readiness-and-cleanup.md STEP-7 へ削除前確認 3 点
      （padStart 誤り→git rm 失敗→reset 汚染の 3 連鎖ミス防止）、
      (4) case-close の検証差分規約（正規所有: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節）
      へ件数突合系 gate の個別実行と証跡退避の必須化を (7) と統合して追記
      （workflow-templates SKILL.md・templates/pr_desc.md への記録様式反映は (7) と同一編集バッチ）、
      (5) definition-pr-and-idempotency.md へ計測日 1 日遅れの同一 PR 内再 commit 収束規律、
      (6) requirement-development.md STEP-4 へ REQ 新設時 3 段確認
      （要件行の命題→実装実体の所在→検証手段）、
      (7) 検証差分規約へ checker 別必須要素（textlint: hard findings 集合の JSON 実測退避・
      traceability: summary と 9 種全列挙）。正規所有は v4-durable-state-and-recovery Design
      「ADF 実行識別情報の記録契約」節とする。
  - id: AG-003
    content: |
      prepare_definition_pr.ts の traceability gate 判定（L417-419 付近）について、missing-design を
      一律 fail とする現行実装を、missing-design status 判定（欠落の有無と status を区別した判定）へ変更する。
      Case #3530・#3532 で一律 fail による実害（design 対応を sidecar 登録済みの行が欠落扱いで停止）を解消する。
      変更に伴い case-open の gate 判定仕様を definition-pr-and-idempotency.md
      （Definition PR と冪等性の正規所有 reference）へ明記する。
  - id: AG-004
    content: |
      workflow_body_contract.test.ts へ明示的な test timeout を追記する（3 Case 実証の flaky 対策・
      32/40 の不安定実績）。あわせて quality-gates reference へ suite 負荷注記
      （同 suite が高負荷でタイムアウトしやすい旨と明示 timeout の運用指針）を追記する。
  - id: AG-005
    content: |
      close_mechanical_steps.ts の件数突合系 gate 報告について、報告 JSON を stdout へ退避する契約を確定する
      （learning C6 由来の script 契約拡張。RU-0193 から Decision/REQ 候補として引き継ぎされた論点）。
      case-close の検証差分（AG-002 (4)）と workflow-templates の記録様式（AG-002 (7)）が
      当該 stdout 出力を参照して記録を完結できることを受け入れ条件とする。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## artifact_actions operation"
    source_items: [AG-002]
    content: |
      節末尾へ update 操作の置換範囲契約を追記する:

      ### update operation の置換範囲と重複見出し検査

      update 操作の置換範囲は target_area の見出し行を含む。見出し行自体を置換対象とする場合、
      旧見出し行を old 文として指定し、新見出し行を含む置換結果を適用する。
      適用後、対象文書内に同名見出しの重複が発生していないことを検査する。
      重複が検出された場合は適用を差し止め、判断を要する差分として扱う。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: v4-durable-state-and-recovery
    target_area: "## ADF 実行識別情報の記録契約"
    source_items: [AG-002]
    content: |
      検証差分の checker 別必須要素と件数突合系 gate の実行契約を次のとおり定める。

      件数突合系 gate（textlint の hard 件数・traceability の計数等）は、まとめて 1 回の実行結果の引用で
      済ませず、gate 種別ごとに個別に実行し、各実行の出力を証跡として退避する。

      検証差分の checker 別必須要素:

      - textlint 系 checker: hard findings の集合を JSON 形式で実測退避する（対象ファイル数・
        violation 数・内訳の機械的再構成が可能な形式）。
      - traceability 系 checker: summary（pass/fail 計数）と 9 種の検出分類をすべて列挙する
        （0 件の分類も省略しない）。

      上記要素は検証差分記録の必須構成であり、checker 出力側の契約（check_integrity 等）と
      区分を保って相互参照する。件数突合系 gate の個別実行記録と証跡退避（case-close 検証差分）は
      本節の記録契約に従って完結する。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0185（checker 出力側）と RU-0193 C8（記録様式側）の処理領域が検証差分で交差する。
    resolution: 「checker 出力側 / 記録様式側」の区分を保ち、統合せず相互参照とする（intake 成果物の明示指示を採用）。
  - id: CR-002
    conflict: C6 の script 契約拡張（close_mechanical_steps.ts stdout 退避）を RU-0193 の対象に含めるか。
    resolution: RU-0193 の対象外とし、本 draft の AG-005 として独立要件化する（RU 本文の引き渡し指示に従う）。
  - id: CR-003
    conflict: RU-0184（textlint 40 件・draft-vocabulary-policy）との同時処理指示（C8 の hard findings JSON 退避が進捗管理の基盤）。
    resolution: 本 draft と draft-vocabulary-policy を同一 Wave で並走させる hint を case_open_hints に記録し、要件レベルの依存関係は設定しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0193
    target_design: { operation: update, domain: responsibilities, slug: artifact-contracts }
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0193
    target_design: { operation: update, domain: foundations, slug: v4-durable-state-and-recovery }
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0194
    target_req: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0185
    target_req: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0193
    target_req: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity を .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts から実行する。
      (1) 正常終了時（exit 0）に stderr へ fatal 分類の出力が出ないこと、
      (2) 集計定義（対象範囲・件数の数え方）が出力契約文書に明記されていること、
      (3) 集計乖離（8 vs 7）の再現を試み、再現しない場合はその記録を残すこと（再現時は条件を特定）。
    pass_criteria: exit 0 時の stderr 整理が完了し、集計定義の明記と乖離再現確認（または非再現記録）が完了していること。
    on_failure: fix-and-reverify（出力分類の実装不備は修正して再検証する。集計仕様の設計判断を要する場合は本要件に差し戻す）。
  - id: TS-002
    target_item: AG-002
    verification: |
      7 件の追記先（src/common/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md・
      artifact-contracts.md「## artifact_actions operation」節・readiness-and-cleanup.md・
      v4-durable-state-and-recovery.md「ADF 実行識別情報の記録契約」節（件数突合 gate と checker 別必須要素を統合追記）・
      definition-pr-and-idempotency.md・requirement-development.md・
      workflow-templates SKILL.md と templates/pr_desc.md）について、
      rg で各規律のキー表現が追記済みであることを確認する。C6/C8 の workflow-templates・pr_desc 反映が
      同一編集バッチであることを diff で確認する。
    pass_criteria: 全追記先に規律が反映され、同一バッチ指示が遵守されていること。
    on_failure: fix-and-reverify（追記漏れは修正して再検証する）。
  - id: TS-003
    target_item: AG-003
    verification: |
      bun test scripts/self/release/case-ready-definition-readiness.test.ts（65 pass 基準）および
      prepare_definition_pr.ts の gate 判定に関する既存テストを実行する。
      missing-design status 判定に変更後、design 対応 sidecar 登録済みの行が欠落扱いで停止しないこと、
      真の欠落が検出されることを確認する。definition-pr-and-idempotency.md への gate 判定仕様明記を確認する。
    pass_criteria: 関連テストが全件 pass し、gate 判定仕様の明記が完了していること。
    on_failure: fix-and-reverify（判定ロジックの実装不備は修正して再検証する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      workflow_body_contract.test.ts に明示 timeout が追記されていることを確認し、テストを複数回（3 回以上）
      実行して安定 pass することを確認する。quality-gates reference への負荷注記を確認する。
    pass_criteria: 明示 timeout の追記と 3 回連続安定 pass・注記の完了していること。
    on_failure: fix-and-reverify（timeout 値の調整・注記不足は修正して再検証する）。
  - id: TS-005
    target_item: AG-005
    verification: |
      close_mechanical_steps.ts を件数突合系 gate が実行される経路で実行し、報告 JSON が stdout へ出力されることを確認する。
      case-close 検証差分の記録様式（AG-002 (4)・(7)）が当該出力を参照して完結する記述になっていることを確認する。
    pass_criteria: stdout 退避の実装と記録様式からの参照が整合していること。
    on_failure: fix-and-reverify（出力形式の不一致は修正して再検証する）。

realization_actions:
  - id: RA-001
    concern: check_integrity の stderr 分類と集計定義明記
    responsibility: checker スクリプトの出力契約実装とその文書化
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - .opencode/skills/repo-agentdev-integrity/ 配下の出力契約記述
    intent: exit 0 時の fatal 汚染を除去し、集計の再解釈を防ぐ
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: learning 規律 7 件の配布物・Design への追記
    responsibility: 各 workflow/capability skill の reference 文書保守
    ownership_hints:
      - src/common/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md（原子書込順序・adversarial-review で実在先確認）
      - src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md（STEP-7 前置確認）
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（計測日収束・AG-003 の gate 判定仕様明記）
      - src/common/skills/agentdev-workflow-req-define/references/requirement-development.md（REQ 新設 3 段確認）
      - src/common/skills/agentdev-workflow-templates/SKILL.md と templates/pr_desc.md（C6/C8 同一バッチ反映）
    intent: 実害済みの運用規律を正規所有文書へ定着させる
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: prepare_definition_pr.ts の missing-design status 判定変更
    responsibility: case-open の traceability gate 実装
    ownership_hints:
      - scripts 配下 prepare_definition_pr.ts（L417-419 付近の一律 fail）
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（gate 仕様記述先）
    intent: design 対応登録済み行の誤停止を解消し、真の欠落のみを検出する
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: workflow_body_contract.test.ts の明示 timeout と負荷注記
    responsibility: テストの安定性維持
    ownership_hints:
      - workflow_body_contract.test.ts
      - quality-gates reference（src/common/skills/agentdev-quality-gates/）
    intent: 高負荷 suite の flaky 実行を明示 timeout で安定化する
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: close_mechanical_steps.ts の報告 JSON stdout 退避
    responsibility: case-close 機械工程の報告契約実装
    ownership_hints:
      - close_mechanical_steps.ts
      - case-close.md 検証差分・workflow-templates SKILL.md の記録様式（AG-002 (4)(7) と接続）
    intent: 件数突合 gate の報告を stdout 退避で機械的再構成可能にする
    verification_refs: [TS-005]
    source_items: [AG-005]

case_open_hints:
  epic_needed: false
  wave_hints:
    - "draft-vocabulary-policy（RU-0184 textlint 40 件）と同時 Wave 処理が望ましい（C8 の hard findings 集合 JSON 退避が進捗管理の基盤様式）"
    - "artifact-contracts.md を編集する draft-docs-consistency（RU-0189 ADF-COVERS 宣言是正）と同一ファイル編集となるため同時 Wave 配置を推奨（RU-0193 の指示）"
```

# summary

RU-0185（check_integrity 集計契約・stderr 整理）・RU-0193（learning docs 系 7 件）・RU-0194（learning fix 系 2 件）の 3 RU を統合した。Design への保存対象（artifact-contracts.md・v4-durable-state-and-recovery.md）は artifact_actions 2 件、実装・配布物修正は realization_actions 5 件へ構造化した。C6 script 拡張（AG-005）は RU-0193 から引き継いだ Decision/REQ 候補を要件化した。
