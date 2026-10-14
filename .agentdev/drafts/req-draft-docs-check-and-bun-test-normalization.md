---
draft_type: req_draft
topic_slug: docs-check-and-bun-test-normalization
status: draft
created_at: 2026-10-14T19:30:00+09:00
source_rus: [RU-0224, RU-0225]
---

<!-- req_draft（soft contract、DEC-003）。後続工程の主入力は下記 # draft-data YAML ブロックである。 -->

# draft-data

```yaml
# ============================================================================
# 判定記録（STEP-3〜7 の証跡。soft-contract の追加情報）
# ----------------------------------------------------------------------------
# [STEP-3 既存REQ照合] 照合事実: docs/requirements/ は 71 REQ 実ファイル
#   （REQ-001〜REQ-113、予約欠番あり）。RU-0224 の検査責務は REQ-010 が現行所有
#   （checker 詳細は Design/skill/script へ委譲、REQ-010-009）。RU-0225 の実行形態は
#   REQ-060 が現行所有し、フル suite 正規形は QG-4（agentdev-quality-gates references）
#   が正規所有（REQ-060-003）。両 RU とも「既存要件を維持した不具合修正」「現行の
#   REQ-060 / QG-4 正規実行形態を維持」を本文で規定。
#   帰属判定: RU-0224 = REQ操作なし、RU-0225 = REQ操作なし（追加確認不要）。
#   Jev 先行評価: 観測 .agentdev/jev-observations/20261014T102341Z-9f1d.json
#   （既存REQ照合判断。q1=REQ操作なし 0.96 / q2=false / q3=REQ操作なし 0.99 /
#   q4=false。最終判断は評価器結果と一致、差異理由なし）。
#   対照リビジョン: main 9115bbedd8bfa560608dc74ddfc74403ccf14bb1
#   （RU-0224/0225 の sha256 は同観測の references に記録）。
#   SPLIT 予兆計測: APPEND/UPDATE 対象の既存 REQ なし、生成要件行 0 件のため対象外。
# [STEP-4 分類ゲート] 全候補は「反映作業」（既存契約の遵守回復）に分類。
#   変更後仕様（REQ行・Design行）候補 0 件 → artifact_actions 空、Design 分離対象なし。
#   tentative_classification: REQ（7値内）は最終分類「反映作業（REQ保存を伴わない）」
#   として上書き（上書き値は文書7分類モデルに照らし、判定単位は記述単位、寿命区分は
#   期間限定の修復作業）。
#   Jev 適用（要件展開の最終分類・Design分離単位）: 当該単位の評価対象集合は
#   「分類ゲート群通過後の REQ行・Design行候補」であり本件では 0 件（空集合）のため
#   評価を生成しない（対象なしの観測は作らない。空集合判定自体は上記照合判断
#   （REQ操作なし）と RU 本文の「既存要件維持」規定で裏付け済み）。
# [STEP-4 Decision要否確認ゲート] 発動条件なし。Decision候補なし（仕様変更のみで
#   技術的決定を含まない、両 RU は既存契約維持を明記）、既存 REQ/Decision/Design との
#   衝突候補なし（遵守回復であり対立しない）、責務境界変更なし。architecture-advisory
#   委譲の前提条件を満たさないため委譲しない。
# [STEP-5 Decision判断] Decision対象なし（Decision禁止ゲート: 仕様変更のみ・運用ルール
#   該当。重複確認: 対応する既存 Decision なし。番号指定形式 new:{slug} の対象なし）。
#   修復過程で既存契約の変更が必要と判明した場合は AG-012 のとおり判断事項として
#   報告し、本件で Decision を作らない。
# [STEP-4 変更誘発境界リスク分析（5観点の確認記録）]
#   1. dependency boundary: gitignore 依存（textlint-guard vendor、node_modules）と
#      src/common ↔ .opencode 投影の一貫性。説明文修正の片側のみ適用を TS-009
#      （lint_skills 全対象）・TS-010（source/link 両側）で検証。依存解決を TS-002 で前提確認。
#   2. client/server boundary: 該当なし（外部クライアント・サーバ境界を変更しない。
#      pr_merge テストはローカル runner のテスト資産）。確認済み。
#   3. execution boundary: 実行形態逸脱による疑似 fail（cwd・ランナー・パス形式・
#      timeout・worktree junction 未伝播）。TS-001/TS-005 の正規形実行・環境ラベル・
#      由来分類で検証。
#   4. build/runtime boundary: textlint-guard エンジン生成（bun install &&
#      bun run build:engine）と AUTOGEN 正規再生成（generate_indexes.ts）。手書き日付
#      書換ではなく生成結果との一致を TS-002/TS-008 で検証。
#   5. environment propagation boundary: 依存・投影の worktree 未伝播、baseline 系
#      durable state の並行追随差（IR-055 ratchet、文書鮮度の日ズレ進行）。最終判定は
#      統合後 main での再実行（TS-005/TS-011）、baseline 系由来の疑似 fail は QG-4
#      「fail 由来分類」（3点対照を含む）により TS-003 の原因分類で処理。
#   → 導出 case-specific risk は上記のとおり test strategy（TS-001/002/003/005/008/009/010/011）
#      へ投影済み（投影完全性の検査は QG-1）。
# [STEP-4 検索系検証の網羅範囲・修正対象列挙一致確認（REQ-008-062）] 本 draft の
#   test strategy は rg 等の直接検索ではなく既存正規 checker の実行で構成しており、
#   網羅範囲は各 checker が規定する全対象（RU 共通条件「変更ファイルだけでなく全対象」
#   と一致）。See Only 等参照行の除外問題に該当する検索系検証は存在しない。確認済み。
# [STEP-2 前工程引き継ぎ判定] 両 RU は agentdev_handoff: true を持つ session由来RU。
#   本リポジトリは agent-dev-flow 本体（self-hosting）であるため
#   agentdev-workflow-lifecycle references/upstream-handoff.md の規定により停止せず
#   通常の req workflow 入力として扱う（flag は履歴メタデータとして保持、CR-002）。
# [STEP-7 scale 昇格理由] OU-002（RU-0224）は実装スコープシグナル該当: 最終計測値で
#   影響ファイル数が 10 超（文書鮮度 約11ファイル、AUTOGEN 1、説明文 3、配布境界
#   4ファイル系。現行 main での再計測前に固定しない）。よって draft scale を large に
#   昇格し、分解計画案を case_open_hints に記録した（最終構成は case-open 判断）。
#   OU-001（RU-0225）は検出件数（79/78）と個別変更件数を区別し、原因系統は少数への
#   収束が RU 本文で説明済みのため standard とする。昇格理由は要件doc確認（STEP-10）
#   および完了報告でユーザーへ提示する。
# ============================================================================

work_type: bugfix

scale: large

summary: |-
  承認済み2 RU（RU-0224: docs-check 残存 strict findings の解消と全体正常化、
  RU-0225: 既存テスト失敗の解消と全テストの正常化）を、独立スコープを保持した
  2 操作単位（OU-002 が RU-0224、OU-001 が RU-0225）として構造化した。
  両 RU とも既存契約（REQ-010、REQ-060、QG-4 正規形、IR-072、IR-055、配布依存境界、
  スキル説明文規約等）への遵守回復であり、REQ/Decision/Design の保存操作を伴わない
  （artifact_actions 空、direct_case 構成）。RU-0224 の最終検証（docs-check 全体
  正常終了）は docs-check に含まれる整合性テスト群の成功を前提とするため、
  OU-002 は OU-001 に必須依存する（文書修正の着手は待たない）。過去の検出件数
  （strict findings 11/1/3/8+8、テスト失敗 79/78 件）は固定値とせず、現行 main
  （9115bbedd8bfa560608dc74ddfc74403ccf14bb1）での再計測を修復の前提とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      全テスト対象の網羅と現行失敗の確定（RU-0225 T-01）。現行 main に対し、正規の
      ランナー構成確認（package.json の scripts 定義等から正規ランナーを判定）を前置し、
      正規の分割実行（3 cwd 分割。cwd はリポジトリルート、対象は ./ prefix 付きで明示
      指定、stdout/stderr を分離退避、実行 timeout を 300〜600 秒で明示指定）と、全対象
      網羅に必要な補完実行を行う。分割実行と補完実行の和集合がリポジトリ内の全テスト
      ファイルを網羅することを件数突合（Ran N tests across M files）で確認し、各分割の
      実行対象と件数を照合して、未実行・重複集計による誤った全件判定を生まないこと。
      過去に報告された 79 件・78 件という数値は修復対象の固定根拠にしない。
  - id: AG-002
    content: |-
      正規実行環境の成立（RU-0225 T-02）。正規テストが参照する package 境界ごとに依存が
      解決可能な状態で実行する。textlint-guard については既存契約に従い、plugin 配下
      （src/opencode/plugins/agentdev-textlint-guard/）で bun install && bun run
      build:engine を実行し、git 管理対象外の依存成果物（vendor/）を生成する。依存不足
      や投影不備により検査できないテストを、実行済みまたは成功として扱わない。
  - id: AG-003
    content: |-
      現在の失敗原因の解消（RU-0225 T-03）。環境を整えた状態で実際の失敗を再計測し、
      観測された証拠に基づいて原因を確認して修復する。原因分類は「依存不足・投影不備
      （正規の環境条件を成立させる）」「テスト入力や準備処理の誤り（本来の検証義務を
      維持したままテスト資産を修正）」「実装の正規契約違反（実装を修正）」「再現性が
      不安定な失敗（実行環境由来か実際の欠陥かを確認。baseline 系 durable state の
      追随差に起因する疑似 fail は QG-4 fail 由来分類の 3 点対照手順で確定）」の
      区分で行い、推測で既存債務や環境問題に分類しない。既知系統（textlint-guard、
      IR-055、ローカルIssue の pr_merge、その他の現行失敗）を確認対象に含める。
      環境整備だけで正常化したテストには不要な実装修正を行わない。
  - id: AG-004
    content: |-
      既存の検証能力の維持（RU-0225 T-04）。テスト資産または実装を修正する場合、
      対応する既存契約の正常系・異常系・境界条件の検証を維持する。pr_merge では有効な
      コミットの確認と不正な入力の拒否という安全条件（commitHash 検証を含む）を弱めず、
      IR-055 では配布先で解決できない参照の検出能力を維持する。テストの無効化・削除・
      安易なスキップ、正規テスト契約の適用範囲縮小、テスト件数の減少によって見かけ上の
      失敗 0 件を作らない。
  - id: AG-005
    content: |-
      全テストの正常終了と統合後の成立（RU-0225 T-05/T-06）。正規の分割実行と必要な
      補完実行をすべて実施し、全テスト対象について失敗 0 件で正常終了する。実行記録から
      対象、件数、終了状態、実行環境（環境ラベル: 実行環境・junction 伝播状態・依存
      パッケージ状態）を確認できること。正規契約による既存の非該当条件を除き、失敗を
      消すための対象除外・スキップは認めない。修正の統合後、最新 main で T-01〜T-05 を
      再確認し、統合後の正規環境・全対象で失敗 0 件であり、テスト対象の欠落や検証能力の
      低下がないことを最終判定とする。
  - id: AG-006
    content: |-
      現行検出内容の確定（RU-0224 D-01）。最新 main に対し、正規の docs-check を構成する
      全検査工程（.opencode/commands/repo/docs-check.md STEP-1 が定める検査スクリプト群
      および full integrity suite）を実行する。検査ごとの実行可否、終了状態、検出内容、
      検出件数を確認して修復対象を確定する。起票時に記録された件数（文書鮮度 11、
      AUTOGEN 1、説明文 3、配布境界 source/link 各 8 等）は過去の計測値であり、追加・
      解消済みの検出を確認せずに修復対象を決める根拠にしない。
  - id: AG-007
    content: |-
      文書鮮度の正常化（RU-0224 D-02）。現行の対象 REQ・Design について、正規の鮮度検査
      に適合する状態を実現する。req-updated-freshness は IR-072 が規定する最終内容変更
      コミットの作成者日付との突合に従い、req-range-staleness は別の検出としてその実際の
      不一致を修復する。両検査の厳格な違反が、それぞれ全対象で 0 件となること。
      updated の日付だけを一律に変更して req-range-staleness の違反を残さないこと。
  - id: AG-008
    content: |-
      AUTOGEN 鮮度の成立（RU-0224 D-03）。正規の生成元と生成成果物の整合性を確認する。
      check_autogen_freshness の厳格な違反が 0 件となること。再生成が必要な場合は正規の
      生成手順（generate_indexes.ts）を用い、生成成果物の計測日だけを書き換えて正規生成
      結果との一致を確認しないこと。既に正常な成果物には不要な変更を行わないこと。
  - id: AG-009
    content: |-
      スキル説明文の正常化（RU-0224 D-04）。AG-005（lint_skills）で検出された説明文超過
      を修復する。lint_skills の全対象で厳格な違反が 0 件となること。説明文を現行の
      600 文字以内に収めても、機能概要、利用条件、対象外、スキル選択に必要な責務境界が
      維持されていること。文字数だけを減らして誤ったスキルが選択されるような曖昧な
      説明文にしないこと。修正は正本（src/common/skills/）と投影先（.opencode/skills/）
      の両側で整合すること。追跡Issue #3683 記録上の処遇（#3684 由来の説明文不変更
      処分）は 2026-10-14 の合意（RU-0224）により修復方針へ再評価された（CR-003）。
  - id: AG-010
    content: |-
      配布依存境界の成立（RU-0224 D-05）。配布元と配布先の両方について、正規の配布依存
      境界検査（check_distribution_boundary）を実行する。source/link 両方の検査対象が
      成立し、厳格な違反が 0 件であること。link 側の検査対象が存在しない状態を 0 件検出
      として合格扱いしないこと。追跡Issue #3703 記録の表現是正 6 行・4 ファイルは
      同 Case の処遇区分契約（CR-003 処遇確定）どおり是正し、是正後に concrete-id
      baseline 再取得手順で残置を解消する。
  - id: AG-011
    content: |-
      docs-check 全体の正常終了（RU-0224 D-06）。修正の統合後、最新 main の実際の文書
      検査利用経路で docs-check 全体を実行する。必須のすべての検査工程が実施され、
      厳格な違反が 0 件であり、検査全体が正常終了すること。docs-check に含まれる
      整合性テスト群（full integrity suite）も正常終了すること。警告・情報は既存契約に
      従って扱い、厳格な違反と混同しないこと。D-06 は docs-check 構成に含まれる全
      テストの正常化（OU-001、AG-005）を前提とするため、OU-002 の完了は OU-001 の完了
      後に判定する。ただし文書修正（D-01〜D-05）の着手は OU-001 の完了を待たない。
  - id: AG-012
    content: |-
      検証共通条件（両 RU）。検査対象は変更ファイルだけでなく、各正規検査が規定する
      全対象とする。検査不能、未実行、異常終了を合格に読み替えない。既存の検査基準や
      適用範囲を弱めない。全体検査は統合後の main で再実行し、その結果を最終判定に
      使用する。実装・環境の修復では解消できず、既存契約の変更が必要と判明した場合は、
      既存要件の達成と区別して判断事項として報告し、達成済みと扱わない。

# artifact_actions: 本 draft は既存契約の遵守回復（反映作業）であり、REQ / Decision /
# Design の保存操作を伴わないため空とする（REQ操作なし。STEP-3 照合判断記録参照）。
# 後続工程の分岐は本空配列の存在（direct_case 構成）で決定する。
artifact_actions: []

realization_actions:
  - id: RA-001
    concern: bun test 全テスト正常化のための実行環境・テスト資産・関連実装の修復
    responsibility: |-
      正規テスト実行契約（REQ-060、checker 実行契約 Design「bun test 実行形態契約」）が
      要求する環境条件（依存解決、textlint-guard の git 管理対象外依存成果物の生成、
      投影）を成立させ、現在失敗するテスト資産および原因が確認された関連実装を、本来の
      検証義務と安全条件を維持したまま修復する。QG-4 フル suite 正規形（正規ランナー
      構成確認、3 cwd 分割実行、環境ラベル、件数突合、fail 由来分類、機械受理基準）の
      所有権は侵食せず参照・補完に留まる。
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/（依存成果物の生成・検査条件は同 README、ルート README「開発者セットアップ」参照）"
      - "src/common/tools/agentdev-gh/local/runner-local.ts（ローカルPR操作。pr_merge テストの commitHash 入力の扱い）"
      - "IR-055 差分回帰テスト資産（検出規則は docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md）"
      - "docs/designs/integrity/checker-execution-contracts.md「bun test 実行形態契約（単独実行・ファイル単体指定を含む）」節、「実行形態規律（集約）」節、worktree 環境での checker 実行 fallback"
      - "src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（フル suite 正規形・機械受理基準。現行 main 9115bbe 時点の契約を参照）"
      - "docs/requirements/REQ-060.md（bun test 実行形態の現行要件）"
    intent: |-
      全テストの失敗 0 件と検証能力の維持を、原因別（依存不足・テスト資産の誤り・実装の
      契約違反・再現性不安定）に応じた正当な修復で実現する。依存不足のみの問題を製品
      不具合と誤認して不要なコード変更をせず、逆にテストを成功させるための検証弱化を
      行わない。原因の特定は現行 main での再計測と証拠に基づく。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
  - id: RA-002
    concern: docs-check 残存 strict findings の解消のための文書・生成成果物・配布定義の修復
    responsibility: |-
      docs-check を構成する正規検査（REQ-010 が検査責務を所有、checker 詳細は Design/
      skill/script 委譲）の厳格な違反を、検査規則を弱めず対象を除外せずに解消する。
      文書鮮度は IR-072 の突合規則に従い、AUTOGEN は正規生成手順で再生成し、スキル
      説明文は説明文規約（600 文字以内・責務境界維持）に従い、配布依存境界は処遇区分
      契約と baseline 再取得手順に従う。検査基盤の再設計、検査規則の一般改定、警告降格
      による合格化は行わない。
    ownership_hints:
      - "docs/requirements/**・docs/designs/** 各ファイル frontmatter（突合規則は docs/designs/integrity/rules/IR-072-req-updated-freshness.md）"
      - ".opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts（AUTOGEN ブロック正規再生成。不合格時の処置は autogen-freshness-gate Design）"
      - "AG-005 説明文超過対象の配布スキル定義（正本 src/common/skills/*/SKILL.md と投影先 .opencode/skills/ の両側。規約は docs/designs/skills/agentdev-skill-authoring.md）"
      - "docs/designs/integrity/distribution-boundary.md（処遇区分契約・concrete-id baseline 再取得手順）"
      - ".opencode/commands/repo/docs-check.md（全体文書検査の実行入口・STEP-1 検査構成）"
      - "docs/requirements/REQ-010.md（docs-check 検査責務の現行要件）"
    intent: |-
      docs-check 全体の正常終了（厳格な違反 0 件・正常 exit）を、現在の正規契約に従った
      個別修復の統合で実現する。検出系統ごとに実際の原因を解消し、日付書換や計測日捏造
      などの見かけ上の解消を行わない。修復対象は現行 main での再計測で確定する。
    verification_refs: [TS-006, TS-007, TS-008, TS-009, TS-010, TS-011]
    source_items: [AG-006, AG-007, AG-008, AG-009, AG-010, AG-011]

conflict_resolutions:
  - id: CR-001
    conflict: |-
      両 RU の Source Summary は「現行の RU 契約が要求する req-define-parent との不一致を
      既知の形式差異として残す」と記録しているが、generation_actor 契約の正規所有者
      （REQ-008-051、artifact-contracts Design「RU アーティファクト契約（session由来RU）」
      節。いずれも updated 2026-10-14）は generation_actor として req-define-parent /
      supervisor の両値を明示的に許容しており、supervisor 起票に契約上の不整合は存在
      しない。
    resolution: |-
      現行 main（9115bbedd8bfa560608dc74ddfc74403ccf14bb1）の正規契約に照合した結果、
      両 RU は session由来RU 契約（frontmatter 必須フィールド、本文必須 8 セクション、
      ISO 8601 時刻順序、session 論理URI）にすべて適合する。RU 側の「既知の形式差異」
      注記は現行契約に対して陳腐化した記述であり、契約不整合としては扱わない。契約改定
      も本件の対象外とする（不一致の捏出しをしない）。RU ファイルは参照専用のため
      注記の削除・修正は行わず、本記録をもって整合化結果とする。
  - id: CR-002
    conflict: |-
      両 RU の frontmatter は agentdev_handoff: true を持つ。req-define command Design の
      停止状態には「前工程からの引き継ぎ判定（agentdev_handoff: true）検出時（要件展開を
      開始せず停止する）」がある。
    resolution: |-
      引き継ぎ停止条件の正規所有者（agentdev-workflow-lifecycle references/upstream-
      handoff.md）は「agent-dev-flow repo 本体では停止せず、通常の req/case workflow 入力
      として扱う」と規定する。本リポジトリは agent-dev-flow 本体（self-hosting）である
      ため停止条件に該当せず、両 RU を通常の要件定義入力として処理した。flag は履歴
      メタデータとして保持し、本 draft 出力への再転記は行わない（backlog-review の転記
      規定は RU 生成時に適用済み）。
  - id: CR-003
    conflict: |-
      追跡Issue #3703 の記録では、lint_skills AG-005 の説明文超過 3 件について #3684 由来の
      「処分不変更」確定を踏襲するか再評価するかが選択肢として残されていた。
    resolution: |-
      2026-10-14 のチャット合意（RU-0224、agreement_confirmed_at 13:27）は合意内容に
      「スキル説明文の修復」を明示的に含み、決定的受け入れ条件 D-04 として lint_skills
      全対象の厳格な違反 0 件を要求している。よって #3684 時点の不変更処分は本件の
      対象 3 件について新合意により再評価され、修復（AG-009）が正である。RU の受け入れ
      条件を弱体化して不変更処分を踏襲することはしない。
  - id: CR-004
    conflict: |-
      ユーザーにより新たに承認された「QG-4 契約/ゲート整合リクエスト」は別件として
      扱うことが指示されており、本 2 RU への折り込みが競合候補となる（RU-0225 の受け入れ
      は QG-4 正規形を参照するため、QG-4 契約変更の期待を本件に先取りする誤りが生じ得る）。
    resolution: |-
      本 draft の RU-0225 関連項目（AG-005、TS-005、RA-001）はすべて現行 main
      （9115bbedd8bfa560608dc74ddfc74403ccf14bb1）時点の QG-4 正規形・REQ-060 を参照
      として固定し、別件の QG-4 契約/ゲート整合リクエスト由来の変更を本件に含めない。
      QG-4 契約の変更は別経路（当該承認済みリクエストの正規経路）でのみ扱う。両 RU の
      対象外宣言（新しい品質ゲート・例外制度・管理台帳の追加禁止）とも整合する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0225
    # REQ/Design 保存操作なし（direct_case 構成）。REQ-060・QG-4 正規形は維持・参照対象。
    target_req: null
    target_design: null
    operation: null
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0224
    # REQ/Design 保存操作なし（direct_case 構成）。REQ-010・各整合性 Design は維持・参照対象。
    # depends_on は D-06（docs-check 全体正常終了）が docs-check 構成テスト群の成功
    # （OU-001 の AG-005）を前提とする「検証不能な前提成果物への依存」（REQ-008-042）。
    # 文書修正（D-01〜D-05）の着手順序は制約しない（RU-0224 依存関係節のとおり）。
    target_req: null
    target_design: null
    operation: null
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      現行 main の作業ブランチで、QG-4「bun test フル suite 正規形」の前置ステップに従い
      正規ランナー構成確認（package.json の scripts 定義・workspace 構成）を行い、3 cwd
      分割実行（cwd はリポジトリルート、./ prefix 付き対象指定、stdout/stderr 分離退避、
      stderr リダイレクト常時付与、timeout 300〜600 秒明示）と、全対象網羅に必要な
      補完実行（workspace 未収録配置の個別実行、分割③ 対象欠落時の代替検証）を実行する。
      各実行の「Ran N tests across M files」件数を突合し、和集合の網羅性を確認する。
    pass_criteria: |-
      正規の分割実行と補完実行の和集合がリポジトリ内の全テストファイルを網羅している
      ことが件数突合で確認でき、各分割の実行対象・件数・終了状態・実行コードの記録が
      存在すること。未実行対象の実行済み扱い、重複集計、件数の急減がないこと。
      現行の失敗（検出内容・件数）が検査系統別に確定されていること。
    on_failure: |-
      fix-and-reverify。実行形態の逸脱は checker 実行契約の実行形態規律へ適合させて
      再実行し、未実行対象があれば補完実行を追加した上で再計測する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      正規テストが参照する package 境界ごとの依存解決（package 単位の bun install または
      main 側 node_modules への junction。整備手順は QG-4「依存パッケージ前置」）を前置
      し、textlint-guard は plugin 配下で bun install && bun run build:engine を実行して
      vendor 依存成果物を生成した後、依存解決失敗で fail していたテストを同一環境で
      再実行する。整備手段と依存パッケージ状態を環境ラベルへ記録する。
    pass_criteria: |-
      全テスト対象で依存解決・実行準備が成立し、依存不足を理由に検査不能なテストが
      残っていないこと。依存成果物がないため検査できなかったテストが実行済みまたは
      成功として扱われていないこと。textlint-guard の生成成果物が正規手順で生成されて
      いること。
    on_failure: |-
      fix-and-reverify。依存整備を実施して依存解決失敗テストを同一環境で再実行し、
      解消を確認する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      環境整備後の再計測で残存する失敗全件について、単独再実行・同一環境ラベル下での
      フル再実行・baseline 再現確認（ワークツリー変更ゼロの baseline commit での再現、
      baseline 系 durable state の追随差は 3 点対照手順）による由来特定を行い、原因分類
      （依存不足・テスト資産の誤り・実装の正規契約違反・再現性不安定）に従って修復する。
      既知系統（textlint-guard、IR-055 差分回帰、ローカルIssue pr_merge、その他）の
      取り扱いを記録する。
    pass_criteria: |-
      残存失敗の全件に原因が確認され、原因分類に対応する修復が行われていること。
      修正対象のテストが本来の検証内容を維持した状態で正常終了すること。環境整備のみで
      正常化したテストへの実装修復がないこと。推測のみによる既存債務・環境問題への
      分類がないこと。
    on_failure: |-
      fix-and-reverify。原因特定のための証跡（単独再実行・フル再実行・baseline 対照）を
      追加取得し、修復後に再計測する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      テスト資産・実装の修正差分について、対応する既存契約の正常系・異常系・境界条件の
      検証が維持されていることを確認する。pr_merge 修正では commitHash 検証（有効な
      コミットの確認・不正入力の拒否）が維持されていることを確認し、IR-055 修正では
      配布先で解決できない参照の検出能力が維持されていることを確認する。テスト件数の
      推移（件数突合）を確認する。
    pass_criteria: |-
      検証能力の低下を示す差分（テストの無効化・削除・スキップ追加、検証アサーションの
      削除、安全条件の緩和、件数の不当な減少）が存在しないこと。修正後も誤った入力や
      不整合が従来どおり検出できること。
    on_failure: |-
      fix-and-reverify。検証能力を回復する修正を行い、再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      正規ランナー構成確認 → 3 cwd 分割実行 + 補完実行を環境ラベル（実行環境・junction
      伝播状態・依存パッケージ状態）付きで実行し、fail 発生時は QG-4「fail 由来分類」の
      証跡手順（単独再実行 → フル再実行 → 同一環境件数比較 → baseline 再現確認）に従う。
      実行記録に正規形実行・環境ラベル・件数突合・由来分類・baseline 基準の全記録
      （機械受理基準 7 項目）を保持する。統合後は最新 main で同一手順を再実行する。
    pass_criteria: |-
      全テスト対象について失敗 0 件で正常終了し、機械受理基準の全記録が存在し、由来不明
      fail が 0 件であること。統合後 main での再実行でも失敗 0 件であり、テスト対象の
      欠落・検証能力の低下がないこと。
    on_failure: |-
      fix-and-reverify。残存失敗の由来特定と修復を行い、正規形で再実行する。
  - id: TS-006
    target_item: AG-006
    verification: |-
      最新 main の作業ブランチで、正規の docs-check 実行入口（.opencode/commands/repo/
      docs-check.md）の STEP-1 が定める全検査工程を実行する。現行の定義が定める検査
      スクリプト群（check_integrity、check_command_format、check_extensions、
      check_distribution_boundary、check_changed_docs、check_templates、lint_skills、
      check_autogen_freshness、check_content_corruption、check_knowledge_docs、
      check_design_frontmatter 等、bun run 形式）と full integrity suite（bun test）を
      対象とする。検査ごとの終了コード・検出内容・件数を記録する。
    pass_criteria: |-
      docs-check を構成する全検査工程の実行可否、終了状態、検出内容、検出件数が確定
      されていること。過去の計測値（11/1/3/8+8 等）のみを根拠にした修復対象決定が
      行われていないこと。strict failure を示す終了コード 1 が全体失敗として扱われて
      いること。
    on_failure: |-
      fix-and-reverify。検査構成の確認結果を docs-check 定義と突合し、未実行検査があれば
      実行して検出内容を確定する。
  - id: TS-007
    target_item: AG-007
    verification: |-
      文書鮮度検査（req-updated-freshness、req-range-staleness）の検出結果を系統別に
      取得し、req-updated-freshness は IR-072 の突合規則（最終内容変更コミットの作成者
      日付との一致）に従い、req-range-staleness はその実際の不一致原因を個別に修復する。
      修復後に全対象で両検査を再実行する。
    pass_criteria: |-
      req-updated-freshness と req-range-staleness の両検査について、厳格な違反がそれぞれ
      全対象で 0 件であること。updated の一律書換により別系統の違反が残存していないこと。
    on_failure: |-
      fix-and-reverify。残存違反の実際の不一致を再確認して修復し、再実行する。
  - id: TS-008
    target_item: AG-008
    verification: |-
      check_autogen_freshness の検出結果を確認し、鮮度不一致があれば正規の再生成手順
      （generate_indexes.ts）で AUTOGEN ブロックを再生成した後、check_autogen_freshness
      を再実行する。再生成差分が正規生成結果と一致することを確認する。
    pass_criteria: |-
      check_autogen_freshness の厳格な違反が 0 件であること。生成成果物の計測日だけの
      書換が行われていないこと。既に正常な成果物への変更（不要な差分）が存在しないこと。
    on_failure: |-
      fix-and-reverify。正規再生成を実行し、再検査する。
  - id: TS-009
    target_item: AG-009
    verification: |-
      AG-005 で検出された説明文超過 3 件（現行再計測で増減する場合はその全件）を、
      説明文規約（600 文字以内）に従って修正し、修正後の説明文について機能概要・利用
      条件・対象外・責務境界の維持を確認する。正本と投影先の両側に整合して反映した後、
      lint_skills を全対象で再実行する。
    pass_criteria: |-
      lint_skills の全対象で厳格な違反が 0 件であること。修正後の説明文がスキル選択に
      必要な責務境界を維持していること（該当スキルの USE FOR / DO NOT USE FOR が
      説明文から判別可能であること）。正本・投影先の両側が一致していること。
    on_failure: |-
      fix-and-reverify。説明文の内容を見直して再修正し、再検査する。
  - id: TS-010
    target_item: AG-010
    verification: |-
      check_distribution_boundary を配布元（source）と配布先（link）の両側で実行する。
      表現是正 6 行・4 ファイルは処遇区分契約どおり是正し、是正後に concrete-id baseline
      再取得手順で残置を解消した後、両側の検査を再実行する。
    pass_criteria: |-
      source/link 両方の検査対象が存在し（対象不在のまま 0 件扱いになっていないこと）、
      両側の厳格な違反が 0 件であること。baseline 再取得後の残置が解消されていること。
    on_failure: |-
      fix-and-reverify。残存違反の原因を処遇区分契約に照らして修復し、再検査する。
  - id: TS-011
    target_item: AG-011
    verification: |-
      OU-001 完了後（docs-check 構成テスト群が全件成功している状態）、修正を統合した
      最新 main の実際の文書検査利用経路で docs-check 全体（STEP-1 全検査工程 + full
      integrity suite を含む）を実行する。
    pass_criteria: |-
      必須のすべての検査工程が実施され、厳格な違反が 0 件であり、docs-check 全体が正常
      終了（strict failure の終了コードなし）すること。含まれる整合性テスト群も正常終了
      すること。警告・情報が厳格な違反と混同されていないこと。
    on_failure: |-
      fix-and-reverify。失敗した検査工程の原因を修復し、全体を再実行する。
  - id: TS-012
    target_item: AG-012
    verification: |-
      修復過程の記録（PR 本文・実行記録）について、既存契約の変更が必要と判明した事項の
      有無と扱いを確認する。契約変更が必要と判明した事項が、既存要件の達成と区別して
      判断事項として報告されているかを確認する。
    pass_criteria: |-
      既存契約の変更が必要と判明した事項が存在した場合、当該事項が達成済みと扱われず
      判断事項として報告されていること。判明しなかった場合、契約変更不要の確認記録が
      実行記録に存在すること。
    on_failure: |-
      record-in-findings。契約変更が必要な事項は本 Case の達成対象とせず、Findings に
      out-of-scope として記録し、要件定義（再合意）による別単位での扱いに振り向ける。

review_dispositions:
  - id: RD-001
    source_ru: RU-0224
    source_item: RU-0224.対象外
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |-
      RU-0224 の対象外宣言一式（文書検査基盤全体の再設計、IR-072 等の既存検査規則の
      一般的改定、新しい品質ゲート・管理台帳・恒久的な例外機構の導入、修復に関係しない
      文書の改訂、厳格な違反の警告への降格による合格化、未合意の文書品質改善）は
      本 draft の実行対象に含めない。RU 本文の対象外宣言どおりの除外であり、RU の
      弱体化・拡張ではない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0224.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0225
    source_item: RU-0225.対象外
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |-
      RU-0225 の対象外宣言一式（テスト実行基盤の抜本的な置換、正規テスト契約の適用範囲
      縮小、テストの無効化・削除・安易なスキップ、製品側の安全検査や入力検証の緩和、
      textlint-guard の依存配布方式の変更、全体正常化と無関係な機能改善、新たな品質
      ゲート・例外制度・管理台帳の追加）は本 draft の実行対象に含めない。RU 本文の
      対象外宣言どおりの除外であり、RU の弱体化・拡張ではない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0225.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: |-
    2 RU は原因系統・対象領域が独立しており、OU-001（RU-0225: テスト実行環境・テスト
    資産・関連実装）と OU-002（RU-0224: 文書・生成成果物・配布定義）として並行着手が
    可能。ただし OU-002 の完了判定（D-06: docs-check 全体正常終了）は docs-check 構成に
    含まれる全テストの正常化（OU-001 の T-05/T-06）を前提とするため、OU の完了順は
    OU-001 → OU-002 となる（OU-002 depends_on OU-001）。両 RU 本文は原因別の作業分割
    （系統別の子 Issue / Wave 分割）を後工程に委ねており、実際の修復作業は原因や依存
    関係に応じて分割できる。Issue 階層・Epic/Wave 構成の最終決定は case-open の責務で
    ある（req-define は決定しない）。
  wave_hints:
    - "Wave A（並行着手可）: OU-001 の環境成立・原因別修復（T-01〜T-04）と、OU-002 の文書鮮度・AUTOGEN・説明文・配布境界の個別修復（D-01〜D-05）"
    - "Wave B（最終検証・逐次）: OU-001 の全テスト正常終了と統合後確認（T-05/T-06）→ OU-002 の docs-check 全体正常終了（D-06、統合後 main）"
```

# summary

承認済み2 RU（RU-0224 docs-check 残存 strict findings 解消、RU-0225 bun test 全テスト正常化）を、独立スコープを保持した 2 操作単位として構造化した要件ドラフト。両 RU とも既存契約（REQ-010、REQ-060、QG-4 正規形、IR-072、配布依存境界、説明文規約）への遵守回復であり、REQ/Decision/Design 保存を伴わない（artifact_actions 空 = direct_case 構成、実現面方針は realization_actions へ構造化）。RU-0224 の最終検証（docs-check 全体正常終了）は docs-check 構成テスト群の成功を前提とするため OU-002 depends_on OU-001（文書修正の着手は並行可）。過去の検出件数は固定せず現行 main（9115bbed）での再計測を修復の前提とする。scale は OU-002 の実装スコープシグナル（影響ファイル数 10 超）により large に昇格（昇格理由は draft-data 冒頭判定記録に記載）。generation_actor: supervisor は現行 REQ-008-051・artifact-contracts が許容しており契約不整合なし（CR-001）。QG-4 契約/ゲート整合リクエストは別件として本件に折り込まない（CR-004）。検討経緯・不採用方針は処理対象として残さない。
