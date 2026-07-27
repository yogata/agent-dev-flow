---
draft_type: req_draft
topic_slug: docs-references-cleanup-batch
status: saved
spec_actions_consumed: true
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0010
agentdev_handoff: true
---

<!-- 本ドラフトは AgentDevFlow 本体の不具合・改善点を扱う前工程引き継ぎドラフトである（agentdev_handoff: true）。 -->
<!-- 5 RU（RU-0001: deep-review SPEC 完了条件/自律審議継続、RU-0002: REQ-006 相互参照、RU-0003: document-model.md L27/L139 dangling 参照、
     RU-0004: document-model.md L153/L580 相互参照、RU-0010: runtime-package-boundary.md inspect-extensions stale 参照）を含む。
     各 RU は独立関心だが「既存 SPEC/REQ 文書の参照不整合・欠落の解消」という共通性でグループAとして1ドラフトにまとめた。 -->

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  RU-0001/0002/0003/0004/0010 を処理する。5件の独立した SPEC/REQ 文書参照不整合・欠落を解消する。
  RU-0001: agentdev-deep-review SPEC へ自律審議継続（AG-009）と完了条件（AG-013）の反映
  RU-0002: REQ-006 へ REQ-011-017/018 導線と非複製明記の追記
  RU-0003: document-model.md L27/L139 dangling 参照の正規要件確認と修正
  RU-0004: document-model.md L153/L580 の6処置モデル相互参照追加
  RU-0010: runtime-package-boundary.md L306 から inspect-extensions 削除、3 command へ縮約
  新規 ADR 不要、新規 REQ 作成なし。REQ-006 update と4 SPEC への spec-update を実施。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0001: docs/specs/skills/agentdev-deep-review.md へ「自律審議継続」セクションを追加する。
      RU-20260726-01 AG-009 で合意した「関連コンテキストから判断可能な限り自律審議を継続する」という肯定表現と、
      継続時に試行する8手続き（前提確認、根拠確認、誤解解消、適用範囲の限定、部分合意の探索、代替案の比較、
      追加証拠による再評価、批判内容の再構成）を列挙する。
      現状 SPEC は未解決争点をユーザーへ返す条件（論理的な対）のみを記載し、TS-005 が要求する肯定表現と手続き列挙を満たしていない。
  - id: AG-002
    content: |
      RU-0001: docs/specs/skills/agentdev-deep-review.md へ「完了条件」セクションを追加する。
      RU-20260726-01 AG-013 で合意した審議全体の完了条件8項目（本質的争点の解消、妥当な批判の反映、撤回済み批判の排除、
      部分合意範囲、ユーザー判断事項、再検証、新規争点、議論継続自体の目的化）を列挙する。
      形式的同一判定や固定観点全 PASS を完了条件としないことを明示する。
      現状 SPEC の「合意条件」は争点単位の閉じ方を定義するにとどまり、審議全体の終了判定ではない。TS-007 がこの不足により FAIL となった。
  - id: AG-003
    content: |
      RU-0002: docs/requirements/REQ-006.md の目的節または対象外節へ、REQ-011-017（external execution boundary 正規所有）と
      REQ-011-018（harness execution mechanism 正規所有）への導線を追記する。
      責務境界 SPEC（docs/specs/responsibilities/responsibility-boundary-purification.md L66, L72-74）で REQ-006 と REQ-011 の関係を確立したが、
      REQ-006 単体では読者が external execution boundary と harness execution mechanism の正規所有位置を追跡できない問題を解消する。
  - id: AG-004
    content: |
      RU-0002: docs/requirements/REQ-006.md の REQ-006-089 orchestration stage 契約へ
      「case-run internal lifecycle を複製しないこと」を明記する。
      現状 REQ-006-089 は case-auto orchestration stage モデルを定めるが、case-run internal lifecycle を複製しないことを明記していない。
      非複製原則は責務境界 SPEC L78-79 と配布 command に存在するが、正規 REQ 所有位置が SPEC/配布command に依存しており自己完結していない。
  - id: AG-005
    content: |
      RU-0003: docs/specs/foundations/document-model.md L27 周辺の dangling 参照（REQ-001-058）を修正する。
      commit ed9ceb56 で REQ-001-056 〜 REQ-001-060 が別の意味を持つ要件として新規追加されたため、既存の dangling 参照が文意不一致として顕在化した。
      L27 の文は REQ-001-058「後継 ADR を必要とする意味変更6件」と一致しない。
      修正方針: L27 周辺（REQ-001-001「文書体系」周辺を候補）の正規要件を文意確認を経て確定し、参照先を修正する。
      候補は未確定のため、req-save 実行時に文意確認して target_area と修正後 content を確定する。
  - id: AG-006
    content: |
      RU-0003: docs/specs/foundations/document-model.md L139 周辺の dangling 参照（REQ-001-056）を修正する。
      L139 の retire 判定基準は REQ-001-056「accepted ADR を意味的に不変とし、明示承認済みの非意味修正と後継 ADR を必要とする意味変更を分離」
      と一致しない。
      修正方針: L139 周辺（REQ-001-053 周辺を候補）の正規要件を文意確認を経て確定し、参照先を修正する。
      候補は未確定のため、req-save 実行時に文意確認して target_area と修正後 content を確定する。
  - id: AG-007
    content: |
      RU-0004: docs/specs/foundations/document-model.md L163「既存成果物の6処置」から L580 cleanup 実行契約への相互参照を追加する。
      L153（L163 周辺）は昇格前の適格性判定、L580 は cleanup 実行モデルであり、適用フェーズと参照する正規所有契約が異なる。
      同じ処置名が関係の説明なしに現れるため、読者が重複定義または競合する契約と誤認する可能性がある。
      統合は行わず、それぞれの役割と関係を明示する参照追記に留める。
  - id: AG-008
    content: |
      RU-0004: docs/specs/foundations/document-model.md L607「6処置モデル」から L153 適格性判定への相互参照を追加する。
      L580（L607 周辺）は cleanup 実行契約であり、L153 適格性判定との関係を明示する。
      統合は行わず、それぞれの役割と関係を明示する参照追記に留める。
  - id: AG-009
    content: |
      RU-0010: docs/specs/local/runtime-package-boundary.md L306 の列挙から inspect-extensions を削除し、
      3 command（docs-check, inspect-skills, inspect-promote）へ縮約する。
      ADR-006 により inspect-extensions は独立公開 command として廃止され、後継 command へ更新済みだが、
      local SPEC には inspect-extensions が残存する。Epic #1833 の主対象外だった local SPEC に stale reference が残っていた。
  - id: AG-010
    content: |
      RU-0010: runtime-package-boundary.md L306 周辺の隣接する実行時欠落記述も必要に応じて更新する。
      docs-check で ADR-006 との整合性を再検証する。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-deep-review
    target_area: "## 自律審議継続"
    source_items: [AG-001, AG-002]
    spec_logical_division: behavior
    canonical_owner: agentdev-deep-review
    content: |
      ## 自律審議継続

      （新規セクション。RU-20260726-01 AG-009 で合意した肯定表現と8手続きを列挙）

      関連コンテキストから判断可能な限り、自律審議を継続する。ユーザー質問への移行は、関連コンテキストから解決できない場合に限定する。

      継続時に試行する8手続き（順不同）:
      1. 前提確認: 批判と反論の前提を確認し、前提の相違を特定する
      2. 根拠確認: 批判と反論の根拠を再確認し、根拠の強度と適用範囲を比較する
      3. 誤解解消: 誤解、解釈の相違、情報の欠落があれば明示的に解消する
      4. 適用範囲の限定: 批判の適用範囲、対象案の適用範囲を限定し、爾余の範囲で合意可能か確認する
      5. 部分合意の探索: 批判と反論のうち合意可能な部分を切り出し、合意済み範囲を確定する
      6. 代替案の比較: 対立する選択肢の代案を比較し、共通の目的を満たす代替があるか確認する
      7. 追加証拠による再評価: 利用可能な関連コンテキストから追加証拠を取得し、争点を再評価する
      8. 批判内容の再構成: 批判と反論を整理し直し、真の対立点を抽出する

      ## 完了条件

      （新規セクション。RU-20260726-01 AG-013 で合意した審議全体の完了条件8項目）

      審議全体の完了は、形式的全会一致や固定観点全 PASS ではなく、次の8項目の本質的合意条件で判断する。
      形式的同一判定や固定観点全 PASS を完了条件としない。

      1. 本質的争点がすべて閉じていること
      2. 妥当と合意した批判が対象案へ反映されていること
      3. 撤回/棄却された批判が対象案へ混入していないこと
      4. 部分合意の採用範囲と非採用範囲が明確であること
      5. ユーザー判断事項が残っていないこと
      6. 修正版への再検証が完了していること
      7. 再検証後に新たな本質的争点が残っていないこと
      8. 批判を継続すること自体を目的とした議論だけが残っていないこと
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-003, AG-004]
    content: |
      docs/requirements/REQ-006.md へ以下を追記する:

      ### REQ-011 導線（目的節または対象外節へ追記）

      REQ-006 は case 実行オーケストレーションを正規所有するが、external execution boundary と harness execution mechanism は
      REQ-011 が正規所有する。読者がこれらの正規所有位置を追跡できるよう、目的節または対象外節へ以下の導線を追記:
      - REQ-011-017: external execution boundary の正規所有
      - REQ-011-018: harness execution mechanism の正規所有
      （参照先: docs/specs/responsibilities/responsibility-boundary-purification.md L66, L72-74）

      ### REQ-006-089 非複製明記

      REQ-006-089 orchestration stage 契約へ「case-auto は case-run internal lifecycle を複製しないこと」を明記。
      case-auto は orchestration 制御を集約するが、case-run の internal lifecycle（state machine、self-healing loop 等）は
      case-run 側が正規所有する。非複製原則は責務境界 SPEC L78-79 と配布 command にも存在するが、REQ-006 自己完結性を確保するため明記する。
      詳細要件行は req-save 実行時に REQ-006 の既存要件群との整合を確認して配置する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "（L27 周辺のセクション見出し、req-save 実行時に文意確認して確定）"
    source_items: [AG-005]
    spec_logical_division: behavior
    canonical_owner: document-model
    content: |
      （L27 周辺の dangling 参照（REQ-001-058）を修正。req-save 実行時に文意確認して正規参照先を確定）

      修正方針: commit ed9ceb56 で REQ-001-056〜060 が別の意味を持つ要件として新規追加されたため、L27 の dangling 参照が文意不一致。
      候補: REQ-001-001（文書体系）周辺。req-save 実行時に文意一致を確認して target_area と修正後 content を確定する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "（L139 周辺のセクション見出し、req-save 実行時に文意確認して確定）"
    source_items: [AG-006]
    spec_logical_division: behavior
    canonical_owner: document-model
    content: |
      （L139 周辺の dangling 参照（REQ-001-056）を修正。req-save 実行時に文意確認して正規参照先を確定）

      修正方針: L139 の retire 判定基準は REQ-001-056「accepted ADR を意味的に不変」の契約と一致しない。
      候補: REQ-001-053 周辺。req-save 実行時に文意一致を確認して target_area と修正後 content を確定する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "（L163 周辺「既存成果物の6処置」セクション見出し）"
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: document-model
    content: |
      （L163「既存成果物の6処置」セクションへ、L580 cleanup 実行契約への相互参照を追記）

      本セクション（L153 周辺）は昇格前の適格性判定の6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）を定義する。
      cleanup 実行モデル（L580 周辺）の6処置は別セクションで定義され、適用フェーズと参照する正規所有契約が異なる。
      両者は独立した正規所有契約である。相互参照により関係を明示する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "（L607 周辺「6処置モデル」セクション見出し）"
    source_items: [AG-008]
    spec_logical_division: cross_cutting_contract
    canonical_owner: document-model
    content: |
      （L607「6処置モデル」セクションへ、L153 適格性判定への相互参照を追記）

      本セクション（L580 周辺）は cleanup 実行モデルの6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）を定義する。
      昇格前の適格性判定（L153 周辺）の6処置は別セクションで定義される。両者は独立した正規所有契約である。
      相互参照により関係を明示する。統合は行わない。
  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "## 検証スクリプト呼出 command"
    source_items: [AG-009, AG-010]
    spec_logical_division: catalog
    canonical_owner: runtime-package-boundary
    content: |
      ## 検証スクリプト呼出 command

      （L306 周辺の列挙から inspect-extensions を削除し、3 command へ縮約）

      変更前: req-save, spec-save, case-close, inspect-extensions が検証スクリプトを呼び出す

      変更後: 検証スクリプトを呼び出す command は以下の3つ（ADR-006 により inspect-extensions は廃止、後継3 command へ移管済み）:
      - docs-check
      - inspect-skills
      - inspect-promote

      隣接する実行時欠落の記述も ADR-006 準拠へ更新する。docs-check で ADR-006 との整合性を再検証する。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0001 の deep-review SPEC 完了条件/自律審議継続の反映方法
    resolution: |
      agentdev-deep-review.md へ新規セクション「自律審議継続」と「完了条件」を追加する。
      現行 SPEC は振る舞い契約の正典であり、実装詳細側に手続きが存在しても SPEC と配布物の契約が一致しない状態では
      検証時（TS-005, TS-007）に FAIL となる。RU-20260726-01 AG-009/AG-013 を反映して SPEC を自己完結させる。
  - id: CR-002
    conflict: document-model.md への4 action（ACT-SPEC-002/003/004/005）を1 action にまとめるか
    resolution: |
      editing concern 別のため4 action に分割。「1 action = 1 artifact × 1 editing concern」原則に従う。
      同一ファイル内であっても、dangling 参照修正（L27/L139）と相互参照追加（L163/L607）は別関心のため別 action。
      spec-save 実行時には順序依存のため直列サブセットとして処理される（REQ-008-091）。
  - id: CR-003
    conflict: ADR 要否
    resolution: |
      新規 ADR 不要。既存 SPEC/REQ 文書の参照不整合・欠落の解消であり、アーキテクチャ判断を含まないため。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec: docs/specs/skills/agentdev-deep-review.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0004
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0010
    target_spec: docs/specs/local/runtime-package-boundary.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/skills/agentdev-deep-review.md に「自律審議継続」セクションが存在することを確認する。
      セクション内に肯定表現「関連コンテキストから判断可能な限り、自律審議を継続する」と8手続きが列挙されていること。
    pass_criteria: |
      「自律審議継続」セクションが存在し、肯定表現と8手続きが列挙されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/skills/agentdev-deep-review.md に「完了条件」セクションが存在することを確認する。
      セクション内に審議全体の完了条件8項目が列挙され、形式的同一判定や固定観点全 PASS を完了条件としないことが明示されていること。
    pass_criteria: |
      「完了条件」セクションが存在し、8項目と形式判定否定が明示されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/requirements/REQ-006.md の目的節または対象外節に REQ-011-017 と REQ-011-018 への導線が存在することを確認する。
      読者が external execution boundary と harness execution mechanism の正規所有位置を追跡できること。
    pass_criteria: |
      REQ-006.md に REQ-011-017/018 への導線が存在し、責務境界 SPEC との整合が取れていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/requirements/REQ-006.md の REQ-006-089 に「case-run internal lifecycle を複製しないこと」が明記されていることを確認する。
    pass_criteria: |
      REQ-006-089 content に非複製明記が存在すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/foundations/document-model.md L27 周辺の dangling 参照（REQ-001-058）が修正されていることを確認する。
      修正後の参照先が文意一致すること。req-save 実行時に文意確認を実施し、target_area と修正後 content を確定する。
    pass_criteria: |
      L27 周辺の参照先が実在する REQ-001-NNN であり、文意が一致すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。文意確認結果に基づき参照先を再修正。
  - id: TS-006
    target_item: AG-006
    verification: |
      docs/specs/foundations/document-model.md L139 周辺の dangling 参照（REQ-001-056）が修正されていることを確認する。
      修正後の参照先が文意一致すること。req-save 実行時に文意確認を実施し、target_area と修正後 content を確定する。
    pass_criteria: |
      L139 周辺の参照先が実在する REQ-001-NNN であり、文意が一致すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-007
    target_item: AG-007
    verification: |
      docs/specs/foundations/document-model.md L163 周辺に L580 cleanup 実行契約への相互参照が追加されていることを確認する。
      両者が独立した正規所有契約であることが明示されていること。
    pass_criteria: |
      L163 周辺から L580 への相互参照が存在し、独立契約であることが明示されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-008
    target_item: AG-008
    verification: |
      docs/specs/foundations/document-model.md L607 周辺に L153 適格性判定への相互参照が追加されていることを確認する。
      統合は行われず、相互参照のみであること。
    pass_criteria: |
      L607 周辺から L153 への相互参照が存在し、統合でないことが明示されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-009
    target_item: AG-009
    verification: |
      docs/specs/local/runtime-package-boundary.md L306 周辺の列挙から inspect-extensions が削除されていることを確認する。
      3 command（docs-check, inspect-skills, inspect-promote）へ縮約されていること。
    pass_criteria: |
      L306 周辺に inspect-extensions が存在せず、3 command が列挙されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-010
    target_item: AG-010
    verification: |
      runtime-package-boundary.md の隣接する実行時欠落記述が ADR-006 準拠へ更新されていることを確認する。
      docs-check で ADR-006 との整合性を再検証する。
    pass_criteria: |
      隣接記述が ADR-006 準拠であり、docs-check で整合性が確認されること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001-Sources-deep-review-spec
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0001 の Source Summary が指摘する「deep-review SPEC の完了条件・自律審議継続欠落」は
      AG-001/AG-002 で完全に統合された。両セクション追加を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002-Sources-req-006-cross-reference
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0002 の Source Summary が指摘する「REQ-006 の自己完結性欠如」は AG-003/AG-004 で完全に統合された。
      REQ-011 導線と非複製明記を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003-Sources-document-model-dangling
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0003 の Source Summary が指摘する「document-model.md L27/L139 dangling 参照」は
      AG-005/AG-006 で完全に統合された。req-save 実行時に文意確認して確定する運用を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004-Sources-document-model-cross-reference
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0004 の Source Summary が指摘する「document-model.md L153/L580 6処置モデル相互参照欠落」は
      AG-007/AG-008 で完全に統合された。統合せず相互参照追記に留める方針を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0010
    source_item: RU-0010-Sources-runtime-package-stale
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0010 の Source Summary が指摘する「runtime-package-boundary.md L306 inspect-extensions 残存参照」は
      AG-009/AG-010 で完全に統合された。3 command 縮約と ADR-006 再検証を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large（5件の独立した文書修正、document-model.md へは4 action）のため Epic 構成を推奨。
    Wave 構成案:
    - Wave 1: OU-001（deep-review.md）, OU-002（REQ-006）, OU-005（runtime-package-boundary.md）並列
    - Wave 2: OU-003（document-model.md dangling 参照修正）
    - Wave 3: OU-004（document-model.md 相互参照追加、OU-003 完了後）
    ※ document-model.md への4 action（ACT-SPEC-002/003/004/005）は順序依存のため直列サブセットとして処理。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002, OU-005]
      rationale: 3 ファイルは独立のため並列実行可能。
    - wave: 2
      units: [OU-003]
      rationale: document-model.md dangling 参照修正を先に実施。
    - wave: 3
      units: [OU-004]
      rationale: OU-003 完了後に相互参照追加を実施。
```

# summary

本ドラフトは RU-0001/0002/0003/0004/0010 を処理する要件定義である。AgentDevFlow 本体の改善（agentdev_handoff: true）。

5件の独立した SPEC/REQ 文書参照不整合・欠落を解消する。各 RU は独立関心だが「既存文書の参照不整合・欠落の解消」という共通性でグループAとして1ドラフトにまとめた。

主要な変更対象は5ファイル:
- docs/specs/skills/agentdev-deep-review.md（自律審議継続、完了条件セクション追加）
- docs/requirements/REQ-006.md（REQ-011 導線、非複製明記）
- docs/specs/foundations/document-model.md（dangling 参照修正2件、相互参照追加2件）
- docs/specs/local/runtime-package-boundary.md（inspect-extensions 削除）

scale: large、Epic 構成を推奨。

後続コマンドは req-save（REQ-006 update、新規 ADR なし）→ spec-save（4 SPEC 同期更新、document-model.md は直列サブセット）→ case-open（Epic 構成）を想定。
