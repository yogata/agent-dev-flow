---
draft_type: req_draft
topic_slug: skill-frontmatter-backticks-removal
status: saved
created_at: 2026-06-29T00:00:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: |
  PR #1334（commit ad086200, 2026-06-28）の機械横断是正で、src/opencode/skills/agentdev-*/SKILL.md
  計27ファイルの frontmatter `name:` 行にバッククォートが付与された。YAML frontmatter は
  構造データであり Markdown インラインコード表記の対象外であるため、opencode がスキル名を
  `` `agentdev-xxx` `` として誤認する不具合を引き起こしている。本 draft は frontmatter の
  バッククォート除去（主目的）と、混入経路となった REQ-0140/REQ-0153/ SPEC の適用対象明確化、
  および inspect-skills/skill-authoring による再発防止を実装詳細として定義する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      src/opencode/skills/agentdev-*/SKILL.md 計27ファイルの frontmatter `name:` 行から
      バッククォートを除去し、YAML スカラー値（`name: agentdev-xxx` 形式）へ修正する。
      修正対象は frontmatter 2行目の `name:` 行のみ。
      agentdev-skill-authoring/SKILL.md の 322行・332行は ```yaml コードブロック内の
      テンプレート例示（`name: [verb]-[noun]`、`name: [kebab-case-name]`）であり、
      バッククォートも付いていないため対象外。
      src/opencode-local/agentdev-gh-cli/SKILL.md は既に正しい形式（バッククォートなし）のため対象外。
      .opencode/skills/agentdev-*/ は src/opencode/skills/ へのジャンクションであるため、
      原本側の修正で配布先も同時に反映される。
  - id: AG-002
    content: |
      REQ-0140 を UPDATE し、文書品質ゲートの対象が「自然言語記述（Markdown 本文）」であり、
      YAML frontmatter、code block 内字句等の構造データを含まないことを明記する。
      対象要件行: REQ-0140-002（文書品質ゲート対象）、REQ-0140-026（自然言語記述の準拠）。
      明確化内容: 「自然言語記述」とは Markdown 本文（見出し、段落、リスト、表のセル内容等）を指し、
      YAML frontmatter のキーや値、 fenced code block 内字句、URL、ファイルパス等の構造データは
      文書品質ゲートの backticks 対象外であること。
  - id: AG-003
    content: |
      REQ-0153 を UPDATE し、機械横断是正の完了証拠（再 grep 結果 0 件）が、
      意味論的に正しい置換対象範囲（自然言語記述）での 0 件であることを必須とする。
      対象要件行: REQ-0153-001（再 grep 0 件の完了証拠）、REQ-0153-002（PR 本文記載）。
      明確化内容: 構造データ（YAML frontmatter、code block 内字句等）への誤付与による
      「0 件」は完了証拠として無効であること。置換対象範囲の妥当性を PR 本文で併記すること。
  - id: AG-004
    content: |
      docs/specs/integrity/backticks-identifier-threshold.md を UPDATE し、
      本 SPEC の適用対象が docs/** 配下の自然言語記述（Markdown 本文）のみであり、
      YAML frontmatter および fenced code block 内字句は backticks 機械付与対象から
      除外することを明記する。現状の12行目「docs/** 配下の自然言語記述において」は
      存在するが、src/opencode/{commands,skills}/** の frontmatter が誤って機械付与対象に
      取り込まれた事例（PR #1334）を踏まえ、対象外範囲を明示的に列挙する。
  - id: AG-005
    content: |
      agentdev-inspect-skills skill の診断基準へ、frontmatter `name:` フィールドの
      バッククォート検出を追加する。REQ-0125-003（Skill frontmatter 整合）および
      REQ-0125-004（agentdev-inspect-skills skill への詳細基準集約）に基づく診断観点の
      詳細化であり、REQ 行の新規追加ではない。IR-007（skill-name-dir-match）との協調:
      バッククォート付き name は ディレクトリ名と不一致となるため strict 違反候補として検出する。
  - id: AG-006
    content: |
      agentdev-skill-authoring skill のオーサリングガイドへ、frontmatter `name:` は
      YAML スカラー値でありバッククォートで囲まないことを明記する。
      現状のオーサリングガイド（SKILL.md 315-339行のテンプレート例示）ではバッククォートなしの
      正例のみ示されているが、禁止規定が明示されていなかったため、実装詳細として追記する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0140
    source_items: [AG-002]
    content: |
      REQ-0140-002 と REQ-0140-026 を以下の通り明確化する。

      REQ-0140-002（変更後）:
        文書品質ゲートはdocs配下の文書、REQ、ADR、SPEC、guides、DOC-MAP、README、
        およびdocsを生成、編集するcommand/skillの自然言語記述（Markdown 本文）を対象とすること。
        文書種別責務、要件性、文意品質、粒度の査読を含むこと。
        「自然言語記述」とは Markdown 本文（見出し、段落、リスト、表のセル内容等）を指し、
        YAML frontmatter のキー・値、fenced code block 内字句、URL、ファイルパス等の
        構造データは backticks 機械付与対象外とする。

      REQ-0140-026（変更後）:
        docs/**（docs/requirements/retired/REQ-*.md を除く）、 AGENTS.md 、
        src/opencode/{commands,skills} の自然言語記述（Markdown 本文）は、現行の文書種別責務、
        配置基準（docs/specs/document-type-responsibilities.md）と AGENTS.md 経由の
        japanese-tech-writing（執筆規範）の全査読観点に準拠して修正すること。
        個別用語の正誤表は agentdev-doc-writing スキルの参照資料で管理し、本要件行に埋め込まないこと。
        なお YAML frontmatter、fenced code block 内字句等の構造データは backticks 機械付与対象外であり、
        文書品質ゲートの横断是正でこれらに backticks を付与してはならない（PR #1334 事例）。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0153
    source_items: [AG-003]
    content: |
      REQ-0153-001 と REQ-0153-002 を以下の通り明確化する。

      REQ-0153-001（変更後）:
        case-run は機械的テキスト置換または複数ディレクトリ横断の是正を含む PR について、
        置換対象パターンの再 grep 結果が 0 件であることを完了証拠とすること。
        ただし「0 件」は意味論的に正しい置換対象範囲（自然言語記述）での 0 件を指し、
        構造データ（YAML frontmatter、fenced code block 内字句等）への誤付与による 0 件は
        完了証拠として無効とする（PR #1334 事例）。

      REQ-0153-002（変更後）:
        case-run は機械横断是正の完了証拠（再 grep 結果 0 件）を PR 本文に記載すること。
        併せて置換対象範囲の妥当性（構造データが誤って置換対象に含まれていないこと）を
        PR 本文で証明すること。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/backticks-identifier-threshold.md
    target_area: "## 目的"
    source_items: [AG-004]
    content: |
      ## 目的

      docs/** 配下の自然言語記述（Markdown 本文）において、識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を機械判定可能な形で定義する（#1118 X-7）。
      runtime-package-boundary.md「5 種のリポジトリ種別」表の Type ID 列（識別子は backticks、名称は日本語）を良パターン基準とする。

      ### 適用対象外（PR #1334 事例に基づく明示）

      本 SPEC の backticks 機械付与対象は自然言語記述（Markdown 本文）のみであり、以下の構造データは対象外とする。機械横断是正でこれらに backticks を付与してはならない。

      - YAML frontmatter のキーおよび値（`name:`、`description:`、`id:` 等）。frontmatter 値は YAML スカラー値であり、Markdown インラインコード表記ではない。
      - fenced code block（``` ... ```）内の字句。code block 内は既にコード文脈であり、backticks による追加修飾をしない。
      - inline code（`...`）内の字句。既に backticks で囲まれているため二重付与しない。
      - URL、ファイルパスそのもの（リンクテキスト部は自然言語記述として扱う）。

      この対象外範囲は src/opencode/{commands,skills}/**/SKILL.md 等の配布物原本 frontmatter にも適用する。PR #1334 では src/opencode/skills/agentdev-*/SKILL.md の frontmatter `name:` 行に誤って backticks が付与され、opencode がスキル名を不正に認識する不具合を引き起こした。本明示により同種の回帰を防止する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      req-define のガードレール G08（git コマンドは実行しない）と、混入コミット特定の必要性が衝突。
      ユーザーが「どこでこのバグが混入したのか？」を二度にわたり問い合わせ。
    resolution: |
      G08 は「状態を変える git 操作をしない」が本来の意図と解釈し、読み取り系 git コマンド
      （log/blame/diff/show）のみ実行して調査を実施。書き込み系（commit/push/rebase 等）は
      引き続き G08 で禁止。この解釈を CR-001 として記録し、後続コマンドは同内容を再確認しない。

operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-0140
    target_spec: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: null
    target_req: REQ-0153
    target_spec: null
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: null
    target_req: null
    target_spec: docs/specs/integrity/backticks-identifier-threshold.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: null
    target_req: null
    target_spec: null
    operation: implement
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-*/SKILL.md 計27ファイルの frontmatter 2行目を確認。
      正規表現 `^name:\s*[a-z0-9-]+\s*$` に一致すること（バッククォートを含まない）。
      併せて agentdev-skill-authoring/SKILL.md の 322行・332行がコードブロック内のままで
      変更されていないことを確認。src/opencode-local/agentdev-gh-cli/SKILL.md が
      変更されていないことを確認。
    pass_criteria: |
      27ファイル全ての frontmatter `name:` 行が `name: agentdev-xxx` 形式（バッククォートなし）。
      コードブロック内テンプレート例示（322/332行）は変更なし。
      src/opencode-local/agentdev-gh-cli/SKILL.md は変更なし。
    on_failure: |
      fix-and-reverify。バッククォートが残存する場合は再度 edit で除去し再検証。
      322/332行や src/opencode-local を誤って変更した場合は git checkout で戻して再検証。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0140.md の REQ-0140-002 と REQ-0140-026 を確認。
      「自然言語記述（Markdown 本文）」の定義と「YAML frontmatter、code block 内字句等の
      構造データは backticks 機械付与対象外」が明記されていること。
    pass_criteria: |
      REQ-0140-002 と REQ-0140-026 の両行に構造データ除外の記述がある。
      「自然言語記述」が Markdown 本文と定義されている。
    on_failure: |
      fix-and-reverify。記述漏れの場合は req-save の UPDATE 結果を確認し、
      ACT-REQ-001 の content との差分を修正して再保存。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0153.md の REQ-0153-001 と REQ-0153-002 を確認。
      「意味論的に正しい置換対象範囲での 0 件」であることと
      「構造データへの誤付与による 0 件は完了証拠として無効」が明記されていること。
    pass_criteria: |
      REQ-0153-001 に対象範囲の妥当性条件が追記されている。
      REQ-0153-002 に PR 本文での対象範囲妥当性証明が必須とされている。
    on_failure: |
      fix-and-reverify。記述漏れの場合は req-save の UPDATE 結果を確認し、
      ACT-REQ-002 の content との差分を修正して再保存。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/integrity/backticks-identifier-threshold.md の「## 目的」節に
      「### 適用対象外」サブ節が追加されていることを確認。
      YAML frontmatter、fenced code block 内字句、inline code、URL/ファイルパスが
      対象外として列挙されていること。PR #1334 事例への言及があること。
    pass_criteria: |
      「### 適用対象外」節が存在し、4項目（frontmatter、code block、inline code、URL）が列挙。
      PR #1334 の事例言及により回帰防止意図が文書化されている。
    on_failure: |
      fix-and-reverify。spec-save の UPDATE 結果を確認し、ACT-SPEC-001 の content との
      差分を修正して再保存。
  - id: TS-005
    target_item: AG-005
    verification: |
      agentdev-inspect-skills skill（src/opencode/skills/agentdev-inspect-skills/SKILL.md および
      references/）に frontmatter `name:` フィールドのバッククォート検出基準が追加されたことを確認。
      バッククォート付き name を strict 違反候補として検出すること、IR-007 との協調が明記されていること。
      実際にダミーのバッククォート付き name を持つ SKILL.md で検出されることを手動検証。
    pass_criteria: |
      診断基準に frontmatter name バッククォート検出が含まれる。
      ダミー違反ファイルで検出されることが確認済み。
    on_failure: |
      fix-and-reverify。検出基準の記述漏れ、または検出ロジックの不備を修正して再検証。
  - id: TS-006
    target_item: AG-006
    verification: |
      agentdev-skill-authoring skill（src/opencode/skills/agentdev-skill-authoring/SKILL.md）の
      オーサリングガイドに「frontmatter name は YAML スカラー値でありバッククォートで囲まない」
      ことが明記されたことを確認。既存のテンプレート例示（315-339行）と整合すること。
    pass_criteria: |
      オーサリングガイドに frontmatter name バッククォート禁止規定が明記されている。
      テンプレート例示と矛盾しない。
    on_failure: |
      fix-and-reverify。記述漏れまたは既存テンプレートとの矛盾を修正して再検証。

case_open_hints:
  epic_needed: true
  decomposition: |
    4 OU を1 Epic 配下に構成する。Epic 主題: 「PR #1334 で混入した skill frontmatter
    backticks の除去と再発防止」。子 Issue 構成（case-open が最終決定）:
    - Issue A (OU-001): REQ-0140 UPDATE
    - Issue B (OU-002): REQ-0153 UPDATE
    - Issue C (OU-003): docs/specs/integrity/backticks-identifier-threshold.md UPDATE
    - Issue D (OU-004): 実装（frontmatter 27ファイル修正 + inspect-skills/skill-authoring skill UPDATE）
    OU-001/002/003 は REQ/SPEC UPDATE で相互独立、並列実行可。OU-004 は実装作業。
    依存関係は必須依存のみ（REQ-0138-019）。推奨順序は recommended_order 参照。
  wave_hints:
    - wave: 1
      ous: [OU-001, OU-002, OU-003]
      rationale: "REQ/SPEC UPDATE。相互独立、並列実行可。"
    - wave: 2
      ous: [OU-004]
      rationale: "実装作業。Wave 1 の REQ/SPEC 定義を参照するが、必須依存ではない（実装は独立して進行可能）。推奨順序として Wave 1 の後に実施。"
```

# 実装詳細（要件doc保存対象外、case-run 参照用）

<!-- Step 10-1 により artifact_actions の content とは分離。
     合意内容の判読性を確保するため、個別ファイル編集指示をここに集約。 -->

## OU-004 実装詳細: frontmatter 修正対象ファイル（27ファイル）

`src/opencode/skills/agentdev-*/SKILL.md` の frontmatter 2行目を以下の通り修正。

修正前: `` name: `agentdev-xxx` ``
修正後: `name: agentdev-xxx`

対象27ファイル:

1. src/opencode/skills/agentdev-adr-file-manager/SKILL.md
2. src/opencode/skills/agentdev-adr-guidelines/SKILL.md
3. src/opencode/skills/agentdev-architecture-advisory/SKILL.md
4. src/opencode/skills/agentdev-backlog-integration/SKILL.md
5. src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md
6. src/opencode/skills/agentdev-command-authoring/SKILL.md
7. src/opencode/skills/agentdev-command-creator/SKILL.md
8. src/opencode/skills/agentdev-conventional-commits/SKILL.md
9. src/opencode/skills/agentdev-doc-map/SKILL.md
10. src/opencode/skills/agentdev-doc-writing/SKILL.md
11. src/opencode/skills/agentdev-epic-tracker/SKILL.md
12. src/opencode/skills/agentdev-gh-cli/SKILL.md
13. src/opencode/skills/agentdev-git-worktree/SKILL.md
14. src/opencode/skills/agentdev-inspect-skills/SKILL.md
15. src/opencode/skills/agentdev-intake-pipeline/SKILL.md
16. src/opencode/skills/agentdev-issue-management/SKILL.md
17. src/opencode/skills/agentdev-learning-capture/SKILL.md
18. src/opencode/skills/agentdev-learning-pipeline/SKILL.md
19. src/opencode/skills/agentdev-quality-gates/SKILL.md
20. src/opencode/skills/agentdev-req-analysis/SKILL.md
21. src/opencode/skills/agentdev-req-file-manager/SKILL.md
22. src/opencode/skills/agentdev-req-structure-diagnostics/SKILL.md
23. src/opencode/skills/agentdev-skill-authoring/SKILL.md（frontmatter のみ。322/332行は対象外）
24. src/opencode/skills/agentdev-workflow-lifecycle/SKILL.md
25. src/opencode/skills/agentdev-workflow-orchestration/SKILL.md
26. src/opencode/skills/agentdev-workflow-routing/SKILL.md
27. src/opencode/skills/agentdev-workflow-templates/SKILL.md

除外ファイル（修正不要）:
- src/opencode-local/agentdev-gh-cli/SKILL.md（既に正しい形式）
- .opencode/skills/japanese-tech-writing/SKILL.md（実ファイル、バッククォートなし）
- .opencode/skills/repo-agentdev-integrity/SKILL.md（実ファイル、バッククォートなし）
- .opencode/skills/agentdev-*/（src/opencode/skills/ へのジャンクション、原本修正で自動反映）

## OU-004 実装詳細: inspect-skills skill UPDATE

`src/opencode/skills/agentdev-inspect-skills/SKILL.md` および同 references/ に、frontmatter `name:` フィールドのバッククォート検出基準を追加。

追加内容:
- 検出観点: SKILL.md frontmatter `name:` 行がバッククォート（`` ` ``）で囲まれている場合、YAML スカラー値として不正のため strict 違反候補として検出
- 推奨経路: 該当 SKILL.md の frontmatter name からバッククォートを除去（REQ-0125-005 準拠、検出のみで修正は実施しない）
- IR-007 協調: バッククォート付き name は ディレクトリ名と不一致となるため、IR-007（skill-name-dir-match）違反と併発する可能性を明記

## OU-004 実装詳細: skill-authoring skill UPDATE

`src/opencode/skills/agentdev-skill-authoring/SKILL.md` のオーサリングガイドへ frontmatter name 規範を追記。

追記内容:
- frontmatter `name:` は YAML スカラー値であり、バッククォート（Markdown インラインコード）で囲まないこと
- スキル名は識別子として frontmatter ではプレーン文字列、本文中ではバッククォート付きで表記する使い分けを明記
- 既存テンプレート例示（315-339行）は正例のため変更不要、禁止規定を別途明示

# summary

PR #1334（2026-06-28）の機械横断是正で混入した、src/opencode/skills/agentdev-*/SKILL.md 計27ファイルの frontmatter `name:` 行のバッククォートを除去し、再発防止として REQ-0140/REQ-0153/backticks-identifier-threshold.md の適用対象明確化と inspect-skills/skill-authoring skill の基準強化を実施する。

混入経路は git log で特定（commit ad086200、Issue #1333、REQ-0140/REQ-0153 に基づく機械横断是正）。除外ロジックが YAML frontmatter を考慮していなかったことが根本原因。
