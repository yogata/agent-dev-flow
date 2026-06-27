# draft-data

```yaml
status: saved
topic: ir044-detection-precision
work_type: maintenance
scale: standard
summary: >
  IR-044 検出精度に関する4件のRU統合ドラフト。
  RU-0007（英語普通名詞網羅的drift検証）、RU-0008（isBehaviorPredicateContext実装ギャップ）、
  RU-0009（isNegationContextインライン化）、RU-0010（REQ-0143-004 IR-044 false positive）を含む。
  RU-0008は関数削除済みで解消済み、RU-0009は純リファクタでcase-open対象、
  RU-0007は検証タスクでcase-open対象、RU-0010はREQ-0143-004表記変更でreq-save対象。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-001
      item: RU-0007 英語普通名詞検証範囲
      resolution: Inferred（TS-005未検証の全名詞を抽出・検証）
    - id: UQ-002
      item: RU-0008 isBehaviorPredicateContext削除後の処理
      resolution: Inferred（docs-check層で解消済み、Out of Scope）
    - id: UQ-003
      item: RU-0009 isNegationContext inline可否
      resolution: Inferred（インライン化、case-open対象）
    - id: UQ-004
      item: RU-0010 REQ-0143-004 false positive解消方針
      resolution: Inferred（表記変更「Step 0 扱い」→「先頭 Step 扱い」）
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      integrity-rule-catalog.md 内の全英語普通名詞を抽出し、TS-005 で検証済みの4種
      （baseline/provider/variant/fixture）以外の名詞について drift リスクを網羅的に検証する。
      検証対象には finding, drift, regression, gate, severity, category, schema, observation
      等の候補を含む。
    source: RU-0007
    classification: Confirmed
  - id: AG-002
    content: >
      英語普通名詞の検証結果は訳語表（document-type-responsibilities.md）と整合すること。
      drift が確認された名詞は訳語表へ追記するか、英語使用の妥当性を確認して vocabulary-registry.md
      へ正規語彙として登録する。検証結果は当該 SPEC へ反映する。
    source: RU-0007
    classification: Confirmed
  - id: AG-003
    content: >
      isBehaviorPredicateContext は check_integrity.ts から削除済みであり（REQ-0108-262,
      REQ-0145-002）、当該関数の実装ギャップ懸念は docs-check 層で解消済みと位置付ける。
      件数・内容規定の境界は SPEC IR-044（rules/IR-044-*.md L32）に既に明記されている。
      偽陰性が未観測であるため、追加の inspect-docs ガイダンスは発生次第対応する。
    source: RU-0008
    classification: Inferred
  - id: AG-004
    content: >
      isNegationContext（check_integrity.ts L3557）の checkWorkflowStatusProhibition
      （L4027）へのインライン化は純リファクタであり、REQ/SPEC 変更を伴わない実装タスクとして
      case-open で処理する。インライン化後、checkWorkflowStatusProhibition の検出挙動が
      変更されないことをテストで確認する。
    source: RU-0009
    classification: Inferred
  - id: AG-005
    content: >
      REQ-0143-004 の「Step 0 扱い」表記を「先頭 Step 扱い」へ変更し、IR-044 Step 番号直接参照
      検出の false positive を解消する。「Step 0」の数字リテラルが \bStep\s*\d+ パターンに
      一致することが原因であり、REQ-0136-031 の原則（機能名・フェーズ名で参照）と整合する
      表記への変更により exemption 設計を複雑化せずに解消する。
    source: RU-0010
    classification: Confirmed

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0143
    source_items: [AG-005]
    content: >
      REQ-0143-004 を以下の通り変更する。

      変更前: command SPEC（docs/specs/commands/*.md）と command 定義ファイル
      （src/opencode/commands/agentdev/*.md）の Step 番号構成は一致すること。
      Step 0 扱い、採番開始位置の詳細は SPEC（docs/specs/command-file-format.md）
      に配置すること

      変更後: command SPEC（docs/specs/commands/*.md）と command 定義ファイル
      （src/opencode/commands/agentdev/*.md）の Step 番号構成は一致すること。
      先頭 Step 扱い、採番開始位置の詳細は SPEC（docs/specs/command-file-format.md）
      に配置すること

      変更理由: 「Step 0」の数字リテラルが IR-044 Step 番号直接参照検出パターン
      （\bStep\s*\d+）に一致し false positive となる。REQ-0136-031 の原則と整合する
      表記へ変更し、exemption 設計の複雑化を回避する。

conflict_resolutions:
  - id: CR-001
    item: RU-0008 isBehaviorPredicateContext 実装ギャップの取扱い
    resolution: >
      関数削除済み（REQ-0108-262, REQ-0145-002）。IR-044 の文脈exemption は
      inspect-docs へ委譲済み。SPEC IR-044 に件数・内容規定の境界明記あり。
      偽陰性未観測のため Out of Scope とする。
    classification: Inferred

operation_units:
  - ou_id: OU-001
    source_ru: RU-0010
    target_req: REQ-0143
    operation: update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single-issue
    result: {}
  - ou_id: OU-002
    source_ru: RU-0007
    target_req: null
    target_spec: docs/specs/integrity/vocabulary-registry.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single-issue
    result: {}
  - ou_id: OU-003
    source_ru: RU-0009
    target_req: null
    operation: case-open-only
    scale: lightweight
    depends_on: []
    recommended_order: 3
    issue_policy: single-issue
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-005
    verification: >
      REQ-0143-004 変更後に /repo/docs-check を実行し、IR-044 Step 番号直接参照検出が
      REQ-0143-004 に対してトリガーされないことを確認する。
    pass_criteria: >
      REQ-0143-004 に対する IR-044 Step number warning が検出されないこと。
      他の REQ-0143 要件行（001〜003）に影響がないこと。
    on_failure:
      action: fix-and-reverify
      description: >
        検出が残る場合、表記をさらに調整（例: "Step ゼロ扱い" 等）して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: >
      integrity-rule-catalog.md から全英語普通名詞を抽出し、vocabulary-registry.md の
     正規語彙リストと照合する。TS-005 検証済4種以外の名詞について drift リスクを評価する。
    pass_criteria: >
      全英語普通名詞が vocabulary-registry.md に登録済み、または英語使用の妥当性が
      確認されていること。未検証の名詞が残留しないこと。
    on_failure:
      action: fix-and-reverify
      description: >
        drift が確認された名詞は訳語表へ追記するか、vocabulary-registry.md へ正規語彙として
        登録し、再検証する。
  - id: TS-003
    target_item: AG-004
    verification: >
      isNegationContext インライン化後に check_integrity.ts のテストスイート
      （scripts/check_integrity.test.ts）を実行し、checkWorkflowStatusProhibition の
      検出挙動が変更されないことを確認する。
    pass_criteria: >
      既存の全テストがパスすること。checkWorkflowStatusProhibition の true positive,
      false positive パターンが変更前と同一であること。
    on_failure:
      action: fix-and-reverify
      description: >
        テストが失敗する場合、インライン化のロジックを修正して再検証する。

case_open_hints:
  epic_needed: false
  wave_hints:
    wave_1: [OU-001]
    wave_2: [OU-002, OU-003]
```

## 補助情報

### 未解決質問の取扱い

- **UQ-001〜004**: 全て evidence-first により Inferred で解決。RU-0008 は Out of Scope。

### RU-0008 の位置付け

isBehaviorPredicateContext 関数は check_integrity.ts から削除済み（REQ-0108-262,
REQ-0145-002）。IR-044 の文脈exemption は META 規則行のみに限定され、振る舞い述語文脈等は
inspect-docs へ委譲済み。件数・内容規定の境界は SPEC IR-044（L32）に既に明記。
偽陰性未観測のため、本ドラフトでは Out of Scope とする。

### RU-0009 の位置付け

isNegationContext は IR-044 文脈exemption からは削除済みだが、checkWorkflowStatusProhibition
（別チェック）の呼び出し元として存続。インライン化は純リファクタ（機能影響なし）であり、
REQ/SPEC 変更を伴わないため case-open 対象とする。

### 既存REQ健全性メトリクス

- REQ-0143: 4要件行、関心分類1、成果物種別1 → SPLIT metrics 0 → UPDATE 許可
