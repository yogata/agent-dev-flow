---
draft_type: req-define
topic_slug: untracked-skills-policy
status: saved
created_at: "2026-07-03"
source_rus:
  - RU-0011
---

# draft-data

work_type: maintenance

summary: >-
  .opencode/skills/ 配下の参照済み未トラックスキルを特定し、
  配布物が依存するスキルを src/opencode/skills/ に昇格（配布物化）する方針を確立する。
  配布物と repo-local の境界を明確化し、新規 clone 環境でのスキル不在を解消する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      配布物（src/opencode/commands/, src/opencode/skills/）が参照する
      .opencode/skills/ 配下のスキルを git ls-files 突合で特定し、
      src/opencode/skills/ に昇格（配布物化）すること。
      昇格基準（配布物が依存するか否か）、昇格手順を明文化すること。
      repo-local 専用スキル（配布物が依存しない）は
      .opencode/skills/ のまま管理し、.gitignore で除外を継続すること。
      配布物と repo-local の境界を文書化すること。
  - id: AG-002
    content: >-
      docs-check（check_integrity.ts）は配布物が参照する未トラックスキル
     （.opencode/skills/ 配下で git 管理対象外）を検出すること。
      検出された場合は src 昇格を促すこと。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: REQ-0159
    source_items:
      - AG-001
      - AG-002
    content: |
      | REQ-NEW-001 | 配布物（src/opencode/commands/, src/opencode/skills/）が参照する .opencode/skills/ 配下のスキルを特定し、src/opencode/skills/ に昇格（配布物化）すること。昇格基準（配布物が依存するか否か）、昇格手順を明文化すること |
      | REQ-NEW-002 | repo-local 専用スキル（配布物が依存しない）は .opencode/skills/ のまま管理し、.gitignore で除外を継続すること。配布物と repo-local の境界を明確に文書化すること |
      | REQ-NEW-003 | docs-check（check_integrity.ts）は配布物が参照する未トラックスキル（.opencode/skills/ 配下で git 管理対象外）を検出すること。検出された場合は src 昇格を促すこと |
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: ADR-0134
    source_items:
      - AG-001
    content: >-
      コンテキスト: .opencode/skills/ 配下のスキルが .gitignore で除外されており、
      配布物（src/opencode/commands/, src/opencode/skills/）が参照する場合に
      新規 clone 環境でスキル不在になる。japanese-tech-writing は PR#1332 で
      src/opencode/skills/ にトラック化済み。
      決定: 配布物が依存するスキルは src/opencode/skills/ に昇格（配布物化）。
      repo-local 専用スキルは .opencode/skills/ のまま（.gitignore で除外継続）。
      .gitignore ホワイトリスト方式は導入しない（src 昇格で一元管理）。
      根拠: 配布物の自己完結性（self-contained）の原則。
      新規 clone 環境でのスキル不在を防ぐ。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: REQ-0159
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-0159.md
      req_id: REQ-0159
      operation_result: created
      artifact_action_id: ACT-REQ-001
      source_ru: RU-0011
      case_open_input:
        req_id: REQ-0159
        target_path: docs/requirements/REQ-0159.md
  - ou_id: OU-002
    source_ru: RU-0011
    target_req: ADR-0134
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_docs:
        - docs/adr/ADR-0134.md
      adr_id: ADR-0134
      operation_result: created
      artifact_action_id: ACT-ADR-001
      source_ru: RU-0011
      case_open_input:
        adr_id: ADR-0134
        target_path: docs/adr/ADR-0134.md

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      git ls-files 突合で配布物が参照する .opencode/skills/ 配下の未トラックスキルを
      特定し、全て src/opencode/skills/ に昇格されていることを確認する。
      昇格基準と手順が文書化されていることを確認する。
      新規 clone 環境で配布物が参照するスキルが全て存在することを確認する。
    pass_criteria: >-
      配布物参照スキルの未トラック件数 0 件。
      昇格基準・手順明文化済み。
      新規 clone 環境でスキル不在 0 件。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002
    verification: >-
      docs-check 実行で配布物が参照する未トラックスキルが検出されることを確認する。
      検出された場合、src 昇格を促すメッセージが出力されることを確認する。
    pass_criteria: >-
      docs-check で未トラックスキル参照が検出可能。
      src 昇格促進メッセージ出力あり。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false

# summary

## 対象 RU

- RU-0011: 未トラックスキル棚卸し（.opencode/skills/ 配下の参照済みスキル不在リスク）

## 主な変更内容

- 新規 REQ create（配布物依存スキルの src 昇格、repo-local 境界明確化、docs-check 検出）
- 新規 ADR create（new:dist-skill-dependency-policy: 配布物依存スキルの src 昇格方針）

## ADR 判断

ADR 候補: new:dist-skill-dependency-policy（配布物依存スキルの src 昇格方針）。
既存 ADR（ADR-0130 配布物管理）と直接重複なし。
方針: 配布物が依存するスキルは src 昇格、repo-local 専用は .opencode/ のまま。

## 留意事項

- ADR 候補の最終判断はユーザー確認時に実施。G16 に従い oracle 相談を推奨するが、
  ユーザー指示「すべてのドラフトを作ること」を優先しドラフト生成完了後に確認する
- 昇格対象スキルの個別特定（git ls-files 突合）は実装修復作業で実施
- .gitignore ホワイトリスト方式は不採用（src 昇格で一元管理）
