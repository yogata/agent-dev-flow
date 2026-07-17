---
draft_type: req_draft
topic_slug: command-skill-single-definition
status: saved
created_at: 2026-07-18T00:00:00+09:00
saved_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-20260718-01
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  REQ-0119（コマンド・スキル・サブエージェント責務分界）と REQ-0125（inspect-skills 診断）に対し、配布 Command/Skill 間での「責務ごとの正規な定義元」と「同一契約再定義の原則抑止」を追加し、横断是正の前後で公開契約を維持する原則を明文化した。既存 REQ-0119-001〜003 を公開入口・停止条件・成果物・再利用可能判断・状態遷移の観点で強化し、REQ-0119-032 にモデル/API 非依存の一般原則を追記した。REQ-0125-003 の診断観点に意味的重複、意味的矛盾、正規な定義元からの逸脱、セマンティクス欠落を追加した。新規 ADR は作成せず ADR-0107 の適用条件精緻化として扱う（RU-20260718-01 合意、architecture-advisory 助言に基づく）。SPEC 詳細マッピング表は case-run 都度対応とする。横断是正は単一 case で実施し適宜 issue 分割する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      責務ごとの正規な定義元を指定する原則を REQ-0119 に追加する。正規な定義元の候補は配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC のいずれかであり、責務ごとに最も安定した最小の定義元を正規とする。詳細な責務分担マッピングは SPEC（artifact-responsibilities.md 等）に委譲する。本原則は ADR-0107（Command/Skill/Template/Script 責任分界）の適用条件の精緻化であり、RU-20260718-01 合意に基づき新規 ADR は作成しない。
  - id: AG-002
    content: |
      同一の契約、手順、判定基準を複数の配布物で再定義しない原則を REQ-0119 に追加する。参照元は正規な定義元の再記述ではなく、参照先への参照と差分のみを保持する。例外として artifact-responsibilities.md SPEC が定める重複許容基準（SKILL ↔ command 同一ルール等）に該当する場合は、正の情報源を明示した上で重複を認める。例外基準の詳細は SPEC 側で維持し、本要件行では原則のみを定める（階層構造）。
  - id: AG-003
    content: |
      REQ-0119-001〜003 を強化する。REQ-0119-001 は停止条件を明示的に含め、REQ-0119-002 は再利用可能な判断、状態判定、状態遷移を含め、REQ-0119-003 は script 化可能な決定的処理の配置先を含める。
  - id: AG-004
    content: |
      横断是正の前後で、各配布物の公開契約（公開目的、入力、出力、停止条件、永続成果物、委譲接続点）を維持する原則を REQ-0119 に追加する。是正作業は公開契約の意味を変更せず、重複解消と正規な定義元への参照統合に限定する。
  - id: AG-005
    content: |
      REQ-0119-032 に「配布物は特定のモデルや API に依存せず、モデル非依存の一般原則として記述されること」を追記する。実質的に ADR-0136（harness 境界浄化）と既存 REQ-0119-032 の適用を明示する。
  - id: AG-006
    content: |
      REQ-0119 に「全配布 Command/Skill を横断評価の対象とし、重複定義、矛盾、正規な定義元からの逸脱を検出できる構造を維持する」ことを要件行として追加する。適用範囲の拡張を要件として明文化する。
  - id: AG-007
    content: |
      REQ-0125-003 の診断観点列挙に、意味的重複、意味的矛盾、正規な定義元からの逸脱、セマンティクス欠落を追加する。判定基準の詳細は REQ-0125-004 に従い agentdev-inspect-skills skill に集約する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0119
    source_items: [AG-001]
    content: |
      新規要件行（REQ-0119 の最後尾、REQ-0119-032 の後に採番）:
      「配布物種別間で責務ごとに正規な定義元を指定する原則を満たすこと。正規な定義元の候補は配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC のいずれかであり、責務ごとに最も安定した最小の定義元を正規とする。詳細な責務分担マッピングは SPEC（artifact-responsibilities.md 等）に委譲する。本原則は ADR-0107（Command/Skill/Template/Script 責任分界）の適用条件の精緻化であり、RU-20260718-01 合意に基づき新規 ADR は作成しない」
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0119
    source_items: [AG-002]
    content: |
      新規要件行（REQ-0119 の最後尾、ACT-REQ-001 の直後に採番）:
      「同一の契約、手順、判定基準を複数の配布物で再定義しない原則を満たすこと。参照元は正規な定義元の再記述ではなく、参照先への参照と差分のみを保持すること。例外として artifact-responsibilities.md SPEC が定める重複許容基準（SKILL ↔ command 同一ルール等）に該当する場合は、正の情報源を明示した上で重複を認める。例外基準の詳細は SPEC 側で維持し、本要件行では原則のみを定める」
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0119
    source_items: [AG-003]
    content: |
      REQ-0119-001 変更後:
      「コマンドは、公開 API（公開入口）、入力、出力（成果物）、親エージェントの責務、Step 見出し（高レベル工程の目安）、停止条件、委譲接続点に限定すること」

      REQ-0119-002 変更後:
      「Step 専用の詳細手順、確認手順、禁止事項、返却形式、失敗時の扱い、再利用可能な判断、状態判定、状態遷移は、スキルの SKILL.md または references/ に配置されること」

      REQ-0119-003 変更後:
      「長い判定基準、例、分類表、詳細な失敗時手順、および script 化可能な決定的処理は、スキルの references/ または script/ に配置されること」
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-0119
    source_items: [AG-004]
    content: |
      新規要件行（REQ-0119 の最後尾、ACT-REQ-002 の直後に採番）:
      「横断是正の前後で、各配布物の公開契約（公開目的、入力、出力、停止条件、永続成果物、委譲接続点）を維持すること。是正作業は公開契約の意味を変更せず、重複解消と正規な定義元への参照統合に限定すること」
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0119
    source_items: [AG-005]
    content: |
      REQ-0119-032 変更後:
      「配布 command/skill は ADR-0136 に基づき、業務ワークフロー契約のみを記述し、実行エージェント選定、起動方法、実行制御パラメータ（timeout、並列度、retry、context管理、ハーネス起動失敗解析救済含む）は harness 責務として AGENTS.md/references/<harness>.md に配置する（REQ-0162-002 適用）。配布物は特定のモデルや API に依存せず、モデル非依存の一般原則として記述されること」
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: REQ-0119
    source_items: [AG-006]
    content: |
      新規要件行（REQ-0119 の最後尾、ACT-REQ-004 の直後に採番）:
      「全配布 Command/Skill を横断評価の対象とし、重複定義、意味的矛盾、正規な定義元からの逸脱を検出できる構造を維持すること」
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-0125
    source_items: [AG-007]
    content: |
      REQ-0125-003 変更後:
      「診断観点は Command→Skill 参照妥当性、Skill frontmatter 整合、本文構造、references 利用、template / script 参照、粒度、段階的開示、責務境界、正規名、内部構造依存、廃止 REQ/SPEC 由来の SKILL/command 記述残置、意味的重複、意味的矛盾、正規な定義元からの逸脱、セマンティクス欠落を含むこと。廃止 REQ/SPEC 由来の記述残置は retired REQ/SPEC ID をソースとした横断検索により検出し、活性 REQ/SPEC への言及は対象外とする。意味的重複、意味的矛盾、正規な定義元からの逸脱、セマンティクス欠落は REQ-0119 が定める正規な定義元の原則および同一契約再定義抑止の原則に照らして検出する。判定基準の詳細は `agentdev-inspect-skills` skill に集約する（REQ-0125-004 準拠）」

conflict_resolutions:
  - id: CR-001
    conflict: AG-A/AG-B（正規な定義元の原則、同一契約再定義抑止）は新規アーキテクチャ概念の導入であり、新規 ADR または ADR-0107 の UPDATE が必要かもしれない
    resolution: |
      architecture-advisory サブエージェントへの諮問（ses_08e6877ccffe1Q5sT05B7hTM7X）および RU-20260718-01 ユーザー合意に基づき、新規 ADR なし、ADR-0107 UPDATE も不可（ADR-0112-045「承認済み ADR の決定内容意味変更禁止」）とする。AG-A/AG-B は ADR-0107 の適用条件の精緻化として REQ-0119 に要件行を追加する。REQ-0119 APPEND 本文に「本原則は ADR-0107 適用条件の精緻化であり、RU-20260718-01 合意に基づき新規 ADR を作成しない」旨を明記し、後続 inspect-docs が意味ズレを検出しないよう根拠を残す。
  - id: CR-002
    conflict: RU 受け入れ条件3「正規な定義元の責務分担を日本語で定義」を今回 spec-save 対象とするか、case-run 都度対応とするか
    resolution: |
      ユーザー合意（A2）により、今回の要件docでは REQ-0119/0125 への APPEND/UPDATE のみ確定し、SPEC 詳細マッピング表は case-run 都度対応とする。REQ-0119 要約としては「責務ごとに正規な定義元を指定する原則」のみを残し、詳細は SPEC に委譲する旨を明記。
  - id: CR-003
    conflict: 「正規な定義元」の優先順位（配布 Command / Skill / references / script / harness 側文書 / REQ-ADR-SPEC の6種）が未確定であり、REQ 要約にも SPEC 詳細にも書けない
    resolution: |
      ユーザー合意（A1）により、RU 受け入れ条件3は無効化された。優先順位の詳細は SPEC（case-run 都度対応）に委譲し、REQ-0119 には原則のみを要約として残す。REQ-0119 APPEND 本文に「詳細な責務分担マッピングは SPEC に委譲する」旨を明記。
  - id: CR-004
    conflict: AG-B（同一契約再定義抑止の原則）と既存 SPEC artifact-responsibilities.md「SKILL ↔ command 同一ルール重複許容基準」が方向性で異なる（原則抑止 vs 条件付き許容）
    resolution: |
      ユーザー合意（U2-b）により、AG-B を「原則」、既存 SPEC の許容基準を「例外」とする階層構造とする。REQ-0119 に「原則として再定義を抑止、例外条件は SPEC に定める」と書き、既存 SPEC との矛盾を避ける。例外基準の詳細は SPEC 側で維持し、本要件行では原則のみを定める。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260718-01
    target_req: REQ-0119
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req: docs/requirements/REQ-0119.md
      operations:
        - ACT-REQ-003: update REQ-0119-001/002/003
        - ACT-REQ-005: update REQ-0119-032
        - ACT-REQ-001: append REQ-0119-033
        - ACT-REQ-002: append REQ-0119-034
        - ACT-REQ-004: append REQ-0119-035
        - ACT-REQ-006: append REQ-0119-036
      source_ru_to_ou: RU-20260718-01 → OU-001 → REQ-0119
  - ou_id: OU-002
    source_ru: RU-20260718-01
    target_req: REQ-0125
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req: docs/requirements/REQ-0125.md
      operations:
        - ACT-REQ-007: update REQ-0125-003
      source_ru_to_ou: RU-20260718-01 → OU-002 → REQ-0125

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、ACT-REQ-001 の新規要件行（責務ごとに正規な定義元を指定する原則）が追加されていることを確認する。要件行本文に「ADR-0107 適用条件の精緻化」「新規 ADR は作成しない」「詳細な責務分担マッピングは SPEC に委譲」の3点が明記されていることを確認する。
    pass_criteria: |
      新規要件行が存在し、3点の明記事項がすべて含まれていること。
    on_failure: |
      fix-and-reverify。要件行の欠落または明記事項の不足は req-save 実装の修正で解決可能なため、実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、ACT-REQ-002 の新規要件行（同一契約再定義抑止の原則）が追加されていることを確認する。要件行本文に「原則として抑止」「例外として SPEC の重複許容基準に該当する場合は重複を認める」「例外基準の詳細は SPEC 側で維持」の3点が明記されていることを確認する。
    pass_criteria: |
      新規要件行が存在し、3点の明記事項がすべて含まれていること。
    on_failure: |
      fix-and-reverify。要件行の欠落または階層構造の明記不足は実装修正で解決可能なため、実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、REQ-0119-001 に「停止条件」が含まれること、REQ-0119-002 に「再利用可能な判断、状態判定、状態遷移」が含まれること、REQ-0119-003 に「script 化可能な決定的処理」が含まれることを確認する。
    pass_criteria: |
      3要件行とも強化内容が反映されていること。
    on_failure: |
      fix-and-reverify。要件行の更新漏れは実装修正で解決可能なため、実装を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、ACT-REQ-004 の新規要件行（横断是正前後での公開契約維持）が追加されていることを確認する。要件行本文に「公開目的、入力、出力、停止条件、永続成果物、委譲接続点」が列挙されていることを確認する。
    pass_criteria: |
      新規要件行が存在し、公開契約の6要素が列挙されていること。
    on_failure: |
      fix-and-reverify。要件行の欠落または列挙不足は実装修正で解決可能なため、実装を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、REQ-0119-032 の末尾に「配布物は特定のモデルや API に依存せず、モデル非依存の一般原則として記述されること」が追記されていることを確認する。既存の ADR-0136 適用部分が維持されていることも確認する。
    pass_criteria: |
      追記内容が反映され、既存部分が維持されていること。
    on_failure: |
      fix-and-reverify。追記漏れまたは既存部分の欠損は実装修正で解決可能なため、実装を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      req-save 完了後に docs/requirements/REQ-0119.md を読み、ACT-REQ-006 の新規要件行（全配布 Command/Skill 横断評価）が追加されていることを確認する。要件行本文に「重複定義、意味的矛盾、正規な定義元からの逸脱」の検出対象が含まれることを確認する。
    pass_criteria: |
      新規要件行が存在し、3つの検出対象が明記されていること。
    on_failure: |
      fix-and-reverify。要件行の欠落または検出対象の不足は実装修正で解決可能なため、実装を修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      req-save 完了後に docs/requirements/REQ-0125.md を読み、REQ-0125-003 の診断観点列挙に「意味的重複、意味的矛盾、正規な定義元からの逸脱、セマンティクス欠落」が追加されていることを確認する。既存の診断観点（Command→Skill 参照妥当性等）が維持されていることも確認する。追加4観点が「REQ-0119 が定める正規な定義元の原則および同一契約再定義抑止の原則に照らして検出する」旨の根拠明記も確認する。
    pass_criteria: |
      4観点が追加され、既存観点が維持され、根拠明記があること。
    on_failure: |
      fix-and-reverify。観点の追加漏れ、既存観点の欠損、根拠明記の不足は実装修正で解決可能なため、実装を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - "Wave 1: req-save による REQ-0119/0125 への要件行 APPEND/UPDATE"
    - "Wave 2: case-run による全配布 Command/Skill 横断評価と違反是正（単一 case、適宜 issue 分割、SPEC 修正は都度 spec-save）"
```

# summary

本要件docは RU-20260718-01「Command／Skill実行契約の単一定義化と横断是正」に基づき、REQ-0119 と REQ-0125 への更新を確定する。

主な合意:
- 配布物種別間での「責務ごとの正規な定義元」と「同一契約再定義の原則抑止」を REQ-0119 に追加
- REQ-0119-001〜003 を停止条件・再利用可能判断・状態遷移・script 配置の観点で強化
- REQ-0119-032 にモデル/API 非依存の一般原則を追記
- REQ-0125-003 の診断観点に意味的重複・意味的矛盾・正規な定義元からの逸脱・セマンティクス欠落を追加
- 新規 ADR は作成せず ADR-0107 の適用条件精緻化として扱う（architecture-advisory 助言、RU合意）
- SPEC 詳細マッピング表は case-run 都度対応
- 横断是正は単一 case で実施し適宜 issue 分割

ユーザー合意に基づき無効化された項目:
- RU 受け入れ条件3（正規な定義元の責務分担の日本語定義）は無効。詳細は SPEC 委譲。
