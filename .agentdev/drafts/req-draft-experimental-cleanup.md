---
draft_type: req_draft
topic_slug: experimental-cleanup
status: draft
created_at: 2026-11-17T22:30:00+09:00
significant_change_notified_at: 2026-11-17T23:01:17+09:00
---

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  実験前提の3原則（実験・ロールバック許容、後方互換性完全破棄による LLM/スクリプト一括直接修正、測定不能停滞の排除と二択即決）を恒久運用原則として採用し、添付計画 Phase 1〜5 の一括実行として、レガシー移行資産（crosswalk・migration 系 Design/スクリプト）、integrity 検査の baseline・免除・廃止語彙・旧パス・retired 検出の各機構、.agentdev 実行証跡（jev-observations 516件、backlog-auto/end-to-end、inspect inbox、blocked 2件、放置ドラフト2件）、測定待ち記録（adf-simplification-deferred-records、learning 測定不能系項目）を完全削除処分する。3原則の正規化は新 Decision（new:experimental-cleanup、DEC-056 は supersede せず relates-to 接続）と design-principles.md Design 更新と AGENTS.md realization で行い、新規 REQ/Design は作成しない。既存 REQ は REQ-121 廃止（retired/ 移行）、REQ-109 の4行修正、実質変更13 REQ（baseline 前提行の現状化を含む）、REQ-003 への2 action（issue-3494 フォールバック許容行追加と機械的参照置換）、機械的参照群12 REQ の更新で対応する。13 Design の v4/v5/v5.1 接頭辞改名と参照一括置換、IR 8ルール削除（IR-055/059 は baseline のみ撤廃し検出器存続）、削除 IR・baseline の波及参照更新、回帰テスト10本削除を行い、Phase 5 で traceability 最新化・インデックス再生成・全検証 PASS を収束させる。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実験前提の3原則を採用する。(1) 実験・ロールバック許容: 本リポジトリの変更は実験として扱い、Git 履歴で復元可能であることを前提に防衛的措置（対照表・バックアップ資産の恒久維持）を要求しない。(2) 後方互換性の完全破棄: 旧表記・旧パス・旧契約への移行補助層（crosswalk、Baseline、マイグレーションスクリプト）を維持せず、LLM/スクリプトによる一括直接修正を標準手段とする。(3) 測定不能による停滞排除: 測定待ち（再評価条件が実測不能・確定不能のままの保留）を理由とする停滞を禁止し、測定待ち案件は「仮説の即時導入」または「完全削除」の二択で即決する（利用者から裁量委譲済み）。原則3は狭義解釈とする: deferred.md 機構・blocked 機構そのものは存続させ、「測定待ちを理由とする保留」のみを禁止する。learning deferred の空初期化は workflow の自動削除ではなく、本原則に基づく利用者指示の明示決済として実施する。
  - id: AG-002
    content: |
      添付計画（入力ファイル req-input-experimental-cleanup-20261117.md）Phase 1〜5 を一括実行する。3原則の正規化構成は「新 Decision（正）+ design-principles.md 既存 Design 更新 + AGENTS.md realization」とし、新規 REQ と新規 Design は作成しない。実行規律として、指定外の未保存変更は保護し、検査失敗を成功と報告せず、独立作業は並列化して同一ファイル競合を回避し、中間出力は正規一時領域に置き、最終検証結果は対応 Issue/PR に記録する。
  - id: AG-003
    content: |
      新 Decision（new:experimental-cleanup）を作成する。主題は「実験前提の恒久運用原則の採用と移行完了後レガシー資産の扱い境界（実験・ロールバック許容／後方互換不要の LLM・スクリプト一括移行／測定不能停滞の二択即決決済）」。DEC-056 は supersede も部分置換もせず accepted 維持とし、relates-to で接続する。新 Decision の本文で DEC-056/REQ-109 との適用時間軸の区別（移行実行中は意味保存・検証義務が優先、移行完了後のレガシー資産には本原則を適用、履歴性は Git 履歴で担保）を明示する。relations は DEC-056・DEC-027・DEC-001 への relates-to とする。
  - id: AG-004
    content: |
      REQ-121（見送り記録 adf-simplification-deferred-records.md の正規保持義務）を廃止する（retired/ 移行、Decision は作成しない）。保持対象の docs/designs/local/adf-simplification-deferred-records.md を削除し、同文件が保持する測定待ち項目16件（L-001、R-002 第19/23、S-002、S-003、B-001、B-002、X-003、D-002、D-003、I-003、T-003、T-004、E-003、G-001、G-004、B-1/B-2/B-4/B-5、A-3、A-4）はすべて「完全削除」処分とする（利用者確定事項: 測定待ち案件は二択即決の裁量委譲済み）。learning の deferred.md・evaluation-report.md・inbox.md から測定不能系項目を削除し空の初期状態へリセットする（機構存続、利用者指示による明示決済）。
  - id: AG-005
    content: |
      REQ-109 のうち新原則と意味が衝突する4行（REQ-109-002/004/007/008）を修正し、維持行（REQ-109-001/005/006）は存続する。修正は中間対照資産の恒久維持を前提としない照合（Git 履歴と正規成果物による確認）と、未処理情報の後続処理における測定待ち保留の禁止・完全削除処分の決済記録の扱いを明確化するものである。
  - id: AG-006
    content: |
      実質変更13 REQ（REQ-010、REQ-051、REQ-117、REQ-036、REQ-007、REQ-055、REQ-031、REQ-032、REQ-030、REQ-119、REQ-094、REQ-034、REQ-103）の対象行を修正・廃止する。内訳は baseline 体系撤廃（REQ-010-079/084 修正、REQ-007-009/010/012/013、REQ-055-002、REQ-031-028/036、REQ-032-030、REQ-030-032、REQ-036-022/027、REQ-051-009）、廃止語彙・旧パス検出撤廃（REQ-010-066/067 廃止、REQ-094）、回帰テスト義務の現状化（REQ-010-080 廃止、REQ-010-010/068 は未来向き義務として維持）、IR 削除反映（REQ-117-003/015、REQ-036-025）、過去 migration 記録の扱い修正（REQ-103-020/021）、blocked 部分継続行の整合確認（REQ-034-014）である。REQ-010-081/085 は IR-072 が存続するため修正対象外、REQ-036-002 は IR-056 が存続するため修正対象外とする。さらに baseline 前提行の現状化として REQ-010-007（基準既知/新規区別を textlint 系に限定、integrity 系は全件新規扱いで即時解消）、REQ-010-074（既知 delta の baseline 取り込み部分の撤廃、textlint 拒否対象違反への適用除外規定は維持）、REQ-010-082（lint_skills warning の集約予算管理を baseline 前提から直接修正0件化前提へ修正、warning 報告区別は維持）を修正対象に含める。REQ-007・REQ-010・REQ-055 の本文（目的節を含む）の v4-quality-gate-model.md パス・名称参照も改名後名称へ置換する（機械的参照群と同一の置換）。
  - id: AG-007
    content: |
      REQ-003 に2つの action を適用する。(a) issue-3494 の仕様反映として、サブエージェントが環境制約により書き込めない場合に親オーケストレータが直接書き込むフォールバックを標準動作として許容する旨の要件行を追加する（発動条件は「環境制約により書込み不能」に限定し、一時障害と区別する）。(b) 本文中の v4-delegation-contracts・v4-runtime-execution-model 参照を改名後名称へ置換する。REQ-003-024 の文言は原則3の狭義解釈により維持する（learning 空初期化は利用者指示の明示決済であり「自動削除」に該当しないため矛盾しない）。
  - id: AG-008
    content: |
      機械的参照群12 REQ（REQ-002、REQ-012、REQ-014、REQ-021、REQ-027、REQ-037、REQ-038、REQ-039、REQ-041、REQ-052、REQ-054、REQ-096）について、本文中の v4-/v5-/v51- 接頭辞 Design 参照を改名後の名称へ一括置換する（意味変更なし）。REQ-038 は原則3狭義解釈により deferred 機構が存続するため文言修正を行わず参照置換のみとする。
  - id: AG-009
    content: |
      13 Design を git mv で改名する（foundations: v4-durable-state-and-recovery→durable-state-and-recovery、v4-operating-model→operating-model、v4-responsibility-boundaries→responsibility-boundaries、v4-runtime-execution-model→runtime-execution-model、v4-traceability-model→traceability-model、v5-adopted-conventions→adopted-conventions、workflows: v4-collaboration-loop→collaboration-loop、v4-delegation-contracts→delegation-contracts、v4-lifecycle-state-machine→lifecycle-state-machine、v4-standard-lifecycle→standard-lifecycle、v51-phase-driven-collaboration-model→phase-driven-collaboration-model、v51-phase-transition-and-coexistence-model→phase-transition-and-coexistence-model、quality: v4-quality-gate-model→quality-gate-model）。各 Design の H1・見出しから v4/v5/v5.1 表記を除去し、歴史的比較記述を削ぎ落とす。加えて crosswalk 系4件（v3-v4-crosswalk.md、references/v4-v5-crosswalk.md、references/crosswalk-inventory.md、v4-migration-and-release.md）、scripts/consumer/v4-migration/、scripts/consumer/v5-migration/ を削除し、docs/reports の過去マイグレーションレポートは必要に応じ整理する。全リポジトリ（docs/、src/、.opencode/、.agentdev/extensions/skills/、traceability/、AGENTS.md）の参照を一括置換する（docs/reports 履歴は除外）。
  - id: AG-010
    content: |
      integrity 検査体系を簡素化する。(4.1) repo-agentdev-integrity の data/obsolete-path-map.yaml、data/obsolete-vocabulary-map.yaml、data/retired-artifact-registry.yaml、scripts/ir057_history_exemption.ts、scripts/check_retired_artifact_residual.ts を削除し、参照呼出を除去する。(4.2) docs/designs/integrity/rules/ から IR-009/014/021/046/054/057/065/066 の8ルールを削除し、integrity-rule-catalog.md・SKILL.md・check_integrity.ts（と関連テスト）から定義・実装・アサーションを削除する。IR-055・IR-059 は baseline 撤廃後もルールとして存続させ、baseline による免除管理・delta 運用のみを撤廃する（検出違反は直接修正で解消。IR-073 と同一の扱い。adversarial-review 争点A の合意。DEC-014・DEC-006 が定める IR-059 の範囲・経路は維持される）。(4.3) baselines/ 全ファイル（exemptions.json、ir-055-baseline.json、ir-059-baseline.json、lint-skills-baseline.json、ng-baseline.json）を削除し、check_integrity.ts、lint_skills.ts、lib/distribution-boundary-baseline.ts、lib/distribution-boundary-exemptions.ts 等から baseline 読込・免除判定を削除（または空配列フォールバックへ簡素化）する。OU-004 冒頭で baseline 空相当の dry 実行を行い顕在化違反の実測インベントリ（ファイル・検査・処理区分〔直接修正/ルール緩和/gitignore 対象化〕）を作成し、それに基づいて撤廃で表面化する違反は免除せず対象ファイル側を直接修正（または過剰ルール緩和）してエラー0件化する。インベントリに現行 REQ 行の意味修正（REQ-108/114 等 IR-044 違反）が含まれる場合は当該行修正を実施し、対象・件数・理由を完了報告と対応 Issue/PR に記録する。third-party Skill 4件（explainer・explainer-book・first-reader・yomiyasu）の skill-use-for-boundary 免除は、lint_skills 側に third-party Skill の USE FOR 境界の代替扱い（コードレベル豁免または個別修正と再取得時の再発受容）を checker-execution-contracts へ記載して移行する。(4.4) 回帰テスト10本（regression_decision_readme、regression_history_record_exemption、regression_ir057_rule_exemption、regression_issue616、regression_lifecycle_review_false_positive、regression_mapping_table_contract_removed、regression_req095_issue_list_discipline、regression_req_id_width、regression_req_id_width_generator、tests/delegation_retired_residual.test.ts）を削除する。(4.5) 削除 IR（8ルール）と baseline 撤廃の波及参照を更新する: rule-ownership.md（IR-054/057/065/066 の所有権行と REQ-010-066/067/080 行ID参照の除去）、req-impact-map.md（REQ-001 行 IR-054/057、REQ-010 行 IR-065/066、REQ-029 行 baseline 記述、REQ-036 行 IR-009/057 の除去・更新）、integrity-contracts.md（finding-baseline 分類・RuntimeReference baseline 運用手順・NG baseline 運用手順・恒久免除レジストリ schema・IR-055 warning ratchet 節の baseline 撤廃後の実態への更新）、distribution-boundary.md（IR-055/059 の baseline 運用記述の更新）、project-extensions.md（IR-059 baseline 運用記述の更新）、design-health-metrics.md・docs/designs/README.md・document-model.md・agentdev-doc-diagnostics Design の IR-054 参照除去、agentdev-skill-authoring.md（IR-059 exemption 記述の更新）、v4-quality-gate-model.md L138 の checker-execution-contracts 節名参照更新（ACT-DESIGN-014 と同一変更内で実施）、targeted-docs-guard-implementation.md（IR-057・obsolete-path-map SSoT 記述の更新）、authoring/vocabulary-registry.md と repo-agentdev-integrity references/vocabulary-registry.md（IR-055 baseline 対照表の更新）、存続 IR rule 文書（IR-060/062/071 等）の削除 IR・baseline 運用への言及修正、integrity-rule-catalog.md 本文の IR-055 専用節（集計仕様・template placeholder exemption）と AG-005 規則群節（lint-skills-baseline 管理記述）の baseline 撤廃後の実態への更新。docs/reports・docs/knowledge・retired/ は履歴・非正規領域として対象外とする。
  - id: AG-011
    content: |
      .agentdev 実行証跡とレガシー状態をクリーンアップする。jev-observations の *.json 516件を削除し .gitkeep を残す（DEC-040 履歴パージ契約の realization、機構は存続）。backlog-auto/end-to-end 配下の実行証跡6ディレクトリ、inspect/inbox の inspect-docs-finding-*.md 18件を削除する（履歴は Git 履歴で担保、pending findings 削除は利用者承認済み）。blocked 記録2件（case-auto-20261008-3548-3549-3550-3552.md、issue-3494-DEL-3494-1.md）と放置ドラフト2件（req-draft-caseready-cleanup-suppression.md、req-draft-correction-3887-verification.md）を削除する（blocked/drafts 機構自体は存続、実体削除は利用者指示）。パージ実行前に実行中ワークフロー（backlog-auto/inspect/learning）がないことを確認する。パージは参照置換検証（Phase 5）の前に実行し、旧参照の検証ノイズを除去する。
  - id: AG-012
    content: |
      issue-3494 の仕様を反映する。サブエージェントが環境制約により書き込めない場合に親オーケストレータが直接書き込むフォールバックを標準動作として許容する旨を、委譲契約（delegation-contracts Design）、case-auto 設計書、関連スキル定義の3系統へ明記する。blocked 記録 issue-3494（agentdev_gh 全操作が gh exit 66 で失敗した OpenCode plugin host spawn コンテキスト障害の記録）は当該仕様反映の根拠として扱い、反映完了後に AG-011 の削除対象とする。
  - id: AG-013
    content: |
      Phase 5 で収束検証する。traceability/*.yaml の参照を最新化し、generate_indexes.ts でインデックスを再生成し、check_autogen_freshness.ts と check_integrity.ts と bun test 全件（3分割正規形: cwd=リポジトリルート、./付きパス、REQ-060）を PASS（Exit 0）させる。削除・リネーム件数、簡素化したルール、PASS 結果を完了報告として対応 Issue/PR に記録する。DEC-062（要件ID桁数の受理上限撤廃）が regression_req_id_width 系テスト削除により守備を失う場合、現行契約が要求する残存カバレッジがないことを確認する（契約が要求するものが残る場合は findings に記録する）。

artifact_actions:
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:experimental-cleanup
    source_items: [AG-001, AG-002, AG-003]
    content: |-
      主題: 実験前提の恒久運用原則の採用と移行完了後レガシー資産の扱い境界（実験・ロールバック許容／後方互換不要の LLM・スクリプト一括移行／測定不能停滞の二択即決決済）
      決定事項:
      1. 本リポジトリの変更は実験として扱い、ロールバックは Git 履歴による復元で対応する。対照表・バックアップ資産などの防衛的恒久資産の維持を移行・整理の前提条件としない。
      2. 後方互換性を維持しない。旧表記・旧パス・旧契約への移行補助層（crosswalk、Baseline、マイグレーションスクリプト）を恒久資産として維持せず、LLM/スクリプトによる一括直接修正を標準手段とする。履歴性は Git 履歴で担保する（DEC-013 と同一の方針）。baseline 機構の撤廃は検査ルール自体の廃止を意味しない: 存続検査（IR-055・IR-059・IR-073 等）は baseline による免除管理・delta 運用を失った後も検出器として存続し、検出違反は直接修正で解消する（DEC-014・DEC-006 が定める IR-059 の範囲・経路は維持される）。
      3. 測定不能を理由とする停滞を排除する。再評価条件が実測不能・確定不能のままの保留（測定待ち）を禁止し、測定待ち案件は「仮説の即時導入」または「完全削除」の二択で即決する。完全削除処分は処分理由の明示をもって決済記録とし、黙認と区別する。
      4. 原則3の適用範囲は狭義とする。deferred 機構（REQ-038-006）と blocked 機構（REQ-120）そのものは存続させ、「測定待ちを理由とする保留」のみを禁止する。DEC-027 の観測ベース評価ループ（実測してから縮小判断）と矛盾しない。測定がないことのみを削除理由とする広義解釈は採用しない。
      5. DEC-056（ADF v5 移行と互換性の境界）との適用時間軸の区別: 移行実行中は DEC-056/REQ-109 の意味保存・検証義務が優先する。移行完了後のレガシー資産には本原則を適用し、対照表・baseline 等の恒久維持義務を負わない。DEC-056 の決定内容（後方互換非必須・意味保存移行・検証不足時の成功宣言禁止）は本原則と同方向であり、本 Decision は DEC-056 を覆すものではない。
      relations: DEC-056（relates-to）、DEC-027（relates-to）、DEC-001（relates-to）
      影響する成果物: docs/designs/foundations/design-principles.md（3原則の節を新設）、AGENTS.md（3原則を最上位ルールとして追記）、docs/designs/local/adf-simplification-deferred-records.md（削除、REQ-121 廃止）、learning 測定不能系項目（空初期化）
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-121.md
    source_items: [AG-004]
    content: |-
      REQ-121 を廃止する（retired/ へ移行）。保持対象である docs/designs/local/adf-simplification-deferred-records.md が削除され、見送り項目の正規保持義務という存在目的を失うためである。移行に伴い、docs/requirements/README.md の REQ 一覧から REQ-121 を除外し（AUTOGEN 表は Phase 5 の再生成で反映）、廃止注記（廃止理由: 実験前提の恒久運用原則の採用に伴う測定待ち案件の完全削除処分。処分決済は本要件定義の AG-004）は retired/REQ-121.md 本文に付す（retired 表の per-row 注記は AUTOGEN のため本文側が正。IR-040 の廃止注記慣行に従う）。REQ-121 を参照する traceability sidecar（policy.yaml の REQ-121-001 登録等）・文書が存在する場合は、参照を除去するか廃止注記つき retired 参照へ更新する。要件行の修正ではなく REQ 全体の廃止であるため、行の部分的修正は行わない。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-109.md
    source_items: [AG-005]
    content: |-
      次の4行を修正する（表構造は現行の ID 列と要件列の2列構造を維持）。
      REQ-109-002 修正後: 既存の有効な正規情報（要件、受け入れ条件、重要判断、現在の設計）について、移行先で元の意味と必要な理由・参照関係を確認できること。確認は正規成果物自体と Git 履歴による読み出しで行い、中間対照資産（crosswalk 等）の作業面上の維持を条件としないこと。
      REQ-109-004 修正後: 移行元情報を破壊せず、移行が失敗・中断した後も移行元の確定情報を読み出して移行前の内容と照合できること。照合手段として Git 履歴による読み出しを含み、対照表ドキュメントの恒久維持を条件としないこと。
      REQ-109-007 修正後: 移行前に未処理として存在する Intake・Learning・Backlog の各情報について、移行後に内容、処理状態、必要な参照関係を確認でき、未処理状態から適切な後続処理を継続できること。後続処理には測定待ちを理由とする保留を含まず、仮説の即時導入または完全削除の二択による即時決済として処理すること。
      REQ-109-008 修正後: 未処理の Intake・Learning・Backlog 情報に移行時の欠落・参照不整合・処理状態不明がある場合、対象と理由を検証結果から特定でき、破棄済み・処理済みとして黙認せず、移行完了と判定しないこと。完全削除処分は処分理由を明示した決済記録として扱い、黙認と区別すること。
      REQ-109-001/005/006 は維持し修正しない。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-006, AG-010]
    content: |-
      baseline 体系撤廃に伴う2行の修正。REQ-010-079 修正後: docs-check は warning 総数の未解決残置を許容しないこと。baseline（IR-055）による免除管理・ratchet は行わず、warning の解消または検出対象からの明示的な除外判断を都度の判断記録として扱うこと（IR-055 の検出器自体は存続する）。REQ-010-084 修正後: docs-check の恒常 checker（check_integrity）は、リポジトリの未追跡かつ gitignore 管理対象外のファイル・ディレクトリを検出する検査を持つこと。承認一覧（ng-baseline）による恒久管理は行わず、検出は都度の解消または gitignore 対象化の明示判断で処理し、検査実行が承認を自動追加しないこと（IR-073 の検出器自体は存続する）。あわせて本文（目的節を含む）の v4-quality-gate-model.md パス・名称参照を改名後名称へ置換する（AG-006 の機械的参照置換と同一の置換。adversarial-review 争点J）。
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-006, AG-010]
    content: |-
      廃止語彙・旧パス検出の撤廃に伴う2行の廃止。REQ-010-066（廃止語彙検出。obsolete-vocabulary-map.yaml 削除により検出語彙の管理実体と checker が消える）と REQ-010-067（旧パス・削除済み名称検出。obsolete-path-map.yaml 削除により同様）を要件表から削除する。語彙・旧パスの恒常検出を前提とした他文書の参照（REQ-094、REQ-117 の関連言及）は各 action で整合させる。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-006, AG-010]
    content: |-
      回帰テスト義務の現状化。REQ-010-080（過去監査 v1〜v4 の再走査結果に基づく新規機械検査クラスの追加義務）を要件表から削除する（当該監査基盤が今回の簡素化で減衰し、再走査結果に基づく追加義務の前提を失うため）。REQ-010-010（新規検査への回帰テスト義務）と REQ-010-068（新規検査クラスごとの回帰テスト義務）は未来向きの一般義務として現行文言のまま維持する。回帰テスト10本の削除は当該テストが守備する検査自体（IR 削除・baseline 撤廃・retired 検出撤廃）の廃止に伴うものであり、維持する検査の守備を欠落させるものではないことを確認のうえ削除する。
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-051.md
    source_items: [AG-006, AG-010]
    content: |-
      REQ-051-009（integrity rules frontmatter related_req 実在性検査）のうち baseline に言及する部分を修正する。baseline 体系の撤廃に伴い、baseline・baseline_status への参照を要件文言から除去し、related_req 実在性検査そのものは維持する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-117.md
    source_items: [AG-006, AG-010]
    content: |-
      IR 削除反映の行修正。REQ-117-003（IR-044 候補行分離）のうち baseline・IR-055 に依存する言及を撤廃後の実態に合わせて修正し、REQ-117-015（IR-067 用語統一）のうち廃止語彙検出（obsolete-vocabulary-map）に依存する部分を撤廃後の実態に合わせて修正する。本文中の IR-073/055 への言及は IR-055 のルール削除に合わせて除去する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-117.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-117 の covers 宣言・本文中の v4-responsibility-boundaries 参照を、Design 改名後の実配置パス（docs/designs/responsibilities/responsibility-boundaries.md）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-006, AG-010]
    content: |-
      baseline・IR 撤廃反映の行修正。REQ-036-022（severity/gate_level 維持・baseline_status を IR スキーマから除外）を baseline 概念撤廃後の実態へ修正する（baseline_status 除外の文言は baseline 体系の廃止により前提が消えるため、severity/gate_level の維持義務に集約）。REQ-036-025（IR-054 draft 放置検出との重複禁止）から IR-054 への参照を除去し、REQ-036-025 自体の DRIFT 診断義務は維持する。REQ-036-027（ng-baseline・exemptions による正規管理）を baseline 撤廃後の実態（根源解消または gitignore 対象化の明示判断）へ修正する。REQ-036-002 は IR-056 が存続するため修正しない。
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-036.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-036 本文中の v4-collaboration-loop・v4-lifecycle-state-machine 参照（「パイプライン全体の共通契約は v4-lifecycle-state-machine Designが」等）を改名後名称（collaboration-loop・lifecycle-state-machine）へ置換する。意味変更は行わない。
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-007.md
    source_items: [AG-006, AG-010]
    content: |-
      baseline 再生成系4行の修正。REQ-007-009/010/012/013（baseline 再生成・NG baseline 保持型 gate の対照実行・baseline commit 参照不能対策）は baseline 体系撤廃に伴い、baseline を前提としない検証契約へ修正する（対照実行・再生成・commit 参照の各義務を撤去し、検証は現行ファイルに対する直接実行で完結する旨へ集約）。修正後の行文言は実ファイルの現行表現を踏襲して最小変更とする。あわせて本文（目的節を含む）の v4-quality-gate-model.md パス・名称参照を改名後名称へ置換し、目的節の「baseline commit 基準」語彙を baseline 撤廃後の実態へ修正する（adversarial-review 争点J）。
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-055.md
    source_items: [AG-006, AG-010]
    content: |-
      REQ-055-002（REQ-007 への baseline 再生成所有の委譲、production-equivalent verification）を修正する。baseline 再生成の委譲部分を撤廃し、production-equivalent verification の要件は維持する。あわせて本文（目的節を含む）の v4-quality-gate-model.md パス・名称参照を改名後名称へ置換する（adversarial-review 争点J）。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-031.md
    source_items: [AG-006, AG-010]
    content: |-
      REQ-031-028（IR-055 を含む検査への言及）と REQ-031-036（IR-055 checker 言及）を、IR-055 ルール削除後の実態へ修正する（IR-055 への参照を除去し、残存検査の列挙に集約）。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-032.md
    source_items: [AG-006, AG-010]
    content: |-
      REQ-032-030（provenance-tracked baseline 登録漏れ検査）を要件表から削除する（baseline 体系の撤廃により検査対象が消滅するため）。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-015
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    source_items: [AG-006, AG-010]
    content: |-
      REQ-030-032（main baseline 対照経路）を撤廃後の実態へ修正する（baseline 対照を前提とする経路の記述を、現行ファイルに対する直接検証へ置換）。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-016
    artifact: req
    operation: update
    target: docs/requirements/REQ-119.md
    source_items: [AG-006, AG-009]
    content: |-
      REQ-119-004 の行内で v51-phase-transition-and-coexistence-model ファイル名を明示している部分を、改名後の phase-transition-and-coexistence-model へ置換する。行のその他の文言（frontmatter updated 進行義務・IR-072 補正）は維持する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-017
    artifact: req
    operation: update
    target: docs/requirements/REQ-094.md
    source_items: [AG-006, AG-010]
    content: |-
      用語選択・語彙管理基準のうち、廃止語彙検出（obsolete-vocabulary-map）と語彙レジストリによる恒常機械検出を前提とする部分を、撤廃後の実態（語彙の恒常機械検出は行わず、用語選択基準としての判断は維持）へ修正する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-018
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-006, AG-011, AG-012]
    content: |-
      REQ-034-014（blocked 部分継続）について、blocked 記録2件の削除と issue-3494 フォールバック仕様反映に伴う文言の整合確認を行う。blocked 機構（REQ-120）は存続するため行の要件本体は維持し、削除された blocked 記録に依存する具体的な言及があれば除去する。REQ-034-028（同期逐次フォールバック禁止、DEC-042）は case-auto の本質行として維持し修正しない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-019
    artifact: req
    operation: update
    target: docs/requirements/REQ-103.md
    source_items: [AG-006, AG-009]
    content: |-
      REQ-103-020/021（過去 release/migration 記録の扱い）を、v4-migration-and-release 削除後の実態へ修正する（当該 Design への参照を除去し、過去記録は Git 履歴で担保する旨へ集約）。REQ-103 本文の判断アーキテクチャ詳細基準節にある v4-responsibility-boundaries 参照は ACT-REQ-008 と同一の改名後名称へ置換する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-020
    artifact: req
    operation: append
    target: docs/requirements/REQ-003.md
    source_items: [AG-007, AG-012]
    content: |-
      新要件行（付与番号は保存時の採番規則に従う）: サブエージェントへの委譲において、サブエージェントが環境制約により対象への書込みを行えない場合（一時障害と区別される恒常的な書込み不能）、親オーケストレータが当該書込みを直接実行するフォールバックを標準動作として許容すること。フォールバック発動時は委譲記録に発動理由（環境制約の内容）と親実施の事実を記録すること。この許容は agentdev_gh 等の Custom Tool 境界と git 操作ガイドレールを置き換えるものではなく、書込み経路の追加选项として機能すること。
  - id: ACT-REQ-021
    artifact: req
    operation: update
    target: docs/requirements/REQ-003.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-003 本文中の v4-delegation-contracts・v4-runtime-execution-model 参照を改名後名称（delegation-contracts・runtime-execution-model）へ置換する。REQ-003-024 は原則3の狭義解釈により現行文言を維持し修正しない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-022
    artifact: req
    operation: update
    target: docs/requirements/REQ-002.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-002 本文中の v4-responsibility-boundaries 参照を改名後名称（responsibility-boundaries、実配置パス docs/designs/responsibilities/responsibility-boundaries.md）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-023
    artifact: req
    operation: update
    target: docs/requirements/REQ-012.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-012 本文中の v4-traceability-model 参照を改名後名称（traceability-model）へ置換する。REQ-012-047（対応先パス解決不能の決定的検出）の契約は維持し、改名に伴う sidecar 同期は Phase 5 の traceability 最新化で対応する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-024
    artifact: req
    operation: update
    target: docs/requirements/REQ-014.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-014 本文中の v4-lifecycle-state-machine・v4-delegation-contracts 参照を改名後名称（lifecycle-state-machine・delegation-contracts）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-025
    artifact: req
    operation: update
    target: docs/requirements/REQ-021.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-021 本文中の v4-traceability-model 参照を改名後名称（traceability-model）へ置換する。REQ-021-028/029（policy 登録は同一 Definition 変更）と REQ-021-031/032（optional 区分機構）の契約は維持する。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-026
    artifact: req
    operation: update
    target: docs/requirements/REQ-027.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-027 本文中の v4-responsibility-boundaries 参照を改名後名称（responsibility-boundaries）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-027
    artifact: req
    operation: update
    target: docs/requirements/REQ-037.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-037 本文中の v4-collaboration-loop・v4-lifecycle-state-machine 参照を改名後名称（collaboration-loop・lifecycle-state-machine）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-028
    artifact: req
    operation: update
    target: docs/requirements/REQ-038.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換のみ。REQ-038 本文中の v4-collaboration-loop・v4-lifecycle-state-machine 参照を改名後名称（collaboration-loop・lifecycle-state-machine）へ置換する。REQ-038-006/007（learning deferred.md 読込・living pool 維持・自動削除禁止）は原則3の狭義解釈により deferred 機構が存続するため現行文言を維持し修正しない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-029
    artifact: req
    operation: update
    target: docs/requirements/REQ-039.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-039 本文中の v4-collaboration-loop・v4-lifecycle-state-machine 参照を改名後名称（collaboration-loop・lifecycle-state-machine）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-030
    artifact: req
    operation: update
    target: docs/requirements/REQ-041.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-041 本文中の v4-collaboration-loop・v4-lifecycle-state-machine 参照を改名後名称（collaboration-loop・lifecycle-state-machine）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-031
    artifact: req
    operation: update
    target: docs/requirements/REQ-052.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-052-012 を含む本文中の v4-delegation-contracts 参照を改名後名称（delegation-contracts）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-032
    artifact: req
    operation: update
    target: docs/requirements/REQ-054.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-054 本文中の v4-quality-gate-model 参照を改名後名称（quality-gate-model）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-033
    artifact: req
    operation: update
    target: docs/requirements/REQ-096.md
    source_items: [AG-008, AG-009]
    content: |-
      機械的参照置換。REQ-096 本文中の v4-responsibility-boundaries 参照（閉包条件等の集約所有の言及）を改名後名称（responsibility-boundaries）へ置換する。意味変更は行わない。表構造は実ファイルの現行構造に従う。
  - id: ACT-REQ-034
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-006, AG-010]
    content: |-
      baseline 前提行の現状化（adversarial-review 争点I）。REQ-010-007（基準既知の検出事項と新規検出事項の区別）を textlint 系共通検査の既知/新規区別に限定する文言へ修正し、integrity 系検査は既知集合管理を廃止して全件を新規扱いで即時解消する旨を明記する。REQ-010-074（既知 delta の区分管理）から baseline への取り込み部分を撤廃後の実態へ修正し、共通 textlint 検査の拒否対象違反への適用除外規定は維持する。REQ-010-082（lint_skills warning 運用）の集約予算の漸進回収を baseline 前提から直接修正0件化前提へ修正し、warning と検証不通過の summary 区別と warning の無視・抑制禁止は維持する。表構造は実ファイルの現行構造に従う。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: foundations
      slug: design-principles
    target_area: "# 設計原則"
    source_items: [AG-001, AG-002, AG-003]
    content: |-
      文書先頭（# 設計原則 の直後、既存の Design と Decision の境界注記の後に挿入）へ実験前提の3原則の節を新設する。節見出しは「## 0. 実験前提の3原則（最上位ルール）」とし、本文は新 Decision（new:experimental-cleanup）の決定事項1〜4に準拠する。(1) 実験・ロールバック許容（Git 履歴で復元可能、防衛的恒久資産の維持を前提としない）、(2) 後方互換性の完全破棄（crosswalk・Baseline 等の移行補助層を維持せず LLM/スクリプト一括直接修正を標準手段とする、履歴性は Git 履歴で担保）、(3) 測定不能による停滞排除（測定待ち保留の禁止、二択即決、完全削除処分は処分理由明示の決済記録、deferred/blocked 機構は存続し測定待ち理由の保留のみ禁止、DEC-027 の観測ベース評価ループと矛盾しない）の3原則と、既存節（work_type 分類、要件と仕様の分離等）との優先関係（3原則は他の原則に先行する最上位ルール）を明記する。入力計画が前提した「1. ゼロベース原則」節は現行ファイルに存在しないため（ゼロベース原則は retired REQ-020 由来）、新規節の新設として扱う（組立時確定の注記、CR-004）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: durable-state-and-recovery
    target_area: "# ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF durable state と再構成・恢復（配置表・権威移行・部分失敗調整）」へ変更し、本文の見出し・本文中の v4/v5/v5.1 表記を現行モデル名称へ除去・置換する。v4 から v5 への移行を説明する歴史的比較記述（旧モデルとの対比節）は削ぎ落とし、現行仕様の記述のみを残す。ファイル名は durable-state-and-recovery.md へ git mv で改名する（改名実行は realization 側 RA-006）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: operating-model
    target_area: "# ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は operating-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: responsibility-boundaries
    target_area: "# ADF v4 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は responsibility-boundaries.md へ改名する（RA-006）。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: runtime-execution-model
    target_area: "# ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は runtime-execution-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: traceability-model
    target_area: "# ADF v4 Traceability モデル（Change / Evidence 中心）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF Traceability モデル（Change / Evidence 中心）」へ変更し、本文中の v4/v5/v5.1 表記（「標準関係の構造（v5 語義）」等の節名を含む）を現行名称へ置換し、歴史的比較記述を削ぎ落とす。ファイル名は traceability-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: adopted-conventions
    target_area: "# ADF v5 採用規約機構（採用済み工程・成果物規約の宣言・保存・解決）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 採用規約機構（採用済み工程・成果物規約の宣言・保存・解決）」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は adopted-conventions.md へ改名する（RA-006）。
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: collaboration-loop
    target_area: "# ADF v4 継続コラボレーションループ"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 継続コラボレーションループ」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は collaboration-loop.md へ改名する（RA-006）。
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target_area: "# サブエージェント委譲契約（v4）"
    source_items: [AG-009, AG-012]
    content: |-
      H1 を「# サブエージェント委譲契約」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。あわせて AG-012 の issue-3494 仕様反映として、サブエージェントが環境制約により書込み不能な場合の親オーケストレータ直接書込みフォールバック（発動条件は環境制約に限定、発動時の委譲記録義務、Custom Tool 境界と git ガードレールは置き換えない）を許容する契約を本文へ追加する。ファイル名は delegation-contracts.md へ改名する（RA-006）。
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: lifecycle-state-machine
    target_area: "# ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は lifecycle-state-machine.md へ改名する（RA-006）。
  - id: ACT-DESIGN-011
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: standard-lifecycle
    target_area: "# ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）」へ変更し、本文中の v4/v5/v5.1 表記（「work_type / scale / Epic / Wave の v4 意味モデル」等の節名を含む）を現行名称へ置換し、歴史的比較記述を削ぎ落とす。ファイル名は standard-lifecycle.md へ改名する（RA-006）。
  - id: ACT-DESIGN-012
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: phase-driven-collaboration-model
    target_area: "# ADF v5.1 工程駆動コラボレーションモデル"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 工程駆動コラボレーションモデル」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述を削ぎ落とす。ファイル名は phase-driven-collaboration-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-013
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: phase-transition-and-coexistence-model
    target_area: "# ADF v5.1 工程遷移・独立レビューと双経路併存モデル"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF 工程遷移・独立レビューと双経路併存モデル」へ変更し、本文中の v4/v5/v5.1 表記を除去・置換し、歴史的比較記述（v4-v5 crosswalk 系の併存説明を含む）を削ぎ落とし、現行の工程駆動モデルの記述へ集約する。ファイル名は phase-transition-and-coexistence-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-014
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: quality
      slug: quality-gate-model
    target_area: "# ADF v4 Quality / Verification / Evidence / Gate モデル"
    source_items: [AG-009]
    content: |-
      H1 を「# ADF Quality / Verification / Evidence / Gate モデル」へ変更し、本文中の v4/v5/v5.1 表記（「v4 standard lifecycle からの Gate 再導出」等の節名を含む）を現行名称へ置換し、歴史的比較記述を削ぎ落とす。ファイル名は quality-gate-model.md へ改名する（RA-006）。
  - id: ACT-DESIGN-015
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: "IR ルールカタログ"
    source_items: [AG-010]
    content: |-
      削除対象 IR（IR-009、IR-014、IR-021、IR-046、IR-054、IR-057、IR-065、IR-066 の8ルール。計画 Phase 4.2 の明示対象。IR-055/IR-059 は baseline 撤廃後も検出器として存続させるため削除対象外とする〔adversarial-review 争点A〕）のカタログエントリを削除し、ルール番号の欠番の扱いをカタログの運用規則に従って明記する。あわせてカタログ本文中の該当節（IR-054/057/065/066 関連記述、IR-055 の baseline 運用記述〔集計仕様・template placeholder exemption の baseline 整合部分〕、AG-005 規則群節の lint-skills-baseline.json 管理記述、新規カテゴリ追加判定フローの baseline_status 記述）を baseline 撤廃・8ルール削除後の実態へ更新する。残存 IR（IR-055/059/073 等）の検出器としての説明は維持する。
  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: "宣言的データ"
    source_items: [AG-010]
    content: |-
      宣言的データ（obsolete-path-map.yaml、obsolete-vocabulary-map.yaml、retired-artifact-registry.yaml、exemptions.json、各 baseline）の記載を削除・更新し、checker 実行契約から baseline 読込・免除判定・retired 残存検出・廃止語彙検出・旧パス検出の各経路を除去した後の実行契約を記述する（IR-055/IR-059 の検出器自体は存続させ、baseline 運用のみ撤廃する）。third-party Skill 4件（explainer・explainer-book・first-reader・yomiyasu）の skill-use-for-boundary 免除の代替扱い（lint_skills 側の豁免または個別修正と再取得時の再発受容）を記載する（adversarial-review 争点C）。実装側スクリプト（ir057_history_exemption.ts、check_retired_artifact_residual.ts、lib/distribution-boundary-baseline.ts、lib/distribution-boundary-exemptions.ts の削除・簡素化）との対応を明記する。

conflict_resolutions:
  - id: CR-001
    conflict: DEC-056（ADF v5 移行と互換性の境界）の「移行元情報を破壊せず・検証可能に・未処理情報の処理継続」と新原則（crosswalk 等の中間資産削除・測定待ち停滞排除）の間の意味的緊張。
    resolution: DEC-056 本文に「crosswalk 等の移行記録の恒久維持」を定めた条項は存在せず、意味保存・検証は移行プロセス中の義務であるため、条項衝突ではなく適用時間軸の区別問題と判定。DEC-056 は supersede・部分置換とも行わず accepted 維持・relates-to 接続とし、新 Decision 本文で「移行実行中は意味保存・検証義務が優先、移行完了後のレガシー資産には本原則を適用、履歴性は Git 履歴で担保（DEC-013 と同一方針）」を明示して解消した（architecture-advisory 助言 Q1、Jev 20261117T132114Z-0cdb q5）。
  - id: CR-002
    conflict: REQ-003-024（学習成果物の deferred・未処理は自動削除対象から除外）と REQ-038-002/006（deferred 機構の維持・自動削除禁止）と learning 測定不能系項目の空初期化の間の緊張。
    resolution: 原則3を狭義解釈（deferred 機構は存続し「測定待ちを理由とする保留」のみ禁止）とし、learning 空初期化は workflow の自動削除ではなく本要件定義に基づく利用者指示の明示決済として実行する位置づけとした。REQ-003-024 と REQ-038-006/007 は文言修正せず維持する（architecture-advisory 助言 Q3、Jev 20261117T132114Z-0cdb q3/q4）。
  - id: CR-003
    conflict: DEC-027（観測ベース統制縮小評価ループ。実測してから縮小判断、単一指標のみで判断しない、測定なしのみで DELETE しない）と原則3（測定不能停滞排除）の解釈衝突の可能性。
    resolution: 原則3は狭義解釈（再評価条件が実測不能・確定不能のままの保留の禁止・二択即決）とし、DEC-027 の評価ループ（Candidate から KEEP/NARROW/MERGE/DOWNGRADE/DELETE への判断整理）と同方向の「判断の後回し排除」として位置づけた。測定がないことのみを削除理由とする広義解釈は採用しない。DEC-027・REQ-048 は変更しない（architecture-advisory 助言 Q3）。
  - id: CR-004
    conflict: 入力計画 Phase 1 が「design-principles.md の『1. ゼロベース原則』を拡張し3原則統合」と記載するが、現行の design-principles.md に同節が存在しない（ゼロベース原則は retired REQ-020 由来で現行ファイルに節なし）。
    resolution: 計画の意図（3原則を Design の原則に統合）を満たす実態合わせの解釈として、文書先頭へ「## 0. 実験前提の3原則（最上位ルール）」節を新設する形に読み替えた。既存節構造（## 1.〜## 8.）は番号を維持し変更しない。新 Decision の決定事項と整合する本文とする。
  - id: CR-005
    conflict: 組立段階で検討した「IR-055・IR-059 を baseline 削除と一体でルール削除（8ルール→10ルール拡張）」案は、IR-055/059 が移行補助層でなく現行の enforcement 層である点で DEC-014（IR-059 の範囲・経路を確定し後続決定へ委ねない）・DEC-006（IR-059 を IR-056 へ統合しない）と衝突し、REQ-010-084 の IR-073（ng-baseline 撤廃・ルール存続）との扱いとも不整合になる（adversarial-review 争点A）。
    resolution: IR-055・IR-059 は baseline のみ撤廃し検出器として存続させる（IR-073 と同一の扱い。検出違反は直接修正で解消）。削除対象は計画 Phase 4.2 明示の8ルール（IR-009/014/021/046/054/057/065/066）のみとし、DEC-014・DEC-006 が定める IR-059 の範囲・経路は維持される。新 Decision の決定事項2に baseline 機構撤廃が検査ルール廃止を意味しない旨を明記した。
  - id: CR-006
    conflict: baseline 撤廃により顕在化する違反（ng-baseline 950行超・exemptions 12件に含まれる現行違反。REQ-108/114 等 IR-044 違反、third-party Skill 4件の境界逸脱）の実数は baseline が stale であるため事前確定できず、顕在化違反の直接修正が正規 REQ 行の意味修正を含む場合に artifact_actions の枠外で正規成果物変更が発生するリスク（adversarial-review 争点C）。
    resolution: OU-004 冒頭で baseline 空相当の dry 実行による顕在化違反の実測インベントリ（ファイル・検査・処理区分）作成を義務づけ、現行 REQ 行の意味修正が検出された場合は当該行修正を実施して対象・件数・理由を完了報告と対応 Issue/PR に記録する。third-party Skill 4件の免除は checker-execution-contracts への代替扱い記載で移行する。

operation_units:
  - ou_id: OU-001
    target_req: [REQ-003, REQ-007, REQ-010, REQ-012, REQ-014, REQ-021, REQ-027, REQ-030, REQ-031, REQ-032, REQ-034, REQ-036, REQ-037, REQ-038, REQ-039, REQ-041, REQ-051, REQ-052, REQ-054, REQ-055, REQ-094, REQ-096, REQ-103, REQ-109, REQ-117, REQ-119, REQ-121]
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: 正規成果物の確定と3原則の正規化。Decision new:experimental-cleanup 作成（ACT-DEC-001）、design-principles.md へ3原則節新設（ACT-DESIGN-001）、REQ 27件の全更新（ACT-REQ-001〜033 の REQ 操作）、13改名 Design・integrity 2 Design の本文更新（ACT-DESIGN-002〜016）、AGENTS.md 3原則追記（RA-001）。Phase 1 相当と全正規成果物操作を含む。
  - ou_id: OU-002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    note: .agentdev 実行証跡とレガシー状態のクリーンアップ（Phase 2）。jev-observations 516件パージと .gitkeep 残置、backlog-auto/end-to-end 6ディレクトリ削除、inspect/inbox 18件削除、blocked 2件と放置ドラフト2件削除、issue-3494 仕様反映（RA-003）、adf-simplification-deferred-records.md 削除、learning 空初期化（RA-002/003/004）。REQ 操作なし。
  - ou_id: OU-003
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    note: レガシー Design の削除・改名と参照一括置換（Phase 3）。crosswalk 系4件と v4-migration-and-release 削除、scripts/consumer/v4-migration と v5-migration 削除、docs/reports 過去マイグレーションレポート必要整理、13文件 git mv 改名、全リポジトリ参照一括置換（docs/、src/、.opencode/、.agentdev/extensions/skills/、traceability/、AGENTS.md。docs/reports 履歴除外）、改名 Design の見出し修正（RA-005/006）。REQ 操作なし（REQ 本文の参照置換適用は OU-001 の artifact_actions が正）。
  - ou_id: OU-004
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    note: integrity 検査体系の簡素化（Phase 4）。冒頭で baseline 空相当の dry 実行による顕在化違反インベントリを作成。data 3件とスクリプト2件の削除と参照呼出除去、IR 8ルール（計画明示分。IR-055/059 は baseline のみ撤廃し検出器存続）の削除とカタログ・SKILL・checker から定義除去、baselines 5ファイル削除と loader 簡素化、顕在化違反の直接修正でエラー0件化、回帰テスト10本削除、削除 IR・baseline 撤廃の波及参照更新（rule-ownership.md、req-impact-map.md、integrity-contracts.md、distribution-boundary.md、project-extensions.md、design-health-metrics.md、docs/designs/README.md、document-model.md、doc-diagnostics、skill-authoring、targeted-docs-guard、vocabulary-registry 両配置、存続 IR rule 文書、カタログ本文節。AG-010 4.5）（RA-007/008/009）。REQ 操作なし（検出された現行 REQ 行違反の修正はインベントリ確定後に実施し記録する）。
  - ou_id: OU-005
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 5
    issue_policy: single
    note: トレーサビリティ最新化と全検証（Phase 5）。traceability/*.yaml 参照最新化、generate_indexes.ts インデックス再生成、check_autogen_freshness.ts・check_integrity.ts・bun test 全件 PASS（Exit 0）、DEC-062 桁数ガード残存カバレッジ確認、完了報告の Issue/PR 記録（RA-010）。REQ 操作なし。

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      AGENTS.md に3原則が最上位ルールとして追記されていること、docs/designs/foundations/design-principles.md に「## 0. 実験前提の3原則（最上位ルール）」節が新設されていること、Decision new:experimental-cleanup が作成されていることを各ファイルの直接確認で検証する。
    pass_criteria: |
      3原則の各要素（実験・ロールバック許容、後方互換性完全破棄と一括直接修正、測定不能停滞排除と二択即決、および deferred/blocked 機構存続の狭義解釈）が3成果物のすべてで確認できること。
    on_failure: |
      fix-and-reverify。追記・新設・作成の不足箇所を補って再検証する（正規成果物の不備は case-close の検証で失敗するため必須）。
  - id: TS-002
    target_item: AG-004
    verification: |
      docs/requirements/REQ-121.md が retired/ へ移行済みであること、docs/designs/local/adf-simplification-deferred-records.md が削除済みであること、.agentdev/learning/ の deferred.md・evaluation-report.md・inbox.md が空初期化済みであること、docs/requirements/README.md の REQ 一覧から REQ-121 が除外されていることを確認する。
    pass_criteria: |
      現行 docs/requirements/ 配下に REQ-121.md が存在せず、retired/ 配下に廃止注記付きで存在すること。deferred-records Design が存在しないこと。learning 3ファイルに測定不能系エントリが残存しないこと。
    on_failure: |
      fix-and-reverify。移行・削除・初期化の不足を補って再検証する。
  - id: TS-003
    target_item: AG-005
    verification: |
      REQ-109 の REQ-109-002/004/007/008 が修正済みであること、REQ-109-001/005/006 が現行文言のまま維持されていることを確認する。Git 履歴（git log -p または git show）で旧文言を照合できることも確認する。
    pass_criteria: |
      4行が修正後文言になっており、3行が未修正で維持されていること。旧文言が Git 履歴から読み出し可能であること。
    on_failure: |
      fix-and-reverify。修正漏れ・過剰修正を是正して再検証する。
  - id: TS-004
    target_item: AG-006
    verification: |
      実質変更13 REQ の対象行（REQ-010-079/084 修正、REQ-010-066/067/080 廃止、REQ-051-009、REQ-117-003/015、REQ-036-022/025/027、REQ-007-009/010/012/013、REQ-055-002、REQ-031-028/036、REQ-032-030、REQ-030-032、REQ-119-004、REQ-094 語彙、REQ-034-014、REQ-103-020/021）が指示どおり修正・廃止済みであること、REQ-010-081/085 と REQ-036-002 が未修正で維持されていることを確認する。
    pass_criteria: |
      修正対象行がすべて処理済みで、対象外行が維持されていること。廃止行が要件表から消えていること。
    on_failure: |
      fix-and-reverify。処理漏れ・過剰修正を是正して再検証する。
  - id: TS-005
    target_item: AG-007
    verification: |
      REQ-003 にフォールバック許容の要件行が追加されていること、delegation-contracts Design（ACT-DESIGN-009）と case-auto 設計書・関連スキル定義にフォールバック許容が明記されていることを確認する。
    pass_criteria: |
      3系統（REQ-003、delegation-contracts Design、case-auto 側設計書・スキル定義）すべてに「サブエージェントが環境制約により書込めない場合の親オーケストレータ直接書込みフォールバック許容（発動条件は環境制約に限定）」が確認できること。
    on_failure: |
      fix-and-reverify。反映漏れ箇所を補って再検証する。
  - id: TS-006
    target_item: AG-008
    verification: |
      旧 Design 名（v4-durable-state-and-recovery、v4-operating-model、v4-responsibility-boundaries、v4-runtime-execution-model、v4-traceability-model、v5-adopted-conventions、v4-collaboration-loop、v4-delegation-contracts、v4-lifecycle-state-machine、v4-standard-lifecycle、v51-phase-driven-collaboration-model、v51-phase-transition-and-coexistence-model、v4-quality-gate-model）の参照が、docs/、src/、.opencode/、.agentdev/extensions/skills/、traceability/、AGENTS.md の全域でゼロであることを検索で確認する（docs/reports 履歴は除外）。
    pass_criteria: |
      上記領域での旧 Design 名参照マッチ数がゼロであること。13改名 Design が新名称の実パスに存在すること。
    on_failure: |
      fix-and-reverify。残存参照を置換して再検証する（dependency 境界のリスク投影: 13改名の依存者は約20 REQ・33 src・sidecar・テストハードコード）。
  - id: TS-007
    target_item: AG-009
    verification: |
      13改名 Design の H1・見出しに v4/v5/v5.1 表記が残存しないことを確認する。歴史的比較記述（旧モデルとの対比節）が削ぎ落とされていることを確認する。
    pass_criteria: |
      各 Design の H1 が新名称であり、本文見出しにバージョン接頭辞が残存しないこと。
    on_failure: |
      fix-and-reverify。残存表記を除去して再検証する。
  - id: TS-008
    target_item: AG-009
    verification: |
      crosswalk 系4件（v3-v4-crosswalk.md、references/v4-v5-crosswalk.md、references/crosswalk-inventory.md、v4-migration-and-release.md）、scripts/consumer/v4-migration/、scripts/consumer/v5-migration/ が削除済みであることを確認する。削除ファイルへの参照が現行領域（docs/reports 履歴を除く）に残存しないことを確認する。
    pass_criteria: |
      削除対象ファイルが存在せず、現行領域からの参照マッチがゼロであること。
    on_failure: |
      fix-and-reverify。削除漏れ・参照残存を解消して再検証する。
  - id: TS-009
    target_item: AG-010
    verification: |
      IR 8ルール（IR-009/014/021/046/054/057/065/066）の rule ファイルが docs/designs/integrity/rules/ から削除済みであること、integrity-rule-catalog.md・repo-agentdev-integrity SKILL.md・check_integrity.ts・関連テストから当該定義・実装・アサーションが除去済みであることを確認する。あわせて docs/designs 配下（rules/ の削除対象ファイル自身と docs/reports・retired を除く現行文書）において削除 IR 識別子（IR-009/014/021/046/054/057/065/066）の現行参照マッチがゼロであることを検索で確認する（rule-ownership.md・req-impact-map.md・カタログ本文・存続 IR rule 文書等の波及参照更新の完了確認。adversarial-review 争点H）。IR-055・IR-059 の rule ファイルと検出器が存続していることを確認する。
    pass_criteria: |
      削除対象 8 IR の rule ファイル・カタログエントリ・checker 実装・テストアサーションがすべて消えていること。docs/designs 現行文書から削除 IR 識別子への参照マッチがゼロであること。IR-055/059 の baseline 運用記述が撤廃後の実態へ更新済みで検出器としての定義が残っていること。
    on_failure: |
      fix-and-reverify。残存定義・残存参照を除去・更新して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      baselines/ 5ファイル（exemptions.json、ir-055-baseline.json、ir-059-baseline.json、lint-skills-baseline.json、ng-baseline.json）が削除済みであること、baseline 読込・免除判定が loader から削除または空配列フォールバックへ簡素化済みであること、撤廃で表面化した違反が免除なく対象ファイル側で直接修正済みであることを確認する。OU-004 冒頭の baseline 空相当 dry 実行による顕在化違反インベントリ（ファイル・検査・処理区分）が作成済みで、インベントリの全項目が解消済みであることを確認する。検出された現行 REQ 行違反（REQ-108/114 等）の修正が実施済みで対象・件数・理由が記録済みであることを確認する。check_integrity.ts を実行して終了コードを確認する。
    pass_criteria: |
      baselines/ 配下にファイルが存在しないこと。インベントリ作成済みかつ全項目解消済みであること（未解決項目ゼロ）。check_integrity.ts が Exit 0 で終了すること（エラー0件）。
    on_failure: |
      fix-and-reverify。インベントリ未解決項目を直接修正または過剰ルール緩和で解消して再検証する（client/server 境界のリスク投影: baseline 撤廃で checker 消費者〔QG-4、install 検証、SKILL 手順〕に違反が顕在化するため、免除ではなく直接修正で解消する）。
  - id: TS-011
    target_item: AG-010
    verification: |
      回帰テスト10本が削除済みであることを確認する。DEC-062（要件ID桁数の受理上限撤廃）が regression_req_id_width 系テスト削除により守備を失う点について、現行契約（DEC-062・関連 REQ 行）が要求するカバレッジが他のテスト・検査で残存するかを確認する。
    pass_criteria: |
      10本のテストファイルが存在しないこと。現行契約が要求する残存カバレッジに欠落がないこと、または欠落する場合に findings（Issue/PR 記録）へ記録済みであること。
    on_failure: |
      fix-and-reverify。契約が要求するカバレッジが欠落する場合は findings に記録する（build/runtime 境界のリスク投影: 削除テストの守備確認）。
  - id: TS-012
    target_item: AG-011
    verification: |
      .agentdev/jev-observations/ に .gitkeep のみ存在すること（*.json 516件削除済み）、.agentdev/backlog-auto/end-to-end/ 配下が空であること（6ディレクトリ削除済み）、.agentdev/inspect/inbox/ に inspect-docs-finding-*.md が存在しないこと（18件削除済み）、blocked 2件と放置ドラフト2件が削除済みであることを確認する。
    pass_criteria: |
      各領域の対象ファイルが削除済みで、機構ディレクトリ（jev-observations、blocked、drafts）自体は .gitkeep 付きで存続していること。
    on_failure: |
      fix-and-reverify。削除漏れを解消して再検証する。
  - id: TS-013
    target_item: AG-011
    verification: |
      パージ実行前に、backlog-auto・inspect・learning の各 workflow が実行中でないことを確認する（実行証跡のアクティブな run 状態・ロック状態の不在確認）。
    pass_criteria: |
      実行中ワークフローが存在しないことを確認した後にパージが実行されていること（execution 境界のリスク投影）。
    on_failure: |
      fix-and-reverify。実行中ワークフローがある場合は完了または停止を待ってからパージし直す。
  - id: TS-014
    target_item: AG-013
    verification: |
      traceability/*.yaml の参照が改名・削除後の実体と一致していることを確認する。generate_indexes.ts を実行してインデックスを再生成し、check_autogen_freshness.ts を実行する。
    pass_criteria: |
      traceability sidecar の参照に旧 Design 名・削除ファイル参照が残存しないこと。check_autogen_freshness.ts が Exit 0 で終了すること（environment propagation 境界のリスク投影: 31 sidecar・extensions yaml・README インデックス再生成）。
    on_failure: |
      fix-and-reverify。参照を最新化・インデックスを再生成して再検証する。
  - id: TS-015
    target_item: AG-013
    verification: |
      bun test 全件を3分割正規形（実行 cwd はリポジトリルート、./ 付きパス指定、REQ-060 の実行形態規則に従う）で実行する。あわせて check_integrity.ts を実行する。
    pass_criteria: |
      bun test 全件と check_integrity.ts が PASS（Exit 0）であること（build/runtime 境界のリスク投影: bun test 3分割正規形）。
    on_failure: |
      fix-and-reverify。失敗するテスト・検査を原因特定のうえ修正して再実行する。検査失敗を成功として報告しない。
  - id: TS-016
    target_item: AG-013
    verification: |
      Git 履歴で旧パス・旧ファイルの復元可能性を確認する（git log --follow で改名追跡、git show で削除ファイルの旧内容読み出し）。完了報告に削除・リネーム件数、簡素化したルール、PASS 結果を記録する。
    pass_criteria: |
      13改名が rename として追跡可能であること、削除ファイルの旧内容が Git 履歴から読み出し可能であること。完了報告が対応 Issue/PR に記録済みであること（原則1のロールバック実効性確認）。
    on_failure: |
      fix-and-reverify。rename として追跡できない場合は git mv の実行方法を是正する。報告記録の不足は補記する。

realization_actions:
  - id: RA-001
    concern: AGENTS.md への3原則追記（Phase 1）
    responsibility: リポジトリガイドレール（AGENTS.md）の行動規範領域に3原則を最上位ルールとして追記する。
    ownership_hints: [AGENTS.md（ルート、REQ-102 の ADF-COVERS(implementation) 保持）]
    intent: 3原則をリポジトリ編集エージェントへの最上位指示として恒久化する。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: .agentdev 実行証跡のパージ（Phase 2.1）
    responsibility: jev-observations の *.json 516件削除と .gitkeep 残置、backlog-auto/end-to-end 6ディレクトリ削除、inspect/inbox の finding 18件削除を実行する。
    ownership_hints: [.agentdev/jev-observations/、.agentdev/backlog-auto/end-to-end/、.agentdev/inspect/inbox/]
    intent: Git 履歴で担保可能な実行証跡を実行面から除去し、検証ノイズをなくす。
    verification_refs: [TS-012, TS-013]
    source_items: [AG-011]
  - id: RA-003
    concern: blocked 記録・放置ドラフト削除と issue-3494 仕様反映（Phase 2.2）
    responsibility: blocked 2件と放置ドラフト2件を削除する。サブエージェントが環境制約により書込めない場合の親オーケストレータ直接書込みフォールバック許容（発動条件は環境制約に限定、発動時の委譲記録義務）を、delegation-contracts Design・case-auto 設計書・関連スキル定義の3系統へ明記する。
    ownership_hints: [.agentdev/blocked/、.agentdev/drafts/、docs/designs/workflows/delegation-contracts（改名後）、case-auto 設計書・スキル定義]
    intent: 停滞記録を解消し、gh exit 66 系の環境制約障害（issue-3494 実績）に対応するフォールバックを仕様化する。
    verification_refs: [TS-005, TS-012]
    source_items: [AG-011, AG-012, AG-007]
  - id: RA-004
    concern: 測定待ち記録の完全削除と learning 空初期化（Phase 2.3）
    responsibility: docs/designs/local/adf-simplification-deferred-records.md を削除する。learning の deferred.md・evaluation-report.md・inbox.md から測定不能系項目を削除し空の初期状態へリセットする（利用者指示の明示決済として実行、workflow の自動削除機構は使用しない）。
    ownership_hints: [docs/designs/local/adf-simplification-deferred-records.md、.agentdev/learning/deferred.md、.agentdev/learning/evaluation-report.md、.agentdev/learning/inbox.md]
    intent: 測定待ち停滞を完全削除処分で決済する（16項目すべて完全削除）。
    verification_refs: [TS-002]
    source_items: [AG-004]
  - id: RA-005
    concern: crosswalk・migration 系レガシー資産の削除（Phase 3.1）
    responsibility: v3-v4-crosswalk.md、references/v4-v5-crosswalk.md、references/crosswalk-inventory.md、v4-migration-and-release.md、scripts/consumer/v4-migration/、scripts/consumer/v5-migration/ を削除し、docs/reports の過去マイグレーションレポートを必要に応じ整理する。削除文件への現行領域からの参照を除去する。
    ownership_hints: [docs/designs/foundations/v3-v4-crosswalk.md、docs/designs/references/、docs/designs/foundations/v4-migration-and-release.md、scripts/consumer/]
    intent: 移行補助層の恒久資産を廃止し、Git 履歴のみで履歴性を担保する。
    verification_refs: [TS-008]
    source_items: [AG-009]
  - id: RA-006
    concern: 13 Design の git mv 改名と全リポジトリ参照一括置換（Phase 3.2/3.3）
    responsibility: 13 Design を git mv で改名し、docs/、src/、.opencode/、.agentdev/extensions/skills/、traceability/、AGENTS.md の参照を一括置換する（docs/reports 履歴は除外）。改名 Design の H1・見出しから v4/v5/v5.1 を除去し、歴史的比較記述を削ぎ落とす。src/common/skills/agentdev-workflow-case-auto/SKILL.md の v4-v5-crosswalk 参照（L104/105/122/141 の移行期権威行としての正規定義）は、権威行の正規定義を case-auto Design（docs/designs/commands/case-auto.md）へ取り込み、crosswalk 棚卸し対象行の処遇記録は改名後 phase-transition-and-coexistence-model の双経路併存記述へ接続する形で参照先を再設定する（adversarial-review 争点E）。
    ownership_hints: [docs/designs/foundations/、docs/designs/workflows/、docs/designs/quality/、src/common/skills/、.opencode/skills/、.agentdev/extensions/skills/、traceability/]
    intent: バージョン接頭辞のない現行モデル名称へ統一し、旧名参照を残存させない。
    verification_refs: [TS-006, TS-007]
    source_items: [AG-008, AG-009]
  - id: RA-007
    concern: integrity data・スクリプト削除と参照呼出除去（Phase 4.1）
    responsibility: repo-agentdev-integrity の data/obsolete-path-map.yaml、data/obsolete-vocabulary-map.yaml、data/retired-artifact-registry.yaml、scripts/ir057_history_exemption.ts、scripts/check_retired_artifact_residual.ts を削除し、loader（check_changed_docs.ts、check_integrity.ts）とテスト（walk_enumeration_contract.test.ts、tests/delegation_retired_residual.test.ts 等）から参照呼出を除去する。
    ownership_hints: [.opencode/skills/repo-agentdev-integrity/data/、.opencode/skills/repo-agentdev-integrity/scripts/]
    intent: 廃止語彙・旧パス・retired 残存の検出機構を撤廃する。
    verification_refs: [TS-009]
    source_items: [AG-010]
  - id: RA-008
    concern: IR 8ルール削除と定義・実装・アサーション除去、IR-055/059 の baseline 運用撤廃（Phase 4.2）
    responsibility: docs/designs/integrity/rules/ から IR-009/014/021/046/054/057/065/066 の rule ファイルを削除し、integrity-rule-catalog.md・repo-agentdev-integrity SKILL.md・check_integrity.ts・関連テストから定義・実装・アサーションを除去する。IR-055・IR-059 の baseline 運用記述（catalog 本文の集計仕様・AG-005 節、integrity-contracts.md の baseline 運用手順・ratchet 節、distribution-boundary.md・project-extensions.md の baseline 記述、vocabulary-registry 両配置の対照表）を撤廃後の実態へ更新し、検出器は存続させる。削除 IR の波及参照（rule-ownership.md、req-impact-map.md、design-health-metrics.md、docs/designs/README.md、document-model.md、doc-diagnostics、skill-authoring、targeted-docs-guard、存続 IR rule 文書 IR-060/062/071 等）を更新する（AG-010 4.5、adversarial-review 争点H）。
    ownership_hints: [docs/designs/integrity/rules/、docs/designs/integrity/integrity-rule-catalog.md、docs/designs/integrity/integrity-contracts.md、docs/designs/integrity/distribution-boundary.md、docs/designs/integrity/rule-ownership.md、docs/designs/responsibilities/req-impact-map.md、.opencode/skills/repo-agentdev-integrity/]
    intent: 簡素化対象 IR を検査体系から完全に除去し、存続検査の baseline 運用を撤廃する（IR-055/059 の検出器は DEC-014/DEC-006 の範囲・経路を維持して存続）。
    verification_refs: [TS-009]
    source_items: [AG-010]
  - id: RA-009
    concern: baseline 撤廃と checker 簡素化・エラー0件化、回帰テスト削除（Phase 4.3/4.4）
    responsibility: baselines/ 5ファイルを削除し、check_integrity.ts・lint_skills.ts・lib/distribution-boundary-baseline.ts・lib/distribution-boundary-exemptions.ts 等から baseline 読込・免除判定を削除（または空配列フォールバックへ簡素化）する。OU-004 冒頭で baseline 空相当の dry 実行により顕在化違反の実測インベントリ（ファイル・検査・処理区分）を作成し、撤廃で表面化する違反は免除せず対象ファイル側を直接修正（または過剰ルール緩和）してエラー0件化する。検出された現行 REQ 行違反（REQ-108/114 等 IR-044 違反）の行修正を実施し記録する。third-party Skill 4件の免除は checker-execution-contracts への代替扱い記載で移行する。回帰テスト10本（repo-agentdev-integrity/scripts/ の regression_* 9本と scripts/tests/delegation_retired_residual.test.ts）を削除し、削除テストの守備確認を行う。呼出側フック（prepare_definition_pr.ts、gate-execution.ts〔case-open/case-ready/case-close/agentdev-artifact-validation の4系統すべて〕、close_mechanical_steps.ts、case-ready gate fixture、委譲指示ドキュメント群、README-INSTALL.md）の gate 期待値を簡素化後の実態に更新する。
    ownership_hints: [.opencode/skills/repo-agentdev-integrity/baselines/、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts、.opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts、.opencode/skills/repo-agentdev-integrity/scripts/lib/、src/common/skills 各 scripts/lib/gate-execution.ts、回帰テスト10本]
    intent: baseline・免除の恒久管理を撤廃し、checker を即時解消型へ簡素化する。
    verification_refs: [TS-010, TS-011]
    source_items: [AG-010]
  - id: RA-010
    concern: traceability 最新化・インデックス再生成・全検証・完了報告（Phase 5）
    responsibility: traceability/*.yaml の参照を最新化し、generate_indexes.ts でインデックスを再生成し、check_autogen_freshness.ts・check_integrity.ts・bun test 全件（3分割正規形）を PASS させる。削除・リネーム件数、簡素化したルール、PASS 結果を完了報告として対応 Issue/PR に記録する。DEC-062 桁数ガードの残存カバレッジ確認を行う。
    ownership_hints: [traceability/、.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts、.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts]
    intent: 全変更の収束検証と証跡記録を完了させる。
    verification_refs: [TS-014, TS-015, TS-016]
    source_items: [AG-013]

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: Phase 構成の5 OU。OU-001（正規成果物の確定と3原則の正規化、Phase 1 相当と全 artifact_actions 適用）、OU-002（Phase 2 .agentdev クリーンアップ）、OU-003（Phase 3 レガシー Design 削除・改名・参照一括置換）、OU-004（Phase 4 integrity 簡素化）、OU-005（Phase 5 収束検証）。OU-002/003/004 は並行実行可能（OU-003 の参照一括置換と OU-004 の checker 修正は scripts/・.opencode/ 領域で接触するためファイル単位の競合回避）、OU-005 は全 OU 完了後に実行。
  wave_hints: [Wave1 = OU-001（Definition 確定・設計PR）、Wave2 = OU-002 + OU-003 + OU-004（並行、同一ファイル競合の回避）、Wave3 = OU-005（収束検証）]
```

# summary

- 実験前提の3原則（実験・ロールバック許容、後方互換性完全破棄、測定不能停滞排除・二択即決）を新 Decision と design-principles.md・AGENTS.md へ正規化する。DEC-056 は supersede せず relates-to 接続（移行中は意味保存・検証優先、移行完了後は本原則適用の時間軸区別）。
- REQ 操作は計34 action: REQ-121 廃止、REQ-109 4行修正、実質変更13 REQ（baseline 系・検出系・回帰テスト系・IR 系・baseline 前提行 007/074/082 の現状化）、REQ-003 2 action（フォールバック許容行追加と機械的参照置換）、機械的参照群12 REQ（REQ-007/010/055 の目的節パス参照置換を含む）。
- Design 操作は計16 action: design-principles.md 3原則節新設、13改名 Design の見出し修正、integrity 2 Design（カタログ・宣言的データ）更新。
- 実現面は RA 10件（AGENTS.md 追記、.agentdev パージ、issue-3494 仕様反映、learning 空初期化、crosswalk 系削除、13改名と参照一括置換〔case-auto 権威行の case-auto Design へ移管を含む〕、integrity data/IR 8ルール/baseline/テスト削除、削除 IR・baseline の波及参照更新、Phase 5 収束検証）。
- IR-055/IR-059 は baseline のみ撤廃し検出器として存続（IR-073 と同一の扱い、DEC-014/DEC-006 の範囲・経路は維持）。削除 IR は計画明示の8ルール（IR-009/014/021/046/054/057/065/066）のみ。
- 原則3は狭義解釈（deferred/blocked 機構存続、測定待ち理由の保留のみ禁止）で REQ-003-024・REQ-038・DEC-027 と整合する。検証は TS-001〜016（3原則反映、廃止・修正確認、旧参照ゼロ、削除 IR 波及参照ゼロ、dry インベントリ作成と全項目解消、checker Exit 0、bun test 全件 PASS、Git 履歴復元性）。
- STEP-8 adversarial-review（2026-11-17 実施、read-only 審議）の accepted-finding 6件（争点A: IR-055/059 ルール存続化、争点C: dry 実行インベントリと正規 REQ 行修正の経路化、争点E: case-auto 権威移管先指定、争点H: 削除 IR・baseline の波及参照網更新、争点I: REQ-010-007/074/082 の扱い明示、争点J: REQ-007/010/055 目的節参照置換）と精緻化2件（争点D: 廃止注記の付記先、争点G: gate-execution.ts 4系統表記）を本 draft へ反映済み。ユーザー判断待ち事項はゼロ。
