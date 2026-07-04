---
draft_type: req_draft
topic_slug: artifact-lifecycle-processed-deletion
status: saved
created_at: 2026-07-05T12:00:00+09:00
source_rus:
  - RU-20260704-03
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  AgentDevFlow の artifact lifecycle について、処理済み成果物（reject item、staged/rejected/duplicate entry）の削除と、deferred.md の living pool としての維持を REQ レベルで明文化する。
  REQ-0127 に intake reject item の分類確定後削除（archive 移動なし）を APPEND し、REQ-0128 に deferred.md prune ルールと living pool 維持を APPEND する。
  REQ-0124 の対象外から inspect lifecycle と無関係な `.agentdev/intake/archive/` 記述を削除する。
  REQ-0129 は既存定義（REQ-0129-006）で足りるため変更しない。
  既存 SPEC（capture-boundaries.md, backlog-artifact-lifecycle.md, learning-promote.md）は既に本ポリシーと整合済みであり、SPEC 操作は不要。
  主たる不整合は `.agentdev/README.md` の旧 archive-based lifecycle 記述であり、case work で整理する。
  ADR は新規作成しない（REQ/SPEC レベルの運用ポリシー明文化のため）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      `intake-promote` において reject 判定された intake 項目は、HITL による分類確定後に削除されること。
      `archive/` 配下への移動は行わないこと。
      既存 REQ-0127-003 の「promoted に配置または削除」を補完し、reject パスの削除と archive 移動禁止を明示化する。
      REQ-0127 へ APPEND する。

  - id: AG-002
    content: |
      `learning-promote` において staged / rejected / duplicate のいずれかの判定が確定した `deferred.md` entry は、判定確定時に `deferred.md` から prune（除去）されること。
      詳細な HITL 境界、自動実行条件は REQ-0147-006/007 で既定義済みであり、REQ-0128 には要約レベルの要件として APPEND する。

  - id: AG-003
    content: |
      `deferred.md` は deferred / 未処理 / 再評価対象の entry を保持する living pool として維持されること。
      staged / rejected / duplicate の prune 後も、deferred / 未処理 / 再評価対象の entry を残置すること。
      既存 REQ-0128-001 の「評価済み・再評価候補の living pool」を補完し、未処理エントリの保持を明示化する。
      REQ-0128 へ APPEND する。

  - id: AG-004
    content: |
      REQ-0124 の適用範囲（対象外）から、現行 inspect lifecycle と無関係な対象外記述を削除すること。
      削除対象: `.agentdev/intake/archive/`（アーカイブ済み）行。intake archive は inspect lifecycle と無関係であり、過去配置の補足記述に該当する。

  - id: AG-005
    content: |
      active な SPEC / command / skill / guide / README の lifecycle 説明は、正規配置、処理済み削除、保留・未処理・再評価対象の保持先のみを記述すること。
      既存 SPEC（capture-boundaries.md line 79「即時削除（archive/rejected/ 廃止）」, backlog-artifact-lifecycle.md line 49「元 inbox item を削除」, learning-promote.md lines 22-26「prune 自動実行条件 / prune 非対象」）は既に本ポリシーと整合済み。
      主たる不整合は `.agentdev/README.md`（inbox → archive 移動、archive 永続の旧記述）であり、case work で整理する。
      本 AG は case work（反映作業）を駆動し、artifact_actions には SPEC 操作を含まない。

  - id: AG-006
    content: |
      REQ-0129 は既存定義（REQ-0129-006: RU 化成功した採用済み成果物のみ promoted/ から削除、失敗・矛盾は残置）で足りるため、変更しないこと。

  - id: AG-007
    content: |
      歴史文書（ADR-0113、retired REQ/ADR）の履歴参照は変更しないこと。

  - id: AG-008
    content: |
      存在しないものを否定する要件や、過去配置の廃止経緯を現行 lifecycle 要件として書かないこと。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0127
    source_items: [AG-001]
    content: |
      | REQ-0127-022 | `intake-promote` において reject 判定された intake 項目は、HITL による分類確定後に削除すること。`archive/` 配下への移動は行わないこと |

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0128
    source_items: [AG-002, AG-003]
    content: |
      | REQ-0128-008 | `learning-promote` において staged / rejected / duplicate のいずれかの判定が確定した `deferred.md` entry は、判定確定時に `deferred.md` から prune すること。詳細な HITL 境界、自動実行条件は REQ-0147-006/007 に従うこと |
      | REQ-0128-009 | `deferred.md` は deferred / 未処理 / 再評価対象の entry を保持する living pool として維持すること。staged / rejected / duplicate の prune 後も deferred / 未処理 / 再評価対象の entry を残置すること |

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0124
    target_area: "## 適用範囲 > 対象外"
    source_items: [AG-004]
    content: |
      - **対象外**:
        - `docs/adr/ADR-0113.md`（旧命名移行決定の履歴記録、保持）
        - REQ-0103/0109/0115/0123 の changelog 行（履歴保持）
        - REQ-0103-145 自体（削除指示要件、保持）
        - `docs/requirements/retired/`, `docs/requirements/mapping-table.md`（廃止履歴マッピング）
        - `.agentdev/backlog/req-units/RU-20260615-01.md`（RU 本体、要件化入力として保持）
        - `.opencode/`（gitignore、コンシューマー側投射先）
        - `req-restructure-review`（旧 review 系の更に旧名、別物）
        - `backlog-review`（別コマンド）
        - `req-structure-diagnostics`（`diagnostics` を含むが別スキル、inspect 対象外）

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-20260704-03 は REQ-0128 への deferred.md prune ルール APPEND を要求するが、
      REQ-0147-006/007（HITL 境界、自動実行ルール）が既に staged/rejected/duplicate の prune と
      deferred/未処理の残置を詳細に定義済みである。learning-promote SPEC（lines 22-26）も本ルールを完全記述済み。
    resolution: |
      REQ-0128（learning-promote command 要件）に要約レベルの prune ルールを APPEND し、
      詳細は REQ-0147-006/007 へクロスリファレンスする（REQ-0128-008）。
      これにより REQ-0128 が self-contained でありつつ、重複定義を回避する。
      SPEC 操作は不要（learning-promote SPEC は既に整合済み）。

  - id: CR-002
    conflict: |
      `.agentdev/README.md` の現行 lifecycle 記述は inbox → archive/ 移動、archive/ 永続（履歴参照）
      を記述しており、SPEC（backlog-artifact-lifecycle.md line 49「元 inbox item を削除」、
      capture-boundaries.md line 79「archive/rejected/ 廃止」）および RU intent（reject item 削除）
      と矛盾する。
    resolution: |
      `.agentdev/README.md` の lifecycle 記述を case work で整理する。
      正規配置、処理済み削除、保留・未処理・再評価対象の保持先のみを記述し、
      archive-based の旧記述（inbox → archive 移動、archive 永続）を削除または修正する。
      artifact_actions には SPEC 操作を含めず、case work（AG-005）として扱う。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260704-03
    target_req: REQ-0127
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260704-03
    target_req: REQ-0128
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260704-03
    target_req: REQ-0124
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save 実行後、REQ-0127.md を Read し、REQ-0127-022 が存在すること、
      「reject 判定された intake 項目は HITL による分類確定後に削除」「archive/ 配下への移動は行わない」
      の両方が記述されていることを確認する。
    pass_criteria: |
      REQ-0127-022 が存在し、reject item 削除と archive 移動禁止の両方が明記されていること。
    on_failure: |
      fix-and-reverify: 要件行が欠落または記述不十分な場合、req-save を再実行して修正する。

  - id: TS-002
    target_item: AG-002
    verification: |
      req-save 実行後、REQ-0128.md を Read し、REQ-0128-008 が存在すること、
      staged/rejected/duplicate の prune ルールが記述されていること、
      REQ-0147-006/007 へのクロスリファレンスが含まれていることを確認する。
    pass_criteria: |
      REQ-0128-008 が存在し、prune 対象（staged/rejected/duplicate）と REQ-0147-006/007 参照が記述されていること。
    on_failure: |
      fix-and-reverify: 要件行が欠落またはクロスリファレンスが不足する場合、req-save を再実行して修正する。

  - id: TS-003
    target_item: AG-003
    verification: |
      req-save 実行後、REQ-0128.md を Read し、REQ-0128-009 が存在すること、
      deferred/未処理/再評価対象の living pool 維持と prune 後残置が記述されていることを確認する。
      REQ-0128-001（既存 living pool 記述）と矛盾しないことも確認する。
    pass_criteria: |
      REQ-0128-009 が存在し、deferred/未処理/再評価の保持と prune 後残置が記述されていること。
      REQ-0128-001 と論理矛盾しないこと。
    on_failure: |
      fix-and-reverify: 要件行が欠落または REQ-0128-001 と矛盾する場合、req-save を再実行して修正する。

  - id: TS-004
    target_item: AG-004
    verification: |
      req-save 実行後、REQ-0124.md の適用範囲（対象外）セクションを Read し、
      `.agentdev/intake/archive/`（アーカイブ済み）行が削除されていること、
      他の対象外エントリが intact であることを確認する。
    pass_criteria: |
      `.agentdev/intake/archive/` 行が削除されていること。
      ADR-0113, REQ-0103 changelog, REQ-0103-145, retired/, RU-20260615-01, .opencode/,
      req-restructure-review, backlog-review, req-structure-diagnostics の各対象外エントリが残置されていること。
    on_failure: |
      fix-and-reverify: 削除対象行が残存または非対象行が誤削除された場合、req-save を再実行して修正する。

  - id: TS-005
    target_item: AG-005
    verification: |
      case-run 完了後、以下を確認する:
      (1) `.agentdev/README.md` の lifecycle 記述が正規配置、処理済み削除、保留・未処理・再評価保持先のみを記述していること。
          inbox → archive 移動、archive 永続の旧記述が削除または修正されていること。
      (2) 既存 SPEC（capture-boundaries.md, backlog-artifact-lifecycle.md, learning-promote.md）が変更されていないこと（既に整合済みのため）。
      (3) 関連 command/skill/guide ファイルの lifecycle 記述が整合していること。
    pass_criteria: |
      `.agentdev/README.md` に archive-based の旧 lifecycle 記述が存在しないこと。
      既存 SPEC 3件が意図しない変更を受けていないこと。
      command/skill/guide の lifecycle 記述が正規配置・処理済み削除・保持先に整理されていること。
    on_failure: |
      fix-and-reverify: 旧記述が残存するファイルを特定し、修正して再検証する。
      SPEC が意図しない変更を受けた場合、当該コミットを revert して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      git diff で REQ-0129.md が変更されていないことを確認する。
    pass_criteria: |
      REQ-0129.md に変更がないこと（diff 空）。
    on_failure: |
      record-in-findings: REQ-0129 に事前存在の無関係変更がある場合、out-of-scope として Findings に記録する。
      本作業由来の誤変更の場合は fix-and-reverify で revert する。

  - id: TS-007
    target_item: AG-008
    verification: |
      REQ-0127-022, REQ-0128-008, REQ-0128-009 の要件文を確認し、
      「存在しないXを否定する」形式（例: 「archive/ は使用しない」単独記述）が含まれていないことを確認する。
      否定形は境界条件・例外として肯定文に併記されていること（例: 「削除すること。archive/ への移動は行わないこと」）。
    pass_criteria: |
      全新規要件行が肯定文を主たる文意とし、否定文は境界条件として併記されていること。
      存在しないものを否定する単独要件行が存在しないこと。
    on_failure: |
      fix-and-reverify: 否定形単独要件を肯定文+境界条件例外に修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

## 適用対象と操作

| REQ | 操作 | 内容 |
|-----|------|------|
| REQ-0127 | APPEND | REQ-0127-022: intake reject item の分類確定後削除、archive 移動禁止 |
| REQ-0128 | APPEND | REQ-0128-008: deferred.md prune ルール（REQ-0147-006/007 クロスリファレンス）|
| REQ-0128 | APPEND | REQ-0128-009: deferred.md living pool 維持（deferred/未処理/再評価の残置）|
| REQ-0124 | UPDATE | 対象外から `.agentdev/intake/archive/`（アーカイブ済み）行を削除 |
| REQ-0129 | 変更なし | 既存 REQ-0129-006 で足りる |

## SPEC 操作

SPEC 操作（spec-save）は不要。既存 SPEC 3件は既にRU intent と整合済み:
- `docs/specs/workflows/capture-boundaries.md` line 79: 「即時削除（archive/rejected/ 廃止）」
- `docs/specs/workflows/backlog-artifact-lifecycle.md` line 49: 「元 inbox item を削除（archive/promoted/ への移動は行わない）」
- `docs/specs/commands/learning-promote.md` lines 22-26: prune 自動実行条件 / prune 非対象（REQ-0147-006/007）

## Case Work（反映作業、AG-005）

以下は artifact_actions ではなく case-run で実施する反映作業:
- `.agentdev/README.md`: inbox → archive 移動、archive 永続の旧 lifecycle 記述を整理
- 関連 command/skill/guide ファイル: lifecycle 記述の整合性確認と必要に応じた整理

## ADR 判断

ADR 新規作成なし。本変更は REQ/SPEC レベルの運用ポリシー明文化であり、アーキテクチャ変更、複数システム影響、長期決定、不可逆変更のいずれにも該当しない（ADR閾値判定ブリッジ）。

## 重要な発見

RU-20260704-03 作成時には認識されていなかった事項:
1. **REQ-0147-006/007 が既に prune ルールを詳細定義済み** - REQ-0128 APPEND は要約レベルとし、詳細は REQ-0147 へクロスリファレンス
2. **既存 SPEC 3件は既に整合済み** - SPEC 操作は不要、主たる不整合は `.agentdev/README.md` のみ
