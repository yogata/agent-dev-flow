---
draft_type: req_draft
topic_slug: req-adr-structure-integrity
status: saved
created_at: 2026-06-25T09:00:00+09:00
source_rus:
  - RU-0001
  - RU-0003
  - RU-0004
  - RU-0014
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  ADR-0126（superseded）→ ADR-0131（link mode）移行に伴う残存語彙を 4 ファイル（glossary.md、consumer-project-setup.md、DOC-MAP.md、local-case-file.md）で一括是正する。src/opencode-local/transform/ ディレクトリは完全削除（CR-001 User Decision）。REQ 要件行の Step 番号参照（REQ-0102-070、REQ-0151-007）を機能名参照へ置換し、再発防止条項を REQ-0136 に追加する。SPEC↔command 間の Step 番号ずれ（req-define）を解消し、一致原則を REQ-0143 に追加する。agentdev-req-analysis SKILL.md の references/req-define-detailed-gates.md は実在・完結確認済み（CR-002、163行、dangling 参照なし、OU-004 検証完了のみ）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/guides/glossary.md、docs/guides/consumer-project-setup.md、docs/DOC-MAP.md、docs/specs/local-case-file.md の ADR-0126（superseded）参照および generation-mode 語彙（generated_by 識別、変換プロンプト経由生成、consumer-generated 等）を ADR-0131 link mode 語彙へ是正すること。是正後、現行文書は ADR-0126 を現行根拠として引用せず、ADR-0131 への supersession 関係（frontmatter superseded_by 参照）または履歴参照形式でのみ言及すること（REQ-0112-053 準拠）。docs/specs/local-case-file.md L242 の関連項目参照は ADR-0131 へ差し替えること。4 ファイル横断の語彙是正を単一 Issue で処理の対象とするかは case-open で判断する。
  - id: AG-002
    content: |
      REQ-0102-070 の要件行に含まれる「壁打ち（Step 3）」を機能名参照（例: 壁打ちフェーズ）へ置換し、command/SPEC の Step 番号依存を除去すること。REQ-0151-007 の要件行に含まれる「case-close Step 4 に rebase を追加」を機能名参照（例: case-close のマージ手順に rebase を追加）へ置換し、特定 Step 番号への依存を除去すること。両行とも Step 番号は SPEC 詳細に属し、REQ 要件行に混入しない（REQ-0136、REQ-0102-055、IR-044 準拠）。
  - id: AG-003
    content: |
      全現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照すること（再発防止）。REQ-0136 へ本原則を必達要件として追加する。本原則は安定契約（REQ-0101-069）に該当する REQ レベルの記述制約であり、検出の詳細シグナル、exemption 条件は SPEC（integrity-rule-catalog.md IR-044）に配置する。
  - id: AG-004
    content: |
      command SPEC（docs/specs/commands/*.md）と command 定義ファイル（src/opencode/commands/agentdev/*.md）の Step 番号構成は一致すること。req-define.md の SPEC↔command Step 番号ずれ（SPEC が Step 0 を独立番号扱いし command と 1 ずれる）を解消すること。req-define.md 以外の command/SPEC ペアに同種のずれがないか横展開確認すること。ずれ解消の具体的手法（SPEC 側 +1 シフト、command 側 Step 0 廃止、双方で Step 0 明示採番のいずれか）は REQ-0143 APPEND の原則に従い case-run で確定する。
  - id: AG-005
    content: |
      agentdev-req-analysis SKILL.md の references 参照は実在ファイルのみを指すこと。dangling 参照（参照先ファイル不在、404）を残さないこと。references/req-define-detailed-gates.md は 2026-06-23 時点で既存のため、事前確認でファイル内容の完結性と参照整合性を検証し、不足があれば補修正すること。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/local-case-file.md
    target_area: "## 関連情報"
    source_items: [AG-001]
    content: |
      ## 関連情報

      - **関連 ADR**: ADR-0131（ローカル版導入方式を link mode へ統一し生成方式を廃止。ADR-0126 を supersede）
      - **関連 REQ**: REQ-0141（ローカル版 OpenCode 導入方式とローカルCaseファイル運用）、REQ-0150（ローカル版 agentdev-gh-cli 実装）
      - **関連 SPEC**: local-generation.md、local-transform.md、runtime-package-boundary.md

      ADR-0126（superseded）は履歴参照のみとし、現行根拠として扱わない（REQ-0112-053 準拠）。
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0102.md
    target_area: "REQ-0102-070"
    source_items: [AG-002]
    content: |
      REQ-0102-070（変更後）: req-define は要件doc保存後、要件doc確認前に auto_gate を確認し、auto_ready:false または未解決 item（unresolved_questions/conflicts/out_of_repo_operations/stop_reasons）が残る場合、当該 stop_reasons を解消する方策を壁打ちフェーズで合意すること
    consumed:
      req_save: true
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0102.md
      applied_id: REQ-0102-070
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0151.md
    target_area: "REQ-0151-007"
    source_items: [AG-002]
    content: |
      REQ-0151-007（変更後）: case-close と case-merge を分離しないこと。case-close のマージ手順に rebase を追加し、責務境界を「完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）」と再定義すること
    consumed:
      req_save: true
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0151.md
      applied_id: REQ-0151-007
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0136.md
    source_items: [AG-003]
    content: |
      | REQ-0136-029 | 全現行 REQ の要件行は command 定義または SPEC の Step 番号を直接参照せず、機能名・フェーズ名で参照すること。Step 番号は SPEC 詳細に属し、REQ 要件行に混入しないこと。検出の詳細シグナル、exemption 条件は SPEC（integrity-rule-catalog.md IR-044）に配置すること |
    consumed:
      req_save: true
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0136.md
      draft_proposed_id: REQ-0136-029
      allocated_id: REQ-0136-031
      allocation_note: REQ-0136-029 は既存行（max=030）のため欠番埋め禁止規約により REQ-0136-031 を採番
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-0143.md
    source_items: [AG-004]
    content: |
      | REQ-0143-004 | command SPEC（docs/specs/commands/*.md）と command 定義ファイル（src/opencode/commands/agentdev/*.md）の Step 番号構成は一致すること。Step 0 扱い、採番開始位置の詳細は SPEC（docs/specs/command-file-format.md）に配置すること |
    consumed:
      req_save: true
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0143.md
      applied_id: REQ-0143-004
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: "## 現在の動き"
    source_items: [AG-004]
    content: |
      ## 現在の動き

      req-define の Step 番号構成は command 定義（src/opencode/commands/agentdev/req-define.md）と一致する（REQ-0143-004）。Step 0「セッションコンテキスト検知」は明示的な採番対象とし、後続フェーズの Step 番号は command 定義と完全に一致させる。 SPEC と command で Step 番号がずれる場合、SPEC 側を command 定義へ合わせる。

      注: 本セクションの Step 番号再採番（旧構成からの移行）は case-run で実施する。移行後、完了条件・テスト戦略と実装の間で Step 番号変換が不要となることを確認すること。

conflict_resolutions:
  - id: CR-001
    topic: "RU-0001 transform/ ディレクトリ処遇"
    resolution: "完全削除"
    rationale: "ユーザー判断（req-define 壁打ち 2026-06-25）。src/opencode-local/transform/ ディレクトリおよび配下3ファイル（generate.md, review.md, spec.md）を削除し、全参照元から transform/ プロンプト参照を除去する。REQ-0141-004/009/028 の「廃止候補」宣言を確定廃止へ昇格。"
    decision_source: user
  - id: CR-002
    topic: "RU-0014 dangling 参照（references/req-define-detailed-gates.md）"
    resolution: "検証完了、dangling 参照なし"
    rationale: "req-define 壁打ち（2026-06-25）で実ファイル確認。当該ファイルは 163 行・既存、SPLIT 予兆計算ロジック（計測手順/シグナル算出表/draft-meta.split-forecast 構造）を含む全セクション完結。SKILL.md L288 参照は有効。OU-004 は検証完了のみで扱い、補修正不要。"
    decision_source: verification

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec: docs/specs/local-case-file.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      consumed_by: spec-save
      note: "ACT-SPEC-001 は spec-save コマンドの対象。req-save は処理せず。"
  - ou_id: OU-002
    source_ru: RU-0003
    target_req: REQ-0136
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      consumed_by: req-save
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0136.md
      allocated_id: REQ-0136-031
      draft_proposed_id: REQ-0136-029
      allocation_note: "REQ-0136-029 は既存行のため欠番埋め禁止規約（agentdev-req-file-manager）により REQ-0136-031 を採番（max=030 → +1）。alloc-composite-id.ts 実行結果に基づく。"
      artifact_action_ref: ACT-REQ-003
  - ou_id: OU-003
    source_ru: RU-0004
    target_req: REQ-0143
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      consumed_by: req-save
      consumed_at: 2026-06-26T01:49:41+09:00
      saved_path: docs/requirements/REQ-0143.md
      allocated_id: REQ-0143-004
      artifact_action_ref: ACT-REQ-004
  - ou_id: OU-004
    source_ru: RU-0014
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      consumed_by: none
      note: "CR-002 検証完了のみ。dangling 参照なし（references/req-define-detailed-gates.md は既存・完結）。補修正不要のため req-save/spec-save いずれも対象外。"

req_save_results:
  consumed_at: 2026-06-26T01:49:41+09:00
  saved_documents:
    - REQ-0102 (UPDATE: REQ-0102-070 Step参照→機能名置換)
    - REQ-0136 (APPEND: REQ-0136-031 再発防止条項)
    - REQ-0143 (APPEND: REQ-0143-004 SPEC↔command Step 一致原則)
    - REQ-0151 (UPDATE: REQ-0151-007 Step参照→機能名置換)
  artifact_action_mapping:
    ACT-REQ-001: { target: REQ-0102, applied_id: REQ-0102-070 }
    ACT-REQ-002: { target: REQ-0151, applied_id: REQ-0151-007 }
    ACT-REQ-003: { target: REQ-0136, applied_id: REQ-0136-031 }
    ACT-REQ-004: { target: REQ-0143, applied_id: REQ-0143-004 }
  source_ru_to_req_mapping:
    RU-0003: [ACT-REQ-001, ACT-REQ-002, ACT-REQ-003]
    RU-0004: [ACT-REQ-004]
  skipped_artifact_actions:
    ACT-SPEC-001: "spec-save 対象（docs/specs/local-case-file.md）"
    ACT-SPEC-002: "spec-save 対象（docs/specs/commands/req-define.md）"
  validation_results:
    frontmatter_consistency: { ok: true }
    entry_existence_REQ-0136: { ok: true, found_in: [docs/requirements/README.md, docs/DOC-MAP.md] }
    entry_existence_REQ-0143: { ok: true, found_in: [docs/requirements/README.md, docs/DOC-MAP.md] }
    change_impact: { ok: true, violations: [] }
  index_update_note: "新規 REQ ファイル追加なし（全 UPDATE/APPEND）。README/docs/README.md の REQ 数（46件）は不変のためインデックス更新不要。"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/guides/glossary.md、docs/guides/consumer-project-setup.md、docs/DOC-MAP.md、docs/specs/local-case-file.md において ADR-0126 の現行根拠引用がなくなり、ADR-0131 link mode 語彙へ是正されていることを確認する。docs-check および inspect-docs で ADR-0126 矛合検出が 0 件となることを確認する。
    pass_criteria: |
      4 ファイルから ADR-0126 の現行根拠引用が除去され、ADR-0131 語彙へ是正されていること。docs-check で ADR-0126 矛合が検出されないこと。
    on_failure: |
      fix-and-reverify。是正漏れファイルがある場合、当該ファイルを修正し、docs-check がクリアするまで再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0102-070 および REQ-0151-007 の要件行を確認し、「Step 3」「Step 4」等の Step 番号参照が除去され、機能名・フェーズ名参照に置換されていることを確認する。
    pass_criteria: |
      REQ-0102-070、REQ-0151-007 の要件行に command/SPEC の Step 番号が含まれないこと。
    on_failure: |
      fix-and-reverify。Step 番号参照が残存する場合、機能名参照へ置換し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0136 に「全現行 REQ の要件行は Step 番号を直接参照せず機能名・フェーズ名で参照すること」の必達要件行が追加されていることを確認する。integrity-rule-catalog.md の IR-044 に本原則に基づく検出シグナルが記載されていることを確認する。
    pass_criteria: |
      REQ-0136 に再発防止条項が追加され、IR-044 で検出可能であること。
    on_failure: |
      fix-and-reverify。要件行または検出シグナルが未記載の場合、追記し、回帰テストで既存 true positive が免除されないことを確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/commands/req-define.md の Step 番号構成と src/opencode/commands/agentdev/req-define.md の Step 番号が一致することを確認する。req-define.md 以外の command/SPEC ペア（docs/specs/commands/*.md と src/opencode/commands/agentdev/*.md）について、Step 番号ずれがないことを横展開で確認する。
    pass_criteria: |
      全 command/SPEC ペアで Step 番号構成が一致し、変換負荷が除去されていること。
    on_failure: |
      fix-and-reverify。ずれが残るペアがある場合、SPEC 側を command 定義へ一致させ、再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      src/opencode/skills/agentdev-req-analysis/SKILL.md が参照する references/*.md の全ファイルが実在することを確認する。references/req-define-detailed-gates.md の内容が SPLIT 予兆計算ロジックを網羅していることを確認する。SKILL.md に dangling 参照（存在しないファイルへのリンク）が残っていないことを確認する。
    pass_criteria: |
      SKILL.md の全 references 参照が実在ファイルを指し、dangling 参照が存在しないこと。
    on_failure: |
      fix-and-reverify。dangling 参照が残る場合、参照を除去するかファイルを補充し、参照先が解決することを再検証する。

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

本ドラフトは REQ/ADR 構造整合・表記是正に関する 4 RU（RU-0001、RU-0003、RU-0004、RU-0014）を統合する。

- **RU-0001**: ADR-0126→0131 残存語彙是正（4 ファイル、local-case-file.md は SPEC update、他 3 ファイルは case-run で実施）。transform/ 処遇は stop_reasons（既定: 廃止明記）。
- **RU-0003**: REQ-0102-070、REQ-0151-007 の Step 番号参照除去（UPDATE）+ REQ-0136 へ再発防止条項追加（APPEND）。
- **RU-0004**: REQ-0143 へ SPEC↔command Step 一致原則追加（APPEND）+ req-define.md SPEC の Step 再採番（UPDATE）。ずれ解消手法は case-run で確定。
- **RU-0014**: dangling 参照の事前確認。references/req-define-detailed-gates.md は既存のため、検証完了で扱う可能性が高い（stop_reasons に記録）。

SPLIT 健全性: 新規追加要件行 2（REQ-0136: +1、REQ-0143: +1）、UPDATE のみ 2（REQ-0102、REQ-0151 は行数不変）。関心分類数 1（表記・構造整合是正）。アーティファクト種別数 3（REQ、SPEC、guide/skill は case-run 実施対象で artifact_actions 外）。合計 SPLIT シグナル 1（アーティファクト種別）。APPEND 許可範囲。
