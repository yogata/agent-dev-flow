---
draft_type: req_draft
topic_slug: docs-writing-style-compliance
status: saved
created_at: 2026-06-21T00:00:00+09:00
source_rus: []
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
work_type: maintenance

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: null

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  docs/**（retired REQ を除く）・ AGENTS.md ・ src/opencode/{commands,skills} の自然言語記述について、
  現行の文書執筆スタイルガイドライン（docs/specs/writing-style.md）の全査読観点でフル査読を実施し、
  準拠しない記述を修正することを REQ-0140 へ APPEND する。個別用語の正誤表（「正本→原本」等）は
  REQ-0140 に埋め込まず agentdev-doc-writing スキルの参照資料（references/rewrite-patterns.md 等）で
  管理する。あわせて REQ-0140 自身と docs/specs/writing-style.md に残留する「正本」を、REQ-0140-017 の
  「原本」使用と整合させるよう「原本」に修正する。修正作業本体は case-open → case-run フローで実施し、
  カテゴリ別（REQ 群 / ADR 群 / SPEC 群 / guides 群 / README・DOC-MAP / AGENTS.md / src/opencode commands・skills）
  に分割することを case-open 判断材料として提示する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する（REQ-0138-013）
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない（REQ-0138-008）
agreed_items:
  - id: AG-001
    content: |
      docs/**（retired REQ すなわち docs/requirements/retired/REQ-*.md を除く）・ AGENTS.md ・
      src/opencode/{commands,skills} の自然言語記述について、現行の文書執筆スタイルガイドライン
      （docs/specs/writing-style.md）の全査読観点（文書種別責務・要件行の書き方・要件性・粒度・移送判断・
      AI-slop 検出基準・英語混じり表記）でフル査読を実施し、準拠しない記述を修正すること。
      修正作業は case-open → case-run フローで実施し、作業単位の分割は case-open が決定する
      （G13: req-define は Issue 階層を決定しない）。retired REQ は履歴参照専用として査読・修正対象外とする。
  - id: AG-002
    content: |
      個別用語の正誤表（「正本→原本」のような A→B 形式の個別変換表）は REQ-0140 の要件行に埋め込まず、
      agentdev-doc-writing スキルの参照資料（references/rewrite-patterns.md 等の正誤表・検出ルール）で
      管理すること。これは writing-style.md の「硬直的固定記述の回避」原則（件数・ファイル名列挙を
      要件に埋め込まず、構造要件のみ記述）と整合する。REQ-0140 は状態要件・外部契約に留めること。
  - id: AG-003
    content: |
      REQ-0140 自身（目的・REQ-0140-023）と docs/specs/writing-style.md（line 10「REQ-0140（文書品質ゲート）
      の正本仕様」）に残留する「正本」という語は、REQ-0140-017「src/opencode/を原本・.opencode/を配置先として
      扱う」が既に「原本」を使用していることと整合するよう、「原本」に修正すること。これは新規の正誤表作成
      ではなく、REQ-0140 と原本 SPEC 自身の用語不整合解消である。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合（REQ-0138-009）
# 1 action = 1 artifact × 1 editing concern（REQ-ID 単位でも箇条書き1行単位でもない・REQ-0138-017）
# 同一関心の複数 agreed items は単一 action に複数段落の content としてまとめる
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0140
    target_area: "要件テーブル（REQ-0140-026 として追加）"
    source_items: [AG-001]
    content: |
      REQ-0140-026: docs/**（docs/requirements/retired/REQ-*.md を除く）・ AGENTS.md ・
      src/opencode/{commands,skills} の自然言語記述は、現行の文書執筆スタイルガイドライン
      （docs/specs/writing-style.md）の全査読観点に準拠して修正すること。個別用語の正誤表は
      agentdev-doc-writing スキルの参照資料で管理し、本要件行に埋め込まないこと。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0140
    target_area: "目的（line 10）・ REQ-0140-023（line 38）"
    source_items: [AG-003]
    content: |
      目的中「正本仕様は `docs/specs/writing-style.md` とし」を「原本仕様は `docs/specs/writing-style.md` とし」に修正。
      REQ-0140-023「agentdev-doc-writing の正本仕様は docs/specs/writing-style.md とし」を
      「agentdev-doc-writing の原本仕様は docs/specs/writing-style.md とし」に修正。
      いずれも REQ-0140-017「src/opencode/を原本・.opencode/を配置先として扱う」の用語使用との整合を目的とする。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/writing-style.md
    target_area: "line 10（リード文）"
    source_items: [AG-003]
    content: |
      line 10「docs/ 配下の文書（REQ/ADR/SPEC/guides/DOC-MAP/README）および AGENTS.md の日本語執筆における判断指針。
      REQ-0140（文書品質ゲート）の正本仕様であり、agentdev-doc-writing スキルの参照先である。」中の
      「正本仕様」を「原本仕様」に修正。REQ-0140-017「src/opencode/を原本・.opencode/を配置先として扱う」の
      用語使用と整合させる。

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない（REQ-0138-014）
conflict_resolutions:
  - id: CR-001
    conflict: |
      当初、REQ-0140 への APPEND 案に「『正本』という表現を使用せず『原本』を使用すること」という
      個別用語指定（正誤表）を含めていた。これは writing-style.md の「硬直的固定記述の回避」原則と
      REQ/SPEC 責務分離に反するか？
    resolution: |
      反する。個別用語の正誤表は REQ-0140 に埋め込まず、agentdev-doc-writing スキルの参照資料
      （references/rewrite-patterns.md 等）で管理する。REQ-0140-026 は「全査読観点に準拠して修正すること」
      という状態要件のみを記述し、個別用語を指定しない。これは writing-style.md の「硬直的固定記述の回避」
      原則（件数・ファイル名列挙を要件に埋め込まず、構造要件のみ記述）に整合する。
      なお、REQ-0140 自身と writing-style.md に残留する「正本」は、REQ-0140-017 の「原本」使用との
      用語不整合解消として別途修正する（AG-003, ACT-REQ-002, ACT-SPEC-001）。

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-0140
    target_spec: null
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req: REQ-0140
      operation: append
      new_lines: [REQ-0140-026]
      saved_at: 2026-06-21
  - ou_id: OU-002
    source_ru: null
    target_req: REQ-0140
    target_spec: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: REQ-0140
      operation: update
      modified_sections: [purpose, REQ-0140-023]
      change_summary: 「正本」→「原本」用語統一（REQ-0140-017 と整合）
      saved_at: 2026-06-21
  - ou_id: OU-003
    source_ru: null
    target_req: null
    target_spec: docs/specs/writing-style.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition:
    - category: REQ 群
      target_globs: [docs/requirements/REQ-*.md]
      excludes: [docs/requirements/retired/]
      concerns: [文書種別責務, 要件行の書き方, 要件性, 粒度, AI-slop 検出, 英語混じり表記]
    - category: ADR 群
      target_globs: [docs/adr/ADR-*.md]
      excludes: []
      concerns: [ADR 本文品質, AI-slop 検出, 英語混じり表記]
    - category: SPEC 群
      target_globs: [docs/specs/*.md]
      excludes: []
      concerns: [SPEC 本文品質, AI-slop 検出, 英語混じり表記, writing-style.md 内「正本」残留修正]
    - category: guides 群
      target_globs: [docs/guides/*.md]
      excludes: []
      concerns: [guide 責務（ナビゲーション層）, AI-slop 検出, 英語混じり表記]
    - category: README・DOC-MAP
      target_globs: [docs/README.md, docs/DOC-MAP.md, "docs/specs/README.md", "docs/guides/README.md"]
      excludes: []
      concerns: [README 責務（identity・入口表）, AI-slop 検出, 英語混じり表記]
    - category: AGENTS.md
      target_globs: [AGENTS.md]
      excludes: []
      concerns: [AI-slop 検出, 英語混じり表記]
    - category: src/opencode commands・skills 自然言語
      target_globs: [src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/**/*.md]
      excludes: []
      concerns: [AI-slop 検出, 英語混じり表記, rewrite-patterns.md 等の正誤表充実]
  wave_hints:
    - wave: 1
      contents: [REQ-0140 APPEND/UPDATE, writing-style.md UPDATE]
      rationale: 基本要件と原本 SPEC の整備。後続 Wave の査読基盤を確立するため最初に実施。
    - wave: 2
      contents: [REQ 群, ADR 群, SPEC 群, guides 群, README・DOC-MAP, AGENTS.md]
      rationale: docs/** 配下のフル査読・修正。Wave 1 で確立した原本 SPEC を適用。
    - wave: 3
      contents: [src/opencode commands・skills 自然言語]
      rationale: 配布資産（commands/skills）のフル査読・修正。docs/** 整備後に実施することで、原本と配布資産の整合を確保。

# draft-meta: SPLIT 予兆計測結果（REQ-0136-011）
draft_meta:
  split_forecast:
    measurement_target: REQ-0140
    measurement_timing: before-append
    metrics:
      requirement_line_count: 25
      interest_classification_count: 1
      artifact_type_count: 3
    signals:
      line_count_signal: 0
      interest_classification_signal: 0
      artifact_type_signal: 1
      spec_separation_violation_signal: 0
      total: 1
    recommended_action: no-action
    thresholds_ref: docs/specs/req-health-metrics.md
    note: |
      APPEND 後の要件行数は 27（+2）で 0-50 の健全範囲内。関心分類は「文書品質ゲート」単一。
      artifact 種別は skill + SPEC + command 参照の 3 種。SPLIT シグナル合計 1 で no-action（APPEND 許可）。
```

# summary

## 合意内容の人間可読補足

本ドラフトは、現行の docs/** ・ AGENTS.md ・ src/opencode/{commands,skills} 自然言語記述を、docs/specs/writing-style.md の全査読観点でフル査読し、準拠するよう修正することを要件化するものある。

主な合意事項:
1. **フル査読の義務化**（REQ-0140-026 として APPEND）: 全査読観点（文書種別責務・要件行の書き方・要件性・粒度・移送判断・AI-slop 検出・英語混じり表記）を適用。retired REQ は対象外。
2. **個別用語の正誤表は REQ に書かない**: 「正本→原本」のような A→B 形式の変換表は、agentdev-doc-writing スキルの参照資料（references/rewrite-patterns.md 等）で管理する。REQ-0140 は状態要件・外部契約に留める。
3. **REQ-0140 と writing-style.md 自身の用語整合**: REQ-0140-017 が既に「原本」を使用しているため、REQ-0140 目的・REQ-0140-023・writing-style.md line 10 に残留する「正本」を「原本」に修正する。

## 実施形態

修正作業本体は case-open → case-run フローで実施する。カテゴリ別バッチ（REQ 群 / ADR 群 / SPEC 群 / guides 群 / README・DOC-MAP / AGENTS.md / src/opencode commands・skills）への分割は case-open 判断材料として `case_open_hints` に提示する。技術依存に基づき Wave 構成（Wave 1: 原本整備 → Wave 2: docs/** 査読 → Wave 3: src/opencode 配布資産査読）も参考情報として記録した。

## 検討経緯（不採用方針）

- 当初「REQ-0140-026: 『正本』を使用せず『原本』を使用すること」という個別用語指定を検討したが、ユーザー指摘により writing-style.md の「硬直的固定記述の回避」原則に反することが判明したため不採用。個別用語は docs-writing スキル参照資料で管理する（CR-001 に記録）。
- docs_chore ではなく maintenance に分類した。理由は、要件行の追加（REQ-0140-026）を含み、REQ 修正・SPEC 修正にまたがるため、単なる文書整理（docs_chore）よりも維持管理活動（maintenance）に近い。
