---
draft_type: req_draft
topic_slug: inspection-tool-accuracy
status: saved
spec_actions_consumed: true
created_at: 2026-07-23T09:46:17+09:00
source_rus: [RU-0011, RU-0012, RU-0013, RU-0026]
agentdev_handoff: true
---

# draft-data

```yaml
work_type: feature
scale: large

summary: |
  C3（検査ツール精度改善）は、4件の RU を6個の操作単位へ分解する。
  RU-0011 は ReferencePath placeholder、IR-055 集計、NG baseline 出力を扱う。
  RU-0012 は由来ラベル付きの NG baseline 差分追加と、既存未管理 NG の実修復を扱う。
  RU-0013 は配布物整合性診断へ、存在しない command 参照とエンコーディング不整合の検出を追加する。
  RU-0026 は更新要否判定を行レベルの意味差分（導出元変化ベース）へ限定する。
  検査精度の一般要件は恒久契約（SPEC 配置）として artifact_actions に記録する。
  個別 checker/script の是正と既存未管理 NG の実修復は、是正対象（実装配置）として operation_units に記録する。
  artifact_actions には REQ/ADR/SPEC 操作のみを含み、実装変更は含まない（共通方針4）。
  4件の RU が checker、rule、script、test の複数成果物を更新し、影響範囲が広いため、scale は large とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、ReferencePath 検査は、`references/<harness>.md` のように山括弧で置換対象を表すパスをリテラルなファイル参照として扱わない。
      placeholder を含む参照は検査対象外とし、具体的な未解決パスは従来どおり NG とする。
      是正対象として、checker/script の分岐と回帰テストを是正する。

  - id: AG-003
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、NG baseline を適用した検査出力は、baseline 既知 NG と新規 NG の件数を別々に示す。
      delta の表現は、新規 NG の件数だけでなく、既知 NG を info へ降格した件数を識別できる状態にする。
      是正対象として、checker/script の出力と回帰テストを是正する。

  - id: AG-004
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、`--update-ng-baseline` は、現在の NG 全体を無条件に再生成して取り込まない。
      明示した由来ラベルと理由を持つ承認済み差分だけを baseline へ追加する。
      追加対象でない既存未管理 NG は baseline へ取り込まず、実修復対象として残す。
      是正対象として、checker/script、baseline データ、回帰テストを是正する。

  - id: AG-005
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、NG baseline の記録とレポートは、baseline 既知 NG、由来付きで承認済みの追加分、新規かつ未管理の NG を区別する。
      既存未管理 NG は修復候補として追跡可能であり、baseline 更新だけで解決済みと扱わない。
      是正対象として、分類処理、報告処理、回帰テストを是正する。

  - id: AG-006
    content: |
      本項目は是正対象（実装配置）であり、恒久契約（SPEC 配置）を追加しない。
      `mapping-table-completeness` の既存未管理 NG を、対象となる対応表の不足を補うことで実修復する。
      修復後は当該 NG を baseline に依存せず解消する。

  - id: AG-007
    content: |
      本項目は是正対象（実装配置）であり、恒久契約（SPEC 配置）を追加しない。
      `runtime-unresolved-reference` の既存未管理 NG を、導入先で解決できない参照の除去または実行時に解決できる表現への置換で実修復する。
      修復後は当該参照を baseline 更新だけで抑止しない。

  - id: AG-008
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、配布物整合性診断は、README listing と command 本文の相互参照に存在しない command を指す参照を検出事項として出力する。
      実在する command を指す参照は検出対象にしない。
      是正対象として、診断定義と検査データを是正する。

  - id: AG-009
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、配布物整合性診断は、配布物 Markdown の UTF-8 BOM と単一ファイル内の CRLF/LF 混在をエンコーディング不整合として検出事項にする。
      BOM なし UTF-8 と単一の改行コードで構成されたファイルは検出対象にしない。
      是正対象として、診断定義と検査データを是正する。

  - id: AG-010
    content: |
      本項目は恒久契約（SPEC 配置）と是正対象（実装配置）を分離して扱う。
      恒久契約として、更新要否判定は、変更ファイルの存在または変更種別名だけで README 更新要否または extensions 検査要否を true にしない。
      次の導出元が変化したかを判定基準とする。
      - 文書の追加、削除、移動、名称変更
      - 索引に使用される frontmatter 値
      - 公開入口、manifest、一覧に影響する値
      - extension が参照する対象や責務
      - DOC-MAP や README の生成元情報
      相互参照追記、相対パス是正、表記修正など、上記導出元に影響しない変更では更新要否フラグを立てない。
      是正対象として、checker/script の判定ロジックと回帰テストを是正する。

  - id: AG-011
    content: |
      本項目は AG-010 の導出元ベース判定を REQ と SPEC の README 更新要否へ具体化する。
      恒久契約として、requirements_readme_update_required と spec_readme_update_required は、対象 REQ または SPEC の追加、削除、移動、名称変更、または索引に使用される frontmatter 値（id、title、status 等）の変更がある場合だけ true にする。
      本文相互参照の追記、相対パス是正、表記修正など、索引導出元に影響しない変更では両フラグを false にする。
      是正対象として、checker/script と回帰テストを是正する。

# artifact_actions: 恒久契約（SPEC 配置）と是正対象（実装配置）を別 action として記録する。
# 是正対象の具体的な変更対象は operation_units に記録する。
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: "## reference-path-existence 検出における backtick 囲みパスの扱い（REQ-0144-020）"
    source_items: [AG-001]
    content: |
      ## reference-path-existence 検出における backtick 囲みパスの扱い（REQ-0144-020）

      `checkScriptTemplateReferencePaths`（`check_integrity.ts`）は command 定義と SKILL.md から抽出したパス参照（`.opencode/**`、`scripts/*.ts`、`templates/*.md`、`references/*.md`）の実在確認を行う。このとき Markdown backtick で囲まれたパス成分はインラインコード修飾（code formatting）と解釈し、パス解決前に backtick を除去する（例: `.opencode/commands/agentdev/templates/case-close/\`agentdev-push-failed\`.md` → `.opencode/commands/agentdev/templates/case-close/agentdev-push-failed.md`）。backtick 囲みのパス成分を実在確認する既存契約は維持する。

      パス成分に `<...>` 形式の placeholder を含む参照は置換前のパラメータ表現として扱い、実在確認の対象外とする。placeholder を含まない具体パスには実在確認を行い、未解決の場合は NG を報告する。

      | 取扱い | 根拠 |
      |--------|------|
      | backtick 囲み成分をパス参照として解釈する | 読者は当該箇所をナビゲーション先とみなし得る。実在確認を行うことでリンク切れを防止する |
      | パス解決前に backtick を除去する | backtick は Markdown の修飾記号であり、ファイルシステム上のパス成分ではない。修飾起因で実在確認が偽陰性となることを防ぐ |
      | `<...>` 形式の placeholder を含む参照を実在確認の対象外とする | placeholder は具体パスではなく置換対象のパラメータ表現である。実在確認を行うと必ず偽陰性となるため対象外とする |
      | 報告時の evidence は backtick 含む原文を保持する | 著者が修正箇所を特定しやすくするため |

      本扱いは backtick 囲みをインラインコード表現として検出対象から除外する運用（パス参照として解釈しない運用）と対比した上で、実在確認の価値を維持するためパス参照として解釈する運用を採用した。検出ロジック（`check_integrity.ts`）と本節の記述は整合している。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: "## NG baseline 運用手順（全カテゴリ strict pass、REQ-0161-005 統合）"
    source_items: [AG-003, AG-004, AG-005]
    content: |
      ## NG baseline 運用手順（全カテゴリ strict pass、REQ-0161-005 統合）

      `check_integrity.ts` と `check_extensions.ts` は、既知の NG 集合を NG baseline として `.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json` へ格納する。各実行は「当該変更起因の新規 NG が 0 件であること」を以て strict pass（exit 0）と判定する。既知 NG が残存する状態でも strict pass が到達可能な構造を提供する（REQ-0161-005）。

      baseline は `category` / `check` / `file` / `evidence` の4組を bucket key とする集計値（`count`）を持つ。実行結果は同 bucket key で集計し、各 bucket について現在の count が baseline count 以下であれば当該 NG を `info`（observation）へ降格する。現在の count が baseline count を超える bucket に属する NG は新規 NG として `ng` / `warning` レベルを維持し、exit code を非ゼロにする。

      | 項目 | 定義 |
      |------|------|
      | 適用対象 | `check_integrity.ts` と `check_extensions.ts` の出力全カテゴリ（ADR、Canonical、CanonicalConflict、Inventory、LinkIntegrity、MappingTable、RuntimeReference 等）。`level` が `ng` または `warning` の結果を対象とする |
      | baseline 形式 | `version`, `rule_id: "NG-BASELINE"`, `generated_at`, `entries[]`（各 entry は `category` / `check` / `file`（null 許容）/ `evidence`（null 許容）/ `count` / `provenance`（由来ラベル）/ `reason`（承認理由）を持つ）|
      | bucket key | `${category}\t${check}\t${file||""}\t${evidence||""}` の4組。同一 bucket 内の複数結果は `count` で集計する |
      | pass 判定 | 全 bucket で現在 count ≤ baseline count を満たす場合に strict pass（exit 0）。1 bucket でも超過があれば非 pass（exit 非ゼロ）|
      | 報告形式 | baseline 既知 NG（`info` 降格件数）、承認済み追加分（由来ラベル付き baseline 追加件数）、新規かつ未管理の NG（非 pass 起因件数）の3分類を件数で区別して示す。新規 NG 件数だけを報告する形式は採らず、既知 NG を `info` へ降格した件数を識別可能にする |
      | 降格動作 | baseline 既知の bucket では、現在 count が baseline count 以下の範囲の NG を `info`（observation）へ降格し、`[baseline-known]` prefix を付与する。降格済み NG は PR review で情報参照扱いとする |
      | 更新タイミング | 周辺文書の改修、ファイル削除、対象外領域の再編等により既知 NG の見え方が変化した場合。新規の strict 違反は baseline 更新ではなく実装修復を必須とする（NG 隠蔽禁止、後述「NG 隠蔽（禁止）」参照）|
      | 更新実行者 | agent-dev-flow リポジトリの maintainer。PR を経由して更新する |
      | 更新実行手順 | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ng-baseline`（`check_extensions.ts` も同様）は現行 NG 全体を無条件に再生成して取り込まない。承認済み差分に由来ラベル（`provenance`）と理由（`reason`）を付与して baseline entry へ追加する。追加対象でない既存未管理 NG は baseline へ取り込まず実修復対象として残す。更新後は `--json` 実行で新規 NG が 0 件になることを確認する |
      | 更新非対象 | 当該変更に直接起因する新規 NG。これらは baseline 更新で隠蔽せず、必ず実装修復を行う。既存未管理 NG は baseline 更新だけで解決済み扱いとせず、修復候補として追跡可能な状態を維持する |

      RuntimeReference baseline（IR-055、前節）は heuristic 違反の段階導入を目的とし、本 NG baseline は strict 違反（`ng` / `warning`）の既知集合を管理して「既知違反の解消」により strict pass を到達可能にすることを目的とする。両 baseline は独立に運用し、相互に影響しない。NG baseline は REQ-0161-005（旧 `docs/requirements/REQ-0161.md`、現 `docs/requirements/retired/REQ-0161.md`）から SPEC 統合された恒久契約である。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: docs-spec-rebuild-integrity
    target_area: "## 構文健全性検査"
    source_items: [AG-008, AG-009]
    content: |
      ## 構文健全性検査

      - frontmatter 重複検出パターン
      - 見出し（タイトル、入力、出力、手順）重複検出パターン
      - Markdown 構文破損検出パターン
      - 存在しない command 参照の検出パターン
      - エンコーディング不整合の検出パターン

      存在しない command 参照の検出は、README listing と command 本文の相互参照について、存在しない command を指す参照を検出事項として出力する。実在する command を指す参照は検出対象にしない。

      エンコーディング不整合の検出は、配布物 Markdown の UTF-8 BOM の有無と改行コードの一貫性を検査し、UTF-8 BOM 付きファイルまたは単一ファイル内の CRLF/LF 混在を検出事項とする。BOM なし UTF-8 かつ単一の改行コードで構成されたファイルは検出対象にしない。

      これらの検出は配布物整合性診断を提供する各 command（inspect-docs、inspect-skills）に共通で適用する。診断カテゴリ、共通証拠構造、finding 出力契約は agentdev-doc-diagnostics skill（`docs/specs/skills/agentdev-doc-diagnostics.md`「検証観点」「See Also」が正規所有箇所）を正規所有者とし、本 SPEC は検出パターンの定義に特化する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: targeted-docs-guard-implementation
    target_area: "## full_docs_check_recommended 条件"
    source_items: [AG-010, AG-011]
    content: |
      ## full_docs_check_recommended 条件

      更新要否フラグ（`requirements_readme_update_required`、`spec_readme_update_required`、`extensions_check_required`、`full_docs_check_recommended`）は、変更ファイルの存在または変更種別名ではなく、行レベル差分が次の導出元へ影響するかで判定する。

      - 文書の追加、削除、移動、名称変更
      - 索引に使用される frontmatter 値（id、title、status 等）
      - 公開入口、manifest、一覧に影響する値
      - extension が参照する対象や責務
      - DOC-MAP や README の生成元情報

      REQ と SPEC の README 更新要否（`requirements_readme_update_required`、`spec_readme_update_required`）は、対象文書の追加、削除、移動、名称変更、または索引に使用される frontmatter 値の変更で `true` とする。相互参照追記、相対パス是正、表記修正など、上記導出元に影響しない変更では全フラグを `false` にする。

      case-close profile の `full_docs_check_recommended` の判定条件（REQ-0158 より移管）。以下の変更を検出した場合に `true` とする。

      - integrity rule追加・削除・大幅変更
      - DOC-MAP構造変更
      - `docs/specs/` の大規模移動・改名
      - `repo-agentdev-integrity` の検査スコープ変更
      - 文書分類・責務境界の基準変更
      - `docs/specs/integrity/rules/**`、`integrity-rule-catalog.md`、`rule-ownership.md`、`document-model.md`、`document-type-responsibilities.md`、`docs/DOC-MAP.md`、`docs/specs/README.md`、`.agentdev/doc-inputs/**` の変更

conflict_resolutions:
  - id: CR-001
    conflict: |
      入力では check_integrity.ts と check_changed_docs.ts を src/opencode/** 配下の配布物として扱う前提がある。
      現行リポジトリでは両スクリプトは .opencode/skills/repo-agentdev-integrity/scripts/ 配下の repo-local 検査実装であり、src/opencode/** は主な検査対象である。
    resolution: |
      AG-001 から AG-007 と AG-010 から AG-011 のスクリプト変更は repo-local 検査実装の変更として operation_units に配置する。
      配布物参照境界は、当該スクリプトが src/opencode/** の配布物を検査する責務を持つ点で維持する。
      AG-008 と AG-009 は src/opencode/commands/agentdev/ の inspect 定義を更新する配布物変更として扱う。

  - id: CR-002
    conflict: |
      RU-0026 の暫定分類は REQ である。
      しかし変更対象は checker の行レベル差分判定、フロントマター判定、false positive 抑止方式であり、REQ-0108 はこれらの個別詳細を SPEC、script、test へ配置すると定めている。
    resolution: |
      ADR-0139 の最終分類責務と REQ-0101-068 に従い、AG-010 と AG-011 を実装詳細 SPEC の更新として確定する。
      REQ-0108 への新規要件行は生成しない。
      既存の changed docs guard に関する恒久的な利用者向け契約は REQ-0108-279 から REQ-0108-282 が保持する。

  - id: CR-003
    conflict: |
      integrity-rule-catalog.md には、IR-055 の heuristic 行内複数パターン集計仕様がすでに存在する。
    resolution: |
      IR-055 heuristic 行内複数パターン集計仕様は catalog へ既規定である（L168-180）。
      catalog を正本とし、実装が既存仕様を満たす場合に重複追記を行わず、差分がある場合だけ仕様または実装を整合させる。

  - id: CR-004
    conflict: |
      mapping-table-completeness 58件と runtime-unresolved-reference の個別修復は、現在の作業量と対象を表す情報である。
    resolution: |
      REQ-0101-060 に従い、現在の件数、対象ファイル、修復順序を REQ、ADR、SPEC の本文へ残さない。
      AG-006 と AG-007 の具体的な修復は OU-004 と OU-005、Issue の完了条件、テスト戦略で扱う。

# operation_units: 是正対象（実装配置）を記録する。
# 各 OU は関連する SPEC、checker/script、rule、test を対象に含める。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    source_actions: [ACT-SPEC-001]
    target_artifacts:
      - docs/specs/integrity/integrity-contracts.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_reference_paths.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

  - ou_id: OU-003
    source_ru: RU-0012
    source_actions: [ACT-SPEC-003]
    target_artifacts:
      - docs/specs/integrity/integrity-contracts.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
      - .opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result: {}

  - ou_id: OU-004
    source_ru: RU-0012
    source_actions: []
    target_artifacts:
      - docs/requirements/mapping-table.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: epic
    result: {}

  - ou_id: OU-005
    source_ru: RU-0012
    source_actions: []
    target_artifacts:
      - src/opencode/commands/agentdev/**/*.md
      - src/opencode/skills/agentdev-*/**/*.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}

  # OU-006: docs-spec-rebuild-integrity.md と inspect-* command 定義が扱う
  # 配布物整合性検査カテゴリ、共通証拠構造、finding 出力契約、ルーティングは
  # agentdev-doc-diagnostics（docs/specs/skills/agentdev-doc-diagnostics.md
  # 「検証観点」「See Also」が正規所有箇所）を正規所有者とする。
  # 本 OU は正規所有スキル配下も更新対象に含める。
  - ou_id: OU-006
    source_ru: RU-0013
    source_actions: [ACT-SPEC-004]
    target_artifacts:
      - docs/specs/integrity/docs-spec-rebuild-integrity.md
      - src/opencode/commands/agentdev/inspect-docs.md
      - src/opencode/commands/agentdev/inspect-skills.md
      - src/opencode/skills/agentdev-doc-diagnostics/SKILL.md
      - src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md
      - src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-routing.md
      - src/opencode/skills/agentdev-doc-diagnostics/references/finding-output-contract.md
      - .opencode/skills/repo-agentdev-integrity/scripts/commands_e2e.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

  - ou_id: OU-007
    source_ru: RU-0026
    source_actions: [ACT-SPEC-005]
    target_artifacts:
      - docs/specs/integrity/targeted-docs-guard-implementation.md
      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.test.ts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      `<harness>` を含む ReferencePath と、同じ形式ではない未解決パスを含む検査データに check_integrity.ts を実行する。
    pass_criteria: |
      placeholder を含む参照は ReferencePath NG を出さない。
      具体的な未解決パスは ReferencePath NG として報告される。
    on_failure: |
      fix-and-reverify。placeholder 判定または実在確認の分岐を修正し、同じ検査データで再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      baseline 既知 NG と、基準を超えて追加された NG を含む検査データで check_integrity.ts を実行する。
    pass_criteria: |
      実行結果に baseline 既知 NG の件数と新規 NG の件数が別々に現れる。
      新規 NG だけが非ゼロ終了の原因になる。
    on_failure: |
      fix-and-reverify。baseline 適用後の集計またはメッセージ構成を修正し、同じ検査データで再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      承認済み由来ラベルを持つ差分と、由来ラベルを持たない既存 NG を含む状態で `--update-ng-baseline` を実行する。
    pass_criteria: |
      承認済み差分だけが由来ラベルと理由を保持して baseline へ追加される。
      未管理 NG は baseline へ取り込まれない。
    on_failure: |
      fix-and-reverify。CLI 引数、baseline entry、または追加処理を修正し、baseline ファイルの内容と再実行結果を確認する。

  - id: TS-005
    target_item: AG-005
    verification: |
      baseline 既知 NG、承認済み追加分、新規かつ未管理の NG を同時に含む検査データで JSON とテキストの報告を確認する。
    pass_criteria: |
      3種類の NG が混同されず、未管理 NG が実修復対象として識別できる。
    on_failure: |
      fix-and-reverify。結果分類または報告形式を修正し、各分類を含む検査データで再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      docs/requirements/mapping-table.md の修復後に check_integrity.ts を実行し、mapping-table-completeness の結果を確認する。
    pass_criteria: |
      既存未管理の mapping-table-completeness NG が実修復により報告されない。
      baseline 更新だけで結果を抑止していない。
    on_failure: |
      fix-and-reverify。対応する mapping-table の不足を補い、full audit と回帰テストを再実行する。

  - id: TS-007
    target_item: AG-007
    verification: |
      導入先で解決できない既存参照を修復した後に IR-055 full audit を実行する。
    pass_criteria: |
      修復対象の runtime-unresolved-reference が検出されない。
      baseline 更新だけで未解決参照を info へ降格していない。
    on_failure: |
      fix-and-reverify。未解決参照を除去または導入先で解決できる表現へ置換し、IR-055 回帰テストと full audit を再実行する。

  - id: TS-008
    target_item: AG-008
    verification: |
      README listing と command 本文に廃止済み command 参照を含む配布物検査データを用意し、inspect-docs と inspect-skills の診断結果を確認する。
    pass_criteria: |
      存在しない command 参照は根拠ファイルと行を持つ検出事項として出力される。
      実在する command 参照は検出事項にならない。
    on_failure: |
      fix-and-reverify。command 存在判定または参照抽出を修正し、正例と負例の検査データで再検証する。

  - id: TS-009
    target_item: AG-009
    verification: |
      UTF-8 BOM 付きファイル、CRLF/LF が混在するファイル、BOM なし UTF-8 かつ単一改行コードのファイルを含む配布物検査データで inspect-docs と inspect-skills を実行する。
    pass_criteria: |
      BOM と改行コード混在は検出事項になる。
      BOM なし UTF-8 かつ単一改行コードのファイルは検出事項にならない。
    on_failure: |
      fix-and-reverify。バイト列または改行コードの判定を修正し、3種類の検査データで再検証する。

  - id: TS-010
    target_item: AG-010
    verification: |
      REQ 相互参照の追記、SPEC 内相対パスの是正、表記修正だけを含む差分で check_changed_docs.ts を実行する。
    pass_criteria: |
      spec_readme_update_required、requirements_readme_update_required、extensions_check_required は false になる。
      実質的な索引更新が必要な差分に対する既存の検出は維持される。
    on_failure: |
      fix-and-reverify。行レベル差分の分類またはフラグ判定を修正し、軽微変更と実質変更の両方で再検証する。

  - id: TS-011
    target_item: AG-011
    verification: |
      REQ または SPEC の追加、削除、名称変更、索引に影響する YAML フロントマター変更を含む差分で check_changed_docs.ts を実行する。
    pass_criteria: |
      対応する README 更新要否フラグが true になる。
      本文のみの変更では同じフラグが false のままになる。
    on_failure: |
      fix-and-reverify。フロントマター差分と文書ライフサイクル差分の判定を修正し、正例と負例で再検証する。

case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  decomposition: |
      C3 は backlog26-rus-integrated Epic の子 Issue 群として扱う。
      OU-001 と OU-003 は同じ repo-local checker/script を編集するが、異なるロジック（placeholder 判定と NG baseline 集計）を修正するため意味的依存がない。並列実行を許容し、case-run は実装時にマージ競合に注意する。
      OU-004 と OU-005 は既存未管理 NG の実修復であり、OU-003 の baseline 運用導入とは独立して実施可能。並列実行を許容する。
      OU-006 は inspect 定義と配布物整合性 SPEC を更新する独立した子 Issue とする。
      OU-007 は変更文書限定検査の checker/script と回帰テストを更新する独立した子 Issue とする。
  wave_hints:
    - "Wave 1: OU-001、OU-003、OU-004、OU-005、OU-006、OU-007。意味的依存がないため並列可能。check_integrity.ts と check_integrity.test.ts を複数 OU で共有するが異なるロジック/テストケースを修正するため、case-run は実装時にマージ競合に注意する。"
  adr_candidates: |
    新規 ADR は不要である。
    REQ-0101-060 の是正は現行文書から作業記録を除く編集規律であり、新しい設計判断ではない。
    配布物参照境界は REQ-0108-263/264 と既存の integrity SPEC を維持する範囲であり、変更しない。
    任意の false positive 抑止フラグを後続で導入する場合は、濫用防止、理由の保存、許可主体を長期運用として決めるため、ADR 要否を再評価する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0011
    source_item: AG-002
    disposition: covered
    reason_code: already_satisfied
    reason: |
      AG-002 の恒久契約部分は既充足。IR-055 行内複数パターン集計仕様は catalog L168-180 に既規定であり、catalog が正本である。IR-055 個別ルールファイル（rules/IR-055-runtime-unresolved-reference.md）は catalog を参照すればよい。実装が catalog 仕様へ適合していることは case-run で確認する。元ドラフトでは AG-002 とともに ACT-SPEC-002、ACT-SPEC-006、TS-002、OU-002 を結合して記載していたが、これらは本判断により除外された関連項目として related_removed_items へ分離した。
    evidence:
      - path: docs/specs/integrity/integrity-rule-catalog.md
        section: "### IR-055 heuristic 行内複数パターン集計仕様（REQ-0108-263/264）"
        checked_at_commit: null
    related_removed_items: [ACT-SPEC-002, ACT-SPEC-006, TS-002, OU-002]

  - id: RD-002
    source_item: ACT-IMPL-001
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-001 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。元ドラフトでは source_ru に RU-0011/0012/0013/0026 を結合し、source_item に ACT-IMPL-001〜007 を範囲指定していたが、新スキーマへ合わせて RU 判別を省略し item 単位へ分割した。
    evidence: []
    related_removed_items: [ACT-IMPL-001]

  - id: RD-003
    source_item: ACT-IMPL-002
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-002 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-002]

  - id: RD-004
    source_item: ACT-IMPL-003
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-003 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-003]

  - id: RD-005
    source_item: ACT-IMPL-004
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-004 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-004]

  - id: RD-006
    source_item: ACT-IMPL-005
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-005 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-005]

  - id: RD-007
    source_item: ACT-IMPL-006
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-006 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-006]

  - id: RD-008
    source_item: ACT-IMPL-007
    disposition: not_applicable
    reason_code: superseded_by_operation_units
    reason: |
      共通方針4（artifact_actions は REQ/ADR/SPEC 操作のみ）へ従い、実装変更は operation_units.target_artifacts へ集約した。ACT-IMPL-007 は operation_units と重複していたため削除し、対応する OU の target_artifacts で実装ファイルを明示済みである。
    evidence: []
    related_removed_items: [ACT-IMPL-007]
```

# summary

C3 は検査精度を高める4件の RU を、恒久契約（SPEC 配置）と是正対象（実装配置）へ分離した要件ドラフトである。

RU-0011 は ReferencePath placeholder、IR-055 集計、NG baseline 出力の恒久契約と是正を扱う。

RU-0012 は由来ラベル付き baseline 差分追加の恒久契約と、既存未管理 NG の実修復を扱う。

RU-0013 は配布物整合性診断へ、存在しない command 参照とエンコーディング不整合の検出を追加する。

RU-0026 は更新要否判定の恒久契約と、checker 個別の誤検出抑止を実装詳細 SPEC と是正対象へ分離する。

クラスタ全体の work_type は feature、scale は large とする。

4件の RU が checker、rule、script、test の複数成果物を更新し、影響範囲が広いためである。
