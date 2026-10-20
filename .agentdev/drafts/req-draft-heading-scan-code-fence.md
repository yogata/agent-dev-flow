---
draft_type: req_draft
topic_slug: heading-scan-code-fence
status: draft
created_at: 2026-10-20T00:20:00+09:00
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >-
  組立器（assemble-draft-section.ts）・target_area 検索（search-target-area.ts）・REQ 採番（alloc-req-number.ts）の
  3実装に複製・転用された Markdown 見出し走査が、コード囲み（```）の内側の # 行を見出し・節境界として誤検出する障害の修正要件。
  見出し検出と節境界判定は行頭（字下げなし）の ``` で開始するコード囲みの内側の行を対象外とし、言語指定の有無は受理条件とせず、
  閉じの ``` がない場合はファイル末尾までを内側とみなし、~~~ 等の代替囲み記法は認識しない。コード囲みの外側の既存挙動
  （正規化・完全一致・件数検査・組立後一意性検査・欠番埋め禁止）は変更しない。REQ-004 へ3要件行、REQ-001 へ1要件行を APPEND し、
  規則の詳細は design-file-manager Design・req-define command Design・numbering-policy Design へ追記、
  契約文2本（target-area-matching.md・draft-generation.md）と3実装・3試験ファイルの整合は実現面として引き継ぐ。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      見出し検出と節境界判定は、行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し候補・節境界として扱わない。
      適用対象は3実装の両機能（組立器 assemble-draft-section.ts の findTargetAreaHeadings・sectionEnd、
      target_area 検索 search-target-area.ts の findTargetAreaHeadings、REQ 採番 alloc-req-number.ts の
      extractKnownGapNumbers の節範囲特定）である。
  - id: AG-002
    content: >-
      コード囲みの認識規則は次のとおり。認識は行頭（字下げなし）の ``` のみを条件とし、言語指定の有無は受理条件としない。
      閉じの ``` がない場合はファイル末尾までを内側とみなす。~~~ 等の代替となる囲み記法の認識への拡張は行わない。
  - id: AG-003
    content: >-
      同一の認識規則を、3実装と次の文書群が同一の内容として記述する。契約文2本
      （agentdev-design-file-manager/references/target-area-matching.md のマッチング規則節、
      agentdev-workflow-req-define/references/draft-generation.md の決定的な局所組立・検査節）と
      Design 3本（docs/designs/skills/agentdev-design-file-manager.md の search-target-area.ts 契約節、
      docs/designs/commands/req-define.md の調査委譲の全文機械抽出節の組立・検査規律、
      docs/designs/foundations/numbering-policy.md の欠番の扱い節）。
      artifact-contracts.md および各 SKILL.md は規則を複製しない委譲構造のため追記対象外。
  - id: AG-004
    content: >-
      コード囲みの外側の既存挙動は変更しない。target_area 正規化（normalizeTargetArea）、見出し行全体完全一致、
      複数マッチ置換拒否、未検出スキップ、old_text 存在件数検査、組立後一意性検査（target_preserved）、
      採番の欠番埋め禁止の各挙動を維持する。
  - id: AG-005
    content: >-
      回帰案例として、コード囲みの内側に # 行を含む節で、正式見出しからコード囲みの後の行までが同一節（検査範囲）と
      判定されることを、3側の既存試験ファイル（assemble-draft-section.test.ts、search-target-area.test.ts、
      alloc-req-number 系試験）へ追加して確かめる。修正前の実装での失敗と修正後の合格の推移を証跡として残す。
  - id: AG-006
    content: >-
      対象外は次のとおり。消費者リポジトリ側の作業（api-reference.md の2行の反映と再検査。修正版の配布後に消費者側で実施）、
      target_preserved・節削除の扱いの変更（実在する親見出しを検査範囲に指定する正規入力で処理できるため本件の対象外）、
      CommonMark の3スペース以内インデント付きコード囲み（fence）の認識（行頭のみという決定済み仕様を維持）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-004-064 | 局所組立と target_area 検索の決定的処理における見出し検出と節境界判定は、行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し候補・節境界として扱わないこと。閉じの ``` を持たないコード囲みはファイル末尾までを内側とみなすこと |
      | REQ-004-065 | コード囲みの認識は行頭の ``` のみを条件とし、言語指定の有無を受理条件としないこと。~~~ 等の代替となる囲み記法の認識への拡張を行わないこと |
      | REQ-004-066 | コード囲みの認識規則は、局所組立と target_area 検索の実装および契約文が同一の内容として記述すること。コード囲みの外側の見出し検出、target_area 正規化、完全一致、旧文存在件数検査、組立後一意性検査の各挙動を本規則の導入によって変更しないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-001.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-001-071 | 採番の決定的処理が既知欠番レジストリ（numbering-policy「既知の欠番」節）を読み込む際の節範囲特定は、行頭の ``` で開始するコード囲みの内側の行を節境界として扱わないこと。認識規則は局所組立・target_area 検索と同一とすること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: skills
      slug: agentdev-design-file-manager
    target: docs/designs/skills/agentdev-design-file-manager.md
    target_area: "### search-target-area.ts 契約"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      ### search-target-area.ts 契約

      `search-target-area.ts` は見出し行全体との完全一致のみを受け付ける。
      前方一致、後方一致、部分一致を受け付けない（前方一致廃止）。
      正規入力（例: `### IR-044`）で回帰テストを維持する。
      この契約は `target_area` マッチング規則と `append` の anchor マッチング規則の双方に適用される。

      見出しの走査とセクション範囲の特定は、行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し・節境界として扱わない。コード囲みの認識は行頭の ``` のみを条件とし、言語指定の有無は条件としない。閉じの ``` がない場合はファイル末尾までを内側とみなす。~~~ 等の代替囲み記法は認識しない。この規則は見出し検出と節境界判定の双方に適用し、agentdev-workflow-req-define の組立規則（assemble-draft-section.ts）と同一の内容を維持する。コード囲みの外側の見出し検出、target_area 正規化、完全一致、複数マッチ置換拒否、未検出スキップの各挙動は変更しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: req-define
    target: docs/designs/commands/req-define.md
    target_area: "## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      ## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化

      req-define の調査・要件doc生成は、機械的取得と安全な書込みを前提とする規律に従う。具体的なツール名、シェル、起動 API は実行基盤側の操作規律に配置し、本 Design と配布 skill に固定しない（REQ-011-018）。

      - 全文は既存の機械的手段で抽出し、モデルに逐語再生成させない。取得物への参照と、モデルによる判断・要約を分ける
      - 取得物を後続担当が実際に読める形で引き継ぐ。取得不能、切断、文字化けを完全な抽出として扱わず、参照不能を黙過しない
      - 対象ファイルの完全列挙を維持する。調査優先対象はヒントであり、対象範囲を制限する条件にしない（調査スコープ洗練手順の既存規律を維持）
      - 実行基盤が提供する安全な書込み手段を優先し、長大なシェル入力による切断を避ける。書込み後は内容の完結性を確認する（既存の読み戻し可能確認を維持）
      - 独立した調査・評価だけ並列化する。調査結果を入力とする評価は必要な結果の確定を待つ。抽出・書込み等の前提が満たせない状態を対象なし、成功、評価不要として扱わない

      調査委譲の指示と結果、組立・検査の規律は次のとおり。

      - 調査委譲の指示は既存本文・全索引の大量逐語再出力を要求しない。調査結果は原文参照（パス・範囲）と判断結果（判定、差異、根拠箇所）を分離して返し、原文と必要な周辺文脈を後続担当が実際に読める形で引き継ぐ（REQ-003-004 の判定結果圧縮原則の適用）
      - 局所修正・追記のドラフト本文の組立は、モデルが対象セクション、旧文、新文、変更理由、保持すべき意味、追記位置を確定し、決定的処理が対象の一意性と旧文の期待件数を確認して既存原文から組み立てる。全面改稿・新規文書はモデルの本文生成を許し、共通の形式・参照・差分検査を適用する。見出しの一致判定は完全一致のみとし、類似する別見出しを前方一致で選ばない
      - 検査順序は「構造・変更前提の検査 → 組立 → 指定外変更・欠落・保存完結性の検査 → 意味レビュー → 指摘反映と影響範囲の再評価」とする。構造検査だけで意味レビュー完了としない
      - 組立・検査の戻り値は所在、処理操作、成功・失敗、一致件数、置換件数、検査結果、判断が必要な差分・異常を中心とし、変更しない本文の大量再出力を既定としない。レビュー担当が必要に応じ全文・周辺文脈を取得できることを維持する
      - 組立・検査の結果は対象内容・版、評価範囲、実行条件を識別できる証拠として保持し、同じ結果の読み直しのために処理を再実行しない。前提変更時は影響する検査・判断を無効化して再実行し、影響しない証拠まで一律に破棄しない。証拠は永続状態から再構成できる形で保持し、再開時に依存できない一時結果で再開を成立させない（DEC-011 準拠）
      - 固定の組立・検査処理は実行ごとにモデルへ新規生成・修復させず、既存の担当スキル・処理として再利用する。欠ける処理だけを正規の所有先へ追加する
      - 一時的な作業領域は正式ドラフトと配置・権限・寿命を分離する。`.agentdev/drafts/` には登録済みドラフトだけを配置し（REQ-008 のドラフト種別契約の維持）、作業用途のスクリプト・抽出本文・検査用データを残置しない。正常終了時に一時領域を片付け、検証前に検証用処理を削除しない
      - Definition 適用直前の対象セクション照合の契約は case-ready Design「Definition 適用直前の対象セクション照合」節が所有する
      - 見出し検出と節境界判定は、行頭（字下げなし）の ``` で開始するコード囲みの内側の行を見出し・節境界として扱わないものとする。閉じの ``` がない場合はファイル末尾までを内側とみなし、言語指定の有無は受理条件とせず、~~~ 等の代替囲み記法は認識しない。この規則は target_area 検索の script 契約（search-target-area.ts）および採番スクリプトの節範囲特定と同一の内容を維持する。コード囲みの外側の見出し検出、正規化、完全一致、旧文存在件数検査の既存挙動は変更しない
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: numbering-policy
    target: docs/designs/foundations/numbering-policy.md
    target_area: "### 欠番の扱い"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ### 欠番の扱い

      過去の採番ミス、意図的予約、廃止由来を問わず、一度生じた欠番は維持する。
      欠番を埋める新規採番、欠番を再利用する識別子割当てはいずれも禁止する。
      欠番は各 README、索引類で「欠番」として明記し、実体不在と整合する。

      #### 既知の欠番

      欠番管理の責務を明記。
      IR 廃止時の交叉参照（v2:REQ-NNN 等）の再配置先として req-impact-map.md/retired/ を正規所有者として指定。
      numbering-policy は欠番の存在宣言のみを担い、交叉参照データの体系的蓄積は req-impact-map/retired/ が担う。

      REQ の既知欠番: REQ-063〜REQ-081 の 19 連番は、REQ-082 採番（2026-09-15 ユーザー裁定）に伴う意図的予約欠番である。requirements/README.md と docs/README.md で「欠番」として明記し、実体不在と整合する。
      REQ-084〜REQ-086 は、共有予約枠（REQ-083〜REQ-096）の未使用・返却枠として維持される意図的予約欠番である（IR-069、REQ-088 採番に伴う枠解消時の記録）。
      REQ-089: J2 shadow 実験（commit 43bf2ec3 で採番後、52c7bc10 で完全 revert）。廃止識別子であるため再利用しない。次の新規 REQ 番号は採番時点で REQ 実ファイル一覧と本節の既知欠番レジストリから決定的採番スクリプト（alloc-req-number.ts）により決定する。
      REQ-092: 2026-10 責任境界整理により廃止（保証は REQ-095・REQ-011-033/029 へ統合、使用手順は issue-operation-safety.md へ分離）
      REQ-093: 2026-10 責任境界整理により廃止（種別契約行は REQ-052-014/015 へ統合）
      REQ-087: 2026-10 責任境界整理により廃止（裁定記録義務は REQ-001-070、ギャップ検査・レジストリ単一情報源は REQ-010-070 へ統合）
      決定的採番スクリプト（`alloc-req-number.ts`）は本節の既知欠番を欠番レジストリとして読み込み、現行ファイル群の最大番号が既知欠番を下回る場合も既知欠番を埋めない。

      採番スクリプトが本節の既知欠番レジストリを読み込む際の節範囲特定は、行頭（字下げなし）の ``` で開始するコード囲みの内側の行を節境界として扱わない。閉じの ``` がない場合はファイル末尾までを内側とみなし、言語指定の有無は受理条件とせず、~~~ 等の代替囲み記法は認識しない。この認識規則は局所組立（assemble-draft-section.ts）・target_area 検索（search-target-area.ts）と同一とする。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      入力ファイルの決定済み仕様はコード囲み対応を2実装（組立器・target_area 検索）に限定していたが、限定探索で
      alloc-req-number.ts の extractKnownGapNumbers に同型の見出し走査（節末端検出）を発見。対象範囲の拡大要否が争点。
    resolution: >-
      ユーザー裁定（2026-10-20）により対象に含める。3実装へ同一規則を導入し、REQ 採番側は REQ-001 へ要件行を追加。
      悪影響（欠番レジストリ読み漏れによる欠番埋め・ID 衝突の潜在リスク）は顕在化前だが同一バグクラスとして修正する。
  - id: CR-002
    conflict: コード囲みの認識範囲（インデント付き fence、~~~ 等の代替記法を認めるか）。
    resolution: >-
      入力ファイルの決定済み仕様により、行頭（字下げなし）の ``` のみとし、~~~ 等への拡張は行わない。
      CommonMark の3スペース許容との差は仕様の選択として維持する。
  - id: CR-003
    conflict: 閉じの ``` がないコード囲みの扱い。
    resolution: 入力ファイルの決定済み仕様により、ファイル末尾までを内側とみなす。
  - id: CR-004
    conflict: 消費者リポジトリ（fujoho_schedule）側の api-reference.md 反映・再検査を本件に含めるか。
    resolution: >-
      入力ファイルの対象外宣言により対象外。修正版の配布後に消費者側で実施する。
      本リポジトリの修正・検証・配布のみを本件の対象とする。
  - id: CR-005
    conflict: 見出しを含む節の削除（target_preserved との衝突）への対応を本件に含めるか。
    resolution: >-
      入力ファイルの確認済み結論により対象外。実在する親見出しを検査範囲に指定する正規入力で処理できるため、
      target_preserved・節削除の扱いは変更しない。
  - id: CR-006
    conflict: >-
      REQ-001（現行70行、本件で71行）への APPEND に伴う SPLIT 要否。req-health-metrics の SPLIT シグナル合計が
      2以上（要件行数 51〜80帯 +1、関心分類複数 +1）のため「APPEND の前にユーザーへ SPLIT 要否を提案」契約により
      提案済み。質問ツールの一括選択肢で両 REQ を同時に扱えないため、状態を区分して確定する必要があった。
    resolution: >-
      ユーザーの直接回答（2026-10-20）により REQ-001 は SPLIT せず APPEND で確定。REQ-001-071 の追加のみを
      行い、REQ-001 の構造分割は本件の対象外とする。REQ-004 側の SPLIT 要否は引き続き auto_gate の
      unresolved_questions が正であり、本確定を REQ-004 へ波及させない。後続コマンドは本内容をユーザーへ再確認しない。
  - id: CR-007
    conflict: >-
      REQ-004（現行63行、本件で66行）への APPEND に伴う SPLIT 要否。req-health-metrics の SPLIT シグナル合計が
      2以上（要件行数 51〜80帯 +1、関心分類複数 +1）のため「APPEND の前にユーザーへ SPLIT 要否を提案」契約により
      提案済み。一時は「SPLIT 検討を残す」（未決）として auto_gate.unresolved_questions に保持していた。
    resolution: >-
      ユーザーの直接回答（2026-10-20）により REQ-004 は SPLIT せず APPEND で確定。REQ-004-064〜066 の追加のみを
      行い、REQ-004 の構造分割は本件の対象外とする。同回答により case-auto の起動が承認された（起動は監督側が
      実施する）。後続コマンドは本内容をユーザーへ再確認しない。

operation_units:
  - ou_id: OU-001
    target_req: REQ-004
    target_design: docs/designs/skills/agentdev-design-file-manager.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-001
    target_design: docs/designs/foundations/numbering-policy.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-005
    verification: |-
      修正前の実装で3側の既存試験ファイルへ回帰案例を追加して実行し、失敗することを確認する（失敗の証跡を残す）。案例は「コード囲みの内側に # 行を含む節で、正式見出しからコード囲みの後の行までが同一節（検査範囲）と判定されること」を検証する。対象は次の3ファイル。
      - src/common/skills/agentdev-workflow-req-define/scripts/tests/assemble-draft-section.test.ts（見出し検出・sectionEnd の範囲・old_text 件数検査がコード囲み越しで成立すること）
      - src/common/skills/agentdev-design-file-manager/scripts/tests/search-target-area.test.ts（コード囲み内の # 行が見出し候補から除外されること。閉じなし圍みはファイル末尾まで内側）
      - src/common/skills/agentdev-req-file-manager/scripts/tests/ の alloc-req-number 系試験（コード囲み内の # 行で「既知の欠番」節抽出が早期終了しないこと。REQ-010-070 の回帰テスト規則に従う）
      修正後に同一案例が合格することを確認する。実行は bun test（repo root 起 cwd・./ 付きパス指定、REQ-060）。
    pass_criteria: |-
      修正前実行で新規回帰案例が失敗し（検査範囲がコード囲み内 # 行で縮む挙動が検出される）、修正後実行で同一案例が合格する。失敗から合格への推移が双方の実行結果の証跡として残る。
    on_failure: |-
      fix-and-reverify とする。本件は障害修正であり、規則導入の不完全または案例の不足は実装を修正して再検証する。不合格を記録留め（record-in-findings）にしない。
  - id: TS-002
    target_item: AG-004
    verification: |-
      bun test（repo root 起 cwd・./ 付きパス指定、REQ-060）で3 scripts ディレクトリの全試験を実行する。
      対象: src/common/skills/agentdev-workflow-req-define/scripts/（assemble-draft-section.test.ts、evidence-match.test.ts、real-path-assembly.test.ts）、src/common/skills/agentdev-design-file-manager/scripts/（search-target-area.test.ts）、src/common/skills/agentdev-req-file-manager/scripts/（alloc-req-number 系を含む全件）。
    pass_criteria: |-
      全試験が合格すること。コード囲みの外側の既存挙動（normalizeTargetArea・見出し行全体完全一致・target_preserved・old_text 件数検査・欠番埋め禁止）の既存案例が無変更で合格すること。
    on_failure: |-
      fix-and-reverify とする。外側挙動の退化を検出した場合は実装を修正して再検証する。既存案例の削除・緩和による合格化は行わない。
  - id: TS-003
    target_item: AG-003
    verification: |-
      契約文2本（src/common/skills/agentdev-design-file-manager/references/target-area-matching.md の「マッチング規則」節、src/common/skills/agentdev-workflow-req-define/references/draft-generation.md の「決定的な局所組立・検査」節）への規則追記後、追記部分と3実装の認識規則が一致することを文書レビューで確認する。規則の要素（行頭 ``` のみ、言語指定の有無は受理条件としない、閉じなしはファイル末尾まで内側、~~~ 等は認識しない、見出し検出と節境界判定の双方へ適用）を文書ごとに行単位で突合する。Design 3本の追記は artifact_actions の content と実ファイル適用結果で同一性を確認する。
    pass_criteria: |-
      全ての記述が同一の規則を過不足なく述べ、矛盾・欠落がないこと。
    on_failure: |-
      fix-and-reverify とする。文書間の規則のずれは文書を修正して再確認する。

realization_actions:
  - id: RA-001
    concern: 組立器へのコード囲み認識導入と回帰案例追加
    responsibility: >-
      src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts の findTargetAreaHeadings・
      sectionEnd が、行頭の ``` で開始するコード囲みの内側の行を見出し候補・節境界として扱わないようにする。
      コード囲みの外側の挙動（正規化・完全一致・old_text 件数検査・target_preserved）は変更しない。
    ownership_hints:
      - "実装: src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts"
      - "試験: src/common/skills/agentdev-workflow-req-define/scripts/tests/assemble-draft-section.test.ts"
      - "契約文: src/common/skills/agentdev-workflow-req-define/references/draft-generation.md「決定的な局所組立・検査」節"
      - "規則変更に伴い ASSEMBLY_CHECKER の version と result_affecting_references.heading_match_rule を更新し、scripts/package.json の version と同期する（既存 evidence との再照合が evidence-match.ts で正しく判定されるようにする）"
    intent: >-
      消費者リポジトリで実証された障害（コード囲み内 # コメント行が節境界と判定され検査範囲が縮む）を組立器で解消し、
      契約文・Design と同じ規則を実装する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
  - id: RA-002
    concern: target_area 検索へのコード囲み認識導入と回帰案例追加
    responsibility: >-
      src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts の findTargetAreaHeadings が、
      行頭の ``` で開始するコード囲みの内側の行を見出し候補として扱わないようにする。正規化・完全一致・
      複数マッチ・未検出の各挙動は変更しない。
    ownership_hints:
      - "実装: src/common/skills/agentdev-design-file-manager/scripts/src/search-target-area.ts"
      - "試験: src/common/skills/agentdev-design-file-manager/scripts/tests/search-target-area.test.ts"
      - "契約文: src/common/skills/agentdev-design-file-manager/references/target-area-matching.md「マッチング規則」節"
    intent: >-
      組立器と同じ走査規則を持つ複製実装（複製の意図は組立器冒頭コメントに明記）へ同一規則を導入し、
      両実装の規則を一致させる。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
  - id: RA-003
    concern: REQ 採番スクリプトの節範囲特定へのコード囲み認識導入と回帰案例追加
    responsibility: >-
      src/common/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts の extractKnownGapNumbers が、
      numbering-policy「既知の欠番」節の範囲特定において行頭の ``` で開始するコード囲みの内側の行で節末端判定を
      行わないようにする。欠番埋め禁止・max+1 採番の既存挙動は変更しない。
    ownership_hints:
      - "実装: src/common/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts"
      - "試験: src/common/skills/agentdev-req-file-manager/scripts/tests/ の alloc-req-number 系試験"
      - "関連要件: REQ-010-070（欠番レジストリと採番スクリプトの単一情報源）"
    intent: >-
      ユーザー裁定（2026-10-20）により対象に追加された同種の欠陥（コード囲み内 # 行で節抽出が早期終了し
      欠番レジストリを読み漏らす潜在リスク）を、同一規則の導入で解消する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003, AG-005]
  - id: RA-004
    concern: 契約文2本への規則追記
    responsibility: >-
      src/common/skills/agentdev-design-file-manager/references/target-area-matching.md の「マッチング規則」節と
      src/common/skills/agentdev-workflow-req-define/references/draft-generation.md の「決定的な局所組立・検査」節へ、
      コード囲みの扱い（AG-002 の規則）を追記する。両契約文と Design 3本が同一の規則を記述する。
    ownership_hints:
      - "契約文: src/common/skills/agentdev-design-file-manager/references/target-area-matching.md"
      - "契約文: src/common/skills/agentdev-workflow-req-define/references/draft-generation.md"
    intent: >-
      実装の規則と契約文の規則を一致させ（完了条件3）、配布物読者に走査規則のコード囲み扱いを明示する。
    verification_refs: [TS-003]
    source_items: [AG-002, AG-003]

assembly_evidence:
  - target_file: docs/designs/skills/agentdev-design-file-manager.md
    target_content_sha256: 5123f6edb646e950adbfad612ad17fc1d90ebdb68af21299e6ea71d32befa90b
    check_scope:
      heading: "### search-target-area.ts 契約"
      start_line: 67
      end_line: 73
    execution_conditions:
      operation: append
      edit_sha256: d9ed9c89899b5510b688834c56d92ddb84429f51be29e1b4ef563a4a419b1a70
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 0
    executed_at: "2026-10-19T15:02:02.471Z"
  - target_file: docs/designs/commands/req-define.md
    target_content_sha256: 4e22caf5a87390a7ebfe37679e8c9334566a6b6fe43d5a6c3306376057261bf0
    check_scope:
      heading: "## 調査委譲の全文機械抽出・安全な書込み・独立作業の並列化"
      start_line: 123
      end_line: 143
    execution_conditions:
      operation: append
      edit_sha256: c0915658b2723c662851c86fe514a6b3f0cec8c2bc4158bfdfd799b0a84c1d25
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 0
    executed_at: "2026-10-19T15:03:17.624Z"
  - target_file: docs/designs/foundations/numbering-policy.md
    target_content_sha256: 24826bddf6357bfab87bfa28c97915d9017ad762362b6b7fd84875b9187b2507
    check_scope:
      heading: "### 欠番の扱い"
      start_line: 52
      end_line: 71
    execution_conditions:
      operation: append
      edit_sha256: fceb98b5b02c61c4cdffc4dc23666f9f9894eacccae18989d430bdbdbc2fde18
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 2
      added: 2
      removed: 0
    executed_at: "2026-10-19T15:02:02.497Z"

case_open_hints:
  epic_needed: false
  decomposition: >-
    OU-001（REQ-004 側: 組立器・target_area 検索・契約文2本・Design 2本）と OU-002（REQ-001 側: 採番スクリプト・
    Design 1本）は相互依存なし。同一 Case の単一 Issue・単一 PR での実行を想定（規則文言の同一性維持のため
    同一変更セットにまとめることが自然）。分離する場合は AG-002 の規則文言を両 PR で一致させること。
  wave_hints: []
```

# summary

障害の発生場所は消費者リポジトリ（fujoho_schedule）の要件定義下書きの組立検査。測定済みの事実（v5.1.3・本線最新・導入版の3版で同一の未修正挙動、正規公開関数での再現）を入力として要件化した。壁打ち相当は入力ファイルの決定済み仕様・完了条件で完了しており、本実行では対象範囲の確定（alloc-req-number.ts を含める3実装構成）と SPLIT 要否の提案のみをユーザー判断に求めた。

REQ 帰属は REQ-004（組立・Definition 保存横断契約）へ3行、REQ-001（文書体系・採番）へ1行の APPEND とし、規則の詳細は正規所有者である Design 3本（design-file-manager・req-define command・numbering-policy）へ追記する構成とした。Design 3節の追記本文は組立スクリプトの dry-run（書込みなし）で構造・変更前提・差分検査を実施済み（assembly_evidence 参照）。

SPLIT 要否は REQ ごとに区分して確定した。REQ-001 は SPLIT せず APPEND（2026-10-20 のユーザー直接回答、CR-006）、REQ-004 も SPLIT せず APPEND（同日のユーザー直接回答、CR-007。あわせて case-auto の起動が承認された）。auto_ready は true、unresolved_questions は空である。req-define コマンドとしては実装・正規文書変更・git 書込み・課題作成を行わず、case-auto の起動も本セッションでは行わない（監督側が起動する）。
