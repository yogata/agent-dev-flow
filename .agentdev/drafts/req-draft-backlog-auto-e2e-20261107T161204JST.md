---
draft_type: req_draft
topic_slug: backlog-auto-e2e-20261107T161204JST
status: draft
created_at: 2026-11-07T17:37:00+09:00
source_rus:
  - RU-0263
  - RU-0264
  - RU-0265
  - RU-0266
  - RU-0267
  - RU-0268
  - RU-0269
---

<!-- req_draft テンプレート準拠の構造化引き継ぎ成果物。
原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
入力は backlog-auto 一式識別子 20261107T161204JST の stage-4（要件定義接続）として明示列挙された
RU-0263〜RU-0269 の 7 件（RU-0254 と既存 draft は対象外・未読）。
HITL 回答記録（2026-11-07 stage-4 HITL・Hermes 監督経由）:
Q-RU0265-1=B（テスト側自動作成・REQ-018 APPEND なし）、Q-RU0264-2=C（両方採用・REQ-117-011 文言明確化 UPDATE を含む）、
Q-RU0266-3=B（不採用・判断根拠を要件doc へ確定記録）、Q-RU0268-4=A（機能的記述への置換・baseline 登録なし）。 -->

# draft-data

```yaml
# work_type: 7 RU は既知欠陥の是正・非適合修正・機械的整合是正（bugfix 主体 + docs 是正）。
# Decision 必要な仕様判断なし（全実現方法確定済み・HITL 回答で確定）のため feature 昇格なし
work_type: bugfix

# scale: 作業単位は全て小規模修正（1 ファイル〜数ファイル・影響範囲局所）。
# 実装スコープシグナル（修正候補リスト等の large 昇格トリガ）は RU が既に具体修正対象を特定済みでなし。
# Epic 構成不要（全 OU 相互依存なし・単一 Issue 実行可能）
scale: standard

# summary: backlog-auto 一式識別子 20261107T161204JST の RU-0263〜RU-0269（7 件）を単一要件doc に統合した。
# 実装を伴う 6 作業単位（OU-001〜OU-006）と、判断記録のみで実装対象外の 1 項目（RU-0266 不採用判断）からなる。
# work_type は bugfix、scale は standard。auto_ready は true（ユーザー判断事項 4 件は HITL 回答で確定済み・未解決項目なし）
summary: RU-0263〜RU-0269 の 7 件を単一の新規 REQ（採番は case-open 機械工程の決定的採番スクリプトの結果を正。本文の REQ-119 は現行最大 REQ-118 時点の次番号仮記）として採番・収容する。実装を伴う 6 作業単位（OU-001〜OU-006）と、判断記録のみで実装対象外の 1 項目（RU-0266 不採用判断）からなる。REQ-117-011 行への文言明確化 UPDATE（ACT-REQ-002）を併せて実施する

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: HITL 回答（4 件）と RU 受け入れ義務から確定した合意項目
agreed_items:
  - id: AG-001
    content: phase_adoption_record_contract.test.ts の期待文言不一致の是正。テストの期待文言（バッククォート 1 組で `templates/phase-readme.md` のみを囲む期待）を配布 SKILL.md 側の実文（正規表記）へ整合させる。SKILL.md 実文側を正規表記とすることは promoted 成果物の分析時点で確認済みであり、req-define で最終確定する（本項目）。REQ-117-002（inline コードフェンス破損 3 箇所 + 複製整合 9 箇所）には含まれない別欠陥として、REQ-117 系（docs 整合・検査体系と機械工程の堅牢化）との突合の下で実施する。受け入れ義務: 修正後テストが合格し、full integrity suite split 1 の継続 fail が解消すること。期待文言と SKILL.md 実文の突合（grep 実測）を検証差分に記録すること
  - id: AG-002
    content: prepare_definition_pr.ts extractFreshnessTargets の REQ freshness 報告形式対応と補正漏れ検出。実現方法は HITL 回答 Q-RU0264-2=C により両方を採用する: (1) check_integrity の req-updated-freshness 報告から対象を抽出する際、REQ ファイル名のみの報告形式（docs/requirements/ プレフィックスなしのファイル名のみ報告・`for REQ-105.md:` 形式）への対応追加、(2) NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）の script 組込み。あわせて REQ-117-011 行へ実現方法の明確化を反映する（ACT-REQ-002・REQ-117-011 は恒久契約文言、本項目は一式の完了義務という役割分担）。既存のプレフィックス付き報告形式の捕捉維持（後方互換）を含める。Case #3910（PR #3912）で実測された REQ-105.md 補正漏れ 5 件・手動 contingency（commit 20a6eb9e8）の再発を機械工程の完結で解消する
  - id: AG-003
    content: worktree 実行時の .agentdev/tmp 前提テストの堅牢化。整備方針は HITL 回答 Q-RU0265-1=B によりテスト側の自動作成とする: req-id-roundtrip.test.ts がテスト実行時に前提ディレクトリ（.agentdev/tmp/ 配下）を mkdirSync recursive で自動作成し、worktree（.agentdev 未整備）での full suite 実行時に ENOENT 環境依存 fail として顕在化しなくなる。テストの後片付け契約（afterAll の rmSync 対象は mkdtempSync 自己生成物に限定・親 .agentdev/tmp 自体は削除しない）は現行のまま維持する。REQ-018-008(b) の配置先契約は変更しない（REQ-018 への APPEND は実施しない・存在保証はテスト自身の実行前提解決に帰属させる判断）。実測補正（2026-11-07 grep 実測）: .agentdev/tmp を mkdtempSync の親前提とするテストは req-id-roundtrip.test.ts のみであり、issue_tracking_list.test.ts の mkdtempSync は TEMP_BASE（OS temp）前提で worktree 非依存のため対象外とする（HITL 回答記載の「both tests」は実測により req-id-roundtrip.test.ts に限定・判断の実質は不変）
  - id: AG-004
    content: Local モード純環境での agentdev_gh 失敗分類の契約変更検討の判断（不採用・確定記録）。HITL 回答 Q-RU0266-3=B により、Local 投影検出を repo 解決に前置する契約変更（検出順序変更）は不採用とする。判断根拠: (1) 現行契約（README の AGENTDEV_GH_REPO 設定導線を正とする・REQ-009-051）と REQ-052-013/014 は現行実装が適合済みであり非適合は存在しない、(2) REQ-052-014 は「既存の失敗分類の値域を変更せず」を規定し、検出順序変更は値域・構造の契約変更を伴い収益（Local 純環境は supported 構成ではなく失敗メッセージには解決導線〔REQ-052-013〕が存在し実害は限定的）に対し契約複雑化のコストが高い、(3) PR #3925 も現行契約を正として契約変更せず後続要求候補として記録した経緯がある。不採用判断と判断根拠は本 REQ 本文の目的節へ恒久記録し（ACT-REQ-001 content 内）、要件doc への確定記録義務（RU-0266 受け入れ義務）を充足する。将来の利用形態変化時（Local 純環境利用の増大等）に再評価対象として learning/intake 経路へ委ねる
  - id: AG-005
    content: docs 機械的整合是正 FD-01（Design frontmatter 鮮度 5 ファイル）。docs/designs/commands/case-auto.md・docs/designs/commands/case-run.md・docs/designs/commands/req-define.md・docs/designs/workflows/v51-phase-transition-and-coexistence-model.md・docs/designs/workflows/verification-resource-lifecycle.md の 5 ファイルの frontmatter updated を各ファイルの最終内容変更 commit の author date（IR-072 detection_method どおり・frontmatter のみの変更 commit は内容変更から除外）へ進行する。commit 6ed481996 が同種是正を他 4 ファイルへ適用済みで本 5 ファイルが追随漏れ。REQ-117-011 計測日収束 step の trigger 条件検討への材料提供（観察記録 O5）は範囲外。受け入れ義務: check_integrity（IR-072）の該当 NG が解消すること
  - id: AG-006
    content: docs 機械的整合是正 FD-02（designs/README.md 索引行追加）。docs/designs/README.md の横断 Design 一覧へ verification-resource-lifecycle.md（2026-11-05 新規作成・commit c4780cd28・frontmatter status: draft）の行を追加する。行登録の status 列値は draft（現行 frontmatter どおり）とする。FD-04（draft Design への現行権威指定・昇格判断）との同一 wave 実施推奨は検出側の推奨であり、行登録自体は昇格判断に依存しないため本項目は昇格判断を含まない。README 自身の「新規 Design の保存完了直後に該当一覧表へ行を登録する」「本ファイルが Design status を視認する単一の追跡情報源」規定への復帰を目的とする。受け入れ義務: 該当行が登録され docs-check の README 索引診断が通過すること
  - id: AG-007
    content: phase-transition identity.ts コメントの配布物 ID 汚染修正。修正方向は HITL 回答 Q-RU0268-4=A により機能的記述への置換とする: src/common/skills/agentdev-workflow-phase-transition/scripts/lib/identity.ts:4 のコメント行（「read-side check target (REQ-111-023): this module never writes it.」）から REQ-111-023 具体ID言及を除去し、機能的記述（read-side check target の読取専用性を示す記述）へ置換する。REQ-111-023 への照合義務参照の文意は producer 側（repository 側 traceability sidecar・同モジュールの契約文脈）で保持する（REQ-111-023 は実在行 docs/requirements/REQ-111.md:38・遷移後の現在工程の特定・再開の照合義務）。baseline 登録（IR-059 系への既知例外登録）は採用しない（配布物は内部 ID を記述しない恒久原則の純度を維持し、同種混入の将来受理リスクを避ける判断）。受け入れ義務: check_distribution_boundary の機械 failure 1 件（commit dac7852b3 検出・baseline 未管理）が解消し同検査が通過すること。修正方向の判断根拠を検証差分に記録すること
  - id: AG-008
    content: case-run-execution-adapter SKILL.md 作成先文言の Design 正本追随是正。src/common/skills/agentdev-case-run-execution-adapter/SKILL.md L94 の作成先文言を Design 正本（docs/designs/workflows/verification-resource-lifecycle.md）の修正後境界へ追随させる: 「パス形の作成先は環境指定TEMPまたはプロジェクト内正規一時領域（repo root の .agentdev/tmp/・REQ-018-008(b) 契約）に限られ、パス要素に案件番号が含まれることは許可根拠にしない」相当の文言へ統一する。同節の「案件スコープの専用領域へ作成し」の表現は、Design 正本の案件番号非根拠化・プロジェクト内正規一時領域への統一（Case #3928 Wave-6・Issue #3946・PR #3947）に対応する旧境界文言であるため現行化する（台帳登録経路〔verification-resource-lifecycle.md 台帳（生成記録）節〕との整合で確認済みの変更影響分析結果・req-define 判断として確定）。Design 正本が正であり SKILL 側を正本に合わせる方向で是正する。verification-resource-lifecycle.md 本体・実装（verification-resources-ledger.ts 等）は修正後境界で merge 済みのため変更対象外。worktree root 相対の .agentdev/tmp/ の REQ-018-008(b) 文言と実装 mainRepoRoot 基準の解釈差は別 learning 項目（deferred Q34）として追跡中であり本項目では扱わない。受け入れ義務（元 learning item より引き継ぎ）: SKILL.md の作成先文言が修正後境界と整合すること・修正後の SKILL.md において旧文言（案件専用領域・案件識別子をパス要素に含む repo 外ディレクトリ）が grep で 0 件になること・SKILL 契約行と作成ヘルパー（verification-resources-ledger.ts evaluateCreationDestination）の機械検査基準の文言整合を検証差分に記録すること

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
# Decision 候補なし（STEP-5 判定: 4 件の実現方法選択は全て作業手段・既存契約の適用であり Decision 禁止ゲート〔作業手段 Decision 拒否〕に該当。
# RU-0266 不採用は現行契約の維持であり新規決定を生まない。docs/decisions/ の重複確認済み・関連 Decision なし）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:backlog-auto-e2e-20261107T161204JST
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ---
      id: REQ-119
      title: "backlog 一式 20261107T161204JST の整合是正と機械工程堅牢化（6 作業単位）"
      created: "2026-11-07"
      updated: "2026-11-07"
      ---

      ## 目的

      backlog-auto 一式識別子 20261107T161204JST の RU-0263〜RU-0269（7 件）のうち実装を伴う 6 作業単位（テスト期待文言整合・freshness 補正機械化・worktree テスト堅牢化・docs 機械的整合是正 2 件・配布物 ID 汚染修正・SKILL 契約文言追随）の要求行と、1 件の判断記録（Local モード純環境の agentdev_gh 失敗分類の契約変更検討）を収容する。各行は達成状態が判定可能な命題として書かれ、検証手段は要件テーブルの検証列に従う。

      判断記録（恒久保持・RU-0266 の確定記録義務充足）: Local 投影検出を repo 解決に前置する契約変更（検出順序変更）は不採用とする。判断根拠: (1) 現行契約（README の AGENTDEV_GH_REPO 設定導線を正とする・REQ-009-051）と REQ-052-013/014 は現行実装が適合済みであり非適合は存在しない、(2) REQ-052-014 の「既存の失敗分類の値域を変更せず」契約との整合で検出順序変更は値域・構造の契約変更を伴い、Local 純環境は supported 構成ではなく失敗メッセージには解決導線が存在するため収益に対し契約複雑化のコストが高い、(3) Case #3919 の実装 PR #3925 も現行契約を正として契約変更せず後続要求候補として記録した経緯がある。将来の利用形態変化時（Local 純環境利用の増大等）に再評価する。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | REQ-119-001 | phase_adoption_record_contract.test.ts の期待文言を配布 SKILL.md 側の実文（正規表記）へ整合させ、full integrity suite split 1 の継続 fail を解消すること。REQ-117-002 に含まれない別欠陥として、REQ-117 系（docs 整合・検査体系と機械工程の堅牢化）との突合の下で実施すること | 修正後テストが合格し、full integrity suite split 1 の継続 fail が解消すること。期待文言と SKILL.md 実文の突合（grep 実測）を検証差分に記録すること | TS-001 |
      | REQ-119-002 | prepare_definition_pr.ts extractFreshnessTargets に、REQ ファイル名のみの freshness 報告形式への対応追加と NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）の両方を組込み、REQ-117-011 行へ実現方法の明確化を反映すること（REQ-117-011 は恒久契約文言・本行は一式の完了義務）。既存のプレフィックス付き報告形式の捕捉維持（後方互換）を含めること。投影同期（src/common → .opencode）を含めること | REQ ファイルを含む freshness 報告において measurement-convergence step の frontmatterUpdatedTargets が REQ ファイルを捕捉することを機械確認でき、既存のプレフィックス付き報告形式の捕捉が維持され、手動 contingency を不要にすること。投影同期が確認されること | TS-002 |
      | REQ-119-003 | req-id-roundtrip.test.ts がテスト実行時に前提ディレクトリ（.agentdev/tmp/ 配下）を自動作成し、worktree（.agentdev 未整備）での full suite 実行時に ENOENT 環境依存 fail として顕在化しなくなること。テストの後片付け契約（rmSync 対象は自己生成物に限定・親 .agentdev/tmp 自体は削除しない）を維持すること。REQ-018-008(b) の配置先契約は変更しないこと | worktree（.agentdev 未整備）で req-id-roundtrip.test.ts が ENOENT なく pass すること | TS-003 |
      | REQ-119-004 | docs 機械的整合是正 FD-01: docs/designs/commands/case-auto.md・case-run.md・req-define.md・docs/designs/workflows/v51-phase-transition-and-coexistence-model.md・verification-resource-lifecycle.md の 5 ファイルの frontmatter updated を各ファイルの最終内容変更 commit の author date（IR-072 detection_method どおり・frontmatter のみの変更 commit は除外）へ進行すること | check_integrity（IR-072）の該当 NG が解消すること | TS-005 |
      | REQ-119-005 | docs 機械的整合是正 FD-02: docs/designs/README.md の横断 Design 一覧へ verification-resource-lifecycle の行（status 列値 draft・現行 frontmatter どおり）を追加すること。行登録は昇格判断に依存しないこと | 該当行が登録され docs-check の README 索引診断が通過すること | TS-006 |
      | REQ-119-006 | phase-transition identity.ts:4 コメントの REQ-111-023 具体ID言及を除去し機能的記述へ置換すること（REQ-111-023 への照合義務参照の文意は producer 側で保持）。baseline 登録は採用しないこと。投影同期（src/common → .opencode）を含めること | check_distribution_boundary の機械 failure 1 件が解消し同検査が通過すること。修正方向の判断根拠を検証差分に記録すること。投影同期が確認されること | TS-007 |
      | REQ-119-007 | case-run-execution-adapter SKILL.md L94 の作成先文言を Design 正本（verification-resource-lifecycle.md）の修正後境界（環境指定TEMPまたはプロジェクト内正規一時領域〔repo root の .agentdev/tmp/・REQ-018-008(b)〕・案件番号非根拠）へ整合させること。「案件スコープの専用領域へ作成し」の旧境界表現の現行化を含めること。Design 正本本体・実装（verification-resources-ledger.ts 等）は変更対象外とすること。投影同期（src/common → .opencode）を含めること | SKILL.md の作成先文言が修正後境界と整合し、旧文言が grep で 0 件になること。SKILL 契約行と作成ヘルパー（verification-resources-ledger.ts evaluateCreationDestination）の機械検査基準の文言整合を検証差分に記録すること。投影同期が確認されること | TS-008 |

      ## 適用範囲

      - 対象: .opencode/skills/repo-agentdev-integrity/scripts/tests/（REQ-119-001・REQ-119-003・producer 側 repo ローカル・投影同期対象外）、src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts と docs/requirements/REQ-117.md（REQ-119-002）、docs/designs/ 5 ファイルと docs/designs/README.md（REQ-119-004・REQ-119-005）、src/common/skills/agentdev-workflow-phase-transition/scripts/lib/identity.ts（REQ-119-006）、src/common/skills/agentdev-case-run-execution-adapter/SKILL.md（REQ-119-007）
      - 対象外: RU-0254（隔離検証リポジトリ管理者側準備・一式から除外済み）、REQ-117-002 の対象欠陥（別欠陥として突合の下で実施・改変しない）、REQ-018 の変更（REQ-119-003 では配置先契約を含め変更なし）、REQ-052 系の契約変更（判断記録のとおり不採用）、REQ-111-023 行の変更（文意は producer 側保持・REQ 行は変更しない）、verification-resource-lifecycle.md 本体と検証用一時資材実装（REQ-119-007 で変更対象外）、REQ-117-011 計測日収束 step の trigger 条件検討への材料提供（観察記録 O5・FD-01 修正の範囲外）、worktree root 相対 .agentdev/tmp の REQ-018-008(b) 文言と実装 mainRepoRoot 基準の解釈差（別 learning 項目 deferred Q34）

      ## 検証

      検証手段は要件テーブルの検証列（TS-001〜TS-003・TS-005〜TS-008）が所有する。TS-004（Local モード純環境契約変更の不採用判断の確定記録確認）は本判断記録（目的節）の存在と根拠付き記録の確認手段であり要件テーブル行を持たない。test_strategy の詳細は本 REQ の要件doc（draft-data）を投影元とし、完了判定は検証手段の実行と証跡記録で行う。REQ-119 の番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-118 時点の次番号を仮記）。

      ## 備考

      本 REQ は backlog-auto 一気通貫実行（stage-4 要件定義接続）により生成された。入力根拠は RU-0263・RU-0264・RU-0265・RU-0266・RU-0267・RU-0268・RU-0269 の 7 件（明示列挙・depends_on: なし・tentative_classification: REQ で最終分類 REQ に確定）。RU-0266 は本 REQ の判断記録により閉じられ実装対象外である。再発防止観点（learning 由来・RU-0269 参照）: 実装境界の変更を伴う Case では同一境界を参照する SKILL 契約行が対象変更ファイル一覧から漏れるリスクがあり、文言整合の対象一覧化が有効な観点として知見を保持する。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-117.md
    target_area: "## 要件 テーブル内 REQ-117-011 行の要件セル"
    source_items: [AG-002]
    content: |
      REQ-117-011 行の要件セルを次の文言へ置換する（受け入れ条件セル・検証列〔TS-011〕は不変）:

      prepare_definition_pr に、generate_indexes 実行後・check_integrity 実行前の計測日不整合（req-metrics 計測日 AUTOGEN 更新 + req-updated-freshness による frontmatter updated 追随）を検出して明示パス指定で補正 commit を script 内で完結させる拡張 step を追加すること。対象抽出は check_integrity の req-updated-freshness 報告形式を対象とし、REQ ファイル名のみの報告形式（docs/requirements/ プレフィックスなしのファイル名のみ報告）と既存のプレフィックス付き報告形式の双方を捕捉すること。NG 報告対象と補正適用対象の差分検査（補正漏れの fail-closed 検出）を step に含めること。手順契約へ追随更新を含める

      （決定的組立検査済み: assemble-draft-section 0.2.0・replace 操作・旧文 1 件一致・pre/post 検査 3/3 合格・REQ-117-011 行との相互参照は ACT-REQ-001 REQ-119-002 で保持）

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: RU-0263 の欠陥（テスト期待文言の backtick 位置不一致）と REQ-117-002 の対象（inline コードフェンス破損 3 箇所 + 複製整合 9 箇所）の関心重複
    resolution: 別欠陥として扱い、本 REQ（REQ-119-001）に収容する。REQ-117 系との突合は REQ-119-001 の要件文言と適用範囲に明示し、REQ-117-002 の対象は改変しない
  - id: CR-002
    conflict: RU-0266 の契約変更候補（Local 投影検出の repo 解決への前置）と現行契約（REQ-009-051・REQ-052-013/014）の関係
    resolution: 不採用判断（HITL 回答 Q-RU0266-3=B）。現行契約を維持し、判断根拠を AG-004・本 REQ 目的節へ確定記録して閉じる。REQ-052 系への操作なし
  - id: CR-003
    conflict: HITL 回答記載（Q-RU0265-1 の「both affected tests」）と実測（.agentdev/tmp 前提は req-id-roundtrip.test.ts のみ・issue_tracking_list.test.ts は TEMP_BASE 前提）のずれ
    resolution: 実測を正として対象を req-id-roundtrip.test.ts に限定（grep 実測 2026-11-07・issue_tracking_list.test.ts の mkdtempSync 親は TEMP_BASE で worktree 非依存）。判断の実質（テスト側自動作成・REQ-018 変更なし・前提解決方式）は不変。AG-003 に実測補正を記録

# operation_units: 複数RU入力の統合/分離結果。実装を伴わない RU-0266 は OU 対象外（判断記録により閉じ済み・AG-004・RD-004 参照）
operation_units:
  - ou_id: OU-001
    source_ru: RU-0263
    target_req: new:backlog-auto-e2e-20261107T161204JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0264
    target_req: REQ-117
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0265
    target_req: new:backlog-auto-e2e-20261107T161204JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0267
    target_req: new:backlog-auto-e2e-20261107T161204JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0268
    target_req: new:backlog-auto-e2e-20261107T161204JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0269
    target_req: new:backlog-auto-e2e-20261107T161204JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single

# test_strategy: 各合意項目（AG-*）の検証方法（3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      1. 修正対象テスト（phase_adoption_record_contract.test.ts）の期待文言と対象 SKILL.md 実文を grep 実測で突合し、不一致の解消を確認する（突合記録を検証差分に残す）
      2. bun test で当該テストを実行し合格を確認する
      3. full integrity suite split 1 を実行し継続 fail が解消したことを確認する
    pass_criteria: |
      期待文言と SKILL.md 実文の突合記録が存在し、当該テストが合格し、full integrity suite split 1 が継続 fail でなくなっていること
    on_failure: |
      fix-and-reverify: 期待文言の整合側（テスト側）の修正漏れ・突合記録の欠落を修正し 1〜3 を再実行する
  - id: TS-002
    target_item: AG-002
    verification: |
      1. REQ ファイル名のみ報告形式（for REQ-105.md: 形式相当）を含む fixture で extractFreshnessTargets を実行し、frontmatterUpdatedTargets に REQ ファイルが捕捉されることを機械確認する
      2. 既存のプレフィックス付き報告形式（docs/src/scripts プレフィックス付き）を含む fixture で捕捉維持（後方互換）を機械確認する
      3. NG 報告対象と補正適用対象に差分がある入力で script が fail-closed で検出（補正漏れ検出）することを機械確認する
      4. 既存テスト・typecheck を実行し回帰がないことを確認し、投影同期（src/common → .opencode）を確認する
    pass_criteria: |
      1〜4 の機械確認が全て合格し、REQ ファイルを含む freshness 報告で手動 contingency が不要になっていること
    on_failure: |
      fix-and-reverify: 対応漏れ（報告形式・差分検査・後方互換・投影同期）を修正し 1〜4 を再実行する
  - id: TS-003
    target_item: AG-003
    verification: |
      1. worktree（.agentdev 未整備・.agentdev/tmp 不在）を作成し、worktree root を cwd として req-id-roundtrip.test.ts を実行する
      2. ENOENT が発生せずテストが pass することを確認する
      3. テスト実行後の後片付けが自己生成物に限定されること（親 .agentdev/tmp が rmSync されないこと）を確認する
    pass_criteria: |
      worktree で req-id-roundtrip.test.ts が ENOENT なく pass し、後片付け契約（rmSync 対象は自己生成物に限定）が維持されていること
    on_failure: |
      fix-and-reverify: 自動作成の漏れ・後片付け契約違反を修正し 1〜3 を再実行する
  - id: TS-004
    target_item: AG-004
    verification: |
      本 REQ 本文の目的節に RU-0266 の不採用判断と判断根拠（現行契約適合済み・REQ-052-014 値域不変契約との整合・PR #3925 経緯）が記録されていることを確認する
    pass_criteria: |
      不採用判断と判断根拠が REQ 本文（恒久文書）に確定記録されていること
    on_failure: |
      fix-and-reverify: 記録の欠落・根拠不足を補完し再確認する
  - id: TS-005
    target_item: AG-005
    verification: |
      check_integrity（IR-072）を実行し、対象 5 ファイルの req-updated-freshness NG が解消したことを確認する。updated 進行値が各ファイルの最終内容変更 commit の author date と一致すること（frontmatter のみの変更 commit 除外を含む）を突合する
    pass_criteria: |
      check_integrity（IR-072）の該当 NG が 0 件となっていること
    on_failure: |
      fix-and-reverify: 進行値の誤り・除外判断の誤りを修正し再実行する
  - id: TS-006
    target_item: AG-006
    verification: |
      docs/designs/README.md の横断 Design 一覧に verification-resource-lifecycle の行（status 列値 draft）が登録されていることを grep 実測で確認し、docs-check の README 索引診断を実行する
    pass_criteria: |
      該当行が登録され、docs-check の README 索引診断が通過していること
    on_failure: |
      fix-and-reverify: 行登録の形式・status 列値を修正し再実行する
  - id: TS-007
    target_item: AG-007
    verification: |
      1. check_distribution_boundary を実行し、identity.ts コメント由来の機械 failure が 0 件となり検査が通過することを確認する
      2. 置換後コメントの文意（read-side check target の読取専用性・identity 照合の検査対象であること）が保持されていることを確認し、REQ-111-023 照合義務参照の文意が producer 側で保持されていることを確認する
      3. 投影同期（src/common → .opencode）を確認する
    pass_criteria: |
      check_distribution_boundary が通過し、文意保持と投影同期が確認され、修正方向の判断根拠が検証差分に記録されていること
    on_failure: |
      fix-and-reverify: 置換文言の文意欠落・投影同期漏れを修正し 1〜3 を再実行する
  - id: TS-008
    target_item: AG-008
    verification: |
      1. 修正後の SKILL.md 作成先文言と Design 正本（verification-resource-lifecycle.md）の修正後境界文言の整合を突合する
      2. 旧文言（案件専用領域・案件識別子をパス要素に含む repo 外ディレクトリ）が src/common/skills/agentdev-case-run-execution-adapter/SKILL.md 原本と投影先（.opencode/skills/agentdev-case-run-execution-adapter/SKILL.md）で grep 0 件であることを確認する（網羅範囲 = SKILL.md 原本 + 投影先・修正対象列挙と一致。See Also 等の参照行は対象外としつつ旧文言検索に含め 0 件確認する）
      3. SKILL 契約行と作成ヘルパー（verification-resources-ledger.ts evaluateCreationDestination）の機械検査基準の文言整合を検証差分に記録する
      4. 投影同期（src/common → .opencode）を確認する
    pass_criteria: |
      作成先文言が修正後境界と整合し、旧文言が原本・投影先で 0 件であり、文言整合の検証差分記録と投影同期確認が存在すること
    on_failure: |
      fix-and-reverify: 文言の不整合・旧文言残存・投影同期漏れを修正し 1〜4 を再実行する

# realization_actions: 実現面の変更方針（DEC-026 構造化ハンドオフ契約）
realization_actions:
  - id: RA-001
    concern: テスト期待文言の整合是正（phase_adoption_record_contract.test.ts）
    responsibility: repo-agentdev-integrity scripts tests の期待文言を配布 SKILL.md 実文（正規表記）へ整合させる
    ownership_hints: [.opencode/skills/repo-agentdev-integrity/scripts/tests/phase_adoption_record_contract.test.ts L119・L143（producer 側 repo ローカル・投影同期対象外）]
    intent: full integrity suite split 1 の継続 fail を解消し、既知欠陥による fail 埋もれを除去する
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: extractFreshnessTargets の報告形式対応と補正漏れ fail-closed 検出
    responsibility: case-open 機械工程 script の対象抽出を REQ ファイル名のみ報告形式へ対応させ、補正漏れ検出を組込み、REQ-117-011 行文言を明確化する
    ownership_hints: [src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts L754-762 extractFreshnessTargets, docs/requirements/REQ-117.md REQ-117-011 行, 投影同期 src/common → .opencode]
    intent: REQ ファイルの freshness 補正を機械工程で完結させ、手動 contingency（Case #3910 実績の再発）を不要にする
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: テスト実行前提（.agentdev/tmp 配下）の自動作成
    responsibility: req-id-roundtrip.test.ts の setup で前提ディレクトリを mkdirSync recursive で自動作成する（後片付け契約は現行維持）
    ownership_hints: [.opencode/skills/repo-agentdev-integrity/scripts/tests/req-id-roundtrip.test.ts L23（producer 側 repo ローカル・投影同期対象外）, REQ-018-008(b) 配置先契約は変更なし]
    intent: worktree（.agentdev 未整備）での full suite 実行の環境依存 fail（ENOENT）を除去する
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: docs 機械的整合是正（frontmatter updated 5 ファイル + designs/README.md 索引行追加）
    responsibility: IR-072 detection_method に従い 5 ファイルの frontmatter updated を最終内容変更 commit の author date へ進行し、designs/README.md 横断一覧へ verification-resource-lifecycle 行（status: draft）を追加する
    ownership_hints: [docs/designs/commands/case-auto.md, docs/designs/commands/case-run.md, docs/designs/commands/req-define.md, docs/designs/workflows/v51-phase-transition-and-coexistence-model.md, docs/designs/workflows/verification-resource-lifecycle.md, docs/designs/README.md, 前例 commit 6ed481996]
    intent: check_integrity（IR-072）NG の解消と Design status 追跡（designs/README.md 単一追跡情報源）からの漏れ除去
    verification_refs: [TS-005, TS-006]
    source_items: [AG-005, AG-006]
  - id: RA-005
    concern: 配布対象 script コメントの配布物 ID 汚染修正（機能的記述への置換）
    responsibility: identity.ts:4 コメントから REQ-111-023 具体ID言及を除去し機能的記述へ置換する（照合義務参照の文意は producer 側保持・baseline 登録不採用）
    ownership_hints: [src/common/skills/agentdev-workflow-phase-transition/scripts/lib/identity.ts:4, 検出 commit dac7852b3, 投影同期 src/common → .opencode, docs/requirements/REQ-111.md:38（REQ-111-023 実在行・変更対象外）]
    intent: check_distribution_boundary 機械 failure の解消と配布物は内部 ID を記述しない恒久原則の純度維持
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-006
    concern: SKILL 契約行作成先文言の Design 正本追随是正
    responsibility: case-run-execution-adapter SKILL.md L94 の作成先文言を Design 正本（verification-resource-lifecycle.md）修正後境界へ整合させ、「案件スコープの専用領域へ作成し」表現を現行化する（Design 正本本体・実装は変更対象外）
    ownership_hints: [src/common/skills/agentdev-case-run-execution-adapter/SKILL.md L94, docs/designs/workflows/verification-resource-lifecycle.md L50-51 修正後境界（参照のみ）, src/common/skills/agentdev-workflow-case-close/scripts/src/verification-resources-ledger.ts evaluateCreationDestination（突合参照のみ）, 投影同期 src/common → .opencode]
    intent: SKILL 契約行に従う委譲先の作成先決定と作成ヘルパー機械検査基準（新境界）の文言整合（実害未発現の事故起点の除去）
    verification_refs: [TS-008]
    source_items: [AG-008]

# review_dispositions: 採否判断の記録（1 エントリ = 単一 source_ru + 単一 source_item）
review_dispositions:
  - id: RD-001
    source_ru: RU-0263
    source_item: AG-001
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0263 の必須要求（テスト期待文言を SKILL.md 実文へ整合）と受け入れ義務（修正後テスト合格・split 1 fail 解消・grep 突合記録）を AG-001・REQ-119-001・TS-001・OU-001・RA-001 へ反映。SKILL.md 実文側を正規表記とする最終確定は promoted 成果物の分析結果（grep 実測・本実行時再確認）に基づき req-define で確定した
    evidence:
      path: .agentdev/backlog/req-units/RU-0263.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0264
    source_item: AG-002
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0264 の必須要求と受け入れ義務を AG-002・REQ-119-002・TS-002・OU-002・RA-002 へ反映。実現方法は HITL 回答 Q-RU0264-2=C（両方採用）で確定し、REQ-117-011 行への文言明確化 UPDATE（ACT-REQ-002・決定的組立検査済み）を含める。既存 Split Rule（learning 線との分割済み状態）を維持し本 RU は intake 側修正のみを扱う
    evidence:
      path: .agentdev/backlog/req-units/RU-0264.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0265
    source_item: AG-003
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0265 の必須要求（整備方針確定・存在保証責務の所在明確化）と受け入れ義務（ENOENT 顕在化の解消）を AG-003・REQ-119-003・TS-003・OU-003・RA-003 へ反映。整備方針は HITL 回答 Q-RU0265-1=B（テスト側自動作成）で確定し、REQ-018 への APPEND は実施しない（存在保証はテスト自身の実行前提解決に帰属）。実測補正（.agentdev/tmp 前提は req-id-roundtrip.test.ts のみ）は CR-003 に記録
    evidence:
      path: .agentdev/backlog/req-units/RU-0265.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0266
    source_item: AG-004
    disposition: covered
    reason_code: decision_recorded_no_implementation
    reason: |
      RU-0266 の必須要求（契約変更採否の判断・不採用時も判断根拠を含めて閉じる）と受け入れ義務（採用/不採用いずれかの判断が判断根拠とともに要件doc に確定記録）を AG-004 へ反映し、判断根拠は本 REQ（ACT-REQ-001）本文の目的節へ恒久記録する（TS-004 で確認）。不採用判断（HITL 回答 Q-RU0266-3=B）のため実装対象外であり OU は作成しない
    evidence:
      path: .agentdev/backlog/req-units/RU-0266.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0267
    source_item: AG-005
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0267 の FD-01（Design frontmatter 鮮度 5 ファイル）を AG-005・REQ-119-004・TS-005・OU-004・RA-004 へ反映。IR-072 detection_method に従う手順と frontmatter のみの変更 commit 除外を要件文言に明記。観察記録 O5（REQ-117-011 trigger 条件検討への材料提供）は範囲外として RU の対象外記載どおり扱う
    evidence:
      path: .agentdev/backlog/req-units/RU-0267.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0267
    source_item: AG-006
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0267 の FD-02（designs/README.md 索引行追加）を AG-006・REQ-119-005・TS-006・OU-004・RA-004 へ反映。FD-01 と FD-02 は RU 本文内で独立修正項目として分離記載（RU 統合理由どおり）し、同一 OU（OU-004・docs 領域の機械的是正）へ統合。FD-04 昇格判断は範囲外（RU 記載どおり）
    evidence:
      path: .agentdev/backlog/req-units/RU-0267.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0268
    source_item: AG-007
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0268 の必須要求（REQ-111-023 具体ID言及の解消）と受け入れ義務（機械 failure 解消・判断根拠の検証差分記録）を AG-007・REQ-119-006・TS-007・OU-005・RA-005 へ反映。修正方向は HITL 回答 Q-RU0268-4=A（機能的記述への置換・文意保持確認・baseline 登録なし）で確定し、選択肢 (b)（IR-059 系 baseline 登録）は不採用
    evidence:
      path: .agentdev/backlog/req-units/RU-0268.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0269
    source_item: AG-008
    disposition: covered
    reason_code: requirement_defined
    reason: |
      RU-0269 の必須要求（L94 作成先文言の Design 正本追随）と受け入れ義務 3 項目（文言整合・旧文言 grep 0 件・機械検査基準との文言整合の検証差分記録）を AG-008・REQ-119-007・TS-008・OU-006・RA-006 へ反映。「案件スコープの専用領域へ作成し」の現行化は req-define の変更影響分析（台帳登録経路との整合確認済み）で確定。Design 正本本体・実装は変更対象外（RU 制約どおり）、deferred Q34 は本件で扱わない（RU 制約どおり）。再発防止観点は本 REQ 備考節へ記録
    evidence:
      path: .agentdev/backlog/req-units/RU-0269.md
      section: 完了判定
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（1 操作 1 エントリ）
assembly_evidence:
  - target_file: docs/requirements/REQ-117.md
    target_content_sha256: a89b48b0baeddabcbcba41f5cb6159f2552be273fddce77bb761e006a0f5675b
    check_scope: { heading: "## 要件", start_line: 14, end_line: 33 }
    execution_conditions: { operation: replace, edit_sha256: d88bd3b794e3732679b053000e682846910e8f747cbc425978ee1264a9a106c6, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: "0.2.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan, scan_scope: target section only }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: 2026-11-07T08:36:57.934Z

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - 全 6 OU は相互依存なし・並列実行可能（対象ファイルは非重複）
    - OU-001 と OU-003 は同一テスト領域（repo-agentdev-integrity scripts/tests）の別ファイル修正であり競合なし
    - OU-002・OU-005・OU-006 は src/common 側修正を含むため投影同期（src/common → .opencode）の確認を各実装に含める
    - ACT-REQ-002（REQ-117-011 行 update）は OU-002 の Issue 実装に含め、ACT-REQ-001（新規 REQ 作成）は case-open/case-ready の Definition 保存内部責務で適用する
```

# summary

backlog-auto 一式識別子 20261107T161204JST の stage-4（要件定義接続）として RU-0263〜RU-0269（7 件・明示列挙）を単一要件doc に統合した。ユーザー判断事項 4 件（RU-0265 整備方針・RU-0264 実現方法・RU-0266 契約変更採否・RU-0268 修正方向）は HITL 回答で確定済み。実装を伴う 6 作業単位（OU-001〜OU-006）と判断記録 1 件（RU-0266 不採用・実装対象外）からなる。work_type: bugfix / scale: standard / auto_ready: true。STEP-8 adversarial-review で 7 争点を抽出し全て収束（未解決ユーザー判断事項 0 件）。REQ-117-011 行への文言明確化 UPDATE は決定的組立検査（assemble-draft-section 0.2.0）を経て ACT-REQ-002 に確定済み。
