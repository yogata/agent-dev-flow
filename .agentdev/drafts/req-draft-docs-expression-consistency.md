---
draft_type: req_draft
topic_slug: docs-expression-consistency
status: draft
created_at: 2026-06-25T09:00:00+09:00
source_rus:
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0013
  - RU-0015
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
# ドラフト全体の支配的性质は maintenance（5 RU 中 4 が是正/診断/辞書補充の実行作業）。
# X-7（OU-001）は新規 SPEC 策定という feature 性質を持つが、SPEC 保存は work_type 非依存で
# artifact_actions の有無で起動する（REQ-0136-021/022）。draft work_type は支配的 majority で maintenance。
work_type: maintenance

# scale: feature のみ standard / large。それ以外は未設定でよい
# maintenance のため未設定。OU-002（X-2）は per-OU で scale: large。

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  docs 表記・表現是正（#1118 残作業 + 辞書補充）として 5 RU を統合する。
  X-7（RU-0005）は backticks 識別子/一般名詞の判定閾値を新規 SPEC として策定し、runtime-package-boundary.md の Type ID 列を良パターン基準とする。
  X-2（RU-0006）は em-dash 本体 370 件/86 ファイルを 7 ディレクトリ単位の PR 分割で查読是正し、各出現箇所で括弧展開/句点分割/ママを判定する（src/opencode-local/ は対象外）。
  AG-008（RU-0007）は inspect-docs を 7 ディレクトリで再実行し X-1〜X-7 全パターンの残存状況を裏付けカタログとして確定する。
  RU-0013 は llm-expression-patterns.md の空 backtick セルを補充または意図明示する。
  RU-0015 は integrity-rule-catalog.md の散文英語候補を網羅的 grep 検証し識別子 vs 散文普通名詞を per-instance 判定のうえ推奨訳語へ置換する。
  X-2 は large（370 件/86 ファイル）で epic 分割を要する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない
agreed_items:
  - id: AG-001
    content: |
      X-7: 識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を、機械判定可能な SPEC として docs/specs/ 配下に新設する。
      runtime-package-boundary.md「5 種のリポジトリ種別」表の Type ID 列（識別子は backticks、名称は日本語）を良パターン基準とする。
      策定した SPEC は mechanical-replacement-rules.md からの相互参照先となり、inspect-docs 検出処理が参照する。
      横断是正（機械置換/查読）は本 SPEC 策定後に別途実施し、本 OU の完結条件には含めない。

  - id: AG-002
    content: |
      X-2: em-dash 本体（同格・補足・言い換えの ` — `）370 件/86 ファイルを、ディレクトリ群（docs/requirements, docs/adr, docs/specs, docs/guides, AGENTS.md, src/opencode/commands, src/opencode/skills）単位の PR に分割し、查読で是正する。
      各出現箇所で mechanical-replacement-rules.md section 2 に従い「括弧展開」「句点分割」「ママ」のいずれかを判定する。コロロン（`:`）置換は行わない。
      src/opencode-local/ は本バッチ（#1118）の対象外とし別途扱う。テーブルセル `| — |`（N/A プレースホルダ）は PR #1122 で機械安全置換済のため本 OU 対象外。

  - id: AG-003
    content: |
      AG-008: inspect-docs を 7 ディレクトリ（docs/requirements, docs/adr, docs/specs, docs/guides, AGENTS.md, src/opencode/commands, src/opencode/skills）で再実行し、X-1〜X-7 全パターンの残存状況を裏付けカタログとして確定する。
      生成された検出事項を .agentdev/inspect/inbox/ へ配置し、各 finding のファイルパス・行番号・件数の裏付けを取る。
      確定した残存状況を AG-010（優先度順是正）の残作業計画への入力とする。

  - id: AG-004
    content: |
      RU-0013: llm-expression-patterns.md（src/opencode/skills/agentdev-doc-writing/references/）の table cells に散見する空 backtick セル（lines 54-59, 65 周辺）を実測確認し、表現パターン名を補充するか、空欄が意図的（N/A 等）なら明示する。
      補充後は mechanical-replacement-rules.md section 3 との対象整合を再確認する。同ファイルは LLM 表現の検出辞書として残るため、セル欠落は検出辞書の網羅性に影響する。

  - id: AG-005
    content: |
      RU-0015: integrity-rule-catalog.md（docs/specs/）の散文英語候補（baseline, provider, variant, fixture 等）を網羅的 grep で抽出し、per-instance で識別子（英語維持正解）vs 散文普通名詞（推奨訳語置換必要）を判定する。
      散文普通名詞と判定されたものを推奨訳語へ置換する。明確な散文インスタンス（IR-026/IR-031 description, L1195）は PR #1084 で既に置換済のため、本 OU は残存インスタンスの網羅検証が主体。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
# maintenance 実行 OU（X-2/AG-008/cells/SUB-D）は REQ/SPEC 新規保存を伴わず、
# 既存ポリシーの実行または既存ファイル修正であるため artifact_actions に含まない。
# X-7（新規 SPEC 策定）のみ SPEC 保存対象。
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: new:backticks-identifier-threshold
    source_items: [AG-001]
    consumed:
      spec_save: true
      consumed_at: 2026-06-25T09:30:00+09:00
      saved_path: docs/specs/backticks-identifier-threshold.md
    content: |
      # backticks 識別子/一般名詞 判定閾値

      ## 目的

      docs/** 配下の自然言語記述において、識別子（backticks 必須）と一般名詞（backticks 任意）の判定閾値を機械判定可能な形で定義する（#1118 X-7）。
      runtime-package-boundary.md「5 種のリポジトリ種別」表の Type ID 列（識別子は backticks、名称は日本語）を良パターン基準とする。

      ## 識別子（backticks 必須）

      以下のいずれかに該当する語句は識別子とし、backticks で囲むことを必須とする。

      - コマンド名、スキル名、ファイル名、ディレクトリパス（`/agentdev/req-define`、`agentdev-doc-writing`、`docs/specs/system.md`）
      - REQ/ADR/SPEC/RU/OU/IR 等の成果物 ID（`REQ-0101`、`ADR-0103`、`RU-0005`）
      - frontmatter キー、YAML フィールド名、enum 値、code block 内字句
      - 英字 kebab-case / snake_case / CamelCase の技術識別子（`self-hosting`、`work_type`、`auto_ready`）

      ## 一般名詞（backticks 任意）

      以下の語句は一般名詞とし、backticks を必須としない。

      - 日本語一般名詞（要件定義、品質ゲート）
      - 和訳済み技術用語で定着したもの（document-type-responsibilities.md 許容リスト参照）
      - 文中の普通名詞としての英語（baseline, provider 等の散文使用は SUB-D 判定対象）

      ## 機械判定閾値

      | 分類 | 機械判定条件 | backticks |
      |---|---|---|
      | 識別子 | 上記識別子条件のいずれかに合致 | 必須 |
      | 一般名詞 | 識別子条件に非合致 | 任意 |

      判定は mechanical-replacement-rules.md の相互参照先として組み込まれ、inspect-docs 検出処理が参照する。
      文脈依存の境界ケース（英字複合語の識別子/普通名詞揺らぎ）は機械判定対象外とし、サンプリング查読へ委譲する。

      ## 関連

      - 用語政策 SSoT: docs/specs/document-type-responsibilities.md
      - 機械判定アルゴリズム: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
      - 良パターン基準: docs/specs/runtime-package-boundary.md「5 種のリポジトリ種別」Type ID 列

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: X-7 の backticks 閾値 SPEC を新設するか、既存 document-type-responsibilities.md へ追記するか。また REQ 行を新設するか。
    resolution: |
      docs/specs/ 配下に新規 SPEC（new:backticks-identifier-threshold）として新設し、document-type-responsibilities.md（用語政策 SSoT）の補完 SPEC とする。
      REQ 行は新設せず、REQ-0140-026 が個別用語政策を skill reference/SPEC で管理することを要求しているため、新 SPEC を同要件の参照先として運用する。
      根拠: REQ-0140-023 が用語政策 SSoT を document-type-responsibilities.md に指定。work_type=maintenance では req-save が起動しないため REQ 新設は過剰であり、SPEC 保存のみで完結する。

  - id: CR-002
    conflict: X-2 対象範囲に src/opencode-local/ を含めるか。
    resolution: |
      src/opencode-local/ は本バッチ（#1118）の対象外とし別途扱う。
      根拠: RU-0006 が 7 ディレクトリスコープ外と明記。370 件/86 ファイル計数は retired・src/opencode-local 含む全件だが、是正実施は docs/requirements, docs/adr, docs/specs, docs/guides, AGENTS.md, src/opencode/commands, src/opencode/skills の 7 ディレクトリに限定する。

  - id: CR-003
    conflict: AG-008 が要求する compliance-catalog-*.md が現行 inspect-docs に出力されない。
    resolution: |
      compliance-catalog-*.md は現行 inspect-docs 出力形式（.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md）へ読み替える。
      根拠: 現行 inspect-docs.md（Step 14）の出力先が inspect-docs-finding 形式であり、compliance-catalog 命名は旧形式。カタログ再生成の意図（X-1〜X-7 残存状況の裏付け取得）は現行コマンド挙動で達成可能。

  - id: CR-004
    conflict: X-2 em-dash 本体を機械置換で処理できるか。
    resolution: |
      機械置換対象外。mechanical-replacement-rules.md section 2 が「本文中 ` — ` は文脈判定が残るため、置換先の選択（括弧か句点か）は查読対象」と明記。
      テーブルセル `| — |` のみ PR #1122 で機械安全置換済（`| - |` へ）。本 OU は查読是正のみを対象とする。

  - id: CR-005
    conflict: OU-002（X-2 em-dash 370件查読）の case-auto 自走可否。文脈判定の品質リスク。
    resolution: |
      Epic構造でcase-auto自走を許可。OU-002 を7ディレクトリ単位の child Issue に分割（issue_policy: epic）、各 child Issue の case-run が per-directory 查読（括弧展開/句点分割/ママの文脈判定）を実施する。品質リスクは以下で軽減する: (1) per-directory batch で查読範囲を限定、(2) QG-3 で查読品質を検証、(3) QG-4 で完了条件（mechanical-replacement-rules.md section 2 検出件数0）を確認。case-auto は Wave orchestration で全5OU（OU-002 epic 含む）を自走する。
    decision_source: user

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    operation: spec-create
    target_spec: new:backticks-identifier-threshold
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      issue: 1164
      issue_url: https://github.com/yogata/agent-dev-flow/issues/1164
      created_at: 2026-06-25T20:53:23+09:00

  - ou_id: OU-002
    source_ru: RU-0006
    operation: update
    scale: large
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result:
      epic: 1169
      epic_url: https://github.com/yogata/agent-dev-flow/issues/1169
      children:
        - seq: 1-1
          wave: 1
          scope: docs/requirements
          issue: 1170
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1170
        - seq: 1-2
          wave: 1
          scope: docs/adr
          issue: 1171
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1171
        - seq: 1-3
          wave: 1
          scope: docs/specs
          issue: 1172
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1172
        - seq: 1-4
          wave: 1
          scope: docs/guides
          issue: 1173
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1173
        - seq: 1-5
          wave: 1
          scope: AGENTS.md
          issue: 1174
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1174
        - seq: 2-1
          wave: 2
          scope: src/opencode/commands
          issue: 1175
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1175
        - seq: 2-2
          wave: 2
          scope: src/opencode/skills
          issue: 1176
          issue_url: https://github.com/yogata/agent-dev-flow/issues/1176
      created_at: 2026-06-25T22:05:00+09:00

  - ou_id: OU-003
    source_ru: RU-0007
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      issue: 1162
      issue_url: https://github.com/yogata/agent-dev-flow/issues/1162
      created_at: 2026-06-25T10:30:00+09:00

  - ou_id: OU-004
    source_ru: RU-0013
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      issue: 1166
      issue_url: https://github.com/yogata/agent-dev-flow/issues/1166
      created_at: 2026-06-25T21:10:00+09:00

  - ou_id: OU-005
    source_ru: RU-0015
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result:
      issue: 1167
      issue_url: https://github.com/yogata/agent-dev-flow/issues/1167
      created_at: 2026-06-25T21:30:00+09:00

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      作成された backticks-identifier-threshold.md SPEC が runtime-package-boundary.md「5 種のリポジトリ種別」表 Type ID 列の識別子パターンを網羅し、機械判定可能な閾値表（識別子/一般名詞/backticks 要否）を含むことを確認する。
      mechanical-replacement-rules.md から当該 SPEC への相互参照が張られていることを確認する。
    pass_criteria: |
      閾値表が識別子（backticks 必須）と一般名詞（backticks 任意）の判定基準を一意に定義し、mechanical-replacement-rules.md または inspect-docs 検出処理が参照可能な形で配置されていること。
    on_failure: |
      fix-and-reverify。SPEC の閾値定義が不十分、または相互参照が欠落する場合は SPEC を補正して再検証する。SPEC 策定は本 OU の完結条件であるため、Findings 記録には退避しない。

  - id: TS-002
    target_item: AG-002
    verification: |
      各ディレクトリ群の PR マージ後、mechanical-replacement-rules.md section 2 の本文 ` — ` 検出アルゴリズム（半角空白挟み ` — ` の行単位検索）を 7 ディレクトリの全対象ファイルへ再適用し、検出件数が 0 件であることを確認する。
    pass_criteria: |
      対象 7 ディレクトリ（src/opencode-local/ 除く）で本文中 ` — ` の検出件数が 0 件であること。テーブルセル `| — |` は PR #1122 で既に対応済のため検証対象外。
    on_failure: |
      fix-and-reverify。残存 ` — ` があれば該当ディレクトリの PR で查読是正（括弧展開/句点分割/ママ）して再検証する。370 件の文脈判定は查読ループを前提とし、機械一括置換では処理しない。

  - id: TS-003
    target_item: AG-003
    verification: |
      inspect-docs を 7 ディレクトリで実行し、.agentdev/inspect/inbox/ へ検出事項ファイル（inspect-docs-finding-*.md）が出力されることを確認する。
      出力された検出事項に X-1〜X-7 各パターンの残存件数が記録されていることを確認する。
    pass_criteria: |
      7 ディレクトリすべてで inspect-docs が完了し、X-1〜X-7 各パターンの残存状況が検出事項ファイルに件数・ファイルパス・行番号とともに記録されていること。
    on_failure: |
      fix-and-reverify。inspect-docs が一部ディレクトリで失敗した場合、該当ディレクトリを再実行して再検証する。検出事項が空（残存 0 件）の場合も正常完了とし、AG-010 残作業計画への入力として件数 0 を記録する。

  - id: TS-004
    target_item: AG-004
    verification: |
      llm-expression-patterns.md lines 54-59, 65 周辺の table cells を確認し、空 backtick セル（`` `` ``）が補充または意図明示されたことを確認する。
      補充後、同ファイル内で table cells に空 backtick が残存しないことを `^\| \`\` \|` 相当の grep で確認する。
    pass_criteria: |
      該当領域の table cells がすべて表現パターン名または明示的な N/A 表記で埋まり、mechanical-replacement-rules.md section 3 との対象整合が取れていること。
    on_failure: |
      原則 fix-and-reverify。空セルが残存する場合は表現パターン名を補充して再検証する。ただし空欄が意図的（N/A 等）と判明した場合は record-in-findings とし、理由を cell に明示した上で合格とする。

  - id: TS-005
    target_item: AG-005
    verification: |
      integrity-rule-catalog.md で baseline, provider, variant, fixture 等の候補を grep 抽出し、per-instance で識別子 vs 散文普通名詞の判定結果を記録する。
      散文普通名詞と判定した箇所を推奨訳語へ置換した後、同 grep で未分類残存および散文普通名詞残存が 0 件であることを確認する。
    pass_criteria: |
      候補語の全出現箇所が識別子（英語維持正解）または散文普通名詞（推奨訳語置換済）のいずれかに分類され、未分類残存が 0 件であること。PR #1084 で既に置換済の 3 インスタンス（IR-026/IR-031 description, L1195）は再置換不要。
    on_failure: |
      fix-and-reverify。未分類または置換漏れがあれば該当箇所を查読・置換して再検証する。識別子と判定した箇所は英語維持正解として置換対象外とし、判定根拠を記録する。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    OU-002（X-2）を 7 ディレクトリ（docs/requirements, docs/adr, docs/specs, docs/guides, AGENTS.md, src/opencode/commands, src/opencode/skills）単位の child Issue へ分割する。
    各 child Issue は当該ディレクトリ内の em-dash 本体出現箇所を查読是正し、mechanical-replacement-rules.md section 2 の検出件数 0 を完結条件とする。
  wave_hints:
    - "Wave 1: OU-003（AG-008）— inspect-docs 再実行で残存カタログを確定し、他 OU の対象ファイルリストを裏付ける。"
    - "Wave 2: OU-001（X-7 SPEC 策定）, OU-004（cells 補充）, OU-005（SUB-D 検証）— 互いに独立し並列実施可能。"
    - "Wave 3: OU-002（X-2 epic）— 7 ディレクトリ child Issue を逐次実施。AG-008 カタログを入力とする。"
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。 -->

本ドラフトは docs 表記・表現是正の 5 RU（RU-0005, RU-0006, RU-0007, RU-0013, RU-0015）を統合した。

X-7（RU-0005）は backticks 識別子/一般名詞判定閾値の新規 SPEC 策定が中心であり、唯一 SPEC 保存対象（ACT-SPEC-001）となる。REQ 行は REQ-0140-026 の委任先として運用するため新設しない。

X-2（RU-0006）は 370 件/86 ファイルの em-dash 本体查読是正であり、本ドラフトで唯一 scale: large、issue_policy: epic の OU である。文脈判定を要するため case-auto の完全自走対象外とし（stop_reasons 参照）、child Issue 単位の查読ループを前提とする。

AG-008（RU-0007）の compliance-catalog 命名は現行 inspect-docs 出力形式へ読み替えた（CR-003）。RU-0013, RU-0015 は小規模な辞書補充・訳語検証であり、いずれも単一 Issue で完結する。

mechanical-replacement-rules.md（section 2 em-dash 查読対象明記）と llm-expression-patterns.md（line 55 の空 backtick セル実在）は実ファイル確認済みであり、各 RU の前提を裏付けている。

