---
draft_type: req_draft
topic_slug: docs-specs-phase1
status: saved
created_at: 2026-06-27T10:00:00+09:00
spec_actions_consumed: true
---

# draft-data

```yaml
# work_type: docs_chore（文書修正中心、Phase 1 は全て既存SPECへの注記・説明修正）
# scale: docs_chore は direct_case のため scale 適用外
work_type: docs_chore

# scale: docs_chore は scale 未設定
scale: null

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助
summary: >-
  docs/specs/ 再構成 Phase 1: 低リスク整合修正。
  docs/README.md と docs/DOC-MAP.md の旧表現・説明ブレを修正し、
  document-model.md と document-type-responsibilities.md に役割分担注記
  （補完関係の明示、強い正本指定は確定しない）を追記する。
  rule-ownership.md に全ドメイン横断メタファイルである位置づけと
  req-impact-map.md との関係整理を追記し、
  backticks-identifier-threshold.md の関連セクションを差し替えて
  document-type-responsibilities.md との補完関係を明示する。

# auto_gate: case-auto 自走可否
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: >-
      docs/README.md の「基盤 SPEC（`specs/` 直下）」見出しを実態（6ドメイン配下）に
      合わせて修正する。Phase 2a 由来の旧表現を残さず、REQ-0156 の6ドメイン分類を
      明示する。既存リンク群（`specs/foundations/` 等のドメインパス）は維持する。

  - id: AG-002
    content: >-
      docs/DOC-MAP.md の3点を修正する。
      (a) 「Phase 2a（PR #1215）で ... 整理済み」を「REQ-0156 に基づき6ドメイン
      （foundations/responsibilities/quality/integrity/local/authoring）へ整理済み」に
      置換する。
      (b) patterns.md の説明「実装パターンと文書フォーマット」を
      「文書フォーマット規約（frontmatter・命名・URL参照形式）」に修正する。
      (c) document-model.md の説明「文書種別の責務マトリックス」を
      「文書種別マトリックス・文書分類ポリシー・SPEC内部5論理区分・文書7分類・
      ドメイン別体系化規範」に修正する。

  - id: AG-003
    content: >-
      docs/specs/foundations/document-model.md の「## 目的」直後に
      「### 他 SPEC との役割分担」セクションを新設する。
      responsibilities/document-type-responsibilities.md との補完関係を明示し、
      重複しやすい関心の分担表を設ける。Phase 1 では強い正本（どちらか一方を正と
      する指定）は確定せず、表の列名は「主に扱う SPEC」として関心分担を示すに
      留める。境界を変更する場合は相互参照を更新し、同一関心の説明が重複・矛盾
      しない状態を維持する旨を記載する。

  - id: AG-004
    content: >-
      docs/specs/responsibilities/document-type-responsibilities.md の冒頭
      （既存 japanese-tech-writing 注記の前）に、foundations/document-model.md との
      役割分担注記を引用ブロックで追記する。「正本とする」表現は避け、
      「参照する」「扱う」表現で補完関係を示す。document-model.md が扱う領域
      （基準境界、SPEC内部5論理区分、文書7分類、ドメイン別体系化規範）と本SPECが
      扱う領域（配置判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策）の
      分担を記載する。

  - id: AG-005
    content: >-
      docs/specs/integrity/rule-ownership.md の冒頭に位置づけ注記を追記する
      （全ドメイン横断メタファイルであること、integrity/ 配下だが integrity
      ドメイン専用ではないこと）。あわせて「## req-impact-map.md との関係」
      セクションを新設し、本ファイル（ルールドメイン → canonical REQ/SPEC）と
      req-impact-map.md（REQ → 影響するルール/アーティファクト）が逆方向の
      対応マップであること、整合性維持運用（新規IR追加時・baseline_status 変更時・
      canonical owner 変更時の同期）を明示する。req-impact-map.md の配置移動は
      Phase 1 の対象外とし、本節では関係整理のみを扱う旨を平文で記載する
      （`※` 注記は使用しない）。

  - id: AG-006
    content: >-
      docs/specs/integrity/backticks-identifier-threshold.md の既存「## 関連」
      セクションを差し替える。document-type-responsibilities.md との補完関係を
      明示し、用語政策 SSoT が document-type-responsibilities.md にあること、
      本 SPEC がその機械判定条件のみを担当する位置づけであることを記載する。
      新設ではなく既存セクションの詳細化として扱い、関連3点
      （用語政策 SSoT / 機械判定アルゴリズム / 良パターン基準）を保持する。

# artifact_actions: SPEC への保存対象を単一配列に統合
# 1 action = 1 artifact × 1 editing concern
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/README.md
    target_area: "### 基盤 SPEC（`specs/` 直下）"
    source_items: [AG-001]
    content: |
      ### 基盤 SPEC（`specs/{foundations,responsibilities,quality,integrity,local,authoring}/`）

      基盤 SPEC は REQ-0156 に基づき6ドメインへ整理済み。各ドメインの責務は [document-model.md](specs/foundations/document-model.md)「docs/specs/ 直下のドメイン別体系化」参照。

      （既存リンク群は維持。本 action は見出しと直後の導入文のみを置換し、
      既存のリンクリスト `specs/foundations/system.md` 等は変更しない。）

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/DOC-MAP.md
    target_area: "### 基盤 SPEC（`specs/` 配下サブディレクトリ）"
    source_items: [AG-002]
    content: |
      ### 基盤 SPEC（`specs/` 配下サブディレクトリ）

      システム全体の構成・フォーマット・整合性検査など、複数層にまたがる基盤 SPEC。REQ-0156 に基づき6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）へ整理済み。

      | SPEC | 内容 |
      |---|---|
      | [system.md](specs/foundations/system.md) | コマンドシステムの構成 |
      | [patterns.md](specs/foundations/patterns.md) | 文書フォーマット規約（frontmatter・命名・URL参照形式） |
      | [design-principles.md](specs/foundations/design-principles.md) | 設計原則 |
      | [quality-specs.md](specs/quality/quality-specs.md) | 品質基準・検証ルール |
      | [quality-gates.md](specs/quality/quality-gates.md) | QG-1〜QG-4 品質ゲート定義 |
      | [document-model.md](specs/foundations/document-model.md) | 文書種別マトリックス・文書分類ポリシー・SPEC内部5論理区分・文書7分類・ドメイン別体系化規範 |
      | [document-type-responsibilities.md](specs/responsibilities/document-type-responsibilities.md) | 文書種別責務・配置基準 |
      | [artifact-contracts.md](specs/responsibilities/artifact-contracts.md) | アーティファクト間契約 |
      | [integrity-contracts.md](specs/integrity/integrity-contracts.md) | 整合性検査分類フレームワーク |
      | [workflow-contracts.md](specs/foundations/workflow-contracts.md) | ワークフロー契約（旧版・縮小済み・横断契約は `workflows/` を参照） |
      | [runtime-package-boundary.md](specs/local/runtime-package-boundary.md) | 実行時配布物の境界と依存制約 |
      | [local-case-file.md](specs/local/local-case-file.md) | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し |
      | [local-generation.md](specs/local/local-generation.md) | ローカル版 OpenCode link mode 導入フロー・link target 確認・unlink / relink による更新運用（ADR-0131, REQ-0141） |
      | [local-transform.md](specs/local/local-transform.md) | 変換プロンプトの廃止根拠・変換品質検証の agentdev-gh-cli 差し替え版品質検証への読み替え（ADR-0131, REQ-0141） |
      | [integrity-rule-catalog.md](specs/integrity/integrity-rule-catalog.md) | 整合性検査ルールのカタログ |
      | [artifact-responsibilities.md](specs/responsibilities/artifact-responsibilities.md) | アーティファクト責務マトリックス |
      | [req-impact-map.md](specs/responsibilities/req-impact-map.md) | REQ 影響マッピング |
      | [req-health-metrics.md](specs/quality/req-health-metrics.md) | REQ 健全性メトリクス（肥大化・関心ズレ閾値） |
      | [rule-ownership.md](specs/integrity/rule-ownership.md) | ルール所有権マトリックス |
      | [docs-spec-rebuild-integrity.md](specs/integrity/docs-spec-rebuild-integrity.md) | 配布物 ID 除去後の整合性検査ルール（構文健全性・文意保持・責務整合・NG 分類） |
      | [command-file-format.md](specs/authoring/command-file-format.md) | command 定義ファイルの Markdown 構成標準（Step 形式・ガードレール番号・禁止形式・機械検査対象） |
      | [backticks-identifier-threshold.md](specs/integrity/backticks-identifier-threshold.md) | backticks 識別子（必須）/ 一般名詞（任意）の機械判定閾値（document-type-responsibilities.md 補完 SPEC、mechanical-replacement-rules.md 相互参照先） |

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/document-model.md
    target_area: "## 目的"
    source_items: [AG-003]
    content: |
      ## 目的

      REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックスを定義し、各文書種別が何を記述し、何を記述しないかを明確にする（REQ-0101）。

      ### 他 SPEC との役割分担

      本 SPEC と `../responsibilities/document-type-responsibilities.md` は補完関係にある。重複しやすい関心を以下の通り分担する。

      | 関心 | 主に扱う SPEC |
      |---|---|
      | 文書種別の基準境界（REQ/ADR/SPEC/guides/DOC-MAP の役割定義、ライフサイクル、優先順位、参照規則、投影方向） | 本 SPEC |
      | SPEC 内部5論理区分、文書7分類、局所物理分離、docs/specs/ 直下のドメイン別体系化規範 | 本 SPEC |
      | 文書種別配置の執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策 | `../responsibilities/document-type-responsibilities.md` |

      両 SPEC の境界を変更する場合は、相互参照を更新し、同一関心の説明が重複・矛盾しない状態を維持する。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "# 文書種別責務、配置基準"
    source_items: [AG-004]
    content: |
      # 文書種別責務、配置基準

      > **他 SPEC との役割分担**: 本 SPEC と `../foundations/document-model.md` は補完関係にある。
      > 文書種別の基準境界（REQ/ADR/SPEC/guides/DOC-MAP の役割定義、ライフサイクル、優先順位、参照規則、SPEC内部5論理区分、文書7分類、ドメイン別体系化規範）は `document-model.md` を参照する。
      > 本 SPEC は文書種別配置の執筆時判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策を扱う。

      （既存の japanese-tech-writing 注記、本文は維持。本 action はタイトル直後の引用ブロック追記のみ。）

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/rule-ownership.md
    target_area: "# ルール所有権マトリックス"
    source_items: [AG-005]
    content: |
      # ルール所有権マトリックス

      > **位置づけ**: 本ファイルは全ドメイン（foundations/responsibilities/quality/integrity/local/authoring）横断のルール所有権マトリックスである。
      > `integrity/` 配下に配置するが `integrity` ドメイン専用ではなく、全ルールドメインの canonical REQ/SPEC 対応を示すメタファイルとして機能する。

      ## req-impact-map.md との関係

      本ファイル（ルールドメイン → canonical REQ/SPEC）と `../responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）は逆方向の対応マップである。両者の整合性維持運用:

      - 新規 IR 追加時: 両ファイルの対応行列を同期更新する
      - IR の `baseline_status` 変更時（new / resolved 等）: 両ファイルで整合を確認する
      - canonical owner 変更時: 両ファイルで参照先を更新する

      req-impact-map.md の配置移動は Phase 1 の対象外とし、本節では関係整理のみを扱う。

      （既存の「## ルールドメイン一覧」以降は維持。本 action は冒頭注記と新設セクションの追記のみ。）

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/backticks-identifier-threshold.md
    target_area: "## 関連"
    source_items: [AG-006]
    content: |
      ## 関連

      - **用語政策 SSoT**: `../responsibilities/document-type-responsibilities.md`
        - 本 SPEC は `document-type-responsibilities.md`「識別子と散文普通名詞の区別」節を機械判定レベルで補完する。用語政策の意図・許容リストは `document-type-responsibilities.md` を SSoT とし、本 SPEC は「どの語句が識別子（backticks必須）でどの語句が一般名詞（backticks任意）か」の機械判定条件のみを定義する。
      - **機械判定アルゴリズム**: `../../../src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`
      - **良パターン基準**: `../local/runtime-package-boundary.md`「5 種のリポジトリ種別」Type ID 列

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: >-
      document-model.md と document-type-responsibilities.md の責務マトリックス重複に
      より SSoT が不明。どちらを正本とするか。
    resolution: >-
      Phase 1 では強い正本（どちらか一方を正とする指定）は確定しない。
      両 SPEC を「補完関係」として関心分担表を明示し、列名は「主に扱う SPEC」
      にとどめる。SSoT 方向の確定は Phase 3（大きな再構成）の判断対象とする。
  - id: CR-002
    conflict: >-
      rule-ownership.md が integrity/ 配下にあるが全ドメイン横断メタファイルである
      ことの位置づけ曖昧。
    resolution: >-
      integrity/ 配下を維持（移動は Phase 1 対象外）。ファイル先頭に
      「全ドメイン横断メタファイルであり、integrity ドメイン専用ではない」旨の
      位置づけ注記を追記して運用上の誤読を防ぐ。
  - id: CR-003
    conflict: >-
      req-impact-map.md の配置ドメインが responsibilities/ で妥当か。
      quality/ または integrity/ への移動候補あり。
    resolution: >-
      Phase 1 では req-impact-map.md の移動は行わない。rule-ownership.md との
      関係整理のみを先行し、移動判断は Phase 3 で実施する。
  - id: CR-004
    conflict: >-
      Phase 1 / Phase 2 / Phase 3 を単一 RU に混ぜると肥大化する懸念。
    resolution: >-
      ユーザ合意に基づき Phase 1 のみを本 draft の対象とする。
      Phase 2（stub SPEC 整理方針）と Phase 3（大きな再構成）は別 RU として扱う。
      本 draft の artifact_actions には Phase 1 の6ファイルのみを含む。

# operation_units: 操作単位。Phase 1 は6ファイルへの spec-update。各 OU は独立
operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: null
    target_spec: docs/README.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: null
    target_req: null
    target_spec: docs/DOC-MAP.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: null
    target_req: null
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: null
    target_req: null
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: null
    target_req: null
    target_spec: docs/specs/integrity/rule-ownership.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: null
    target_req: null
    target_spec: docs/specs/integrity/backticks-identifier-threshold.md
    operation: spec-update
    scale: null
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/README.md を開き、「基盤 SPEC」セクション見出しを確認する。
      Grep 等で旧表現「基盤 SPEC（`specs/` 直下）」が見出しから除去されていることを確認する。
      あわせて「## 仕様（SPEC）」配下の当該サブセクションが REQ-0156 への言及を含む導入文を持つことを確認する。
    pass_criteria: |
      見出しが `### 基盤 SPEC（`specs/{foundations,responsibilities,quality,integrity,local,authoring}/`）` 形式に修正されていること。
      導入文が「REQ-0156 に基づき6ドメインへ整理済み」と document-model.md「docs/specs/ 直下のドメイン別体系化」への参照リンクを含むこと。
      既存リンク群（`specs/foundations/system.md` 等への相対リンク）が維持されていること。
    on_failure: |
      fix-and-reverify を選択。
      修正漏れ、旧表現残置、リンク切れのいずれかを検出した場合、実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/DOC-MAP.md を開き、「基盤 SPEC（`specs/` 配下サブディレクトリ）」セクション内の3点（セクション導入文、patterns.md 行、document-model.md 行）を確認する。
      Grep 等で旧表現「Phase 2a（PR #1215）」、「実装パターンと文書フォーマット」、「文書種別の責務マトリックス」が残置されていないことを確認する。
    pass_criteria: |
      (a) セクション導入文が「REQ-0156 に基づき6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）へ整理済み」に修正されていること。
      (b) patterns.md の説明が「文書フォーマット規約（frontmatter・命名・URL参照形式）」に修正されていること。
      (c) document-model.md の説明が「文書種別マトリックス・文書分類ポリシー・SPEC内部5論理区分・文書7分類・ドメイン別体系化規範」に修正されていること。
    on_failure: |
      fix-and-reverify を選択。
      3点のいずれかが未修正、または旧表現が残置されている場合、実装を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/foundations/document-model.md を開き、「## 目的」の直後に「### 他 SPEC との役割分担」セクションが存在することを確認する。
      Grep 等で「主に扱う SPEC」列名と「補完関係」表現の存在を確認する。
      あわせて「正本」という表現が当該セクション内に含まれていないことを確認する。
    pass_criteria: |
      「### 他 SPEC との役割分担」セクションが存在すること。
      関心分担表の列名が「主に扱う SPEC」であり、「正本」を使用していないこと。
      両 SPEC（document-model.md / document-type-responsibilities.md）の関心分担が3行以上の表で記載されていること。
      「同一関心の説明が重複・矛盾しない状態を維持する」旨の文があること。
      相対リンク `../responsibilities/document-type-responsibilities.md` が正しく解決できること。
    on_failure: |
      fix-and-reverify を選択。
      「正本」表現の残置、列名の不一致、関心分担行の不足、相対リンク不正のいずれかを検出した場合、実装を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/responsibilities/document-type-responsibilities.md を開き、冒頭（`# 文書種別責務、配置基準` 直後、既存 japanese-tech-writing 注記の前）に役割分担注記が存在することを確認する。
      Grep 等で「正本とする」表現が当該注記内に含まれていないことを確認する。
    pass_criteria: |
      役割分担注記が引用ブロック（`>`）形式で存在すること。
      `../foundations/document-model.md` への相対リンクを含むこと。
      「正本とする」を使用せず、「参照する」「扱う」表現であること。
      document-model.md が扱う領域（基準境界、SPEC内部5論理区分、文書7分類、ドメイン別体系化規範）と本 SPEC が扱う領域（配置判定基準、実行主体分類、要件行書き方、SKILL構造、用語政策）の分担が記載されていること。
      相対リンク `../foundations/document-model.md` が正しく解決できること。
    on_failure: |
      fix-and-reverify を選択。
      「正本とする」表現の残置、相対リンク不正、関心分担記載不足のいずれかを検出した場合、実装を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/integrity/rule-ownership.md を開き、冒頭の位置づけ注記と「## req-impact-map.md との関係」セクションの存在を確認する。
      Grep 等で `※` 記号が当該追記部分に含まれていないことを確認する。
      あわせて req-impact-map.md の配置移動が Phase 1 対象外である旨が平文で記載されていることを確認する。
    pass_criteria: |
      位置づけ注記が引用ブロック形式で存在し、「全ドメイン横断メタファイル」であることを明示していること。
      「integrity/ 配下だが integrity ドメイン専用ではない」旨が記載されていること。
      「## req-impact-map.md との関係」セクションが存在し、逆方向マップであることが記載されていること。
      整合性維持運用として新規IR追加時・baseline_status 変更時・canonical owner 変更時の3点の同期運用が記載されていること。
      `※` 記号を使用していないこと。
      req-impact-map.md の配置移動が Phase 1 対象外であることが平文で記載されていること。
      相対リンク `../responsibilities/req-impact-map.md` が正しく解決できること。
    on_failure: |
      fix-and-reverify を選択。
      `※` 記号の使用、位置づけ注記の欠落、同期運用3点の不足、対象外明記の欠落、相対リンク不正のいずれかを検出した場合、実装を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      docs/specs/integrity/backticks-identifier-threshold.md を開き、「## 関連」セクションの内容を確認する。
      既存の関連セクションが差し替えられており、document-type-responsibilities.md との補完関係が明示されていることを確認する。
    pass_criteria: |
      「## 関連」セクションが document-type-responsibilities.md を用語政策 SSoT として明示していること。
      本 SPEC が「識別子と一般名詞の機械判定条件のみを定義する」位置づけであることが記載されていること。
      新設ではなく既存セクションの差し替えであり、関連3点（用語政策 SSoT / 機械判定アルゴリズム / 良パターン基準）が保持されていること。
      相対リンク `../responsibilities/document-type-responsibilities.md`、`../../../src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md`、`../local/runtime-package-boundary.md` が正しく解決できること。
    on_failure: |
      fix-and-reverify を選択。
      補完関係明示の欠落、関連3点のいずれかの欠落、相対リンク不正のいずれかを検出した場合、実装を修正して再検証する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

Phase 1（低リスク整合修正）の要件draft。docs/specs/ 再構成棚卸し結果（前回レポート）のうち、即時実施可能な6ファイルへの修正を1 RU にまとめた。

対象:
- docs/README.md（見出し旧表現修正）
- docs/DOC-MAP.md（旧表現・説明ブレ3点修正）
- docs/specs/foundations/document-model.md（他 SPEC との役割分担セクション新設）
- docs/specs/responsibilities/document-type-responsibilities.md（冒頭役割分担注記追記）
- docs/specs/integrity/rule-ownership.md（位置づけ注記 + req-impact-map.md との関係セクション新設）
- docs/specs/integrity/backticks-identifier-threshold.md（関連セクション差し替え）

Phase 1 では「補完関係の明示」にとどめ、強い SSoT 方向付け（どちらの SPEC を正とするか）は確定しない。document-model.md / document-type-responsibilities.md の役割分担は「主に扱う SPEC」列で示し、SSoT 確定は Phase 3（大きな再構成）の判断対象とする。

対象外（Phase 2/3 で別RU化）:
- Phase 2: foundations/workflow-contracts.md / local/local-transform.md の stub 整理方針（SPEC lifecycle 判断含む）
- Phase 3: document-model.md の節単位分割、design-principles.md の SPEC/ADR 境界整理、authoring/ ドメイン拡張または統合、req-impact-map.md 配置移動、responsibilities/ リネーム、ファイル移動全般

REQ/ADR 新規作成は不要。本件は既存 REQ-0156（docs/specs 基盤SPECドメイン別体系化）、REQ-0101（文書・REQ管理基準）の範疇。新規アーキ判断を含まないため ADR も不要。
