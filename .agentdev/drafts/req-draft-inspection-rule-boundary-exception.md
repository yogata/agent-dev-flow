---
draft_type: req_draft
topic_slug: inspection-rule-boundary-exception
status: draft
created_at: 2026-07-23T09:46:17+09:00
source_rus: [RU-0020, RU-0022]
agentdev_handoff: true
---

# draft-data

```yaml
spec_actions_consumed: true
work_type: bugfix
scale: standard

summary: |
  C5（検査ルール・境界例外）は、2件の RU を検査例外の適用是正へ集約する。
  RU-0020 は ADR-0131 に残留する IR-057 の3件 strict failure を、検査側（targeted guard / full audit）の適用統一と、ファイル冒頭の文書レベル履歴注記認識で解消する。ADR-0131 本文は変更しない。
  RU-0022 は case-auto を固定例外とせず、capture 責務表を起点とした一般規則（直接 capture 責務を持つ command のみ導線を要求）を CaptureBoundary 検査へ適用する。
  いずれも新規の設計判断ではなく、現行 SPEC と既存 ADR-0127、ADR-0131、ADR-0137 の設計意図を検査実装へ反映する是正である。
  検査スクリプト本体の変更は operation_units で扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      IR-057 の「現行ADR履歴記載 exemption」を ADR-0131 の3件 strict failure（line 19「直接生成方式」、line 26 と line 44「transform/generate.md」）へ適用する。
      RU-0020 の選択肢A（例外判定ルール追加）を採用する。
      ADR-0131 本文は変更しない。文書冒頭に歴史的説明であることが既に明示されているため、各行へ履歴マーカーを追加しない。
      適用範囲統一は次の3点から成る。
      第一に、targeted guard（check_changed_docs.ts の checkLegacyVocab）と full audit（check_integrity.ts）が同じ例外規則を使用する。
      第二に、文書レベル履歴注記を決定的判定規則として定義し、frontmatter 終了直後から最初の見出し（`#` または `##`）までの本文を文書レベル履歴注記として扱う。当該本文が存在する ADR ファイルは文書全体が歴史経緯の記録であるとみなす。
      第三に、明示的な履歴注記ブロック（`> 本文書は歴史的経緯を記録する`、`> 本 ADR は移行履歴を保持する` 等の引用ブロック）を認識する。frontmatter 直後本文または明示的履歴注記ブロックのいずれかを持つ ADR ファイルのみ exemption を適用し、行単位の marker 付与を要求しない。
      第四に、文書レベル履歴注記を持たない ADR ファイルは、検出行が履歴マーカー（`旧`、`移行前`、`廃止`、`前提`、`historical`、`legacy`、`deprecated`）を含む場合のみ免除する。現行機能記述は検出対象とする。判定は固定の語彙リストのみに依存せず、文書レベル注記、行レベル marker、周辺文脈で行う。
      正例（文書レベル履歴注記を持つ ADR）、負例（現行機能記述を持つ文書）、境界例（frontmatter 直後の本文が短い/長い、明示的注記の有無）を含む回帰テストを追加する。

  - id: AG-002
    content: |
      CaptureBoundary 検査（check_integrity.ts の command-capture-duty）は、capture 責務表（capture-boundaries SPEC）を起点とした一般規則で例外を判定する。
      RU-0022 の選択肢2（検査例外規則の追加）を採用する。case-auto だけを固定例外として追加しない。
      一般規則は次のとおり。直接 capture 責務を持つ command（表で intake または learning のいずれかに具体的責務記述を持つ）は、必要な capture 導線を持つ。「各工程の責務を継承」または「非関与」と定義された command は、直接 capture 導線を要求しない。
      例外の根拠は capture-boundaries SPEC の capture 責務表である。同表は case-auto の intake、learning ともに「各工程の責務を継承」と定義し、case-auto 自身は inbox、inbox.md の直接生成を行わない設計を示す。
      ADR-0127（case-auto 構成工程の委譲）と ADR-0137（case-run インライン実行）が、case-auto を委譲起点とする現行設計を裏付ける。
      例外登録は、capture-boundaries SPEC の capture 責務表へ判定規則を明示し、CaptureBoundary 検査が当該規則と責務表を参照して例外を導出する形で行う。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
    target_area: "## 例外登録（現行ADRの履歴記載）"
    source_items: [AG-001]
    content: |
      ## 例外登録（現行ADRの履歴記載）

      現行 ADR（`docs/adr/ADR-*.md`、retired を除く）が移行経緯を説明するために旧SPEC直下パス、廃止語彙を記載する場合は exemption とする。`check_integrity.ts`（full audit）と `check_changed_docs.ts`（targeted guard の `checkLegacyVocab`、`checkObsoleteSpecPath`）は同じ例外規則を使用する。`superseded` ADR は後継 ADR へ置き換えられた履歴文書であり、旧パス、廃止語彙を含むことが前提であるため免除対象に含める。

      免除対象は frontmatter `status` が `accepted` または `superseded` であり、かつ次の文書レベル履歴注記条件をいずれか満たす ADR ファイルである。

      第一の条件は frontmatter 終了直後から最初の見出し（`#` または `##`）までの本文が存在することである。当該本文は文書レベル履歴注記として扱い、文書全体が歴史経緯の記録であるとみなす。

      第二の条件は明示的な履歴注記ブロックが存在することである。`> 本文書は歴史的経緯を記録する`、`> 本 ADR は移行履歴を保持する` 等の引用ブロック形式で、文書全体が歴史経緯の記録であることを示す注記を認識する。

      これらの文書レベル履歴注記条件を満たす ADR ファイルは、検出行への履歴マーカー付与を要求せず免除する。

      文書レベル履歴注記条件を満たさない ADR ファイルは、検出行が履歴マーカー（`旧`、`移行前`、`廃止`、`前提`、`historical`、`legacy`、`deprecated`）を含む場合のみ免除する。現行機能の記述は検出対象とする。判定は固定の語彙リストのみに依存せず、文書レベル注記、行レベル marker、周辺文脈で行う。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/workflows/capture-boundaries.md
    target_area: "## 各コマンドの capture 責務"
    source_items: [AG-002]
    content: |
      ## 各コマンドの capture 責務

      | コマンド | intake | learning | 備考 |
      |---|---|---|---|
      | req-define | 非関与 | 非関与 | - |
      | req-save | REQ再構成 intake（`.agentdev/intake/inbox/req-restructure/`）のみ生成可能 | 非関与 | 例外のみ許可 |
      | spec-save | 非関与 | 非関与 | - |
      | case-open | 非関与 | 非関与 | - |
      | case-run | PR 本文記録のみ（直接 inbox 変更禁止） | PR 本文記録のみ（直接 inbox.md 変更禁止） | 実行担当サブエージェント経由 |
      | case-close | PR 本文から回収し inbox へ保存 | PR 本文から回収し inbox.md へ保存 | Epic 横断回収含む |
      | case-auto | 各工程の責務を継承 | 各工程の責務を継承 | - |
      | case-update | 非関与 | 非関与 | REQ 更新、レビュー NG コメント、Issue 本文更新のみ |
      | intake-* | 各コマンド責務（各 command SPEC 参照） | - | - |
      | learning-promote | - | 各コマンド責務（command SPEC 参照） | - |
      | inspect-* | 各コマンド責務（各 command SPEC 参照） | - | - |
      | backlog-review | 非関与 | 非関与 | RU 生成のみ |

      詳細は各 command SPEC を参照。

      ### CaptureBoundary 検査の例外判定規則

      CaptureBoundary 検査（`check_integrity.ts` の `command-capture-duty`）は、上記 capture 責務表を起点とした一般規則で例外を判定する。command ごとの固定例外リストは持たない。

      判定規則は次のとおり。

      - capture 責務表の intake または learning 列が「各工程の責務を継承」または「非関与」と定義する command は、`capture-boundaries` 参照を個別に持たなくても CaptureBoundary 検査の検出対象としない。
      - capture 責務表の intake または learning 列が具体的な責務記述（PR 本文記録、回収、REQ再構成 intake 生成等）である command は、`capture-boundaries` 参照を個別に持ち、対応する capture 導線を実装する。

      例外の根拠は本 capture 責務表である。同表は case-auto の intake、learning をともに「各工程の責務を継承」と定義し、case-auto 自身は inbox、inbox.md の直接生成を行わない設計を示す。ADR-0127（case-auto 構成工程の委譲）と ADR-0137（case-run インライン実行）が、case-auto を統合委譲起点とする現行設計を裏付ける。

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0020 は選択肢A（例外ルール追加）、選択肢B（ADR-0131 表現工夫）、選択肢C（現状維持）の3候補を挙げる。
      ADR-0131 文書冒頭に歴史的説明が既に明示されているか、個別行の marker 追記が必要か。
    resolution: |
      選択肢A を採用する。ただし ADR-0131 本文は変更しない。
      ADR-0131 文書冒頭に歴史的説明であることが既に明示されているため、個別行への marker 追記は過剰と判断した。
      代わりに IR-057 検査側でファイルレベルの文書履歴注記を認識し、文書全体が歴史経緯であることを示す注記を持つ ADR を免除する。
      ACT-ADR-001（ADR-0131 marker 追記）は削除し、ADR UPDATE 操作は発生しない。新規 ADR も不要である。

  - id: CR-002
    conflict: |
      RU-0022 は選択肢1（参照追加）、選択肢2（検査例外規則追加）、選択肢3（設計見直し）の3候補を挙げる。
      case-auto を固定例外とするか、一般規則で扱うか。
    resolution: |
      選択肢2 を採用する。ただし case-auto だけを固定例外として追加しない。
      capture-boundaries SPEC の capture 責務表が case-auto を「各工程の責務を継承」と定義していることを起点に、一般規則（直接 capture 責務を持つ command のみ導線を要求、継承・非関与は要求しない）を定める。
      ADR-0127 と ADR-0137 が case-auto を統合委譲起点とする現行設計を裏付ける。
      選択肢3 が想定する新規 ADR は、現行 SPEC と既存 ADR 群で設計意図が示されているため不要とする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0020
    target_spec:
      operation: update
      domain: integrity
      slug: IR-057-obsolete-spec-path-after-domain-split
    target_artifacts:
      - docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

  - ou_id: OU-002
    source_ru: RU-0022
    target_spec:
      operation: update
      domain: workflows
      slug: capture-boundaries
    target_artifacts:
      - docs/specs/workflows/capture-boundaries.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      ADR-0131 の該当3行（line 19「直接生成方式」、line 26 と line 44「transform/generate.md」）を含む docs/adr/ 配下に対し、check_integrity.ts（full audit）と check_changed_docs.ts --workflow case-close（targeted guard）を実行する。
      正例、負例、境界例を含む回帰テストデータを fixture として用意し、両スクリプトが同一データで検証する。
      正例は文書レベル履歴注記を持つ ADR である。frontmatter 直後から最初の見出しまでに履歴注記本文を持つ形式と、`>` 引用ブロックで明示的履歴注記を持つ形式の2種を含める。ADR-0131 を正例の代表とし、frontmatter 後本文パターンと `>` 注記ブロックパターンの両方を含める。
      負例は現行機能の記述を含む制御用ファイル（exemption 表に登録されていない command 本文、skill 本文等で旧語彙、旧パスを現行機能の用語として使用するもの）である。
      境界例は frontmatter 直後の本文が短い（1行の注記）場合、長い（複数段落の注記）場合、明示的注記ブロックありの場合、注記なしの場合を含める。
    pass_criteria: |
      正例（文書レベル履歴注記を持つ ADR）の旧語彙、旧パスは両スクリプトで strict failure として報告されない。ADR-0131 の3件（直接生成方式、transform/generate.md の引用）が含まれる。
      負例（現行機能の記述）の旧語彙、旧パスは従来どおり strict failure として報告される。
      境界例は文書レベル履歴注記の有無で exemption 判定が正しく切り替わる。frontmatter 直後本文が短い場合も長い場合も文書レベル注記として認識し、注記なしの場合は行レベル marker のみで判定する。
      full audit と targeted guard で exemption 判定が一致する。
    on_failure: |
      fix-and-reverify。check_changed_docs.ts または check_integrity.ts 側の exemption 判定、文書レベル履歴注記認識、境界例処理、行レベル marker 認識を修正し、同一 fixture で再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      case-auto.md が capture-boundaries 参照を持たない現行状態で、CaptureBoundary 検査（command-capture-duty）を含む check_integrity.ts を実行する。
      capture 責務表で「各工程の責務を継承」「非関与」と定義された command 群と、具体的 capture 責務を持つ対照コマンド（case-run、case-close 等）を同時に検査する。
    pass_criteria: |
      「各工程の責務を継承」「非関与」と定義された command は capture-boundaries 参照欠落を検出事項として報告されない。
      具体的 capture 責務を持つ対照コマンドで参照欠落が発生した場合は従来どおり検出事項として報告される。
    on_failure: |
      fix-and-reverify。capture 責務表の読取り、一般規則の判定ロジック、または検査実装を修正し、正例と負例の両方で再検証する。

case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  decomposition: |
    C5 は backlog26-rus-integrated Epic の子 Issue 群として扱う。
    OU-001 と OU-002 は check_integrity.ts を共有するが、異なる exemption/判定ロジックを修正するため意味的依存がない。並列実行を許容し、case-run は実装時に git マージ競合に注意する。
    OU-001 は IR-057 SPEC、check_changed_docs.ts、check_integrity.ts を扱う。ADR-0131 は変更しない。
    OU-002 は capture-boundaries SPEC と check_integrity.ts を扱う。
  wave_hints:
    - "Wave 1: OU-001（IR-057 SPEC と検査スクリプト群の適用統一）と OU-002（capture-boundaries SPEC の一般規則化と check_integrity.ts への反映）。意味的依存がないため並列可能。check_integrity.ts を共有するが異なるロジックを修正するため、case-run は実装時にマージ競合に注意する。"
  adr_candidates: |
    該当なし。
    RU-0020 は ADR-0131 を変更せず、IR-057 検査側の適用統一と文書レベル履歴注記認識で対応する。新規 ADR は不要。
    RU-0022 は capture-boundaries SPEC と ADR-0127、ADR-0137 が case-auto を統合委譲起点とする設計を既に示しており、一般規則化は現行設計の検査実装への反映である。

review_dispositions:
  - id: RD-001
    source_ru: RU-0020
    source_item: ACT-ADR-001
    disposition: rejected
    reason_code: superseded_by_alternative
    evidence:
      - path: docs/adr/ADR-0131.md
        section: frontmatter 直後の明示的履歴注記ブロック（line 11）
        checked_at_commit: null
      - path: docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md
        section: "## 例外登録（現行ADRの履歴記載）"
        checked_at_commit: null
    reason: |
      ACT-ADR-001 は ADR-0131 の検出行へ履歴 marker を追記する旧候補 action であり、本 draft では採用しない。
      ADR-0131 文書冒頭に歴史的説明が既に明示されており、個別行への marker 追記は過剰。
      ファイルレベルの文書履歴注記認識で代替する。ADR 本文は変更しない。
    related_removed_items: []
```

# summary

C5 は検査ルールの例外適用是正と境界例外の一般規則化を扱う2件の RU を、現行 SPEC と既存 ADR の設計意図を検査実装へ反映する要件ドラフトである。

RU-0020 は ADR-0131 の IR-057 strict failure 3件を、検査側の適用統一と文書レベル履歴注記認識で解消する。選択肢A を採用するが ADR-0131 本文は変更せず、ファイルレベル履歴注記認識で代替する。

RU-0022 は case-auto を固定例外とせず、capture 責務表を起点とした一般規則（直接 capture 責務を持つ command のみ導線を要求、継承・非関与は要求しない）で扱う。選択肢2 を採用する。capture-boundaries SPEC と ADR-0127、ADR-0137 が設計意図を既に示しているため、新規 ADR は不要である。

クラスタ全体の work_type は bugfix、scale は standard とする。両 RU とも検査の false positive 解消が主目的であり、新規機能の追加ではない。

OU-001 と OU-002 は check_integrity.ts を共有するが、異なる exemption/判定ロジックを修正するため意味的依存がなく、並列実行を許容する。case-run は実装時に git マージ競合に注意する。
