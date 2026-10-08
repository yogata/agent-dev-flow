---
draft_type: req_draft
topic_slug: docs-consistency
status: draft
created_at: 2026-10-08T16:26:00+09:00
source_rus: [RU-0189, RU-0190, RU-0191, RU-0192]
---

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: |
  docs 体系と配布物の整合性を一括して是正する。ADF-COVERS(design) 宣言と本文の不一致 4 Design の是正、
  v3 supersede・Wave 記述の時制是正（DEC-052 参照追加）、docs/README・guides の追随修正
  （DEC-044 注記・Design 索引 5 件補完・DEC-018 欠番明記・case-open 表記追随）、
  lint_skills NG 3 件の解消（description 超過・reference 行数・総量）を含む。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      4 Design の ADF-COVERS(design) 宣言と本文の不一致を是正する。対象と是正方向:
      (1) v4-operating-model（REQ-103-020/021 宣言）・(2) v4-migration-and-release（REQ-103-026）・
      (3) artifact-contracts（REQ-103-024/025）・(4) document-model（REQ-103-023）。
      各 Design について、宣言された REQ の要件内容を本文が保持しているかを確認し、
      保持していない場合は対応節の追記、宣言が過剰な場合は宣言の削減のいずれかで一致させる。
      あわせて artifact-responsibilities.md:9 の REQ-103-024 implementation 宣言重複
      （design と implementation の二重宣言）を解消する。
      位置づけの精度化: v3-v4-crosswalk.md:28 は歴史語彙保持の根拠参照、:65 は verification 割当
      （IR-015/IR-040/041 所有）であり design 対応宣言ではないため是正対象外とする。
  - id: AG-002
    content: |
      v3 supersede・Wave 記述の時制是正を実施する: v4-responsibility-boundaries.md:133-136 の
      Wave 現在形記述を過去形（supersede 済み扱い）へ是正し、DEC-052 への参照を追加する。
      v4-quality-gate-model.md:93 の v3 supersede 現在形記述を同様に是正する
      （旧 defer DS-19 と同一対象・行シフト :90→:93 の統合解消分を含む）。
  - id: AG-003
    content: |
      docs/README.md:146 の DEC-044 行へ DEC-052 による部分置換の注記を追記し、
      DEC-044 frontmatter へ superseded_by（部分置換の区分を含む）を追記する。
      F-16 の docs-check route 候補（frontmatter superseded_by 欠落の機械検出新規 IR）は、
      本要件では DEC-044 の個別修正までを実施対象とし、新規 IR の創設は case 側の判断事項として
      実施可否を評価した結果を記録に残す。
  - id: AG-004
    content: |
      guides/command-selection.md:13 の case-open 出力表記の追随漏れを是正する
      （case-open の現在の出力契約に合わせた表記への更新）。
  - id: AG-005
    content: |
      docs/README.md の Design 索引へ実在 5 Design の記載を補完する:
      multi-host-canonical-model・textlint-quality-runtime・prose-quality-sentinel-checks・
      issue-title-policy・issue-lifecycle-records（+分割誘導の推奨記載）。
      F-21（README 索引あり方の AUTOGEN 調整・defer 済み）は本補完の採用時に同時再評価する
      （相互参照の維持）。
  - id: AG-006
    content: |
      decisions/README.md へ DEC-018 の欠番を明記する
      （docs/designs/foundations/numbering-policy.md:56「欠番は各 README、索引類で明記し」の義務規則への準拠）。
  - id: AG-007
    content: |
      lint_skills NG 3 件を解消する:
      (1) agentdev-epic-tracker の description 610 文字>600 上限 → 圧縮、
      (2) agentdev-issue-management/references/issue-operation-safety.md の 346 行>300 上限・目次なし →
      分割と目次追加（実測 345 行 vs lint 報告 346 の ±1 誤差は 300 超過の判定に影響しないため対象外）、
      (3) description 総量 18600>17500 上限 → 総量是正（各 description の圧縮または参照の外部化）。
      ともに pre-existing であるが lint 全統制（exit 0）の達成条件として解消する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-operating-model
    source_items: [AG-001]
    content: |
      ADF-COVERS(design) 宣言（REQ-103-020/021）と本文の一致是正。宣言された要件の内容が本文の
      どの節で保持されるかを case 実行時に確認し、対応節の追記（要件内容の Design での保持）または
      宣言の削減（過剰宣言の解消）を実施する。frontmatter 宣言の是正（宣言行の修正・削減）は
      target_area の対象外操作（frontmatter 操作）として扱い、本文対応節の追記は突合で特定した
      対象節を target_area として適用する。frontmatter 宣言と本文の突合結果を diff で提示する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-migration-and-release
    source_items: [AG-001]
    content: |
      ADF-COVERS(design) 宣言（REQ-103-026）と本文の一致是正。ACT-DESIGN-001 と同じ手続きで実施する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    source_items: [AG-001]
    content: |
      ADF-COVERS(design) 宣言（REQ-103-024/025）と本文の一致是正。ACT-DESIGN-001 と同じ手続きで実施する。
      あわせて artifact-responsibilities.md:9 の REQ-103-024 implementation 宣言との二重宣言を解消する
      （design 対応と implementation 対応のどちらかへ一元化。対応実体に基づいて決定する）。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: document-model
    source_items: [AG-001]
    content: |
      ADF-COVERS(design) 宣言（REQ-103-023）と本文の一致是正。ACT-DESIGN-001 と同じ手続きで実施する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-responsibility-boundaries
    target_area: "### REQ-096 と DEC-048 との関係（全面再評価の処遇判定材料）"
    source_items: [AG-002]
    content: |
      :133-136 の Wave 現在形記述を過去形へ是正し、DEC-052（Wave 実行制御の case-auto stage 3 移管）への
      参照を追加する。対象行の正確な位置（行シフト考慮）は case 実行時に特定する。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: quality
      slug: v4-quality-gate-model
    source_items: [AG-002]
    content: |
      :93 付近の v3 supersede 現在形記述を過去形へ是正する（旧 defer DS-19 と同一対象の統合解消分）。
      対象行の正確な位置（:90→:93 行シフト考慮）は case 実行時に特定する。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-044.md
    source_items: [AG-003]
    content: |
      DEC-044 frontmatter へ superseded_by フィールドを追記する（DEC-052 による部分置換の区分を明示）。
      部分置換（DEC-052 が DEC-044 の一部を置換）であることを frontmatter と docs/README の注記で
      表現できる形式は case 実行時に既存 Decision の類例に倣って確定する。

conflict_resolutions:
  - id: CR-001
    conflict: artifact-contracts.md を draft-verification-infra（RU-0193 update 契約追記）と本 draft（RU-0189 宣言是正）が両編集する。
    resolution: 同一 Wave 配置（同時編集バッチ化）でコンフリクトを回避する（RU-0189 の要件化の方向に従う）。case_open_hints に明記。
  - id: CR-002
    conflict: F-16 の docs-check route 候補（新規 IR）を要件に含めるか。
    resolution: 本要件の実施対象は DEC-044 の個別修正（注記+frontmatter）までとし、新規 IR 創設は case 側の判断事項として評価記録を残す（要件の未確定内容を残さないための限定）。
  - id: CR-003
    conflict: F-21（README 索引あり方の AUTOGEN 調整）は inspect-promote で defer 済み。
    resolution: AG-005 の索引補完採用時に同時再評価する相互参照を維持する（本 draft では自動化の要件化はしない）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0189
    target_design: { operation: update, domain: foundations, slug: v4-operating-model }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0189
    target_design: { operation: update, domain: foundations, slug: v4-migration-and-release }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0189
    target_design: { operation: update, domain: responsibilities, slug: artifact-contracts }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0189
    target_design: { operation: update, domain: foundations, slug: document-model }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0190
    target_design: { operation: update, domain: foundations, slug: v4-responsibility-boundaries }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0190
    target_design: { operation: update, domain: quality, slug: v4-quality-gate-model }
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0191
    target_req: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0192
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
      4 Design の frontmatter ADF-COVERS(design) 宣言と本文の対応を手動突合する
      （宣言 REQ の要件内容を本文が保持する節の有無）。artifact-responsibilities.md:9 の二重宣言が解消されていることを確認する。
      v3-v4-crosswalk.md:28/:65 が無変更であることを確認する。
    pass_criteria: 4 Design の宣言と本文が一致し、二重宣言が解消されていること。
    on_failure: fix-and-reverify（是正漏れは修正して再検証する。宣言の解釈に設計判断を要する場合は本要件に差し戻す）。
  - id: TS-002
    target_item: AG-002
    verification: |
      v4-responsibility-boundaries の対象箇所（:133-136 付近・行シフト考慮）が過去形化され DEC-052 参照が
      追加されていること、v4-quality-gate-model の対象箇所（:93 付近）が過去形化されていることを確認する。
    pass_criteria: 2 箇所の時制是正と DEC-052 参照追加が完了していること。
    on_failure: fix-and-reverify（是正漏れは修正して再検証する）。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/README.md の DEC-044 行に部分置換注記があること、DEC-044 frontmatter に superseded_by が
      追記されていることを確認する。新規 IR 創設の評価記録（実施/非実施のいずれかと理由）が case の実行記録に残っていることを確認する。
    pass_criteria: 注記と frontmatter 追記の完了、評価記録の存在。
    on_failure: fix-and-reverify（追記漏れは修正して再検証する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      guides/command-selection.md:13 の表記が case-open の現行出力契約と一致していることを確認する。
    pass_criteria: 表記追随の完了。
    on_failure: fix-and-reverify（単一行の表記修正であるため実装側での即時修正が最短で、仕様解釈の分岐を生まない）。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/README.md の Design 索引に 5 Design（multi-host-canonical-model・textlint-quality-runtime・
      prose-quality-sentinel-checks・issue-title-policy・issue-lifecycle-records）が記載されていることを確認する。
      F-21 の同時再評価の実施記録（または見送り理由）が残っていることを確認する。
    pass_criteria: 索引補完の完了と再評価記録の存在。
    on_failure: fix-and-reverify（索引追記の漏れは機械的に特定可能で、修正コストが低いため）。
  - id: TS-006
    target_item: AG-006
    verification: |
      decisions/README.md に DEC-018 の欠番が明記されていることを確認する。
    pass_criteria: 欠番明記の完了。
    on_failure: fix-and-reverify（1 行追記で完了する確定的な修正であるため）。
  - id: TS-007
    target_item: AG-007
    verification: |
      lint_skills を実行し NG 0 件（description 600 字以内・reference 300 行以内+目次・総量 17500 以内）を確認する。
      分割後の reference が 300 行以内で目次を持ち、参照元（SKILL.md など）のリンクが更新されていることを確認する。
    pass_criteria: lint_skills が exit 0 で完了すること。
    on_failure: fix-and-reverify（圧縮・分割の不備は修正して再検証する）。

realization_actions:
  - id: RA-001
    concern: docs/README.md の追随修正（DEC-044 注記・Design 索引 5 件補完）
    responsibility: README 索引・注記の正確性維持
    ownership_hints:
      - docs/README.md:146（DEC-044 行）と Design 索引節
    intent: 索引と実在成果物の一致
    verification_refs: [TS-003, TS-005]
    source_items: [AG-003, AG-005]
  - id: RA-002
    concern: guides/command-selection.md の表記追随
    responsibility: guides の現行契約追随
    ownership_hints:
      - docs/guides/command-selection.md:13
    intent: case-open 出力表記の現行化
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-003
    concern: decisions/README.md の欠番明記
    responsibility: Decision 索引の番号管理
    ownership_hints:
      - docs/decisions/README.md
      - docs/designs/foundations/numbering-policy.md:56（義務規則・adversarial-review で行番号確認）
    intent: 欠番の明示義務準拠
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-004
    concern: lint_skills NG 解消（description 圧縮・reference 分割・総量是正）
    responsibility: 配布物 skill の構造基準準拠
    ownership_hints:
      - src/common/skills/agentdev-epic-tracker/SKILL.md（description 610>600）
      - src/common/skills/agentdev-issue-management/references/issue-operation-safety.md（346 行>300・目次なし）
      - description 総量 18600>17500 の是正対象（全 skill description）
    intent: lint 全統制（exit 0）の達成
    verification_refs: [TS-007]
    source_items: [AG-007]

case_open_hints:
  epic_needed: false
  wave_hints:
    - "artifact-contracts.md は draft-verification-infra（RU-0193 update 契約追記）と同一 Wave 配置で同時編集バッチ化する"
    - "OU-003（artifact-contracts 宣言是正）と draft-verification-infra OU-001（同ファイル追記）のコンフリクト回避"
    - "document-model.md は draft-req-structure（RU-0186 保持基準節追記・RU-0188 整理）も編集するため、Wave 配置で編集衝突を回避する"
    - "textlint hard 40 件解消（draft-vocabulary-policy RU-0184・AG-005 hard 解消）と lint_skills NG 解消（本 draft AG-007）は配布物 textlint 系統の同時処理指示で関連する。draft-vocabulary-policy の完了後に本 draft を実行する、または同一 Wave でバッチ化して双方の検証（TS-005/TS-007）を統合実行する"
```

# summary

RU-0189（ADF-COVERS 宣言是正 4 Design）・RU-0190（時制是正）・RU-0191（README/guides 追随）・RU-0192（lint_skills NG）の 4 RU を統合した。Design 6 件と DEC-044 を artifact_actions、README・guides・lint_skills を realization_actions へ構造化した。他 draft との同一ファイル編集（artifact-contracts.md・document-model.md）は Wave 配置 hint で回避策を明記した。
