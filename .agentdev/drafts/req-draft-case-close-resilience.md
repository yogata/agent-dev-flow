---
draft_type: req_draft
topic_slug: case-close-resilience
status: saved
created_at: 2026-07-03T00:00:00+09:00
source_rus: [RU-0004, RU-0006, RU-0007]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-close の squash merge ポーリング（mergeable UNKNOWN 待機）、gh CLI WRITE手続きのencoding初期化必須化、git main同期時のworktree/並列実行リスク事前検出を追加し、case-close全体の堅牢性を向上する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-close は squash merge 実行前に PR の mergeable 状態を確認し、UNKNOWN の場合は mergeable になるまでポーリング待機する。
      ポーリングは最大60秒、10秒間隔とし、gh pr view --json mergeable,mergeStateStatus で状態を取得する。
      最大待機時間を超過した場合はマージを中止し、構造化エラーとして報告する。
      連続 squash merge 時に mergeable UNKNOWN でマージが失敗する既知の問題を回避する。
  - id: AG-002
    content: |
      agentdev-gh-cli の WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR merge、Issue close 等）は、Windows 環境においてコンソールエンコーディング初期化（standard-procedures Section2 Step0）を必須前置する。
      Step0 を省略した場合、UTF-8 BOM なしファイルの編集結果が cp932 に変換され mojibake 化する既知の問題を排除する。
      全 gh WRITE 操作を実行する command/skill は、agentdev-gh-cli 手続き経由でこの初期化が適用されることを前提とする。
  - id: AG-003
    content: |
      case-close は git main 同期時に worktree 状態（dirty tree）、並列実行による ref lock 競合、非 main ブランチ占有の3つのリスクを事前検出する。
      検出時は安全な代替同期手順（直列化待機、git fetch origin main:main による非チェックアウト同期）を選択し、pull 失敗を回避する。
      暗黙の手順順序依存（worktree 状態、並列実行コンテキスト）を明示的な事前チェックに置き換える。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0131
    source_items: [AG-001, AG-003]
    content: |
      | REQ-0131-028 | case-close は squash merge 実行前に PR の mergeable 状態を確認し、UNKNOWN の場合は mergeable になるまでポーリング待機すること（最大60秒、10秒間隔）。ポーリングには gh pr view --json mergeable,mergeStateStatus を使用し、最大待機時間超過時はマージを中止し構造化エラーとして報告すること |
      | REQ-0131-029 | case-close は git main 同期時に worktree 状態（dirty tree）、並列実行による ref lock 競合、非 main ブランチ占有の3リスクを事前検出し、安全な代替同期手順（直列化待機、git fetch origin main:main による非チェックアウト同期）を選択すること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0149
    source_items: [AG-002]
    content: |
      | REQ-0149-009 | agentdev-gh-cli の WRITE 手続きは Windows 環境においてコンソールエンコーディング初期化（standard-procedures Section2 Step0）を必須前置すること。UTF-8 BOM なしファイルの編集結果の mojibake 化を排除すること |

conflict_resolutions:
  - id: CR-001
    conflict: RU-0006 の encoding 初期化要件は case-close（REQ-0131）固有か、全 gh WRITE 操作に横展開すべきか
    resolution: |
      全 gh WRITE 操作に横展開する。agentdev-gh-cli 手続き基盤（REQ-0149）に APPEND し、全 command/skill が agentdev-gh-cli 経由で encoding 初期化の恩恵を受ける構成とする。REQ-0131 固有の要件とはしない。

operation_units:
  - ou_id: OU-001
    source_ru: [RU-0004, RU-0007]
    target_req: REQ-0131
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0131.md
      artifact_action_mapping:
        ACT-REQ-001:
          target: REQ-0131
          operation: append
          saved_items: [REQ-0131-028, REQ-0131-029]
      source_ru_mapping:
        RU-0004: REQ-0131
        RU-0007: REQ-0131
      case_open_input:
        req_refs: [REQ-0131]
        issue_policy: single
  - ou_id: OU-002
    source_ru: [RU-0006]
    target_req: REQ-0149
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0149.md
      artifact_action_mapping:
        ACT-REQ-002:
          target: REQ-0149
          operation: append
          saved_items: [REQ-0149-009]
      source_ru_mapping:
        RU-0006: REQ-0149
      case_open_input:
        req_refs: [REQ-0149]
        issue_policy: single

saved_req_docs:
  - docs/requirements/REQ-0131.md
  - docs/requirements/REQ-0149.md

artifact_action_mapping:
  ACT-REQ-001:
    target: REQ-0131
    operation: append
    saved_items: [REQ-0131-028, REQ-0131-029]
  ACT-REQ-002:
    target: REQ-0149
    operation: append
    saved_items: [REQ-0149-009]

case_open_input:
  req_refs: [REQ-0131, REQ-0149]
  issue_policy: per-ou
  epic_needed: false

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      連続 squash merge を含む PR で case-close を実行し、mergeable UNKNOWN 検出時にポーリング待機が発生すること、最大60秒超過時にマージ中止と構造化エラー報告が行われることを確認する。
    pass_criteria: |
      mergeable UNKNOWN 検出時にポーリングが実行され、mergeable になった後にマージが成功すること。最大待機時間超過時にマージが中止されエラーが報告されること。
    on_failure: |
      fix-and-reverify。ポーリング実装または待機時間設定に不備がある場合、実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      Windows 環境で agentdev-gh-cli WRITE 手続き（Issue 本文更新等）を実行し、編集後ファイルが UTF-8 BOM なしで保持され mojibake が発生しないことを確認する。
    pass_criteria: |
      全 WRITE 手続き後にファイルが UTF-8 BOM なしで保持され、文字化けが検出されないこと。
    on_failure: |
      fix-and-reverify。encoding 初期化の手続き漏れまたは実行順序の不備がある場合、実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      worktree 内に未コミット変更がある状態、並列実行コンテキスト、非 main ブランチ占有の各状況で case-close の git main 同期を実行し、事前検出と代替同期手順の選択を確認する。
    pass_criteria: |
      3つのリスク状況それぞれで事前検出が行われ、安全な代替同期手順が選択されて pull 失敗が回避されること。
    on_failure: |
      fix-and-reverify。事前検出ロジックまたは代替同期手順の選択に不備がある場合、実装を修正して再検証する。

case_open_hints:
  epic_needed: false
```

# summary

case-close の3つの堅牢化改善（mergeable UNKNOWN ポーリング、encoding 初期化必須化、git main 同期リスク事前検出）を REQ-0131 と REQ-0149 への APPEND として定義した。いずれも学習パイプラインで検出された実行時問題に基づく改善であり、新規アーキテクチャ判断は不要。
