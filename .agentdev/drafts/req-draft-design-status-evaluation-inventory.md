---
draft_type: req_draft
topic_slug: design-status-evaluation-inventory
status: saved
created_at: 2026-09-10T09:53:21+09:00
source_rus: [RU-0001]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >-
  case-close の Design 確定を申告制から棚卸し制へ拡張し（REQ-032 への APPEND）、
  inspect-docs に実装・検証との整合を評価できる段階に達したにもかかわらず状態評価されない
  draft Design を DRIFT として区別診断する観点を追加する（REQ-036 への APPEND）。
  Decision 状態評価（case-open）と Decision DRIFT 診断は、Decision と REQ の関係を正規情報から
  一意に取得できる情報源の確定を待つ別要件として分離した（ユーザー合意 2026-09-10）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      case-close は PR 本文の Design 確定候補申告の有無に関わらず、当該 Case の対象 REQ に関係する
      draft Design を棚卸しにより列挙し、申告候補と統合して評価対象を確定する。PR 本文の
      Design 確定候補セクションは補助入力へ位置づけ直す。列挙は docs/designs/** の正規成果物
      （ADF-COVERS 宣言と frontmatter status）のみを対象とし、worktree の projection 状態に依存しない。
      列挙結果が 0 件の場合は 0 件であることを確認した上で Design 状態評価を正常完了する
      （RU-0001 受け入れ条件 6、7、12）。
      列挙は ADF-COVERS 宣言による近似列挙であり、宣言を持たない draft Design は列挙から
      漏れ得る（宣言付与は REQ-057-023 の段階的付与契約に従う）。この限界は棚卸し単独の
      完全性保証では埋めず、PR 申告・DRIFT 診断・宣言付与慣行の補完経路で緩和する
      （adversarial-review F1）。
  - id: AG-002
    content: >-
      棚卸しされた各 draft Design は個別に評価し、実装・検証との整合が確認できる場合は
      accepted へ遷移し、当該 Case では確定できない場合は見送り理由と再評価契機を記録する。
      見送りと未評価を区別できる（RU-0001 受け入れ条件 9、10）。
  - id: AG-003
    content: >-
      評価対象に昇格または見送りのいずれの評価結果もない項目が残る場合、case-close を
      完了扱いにしない。候補が複数存在する場合は各 Design を独立して評価する
      （RU-0001 受け入れ条件 8、11）。
  - id: AG-004
    content: >-
      Design 見送り記録（見送り理由・再評価契機）は既存チャネル（case-close の対応記録コメント
      および Design ファイル本体）に保存し、新規の一時成果物種別や新規ドメイン状態を作らない
      （ユーザー合意 2026-09-10。DEC-001 決定4 の7条件立証を不要に保つ根拠）。
  - id: AG-005
    content: >-
      inspect-docs は、単なる draft Design の存在を異常とみなさず、実装・検証との整合を
      評価できる段階に達したにもかかわらず状態評価されないままの draft Design を DRIFT として
      区別診断する。診断は検出・報告のみとし Design の status を直接変更しない。
      経過時間のみを根拠とする既存の draft 放置検出（IR-054）と同一判定を重複保持しない
      （RU-0001 受け入れ条件 15、16、17）。
  - id: AG-006
    content: >-
      case-close の再実行時に、既に accepted へ遷移済みの Design に対して重複する状態遷移や
      記録を生成しない。同一 Case の再実行では、既存の見送り（defer）記録を評価結果として
      認定でき、再評価した場合も重複する見送り記録を生成しない（RU-0001 受け入れ条件 13、
      adversarial-review F5）。
  - id: AG-007
    content: >-
      本要件は Design 状態評価（case-close）と Design DRIFT 診断（inspect-docs）に限定する。
      Decision 状態評価（case-open）と Decision DRIFT 診断は、Decision と REQ の関係を正規情報から
      一意に取得できる情報源の確定（TIM への関係型追加または手動関連REQ表の運用確定）を待つ
      別要件として分離する。本要件の実装によって新しい Decision↔REQ 関係型、TIM 成果物型、
      派生索引が暗黙に追加されない（RU-0001 外部依存・受け入れ条件 18、ユーザー合意 2026-09-10）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-006]
    content: |
      要件テーブルへ追加:
      | REQ-032-024 | case-close は PR 本文の Design 確定候補申告の有無に関わらず、当該 Case の対象 REQ に関係する draft Design を棚卸しにより列挙し、申告候補と統合して評価対象を確定すること。PR 本文の Design 確定候補セクションは補助入力として扱うこと。列挙結果が 0 件の場合は 0 件であることを確認した上で Design 状態評価を正常完了できること |
      | REQ-032-025 | case-close は評価対象の各 draft Design について、実装・検証との整合確認に基づく accepted 昇格または見送り理由と再評価契機の記録のいずれかの評価結果を確定すること。いずれの評価結果もない対象が残る場合、case-close を完了扱いにしないこと。見送り記録は既存チャネル（対応記録コメントおよび Design ファイル本体）に保存し、新規の一時成果物種別や新規ドメイン状態を作らないこと |
      | REQ-032-026 | case-close は Design 状態評価の再実行時に、既に accepted へ遷移済みの Design に対して重複する状態遷移や記録を生成せず、同一 Case の再実行では既存の見送り記録を評価結果として認定して重複する見送り記録を生成しないこと |

      適用範囲の「対象」へ追記:
      - 対象 REQ に関係する draft Design の棚卸しと全件評価（申告候補との統合、見送り記録の既存チャネル保存、再実行時の冪等）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-036.md
    source_items: [AG-005]
    content: |
      要件テーブルへ追加:
      | REQ-036-025 | inspect-docs は、単なる draft Design の存在を異常とみなさず、当該 Design がカバーする要件行を実装・検証した Case が完了済みであるなど実装・検証との整合を評価できる段階に達したにもかかわらず状態評価されないままの draft Design を DRIFT として区別診断できること。診断は検出・報告のみとし Design の status を直接変更しないこと。経過時間のみを根拠とする既存の draft 放置検出（IR-054）と同一判定を重複保持しないこと |

      適用範囲の「対象」へ追記:
      - 実装・検証との整合を評価できる段階に達した draft Design の状態乖離 DRIFT 診断（読み取り限定）

      適用範囲の「対象外」へ追記:
      - Decision 状態評価と Decision の状態乖離診断（Decision と REQ の関係を正規情報から一意に取得できる情報源の確定を待つ別要件）
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: commands
      slug: case-close
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-006]
    content: |
      ## Design 状態評価の棚卸し制（STEP-3 拡張）

      本節の追加に伴い、既存の申告制記述（docs-and-design-promotion.md STEP-3-2 の
      「セクション不存在・空の場合はスキップ」、case-close Design の Design 確定フロー欄の
      PR 本文読取記述、design-lifecycle-application.md の旧昇格条件文言「実装が Design 内容を
      検証済み」）は本契約へ書き換える（adversarial-review F3）。

      ### 棚卸し列挙手順

      1. 当該 Case の対象 REQ を特定する（Issue 本文の REQ 参照から導出。行レベルの導出は
         現行の正規記録先に存在しないため、REQ ファイル単位の近似列挙を許容する。
         行レベルの正規記録先が確定した場合は行レベル判定へ昇格する）（adversarial-review F2）
      2. docs/designs/** の正規成果物から、当該 REQ を ADF-COVERS(implementation) 宣言でカバーし
         frontmatter status が draft の Design を逆算列挙する（projection 配下は対象外）
      3. PR 本文「Design 確定候補」セクションの申告候補を列挙結果へ統合する（重複は 1 件にまとめ、
         二重処理しない）。申告は補助入力であり、申告の不在を理由に棚卸しを省略しない
      4. 列挙結果が 0 件の場合は 0 件確認を記録して Design 状態評価を正常完了する

      列挙の限界: 列挙は ADF-COVERS 宣言に基づく近似であり、宣言を持たない draft Design は
      漏れ得る（宣言付与は REQ-057-023 の段階的付与契約に従い、棚卸しが宣言を要求しない）。
      漏れの補完経路は PR 申告の補助入力、inspect-docs の Design DRIFT 診断、宣言付与慣行の
      継続である。本棚卸しに完全性保証を持たせない（adversarial-review F1）。

      ### 評価と記録

      - 各候補について、当該 Case の実装・検証結果と Design の現在構造との整合を確認し、
         昇格（draft → accepted、designs/README.md status 列の同時更新）または見送りを確定する。
         整合確認の証拠は STEP-3-1（docs 検証・局所確認）の「Design 本文と実装の最終矛盾確認」
         結果に基づき、根拠を対応記録コメントへ残す（adversarial-review F3）
      - 見送り時は見送り理由と再評価契機を対応記録コメントの検証差分へ記録し、Design ファイル本体へ
         最小限の経緯記録を追記する。新規の一時成果物種別・新規ドメイン状態は作らない。
         Design 本体への追記はライフサイクル経緯の最小記録であり、REQ-057-015 が禁止する
         設計内容としての未確定事項・将来計画・判断宣告ではない（整合条項、adversarial-review F6）
      - 見送り（評価実施・確定不可）と未評価（評価未実施）を区別して記録する

      ### 完了ゲートと適用範囲

      - 全候補が昇格または見送りのいずれかの評価結果を持つことを case-close 完了条件へ含める。
         評価結果のない候補が残る場合、単一 Issue ルート（STEP-3）と Epic Wave ルート（E4）の
         両方で完了扱いにしない
      - Epic Wave ルートでは、各子 Issue の棚卸し列挙を Wave 内で集約し、同一 draft Design の
         評価は直列集約段で一元実行する（子 Issue 並列評価による二重評価・競合評価
         〔片昇格と片見送りの混在〕・見送り記録の二重生成を防止する）
         （adversarial-review F4）
      - 再実行時は accepted 済み Design を評価対象から除外し、同一 Case 再実行では既存の
         見送り記録を評価結果として認定して重複する記録を生成しない（adversarial-review F5）
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: skills
      slug: agentdev-doc-diagnostics
    source_items: [AG-005]
    content: |
      ## Design 状態乖離 DRIFT 診断観点

      ### 判定基準

      - 対象要件: draft Design の ADF-COVERS(implementation) 宣言がカバーする REQ
         （Case 特定の粒度は REQ ファイル単位の近似を含む。行レベルの正規記録先が確定した場合は
         行レベル判定へ昇格する。REQ ファイル単位近似は、同一 REQ ファイルの別行実装完了による
         誤報告性格を含むため、finding に近似判定である旨を明示する）（adversarial-review F7）
      - 評価可能段階の到達: 当該 REQ を実装・検証した Case が完了済み（Issue クローズ済みまたは
         PR マージ済み）であること。Case 完了状態の取得源は、ローカル版では .agentdev/issues/ の
         永続ファイル、GitHub 版では Custom Tool 操作契約経由の読み取りとする（診断は読み取りと
         報告のみ）（adversarial-review F7）
      - 乖離条件: 評価可能段階に達しているにもかかわらず当該 Design の frontmatter status が
         draft ままであること。ただし対応記録コメント等に見送り記録（見送り理由・再評価契機）が
         存在する場合は乖離と判定せず、該当記録の文脈（再評価契機を含む）を finding へ添付する
         （adversarial-review F7。この文脈提示が再評価契機の消費者契約となる）
      - 単なる draft の存在は指摘しない。経過時間（frontmatter updated からの日数）を判定根拠に使わない
         （IR-054 の時間ベース放置検出と判定基準を分離する）
      - 適用起点は本診断の実装以降に完了した Case を対象とし、実装前の歴史的完了 Case に遡って
         適用しない（baseline 注記、adversarial-review F7(d) 推奨）

      ### 出力と副作用

      - 検出は DRIFT カテゴリの finding として報告し、推奨アクションは case-close の Design 状態評価
         （棚卸し制）への差し戻しを提示する
      - 診断は読み取りと報告のみとし、Design の status・frontmatter を直接変更しない
      - 本観点は観点レジストリ（REQ-036-024 の正規実体）へ登録する
      - Decision の状態乖離（proposed Decision の受理評価漏れ）は本観点の対象外とし、
         Decision と REQ の関係を正規情報から一意に取得できる情報源の確定後に別要件として追加する

conflict_resolutions:
  - id: CR-001
    conflict: Design 確定の発火を申告制（PR 本文 Design 確定候補）のままにするか、棚卸し制にするか
    resolution: >-
      棚卸し制を採用する。申告は補助入力へ位置づけ直す。PR テンプレートの当該セクションは
      【任意】宣言済み（workflow-templates SKILL.md、pr_desc.md）で位置づけ変更と整合し、
      REQ-057-017（draft Design の昇格判断は QG-4 含む正規工程で実行・記録）を強化する方向である
      （architecture-advisory 確定事項 5、2026-09-10）。
  - id: CR-002
    conflict: Design 見送り記録の保存先（既存チャネル vs 新規専用形式）
    resolution: >-
      既存チャネル（対応記録コメントおよび Design ファイル本体）に限定する（ユーザー合意 2026-09-10）。
      新規の一時成果物種別・新規ドメイン状態を作らないため、DEC-001 決定4 の7条件立証を要しない。
  - id: CR-003
    conflict: Decision 状態評価（case-open）と Decision DRIFT 診断を今回の要件に含めるか
    resolution: >-
      分離する（ユーザー合意 2026-09-10）。Decision と REQ の関係を正規情報から一意に取得できる
      情報源が現行リポジトリに存在しない（TIM は Decision を成果物型に含まない、手動関連REQ表は
      網羅性を機械検証できない）ため、情報源の確定を待つ別要件とする。RU-0001 の外部依存方針
      （独立実施可能な部分まで不必要に拡張しない）に従う（architecture-advisory ブロッカー 1）。
  - id: CR-004
    conflict: Decision 状態評価の発火点を case-open と case-close のどちらに置くか
    resolution: >-
      case-open に置く（RU-0001 改訂で合意済み。Decision の accepted は判断の受理であり実装完了を
      意味しないため実装開始前評価が適切）。ただし本件は別要件へ分離済みであり、本 draft の対象外。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-032
    target_design: docs/designs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-032]
      artifact_actions: [ACT-REQ-001]
      source_ru: [RU-0001]
      unclassified_verification_rows: [REQ-032-024, REQ-032-025, REQ-032-026]
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-036
    target_design: docs/designs/skills/agentdev-doc-diagnostics.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs: [REQ-036]
      artifact_actions: [ACT-REQ-002]
      source_ru: [RU-0001]
      unclassified_verification_rows: [REQ-036-025]

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Design 確定候補申告セクションを持たない PR を伴う完了 Case で case-close を実行し、
      対象 REQ の ADF-COVERS(implementation) 宣言から draft Design が列挙され棚卸しが実行されることを
      実行記録（対応記録コメント）で確認する。列挙が docs/designs/** 正規成果物のみを対象とし
      worktree projection に依存しないことを構造確認する。
    pass_criteria: |
      申告セクションの有無に関わらず棚卸し処理が実行され、列挙結果が評価対象として記録されていること。
      列挙対象が正規成果物の ADF-COVERS 宣言と frontmatter status から導出されていること。
    on_failure: |
      fix-and-reverify。棚卸し実行が申告有無へ依存する実装、または projection 参照する実装は
      修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      PR 本文の Design 確定候補に棚卸し列挙と重複する候補と新規候補が混在する Case で、
      統合後の評価対象が重複なく確定されることを実行記録で確認する。
    pass_criteria: |
      申告候補と棚卸し候補の重複が 1 件にまとめられ、同一 Design が二重処理されないこと。
    on_failure: |
      fix-and-reverify。統合・重複排除の不備は修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      対象 REQ に関係する draft Design が 0 件の Case で case-close を実行する。
    pass_criteria: |
      0 件であることの確認が記録され、Design 状態評価が正常完了として扱われること
      （エラー停止しないこと）。
    on_failure: |
      fix-and-reverify。0 件を異常扱いする実装は修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      関係する draft Design が複数件（2 件以上）存在する Case で case-close を実行し、
      各 Design が独立して評価され、実装・検証との整合が確認できた Design が accepted へ遷移
      （designs/README.md status 列の同時更新を含む）することを確認する。
    pass_criteria: |
      全候補が個別に評価され、整合確認できた Design の frontmatter status と
      designs/README.md status 列が accepted へ更新されていること。
    on_failure: |
      fix-and-reverify。評価漏れ・status 列更新漏れは修正して再検証する。
  - id: TS-005
    target_item: AG-002
    verification: |
      当該 Case では確定できない draft Design を含む Case で case-close を実行し、
      見送り理由と再評価契機が対応記録コメントと Design ファイル本体へ記録されることを確認する。
      新規の一時成果物種別・ドメイン状態が作成されていないことを .agentdev/ の状態で確認する。
    pass_criteria: |
      見送り理由と再評価契機が記録され、見送りと未評価が区別可能であること。
      新規ファイル種別・新規ドメイン状態が作られていないこと。
    on_failure: |
      fix-and-reverify。記録漏れ・新規状態の作出は修正して再検証する。
  - id: TS-006
    target_item: AG-003
    verification: |
      棚卸しで列挙された Design の一部に評価結果がない状態で case-close の完了判定を試行する
      （構造確認または異常系の実行確認）。
    pass_criteria: |
      評価結果のない候補が残る場合、case-close が完了扱いにならず停止または継続扱いとなること。
    on_failure: |
      fix-and-reverify。完了ゲートの抜け穴は修正して再検証する。
  - id: TS-007
    target_item: AG-006
    verification: |
      Design 状態評価実施済みの Case で case-close を再実行する。(a) accepted 済み Design、
      (b) 見送り記録済み Design の双方を含む Case で確認する。
    pass_criteria: |
      (a) 既に accepted の Design に対して重複する状態遷移・承認記録が生成されないこと。
      (b) 既存の見送り記録が評価結果として認定され、重複する見送り記録が生成されないこと。
    on_failure: |
      fix-and-reverify。重複生成は修正して再検証する。
  - id: TS-008
    target_item: AG-005
    verification: |
      (a) 実装・検証済み Case が存在する draft Design と (b) 実装・検証に至っていない draft Design の
      両方が存在するリポジトリ状態で inspect-docs を実行する。
    pass_criteria: |
      (a) のみが DRIFT の finding として報告され、(b) が指摘されないこと。
      経過時間のみを根拠とする判定が混入しないこと（IR-054 と判定基準が分離されていること）。
      診断実行後に Design の status・frontmatter が変化しないこと。
    on_failure: |
      fix-and-reverify。判定基準の混在・誤検出・副作用は修正して再検証する。
  - id: TS-009
    target_item: AG-007
    verification: |
      本要件の実装差分（REQ-032、REQ-036、case-close Design、doc-diagnostics Design、
      関係する配布 skill・template）を確認する。
    pass_criteria: |
      新しい Decision↔REQ 関係型、TIM 成果物型、グラフ・派生索引が追加されていないこと。
      case-open と Decision DRIFT 診断が本実装に含まれていないこと。
    on_failure: |
      fix-and-reverify。対象外の実装混入は除去して再検証する。
  - id: TS-010
    target_item: AG-003
    verification: |
      Epic Wave ルート（E4）で Design 棚卸し契約が適用されることを構造確認する
      （workflow-case-close の Epic Wave クローズ参照と case-close Design の適用範囲記述）。
      加えて、同一 draft Design が 2 つの子 Issue の棚卸し列挙から検出される Wave を構成して
      動作確認する（推奨）。
    pass_criteria: |
      単一 Issue ルートと Epic Wave ルートの双方で同一の棚卸し・全件評価ゲートが適用されること
      （片方のルートだけで省略されないこと）。同一 Design が複数子 Issue から列挙される場合、
      直列集約段で一元評価され、二重評価・競合評価・見送り記録の二重生成が生じないこと。
    on_failure: |
      fix-and-reverify。片ルートのみの適用、または Wave 内統合の不備は契約・実装を修正して再検証する。
  - id: TS-011
    target_item: AG-001
    verification: |
      配布物変更（case-close workflow skill、workflow-templates、doc-diagnostics skill）を含む PR で
      targeted docs guard および配布依存境界の最終 gate を実行する。
    pass_criteria: |
      配布物整合性検査と配布依存境界 gate が failures 0 で通過すること
      （既知 delta の増分がないこと）。
    on_failure: |
      fix-and-reverify。配布物整合の違反は修正して再検証する。

realization_actions:
  - id: RA-001
    concern: case-close の Design 確定フローを棚卸し制へ拡張する
    responsibility: >-
      case-close Workflow Skill の Design 確定フロー（STEP-3-2）について、入力を PR 本文申告から
      「申告 + 対象 REQ に基づく棚卸し列挙の統合」へ拡張する。docs-and-design-promotion.md の
      旧申告制規定（「セクション不存在・空の場合はスキップ」）と design-lifecycle-application.md の
      旧昇格条件文言を新契約へ書き換えることを確定事項とする（ownership_hints の助言ではなく
      実装必須の変更対象）。列挙、統合、全件評価ゲート、見送り記録、冪等除外の実装と、
      単一 Issue ルート・Epic Wave ルート（直列集約段での評価一元化を含む）への双方適用。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-close/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md
      - docs/designs/commands/case-close.md（ACT-DESIGN-001 で設計確定）
      - 正規成果物の ADF-COVERS 宣言解析は agentdev-traceability の能力参照可（fail-open）
    intent: >-
      REQ-032-024〜026 の外部振る舞いを実現する。申告の不在で基盤Design が評価対象から漏れる
      構造を解消する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-007, TS-010]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-006]
  - id: RA-002
    concern: Design 確定候補申告の位置づけを補助入力へ更新する
    responsibility: >-
      workflow-templates（pr_desc.md の Design 確定候補セクション定義、SKILL.md の入力説明）、
      case-run command / adapter の申告記録箇所の記述を「補助入力」へ位置づけ直す。
      テンプレートの構造（セクション名・任意性）は変更しない。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-templates/SKILL.md
      - src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md
      - src/opencode/commands/agentdev/case-run.md
      - src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md
    intent: >-
      申告が棚卸しの発火条件として機能しなくなったことに伴う配布物記述の整合維持。
    verification_refs: [TS-011]
    source_items: [AG-001]
  - id: RA-003
    concern: inspect-docs に Design 状態乖離 DRIFT 診断観点を追加する
    responsibility: >-
      agentdev-doc-diagnostics skill の診断観点（観点レジストリ、diagnostic-categories）へ
      Design 状態乖離 DRIFT を追加する。判定基準（ADF-COVERS 対象 REQ × 完了 Case の組合せ、
      REQ ファイル単位近似、Case 完了状態の取得源指定、見送り記録の文脈提示）、
      IR-054 との判定基準分離、read-only 契約の実装。
    ownership_hints:
      - src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md
      - docs/designs/skills/agentdev-doc-diagnostics.md（ACT-DESIGN-002 で設計確定）
      - 観点レジストリ（REQ-036-024 の正規実体）
    intent: >-
      REQ-036-025 の外部振る舞いを実現する。正規工程（棚卸し制）をすり抜けた状態乖離の
      第二層検出を可能にする。
    verification_refs: [TS-008]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 要件化の方向「Design 状態評価」（受け入れ条件 6〜13）
    disposition: covered
    reason_code: adopted
    reason: >-
      case-close の棚卸し制として REQ-032-024〜026、case-close Design、実現面 RA-001/RA-002 へ
      全面反映した。
    evidence:
      path: .agentdev/drafts/req-draft-design-status-evaluation-inventory.md
      section: agreed_items / artifact_actions / realization_actions
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: 要件化の方向「状態乖離診断」の Design 側（受け入れ条件 15〜17）
    disposition: covered
    reason_code: adopted
    reason: >-
      Design DRIFT 診断として REQ-036-025、doc-diagnostics Design、実現面 RA-003 へ反映した。
    evidence:
      path: .agentdev/drafts/req-draft-design-status-evaluation-inventory.md
      section: agreed_items / artifact_actions / realization_actions
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: 要件化の方向「Decision 状態評価」および「状態乖離診断」の Decision 側（受け入れ条件 1〜5、14）
    disposition: partially_covered
    reason_code: out_of_scope
    reason: >-
      Decision と REQ の関係を正規情報から一意に取得できる情報源の確定を待つ別要件として分離した
      （ユーザー合意 2026-09-10、RU-0001 外部依存、architecture-advisory ブロッカー 1）。
      情報源確定後の要件化で RU-0001 の該当部分を入力として使用する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 外部依存
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: 主対象「REQ-030（case-open 実行契約）」
    disposition: not_applicable
    reason_code: out_of_scope
    reason: >-
      Decision 状態評価の要件化は正規情報源の確定を待つ別要件へ分離したため、本 draft の対象外
      （CR-003、ユーザー合意 2026-09-10）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 主対象REQまたは変更対象候補
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

case-close の Design 確定を申告制から棚卸し制へ拡張し、inspect-docs に Design 状態乖離の DRIFT 診断を追加する。Decision 関連（case-open での状態評価、Decision DRIFT）は正規関係情報源の確定を待つ別要件へ分離した。見送り記録は既存チャネル限定とし、新規成果物種別を作らない。REQ-001 への新規行追加は行わない（状態モデルは既存行が所有、発火点は実行契約 REQ が所有）。

STEP-8 adversarial-review（2026-09-10 実施、独立2 stream・対称的相互反証・convergence audit 付き）の結果: findings 11件（accepted 8件 / rejected 3件）、未解決ユーザー判断事項 0件。accepted findings（列挙の近似性と限界明記、REQ ファイル単位近似の明示、旧申告制文言の書き換え確定、Epic Wave 直列集約段での評価一元化、defer 再実行の冪等拡張、REQ-057-015 整合条項、DRIFT 判定基準の粒度・取得源・見送り文脈提示）をすべて本 draft へ反映済み。軽微な選択点2件（見送り記録の扱い=整合条項方式、Wave 評価の置き場所=直列集約段）は推奨案を採用した。
