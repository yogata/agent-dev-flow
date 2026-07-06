---
draft_type: req_draft
topic_slug: integrity-ng-detection-scope-exclusion
status: saved
created_at: 2026-07-06T02:30:00Z
---

# draft-data

```yaml
work_type: maintenance

summary: >
  integrity-check の NG 36件のうち (B) 23件（検出スコープ除外不正、req-range 検出強化、旧語彙検出の文脈区別）に対応する要件として、
  REQ-0145-015（新規: 検出ルール説明文のスコープ除外）、REQ-0144-018（改廃: req-range 検出の動的参照+自動更新仕組み）、
  REQ-0144-024（改廃: 旧語彙の歴史経緯と現行機能の文脈区別）を定義する。
  (A) 13件の実装修復と (B-3) 3件の categoryToCheckPattern map 追加は case_open_hints へ引継ぎ。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      docs-check の全検出関数（broken-reference, abolished-skill-references, obsolete-spec-path 等）は、
      検出ルール説明文（docs/specs/integrity/rules/IR-*.md）を検出スコープから除外すること。
      検出ルール説明文内の例示用 ID、廃止 skill 例、廃止 ADR 番号帯例示は自己参照的な説明資料であり、
      検出対象としない。対象ファイルの詳細パターン、各検出関数への適用方式は
      SPEC（integrity-contracts.md「正当な除外」セクション）に配置する。
  - id: AG-002
    content: >
      docs-check の req-range 検出ロジックは、docs/guides/*.md と vocabulary-registry.md に記載の時点REQ番号
      （REQ-0144-007）を動的に参照し、実REQ最大番号と照合すること。時点REQ番号が実REQ最大番号より古い場合、
      安定NGとして検出すること。新規REQ確定時（req-save 完了後）に、docs/guides/*.md と
      vocabulary-registry.md の REQ 範囲表記を自動更新する仕組みを提供すること。
  - id: AG-003
    content: >
      link mode 廃止旧語彙（変換プロンプト/generation-flow/transform 等）を含む文書は、
      歴史経緯の説明文脈と現行機能の記述文脈が区別されること。歴史経緯の説明文脈は検出除外対象、
      現行機能の記述文脈は旧語彙を含まないこと。文脈判定基準、対象語彙、baseline 免除の適用条件は
      SPEC（vocabulary-registry.md「除外コンテキスト」セクション）に配置する。
  - id: AG-004
    content: >
      (A) 実装修復対象 13件（broken-reference 真5件、RuntimeReference new strict 4件、
      source-projection-sync 2件、req-range-staleness 1件、adr-req-crossref 1件）は、
      本要件と合わせて是正する。SPEC 修正項目（integrity-contracts.md「正当な除外」へ個別IRルールファイル追加、
      vocabulary-registry.md 除外コンテキスト実装、vocabulary-registry.md 歴史経緯免除基準、
      integrity-rule-catalog.md categoryToCheckPattern map SPEC）は spec-save へ引継ぐ。
  - id: AG-005
    content: >
      (B-3) 実装修復対象 3件（categoryToCheckPattern map へ 'Obsolete spec path',
      'Distribution reference boundary', 'Targeted docs guard' の3カテゴリ追加）は、
      REQ-0145-005 の新規カテゴリ追加判定フロー（6ステップ）に従い case-open へ引継ぐ。

artifact_actions:
  - id: ACT-REQ-015
    artifact: req
    operation: append
    target: docs/requirements/REQ-0145.md
    target_area: "## 要件 テーブル末尾（REQ-0145-014 の次行に追加）"
    source_items: [AG-001]
    content: |
      | REQ-0145-015 | docs-check の全検出関数（broken-reference, abolished-skill-references, obsolete-spec-path 等）は、検出ルール説明文（`docs/specs/integrity/rules/IR-*.md`）を検出スコープから除外すること。検出ルール説明文内の例示用 ID、廃止 skill 例、廃止 ADR 番号帯例示は自己参照的な説明資料であり、検出対象としない。対象ファイルの詳細パターン、各検出関数への適用方式は SPEC（integrity-contracts.md「正当な除外」セクション）に配置する |
  - id: ACT-REQ-018
    artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    target_area: "## 要件 テーブル REQ-0144-018 行"
    source_items: [AG-002]
    content: |
      | REQ-0144-018 | docs-check の req-range 検出ロジックは、docs/guides/*.md と vocabulary-registry.md に記載の時点REQ番号（REQ-0144-007）を動的に参照し、実REQ最大番号と照合すること。時点REQ番号が実REQ最大番号より古い場合、安定NGとして検出すること。新規REQ確定時（req-save 完了後）に、docs/guides/*.md と vocabulary-registry.md の REQ 範囲表記を自動更新する仕組みを提供すること |
  - id: ACT-REQ-024
    artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    target_area: "## 要件 テーブル REQ-0144-024 行"
    source_items: [AG-003]
    content: |
      | REQ-0144-024 | link mode 廃止旧語彙（変換プロンプト/generation-flow/transform 等）を含む文書は、歴史経緯の説明文脈と現行機能の記述文脈が区別されること。歴史経緯の説明文脈は検出除外対象、現行機能の記述文脈は旧語彙を含まないこと。文脈判定基準、対象語彙、baseline 免除の適用条件は SPEC（vocabulary-registry.md「除外コンテキスト」セクション）に配置する |
  - id: ACT-REQ-0145-SCOPE
    artifact: req
    operation: update
    target: docs/requirements/REQ-0145.md
    target_area: "## 適用範囲"
    source_items: [AG-001, AG-005]
    content: |
      ## 適用範囲

      - **対象**: integrity-rule-catalog.md、IR-044/050/051、case-run references checker、完了条件 grep パターン、draft SPEC 参照リスト、8REQ の SPEC 詳細移行先
      - **対象外**: check_integrity.ts 本体の機能変更（RU-0006 は文書化のみを宣言）、既存 REQ の個別 SPEC 詳細移行作業（case-run で対応）
      - **SPEC 修正項目**: integrity-contracts.md「正当な除外」セクション（個別 IR ルールファイル rules/IR-*.md 追加）、vocabulary-registry.md 除外コンテキストの各検出関数での実装、integrity-rule-catalog.md categoryToCheckPattern map SPEC（REQ-0145-005 の6ステップ詳細）
      - **是正対象（case-open 引継ぎ）**: (B-3) categoryToCheckPattern map へ 'Obsolete spec path', 'Distribution reference boundary', 'Targeted docs guard' の3カテゴリ追加
  - id: ACT-REQ-0144-SCOPE
    artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    target_area: "## 適用範囲"
    source_items: [AG-002, AG-003, AG-004]
    content: |
      ## 適用範囲

      - **対象**: docs/ 配下の文書是正、AGENTS.md の REQ 範囲表記、scripts/tests/check_integrity.test.ts fixture、.gitignore、QG-3/QG-4 references、case-close.md ガードレール、docs/specs/foundations/system.md コマンド一覧、check_integrity test suite 責務明文化、IR-044 保護対象リスト鮮度
      - **対象外**: check_integrity.ts 本体の機能変更（REQ-0145 で扱う）、新規検出ルールの設計（REQ-0145 で扱う）、retired REQ の復活
      - **SPEC 修正項目**: vocabulary-registry.md 歴史経緯免除基準（REQ-0144-024 改廃に伴う分類基準詳細）
      - **是正対象（case-open 引継ぎ）**: (A) 13件の実装修復リスト
        - broken-reference（真）5件: REQ-0157, ADR-0133 (REQ-0161.md), REQ-0143 (command-file-format.md), consumer-project-setup.md (runtime-package-boundary.md), quality-gates/SKILL.md (quality-gates.md)
        - RuntimeReference new strict 4件: case-open.md:65, inspect-extensions.md:20,40,41
        - source-projection-sync 2件: agentdev-project-extensions, japanese-tech-writing の projection エントリ欠落
        - req-range-staleness 1件: vocabulary-registry.md:217 + docs/guides/project-docs-and-specs.md（REQ-0151/0158 → REQ-0161）
        - adr-req-crossref 1件: ADR-0133 (REQ-0161.md)

conflict_resolutions:
  - id: CR-001
    conflict: REQ-0144-024 従来文案に作業要求（「特定し」「策定すること」）と反映作業（「置換すること」）が混入し要件行として不適格
    resolution: >
      agentdev-req-analysis SKILL「状態要件と反映作業の分離基準」に従い、作業要求と反映作業を削除し
      状態要件（歴史経緯と現行機能の文脈区別）へ置換。文脈判定基準詳細は SPEC へ配置。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0145
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0145.md
      operations:
        - ACT-REQ-015: REQ-0145-015 appended (table row)
        - ACT-REQ-0145-SCOPE: 適用範囲 に SPEC 修正項目 + (B-3) 是正対象 追記
      source_items_mapping:
        - AG-001 -> REQ-0145-015
      case_open_ready: true
  - ou_id: OU-002
    target_req: REQ-0144
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0144.md
      operations:
        - ACT-REQ-018: REQ-0144-018 既存行を新文案へ置換（動的参照 + 自動更新仕組み）
        - ACT-REQ-024: REQ-0144-024 既存行を新文案へ置換（状態要件へ純化、CR-001）
        - ACT-REQ-0144-SCOPE: 適用範囲 に SPEC 修正項目 + (A) 是正対象 13件リスト追記
      source_items_mapping:
        - AG-002 -> REQ-0144-018
        - AG-003 -> REQ-0144-024
      case_open_ready: true

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity.ts を実行し、docs/specs/integrity/rules/IR-*.md 由来の NG 件数を確認する。
      spec-save で integrity-contracts.md「正当な除外」へ rules/IR-*.md 除外を追加後、case-open で各検出関数の除外実装を完了後に検証する。
    pass_criteria: |
      rules/IR-*.md 由来の broken-reference, abolished-skill-references, obsolete-spec-path の各検出関数での NG が 0 件であること。
    on_failure: |
      fix-and-reverify: 除外パターン（rules/IR-*.md のパスマッチング）を調整して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      check_integrity.ts の req-range 検出を実行し、docs/guides/*.md と vocabulary-registry.md の時点REQ番号と実REQ最大番号のずれを確認する。
      vocabulary-registry.md:217 と docs/guides/project-docs-and-specs.md の REQ 範囲表記が REQ-0161 に更新された後に検証する。
    pass_criteria: |
      時点REQ番号が実REQ最大番号と一致し、req-range-staleness NG が 0 件であること。
    on_failure: |
      fix-and-reverify: REQ 範囲表記を更新して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      check_integrity.ts の obsolete-spec-path 検出を実行し、ADR-0131/0126 歴史説明文中の旧語彙が除外対象となっていることを確認する。
      spec-save で vocabulary-registry.md「除外コンテキスト」へ歴史経緯免除基準を追加後に検証する。
    pass_criteria: |
      歴史経緯の説明文脈の旧語彙が検出除外され、現行機能の記述文脈の旧語彙のみが検出されること。
    on_failure: |
      fix-and-reverify: 文脈判定基準を調整して再検証する。

case_open_hints:
  epic_needed: true
  decomposition:
    - (A) broken-reference（真）5件: 参照元文書修正 or ADR-0133 作成
    - (A) RuntimeReference new strict 4件: src/opencode/ 参照削除 or baseline 更新
    - (A) source-projection-sync 2件: sync-opencode.ps1 実行 + install script 個別追加
    - (A) req-range-staleness 1件: vocabulary-registry.md:217 + docs/guides/ の表記更新
    - (A) adr-req-crossref 1件: ADR-0133 作成 or REQ-0161.md 参照修正
    - (B-3) categoryToCheckPattern map 3件: 3カテゴリ追加（REQ-0145-005 6ステップ準拠）
  wave_hints:
    - Wave 1: (A) 実装修復 13件（独立タスク、並列化可）
    - Wave 2: (B-3) categoryToCheckPattern map 3件（REQ-0145-005 フロー準拠）
```

# summary

integrity-check の NG 36件のうち (B) 23件（検出スコープ除外不正、req-range 検出強化、旧語彙検出の文脈区別）に対応する3要件（REQ-0145-015 新規、REQ-0144-018/024 改廃）を定義する。各要件の状態要件本文は agreed_items（AG-001〜003）が原本で、SPEC 詳細（検出除外パターン、req-range 動的参照、文脈判定基準）は各 REQ「適用範囲」セクションに配置先を明記して spec-save へ引継ぐ。(A) 13件の実装修復と (B-3) 3件の categoryToCheckPattern map 追加は case_open_hints の decomposition/wave_hints 経由で case-open へ引継ぐ。REQ-0144-024 改廃は agentdev-req-analysis SKILL「状態要件と反映作業の分離基準」に従い、作業要求と反映作業を削除して状態要件へ純化した（CR-001）。
