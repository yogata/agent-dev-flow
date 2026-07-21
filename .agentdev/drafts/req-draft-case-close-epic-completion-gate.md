---
draft_type: req_draft
topic_slug: case-close-epic-completion-gate
status: saved
created_at: 2026-07-21T12:47:57+09:00
source_rus: []
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: |
  case-close の Epic Wave クローズ（Step E1-E6）に Step E5b を新設し、Epic Issue 本文の完了条件チェックボックスを QG-4 に従い評価・更新する。各 Wave は当該 Wave の PR 対象範囲の完了条件のみを部分評価し、最終 Wave で全完了条件を再読込 VERIFY（最大2回）する。未達項目が残る場合は構造化エラーで停止する（G08 Epic Wave 経路への明示適用）。REQ-0131 APPEND（REQ-0131-032〜034 の3件追加）と docs/specs/commands/case-close.md への SPEC UPDATE（Step E5b 節新設）で対応する。新規 ADR は不要（ADR-0114 既存枠内の運用拡張）。原因B（#1648 固有の Step E3 抽出ロジック見直し）は本要件のスコープ外（保留事項）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-close の Epic Wave クローズ処理（Step E1-E6）において、Step E5（Epic status table 更新）の後、Step E6（最終 Wave 判定）の前に、新規 Step E5b「Epic Issue 完了条件チェックボックス最終評価・更新」を新設する。Step E5b は Epic Issue 本文の `## 完了条件` セクションを読み込み、全完了条件を QG-4 に従い評価・更新する。単一 Issue クローズ（Step 2）の QG-4 完了条件評価・更新手順を Epic Wave 経路にも拡張適用するものであり、ADR-0114 の完了条件チェックボックス評価 case-close 専任責務を Epic Issue 本文にも及ばす。
  - id: AG-002
    content: |
      Step E5b の評価対象スコープは Wave 種別により切り替える（QG-4 観点8 PR 対象範囲 vs 全体評価スコープの Epic 完了条件への適用）。中間 Wave は当該 Wave でマージされた PR の対象範囲に属する完了条件のみ `[ ]` → `[x]` とする（PR 対象範囲）。最終 Wave は Epic Issue の全完了条件を評価する（全体評価スコープ）。実装完了している完了条件を `[ ]` → `[x]` に更新する。更新後に Epic Issue 本文を再読込し、対象完了条件の `- [ ]` が0件であることを VERIFY する（最大2回）。1回目の再読込で `- [ ]` が0件なら Step E6 へ進む。1回目で残存する場合は更新を再試行し再度再読込（2回目）。2回目でも `- [ ]` が残す場合は構造化エラーで停止する。
  - id: AG-003
    content: |
      最終 Wave で実装完了していない完了条件（`- [ ]`）が残る場合、case-close は構造化エラーで停止する。G08（未達チェックボックス残存時の構造化エラー停止）を Epic Wave クローズ経路にも明示適用する。停止時の出力には残存する未達完了条件の一覧、対応する子Issue のステータス（completed / blocked / failed）、再開コマンド候補を含める。
  - id: AG-004
    content: |
      QG-4 観点8（PR 対象範囲 vs 全体評価スコープ）を Epic Issue 本文の完了条件評価に適用する。中間 Wave では PR 対象範囲（当該 Wave の PR が満たす完了条件）のみ評価し、他 Wave の完了条件は `[ ]` のまま残す。最終 Wave で全体評価を行い、全完了条件が `[x]` であることを確認する。これにより不整合リスクを最小化しつつ、漸進的な完了条件更新を実現する。
  - id: AG-005
    content: |
      原因B（#1648 固有の Step E3 抽出ロジック見直し、子Issue ステータス `pending` のまま PR 作成されたケースの救済）は本要件のスコープ外とする。Step E5b 新設により最終完了条件評価・更新が保証されるため致命的ではない。ステータス追跡テーブルと実態の不整合は残る可能性があるが、本件は別 RU 化または後続対応によりユーザーが別途判断する。本 draft には保留事項として記録する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0131
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      以下3件を REQ-0131 の要件テーブルへ追記する。REQ-0131-031 に続く番号を採番する。

      | REQ ID | 要件 |
      |---|---|
      | REQ-0131-032 | case-close は Epic Wave クローズ処理（Step E1-E6）において、各 Wave 終了時に Epic Issue 本文の `## 完了条件` セクションのチェックボックスを QG-4 に従い評価・更新すること。中間 Wave は当該 Wave でマージされた PR の対象範囲に属する完了条件のみ `[ ]` → `[x]` とし（PR 対象範囲）、最終 Wave は Epic Issue の全完了条件を評価すること（全体評価スコープ） |
      | REQ-0131-033 | case-close は Step E5b（完了条件評価・更新）の実施後、Epic Issue 本文を再読込し対象完了条件の `- [ ]` が0件であることを VERIFY すること（最大2回）。1回目の再読込で `- [ ]` が0件なら次工程へ進む。1回目で残存する場合は更新を再試行し再度再読込（2回目）。2回目でも `- [ ]` が残る場合は構造化エラーで停止すること |
      | REQ-0131-034 | case-close は Epic Wave クローズ経路において、最終 Wave で実装完了していない完了条件が残る場合、構造化エラーで停止すること。G08（未達チェックボックス残存時の構造化エラー停止）を Epic Wave 経路にも明示適用すること。停止時の出力には未達完了条件一覧、対応子Issue ステータス（completed / blocked / failed）、再開コマンド候補を含めること |

      併せて REQ-0131 の「関連情報」セクションの関連 ADR に ADR-0114（完了条件チェックボックス評価 case-close 専任責務）が含まれていることを確認する。含まれていない場合は ADR-0114 への参照を追記する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target_spec: docs/specs/commands/case-close.md
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      以下の新規セクションを docs/specs/commands/case-close.md の Epic Wave クローズ手順（現状 Step E5 と Step E6 の間）へ挿入する。

      ### Step E5b: Epic Issue 完了条件チェックボックス最終評価・更新

      Step E5（Epic status table 更新）の後、Step E6（最終 Wave 判定）の前に実施する。Epic Issue 本文の `## 完了条件` セクションを読み込み、全完了条件を QG-4 に従い評価・更新する（ADR-0114 完了条件チェックボックス評価の case-close 専任責務、G08 Epic Wave 経路への明示適用）。

      #### 評価対象スコープ（QG-4 観点8）

      - **中間 Wave**: 当該 Wave でマージされた PR の対象範囲に属する完了条件のみ `[ ]` → `[x]` とする（PR 対象範囲）。他 Wave の完了条件は `[ ]` のまま残す。
      - **最終 Wave**: Epic Issue の全完了条件を評価する（全体評価スコープ）。実装完了している完了条件を `[ ]` → `[x]` に更新する。

      #### 再読込 VERIFY

      更新後に Epic Issue 本文を再読込し、対象完了条件の `- [ ]` が0件であることを確認する（最大2回）。

      - 1回目の再読込で `- [ ]` が0件なら Step E6（最終 Wave 判定）へ進む。
      - 1回目で `- [ ]` が残る場合は更新を再試行し、再度再読込（2回目）。
      - 2回目でも `- [ ]` が残る場合は構造化エラーで停止する（後述「未達項目残存時の停止」）。

      #### 未達項目残存時の停止

      最終 Wave で実装完了していない完了条件（`- [ ]`）が残る場合、case-close は構造化エラーで停止する（G08 Epic Wave 経路への明示適用）。中間 Wave で他 Wave の完了条件が `[ ]` のまま残ることは停止条件ではない（対象外 Wave の完了条件は評価対象外のため）。

      停止時の出力には以下を含める:
      - 残存する未達完了条件の一覧
      - 対応する子Issue のステータス（completed / blocked / failed）
      - 再開コマンド候補

conflict_resolutions:
  - id: CR-001
    conflict: |
      draft（旧フラット形式）は原因B（#1648 固有の Step E3 抽出ロジック見直し、子Issue ステータス `pending` のまま PR 作成されたケースの救済）を「req-define 工程で併せ検討」としていた。Step E5b 新設により最終完了条件評価・更新は保証されるが、ステータス追跡テーブルと実態の不整合は残る。
    resolution: |
      本要件のスコープ外とする。Step E5b 新設で最終完了条件評価が保証されるため致命的ではない。ステータス追跡テーブルと実態の不整合は別課題として残るが、原因B の Step E3 抽出ロジック見直しは保留事項として draft に記録し、別 RU 化や後続対応はユーザーが別途判断する。本要件は Step E5b 新設に専念する。

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-0131
    target_spec: docs/specs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      テスト用 Epic Issue を用意し、子Issue の PR をマージした状態で case-close を Epic Wave クローズモードで実行する。Step E5（Epic status table 更新）の後、Step E6（最終 Wave 判定）の前に Step E5b が実行され、Epic Issue 本文の `## 完了条件` セクションのチェックボックスが QG-4 に従い評価・更新されることを確認する。
    pass_criteria: |
      Step E5b が実行され、Epic Issue 本文の完了条件チェックボックスが `[x]` 化されること。Step E5 と Step E6 の間に位置すること。単一 Issue クローズ（Step 2）の QG-4 手順と同等の評価・更新が行われること。
    on_failure: |
      fix-and-reverify。Step E5b が実行されない、または評価・更新が正しく行われない場合は実装不良のため、case-close の実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      2つのシナリオで検証する。(a) 中間 Wave: 一部の子Issue の PR をマージした状態で中間 Wave の case-close を実行し、当該 Wave の PR 対象範囲の完了条件のみ `[ ]` → `[x]` となることを確認する。他 Wave の完了条件は `[ ]` のまま残ること。(b) 最終 Wave: 全子Issue の PR をマージした状態で最終 Wave の case-close を実行し、全完了条件が `[x]` 化され、再読込 VERIFY で `- [ ]` が0件となることを確認する（最大2回）。
    pass_criteria: |
      (a) 中間 Wave では当該 Wave の PR 対象範囲の完了条件のみ `[x]` 化され、他 Wave の完了条件は `[ ]` のまま残ること。(b) 最終 Wave では全完了条件が `[x]` 化され、再読込 VERIFY で `- [ ]` が0件となること。
    on_failure: |
      fix-and-reverify。スコープ判定や VERIFY ロジックに不具合がある場合は実装不良のため、case-close の実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      未達の完了条件が残る状態（一部子Issue が blocked や failed、対応する完了条件が未達）で最終 Wave の case-close を実行し、構造化エラーで停止することを確認する。停止時の出力に未達完了条件一覧、対応子Issue ステータス、再開コマンド候補が含まれることを確認する。
    pass_criteria: |
      最終 Wave で `- [ ]` が残る場合、case-close が構造化エラーで停止すること。停止時の出力に未達完了条件一覧、対応子Issue ステータス、再開コマンド候補が含まれること。G08 の Epic Wave 経路への明示適用として機能すること。
    on_failure: |
      fix-and-reverify。停止判定や出力内容に不具合がある場合は実装不良のため、case-close の実装を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

case-close の Epic Wave クローズ時の Epic Issue 本文完了条件チェックボックス評価欠落を是正するため、Step E5b（Epic Issue 完了条件チェックボックス最終評価・更新）を新設する。

主な合意内容:

- Step E5b は現状 Step E5（Epic status table 更新）の後、Step E6（最終 Wave 判定）の前に実行
- 中間 Wave は当該 Wave の PR 対象範囲の完了条件のみ部分評価、最終 Wave で全完了条件を評価
- 再読込 VERIFY（最大2回）、未達残存時は構造化エラー停止（G08 Epic Wave 経路への明示適用）
- REQ-0131 APPEND（REQ-0131-032〜034 の3件）と docs/specs/commands/case-close.md SPEC UPDATE で対応
- 新規 ADR は不要（ADR-0114 既存枠内の運用拡張）
- 原因B（#1648 固有の Step E3 抽出ロジック見直し）は本要件のスコープ外（保留事項）

既存5 Epic（#1683/#1678/#1675/#1665/#1648）の事後是正は前セッションで実施済み。本要件は case-close command/SPEC/REQ の将来の Epic 運用に対する是正である。
