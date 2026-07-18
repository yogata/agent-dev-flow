---
draft_type: feature
topic_slug: distribution-concrete-id-and-docs-paths-staged-removal
status: saved
created_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-0007
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  配布 Command/Skill 本文に残存する concrete ID 参照（REQ-NNNN、ADR-NNNN、
  IR-NNNN）と docs/src 内部パス参照（docs/specs/**、docs/guides/** 等）が
  check_integrity.ts の RuntimeReference 検査で NG 218件、WARNING 10件を
  発火。配布物が consumers 環境で未解決参照となり check_distribution_boundary.ts
  が EXIT=1 で docs-check 全体を恒久的に fail させている。REQ-0162-007/008
  で既要件化済み（配布物本文は識別子・内部パス参照を含まない）、実装修復が主
  だが、影響範囲が広大なため command 群・skill 群ごとの分割 case で段階対応
  する。REQ-0162-010 として段階的除去計画を新設し、RU-0011（harness-separation
  baseline list, TS-004）と連動、段階解消で TS-004 pass を目指す。除去後も
  文意保持（REQ-0142）を確認。

auto_gate:
  auto_ready: true
  open_questions: []
  conflicts: []

agreed_items:
  - id: AG-001
    statement: >-
      定量的影響: check_integrity.ts の RuntimeReference 検査で NG 218件、
      WARNING 10件。配布物が consumers 環境で未解決参照となり
      check_distribution_boundary.ts が EXIT=1 で完了、docs-check 全体を
      fail させる主要因。
    source_rus: [RU-0007]
  - id: AG-002
    statement: >-
      REQ-0162-007「配布物本文は識別子（REQ-NNNN、ADR-NNNN、IR-NNNN）を含まない」、
      REQ-0162-008「配布物本文は docs/specs/**、docs/guides/** 等の内部パス
      参照を含まない」で既要件化済み。本 RU は実装修復が主、新規要件は段階的
      除去計画（REQ-0162-010）のみ。ADR-0136（配布物 harness 実行制御分離）、
      REQ-0142（文意保持）も関連。
    source_rus: [RU-0007]
  - id: AG-003
    statement: >-
      影響範囲が広大（NG 218件）のため、command 群・skill 群ごとの分割 case
      として段階対応する。各 case で対象 command/skill 群を限定し、IR-055
      カタログの該当項目を順次解消する。一括除去は行わない。
    source_rus: [RU-0007]
  - id: AG-004
    statement: >-
      除去後も文意が保持されることを確認（REQ-0142-001 Markdown 構文破損
      なし、REQ-0142-002 主要構造重複なし、REQ-0142-003 壊れた参照残骸
      なし、REQ-0142-004 command/skill/SPEC 間責務説明矛盾なし）。単なる
      grep 置換ではなく、文脈を踏まえた除去・置換表現への差し替え。
    source_rus: [RU-0007]
  - id: AG-005
    statement: >-
      RU-0011（harness-separation baseline list, TS-004 方針）と連動。
      RU-0011 は baseline 11件の SPEC リスト化と TS-004 方針（c: 実装改修
      で0件）を採用。本 RU の段階解消が完了すれば TS-004 pass に寄与。
      RU-0011 の baseline リストを参照対象として活用する。
    source_rus: [RU-0007]
  - id: AG-006
    statement: >-
      RU-0002（REQ-0119 横断是正）と対象領域が一部重複する可能性。RU-0002
      は同一契約再定義の解消、本 RU は concrete ID・内部パス参照の除去。
      両者は関心が異なるが、同じ配布物を編集するため、同一 Epic Wave への
      配置を検討し編集衝突を回避する。
    source_rus: [RU-0007]

artifact_actions:
  - target: REQ-0162
    operation: append
    new_id: REQ-0162-010
    description: >-
      配布 Command/Skill 本文の concrete ID 参照・docs/src 内部パス参照の
      除去は、影響範囲（NG 218件、WARNING 10件）を踏まえ command 群・skill
      群ごとの分割 case で段階対応すること。各 case は IR-055 カタログの
      該当項目を順次解消し、除去後は REQ-0142（文意保持、構文健全性、責務
      整合）を満たすことを完了条件とする。RU-0011 baseline リストを参照
      対象として活用すること。
    rationale: >-
      REQ-0162-007/008 は原則を要件化済みだが、段階的除去計画と完了条件
      （REQ-0142 適用）が未明示。NG 218件を計画的に解消するため。
  - target: src/opencode/commands/agentdev/*.md
    operation: 実装修復
    description: >-
      配布 command 本文の concrete ID 参照・docs/src 内部パス参照を除去。
      文脈を踏まえた置換表現（例: 「REQ-0119 で要件化」→「責務分界 REQ で
      要件化」等の識別子非依存表現）へ差し替え。command 群ごとに分割 case。
  - target: src/opencode/skills/agentdev-*/SKILL.md
    operation: 実装修復
    description: >-
      配布 skill SKILL.md の concrete ID 参照・docs/src 内部パス参照を除去。
      skill 群ごとに分割 case。
  - target: src/opencode/skills/agentdev-*/references/*.md
    operation: 実装修復
    description: >-
      配布 skill references/ 配下の concrete ID 参照・docs/src 内部パス参照
      を除去。references 群ごとに分割 case。

conflict_resolutions:
  - id: CR-001
    description: >-
      REQ-0162-010 新設と RU-0011 REQ-0162-009（baseline list 件数定義）の
      関係。
    resolution: >-
      REQ-0162-009 は baseline リスト・件数定義（RU-0011）、REQ-0162-010 は
      段階的除去計画・完了条件（本 RU）。両者は別関心、連動して運用。
      REQ-0162-010 は REQ-0162-009 の baseline リストを参照対象として活用。
  - id: CR-002
    description: >-
      RU-0002（REQ-0119 横断是正）との対象領域重複。
    resolution: >-
      RU-0002 は同一契約再定義の解消、本 RU は concrete ID・内部パス参照の
      除去で関心が異なる。同じ配布物を編集するため、同一 Epic Wave 配置で
      編集衝突を回避する。

operation_units:
  - id: OU-001
    description: >-
      REQ-0162 へ REQ-0162-010 を APPEND。段階的除去計画要件。
    depends_on: []
    artifact: docs/requirements/REQ-0162.md
  - id: OU-002
    description: >-
      NG 218件、WARNING 10件を command 群・skill 群ごとに分類。分割 case
      構成を策定。IR-055 カタログ該当項目をリスト化。
    depends_on: [OU-001]
    artifact: Findings
  - id: OU-003
    description: >-
      command 群ごとの分割 case を順次実施。各 case で対象 command 群を
      限定し、concrete ID・内部パス参照を文脈保持型置換へ差し替え。
      REQ-0142 完了条件確認。
    depends_on: [OU-002]
    artifact: src/opencode/commands/agentdev/*.md
  - id: OU-004
    description: >-
      skill 群（SKILL.md + references/）ごとの分割 case を順次実施。
    depends_on: [OU-002]
    artifact: src/opencode/skills/agentdev-*/**
  - id: OU-005
    description: >-
      check_integrity.ts と check_distribution_boundary.ts で NG/WARNING
      減少を確認。docs-check 全体の EXIT=0 達成を目標。
    depends_on: [OU-003, OU-004]
    artifact: 検査結果

test_strategy:
  - id: TS-001
    verification: >-
      REQ-0162-010 が docs/requirements/REQ-0162.md に追記されていること。
    pass_criteria: REQ-0162-010 エントリが存在し段階的除去計画が記載。
    on_failure: OU-001 の APPEND 実施。
  - id: TS-002
    verification: >-
      NG 218件、WARNING 10件の command 群・skill 群ごとの分類リストが
      作成されていること。
    pass_criteria: Findings に分割 case 構成と IR-055 該当項目リストが記載。
    on_failure: OU-002 の実施。
  - id: TS-003
    verification: >-
      各分割 case 完了後、REQ-0142（文意保持、構文健全性、責務整合）を
      満たすこと。Markdown 構文破損、主要構造重複、壊れた参照残骸、
      責務説明矛盾がないこと。
    pass_criteria: >-
      REQ-0142-001〜004 の全要件を満たす。inspect-docs/inspect-skills
      で確認。
    on_failure: >-
      文意保持型でない機械的置換を見直し、文脈を踏まえた置換表現へ修正。
  - id: TS-004
    verification: >-
      check_integrity.ts と check_distribution_boundary.ts で NG/WARNING
      が減少していること。最終的に docs-check 全体の EXIT=0 を目標。
    pass_criteria: >-
      NG 218件→0件、WARNING 10件→0件、check_distribution_boundary.ts
      EXIT=0。
    on_failure: >-
      残存対象の追加特定・除去を実施。
  - id: TS-005
    verification: >-
      RU-0011 TS-004（harness-separation baseline 0件方針）への寄与を確認。
      本 RU の段階解消で TS-004 pass 条件に寄与すること。
    pass_criteria: >-
      RU-0011 baseline 11件リストの対象が本 RU で解消され、TS-004 の
      pass_criteria に寄与。
    on_failure: >-
      RU-0011 baseline リストと本 RU の分割 case の対応を再確認。

case_open_hints:
  recommended_label: "type:refactor, scope:agentdev-commands+skills, area:distribution-concrete-id-removal"
  scope_statement: >-
    配布 Command/Skill 本文の concrete ID 参照・docs/src 内部パス参照
    （NG 218件、WARNING 10件）を command 群・skill 群ごとの分割 case で
    段階除去し、docs-check 全体の EXIT=0 を達成する。
  suggested_breakdown:
    - "Wave 1: REQ-0162-010 APPEND、NG/WARNING 分類リスト作成"
    - "Wave 2: command 群の分割 case 順次実施（文意保持確認）"
    - "Wave 3: skill 群（SKILL.md + references/）の分割 case 順次実施"
    - "Wave 4: check_integrity.ts + check_distribution_boundary.ts 減少確認"
    - "Wave 5: RU-0011 TS-004 pass 寄与確認"
  dependencies:
    - "REQ-0162-007/008 既存要件との整合"
    - "REQ-0142（文意保持）完了条件遵守"
    - "ADR-0136（配布物 harness 実行制御分離）"
    - "RU-0011（harness-separation baseline list, TS-004）と連動"
    - "RU-0002（REQ-0119 横断是正）と同一 Epic Wave 検討で編集衝突回避"
```

# summary

RU-0007（配布物 concrete ID・docs/src 内部パス参照段階除去）を処理。配布 Command/Skill 本文の concrete ID 参照（REQ-NNNN、ADR-NNNN、IR-NNNN）と docs/src 内部パス参照が NG 218件、WARNING 10件で、check_distribution_boundary.ts が EXIT=1 で docs-check 全体を恒久 fail。REQ-0162-007/008 で既要件化済み、実装修復が主だが、影響範囲が広大なため command 群・skill 群ごとの分割 case で段階対応。REQ-0162-010 として段階的除去計画を新設、RU-0011（baseline list, TS-004）と連動し段階解消で TS-004 pass に寄与。除去後は REQ-0142（文意保持）を完了条件とする。

work_type=feature、scale=standard（large 影響だが標準手順で進める）。test_strategy は5件。Wave 5段階での分割実装を推奨。
