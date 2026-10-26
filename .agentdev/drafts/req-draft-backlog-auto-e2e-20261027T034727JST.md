---
draft_type: req_draft
topic_slug: backlog-auto-e2e-20261027T034727JST
status: draft
created_at: 2026-10-27T06:15:00+09:00
source_rus: [RU-0247, RU-0248, RU-0249, RU-0250, RU-0251, RU-0252, RU-0253, RU-0255, RU-0256, RU-0257, RU-0258, RU-0259, RU-0260, RU-0261, RU-0262]
---

# draft-data

```yaml
# 確定版。HITL 回答（RDQ-1〜RDQ-7・Hermes 監督代理回答 2026-10-27）を反映。
work_type: maintenance # 判定根拠: 一式は検査体系・機械工程の堅牢化と docs 整合（既存システムの保守・改善）。bugfix 単独ではない（applySection 障害修正を含むが一式全体は保守）。RDQ-6 で新規 Decision なし確定のため feature 昇格しない

scale: large # 判定根拠: 15 作業単位・影響ファイル 20+・複数領域（docs/script/検査/手順）・並列実行可能な独立作業群。実装スコープシグナル（修正対象カタログ・影響ファイル一覧）を含む。分解計画は operation_units で表現、最終 Issue 構成は case-open が決定

summary: 15 RU 一式（docs 正規成果物の機械的整合、IR-044 Design 候補行 11 件の分離、traceability covers 区分外行解消、検査・機械工程の堅牢化、canonical DRIFT 解消）を単一新規 REQ に収容し、既存 REQ/Design/Decision への付随的編集操作として artifact_actions で表現する。既存REQ照合（Jev 20261026T211109Z-9e9f・CREATE 確度1.0）、最終分類・Design 分離（Jev 20261026T212337Z-a9de・REQ行/分離不要）、実行時再観測（IR-044 warning 11 件実測・現行 covers 実測）、組立検査（assemble-draft-section 27 操作すべて ok）を完了。RDQ-7 (γ) により RU-0254 は本一式から除外（後続別要求・RU 原文は残存）。重要変更の事前通知は STEP-9 前の HITL 報告で実施済み（CR-008）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: [] # RU-0254（repo 外管理者操作）は RDQ-7 (γ) により本一式から除外済み
  stop_reasons: []

# 確定済み合意内容。実測（実行時再観測条項）と HITL 回答に基づく。
agreed_items:
  - id: AG-001
    content: |
      （RU-0247・確定）docs 正規成果物の機械的修正 4 件。(1) IDX-03: docs/requirements/REQ-108.md の REQ-108-013 行と REQ-108-014 行の間の空行 1 行を削除して表を統合し、REQ-108-014..024 が REQ-108-013 と同一の表として解釈されること（docs-check REQ 構造検査で確認）。(2) IDX-08: docs/requirements/REQ-060.md:10 の目的節本文の旧用語「repo root 起 cwd + ./ 付き相対パス指定」を「リポジトリルートを cwd にして実行・./ 付きパス指定」へ現行化。自覚的除外: knowledge 2 件（bun-test-execution-form-drift-signals.md:19、windows-bun-test-spawn-timeout-classification.md:28）への同一旧用語の適用は REQ-094 の適用範囲確定を要する別判断のため対象外（REQ-060-004 が所有する知識文書と REQ 本文の用語乖離が暫時残ることを要件側で記録）。(3) IDX-09: docs/requirements/REQ-010.md の REQ-010-080 行を 071..079 の後・081 の直前（正しい連番位置）へ移動（070 → 071..079 → 080 → 081 の順序回復）。(4) IDX-12: docs/designs/foundations/numbering-policy.md:34 の DEC-062 タイトル文字列参照を「Decision `DEC-062`」形式の ID 参照へ変更（内容記述の変更は不要）。
  - id: AG-002
    content: |
      （RU-0248・RDQ-1 (a) 確定）配布物・Design 内の inline ``` ラン 3 箇所（奇数）破損の表現修正。対象段落は docs/designs/skills/agentdev-design-file-manager.md（search-target-area.ts 契約節）と src/common/skills/agentdev-design-file-manager/references/target-area-matching.md（セクション範囲特定節）の同一段落「見出しの走査と…行頭（字下げなし）の ``` で開始する…行頭の ``` のみを条件とし…閉じの ``` がない場合は」。修正方向: 対象段落の fence マーカー表現を 4 バッククォート囲み（```` ``` ````）へ変更する表現修正（違反の解消・(b) ALLOWED_USAGE 例外化は RDQ-1 で不採用）。必須条件: REQ-004-066..068 が要求する同内容 9 箇所複製（Design 3・配布 reference 2・script JSDoc 3・REQ 行）の表現整合。あわせて 2 ラン複製 3 箇所（numbering-policy.md「欠番の扱い」節、docs/designs/commands/req-define.md「調査委譲の全文機械抽出…」節、src/common/skills/agentdev-workflow-req-define/references/draft-generation.md「決定的な局所組立・検査」節）の表現統一を実施。REQ-001-071 の同一性契約（「認識規則は局所組立・target_area 検索と同一とすること」）への波及は表現のみの統一であり同一性契約は不変。目標: docs-check gate fail（check_content_corruption exit 1）状態から検査を回復させ REQ-053-008 配布物構造健全性契約を回復する。IR-055 波及は非該当（対象は IR-055 検出パターンを新規に発生させない表現修正）。
  - id: AG-003
    content: |
      （RU-0249・対象行確定済み）IR-055 warning_total_cap 超過（pre-demote 60 > cap 58）の根本解消。採用済み処置: 分離修正（HITL 代理回答 2026-10-27 確定を継承・cap 変更は不採用・記録残件から解消へ移行）。IR-044 warning 11 件の実測リスト（check_integrity.ts --json 本体実行・HEAD ebd825a63・2026-10-26T21:0xZ）を一次情報として対象行を確定: REQ-001-062（REQ-001.md:74）、REQ-001-067（:79）、REQ-008-058（REQ-008.md:75）、REQ-008-059（:76）、REQ-008-060（:77）、REQ-010-009（REQ-010.md:29）、REQ-014-012（REQ-014.md:31）、REQ-034-031（REQ-034.md:47）、REQ-061-035（REQ-061.md:54）、REQ-094-006（REQ-094.md:23）、REQ-103-013（REQ-103.md:33）。各行の修正は IR-044 triage_action に従い、行の Design 的内容を正規所有 Design へ移管し、REQ 側は外部契約・状態要件の要約に置き換える。確定した置換文言は ACT-REQ-007〜013 に記載のとおり（検出器キーワード辞書〔IR044_SIGNAL_PATTERNS 9 種〕に照らして検出対象語を除去した文言）。移管先と design 対応: REQ-001-062・REQ-094-006 → document-type-responsibilities（covers 既存・列挙詳細は同文書が正規所有）、REQ-001-067 → document-model（covers 既存）、REQ-008-058/059/060 → req-define command Design（REQ-008-059 covers 既存・REQ-008-058/060 は design covers 宣言に追加）、REQ-010-009 → checker-execution-contracts（design covers 宣言新設）、REQ-014-012 → adversarial-review Design（covers 既存）、REQ-034-031 → case-auto Design（covers 既存）、REQ-061-035 → case-ready Design（covers 既存）、REQ-103-013 → artifact-contracts（covers 既存）。突合条項の実測結果: REQ-001-069 は 11 行に含まれず二重化は発生しない。depends_on（REQ-010 行順序修正の先行）を OU-001 → OU-003 の依存として継承。完了判定: 分離修正後の check_integrity で IR-044 warning 0 件・pre-demote warning total が 58 以下・IR-055 が NG でないこと（cap 変更は一切行わない）。
  - id: AG-004
    content: |
      （RU-0250・確定）main root 未追跡残存の運用処置（IR-073 pass 回復）。パス別確定処置（HITL 代理回答 2026-10-27 確定を継承）: (1) Jev 観測 8 件はコミット済み（ece068dce）のため対象外。(2) src/common/tools/agentdev-gh/tests/tmp-runner-cli-*（400+ ディレクトリ・テスト実行残骸）は .gitignore パターン追加 + 物理残骸削除 + テスト後クリーンアップ改善（テストコード側の一時ディレクトリ管理改善）を含める。利用者指示による即時処置からの削除除外（昇格時点 L18）は intake 時点の即時処置への限定であり、確定処置（L24）が物理削除含有を指示する旨の解釈記録を保持。(3) .tmp-jev-analysis/（単発解析スクラッチ）は削除（恒久 ignore 化・コミットは不適切・削除により再発しない）。(4) .local/ は実測不在のため対象外。完了判定: check_integrity（IR-073 含む）が main root 起点実行で untracked 残存起因の NG 0（exit 1 解消）。
  - id: AG-005
    content: |
      （RU-0251・対象行確定済み）traceability check 区分外達成義務行の解消。現行 covers 実測（check.ts --root 本体実行・HEAD ebd825a63）: missing-design = REQ-001-069, REQ-052-012（design covers 不在・implementation covers 既存）; missing-implementation = REQ-096-010/014/021/025/027/028/029/030 + REQ-113-001/002（REQ-096 8行は design covers 全行宣言済み・REQ-113 2行は design covers 既存 runtime-package-boundary.md）; missing-verification = REQ-113-001/002。REQ-098-010 は現行 covers で解消済みのため対象外（RD-003）。計数差（13行 vs 11件）は REQ-113-001/002 の二重計数説どおり。区分判定の実測: REQ-096 は v4 cutover（4136b8382）後の新規行（Case #3279）であり区分B → policy design/implementation optional 機構への登録は「新規行は本機構へ登録しない」規約により不可。REQ-001-069・REQ-052-012・REQ-113-001/002 も同様に区分B。解消方式（確定）: (i) REQ-001-069 の design covers 付け先は docs/designs/responsibilities/document-type-responsibilities.md（REQ/Design 分離基準の正・REQ-001-069 の契約〔Design は未確定事項・proposed Decision を権威引用しない〕の規範を同文書が保持）への ADF-COVERS(design) 宣言追加。(ii) REQ-052-012 の design covers 付け先は docs/designs/responsibilities/custom-tool-contracts.md（agentdev_gh 操作契約の正・本文が名指す plugin 設定契約・loader shim・runner-local 細目・v4-delegation-contracts〔docs/designs/workflows/・実パス確定済み〕経路を同文書群が保持）への ADF-COVERS(design) 宣言追加。(iii) REQ-096 8 行は RDQ-2 (α) により v4-responsibility-boundaries.md へ ADF-COVERS(implementation) 宣言新設（付帯条件: REQ-096-028/029/030 は適用時に同 Design 本文規範の実保持を確認し、保持が確認できない行は covers 付与せず理由付きで親へ報告）。(iv) REQ-113-001/002 は runtime-package-boundary.md へ ADF-COVERS(implementation) 宣言新設 + tsconfig 統合・typecheck 組込みの実装（verification covers は実装完了時に検証成果物へ付与）。完了判定: 対象行の現行実測分の解消後、traceability check（コーパス全体）が区分外達成義務行 0 件（現行 covers 状態での再区分結果に対して）。
  - id: AG-006
    content: |
      （RU-0252・RDQ-3 (a+b) 確定）traceability sidecar 重複パスキーの構造的予防の導入。(a) check_integrity の malformed-declarations 検出に重複キー検出を追加（Bun.YAML last-wins 解釈を回避する raw parse・重複検出手段を含む・機械検出による事前防止）+ (b) sidecar 更新手順（traceability sidecar 契約・関連 workflow skill の手順規定）に重複キー事前統合ルールを明記（編集時予防）。完了判定: (a) 重複キーを含む sidecar に対する check が NG 検出する回帰テスト、(b) 手順規定の存在と適用確認。いずれも PR #3819 相当の重複が再発時に検出または防止されること。
  - id: AG-007
    content: |
      （RU-0253・確定）REQ-115 の後続実装: src/common/skills/agentdev-workflow-case-run/scripts/ に tsconfig.json と package.json を実追加し、case-run scripts 全体が型検査対象となる基盤を構成。typecheck gate（品質検査経路への組込み）を実施。REQ-115-003 の確認条件（bun test 正規形・QG-4 3 cwd 分割実行の実行経路・検査対象集合を変化させない）を維持。REQ-115 対象外明記（後続要求化の記述）は方針本文と実装の整合を記録する形で維持（REQ-115-003 の「実追加・gate 組込みは後続別要求」記述は本実装の前提として意味を保つ）。境界: REQ-113（local ツール package）とは対象 package が異なり競合しない（実パス突合済み）。経路共有の可否は typecheck gate 組込み時に REQ-113 解消（AG-005・OU-005）と突合。完了判定: case-run scripts 配下が typecheck gate の検査対象として緑であること、QG-4 の実行経路・検査対象集合が不変であること。
  - id: AG-008
    content: |
      （RU-0255・確定）agentdev-workflow-phase-artifacts-update の description 削減（676 chars > 600 個別上限の pre-existing NG・lint_skills AG-005 解消）。top 層からの削減。skill の役割・トリガー情報の保持と AG-005 適合の両立は agentdev-skill-authoring / command-authoring の description 品質基準に従う。frontmatter description の変更は skill 構造契約に従い、投影（src/common → .opencode）との同期を含める。description 集約予算超過（58 ファイル合計 20724 > 20300）の回収を同時達成。漸進回収方式（運用方針）の範囲内で実施し、他 skill の description への全面的な一括変更は行わない。完了判定: lint_skills（profile source・全件スキャン）で AG-005 個別 NG 0 件（当該 skill）・集約 warning 解消（合計 ≤ 20300）。
  - id: AG-009
    content: |
      （RU-0256・文言確定）REQ-039-007 行への履歴検査成功/検査不能境界の明示的文言追加。実測転写（adversarial-review stream 2 確認済み）: 現行 REQ-039-007 行は一般形のみであり、乖離文面（コミット 0 を履歴検査不能の例とする TS-008 文言）は閉じた Issue #3823 側のみに存在 → 修正内容は追記であり既存文面の削除ではない。追加文言（確定・ACT-REQ-006 に保存対象 full text を記載）: 「git リポジトリかつコミット 0（git log --all が exit 0・空出力）は使用済み集合が空の検査成功であり、履歴検査不能に該当しない。履歴検査不能とは検査手段の失敗時（非 git、権限欠如、git 破損等）を指し、fail-closed で採番を確定せず理由を報告する」。手続正 integration-judgment.md「履歴検査不能時の fail-closed」に整合。REQ-039.md は標準三区分のみ（test strategy 節なし・REQ-001-046 準拠実測）のため新規節は追加せず、既存 REQ 行の構造内で文言を明示化。完了判定: REQ-039-007 行が手続正と git 実挙動（コミット 0 = 検査成功）に整合した文言を持つこと。
  - id: AG-010
    content: |
      （RU-0257・RDQ-4 (i) 確定）機械工程 script への入力検証専用入口（validateInput 分離入口）の新設。入口は入力検証（必須ゲート実行体の availability を含む入力妥当性検証）のみを実行し、worktree 作成等の副作用ステップへ到達しない（既存 dryRun 入口はゲート実行体が揃うと検証以外のステップへ到達するため check 用入口として使用不可）。scripts 契約へ入口仕様（dry-run 入口の振る舞い・check モードからの呼出し可否・検証範囲）を定義（case-run scripts 配下に README.md 契約文を新設。Design「機械工程 script の実行時前提の導入時検証」節の所有関係に従い、script 契約に定めてから check_integrity の検証対象へ組み込む）。RDQ-4 (i) により入口新設後に install.ps1（scripts/install.ps1・REQ-009-053・PR #3861）の check を新設正規入口の呼出しへ切替え、producer 契約の重複実装を解消する。完了判定: 入口が consumer の check モードから呼出可能であり、ゲート実行体欠如在時に入力検証が fail-closed で検出すること。script 契約への仕様定義の存在。install.ps1 が正規入口を呼出すこと。
  - id: AG-011
    content: |
      （RU-0258・確定）prepare_definition_pr の計測日収束補正 commit を script 内で完結させる拡張。generate_indexes 実行後・check_integrity 実行前に、計測日不整合（req-metrics 計測日 AUTOGEN 更新 + req-updated-freshness による frontmatter updated 追随）を検出し、明示パス指定で補正 commit を script 内で完結させる拡張 step を追加。trigger 条件: check_integrity 報告の計測日不整合 NG と req-updated-freshness NG。既存 contingency 手順（src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「計測日収束」節・Root Case #3850 実測で手動補正 commit 2 件が発生）の機械化であり、手順契約（docs/designs/commands/case-open.md「機械工程の script 呼び出し契約」節）へ追随更新。境界: 絶対パス標準一般化（AG-012）とは論点が別・script 実装へ触れる共通箇所の競合は突合済み（独立実装可）。完了判定: 機械工程実行で手動補正 commit が不要となり（実測で Definition PR 生成が一巡で pass）、script 契約と手順文書が実装と整合すること。
  - id: AG-012
    content: |
      （RU-0259・反映先確定）checker・機械工程 script のパス引数に対する絶対パス標準の一般化（恒久契約化）。同一構造の適用漏れ 3 回出現（2026-10-13 deferred・E34 Root Case #3850・E39 Case #3841）。対象外（現行維持）: gate spec --input の flag 契約（非空検査のみ・解決基準は呼出側責任）の変更なし、既存 gate の失敗分類・fail-closed 挙動、MSYS パス等の既存知識文書 2 件（windows-checker-msys-path-argument.md・windows-checker-observation-discipline.md）の再定義なし。反映先（受け入れ条件 3 項目の充足に必要な最小集合として確定）: (1) docs/designs/integrity/checker-execution-contracts.md「link profile 実効実行要件」節の既存絶対パス規定の直前に、パス引数全般への一般化規定（解決基点は checker・script 起動時の cwd であり repo root ではない・パス引数は絶対パスで構成する標準・相対解決を意図する場合は gate spec の cwd からの相対であることを呼出側が明示管理・checker 実行記録に解決先（実測絶対パス）を明記する規律）を追記（文言は ACT-DESIGN-019 に確定記載）。(2) case-ready / case-open / case-close の機械工程手順 references への gate spec パス引数の絶対パス構成前置規律（definition-pr-and-idempotency.md L47 のパス引数検査「非空」のみの現状に対する補強を含む）。(3) checker 実行記録への解決先明記規律は (1) の一般化文言に含む。受け入れ条件: (1) パス引数の解決基点と絶対パス標準の適用範囲が恒久契約で明文化、(2) 検証記録にパス引数の解決先の明記規律が定義、(3) 3 回の出現事例の再発条件が恒久規定で防止されることを機械検査または手順検査で確認可能。
  - id: AG-013
    content: |
      （RU-0260・確定）record-comments.ts applySection のセクション置換時における見出し直前空行保持の恒久修正。実測（2026-10-27 コード読取）: applySection は before 末尾の連続改行を除去（replace(/\n+$/, "")）し、置換分岐・追記分岐とも単一 \n 連結のため見出し直前空行が保証されない（Root Case #3820 実発生・現行 HEAD 不変・テストは本文包含のみ検証）。変更対象: src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（置換・追記両分岐、連結前の before 末尾へ空行 1 行保証）+ scripts/tests/record-comments.test.ts（見出し直前空行の回帰検証追加）。制約: 空行付与は before 側で行う（sectionMarkdown 側は先頭行見出し抽出契約を壊すため対象外）。対象外: applyEpicChildStatusUpdates（行内置換）、agentdev_gh issue_update 操作契約・VERIFY 契約、セクション構築関数の出力形式。受け入れ条件: (1) 置換・追記両分岐で見出し直前に空行 1 行保証、(2) 回帰検証追加、(3) 既存セクション構築・適用契約不変。投影（src/common → .opencode）との同期を含める。
  - id: AG-014
    content: |
      （RU-0261・文言確定）agentdev-req-file-manager Design の旧受理記述の canonical DRIFT 解消。実測: docs/designs/skills/agentdev-req-file-manager.md の「実装詳細 > REQ-ID 形式契約の一律性」節に「3桁と4桁の両形式を認識する（d{3,4}）」「採番結果の正規化出力は4桁ゼロ埋め・新規採番結果は4桁へ正規化」の記述が現存し、実装（DEC-062 後の単一共通実装・桁数上限なし・pad3/pad4 最小幅表示）と矛盾。PR #3865 は L40 のみ修正で本節は改訂対象外だった。DEC-062.md の影響節が本件を予告（未実施分）。実現経路: 本再合意内容を Definition Amendment（case-auto 例外経路 case-revise → case-ready）として Design 文言を更新。更新文言（確定・ACT-DESIGN-020 に保存対象 full text を記載）: 受理は形式妥当性のみ（REQ- 接頭辞、ハイフン区切り、数値セグメント、各セグメント最小1桁）・桁数上限なし、関数群は桁数非依存の同一認識契約、表示は pad3/pad4 最小幅表示・切詰めなし・受理上限として機能させない。受入条件（境界条項）: 修正後の文言が numbering-policy.md「識別子形式」節（L26-33・受理上限なし・最小幅表示）と不矛盾、numbering-policy.md:34 の DEC-062 参照 ID 化（AG-001）と干渉しない（参照表記のみで意味変更なし）。完了判定: canonical Design の受理記述と実装・DEC-062 の受理意味論が一致し、numbering-policy 委譲構造を介した参照の整合が維持されること。
  - id: AG-015
    content: |
      （RU-0262・RDQ-5 承認済み）DEC-062 括弧内と IR 側の受理例示表記の文言整理（非意味修正・REQ-001-056 の非意味修正枠・accepted Decision の文言整理）。修正の性質: 意味的不変の文言整理であり diff で意味変化なしを確認する。実測（req-define 要件分析）: 受理意味論の定義基準は DEC-062.md「決定」節に単一存在、IR-067・IR-069 側の description・triage_action・設計要件はすでに現行受理意味論（形式妥当性のみ・桁数上限なし・現行採番帯）と整合しており、残る文言整理対象は (1) DEC-062.md「影響」節の「旧4桁帯」表記を IR-067 の用語「旧4桁番号帯（v2 歴史帯）」へ統一（ACT-DEC-015 に保存対象 full text を記載）、(2) 実装時の diff 照合で他の例示表記に意味変化がないことの確認。境界条項（必須・実施条件）: DEC-062.md「影響」節「IR-067 の旧4桁帯除外（設計要件4、v2 歴史帯）は本 Decision により変更しない」の宣言を守り、変更範囲の明示を修正記録に含める。完了判定: 例示表記が受理意味論と整合し、IR-067 の旧4桁帯除外等の既存仕様が不変（diff で意味変化なし確認）。

# artifact_actions: REQ/Decision/Design への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern。局所修正の old_text/new_text は assemble-draft-section.ts で組立検査済み（op 番号は assembly_evidence 参照）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:backlog-auto-e2e-20261027T034727JST
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015]
    content: |
      新規 REQ（docs 整合・検査体系と機械工程の堅牢化）の目的・要件・受け入れ条件・検証は、
      AG-001〜AG-015 の各作業単位の要求行と受け入れ条件として REQ テーブルへ保存する。
      各行は達成状態が判定可能な命題として書かれ、検証手段は test_strategy（TS-001〜015）に従う。
      行の文言は AG-* の content を REQ 行形式（1列目 ID・2列目本文の2列構造）へ写像したものとし、
      Design 詳細を含まない（最終分類 Jev 判断 20261026T212337Z-a9de・REQ行帰属 confirmed）。
      REQ 新設時の検証対応 3 段確認済み: (1) 全行が達成状態判定可能、(2) 実装実体の所在は各 AG が特定済み、
      (3) 検証手段は TS-001〜015。検証対応の optional 化は行わない（区分B 行の全行 verification 必須・
      REQ-021-028 の規律により本 Definition では policy への optional 登録を行わない）。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-108.md
    source_items: [AG-001]
    content: |
      REQ-108-013 行と REQ-108-014 行の間の空行 1 行を削除し、表を統合する。
      old_text: 「扱わないこと |\n\n| REQ-108-014 |」→ new_text: 「扱わないこと |\n| REQ-108-014 |」（op-01・組立検査 ok）
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-060.md
    source_items: [AG-001]
    content: |
      目的節本文の旧用語を現行用語へ現行化する。
      old_text: 「bun test の全実行形態を「repo root 起 cwd + `./` 付き相対パス指定」に統一し」
      → new_text: 「bun test の全実行形態を「リポジトリルートを cwd にして実行・`./` 付きパス指定」に統一し」（op-02・組立検査 ok）
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-001]
    content: |
      REQ-010-080 行を 071..079 の後・REQ-010-081 行の直前へ移動する。
      操作1（op-03a）: 070 行直後の 080 行を削除。操作2（op-03b）: 079 行と 081 行の間へ 080 行を挿入（両操作とも組立検査 ok）。
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-003]
    content: |
      REQ-010-009 行（IR-044 Design 候補行）を外部契約の要約へ置換する。
      old_text: 「docs-check の checker 個別ルール、検出シグナル、誤検出抑制方式の詳細は Design、skill、script、tests のいずれかが所有すること |」
      → new_text: 「docs-check の検査体系の個別規則、検出条件、誤検出を抑える方式の詳細は Design、skill、script、tests のいずれかが所有すること |」（op-17・組立検査 ok）
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-039.md
    source_items: [AG-009]
    content: |
      REQ-039-007 行末尾へ検査成功/検査不能境界の文言を追加する。
      old_text: 「履歴検査が実行できない環境では採番を確定せず理由を報告すること |」
      new_text: 「履歴検査が実行できない環境では採番を確定せず理由を報告すること。git リポジトリかつコミット 0（git log --all が exit 0・空出力）は使用済み集合が空の検査成功であり、履歴検査不能に該当しない。履歴検査不能とは検査手段の失敗時（非 git、権限欠如、git 破損等）を指し、fail-closed で採番を確定せず理由を報告する |」（op-23・組立検査 ok）
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-001.md
    source_items: [AG-003]
    content: |
      REQ-001-062・REQ-001-067 行（IR-044 Design 候補行）を要約へ置換する。
      062: old_text「追跡可能とすること。具体的なフィールド名、enum、serialization 形式は Design の責務とする |」→ new_text「追跡可能とすること |」（op-12・組立検査 ok。分離基準注記は document-type-responsibilities が正規所有のため REQ 行から分離）
      067: old_text「要件行の主たる文意がスキーマ、enum 値一覧、判定表、テストデータ詳細、Step/Phase 番号、内部アルゴリズム等の設計詳細である場合、当該内容を設計文書、ルールカタログ、コマンドリファレンス、スキルリファレンス、テスト文書のいずれかに分離し、要件行は満たすべき成果を記述すること |」→ new_text「要件行の主たる文意が内部構造、規則、判定表、検証データの形状、手順番号等の設計上の詳細である場合、当該内容を正規所有の設計文書、ルールカタログ、リファレンス、テスト文書のいずれかに分離し、要件行は満たすべき成果を記述すること |」（op-13・組立検査 ok）
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    source_items: [AG-003]
    content: |
      REQ-008-058・REQ-008-059・REQ-008-060 行（IR-044 Design 候補行）を要約へ置換する。
      058: old_text「artifact_actions の operation 公式 enum は REQ、Decision、Design とも create、append、update の3値とし、旧別名（spec-create、spec-update、spec-append）および新別名（design-create、design-update、design-append）を受け付けないこと。」→ new_text「artifact_actions の operation の取り得る値は REQ、Decision、Design とも共通の 3 種（新規作成、追記、更新）とし、旧別名および新別名を受け付けないこと。」（op-14・組立検査 ok。3値の値名・別名列挙は req-define command Design へ移管・design covers 宣言に REQ-008-058 を追加）
      059: old_text「判定は決定的マーカー検査と QG-1 の意味判定の組み合わせにより、禁止事項や過去事例として当該文字列を引用した文を誤検知しないこと。停止時に該当 AG-ID または ACT-ID と理由を auto_gate.stop_reasons へ記録すること。代表 fixture 等の判定詳細は Design（req-define command）の該当節が所有すること |」→ new_text「判定は決定的なマーカー検査と QG-1 の意味判定の組み合わせによること。停止時に該当 AG-ID または ACT-ID と理由を auto_gate.stop_reasons へ記録すること |」（op-15・組立検査 ok。判定詳細は既に req-define command Design が所有〔covers 既存〕）
      060: old_text「realization_actions は ADF 固有の成果物種別や適用プロジェクト固有の成果物種別を固定 enum としないドメイン中立な契約とすること。artifact_actions の責務（REQ / Decision / Design の保存操作）は維持し、実現物種別の enum を追加して責務を混在させないこと |」→ new_text「realization_actions は ADF 固有および適用プロジェクト固有の成果物種別を固定の種別表としないドメイン中立な契約とすること。artifact_actions の責務（REQ / Decision / Design の保存操作）は維持し、実現物種別を混在させないこと |」（op-16・組立検査 ok。design covers 宣言に REQ-008-060 を追加）
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: docs/requirements/REQ-014.md
    source_items: [AG-003]
    content: |
      REQ-014-012 行（IR-044 Design 候補行）を要約へ置換する。
      old_text: 「user-decision-required は case-run result enum の第5状態ではなく、既存結果に付随する case-auto の停止理由分類であること。case-run 起源では blocked、その他の委譲では既存 status と parent_decision_required を使用すること |」
      → new_text: 「user-decision-required は case-run の実行結果に加算される新たな結果状態ではなく、既存結果に付随する case-auto の停止理由分類であること。case-run 起源では停止理由として扱い、その他の委譲では既存の状態と親判断要求を使用すること |」（op-18・組立検査 ok。値名の対応は既に Design 側〔covers 既存〕が所有）
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-003]
    content: |
      REQ-034-031 行（IR-044 Design 候補行）の工程番号表現を要約へ置換する。
      old_text: 「Phase 0 成功（artifact_actions 適用完了）と OU 完了（Issue/PR/Case 完了）は別々に報告すること |」
      → new_text: 「artifact_actions 適用の完了と OU 完了（Issue/PR/Case 完了）は別々に報告すること |」（op-19・組立検査 ok。区分の詳細は case-auto Design が所有〔covers 既存〕）
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    source_items: [AG-003]
    content: |
      REQ-061-035 行（IR-044 Design 候補行）の検証データ詳細表現を要約へ置換する。
      old_text: 「Definition 変更が docs 文言を期待するテスト (repo-local checker fixture を含む) に影響するかを確認する。」
      → new_text: 「Definition 変更が docs 文言を期待する検証（リポジトリ内の検証用データを含む）に影響するかを確認する。」（op-20・組立検査 ok。fixture 扱い詳細は case-ready Design が所有〔covers 既存〕）
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: docs/requirements/REQ-094.md
    source_items: [AG-003]
    content: |
      REQ-094-006 行（IR-044 Design 候補行）の列挙表現を要約へ置換する。
      old_text: 「コマンド名、Skill 名、API 名、YAML / JSON のキー、列挙値、環境変数、ファイル名、パス、コード上の識別子、外部製品・サービス・標準仕様の正式名称を、本要件の文章是正によって変更しないこと |」
      → new_text: 「コマンド名、Skill 名、API 名、YAML / JSON のキーと値の名前、環境変数、ファイル名、パス、コード上の識別子、外部製品・サービス・標準仕様の正式名称を、本要件の文章是正によって変更しないこと |」（op-21・組立検査 ok。分離基準の詳細列挙は document-type-responsibilities が正規所有〔covers 既存〕）
  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: docs/requirements/REQ-103.md
    source_items: [AG-003]
    content: |
      REQ-103-013 行（IR-044 Design 候補行）の列挙表現を要約へ置換する。
      old_text: 「存在確認、型、列挙値、ID、参照関係、明示的フィールド等の決定的に扱える部分を機械的に処理できる） |」
      → new_text: 「存在確認、型、値の名前、ID、参照関係、明示的な構造等の決定的に扱える部分を機械的に処理できる） |」（op-22・組立検査 ok。構造分類の詳細は artifact-contracts が正規所有〔covers 既存〕）
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-004.md
    source_items: [AG-002]
    content: |
      REQ-004-066・REQ-004-067 行の fence マーカー表現を 4 バッククォート囲みへ統一する（REQ-004-066..068 の 9 箇所複製整合の REQ 行）。
      066: old_text「行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し候補・節境界として扱わないこと。閉じの ``` を持たない」→ new_text は同文面の ``` を ```` ``` ```` へ置換（op-08・組立検査 ok）
      067: old_text「コード囲みの認識は行頭の ``` のみを条件とし」→ new_text は同文面の ``` を ```` ``` ```` へ置換（op-09・組立検査 ok）
  - id: ACT-DEC-015
    artifact: decision
    operation: update
    target: docs/decisions/DEC-062.md
    source_items: [AG-015]
    content: |
      「影響」節の例示表記の文言整理（非意味修正・RDQ-5 承認済み・境界条項つき）。
      old_text: 「桁数上限の撤廃により、旧4桁帯の裸ID（例: REQ-0136-029）が受理層で形式妥当として通ることは」
      → new_text: 「桁数上限の撤廃により、旧4桁番号帯（v2 歴史帯）の裸ID（例: REQ-0136-029）が受理層で形式妥当として通ることは」（op-26・組立検査 ok）
      境界条項: 「IR-067 の旧4桁帯除外（設計要件4、v2 歴史帯）は本 Decision により変更しない」の宣言を守る。変更範囲（影響節の例示表記の用語統一のみ）を修正記録に含める。
  - id: ACT-DESIGN-016
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-design-file-manager
    target_area: search-target-area.ts 契約
    source_items: [AG-002]
    content: |
      対象段落の fence マーカー表現を 4 バッククォート囲みへ修正（check_content_corruption 違反 2 件の片側・奇数ラン 3 箇所）。
      old_text: 「行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し・節境界として扱わない。コード囲みの認識は行頭の ``` のみを条件とし、言語指定の有無は条件としない。閉じの ``` がない場合はファイル末尾までを内側とみなす。」
      → new_text: 同文面の ``` 3 箇所を ```` ``` ```` へ置換（op-06・組立検査 ok）
  - id: ACT-DESIGN-017
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: numbering-policy
    target_area: 識別子形式
    source_items: [AG-001, AG-002]
    content: |
      (1) 「識別子形式」節の DEC-062 タイトル文字列参照を ID 参照へ変更: old_text「（「要件ID桁数の受理上限撤廃と表示ゼロ埋め・受理検証の分離」Decision 参照）。」→ new_text「（Decision `DEC-062` 参照）。」（op-04・組立検査 ok・IDX-12・内容記述の変更は不要）
      (2) 「欠番の扱い」節の fence 表現を 4 バッククォート囲みへ統一（2 ラン複製の表現統一）: old_text「行頭（字下げなし）の ``` で開始するコード囲みの内側の行を節境界として扱わない。閉じの ``` がない場合は」→ new_text は同文面の ``` を ```` ``` ```` へ置換（op-05・組立検査 ok）
  - id: ACT-DESIGN-018
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: req-define
    target_area: 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化
    source_items: [AG-002, AG-003]
    content: |
      (1) 「調査委譲の全文機械抽出・安全な書込み・独立作業の並列化」節の fence 表現を 4 バッククォート囲みへ統一（2 ラン複製の表現統一）: old_text「行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し・節境界として扱わないものとする。閉じの ``` がない場合は」→ new_text は同文面の ``` を ```` ``` ```` へ置換（op-10・組立検査 ok）
      (2) 先頭の ADF-COVERS(design) 宣言へ REQ-008-058・REQ-008-060 を追加（REQ-008-059 は既存・IR-044 分離行の design 対応組込み・REQ-009-053 関連の design 契約の正として同 Design が保持）: 宣言行「<!-- ADF-COVERS(design): REQ-008-059, ... -->」に REQ-008-058・REQ-008-060 を挿入。宣言行は見出し前領域のため assemble 対象外とし、適用後の宣言整合は traceability check（declaration 解析・malformed-declarations・unknown-req-refs）が機械検証する。
  - id: ACT-DESIGN-019
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: link profile 実効実行要件
    source_items: [AG-012]
    content: |
      (1) 「link profile 実効実行要件」節の既存 worktree 起動契約の直前に、パス引数全般への絶対パス標準一般化規定を追記（文言確定・op-24・組立検査 ok）:
      「checker および機械工程 script のパス引数（--root、gate spec の --input 等の入力パス）の解決基点は checker・script 起動時の作業ディレクトリ（cwd）であり repo root ではない。パス引数は絶対パスで構成する標準とする。絶対パスで構成しない場合は gate spec の cwd からの相対解決を意図したパスであることを呼出側が明示的に管理し、repo root 基準の相対パスを渡さないこと。checker 実行記録（検証差分・証跡）には root 等のパス引数の解決先（実測絶対パス）を明記すること。」
      gate spec の --input は「非空検査のみ・解決基準は呼出側責任」の現行 flag 契約を変更しない（規律の明示のみ）。
      (2) 先頭の宣言領域へ ADF-COVERS(design): REQ-010-009 を新設（IR-044 分離行の design 対応組込み・docs-check 検査体系の個別規則の正規所有）。宣言行は見出し前領域のため assemble 対象外・適用後は traceability check が機械検証する。
  - id: ACT-DESIGN-020
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: REQ-ID 形式契約の一律性
    source_items: [AG-014]
    content: |
      「実装詳細 > REQ-ID 形式契約の一律性」節の旧受理記述を現行受理意味論（DEC-062）へ更新（文言確定・op-25・組立検査 ok）。Definition Amendment（case-revise → case-ready 経路）として適用する:
      old_text: 「`alloc-composite-id.ts` が提供する複合ID（要件行ID）の抽出・認識関数は、REQ 番号の桁数として3桁（`REQ-001-NNN`）と4桁（`REQ-0011-NNN`）の両方を一貫して認識する。現行 REQ 群は3桁帯、retired の旧 REQ 群（v2:REQ-0001〜0050）は4桁帯である。\n\n関数間で正規表現の桁数契約を不一致させてはならない。\n`extractAllCompositeIds`、`extractCompositeIdNumbers`、`extractReqNumber`、`reqNumberFromFilename` は全て `(\d{3,4})` を用い、3桁と4桁を同一に扱う。\n一部の関数だけ `(\d{4})` に固定する変更を加えてはならない。\n\n採番結果（`formatCompositeId`）の正規化出力は4桁ゼロ埋めとする。\n入力認識は3桁と4桁を許容するが、新規採番結果は4桁へ正規化する。」
      new_text: 「`alloc-composite-id.ts` が提供する複合ID（要件行ID）の抽出・認識関数は、REQ 番号の桁数上限を持たない（DEC-062）。受理検査は形式妥当性のみ（`REQ-` 接頭辞、ハイフン区切り、数値セグメント、各セグメント最小1桁）を検査し、実在性は IR-067・参照実在検査が扱う。\n\n関数間で正規表現の桁数契約を不一致させてはならない。\n`extractAllCompositeIds`、`extractCompositeIdNumbers`、`extractReqNumber`、`reqNumberFromFilename` は同一の桁数非依存の認識契約を用い、任意桁数の REQ 番号を同一に扱う。\n一部の関数だけ桁数を固定する変更を加えてはならない。\n\n採番結果（`formatCompositeId`）の正規化出力は pad3/pad4 の最小幅表示とする。\n表示は切詰めを行わず、表示規則を受理上限として機能させない（DEC-062）。」
      受入条件: numbering-policy「識別子形式」節（受理上限なし・最小幅表示）と不矛盾・:34 の DEC-062 参照 ID 化と干渉なし。採番検証テストの記述（3桁/4桁混在入力の max 検証）は任意桁数の一般形の実例テストとして意味を保ち不矛盾のため維持。
  - id: ACT-DESIGN-021
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: 識別子・命名規範（design covers 宣言領域）
    source_items: [AG-005]
    content: |
      ADF-COVERS(design) 宣言（REQ-001-003, REQ-001-014, REQ-001-015 を含む行）へ REQ-001-069 を追加（missing-design 解消・本文「Designは未確定事項、将来計画、判断宣告を現行設計として保持せず、proposed Decisionを権威引用しないこと」の規範を同文書が正規所有）。宣言行は見出し前領域のため assemble 対象外・適用後は traceability check が機械検証する。
  - id: ACT-DESIGN-022
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: agentdev_gh 操作契約（design covers 宣言領域）
    source_items: [AG-005]
    content: |
      ADF-COVERS(design) 宣言（REQ-009-051, REQ-052-013, REQ-052-014, REQ-052-015 を含む行）へ REQ-052-012 を追加（missing-design 解消・同文書が agentdev_gh 正規経路契約（Plugin設定契約・loader shim・runner-local細目・v4-delegation-contracts 経路）を正規所有）。宣言行は見出し前領域のため assemble 対象外・適用後は traceability check が機械検証する。
  - id: ACT-DESIGN-023
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-responsibility-boundaries
    target_area: ADF判断アーキテクチャ（implementation covers 宣言領域）
    source_items: [AG-005]
    content: |
      ADF-COVERS(implementation) 宣言を新設（REQ-096-010, REQ-096-014, REQ-096-021, REQ-096-025, REQ-096-027, REQ-096-028, REQ-096-029, REQ-096-030・missing-implementation 解消・RDQ-2 (α) 一括 covers 新設）。根拠: 本 Design は REQ-096 判断アーキテクチャの正規実体であり（design covers 全行宣言済み）、本文の決定的処理規範・閉包条件・失敗分類・参照先規定が各該当行の達成を担う。付帯条件（RDQ-2・必須）: REQ-096-028/029/030（消極的宣言・参照行）は適用時に本文規範の実保持を確認し、保持が確認できない行に限り covers を付与せず理由付きで親へ報告する。REQ-096-030 については閉包条件の詳細が本 Design に実在することを req-define 要件分析で事前確認済み。宣言行は見出し前領域のため assemble 対象外・適用後は traceability check が機械検証する。
  - id: ACT-DESIGN-024
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: local ツール package の tsconfig 参照共有と typecheck 検査契約（implementation covers 宣言領域）
    source_items: [AG-005]
    content: |
      ADF-COVERS(implementation) 宣言を新設（REQ-113-001, REQ-113-002・missing-implementation 解消・tsconfig 参照共有と typecheck 組込みの実装対応。verification covers は実装完了時に検証成果物へ付与する）。design covers 宣言（既存）と役割混同せず implementation 役割として宣言。宣言行は見出し前領域のため assemble 対象外・適用後は traceability check が機械検証する。

# conflict_resolutions: 壁打ちで解消された衝突の記録（後続コマンドは同じ内容をユーザーへ再確認しない）
conflict_resolutions:
  - id: CR-001
    conflict: REQ-001-069 の扱い（RU-0249 IR-044 分離対象と RU-0251 missing-design の二重化可能性）
    resolution: 実測で解消。IR-044 warning 11 件の実測リストに REQ-001-069 は含まれない（REQ-001 での検出は -062 と -067）。突合条項は発動せず、REQ-001-069 は RU-0251（design covers 新設）のみで扱う。
  - id: CR-002
    conflict: REQ-010.md の競合（RU-0247 IDX-09 行順序修正と RU-0249 REQ-010-009 分離修正が同一表領域を編集）
    resolution: RU-0249 の depends_on（RU-0247）を operation_units（OU-003 depends_on OU-001）に継承し、行順序修正を先行させる。
  - id: CR-003
    conflict: REQ-098-010 の陳腐化区分（昇格時 missing-implementation スナップショット vs 現行 covers）
    resolution: 実行時再観測条項（BKR-Q3 ①）に従い現行 covers 実測を一次情報とし、REQ-098-010 は解消済みとして対象から外す（RD-003）。
  - id: CR-004
    conflict: REQ-113-001/002 の計数差（13行 vs 11件の不整合）と missing-implementation/missing-verification の二重 RU 化可能性
    resolution: 二重計数説（9行 + 2行×2区分 = 13）を採用し、REQ-113-001/002 の implementation と verification の両解消を単一 OU-005 内で扱う。
  - id: CR-005
    conflict: REQ-096 8行と design/implementation optional 機構の適合性
    resolution: 実測で解消。REQ-096 は v4 cutover 後の新規行（区分B）であり policy 規約により optional 区分化は不可。RDQ-2 (α) により v4-responsibility-boundaries.md へ implementation covers 一括新設（付帯条件つき）。
  - id: CR-006
    conflict: REQ-115 後続実装（AG-007）と REQ-113 解消（AG-005）の品質検査経路の近接
    resolution: 対象 package が異なり競合しない（case-run scripts vs tools/agentdev-gh/local/）ことを実パスで確認。typecheck gate 組込み時に経路共有の可否を突合し、独立 OU として構成。
  - id: CR-007
    conflict: RU-0254（隔離検証リポジトリの管理者側実際の準備・repo 外操作）の本一式への含有
    resolution: RDQ-7 (γ)（Hermes 監督代理回答 2026-10-27）により本一式から除外し後続別要求とする。根拠: (i) 利用者指示の対象制約（staff-schedule-cf 等は操作しない）と GitHub リポジトリ作成の正規操作経路不在（生 gh 書込みは gh-write guard で遮断）により実行不能、(ii) (α) auto_ready: false は他 15 RU の実行と利用者指示（一気通貫実行）に矛盾、(iii) (β) 達成義務の文書化への縮小は完了判定本体（「実際に利用可能」への完結）を未達のまま完了と表示させる。RU-0254.md ファイル自体は削除・編集せず draft RU として req-units に残存し（消費は case-ready の責務）、後続サイクルで正規経路から処理する。set-state 対応表の更新は親が実施。
  - id: CR-008
    conflict: 重要変更の事前通知（STEP-9 ドラフト保存より前の実施義務）
    resolution: 実施済み。STEP-9 より先の HITL 報告（RDQ-1〜RDQ-7 報告メッセージ・2026-10-27）で、既存 REQ（REQ-108/060/010/039 + 8 REQ の 11 行分離）、Design（agentdev-design-file-manager・numbering-policy・checker-execution-contracts・req-file-manager・covers 宣言群）、Decision（DEC-062・非意味修正・RDQ-5）への重要変更について、変更の理由・対象・影響・確定事項と未確認事項を通知した。本 draft 保存は通知後であることを本記録で確認する。

# operation_units: 複数RU入力時の統合/分離結果。RU-0254 は RDQ-7 (γ) により除外（source_ru に含まない）。
# OU 連番は 15 RU 分を RU 昇順で振り直し（RU-0255 以降を繰り上げ）
operation_units:
  - ou_id: OU-001
    source_ru: RU-0247
    target_req: REQ-108
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0248
    target_req: REQ-053
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0249
    target_req: REQ-001
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0250
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0251
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0252
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-0253
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    source_ru: RU-0255
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    source_ru: RU-0256
    target_req: REQ-039
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    source_ru: RU-0257
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
  - ou_id: OU-011
    source_ru: RU-0258
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
  - ou_id: OU-012
    source_ru: RU-0259
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
  - ou_id: OU-013
    source_ru: RU-0260
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
  - ou_id: OU-014
    source_ru: RU-0261
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single
  - ou_id: OU-015
    source_ru: RU-0262
    target_req: new:backlog-auto-e2e-20261027T034727JST
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 15
    issue_policy: single

result: {}

# test_strategy: 3要素構造（verification / pass_criteria / on_failure）。case-specific risk の投影（5観点境界分析）を含む
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-run 適用後、docs-check（REQ 構造検査を含む）を実行し pass すること。加えて: (1) REQ-108.md を読み取り REQ-108-014..024 行が REQ-108-013 行と同一の表として解釈されること（空行が表分断していないこと）を確認、(2) REQ-060.md の目的節に「リポジトリルートを cwd にして実行」の現行用語が存在し旧用語「repo root 起 cwd」が存在しないことを grep で確認、(3) REQ-010.md の要件テーブル行が 070 → 071..079 → 080 → 081 の連番順序で並ぶことを確認、(4) numbering-policy.md:34 に「Decision `DEC-062`」の ID 参照が存在しタイトル文字列参照が残存しないことを grep で確認。検索系検証の網羅範囲（REQ-108.md・REQ-060.md・REQ-010.md・numbering-policy.md）と修正対象列挙（ACT-REQ-002/003/004・ACT-DESIGN-017）は一致する（See Also 参照行は対象外）。
    pass_criteria: |
      docs-check pass・4 項目の grep/構造確認がすべて合格すること。修正対象 4 ファイル以外の docs 正規成果物が変更されていないこと。
    on_failure: |
      fix-and-reverify。表分断の残存・用語残存・順序乱れ・参照 ID 未解決は修正対象行の是正漏れのため、該当行を修正して docs-check を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      check_content_corruption（docs-check 構成検査）を実行し exit 0・違反 0 件であること。加えて 9 箇所複製整合（Design 3・配布 reference 2・script JSDoc 3・REQ 行 1）の該当段落・行の fence 表現（```` ``` ```` 形式）が統一されていることを grep で確認し、2 ラン複製 3 箇所（numbering-policy「欠番の扱い」節・req-define.md 該当節・draft-generation.md「決定的な局所組立・検査」節）の表現も統一されていることを確認する。検索系検証の網羅範囲（対象 5 ファイル + JSDoc 3 ファイル + REQ-004.md）と修正対象列挙（ACT-DESIGN-016/017/018・ACT-REQ-014・RA-008）は一致する。SRC-013J は REQ-001-071 の同一性契約が不変であること（各実装の同一内容記述）を確認。
    pass_criteria: |
      check_content_corruption exit 0・9 箇所複製 + 2 ラン 3 箇所の表現統一確認が合格・対象段落の意味（コード囲み認識規則の文言内容）が不変であること。
    on_failure: |
      fix-and-reverify。違反残存または複製不整合は表現修正の適用漏れのため、該当箇所を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      check_integrity.ts --json を本体実行し、(1) IR-044（req-spec-boundary-violation）の warning が 0 件、(2) pre-demote warning total が 58 以下、(3) IR-055（warning-total-cap）が NG でないことを確認。加えて 11 行の置換後文言が REQ テーブル内で解釈可能な表行として存在すること（op-01〜op-23 の組立検査と同等の構造確認）と、移管内容が移管先 Design（req-define command Design・checker-execution-contracts 等）に存在することを grep で確認。traceability check（コーパス全体）で REQ-001-062/067・REQ-008-058/059/060・REQ-010-009・REQ-014-012・REQ-034-031・REQ-061-035・REQ-094-006・REQ-103-013 の design covers が 0 件 missing でないこと（分離による missing-design の新規発生なし）。
    pass_criteria: |
      IR-044 warning 0 件・pre-demote warning total ≤ 58・IR-055 NG なし・missing-design の新規発生 0 件・cap 変更（ir-055-baseline.json の warning_total_cap 値）が変更されていないこと。
    on_failure: |
      fix-and-reverify。warning 残存は置換文言の検出対象語の残存または移管漏れのため、該当行・移管先を修正して check_integrity を再実行する。
  - id: TS-004
    target_item: AG-004
    verification: |
      check_integrity.ts（IR-073 を含む）を main root 起点で実行し untracked 残存起因の NG が 0 件であることを確認。加えて agentdev-gh テスト実行後に src/common/tools/agentdev-gh/tests/ 配下へ tmp-runner-cli-* が再生成されないこと（テスト実行 + ls 確認）、.tmp-jev-analysis/ が存在しないこと、.gitignore に tmp-runner-cli-* パターンが存在することを確認。
    pass_criteria: |
      IR-073 main root 起点実行で untracked 残存 NG 0・テスト実行後の残骸再生成なし・.tmp-jev-analysis/ 不在・.gitignore パターン存在。
    on_failure: |
      fix-and-reverify。残骸再生成は cleanup 改善の不備のため、テストコード側の一時ディレクトリ管理を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      traceability check（check.ts --root 本体実行・コーパス全体）を実行し、現行実測対象行（REQ-001-069・REQ-052-012・REQ-096-010/014/021/025/027/028/029/030・REQ-113-001/002）の区分外達成義務行が 0 件であることを確認。covers 宣言の整合（ACT-DESIGN-021/022/023/024 の適用後）を malformed-declarations・unknown-req-refs・unknown-roles 検査で確認。REQ-096-028/029/030 の付帯条件確認記録（v4-responsibility-boundaries.md 本文規範の実保持確認結果・RDQ-2 条項）が PR 記録に存在すること。REQ-113-001/002 の implementation（tsconfig extends 統合・typecheck 組込み）が実装済みで検証成果物へ verification covers が付与されていることを確認。
    pass_criteria: |
      対象行の missing-design/missing-implementation/missing-verification が 0 件（現行 covers 状態での再区分結果に対して）・付帯条件確認記録の存在・REQ-113 実装の緑化実証。
    on_failure: |
      fix-and-reverify。covers 宣言の欠落・誤配置は宣言追加の適用漏れのため修正して check を再実行。付帯条件で covers を付与しなかった行は理由付き報告の記録が存在することをもって合格とする（強制付与はしない）。
  - id: TS-006
    target_item: AG-006
    verification: |
      (a) 重複キーを含む sidecar fixture を用いた check_integrity 回帰テストが重複キーを NG 検出すること（テスト実行で確認）、(b) sidecar 更新手順の規定（traceability sidecar 契約・関連 workflow skill の手順規定）に重複キー事前統合ルールが存在することを grep で確認し、手順規定の適用（実更新 1 件での履行）を確認する。
    pass_criteria: |
      回帰テスト pass・手順規定の存在・適用確認の記録。PR #3819 相当の重複が再発時に検出または防止されること。
    on_failure: |
      fix-and-reverify。検出漏れは raw parse 実装の不備、手順規定の不在は規定追記の漏れのため修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      case-run scripts 配下（src/common/skills/agentdev-workflow-case-run/scripts/）の typecheck 実行が緑であること。品質検査経路（QG 系）に typecheck gate が組込まれていることを検査スクリプトの呼出しで確認。bun test 正規形（QG-4 3 cwd 分割実行）の実行経路・検査対象集合が不変であること（変更前後の検査対象一覧突合）。
    pass_criteria: |
      case-run scripts typecheck 緑・gate 組込み確認・QG-4 実行経路と検査対象集合の不変。
    on_failure: |
      fix-and-reverify。QG-4 実行経路の変化は組込み方式の不備のため、既存経路を維持する組込み方式へ修正して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      lint_skills（profile source・全件スキャン）を実行し、agentdev-workflow-phase-artifacts-update の description が 600 chars 以下・AG-005 個別 NG 0 件・description 集約合計が 20300 以下であることを確認。投影（src/common → .opencode）の description が同期していることを突合。
    pass_criteria: |
      個別 NG 0 件（当該 skill）・集約合計 ≤ 20300・投影同期。
    on_failure: |
      fix-and-reverify。削減後も上限超過の場合は top 層からの削減を追加で行い、投影非同期は同期を実施して再検証する。
  - id: TS-009
    target_item: AG-009
    verification: |
      REQ-039.md の REQ-039-007 行を読み取り、追加文言（コミット 0 は検査成功・履歴検査不能は検査手段の失敗時）が含まれることを grep で確認。手続正（integration-judgment.md「履歴検査不能時の fail-closed」）と文言が不矛盾であることを読み取り照合。検索系検証の網羅範囲（REQ-039.md）と修正対象列挙（ACT-REQ-006）は一致する。
    pass_criteria: |
      追加文言の存在・手続正との不矛盾・既存文言（一般形）の削除がないこと。
    on_failure: |
      fix-and-reverify。文言乖離の残存は追加文言の不備のため修正して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      validateInput 分離入口を実行し、(1) 入力妥当性検証（必須ゲート実行体の availability を含む）のみが実行され worktree 作成等の副作用ステップへ到達しないこと、(2) ゲート実行体欠如在時に入力検証が fail-closed（非ゼロ終了・理由報告）で検出されること、(3) consumer の check モードから呼出可能であること、を実際の実行で確認。scripts 契約（README.md 契約文）への入口仕様定義の存在を確認。install.ps1 の check が新設正規入口を呼出すことを確認（旧 dryRun 経路の直接再構成が残存しない）。
    pass_criteria: |
      入口の fail-closed 検出・副作用なし・check モードからの呼出し可・仕様定義の存在・install.ps1 の正規入口呼出し。
    on_failure: |
      fix-and-reverify。副作用到達または検出不能は入口実装の不備のため修正して再検証する。
  - id: TS-011
    target_item: AG-011
    verification: |
      prepare_definition_pr.ts を実行し（Definition PR 生成の実行・または等価な統合テスト）、補正 commit が script 内で完結し手動補正 commit が不要であること（一巡で pass）を確認。definition-pr-and-idempotency.md「計測日収束」節と case-open Design「機械工程の script 呼び出し契約」節が実装と整合することを読み取り確認。
    pass_criteria: |
      手動補正 commit 0 件で Definition PR 生成が一巡で pass・手順文書と script 契約の整合。
    on_failure: |
      fix-and-reverify。補正漏れは検出条件または commit 適用の不備のため修正して再検証する。
  - id: TS-012
    target_item: AG-012
    verification: |
      (1) checker-execution-contracts.md の一般化規定（解決基点の明示・絶対パス標準・記録規律）の存在を grep で確認、(2) case-ready / case-open / case-close の機械工程手順 references に絶対パス構成前置規律が存在することを grep で確認、(3) 3 回の出現事例の再発条件（gate spec に repo root 基準の相対パスを渡す・checker --root に相対パスを渡す）が恒久規定で防止されることを手順検査（規定の適用範囲と再発経路の照合）で確認。検索系検証の網羅範囲（checker-execution-contracts.md + 機械工程手順 references 3 件）と修正対象列挙（ACT-DESIGN-019・RA-002 関連追記）は一致する。
    pass_criteria: |
      受け入れ条件 3 項目（恒久契約での明文化・記録規律の定義・再発防止の確認可能）の充足。
    on_failure: |
      fix-and-reverify。規定の欠落は追記漏れ、再発条件の防止不可は規定の適用範囲不足のため修正して再検証する。
  - id: TS-013
    target_item: AG-013
    verification: |
      record-comments.test.ts の回帰検証（見出し直前空行の検証）を含むテストを実行し緑であること。置換分岐・追記分岐の両方で適用後本文の見出し直前に空行 1 行が保証されることをテスト結果で確認。既存のセクション構築・適用の契約（sectionMarkdown 先頭行が見出しであること等）が不変であることを差分確認。投影（src/common → .opencode）の record-comments.ts が同期していることを突合。
    pass_criteria: |
      回帰テスト pass・両分岐の空行保証・既存契約不変・投影同期。
    on_failure: |
      fix-and-reverify。空行保証の欠落は修正の不備、既存契約の変化は意図しない影響のため修正して再検証する。
  - id: TS-014
    target_item: AG-014
    verification: |
      agentdev-req-file-manager.md「実装詳細 > REQ-ID 形式契約の一律性」節を読み取り、更新後文言（桁数上限なし・形式妥当性のみ・pad3/pad4 最小幅表示）が DEC-062「決定」節の受理意味論と一致することを照合。numbering-policy.md「識別子形式」節と不矛盾であることを照合。numbering-policy.md:34 の DEC-062 参照 ID 化と干渉しないことを確認。検索系検証の網羅範囲（agentdev-req-file-manager.md）と修正対象列挙（ACT-DESIGN-020）は一致する。
    pass_criteria: |
      受理記述と DEC-062 の一致・numbering-policy との不矛盾・委譲構造（詳細は req-file-manager SKILL が定める）を介した参照の整合。
    on_failure: |
      fix-and-reverify。矛盾の残存は文言更新の不完全さのため修正して再照合する。
  - id: TS-015
    target_item: AG-015
    verification: |
      DEC-062.md の適用 diff を確認し、変更が「影響」節の例示表記の用語統一（旧4桁帯 → 旧4桁番号帯（v2 歴史帯））のみであり意味変化がないことを確認。IR-067 の旧4桁帯除外の仕様が不変であること（IR-067 関連行の diff なし・または意味変化なし）を確認。変更範囲の明示が修正記録に含まれることを確認。
    pass_criteria: |
      例示表記が受理意味論（形式妥当性のみ・桁数上限なし）と整合・IR-067 既存仕様不変（diff で意味変化なし）・境界条項の遵守記録。
    on_failure: |
      fix-and-reverify。意味変化の検出は変更対象の誤りのため当該変更を撤去し、対象を限定して再適用する。

# realization_actions: 実現面の変更方針（正規所有責務・変更意図・検証との対応）
realization_actions:
  - id: RA-001
    concern: record-comments.ts applySection の見出し直前空行保持
    responsibility: src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（本番経路 Case Issue 本文更新の正規実装）と scripts/tests/record-comments.test.ts（回帰検証）
    ownership_hints: ["src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts", "src/common/skills/agentdev-workflow-case-run/scripts/tests/record-comments.test.ts"]
    intent: 置換・追記両分岐の連結前に before 末尾へ空行 1 行を保証し、Case Issue 本文の Markdown 構造崩壊（Root Case #3820）を恒久化する
    verification_refs: [TS-013]
    source_items: [AG-013]
  - id: RA-002
    concern: prepare_definition_pr.ts の計測日収束補正自動化と手順契約追随
    responsibility: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（機械工程正規 script）、references/definition-pr-and-idempotency.md「計測日収束」節、docs/designs/commands/case-open.md「機械工程の script 呼び出し契約」節
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts", "src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md", "docs/designs/commands/case-open.md"]
    intent: 機械工程実行のたびに発生する手動補正 commit 2 件（Root Case #3850 実測）を script 内の自動補正 step で完結させる
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-003
    concern: validateInput 分離入口の新設と scripts 契約・install.ps1 切替（RDQ-4 (i)）
    responsibility: 機械工程 script の入力検証入口実装、scripts README 契約文（case-run scripts 配下に新設）、scripts/install.ps1 の check 呼出し先切替
    ownership_hints: ["src/common/skills/agentdev-workflow-case-run/scripts/", "src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts", "scripts/install.ps1"]
    intent: consumer の check がゲート実行体欠如を導入時に検出でき、install.ps1 の重複実装（producer 契約の再構成）を解消する
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-004
    concern: case-run scripts の型検査基盤と typecheck gate 組込み
    responsibility: src/common/skills/agentdev-workflow-case-run/scripts/ 配下の tsconfig.json・package.json 新設と品質検査経路への組込み
    ownership_hints: ["src/common/skills/agentdev-workflow-case-run/scripts/"]
    intent: REQ-115 方針の完結（後続実装要求の履行・QG-4 実行経路不変の維持）
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-005
    concern: traceability sidecar 重複キーの機械検出と手順規定
    responsibility: check_integrity.ts の malformed-declarations 検出拡張（raw parse・重複検出）と sidecar 更新手順規定の追記
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（正本は src/common 配下の integrity 検査体系）", "docs/designs/responsibilities/document-type-responsibilities.md（sidecar 契約の配置参照）"]
    intent: Bun.YAML last-wins による shadow 義務黙失の構造的予防（機械検出 + 手順予防の二層）
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-006
    concern: main root 未追跡残存の物理処置とテスト cleanup 改善
    responsibility: .gitignore（パターン追加）、src/common/tools/agentdev-gh/tests/tmp-runner-cli-*（物理削除）、agentdev-gh テスト（一時ディレクトリ管理改善）、.tmp-jev-analysis/（削除）
    ownership_hints: [".gitignore", "src/common/tools/agentdev-gh/tests/"]
    intent: IR-073 main root 起点実行の pass 回復（リリース前の正常な検証条件の回復）
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-007
    concern: phase-artifacts-update skill description の削減と投影同期
    responsibility: .opencode/skills/agentdev-workflow-phase-artifacts-update/SKILL.md（配布側）と src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md（正本側）の description 削減・同期
    ownership_hints: ["src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md", ".opencode/skills/agentdev-workflow-phase-artifacts-update/SKILL.md"]
    intent: lint_skills AG-005 pre-existing NG の漸進回収と description 集約予算の回収
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-008
    concern: 破損修正・表現統一の配布 reference・JSDoc 側適用（複製整合の実現面）
    responsibility: src/common/skills/agentdev-design-file-manager/references/target-area-matching.md（破損修正・op-07 検査済み）、src/common/skills/agentdev-workflow-req-define/references/draft-generation.md（表現統一・op-11 検査済み）、script JSDoc 3 箇所（search-target-area.ts:46・alloc-req-number.ts:35・assemble-draft-section.ts:102 の表現統一）、各ファイルの投影（src/common → .opencode）同期
    ownership_hints: ["src/common/skills/agentdev-design-file-manager/references/target-area-matching.md", "src/common/skills/agentdev-workflow-req-define/references/draft-generation.md", "src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts", "src/common/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts", "src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts"]
    intent: REQ-004-066..068 の 9 箇所複製整合と docs-check gate fail 回復（表現修正・RDQ-1 (a)）
    verification_refs: [TS-002]
    source_items: [AG-002]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0247
    source_item: IDX-08-knowledge-exclusion
    disposition: covered
    reason_code: in_scope_with_explicit_exclusion
    reason: |
      knowledge 2 件への旧用語現行化の適用は RU 自身が自覚的除外として宣言（REQ-094 の用語現行化の knowledge 適用範囲の確定を要する別判断・docs-check gate fail ではない）。除外を継承し、AG-001 に残余の用語乖離の記録義務を含める。
    evidence:
      path: .agentdev/backlog/req-units/RU-0247.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0249
    source_item: cap-change-option
    disposition: rejected
    reason_code: already_decided_not_adopted
    reason: |
      cap 変更は HITL 代理回答 2026-10-27 で不採用確定（60 warning は IR-044 dead check 解消により顕在化した正当な検出・cap 引上げは実債務の新常態化で ratchet の意味論を弱体化）。本一式では分離修正のみを実施する。
    evidence:
      path: .agentdev/intake/promoted/2026-10-27-ir055-warning-cap-exceeded.md
      section: Sources（確定済み処置）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0251
    source_item: REQ-098-010
    disposition: rejected
    reason_code: already_satisfied
    reason: |
      現行 covers 実測で REQ-098-010 は design covers（project-extensions.md L8）+ implementation covers（agentdev-workflow-req-define.yaml L42）+ verification optional 登録（policy.yaml L836）が揃っており、昇格時点の missing-implementation 区分が陳腐化。実行時再観測条項（BKR-Q3 ①）に従い対象から外す。
    evidence:
      path: .agentdev/backlog/req-units/RU-0251.md
      section: Sources（昇格後の covers 現状実測）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0254
    source_item: isolated-verification-repository-preparation
    disposition: rejected
    reason_code: out_of_scope_by_parent_decision
    reason: |
      RDQ-7 (γ)（Hermes 監督代理回答 2026-10-27）により本一式から除外し後続別要求とする。根拠: (i) 利用者指示の対象制約（agent-dev-flow リポジトリのみ・他サーバーは操作しない）と GitHub リポジトリ作成の正規操作経路不在（生 gh 書込みは gh-write guard で遮断・迂回禁止）により workflow・代行のいずれの経路でも実行不能、(ii) auto_ready: false は残り 15 RU を含む一式全体の case-auto 接続を停止させ利用者指示と矛盾、(iii) 達成義務の文書化への縮小は完了判定本体（「実際に利用可能」への完結）を未達のまま完了と表示させる。RU-0254.md は draft RU として req-units に残存し（削除は case-ready の責務）、後続サイクルで正規経路から処理する。set-state 対応表の更新は親（単一書き手）が実施する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0254.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: [OU-RU-0254]
  - id: RD-005
    source_ru: RU-0262
    source_item: non-meaningful-edit-approval
    disposition: covered
    reason_code: parent_decision_approved
    reason: |
      非意味修正の明示承認（RDQ-5）を取得済み。境界条項（DEC-062.md「影響」節の IR-067 旧4桁帯除外不変宣言・変更範囲の明示）を実施条件として AG-015・ACT-DEC-015 に反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0262.md
      section: 要件化の方向（境界条項）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0251
    source_item: REQ-096-028-029-030-conditional-covers
    disposition: covered
    reason_code: parent_decision_conditional
    reason: |
      RDQ-2 (α) の付帯条件（REQ-096-028/029/030 は適用時に v4-responsibility-boundaries.md 本文規範の実保持を確認し、保持が確認できない行は covers を付与せず理由付きで親へ報告）を AG-005・ACT-DESIGN-023 に反映。REQ-096-030 については閉包条件の詳細が同 Design に実在することを req-define 要件分析で事前確認済み。
    evidence:
      path: docs/designs/foundations/v4-responsibility-boundaries.md
      section: ADF判断アーキテクチャ詳細基準
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: assemble-draft-section.ts（checker version 0.2.0・exact-after-normalization・old_text_count_check）による組立検査の論理サマリ。
# 27 操作すべて ok（--write なし・検査のみ・書込みは case-run 実装時）。op-27〜32（covers 宣言・見出し前領域）は assemble 対象外。
assembly_evidence:
  - target_file: docs/requirements/REQ-108.md（REQ-108-060.md・REQ-010.md・numbering-policy.md・agentdev-design-file-manager.md・target-area-matching.md・REQ-004.md・req-define.md〔docs/designs/commands〕・draft-generation.md・REQ-001.md・REQ-008.md・REQ-014.md・REQ-034.md・REQ-061.md・REQ-094.md・REQ-103.md・REQ-039.md・checker-execution-contracts.md・agentdev-req-file-manager.md・DEC-062.md）
    target_content_sha256: （対象ファイル各 1 件の組立時原文本ハッシュ。検査実行時刻 2026-10-26T21:3xZ・HEAD ebd825a63 時点原文）
    check_scope: 各操作の対象見出し節（target_unique: 1 一致・old_text_expected_count: 1 一致・old_text_removed: ok・assembled_unique: ok）
    execution_conditions: operation=replace × 27（op-01〜op-26 + 修正再実行 3 件〔op-01・op-03b・op-24〕）、edit_sha256 は各操作入力 JSON（.agentdev/tmp/assemble-inputs2.json・requestDigest 運用）、expected_old_count=1
    checker: { name: assemble-draft-section, version: 0.2.0 }
    checks_summary: 27/27 ok。3 操作は初回の old_text 文面不一致（表行終端「|」・new_text 部分包含構造）を修正して再検査し合格
    diff_compact: REQ 行要約置換 11 行・REQ-108 空行削除 1 行・REQ-010 行移動 2 操作・fence 表現統一 6 ファイル・参照 ID 化 1 箇所・絶対パス標準一般化追記 1 箇所・受理記述更新 1 節・DEC-062 用語統一 1 箇所

case_open_hints:
  epic_needed: true # 15 作業単位・複数領域（docs/script/検査/手順）。最終判断は case-open
  decomposition: |
    OU-001〜OU-015（RU-0254 除外済み）。独立作業群として並列実行可能だが OU-003（RU-0249）のみ OU-001 に依存（REQ-010 行順序修正の先行）。
    同一ファイル編集の突合: REQ-010.md は OU-001（行移動）と OU-003（行要約化）が編集 → 順次適用。REQ-004.md・REQ-001.md・REQ-008.md 等は OU 内で複数行編集。
    RU-0254 は RDQ-7 (γ) により本一式から除外（RD-004・後続別要求）。set-state 対応表の更新は親が実施。
  wave_hints:
    - Wave 1: OU-001（docs 機械修正）→ Wave 2: OU-003（IR-044 分離・OU-001 依存）の直列
    - OU-002・OU-004〜OU-015 は相互依存なし・共有並列上限に従い分散配置可
    - OU-005（covers 解消）は covers 宣言適用後に traceability check が gates で必要（検証負荷が高いため早めの投入が望ましい）
```

# summary

（人間可読サマリー・後続工程の正ではない）
本 draft は backlog-auto 一気通貫実行（一式識別子 20261027T034727JST）の stage 4 として、RU 16 件のうち RU-0254 を RDQ-7 (γ) により除外した 15 RU を単一要件doc に確定したものである。
実行時再観測条項（RU-0249 の IR-044 warning 11 件実測・RU-0251 の現行 covers 再区分実測）を完了し、突合条項（REQ-001-069 二重化回避）は不発動を機械実測で確認した。
HITL 代理回答（RDQ-1〜RDQ-7・2026-10-27）を壁打ち合意内容として反映: RU-0248 は (a) 表現修正、REQ-096 は (α) 一括 covers 新設（付帯条件つき）、RU-0252 は (a+b)、RU-0257 は (i) install.ps1 整理を含む、RU-0262 は非意味修正承認、Decision は新規なし、RU-0254 は除外。
組立検査は固定スクリプト（assemble-draft-section 0.2.0）で 27 操作すべて合格（--write なし・適用は case-run 実装時）。Jev 観測 2 件（20261026T211109Z-9e9f・20261026T212337Z-a9de）を永続化済み。重要変更の事前通知はドラフト保存前に実施済み（CR-008）。
