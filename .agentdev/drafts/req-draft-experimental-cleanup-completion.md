---
draft_type: req_draft
topic_slug: experimental-cleanup-completion
status: draft
created_at: 2026-11-18T07:15:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  完了済み Epic #4126（実験前提の3原則採用とレガシー資産一括整理・2026-11-18 closed）に対する独立検査で発見された未達5項目を、元の利用者指示（req-input-experimental-cleanup-20261117.md の計画全文）の未完了是正として解消する。（1）.agentdev/jev-observations/ の JSON 5件（タスク開始前2件＋Epic 実行中生成3件）と本 Case 実行中の再生成分を最終検査時点まで処分し .gitkeep のみの状態にする。（2）撤廃済み baseline 機構・削除済み IR-065/066・data・節名改名への残存参照を、repo-local 正本（vocabulary-registry.md・SKILL.md）と Design 6ファイル（integrity-contracts・IR-073 ルール文書・req-impact-map・authoring/vocabulary-registry・case-run・case-close）で実装に合わせて解消する。（3）check_extensions.ts に残存する ng-baseline の読込・免除（demotion）・--update-ng-baseline 再生成・書込の全経路（空配列フォールバックではなく機構自体）とテスト3ブロック・cli_utils.ts ヘルプ2行・tsconfig include の削除済み lib 2ファイル参照を撤去し検証する。（4）トレーサビリティ検査の残存違反（missing-implementation 21行・missing-verification 18行・うち Design 削除起因6行）を行ごとに実体と照合して実体宣言で直接解消し、Issue #4132 本文の REQ-117 系件数誤記（15行→実測13行）を訂正する。（5）generate_indexes・check_autogen_freshness・check_integrity・トレーサビリティ検査・bun test 全対象を再実行して全件 exit 0 とし、削除・改名件数・簡素化したルール・検査結果・残存問題を報告する。完了済み Epic は再開せず、新規 Case として正規入口から処理する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      実行証跡の指定最終状態化。.agentdev/jev-observations/ 配下の JSON 5件（20261117T131543Z-6e6a・20261117T132114Z-0cdb・20261117T155022Z-37a8・20261117T155148Z-2795・20261117T155215Z-c951）を削除し、.gitkeep のみを残す。元の計画 Phase 2.1 は「全 JSON ファイルを削除し、.gitkeep を配置」を明示しており、5件の残存はその未達である。本 Case の ADF 実行自体が再生成する観測（本 req-define 実行で生成済みの 20261117T214837Z-ba04、および case-ready の Epic/Wave 構成判断 Jev 評価由来分を含む）は、最後の検査時点（本 Case の最終 check_integrity 実行直前）まで扱いを追跡し、その時点で全 *.json を処分して実際の状態（.gitkeep のみ）を確認する。残存を隠さず、処分した再生成分の実数を完了報告に記録する。REQ-090-006 の恒久契約（保存先・形式・削除条件なし）は変更せず、本処分は利用者が2度（元計画と今回入力）明示指示した一回限りの処分として実行する（CR-001 参照）。
  - id: AG-002
    content: |
      撤廃済み機構・削除済み実体への参照残存一掃（元の計画 Phase 3.3・4.1〜4.3 の未達、入力項目2・5）。対象は次のとおり。（a）repo-local 正本 .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md: 358行の前置確認運用（retired REQ-057 の行 REQ-057-024〔retired/REQ-057.md:40 に実在するが廃止済み要件行〕を現行運用の根拠として参照し、撤廃済み IR-055 baseline 再生成（--update-ir055-baseline）を指示する残存記述）の削除、360〜383行の IR-065/IR-066 対照節の現行化（削除済み check_integrity.ts 検出所有・data/obsolete-vocabulary-map.yaml 運用データ所有・削除済み rules/IR-065・IR-066 への現行参照を除去し、docs 側 authoring/vocabulary-registry.md 85行と同一の「対照表は語彙整備の正規対照として維持・旧語彙の出現は IR-055 と手動補完で扱う」方針へ整合。369行「既知 34 件は NG baseline 管理」の現行記述解消を含む）、280行 known finding 行の由来列・312行 baseline 行の根拠列（baseline_status は DEC-013 で現行 IR 属性から削除済み）の更新、388行「REQ-0108-055」表記の是正、392〜394行の参照先節名を現行見出し「work_type / scale / Epic / Wave の意味モデル」へ更新（行番号参照 L13-21 の除去を含む。ラベル「v4 概念語彙」自体は維持）。（b）.opencode/skills/repo-agentdev-integrity/SKILL.md: 73行（baseline 既知と新規区別・段階導入）・77行（既知違反は NG baseline（delta-aware））の撤廃済み機構記述の解消、208〜210行（新規カテゴリ追加判定の baseline_status・catalog エントリ 15 フィールド）を現行 catalog スキーマ（12 フィールド・baseline_status 削除済み）へ整合。（c）Design 6ファイルの修正（artifact_actions ACT-DESIGN-001〜006: integrity-contracts.md:507 の旧基準集合現行記述、rules/IR-073-untracked-residue.md の baseline 承認一覧機構の現行記述一式（description/detection_method の applyNgBaseline 参照含む/false_positive_risk/regression_test/triage_action/検査項目2・3・5/exemption 表）、req-impact-map.md:130・134 の integrity-contracts.md 削除済み節への dangling 参照、authoring/vocabulary-registry.md:76〜78 の旧節名参照、case-run.md の「baseline 既知 delta」区別運用2箇所、case-close.md:163 の同種記述）。（d）コメント類: check_integrity.ts:8036〜8039 の IR-065/066 を含むセクションヘッダーコメントの現行化（IR-063/064 のみに）、check_content_corruption.ts:160〜165 の削除済み IR-066 ルールファイルへの ALLOWED_USAGE エントリの削除、check_integrity.test.ts:2214〜2217・2660〜2666 の baseline 語彙（テスト名・コメント。動作は現行正）の更新。（e）旧節名参照「v4 意味モデル」: src/common/skills/agentdev-workflow-lifecycle/SKILL.md:27・45、src/common/skills/agentdev-workflow-case-ready/SKILL.md:130、同 references/execution-structure.md:4、docs/designs/workflows/references/execution-unit-construction.md:89 を現行見出しへ更新（src/common 側は投影同期を含む）。修正の判定基準は「撤廃済み baseline 機構（ng-baseline 読込・免除・--update-* 再生成・承認一覧・baseline_status）と削除済み IR-065/066・data・旧節名を現行として記述する箇所の解消」であり、撤廃表明文（vocabulary-registry.md:356・IR-073:50-52 等）・履歴記録（docs/reports・retired・req-impact-map 再配置表の日付付き履歴行・AUTOGEN 履歴）は対象外とする。REQ-057-024 の存在は retired/REQ-057.md:40 で実在確認済みであり、修正根拠は「retired REQ 行の現行運用根拠化と撤廃済み手続の残存」である（adversarial-review 争点4で訂正済み）。
  - id: AG-003
    content: |
      check_extensions.ts の baseline 機構完全撤去（元の計画 Phase 4.3 の未達、入力項目3）。空配列フォールバックではなく、免除の仕組みが再び働く経路を含めて機構自体を撤去する。対象: check_extensions.ts の baseline 読込系（145〜269行: NG_BASELINE_PATH・EXTENSIONS_BASELINE_CATEGORY・ExtensionsNgBaselineEntry/ExtensionsNgBaseline・normalizeExtBaselineFilePath・extBaselineKey・normalizeExtensionsNgBaselineEntry・loadExtensionsNgBaseline）、免除（demotion）適用系（117〜120行 CheckReport.ng_baseline・185〜192行 ExtensionsNgBaselineReport・285〜322行 ExtensionsFailureBucket/summarizeExtensionFailures・324〜387行 applyExtensionsNgBaseline・731〜736行 skipNgBaseline・1034〜1044行 baseline-aware pass）、--update-ng-baseline CLI 系（194〜209行 AdditionsManifest・389〜456行 loadExtensionsNgBaselineAdditions・458〜528行 updateExtensionsNgBaseline・1375〜1389行 arg 解析・1409〜1435行 updateBaseline 分岐）、書込系（271〜283行 writeExtensionsNgBaseline）、レポート出力系（1048行・1443〜1448行）。テスト: check_extensions.test.ts の baseline 直接検証3ブロック（49〜61行 separated baseline 不存在テスト〔baselines/ ディレクトリ消滅で陳腐化〕・134〜166行 extBaselineKey パス正規化・168〜279行 shared ng-baseline demotion contract）と 22行の extBaselineKey import を削除する。ファイル先頭の ADF-COVERS 宣言（REQ-002-030/031・REQ-044-001/002/005）は保持し、残存テスト（checkExtensions 統合・resolveExtensionState・runExtensionScenarios）が REQ-044-002/005 の検証を担い続けることを確認する（REQ-044-002/005 は traceability/policy.yaml の optional 登録済み）。cli_utils.ts:326〜327 の --update-ir055-baseline・--update-ng-baseline ヘルプ行（両フラグの実装は check_integrity.ts 側に不存在・check_extensions.ts 側は今回撤去で dead となる）を削除する。scripts/tsconfig.distribution-boundary.json の include から削除済み lib/distribution-boundary-baseline.ts・lib/distribution-boundary-exemptions.ts の2行を除去する。gate 呼出側（gate-execution.ts 4系統）に撤去フラグの参照がないことは実測済み（参照なし）であり、撤去後に念のため再確認する。検証: 対象テストの bun test・typecheck・check_distribution_boundary が緑であること。
  - id: AG-004
    content: |
      トレーサビリティ残存違反の実体解消と記録訂正（元の計画 Phase 5 の未達、入力項目4）。トレーサビリティ検査（bun run ./src/common/skills/agentdev-traceability/scripts/src/check.ts --root <repo root>）の実測違反（missing-implementation 21行: REQ-010-085・REQ-032-045・REQ-103-028・REQ-109-001/002/004/005/006・REQ-117-001〜005/007〜010/012〜015、missing-verification 18行: REQ-001-009・REQ-010-085・REQ-032-045・REQ-113-001/002・REQ-117 同一13行）を、行ごとに実体と要件を照合して原因を直接解消する。方法: （1）実体第一。各行の実装・検証を実際に担う既存実体（検査スクリプト、テスト、skills、AGENTS.md 3原則、design-principles.md「## 0. 実験前提の3原則」、case-run scripts の tsconfig.json/package.json 等）を特定し、sidecar（traceability/*.yaml）への宣言追加を原則とする。inline ADF-COVERS 追加は OU-002 が管轄するファイル（check_integrity.ts 等）への追記を避け、必要な場合は OU-002 確定後に行う。（2）宣言の実在性義務。実体のない対応宣言は行わない。宣言先パスの実在と、その実体が当該行を実装・検証していることを行ごとに確認してから宣言する。（3）免除の禁止と条件。理由なく policy.yaml optional 登録で解消しない。「既出か否か」（main 既出債務）を免除理由にしない。policy.yaml 冒頭契約（design/implementation 軸の optional は旧要件行の区分明示のみ・新規行（区分B）は登録しない・区分登録は Definition 変更として扱う）を遵守し、REQ-103-028（実装実体が git tag baseline-v4-canonical-convergence-20261007・実在確認済み）や REQ-109-002/004（Git 履歴による読み出し依存）のようにファイル実体を持ち得ない行は、まず当該制約を記録・担当事実のある実在成果物（AGENTS.md 3原則、design-principles.md、要件文書自身の参照先記録等）への宣言を探索し、全て失敗した場合のみ、本 Definition が policy.yaml の区分運用の拡張（ファイル実体なし行の登録区分の明示的追加）を宣言した上で理由を付記して optional 登録し、その旨を完了報告の残存問題として記録する（無断の区分拡張は行わない）。（4）REQ-117-006（implementation: check_integrity.ts:9 inline・verification: traceability/repo-agentdev-integrity.yaml）と REQ-117-011（implementation+verification: traceability/agentdev-workflow-case-open.yaml:123/147）は解消済みであり対象外。（5）記録訂正: Issue #4132 本文「## 結果」節「残件の扱い」の「REQ-117 系 15行等」を実測（13行。REQ-117 全15作業単位のうち006/011 は対応済み）に基づき13行へ訂正する（issue_update・読み戻し確認）。
  - id: AG-005
    content: |
      全体収束検証と完了報告（入力の完了条件）。次を順に実行し、実際の終了コード・件数・対象版を記録する: （1）bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts（AUTOGEN 再生成・差分確認）、（2）check_autogen_freshness exit 0、（3）check_integrity exit 0、（4）トレーサビリティ検査（コーパス全体）exit 0、（5）bun test 全対象（3 cwd 分割正規形: ① integrity suite、② src 側 skill script テスト、③ repo ルート系 guard テスト）、（6）jev-observations 最終状態確認（本 Case 起因の再生成分を含む全 *.json を処分し .gitkeep のみ・処分実数を記録・処分直後に check_integrity を再実行し IR-073 untracked NG 0件を確認）、（7）各変更の実体読み戻し確認。報告には削除・改名の件数、簡素化したルール、各検査結果（終了コード・件数・対象版）、残存する問題（REQ-090-006 と一回限り処分の緊張記録、AG-004 で optional 登録に至った行があればその理由、REQ-117-007 等で実体同定の過程で判明した未達があればその内容）を明記する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/integrity-contracts.md
    target_area: "## IR-020 移管に伴う追記（2026-11-15）"
    source_items: [AG-002]
    content: |
      対象節（505行〜）末尾の矛盾文の置換。
      旧文: 「IR-020 本文が基準集合として参照していた旧パス記述は移管対象から除外した。現行の基準集合は ng-baseline.json と ir-055-baseline.json が担い、更新タイミング・根因特定手順・報告分類は本 Design の各節が定義する。」
      新文: 「IR-020 本文が基準集合として参照していた旧パス記述は移管対象から除外した。旧基準集合（ng-baseline.json・ir-055-baseline.json）は baseline 機構の撤廃（REQ-010-074/079、Epic #4126 Phase 4）に伴い削除済みであり、現行に基準集合は存在しない。検出違反は全件を新規扱いで直接修正する。」
      同一文内の前段（撤廃済み宣言）と末尾（現行の基準集合）の内部矛盾を解消する。同一節の既存の撤廃表明（218行「## baseline 分類・免除機構の撤廃」節を含む）との整合を確認する。組立検査済み（assembly_evidence ACT-DESIGN-001: 見出し一意・旧文1件一致・置換後保持確認）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-073-untracked-residue.md
    target_area: "# IR-073: untracked-residue"
    source_items: [AG-002]
    content: |
      baseline 承認一覧機構（ng-baseline.json・provenance 付承認・applyNgBaseline demote）を現行機構として記述する箇所をすべて解消し、検出違反は gitignore 追加・commit による直接解消・info スキップの3経路に集約する。自節「## baseline 運用（撤廃済み）」（50〜52行）と実装（check_integrity.ts の IR-073 検出器・check_integrity.test.ts 5160〜5212行の「免除しない」検証）との矛盾の解消である。修正箇所:
      （1）description（18行）末尾: 旧「許容は gitignore（正規の非追跡領域宣言）と.gitignore 宣言で管理し、承認一覧対象外の検出は NG として終了コードを駆動し、承認済み検出は承認記録（`[baseline-known provenance=...]` 付き info）として報告にとどめる。承認の追加は検出契機ごとに人間の運用判断による明示承認（provenance 付き baseline 登録）として記録され、検査実行が承認を自動追加しない」→ 新「許容は gitignore（正規の非追跡領域宣言）で管理し、検出は全件を NG として終了コードを駆動する（baseline による承認一覧の運用は撤廃済み。検出違反は gitignore 追加または commit による直接解消で扱う）」〔組立検査済み〕
      （2）detection_method（21行）末尾: 旧「検出報告のメッセージには gitignore 追加の提案（正当な非追跡領域のため）と承認一覧登録手順の案内を含む。承認済み検出の demote は main の `applyNgBaseline`（bucket: category=UntrackedResidue / check=untracked-residue / file=対象パス / evidence 空値）により行う」→ 新「検出報告のメッセージには gitignore 追加の提案（正当な非追跡領域のため）を含む」（applyNgBaseline 実装は check_extensions.ts のみに残存し AG-003 で撤去されるため dangling 参照になる）
      （3）false_positive_risk（26行）末尾: 旧「検出時は gitignore 追加または承認一覧登録を人間の運用判断で処置する）」→ 新「検出時は gitignore 追加または commit を人間の運用判断で処置する）」
      （4）regression_test（27行）: 旧「・承認例（ng-baseline.json 承認一覧登録分は `[baseline-known provenance=...]` 付き info として承認記録報告し NG にしない。未承認残存は NG のまま終了コードを駆動）・案内例（検出報告に gitignore 追加提案と承認一覧登録手順の案内を含む）」→ 新「・案内例（検出報告に gitignore 追加提案を含む）」（テスト実体は案内例で免除しないことを検証済み）
      （5）triage_action（29行）: 旧「恒久的な許容であれば provenance 付きで.gitignore 宣言へ人間の運用判断で明示登録する。それ以外は commit して git 管理状態へ置く。本検査が承認を自動追加することはない」→ 新「恒久的な許容であれば `.gitignore` 宣言へ人間の運用判断で明示登録する。それ以外は commit して git 管理状態へ置く」
      （6）検査項目表（36〜40行・5行→5行の等行数更新）: 行1の「承認一覧対象外に」を除去し、行2を「検出は全件を NG として報告し、免除・降格を行わないこと」へ、行3を「許容の追加（`.gitignore` への追加）は人間の運用判断による明示判断であり、検査実行が許容を自動追加しないこと」へ、行5を「検出報告に gitignore 追加の提案を含めること」へ改める（行4は不変）。行削除・再番号に代わる等行数の現行要件への更新であり、いずれの行も検出器・テスト（check_integrity.test.ts 5160〜5212行）の現行動作に対応する。〔組立検査済み〕
      （7）exemption 表（47行・1行→1行の等行数更新）: 「| .gitignore 宣言登録パス | provenance 付き恒久承認記録。承認済み検出は承認記録として報告にとどめる |」を「| 検査基盤由来パス（`.agentdev/integrity/reports/` 等） | gitignore 宣言済みのため検出対象外 |」へ改める（false_positive_risk 記載の実在免除の明記。46行の gitignore 対象パス行との重複解消）。〔組立検査済み〕
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/responsibilities/req-impact-map.md
    target_area: "### IR-020 削除に伴う交叉参照再配置"
    source_items: [AG-002]
    content: |
      integrity-contracts.md の削除済み節（「finding-baseline 分類」「RuntimeReference baseline 運用手順」「NG baseline 運用手順」）への dangling 参照の現行化。
      （1）130行本文: 旧「baseline 運用契約の正規所有者は integrity-contracts.md（「finding-baseline 分類」「RuntimeReference baseline 運用手順」「NG baseline 運用手順」各節）である。各条項を integrity-contracts.md へ移管し、規則文書を物理削除した。」→ 新「baseline 運用契約は Epic #4126 Phase 4（REQ-010-074/079）で撤廃され、その経緯と現行運用は integrity-contracts.md「baseline 分類・免除機構の撤廃」節と「IR-020 移管に伴う追記」節が所有する。規則文書は物理削除した。」〔組立検査済み〕
      （2）134行表の後継列: 旧「integrity-contracts.md「finding-baseline 分類」「RuntimeReference baseline 運用手順」「NG baseline 運用手順」各節」→ 新「integrity-contracts.md「baseline 分類・免除機構の撤廃」節・「IR-020 移管に伴う追記」節」
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/authoring/vocabulary-registry.md
    target_area: "## 語彙直交性との接続（v4 概念語彙）"
    source_items: [AG-002]
    content: |
      参照先節名の現行化。76行: 旧「v4 概念語彙（work_type、scale、Epic、Wave）の正規定義は `docs/designs/workflows/standard-lifecycle.md`「work_type / scale / Epic / Wave の v4 意味モデル」節が正であり、本 Design は定義を複製しない。」→ 新「v4 概念語彙（work_type、scale、Epic、Wave）の正規定義は `docs/designs/workflows/standard-lifecycle.md`「work_type / scale / Epic / Wave の意味モデル」節が正であり、本 Design は定義を複製しない。」〔組立検査済み〕
      77行の「standard-lifecycle L13-21 への意味参照リンク行」は行番号参照を除去し「standard-lifecycle 当該節への意味参照リンク行」とする（実体対照表側の L13-21 参照も AG-002 実現面で同時に更新する）。節名ラベル「v4 概念語彙」自体は維持する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_area: "#### 配布物変更時の commit 前3検査工程"
    source_items: [AG-002]
    content: |
      撤廃済み baseline delta 運用の記述解消。
      （1）128〜130行（3行→3行の等行数更新）: 旧「突合は base 既知違反（baseline 既知 delta）と変更起因の新規違反を分離して行う。
      新規違反は全件分類して修正し、再検証で新規違反 0 件を確認してから commit する（fix-and-reverify）。
      baseline 既知違反の無断削除・隠蔽を行わない。baseline エントリの除去は対応する残存箇所の実際の解消とセットでのみ行う。」→ 新「突合は検出違反を全件新規扱いで行う（baseline による既知違反の区別・免除は撤廃済み、REQ-010-074/079）。
      全件を修正し、再検証で違反 0 件を確認してから commit する（fix-and-reverify）。
      違反の無断削除・隠蔽を行わない。」〔組立検査済み〕
      （2）166行: 旧「base 既知違反（baseline 既知 delta）と変更起因の新規違反を分離して新規違反 0 件を確認する（fix-and-reverify）。」→ 新「検出違反を全件新規扱いで違反 0 件を確認する（fix-and-reverify。baseline 既知違反の区別は撤廃済み）。」
      （3）169行: 旧「baseline 既知違反の無断削除・隠蔽を行わない（「配布物変更時の commit 前3検査工程」と同一の扱い）。」→ 新「違反の無断削除・隠蔽を行わない（「配布物変更時の commit 前3検査工程」と同一の扱い）。」
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_area: "### 最終検証の実行（検証義務に基づく試験範囲選択）と tmp 残存確認"
    source_items: [AG-002]
    content: |
      163行末尾の撤廃済み baseline delta 運用の記述解消。旧「base 既知違反と新規違反の分離突合を省略せず、baseline 既知違反の無断削除・隠蔽を受け入れない」→ 新「検出違反の全件突合を省略せず、違反の無断削除・隠蔽を受け入れない（baseline による既知違反の区別は撤廃済み、REQ-010-074/079）」〔組立検査済み〕

conflict_resolutions:
  - id: CR-001
    conflict: |
      .agentdev/jev-observations/ の全 JSON 処分（利用者が元の計画 Phase 2.1 と今回の入力で2度明示指示）と、REQ-090-006（jev-observations を正式な永続 domain state・git 管理対象とする契約）をはじめ REQ-090-013（観測永続化契約）・017（v1 観測は履歴として保持）・020（観測に基づく集計）・023（Vercel 由来観測の削除禁止）・030（既存観測の遡及修正・移行・書換え禁止）との緊張。adversarial-review でこの緊張の多面性が指摘された（単一条文のみの記録では不十分）。
    resolution: |
      利用者の反復明示指示を採用根拠として一回限りの処分を実行し、REQ-090 の恒久契約自体は変更しない。処分は working tree からの削除であり Git 履歴に保全される（AGENTS.md 実験前提の3原則1・ロールバック許容「履歴性は Git 履歴で担保」）。REQ-090-030 の禁止対象（観測内容の遡及修正・移行・書換え）にも観測実体を壊さない working tree 削除は該当しない。本 Case 実行中の ADF 再生成観測の処分は検証手順への自動削除運用の恒久化ではなく、本 Case の完了条件として利用者が明示指定した最終状態確認である。.gitignore による恒久的非追跡化は行わない（REQ-090-006 の git 管理対象モデルと利用者の .gitkeep のみという指定の双方に反する）。この緊張は完了報告の残存問題として記録する。

operation_units:
  - ou_id: OU-001
    target_design: []
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_design:
      - docs/designs/integrity/integrity-contracts.md
      - docs/designs/integrity/rules/IR-073-untracked-residue.md
      - docs/designs/responsibilities/req-impact-map.md
      - docs/designs/authoring/vocabulary-registry.md
      - docs/designs/commands/case-run.md
      - docs/designs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    target_design: []
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-004
    target_design: []
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-005
    target_design: []
    operation: create
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 3
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      本 Case の最終検証時点（最後の check_integrity 実行直前）で、.agentdev/jev-observations/ 配下の実ファイルを列挙し、存在する全 *.json（本 Case 起因の再生成分を含む）を処分する。処分直後に .gitkeep のみであることを確認し、check_integrity を実行して IR-073 untracked-residue NG 0 件を確認する。処分した JSON の件数と観測 ID を記録する（初期5件＋20261117T214837Z-ba04＋本 Case 実行中再生分の内訳を含む）。
    pass_criteria: |
      .agentdev/jev-observations/ 配下が .gitkeep のみ（*.json 0 件）であり、処分直後の check_integrity で IR-073 由来 NG が 0 件であること。処分実数の内訳記録が存在すること。
    on_failure: |
      fix-and-reverify。残存 JSON を処分して再検証する。処分後に ADF 実行で再生された場合は最終検査時点をやり直す（検査実行後に再生が挟まった場合はその分を再度処分して最終検査を再実行する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      rg --hidden により、撤廃済み機構の現行記述（ng-baseline の読込・免除・適用・applyNgBaseline・--update-ir055-baseline・--update-ng-baseline・baseline 既知 delta・baseline 承認一覧・baseline_status・IR-065/IR-066 の現行運用・data/obsolete-vocabulary-map.yaml・obsolete-vocabulary-map・「v4 意味モデル」節名参照）を docs/・src/・.opencode/・traceability/ から検索する（docs/reports/・docs/requirements/retired/・req-impact-map.md 再配置表の日付付き履歴行・AUTOGEN ブロック・撤廃表明文〔vocabulary-registry.md:356・IR-073:50-52・integrity-contracts.md:218 節等〕は検出対象から除外する）。Design 6ファイルの修正後は読み戻しで新旧文を確認する。除外した文言が撤廃表明・履歴記録として正当であることを確認する。
    pass_criteria: |
      現行記述としての残存が 0 件であること。Design 6ファイルの修正が組立検査どおりに適用されていること（見出し保存・旧文残存 0）。src/common 側4件の編集が投影と同期されていること。
    on_failure: |
      fix-and-reverify。検出残存を修正して再検索する。設計判断を要する差分（撤廃表明と現行記述の判別が困難な場合）は当該箇所を提示して判断を求めず、契約上の除外基準（履歴記録・撤廃表明）に従って処置し、処置根拠を記録する。
  - id: TS-003
    target_item: AG-003
    verification: |
      rg --hidden により check_extensions.ts・check_extensions.test.ts・cli_utils.ts から baseline 機構経路（NG_BASELINE_PATH・extBaselineKey・ExtensionsNgBaseline・applyExtensionsNgBaseline・skipNgBaseline・update-ng-baseline・ng-baseline-additions・writeExtensionsNgBaseline・ng_baseline・update-ir055-baseline）が消えたことを確認する。scripts/tsconfig.distribution-boundary.json の include に削除済み lib 2ファイルが含まれないことを確認する。check_extensions.test.ts の ADF-COVERS 宣言（REQ-002-030/031・REQ-044-001/002/005）が保持されていることを確認する。bun test（当該テストファイル対象・リポジトリルートを cwd とする ./ 付き指定）と typecheck（tsconfig.distribution-boundary.json 対象）と check_distribution_boundary を実行する。
    pass_criteria: |
      検索 0 件・include から削除済みファイル除去・ADF-COVERS 宣言保持・bun test 緑・typecheck 緑・check_distribution_boundary 緑であること。check_extensions.ts の baseline 以外の検査機能（--scenario モードを含む）が動作継続していること。
    on_failure: |
      fix-and-reverify。残存経路を撤去し、撤去に伴う型・import・テストの破損を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      bun run ./src/common/skills/agentdev-traceability/scripts/src/check.ts --root <repo root> を実行し、全12検査が pass で exit 0 となることを確認する（missing-implementation 0 件・missing-verification 0 件・missing-design 0 件）。追加した sidecar/inline 宣言の対象パスがすべて実在し、当該行を実装・検証していることを行ごとに確認する。policy.yaml への登録を行った場合は登録理由の記録と冒頭契約との整合（本 Definition による区分運用の宣言）を確認する。agentdev_gh issue_read 4132 で REQ-117 系の件数記述が実測（13行）へ訂正されていることを確認する。
    pass_criteria: |
      トレーサビリティ検査 exit 0・全検査 pass。実体のない対応宣言 0 件。#4132 本文の件数が実測値へ訂正済みであること。
    on_failure: |
      fix-and-reverify。宣言漏れ・実体不在・誤記を修正して再検証する。実体が存在しない行は AG-004（3）の手段（実在記録実体への宣言→区分運用の宣言付き optional 登録）に従って処置する。
  - id: TS-005
    target_item: AG-005
    verification: |
      順に実行する: （1）generate_indexes.ts 実行と差分確認（設計・要件の状態に追随した AUTOGEN 再生成）、（2）check_autogen_freshness（exit 0）、（3）check_integrity（exit 0）、（4）トレーサビリティ検査コーパス全体（exit 0）、（5）bun test 全対象（3 cwd 分割正規形・依存パッケージ前置・N/M 件数突合）、（6）TS-001 の jev-observations 最終状態確認と処分、（7）処分後の check_integrity 再実行（IR-073 0 件）。各検査の終了コード・件数・対象版（コミット SHA）を記録する。各変更ファイルの読み戻し確認を完了する。
    pass_criteria: |
      全検査が exit 0 であること。AUTOGEN 差分が再生成後に 0 であること。jev-observations が .gitkeep のみであること。完了報告に削除・改名件数・簡素化したルール・検査結果・残存問題が記載されていること。
    on_failure: |
      fix-and-reverify。失敗した検査の原因を直接解消して全検査を再実行する。検査の省略・免除・対象縮小による合格化は行わない。

realization_actions:
  - id: RA-001
    concern: jev-observations の指定最終状態化
    responsibility: .agentdev/jev-observations/ の JSON 5件削除と .gitkeep 保持、本 Case 起因再生分の最終検査時点での処分と実数記録
    ownership_hints:
      - ".agentdev/jev-observations/（20261117T131543Z-6e6a・132114Z-0cdb・155022Z-37a8・155148Z-2795・155215Z-c951 の5件と本 Case 起因分）"
      - "元の計画 Phase 2.1（req-input-experimental-cleanup-20261117.md）"
      - "CR-001（REQ-090 との緊張の解釈）"
    intent: 利用者が指定した最終状態（.gitkeep のみ）を最後の検査時点で実際に成立させ、残存を隠さず実数を報告する
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: 撤廃済み機構・削除済み実体への参照残存の実現面一掃
    responsibility: vocabulary-registry.md（repo-local 正本）の残存記述解消（358/360-383/369/280/312/388/392-394行）、SKILL.md の baseline 記述解消（73/77/208-210行）、check_integrity.ts コメント（8036-8039行）、check_content_corruption.ts ALLOWED_USAGE の IR-066 エントリ（160-165行）、check_integrity.test.ts baseline 語彙（2214-2217/2660-2666行）、src/common 4ファイルと docs 1ファイルの旧節名参照更新（投影同期を含む）
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md"
      - ".opencode/skills/repo-agentdev-integrity/SKILL.md"
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts / check_content_corruption.ts / check_integrity.test.ts"
      - "src/common/skills/agentdev-workflow-lifecycle/SKILL.md:27,45・agentdev-workflow-case-ready/SKILL.md:130・references/execution-structure.md:4"
      - "docs/designs/workflows/references/execution-unit-construction.md:89"
      - "docs/designs/authoring/vocabulary-registry.md:85（docs 側の現行記述・整合の正）"
    intent: 撤廃済み baseline 機構と削除済み IR-065/066・data・旧節名を現行と記述する箇所を、実装と docs 側の現行方針に合わせて解消する
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: check_extensions.ts の baseline 機構完全撤去と配布境界型検査基盤の整合
    responsibility: check_extensions.ts の baseline 全経路撤去（約430行）、check_extensions.test.ts の baseline 3ブロックと import 縮小（ADF-COVERS 宣言保持）、cli_utils.ts ヘルプ2行削除、scripts/tsconfig.distribution-boundary.json の include から削除済み lib 2ファイル除去、gate 呼出側の再確認、bun test・typecheck・check_distribution_boundary 緑化
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts（145-269/117-120/185-192/285-387/731-736/1034-1044/194-209/389-528/1375-1435/271-283/1048/1443-1448行）"
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts（22/49-61/134-166/168-279行）"
      - ".opencode/skills/repo-agentdev-integrity/scripts/cli_utils.ts:326-327"
      - ".opencode/skills/repo-agentdev-integrity/scripts/tsconfig.distribution-boundary.json（include 2行）"
      - "REQ-010-074/079（baseline 撤廃の既定要件）"
    intent: 空配列フォールバックではなく免除機構の再作動経路を含む完全撤去により、REQ-010-074/079 の実装を完了させる
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: トレーサビリティ残存違反39行の実体解消と Issue #4132 記録訂正
    responsibility: 21行の missing-implementation と18行の missing-verification を行ごとに実体照合で解消（sidecar 原則・実在性義務・policy.yaml 冒頭契約遵守・区分拡張は本 Definition の宣言 within）、Issue #4132 本文の REQ-117 系件数誤記（15行→13行）を agentdev_gh issue_update で訂正し読み戻す
    ownership_hints:
      - "traceability/*.yaml（sidecar 追加先）・traceability/policy.yaml（登録時は区分運用の宣言付き）"
      - "トレーサビリティ検査: bun run ./src/common/skills/agentdev-traceability/scripts/src/check.ts --root <repo root>"
      - "実体候補: AGENTS.md（3原則）・docs/designs/foundations/design-principles.md（## 0）・check_integrity.ts・各種テスト・.opencode/skills/agentdev-workflow-case-run/scripts/{tsconfig.json,package.json}・docs/reports 記録"
      - "Issue #4132 本文（## 結果節 残件の扱い）"
      - "REQ-117-006: check_integrity.ts:9 inline・REQ-117-011: traceability/agentdev-workflow-case-open.yaml:123,147（解消済みの参照例）"
    intent: 実体のない対応宣言・理由なき免除・検査省略なしに、残存違反の原因を行単位で直接解消し、既存記録の件数誤記を実測へ訂正する
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: 全体収束検証と完了報告
    responsibility: generate_indexes・check_autogen_freshness・check_integrity・トレーサビリティ検査・bun test 全対象（3分割正規形）の実行と exit 0 確認、jev-observations 最終状態確認（TS-001）、削除・改名件数・簡素化ルール・検査結果（終了コード・件数・対象版）・残存問題の報告
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts・check_autogen_freshness.ts・check_integrity.ts"
      - "src/common/skills/agentdev-traceability/scripts/src/check.ts"
      - "agentdev-quality-gates（full integrity suite・bun test 3分割正規形）"
    intent: 元の計画全体を再照合し全検査を緑にして、実測に基づく完了報告で本 Case を完結させる
    verification_refs: [TS-005]
    source_items: [AG-005]

review_dispositions: []

assembly_evidence:
  - target_file: docs/designs/integrity/integrity-contracts.md
    target_content_sha256: 3b2e07c2e4dbf146ee5cf3b07c9db15c8a069a275f27588a6ea609a65d149fdf
    check_scope: { heading: "## IR-020 移管に伴う追記（2026-11-15）", start_line: 505, end_line: 508 }
    execution_conditions: { operation: replace, edit_sha256: fadec029dbb2c476bb571b8c85d7997d1223d791acfc999fd3d6f07ad39e42c7, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:05:38.156Z"
  - target_file: docs/designs/integrity/rules/IR-073-untracked-residue.md
    target_content_sha256: 2baa820c4ed23baf5c68d1217d9b352c7e3a392b68f5316081d662e1b31dc05f
    check_scope: { heading: "# IR-073: untracked-residue", start_line: 11, end_line: 58 }
    execution_conditions: { operation: replace, edit_sha256: f0ca91c25d69874d7d6f9775e9c45a4d69d6f55b445b8842821658b03f8dabb4, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:05:38.255Z"
  - target_file: docs/designs/responsibilities/req-impact-map.md
    target_content_sha256: 10c1133adf4d023283045789759fbfbaab84199e07bd186ae8b85e420f60e1df
    check_scope: { heading: "### IR-020 削除に伴う交叉参照再配置", start_line: 128, end_line: 135 }
    execution_conditions: { operation: replace, edit_sha256: 8de26f7268260738c5f50194018f1910fd178452b0eb1b428c334016fc097f43, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:05:38.354Z"
  - target_file: docs/designs/authoring/vocabulary-registry.md
    target_content_sha256: 36a726ca0021f5c1002f80b578cdb3634740510fee2dcf05ec7bf63bd9d75c6b
    check_scope: { heading: "## 語彙直交性との接続（v4 概念語彙）", start_line: 74, end_line: 79 }
    execution_conditions: { operation: replace, edit_sha256: 2bcc485095f97d4a6bd51f2648f30fd4a3e1881e60d911cf5aeeed78422f45b4, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:05:38.454Z"
  - target_file: docs/designs/commands/case-run.md
    check_scope: { heading: "#### 配布物変更時の commit 前3検査工程", start_line: 122 }
    execution_conditions: { operation: replace, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 3, added: 3, removed: 3 }
    executed_at: "2026-11-17T22:38:00.000Z"
  - target_file: docs/designs/integrity/rules/IR-073-untracked-residue.md
    check_scope: { heading: "## 検査項目", start_line: 32 }
    execution_conditions: { operation: replace, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 5, added: 5, removed: 5 }
    executed_at: "2026-11-17T22:38:00.000Z"
  - target_file: docs/designs/integrity/rules/IR-073-untracked-residue.md
    check_scope: { heading: "## exemption（許容条件）", start_line: 42 }
    execution_conditions: { operation: replace, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:38:00.000Z"
  - target_file: docs/designs/commands/case-close.md
    check_scope: { heading: "### 最終検証の実行（検証義務に基づく試験範囲選択）と tmp 残存確認", start_line: 159 }
    execution_conditions: { operation: replace, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-17T22:07:05.000Z"

case_open_hints:
  epic_needed: true
  decomposition: |
    5 operation_units。OU-001（jev-observations 最終状態化）・OU-002（参照残存一掃・Design 6件適用と実現面）・OU-003（check_extensions baseline 機構撤去）・OU-004（トレーサビリティ39行解消と #4132 訂正）は意味的依存を持たず、ファイル領域が分離する（OU-002: docs/designs 6件・repo-local references/SKILL・src/common 4件・check_integrity 系コメント、OU-003: check_extensions 系・cli_utils・tsconfig、OU-004: traceability/*.yaml・policy.yaml・Issue #4132、OU-001: .agentdev/jev-observations）。OU-005（全体収束検証と報告）は OU-001〜004 全件への必須依存を持つ。
  wave_hints:
    - "Wave-1: OU-001〜004（並行実行可能・ファイル単位の競合回避）。OU-002 と OU-004 は check_integrity.ts で触れ合い得る（OU-002 はコメント修正・OU-004 は inline 宣言追加の可能性）ため、OU-004 は sidecar 宣言を原則とし、inline 追加が必要な場合は OU-002 の確定後に行う。マージ順の参考: OU-003 → OU-002 → OU-004 → OU-001"
    - "Wave-2: OU-005（全検査の収束。jev-observations 最終状態確認は本 Case の最終 check_integrity 実行直前に行い、処分後に check_integrity を再実行する）"
```

# summary

完了済み Epic #4126（実験前提の3原則採用とレガシー資産一括整理・closed）の独立検査で発見された未達5項目を、元の利用者指示の未完了是正として新規 Case で解消する。REQ 操作は不要（baseline 撤廃は REQ-010-074/079、区分外行解消は REQ-117-005、3原則は DEC-064 が既に所有し、本件はその実装完了）であり、Design 6ファイルの機械的整合修正（撤廃済み baseline 機構・削除済み IR-065/066・旧節名への現行記述の解消）と、実現面（check_extensions.ts の baseline 機構完全撤去、jev-observations 最終状態化、トレーサビリティ39行の実体解消、#4132 件数誤記訂正、全検査収束）で構成する。

STEP-8 adversarial-review（2 stream・対称的相互反証・convergence audit 実施）の主要所見を反映済み: ①policy.yaml 冒頭契約（区分B の implementation optional 登録禁止）を遵守した実体第一の解消方法への変更、②IR-073 修正対象の全記述への拡大、③REQ-057-024 の実在（retired/REQ-057.md:40）に基づく根拠訂正、④jev-observations 処分と REQ-090 系契約との緊張の多面的記録（CR-001）と最終検査時点の明確化、⑤check_extensions.test.ts の ADF-COVERS 宣言保持、⑥case-run.md/case-close.md の「baseline 既知 delta」記述の Design 修正対象への追加。REQ-057-024 は retired に実在する（本 draft の初期主張の誤りは審議で訂正した）。
