---
draft_type: req_draft
topic_slug: phase-transition-and-adopted-handoff
status: draft
created_at: 2026-11-04T08:27:23+09:00
source_rus: [RU-0258]
pre_save_notification: 2026-11-04T08:27:23+09:00 既存REQへのAPPEND重要変更（本draftのartifact_actions参照）をドラフト保存前に実行出力へ提示済み
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: 'REQ-110・REQ-111 の既存要求と工程状態管理を再利用し、工程遷移の成立・現在工程の復元・採用事項と未決事項の引渡しに関する不足を、REQ-111 への 4 行追加（REQ-111-021〜024: 同一識別キー異内容の区別、読取失敗の確認不能区別、遷移記録と現在工程の照合、引渡しの区分維持）と実現面（phase-transition store の lookupRecord/applyRecord 意味論）の是正として増分定義する。AC1・AC5・AC6 は既存行（REQ-111-002/004/019/020、REQ-111-014/015/016、REQ-110-005/007/009/015/026/027）が完全に所有するため新行を作らず、公開操作経路での成立維持を検証対象とする。新しい受理機構・工程進捗台帳・自動完了認定は導入せず、検証は RU4-AC1〜AC6 の各シナリオと S3・S4 出典の検証範囲（遷移前後の正規状態、遷移記録、現在工程、採否・未決記録、実際の成果物変更、再開時の取得結果の照合）に基づく。REQ-104・REQ-108 の既存義務（REQ-108-006/012 を含む）は再定義しない。'

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-801
    content: 工程遷移の解決義務（後続0件は終端として架空の工程を作らず記録し、1件は一意に解決し、複数件は利用者選択を求め、複数前置工程の既知義務と未確認範囲を欠落させずに伝え、取消は現在工程を維持し、利用者の遷移判断なしに遷移を記録しない）は既存 REQ-111-002、REQ-111-004、REQ-111-019、REQ-111-020 が所有する。本 RU はこの領域に新しい要求行を追加せず、公開操作経路での成立維持を RU4-AC1 の検証対象とする。
  - id: AG-802
    content: '遷移記録の同一識別キーで遷移の意味内容（対象範囲・遷移元・遷移先）が一致する要求の再実行は、成立済み遷移の復元として一度だけ扱う。同一識別キーで対象範囲・遷移元・遷移先のいずれかが異なる要求は、既存の成立済み遷移として復元せず、成立済み遷移の記録を上書き・置換せず、不一致を報告して当該要求の記録を保存しない。REQ-111-021 として REQ-111 へ APPEND する（コード調査(a): applyRecord の既存記録判定が内容照合を行わない欠落の是正）。'
  - id: AG-803
    content: '遷移記録領域または既存記録の読取が技術的に失敗する場合は記録不在として扱わず、確認不能として報告し、確認不能な既存状態の上へ遷移記録を保存しない。記録領域自体の不存在のみを記録不在として扱う。REQ-111-022 として REQ-111 へ APPEND する（コード調査(b): lookupRecord の readdir 失敗の無条件 catch による不在誤認の是正）。'
  - id: AG-804
    content: 遷移後の現在工程の特定・再開では、遷移記録と現在工程の識別状態を照合し、矛盾を検出した場合は遷移記録に依存する操作を保留して矛盾を報告する。次工程の初回テーマ形成が未実施・失敗でも、また別セッション再開でも、成立済み遷移と既知義務を遷移記録から再取得する。REQ-111-023 として REQ-111 へ APPEND する（初回形成の未実施・失敗で遷移を取り消さない既存義務は REQ-111-005、再開時の対象特定は REQ-110-001 が所有し、遷移記録との突合による矛盾検出を増分として定義する）。
  - id: AG-805
    content: 工程遷移の引渡しは、採用済み事項・上流の制約・未決事項・参考候補を区分して引き渡し、遷移先の次工程で各区分を区別して再取得できる。前置工程が複数ある場合は各前置工程の区分を欠落なく統合する。参考候補を正式な採用済み要求へ変換せず、未決事項を自動解消せず、別取組・別版の情報を区分外へ混入させない。REQ-111-024 として REQ-111 へ APPEND する（前置複数の既知義務伝達は REQ-111-004、別取組への無条件引き継ぎ禁止は REQ-110-001、未決の後継引継ぎは REQ-110-004、参考候補の自動昇格禁止は REQ-110-012・REQ-110-030、採用判断と反映完了の区別は REQ-110-032、実装開始境界での維持は REQ-111-017 が既に所有し、遷移引渡し境界での4区分の区分維持引渡しを増分として定義する）。
  - id: AG-806
    content: 独立レビュー所見の採用分の反映接続（利用者が明示採用した対象のみ、元の指摘・要求・判断根拠を保持して最新成果物と照合し、成果物更新の正規経路〔phase-artifacts-update〕へ接続し、実際の成果物変更で反映済み・未反映・保留を確認し、一部反映後の再実行で重複しない、未採用所見を反映しない、保存指示だけを反映完了としない）は既存 REQ-111-014、REQ-111-015、REQ-111-016 が完全に所有する。本 RU はこの領域に新しい要求行を追加せず、公開経路での成立維持を RU4-AC5 の検証対象とする。
  - id: AG-807
    content: 外部検討結果の安全な再接続（貼付と指定ファイルの両経路で意味上同じ確定結果、旧テーマ識別の照合による再接続と不一致・解決不能部分の保留、衝突・未確認内容との混在時の区分報告、同一入力再投入の重複検出、外部AIの自己申告を採用根拠としない、入力処理量〔O(n)〕・証跡量・失敗時処理の既存契約の維持）は既存 REQ-110-005、REQ-110-007、REQ-110-009、REQ-110-015、REQ-110-026、REQ-110-027 が完全に所有する。本 RU はこの領域に新しい要求行を追加せず、公開経路での成立維持を RU4-AC6 の検証対象とする。

artifact_actions:
  - id: ACT-REQ-801
    artifact: req
    operation: append
    target: docs/requirements/REQ-111.md
    source_items: [AG-802, AG-803, AG-804, AG-805]
    content: |
      REQ-111「要件」テーブル（| ID | 要件 | 列構造）の REQ-111-020 の後に次の 4 行を追加する。

      | REQ-111-021 | 遷移記録の同一識別キーで対象範囲・遷移元・遷移先が一致する要求の再実行は、成立済み遷移の復元として一度だけ扱うこと。同一識別キーで対象範囲・遷移元・遷移先のいずれかが異なる要求は、既存の成立済み遷移として復元せず、成立済み遷移の記録を上書き・置換せず、不一致を報告して当該要求の記録を保存しないこと |
      | REQ-111-022 | 遷移記録領域または既存記録の読取が技術的に失敗する場合は記録不在として扱わず、確認不能として報告し、確認不能な既存状態の上へ遷移記録を保存しないこと。記録領域自体の不存在のみを記録不在として扱うこと |
      | REQ-111-023 | 遷移後の現在工程の特定・再開では、遷移記録と現在工程の識別状態を照合し、矛盾を検出した場合は遷移記録に依存する操作を保留して矛盾を報告すること。次工程の初回テーマ形成が未実施・失敗でも、また別セッション再開でも、成立済み遷移と既知義務を遷移記録から再取得できること |
      | REQ-111-024 | 工程遷移の引渡しは、採用済み事項・上流の制約・未決事項・参考候補を区分して引き渡し、遷移先の次工程で各区分を区別して再取得できること。前置工程が複数ある場合は各前置工程の区分を欠落なく統合すること。参考候補を正式な採用済み要求へ変換せず、未決事項を自動解消せず、別取組・別版の情報を区分外へ混入させないこと |

      既存行の文言・列構造・frontmatter の updated 以外は変更しない。
  - id: ACT-DESIGN-801
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    target_area: '## 工程遷移'
    source_items: [AG-802, AG-803, AG-804, AG-805]
    content: |
      工程の完了・遷移は利用者が判断する。遷移操作は確定した工程関係と既知義務を次工程へ渡し、前工程を完了済みの過去工程として一回だけ記録する。利用者が取消した場合は現在工程を維持する。工程の解決不能、永続化失敗、中断後の再実行では成立済みの状態を正規記録から復元し、未成立の技術処理を成功として扱わない。

      採用済み工程関係に後続工程がない場合は終端として扱う。後続が1件なら一意に選び、複数件なら利用者の選択を求める。複数の前置工程がある場合は既知義務と未確認範囲を保持して引き継ぐ。遷移後の初回テーマ形成は遷移成立と独立させる。

      採用済み工程関係に後続工程がない終端の遷移は、架空の後続工程を作らない記録形式で遷移記録へ保存する。終端の記録形式（後続不在を表す toPhase の表現を含む）は phase-transition 配下の決定的処理 script が所有する schema が定め、保存された記録から終端であることを再構成できる。

      終端の遷移後、当該工程の工程駆動の保存状態（テーマ正本、識別状態、遷移記録）は参照専用として保持する。参照専用の保持は、完了済み過去工程の正規改訂（REQ-111-008）と変更駆動経路による作業を妨げない。テーマ正本のテーマ状態（active、merged、deprecated）に完了状態を追加せず、テーマの消化をもって工程の完了を記録・証明しない。

      遷移記録の保存は、同一識別キーで遷移の意味内容（対象範囲・遷移元・遷移先）が一致する要求のみを既存の成立済み遷移の復元（duplicate）として扱う。いずれかが異なる要求は同一の成立済み遷移として復元せず、成立済み遷移の記録を上書き・置換せず、不一致を報告して記録を保存しない（fail-closed）。記録ファイル名は識別キーから決定的に生成されるため、同一キーの異内容を別記録として保存すると既存記録の上書き消失を招く。記録時刻（recordedAt）は記録メタデータであり、同一遷移の正当な再実行でも一致しないため内容照合の対象に含めない。内容同一性照合の規律は外部戻り入力の受理（agentdev-phase-theme-collaboration の receive）で実証済みの「同一断定禁止・fail-closed」規律を、固定フィールド構造（key、scope、fromPhase、toPhase、recordedAt）にはフィールド値直接比較として転写して適用する。

      遷移記録領域または既存記録の読取が技術的に失敗する場合（記録領域の列挙・読取が存在確認不能に失敗する場合を含む）は記録不在として扱わず、確認不能（error）として報告し、確認不能な既存状態の上へ遷移記録を保存しない。記録領域自体の不存在のみを記録不在として扱う。既存記録ファイルの読取失敗・JSON 破損・schema 違反を error として扱う既存契約は維持する。

      遷移後の現在工程の特定・再開は、遷移記録と現在工程の識別状態（identity）を照合し、矛盾を検出した場合は遷移記録に依存する操作を保留して矛盾を報告する。次工程の初回テーマ形成が未実施・失敗でも、別セッション再開でも、成立済み遷移と既知義務は遷移記録から再取得する。

      工程遷移の引渡しは、採用済み事項・上流の制約・未決事項・参考候補を区分して引き渡し、遷移先の次工程で各区分を区別して再取得できる。前置工程が複数ある場合は各前置工程の区分を欠落なく統合する。参考候補を正式な採用済み要求へ変換せず、未決事項を自動解消せず、別取組・別版の情報を区分外へ混入させない。

conflict_resolutions:
  - id: CR-801
    conflict: 採用事項・レビュー所見・外部検討結果の引渡しを担う新しい受理機構を設ける構成案と、既存の受理機構を統合せず再利用する構成案
    resolution: 既存の受理機構（REQ-110-007/009/015 の外部戻り入力受理、REQ-111-014/015/016 の所見引き継ぎ、phase-artifacts-update の反映経路、REQ-110-040 の採否記録）を再利用し、新しい受理機構を統合先として作らない。根拠は RU-0258 依存関係節と RU4 の対象外（新しい受理機構の統合禁止）、および REQ-110-037 の新しい公開コマンド・恒久的な台帳・報告様式の新設禁止
  - id: CR-802
    conflict: 増分行を REQ-110 と REQ-111 のどちらに配置するか
    resolution: 遷移記録・現在工程照合・引渡し境界は工程遷移の要求体系（REQ-111）に属するため REQ-111 へ APPEND する。REQ-110 側は AC4・AC5・AC6 の該当義務が既存 41 行（REQ-110-001/004/005/007/009/012/015/026/027/030/032）で完全に所有されており、新行を作ると既存行の言い換え（restatement）になるため REQ-110 への追加は行わない
  - id: CR-803
    conflict: 同一識別キーで内容が異なる要求の処置（外部戻り入力型の「新規受理として別記録にする」と、遷移記録型の「fail-closed 拒否」の対立）
    resolution: 'fail-closed 拒否を採用する。根拠: 遷移記録のファイル名は識別キーから決定的に生成され（store.ts encodeFileName）、同一キーの異内容を別記録として書くと既存記録の上書き消失を招く。外部戻り入力の受領記録が連番で区別保存される（received 記録の1受領1ファイル契約）のと対照的な構造差に基づく技術判断であり、RU 合意（内容不一致を同一遷移と扱わない）から一意に導かれる。要件行は「同一と扱わず、上書きせず、不一致を報告」で表現し、拒否方式の確定は Design 分離（ACT-DESIGN-801）で行う'

operation_units:
  - ou_id: OU-801
    source_ru: RU-0258
    target_req: REQ-111
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-802
    source_ru: RU-0258
    target_req: REQ-111
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-transition-and-coexistence-model
    operation: update
    scale: standard
    depends_on: [OU-801]
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-801
    target_item: AG-801
    verification: |
      公開経路の実行で観測する（実装・テストファイルの存在は合格証拠としない）。
      1. printf '%s' '{"candidates":[]}' | bun ./.opencode/skills/agentdev-workflow-phase-transition/scripts/src/resolve-successor.ts --input - を実行し、出力を観測する
      2. printf '%s' '{"candidates":["design"]}' | bun ./.opencode/skills/agentdev-workflow-phase-transition/scripts/src/resolve-successor.ts --input - を実行し、出力を観測する
      3. printf '%s' '{"candidates":["design","implementation"]}' | bun ./.opencode/skills/agentdev-workflow-phase-transition/scripts/src/resolve-successor.ts --input - を実行し、出力を観測する
      4. 前置工程が複数の採用済み工程関係を一時的な工程状態として構成し、後続解決の観測において前置工程ごとの既知義務と未確認範囲が欠落なく扱われることを観測する（REQ-111-004。TS-805 の前置複数の検証と共用できる）
      5. 一時的な工程状態（.agentdev/phase/identity.yaml と採用済み工程関係）の下で /agentdev/phase-transition 公開操作に取消の指示を与え、遷移記録の保存が実行されず現在工程が維持され、取消の報告が返ることを観測する（実行前後の transitions/ の内容と identity.yaml を照合する）
      6. 遷移判断の受領なしに遷移が記録されないことを、利用者判断なしの指示経路で観測する
    pass_criteria: |
      1 は後続0件を終端（terminal）として判別し架空の後続工程を含まないこと（REQ-111-004、REQ-111-019）。
      2 は後続1件を一意に解決すること（REQ-111-004）。
      3 は後続複数件を解決せず利用者選択に渡すこと（ambiguous 判別、REQ-111-004）。
      4 は前置工程が複数でも既知義務と未確認範囲が欠落せず後続解決に伝達されること（REQ-111-004）。
      5 は遷移記録が増えず現在工程が維持され取消の根拠が報告されること（REQ-111-002）。
      6 は利用者の遷移判断なしに遷移記録が作られないこと（REQ-111-002）。
    on_failure: |
      fix-and-reverify。resolve-successor 判別と phase-transition 手順契約の退行を修正して同じ公開経路を再実行する。既存義務の退行は意図的な修正対象にしない
  - id: TS-802
    target_item: AG-802
    verification: |
      一時的な遷移記録ディレクトリで公開 CLI（bun ./.opencode/skills/agentdev-workflow-phase-transition/scripts/src/apply.ts --dir <一時dir> --input）を実行して観測する。
      1. 新規キーの遷移記録 JSON を入力し、出力と記録ファイルの内容を観測する（終端遷移は toPhase:null で記録できることも観測する）
      2. 同一キー・同一内容（対象範囲・遷移元・遷移先が同一）を再入力し、出力と記録ファイル数・内容を観測する
      3. 同一キーで対象範囲のみ異なる要求を入力し、終了コード・stderr・既存記録ファイルの内容を観測する
      4. 同一キーで遷移先のみ異なる要求を入力し、同様に観測する
      既存再現証拠として C:/Users/ogatay/work/adf-stage2-prep/transition-repro/RESULTS.md の候補1（applyRecord に
      同一キー・異内容を与えると duplicate として受理され CLI exit 0 となる現行挙動の再現。REQ-111-021 対応。
      基線: transition-state.test.ts 21 pass / 0 fail @ HEAD fb9003afd の snapshot。証跡: snapshot/、repro.ts、
      repro-output.txt、work/candidate1-applied/、baseline-transition-state.txt）を参照できる（新規の再実行を要しない）
    pass_criteria: |
      1 は新規記録が保存されること。
      2 は同一キー同一内容の再実行が成立済み遷移の復元として一度だけ扱われ、記録ファイルが増えないこと（REQ-111-003 の既存義務の実演）。
      3・4 は duplicate として既存記録を返さず、不一致が報告され、既存記録が上書き・置換されず、非ゼロ終了となること（REQ-111-021）。
    on_failure: |
      fix-and-reverify。store.ts applyRecord の同キー内容照合（RA-802 の変更対象）を修正して同じ CLI 実行を再実行する
  - id: TS-803
    target_item: AG-803
    verification: |
      公開 CLI（lookup.ts、apply.ts）の実行で観測する。
      1. 不存在の遷移記録ディレクトリに対し lookup.ts --dir <不在パス> --key k を実行し、出力を観測する。続けて apply.ts で新規記録の保存を試み、成立することを観測する（正しい不在）
      2. 読取失敗を再現する: 一時ディレクトリに記録領域を用意した上で読取権限を奪い（chmod/icacls による権限設定）、lookup.ts を実行して出力を観測する。続けて apply.ts を実行し、終了コード・stderr・記録ディレクトリの内容を観測する。環境で権限系失敗が再現できない場合は、bun test ./src/common/skills/agentdev-workflow-phase-transition/scripts/tests/transition-state.test.ts を実行して readdir 失敗注入の検証結果を実際に実行して観測する（テストファイルの存在ではなく実行結果を証拠とする）。読取失敗の別の隔離条件として、C:/Users/ogatay/work/adf-stage2-prep/transition-repro/RESULTS.md の候補2（対象パスを通常ファイルとすることで readdir が ENOTDIR で失敗し absent・CLI exit 0 として返る現行挙動の再現。REQ-111-022 対応。証跡: work/candidate2-notdir/blocked）を参照できる（chmod/icacls による権限系の再現に代わる隔離条件。新規の再実行を要しない）
      3. 破損した記録 JSON を置いたディレクトリで lookup.ts と apply.ts を実行し、error 区分と非ゼロ終了を観測する（既存動作の維持）
    pass_criteria: |
      1 は記録領域自体の不存在のみが不在（absent）として扱われ新規記録が保存できること（REQ-111-022）。
      2 は読取失敗が記録不在として扱われず確認不能（error）として報告され、apply は非ゼロ終了で遷移記録を保存しないこと（REQ-111-022、RU4-AC2 の「読取失敗を記録不在と扱い誤って新規遷移する動作を不合格とする」に対応）。
      3 は破損状態が error として扱われ記録の上に保存されないこと（既存契約の維持）。
      併せて書込失敗が成功として報告されないことを既存契約の範囲で観測する（REQ-111-003 の既存義務の実演）
    on_failure: |
      fix-and-reverify。store.ts lookupRecord の読取失敗区別（RA-801 の変更対象）を修正して同じ CLI 実行を再実行する
  - id: TS-804
    target_item: AG-804
    verification: |
      一時的な工程状態で公開操作と公開 CLI を実行して観測する。
      1. /agentdev/phase-transition 公開操作で遷移を成立させ、遷移記録の保存を観測する
      2. 次工程の初回テーマ形成を実施しない状態で、lookup.ts --key <成立キー> を実行し成立済み遷移と既知義務の再取得を観測する
      3. 次工程の初回テーマ形成を失敗させた状態（または形成を行わず中断した状態）で遷移記録が失われず再開できることを観測する
      4. 別セッションを模して遷移記録と現在工程の識別状態（identity.yaml）を照合し、矛盾がなければ復元できることを観測する。意図的に不一致な識別状態を用意した場合は、遷移記録に依存する操作が保留され矛盾が報告されることを観測する
    pass_criteria: |
      遷移記録と現在工程の識別状態が矛盾せず復元されること。初回形成の未実施・失敗で成立済み遷移が失われないこと（REQ-111-005、REQ-111-023、RU4-AC3 の「初回テーマ形成失敗を理由に成立済み遷移が失われる場合を不合格」に対応）。矛盾検出時に遷移記録に依存する操作が保留され矛盾が報告されること（REQ-111-023）。
      遷移前後の正規状態、遷移記録、現在工程の照合結果を証拠として残す
    on_failure: |
      fix-and-reverify。現在工程照合手順の退行を修正する（RA-804）。矛盾検出動作が未実装の場合は実装不足として RA-804 の実現面を完成させてから同じ公開経路を再実行する
  - id: TS-805
    target_item: AG-805
    verification: |
      採用済み事項・上流の制約・未決事項・参考候補が混在し、前置工程が複数、テーマの分割・統合（旧新対応あり）と別取組・別版への切替を含む一時的な工程状態を用意し、公開操作で観測する。
      1. /agentdev/phase-transition 公開操作で遷移を実行し、引渡し報告に各区分（採用済み・上流制約・未決・参考候補）が区別して含まれることを観測する
      2. 遷移先の次工程（/agentdev/phase-tasks-create 公開操作）で各区分が混同なく再取得されることを観測する。参考候補が参考候補として提示され正式採用済みへ変換されないこと、未決が未決のまま引き継がれることを、bun ./.opencode/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts --themes-file <themes.md> --pending-file <pending.md> --assess-adoption true の実行結果と併せて観測する
      3. 別取組・別版へ切り替えた状態で旧取組の情報が区分外へ混入しないことを identity.yaml とテーマ正本の照合で観測する
    pass_criteria: |
      必要な上流要求・制約・受け入れ条件が維持され、未決が自動解消されず、参考候補が自動採用されず、別取組・別版の情報が誤継承されないこと（REQ-111-024、RU4-AC4）。前置複数の既知義務と未確認範囲が欠落しないこと（REQ-111-004）、未決の後継引継ぎと判断根拠の追跡（REQ-110-004）、参考候補の自動昇格禁止（REQ-110-012・REQ-110-030）、採用判断と反映完了の区別（REQ-110-032）が同時に成立すること。
      遷移前後の採否・未決記録と実際の成果物・テーマ正本の照合結果を証拠として残す
    on_failure: |
      fix-and-reverify。引渡し手順の退行を修正する（RA-805）。区分維持の引渡しが未実装の場合は RA-805 の実現面を完成させてから同じ公開経路を再実行する
  - id: TS-806
    target_item: AG-806
    verification: |
      一時的な工程状態で /agentdev/phase-review 公開操作により確定違反・証拠不足・推測・未採用改善候補を含む所見を得た上で観測する。
      1. 未採用・既解消・対象不明の所見を含む状態で、利用者が明示採用した対象のみが /agentdev/phase-artifacts-update 公開操作へ接続され反映されることを観測する
      2. 実際の成果物変更と照合し、反映済み・未反映・保留が区別されることを観測する
      3. 一部反映後に中断した状態で同一採用対象の再実行を行い、成立済み修正の再適用による重複が生じないことを観測する
      4. 採用指示（保存指示）のみを与え反映実行をしない状態で、反映完了と判定されないことを観測する
    pass_criteria: |
      未採用所見の反映がないこと（REQ-111-014）。保存指示だけによる反映完了判定がないこと（REQ-111-016、RU4-AC5 の不合格条件に対応）。一部反映後の再実行で重複がないこと（REQ-111-016）。元の指摘・要求・判断根拠が保持され最新成果物との照合を経ること（REQ-111-014・REQ-111-015）。
      採否記録、実際の成果物変更、反映結果の照合結果を証拠として残す
    on_failure: |
      fix-and-reverify。既存の所見引き継ぎ・反映経路の退行を修正して同じ公開経路を再実行する（本 RU の新規実現面変更はこの検証には含まれない）
  - id: TS-807
    target_item: AG-807
    verification: |
      公開 CLI（bun ./.opencode/skills/agentdev-phase-theme-collaboration/scripts/src/receive.ts、themes.ts）の実行で観測する。
      1. 同一内容の戻り入力を貼付（--input -）と指定ファイルの両経路で receive.ts に与え、出力 JSON を比較する
      2. 本文に「承認済み」等の自己申告を含むエントリを --adopt なしで受理し、採否区分と selfReportDetected の記録を観測する
      3. --prior 付き再投入で同一内容エントリの採否区分を観測し、同識別子・同表題で本文が異なるエントリの処理を観測する
      4. 旧テーマ識別を持つ戻り入力について themes.ts --resolve-old を実行し、解決結果を観測する
      5. 衝突事項と独立反映可能な採用事項の混在入力を /agentdev/phase-artifacts-update 公開操作で反映し、区分報告を観測する
    pass_criteria: |
      1 は両経路が同一 JSON を返すこと（REQ-110-007）。
      2 は自己申告が採用根拠にならず不採用として記録され、自己申告の検出が観測情報としてのみ記録されること（REQ-110-007、RU4-AC6 の「自己申告だけで正式採用する場合を不合格」に対応）。
      3 は同一内容の再投入が重複として検出され、本文が異なる入力が同一と断定されず新たな受理対象となること（REQ-110-026・REQ-110-027）。
      4 は旧テーマ識別の後継チェーンが解決され、誤った対象への接続が生じないこと（REQ-110-005、RU4-AC6 の「旧テーマ識別を誤った対象へ接続する場合を不合格」に対応）。
      5 は独立事項のみ反映し衝突・未確認・保存失敗が区別報告されること（REQ-110-009）。
      既存の入力処理量（O(n)）・証跡量・fail-closed の契約が維持されること（REQ-110-015）。
      正規の受理・反映経路から取得した実際の結果を証拠として残す
    on_failure: |
      fix-and-reverify。既存の受領・受理経路の退行を修正して同じ公開経路を再実行する（本 RU の新規実現面変更はこの検証には含まれない）

realization_actions:
  - id: RA-801
    concern: lookupRecord の読取失敗と記録不在の区別
    responsibility: 工程遷移記録の決定的処理は agentdev-workflow-phase-transition 配下の scripts が所有する（SKILL.md 決定的処理 script 節、scripts/README.md 操作契約）。lookupRecord の不在・既存・エラーの3区分を維持し、読取失敗を absent に混入させない
    ownership_hints:
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/lib/store.ts（lookupRecord。31-36行の readdir 失敗の無条件 catch を、記録領域自体の不存在とその他の読取失敗へ区別する修正対象。記録ファイル readFile 失敗の error 区分〔41-46行〕は既存のまま維持）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/README.md（lookup 操作契約の出力区分に確認不能（error）経路を明示する追記対象）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/tests/transition-state.test.ts（読取失敗区別の検証を追加する対象）"
    intent: 読取失敗を不在と誤認して確認不能な状態の上へ新規遷移を記録する経路を遮断し、不在判定を記録領域自体の不存在に限定する
    verification_refs: [TS-803]
    source_items: [AG-803]
  - id: RA-802
    concern: applyRecord の同キー内容照合と不一致拒否
    responsibility: 同上の所有境界（agentdev-workflow-phase-transition scripts）で applyRecord の一度実行制御を拡張する。同一キーで意味内容（対象範囲・遷移元・遷移先）が一致する要求のみを duplicate 復元とし、不一致は fail-closed 拒否する
    ownership_hints:
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/lib/store.ts（applyRecord。82-85行の existing 判定で既存記録（lookup.record）と新要求（record）の scope/fromPhase/toPhase を照合する修正対象。encodeFileName〔20-22行〕が同一キーから決定的なファイル名を生成するため、不一致時の別記録保存は既存記録の上書き消失を招く構造）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/lib/schema.ts（TransitionRecord の固定5フィールド。余分なフィールド禁止の fail-closed 検証は既存のまま維持）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/README.md（apply 操作契約に同キー異内容の拒否経路を追記する対象）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/tests/transition-state.test.ts（同キー異内容拒否の検証を追加する対象）"
    intent: 同一キーで内容が異なる要求が既存の成立済み遷移と同一視される経路を遮断し、一度実行制御を遷移の意味内容の同一性に基づかせる
    verification_refs: [TS-802]
    source_items: [AG-802]
  - id: RA-803
    concern: receive.ts 内容同一性照合パターンの store.ts への適用可否判断の固定
    responsibility: 外部戻り入力の受理機構（agentdev-phase-theme-collaboration scripts）は変更対象ではなく、その内容同一性照合規律を遷移記録 store へ転写する方針の判断材料として参照する。転写先の正規所有は agentdev-workflow-phase-transition scripts である
    ownership_hints:
      - "src/common/skills/agentdev-phase-theme-collaboration/scripts/lib/receive.ts（パターン参照元。digestBody〔36-38行〕の内容ダイジェスト、buildPriorBodyDigests〔84-92行〕のダイジェスト不在を同一断定で除外しない規律、detected-duplicate と updatedFromPrior の判定〔174-189行〕の同一断定禁止規律）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/lib/store.ts（適用先。可変長本文向けのダイジェスト方式は固定5フィールド構造にはフィールド値直接比較として転写する。受領記録の連番区別保存は encodeFileName の決定性と非対称であり、不一致は fail-closed 拒否として転写する。recordedAt は記録時刻メタデータであり照合対象外とする）"
    intent: 外部受理側で実証済みの「同一断定禁止・fail-closed」規律を遷移記録 store へ適用する転写方針を固定し、実現面変更の判断材料を後続工程に引き渡す
    verification_refs: [TS-802]
    source_items: [AG-802]
  - id: RA-804
    concern: 遷移記録と現在工程の照合による復元・矛盾検出
    responsibility: 中断後の再実行と復元、初回テーマ形成との独立性の手順契約は agentdev-workflow-phase-transition SKILL.md が所有し、機械的部分は同配下 scripts（lookup.ts）が担う。現在工程の最小識別状態（identity）の様式の正は .agentdev/phase/README.md（領域契約）である
    ownership_hints:
      - "src/common/skills/agentdev-workflow-phase-transition/SKILL.md（「中断後の再実行と復元」「初回テーマ形成との独立性」節に遷移記録と現在工程の識別状態の照合・矛盾保留を追記する対象）"
      - "src/common/skills/agentdev-workflow-phase-transition/scripts/src/lookup.ts（成立済み遷移の再取得入口）"
      - ".agentdev/phase/identity.yaml（現在工程の最小識別状態。読み取り側の照合対象であり本 RA の変更対象ではない）"
      - "src/common/skills/agentdev-phase-theme-collaboration/scripts/src/themes.ts（遷移先次工程のテーマ正本・採用状態の照合入口）"
    intent: 遷移記録と現在工程の突合による矛盾検出を復元経路に組み込み、別セッション再開でも成立済み遷移と既知義務を失わせない
    verification_refs: [TS-804]
    source_items: [AG-804]
  - id: RA-805
    concern: 5公開操作の遷移・引渡しフローにおける区分維持の引渡し報告
    responsibility: 公開操作の interface（入出力契約・ガードレール）は phase-transition command が所有し、workflow 実装本体は agentdev-workflow-phase-transition SKILL.md が所有する。引渡し報告の必須要素は REQ-110-034〜036 の完了報告契約に従う。5公開操作（phase-tasks-create・phase-tasks-update・phase-artifacts-update・phase-review・phase-transition）の遷移・引渡しフローの変更は既存の手順契約の範囲で行う
    ownership_hints:
      - "src/common/commands/agentdev/phase-transition.md（公開操作契約。後続解決・取消・前置複数の伝達・引渡し報告の追記対象）"
      - "src/common/skills/agentdev-workflow-phase-transition/SKILL.md（工程 3〔後続解決〕・4〔前置情報収集〕・6〔報告と次工程への接続〕に区分維持の引渡しを追記する対象）"
      - "docs/designs/workflows/v51-phase-transition-and-coexistence-model.md（工程遷移節。ACT-DESIGN-801 の適用先）"
      - "src/common/skills/agentdev-phase-theme-collaboration/SKILL.md（テーマ形成・採否記録・戻り受理の引渡し先側契約。変更対象ではなく引渡し整合の参照）"
    intent: 5公開操作の遷移・引渡しフローで採用済み・上流制約・未決・参考候補の区分維持の引渡し報告を成立させ、REQ-111-024 の公開経路での検証可能性を保つ
    verification_refs: [TS-801, TS-805]
    source_items: [AG-801, AG-805]

review_dispositions:
  - id: RD-801
    source_ru: RU-0258
    source_item: RU4-AC1
    disposition: covered
    reason_code: already_satisfied
    reason: |
      利用者判断による遷移解決（後続0/1/複数・複数前置・取消・判断なし遷移の禁止）は既存 REQ-111-002（利用者判断による単独操作と取消時の現在工程維持）、REQ-111-004（後続0/1/複数・前置複数の解決と既知義務の伝達）、REQ-111-019・REQ-111-020（終端遷移の記録形式と参照専用保持）が完全に所有する。新行を作ると既存行の言い換えになるため追加せず、公開経路での成立維持を TS-801 で検証する
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-802
    source_ru: RU-0258
    source_item: RU4-AC2
    disposition: covered
    reason_code: already_satisfied
    reason: |
      RU4-AC2 の検証シナリオのうち保存失敗・中断後の同一要求再実行・技術的失敗の成功扱い禁止は既存 REQ-111-003（利用者の工程完了判断と技術的切替の分離、確定した遷移だけを復元、二重実行防止）が所有する。要求行としての不足はない。ただし「実利用経路では未実証」であるため、TS-802・TS-803 の公開経路実演で既存義務を含めて検証する
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-803
    source_ru: RU-0258
    source_item: investigation-store-applyRecord-content-compare
    disposition: partially_covered
    reason_code: not_yet_owned_by_existing_rows
    reason: |
      コード調査(a) の判定: 増分が必要。行レベル根拠: store.ts applyRecord の 82-85 行で lookup.result === "existing" の場合、既存記録（lookup.record）と新要求（record）の内容比較（scope/fromPhase/toPhase）を一切行わず既存記録をそのまま duplicate として返す。同一キーで内容が異なる要求が既存の成立済み遷移と同一視される。既存 REQ-111-003 は同一要求の再実行の復元のみを所有し、同一キー異内容の区別は所有しない。よって AG-802 → REQ-111-021 として増分定義する。外部受理側 receive.ts の適用可否: 適用可能だが転写様式が異なる（詳細は RA-803）。receive.ts は内容同一性を正規化本文のダイジェスト（digestBody 36-38行）で判定し、ダイジェスト一致のみ detected-duplicate（174行）、相違は同一断定せず新たな受理対象（188-189行）という「同一断定禁止・fail-closed」規律を実装済みである。store.ts へは固定5フィールド構造のためフィールド値直接比較として転写し、encodeFileName（20-22行）の決定性（同キーは同一名で既存記録を上書きし得る）により不一致は新規受理ではなく fail-closed 拒否として転写するのが構造的に唯一安全である。recordedAt は記録時刻メタデータであり正当な再実行でも一致しないため照合対象から除外する
    evidence:
      path: src/common/skills/agentdev-workflow-phase-transition/scripts/lib/store.ts
      section: applyRecord（82-85行）と encodeFileName（20-22行）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-804
    source_ru: RU-0258
    source_item: investigation-store-lookupRecord-read-failure
    disposition: partially_covered
    reason_code: not_yet_owned_by_existing_rows
    reason: |
      コード調査(b) の判定: 増分が必要。行レベル根拠: store.ts lookupRecord の 31-36 行で readdir 失敗を無条件 catch し { result: "absent" } を返す。ディレクトリ不在（正当な不在）と権限系等の読取失敗（確認不能）が混同される。対照的に同関数内の記録ファイル readFile 失敗（41-46行）は errors に蓄積して error を返す（既に正しい）。applyRecord からは lookup absent → mkdir(dir, {recursive:true})〔90行〕→ writeFile〔91行〕の経路で、読取失敗が書込可能な環境では不在と誤判定した上で新規遷移記録を書ける。既存 REQ-111-003 は書込失敗と中断を所有するが読取失敗の不在誤認排除は所有しない。よって AG-803 → REQ-111-022 として増分定義する
    evidence:
      path: src/common/skills/agentdev-workflow-phase-transition/scripts/lib/store.ts
      section: lookupRecord（31-36行）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-805
    source_ru: RU-0258
    source_item: RU4-AC3
    disposition: partially_covered
    reason_code: partially_owned_by_existing_rows
    reason: |
      遷移後の初回テーマ形成の未実施・失敗で遷移を取り消さないことは既存 REQ-111-005 が、再開時の対象特定と復元は既存 REQ-110-001 が所有する。ただし遷移記録と現在工程の識別状態の突合による矛盾検出・保留は既存行が所有しない。よって AG-804 → REQ-111-023 として増分定義する（初回形成失敗で成立済み遷移が失われない既存義務は TS-804 で維持検証する）
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件（REQ-111-005）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-806
    source_ru: RU-0258
    source_item: RU4-AC4
    disposition: partially_covered
    reason_code: partially_owned_by_existing_rows
    reason: |
      前置複数の既知義務伝達（REQ-111-004）、実装開始境界での確定・未決・採用判断の維持（REQ-111-017）、中断・再実行時の採用・未決・試作状態の維持（REQ-111-018）、別取組への無条件引き継ぎ禁止（REQ-110-001）、未決の後継引継ぎと判断根拠の追跡（REQ-110-004）、参考候補の自動昇格禁止（REQ-110-012・REQ-110-030）、採用判断と反映完了の区別（REQ-110-032）が既存行で所有する。ただし遷移引渡し境界で採用済み事項・上流の制約・未決事項・参考候補を区分して引き渡し次工程で区別して再取得できるという横断義務は所有しない。よって AG-805 → REQ-111-024 として増分定義する
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件（REQ-111-004、REQ-111-017、REQ-111-018）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-807
    source_ru: RU-0258
    source_item: RU4-AC5
    disposition: covered
    reason_code: already_satisfied
    reason: |
      独立レビュー所見の採用分の反映接続（採用対象のみの引き継ぎ、元の指摘・要求・判断根拠の保持、最新成果物照合、既解消・対象不明所見の排除、実際の成果物変更との照合、一部反映後の継続で重複なし、保存指示だけを完了としない）は既存 REQ-111-014・REQ-111-015・REQ-111-016 が完全に所有し、接続先の phase-artifacts-update 経路は v51 Design「レビュー所見の成果物修正への引き継ぎ」節（38行）で既存の正規成果物管理経路への接続が確定している。新行を作らず、TS-806 で公開経路実演により維持を検証する
    evidence:
      path: docs/requirements/REQ-111.md
      section: 要件（REQ-111-014〜016）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-808
    source_ru: RU-0258
    source_item: RU4-AC6
    disposition: covered
    reason_code: already_satisfied
    reason: |
      外部検討結果の安全な再接続（両経路の同一確定結果、採用根拠の限定と自己申告排除、旧テーマ識別の再接続と保留、衝突・未確認混在の区分、再投入の重複検出、O(n)・証跡量・fail-closed 契約）は既存 REQ-110-005・REQ-110-007・REQ-110-009・REQ-110-015・REQ-110-026・REQ-110-027 が完全に所有する。新行を作らず、TS-807 で公開経路実演により維持を検証する
    evidence:
      path: docs/requirements/REQ-110.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-809
    source_ru: RU-0258
    source_item: RU4-out-of-scope-items
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      対象外5項目（ADFによる工程全体の自動完了認定、独立レビューの一律必須化、外部AIへの自動送信、新たな工程進捗台帳、下流全工程の更新・再検証完遂〔RU-0259 の所有領域〕）は本 RU の定義対象から除外する。既存 REQ-110 対象外（外部AIへの自動送信等）、REQ-111 対象外（工程全体の完了・深度採点、新しい工程進捗台帳、独立レビューの必須ゲート化）、REQ-110-037（新しい公開コマンド・恒久的な台帳・報告様式の新設禁止）と整合する。既存の受理機構を統合する新しい受理機構も作らない（CR-801）
    evidence:
      path: .agentdev/backlog/req-units/RU-0258.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
  verification_case_note: |
    検証事例参照 S3・S4 の出所注記: S3=工程遷移・取消・失敗・再実行（補足「S3：同一識別キーで内容が異なる場合と、遷移記録の読取失敗を確認する」）、S4=次工程への情報引渡しと別セッション再開。事例定義は外部引継ぎ資料 D:/Downloads/adf-stage-acceptance-handoff.md（題「ADF第1・第2段階の承認済み完了条件 — 実行エージェントへの補完資料」、626行、冒頭に「新しい要求、受け入れ条件、合格基準ではない」と明記）の「## 検証事例S1〜S6」節（L553〜574）にある。RU-0258 と段階条件の対応は同資料「各RUと段階条件の対応（参照用）」（L613〜626）の P4・P5（合格基準を置き換えない。RU個別条件の合格が段階条件の合格を自動証明するわけではない）。節末尾の規律「S1〜S6のすべてを各環境で機械的に重複実行する必要はない。ただし、対象とする操作・環境・条件が実際に検証されたかを明確にし、一部の成功を全体の合格に拡張しない」（L572〜574）を順守する。証拠基準（遷移前後の正規状態、遷移記録、現在工程、採否・未決記録、実際の成果物変更、再開時の取得結果の照合）は RU4「検証範囲と証拠」の逐語を維持する。遷移2欠陥の既存再現証拠（候補1: applyRecord 同一キー・異内容が duplicate で受理され CLI exit 0、候補2: readdir 失敗〔対象パス=通常ファイル、ENOTDIR〕が absent で CLI exit 0。基線: transition-state.test.ts 21 pass / 0 fail @ HEAD fb9003afd の snapshot。証跡: snapshot/、repro.ts、repro-output.txt、work/candidate1-applied/、work/candidate2-notdir/blocked、baseline-transition-state.txt）は C:/Users/ogatay/work/adf-stage2-prep/transition-repro/RESULTS.md を参照する（新規の再実行を要しない）
```

# summary

工程遷移の成立・現在工程の復元・採用事項と未決事項の引渡しの不足を、REQ-111 への 4 行追加（REQ-111-021〜024）と phase-transition store 意味論の是正として増分定義した。AC1・AC5・AC6 は既存行が完全に所有するため新行を作らず、公開操作経路での成立維持を検証対象として test_strategy に組み込んだ。新しい受理機構・台帳・自動完了認定は導入しない。
