---
draft_type: req_draft
topic_slug: ru0029-adf-covers-impl-followup
status: draft
created_at: 2026-09-16T11:24:14+09:00
source_rus:
  - RU-0029
---

# draft-data

```yaml
work_type: docs_chore
scale: null
summary: >-
  REQ-001-066/067/068 と REQ-053-023 の ADF-COVERS implementation 宣言残務を、REQ-057-023/027/028 の既存手続に接続する単一の実行契約として合意した。先行する RU-0030 の role-aware coverage 突合を依存 OU として参照し、docs 配下の正規実装成果物への宣言付与、REQ-053-023 の docs 集約追加、配布物本体2宣言の除去、および除去後の新規 missing 0 件確認を一連の実現面変更として扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      REQ-001-066、REQ-001-067、REQ-001-068 の implementation 対応宣言は、正規配置先カタログ（docs/designs/responsibilities/artifact-responsibilities.md）の責務に従って、プロジェクト知識文書の配置と構造、要件行からの設計詳細分離、安定した外部契約の要約記述を正規所有する Design へ付与する。対象選定は REQ-057-027 の実測 traceability check 結果に基づき、REQ-057-023 の段階的付与手続に接続する。現行の3要件行は retire 対象ではなく、付与後に missing-implementation が解消される状態を成果とする。
  - id: AG-002
    content: >-
      REQ-053-023 の implementation 対応は docs 配下の正規実装成果物へ集約する。現行の docs/designs/integrity/prose-quality-sentinel-checks.md:9 は verification 役割のみを持つため、同要件の実装対応を正規所有する Design の該当節へ implementation 宣言を追加し、REQ-057-028 の集約確認前置を満たす。
  - id: AG-003
    content: >-
      REQ-053-023 の docs 配下 implementation 集約を確認した後、配布物本体の src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md:1 と src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md:1 に残る ADF-COVERS(implementation): REQ-053-023 宣言を除去する。除去は RU-0030 の OU-001 が定める implementation 役割・docs/ パスの突合と除去後 role 別 coverage 不変確認を前提とし、traceability check で新規 missing-implementation が 0 件であることを確認する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: 要件テーブル末尾（擬似 REQ-057-034 行として追記）
    source_items: [AG-001, AG-002, AG-003]
    content: >-
      | REQ-057-034 | ADF-COVERS implementation 宣言の段階付与残務（REQ-001-066/067/068 の正規配置先カタログ準拠の実装対応宣言付与、REQ-053-023 の docs 配下 implementation 集約追加と対応する配布物本体2宣言の除去）は、REQ-057-023 の段階的付与、REQ-057-027 の実測 check 実行結果に基づく対象選定、REQ-057-028 の集約確認前置（coverage 突合の役割フィルタ適用と除去後の role 別 coverage 不変確認を含む）に従って実行され、traceability check で新規 missing 0 が確認されること |

conflict_resolutions:
  - id: CR-001
    conflict: 既存 REQ-057 の現行最大行は REQ-057-029 であり、RU-0029 には共有擬似採番計画上 REQ-057-034 が指定されている。
    resolution: 本 draft は擬似 REQ-057-034 を target として保持し、case-open の決定的採番により最終的な行番号を付番する。REQ-057-030〜033 は共有計画上の他バッチ予約枠として扱う。
  - id: CR-002
    conflict: RU-0029 の frontmatter tentative_classification は「対象外」だが、本文は既存 REQ-057 の段階解消手続に接続する実行契約行を要求している。
    resolution: 「対象外」は新規 REQ CREATE の対象外という意味に整理し、既存 REQ-057 への APPEND とする既定操作分類を採用する。
  - id: CR-003
    conflict: REQ-053-023 の配布物本体宣言を先に除去すると、docs 側 implementation 対応の欠落により missing-implementation が新規発生する。
    resolution: docs 配下の implementation 宣言追加、role-aware coverage 突合、除去後 check の順序を固定し、docs 集約と coverage 不変を確認するまで配布物2宣言を除去しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0029
    target_req: REQ-057
    operation: append
    scale: standard
    depends_on: [OU-001]  # req-draft-ru0030-role-aware-coverage-audit.md の RU-0030 OU-001 を参照
    recommended_order: 2
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      traceability check を REQ-001-066、REQ-001-067、REQ-001-068 に限定して実行し、正規配置先カタログに従う Design への implementation 宣言追加後の relations と findings を確認する。
    pass_criteria: >-
      3要件行の missing-implementation がすべて 0 件となり、既存の design または verification 役割付き coverage が失われていない。
    on_failure: >-
      fix-and-reverify を選択する。宣言の付与先または宣言形式を修正して同じ対象限定 check を再実行でき、失敗を未解決のまま保持する必要がないため。
  - id: TS-002
    target_item: AG-002
    verification: >-
      coverage を REQ-053-023 起点で実行し、docs/designs/integrity/prose-quality-sentinel-checks.md の verification 宣言を保持したまま implementation 役割の docs 配下宣言が存在することを確認する。
    pass_criteria: >-
      REQ-053-023 の relations に docs/ 配下の implementation 宣言が1件以上存在し、既存 verification 宣言も残っている。
    on_failure: >-
      fix-and-reverify を選択する。正規所有 Design への宣言追加または role の修正で対応関係を整え、coverage を再実行できるため。
  - id: TS-003
    target_item: AG-003
    verification: >-
      配布物本体2ファイルの宣言除去後に traceability check を全 corpus で実行し、REQ-053-023 を含む関係する要件行の role 別 coverage と missing-implementation の差分を除去前後で比較する。
    pass_criteria: >-
      配布物本体2宣言が除去され、docs 側 implementation 集約が維持され、全 corpus の新規 missing-implementation が 0 件で、REQ-053-023 の role 別 coverage 対応関係が不変である。
    on_failure: >-
      fix-and-reverify を選択する。対応関係の喪失は配布物宣言の除去を巻き戻すか docs 側集約を補完して修正でき、修正後に全 corpus check を再実行するため。

realization_actions:
  - id: RA-001
    concern: REQ-001-066/067/068 の正規実装成果物への implementation 宣言付与
    responsibility: 正規配置先カタログに従い、docs 構造と要件文書記述運用を正規所有する Design に implementation 宣言を付与し、対象3行の traceability coverage を成立させる。
    ownership_hints:
      - docs/designs/responsibilities/artifact-responsibilities.md（正規配置先カタログ）
      - docs/designs/foundations/document-model.md（Knowledge 文書の定義、REQ/Design 責務マトリックス）
      - docs/designs/responsibilities/document-type-responsibilities.md（Knowledge 文書の配置基準）
    intent: 配布物本体へ宣言を分散させず、REQ-001-066/067/068 の implementation 対応を docs 配下の正規所有 Design へ段階的に集約する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: REQ-053-023 の docs 配下 implementation 集約
    responsibility: REQ-053-023 の実装対応を正規所有する docs/designs/integrity/prose-quality-sentinel-checks.md の該当節へ implementation 宣言を追加し、既存の verification 宣言と役割を分離して保持する。
    ownership_hints:
      - docs/designs/integrity/prose-quality-sentinel-checks.md:9（現行は verification 役割）
      - docs/designs/README.md の integrity/ Design 一覧（既存 Design の位置付け）
    intent: REQ-053-023 の implementation 対応を docs 配下へ集約し、配布物本体宣言を安全に除去できる coverage を形成する。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: 配布物本体2宣言の cleanup
    responsibility: docs 側 implementation 集約と RU-0030 の role-aware coverage 突合・除去後検査が合格した後に、指定された配布 references の ADF-COVERS implementation 宣言だけを除去する。
    ownership_hints:
      - src/opencode/skills/agentdev-decision-file-manager/references/validation-and-consistency.md:1
      - src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md:1
      - 前提手順: req-draft-ru0030-role-aware-coverage-audit.md の OU-001
    intent: REQ-053-023 の対応関係を docs 配下へ一元化し、配布物本体に残る集約用宣言を対応関係を失わずに除去する。
    verification_refs: [TS-003]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0029
    source_item: RU-0029-item-1
    disposition: covered
    reason_code: converted_to_existing_req_append
    reason: REQ-001-066/067/068 の段階的 implementation 宣言付与を REQ-057 の実行契約行へ接続した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0029.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0029
    source_item: RU-0029-item-2
    disposition: covered
    reason_code: converted_to_realization_action
    reason: REQ-053-023 の docs 集約追加と配布物2宣言の除去を realization_actions として構造化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0029.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0029
    source_item: RU-0029-item-3
    disposition: covered
    reason_code: dependency_preserved
    reason: RU-0030 の OU-001 を operation_units.depends_on で参照し、先行手順の確定後に残務を実行する依存関係を保持した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0029.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints:
    - RU-0030 の OU-001 を先行し、RU-0029 の OU-001 を後続に配置する。
    - RU-0033 が docs/designs/responsibilities/artifact-responsibilities.md を付け替え対象に含むため、RA-001 の宣言付与（同ファイル編集）と同一 Wave への並列配置を避けて直列化する。
result: {}
```

# summary

変更誘発境界リスクは、dependency（RU-0030 の role-aware 突合を先行させる依存を確認済み）、client-server（docs 側正規所有 Design と配布物 references の宣言移管を確認済み）、execution（付与・集約確認・除去・全 corpus check の順序を確認済み）、build-runtime（ADF-COVERS 宣言形式と traceability check の公開契約を変更しないことを確認済み）、environment-propagation（docs 配下への集約が src/opencode 配布物へ正しく反映されることを確認済み）の5観点すべてを確認した。RU-0030 と RU-0029 は手続確定と残務実行という独立した関心であり、依存付きの別 OU として保持する。SPLIT 要否: 不要。
