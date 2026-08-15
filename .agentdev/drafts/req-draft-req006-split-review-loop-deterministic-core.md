---
draft_type: req_draft
topic_slug: req006-split-review-loop-deterministic-core
status: saved
created_at: 2026-08-14T21:40:00+09:00
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004]
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  REQ-006（Case実行オーケストレーション、114要件行）を関心単位の6 REQへ分割し、REQ-006を工程横断capture責務の統括REQへ縮約する。
  その上で、RU-0001（指摘事項の一般化と欠陥類型単位の修正・検証）、RU-0002（対論型レビューの成立条件・重要指摘モデル）、
  RU-0003（ADF決定論的実行中核と構造改善ループ、新規Decision含む）、RU-0004（信頼境界を扱う対象の非機能受け入れ条件の前倒し）を
  分割後のREQ構成へ適用する。適用順序は SPLIT → レビューループ強化 → 非機能前倒し → 決定論的実行中核の4 Wave とし、
  REQ-006への追記競合を分割で解消した上で直列に進行する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-006 SPLIT。現行114要件行を関心単位へ分割する。
      REQ-006-001〜021（case-open）→ 新REQ「case-open 実行契約」、REQ-006-022〜038（case-run）→ 新REQ「case-run 実行契約」、
      REQ-006-039〜059（case-close）→ 新REQ「case-close 実行契約」、REQ-006-060〜064（case-update）→ 新REQ「case-update 実行契約」、
      REQ-006-065〜094・110・112〜114（case-auto）→ 新REQ「case-auto 実行契約」、REQ-006-095〜104（Epic/Wave）→ 新REQ「Epic と Wave 実行モデル」。
      REQ-006-105〜109・111（工程横断capture）はREQ-006へ残存し、REQ-006は統括境界と工程横断capture責務のREQへ縮約する。
      新REQ番号は req-save の alloc-req-number.ts が採番する（REQ-030以降の想定）。移動行の本文は docs/requirements/REQ-006.md の該当行を正とし、要件行IDは保存時に新REQ番号へ再採番する。
      分割後の各REQ要件行数は case-open 21行、case-run 17行（RU-0001適用後23行）、case-close 21行、case-update 5行、
      case-auto 34行（REQ-006-110 の要件テーブル行への統合を含む。RU-0003適用後36行）、Epic/Wave 10行（RU-0003適用後11行）、REQ-006残存6行で、すべて健全性メトリクス閾値（81行超）未満。
      移動行IDへの被参照のうち REQ-017-002 の「REQ-006-004 維持」注記は本変更で分割後参照へ更新する（ACT-REQ-019）。docs/specs/** 等に既に存在する旧 REQ-006-XXX 行ID参照（分割前に一部陳腐化しているものを含む）は、REQ-006 分割記録の旧→新対応表を正として漸次更新するものとし、本変更の適用範囲外とする。
  - id: AG-002
    content: |
      adversarial-review の指摘事項一般化とレビュー上解消の定義（RU-0001 §6.1-6.2、RU-0002 §4.1-4.3）。
      対論型レビューは評価開始時にレビュー論点を設定し、各論点について成立条件を対象・目的・制約・正規成果物・技術領域・想定される破綻に応じて動的に導出する（固定チェックリストではない。レビュー論点と成立条件を同一概念としない）。
      レビューアーは成立条件が成立しない具体的な条件・根拠・矛盾・欠落・不成立な前提を探索して反証を試みる（一定数の問題発見を目的としない。十分な反証後も問題を確認できなければ正常なレビュー結果とする）。
      指摘は主張・根拠・前提・適用範囲・反証条件を意味的に区別した未確定の主張として扱い、レビュイーは自動採用せず反証でき、レビューアーは反証を再評価して撤回・維持・限定・修正・部分的採用ができる。
      本質的な指摘事項（未解消では Issue の完了条件・受け入れ条件・REQ・Decision・SPEC・必須品質条件の充足を主張できない指摘。ハーネス重大度名称に依存しない）が反証を経て維持・限定・部分合意された場合、可能な範囲で根本原因・破綻機構、破られている前提・不変条件、欠陥類型、適用範囲、同種事例・隣接事例、適用外条件、レビュー上の解消条件を明らかにする。一般化の根拠が不足する場合は推測で範囲を確定せず一般化範囲不明・証拠不足として扱う。
      レビュー上の解消は審議上の決着を意味し、コード修正・試験完了・品質ゲート通過を意味しない。本質的な指摘事項は、欠陥類型と適用範囲を合理的に特定できた、具体例固有で一般化不要の根拠を確認できた、証拠不足を明示し未解決事項として残した、のいずれかまで確認する。
  - id: AG-003
    content: |
      対論型レビューの重要性判定・収束・収束後再検証・判断独立性・ユーザー判断（RU-0002 §4.4-4.9）。
      各指摘について、採否によって対象の妥当性・要求充足・設計判断・採否・受け入れ判定が変わり得るか否かで重要性を判定し、重要指摘を定義する。重要性と重大度を同一概念としない。好み・表現改善・対象の妥当性に影響しない軽微な改善・対象範囲外の理想論・具体的影響を示せない抽象的懸念は原則として重要指摘としない。重要性の有無も相互反証対象とする。
      指摘と本質的争点を別概念とし、一つ以上の重要指摘を相互反証するための意味単位へ整理したものを本質的争点とする。複数レビュー系統の同じ問題の別指摘は統合でき、同一指摘の件数を妥当性・重要性の強さとして扱わない。
      未解決の重要指摘が存在しないことをレビュー完了の中心条件とし、固定反復回数を収束条件としない。重要指摘は採用と修正反映、反証成立による撤回または棄却、適用範囲の限定、ユーザー判断のいずれかで解消する。重要でない指摘だけの残存を理由に対論を継続せず、重要指摘0件を正常結果として許容する。
      収束候補形成後に各成立条件の継続成立・採用した指摘への対応による別の成立条件の破壊有無・新たな重要指摘の有無を再検証し、新たな重要指摘が確認された場合は当該争点の対論を再開する。
      レビューアーは対象作成側の自己評価・正当性の主張・未検証の前提をそれ自体を理由として正しいものと扱わず、別モデル・別物理エージェントを必須とせず、初期2系統の独立レビューの独立性（初期指摘生成前の相互指摘非共有）を維持する。
      自律解決できない事項（一意に決着できない優先判断、ユーザー固有の価値判断、両立不能な要求、新たな対象範囲判断、必要情報不足）のみユーザー判断へ付議し、単なる意見不一致を理由にユーザーへ返さない。ユーザー回答後は影響を受ける争点から審議を再開する。
  - id: AG-004
    content: |
      呼出元との責務分界（RU-0002 §4.10）と用語整合。
      成立条件の導出、指摘の重要性判定、本質的争点への整理、収束判定のロジックは adversarial-review 側（REQ-003、adversarial-review SPEC）が単一所有し、
      呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run、case-auto）へ重複定義しない。
      呼出元は対論型レビューの結果を受領し、既存契約に従って採用済み指摘の反映、未解決事項の伝播、後続処理判断を行う。
      既存の原則実行・スキップ可能という位置づけ、QG・HITL非代替、副作用境界を変更しない。
      欠陥類型の適用範囲拡大は同一の本質的な指摘事項の更新として扱い、新規指摘事項として再起票しない（REQ-014-007 との用語整合）。
  - id: AG-005
    content: |
      欠陥類型を修正単位とする case-run 実行契約（RU-0001 §6.3-6.9）。
      実行中に本質的な指摘事項が確認された場合、報告された個別事例のみを修正単位とせず、根本原因・欠陥類型・同一原因の影響範囲・必要な修正範囲・必要な追加検証範囲を整理してから修正する。この原則は adversarial-review 由来だけでなくコードレビュー・QA・品質ゲート・試験等で確認された本質的な指摘事項にも適用する。
      一般化した修正範囲が Issue 対象範囲内の内部実装変更で完結する場合は自律修正を許可し、Issue 対象範囲・完了条件・受け入れ条件・REQ・Decision・SPEC・必須品質条件の変更が必要な場合は blocked とする。
      修正後は元の再現事例だけの再検証をもって完了とせず、欠陥類型に応じて合理的に必要な検証対象を選定する（固定の全項目必須チェックリストにしない）。
      検証中の新たな失敗事例は根本原因が同一なら既存欠陥類型の適用範囲不足として再修正し、根本原因が異なる場合のみ新規指摘事項とする。
      本質的な指摘事項は Findings 記録だけで未解消のまま completed-pr にせず、Issue 内で修正可能なら修正と欠陥類型単位の検証成功後にのみ completed-pr を許可する。非本質的な指摘事項は既存契約に従い Findings 記録による継続を許可する。
      十分な調査後も根本原因・欠陥類型を確立できない本質的な指摘事項は failed とする（局所的な推測修正で completed-pr へ進まない）。十分な調査を固定回数・固定時間で定義しない。既存4状態（completed-pr / blocked / failed / delegation-unavailable）を維持し新しい結果状態を追加しない。
  - id: AG-006
    content: |
      欠陥類型単位の検証証拠（RU-0001 §6.10）。
      本質的な指摘事項を修正して completed-pr とする場合、対象となった指摘事項、特定した根本原因または欠陥類型、採用した修正範囲、実施した欠陥類型単位の検証、検証結果の5点を、既存の PR 本文または品質ゲート完了報告から確認できるようにする。新しい正規成果物種別を追加しない。
  - id: AG-007
    content: |
      信頼境界を扱う対象の非機能受け入れ条件の前倒し（RU-0004）。
      適用対象は、信頼できない入力の構文解析・検証・解釈（パーサ、レクサ、デシリアライザ等）、権限・配布・trust 境界の enforcement、外部ネットワーク経路・アーカイブ展開等の外部攻撃面を持つ処理のいずれかに該当するもの。判定基準は文書上で機械的に判定できる形で定義し、適用対象とした場合はその前提を要件docに記録する（適用外の場合の記録は強制しない）。
      適用対象の要件docでは、処理量の上限（時間計算量・処理ステップ数・走査量の上限）、出力の上限（出力件数・証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）の3項目を受け入れ条件として確定するまで壁打ちを継続する。
      3項目への回答は検証可能な形式（上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれか）を要求し、形式不定の回答や形式的な記述を許容しない。数値上限の記述は既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドの規範に従う。
      主発動点は work_type に関わらず常に実行される要件展開工程とし、adversarial-review の発動条件に依存しない。adversarial-review の動的レビュー戦略の検出観点は第二の網として助言に留め、新規の統制ゲートを構成しない。
      確定した受け入れ条件は既存の投影契約（SPLIT 後は case-open 実行契約 REQ の該当行〔分割元 REQ-006-004〕、REQ-017-002）により下流へ運搬し、draft-data スキーマ、要件docテンプレート、QG、正規成果物種別を変更しない。
  - id: AG-008
    content: |
      新規Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」（RU-0003 §3.1/3.2/3.9、アーキテクチャ助言 B-1/B-2/B-3/B-6 採用）。
      ADF は決定論的な実行中核として、実行状態の遷移、処理単位間の依存関係判定、実行可能な処理単位の判定、不正な状態遷移の拒否、再開位置の再構成、並列分岐後の合流可否判定、処理結果の集約、実行中に守るべき不変条件の検査を所有する。
      実行基盤側の責務は DEC-001 決定2 が所有し、本 Decision は再列挙しない（意味の二重所有の防止）。RU-0003 §3.2 の harness 側項目のうち DEC-001 決定2 に未列挙の4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）は、DEC-001 決定2 へ追加して所有主張と実リストを一致させる（ACT-DEC-002。ドラフト承認時の確認事項）。
      並列処理について、並列可否・依存関係・合流条件等の判定は ADF が所有し、実際の並列起動機構は実行基盤へ委譲する（REQ-011-018 の並列実行は起動機構を指す）。
      決定論的処理は Command / Workflow Skill / Capability Skill の3層（DEC-010）を維持したまま、既存の script 種別と Capability Skill の公開能力として接続し、新層・新成果物種別を導入しない。
      STEP は workflow 層の再開単位（DEC-011）、処理単位は orchestration 層の再開単位として階層関係を明確化する。
      不正な状態遷移の拒否と不変条件の検査は DEC-001 決定3 の既存ハード統制点（状態破壊、二重実行・競合更新）の適用として整理し、新規ハード統制点を追加しない。
      状態機械制御は、複数段階、中断・再開、複数処理単位、並列分岐・合流、依存関係、外部処理待ち、一部成功・一部失敗のいずれかを持つ処理に限定して適用する。
      relates-to: DEC-001, DEC-010, DEC-011（supersede しない）。再評価条件: 決定論的実行中核の適用対象処理が公開処理の過半を占める、または状態機械の選択的適用基準の維持コストが判定コストを上回る場合。
  - id: AG-009
    content: |
      共通実行契約と選択的状態機械・利用者向け報告（RU-0003 §3.3/3.4/3.11）。
      全公開処理は、処理の複雑さにかかわらず、実行状態、処理固有の結果、停止した場合の理由、再開可能か否かを共通して表現できる実行契約を持つ。実行状態と処理固有の結果を別概念として扱い、処理自体は完了したが警告あり、と、処理が中断され結果未確定、を区別でき、既存処理が持つ複数次元の結果を共通実行状態へ押し潰さない。
      状態機械による制御は、複数段階、中断・再開、複数処理単位、並列分岐・合流、依存関係、外部処理待ち、一部成功・一部失敗のいずれかを必要とする処理に限定し、単純な収集処理や読み取り専用診断へ一律に重い状態機械を導入しない。
      既存処理は、停止時、中断状態からの再開時、正常終了または異常終了時に、共通実行契約に基づく状態を必要な範囲で報告する。報告では実行状態、停止理由、再開可否、処理固有結果を意味的に区別する。状態確認だけを目的とする専用 Command は追加しない。
  - id: AG-010
    content: |
      ローカル一時実行状態と再開時正規状態優先（RU-0003 §3.5/3.6）。
      中断・再開に必要なローカル一時実行状態はローカルに永続化し、Git 管理を要求せず、他端末との共有を要求せず、実行履歴としての恒久保存を要求せず、会話コンテキストだけを唯一の情報源にせず、保存場所の具体的なパスを要件として固定しない。
      正規成果物から再構成できる情報を別の正規状態として重複管理せず、正規成果物へまだ反映されていない中断・再開に必要な最小情報のみを保持し、正規成果物上で処理単位が終端状態になった後にその処理単位のローカル状態保持を要求しない。`.agentdev/` の Git 管理対象ドメイン状態と Git 管理しないローカル一時実行状態を区別できること。
      再開時は、ローカル一時状態から再開対象を特定し、Issue / PR / Case ファイル等の正規状態を再取得して現在位置を再構成し、既に完了している処理を再実行せず未完了部分のみを続行する。ローカル一時状態と正規状態が矛盾する場合は正規状態を優先し、安全に自動解消できない場合は停止する。
  - id: AG-011
    content: |
      処理単位を一級概念とする並列実行と worktree 隔離（RU-0003 §3.7/3.8）。
      並列実行は複数エージェントを起動することではなく、独立した処理単位を定義した結果として可能になるものとする。処理単位は少なくとも、安定した識別子、入力、出力、依存関係、所有対象、現在状態、完了条件、検証結果、必要な場合の worktree との対応の意味を持てる（具体的な格納形式は SPEC）。
      依存関係上独立した処理単位は並列実行可能とする。Git 上の変更を伴う並列処理では処理単位を worktree で隔離する既存方針を維持する。ADF は実行可能な処理単位、並列可能性、合流条件、一部失敗時の全体状態遷移を判断し、実際に起動するエージェント数、起動 API、実行基盤固有の並列化手段は ADF の正規契約へ固定しない。
      並列処理の一部が失敗・中断した場合、完了済み処理を未完了へ戻さず、全体の次状態を規則に従って判定し、必須処理単位が揃っていない状態で後続処理へ進まない。
  - id: AG-012
    content: |
      learning pipeline の構造改善先分類（RU-0003 §3.10）。
      learning pipeline は学びを保存するだけでなく、再発防止のためにどこへ反映すべきかを評価する。候補には既存 REQ / Decision / SPEC への反映、Skill の改善、決定論的な検査・ガードレールへの移管、既存処理手順の改善、通常の Issue による修正、重複・陳腐化した知識の削除、現時点では反映不能なものの保留を含める。
      learning-promote がこれらを直接変更せず、現行の learning-promote → backlog-review → RU → req-define の承認・要件化経路を維持し、構造改善先の分類結果を後続工程へ渡す。
  - id: AG-013
    content: |
      REQ-011 における実行判断と実行機構の境界明示（RU-0003 §3.2、アーキテクチャ助言 B-4 採用）。
      状態遷移、処理単位間の依存関係評価、実行可能な処理単位の判定、不正な状態遷移の拒否、再開位置の再構成、並列分岐後の合流可否判定、処理結果の集約、実行中に守るべき不変条件の検査は ADF の規範所有対象とする。REQ-011-018 の並列実行は並列起動機構を指し、並列の可否・依存・合流の判定はこの追加行が所有する。実際の起動機構は harness 責務（REQ-011-018）のまま変更しない。REQ-011-017（外部実行境界）は変更しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-001]
    content: |
      REQ-006 を縮約後の全文へ更新する（分割済み行の削除と境界宣言の更新）。要件テーブルには REQ-006-105〜109 と REQ-006-111 のみを残し、REQ-006-001〜104、110、112〜114 を削除する。

      ## 目的

      AgentDevFlow 実行フェーズにおける Case 実行オーケストレーション体系の統括境界と工程横断 capture 責務を所有する。
      個別 command の実行契約は、本 REQ から分割した各 REQ が所有する。case-open は case-open 実行契約 REQ、case-run は case-run 実行契約 REQ、case-close は case-close 実行契約 REQ、case-update は case-update 実行契約 REQ、case-auto は case-auto 実行契約 REQ が所有し、Epic Issue を実行順序の SSoT とする実行モデルは Epic と Wave 実行モデル REQ が所有する。
      工程接続のプロトコル層（マクロフェーズ構成、SSoT 遷移、work_type 分類、scale 評価）は REQ-005 が所有する。
      委譲時の判断、承認、副作用発動の境界は REQ-003 が所有し、配布成果物の責務境界と委譲プロトコルの配布物側正規所有は REQ-002 が所有する。
      完了証明と成果物品質ゲートは REQ-007 が所有し、draft、RU、要件doc の構造化契約と lifecycle は REQ-008 が所有する。
      Issue execution contract は REQ-017 が所有する。external execution boundary は REQ-011-017 が、harness execution mechanism は REQ-011-018 が所有する。
      工程横断 capture の詳細実装は SPEC（capture-boundaries.md）を正規所有者とし、本 REQ は境界宣言へ縮約する。

      分割記録: REQ-006-001〜021 は case-open 実行契約 REQ へ、REQ-006-022〜038 は case-run 実行契約 REQ へ、REQ-006-039〜059 は case-close 実行契約 REQ へ、REQ-006-060〜064 は case-update 実行契約 REQ へ、REQ-006-065〜094・110・112〜114 は case-auto 実行契約 REQ へ、REQ-006-095〜104 は Epic と Wave 実行モデル REQ へ移動した（2026-08-14、要件行 ID は移動先で再採番）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-006-105 | case-close は PR 本文からの回収に加え自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること |
      | REQ-006-106 | req-save は REQ 再構成 intake に加え自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること |
      | REQ-006-107 | spec-save は自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること（従来の非関与から変更） |
      | REQ-006-108 | case-auto は各工程の capture 成果物の保存結果参照と件数集計のみを行い capture 本文の再分類・再保存を行わないこと |
      | REQ-006-109 | 各工程 command の deviation capture は agentdev-learning-capture skill または agentdev-intake-pipeline への委譲で行い別 command を直接呼ばず完了報告に保存した capture 成果物のパス・分類・保存結果のみを含めること |
      | REQ-006-111 | req-save command のガイドレール G12 は deviation capture が Skill（agentdev-learning-capture または agentdev-intake-pipeline）への委譲である旨を明示すること。責務境界は変更せず、SPEC 副作用セクション（capture-boundaries.md）と整合すること |

      ## 適用範囲

      - 対象:
        - 工程横断 capture 責務（req-save、spec-save、case-open、case-close の自工程 deviation capture と case-auto の保存結果参照・件数集計のみ。deviation は capture-boundaries.md の Split Rule で intake/learning へ振り分け、agentdev-learning-capture skill または agentdev-intake-pipeline へ委譲して保存する）
        - Case 実行オーケストレーション体系の統括参照（分割先 REQ の境界整合、分割元/分割先の記録）
      - 対象外:
        - case-open、case-run、case-close、case-update、case-auto の各実行契約（分割先 REQ）
        - Epic Issue を実行順序 SSoT とする Epic/Wave 実行モデル（分割先 REQ）
        - ワークフローのマクロフェーズ構成、SSoT 遷移、work_type 分類、scale 評価、公開 command 分類（REQ-005）
        - 委譲時の最終判断、ユーザー承認、永続化と外部更新、制御された副作用の発動契約（REQ-003）
        - 配布成果物の責務境界、subagent 委譲プロトコルの配布物側正規所有（REQ-002）
        - 機械横断是正の完了証明と成果物品質ゲート（REQ-007）
        - draft、RU、要件doc の構造化契約と lifecycle（REQ-008）
        - execution contract の事前確定責務（REQ-017）
        - external execution boundary（REQ-011-017）、harness execution mechanism（REQ-011-018）
        - REQ と SPEC の責務分離の一般原則と文書種別配置基準（REQ-001）
        - capture の Split Rule、委譲契約の詳細実装（SPEC）
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:case-open-execution
    source_items: [AG-001]
    content: |
      新規 REQ「case-open 実行契約（Issue構成生成）」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-001〜021 の行を移動する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: case-open 実行契約（Issue構成生成）

      ## 目的

      case-open の実行契約を所有する。合意済み要件doc からの GitHub Issue 本文生成、Standard flow と Epic flow のルーティング、Epic/Wave/Issue 構成の自律生成、構成検証、RU 削除と同期確認を扱う。
      マクロフェーズ構成と work_type 分類は REQ-005 が、execution contract の境界定義は REQ-017 が、Epic Issue を実行順序 SSoT とする実行モデルは Epic と Wave 実行モデル REQ が所有し、本 REQ は case-open の実行オーケストレーションを所有する。

      ## 適用範囲

      - 対象: case-open（Issue 本文生成、REQ 番号埋め込み、Standard と Epic flow ルーティング、Epic/Wave/Issue 構成の自律生成、連結成分と3軸判断、スコープ重複検知、完了条件記載、構成検証、RU 削除と同期確認）
      - 対象外: マクロフェーズ構成と work_type 分類（REQ-005）、委譲時の判断と承認（REQ-003）、execution contract の境界定義（REQ-017）、Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）、Epic サイズ上限等の数値（SPEC）、harness 固有詳細の配布物からの除去一般原則（REQ-002）
  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:case-run-execution
    source_items: [AG-001]
    content: |
      新規 REQ「case-run 実行契約（実装実行と委譲）」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-022〜038 の行を移動する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: case-run 実行契約（実装実行と委譲）

      ## 目的

      case-run の実行契約を所有する。準備・実装・提出の再開可能フェーズ、作業用 worktree での実装と PR 作成、実行担当サブエージェントへの委譲、QG-3 の実装充足と乖離ゲート、staleness check、Findings 記録、Epic Wave 並列実行を扱う。
      execution contract（REQ-017）に基づき実行し、委譲時の判断と承認の境界は REQ-003 が、実行担当サブエージェントの起動手段は harness 責務（REQ-011-018）が所有する。

      ## 適用範囲

      - 対象: case-run（準備と実装と提出の再開可能フェーズ、worktree 実装と PR 作成、QG-3 の実装充足と乖離ゲート限定、単位 Issue と Wave スコープ、実行担当サブエージェント委譲、staleness check、docs 整合性検査、Findings 記録、capture 責務境界、Epic Wave 並列実行とべき等再実行、実行時間計測、REQ-017 execution contract の消費と blocked 遷移）
      - 対象外: execution contract の事前確定（REQ-017）、委譲時の判断と承認（REQ-003）、Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）、同時起動上限の数値（SPEC）、実行担当サブエージェントの起動 API と並列度（harness 責務、REQ-011-018）
  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:case-close-execution
    source_items: [AG-001]
    content: |
      新規 REQ「case-close 実行契約（完了判定とマージ）」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-039〜059 の行を移動する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: case-close 実行契約（完了判定とマージ）

      ## 目的

      case-close の実行契約を所有する。達成判定、整合確認、PR マージ、Issue クローズ、ドメイン状態永続化、クリーンアップ、Epic Wave クローズを扱う。
      QG-4 検査規則は agentdev-quality-gates が、Epic Issue 本文の単一書き手規則は Epic と Wave 実行モデル REQ が所有する。

      ## 適用範囲

      - 対象: case-close（達成判定、整合確認、Decision 確認、PR マージと Issue クローズと永続化とクリーンアップの分離報告、intake と learning 回収、ローカル変更安全停止、branch と worktree 削除安全、rebase による機械的コンフリクト解消とエスカレーション、mergeable 待機、main 同期安全、test strategy 完了条件、Epic Wave クローズと完了条件評価、docs 全体検索、Epic 自動クローズ判定の事前状態取得）
      - 対象外: QG-4 検査規則の定義（agentdev-quality-gates）、Epic Issue 本文単一書き手規則（Epic と Wave 実行モデル REQ）、委譲時の判断と承認（REQ-003）、mergeable 待機の詳細パラメータと capture の Split Rule（SPEC）
  - id: ACT-REQ-005
    artifact: req
    operation: create
    target: new:case-update-execution
    source_items: [AG-001]
    content: |
      新規 REQ「case-update 実行契約（Issue・要件更新）」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-060〜064 の行を移動する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: case-update 実行契約（Issue・要件更新）

      ## 目的

      case-update の実行契約を所有する。Issue 本文更新、コメント追加、REQ ファイル更新、レビュー NG 対応の4モードと SSoT 整合性維持を扱う。
      CI/CD 修正と自律修正ループは case-run 実行契約 REQ の責務であり、本 REQ は管轄外とする。

      ## 適用範囲

      - 対象: case-update（4モード、CI/CD と自律修正の case-run 委譲、テンプレート構造維持、フェーズ維持、Issue 番号取得制約、SSoT 整合性）
      - 対象外: CI/CD 修正と自律修正ループ（case-run 実行契約 REQ）、委譲時の判断と承認（REQ-003）、Issue 操作の安全手続きの詳細（SPEC、agentdev-issue-management）
  - id: ACT-REQ-006
    artifact: req
    operation: create
    target: new:case-auto-execution
    source_items: [AG-001]
    content: |
      新規 REQ「case-auto 実行契約（自走オーケストレーション）」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-065〜094・112〜114 の行を移動し、REQ-006-110（散文サブセクション「case-auto の結果状態区別報告」）を要件テーブル行へ統合する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: case-auto 実行契約（自走オーケストレーション）

      ## 目的

      case-auto の実行契約を所有する。要件doc または GitHub Issue を入力とする追加入口としての自走 orchestration（入力解決、artifact_actions 工程決定、orchestration stage モデル、execution_unit 並列実行、停止理由分類、bounded parent decision resolution、4状態区別報告、完了報告）を扱う。
      case-auto は標準フローを置換しない追加入口であり、各工程の command 定義を権威情報源として委譲先に読み込ませる。Epic/Wave 実行モデルの実行規則は Epic と Wave 実行モデル REQ が所有する。

      ## 適用範囲

      - 対象: case-auto（追加入口、入力解決、artifact_actions 工程決定、自走対象と対象外、構成工程委譲と case-run インライン実行、operation_unit キュー管理、execution_unit 並列実行、Wave 間直列、blocked 部分停止、永続状態進行と再開、クリーンアップ検証ゲート、停止理由分類と再開コマンド報告、壁時計時間計測、orchestration stage モデル、4状態区別報告、background task 回復、コンフリクトエスカレーション、bounded parent decision resolution）
      - 対象外: 標準フローの置換（case-auto は追加入口）、マクロフェーズ構成（REQ-005）、Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）、同時起動数・再実行回数上限の数値（SPEC）、エージェント起動機構（harness 責務、REQ-011-018）
  - id: ACT-REQ-007
    artifact: req
    operation: create
    target: new:epic-wave-execution-model
    source_items: [AG-001]
    content: |
      新規 REQ「Epic と Wave 実行モデル」を作成する。要件テーブルは docs/requirements/REQ-006.md の REQ-006-095〜104 の行を移動する（本文は移動元ファイルの該当行を正とし、要件行 ID は新 REQ 番号で再採番する）。

      title: Epic と Wave 実行モデル

      ## 目的

      Epic Issue を実行順序の SSoT（唯一の情報源）とする Epic/Wave オーケストレーションモデルを所有する。子 Issue の実行状態ライフサイクル、Wave 状態の導出、execution_unit 定義、Epic Issue 本文の単一書き手排他制御、別 Epic 分割許容、コンフリクト解消モデルを扱う。
      Wave 構成の生成は case-open 実行契約 REQ が、Epic 進捗追跡テーブルの更新手続きは agentdev-epic-tracker が所有する。

      ## 適用範囲

      - 対象: Epic と Wave モデル（Epic Issue を実行順序 SSoT とするオーケストレーション、子 Issue 実行状態ライフサイクル、Wave 状態の Issue 状態導出、execution_unit 定義、単一書き手排他制御、別 Epic 分割許容、コンフリクト解消モデル）
      - 対象外: Wave 構成の生成（case-open 実行契約 REQ）、Epic 進捗追跡テーブル更新手続き（agentdev-epic-tracker、SPEC）、execution_unit 並列モデルの内部パラメータとコンフリクト解消レベルの詳細手順（SPEC）、処理単位の一級概念定義（Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」、REQ-011）
  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: docs/requirements/REQ-003.md
    source_items: [AG-002, AG-003, AG-004]
    content: |
      REQ-003 の要件テーブルへ対論型レビュー判定モデルの強化として次の行を追加する（REQ-003-044 以降の連番で採番）。

      | REQ-003-044 | 対論型レビューは評価開始時にレビュー論点を設定し、各レビュー論点について対象を妥当と判断するために成立すべき条件を、対象、目的、制約、正規成果物、技術領域、想定される破綻に応じて動的に導出すること（固定チェックリストではない）。レビュー論点と成立条件を同一概念として扱わないこと。レビュー中に新しい根拠または問題が発見された場合、レビュー論点および成立条件を追加、削除、修正できること |
      | REQ-003-045 | レビューアーは設定された成立条件が成立しない具体的な条件、根拠、矛盾、欠落、不成立な前提等を探索し反証を試みること。一定数の問題を発見することを目的とせず、十分な反証を試みても問題を確認できなかった場合、それを正常なレビュー結果として扱うこと |
      | REQ-003-046 | 指摘は、主張、根拠、前提、適用範囲、反証条件を意味的に区別して扱える未確定の主張として扱うこと。レビュイーは指摘を正しいものとして自動的に採用せず根拠、前提、対象理解、適用範囲、影響、方法論を反証でき、レビューアーはレビュイーの反証を再評価し自身の指摘を撤回、維持、限定、修正または部分的に採用できること |
      | REQ-003-047 | 各指摘について、採否によって対象の妥当性、要求充足、設計判断、採否または受け入れ判定が変わり得るか否かで重要性を判定すること。重要性と重大度を同一概念として扱わないこと。好み、表現改善、対象の妥当性に影響しない軽微な改善、対象範囲外の理想論、具体的影響を示せない抽象的懸念は、原則として重要指摘としないこと。重要性の有無についてもレビューアーとレビュイーの相互反証対象とすること |
      | REQ-003-048 | 指摘と本質的争点を別概念として扱い、一つ以上の重要指摘を相互反証するための意味単位へ整理したものを本質的争点とすること。複数のレビュー系統またはレビューアーが同じ問題を別々に指摘した場合、重複を統合して一つの本質的争点として扱えること。同一指摘の件数をその指摘の妥当性または重要性の強さとして扱わないこと |
      | REQ-003-049 | 未解決の重要指摘が存在しないことをレビュー完了の中心条件とし、固定された反復回数をレビューの収束条件としないこと。重要指摘は、指摘の採用と対象案への必要な修正の反映、反証の成立による撤回または棄却、適用範囲の限定と限定された範囲での結論確定、自律解決できない事項についてのユーザー判断、のいずれかによって解消できること。重要でない指摘だけが残っていることを理由として対論を継続せず、重要指摘が一件も発生しないことを正常なレビュー結果として許容すること |
      | REQ-003-050 | 重要指摘が解消され収束候補が形成された後、最終案とその成立根拠を再検証すること。収束後再検証では、各成立条件が引き続き成立していること、採用した指摘への対応によって別の成立条件が破壊されていないこと、新たな重要指摘が発生していないことを確認し、新たな重要指摘が確認された場合その争点について対論を再開すること |
      | REQ-003-051 | レビューアーは、対象を作成した側の自己評価、正当性の主張、未検証の前提または結論を、それ自体を理由として正しいものと扱わないこと。対象作成者が提示した設計理由、判断理由、前提等は必要に応じて参照できるが検証対象として扱うこと。レビューアーの判断独立性を確保するために別のモデルまたは別の物理エージェントを必須とせず、既存の初期2系統の独立レビューにおける初期指摘生成前の相互指摘非共有による独立性を維持すること |
      | REQ-003-052 | 関連する正規成果物および取得可能な根拠から自律解決できる限り、レビューアーとレビュイーの審議を継続すること。技術的に一意に決着できない優先判断、ユーザー固有の価値判断、両立不能な要求、新たな対象範囲判断、必要情報不足等、自律解決できない事項のみユーザー判断へ付議すること。単なる意見不一致を理由としてユーザーへ判断を返さず、ユーザー回答後はその判断の影響を受ける争点から審議を再開し必要な再検証を行うこと |
      | REQ-003-053 | 本質的な指摘事項が反証を経て維持、限定、または部分合意された場合、具体的な失敗事例だけで終わらせず、可能な範囲で根本原因または破綻機構、破られている前提または不変条件、欠陥類型、適用範囲、同種事例または隣接事例、適用外となる条件、レビュー上の解消条件を明らかにすること。一般化の根拠が不足する場合は推測で範囲を確定せず、一般化範囲不明または証拠不足として扱うこと |
      | REQ-003-054 | レビュー上の指摘事項の解消は、指摘事項の妥当性、根本原因、適用範囲等について審議上の決着が得られたことを意味し、コード修正、試験完了、品質ゲート通過を意味しないこと。本質的な指摘事項は、欠陥類型と適用範囲を合理的に特定できた、具体例固有の問題であり一般化不要である根拠を確認できた、一般化に必要な証拠不足を明示し未解決事項として残した、のいずれかまで確認すること。欠陥類型の適用範囲拡大は同一の本質的な指摘事項の更新として扱い、新規指摘事項として再起票しないこと（REQ-014-007 と整合） |
  - id: ACT-REQ-009
    artifact: req
    operation: append
    target: docs/requirements/REQ-014.md
    source_items: [AG-004]
    content: |
      REQ-014 の要件テーブルへ呼出元との責務分界として次の行を追加する（REQ-014-015 として採番）。

      | REQ-014-015 | 成立条件の導出、指摘の重要性判定、本質的争点への整理、収束判定のロジックは adversarial-review 側（REQ-003、adversarial-review SPEC）が単一所有し、呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run、case-auto）へ重複定義しないこと。呼出元は対論型レビューの結果を受領し、既存契約に従って採用済み指摘の反映、未解決事項の伝播、後続処理判断を行うこと |
  - id: ACT-REQ-010
    artifact: req
    operation: append
    target: docs/requirements/REQ-007.md
    source_items: [AG-006]
    content: |
      REQ-007 の要件テーブルへ欠陥類型単位の検証証拠として次の行を追加する（REQ-007-005 として採番）。

      | REQ-007-005 | 本質的な指摘事項を欠陥類型単位で修正した場合、対象となった本質的な指摘事項、特定した根本原因または欠陥類型、採用した修正範囲、実施した欠陥類型単位の検証、検証結果を、既存の PR 本文または品質ゲート完了報告から確認できること。新しい正規成果物種別を追加しないこと |
  - id: ACT-REQ-011
    artifact: req
    operation: append
    target: new:case-run-execution
    source_items: [AG-005]
    content: |
      分割で作成する case-run 実行契約 REQ の要件テーブルへ、欠陥類型を修正単位とする契約として次の6行を追加する（分割で移動した行の再採番後の連番で採番）。

      | case-run 実行契約（新規行1） | case-run は、実行中に本質的な指摘事項が確認された場合、報告された個別事例のみを修正単位とせず、利用可能な証拠から根本原因、欠陥類型、同じ原因の影響を受ける範囲、必要な修正範囲、必要な追加検証範囲を整理してから修正すること。この原則は adversarial-review 由来の指摘事項だけでなく、実装中のコードレビュー、QA、品質ゲート、試験等で確認された本質的な指摘事項にも適用すること |
      | case-run 実行契約（新規行2） | 一般化した修正範囲が既確定 Issue の対象範囲内の内部実装変更だけで完結する場合は自律的に修正してよいこと。Issue の対象範囲、完了条件、受け入れ条件、REQ、Decision、SPEC、必須品質条件の変更が必要になる場合は現行 Issue 内で勝手に変更せず blocked とすること |
      | case-run 実行契約（新規行3） | 本質的な指摘事項を修正した場合、元の再現事例だけの再検証をもって完了とせず、欠陥類型に応じて合理的に必要な検証対象（元の再現事例、同種事例、境界条件、対称となる事例、適用外であるべき事例、既存の回帰試験等の候補）を選定すること。固定的な全項目必須チェックリストにはしないこと |
      | case-run 実行契約（新規行4） | 欠陥類型単位の検証中に新たな失敗事例を発見した場合、直ちに独立した新規指摘事項として扱わないこと。既存の指摘事項と根本原因が同一の場合は既存の欠陥類型の適用範囲不足として修正範囲を再設定し修正と欠陥類型単位の検証を再実行し、根本原因が異なる場合のみ新しい指摘事項として扱うこと |
      | case-run 実行契約（新規行5） | 本質的な指摘事項は、PR の Findings 等への記録だけを理由として未解消のまま completed-pr にしないこと。Issue の対象範囲内で修正可能な場合は修正および欠陥類型単位の検証が成功した後にのみ completed-pr を許可すること。非本質的な指摘事項は既存契約に従い Findings 記録による継続を許可すること |
      | case-run 実行契約（新規行6） | 本質的な指摘事項について、利用可能なリポジトリ情報、実装差分、試験結果、関連する Issue / REQ / Decision / SPEC / docs を十分に調査しても安全な修正範囲を正当化できる根本原因または欠陥類型を確立できない場合、局所的な推測修正によって completed-pr へ進まず failed とすること。十分な調査を固定回数や固定時間で定義せず、本変更のために新しい結果状態を追加しないこと |
  - id: ACT-REQ-012
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    source_items: [AG-007]
    content: |
      REQ-004 の要件テーブルへ信頼境界を扱う対象の非機能受け入れ条件の前倒しとして次の4行を追加する（REQ-004-050 以降の連番で採番）。

      | REQ-004-050 | 要件の適用対象を、信頼できない入力の構文解析、検証、解釈（パーサ、レクサ、デシリアライザ等）、権限、配布、trust 境界の enforcement、外部ネットワーク経路、アーカイブ展開等の外部攻撃面を持つ処理のいずれかに該当するか否かで判定し、判定基準を文書上で機械的に判定できる形で定義すること。適用対象とした場合はその前提を要件docに記録すること（適用外の場合の記録は強制しない） |
      | REQ-004-051 | 適用対象の要件docにおいて、処理量の上限（時間計算量、処理ステップ数、または走査量の上限）、出力の上限（出力件数、証跡量の上限）、不正または曖昧な入力時の失敗挙動（fail-open か fail-closed か）の3項目を受け入れ条件として確定するまで壁打ちを継続すること |
      | REQ-004-052 | 3項目への回答は検証可能な形式（上限は数値または計算量の形、失敗挙動は fail-open / fail-closed のいずれか）を要求し、形式不定の回答や形式的な記述を許容しないこと。数値上限の記述は既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドの規範に従うこと |
      | REQ-004-053 | 非機能受け入れ条件の確認は work_type に関わらず常に実行される要件展開工程の一部として実行し、adversarial-review の発動条件に依存しないこと。adversarial-review の動的レビュー戦略における検出観点は第二の網として助言に留め、新規の統制ゲートを構成しないこと。確定した受け入れ条件は既存の投影契約（SPLIT 後は case-open 実行契約 REQ の該当行〔分割元 REQ-006-004〕、REQ-017-002）により下流へ運搬し、draft-data スキーマ、要件docテンプレート、QG、正規成果物種別を本件のために変更しないこと |
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: DEC-015
    source_items: [AG-008]
    content: |
      新規 Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」を作成する（req-save 採番結果: DEC-015）。

      ## 決定

      1. ADF は決定論的な実行中核として、実行状態の遷移、処理単位間の依存関係判定、実行可能な処理単位の判定、不正な状態遷移の拒否、再開位置の再構成、並列分岐後の合流可否判定、処理結果の集約、実行中に守るべき不変条件の検査を所有する。
      2. 実行基盤（harness）側の責務は DEC-001 決定2 が所有し、本 Decision は個別項目を再列挙しない。RU-0003 由来で DEC-001 決定2 に未列挙だった4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）は ACT-DEC-002 により DEC-001 決定2 へ追加して所有を一致させる。
      3. 並列処理について、並列可否、依存関係、合流条件等の判定は ADF が所有し、実際の並列起動機構は実行基盤へ委譲する。REQ-011-018 の「並列実行」は並列起動機構を指す。
      4. 決定論的処理は、Command / Workflow Skill / Capability Skill の3層構造（DEC-010）を維持したまま、既存の script 種別（決定的でテスト可能な実行ロジック）と Capability Skill の公開能力として接続し、新たな層や成果物種別を導入しない。
      5. STEP は workflow 層の再開単位（DEC-011）であり、処理単位は orchestration 層の再開単位である。両者は階層関係にあり、処理単位の再開は workflow 層の STEP 再開に矛盾しない。
      6. 不正な状態遷移の拒否と実行中の不変条件の検査は、DEC-001 決定3 の既存ハード統制点（状態破壊、二重実行・競合更新）の適用として整理し、新規のハード統制点を追加しない。
      7. 決定論的な実行中核による状態機械制御は、複数段階からなる、中断・再開を必要とする、複数の処理単位を持つ、並列分岐・合流を持つ、処理単位間の依存関係を持つ、外部処理の完了待ちを持つ、一部成功・一部失敗を扱う、のいずれかを必要とする処理に限定して適用する。

      ## コンテキスト

      Command から Workflow Skill への処理手順移管、STEP 単位の再開、Capability Skill の分離、Case 実行の並列化は導入済みだが、LLM による意味判断と機械的・決定論的に実行可能な処理の境界、状態遷移・依存関係判定・並列分岐・合流・再開位置復元の所有者、全公開処理に共通する実行状態・実行結果、中断・再開用のローカル状態と正規状態の関係、並列実行における処理単位と worktree の責務、学習を構造改善へ昇華する仕組みが十分に統一されていない（RU-0003 背景）。本 Decision はこの横断的境界を単一の正規所有者として確定し、REQ-002/005/010/011 および分割後の case 系 REQ、workflow-contracts / input-resolution-and-durable-state / workflow-skill-model / harness-separation-model / Case系 / learning系 SPEC へ分配する。

      ## 結果・影響

      - REQ-002: 判断と決定論的処理の分離、ローカル一時実行状態の分離を追記。
      - REQ-005: 共通実行契約、選択的状態機械適用、再開時正規状態優先を追記。
      - 分割後の case-auto 実行契約 REQ、Epic と Wave 実行モデル REQ: 処理単位、依存判定、並列、worktree 隔離を追記。
      - REQ-010: learning 構造改善先分類を追記。
      - REQ-011: ADF 側実行判断の所有を追記（REQ-011-017/018 は変更しない）。
      - 上記 SPEC 群の該当セクション更新。
      - DEC-001 決定1/2 とは矛盾しない（ADF 側判断リストは決定1の精製、harness 側は決定2 参照のため再列挙しない。DEC-001 決定2 の4項目追加は ACT-DEC-002 で実施する）。

      relates-to: DEC-001, DEC-010, DEC-011（置換・廃止しない）

      再評価条件: 決定論的実行中核の適用対象処理が公開処理の過半を占める場合、または状態機械の選択的適用基準の維持コストが判定コストを上回る場合。
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-001.md
    source_items: [AG-008]
    content: |
      DEC-001 決定2（ADF が所有しない領域の委譲リスト）へ、RU-0003 §3.2 由来の4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）を追加する。決定2 の委譲原則（具体的実現方法は harness、AI モデル、適用プロジェクトへ委譲する）の具体化であり、原則の変更ではない。既存項目の文言は変更しない。
  - id: ACT-REQ-013
    artifact: req
    operation: append
    target: docs/requirements/REQ-002.md
    source_items: [AG-008, AG-010]
    content: |
      REQ-002 の要件テーブルへ決定論的処理責務とローカル一時実行状態の分離として次の2行を追加する（REQ-002-035 以降の連番で採番。REQ-002 の現行最終行は REQ-002-034）。

      | REQ-002-035 | ADF は、意味解釈、要件分析、設計判断、分類、レビュー結果の採否等の判断を LLM 側の責務とし、状態遷移、依存関係評価、形式検査、結果集約等、入力と規則から一意に決定可能な処理を決定論的処理として分離すること。決定論的に処理できる事項を理由なく LLM の推論だけへ委ねず、決定論的処理は可能な限りテスト可能な script 等へ委譲すること（判断と機構の分界の所有は Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」を参照） |
      | REQ-002-036 | 中断・再開に必要なローカル一時実行状態は、Git 管理を要求せず、他端末との共有を要求せず、実行履歴としての恒久保存を要求せず、会話コンテキストだけを唯一の情報源とせず、保存場所の具体的なパスを要件として固定しないこと。正規成果物から再構成できる情報を別の正規状態として重複管理せず、正規成果物へまだ反映されていない中断・再開に必要な最小情報のみを保持し、正規成果物上で処理単位が終端状態になった後その処理単位のローカル状態保持を要求しないこと。`.agentdev/` の Git 管理対象ドメイン状態と Git 管理しないローカル一時実行状態を区別できること |
  - id: ACT-REQ-014
    artifact: req
    operation: append
    target: docs/requirements/REQ-005.md
    source_items: [AG-009, AG-010]
    content: |
      REQ-005 の要件テーブルへ共通実行契約と再開時正規状態優先として次の4行を追加する（REQ-005-025 以降の連番で採番）。

      | REQ-005-025 | 全公開処理は、処理の複雑さにかかわらず、実行状態、処理固有の結果、停止した場合の理由、再開可能か否かを共通して表現できる実行契約を持つこと。実行状態と処理固有の結果を別概念として扱い、処理自体は完了したが警告あり、と、処理が中断され結果未確定、を区別でき、既存処理が持つ複数次元の結果を共通実行状態へ押し潰さないこと |
      | REQ-005-026 | 状態機械による制御は、複数段階からなる、中断・再開を必要とする、複数の処理単位を持つ、並列分岐・合流を持つ、処理単位間の依存関係を持つ、外部処理の完了待ちを持つ、一部成功・一部失敗を扱う、のいずれかを必要とする処理に限定すること。単純な収集処理や読み取り専用診断へ一律に重い状態機械を導入しないこと |
      | REQ-005-027 | 再開時は、ローカル一時状態から再開対象を特定し、Issue / PR / Case ファイル等の正規状態を再取得して現在位置を再構成し、既に完了している処理を再実行せず未完了部分のみを続行すること。ローカル一時状態と正規状態が矛盾する場合は正規状態を優先し、安全に自動解消できない場合は停止すること |
      | REQ-005-028 | 既存処理は、停止したとき、中断状態から再開するとき、正常終了または異常終了するときに、共通実行契約に基づく状態を必要な範囲で報告すること。報告では、実行状態、停止理由、再開可否、処理固有結果を意味的に区別すること。状態確認だけを目的とする専用 Command は追加しないこと |
  - id: ACT-REQ-015
    artifact: req
    operation: append
    target: new:case-auto-execution
    source_items: [AG-011]
    content: |
      分割で作成する case-auto 実行契約 REQ の要件テーブルへ、処理単位と並列実行の判断所有として次の2行を追加する（分割で移動した行の再採番後の連番で採番）。

      | case-auto 実行契約（新規行1） | case-auto は処理単位を一級概念（安定した識別子、入力、出力、依存関係、所有対象、現在状態、完了条件、検証結果、必要な場合の worktree との対応の意味）として扱うこと（具体的な格納形式は SPEC） |
      | case-auto 実行契約（新規行2） | case-auto は依存関係上独立した処理単位を並列実行可能と判定し、実行可能な処理単位、並列可能性、合流条件、一部失敗時の全体状態遷移を ADF 側の判断として所有すること。実際に起動するエージェント数、起動 API、実行基盤固有の並列化手段は正規契約へ固定しないこと |
  - id: ACT-REQ-016
    artifact: req
    operation: append
    target: new:epic-wave-execution-model
    source_items: [AG-011]
    content: |
      分割で作成する Epic と Wave 実行モデル REQ の要件テーブルへ、worktree 隔離と並列合流の安全規則として次の1行を追加する（分割で移動した行の再採番後の連番で採番）。

      | Epic と Wave 実行モデル（新規行1） | Git 上の変更を伴う並列処理では、処理単位を worktree で隔離すること。依存関係上独立した処理単位は並列実行可能とすること。並列処理の一部が失敗・中断した場合、完了済み処理を未完了へ戻さず、全体の次状態を規則に従って判定し、必須処理単位が揃っていない状態で後続処理へ進まないこと |
  - id: ACT-REQ-017
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-012]
    content: |
      REQ-010 の要件テーブルへ learning 構造改善先分類として次の1行を追加する（REQ-010 の現行最終行の次の連番で採番）。

      | REQ-010（新規行） | learning pipeline は学びを保存するだけでなく、再発防止のために反映先（既存 REQ / Decision / SPEC への反映、Skill の改善、決定論的な検査・ガードレールへの移管、既存処理手順の改善、通常の Issue による修正、重複・陳腐化した知識の削除、現時点では反映不能なものの保留）を評価して分類すること。learning-promote がこれらを直接変更せず、learning-promote → backlog-review → RU → req-define の承認・要件化経路を維持し、構造改善先の分類結果を後続工程へ渡すこと |
  - id: ACT-REQ-018
    artifact: req
    operation: append
    target: docs/requirements/REQ-011.md
    source_items: [AG-013]
    content: |
      REQ-011 の要件テーブルへ ADF 側実行判断の所有として次の1行を追加する（REQ-011-019 として採番）。

      | REQ-011-019 | 状態遷移、処理単位間の依存関係評価、実行可能な処理単位の判定、不正な状態遷移の拒否、再開位置の再構成、並列分岐後の合流可否判定、処理結果の集約、実行中に守るべき不変条件の検査は ADF の規範所有対象とすること。REQ-011-018 の並列実行は並列起動機構を指し、並列の可否・依存・合流の判定は本行が所有すること。実際の起動機構は harness 責務（REQ-011-018）のまま変更しないこと |
  - id: ACT-REQ-019
    artifact: req
    operation: update
    target: docs/requirements/REQ-017.md
    source_items: [AG-001]
    content: |
      REQ-017-002 の本文中の「（REQ-006-004 維持）」注記を、SPLIT 後の参照（case-open 実行契約 REQ の該当行、分割元 REQ-006-004）へ更新する。REQ-017-002 の規範本文（投影契約そのもの）と他の要件行は変更しない。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-adversarial-review.md
    target_area: レビュー判定モデル（対象セクションは search-target-area で解決）
    source_items: [AG-002, AG-003]
    content: |
      adversarial-review SPEC の判定モデル関連セクションへ、レビュー論点→成立条件→反証→指摘→重要性判定→重要指摘→相互反証→本質的争点→解消→収束後再検証の判定モデルを追加・明確化する。
      追加内容: (1) レビュー論点と成立条件の別概念定義と成立条件の動的導出、(2) 指摘の5要素（主張、根拠、前提、適用範囲、反証条件）の区別、(3) 重要性の判定基準（採否が妥当性・要求充足・設計判断・採否・受け入れ判定を変え得るか）と重要指摘でないもの（好み、表現改善、軽微な改善、対象範囲外の理想論、抽象的懸念）、(4) 未解決の重要指摘ゼロを収束の中心条件とする定義と固定反復回数の禁止、(5) 収束後再検証の3確認事項、(6) 本質的な指摘事項の一般化（根本原因、欠陥類型、適用範囲等の明示）と一般化範囲不明の扱い、(7) レビュー上の解消と実装修正完了の分離。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-case-run-execution-adapter.md
    target_area: 修正単位・検証（対象セクションは search-target-area で解決）
    source_items: [AG-005]
    content: |
      case-run-execution-adapter SPEC へ、欠陥類型を修正単位とする契約を追加する。
      追加内容: (1) 本質的な指摘事項確認時の修正前整理（根本原因、欠陥類型、影響範囲、修正範囲、追加検証範囲）、(2) Issue 対象範囲内での自律修正と blocked 遷移の境界、(3) 欠陥類型単位の検証対象選定（固定チェックリストではない）、(4) 同一根本原因の新たな失敗事例の適用範囲不足としての再分類、(5) completed-pr 許可条件（修正と欠陥類型単位検証の成功後）、(6) 根本原因確立不能時の failed 遷移、(7) 既存4状態の維持。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/commands/case-run.md
    target_area: 結果状態と検証証拠（対象セクションは search-target-area で解決）
    source_items: [AG-005, AG-006]
    content: |
      case-run command SPEC へ、結果状態遷移と検証証拠の契約を追加する。
      追加内容: (1) 本質的な指摘事項が未解消の場合の completed-pr 禁止、(2) Issue/REQ/Decision/SPEC/必須品質条件変更が必要な場合の blocked、(3) 安全な修正範囲を確立できない場合の failed、(4) completed-pr 時の PR 本文または品質ゲート完了報告に残す5点の検証証拠（対象指摘事項、根本原因または欠陥類型、修正範囲、実施した検証、検証結果）。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/commands/req-define.md
    target_area: 要件展開工程（対象セクションは search-target-area で解決）
    source_items: [AG-007]
    content: |
      req-define command SPEC の要件展開工程へ、非機能受け入れ条件の条件付き確認を追加する。
      追加内容: (1) 適用対象トリガー3条件（信頼できない入力の構文解析・検証・解釈、権限・配布・trust 境界の enforcement、外部攻撃面）の判定、(2) 適用対象の場合の3確認事項（処理量上限、出力上限、失敗挙動 fail-open/fail-closed）への回答確定までの壁打ち継続、(3) 回答の検証可能形式の要求、(4) 適用前提の要件docへの記録（適用外の記録は強制しない）、(5) 確定回答の test strategy（TS-NNN）への直列化。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-req-analysis.md
    target_area: 分析観点（対象セクションは search-target-area で解決）
    source_items: [AG-007]
    content: |
      req-analysis SPEC の分析観点へ、信頼境界を扱う対象の非機能受け入れ条件観点を追加する。
      追加内容: (1) 適用対象トリガー3条件の判定基準、(2) 3確認事項（処理量上限、出力上限、失敗挙動）の導出観点、(3) 回答形式の検証可能性要求（数値・計算量・fail-open/fail-closed）、(4) 既存の test strategy 数値閾値ガイドおよび pass_criteria 記述ガイドへの参照。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-adversarial-review.md
    target_area: 動的レビュー戦略（対象セクションは search-target-area で解決）
    source_items: [AG-007]
    content: |
      adversarial-review SPEC の動的レビュー戦略へ、非機能受け入れ条件の検出観点（observable）を追加する。
      追加内容: 適用対象と判定できる要件docで、処理量上限、出力上限、失敗挙動のいずれかが受け入れ条件に存在しないことを指摘する観点。この観点は助言（finding）として機能し、新規の統制ゲートを構成しない。
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-contracts.md
    target_area: 共通実行契約（対象セクションは search-target-area で解決）
    source_items: [AG-008, AG-009]
    content: |
      workflow-contracts SPEC へ、共通実行状態・実行結果・状態遷移契約を追加・更新する。
      追加内容: (1) 全公開処理の共通実行契約（実行状態、処理固有の結果、停止理由、再開可否）、(2) 実行状態と処理固有結果の別概念化と多次元結果の保護、(3) ADF 所有の決定論的判断（状態遷移、依存判定、実行可能判定、不正遷移拒否、再開位置再構成、合流判定、結果集約、不変条件検査）と実行基盤への委譲境界、(4) 状態機械適用の選択基準（7条件のいずれかを必要とする処理に限定）。
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target: docs/specs/workflows/input-resolution-and-durable-state.md
    target_area: ローカル一時状態と再開（対象セクションは search-target-area で解決）
    source_items: [AG-008, AG-010]
    content: |
      input-resolution-and-durable-state SPEC へ、ローカル一時実行状態と再開時正規状態優先の契約を追加・更新する。
      追加内容: (1) ローカル一時実行状態の性質（Git 管理不要、他端末共有不要、恒久保存不要、会話コンテキスト非依存、正規状態との非重複、終端状態後の保持要求なし）、(2) `.agentdev/` ドメイン状態とローカル一時実行状態の区別、(3) 再開時の5順序（ローカル状態で対象特定→正規状態の再取得→現在位置の再構成→完了処理の再実行回避→未完了の継続）、(4) 矛盾時の正規状態優先と安全に自動解消できない場合の停止。
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-skill-model.md
    target_area: 決定論的処理との責務接続（対象セクションは search-target-area で解決）
    source_items: [AG-008]
    content: |
      workflow-skill-model SPEC へ、決定論的処理との責務接続を追加・更新する。
      追加内容: (1) Command（利用者向け入口、公開契約、Workflow Skill への委譲）、Workflow Skill（処理手順、分岐、停止条件、処理手順上の状態遷移）、Capability Skill（複数の処理手順で共通する判断基準・能力）、決定論的処理（規則に基づき一意に判定・変換できるテスト可能な処理）の責務分離、(2) Capability Skill が決定論的処理を公開能力として所有することの許容と処理順序の移管禁止、(3) 決定論的処理の既存 script 種別への接続。
  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target: docs/specs/foundations/harness-separation-model.md
    target_area: 並列判断と並列起動機構の境界（対象セクションは search-target-area で解決）
    source_items: [AG-008, AG-013]
    content: |
      harness-separation-model SPEC へ、並列判断と並列起動機構の境界を追加・更新する。
      追加内容: (1) 並列可否、依存関係、合流条件等の判定は ADF 所有、実際の並列起動機構は実行基盤所有という分界の明文化、(2) REQ-011-018 の「並列実行」は並列起動機構を指すことの明記、(3) エージェント数、起動 API、実行基盤固有の並列化手段を ADF の正規契約へ固定しないことの明記。
  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target: docs/specs/commands/case-auto.md
    target_area: 処理単位・依存・並列（対象セクションは search-target-area で解決）
    source_items: [AG-011]
    content: |
      case-auto command SPEC へ、処理単位の状態・依存・分岐合流・結果集約の契約を追加・更新する。
      追加内容: (1) 処理単位の一級概念化（安定した識別子、入力、出力、依存関係、所有対象、現在状態、完了条件、検証結果、worktree 対応）、(2) 依存関係上独立した処理単位の並列実行可能性、(3) 一部失敗時の全体状態遷移（完了済み処理を未完了へ戻さない、必須処理単位が揃わない場合の後続進行禁止）、(4) 処理単位の具体的保存形式は SPEC 側で確定。
  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-learning-pipeline.md
    target_area: 構造改善先分類（対象セクションは search-target-area で解決）
    source_items: [AG-012]
    content: |
      learning-pipeline SPEC へ、構造改善先分類の契約を追加・更新する。
      追加内容: (1) 学びの構造改善先評価候補（既存 REQ / Decision / SPEC への反映、Skill の改善、決定論的な検査・ガードレールへの移管、既存処理手順の改善、通常の Issue による修正、重複・陳腐化した知識の削除、反映不能なものの保留）、(2) learning-promote による直接変更の禁止、(3) learning-promote → backlog-review → RU → req-define 経路の維持と分類結果の後続工程への引き渡し。

conflict_resolutions:
  - id: CR-001
    conflict: REQ-006（112要件行、7関心混在）への RU-0001 と RU-0003 の双方からの追記により健全性メトリクス（行数 81+ で +2）がさらに悪化し、SPLIT 予兆が増大する。
    resolution: ユーザー判断 A1=(c) SPLIT 先行を採用。REQ-006 を関心単位の6 REQ へ分割（ACT-REQ-001〜007）した上で、RU-0001 分は case-run 実行契約 REQ、RU-0003 分は case-auto 実行契約 REQ と Epic と Wave 実行モデル REQ へ追記する。分割後の全 REQ が健全性閾値（81行）未満に収まる。
  - id: CR-002
    conflict: RU-0003 の新規 Decision 候補と DEC-001 決定2（ADF が所有しない領域）の意味空間が重複するリスク（harness 側リストの再列挙による意味の二重所有）。
    resolution: アーキテクチャ助言 B-2 を採用。新規 Decision の所有範囲を「ADF 側判断リスト＋判断/機構分界」に限定し、harness 側リストは DEC-001 決定2への参照に留める（再列挙しない）。対論型レビュー F-03 を反映し、DEC-001 決定2 に未列挙の4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）は ACT-DEC-002 で DEC-001 決定2 へ追加して所有主張と実リストを一致させる。ドラフト承認時の確認事項として明記。
  - id: CR-003
    conflict: REQ-011-018 の「並列実行…は ADF の規範所有対象外」という文言が、RU-0003 の ADF 所有する合流可否判定と字面衝突しうる。
    resolution: アーキテクチャ助言 B-4 を採用。REQ-011-018 は無修正とし、新規行（REQ-011-019）で「REQ-011-018 の並列実行は並列起動機構を指し、並列の可否・依存・合流の判定は本行が所有する」と明示して曖昧性を解消する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_req_docs: [REQ-006, REQ-030, REQ-031, REQ-032, REQ-033, REQ-034, REQ-035, REQ-017]
      action_to_doc:
        ACT-REQ-001: { doc: REQ-006, operation: update }
        ACT-REQ-002: { doc: REQ-030, operation: create }
        ACT-REQ-003: { doc: REQ-031, operation: create }
        ACT-REQ-004: { doc: REQ-032, operation: create }
        ACT-REQ-005: { doc: REQ-033, operation: create }
        ACT-REQ-006: { doc: REQ-034, operation: create }
        ACT-REQ-007: { doc: REQ-035, operation: create }
        ACT-REQ-019: { doc: REQ-017, operation: update }
      row_id_mapping: "REQ-006-001〜021 → REQ-030-001〜021、REQ-006-022〜038 → REQ-031-001〜017、REQ-006-039〜059 → REQ-032-001〜021、REQ-006-060〜064 → REQ-033-001〜005、REQ-006-065〜094 → REQ-034-001〜030、REQ-006-110 → REQ-034-031、REQ-006-112〜114 → REQ-034-032〜034、REQ-006-095〜104 → REQ-035-001〜010（REQ-006 残存: 105〜109・111）"
      ru_to_ops: RU-0001〜0004 の SPLIT 基盤構成（AG-001）
      case_open_input: "docs/requirements/REQ-006.md, REQ-030.md, REQ-031.md, REQ-032.md, REQ-033.md, REQ-034.md, REQ-035.md, REQ-017.md"
    note: REQ-006 SPLIT（ACT-REQ-001〜007）。6新REQ create（case-open / case-run / case-close / case-update / case-auto / epic-wave-execution-model）+ REQ-006 update。移動行の本文は docs/requirements/REQ-006.md の該当行を正とする。被参照更新として ACT-REQ-019（REQ-017-002 の分割後参照への注記更新）を含む。docs/specs/** 等の旧 REQ-006-XXX 行ID参照の漸次更新は本変更の対象外（REQ-006 分割記録の旧→新対応表を正とする）。
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-003
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      saved_req_docs: [REQ-003, REQ-014, REQ-007, REQ-031]
      action_to_doc:
        ACT-REQ-008: { doc: REQ-003, operation: append, rows: "REQ-003-044〜054" }
        ACT-REQ-009: { doc: REQ-014, operation: append, rows: "REQ-014-015" }
        ACT-REQ-010: { doc: REQ-007, operation: append, rows: "REQ-007-005" }
        ACT-REQ-011: { doc: REQ-031, operation: append, rows: "REQ-031-018〜023" }
      ru_to_ops: "RU-0002 §4.1-4.9 → ACT-REQ-008、RU-0002 §4.10 → ACT-REQ-009、RU-0001 §6.1-6.2 → ACT-REQ-008、RU-0001 §6.3-6.9 → ACT-REQ-011、RU-0001 §6.10 → ACT-REQ-010"
      case_open_input: "docs/requirements/REQ-003.md, REQ-014.md, REQ-007.md, REQ-031.md"
    note: レビューループ強化（ACT-REQ-008〜011、ACT-SPEC-001〜003）。REQ-003 append（判定モデル+一般化、11行）、REQ-014 append（1行）、REQ-007 append（1行）、分割後 case-run 実行契約 REQ append（6行）、adversarial-review / case-run-execution-adapter / case-run command の各 SPEC update。
  - ou_id: OU-003
    source_ru: RU-0004
    target_req: REQ-004
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result:
      status: saved
      saved_req_docs: [REQ-004]
      action_to_doc:
        ACT-REQ-012: { doc: REQ-004, operation: append, rows: "REQ-004-050〜053" }
      ru_to_ops: RU-0004 → ACT-REQ-012
      case_open_input: docs/requirements/REQ-004.md
    note: 非機能受け入れ条件の前倒し（ACT-REQ-012、ACT-SPEC-004〜006）。REQ-004 append（4行）、req-define command / req-analysis / adversarial-review（動的戦略検出観点）の各 SPEC update。REQ-003 追記行（OU-002）との用語整合（fail-closed、処理量上限、出力上限、失敗挙動）のため OU-002 完了後直列。
  - ou_id: OU-004
    source_ru: RU-0003
    target_req: REQ-005
    operation: append
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 4
    issue_policy: single
    result:
      status: saved
      saved_req_docs: [REQ-002, REQ-005, REQ-010, REQ-011, REQ-034, REQ-035]
      saved_decision_docs: [DEC-015, DEC-001]
      action_to_doc:
        ACT-DEC-001: { doc: DEC-015, operation: create }
        ACT-DEC-002: { doc: DEC-001, operation: update }
        ACT-REQ-013: { doc: REQ-002, operation: append, rows: "REQ-002-035〜036" }
        ACT-REQ-014: { doc: REQ-005, operation: append, rows: "REQ-005-025〜028" }
        ACT-REQ-015: { doc: REQ-034, operation: append, rows: "REQ-034-035〜036" }
        ACT-REQ-016: { doc: REQ-035, operation: append, rows: "REQ-035-011" }
        ACT-REQ-017: { doc: REQ-010, operation: append, rows: "REQ-010-061" }
        ACT-REQ-018: { doc: REQ-011, operation: append, rows: "REQ-011-019" }
      ru_to_ops: "RU-0003 §3.1/3.2/3.9 → ACT-DEC-001、RU-0003 §3.2（DEC-001 決定2 未列挙4項目）→ ACT-DEC-002、RU-0003 §3.5/3.6 → ACT-REQ-013/014、RU-0003 §3.7/3.8 → ACT-REQ-015/016、RU-0003 §3.10 → ACT-REQ-017、RU-0003 §3.2（B-4）→ ACT-REQ-018"
      case_open_input: "docs/requirements/REQ-002.md, REQ-005.md, REQ-010.md, REQ-011.md, REQ-034.md, REQ-035.md, docs/decisions/DEC-015.md"
    note: 決定論的実行中核（ACT-DEC-001/002、ACT-REQ-013〜018、ACT-SPEC-007〜012）。Decision create、REQ-002 append（2行）、REQ-005 append（4行）、分割後 case-auto 実行契約 REQ append（2行）と Epic と Wave 実行モデル REQ append（1行）、REQ-010 append（1行）、REQ-011 append（1行）、workflow-contracts / input-resolution-and-durable-state / workflow-skill-model / harness-separation-model / case-auto command / learning-pipeline の各 SPEC update。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save 完了後、docs/requirements/ 配下で分割元 REQ-006 と分割先6 REQ のファイルを確認する。(1) REQ-006 の要件テーブルに REQ-006-105〜109・111 のみが残存し 001〜104・110・112〜114 が存在しないこと、(2) 分割先6 REQ の要件行数がそれぞれ 21 / 17 / 21 / 5 / 34 / 10 行（±移動統合差分）であること、(3) 各分割先 REQ の要件行本文が移動元 REQ-006 の該当行と意味一致していること、(4) REQ-006 の本文内メタデータに分割元/分割先の記録があること、(5) docs/requirements/README.md の索引が新 REQ を含み REQ-006 の行数記載が更新されていること、(6) REQ-017-002 の注記が分割後参照（case-open 実行契約 REQ の該当行）へ更新されていること（ACT-REQ-019）。
    pass_criteria: |
      上記6点すべてが確認でき、frontmatter id とファイル名の一致、要件行 ID の新 REQ 番号への再採番が完了していること。
    on_failure: |
      fix-and-reverify。移動漏れ・再採番漏れは機械的な文書修正で解決可能なため、req-save または case-update で修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-003 追記行（REQ-003-044〜054）と adversarial-review SPEC の更新後、(1) レビュー論点と成立条件が別概念として定義されていること、(2) 指摘の5要素（主張、根拠、前提、適用範囲、反証条件）が区別されていること、(3) 本質的な指摘事項の一般化要素（根本原因、欠陥類型、適用範囲等）と一般化範囲不明の扱いが規定されていること、(4) レビュー上の解消と実装修正完了の分離が定義されていること、を文書確認する。
    pass_criteria: |
      4点すべてが REQ-003 要件行と adversarial-review SPEC の双方で一貫した定義として確認できること。
    on_failure: |
      fix-and-reverify。文書の記述不備は修正可能なため、修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-003 追記行と adversarial-review SPEC の更新後、(1) 重要性と重大度が別概念であること、(2) 未解決の重要指摘ゼロが収束の中心条件であり固定反復回数が収束条件でないこと、(3) 収束後再検証の3確認事項が規定されていること、(4) 判断独立性（自己評価の非採用、別モデル非必須、初期2系統の独立性維持）が規定されていること、(5) ユーザー判断への付議条件が自律解決できない事項に限定されていること、を文書確認する。
    pass_criteria: |
      5点すべてが確認でき、RU-0002 の受け入れ条件1〜22のうち文書検証可能な項目に対応する規定が存在すること。
    on_failure: |
      fix-and-reverify。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-014-015 と adversarial-review SPEC 更新後、(1) 成立条件導出・重要性判定・本質的争点への整理・収束判定のロジックが adversarial-review 側に単一所有されていること、(2) 呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run、case-auto）の SPEC・command 定義にこれらの判定ロジックの重複定義が存在しないこと（grep 検索で確認）、(3) REQ-003-054 の適用範囲拡大の取り扱いが REQ-014-007 と用語整合していること、を確認する。
    pass_criteria: |
      3点すべてが確認できること。重複定義の grep 検索（成立条件、重要性判定、収束判定の規範記述）で呼出元からの検出が0件であること。
    on_failure: |
      fix-and-reverify。重複定義が検出された場合は該当箇所を参照へ置き換えて再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      分割後 case-run 実行契約 REQ の追記行と case-run-execution-adapter / case-run command SPEC の更新後、(1) 修正前整理（根本原因、欠陥類型、影響範囲、修正範囲、追加検証範囲）が義務化されていること、(2) Issue 対象範囲内修正と blocked の境界が定義されていること、(3) 欠陥類型単位の検証対象選定が固定チェックリストでないこと、(4) 同一根本原因の新失敗事例の再分類規則があること、(5) completed-pr 許可条件と failed 遷移条件が定義されていること、(6) 新しい結果状態が追加されていないこと（4状態の維持）、を文書確認する。
    pass_criteria: |
      6点すべてが確認でき、RU-0001 の受け入れ条件5〜12に対応する規定が存在すること。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-006
    verification: |
      REQ-007-005 の追加後、PR 本文または品質ゲート完了報告から確認できる5点（対象指摘事項、根本原因または欠陥類型、修正範囲、実施した検証、検証結果）が要件行に規定されていること、新しい正規成果物種別が追加されていないことを文書確認する。
    pass_criteria: |
      2点が確認できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-007
    verification: |
      REQ-004 追記行（REQ-004-050〜053）と req-define / req-analysis / adversarial-review SPEC の更新後、(1) 適用対象トリガー3条件が文書上で機械的に判定できる形で定義されていること、(2) 3確認事項と検証可能形式の要求が規定されていること、(3) 主発動点が要件展開工程であり adversarial-review 発動条件に依存しないこと、(4) 検出観点が助言であり新規統制ゲートでないこと、(5) draft-data スキーマ・要件docテンプレート・QG・正規成果物種別に差分がないこと（git diff で確認）、を確認する。
    pass_criteria: |
      5点すべてが確認できること。RU-0004 の受け入れ条件1〜12のうち文書検証可能な項目に対応する規定が存在すること。
    on_failure: |
      fix-and-reverify。スキーマ・テンプレート・QG への意図しない差分は scope クリープのため戻す。
  - id: TS-008
    target_item: AG-008
    verification: |
      Decision 作成後および DEC-001 更新後、(1) ADF 側判断リスト（8項目）と判断/機構分界が決定本文に規定されていること、(2) harness 側リストの再列挙が存在せず DEC-001 決定2への参照となっていること、(3) relates-to に DEC-001/010/011 があり supersede していないこと、(4) 再評価条件が記載されていること、(5) DEC-001/010/011 との意味の二重所有が生じていないこと（決定1/2/3との対応を文書確認）、(6) DEC-001 決定2 に4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）が追加されていること（ACT-DEC-002）、を確認する。
    pass_criteria: |
      6点すべてが確認できること。
    on_failure: |
      fix-and-reverify。Decision 本文の修正で解決する。
  - id: TS-009
    target_item: AG-009
    verification: |
      REQ-005 追記行（REQ-005-025〜028）と workflow-contracts SPEC の更新後、(1) 共通実行契約の4要素が規定されていること、(2) 実行状態と処理固有結果の別概念化が規定されていること、(3) 状態機械適用の選択基準（7条件）が規定されていること、(4) 停止・再開・完了時の報告要素の意味的区別が規定されていること、(5) 状態確認専用 Command が追加されていないこと、を文書確認する。
    pass_criteria: |
      5点すべてが確認できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-010
    target_item: AG-010
    verification: |
      REQ-002-036、REQ-005-027、input-resolution-and-durable-state SPEC の更新後、(1) ローカル一時実行状態の性質（Git 管理不要、共有不要、恒久保存不要、会話コンテキスト非依存、正規状態との非重複、終端状態後の保持要求なし）が規定されていること、(2) 再開時の5順序と矛盾時の正規状態優先が規定されていること、(3) `.agentdev/` ドメイン状態との区別が規定されていること、を文書確認する。
    pass_criteria: |
      3点すべてが確認できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-011
    target_item: AG-011
    verification: |
      分割後 case-auto 実行契約 REQ・Epic と Wave 実行モデル REQ の追記行と case-auto / harness-separation-model SPEC の更新後、(1) 処理単位の9意味要素が規定されていること、(2) worktree 隔離と並列実行可能性が規定されていること、(3) 一部失敗時の全体状態遷移（完了済みを未完了へ戻さない、必須処理単位が揃わない場合の後続進行禁止）が規定されていること、(4) 起動 API・エージェント数の正規契約への固定禁止が規定されていること、を文書確認する。
    pass_criteria: |
      4点すべてが確認できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-012
    target_item: AG-012
    verification: |
      REQ-010 追記行と learning-pipeline SPEC の更新後、(1) 構造改善先評価候補（7分類）が規定されていること、(2) learning-promote による直接変更の禁止が規定されていること、(3) 既存の承認・要件化経路（learning-promote → backlog-review → RU → req-define）の維持が規定されていること、を文書確認する。
    pass_criteria: |
      3点すべてが確認できること。
    on_failure: |
      fix-and-reverify。
  - id: TS-013
    target_item: AG-013
    verification: |
      REQ-011-019 の追加後、(1) ADF 側実行判断（8項目）の所有が規定されていること、(2) REQ-011-018 の並列実行が起動機構を指すことの明示があること、(3) REQ-011-017/018 の本文が変更されていないこと（git diff で確認）、を確認する。
    pass_criteria: |
      3点すべてが確認できること。
    on_failure: |
      fix-and-reverify。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001
    disposition: covered
    reason_code: fully_applied
    reason: |
      RU-0001 の要件化の方向（§6.1〜6.10）は AG-002（§6.1-6.2 → REQ-003 append、ACT-REQ-008）、AG-005（§6.3-6.9 → 分割後 case-run 実行契約 REQ append、ACT-REQ-011）、AG-006（§6.10 → REQ-007 append、ACT-REQ-010）へ全て反映した。SPEC アンカー（adversarial-review、case-run-execution-adapter、case-run command）は ACT-SPEC-001〜003 で対応する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 6. 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: fully_applied
    reason: |
      RU-0002 の要件（§4.1〜4.9 → AG-002/003、REQ-003 append、ACT-REQ-008）、（§4.10 → AG-004、REQ-014 append、ACT-REQ-009）へ全て反映した。SPEC アンカー（adversarial-review SPEC）は ACT-SPEC-001 で対応する（SKILL.md・protocol は src 側配布物のため実装工程の責務）。対象外（§6）の維持事項（3論理役割、初期2系統、QG・HITL非代替、原則実行）は変更していない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 4. 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003
    disposition: covered
    reason_code: fully_applied
    reason: |
      RU-0003 の要件（§3.1〜3.12）は AG-008〜013 へ反映し、Decision create（ACT-DEC-001）と DEC-001 決定2 の4項目追加（ACT-DEC-002）、REQ-002/005/010/011 append（ACT-REQ-013/014/017/018）、分割後 case-auto・Epic/Wave REQ append（ACT-REQ-015/016）、SPEC 6件（ACT-SPEC-007〜012）へ分配した。§7 の反映方針（既存責務所有者への分配、DEC-010/011 を置換しない）どおり。REQ-006 への直接追記は SPLIT 後の構成（case-auto 実行契約 REQ と Epic と Wave 実行モデル REQ）へ再マップした。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 7. 成果物への反映方針
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004
    disposition: covered
    reason_code: fully_applied
    reason: |
      RU-0004 の要件化の方向（§6.1〜6.6）は AG-007 へ反映し、REQ-004 append（ACT-REQ-012）、req-define / req-analysis / adversarial-review SPEC（ACT-SPEC-004〜006）へ対応した。対象外（§3）の維持事項（draft-data スキーマ、テンプレート、QG、投影契約の不変更）は test_strategy TS-007 で検証する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 6. 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    4 Wave 構成（OU-001〜004）。Wave 1 = OU-001（REQ-006 SPLIT、単一 Issue、機械的な行移動と新規 REQ 作成）。Wave 2 = OU-002（レビューループ強化、REQ-003/014/007 append + 分割後 case-run REQ append + SPEC 3件）。Wave 3 = OU-003（非機能前倒し、REQ-004 append + SPEC 3件、REQ-003 追記行との用語整合のため Wave 2 完了後）。Wave 4 = OU-004（決定論的実行中核、Decision create + REQ append 6件 + SPEC 6件）。依存関係は OU-002 → OU-001、OU-003 → OU-002、OU-004 → OU-001+OU-002 の直列で、REQ-006 系ファイル（分割 REQ を含む）への追記競合を回避する。
  wave_hints:
    - "Wave 1: OU-001 (req006-split)"
    - "Wave 2: OU-002 (review-loop-hardening) - depends Wave 1"
    - "Wave 3: OU-003 (nonfunctional-acceptance-early) - depends Wave 2"
    - "Wave 4: OU-004 (deterministic-execution-core) - depends Wave 1, 2"
```

# summary

REQ-006 の分割（SPLIT 先行）と RU 4件の適用を1つの要件定義としてまとめたドラフト。分割は case-open / case-run / case-close / case-update / case-auto / Epic-Wave の6新 REQ への行移動と REQ-006 の統括・capture REQ への縮約からなる。RU-0001/0002（レビューループ強化）、RU-0004（非機能前倒し）、RU-0003（決定論的実行中核、新規 Decision 含む）は分割後の REQ 構成へ再マップして適用する。アーキテクチャ助言（Oracle）の確定事項・推奨（B-1〜B-6）を反映済み。

対論型レビュー（経路A）を実施し、本質的指摘3件をドラフトへ反映済み: F-01（REQ-002 採番衝突 → REQ-002-035/036 へ修正）、F-02（SPLIT 再採番に伴う被参照整合 → REQ-004-053 の分割後参照化、ACT-REQ-019〔REQ-017-002 注記更新〕追加、被参照移行ポリシーの明文化）、F-03（DEC-001 決定2 参照の事実不一致 → ACT-DEC-002〔DEC-001 決定2 へ4項目追加〕追加と Decision 決定2 の再列挙除去）。非本質的指摘のうち N-02（case-auto 行数 34行へ訂正）と N-05（OU-003 の依存根拠・RD-002 の記載修正）は反映済み。N-01（REQ-003 追記行と既存 REQ-003-030〜043 の部分重複句。行全体は新規判断内容を含み単なる言い換えではない）、N-03（case-run 新規行の主語解釈。既存慣行と ACT-SPEC-002 で解消）、N-04（ADF 8項目リストの Decision/REQ/SPEC 3箇所列挙。階層構造上必然で TS-008/013 が同期を検証）、N-06（append 時の目的/適用範囲セクション非更新。既存慣行と一致）は受け入れ判定を阻害しないため本ドラフトでは未適用とする。

ドラフト承認時の確認事項（C-1）: 新規 Decision の harness 側リストは DEC-001 決定2 を参照し、DEC-001 決定2 に未列挙の4項目（セッションの起動・終了、バックグラウンド実行の具体的手段、プロセス監視、生存確認）を ACT-DEC-002 で DEC-001 決定2 へ追加する方針の承認（CR-002 参照）。
