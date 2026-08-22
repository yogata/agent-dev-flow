---
draft_type: req_draft
topic_slug: backlog-ru-batch-digestion
status: saved
design_actions_consumed: true
created_at: 2026-08-22T18:42:31+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009]
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  2026-08-22 backlog-review が生成した RU-0001〜RU-0009 の9件を単一要件doc（feature/large）として一括要件化する。
  各 RU は既存REQ体系（REQ-007/010/018/027/029/031/032/038/044/046/047）の適用・合流が大半であり、
  REQ 追記は REQ-010（検査強化2行）と REQ-032（残留チェック1行）の最小 APPEND に限定する。
  Design 補完は checker 実行契約・整合性契約・IR-055・em-dash 節の4件（design-save 経由）。
  残る全変更は配布物 skill・command/template・docs コーパス是正の実行 case として OU 10件
  （RU-0005 の learning-pipeline 是正のみ優先先行の独立 OU）に構成し、RU 間依存
  （RU-0003→0009→0001、RU-0008→0007）は OU depends_on で表現する。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      RU-0003: checker スクリプトの実行契約と整合性 Design の未明文化部分を補完する。
      checker-execution-contracts Design へ (a) CLI 引数解析の標準API（bun parseargs）移行約束、
      (b) 再帰ファイル探索の node:fs glob 移行とエラー伝播方針、(c) 列挙件数突合規約・起動 cwd 前提・
      glob 共通ヘルパー限定（checker 走査信頼性契約）を追記する。
      integrity-contracts Design へ (d) 参照パス導入の列挙化、(e) NG baseline 運用手順節への
      衝突時 semantic（max 採用）と baseline 環境別表記統合を追記する。
      integrity-rule-catalog の IR-055 プレースホルダ表記を確定する。
      document-type-responsibilities の em-dash 置換形式節の表現を追随させる（判定は機械的で影響なし）。
      標準API移行は REQ-044 の状態制約と DEC-019 の所有境界に従う。
  - id: AG-002
    content: |
      RU-0009: doc-writing 系 skill の機械置換・参照検証手順を正式化する。
      機械置換は old 側 grep 実在確認と置換後 MISS 確認を前提とする設計原則、
      参照実在確認と変動値分離（相対行番号等の変動値を行内容から分離）の查読観点を
      agentdev-doc-writing / agentdev-design-file-manager / agentdev-req-file-manager へ反映する。
      checker-execution-contracts へ data yaml 宣言的データ運用の追記（新設時の消費者実装同時確定）を
      RU-0003 の確定後に追随させる。本手順が RU-0001 コーパス機械是正の実行手順の正規の所有者となる。
  - id: AG-003
    content: |
      RU-0004: docs 整合性検査体系を強化する。
      (a) docs が引用する REQ の実在性を機械検査する新規検査を docs-check へ追加する
      （REQ-010 へ恒常検査行として APPEND）。
      (b) v1〜v4 監査検出漏れ対象の再走査と新規機械検査クラスの整備候補を評価し、
      採用したものを検査クラスとして追加する（REQ-010 へ APPEND）。
      (c) check-test-impact の走査対象ディレクトリと SCAN_EXCLUDE_DIRS の整合を修正する。
      (d) inspect F-01 の検査側面として src 側と .opencode 投影のスキル集合突合を docs-check 検査データ化する。
      junction 再構築（install -Mode apply 再実行）自体は局所運用タスクであり PR 成果外とし、
      case-open 時の案内として記録する。新規検査クラスには REQ-010-068 準拠の回帰テストを付す。
  - id: AG-004
    content: |
      RU-0001: 判定規則確定済みの様式違反を docs および配布物 SPEC コーパス全体で機械是正する。
      対象は (a) skill SPEC 36ファイル中31ファイルの一文一行（X-4）違反、
      (b) skill SPEC 共通見出しの中黒形式（テンプレート _template.md 起因の横断是正）、
      (c) em-dash プレースホルダセル置換（元4セルのうち agentdev-artifact-graph SKILL.md 1セルは
      DEC-017 によりスキル撤去済みで対象不存在のため3セルとする。由緒を要件docに明記済み）、
      (d) docs/requirements 2ファイル・docs/decisions 1ファイルの X-4 違反74行。
      一括是正時は AUTOGEN 索引再生成（RU-0007 の前置化手順）と checker 影響の事前確認を前提とする。
      一文一行是正の旧側 grep 実在確認・MISS 確認は RU-0009 が正式化する手順に従う。
      実行順序は RU-0003・RU-0007・RU-0009 の確定後（OU depends_on で表現）。
      完了証拠は REQ-007-001/002（意味論的に妥当な対象範囲で再検索0件と PR 本文記録）に従う。
  - id: AG-005
    content: |
      RU-0002: docs 体系と配布テンプレートに残存する旧構造を正規化し、docs 整合 chore を処理する。
      (a) system.md の旧 Step 構造記述43行の残存解消、(b) 正規の5箇所以外での旧 Step 参照解消、
      (c) workflow-skill-model Design の STEP ラベル文言不一致解消、
      (d) epic-wave-model Design の旧 REQ-006 行 ID 残存解消、
      (e) integrity-contracts の節参照と REQ-036-008/009/010 の不一致解消、
      (f) index-auto-generation の旧称タイトル残存解消、
      (g) repo 版 docs-check テンプレートの旧 Step ラベル残存解消。
      旧 REQ 番号・行 ID 参照の再配線方針（現行 ID へ振替 vs 履歴文脈注記）は
      req036-section-ref・spec-old-rowid・F-04 design-save の3系統について本ケースで統一決定する。
      (h) inspect F-02: DEC-016/017 の status 昇格評価（proposed → accepted 相当）を Decision 運用の範囲で処理。
      (i) inspect F-03: src/opencode/commands/agentdev/templates/integrity-check/standard.md を削除
      （docs-check 旧称・参照元なし）。
      (j) inspect F-06: docs/reports/local/ を .gitignore へ追加（HITL 方針確定済み・未実行）。
  - id: AG-006
    content: |
      RU-0005: 配布物 skill の修正群。(a) backlog-review/case-auto Workflow Skill へ soft guard 宣言追加
      （フル suite 恒常 2 fail の解消、テスト修正を含む）、
      (b) agentdev-project-extensions の SKILL.md description と SPEC（DO NOT USE FOR 節）の追従、
      (c) agentdev-gh-cli references/local-*.md の一文一行違反6行の機械是正、
      (d) agentdev-gh-cli 書き込み手続きへの mkdir 前提条件の明記、
      (e) git-worktree 手続きの main 固定文言と同期リスク記述の修正、
      (f) agentdev-traceability description 644字の600字上限への修復（即時修復とする。
      lint-skills-baseline.json 登録は不採用）、
      (g) worktree-operations.md の AG-005 違反2ソースは現行253行で違反解消済みのため是正不要の確認のみ、
      (h) learning pipeline 是正: promote-judgment-logic.md L97 の旧「自動確定禁止」文言を
      REQ-038-002 自律確定原則へ合流是正する（実行時解釈不定の現行障害のため最優先。
      OU-001 として独立分離・優先先行）。
  - id: AG-007
    content: |
      RU-006: command 定義・template・skill ガイダンスの仕様修正群。
      (a) intake-promote 完了報告 template へ欠落 field（保留件数・自律確定根拠等）の追加、
      (b) agentdev-command-authoring の delegated_check 記述サンプルの現行手続きへの更新、
      (c) SPEC バッチ更新時の未定義用語横断確認手続きの追加
      （docs-check 検査候補化は AG-003 の検査強化と連動して判断）、
      (d) case-close E5b 判定への字母後綴（a/b）形式の考慮追加、
      (e) Epic Wave クローズ時の一時成果物残留チェックの追加（REQ-032 へ APPEND）。
  - id: AG-008
    content: |
      RU-0008: git-worktree skill の手続きにテスト環境前提を明記し、
      bun test のフル suite 正規形（3 cwd 分割実行・./ prefix・環境ラベル）を品質統制側に確定する。
      反映先は agentdev-git-worktree / agentdev-quality-gates / agentdev-workflow-case-run references の3 skill。
      正規形の規定は本 RU が所有し、RU-0007（必須化・機械受理）はこの確定後に続く（OU depends_on）。
  - id: AG-009
    content: |
      RU-0007: case-run command の運用手順改善3件。
      (a) AUTOGEN 索引の再生成前置化（SPEC 行数変更に伴う索引再生成を case-run 前段で強制。
      PR 2253 の E5b 停止再発防止。RU-0001 コーパス是正の実行前提）、
      (b) 配布依存境界 gate の徹底（src/.opencode 双方への反映検証を gate 化。DEC-014 の適用強化）、
      (c) フル suite 実行の機械受理化（手動判断の排除。REQ-007-006〜008 の由来分類・環境記録契約に基づく）。
      workflow skill（agentdev-workflow-case-run）と品質統制へ反映する。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-003]
    content: |
      | REQ-010-069 | docs-check は docs 本文が引用する REQ 識別子の実在性を機械検査すること。
      テンプレート・例示のプレースホルダーは REQ-010-065 の許容条件に従って誤検出しないこと |
      | REQ-010-070 | docs-check は過去監査（v1〜v4）で検出漏れとなった対象の再走査結果をうけ、
      採用した新規機械検査クラスを検査体系へ追加すること。追加検査は REQ-010-068 の回帰テスト義務に従うこと |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-007]
    content: |
      | REQ-032-022 | case-close は Epic Wave クローズ時に当該 Wave スコープの一時成果物
      （draft・RU・検出事項等のドメイン状態）残留を確認し、残留時は完了扱いにしないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: 再帰ファイル探索と CLI 引数解析の標準API移行
    source_items: [AG-001, AG-002]
    content: |
      checker 実行契約の補完（RU-0003 + RU-0009 data yaml 追随を同一ファイルへ集約）:
      - CLI 引数解析は bun parseargs 標準APIへの移行を約束し、独自解析の二重経路を残さない（REQ-044-001 準拠）
      - 再帰ファイル探索は node:fs glob（新規 glob 共通ヘルパー限定）へ移行し、エラー伝播方針を明記する
      - 列挙件数突合規約と checker 起動 cwd 前提を契約化する（走査信頼性）
      - data yaml 宣言的データ運用: data yaml 新設時は消費者実装を同時確定する
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: integrity-contracts
    target_area: NG baseline 運用手順
    source_items: [AG-001]
    content: |
      整合性契約の補完:
      - 参照パス導入の列挙化（許容参照パスを明示的に列挙する）
      - NG baseline 運用手順節へ衝突時 semantic（max 採用）を明文化する
      - baseline の環境別表記統合と導入運用（環境差異の統合記録）
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: IR-055
    source_items: [AG-001]
    content: |
      IR-055 プレースホルダ表記の確定: プレースホルダセルに em-dash（—）を使用しない置換表記を
      正規のものとして確定する（判別基準は PR 2271 で確定済み。規則確定と是正の分離により、
      是正実行は AG-004 コーパス機械是正が担う）
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: em-dash 置換形式
    source_items: [AG-001]
    content: |
      em-dash 置換形式節の表現追随: IR-055 確定表記（ACT-DESIGN-003）との表現整合に合わせる。
      実装運用への影響なし・判定は機械的。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 9 RU 一括要件化の構成（単一要件doc vs work_type 別3 doc 分割）
    resolution: |
      単一要件doc（feature/large）に統合する。依存グラフ（RU-0003→0009→0001、RU-0008→0007）が
      doc 内 OU depends_on で完結し、case-open が Epic/Wave 構成で順序制御できるため。
      分割案は doc 間実行順序管理がユーザー側に残るため不採用。
      RU-0003 が design-save 経由を要求するため work_type は feature 一択。
      docs_chore 性の要件行は artifact_actions と req-save 時の操作分類（APPEND/UPDATE）で吸収する。
  - id: CR-002
    conflict: RU-0005 の学び是正の優先扱い（RU 全体を通常ソートに任せる vs 依存を逆方向制御に使う）
    resolution: |
      depends_on を逆方向の優先制御に使わず、RU-0005 全体を1 OU の通常ソートにも戻さない。
      learning-pipeline 是正（実行時解釈不定の現行障害）のみを独立 OU-001 として分離し、
      優先度情報（recommended_order: 1、case_open_hints の先行指示）で Wave 1 先行を指示する。
      RU-0005 残りの skill 修正群は独立 OU（依存なし通常ソート）とする。
  - id: CR-003
    conflict: agentdev-traceability description 644字超過の対処（即時修復 vs lint-skills-baseline.json 登録）
    resolution: |
      即時修復とする。恒常違反ではない一時的な肥大化のため baseline 登録は不採用。
      修復は AG-006(f) として OU（RU-0005 残り）で実行する。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_req: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    # RU-0005 のうち learning-pipeline 是正（AG-006(h)）のみ。優先先行（CR-002）
  - ou_id: OU-002
    source_ru: RU-0003
    target_req: null
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    # ACT-DESIGN-001〜004 を消費（design-save 経由）。AG-001
  - ou_id: OU-003
    source_ru: RU-0008
    target_req: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
    # AG-008。bun test 正規形の確定者が RU-0007 の前提
  - ou_id: OU-004
    source_ru: RU-0005
    target_req: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
    # RU-0005 残り（AG-006(a)〜(g)。学び是正以外の skill 修正群）
  - ou_id: OU-005
    source_ru: RU-0004
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-001
      saved_reqs: [REQ-010]
      appended_row_ids: [REQ-010-069, REQ-010-070]
      source_ru: RU-0004
    # ACT-REQ-001 を消費。AG-003。RU-0002 是正方針（OU-007）と連動するが順序依存なし
  - ou_id: OU-006
    source_ru: RU-0006
    target_req: REQ-032
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-002
      saved_reqs: [REQ-032]
      appended_row_ids: [REQ-032-022]
      source_ru: RU-0006
    # ACT-REQ-002 を消費。AG-007
  - ou_id: OU-007
    source_ru: RU-0002
    target_req: null
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
    # AG-005。旧 REQ 参照再配線方針を本 OU で統一決定
  - ou_id: OU-008
    source_ru: RU-0007
    target_req: null
    operation: create
    scale: standard
    depends_on: [OU-003]
    recommended_order: 2
    issue_policy: single
    result: {}
    # AG-009。フル suite 正規形は RU-0008（OU-003）確定後に必須化（RU-0007 depends_on: RU-0008）
  - ou_id: OU-009
    source_ru: RU-0009
    target_req: null
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    operation: create
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
    # AG-002。data yaml 追記は RU-0003（OU-002）確定後に追随（RU-0009 depends_on: RU-0003）
  - ou_id: OU-010
    source_ru: RU-0001
    target_req: null
    operation: create
    scale: large
    depends_on: [OU-002, OU-008, OU-009]
    recommended_order: 4
    issue_policy: single
    result: {}
    # AG-004。コーパス機械是正。RU-0003/0007/0009 の確定が実行前提（RU-0001 depends_on）

# test_strategy: 各合意項目の検証方法。3要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      design-save 実行後、checker-execution-contracts・integrity-contracts の追記節と
      integrity-rule-catalog IR-055・document-type-responsibilities em-dash 節の更新を確認する。
      docs-check（/repo/docs-check）を 実行して Design 系検査の合格を確認する。
      AUTOGEN ブロックの鮮度検査（REQ-010-059）が合格することを確認する。
    pass_criteria: |
      4 Design の追記・更新が存在し、docs-check が Design 関連検査で fail 0件、
      AUTOGEN 鮮度検査が合格していること。
    on_failure: |
      fix-and-reverify: Design 追記内容または AUTOGEN 再生成を修正し再検証する。
      Design 契約の不備は検査 fail のまま完了宣言しない（実行契約上の必須品質統制）。
  - id: TS-002
    target_item: AG-002
    verification: |
      agentdev-doc-writing / agentdev-design-file-manager / agentdev-req-file-manager の
      該当 reference に機械置換手順（old 側 grep 実在確認・MISS 確認）と参照検査観点
      （参照実在確認・変動値分離）が反映されていることを確認する。
      checker-execution-contracts の data yaml 節が RU-0003 確定後に追記され、
      消費者実装の同時確定（data yaml とその消費者の対）が成立していることを確認する。
    pass_criteria: |
      3 skill への手順反映と checker-execution-contracts data yaml 節の追記が存在し、
      data yaml の消費者実装が同時に確定していること。
    on_failure: |
      fix-and-reverify: 反映漏れ・消費者欠落を修正し再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      新規検査クラスごとに正常例・違反例・境界例・許容例・過去再現例を含む回帰テストが
      存在すること（REQ-010-068）を確認する。引用 REQ 実在性検査・スキル集合突合・
      check-test-impact 整合修正後の docs-check とテストスイートを実行する。
    pass_criteria: |
      新規検査クラスの回帰テストが5種の例を持ち、docs-check が fail 0件、
      既存 checker テストが全件 green であること。
    on_failure: |
      fix-and-reverify: 検査実装またはテストを修正し再実行する。
      v1〜v4 再走査で新規検査化不採用と判断した候補は理由を Findings へ記録する（record-in-findings）。
  - id: TS-004
    target_item: AG-004
    verification: |
      機械是正後、各是正対象パターン（一文一行 X-4・中黒見出し・em-dash プレースホルダ3セル・
      docs X-4 74行）について old 側パターン再検索が0件であることを確認する（REQ-007-001）。
      再検索結果と対象範囲の妥当性を PR 本文へ記録する（REQ-007-002）。
      AUTOGEN 索引の再生成と checker 影響の事前確認（RU-0007 前置化手順）を実施済みであることを確認する。
      構造データを誤って置換対象に含めて得た0件でないことを確認する。
    pass_criteria: |
      全是正パターンの再検索0件、PR 本文への証拠記録、AUTOGEN 再生成・checker 事前確認の実施、
      docs-check と lint_skills（AG-005 規則群）の合格。
    on_failure: |
      fix-and-reverify: 置換漏れ・誤置換を修正し再検索する。
      由緒付きの対象不存在（em-dash 4セル→3セル）は確認記録を PR 本文へ残す。
  - id: TS-005
    target_item: AG-005
    verification: |
      (a)〜(g) の旧構造残存について、是正後に旧 Step 構造・旧行 ID・旧タイトル・旧節参照の
      各パターン再検索が0件であることを確認する（正規の5箇所以外の旧 Step 参照は REQ-046-006 準拠）。
      (h) DEC-016/017 の status が昇格されていること、(i) integrity-check/standard.md が削除され
      参照元がないこと、(j) .gitignore に docs/reports/local/ が追加されていることを確認する。
      旧 REQ 参照再配線方針（3系統）の決定記録を PR 本文へ残す。修正単位ごとの記録は REQ-046-010 準拠。
    pass_criteria: |
      旧構造パターン再検索0件、F-02/03/06 の処理完了、docs-check 合格、
      再配線方針の決定記録が PR 本文に存在すること。
    on_failure: |
      fix-and-reverify: 残存・参照切れを修正し再検索する。
      正規契約から一意に導けない事項は blocked として報告し独断で確定しない（REQ-046-009）。
  - id: TS-006
    target_item: AG-006
    verification: |
      (a) soft guard 宣言追加後、フル suite の恒常 2 fail が解消することを確認する。
      (b) project-extensions の SKILL.md description と SPEC DO NOT USE FOR 節の整合を確認する。
      (c) gh-cli local references の一文一行再検索が0件。(d) mkdir 前提条件の記述存在。
      (e) git-worktree 手続きの文言修正確認。(f) traceability description が600字以内。
      (g) worktree-operations.md が253行（違反解消済み）であることを確認記録する。
      (h) promote-judgment-logic.md L97 の旧「自動確定禁止」文言が REQ-038-002 整合表現へ
      置換されていることを確認する。
    pass_criteria: |
      フル suite 2 fail 解消、lint_skills（AG-005 規則群）合格、traceability description 600字以内、
      学び是正の文言置換完了。全項目の確認結果を PR 本文へ記録すること。
    on_failure: |
      fix-and-reverify: 各修正を完了し再検証する。(g) は解消済みのため確認記録のみでよい（record-in-findings）。
  - id: TS-007
    target_item: AG-007
    verification: |
      (a) intake-promote 報告 template に保留件数・自律確定根拠 field が存在すること、
      (b) command-authoring の delegated_check サンプルが現行手続きと一致すること、
      (c) SPEC バッチ更新時の用語横断確認手続きの追加と AG-003 との連動判断の記録、
      (d) case-close workflow の E5b 判定に字母後継考慮が反映されていること、
      (e) Epic Wave クローズ時残留チェック手順が workflow skill に存在することを確認する。
      REQ-032-022 追加後の REQ-032 と docs-check（REQ 系検査）の整合を確認する。
    pass_criteria: |
      (a)〜(e) 全項目の反映確認、REQ-032 APPEND 後の docs-check 合格。
    on_failure: |
      fix-and-reverify: 反映漏れを修正し再確認する。
  - id: TS-008
    target_item: AG-008
    verification: |
      agentdev-git-worktree / agentdev-quality-gates / agentdev-workflow-case-run references の
      3 skill にテスト環境前提と bun test 正規形（3 cwd 分割・./ prefix・環境ラベル）が
      明記されていることを確認する。正規形でフル suite を実行し、
      fail 全件の由来分類（既知欠陥・環境依存・当該変更起因）と検証環境の記録を確認する（REQ-007-006〜008）。
    pass_criteria: |
      3 skill への正規形明記と、正規形実行によるフル suite の由来分類記録が PR 本文に存在すること。
    on_failure: |
      fix-and-reverify: 正規形の記載または実行形態を修正し再実行する。
  - id: TS-009
    target_item: AG-009
    verification: |
      agentdev-workflow-case-run に (a) AUTOGEN 再生成前置化、(b) 配布依存境界 gate、
      (c) フル suite 機械受理が反映されていることを確認する。
      (a) は SPEC 行数変更を伴うケースで索引再生成が前段強制されること、
      (b) は src/.opencode 双方への反映検証が gate として機能すること、
      (c) は受理判断が手動でなく機械的基準（AG-008 正規形 + REQ-007-006〜008）で行われることを確認する。
    pass_criteria: |
      3項目の workflow skill 反映と、機械受理基準の確認記録が PR 本文に存在すること。
    on_failure: |
      fix-and-reverify: workflow skill の手順を修正し再確認する。

# review_dispositions: 採否判断の記録。optional soft-contract
review_dispositions:
  - id: RD-001
    source_ru: RU-0005
    source_item: ag005-worktree-operations-toc-ng
    disposition: not_applicable
    reason_code: already_satisfied
    reason: |
      worktree-operations.md の AG-005 違反（捕捉時336/340行・TOC なし）は現行 HEAD で253行となり
      違反解消済み（2026-08-22 时点で計測）。是正不要の確認記録のみ PR 本文に残す。
    evidence:
      path: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md
      section: null
      checked_at_commit: null
    related_removed_items: [git-worktree-worktree-operations-oversize-no-toc]
  - id: RD-002
    source_ru: RU-0004
    source_item: inspect-docs-promoted-20260822T080133Z-F01
    disposition: partially_covered
    reason_code: out_of_scope
    reason: |
      F-01 のうち junction 再構築（install-consumer-opencode.ps1 -Mode apply 再実行）は
      .opencode/skills/* が .gitignore 対象の局所運用タスクであり PR 成果外。
      本要件docはスキル集合突合の docs-check 検査データ化側面のみを要件化する。
      運用タスクは case-open 時の案内として Issue 本文へ記録する。
    evidence:
      path: .agentdev/inspect/promoted/inspect-docs-promoted-20260822T080133Z.md
      section: F-01
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    OU 10件を依存3層+是正末端の4層構成とする案:
    Layer 1（前提確定）: OU-001（RU-0005 学び是正・最優先）, OU-002（RU-0003 Design補完）, OU-003（RU-0008 正規形確定）
    Layer 2（並行実行可）: OU-004（RU-0005 残り）, OU-005（RU-0004 検査強化）, OU-006（RU-0006 仕様修正）, OU-007（RU-0002 旧構造正規化）, OU-008（RU-0007 運用改善。OU-003 依存）
    Layer 3: OU-009（RU-0009 手順正式化。OU-002 依存）
    Layer 4: OU-010（RU-0001 コーパス機械是正。OU-002/008/009 依存・末端）
    design-save（ACT-DESIGN-001〜004）と req-save（ACT-REQ-001/002）は draft の
    artifact_actions から動的判定される（feature 経路）。
  wave_hints:
    - "Wave 1: OU-001, OU-002, OU-003（OU-001 は学び是正の現行障害のため最優先先行）"
    - "Wave 2: OU-004, OU-005, OU-006, OU-007, OU-008"
    - "Wave 3: OU-009"
    - "Wave 4: OU-010（コーパス機械是正。全前提確定後の末端実行）"
```

# summary

2026-08-22 の backlog-review 生成 RU-0001〜RU-0009 を単一要件doc（feature/large）として一括要件化した。
構成判断（単一doc統合・学び是正の独立優先 OU 分離・traceability 即時修復）は draft-data の
conflict_resolutions（CR-001〜003）に記録済み。REQ 追記は REQ-010・REQ-032 の最小2件、
Design 補完は integrity/responsibilities 系4件。残る変更は配布物 skill・command/template・
docs コーパス是正の実行 case（OU 10件、Wave 4層）。STEP-8（経路A adversarial-review）は
ユーザー明示指定がないため skip した。
