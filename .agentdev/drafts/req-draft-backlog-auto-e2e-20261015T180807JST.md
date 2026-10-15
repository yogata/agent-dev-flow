---
draft_type: req_draft
topic_slug: backlog-auto-e2e-20261015T180807JST
status: draft
created_at: 2026-10-15T22:58:40+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-0009
  - RU-0010
  - RU-0011
  - RU-0012
  - RU-0013
  - RU-0014
---

# draft-data

```yaml
work_type: feature
scale: large
summary: backlog-auto 一気通貫 run 20261015T180807JST stage4 の 14 RU 一式を単一要件doc として確定するドラフト。既存 REQ への APPEND 補強 6 件（REQ-030/061/010/017/095）、Design update 3 件（backlog-auto workflow/command Design、runtime-package-boundary.md、content-corruption-checker）、REQ 保存なしの修復・是正作業 5 件（RU-0003/0005/0006/0007、RU-0004 節1）から構成する。壁打ち判断 4 件はユーザー回答（2026-10-15）により確定済み（Q1: 整合先 (a) + labels 空配列既定、Q2: DS18 集約・REQ-114 節指針化、Q3: RU-0003 already_satisfied 承認、Q4: 分解計画承認〔Epic 構成 hint 含む〕）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: case-ready 受入検査 script（accept_definition_checks.ts）の overlap-cross-check step 要約生成は、engine 報告 JSON の構造化警告結果（condition_a.warnings、detection_unavailable）を実件数どおり反映する。summary の契約を報告 JSON 構造に合わせ、top-level warnings を読む実装を解消する。unavailable 状態を 0 件と誤表示しない。consumer（case-ready 側）は警告確認時に要約だけでなく保存済み stdout 原証跡を検査する規律を手順として明示する。Issue #3680（CLOSED 済み）との競合調整を計画に記録する（CR-002）。
  - id: AG-002
    content: case-open prepare_definition_pr の traceability gate 入力組立て・検証に、判定対象 REQ 集合（traceabilityReqIds）の存在・有効性検証を追加する。欠落・空・不整合入力は gate 実行前に fail-closed で報告し、空配列への暗黙正規化を入力不備の隠蔽に使わない。gate 対象（--req 指定）と判定対象集合の関係が手順で明確であることを維持する。fail-closed gate 性を維持する。
  - id: AG-003
    content: 新規 REQ 行を伴う Definition 変更で case-open STEP-4 traceability gate が報告する構造的 fail（対象行の missing-implementation / missing-verification）の扱いは、現行 reference 手順（definition-pr-and-idempotency.md gate 判定仕様節）に既に明文化されている（missing-design は対象 REQ 行のみ 0 件を Definition 段階の正規ゲート、missing-implementation/verification は warn で PR 拒否理由にしない、case-run / case-close の未完了義務として列挙）。Case #3627 との統合・重複判定の結論: 既存明文化が本 RU の要求内容を充足する（already_satisfied）。gate fail を設計PR の作成停止と誤読しない判断根拠は同節から一意に導出可能であることを実読確認済み。本項は新規操作を持たず、判定結論の記録（CR-001・RD-003）のみを保存する。
  - id: AG-004
    content: frontmatter `updated` 鮮度債務の一括是正スイープを実施する。対象は strict 10 件・heuristic 1 件・IR-072 11 件の重複統合後の実一覧（実施時に check_integrity 実測で確定する）。req-health-metrics.md を含む AUTOGEN 派生物の generate_indexes 再生成手順を伴う。鮮度検査を緩和・迂回せず、updated を実変更日と乖離させた恒久的放置にしない。AUTOGEN ブロックの手動編集を行わない。
  - id: AG-005
    content: frontmatter 鮮度債務の実施単位・タイミングの運用判断を確定し、REQ 行として恒久契約化する。検出時都度進行を既定とし（他 Case merge 起因の IR-072 進行は、検出した Case の docs 操作を伴わない場合でも日次バッチに累積せず検出時に是正チケットとして扱う）、REQ 操作を伴わない Case での鮮度検査違反は「自 Case 起因分離証明の常態化手間」を生む一括是正候補として check_integrity 補正 commit の標準 contingency に位置づける。運用判断の詳細は ACT-REQ-003 の content で確定する。
  - id: AG-006
    content: bun test 全件実行の既存失敗 2 件（IR-055 delta 回帰テスト、ローカルIssue role 条件付きスキーマテスト）を解消し、比較 worktree での自 Case 起因分離証明を不要とする。IR-055 baseline 更新（--update-ir055-baseline）は可とし、role 条件付きスキーマテストの期待値修正を実態に合わせ実施する。LF→CRLF warning は fixture 対策（.gitattributes の fixture 除外調整等）を実施し警告を静音化する。失敗の握り潰し・テストの無効化は行わない。既存 Issue #3684 との処遇調整を計画に記録する（CR-003）。
  - id: AG-007
    content: phase 系 skill 6 件の src/common/skills 存在に対する .opencode/skills projection 欠落（IR-068 NG 6 件）を解消する。PR #3701 実施済みの投影登録内容と IR-068 検出条件（junction 存在確認か manifest 登録確認か）の乖離所在を実測で特定し、乖離の所在に応じて junction 再構築（ローカル環境作業）または manifest 是正を選択して修復する。IR-068 検出条件の緩和・迂回は行わない。既存 Issue #3684 との処遇調整を計画に記録する（CR-003）。
  - id: AG-008
    content: prepare_definition_pr.ts の pre-existing 型エラー 4 件（TS18048×2・TS2783×2）を解消する。as any 等での握り潰しを行わない。typecheck gate 組込み要否の結論: REQ-113 の typecheck 組込み対象は local package〔agentdev-gh〕であり、case-open scripts 配下は対象外である。本件は既存 4 件の解消に留め、case-open scripts 配下への typecheck gate 新規組込みは本一式の範囲外とする（結論を計画に記録）。RU-0002 と同一スクリプトに接触するため同一 Wave 内並列編集を行わない。
  - id: AG-009
    content: agentdev_gh issue_create の labels 必須契約と case-open workflow skill reference（root-case-and-definition-package.md 手順6）の任意付与記述の文書間整合を取る。整合先はユーザー判断（2026-10-15）により (a) で確定: reference 手順6へ「Tool 契約上 labels は必須フィールドであり起票時は空配列以上を渡す。付与するラベル値の選択は任意」の注記を追加し、REQ-095 へ呼出側規律の新規行を APPEND する（fail-closed 維持・最小変更）。work_type ラベルは空配列既定とする（呼出側が都度判断し、起票時の既定付与は設けない）。labels 省略呼出を許す解釈余地を解消し、labels 未指定による再試行が生じない状態にする。fail-closed 拒否の緩和・迂回は行わず、Tool 実装側の変更は本一式の範囲外とする。
  - id: AG-010
    content: REQ 追加を伴う Definition 変更では、docs/README.md 手動管理区間の件数記述の照合を初回の変更・検証範囲に含める。REQ 行数由来の派生物が stage paths に事前包含できない場合（generate_indexes 派生物の構造的事後確定）の検出・補正・証跡は既存の事後突合 contingency 手順に従い、補正 commit を標準経路として扱う。integrity gate の不一致検出を維持し、件数不一致を成功扱いにしない。
  - id: AG-011
    content: Case / Issue / PR 本文の書込み手順に、適用対象の workflow extension rules を書込み前に解決・適用する必須前置工程を明示する。case-open / case-ready / case-run の各 references に前置工程を追加し、agentdev-project-extensions の実行時 rules 解決契約と接続する。extension から適用される規則を削除・弱化せず、投稿後の検査を前置規律の代替にしない。
  - id: AG-012
    content: lint_skills の aggregate description budget warning の運用の扱いを確定する。(1) 集約予算の解消方針: description 削減の継続実施を単独 docs 作業としてバッチ化せず、次回 skill 変更時に top 層から余剰を回収する漸進回収とする（一括削減は本一式の範囲外）。(2) 出力の NG/warning 区別: lint_skills 出力 summary に NG（検証不通過）と warning（傾向管理）の件数区別を明示し、AG-005 層1 正規定義の warn 性質と determineExitCode の warning 駆動 exit 1 の整合を維持する。(3) ローカルユーザースキル走査: git 管理外ローカルユーザースキル 4 件の USE FOR / DO NOT USE FOR トリガー欠落 warning は、実行環境ラベル（main root 実行時のみ検出の環境差）として記録し走査対象は維持する（baseline 登録・無視は行わない）。AG-005 層1 正規定義の変更と warning の隠蔽は行わない。
  - id: AG-013
    content: backlog-auto Design 2 ファイルの表現是正を行う。DS18: workflow skill Design（docs/designs/skills/agentdev-workflow-backlog-auto.md）内の契約文逐語二重保持（set-state 記録内容 :80/:116、基準点確認手続 :89/:118、リリース手順シーケンス :96-101/:120）を是正する。処置方針はユーザー判断（2026-10-15）により集約で確定: 上段の個別見出し節群（set-state 永続化形式・基準点確認手続・リリース手順シーケンスと再開経路）を正とし、下段「一気通貫実行の実行構造（REQ-114）」節の逐語重複部分を REQ-114 節指針化（節参照）に置換して集約する。DS20: command Design（docs/designs/commands/backlog-auto.md）:80-81 の審議参照の裸列挙（RU-0227 AC-01〜AC-09、対論型レビュー F-A/F-C/F-D/E-1/E-2/E-4/F-E/N-2）に参照先の所在指示を付す（様式は単純な所在指示に統一する）。DS21: command Design の対象外重複（:78 側 bullet を REQ-114 対象外への参照または削除に置換）を解消する。REQ-114 本体・AC-01〜AC-09 は一切変更・縮約しない。実行前提: Case #3725 完了・PR #3727 取り込み後着手を遵守する。REQ-114 反映未完了群（DB02/DS17/DS19）の処理は範囲外とする。
  - id: AG-014
    content: docs/designs/local/runtime-package-boundary.md の文意品質是正を行う。DS23: :488 の「卡out」を「carve-out 対象」へ修正する。DS24: :51 の「（REQ-009, REQ-009, REQ-009）」を「REQ-009」1 回へ集約する（条項番号の明示は不要とする。単一 REQ への帰属で足りる）。意味内容の変更は行わない。
  - id: AG-015
    content: docs-check に意図しない異言語文字混入（DS23 同種）を機械検出する検査ルールを追加する。差分化確認の結論: 既存 content-corruption checker は foreign-script（CJK 統合漢字は対象外）と simplified-chinese（簡体字↔日本語字形ペア辞書 4 ペア〔实/态/义/项〕）を所有し、「卡」（U+5361、CJK 統合漢字かつ日本語常用字形で字形ペアが同一コードポイント）は両カテゴリで検出不能である。したがって simplified-chinese 辞書拡張は不可（辞書構造が「異字形ペア」前提のため）であり、既存 checker の検出平面を変更せず新シグナルとして「既知混入形の確定一致検出」を追加する: 混入実績由来の確定一致文字列（「卡out」等）を Design 節で列挙管理し、checker 実装は列挙に従い検出する。docs/designs 走査対象を含む。誤検出 0（確定一致のため）、未知混入は簡体字辞書の既存経路（RU-0144・Case #3243 前例）で追随する。checker-execution-contracts Design の detector 命名規約・宣言的データ原則に整合させる。広すぎる Unicode 検査は行わない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-061
    source_items: [AG-001]
    content: |
      | REQ-061-062 | case-ready は受入検査の要約生成において、engine 報告 JSON の構造化警告結果（condition_a.warnings、detection_unavailable）を実件数どおり要約へ反映すること。要約の構造を報告 JSON 契約に合わせ、報告に存在しないフィールドの参照や unavailable 状態の 0 件誤表示をしないこと | 要約生成の回帰テストで、warnings 1 件・unavailable 1 件の engine 報告を入力した要約が実件数と状態を正しく反映すること | 回帰テスト実行 |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-030
    source_items: [AG-002]
    content: |
      | REQ-030-031 | case-open は traceability gate を有効にする入力では、判定対象 REQ 集合の存在と有効性を実行前に検証すること。gate 実行範囲（--req 指定）と判定対象集合の不整合、欠落、空の入力は fail-closed で報告し、空配列への暗黙正規化で入力不備を隠蔽しないこと | 判定対象集合欠落・空・不整合入力で gate 実行前に fail-closed 報告が発生し、正当な入力で必要検査が実行されること | 回帰テスト実行 |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-010
    source_items: [AG-005]
    content: |
      | REQ-010-081 | docs-check または CI は frontmatter `updated` 鮮度債務（req-updated-freshness / req-range-staleness / IR-072）の検出時、是正を実施単位・タイミングの運用判断に従って扱うこと。検出時都度の是正チケット扱いを既定とし、REQ 操作を伴わない Case での鮮度違反は自 Case 起因分離証明を要する一括是正候補として check_integrity 補正 commit の標準 contingency に位置づけること。鮮度検査の緩和・迂回と updated の乖離恒久化を行わないこと | 運用判断が REQ 行として記録され、check_integrity 鮮度検査が exit 1 常態でなくなること | REQ・Design 記録突合 |
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-095
    source_items: [AG-009]
    content: |
      | REQ-095-096 | agentdev_gh issue_create の起票呼出側は、labels が Tool 契約上の必須フィールドであることを運用文書から参照できること。起票時は空配列以上を渡し、付与するラベル値の選択は任意である（検索・整理用ラベルの任意付与契約は値の選択を指し、フィールド存在を免除しない）。起票時の既定付与は設けず、呼出側が都度判断すること | 起票手順の参照先文書に labels 必須契約と値選択任意の区別が記載され、labels 未指定による拒否・再試行が生じないこと | 運用文書記載突合 |
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-017
    source_items: [AG-011]
    content: |
      | REQ-017-024 | case-open / case-ready / case-run は Case / Issue / PR 本文の書込み前に、適用対象の workflow extension rules を解決・適用する必須前置工程を持つこと。投稿後の検査を前置規律の代替にしないこと | 各手順に前置工程が記載され、rules が要求する前処理が書込み前に適用されていること | 手順記載の機械検索 |
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: REQ-030
    source_items: [AG-010]
    content: |
      | REQ-030-032 | case-open は REQ 追加を伴う Definition Package 生成時に、docs/README.md 手動管理区間の件数記述の照合を初回の変更・検証範囲に含めること。REQ 行数由来の派生物が stage paths に事前包含できない場合は、事後突合と明示パス指定補正 commit を標準 contingency として扱い、検出・補正・証跡を記録すること | REQ 追加時に手動管理区間件数照合が手順上必須であり、派生物補正の証跡が残ること | 手順記載の機械検索 |
  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: REQ-010
    source_items: [AG-012]
    content: |
      | REQ-010-082 | docs-check の lint_skills は、検証不通過（NG）と傾向管理（warning）を summary で区別して報告し、warning 存在時の運用（集約予算の漸進回収、git 管理外ローカルユーザースキルの環境差記録）を運用方針として確定して運用すること。warning の無視・抑制による隠蔽を行わないこと | lint_skills 出力に NG/warning 区別が存在し、運用方針の決定が記録されていること | lint_skills 実行確認 |
  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: REQ-010
    source_items: [AG-015]
    content: |
      | REQ-010-083 | docs-check は意図しない異言語文字混入（既知混入形の確定一致）を docs design 本文を含む走査対象で機械検出する検査ルールを持ち、既存検出平面（content-corruption checker）との差分化を確認済みであること | DS23 同種の混入形が docs-check で機械検出され、回帰テストが存在すること | 回帰テスト実行 |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-backlog-auto
    target: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_area: 下段「一気通貫実行の実行構造（REQ-114）」節（逐語重複部分の集約。上段個別見出し節群〔set-state 永続化形式・基準点確認手続・リリース手順シーケンスと再開経路〕を正として維持）
    source_items: [AG-013]
    content: |
      DS18 是正（ユーザー判断 2026-10-15 により集約方針で確定）: 下段「一気通貫実行の実行構造（REQ-114）」節内で上段個別見出し節群と逐語一致する部分（set-state 永続化形式、単一書き手規則、基準点確認手続、全体完了突合手続、リリース手順シーケンスと再開経路、委譲）を、REQ-114 節指針化に置換する。すなわち当該 bullet を「詳細は本 Design 上段の「set-state 永続化形式」「基準点確認手続」「全体完了突合手続」「リリース手順シーケンスと再開経路」の各節を参照（REQ-114 実行構造の正規記述）」旨の節参照に置換し、下段節は orchestration stage 構成など重複しない記述のみを保持する。REQ-114 本体・AC-01〜09 は一切変更・縮約しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: backlog-auto
    target: docs/designs/commands/backlog-auto.md
    target_area: 一気通貫実行の拡張（REQ-114）節および対象外節
    source_items: [AG-013]
    content: |
      DS20 是正: 検証観点 bullet の「RU-0227 AC-01〜AC-09」「対論型レビュー F-A/F-C/F-D/E-1/E-2/E-4/F-E/N-2」の裸列挙を、参照先の所在指示付きの記述へ置換する（REQ-114 の詳細受入条件と対論型レビュー審議記録の所在を明示。様式は既存審議アンカー慣行との対比を行わず単純な所在指示に統一する）。
      DS21 是正: 対象外記載の二重出現（:78 側 bullet「子ワークフロー内部ロジックの再実装、Epic/Wave 構成規則・共有並列上限・依存判断の再定義」を REQ-114 対象外節への参照または削除に置換）を解消する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target: docs/designs/local/runtime-package-boundary.md
    target_area: 現行の境界（2026-07-03 時点）節および link mode 接続節
    source_items: [AG-014]
    content: |
      DS23 是正: :488「REQ-001 の `repo-*` 卡out 対象」を「REQ-001 の `repo-*` carve-out 対象」へ修正する。
      DS24 是正: :51「`consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009, REQ-009, REQ-009）。」を「`consumer-generated` はローカル版 OpenCode を link mode で導入する利用側リポジトリである（REQ-009）。」へ集約する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: content-corruption-checker
    target: docs/designs/integrity/content-corruption-checker.md
    target_area: 検出対象（検出カテゴリ表）および検出シグナル節
    source_items: [AG-015]
    content: |
      新シグナル（既知混入形の確定一致検出、detector 命名規約に従う）を検出カテゴリ表へ追加する。
      検出対象: 混入実績由来の確定一致文字列（初期登録: 「卡out」。docs/designs/local/runtime-package-boundary.md DS23 実績）。
      検出平面: 文字平面（charScan）に準拠（frontmatter を除く全行）。
      列挙管理: 本 Design 節が列挙の正であり、checker 実装は列挙に従い、列挙外の除外を独自に追加しない。混入実績発生時に列挙へ追記する。
      許容例: 確定一致のため誤検出は構造的に発生しない（正当な「カード」等の片仮名語は「卡out」文字列に一致しない）。
      差分化記録: foreign-script は CJK 統合漢字を対象外とし、simplified-chinese は簡体字↔日本語字形ペア（異字形前提）であるため、「卡」等の同字形混入は両カテゴリで検出不能である。本シグナルは列挙後確認ではなく決定的検査クラス（REQ-053-012）の確定一致として位置づける。
      回帰テスト: 「卡out」を含む fixture で検出されること、正当な日本語文で検出されないことを fixture 追加で固定する。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0003（新規 REQ 行の構造的 fail の扱いの reference 明文化要求）と Case #3627（CLOSED、case-open STEP-4 機械工程手順の reference 明文化）の成果物が同一 reference（definition-pr-and-idempotency.md gate 判定仕様節）で重複する。
    resolution: 現行 reference の gate 判定仕様節（missing-design 対象行 0 件を正規ゲート、missing-implementation/verification は warn で PR 拒否理由にしない、case-run / case-close への未完了義務列挙）が RU-0003 の要求内容と受入基準 1・3 を充足するため、RU-0003 は already_satisfied（REQ 操作なし・結論記録のみ）と判定する。ユーザー承認済み（Q3、2026-10-15。差し戻しなしで確定）。
  - id: CR-002
    conflict: RU-0001 の調整事項「Issue #3680（同一スクリプトの git status 列解析修正）との競合調整」。Issue #3680 は 2026-10-15 時点で CLOSED（完了済み）である。
    resolution: 機能的競合は #3680 完了で解消済み。accept_definition_checks.ts への同一スクリプト接触は残るため、同一 Wave 内の並列編集を行わない実装順調整として計画に記録する。
  - id: CR-003
    conflict: RU-0005 と RU-0006 が共通の既存処遇 Issue #3684（IR-068/IR-055 債務の処遇 Case）を参照する。depends_on は RU-ID のみ許容のため RU 間依存として記録できない。
    resolution: Issue #3684 は外部の既存追跡単位であり depends_on に記録しない。両 RU とも処遇調整の前置確認（Issue #3684 の現行状態と本一式との重複がないことの確認）を各自の実装計画に含める。
  - id: CR-004
    conflict: RU-0004 は機械是正論点（節1）と運用設計論点（節2）で独立に要件化可能な構成を保持する。
    resolution: source の N:1 統合はユーザー承認済み（Q2=a、2026-10-15）のため統合維持とする。節1（一時是正作業・REQ 保存なし）と節2（運用判断の恒久契約・REQ-010 APPEND）を agreed_items（AG-004/AG-005）と operation_units（OU-004）で分離表現し、単一 RU・単一 OU 内で節独立性を保つ。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-061
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-030
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    source_ru: RU-0003
    target_req:
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    source_ru: RU-0004
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    source_ru: RU-0005
    target_req:
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    source_ru: RU-0006
    target_req:
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    source_ru: RU-0007
    target_req:
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    source_ru: RU-0008
    target_req: REQ-095
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    source_ru: RU-0009
    target_req: REQ-030
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    source_ru: RU-0010
    target_req: REQ-017
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
  - ou_id: OU-011
    source_ru: RU-0011
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
  - ou_id: OU-012
    source_ru: RU-0012
    target_req:
    target_design: docs/designs/skills/agentdev-workflow-backlog-auto.md および docs/designs/commands/backlog-auto.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
  - ou_id: OU-013
    source_ru: RU-0013
    target_req:
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
  - ou_id: OU-014
    source_ru: RU-0014
    target_req: REQ-010
    target_design: docs/designs/integrity/content-corruption-checker.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      accept_definition_checks.test.ts（実配置: src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts）へ回帰テストを追加し、warnings 1 件・detection_unavailable 1 件の engine 報告 JSON を要約生成へ入力する。bun test で実行する。
    pass_criteria: |
      要約が condition_a.warnings の実件数（1）を表示し、unavailable 状態を 0 件と誤表示しないこと。consumer 手順（case-ready reference）に stdout 原証跡検査規律の記載が存在すること（機械検索）。
    on_failure: |
      fix-and-reverify（要約生成ロジックまたは fixture の修正で消去可能なため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      prepare_definition_pr.ts の入力検証回帰テストを実行する: traceabilityReqIds 欠落・空・不整合の各入力と、妥当な対象集合を含む正当入力。
    pass_criteria: |
      欠落・空・不整合入力で gate 実行前に fail-closed（終了コード 1）で報告され、正当な入力で必要検査が実行されること。
    on_failure: |
      fix-and-reverify（入力検証ロジックの修正で消去可能なため）。
  - id: TS-003
    target_item: AG-003
    verification: |
      definition-pr-and-idempotency.md の gate 判定仕様節に対し、missing-implementation / missing-verification / warn の記述を機械検索（rg）し、CR-001 の判定結論と RD-003 の記録内容との一致を確認する。
    pass_criteria: |
      同節に「対象行の missing-implementation / missing-verification を warn 扱いとし設計PR を拒否しない」旨の明文化が存在し、RD-003 の結論と一致すること。
    on_failure: |
      fix-and-reverify（明文化の不在判明時は reference 追記を Definition に組込み、RD-003 を covered に修正する）。
  - id: TS-004
    target_item: AG-004
    verification: |
      是正実施後に check_integrity を実行し、req-updated-freshness（strict）・req-range-staleness（heuristic）・IR-072 の該当違反件数を実測する。req-health-metrics.md は generate_indexes 再生成後の AUTOGEN と突合する。
    pass_criteria: |
      鮮度債務対象の違反が 0 件であり、AUTOGEN 派生物が実ファイルと一致していること。
    on_failure: |
      fix-and-reverify（対象一覧の漏れ・日ズレ再発生時は対象追記と再 commit で収束させる）。
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-010 に追記した運用判断行（ACT-REQ-003）と draft content の逐語突合を行う（PR 差分確認）。
    pass_criteria: |
      追記行が合意 content と一致し、REQ・Design 記録突合を通過すること。
    on_failure: |
      fix-and-reverify（content 乖離時は REQ 行を修正して再突合する）。
  - id: TS-006
    target_item: AG-006
    verification: |
      bun test 全件実行（repo root・`./` 付きパス指定）を実施し、既存債務起因の失敗件数を実測する。
    pass_criteria: |
      既存失敗 2 件（IR-055 delta 回帰・role 条件付きスキーマテスト）が解消され全件 pass し、比較 worktree での分離証明が不要な水準であること。LF→CRLF warning の静音化も確認する。
    on_failure: |
      fix-and-reverify（テスト期待値・fixture・baseline の修正で消去可能なため。握り潰し・スキップは行わない）。
  - id: TS-007
    target_item: AG-007
    verification: |
      check_integrity（source profile）を main root 実行で実施し、IR-068 の NG 件数を実測する。
    pass_criteria: |
      IR-068 NG 6 件が解消（0 件）であること。修復方式の決定（junction 再構築 / manifest 是正）と乖離所在の結論が実行記録に残っていること。
    on_failure: |
      fix-and-reverify（乖離所在の再特定と修復方式の選択し直しを行う。検出条件の緩和・迂回は行わない）。
  - id: TS-008
    target_item: AG-008
    verification: |
      prepare_definition_pr.ts 配下で typecheck を実行し、TS18048・TS2783 の該当エラー件数を実測する。
    pass_criteria: |
      pre-existing 4 件が解消（0 件）であること。typecheck gate 組込み要否の結論（対象外・範囲外）が計画に記録されていること。
    on_failure: |
      fix-and-reverify（型修正の追補で消去可能。as any での消し込みは行わない）。
  - id: TS-009
    target_item: AG-009
    verification: |
      Q1 確定後の整合対象文書（reference 手順6または custom-tool-contracts.md）と REQ-095 追記行に対し、labels 必須契約と値選択任意の記述の機械検索を実施する。
    pass_criteria: |
      labels 省略呼出を許す解釈余地の記述が残存せず、整合先文書と REQ 行の記述が一致していること。
    on_failure: |
      fix-and-reverify（記述の修正・追記で消去可能なため）。
  - id: TS-010
    target_item: AG-010
    verification: |
      REQ-030 追記行（ACT-REQ-006）と definition-pr-and-idempotency.md の手順記載（計測日収束・generate_indexes 派生物の事後突合 contingency）の対応を機械検索で確認する。
    pass_criteria: |
      REQ 行が合意 content と一致し、手順側の既存 contingency 記述と矛盾しないこと。
    on_failure: |
      fix-and-reverify（REQ 行または手順の修正で消去可能なため）。
  - id: TS-011
    target_item: AG-011
    verification: |
      case-open / case-ready / case-run の各 references に対し、書込み前 extension rules 確認の前置工程記載を機械検索（rg）する。
    pass_criteria: |
      3 ファイルすべてに前置工程の記載が存在し、agentdev-project-extensions の実行時 rules 解決契約への接続が明示されていること。
    on_failure: |
      fix-and-reverify（手順追記の漏れを補う）。
  - id: TS-012
    target_item: AG-012
    verification: |
      lint_skills を実行し、出力 summary の NG/warning 区別の表示を確認する。運用方針（AG-012 の 3 判断）と REQ-010 追記行（ACT-REQ-007）の突合を行う。
    pass_criteria: |
      出力に NG/warning 区別が存在し、運用方針の決定が REQ 行として記録されていること。warning の隠蔽が発生していないこと。
    on_failure: |
      fix-and-reverify（出力実装または REQ 行の修正で消去可能なため）。
  - id: TS-013
    target_item: AG-013
    verification: |
      是正後の workflow skill Design に対し、set-state 記録内容・基準点確認手続・リリース手順シーケンスの記述箇所数を機械検索で計数する。docs/requirements/REQ-114.md が本一式の変更対象に含まれないことを変更ファイル一覧から確認する（git diff --name-only 実測。req-define 生成時点では draft の artifact_actions 対象一覧から確認する）。
    pass_criteria: |
      Q2 確定方針どおりの二重保持解消（集約先 1 箇所または同期義務明記）であり、REQ-114.md 本体・AC-01〜09 が不変であること。DS20・DS21 の是正済み記述が所在指示付きで存在すること。
    on_failure: |
      fix-and-reverify（是正漏れ・REQ-114 触り込みを検出時に修正する）。
  - id: TS-014
    target_item: AG-014
    verification: |
      runtime-package-boundary.md に対し、「卡」および「REQ-009, REQ-009, REQ-009」の機械検索（rg）を実施する。
    pass_criteria: |
      「卡」0 件（carve-out 修正済み）、「REQ-009, REQ-009, REQ-009」0 件（単一参照へ集約済み）であること。意味内容の変更が発生していないこと（差分行数が是正対象 2 箇所に限定）。
    on_failure: |
      fix-and-reverify（是正の再適用で消去可能なため）。
  - id: TS-015
    target_item: AG-015
    verification: |
      check_content_corruption.test.ts へ fixture を追加し、「卡out」を含む違反例と、正当な「カード」等を含む正常例で checker を実行する。content-corruption-checker.md の新シグナル節と checker 実装・テストの突合を行う。
    pass_criteria: |
      違反例で新シグナルが検出され、正常例で検出されないこと。差分化確認の結論が Design 節に記録されていること。
    on_failure: |
      fix-and-reverify（検出実装・fixture・列挙の修正で消去可能なため）。

realization_actions:
  - id: RA-001
    concern: accept_definition_checks.ts の overlap 要約生成の修正と回帰テスト追加
    responsibility: case-ready 受入検査 script の要約生成は engine 報告 JSON 契約（CrossDependencyInspectionReport）に従う。AG-001 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（2026-10-15 実測で配置確定）", "src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts（回帰テスト追加先）", "case-ready references（consumer 規律の明示先）"]
    intent: 要約が engine 報告の構造化警告結果（condition_a.warnings・detection_unavailable）を実件数で反映し、consumer が stdout 原証跡を検査する規律を手順化する
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: prepare_definition_pr.ts の traceability gate 入力検証追加
    responsibility: case-open scripts の入力検証は fail-closed を維持する。AG-002 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts", "references/definition-pr-and-idempotency.md（手順の関係明確化）"]
    intent: 判定対象 REQ 集合の欠落・空・不整合を gate 実行前に検出し、空配列暗黙正規化による隠蔽を防ぐ
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: frontmatter updated 鮮度債務の是正スイープと AUTOGEN 再生成
    responsibility: 一時是正作業（恒久契約の保存対象外）。AG-004 を正とする
    ownership_hints: ["docs/requirements/REQ-*.md（実一覧は実施時 check_integrity 実測で確定）", "docs/designs/quality/req-health-metrics.md（AUTOGEN 再生成）", "docs/designs/ 配下の対象 Design ファイル（IR-072 11 件の既知対象を含む）"]
    intent: check_integrity の鮮度起因 exit 1 常態を解消し、自 Case 起因分離証明を不要とする
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-004
    concern: bun test 既存失敗 2 件の修正と fixture 対策
    responsibility: テスト債務の解消。AG-006 を正とする
    ownership_hints: ["IR-055 delta 回帰テスト（baseline 更新 --update-ir055-baseline）", "ローカルIssue role 条件付きスキーマテスト（期待値修正）", ".gitattributes（fixture LF→CRLF 調整）"]
    intent: bun test 全件実行を既存債務起因失敗なしの緑化にし、比較 worktree 分離証明を不要とする
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-005
    concern: phase 系 skill 6 件の .opencode/skills projection 修復
    responsibility: 配布投影構造の修復（検出条件は変更しない）。AG-007 を正とする
    ownership_hints: ["src/opencode/skills/ の junction または projection manifest（実配置実測後に修復方式確定）", "check_integrity source profile（検証手段）"]
    intent: IR-068 NG 6 件を解消し、phase 系 skill 参照が投影から解決できる状態にする
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-006
    concern: prepare_definition_pr.ts の pre-existing 型エラー 4 件の解消
    responsibility: 型修正（握り潰し禁止）。AG-008 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts"]
    intent: TS18048×2・TS2783×2 を解消し、同スクリプト触り Case の型エラー分離手間を解消する
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-007
    concern: case-open reference 手順6への labels 契約注記追加（Q1 回答 (a) 時）
    responsibility: 配布 reference の記述修正。AG-009 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md（手順6）"]
    intent: labels が Tool 契約上必須フィールドであり、値の選択が任意である旨の解釈整合を取る
    verification_refs: [TS-009]
    source_items: [AG-009]
  - id: RA-008
    concern: case-open reference への REQ 追加時件数照合手順の追記
    responsibility: 配布 reference の手順補強。AG-010 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（計測日収束・派生物事後突合 contingency 周辺）"]
    intent: REQ 追加時の手動管理区間件数照合を初回の変更・検証範囲に含める手順を明確化する
    verification_refs: [TS-010]
    source_items: [AG-010]
  - id: RA-009
    concern: case-open / case-ready / case-run references への書込み前 extension rules 前置工程追記
    responsibility: 配布 reference の手順補強。AG-011 を正とする
    ownership_hints: ["src/common/skills/agentdev-workflow-case-open/references/（PR 作成・本文更新手順）", "src/common/skills/agentdev-workflow-case-ready/references/execution-contract.md", "src/common/skills/agentdev-workflow-case-run/references/（委譲・本文更新手順）"]
    intent: GitHub 本文書込み前に適用対象の workflow extension rules を解決・適用する必須工程を前置する
    verification_refs: [TS-011]
    source_items: [AG-011]
  - id: RA-010
    concern: lint_skills の出力 NG/warning 区別とローカルユーザースキル走査記録の調整
    responsibility: repo-local 検査 script の出力調整（運用方針の恒久契約は REQ-010 行が正）。AG-012 を正とする
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts と cli_utils.ts（determineExitCode）の実配置実測後に確定"]
    intent: warning 存在時の exit 1 が出力上の区別と整合し、環境差 warning の取扱いが運用方針どおりになる
    verification_refs: [TS-012]
    source_items: [AG-012]
  - id: RA-011
    concern: backlog-auto Design 2 ファイルと runtime-package-boundary.md の表現是正
    responsibility: Design 本文の表現是正（意味内容不変）。AG-013・AG-014 を正とする
    ownership_hints: ["docs/designs/skills/agentdev-workflow-backlog-auto.md（DS18。Q2 方針適用）", "docs/designs/commands/backlog-auto.md（DS20・DS21）", "docs/designs/local/runtime-package-boundary.md（DS23・DS24）"]
    intent: 単一参照点原則（REQ-001）に沿った Design 表現へ是正し、二重編集義務の暗黙化と陳腐化温床を解消する。実行前提: Case #3725 完了・PR #3727 取り込み後着手
    verification_refs: [TS-013, TS-014]
    source_items: [AG-013, AG-014]
  - id: RA-012
    concern: content-corruption checker への既知混入形確定一致シグナル追加と回帰テスト
    responsibility: checker 実装と Design 節の列挙管理。AG-015 を正とする
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.ts", "docs/designs/integrity/content-corruption-checker.md（検出カテゴリ表・検出シグナル節・許容例列挙節）"]
    intent: DS23 同種の異言語文字混入を docs-check で機械検出可能にする
    verification_refs: [TS-015]
    source_items: [AG-015]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: overlap 要約の構造化警告反映（AG-001）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      learning と intake の N:1 統合（α統合）をそのまま AG-001 として採用。受入義務 4 項目は ACT-REQ-001（REQ-061 APPEND）、ACT-DESIGN-004 関連の consumer 規律（case-ready reference 明示は RA-001 ownership_hints）、CR-002（Issue #3680 調整記録）、TS-001（回帰テスト）に全対応。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: traceability gate 入力対象集合の明示・検証（AG-002）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目は ACT-REQ-002（REQ-030 APPEND）、RA-002（script 入力検証）、TS-002（回帰テスト）に対応。RU-0003 との同一 reference 接触は wave_hints で実装順調整として計画に記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: 新規 REQ 行の構造的 fail の扱いの明文化（AG-003）
    disposition: covered
    reason_code: already_satisfied
    reason: |
      Case #3627（CLOSED）成果とみられる明文化が definition-pr-and-idempotency.md gate 判定仕様節に既存し、受入基準 1（明文化済み）と 3（判断根拠の一意導出）を充足。受入基準 2（Case #3627 との統合・重複判定の結論記録）は CR-001 として本ドラフトに記録。新規 REQ 操作は不要。already_satisfied 処置はユーザー承認済み（Q3、2026-10-15）で確定。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md
      section: traceability check の gate 判定仕様と計測日収束
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: frontmatter 鮮度債務の是正と運用整理（AG-004・AG-005）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      節1（機械是正）は RA-003 + TS-004、節2（運用判断）は ACT-REQ-003（REQ-010 APPEND）+ TS-005 に対応。節独立性は CR-004 で処理。受け入れ義務 4 項目すべてに対応（updated 是正・運用判断記録・AUTOGEN 再生成手順・exit 1 常態解消）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0005
    source_item: bun test 既存失敗 2 件の解消（AG-006）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 4 項目（全件 pass・baseline 更新結論・期待値修正方針・fixture 対策要否結論）は AG-006 content に確定判断として記録し、RA-004 + TS-006 が実行・検証する。Issue #3684 処遇調整は CR-003 で記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0006
    source_item: IR-068 projection 欠落の解消（AG-007）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目（IR-068 解消・乖離所在結論・修復方式決定）は AG-007 content に確定方針（実測後に方式選択）を記録し、RA-005 + TS-007 が実行・検証する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0007
    source_item: prepare_definition_pr.ts 型エラー 4 件の解消（AG-008）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 2 項目（4 件解消・typecheck gate 組込み要否結論）は AG-008 content に結論記録（case-open scripts 配下は REQ-113 対象外・新規組込みは範囲外）を含め、RA-006 + TS-008 が実行・検証する。RU-0002 との同一スクリプト接触は wave_hints で処理。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0008
    source_item: labels 必須契約と reference 任意付与記述の整合（AG-009）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目（整合先確定と文書整合実施・解釈余地解消・再試行解消）は、Q1 回答 (a)（2026-10-15 ユーザー判断）で確定: reference 手順6注記追加（RA-007）+ REQ-095 呼出側規律 APPEND（ACT-REQ-004・REQ-095-096）+ TS-009。work_type ラベルは空配列既定（Q1-2 回答）で ACT-REQ-004 content に記録済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0009
    source_item: REQ 追加時の手動件数記述と派生物の同期（AG-010）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目は ACT-REQ-006（REQ-030 APPEND）+ RA-008 + TS-010 に対応。integrity gate 不一致検出の維持は AG-010 content の制約として記録。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0010
    source_item: GitHub 本文書込み前の extension rules 確認（AG-011）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目は ACT-REQ-005（REQ-017 APPEND）+ RA-009（3 references 追記）+ TS-011 に対応。
    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0011
    source_item: lint_skills aggregate budget warning の運用整理（AG-012）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目（解消方針決定・NG/warning 区別方針・走査扱い決定）は AG-012 content に確定判断として記録し、ACT-REQ-007（REQ-010 APPEND）+ RA-010 + TS-012 が対応する。AG-005 層1 正規定義の変更禁止は AG-012 制約として維持。
    evidence:
      path: .agentdev/backlog/req-units/RU-0011.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0012
    source_item: backlog-auto Design 2 ファイルの表現是正（AG-013）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      DS20・DS21 の是正内容は ACT-DESIGN-002 に確定記録。DS18 の処置方針は Q2 回答 (a)（2026-10-15 ユーザー判断）で上段個別見出し節群を正とする集約・REQ-114 節指針化で確定し ACT-DESIGN-001 content に反映。REQ-114 本体・AC-01〜09 不変と実行前提（Case #3725 完了・PR #3727 取り込み後着手）は AG-013 制約および RA-011 intent に記録。TS-013 が不変性検証を担う。
    evidence:
      path: .agentdev/backlog/req-units/RU-0012.md
      section: 合意内容
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0013
    source_item: runtime-package-boundary.md の文意品質是正（AG-014）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      受入義務 3 項目は ACT-DESIGN-003 + TS-014 に対応。「卡out」→「carve-out 対象」修正と三重引用集約の content は確定済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0013.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0014
    source_item: docs-check への異言語文字混入検出ルール追加（AG-015）
    disposition: covered
    reason_code: ru_agreed_as_is
    reason: |
      必須調査事項（既存 checker との差分化確認）を実施済み: 「卡」は foreign-script 対象外（CJK 統合漢字）かつ simplified-chinese 辞書構造（異字形ペア前提）で検出不能であることを content-corruption-checker.md 実読で確認。差分化結論（既知混入形の確定一致新シグナル・列挙管理・決定的検査クラス位置づけ）を ACT-DESIGN-004 content に記録。受入義務 3 項目（差分化結論記録・検出対象/方式/対象集合確定・DS23 同種の機械検出可能化）は ACT-REQ-008 + ACT-DESIGN-004 + RA-012 + TS-015 に対応。checker-execution-contracts Design（detector 命名規約・宣言的データ原則）との整合も ACT-DESIGN-004 content に記録。
    evidence:
      path: docs/designs/integrity/content-corruption-checker.md
      section: 検出対象（10 検出カテゴリ）
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale large（複数 REQ またがる APPEND 6 件・design update 3 件・修復作業 5 件・影響ファイル 10 超）。OU-001〜OU-014 を case-open の execution_unit 構成で分解する。クラスタ参考: (1) REQ 補強系〔OU-001/002/004節2/008/009/010/011/012/014〕、(2) 修復・債務解消系〔OU-004節1/005/006/007〕、(3) Design 是正系〔OU-003 結論記録/012/013〕。最終 Issue 構成は case-open が REQ-114-004（共有 active Issue task 上限と横断補充、グループ逐次化禁止）に従い決定する。
  wave_hints:
    - "同一 reference 接触（definition-pr-and-idempotency.md）: OU-002・OU-003〔既存明文化の接触はなし・結論記録のみ〕・OU-009 は同一 Wave 内並列編集不可（実装順調整）"
    - "同一スクリプト接触（prepare_definition_pr.ts）: OU-002 と OU-007 は同一 Wave 内並列編集不可。型エラー修正（OU-007）の先行を推奨"
    - "OU-013（runtime-package-boundary 是正）を OU-014（checker ルール追加）より先行推奨（是正後にルール追加検査が自然に通る）"
    - "OU-005 と OU-006 は Issue #3684 の処遇調整前置確認を各自が実施（依存ではなく前置確認）"
    - "OU-012 は Case #3725 完了・PR #3727 取り込み後着手の実行前提を持つ（先着手禁止）"
    - "OU-003 は結論記録のみ（CR-001・RD-003 参照）であり本文書操作を持たない。operation: update は実行単位の構成参照用の便宜的値であり、artifact action の存在を意味しない"
    - "分解計画はユーザー承認済み（Q4、2026-10-15）: operation_units 14 件 + 上記 wave_hints + epic_needed: true で確定"
```

# summary

backlog-auto 一気通貫 run 20261015T180807JST stage4 の 14 RU 一式を単一要件doc として確定するドラフトである。

構成: REQ への APPEND 補強 6 件（REQ-061〔受入検査要約〕・REQ-030〔traceability gate 入力検証・件数照合同期〕・REQ-010〔鮮度運用・lint_skills 運用・異言語文字検出〕・REQ-017〔書込み前 extension rules〕・REQ-095〔labels 呼出側規律・暫定〕）、Design update 3 件（backlog-auto workflow Design〔DS18〕・backlog-auto command Design〔DS20/DS21〕・runtime-package-boundary.md〔DS23/DS24〕）、REQ 保存なしの修復・是正 5 件（RU-0003 already_satisfied 結論記録・RU-0004 節1 鮮度是正スイープ・RU-0005 bun test・RU-0006 IR-068・RU-0007 型エラー）。

未確定の壁打ち判断 4 件はユーザー回答（2026-10-15）により確定済み: Q1（RU-0008 整合先 (a)・labels 空配列既定）、Q2（RU-0012 DS18 集約・REQ-114 節指針化）、Q3（RU-0003 already_satisfied 承認・差し戻しなし）、Q4（分解計画承認・operation_units 14 件 + wave_hints + epic_needed: true）。回答反映後の STEP-8 adversarial-review 実施結果と最終確定内容は本ファイルに反映済み。
