---
draft_type: req_draft
topic_slug: spec-governance-sync
status: saved
created_at: 2026-06-25T09:00:00+09:00
source_rus:
  - RU-0008
  - RU-0009
  - RU-0010
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  SPEC の status（draft / accepted）追跡を単一情報源へ集約し、draft SPEC 放置を機械的検査で検出する基盤を新設する。あわせて inspect-skills の診断観点へ SPEC 操作契約テーブルと references/contracts.md のフィールド一致性検出を追加する（CR-001: 単一情報源化は導入せず、検出追加のみ）。case-run SPEC へ L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）を追記し command 定義との整合を回復する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      SPEC の status（draft / accepted）が単一の追跡可能な情報源から視認可能であること。情報源は DOC-MAP（docs/DOC-MAP.md）または SPEC index（docs/specs/README.md）のいずれか単一のファイルに集約し、複数ファイルへ重複管理しないこと。情報源の選定、列構造、対象 SPEC テーブル範囲の詳細は SPEC に配置する。
  - id: AG-002
    content: |
      draft status の SPEC が一定期間更新されず放置されることを機械的検査で検出できること。検出閾値（期間、更新日基準）、判定アルゴリズム、レポート形式の詳細は SPEC（integrity-rule-catalog.md）に配置し、docs-check の機械検出対象として運用する。本検出は ADR-0123（SPEC lifecycle）で定義された status 値に依存し、status 値の変更は対象外とする。
  - id: AG-003
    content: |
      inspect-skills の診断観点に「SPEC 操作契約テーブルと references/contracts.md のフィールド一致性」を含めること。SPEC 側に記載された操作契約テーブルのフィールド集合が references/contracts.md の対応フィールドと過不足なく一致することを検出し、不一致を検出事項として報告すること。判定基準の詳細、対象 SPEC 範囲、フィールド対応規則は agentdev-inspect-skills skill に集約する（REQ-0125-004 準拠）。
  - id: AG-004
    content: |
      docs/specs/commands/case-run.md SPEC に case-run の L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）の記載を含めること。SPEC 記載は command 定義（src/opencode/commands/agentdev/case-run.md）の計測対象 Step と整合し、Sisyphus-Junior task() 起動直前・直後のタイムスタンプ記録、Sisyphus-Junior 実行時間、worktree 設定/クリーンアップ時間の result 格納を含めること。追記後に case-run.md SPEC の draft → accepted 昇格可否を、コマンド定義検証状態を基に判定すること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:spec-status-tracking
    source_items: [AG-001, AG-002]
    content: |
      REQ-0154: SPEC status 追跡と draft 放置検出

      ## 目的

      SPEC の status（draft / accepted）の進行が単一の追跡可能な情報源から視認可能であり、draft status の SPEC 放置が機械的検査で検出されることで、SPEC ガバナンスの健全性を維持する。ADR-0123（SPEC lifecycle）で定義された status 値に依存し、status 値そのものの変更は対象外とする。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0154-001 | SPEC の status（draft / accepted）が単一の追跡可能な情報源から視認可能であること。複数ファイルへの重複管理を行わないこと。情報源のファイルパス、列構造、対象 SPEC テーブル範囲の詳細は SPEC に配置すること |
      | REQ-0154-002 | draft status の SPEC が放置されることを機械的検査で検出できること。検出閾値、判定アルゴリズム、レポート形式の詳細は SPEC（integrity-rule-catalog.md）に配置すること。本検出は docs-check の機械検出対象として運用すること |

      ## 適用範囲

      - **対象**: SPEC status 追跡情報源の単一化、draft 放置検出ルール
      - **対象外**: 個別 SPEC の status 判断、SPEC lifecycle 定義そのもの（ADR-0123）、status 値の変更

      ## 関連情報

      - **関連 REQ**: REQ-0108（docs-check / Validation / Tests）、REQ-0144（docs-check/integrity 運用是正）
      - **関連 ADR**: ADR-0123（SPEC lifecycle と spec-save の導入）
      - **関連 SPEC**: integrity-rule-catalog.md、DOC-MAP.md / docs/specs/README.md（追跡情報源候補）
    consumed:
      req_save: true
      consumed_at: 2026-06-25T09:00:00+09:00
      saved_path: docs/requirements/REQ-0154.md
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0125.md
    source_items: [AG-003]
    content: |
      | REQ-0125-011 | 診断観点に「SPEC 操作契約テーブルと references/contracts.md のフィールド一致性」を含めること。SPEC 側の操作契約テーブルと references/contracts.md の対応フィールドが過不足なく一致することを検出し、不一致を検出事項として報告すること。判定基準の詳細、対象 SPEC 範囲、フィールド対応規則は agentdev-inspect-skills skill に集約すること（REQ-0125-004 準拠） |
    consumed:
      req_save: true
      consumed_at: 2026-06-25T09:00:00+09:00
      saved_path: docs/requirements/REQ-0125.md
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target: docs/specs/commands/case-run.md
    source_items: [AG-004]
    content: |
      ## L2 タイムスタンプ計測

      case-run は Sisyphus-Junior task() の起動直前・直後にタイムスタンプを記録し、Sisyphus-Junior 実行時間および worktree 設定/クリーンアップ時間を result に含める（REQ-0151-009、REQ-0130-028）。

      計測対象は以下のフェーズ前後とする。

      - worktree 設定（設定開始・完了）
      - task() 委譲（起動直前・直後）
      - 検証フェーズ（開始・完了）
      - worktree クリーンアップ（開始・完了）

      記録された L2 タイムスタンプは case-auto の工程別壁時計時間報告（REQ-0151-008）の入力として消費される。L3（ulw-loop 内部メトリクス）は対象外とする（REQ-0151-010）。
    consumed:
      spec_save: true
      consumed_at: 2026-06-25T23:54:20+09:00
      saved_path: docs/specs/commands/case-run.md

conflict_resolutions:
  - id: CR-001
    topic: "RU-0009 contracts.md と SPEC操作契約テーブルの単一情報源化"
    resolution: "検出追加のみ（単一情報源化は導入しない）"
    rationale: "ユーザー判断（req-define 壁打ち 2026-06-25）。contracts.md と SPEC操作契約テーブルは独立ファイルとして維持し、inspect-skills のフィールド一致性検出（REQ-0125-011）で不一致をキャッチする。生成スクリプト・ビルドステップは導入しない。REQ-0125-011 は本判断に関わらず成立。"
    decision_source: user

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: REQ-0154
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-0154]
      saved_path: docs/requirements/REQ-0154.md
  - ou_id: OU-002
    source_ru: RU-0009
    target_req: REQ-0125
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs: [REQ-0125-011]
      saved_path: docs/requirements/REQ-0125.md
  - ou_id: OU-003
    source_ru: RU-0010
    target_spec: docs/specs/commands/case-run.md
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/DOC-MAP.md または docs/specs/README.md のいずれか単一ファイルに SPEC status を視認可能な列または記述が存在すること、もう一方に重複した status 管理が存在しないことを確認する。
    pass_criteria: |
      SPEC status が単一ファイルから視認可能であり、重複管理されていないこと。
    on_failure: |
      fix-and-reverify。単一情報源への集約が未完了の場合、対象ファイルへ status 列を追加し、重複箇所を除去して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      integrity-rule-catalog.md（または該当 SPEC）に draft SPEC 放置検出ルールが記載されており、docs-check 実行で draft status の SPEC が検出対象となることを確認する。意図的に用意した draft SPEC fixture が検出されることを回帰テストで検証する。
    pass_criteria: |
      draft status の SPEC が機械的検査で検出され、レポートまたは検出事項として報告されること。
    on_failure: |
      fix-and-reverify。検出ルールが未実装または false negative の場合、ルールを修正し、fixture を通過するまで再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      agentdev-inspect-skills skill に SPEC 操作契約テーブル ↔ references/contracts.md フィールド一致性の診断観点が記載されていることを確認する。意図的にフィールドを欠落させた SPEC と contracts.md のペアを用意し、inspect-skills が不一致を検出事項として報告することを検証する。
    pass_criteria: |
      SPEC 操作契約テーブルと contracts.md のフィールド不一致が検出事項として報告されること。
    on_failure: |
      fix-and-reverify。診断観点または判定基準に漏れがある場合、skill へ追記し、fixture が検出されるまで再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/commands/case-run.md に L2 タイムスタンプ計測の記載が存在すること、および記載内容が command 定義（src/opencode/commands/agentdev/case-run.md）の計測対象 Step と整合することを確認する。REQ-0151-009、REQ-0130-028 への参照が含まれることを確認する。
    pass_criteria: |
      case-run.md SPEC に L2 タイムスタンプ計測が記載され、command 定義と整合していること。
    on_failure: |
      fix-and-reverify。記載漏れまたは Step 不整合がある場合、SPEC または command 定義を修正し、整合するまで再検証する。

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

本ドラフトは SPEC 治理・同期に関する 3 RU（RU-0008、RU-0009、RU-0010）を統合する。

- **RU-0008**: DOC-MAP / SPEC index への SPEC status 追跡機構と draft 放置検出を新設する（REQ-0154 CREATE）。
- **RU-0009**: inspect-skills の診断観点へ SPEC 操作契約テーブル ↔ contracts.md フィールド一致性検出を追加する（REQ-0125 APPEND）。単一情報源化は User Decision として stop_reasons に記録。
- **RU-0010**: case-run SPEC へ L2 タイムスタンプ計測を追記する（SPEC update のみ、REQ 変更なし）。

SPLIT 健全性: 要件行数 3（REQ-0154: 2、REQ-0125 APPEND: 1）、関心分類数 1（SPEC 治理・同期）、アーティファクト種別数 2（REQ、SPEC）。合計 SPLIT シグナル 0。APPEND 許可範囲。
