---
draft_type: req_draft
topic_slug: spec-to-design-redefinition
status: saved
created_at: 2026-08-20T09:00:00+09:00
source_rus: [RU-0001]
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  ADFの現行SPEC成果物を、REQを満たすために現在採用している内部構造・内部動作・責務分担・データ構造・処理方式・規則・パラメータを記述する正規成果物「Design」へ再定義する。
  SPEC成果物型を廃止してDesign成果物型へ置換し、docs/specs/ を docs/designs/ へ変更する。
  監査・評価・観測記録はReportとして docs/reports/ へ分離する。
  正規語彙（spec-save → design-save、agentdev-workflow-spec-save → agentdev-workflow-design-save、
  agentdev-spec-file-manager → agentdev-design-file-manager、artifact: spec → artifact: design、
  target_spec → target_design、related_spec 系 → Design語彙）を一括変更し、
  Design操作は create / append / update の3値を正規値として旧別名・新別名とも受理しない。
  Design frontmatter は title / status / created / updated に簡素化し、status は draft / accepted の2値、
  superseded・superseded_by・spec_logical_division・per-file canonical_owner を廃止する。
  既存REQの正規更新は REQ-001 / REQ-004 / REQ-008 / REQ-036 の4件に限定し、
  それ以外のREQ本文・Decision本体・配布物の語彙置換は本要件docが授権する単一横断変更（case側）として実行し、
  中間状態で旧語彙と新語彙を併存させない。実証Caseではなく通常Caseとして扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      Designの意味境界。DesignはREQを満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータを記述する正規成果物であり、現在のHOWを記述する。
      将来案、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果はDesignに保持しない。
      ArchitectureはDesignに含まれる一部として扱い、Designを高位設計だけに限定しない。
  - id: AG-002
    content: |
      文書体系と物理配置。SPEC成果物型を廃止しDesign成果物型へ置換する。docs/specs/ を docs/designs/ へ変更し、docs/designs/ は現在有効なDesignだけを保持する正規領域とする。
      docs/reports/ をReportの正規配置として新設する。旧 docs/specs/ の authoring、commands、foundations、integrity、local、quality、responsibilities、skills、workflows の各ドメインは、Designとして妥当な内容を docs/designs/ へ移行する。
      integrity/audits/**、人間向けbaseline、Artifact Graph効果評価、DOC-MAP監査等の監査・評価・観測記録はReportへ移す。
      チェッカーが使用する実行時データ（data/、baselines/ 等）はDesignから外し、既存のリポジトリローカル検証スキル配下へ配置する。
      Design文書に保持している再計算可能なAUTOGEN実測表は永続化をやめ、必要時に実体から算出する。
  - id: AG-003
    content: |
      正規語彙と保存系。ADF成果物を意味する正規語彙を次へ変更する: SPEC → Design、docs/specs/ → docs/designs/、spec-save → design-save、
      agentdev-workflow-spec-save → agentdev-workflow-design-save、agentdev-spec-file-manager → agentdev-design-file-manager、
      artifact: spec → artifact: design、target_spec → target_design、related_spec 等のADF SPEC成果物参照はDesign語彙へ変更する。
      外部API仕様、プロトコル仕様等、一般名詞として正しい「仕様」「specification」は変更しない。
  - id: AG-004
    content: |
      Design操作。Design保存操作は create、append、update の3値を正規値とする。
      spec-create、spec-update、spec-append 等の旧別名は廃止する。design-create、design-update、design-append 等の新しい別名も導入しない。
      target_area による既存セクション更新、追加位置判断等の現行機能はDesign保存機能（design-save、agentdev-workflow-design-save、agentdev-design-file-manager）へ責務を引き継ぐ。
  - id: AG-005
    content: |
      Design frontmatterとライフサイクル。Designの基本frontmatterは title、status、created、updated とする。
      status は draft、accepted の2値とし、新規Designは draft として作成され、確定時に accepted へ遷移する。
      superseded、superseded_by をDesignライフサイクルから廃止する。置換済みDesignは現行Designツリーへ保持せず、履歴はGit、Issue、Decision等の既存履歴手段から確認する。
      spec_logical_division を廃止し、Design用の代替分類メタデータは追加しない。各Designに canonical_owner frontmatter を要求しない。
      Design専用の安定ID体系は本変更では導入しない（Designの識別は文書配置パスによる）。
  - id: AG-006
    content: |
      既存機構の追従。REQ、Decision、Design、Guide、Reportの文書境界を文書モデルへ反映する。
      req-define、req-save、design-save、一時成果物契約、inspect-docs、docs-check、targeted docs guard、索引生成、健全性計測をDesign語彙へ追従させる。
      case-closeのDesign確定処理を draft → accepted に追従させる。
      Artifact Graphは docs/designs/ と design 型を認識するための追従修正だけを行い、TIM関係型、関係意味、高位問い合わせの再設計は行わない。
  - id: AG-007
    content: |
      単一横断変更の明示的授権。本要件docは、REQ-001/004/008/036 以外のREQ本文、Decision本体、配布command/skill/template/script、ガイド、索引、検証コードに含まれる
      ADF SPEC成果物を意味する語彙（docs/specs/、artifact: spec、target_spec、spec-save、agentdev-workflow-spec-save、agentdev-spec-file-manager、spec_logical_division 等）の置換を本変更の一部として授権する。
      置換対象外は次のとおり: v2:ADR-* / v2:REQ-* 等の過去版履歴参照、外部API仕様・プロトコル仕様等の一般名詞としての spec/specification、旧語彙検出の検証fixture。
      実装内部の順序依存は (1) 文書モデル・配置・ライフサイクルのDesign再定義、(2) req_draft・artifact_actions・Design操作契約の再構成、(3) design-save・Workflow Skill・file-managerの一括移行、
      (4) Report分離・integrity・index・健全性計測の整理、(5) Artifact GraphのDesign名称・パス追従、(6) 旧SPEC語彙・旧パス・旧状態・混在成果物の横断検証、の順とする。
      これらを単一の横断変更として扱い、中間状態で旧語彙と新語彙を併存させない。
  - id: AG-008
    content: |
      正規所有原則の維持。per-file の canonical_owner frontmatter 要求は廃止するが、正規所有者という設計原則は維持する。
      REQ-021-001 等に存在する「同一 canonical owner の SPEC」等の語句は、正規所有原則ベースの探索として意味を維持し、Design語彙へ置換する。
      現行成果物責任表の責務は維持する。
  - id: AG-009
    content: |
      DEC-007決定3（標準コア node_types: specification 等、indexed_paths: docs/specs 等の列挙）の処理方式。
      成果物型の正規定義は REQ-001 側にあり、DEC-007 の列挙はその投影と解釈する。後継Decisionは作成せず、Artifact Graph は design 型・docs/designs/ への非意味的追従修正のみを行う。
      Artifact Graph のTIM関係型、関係意味、高位問い合わせに本変更由来の変更を入れない。TIM意味論の再検討はDesign移行完了後の別課題とする（RU対象外）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-001.md
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-008]
    content: |
      ## 目的（変更後全文）

      要件、技術判断、設計、案内、報告、索引、状態早見が、読み手の関心に沿って配置され、編集者が配置先を一意に定められる基準構造を維持する。
      文書種別ごとの責務、識別子体系、配置規則、優先順位、ライフサイクルを一貫した基盤の上に成立させ、現行判断と履歴参照を明確に区別する。

      ## 適用範囲（語彙置換）

      適用範囲本文中の「仕様」はすべて「設計」へ置換する（「判断記録と仕様のライフサイクル」→「判断記録と設計のライフサイクル」等）。

      ## 変更後要件行（全文）

      | ID | 要件 |
      |---|---|
      | REQ-001-001 | 文書種別（要件、判断記録、設計、案内、報告、索引、状態早見）ごとの責務は重複せず、各文書の配置基準が一意に定まること |
      | REQ-001-003 | 設計文書は現在の内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータを記述し、将来案、採用理由、却下理由、作業履歴、監査結果、評価結果、実測値、実装コードそのもの、検証実行結果を記述対象外とすること |
      | REQ-001-008 | 各要件、判断記録、設計は安定した一意の識別子を持ち、識別子は配置、分割、統合に依存せず不変であること。設計の識別子は文書配置パスにより一意に定まり、設計専用の識別子体系を導入しないこと |
      | REQ-001-025 | 設計文書は草案、承認の2状態を持ち、新規設計は草案として作成され、確定時に承認へ遷移すること。置換済み設計は現行設計ツリーへ保持せず、履歴は版管理、課題追跡、判断記録等の既存履歴手段から確認できること |
      | REQ-001-026 | 設計の状態は単一の追跡情報源から視認でき、複数の索引で状態を重複管理しないこと |
      | REQ-001-027 | 草案状態のまま放置される設計を機械的に検出できること |
      | REQ-001-028 | 設計の新規追加、状態変更時には追跡情報源を実ファイルの状態と整合させ、登録漏れ、状態不一致を検出できること |
      | REQ-001-038 | 複数の関心領域にまたがる基盤設計は関心領域別に分類、体系化されること |
      | REQ-001-039 | 新規設計の作成時には分類基準に従って配置先が決定されること |
      | REQ-001-040 | 既存設計の分類変更時には旧配置と新配置の対応を追跡可能にし、旧参照を段階的かつ個別に更新すること |
      | REQ-001-041 | 各要件、設計は文書統治、ワークフロー全体、配布成果物単位、成果物と実行時の責務、検証と検出、判断記録ライフサイクルのいずれかの分類に属し、関心対象の総体として説明できること |
      | REQ-001-043 | 学習成果物、取り込み成果物から後続工程へ引き継ぐ分類根拠は、変更の性質、要件影響の有無、対象ステークホルダー、利用者から見える変更の有無、追記先の選択理由、根拠となる観測事実を含むこと |
      | REQ-001-065 | 報告文書は監査、評価、観測、測定等の事実記録を専門とし、必達要件の規範表現を持たず、正規配置領域を設計文書と分離して持つこと |

      ## 削除要件行

      - REQ-001-029（設計ライフサイクルから置換状態を廃止したため、置換宣言に基づく検査対象外判定の要求を削除する）
      - REQ-001-036（設計の主論理区分・正規所有対象の宣言要求を廃止するため削除する。正規所有者という一般原則は維持する）
      - REQ-001-037（主論理区分・正規所有対象に基づく配置一貫性検証の要求を廃止するため削除する）

      ## 採番備考

      REQ-001-065 は新規行（現行最大行番号 064 の次番号。最終採番は req-save が確定する）。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    source_items: [AG-003, AG-006]
    content: |
      ## 目的（変更後全文）

      要件定義プロセスは、既存REQ照合、操作分類、反映作業混入防止、ユーザー合意形成を含む一貫した契約である。
      本 REQ は req-define、req-save、design-save プロセスの横断基本契約を定義する。

      ## 変更後要件行（全文）

      | ID | 要件 |
      |---|---|
      | REQ-004-027 | 必達要件として再定義できない推奨相当の内容は、注記、Design、guide、backlog、report のいずれか適切な文書へ移すこと |
      | REQ-004-033 | req-define および req-save は、要件行候補が REQ に記述すべき外部契約、状態要件であるか、Design 等に配置すべき詳細、内部パラメータであるかを保存前に判定すること |
      | REQ-004-037 | req-define は修正の要否を検討する際、実装面と Design 面の両面を分析すること |
      | REQ-004-040 | req-save は Design を編集しないこと |
      | REQ-004-041 | Design 保存は design-save の責務とすること |

      ## 語彙備考

      関連情報節の v2:REQ-0102 等の履歴参照は置換対象外とする（AG-007）。
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    source_items: [AG-003, AG-004, AG-006]
    content: |
      ## 目的（変更後全文）

      draft、RU、取り込み項目、学習エントリ、検出事項として command 間で引き渡される中間成果物は一時的な位置づけであり、docs/ 配下の REQ、Decision、Design、guide、索引が永続基準である。
      本 REQ はこれら一時成果物の配置、ライフサイクル、構造化契約を所有し、永続文書と一時成果物の境界を明確にする。
      要件定義プロセス（req-define、req-save、design-save）の実行契約は REQ-004 が所有し、本 REQ は当該プロセスが生み出し消費する一時成果物の契約を定義する。

      ## 変更後要件行（全文）

      | ID | 要件 |
      |---|---|
      | REQ-008-001 | agent-dev-flow が command 間で引き渡す中間成果物（draft、RU、取り込み項目、学習エントリ、検出事項）は一時成果物であり、docs/ 配下の REQ、Decision、Design、guide、索引が永続基準であること |
      | REQ-008-008 | req_draft は req-define が生成し、direct consumer 集合 {req-save, design-save, case-open} が消費する、保存前の要件合意結果であること |
      | REQ-008-027 | REQ、Decision、Design への保存対象は成果物別最上位配列に分散させず、標準モデルとして一つの artifact_actions に統合すること |
      | REQ-008-032 | req-define は artifact_actions のうち Design を対象とし、かつ operation が更新の場合、対象セクション見出しを必須出力すること |
      | REQ-008-033 | req-define は Design 対象かつ operation が更新の場合、content に変更後のセクション全文を出力すること |
      | REQ-008-058 | artifact_actions の operation 公式 enum は REQ、Decision、Design とも create、append、update の3値とし、旧別名（spec-create、spec-update、spec-append）および新別名（design-create、design-update、design-append）を受け付けないこと。target_area 形式、placement、anchor、未検出時挙動等の操作契約は Design 保存ワークフローが定めること |

      ## 適用範囲（語彙置換）

      適用範囲本文中の「SPEC 候補」「SPEC 保存」等の ADF SPEC 成果物を意味する語は Design 語彙へ置換する。
  - id: ACT-REQ-036
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-006]
    content: |
      ## 変更後要件行（全文）

      | ID | 要件 |
      |---|---|
      | REQ-036-009 | inspect-docs の診断観点は REQ と Design の境界違反、粒度、Design 詳細混入、誤分類、重複所有、廃止 REQ や Design 由来の記述残置を含むこと |
      | REQ-036-013 | inspect-skills の診断観点は Command から Skill への参照、Skill frontmatter、本文構造、references 利用、template と script の参照、粒度、段階的開示、責務境界、実行主体分類の誤認、Design 操作契約テーブルの整合を含むこと |

conflict_resolutions:
  - id: CR-001
    conflict: |
      DEC-007決定3は標準コア node_types（specification 等）と indexed_paths（docs/specs 等）を決定内容として列挙しており、
      design 型・docs/designs/ への変更はこの列挙の変更にあたる（後継Decision要否の争点）。
    resolution: |
      成果物型の正規定義は REQ-001 側にあり、DEC-007 の列挙はその投影と解釈する。後継Decisionは作成せず、非意味的追従として処理する。
      根拠: RU-0001「Artifact Graphは docs/designs/ と design 型を認識するための追従修正だけを行う」「新規Decisionは原則作成しない」、
      agentdev-architecture-advisory 助言（Q1/Q2: DEC-007 決定3が唯一の衝突候補だが列挙の所有はSPEC側構造、新規Decision不要は妥当）。
  - id: CR-002
    conflict: |
      公開コマンド名は document-model「安定契約の例外」で REQ に要約として残す安定契約であり、通常は REQ 更新を要する。
      RU-0001 は 4REQ（REQ-001/004/008/036）のみを正規更新対象とし、他REQ本文・Decision本体・配布物の語彙置換（spec-save → design-save 等を含む）は case 側一括適用としている。
    resolution: |
      本要件doc（AG-007）が 4REQ 以外の語彙置換を単一横断変更として明示的に授権する。対象外（履歴参照、一般名詞、検出fixture）も明記済み。
      一回限りの横断変更としての先例は DEC-009 AG-015（全面改定時の例外編集）と整合する。
      根拠: RU-0001「単一の横断変更として扱い、中間状態で旧語彙と新語彙を併存させない」、受け入れ条件24。
  - id: CR-003
    conflict: |
      4REQ外に規範的な SPEC 語彙依存が残存する（REQ-005-023 の docs/specs/ 配置言及、REQ-012-002 の indexed_paths 3種列挙、
      REQ-021-001 の spec-save 探索プロファイルと「同一 canonical owner の SPEC」、REQ-027-003 の代表ケース列挙、REQ-034-007/008/039 の case-auto 工程列挙）。
      4REQのみ更新すると当該行が改名後の体系と不整合になる。
    resolution: |
      当該行はすべて AG-007 の授権する case 側横断変更の置換対象に含める。REQ-021-001 の「同一 canonical owner の SPEC」は
      per-file canonical_owner frontmatter 廃止後も正規所有原則ベースの探索として意味を維持し、Design 語彙へ置換する（AG-008）。
      根拠: RU-0001「正規所有者という設計原則は維持するが、各Designに canonical_owner frontmatter を要求しない」。

operation_units:
  - ou_id: OU-0001
    source_ru: RU-0001
    target_req: REQ-001
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {status: applied, saved: [REQ-001], lines: [REQ-001-001, REQ-001-003, REQ-001-008, REQ-001-025, REQ-001-026, REQ-001-027, REQ-001-028, REQ-001-038, REQ-001-039, REQ-001-040, REQ-001-041, REQ-001-043, REQ-001-065], deleted: [REQ-001-029, REQ-001-036, REQ-001-037]}
  - ou_id: OU-0002
    source_ru: RU-0001
    target_req: REQ-004
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {status: applied, saved: [REQ-004], lines: [REQ-004-027, REQ-004-033, REQ-004-037, REQ-004-040, REQ-004-041]}
  - ou_id: OU-0003
    source_ru: RU-0001
    target_req: REQ-008
    operation: update
    scale: large
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {status: applied, saved: [REQ-008], lines: [REQ-008-001, REQ-008-008, REQ-008-027, REQ-008-032, REQ-008-033, REQ-008-058]}
  - ou_id: OU-0004
    source_ru: RU-0001
    target_req: REQ-036
    operation: update
    scale: large
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {status: applied, saved: [REQ-036], lines: [REQ-036-009, REQ-036-013]}

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      リポジトリ全体に対し、Report分離と物理配置を検証する。
      docs/designs/ が存在し旧9ドメイン（authoring、commands、foundations、integrity、local、quality、responsibilities、skills、workflows）のDesign妥当内容が移行済みであることをファイル配置で確認する。
      docs/reports/ が存在し、integrity/audits/**、人間向けbaseline、効果評価、DOC-MAP監査等の監査・評価・観測記録が docs/designs/ 配下に存在しないことを確認する。
      チェッカー実行時データ（data/、baselines/ 等）がリポジトリローカル検証スキル配下に配置済みであることを確認する。
      Design健全性文書から再計算可能なAUTOGEN実測表の永続化が除去されていることを確認する。
    pass_criteria: |
      RU-0001受け入れ条件2、3、4、18、19が全て成立していること。
      監査・評価・観測記録がDesign一覧、Design件数、Design健全性計測へ混入していないこと（条件19）。
    on_failure: |
      fix-and-reverify。移行漏れ・混在残存は本変更の不備であるため、移行・分離を完了して再検証する。
  - id: TS-002
    target_item: AG-003
    verification: |
      旧語彙・旧パスの横断残存検証を行う。
      現行成果物（docs/、src/opencode/、scripts/、README系）と実装に対し、ADF SPEC成果物を意味する docs/specs/、artifact: spec、target_spec、spec-save、
      agentdev-workflow-spec-save、agentdev-spec-file-manager、spec_logical_division を検索する。
      併せて、v2:ADR-* / v2:REQ-* 履歴参照、外部仕様の一般名詞としての spec/specification、旧語彙検出の検証fixture が置換対象外として保持されていることを確認する（誤検出・誤置換なし）。
    pass_criteria: |
      RU-0001受け入れ条件1、24が成立していること。正当使用（履歴資料、一般名詞、検出fixture）は除外として残存していること。
    on_failure: |
      fix-and-reverify。残存語彙は置換して再検証する。正当使用の誤置換は原状復帰して再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      Design保存操作の正規3値と別名不受理を検証する。
      design-save に対し create、append、update、対象なし（design保存対象を含まないdraft）の各保存経路を実行する。
      旧別名（spec-create、spec-update、spec-append）および新別名（design-create、design-update、design-append）が受理されないことを確認する。
      target_area による既存セクション更新と追加位置判断が Design 保存機能として動作することを確認する。
    pass_criteria: |
      RU-0001受け入れ条件11、12、13、14、15が成立していること。Workflow Skill が agentdev-workflow-design-save、ファイル操作 Skill が agentdev-design-file-manager であること。
    on_failure: |
      fix-and-reverify。経路欠落・別名受理は Design 保存機能の不備であるため修正して再検証する。
  - id: TS-004
    target_item: AG-005
    verification: |
      Design frontmatter とライフサイクルを検証する。
      新規Design作成で基本frontmatterが title、status、created、updated で構成されること、status が draft で作成されることを確認する。
      確定時（case-close）に draft から accepted へ遷移することを確認する。
      全Designについて superseded、superseded_by、spec_logical_division、canonical_owner frontmatter が存在しないことを確認する。
      Design専用の新規ID体系が導入されていないことを確認する。
    pass_criteria: |
      RU-0001受け入れ条件5、6、7、8、9、10、16、17が成立していること。
    on_failure: |
      fix-and-reverify。frontmatter・ライフサイクルの不備は修正して再検証する。
  - id: TS-005
    target_item: AG-006
    verification: |
      既存機構の追従を検証する。
      targeted docs guard と docs-check が docs/designs/** と design-save を正しく扱うことを確認する。
      索引生成と健全性計測が docs/designs/ を対象として動作することを確認する。
      Artifact Graph の標準入力パスが docs/designs/、対応ノード型が design であることを確認する。
      Artifact Graph の TIM関係型、関係意味、高位問い合わせについて、本変更由来ではない変更が入っていないことを移行前後の差分で確認する。
      Report分離後、audits/、baselines/ をDesignではないものとして扱う専用例外が不要になっていることを確認する。
    pass_criteria: |
      RU-0001受け入れ条件20、21、22、23が成立していること。
    on_failure: |
      fix-and-reverify。追従漏れは本変更の不備であるため修正して再検証する。
  - id: TS-006
    target_item: AG-007
    verification: |
      主要経路の完遂性を検証する。通常のREQ形成（req-define → req-save）、Design保存（design-save）、Case実行（case-open → case-run）、
      Case確定（case-close）、docs-check を一連で実行し、各経路がDesign移行後も完遂できることを確認する。
      req_draft の direct consumer 集合が {req-save, design-save, case-open} として動作することを確認する。
    pass_criteria: |
      RU-0001受け入れ条件25が成立していること。
    on_failure: |
      fix-and-reverify。経路断絶は本変更の不備であるため修正して再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001#対象外
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0001対象外セクションの全項目（TIM最終モデル確定、TIM用Design単位ID、DES-* 等の新規ID体系、Design内トレース対象粒度の確定、
      DecisionのTIM参加判断、Artifact Graphの関係型・関係意味・高位問い合わせの再設計、OpenFastTrace等の外部ツール採否、
      Report専用の保存コマンド・ライフサイクル・独立ワークフローの新設、新しい検証基盤の導入、旧spec-saveの互換コマンド・互換aliasの維持、
      release互換等の無関係な後方互換機構）は本要件docの対象外とする。TIM再検討はDesign移行完了後に別課題として再開する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: RU-0001#作業仮定
    disposition: partially_covered
    reason_code: delegated_to_case
    reason: |
      作業仮定3項目（旧SPECファイルの個別移動先は内容確認に基づく分類、既存相対リンク・IRのaffected_artifacts・検査fixtureの物理移動追従、
      旧語彙検出の誤検出防止）は利用者向け要件ではなく実装作業の前提であるため、要件行化せず case 側（実装）の判断事項として扱う。
      誤検出防止のみ TS-002 の合格基準に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 作業仮定
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    RU-0001は単一の横断変更として扱い、中間状態で旧語彙と新語彙を併存させない（AG-007）。
    そのため 4 OU（REQ-001/004/008/036 更新）と case 側語彙置換・docs/designs 移行・docs/reports 分離・design-save 体系移行・
    Artifact Graph 追従を単一 Issue・単一 PR の横断変更として構成すること。
    実装内部の順序依存（AG-007 の6段階）を PR 内の作業順として扱う。Epic・Wave 分割は行わない。
  wave_hints: []
```

# summary

RU-0001（SPEC成果物のDesign再定義と文書体系再構成）を入力とする壁打ち結果。

- 正式なREQ更新は REQ-001 / REQ-004 / REQ-008 / REQ-036 の4件（UPDATE、新規REQなし、新規Decisionなし）
- それ以外の語彙置換・物理移行は本 draft が授権する単一横断変更（case 側）として実行
- 実証Caseではなく通常Case、work_type は feature、scale は large（影響ファイル数・変更件数シグナルによる）
- architecture-advisory の助言（DEC-007 列挙の非意味的追従、case 側横断変更の明示授権、正規所有原則の維持）は CR-001〜003 に記録済み
- `agentdev_handoff: true` は self-hosting リポジトリ（agent-dev-flow 本体）のため履歴メタデータとして通常 workflow で処理
