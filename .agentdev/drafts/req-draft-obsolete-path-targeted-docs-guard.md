---
draft_type: req_draft
topic_slug: obsolete-path-targeted-docs-guard
status: saved
created_at: 2026-07-02T00:00:00+09:00
source_rus:
  - RU-20260701-doc-control-plane-targeted-docs-guard
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >-
  旧SPEC直下パス（docs/specs/system.md 等）をドメイン分割パス（docs/specs/foundations/system.md 等）に修正（現行REQ 11件超 + ADR 4件 + src/opencode-local/ 3件）、生成方式残骸（src/opencode-local/generation-flow.md）を廃止、obsolete-path-map.yaml（旧パス→新パス対応表）+ IR-057 を導入、targeted docs guard（check_changed_docs.ts）を req-save/spec-save/case-close に組み込み、repo-agentdev-integrity の docs/specs/**/*.md 再帰対応を実施する。ADR-0131 決定#4（generation-flow.md 廃止候補）を廃止確定に UPDATE する。新規 ADR は不要（targeted docs guard / obsolete-path-map / repo-integrity 再帰はすべて既存REQ具体化）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      旧SPEC直下パス（docs/specs/system.md、docs/specs/patterns.md、docs/specs/design-principles.md、docs/specs/document-model.md、docs/specs/document-type-responsibilities.md、docs/specs/artifact-contracts.md、docs/specs/artifact-responsibilities.md、docs/specs/req-impact-map.md、docs/specs/quality-specs.md、docs/specs/quality-gates.md、docs/specs/req-health-metrics.md、docs/specs/spec-health-metrics.md、docs/specs/integrity-rule-catalog.md、docs/specs/integrity-contracts.md、docs/specs/rule-ownership.md、docs/specs/docs-spec-rebuild-integrity.md、docs/specs/backticks-identifier-threshold.md、docs/specs/local-generation.md、docs/specs/local-case-file.md、docs/specs/runtime-package-boundary.md、docs/specs/command-file-format.md、docs/specs/workflow-contracts.md 等）を、現行のドメイン分割パス（docs/specs/foundations/system.md、docs/specs/foundations/patterns.md、docs/specs/foundations/design-principles.md、docs/specs/foundations/document-model.md、docs/specs/responsibilities/document-type-responsibilities.md、docs/specs/responsibilities/artifact-contracts.md、docs/specs/responsibilities/artifact-responsibilities.md、docs/specs/responsibilities/req-impact-map.md、docs/specs/quality/quality-specs.md、docs/specs/quality/quality-gates.md、docs/specs/quality/req-health-metrics.md、docs/specs/quality/spec-health-metrics.md、docs/specs/integrity/integrity-rule-catalog.md、docs/specs/integrity/integrity-contracts.md、docs/specs/integrity/rule-ownership.md、docs/specs/integrity/docs-spec-rebuild-integrity.md、docs/specs/integrity/backticks-identifier-threshold.md、docs/specs/local/local-generation.md、docs/specs/local/local-case-file.md、docs/specs/local/runtime-package-boundary.md、docs/specs/authoring/command-file-format.md、docs/specs/workflows/workflow-contracts.md 等）へ修正する。修正対象は現行REQ 11件超（REQ-0101, REQ-0103, REQ-0108, REQ-0112, REQ-0119, REQ-0124, REQ-0126, REQ-0137, REQ-0140, REQ-0143, REQ-0144, REQ-0145, REQ-0152 等の現行REQ本文中の旧SPEC直下パス参照）、現行ADR 4件（ADR-0104, ADR-0124, ADR-0127, ADR-0131 該当部分）、src/opencode-local/ 3件（local-case-file.md 参照を含む README.md、agentdev-gh-cli/SKILL.md、agentdev-gh-cli/references/contracts.md、references/local-procedures.md、references/verify.md、case-schema/case-file.md、case-schema/rules/*.yaml を含むローカル版資産群）とする。AGENTS.md、docs/README.md、docs/DOC-MAP.md、docs/specs/README.md の旧パス参照も現行パスへ更新する。docs/requirements/retired/** と docs/adr/retired/** 配下は履歴資料のため修正対象外とし、例外スコープとして明示する。Markdownリンクの相対パスもファイル階層に応じて正しい相対パスへ更新し、YAML内の canonical_spec 等のパス値も現行パスへ更新する。workflow-contracts.md は参照文脈を確認し、正規の横断ワークフロー契約を指す場合のみ docs/specs/workflows/workflow-contracts.md へ更新する。
  - id: AG-002
    content: >-
      src/opencode-local/generation-flow.md（154行の直接生成方式資産）を廃止する。本ファイルは link mode 移行後は不要な直接生成方式の資産であり、docs/specs/local/local-generation.md では不要として扱われている。物理削除を実施し、src/opencode-local/README.md、現行REQ、現行ADR、現行SPEC、現行command/skill本文から generation-flow.md を現行構成、参照先、操作対象として扱う記述を除去する。REQ-0141-004「src/opencode-local/generation-flow.md は廃止候補として残す」を「src/opencode-local/generation-flow.md は現行構成から除去されている（廃止確定）」へ更新する。同時に ADR-0131 決定#4「generation-flow.md 廃止候補」を「廃止確定」へ UPDATE する。これは核心決定（全体生成廃止、link mode 統一）の変更ではなく、留保されていた廃止候補を確定に変える作業である。core 滞留語彙（src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、generated_by: local-opencode-transform、直接生成方式、生成フロー、再生成、上書き保護）が現行文書・原本・操作用定義に残らないことを検出機構（AG-003 で導入する IR-057 経由）で担保する。generated_by は backlog 等の別文脈でも使われるため、local-opencode-transform と組み合わせて local 版旧生成方式として検出するようルール側で明示する。
  - id: AG-003
    content: >-
      旧パス→新パス対応表 docs/specs/integrity/obsolete-path-map.yaml と integrity rule IR-057 obsolete-spec-path-after-domain-split を導入する。obsolete-path-map.yaml は AG-001 の旧SPEC直下パスと現行パスの対応をすべて登録する。各エントリは old, new, severity, scope（include と exclude）を持つ。severity は旧直下パス参照を ng とする。scope.include は AGENTS.md、README.md、docs/**、src/**、.opencode/** を取り、scope.exclude は docs/requirements/retired/** と docs/adr/retired/** を取る。IR-057 は obsolete-path-map.yaml を参照し、旧パスが現行文書・原本・配置先・検査スクリプトに残っていないことを確認する。docs/requirements/retired/** と docs/adr/retired/** は検査対象外とする。現行ADRに履歴として旧パスを記載する必要がある場合は例外登録を rule 側で明示する。検出時は旧パス、現行パス、検出ファイル、行番号を出力する。IR-057 追加に伴い docs/specs/integrity/integrity-rule-catalog.md、docs/specs/integrity/rules/IR-057-obsolete-spec-path-after-domain-split.md、docs/specs/integrity/rule-ownership.md、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts、.opencode/skills/repo-agentdev-integrity/SKILL.md を同期更新する。本機構は RU-1（DOC-MAP 読み込み契約化）の上位方針には依存しない独立機構であり、RU-1 が未確定でも単独で動作する。直接生成方式語彙の検出（AG-002）は IR-057 の拡張として同じ rule file 内に併記するか、別 rule として分割するかは実装側で判断するが、検出対象語彙と対象外スコープは rule 定義で明示する。
  - id: AG-004
    content: >-
      targeted docs guard を req-save、spec-save、case-close に組み込む。実装は .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts とし、既存 repo-agentdev-integrity の検査ロジックを再利用しつつ、変更ファイルと連動ファイルだけを対象とする薄い入口とする。changed file resolver、workflow profile resolver、coupled file resolver、targeted check runner、JSON/text reporter の層に分けて実装し、既存の巨大な全体監査に処理を密結合させない。CLI は --workflow req-save|spec-save|case-close|docs-check、--files <path...>、--base-ref <git-ref>、--json、--fail-level strict|warning を受け付ける。--files と --base-ref のいずれかで変更対象を特定する。req-save では REQ frontmatter 必須項目とファイル名・IDの一致、要件行ID形式、WHAT/HOW境界逸脱検出、新規REQ・タイトル変更時の docs/requirements/README.md 同期、DOC-MAP更新要否判定、ADR参照相互参照更新要否、関連SPEC候補時の docs/specs/README.md 更新要否、旧SPEC直下パス混入検出、local版旧生成方式語彙混入検出、文書種別責務と日本語執筆規範の機械化可能範囲の検査を実施する。spec-save では SPEC frontmatter 必須項目、status値妥当性、docs/specs/README.md のstatus表との同期、SPECドメイン分類妥当性、新規SPEC・移動・改名・主要入口変更時の DOC-MAP 更新要否、変更SPECと近接リンクの整合、旧直下パス混入、local版旧生成方式語彙混入、command SPECの場合の対象command原本との整合、skill SPECの場合の対象skill原本との整合、integrity SPECの場合の catalog/rule file/script 整合、REQ/ADR/guide相当の混入検出を実施する。case-close では保存工程より広めに targeted docs guard を実行し、draft→accepted 等の SPEC status変更時の docs/specs/README.md 同期、Issue/PRで宣言した文書更新対象と実変更ファイルの対応、旧直下パス混入検出、local版旧生成方式語彙混入検出、full docs-check 実行要否判定を実施する。full docs-check 実行要否は integrity rule追加・削除・大幅変更、DOC-MAP構造変更、docs/specs の大規模移動・改名、repo-agentdev-integrity の検査スコープ変更、文書分類・責務境界の基準変更を検出した場合に true とする。JSON出力は workflow、files_checked、coupled_files_checked、failures、warnings、doc_map_update_required、spec_readme_update_required、requirements_readme_update_required、full_docs_check_recommended を含む。failure は rule_id、severity、file、line、message、expected を持つ。検査内容は全体監査（/repo/docs-check）と同じであり、実行タイミングと対象を保存工程内の変更ファイルへ狭めるだけである。責務境界は不変であり、targeted docs guard は全体監査を置換しない。本機構は REQ-0108-153 delta guard の具体化である。検査失敗時は保存対象文書と連動文書を修正して再実行する。case-close で full_docs_check_recommended が true の場合は case-close 完了判定の追加確認として扱う。
  - id: AG-005
    content: >-
      repo-agentdev-integrity の SPEC 収集ロジックを docs/specs/*.md（直下のみ）前提から docs/specs/**/*.md（再帰）前提へ更新する。重点確認対象は .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts と .opencode/skills/repo-agentdev-integrity/SKILL.md とする。collectAllArtifactPaths、checkDocMapSpecSync、checkSpecReadmeIndexSync、checkUpdateNotesInDocs、scanned.Specs、SPEC inventory 生成・照合処理、DOC-MAP と SPEC の照合処理において docs/specs/*.md 直下のみを対象にしている箇所を再帰化する。docs/specs/README.md は SPEC status の単一追跡情報源であり、SPEC本文の検査では除外し、SPEC inventory/status 同期検査と DOC-MAPとの照合では対象とする。DOC-MAP との照合では SPEC status の重複確認ではなく、入口・読み込み契約との整合を確認する。検査のたびに docs/specs/README.md の扱い（除外・対象）を明示する。本対応は RU-1（DOC-MAP 読み込み契約化）が未確定でも実施可能であり、RU-2 単独で完結する。
  - id: AG-006
    content: >-
      REQ-0156 に obsolete-path-map.yaml 導入を APPEND する。REQ-0156-006「移送時、旧パス参照文書の参照先を移送単位で更新」の具体化として、docs/specs 配下でドメイン分割が発生した場合に obsolete-path-map.yaml へ旧パスと新パスの対応を移送単位で追記し、IR-057 を通じて旧パス混入を検出できる状態を維持することを要件化する。追記項目は2〜3項目とし、obsolete-path-map.yaml の登録タイミング（移送実施時）、登録内容（old, new, severity, scope）、IR-057 による検出確認を含める。これにより将来の SPEC ドメイン再編時も旧パス参照が検知され、AG-001 と同等の修正が継続して実施される。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:targeted-docs-integrity-guard
    source_items: [AG-003, AG-004, AG-005]
    content: |
      # targeted docs integrity guard

      ## 概要

      変更ファイル限定の targeted docs guard（check_changed_docs.ts）、旧パス検出機構（obsolete-path-map.yaml + IR-057）、repo-agentdev-integrity の docs/specs/**/*.md 再帰対応を導入し、req-save、spec-save、case-close の保存工程で文書整合性検査を実行できるようにする。

      ## 要件

      ### obsolete-path-map.yaml の管理

      - docs/specs/integrity/obsolete-path-map.yaml を旧SPEC直下パス→現行ドメイン分割パスの対応表として管理する。
      - 各エントリは old、new、severity、scope（include、exclude）を持つ。
      - severity は旧直下パス参照を ng とする。
      - scope.include は AGENTS.md、README.md、docs/**、src/**、.opencode/** とする。
      - scope.exclude は docs/requirements/retired/** と docs/adr/retired/** とする。
      - ドメイン分割による移送が発生した場合は、移送単位で旧パスと新パスの対応を追記する。

      ### IR-057 obsolete-spec-path-after-domain-split

      - obsolete-path-map.yaml に登録された旧パスが現行文書、原本、配置先、検査スクリプトに残っていないことを確認する。
      - docs/requirements/retired/** と docs/adr/retired/** は検査対象外とする。
      - 現行ADRに履歴として旧パスを記載する必要がある場合は例外登録を rule 側で明示する。
      - 検出時は旧パス、現行パス、検出ファイル、行番号を出力する。
      - 直接生成方式語彙（src/opencode-local/generation-flow.md、src/opencode-local/transform/、transform/generate.md、transform/review.md、transform/spec.md、local-opencode-transform、generated_by: local-opencode-transform、直接生成方式、生成フロー、再生成、上書き保護）が現行文書・原本・操作用定義に残らないことを検出する。
      - generated_by は backlog 等の別文脈でも使われるため、local-opencode-transform と組み合わせて local 版旧生成方式として検出する。
      - 検査対象外領域は rule 定義で明示する。

      ### targeted docs guard（check_changed_docs.ts）

      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts を実装する。
      - 既存 repo-agentdev-integrity の検査ロジックを再利用し、変更ファイルと連動ファイルだけを対象とする薄い入口とする。
      - 処理層を changed file resolver、workflow profile resolver、coupled file resolver、targeted check runner、JSON/text reporter に分ける。
      - 既存の全体監査（check_integrity.ts）に処理を密結合させない。
      - CLI 引数として --workflow req-save|spec-save|case-close|docs-check、--files <path...>、--base-ref <git-ref>、--json、--fail-level strict|warning を受け付ける。
      - --files と --base-ref のいずれかで変更対象を特定する。
      - 責務境界は全体監査と不変であり、実行タイミングと対象を保存工程内の変更ファイルへ狭めるだけである。

      ### req-save 向け検査

      変更ファイルが docs/requirements/REQ-*.md の場合、以下を確認する。

      - REQ frontmatter の必須項目とファイル名・IDの一致
      - 要件行ID形式の妥当性
      - WHAT/HOW境界の逸脱検出
      - 新規REQ・タイトル変更時の docs/requirements/README.md 同期
      - DOC-MAP更新要否判定
      - ADR参照がある場合の相互参照更新要否判定
      - 関連SPEC候補がある場合の docs/specs/README.md 更新要否判定
      - 旧SPEC直下パス混入検出
      - local版旧生成方式語彙混入検出
      - 文書種別責務と日本語執筆規範の機械化可能範囲の検査

      ### spec-save 向け検査

      変更ファイルが docs/specs/**/*.md の場合、以下を確認する。

      - SPEC frontmatter の必須項目
      - status 値の妥当性
      - docs/specs/README.md のstatus表との同期
      - SPECドメイン分類の妥当性
      - 新規SPEC、移動、改名、主要入口変更時の DOC-MAP 更新要否判定
      - 変更SPECと近接リンクのリンク整合
      - 旧SPEC直下パス混入検出
      - local版旧生成方式語彙混入検出
      - command SPECの場合の対象command原本との最低限の整合
      - skill SPECの場合の対象skill原本との最低限の整合
      - integrity SPECの場合の catalog/rule file/script 整合
      - REQ相当、ADR相当、guide相当の混入検出

      ### case-close 向け検査

      case-close では保存工程より広めに以下を確認する。

      - 変更ファイル対象の targeted docs guard 実行
      - draft→accepted 等の SPEC status変更時の docs/specs/README.md 同期
      - Issue/PRで宣言した文書更新対象と実変更ファイルの対応
      - 旧SPEC直下パス混入検出
      - local版旧生成方式語彙混入検出
      - full docs-check 実行要否判定

      full docs-check 実行要否は以下の変更を検出した場合に true とする。

      - integrity rule追加・削除・大幅変更
      - DOC-MAP構造変更
      - docs/specs の大規模移動・改名
      - repo-agentdev-integrity の検査スコープ変更
      - 文書分類・責務境界の基準変更

      ### JSON 出力形式

      JSON出力は workflow、files_checked、coupled_files_checked、failures、warnings、doc_map_update_required、spec_readme_update_required、requirements_readme_update_required、full_docs_check_recommended を含む。failure は rule_id、severity、file、line、message、expected を持つ。

      ### repo-agentdev-integrity の docs/specs/**/*.md 再帰対応

      - collectAllArtifactPaths、checkDocMapSpecSync、checkSpecReadmeIndexSync、checkUpdateNotesInDocs、scanned.Specs、SPEC inventory 生成・照合処理、DOC-MAP と SPEC の照合処理を docs/specs/*.md（直下）から docs/specs/**/*.md（再帰）へ更新する。
      - SPEC本文の検査では docs/specs/README.md を除外する。
      - SPEC inventory/status 同期検査と DOC-MAP との照合では docs/specs/README.md を対象とする。
      - DOC-MAP との照合では SPEC status の重複確認ではなく、入口・読み込み契約との整合を確認する。

      ### 検査失敗時の取り扱い

      - req-save、spec-save の検査失敗時は保存対象文書と連動文書を修正して再実行する。
      - case-close で full_docs_check_recommended が true の場合は case-close 完了判定の追加確認として扱う。

      ## 受け入れ基準

      - docs/specs/integrity/obsolete-path-map.yaml が追加され、AG-001 の旧直下パスと現行パスの対応がすべて登録されている。
      - IR-057 obsolete-spec-path-after-domain-split が追加され、catalog、rule file、rule ownership、script が同期している。
      - check_changed_docs.ts が実装され、--workflow req-save|spec-save|case-close|docs-check、--files、--base-ref、--json、--fail-level を受け付ける。
      - JSON出力が workflow、files_checked、coupled_files_checked、failures、warnings、doc_map_update_required、spec_readme_update_required、requirements_readme_update_required、full_docs_check_recommended を返す。
      - failure が rule_id、severity、file、line、message、expected を持つ。
      - req-save、spec-save、case-close から check_changed_docs.ts を実行できる。
      - repo-agentdev-integrity が docs/specs/**/*.md を再帰的に扱える。
      - docs/specs/README.md が SPEC status の単一追跡情報源として扱われている。
      - 旧SPEC直下パス参照が現行REQ、現行ADR、src/opencode-local/**、AGENTS.md、docs/DOC-MAP.md、docs/specs/README.md から解消されている（retired/ 配下は除く）。
      - req-save、spec-save、case-close の説明に targeted docs guard の実行タイミングと失敗時の修正・再実行手順が記載されている。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0141
    source_items: [AG-002]
    content: |
      REQ-0141-004 を以下の状態へ更新する。

      - src/opencode-local/ は README.md と agentdev-gh-cli/ を保持する。
      - case-schema/ は agentdev-gh-cli/ 配下の操作用定義として保持する。
      - src/opencode-local/generation-flow.md は現行構成から除去されている（廃止確定）。
      - src/opencode-local/transform/ は現行構成に含まれない。

      変更点は「廃止候補として残す」を「廃止確定（現行構成から除去）」へ確定することである。link mode を正とする核心決定は不変であり、本 UPDATE は留保されていた廃止候補を確定に変える作業である。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0156
    source_items: [AG-003, AG-006]
    content: |
      REQ-0156-006「移送時、旧パス参照文書の参照先を移送単位で更新」の具体化として以下を追記する。

      - docs/specs 配下でドメイン分割による移送が発生した場合、移送単位で docs/specs/integrity/obsolete-path-map.yaml へ旧パスと新パスの対応を追記する。
      - obsolete-path-map.yaml の各エントリは old、new、severity、scope（include、exclude）を持つ。severity は旧直下パス参照を ng とする。scope.exclude は docs/requirements/retired/** と docs/adr/retired/** を含める。
      - 追記後、IR-057 obsolete-spec-path-after-domain-split を通じて旧パス混入が検出できることを確認する。
  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: ADR-0131
    source_items: [AG-002]
    content: |
      ADR-0131 決定#4「generation-flow.md 廃止候補」を「廃止確定」へ UPDATE する。

      変更の趣旨は以下のとおりである。

      - 決定#4 の表記を「generation-flow.md を廃止候補として残す」から「generation-flow.md を廃止確定とし、現行構成から除去する」へ変更する。
      - 核心決定（全体生成廃止、link mode 統一）は不変である。本 UPDATE は留保されていた廃止候補を確定に変える作業であり、ADR の核心を覆すものではない。
      - 廃止確定に伴い、REQ-0141-004 も「廃止候補として残す」から「廃止確定（現行構成から除去）」へ同期更新する（ACT-REQ-002 参照）。
      - 直接生成方式語彙の残留検出は IR-057（ACT-REQ-001 で導入）で担保する。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-2 が DOC-MAP を「読み込み契約・制御面」として再構築する方針であるのに対し、RU-1 は DOC-MAP を「探索索引」として位置づけている。両者の DOC-MAP 像が衝突する。さらに RU-2 は作業種別別 must read 表の保有を想定しているが、RU-1 はこれを否定する。
    resolution: >-
      RU-1 を上位方針とし、RU-2 の「DOC-MAP=読み込み契約・制御面」は修正対象として RU-1 に追随する。DOC-MAP に作業種別別 must read 表を持たせない。本 draft では DOC-MAP 再構築を要件に含めず、旧パス除去、obsolete-path-map.yaml + IR-057 導入、targeted docs guard 組み込み、repo-agentdev-integrity の再帰対応に範囲を絞る。DOC-MAP の最終形は RU-1 の決定を待つ。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260701-doc-control-plane-targeted-docs-guard
    target_req: new:targeted-docs-integrity-guard
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req: REQ-0158
      target_resolved: REQ-0158
      file: docs/requirements/REQ-0158.md
      source_artifact_action: ACT-REQ-001
      case_open:
        issue_number: 1355
        issue_url: https://github.com/yogata/agent-dev-flow/issues/1355
        status: issue_created
        qg2_verdict: pass
        created_at: 2026-07-02
  - ou_id: OU-002
    source_ru: RU-20260701-doc-control-plane-targeted-docs-guard
    target_req: REQ-0141
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      updated_req: REQ-0141
      file: docs/requirements/REQ-0141.md
      change: REQ-0141-004 廃止候補→廃止確定
      source_artifact_action: ACT-REQ-002
  - ou_id: OU-003
    source_ru: RU-20260701-doc-control-plane-targeted-docs-guard
    target_req: REQ-0156
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      appended_req: REQ-0156
      file: docs/requirements/REQ-0156.md
      appended_rows: [REQ-0156-010, REQ-0156-011, REQ-0156-012]
      source_artifact_action: ACT-REQ-003

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      ripgrep で docs/requirements/**, docs/adr/**, src/opencode-local/**, AGENTS.md, README.md, docs/DOC-MAP.md, docs/specs/README.md 内の旧SPEC直下パス参照（docs/specs/(local-case-file|local-generation|runtime-package-boundary|document-type-responsibilities|artifact-contracts|artifact-responsibilities|req-impact-map|integrity-rule-catalog|integrity-contracts|rule-ownership|quality-gates|quality-specs|req-health-metrics|spec-health-metrics|command-file-format|docs-spec-rebuild-integrity|backticks-identifier-threshold|system|patterns|design-principles|document-model|workflow-contracts)\.md 形式）を検出する。docs/requirements/retired/** と docs/adr/retired/** は --glob で除外する。
    pass_criteria: |
      現行REQ、現行ADR、src/opencode-local/**、AGENTS.md、docs/DOC-MAP.md、docs/specs/README.md に旧SPEC直下パス参照が残っていない（retired/ 配下は除く）。
    on_failure: |
      検出された旧パス参照を現行ドメイン分割パスへ修正し、再検査する（fix-and-reverify）。
  - id: TS-002
    target_item: AG-004
    verification: |
      check_changed_docs.ts を req-save、spec-save、case-close の各 workflow で実行し、変更ファイルを限定した整合性検査が走ることを確認する。--workflow、--files、--base-ref、--json、--fail-level の各引数が機能すること、JSON 出力が workflow、files_checked、coupled_files_checked、failures、warnings、doc_map_update_required、spec_readme_update_required、requirements_readme_update_required、full_docs_check_recommended を含むことを確認する。
    pass_criteria: |
      req-save、spec-save、case-close の各 workflow で変更された docs のみ整合性検査が実行され、JSON 出力形式が仕様を満たす。failure が rule_id、severity、file、line、message、expected を持つ。
    on_failure: |
      検査ロジック、CLI 引数処理、JSON 出力形式のいずれかを修正して再検査する（fix-and-reverify）。

case_open_hints:
  epic_needed: false
```

# summary

RU-20260701-doc-control-plane-targeted-docs-guard を、旧SPEC直下パス修正、生成方式残骸廃止、targeted docs guard 導入、repo-agentdev-integrity 再帰対応に範囲を絞って合意した。DOC-MAP 再構築は RU-1 と衝突するため本 draft から除外し、RU-1 の上位方針に追随する（CR-001）。

合意内容は AG-001 〜 AG-006 の6項目。AG-001 で旧SPEC直下パスを現行ドメイン分割パスへ修正する（対象: 現行REQ 11件超、現行ADR 4件、src/opencode-local/ 3件、AGENTS.md、docs/DOC-MAP.md、docs/specs/README.md 等。retired/ 配下は除外）。AG-002 で src/opencode-local/generation-flow.md を廃止確定とし、REQ-0141-004 と ADR-0131 決定#4 を「廃止候補」→「廃止確定」へ更新する。AG-003 で obsolete-path-map.yaml と IR-057 obsolete-spec-path-after-domain-split を導入する。AG-004 で targeted docs guard（check_changed_docs.ts）を req-save/spec-save/case-close に組み込む（REQ-0108-153 delta guard の具体化）。AG-005 で repo-agentdev-integrity の docs/specs/**/*.md 再帰対応を実施する。AG-006 で REQ-0156 に obsolete-path-map.yaml 運用を APPEND する（REQ-0156-006 の具体化）。

成果物アクションは4件。ACT-REQ-001 で新規REQ（new:targeted-docs-integrity-guard）を作成する。ACT-REQ-002 で REQ-0141 を UPDATE する。ACT-REQ-003 で REQ-0156 に APPEND する（OU-001 に依存）。ACT-ADR-001 で ADR-0131 決定#4 を UPDATE する。新規 ADR は不要。targeted docs guard、obsolete-path-map、repo-integrity 再帰はすべて既存REQの具体化である。

operation_units は3件。OU-001（新規REQ作成）と OU-002（REQ-0141 更新）は recommended_order=1 で並列可能。OU-003（REQ-0156 APPEND）は OU-001 に依存し recommended_order=2。issue_policy はすべて single、epic_needed=false で単一 Issue で完結する。

test_strategy は2件。TS-001 は AG-001 の旧直下パス残存検出を ripgrep で検証し、合格基準は現行REQ/ADR/src/opencode-local/ の旧パス参照が解消されていること。TS-002 は AG-004 の targeted docs guard 実行と JSON 出力形式を検証する。いずれも on_failure=fix-and-reverify。
