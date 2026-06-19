---
draft_type: req_draft
topic_slug: {topic-slug}
status: draft
created_at: {ISO 8601 timestamp}
source_rus: # optional: RU-* IDs that seeded this draft
---

<!-- req_draft テンプレート（REQ-0138, ADR-0124）
     このテンプレートは req-define が生成する構造化ハンドオフ成果物の原本である。
     下流処理（req-save / spec-save / case-open / case-auto / case-run / case-close）の
     正となる情報源は # draft-data 内の fenced YAML であり、人間可読 Markdown セクションではない。
     soft contract（producer-side standard）であり、LLM 推論経由で消費される。
     厳格 schema version・JSON Schema・validator は導入しない（ADR-0124）。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する（REQ-0138-010）
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: {合意内容の1段落要約}

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する（REQ-0138-013）
  auto_ready: true
  unresolved_questions: []      # 未解決質問が残る場合は停止理由として列挙
  unresolved_conflicts: []      # 未解決衝突が残る場合は停止理由として列挙
  out_of_repo_operations: []    # repo 外操作が必要な場合は停止理由として列挙
  stop_reasons: []              # その他の停止理由

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない（REQ-0138-008）
agreed_items:
  - id: AG-001
    content: {合意された要件内容の本文}
  - id: AG-002
    content: {合意された要件内容の本文}

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合（REQ-0138-009）
# 1 action = 1 artifact × 1 editing concern（REQ-ID 単位でも箇条書き1行単位でもない・REQ-0138-017）
# 同一関心の複数 agreed items は単一 action に複数段落の content としてまとめる
artifact_actions:
  - id: ACT-REQ-001             # ACT-{ARTIFACT}-{NNN}
    artifact: req               # req / adr / spec
    operation: create           # REQ/ADR: create / append / update、SPEC: create / update
    target: new:{topic-slug}    # file path または new:{slug}
    target_area: # optional: section / area 指定
    source_items: [AG-001, AG-002] # 対応する agreed_item ID の list
    content: |                  # 保存対象の full text
      {保存対象の本文}
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:{topic-slug}
    source_items: [AG-003]
    content: |
      {保存対象の本文}
  - id: ACT-SPEC-001            # SPEC 保存対象（artifact: spec）が含まれる場合 spec-save が実行される
    artifact: spec
    operation: create           # SPEC: create / update
    target: new:{topic-slug}
    target_area:
    source_items: [AG-004]
    content: |
      {保存対象の本文}

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない（REQ-0138-014）
conflict_resolutions:
  - id: CR-001
    conflict: {検出された衝突内容}
    resolution: {解消方針と根拠}

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: # optional: 元 RU-ID
    target_req: REQ-{NNNN}      # REQ 操作の対象 REQ
    target_spec: # optional: SPEC 操作の対象 SPEC パス（例: docs/specs/patterns.md、新規は new:{topic-slug}）
    operation: create           # create / append / update（SPEC 操作は spec-create / spec-update も可・後方互換）
    scale: standard             # standard / large
    depends_on: []              # 実在する ou_id を参照
    recommended_order: 1
    issue_policy: single        # single / epic
    result: {}                  # req-save / spec-save / case-open が書き戻す。req-define は空を出力

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false            # 単一 Issue で完結する場合は false
  decomposition: # optional: scale large 時の分解参考情報
  wave_hints: []                # optional: 技術的依存に基づく Wave 構成の参考
```

# summary

<!-- 【任意】 人間可読サマリー。下流処理の正としては扱われない（REQ-0138-002）。
     処理の権威ある情報源は上記 # draft-data YAML block である。
     検討経緯や採用しない方針は処理対象として残さない（REQ-0138-003）。 -->

{合意内容の人間可読補足。検討経緯・不採用方針は含めない}
