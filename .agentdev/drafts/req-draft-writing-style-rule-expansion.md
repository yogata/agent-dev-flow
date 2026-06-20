---
draft_type: req_draft
topic_slug: writing-style-rule-expansion
status: draft
created_at: 2026-06-20T00:00:00+09:00
source_rus: [RU-0001]
spec_actions_consumed: true
spec_consumed_at: 2026-06-20T00:00:00+09:00
---

# draft-data

```yaml
work_type: maintenance

summary: |
  docs/specs/writing-style.md（REQ-0140 正本仕様）に層Bの4用語（self-hosting→本体リポジトリ、junction→ジャンクション、session-sourced→セッション由来、top-level→最上位）の推奨訳を追加し、識別子と散文普通名詞の区別ルールを SPEC 化する。IR-045（integrity-rule-catalog.md）の検出対象語リストを拡張し、req-impact-map.md に欠落する REQ-0140 行を追加する。加えて、層A（既存推奨訳の適用漏れ）・層B（新規推奨訳の適用）の違反を現行文書に修正し、agentdev-doc-writing スキルの運用ビューを正本へ追随させる。新規 REQ 要件は追加せず、既存 REQ-0101-061・REQ-0140-003/007/023 で原則を充足する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      writing-style.md に層Bの4用語の推奨訳を追加する:
      - self-hosting（普通名詞）→「本体リポジトリ」。Type ID `` `self-hosting` ``（バッククォート内・コード値）は識別子として残す。既存「セルフホスティング」も統一。
      - junction →「ジャンクション」。Windows NTFS ディレクトリジャンクションの定訳。
      - session-sourced →「セッション由来」。チャット内合意起点の RU 区分。REQ-0105 文脈に合致。
      - top-level →「最上位」。既存「トップレベル」も統一。

  - id: AG-002
    content: |
      writing-style.md に識別子（Type ID・enum値・バッククォート内コード値）と散文普通名詞の区別ルールを明記する。識別子形は英語のまま許容し、日本語散文中の普通名詞使用は推奨訳に置換する。runtime-package-boundary.md が実装している良いパターン（本文は日本語、表ID列は `self-hosting`）を参照例とする。

  - id: AG-003
    content: |
      IR-045（docs/specs/integrity-rule-catalog.md L913〜）の description（L918）および detection_method（L921）の検出対象語リストに、層Bの4用語（self-hosting/junction/session-sourced/top-level）を追加する。現在の対象語リスト: domain state/runtime command/command topology/provenance marker/upstream handoff/fixture detail（複合技術語）、fixture/variant/provider/baseline（専門カタカナ語）。

  - id: AG-004
    content: |
      docs/specs/req-impact-map.md の影響マトリックス（L7〜）に REQ-0140 行を追加する。現在 REQ-0101〜REQ-0133 まで記載されており、REQ-0140 → IR-045 の対応が欠落している。REQ-0134〜REQ-0139 も欠落している場合は併せて追加する。

  - id: AG-005
    content: |
      層A（既存推奨訳の適用漏れ）を現行文書に修正する。対象用語と既存訳: domain state→「ドメイン状態」(writing-style.md L87)、variant→「種別」(L91)、baseline→「基準」(L91)、runtime（command/workspace）→「実行時」(L87)。主な対象（代表例・実装時に全件走査）: docs/requirements/README.md:24,27,28,31 / docs/requirements/mapping-table.md:40,45,48 / docs/adr/README.md:143 / docs/specs/integrity-rule-catalog.md:273,278,281,290,426,430,758 / docs/adr/ADR-0102.md:3,9（見出し）/ docs/adr/ADR-0104.md:3,9（見出し）/ docs/specs/artifact-contracts.md:161,168,224 / docs/requirements/REQ-0125.md:10 / docs/requirements/README.md:11,20。

  - id: AG-006
    content: |
      層B（新規推奨訳）を現行文書に適用する。主な対象（代表例・実装時に全件走査）:
      - self-hosting（普通名詞）→「本体リポジトリ」: docs/requirements/REQ-0134.md:17,25 / docs/requirements/REQ-0103.md:51,52,58,60 / docs/guides/consumer-project-setup.md:9,67-69,122 / docs/requirements/REQ-0108.md / docs/specs/runtime-package-boundary.md（Type ID `self-hosting` は残す）
      - 既存「セルフホスティング」→「本体リポジトリ」: docs/specs/runtime-package-boundary.md:7,29,135 / docs/guides/consumer-project-setup.md:16 等
      - junction→「ジャンクション」: docs/guides/consumer-project-setup.md:9,19,28,37,39,49,90,93,109,123,137,169 / docs/specs/system.md:84 / docs/specs/artifact-contracts.md:224 / docs/guides/glossary.md:77 / docs/requirements/REQ-0110.md:10,23 / docs/specs/integrity-rule-catalog.md:346
      - session-sourced→「セッション由来」: docs/requirements/REQ-0105.md:10,21-26,34 / docs/requirements/README.md:13 / docs/guides/glossary.md:35 / docs/guides/intake-learning-backlog-flow.md:105,107 / docs/guides/artifacts-and-state.md:120,124
      - top-level/トップレベル→「最上位」: docs/adr/ADR-0101.md:36 / docs/specs/integrity-rule-catalog.md:573,578 / docs/specs/rule-ownership.md:29 / docs/requirements/REQ-0138.md:24

  - id: AG-007
    content: |
      agentdev-doc-writing スキルの運用ビュー（src/opencode/skills/agentdev-doc-writing/references/rewrite-patterns.md）を writing-style.md（正本）更新後に追随させる（REQ-0140-007, REQ-0140-023）。作業後に sync-self-opencode.ps1 を実行し .opencode/ への投影を最新化する。廃止済み agentdev-no-ai-slop-writing の壊れた junction が .opencode/skills/ に残留しているため、同期後にクリーンアップする。

  - id: AG-008
    content: |
      docs/requirements/retired/ および docs/adr/retired/ 配下の違反は修正対象外とする。IR-045 が docs/**/retired/** を検出対象外（L921）に明示しており、履歴参照用であるため。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/writing-style.md
    source_items: [AG-001, AG-002]
    content: |
      「複合技術語の訳し方指針（文意に基づく）」セクション（L85〜87）または「専門カタカナ語の日本語訳（文意に基づく）」セクション（L89〜91）に、層Bの4用語の推奨訳を追加:
      - self-hosting（普通名詞）→「本体リポジトリ」
      - junction→「ジャンクション」
      - session-sourced→「セッション由来」
      - top-level→「最上位」

      識別子（Type ID・enum値・バッククォート内コード値）と散文普通名詞の区別ルールを明記。識別子形は英語のまま許容し、日本語散文中の普通名詞使用は推奨訳に置換する運用を SPEC 化。runtime-package-boundary.md の良いパターン（本文は日本語、表ID列は `self-hosting`）を参照例として記載。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity-rule-catalog.md
    source_items: [AG-003, AG-005]
    content: |
      IR-045（L913〜）の description（L918）および detection_method（L921）の検出対象語リストに、層Bの4用語（self-hosting/junction/session-sourced/top-level）を追加。

      併せて、integrity-rule-catalog.md 自体に存在する層A違反（variant L273,278,281,290 / baseline L426,430,758）を修正。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/req-impact-map.md
    source_items: [AG-004]
    content: |
      影響マトリックス（L7〜）に REQ-0140 行を追加。REQ-0140 → IR-045 の対応を記載。REQ-0134〜REQ-0139 も欠落している場合は併せて追加。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec: docs/specs/writing-style.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0001
    target_spec: docs/specs/integrity-rule-catalog.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0001
    target_spec: docs/specs/req-impact-map.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
  decomposition: |
    Wave 1（SPEC 更新・spec-save 対象）: writing-style.md・integrity-rule-catalog.md・req-impact-map.md の推奨訳追加・検出対象拡張・影響マップ追補。OU-001/002/003 に対応。
    Wave 2（文書修正・Wave 1 依存）: 層A・層B 違反を現行文書（REQ/ADR/SPEC/guides/README）に適用。実装時に全件走査。AG-005・AG-006 に対応。SPEC 更新で定義したルールに従って適用するため Wave 1 完了が前提。
    Wave 3（スキル同期・クリーンアップ・Wave 2 依存）: agentdev-doc-writing/references/rewrite-patterns.md 追随、sync-self-opencode.ps1 実行、壊れた junction クリーンアップ。AG-007 に対応。
  wave_hints:
    - "Wave 1: SPEC 更新 → spec-save → 依存: なし"
    - "Wave 2: 層A/層B 文書修正 → 依存: Wave 1 完了後（SPEC ルール定義後に適用）"
    - "Wave 3: スキル同期・クリーンアップ → 依存: Wave 2 完了後"

split_forecast:
  measured_target: draft
  metrics:
    requirement_rows: 0
    concern_categories: 0
    artifact_types: 1
  signals:
    requirement_rows: 0
    concern_categories: 0
    artifact_types: 0
  total_signal: 0
  recommended_action: no_split_needed
  thresholds_ref: docs/specs/req-health-metrics.md
  note: |
    本ドラフトは REQ 要件行を含まない（maintenance・SPEC 更新+文書修正のみ）。SPLIT 予兆計測の対象は REQ 要件行であるため、シグナル 0。タスクは writing-style ルール拡充・適用の単一関心で凝集しており、分割不要。
```

# summary

RU-0001（session-sourced, status: agreed）に基づく maintenance ドラフト。

## 分析経緯

- **REQ照合**: 新規 REQ 不要。既存 REQ-0101-061（日本語表記原則）・REQ-0140-003/007（文書品質ゲート・検出ルール構成）・REQ-0140-023（正本=writing-style.md）で原則を充足。個別用語→訳の対応表は SPEC 領域（REQ-0101-067/068）。
- **定量的データ検証**: 実ファイル列挙で REQ-0101〜REQ-0140（廃止8件除く32件）を確認。AGENTS.md・docs/README.md 記載レンジと一致。乖離なし。
- **ADR判定**: ADR不要。SPEC レベルの変更（推奨訳カタログ・検出対象語拡張・影響マップ追補）であり、アーキテクチャ判断を含まない。
- **分類ゲート**: 層A/層Bの文書修正は全て「反映作業」（既存文書へのルール適用）であり、REQ 要件行ではなく case/Issue 作業として扱う。SPEC 更新内容は artifact_actions（artifact: spec）に分離済み。
- **QG-1**: REQ/SPEC 分離妥当、ADR ゲートクリア、agreed_items 測定可能、artifact_actions 構成妥当。pass。

## Step 9-1 備考（実装詳細の分離）

AG-005・AG-006 に個別ファイル・行番号の修正候補リストが含まれる。これらは agreed_items として artifact_actions の content とは分離されており、合意内容の判読性は確保されている。修正候補リストがドラフト全体の過半を占めるため、case-open 時に完了条件チェックボックスへ要約することを推奨する（用語ごとに1チェックボックス: domain state 適用 / variant 適用 / baseline 適用 / runtime 適用 / self-hosting 適用 / junction 適用 / session-sourced 適用 / top-level 適用）。

## スコープ境界

- **対象外**: 新規 REQ 要件の追加、廃止文書（retired/）の修正、QG-1〜QG-4 主ゲート体系の変更、コード実装の動作変更
- **メモ**: integrity-rule-catalog.md は SPEC 更新対象（IR-45 拡張）であると同時に層A違反の修正対象（variant/baseline の自ファイル内残留）でもあるため、ACT-SPEC-002 で両方を扱う。
