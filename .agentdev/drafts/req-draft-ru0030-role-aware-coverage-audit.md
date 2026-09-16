---
draft_type: req_draft
topic_slug: ru0030-role-aware-coverage-audit
status: draft
created_at: 2026-09-16T11:24:14+09:00
source_rus:
  - RU-0030
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  coverage 突合による ADF-COVERS 宣言の除去可否判定について、REQ-057-028 の判定基準を維持したまま、implementation 役割と docs/ 配下パスのフィルタを必須化し、除去後に role 別 coverage の不変を traceability check で確認する運用詳細を合意した。case-run、case-close、agentdev-traceability の各正規手順へ同じ解釈を投影し、配布物本文には具体的な REQ ID を記載しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      coverage 突合による配布物本体の ADF-COVERS 宣言の除去可否判定では、implementation 役割かつ docs/ 配下パスの宣言だけを集約済み実装対応として認定する役割フィルタと docs/ パスフィルタを必須とする。この手順は case-run 実行内の cleanup 判定と case-close STEP-3 の集約突合に適用し、REQ ID の有無だけで verification または design 役割の宣言を implementation 集約済みと扱わない。REQ-057-028 が所有する「集約確認後に除去し対応関係を喪失させない」という判定基準の中核は再定義せず、追加するのは突合時の役割解釈とパス絞り込みの運用詳細である。配布物本文の要件参照は意味参照に限定し、具体的な REQ ID は ADF-COVERS 宣言行に限定する。
  - id: AG-002
    content: >-
      ADF-COVERS 宣言を除去した後は、traceability check を実行して role 別 coverage の対応関係が不変であり、新規の missing-implementation が 0 件であることを後置検査として確認する。除去前の集約突合と除去後の check を一組の cleanup 判定手順として扱い、後置検査を省略した除去を完了扱いにしない。
  - id: AG-003
    content: >-
      agentdev-traceability の coverage 利用時注意として、coverage は役割付き対応関係を全件返すため、除去可否や集約確認に利用する呼出側は role を解釈し、implementation 役割と docs/ 配下パスを条件として突合することを運用規約に明記する。coverage の全件返却契約や ADF-COVERS の3役割モデル自体は変更しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: 要件テーブル末尾（擬似 REQ-057-030 行として REQ-057-029 の後へ追記）
    source_items: [AG-001, AG-002, AG-003]
    content: >-
      | REQ-057-030 | 配布物本体に残存する ADF-COVERS 宣言の除去可否を判定する coverage 突合（REQ-057-028 の判定基準に従う）は、implementation 役割かつ docs/ 配下パスの宣言のみを集約済み実装対応と認定する役割フィルタと docs/ パスフィルタの適用を必須とし、除去実行後には traceability check による role 別 coverage の不変確認（新規 missing-implementation 0 件）を後置検査として行うこと。coverage 出力の役割付き解釈の利用時注意は agentdev-traceability の運用規約が保持すること |

conflict_resolutions:
  - id: CR-001
    conflict: REQ-057-028 が既に除去判定の中核を所有しており、役割フィルタと除去後検査を追加すると二重定義になる可能性がある。
    resolution: REQ-057-028 は集約確認後の除去と対応関係維持という判定基準を保持し、本 draft は implementation 役割・docs/ パスの絞り込みと除去後の missing-implementation 0 件確認という運用詳細だけを追加する。
  - id: CR-002
    conflict: 既存 REQ-057 の現行最大行は REQ-057-029 であり、複数バッチが共有する擬似採番計画がある。
    resolution: 本 draft の追加行を擬似 REQ-057-030 として扱い、case-open の決定的採番で最終的な行番号を付番する。
  - id: CR-003
    conflict: case-run の現行 reference には ADF-COVERS cleanup の役割別突合手順がなく、case-close STEP-3-2 と traceability coverage の記載も役割解釈を明示していない。
    resolution: case-run の cleanup 判定、case-close STEP-3-2 の集約突合、agentdev-traceability の coverage 利用時注意を、それぞれの正規所有手順へ同じフィルタ条件と後置検査条件として投影する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0030
    target_req: REQ-057
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      REQ-057 の追加行、case-run の cleanup 判定手順、case-close STEP-3 の集約突合手順を実ファイルで確認し、implementation 役割フィルタと docs/ パスフィルタが必須条件として記載されていること、REQ-057-028 の中核判定を重複記述していないこと、配布物本文に具体的な REQ ID を追加していないことを確認する。
    pass_criteria: >-
      3箇所すべてで同じフィルタ条件が確認でき、REQ-057-028 の中核は一度だけ参照され、配布物本文の具体的な REQ ID は ADF-COVERS 宣言行に限定されている。
    on_failure: >-
      fix-and-reverify を選択する。失敗原因は要件行または workflow/traceability 手順の記述不足・重複であり、対象文書の記述を修正して同じ実ファイル確認を再実行できるため。
  - id: TS-002
    target_item: AG-002
    verification: >-
      配布物側の宣言を除去する cleanup シナリオを対象に、除去前の coverage 突合で role と docs/ パスを適用し、除去後に traceability check を実行して role 別 coverage と missing-implementation の差分を確認する。
    pass_criteria: >-
      implementation 役割かつ docs/ 配下の対応がない対象は removable と判定されず、除去後の新規 missing-implementation が 0 件で、既存の role 別 coverage 対応関係が維持される。
    on_failure: >-
      fix-and-reverify を選択する。判定誤りはフィルタまたは除去後検査の手順修正で解消でき、修正後に同じ coverage と check を再実行できるため。
  - id: TS-003
    target_item: AG-003
    verification: >-
      agentdev-traceability の coverage 公開契約と運用規約を読み、役割付き relations の全件返却を呼出側が role 解釈する注意、implementation 役割および docs/ パスを cleanup 突合条件へ投影する記述を確認する。
    pass_criteria: >-
      coverage の全件返却契約を変更せず、呼出側の role 解釈と docs/ パス条件が運用規約として明記されている。
    on_failure: >-
      fix-and-reverify を選択する。失敗原因は利用時注意の記載不足であり、traceability の運用規約を修正して公開契約との整合を再確認できるため。

realization_actions:
  - id: RA-001
    concern: case-run cleanup 判定の role-aware coverage 突合
    responsibility: case-run の実行手順は、配布物本体の ADF-COVERS 宣言を除去する可否判定で implementation 役割と docs/ 配下パスを必須条件として扱い、除去後検査へ接続する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-run/references/single.md
      - src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md
      - 正規原本候補: docs/designs/commands/case-run.md
    intent: REQ ID の有無だけの突合による removable 誤判定を防ぎ、配布物側の cleanup 判断を docs 集約の実態に一致させる。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: case-close STEP-3 集約突合の role-aware coverage 解釈
    responsibility: case-close STEP-3-2 の Design 棚卸し・集約突合は、coverage の役割付き relations を implementation 役割かつ docs/ 配下パスとして解釈し、除去後の role 別 coverage 不変確認を完了条件へ接続する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（STEP-3-2、coverage 参照箇所）
      - 正規原本候補: docs/designs/commands/case-close.md
    intent: case-close 側の集約確認で verification/design 役割を implementation 集約済みと誤認しない。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-003
    concern: agentdev-traceability coverage 利用時注意
    responsibility: agentdev-traceability の運用規約は、coverage が役割付き対応関係を全件返すことと、呼出側が role と docs/ パスを解釈して cleanup 判定へ利用することを明記する。
    ownership_hints:
      - src/opencode/skills/agentdev-traceability/SKILL.md（運用規約節）
      - 正規原本候補: docs/designs/skills/agentdev-traceability.md
    intent: coverage の公開契約を変更せず、役割付き出力の誤読による集約判定の false-clean を防ぐ。
    verification_refs: [TS-001, TS-003]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0030
    source_item: RU-0030-item-1
    disposition: covered
    reason_code: converted_to_existing_req_append
    reason: REQ-057-028 の判定基準に接続する coverage 突合の運用詳細として REQ-057 への APPEND に変換した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0030.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0030
    source_item: RU-0030-item-2
    disposition: covered
    reason_code: converted_to_existing_req_append
    reason: 除去後の role 別 coverage 不変確認を同じ REQ-057 APPEND の受入条件へ含めた。
    evidence:
      path: .agentdev/backlog/req-units/RU-0030.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0030
    source_item: RU-0030-item-3
    disposition: covered
    reason_code: converted_to_realization_action
    reason: traceability coverage の役割付き出力解釈を realization_actions と test_strategy へ投影した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0030.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-057-028 との中核・運用詳細の接続を確認済み）、client-server（coverage の producer と workflow consumer の役割解釈を確認済み）、execution（case-run cleanup と case-close STEP-3 の順序・後置検査を確認済み）、build-runtime（traceability script の公開 JSON 契約を変更しないことを確認済み）、environment-propagation（docs/ と src/opencode/ の正規配置から配布物へ同じ条件を投影することを確認済み）の5観点すべてを確認した。独立した複数関心の混在はなく、SPLIT 要否: 不要。
