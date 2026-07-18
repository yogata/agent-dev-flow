---
draft_type: feature
topic_slug: req0119-remaining-command-duplication-staged-resolution
status: saved
created_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-0002
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  REQ-0119 横断是正の残対応。PR #1534 で9箇所の同一契約再定義を解消したが、
  残り6 command に追加の Step X-Y 細分番号が残存し REQ-0119-033〜036 から
  逸脱している。一部は command 固有の公開契約に密接で移動により公開契約の
  意味が変わるリスクがある。REQ-0119-033〜036 で既要件化済み、実装修復が主
  だが、6 command のリストアップ・分類（移動可能 vs 公開契約密接）と段階的
  対応計画を REQ-0119-037 として新設し、RU-0012（重複許容基準 SPEC 適用例）
  と連動して進める。一括移送せず段階的対応を前提とする。

auto_gate:
  auto_ready: true
  open_questions: []
  conflicts: []

agreed_items:
  - id: AG-001
    statement: >-
      PR #1534 では「正規な定義元が既存であった明確な重複の是正」に限定し
      9箇所の同一契約再定義を解消済み。残り6 command には追加の Step X-Y
      細分番号が含まれ、追加是正が可能なまま残置されている。6 command の
      具体名は case-open/case-run で check_integrity.ts 等の実行結果から
      特定する。
    source_rus: [RU-0002]
  - id: AG-002
    statement: >-
      残存する重複定義は REQ-0119-033（正規定義）、REQ-0119-034（同一契約
      再定義抑止）、REQ-0119-035（公開契約維持）、REQ-0119-036（横断評価）
      からの逸脱。これらは既要件化済みで、本 RU は実装修復が主。新規要件は
      段階的対応計画（REQ-0119-037）のみ。
    source_rus: [RU-0002]
  - id: AG-003
    statement: >-
      一部は command 固有の公開契約に密接しており、移動により公開契約の
      意味が変わるリスクがある。各 command で REQ-0119-035「公開契約維持」
      を個別確認することが前提。公開契約に密接なものは個別 case として扱い、
      移動可否を慎重判断する。
    source_rus: [RU-0002]
  - id: AG-004
    statement: >-
      段階的対応を前提とし、一括移送を行わない。6 command を移動可能群と
      公開契約密接群に分類し、移動可能群から優先的に対応、公開契約密接群は
      RU-0012（artifact-responsibilities.md SPEC 重複許容基準適用例集）の
      整備後に個別判断する。
    source_rus: [RU-0002]
  - id: AG-005
    statement: >-
      RU-0012（重複許容基準 SPEC 適用例集）と対象領域が一部重複する可能性。
      RU-0012 で artifact-responsibilities.md SPEC に重複許容基準（REQ-0119-034
      例外、REQ-0147-001）の適用例集を整備し、本 RU は同 SPEC を参照して
      公開契約密接ケースの判断軸を得る。関連 case として整理する。
    source_rus: [RU-0002]

artifact_actions:
  - target: REQ-0119
    operation: append
    new_id: REQ-0119-037
    description: >-
      横断是正は段階的対応を前提とし、一括移送を行わないこと。対象 command
      を移動可能群と公開契約密接群に分類し、移動可能群から優先対応する。
      公開契約密接群は artifact-responsibilities.md SPEC の重複許容基準
      適用例（REQ-0119-034 例外）を参照し、移動可否を個別 case で慎重判断
      すること。
    rationale: >-
      REQ-0119-033〜036 は原則を要件化済みだが、段階的対応計画と公開契約
      密接ケースの個別判断要件が未明示。6 command の残存重複を計画的に
      解消するため。
  - target: src/opencode/commands/agentdev/*.md
    operation: 実装修復
    description: >-
      6 command（具体名は case-open/case-run で特定）の同一契約再定義
      （Step X-Y 細分番号）を解消。移動可能群は references/<topic>.md へ
      移送、公開契約密接群は個別 case で判断。

conflict_resolutions:
  - id: CR-001
    description: >-
      REQ-0119-037 新設と既存 REQ-0119-033〜036 の関係。
    resolution: >-
      REQ-0119-033〜036 は原則、REQ-0119-037 は段階的対応計画と個別判断
      要件。両者は補完関係。REQ-0119-037 は原則の適用を計画的に進める
      ための運用要件。
  - id: CR-002
    description: >-
      RU-0012（重複許容基準 SPEC 適用例）との対象領域重複。
    resolution: >-
      RU-0012 は SPEC 適用例集の整備、本 RU は6 command の段階解消。
      本 RU は RU-0012 の SPEC 適用例を参照して公開契約密接ケースを
      判断する。両 RU は関連 case として整理、同一 Epic Wave への配置を
      検討。

operation_units:
  - id: OU-001
    description: >-
      REQ-0119 へ REQ-0119-037 を APPEND。段階的対応計画要件。
    depends_on: []
    artifact: docs/requirements/REQ-0119.md
  - id: OU-002
    description: >-
      6 command の具体名を特定（check_integrity.ts の REQ-0119-036 横断
      評価実行、または PR #1534 差分から残存対象を抽出）。
    depends_on: [OU-001]
    artifact: Findings（.agentdev/ 或いは Issue 本文）
  - id: OU-003
    description: >-
      6 command を移動可能群と公開契約密接群に分類。RU-0012 の SPEC 適用例
      を参照。
    depends_on: [OU-002]
    artifact: Findings
  - id: OU-004
    description: >-
      移動可能群の同一契約再定義を references/<topic>.md へ移送。各 command
      の公開契約（REQ-0119-035）維持を確認。
    depends_on: [OU-003]
    artifact: src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/references/*.md
  - id: OU-005
    description: >-
      公開契約密接群を個別 case として判断。移動 or 重複許容（REQ-0119-034
      例外）を決定。RU-0012 SPEC 適用例に照らして判断。
    depends_on: [OU-003, RU-0012 OU-001]
    artifact: src/opencode/commands/agentdev/*.md

test_strategy:
  - id: TS-001
    verification: >-
      REQ-0119-037 が docs/requirements/REQ-0119.md に追記されていること。
    pass_criteria: REQ-0119-037 エントリが存在し段階的対応計画が記載。
    on_failure: OU-001 の APPEND 実施。
  - id: TS-002
    verification: >-
      6 command の具体名リストが作成されていること。
    pass_criteria: >-
      Findings または Issue 本文に6 command のリストと分類（移動可能/
      公開契約密接）が記載。
    on_failure: OU-002, OU-003 の実施。
  - id: TS-003
    verification: >-
      移動可能群の移送後、各 command の公開契約（公開目的、入力、出力、
      停止条件、永続成果物、委譲接続点）が維持されていること
      （REQ-0119-035）。
    pass_criteria: >-
      移送前後で公開契約の意味が不変。command SPEC と原本の整合性確認。
    on_failure: >-
      移送により公開契約が変化した場合は差分を復元し、別 case で判断。
  - id: TS-004
    verification: >-
      check_integrity.ts の REQ-0119-036 横断評価で、移送後に同一契約再定義
      の検出件数が減少していること。
    pass_criteria: 残存同一契約再定義の検出件数が PR #1534 時点から減少。
    on_failure: >-
      残存対象の追加特定・移送を実施。

case_open_hints:
  recommended_label: "type:refactor, scope:agentdev-commands, area:req0119-staged-resolution"
  scope_statement: >-
    REQ-0119 横断是正の残対応（6 command の同一契約再定義）を段階的に
    解消する。移動可能群と公開契約密接群に分類し、RU-0012 SPEC 適用例と
    連動して進める。
  suggested_breakdown:
    - "Wave 1: REQ-0119-037 APPEND、6 command 具体名特定"
    - "Wave 2: 移動可能群と公開契約密接群への分類"
    - "Wave 3: 移動可能群の references/ 移送（公開契約維持確認）"
    - "Wave 4: 公開契約密接群の個別 case 判断（RU-0012 SPEC 適用例参照）"
    - "Wave 5: check_integrity.ts 横断評価で減少確認"
  dependencies:
    - "REQ-0119-033〜036 既存要件との整合"
    - "PR #1534 で9箇所解消済み、残り6 command"
    - "RU-0012（重複許容基準 SPEC 適用例）と連動、同一 Epic Wave 検討"
    - "RU-0007（配布物 concrete ID 除去）と対象領域一部重複可能性"
```

# summary

RU-0002（REQ-0119 横断是正残対応）を処理。PR #1534 で9箇所解消済み、残り6 command に Step X-Y 細分番号の同一契約再定義が残存し REQ-0119-033〜036 から逸脱。REQ-0119-033〜036 は既要件化済み、実装修復が主だが、段階的対応計画（移動可能群 vs 公開契約密接群の分類）を REQ-0119-037 として新設。一括移送せず段階的対応、公開契約密接群は RU-0012（重複許容基準 SPEC 適用例）と連動して個別判断。

work_type=feature、scale=standard。test_strategy は4件。Wave 5段階での分割実装を推奨。
