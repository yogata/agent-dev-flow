---
draft_type: req_draft
topic_slug: qg4-final-acceptance-close-mechanical-alignment
status: draft
created_at: 2026-10-15T01:55:00+09:00
source_rus: [RU-0226]
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >-
  QG-4 最終受入規範が受理条件5・7の機械受理記録で由来分類済み pre-existing fail を含む合格を認める一方、case-close
  機械工程（close_mechanical_steps.ts）が integrity gate の非ゼロ終了を由来分類の入力余地なく無条件拒否する不整合の解消を合意した。REQ-032
  へ「機械判定は規範の機械受理基準を満たす検証結果記録に従う」対応不変行（REQ-032-039）を追加し、case-close Design
  へ受理条件5/7/8と機械判定経路の対応・分類記録機械検証経路・既知欠陥登録経路対応を単一所有する節を追加する。整合方向（規範側文言改訂か機械工程側修正か）と
  bun test suite fail の既知欠陥登録様式はユーザー判断として未解決質問に保持する。実現面（規範文言・機械判定経路・両方向実証テスト・Case
  #3710 完了）は realization_actions で引き継ぐ。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      現行不一致の確定: QG-4 最終受入規範のフル suite 機械受理における受理条件5（fail 全件の由来分類・由来不明
      0）・受理条件7（pre-existing fail の baseline 再現確認記録）・受理条件8（終了コード記録）と、case-close
      機械工程（close_mechanical_steps.ts の integrityGates 終了コード集約 → exitCategory 判定 →
      isCloseOperationPermitted）の機械判定経路との対応が過不足なく記録されること。Case #3710
      停止時証拠（PR #3713 検証差分の保存済み QG-4 記録: 分割1 2905pass/2fail・分割3 347pass/1fail の計3 fail
      が main HEAD 対照完全一致で pre-existing 分類済み、機械拒否で停止）と突合して現行の乖離を実測として確定すること
  - id: AG-002
    content: >-
      整合方向の確定と反映: 整合方向を正規経路（判断記録を伴う）で確定し、確定した方向を規範または機械工程の該当側へ反映して、同一入力に同一結果を返すこと。由来不明
      fail・記録欠落・未登録の既知欠陥を合格の根拠にする結果の拒否はいずれの方向でも維持すること（緩和しない）
  - id: AG-003
    content: >-
      既知欠陥登録経路の確定: 既知欠陥登録経路の実在・様式・所有者を記録し、規範文言と機構の対応を確定すること。既存機構（provenance 付き
      NG baseline）が bun test suite fail に適用できない場合は、文言整合（機械受理基準の記録一式を登録様式とする定義）または最小登録経路のいずれかを判断記録付きで確定すること。新規の恒久例外機構は追加しないこと
  - id: AG-004
    content: >-
      機械判定の整合実証: 分類記録が揃った pre-existing fail を含む結果が close 許可として機械的に通ること、由来不明
      fail・記録欠落・登録欠落が拒否されることの両方向を、既存テスト資産（close_mechanical_steps.test.ts・final-acceptance.test.ts）を用いて検証すること
  - id: AG-005
    content: >-
      Case #3710 の完了: 保存済み QG-4 証拠（不足時のみ不足分の再取得）により case-close
      を完結すること。合格済み case-run を再実行せず、元の完了条件を変更せず、PR #3713 の統合・Issue #3710
      のクローズ・worktree 後片付けを読戻し確認して完了すること
  - id: AG-006
    content: >-
      検証共通条件（RU-0226「検証に関する共通条件」節の投影）: 本件の全合意項目の検証は現行 main
      で実施すること（過去状態（当時の main HEAD）を現行値として扱わない）。否定的実証（拒否されるべきものが拒否されること）を検証に含めること。Epic
      #3717（RU-0224/0225）で完了済みの bun test 正常化を再実行対象にしないこと。契約変更が必要な判断は達成済み扱いにせず、判断記録とともに報告すること

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-004]
    content: |-
      | REQ-032-039 | case-close の機械工程は、フル suite 実行を要求する case において QG-4 最終受入規範の機械受理基準（記録の存在、形式、fail 全件の由来分類の完備）を満たす検証結果記録に従って機械判定を行うこと。規範が合格として認める結果を合格として扱い、機械受理基準の記録欠落、由来不明 fail の残存、未登録の既知欠陥を合格の根拠にする結果を終了操作の許可から拒否すること。受入評価と機械工程の拒否経路が同一入力に対して背反せず、機械判定経路と規範の受入条件の対応が case-close Design に単一所有されること。検証ランナーの非ゼロ終了コードを成功へ変換せず、由来不明 fail と記録欠落と未登録の既知欠陥の拒否を緩和しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    canonical_owner: docs/designs/commands/case-close.md（機械工程の script 呼び出し契約（RU-0162）節。正規所有者は case-close command Design）
    target_area: "### QG-4 機械受理基準と機械判定経路の対応（RU-0226）"
    placement: tail
    anchor: "## 機械工程の script 呼び出し契約（RU-0162）"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |-
      ### QG-4 機械受理基準と機械判定経路の対応（RU-0226）

      機械工程の full integrity suite 判定と QG-4 最終受入規範（agentdev-quality-gates の references/qg-4-final-acceptance.md）の機械受理基準との対応は本節が単一所有する。機械受理基準の記録様式の定義は QG-4 規範が正であり、本節は対応関係のみを記述し様式を再掲しない。

      - 機械受理基準と機械判定経路の対応: 受理条件5（fail 全件の由来分類、由来不明 0）と受理条件7（pre-existing fail の baseline 再現確認記録）を満たす検証結果記録は、full integrity suite に fail 件数が残存していても規範が合格として認める受理経路である。機械工程は当該記録の存在・形式を機械受理基準の10項目の記録完備で検証し、終了操作許可の判定に反映する。受理条件8の「非ゼロ終了・timeout 打ち切り・切断した実行結果を pass 証拠として扱わない」は、由来分類記録を欠く生の実行結果単独を pass 証拠としない意味として適用する
      - 拒否経路の背反防止: 受入評価の拒否（closeAllowed 相当）と機械工程の exitCategory による拒否の2系統は、同一入力に対して同一の判定結果へ収束すること。機械受理基準を満たす記録で分類済みの fail が残る場合、機械工程の当該 step は規範の判定に従い、機械受理基準の記録欠落、由来不明 fail の残存、未登録の既知欠陥を合格の根拠にする場合は fail-closed として終了操作を拒否する
      - 終了コードの非変換: 機械工程は検証ランナーの非ゼロ終了コードを成功へ変換しない。終了コードは受理条件8の記録として保持し、分類記録の検証は終了コードの変換ではなく独立の判定層として重ねる
      - 既知欠陥登録経路の対応: checker NG の登録は provenance 付き NG baseline（契約の正は checker 実行契約 Design「baseline 退避物と BaselineFile の役割分離と合否判定基準」節と integrity 契約 Design「NG baseline 運用手順」）とする。bun test suite fail の登録様式は文言統合とする（ユーザー判断 2026-10-15・判断記録 CR-003/CR-004）: 機械受理基準の記録一式（受理条件5の由来分類記録・受理条件7の baseline 再現確認記録・provenance・件数記録）を登録様式と定義し、恒久台帳は新設せず、既存の PR 本文検証差分が当該記録一式の登録として機能する。整合方向は機械工程側の修正（implementation-first）に確定済みであり、機械工程は当該記録一式の存在・形式を機械受理基準の10項目の記録完備で検証して終了操作許可の判定に反映する。未登録の既知欠陥を合格の根拠にする結果の拒否は維持する

conflict_resolutions:
  - id: CR-001
    conflict: >-
      合意済み REQ 行案の初期文言が機械工程側修正（implementation-first）前提の表現（pre-existing-classified fails
      を受理する must accept を含む）を含み、方向未確定のままでは方向の事前決定に見做されるリスク（アーキテクチャ助言の指摘）
    resolution: >-
      行文を対応不変行（機械判定は規範の機械受理基準を満たす検証結果記録に従い、規範が合格として認める結果を合格として扱う）として方向非依存に確定した。受理・拒否の意味詳細の正は規範が持ち、方向確定後に規範または機械工程のいずれかが具体化する。行の命題（対応の維持・単一対応表所属・fail-closed）は両方向で不変
  - id: CR-002
    conflict: アーキテクチャ助言が「docs/knowledge/issue-resolution-and-qg4.md は不在」と報告した点
    resolution: >-
      親エージェントの実測で src/common/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md（L81-90）に実在を確認した。同節
      L85 が baseline 契約の正を checker 実行契約 Design・integrity 契約 Design（NG baseline 運用手順）へ委任している点は助言の引用どおりであり、参照格子は実在パスと委任先の両方を正として確定した
  - id: CR-003
    conflict: >-
      整合方向（AG-002・auto_gate 未解決質問1件目）: 規範側文言改訂（norm-first）か機械工程側修正（implementation-first）かが未確定であり、反映先と REQ-007 系要件の前提が方向依存として保留されていた
    resolution: >-
      ユーザー判断（2026-10-15）により implementation-first（機械工程側修正）へ確定した。case-close 機械工程（close_mechanical_steps.ts）は
      QG-4 最終受入規範の機械受理基準に従い、記録完備（受理条件5の fail 全件の由来分類・受理条件7の baseline 再現確認記録を含む）の上で
      pre-existing 分類済み fail を含む結果を規範が認める受理経路どおり受理する。REQ-007 系要件は変更せず、規範を fail 0 要求へ改訂しない。由来不明
      fail・記録欠落・未登録の既知欠陥の拒否はいずれの方向でも維持する。RA-001 は受理条件8末尾文の解釈明確化と登録様式の文言統合を、RA-002
      は分類記録の入力契約と機械受理基準記録完備の検証経路の実施を担う
  - id: CR-004
    conflict: >-
      bun test suite fail の既知欠陥登録様式（AG-003・auto_gate 未解決質問2件目）: 文言統合（機械受理基準の記録一式を登録様式と定義）か最小登録経路（PR 本文検証差分を登録様式とする経路定義）かが整合方向と連動して未確定だった
    resolution: >-
      ユーザー判断（2026-10-15）により文言統合へ確定した。QG-4 機械受理基準の記録一式（受理条件5の由来分類記録・受理条件7の baseline 再現確認記録・provenance・件数記録）を
      bun test suite fail の登録様式と定義する。恒久台帳（NG baseline のような新規登録機構）は新設せず、既存の PR 本文検証差分が当該記録一式の登録として機能する。checker
      NG の登録は既存の provenance 付き NG baseline のままとする。ACT-DESIGN-001 の対応表登録経路行は本確定値へ更新した

operation_units:
  - ou_id: OU-001
    source_ru: RU-0226
    target_req: REQ-032
    target_design: docs/designs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      受理条件5/7/8（qg-4-final-acceptance.md の機械受理基準）と機械判定経路（close_mechanical_steps.ts の integrityGates 終了コード集約・assembleReport の exitCategory 判定・isCloseOperationPermitted）の対応表を、規範・実装・Case #3710 停止時証拠（PR #3713 検証差分）の3点で突合する
    pass_criteria: |-
      対応表が受理条件と判定経路を過不足なく網羅し、Case #3710 の機械拒否経路（3 fail pre-existing 分類済み → exitCategory failure → 機械拒否で停止）が対応表上で説明できること
    on_failure: |-
      fix-and-reverify: 対応表または対応の実測に誤りがある場合は修正して再突合する。実測で不整合が再確認された場合は達成済み扱いにせず判断記録とともに報告する
  - id: TS-002
    target_item: AG-002
    verification: |-
      方向確定後の変更（規範文言または機械工程判定経路のいずれか）を適用した状態で、分類記録揃い pre-existing fail 含む入力が合格、由来不明残存・記録欠落・未登録既知欠陥の各入力が拒否されることを確認する
    pass_criteria: |-
      同一入力に対する判定が変更後に同一結果（合格ケースは合格・拒否ケースは拒否）となり、由来不明 fail・記録欠落・未登録の既知欠陥の拒否が維持されること
    on_failure: |-
      fix-and-reverify: 判定経路または文言を修正して再検証する
  - id: TS-003
    target_item: AG-003
    verification: |-
      確定した登録経路について、規範文言と機構の対応（checker NG = provenance 付き NG baseline、bun test suite fail = 確定様式）が case-close Design の対応表に様式・所有者つきで記録されていることを確認する
    pass_criteria: |-
      対応記録が実在・様式・所有者を含み、未登録の既知欠陥を合格の根拠にする結果の拒否が文言変更後も維持されること
    on_failure: |-
      fix-and-reverify: 対応表の登録経路行を修正して再確認する
  - id: TS-004
    target_item: AG-004
    verification: |-
      close_mechanical_steps.test.ts / final-acceptance.test.ts に、(a) 分類記録揃い pre-existing fail 含む → close 許可、(b) 由来不明 fail 残存 → 拒否、(c) 機械受理基準の記録欠落 → 拒否、(d) 未登録既知欠陥を合格根拠とする → 拒否、の4系統を追加し、bun test 正規形（repo root 起点の cwd・./ 付きパス指定・実行件数確認）で実行する
    pass_criteria: |-
      4系統すべて期待どおりの判定となり、実行件数が 0 件ではないことを件数サマリー（Ran N tests）で確認すること
    on_failure: |-
      fix-and-reverify: テストまたは判定経路の実装を修正して再検証する
  - id: TS-005
    target_item: AG-005
    verification: |-
      保存済み QG-4 証拠の pre-existing 分類を現行 main（マージ直前 HEAD）と突合して分類の陳腐化（並行 Case での解消済み）がないことを確認した上で case-close を実行する。保存済み証拠が機械判定の受理経路で受理され close が完結すること（AG-004 の実運用経路での実証を兼ねる）を確認し、PR #3713 マージ・Issue #3710 クローズ・worktree 後片付けを読戻し確認する。証拠不足時のみ不足分を再取得する
    pass_criteria: |-
      close 完結・読戻し確認・case-run 再実行なし・元の完了条件変更なしであること
    on_failure: |-
      fix-and-reverify: 分類陳腐化検出時は証拠再取得後に再評価する。機械判定の不整合が残る場合は達成済み扱いにせず判断記録とともに報告する
  - id: TS-006
    target_item: AG-002
    verification: |-
      規範・Design の文言変更後、pre-existing・既知欠陥・環境依存・未登録 等の語彙の参照箇所を rg で検索（対象: src/common/skills/agentdev-quality-gates/、src/common/skills/agentdev-workflow-case-close/、docs/designs/integrity/、docs/designs/commands/case-close.md。修正対象ファイルとその参照先に網羅範囲を限定し、See Also 等の参照行は参照行として区別する）し、変更文言が既存の語彙対応（pre-existing=既知欠陥・環境依存の写像、NG baseline 運用）を破壊しないことを確認する
    pass_criteria: |-
      語彙対応の破壊 0 件（または検出分の修正対象が列挙・対応済み）であること
    on_failure: |-
      fix-and-reverify: 語彙を再調整して再検査する
  - id: TS-007
    target_item: AG-004
    verification: |-
      close_mechanical_steps.ts 変更後、closeAllowed・exitCategory・新規フィールドの消費箇所を rg で検索（対象: src/common/skills/agentdev-workflow-case-close/ の workflow skill 本体と scripts、docs/designs/commands/case-close.md。See Also 等の参照行は検出対象外とする）し、報告 JSON 契約と消費側記述（機械工程の script 呼び出し契約節・RU-0226 対応節）の整合を確認する
    pass_criteria: |-
      消費側が契約変更後の全フィールドを正しく解釈し、終了操作の実行抑制条件が維持されること
    on_failure: |-
      fix-and-reverify: 消費側記述または契約を修正して再確認する

realization_actions:
  - id: RA-001
    concern: QG-4 規範文言の整合（方向依存差分の適用）
    responsibility: >-
      QG-4 最終受入規範の正は agentdev-quality-gates の references/qg-4-final-acceptance.md
      が所有する。整合方向が規範側文言改訂となる場合は受入基準・観点10 pass 条件・語彙対応表・3点対照手順の改訂を実施し、機械工程側修正となる場合は受理条件8末尾文の解釈明確化（由来分類記録を欠く生の実行結果単独を
      pass 証拠としない意味）と bun test suite fail の登録様式の文言統合を実施する
    ownership_hints:
      - src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      - docs/designs/skills/agentdev-quality-gates.md
    intent: 規範と機械工程の受理経路の意味を一致させる
    verification_refs: [TS-002, TS-003, TS-006]
    source_items: [AG-002, AG-003]
  - id: RA-002
    concern: case-close 機械工程の機械判定経路
    responsibility: >-
      機械工程の実装は agentdev-workflow-case-close の scripts/src/close_mechanical_steps.ts
      が所有する。整合方向が機械工程側修正となる場合、分類記録の入力契約と機械受理基準記録完備の検証経路を追加し、終了コード記録の保持・非変換、fail-closed（記録欠落・由来不明・未登録の拒否維持）、受入評価と機械工程の2拒否経路の背反防止を実装する。規範側文言改訂となる場合は現行実装と改訂後規範の対応を確認する
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      - docs/designs/commands/case-close.md
    intent: 分類記録揃い pre-existing fail を規範どおり機械的に受理する
    verification_refs: [TS-002, TS-004, TS-007]
    source_items: [AG-002, AG-004]
  - id: RA-003
    concern: 両方向機械実証テストの追加
    responsibility: >-
      テスト資産は agentdev-workflow-case-close の scripts/tests/ が所有する。許可4系統（TS-004 の (a)〜(d)）を追加する
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/final-acceptance.test.ts
    intent: 機械判定の整合を両方向（受理と拒否）で機械的に実証する
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-004
    concern: Case #3710 の close 完結
    responsibility: >-
      case-close の実行契約（REQ-032・case-close Design）に従う。保存済み証拠・不足時のみ再取得・case-run
      再実行なし・完了条件変更なしで PR #3713 統合・Issue #3710 クローズ・worktree 後片付けを行う
    ownership_hints:
      - "Issue #3710"
      - "PR #3713"
      - agentdev-workflow-case-close skill（case-close 実行）
    intent: 停止中 Case の完了により不整合解消を実運用で実証する
    verification_refs: [TS-005]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0226
    source_item: A-01
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-001 として合意項目化し、TS-001 が対応表の3点突合を検証する
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 決定的受け入れ条件（A-01: 現行不一致の確定）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0226
    source_item: A-02
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-002 として合意項目化し、TS-002/TS-006 が反映後の同一入力同一結果と語彙整合を検証する。方向確定の HITL は auto_gate.unresolved_questions に保持
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 決定的受け入れ条件（A-02: 整合方向の確定と反映）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0226
    source_item: A-03
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-003 として合意項目化し、TS-003 が文言と機構の対応を検証する。登録様式の判断は auto_gate.unresolved_questions に保持し、ACT-DESIGN-001 の対応表に判断保留行を明記
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 決定的受け入れ条件（A-03: 既知欠陥登録経路の確定）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0226
    source_item: A-04
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-004 として合意項目化し、TS-004/TS-007 が両方向の機械実証と報告 JSON 消費整合を検証する
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 決定的受け入れ条件（A-04: 機械判定の整合実証）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0226
    source_item: A-05
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-005 として合意項目化し、TS-005 が保存済み証拠による close 完結（分類陳腐化突合・読戻し確認含む）を検証する。RA-004 が実現面を引き継ぐ
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 決定的受け入れ条件（A-05: Case #3710 の完了）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0226
    source_item: 検証に関する共通条件
    disposition: covered
    reason_code: covered_by_agreed_item
    reason: AG-006 として全 test_strategy 項目の前提に投影した（adversarial-review での投影漏れ指摘の反映）
    evidence:
      path: .agentdev/backlog/req-units/RU-0226.md
      section: 検証に関する共通条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-032.md
    target_content_sha256: 13aea37fd6f66cfeea8ae12db9526e536cbeafafb4e50083f2493088f193d029
    check_scope:
      heading: "## 要件"
      start_line: 15
      end_line: 57
    execution_conditions:
      operation: append
      edit_sha256: 70d3fd9194f6cbdc04ff1f7430246c3419b2c4964d307cc669cf7dd192c97138
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 0
    executed_at: "2026-10-14T16:34:34.401Z"
  - target_file: docs/designs/commands/case-close.md
    target_content_sha256: 1ddb558e14afe52fd0f8a836ff93d66399dc8ce89ae2667279bba0deeaea554f
    check_scope:
      heading: "## 機械工程の script 呼び出し契約（RU-0162）"
      start_line: 334
      end_line: 345
    execution_conditions:
      operation: append
      edit_sha256: 9090cbd9c2e08f4cb4ab9df36de7f67f854137ae54631f0abe049a73361aecc8
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 9
      added: 9
      removed: 0
    executed_at: "2026-10-14T16:34:34.554Z"

case_open_hints:
  epic_needed: false
```

# summary

QG-4 最終受入規範と case-close 機械工程の受理経路不整合（Case #3710 停止事象）の解消要件。REQ-032 へ対応不変行（REQ-032-039）を追加し、case-close Design へ受理条件5/7/8と機械判定経路の対応表を単一所有する節を追加する。work_type=bugfix・scale=standard・単一 Issue。

Decision は不要と判断した（既存契約維持の不整合修正であり、受入基準の正は skill reference が原本、既存 accepted Decision の置換なし、責務境界変更なし。RU-0162 先例と同一パターン）。判断根拠は本 draft の conflict_resolutions と要件doc確認時の記録による。

ユーザー判断待ち（auto_gate.auto_ready: false の停止理由）: (1) 整合方向（規範側文言改訂 vs 機械工程側修正。REQ 層証拠は分類ベースの読みと整合し、機械工程側修正なら REQ-007 系は変更不要、規範側改訂なら REQ-007 系の全面改訂と Case #3710 の同期再実行を要し得る）(2) bun test suite fail の既知欠陥登録様式（文言統合 vs 最小登録経路。checker NG は既存 NG baseline が正）。2問は連動する。

adversarial-review（STEP-8）実施済み。主な採用 finding: RU 検証共通条件の AG-006 としての投影（投影漏れ解消）、TS-005 へ機械受理経路実証の明示、review_dispositions の section 精緻化。撤回: unresolved_questions の形式、OU operation 表記、work_type/scale 判定への疑義。残留リスク: 受理条件8末尾文の文言化は方向確定後の RA-001 が所有（Design 対応節に解釈は明記済み）、AG-002 の判断記録媒体は REQ-004-048 既定運用（auto_gate 解消時に conflict_resolutions へ追記）による。

5観点境界リスク分析（dependency・client/server・execution・build/runtime・environment propagation）実施済みで、導出5リスクは TS-004〜TS-007 へ投影済み（R1 語彙破壊→TS-006、R2 報告 JSON 消費不整合→TS-007、R3 様式乖離による停止再発→TS-004/TS-005、R4 実行形態逸脱→TS-004、R5 分類陳腐化→TS-005）。docs/knowledge/ 適用規則4件（語彙突合・実行形態逸脱・pre-existing 陳腐化突合・baseline 再現手順）を参照した。
