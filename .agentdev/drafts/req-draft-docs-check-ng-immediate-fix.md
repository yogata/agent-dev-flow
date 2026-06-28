---
draft_type: req_draft
topic_slug: docs-check-ng-immediate-fix
status: saved
created_at: 2026-06-28T14:00:00+09:00
source_rus:
  - RU-0001
  - RU-0006
  - RU-0007
---

# draft-data

```yaml
# work_type: REQ-0141 UPDATE（local-transform.md dangling 参照修正）を含むため
# docs_chore から maintenance へ昇格。REQ ファイル変更を伴う点が docs_chore の範囲を超える。
work_type: maintenance

# scale: maintenance のため standard を設定
scale: standard

# summary: 3 RU の統合理由と合意内容の1段落要約
summary: |
  RU-0001、RU-0006、RU-0007 を統合し、docs-check が検出する整合性 NG の即時是正と
  link mode 移行に追随しない旧語彙および dangling 参照の機械的修正を行う。
  RU-0001 は case-close.md への duty キーワード追加と agentdev-inspect-skills SKILL.md の
  参照パス修正により docs-check NG を解消する（REQ-0144-015/019 の完了作業）。
  RU-0006 は REQ-0141 および link mode 移行を説明する文書群の旧語彙を現行語彙へ置換し、
  REQ-0141 の local-transform.md dangling 参照を修正する。
  RU-0007 は docs/guides/project-docs-and-specs.md の SPEC 説明を DOC-MAP.md 修正後表現へ揃え、
  SPEC 一覧表を docs/README.md 基盤 SPEC 一覧への参照へ縮退する（REQ-0140-026/030 の完了作業）。
  全て機械的修正であり、要件意味の変更を含まない。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。状態要件として記述（反映作業は含めない）
agreed_items:
  - id: AG-001
    content: |
      src/opencode/commands/agentdev/case-close.md は docs-check の
      command-capture-duty ルールが検出対象とする duty キーワード（回収・保存）を含むこと。
      該当 NG は根因（キーワード不在）に応じた文書是正により解消し、
      除外や恒久マスク仕組みで隠退させないこと（REQ-0144-015 準拠）。

  - id: AG-002
    content: |
      src/opencode/skills/agentdev-inspect-skills/SKILL.md 内の
      references/contracts.md 参照は解決可能なファイルパスを指すこと。
      実体が単一情報源（src/opencode/skills/agentdev-gh-cli/references/contracts.md）に
      存在する場合、当該明示パスへ参照すること。参照コピーによる解消は行わないこと。

  - id: AG-003
    content: |
      REQ-0141 および link mode 移行を説明する docs/ 配下および src/opencode-local/ 配下の文書は
      link mode 現行語彙（link mode、agentdev-gh-cli 差し替え、unlink/relink）を使用し、
      移行前の旧語彙（ローカル版生成方式、変換プロンプト、生成時ソース領域）を含まないこと。
      詳細な対象ファイル一覧および旧語彙と新語彙の対応表は実装 Issue の完了条件で扱い、
      本要件行に混入しないこと。

  - id: AG-004
    content: |
      docs/requirements/REQ-0141.md は削除済み SPEC（docs/specs/local/local-transform.md）への
      dangling 参照を含まないこと。要件行（REQ-0141-028）の SPEC 参照付記および
      関連 SPEC リストのいずれにおいても local-transform.md への参照を含まないこと。
      要件本文（変換プロンプトとレビュープロンプトは link mode への移行に伴い確定廃止）は
      変更しないこと。

  - id: AG-005
    content: |
      docs/guides/project-docs-and-specs.md に記載する SPEC 説明（patterns.md、document-model.md 等）は
      docs/DOC-MAP.md の現行表現と一致すること。基準文書優先原則（ADR-0103）に従い、
      DOC-MAP.md を正とし、ガイド層での独自表現を維持しないこと。

  - id: AG-006
    content: |
      docs/guides/project-docs-and-specs.md は独自の SPEC 一覧テーブルを維持せず、
      docs/README.md 基盤 SPEC 一覧への参照リンクにより表現すること。
      二重メンテ状態を解消し、docs/README.md を SPEC 一覧の単一情報源とすること
      （REQ-0140-030 の縮退パターンに準拠）。

# artifact_actions: REQ/ADR/SPEC への保存対象を統合
# RU-0001、RU-0007 は既存 REQ（REQ-0144/REQ-0140/REQ-0156）の完了作業であり、
# 新規要件行追加や既存要件行の意味変更を伴わない。REQ 操作なし。
# RU-0006 のみ REQ-0141 UPDATE（dangling 参照修正）を含む。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0141
    source_items: [AG-004]
    content: |
      REQ-0141-028 要件行の修正後（local-transform.md 参照削除）:
      | REQ-0141-028 | 変換プロンプト（`transform/generate.md`）とレビュープロンプト（`transform/review.md`）は link mode への移行に伴い確定廃止し、link mode では使用しないこと |

      関連 SPEC リストの修正後（local-transform.md 削除）:
      - **関連 SPEC**: local-case-file.md、local-generation.md、runtime-package-boundary.md、agentdev-gh-cli.md、workflow-contracts.md

      更新日: 2026-06-28（frontmatter updated フィールド）

# conflict_resolutions: 壁打ちで解消された衝突の記録
# backlog-review で確定済みの方針を整理。後続コマンドは同じ論点を再確認しない。
conflict_resolutions:
  - id: CR-001
    conflict: |
      docs/guides/project-docs-and-specs.md L60/L64 の旧表現を
      DOC-MAP.md 修正後表現へ揃えるか、ガイド層は簡潔さ優先で別表現とするか。
    resolution: |
      ADR-0103（基準文書優先原則）に従い、DOC-MAP.md を正として修正後表現へ揃える。
      ガイド層での独自表現は基準文書との表現ブレを生むため採用しない。

  - id: CR-002
    conflict: |
      docs/guides/project-docs-and-specs.md の SPEC 一覧表（L57-72）と
      docs/README.md 基盤 SPEC 一覧の二重メンテ解消方式。
      テーブル共有化か参照リンク化か。
    resolution: |
      REQ-0140-030（ガイドファイル名列挙を docs/guides/README.md の参照へ縮退）と
      同じパターンを適用し、参照リンク化を採用する。
      docs/README.md を SPEC 一覧の単一情報源とし、ガイド層は参照を持つに留める。

  - id: CR-003
    conflict: |
      REQ-0141.md 行45、行61 の local-transform.md dangling 参照の処理方式。
      local-generation.md へ更新するか、削除するか。
    resolution: |
      local-transform.md は Phase A（PR #1314）で削除済みであり、後継 SPEC ではない。
      行45 の「（詳細は SPEC local-transform.md）」は削除する（local-generation.md は別概念）。
      行61 の関連 SPEC リストから local-transform.md を削除する。
      local-generation.md は既にリストに含まれるため追加しない。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0006
    target_req: REQ-0141
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-0001
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-0007
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法
# on_failure を持たない検証項目は含めない（REQ-0102-075）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      /repo/docs-check（scripts/check_integrity.ts）を実行し、
      case-close.md に対する command-capture-duty ルールの NG 件数を確認する。
    pass_criteria: |
      case-close.md に対する command-capture-duty ルールの NG 件数が 0 件であること。
    on_failure: |
      fix-and-reverify。
      duty キーワードの追加漏れ、誤追加、typo のいずれかが原因のため、
      case-close.md を修正して docs-check を再実行する。

  - id: TS-002
    target_item: AG-002
    verification: |
      /repo/docs-check を実行し、agentdev-inspect-skills SKILL.md に対する
      reference-path-existence ルールの NG 件数を確認する。
      あわせて当該行が src/opencode/skills/agentdev-gh-cli/references/contracts.md の
      実パスへ解決できることを確認する。
    pass_criteria: |
      agentdev-inspect-skills SKILL.md に対する reference-path-existence ルールの NG 件数が 0 件であり、
      参照先が実在ファイルへ解決できること。
    on_failure: |
      fix-and-reverify。
      参照パスの誤り（相対パス解決失敗、typo）が原因のため、
      明示パスへ修正して docs-check を再実行する。

  - id: TS-003
    target_item: AG-003
    verification: |
      対象文書群（docs/DOC-MAP.md、docs/guides/local-generation.md、docs/adr/ADR-0131.md、
      docs/adr/ADR-0126.md、docs/specs/integrity/rule-ownership.md、docs/specs/README.md、
      docs/requirements/README.md、docs/requirements/REQ-0141.md、docs/guides/glossary.md、
      docs/specs/integrity/integrity-rule-catalog.md、docs/guides/consumer-project-setup.md、
      src/opencode-local/README.md）に対し、
      旧語彙（ローカル版生成方式、変換プロンプト、生成時ソース領域）を grep する。
    pass_criteria: |
      旧語彙の grep ヒット数が 0 件であること。
      ただし歴史経緯の説明文脈（移行前後の対比等）で意図的に旧語彙を引用する場合は、
      引用であることが明示されていれば許容する。
    on_failure: |
      fix-and-reverify。
      旧語彙の置換漏れが原因のため、現行語彙へ置換して再 grep する。
      意図的な引用でない限り、全ての旧語彙を置換する。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/requirements/REQ-0141.md を読み込み、
      「local-transform.md」の出現を grep する。
    pass_criteria: |
      docs/requirements/REQ-0141.md 内の「local-transform.md」出現数が 0 件であること。
    on_failure: |
      fix-and-reverify。
      dangling 参照の削除漏れが原因のため、REQ-0141.md を修正して再 grep する。

  - id: TS-005
    target_item: AG-005
    verification: |
      docs/guides/project-docs-and-specs.md の SPEC 説明（patterns.md、document-model.md 等）と
      docs/DOC-MAP.md の現行表現を比較する。
    pass_criteria: |
      両者の SPEC 説明表現が一致すること。
      ガイド層での独自表現（基準文書と異なる語彙や粒度）が存在しないこと。
    on_failure: |
      fix-and-reverify。
      DOC-MAP.md を正として project-docs-and-specs.md の表現を修正し、再比較する。

  - id: TS-006
    target_item: AG-006
    verification: |
      docs/guides/project-docs-and-specs.md に独自の SPEC 一覧テーブル（HTML table または
      Markdown table 形式の SPEC エントリ一覧）が存在しないことを確認する。
      あわせて docs/README.md 基盤 SPEC 一覧への参照リンクが存在することを確認する。
    pass_criteria: |
      project-docs-and-specs.md 内に独自の SPEC 一覧テーブルが存在せず（0 件）、
      docs/README.md 基盤 SPEC 一覧への参照リンクが 1 件以上存在すること。
    on_failure: |
      fix-and-reverify。
      二重メンテ状態の解消漏れが原因のため、
      独自テーブルを削除し参照リンクへ置換して再確認する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

3 RU（RU-0001、RU-0006、RU-0007）を「docs-check NG 是正・SPEC 再構成追随の機械的修正」という共通関心領域で統合した。

RU-0001 は REQ-0144-015（安定 NG 0 件）および REQ-0144-019（command-capture-duty 根因特定）の完了作業であり、REQ-0144 への新規要件行追加は行わない。RU-0007 は REQ-0140-026（docs 配下の文書品質準拠）および REQ-0140-030（参照縮退パターン）の完了作業であり、REQ-0140 への新規要件行追加は行わない。RU-0006 は REQ-0141 の local-transform.md dangling 参照修正を含むため、REQ-0141 UPDATE（ACT-REQ-001）を要する。

CR-001、CR-002、CR-003 は backlog-review の evidence-first 解決により確定済みの方針（ADR-0103 基準文書優先原則、REQ-0140-030 縮退パターン、Phase A 削除済み SPEC の後継不存在）に基づく。後続コマンドは同じ論点を再確認しない。
