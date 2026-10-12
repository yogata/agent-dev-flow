---
draft_type: req_draft
topic_slug: v51-phase-driven-collaboration
status: draft
created_at: 2026-10-12T14:47:02+09:00
source_rus:
  - RU-0001
---

<!-- req_draft テンプレート準拠の完了ドラフト（NFR ゲート解消後）。
 後続工程の原本は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
 NFR ゲート（REQ-004-050〜053）は Supervisor 経由の利用者確認（2026-10-12）により解消済み。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  RU-0001（ADF v5.1.0 工程の検討テーマ・外部結果と正規成果物の段階形成）の要件定義ドラフトである。
  新規REQ（v51-phase-driven-collaboration、採番規則による割当て）の作成、REQ-104 への採用規約4状態解決行（REQ-104-008）の追加、Decision（工程駆動コラボレーションモデル採用）と Design（v51-phase-driven-collaboration-model）の新設を定義する。
  合議の権威情報源は .agentdev/backlog/req-units/RU-0001.md の Source Summary と「先行標準の採用と実現手段の簡素化（合意済み方針）」である。
  NFR ゲート（REQ-004-050〜053）は Supervisor 経由の利用者確認（2026-10-12）により解消した。実現面の変更方針は realization_actions、既存REQ・Design との整合は conflict_resolutions に記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      v4 の変更駆動による要件化から実装・検証までの有効能力を v5.1.0 でも維持し、その独立した利用経路を置き換えずに工程駆動を追加する。工程テーマ作成・外部検討を変更駆動の必須前処理にしない。変更駆動から工程駆動へ移る際も、同じ正規成果物と有効な合意を利用する。
  - id: AG-002
    content: |-
      工程駆動の4操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、phase-review）を採用する。工程遷移は利用者判断による単独操作とし、ADF による工程完了認定や過剰な進捗管理を増やさない。旧 phase-plan の追加候補提示は、次工程の初回 phase-tasks-create に統合する案Aを採用する。
  - id: AG-003
    content: |-
      採用規約の解決。採用宣言がなくても有効な既存運用（実効規約）があればそれを優先し、採用宣言のない移行期は実効運用を基準とする。基準がないときだけ、利用者が採否判断できる標準案を未採用候補として提示する。初回工程で有効な上流成果物がなくても異常扱いせず、明示された目的・範囲・既知制約に対応する根拠を提示し、衝突は未決と表示して提案を必須要求へ自動昇格させない。
  - id: AG-004
    content: |-
      phase-tasks-create は工程の初回に参考テーマを形成する。phase-tasks-update は初回作成の前後でも独立して実行でき、テーマ正本・変更理由・旧新対応を必要な範囲で再構成する。有効な複数成果物の実内容と工程間の対応に照らして参考候補を帰納的に調整し、特殊例・資料不足・自己生成した未採用案から新しい必須条件を創作しない。
  - id: AG-005
    content: |-
      持出し入力は有効な現行前提を示し、外部AIへの無断送信を行わない。自動構成する持出し内容に既知の機微指定情報や認証値を無断混入させず、利用者が内容を確認・選択できる機会を与える。未知の秘密情報を完全自動発見する分類器は要求しない。
  - id: AG-006
    content: |-
      外部AIの戻り入力は貼付と指定ファイルの両方を受理し、両経路で意味上同じ確定結果を得る。採用根拠は利用者の明示判断か有効な正規決定に限定し、AI の自己申告「承認済み」は証拠としない。採否不明の部分だけ確認する。
  - id: AG-007
    content: |-
      1回の入力に衝突事項と独立反映可能な採用事項が混在する場合、安全な独立事項は反映可能にし、衝突・未確認・保存失敗箇所を区別する。書込失敗後の再投入は実際の確定状態から必要分だけ継続し、部分成功を全件完了と表示しない。
  - id: AG-008
    content: |-
      正規成果物への初回形成と増分更新を行い、別セッションで増えた成果物を含む工程全体像を正規情報から再構成する。閲覧用出力は第二の正本として管理しない。テーマ統合・廃止時は未決事項を後継へ引き継ぎ、対象外判断の根拠を追跡できるようにする。旧テーマへの遅延結果は独立識別と旧新関係、現行正規成果物に照らして安全に対応できる部分だけ再接続する。
  - id: AG-009
    content: |-
      実現手段の抑制（合意済み方針）。採用済み規約・既存実効規約を優先し、参考案を自動必須化しない。独立したテーマ履歴DB、深度採点器、全体像の別正本化を要求しない。テーマ間対応と変更結果は既存正規成果物・Git 履歴・必要最小限の識別情報から復元できればよい。この節は実現手段の抑制であり、受け入れ条件の要求する外部的結果や検証範囲を免除しない。
  - id: AG-010
    content: |-
      外部AI戻り入力の非機能受け入れ条件（REQ-004-050〜053。Supervisor 経由の利用者確認 2026-10-12）。外部AIの戻り入力（貼付・指定ファイルの受理、解釈・採用）は REQ-004-050 の適用対象とする。外部AIの出力は内容の正確性を事前に保証できない外部入力（誤り・偽装「承認済み」申告を含み得る）であり、信頼できない入力の解釈に該当する。処理量上限は入力サイズに対する線形走査（時間計算量 O(n)、n は戻り入力のサイズ）、出力上限は明示採用件数に対して線形の証跡量、失敗挙動は fail-closed（不正または曖昧な入力は不採用として残し、確定しない）。持出し（外部AIへの送出内容の自動構成）は適用対象外とし、AG-005 の既合意で受け入れ条件を満たす。この前提を要件docに記録する（REQ-004-050 の記録義務）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:v51-phase-driven-collaboration
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |-
      ---
      id: REQ-110
      title: "ADF v5.1 工程駆動コラボレーション（検討テーマ・外部検討と正規成果物の段階形成）"
      created: "2026-10-12"
      updated: "2026-10-12"
      ---

      ## 目的

      工程駆動における検討テーマの育成管理、外部AI検討の持出しと戻り受理、正規成果物への段階形成と工程全体像の再構成の利用契約を所有する。変更駆動経路の有効能力を維持し、工程駆動の開始・テーマ作成を変更駆動の必須前処理としない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-110-001 | 工程駆動の各操作は、操作対象の取組・対象版・現在工程を既存の正規状態から特定できること。同一取組の再開では確定した対象版・現在工程を復元し、別取組に旧工程や未決テーマを無条件に引き継がないこと。特定できない場合は当該正規成果物への変更を保留し、候補と不足を報告すること |
      | REQ-110-002 | 初回工程で有効な上流成果物が存在しない場合に異常とせず、利用者が明示した目的・対象範囲・既知制約と参考テーマとの対応、または根拠付きの非該当・未確認を提示できること。制約間の未決の衝突は未決として表示し、参考候補を必須要求へ自動昇格させないこと |
      | REQ-110-003 | 検討テーマの追加・具体化・分割・統合・廃止を、テーマ正本の初回形成の前後を問わず独立して実行できること。テーマ正本・変更理由・旧新対応は別セッションから確認可能な形で再構成し、実質的な変更がない同一入力の再実行で不当な再編や変更報告を増やさないこと |
      | REQ-110-004 | テーマの統合・廃止に際して、継続対象の未決事項は後継テーマへ引き継ぎ、対象外・不要とされた事項はその判断根拠が追跡できること。未決のまま自動解消したと扱わないこと |
      | REQ-110-005 | 外部検討中のテーマの改名・分割・統合後に旧テーマ識別で結果が戻った場合、独立識別と旧新関係および現行正規成果物を照合し、安全に対応できる部分だけを再接続・反映し、不一致・解決不能な部分を保留できること |
      | REQ-110-006 | 外部への検討入力の持出しは、有効な目的・問い・必要な前提・参照元を利用者が確認できる形に構成すること。外部AIへの自動送信を行わず、既知の機密指定情報・認証値を無断で持出し内容に混入せず、利用者に内容の確認と選択の機会を与えること。未知の秘密情報を完全に自動発見することを要求しないこと |
      | REQ-110-007 | 外部検討の戻り入力は貼付と指定ファイルの両方を受理でき、両経路で意味上同じ確定結果を得られること。採用根拠は利用者の明示判断または有効な正規決定に限定し、外部AIの自己申告を採用証拠としないこと。採否不明の部分だけを確認対象とすること |
      | REQ-110-008 | 採用済みの内容は、既存の有効な正規成果物へ意味のある増分更新として反映し、変更駆動経路で確定した正規成果物と有効な合意を工程駆動経路でも参照して利用できること。先行する合意と矛盾しない範囲を保持し、矛盾する部分は根拠とともに保留できること |
      | REQ-110-009 | 1回の戻り入力に衝突事項と独立反映可能な採用事項が混在する場合、安全な独立事項を反映し、衝突・未確認・保存失敗の箇所を区別して報告できること。書込失敗後の同一入力の再投入は、実際の確定状態から必要な分だけ継続し、重複や消失を生まないこと |
      | REQ-110-010 | その時点で有効な工程全体の正規成果物群から、採用済み事項・必要な上流前提・未決事項を区別した一貫した閲覧像を再構成できること。閲覧用出力を第二の正本として管理しないこと |
      | REQ-110-011 | 参考候補の生成と調整は、有効な複数の正規成果物の実内容と工程間の対応に照らして帰納的に行い、意味不変の差から新しい必須条件を導出せず、比較不能な対象と適用限界を明示できること |
      | REQ-110-012 | 工程遷移後の次工程における初回テーマ形成は、既知の必須事項と新たな参考候補を区別して提示し、候補を正式な要求や工程完了の判断へ自動昇格させないこと |
      | REQ-110-013 | 別セッションにおいて、ADF が受領済みの途中検討知見を必要な受領情報から再取得でき、一度も受領していない外部検討内容を復元したと主張しないこと |
      | REQ-110-014 | テーマ一覧は現在有効なテーマ正本から導出し、別の更新可能な恒久正本を作らないこと。テーマと Issue・成果物の一対一対応を強制しないこと |
      | REQ-110-015 | 外部AIの戻り入力の受理・解釈は、入力サイズに対する線形走査（時間計算量 O(n)、n は戻り入力のサイズ）で処理し、採用・不採用の記録は明示採用件数に比例する証跡量で出力し、不正または曖昧な入力は不採用として残し確定しないこと（fail-closed）。この適用対象の前提（外部AIの出力は内容の正確性を事前に保証できない外部入力であり、誤り・偽装「承認済み」申告を含み得る）を要件docに記録すること |

      ## 適用範囲

      - **対象**: 取組・対象版・現在工程の特定と再開、上流不存在時の参考テーマ形成、テーマ正本の独立更新と未決事項の引継ぎ、外部検討の持出し確認と戻り受理・採用、正規成果物への増分反映と部分反映、工程全体像の再構成、帰納的候補調整、外部AI戻り入力の非機能受け入れ条件
      - **対象外**: 工程全体の完了認定、検討深度・網羅範囲の自動採点、全未知要求の発見保証、全会話記録・会話URLの保存、外部AIへの自動送信、第二の正規原本、テーマと Issue の一対一必須対応、未知の秘密情報の完全自動発見、独立したテーマ履歴DB・深度採点器・作業分解管理制度の新設

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-104.md
    target_area: 要件
    source_items: [AG-003]
    content: |-
      | REQ-104-008 | 採用規約の解決は、採用宣言あり、宣言なしでも有効な既存運用あり、両方なし、宣言が存在するが読取不能の各状態を区別して扱うこと。既存の有効規約を優先し、基準がないときだけ標準案を未採用候補として提示し、読取不能時は判断を留保すること（REQ-105-008 の移行期規約を包含する） |
    note: |-
      テーブル最終行（REQ-104-007）に隣接して挿入し表の連続性を保つ。組立検査はセクション末尾追記として検証済み（assembly_evidence AE-001）。

  - id: ACT-DECISION-001
    artifact: decision
    operation: create
    target: new:v51-phase-driven-collaboration
    source_items: [AG-001, AG-002, AG-005, AG-006, AG-007, AG-008, AG-010]
    content: |-
      【decision 要素】
      title: 工程駆動コラボレーションモデル（検討テーマ・外部検討・段階形成）の採用
      context: v5.1.0 は変更駆動に加えて工程駆動を追加し、工程の設計を別セッション・外部AI検討で段階的に育て、最新の正規成果物群から全体像を再構成できるようにする。旧 phase-plan の追加候補提示は次工程の初回テーマ形成へ統合する（案A）。
      decision: 検討テーマの正本と導出一覧の単一正本原則、外部AI検討の仲介モデル（持出しは利用者確認・無断送信禁止・既知機微情報の無断混入禁止、戻りは貼付・ファイル両受理で採用根拠は利用者明示判断または有効な正規決定のみ）、正規成果物への増分形成と閲覧像の第二正本化禁止、外部AI戻り入力の非機能受け入れ条件（線形走査 O(n)・採用件数比例の証跡量・fail-closed）を採用する。工程テーマ作成・外部検討を変更駆動の必須前処理としない。
      consequences: 工程駆動コラボレーションの利用契約は新規REQ（v51-phase-driven-collaboration）が所有し、REQ-106/107 の差分・追跡義務を再定義しない。採用規約の4状態解決は REQ-104 へ追加する。操作の入出力手順・保存構造・実行主体は Design（v51-phase-driven-collaboration-model）が所有する。
      relates-to: DEC-053, DEC-054, DEC-055, DEC-056
      出所: RU-0001 Source Summary（2026-10-12 利用者承認）。NFR 条件は Supervisor 経由の利用者確認（2026-10-12）。

  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target: new:v51-phase-driven-collaboration-model
    target_design:
      operation: create
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    source_items: [AG-002, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |-
      【design 要綱】v51-phase-driven-collaboration-model（工程駆動コラボレーションモデル）
      - テーマ正本の保存構造・識別子・一覧導出規則。配置は .agentdev/ 配下の domain state とし、REQ-001/002 の文書体系・配布境界と REQ-009 の導入モデルに従う
      - 取組・対象版・現在工程の識別状態と、書込対象解決・再開の状態モデル。識別状態は書込対象解決・再開・検討知見の継続を目的とする最小状態とし、進行度・完了率・残作業の恒久台帳を作らない
      - 持出し文書の構成手順と利用者確認フロー、既知の機密指定情報・認証値の混入防止規則（AG-005 の実現手段。未知の秘密情報の完全自動発見は行わない）
      - 戻り受理の入出力手順（貼付・ファイル両経路）、採用記録の形式、部分反映と書込失敗後の再投入の状態管理。fail-closed と安全な独立部分反映（AG-007）の両立手順
      - 外部AI戻り入力の非機能条件の実現方式（入力サイズ線形の走査、明示採用件数に比例する証跡、不正・曖昧入力の不採用保留）
      - 帰納的候補生成の根拠記録形式と限界表示
      - 実行主体分類: テーマ形成・更新、成果物反映の各操作について adapter skill / command / subagent / harness の別と責務境界
      - 工程駆動ルートにおける正規成果物保存の経路別所有境界は、v4-standard-lifecycle の更新（RU-0002 側 ACT-DESIGN-002）と整合して固定する

conflict_resolutions:
  - id: CR-001
    content: |-
      NFR ゲート（REQ-004-050〜053）の適用対象と3項目の確定。外部AI戻り入力（貼付・指定ファイルの受理、解釈・採用）は REQ-004-050 の適用対象とする（外部AIの出力は内容の正確性を事前に保証できない外部入力であり、信頼できない入力の解釈に該当。認証とは無関係に誤った内容の正規成果物への混入を防ぐ確認である）。処理量上限は入力サイズに対する線形走査（時間計算量 O(n)）、出力上限は明示採用件数に対して線形の証跡量、失敗挙動は fail-closed（不正または曖昧な入力は不採用として残し、確定しない）。持出し（外部AIへの送出内容の自動構成）は適用対象外とし、AG-005 の既合意で受け入れ条件を満たす。この組み合わせは AG-006（採用根拠の制限）・AG-007（安全な独立部分反映）の合意と矛盾しないことを利用者確認済みである。判断の出所: Supervisor 経由の利用者確認（2026-10-12）。
  - id: CR-002
    content: |-
      REQ-104-006（工程進捗の恒久管理を ADF の共通中核の必須要件としない）とテーマ正本・取組・現在工程の識別状態の関係。識別状態は書込対象解決・再開・検討知見の継続を目的とする最小状態であり、進行度・完了率・残作業の恒久台帳を要求しない。テーマ一覧は正本からの導出に限り（AG-008）、Issue との一対一対応を強制しない。出所: アーキテクチャ助言の確定事項（2026-10-12）と RU-0001 対象外節。
  - id: CR-003
    content: |-
      主要責務一意の原則（正規成果物の保存・確定は変更駆動では case-ready/case-revise が所有）と工程駆動ルートの正規成果物への増分反映の関係。本ドラフトの REQ 行は共通の正規成果物への増分反映と両ルートでの参照・再利用の義務にとどめ、経路別の所有境界と Design の昇格（draft から accepted）の工程駆動版は Design 側（v4-standard-lifecycle の更新は RU-0002 側 ACT-DESIGN-002）で固定する。出所: アーキテクチャ助言の採用（親エージェント分類、2026-10-12）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: new:v51-phase-driven-collaboration
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-104
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003（取組・対象版・現在工程の特定と再開、RU-0001 A02）
    verification: 取組Aと正規一式を複製した取組Bを別セッションで開始・再開し、対象版または現在工程が一意に決められない条件を含めて、書込対象と未変更側ファイルを突合する。
    pass_criteria: 同一取組の再開で確定した対象版・現在工程を復元し、別取組に旧工程・未決テーマを無条件に引き継がず、特定不能時に当該正規成果物への誤書込が発生しない。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-003（上流不存在の正常扱い、A03）
    verification: 初回工程に有効な上流成果物がない状態で、利用者が目的・対象範囲と意味の異なる既知制約2件（未決の衝突を含む対照）を明示してテーマ形成を実行し、生成物を照合する。
    pass_criteria: 各既知事項が参考テーマまたは根拠付きの非該当・未確認に対応し、既知の事項が説明なく脱落せず、未採用案が必須化されず、衝突が未決として表示される。評価対象は提示した既知事項であり、未知論点の網羅率ではない。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-004（テーマの独立更新と無変更再実行、A04/A05/A17）
    verification: テーマ0件でテーマ更新操作を先行実行した後に初回テーマ形成を実行、初回作成の中断・再試行、無変更の同一入力による再実行、テーマ一覧要求後の名称変更・分割を実施し、操作前後のテーマ正本と導出一覧を比較する。
    pass_criteria: 重複・消失がなく、実際の部分成功が報告と一致し、無変更対照で実質差が生じず、一覧と正本のずれがなく二重管理が発生しない。
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: AG-008（未決事項の引継ぎ、A06）
    verification: 未決の問いと検討継続知見を含むテーマの統合・廃止（利用者が明示的に対象外としたケースを含む）を実施し、旧新対応と後継の問いを追跡する。
    pass_criteria: 継続対象の未決事項が後継へ引き継がれ、対象外・不要判断の根拠が追跡可能で、未決が自動解消済み扱いにならず、遅延結果を旧識別から扱える。
    on_failure: fix-and-reverify
  - id: TS-005
    target_item: AG-008（旧テーマへの遅延結果の再接続、A07）
    verification: 外部検討中にテーマの改名・分割・統合を行った後、旧テーマ識別に対する採用済み結論と未決が戻る条件を作り、正本の反映・保留を突合する。
    pass_criteria: 一意に対応できる部分が失われずに再接続・反映され、不一致・解決不能部分が保留され、古い前提で現行確定事項が上書きされない。
    on_failure: fix-and-reverify
  - id: TS-006
    target_item: AG-005（持出しの確認境界、A08）
    verification: 旧前提と現行前提を含む検討テーマについて、既存の機密指定または明示的に認証情報と判別できる模擬値が参照元に含まれる場合と含まれない場合を対照して持出し内容を構成する。
    pass_criteria: 持出し内容と現行正規原本の対応が取れ、旧前提が排除され、既知の模擬認証値が不掲載または安全に伏せ字され、利用者が内容を確認・選択でき、外部への自動通信が発生しない。機密指定のない未知の情報の全発見保証は評価範囲外とする。
    on_failure: fix-and-reverify
  - id: TS-007
    target_item: AG-006（戻り受理と採用根拠、A09）
    verification: 同じ承認内容を貼付文と指定ファイルで渡し、別入力で外部AIの自己申告「承認済み」・利用者の明示採用・未採用提案・調査情報を混在させて受理する。
    pass_criteria: 両経路で意味上同じ確定結果が得られ、採用のみが反映され、未採用と不明が反映されず、AI の自己申告が採用根拠にならない。
    on_failure: fix-and-reverify
  - id: TS-008
    target_item: AG-007 と AG-008（増分更新・部分反映・再投入、A10/A12）
    verification: 同一工程で採用済み内容を反映した後、別セッションで権限内容の追加と先行内容と矛盾する入力を行い、さらに衝突事項と独立反映可能な採用事項が混在する1回の入力の書込失敗後に同じ入力を再投入する。
    pass_criteria: 先行合意と矛盾しない範囲が保持され、矛盾部分が根拠とともに保留され、安全な独立事項が反映され、実施済み範囲と報告が一致し、再試行で重複や消失が生じない。
    on_failure: fix-and-reverify
  - id: TS-009
    target_item: AG-008（全体像の再構成、A11）
    verification: 複数成果物・同一成果物の複数部分に分けた採用結果の蓄積と未決論点の残存状態から工程全体像の再構成を要求し、導出された閲覧像と各正規原本・上流・未決を独立突合する。
    pass_criteria: 両採用事項と必要な上流前提と未決が区別されて含まれ、未採用候補が確定扱いされず、閲覧像が第二の正本として管理されない。
    on_failure: fix-and-reverify
  - id: TS-010
    target_item: AG-004（帰納的候補調整の限界、A13/A14）
    verification: 同じ未決テーマ・明示範囲を固定し、同工程の有効な複数成果物A1/A2とB1/B2だけを切替え、A13の資料に意味不変の見出し・改行差だけを加えたC、正規資料0件または未採用の自己生成テーマしかないD、特殊な1例を用意して候補生成を比較する。
    pass_criteria: A では失効拒否・再認証、B では無効化即時反映・実行中要求という資料の実内容に即した根拠付き候補が生成され、C で新たな必須深度が導出されず、D と特殊例で比較不能・適用限界が明示され、根拠のない義務化が行われない（文言の完全一致は要求しない）。
    on_failure: fix-and-reverify
  - id: TS-011
    target_item: AG-004（遷移直後の初回形成、A15）と AG-008（受領済み知見の継続、A16）
    verification: 利用者判断による工程遷移直後に初回テーマ形成を実行し、ADF 受領済みの途中検討知見を持つテーマと外部でのみ議論した未受領内容を別々に用意してセッションを変更する。
    pass_criteria: 既知の必須事項と新たな参考候補が区別されて提示され、候補が正式な要求・工程完了判断へ自動昇格せず、受領済み知見が正規情報から再取得され、未受領内容の復元が主張されない。
    on_failure: fix-and-reverify
  - id: TS-012
    target_item: AG-003（採用規約の4状態解決、A01、REQ-104-008 追加行）
    verification: 採用宣言あり／宣言なしでも有効な既存運用あり／両方なし／宣言が存在するが読取不能の4状態で、工程と必須成果物の解決結果と正規ファイルの変更有無を確認する。
    pass_criteria: いずれの状態でも既存の有効規約が維持され、未採用案の標準案で欠落判定が行われず、読取不能時に判断留保となり、既存運用の標準案による上書きや自動置換が発生しない。
    on_failure: fix-and-reverify
  - id: TS-013
    target_item: AG-010（外部AI戻り入力の非機能受け入れ条件、REQ-110-015）
    verification: サイズの異なる戻り入力（貼付・ファイル両経路）と不正・曖昧な入力を注入し、処理ステップ数・証跡量・採用確定の有無を観察する。
    pass_criteria: 処理が入力サイズに対して線形（O(n)）であり、採用・不採用の記録が明示採用件数に比例し、不正または曖昧な入力が不採用として残り確定しない（fail-closed）。
    on_failure: fix-and-reverify

realization_actions:
  - id: RA-001
    concern: 工程駆動コラボレーション操作（テーマ形成・更新、正規成果物への反映）の実現面
    responsibility: 新規の Workflow Skill 群（テーマ形成・テーマ更新・成果物反映の各 workflow 実装本体）と Capability Skill（テーマ正本管理・外部検討の持出しと戻り受理）の新設、対応する公開コマンド定義の追加
    ownership_hints: src/common/skills/ 配下の新規スキル、src/common/commands/agentdev/ 配下の新規コマンド定義。最終的な名前・構文は Design（v51-phase-driven-collaboration-model）の設計裁量
    intent: REQ-110-001〜014 の外部契約を公開操作として成立させる。戻り受理は REQ-110-015 の非機能条件（線形走査・比例証跡・fail-closed）を実装に反映する
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-008, TS-009, TS-010, TS-011, TS-013]
    source_items: [AG-001, AG-002, AG-004, AG-005, AG-006, AG-007, AG-008, AG-010]
  - id: RA-002
    concern: テーマ正本・取組・現在工程の識別状態の保存領域
    responsibility: .agentdev/ 配下の新規 domain state 領域の定義と .agentdev/README.md 状態表への追記
    ownership_hints: .agentdev/ のディレクトリ構成、REQ-001/REQ-002 の文書体系・配布境界、REQ-009 の導入モデル
    intent: 識別状態（書込対象解決・再開・検討知見の継続のための最小状態）の永続化とテーマ一覧の導出。進捗台帳は作らない（CR-002）
    verification_refs: [TS-001, TS-003, TS-009]
    source_items: [AG-004, AG-008]
  - id: RA-003
    concern: 配布ドキュメントの整合
    responsibility: README のコマンド索引、コマンドリファレンス、コマンド選択ガイドへの新規公開操作の追記
    ownership_hints: README.md、src/common/commands/agentdev/README.md、docs/guides/command-selection.md
    intent: 新規公開操作の利用案内。REQ-005-010 更新後の分類（工程駆動実行）との整合
    verification_refs: [TS-001]
    source_items: [AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 目的・背景・問題
    disposition: covered
    checked_at_commit: null
  - id: RD-002
    source_ru: RU-0001
    source_item: Source Summary
    disposition: covered
    checked_at_commit: null
  - id: RD-003
    source_ru: RU-0001
    source_item: 統合理由
    disposition: covered
    checked_at_commit: null
  - id: RD-004
    source_ru: RU-0001
    source_item: 要件化の方向
    disposition: covered
    checked_at_commit: null
  - id: RD-005
    source_ru: RU-0001
    source_item: 主対象REQまたは変更対象候補
    disposition: covered
    checked_at_commit: null
  - id: RD-006
    source_ru: RU-0001
    source_item: 決定的受け入れ条件 A01〜A17
    disposition: covered
    checked_at_commit: null
  - id: RD-007
    source_ru: RU-0001
    source_item: 先行標準の採用と実現手段の簡素化（合意済み方針）
    disposition: covered
    checked_at_commit: null
  - id: RD-008
    source_ru: RU-0001
    source_item: 作業仮定・未決事項（正式要件へ混入させない）
    disposition: not_applicable
    checked_at_commit: null
  - id: RD-009
    source_ru: RU-0001
    source_item: PC01〜PC34・PoC40・引渡しV01〜V15 の言及
    disposition: not_applicable
    checked_at_commit: null

assembly_evidence:
  - id: AE-001
    action_id: ACT-REQ-002
    target_file: docs/requirements/REQ-104.md
    target_content_sha256: 0792a8bfa842ba7481ff05a949e5f99a9f97e4a1ca6dd90dd553aef8a859f619
    check_scope:
      heading: "## 要件"
      start_line: 14
      end_line: 25
    execution_conditions:
      operation: append
      edit_sha256: 17dbd20c71e3e85b26e713bbbbe1c92ee0ee2d41d55a32ff17a12840782073fa
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre: { count: 2, all_ok: true }
      post: { count: 2, all_ok: true }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-10-12T05:30:10.675Z"
    note: |-
      スクリプトの append はセクション末尾追記として検証している。実際の表編集では REQ-104-007 行に隣接して挿入し表の連続性を保つ。

case_open_hints:
  epic_needed: true
  decomposition: |-
    文書系の作業（新規REQ作成、REQ-104 追加、Decision 作成、Design 作成）と実現面の作業（RA-001〜RA-003）を別々の実行ユニットへ分解する。RU-0002 側（工程遷移・独立レビュー・REQ-005 更新）と同一リリースで整合する。REQ 番号の割当ては req-file-manager の採番規則（alloc-req-number.ts）に従い、本ドラフト本文行の REQ-110 プレフィックスは割当て番号へ置換する。最終的なコマンド名・構文・テーマIDの形式・報告形式・保存方式は RU-0001 の作業仮定のとおり Design の設計裁量とする。
  wave_hints:
    - |-
      RU-0002 側ドラフト（.agentdev/drafts/req-draft-v51-phase-transition-and-coexistence.md）の B 系受け入れ条件は、本RU の成果物と操作が成立した環境で検証する（RU-0002 frontmatter の depends_on: [RU-0001]）。
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

RU-0001 由来の要件定義ドラフト（完了版）。新規REQ（v51-phase-driven-collaboration、15要件行）の作成、REQ-104-008 の追加、Decision 1件・Design 1件の新設を定義する。NFR ゲートは Supervisor 経由の利用者確認（2026-10-12）で解消済み。REQ-005-001/010/011 の更新は RU-0002 側ドラフトが所有する。adversarial-review（STEP-8）の実施結果は完了報告に記録する。
