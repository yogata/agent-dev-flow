# 要件doc draft: generate_indexes の部分 AUTOGEN 再生成退行と producer 部分欠損 fail-open の修正（既存2コミットの正規経路接続）

- topic: index-partial-autogen-regen
- 作成日時（実測）: 2026-11-03T20:35+09:00 前後（監督側ドラフト作成、commit 実測時刻は git log 参照）
- source_type: external
- source_reference: 利用者の接続修正承認（2026-11-03。PR #3898 による退行の実証を踏まえ、既存修正コミットを保持・再利用して正規経路へ接続する指示）、監督者による before/after 同一実行条件検証（2026-11-03 実測、本 draft「再利用できる証拠」節）
- 入力となる一次記録: PR #3898（merge 6819d8ae8、2026-11-03T10:03:57Z）、Root Case Issue #3897（closed）、既存修正コミット ddec7f81d / 42b0cdefd（branch fix/index-partial-autogen-regen、base 6819d8ae8）、隔離検証記録 C:/Users/ogatay/work/ru0255-caseready-rerun/evidence-case3-fixed/README.md

## 入力の区別

- 利用者による元指示: 索引生成器の退行修正の完了。既存の2ローカルコミットを保持・再利用し、既存 ADF Case→PR→検査→統合の正規経路へ接続する。修正前後の安全条件と consumer の部分マーカー、producer の rules 不足、従来の正常ケースを同一実行条件で検証する。受け入れ条件の弱化は禁止。実環境に直接書き込まず、無関係な stash・変更を巻き込まない。失敗・権限・契約障害時は正規停止。検証可能な ID（PR・Issue・対象コミット）を残す
- 実装担当（別担当、停止済み）による成果: branch fix/index-partial-autogen-regen 上の2コミット（ddec7f81d: consumer 部分マーカー退行修正、42b0cdefd: producer 部分欠損 fail-open 修正）。両コミットとも検査対応部（check_integrity.ts / IR-061）・REQ・Design・wrapper を変更しない
- 本 draft の合意内容は上記から、受け入れ条件の追加緩和・弱化を行わずに整理したものである

## 既存の実行と証拠の棚卸し（再利用と失効の区別）

### 再利用できる証拠

- 回帰退行の実証（監督者実測 2026-11-03、同一実行条件 bun 1.3.6・同一テストコマンド・git archive 抽出 tree）: base 6819d8ae8 に対し本修正の回帰試験3ケース（consumer 部分マーカーで既存領域の独立再生成 / producer 部分欠損 fail-closed / 片成果物のみ残存）が 3/3 fail。HEAD 42b0cdefd では同一条件で 3/3 pass
- 修正版の全量試験（監督者実測 2026-11-03、本体 worktree 実測）: generate_indexes.test.ts + generate_indexes_consumer_repo.test.ts 計 68 ケース全 pass・0 fail、実行後 `git status --porcelain` 空（worktree 無書込み）
- 隔離検証環境での必須ゲート経路記録: evidence-case3-fixed/（case-ready wrapper 1 回実行。generate_indexes step pass、traceability-check fail は配布 runtime script の inline ADF-COVERS 由来の別検出〔Issue #3899 で扱う対象〕で本 Case の判定条件に混ぜない）。同 README は PR #3898 版生成器の部分マーカー退行（同一ファイル内の一部マーカー欠落で存在ブロックも再生成せず exit 0）を追加不具合として記録 — ddec7f81d の修正対象と同一事象
- 既存テストの上位互換性: base と HEAD で差分ファイルは generate_indexes.ts と同 consumer 試験ファイルのみ（git archive 全 tree diff 実測）。base に HEAD 版全試験を通すと既存 65 ケースは変動なく、fail は新規回帰3ケースのみ

### 失効・限定する判定

- evidence-case3-fixed の generate_indexes step pass は、部分マーカー領域の鮮度を証明しない（同 README 自身の但し書き）。修正版での鮮度は回帰試験と本 Case の検査で改めて成立させる
- 本体 main 実行の「no changes (already up-to-date)」は PR #3898 版の実測であり、修正版では本 Case の検査で再確認する

# draft-data

```yaml
topic_slug: index-partial-autogen-regen

work_type: maintenance

scale: standard

summary: |
  PR #3898（merge 6819d8ae8）が導入した索引生成器（generate_indexes.ts）の2つの退行を、
  既存の2ローカルコミット（ddec7f81d + 42b0cdefd、branch fix/index-partial-autogen-regen）を
  書き換えず再利用して正規経路（Root Case Issue → Definition → 実装 PR → 必須ゲート → 統合 →
  クローズ）で完了させる。
  退行1（consumer 部分マーカー）: skipOrExit の単位が README 全体のため、同一ファイル内の一部
  AUTOGEN マーカー欠落時に存在する AUTOGEN 領域の陳腐化が検査合格のまま残る（PR 本文契約
  「マーカーがあれば通常再生成」との不一致）。修正: 存在する AUTOGEN 領域は欠落マーカーの
  有無と独立に再生成。欠落マーカーの報告契約は変更しない（本体は fail-fast exit 2、導入先は
  IR-061 と同一の適用範囲で記録して継続）。
  退行2（producer 部分欠損）: hasIntegrityStructure = rules dir 存在 の単一判定のため、rules dir
  のみ喪失し catalog / rule-ownership が残存する部分欠損形状を導入先 consumer と誤分類し、全
  fail-fast が skip 記録に退化して exit 0 で正常終了する（#3898 以前は exit 2）。修正: rules dir
  不在でも catalog / rule-ownership のいずれかが残存する場合は consumer と分類せず、既存成果物
  を producer 証跡として exit 2 を返す（fail-closed 復元）。
  導入先（3 成果物すべて不在）の consumer 動作・検査対応部（check_integrity.ts / IR-061）・
  REQ・Design・wrapper は不変。機構追加・検査範囲変更・受け入れ条件変更は無し。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-R001
    content: |
      退行修正の内容は既存2コミット（ddec7f81d、42b0cdefd）に固定する。受け入れ条件の弱化・
      緩和を行わない: (a) consumer 部分マーカー（2/3 存在・陳腐化内容）で存在する AUTOGEN
      領域の独立再生成と欠落マーカー報告（導入先は IR-061 適用範囲で記録継続、本体は
      fail-fast exit 2 維持）の両立、(b) producer 部分欠損（rules dir 不在・catalog または
      rule-ownership 残存、および片方のみ残存）で exit 2 fail-closed、(c) 導入先の全成果物
      不在時は exit 0 無書込みの既存動作を不変、(d) 本体の完全な integrity 構造では既存
      fail-fast（マーカー喪失・IR ファイル不在 exit 2）を1バイトも緩和しない、(e) 本体
      producer の正常時は no changes (exit 0)・docs 書込み差分 0 件を維持
  - id: AG-R002
    content: |
      既存2ローカルコミットを保持・再利用する。branch fix/index-partial-autogen-regen
      （ddec7f81d、42b0cdefd、base 6819d8ae8）の commit を書き換え・rebase・再実装しない。
      case-run 前置ガードの配置検証モード（成果物が既に commit 済みの場合は配置検証のみで
      pass 判定）を適用し、実装 PR は当該 commit 内容をそのまま対象とする
  - id: AG-R003
    content: |
      正規経路で接続する: Root Case Issue 起票 → Definition 確定 → 実装 PR 作成 →
      case-ready / case-close の必須ゲート（REQUIRED_GATES 系、generate_indexes step を含む）
      → 統合（直近統合形式の実測に従う: squash merge、題名接頭辞 fix(integrity):、merge commit
      に (#N) 付与）→ Root Case クローズ。PR 本文に Closes 参照・変更内容・検証（何を検査し
      何が対象外か）・判断記録（利用者承認）を残す。PR・Issue・対象コミットの検証可能な ID を
      全て記録する
  - id: AG-R004
    content: |
      無関係な対象を巻き込まない: stash@{0}（On main: unrelated local changes before .agentdev
      persist）へ一切触れない。他の draft 2件（req-draft-caseready-cleanup-suppression.md、
      req-draft-correction-3887-verification.md）、Issue #3899（別 Case・別工程の対象）、
      AGENTS.md（保護対象・一切変更しない）、.worktrees/3887-definition 残置、既存検証 branch
      （verification/*）は本 Case の対象外。remote branch 削除は本実行が作成した branch に限定
      （既定どおり）。実環境への直接書込み（正規経路外の repo ファイル改変・直接 push to main）
      を行わない
  - id: AG-R005
    content: |
      検査対応部と契約を変更しない: check_integrity.ts（IR-061）・REQ-029・wrapper
      （accept_definition_checks.ts 等）・導入先 docs は不変。新機構・中央機構の追加、consumer
      への IR 構造複写も行わない。traceability-check の既存別検出（配布 runtime script の inline
      ADF-COVERS、Issue #3899 の対象）は本 Case の合格条件に混ぜず、検出事実の記録に留める
  - id: AG-R006
    content: |
      判断記録: 利用者は 2026-11-03、PR #3898 による退行の実証を踏まえ、既存修正コミットの
      保持・再利用と正規経路（Case→PR→検査→統合）への接続修正を承認した。本 draft の実行は
      当該承認の範囲に限定され、実行中に新しい利用者留保判断（受け入れ条件変更、対象範囲拡大、
      権限・保護対象への未承認操作）が必要になった場合は正規停止して報告する

operation_units:
  - id: OU-R001
    description: |
      Root Case Issue の起票と Definition 確定（case-open → case-ready）。退行2件の現象・
      実測証拠・既存契約との関係（PR 本文契約・IR-061・REQ-029-001）を Root Case 本文に
      記録する
    verification_refs: [TS-R001, TS-R002]
  - id: OU-R002
    description: |
      実装 PR の作成と検査（case-run）。既存2コミットの配置検証モードによる再利用、PR 作成、
      必須ゲート実行（generate_indexes step を含む）。検査は修正前後同一実行条件で安全条件
      （本体 fail-fast・導入先 exit 0 無書込み）と退行2件・従来正常ケースを確認する
    verification_refs: [TS-R002, TS-R003]
  - id: OU-R003
    description: |
      統合とクローズ（case-close）。直近統合形式実測に従う統合、Root Case クローズ、ローカル
      後始末（統合確認後の自作 branch 処分、main 復帰、status 空確認）。stash@{0} と他 draft・
      AGENTS.md を不変のまま維持することを含む
    verification_refs: [TS-R002]

test_strategy:
  - id: TS-R001
    concern: "退行が base で実証され、HEAD で解消されていること（同一実行条件）"
    verification: |
      base 6819d8ae8 と HEAD 42b0cdefd に同一のテストランナー・同一コマンド・同一テスト
      コードで回帰試験を実行し、before で退行2件に対応するケースが fail、after で pass に
      なることを確認する。監督者実測（2026-11-03、bun 1.3.6、git archive 抽出 tree）では
      before 3/3 fail → after 3/3 pass、差分ファイルは generate_indexes.ts と consumer 試験
      ファイルのみ
    pass_criteria: |
      before の fail が退行2件（consumer 部分マーカーの陳腐化維持、producer 部分欠損の
      fail-open）に正確に対応し、after で全ケース pass かつ既存ケースの判定変動がないこと
    on_failure: |
      fix-and-reverify。証拠不足と実装不備を区別する
  - id: TS-R002
    concern: "正規経路の必須ゲートが修正版で pass し、統合まで完了すること"
    verification: |
      case-ready / case-close の必須ゲート（REQUIRED_GATES 系）が PR branch の修正版で実行
      され、generate_indexes step が pass することを確認する。traceability-check の既存別検出
      （#3899 対象）は本 Case の判定から除外し、検出事実として記録する。統合後は main 上で
      generate_indexes が no changes (exit 0)・書込み差分 0 件であることを確認する
    pass_criteria: |
      必須ゲートが最後まで実行され後続抑止が発生しないこと。PR がマージされ Root Case が
      クローズされること。検証可能な ID（Issue 番号・PR 番号・対象コミット）が記録されていること
    on_failure: |
      fix-and-reverify。証拠不足と実装不備を区別する。権限・保護された操作の拒否、解決不能な
      外部依存、承認済み要件・受け入れ条件の変更、対象範囲の拡大、利用者に留保された判断が
      必要な場合は根拠を示して停止して判断事項を報告する（未確認の可能性の先取りだけで
      停止しない）
  - id: TS-R003
    concern: "修正版が従来の正常ケースと安全条件を維持すること"
    verification: |
      回帰試験ファイルの既存4ケース（consumer 形状 exit 0 無書込み / consumer の AUTOGEN
      領域再生成維持 / 本体マーカー喪失 exit 2 維持 / rules dir 空 exit 2 維持）と本体 producer
      の正常実行（no changes・書込み差分 0 件）を、base と同一の実行条件で確認する
    pass_criteria: |
      既存ケースの判定が base から変動せず、本体の fail-fast 安全条件が緩和されていないこと
    on_failure: |
      fix-and-reverify。受け入れ条件を緩和して合格にしない

review_dispositions: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

## 参照（一次記録の所在）

- PR #3898: https://github.com/yogata/agent-dev-flow/pull/3898（merge commit 6819d8ae8、2026-11-03T10:03:57Z）
- Root Case #3897: https://github.com/yogata/agent-dev-flow/issues/3897（closed）
- 既存修正コミット: ddec7f81d（consumer 部分マーカー）、42b0cdefd（producer 部分欠損 fail-closed）、branch fix/index-partial-autogen-regen、base 6819d8ae8
- 隔離検証記録: C:/Users/ogatay/work/ru0255-caseready-rerun/evidence-case3-fixed/（README.md、gate-acceptance-checks-fixed.out、generate-indexes-consumer-standalone.out）。同環境 yogata/adf-ru0255-github-verify への追加操作は本 Case の対象外
- 監督者 before/after 検証（2026-11-03 実測、再実行可）: C:/Users/ogatay/AppData/Local/hermes/cache/scratch/idx-verify/ 配下（before2 = 6819d8ae8 抽出、after2 = 42b0cdefd 抽出）
- 別検出の記録: Issue #3899（配布 runtime script の inline ADF-COVERS と REQ-029 の矛盾）

## 対象外

- 受け入れ条件の変更・弱化、検査範囲の変更、新機構の追加
- Issue #3899 の処置（配布 runtime script の metadata 是正）、隔離検証環境の状態操作
- stash@{0}、他 draft 2件、AGENTS.md、.worktrees 残置、既存検証 branch の変更
- 導入先 docs・REQ・Design・wrapper・check_integrity.ts の変更
