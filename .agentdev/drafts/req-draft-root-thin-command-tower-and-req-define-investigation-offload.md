---
draft_type: req_draft
topic_slug: root-thin-command-tower-and-req-define-investigation-offload
status: draft
created_at: 2026-11-29T00:23:42+09:00
---

<!-- req_draft: 構造化引き継ぎ成果物。後続工程の原本は # draft-data 内の YAML ブロックである。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  ADF の Root オーケストレータ（case-auto と、case-auto から委譲された各工程のセッション）を薄い司令塔にする。
  作業単位 1 は、親が直接実行する調査・検査を対象パスが確定している単一ファイルの限定的確認か一〜二回の軽量な状態確認コマンドに限定し、複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式をサブエージェントへ委譲する。
  統合・クローズ工程では PR 差分確認、コンフリクト調査、テスト再実行、トレーサビリティ check の実行と証拠の照合を読取りと検証を担当するサブエージェントへ委譲し、書き込みを伴う作業（複数文書の同期）は工程委譲の範囲内で case-close が行い、判断主体は委譲結果サマリと最小限の参照の突合、観点の評価、進行判断、永続化、状態遷移を保持する。
  子セッションの生ログは読み戻さない。
  作業単位 2 は、req-define の探索・影響調査とその前処理を読取専用の探索サブエージェントへ委譲し、返却を判定要約、関連ファイルパス、正規所有責務、制約と矛盾点、変更候補、未確認事項に限定した構造化サマリ（上限は REQ-125-001 に同じ）にする。
  壁打ち、Decision 受理判断、draft 確定は判断主体が保持し、draft 保存による独立完了は変えない。
  Decision の新設は不要。

important_change_notification:
  issued_before_save: true
  notified_at: 2026-11-29T00:23:42+09:00
  summary: >-
    委譲契約 Design「親セッション向け委譲結果サマリ」節の直接実行の基準を上限へ変更し、子セッションの生ログを読み戻さない規律と読取専用の探索の返却構成を追加する。
    case-close の完了判定について、証拠と正規成果物との照合を実行担当と独立な検証サブエージェントが行い、case-close は最小限の参照の突合で判定する構成を case-close Design に追加する。
    req-define の探索と前処理の実行主体を読取専用の探索サブエージェントへ移す。
    REQ-125、REQ-032、REQ-004 は既存行を変更せず行を追加する。
    レビュー後に追加で識別した変更: case-close Design「トレーサビリティ能力の利用（QG-4 独立再検査）」節の check の実行と証拠の照合の実行主体を検証サブエージェントへ移す（観点の評価と完了条件チェックボックスの確定は case-close のまま）。
    req-define Design「現在の動作」と「トレーサビリティ能力の利用」の前処理と確認の実行主体の記述を探索サブエージェントへ更新する。
  additional_notified_at: 2026-11-29T00:47:53+09:00

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      作業単位 1（下流 Root の薄い司令塔化）の仕様 1。
      親オーケストレータ（case-auto と、case-auto から委譲された各工程のセッション）が直接実行する調査・検査の上限を、対象パスが確定している単一ファイルの限定的確認、または一〜二回の軽量な状態確認コマンドに厳格化する。
      複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式は親が直接実行せずサブエージェントへ委譲する。
      単一ファイルの小規模確認や一〜二回のコマンドで完結する調査・検査のために新規のサブエージェントは起動しない。
      既存契約で必須の委譲と独立検証、環境制約時の親オーケストレータ直接書込みフォールバック、親が保持する進行判断、永続化、外部システム更新、commit、push、merge、ユーザー確認は維持する。
      サブエージェントを起動できない場合は既存の delegation-unavailable の報告契約に従う。
      受け入れ条件は、委譲契約 Design と case-auto の Workflow Skill と公開 command に新しい上限と委譲対象が明文化され、関連する固定文言の検査テストと整合性検査が合格すること。
  - id: AG-002
    content: >-
      作業単位 1 の仕様 2。
      統合・クローズ工程（case-close）のうち、PR 差分確認、コンフリクト調査、テスト再実行、トレーサビリティ check の実行、証拠と正規成果物との照合は判断主体の直接実行に抱え込まず、読取りと検証を担当する書き込み禁止型のサブエージェントへ委譲する。
      書き込みを伴う作業（複数文書の同期、修正）は、書込み許可のある委譲が case-auto からの工程委譲に限られる既存の契約を変えず、その範囲内で case-close が行う。case-auto の Root から見ればどちらも工程委譲された実作業であり、Root は実作業を直接実行しない。
      完了判定（QG-4）の観点の評価は判断主体が行い、判断主体は委譲結果サマリと、サマリに記録された最小限の参照と正規証拠との突合によって進行を判定する。
      完了条件チェックボックスの評価と更新、進行判断、永続化、Issue/PR 状態遷移、commit、push、merge は case-close が保持し、サマリ本文だけで達成扱いにしない。
      受け入れ条件は、case-close Design と case-close の Workflow Skill に実作業の委譲と判断主体の保持範囲が明文化されて古い実行主体の記述が残らず、関連テストと整合性検査が合格すること。
  - id: AG-003
    content: >-
      作業単位 1 の仕様 3。
      親オーケストレータは子セッションの生ログ（詳細な実行履歴）を読み戻さない。
      ゲートの進行判定は委譲結果サマリに記録された参照（退避先のパス、PR の URL、テスト結果の件数など）と正規証拠との突合によって行い、参照先の確認は当該参照に限る。
      例外として生ログの読み戻しは設けず、子の返却なしに起動不能や破棄を確定する場合は既存契約に従う。
      要件行、Design、配布物の本文はホスト固有のツール名を書かず中立語で規定し、ツール名は harness 側の参照（AGENTS.md と references/<harness>.md）に置く。
  - id: AG-004
    content: >-
      作業単位 2（req-define の調査の外出し）の仕様 1。
      req-define のコードベース探索、要件・設計・Decision 文書の横断検索、実現面と変更影響候補の抽出、既存テスト構造の調査、およびこれらに先立つキーワード抽出とファイル列挙・検索の前処理のうち、複数の読込や検索を伴うものは、判断主体が直接実行せず読取専用の探索サブエージェントへ委譲する。
      探索の範囲は既存の限定探索（明示入力ファイル、docs/requirements 配下の参照、変更影響候補抽出と Decision 判断に必要な探索）を変えず、実行主体だけを移す。
      全件の存在確認を機械処理として維持し、完全列挙をキーワード検索で代替せず、調査優先対象をヒントとして扱う規律は、前処理を探索サブエージェントが実行する場合も維持する。
      判断主体が直接実行するのは対象パスが確定している単一ファイルの限定的確認だけとする。
      受け入れ条件は、req-define の公開 command、req-define の Workflow Skill とその参照、req-define-detailed-gates.md、investigation-scope-refinement.md、wall-methodology.md に探索委譲の原則が明文化され、整合性検査とテストが合格すること。
  - id: AG-005
    content: >-
      作業単位 2 の仕様 2。
      探索サブエージェントから判断主体への返却は構造化サマリに限定する。
      上限は REQ-125-001（上限目安 3〜4 KB 以内の構造化サマリ）に同じとし、本文は判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨に限定する。
      実装や検証にだけ該当する委譲結果サマリの項目は省略できる。
      生の本文全文や大量の検索結果は返却本文に含めず、判断主体の会話コンテキストへ持ち込まない。
      判断主体は判断に必要な単一ファイルの限定的確認だけを直接行い、取得不能や未確認を成功として扱わない。
  - id: AG-006
    content: >-
      作業単位 2 の仕様 3（維持）。
      壁打ち対話、要件そのものの人間判断、Decision 受理判断、最終的な req-draft の確認と保存は判断主体が保持し、探索サブエージェントへ委譲しない。
      1 回の req-define セッションで巨大な複数案件や連続実行は抱え込まず、draft の保存をもって独立して完了する既存契約と、編集スコープが .agentdev/drafts 配下に限られるガードレール、入力ファイルが参照専用である規律、実現面の確定を後工程へ先送りしない規律を変えない。
      この項目は既存の要件行と公開 command が既に所有するため、要件行の新設と変更は行わず、探索委譲の境界として配布物と Design に明記する。
  - id: AG-007
    content: >-
      適用範囲の境界。
      入力の項目 3（agentdev_gh とセッション履歴の読取り手段の重複の最適化）は本要件と Headroom 導入の効果測定後に再評価し、本要件の対象外とする。
      ホスト側のコンテキスト上限の緩和（OpenCode の limit.context、Hermes の compression 閾値）と Headroom の導入は別件とする。
      全コマンド共通の運用原則への一般化は行わず、対象は case-auto、case-close、req-define とそれらが参照する委譲契約に限る。
      この項目は適用範囲の境界の宣言であり、成果物の書込みを伴わない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-125.md
    source_items: [AG-001, AG-003]
    notes: >-
      表構造は 3 列（ID、要件、検証）であり、既存の最終行 REQ-125-008 の直後に追記する。既存行は変更しない。
      要件行 ID は Definition 保存時の採番スクリプトによる（現状の最大番号の次を記載）。
    content: |
      | REQ-125-009 | 親オーケストレータ（case-auto と、case-auto から委譲された各工程のセッション）が直接実行する調査・検査は、対象パスが確定している単一ファイルの限定的確認、または一〜二回の軽量な状態確認コマンドに限定すること。複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式はサブエージェントへ委譲して実行すること。単一ファイルの小規模確認や一〜二回のコマンドで完結する調査・検査のために新規のサブエージェントは起動しないこと。既存契約で必須の委譲・独立検証、環境制約時の親オーケストレータ直接書込みフォールバック（REQ-003-031）、親が保持する進行判断・永続化・外部システム更新・commit・push・merge・ユーザー確認（REQ-003-001）は維持すること | TS-001 |
      | REQ-125-010 | 親オーケストレータは、子セッションの生ログ（詳細な実行履歴）や、探索サブエージェントの調査対象となった生の本文・大量の検索結果を読み戻したり自ら収集したりしないこと。ゲートの進行判定は REQ-125-001 のとおりサマリと必要な証拠だけを参照して行い、参照先の確認はサマリに記録された参照（退避先のパス、PR の URL、テスト結果の件数など）に限ること。子の返却なしに起動不能や破棄を確定する場合は既存契約に従うこと | TS-003 |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-002]
    notes: >-
      表構造は 2 列（ID、要件）であり、既存の最終行 REQ-032-048 の直後に追記する。既存行は変更しない。
      要件行 ID は Definition 保存時の採番スクリプトによる（現状の最大番号の次を記載）。
    content: |
      | REQ-032-049 | case-close は、PR 差分確認、コンフリクト調査、テスト再実行を読取りと検証を担当する書き込み禁止型のサブエージェントへ委譲して行わせ、書き込みを伴う作業（複数文書の同期、修正）は既存の書込み許可のある委譲（case-auto からの工程委譲）の範囲内で自ら行うこと（起動手段は harness 責務）。完了判定（QG-4）に用いる証拠と正規成果物との照合は実行担当と独立な検証サブエージェントが行い、case-close は委譲結果サマリと、サマリに記録された最小限の参照と正規証拠との突合によって進行を判定すること。完了条件チェックボックスの評価と更新、進行判断、永続化、Issue/PR 状態遷移、commit、push、merge は case-close が保持すること（達成扱いの条件は REQ-032-001 に従う） |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    source_items: [AG-004, AG-005]
    notes: >-
      表構造は 2 列（ID、要件）であり、既存の最終行 REQ-004-077 の直後に追記する。既存行は変更しない。
      要件行 ID は Definition 保存時の採番スクリプトによる（現状の最大番号の次を記載）。
    content: |
      | REQ-004-078 | req-define は、コードベース探索、要件・設計・Decision 文書の横断検索、実現面と変更影響候補の抽出、既存テスト構造の調査、およびこれらに先立つキーワード抽出とファイル列挙・検索の前処理のうち、複数の読込や検索を伴うものを読取専用の探索サブエージェントへ委譲して実行すること（起動手段は harness 責務）。探索の範囲は既存の限定探索（明示入力ファイル、`docs/requirements/**` の参照、変更影響候補抽出と Decision 判断に必要な探索）を変えないこと。全件の存在確認を機械処理として維持し、完全列挙をキーワード検索で代替せず、調査優先対象をヒントとして扱う規律は、前処理を探索サブエージェントが実行する場合も維持すること。req-define の判断主体が直接実行するのは対象パスが確定している単一ファイルの限定的確認だけとすること |
      | REQ-004-079 | req-define の探索サブエージェントから判断主体への返却は、上限を REQ-125-001 に同じ構造化サマリとし、判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨に限定すること。実装や検証にだけ該当する委譲結果サマリの項目は省略できること。生の本文全文や大量の検索結果を返却本文に含めず、取得不能や未確認を成功として扱わないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/delegation-contracts.md
    target_area: "## 親セッション向け委譲結果サマリ"
    source_items: [AG-001, AG-003, AG-005]
    canonical_owner: >-
      委譲契約 Design（docs/designs/workflows/delegation-contracts.md）「親セッション向け委譲結果サマリ」節。
      直接実行の基準と委譲結果サマリの契約の正であり、case-auto の Workflow Skill と公開 command は投影である。
    destination_selection_reason: >-
      直接実行の基準の契約の正がこの節の最終段落にあり、上限の厳格化は同じ関心の意味変更なので新設せず同じ節を更新する。
      子セッションの生ログを読み戻さない規律と読取専用の探索の返却構成は、同じ委譲結果サマリの受領側の規律なので同節に追加する。
    change_nature: 既存節の意味変更（直接実行の基準の上限化）と規律の追加
    req_impact: REQ-125 に行を追加（ACT-REQ-001）。REQ-004 の探索返却行（ACT-REQ-003）は同節の返却構成を参照する
    old_text: >-
      親の Workflow Skill が進行とゲートを判定する。単一ファイルの小規模確認または一〜二回のコマンドで完結する調査・検査は直接実行し、既存契約で必須の委譲・独立検証にはこの基準を適用しない。
    new_text: |-
      親の Workflow Skill が進行とゲートを判定する。親が直接実行する調査・検査は、対象パスが確定している単一ファイルの限定的確認、または一〜二回の軽量な状態確認コマンドに限定する。複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式はサブエージェントへ委譲して実行する。単一ファイルの小規模確認や一〜二回のコマンドで完結する調査・検査のために新規のサブエージェントは起動しない。既存契約で必須の委譲・独立検証にはこの基準を適用せず、環境制約時の親オーケストレータ直接書込みフォールバックと、親が保持する進行判断・永続化・外部システム更新・commit・push・merge・ユーザー確認は維持する。サブエージェントを起動できない場合は既存契約（`delegation-unavailable` の報告）に従う。

      親は子セッションの生ログ（詳細な実行履歴）を読み戻さない。ゲートの進行判定は委譲結果サマリに記録された参照（退避先のパス、PR の URL、テスト結果の件数など）と正規証拠との突合によって行い、参照先の確認は当該参照に限る。子の返却なしに起動不能や破棄を確定する場合は既存契約に従い、例外として生ログの読戻しを設けない。生ログの読取り手段を harness が提供する場合、その利用方法は AGENTS.md および references/<harness>.md に置き、配布物の本文にツール名を固定しない。

      読取専用の探索・調査の委譲では、子の最終本文の上限は同じ目安に従い、判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨を本文に含める。実装や検証にだけ該当する項目（コミット SHA、Issue/PR 番号、テスト結果など）は省略できる。生の本文全文や大量の検索結果は返却本文に含めず、親は調査対象の生の本文や大量の検索結果を自ら収集しない。
    content: |-
      ## 親セッション向け委譲結果サマリ

      子の最終本文は、ステータス（`completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目で構成し、UTF-8 本文の上限目安を 3〜4 KB 以内とする。該当のない項目はその旨を記し、未確認の結果を成功に置換しない。

      この報告用ステータスは、正規の委譲実行結果 `completed-pr`、`blocked`、`failed`、`delegation-unavailable` を変更しない。親は正規結果と必要な証拠を別に扱い、子の返却なしに起動不能を確定する場合は既存契約に従う。サマリの `completed` から PR 完了やゲート合格を導出しない。

      | 実行主体 | 変更後の責務 |
      |---|---|
      | Command | 公開入口と再開可能な出力契約を示す |
      | Adapter Skill | 委譲プロンプトと返却を接続し、正規結果とサマリの区別を保つ |
      | Subagent | 許可された操作だけを行い、最終本文をサマリに限定する |
      | Harness | 並列起動、起動時刻制御および結果転送を担う |

      親の Workflow Skill が進行とゲートを判定する。親が直接実行する調査・検査は、対象パスが確定している単一ファイルの限定的確認、または一〜二回の軽量な状態確認コマンドに限定する。複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式はサブエージェントへ委譲して実行する。単一ファイルの小規模確認や一〜二回のコマンドで完結する調査・検査のために新規のサブエージェントは起動しない。既存契約で必須の委譲・独立検証にはこの基準を適用せず、環境制約時の親オーケストレータ直接書込みフォールバックと、親が保持する進行判断・永続化・外部システム更新・commit・push・merge・ユーザー確認は維持する。サブエージェントを起動できない場合は既存契約（`delegation-unavailable` の報告）に従う。

      親は子セッションの生ログ（詳細な実行履歴）を読み戻さない。ゲートの進行判定は委譲結果サマリに記録された参照（退避先のパス、PR の URL、テスト結果の件数など）と正規証拠との突合によって行い、参照先の確認は当該参照に限る。子の返却なしに起動不能や破棄を確定する場合は既存契約に従い、例外として生ログの読戻しを設けない。生ログの読取り手段を harness が提供する場合、その利用方法は AGENTS.md および references/<harness>.md に置き、配布物の本文にツール名を固定しない。

      読取専用の探索・調査の委譲では、子の最終本文の上限は同じ目安に従い、判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨を本文に含める。実装や検証にだけ該当する項目（コミット SHA、Issue/PR 番号、テスト結果など）は省略できる。生の本文全文や大量の検索結果は返却本文に含めず、親は調査対象の生の本文や大量の検索結果を自ら収集しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/commands/case-close.md
    target_area: "## 統合・クローズ工程の実作業委譲"
    anchor: "## 完了判定と委譲結果サマリ"
    placement: after_anchor
    source_items: [AG-002]
    canonical_owner: >-
      case-close Design（docs/designs/commands/case-close.md）「統合・クローズ工程の実作業委譲」節。
      統合・クローズ工程の実行契約の正であり、case-close の Workflow Skill が実装本体を持つ。
    destination_selection_reason: >-
      統合・クローズ工程の実作業の実行主体と case-close の保持範囲は case-close の実行契約であり、完了判定と委譲結果サマリの節の直後に独立した節として追加する。
      委譲の一般則は委譲契約 Design が持ち、重複させない。
    change_nature: 既存 Design への節の追加（実作業の委譲と QG-4 の照合主体の明記）
    req_impact: REQ-032 に行を追加（ACT-REQ-002）
    content: |-
      ## 統合・クローズ工程の実作業委譲

      case-close は統合・クローズ工程の読取・検証の実作業（PR 差分確認、コンフリクト調査、テスト再実行、証拠と正規成果物との照合）を判断主体の直接実行に抱え込まず、読取りと検証を担当するサブエージェントへ委譲して行う。書込みを伴う作業（複数文書の同期、修正）は case-close が case-auto からの工程委譲の範囲内で行う。case-close は [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) を受領して進行を判定する。

      | 実行主体 | 変更後の責務 |
      |---|---|
      | Command | 該当なし（case-close は公開 command を持たない内部 lifecycle 段階） |
      | Adapter Skill | 委譲プロンプトと返却を接続し、正規結果とサマリの区別を保つ |
      | Subagent | case-auto からの工程委譲で case-close を実行するサブエージェントは書込みを伴う同期、永続化、状態遷移を行う。読取りと検証を担当するサブエージェントは PR 差分確認、コンフリクト調査、テスト再実行、トレーサビリティ check の実行、証拠と正規成果物との照合を行い、最終本文をサマリに限定する |
      | Harness | 起動、起動時刻制御および結果転送を担う |

      - 読取りと検証の委譲は書き込み禁止型（`gate_check`、`semantic_review`、`log_analysis`）として扱う。テスト再実行に伴う一時資材の作成・利用は、委譲時最小契約の副作用境界に許可する操作を具体名で列挙する。
      - 書込みを伴う作業（複数文書の同期、修正）は、既存の書込み許可のある委譲（`step_execution`: case-auto からの工程委譲）の範囲内で case-close が行う。工程セッションの下部へ書込み権限付きの委譲種別を新設しない。
      - 委譲の起動方法（case-close の工程セッション内で起動するか、親オーケストレータ経由で起動するか）は harness の責務であり、AGENTS.md および references/<harness>.md に置く。本 Design は委譲の入力、副作用境界、出力契約だけを定める。
      - 完了条件チェックボックスの評価と更新は case-close の専任のままで、サマリ本文だけでは達成扱いとしない。決定的な check の実行と証拠と正規成果物との照合は実行担当と独立な検証サブエージェントが行い、case-close はサマリに記録された最小限の参照と正規証拠を突合して判定する。この照合は実行担当の判定や要約とは独立に行う再検査であり、「完了判定と委譲結果サマリ」節の規律を緩めない。
      - 進行判断、永続化、Issue/PR 状態遷移、commit、push、merge、ユーザー確認は case-close が保持する。直接実行の上限と子セッションの生ログを読み戻さない規律は委譲契約 Design「親セッション向け委譲結果サマリ」節に従う。
      - サブエージェントを起動できない場合は既存契約（`delegation-unavailable` の報告）と環境制約時の親オーケストレータ直接書込みフォールバックに従う。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/req-define.md
    target_area: "## 探索委譲と構造化サマリ受領"
    anchor: "## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化"
    placement: after_anchor
    source_items: [AG-004, AG-005, AG-006]
    canonical_owner: >-
      req-define command Design（docs/designs/commands/req-define.md）「探索委譲と構造化サマリ受領」節。
      req-define の探索委譲の契約の正であり、手順の詳細は agentdev-req-analysis の references と req-define の Workflow Skill が持つ。
    destination_selection_reason: >-
      req-define の探索と影響調査の実行主体と返却契約は req-define の工程契約であり、調査委譲の既存節の直後に独立した節として追加する。
      委譲結果サマリの上限と構成の一般則は委譲契約 Design が持ち、ここでは参照だけを書く。
    change_nature: 既存 Design への節の追加（探索と前処理の実行主体の移動と返却契約）
    req_impact: REQ-004 に行を追加（ACT-REQ-003）。ACT-REQ-001 の親の取得抑制行と対応する
    content: |-
      ## 探索委譲と構造化サマリ受領

      req-define の探索・影響調査（コードベース探索、要件・設計・Decision 文書の横断検索、実現面と変更影響候補の抽出、既存テスト構造の調査、およびこれらに先立つキーワード抽出とファイル列挙・検索の前処理）は、判断主体が複数の読込・検索を伴う限り直接実行せず、読取専用の探索サブエージェントへ委譲する。探索の範囲は既存の限定探索（明示入力ファイル、`docs/requirements/**` の参照、変更影響候補抽出と Decision 判断に必要な探索）を変えず、実行主体だけを移す。

      | 実行主体 | 変更後の責務 |
      |---|---|
      | Command | 判断主体として壁打ち、Decision 受理判断、draft の確定と保存を行い、対象パスが確定している単一ファイルの限定的確認だけを直接実行する |
      | Adapter Skill | 該当なし（専用の adapter skill は置かず、委譲プロンプトの構成は req-define の Workflow Skill と agentdev-req-analysis の references が担う） |
      | Subagent | 既存本文や全索引の大量逐語再出力を求めず、全文は既存の機械的手段で抽出し、最終本文を探索サマリに限定する |
      | Harness | 起動、起動時刻制御および結果転送を担う |

      - 探索サマリは [委譲結果サマリ](../workflows/delegation-contracts.md#親セッション向け委譲結果サマリ) の読取専用の委譲向けの構成（上限の目安は同節に同じ）に従い、判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨を含める。実装や検証にだけ該当する項目は省略する。
      - 生の本文全文や大量の検索結果は探索サマリに含めず、判断主体の会話コンテキストへ持ち込まない。判断主体はサマリ記載の参照のうち判断に必要な、対象パスが確定している単一ファイルの限定的確認だけを直接行い、取得不能や未確認を成功として扱わない。
      - 全件の存在確認を機械処理として維持し、完全列挙をキーワード検索で代替せず、調査優先対象をヒントとして扱う規律は、前処理を探索サブエージェントが実行する場合も維持する。
      - 壁打ち対話、要件そのものの人間判断、Decision 受理判断、最終的な req-draft の確認と保存は判断主体が保持し、探索サブエージェントへ委譲しない。1 回の req-define セッションで巨大な複数案件や連続実行を抱え込まず、draft の保存をもって独立して完了する既存契約は変えない。
      - 委譲の起動方法は harness の責務であり、AGENTS.md および references/<harness>.md に置く。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/commands/req-define.md
    target_area: "## 現在の動作"
    source_items: [AG-004]
    canonical_owner: >-
      req-define command Design（docs/designs/commands/req-define.md）「現在の動作」節。
      変更影響候補抽出の前処理の記述の正であり、詳細手順は agentdev-req-analysis の references が持つ。
    destination_selection_reason: >-
      前処理の実行主体を探索サブエージェントへ移した後の姿に既存の記述を整合させるため、同じ節の該当項目を更新する。
      新節だけを追加すると正規文書内で記述が矛盾して残るため、既存の記述を書き換える。
    change_nature: 既存節内の 1 項目の実行主体表現の更新
    req_impact: REQ-004 に行を追加（ACT-REQ-003）
    old_text: >-
      RU 由来キーワード抽出 + glob/grep 前処理によるサブエージェント調査委譲スコープの絞り込み。絞り込みはサブエージェント調査委譲の調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-004-002）の完全性は維持する
    new_text: >-
      キーワード抽出と glob/grep 前処理による調査スコープの絞り込み。前処理と複数の読込や検索を伴う調査は読取専用の探索サブエージェントが実行する（「探索委譲と構造化サマリ受領」節）。絞り込みは調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-004-002）の完全性は維持する
    content: |-
      ## 現在の動作

      処理段階（外部から意味のある順序）。
      各段階の詳細手順は Workflow Skill（`agentdev-workflow-req-define`）が正規情報源である。

      - セッションコンテキスト検知（引数なし単体実行時のみ）（当該セッション履歴、現在コンテキストを Requirement Source 候補として評価）
      - 明示入力ファイル読込（指定時）（RU 自動検出を含む）
      - 壁打ち対話（`agentdev-req-analysis` に従い深掘り）
        - 前工程からの引き継ぎ判定（`agentdev_handoff: true` フラグ処理）
      - 既存REQ照合（`agentdev-req-file-manager` 照合方法論）
        - 定量的データ検証（`glob docs/requirements/REQ-*.md` で AGENTS.md 記載レンジと照合）
        - SPLIT 予兆計測（既存REQの健全性メトリクス計測）
      - 要件展開（`agentdev-req-analysis` 分析観点）
        - 変更影響候補抽出
          - キーワード抽出と glob/grep 前処理による調査スコープの絞り込み。前処理と複数の読込や検索を伴う調査は読取専用の探索サブエージェントが実行する（「探索委譲と構造化サマリ受領」節）。絞り込みは調査優先対象リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙（REQ-004-002）の完全性は維持する
        - 非機能受け入れ条件の条件付き確認（work_type に関わらず常に実行。REQ-004-050〜053）
          - 適用対象判定: 対象が、信頼できない入力の構文解析、検証、解釈（パーサ、レクサ、デシリアライザ等）、権限、配布、trust 境界の enforcement、外部ネットワーク経路、アーカイブ展開等の外部攻撃面を持つ処理のいずれかに該当するか否かを判定する（判定基準は `agentdev-req-analysis` Design の分析観点を正とする）
          - 適用対象の場合、処理量の上限（時間計算量、処理ステップ数、または走査量の上限）、出力の上限（出力件数、証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）の3確認事項への回答が確定するまで壁打ちを継続する
          - 回答は検証可能な形式（上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれか）を要求し、形式不定の回答や形式的な記述を許容しない。数値上限は既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドの規範に従う
          - 適用対象とした場合はその前提を要件docに記録する（適用外の場合の記録は強制しない）
          - 確定した受け入れ条件は既存の投影契約により test strategy（TS-NNN）へ直列化し、draft-data スキーマ、要件docテンプレート、QG、正規成果物種別を本件のために変更しない
        - 分類ゲート（暫定分類契約は REQ-008。文書7分類モデルは document-model Design）の最終分類確定ステップ（変更後仕様 or 反映作業、REQ/Design 境界判定）。RU 入力の暫定分類（backlog-review が `tentative_classification` に付与）が存在する場合、`docs/designs/foundations/document-model.md` の文書7分類モデルに照らして最終分類を確定し暫定分類を上書きする。確定時のバリデーション（暫定分類の7値チェック、フィールド欠落時の停止、最終分類上書き値の7値チェック）は後述「tentative_classification 最終確定のバリデーション（現行は REQ-008）」に定める
        - 文書分類妥当性検証（Design 分離基準違反残留検出）
          - Decision要否確認ゲート（`agentdev-architecture-advisory` 経由でアーキテクチャ助言サブエージェントへ委譲）
          - アーキテクチャ助言サブエージェントへの入力標準テンプレート使用 + 出力 4 ラベル構造要求（REQ-004-042）。ラベル構造は soft-contract（DEC-003）とし、分類権限は親が保持する
        - 実行主体分類表（REQ-003-007）（委譲契約を定義する場合、実行主体分類表（adapter skill / command / subagent / harness）を必須とする（`docs/designs/workflows/delegation-contracts.md` 参照））。委譲を含まない要件では省略可
        - Test strategy 定義（要件展開内）
          - 各 test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義
          - on_failure（不合格時の処置）を持たない検証項目は test strategy に含めない
          - 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
          - 各項目属性: id（TS-NNN）、target_item（AG-* への参照）、verification、pass_criteria、on_failure
          - on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）の2値
      - Decision判断（`agentdev-decision-guidelines`）
        - 既存Decision重複確認
        - Decision禁止ゲート
        - Decision判断根拠記録
        - 作業手段Decision拒否ゲート
        - Decision 番号指定形式（`new:{topic-slug}` 形式）
      - 要件doc生成（テンプレート: `templates/req-define/req-draft.md`）
        - 定義完全性ゲート（QG-1）
        - operation_units 生成
        - artifact_actions 生成
        - draft-data test_strategy 生成（各項目の5属性をYAML形式で格納）
      - work_type 判定（bugfix/feature/maintenance/docs_chore）
      - Scale判断（featureのみ、`agentdev-workflow-lifecycle`）
        - 実装スコープシグナル確認
      - ドラフト保存（`.agentdev/drafts/req-draft-{topic-slug}.md`）
        - 実装詳細の分離
        - auto_gate完了ゲート（auto_gate.auto_ready:false または未解決項目の残存時、stop_reasons を提示し解消方策を壁打ちで合意）。解消時は auto_ready:true に更新。ユーザーが明示的に false 選択時は conflict_resolutions に記録し継続。未解決のままの場合は壁打ちへ差し戻し
      - 要件doc確認（ユーザー提示のみ、承認は求めない）
        - 複数RU受付、統合/分離判定、出力生成、Epic規模検出、Wave候補記録、OU 構造検証
      - 完了報告（work_type 別テンプレート選択）

      req-define は Workflow Skill と手順番号を複製せず、公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止状態、必須順序、利用 skill 責務によって対応付ける（v2:REQ-0143-005）。
      詳細は `agentdev-command-authoring` Design「command Design と command 定義の対応付け」参照。

      ### tentative_classification 最終確定のバリデーション（現行は REQ-008）

      詳細は references/current-behavior-details.md を参照（遅延読み込み）。
      ### 判断根拠の維持・採用範囲の維持・両経路共通原則（RU-0255）

      壁打ちからドラフト保存、Definition 保存までの各段階で、所有先判断（CREATE、APPEND、UPDATE、REQ操作なし、保留）とその根拠を draft-data（agreed_items、artifact_actions の source_items、conflict_resolutions）を通じて追跡可能に維持する。初期判断と異なる所有先へ保存する場合は再判断の根拠を記録する。判断不能な部分は未解決質問・保留として扱い、無断で解決済みにしない。

      採用済み・未採用・採否不明が混在する入力では、採用根拠照合（STEP-2）の結果に基づき採用された対象・内容・範囲だけを保存対象とする。保存先ファイルへの書込み権限や編集範囲の存在だけを根拠に、採用されていない意味的変更を確定しない。重要変更の反映前通知と結果説明は既存の通知契約（REQ-108）に従う。

      req-define 系経路の所有先判断、採用範囲の維持、保存結果の確認、中断後の再実行は、工程駆動系経路（phase-artifacts-update、REQ-110）に適用されるのと同じ基本原則に基づいて成立させる。両経路の成立は、公開入口から正規保存と保存結果確認までの実経路（GitHub版・Local版の対象経路を含む）で確認し、部品試験だけの成功をもって完了としない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/commands/req-define.md
    target_area: "## トレーサビリティ能力の利用"
    source_items: [AG-004]
    canonical_owner: >-
      req-define command Design（docs/designs/commands/req-define.md）「トレーサビリティ能力の利用」節。
      トレーサビリティの問い合わせ結果と最終判断の確認方法の記述の正である。
    destination_selection_reason: >-
      最終判断の確認に用いる探索の実行主体が探索サブエージェントになった後の姿に既存の記述を整合させるため、同じ節の該当文を更新する。
    change_nature: 既存節内の 1 文の実行主体表現の更新
    req_impact: REQ-004 に行を追加（ACT-REQ-003）
    old_text: >-
      での確認後に下す。
    new_text: >-
      での確認を踏まえて下す。確認に用いる探索は読取専用の探索サブエージェントが実行し、判断主体は対象パスが確定している単一ファイルの限定的確認だけを直接行う（「探索委譲と構造化サマリ受領」節）。
    content: |-
      ## トレーサビリティ能力の利用

      req-define は、既存の明示的な対応関係（`agentdev-traceability` の coverage）と impact を変更影響候補の確認に利用できる（REQ-021-011）。
      あわせて、既存の下流成果物が依拠した上流の状態と現在の上流状態の比較に基づく差分候補を利用できる。取得機構は agentdev-traceability Design「impact 拡張（差分候補）」節を参照する。
      問い合わせ結果は候補提供であり、CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner の最終判断は正規成果物本文と独立探索手段（README 索引、正規成果物の直接読取、`glob`, `grep`, `rg` 等）での確認を踏まえて下す。確認に用いる探索は読取専用の探索サブエージェントが実行し、判断主体は対象パスが確定している単一ファイルの限定的確認だけを直接行う（「探索委譲と構造化サマリ受領」節）。

      - トレーサビリティ情報だけで変更対象、正規所有者、対象範囲を確定しない
      - impact の空結果を「影響なし」の根拠としない
      - 将来作成される実装成果物または検証手段との対応関係を推測して正規情報として保存しない
      - agentdev-traceability の不在、実行失敗、空結果、候補過多だけを理由として workflow を停止しない（fail-open）。独立探索手段で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_area: "## トレーサビリティ能力の利用（QG-4 独立再検査）"
    source_items: [AG-002]
    canonical_owner: >-
      case-close Design（docs/designs/commands/case-close.md）「トレーサビリティ能力の利用（QG-4 独立再検査）」節。
      QG-4 の独立再検査の実行契約の正である。
    destination_selection_reason: >-
      新節「統合・クローズ工程の実作業委譲」で check の実行と証拠の照合を検証サブエージェントへ委譲するため、実行主体を case-close に置いた既存の記述を同じ節で更新する。
      追加だけでは正規文書内で矛盾が残る。
    change_nature: 既存節の実行主体の明記（check の実行と証拠の照合の委譲、観点の評価と確定の保持）
    req_impact: REQ-032 に行を追加（ACT-REQ-002）
    old_text: >-
      から独立して再検査する（REQ-021-018）。
    new_text: >-
      から独立して再検査する。check の実行と証拠と正規成果物との照合は実行担当と独立な検証サブエージェントへ委譲して行い、観点の評価と完了条件チェックボックスの確定は case-close が行う（REQ-021-018、「統合・クローズ工程の実作業委譲」節）。
    content: |-
      ## トレーサビリティ能力の利用（QG-4 独立再検査）

      case-close は QG-4 の一部として、対象要件行の設計根拠対応、implementation 対応、verification 対応の完全性を `agentdev-traceability` の check で対応関係全体（正規成果物の inline declaration と top-level `traceability/` 配下の sidecar を同一に扱う）から独立して再検査する。check の実行と証拠と正規成果物との照合は実行担当と独立な検証サブエージェントへ委譲して行い、観点の評価と完了条件チェックボックスの確定は case-close が行う（REQ-021-018、「統合・クローズ工程の実作業委譲」節）。
      case-run 側の事前検査とは独立に実施する。検証手段との対応関係と「今回その検証を実行して合格したか」という実行結果（Issue, PR, QG の記録）を分離して扱う（REQ-021-019）。

      - 対象要件行に、プロジェクトの採用した工程・成果物規約が要求する設計根拠対応、implementation 対応、または policy が required と判定する要件行の verification 対応の欠落が残る場合はマージせず停止する。Decision 対応の欠落は QG-4 の不合格条件に含めない
      - 不足する対応関係を自動追加または修正せず、検査失敗を case-run 側の修正対象として差し戻せる
      - verification 対応の完全性判定は、project-level verification policy が required と判定する要件行のみを計上する。policy の正規情報源は `traceability/policy.yaml`（既定 required、optional な要件行のみ明示、未指定の要件行は required）であり、policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない
      - QG-4 は対象要件行に必要な設計根拠、実装、検証の対応を確認し、未解決の不合格が 0 件であることを完了条件とする（REQ-021-018/024/025）。全体の対応完全性は診断として扱う（traceability-model Design）。
      - check 自体が正常に完全性を判定できなかった場合（check 実行不能、検査対象の取得不能等）は、対応完全性の合格として扱わず、検査不能の旨を報告してマージに進まない
      - 正規成果物側の実不整合が確認された場合は、既存の品質ゲート, 受け入れ条件に従って fail とする

conflict_resolutions:
  - id: CR-001
    conflict: 入力文面の session_read（OpenCode 固有のツール名）をそのまま要件と Design に書くことと、配布物と Design の harness 非依存性（REQ-011-018、REQ-029-007、harness 分離モデル）が衝突する。
    resolution: >-
      要件行、Design、配布物の本文は「子セッションの生ログ（詳細な実行履歴）」という中立語で規定し、ツール名は AGENTS.md と references/<harness>.md に置く。
      リポジトリ内に session_read の既存記述はなく、変更対象は生じない。
  - id: CR-002
    conflict: 入力文面の「Root は構造化サマリと Issue/PR 状態遷移のみを扱う」と、REQ-003-001（親は進行判断、永続化、外部システム更新、commit、push、merge、ユーザー確認を保持）が字義で衝突する。
    resolution: >-
      委譲するのは調査、検証、修正の実作業だけとし、REQ-003-001 の保持 7 項目と最小限の参照の突合は親に残す。
      要件行と Design はこの範囲で記述する。
  - id: CR-003
    conflict: 完了判定をサマリの受領だけにすると、REQ-032-001（実行の申告だけで達成扱いにしない）と case-close Design「子の判定や要約で独立再検査を代替しない」に反する。
    resolution: >-
      証拠と正規成果物との照合は実行担当と独立な検証サブエージェントが行い、case-close は最小限の参照と正規証拠を突合して判定する。
      完了条件チェックボックスの評価は case-close の専任のままにする。
  - id: CR-004
    conflict: case-close は case-auto からの工程委譲の子セッションであり、case-close からワーカーへの委譲は多重委譲になる一方、書込み許可のある委譲種別は case-auto からの工程委譲に限られる（委譲契約 Design「委譲種別」）。
    resolution: >-
      読取と検証は書き込み禁止型で委譲し、書込みを伴う作業は既存の工程委譲の範囲内で行う。
      起動方法は harness 側の参照に置き、配布 Design には入力、副作用境界、出力契約だけを記す。
  - id: CR-005
    conflict: 既存の調査委譲は判断主体がキーワード抽出と glob/grep 前処理を実施して調査優先対象を作るのに対し、入力は複数の read/grep を伴う作業をすべて委譲する。
    resolution: >-
      前処理も探索サブエージェントへ移し、全件存在確認の機械処理、完全列挙の維持、調査優先対象をヒントとして扱う規律は前処理の実行主体が変わっても維持する。
      実現変更の対象に investigation-scope-refinement.md と wall-methodology.md を含める。
  - id: CR-006
    conflict: 探索サマリの項目と、委譲契約 Design の八項目（実装委譲向けの委譲結果サマリ）の構成が異なる。
    resolution: >-
      探索サマリは判定要約と副作用なしの旨を備えた探索固有の中身とし、実装と検証にだけ該当する項目は省略可として委譲契約 Design の同じ節に定める。
      サイズ上限の正は REQ-125-001 と同節に一元化し、req-define 側は参照する。
  - id: CR-007
    conflict: 生ログの読み戻しの「原則禁止」の例外範囲が、入力にも既存規定にもない。
    resolution: >-
      例外を設けず、子の返却なしに起動不能や破棄を確定する場合は既存契約（委譲契約 Design「親セッション向け委譲結果サマリ」、harness 分離モデルの破棄検知時の状態別回復）に従う。
  - id: CR-008
    conflict: 新節が check の実行と証拠の照合を実行担当と独立な検証サブエージェントが行うと定める一方、case-close Design「トレーサビリティ能力の利用（QG-4 独立再検査）」節と case-close の Workflow Skill の STEP-2 は、その実行主体を case-close に置いたまま残る。
    resolution: >-
      check の実行と証拠と正規成果物との照合は検証サブエージェントへ委譲し、観点の評価と完了条件チェックボックスの確定は case-close が保持する旨を、既存節の更新（ACT-DESIGN-006）と Workflow Skill の実現変更（RA-002）でそろえる。
      追加だけでは正規文書内で矛盾が残るため、既存節を更新する。
  - id: CR-009
    conflict: 探索と前処理の実行主体を探索サブエージェントへ移した後、req-define Design「現在の動作」の前処理の記述と「トレーサビリティ能力の利用」の確認の記述が旧の実行主体のまま残る。
    resolution: >-
      2 箇所の実行主体の記述を新節に合わせて更新する（ACT-DESIGN-004、ACT-DESIGN-005）。
      判断主体は対象パスが確定している単一ファイルの限定的確認だけを直接行う旨を併記する。

operation_units:
  - ou_id: OU-001
    target_req: REQ-125
    target_design: docs/designs/workflows/delegation-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    notes: operation は target_req への REQ 操作を指す。target_design の操作は ACT-DESIGN-001（既存節の更新）。
  - ou_id: OU-002
    target_req: REQ-032
    target_design: docs/designs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    notes: operation は target_req への REQ 操作を指す。target_design の操作は ACT-DESIGN-002（節の追加）と ACT-DESIGN-006（既存節の更新）。
  - ou_id: OU-003
    target_req: REQ-004
    target_design: docs/designs/commands/req-define.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    notes: operation は target_req への REQ 操作を指す。target_design の操作は ACT-DESIGN-003（節の追加）、ACT-DESIGN-004 と ACT-DESIGN-005（既存節の更新）。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      委譲契約 Design の「親セッション向け委譲結果サマリ」節、case-auto の Workflow Skill 本文の共通制約、公開 command の case-auto.md の該当文が、新しい直接実行の上限と委譲対象（複数ファイルの横断読込、広域検索、原因調査、複数ファイルの修正、マージ後検証一式）を含むことを確認する。
      handoff-and-direct-execution-pins.test.ts の固定文言を新基準に更新し、リポジトリルートを cwd として bun test ./src/common/skills/agentdev-workflow-case-auto/scripts/tests/ を実行する。
      変更した配布物の本文に REQ- で始まる識別子と docs/ で始まるパスが含まれないことを検索で確認する（対象は今回変更した配布物だけ）。
    pass_criteria: >-
      3 箇所とも「対象パスが確定している単一ファイルの限定的確認」と「一〜二回の軽量な状態確認コマンド」の上限、5 種の委譲対象、単一ファイルの小規模確認のためには新規サブエージェントを起動しない規律を含む。
      固定文言に REQ-ID と docs/ パスの一致が 0 件。当該テストが合格すること。
    on_failure: >-
      fix-and-reverify。文言と固定文言の不一致は実装の誤りなので、実装を修正して同じ検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: >-
      case-close Design の「統合・クローズ工程の実作業委譲」節と「トレーサビリティ能力の利用（QG-4 独立再検査）」節、case-close の Workflow Skill 本文が、PR 差分確認、コンフリクト調査、テスト再実行、check の実行と証拠照合の読取りと検証の委譲、複数文書の同期を工程委譲の範囲内で case-close が行うこと、観点の評価と完了条件チェックボックスの評価の保持を含むことを確認する。
      リポジトリルートを cwd として bun test ./src/common/skills/agentdev-workflow-case-close/ と bun test ./src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts を実行する。
    pass_criteria: >-
      PR 差分確認、コンフリクト調査、テスト再実行、check の実行と証拠照合の読取りと検証の委譲、複数文書の同期を工程委譲の範囲内で case-close が行うことの区別、完了条件チェックボックスの評価、進行判断、永続化、状態遷移、commit、push、merge の保持が明記されている。
      check の実行や証拠の照合の実行主体を case-close 単独とする記述が Design と Workflow Skill に残っていない。完了判定をサマリ本文だけの根拠で行わない規律が残っている。実行したテストがすべて合格すること。
    on_failure: >-
      fix-and-reverify。実装を修正して同じ検証を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: >-
      委譲契約 Design の「親セッション向け委譲結果サマリ」節と、case-auto と case-close の Workflow Skill 本文が、子セッションの生ログを読み戻さない規律と、サマリ記載の参照と正規証拠との突合による進行判定を含むことを確認する。
      ホスト固有のツール名として session_read と full_session を検索語にして、今回変更した src/common/ 配下と docs/designs/ 配下のファイルだけを検索し、一致がないことを確認する（REQ の定義行は対象外）。
    pass_criteria: >-
      3 文書が両規律を含み、検索語 session_read と full_session の一致が対象ファイルで 0 件であること。
    on_failure: >-
      fix-and-reverify。実装を修正して同じ検証を再実行する。
  - id: TS-004
    target_item: AG-004
    verification: >-
      req-define の公開 command、req-define の Workflow Skill 本文と STEP 参照、req-define-detailed-gates.md、investigation-scope-refinement.md、wall-methodology.md、docs/designs/commands/req-define.md の「探索委譲と構造化サマリ受領」「現在の動作」「トレーサビリティ能力の利用」の各節を読み、探索と影響調査および前処理の読取専用サブエージェントへの委譲、判断主体の直接実行範囲、全件存在確認と完全列挙の維持が明記されていることを確認する。
    pass_criteria: >-
      探索手順を記述する箇所（Design を含む）で実行主体が探索サブエージェントとなり、判断主体が複数の読込や検索を直接実行する記述が残っていないこと。
    on_failure: >-
      fix-and-reverify。実装を修正して同じ検証を再実行する。
  - id: TS-005
    target_item: AG-005
    verification: >-
      探索サマリの項目（判定要約、関連ファイルパスと行・節、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨）と、生の本文全文や大量の検索結果を返却に含めない規律が、req-define Design と req-define 系の配布本文に明記されていることを確認する。
      サイズ上限の数値が req-define 側の本文に複製されていないことを検索で確認する。
    pass_criteria: >-
      項目が過不足なく明記され、req-define 側の本文に KB の数値による上限の再定義がないこと。
    on_failure: >-
      fix-and-reverify。実装を修正して同じ検証を再実行する。
  - id: TS-006
    target_item: AG-006
    verification: >-
      req-define の公開 command と Workflow Skill 本文が、壁打ち、Decision 受理判断、draft 確定の判断主体保持と、draft 保存による独立完了を維持していることを確認する。
      リポジトリルートを cwd として bun test ./src/common/skills/agentdev-adopted-conventions/scripts/tests/execution-connection-pins.test.ts を実行する。
    pass_criteria: >-
      「要件確定のみの単独工程の独立完了」の固定文言が残り、テストが合格すること。
    on_failure: >-
      fix-and-reverify。実装を修正して同じ検証を再実行する。
  - id: TS-007
    target_item: AG-001
    verification: >-
      作業単位 1 と作業単位 2 の変更後に、リポジトリルートを cwd として整合性検査（bun run src/common/skills/repo-agentdev-integrity/scripts/cli.ts）と bun test ./src/ を実行する。
      この項目は AG-001 から AG-005 までに共通する。
    pass_criteria: >-
      整合性検査のエラーが 0 件で、テストがすべて合格すること。
      失敗のうち今回の変更に由来しないものは由来を分類して報告し、無分類の失敗を合格扱いしないこと。
    on_failure: >-
      fix-and-reverify。今回の変更に由来する失敗は実装を修正して再検証する。
      由来が既存の失敗である場合は record-in-findings として Findings に記録する。
  - id: TS-008
    target_item: AG-001
    verification: >-
      トレーサビリティ検査（agentdev-traceability の check スクリプト src/common/skills/agentdev-traceability/scripts/src/check.ts をリポジトリルートに対して実行）を行い、追加した要件行と変更した配布物の対応が component 単位の sidecar（traceability/agentdev-workflow-case-auto.yaml、traceability/agentdev-workflow-case-close.yaml、traceability/agentdev-workflow-req-define.yaml）へ登録されていることを確認する。
      この項目は AG-001 から AG-005 までに共通する。
    pass_criteria: >-
      追加した要件行のうち対応が未登録の行が 0 件で、検査エラーが 0 件であること。
    on_failure: >-
      fix-and-reverify。sidecar の登録を修正して同じ検証を再実行する。

realization_actions:
  - id: RA-001
    concern: case-auto の直接実行の基準の投影更新
    responsibility: >-
      case-auto の Workflow Skill 本文の共通制約にある直接実行の基準を、新しい上限（対象パスが確定している単一ファイルの限定的確認、または一〜二回の軽量な状態確認コマンド）と委譲対象の明記へ更新する。
      公開 command の case-auto.md の該当文を同期し、固定文言を検査する handoff-and-direct-execution-pins.test.ts を新基準へ更新する。
      契約の正は委譲契約 Design「親セッション向け委譲結果サマリ」節であり、配布物には Design 名と節名だけを参照する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md（共通制約の直接実行の基準）
      - src/common/commands/agentdev/case-auto.md（工程・投入境界のハンドオフ節内の投影）
      - src/common/skills/agentdev-workflow-case-auto/scripts/tests/handoff-and-direct-execution-pins.test.ts
      - docs/designs/workflows/delegation-contracts.md「親セッション向け委譲結果サマリ」節（正規所有）
    intent: >-
      親セッションが複数ファイルの読込や調査を直接抱え込むことで進むコンテキスト肥大を抑え、親のコンテキストを進行判断と状態遷移に使う。
    verification_refs: [TS-001, TS-007]
    source_items: [AG-001]
  - id: RA-002
    concern: case-close の実作業委譲と判断主体の保持範囲の明記
    responsibility: >-
      case-close の Workflow Skill 本文に、PR 差分確認、コンフリクト調査、テスト再実行、check の実行と証拠照合の読取りと検証のサブエージェントへの委譲、複数文書の同期を工程委譲の範囲内で case-close が行うこと、読取りと検証の書き込み禁止型の扱い、実行担当と独立な検証サブエージェントによる証拠照合、case-close が保持する完了条件の評価、進行判断、永続化、状態遷移を明記する。
      完了判定をサマリ本文を根拠に行わない既存の規律は維持し、固定文言を検査する process-conformance.test.ts の対象文を更新する。
      Workflow Skill の STEP-2 の証拠照合、トレーサビリティ check の実行と main 側での再実行、退避先の原文と証拠の参照の各記述は、読取りと検証を担当するサブエージェントが行う旨に更新する（観点の評価と完了条件チェックボックスの更新は case-close のままにする）。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/SKILL.md（STEP-2、トレーサビリティ能力の利用の節、委譲結果サマリとゲート確認の退避先参照）
      - src/common/skills/agentdev-workflow-case-close/ 配下の完了判定と検証証拠の参照
      - src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts
      - docs/designs/commands/case-close.md「統合・クローズ工程の実作業委譲」節と「トレーサビリティ能力の利用（QG-4 独立再検査）」節（正規所有）
    intent: >-
      クローズ工程のセッションが実作業を単独で抱え込むことで生じる読込と検証の集中をなくし、完了判定の根拠を正規証拠との照合に保つ。
    verification_refs: [TS-002, TS-007]
    source_items: [AG-002]
  - id: RA-003
    concern: 子セッションの生ログの読み戻し抑止の明記
    responsibility: >-
      case-auto と case-close の Workflow Skill 本文に、子セッションの生ログを読み戻さない規律と、サマリ記載の参照と正規証拠との突合による進行判定を明記する。
      ホスト固有のツール名は配布物の本文に書かず、harness 側の参照（AGENTS.md、references/<harness>.md）に置く。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-auto/SKILL.md（親コンテキスト非累積の共通制約）
      - src/common/skills/agentdev-workflow-case-close/SKILL.md（委譲結果サマリとゲート確認）
      - docs/designs/workflows/delegation-contracts.md「親セッション向け委譲結果サマリ」節（正規所有）
    intent: >-
      ゲート判定のために親が子の詳細な実行履歴を取り込み直すことによるコンテキスト消費をなくし、判定の根拠をサマリ記載の参照に限定する。
    verification_refs: [TS-003, TS-007]
    source_items: [AG-003]
  - id: RA-004
    concern: req-define の探索と影響調査および前処理の探索サブエージェントへの委譲の明記
    responsibility: >-
      req-define の公開 command の不変条件、req-define の Workflow Skill 本文と STEP 参照、req-define-detailed-gates.md の変更影響候補抽出、investigation-scope-refinement.md と wall-methodology.md の調査委譲の手順を、判断主体が複数の読込や検索を直接実行せず読取専用の探索サブエージェントへ委譲する手順へ更新する。
      キーワード抽出とファイル列挙・検索の前処理も探索サブエージェントが実行し、全件存在確認の機械処理、完全列挙の維持、調査優先対象をヒントとして扱う規律、全文の機械抽出の規律は維持する。
      判断主体は対象パスが確定している単一ファイルの限定的確認だけを直接実行する。
    ownership_hints:
      - src/common/commands/agentdev/req-define.md
      - src/common/skills/agentdev-workflow-req-define/SKILL.md と references/input-and-dialogue.md、references/requirement-development.md
      - src/common/skills/agentdev-req-analysis/references/req-define-detailed-gates.md
      - src/common/skills/agentdev-req-analysis/references/investigation-scope-refinement.md
      - src/common/skills/agentdev-req-analysis/references/wall-methodology.md
      - docs/designs/commands/req-define.md「探索委譲と構造化サマリ受領」節（正規所有）
    intent: >-
      上流工程のセッションが探索のために多数のファイルを読み込むことで消費されるコンテキストを探索サブエージェントへ移し、判断主体のコンテキストを壁打ちと要件の確定に使う。
    verification_refs: [TS-004, TS-007]
    source_items: [AG-004]
  - id: RA-005
    concern: 探索サマリの返却契約の明記
    responsibility: >-
      探索サブエージェントの返却を、判定要約、関連ファイルパス（行・節を含む）、正規所有責務、制約と矛盾点、変更候補、未確認事項、副作用なしの旨に限定した構造化サマリにする返却契約を、req-define の Workflow Skill と agentdev-req-analysis の references に明記する。
      上限の数値は委譲契約 Design を参照し、配布物の本文には REQ-ID を書かない。
      生の本文全文や大量の検索結果を判断主体の会話コンテキストへ持ち込まない規律と、判断に必要な単一ファイルの限定的確認だけを判断主体が直接行う境界を併記する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-req-define/SKILL.md と references/input-and-dialogue.md、references/requirement-development.md
      - src/common/skills/agentdev-req-analysis/references/req-define-detailed-gates.md
      - src/common/skills/agentdev-req-analysis/references/investigation-scope-refinement.md
      - docs/designs/commands/req-define.md「探索委譲と構造化サマリ受領」節（正規所有）
    intent: >-
      探索結果の受け取りで判断主体のコンテキストが再び膨らむことを防ぎ、後続の判断に必要な参照だけを受け取る。
    verification_refs: [TS-005, TS-007]
    source_items: [AG-005]
  - id: RA-006
    concern: 判断主体の保持範囲と独立完了の維持の明記
    responsibility: >-
      req-define の公開 command と Workflow Skill 本文に、壁打ち対話、要件そのものの人間判断、Decision 受理判断、最終的な req-draft の確認と保存が判断主体に残ることと、draft 保存をもって独立して完了する既存契約を変えないことを、探索委譲の境界として明記する。
      要件行の新設と変更は行わない。
    ownership_hints:
      - src/common/commands/agentdev/req-define.md（不変条件）
      - src/common/skills/agentdev-workflow-req-define/SKILL.md
      - src/common/skills/agentdev-adopted-conventions/scripts/tests/execution-connection-pins.test.ts
    intent: >-
      探索の委譲によって要件の人間判断と draft 確定の責任が曖昧にならず、要件確定のみを求めた利用者が後続の実装を要求されない。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-007
    concern: トレーサビリティ sidecar への対応宣言の登録
    responsibility: >-
      追加した要件行と変更した配布物の対応を、component 単位の sidecar へ登録する。
      配布物の本文に REQ-ID や docs/ への参照を書かず、対応は sidecar だけに持たせる。
    ownership_hints:
      - traceability/agentdev-workflow-case-auto.yaml
      - traceability/agentdev-workflow-case-close.yaml
      - traceability/agentdev-workflow-req-define.yaml
      - src/common/skills/agentdev-traceability/scripts/src/check.ts（検証）
    intent: >-
      新しい要件行の実装対応と検証対応をトレーサビリティ検査で追跡できるようにする。
    verification_refs: [TS-008]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]

review_dispositions:
  - id: RD-001
    source_item: req-input-adf-root-delegation-and-reqdef-offload-20261128.md#item-3
    disposition: rejected
    reason_code: out_of_scope
    reason: >-
      入力の項目 3（agentdev_gh とセッション履歴の読取り手段の重複の最適化）は、本要件と Headroom 導入の効果測定後に再評価するという入力の記載どおり対象外とする。
      生ログを読み戻さない規律（AG-003）によって本要件の目的は成立する。
    evidence:
      path: C:\Users\ogatay\work\hermes-vault\project-list\req-input-adf-root-delegation-and-reqdef-offload-20261128.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: req-input-adf-root-delegation-and-reqdef-offload-20261128.md#related-req-REQ-033
    disposition: not_applicable
    reason_code: stale_target
    reason: >-
      入力の関連 REQ 一覧に挙がっている REQ-033 は現行の REQ 番号空間に存在しない。
      要件内容には影響せず、照合対象から外した。
    evidence:
      path: docs/requirements/README.md
      section: 現行要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: req-input-adf-root-delegation-and-reqdef-offload-20261128.md#unit-2-spec-3
    disposition: covered
    reason_code: already_satisfied
    reason: >-
      作業単位 2 の仕様 3（判断主体が壁打ち、Decision 受理判断、draft 確定を保持し、draft 保存で独立完了する）は、既存の要件行（REQ-003-001、REQ-096-024、REQ-034-038、REQ-108-025、REQ-004-064）と req-define の公開 command が既に所有する。
      要件行を追加せず、探索委譲の境界としての明記（RA-006）だけを行う。
    evidence:
      path: docs/requirements/REQ-108.md
      section: REQ-108-025
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - action_id: ACT-DESIGN-001
    target_file: docs/designs/workflows/delegation-contracts.md
    target_content_sha256: 23e9d71f5ff37ca08c0e731d06ab7b93451723e800c94d7fc22cafa0c5ae763d
    check_scope:
      heading: "## 親セッション向け委譲結果サマリ"
      start_line: 98
      end_line: 112
    execution_conditions:
      operation: replace
      edit_sha256: b1ae35d0f837719b5d6f261266809400c6babe6b24c3a659a10d71e065dada84
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 5
      added: 5
      removed: 1
    executed_at: "2026-11-28T15:20:56.944Z"
  - action_id: ACT-DESIGN-002
    target_file: docs/designs/commands/case-close.md
    target_content_sha256: a85c70e89bdedd7d3404bf8e44a9cbe345be3fa17018d9f708dcc6e4f29dac99
    check_scope:
      heading: "## 完了判定と委譲結果サマリ"
      start_line: 56
      end_line: 59
    execution_conditions:
      operation: append
      edit_sha256: 348daff00b0f8565e33610142ad3cbfe989080e66d5eb4085adea576807c9feb
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 18
      added: 18
      removed: 0
    executed_at: "2026-11-28T15:45:16.792Z"
  - action_id: ACT-DESIGN-003
    target_file: docs/designs/commands/req-define.md
    target_content_sha256: e978ec6deb82cf4c0dee47f1abc38cb37d78fa996640d5d7116480404eae46f1
    check_scope:
      heading: "## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化"
      start_line: 128
      end_line: 130
    execution_conditions:
      operation: append
      edit_sha256: 794d1caeaf3fbd685550e02a1c90a297e1113774d9ab61f87cbbb93d524bd316
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 18
      added: 18
      removed: 0
    executed_at: "2026-11-28T15:21:08.711Z"
  - action_id: ACT-DESIGN-004
    target_file: docs/designs/commands/req-define.md
    target_content_sha256: e978ec6deb82cf4c0dee47f1abc38cb37d78fa996640d5d7116480404eae46f1
    check_scope:
      heading: "## 現在の動作"
      start_line: 58
      end_line: 124
    execution_conditions:
      operation: replace
      edit_sha256: d76e38eed952c320e42c9b422f4fd464e5f04b104139058c3ea821e259e42b57
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-28T15:45:58.566Z"
  - action_id: ACT-DESIGN-005
    target_file: docs/designs/commands/req-define.md
    target_content_sha256: e978ec6deb82cf4c0dee47f1abc38cb37d78fa996640d5d7116480404eae46f1
    check_scope:
      heading: "## トレーサビリティ能力の利用"
      start_line: 155
      end_line: 165
    execution_conditions:
      operation: replace
      edit_sha256: f54501eb75863780d5186c0f363f107c209989a1410cc9aad55ae023e92ef158
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-28T15:45:36.037Z"
  - action_id: ACT-DESIGN-006
    target_file: docs/designs/commands/case-close.md
    target_content_sha256: a85c70e89bdedd7d3404bf8e44a9cbe345be3fa17018d9f708dcc6e4f29dac99
    check_scope:
      heading: "## トレーサビリティ能力の利用（QG-4 独立再検査）"
      start_line: 123
      end_line: 134
    execution_conditions:
      operation: replace
      edit_sha256: 244c50e4c57a7fd35c9fa279175ee90e1713295e87d6a54fe70e100673ec876a
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: "2026-11-28T15:45:36.040Z"

case_open_hints:
  epic_needed: true
  decomposition: >-
    作業単位 1（下流 Root）は ACT-REQ-001、ACT-REQ-002、ACT-DESIGN-001、ACT-DESIGN-002、ACT-DESIGN-006 と RA-001 から RA-003、RA-007 のうち case-auto と case-close の sidecar。
    作業単位 2（req-define）は ACT-REQ-003、ACT-DESIGN-003、ACT-DESIGN-004、ACT-DESIGN-005 と RA-004 から RA-006、RA-007 のうち req-define の sidecar。
    2 つの作業単位は入力が指定した分解であり、実装ファイルは重ならない。
  wave_hints:
    - 両作業単位は実装ファイルが重ならず並列実行できる。委譲契約 Design の更新（ACT-DESIGN-001）は両作業単位の前提であり、Definition 保存で先に確定する。
```

# summary

入力は `C:\Users\ogatay\work\hermes-vault\project-list\req-input-adf-root-delegation-and-reqdef-offload-20261128.md`（参照専用）。内容は確定済みのため壁打ち質問は行っていない。

## 合意内容の補足

- 作業単位 1（下流 Root の薄い司令塔化）: AG-001 から AG-003。REQ-125 に 2 行追加、REQ-032 に 1 行追加、委譲契約 Design の「親セッション向け委譲結果サマリ」節を更新、case-close Design に節を追加。
- 作業単位 2（req-define の調査の外出し）: AG-004 から AG-006。REQ-004 に 2 行追加、req-define Design に節を追加。判断主体の保持と独立完了は既存行が所有するため要件行の追加はない。
- 適用範囲: AG-007。入力の項目 3 とホスト側の設定変更は対象外。

## Decision 判断

- 判断結果： Decision の新設なし。
- 適用基準： Decision を作成しない条件のうち、command 動作仕様、workflow 定義、既存文書種別への適合に該当する。技術選択を含まず、正規成果物のテキスト変更で逆転できる。
- 根拠事実： REQ-125 に対応する Decision はない。既存の DEC-008、DEC-042、DEC-048、DEC-055 は本要件と矛盾せず、並列実行の維持、人間判断の境界、単独工程の独立完了を本要件も守る。
- 再検討条件： 全コマンド共通の運用原則へ一般化する場合は Decision が必要か再評価する。

## Scale 判断

- work_type: feature（既存 workflow の動作仕様を変え、要件行を追加する）。
- scale: large（複数の REQ にまたがり、影響ファイル数が 10 を超える）。分解は入力の 2 作業単位に従う。

## 既存 REQ 照合の結果

- REQ-125（8 行）、REQ-032（47 行）、REQ-004（74 行）はいずれも目的の連続性があり、既存行の変更ではなく行の追加で足りる。SPLIT の必要はない。
- 入力の関連 REQ 一覧の REQ-033 は現行に存在しない。
