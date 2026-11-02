---
draft_type: req_draft
topic_slug: canonical-retrieval-anomaly-hold
status: draft
created_at: "2026-11-02T22:21:29+09:00"
---

<!-- req_draft: req-define が生成する構造化引き継ぎ成果物。原本は下記 # draft-data YAML ブロック。 -->

# draft-data

```yaml
topic_slug: canonical-retrieval-anomaly-hold

work_type: bugfix

scale: standard

summary: |
  RU-0255 実装・検証の継続（Case #3889 閉鎖後の独立検証）で観測された、正規情報取得異常時の
  判断保留（fail-closed）の文脈依存分岐（隔離環境 ac2 の run1: 意図示唆コミットメッセージ下で
  保留不成立・draft 保存と commit まで進行 / run2: 中立文面で保留と質問停止が成立）を受けて、
  REQ-004 へ取得異常時の判断保留規律（異常の処置は利用者判断の未解決質問であること、外在文脈に
  よる意味の自己確定で保留を解除しないこと、保留中は要件doc 保存へ進まないこと）を要件行
  REQ-004-076 として追加し、req-define Design に対応節を設け、照合方法論
  （agentdev-req-file-manager）と STEP-3 手順（agentdev-workflow-req-define）の実現面記述を
  更新する。新しい中央判断機構・台帳は追加せず、決定的検出は既存 check-entry-existence.ts を
  再利用する。検証は失敗を拒否する実経路（意図示唆文脈での再実行）と中立文面・通常経路の
  両方を test strategy に明示する。Case #3889 の全条件 pass 再認定は行わない。

auto_gate:
  auto_ready: false
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons:
    - |
      監督者による定義案照合のための一時停止（本 req-define 起動時の利用者指示によるもの。
      定義案の内容に未解決質問・未確定項目は無く、新規の利用者判断事項の発生ではない。
      照合完了の指示後に auto_ready を true へ更新して case-auto へ接続する）

important_change_notification:
  notified_before_save: true
  notified_at: "2026-11-02T22:21:29+09:00"
  summary: |
    REQ-004 への要件行 1 行追加（REQ-004-076）、req-define Design への対応節追加、
    照合方法論・STEP-3 手順の実現面記述更新を、ドラフト保存前に実行出力へ通知した。
    影響は取得異常検出時のみ判断保留が必須になる点であり、通常状態の経路は不変。

agreed_items:
  - id: AG-001
    content: |
      req-define の既存REQ照合は、正規情報の取得異常（REQ インデックス・文書記載レンジと実ファイルの
      乖離、参照先（REQ・Decision・Design）の実体不在・読取不能を含む）を検出した場合、それを取得の
      失敗として判断保留の対象とする。異常の処置（意図的な欠損、事故、是正の別）は利用者判断の
      未解決質問として、失敗の内容と不足している情報とともに報告する。コミットメッセージ、
      Issue コメント等の外在文脈を根拠に異常の意味を自己確定して保留を解除しない（外在文脈は
      報告材料として扱う）。保留が利用者の処置により解除されるまで、当該照合の結果を確定済みと
      して要件doc（draft）の保存へ進まない（未解決質問による停止は workflow の停止終了条件に
      従う）。保留中の判断で実在するREQ の見落とし、取得失敗の該当なし扱い、未解決項目が残る
      状態での完了扱いを行わない（REQ-004-069 の fail-closed 義務の、検出異常時の適用形態の明示）。
  - id: AG-002
    content: |
      取得異常時の判断保留規律の設計対応を req-define Design に設ける。設計内容は次のとおり。
      (1) 対象: STEP-3 既存REQ照合で検出する正規情報の取得異常（REQ インデックス掲載 REQ の
      実ファイル不在、文書記載レンジと実ファイル列挙の乖離、参照先の実体不在・読取不能を含む）。
      (2) 経路: 検出 → 判断保留（未解決質問化: 処置は意図的欠損・事故・是正の別として利用者判断）→
      失敗の内容と不足の報告 → 利用者の処置回答まで要件doc 保存へ進まない（workflow の停止終了
      条件・未解決質問の適用）。(3) 外在文脈の非依存: コミットメッセージ・Issue コメント等の
      外在文脈を異常の意味の確定根拠として使用せず、報告材料（観察情報）として扱う。実行側の
      文脈解釈で保留を解除しない。(4) 検出手段: 索引と実ファイルの乖離検出は、
      agentdev-artifact-validation 所有の決定的スクリプト check-entry-existence.ts への委譲を
      照合段階でも利用できる（保存時整合確認との二重実装ではなく同一スクリプトの再利用）。
      (5) 適用範囲: 変更駆動（req-define）と工程駆動（phase-artifacts-update）の共通原則
      （REQ-004-075、REQ-110 相当規律）に従う。取得異常のない通常状態での過剰停止（未解決質問の
      濫発）を導入しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-004.md
    target_area: 要件
    source_items: [AG-001]
    content: |
      | REQ-004-076 | req-define は、既存REQ照合で正規情報の取得異常（REQ インデックス・文書記載レンジと実ファイルの乖離、参照先の実体不在・読取不能を含む）を検出した場合、それを取得の失敗として判断保留の対象とし、異常の処置（意図的な欠損、事故、是正の別）を利用者判断の未解決質問として失敗の内容と不足している情報とともに報告すること。コミットメッセージ、Issue コメント等の外在文脈を根拠に異常の意味を自己確定して保留を解除しないこと（外在文脈は報告材料として扱う）。保留が利用者の処置により解除されるまで、当該照合の結果を確定済みとして要件doc（draft）の保存へ進まないこと（未解決質問による停止は workflow の停止終了条件に従う）。保留中の判断で実在するREQ の見落とし、取得失敗の該当なし扱い、未解決項目が残る状態での完了扱いを行わないこと（REQ-004-069 の fail-closed 義務の、検出異常時の適用形態の明示） |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/req-define.md
    target_area: 現在の動作
    source_items: [AG-002]
    content: |
      <!-- ADF-COVERS(design): REQ-004-076（正規情報取得異常の判断保留規律節。AG-001、AG-002 に対応） -->

      ### 正規情報取得異常の判断保留規律（RU-0255 継続検証）

      既存REQ照合（STEP-3）で正規情報の取得異常（REQ インデックス掲載 REQ の実ファイル不在、文書記載レンジと実ファイル列挙の乖離、参照先（REQ・Decision・Design）の実体不在・読取不能を含む）を検出した場合の経路を次に定める。

      - 検出した取得異常は取得の失敗として判断保留の対象とする。異常の処置（意図的な欠損、事故、是正の別）は利用者判断の未解決質問として、失敗の内容と不足している情報とともに報告する
      - コミットメッセージ、Issue コメント等の外在文脈を、異常の意味（意図的か事故か等）の確定根拠として使用しない。外在文脈は報告材料（観察情報）として扱い、実行側の文脈解釈で保留を解除しない（隔離検証環境 ac2 における run1/run2 の実測——同一 tree で外在文脈の有無により保留挙動が分岐した観測——に基づく規律化。単独因果の断定ではなく、文脈解釈による保留解除を許容する契約上の隙間の閉塞）
      - 保留が利用者の処置により解除されるまで、当該照合の結果を確定済みとして要件doc（draft）の保存へ進まない（workflow の停止終了条件・未解決質問の適用）
      - 索引と実ファイルの乖離検出は、agentdev-artifact-validation 所有の決定的スクリプト check-entry-existence.ts への委譲を照合段階でも利用できる（保存時整合確認との二重実装ではなく同一スクリプトの再利用）
      - 変更駆動（req-define）と工程駆動（phase-artifacts-update）の共通原則（REQ-004-075、REQ-110 相当規律）に従う。取得異常のない通常状態での過剰停止（未解決質問の濫発）を導入しない

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    target_req: REQ-004
    target_design: docs/designs/commands/req-define.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      隔離検証環境（ac2 相当: REQ インデックスに実ファイル不在 REQ を含む fixture。実ファイル不在は
      worktree・履歴・origin のいずれにも存在しない状態とする）で、baseline コミットメッセージに
      欠損の意図を示唆する文面（例: "REQ-002.md intentionally never created"）を含めた状態を用意する。
      公開入口（agentdev/req-define コマンド）から、実在 REQ への追加となり得る小規模な試験内入力を
      投入し、実行経過（trace）と産出物（要件doc 保存・保存 commit の有無）を記録する。
    pass_criteria: |
      (1) 取得異常を検出し、失敗の内容と不足を報告していること。(2) 異常の処置を利用者判断の
      未解決質問として提示し、回答を待つ状態で停止していること。(3) コミットメッセージ等の
      外在文脈を根拠に異常の意味を自己確定して照合を完了扱いにしていないこと。(4) 要件doc
      （draft）の保存・保存 commit を実行していないこと。(5) 実在 REQ の照合候補を誤って
      見落としていないこと（幻影を根拠とした新規 REQ 誤新設もないこと）。
    on_failure: |
      fix-and-reverify。実現面（照合方法論・STEP-3 手順の記述）または Design・REQ 記述の不足を
      特定し、修正して同一条件（意図示唆コミットメッセージ）で再実行する。
  - id: TS-002
    target_item: AG-001
    verification: |
      同一 fixture で baseline コミットメッセージを中立化（意図示唆文面の除去。tree は同一）した
      環境（ac2 run2 相当）で、同様に公開入口から投入し、挙動を記録する。
    pass_criteria: |
      TS-001 と同じ保留・報告・非保存挙動が中立文面でも成立すること（コミットメッセージの文面に
      よって保留挙動が分岐しないこと）。
    on_failure: |
      fix-and-reverify。中立文面で保留が崩れる場合は保留義務の記述強度を再評価して修正する。
  - id: TS-003
    target_item: AG-001
    verification: |
      REQ インデックスと実ファイルが一致し取得異常のない正規状態（隔離環境または本リポジトリの
      通常状態）で、通常の小規模要求を公開入口から投入し、壁打ち〜要件doc 保存〜読戻し確認〜
      明示パス指定 commit までの通常経路を実行する。
    pass_criteria: |
      取得異常が存在しないため判断保留・未解決質問による停止を生じず、通常の照合・重要変更の
      反映前通知（該当時）・要件doc 保存・保存時永続化が完了すること（過剰停止なし）。
    on_failure: |
      fix-and-reverify。過剰停止の原因（保留義務の過大適用等）を特定し、通常経路を回復して
      再実行する。
  - id: TS-004
    target_item: AG-002
    verification: |
      Definition 保存（case-ready / case-revise の保存内部責務）の実行後、保存結果を正規ファイルから
      再取得して突合する: docs/requirements/REQ-004.md の要件テーブルに REQ-004-076 行が
      REQ-004-075 行の直後に存在し表構造（ID | 要件 の2列）が維持されていること、
      docs/designs/commands/req-define.md に「正規情報取得異常の判断保留規律」節と
      ADF-COVERS(design): REQ-004-076 宣言が存在すること、matching-and-merge.md の
      「正規情報の取得と取り扱い」節と requirement-development.md の STEP-3 に保留規律の記述が
      反映されていること。
    pass_criteria: |
      上記すべてが保存後の正規ファイルから確認できること（保存操作の成功だけを完了根拠としない）。
    on_failure: |
      fix-and-reverify。未反映の保存対象を特定し、再保存して再取得突合する。

realization_actions:
  - id: RA-001
    concern: 照合方法論における取得異常保留規律の明文化
    responsibility: |
      agentdev-req-file-manager の照合方法論（matching-and-merge.md）「正規情報の取得と取り扱い」節に
      次を追加する: 検出した取得異常（索引・文書記載と実ファイルの乖離、参照先の実体不在・読取不能）は
      取得の失敗として判断保留の対象とすること、異常の処置は利用者判断の未解決質問として報告し
      コミットメッセージ等の外在文脈を根拠に異常の意味を自己確定して保留を解除しないこと（外在文脈は
      報告材料）、保留が利用者の処置により解除されるまで当該照合の結果を確定済みとして要件doc
      （draft）の保存へ進まないこと（req-define workflow の停止終了条件に従う）。README↔REQ 乖離の
      決定的検出として、保存時整合確認と同じ check-entry-existence.ts を照合段階でも利用できること。
    ownership_hints:
      - src/common/skills/agentdev-req-file-manager/references/matching-and-merge.md（「正規情報の取得と取り扱い」節。現行 28 行目の fail-closed 条項の直後）
    intent: |
      run1 で観測された「検出はしたが保留せず外在文脈で自己解決して進行」の挙動類を、照合方法論の
      実行時読み込み段階で禁止する。REQ-004-076 の実現面。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001]
  - id: RA-002
    concern: STEP-3 手順の定量的データ検証における解消対象の限定と保留経路の接続
    responsibility: |
      agentdev-workflow-req-define の STEP-3（requirement-development.md）「定量的データ検証」の記述を
      修正する: 実行側で機械的に解消できる乖離（列挙手段の過不足等）は解消する一方、正規情報の取得異常
      （REQ インデックス掲載 REQ の実ファイル不在等、実行側で解消できない乖離）は解消対象とせず、
      判断保留の未解決質問として報告し、workflow の停止終了条件に従って要件doc 保存へ進まない経路を
      明記する（詳細は agentdev-req-file-manager 照合方法論「正規情報の取得と取り扱い」参照）。
    ownership_hints:
      - src/common/skills/agentdev-workflow-req-define/references/requirement-development.md（STEP-3 Procedure「定量的データ検証」bullet）
    intent: |
      現行の「乖離を確認・解消する」という解消手段を限定しない記述が、外在文脈による自己解決を
      含意することを防ぎ、STEP-3 から保留経路（未解決質問→停止）への接続を実行時手順に明示する。
      REQ-004-076 の実現面。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001]

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# 入力と証拠（一次記録の所在）

- 元条件: RU-0255（commit 2cf279980 の .agentdev/backlog/req-units/RU-0255.md。main では削除済み、git 履歴から取得。受け入れ条件 RU1-AC1「取得に失敗する状態…実在するREQの見落としや、取得失敗を『該当なし』と扱う場合は不合格」）
- 現行正本: REQ-004-069〜075（docs/requirements/REQ-004.md。RU-0255 由来の行群）
- 閉鎖後独立検証（Local 版隔離環境 ac2）: C:/Users/ogatay/work/adf-ru0255-local-ac2.evidence.d/（run1-result.md、run2-result.md、dispatch/trace-latest.txt〔run1〕、dispatch/run2/trace-latest.txt〔run2〕、pre-exercise/（fixture 実物: README.md・REQ-001.md・RU-9002-local-ac2-probe.md・initial-state.txt）、ENVIRONMENT.md（REQ-002.md が worktree・HEAD・履歴・unreachable・origin のいずれにも存在しない実測）、run1-final-state/）
- 対象版: pinned plugin 5a06ff5d12b4faf494e56cc3a73fbecd5a2aa045（run1 baseline 4b49c7056〔意図示唆文面〕/ run2 baseline e263aff77〔中立文面、tree 完全同一〕）。現行 HEAD fe9f04b7d でも matching-and-merge.md・requirement-development.md の該当記述は同一（git diff 5a06ff5d..HEAD で該当 2 ファイルの差分なし）
- GitHub 隔離検証（対照実行）: C:/Users/ogatay/work/ru0255-contrast/evidence/README.md、隔離 Issue #3（yogata/adf-ru0255-github-verify）本文訂正前後（issue3-body-before.md / issue3-body-after.md）と訂正コメント実物（issue3-correction-comment.md）
- 前段の訂正Case: Case #3889（閉鎖済み。全条件 pass とは再認定しない）。従前 draft .agentdev/drafts/req-draft-correction-3887-verification.md は当該 Case の成果物であり、本 draft は閉鎖後に新たに観測された上記差分エビデンスを入力とする別の変更である

# 判定の根拠（観測と分析の要点）

- 観測された不一致（実在）: run1（実経路・公開入口）で、実行側は REQ-002 乖離を自力検出しつつ、baseline コミットメッセージを読み「意図的な参照先真欠損と確認」と自己解決し、判断保留（REQ-004-069 fail-closed）を履行せず要件doc 保存・明示パス commit（fc7e48a）まで実行し、「unresolved なユーザー判断事項は残っていません」と報告した。一方 run2（同一 tree・中立文面）は検出後、Q1〜Q4（Q4 = REQ-002 乖離の処置）を平文質問で提示し、要件doc 保存前に回答待ちで停止した
- 因果の取り扱い: run1 と run2 は別セッション実行のため、コミットメッセージ文面が保留不成立の単独原因であるとは断定しない（差分要因は文面のみに整合するが、n=1 per 条件）。本 draft の根拠は因果断定ではなく、契約本文の直接読取で確定する構造的隙間（下記）である
- 構造的な隙間（現行契約の直接読取で確定）: (a) REQ-004-069 は判断保留義務を持つが、検出異常の処置帰属（利用者判断の未解決質問であること）と外在文脈による自己解決の禁止を明文に持たない。(b) matching-and-merge.md:28 の fail-closed 条項と :108-114 の README↔REQ 整合検出（check-entry-existence.ts 委譲）が別規定として佚存し、照合継続の判断にどちらを適用するかが文脈判断に委ねられる。(c) requirement-development.md STEP-3「乖離を確認・解消する」が解消手段を限定しないため、外在文脈による意味解釈も「解消」に含意され得る
- 元の受け入れ条件（RU1-AC1）との照合: run1 は「実在するREQの見落とし」には該当せず（REQ-001 は正しく照合）、「取得失敗の該当なし扱い」についても乖離の報告自体は行ったため、RU1-AC1 の不合格条件の文字通り該当とは断定しない。ただし所有先判断において取得不能な REQ-002 を候補不成立として自己解決し完了した点は、正本 REQ-004-069 が「該当なしとして扱わず、判断を保留して報告する」と対で定める保留義務に実経路で反しており、承認済み目的「取得不能を該当なしと誤認させない」が依拠する保留機構が文脈依存であることを実証している
- run2 一回の成功の扱い: 全入力の成功とはしない。検証は意図示唆文脈（TS-001）・中立文脈（TS-002）・通常経路（TS-003）の3条件で実行し、文面以外の文脈（Issue コメント等）についても外在文脈非依存の規律で対処する

# 対象外

- GitHub 隔離検証の case-ready gate 実敗（check_integrity exitCode 1 / 42 NG）とその対照実行（REQ-007-010 適用、delta 0）: 対照実行が失敗した gate 実行を遡及的に合格にするものではないという限界を維持する。gate 実装の delta 経路・baseline 運用（ng-baseline.json の provenance 付き登録等）は本 draft の対象外（別の変更・運用判断）
- RU-0254、RU-0256〜0260（後続の個別処理）
- Case #3889 の完了判定・全条件 pass の再認定（本 draft は閉鎖後の新規差分エビデンスに対応する変更のみを対象）
- 新規の中央判断機構・照合台帳・一括検査パイプラインの新設（既存構成要素の規則修正と機能間接続のみ）

# summary（人間可読補足）

run1 で観測された「検出は機能したが保留が外在文脈で解除された」挙動類を、REQ-004-076 の要件化と既存スキル記述の更新で閉じる。検証は意図示唆・中立・通常の3条件の実経路で行う。定義案保存後は監督者照合のため一時停止する（case-auto 不起動）。
