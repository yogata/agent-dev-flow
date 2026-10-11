---
draft_type: req_draft
topic_slug: adf-impl-start-latency-reduction
status: draft
created_at: "2026-10-11T16:45:20.259Z"
source_rus: [RU-0200, RU-0201, RU-0202, RU-0203]
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  ADF実装開始待ち短縮の採用確定6案と条件付き4案を、4RUの全20条件を保持して定義する。
  既存の組立・証拠再利用・排他・スロット規定は再利用し、実呼出・結果消費・永続引継ぎ・実経路検証の不足を実現面へ引き渡す。
  条件付き4案はこのCaseの調査・判定と採用時実装・検証義務であり、恒久的評価REQを新設しない。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
source_input: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-latency-20261012.md
source_agreement:
  session_uri: session:20261011_133411_7e1af3
  agreement_confirmed_at: "2026-10-11T14:59:58.517295+09:00"
  authority: 利用者合意とSupervisorのRU全文忠実性照合。実行済み条件付き案の本採用を意味しない。
scope_contract:
  exclusions: |
    - 反証レビューの常時複数担当化、corpus等の細部高速化、全工程を統括する新制御基盤、全工程横断の汎用永続キャッシュ、case-close高速化。
    - 全体診断と投入対象確認の分離、対象ごとの工程間先行開始、必須の全対象収束契約の変更。
    - 新しい常時監視基盤、任意のコマンドを解釈する汎用入力検証器。
    - 目標未達を理由とする上記対象外の自動追加。
  preservation: |
    - 必須品質・独立意味レビュー・受入判断・承認・追跡検査・索引生成後/版変更後の必要な再検証。
    - 読取/分析を並列に進めつつ共有書き込み・Git操作・対話の排他。提供元不調を理由に全体を勝手に直列化しない。
    - 既存の型・入力生成・実行器・組立・記録・再開機構を優先。新たな依存/台帳/基盤は先取りしない。
    - 監督・常駐実行側とADF配布物の責務を区別。Hermes固有の運用是正を別ADF Caseや先行条件として勝手に追加しない。ADF外の変更が不可避で合意範囲を超える場合のみ根拠付き判断点に戻す。
    - 実行中の旧工程へ途中適用せず、正本・配布先・適用先・実動作の一致を確認する。
  measurement: |
    backlog-auto→req-define→case-autoの連鎖で品質と承認義務を維持し、case-runの実装開始までの待ちを短縮する。通常10分程度、遅くとも30分程度は効果評価目標であり、今回の修正完了と同一視しない。全体入口/各工程入口から、最初と全対象について委譲開始・担当作成・最初の実作業の観測可能な境界を区別して測る。人間確認・訂正・提供元待ちを全体時間から黙って除外しない。
    過去ログでreq-define→最初case-run委譲が約115分、case-auto単独が約58.7分だったが、先行作業完了後の新しい実行時間ではない。改善後の時間や改善率は未測定。tool時間はstate.time.start/endの区間の重なりを除いて扱い、非tool区間を全て推論と呼ばない。
agreed_items:
  - id: AG-001
    source_ru: RU-0200
    logical_key: adf-latency-check-input-output
    classification: REQ
    content: |
      1. 実際の検査呼出経路で標準出力・標準エラー・終了コード・対象版・実行条件を一回の検査から保存し、終了コードまたは証拠を取得するためだけの同一条件の全再実行を不要にする。
      2. 既知の検査入力を既存入力型と下位コマンドの契約から固定生成し、必須項目・対象・パス・許容値・必須引数を高価な検査の前に検証する。不正なworkflow値等を与えた実入力では高価な検査が始まらず、正当な入力では必要検査が実行される。
      3. 先行反映済みのepic_ref設定、sidecarとinline宣言の和集合、計測日二段収束と派生物処理を保持し、その規定を重複追加しない。commit境界や版変更後の必要検査を無条件に省かない。
      4. 実運用で使う入力生成・実行・結果消費経路の正常系と拒否系を検証し、文面の存在や試験内だけの模擬判定を実動作の証明にしない。終了コード取得のための再実行が発生しないことを呼出件数と保存結果で確認する。
    source_verification: |
      入力不正時の下位実行未開始、正常時の必須検査実行、標準エラーにのみ結果がある場合、非ゼロ終了の保存と後続抑止を既存実経路で隔離検証する。共有実行処理の兄弟呼出先も確認し、単一Case専用の場当たり対応にしない。
  - id: AG-002
    source_ru: RU-0201
    logical_key: adf-latency-draft-assembly-evidence
    classification: 挙動Design
    content: |
      1. 意味が確定した既存文書への局所修正・追記では既存assemble-draft-section.tsを実呼出しし、変更しない原文を保持する。実行ごとの組立スクリプト生成や原文のモデル再生成で代替しない。新規本文・全面改稿と意味判断は適切なモデル処理に残す。
      2. 構造と変更前提の検査、組立、差分と完結性の検査、独立意味レビューの順序を実経路で維持し、不在・複数一致・旧文件数不一致では誤適用しない。
      3. 同一実行で対象内容・版・評価範囲・実行条件が一致する有効な検査証拠は再利用し、無変更の再開で同じ検査を繰り返さない。検査器の版・設定・参照対象のうち結果に影響する条件も識別し、入力・原文・条件変更時は影響する検査と意味判断を再評価する。
      4. 同一条件の再開で再利用される正常例と、内容・条件変更で再検査される反例、証拠欠損時の処遇を検証する。意味レビューを機械検査で置換せず、全工程横断の新規永続キャッシュを作らない。
    source_verification: |
      既存の組立試験を再利用し、原文保持・拒否条件・証拠再利用と無効化を実際の生成/再開入力と結果で確認する。規定済み箇所は文言再追加でなく実呼出・結果消費・永続引継ぎの未充足増分だけを修正する。
  - id: AG-003
    source_ru: RU-0202
    logical_key: adf-latency-parallel-recovery
    classification: 挙動Design
    content: |
      1. learning・intake・inspectの独立3系統は読取・分析を実際に並列に進め、Git競合を理由に系統全体を直列化しない。起動記録と活動区間で並列実行を確認する。
      2. 共有ファイル書き込み・Git操作・利用者対話について排他担当と境界を成立させる。競合操作は重ならず、失敗・停止時も排他解除と結果回収が成立し、一系統の停止で他系統を連鎖停止しない。
      3. 正規の修復と再開条件の充足が確認された対象は、無関係な兄弟の結果回収を理由に再委譲を後ろ倒ししない。活動中/完了済みを照合して二重実行を防ぎ、修復完了から再委譲までの記録を残す。
      4. 通常系、系統失敗、競合書き込み、修復済み対象と活動中兄弟の併存を実制御経路で検証する。全対象収束や承認の必須契約を勝手に変更せず、対象ごとの工程間先行開始を追加しない。
    source_verification: |
      実際に使う委譲・排他・再開処理に隔離した副作用境界を接続し、活動区間・操作要求・発行/抑止・失敗後の状態を観測する。手順文への並列指示追記だけで完了にしない。
  - id: AG-004
    source_ru: RU-0203
    logical_key: adf-latency-conditional-evaluation
    classification: 作業記録
    lifetime: このCaseに有界の受け入れ義務。完了記録は既存PR・Issue・Reportへ投影し、単なる参考メモとして消費しない。
    content: |
      1. 内容なし停止の検出・安全な再開、一括抽出と担当間共有、機械的マーカー/構造検査の固定化、受入検査内の読取並列化の4案について、採用済み6案による解消との重複を先に調べ、必要性・安全性・最小変更での実現性を確認する。不成立なら試作せず、未確定部分だけを隔離試験する。
      2. 停止検出案は既知の無内容応答と既存監督経路を照合し、正常な長い処理・活動中ツール/子・承認待ちを再送対象と区別する。活動中は再送せず、完了済みは結果回収、状態不明は照合を先に行う。既存機構の補強で済む場合だけ採用し、一律短時間タイムアウト再送や新監視基盤は採用しない。
      3. 一括抽出案は同じ版・ファイル・目的の反復探索を確認し、既存抽出結果の必要情報被覆、版変更時の無効化、準備/読込を含む最長経路上の費用を比較する。共有は所在/原文等の事実とし、独立レビュー結論の共有による確認省略には用いない。
      4. マーカー/構造検査案は意味解釈なしで決まる規則だけを対象に、既存検査の不足、正常/欠落/重複/順序違い/許容表記の識別を確認する。採用済みの組立等で満たせる場合は包含先を示して別案として二重実装しない。
      5. 読取並列化案は採用確定の入力検証・証拠保存・再利用を反映した後の検査を計時する。下位呼出まで読取/書込/生成物/依存を確認し、同じ版・入力の逐次版と並列版で合否・指摘・必須証拠が一致することと、最長経路短縮がばらつきに埋もれず保守費用に見合うことを確認する。索引生成等は並列対象にしない。
      6. 各案を採用・不採用・判断材料不足・採用済み案へ包含のいずれかで根拠付き確定し、合意範囲内で採用した案は実装と検証まで完了する。調査への合意を本採用済みと記録せず、条件付きという理由で調査や採用後の実装を省略しない。範囲外変更や両立不能競合だけを判断点として戻す。
      7. 修正前後を同じ対象・入力・到達点・モデル/推論設定・検査義務で比較し、最初と全対象の開始、再実行回数、停止復旧時間、品質上の見落とし、残る遅延を報告する。単発成功を30分保証としない。人間確認等を黙って除外せず、改善量を並列処理時間の単純加算や非tool時間の推論扱いから捏造しない。
      8. 正本・配布先・適用先の版と実呼出経路を照合して反映を確認する。ソース試験だけで適用先成立とせず、既存十分証拠は再利用する。10分/30分未達でも除外済み構造変更を自動追加せず、今回の実装修正完了と性能目標達成を別々に判定する。
    source_verification: |
      採用確定3RUの修正に包含される部分を二重計上しない。読取並列化の効果評価は基礎修正後に行う。独立した読取調査は並列に進めてよく、実装/比較の依存だけを明示する。採否調査自体を大型開発へ広げない。不成立・範囲外基盤必須で打ち切り、一度の比較で不明ならばらつき確認に必要な追加だけを行い、なお不明なら本採用を見送る。試験と証拠は既存記録へ残し、新しい汎用評価基盤を作らない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-030.md
    target_area: "## 要件"
    source_items: [AG-001]
    content: |
      | REQ-030-025 | case-open は検査の標準出力・標準エラー・終了コード・対象版・実行条件を一回の実行から保存し、終了コードや証拠取得のみを目的とする同一条件の検査の全再実行を不要にすること |
      | REQ-030-026 | case-open は既知の検査入力を既存入力型と下位検査の契約から固定生成し、必須項目・対象・パス・許容値・必須引数を高価な検査の開始前に検証すること。不正な入力では検査を開始せず拒否し、正当な入力では必要検査を実行すること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    target_area: "## 要件"
    source_items: [AG-001]
    content: |
      | REQ-061-049 | case-ready は受入検査の標準出力・標準エラー・終了コード・対象版・実行条件を一回の実行から保存し、終了コードや証拠取得のみを目的とする同一条件の検査の全再実行を不要にすること |
      | REQ-061-050 | case-ready は既知の検査入力を既存入力型と下位検査の契約から固定生成し、必須項目・対象・パス・許容値・必須引数を高価な検査の開始前に検証すること。不正な入力では検査を開始せず拒否し、正当な入力では必要検査を実行すること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-041.md
    target_area: "## 要件"
    source_items: [AG-003]
    content: |
      | REQ-041-017 | backlog-auto は昇格3系統の読取・分析を実際に並列に進め、起動記録と活動区間により成立を確認できること。競合する操作のみを排他し、失敗・停止時も排他解除と結果回収を成立させること。提供元不調やGit競合を理由に系統全体を直列化しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/req-define.md
    target_area: "## 現在の動作"
    placement: tail
    canonical_owner: req-defineの生成・再開・意味レビューへの証拠引継ぎ
    change_nature: nonconformance_fix
    req_impact: no
    source_items: [AG-002]
    content: |
      ## 組立検査証拠の同一実行内引継ぎ

      REQ-004-058〜063の規定を再追加せず、組立検査の論理証拠を登録済みreq_draftのdraft-data内に保持する。生の組立入力・出力や一時スクリプトをdrafts配下に置くこととは区別する。証拠の寿命は当該定義実行とその再開までとし、case-ready成功後のドラフト削除を変更しない。consumerが必要な結果を正規成果物・既存実行記録へ引き継ぐ。

      証拠は対象・原文・変更内容のハッシュ、評価範囲、組立の操作条件、検査器の版と設定、結果に影響する参照対象、実行時刻、前後検査結果と差分を識別できる形で保存する。同一実行の再開では現在条件を照合し、すべて一致した有効な証拠だけを再利用する。欠損・不一致なら影響する検査を再実行し、意味判断への影響も再評価する。既存の組立実体の戻り値を引き継ぎ、検査結果をモデルが捏造しない。機械検査で独立意味レビューを代替せず、全工程横断の新規永続キャッシュを作らない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/commands/case-open.md
    target_area: "### 機械工程の script 呼び出し契約（RU-0162）"
    placement: tail
    canonical_owner: case-openの既知検査入力生成・検査実行・報告消費
    source_items: [AG-001]
    content: |
      ### 検査入力と実行証拠の接続

      REQ-030-025/026の実現は既存の工程別実行器・入力型・下位検査契約を再利用する。標準出力と標準エラーは全文を保持し、終了コード、対象版、実行条件（実行コマンド、引数、作業ディレクトリ、指定された実行上限と検査設定）と対応付けて、一回の検査の報告として保存・消費する。末尾抜粋や集計要約だけで原結果を代替しない。既存の実行記録を用い、終了コードや証拠の再取得のみを目的とする同一条件の全再実行を行わない。

      既知の検査入力は既存入力型と下位コマンドの契約から固定生成し、必須項目、対象、パス、許容値、必須引数を高価な検査の前に検証する。形状検査だけでなく不正workflow値等の下位引数も拒否する。兄弟実行器と結果消費の規律をそろえ、単一Case専用処理や任意コマンドの汎用解釈器を作らない。既存の計測日二段収束・派生物処理とcommit境界・版変更後の必要検査はそのまま維持する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/case-ready.md
    target_area: "## 機械工程の script 呼び出し契約（RU-0162）"
    placement: tail
    canonical_owner: case-readyの受入検査入力生成・実行・報告消費
    source_items: [AG-001]
    content: |
      ## 受入検査入力と実行証拠の接続

      REQ-061-049/050の受入検査は、case-open Design「検査入力と実行証拠の接続」と同じ保存・生成・事前検証の規律に従う。既存の報告が終了コードだけ、または要約だけとなる箇所でも、stdout/stderr全文・終了コード・対象版・実行条件を一回の検査から保持し結果消費へ渡す。既存受入判断と必須ゲートを置換しない。epic_ref設定とsidecar/inline和集合の既存入力構成規律は維持し重複追加しない。索引生成や版変更後の必要再検証は省かない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/commands/backlog-auto.md
    target_area: "## 現在の動作"
    placement: tail
    canonical_owner: backlog-autoの並列委譲・競合排他・結果回収
    source_items: [AG-003]
    content: |
      ## 昇格3系統の実並列と競合排他の接続

      REQ-041-017の成立は系統別の起動と活動区間の実観測で確認する。親orchestratorが既存の委譲手段へ3系統の独立読取・分析を並列接続し、共有書込み・Git操作・利用者対話の競合要求だけを排他する。提供元不調やGit競合を理由に系統全体を直列化しない。子workflowの内部分類・評価・承認は子側の正規責務に残す。

      既存referenceの直列化キューの報告項目を再定義せず、排他の担当・操作要求・実行順序・解除・結果回収の実記録を既存記録へ接続する。失敗・停止時も解除と結果回収を確認し、独立兄弟を連鎖停止しない。全対象収束の工程間gateは変更しない。新しい全工程制御基盤・台帳・スケジューラ基盤は追加しない。
conflict_resolutions: []
decision_judgment:
  required: false
  reason: 既存の型・実行器・組立・記録・再開機構の不足補完。新基盤・新依存・不可逆な技術選択や責務境界変更なし。workflow動作はREQ/Designで扱う。
  advisory: アーキテクチャ助言は確定事項・推定事項・ユーザー確認事項・ブロッカーの4ラベルで受領。新規ユーザー確認事項とブロッカーなし。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0200
    target_req: REQ-030
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    source_items: [AG-001]
    artifact_action_refs: [ACT-REQ-001, ACT-REQ-002, ACT-DESIGN-002, ACT-DESIGN-003]
    realization_action_refs: [RA-001, RA-002]
  - ou_id: OU-002
    source_ru: RU-0201
    target_req: REQ-004
    target_design: docs/designs/commands/req-define.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    source_items: [AG-002]
    artifact_action_refs: [ACT-DESIGN-001]
    realization_action_refs: [RA-003]
    note: REQ操作なし。既存REQ-004-058〜063の実現不足をDesign追記と実現面で補完する。
  - ou_id: OU-003
    source_ru: RU-0202
    target_req: REQ-041
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    source_items: [AG-003]
    artifact_action_refs: [ACT-REQ-003, ACT-DESIGN-004]
    realization_action_refs: [RA-004, RA-005]
  - ou_id: OU-004
    source_ru: RU-0203
    target_req: null
    target_design: null
    scale: standard
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 2
    source_items: [AG-004]
    artifact_action_refs: []
    realization_action_refs: [RA-006]
    note: >-
      正規REQ保存操作なし。Caseの受け入れ義務を実行契約へ投影する実現面単位。
      depends_onは基礎修正後の実装・比較の依存のみを示し、本ドラフトでの定義生成・4案の独立読取調査・重複調査の開始を禁止する条件ではない。
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    source_conditions: [1, 2, 4]
    verification: 既存の入力生成・実行・結果消費の実経路を隔離して正常入力、不正workflow値、必須引数欠落、許容値外、パス不正、stderrのみの出力、非ゼロ終了を実行し、下位呼出件数と保存結果を観測する。兄弟呼出先を同じ方法で確認する。
    pass_criteria: 不正入力で高価な検査開始0件。正常入力で必要検査が実行され、stdout・stderr・終了コード・対象版・実行条件が欠落なく同じ実行から保存・消費できる。終了コード/証拠取得のみの同一条件の全再実行0件。非ゼロ終了の保存と後続抑止が成立する。
    on_failure: fix-and-reverify。合意範囲内の生成・検証・保存・消費を修正し、実経路で再検証する。模擬runner試験だけで代替しない。
  - id: TS-002
    target_item: AG-001
    source_conditions: [3]
    verification: 既存epic_ref、sidecar/inline和集合、計測日二段収束・派生物処理を維持した正常経路を確認し、commit境界・索引生成後・版変更後の必要検査の記録を照合する。
    pass_criteria: 先行規定の重複追加0件。入力構成と二段収束の成立、必要再検証の欠落0件。必要な版変更後検査を再利用対象と誤認しない。
    on_failure: fix-and-reverify。先行成立部分を復元し必要検査を実行する。
  - id: TS-003
    target_item: AG-002
    source_conditions: [1, 2, 3, 4]
    verification: 既存組立試験を再利用し、実際の生成・再開・レビューへの結果消費経路で原文保持、不在・複数一致・旧文件数不一致、同条件再開、内容・原文・検査器版・設定・参照対象変更、証拠欠損を確認する。
    pass_criteria: 局所修正の既存組立実呼出が観測でき、無変更原文が一致する。構造→組立→差分・完結性→独立意味レビューが成立。拒否入力の誤適用0件。同一実行の同条件再開で不要再実行0件、変更時は影響検査と意味判断を再評価。証拠欠損を検証済み扱いせず再検証する。新規/全面改稿のモデル処理は維持、意味レビュー代替と全工程横断キャッシュ追加0件。
    on_failure: fix-and-reverify。実呼出・証拠引継ぎ・照合・無効化を修正し正常例と反例を再検証する。
  - id: TS-004
    target_item: AG-003
    source_conditions: [1, 2, 4]
    verification: 既存委譲・排他処理へ隔離副作用境界を接続し、3系統の起動記録・活動区間、競合書込・Git・対話の操作要求と発行、通常系・系統失敗・停止後の状態を観測する。
    pass_criteria: 独立読取/分析の並列活動を記録で確認できる。競合操作の重複0件、非競合の系統全体直列化0件、失敗/停止時の排他解除と結果回収が成立、独立兄弟の連鎖停止0件。文面追記だけを実動作証明としない。
    on_failure: fix-and-reverify。既存委譲・排他接続の不足を修正し実制御経路で再検証する。
  - id: TS-005
    target_item: AG-003
    source_conditions: [3, 4]
    verification: 修復済み対象と活動中兄弟が併存する既存再開経路を隔離検証し、再開条件・依存・空き枠・排他条件・活動中/完了済み照合と修復完了から再委譲までの記録を確認する。
    pass_criteria: 再開と安全条件を満たす対象が兄弟結果回収待ちのみを理由に遅延しない。同一対象二重起動0件、完了済み再実行0件。修復完了・再委譲の境界記録がある。全対象収束・承認を変更せず対象ごとの工程間先行開始0件。
    on_failure: fix-and-reverify。既存スロット/再開への接続を修正し併存例で再検証する。
  - id: TS-006
    target_item: AG-004
    source_conditions: [1, 2, 3, 4, 6]
    verification: 4案ごとに採用6案との重複・必要性・安全性・最小変更実現性と所有先を調査し、停止検出の生存状態、一括抽出の被覆と費用、マーカー検査の正常/欠落/重複/順序/許容例を照合する。確定に足りない部分だけ隔離試験し根拠を既存記録へ残す。
    pass_criteria: 4案全てが採用・不採用・判断材料不足・包含のいずれかで根拠付き確定。採用なら同じ合意範囲内で実装と検証が完了。包含なら既存成立の根拠と包含先を示し二重実装0件。活動中再送0件、完了は回収、状態不明は照合先行。調査合意を本採用と記録しない。不成立の試作・新監視基盤・一律短時間再送・独立レビュー結論共有による確認省略0件。
    on_failure: fix-and-reverify。不足した判定/採用時実装/検証を合意範囲内で補完。範囲外変更・両立不能だけはrecord-in-findingsとして根拠を記録し人間判断へ戻す。条件付きだからという理由で義務を省略しない。
  - id: TS-007
    target_item: AG-004
    source_conditions: [5, 6]
    verification: 基礎修正後に受入検査を計時し、下位呼出までの読取/書込/生成物/依存を確認して同版・同入力の逐次版と並列版を隔離比較する。不明ならばらつき確認に必要な追加比較だけ行う。
    pass_criteria: 合否・指摘・必須証拠が一致し、最長経路短縮がばらつきに埋もれず契約変更・試験・保守費用に見合う場合のみ採用。索引生成の並列化0件。なお不明なら採用を見送り理由を残す。採用時実装・検証を完了し、他の3案の判定義務も維持する。
    on_failure: fix-and-reverify。比較の不備を修正。採用条件不成立/判断材料不足は不合格な実装を成功扱いせず不採用/判断材料不足の根拠を既存記録へ残す。
  - id: TS-008
    target_item: AG-004
    source_conditions: [7, 8]
    verification: 同じ対象・入力・到達点・モデル/推論設定・検査義務で前後を比較し、全体/各工程入口から最初/全対象の委譲開始・担当作成・最初の実作業を区別して計測する。基礎修正と条件付き採用案の観測を区別し、正本/配布先/適用先の版・実呼出を照合する。
    pass_criteria: 再実行回数・停止復旧時間・見落とし・残遅延を報告する。人間確認/訂正/提供元待ちを黙って除外せずtool区間は重複除去し非toolを推論と断定しない。改善率を捏造しない。適用先実動作を確認し既存十分証拠は再利用。通常10分/遅くとも30分の効果評価目標と実装修正完了の判定を分離し、単発成功を保証扱いしない。目標未達による対象外自動追加0件。
    on_failure: fix-and-reverify。欠損した比較・適用先検証を補完する。性能目標未達のみならrecord-in-findingsで残遅延と判定を記録し、実装修正の成立を別判定する。
realization_actions:
  - id: RA-001
    concern: 検査出力・終了コード・条件の一括保存と結果消費
    responsibility: case-open/readyの既存検査実行・報告担当。全出力と終了コードを同じ検査から保持し既存記録へ引き渡す。stderr末尾だけや件数要約のみで原結果を代替しない。
    ownership_hints: [src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts, src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts]
    intent: 実際の生成・実行・結果消費へ接続し、再取得のみの再実行を解消する。共有処理の兄弟呼出先を確認し既存実行器の正規所有を再利用する。新共通基盤は作らない。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001]
  - id: RA-002
    concern: 既知検査入力の固定生成と下位契約の事前検証
    responsibility: case-open/readyの入力型と実際に使う下位検査契約の担当。workflow値・必須引数・対象パス等を高価な検査開始前に拒否できる接続を担う。
    ownership_hints: [src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md, src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md, src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts]
    intent: 形状検査のみの不足を補完する。既知入力のみを対象とし任意コマンドの汎用解釈器を作らない。epic_ref・和集合・計測日二段収束と派生物処理を維持する。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001]
  - id: RA-003
    concern: req-define組立実呼出・証拠保存・再開時照合
    responsibility: req-defineの生成・再開・レビュー引継ぎ担当。既存組立結果の論理証拠をregistered req_draft内で保持し同実行内の有効性を照合する。
    ownership_hints: [src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts, src/common/skills/agentdev-workflow-req-define/references/draft-generation.md, src/common/skills/agentdev-workflow-req-define/references/adversarial-review-integration.md, src/common/commands/agentdev/templates/req-define/req-draft.md]
    intent: 既存REQ-004-058〜063を実呼出・結果消費・永続引継ぎで満たす。証拠は対象/原文/変更・範囲・操作条件・検査器版/設定/参照依存・時刻を識別する。欠損/変更時は影響検査と意味判断を再評価する。新台帳/全工程キャッシュは作らない。
    verification_refs: [TS-003]
    source_items: [AG-002]
  - id: RA-004
    concern: backlog-autoの並列委譲と排他担当の実接続
    responsibility: backlog-auto親orchestratorが非競合処理を独立並行委譲し、共有書込・Git・対話要求のみ既存実行手段へ排他接続する。子workflowの内部判断・承認を再所有しない。
    ownership_hints: [src/common/skills/agentdev-workflow-backlog-auto/references/stage-execution.md, src/common/skills/agentdev-workflow-backlog-auto/references/fan-in-and-reporting.md]
    intent: 既存の直列化キュー規定・報告項目を再利用し、起動・活動区間・排他の実行証拠を既存記録へ残す。失敗時の排他解除と結果回収を担い兄弟非連鎖停止を維持する。新スケジューラ基盤を作らない。
    verification_refs: [TS-004]
    source_items: [AG-003]
  - id: RA-005
    concern: case-auto修復完了から再委譲への接続
    responsibility: case-autoの既存再開・空き枠補充・生存照合・対象別観測担当。正規修復と再開条件成立を既存投入判断へ接続する。
    ownership_hints: [src/common/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md, src/common/skills/agentdev-workflow-case-auto/scripts/src/slot_queue.ts, src/common/skills/agentdev-workflow-case-auto/scripts/src/wave-gate.ts]
    intent: 既存REQ-034-040/041/045とDEC-051を再利用し、兄弟結果回収待ちに結合しない修復後再委譲と境界記録を成立させる。stage間収束・安全上限・排他・承認を変更しない。
    verification_refs: [TS-005]
    source_items: [AG-003]
  - id: RA-006
    concern: 条件付き4案の有界調査・判定と採用時実装
    responsibility: このCaseの実行担当が4案の所有先・重複・費用/品質/安全/最小変更実現性を調査し根拠付き確定する。合意内で採用した案は実装・検証まで担当する。
    ownership_hints: [既存監督・常駐実行の停止検出担当は参照調査のみで所有を捏造しない, 既存REQ/Decision inventory・抽出実体, 既存組立/マーカー/構造検査実体, src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts]
    intent: 調査合意を採用と誤記せず4値判定と採用後完了を実行契約の受け入れ条件へ投影する。独立読取は並列、読取並列化比較は基礎修正後。外部/Hermes変更をADF Caseや前提へ追加しない。範囲外・両立不能だけ判断点へ戻す。結果と比較証拠は既存PR/Issue/Reportへ記録する。
    verification_refs: [TS-006, TS-007, TS-008]
    source_items: [AG-004]
review_dispositions:
  - id: RD-001
    source_ru: RU-0200
    source_item: condition-3
    disposition: covered
    reason_code: preserve_existing_norm
    reason: epic_ref・sidecar/inline和集合・計測日二段収束と派生物処理の規定は先行反映済み。維持と回帰検証はTS-002に残し文言再追加しない。
    evidence: {path: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md, section: traceability check の gate 判定仕様と計測日収束, checked_at_commit: null}
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0201
    source_item: condition-1
    disposition: partially_covered
    reason_code: norm_and_unit_only
    reason: REQ-004-058/062と組立実体・単体試験は成立。実生成/再開経路の実呼出・結果消費は未証明のためRA-003/TS-003に全義務を保持する。
    evidence: {path: docs/requirements/REQ-004.md, section: REQ-004-058〜063, checked_at_commit: null}
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0201
    source_item: condition-2
    disposition: partially_covered
    reason_code: norm_and_unit_only
    reason: 順序・拒否条件の規定/単体試験は成立。実経路の順序と誤適用抑止の証明はRA-003/TS-003で行う。
    evidence: {path: src/common/skills/agentdev-workflow-req-define/references/draft-generation.md, section: 決定的な局所組立・検査, checked_at_commit: null}
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0201
    source_item: condition-3
    disposition: partially_covered
    reason_code: norm_not_connected
    reason: REQ-004-060は既存。証拠保存・再開照合の実接続不足はACT-DESIGN-001/RA-003/TS-003で補完しREQを重複追加しない。
    evidence: {path: docs/requirements/REQ-004.md, section: REQ-004-060, checked_at_commit: null}
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0202
    source_item: condition-3
    disposition: partially_covered
    reason_code: slot_model_not_repair_evidence
    reason: REQ-034-040/041/045とDEC-051、slot_queue/wave-gateは存在。修復完了検知・再委譲接続と区間証拠はRA-005/TS-005で補完する。
    evidence: {path: docs/requirements/REQ-034.md, section: REQ-034-040〜045, checked_at_commit: null}
    related_removed_items: []
case_open_hints:
  epic_needed: true
  decomposition: 4RUの責務単位。最終Issue階層・Wave・分割はcase-readyの現行契約に従い確定する参考情報であり、本draftで決定しない。
  wave_hints: []
  acceptance_projection: AG-001〜004の全20番号条件、source_verification、scope_contract、TS-001〜008を実行契約/完了条件へ漏れなく投影する。RU-0203は調査だけで完了にしない。
boundary_risks:
  - {boundary: dependency, risk: 検査器版・設定・参照変更による古い証拠再利用, verification_refs: [TS-003]}
  - {boundary: client/server, risk: 提供元障害や外部監督の生存不明を再送/直列化の許可と誤認, verification_refs: [TS-004, TS-006]}
  - {boundary: execution, risk: 排他漏れ・失敗時lock残存・二重起動・非ゼロ結果の欠落, verification_refs: [TS-001, TS-004, TS-005]}
  - {boundary: build/runtime, risk: 正本試験のみで配布/適用先の動作成立と誤認, verification_refs: [TS-008]}
  - {boundary: environment_propagation, risk: 活動中旧工程への途中適用と版/条件不一致, verification_refs: [TS-002, TS-008]}
definition_evidence:
  mechanical_verification:
    executed_at: "2026-10-11T17:00:58Z"
    result: 合格。YAML/frontmatter読戻し、標準13項目、全20条件/4検証方法の逐語一致、TS3要素/条件網羅、OU参照、UTF-8 BOMなし/LFを機械確認。
  assembly_verification:
    script: src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts
    script_sha256: f313056fe384b50cacb74777cbc58a75e5cf183cf8f2b987e1a65d7ea8f0068d
    conditions: stdinの既存AssembleInput、operation=append、target_file=各ACT.target、anchor=各ACT.target_area、content=各ACT.content。--writeなし。7件すべてok=true/written=false、前後検査すべてok、削除差分0件。
    records:
      - {action: ACT-REQ-001, target_sha256: 841bbef534da0031546badd5c228236d282acc7e16a3968099bf76095c0e8bc4, edit_sha256: 3086455de08333def77068065210d26388b0cd88f8336be584c9449784ff4122, scope_lines: [16, 44], added_lines: 3, executed_at: "2026-10-11T17:00:58.281Z"}
      - {action: ACT-REQ-002, target_sha256: 4ca29630b18d33ba8bc52c018804f4036885760e32e92c5b4e11e15c15ae44b3, edit_sha256: a9da688e8948f2d15d7480e044b024f4195a3e44633fdc4e1accb76b653d1e2f, scope_lines: [16, 68], added_lines: 3, executed_at: "2026-10-11T17:00:58.376Z"}
      - {action: ACT-REQ-003, target_sha256: ebef5179b5b8a9c01a6338830e0460315cb549b067c2a6e8cdd54841e80ab56f, edit_sha256: 3d74d663cb45c6dba98cba0ba64fc1fb19dfb4f12d9676994d1923a41012593c, scope_lines: [19, 39], added_lines: 2, executed_at: "2026-10-11T17:00:58.476Z"}
      - {action: ACT-DESIGN-001, target_sha256: 63e82fce58faf78b422b7425fb8f4ca1074464695b66506b271a4e9e484fc6c7, edit_sha256: cc076355f3001b64009d4dff8d6d2e901cdf55eda71bccd07e31ab4a8f78295d, scope_lines: [51, 116], added_lines: 6, executed_at: "2026-10-11T17:00:58.555Z"}
      - {action: ACT-DESIGN-002, target_sha256: 70fe4e5fd187f80f2eccf2319a1194cf9a28419e62be8216ac48ccfd5d5a7de0, edit_sha256: ccd05bba7577e01b605679fd297097438fc6ebb45d9c942d88a41d378feb76b4, scope_lines: [73, 85], added_lines: 6, executed_at: "2026-10-11T17:00:58.675Z"}
      - {action: ACT-DESIGN-003, target_sha256: e19a48f51ff901cfc2d89fb958f9257c811991354434e4fb7e8a3849373842dc, edit_sha256: 61d2e5605349edc27680769bfbe49dcb80bf642b39d46d926aabda573e204f7c, scope_lines: [84, 91], added_lines: 4, executed_at: "2026-10-11T17:00:58.756Z"}
      - {action: ACT-DESIGN-004, target_sha256: d4525508572d27148313ac52ca7a1f3b02a446e061a47609b4e6c1372336cb1f, edit_sha256: a169831fb867ec939ed8582c70ae9e79b1277f824afbbdf9acddae126636deba, scope_lines: [42, 46], added_lines: 6, executed_at: "2026-10-11T17:00:58.831Z"}
  normative_matching: REQ-030/061に保存と固定入力の増分、REQ-041に実並列義務の増分。REQ-004/034の既存保証はREQ操作なし。RU-0203はCase有界の義務で恒久REQ操作なし。
  health: REQ-030 24→26、REQ-061 48→50、REQ-041 16→17。既存REQ-004 63行は追記なし。新規REQ作成なし。追加関心は各workflowの現行責務内でSPLIT提案を要する2以上の追加シグナルなし。
  inspections: 3独立読取調査を並列実施。組立実体/単体試験・slot_queue/wave-gateは存在するがproduction呼出の充足証明と区別する。未充足の実動作試験はこの工程では実装せずTSへ保持。
  prior_review: 初回独立対論レビューの実動作検証義務明示・文言重複回避指摘を受理。draft-dataの寿命を理由に新ストアを要する助言と単体試験のみの完全充足判断は再反証し不採用。
  architecture_advisory: 新Decision・新ユーザー判断事項・ブロッカーなし。Case有界の4案義務と恒久規定を区別し採用時実装義務の投影を必須とする。
  jev_prior: 20261011T154254Z-f1d1は初期仮説に対する先行情報。最終判断の代替ではない。後続の分類修正により初期APPEND/CREATE案を正として扱わない。既存観測を移行・書換えしない。
  completion_review: 保存後の独立全文再レビューは全20条件・4検証方法・除外/維持・TS網羅について合格、blockerなし。非blockerのOU無対象updateとDesign対応不足は修正。修正後の構造・逐語照合と組立結果を親が確認してSupervisor境界で停止する。
```

# summary

4RUの全20条件を権威あるdraft-data内に保持した。実装・Case作成・Git永続化はこの工程の対象外。Supervisorの定義案照合境界で停止する。
