---
draft_type: req_draft
topic_slug: config-yaml-removal
status: saved
created_at: 2026-07-05T00:30:00Z
source_rus: [RU-0001]
---

<!-- req_draft: config.yaml および旧 doc-inputs 機構定義の完全削除。
  原本は # draft-data 内の YAML ブロック。後続 req-save が消費する。 -->

# draft-data

```yaml
# work_type: maintenance（文書削除・整理作業。bugfix/feature ではなく、新規アーキテクチャ決定ではない）
work_type: maintenance

# scale: maintenance は scale 未設定（template 契約: feature のみ standard/large）

summary: >-
  config.yaml および旧 doc-inputs 機構を定義した文書群（ADR-0133, REQ-0157, project-doc-inputs.md）を
  完全削除し、docs/ 配下13ファイルから関連参照を除去する。config.yaml は一度も現行運用されず
  要件が消滅したため、消滅した要件の記述削除として扱う。履歴保持規約からの例外的扱いとする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      config.yaml および旧 doc-inputs 機構定義文書（ADR-0133, REQ-0157, project-doc-inputs.md）を
      完全削除する。これらは一度も現行運用されず、ADR-0135 project extensions 機構へ完全移行済み
      （Issue #1406）の遺物であり、要件が消滅している。本作業は「config.yaml を削除するという
      新規要件の追加」ではなく「消滅した要件の記述完全削除」である。
  - id: AG-002
    content: >-
      docs/ 配下13ファイル（docs/README.md, docs/adr/README.md, docs/adr/ADR-0110.md,
      docs/adr/ADR-0135.md, docs/requirements/README.md, docs/requirements/mapping-table.md,
      docs/requirements/REQ-0103.md, docs/requirements/REQ-0158.md, docs/requirements/REQ-0160.md,
      docs/requirements/retired/README.md, docs/DOC-MAP.md, docs/specs/integrity/rule-ownership.md,
      docs/specs/integrity/rules/IR-056-project-extensions-integrity.md）から
      config.yaml/ADR-0133/REQ-0157/project-doc-inputs への全参照を削除する。ADR-0135 は
      ADR-0133 への全言及（supersedes フィールド含む）を削除し、背景を standalone 動機
      （プロジェクト固有参照混入問題）へ書き換える。
  - id: AG-003
    content: >-
      スコープ外事項（残置）: .agentdev/doc-inputs/** パス参照（REQ-0103-162）、
      inspect-doc-inputs 旧コマンド名（docs/DOC-MAP.md:115, docs/specs/README.md:89,
      docs/specs/commands/inspect-extensions.md:13）、REQ-0158:148 doc_inputs_check_required
      フィールド、src/ 配下（config.yaml 参照0件のため）は触らない。
  - id: AG-004
    content: >-
      履歴保持規約（docs/README.md:5「削除せず」、REQ-0101-002、REQ-0041-001、REQ-0004-059）
      からの例外的扱いを REQ-0161 の背景に明記する。理由: config.yaml は一度も現行運用されず、
      ADR-0133 accepted→2日で ADR-0135 へ全面置換され、歴史的価値よりも保守コスト
      （デッドファイル・デッド参照の残存）が上回るため。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:config-yaml-removal
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      ---
      id: REQ-0161
      title: config.yaml および旧 doc-inputs 機構定義の完全削除
      created: 2026-07-05
      updated: 2026-07-05
      ---

      # config.yaml および旧 doc-inputs 機構定義の完全削除

      ## 概要

      config.yaml は現行アーキテクチャ（ADR-0135 Project Extensions Architecture）で参照元がなく、旧 doc-inputs 機構（ADR-0133/REQ-0157、superseded/retired 済み）の遺物として孤立するデッドファイルである。要件が消滅したため、config.yaml および旧 doc-inputs 機構を定義した文書群を完全削除し、docs/ 配下から関連参照を全て除去する。

      ## 背景

      本要件は履歴保持規約（docs/README.md:5「削除せず」、REQ-0101-002、REQ-0041-001、REQ-0004-059）からの例外的扱いとする。理由: config.yaml は一度も現行運用されず、ADR-0133 accepted→2日で ADR-0135 へ全面置換され、歴史的価値よりも保守コスト（デッドファイル・デッド参照の残存）が上回るため。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0161-001 | .agentdev/config.yaml, docs/adr/ADR-0133.md, docs/requirements/retired/REQ-0157.md, docs/specs/foundations/project-doc-inputs.md を削除すること |
      | REQ-0161-002 | docs/ 配下から config.yaml, ADR-0133, REQ-0157, project-doc-inputs への全参照を削除すること。ADR-0135 の ADR-0133 全言及（supersedes 含む）を削除し、背景を standalone 動機へ書き換えること |
      | REQ-0161-003 | スコープ外（残置）: .agentdev/doc-inputs/** パス参照、inspect-doc-inputs 旧コマンド名、REQ-0158:148 doc_inputs_check_required フィールド、src/ 配下は変更しないこと |
      | REQ-0161-004 | 削除後の rg "ADR-0133\|REQ-0157\|project-doc-inputs\|config\.yaml" docs/ が 0件であること |
      | REQ-0161-005 | check_integrity.ts と check_extensions.ts が exit 0 であること |

      ## 適用範囲

      ### 対象
      - docs/ 配下の文書削除・編集
      - .agentdev/config.yaml 削除

      ### 対象外
      - src/ 配下
      - .agentdev/doc-inputs/** 参照

      ## 関連情報

      - Related ADRs: ADR-0135（Project Extensions Architecture）
      - Supersedes: なし（REQ-0157 は既に retired）
      - Source RU: RU-0001
  # ADR action は出力しない（Step 6-4: 完全削除そのものを主題とする ADR候補は除外。過去判断の除去は新規ADRではなくretire/supersedeで処理する）
  # SPEC action は出力しない（本作業は文書削除であり SPEC 変更なし）

conflict_resolutions:
  - id: CR-001
    conflict: >-
      削除対象の履歴文書（ADR-0133, REQ-0157）は retired/superseded だが、リポジトリ規約
      （docs/README.md:5 等）が『削除せず履歴保持』を定めている。
    resolution: >-
      REQ-0161 に例外的扱いを明記。config.yaml は一度も現行運用されず、ADR-0133 accepted→2日で
      superseded、歴史的価値 < 保守コストのため例外として完全削除する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-0161
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Test-Path で4ファイル（.agentdev/config.yaml, docs/adr/ADR-0133.md,
      docs/requirements/retired/REQ-0157.md, docs/specs/foundations/project-doc-inputs.md）の
      不存在を確認する。
    pass_criteria: |
      全ファイルが Test-Path で $false を返すこと。
    on_failure: |
      fix-and-reverify: 削除漏れファイルを削除して再確認する。物理削除が前提のため、漏れがあれば
      当該ケースの実装で除去し、再度 Test-Path で検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      rg 'ADR-0133|REQ-0157|project-doc-inputs|config\.yaml' docs/ を実行する。
    pass_criteria: |
      マッチ0件であること。
    on_failure: |
      fix-and-reverify: 残存参照を編集で削除して再確認する。参照残存は REQ-0161-002 違反であり
      例外扱いしないため record-in-findings は不適切。
  - id: TS-003
    target_item: AG-002
    verification: |
      bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts および
      bun run .opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts を実行する。
    pass_criteria: |
      両スクリプトが exit 0 で終了すること。
    on_failure: |
      fix-and-reverify: check_integrity.ts の実在性チェック（行1533/1560/3103）が検出した
      デッド参照を編集で削除して再確認する。integrity 違反は本要件の完了条件（REQ-0161-005）の
      一部であるため、発見事項記録ではなく実装修正で解消する。

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

config.yaml（一度も現行運用されず ADR-0135 project extensions へ完全移行済み）と、旧 doc-inputs 機構を定義した文書群（ADR-0133, REQ-0157, project-doc-inputs.md）を完全削除し、docs/ 配下13ファイルから関連参照を除去する要件。消滅した要件の記述削除として扱い、履歴保持規約からの例外理由を REQ-0161 背景に明記する。src/ 配下と .agentdev/doc-inputs/** 系の残置項目はスコープ外。
