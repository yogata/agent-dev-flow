---
draft_type: feature
topic_slug: gh-cli-pr-files-and-mergeable-procedures
status: saved
created_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-0006
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  case-close.md の委譲表現化（OU-002）に伴い必要となる2つの gh CLI 手続き
  （PR 変更ファイル一覧取得、PR mergeable 状態取得）が agentdev-gh-cli に
  未定義のまま残置されている。REQ-0152-003 は「PR 状態取得処理は
  agentdev-gh-cli への委譲表現を使用」を要求済みだが、委譲先手続き未定義
  により要件が満たされていない。REQ-0149-002 の手続き一覧に2手続きを
  追加（REQ-0149-011 として新設）、agentdev-gh-cli SKILL.md と references/
  standard-procedures.md、references/contracts.md に手続き定義を追記し、
  case-close からの委譲表現が手続きに到達できることを確認する。

auto_gate:
  auto_ready: true
  open_questions: []
  conflicts: []

agreed_items:
  - id: AG-001
    statement: >-
      case-close.md OU-002 委譲表現化で必要な2手続き（PR 変更ファイル一覧
      取得、PR mergeable 状態取得）が agentdev-gh-cli SKILL.md に未定義。
      REQ-0152-003「委譲表現を使用」が委譲先未定義により満たされていない。
    source_rus: [RU-0006]
  - id: AG-002
    statement: >-
      REQ-0149-002 は agentdev-gh-cli の手続き一覧（Issue 作成、Issue 本文
      読込、Issue 本文更新、Issue コメント追加、PR 本文読込、PR merge、
      Issue close、VERIFY）を列挙済み。本 RU は同手続き一覧に「PR 変更
      ファイル一覧取得」「PR mergeable 状態取得」を追加する。REQ-0149-011
      として新設し、既存 REQ-0149-002 は UPDATE しない（手続き一覧の拡張
      であることを明示するため）。
    source_rus: [RU-0006]
  - id: AG-003
    statement: >-
      各手続きの入力・出力・事後条件を定義する。
      (1) PR 変更ファイル一覧取得: 入力 PR 番号、出力 変更ファイルパス一覧
      （追加/変更/削除）、事後条件 ファイル一覧が空でない場合は妥当な
      パス形式であること。
      (2) PR mergeable 状態取得: 入力 PR 番号、出力 mergeable 状態
      （MERGEABLE/CONFLICTING/UNKNOWN）、事後条件 GitHub API の応答を
      妥当に解釈していること。
    source_rus: [RU-0006]
  - id: AG-004
    statement: >-
      agentdev-gh-cli SKILL.md（薄いルーティング入口）、references/
      standard-procedures.md（具体的 gh CLI 手順）、references/contracts.md
      （契約上の位置づけ）の3層へ整合する形で追記する。SKILL.md は手続き
      名レベル、standard-procedures.md は gh pr サブコマンド具体例、
      contracts.md は REQ-0149-011 との対応を記載。
    source_rus: [RU-0006]
  - id: AG-005
    statement: >-
      case-close.md からの委譲表現（REQ-0152-003 対象の PR view、PR merge
      等）が新設手続きを含めて agentdev-gh-cli に到達できることを、
      check_integrity.ts の IR-053（gh 直接記述機械検出）で確認する。
      case-close.md に gh CLI 直接呼出しが残らないこと。
    source_rus: [RU-0006]

artifact_actions:
  - target: REQ-0149
    operation: append
    new_id: REQ-0149-011
    description: >-
      agentdev-gh-cli は次の2手続きを追加で提供すること: (a) PR 変更ファイル
      一覧取得（入力 PR 番号、出力 変更ファイルパス一覧）、(b) PR mergeable
      状態取得（入力 PR 番号、出力 MERGEABLE/CONFLICTING/UNKNOWN）。手続きの
      具体的引数・戻り値は SPEC agentdev-gh-cli.md に配置。
    rationale: >-
      REQ-0149-002 の手続き一覧に PR 変更ファイル一覧取得・mergeable 状態
      取得が未列挙。case-close の委譲表現化で必要となる手続きであり、
      REQ-0152-003 完遂の前提。
  - target: src/opencode/skills/agentdev-gh-cli/SKILL.md
    operation: 実装修復
    description: >-
      薄いルーティング入口に2手続きを追加（手続き名、入力、出力の最小定義）。
      詳細手順は references/standard-procedures.md へ。
  - target: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md
    operation: 実装修復
    description: >-
      2手続きの具体的 gh CLI 実行例を追記。
      (1) gh pr view <PR番号> --json files --jq '.files[].path' 等の具体例。
      (2) gh pr view <PR番号> --json mergeable --jq '.mergeable' 等の具体例。
      Windows コンソールエンコーディング初期化（REQ-0149-009）前置。
  - target: src/opencode/skills/agentdev-gh-cli/references/contracts.md
    operation: 実装修復
    description: >-
      REQ-0149-011 の2手続きの契約上の位置づけを追記。手続きが I/O 操作
      （REQ-0149-004）に属し、本文生成・完了判定を含まないことを明記。

conflict_resolutions:
  - id: CR-001
    description: >-
      REQ-0149-002 の手続き一覧を UPDATE するか、REQ-0149-011 を新設するか。
    resolution: >-
      REQ-0149-011 新設。手続き一覧の拡張であることを明示し、REQ-0149-002
      は基盤手続き一覧として維持。REQ-0149-011 は case-close OU-002 由来
      の拡張手続きとして位置づける。
  - id: CR-002
    description: >-
      REQ-0152-003 APPEND と REQ-0149 APPEND の使い分け。
    resolution: >-
      REQ-0152-003 は「case-close が委譲表現を使用する」要件で既存十分。
      REQ-0149 APPEND（REQ-0149-011）が委譲先手続きの定義。両者は連動する
      が別関心（需要側 vs 供給側）。

operation_units:
  - id: OU-001
    description: >-
      REQ-0149 へ REQ-0149-011 を APPEND。2手続きの定義。
    depends_on: []
    artifact: docs/requirements/REQ-0149.md
  - id: OU-002
    description: >-
      SPEC agentdev-gh-cli.md（docs/specs/skills/agentdev-gh-cli.md 相当）
      に2手続きの引数・戻り値・事後条件を追記。
    depends_on: [OU-001]
    artifact: docs/specs/**
  - id: OU-003
    description: >-
      agentdev-gh-cli SKILL.md、references/standard-procedures.md、
      references/contracts.md の3層へ手続き定義を追記。
    depends_on: [OU-002]
    artifact: src/opencode/skills/agentdev-gh-cli/**
  - id: OU-004
    description: >-
      case-close.md からの委譲表現が新設手続きに到達することを IR-053
      （check_integrity.ts）で確認。
    depends_on: [OU-003]
    artifact: src/opencode/commands/agentdev/case-close.md

test_strategy:
  - id: TS-001
    verification: >-
      REQ-0149-011 が docs/requirements/REQ-0149.md に追記されていることを
      確認。
    pass_criteria: REQ-0149-011 エントリが存在し、2手続きが列挙されている。
    on_failure: >-
      OU-001 の APPEND 実施。req-save で追記。
  - id: TS-002
    verification: >-
      agentdev-gh-cli SKILL.md、references/standard-procedures.md、
      references/contracts.md に2手続きの記述が存在すること。
    pass_criteria: 3ファイルとも2手続きへの言及あり。
    on_failure: >-
      OU-003 の追記実施。
  - id: TS-003
    verification: >-
      check_integrity.ts を実行し case-close.md から IR-053（gh 直接記述）
      の検出が0件であること。
    pass_criteria: case-close.md の IR-053 違反 0件。
    on_failure: >-
      case-close.md に残存する gh 直接呼出しを委譲表現へ置換。
  - id: TS-004
    verification: >-
      手続きの実際の実行確認（gh pr view <PR> --json files、--json mergeable
      が想定通り動作するか）。
    pass_criteria: >-
      テスト用 PR で両手続きがファイル一覧・mergeable 状態を返すこと。
    on_failure: >-
      gh CLI バージョン互換性を確認。standard-procedures.md の具体例を
      調整。

case_open_hints:
  recommended_label: "type:feature, scope:agentdev-gh-cli, area:gh-cli-procedures"
  scope_statement: >-
    agentdev-gh-cli に PR 変更ファイル一覧取得・mergeable 状態取得の
    2手続きを追加し、case-close.md の委譲表現化を完遂する。
  suggested_breakdown:
    - "Wave 1: REQ-0149-011 APPEND"
    - "Wave 2: SPEC agentdev-gh-cli.md 更新"
    - "Wave 3: SKILL.md + references 3層追記"
    - "Wave 4: case-close IR-053 検出確認"
  dependencies:
    - "REQ-0149 既存要件（REQ-0149-001〜010）との整合"
    - "REQ-0152-003 完遂（委譲表現化）と連動"
    - "agentdev-gh-cli SPEC（docs/specs/skills/ 配下想定）との整合"
```

# summary

RU-0006（agentdev-gh-cli 2手続き追加）を処理。case-close.md OU-002 委譲表現化で必要な「PR 変更ファイル一覧取得」「PR mergeable 状態取得」の2手続きが agentdev-gh-cli に未定義。REQ-0152-003 は「委譲表現を使用」を要求済みだが、委譲先未定義により満たされていない。REQ-0149-002 の手続き一覧に2手続きを REQ-0149-011 として新設し、SKILL.md/references 3層へ手続き定義を追記、case-close からの委譲表現到達性を IR-053 で確認する方針。

work_type=feature、scale=standard。新規 ADR 不要（既存 ADR-0130 範囲内）。test_strategy は4件。Wave 4段階での分割実装を推奨。
