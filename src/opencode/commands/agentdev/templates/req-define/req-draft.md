---
draft_type: req_draft
topic_slug: {topic-slug}
status: draft
created_at: {ISO 8601 timestamp}
source_rus: # optional: RU-* IDs that seeded this draft
---

<!-- req_draft テンプレート
 このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
 後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
 原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
 soft contract（生成元側標準）であり、LLM 推論経由で消費される。
 厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: {合意内容の1段落要約}

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する
  auto_ready: true
  unresolved_questions: []      # 未解決質問が残る場合は停止理由として列挙
  unresolved_conflicts: []      # 未解決衝突が残る場合は停止理由として列挙
  out_of_repo_operations: []    # repo 外操作が必要な場合は停止理由として列挙
  stop_reasons: []              # その他の停止理由

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない
agreed_items:
  - id: AG-001
    content: {合意された要件内容の本文}
  - id: AG-002
    content: {合意された要件内容の本文}

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern（REQ-ID 単位でも箇条書き1行単位でもない）
# 同一関心の複数 agreed items は単一 action に複数段落の content としてまとめる
artifact_actions:
  - id: ACT-REQ-001             # ACT-{ARTIFACT}-{NNN}
    artifact: req               # req / adr / spec
    operation: create           # REQ/ADR: create / append / update、SPEC: create / update
    target: new:{topic-slug}    # REQ/ADR: file path または new:{slug}。SPEC は target_spec 構造化推奨
    target_area: # artifact: spec の場合、operation: update/spec-update では必須（対象セクション見出し）。operation: create/spec-create および req/adr では任意
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
    target_spec:                # SPEC 操作は target_spec 構造化推奨（operation, domain, slug）。target: file path との併用も可
      operation: create         # create / update
      domain: foundations       # docs/specs/{domain}/ の domain（foundations/responsibilities/quality/integrity/local/authoring/commands/skills/workflows）
      slug: {topic-slug}        # ファイル名 slug（docs/specs/{domain}/{slug}.md を作成）
    target_area: # operation: create/spec-create では任意、operation: update/spec-update では必須（対象セクション見出し）
    source_items: [AG-004]
    content: |
      {保存対象の本文}

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: {検出された衝突内容}
    resolution: {解消方針と根拠}

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: # optional: 元 RU-ID
    target_req: REQ-{NNNN}      # REQ 操作の対象 REQ
    target_spec: # optional: SPEC 操作の対象 SPEC パス（例: docs/specs/{domain}/<existing-spec>.md、新規は target_spec: {operation, domain, slug} 構造化）
    operation: create           # create / append / update（SPEC 操作は spec-create / spec-update も可・後方互換）
    scale: standard             # standard / large
    depends_on: []              # 実在する ou_id を参照
    recommended_order: 1
    issue_policy: single        # single / epic
    result: {}                  # req-save / spec-save / case-open が書き戻す。req-define は空を出力

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
# on_failure（不合格時の処置）を持たない検証項目は test_strategy に含めないこと（REQ）
# 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
# on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）
test_strategy:
  - id: TS-001                 # TS-NNN（3桁ゼロ埋め連番）
    target_item: AG-001        # agreed_items の id（AG-*）への参照
    verification: |            # 検証手順
      {検証手順の本文}
    pass_criteria: |           # 合格基準
      {合格基準の本文}
    on_failure: |              # 不合格時の処置（fix-and-reverify / record-in-findings の選択理由を含む）
      {不合格時の処置の本文}

# review_dispositions: 採否判断（covered / rejected 等）の記録。optional soft-contract（ADR-0124）
# 欠落時に後続工程は draft を拒否しない（後方互換）。covered 項目だけで Issue/PR を作成しない方針を維持する
# 1 エントリ = 単一 source_ru + 単一 source_item（重複禁止）
# evidence.checked_at_commit は req-define 生成時 null（G08 git 禁止）。case-open が default branch 最新化後に再確認し確認 commit SHA を記録する
review_dispositions:
  - id: RD-001                 # RD-NNN 形式の識別子
    source_ru: {RU-ID}         # optional: 単一の元 RU-ID（RU 入力でない場合は省略可）
    source_item: {item-id}     # 単一の元 item 識別子（複数指定不可）
    disposition: covered       # covered / partially_covered / rejected / not_applicable（必要に応じて superseded / stale_target）
    reason_code: {reason-code} # 判断理由のコード（例: already_satisfied、out_of_scope、superseded_by）
    reason: |                  # 人間可読の判断理由本文
      {判断理由の本文}
    evidence:                  # 根拠
      path: {file-path}        # 根拠ファイルパス（該当なし時は null）
      section: {section}       # 根拠セクション（該当なし時は null）
      checked_at_commit: null  # req-define 生成時は null。case-open が確認 commit SHA を記録する
    related_removed_items: []  # 本判断により除外された関連項目の識別子リスト（該当なし時は空リスト）

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false            # 単一 Issue で完結する場合は false
  decomposition: # optional: scale large 時の分解参考情報
  wave_hints: []                # optional: 技術的依存に基づく Wave 構成の参考
```

# summary

<!-- 【任意】 人間可読サマリー。
後続工程の原本としては扱われない。
 処理の原本は上記 # draft-data YAML ブロックである。
 検討経緯や採用しない方針は処理対象として残さない。 -->

{合意内容の人間可読補足。検討経緯、不採用方針は含めない}


