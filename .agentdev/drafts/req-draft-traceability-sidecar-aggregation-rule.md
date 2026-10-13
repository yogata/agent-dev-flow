---
draft_type: req_draft
topic_slug: traceability-sidecar-aggregation-rule
status: draft
created_at: 2026-10-13T12:46:00Z
source_rus: [RU-0210]
agentdev_handoff: true
---

# draft-data

```yaml
# work_type: 配布物（配布 skill reference）の運用規約不在による繰返し不整合の修正。検査器・コード変更なし
work_type: bugfix

scale: standard

summary: traceability sidecar の同一 artifact × role を跨ぐ複数 Case の宣言について、既存 sidecar への追加統合を原則とする集約規則を、REQ-012-058 が指定する配布 skill の運用文書（sidecar-and-policy.md）へ明文化する。既存 REQ 行（REQ-012-058/059）が義務の正であるため REQ/Decision/Design の変更は不要であり、本 draft は実現面（配布 reference）の変更のみを持ち artifact_actions は空（case-open は実変更なし経路）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      配布 reference（agentdev-traceability の references/sidecar-and-policy.md）へ「同一 artifact × role を跨ぐ宣言の集約規則」節を追加する。
      規律の内容: (1) 既存 sidecar 追加原則 — ある artifact パス × role の宣言が既存 sidecar に存在する場合、別 Case の新規要件行の宣言は新規 sidecar を作らず、
      既存 sidecar の該当 role 配下へ要件行を追加統合する（duplicate-inconsistencies の単一情報源集約制は、同一 artifact × role の宣言が複数情報源へ分散した場合に
      REQ 集合が完全一致する場合のみ pass とするため、分散は必ず検出され統合修正の往復を生む）。
      (2) 新設許容条件 — 追加対象の producer / component の責務境界上、既存 sidecar の component に所属しない artifact の場合は新設を許容する。
      また既存 sidecar への統合が component の命名と内容の恒常的乖離を生む場合（REQ-012-059 違反となる場合）は、統合先を新設へ変更できる。
      (3) 統合時の component 名整合 — 統合により命名と内容が乖離した場合、sidecar ファイル名と component キーを一貫して改名して解消する。
      sidecar は配布対象外（project 側の開発管理成果物）であるため配布互換性の拘束を受けず、恒常的な乖離は残さない。
      (4) checker との関係 — 本規則は適用前の予防規則であり、事後検出は既存の duplicate-inconsistencies 検出器が維持する。検出器・検査契約は変更しない。
  - id: AG-002
    content: >
      正規所有先の確定: 本件の義務の正は既存 REQ 行が所有する。REQ-012-058（traceability 標準機能の運用手順〔sidecar 追加時の既存登録との事前突合を含む〕を配布 skill の運用文書が保持すること）と
      REQ-012-059（sidecar の component 構成は命名と内容の対応が判別できる単位で維持し、他の要件の宣言の一時格納を除き命名と内容の乖離を恒常状態として残さないこと）である。
      集約規則の明文化はこれらの既存義務の下での運用文書の内容拡充であり、新規 REQ 行・Decision・Design 行は作らない。
      明文化先は REQ-012-058 が指定する配布 skill の運用文書（sidecar-and-policy.md）の単一箇所とする。schema 正本（v4-traceability-model Design）・policy.yaml（検証スコープ専用）は本件の変更対象としない。

conflict_resolutions:
  - id: CR-001
    conflict: RU 暫定分類は「REQ 行の新設を伴う可能性が高い」であったが、REQ-012-058/059 の実文照合で既存義務が本件を包含するか否か
    resolution: >
      実文照合（REQ-012-058 の「運用手順は配布 skill の運用文書が保持すること」の非網羅列挙〔〜を含めて〕、REQ-012-059 の一時格納許容と恒常乖離禁止）により、
      集約規則は既存義務の運用詳細と判定し REQ 操作なしとした。新規 REQ 行は既存行の重複になる。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0210
    # REQ/Design 操作なし（実現面のみ）。artifact_actions が空のため case-open は実変更なしとして Definition PR を作成しない
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

artifact_actions: []

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      変更適用後の references/sidecar-and-policy.md を読み、集約規則節が存在し (1) 既存 sidecar 追加原則、(2) 新設許容条件、(3) 統合時の component 名整合（改名可・配布対象外の根拠）、
      (4) duplicate-inconsistencies との予防/事後検出の関係の 4 要素を含むことを確認する。併せて既存の「対応宣言追加前の component / sidecar 対応一覧の事前確認」節、
      「inline 宣言と sidecar の集合一致の適用前確認」節と矛盾しないこと（追加原則が両節の突合手順と整合すること）を確認する。
    pass_criteria: |
      4 要素の記載が存在し、既存 2 節との矛盾が 0 件、REQ-012-058/059 への参照（または語義の一致）が確認できること。
    on_failure: |
      fix-and-reverify。規則文の不備・既存節との矛盾は reference 本文を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: traceability sidecar の同一 artifact × role 集約規則の配布 reference への明文化
    responsibility: >
      REQ-012-058 が指定する配布 skill の運用文書保持責務。正本は src/common/skills/agentdev-traceability/references/sidecar-and-policy.md（投影先 .opencode/skills/agentdev-traceability/）。
    ownership_hints:
      - src/common/skills/agentdev-traceability/references/sidecar-and-policy.md
      - .opencode/skills/agentdev-traceability/SKILL.md（inline declaration 優先規則との整合確認のみ、変更対象は運用 reference 側）
    intent: >
      「同一 artifact × role を跨ぐ宣言の集約規則」節を追加し、複数 Case 間の sidecar 宣言の統合先・統合手順・新設許容条件・component 名整合を明文化する。
      既存の事前突合手順（同一論理関係の突合）を置換せず、別 Case の別 REQ 行宣言の統合方向を追加規定する。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0210
    source_item: traceability sidecar の同一 artifact × role 集約規則の明文化
    disposition: covered
    reason_code: adopted_as_operational_document_extension
    reason: |
      要求の本体（統合先・統合手順の明文化）は RA-001 で covered。要件化の方向の3論点のうち、①明文化先は REQ-012-058 指定の運用文書、
      ②追加原則と新設許容条件は AG-001、③component 名の改名可否は配布対象外であることを根拠に改名可・恒常乖離禁止（REQ-012-059）として解決した。
      元成果物（intake promoted 成果物。prune 後は RU-0210 / intake item タイトル「2026-10-13-traceability-sidecar-aggregation-rule」で識別可能）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0210.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - artifact_actions が空のため case-open は実変更なし → Definition PR なし。RA-001 が Issue 実行契約へ投影され、case-run が配布 reference を変更する経路（bugfix 経路）。
    - 配布物変更のため、case-run の PR は配布整合性検査（check_integrity 等）の対象となる（既存ゲートに従う）。
```

# summary

Wave-1（PR #3663）と Wave-3（PR #3668）で同一 artifact × role を跨ぐ sidecar 宣言が duplicate-inconsistencies を発報し、既存 sidecar への統合一本化で解消された実績を規則化する。明文化先は REQ-012-058 が指定する配布 skill の運用文書（sidecar-and-policy.md）であり、既存 REQ 行（058/059）が義務の正のため REQ/Decision/Design の変更は不要。統合先・統合手順・新設許容条件・component 名整合（sidecar は配布対象外のため改名可）を予防規則として明文化し、事後検出は既存 checker が維持する。
