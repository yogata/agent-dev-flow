---
draft_type: req_draft
topic_slug: third-party-skill-sync
status: saved
design_consumed: true
created_at: 2026-08-30T00:45:00+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
# work_type: feature（third-party Skill 取得機構の新規追加）
work_type: feature

# scale: large（複数REQ・Decision・Design 5件・新機構実装にまたがる）
scale: large

# summary: third-party Skill を ADF 製 skill と分離する第三区分として定義し、
# 宣言（src/third-party/skills.yaml）と取得機構（/agentdev/third-party-sync、専用 Custom Tool 経由）で
# 利用者環境へ取得する。本体は ADF リポジトリ・配布成果物へ含めず、導入系スクリプトと
# scripts 公開入口に手を加えず、third-party への参照は宣言済み+参照点集約に限定する。
# 既存の個別特例（gitignore 特例・特例配置・doc-writing 以外の参照）は共通機構へ統合して解消し、
# 機構実装後に機構経由で再取得する。
summary: third-party Skill の第三区分定義と宣言+取得機構の導入、参照規律の確立、個別特例の統合解消

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      第三区分の所有境界。third-party Skill（ADF が製作していない外部由来の skill）を ADF 製 skill
      と repo-local skill に続く第三の所有区分として定義し、その本体は ADF リポジトリおよび
      配布成果物へ含めない。ADF が所有するのは取得定義と取得機構までとする。
  - id: AG-002
    content: >-
      宣言と取得機構。src/third-party/skills.yaml に name と source で宣言する
      （revision 項目なし、取得形式を表す type 項目なし。版固定は source URL で表現し、
      取得形式は source から判定する）。利用者向け入口 /agentdev/third-party-sync は取得手順本体を
      所有せず専用 Custom Tool へ委譲する。単一 SKILL.md URL 型は .opencode/skills/<name>/SKILL.md
      へ正規化し、GitHub Skill ディレクトリ型は再帰取得して相対構造を保持し、
      Skill ディレクトリ外のファイルは取得しない。
  - id: AG-003
    content: >-
      導入・同期手段との分離。install.ps1 と self-sync.ps1 は third-party Skill 取得を実行せず、
      network access 禁止の既存契約（REQ-009-046）を維持する。scripts/ 直下の利用者向け公開入口は
      追加しない（REQ-050、REQ-052-008 維持）。
  - id: AG-004
    content: >-
      Custom Tool による外部取得。Custom Tool が提供する構造化された副作用操作には、
      外部ソース（URL、Git リポジトリ等）からの取得操作を含められる。操作契約（入力、出力、保証、
      失敗時の意味）の下で提供し、操作の結果を検証してから成功を返す。
  - id: AG-005
    content: >-
      third-party 依存の解決境界。宣言済み third-party Skill への依存は、宣言に基づく取得機構の実行
      によって consumer 環境で解決可能であることをもって runtime 依存解決を満たし、
      配布成果物への本体同梱を要求しない。
  - id: AG-006
    content: >-
      非破壊性・上書き保護・定義駆動拡張。取得失敗時に取得開始前に存在した正常な Skill を
      破壊または部分更新しない。機構が管理していない既存 Skill を無断で上書きしない。
      Skill 固有の取得ロジックを持たず、skills.yaml への定義追加だけで取得対象を拡張できる。
  - id: AG-007
    content: >-
      参照規律。配布成果物から third-party Skill を参照できるのは skills.yaml に宣言されたものに限り、
      各 third-party Skill への参照点を配布成果物間で集約する。参照点でない配布成果物は
      当該 third-party Skill を直接参照せず、正規参照点を経由する。文章規範等を横断利用する場合は
      正規参照点となる配布成果物を経由する。
  - id: AG-008
    content: >-
      個別特例の統合解消。gitignore 特例・特例配置・doc-writing 以外の特例参照を除去し、
      該当 Skill は skills.yaml 宣言+機構経由の再取得へ統合する。IR-058 を宣言済み third-party を
      許容する 3 分岐へ更新し、per-skill exemption は新設しない。該当 Skill の参照点は
      agentdev-doc-writing に集約し、doc-writing 以外は agentdev-doc-writing を経由する。
      source URL は宣言データとして運用者が skills.yaml へ登録する（本要件は個別 URL を規定しない）。
      監査レポートの過去記録は履歴として不修正とする。
  - id: AG-009
    content: >-
      実証Case判定。通常Case（main 直行）。採否判断は壁打ちで合意済みであり、検証は試験用 source と
      試験用 GitHub Skill ディレクトリによる取得テスト・失敗系テストで完結し、
      実証ブランチの追加コストが採否確度を上げないため。
  - id: AG-010
    content: >-
      宣言ファイルの性格。src/third-party/skills.yaml は配布成果物種別ではない宣言ファイルとする
      （case-schema/ 先行例と同様の位置づけ）。release archive への収録要否は実装時に
      package-release-archive.ps1 の投影範囲で検証する。
  - id: AG-011
    content: >-
      Git 管理境界と name 制約。ADF 本体リポジトリで取得された .opencode/skills/<name>/ の
      third-party 本体は Git 管理対象外とする（現行 .gitignore 構造で成立）。skills.yaml 宣言時の
      name は kebab-case とし、agentdev-・repo- 接頭辞は拒否する（名前空間予約との衝突回避）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-002
    target_area: REQ-002-019
    source_items: [AG-001]
    content: |
      配布成果物が参照する skill のうち ADF 製のものは src/opencode/skills/ 配下に配置し、
      配布物化すること。third-party Skill はこの対象外とし、第三区分規定（REQ-002-042 から
      REQ-002-044）に従うこと
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-002
    source_items: [AG-001, AG-002, AG-007, AG-011]
    content: |
      third-party Skill（ADF が製作していない外部由来の skill）を ADF 製 skill と repo-local skill
      に続く第三の所有区分として定義し、その本体を ADF リポジトリおよび配布成果物へ含めないこと。
      ADF が所有するのは取得定義と取得機構までとすること

      third-party Skill は宣言ファイルに基づく取得機構経由で利用者環境の .opencode/skills/<name>/
      へ配置し、ADF 本体リポジトリでは Git 管理対象外とすること。release 成果物へ
      third-party Skill 本体を含めないこと

      配布成果物から third-party Skill を参照できるのは宣言ファイルに宣言されたものに限り、
      各 third-party Skill への参照点を配布成果物間で集約すること。参照点でない配布成果物は
      当該 third-party Skill を直接参照せず、正規参照点を経由すること。既存の個別特例
      （特例配置、gitignore 特例、参照点外の直接参照）は本規定の正規経路へ統合して解消すること
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-009
    source_items: [AG-003]
    content: |
      導入・同期手段は third-party Skill の取得を行わないこと。third-party Skill の取得は
      宣言と取得機構（REQ-002-042 から REQ-002-044）が所有し、導入系スクリプトの
      network access 禁止（REQ-009-046）を維持すること
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-029
    source_items: [AG-005]
    content: |
      配布成果物が依存する third-party Skill は、宣言ファイルに宣言されたものに限り、
      宣言に基づく取得機構の実行によって consumer 環境で解決可能であることをもって
      runtime 依存解決（REQ-029-006）を満たすこととし、配布成果物への本体同梱を要求しないこと。
      宣言ファイルが当該 consumer 環境で利用可能であることを取得手段が保証すること
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-052
    source_items: [AG-004]
    content: |
      Custom Tool が提供する構造化された副作用操作には、外部ソース（URL、Git リポジトリ等）からの
      取得操作を含められること。取得操作固有の詳細の Design 委譲は REQ-002-037 に従うこと
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-002
    target_area: 目的・適用範囲
    source_items: [AG-001]
    content: |
      目的セクションの統括対象の列挙へ「third-party Skill の分離管理（第三区分）」を追記し、
      適用範囲の対象へ「third-party Skill の第三区分所有境界と参照規律」を追記する
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:third-party-skill-governance
    source_items: [AG-001, AG-003, AG-007, AG-010]
    content: |
      # third-party Skill の分離管理と取得機構の導入

      ## 背景

      ADF 製 skill と外部由来 skill が同一の配布モデルで扱われ、個別 third-party Skill の特例
      （特例配置、gitignore 特例、特例参照）が蓄積した。本体を配布物へ取り込む方式は再配布上の
      問題を持ち、将来の bundle 化・clone ベース取得の提案が再発するリスクがある。

      ## 決定

      1. third-party Skill の本体は ADF リポジトリおよび配布成果物へ含めない。
         ADF が所有するのは取得定義と取得機構までとする
      2. third-party Skill は宣言ファイル（src/third-party/skills.yaml）と取得機構
         （/agentdev/third-party-sync、専用 Custom Tool 経由）で利用者環境へ取得する。
         skills.yaml は配布成果物種別ではない宣言ファイルとする（case-schema/ 先行例と同様の位置づけ）
      3. 導入系スクリプト（install、self-sync）は third-party Skill を取得しない。
         scripts/ 直下の公開入口を増やさない（DEC-016 の副作用ゼロ原則の延長）
      4. third-party Skill への参照は、宣言済みであることに加え参照点を集約する
      5. 個別 third-party Skill の特例経路（特別配置、特別取得、per-skill exemption）を
         新設しない。既存特例は本機構へ統合して解消する

      ## 関連

      - DEC-016（導入系スクリプトの副作用ゼロ原則）: 決定 3 の根拠
      - 所有境界は REQ-002-042 から REQ-002-044、依存解決は REQ-029-009、
        Custom Tool 取得操作は REQ-052-011 が所有する

      ## 結果

      将来の bundle 化、clone ベース取得、個別特例の提案は本 Decision により阻止される。
      機構詳細（skills.yaml スキーマ、取得プロファイル、非破壊性）は REQ と Design が所有する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-004]
    content: |
      先頭対象記述を「Git / GitHub 等への構造化された副作用操作」から
      「Git、GitHub、外部ソース（URL、Git リポジトリ等）からの取得等の構造化された副作用操作」へ
      拡張する。

      「third-party Skill 取得」操作契約を追加する:

      - 入力: third-party 宣言（skills.yaml）の対象 Skill 名（省略時は全件）、dry-run 指定
      - 出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）
      - 保証: 取得結果の検証後に成功を返す。取得開始前に存在した正常な配置を取得失敗時に
        破壊しない。機構管理外の既存配置を無断で上書きしない
      - 失敗: 失敗を成功扱いとしない。部分取得状態を開始前状態へ解消し、失敗要因を報告する

      取得プロファイル（単一 SKILL.md URL 型・GitHub Skill ディレクトリ型の判定、正規化、
      再帰取得、相対構造保持、Skill ディレクトリ外非取得）の詳細は
      Design third-party-skill-management が所有する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: IR-058-distribution-untracked-skill-reference
    target_area: 検査項目
    source_items: [AG-007, AG-008]
    content: |
      検査判定を 3 分岐へ更新する:

      1. 参照される skill 名が repo-* の場合: 従来どおり除外（本体専用の repo-local skill）
      2. 参照される skill 名が third-party 宣言ファイル（src/third-party/skills.yaml）に
         宣言されている場合: 適合（宣言済み third-party 参照）。参照点集約規律（REQ-002-044）の
         運用確認は本検査の対象外とする
      3. いずれでもない場合: strict fail。triage として src/opencode/skills/ への昇格
         （配布物依存スキル）または skills.yaml への宣言登録を案内する

      逆検査を追加する: 配布成果物が third-party Skill 名を参照するが skills.yaml 未宣言の場合も
      fail とする（検出対象名集合の決定方法は本 Design が所有する）。

      per-skill exemption は本規定では新設しない（個別特例の正規経路化を禁止する）。
      既存の未宣言参照の是正完了まで、本検査の未宣言検出は triage 案内の提示に限定する。
      是正の期限・対象と管理は本 Design を所有せず、実装 execution contract が所有する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: 昇格基準
    source_items: [AG-008, AG-011]
    content: |
      昇格基準表に第三区分の行を追加する:

      - third-party Skill: 昇格対象外。.opencode/skills/<name>/ への取得機構経由配置が正規であり、
        src/opencode/skills/ へ昇格しない。配布成果物から参照する場合は宣言と参照点集約
        （REQ-002-044）に従う。
  - id: ACT-DESIGN-004
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: commands
      slug: third-party-sync
    source_items: [AG-002, AG-003]
    content: |
      # third-party-sync コマンド Design

      ## 入口契約

      - 利用者向け入口: /agentdev/third-party-sync
      - 入力: 対象 Skill 名（省略時は全件）、dry-run 指定
      - 出力: 取得結果報告（対象一覧、成否、配置パス、管理外衝突検出状況）
      - ガードレール: 取得手順本体を所有せず専用 Custom Tool へ委譲する。
        scripts/ 直下の公開入口を追加しない（REQ-003 との整合上、副作用実行は Tool が担う）

      ## Workflow Skill 設計（同一 Design 内統合）

      - STEP-1 入力解決・skills.yaml 読込と検証（構文、name 制約）
      - STEP-2 対象選択（全件または指定名、管理外衝突の事前判定）
      - STEP-3 取得実行（Custom Tool 委譲、dry-run 指定時は計画表示のみ）
      - STEP-4 結果検証・報告（成功読み戻し確認、失敗時の状態維持と要因報告）

      実装詳細（ファイル構成、エラーメッセージ）は実装スコープとする。
  - id: ACT-DESIGN-005
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: local
      slug: third-party-skill-management
    source_items: [AG-001, AG-002, AG-006, AG-008, AG-010, AG-011]
    content: |
      # third-party Skill 管理 Design

      ## 目的

      third-party Skill の宣言と取得機構の正規仕様。
      REQ-002-042 から REQ-002-044、REQ-029-009、REQ-052-011 の Design が所有する詳細。

      ## 宣言ファイル（skills.yaml）

      - 配置: src/third-party/skills.yaml。配布成果物種別ではない宣言ファイル
        （case-schema/ 先行例と同様の位置づけ）
      - スキーマ: name（kebab-case、agentdev-・repo- 接頭辞拒否）と source。
        revision 項目なし、取得形式を表す type 項目なし。版固定は source URL で表現する
      - source 形式判定: 末尾が SKILL.md の URL は単一ファイル型、
        GitHub リポジトリ内 Skill ディレクトリ URL はディレクトリ型

      ## 取得プロファイル

      - 単一ファイル型: .opencode/skills/<name>/SKILL.md へ正規化
      - ディレクトリ型: Skill ディレクトリ配下を再帰取得し相対構造を保持。
        Skill ディレクトリ外のファイルは取得しない

      ## 非破壊性と上書き保護

      - 取得失敗時に開始前状態を維持する
      - 機構管理外（repo-*、agentdev-、宣言に由来しない同名配置）の無断上書き禁止

      ## 個別特例統合

      - agentdev-doc-writing が参照点である該当 Skill の skills.yaml 宣言と機構経由再取得
      - gitignore 特例・doc-writing 以外の特例参照の除去（scripts、README、guide、docs 設計系）
      - source URL は宣言データとして運用者が登録する

      ## release archive 検証

      - skills.yaml の archive 収録要否を package-release-archive.ps1 の投影範囲で検証する
        （収録除外時は archive 提供 consumer 環境での取得手段を明記する）

      ## 参照点集約

      - 各 third-party Skill の参照点を宣言運用として管理する（機械検査対象外、IR-058 は
        宣言済み判定までを担当）

      ## Design で確定する実装判断

      - source URL 形式判定規則: GitHub blob/raw/tree URL 等の変種の扱いを確定する
      - 取得トランスポート: git 依存の有無、REQ-009-048 の ZIP 展開環境を含む
        git-less 環境での動作を確定する
      - 管理対象 Skill の判別方法: skills.yaml 宣言集合と予約接頭辞からの決定論的判定、
        provenance 履歴の要否を確定する
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-doc-writing
    target_area: 参照する references
    source_items: [AG-008]
    content: |
      agentdev-doc-writing が third-party Skill（文章規範）への正規参照点であることを明記し、
      依存 Skill は skills.yaml 宣言+取得機構経由で利用者環境に配置されることを追記する。
      特例配置の記述が残っている場合は除去する。

conflict_resolutions:
  - id: CR-001
    conflict: 壁打ち要件候補「配布物は third-party Skill を参照しない」は RU-0001 合意「本体を含めない」より強く、REQ-002-019 UPDATE（取得機構経由の依存を前提）と字面が矛盾する
    resolution: 「宣言済み+参照点集約」を参照規律とする（ユーザー確定 Q5(a)）。配布成果物は宣言済み third-party Skill を参照でき、参照点は配布成果物間で集約する
  - id: CR-002
    conflict: REQ-029-006（runtime 依存は fresh consumer 環境で解決可能）の字義と、third-party 本体が fresh clone に存在しないことの矛盾
    resolution: REQ-029-009 を APPEND し、宣言済み third-party 依存は取得機構の実行による取得後解決をもって依存境界を満たすと定める（ユーザー確定 Q6(a)）
  - id: CR-003
    conflict: skills.yaml の src/third-party/ 配置と DEC-002 決定1（配布物原本は src/opencode/）の緊張
    resolution: skills.yaml を配布成果物種別ではない宣言ファイルと位置づけ（case-schema/ 先行例）、Decision に 1 文明記する（ユーザー確定 Q7(a)）。release archive 収録要否は実装検証項目とする
  - id: CR-004
    conflict: IR-058（projection-only skill の配布物参照は strict fail）と該当 Skill 移動による dangling 参照（10 ファイル、検証時点）
    resolution: IR-058 を 3 分岐化（宣言済み third-party を許容）し、該当 Skill は skills.yaml 宣言+機構経由で再取得する。機構実装+再取得完了までの期限付き許容を execution contract へ明記する
  - id: CR-005
    conflict: REQ-002-019（配布成果物が参照する skill は src/opencode/skills/ 配置・配布物化）と third-party 本体非同梱の矛盾
    resolution: REQ-002-019 を ADF 製 skill に限定する UPDATE で解消し、third-party は第三区分（REQ-002-042 から REQ-002-044）へ分離する
  - id: CR-006
    conflict: doc-writing 以外からの該当 Skill 参照（README、scripts、guide、docs 設計系、harness-delegation）は想定外の参照であり、特例の正規経路化を助長する
    resolution: 参照点を agentdev-doc-writing に集約し、doc-writing 以外は agentdev-doc-writing を経由する（ユーザー確定）。doc-writing 系参照は宣言済み参照として正規化し、それ以外は特例是正として除去する。監査レポートは履歴として不修正

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-002
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-009
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-029
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0001
    target_req: REQ-052
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0001
    target_design:
      operation: update
      domain: integrity
      slug: IR-058-distribution-untracked-skill-reference
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      試験用の単一 SKILL.md source URL を skills.yaml へ宣言し、/agentdev/third-party-sync を
      実行する。取得結果が .opencode/skills/<name>/SKILL.md へ正規化配置されることを確認する
    pass_criteria: |
      取得が成功し、SKILL.md の内容が source と一致し、配置パスが正規化形と一致する。
      skills.yaml への定義追加のみで取得対象へ追加でき、機構コードに差分がないこと。
      宣言スキーマが revision および type を必須項目として保持しないこと
    on_failure: |
      fix-and-reverify。source 形式判定または正規化配置の実装不具合を修正し、再検証する
  - id: TS-002
    target_item: AG-002
    verification: |
      SKILL.md + references/ + scripts/ を含む多階層の試験用 GitHub Skill ディレクトリを宣言し、
      取得を実行する。再帰取得、相対構造保持、Skill ディレクトリ外非取得を確認する
    pass_criteria: |
      配下ファイルの相対構造が維持され、Skill ディレクトリ外のファイルが配置されない
    on_failure: |
      fix-and-reverify。再帰取得範囲または構造保持の実装不具合を修正し、再検証する
  - id: TS-003
    target_item: AG-003
    verification: |
      install.ps1 と self-sync.ps1 を実行し、third-party Skill 取得処理と network access が
      発生しないことを確認する（観察は取得機構呼出コードの不在確認と実行ログによる）。
      スクリプトから取得機構を呼び出していないことも、scripts/ 直下に third-party 用の
      新規公開入口が追加されていないことも確認する
    pass_criteria: |
      両入口の挙動が現行どおり不変であり、取得機構の呼出と scripts/ 直下の新規公開入口が
      存在しない
    on_failure: |
      fix-and-reverify。導入系スクリプトへの機構結合を除去し、再検証する
  - id: TS-004
    target_item: AG-006
    verification: |
      途中失敗する試験用 source で取得を実行し、取得前から存在した正常な
      .opencode/skills/<name>/ が破壊・部分更新されないことを確認する。
      さらに機構管理外の同名 Skill を事前配置し、無断上書きされずに停止することを確認する
    pass_criteria: |
      既存 Skill の内容・配置が開始前と一致し、管理外上書きが拒否される
    on_failure: |
      fix-and-reverify。非破壊制御または管理外判定の実装不具合を修正し、再検証する
  - id: TS-005
    target_item: AG-001
    verification: |
      ADF 本体リポジトリで取得を実行し、git status / check-ignore により
      .opencode/skills/<name>/ の third-party 本体が追跡対象にならないことを確認する。
      release 投影（package-release-archive.ps1）に third-party 本体が含まれないことを確認する
    pass_criteria: |
      Git 未追跡（AG-011 の Git 管理境界の検査を含む）であり、release archive へ
      third-party 本体が収録されない
    on_failure: |
      fix-and-reverify。Git 管理境界または release 投影範囲の設定を修正し、再検証する
  - id: TS-006
    target_item: AG-004
    verification: |
      Custom Tool 操作契約の検証。正常取得後に読み戻し検証が実行されることを
      dry-run モードの計画表示と照合して確認し、不正 source URL による失敗時に
      成功を返さないことを確認する
    pass_criteria: |
      失敗時に成功扱いとせず、開始前状態を維持したうえで失敗要因を報告する
    on_failure: |
      fix-and-reverify。検証・失敗報告の実装不具合を修正し、再検証する
  - id: TS-007
    target_item: AG-005
    verification: |
      宣言済み third-party Skill への依存を持つ配布成果物について、skills.yaml 宣言と
      取得機構の実行で依存が解決されることを確認する
    pass_criteria: |
      取得後の環境で当該配布成果物の参照が解決可能である
    on_failure: |
      fix-and-reverify。宣言と依存の結び付けまたは取得機構の解決動作を修正し、再検証する
  - id: TS-008
    target_item: AG-008
    verification: |
      該当 Skill を skills.yaml へ宣言し機構経由で再取得できることを確認する。
      agentdev-doc-writing からの参照が機能すること、doc-writing 以外の直接参照が
      除去されていることを横断確認する
    pass_criteria: |
      再取得に成功し、参照点集約が成立し、doc-writing 以外の直接参照と特例分岐が残存しない
    on_failure: |
      fix-and-reverify。宣言・再取得手順または参照是正漏れを修正し、再検証する
  - id: TS-009
    target_item: AG-007
    verification: |
      更新後の IR-058 検査を実行する。repo-* 除外、宣言済み許容、未宣言 strict fail、
      未宣言参照の逆検査が意図どおり動作することを確認する
    pass_criteria: |
      3 分岐+逆検査の判定が本 Design の規定と一致する
    on_failure: |
      fix-and-reverify。検査判定の実装不具合を修正し、再検証する
  - id: TS-010
    target_item: AG-011
    verification: |
      skills.yaml 宣言時の name 制約検証。違反 name（agentdev- 接頭辞、repo- 接頭辞、
      kebab-case 非準拠）の宣言で取得が停止することを確認する
    pass_criteria: |
      違反 name の宣言が拒否され、取得が実行されない
    on_failure: |
      fix-and-reverify。name 制約検証の実装不具合を修正し、再検証する
  - id: TS-011
    target_item: AG-010
    verification: |
      package-release-archive.ps1 の投影実行により、skills.yaml の archive 収録要否が
      確定していることを確認する。収録除外の場合、archive 提供 consumer 環境での
      取得手段が明記されていることを確認する
    pass_criteria: |
      archive 提供 consumer 環境で skills.yaml が利用可能であり、third-party-sync が
      機能する構成になっている
    on_failure: |
      fix-and-reverify。投影範囲または取得手段の構成を修正し、再検証する

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: AC-01
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      skills.yaml の存在と name+source 定義（revision/type 項目なし）は AG-002、
      ACT-REQ-002、ACT-DESIGN-005 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-01
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: AC-02
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      本体の追跡対象原本・release 成果物への非同梱は AG-001、AG-011、TS-005 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-02
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: AC-03
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      /agentdev/third-party-sync 入口と Custom Tool 委譲は AG-002、ACT-DESIGN-004 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-03
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: AC-04
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      scripts/ 直下の公開入口追加禁止は AG-003 が維持する（REQ-050、REQ-052-008）
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-04
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: AC-05
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      install.ps1 の非関与と network access 禁止維持は AG-003、TS-003 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-05
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0001
    source_item: AC-06
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      self-sync.ps1 の非関与と network access 禁止維持は AG-003、TS-003 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-06
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0001
    source_item: AC-07
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      単一 SKILL.md URL 型の正規化配置は AG-002、TS-001 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-07
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0001
    source_item: AC-08
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      GitHub Skill ディレクトリ型の再帰取得は AG-002、TS-002 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-08
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0001
    source_item: AC-09
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      相対構造保持は AG-002、TS-002 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-09
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0001
    source_item: AC-10
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      Skill ディレクトリ外の非取得は AG-002、TS-002 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-10
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0001
    source_item: AC-11
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      定義追加による拡張（取得コード無変更）は AG-006、TS-001 と TS-010 の name 制約検証で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-11
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0001
    source_item: AC-12
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      取得失敗時の非破壊性は AG-006、TS-004 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-12
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0001
    source_item: AC-13
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      管理外 Skill の保護（無断上書き禁止）は AG-006、TS-004 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-13
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0001
    source_item: AC-14
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      Git 管理境界は AG-011、TS-005 で所有する
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-14
      checked_at_commit: null
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0001
    source_item: AC-15
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      個別特例の共通機構統合は AG-008、TS-008 で所有する。IR-058 3 分岐化、
      per-skill exemption 不作、参照点集約を含む
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-15
      checked_at_commit: null
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0001
    source_item: AC-16
    disposition: covered
    reason_code: covered_by_actions
    reason: |
      正規要件の汎化（個別 Skill 名・URL・リポジトリを前提としない）は AG-001、AG-008 で
      所有する。source URL は宣言データとして運用者が登録するため要件には現れない
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: AC-16
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: >-
    OU-001 を Epic とし、機構実装（skills.yaml、Custom Tool、command/Workflow Skill、tests）を
    子 Issue 群へ構成する。OU-002〜004 の REQ 行は Wave 1 req-save で保存済みであり、
    Case Issue では REQ 行の再保存を行わず機構実装との整合確認のみを行う（Epic 配下の
    1 子 Issue へ統合を推奨）。Design 6 件（OU-005 対象の custom-tool-contracts を含む）は
    design-save で保存済みのため case 実装の参照情報であり、OU-005 は IR-058 適用実装と
    解消確認（Wave 2〜3 の実装作業）を意味する。Decision は req-save で作成済み。
  wave_hints:
    - Wave 1（req-define 直後の文書処理、Issue 外）: req-save（REQ 4 件+Decision 保存）、design-save（Design 6 件保存）
    - Wave 2（機構実装）: skills.yaml、Custom Tool、command/Workflow Skill、tests、IR-058 適用（OU-001）
    - Wave 3（特例統合）: 該当 Skill の宣言+機構経由再取得、doc-writing 以外の参照是正、特例記述除去（scripts、README、guide、docs 設計系）、IR-058 解消確認（OU-001 Wave 3、AG-008、TS-008）
```

# summary

third-party Skill を ADF 製 skill・repo-local skill に続く第三区分として REQ-002 に定義し、本体の非同梱（Decision 1 本で恒久化）、宣言（src/third-party/skills.yaml）+取得機構（/agentdev/third-party-sync、専用 Custom Tool 経由）による取得、参照の宣言済み+参照点集約規律を導入する。REQ-009/029/052 に交叉参照と境界明確化を追記する。Design は custom-tool-contracts（操作契約追加）、IR-058（3 分岐化）、runtime-package-boundary（昇格基準第三行）、agentdev-doc-writing（正規参照点明記）の 4 件 UPDATE と third-party-sync command Design・third-party-skill-management 機構 Design の 2 件 CREATE。既存の個別特例（gitignore 特例・特例配置・doc-writing 以外の参照）は機構実装+該当 Skill 再取得まで triage 案内限定のうえ統合解消する。REQ-011 は third-party 外部取得を所有せず（REQ-052-011 が正規所有）、新規 command の I/O 境界経由は REQ-011-016 が既存で担保するため変更不要と判断した。RU-0001 は session-RU 契約（frontmatter 必須フィールド、8 セクション構造）に違反するが、内容自足性により処理を継続し、違反詳細は req-define の報告事項とする。実証Case判定は通常Case（main 直行）で確定済み。
