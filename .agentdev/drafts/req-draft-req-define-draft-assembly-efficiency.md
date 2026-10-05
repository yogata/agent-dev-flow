---
draft_type: req_draft
topic_slug: req-define-draft-assembly-efficiency
status: draft
created_at: 2026-10-05T19:15:00+09:00
source_rus:
  - RU-20261005-01
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |-
  req-define の調査、要件ドラフト生成、修正、検証と、その後の Definition 適用について、既存本文の複写や決定済み変更の反映をモデルが繰り返し生成する負担を減らす。変更の意味判断はモデルが担当し、原文の保持、確定した変更の組立、構造検査は決定的処理が担当する。現行の要件ドラフト形式と保存対象本文（draft-data スキーマ、ドラフト種別、artifact_actions 形式）は維持し、意味レビュー、合意への忠実性照合、適用時の原文照合を省略しない。工程スコープシグナル（影響ファイル数10超: REQ・Design 3件・配布 skill 参照資料群・スクリプト）により scale: large とする。RU-20261005-01 の採番方式（RU-YYYYMMDD-01）と artifact-contracts.md / REQ-008-055 の旧採番規定（RU-NNNN／最大番号+1）には差異があり、採番規定の修正は本件の対象外とする（差異の明記のみ行う）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      調査結果は原文参照、判断、差異、根拠箇所を分離する。原文は既存ファイルへの参照で済む場合に複製しない。完全な原文と生成本文は後続担当が実際に読める状態を保ち、取得不能・切断・文字化けを成功扱いしない。調査委譲の指示は既存本文や全索引の大量逐語再出力を要求しない。
  - id: AG-002
    content: |-
      全件の存在確認は機械処理で保持し、詳細調査は意味判断に必要な対象へ集中する。優先対象だけの閉じた検索にはせず、直接参照・依存・矛盾候補を追加探索する。キーワード不一致だけを根拠に調査対象外を確定しない。
  - id: AG-003
    content: |-
      局所修正ではモデルが対象セクション、旧文、新文、変更理由、保持すべき意味を確定し、決定的処理が対象の一意性と旧文の期待件数を確認して組み立てる。追記ではモデルが新文と位置を確定し、決定的処理が原文を保持して挿入する。全面改稿・新規文書はモデルの本文生成を許し、共通の形式・参照・差分検査を適用する。対象セクション不在・複数一致、旧文不在・期待件数不一致、誤った追記位置を受理しない。類似する別見出しを前方一致で選ばない。
  - id: AG-004
    content: |-
      組立結果は現行ドラフト形式の完全な content として生成先へ保存する。戻り値は所在、処理操作、成功・失敗、一致件数、置換件数、検査結果、判断が必要な差分・異常を中心とし、変更しない本文の大量再出力を既定にしない。複写をやめても、レビュー担当が全文・周辺文脈を取得できることは維持する。
  - id: AG-005
    content: |-
      検査順序を「構造・変更前提の検査 → 組立 → 指定外変更・欠落・保存完結性の検査 → 意味レビュー → 指摘反映と影響範囲の再評価」とする。構造検査だけで意味レビュー完了としない。修正後は依存する判断まで再評価し、影響範囲を特定できない場合は広く確認する。
  - id: AG-006
    content: |-
      検査結果は対象内容・版、評価範囲、実行条件を識別できる証拠として保持する。同じ結果を読み直すためだけに処理を再実行しない。前提変更時は影響する検査・判断を無効化して再実行し、影響しない証拠まで一律に破棄しない。証拠は永続状態から再構成できる形で保持し、再開時に依存できない一時結果で再開を成立させない。
  - id: AG-007
    content: |-
      適用直前に、組立時に使用した対象セクションと適用先の現状を照合する。一致なら適用し、不一致なら古い全文で上書きせず差異を示して影響する変更・判断を再確認する。無関係なリポジトリ全体の版変更だけで全件を無効化しないが、判断根拠の契約変更は本文一致とは別に再評価する。
  - id: AG-008
    content: |-
      作業ファイルを作らないメモリ内処理を優先する。固定の組立・検査処理を毎回モデルに作成・修復させず、既存の担当スキルの処理として再利用する。必要な一時領域と正式成果物の書込み権限を区別し、req-define の書込み制約と整合させる。正常終了時の削除と中断時の扱いを定め、検証前に検証用処理を消さない。
  - id: AG-009
    content: |-
      前述の規律を実際の委譲指示・生成・検査・保存・適用へ接続する。該当するコマンド、スキル、テンプレート、参照資料を横断して整合させる。新しい形式の全文コピーを別の報告や中間成果物へ付け替えて削減と扱わない。
  - id: AG-010
    content: |-
      品質成立を確認した後、同じ入力・同じ原文状態で生成量、応答回数、修復回数、経過時間を比較する。変更前後の全文、合意の意味、検出結果を突き合わせる。中断・承認待ち・通信等の未分類時間を純粋な推論時間と断定しない。後続工程の実測で全文再生成・重複読込が支配的に残るなら、変更内容中心の正式形式への移行を別途提案する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      | REQ-004-056 | req-define の調査委譲は、既存本文や全索引の大量逐語再出力を委譲指示で要求しないこと。調査結果は原文参照と判断結果を分離し、原文と必要な周辺文脈を後続担当が実際に読める状態で引き継ぎ、取得不能、切断、文字化けを成功として扱わないこと |
      | REQ-004-057 | 全件の存在確認は機械処理として維持し、詳細な意味調査は判断に必要な対象へ集中すること。完全列挙をキーワード検索で代替せず、直接参照、依存、矛盾候補からの追加探索を妨げないこと |
      | REQ-004-058 | 局所修正・追記のドラフト本文（artifact_actions の content を含む）は、モデルが確定した対象セクション、旧文、新文、追記位置を入力として決定的処理が既存原文から組み立てることで生成でき、組立前の構造・変更前提検査と組立後の差分・完結性検査を意味レビューより前に実行すること。対象セクション不在・複数一致、旧文不在・期待件数不一致、誤った追記位置を受理しないこと |
      | REQ-004-059 | 組立処理の戻り値は所在、処理操作、成功・失敗、一致件数、置換件数、検査結果、判断が必要な差分・異常を中心とし、変更しない本文の大量再出力を既定としないこと。レビュー担当が必要に応じ全文・周辺文脈を取得できることは維持すること |
      | REQ-004-060 | 組立・検査の結果は対象内容・版、評価範囲、実行条件を識別できる証拠として保持し、同じ結果を確認するためだけに処理を再実行しないこと。前提が変わった場合は影響する検査・判断を再評価し、永続状態から再構成できない結果に依存して再開を成立させないこと |
      | REQ-004-061 | Definition 適用直前に、組立時に使用した対象セクションと適用先の現状を照合すること。一致する場合のみ適用し、不一致の場合は差異を示して影響する変更・判断を再確認させ、古い本文で新しい編集を上書きしないこと |
      | REQ-004-062 | 組立・検査の固定処理を実行ごとにモデルへ新規生成・修復させないこと。既存の担当スキル・処理を再利用し、欠ける処理だけを正規の所有先へ追加すること |
      | REQ-004-063 | 組立・検査作業の一時的な作業領域と正式ドラフトの配置・権限・寿命を分離すること。`.agentdev/drafts/` には登録済みドラフトだけを配置し、正常終了時に一時領域を片付け、検証前に検証用処理を削除しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/req-define.md
    target_area: "## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化"
    canonical_owner: "req-define Design（docs/designs/commands/req-define.md）"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-008, AG-009]
    content: |
      ## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化

      req-define の調査・要件doc生成は、機械的取得と安全な書込みを前提とする規律に従う。具体的なツール名、シェル、起動 API は実行基盤側の操作規律に配置し、本 Design と配布 skill に固定しない（REQ-011-018）。

      - 全文は既存の機械的手段で抽出し、モデルに逐語再生成させない。取得物への参照と、モデルによる判断・要約を分ける
      - 取得物を後続担当が実際に読める形で引き継ぐ。取得不能、切断、文字化けを完全な抽出として扱わず、参照不能を黙過しない
      - 対象ファイルの完全列挙を維持する。調査優先対象はヒントであり、対象範囲を制限する条件にしない（調査スコープ洗練手順の既存規律を維持）
      - 実行基盤が提供する安全な書込み手段を優先し、長大なシェル入力による切断を避ける。書込み後は内容の完結性を確認する（既存の読み戻し可能確認を維持）
      - 独立した調査・評価だけ並列化する。調査結果を入力とする評価は必要な結果の確定を待つ。抽出・書込み等の前提が満たせない状態を対象なし、成功、評価不要として扱わない

      調査委譲の指示と結果、組立・検査の規律は次のとおり。

      - 調査委譲の指示は既存本文・全索引の大量逐語再出力を要求しない。調査結果は原文参照（パス・範囲）と判断結果（判定、差異、根拠箇所）を分離して返し、原文と必要な周辺文脈を後続担当が実際に読める形で引き継ぐ（REQ-003-004 の判定結果圧縮原則の適用）
      - 局所修正・追記のドラフト本文の組立は、モデルが対象セクション、旧文、新文、変更理由、保持すべき意味、追記位置を確定し、決定的処理が対象の一意性と旧文の期待件数を確認して既存原文から組み立てる。全面改稿・新規文書はモデルの本文生成を許し、共通の形式・参照・差分検査を適用する。見出しの一致判定は完全一致のみとし、類似する別見出しを前方一致で選ばない
      - 検査順序は「構造・変更前提の検査 → 組立 → 指定外変更・欠落・保存完結性の検査 → 意味レビュー → 指摘反映と影響範囲の再評価」とする。構造検査だけで意味レビュー完了としない
      - 組立・検査の戻り値は所在、処理操作、成功・失敗、一致件数、置換件数、検査結果、判断が必要な差分・異常を中心とし、変更しない本文の大量再出力を既定としない。レビュー担当が必要に応じ全文・周辺文脈を取得できることを維持する
      - 組立・検査の結果は対象内容・版、評価範囲、実行条件を識別できる証拠として保持し、同じ結果の読み直しのために処理を再実行しない。前提変更時は影響する検査・判断を無効化して再実行し、影響しない証拠まで一律に破棄しない。証拠は永続状態から再構成できる形で保持し、再開時に依存できない一時結果で再開を成立させない（DEC-011 準拠）
      - 固定の組立・検査処理は実行ごとにモデルへ新規生成・修復させず、既存の担当スキル・処理として再利用する。欠ける処理だけを正規の所有先へ追加する
      - 一時的な作業領域は正式ドラフトと配置・権限・寿命を分離する。`.agentdev/drafts/` には登録済みドラフトだけを配置し（REQ-008 のドラフト種別契約の維持）、作業用途のスクリプト・抽出本文・検査用データを残置しない。正常終了時に一時領域を片付け、検証前に検証用処理を削除しない
      - Definition 適用直前の対象セクション照合の契約は case-ready Design「Definition 適用直前の対象セクション照合」節が所有する
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/responsibilities/artifact-contracts.md
    target_area: "### 作業用途ファイルの分離（組立・検査の一時領域）"
    anchor: "### ドラフト種別レジストリ（Draft Type Registry）"
    placement: before_anchor
    canonical_owner: "アーティファクト契約（docs/designs/responsibilities/artifact-contracts.md）"
    source_items: [AG-008]
    content: |
      ### 作業用途ファイルの分離（組立・検査の一時領域）

      req-define の組立・検査作業の中間生成物（抽出本文、組立部品、検査用データ、実行ごとの専用スクリプト）は正規ドラフトではない。`.agentdev/drafts/` にはドラフト種別レジストリに登録されたドラフトだけを配置し、作業用途のファイルを配置しない。一時領域の配置先・権限・寿命の規律は req-define command Design（「調査委譲の全文機械抽出・安全な書込み・独立作業の並列化」節）が所有し、正常終了時に削除し、中断時の扱いは同 Design に従う。組立入力を新しい正式ハンドオフ種別へ昇格させない（局所修正・追記の組立入力はドラフト種別の変更としない）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/case-ready.md
    target_area: "## Definition 適用直前の対象セクション照合"
    anchor: "## 受け入れ義務の実行構成への投影完全性（REQ-061-041/042、REQ-017-021〜023、RU-20261004-08）"
    placement: tail
    canonical_owner: "case-ready Design（docs/designs/commands/case-ready.md）"
    source_items: [AG-007]
    content: |
      ## Definition 適用直前の対象セクション照合

      Definition 保存内部責務（case-ready / case-revise）は、draft の artifact_actions（append / update）を適用する直前に、組立時に使用した対象セクション・anchor・旧文と適用先の現状を照合する。

      - 一致する場合のみ適用する。不一致の場合は古い全文で新しい編集を上書きせず、差異を示して影響する変更・判断を再確認させる
      - 対象外のリポジトリ全体の版変更だけで全件を無効化しない。判断根拠となった契約（REQ・Design・Decision）の変更は本文一致とは別に再評価する
      - 見出しの一致判定は完全一致のみとし、前方一致で類似する別見出しを選ばない（target-area-matching の規律と一致）

conflict_resolutions:
  - id: CR-001
    conflict: |-
      新行の REQ 帰属（REQ-004 vs REQ-008 vs REQ-003）。REQ-008 はドラフト種別・配置・構造化契約を、REQ-003-004 は委譲の成果物本文 verbatim・判定結果圧縮の共通原則を所有する。また新行と REQ-008-061（表列・見出し構造の実ファイル突合義務）の重複懸念がある。
    resolution: |-
      req-define プロセスと Definition 保存内部責務の横断基本契約を所有する REQ-004 へ APPEND する（適用範囲の一致）。REQ-008（ドラフト形式）は対象外どおり変更せず、REQ-003-004 は共通原則として既存のまま参照する。v4-delegation-contracts への共通契約追加は見送り、他の委譲種別で同一失敗が観測された時点の別変更とする（アーキテクチャ助言の採用）。新行（REQ-004-058〜060）は組立の決定性・検査順序・証拠再利用という新規判定基準に限定し、REQ-008-061 の内容適合義務と重複しない。
  - id: CR-002
    conflict: |-
      組立の決定的処理化と検査結果の再利用は、DEC-003（req_draft soft-contract）、DEC-011（STEP resume point と会話記憶非依存）、DEC-048（判断方法3分類）と衝突するか。Decision 作成に相当するか。
    resolution: |-
      Decision は作成しない。DEC-003（スキーマ検証を導入せず soft-contract 維持）、DEC-011（証拠の永続状態互換を REQ-004-060 と Design 本文に明記）、DEC-048・判断方法3分類（ファイル変換・組立は決定的処理への正規移行、意味レビューは意味判断として残存）の枠内変更であり、重複確認・禁止ゲートを通過した。
  - id: CR-003
    conflict: |-
      target-area-matching.md（agentdev-design-file-manager 参照資料）には前方一致の記述が残るが、正規 Design と実装（search-target-area.ts）は完全一致のみである。
    resolution: |-
      今回の関連指示是正に含め、古い資料に合わせて判定を緩めない（RA-004 で target-area-matching.md を完全一致へ是正し、実装の findTargetAreaHeadings / headingMatchesTarget と整合させる）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20261005-01
    target_req: REQ-004
    target_design: docs/designs/commands/req-define.md
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      実運用の調査委譲指示と結果を確認する（既存本文・全索引の大量逐語再出力を要求しない、原文参照と判断結果の分離、後続担当の原文取得可能性）。取得不能・切断・文字化けの異常系の扱いを確認する。
    pass_criteria: |-
      大量逐語再出力の要求がなく、原文と必要な周辺文脈を後続担当が取得できる。異常系が成功扱いになっていない。
    on_failure: |-
      fix-and-reverify: 委譲指示と結果検証の実装不良に起因するため修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      完全列挙の維持と、直接参照・依存・矛盾候補からの追加探索が行われることを実運用で確認する。
    pass_criteria: |-
      キーワード不一致だけを根拠に調査対象外が確定されていない。優先対象だけの閉じた検索になっていない。
    on_failure: |-
      fix-and-reverify: 調査手順の実装不良に起因するため修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      局所修正と追記の正常系で、既存原文からの機械的保持・確定した変更のみの適用・現行形式の完全 content 生成を確認する。対象セクション不在・複数一致、旧文不在・期待件数不一致、誤った追記位置の各異常系で不受理を確認する。全面改稿・新規文書の生成が妨げられないことを確認する。
    pass_criteria: |-
      異常系がすべて不受理となる。類似する別見出しを前方一致で選んでいない。
    on_failure: |-
      fix-and-reverify: 組立処理の実装不良に起因するため修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      組立前の構造・変更前提検査と組立後の差分・完結性検査が意味レビューより前に実行されることを確認する。戻り値が所在・操作・成否・一致件数・置換件数・検査結果・差分中心であることを確認する。指定外変更、欠落、切断、文字化けを検出した候補がレビュー・適用へ進まないことを確認する。
    pass_criteria: |-
      変更しない全文の再出力が既定になっておらず、検出候補が合格扱いになっていない。レビュー担当が全文・周辺文脈を取得できる経路が維持されている。
    on_failure: |-
      fix-and-reverify: 検査順序と戻り値の実装不良に起因するため修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      意味レビューで元の合意、禁止事項、対象外、受け入れ条件の保持確認が行われること、修正後に依存する判断まで再評価されることを確認する。影響範囲不明時の挙動を確認する。
    pass_criteria: |-
      構造検査の成功が意味レビュー成功へ置き換わっていない。影響範囲不明時に都合よく確認を省略していない。
    on_failure: |-
      fix-and-reverify: レビュー手順の実装不良に起因するため修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |-
      内容・版・評価範囲・実行条件が同じ結果の再表示・再解析で検査を再実行しないことを確認する。前提変更時の影響する検査・判断の無効化・再実行と、影響しない証拠の保持を確認する。中断再開時に永続状態から再構成できることを確認する。
    pass_criteria: |-
      同一結果の読み直しだけで再実行が行われない。旧結果で進行・終了が許可されない。一時結果への依存で再開が成立しない。
    on_failure: |-
      fix-and-reverify: 証拠保持の実装不良に起因するため修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |-
      実際の Definition 適用経路で、対象セクションが生成時と一致する正常系は適用を許可し、不一致の異常系は書込み前に停止することを確認する。判断根拠の契約変更時の再評価を確認する。
    pass_criteria: |-
      古い本文で新しい編集を上書きしていない。対象外の変更だけによる一律無効化が行われておらず、判断根拠の契約変更は別に再評価されている。
    on_failure: |-
      fix-and-reverify: 適用直前照合の実装不良に起因するため修正して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |-
      実行ごとに大きな専用組立・修復・検査スクリプトをモデルが新規生成する経路が既定でないことを確認する。`.agentdev/drafts/` に登録済みドラフトだけが配置されていることを確認する。承認済み一時領域の権限と寿命、正常終了時の削除と中断時の扱いを確認する。
    pass_criteria: |-
      作業用途ファイル（スクリプト、抽出本文、検査用 JSON 等）が drafts に残らない。任意の書込み許可・ガード迂回が追加されていない。検証前に検証用処理が削除されない。
    on_failure: |-
      fix-and-reverify: 一時領域管理の実装不良に起因するため修正して再検証する。
  - id: TS-009
    target_item: AG-009
    verification: |-
      修正対象ファイル集合（req-define command Design、artifact-contracts、case-ready Design、agentdev-req-analysis / agentdev-workflow-req-define / agentdev-design-file-manager / agentdev-workflow-case-open の参照資料とスクリプト）に対し、全文再出力の要求・前方一致等の古い指示の残存を rg で検索する。See Also 等の参照行は検出対象外とする。共通処理の呼出接続と拒否時の進行抑止を確認する。
    pass_criteria: |-
      古い指示が残らず、規律の記述だけでなく実際の共通処理の呼出接続と拒否時の進行抑止が実装されている。
    on_failure: |-
      fix-and-reverify: 配布物横断の整合不備に起因するため修正して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |-
      同じ入力、原文状態、作業範囲、受け入れ条件で改善前後を比較する。元の合意の保持、指定外変更なし、異常系の拒否、必要な意味レビューの実行を先に確認し、生成量、応答回数、修復回数、経過時間を実測する。中断・承認待ち・通信等の未分類時間を純粋な推論時間と断定しない。
    pass_criteria: |-
      品質が同等であることを先に確認した上で、不要な複写・修復の削減が実行証跡から確認できる。モデル差や処理範囲縮小だけで効果を説明していない。
    on_failure: |-
      record-in-findings: 残る後続工程の負担と未検証事項は報告に記録し、変更内容中心の正式形式への移行は別途提案するため（固定の短縮率・完了時間保証を要件に追加しない）。

realization_actions:
  - id: RA-001
    concern: 組立・検査の固定処理の実装（決定的組立と組立前後検査）
    responsibility: |-
      局所修正・追記の決定的組立（対象一意性・旧文期待件数の確認、原文保持の挿入）と、組立前後の構造・差分・完結性検査、戻り値契約（所在・操作・成否・一致件数・置換件数・検査結果・差分中心）を実装する。既存の見出し検索（search-target-area.ts 系）を再利用し、配置は agentdev-workflow-req-define 配下とする（consumer でも利用可能な分布境界）。実行ごとの専用スクリプト生成を既定にしない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-req-define/scripts/（新規組立・検査処理の配置先候補）"
      - "src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts（見出し検索の再利用）"
      - "agentdev-artifact-validation（文書種別横断の決定的検証 script の共有 lib。不足処理の追加先候補）"
    intent: |-
      原文の機械的保持と確定した変更だけの適用により、モデルが繰り返し生成する本文複写を削減する。
    verification_refs: [TS-003, TS-004, TS-008]
    source_items: [AG-003, AG-004, AG-008]
  - id: RA-002
    concern: 調査委譲指示の更新（agentdev-req-analysis 参照資料）
    responsibility: |-
      investigation-scope-refinement.md 等の調査参照資料を、原文参照と判断結果の分離・大量逐語再出力禁止の指示へ更新する。全件存在確認の機械処理維持と追加探索（直接参照・依存・矛盾候補）の手順を整理する。
    ownership_hints:
      - "src/common/skills/agentdev-req-analysis/references/investigation-scope-refinement.md"
    intent: |-
      委譲でのモデル経由本文量と応答回数を削減する。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-003
    concern: workflow 参照資料の更新（生成・検査・レビュー手順の接続）
    responsibility: |-
      draft-generation.md と adversarial-review-integration.md に、検査順序（構造 → 組立 → 差分 → 意味レビュー → 再評価）、戻り値契約、検査結果の証拠保持・再利用を接続する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-req-define/references/draft-generation.md"
      - "src/common/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md"
    intent: |-
      規律を実際の生成・検査・レビュー手順へ接続する。
    verification_refs: [TS-004, TS-005, TS-006]
    source_items: [AG-004, AG-005, AG-006]
  - id: RA-004
    concern: design-file-manager 系の是正（前方一致記述の解消）
    responsibility: |-
      references/target-area-matching.md の前方一致記述を完全一致へ是正し、search-target-area.ts の一致規則（findTargetAreaHeadings、headingMatchesTarget）と整合させる。Design（agentdev-design-file-manager.md）の APPEND 操作・一致規則との整合を確認する。
    ownership_hints:
      - "src/common/skills/agentdev-design-file-manager/references/target-area-matching.md"
      - "src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts"
      - "docs/designs/skills/agentdev-design-file-manager.md"
    intent: |-
      古い指示の残存を解消し、判定を緩めない。
    verification_refs: [TS-003, TS-009]
    source_items: [AG-003, AG-009]
  - id: RA-005
    concern: case-open 引き継ぎと Definition 適用直前照合の接続
    responsibility: |-
      handoff.md と root-case-and-definition-package.md を、適用直前照合・完了度照合（instruction 単位・Issue 節単位）の更新へ接続する。新しい適用経路を作らず、既存の Definition 保存内部責務（case-ready / case-revise）へ接続する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/references/handoff.md"
      - "src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md"
      - "docs/designs/commands/case-ready.md「Definition 適用直前の対象セクション照合」（Design 追記対象）"
    intent: |-
      適用直前確認を既存の Definition 保存内部責務へ接続し、古い全文による上書きを防ぐ。
    verification_refs: [TS-007]
    source_items: [AG-007]

case_open_hints:
  epic_needed: false
  decomposition: "単一 Issue で実装。内部作業順序の参考: (1) 組立・検査スクリプトと design-file-manager 系是正、(2) 調査委譲指示と workflow 参照資料の更新、(3) Definition 適用直前照合の接続、(4) REQ/Design 保存、(5) 改善比較。RU-20261005-01 の採番方式（RU-YYYYMMDD-01）と旧採番規定（artifact-contracts.md / REQ-008-055 の RU-NNNN／最大番号+1）の差異は明記のみ行い、採番規定の修正は対象外。"
  wave_hints: []
```

# summary

RU-20261005-01（収束済み検討由来）を要件化した。REQ-004 へ新規8行（056〜063）を APPEND し、req-define の調査委譲・ドラフト組立・検査順序・証拠再利用・Definition 適用直前照合の実行契約を追加する。Design は req-define command Design（調査委譲セクション更新）、artifact-contracts（作業用途ファイル分離の小節追記）、case-ready Design（適用直前照合の新規セクション）を更新する。実装面（RA-001〜005）は配布 skill 参照資料群と search-target-area.ts 再利用の組立・検査処理。REQ-008（ドラフト形式）は変更せず、v4-delegation-contracts への共通契約追加は見送り（CR-001）。Decision は不要（CR-002）。947行中91.1%が原文同一という観測に基づくが、時間短縮率の保証は要件に含めない。
