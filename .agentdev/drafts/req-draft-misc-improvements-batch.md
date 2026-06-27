# draft-data

```yaml
status: saved
topic: misc-improvements-batch
work_type: maintenance
scale: standard
summary: >
  6件の独立した関心領域を統合した misc improvements ドラフト。
  RU-0011（case-open Epic分解スコープ重複検知）は REQ-0132 APPEND + case-open SPEC update。
  RU-0012（session-context-detection.md orphan）は SKILL.md 参照追加の case-open 作業。
  RU-0016（scripts/配布境界）は runtime-package-boundary.md SPEC update。
  RU-0017（deprecated ADR-01XX配置）は IR-025 scope 明確化の SPEC update。
  RU-0018（command Step番号構造ずれ）は case-open SPEC + req-save SPEC の Step構造再構成。
  RU-0020（llm-expression-patterns第3節）は skill reference 修正の case-open 作業。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-001
      item: RU-0011 case-open Epic分解へのスコープ重複検知追加要否
      resolution: >
        Inferred。Epic #1231 子 Issue #1239 が別 Issue #1240 とスコープ重複し、
        空コミットPRにリソース消費された事象より、スコープ重複検知の追加を推奨。
        REQ-0132-016 の3軸判定（依存強度、Epicサイズ、機能的一貫性）に第4軸として
        「既存Issue スコープ重複」を追加する。実現手段（作業対象ファイル群照合等）は
        SPEC に配置する。
    - id: UQ-002
      item: RU-0012 session-context-detection.md の取扱い（参照追加 or 削除）
      resolution: >
        Inferred。session-context-detection.md は req-define Step1（セッションコンテキスト検知）
        の内容をカバーする。SKILL.md へ明示参照を追加し、orphan 状態を解消する。
        verification-log.md L36 で「未使用の参照ファイル」として別途 intake 候補と位置付けられた
        問題を是正する。
    - id: UQ-003
      item: RU-0016 scripts/ 配布対象の確定
      resolution: >
        Inferred。scripts/ 配下のTSソース、lib/、package.json、tsconfig.json、bun.lock、
        tests/ は配布対象。node_modules/ は .gitignore で除外済み。runtime-package-boundary.md の
        skill junction 範囲に scripts/ が含まれることを明記する。
    - id: UQ-004
      item: RU-0017 deprecated ADR-01XX の配置先
      resolution: >
        Inferred。REQ-0112-050 が「現行ADR コレクション（docs/adr/ADR-01XX.md）と
        廃止ADR コレクション（docs/adr/retired/ADR-00XX.md）を区別」と規定済み。
        deprecated ADR-01XX は現行番号帯であるため docs/adr/ に残留し、frontmatter status で
        管理する。IR-025 は ADR-00XX（旧番号帯）のみ対象とする現状が正しい。
    - id: UQ-005
      item: RU-0018 req-save Step 4-0 の Step N-0 禁止抵触解消方針
      resolution: >
        Inferred。Step 4-0 を Step 4 の前置条件として統合し、Step N-0 形式を廃止する。
        QG-1検証内容は Step 4 の冒頭に「前置条件」として記載する。
    - id: UQ-006
      item: RU-0020 復元不能 head word 4件（N/A）の扱い
      resolution: >
        Inferred。git blame で原因調査後に復元可能なものは補充し、復元不能なものは
        N/A 明示を維持する。L57 の書き換え列冗長性（「主要な〜」が検出パターンと重複）は
        「中心となる〜」に統一して是正する。
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  # RU-0011: case-open Epic分解スコープ重複検知
  - id: AG-001
    content: >
      case-open は Epic 分解時に既存オープン Issue とのスコープ重複を検知し、
      重複する子 Issue の生成を回避すること。スコープ重複の判定は作業対象ファイル群
      （artifact_actions の target、operation_units の対象SPEC/REQ）の照合により実施する。
      検知時は子 Issue の自動スキップまたはユーザー確認を経て生成を決定する。
      判定アルゴリズムの詳細は case-open SPEC に配置する。
    source: RU-0011
    classification: Inferred
  - id: AG-002
    content: >
      Epic分解の3軸判定（依存強度、Epicサイズ、機能的一貫性）に「既存Issue スコープ重複」を
      第4の判定軸として追加する。スコープ重複が検知された場合、当該子 Issue の生成を
      スキップし、Epic Issue本文に重複理由と参照先 Issue を記録する。
    source: RU-0011
    classification: Inferred

  # RU-0012: session-context-detection.md orphan
  - id: AG-003
    content: >
      src/opencode/skills/agentdev-req-analysis/SKILL.md に references/session-context-detection.md
      への明示参照を追加する。session-context-detection.md は req-define Step1
      （セッションコンテキスト検知）の詳細手順を提供し、SKILL.md の既存参照
      （explore-scope-refinement.md, req-define-detailed-gates.md）と同等の明示参照扱いとする。
      orphan 状態を解消し、inspect-skills 参照妥当性検証の対象外とする。
    source: RU-0012
    classification: Inferred

  # RU-0016: scripts/配布境界
  - id: AG-004
    content: >
      runtime-package-boundary.md に scripts/ 配下のJS エコシステム成果物の配布境界を追記する。
      配布対象: scripts/*.ts（TSソース）、lib/*.ts（共有ライブラリ）、tests/*.test.ts（テスト）、
      package.json、tsconfig.json、bun.lock、.gitignore、README.md。
      除外対象: node_modules/（.gitignore で除外済み、consumer 側で bun install により再生成）。
      scripts/ は skill junction（src/opencode/skills/agentdev-*/ → .opencode/skills/agentdev-*/）
      の配下に位置し、skill の一部として配布される。
    source: RU-0016
    classification: Inferred

  # RU-0017: deprecated ADR-01XX配置
  - id: AG-005
    content: >
      deprecated ADR-01XX（現行番号帯）は docs/adr/ に残留し、frontmatter status:deprecated で
      管理する。retired/ への移動は ADR-00XX（旧番号帯、REQ-0112-048）のみが対象。
      IR-025 は ADR-00XX（ADR-0*.md パターン）のみを retired/ 移動検出対象とする現状が正しい。
      IR-036 は status:deprecated を検出除外する現状が正しい（履歴参照、現行判断ではない）。
      runtime-package-boundary.md または IR-025 SPEC に deprecated ADR-01XX 配置規則を明記する。
    source: RU-0017
    classification: Inferred

  # RU-0018: command Step番号構造ずれ
  - id: AG-006
    content: >
      req-save SPEC（docs/specs/commands/req-save.md）の Step 4-0（QG-1検証）を Step 4 の
      前置条件として統合し、Step N-0 形式を廃止する。command-file-format.md が禁止する
      Step N-0 形式の抵触を解消する。QG-1検証内容は Step 4 の冒頭「前置条件」として記載し、
      REQ-0143-004（SPEC↔command Step番号一致）を維持する。
    source: RU-0018
    classification: Inferred
  - id: AG-007
    content: >
      case-open SPEC（docs/specs/commands/case-open.md）の Epic flow と Standard flow の
      Step番号空間を統一し、SPEC↔command定義間の番号一致を確保する。
      現状の Epic flow（Step 3, 5-9, 9-1）と Standard flow（Step 15-17, 17-1）の番号ギャップ
      （Step 10-14 未定義）を解消し、連続した番号体系へ再構成する。
      再構成後、command-file-format.md と REQ-0143-004 の整合を確認する。
    source: RU-0018
    classification: Inferred

  # RU-0020: llm-expression-patterns第3節
  - id: AG-008
    content: >
      llm-expression-patterns.md 第3節「空虚な形容・副詞」の L57 書き換え列冗長性を是正する。
      検出パターン「主要な〜」の書き換え先から同語「主要な〜」を削除し、「中心となる〜」
      または「必要性説明」に統一する。
    source: RU-0020
    classification: Inferred
  - id: AG-009
    content: >
      llm-expression-patterns.md 第3節 L54, L55, L59, L60 のN/A head word について、
      git blame でデータ欠損原因を調査し、復元可能なものは head word を補充する。
      復元不能なものは N/A 明示を維持し、解説列に「復元不能（git blame 確認済み）」として
      記録する。
    source: RU-0020
    classification: Inferred

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0132
    source_items: [AG-001, AG-002]
    content: |
      | REQ-0132-018 | case-open は Epic 分解時に既存オープン Issue とのスコープ重複を検知し、重複する子 Issue の生成をスキップまたはユーザー確認すること。スコープ重複の判定は作業対象ファイル群（artifact_actions の target、operation_units の対象）の照合により実施すること |
      | REQ-0132-019 | case-open はスコープ重複検知時、Epic Issue本文に重複理由と参照先 Issue 番号を記録すること |
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "### 本体リポジトリ sync"
    source_items: [AG-004]
    content: |
      ### 本体リポジトリ sync

      **配布対象ディレクトリ**:
      - `.opencode/commands/agentdev/` → junction → `src/opencode/commands/agentdev/`
      - `.opencode/skills/agentdev-*/` → junction → `src/opencode/skills/agentdev-*/`

      **scripts/ 配下の配布境界（skills/agentdev-*/scripts/ 配下）**:
      配布対象: `*.ts`（TSソース）、`lib/*.ts`（共有ライブラリ）、`tests/*.test.ts`（テスト）、`package.json`、`tsconfig.json`、`bun.lock`、`.gitignore`、`README.md`
      除外対象: `node_modules/`（.gitignore で除外済み、consumer 側で `bun install` により再生成）

      scripts/ は skill junction の配下に位置し、skill の一部として配布される。ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）。
    note: scripts/ 配下のJS エコシステム成果物の配布境界規則を新規追加
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/rules/IR-025-retired-adr-path-rule.md
    target_area: "## detection_method"
    source_items: [AG-005]
    content: |
      ## detection_method

      `docs/adr/ADR-0*.md`（ADR-0000〜ADR-0099、旧番号帯）の存在確認。

      **適用範囲**: ADR-00XX（旧番号帯、REQ-0112-048 に基づく retired/ 移動対象）のみ。
      ADR-01XX（現行番号帯）は status に関わらず docs/adr/ に残留する（deprecated ADR-01XX を含む）。
      deprecated ADR-01XX の配置は frontmatter status で管理し、retired/ への移動対象ではない。

      IR-036 が status:deprecated を work-means 検出から除外する（履歴参照、現行判断ではない）。
    note: deprecated ADR-01XX 配置規則の明確化を追加
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-save.md
    target_area: "### Step 4"
    source_items: [AG-006]
    content: |
      ### Step 4

      REQ ファイル操作（`agentdev-req-file-manager`）。

      **前置条件（QG-1 適用結果の整合性検証）**: 採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性を検証すること。検証不合格時は Step 3 へ差し戻す。

      #### Step 4-1
      （以降、既存の Step 4-1 以降の内容はそのまま）
    note: Step 4-0 を Step 4 の前置条件に統合し、Step N-0 形式を廃止
  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-open.md
    target_area: "### Step 3"
    source_items: [AG-007]
    content: |
      case-open SPEC の Epic flow と Standard flow の Step 番号を連続した番号体系へ再構成する。
      詳細な再構成後の Step 番号は case-open SPEC で定義する。
      再構成方針: Epic flow と Standard flow で共通する Step は同一番号を共用し、
      flow 固有の Step は連番で採番する。Step 10-14 の未定義ギャップを解消する。
    note: 具体的な再構成内容は case-open SPEC で定義する必要がある。この action は再構成の方針を規定する。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: REQ-0132
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0012
    operation: case-open-only
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0016
    target_spec: docs/specs/local/runtime-package-boundary.md
    operation: spec-update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0017
    target_spec: docs/specs/integrity/rules/IR-025-retired-adr-path-rule.md
    operation: spec-update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0018
    target_spec: docs/specs/commands/case-open.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0020
    operation: case-open-only
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >
      case-open Epic flow で、既存オープン Issue と作業対象ファイルが重複するOUを入力とした場合、
      重複検知が機能し、重複子 Issue の生成がスキップまたはユーザー確認されることを確認する。
    pass_criteria: >
      スコープ重複が検知され、Epic Issue本文に重複理由と参照先 Issue 番号が記録されること。
    on_failure: |
      action: fix-and-reverify
      description: 重複検知が機能しない場合、検知ロジックとファイル照合処理を修正して再検証する。
  - id: TS-002
    target_item: AG-003
    verification: >
      src/opencode/skills/agentdev-req-analysis/SKILL.md に session-context-detection.md への
      明示参照が追加されていることを確認する。
    pass_criteria: >
      SKILL.md に references/session-context-detection.md への参照行が存在すること。
    on_failure: |
      action: fix-and-reverify
      description: 参照が未追加の場合、SKILL.md を修正して再確認する。
  - id: TS-003
    target_item: AG-004
    verification: >
      docs/specs/local/runtime-package-boundary.md に scripts/ 配下の配布境界規則が追記されている
      ことを確認する。
    pass_criteria: >
      runtime-package-boundary.md に scripts/ 配布対象・除外対象の一覧が記載されていること。
    on_failure: |
      action: fix-and-reverify
      description: 規則が未追記の場合、SPEC を修正して再確認する。
  - id: TS-004
    target_item: AG-005
    verification: >
      docs/specs/integrity/rules/IR-025-retired-adr-path-rule.md に deprecated ADR-01XX 配置規則の
      明確化が追記されていることを確認する。
    pass_criteria: >
      IR-025 SPEC に「ADR-01XX（現行番号帯）は status に関わらず docs/adr/ に残留」という記載があること。
    on_failure: |
      action: fix-and-reverify
      description: 明確化が未追記の場合、SPEC を修正して再確認する。
  - id: TS-005
    target_item: AG-006
    verification: >
      docs/specs/commands/req-save.md に Step 4-0 が存在しないことを確認する。
      Step 4 の前置条件として QG-1検証が統合されていることを確認する。
    pass_criteria: >
      req-save.md に「Step 4-0」の記載が存在しないこと。Step 4 に前置条件としてQG-1検証が
      記載されていること。
    on_failure: |
      action: fix-and-reverify
      description: Step 4-0 が残存する場合、SPEC を修正して再確認する。
  - id: TS-006
    target_item: AG-008
    verification: >
      llm-expression-patterns.md 第3節 L57 の書き換え列に「主要な〜」が含まれていないことを確認する。
    pass_criteria: >
      L57 の書き換え列が「中心となる〜」または「必要性説明」に是正されていること。
    on_failure: |
      action: fix-and-reverify
      description: 冗長表現が残存する場合、ファイルを修正して再確認する。

case_open_hints:
  epic_needed: false
  wave_hints:
    wave_1: [OU-001, OU-002, OU-003, OU-004, OU-006]
    wave_2: [OU-005]
```

## 補助情報

### RU-0011 の位置付け

Epic #1231 子 Issue #1239 が別 Issue #1240 とスコープ重複し、空コミットPRにリソース消費された。
case-open Epic分解ロジックにスコープ重複検知を追加する。REQ-0132 へ APPEND（REQ-0132-018, 019）。
詳細アルゴリズムは case-open SPEC に配置する。REQ-0132 SPLIT metrics: 17→19行、0 → APPEND許可。

### RU-0012 の位置付け

session-context-detection.md は verification-log.md L36 で「未使用の参照ファイル」として記録済み。
SKILL.md へ明示参照を追加し orphan を解消する。REQ-0103-113 は req-define command の内部ファイル名
直接参照を禁止するが、SKILL.md 自身の参照は許可される。case-open 作業。

### RU-0016 の位置付け

PR#1154 で scripts/ 配下にTS スクリプト群が新設されたが、runtime-package-boundary.md が配布境界を
未規定。scripts/ は skill junction の配下に位置し、既存の配布メカニズムで配布される。
SPEC に明示的な配布対象・除外対象一覧を追記する。

### RU-0017 の位置付け

ADR-0113（deprecated）が docs/adr/ に残留。IR-025 は ADR-00XX（旧番号帯）のみ対象とする現状が正しい。
REQ-0112-050 が「現行ADR コレクション（ADR-01XX.md）と廃止ADR コレクション（ADR-00XX.md）の区別」を
規定済み。IR-025 SPEC に deprecated ADR-01XX 配置規則を明記し、誤解を防ぐ。

### RU-0018 の位置付け

command-file-format.md が Step N-0 形式を禁止するが、req-save SPEC が Step 4-0 を使用。
Step 4-0 を Step 4 の前置条件に統合して解消する。case-open SPEC の Epic/Standard flow 番号ギャップ
（Step 10-14 未定義）も連続番号へ再構成する。SPEC 更新後、command 定義も追従更新する（case-open作業）。

### RU-0020 の位置付け

llm-expression-patterns.md 第3節に3問題（L57冗長性、head word欠損4件、復元不能）。
L57 是正と git blame 調査を case-open で実施する。skill reference の修正であり REQ/SPEC 変更不要。

### REQ健全性メトリクス

- REQ-0132: 17行 → 19行（+2 APPEND）。関心分類数1、成果物種別数1。SPLIT metrics: 0 → APPEND許可
- REQ-0112: 変更なし（既存 REQ-0112-050 がカバー）
- REQ-0143: 変更なし（Group B で REQ-0143-004 表記変更を予定）
