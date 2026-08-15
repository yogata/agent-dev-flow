---
draft_type: req_draft
topic_slug: cross-layer-consistency-remediation
status: saved
created_at: 2026-08-15T20:15:00+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009, RU-0010, RU-0011, RU-0012, RU-0013, RU-0014, RU-0015, RU-0016, RU-0017]
---

# draft-data

````yaml
# 構成方針（案A、ユーザー承認済み）に基づく17 RU 一括処理の成果物。
# work_type: feature（REQ/SPEC artifact_actions が存在するため REQ-005-007 より feature 経路が必須）
work_type: feature

scale: large

summary: |
  2026-08-15 横断監査（session由来RU RU-0001）と backlog-review 生成 RU-0002〜0017 の17 RU を
  単一の壁打ちセッションで一括処理し、REQ・Decision・SPEC・配布物・検査基盤の横断整合性を回復する。
  構成方針（案A）: RU-0001 の14テーマは既存正規所有者 REQ へ分配し、RU-0002〜0017 は具象是正の
  構成単位として扱う。重複は具象 RU 側の具体性を優先し、RU-0001 側は契約条文レベルに抽象化する。
  definition 側は REQ 6 action（REQ-007/010/028 への append、REQ-001/012/009 の SPEC 移送抽象化）、
  SPEC 16 action（checker 実行契約新規 SPEC、機械分類表、除外規定、エンコーディング拡張等）、
  implementation 側は RU 群ごとの是正単位（OU-001〜OU-010）。
  RU-0017（REQ 体系構造協議）は対象外とし RU を残置、是正完了後の独立 req-define で扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      横断整合性回復の構成方針（案A、ユーザー承認済み）。RU-0001 の14テーマは既存正規所有者 REQ へ分配して扱い、
      正規契約から配布物・検査基盤までを一つの体系として是正する。RU-0001 と具象 RU 群（RU-0002〜0017）の重複は
      具象側の具体性を優先し、RU-0001 側は契約条文レベルに抽象化して二重計上を回避する。
      RU-0001 の14テーマの正規所有者の所在は現行 REQ で確認済みであり（識別体系・配布物自己完結性・GitHub 操作境界・
      adversarial-review 起動契約・case-auto/case-run 責務・handoff 例外・Epic 単一書き手・検証失敗時完了条件・
      Artifact Graph 検証・日本語品質・検査器整合性・欠陥類型是正の各テーマ）、真のギャップは
      「検証完了判定契約」（AG-008/009、REQ-007 への append）のみである。
  - id: AG-002
    content: |
      検査・索引ツールの ADR→Decision 移行追随を是正する（RU-0002 実装順序1〜3）。
      generate_indexes.ts の docs/adr/README.md 必須処理を docs/decisions/README.md 更新または
      対象ファイル不存在時スキップへ変更する。check_autogen_freshness.ts の docmap-inventory block 検査を除去する。
      AUTOGEN 再生成により4件のブロック不整合と4 SPEC の陳腐化を解消する。
      index-auto-generation SPEC の採用 block ID 表記を Decision README 系（decision-*）へ更新する（ACT-SPEC-008）。
  - id: AG-003
    content: |
      commands_e2e.test.ts の「ADR README.md exists」検査期待値を docs/decisions/README.md へ更新する
      （検査は廃止しない、RU-0002 実装順序4）。REQ-0030-009/010/011 の pre-existing failure 3件
      （case-close/case-open の Steps section 構造・template skill coverage、case-close body numbered step、
      full validation・ADR README.md 存在性）を是正する（RU-0002 実装順序5）。
  - id: AG-004
    content: |
      廃止済み成果物を前提とする検査 block ID の棚卸し規定を AUTOGEN ブロック鮮度検出 gate SPEC へ追加する。
      検査対象 block ID は参照先索引ファイルの現行存在を前提とし、廃止済み成果物を前提とする block ID を
      検査対象に含めない。棚卸し結果には由来（廃止契約、REQ）を記録する。
  - id: AG-005
    content: |
      check_integrity NG=21 全件の由来分類（legacy / superseded / AUTOGEN / 実欠陥）を行い、
      分類に応じた解消（リンク修正、参照更新、index 再生成結果の確認）で既存 broken reference を一掃する（RU-0003）。
      index-generation-consistency 系4件は AG-002 の AUTOGEN 再生成で解消される可能性があり、
      再生成実施後の残余を本項で扱う（OU-002 は OU-001 に必須依存）。修正後は新規 NG 検出のノイズが
      残らない状態を完工条件とする。
  - id: AG-006
    content: |
      worktree（Windows + junction 未伝播）環境依存を解消する（RU-0004 要件化の方向1〜2）。
      lint_skills.ts に兄弟テスト（skills_structure.test.ts / commands_structure.test.ts）と同じ
      src/ フォールバック（または同等のパス解決）を実装する。check_templates.ts に worktree 空洞化検知時の
      warning/skip を実装する。いずれも恒常失敗を解消し新規失敗との判別を自動化する。
  - id: AG-007
    content: |
      guard / checker の検出対象除外規定を明文化する（RU-0004 要件化の方向3〜4）。
      targeted docs guard は frontmatter または配置ディレクトリに基づく SPEC 判定を行い、非 SPEC ファイル
      （baseline snapshot 等）の SPEC README 登録候補誤検出を抑止する。歴史記録ファイル
      （docs/specs/integrity/audits/、baselines/ 等）は DEC-013 AG-008 適用範囲の残存参照判定対象外とする。
      除外は SPEC が正規所有する列挙に限定し、根拠を文書化する。
  - id: AG-008
    content: |
      「full integrity suite pass」の受入れ基準（既知欠陥の扱い、環境依存欠陥の扱い、baseline 比較の要否）を
      品質ゲート SPEC の QG-4 節へ明文化する（RU-0005 方向1、ACT-SPEC-006）。
      OU-008a で運用補完した基準（fail 全件の由来分類と検証環境記録を前提とする判定）を恒久契約化する。
  - id: AG-009
    content: |
      検証 fail 由来判定と baseline 再生成分実行契約を確定する（RU-0005 方向2〜4）。
      由来判定の基準 commit は remediation 開始前 baseline commit とし、被差し戻し PR の「base から同一」表記を
      pre-existing 証拠として採用しない。受入れ記録へ検証環境（worktree / main、junction 伝播、依存パッケージ状態）と
      fail 全件の由来分類証跡を必須とする（REQ-007 append、ACT-REQ-001）。
      runtime reference snapshot baseline（IR-055）再生成は移設系 PR への標準手順組み込み、並列 Wave では
      Wave 境界または最終 merge 後のスコープ、保存工程での要否判定に従う（ACT-SPEC-007）。
      baseline は ratchet（純減は健全）である性質を維持し、再生成による違反隠蔽を行わない。
  - id: AG-010
    content: |
      commands_error_cases.test.ts 内蔵 validateCommand を廃止し、配布 checker
      （check_command_format.ts、command-format-rules.yaml）の規則から期待値を単一化する（RU-0006 方向1）。
  - id: AG-011
    content: |
      検証規則の単一実装原則を REQ-010 配下に要件化する（RU-0006 方向2、ACT-REQ-002）。
      テストは配布 checker と同種の整合性検証規則を独自実装せず、配布 checker の規則から期待値を導出する。
      構造変更時にテスト側だけが陳腐化する二重管理を許容しない。
  - id: AG-012
    content: |
      契約テスト固定トークンと期待値管理の手順を確定する（RU-0006 方向3〜4、learning 成果物の制約どおり手順化のみ）。
      本文圧縮・機械的リライト前の固定トークン確認（当該ファイルを参照する *.test.ts の grep）を thin 化手順へ組み込む。
      構造変更 PR の完了条件テンプレート・ガイドラインへ「当該構造を固定する契約テストの期待値更新」を明示する
      （ACT-SPEC-010）。新規 checker 実装は行わない。
  - id: AG-013
    content: |
      実装済み checker の設計規則を SPEC 化する（RU-0007 方向1〜3）。check_extensions.ts --scenario を
      変更経路 routing 等の標準実行手段として新規 SPEC（checker 実行契約）へ契約化する（ACT-SPEC-001）。
      Workflow / Capability 機械判定規則を workflow-skill-model SPEC の分類表として明文化する（ACT-SPEC-002）。
      Extension 読込状態機械が runtime resolver と deterministic checker の共有実装である旨を
      project-extensions SPEC へ正規化する（ACT-SPEC-003）。
  - id: AG-014
    content: |
      targeted docs guard の実行契約を SPEC へ追加し、USAGE 文言と guard 実行手続 references へ反映する
      （RU-0007 方向4、ACT-SPEC-004）。コミット前（worktree 上）は --base-ref、コミット後・PR 作成後（main 環境）は
      --files を標準とする使い分け、bun run 起動、PowerShell での引数形式（引用符まとめ渡し不可、
      配列変数経由または個別渡し）を明記する。
  - id: AG-015
    content: |
      コンソールエンコーディング初期化の適用範囲を全経路へ拡張する（RU-0008、RU-0013、ACT-SPEC-009）。
      (1) git CLI 直接操作の WRITE（git commit -F、git tag -F 等）にも Step 0 相当の初期化を必須前置する。
      (2) gh pr create / gh issue create で --title と --body-file の同時渡しを避け、ASCII 仮 title + --body-file →
      REST API PATCH による日本語 title 設定の2段階シーケンス、または gh api --input による統一を標準とする
      （既存の --title inline 禁止・REST API PATCH 標準の規則は存置し拡張のみ行う）。
      (3) PowerShell パイプライン経由の日本語 READ では [Console]::OutputEncoding 前置または
      Node.js execSync / fs.readFileSync 経路を指定する。
      (4) 実行担当サブエージェント委譲時（worktree 隔離境界で .agentdev/** への書き込みが禁止される場面）は、
      WRITE 標準手続きの一時ファイル配置先をリポジトリ外の一時領域とし cleanup 一体化を維持する（RU-0013 解消、
      case-run 委譲 MUST NOT 側は変更しない）。agentdev-gh-cli はローカル版（src/opencode-local/）と通常版で
      参照先が分かれる構成に注意する（REQ-009、DEC-004）。
  - id: AG-016
    content: |
      配布物形式・参照契約の突合機構を確立する（RU-0009）。
      (1) agentdev-workflow-templates 配布物に templates/case-open/ の3テンプレート
      （standard、epic、multi-req-epic）を新規作成する（termination-and-cleanup.md の参照が設計意図であるため実体化）。
      (2) Parent 配置（子Issue 本文先頭行 Parent: #N）と Epic 追跡テーブル形式の正規形を一元化し、
      agentdev-epic-tracker と case-open テンプレート群を整合させる。先行実績（#2092 形式等）との後方互換は
      移行措置として許容する。
      (3) agentdev-skill-authoring / agentdev-command-authoring の査読観点に参照先実ファイル存在確認を明示する
      （ACT-SPEC-013/014）。
      (4)「skill/command reference → templates/ 等へのパス参照 → 実ファイル存在」検査の checker を追加する。
      checker 追加は新規 IR 登録 gate（REQ-028-012、8項目存在条件）に従い、detector 実装・回帰テスト・
      正常/異常 fixture を同一ケースで整備する。
  - id: AG-017
    content: |
      agentdev-doc-diagnostics 内部2ファイルの旧 Command 手順番号参照を Workflow Skill の工程名・節名参照へ
      decoupling する（RU-0011 実質残存課題）。references/diagnostic-routing.md の「Step 2〜Step 8」表と
      references/diagnostic-categories.md の「inspect-docs Step 11、inspect-skills Step 3」記述を、
      agentdev-workflow-inspect-docs / agentdev-workflow-inspect-skills の工程名・節名参照へ置き換える。
  - id: AG-018
    content: |
      REQ-028 後続フェーズの実質残存3項目を要件化する（RU-0010、ACT-REQ-003）。
      (1) inspect-docs 観点レジストリの schema・配置先を確定し、実体化する（ACT-SPEC-015 が schema と配置先を規定）。
      (2) 4つの declarative data YAML（retired-artifact-registry、command-format-rules、
      delegation-contract-patterns、distribution-targets）の schema を SPEC 化し、
      「正は SPEC、YAML は検出用ビュー」原則を明文化する（ACT-SPEC-001）。
      (3) detector 命名規約（checkIR_NNN_、@ir タグ等）を導入し、IR から detector 実装への機械的逆引きを
      可能にする（TS-008 完全達成、横断的再評価の前提、ACT-SPEC-001）。
      RU-0010 の4項目のうち skill-category-table-7-ir-reflection は現行検証で解消済み（generate_indexes.ts による
      自動生成方式へ再設計済み）のため要件化対象外とし、検証記録として review_dispositions に保持する。
  - id: AG-019
    content: |
      docs・配布物の陳腐化表記・参照を横断是正する（RU-0012 機械是正5項目）。
      (1) 5 SPEC ファイル（document-model、quality-gates、agentdev-artifact-validation、agentdev-doc-diagnostics、
      agentdev-spec-file-manager）の「（REQ-001, REQ-001）」引用重複を PR 2111 と同じ修正パターンで解消する。
      (2) 一文一行機械判定違反とテーブルセルプレースホルダ残存を対象ファイル固定の機械横断是正として解消する
      （対象ファイルリストは実行時機械判定で確定する）。
      (3) req-impact-map.md の「REQ-004-053〜055」行を v3.0.0 移行時の意図確認の上、現行 REQ 体系へ更新または再構成する。
      (4) intake-capture.md G06 の「/agentdev/learning-capture」をスキル表記へ修正する。
      (5) patterns.md の REQ 件数記述を README（AUTOGEN）参照へ寄せ、IR-042/IR-018 が検出しなかった理由
      （実行頻度・対象漏れ）を確認する。
      政策選定1項目（superseded 孤児 SPEC の保持ポリシー）は (a) 歴史参照残置の明文化を採用する。
      現行の document-model.md 規定（superseded は元位置を維持し superseded_by で後継を示す）が (a) と整合するため、
      新規の運用導入は行わず現行規定の適用確認のみとする。
  - id: AG-020
    content: |
      配布物の書式統一を行う（RU-0014、RU-0015）。
      (1) check-consumer-opencode.ps1 と install-consumer-opencode.ps1 の案内文言・既定 URL 定数を共有化
      （共通モジュール化または単一定義参照）し、二重管理を解消する（利用者可視挙動の変更を伴わない内部再構成）。
      (2) agentdev-workflow-case-open、agentdev-workflow-case-auto の SKILL.md および references/ の
      STEP 識別子をマスク形式（STEP-{N}）から実番号（STEP-1 等）へ統一する。
      (3) thin Command の workflow 節の順序ラベル様式の統一基準を authoring/command-file-format.md へ規定する
      （ACT-SPEC-011）。Command の workflow 節は「### Step N」へ統一し、Workflow Skill 本文の工程識別子は
      実番号形式（STEP-1 等）とする使い分け基準を明記する。workflow-skill-model SPEC の Command 責務節も
      統一後の様式記述へ更新する（ACT-SPEC-016）。既存16 Workflow Skill の3変種
      （### Step N / STEP-I / 工程-I）は統一基準へ更新する。
  - id: AG-021
    content: |
      REQ の SPEC 分離基準違反群（RU-0016、F-04〜F-12）の移送判断を確定する。
      移送4件: F-04/F-05（REQ-001-057/058 の6+6カタログ列挙 → 6分類体系の宣言へ抽象化、具体的一覧は
      agentdev-decision-guidelines SPEC が既に正規所有、ACT-REQ-004）、F-08（REQ-012-003 の node 種別列挙 →
      標準デフォルトと augmentation 拡張の分離原則へ抽象化、一覧は artifact-graph SPEC が所有、ACT-REQ-005）、
      F-09（REQ-009-027〜030 の frontmatter・status・labels・セクション詳細列挙 → SPEC 所有の契約参照へ抽象化、
      詳細は local-case-file SPEC が既に所有、ACT-REQ-006）。
      残置5件（安定契約例外）: F-06（REQ-002-030 の Extension 3種、公開分類体系）、F-07（REQ-005-005/010 の
      work_type 4値・command 5分類、REQ-001-053 と対の横断安定契約）、F-10（REQ-034-027/030 は「数値は SPEC」と
      自覚済みの安全境界、REQ-009-006 のリポジトリ種別5種は「利用者に見える分類体系」であり安定契約例外。
      REQ と SPEC（4種表）の整合ギャップは SPEC 側へ plugin-future の位置づけ注記を追加して解消、ACT-SPEC-012）、
      F-11（REQ-005-019〜022 の agentdev_handoff 意味論、ワークフロー公開契約）、
      F-12（REQ-015-012 の停止伝播原則、外部契約中核）。
      F-04/F-05 は REQ-001-062（enum は SPEC 責務）との内部不整合解消を兼ねる。
  - id: AG-022
    content: |
      RU-0017（REQ 体系構造協議: REQ-010 SPLIT、Artifact Graph 系7 REQ の MERGE/RETIRE）は本次是正の
      対象外とし、RU を .agentdev/backlog/req-units/ に残置する。構造再編（SPLIT/MERGE/RETIRE）を本次是正と
      同一ケースで実施すると是正対象の要件行 ID が再編でずれ相互干渉するため、是正完了後の独立した req-define で
      協議する。次第の土台（REQ-010 は SPLIT 予兆シグナル3で docs-check と inspect/pipeline 群の配布境界での
      2分割候補、Artifact Graph 系は REQ-013 の RETIRE 候補・REQ-022/023/024 の REQ-012/020 への集約候補、
      REQ-021 は維持）を本合意に記録し、RU-0016 の F-08 抽象化（AG-021）は将来の MERGE 協議の摩擦を
      増大させない抽象化のみにとどめる。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-007
    source_items: [AG-008, AG-009]
    content: |
      REQ-007（完了報告と成果物品質ゲート）へ次の要件行を追記する。

      | REQ-007-006 | 検証スイート全体の合格判定は、fail 全件の由来分類（既知欠陥、環境依存、当該変更起因）と検証環境の記録を前提とすること。未登録の既知欠陥と由来不明の fail を合格の根拠にしないこと |
      | REQ-007-007 | 検証 fail の由来判定は remediation 開始前の baseline commit を基準とし、被差し戻し PR の base ブランチ比較のみを pre-existing の証拠として採用しないこと |
      | REQ-007-008 | 合格記録は検証環境（worktree または main、junction 伝播状態、依存パッケージ状態）と fail 全件の由来分類証跡を含めること |
      | REQ-007-009 | 基準snapshot系 baseline の再生成は、移設を伴う変更では標準手順として実行し、並列実行時は Wave 境界または最終取り込み後のいずれかのスコープで実行し、保存工程では参照追加・変更に応じて要否を判定すること。再生成により違反を隠蔽せず、純減を健全とすること |

      適用範囲（対象）へ「full integrity suite の受入れ基準、検証 fail 由来判定、baseline 再生成分実行契約」を追加する。
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-010
    source_items: [AG-011]
    content: |
      REQ-010（自己監査と診断・是正候補抽出）へ次の要件行を追記する。

      | REQ-010-062 | テストは配布 checker と同種の整合性検証規則を独自実装せず、配布 checker が所有する規則から期待値を導出すること。構造変更時にテスト側のみが陳腐化する二重管理を行わないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-028
    source_items: [AG-018]
    content: |
      REQ-028（IR 体系の実効性監査と存在条件厳格化）へ次の要件行を追記する。

      | REQ-028-014 | inspect-docs の診断観点は正規の観点レジストリ（schema と配置先を確定した実体）が所有すること。移管対応表で名指しされた観点の正規の所有場所は当該レジストリとすること |
      | REQ-028-015 | 検出用の宣言的データ YAML は SPEC が正となる schema を持ち、YAML は検出用ビューとして扱うこと |
      | REQ-028-016 | detector 実装は IR 識別子に基づく命名規約を持ち、IR から detector 実装への機械的逆引きが可能であること |
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-001
    source_items: [AG-021]
    content: |
      REQ-001 の次の要件行を変更後本文へ置き換える（F-04/F-05 移送。6+6カタログの具体的一覧は
      agentdev-decision-guidelines SPEC が既に正規所有しており、二重定義を解消する）。

      | REQ-001-057 | 直接更新可能な非意味修正は6分類体系として構成すること。各分類の具体的一覧は SPEC が正規所有すること |
      | REQ-001-058 | 後継 Decision を必要とする意味変更は6分類体系として構成すること。各分類の具体的一覧は SPEC が正規所有すること |
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-012
    source_items: [AG-021]
    content: |
      REQ-012 の次の要件行を変更後本文へ置き換える（F-08 移送。種別一覧は artifact-graph SPEC が所有）。

      | REQ-012-003 | 標準スキルのデフォルト node_types は永続文書種別に対応する最小集合とし、それ以外の node_type は augmentation が追加すること。デフォルト種別および追加可能な種別の一覧は SPEC が正規所有すること |
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-009
    source_items: [AG-021]
    content: |
      REQ-009 の次の要件行を変更後本文へ置き換える（F-09 移送。詳細 schema は local-case-file SPEC が既に所有）。

      | REQ-009-027 | ローカルCaseファイルの YAML 前書きは、識別、状態、日付、分類に必要な必須 field 契約を SPEC が定め、当該契約に従うこと。ブランチ関連 field を持たせないこと |
      | REQ-009-028 | ローカルCaseファイルの status は SPEC が定める値域から選択され、終端状態を持つ状態遷移に従うこと |
      | REQ-009-029 | ローカルCaseファイルの labels は SPEC が定める値域から選定すること |
      | REQ-009-030 | ローカルCaseファイルには SPEC が定める必須セクションを設けること |
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: docs/specs/integrity/checker-execution-contracts.md
    target_spec:
      operation: create
      domain: integrity
      slug: checker-execution-contracts
    source_items: [AG-007, AG-013, AG-018]
    content: |
      ---
      title: checker 実行契約と検出基盤規則
      status: draft
      created: 2026-08-15
      updated: 2026-08-15
      ---

      # checker 実行契約と検出基盤規則

      検査 checker の実行契約、検出対象の除外規定、宣言的データ YAML の schema 原則、detector の命名規約を
      正規所有する。配備先の一貫性（RU-0004 と RU-0007 で対象 checker が重複する両 RU の連携注記）を本 SPEC で担保する。

      ## 目的

      実装済み checker 資産の実行手段、標準実行経路、検出対象除外規定、検出基盤の設計規則を契約化し、
      検証実施の属人化と誤検出の反復を防止する。

      ## checker 共通実行契約

      - 起動手段はスクリプト契約（integrity-contracts）に従い bun run で実行する
      - check_extensions.ts の --scenario モードは、変更経路 routing 等の分岐候補探索における標準実行手段とする。
      実行プロファイルは対象変更（extension、command、skill）の種別に応じて選択する
      - 共通 CLI 契約（--help、--json、--dry-run、exit code 0/1/2、stdout 機械可読出力）に従う

      ## 検出対象除外規定

      - 検出対象除外の正規所有は本 SPEC とする。checker 実装は本 SPEC の列挙に従い、列挙外の除外を独自に追加しない
      - 除外は対象ファイル単位とし、根拠（ルール自己参照、履歴参照領域、検出原理上の技術的除外）を文書化する。
      広域 glob による検出回避と検出無効化を許容しない（NG 隠蔽禁止、integrity-contracts と同一規定）
      - targeted docs guard は frontmatter または配置ディレクトリに基づく SPEC 判定を行い、非 SPEC ファイル
      （baseline snapshot、歴史記録ファイル等）の SPEC README 登録候補誤検出を抑止する
      - 歴史記録ファイル（docs/specs/integrity/audits/、baselines/ 等）は DEC-013 AG-008 適用範囲の
      残存参照判定の対象外とする

      ## 宣言的データ YAML の schema 原則

      検出用の宣言的データ YAML（retired-artifact-registry、command-format-rules、delegation-contract-patterns、
      distribution-targets）は、正となる schema を SPEC が所有する。各 YAML は検出用ビューであり、
      正規契約の情報源とはしない。YAML と正 SPEC の不一致は検査で検出対象とする。

      ## detector 命名規約

      detector 実装は IR 識別子に基づく命名規約（checkIR_NNN_ 関数接頭辞、@ir タグ等）を持ち、
      IR から detector 実装への機械的逆引きを可能にする。共用 detector を許容する場合（REQ-028-001）も、
      当該 IR への到達性を逆引き結果から追跡できることを維持する。

      ## 対象外

      - 各 checker の個別検出ロジック、検出シグナル、severity 判定（各 checker の SPEC と IR カタログ）
      - targeted docs guard のモード使い分け・引数形式の詳細（targeted-docs-guard-implementation SPEC）
      - AUTOGEN block ID の棚卸し規定（autogen-freshness-gate SPEC）
      - Workflow / Capability 機械分類規則（workflow-skill-model SPEC）

      ## See Also

      - integrity-contracts.md（スクリプト契約、NG baseline 運用、除外設定の文書化要件）
      - targeted-docs-guard-implementation.md（guard 実行契約）
      - workflows/workflow-skill-model.md（Workflow / Capability 機械分類表）
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-skill-model.md
    target_area: "## Capability Skill と Workflow Skill の責務境界（REQ-002-018）"
    source_items: [AG-013]
    content: |
      ## Capability Skill と Workflow Skill の責務境界（REQ-002-018）

      Capability Skill と Workflow Skill は異なる責務境界・判断モデルを持ち、同一 skill として混在させない（REQ-002-003、REQ-002-018）。

      | 側面 | Workflow Skill | Capability Skill |
      |---|---|---|
      | workflow STEP | 所有する（resume point、control plane） | 所有しない |
      | 対応 Command | 1:1 または 1:N | N:N（複数 Workflow Skill から参照） |
      | 制御構造 | STEP 順序、分岐、停止条件 | なし（宣言的定義、判断基準、決定的処理） |
      | 責務境界 | 特定 workflow の実装本体 | 複数 workflow 共通能力 |
      | 判断モデル | workflow 状態遷移に基づく制御判断 | 宣言的ルール、分類基準、決定的変換 |

      1つの skill が両側面を持つ場合、責務境界を明示的に分離し、2つの skill へ分割する。新規に作成する skill は作成時にどちらの層へ属するかを判定基準（「Capability Skill の判定基準」節）に照らして確定する。

      ### Workflow / Capability 機械分類規則

      deterministic checker（check_extensions.ts）が適用する Workflow Skill / Capability Skill の機械判定規則を次の分類表として正規所有する。checker 実装と本表は同一規則を反映し、乖離は検査で検出対象とする。

      | 判定要素 | Workflow Skill | Capability Skill |
      |---|---|---|
      | workflow STEP の所有 | SKILL.md に STEP 一覧と遷移を記述する | 記述しない（宣言的定義のみ） |
      | 対応 Command | dispatch 元 Command を1以上に持つ | 特定 Command 固有の dispatch を持たない |
      | 制御構造の記述 | STEP 順序、分岐、停止条件を本文で所有する | workflow 制御構造を本文に持たない |
      | 呼称の例外 | なし | `agentdev-workflow-*` プレフィックスの一部スキルは歴史的経緯で Capability Skill として運用する（「workflow-* プレフィックスを持つ Capability Skill 的スキル」節） |
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/foundations/project-extensions.md
    target_area: "## 実行時読み込み契約"
    source_items: [AG-013]
    content: |
      ## 実行時読み込み契約

      command/skill は実行時に自分に対応する extension だけを読む。

      - Workflow Skill は .agentdev/extensions/skills/{workflow-skill-name}.yaml（kind: workflow-extension）を対象とする。
      - Workflow Skill は必要に応じて .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml（kind: internal-workflow-extension）を追加で読む。command は internal Workflow Extension を直接読まない。
      - Capability Skill は .agentdev/extensions/skills/{capability-skill-name}.yaml（kind: capability-skill-extension）を対象とする。
      - 対応 extension が存在しない場合は標準動作で続行する。
      - 対応 extension が破損している場合（YAML 構文エラー、必須field 欠落等）はエラーを表示し、当該 extension を無視して標準動作で続行する（REQ-002-031 準拠、fail-open）。
      - 旧kind（command-extension / skill-extension）を検出した場合は migration-required として停止する。
      - 構文上有効な未知kind を検出した場合は schema violation として停止する。
      - extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

      対応 extension が存在しない command/skill は正常動作であり、異常状態ではない。command が project 非依存で単体動作する正当な状態である。例として `/agentdev/inspect-skills` は SPEC 直接参照を持たず project 非依存で動作するため extension 不要である。

      ### 状態機械の共有実装

      Extension 読込の状態機械（不在、破損、旧kind、未知kind、有効の各状態とその遷移）は、runtime resolver と deterministic checker（check_extensions.ts）が同一実装を共有する。runtime resolver は fail-open 契約（REQ-002-031）を、deterministic checker は NG 報告契約をそれぞれ担う。状態分類の正規入力となる kind enum は本 SPEC「Extension kind enum（公式）」が定める。共有実装の変更は runtime と checker の両契約へ同時に反映する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/integrity/targeted-docs-guard-implementation.md
    target_area: "## CLI 引数"
    source_items: [AG-014]
    content: |
      ## CLI 引数

      check_changed_docs.ts が受け付ける CLI 引数（v2:REQ-0158-004 より移管）。

      | 引数 | 必須 | 値 | 説明 |
      |------|------|-----|------|
      | `--workflow` | ✓ | `req-save` / `spec-save` / `case-run` / `case-close` / `docs-check` | 検査プロファイル切替え。各 workflow で対象ファイル種別と検査ルールセットを切替える（REQ-010-282） |
      | `--files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | main 環境（マージ後、case-close 等）で PR 変更ファイルを直接指定して使用。files_checked 空の場合は FAILURE（REQ-010-282、Phase 3） |
      | `--base-ref <git-ref>` | -- | git ref（既定: `origin/main`） | worktree 環境（マージ前、case-run 等）で変更ファイル検出に使用。files_checked 空の場合は WARNING（REQ-010-282、Phase 3） |
      | `--json` | -- | flag | JSON 出力を有効化 |
      | `--fail-level <level>` | -- | `strict` / `warning` | failure とする severity の閾値。既定は `strict` |
      | `--declared-files <path...>` | -- | ファイルパス（space 区切り推奨、comma 区切りも受入） | Issue/PR で宣言した文書更新対象と実変更ファイルの対応を検査する任意引数 |

      `--files` と `--base-ref` は排他ではなく、いずれかで変更対象を特定する。両方未指定の場合はエラー。

      ### 標準実行契約（モード使い分け、起動手段、引数形式）

      - モード使い分け: コミット前（worktree 上での検証）は `--base-ref` を標準とし、コミット後・PR 作成後（main 環境）は `--files` を標準とする。`--files` と `--base-ref` の誤用による誤 pass・誤 FAILURE を防ぐため、起動時に対象ファイルが検出できる見込みを確認してから実行する
      - 起動手段: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` により起動する（スクリプト契約の共通 CLI 契約に従う）
      - PowerShell での引数形式: 複数パスの引数は引用符でまとめて1文字列として渡さず、配列変数経由（`$files = @("a.md","b.md"); --files $files`）または個別渡しとする。`--files "a.md b.md"` 形式の引用符まとめ渡しは split 失敗の恐れがあるため使用しない
      - USAGE 文言: check_changed_docs.ts の `--help` 出力および guard 実行手続 references は上記使い分け・起動手段・引数形式を明記する
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/integrity/autogen-freshness-gate.md
    target_area: "## 検出対象"
    source_items: [AG-004]
    content: |
      ## 検出対象

      - AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->` 〜 `<!-- AUTOGEN:END -->`）を含む索引ファイル群
      - 代表例: `docs/specs/quality/spec-health-metrics.md`（SPEC 計測例 AUTOGEN ブロック）
      - 対象一覧は SC-002（`docs/specs/integrity/index-auto-generation.md`）が定める自動生成対象ファイルと同一

      ### 廃止済み成果物を前提とする block ID の棚卸し規定

      - 検査対象 block ID は、参照先索引ファイルが現行存在することを前提とする。廃止済み成果物（旧 ADR README、削除済み文書地図等）を前提とする block ID を検査対象に含めない
      - block ID の棚卸しは、参照先実ファイルの存在確認をもって行い、不在を検出した場合は検査対象から除去するとともに、由来（廃止契約、REQ）を検査対象リストの記録に残す
      - 検査対象の追加・削除は index-auto-generation SPEC の採用 block ID 一覧と整合させる
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/quality/quality-gates.md
    target_area: "## QG-4: Final Acceptance Gate"
    source_items: [AG-008, AG-009]
    content: |
      ## QG-4: Final Acceptance Gate

      ### 目的

      case-close で PR マージ前に、最終受け入れ状態を確認する。
      Issue 完了条件チェックボックスの全達成、CI 通過、ドキュメント整合性を検証する。

      ### 配置

      - **case-close**: 前提確認（Step 2）、docs 検証（Step 3, 3-1）。PR / CI / Issue チェックボックスを対象に完了証拠を確認。

      ### pass / fail 基準

      - **pass**: 完了条件チェックボックスが全て `[x]`、CI 通過、docs 整合性確認済み。マージ可能。
      - **fail**: 未達チェックボックスが残る、CI 失敗、docs 不整合あり。構造化エラーで停止。

      ### 完了条件チェックボックス評価

      QG-4 は Issue 本文の完了条件セクションのチェックボックスを品質ゲートとして評価する。
      識別子中心評価（REQ-003-011）を主評価値とし、件数や行数などの実測値は補助値として扱う。
      未達項目は case-run への差し戻し（G08）、または intake への逃がし禁止（G16）として扱う。

      verify-only PR（実装差分0件、検証のみ）の場合、QG-4 の完了条件評価は PR 本文の verify-only 根拠欄（実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果）を証拠ソースとして認める。verify-only PR は実装差分を含まないため、根拠欄の記載で完了条件を評価する。verify-only PR では case-close Step 3-1 targeted docs guard の `files_checked` が空配列となるが、根拠欄の記載により空の `files_checked` が無根拠にならない。verify-only PR の判定基準（PR 変更ファイル一覧が空配列、根拠欄の記載十分性、受け入れ基準の検証充足）は [case-close.md](../commands/case-close.md)「verification-only PR の files_checked 空確認（v2:REQ-0158-002）」が定め、QG-4 は当該判定を経た PR のみを PASS とする。

      PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。verify-only 根拠欄の記入規則は [case-run.md](../commands/case-run.md)「verify-only 根拠欄の記入規則」参照。

      ### 詳細

      判定基準、検査観点の詳細は `agentdev-quality-gates` スキルの `references/qg-4-final-acceptance.md` を参照。識別子中心評価の運用実例集は同 reference が蓄積し、REQ-003-011 と意味を一致させる。

      #### test strategy 処理完了確認

      全 test strategy 項目が合格済みまたは Findings 記録済みであることを確認する。
      未処理の test strategy 項目が残る場合、完了扱いとしない。

      ### full integrity suite 受入れ基準

      検証スイート全体（bun test 全件、整合性検査群）の合格判定は、次の受入れ基準に従う。

      - **fail 由来分類の前提**: 合格判定は fail 全件の由来分類（既知欠陥、環境依存、当該変更起因）と検証環境の記録（worktree または main、junction 伝播状態、依存パッケージ状態）を前提とする。未登録の既知欠陥と由来不明の fail は合格の根拠にできない
      - **由来判定の基準 commit**: 由来判定は remediation 開始前の baseline commit を基準とする。被差し戻し PR の base ブランチ比較のみを pre-existing の証拠として採用しない
      - **既知欠陥の扱い**: 既知欠陥は baseline または承認済み記録に登録済みであることを要し、未登録の fail は当該変更起因として扱う
      - **環境依存欠陥の扱い**: 環境依存の fail は検証環境の記録と再現条件を証跡として残し、対象環境で回避可能なことを確認した上で警告付き合格の対象とできる
      - **baseline 比較の要否**: baseline 運用対象の検査（RuntimeReference baseline、NG baseline）は比較をもって新規違反 0 件を確認する。baseline 非対象の検査は全件 pass を要する
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/integrity/integrity-contracts.md
    target_area: "## RuntimeReference baseline 運用手順（REQ-010-021）"
    source_items: [AG-009]
    content: |
      ## RuntimeReference baseline 運用手順（REQ-010-021）

      IR-055（runtime-unresolved-reference）は段階導入（REQ-010-264）のため、baseline 既知違反と新規違反を区別する。baseline は `.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json` に格納する。

      | 項目 | 定義 |
      |------|------|
      | 更新タイミング | delta guard / impact guard で「new violation」と報告された場合。ただし根因調査の結果、当該違反が正当な実装修復の結果ではなく baseline 陳腐化（周辺文書の改修や対象外領域の再編等）に起因すると判断された場合に限り baseline を更新する |
      | 更新対象範囲 | IR-055 baseline のみ。他ルール（IR-001〜IR-054, IR-056, IR-057）は baseline 運用を行わず、新規違反は即座に修正する |
      | 実行者 | agent-dev-flow リポジトリの maintainer。PR を経由して更新する |
      | 根因特定手順 | (1) 報告された new violation の evidence を確認する。(2) 当該箇所が本来除去されるべき違反か、baseline に記録された既知違反の周辺改修による見え方の変化かを分類する。(3) 前者の場合は違反を修正し baseline は更新しない。後者の場合は baseline 更新を正当化する根因（baseline 再計算で当該 bucket の count が増加する理由）を PR 本文に記載する |
      | 更新実行手順 | `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --update-ir055-baseline` を実行し、生成された baseline ファイルを commit する。更新後は `--json` 実行で new violation が 0 件になることを確認する |
      | 更新非対象 | strict 違反（REQ-NNNN、ADR-NNNN、`src/opencode/`、`/repo/*`、`repo-*`）の新規発生は baseline 更新で解消せず、必ず実装修復を行う。baseline 更新が許容されるのは heuristic 違反（`docs/specs/`、`docs/guides/`、本体 GitHub URL、行番号付き参照）の bucket 再計算のみ |

      ### baseline 再生成分実行契約

      - **移設を伴う変更**: 文書の移設・改名・参照構造変更を伴う PR では、baseline 再生成（再計算）を標準手順として PR 内で実行する。移設完了と baseline 不整合の残存を分離して報告する
      - **並列 Wave 実行時**: 並列 Wave で同一 baseline への更新競合が生じ得る場合、再生成スコープは Wave 境界（各 Wave の取り込み完了時点）または最終 merge 後（Epic 全体の取り込み後）のいずれかとし、PR 間で同一 bucket の二重更新を発生させない
      - **保存工程での要否判定**: docs/specs 配下への新規参照追加・参照変更を伴う保存工程では、変更後に IR-055 の new violation を確認し、正当な実装修復由来でない場合に再生成要否を判定する
      - **ratchet 性の維持**: baseline は純減を健全とする ratchet であり、再生成により既知違反の隠蔽と検出対象の縮小を行わない。再生成の根拠は PR 本文に記録する
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target: docs/specs/integrity/index-auto-generation.md
    target_area: "### AUTOGEN block ID 命名パターン"
    source_items: [AG-002]
    content: |
      ### AUTOGEN block ID 命名パターン

      AUTOGEN block ID は `{target}-{section}-{subsection}` 形式に従う。各要件は以下のとおり。

      - `target`: 索引ファイルの短縮名（catalog, rule-ownership, decision, req, docmap, req-metrics, spec-metrics, readme）
      - `section`: 索引ファイル内の自動生成対象セクション（ir-entries, ir-crossref, baseline, status, active, retired, inventory, measurement-example, req-summary）
      - `subsection`: 同一セクション内の複数ブロック識別子（pre-045, post-045, count, table, accepted, proposed, superseded, deprecated 等）

      採用 ID 参照例:

      | block ID | 索引ファイル |
      |---|---|
      | `catalog-ir-entries-pre-045` | integrity-rule-catalog.md |
      | `catalog-ir-entries-post-045` | integrity-rule-catalog.md |
      | `rule-ownership-ir-crossref` | rule-ownership.md |
      | `decision-baseline-count`, `decision-baseline-table` | decisions/README.md |
      | `decision-status-accepted` 等（proposed/superseded/deprecated） | decisions/README.md |
      | `decision-retired-table` | decisions/README.md |
      | `req-active-count`, `req-active-table`, `req-retired-table` | requirements/README.md |
      | `req-metrics-measurement-example` | quality/req-health-metrics.md |
      | `spec-metrics-measurement-example` | quality/spec-health-metrics.md |
      | `readme-req-summary-count` | README.md |

      新規 AUTOGEN block は本形式に従う。camelCase、英語以外の混在等は許容しない。旧 ADR 索引（docs/adr/README.md、`adr-*` block ID 群）は DEC-009（ADR から Decision への正規成果物モデル移行）で廃止済みであり、採用 ID として使用しない。
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-gh-cli.md
    target_area: "## WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）"
    source_items: [AG-015]
    content: |
      ## WRITE 手続きの Windows encoding 初期化必須化（REQ-011-009）

      `agentdev-gh-cli` の WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR 作成、PR merge、Issue close 等）は、Windows 環境においてコンソールエンコーディング初期化（standard-procedures Section 2 Step 0）を**必須前置**する（REQ-011-009）。

      ### 要件

      - **対象**: 全 WRITE 手続き（gh CLI に `--body-file`/ `-F`/ `--title` 等の引数を渡す操作）、および git CLI 直接操作の WRITE（`git commit -F`、`git tag -F` 等のファイル引数に日本語を含む操作）
      - **対象外環境**: Linux/ macOS/ WSL 等の Windows 以外の環境（既定で UTF-8 コンソール）
      - **必須前置内容**: WRITE 操作前に以下の3行を実行してコンソールエンコーディングを UTF-8 に初期化する

      ```powershell
      [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
      $OutputEncoding = [System.Text.Encoding]::UTF8
      cmd /c chcp 65001 | Out-Null
      ```

      - **READ 手続きのパイプライン拡張**: PowerShell パイプライン経由で日本語出力を読み取る READ 操作（`git show`、`Get-Content`、`Select-String` 等）は、パイプライン前に `[Console]::OutputEncoding` の前置を行うか、Node.js `execSync` / `fs.readFileSync` 経路で取得する。Node.js 経由の READ はコンソールエンコーディングに依存しないため前置を要しない

      ### title と本文の同時渡し回避シーケンス

      - gh pr create / gh issue create で `--title` と `--body-file` を同時渡ししない。日本語 title を伴う作成は、ASCII 仮 title + `--body-file` による作成後、REST API PATCH（title 修正標準手続き）により日本語 title を設定する2段階シーケンス、または `gh api --input` による統一を標準とする
      - 既存の `--title` inline 禁止・REST API PATCH 標準の規則（Windows 環境固有手続き 項目1〜2）は存置し、本節は適用範囲を拡張する

      ### 委譲時の一時ファイル代替配置先

      - 実行担当サブエージェント委譲など、worktree 隔離境界により `.agentdev/**` への書き込みが禁止される場面では、WRITE 標準手続きの一時ファイル配置先をリポジトリ外の一時領域（`$env:TEMP` 配下）とする
      - 代替配置時も create → gh 実行 → VERIFY → cleanup の1手順ユニットと cleanup 省略不可ステップを維持する
      - 委譲プロンプトの MUST NOT（`.agentdev/**` 全域を触らない）側は変更しない

      ### 理由

      既定の Shift-JIS コンソール（`chcp 932`）では、gh CLI が `--title` の日本語引数やメタデータを Shift-JIS として扱い、`--body-file` で UTF-8 BOM なしファイルを指定しても mojibake が発生する。3行はそれぞれ独立した役割（gh CLI の標準出力/ 標準エラー読み取りエンコーディング、PowerShell からネイティブコマンドへのパイプ渡しエンコーディング、コンソールコードページ）を持つため省略不可。git CLI 直接操作も同一のコードページ依存を持つため、WRITE 全経路へ適用を拡張する。

      ### 委譲基盤との関係

      gh WRITE 操作を行う全 command/ skill（case-open、case-run、case-close、case-update 等）は `agentdev-gh-cli` 手続き（Section 2 標準手順）経由で Step 0 の恩恵を受ける（REQ-011-001/006/007）。command/ skill 側での個別実装は不要であり、委譲基盤が本要件を一括して担保する。

      ### ローカル版の扱い

      ローカル版は Case ファイル読み書きへ差し替えられるため、gh CLI 系の本要件は対象外である。git CLI 直接操作の初期化要件はローカル版にも適用する（ローカル版も git 操作を行うため）。
  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-workflow-templates.md
    target_area: "## test strategy 記述ガイドライン（AG-006）"
    source_items: [AG-012]
    content: |
      ## test strategy 記述ガイドライン（AG-006）

      issue_desc_*.md テンプレートの「テスト戦略」セクションに記述する pass_criteria は QG-4 評価で REQ content と照合される。記述品質のばらつきが QG-4 時に顕在化するため、以下を共通ガイドラインとして正規所有する。

      ### 共通 pass_criteria のリスクと REQ 個別期待値推奨

      複数 REQ へまたがる共通の pass_criteria を起票する場合、各 REQ の pipeline stage（promote 系、review 系等）の違いを吸収せず、単一の文字列一致を要求すると QG-4 評価時に REQ content と pass_criteria 期待値が食い違う。Issue #1760 QG-4 で REQ-0129-012 を含む完了条件が REQ content と文字列一致せず、意味合致評価で処理された実績がある。共通化は避け、REQ 単位の個別期待値を pass_criteria へ記述することを推奨する。

      ### 変更対象外 REQ 検証の正しい表現

      「変更対象外 REQ の変更がないこと」を検証する場合は「存在しないこと」と書かず「diff がないこと」として表現する。実在する REQ を「存在しないこと」と記述すると検証意図と検証方法がずれる。Issue #1760 TS-003 で「REQ-0147-010 が存在しないこと」と誤表現し、REQ-0147-010 は存在する（変更なし）ため正しい検証意図は「変更されていないこと」だった。

      ### 存在確認の使用条件

      「存在しないこと」は新規作成禁止（例: 「REQ-0164 が存在しないこと」等の未作成確認）の場合のみ使用する。既存 REQ への変更有無の検証には使用しない。

      ### テンプレートへのガイド反映

      feature、bug、child の各 issue_desc テンプレートは「テスト戦略」セクションへ本ガイドラインの要点を HTML コメントとして埋め込む。起票者が pass_criteria を記述する際に参照できるようにする。epic テンプレートは「テスト戦略」セクションを持たないため対象外とする。

      ### 構造変更 PR の完了条件と契約テスト期待値

      - 構造変更（command、skill、template の構造様式変更）を伴う PR の完了条件には、当該構造を固定する契約テストの期待値更新を明示的に含める
      - 本文圧縮・機械的リライトの実施前には、当該ファイルを参照する `*.test.ts` を grep し、期待値に埋め込まれた固定トークン（原文断片）の有無を確認する手順を thin 化手順へ組み込む
      - PR テンプレートの完了条件セクションに、本確認の実施有無を記録する欄を設ける
  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target: docs/specs/authoring/command-file-format.md
    target_area: "## 手順セクション形式"
    source_items: [AG-020]
    content: |
      ## 手順セクション形式

      `## 手順` 配下の Step 構造は以下の形式に従う。

      | 項目 | 規約 | 禁止形式 |
      |------|------|----------|
      | Step 見出し | `### Step N: タイトル` | - |
      | Step 番号開始値 | `1` から開始 | `0`（`Step 0`） |
      | サブステップ | `Step N-M`（N は親 Step 番号、M は `1` から開始） | ゼロ起点（`Step N-0`） |
      | 主手順表現 | `### Step N` 見出しによる構造化 | numbered list（`1.` `2.` ...）による主手順 |
      | フェーズ見出し | `## 手順` 配下に配置しない | `## 手順` 内での別軸フェーズ見出しの混在 |
      | 代替フロー内サブステップ | `**EN.**`（大文字英字 + 連番、ボールド段落プレフィックス）。後述「代替フロー内サブステップ表現」参照 | `### Step N` 見出しによる代替フロー構造化（主手順の Step 番号連番を乱すため禁止） |

      ### workflow 節の順序ラベル様式

      thin Command の workflow 節に置く順序ラベルは `### Step N` 見出し形式に統一する。Workflow Skill 本文（SKILL.md、references/）の工程識別子は実番号形式（`STEP-1` 等）を用い、Command 定義の順序ラベルとは形式を区別して使い分ける。`STEP-{N}` のマスク形式と `工程-N` 形式は新規記述に使用せず、既存の当該表記は実番号形式へ更新する。
  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target: docs/specs/local/runtime-package-boundary.md
    target_area: "## 4 種のリポジトリ種別（Repo Type）"
    source_items: [AG-021]
    content: |
      ## 4 種のリポジトリ種別（Repo Type）

      > plugin/npm/package 配布形態は現在未対応である（REQ-002-064 参照）。
      > REQ-009-006 は5種のリポジトリ種別として将来対応の `plugin-future` を含めて定義する。本 SPEC の4種表は現行実装済みの種別のみを扱い、`plugin-future` は将来対応の第5種として本表から除外する。REQ と本 SPEC の種別数の差は対応時期の違いによるものであり、矛盾ではない。`plugin-future` の実装時に本表へ行を追加する。

      | Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
      |---------|------|------|---------------------|--------|
      | `self-hosting` | AgentDevFlow 本体開発リポジトリ | 原本と配置先が同一リポジトリに存在 | 実行時配置先（ジャンクション → `src/opencode/`） | `agent-dev-flow` |
      | `consumer-with-agentdev` | AgentDevFlow 導入製品リポジトリ | AgentDevFlow 提供 skill/command を利用 | プロジェクトローカルカスタマイズ入口 + AgentDevFlow 実行時位置 | 各種製品開発リポジトリ |
      | `consumer-local` | 非 AgentDevFlow OpenCode プロジェクト | 独自 command/skill のみ | プロジェクトローカルカスタマイズ専用 | 実験的リポジトリ |
      | `consumer-generated` | ローカル版 OpenCode 導入リポジトリ | ローカル版 OpenCode を導入する利用側リポジトリ | link mode による AgentDevFlow 実行時位置（`agentdev-gh-cli` のみ `src/opencode-local/` から接続） | 個人利用環境のローカルリポジトリ |

      `consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009, REQ-009, REQ-009）。
      `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（`agentdev-gh-cli` 以外）を `src/opencode/` 配下へ接続し、`.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する。
      詳細は本 SPEC の「link mode 接続手順技術詳細」を参照する。
  - id: ACT-SPEC-013
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-skill-authoring.md
    target_area: "## 検証観点"
    source_items: [AG-016]
    content: |
      ## 検証観点

      - 行数制限（500行上限、400行超で `references/` 推奨）
      - トークン予算
      - トリガー精度（USE FOR / DO NOT USE FOR）
      - 構造チェック
      - アンチパターン検出
      - 参照先実ファイル存在確認（skill 本文から `references/`、`scripts/`、`templates/` 等へのパス参照が実ファイルを指すこと。参照のみが存在し実ファイルが不存在する状態を査読で検出する）
  - id: ACT-SPEC-014
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-command-authoring.md
    target_area: "## 検証観点"
    source_items: [AG-016]
    content: |
      ## 検証観点

      - DoD 項目の充足
      - Frontmatter 純粋性（`description` 単一）
      - 行数（150行上限）
      - 参照先実ファイル存在確認（command 本文から workflow 節・テンプレート・完了一覧等へのパス参照が実ファイルを指すこと。参照のみが存在し実ファイルが不存在する状態を査読で検出する）
  - id: ACT-SPEC-015
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-doc-diagnostics.md
    target_area: "## 提供する判断・操作"
    source_items: [AG-018]
    content: |
      ## 提供する判断・操作

      - docs 横断診断カテゴリの定義（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反、REQ 粒度過小 等）
      - 診断判定規則と証拠構造
      - 共通 finding 出力契約（`.agentdev/inspect/inbox/*.md`、severity 分類、信頼度）
      - 文書種別別診断へのルーティング表
      - inspect-docs command への診断カテゴリ、証拠、finding 形式の提供

      ### 観点レジストリ

      inspect-docs の診断観点は正規の観点レジストリが所有する（REQ-028-014）。

      - **配置先**: `docs/specs/skills/agentdev-doc-diagnostics/references/perspective-registry.md`（本 SPEC の references 配下）
      - **schema**: 各観点エントリは観点ID（一意）、診断カテゴリ（SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT、残余参照、境界違反等）、適用文書種別、正規所有者 skill、詳細参照の項目を持つ
      - 移管対応表（integrity-rule-catalog.md の inspect-docs 移管記録）で名指しされた観点は当該レジストリへ登録する
      - レジストリの追加・変更は本 schema に従い、本 SPEC が schema の正規所有者となる
  - id: ACT-SPEC-016
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-skill-model.md
    target_area: "## Command 責務"
    source_items: [AG-020]
    content: |
      ## Command 責務

      公開interface（入出力契約・ガードレール）、workflow dispatch。workflow 実装本体は所有しない。

      ### thin Command の workflow 節標準構造

      thin Command の workflow 節は次の3要素で構成する。

      1. Workflow Skill 名レベルの dispatch 宣言（委譲先 Workflow Skill 名と委譲範囲の宣言。内部構造（STEP ID、reference パス）への直接依存を持たない）
      2. 公開順序の要約（順序ラベル付きの見出し群。Workflow Skill 内部手順の複製ではなく、公開interface としての順序提示）
      3. soft guard 宣言（Workflow Skill の単独起動防止宣言。後述「soft guard の二層様式」）

      thin Command の workflow 節の順序ラベルは `### Step N` 形式に統一する。Workflow Skill 本文（SKILL.md、references/）の工程識別子は実番号形式（`STEP-1` 等）を用い、Command 定義の順序ラベルとは形式を区別して使い分ける。様式の統一基準、記述量の基準といった執筆詳細は `authoring/command-file-format.md` が正規所有し、本節は workflows 側の構成契約のみを記録する。
# 衝突解消記録（壁打ちで解消済み。後続コマンドは同じ内容を再確認しない）
conflict_resolutions:
  - id: CR-001
    conflict: RU-0001（横断監査の傘RU）と RU-0002〜0017（具象是正）の重複による二重計上リスク
    resolution: |
      案A（ユーザー承認済み）を採用。RU-0001 の14テーマは既存正規所有者 REQ へ分配し、具象 RU 側の具体性を
      優先して RU-0001 側は契約条文レベルに抽象化する。真のギャップ（検証完了判定契約）のみ REQ-007 append として
      新規要件化する。RU-0001 を新規単一 REQ として CREATE しない（既存正規所有者との競合を RU-0001 本文自体が警告）。
  - id: CR-002
    conflict: RU-0009 の templates/case-open/ 3テンプレートを新規作成するか、参照側（termination-and-cleanup.md）を実態合わせ修正するか
    resolution: |
      テンプレート新規作成（実体化）を採用。termination-and-cleanup.md の参照が設計意図であり、templates/req-define/
      と対称の構成ですでに参照が存在する。参照削除は完了報告テンプレート機能を失う。
  - id: CR-003
    conflict: RU-0013 の gh-cli WRITE 一時ファイル（.agentdev/tmp/）と case-run 委譲 MUST NOT（.agentdev/** 全域禁止）の契約衝突
    resolution: |
      WRITE 標準手続き側に委譲時の代替配置先（リポジトリ外 TEMP）を追記する側を採用。MUST NOT は worktree 隔離の
      安全境界なので弱めない。PR #2132 の運用実績と一致する。
  - id: CR-004
    conflict: RU-0012 の superseded 孤児 SPEC（inspect-extensions.md）の保持ポリシー（(a) 歴史参照残置明文化 / (b) アーカイブ運用導入）
    resolution: |
      (a) 歴史参照残置を採用。現行 document-model.md 規定（superseded は元位置を維持し superseded_by で後継を示す）
      が (a) と整合するため、新規運用は導入せず現行規定の適用確認のみとする。孤児の検出は inspect-docs 診断で担保する。
  - id: CR-005
    conflict: RU-0015 の順序ラベル様式3変種（### Step N / STEP-I / 工程-I）を統一するか使い分けを許容するか
    resolution: |
      使い分け基準を採用。Command の workflow 節は「### Step N」へ統一、Workflow Skill 本文の工程識別子は実番号形式
      （STEP-1 等）とする。基準は authoring/command-file-format.md（ACT-SPEC-011）と workflow-skill-model SPEC
      （ACT-SPEC-002）へ規定し、既存3変種は統一基準へ更新する。
  - id: CR-006
    conflict: RU-0016 F-10 の REQ-009-006（リポジトリ種別5種列挙）を SPEC へ移送するか REQ 残置するか
    resolution: |
      残置（安定契約例外）を採用（経路A adversarial-review の finding を反映）。「利用者に見える分類体系」は
      req-health-metrics・document-type-responsibilities が明記する安定契約例外に該当する。REQ 5種と SPEC 4種表の
      整合ギャップは runtime-package-boundary SPEC へ plugin-future の位置づけ注記を追加して解消する（ACT-SPEC-012）。
  - id: CR-007
    conflict: RU-0017（REQ 体系構造協議）を本次是正に含めるか分離するか
    resolution: |
      分離を採用。RU-0017 は RU 残置とし、是正完了後の独立 req-define で協議する。構造再編（SPLIT/MERGE/RETIRE）を
      本次是正と同一ケースで実施すると是正対象の要件行 ID が再編でずれ相互干渉する。次第の土台を AG-022 に記録した。

# 実装構成単位（definition 側は artifact_actions が網羅。本 OU 群は src/**・tests の実装是正単位）
operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      検査・索引ツールの移行追随是正（RU-0002 実装順序1〜3）。generate_indexes.ts の ADR README 処理を
      docs/decisions/README.md（decision-* block ID）更新または対象ファイル不存在時スキップへ変更、
      check_autogen_freshness.ts の docmap-inventory block 検査を除去、AUTOGEN 再生成で4件の不整合と
      4 SPEC の陳腐化を解消する。対象: scripts（repo-agentdev-integrity 配下）。
  - ou_id: OU-002
    source_ru: RU-0003
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
    notes: |
      既存 broken reference 一掃と check_integrity NG=21 詳細分類（RU-0003）。21件全件の由来分類
      （legacy / superseded / AUTOGEN / 実欠陥）と分類に応じた解消。index-generation-consistency 系4件は
      OU-001 の AUTOGEN 再生成結果を参照するため必須依存（再生成結果なくして由来分類は検証不能）。
  - ou_id: OU-003
    source_ru: RU-0002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      e2e 期待値更新と pre-existing failure 是正（RU-0002 実装順序4〜5）。commands_e2e.test.ts の
      「ADR README.md exists」期待値を docs/decisions/README.md へ更新（検査は廃止しない）、
      REQ-0030-009/010/011 の pre-existing failure 3件を是正する。対象: tests。
  - ou_id: OU-004
    source_ru: RU-0004
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      worktree 環境依存解消と guard 実装（RU-0004 方向1〜2、AG-007 の実装側、AG-014 の反映側）。
      lint_skills.ts へ src/ フォールバック実装、check_templates.ts へ worktree 空洞化検知時の warning/skip 実装、
      targeted docs guard（check_changed_docs.ts）へ frontmatter・配置ディレクトリによる SPEC 判定実装、
      USAGE 文言と guard 実行手続 references へ実行契約（モード使い分け・引数形式）を反映。対象: scripts、references。
  - ou_id: OU-005
    source_ru: RU-0006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      検証規則の単一実装化（RU-0006 方向1・3の実装側）。commands_error_cases.test.ts 内蔵 validateCommand を廃止し
      配布 checker 規則から期待値を単一化、thin 化手続 references へ grep 確認手順を組み込み、完了条件テンプレートへ
      期待値更新の明示を反映。対象: tests、skill references、templates。
  - ou_id: OU-006
    source_ru: RU-0008
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      gh/git CLI エンコーディング初期化の全経路適用（RU-0008、RU-0013、AG-015 の実装側）。
      agentdev-gh-cli references/standard-procedures.md へ (1) git CLI 直接 WRITE の初期化必須前置、
      (2) title と --body-file 同時渡し回避の2段階シーケンス、(3) READ パイプラインの [Console]::OutputEncoding 前置、
      (4) 委譲時の代替一時ファイル配置先（リポジトリ外 TEMP）を追記。ローカル版（src/opencode-local/）と
      通常版の参照先分離に注意。対象: skill references（通常版・ローカル版）。
  - ou_id: OU-007
    source_ru: RU-0009
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      配布物形式・参照契約の突合機構（RU-0009 の実装側）。templates/case-open/ 3テンプレート
      （standard、epic、multi-req-epic）新規作成、Parent 配置と Epic 追跡テーブル形式の一元化
      （agentdev-epic-tracker と case-open テンプレート群の整合）、「パス参照 → 実ファイル存在」検査 checker の追加
      （新規 IR 登録 gate REQ-028-012 準拠、detector・回帰テスト・正常/異常 fixture を同一ケースで整備）。
      対象: templates、scripts、新規 IR。
  - ou_id: OU-008
    source_ru: RU-0011
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      agentdev-doc-diagnostics 旧手順番号参照の decoupling（RU-0011 実質残存課題）。
      references/diagnostic-routing.md の「Step 2〜Step 8」表と references/diagnostic-categories.md の
      「inspect-docs Step 11、inspect-skills Step 3」記述を Workflow Skill の工程名・節名参照へ置換。
      対象: skill references。
  - ou_id: OU-009
    source_ru: RU-0012
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
    notes: |
      docs・配布物の陳腐化表記・参照の横断是正（RU-0012 機械是正5項目）。
      (1) 5 SPEC の「（REQ-001, REQ-001）」引用重複解消、(2) 一文一行機械判定違反とテーブルセルプレースホルダ残存の
      対象ファイル固定横断是正（対象リストは実行時機械判定で確定）、(3) req-impact-map.md の「REQ-004-053〜055」行更新、
      (4) intake-capture.md G06 のスキル表記修正、(5) patterns.md の REQ 件数記述を README 参照へ寄せIR-042/IR-018
      の非検出理由確認。docs 全域に触れるため Wave 後半推奨（マージ競合回避）。対象: docs/**、配布 command。
  - ou_id: OU-010
    source_ru: RU-0014
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    notes: |
      配布物の書式統一（RU-0014、RU-0015 の実装側）。check/install スクリプトの案内文言・既定 URL 定数の共有化、
      agentdev-workflow-case-open / case-auto の SKILL.md と references/ の STEP 識別子をマスク形式から実番号へ統一。
      対象: scripts（PowerShell）、workflow skill 本体・references。
# 検証戦略（各項目は検証手順・合格基準・不合格時処置の3要素を必須とする）
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      generate_indexes.ts を dry-run で実行し、docs/decisions/README.md の decision-* AUTOGEN block
      更新と docs/adr/README.md 不在時の非エラー挙動を確認する。check_autogen_freshness.ts を実行し、
      docmap-inventory 起因の EXIT 1 が解消されていることと stale blocks 0 件を確認する。
      既知4件のブロック不整合と4 SPEC の陳腐化について再生成後の差分を確認する。
    pass_criteria: |
      generate_indexes.ts が docs/adr/README.md 不在時もエラー停止せず decision-* block を更新すること。
      check_autogen_freshness.ts が EXIT 0 を返し stale blocks が 0 件となること。
      4件の不整合と4 SPEC の陳腐化が再生成後に解消していること。
    on_failure: |
      fix-and-reverify。スクリプト修正後に再生成・再検査を実施する。adrs 由来の残余参照は OU-002 の
      由来分類へ回して処理する。
  - id: TS-002
    target_item: AG-003
    verification: |
      bun test で commands_e2e.test.ts を実行し、REQ-0030-009/010/011 起因の3テストが
      docs/decisions/README.md 期待値で pass することを main baseline と worktree の双方で確認する。
    pass_criteria: |
      当該3テストが双方の環境で pass すること。検査廃止ではなく期待値更新として存続していること
      （ADR README exists 相当の索引存在検証が decisions README に対して機能すること）。
    on_failure: |
      fix-and-reverify。期待値を docs/decisions/README.md へ合わせて修正し再実行する。
      検査の意義が崩れる場合は手順を文書化のうえ処置を再協議する。
  - id: TS-003
    target_item: AG-005
    verification: |
      check_integrity.ts を --json で実行し、NG=21 全件に由来ラベル（legacy / superseded / AUTOGEN / 実欠陥）を
      付けた分類表を作成する。分類に応じた解消（リンク修正、参照更新、再生成結果確認）後、再実行する。
    pass_criteria: |
      21件全件に由来分類が付き、実欠陥分類の修正後に新規かつ未管理の NG が 0 件となること
      （残存は承認済み baseline entry または解消済み）。
    on_failure: |
      fix-and-reverify。解消不能な既知欠陥は provenance・reason を付与した承認済み baseline entry とし、
      再実行で新規 NG 0 件を確認する。
  - id: TS-004
    target_item: AG-006
    verification: |
      worktree 環境（junction 未伝播）と main 環境の双方で lint_skills.ts 関連テストと
      check_templates.ts dry-run 系テスト3件を実行する。
    pass_criteria: |
      両環境で環境依存の失敗なくテストが pass すること（worktree 空洞化時は warning/skip が報告されること）。
      新規失敗との判別が自動化されていること。
    on_failure: |
      fix-and-reverify。src/ フォールバック基準へパス解決を修正し、両環境で再実行する。
  - id: TS-005
    target_item: AG-007
    verification: |
      非 SPEC ファイル（baseline snapshot 等）を含む変更ファイル指定で targeted docs guard を実行する。
      frontmatter・配置ディレクトリによる SPEC 判定の正常/異常 fixture を実行する。
    pass_criteria: |
      非 SPEC ファイルに対する spec_readme_update_required 誤検出が 0 件となること。
      fixture で判定境界が意図どおり動作すること。
    on_failure: |
      fix-and-reverify。SPEC 判定実装を修正し、fixture を更新して再実行する。
  - id: TS-006
    target_item: [AG-008, AG-009]
    verification: |
      req-save 後の targeted docs guard で REQ-007 追記行と quality-gates SPEC QG-4 節の保存を検証する。
      受入れ基準の用語（由来分類、検証環境、baseline commit 基準）が REQ と SPEC で一致することを確認する。
    pass_criteria: |
      REQ-007-006〜009 が保存され、QG-4 節に受入れ基準が追記され、両者の用語が一致すること。
      RuntimeReference baseline 節に再生成分実行契約が追記されていること。
    on_failure: |
      fix-and-reverify。用語不一致は定義側（REQ/SPEC）を揃えて再検証する。
  - id: TS-007
    target_item: [AG-010, AG-011]
    verification: |
      commands_error_cases.test.ts へ grep で内蔵 validateCommand の残存がないことを確認し、
      bun test で当該テスト群を実行する。
    pass_criteria: |
      内蔵 validateCommand が削除され、期待値が配布 checker（command-format-rules.yaml）由来で
      全テストが pass すること。
    on_failure: |
      fix-and-reverify。checker 規則からの期待値導出へ修正して再実行する。
  - id: TS-008
    target_item: AG-015
    verification: |
      agentdev-gh-cli references/standard-procedures.md の更新内容（git CLI 直接 WRITE の初期化前置、
      title 同時渡し回避シーケンス、READ パイプライン前置、委譲時代替配置先）を手順書レビューで確認する。
      通常版とローカル版（src/opencode-local/）の参照先整合を確認する。
    pass_criteria: |
      (1)〜(4) の拡張が手順書から読み取れること。既存の --title inline 禁止・REST API PATCH 標準規則が
      存置されていること。両版の参照先整合が取れていること。
    on_failure: |
      fix-and-reverify。手順書の記載漏れを補い、両版の再確認をする。
  - id: TS-009
    target_item: AG-016
    verification: |
      templates/case-open/ の3ファイル存在を確認する。パス参照→実ファイル存在検査 checker を
      正常/異常 fixture で実行する。新規 IR 登録 gate の8項目整備状況を確認する。
    pass_criteria: |
      3テンプレートが存在し termination-and-cleanup.md の参照が解決すること。
      checker が異常 fixture（存在しない参照）を検出し、正常 fixture で pass すること。
      detector・回帰テスト・実行経路・finding 経路が整備されていること。
    on_failure: |
      fix-and-reverify。テンプレート不足は追加作成、checker 誤検出は fixture 更新のうえ再実行する。
  - id: TS-010
    target_item: AG-019
    verification: |
      5 SPEC へ「（REQ-001, REQ-001）」パターンの再検索（grep）を実行する。一文一行機械判定を再実行する。
      req-impact-map.md・patterns.md・intake-capture.md の該当箇所修正後の状態を確認する。
    pass_criteria: |
      引用重複パターンが 0 件となること。対象ファイル確定分の機械判定違反残が 0 件となること。
      「REQ-004-053〜055」dangling 行が解消していること。patterns.md の件数記述が README 参照へ寄せられ、
      IR-042/IR-018 の非検出理由確認が記録されていること。
    on_failure: |
      fix-and-reverify。横断再検索で同種残存を発見した場合（REQ-007-001 準拠）は対象範囲を妥当な範囲で
      拡大して修正し、再検索で 0 件を確認する。
  - id: TS-011
    target_item: AG-021
    verification: |
      req-save 後の targeted docs guard で REQ-001-057/058、REQ-012-003、REQ-009-027〜030 の更新を検証する。
      抽象化本文と移送先 SPEC（decision-guidelines、artifact-graph、local-case-file）の既存カタログ記載を突合する。
    pass_criteria: |
      3 REQ の抽象化が保存され、具体的一覧のカタログ二重定義が解消していること。
      REQ と移送先 SPEC の内容が過不足なく一致すること。
    on_failure: |
      fix-and-reverify。不一致は移送先 SPEC 本文を正として REQ 側抽象化を調整し再検証する。
  - id: TS-012
    target_item: [AG-013, AG-020]
    verification: |
      workflow-skill-model SPEC の機械分類表と check_extensions.ts 実装規則を突合する。
      project-extensions SPEC の共有実装節と実装構成を突合する。
      agentdev-workflow-case-open / case-auto の SKILL.md・references へ STEP 識別子のマスク形式（STEP-{N}）を grep する。
    pass_criteria: |
      分類表と checker 実装の規則が一致すること。共有実装の正規化が実装構成と一致すること。
      マスク形式記述が 0 件となること。workflow-skill-model SPEC の Command 責務節から3様式存在の旧記述が
      除去されていること。check/install スクリプトの定数共有化後、単一定義参照が機能すること。
    on_failure: |
      fix-and-reverify。表または実装のいずれかを正へ揃え、再突合する。

# レビュー判断証跡（req-define 生成時点。case-open が commit SHA を記録する）
review_dispositions:
  - id: RD-001
    source_ru: RU-0010
    source_item: skill-category-table-7-ir-reflection
    disposition: not_applicable
    reason_code: already_satisfied
    reason: |
      7 IR detector の category 表反映漏れとされたが、現行は IR エントリ一覧が generate_indexes.ts による
      自動生成方式へ再設計済みで、SKILL.md に IR 個別 category 表は存在しない（backlog-review 経路E 現行検証済み）。
    evidence:
      path: .opencode/skills/repo-agentdev-integrity
      section: integrity-rule-catalog.md（IR エントリ一覧）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0011
    source_item: doc-diagnostics-deleted-doc-map-mention
    disposition: not_applicable
    reason_code: already_satisfied
    reason: agentdev-doc-diagnostics 配下（SKILL.md + references 全ファイル）に doc-map / docmap 文字列が存在しない（grep 0 件、経路E 検証済み）。
    evidence:
      path: src/opencode/skills/agentdev-doc-diagnostics
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0011
    source_item: doc-diagnostics-traversal-order-delegation-ambiguity
    disposition: not_applicable
    reason_code: already_satisfied
    reason: 現行 SKILL.md の該当行は「各専門 skill へルーティング」と「探索順序の詳細は README 群が担う」で統一されており、委譲先表記の不一致は存在しない（経路E 検証済み）。
    evidence:
      path: src/opencode/skills/agentdev-doc-diagnostics/SKILL.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0012
    source_item: fifteen-command-count-staleness
    disposition: not_applicable
    reason_code: already_satisfied
    reason: 全域に「15 command」記述は存在せず（grep 0 件）、artifact-responsibilities.md は「16 の agentdev command」に修正済み（経路E 検証済み）。
    evidence:
      path: docs/specs/responsibilities/artifact-responsibilities.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0012
    source_item: project-extensions-spec-old-contract
    disposition: not_applicable
    reason_code: already_satisfied
    reason: docs/specs/skills/agentdev-project-extensions.md は現行の新3種 kind・5状態分類・fail-open / migration-required で記述されており旧配置・旧分類の記述は存在しない（経路E 検証済み）。
    evidence:
      path: docs/specs/skills/agentdev-project-extensions.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0012
    source_item: inspect-skills-spec-workflow-authority-unapplied
    disposition: not_applicable
    reason_code: already_satisfied
    reason: docs/specs/commands/inspect-skills.md に他 command SPEC と同形式の Workflow Skill（agentdev-workflow-inspect-skills）権威宣言が適用済み（経路E 検証済み）。
    evidence:
      path: docs/specs/commands/inspect-skills.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0015
    source_item: workflow-skills-internal-extension-naming-drift
    disposition: not_applicable
    reason_code: already_satisfied
    reason: 現行の workflow skills の extension 読込節はフラットパス（workflow-extension）と internal.yaml（internal-workflow-extension）を正しく区別した表記になっており、指摘された呼称ゆれは存在しない（backlog-review 生成時再検証済み）。
    evidence:
      path: src/opencode/skills
      section: 各 Workflow Skill extension 読込節
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0017
    source_item: "F-13/F-14（REQ-010 SPLIT、Artifact Graph 系 MERGE/RETIRE）"
    disposition: not_applicable
    reason_code: out_of_scope_deferred
    reason: |
      構造再編（SPLIT/MERGE/RETIRE）を本次是正と同一ケースで実施すると是正対象の要件行 ID が再編でずれ
      相互干渉するため、RU を残置し是正完了後の独立 req-define で協議する（AG-022、CR-007）。
      次第の土台（REQ-010 は SPLIT シグナル3・配布境界2分割候補、REQ-013 RETIRE 候補、REQ-022/023/024 の
      REQ-012/020 集約候補、REQ-021 維持）は AG-022 に記録済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0017.md
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0016
    source_item: "統合単位1（F-04〜F-12）移送分"
    disposition: covered
    reason_code: spec_separation_transfer
    reason: |
      F-04/F-05 → ACT-REQ-004（REQ-001-057/058 の抽象化、カタログは decision-guidelines SPEC が正規所有）、
      F-08 → ACT-REQ-005（REQ-012-003 の抽象化、一覧は artifact-graph SPEC が所有）、
      F-09 → ACT-REQ-006（REQ-009-027〜030 の抽象化、詳細は local-case-file SPEC が所有）。
    evidence:
      path: docs/specs/skills/agentdev-decision-guidelines.md
      section: accepted Decision の更新規則
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0016
    source_item: "統合単位1（F-04〜F-12）残置分"
    disposition: covered
    reason_code: stable_contract_exception
    reason: |
      F-06（Extension 3種）、F-07（work_type 4値・command 5分類）、F-10（安全境界・リポジトリ種別5種）、
      F-11（agentdev_handoff 意味論）、F-12（停止伝播原則）は安定契約例外（利用者可視の分類体系・安全境界・
      停止条件の大枠・後続工程が依存する安定外部契約）として REQ 残置を明確化した（AG-021）。
      F-10 の REQ 5種と SPEC 4種表の整合ギャップは ACT-SPEC-012 の注記で解消する。
    evidence:
      path: docs/specs/quality/req-health-metrics.md
      section: 安定契約例外の扱い
      checked_at_commit: null
    related_removed_items: []

# case-open 構成参考（Issue 階層の決定権は case-open にある）
case_open_hints:
  epic_needed: true
  decomposition: |
    definition 側（artifact_actions: REQ 6 + SPEC 16）は req-save / spec-save が一括処理する。
    実装側は OU-001〜OU-010 を Issue 構成の素材とする。OU 間の分割・統合（scripts、tests、templates、
    skill references、docs の artifact 種別ごとのまとまり）の最終判断は case-open の execution_unit 構成に委ねる。
  wave_hints:
    - "OU-002 は OU-001 の AUTOGEN 再生成結果に必須依存（depends_on 設定済み）。同一直列チェーンで構成する"
    - "OU-009（docs 全域横断是正）は他 OU の docs 変更と競合するため Wave 後半を推奨"
    - "OU-001/003〜008/010 は相互独立のため並列化可能"
````

# summary

17 RU（横断監査の session由来RU RU-0001 + backlog-review 生成 RU-0002〜0017）を一括処理し、
正規契約（REQ 6 action・SPEC 16 action）の確定と実装是正（OU 10件）で横断整合性を回復する。
RU-0017（REQ 体系構造協議）のみ対象外とし RU 残置、是正完了後の独立 req-define で協議する。
