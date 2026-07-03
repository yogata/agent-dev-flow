---
draft_type: req-define
topic_slug: spec-vocab-structure-fix
status: saved
spec_actions_consumed: true
created_at: "2026-07-03"
source_rus:
  - RU-0001
  - RU-0003
  - RU-0010
  - RU-0012
---

# draft-data

work_type: docs_chore

summary: >-
  SPEC 文書の語彙・構造是正を一括実施する。
  link mode 廃止旧語彙の分類基準策定、REQ-0143-004 適用対象の明確化、
  document-model.md intra-file 重複の解消、inspect-read-contracts.md の
  specs/README.md index 登録と更新手順の明文化により、文書整合性を回復する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      link mode 廃止旧語彙（変換プロンプト/generation-flow/transform 等）を含む箇所
     （local-generation.md, ADR-0126/0131 等、IR-057 検出 20 件）を特定し、
      歴史経緯（廃止機能の文脈記述として免除）か現行機能の記述（修正対象）かを
      分類する基準を策定すること。
      分類結果に基づき、歴史経緯の場合は文脈明示（廃止機能の旧語彙である注記）
      または baseline 免除、現行の場合は旧語彙を現行語彙に置換すること。
  - id: AG-002
    content: >-
      REQ-0143-004「command SPEC と command 定義ファイルの Step 番号構成は一致すること」の
      適用対象を明確化し、Step 番号を持たない command SPEC
      （inspect-skills.md, inspect-promote.md 等）の取り扱いを文書化すること。
      併せて、REQ-0143-004 に対する IR-044 warning 検出が正当か誤検出かを確認し、
      適切に解消すること。
  - id: AG-003
    content: >-
      document-model.md 内の intra-file 重複（文書間投影規則セクションと
      用語セクションの同一内容再掲）を解消すること。
      「文書間投影規則」セクションを正本とし、
      「用語」セクションの重複部分は相互参照に切り替えること。
  - id: AG-004
    content: >-
      specs/README.md の command SPEC 一覧表に inspect-read-contracts.md を登録すること。
      新規 SPEC 追加時（spec-save 完了後）に specs/README.md の該当一覧表へ
      当該 SPEC を登録する手順を明文化すること（REQ-0154-001/003 準拠）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0144.md
    source_items:
      - AG-001
    content: |
      | REQ-0144-023 | link mode 廃止旧語彙（変換プロンプト/generation-flow/transform 等）を含む箇所を特定し、歴史経緯（免除対象）か現行機能の記述（修正対象）か分類基準を策定すること。歴史経緯の場合は文脈明示または baseline 免除、現行の場合は旧語彙を現行語彙に置換すること。IR-057 検出結果を当該基準で処理すること |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0143.md
    source_items:
      - AG-002
    content: |
      | REQ-0143-004 | command SPEC（docs/specs/commands/*.md）と command 定義ファイル（src/opencode/commands/agentdev/*.md）の Step 番号構成は一致すること。Step 番号を持たない command SPEC は適用対象外とし、その旨を SPEC に文書化すること。先頭 Step 扱い、採番開始位置の詳細は SPEC（docs/specs/authoring/command-file-format.md）に配置すること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0154.md
    source_items:
      - AG-004
    content: |
      | REQ-0154-004 | 新規 SPEC 追加時（spec-save 完了後）に docs/specs/README.md の該当一覧表へ当該 SPEC を登録すること。登録漏れを docs-check で検出する仕組みを整合させること（REQ-0154-003 準拠） |
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/document-model.md
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "（文書間投影規則セクション正本化、用語セクション相互参照化。正確な見出し行は spec-save で確定）"
    source_items:
      - AG-003
    content: >-
      文書間投影規則セクションを正本とし、用語セクション末尾の
      「原本, 配置先」重複定義を相互参照に切り替える。
      用語セクションは簡潔な用語定義のみを残し、
      詳細は文書間投影規則セクションへ誘導する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/README.md
    target_spec:
      operation: update
      domain: foundations
      slug: specs-readme
    target_area: "（command SPEC 一覧表。正確な見出し行は spec-save で確定）"
    source_items:
      - AG-004
    content: >-
      inspect-read-contracts.md を command SPEC 一覧表に登録する。
      status: draft、対応 command: /repo/docs-check 参照、
      その他の列構造は既存エントリに準拠する。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-0144
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      saved_req: REQ-0144
      saved_id: REQ-0144-024
      operation: append
      note: "draft proposed REQ-0144-023 but ID collision detected (023 exists for docs migration); alloc-composite-id.ts allocated REQ-0144-024"
  - ou_id: OU-002
    source_ru: RU-0003
    target_req: REQ-0143
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      saved_req: REQ-0143
      saved_id: REQ-0143-004
      operation: update
      note: "REQ-0143-004 に「Step 番号を持たない command SPEC は適用対象外」clause 追加"
  - ou_id: OU-003
    source_ru: RU-0012
    target_req: REQ-0154
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req: REQ-0154
      saved_id: REQ-0154-004
      operation: append
      note: "新規 SPEC 追加時の specs/README.md index 登録要件"
  - ou_id: OU-004
    source_ru: RU-0010
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result:
      saved_spec: docs/specs/foundations/document-model.md
      operation: spec-update
      target_area: "用語: 原本、配置先"
      note: "intra-file 重複解消: 用語セクションを文書間投影規則セクションへの相互参照に置換"
  - ou_id: OU-005
    source_ru: RU-0012
    target_spec:
      operation: update
      domain: foundations
      slug: specs-readme
    operation: spec-update
    scale: standard
    depends_on:
      - OU-003
    recommended_order: 1
    issue_policy: single
    result:
      saved_spec: null
      operation: spec-update
      status: skipped_stale
      note: "ACT-SPEC-002 skipped: inspect-read-contracts.md was renamed to inspect-doc-inputs.md (commit 090ec31d, PR #1362). inspect-doc-inputs.md is already registered in specs/README.md command SPEC list. Original concern (RU-0012) is moot."

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      link mode 廃止旧語彙の分類基準が策定されていることを確認する。
      IR-057 検出 20 件が当該基準で処理（免除または置換）されていることを確認する。
      docs-check 実行で当該旧語彙に起因する安定 NG が解消されていることを確認する。
    pass_criteria: >-
      分類基準策定済み。20 件すべて処理済み（免除 or 置換）。
      IR-057 安定 NG 0 件。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002
    verification: >-
      REQ-0143-004 の適用対象が明確化されていることを確認する。
      Step 番号を持たない command SPEC の取り扱いが文書化されていることを確認する。
      REQ-0143-004 に対する IR-044 warning が解消されていることを確認する。
    pass_criteria: >-
      適用対象明確化済み。Step 番号不要 SPEC の取り扱い文書化済み。
      IR-044 warning 解消済み。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-003
    verification: >-
      document-model.md 内の intra-file 重複が解消されていることを確認する。
      文書間投影規則セクションが正本であり、用語セクションが相互参照になっていることを確認する。
    pass_criteria: >-
      重複解消済み。同一内容の再掲が 0 箇所。
      用語セクションが相互参照に切り替わっている。
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: AG-004
    verification: >-
      specs/README.md の command SPEC 一覧表に inspect-read-contracts.md が登録されていることを確認する。
      新規 SPEC 追加時の index 更新手順が明文化されていることを確認する。
    pass_criteria: >-
      inspect-read-contracts.md 登録済み。
      index 更新手順明文化済み。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false

# summary

## 対象 RU

- RU-0001: link mode 廃止旧語彙残存（IR-057 検出 20 件）
- RU-0003: REQ-0143-004 Step 番号要件の適用対象不明確
- RU-0010: document-model.md intra-file 重複
- RU-0012: inspect-read-contracts.md index 未登録

## 主な変更内容

- REQ-0144 APPEND（REQ-0144-023: link mode 旧語彙分類基準）
- REQ-0143 UPDATE（REQ-0143-004: 適用対象明確化）
- REQ-0154 APPEND（REQ-0154-004: 新規 SPEC index 更新手順）
- document-model.md SPEC update（重複解消）
- specs/README.md SPEC update（inspect-read-contracts.md 登録）

## ADR 判断

ADR 不要（既存 REQ/ SPEC への是正、新規アーキテクチャ判断なし）。

## 留意事項

- AG-001 の旧語彙分類（歴史経緯 vs 現行）は実装修復作業で個別判定。req-define では基準策定のみ
- AG-002 の inspect-skills.md/inspect-promote.md の配置（docs/specs/commands/ 配下か）は実装修復作業で確認
- ACT-SPEC-001/002 の target_area 正確な見出し行は spec-save で確定
- src/opencode-local/ 配下の旧語彙は変更影響候補として記録、実装修復作業で対応
