---
draft_type: req_draft
topic_slug: req-define-efficiency-improvement
status: saved
created_at: 2026-06-23T15:30:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  req-define 工程の実行時間短縮のため、Step 5-1（変更影響候補抽出）の
  explore 委譲スコープ絞り込み（F）と、Step 5-4（ADR要否確認ゲート）の
  oracle 相談入出力標準化（G）を導入する。実績 ses_10c29a13 で req-define
  1時間11分中、Step 4-5-1 explore 委譲 24分（34%）と Step 5-4 oracle
  相談+結果分類 21分（30%）を占めた主因を、既存アーキテクチャ（ADR-0112/
  0124/0107）の適用範囲内で改善する。Oracle 相談（bg_53b5b508）の確定事項
  に基づき新規 ADR は作成しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      F: req-define は RU の frontmatter・本文から対象領域キーワードを抽出し、
      glob/grep で関連 REQ/ADR/SPEC を事前特定してから explore 委譲の調査
      スコープを絞り込む。REQ-0102-002 が要求する実ファイル完全列挙は維持
      し、絞り込みは explore 委譲の調査優先対象リストにのみ適用する（ハード
      フィルタではなくヒント）。キーワード抽出・glob/grep 前処理は決定的処理
      として agentdev-req-analysis skill 内に実装する。
  - id: AG-002
    content: |
      G: req-define は oracle 相談の入力を標準化テンプレート（要件候補・
      衝突候補・ADR候補・既存ADRとの関連・親エージェントの判断質問）で構築
      し、oracle 出力を 4ラベル構造（確定/推定/確認事/ブロッカー）で要求する。
      ラベル構造は soft-contract（ADR-0124 準拠）とし、厳格スキーマ検証を
      導入しない。入力テンプレート・出力ラベル定義は agentdev-architecture-
      advisory skill 内に実装する。最終的なラベル分類は親エージェントが保持
      する（oracle はラベル付き助言を返すが分類権限は親）。
  - id: AG-003
    content: |
      F・G ともに新規 ADR 不要。Oracle 相談（bg_53b5b508）の確定事項（高確信度）
      に基づく。F・G は既存 ADR-0112（委譲一般化）、ADR-0124（soft-contract）、
      ADR-0107（責任分界・command thin 原則）の適用範囲内の運用改善であり、
      責務境界・委譲モデル・文書体系を変更しない。
  - id: AG-004
    content: |
      実装配置：F のキーワード抽出・glob/grep 前処理ロジックは agentdev-req-
      analysis skill 内（references）に置く。G の入力テンプレート・出力ラベル
      構造は agentdev-architecture-advisory skill 内に置く。req-define command
      は既存 Step 5-1, 5-4 の参照先追記のみを行い、command thin 原則（ADR-0107）
      を維持する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0102
    source_items: [AG-001, AG-002]
    content: |
      - REQ-0102-072: req-define は RU の frontmatter・本文から対象領域キーワードを抽出し、glob/grep で関連 REQ/ADR/SPEC を事前特定してから explore 委譲の調査スコープを絞り込むこと。ただし REQ-0102-002 が要求する実ファイル完全列挙は維持し、絞り込みは explore 委譲の調査優先対象リストにのみ適用すること（ハードフィルタではなくヒントとして扱う）
      - REQ-0102-073: req-define は oracle 相談の入力を agentdev-architecture-advisory skill が定める標準テンプレートで構築し、oracle 出力を 4 ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）で要求すること。ラベル構造は soft-contract（ADR-0124）とし厳格スキーマ検証を導入しないこと。最終的なラベル分類は親エージェントが行うこと
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: Step 5-1 変更影響候補抽出 + Step 5-4 ADR要否確認ゲート
    source_items: [AG-001, AG-002]
    content: |
      Step 5-1（変更影響候補抽出）に「RU 由来キーワード抽出 + glob/grep 前処理による explore 委譲スコープの絞り込み（REQ-0102-072）」を追記。絞り込みは explore 委譲の調査優先対象リストのみに適用し、実ファイル列挙（REQ-0102-002）の完全性は維持する。
      Step 5-4（ADR要否確認ゲート）に「oracle 入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-0102-073）」を追記。ラベル構造は soft-contract（ADR-0124）とし、分類権限は親が保持する。

conflict_resolutions:
  - id: CR-001
    conflict: F・G が新規アーキテクチャ判断（ADR 対象）か、既存 ADR 適用範囲内の運用改善か
    resolution: |
      Oracle 相談（bg_53b5b508）の確定事項（高確信度）に基づき新規 ADR 不要。
      F は ADR-0112 §5（委譲時最小契約）で委譲 inputs のスコープ窄小化、
      G は ADR-0112 §5 で委譲 I/O 標準化、いずれも ADR-0124 soft-contract
      および ADR-0107 command thin 原則の適用範囲内。責務境界・委譲モデル・
      文書体系を変更しない。
  - id: CR-002
    conflict: F のキーワード絞り込みが関連 REQ/ADR の見落としを生むリスク
    resolution: |
      絞り込みはヒント（優先調査対象リスト）でありハードフィルタではない。
      explore agent はスコープ外でも関連を発見した場合は報告でき、再現率を
      精度より優先する。REQ-0102-002 の列挙完全性は別途維持し、列挙結果
      （全 REQ/ADR ファイル一覧）は親が保持する。
  - id: CR-003
    conflict: G の「機械的分類可能なラベル構造」と ADR-0124（soft-contract）の整合性
    resolution: |
      Oracle 相談（bg_53b5b508）の確定事項に基づき、ラベル構造は soft-contract
      （LLM 推論消費の軟い規約）とする。厳格スキーマ検証を導入しないことで
      ADR-0124 と整合する。分類権限は親が保持し、oracle はラベル付き助言を
      返すのみとする（ADR-0112 §4 準拠）。
  - id: CR-004
    conflict: REQ-0102 の SPLIT 予兆（既存85行 + APPEND 2行 = 87行、SPLIT シグナル +4）
    resolution: |
      REQ-0102 自体が既存で行数 +2、関心分類 +1、成果物種別 +1 の SPLIT
      シグナル +4（SPLIT 推奨）。今回の APPEND で新規に増えるシグナルは
      行数 +2 のみで、関心・成果物は既存状態。今回の要件（F・G）は req-define
      工程に属し「要件定義・保存」テーマで一貫。REQ-0102 自体の SPLIT は
      別途検討課題として記録し、今回の APPEND は実施する。

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-0102
    target_spec: docs/specs/commands/req-define.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0102
      artifact_action_mappings:
        - artifact_action_id: ACT-REQ-001
          operation: append
          target_req: REQ-0102
          appended_requirement_ids:
            - REQ-0102-072
            - REQ-0102-073
          source_items: [AG-001, AG-002]
      source_ru_to_ou_mapping:
        - source_ru: null
          ou_id: OU-001
          operations: [REQ-0102 APPEND]
      skipped_artifact_actions:
        - artifact_action_id: ACT-SPEC-001
          reason: "artifact: spec は spec-save コマンドの対象。req-save は処理しない（REQ-0102-067）"
      case_open_input:
        saved_reqs: [REQ-0102]
        pending_spec_actions:
          - artifact_action_id: ACT-SPEC-001
            target: docs/specs/commands/req-define.md
            operation: spec-update
      qg1_result: pass
      saved_at: 2026-06-24

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []

draft-meta:
  split-forecast:
    target: "REQ-0102"
    metrics:
      requirement_lines: 87
      concern_classifications: 2
      artifact_types: 3
      spec_separation_violations: 0
    signals:
      requirement_lines: 2
      concern_classifications: 1
      artifact_types: 1
      spec_separation: 0
    total: 4
    recommended_action: "SPLIT推奨（既存状態・今回 APPEND で新規増加分なし）"
    note: "REQ-0102 自体の SPLIT は別課題。今回の APPEND はテーマ一貫性から実施"
    thresholds_ref: "docs/specs/req-health-metrics.md"
```

# summary

req-define 工程効率化として F（Step 5-1 explore 委譲スコープ絞り込み）と G（Step 5-4 oracle 相談入出力標準化）を1ドラフトに統合。実績 ses_10c29a13 の req-define 1時間11分中、F 対象 24分・G 対象 21分（計 45分・64%）を削減目標とする。

Oracle 相談（bg_53b5b508）で新規 ADR 不要を確定（高確信度）。F・G は既存 ADR-0112/0124/0107 適用範囲内の運用改善。REQ-0102 APPEND（2件）+ docs/specs/commands/req-define.md spec-update + agentdev-req-analysis skill 改修（F）+ agentdev-architecture-advisory skill 改修（G）で実装する。
