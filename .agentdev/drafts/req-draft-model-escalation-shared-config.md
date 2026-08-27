---
draft_type: req_draft
topic_slug: model-escalation-shared-config
status: saved
design_saved: true
created_at: 2026-08-27T23:53:18+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: OpenCode セッションの同一性（sessionID・会話履歴）を保持したままターン境界でモデルを昇格・復帰する Plugin 実行機構と、その設定を格納する ADF 共通設定ファイル（.agentdev/agentdev.jsonc）を新設する。昇格判断はモデルの明示要求のみ、セッション制御は機構側の責務分離とし、v1.18.23 実動作検証までを含む。既存 REQ-002-012 の文言緩和と REQ-052-011 の能力追加、Decision 1本、Design 1件を伴う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: .agentdev/agentdev.jsonc を ADF 共通設定ファイルとして定義し、Git 管理対象とする。特定の Plugin、Tool、command、skill 専用の設定ファイルを新設せず、ADF 実行時の共通構成はこのファイルへ集約する。設定ファイルは ADF 導入 Consumer へテンプレートとして配布され、Provider 認証情報・API キーを保存・管理する構造を持たない。
  - id: AG-002
    content: 昇格先は modelEscalation キーで指定でき、モデル（provider/model 形式）と variant を指定できる。modelEscalation が不在の場合、昇格機能は一切発動しない。通常利用モデルは ADF 設定の設定項目として保持せず、通常モデルが固定されていなくても昇格機能は動作する。昇格要求時に実際に使用中のモデル・variant を復帰先として保持する。
  - id: AG-003
    content: 昇格はモデルの明示要求によってのみ開始され、明示要求なしに昇格モデルが使用されることはない。昇格要求後、進行中の推論は切替えられず、現在ターン終了後の次ターンから昇格先モデル・variant で開始する。切替の前後で sessionID は不変であり、新規サブエージェントや別セッションを生成せず、昇格モデルは同一セッションの会話履歴を利用して作業を継続する。
  - id: AG-004
    content: 昇格状態は昇格モデルが明示的に復帰を要求するまで維持される。復帰要求後は次ターンから、昇格直前に実際に使用していたモデル・variant へ戻る。
  - id: AG-005
    content: 昇格時・復帰時に、切替前後のモデル（と variant）を一行で通知する。通知はセッションの会話ストリーム上でユーザーが確認できる形をとる。
  - id: AG-006
    content: 切替失敗時（昇格先モデルの解決不能等）には失敗を報告し、切替を成功として表示・記録しない。実行機構が自律的に昇格・復帰を反復しないこと（失敗時の自動リトライ等による無限反復の防止）。モデルの明示要求による切替の繰返しは機構の反復に含めない。
  - id: AG-007
    content: 昇格機構は特定のメインエージェント・特定のサブエージェントに固定されず、ADF が動作する OpenCode セッション（メイン・サブエージェント双方）で利用できる。omo 等の特定ハーネス拡張には依存しない。
  - id: AG-008
    content: OpenCode v1.18.23 上で、昇格・昇格状態の継続・復帰の一連の状態遷移が実動作で確認できること。
  - id: AG-009
    content: 設定ファイルと Plugin 実装の配布はテンプレート+手動コピー方式とし、導入スクリプトには副作用を持たせない。Consumer 環境で同一の契約が成立する。REQ-009 配布基盤（install 対象は配布 command/skill に限定）は本件の配布経路に使用しない。
  - id: AG-010
    content: モデルは意味的判断（解決困難か、解決したか）のみを担い、セッション識別・保持・ターン境界切替・状態保持・復帰・通知・失敗報告・無限反復防止は ADF 実行機構（Plugin）が担う責務分離とする。
  - id: AG-011
    content: 既存 REQ との整合のため、REQ-002-012 の「実行結果と状態のみを格納」を「実行結果と状態、および実行時共通構成を格納」へ文言緩和し、REQ-052 に実行時状態の決定的切替能力（REQ-052-011）を追加する。Plugin 機構側に独立 Decision は作らず、種別契約は REQ-052 参照、実装詳細は Design 分離とする。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:model-escalation-shared-config
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |
      ---
      id: REQ-053
      title: "OpenCode 同一セッションモデル昇格と ADF 共通設定"
      created: "2026-08-27"
      updated: "2026-08-27"
      ---

      ## 目的

      OpenCode セッションの同一性（sessionID・会話履歴）を保持したまま、ターン境界でモデルを昇格・復帰する
      ADF 共通実行時機構と、その設定を格納する ADF 共通設定ファイル（.agentdev/agentdev.jsonc）を確立する。
      昇格の判断はモデル自身の明示要求のみに委ね、セッション識別・切替・状態保持・復帰・通知・失敗報告・
      無限反復防止は Plugin 実行機構が担う責務分離とする。設定と実装は ADF 導入 Consumer へ配布可能とする。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-053-001 | .agentdev/agentdev.jsonc を ADF 共通設定ファイルとして定義し、Git 管理対象とすること。特定の Plugin、Tool、command、skill 専用の設定ファイルを新設しないこと |
      | REQ-053-002 | 昇格先を modelEscalation キーで指定でき、モデルと variant を指定できること。modelEscalation 不在時、昇格機能を発動しないこと |
      | REQ-053-003 | 通常利用モデルを ADF 設定へ固定しなくても昇格機能が動作し、通常モデルの明示要求なしに昇格モデルが使用されないこと |
      | REQ-053-004 | 昇格要求後、進行中の推論を切替えず、現在ターン終了後の次ターンから昇格先モデル・variant で開始すること |
      | REQ-053-005 | 昇格切替の前後で sessionID を不変とし、新規サブエージェント・別セッションを生成せず、昇格モデルが同一セッションの会話履歴を利用して継続できること |
      | REQ-053-006 | 同一 Plugin 実行プロセス内で、昇格状態を昇格モデルの明示復帰要求まで維持すること |
      | REQ-053-007 | 復帰時、昇格直前に実際に使用していたモデルと variant へ戻ること |
      | REQ-053-008 | 昇格時・復帰時に、切替前後のモデルを一行で通知すること |
      | REQ-053-009 | 切替失敗時、失敗を報告し、成功として表示・記録しないこと |
      | REQ-053-010 | 実行機構が自律的に昇格・復帰を反復しないこと。失敗時の自動リトライ等による無限反復を防止し、モデルの明示要求による切替の繰返しは機構の反復に含めないこと |
      | REQ-053-011 | 特定のメインエージェントに固定されず、ADF が動作する OpenCode セッションで利用できること |
      | REQ-053-012 | メインエージェントとサブエージェントの双方で切替が成立すること |
      | REQ-053-013 | omo 等の特定ハーネス拡張を必要としないこと |
      | REQ-053-014 | Provider 認証情報・API キーを保存する必要がないこと |
      | REQ-053-015 | 設定と Plugin 実装の配布はテンプレート+手動コピー方式とし、導入スクリプトに副作用を持たせないこと。ADF 導入 Consumer で同一の契約が成立すること |
      | REQ-053-016 | OpenCode v1.18.23 上で、昇格・継続・復帰の一連の状態遷移が実動作で確認できること |
      | REQ-053-017 | モデルは意味的判断のみを担い、セッション識別・ターン境界切替・状態保持・復帰・通知・失敗報告・無限反復防止は ADF 実行機構が担うこと。詳細（設定キー schema、Plugin ファイル構成、切替メカニズム、通知出力先・文言、状態遷移、配布経路）は Design が所有すること |

      ## 適用範囲

      - **対象**: ADF 共通設定ファイル（.agentdev/agentdev.jsonc）の定義と Git 管理、modelEscalation 設定、同一セッション内のターン境界モデル切替・復帰、一行通知、切替失敗の報告、無限反復防止、メイン・サブエージェント双方での利用、テンプレート+手動コピー配布、OpenCode v1.18.23 実動作検証
      - **対象外**: 推論途中の切替、別セッション生成、新規サブエージェント生成による実現、失敗回数・信頼度等による機械的自動昇格判定、複数段階昇格、コスト・実行回数制御、Provider 認証・API キー管理、omo 等の特定ハーネス拡張との連携・依存、特定 Plugin 専用設定ファイル、不要な先行追加設定、実装手順・コード差分
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-052
    target_area: 要件テーブル末尾（REQ-052-010 行の直後）
    source_items: [AG-011]
    content: |
      | REQ-052-011 | Plugin / Hook は REQ-052-002 の実行前の拒否・強制に加え、実行時状態の決定的切替（セッションのモデル・variant 等をターン境界で切替える処理）を担えること |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-002
    target_area: 要件テーブルの REQ-002-012 行
    source_items: [AG-011]
    content: |
      REQ-002-012 行を次のとおり修正する。

      修正前:
      | REQ-002-012 | ドメイン状態ディレクトリは .agentdev/ とし、実行結果と状態のみを格納し、git 管理対象とすること |

      修正後:
      | REQ-002-012 | ドメイン状態ディレクトリは .agentdev/ とし、実行結果と状態、および実行時共通構成を格納し、git 管理対象とすること |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:agentdev-shared-config-file
    source_items: [AG-001, AG-009, AG-010, AG-011]
    content: |
      ## 背景

      ADF の実行時構成（昇格先モデル等）の置き場所が定義されていなかった。
      OpenCode の plugin 固有設定を各 plugin 専用ファイルへ分散すると、ファイル増殖と設定責務の分散を招く。
      既存の REQ-002-012 は .agentdev/ を「実行結果と状態のみ」格納と定義しており、構成ファイルの配置と文言上矛盾する。
      モデル昇格機構は配布性（ADF 汎用）と責務分離（モデルは意味的判断、機構は制御）を要求し、
      構成の正規位置と Plugin の能力境界を事前に確定する必要がある。

      ## 決定

      1. .agentdev/agentdev.jsonc を ADF 共通設定ファイルとする。特定の Plugin / Tool / command / skill 専用の設定ファイルを増やさない。Git 管理対象とする。
      2. 設定キーの第一階層は機能名（例: modelEscalation）とし、不在時は当該機能を発動しない。
      3. モデル昇格 Plugin は REQ-052 の Plugin/Hook 種別に属し、実行時状態の決定的切替（ターン境界でのモデル・variant 切替。LLM 呼出の実行前に完了する操作）を担う能力として REQ-052-011 を追加する。
      4. 昇格先モデル・variant は ADF 共通設定から指定する。通常モデルは設定項目に持たず、昇格要求時に実際に使用中のモデル・variant を復帰先として保持する。
      5. 配布はテンプレート+手動コピー方式とし、導入スクリプトに副作用を持たせない（DEC-016 整合）。Plugin テンプレートは正規配布物としてリポジトリ管理する（REQ-052-007 整合）。
      6. 機械強制（checker / gate）の新設は行わない。DEC-001 決定4 の hard control 7条件は本 Decision の時点では非該当と判断する。将来、切替状態の機械検証を checker 化する場合、7条件を再照合する。
      7. 無限反復防止の範囲は「実行機構が自律的に昇格・復帰を反復しないこと（失敗時の自動リトライ等）」とし、モデルの明示要求による切替の繰返しは機構の反復に含めない。

      ## 代替案

      - 各 plugin 専用設定ファイル（却下: ファイル増殖、設定責務分散）
      - REQ-009 配布基盤への組み込み（却下: REQ-009-010/012 が install 対象を配布 command/skill に限定しており現行枠外。本件はテンプレート+手動コピーで十分）
      - 導入スクリプトによる自動配置（却下: DEC-016 の導入スクリプト副作用ゼロ原則）
      - Plugin 機構側に独立 Decision を置く（却下: 構造決定は共通設定ファイルに集約され、Plugin 種別の能力は REQ-052-011 参照で足りる）

      ## 結果、影響

      - .agentdev/ の格納対象に「実行時共通構成」が加わる（REQ-002-012 の文言を更新）
      - Plugin/Hook 種別の能力範囲に「実行前状態の決定的切替」が明示される（REQ-052-011 追加）
      - 昇格機構の実装詳細（設定キー schema、切替メカニズム、状態保持、通知、配布）は Design（foundations/model-escalation-runtime）が所有する
      - hard control を新設しないため、切替の正しさは実動作検証と test_strategy に依存する
      - モデル選定そのものは DEC-001 決定2 の harness 委譲領域のまま残す。本 Decision が所有するのは昇格先の設定契約と切替機構のみであり、通常モデルの選定には関与しない

      ## 関連する決定

      - DEC-001（決定2、決定4）: 決定2（モデル選定等は harness 委譲）に対し、本件は通常モデルの選定に関与せず昇格先設定のみを所有する。決定4 の 7条件は checker 化せず非該当。将来 checker 化時の照合対象
      - DEC-006: DEC-005 を supersede する。extensions の現行正規所有は REQ-002-030 であり、本件の .agentdev/ 配置の現行先例は REQ-002-030
      - DEC-016: 導入スクリプト副作用ゼロ原則
      - DEC-022: 実行定義層の正規所有モデル（proposed）。ターン境界での状態切替は LLM 呼出の実行前に完了する操作であり、決定5（Plugin/Hook は実行前禁止・強制の軸）の「実行前」の操作として整合する
  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: foundations
      slug: model-escalation-runtime
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-009, AG-010]
    content: |
      # OpenCode 同一セッションモデル昇格ランタイム

      > frontmatter（id 採番、status、created/updated）は design-save の Design ファイル操作契約に従い保存時に確定する。本 Design 本文は次の内容を完全確定したものである。

      ## 目的

      REQ-053（OpenCode 同一セッションモデル昇格と ADF 共通設定）の実装詳細を所有する。
      ADF 共通設定ファイルの schema、昇格要求の受付、ターン境界切替メカニズム、状態保持、通知、
      失敗報告と無限反復防止、配布経路の実装構造を確定する。

      ## 関連要件

      - REQ-053: 本 Design の上位要件
      - REQ-052-011: Plugin/Hook の実行時状態決定的切替能力
      - REQ-002-012: .agentdev/ の格納対象（実行時共通構成を含む）

      ## 責務境界

      モデルは意味的判断（解決困難か、解決したか）のみを担い、要求 tool の呼出のみを行う。
      Plugin 実行機構は次のすべてを担う。

      - 昇格要求・復帰要求の受付（tool 経由）と状態機械による制御
      - ターン境界でのモデル・variant 切替と毎ターン再適用
      - 昇格状態と昇格直前モデル・variant の保持
      - 切替の一行通知
      - 切替失敗の報告と成功扱いの禁止
      - 無限反復の防止

      ## ADF 共通設定ファイル契約

      - 配置: .agentdev/agentdev.jsonc。JSONC 形式。Git 管理対象。
      - 性格: ADF 実行時共通構成の唯一の正規配置。特定の Plugin 専用のファイルは作らない。第一階層キーは機能名とし、他の機能が後からキーを追加できる。
      - OpenCode 標準 config（opencode.json 等）の読み込み対象ではない。Plugin 実装が直接ファイルを読む。
      - modelEscalation 記述例:

      ```jsonc
      {
        "modelEscalation": {
          "model": "zai-coding-plan/glm-5.3",
          "variant": "max"
        }
      }
      ```

      - modelEscalation 不在時、昇格 Plugin は機能を発動しない（要求 tool を提供せず、切替を行わない）。

      ## Plugin 構成と登録

      - 配置: .opencode/plugin/（singular を ADF 配布テンプレートの正とする。v1.18.23 は plugin/plugins 両方を自動発見するが、配布物は singular に統一する）。
      - 実装言語: TypeScript。単一ファイルまたは小さなモジュール群。omo 等の外部ハーネス拡張に依存しない。
      - 登録: ファイル配置のみで自動読み込み。opencode.json への追記登録を要求しない。
      - 設定の解決: .agentdev/agentdev.jsonc を Plugin 初期化時に読み込み、modelEscalation の存在と値を検証する。読み込み・検証失敗時は機能を発動しない。JSONC の解釈は外部依存を追加せず自前で行う。設定パスは plugin context が提供する project root を基準に解決する。

      ## 要求受付

      - Plugin は次の 2 つの tool を提供する（tool 定義 hook 経由）。
      - escalate_model: 通常モデルが解決困難と判断したときに呼出。引数なし。昇格先は設定から解決する。
      - revert_model: 昇格モデルが解決完了と判断したときに呼出。引数なし。復帰先は保持値から解決する。
      - tool 説明に「切替は次ターン境界で実行される」「現在ターンの推論は切替わらない」ことを明記し、モデルの誤用を防ぐ。
      - modelEscalation 不在時、両 tool は提供しない。

      ## ターン境界切替メカニズム

      OpenCode v1.18.23 の実装契約（packages/opencode/src/session/prompt.ts、llm/request.ts）に基づく。

      - chat.message フックは user message の永続化前に発火し、output.message は参照渡しである。
      - output.message.model = { providerID, modelID, variant } を書換すると、当該ターンの LLM 呼び出し（runLoop が DB から再読込した lastUser.model を使用）と variant（variants 辞書からの option マージ）へ反映される。
      - セッション行（SessionTable.model）は chat.message 発火前に setAgentModel で書込まれるため、フックからセッション行を書換することはできない。昇格状態の間、Plugin は毎ターン chat.message で書換を再適用する。
      - 復帰時は保持していた昇格直前のモデル・variant へ戻す。
      - 進行中の推論は切替対象外（フックはターン境界でのみ切替を行う）。

      ## 状態保持

      - 昇格状態は sessionID 単位で Plugin 内に保持する: { phase: normal / escalated, escalationModel, escalationVariant, preModel, preVariant, currentTurnModel, currentTurnVariant }
      - 昇格要求受理時に、要求時の実際のモデル・variant を preModel / preVariant として記録する。実際のモデルは各ターンの chat.message フック時に output.message.model から記録する（tool 実行は chat.message 後に起こるため、フック時の記録を保持して参照する）。
      - 親セッションの昇格は子セッション（task tool 由来のサブエージェント）へ自動伝播しない。サブエージェント自身が要求 tool を呼んだ場合、その子セッションの sessionID 単位で切替する（子セッションの LLM 呼出も同一パイプラインを通るため chat.message フックで成立する）。
      - 昇格状態の間、Plugin による model 書換はセッションのモデル選択より優先される（昇格モデルの明示復帰要求まで昇格状態が優先）。
      - 状態は Plugin 実行プロセス内の保持であり、OpenCode 再起動やセッション resume 時には normal へ戻る（安全側に復帰）。REQ-053-006 の維持は同一 Plugin 実行プロセス内を対象とする。

      ## 通知

      - v1.18.23 に Plugin 用の UI 通知 API は存在しないため、通知はセッション会話ストリーム上の一行表示とする。
      - 一次手段: 要求 tool（escalate_model / revert_model）の result として、切替種別と切替前後のモデル・variant を含む一行を返す。tool 実行結果は会話上に表示されるため、通知はモデルの従属性に依存せず決定的に現れる。
      - 補助: 切替が確定したターンの LLM 呼出 system コンテキストへ、切替事実の一行を注入する（experimental.chat.system.transform）。切替後モデルが切替を認知するための同期であり、ユーザー通知の一次手段ではない。
      - assistant メッセージへの直接注入は行わない（会話履歴を汚さない）。

      ## 失敗報告と無限反復防止

      - 切替前に昇格先モデルの存在検証を行う（provider と model の解決確認）。解決不能な場合、要求 tool の result として失敗を報告し、状態を変更しない。成功表示・成功記録を行わない。
      - 無限反復防止の状態機械:
        - normal 状態では昇格要求のみ受理。escalated 状態での昇格要求には「既に昇格中」を返す。
        - escalated 状態では復帰要求のみ受理。normal 状態での復帰要求には「昇格していない」を返す。
        - 同一ターン内の要求はキューイングし、ターン終了時に最終要求のみ適用する。実適用モデルが前ターンと同一になる場合（例: 同一ターン内の escalate 直後の revert）は、状態遷移を発生させず通知も発行しない。
        - 機構が自律的に（自動リトライ等で）切替を反復することはない。切替は要求 tool へのモデルの明示呼出のみで発生する。
      - ターン境界切替の実行:
        - 昇格要求受理後の次ターンで chat.message により昇格先へ書換し、以降、昇格状態の間は毎ターン再適用する。
        - 復帰要求受理後の次ターンでも chat.message により preModel / preVariant へ書換し、その後のターンから書換を停止する（セッション行が昇格中の手動変更等で変わっていても、昇格直前のモデルへ確実に戻すため）。

      ## 配布

      - 配布物: agentdev.jsonc テンプレート、Plugin ファイルのテンプレート。リポジトリ内の配布用ディレクトリへ配置する。
      - 導入: Consumer が手動コピー（.opencode/plugin/ へ Plugin、.agentdev/ へ設定）。導入スクリプトは提供しない（DEC-016 副作用ゼロ原則）。
      - 配置先と Git 管理: Plugin 配置先は .opencode/plugin/（singular）。Consumer は配布テンプレートの配置先を gitignore へ追加する（.agentdev/agentdev.jsonc は Git 管理対象、Plugin ファイルは gitignore 対象）。Consumer 側 .agentdev/README.md の状態表への agentdev.jsonc エントリ追加は REQ-053 実装時に伴う文書更新として行う。
      - REQ-009 配布基盤（install 対象は配布 command/skill に限定）は使用しない。

      ## 検証

      - 観察契約: Plugin は切替・拒否・失敗の各イベントをログへ出力する（sessionID、切替種別、切替前後のモデル・variant）。test_strategy の実機検証は当該ログとセッション実測を観察対象とする。
      - OpenCode v1.18.23 で昇格・継続・復帰の実機検証を行う（REQ-053-016、test_strategy の実行）。
      - 既知リスクと方針:
        - chat.message 書換の挙動は OpenCode バージョン間で差異があり得る（コミュニティ実装には永続化後の DB 直接書換 workaround の事例がある）。本 Design は公式フック契約内の書換を採用し、DB 直接書換（Bus イベント抑制・公式契約外アクセス）を採用しない。OpenCode 更新時は test_strategy の実機検証で互換性を再確認する。
        - エージェント定義の tools 制限（許可リスト）により、昇格要求 tool が呼べないエージェント構成では当該セッションで昇格を利用できない。制限は配布先の選択であり、test_strategy（TS-007）は tool 呼出自体の可否を観察対象に含める。
        - OpenCode 再起動時、昇格状態は normal へ戻る（安全側）。継続運用は再昇格要求で再開する。

      ## 関連 Design

      - REQ-052 対応 Design（Plugin/Hook 種別の配置・命名・構成契約）

conflict_resolutions:
  - id: CR-001
    conflict: RU-0001 は .agentdev/agentdev.jsonc の新設を要求するが、REQ-002-012 は .agentdev/ を「実行結果と状態のみを格納」と定義しており文言上矛盾する。
    resolution: REQ-002-012 の文言を「実行結果と状態、および実行時共通構成を格納」へ緩和する（ACT-REQ-003）。.agentdev/ への状態以外配置の現行先例は extensions 配置契約（REQ-002-030。かつての DEC-005 は DEC-006 が supersede 済みで、現行の正規所有は REQ-002-030）。
  - id: CR-002
    conflict: モデル昇格（実行時状態切替）は REQ-052-002 の「実行前の拒否・強制」種別定義の文言上範囲外に位置する。
    resolution: REQ-052-011 を追加し、Plugin/Hook 種別の能力として実行時状態の決定的切替を明示する（ACT-REQ-002）。ターン境界での状態切替は LLM 呼出の実行前に完了する操作であり、DEC-022 決定5（proposed）の「実行前」の操作として整合する。独立 Decision は作らず種別契約の参照で足りる。
  - id: CR-003
    conflict: 昇格機構の配布経路として REQ-009 配布基盤を経由する案があったが、REQ-009-010/012 が install 対象を配布 command/skill に限定しており現行枠外である。あわせて REQ-009-009 は手動 copy インストールを ADF 配布基盤の対象外とし、REQ-052-007 は実行時配布モデルが Tools/Plugins を正規配布物として扱えることを要求する。
    resolution: テンプレート+手動コピー方式を採用（ユーザー確定、AG-009）。REQ-009 は変更しない。REQ-009-009 は REQ-009 配布基盤の導入モデルの規定であり、本件は REQ-009 配布基盤を使用しないため不干渉。REQ-052-007 の「正規配布物として扱える」は配布物の正規性（リポジトリ管理されたテンプレートとして配布契約を持つこと）を要求するものであり、配布経路（install コマンド）を要求しない。本件は Plugin テンプレートを正規配布物としてリポジトリ管理し、配置先と Consumer 側 gitignore の対応は Design 配布節で明示する。
  - id: CR-004
    conflict: chat.message による output.message 書換の挙動は OpenCode バージョン間で差異があり得る（コミュニティ実装 oh-my-openagent は永続化後の DB 直接書換 workaround を併用）。
    resolution: 一次手段を v1.18.23 の公式フック契約内の書換と確定し、DB 直接書換（Bus イベント抑制・公式契約外アクセス）は採用しない。AC21（REQ-053-016）の実機検証で成立を確認し、OpenCode 更新時は再検証する。
  - id: CR-005
    conflict: 一行通知の要求に対し、v1.18.23 には Plugin 用の UI 通知 API が存在しない。
    resolution: 通知を会話ストリーム上の一行表示と確定する。一次手段は要求 tool の result による一行表示（tool 実行結果は会話上に表示されるため決定的）、補助として system コンテキスト注入（experimental.chat.system.transform）で切替後モデルへ通知を同期する（Design「通知」節）。
  - id: CR-006
    conflict: REQ-053-010（旧文言「無限に反復しないよう防止」）を機構側の状態機械のみで充足すると、モデルの明示判断による昇格と復帰の交替（正当な作業の繰返し）まで禁止する過剰解釈が生じ得る。一方で Design 状態機械の「交替は禁止しない」立場は REQ 文言と整合しない。
    resolution: 反復の意味論を「機構が自律的に反復しない（自動リトライ等）」と「モデルの明示要求による繰返し」に区別し、REQ-053-010 の文言を機構の自律的反復の防止へ確定する（AG-006、REQ-053-010 を修正）。状態機械は同一ターン内の矛盾要求と状態不整合を防止する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-053
    target_design: { operation: create, domain: foundations, slug: model-escalation-runtime }
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-053.md
        - docs/requirements/REQ-052.md
        - docs/requirements/REQ-002.md
        - docs/decisions/DEC-023.md
      artifact_action_map:
        ACT-REQ-001: docs/requirements/REQ-053.md (create, REQ-053 confirmed by alloc-req-number, max=52)
        ACT-REQ-002: docs/requirements/REQ-052.md (append, REQ-052-011)
        ACT-REQ-003: docs/requirements/REQ-002.md (update, REQ-002-012)
        ACT-DEC-001: docs/decisions/DEC-023.md (create, DEC-023 confirmed by alloc-decision-number, max=22; ACT-DESIGN-001 is design-save target)
      source_ru_map:
        RU-0001:
          - REQ-053 create
          - REQ-052 append
          - REQ-002 update
          - DEC-023 create
      unclassified_verification_rows:
        - REQ-053-001
        - REQ-053-002
        - REQ-053-003
        - REQ-053-004
        - REQ-053-005
        - REQ-053-006
        - REQ-053-007
        - REQ-053-008
        - REQ-053-009
        - REQ-053-010
        - REQ-053-011
        - REQ-053-012
        - REQ-053-013
        - REQ-053-014
        - REQ-053-015
        - REQ-053-016
        - REQ-053-017
        - REQ-052-011
      unclassified_note: case-open must complete classification (verification-scope-catalog registration as verification-optional rows, or permanent verification means with verification declarations) before implementation starts

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      .agentdev/agentdev.jsonc が repo に存在し Git 管理下であることを確認する。modelEscalation 記述例を含み、
      Provider 認証情報・API キーの項目を含まないことを確認する。配布テンプレートが配布用ディレクトリに存在することを確認する。
    pass_criteria: |
      設定ファイルが Git 管理で存在し、modelEscalation 記述例を含み、認証情報項目を含まず、配布テンプレートが存在する。
    on_failure: |
      fix-and-reverify。設定ファイル契約は本 REQ の基盤であり、修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      OpenCode v1.18.23 実機で、modelEscalation を設定したセッションで昇格要求 tool が提供され、呼出後の次ターンが
      指定モデル・variant で開始することを Plugin 切替ログとセッション実測で確認する。modelEscalation を設定しない
      状態で要求 tool が提供されないこと（非発動）を確認する。通常モデルを設定へ書かない構成で動作することを確認する。
    pass_criteria: |
      非発動、次ターンの指定モデル・variant 開始、通常モデル非固定での動作がすべて観察される。
    on_failure: |
      fix-and-reverify。昇格機構の中核動作であり、修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      昇格要求後の次ターンで sessionID が不変であること、新規サブエージェント・別セッションが生成されないこと、
      昇格モデルが同一セッションの会話履歴を参照して継続できていることを確認する。
    pass_criteria: |
      sessionID 不変、別セッション非生成、会話履歴継続が観察される。
    on_failure: |
      fix-and-reverify。受け入れ条件の根幹（同一セッション切替）であり、修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      昇格状態が明示復帰要求まで複数ターン維持されることを確認する。復帰要求後の次ターン以降が昇格直前の
      モデル・variant で動作することを確認する。
    pass_criteria: |
      複数ターンの昇格維持と、復帰後のモデル・variant 一致が観察される。
    on_failure: |
      fix-and-reverify。復帰契約の違反は昇格機構の信頼性に直結するため、修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      昇格時と復帰時のターンで、要求 tool の result として切替前後のモデル（と variant）を含む一行通知が
      会話上に現れることを確認する。補助の system 注入は通知の成立条件に含めない。
    pass_criteria: |
      昇格・復帰双方で tool result による一行通知が会話上に観察される。
    on_failure: |
      fix-and-reverify。受け入れ条件（REQ-053-008）への直接違反のため、修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      昇格先に存在しないモデルを設定して昇格要求し、失敗が報告され、成功表示・成功記録が行われないことを確認する。
      escalated 状態での重複昇格要求、normal 状態での復帰要求が拒否されることを確認する。機構が自律的に（要求なしで）
      切替・リトライを反復しないことを切替ログで確認する。
    pass_criteria: |
      失敗が正しく報告され、状態が変化せず、状態機械による重複要求の拒否と機構の自律的反復の不在が観察される。
    on_failure: |
      fix-and-reverify。成功扱いの誤表示は REQ-052-003/004 の強制契約違反のため、修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      メインセッションとサブエージェント（task tool 由来の子セッション）双方で、昇格要求 tool の呼出自体が可能で、
      要求から切替までが成立することを確認する。Plugin 実装が omo 等の外部ハーネス拡張を import しないことを
      import 解析で確認する。
    pass_criteria: |
      双方のセッション種別で tool 呼出と切替が成立し、外部拡張への import 依存が存在しない。
    on_failure: |
      fix-and-reverify。REQ-053-011/012/013 の違反であり、修正して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      OpenCode v1.18.23 で「通常 → 昇格要求 → 昇格ターン → 継続 → 復帰要求 → 復帰ターン」の全状態遷移を
      一連の実機セッションで実行し、TS-001 から TS-007 の確認を通しで成立させる。
    pass_criteria: |
      一連の状態遷移が中断なく成立する。
    on_failure: |
      fix-and-reverify。REQ-053-016 は本 REQ の最終受け入れ条件であり、修正して再検証する。
  - id: TS-009
    target_item: AG-009
    verification: |
      配布テンプレートを手動コピーで配置した Consumer 相当の環境で、昇格要求から切替までが成立することを確認する。
      導入スクリプトが提供されていないこと（副作用ゼロ）を確認する。
    pass_criteria: |
      手動コピー構成で同一契約が成立し、導入スクリプトが存在しない。
    on_failure: |
      fix-and-reverify。配布契約（REQ-053-015）の違反であり、修正して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      昇格要求・復帰要求の受付が tool 経由で行われ、切替・状態保持・通知・反復防止が Plugin 側の実装に
      局在していることを、Plugin の実装構造と import 解析等の機械的確認で検証する。モデル側へ状態管理の
      実装が漏出していないことを確認する。
    pass_criteria: |
      要求受付と制御が機構側に局在し、モデルは要求 tool の呼出のみを行う構造になっている。
    on_failure: |
      fix-and-reverify。責務分離（REQ-053-017）の違反であり、修正して再検証する。
  - id: TS-011
    target_item: AG-011
    verification: |
      REQ-002-012 の修正後文言と REQ-052-011 の追記行が docs/requirements の該当ファイルへ反映されることを、
      req-save の適用結果検証で確認する。
    pass_criteria: |
      両修正が保存され、修正前の矛盾文言が残存しない。
    on_failure: |
      fix-and-reverify。既存 REQ との矛盾残存は REQ-002-012 違反を生むため、修正して再検証する。

review_dispositions:
  - { id: RD-001, source_ru: RU-0001, source_item: accepted-criterion-1, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-001、ACT-REQ-001（REQ-053-001）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 1, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-002, source_ru: RU-0001, source_item: accepted-criterion-2, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-001、ACT-REQ-001（REQ-053-001）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 2, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-003, source_ru: RU-0001, source_item: accepted-criterion-3, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-002、ACT-REQ-001（REQ-053-002）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 3, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-004, source_ru: RU-0001, source_item: accepted-criterion-4, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-002、ACT-REQ-001（REQ-053-002）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 4, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-005, source_ru: RU-0001, source_item: accepted-criterion-5, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-002、ACT-REQ-001（REQ-053-003）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 5, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-006, source_ru: RU-0001, source_item: accepted-criterion-6, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-003、ACT-REQ-001（REQ-053-003）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 6, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-007, source_ru: RU-0001, source_item: accepted-criterion-7, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-003、ACT-REQ-001（REQ-053-004）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 7, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-008, source_ru: RU-0001, source_item: accepted-criterion-8, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-003、ACT-REQ-001（REQ-053-005）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 8, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-009, source_ru: RU-0001, source_item: accepted-criterion-9, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-003、ACT-REQ-001（REQ-053-005）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 9, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-010, source_ru: RU-0001, source_item: accepted-criterion-10, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-003、ACT-REQ-001（REQ-053-005）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 10, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-011, source_ru: RU-0001, source_item: accepted-criterion-11, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-004、ACT-REQ-001（REQ-053-006）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 11, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-012, source_ru: RU-0001, source_item: accepted-criterion-12, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-004、ACT-REQ-001（REQ-053-007）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 12, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-013, source_ru: RU-0001, source_item: accepted-criterion-13, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-005、ACT-REQ-001（REQ-053-008）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 13, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-014, source_ru: RU-0001, source_item: accepted-criterion-14, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-005、ACT-REQ-001（REQ-053-008）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 14, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-015, source_ru: RU-0001, source_item: accepted-criterion-15, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-006、ACT-REQ-001（REQ-053-009）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 15, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-016, source_ru: RU-0001, source_item: accepted-criterion-16, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-006、ACT-REQ-001（REQ-053-010）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 16, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-017, source_ru: RU-0001, source_item: accepted-criterion-17, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-007、ACT-REQ-001（REQ-053-011）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 17, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-018, source_ru: RU-0001, source_item: accepted-criterion-18, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-007、ACT-REQ-001（REQ-053-013）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 18, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-019, source_ru: RU-0001, source_item: accepted-criterion-19, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-001+AG-009、ACT-REQ-001（REQ-053-015）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 19, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-020, source_ru: RU-0001, source_item: accepted-criterion-20, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-001、ACT-REQ-001（REQ-053-014）で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 20, checked_at_commit: null }, related_removed_items: [] }
  - { id: RD-021, source_ru: RU-0001, source_item: accepted-criterion-21, disposition: covered, reason_code: covered_by_artifact_actions, reason: "AG-008、ACT-REQ-001（REQ-053-016）+TS-008 で対応", evidence: { path: .agentdev/backlog/req-units/RU-0001.md, section: 決定的受け入れ条件 21, checked_at_commit: null }, related_removed_items: [] }

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

RU-0001（OpenCode 同一セッションモデル昇格と ADF 共通設定）を単一 REQ（REQ-053 仮採番）として要件化した。
Decision 1本（agentdev-shared-config-file）、Design 1件（foundations/model-escalation-runtime）、
既存 REQ 修正 2件（REQ-002-012 文言緩和、REQ-052-011 追加）を伴う。通常 Case として扱い、実動作検証は
case-run 内の検証手段（TS-001〜011）に組み込む。OpenCode v1.18.23 の実装契約（chat.message フック・
tool 定義・variants 構造）は librarian 調査（sst/anomalyco リポジトリ v1.18.23 タグ実コード確認済み）に基づく。
