---
draft_type: req_draft
topic_slug: agentdev-structure-reorg-migration-foundation
status: draft
created_at: "2026-11-23T05:29:53.004Z"
source_rus: [RU-0305]
---

<!-- 後続工程への引き継ぎは draft-data を正とする。 -->

# draft-data

```yaml
work_type: feature
scale: large
summary: |
  RU-0305 の単一実行計画を要件化する。移行基盤の確立、blocked 領域の廃止、工程駆動の保存先の再編、バックログへの集約と移行実証を、Step 0 → 1 → 2 → 3 の順序で行う。各 Step の検証合格を次の Step の開始条件とし、Step ごとに独立したコミットを残す。完了後のリリース作成は別指示を待つ。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |
      Step 0。構成変更・破壊的変更に伴う適用先の移行原則を、恒常原則を扱う新規 Decision と新規 REQ にそれぞれの責務に沿って記録する。導入スクリプトや通常のコマンドへ移行処理や互換シムを作り込まず、版別差分仕様（Migration Delta）と最新の正規構造（To-Be）に基づき、専用コマンドから AI エージェントが推論移行する。導入スクリプトは旧構造・版差異の検知、案内、決定論的事後検証を担い、検証不能・不整合を成功扱いしない。保護対象の AGENTS.md に開発ガードレールを反映する際は対話承認を得る。DEC-016 と DEC-056 の決定は維持する。
  - id: AG-002
    content: |
      Step 0。src/common/commands/agentdev/migrate.md と対応スキル、版別差分仕様を用意する。通常の .agentdev/ ワークフローや状態の初期化に依存せず、既知の適用元版または実態観測を起点に、最新版までの必要な差分仕様を最新の正規構造と照合する。任意の旧版断面を入口として扱い、移行後の状態が決定論的に確認できる場合だけ完了とする。格納構成・形式とコマンド・スキル・文書の詳細は委譲判断 (a)(c) の範囲とする。
  - id: AG-003
    content: |
      Step 0。scripts/install.ps1 は適用済みの版を記録・比較する。導入時と -Check 時に旧構造、版差異または未完了を検知した場合は /agentdev/migrate を案内し、導入済み・合格と誤認させない。移行後は決定論的な -Check で合格を判定できる。版記録と比較の実装方式は委譲判断 (b) の範囲とする。
  - id: AG-004
    content: |
      Step 1。.agentdev/blocked/ を廃止し、.agentdev/README.md で永続ドメイン状態と非永続領域の境界を明確にする。この段階では REQ-123 の適用範囲の対象外欄から当該パスの列挙だけを取り除き、要件行と残りの対象外記述を維持する。非永続・git 管理対象外の tmp/、cache/、close-acceptance/、integrity/reports/ は正規ドメイン状態と区別する。
  - id: AG-005
    content: |
      Step 2。公開名 phase-* を維持し、工程駆動の保存先を .agentdev/project/ にする。README.md、themes.md、received/ および identity.yaml の target_version・current_phase と値を保つ。identity.yaml の undertaking を project、pending.md を issue-log.md、transitions/ を phase-gates/、revisions/ を change-log/、adoptions/ を decision-log/ に対応させる。空の識別値は捏造せず保つ。未生成の三領域は定義・参照を整合させ、空ディレクトリの一律作成は求めない。REQ-111 は該当する配置記述があれば整える。関連 Design・ガイド、正本のコマンド・スキル・スクリプト・テンプレート、契約テストと characterization-lib.ts、traceability の対応宣言を現行化し、この段階で版別差分仕様に保存先の移行規則を加える。
  - id: AG-006
    content: |
      Step 3。intake、learning、inspect を .agentdev/backlog/ の同名配下に置き、バックログ一気通貫実行の保存先を .agentdev/backlog/runs/ とする。既存の backlog/req-units/ と直下の drafts/、extensions/ の境界は維持する。既存実データは相対配置・内容・処理状態を保って移す（基準点で intake 3、learning 15、inspect 1 ファイル）。完了済みの .agentdev/backlog-auto/end-to-end/20261121-171426/ は証跡を含めて削除する。REQ-008 は該当する配置記述があれば整え、関連 Design・ガイド、正本と投影、scripts/install.ps1、.agentdev/README.md を現行化する。版別差分仕様へバックログ集約と blocked 廃止を加え、旧構造を模した隔離環境で移行から -Check 合格までを実証する。実証環境の構成・設置は委譲判断 (d) とし、標準一時領域の作業専用区画と後片付けの既存契約に従う。
      REQ-123 の対象外欄にある learning の inbox/・deferred/ の参照は、この段階で新しい保存先に合わせる。対象外の意味と要件行は維持する。
  - id: AG-007
    content: |
      変更開始前に作業ツリーがクリーンであることと基準コミット 331eacea6 で既存試験が合格することを確認する。開始時 HEAD が先に進んでいれば対象ファイルとの重なりと計画前提を確認し、機械的な置換のみで前提が変わらない場合は根拠を記録して進め、実質変更が混ざる場合は着手せず監督へ報告する。Step 0 → 1 → 2 → 3 の順序を固定し、各 Step の試験、型検査と整合性検査が合格してから次を開始する。各 Step の反映を独立した Conventional Commits 形式のコミットにする。src/common/ の変更時は .opencode/ も同期し、テスト以外は削除・改名も両側へ反映する。検証はリポジトリルートを作業ディレクトリとする src 側の正規経路で行い、Bun の対象パスには ./ を付ける。
  - id: AG-008
    content: |
      禁止事項を守る。(1) 旧パスへのフォールバック、互換シム、不在証明専用テスト、過去の経緯説明を残さない。(2) src/ に REQ-ID や docs/ 参照を混入させない。(3) 試験や整合性チェックの失敗をスキップ、無効化、ルール緩和で隠さない。(4) learning の inbox・deferred や blocked 等へ未処理のまま残るファイルを追加・残置しない。所定のキューへ移す既存データは処理状態を保つ。(5) phase-* の公開名を変更しない。(6) 現存しない .agentdev/issues/ を新設しない。完了報告に各 Step の検証結果、委譲判断 (a)〜(d) の内容と根拠、git log --oneline 331eacea6..HEAD の結果を含める。リリース作成は対象外とし、利用者の別指示を待つ。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:agentdev-structure-reorg-migration-foundation
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ---
      id: REQ-126
      title: ".agentdev/ の正規構造と版をまたぐ移行基盤"
      created: "2026-11-23"
      updated: "2026-11-23"
      ---

      <!-- ADF-COVERS(design): REQ-126-001, REQ-126-002, REQ-126-003, REQ-126-004, REQ-126-005, REQ-126-006, REQ-126-007, REQ-126-008 -->

      ## 目的

      適用先が有効な開発情報と処理状態を保ち、最新の正規構造へ移行できるようにする。通常運用は現行構造に統一し、移行時は版別差分仕様と最新の正規構造に基づく推論移行と決定論的検証を使う。本 REQ は正規構造、専用コマンドと導入スクリプトの接続、今回の再編の受け入れ義務を所有する。移行手段を選んだ恒常原則と根拠は対応する Decision に記録する。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | REQ-126-001 | 適用先の構成移行は、版別差分仕様と最新の正規構造を参照する推論移行、および決定論的事後検証に分離すること。恒常原則を Decision に記録し、開発時の禁止事項を AGENTS.md から確認できること。 | 恒常原則が正規文書で確認でき、移行スクリプト・互換シムを作らないガードレールが対話承認を経て反映されている | TS-001 |
      | REQ-126-002 | `/agentdev/migrate` は通常ワークフローの初期化に依存せず、適用元版または観測した旧構造から必要な差分仕様を適用し、最新の正規構造と情報の継続を決定論的に確認できた場合だけ完了を示すこと。 | 配布された入口から差分仕様と最新の構造を解決でき、旧構造からの実行時に検証不成立を成功扱いしない | TS-002, TS-007 |
      | REQ-126-003 | `install.ps1` は適用済みの版を記録・比較し、導入時と `-Check` 時に旧構造や未移行を検知して `/agentdev/migrate` を案内すること。`-Check` は結果を決定論的に判定し、不整合や確認不能を合格扱いしないこと。 | 未移行を検知して案内でき、正常に移行した状態は `-Check` が合格と判定する | TS-003, TS-007 |
      | REQ-126-004 | 永続状態と非永続領域の境界を `.agentdev/README.md` から確認できること。停止中の Case のための廃止対象領域を、現行の保存先として使用しないこと。 | 廃止対象領域と現行参照がなく、境界の記載が実際の配置と一致する | TS-004 |
      | REQ-126-005 | 工程駆動の正規保存先は `.agentdev/project/` とし、識別・テーマ・受領・課題・工程ゲート・変更・判断の情報を PMBOK に沿った役割で扱うこと。`phase-*` の公開名と既存の操作契約を維持すること。 | 保存・読み戻し・移行先の仕様が正規配置と整合し、公開名と有効な状態を維持する | TS-005 |
      | REQ-126-006 | バックログの取込・学習・検査、要件単位と一気通貫実行の各状態は `.agentdev/backlog/` を正規保存先とし、要件ドラフトは `.agentdev/drafts/` に維持すること。移行で引き継ぐデータの内容・処理状態を維持すること。 | 正規配置で読み戻せる状態であり、旧構造から最新の導入検証まで一気通貫で合格する | TS-006, TS-007 |
      | REQ-126-007 | 移行基盤の確立、停止状態領域の整理、工程駆動領域の再編、バックログ集約の順に反映すること。前段階の検証合格を次段階の開始条件とし、各段階に独立したコミットと検証結果があること。 | 基準点の確認、四段階それぞれのコミットと検証、次段階への開始判断を証跡で照合できる | TS-008 |
      | REQ-126-008 | 再編の完了報告から、段階別の検証結果、委譲した技術判断とその根拠、基準点からのコミット履歴を確認できること。 | 適用範囲の禁止事項が守られ、すべての報告項目を読み戻せる | TS-009 |

      ## 適用範囲

      - 対象: 版別差分仕様と専用の移行入口、導入スクリプトの検知・案内・事後検証、`.agentdev/` の永続配置と文書・コード・検証・対応宣言の整合、既存データの意味保存、段階別の検証と移行実証。
      - 対象外: 旧構造へのフォールバック、互換シム、不在証明専用テスト、廃止経緯の恒久記載、配布物への開発用参照混入、検査のスキップ・無効化、未処理ファイルの追加・残置、`phase-*` の公開名変更、`.agentdev/issues/` の新設、履歴観測記録の書き換え、リリースの作成・公開。

      ## 検証

      表の検証 ID は親 Case の要件ドラフトに定義する検証義務を指す。検証結果とその根拠は親 Case の記録から読み戻せるようにする。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:agentdev-migration-delta-principle
    source_items: [AG-001]
    content: |
      ---
      id: DEC-068
      title: "適用先の構成移行の責務分離"
      status: proposed
      created: "2026-11-23"
      updated: "2026-11-23"
      related_reqs: [REQ-126]
      relations:
        - type: relates-to
          target: DEC-016
          reason: 導入系スクリプトのプロビジョニングとネットワークアクセスを行わない決定を維持し、構成移行との責務を分ける。
        - type: relates-to
          target: DEC-056
          reason: 意味保存と検証の原則と整合する、将来の構成変更に対する移行手段の選択を定める。
      ---

      # DEC-068: 適用先の構成移行の責務分離

      ## 背景

      適用先の開発情報を保ったまま構成変更を適用できるよう、移行、導入、検証の責務を分ける。通常運用に旧構造の処理を持ち続けると、将来の構成変更と検査を複雑にする。

      ## 決定

      1. 構成変更の移行経路には版別差分仕様（Migration Delta）と最新の正規構造（To-Be）を使う。`/agentdev/migrate` がこれらを参照し、適用元の版または観測した構造に応じて AI エージェントが推論移行する。
      2. `install.ps1` は適用済み版の記録・比較、旧構造と版差異の検知、専用コマンドへの案内、決定論的な事後検証を担う。検証不能・不整合を成功とみなさない。導入スクリプトと通常コマンドには移行処理や互換シムを持たせない。

      ## 結果、影響

      適用先の構成に影響する変更では移行に必要な版別差分仕様を用意する。正規構造の所有と、旧構造からの差分を記述する責務は分ける。
conflict_resolutions:
  - id: CR-001
    conflict: RU の検索範囲だけでは現行 Design・ガイドや traceability の参照を漏らす一方、移行仕様と履歴記録まで数えると達成不能になる。
    resolution: TS-004〜006 に絶対・相対表記の検索と限定した計上除外を定義する。現行参照は所在を問わず更新する。REQ-123 の blocked の列挙は Step 1、learning の参照は Step 3 で扱う。正規の移行規則と過去の観測記録を維持し、検索エラーをゼロ件と扱わない。
  - id: CR-002
    conflict: RU は REQ-111 と REQ-008 を対象に挙げるが、照合時点では整えるべき旧パスの直接参照はなかった。
    resolution: 実在する該当記述だけを対応する段階で更新する。該当なしの場合は確認結果を記録し、既存要件の意味は変更しない。
  - id: CR-003
    conflict: RU で挙げた既存 Decision への取り込みは、採用済みの決定内容を追加することになる。
    resolution: 新規 REQ に AC-1 の移行原則を明記し、その恒常的な技術判断を独立した Decision に記録する。既存の二件とは relates-to で関連づけ、本文や決定の効力を変更しない。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0305
    target_req: new:agentdev-structure-reorg-migration-foundation
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: 新規 REQ と Decision の内容・関係宣言、および AGENTS.md の対話承認記録と変更内容を照合する。
    pass_criteria: 恒常原則と両 Decision への relates-to が確認できる。導入スクリプトと移行の責務、互換シム禁止、決定論的検証の完了条件が明記され、AGENTS.md が対話承認に基づいて現行化されている。
    on_failure: fix-and-reverify。文書を修正して再確認する。承認を取得できない場合は保護ファイルを変更せず、合格とせずに停止報告する。
  - id: TS-002
    target_item: AG-002
    verification: 移行コマンド、対応スキル、配布された版別差分仕様と正規構造の接続を確認し、配布境界検査と新規コマンド・スキルの整合性チェックを実行する。通常ワークフローが利用できない場合の独立性を確認する。
    pass_criteria: 配布環境の入口から必要な仕様を解決でき、通常の .agentdev/ ワークフローに依存せず、検証不成立時は完了を示さない。配布境界と整合性の検査が合格する。
    on_failure: fix-and-reverify。仕様への接続またはパッケージ構成を修正し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: インストーラーテストで版の記録と比較、旧構造・版差異・未移行時の通常導入と -Check、構造・版が一致した時の -Check を確認する。
    pass_criteria: 未移行・検証不能を成功扱いせず移行を案内し、正規状態のみが合格となる。インストーラーテストが合格する。
    on_failure: fix-and-reverify。版の扱い、検知、案内または検証を修正し、再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      src、scripts、.agentdev、docs、traceability に rg '\.agentdev[/\\]blocked' を実行する。TS-004〜006 の相対表記の共通検索式は `(?:^|[^[:alnum:]_./\\-])(?:\.[/\\])?<旧先頭名>[/\\]` とする。この段階の旧先頭名は `blocked`。状態表の Path 列、構成図、リンク先、コード・設定のパス表記から該当候補を抽出し、.agentdev 直下を指すものを計上する。.agentdev を起点として部品から組み立てるパスも照合する。
      三段階とも除外は新規 REQ 自身の再編定義・検証記述、版別差分仕様で旧構造を定義する記述、履歴記録（docs/reports/ と docs/knowledge/v5-baseline-confirmation-info-preservation.md）のみ。検索失敗や解決できない候補はゼロ件としない。候補判定の根拠を記録する。
      README と実体の境界を照合し、REQ-123 の適用範囲の対象外欄から `・.agentdev/blocked/` だけが除かれたことを差分で確認する。repo-agentdev-integrity の試験を実行する。
    pass_criteria: 計上対象が 0 件で廃止対象の実体がなく、README と正規配置が一致する。REQ-123 の差分が指定した一箇所の削除に限られ、試験は合格する。
    on_failure: fix-and-reverify。現行参照と境界記述を修正し、再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      TS-004 と同じ範囲で rg '\.agentdev[/\\]phase' と共通検索式（旧先頭名は `phase`）を使う。計上除外は TS-004 と同じ三種に限定する。新旧対応、状態の意味、公開名、版別差分仕様の移行規則、三つの対応宣言を確認する。正本と .opencode/ を同期し、generate_indexes、契約テスト、repo-agentdev-integrity 全量テストを実行する。
    pass_criteria: 計上対象が 0 件で、新しい名前が生成・消費・復元時に一貫する。正規の状態と公開コマンド名が維持され、索引が現行で、すべての検査が合格する。
    on_failure: fix-and-reverify。パスまたは投影・検査の不整合を修正し、再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      TS-004 と同じ範囲で rg '\.agentdev[/\\](intake|learning|inspect|backlog-auto)' と共通検索式（旧先頭名は `(?:intake|learning|inspect|backlog-auto)`）を使う。計上除外は TS-004 と同じ三種に限定する。移動元と移動先のファイルと処理状態、指定完了済み一式の削除、直下に残す領域と版別差分仕様の規則を照合する。REQ-123 の対象外欄で learning の inbox/・deferred/ の二参照だけが新しい保存先に変わったことを差分で確認する。
      .opencode/ 同期、generate_indexes、src/common/ 全ユニットテスト、インストーラーテスト、repo-agentdev-integrity 全量チェックを行う。
    pass_criteria: 計上対象が 0 件で、対象データが欠落・重複・状態変化なく新配置にあり、指定の完了済み一式が残っていない。直下のドラフト配置と REQ-123 の対象外の意味が維持され、全検証が合格する。
    on_failure: fix-and-reverify。データ・参照・配布状態を是正し、再検証する。
  - id: TS-007
    target_item: AG-006
    verification: |
      実行環境の標準一時領域に旧構造の適用先を再現する。旧構造と部分移行状態で install.ps1 -Check が不合格かつ案内を出すことを確認する。通常ワークフローを初期化せず旧構造から /agentdev/migrate を実行し、適用元との照合で必要な情報の保存を確認する。移行後に install.ps1 -Check を再実行する。手順・対象版・判定を親 Case の Issue/PR に残し、検証専用資材を回収する（REQ-118）。
    pass_criteria: 移行前と移行途中の不整合は合格扱いされず、必要な情報を引き継いだ移行後だけ合格する。結果と回収の証拠を一時資材に依存せず読み戻せる。
    on_failure: fix-and-reverify。失敗の環境・段階・理由を記録し、必要な実装を修正して隔離環境で再実証する。
  - id: TS-008
    target_item: AG-007
    verification: 着手時の作業ツリー、基準点と差分調査、各段階のコミット、試験・型検査・整合性検査結果と次段階の着手順を実行記録から照合する。
    pass_criteria: Step 0 → 1 → 2 → 3 の独立した四つの実行コミットと各 Step の合格証拠があり、各着手が前 Step の合格後である。開始条件と差分判断の根拠を確認できる。
    on_failure: fix-and-reverify。次段階へ進まず、失敗箇所を是正して同じ段階を再検証する。過去の順序違反は後から合格とみなさず、監督へ報告する。
  - id: TS-009
    target_item: AG-008
    verification: 合意の禁止事項を変更差分、現行参照の検索、配布境界・試験結果と照合する。完了報告の検証結果、委譲判断四件の根拠、基準点からの履歴を照合する。
    pass_criteria: 禁止事項の違反がなく、報告に各段階の結果、判断 (a)〜(d) の内容と根拠、git log --oneline 331eacea6..HEAD の結果が揃っている。
    on_failure: fix-and-reverify。違反を除去または不足証拠を補い、合格を再判定する。
realization_actions:
  - id: RA-001
    concern: 専用の移行入口と版別差分仕様
    responsibility: Step 0 に配布可能な入口・スキル・版別差分仕様と最新構造の参照を確立し、Step 2 と Step 3 で対応する移行規則を追加する。
    ownership_hints: [src/common/commands/agentdev/migrate.md, src/common/skills/, .opencode/ の投影]
    intent: 版別差分仕様を移行時だけ使い、通常実行から旧構造処理を分離する。
    verification_refs: [TS-002, TS-005, TS-006, TS-007]
    source_items: [AG-002, AG-005, AG-006]
  - id: RA-002
    concern: 導入・検知・検証の接続
    responsibility: Step 0 に導線を確立し、Step 3 の正規配置まで検知・検証基準を現行に保つ。
    ownership_hints: [scripts/install.ps1, インストーラーテスト, docs/designs/local/install-script-usability.md]
    intent: 旧構造や検証不成立が導入成功に見えないようにする。
    verification_refs: [TS-003, TS-006, TS-007]
    source_items: [AG-003, AG-006]
  - id: RA-003
    concern: 保護対象の開発ガードレール
    responsibility: Step 0 に対話承認を得てから AGENTS.md の最上位制約へ移行スクリプトと互換シムの禁止を反映する。
    ownership_hints: [AGENTS.md]
    intent: 今後の構成変更に恒常原則を適用する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-004
    concern: 停止状態領域と掲載範囲
    responsibility: |
      Step 1 の合格前に .agentdev/blocked/ を廃止し、README の永続・非永続境界を整える。REQ-123 の「適用範囲」対象外欄から `・.agentdev/blocked/` の一箇所のみを除く。要件行の変更を伴わない参照整理であり、Step 0 の Definition 反映で先行適用しない。
    ownership_hints: [.agentdev/README.md, .agentdev/blocked/, docs/requirements/REQ-123.md]
    intent: 実体の廃止と正規文書の現行参照の削除を同じ段階で行う。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: 工程駆動の状態・契約・対応宣言
    responsibility: Step 2 に project の正規配置と AG-005 の対応を状態表、関連 Design・ガイド、正本と投影、契約テストと traceability へ反映する。REQ-111 は CR-002 の範囲で扱う。
    ownership_hints:
      - .agentdev/README.md と工程駆動の保存状態
      - src/common/commands/agentdev/phase-*.md と対応スキル・テンプレート
      - scripts/self/case-gate-shared-lib-b1-1/characterization-lib.ts
      - docs/designs/workflows/phase-driven-collaboration-model.md と phase-transition-and-coexistence-model.md
      - traceability/agentdev-phase-domain-state.yaml、agentdev-phase-theme-collaboration.yaml、distribution-concrete-id-provenance.yaml
    intent: 公開契約を保ったまま、正本・投影・検査の状態参照を一つに揃える。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-006
    concern: バックログの状態と現行参照
    responsibility: |
      Step 3 に AG-006 の新配置、実データ移動、指定完了済み一式の削除を反映し、参照する正本・投影・検証・関連 Design とガイドを更新する。REQ-008 は CR-002 の範囲で扱う。REQ-123 の対象外欄の `.agentdev/learning/inbox/・.agentdev/learning/deferred/` を `.agentdev/backlog/learning/inbox/・.agentdev/backlog/learning/deferred/` に置換する。文書の変更を含む段階では既存の文書整合性検査と索引再生成の規律に従う。
    ownership_hints: [.agentdev/README.md, src/common/ の関連パイプライン, .opencode/ の投影, docs/requirements/REQ-123.md, docs/designs/responsibilities/artifact-contracts.md, バックログ実行契約と関連ガイド]
    intent: キュー・要件・実行状態の配置を統一し、既存データを引き継ぐ。
    verification_refs: [TS-006, TS-007]
    source_items: [AG-006]
  - id: RA-007
    concern: 旧構造の再現と検証証拠
    responsibility: Step 3 の実証を隔離した作業専用領域で行い、検証後に回収し、判断根拠と結果を最終記録へ保存する。
    ownership_hints: [実行環境の標準一時領域, REQ-118, 親 Case の Issue/PR]
    intent: 実際の導入と移行の接続を検査し、外部の適用先に変更を加えない。
    verification_refs: [TS-007, TS-009]
    source_items: [AG-002, AG-003, AG-006, AG-008]
assembly_evidence:
  # Step 1 の対象外欄の整理と Step 3 の参照現行化を現行文書で個別に組み立てた証拠。実適用は各段階の原文を再照合して行う。
  - target_file: docs/requirements/REQ-123.md
    target_content_sha256: "9fccade461f1073140075317743c467a21b328488f220933d5758107c118cf36"
    check_scope: {heading: "## 適用範囲", start_line: 25, end_line: 29}
    execution_conditions:
      operation: replace
      edit_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      expected_old_count: 1
    checker: {name: assemble-draft-section, version: "0.2.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-23T05:29:53.004Z"
  - target_file: docs/requirements/REQ-123.md
    target_content_sha256: "9fccade461f1073140075317743c467a21b328488f220933d5758107c118cf36"
    check_scope: {heading: "## 適用範囲", start_line: 25, end_line: 29}
    execution_conditions:
      operation: replace
      edit_sha256: "61717c76dbdeea41cbeeb0f0140d0c936e25ac738da670f8c3d03252230f19ae"
      expected_old_count: 1
    checker: {name: assemble-draft-section, version: "0.2.0", settings: {heading_match: exact-after-normalization, old_text_count_check: true}}
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary: {pre: {count: 3, all_ok: true}, post: {count: 3, all_ok: true}}
    diff_compact: {changed_lines_count: 1, added: 1, removed: 1}
    executed_at: "2026-11-23T05:47:17.327Z"
case_open_hints:
  epic_needed: false
  decomposition: |
    RU を分けずに実行する案。Step 0（TS-001〜003）→ Step 1（TS-004）→ Step 2（TS-005）→ Step 3（TS-006〜007）。次の段階の作業とコミットを先行させない。TS-008 は着手前および各段階、TS-009 は最終判定で確認する。Issue 構成にかかわらず、合格を前提とする四段階と独立コミットを維持する。
    先行する Definition の登録は要件と恒常原則に限定する。Step 1 以降の実物・現行参照の反映は対応する段階まで行わない。実装着手時には 331eacea6 からの差分を確認し、Case 準備で発生した定義・入力の記録と、対象の構造やデータに影響する実質変更を分けて照合する。リリースを起動する経路へ自動接続しない。
  wave_hints: ["Step 0 → 1 → 2 → 3。各 Step の検証合格を次の Step の開始条件とする。"]
draft-meta:
  important-change-notice:
    presented_before_save: true
    scope: 移行手段と導入責務の分離、既存構造と関連文書の現行化、AGENTS.md の編集承認境界。
  semantic-review:
    disposition: 受け入れ条件と Case への投影を独立に確認。REQ-123 の現行参照を対応する段階に割り当て、相対表記の抽出を検証に明記した。
    unresolved: []
  allocation: REQ-126 と DEC-068 は照合時点の割当期待値。正規保存時に採番し、行 ID と related_reqs を実際の割当に一致させる。
  split-forecast:
    target: new
    metrics: {requirement_lines: 8, concern_classifications: 1, artifact_types: 5, spec_separation_violations: 0}
    signals: {requirement_lines: 0, concern_classifications: 0, artifact_types: 1, spec_separation: 0}
    total: 1
    recommended_action: no-action
    thresholds_ref: agentdev-req-structure-diagnostics の SPLIT 定量閾値
  boundary-risks:
    dependency: "版別仕様の累積とパス参照・投影の依存 → 更新漏れや順序不整合 → 旧参照走査・同期・段階証跡（TS-004〜006、TS-008）"
    client_server: "外部 API・サーバー側契約の変更なし。導入と移行の接続は実行境界で評価する。"
    execution: "通常ワークフローなしの実行、導入の案内と決定論的判定 → 旧構造で起動不能や誤った合格 → 入口の検査、異常系と実経路の再現（TS-002、TS-003、TS-007）"
    build_runtime: "新規配布資産と現行インデックス・検査 → 投影漏れや旧構造に依拠する検査 → 配布境界、索引・正本・投影の検証（TS-002、TS-005、TS-006）"
    environment_propagation: "適用先に残る旧版・旧構造 → 検知漏れやデータの意味喪失 → 隔離した適用先で導入前後と保存状態を比較（TS-007）"
```

# summary

RU-0305 の Step 0 → 1 → 2 → 3 を検証付きの逐次実行として引き継ぐ。移行手段の恒常原則は新規 Decision、正規構造と動作は新規 REQ が所有する。REQ-123 の対象外欄では対応する段階で廃止対象を除き、バックログへの参照を現行化する。リリース作成は対象外。
