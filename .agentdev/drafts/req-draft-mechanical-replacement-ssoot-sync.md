---
draft_type: req_draft
topic_slug: mechanical-replacement-ssoot-sync
status: saved
created_at: 2026-06-27T09:30:00+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005]
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  機械置換ルールの algorithm SSoT（mechanical-replacement-rules.md）と SPEC（document-type-responsibilities.md）間の整合性を回復する。
  適用除外「規範記述」の定義明確化、中黒表セル是正対象の明示、em-dash 5パターン文脈判定表の SSoT 追記、SPEC へのテーブルセルルール・SSoT 参照追記、機械置換スクリプトの SSoT 参照追加を実施する。
  併せて X-6 ヒューリスティック false negative の精緻化と残存是正（X-6 5件、X-1 実残存件数確定後）を位置付ける。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-001
      question: 適用除外「規範記述」の範囲を狭義（禁止表現を直接説明する文脈のみ）とする推論解決（ユーザー確認完了: case-auto 実行時に確定）
      classification: Confirmed
      evidence: SSoT 既存「禁止表現そのものの批評、説明」という文言が狭義を指向。「本ファイル等」の「等」は機械判定に不十分な広義含意
      impact: 本推論が覆った場合、docs/specs 配下2件の「において」を是正対象から除外する必要がある
    - id: UQ-002
      question: スクリプト（apply-mechanical-replacement.ps1）を REQ-0140 へ要件行追加せず SSoT 参照のみとする推論解決（ユーザー確認完了: case-auto 実行時に確定）
      classification: Confirmed
      evidence: REQ-0140-026 が既に準拠を規定、document-type-responsibilities.md が「件数、ファイル名は SPEC 側で管理」を指示
      impact: 本推論が覆った場合、REQ-0140 へスクリプト位置付けの要件行追加が必要
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      algorithm SSoT（mechanical-replacement-rules.md）の適用除外「禁止表現そのものの批評、説明（本ファイル等の規範記述）」の「規範記述」定義を明確化する。
      適用除外は「禁止表現をルールとして直接説明、例示する文脈」（例: 「において」は「で」に置換する、というルール説明文中の対象語）のみに限定する。
      SPEC やガイドの行為描写中に禁止表現と同一の語が含まれても、ルール説明文脈でなければ是正対象とする。
      本定義により docs/specs 配下の2件（spec-save.md、backticks-identifier-threshold.md）の「において」は是正対象となる。
      [Confirmed: UQ-001]

  - id: AG-002
    content: |
      algorithm SSoT Section 1（中黒）の判定手順に、テーブル行（`|...|`）が中黒是正対象であることを明示する。
      テーブルセル内の中黒は適用除外ではなく、code block 内・YAML frontmatter 内と同列の「行単位検索の対象」に含む。
      PR#1242/#1243 で algorithm SSoT に従い表セル中黒を読点へ置換した実績と整合する。

  - id: AG-003
    content: |
      algorithm SSoT Section 2（em-dash）に、検出後の文脈判定パターン表を追加する。
      PR#1183 查読で暗黙適用した5パターン（A: label—explanation、B: 句点直後、C: 括弧内既存、D: テーブルセル N/A、ママ）を明示化し、検出→判定→処置のフローを機械判定可能な形で定義する。
      パターン D（テーブルセル `| — |` → `| - |`）は RU-0004 と整合する。

  - id: AG-004
    content: |
      SPEC（document-type-responsibilities.md）の em-dash 置換形式節に、テーブルセル `| — |` → `| - |` の機械置換ルールを追記する。
      現状は人間向け基準のみで algorithm を参照せず、テーブルセル規則が未記載である反映漏れを是正する。

  - id: AG-005
    content: |
      SPEC（document-type-responsibilities.md）の中黒使用許容範囲節に、algorithm SSoT（mechanical-replacement-rules.md）を参照先として明記する。
      SPEC 側は固定複合名詞例の原本として機能し、algorithm 的記述（許容条件4種、判定手順）は SSoT へ委任する構造を確定する。
      SPEC 側に algorithm 的記述を重複記述しない。

  - id: AG-006
    content: |
      algorithm SSoT（mechanical-replacement-rules.md）に、apply-mechanical-replacement.ps1 を algorithm 実装ツールとして参照する節を追加する。
      スクリプトは Wave 横断是正で共用し、algorithm SSoT と同期することを位置付ける。
      REQ-0140-026 が既に「自然言語記述は全査読観点に準拠して修正すること」を規定しており、スクリプトはその具体実行手段の1つである。
      [Confirmed: UQ-002]

  - id: AG-007
    content: |
      X-6 ヒューリスティック（「において」検出正規表現）の false negative を精緻化する。
      PR#1249 で検出された false negative（spec-save.md L176 の「において」が検出漏れ）を修正し、検出パターンの網羅性を確認する。
      本項目はスクリプト実装の修正であり、SPEC 内容（「において」→「で」の置換先定義）は既に正しい。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
    target_area: "## 対象範囲と適用除外"
    source_items: [AG-001]
    content: |
      ## 対象範囲と適用除外

      機械判定は以下の 4 規範に限定する。
      文脈判断が必要な表現（「最も」「重要な」等）は機械判定対象外とし、サンプリング査読へ委譲する（後述「3. LLM 表現機械判定」の対象外リスト参照）。

      適用除外（機械判定を実行しない領域）:

      - ユーザー発言の引用、既存文書の引用
      - 他ファイルの見出し、節名の引用（`「...」` で括られた参照）
      - 禁止表現そのものの批評、説明（禁止表現をルールとして直接説明、例示する文脈のみ。例: 「において」は「で」に置換する、というルール説明文中の対象語。SPEC やガイドの行為描写中に禁止表現と同一の語が含まれても、ルール説明文脈でなければ是正対象とする）
      - コードブロック、インラインコードの内部
      - YAML frontmatter のキー名、識別子値

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
    target_area: "### 判定手順"
    source_items: [AG-002]
    content: |
      ### 判定手順

      1. 行単位で `・` を検索する（テーブル行 `|...|` も対象に含む。テーブルセル内の中黒は是正対象であり、適用除外ではない）
      2. 当該行が code block 内または YAML frontmatter 内であれば許容（検出A、B）
      3. 中黒の左右が `NN時`（数字 + `時`）であれば許容（検出C）
      4. 中黒を含む前後文字列が SPEC 明示例リストと完全一致すれば許容（検出D）
      5. 上記いずれにも該当しない `・` を含む行を是正対象として抽出する

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
    target_area: "### 置換手順"
    source_items: [AG-003]
    content: |
      ### 置換手順

      1. テーブルセル `| — |` をすべて `| - |` へ置換する（安全な機械置換、パターン D）
      2. 本文中 ` — ` を検索する
      3. 各検出箇所の前後関係を確認し、以下の文脈判定パターン表に従って処置を決定する
      4. コロン（`:`）による置換は行わない

      #### 本文中 em-dash の文脈判定パターン

      | パターン | 文脈 | 判定 | 処置 |
      |---|---|---|---|
      | A | label—explanation（ラベルと説明の同格強調） | 置換 | 括弧（`（）`）へ置換 |
      | B | 句点直後の em-dash（新たな文の開始） | 置換 | 句点で2文分割、または読点で接続 |
      | C | 括弧内の既存 em-dash（括弧内で既に補足構造が成立） | ママ | そのまま保持（括弧内は既に補足構造） |
      | D | テーブルセル `| — |`（N/A プレースホルダ） | 機械置換 | `| - |` へ置換（手順1で実施済み） |
      | ママ | 上記 A〜D のいずれにも該当しない文脈 | ママ | 査読で文脈確認の結果、置換不要と判断したもの |

      本文中 ` — ` は検出自体は機械的だが、パターン A〜C およびママの判定は文脈依存である。
      検出後のパターン分類は查読対象とし、上記判定表に従って処置を決定する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
    target_area: "### 機械置換スクリプト"
    source_items: [AG-006, AG-007]
    content: |
      ### 機械置換スクリプト

      `scripts/apply-mechanical-replacement.ps1` は本ファイルの algorithm を実装するツールである。
      Wave 横断是正で共用し、algorithm SSoT と同期する。

      スクリプトのヒューリスティックは本ファイルの判定手順に従う。
      X-6（「において」検出）のヒューリスティックについて、PR#1249 で false negative を検出した。
      検出正規表現の網羅性を確認し、検出漏れがないことを検証手順に含めること。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "### em-dash 置換形式"
    source_items: [AG-004]
    content: |
      ### em-dash 置換形式

      em-dash（`—`、`―`）は japanese-tech-writing L17 に従い、同格、補足は括弧（`（）`）で、言い換え、敷衍は句点で2文分割または読点でつなぐ。
      コロン（`:`）による置換は行わない。

      テーブルセル内の em-dash（`| — |`、N/A プレースホルダ用途）は `| - |`（ハイフン1文字）へ機械置換する。
      本文中の em-dash とは意味が異なり、文脈判断を要しない安全な機械置換である。
      検出後の文脈判定パターン（A: label—explanation、B: 句点直後、C: 括弧内既存、D: テーブルセル、ママ）の詳細は algorithm SSoT（mechanical-replacement-rules.md）Section 2 を参照。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "### 中黒使用の許容範囲"
    source_items: [AG-005]
    content: |
      ### 中黒使用の許容範囲

      中黒（`・`）は原則として日本語並列に使わない（japanese-tech-writing L18）。ただし以下は許容する:

      - 固定複合名詞の内部（「実行時・編集時」「コマンド・スキル・テンプレート・スクリプト」等の確定 tech term）
      - 単一固有名詞の内部

      流動的並列、識別子の並列、コード値の並列は読点（、）、スラッシュ、箇条書きに置換する。

      中黒許容範囲の機械判定アルゴリズム（許容条件4種、判定手順、テーブルセル扱い）は algorithm SSoT（[mechanical-replacement-rules.md](../../../src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md)）Section 1 を参照。
      本節は固定複合名詞・単一固有名詞の許容例の原本として機能し、algorithm 的記述は SSoT へ委任する。

conflict_resolutions:
  - id: CR-001
    conflict: 適用除外「規範記述」の範囲について、algorithm SSoT の「本ファイル等の規範記述」の「等」が広義を含意するか狭義に留まるかが未確定。docs/specs 配下2件の「において」が例外扱いになるか是正対象になるかが分岐。
    resolution: 狭義解釈を採用。適用除外は「禁止表現をルールとして直接説明、例示する文脈」のみに限定。docs/specs 配下2件は是正対象。根拠: SSoT 既存「禁止表現そのものの批評、説明」という文言が対象語そのものの説明文脈を指向。SPEC 行為描写は対象外。[Confirmed - UQ-001: case-auto 実行時にユーザー確認完了]

  - id: CR-002
    conflict: apply-mechanical-replacement.ps1 を REQ-0140 へ要件行追加するか、SPEC 参照のみとするかが未確定。
    resolution: SPEC 参照のみを採用。REQ-0140-026 が既に「自然言語記述は全査読観点に準拠して修正すること」を規定しており、スクリプトはその具体実行手段の1つ。document-type-responsibilities.md が「件数、ファイル名は SPEC 側で管理」を指示する原則に従う。[Confirmed - UQ-002: case-auto 実行時にユーザー確認完了]

operation_units:
  - ou_id: OU-001
    source_ru: [RU-0001, RU-0002, RU-0003, RU-0005]
    target_spec: src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: [RU-0004]
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      mechanical-replacement-rules.md 更新後、同ファイル内の「において」を grep し、ルール説明文脈（「において」は「で」に置換する）の対象語が適用除外として正しく扱われることを確認する。
      併せて docs/specs/commands/spec-save.md L50、docs/specs/integrity/backticks-identifier-threshold.md L12 の「において」が是正対象として検出されることを確認する。
    pass_criteria: |
      mechanical-replacement-rules.md 内のルール説明文中の「において」は適用除外としてマスクされる。
      docs/specs 配下2件の「において」は是正対象として検出される（適用除外ではない）。
    on_failure: |
      fix-and-reverify。適用除外の定義記述が不正確な場合は修正して再検証。docs/specs 配下2件が適用除外として誤判定される場合は定義を精査。

  - id: TS-002
    target_item: AG-002
    verification: |
      mechanical-replacement-rules.md Section 1 の判定手順更新後、テーブル行を含むファイルで中黒検出を実行し、テーブルセル内の中黒が是正対象として抽出されることを確認する。
    pass_criteria: |
      テーブル行 `|...|` 内の `・` が是正対象として検出される。適用除外（code block 内、YAML frontmatter 内）のテーブル行は除外される。
    on_failure: |
      fix-and-reverify。判定手順の記述がテーブル行を対象に含んでいない場合は修正して再検証。

  - id: TS-003
    target_item: AG-003
    verification: |
      mechanical-replacement-rules.md Section 2 更新後、5パターン文脈判定表（A: label—explanation、B: 句点直後、C: 括弧内既存、D: テーブルセル、ママ）が記載されていることを確認する。
      各パターンの判定と処置が明示されていることを確認する。
    pass_criteria: |
      5パターン全てが表形式で記載され、各パターンの文脈、判定、処置が明示されている。
    on_failure: |
      fix-and-reverify。パターン不足または記載不備の場合は修正して再検証。

  - id: TS-004
    target_item: AG-004
    verification: |
      document-type-responsibilities.md の em-dash 置換形式節更新後、テーブルセル `| — |` → `| - |` ルールが記載されていることを確認する。
      併せて algorithm SSoT の文脈判定パターン表への参照が記載されていることを確認する。
    pass_criteria: |
      テーブルセル機械置換ルールと algorithm SSoT 参照の両方が記載されている。
    on_failure: |
      fix-and-reverify。記載漏れがある場合は修正して再検証。

  - id: TS-005
    target_item: AG-005
    verification: |
      document-type-responsibilities.md の中黒使用許容範囲節更新後、algorithm SSoT（mechanical-replacement-rules.md）Section 1 への参照が記載されていることを確認する。
      SPEC 側に algorithm 的記述（許容条件4種、判定手順）が重複記述されていないことを確認する。
    pass_criteria: |
      SSoT 参照が記載され、algorithm 的記述の重複がない。
    on_failure: |
      fix-and-reverify。参照漏れまたは重複記述がある場合は修正して再検証。

case_open_hints:
  epic_needed: false
  wave_hints:
    - wave: 1
      ous: [OU-001]
      reason: algorithm SSoT の更新を先に完了し、SPEC 側の参照先を確定する
    - wave: 2
      ous: [OU-002]
      reason: document-type-responsibilities.md が OU-001 の更新後 SSoT を参照するため、推奨実行順を後に配置
```

# summary

Group A（機械置換ルール SSoT 整合性）の要件ドラフト。

5件RU（RU-0001〜0005）を統合し、algorithm SSoT と SPEC 間の整合性を回復する。
主な変更対象は2ファイル:

- `mechanical-replacement-rules.md`: 適用除外明確化、表セル明示、5パターン文脈判定表追加、スクリプト参照追加
- `document-type-responsibilities.md`: テーブルセルルール追記、SSoT 参照明記

反映作業（残存是正、スクリプト false negative 修正）は case-open/case-run 工程で実施する。

2件の推論解決（UQ-001: 適用除外範囲、UQ-002: スクリプト位置付け）は case-auto 実行時にユーザー確認完了、Confirmed として確定済み。
