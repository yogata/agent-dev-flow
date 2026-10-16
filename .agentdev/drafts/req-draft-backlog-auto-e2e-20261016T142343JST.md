---
draft_type: req_draft
topic_slug: backlog-auto-e2e-20261016T142343JST
status: draft
created_at: 2026-10-16T14:35:00+09:00
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
---

<!-- req_draft テンプレート準拠。原本の情報源は # draft-data 内の YAML コードブロック。
  soft contract（生成元側標準）。LLM 推論経由で消費される。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: docs_chore

# scale: standard / large。large 昇格根拠: 実装スコープシグナル（影響ファイル推定 15 超。
#   traceability sidecar、docs/designs 配下 4 Design、docs/decisions、docs/requirements、
#   src/common 配下の配布 skill references 2 件・script 1 件・SKILL.md 1 件・
#   record-comments.test.ts）。複数 REQ 領域横断（REQ-009/010/039/052/114 領域に触れる）。
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。
summary: backlog-auto e2e run 20261016T142343JST の RU 一式（9 件）を単一要件docへ確定する。RU-0001〜0009 を 9 operation_units（1:1、backlog-review の Jev 先行評価による統合・分割判定を継承）として保持し、正規成果物（Design 4 件・REQ 1 件・Decision 1 件）と実現面（配布 skill references 3 件・script 1 件・SKILL.md 1 件・traceability sidecar）への変更を artifact_actions と realization_actions で引き渡す。壁打ち HITL 質問 5 件の回答（2026-10-16）を受領済み: Q1=方向B（DEC-059 文言明確化）、Q2=両方（case-run 委譲契約 + learning-capture baseline 明記）、Q3=両方（script 改善 + STEP-5-2 手順明記）、Q4=統合維持（9 OU）、Q5=Epic なし・OU 単位 Issue 並列。全問推奨どおり確定し auto_ready: true。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []      # 壁打ち HITL 質問 Q1〜Q5 は 2026-10-16 の利用者回答で全件確定済み
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []              # 回答受領により解消（Q1=B、Q2=両方、Q3=両方、Q4=統合維持、Q5=Epic なし・OU 単位並列）

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |-
      同一 worktree 複数委譲（中断→回収）において、回収側の PR 本文に両委譲（中断側・回収側）の実行識別情報（DEL 識別子）と検証差分を併記し、完了扱いの前に内容同一性の機械確認（diff 空）を前置する規律を v4-delegation-contracts Design と case-run 関連 workflow 手順へ条項化する。重複 PR 発生時に完了扱いが二重にならない規律を既存の委譲・回収手順と矛盾なく記述する。反映先は Design 契約（docs/designs/workflows/v4-delegation-contracts.md）への条項追加と配布 skill references（agentdev-workflow-case-run / agentdev-workflow-orchestration の管理領域）への手順明記の両方とする（req-define 変更影響分析による確定。Design が契約の正を所有し、配布 skill 側は Design を参照する手順面のみを記述して重複定義を避ける）。対象外: 委譲中断の検知機構の新設、単一委譲の通常フロー変更、case-close Capture 回収手順・完了判定ロジックの変更。
  - id: AG-002
    content: |-
      REQ-010-007 / REQ-010-008 / REQ-009-029 の 3 行の design covers 欠落を解消する。3 行それぞれについて対応 Design 文書を特定し（既存 Design の特定を第一候補とし、到達先が存在しない場合のみ新規作成を検討する）、traceability/ 配下 sidecar へ正規形式で design covers を登録する。対応時は grep ベースの補助確認を根拠とせず、正式な traceability check（check_integrity）による再確認を前置する。対象外: 3 行の REQ 本文（要件内容）の変更、traceability モデル・check_integrity の契約変更、3 行以外への波及修正。
  - id: AG-003
    content: |-
      REQ-114 未充足の解消。（1）REQ-114-001〜015 全行の implementation / verification covers を解消し、正式 check_integrity で missing-implementation / missing-verification の検出 0 件に到達する（covers 宣言は traceability/agentdev-workflow-backlog-auto.yaml に既存。check 判定と sidecar・本文実体の整合を確定する）。（2）DS17: REQ-114-013 に対応する Design 本文実体を agentdev-workflow-backlog-auto Design へ追加する。実装・検証側実体（applied-projects 3 形態 manifest、tests/end-to-end-contract.test.ts）は Case #3725 で成立済みであり、covers 縮小ではなく本文実体追加を第一候補とする（req-define 判断 CR-001）。（3）DS19: REQ-114-005（再スコープ）/ REQ-114-012（RU 0 件またはリリース対象となる実変更がない場合のリリース不作成と報告）/ REQ-114-015 に対応する本文節を Design へ追加する。（4）RQ17: REQ-114-014 の括弧内要約を REQ-039-001 原文準拠（「ユーザー承認を経て RU を生成する。プロジェクト知識候補は docs/knowledge/ への知識文書保存を同等の正規完了経路とする」）の表現へ是正する。（5）反映未完了群 DB02/DS17/DS19 の処理判断を記録する。対象外: REQ-114-001〜015 の行定義自体の変更（RQ17 を除く）、DEC-059 本文のリリース規則内容の変更、実装・検証側既存実体の再実装。
  - id: AG-004
    content: |-
      既存 fail を前提とする子 Issue の着手時に現行 main での再計測を前置する条項を case-run 委譲契約（v4-delegation-contracts Design）へ追加し、あわせて learning-capture の記録側に計測前提を含む記録への採番時点の baseline 明記運用を追加する（両方反映で確定。2026-10-16 HITL Q2 回答。問題節の両面〔委譲プロンプトの前提記述が古い計測に基づく・learning 記録の陳腐化判定材料不足〕を解消する）。陳腐化した前提を検知した場合の取り扱い（子 Issue の再評価・停止）が既存の委譲契約と矛盾なく扱えることを確認する。対象外: 着手済み・完了済み Case / 子 Issue への遡及適用、再計測の実装方法そのものの規定、learning-capture の inbox / deferred 管理方式の変更。
  - id: AG-005
    content: |-
      DEC-059 L49「case-close のリリース手順」への言及と case-close Design（リリース記述 0 件・grep 実測）の対応を確定し、正規成果物間の参照宙吊りを解消する。方向B で確定（2026-10-16 HITL Q1 回答）: DEC-059 の文言を後続工程（backlog-auto workflow stage 7 リリース）の総称として明確化する。決定内容（リリース規則自体）は変更しない。本文言明確化は非意味修正（意図の確認・適用対象の明確化）として利用者が明示承認した（Q1=B 回答が承認記録）。REQ-114 を含む要件・設計の変更は範囲外。DEC-059 のリリース規則内容（版番号・リリース条件・公開操作）自体の変更、backlog-auto stage 7 リリース実装の変更は対象外。
  - id: AG-006
    content: |-
      docs/designs/skills/agentdev-issue-tracking.md の「## 確定事項」番号リストの重複「16.」（:47 issue_create の labels 引数必須契約 / :48 件名（title）の書式）を連番へ再採番し（:48 を「17.」へ修正）、以降の番号ずれを解消する。再採番により項目の意味・順序・内容を変更しない。本文内に番号を起点とした参照がある場合、参照先の整合を保つ。対象外: 項目内容の変更、他 Design への波及修正、textlint 共通基盤・docs-check の検査範囲変更。
  - id: AG-007
    content: |-
      issue-operation-recovery.md の「### 診断手順」へ、gh repo view 手動実行に続く 2 段分離試験を手順として追記する（手順 1: bash から同一引数の gh を直接実行。手順 2: bun から runner と同一の spawnSync 経路〔CliRunner 直接実行〕で実行）。判定基準（bash 成功 + runner 経路失敗 → plugin ホスト環境差。bash も失敗 → 実行環境側の問題）を記載する。runner-cli.ts failFromExec の detail 文言拡張は行わない（REQ-052-014「最小限の detail」契約の維持。失敗分類値域〔config-uninterpretable / enforcement-crashed / operation-failed〕不変・fail-closed 維持に影響しない。req-define 判断 CR-003）。retired REQ-093 の恒久化水準再評価要否は判断材料として保持する（変更義務は課さない）。書込み操作の gh CLI 代替禁止（fail-closed 契約）は維持する。diagnostic 出力に資格情報等の機密値を含めない。対象外: REQ-052 本体の行変更、gh-write-guard 等の他 plugin・harness 側実装、読み取り系 bash gh 例外手順の変更、opencode plugin ホスト環境差の根本原因特定。
  - id: AG-008
    content: |-
      record-comments.ts applySection の末尾セクション境界（置換対象セクションが文書末尾にあり次の「## 」見出しが現れない場合、endIndex 初期値 lines.length により後続する工程記録 HTML コメント群をセクション内容として消費する挙動）を改善し、置換対象セクション後に「## 」見出しが現れない場合、後続する HTML コメント・注記を置換対象から除外する。record-comments.test.ts へ末尾セクション置換の回帰テストを追加する。あわせて cleanup-and-capture.md の STEP-5-2 手順へ、applySection 適用前のセクション後コンテンツ保全確認（適用前読み戻しとコメント群の保全チェック）を明記する（script 改善と手順明記の両方で確定。2026-10-16 HITL Q3 回答。多層防御）。既存の applySection 挙動（同名セクション置換・不在時末尾追加）と既存呼出し側互換性を維持し、既存テストを維持する。Bun 固有 API（import.meta.path / import.meta.dir）を保持し正規ランナーは bun のまま（node --experimental-strip-types では動作しない既知事項を維持）。対象外: agentdev-issue-management の VERIFY 運用、Case Issue 本文テンプレート構造、applySection の API 形状の再設計。
  - id: AG-009
    content: |-
      pr-merge-and-conflict.md の GitHub 版 STEP-4 取り込み確認手順へ、同一ファイル接触 PR を直列に連続マージした場合の merge 後重複行実検査（マージ後 main で該当行カウントを grep 等で確認）を明記する。STEP-4-4「内容重複確認」（ローカル先行 commit vs remote squash commit・git pull --ff-only 失敗予防目的）との目的差（GitHub squash merge の無音畳み込み〔trivial 重複 auto-resolve〕検出）を区別して記載する。CLEAN 判定（mergeStateStatus）単独では取り込み受理としない規律を明記する。直列化運用は既存どおり維持し、mergeable ポーリング契約（10 秒間隔・上限 60 秒）・STEP-4-4/4-5 既存手順は変更しない。対象外: ローカル版マージ手順、STEP-4-5 rebase パス、mergeable ポーリング契約・squash merge リトライ手順。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
# 2026-10-16 HITL Q1〜Q5 回答で全件確定済み（Q1=B、Q2=両方、Q3=両方）。
artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/v4-delegation-contracts.md
    target_area: "## 委譲制約（6）"
    source_items: [AG-001]
    content: |-
      同一 worktree への複数委譲（中断 → 回収）の回収側条項を追加する。
      追加条項 1: 回収側は、回収 PR 本文の実行識別情報（DEL 識別子）と検証差分に、中断側委譲と回収側委譲の両方の記録を併記する。
      追加条項 2: 回収側の完了扱いの前に、中断側で生成済みの成果物と回収側成果物の内容同一性を機械確認（diff 空）することを前置条件とする。重複 PR が発生した場合、機械確認が成立しない回収 PR を完了扱いとしない。
      注記: 追加により委譲制約の条項数が増える場合、「## 委譲制約（6）」見出しの条項数表記を case-ready 適用時に実条項数へ調整する（target_area は現行見出しを正とする）。既存の委譲時最小契約・委譲種別・result 4 状態との矛盾を生まない位置に配置する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_area: "## 一気通貫実行の実行構造（REQ-114）"
    source_items: [AG-003]
    content: |-
      REQ-114 関連の Design 本文実体を追加する。
      追加節 1（DS17・REQ-114-013 対応）: 共通 E2E 挙動確認の設計記録。3 採用形態（ADF 本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクト）の applied-projects manifest（tests/fixtures/applied-projects/{adf-self,github-connected,local-issue}/manifest.json）と tests/end-to-end-contract.test.ts が REQ-114-013 の実装・検証実体であり、Design 本文にその構成と位置づけを記述する。環境・権限が不足する条件は合格ではなく未検証として扱う規律を含める。
      追加節 2（DS19・REQ-114-005/012/015 対応）: 再スコープ（複数要件doc分割時の set-state 記録と独立ライフサイクル扱い）、RU 0 件またはリリース対象となる実変更がない場合のリリース不作成と報告（バージョン基準不在時の初期バージョン規則確認・停止）、一気通貫全体の完遂判定と最終報告の所有（REQ-041 行の backlog 整理サイクル部分との区別）の各規律を本文節として記述する。既存の「一気通貫実行の実行構造（REQ-114）」節の現行記述（:116 対応表の言及）との重複を避け、不足部分のみを追加する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-issue-tracking.md
    target_area: "## 確定事項"
    source_items: [AG-006]
    content: |-
      番号リストの連番化。「16. **件名（title）の書式**」を「17. **件名（title）の書式**」へ修正する（旧文「16. **件名（title）の書式**: 件名の文字列書式」は一意）。項目の本文・順序・内容は変更しない。修正後、「## 確定事項」の番号リストが連番であることを確認する。
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-059.md
    source_items: [AG-005]
    content: |-
      方向B 確定（2026-10-16 HITL Q1 回答。非意味修正の明示承認済み）。
      「結果、影響」節 L49 の文言を明確化する: 「backlog-auto workflow（stage 7 リリース）と case-close のリリース手順は本規則に従う」を「backlog-auto workflow（stage 7 リリース）と、その stage 7 で実行される case-auto 内部 lifecycle（case-close）完了後のリリース手順は本規則に従う」へ修正する（リリース手順の正規所有は backlog-auto orchestration stage 7 であり、「case-close のリリース手順」は後続工程の総称であることを明確化）。
      決定内容不変の確認条項: 本修正は DEC-059 が定めるリリース規則自体（版番号規則・リリース条件・公開操作・版番号後退防止・タグ権威）を一切変更しない。既存の REQ-114-008〜REQ-114-012 への拘束条件としての適用も不変である。変更は適用対象の文言明確化のみに限定される。
      手続き注記: 本文言明確化は非意味修正（意図の確認・適用対象の明確化）であり、2026-10-16 の HITL Q1=B 利用者回答が明示承認として記録される。Decision ライフサイクル契約の非意味修正扱いに従い、DEC-059 の status は accepted を維持する（後継 Decision 作成・supersede は発生しない）。case-open 以降の正規手続きで REQ-114 範囲外の変更が発生していないことを含めて適用する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/workflows/v4-delegation-contracts.md
    target_area: "## 委譲制約（6）"
    source_items: [AG-004]
    content: |-
      既存 fail を前提とする子 Issue の着手時再計測前置条項を追加する。
      追加条項: 委譲プロンプトまたは Issue 本文の前提記述が既存 fail の計測結果を含む子 Issue は、着手時に現行 main で再計測を前置する。再計測により起票前提の陳腐化を検知した場合、実行担当サブエージェントは前提の再評価を委譲元へ返し（blocked result または前提記録の修正）、陳腐化した前提で実装・検証を進めない。再計測の実行形態（テスト実行形態）は既存契約に従う。
      注記: ACT-DESIGN-001 と同一 target_area への追記であり、条項数表記の調整は case-ready 適用時に一括で行う。反映先は case-run 委譲契約（本 action）と learning-capture（RA-004）の両方で確定済み（2026-10-16 HITL Q2 回答）。
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-114.md
    target_area: "REQ-114-014 行"
    source_items: [AG-003]
    content: |-
      RQ17 是正。REQ-114-014 行の括弧内要約「REQ-039-001（backlog-review は自動的な要件化を行わない）」を REQ-039-001 原文準拠の表現へ修正する。
      修正後: 「REQ-039-001（backlog-review はユーザー承認を経て RU を生成する。プロジェクト知識候補は docs/knowledge/ への知識文書保存〔REQ-056〕を RU と同等の正規完了経路とする）は backlog-review のスコープ制約として維持し、backlog-auto による req-define 起動は req-define 自体の壁打ち・承認境界を保存する接続であること」
      行の制約内容（利用者判断境界の維持）は不変であり、要約の精度のみを是正する。REQ-114-014 の design covers（agentdev-workflow-backlog-auto.yaml の backlog-auto.md）は既存のため missing-design は発生しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: "RU-0003 DS17/DS19 の解消方向（Design 本文実体追加 vs covers 範囲縮小）"
    resolution: |-
      Design 本文実体追加を第一候補とする。根拠: REQ-114 の実装・検証側実体（applied-projects 3 形態 manifest、end-to-end-contract.test.ts）は Case #3725 で成立済みであり、Design がその構成を記述するのが設計記録として正しい。covers 縮小は REQ-114 行の design 到達性を下げ、検証義務行の役割設定変更（REQ-114-013 を design covers から外す）は役割設計の変更を伴う。covers 縮小は本文実体追加が現物の Design 構造に不適合であることが実装時に判明した場合の退避案として RU 側判断材料に保持する。
  - id: CR-002
    conflict: "RU-0001 の反映先選択（Design 追記のみ / 配布 skill references 手順明記のみ / 両方）における重複定義リスク"
    resolution: |-
      両方を採用し、重複定義を構造で避ける。根拠: v4-delegation-contracts Design が回収時記録・機械確認の契約の正を単一参照点として所有し、配布 skill references（case-run / orchestration 管理領域）は Design への参照を伴う実行手順面のみを記述する。契約と手順の二層であり、同一内容の重複定義にはならない。req-define 変更影響分析による確定事項（HITL 外の req-define 判断）。
  - id: CR-003
    conflict: "RU-0007 runner-cli.ts failFromExec detail 文言拡張の要否"
    resolution: |-
      拡張しない。根拠: REQ-052-014 の「最小限の detail」契約の維持、失敗分類値域不変・fail-closed 維持への影響回避、診断手順（issue-operation-recovery.md）の明記だけで呼出側が分離試験に到達できる。detail 拡張の要否は将来の learning 記録（再発時の判断材料）で再評価する。req-define 変更影響分析による確定事項（HITL 外の req-define 判断）。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_design: {operation: update, domain: workflows, slug: v4-delegation-contracts}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_design: # Q4 統合維持で確定。本 OU は design 操作を持たない（covers 登録は RA-002 の実現面変更であり、対応 Design の特定手順は RA-002 ownership_hints に定義済み。REQ 本体は変更しないため target_req も持たない）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-114
    target_design: {operation: update, domain: skills, slug: agentdev-workflow-backlog-auto}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0004
    target_design: {operation: update, domain: workflows, slug: v4-delegation-contracts}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0005
    target_design: # Q1=B 確定。DEC-059 文言明確化（ACT-DEC-001・Decision update）のため Design 操作なし。target_req も持たない（REQ-114 範囲外変更なしの制約）
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0006
    target_design: {operation: update, domain: skills, slug: agentdev-issue-tracking}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0007
    target_design: {operation: update, domain: skills, slug: agentdev-workflow-case-close}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0008
    target_design: {operation: update, domain: skills, slug: agentdev-workflow-case-run}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-0009
    target_design: {operation: update, domain: skills, slug: agentdev-workflow-case-close}
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法（verification / pass_criteria / on_failure 必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      v4-delegation-contracts.md と case-run / orchestration 配布 skill references に、PR 本文への両委譲記録（DEL 識別子・検証差分）の条項と、完了扱い前置の機械確認（diff 空）の条項が存在することを rg で確認する。既存の委譲時最小契約・委譲種別・result 4 状態の条項と矛盾しないことを目視照合する。
    pass_criteria: |-
      条項 2 点（記録併記・機械確認前置）が手順として明記されている。重複 PR 発生時に完了扱いが二重にならない規律が既存手順と矛盾なく記述されている。
    on_failure: |-
      fix-and-reverify。条項の記載漏れ・既存契約との矛盾を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      正式な traceability check（check_integrity）を実行し、REQ-010-007 / REQ-010-008 / REQ-009-029 の missing-design 検出が 0 件であることを確認する。追加した design covers が traceability/ 配下 sidecar に正規形式で登録されていることを確認する。
    pass_criteria: |-
      check_integrity で該当 3 行の missing-design 検出 0 件（exit 0）。3 行それぞれに design covers の到達先が記録され、sidecar へ正規形式で登録されている。
    on_failure: |-
      fix-and-reverify。covers 登録の形式・到達先の不備を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |-
      check_integrity --req REQ-114-001〜015 を実行し、missing-implementation / missing-verification の検出 0 件を確認する。REQ-114-013 / 005 / 012 / 015 に対応する Design 本文実体が agentdev-workflow-backlog-auto.md に存在することを grep で確認する。REQ-114.md の REQ-114-014 行の括弧内要約が REQ-039-001 原文準拠であることを目視照合する。反映未完了群 DB02/DS17/DS19 の処理判断の記録が存在することを確認する。
    pass_criteria: |-
      REQ-114-001〜015 全行の missing-implementation / missing-verification 検出 0 件。DS17・DS19 の本文実体追加または covers 範囲見直しが反映されている。RQ17 が是正されている。処理判断が記録されている。
    on_failure: |-
      fix-and-reverify。covers・本文実体・要約の不備を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      v4-delegation-contracts.md に着手時再計測前置条項が、learning-capture の条項に採番時点 baseline 明記運用が存在することを rg で確認する（反映先は両方で確定・2026-10-16 HITL Q2）。陳腐化検知時の取り扱い（再評価・停止）が既存の委譲契約と矛盾しないことを目視照合する。
    pass_criteria: |-
      case-run 委譲契約に再計測前置条項が、learning-capture 条項に baseline 明記の規律がそれぞれ明記されている。陳腐化検知時の扱いが既存契約と矛盾なく扱える。
    on_failure: |-
      fix-and-reverify。条項の記載漏れ・矛盾を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |-
      DEC-059 の更新物（方向B 確定・2026-10-16 HITL Q1）の実在を確認する: L49 文言が「backlog-auto workflow（stage 7 リリース）と、その stage 7 で実行される case-auto 内部 lifecycle（case-close）完了後のリリース手順は本規則に従う」へ更新されていることを grep で確認する。リリース規則自体（版番号規則・リリース条件・公開操作）に変更がないことを diff で確認する。REQ-114 を含む他の要件・設計への変更が発生していないことを変更範囲の突合で確認する。
    pass_criteria: |-
      DEC-059 L49 の文言が更新され、「case-close のリリース手順」の所在が後続工程（stage 7）の総称として一意に確定している。決定内容（リリース規則自体）は不変。status は accepted 維持。REQ-114 を含む他の要件・設計への変更がない。
    on_failure: |-
      fix-and-reverify。文言または節の不備を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |-
      agentdev-issue-tracking.md の「## 確定事項」番号リストを確認する。重複「16.」が 0 件で「17. **件名（title）の書式**」が存在することを grep で確認する。再採番により項目の本文・順序・内容が変更されていないことを diff で確認する。
    pass_criteria: |-
      番号リストが連番である（重複解消）。項目の意味・順序・内容が不変。番号起点の参照がある場合は参照先の整合が保たれている。
    on_failure: |-
      fix-and-reverify。番号の再修正と参照整合の再確認を行う。
  - id: TS-007
    target_item: AG-007
    verification: |-
      issue-operation-recovery.md の診断手順に 2 段分離試験（bash 直叩き gh 実行 → bun による CliRunner 直接実行）と判定基準が手順として記載されていることを rg で確認する。runner-cli.ts の失敗分類値域（config-uninterpretable / enforcement-crashed / operation-failed）に変更がないことを diff で確認する。diagnostic 出力に機密値が含まれないことを確認する。
    pass_criteria: |-
      2 段分離試験と判定基準が手順として明記されている。REQ-052-014 の失敗分類値域不変・fail-closed 維持に影響がない。
    on_failure: |-
      fix-and-reverify。手順記載の不備を修正して再検証する。値域変更を検出した場合は change を revert する。
  - id: TS-008
    target_item: AG-008
    verification: |-
      record-comments.test.ts の末尾セクション置換回帰テストを実行し（bun test）、セクション後の HTML コメントが消失しないことを検証する。既存テスト（同名セクション置換・不在時末尾追加）がすべて pass することを確認する。STEP-5-2 手順に適用前の保全確認が明記されていることを確認する（実現先は script 改善と手順明記の両方で確定・2026-10-16 HITL Q3）。
    pass_criteria: |-
      回帰テスト pass。既存テスト全 pass（既存 applySection 挙動の非破壊）。STEP-5-2 手順に保全確認が明記されている（script 改善と併用の多層防御構成）。
    on_failure: |-
      fix-and-reverify。境界検出の改善を修正して再検証する。既存テストの失敗時は互換性破壊として実装を見直す。
  - id: TS-009
    target_item: AG-009
    verification: |-
      pr-merge-and-conflict.md に merge 後重複行実検査、STEP-4-4 との目的差の区別、CLEAN 判定単独受理禁止の 3 点が記載されていることを rg で確認する。STEP-4-4/4-5 と mergeable ポーリング契約（10 秒間隔・上限 60 秒）に変更がないことを diff で確認する。
    pass_criteria: |-
      3 点が取り込み確認手順に明記されている。既存手順・ポーリング契約に変更がない。
    on_failure: |-
      fix-and-reverify。記載の不備を修正して再検証する。

# realization_actions: 実現面の変更方針（正規所有責務・変更意図・検証との対応）
realization_actions:
  - id: RA-001
    concern: "case-run / orchestration 配布 skill references への回収時記録・機械確認の手順明記（RU-0001）"
    responsibility: "case-run 委譲・回収手順の実行手順面。配布 skill の管理領域に手順を記述する（契約の正は v4-delegation-contracts Design〔ACT-DESIGN-001〕が所有し、本手順は Design への参照を伴う）"
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-run/（委譲・回収手順の references）"
      - "src/common/skills/agentdev-workflow-orchestration/（委譲関連の管理領域）"
    intent: "回収側実行者が Design 契約に従い PR 本文への両委譲記録併記と diff 空の機械確認を実行できるようにする"
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: "traceability sidecar への design covers 登録（RU-0002。対応 Design の特定・作成を前置）"
    responsibility: "REQ-010-007 / REQ-010-008 / REQ-009-029 の design covers 到達先の特定と sidecar 登録。対応時は正式な check_integrity 再確認を前置する（grep ベースの補助確認を根拠としない）"
    ownership_hints:
      - "traceability/ 配下 sidecar（対象行の covers 登録）"
      - "対応 Design の特定: REQ-010（docs-check）領域と REQ-009-029（ローカルIssue labels 値域）領域の既存 Design から。local-case-file.md Design が REQ-009-029 の候補。REQ-010-007/008 の候補は実装時に docs-check / integrity Design 群から特定し、存在しない場合のみ新規作成を検討する"
    intent: "3 行の REQ → Design 到達性を回復し、check_integrity で missing-design が検出されない状態にする"
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: "REQ-114 全行の implementation / verification covers 解消（RU-0003）"
    responsibility: "check 判定と covers 宣言・Design 本文実体の整合を確定し、REQ-114-001〜015 の implementation / verification covers を正規形式で確定する。実現 Case の起票は case-open が行う。対応後は正式な check_integrity で再確認する"
    ownership_hints:
      - "traceability/agentdev-workflow-backlog-auto.yaml（covers 宣言既存。check 判定との整合確定対象）"
      - "src/common/skills/agentdev-workflow-backlog-auto/tests/fixtures/applied-projects/*/manifest.json（REQ-114-013 の実装実体・既存）"
      - "src/common/skills/agentdev-workflow-backlog-auto/tests/end-to-end-contract.test.ts（検証実体・既存）"
    intent: "REQ-114 の要件と実現の間の traceability を閉鎖する"
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-004
    concern: "learning-capture 配布 skill への計測前提 baseline 明記条項追加（RU-0004。両方反映で確定・2026-10-16 HITL Q2）"
    responsibility: "agentdev-learning-capture の記録条項として、計測前提を含む記録に採番時点の baseline を明記する運用を追加する。inbox / deferred 管理方式は変更しない"
    ownership_hints:
      - "src/common/skills/agentdev-learning-capture/（記録条項の追加位置は SKILL.md または references の現行構造に従う）"
    intent: "learning 記録から起票された子 Issue が着手時に陳腐化を判定できる材料を確保する"
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-005
    concern: "issue-operation-recovery.md 診断手順への 2 段分離試験追記（RU-0007）"
    responsibility: "既存運用文書の診断手順の追記。target_area: ### 診断手順（gh repo view 手動実行に続く位置。### 回復手段の前）。書込み操作の gh CLI 代替禁止（fail-closed）と機密値非含有の制約を維持する"
    ownership_hints:
      - "src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md（target_area: ### 診断手順）"
    intent: "agentdev_gh 起動環境障害（exit 66・stderr 空）の切り分け（runner 契約と実行環境の正常性 vs plugin ホスト環境差）を手順として固定する"
    verification_refs: [TS-007]
    source_items: [AG-007]
  - id: RA-006
    concern: "record-comments.ts applySection の末尾セクション境界改善と回帰テスト追加（RU-0008。script 改善と手順明記の両方で確定・2026-10-16 HITL Q3）"
    responsibility: "applySection の境界検出を改善する（置換対象セクション後に「## 」見出しが現れない場合、後続する HTML コメント・注記を置換対象から除外）。API 形状・既存呼出し側互換性・既存テストを維持する。Bun 固有 API（import.meta.path / import.meta.dir）を保持し正規ランナーは bun のまま"
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（applySection、endIndex 初期値 lines.length の L210 箇所）"
      - "src/common/skills/agentdev-workflow-case-run/scripts/record-comments.test.ts（末尾セクション置換の回帰テスト追加）"
    intent: "Case Issue 本文の工程記録 HTML コメント群（履歴コメント）が末尾セクション置換で消失しない構造にする"
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-007
    concern: "cleanup-and-capture.md STEP-5-2 への適用前セクション後コンテンツ保全確認の明記（RU-0008）"
    responsibility: "case-close STEP-5-2 手順へ、applySection 適用前のセクション後コンテンツ保全確認（適用前読み戻しとコメント群の保全チェック）を明記する。agentdev-issue-management の VERIFY 運用（置換前の保全と役割が異なる）と区別して記載する"
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md（target_area: #### STEP-5-2: 完了記録の反映と Issue クローズ）"
    intent: "script 改善と手順確認の多層防御により、同一条件（文書末尾セクション置換）での再発を防ぐ"
    verification_refs: [TS-008]
    source_items: [AG-008]
  - id: RA-008
    concern: "pr-merge-and-conflict.md STEP-4 取り込み確認手順への merge 後重複行実検査の明記（RU-0009）"
    responsibility: "GitHub 版 STEP-4 の取り込み確認手順へ merge 後重複行実検査を追記する（STEP-4-5 の後・ローカル版手順節の前、または STEP-4-3 直後の取り込み確認位置）。STEP-4-4「内容重複確認」との目的差を区別し、CLEAN 判定単独受理禁止の規律を含める。直列化運用と mergeable ポーリング契約（10 秒間隔・上限 60 秒）は変更しない"
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-close/references/pr-merge-and-conflict.md（anchor: ## ローカル版 PR マージ（取り込み）の手順、before_anchor 配置候補）"
    intent: "GitHub squash merge の無音畳み込み（trivial 重複 auto-resolve）による本文重複の混入を merge 後に検出できるようにする"
    verification_refs: [TS-009]
    source_items: [AG-009]

# review_dispositions: 採否判断の記録（1 エントリ = 単一 source_ru + 単一 source_item）
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: AG-001
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0001 の必須要求と受け入れ義務 3 点を AG-001 / ACT-DESIGN-001 / RA-001 / TS-001 で対応。promoted 原本は削除済みのため代替識別子: RU-0001（出典 promoted: 2026-10-16-multi-delegation-recovery-record-keeping.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: AG-002
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0002 の必須要求と受け入れ義務 3 点を AG-002 / RA-002 / TS-002 で対応。covers 登録は実現面（sidecar・Design 特定）であり、artifact 操作は REQ/Design 本文変更を伴わないため realization_actions で引き渡す。promoted 原本は削除済みのため代替識別子: RU-0002（出典 promoted: 2026-10-16-req010-007-008-req009-029-missing-design.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: AG-003
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0003（N:1 統合 RU）の必須要求と受け入れ義務 4 点を AG-003 / ACT-DESIGN-002 / ACT-REQ-001 / RA-003 / TS-003 で対応（DS17・DS19 は Design 本文実体追加〔CR-001〕、RQ17 は REQ 要約是正、covers 解消と処理判断記録を含む）。OU 構成は統合維持で確定（2026-10-16 HITL Q4・9 OU のまま単一要件doc）。promoted 原本は削除済みのため代替識別子: RU-0003（出典 promoted: 2026-10-16-req114-implementation-verification-missing.md と finding-20261016-req114-doc-fix-candidates.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: AG-004
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0004 の必須要求と受け入れ義務 3 点を AG-004 / ACT-DESIGN-004 / RA-004 / TS-004 で対応。反映先は両方（case-run 委譲契約 + learning-capture baseline 明記）で確定（2026-10-16 HITL Q2）。promoted 原本は削除済みのため代替識別子: RU-0004（出典 promoted: 2026-10-16-stale-premise-remeasure-before-start.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0005
    source_item: AG-005
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0005 の必須要求と受け入れ義務 3 点を AG-005 / ACT-DEC-001 / TS-005 で対応。方向B（DEC-059 文言明確化・非意味修正の明示承認付き）で確定（2026-10-16 HITL Q1）。promoted 原本は削除済みのため代替識別子: RU-0005（出典 promoted: finding-20261015-case-close-release-support-candidate.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0006
    source_item: AG-006
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0006 の必須要求と受け入れ義務 3 点を AG-006 / ACT-DESIGN-003 / TS-006 で対応（機械的に一意の表層修正〔重複「16.」→「17.」〕。現物確認済み 2026-10-16）。promoted 原本は削除済みのため代替識別子: RU-0006（出典 promoted: finding-20261016-issue-tracking-design-list-renumber.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0007
    source_item: AG-007
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0007 の必須要求と受け入れ義務 3 点を AG-007 / RA-005 / TS-007 で対応。detail 文言拡張は CR-003 で拡張しないと判断（REQ-052-014 最小限の detail 契約維持）。retired REQ-093 恒久化水準再評価は変更義務なしで判断材料保持。promoted 原本は削除済みのため代替識別子: RU-0007（出典 promoted: existing-measure-update-agentdev-gh-spawn-failure-isolation.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0008
    source_item: AG-008
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0008 の必須要求と受け入れ義務 3 点を AG-008 / RA-006 / RA-007 / TS-008 で対応。実現先は両方（script 改善 + STEP-5-2 手順明記）で確定（2026-10-16 HITL Q3）。promoted 原本は削除済みのため代替識別子: RU-0008（出典 promoted: existing-measure-update-applysection-content-preservation.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0009
    source_item: AG-009
    disposition: covered
    reason_code: ru_covered_by_operation_unit
    reason: |-
      RU-0009 の必須要求と受け入れ義務 3 点を AG-009 / RA-008 / TS-009 で対応。promoted 原本は削除済みのため代替識別子: RU-0009（出典 promoted: existing-measure-update-post-merge-duplicate-line-check.md）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: 受け入れ基準
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠
assembly_evidence: []

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition: |-
    scale: large・Epic 構成なしで確定（2026-10-16 HITL Q5 回答）。OU 単位の Issue 並列実行とする（REQ-114-004 の共有 active Issue task 上限と横断補充〔REQ-034-027、REQ-034-040〕に従い、一式を複数グループへ分断して逐次化しない）。9 OU は相互依存なし（depends_on 全空）。技術的依存なし（同一 Design ファイル接触のみ下記 wave_hints）。
  wave_hints:
    - "OU-001 と OU-004 は同一 Design ファイル（docs/designs/workflows/v4-delegation-contracts.md「## 委譲制約（6）」節）への追記のため、同一 Issue への束ねまたは直列適用を推奨（同時編集競合の回避。case-open が最終決定）"
    - "OU-007 と OU-009 は同一配布 skill の別 references（agentdev-workflow-case-close/references/ の cleanup-and-capture.md は RA-007、pr-merge-and-conflict.md は RA-008）。別ファイルのため並列可"
```

# summary

## 要件docの構成

- **入力**: backlog-auto e2e run 20261016T142343JST の RU 一式 9 件（backlog-review 生成・利用者承認済み 2026-10-16 Q1(a)/Q2(a)）。set-state 義務スナップショットと 1:1 対応。
- **構造**: 9 operation_units（RU 毎 1:1、backlog-review の Jev 先行評価による統合・分割判定を継承）。単一 REQ doc・単一 case-auto 接続（REQ-114-003 契約）。
- **work_type**: docs_chore（正規成果物・配布物の文書規律整備が主体。RU-0008 の script 改善を含むが付随する不具合修正）
- **scale**: large（影響ファイル推定 15 超・複数 REQ 領域横断。分解計画は Epic なし・OU 単位 Issue 並列で確定〔2026-10-16 HITL Q5〕）

## Decision 判断

新規 Decision の作成は不要。根拠: 全 RU が既存アーキテクチャパターンに従う規律整備・文書修正・不具合修正であり、技術スタック選定・アーキテクチャパターン変更・逆転困難な技術判断を含まない（agentdev-decision-guidelines「Decisionを作成してはならない条件」に該当）。RU-0005 は方向B（accepted DEC-059 の文言明確化）で確定済み（2026-10-16 HITL Q1・非意味修正としての明示承認）。DEC-059 の status は accepted を維持し、後継 Decision 作成は発生しない（ACT-DEC-001 手続き注記）。

## 既存REQ照合結果（STEP-3）

| RU | 照合結果 | 操作分類 |
|---|---|---|
| RU-0001 | 既存 Design（v4-delegation-contracts）への条項追加。新規要件なし | Design append + 実現面手順 |
| RU-0002 | REQ-010-007/008・REQ-009-029 は既存 REQ 行（要件本文変更なし） | covers 登録（実現面・REQ 変更なし） |
| RU-0003 | REQ-114 は既存 REQ（全 15 行）。covers 解消・Design 実体追加・REQ-114-014 要約是正 | 既存 REQ の表現是正（update）+ Design update + covers 登録 |
| RU-0004 | 既存 Design（v4-delegation-contracts）・配布 skill への条項追加 | Design append + 実現面条項 |
| RU-0005 | DEC-059（accepted）の文言明確化（方向B 確定） | Decision update（非意味修正・明示承認済み） |
| RU-0006 | 既存 Design（agentdev-issue-tracking）の番号表層修正 | Design update（表層） |
| RU-0007 | 運用文書（配布 skill references）への手順追記。REQ-052 本体変更なし | 実現面手順追記 |
| RU-0008 | 配布 script（record-comments.ts）改善 + 配布 references 手順明記 | 実現面（script + 手順） |
| RU-0009 | 配布 references（pr-merge-and-conflict.md）への手順追記 | 実現面手順追記 |

新規 REQ ファイルの作成なし。既存 REQ の更新は RU-0003 の REQ-114-014 要約是正のみ（REQ 行の制約内容は不変・要約精度のみ）。

## 壁打ち HITL 回答結果（2026-10-16 受領・全問推奨どおり確定）

- Q1〔RU-0005〕= **B**: DEC-059 L49 文言を後続工程（stage 7 リリース）の総称として明確化。決定内容不変。非意味修正として明示承認済み（status: accepted 維持・後継 DEC なし）
- Q2〔RU-0004〕= **両方**: case-run 委譲契約条項（ACT-DESIGN-004）+ learning-capture baseline 明記（RA-004）
- Q3〔RU-0008〕= **両方**: script 改善 + 回帰テスト（RA-006）+ STEP-5-2 保全確認明記（RA-007）
- Q4〔RU-0003〕= **統合維持**: 9 RU→9 OU のまま単一要件doc・単一 case-auto 接続（再スコープなし）
- Q5〔scale〕= **Epic なし・OU 単位 Issue 並列**: REQ-114-004 共有 active task 上限と横断補充に従う

## adversarial-review 結果（STEP-8）

2 系統の独立 review stream（Stream 1: 契約整合・設計面、Stream 2: 内容・実現面）で challenge 実施。findings 3 件を draft へ反映済み:

- F-1（Stream 1）: ACT-DESIGN-001/004 の target_area「## 委譲制約（6）」は条項数更新を伴い得る → content へ調整注記を追加済み
- F-2（Stream 1）: 方向B は accepted Decision の文言修正 → Decision ライフサイクル手続き注記（非意味修正としての明示承認 vs 後継 DEC）を ACT-DEC-001 と Q1 に追加済み
- F-3（Stream 2）: Q4 を「OU 構成（Case 規模調整）」として正確化し、複数要件doc分割（再スコープ・REQ-114-005）と混同しない質問文に修正済み

convergence audit: 残存争点が HITL 質問 Q1〜Q5（ユーザー判断事項）のみに集約したことを確認。対論上の未解決衝突なし。
