---
draft_type: req_draft
topic_slug: terminology-design-pr-and-implementation-pr
status: draft
created_at: 2026-10-06T09:20:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: |-
  ADF 文書全体で使用している正式名称「Definition PR」「Definition Amendment PR」を「設計PR」「設計修正PR」へ、「実装 PR」等の揺れ表記を「実装PR」へ一括是正する。日本語文書内の裸の英単語混在を解消する REQ-094 表層是正であり、ブランチ名（definition/issue-{N}、feature/issue-{N}、definition-amend/issue-{N}）、コマンド名、識別子、過去 Issue/PR 本文・実行ログ等の履歴事実（REQ-094-006、REQ-083-003、REQ-094-010）は変更しない。REQ-083-003 が定義する現行名称の定義行を書き換え、プロジェクト用語 prh 辞書へ「Definition PR→設計PR」「Definition Amendment PR→設計修正PR」の固定置換を登録して恒久化する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      名称の確定: 「Definition PR」を「設計PR」、「Definition Amendment PR」を「設計修正PR」へ置換する。既存の「実装 PR」「実装PR」等の表記揺れは「実装PR」へ統一する。初出の文書には「設計PR（REQ 行・Decision・Design 等 docs 永続文書の定義変更を main へ取り込む PR。識別子としてのブランチ名 definition/issue-{N} は維持）」の形式で、正式名称の併記と意味説明を添える（REQ-094-007 形）。
  - id: AG-002
    content: |-
      置換対象は src/**/*.md と docs/**/*.md の現行文書（Command、Skill SKILL.md・references、REQ、Decision、Design、README 等）とする。実測計上: 「Definition PR」53 ファイル・210 箇所（2026-10-06 時点、grep 実測）。code fence 内の YAML 例（artifact: decision の content 等）で正式名称を履歴事実として保持する必要がある箇所は文脈判断で除外する。
  - id: AG-003
    content: |-
      変更禁止対象: ブランチ名・worktree 名の識別子（definition/issue-{N} 等。REQ-094-006）、過去の Issue・PR 本文、実行ログ、capture 記録、learning、retired 文書に含まれる履歴事実の記述（REQ-083-003・REQ-094-010）、ADF-COVERS 等の宣言タグ。git 履歴・コミットメッセージは書き換えない。
  - id: AG-004
    content: |-
      REQ-083-002・REQ-083-003 の行文言を更新する。REQ-083-002 はブランチ命名の正規所有記述を現行どおり維持しつつ名称参照を「設計PR」へ、REQ-083-003 は現行名称の定義を「設計PR」「設計修正PR」へ書き換える。履歴成果物の旧表現を書き換えない旨の条項は維持する。
  - id: AG-005
    content: |-
      プロジェクト用語 prh 辞書（agentdev-textlint-guard plugin）へ「Definition PR→設計PR」「Definition Amendment PR→設計修正PR」「実装 PR→実装PR」を固定置換として登録する。文脈によって意味の変わらない安全な表現であるため REQ-094-009 の固定置換条件を満たす。コード fence・識別子は prh の除外設定に従う。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-083.md
    source_items: [AG-004]
    content: |
      | REQ-083-002 | 設計系ブランチの命名（設計PR: definition/issue-{N}、設計修正PR: definition-amend/issue-{N}）は case-open / case-ready Design が正規所有し、実装系ブランチ（feature/issue-{N}）との名前空間の区別を維持すること |
      | REQ-083-003 | 対象成果物の現行名称は「設計PR」「設計修正PR」とし、「Draft Definition PR」を現行の状態名・成果物名として使用しないこと。過去の RU、learning、intake、Issue、Pull Request 本文、実行ログ等の履歴成果物の旧表現を書き換えないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: 用語政策
    source_items: [AG-005]
    content: |
      設計PR・設計修正PR・実装PR の語彙管理: 「Definition PR」は「設計PR」へ、「Definition Amendment PR」は「設計修正PR」へ、「実装 PR」等の揺れは「実装PR」へ統一する。ブランチ名・worktree 名の識別子（definition/issue-{N} 等）と履歴成果物の旧表現は置換対象外とする。prh 固定置換として登録済みである。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    target_req:
      - docs/requirements/REQ-083.md
    target_design:
      - docs/designs/responsibilities/document-type-responsibilities.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      git grep -c "Definition PR" -- "src/**/*.md" "docs/**/*.md" を実行し、残存箇所を列挙する。残存が確認された場合は、各残存が AG-003 の変更禁止対象（履歴事実・code fence 内の履歴例示）に該当するかを文書種別と前後関係で判定する。
    pass_criteria: |
      変更禁止対象として正当化できない残存の「Definition PR」「Definition Amendment PR」が 0 件であること。
    on_failure: |
      fix-and-reverify。正当化できない残存を置換して再検証する。
  - id: TS-002
    target_item: AG-005
    verification: |
      prh 辞書登録後、agentdev-textlint-guard の検査を/docs 配下の代表サンプルと src 配下の代表サンプルで実行する。
    pass_criteria: |
      prh 規則がロードされ、「Definition PR」表記に対して置換候補が提示されること。識別子・code fence が誤検知しないこと。
    on_failure: |
      fix-and-reverify。prh ルールのパターンを修正して再検証する。

realization_actions: []

review_dispositions: []

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

「Definition PR」系用語の日本語名称（設計PR・設計修正PR・実装PR）への統一と恒久化。表層是正のためワークフロー契約の意味は変更しない。並行して起案する設計側 worktree・ブランチ削除工程の追加ケースとは独立に適用できるが、同時マージ時のコンフリクト回避のため文書修正ケースを先にマージすることが望ましい。
