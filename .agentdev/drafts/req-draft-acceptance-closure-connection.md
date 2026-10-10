---
draft_type: req_draft
topic_slug: acceptance-closure-connection
status: draft
created_at: 2026-10-10T23:55:00+09:00
source_rus:
  - RU-0199
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >
  ADF の既存受入・終了経路の接続を是正する。Epic #3585 / PR #3602 で 48 条件全件合格の記録を
  もって終了した際に、final-acceptance.ts の evaluateFinalAcceptance が verdicts:[] や
  grounds:{} の入力で closeAllowed:true を返し、かつ通常処理（close_mechanical_steps.ts 等）
  からの呼出がないことが確認されている（commit 4aca4660 時点）。3 責務を既存の所有工程で
  成立させる: (A) 判定対象の取得 — 終了対象の正規完了条件（Issue 本文の完了条件チェック
  ボックス、Epic の実行構成表、親横断義務）から判定母集団を導出し、実行担当の報告のみで
  母集団を作らない。条件取得失敗 / 必須条件があるのに判定が空 / 正規契約上の条件なしを
  区別する。(B) 証拠評価 — 合格申告は申告扱いとし、部品の成功・条件名一致・対応宣言・回帰
  成功で証明範囲を拡張せず、代替検査は同等以上とする。(C) 終了操作制御 — 必須未達・未確認
  は完了遷移させず issue_close・Epic 終了へ進めず、拒否結果の消費を実経路で行い、不足時は
  記録して修正・再検証へ戻す。契約上の義務は REQ-032-031〜038・REQ-017-021 の既存行で充足
  するため REQ 行の変更は行わず、case-close Design の該当 2 節を受入と終了の実行時接続へ
  整合更新し、実装是正（final-acceptance.ts・close_mechanical_steps.ts・case-close references・
  case-run/case-auto 引継ぎ）と試験を後続工程へ引き継ぐ。新しい品質ゲート・中央判定基盤・
  義務台帳・進捗管理・承認段階は追加しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      判定対象の独立取得（RU-0199、合意済 2026-10-10T22:53）。受入側は終了対象の正規完了条件
      （単一・子 Issue は Issue 本文の完了条件チェックボックス、Epic は Epic Issue の完了条件と
      実行構成表、親横断義務は Epic / Root の最終終了時の評価対象）から判定母集団を導出または
      照合する。実行担当の報告から必須条件を一つ削除しても欠落を検出でき、重複や対象外項目の
      混入で欠落を隠せない。条件の取得失敗、必須条件があるのに判定配列が空、正規契約上の条件
      なしの3状態を区別し、前二者で終了を拒否し、後者は根拠付きで既存契約どおり処遇する。
      空の判定入力を「条件なし」に変換しない。
  - id: AG-002
    content: |
      証拠の成立範囲・意味対応評価。合格申告は申告として扱い、受入担当は正規条件と実行証拠を
      照合する。部品試験の成功、条件ID・名称の一致、対応（トレーサビリティ）宣言、別の回帰
      試験の成功で、当該条件の証明範囲を拡張しない。検証ファイルや対応宣言が存在しても当該
      条件に必要な検証の結果が不合格なら終了しない。意味対応の真偽値を真に設定したことだけを
      証明とせず、判断根拠と証拠の対応を確認できる。代替検査は元の検証義務と同等以上の観測
      能力と未証明範囲の不増を確認する。全体経路の実行を要求される条件に部品試験の成功だけを
      提示した場合、未証明範囲を特定して合格としない。
  - id: AG-003
    content: |
      受入結果による終了操作制御。終了対象の必須完了条件に fail・blocked・未判定・未投影・
      証拠不足・検証不能・意味不一致・未解決反例が 1 件でもあれば完了遷移させず、終了操作
      （issue_close・Epic 終了・Wave クローズ）へ進めない。拒否結果の消費を実際の呼出経路で
      行い、関数の戻り値や規則文だけでは完了証拠としない。親子の評価範囲は REQ-032-038 どおり
      （子は子の必須条件で判定し親横断義務のみで子終了を拒否しない、親の最終終了では未成立の
      横断義務があれば拒否）。不足時は対象・理由・未成立条件を記録して修正・再検証へ戻す。
      必要な証拠が揃い意味対応を確認できる対象は既存経路で自律終了でき、不要な追加承認を
      必須としない。
  - id: AG-004
    content: |
      既存責務内の実現。新しい恒久台帳・品質ゲート・中央判定基盤・進捗管理・承認段階を追加
      せず、既存受入・終了経路（case-close STEP-2 / STEP-5、E1〜E6、final-acceptance.ts、
      close_mechanical_steps.ts、case-run の実行証拠報告、case-auto の wave-gate）の是正で
      成立させる。case-ready の作業分割規則には手を入れない。義務は REQ-032-031〜038・
      REQ-017-021 の既存行で充足し、正規化の必要が判明した場合だけ差分と理由を明示して別途
      検討する。既存の条件や安全境界を黙って緩和しない。
  - id: AG-005
    content: |
      検証原則。管理された検証対象の利用は許容する。外部サービスへの副作用が必要なら既存権限
      と明示された適用範囲を守り、無断の実 Issue 終了は行わない。外部境界を隔離した試験を使う
      場合も、実際の終了処理が使う呼出経路と副作用要求の発行・抑止を観測する。試験専用の別
      判定器の成功を実経路の証明にせず、外部境界だけの試験では適用先の総合実行を実証したと
      扱わない。構造検査・純関数試験・意味評価・実利用経路の検証は証明する範囲を区別し、部品
      の正常出力・試験件数・対応宣言・Issue 終了・PR 統合のみで本件の完了証拠としない。
  - id: AG-006
    content: |
      対象外（RU-0199 対象外を維持）。新しい品質ゲート・中央判定基盤・義務台帳・進捗管理・
      承認段階、case-ready の作業分割規則、元 48 条件・REQ-104〜109 の変更、v5 不足機能の
      実装・v5 全体の再受入・正式切替、finalize 単体ツールへの集中と同ツールの機能改修、
      意味判断の全面機械化・真偽値のみの証明・誤判断の完全防止、過去 Issue / PR の再開・
      書換え、本 RU でのコード差分・実装順序・Issue 分割・特定関数の存続の確定。v5 再受入は
      是正済み経路を使用する別作業として扱う。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: "完了条件単位の最終評価と非循環証拠（REQ-032-031〜038、RU-20261004-08）"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      QG-4 最終完了判定における受け入れ義務保存の実行時投影。

      - 完了条件評価は、実装 diff または case-run の自己申告だけを最終基準とせず、根拠となる正規契約から評価範囲、期待結果、反例条件、許容される除外を導出または照合する。導出の判断方法（決定的処理、閉じた意味評価、開いた推論）は REQ-096 の3分類に従う。
      - 完了条件単位の評価区分 pass / fail / blocked / not applicable を区別する。not applicable は当該条件が評価対象に適用されないことを正規契約から説明できる場合だけ許可し、未投影、未実装、未検証、証拠不足、検証不能、予定変更対象外、実行担当の責務外判断を根拠にしない。適用性判断の根拠を追跡可能に保持する。
      - 各完了条件に対応付けられた証拠がその条件の意味命題を実際に立証していることを確認する。条件ID・名称の一致、テスト名の類似、関連ファイルの検査といった形式的一致だけを達成証拠としない。
      - 「残存0件」「全経路」「すべて整合」「漏れなし」等の全称・不存在条件では、正規契約から導出した評価範囲を対象に反例探索を行う。廃止対象が別名、隠し保存、別経路に残っている状態での「残存0件」を拒否する。
      - Issue closed、PR merged、Child completed、Wave 完了、QG pass、完了条件チェック済み等の工程状態を、成立前提である機能・品質・契約条件の証明へ循環利用しない。ただし工程状態自体が明示的な完了条件である場合は当該条件に限り直接証拠として利用できる。
      - 現在の完了条件を否定する反例 finding を intake、learning、後続 Issue、Findings、別途確認等へ分類しただけでは当該条件を達成扱いにしない。反例を元条件から切り離すには、正規な要件変更、対象範囲変更またはあらかじめ定められた項目固有処置を要する。
      - 合意済み検証方法を別手段へ変更する場合は、元の検証義務に対して同等以上の観測能力と未証明範囲の不増を確認する。runtime または実ホスト・実経路での成立を要求する条件を、同等性未確認の静的構造検査、単体テスト、スタブ結果のみで pass にしない。
      - 終了対象が負う必須完了条件に fail、blocked、未判定、未投影、証拠不足、検証不能、意味不一致、未解決反例が1件でも存在する場合は close せず、必須未達を Gate 全体の warn 等で通過させない。Epic では最終 Wave で親の横断義務を含む Epic 全体の完了条件を評価する。
      - 完了条件から根拠正規契約、検証義務、評価範囲、検証手段、取得した証拠と対象成果物の状態、除外根拠、判定までの主要関係を、既存証拠チャネル（Issue、PR、QG 結果、コメント等）から追跡可能に保持する。追跡不能な「独立検証済み」記録だけでは完全な最終受け入れ証拠としない。
      - 判定対象（母集団）の取得: 受入評価の母集団は終了対象の正規完了条件から導出する。単一・子 Issue は Issue 本文の完了条件チェックボックス、Epic は Epic Issue の完了条件と実行構成表、親横断義務は Epic / Root の最終終了時の評価対象とする。実行担当の報告は母集団の正ではなく正規条件との照合対象であり、報告から必須条件を削除・重複化しても受入側は正規条件から欠落を検出でき、対象外項目の混入で欠落を隠せない。
      - 母集団の空状態の区別: 条件の取得失敗、必須条件が存在するのに判定対象が空、正規契約上の完了条件なしの3状態を区別する。前二者は終了を拒否し、後者は根拠を記録して既存契約どおり処遇する。空の判定入力や grounds の欠如（`grounds: {}` 等）を許可の根拠にしない。
      - 申告と受入の分離: 実行担当の合格申告は申告として扱い、受入側は正規条件と実行証拠を照合して部分証拠または根拠不足の場合は拒否できる。意味対応の真偽値の設定だけを証明とせず、判断根拠と証拠の対応を確認できる。
      - 終了操作への接続: 受入評価の拒否・未確定の結果は、完了遷移と終了操作（STEP-5 の issue_close、E1〜E6 の Epic 終了・Wave クローズ）へ進めない。拒否理由と未成立条件を既存証拠チャネルへ記録し、修正・再検証へ戻す。評価結果の消費は規則文・関数の戻り値ではなく実際の呼出経路で確認する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: "機械工程の script 呼び出し契約（RU-0162）"
    source_items: [AG-001, AG-003, AG-004]
    content: |
      case-close の機械工程（mergeable ポーリング、squash merge 前後のローカル状態検査、Epic 実行構成表の解析と状態更新、完了条件チェックボックス評価の機械的抽出、AUTOGEN 再生成差分検出、full integrity suite の起動と結果集約、worktree/branch クリーンアップ）は、工程別 script 1 回の呼び出しに束ねる。GitHub I/O（pr_merge、issue_close、Issue 本文更新）は Custom Tool agentdev_gh の境界を維持する。

      - 入力 JSON / 報告 JSON / 終了コードの契約、品質ゲートの script 内実行（省略禁止）、final-acceptance.ts・inspect_cross_dependencies.ts と同じ作り（共通基盤不作成）、意味判断（警告の重要度評価、Design 確定判断、未達判定の確定）のモデル担当は、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節と同一の規律に従う
      - 報告 JSON にはマージ・検証・クリーンアップの各結果、差分、警告、提案するコメント本文を含める
      - workflow skill 参照文面は script 呼び出しと報告 JSON 解釈へ置き換えて短縮する
      - 完了条件チェックボックス評価の機械的抽出（close_mechanical_steps.ts の抽出フェーズ）は、受入評価（final-acceptance.ts への入力）の母集団導出を兼ねる。抽出結果（正規完了条件の一覧とその取得成否）を受入評価入力へ渡し、報告 JSON に母集団と判定の対応を含める。抽出失敗は評価の blockers 扱いとし、空の判定入力を「条件なし」へ変換しない
      - final-acceptance.ts（evaluateFinalAcceptance）は完了条件単位評価の機械評価部品として、判定入力（verdicts・crossObligations）の構造検査と必須未達・根拠欠落の検出を担う。証拠の意味対応評価（証拠が条件の意味命題を立証しているか）はモデルが担当し、機械部品の通過だけで完了を確定しない
      - 受入評価の拒否・未確定の結果（closeAllowed 相当の判定とその根拠）は報告 JSON を通じて終了操作の実行抑制として消費される。STEP-5 の issue_close 実行と E1〜E6 の Epic 終了は、受入評価の許可を前提条件として扱い、拒否結果を保持したまま終了操作を実行しない

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0199
    target_design: docs/designs/commands/case-close.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      AC-01・AC-03。正規条件は維持したまま、実行担当の報告の条件を削除・重複・空化する入力と、
      条件の取得失敗の入力を用意し、受入側が正規完了条件（Issue 本文チェックボックス・Epic
      実行構成表・親横断義務）から欠落を検出して終了を拒否することを確認する。正当な条件なし
      （正規契約上の完了条件なし）は既存契約に基づく事例と照合して根拠付きで処遇されることを
      確認する。対象外項目の混入で欠落を隠せないことを確認する。
    pass_criteria: |
      削除・重複・空化・取得失敗の各入力で終了拒否。正規契約上の条件なしは根拠付きで既存契約どおり処遇されること（処遇の許可・拒否を先決めしない）。
    on_failure: |
      fix-and-reverify。
  - id: TS-002
    target_item: AG-002
    verification: |
      AC-02・AC-06。判定や根拠を未入力とする事例、合格申告だけの事例、意味対応の真偽値のみ
      成立済みとした事例で、根拠不足（grounds の欠如・未確認）が受理されず終了しないことを
      確認する。
    pass_criteria: |
      未入力・申告のみ・真偽値のみの各事例で拒否。`grounds: {}` 等の欠落入力を許可の根拠に
      しない。
    on_failure: |
      fix-and-reverify。
  - id: TS-003
    target_item: AG-002
    verification: |
      AC-04・AC-06。利用経路全体の実行が要求される条件に、成功した部品試験のみを渡し、受入
      担当が未証明範囲を記録して拒否することを確認する。特定のコマンド名や外部サービス利用
      を追加要求として混入しないことを確認する。
    pass_criteria: |
      部品試験のみの提示で当該条件は合格とならず、未証明範囲の記録が残る。追加要求の混入なし。
    on_failure: |
      fix-and-reverify。
  - id: TS-004
    target_item: AG-002
    verification: |
      AC-05。検証ファイルと対応宣言が存在する状態で当該条件に必要な検証を失敗させ、拒否を
      確認する。別の回帰試験の成功で当該失敗を相殺しないことを確認する。
    pass_criteria: |
      当該検証失敗時の終了拒否。相殺なし。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-003
    verification: |
      AC-07。TS-001〜TS-004 の拒否入力を既存の受入・終了経路（case-close STEP-2 → STEP-5、
      E1〜E6）へ通し、呼出記録と対象状態から終了操作（issue_close・Epic 終了・Wave クローズ）
      が進まないことを確認する。関数の戻り値や規則文だけではなく、実際の呼出経路と拒否結果の
      消費を確認する。外部境界を隔離した試験を使う場合も、実際の終了処理が使う呼出経路と
      副作用要求の発行・抑止を観測する（AG-005）。
    pass_criteria: |
      拒否入力で対象が完了済みへ遷移しないことの実経路での実証。呼出記録と対象状態の証拠。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-003
    verification: |
      AC-08。子自身の必須条件が成立した子（親横断義務は残る）、横断義務未成立の親の最終終了、
      単一対象の3類型を用い、評価範囲に応じた許可・拒否を確認する。子の終了が親横断義務のみ
      を理由に拒否されず、親の最終終了が未成立の横断義務で拒否されること。
    pass_criteria: |
      3類型それぞれの期待どおりの許可・拒否。単一対象・子対象・親最終終了に同じ不足が残らない。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-003
    verification: |
      AC-09。正常な証拠一式による自律終了と、拒否後の修正・再検証による終了を同じ既存経路で
      確認する。不足で停止した対象が条件・対象状態・証拠の有効性を確認されたうえで修正・
      再検証へ戻れること、不要な追加承認を必須としないことを確認する。
    pass_criteria: |
      正常終了と再検証後終了の双方が同一既存経路で成立。追加承認の強制なし。
    on_failure: |
      fix-and-reverify。
  - id: TS-008
    target_item: AG-004
    verification: |
      AC-10。変更差分と既存契約を照合し、新しい恒久台帳・品質ゲート・中央判定基盤・作業分割
      規則の増設がないことを確認する。変更した原本・正規配布経由の配置物・適用先を区別し、
      適用先の実利用で AC-07〜09 が成立することを確認する（実行環境別原本 → 配置物 → ADF
      適用先）。管理された検証対象の利用は許容、無断の実 Issue 終了なし、試験専用の別判定器の
      成功を実経路の証明にしない（AG-005）。元 48 条件・REQ-104〜109 の変更や v5 全体再受入を
      達成根拠にしない。
    pass_criteria: |
      機構増設 0 件の差分確認。配置物と適用先での AC-07〜09 成立。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: final-acceptance.ts の評価器是正
    responsibility: |
      verdicts:[] （必須条件が存在する母集団での空判定）を許可扱いにしない（現行はループ不回転
      で violations 空となり closeAllowed:true）。母集団情報（条件取得成否・正規条件数）を入力
      に加え、条件取得失敗 / 必須条件があるのに判定空 / 正規契約上の条件なしの3状態を区別する。
      grounds の derivedFromContract 未設定（undefined）や grounds:{} を pass の根拠として
      受理しない。required:true の未達拒否と OK-1〜OK-3（非必須条件の未達は close を拒否しない）
      の現行試験は維持する。母集団の完全性は入力側（close_mechanical_steps.ts の抽出）との
      接続で保証する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts（evaluateFinalAcceptance 148 行目、終了判定 239-244）
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/final-acceptance.test.ts（非必須条件の未達は close を拒否しない現行契約テスト 406-439 は維持）
    intent: AG-001/AG-002 の機械評価部品の是正（AC-01〜AC-05 の部品側）
    verification_refs: [TS-001, TS-002, TS-004]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: close_mechanical_steps.ts と受入評価の接続
    responsibility: |
      完了条件チェックボックス抽出（phase: pre-merge completion-checkbox-extraction）の結果を
      final-acceptance 評価の母集団入力へ渡す経路を作る。抽出失敗は fail-closed（blockers 扱い）
      とし、空の抽出を「条件なし」へ変換しない。報告 JSON に母集団・判定・拒否理由を含める。
      GitHub I/O（issue_close・Issue 本文更新）は agentdev_gh 境界のまま script では実行しない
      （現行契約維持）。文書接続の pin 検査（final-acceptance.test.ts 90-105 行目。STEP-2 reference が
      `scripts/src/final-acceptance.ts`・`evaluateFinalAcceptance` を含むことの pin）は、RA-003 の
      文面更新で pin 文字列を維持して実手順の記述と一致させて保持する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（final-acceptance を import しない現状 22-28 行目の import 群）
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/final-acceptance.test.ts（STEP-2 reference pin 検査 90-105 行目。RA-003 の文面更新は pin 文字列を維持する）
    intent: 母集団導出と評価の実行時接続（AC-01・AC-03・AC-07 の経路側）
    verification_refs: [TS-001, TS-005]
    source_items: [AG-001, AG-003]
  - id: RA-003
    concern: case-close references の手順接続
    responsibility: |
      issue-resolution-and-qg4.md の STEP-2（94・107・116 行目の evaluateFinalAcceptance 参照を
      実手順へ具体化: 母集団導出 → 評価 → 拒否時の進行禁止、3完全性ゲートと QG-4 観点8 は現行
      維持）、epic-wave-close.md の E5-1（Epic Issue 完了条件チェックボックス最終評価）と E6-3
      （親横断義務の Epic 最終終了時評価）の評価範囲規定、cleanup-and-capture.md STEP-5-2 項4
      （issue_close 実行前の受入評価結果確認）を Design 更新（ACT-DESIGN-001/002）と整合させて
      更新する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md
      - src/common/skills/agentdev-workflow-case-close/references/epic-wave-close.md
      - src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md
    intent: 受入評価と終了操作の手順面の接続（AC-07・AC-08）
    verification_refs: [TS-005, TS-006]
    source_items: [AG-003]
  - id: RA-004
    concern: case-run / case-auto 側の実行証拠報告と終了判定の引継ぎ
    responsibility: |
      case-run の実行証拠報告を実行担当の申告と受入側の照合対象として区別する構造に必要な
      範囲で是正する（受入側の母集団は正規完了条件から導入するため、報告は照合入力に限定）。
      case-auto の wave-gate.ts（canCompleteChild / canCloseEpic / obligationDefect
      "unverifiable-verdict"）が実行担当の申告フィールド（ownRequiredConditionsMet）のみで
      なく受入評価結果を消費する接続を、Epic の最終終了と Wave クローズの判定に組み込む。
      子は子の必須条件で判定し、親横断義務は親の最終終了時（E6-3）に評価する評価範囲を維持
      する。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-run/（実行証拠の報告構造）
      - src/common/skills/agentdev-workflow-case-auto/scripts/src/wave-gate.ts（canCompleteChild / canCloseEpic）
    intent: 実行と受入の責務分離と終了判定への反映（AC-06〜AC-09）
    verification_refs: [TS-003, TS-006, TS-007]
    source_items: [AG-002, AG-003]
  - id: RA-005
    concern: 試験の整備（部品試験と実経路試験の分離）
    responsibility: |
      final-acceptance.test.ts に空母集団・grounds 欠落・母集団欠落の拒否事例を追加する（OK-1〜
      OK-3 の現行契約は維持）。拒否入力が既存の終了経路（case-close STEP-5・E1〜E6）へ進まない
      ことの実経路試験（呼出記録・対象状態の観測）を追加する。final-acceptance.test.ts の STEP-2
      reference pin 検査（90-105 行目）を RA-003 の実手順と一致させて維持する。配置物と適用先での
      AC-07〜09 の実証（TS-008）は、正規配布経由の配置物を用いた適用先確認として実施する。
      試験専用の別判定器の成功を実経路証明にしない（AG-005）。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/final-acceptance.test.ts
      - src/common/skills/agentdev-workflow-case-close/scripts/tests/close_mechanical_steps.test.ts
    intent: AC-01〜AC-09 の検証可能性の確保（部品の正常出力・試験件数だけを完了証拠にしない）
    verification_refs: [TS-001, TS-002, TS-005, TS-007, TS-008]
    source_items: [AG-001, AG-002, AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0199
    source_item: adf-acceptance-closure-connection
    disposition: covered
    reason_code: covered_by_existing_req_and_design_update
    reason: |
      RU-0199 の要件化の方向（5 項目）と決定的受け入れ条件 AC-01〜AC-10 をすべて反映した。
      AC-01/AC-03→AG-001+ACT-DESIGN-001 母集団取得・空状態区別+RA-001/RA-002+TS-001、AC-02→
      AG-002+TS-002、AC-04→AG-002+TS-003、AC-05→AG-002+TS-004、AC-06→AG-002/AG-003+RA-004+
      TS-002/TS-003、AC-07→AG-003+ACT-DESIGN-001 終了操作接続+ACT-DESIGN-002+RA-002/RA-003+
      TS-005、AC-08→AG-003（REQ-032-038 の評価範囲）+RA-003/RA-004+TS-006、AC-09→AG-003+
      TS-007、AC-10→AG-004/AG-005+TS-008。契約上の義務は REQ-032-031〜038・REQ-017-021 の
      既存行で充足するため REQ 行の変更を行わない（RU の「必要な実現要件が既存契約に不足すると
      判明した場合だけ正規化を検討」どおり、不足は判明していない）。主対象 Design の
      case-close.md 2 節を受入と終了の実行時接続へ整合更新する。実装（final-acceptance.ts・
      close_mechanical_steps.ts・references・case-run/case-auto・試験）は RA-001〜RA-005 で
      後続工程へ引き継ぐ。対象外（新品質ゲート等・case-ready 分割規則・元 48 条件と REQ-104〜109
      変更・v5 全体再受入・finalize 単体ツール集中・意味判断全面機械化・過去 Issue/PR 再開・
      実装順序確定）は AG-006 で保持。
    evidence:
      path: .agentdev/backlog/req-units/RU-0199.md
      section: 決定的受け入れ条件
      checked_at_commit: 4aca4660f31e85e0246f65fada1f18ad99a349bc
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    単一 OU（OU-001: case-close Design 2 節更新 + final-acceptance.ts / close_mechanical_steps.ts
    の是正と接続 + case-close references・case-run/case-auto 引継ぎ + 試験整備）。bugfix /
    standard / issue_policy single。REQ 行の変更を伴わないため feature 昇格なし。v5 再受入は
    是正済み経路を使用する別作業（本 RU の対象外）。RU 前書きの generation_actor:
    session-supervisor（今回限定承認済み・一般契約改訂なし）は RU 本文の記録をそのまま保持する。
  wave_hints: []
```

# summary

RU-0199（ADF 受入・終了経路の接続是正）を要件化した。work_type は bugfix（REQ 行変更なし・
既存受入・終了経路の是正）、scale は standard。契約上の義務は REQ-032-031〜038・REQ-017-021 の
既存行で充足するため REQ 操作なし（Jev STEP-3 評価一致）。設計は case-close Design の「完了条件
単位の最終評価と非循環証拠」節へ判定対象（母集団）の独立取得・空状態の区別・申告と受入の分離・
終了操作への接続を、「機械工程の script 呼び出し契約」節へ母集団抽出と final-acceptance 評価の
接続・拒否結果の消費を、それぞれ既存文面を維持したうえで追記する形で整合更新する。実装は正
（final-acceptance.ts の空母集団・grounds 欠落の是正、close_mechanical_steps.ts との接続、
references・case-run/case-auto・wave-gate の引継ぎ、部品試験と実経路試験の分離）は
realization_actions RA-001〜RA-005 で後続工程へ引き継ぐ。AC-01〜AC-10 は TS-001〜TS-008 で全対応。
