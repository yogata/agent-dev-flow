---
draft_type: req_draft
topic_slug: case-auto-input-resolution
status: saved
created_at: 2026-07-17T00:00:00+09:00
---

<!-- req_draft: case-auto 引数なし時の全draft読み込み不具合対処 -->

# draft-data

```yaml
work_type: feature
scale: standard

summary: |
  case-auto の引数なし時の入力解決動作を「`.agentdev/drafts/req-draft-*.md` 全件処理」をデフォルトとし、引数あり時は引数に従う方式へ変更する。セッション内要件docの暗黙判断は廃止し、明示キーワード（例: `req-define セッション`、`req-define 上記の内容`）指定時のみ参照する。従来の3段階優先順位（明示パス→draft検出→セッション内要件doc）による解釈困難さと「不明時は停止」の頻発を解消する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-auto の引数なし時のデフォルト動作を「`.agentdev/drafts/req-draft-*.md` 全件処理」とする。従来の「明示パス→draft検出→セッション内要件doc」3段階優先順位は廃止する。draft が0件の場合のみ停止し req-define 実行またはパス指定を求める。
  - id: AG-002
    content: |
      引数あり時（明示パス指定）は従来通り当該draftのみを処理対象とする。ファイルが存在しない場合は停止しエラーを報告する。
  - id: AG-003
    content: |
      セッション内要件docの暗黙判断は廃止する。セッション内要件docを参照する場合は、明示キーワード（例: `req-define セッション`、`req-define 上記の内容`）による指定を必須とする。暗黙にセッションコンテキストから要件docを推論してはならない。
  - id: AG-004
    content: |
      複数draft存在時はユーザー確認プロンプトを入れず、無確認で全件処理する。「不明時は停止」は引数なし時の draft 0件の場合のみ適用する。
  - id: AG-005
    content: |
      複数draft読み込み時の順序制御（`recommended_order` / `depends_on`）は現行仕様（REQ-0148, ADR-0129）を維持する。各draftの `operation_units` から全OUの処理順序を決定するロジックは変更しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      REQ-0114 の以下の要件行および frontmatter, 適用範囲を更新する。
      
      frontmatter: updated を "2026-07-17" へ更新。
      
      REQ-0114-002（変更後）:
      入力解決は引数種別に応じて以下を処理対象とすること: (1) 引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト） (2) 明示パス指定時は当該draft (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）時はセッション内要件doc（暗黙判断は行わない） (4) 特定不可時は停止
      
      REQ-0114-004（変更後）:
      引数なし時、draft が1件以上存在する場合は全件（1件含む）を処理対象とすること
      
      REQ-0114-069（変更後）:
      数値引数または Issue URL が入力された場合、要件doc入力モード（REQ-0114-002）より優先して処理すること
      （従来の「既存の入力解決（REQ-0114-002 の明示パス / draft検出 / セッション内要件doc）」という内訳表記は REQ-0114-002 への参照に集約）
      
      適用範囲（変更後）:
      「入力解決（3段階優先順位）」→「入力解決（引数種別分岐、全draft処理デフォルト）」

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "## 入力"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## 入力
      
      - Issue番号（数値）または Issue URL（既存Issue から case-run → case-close を自走する場合）
      - 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照（暗黙判断廃止、構造化 `draft-data` 形式: REQ-0138, ADR-0124））
      
      あわせて frontmatter の updated を 2026-07-17 へ更新する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "## 現在の動作"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      「## 現在の動作」セクションの Step 1「要件doc入力モード」行を以下の内容に更新する。他の Step およびサブセクションは現状維持。
      
      変更前:
        - 要件doc入力モード（明示パス→draft検出（複数件含む全件処理）→セッション内要件docの順で入力特定）
      
      変更後:
        - 要件doc入力モード（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定時は当該draft / セッション指定キーワード時はセッション内要件doc参照、暗黙判断は行わない）

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_spec: docs/specs/commands/case-auto.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-0114 の REQ-0114-002, REQ-0114-004 を読み、引数なし時のデフォルト動作が「`.agentdev/drafts/req-draft-*.md` 全件処理」と記述されていることを確認する。
    pass_criteria: |
      REQ-0114-002 に「引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）」が明記され、REQ-0114-004 に「引数なし時、draft が1件以上存在する場合は全件（1件含む）を処理対象」と明記されていること。
    on_failure: |
      fix-and-reverify（文書記述の不整合は実装修正で解消可能）
  - id: TS-002
    target_item: AG-003
    verification: |
      REQ-0114-002 および SPEC `docs/specs/commands/case-auto.md` の「入力」「現在の動作 Step 1」を読み、セッション内要件docの暗黙判断が廃止され、明示キーワード指定時のみ参照することが記述されていることを確認する。
    pass_criteria: |
      「暗黙判断は行わない」が明記され、キーワード例（`req-define セッション`、`req-define 上記の内容`）が含まれること。
    on_failure: |
      fix-and-reverify（文書記述の不整合は実装修正で解消可能）
  - id: TS-003
    target_item: AG-004
    verification: |
      REQ-0114-002 と command `src/opencode/commands/agentdev/case-auto.md` Step 1 を読み、複数draft存在時の確認プロンプトが要求されていないことを確認する。
    pass_criteria: |
      「不明時は停止」が引数なし時の draft 0件の場合のみに適用され、複数draft存在時の確認プロンプト記述がないこと。
    on_failure: |
      fix-and-reverify（不要なフェールセーフ記述は実装修正で削除可能）
  - id: TS-004
    target_item: AG-005
    verification: |
      REQ-0114 の順序制御関連要件（REQ-0114-053, REQ-0114-064 等）を読み、`recommended_order` / `depends_on` の扱いが現行（REQ-0148, ADR-0129 準拠）のままであることを確認する。
    pass_criteria: |
      順序制御ロジックの変更がなく、REQ-0148 / ADR-0129 への参照が維持されていること。
    on_failure: |
      fix-and-reverify（意図しない順序制御変更は実装修正で復元可能）

case_open_hints:
  epic_needed: false
```

# summary

case-auto の引数なし実行時、従来は「明示パス→draft検出→セッション内要件doc」の3段階優先順位で入力を解決し、順序解決不能時に「不明時は停止」で停止する挙動が頻発していた。本要件はこれを「引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）」へ単純化し、引数あり時は引数に従う方式へ変更する。

あわせてセッション内要件docの暗黙判断を廃止し、明示キーワード（例: `req-define セッション`、`req-define 上記の内容`）指定時のみ参照する。これによりエージェントの解釈負荷を下げ、停止頻度を減らす。

command 定義（`src/opencode/commands/agentdev/case-auto.md`）の「入力」「Step 1」の同期更新は case-run 実装で行う（本ドラフトの artifact_actions には REQ/SPEC のみを含む）。
