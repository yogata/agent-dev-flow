---
draft_type: req_draft
topic_slug: adf-v5-reimplementation-from-v500
status: draft
created_at: "2026-10-10T13:10:00+09:00"
source_rus:
  - "RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md（永続IDなし。logical_key: adf-v5-reimplementation-from-v500。source_type: chat / generated_by: session / agentdev_handoff: true〔self-hostingのため通常要件docとして処理〕）"
---

# draft-data

```yaml
work_type: feature
scale: large

summary: >-
  ADF v5.0.0（コミット 025b25474fd6143da6627c5e80c4b17f09a4e11c）を再出発点として、正規要件 REQ-104〜REQ-109（52行）が定義する v5 本来の機能を実装・適用できる状態を成立させる再実装プログラムである。
  正規要件は新規REQへ複製せず維持し、先行RU案6件の受け入れ条件48件（RU01-AC01〜RU06-AC09）と52行を多対多で照合して pass/fail/blocked/not applicable の独立判定を実動作の証拠で行う。
  実現面の変更は realization_actions として構造化して後続工程へ引き継ぎ、競合する現行要件行の再定義は移行期契約（REQ-105-008・REQ-108-012）と v4-v5-crosswalk の棚卸し経路に従って正式切替時に実行する。
  v5.0.1で追加された完遂判定機構（REQ-110/DEC-057/G0〜G10）は再実装の必須入力・復元対象としない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      再出発点と破壊的変更の方針。実装・正規契約の再出発点を v5.0.0（コミット 025b25474fd6143da6627c5e80c4b17f09a4e11c）とし、GitHub main が既にその内容に一致する場合は復帰作業を重複実行しない。作業開始時に一致を再確認する。
      v5.0.0 は未運用であるため、v5.0.0 のコード・内部状態・公開コマンド・ファイル配置との互換性維持を必要条件としない。必要な破壊的変更を許容する。v4 の旧コマンド・状態・内部パスも変更・廃止できる。
      一方、REQ-109-002〜008 と DEC-056 が定める、実在する移行対象の有効情報・移行元を守る義務は廃止しない。移行機能の成立と、実際の全プロジェクトへの移行作業は区別する。実在しない利用者データや未実施の移行を前提にしない。
      GitHub の Issue・PR・タグ・リリースなど外部履歴を不必要に改変することを要求しない。

  - id: AG-002
    content: |-
      完遂判定機構の非継承・非目的化。v5.0.1 に追加された REQ-110・DEC-057、G0〜G10 台帳・完遂判定器・反例投入機構を、再実装の必須入力・復元対象としない。完遂判定機構の増設を本作業の目的にしない。
      実効的な既存の品質検査や有効な記録を廃棄しない。不足を発見した場合は原則として機能・実行経路・根拠そのものを是正し、完遂条件・台帳・追加ゲートの増設へ逃げない。
      要件・Design の確定や対応宣言が実行機能の完成と取り違えられない。REQ・Design 確定、対応宣言、Issue 終了、PR マージは、それのみでは v5 全体完了の証拠にならない。

  - id: AG-003
    content: |-
      正規要件の維持と48条件の照合。REQ-104〜REQ-109 の計52行を正規要件としてそのまま保持し、新規REQへ複製しない。先行RU案6件の受け入れ条件48件（RU01-AC01〜RU06-AC09）と52行を多対多で照合する。48条件に直接現れない52行の義務も保持する。
      要件がすでに存在することを理由に「変更不要・実装不要」としない。実行中に既存REQが対象としない新しい実現要件を発見した場合のみ、根拠と変更範囲を明らかにして req-define 再合意による正規化を検討する。未合意の緩和を行わない。
      実装対象の再編により正規要件の変更が必要になった場合は、旧要求と新合意との差分・根拠を明示する。

  - id: AG-004
    content: |-
      移行期契約の遵守と競合解消の経路。v5 実行能力の確立までは REQ-105-008（採用宣言まで現に実効している運用を採用済み規約として扱う）と REQ-108-012（現行実行契約が実行経路の正として維持）の移行期契約に従う。文書上の再定義だけで処遇を実行済み扱いにしない。
      競合する現行要件行（REQ-030-001、REQ-005-001/010/011、REQ-035-006、REQ-061 周辺行）の再定義は、本 draft では行わない。v4-v5-crosswalk の棚卸し記録（defer 4 / keep 1 / keep・defer 1、未管理矛盾0件）に従い、正式切替時に正規改訂経路（REQ-108-005）で実行し、切替後に v4 との競合を残さない。
      新たな公開実行経路を新設する場合は REQ-005-011 の正規改訂を要する。その時点でアーキテクチャ的な重要判断（Decision 閾値以上）を伴う場合は Decision を作成する。未観測の競合を観測した場合は直ちに crosswalk へ追記して管理下に置く。

  - id: AG-005
    content: |-
      実現面変更の構造化ハンドオフ。正規要件の追加・変更が不要でも、未実現の振る舞いに必要な実現面の変更を実現面ごとに realization_actions へ投影する。どの実現面を変更すべきかの確定を後続の実行工程へ先送りしない。
      実行環境として、共通原本（src/common/**）、実行環境別原本（src/opencode/**・src/senpi/**）、正規の配布・配置機構、実行用配置物（.opencode/** 等）、ADF 適用先を区別する。一部の局所的な変更だけで完成と判定しない。
      上記六つの情報（現状の成立範囲、不足する振る舞い、再利用・変更・廃止候補、実際に使用する経路、実行時の確認方法、実証の証拠と適用範囲）のために専用の報告様式や重複表を新設しない。共通する実現面・検証事例をまとめつつ、個別条件の義務と証拠を追える形にする。実行側は、52行×48条件対応表（TS-003）と realization_actions の進行記録の中で、各要件・条件についてこれらの情報が追える形で現状分析の結果と実証の結果を記録する。

  - id: AG-006
    content: |-
      既存能力の再利用と判断の区分。機械的に決定可能な導出・判定はコードで行い、閉じた意味判断は必要な範囲に限定し、開放的なLLM推論は例外とする。
      既存の正規情報・Git・検証証拠から再構成できるもののために、恒久状態・台帳・品質ゲートをむやみに増やさない。理由のない永続版台帳・汎用依存グラフ・進捗管理機構を新設しない。
      既存機能の再利用を優先しつつ、v5 の目的に必要な破壊的変更は許容する。v4 の固定ライフサイクル、Definition Package 前提、Issue 必須、巨大な実行状態を不変の前提としないが、既存の委譲・隔離・並列実行・再開・最大自走・確定時検証など必要な機能は失わない。

  - id: AG-007
    content: |-
      代表事例による実証。次の2種を再実装を導く代表事例とし、実際のワークフローで実行して確認する。
      (a) 小規模変更を入力し、Issue を必須とせず、必要な要求・設計の確認から実装、検証、結果報告、改善情報の回収まで到達する事例。
      (b) 確定済み要求から設計だけを正式確定して独立終了する事例。
      これらは既存条件をまとめて実証する事例であり、新しい受け入れ条件や公開コマンド名・実装順序を固定するものではない。実装立上げに既存の Issue 使用経路を利用しても、それは Issue 不要の v5 経路の証拠ではない。完成後の実際の利用経路で別途確認する。

  - id: AG-008
    content: |-
      判定プロトコル。元48条件と基準時点の REQ-104〜109 全52行を判定の起点とし、対象コミット・実行環境・入力条件・期待結果・観測結果・証拠参照を対応付け、各項目を pass / fail / blocked / not applicable で独立判定する。
      正規改訂した行は、旧義務の引継ぎ先と変更根拠を明示し、「有効でない」とするだけで判定対象から除外しない。実装前に合意→要件→実装対象への対応を、実装後には合意→要件→実際の振る舞いの対応を確認する。従来の静的監査による分類は調査起点であり、実行時合格の実績ではない。
      実行対象は共通原本・実行環境別原本・配置物・ADF適用先を区別し、代表的な正常系、異常系、欠落・空状態、再実行・中断、依拠版不明、古い証拠、移行失敗、外部権限不足を対象に実際の振る舞いを確認する。
      模擬判定器の合格は実ワークフローの証拠ではない。個別作業での適用外はプロジェクトの採用規約・有効な契約から説明できる場合に限る。特定案件で利用しないこと、移行期の現行運用で利用できないこと、実案件への適用が見送られていることだけを理由に、v5 の提供義務を適用外としない。条件に応じた検証事例で能力を確認し、実案件への適用結果とは別に記録する。未実施・根拠不明・依存未解消を pass と扱わない。fail/blocked が残れば v5 全体の完遂を宣言しない。
      元の合意と正規要件が衝突する場合は差分を明示し、既存情報の保存義務や元の受け入れ条件を黙って除外しない。未合意の外部仕様、権限拡大、受け入れ条件の変更、必要情報の破棄が必要な場合のみユーザー判断を求める。可逆的な内部設計判断は実行エージェントに委ねる。

  - id: AG-009
    content: |-
      先行RU案6件の原文取得。コミット 21d5708301c3b6989025acb534987a3fb427d1da の次の6ファイルを原文として取得し、照合に用いる。
      .agentdev/backlog/adf-v5-ru-revised-01-core-process-model.md、同-02-artifact-design-finalization.md、同-03-change-impact-incremental-update.md、同-04-traceability-quality-verification.md、同-05-workflow-responsibility-reorganization.md、同-06-v5-migration-compatibility.md。
      先行RU案6件の全文を「入手できれば」と任意化しない。req-define は git コマンド実行禁止のため抽出できず、取得は実行側（case-open 以降）が git show 等の正規手段で行う。本 draft は RU 本文が保全した48条件全文・背景・問題・対象外を第一次照合の正として用い、原文入手後に背景・制約の欠落がないことを確認する。参照元の論理URIだけでは情報を省略しない。

  - id: AG-010
    content: |-
      必要情報の保全。v5.0.1 期間に実在した未処理 Intake・Learning・Backlog、改善記録、必要な参照・処理状態について、作業開始時の現状確認で保存が必要なものと不要な実装・契約を区別して特定する。
      すでに復帰操作が行われた場合は、復帰済みの内容と保全の実態を確認し、存在しない情報の再生成や根拠のない復元を要求しない。旧版で作成された合格報告は、復帰後の v5 機能実装を証明する新しい証拠として無条件に再利用しない。
      保存が必要と判断された未処理情報は、内容・処理状態・必要な参照関係を失わず後続処理へ継続する。欠落・参照不整合・処理状態不明がある場合は対象と理由を検証結果から特定し、破棄済み・処理済みとして黙認しない。

artifact_actions: []  # REQ/Decision/Design への保存操作なし（Jev 観測 20261010T035839Z-9364・architecture-advisory 確定事項に基づく。切替時の競合行再定義は AG-004 の経路で実行）

conflict_resolutions:
  - id: CR-001
    conflict: >-
      破壊的変更の許容（v5.0.0 未運用のため互換性を当然視しない）と、既存の移行元保全義務（REQ-109-002〜008・DEC-056）との混同リスク。
    resolution: >-
      実装構造・公開経路・内部状態の破壊的変更は許容する。ただし実在する v4 適用先等の有効な要件・受け入れ条件・判断理由・設計・実装・検証の意味、必要な参照と未処理情報の保全義務は維持する。両者を区別して扱い、移行元保全の緩和提案が生じた場合は未合意事項として別途ユーザー判断を求め、48条件を事後的に書き換えない（RU Source Summary・要件化の方向）。
  - id: CR-002
    conflict: >-
      既存正規要件（REQ-104〜109、52行）と本プログラムの関係。重複所有せず、かつ「要件が既存」を実装不要の根拠にしない。
    resolution: >-
      52行を正規のまま保持し新規REQへ複製しない。未実現の振る舞いは realization_actions へ投影して実現面の変更として扱い、実現面確定の先送りは行わない。既存REQが対象としない新実現要件の発見時のみ根拠付きで正規化を検討する（RU 統合理由・要件化の方向・H節）。
  - id: CR-003
    conflict: >-
      v5 要件と現行実行契約の競合（crosswalk 棚卸し対象6行: REQ-030-001、REQ-005-001/010/011、REQ-035-006、REQ-061 周辺行）。
    resolution: >-
      REQ-108-012（移行期権威行）と v4-v5-crosswalk の棚卸し構造で管理された矛盾として扱う。開発期間は現行実行契約が正であり、再定義は正式切替時に crosswalk 記録の処遇（defer 4 / keep 1 / keep・defer 1）に従い正規改訂経路（REQ-108-005）で実行する。未観測の競合は crosswalk へ追記して管理下に置く（crosswalk 集約サマリ・未管理矛盾0件）。
  - id: CR-004
    conflict: >-
      入力RUの保存契約への既知の乖離。REQ-008-051 必須字段（generation_actor・agreement_confirmed_at）が欠落し、永続ID（RU-NNNN）への採番・リネームが未実施。RU 自身が作業仮定でこの乖離を記録している。
    resolution: >-
      本 draft は RU の内容合意（ユーザー承認済み・RU 本文が正）を入力として採用し、乖離は記録的事項として扱って作業を継続する（2026-10-10 の req-define 起動を RU 末尾の追加承認条件を満たす明示承認と解釈）。req-define のファイル編集スコープは .agentdev/drafts/** のみのため RU ファイル自体の正式化（メタデータ補完・採番・リネーム）は実施しない。RU の正式化は case-open 実行前にユーザー側で実施することが望ましく、後続工程は本件を理由に停止しない。

operation_units:
  - ou_id: OU-0001
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-109
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      基準点の確認と必要情報の保全（RU 対象A）。v5.0.0 タグ・main 一致の作業開始時確認、復帰済み確認、v5.0.1 期間の未処理情報の棚卸しと保全区分。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0002
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-104
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 3
    issue_policy: epic
    note: >-
      工程構成と採用規約機構の実現（RU 対象B・RU01）。採用済み工程・関係・必須成果物の参照・解決、移行期デフォルト接続、未採用誤判定回避。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0003
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-105
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 4
    issue_policy: epic
    note: >-
      成果物の意味と工程別正式確定の実現（RU 対象C・RU02）。独立Design文書非一律必須化、採用時の欠落検出、設計の独立確定と最終充足の別判定。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0004
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-106
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 5
    issue_policy: epic
    note: >-
      依拠版差分・変更影響・増分更新の実現（RU 対象D・RU03）。依拠上流と現行上流の比較、代替整合確認、影響分類、中間変更の伝播。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0005
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-107
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 6
    issue_policy: epic
    note: >-
      工程間追跡と品質検証の実現（RU 対象E・RU04）。隣接工程間の双方向追跡、棚卸し・発見候補、構造検査と意味品質の分離。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0006
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-108
    scale: large
    depends_on: [OU-0001]
    recommended_order: 2
    issue_policy: epic
    note: >-
      有限実行とワークフロー責務再編の実現（RU 対象F・H・RU05）。Case 中心の責務集中（Definition Package 事前一括確定、Root Case 必須、case-ready 責務集中、case-close の合格判定と Issue 終了の混同、case-revise の特別巻き戻し、case-auto 固定遷移）を不変の前提とせず再編する。委譲・隔離・並列実行・再開・最大自走・確定時検証は維持する。構造中核であり他領域の検証基盤になるため早期着手。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0007
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: REQ-109
    scale: standard
    depends_on: [OU-0001]
    recommended_order: 7
    issue_policy: epic
    note: >-
      v5 移行能力の実現と検証（RU 対象G・RU06）。管理された検証対象での移行手順の実行、移行元保全、未処理3系列の継続、失敗・中断時の照合。移行能力の検証と実案件への移行作業は区別する。REQ ファイル操作は持たない（実現系 OU）。
  - ou_id: OU-0008
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    target_req: "REQ-104〜REQ-109（横断）"
    scale: large
    depends_on: [OU-0002, OU-0003, OU-0004, OU-0005, OU-0006, OU-0007]
    recommended_order: 8
    issue_policy: epic
    note: >-
      代表事例の実証と48条件・52行判定プロトコルの実行（RU 対象F代表事例・検証方法原則）。小規模一気通貫事例と設計のみ独立確定事例の実行、52行×48条件対応表に基づく独立判定と証拠記録、先行RU案6件原文との照合。実現系 OU の完了を前提とする。REQ ファイル操作は持たない（実現系 OU）。

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      作業開始時（case-open 実行時）に、git tag v5.0.0 の参照コミットが 025b25474fd6143da6627c5e80c4b17f09a4e11c に一致すること、GitHub main 先頭コミットが基準コミットに一致することを実行環境で確認する。復帰操作が完了済みの場合は復帰済みの証拠を確認し重複実行しない。外部履歴（Issue・PR・タグ・リリース）は改変しない。
    pass_criteria: |-
      タグ参照・main 一致が確認できたこと、または復帰済みであることの実証が得られたこと。基準点確認の結果と実行時点を証拠として記録したこと。
    on_failure: |-
      fix-and-reverify。基準点が不一致の場合は復帰手順を実行し、完了後に再確認する。復帰の重複検出時は重複実行を中止して既存実績を証拠化する。
  - id: TS-002
    target_item: AG-009
    verification: |-
      コミット 21d5708301c3b6989025acb534987a3fb427d1da から先行RU案6件（.agentdev/backlog/adf-v5-ru-revised-01〜06）を原文として取得し、RU 本文が保全した48条件全文（RU01-AC01〜RU06-AC09）・背景・問題・要件化の方向・対象外と本文レベルで照合する。
    pass_criteria: |-
      6ファイルの全文取得ができ、48条件の文言がRU本文と一致し、背景・制約・対象外の記述に欠落がないこと。
    on_failure: |-
      fix-and-reverify。取得経路の障害は正規手段（該当コミットのオブジェクト参照）で是正して再取得する。原文とRU本文の差異を検出した場合は差分を明示し、元の合意内容を正として扱う。
  - id: TS-003
    target_item: AG-003
    verification: |-
      52行×48条件の多対多対応表を作成する。各48条件が少なくとも1つの正規要件行に対応すること、48条件に直接現れない52行の義務が保持対象として明示されることを確認する。
    pass_criteria: |-
      全48条件に対応する正規要件行が存在し、対応不能な条件が0件であること（対応不能が検出された場合は根拠と変更範囲を明示して正規化検討として申告済みであること）。52行すべてが保持対象として確認されていること。
    on_failure: |-
      fix-and-reverify。対応不能条件は既存REQへの追加・新規正規化ではなく、根拠と変更範囲を明示した req-define 再合意による正規化検討に接続する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      開発期間を通じて REQ-105-008・REQ-108-012 の移行期契約に従い作業が進んだことを確認する。棚卸し対象の現行要件行が保護下で現行どおり正として扱われたこと、開発中の v5 経路と現在の正規利用経路が区別されたこと、未観測の競合が crosswalk へ追記されたことを確認する。
    pass_criteria: |-
      移行期契約違反0件・未管理矛盾0件の維持確認。crosswalk の処遇時点が planned のまま保護下で運用されたこと。
    on_failure: |-
      fix-and-reverify。違反があった場合は現行経路へ戻す。未管理矛盾を観測した場合は crosswalk へ追記して管理下に置く。
  - id: TS-005
    target_item: AG-002
    verification: |-
      本プログラムの成果物について、完遂判定機構（REQ-110/DEC-057/G0〜G10 相当の恒久台帳・判定器・反例投入機構）が新設されていないことを確認する。実効的な既存品質検査（例: textlint 最終検査、配布物整合性検査、artifact-validation 系スクリプト）と有効な記録が維持されていることを確認する。
    pass_criteria: |-
      完遂判定機構の新設0件。既存の実効品質検査が実行可能な状態で維持されていること。
    on_failure: |-
      fix-and-reverify。増設されていた場合は除去し、不足の解消は機能・実行経路・根拠の是正で行う。必要な記録の廃棄があった場合は復元する。
  - id: TS-006
    target_item: AG-008
    verification: |-
      REQ-104 領域（RU01-AC01〜AC06）の実動作を確認する。基本責務のみを採用した構成と詳細工程・必須成果物を採用した構成の両方で、採用規約の参照・解決、未採用参照例の欠落誤判定回避、採用済み必須成果物不在の扱い、工程の分割・統合・省略、単独工程と一気通貫の双方、恒久的工程進捗管理の非必須を実行して確認する。
    pass_criteria: |-
      RU01-AC01〜AC06 の6条件すべてが pass（個別事例での適用外は採用規約・有効な契約から説明され、能力検証事例として別途記録されること）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。受け入れ条件の文言変更は48条件の事後的書換として行わない。
  - id: TS-007
    target_item: AG-008
    verification: |-
      REQ-105 領域（RU02-AC01〜AC06）の実動作を確認する。必要な設計内容・根拠の特定、独立Design文書不在だけを理由としない設計責務成立、独立設計書必須採用時の欠落検出、コード・設定の存在や対応宣言だけの非合格、設計と実装を兼ねるファイルの扱い、設計成果物の後続を待たない正式確定、設計確定と最終要求充足の別判定を実行して確認する。
    pass_criteria: |-
      RU02-AC01〜AC06 の6条件すべてが pass（適用外の扱いは TS-006 と同じ原則に従う）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。
  - id: TS-008
    target_item: AG-008
    verification: |-
      REQ-106 領域（RU03-AC01〜AC09）の実動作を確認する。依拠上流と現行上流の差分候補取得、新規作成時の旧下流比較の非要求、比較基準不明時の代替整合確認、中間工程で更新不要となった変更起点の後続伝播、正味差分ゼロでも中間版依拠下流への影響評価、空対応での必要探索、影響候補ごとの更新・作成・更新不要・未確認の分類と根拠、再利用証拠の適用性確認、正式確定と変更反映完了の別判定を実行して確認する。
    pass_criteria: |-
      RU03-AC01〜AC09 の9条件すべてが pass（適用外の扱いは TS-006 と同じ原則に従う）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。
  - id: TS-009
    target_item: AG-008
    verification: |-
      REQ-107 領域（RU04-AC01〜AC08）の実動作を確認する。採用された隣接工程間の双方向追跡、細分化時の隣接対応、宣言外実在成果物の発見候補扱い、構造的不整合の検出、見出し・説明節の存在だけの一律不合格回避、グループ化と個別義務の保持、局所試験合格と最終実証の区別、変更前証拠の適用可能性確認を実行して確認する。
    pass_criteria: |-
      RU04-AC01〜AC08 の8条件すべてが pass（適用外の扱いは TS-006 と同じ原則に従う）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。
  - id: TS-010
    target_item: AG-008
    verification: |-
      REQ-108 領域（RU05-AC01〜AC10）の実動作を確認する。設計形成の独立終了、小規模変更での Epic/Issue 非必須、有限作業での Issue 利用と実行境界の正規情報再所有禁止、上流問題判明時の正規改訂接続、中断再開の永続状態依存、意味的依存未充足時の後続開始禁止、並列上限の独立実行制御、PR マージ・Issue 終了だけの完了宣言禁止、外部副作用の権限・安全条件限定、Intake・Learning・Backlog の改善循環（実行から生じた改善情報の循環還元を含む）を実行して確認する。
    pass_criteria: |-
      RU05-AC01〜AC10 の10条件すべてが pass（適用外の扱いは TS-006 と同じ原則に従う。旧公開コマンド名・旧内部状態の維持を合否条件にしない）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。
  - id: TS-011
    target_item: AG-008
    verification: |-
      REQ-109 領域（RU06-AC01〜AC09）の実動作を確認する。既存コマンド・内部状態の変更・廃止だけでの不適合判定回避、有効な要件・受け入れ条件の移行先での意味確認、重要判断・設計の理由と参照確認、実装成果物と検証手段・証拠の対応関係確認、移行失敗・中断後の移行元読出・照合、欠落・不整合・検証不能時の移行成功確定禁止、人手介入を含む移行の適合性、未処理3系列の内容・処理状態・参照関係の確認と後続処理継続、移行時欠落の特定と黙認禁止を実行して確認する。管理された検証対象で実際の移行手順を動かす。
    pass_criteria: |-
      RU06-AC01〜AC09 の9条件すべてが pass（適用外の扱いは TS-006 と同じ原則に従う。移行能力の検証と実案件への移行適用は区別して記録する）。
    on_failure: |-
      fix-and-reverify。機能・実行経路・根拠を是正する。
  - id: TS-012
    target_item: AG-007
    verification: |-
      代表事例2種を実際のワークフローで実行する。(a) 小規模変更を Issue/Epic 必須とせず、要求・設計の確認から実装、検証、結果報告、改善情報の回収まで到達する事例。(b) 確定済み要件を入力とする設計形成を、後続の実装・Issue 作成を強制せず独立終了する事例。実装立上げに既存の Issue 使用経路を利用した場合は、完成後の実際の利用経路で Issue 不要の v5 経路を別途確認する。
    pass_criteria: |-
      両事例がともに既存48条件をまとめて実証し、新しい受け入れ条件や公開コマンド名・実装順序を固定していないこと。事例の入力条件・期待結果・観測結果・証拠参照が記録されていること。
    on_failure: |-
      fix-and-reverify。到達できなかった工程の機能・実行経路・根拠を是正し、事例を再実行する。
  - id: TS-013
    target_item: AG-010
    verification: |-
      v5.0.1 期間に実在した未処理 Intake・Learning・Backlog、改善記録、必要な参照・処理状態を作業開始時に棚卸しする。保存対象と廃止対象を根拠付きで分類する。復帰操作済みの場合は復帰済み内容と保全実態を照合する。旧版の合格報告を新しい証拠として扱わない。
    pass_criteria: |-
      保存対象の漏れなし・根拠なき再生成・復元要求なし・旧合格報告の無条件再利用なし。保存対象の未処理情報の内容・処理状態・参照関係が確認され後続処理へ継続されていること。
    on_failure: |-
      fix-and-reverify。欠落・参照不整合・処理状態不明があれば対象と理由を特定し、保全・是正して再確認する。
  - id: TS-014
    target_item: AG-004
    verification: |-
      正式切替の計画が次を含むことを確認する。(a) 開発中の v5 経路と現在の正規利用経路の区別、(b) v5 の検証方法と実現確定の判断根拠、(c) 競合する旧要件行・参照先の処遇時点（crosswalk 記録の confirmed→executed 遷移を正規改訂経路で実行する手順）、(d) 配布・配置・利用先の切替後確認。切替実行時には処遇実行と競合残存なしを確認する。
    pass_criteria: |-
      計画レビュー要件（RU 引継ぎ対応の正式切替の計画レビュー）の4項目すべてを計画が満たすこと。切替実行後は処遇が executed に遷移し v4 との競合が残存しないこと。
    on_failure: |-
      fix-and-reverify。計画の欠落項目を補い、処遇実行の不備は正規改訂経路で是正して再確認する。
  - id: TS-015
    target_item: AG-005
    verification: |-
      実現面の変更について、共通原本（src/common/**）、実行環境別原本（src/opencode/**・src/senpi/**）、正規の配布・配置機構による生成・配置物（.opencode/** 等）、ADF 適用先を区別して確認する。共通原本の変更が配布機構を経由して配置物に反映され、適用先で実際に動作することを確認する。
    pass_criteria: |-
      4層すべての確認済み。正規の配布経由で配置が反映され、適用先の実動作で検証されていること。局所的な原本変更だけを根拠とした完成判定が行われていないこと。
    on_failure: |-
      fix-and-reverify。未配布・未適用の層がある場合は配布・適用・検証を完了して再確認する。

realization_actions:
  - id: RA-001
    concern: 基準点確認と必要情報保全の実現面
    responsibility: |-
      v5.0.0 基点の再確認手順（タグ参照・main 一致・復帰済み確認）と、v5.0.1 期間の未処理情報（Intake・Learning・Backlog・改善記録・参照・処理状態）の棚卸し・保全区分・後続継続を、作業開始時検証として実際に実行できる経路を持つこと。
    ownership_hints:
      - "git タグ・コミット参照・main 照合（実行環境側の操作。req-define は git 実行禁止）"
      - ".agentdev/intake/**・.agentdev/learning/**・.agentdev/backlog/** の状態棚卸し"
      - "REQ-109-007/008・DEC-056（未処理3系列の保全と継続）"
      - "docs/designs/foundations/references/v4-migration-and-release.md・REQ-103-028 baseline tag（対照基準）"
    intent: |-
      誤った基準点からの作業と、存在しない情報の再生成・根拠なき復元・実在情報の喪失を防ぐ。復帰済み作業の重複実行を避ける。
    verification_refs: [TS-001, TS-013]
    source_items: [AG-001, AG-010]
  - id: RA-002
    concern: 採用規約機構と工程構成の実現面
    responsibility: |-
      v5-adopted-conventions.md が定める宣言・保存・解決の3機能を、対象作業の実行時点から再構成できる形で実現すること。採用済み工程・工程間関係・必須成果物の参照・解決、採用宣言不在時の移行期デフォルト接続、未採用参照例の欠落誤判定回避、採用済み必須成果物不在の根拠確認（作成・採用外・省略の分類）を実際の実行で動かせること。
    ownership_hints:
      - "docs/designs/foundations/v5-adopted-conventions.md（既存Design。機械的解決器の実装面は後続の実装Designが所有）"
      - "REQ-104-003/004・REQ-105-008"
      - "Project Model 層の正規成果物としての採用規約の保存先（Design 記載の Project Contract 再構成要素）"
    intent: |-
      共通の必須責務のみを標準とし、詳細工程・必須成果物はプロジェクトの採用に委譲する。運営上の工程構成と対象システムの設計内容の混同を防ぐ。
    verification_refs: [TS-006]
    source_items: [AG-003]
  - id: RA-003
    concern: 成果物の意味と工程別正式確定の実現面
    responsibility: |-
      要求・Decision・設計・実装・検証の意味の区別を各工程の成果物が自ら所有すること。設計責務の成立を独立Design文書の存在に一律依存させず、独立設計書を必須採用した場合の欠落を検出し、コード・設定の存在や対応宣言だけでは設計妥当性を合格にせず、設計と実装を兼ねるファイルに必要な検証を行えること。設計成果物を後続工程を待たず正式確定でき、設計確定と最終要求充足を別判定できること。
    ownership_hints:
      - "REQ-105-001〜007・DEC-053"
      - "正式確定の状態模型と保存先（成果物状態管理。現在の Design draft/accepted ライフサイクルの再評価を含む）"
      - "工程別の確定・終了を支える実行経路（OU-0006 の責務再編と協調）"
    intent: |-
      独立Design文書の一律必須化を解消しつつ、設計内容の根拠と工程独立確定を維持する。
    verification_refs: [TS-007]
    source_items: [AG-003]
  - id: RA-004
    concern: 依拠版差分・変更影響・増分更新の実現面
    responsibility: |-
      既存下流が実際に依拠した上流状態と現行上流状態を特定・比較し、Git 差分と内容上の影響を区別すること。差分抽出は機械処理を基本とし、比較元不明は根拠ある代替確認か影響未確認とすること。対応関係が空でも必要な候補探索を行い、影響を更新・作成・更新不要・未確認に分類して根拠を示すこと。変更起点を中間工程で更新不要でも後続に伝え、A→B→A の正味差分ゼロでも中間版に依拠する下流への影響を落とさないこと。個別工程の正式確定と全工程への変更反映完了を別判定すること。
    ownership_hints:
      - "agentdev-traceability（impact・差分候補抽出の拡張候補。DEC-054 結果影響が要件docのrealization_actionsへのハンドオフを先例化）"
      - "REQ-106-001〜009"
      - "Git からの再構成を優先する実装方針（版不明・中間変更の扱いを含む）"
    intent: |-
      v4 の固定範囲 impact ではなく、実際の下流依拠版に基づく差分・影響を扱う。全件再生成は要求しない。
    verification_refs: [TS-008]
    source_items: [AG-006]
  - id: RA-005
    concern: 工程間追跡と品質検証の実現面
    responsibility: |-
      プロジェクトが採用した隣接工程間の成果物・追跡単位を双方向に追跡すること。宣言された関係だけでなく実在成果物を確認し、宣言外の追跡候補を発見候補として扱えること。参照欠落・不整合等の構造的不整合を検出し、構造検査と要求内容の品質評価を分離し、グループ化によって個別の受け入れ義務を消さないこと。
    ownership_hints:
      - "agentdev-traceability（covers 拡張・棚卸し・check 検査項目。DEC-054）"
      - "REQ-107-001〜008"
      - "全成果物にREQとの重複した直接対応を要求しない追跡モデル"
    intent: |-
      宣言済み関係だけに依存しない実体ベースの追跡と、構造と意味品質の責務分離を成立させる。
    verification_refs: [TS-009]
    source_items: [AG-006]
  - id: RA-006
    concern: 有限実行とワークフロー責務再編の実現面
    responsibility: |-
      要求確定・設計形成・Issue 分割・実装・検証・PR 処理・後処理に集中している現行 Case 中心の責務を、要件確定・設計確定・実装構築・検証・Issue 協調・後処理へ再配置すること。Definition Package による事前一括確定、Root Case 必須、Issue 必須経路、巨大な実行状態を不変の前提としないこと。小規模案件の連続実行（Epic/Issue 非必須）と段階案件の工程単独確定・終了を両立させること。中断・再開、依存未充足時の停止、共有並列上限、権限外副作用の拒否、完了は権限と証拠による確定を維持すること。既存の委譲・隔離・並列実行・再開・最大自走・確定時検証の機能を失わないこと。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-*.md（case-open/case-ready/case-run/case-close/case-revise・case-auto の制御平面）"
      - "src/common/commands/agentdev/ 配下の公開コマンド契約（case-auto 等の公開入口）"
      - "Definition Package・Root Case 必須化・case-ready 責務集中・case-close 合格判定と Issue 終了の混同・case-revise 特別巻き戻し・case-auto 固定遷移（再評価対象の現行前提）"
      - "REQ-108-001〜012・DEC-055・crosswalk 棚卸し対象6行（切替時の正規改訂経路）"
      - "新たな公開実行経路を新設する場合は REQ-005-011 の正規改訂（本プログラムでは採否を確定しない）"
    intent: |-
      Case 関連に集中した責務を v5 の責務分割へ再編し、工程独立実行・小規模一気通貫・有限作業の Issue 協調を両立させる。別名の巨大な状態への置換えは行わない。
    verification_refs: [TS-004, TS-010, TS-012]
    source_items: [AG-004, AG-005]
  - id: RA-007
    concern: v5 移行能力の実現面
    responsibility: |-
      実在する v4 適用先等を v5 に移行する能力（有効な要件・受け入れ条件・判断理由・設計・実装・検証の意味と参照の保持、移行元の非破壊、失敗・中断時の移行元照合、未処理3系列の継続、欠落・不整合・検証不能の検出）を実現し、管理された検証対象で実際の移行手順を動かして検証できること。移行能力の検証と特定プロジェクトへの移行適用を区別すること。
    ownership_hints:
      - "REQ-109-001〜008・DEC-056"
      - "docs/designs/foundations/references/v4-migration-and-release.md・v4-v5-crosswalk.md（移行対照と棚卸し）"
      - "REQ-103-028 baseline tag（v4 収束時点の一意比較点としての対照基準）"
    intent: |-
      破壊的変更と意味保存を区別し、実在する有効情報の継承を検証可能にする。全プロジェクトへの一律移行・完全自動化を必須としない。
    verification_refs: [TS-011, TS-013]
    source_items: [AG-001]
  - id: RA-008
    concern: 改善循環の維持の実現面
    responsibility: |-
      Intake・Learning・Backlog を継続的な発見・改善と要件化への接続能力として維持すること。発見・学習情報を必要な評価と承認を経て要件候補へ接続し、要件化・実装・検証へ渡せること。実行から生じた改善情報も同じ循環へ還元できること。旧公開コマンド名や旧内部状態の維持を合否条件としないこと。
    ownership_hints:
      - "REQ-108-011・DEC-055"
      - "intake 系・learning 系・backlog 系の workflow skills と .agentdev 配下の状態ディレクトリ"
    intent: |-
      v5 の責務再編後も発見・学習の改善循環が機能し続けることを保証する。
    verification_refs: [TS-010]
    source_items: [AG-003]
  - id: RA-009
    concern: 実行環境別原本・配布・適用先の区別と検証の実現面
    responsibility: |-
      共通原本（src/common/**）、実行環境別原本（src/opencode/**・src/senpi/**）、正規の配布・配置機構、実行用配置物（.opencode/** 等）、ADF 適用先を区別して管理・検証すること。共通原本の変更が配布機構を経由して各実行環境の配置物へ反映され、適用先で動作すること。実装原本・実行環境別原本・配置物・適用先を区別せずに検証することがないようにすること。
    ownership_hints:
      - "docs/designs/foundations/multi-host-canonical-model.md（マルチホスト正本モデル）"
      - "src/common/README.md 記載の配置契約（共通正本・tools・guards）"
      - "配布機構・導入系スクリプト・textlint plugin の依存生成を含む配布物管理"
    intent: |-
      局所的な原本変更だけで完成と判定されないよう、原本から配置・適用先までの実在する各層の動作を検証対象にする。
    verification_refs: [TS-015]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
    source_item: "RU全体（logical_key: adf-v5-reimplementation-from-v500。背景・問題・Source Summary・統合理由・目的・要件化の方向・正規所有者とアンカー・依存関係・対象A〜H・対象外・検証原則・48条件・引継ぎ対応・作業仮定・判定状況）"
    disposition: covered
    reason_code: structured-program-handoff
    reason: |-
      本 draft が RU の全構成要素を再実装プログラムとして構造化して引き継いだ。対象A〜Hは OU-0001〜0008 と RA-001〜009 へ、48条件と検証原則は AG-008・TS-001〜015 へ、破壊的変更と保全の区別は AG-001・CR-001 へ、移行期契約と競合解消は AG-004・CR-003 へ、原文取得義務は AG-009・TS-002 へ、RU メタデータの既知の乖離は CR-004 へ対応する。RU 本文8セクションは自足性を持ち、本 draft の全構造は RU 本文を正として構成した。
    evidence:
      path: .agentdev/backlog/req-units/RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |-
    8つの実現系 OU（OU-0001〜0008）で構成する。OU はいずれも REQ/Decision/Design ファイル操作を持たない（artifact_actions は空。Jev 観測 20261010T035839Z-9364・architecture-advisory 確定事項）。正規要件 REQ-104〜109 は既存のまま参照し、実行構造は正規情報を再所有しない（REQ-108-004）。
    OU-0001（基準点確認・情報保全）は単独 Issue として最初に実行する。OU-0006（有限実行・責務再編）は構造中核であり早期着手を推奨する。OU-0008（代表事例・判定プロトコル実行）は全実現系 OU の完了が必須依存。
    作業開始時の前置確認: (1) main と v5.0.0 基準コミットの一致（TS-001）、(2) 先行RU案6件原文の取得（コミット 21d5708301c3b6989025acb534987a3fb427d1da の .agentdev/backlog/adf-v5-ru-revised-01〜06。req-define は git 実行禁止のため実行側で取得）、(3) 入力RUの正式化（REQ-008-051 字段 generation_actor・agreement_confirmed_at の補完と RU-NNNN 採番・リネーム）はユーザー側の事前実施が望ましい（CR-004。未実施でも後続工程は本件を理由に停止しない）。
    実行中に既存REQが対象としない新実現要件を発見した場合、または正規要件の変更が必要になった場合は、上流の無断書換えではなく req-define 再合意（正規改訂経路）へ接続する。
  wave_hints:
    - "OU-0001 を最初の単独 Wave（または前置検証 Issue）として実行する"
    - "OU-0006（責務再編）は構造中核のため早期着手し、OU-0002〜0005・OU-0007 は OU-0006 との実装依存を確認しつつ並行化を検討する"
    - "OU-0008（代表事例・判定プロトコル）は全実現系 OU 完了後の最終 Wave とする"
    - "並列実行の共有上限は Wave や親子 Issue の個数から独立した実行制御として扱う（REQ-108-008）"
```

# summary

本要件docは、ADF v5.0.0 基点での機能再実装・責務再編・必要情報の継承に関する再実装プログラムを定義する（work_type: feature / scale: large / Epic 構成想定）。

- **入力**: session由来RU（`.agentdev/backlog/req-units/RU-draft-adf-v5-reimplementation-from-v500-2026-10-10-revised.md`、内容はユーザー承認済み）。
- **REQ操作**: なし。正規要件 REQ-104〜109（52行）は維持し、48条件（RU01-AC01〜RU06-AC09）と多対多で照合する（TS-003）。競合行の再定義は crosswalk 経由で正式切替時に実行（AG-004・CR-003）。
- **実現面**: RA-001〜009 を realization_actions として後続工程へハンドオフ。RA-006（有限実行・責務再編）が構造中核。
- **既知の入力乖離（記録）**: 入力RUは REQ-008-051 必須字段（generation_actor・agreement_confirmed_at）欠落・RU-NNNN 未採番のまま（RU 作業仮定が告白済み）。本 draft は内容合意を正として採用し継続した（CR-004）。RU の正式化は case-open 実行前にユーザー側で実施することが望ましい。
- **判定**: 構造検査（マーカー・ID 相互参照・TS 3要素完備）合格、Jev 先行評価（観測 20261010T035839Z-9364）・architecture-advisory 助言（4ラベル・ブロッカーなし）反映済み、adversarial-review 実施済み（2独立 stream・convergence audit 完了。採用 finding 3件反映: AG-005 実行側記録義務の明示、AG-004・AG-009 表現修正。限定合意: OU の operation 省略は soft-contract・hints 説明付きで維持）。auto_ready: true。
