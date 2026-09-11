---
draft_type: req_draft
topic_slug: lint-skills-description-budget
status: saved
created_at: 2026-09-11
source_rus: [RU-0010]
---

# draft-data

```yaml
# work_type: REQ-050 への運用規定追加（REQ 更新）を伴う方針策定
work_type: feature

# scale: 単一 REQ（REQ-050）への追加。少数要件行に収まる
scale: standard

summary: lint_skills description 集約予算警告（total 17506 > 350×50、base 209bad13 時点からの傾向管理 warning）に対する縮約方針を策定し、REQ-050 系の運用規定として明文化する。対象選定基準、縮約形式、実施単位を REQ へ規定追加し、description を持つ skill 追加・変更時の計画的適用（予算突合）を運用とする。lint_skills.ts 自体の契約（warning 発出）は変更しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      description 集約予算（350 字 × 50 件相当、lint_skills の集約計算）に対する縮約方針を
      REQ-050（scripts 公開入口境界・lint_skills 契約）の運用規定として追加する。
      縮約方針の内容:
      - 対象選定基準: description 総字数の貢献が大きい（350 字超または予算超過の主要因である）
        skill description から順に縮約候補とする。使用頻度・トリガ重要度が高い
        （USE FOR / DO NOT USE FOR が本体機能の委譲判断に必須な）description は
        縮約でトリガ語を欠落させない
      - 縮約形式: 説明の重複表現・例示の削減を優先し、トリガ語・責務境界
        （USE FOR / DO NOT USE FOR）の区別は維持する
      - 実施単位: 予算超過が warning として検出された時点、または description を持つ
        skill の追加・変更時に予算突合を実施した時点で計画的に実施する
  - id: AG-002
    content: |
      縮約方針の計画的適用として、description を持つ新規 / 変更 skill の追加・変更時に
      lint_skills の集約予算突合を実施する運用を REQ-050 系に明文化する。
      個別には完了阻害しない warning だが放置で trend が悪化するため、
      縮約を「毎回ではなく計画的に」実施する運用を明記する。
      lint_skills.ts 自体の検査契約（warning 発出）は変更しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-050.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-050-016 | skill description 集約予算（350 字 × 50 件相当）に対する縮約方針を運用として保持すること。対象選定基準（予算貢献の大きい description から候補化し、トリガ語と USE FOR / DO NOT USE FOR の責務境界を縮約で欠落させない）、縮約形式（重複表現・例示の削減を優先）、実施単位（予算超過検出時および skill 追加・変更時の予算突合）を含めること。lint_skills 検査契約（warning 発出）は変更しない |
      ※ 採番 REQ-050-016 は現行末尾行（REQ-050-015）の次としてピン済み。req-save が既存行との連続性を検証し、並列 REQ-050 追加がある場合は採番を調整する。
      description を持つ新規 / 変更 skill 追加時に計画的な縮約の方針決定を要する課題
      （distribution-artifact-existing-findings-remediation-candidates #3）の処置として、
      方針自体を運用規定として保持し、放置による trend 悪化を防ぐ。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0010
    target_req: REQ-050
    target_design: null
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
      REQ-050 追加後、REQ-050.md に縮約方針の規定行が存在し、対象選定基準・縮約形式・
      実施単位の 3 要素が欠落なく含まれていることを確認する。既存 REQ-050 行
      （scripts 公開入口境界の契約）と矛盾していないことを突合する。
    pass_criteria: |
      縮約方針規定行が存在し、3 要素（対象選定基準、縮約形式、実施単位）を含む。
      既存 REQ-050 行との矛盾が 0 件。ID 採番が連続している。
    on_failure: |
      fix-and-reverify。規定の不備・採番不整合を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      縮約方針適用後（縮約を実施した場合）に lint_skills を実行し、description 集約計算
      （total 値）が改善していることを確認する。トリガ語・USE FOR / DO NOT USE FOR が
      縮約で欠落していないことを、縮約対象 skill の description 変更前後で突合する。
      縮約未実施（方針のみの case）の場合は、方針が REQ 規定として存在し、
      lint_skills 契約が変更されていないことを確認する。
    pass_criteria: |
      lint_skills 契約（warning 発出）の変更が 0 件。縮約実施済みの場合、
      total 値が改善し、トリガ語・責務境界の欠落が 0 件。
    on_failure: |
      fix-and-reverify。トリガ語欠落等の過剰縮約を復元して再検証する。

realization_actions:
  - id: RA-001
    concern: skill description の計画的縮約適用（方針に基づく実現面の変更）
    responsibility: |
      lint_skills 検査契約は REQ-050（scripts 公開入口境界）と DEC-021（scripts 公開入口の
      2本固定と安定契約）が正規所有し、検査実体は lint_skills.ts
      （.opencode/skills/repo-agentdev-integrity/scripts/ 配下、docs-check 検査スクリプト群）が担う。
      description の内容責務は各 skill Design（docs/designs/skills/agentdev-*.md）と
      配布ソースの各 SKILL.md frontmatter が所有する。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts
      - src/opencode/skills/*/SKILL.md の description frontmatter（縮約対象群）
      - docs/designs/skills/agentdev-*.md（各 skill の正規 Design）
    intent: |
      縮約方針に基づき description 総字数を計画的に削減し、集約予算警告の trend 悪化を防ぐ。
      本 case では方針策定と REQ 規定追加が本体であり、具体的縮約適用は方針の
      対象選定基準に従い case-run で実施する。
    verification_refs: [TS-002]
    source_items: [AG-002]

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - feature 経路（req-save → case-open）が想定される REQ 更新 case。artifact: design なしのため design-save 非経由
```

# summary

RU-0010（lint_skills description 集約の縮約方針策定と計画的適用）を feature standard として要件化した。対象選定基準・縮約形式・実施単位を含む縮約方針を REQ-050 系の運用規定として追加し、計画的適用（予算突合）を明文化する。lint_skills.ts の検査契約は変更せず、具体縮約は case-run で方針に従い実施する。
