---
draft_type: req_draft
topic_slug: auto-gate-completion-gate
status: saved
created_at: 2026-06-23T01:30:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  req-define に auto_gate 完了ゲートを新設する。要件doc保存後・要件doc確認前に
  auto_gate.auto_ready を確認し、false または未解決 item が残る場合は壁打ち（Step 3）
  へ差し戻す。ユーザーが明示的に「false で標準フロー手動実行する」と選択した場合のみ
  false を許容し、選択を conflict_resolutions に記録する。
  発端: ses_1103a99c6ffejJpdlW3cP4dOn0 で auto_ready:false のドラフトが case-auto 即停止し、
  ユーザーが手動で stop_reasons 解消を担った件の是正。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-0102（要件定義・保存）に auto_gate 完了ゲート要件を2行追加する。
      REQ-0102-070: req-define は要件doc保存後・要件doc確認（Step 11）の前に
        auto_gate を確認し、auto_ready:false または unresolved_questions/
        unresolved_conflicts/out_of_repo_operations/stop_reasons に未解決 item が
        残る場合、当該 stop_reasons を解消する方策を壁打ち（Step 3）で合意すること。
      REQ-0102-071: ユーザーが明示的に「auto_ready:false のまま標準フローで手動実行する」
        と選択した場合のみ false を許容すること。当該選択は conflict_resolutions に記録すること。

  - id: AG-002
    content: |
      req-define command spec（src/opencode/commands/agentdev/req-define.md）に
      Step 10-2（auto_gate完了ゲート）を新設する。Step 10（ドラフト保存）の後・
      Step 11（要件doc確認）の前に配置する。
      内容:
      - auto_gate.auto_ready が false、または unresolved_questions/conflicts/
        out_of_repo_operations/stop_reasons に未解決 item が残る場合、
        stop_reasons をユーザーに提示し、解消方策（作業分散・対象絞り込み・
        スコープ削除等）を壁打ちで合意する
      - 合意により stop_reasons が解消された場合は auto_ready:true に更新し、
        Step 11 へ進む
      - ユーザーが「auto_ready:false のまま標準フローで手動実行する」と明示的に
        選択した場合、当該選択を conflict_resolutions に記録し、Step 11 へ進む
      - 上記いずれにも該当しない（未解決のまま）場合は Step 3（壁打ち）へ差し戻す

  - id: AG-003
    content: |
      docs/specs/commands/req-define.md（command SPEC）の「現在の動作」セクションに
      auto_gate 完了ゲート（Step 10 相当）の記述を追加する。

  - id: AG-004
    content: |
      QG-1（src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md）
      の検査観点に「9. auto_gate完全性」を追加する。
      - fail: auto_gate フィールドが不在、または auto_ready:false で stop_reasons が空
      - warn: auto_ready:false で stop_reasons が記載されているがユーザー承認が未確認
      - pass: auto_ready:true、または auto_ready:false で stop_reasons が
        ユーザー承認済み（conflict_resolutions 記録済み）

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0102
    source_items: [AG-001]
    content: |
      REQ-0102「要件定義・保存」への APPEND。以下の要件行を追加:
      | REQ-0102-070 | req-define は要件doc保存後・要件doc確認前に auto_gate を確認し、auto_ready:false または未解決 item（unresolved_questions/conflicts/out_of_repo_operations/stop_reasons）が残る場合、当該 stop_reasons を解消する方策を壁打ち（Step 3）で合意すること |
      | REQ-0102-071 | ユーザーが明示的に「auto_ready:false のまま標準フローで手動実行する」と選択した場合のみ false を許容すること。当該選択は conflict_resolutions に記録すること |

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    source_items: [AG-003]
    content: |
      docs/specs/commands/req-define.md の「現在の動作」セクションに
      auto_gate完了ゲートの記述を追加する。
      Step 9（ドラフト保存）の次・Step 10（要件doc確認）の前に
      「Step 9-2: auto_gate完了ゲート」を追加:
      - auto_gate.auto_ready:false または未解決 item 残存時、stop_reasons を提示し
        解消方策を壁打ちで合意。解消時は auto_ready:true に更新。
      - ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。
      - 未解決のままの場合は Step 2（壁打ち）へ差し戻し。
      ※ SPEC の Step 番号は command spec とは独立採番（SPEC は Step 0 起点）のため、
      spec-save が SPEC 内の該当位置に挿入する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      auto_gate.auto_ready:false のドラフトが case-auto で即停止し、ユーザーが手動で
      stop_reasons 解消を担う問題。ses_1103a99c6ffejJpdlW3cP4dOn0 で発生（200ファイル査読を
     含むカタログ作成が「単一Issueでは完結しない」として auto_ready:false に設定されたまま
      req-define が完了し、case-auto 起動で即停止）。
    resolution: |
      req-define に auto_gate 完了ゲート（Step 10-2）を新設し、auto_ready:false を検出した
      場合は壁打ち（Step 3）へ差し戻す。stop_reasons を解消する方策（作業分散・対象絞り込み・
      スコープ削除等）を壁打ちで合意し、auto_ready:true に更新してから完了する。
      例外としてユーザーが明示的に false を選択した場合のみ false を許容し、
      conflict_resolutions に記録する。現行 spec は auto_gate を消費側（case-auto）の
      停止判定材料としてのみ定義し（REQ-0138-013, REQ-0114-078）、生成側（req-define）の
      完了条件として定義していなかったことが根本原因。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0102
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_spec: docs/specs/commands/req-define.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
```

# summary

req-define に auto_gate 完了ゲート（Step 10-2）を新設する。auto_ready:false または未解決 item 残存時は壁打ち（Step 3）へ差し戻し、stop_reasons 解消方策を合意して auto_ready:true に更新する。ユーザーが明示的に false を選択した場合のみ例外として false を許容し、conflict_resolutions に記録する。REQ-0102 へ2要件行追加（REQ-0102-070/071）、command spec へ Step 10-2 新設、command SPEC と QG-1 へ観点追加。発端は ses_1103a99c6ffejJpdlW3cP4dOn0 での auto_ready:false ドラフトが case-auto 即停止した件。
