---
draft_type: req_draft
topic_slug: adf-phase-driven-retrospective
status: draft
created_at: 2026-10-25T16:20:31+09:00
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（case-open/ case-ready/ case-revise/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: staff-schedule-cf での工程駆動・変更駆動運用の振り返りで確定した改善要求4件（F1〜F4）を要件化した。F1(a)(c) は REQ-029 へ（機械工程 script の前提の設定値化・プロジェクト検出、producer 固有ゲートの存在検査と欠落時の正規代替経路、パス引数の形式検出・正規化）、F1(b) は REQ-009 へ（導入時整合検査への副作用なし dry-run 検証）、F2 は REQ-110 へ（直接採用の採否記録の保存先契約、領域契約 README の配布テンプレート実体化）、F3 は REQ-107 へ（書込み時引用識別子実在検査）、F4(2) は REQ-111 へ（終端遷移の記録形式、工程台帳の参照専用保持）の APPEND として確定した。F4(1) テーマ群の完了クローズ記録は対象外と判断した（CR-002）。REQ-009 への APPEND は SPLIT 予兆（合計3）をユーザーへ提示し SPLIT せず継続を確認済み（CR-001、2026-10-25 回答）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: F1(a) 配布物の機械工程 script が前提とする REQ 行IDの書式、必須ゲート、宣言規約を埋め込み値から設定値またはプロジェクト検出へ移すこと。producer 固有のゲートは存在検査し、欠落時の正規の代替経路（証跡化、手動相当手順、対照実行による悪化ゼロ件の機械証明）を契約化すること。実行前提は Project Extensions 等のプロジェクト固有値から workflow 側で解決し、script へは明示入力として渡すこと（アーキテクチャ助言 2026-10-25 採用: 新規 config 機構を新設せず Project Extensions から解決した値を script の明示入力へ渡す）。
  - id: AG-002
    content: F1(b) 導入時整合検査（install.ps1 -Mode check）に、主要な機械工程 script の入力検証 dry-run を加え、実行時前提の不一致を導入時に検出できるようにすること。検証は管理対象ファイルを変更しないこと（REQ-050-005 維持）。既存の dryRun 入口が入力検証専用ではなく worktree 作成とゲート実行を行い得る場合は、検証専用の副作用なし入口を分離すること（アーキテクチャ助言 2026-10-25 の注意採用）。
  - id: AG-003
    content: F1(c) 横断依存検査等のパス引数の環境前提（Windows と Git Bash 形式パス等）を検査するか、形式を検出して受け付けること。形式の違いだけで detection_unavailable や検出不能とならないこと。
  - id: AG-004
    content: F2 直接採用の採否記録の保存先パス（.agentdev/phase/adoptions/）を契約へ明示すること。採否記録は受領記録と同じ証跡規律（由来と正式な採用根拠の区別、fail-closed、1採用1ファイル、bodyDigest による同一性識別）で保存され、保存先が領域契約文書から発見できること。
  - id: AG-005
    content: F2 工程領域の契約文書（.agentdev/phase/README.md）を配布テンプレートから実体化し、消費 repo から契約を発見できるようにすること。実体化は工程領域の保存状態を初めて保存する正規経路（初回テーマ形成に限定せず、テーマ更新の先行、直接採用による成果物作成等を含む）が非破壊に行い、既存の領域契約文書を上書きせず、工程駆動を使用しないリポジトリを検査失敗扱いとしないこと（アーキテクチャ助言 2026-10-25 採用: 生成は工程側、installer check は工程駆動使用検出時の条件付き存在確認に限る）。
  - id: AG-006
    content: F3 正規成果物（REQ/Design/Decision）の初回作成・増分更新の書込み時機械検査に引用識別子の実在検査を加えること。最小版として決定的に検出できる範囲（文書本文・表中の要件行ID（桁数を固定しない許容書式。traceability checker 契約と同じ形式）の引用。入力文書の完了条件の目安「実在しない要件行IDを引用する文書が、書込み時に機械検査で拒否されること」に基づく限定）とし、IR-067 の突合規則を書込み時に適用した版とし、免除規則の書込み時版を併せて定義すること。検査は同じ変更で作成される参照先を含む適用後状態で評価し、参照先の保存順序だけを理由に不合格としないこと（アーキテクチャ助言 2026-10-25 採用: 引用実在検査は構造検査であり REQ-107-005 の意味品質検証との分離を維持する）。
  - id: AG-007
    content: F4 終端遷移（後続0件）の記録形式（後続不在を表す toPhase の表現を含む）を契約化し、保存された記録から終端であることを再構成できるようにすること。終端遷移後の工程台帳（テーマ正本、識別状態、遷移記録）は参照専用として保持すること。参照専用の保持は保存済み記録の保持を指し、完了済み過去工程の正規改訂（REQ-111-008）と変更駆動経路による作業を妨げないこと（アーキテクチャ助言 2026-10-25 の範囲限定採用: 参照専用を正規成果物の改訂禁止へ拡大しない）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-029.md
    source_items: [AG-001, AG-003]
    content: |
      | REQ-029-014 | 配布物の機械工程 script は、producer 側の採番・構成の前提（REQ 行IDの書式、producer 固有ツールの存在、パス引数の環境形式）を埋め込み値として要求せず、配布先で解決可能な設定値またはプロジェクト検出によって前提を与えられること |
      | REQ-029-015 | 配布物の機械工程 script が producer 固有のゲートを必須とする場合、当該ゲートの配布先での存在を検査し、欠落時は正規の代替経路（証跡化、手動相当手順、対照実行による悪化ゼロ件の機械証明）を契約に従って案内し、代替経路の履行なしに検査を省略して成功扱いとしないこと |
      | REQ-029-016 | 配布物の機械工程 script のパス引数は、配布先の実行環境で意味が変わる形式（Windows と Unix 系 shell のパス形式等）を検出または正規化して受け付け、形式の違いだけで検査不能または検出不能とならないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-009.md
    source_items: [AG-002]
    content: |
      | REQ-009-053 | 導入時整合検査（check モード）は、静的構成検査に加えて、配布物の主要な機械工程 script の実行時前提の不一致を副作用を生じない検証方法（入力検証 dry-run 相当）によって導入時に検出できること。検証は管理対象ファイルを変更せず（REQ-050-005）、検証対象とする機械工程 script の範囲と検証方法を導入・検査の Design が定めること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-004, AG-005]
    content: |
      | REQ-110-040 | 直接採用の採否記録は、外部戻り入力の受領記録と同じ証跡規律（由来と正式な採用根拠の区別、fail-closed、採用ごとの区別保存）で、工程領域の domain state として契約された保存先へ保存され、保存先が領域契約文書から発見できること |
      | REQ-110-041 | 工程領域の領域契約文書は、工程駆動の保存状態を初めて保存する正規経路で配布テンプレートから非破壊に実体化され、消費リポジトリから契約を発見できること。実体化は既存の領域契約文書を上書きせず、工程駆動を使用しないリポジトリを検査失敗扱いとしないこと |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-107.md
    source_items: [AG-006]
    content: |
      | REQ-107-009 | 正規成果物（REQ、Design、Decision）の初回作成・増分更新の書込み時機械検査は、文書本文・表中に引用する要件行IDの実在性を検査し、実在しない要件行IDを引用する書込みを完了扱いとしないこと。検査は同じ変更で作成される参照先を含む適用後状態で評価し、参照先の保存順序だけを理由に不合格としないこと |
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: docs/requirements/REQ-111.md
    source_items: [AG-007]
    content: |
      | REQ-111-019 | 採用済みの工程関係に後続工程が存在しない終端の遷移は、架空の後続工程を作らない記録形式で遷移記録へ保存され、保存された記録から終端であることを再構成できること |
      | REQ-111-020 | 終端の遷移後、当該工程の工程駆動の保存状態（テーマ正本、識別状態、遷移記録）は参照専用として保持されること。参照専用の保持は、完了済み過去工程の正規改訂（REQ-111-008）と変更駆動経路による作業を妨げないこと |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    target_area: 受け入れ条件対応
    source_items: [AG-004, AG-005]
    content: |
      | TS-013 | REQ-110-040 | 直接採用の採否記録の保存先・証跡規律・領域契約文書からの発見可能性の検証。検証義務は agentdev-workflow-phase-artifacts-update の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-artifacts-update.yaml の verification 宣言が所有する |
      | TS-014 | REQ-110-041 | 領域契約文書の配布テンプレート実体化・非破壊・工程駆動未使用リポジトリの扱いの検証。検証義務は工程系ワークフロースキル（agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-artifacts-update）と対応する command 契約（src/common/commands/agentdev/phase-*.md）の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-*.yaml 各ファイルの verification 宣言が所有する |
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: 受け入れ条件対応
    source_items: [AG-004, AG-005]
    content: |
      本節が REQ-110 の検証義務番号（TS-001〜TS-014）の定義所在を所有し、要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる（中央台帳・checker は新設しない）。完了済み Case 検証の実行記録は本節の対象外であり、本節は恒常的な検証手段との対応のみを保持する。要件行と恒常検証手段の対応関係の正本はリポジトリ top-level traceability/ 配下の sidecar 宣言であり、本節の対応表はその所在の解決先を提供する。
  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    target_area: 適用範囲
    source_items: [AG-004, AG-005]
    content: |
      - 対象へ追記: 直接採用の採否記録の保存先契約とその領域契約文書からの発見可能性、工程領域の領域契約文書の配布テンプレート実体化
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/case-open.md
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-001, AG-003]
    content: |
      #### 機械工程 script の実行前提の解決（REQ-029-014〜016）

      機械工程 script は producer 側の採番・構成の前提（REQ 行IDの桁数・書式、producer 固有ツールの存在、パス引数の環境形式）を埋め込み値として要求しない。実行前提は workflow 側で Project Extensions（`.agentdev/extensions/`）等のプロジェクト固有値から解決し、script へは明示入力として渡す。script 側の既定値に producer 前提を保持しない。

      - REQ 行IDの書式検証は桁数を固定しない許容書式（traceability checker 契約と同じ REQ-{NNNN}-{MMM} 形式）で行い、存在と有効性の検証（REQ-030-028 の規律）と組み合わせる
      - producer 固有のゲート（generate_indexes、check_integrity、traceability-check 等）を必須とする場合、script は当該ゲート実行体の配布先での存在を検査してから起動する。欠落時は fail-closed で報告し、正規の代替経路（証跡化、手動相当手順、対照実行による悪化ゼロ件の機械証明）への切替を報告 JSON に含める。代替経路の履行なしに検査を省略して成功扱いとしない
      - 横断依存検査（inspect_cross_dependencies.ts）の `--root` 等のパス引数は、Windows と Unix 系 shell のパス形式の違い（Git Bash の `/c/...` 形式等）を検出または正規化して受け付ける。正規化不能な形式は検査不能（detection_unavailable）として通過させず、形式エラーとして報告し、形式の違いだけで検出不能とならない
      - 本節の規律は case-ready、case-close の機械工程 script 呼び出しにも同一に適用される（各 Design の既有の同一規律参照を維持する）
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/local/install-script-usability.md
    target_area: install.ps1 -Mode check の検査カタログ
    source_items: [AG-002]
    content: |
      ### 機械工程 script の実行時前提の導入時検証（REQ-009-053）

      check モードは静的構成検査に加えて、配布物の主要な機械工程 script（定義PR準備、定義PR受入検査、クローズ機械工程、横断依存検査）の実行時前提の不一致を導入時に検出する。検証は各 script の副作用のない入力検証 dry-run 入口（入力 JSON の検証のみを行い、worktree 作成・ファイル変更・ゲート実行を行わない入口）または同等の手段によって行い、check モードの非破壊契約（REQ-050-005）を維持する。

      - 検証対象 script の範囲と各 script の dry-run 入口の仕様は配布 skill の script 契約（scripts/README.md 等）が所有し、本節は検出契機と報告形式を定める
      - 検出した前提の不一致（必須ゲートの不在、入力書式の不整合、解決不能なパス形式等）は既存の divergence 報告形式で報告し、check の終了コードに反映する。検証自体の実行失敗（script の不在、入口契約の不整合）は検証不能として報告し、成功扱いとしない
      - dry-run 入口を持たない機械工程 script に対しては、入力検証相当の検証方法（入力 JSON の契約検証、依存ツールの存在確認）を script 契約に定めてから check の検証対象へ組み込む
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_area: 保存構造と識別
    source_items: [AG-004, AG-005]
    content: |
      直接採用の採否記録は、工程領域の domain state として契約された保存先（`.agentdev/phase/adoptions/`、1採用1ファイル）へ、受領記録と同じ証跡規律（由来と正式な採用根拠の区別、fail-closed、bodyDigest による同一性識別）で保存する。採否記録の様式と機械生成は agentdev-phase-theme-collaboration 配下の決定的処理 script が所有する。

      工程領域の領域契約文書（`.agentdev/phase/README.md`）は配布テンプレート（共通原本 src/ 配下）を正本とし、工程領域の保存状態を初めて保存する正規経路（初回テーマ形成、テーマ更新の先行、直接採用による成果物作成等）が非破壊に実体化する。実体化は既存の領域契約文書を上書きせず、工程駆動を使用しないリポジトリを検査失敗扱いとしない。installer の check モードは、工程駆動の使用が検出される場合に限り領域契約文書の存在を確認してよい。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    target_area: 工程遷移
    source_items: [AG-007]
    content: |
      採用済み工程関係に後続工程がない終端の遷移は、架空の後続工程を作らない記録形式で遷移記録へ保存する。終端の記録形式（後続不在を表す toPhase の表現を含む）は phase-transition 配下の決定的処理 script が所有する schema が定め、保存された記録から終端であることを再構成できる。

      終端の遷移後、当該工程の工程駆動の保存状態（テーマ正本、識別状態、遷移記録）は参照専用として保持する。参照専用の保持は、完了済み過去工程の正規改訂（REQ-111-008）と変更駆動経路による作業を妨げない。テーマ正本のテーマ状態（active、merged、deprecated）に完了状態を追加せず、テーマの消化をもって工程の完了を記録・証明しない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-artifact-validation.md
    target_area: 提供する判断、操作
    source_items: [AG-006]
    content: |
      - 第4共通検証（書込み時引用識別子実在検証）の所有: 正規成果物（REQ、Design、Decision）の初回作成・増分更新の書込み時に、文書本文・表中に引用する要件行ID（桁数を固定しない許容書式。traceability checker 契約と同じ形式）が docs/requirements の要件行テーブルに実在することを検査する。検査は IR-067 の突合規則を書込み時に適用した版とし、検出対象の形式幅は script 契約がプロジェクトの採番に従って解決する（IR-067 の旧4桁帯除外は producer コーパス固有の免除であり、書込み時版の既定としない）。免除規則（code span、テンプレート、AUTOGEN、プレースホルダー形式等）の書込み時版を併せて定義する
      - 書込み時検証は同じ変更で作成される参照先を含む適用後状態で評価し、参照先の保存順序だけを理由に不合格としない
      - 書込み時検証の呼出しは保存経路（agentdev-req-file-manager、agentdev-design-file-manager、agentdev-workflow-phase-artifacts-update 経由の保存）側の保存手順に組み込まれ、検証の実行結果は保存操作の報告に含まれる

conflict_resolutions:
  - id: CR-001
    conflict: REQ-009 への APPEND（F1(b)）で SPLIT 予兆計算が合計3（要件行数53→+1、関心分類数3系統→+1、成果物種別数3以上→+1）となり SPLIT 推奨圏に達した
    resolution: ユーザー確認（2026-10-25 回答）により SPLIT せず APPEND を継続した。SPLIT 予兆は REQ-009 既存の構造（52行・関心複数）によるもので、F1(b) の1行追加が新たに悪化させるものではない。REQ-009 の分割は今回の対象範囲（F1〜F4）を超えるため、REQ 構造診断（inspect-docs）の検出経路に別件として残す。draft の要件行数は REQ-009 53行相当で requirements 生成後の SPLIT 予兆にも反映される
  - id: CR-002
    conflict: F4(1) 当該工程のテーマ群の完了クローズ記録を契約に持たせるか（入力文書は検討課題として本体側の壁打ち判断へ委譲）
    resolution: 対象外と判断した。テーマの消化は工程の成果物の妥当性や工程完了の証明ではない（docs/knowledge/phase-themes-and-progress-judgment.md の設計思想）。恒久台帳・進捗記録の禁止条項（REQ-110 適用範囲対象外、REQ-110-037）に整合し、テーマ状態（active、merged、deprecated）に完了状態を追加しない。テーマ完了クローズの需要は台帳の参照専用化（REQ-111-020）で解消する。今回新しい進捗管理を導入しない範囲の判断であり、将来のテーマ完了記録を恒久禁止する一般化ではない
  - id: CR-003
    conflict: F3 の引用識別子実在検査の適用範囲（入力文書は「REQ-XXXX-XXX 等の引用」と記載し「等」の解釈に曖昧性）
    resolution: 要件行ID（桁数を固定しない許容書式。traceability checker 契約と同じ形式）の引用に限定する最小版として要件化した。入力文書の完了条件の目安「実在しない要件行IDを引用する文書が、書込み時に機械検査で拒否されること」と「最小版（決定的に検出できる範囲でよい）」が要件行ID限定を裏付ける。Decision ID 等の全識別子への拡張は IR-067 の前倒しを超える新契約となるため今回の対象外とする

operation_units:
  - ou_id: OU-001
    target_req: REQ-029
    target_design: docs/designs/commands/case-open.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-009
    target_design: docs/designs/local/install-script-usability.md
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    target_req: REQ-107
    target_design: docs/designs/skills/agentdev-artifact-validation.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    target_req: REQ-110
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    target_req: REQ-111
    target_design: docs/designs/workflows/v51-phase-transition-and-coexistence-model.md
    operation: append
    scale: standard
    depends_on: [OU-004]
    recommended_order: 5
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      producer 採番（REQ-NNNN-NNN、4桁帯）の要件行を持つ fresh consumer 相当環境を用意し、定義PR準備機械工程（prepare_definition_pr.ts）に4桁帯の REQ 行ID を含む traceabilityReqIds 入力を与えて実行する。また必須ゲート実行体を意図的に配置しない環境で同一機械工程を実行する。合わせて定義PR受入検査・クローズ機械工程でも同一前提の入力検証を確認する
    pass_criteria: |
      4桁帯 REQ 行ID が入力検証を通過し、"invalid requirement row id" による exit 1 が発生しないこと（2026-10-24・2026-10-25 発生事象の再現が消滅）。必須ゲート不在時に存在検査が当該欠落を検出し、正規の代替経路（証跡化、手動相当手順、対照実行）の案内が報告 JSON に含まれること。代替経路の履行なしに検査を省略して成功扱いとならないこと
    on_failure: |
      fix-and-reverify。再発防止が目的の修正要件であり、前提不一致の検出不能が残る場合は本要件の不成立のため実装を修正して再検証する
  - id: TS-002
    target_item: AG-002
    verification: |
      機械工程 script の実行時前提に不一致（不在ゲート参照、不整合入力）がある consumer 環境で install.ps1 -Mode check を実行し、検証実行前後で git status・git diff を比較する
    pass_criteria: |
      前提の不一致が divergence 報告に含まれ、check の終了コードに反映されること。管理対象ファイルが変更されないこと（git diff --quiet の終了コード 0、REQ-050-005 維持）。検証自体の実行失敗（script の不在、dry-run 入口契約の不整合）が成功として報告されないこと
    on_failure: |
      fix-and-reverify。導入時検出の欠落は実行時障害の再発要因のため、実装を修正して再検証する
  - id: TS-003
    target_item: AG-003
    verification: |
      同一リポジトリ（未クローズ Case を持つ環境相当）に対して横断依存検査（inspect_cross_dependencies.ts）を Git Bash 形式パス（--root /c/...）と Windows 形式パスの両方で実行し、検出結果を対照する
    pass_criteria: |
      両形式で同一の検出結果（同一 detection 件数、detection_unavailable 0 件）となること（2026-10-25 11:44 の対照事例: Git Bash 形式で detection_unavailable 6件 → Windows 形式で 0 件、の不整合が解消）。形式の違いだけで終了コード 0 の検査不能通過が生じないこと
    on_failure: |
      fix-and-reverify。パス形式起因の検出不能は実行環境前提の欠陥のため、実装を修正して再検証する
  - id: TS-004
    target_item: AG-004
    verification: |
      直接採用の操作（phase-artifacts-update の直接採用経路）を実行し、採否記録の保存結果と契約文書を確認する
    pass_criteria: |
      採否記録が .agentdev/phase/adoptions/ へ1採用1ファイルで保存されること。様式が受領記録と同じ証跡規律（由来と正式な採用根拠の区別、fail-closed、bodyDigest による同一性識別）を満たすこと。保存先パスの規定がスキル契約文書（agentdev-workflow-phase-artifacts-update の記録の保存節）と領域契約文書（.agentdev/phase/README.md の保存モデル表）に存在すること（grep で .agentdev/phase/adoptions の記載を確認）
    on_failure: |
      fix-and-reverify。契約空白が残る場合は staff-schedule-cf と同じ発見不能状態が残存するため、実装を修正して再検証する
  - id: TS-005
    target_item: AG-005
    verification: |
      工程駆動を使用していない新規リポジトリで工程領域の初回保存操作（初回テーマ形成、または直接採用による成果物作成）を実行する。加えて、既に .agentdev/phase/README.md が存在する環境で同一操作を再実行する
    pass_criteria: |
      初回保存操作後に .agentdev/phase/README.md が存在し、内容が配布テンプレート（共通原本 src/ 配下）と一致すること。既存環境での再実行で既存の領域契約文書が上書きされないこと（実行前後でファイル内容が不変）。工程駆動を使用しないリポジトリで installer check が検査失敗扱いとならないこと
    on_failure: |
      fix-and-reverify。テンプレート実体化の欠落は契約の発見不能（F2 の本体障害）が残存するため、実装を修正して再検証する
  - id: TS-006
    target_item: AG-006
    verification: |
      実在しない要件行ID（例: REQ-9999-999）を本文中に引用する Design 文書の保存操作と、同じ変更で新しい REQ 行を作成しつつその行を引用する Design 文書の保存操作（REQ と Design の同時作成）を実行する
    pass_criteria: |
      実在しない要件行IDを引用する書込みで書込み時検査が不合格となり、当該作成が完了扱いとならないこと（2026-10-23 21:11 の正規Design文書9件作成時の誤引用混入が書込み時に検出される状態）。同じ変更で作成される参照先を含む適用後状態の評価では合格となること（参照先の保存順序だけを理由に不合格としない）
    on_failure: |
      fix-and-reverify。書込み時検出が働かない場合、品質確認が工程の外側・時間が後（inspect-docs 経由）に働く現状が残存するため、実装を修正して再検証する
  - id: TS-007
    target_item: AG-007
    verification: |
      後続0件の採用済み工程関係で終端遷移（phase-transition）を実行し、遷移記録の保存・読込を行う。終端遷移後に完了済み過去工程の正規改訂経路（REQ-111-008）の操作と変更駆動経路の操作が実行できることを確認する
    pass_criteria: |
      遷移記録が schema 違反とならずに保存され、保存された記録から終端であることを再構成できること（現行 schema の非空 toPhase 必須との不整合が解消）。テーマ正本・識別状態が参照専用として保持され、完了済み過去工程の正規改訂と変更駆動経路による作業が妨げられないこと
    on_failure: |
      fix-and-reverify。終端記録形式の不整合（schema 拒否）または参照専用化の欠落が残る場合、別セッションが工程台帳を現行正として読み続ける現状が残存するため、実装を修正して再検証する

realization_actions:
  - id: RA-001
    concern: 機械工程 script 3系統の producer 前提の解決（3桁 REQ 行ID固定の除去、必須ゲートの存在検査化、代替経路案内）
    responsibility: 定義PR準備（prepare_definition_pr.ts）、定義PR受入検査（accept_definition_checks.ts）、クローズ機械工程（close_mechanical_steps.ts）、definition-traceability-gate.ts の入力検証を、埋め込み前提から配布先で解決可能な前提へ変更する。REQUIRED_GATES の無条件必須化を存在検査+欠落時代替経路案内へ変更する
    ownership_hints: [src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（REQ_ROW_ID_PATTERN L255、KNOWN_GATE_ARG_CONTRACTS L295、requireReqIdList L384の3重化）、src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（L188、L282、REQUIRED_GATES L129-135）、src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（L233-239）、src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts（isReqRowId L67）]
    intent: REQ-029-014/015 の状態要件を満たす。対照: コードベース他箇所の許容型 \d{3,4}（shared_area_registration.ts、traceability lib、alloc-composite-id.ts）と下位 checker 契約の REQ-{NNNN}-{MMM} 形式に揃える
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: Project Extensions 側の前提値の設定表現
    responsibility: REQ 行ID書式の許容幅・ゲート構成等の機械工程前提をプロジェクト側で宣言する接続点を Project Extensions（.agentdev/extensions/）に整える。既存 extension schema に機械設定専用セクションが存在しない場合は、契約追加として新設するか既存 context 表現で賄うかを設計時に評価する（新規設定キーを採るなら契約追加として評価し、既存対応済みと扱わない）
    ownership_hints: [docs/designs/foundations/project-extensions.md（tool/config integration は context と project-local skill 委譲による部分表現、専用表現の要否は未決）、extension_state.ts、各 workflow skill の extensions 読込手順、src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts L8-10（共有領域の実パスは project-extensions の context 等から与える既存宣言）]
    intent: AG-001 の「Project Extensions 等のプロジェクト固有値から workflow 側で解決して script へ明示入力として渡す」を実現する。新規 config 機構は新設しない
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-003
    concern: install.ps1 check モードへの機械工程 dry-run 検証追加
    responsibility: install.ps1 -Mode check に主要機械工程 script の実行時前提検証を追加する。検証は副作用なし入口（入力 JSON 検証のみ）で行い、check の非破壊契約（REQ-050-005）を維持する。拡張位置は既存の静的検査（7b）と runtime diagnostics（8）の間を候補とし、先例（Show-RuntimeDiagnostics、Invoke-ThirdPartyDriftCheck）の報告形式に従う
    ownership_hints: [scripts/install.ps1（check モード L906-1190、拡張フック候補: 7b と 8 の間、L697-725 先例）、docs/designs/local/install-script-usability.md]
    intent: REQ-009-053 の状態要件を満たす。機械工程 script 側に dry-run 入口（RA-001 と合わせた副作用なし入力検証入口）の分離を含む
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-004
    concern: 横断依存検査のパス引数正規化
    responsibility: inspect_cross_dependencies.ts の --root 等のパス引数に、Git Bash 形式（/c/... 等）の検出・正規化を加える。正規化不能な形式は形式エラーとして報告し、detection_unavailable として終了コード 0 で通過させない
    ownership_hints: [src/common/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts（L36-37 無正規化受取、L77 path.resolve 誤解決）、scripts/lib/cross_dependency_types.ts、呼出契約: definition-pr-and-idempotency.md L122、readiness-and-cleanup.md L21、scripts/README.md L65]
    intent: REQ-029-016 の状態要件を満たす。2026-10-25 11:44 発生事象（Git Bash 形式で detection_unavailable 6件→Windows 形式で 0件、commit 467aadf）の再発防止
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-005
    concern: 直接採用の採否記録の保存先契約の規定
    responsibility: phase-artifacts-update SKILL.md の「記録の保存」節に、直接採用の採否記録の保存先（.agentdev/phase/adoptions/、1採用1ファイル）と証跡規律（受領記録と同じ規律）を規定する。phase-transition SKILL.md L88 の遷移記録パターン（.agentdev/phase/transitions/ の domain state 宣言+物理形式は script 所有）を前例とする
    ownership_hints: [src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md（L23 報告義務のみ、L43 受領記録は received/ 明記、L170-171 記録の保存節）、src/common/skills/agentdev-phase-theme-collaboration/SKILL.md、scripts/src/receive.ts（L52 printJson のみで保存は呼出側責務）]
    intent: REQ-110-040 の状態要件を満たす。staff-schedule-cf が .agentdev/phase/adoptions/ に ad-hoc 保存した契約空白（2026-10-22 11:30 のテーマ検討停止の原因）を解消し、実運用を正規化する
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-006
    concern: 領域契約 README の配布テンプレート作成と工程領域初回保存経路での実体化
    responsibility: 領域契約文書（.agentdev/phase/README.md）の配布テンプレート（正本）を共通原本 src/ 配下に新規作成する。工程領域の保存状態を初めて保存する正規経路（phase-tasks-create の初回テーマ形成、phase-tasks-update のテーマ更新先行、phase-artifacts-update の直接採用）に、テンプレートからの非破壊実体化を組み込む。本 repo の dogfood 実体（.agentdev/phase/README.md）はテンプレートの参照実装として整合させる。保存モデル表に adoptions/（と transitions/）の掲載を含める
    ownership_hints: [src/common/ 配下（テンプレート新規。src/common/ templates 42件に phase/README 相当なし）、src/common/skills/agentdev-workflow-phase-tasks-create/SKILL.md（L38-39 初回形成の現行副作用）、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-artifacts-update、agentdev-phase-theme-collaboration（sections.ts L3）、.agentdev/phase/README.md（dogfood 実体、保存モデル表 L8-13 は identity.yaml/themes.md/pending.md/received/ の4行のみ）]
    intent: REQ-110-041 の状態要件を満たす。領域契約 README の生成責務が誰にもない現状（参照する側は存在、生成する側が不在、配布テンプレート不在）を解消する
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-007
    concern: 書込み時引用識別子実在検証の実装と保存経路への組込み
    responsibility: agentdev-artifact-validation に第4共通検証（書込み時引用識別子実在検証）を新規実装する。要件行テーブルのインデックス構築（traceability lib requirements.ts の currentRequirementLineIds）と IR-067 の突合規則（check_integrity.ts の checkReferencedReqRowExistence）を流用し、免除規則の書込み時版を定義する。保存経路（req-file-manager、design-file-manager の保存手順、phase-artifacts-update 経由の保存）から検証を呼び出す手順を組み込む。agentdev-artifact-validation Design の v4 責務分類節の決定的処理委譲先リストへ第4検証を追加する
    ownership_hints: [src/common/skills/agentdev-artifact-validation/（scripts/ 配下に新規、現行3スクリプト）、src/common/skills/agentdev-traceability/scripts/lib/requirements.ts（L12-32 行IDインデックス）、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（L10362 checkReferencedReqRowExistence、IR-067 突合規則と免除規則 L36-47）、docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md、src/common/skills/agentdev-req-file-manager/references/save-procedure.md、src/common/skills/agentdev-design-file-manager/、src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md（L26 報告規律は維持し、保存経路での検証実行を組込む）、docs/designs/skills/agentdev-artifact-validation.md（v4 責務分類節 L93-99 の決定的処理委譲先リスト）]
    intent: REQ-107-009 の状態要件を満たす。IR-067 が full-audit（後段検査）でしか実行されない三重の欠落（書込み時非実行、機械検査契約非包含、参照整合は再編後のみ）を解消する
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-008
    concern: 終端遷移の記録形式の実装と台帳参照専用保持の表現
    responsibility: phase-transition 配下の決定的処理 script（schema.ts、store.ts）に終端遷移の記録形式（後続不在を表す toPhase の表現。例: 通常遷移は非空文字列、終端は null を許容する区別）を実装し、SKILL.md に終端記録形式の規定を加える。台帳参照専用保持の表現は RA-006 の領域契約 README テンプレート（保存モデル表）に transitions/ の掲載と併せて含める
    ownership_hints: [src/common/skills/agentdev-workflow-phase-transition/scripts/lib/schema.ts（L6-17 TransitionRecord 5フィールド、L35-38 非空 toPhase 必須・unknown fields 拒否、終端時 toPhase 規定の欠落）、store.ts（L89-92 .agentdev/phase/transitions/ 保存）、src/common/skills/agentdev-workflow-phase-transition/SKILL.md（L76-80 終端規定、L86-97 遷移記録の domain state 宣言）、successor.ts（L40-43 kind: terminal）]
    intent: REQ-111-019/020 の状態要件を満たす。schema の非空 toPhase 必須と終端記録の不整合（アーキテクチャ助言が指摘した「現行 schema で既に実現可能とは扱えない」）を解消し、終端遷移後に別セッションが工程台帳を現行正として読み続ける現状（identity.yaml の current_phase は phase-tasks 系操作の実行時解決でしか確定しないため書き手が残らない）を、参照専用の表現で明示する
    verification_refs: [TS-007]
    source_items: [AG-007]

review_dispositions:
  - id: RD-001
    source_item: F1(a)
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-029-014（前提の設定値化・プロジェクト検出）、REQ-029-015（ゲート存在検査と代替経路）として要件化した
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F1
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: F1(b)
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-009-053（導入時整合検査の dry-run 検証）として要件化した。副作用なし入口の分離を含む
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F1
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: F1(c)
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-029-016（パス引数の形式検出・正規化）として要件化した。F1(a) と併せ REQ-029 への追記とした
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F1
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_item: F2-1
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-110-040（採否記録の保存先契約）として要件化した。実運用の .agentdev/phase/adoptions/ を正規化し、様式・機械生成は Capability Skill 層の既存契約を維持する
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F2
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_item: F2-2
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-110-041（領域契約 README の配布テンプレート実体化）として要件化した。生成主体は工程側（初回保存経路、phase-tasks-create に限定しない）、installer check は条件付き存在検査（アーキテクチャ助言 2026-10-25 採用）
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F2
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_item: F3
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-107-009（書込み時引用識別子実在検査）として要件化した。要件行ID引用に限定する最小版（CR-003）とし、IR-067 の書込み時前倒しとして実装する
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F3
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_item: F4-1
    disposition: not_applicable
    reason_code: out_of_scope_by_delegation
    reason: |
      入力文書が本体側の壁打ち判断へ委譲した検討課題。テーマ群の完了クローズ記録は対象外と判断した（CR-002）。テーマ消化は工程完了の証明ではなく（docs/knowledge/phase-themes-and-progress-judgment.md）、恒久台帳・進捗記録の禁止条項に整合する。テーマ状態への完了状態追加は「今回新しい進捗管理を導入しない」範囲を超える。台帳の参照専用化（F4-2）で解消する
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F4
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_item: F4-2
    disposition: covered
    reason_code: requirements_appended
    reason: |
      REQ-111-019（終端遷移の記録形式）、REQ-111-020（台帳の参照専用保持）として要件化した。参照専用の保持は保存済み記録の保持に限定し、正規改訂（REQ-111-008）と変更駆動経路を妨げない（アーキテクチャ助言の範囲限定採用）
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-phase-driven-retrospective-20261025.md
      section: F4
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - {"target_file":"docs/requirements/REQ-029.md","target_content_sha256":"20de03a9041fd9fda73ca441cb0b47fb0e04e8cd337110605d012e7a94820652","check_scope":{"heading":"## 要件","start_line":16,"end_line":33},"execution_conditions":{"operation":"append","edit_sha256":"afed92131a450f70f7f8c9c63a80e5bb1cf369e09942836d4afd8ff8c2493297","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":4,"added":4,"removed":0},"executed_at":"2026-10-25T07:23:37.619Z"}
  - {"target_file":"docs/requirements/REQ-009.md","target_content_sha256":"bea11ef52139606197858817e4bf5a5084cc34d1ded6c6e55b49d7e3b96e3f99","check_scope":{"heading":"## 要件","start_line":18,"end_line":74},"execution_conditions":{"operation":"append","edit_sha256":"48092eb426ba7298c311c9dd79a5f1df543d5a28cb58e9fc14538e57541a0bde","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":2,"added":2,"removed":0},"executed_at":"2026-10-25T07:18:20.221Z"}
  - {"target_file":"docs/requirements/REQ-110.md","target_content_sha256":"0d53afb05d247cf4b4ca725e1068fb60bbcf7c603a577bacb4442715e6038267","check_scope":{"heading":"## 要件","start_line":12,"end_line":55},"execution_conditions":{"operation":"append","edit_sha256":"45b579b5c78dd18eb5acb1f8c95ef86cf9c9b1ab57880ae1452d7d5cf373a6e0","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":3,"added":3,"removed":0},"executed_at":"2026-10-25T07:18:20.309Z"}
  - {"target_file":"docs/requirements/REQ-107.md","target_content_sha256":"449840705294b7626c7a0588043bab3fa2aaf842f3b0feddcca5ff3b8387edad","check_scope":{"heading":"## 要件","start_line":13,"end_line":25},"execution_conditions":{"operation":"append","edit_sha256":"b5b2de8729594a3502a9ba80baa5f6ec9e4538da20f5fb3427d45b95fc68d8ad","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":2,"added":2,"removed":0},"executed_at":"2026-10-25T07:18:20.394Z"}
  - {"target_file":"docs/requirements/REQ-111.md","target_content_sha256":"c6275bdc4cf0bcc60e9f2f7cb5790426ea7d0c86017468a188af8eca601f8479","check_scope":{"heading":"## 要件","start_line":12,"end_line":34},"execution_conditions":{"operation":"append","edit_sha256":"b135c1fdfd2a811a97154bc0a660048d61b970615e0355076f6319baa22177cf","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":3,"added":3,"removed":0},"executed_at":"2026-10-25T07:18:20.479Z"}
  - {"target_file":"docs/designs/commands/case-open.md","target_content_sha256":"4d6655b9222fc541d6eb85d1ff456cad8b09e5b465fba56b4e3463802cb61e34","check_scope":{"heading":"### 機械工程の script 呼び出し契約（RU-0162）","start_line":75,"end_line":99},"execution_conditions":{"operation":"append","edit_sha256":"d474cdc87c3f48282458c43a159bdb9d9a45611d39581c579a4100cb7b6337cf","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":9,"added":9,"removed":0},"executed_at":"2026-10-25T07:18:20.562Z"}
  - {"target_file":"docs/designs/local/install-script-usability.md","target_content_sha256":"da7f0602a947cda6788ccea5ecbe538776abc387b77f10e96575ff4e9401d356","check_scope":{"heading":"## install.ps1 -Mode check の検査カタログ","start_line":102,"end_line":122},"execution_conditions":{"operation":"append","edit_sha256":"4dcf22a9847598d058d5d04d21bb87b48183c881f2a50b61834fc6b8eea58cf3","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":8,"added":8,"removed":0},"executed_at":"2026-10-25T07:18:20.648Z"}
  - {"target_file":"docs/designs/workflows/v51-phase-driven-collaboration-model.md","target_content_sha256":"664e8d6fbc71e9f879468965b81ecc80bbac81b2dddde09eb69e16b734337cab","check_scope":{"heading":"## 保存構造と識別","start_line":31,"end_line":36},"execution_conditions":{"operation":"append","edit_sha256":"b5213b3244f14b8a1ca549c46d9bf6909f3bfefd91f17a5c0b042aa0f6e596a8","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":4,"added":4,"removed":0},"executed_at":"2026-10-25T07:18:20.751Z"}
  - {"target_file":"docs/designs/workflows/v51-phase-transition-and-coexistence-model.md","target_content_sha256":"f7b51364a7d3d4f192de3f93426ec10af1c9b02519bcf4fe63d2c230cf8835f7","check_scope":{"heading":"## 工程遷移","start_line":16,"end_line":21},"execution_conditions":{"operation":"append","edit_sha256":"0c0bad8f2a0854a3947ce69e27a06b714bf9c1d4b04a23274fdbcca1b2e931c3","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":4,"added":4,"removed":0},"executed_at":"2026-10-25T07:18:20.834Z"}
  - {"target_file":"docs/designs/skills/agentdev-artifact-validation.md","target_content_sha256":"12eba78d008c6bfedbb4d909f099e026b14f4710ed95361db18224618ce2fd85","check_scope":{"heading":"## 提供する判断、操作","start_line":38,"end_line":47},"execution_conditions":{"operation":"append","edit_sha256":"e92c075e5680d2ef8f0ed144f560560b0dd684ab2f148c0712e9db7cfa36c322","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":4,"added":4,"removed":0},"executed_at":"2026-10-25T08:03:21.805Z"}
  - {"target_file":"docs/requirements/REQ-110.md","target_content_sha256":"0d53afb05d247cf4b4ca725e1068fb60bbcf7c603a577bacb4442715e6038267","check_scope":{"heading":"## 受け入れ条件対応","start_line":56,"end_line":74},"execution_conditions":{"operation":"append","edit_sha256":"fcd44d00a754644125c2cdb7384a958024ade18c9e113d393632f6183b26fd27","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":3,"added":3,"removed":0},"executed_at":"2026-10-25T08:03:21.892Z"}
  - {"target_file":"docs/requirements/REQ-110.md","target_content_sha256":"0d53afb05d247cf4b4ca725e1068fb60bbcf7c603a577bacb4442715e6038267","check_scope":{"heading":"## 受け入れ条件対応","start_line":56,"end_line":74},"execution_conditions":{"operation":"replace","edit_sha256":"c16559cda94e4016d4b97e21ca24280dad5f70ad431a80b27ce68992cd3137c0","expected_old_count":1},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":3,"all_ok":true},"post":{"count":3,"all_ok":true}},"diff_compact":{"changed_lines_count":1,"added":1,"removed":1},"executed_at":"2026-10-25T08:03:10.549Z"}
  - {"target_file":"docs/requirements/REQ-110.md","target_content_sha256":"0d53afb05d247cf4b4ca725e1068fb60bbcf7c603a577bacb4442715e6038267","check_scope":{"heading":"## 適用範囲","start_line":75,"end_line":83},"execution_conditions":{"operation":"append","edit_sha256":"81242607e2f2f4ff907b13a9b92e48e73e9b6af07e26d44edd0a9e39c6694357","expected_old_count":null},"checker":{"name":"assemble-draft-section","version":"0.2.0","settings":{"heading_match":"exact-after-normalization","old_text_count_check":true}},"result_affecting_references":{"heading_match_rule":"search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan","scan_scope":"target section only"},"checks_summary":{"pre":{"count":2,"all_ok":true},"post":{"count":2,"all_ok":true}},"diff_compact":{"changed_lines_count":2,"added":2,"removed":0},"executed_at":"2026-10-25T08:03:21.977Z"}

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001〜005 は各 REQ 単位の独立した append 操作。OU-002（F1(b) 導入時 dry-run）は OU-001（F1(a) 前提解決・副作用なし入口の分離）に依存する。OU-003（F3）は独立。OU-004（F2）と OU-005（F4）は .agentdev/phase/README.md テンプレート（RA-006/RA-008）で連携し、OU-005 は OU-004 に依存する（テンプレートへの参照専用保持文言の追記は RA-006 で作成されたテンプレートを前提とするため、同一ファイル並行編集を直列化する）。REQ-110 受け入れ条件対応セクションへの TS-013/014 追記と検証義務番号範囲記述の修正は Definition 編集（ACT-REQ-006/007）に含まれ、REQ-110 適用範囲への対象追記行も Definition 編集（ACT-REQ-008）に含まれる。5 Design への ADF-COVERS(design) 行追記（case-open Design に REQ-029-014〜016、install-script-usability Design に REQ-009-053、v51-phase-driven-collaboration-model Design に REQ-110-040/041、v51-phase-transition-and-coexistence-model Design に REQ-111-019/020、agentdev-artifact-validation Design に REQ-107-009）と対応 traceability sidecar の design 節追記は、case-open の Definition 編集（定義PR）へ Design ヘッダ対応宣言ブロックの更新（REQ-021-026 の契約に従う）として含める。REQ-021-024 の case-ready gate は design 対応宣言を判定材料とするため、この同期を欠かさない。verification/implementation の sidecar 宣言は case-run の実行担当が REQ-021-015 の既定に従って行い、policy.yaml の検証対応任意行登録の追随要否確認は REQ-030-015 で処理する
  wave_hints:
    - "Wave 1: OU-001（REQ-029 + case-open Design。前提解決の基盤）"
    - "Wave 2: OU-002（REQ-009 + install-script-usability Design）と OU-003（REQ-107 + artifact-validation Design）は並行可"
    - "Wave 3: OU-004（REQ-110 + v51-phase-driven Design）を実行し、続いて OU-005（REQ-111 + v51-phase-transition Design）を直列実行する（OU-005 depends_on OU-004。phase README テンプレートが同一ファイルのため並行編集を避ける）"
```

# summary

staff-schedule-cf（移行・再構築プロジェクト）で2026-10-22〜25に実施した工程駆動経路（3工程・テーマ20件）と変更駆動経路（backlog-auto 一式・Root Case #1/#3）の運用振り返りで利用者が確定した改善要求4件（F1〜F4）を要件化した。F1 の発生事象（定義PR 2件中2件で再発した producer 前提の埋め込み、横断依存検査のパス形式起因の検出不能、静的検査のみの導入時整合検査）、F2 の契約空白（採否記録の保存先不在、領域契約 README の配布テンプレート不在による発見不能、2026-10-22 11:30 のテーマ検討停止）、F3 の品質検証の後倒し（正規Design文書9件作成時の誤引用混入が工程の外側・時間が後の inspect-docs で検出）、F4 の終端遷移記録形式の未規定と台帳参照専用化の不在、をそれぞれ REQ-029/009/110/107/111 への APPEND と関連 Design 更新で解消する。アーキテクチャ助言サブエージェントの 4 ラベル構造結果（2026-10-25、ブロッカーなし）を採用済み。REQ-009 の SPLIT 要否はユーザー確認済み（SPLIT せず APPEND 継続）。

STEP-8 adversarial-review（2026-10-25 審議）の結果: 要件帰属（F1〜F4 → REQ-029/009/110/107/111 APPEND）は妥当、未解決ユーザー判断事項なし。accepted findings 6件を本ドラフトへ反映した: F-01（書込み時引用実在検査の ID 形式表記を桁数非固定の許容書式へ統一し、IR-067 の旧4桁帯除外を書込み時版の既定としない旨を明記: AG-006/CR-003/ACT-DESIGN-005）、F-02（REQ-110 受け入れ条件対応への TS-013/014 追記と検証義務番号範囲記述の修正を ACT-REQ-006/007 へ、適用範囲への対象追記行を ACT-REQ-008 へ、5 Design への ADF-COVERS(design) 行と sidecar design 節の同期を case-open の Definition 編集への委任として case_open_hints へ正確に明記、RA-007 の check_integrity.ts パスを実在パスへ修正）、F-03（ACT-REQ-008 として適用範囲追記行を追加）、F-04（RA-007 へ v4 責務分類節リスト更新を追記）、F-05（OU-005 の depends_on を OU-004 へ設定し Wave 3 を直列化）、F-06（CR-001 の誤記修正）。rejected findings 5件（REQ-029-015 の状態要件性、REQ-009 SPLIT 再提起、REQ-110-040/041 の台帳新設禁止抵触、REQ-107-009 と REQ-110-022 の衝突、case-open Design 追記位置の構造不適合）はいずれも棄却理由付きで反映不要。

重要変更の事前通知: 既存正規成果物への重要変更（5REQ への9要件行 APPEND、REQ-110 受け入れ条件対応・適用範囲への追記、5Design への追記）について、変更理由・変更内容・影響・確定事項・未確認事項を、ドラフトの git commit（永続化）に先行して2026-10-25 の実行出力へ通知した（通知→本記録→commit の順で実施。ドラフトファイル自体は STEP-6 で作成済みであり、ファイル作成が通知より先行した点は完了報告で報告する）。
