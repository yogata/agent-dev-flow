---
draft_type: req_draft
topic_slug: change-impact-evaluation-handoff
status: draft
created_at: "2026-11-03T22:48:56.409+09:00"
source_rus:
  - RU-0256
---

<!-- req_draft: RU-0256（差分・変更影響評価と後続への引渡し）の要件定義ドラフト。
  基準 commit: 3b6d0e30a6b4eebb3556458cabf0cde0ea3b4957（main HEAD と一致確認済み）。
  入力: .agentdev/backlog/req-units/RU-0256.md（session由来RU。正式化済み。参照専用）、
  利用者指示（RU-0255実施後にRU-0256を実施する全件実装指示。実装着手承認済み。
  実装は最小修正候補Aを含むRU2-AC全条件への対応を計画し、実装・試験は後続工程で行う）、
  先行調査（deleg_8d4f27ca task-1: listTouchedPaths git log失敗→空集合→fullyPropagated yes、
  AC5/AC6消費経路未接続、net-zero無指定時起点消失、不在パス無判定）。 -->

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  RU-0256（差分・変更影響評価と後続への引渡し）を要件定義した。REQ-106 の既存行（106-001〜009）が
  比較基準・差分抽出・影響分類・起点引継ぎ・完了判定の主要義務を既に所有するため、本 draft は増分として
  (1) 差分・履歴取得失敗の空集合隠蔽の禁止と構造化エラー報告（最小修正候補A: lib listTouchedPaths 失敗時
  null 返却 + relied-diff CLI の構造化エラー）を REQ-106-010、(2) 変更起点・影響候補・比較基準・判断結果・
  未確認事項の後続取得経路を REQ-106-011 として REQ-106 へ APPEND させる。Design は agentdev-traceability
  の公開能力節へ relied-diff CLI 契約（失敗時非ゼロ終了・正味差分ゼロの起点保持・unverified レポート・
  後続取得経路）を追記する。REQ-107/110/111 は参照接続のみで無変更（既存行が相当義務を所有）。
  正味差分ゼロ時の候補集合決定と不在パス判定は REQ-106-005/007 の既存義務の実装遵守として
  realization_actions で所有し、新規REQ行は追加しない。新しい台帳・汎用依存グラフ・履歴DBは設けない。
  重要変更識別: 該当なし（既存行の意味変更を含まない増分追記のみ）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      正しい比較対象の使用。実際の依拠版が判明している場合はその版を比較基準とし、工程開始時点の版を無条件に代用しない。依拠版が特定できない場合は根拠ある代替確認の範囲を限定し、存在しない旧下流成果物との比較を要求しない（REQ-106-001/002/003 の既存義務の維持）。
  - id: AG-002
    content: |
      変更事実と意味的影響の区別。Gitの変更事実（name-status・log）と内容上の影響（blob比較・中間変更）を区別し、対応関係が空という理由だけで無影響とせず、正味差分ゼロでも中間版に依拠する下流への影響を無条件に除外しない（REQ-106-004/005/007 の既存義務の維持）。
  - id: AG-003
    content: |
      影響候補と根拠の明示。影響候補ごとに更新必要・更新不要・作成・未確認を判断し、各判断の根拠・対象・比較に使用した版・未確認の理由を出力で確認できるようにする。判断根拠なしに更新不要としない（REQ-106-006 の既存義務の維持）。
  - id: AG-004
    content: |
      取得失敗と判定不能の適切な扱い（最小修正候補A）。差分・履歴取得の失敗を空の変更集合として隠蔽しない。lib 側（listTouchedPaths）は失敗時に失敗を表す返却値とし、CLI（relied-diff）は既存の構造化エラー経路（fail + 非ゼロ終了）で報告する。失敗・依拠版不明・比較不能を根拠に影響なし・完了と判定しない（REQ-106-010 として新規所有）。
  - id: AG-005
    content: |
      後続への情報引渡し。変更起点、影響候補、比較基準、判断結果、未確認事項を後続工程（工程駆動・変更駆動）が取得できる出力として保持する。中間工程で更新不要と評価された場合も変更起点を後続へ引き継ぐ（REQ-106-011 として新規所有）。
  - id: AG-006
    content: |
      両経路・再実行での成立。工程駆動と変更駆動の共通評価経路で、通常実行・途中失敗・再実行において実際の正規状態から必要な処理を継続し、未確認状態を成功へ誤変換しない。局所スクリプトの成功だけを根拠に利用経路での成立を報告しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-106.md
    target_area: 要件
    source_items: [AG-004, AG-005]
    content: |
      | REQ-106-010 | 差分・履歴取得の失敗を空の変更集合や正常結果として隠蔽しないこと。取得失敗は後続が失敗と識別できる構造化された報告（非ゼロ終了を含む）で伝え、失敗・依拠版不明・比較不能を根拠に「影響なし」や「完了」と判定しないこと |
      | REQ-106-011 | 変更起点、影響候補、比較基準、判断結果、未確認事項を、後続工程（工程駆動・変更駆動）が取得できる出力として保持すること。中間工程で更新不要と評価された場合も変更起点を後続へ引き継ぎ、後続が同じ情報に基づき必要な評価・再検証を継続できること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-traceability.md
    target_area: 公開能力
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      ### relied-diff（依拠版に基づく差分・変更影響 CLI）

      依拠版（--relied）と現行版の差分から、影響候補（update / up-to-date / unverified・propagationRequired）、
      下流作成分類（create）、旧検証証拠の上流整合（confirmed / stale / unconfirmed）、
      変更反映完了判定（fullyPropagated: yes / no / undetermined）を出力する。

      - Git 実行不能（git 不在・非 git リポジトリ・履歴取得失敗）は構造化エラーで非ゼロ終了し、空の変更集合として正常扱いしない。
      - 正味差分ゼロでも中間変更があるパスは propagationRequired とし、変更起点を後続へ引き継ぐ。
      - 比較基準が指定なし・解決不能の場合は unverified レポートを返し、「影響なし」「完了」の判定を出さない。
      - 後続工程（工程駆動・変更駆動）は本 CLI の出力を影響評価の入力として取得する。

conflict_resolutions:
  - id: CR-001
    conflict: 同じ REQ-106 を主対象とする未処理draft RU-0259（完了済み過去工程の正規改訂）との範囲の重複。
    resolution: |
      RU-0259 は対象外節で「第1段階の差分評価機能の再実装」を除外しており、本RU（第1段階の差分影響評価能力）を前提とする下流である。方向の重複はないため、本 draft は第1段階の増分のみを所有し、正規改訂側の義務は RU-0259 に残す。
  - id: CR-002
    conflict: 最小修正候補Aの対象欠陥（listTouchedPaths の取得失敗隠蔽）が RU-0255 の実装検証で検出された点での帰属の混同リスク。
    resolution: |
      欠陥の所在は REQ-106 領域の差分抽出部品であり、改修の正規所有者は REQ-106 とする。RU-0255 の所有領域（要件変更の正規保存・AC4変更要件）とは統合先を区別し、関係は実行順序（利用者指示: RU-0255 の後に RU-0256）のみとする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0256
    target_req: REQ-106
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      依拠版が判明している状態、工程開始時点の版と依拠版が異なる状態、依拠版不明、新規作成で旧下流成果物が存在しない状態を用意し、公開CLI（relied-diff）から比較を実行する。入力と比較に使用した版、判定結果を出力とあわせて記録する。
    pass_criteria: |
      RU2-AC1 のとおり、依拠版を特定できるときはその版を用い、特定不能なら根拠ある代替確認の範囲を限定すること。存在しない旧下流成果物との比較を要求せず、工程開始時点の版を無条件に代用して影響なしと判定する事例が1件でもあれば不合格とする。判定は pass / fail / blocked / not applicable の4区分とし、構造検査・部品試験・実経路による検証を区別して記録する。
    on_failure: |
      fix-and-reverify。比較基準の解決・代替確認経路を修正して同一条件で再検証する。証拠不足と実装不備を区別して記録し、環境・権限不足で成立を証明できない場合は blocked として停止報告する。
  - id: TS-002
    target_item: AG-002
    verification: |
      変更あり、変更なし、明示対応関係が空、正味差分ゼロ、中間変更後の復元、途中版へ依拠する下流成果物の6事例を用意し、影響分類を実行する。Git の変更事実（name-status・log）と内容上の影響（blob 比較・中間変更）を出力と突合する。
    pass_criteria: |
      RU2-AC2 のとおり、変更事実と内容上の影響を区別し、必要な影響候補を見落とさないこと。対応関係が空という理由だけで無影響、または正味差分ゼロだけで中間版への依拠を無視した事例が1件でもあれば不合格とする。判定は4区分で記録する。
    on_failure: |
      fix-and-reverify。分類の決定表（classifyPathImpact）と候補集合の決定を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      影響候補ごとに更新必要・更新不要・作成・未確認の判断と、根拠・対象・比較に使用した版・未確認の理由を出力から確認する。
    pass_criteria: |
      RU2-AC3 のとおり、各判断の根拠が確認できること。判断根拠なしに更新不要とした事例が1件でもあれば不合格とする。判定は4区分で記録する。
    on_failure: |
      fix-and-reverify。根拠（basis）の出力を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      Git 履歴取得失敗（git 不在・非 git リポジトリ・不正な参照範囲）、依拠版不明、参照不能パス、旧検証証拠の適用可能性不明を用意し、部品試験（listTouchedPaths の失敗時返却）と公開CLIからの構造化エラー・非ゼロ終了の両面で実行する。
    pass_criteria: |
      RU2-AC4 のとおり、失敗や不明を後続に識別可能な形で伝えること。履歴取得失敗を空集合として正常終了させ、変更なしと同じ意味で利用した事例が1件でもあれば不合格とする（最小修正候補Aの対象欠陥の再現禁止）。判定は4区分で記録する。
    on_failure: |
      fix-and-reverify。失敗伝播（null 返却・構造化エラー）を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      relied-diff 出力（変更起点・影響候補・比較基準・判断結果・未確認事項）を後続工程（工程駆動・変更駆動）が取得する経路を実経路で実行し、中間工程で更新不要と評価された場合でも変更起点が後続へ渡ることを確認する。
    pass_criteria: |
      RU2-AC5 のとおり、後続が同じ情報に基づき必要な評価を継続できること。変更起点が途中で消失し、さらに下流の評価を実施できない事例が1件でもあれば不合格とする。部品試験だけでの合格とせず、実経路での成立を確認する。判定は4区分で記録する。
    on_failure: |
      fix-and-reverify。消費経路の接続を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      工程駆動と変更駆動の共通評価経路について、通常実行、途中失敗、再実行を実経路で実行する。既定検証条件（依拠版不明、中間変更、正味差分ゼロ、下流不在、対応関係なし、履歴取得失敗、旧証拠再利用）を含める。
    pass_criteria: |
      RU2-AC6 のとおり、実際の正規状態と既存の評価結果から必要な処理を継続でき、未確認状態を成功へ誤変換しないこと。局所スクリプトの成功だけを根拠に必要な利用経路での成立を報告した場合は不合格。変更前後のGitコミット、実成果物、依拠関係、取得結果、影響分類、引渡し結果を証拠として記録する。判定は4区分で記録する。
    on_failure: |
      fix-and-reverify。該当経路の実装を修正して同一条件で再検証する。

realization_actions:
  - id: RA-001
    concern: 差分履歴取得の失敗隠蔽の解消（最小修正候補A / AG-004）
    responsibility: lib の listTouchedPaths は git log 実行失敗時に空集合ではなく失敗を表す返却値（null）を返し、relied-diff CLI は既存の構造化エラー経路（fail(JSON.stringify(...)) + 非ゼロ終了。diffNameStatus の git-unavailable と同型）で報告する。失敗時の空集合を変更なしと同じ意味で利用する経路を残さない。
    ownership_hints:
      - "src/common/skills/agentdev-traceability/scripts/lib/relied_diff.ts（listTouchedPaths:149-158 の失敗時 return touched を解消）"
      - "src/common/skills/agentdev-traceability/scripts/src/relied-diff.ts（listTouchedPaths 呼出箇所の失敗伝播）"
      - "src/common/skills/agentdev-traceability/scripts/lib/（relied_diff の失敗伝播部品試験。既存テスト配置に従う）"
    intent: 取得失敗の隠蔽による変更影響の過小評価（履歴取得失敗→空集合→fullyPropagated yes）を構造的に排除する。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-002
    concern: 候補集合決定の実装遵守（正味差分ゼロ時の起点保持・不在パス判定 / AG-002）
    responsibility: --paths 未指定時の候補集合が name-status のみに依存しているため、正味差分ゼロで name-status に現れないパスの中間変更情報（listTouchedPaths 由来）を候補決定へ反映し、依拠版・現行版に存在しない指定パスも分類（unverified 等）から落とさない。REQ-106-005/007 の既存義務の実装遵守であり、新規REQ行は追加しない。
    ownership_hints:
      - "src/common/skills/agentdev-traceability/scripts/src/relied-diff.ts（candidateSet 決定と touched の統合）"
    intent: net-zero無指定時の変更起点消失と不在パスの無判定（先行調査で検出）を解消する。
    verification_refs: [TS-002, TS-006]
    source_items: [AG-002, AG-006]
  - id: RA-003
    concern: 後続消費経路の接続（AG-005、AG-006）
    responsibility: relied-diff 出力（変更起点・影響候補・比較基準・判断結果・未確認事項・fullyPropagated）を工程駆動経路（phase-artifacts-update の増分更新・変更反映）と変更駆動経路（req-define / case 系）が影響評価の入力として取得する接続を設ける。出力契約は agentdev-traceability Design の relied-diff 節（ACT-DESIGN-001）に記録する。
    ownership_hints:
      - "docs/designs/skills/agentdev-traceability.md（公開能力節・ACT-DESIGN-001）"
      - "docs/designs/workflows/v51-phase-transition-and-coexistence-model.md（phase-artifacts-update の変更反映経路との接続）"
    intent: AC5/AC6 の消費経路未接続（先行調査で検出）を解消し、中間更新不要評価後も変更起点が下流の評価へ届くようにする。
    verification_refs: [TS-005, TS-006]
    source_items: [AG-005, AG-006]

review_dispositions:
  - id: RD-001
    source_ru: RU-0256
    source_item: 主対象REQ（REQ-106）
    disposition: covered
    reason_code: addressed_by_this_draft
    reason: |
      本 draft の ACT-REQ-001（REQ-106-010/011 の APPEND）と ACT-DESIGN-001、RA-001〜003 で対応する。REQ-106 の目的（差分に基づく変更と確認の選択、見落としや根拠のない完了報告の防止）の範囲内の追加であり、既存行の意味変更を含まない。
    evidence:
      path: docs/requirements/REQ-106.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0256
    source_item: 関連要件（REQ-107）
    disposition: not_applicable
    reason_code: out_of_scope_owned_elsewhere
    reason: |
      検証の責務分離・完了判定の規律（REQ-107 の既存行）が既に所有する。本 draft は REQ-106-011 の後続取得経路から参照接続のみ行い、重複追加しない。
    evidence:
      path: docs/requirements/REQ-107.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0256
    source_item: 関連要件（REQ-110）
    disposition: not_applicable
    reason_code: out_of_scope_owned_elsewhere
    reason: |
      工程駆動経路の増分更新・変更反映・部分反映後の再実行は REQ-110 の既存行（110-008/009/017/021 等）が既に所有する。本 draft は relied-diff 出力の消費接続（RA-003）のみで REQ-110 行の変更を行わない。
    evidence:
      path: docs/requirements/REQ-110.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0256
    source_item: 関連要件（REQ-111）
    disposition: covered
    reason_code: addressed_by_this_draft
    reason: |
      工程駆動と変更駆動の併存の既存枠組み内で、両経路での評価成立（AG-006、TS-006）を確認対象とする。REQ-111 行自体の変更は行わない（参照接続のみ）。
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-106.md
    target_content_sha256: 7876642b19bee243fd6519f15e149fcc919d4f9c4860a502731b0d9b33cc1427
    check_scope:
      heading: "## 要件"
      start_line: 13
      end_line: 26
    execution_conditions:
      operation: append
      edit_sha256: null
      expected_old_count: null
    checker:
      name: assemble-draft-section
  - target_file: docs/designs/skills/agentdev-traceability.md
    target_content_sha256: eeeff1c41c4e6b072b36b7fc863e1e65c92eb4f58d89789b673a73e263806e1c
    check_scope:
      heading: "## 公開能力"
      start_line: 39
      end_line: 97
    execution_conditions:
      operation: append
      edit_sha256: null
      expected_old_count: null
    checker:
      name: assemble-draft-section

case_open_hints:
  epic_needed: false
  wave_hints: []
```
