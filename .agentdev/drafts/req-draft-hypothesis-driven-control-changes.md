---
draft_type: req_draft
topic_slug: hypothesis-driven-control-changes
status: draft
created_at: "2026-11-19T13:20:00+09:00"
source_rus: [RU-0303]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >-
  RU-0303 に基づき、既存統制の変更・統合・降格・削除を効果の事前実測なしに仮説に基づいて判断・実施できる原則を
  新規 Decision（new:hypothesis-driven-control-changes）として確立する。あわせて DEC-027 の実測必須条項
  （決定1・3・4の該当扱い）と DEC-064 決定4の整合説明を部分置換し、REQ-048 の目的・REQ-048-012・REQ-048-016 を
  整合改訂する。変更後の適合検証義務の維持と未測定改善効果を実証済みと扱わない規律は維持する。
  design-principles Design「0. 実験前提の3原則」原則3の整合説明も更新する。
  重要変更の事前通知（変更理由・変更内容・影響・確定/未確認事項の提示）をドラフト保存前に実施済みである。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      既存統制の変更・統合・降格・削除は、効果の事前実測がなくても判断・実施できる。構造的な冗長性と経験的な冗長性の双方に適用する。
      変更判断では、変更の目的と仮説、対象範囲、維持する条件、問題が判明した際の処置を明確にする。
      数値測定がない場合も、確認済みの事実と推定される効果を区別して判断できる。
  - id: AG-002
    content: |-
      効果の事前実測を不要とすることは、変更後の適合検証を不要とすることを意味しない。
      変更によって影響を受ける正規要件、受け入れ条件、安全上の不変条件について、必要な検証義務を維持する。
      検証範囲は変更内容と要求される結果から導出し、変更の影響と無関係な検査を一律に要求しない。
  - id: AG-003
    content: |-
      測定できる改善効果は、必要に応じて評価材料とする。測定していない改善効果を実証済みと扱わない。
      統制や文書が実際に削減された事実は、その削減結果として確認できる。ただし、処理時間・品質・自律性などへの効果は、
      削減の事実だけから推定して立証済みとしない。
  - id: AG-004
    content: |-
      DEC-027 の部分置換: 改善中心サイクル（決定1）を唯一の必須経路とする扱い、経験的な冗長性の縮小に事前実測を要求する部分
      （決定3）、基準測定（Baseline）と観測結果（Observation）をすべての変更で必須とする扱い（決定4）を新 Decision で置き換える。
      次は維持する: 便益と費用の両面からの評価、構造的・経験的冗長性の区別、独立した主要変更を区別して評価する原則
      （1 experiment = 1 major structural change 等の実験契約を含む）、安全上の不変条件の維持、実測を利用する評価方法、
      新たな恒久統制を安易に追加しない原則。
  - id: AG-005
    content: |-
      DEC-064 の部分置換: 決定4のうち、DEC-027 の実測必須方式を前提とした整合説明を置き換える。
      次は維持する: 測定待ちによる無期限の保留禁止、deferred・blocked 機構そのものの維持、
      測定結果の不存在のみを理由とする統制削除の禁止、移行時の情報保存と検証義務、その他の既存決定。
  - id: AG-006
    content: |-
      REQ-048 の改訂: 目的および REQ-048-012 を中心に、実測がない状態でも変更判断が成立することを明確化する。
      REQ-048-016 について、測定を行わない変更に存在しない指標定義や観測結果を要求しないことを明確化する。
      既存の観測・分析能力、評価軸、統制分類、評価結果の整理能力は維持する。REQ-048-015 は変更しない
      （歴史的比較基準の扱いは別途評価する。RU-0303 Source Summary）。
  - id: AG-007
    content: |-
      変更の仮説、判断根拠、検証結果、必要な撤回条件は、既存の Case・Issue・PR 等の成果物で確認できるようにする。
      本件のための新しい恒久台帳、状態、検査器、品質ゲート、必須の記録様式は追加しない。
  - id: AG-008
    content: |-
      Decision Lifecycle Design の部分置換規則（status 維持、supersede_note による置換対象と維持対象の明記、
      双方向参照整合）に従い部分置換関係を記録する。現行の正規規範・参照関係の整合を確認する
      （design-principles 3原則の整合説明の更新、Decision 索引 AUTOGEN の再生成、AGENTS.md は変更不要の確認を含む）。

artifact_actions:
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:hypothesis-driven-control-changes
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-007, AG-008]
    content: |
      ---
      id: DEC-{NNN}
      title: 仮説に基づく既存統制変更原則
      status: proposed
      created: {保存日}
      updated: {保存日}
      related_reqs: [REQ-048]
      relations:
        - type: supersedes
          target: DEC-027
          reason: 部分置換。決定1のうち改善サイクル（Execute → Observe → Measure → Candidate → Experiment → KEEP / NARROW / MERGE / DOWNGRADE / DELETE）を唯一の必須経路とする扱い、決定3のうち経験的な冗長性の縮小に事前実測（Baseline と Guardrail の設定と実測）を前置きする要求、決定4のうち基準測定（Baseline）と観測結果（Observation）をすべての変更で必須とする扱いに限る置換。決定1のうち機構の追加量を成果としない評価姿勢、決定2（便益と費用の両面からの評価）、決定3前半（構造的・経験的冗長性の区別と、構造的冗長性を性能実験を待たず縮小候補として評価できる扱い）、決定4の実験契約（1 experiment = 1 major structural change、混在禁止）、決定5、決定6は DEC-027 が現行として維持する
        - type: supersedes
          target: DEC-064
          reason: 部分置換。決定4のうち DEC-027 の実測必須方式を前提とした整合説明（「DEC-027 の観測ベース評価ループ（実測してから縮小判断）と矛盾しない」）に限る置換。決定4のその他の内容（測定待ちによる無期限の保留禁止、deferred・blocked 機構そのものの維持、測定結果の不存在のみを理由とする統制削除の禁止、原則3の狭義解釈）と決定1〜3・5は DEC-064 が現行として維持する
        - type: relates-to
          target: DEC-001
          reason: 新規統制追加原則（決定4）と hard governance 8点（決定3）との整合。本 Decision は安全上の不変条件の維持と新規統制の追加抑制を前提とする
      ---

      # 仮説に基づく既存統制変更原則

      ## 決定

      1. 既存統制の変更・統合・降格・削除の判断は、効果の事前実測を必須条件としない。構造的な冗長性と経験的な冗長性の双方に適用する。
      2. 変更判断では、変更の目的と仮説、対象範囲、維持する条件、問題が判明した際の処置を明確にする。数値測定がない場合も、確認済みの事実と推定される効果を区別して判断する。この明確化の要件を満たす変更について、測定結果の不存在のみを理由に、変更の実施を禁止・保留しない。測定結果の不存在のみを理由とする変更（明確化の要件を満たさない変更）は本原則の適用外であり、その取扱いは決定7が DEC-064 の維持文との両立として定める。
      3. 変更後の適合検証の義務は維持する。変更の影響を受ける正規要件、受け入れ条件、安全上の不変条件（DEC-001 決定3）について、必要な検証を変更内容と要求される結果から導出する。変更の影響と無関係な検査を一律に要求しない。
      4. 測定していない改善効果を実証済みと扱わない。統制や文書が実際に削減された事実は、その削減結果として確認できる。ただし、処理時間・品質・自律性などへの効果は、削減の事実だけから推定して立証済みとしない。
      5. 変更の仮説、判断根拠、検証結果、必要な撤回条件は、既存の Case・Issue・PR 等の成果物で確認できるようにする。本原則のための新しい恒久台帳、状態、検査器、品質ゲート、必須の記録様式は追加しない。
      6. DEC-027 のうち、決定1のうち改善中心サイクル（Execute → Observe → Measure → Candidate → Experiment → KEEP / NARROW / MERGE / DOWNGRADE / DELETE）を唯一の必須経路とする扱い、決定3のうち経験的な冗長性の縮小に Baseline と Guardrail の設定と実測を前置きする要求、決定4のうち Baseline・Observation 等の実験構成要素をすべての変更で必須とする扱いを置き換える。決定1のうち機構の追加量を成果としない評価姿勢、決定2（便益と費用の両面からの評価）、決定3前半（構造的・経験的冗長性の区別と、構造的冗長性を性能実験を待たず縮小候補として評価できる扱い）、決定4の実験契約（1 experiment = 1 major structural change、実験構成要素の識別、独立した複数の主要変更の混在禁止）、決定5、決定6は、DEC-027 が現行として維持する。
      7. DEC-064 決定4のうち、DEC-027 の実測必須方式を前提とした整合説明を置き換える。測定待ちによる無期限の保留禁止、deferred 機構（REQ-038-006）と blocked 機構（REQ-120）そのものの維持、測定結果の不存在のみを理由とする統制削除の禁止、移行時の情報保存と検証義務、その他の既存決定は DEC-064 が現行として維持する。本 Decision の決定2が変更判断に仮説と根拠の明確化を要求するため、測定結果の不存在のみを理由とする変更は本原則の適用外であり、DEC-064 の当該維持文と両立する。
      8. 本 Decision は決定6・7に限る後継判断であり、DEC-027・DEC-064 の過去の本文を意味変更して上書きしない。関係は frontmatter relations の supersedes（部分置換）で宣言し、DEC-027・DEC-064 側の frontmatter superseded_by・supersede_note へ後継を記録する（双方向参照整合）。

      ## 背景

      DEC-001 は新規統制の追加を抑制し、安全上の 8 つの不変条件を定めた。DEC-027 は既存統制の縮小評価のため、実行観測・効果測定を中心とした改善方法を採用し、特に品質や自律性に便益を持ち得る機構の冗長性について Baseline と保護条件を設定して実測後に縮小を判断することを要求した。DEC-064 は実験前提の恒久運用原則として測定不能による停滞を排除した。この結果、効果の事前実測が難しい統制については実測できないことが変更判断の障害となり、新規統制の追加には厳格な立証が求められる一方で既存統制の縮小には事前実測を要求する非対称が生じていた。2026-11-19 の利用者との合意（RU-0303）により、既存統制の変更・縮小・削除について事前の効果実測を必須条件とせず、仮説に基づく変更を認める方針を採用した。併せて、既存 Decision を全面的に書き換えるのではなく、新しい Decision によって必要な条項を限定的に置き換える方式を採用した。

      ## 代替案と選択根拠

      1. DEC-027・DEC-064 を全面的に書き換える案 — 却下。accepted Decision は意味的に不変であり、Decision Lifecycle Design の部分置換方式により必要な条項のみを置き換える。
      2. 実測義務のみを削除する案 — 却下。変更後の適合検証義務と未測定効果の立証扱い禁止を定めない場合、未検証の変更を成功と扱ったり、測定していない改善効果を立証済みと扱ったりする余地が残る。

      ## 影響

      - REQ-048 は本 Decision に整合するよう目的・REQ-048-012・REQ-048-016 を改訂する（実測がない状態でも変更判断が成立することの明確化）。
      - DEC-027・DEC-064 は frontmatter（superseded_by・supersede_note）と本文冒頭の部分置換注記により部分置換関係を記録する（status: accepted 維持）。
      - design-principles Design「0. 実験前提の3原則」原則3の整合説明を更新する。
      - docs/decisions/README.md・docs/README.md の Decision 索引（AUTOGEN ブロック）を再生成する（supersede_note 由来の注記と新 Decision 行の反映）。

      ## 関連する決定

      - DEC-001（relates-to）: 憲章。新規統制追加原則・hard governance 8点との整合
      - DEC-027（supersedes・部分置換）: 観測ベース統制縮小評価ループ
      - DEC-064（supersedes・部分置換）: 実験前提の恒久運用原則の採用と移行完了後レガシー資産の扱い境界

      ## 再評価条件

      - 本原則の運用により、安全上の不変条件の維持確認を欠く変更や、未測定効果を立証済みと扱う報告が反復して観測された場合
      - 本原則と DEC-027 の維持条項・DEC-064 の維持条項の適用において、相反する判断を要求する事態が生じた場合

      （採番注記: Decision 番号 DEC-{NNN} は RU-0303 の合意に従い保存時に現行の採番規則で決定する。target: new:hypothesis-driven-control-changes がその指定である）
  - id: ACT-DEC-002
    artifact: decision
    operation: update
    target: docs/decisions/DEC-027.md
    source_items: [AG-004, AG-008]
    content: |
      frontmatter への追加・変更（Decision ファイル管理責務が適用）:
        superseded_by: {新 Decision（new:hypothesis-driven-control-changes、採番時に確定）}
        supersede_note: "決定1のうち改善サイクル（Execute → Observe → Measure → Candidate → Experiment → KEEP / NARROW / MERGE / DOWNGRADE / DELETE）を唯一の必須経路とする扱い、決定3のうち経験的な冗長性の縮小に事前実測（Baseline と Guardrail の設定と実測）を前置きする要求、決定4のうち基準測定（Baseline）と観測結果（Observation）をすべての変更で必須とする扱いは新規 Decision「仮説に基づく既存統制変更原則」が部分置換。決定1のうち機構の追加量を成果としない評価姿勢、決定2（便益と費用の両面からの評価）、決定3前半（構造的・経験的冗長性の区別と、構造的冗長性を性能実験を待たず縮小候補として評価できる扱い）、決定4の実験契約（1 experiment = 1 major structural change、混在禁止）、決定5、決定6は維持（status: accepted 維持）"
        updated: {保存日}

      本文変更（組立検査済み・assembly_evidence ASM-DEC-027-H1）: H1 直後に次の部分置換注記（blockquote）を追加する。

      > 部分置換注記: 本 Decision のうち、改善中心サイクルを唯一の必須経路とする扱い（決定1の一部）、経験的な冗長性の縮小に事前実測を要求する部分（決定3の一部）、基準測定（Baseline）と観測結果（Observation）をすべての変更で必須とする扱い（決定4の一部）は、新規 Decision「仮説に基づく既存統制変更原則」が部分置換する。機構の追加量を成果としない評価姿勢（決定1の残余）、決定2（便益と費用の両面からの評価）、決定3前半（構造的・経験的冗長性の区別と、構造的冗長性を性能実験を待たず縮小候補として評価できる扱い）、決定4の実験契約（1 experiment = 1 major structural change、独立した主要変更の混在禁止）、決定5（安全上の不変条件の維持）、決定6（原則確立への限定、hard 統制点の不新設）は本 Decision が現行として維持する。

      status は accepted を維持する（decision-lifecycle「部分置換では status 維持」準拠）。
  - id: ACT-DEC-003
    artifact: decision
    operation: update
    target: docs/decisions/DEC-064.md
    source_items: [AG-005, AG-008]
    content: |
      frontmatter への追加・変更（Decision ファイル管理責務が適用）:
        superseded_by: {新 Decision（new:hypothesis-driven-control-changes、採番時に確定）}
        supersede_note: "決定4のうち DEC-027 の実測必須方式を前提とした整合説明（「DEC-027 の観測ベース評価ループ（実測してから縮小判断）と矛盾しない」）に限り新規 Decision「仮説に基づく既存統制変更原則」が部分置換。決定4のその他の内容（測定待ちによる無期限の保留禁止、deferred 機構と blocked 機構そのものの維持、測定結果の不存在のみを理由とする統制削除の禁止、原則3の狭義解釈）と決定1〜3・5は維持（status: accepted 維持）"
        updated: {保存日}

      本文変更（組立検査済み・assembly_evidence ASM-DEC-064-H1）: H1 直後に次の部分置換注記（blockquote）を追加する。

      > 部分置換注記: 本 Decision の決定4のうち、DEC-027 の実測必須方式を前提とした整合説明（「DEC-027 の観測ベース評価ループ（実測してから縮小判断）と矛盾しない」）は、新規 Decision「仮説に基づく既存統制変更原則」が部分置換する。決定4のその他の内容（測定待ちによる無期限の保留禁止、deferred 機構と blocked 機構そのものの維持、測定結果の不存在のみを理由とする統制削除の禁止、原則3の狭義解釈）と決定1〜3・5は本 Decision が現行として維持する。

      status は accepted を維持する（decision-lifecycle「部分置換では status 維持」準拠）。
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-048.md
    source_items: [AG-001, AG-002, AG-003, AG-006]
    content: |
      frontmatter 変更（REQ ファイル管理責務が適用）: updated を保存日に更新する。

      （1）目的節 第2段落の置換（4行→4行の等行数更新・REQ-030-030 行区切り保全適合・組立検査済み・assembly_evidence ASM-REQ-048-PURPOSE）。変更後全文:
      ADF の改善では機構の追加量を成果としない。統制・補助機構の変更・統合・降格・削除の判断は、効果の事前実測を必須条件とせず、変更の目的と仮説、対象範囲、維持する条件、問題が判明した際の処置を明確にした上で行えること（仮説に基づく既存統制変更原則）。
      実測を伴う評価では、ADF が既に持つ実行情報と harness 側の生実行履歴を使って各機構の便益・コスト・重複を評価し、Execute → Observe → Measure → Candidate → Experiment →
      KEEP / NARROW / MERGE / DOWNGRADE / DELETE のサイクルで必要十分な control plane へ収束する。
      観測のために導入した施策自身を恒久的必須契約としない。

      （2）REQ-048-012 行の置換（組立検査済み・assembly_evidence ASM-REQ-048-012）。変更後行全文:
      | REQ-048-012 | ADF の統制・補助機構を変更する場合、変更の目的と仮説、対象範囲、維持する条件、問題が判明した際の処置を識別できること。効果の事前実測を変更判断の必須条件としないこと。実測を伴う実験として変更を評価する場合は、Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision を識別でき、独立した複数の主要変更を一つの実験結果へ混在させないこと |

      （3）REQ-048-016 行の置換（組立検査済み・assembly_evidence ASM-REQ-048-016）。変更後行全文:
      | REQ-048-016 | 評価結果は既存の Report、Issue 等の既存成果物へ保存し、候補、Guardrail、判断結果を後から確認できること。測定を行った変更では指標定義と observability gap を後から確認できること。測定を行わない変更に存在しない指標定義や観測結果を要求しないこと。この目的だけの新規成果物種別を追加しないこと |

      （4）変更しない部分: REQ-048-001〜011、REQ-048-013〜015（REQ-048-015 を含む）、適用範囲セクション、目的節の第1・第3段落は現行を維持する。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/design-principles.md
    target_area: "## 0. 実験前提の3原則（最上位ルール）"
    source_items: [AG-008]
    content: |
      ## 0. 実験前提の3原則（最上位ルール）

      本 Design のすべての節に先行する最上位ルールとして、実験前提の3原則を定める。判断根拠と採用判断の正は Decision が所有し、本節は現行設計としての3原則を記述する。本節は他の原則（work_type 分類、要件と仕様の分離等）と矛盾する場合に優先する。

      1. 実験・ロールバック許容: 本リポジトリの変更は実験として扱い、Git 履歴による復元でロールバックに対応する。対照表・バックアップ資産などの防衛的恒久資産の維持を移行・整理の前提条件としない。
      2. 後方互換性の完全破棄: 旧表記・旧パス・旧契約への移行補助層（crosswalk、Baseline、マイグレーションスクリプト）を恒久資産として維持せず、LLM/スクリプトによる一括直接修正を標準手段とする。履歴性は Git 履歴で担保する。
      3. 測定不能による停滞排除: 再評価条件が実測不能・確定不能のままの保留（測定待ち）を禁止し、測定待ち案件は「仮説の即時導入」または「完全削除」の二択で即決する。完全削除処分は処分理由の明示をもって決済記録とする。deferred 機構（REQ-038-006）と blocked 機構（REQ-120）そのものは存続させ、「測定待ちを理由とする保留」のみを禁止する（狭義解釈）。本原則は、既存統制の変更判断に関する現行規範（DEC-027 の維持条項、および仮説に基づく既存統制変更原則〔事前実測を必須条件としない変更判断〕）と矛盾しない。

      組立時確定の注記（CR-004）: 入力計画が前提した「1. ゼロベース原則」節は現行ファイルに存在しないため（ゼロベース原則は retired REQ-020 由来）、本節は新設として扱う。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      DEC-027 の実測必須条項（決定1・3・4の適用）と DEC-064 原則3（測定不能停滞の排除・仮説の即時導入）の間で、
      効果実測が困難な既存統制の変更判断が停滞する非対称が存在した（RU-0303 問題1・2）。
    resolution: >-
      新 Decision「仮説に基づく既存統制変更原則」による部分置換で解消する。事前実測を一律の許可条件とせず、
      仮説・対象範囲・維持条件・撤回条件の明確化を変更判断要件とする。変更後の適合検証義務と未測定効果の
      立証扱い禁止は維持する（RU-0303 Source Summary・要件化の方向 6.1〜6.3 の合意に基づく）。
  - id: CR-002
    conflict: >-
      実測必須の解除が「未検証の変更の成功扱い」や「安全条件の検証省略」を許す解釈を生む余地（RU-0303 問題5）。
    resolution: >-
      新 Decision の決定3（変更後の適合検証義務の維持）と決定4（未測定効果を実証済みと扱わない）で明示的に区別する。
      REQ-048-012 は撤回条件（問題が判明した際の処置）の識別をすべての変更に要求し、REQ-048-016 は候補・Guardrail・
      判断結果の保存確認をすべての変更に適用する文言とする。
  - id: CR-003
    conflict: >-
      DEC-064 決定4維持文「測定がないことのみを削除理由とする広義解釈は採用しない」と新原則「削除を含む変更の
      事前実測不要」の両立表現の選択（architecture-advisory ユーザー確認事項 UC-1）。
    resolution: >-
      新 Decision の決定2（変更判断における仮説・対象範囲・維持条件・処置の明確化要求）により、測定結果の
      不存在のみを理由とする変更は本原則の適用外となる方式で両立する。RU-0303 Source Summary
      「変更の仮説、安全上の制約、撤回条件を明確にして実施する」の合意から導出した採用判断である。
      新 Decision 決定7に両立宣言を明記する。維持文へ測定待ち停滞排除の文脈限定注記を付す代替案は、
      RU-0303 が維持対象とした条項を弱化するリスクのため採用しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0303
    target_req: REQ-048
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
      新 Decision（決定2の明確化要件とその適用範囲、決定7 の適用外宣言を含む）、DEC-027・DEC-064 の有効条項（frontmatter supersede_note・本文部分置換注記適用後）、REQ-048（目的・REQ-048-012 適用後）を照合する。基準測定・効果実測がなく、変更の仮説、対象範囲、維持条件、撤回条件が明確な変更事例を想定し、正規規範上、変更判断が認められることを確認する。あわせて、経験的な冗長性について基準測定が未実施という理由だけで縮小を禁止・保留する有効規定が残っていないことを、機械的検索（rg）で確認する。検索対象は docs/requirements、docs/decisions、docs/designs とし、docs/reports/ は履歴記録領域として対象外、See Also 等の参照行は検出対象外とする。機械検索の判定は次の既知ヒット裁定表に従う: (1) DEC-027 決定3後半「Baseline と Guardrail を設定して実測してから縮小判断する」は本文に残存するが supersede_note・本文部分置換注記で被覆された無効条項として除外する（有効性フィルタ: frontmatter supersede_note または本文部分置換注記で被覆される条項は有効規定から除外する）、(2) DEC-064 決定4維持文「測定がないことのみを削除理由とする広義解釈は採用しない」は期待ヒットであり、新 Decision 決定2の明確化要件と決定7 の適用外方式により両立済みの維持条項として「実測不存在のみを理由とする変更の禁止・保留」に該当しない（削除理由の限定であって変更の一律禁止条件ではない）、(3) REQ-048-015 の Legacy Baseline は歴史的比較基準の保持条項として対象外。裁定表にない新規ヒットのみを残留規定候補として扱う。
    pass_criteria: |
      実測の不存在だけを理由に、変更の実施を禁止・保留する条件が残っていないこと（RU-0303 AC-01 合格基準）。
    on_failure: |
      fix-and-reverify。残留規定を特定し、新 Decision の置換範囲・supersede_note・REQ-048 改訂文言のいずれかに反映して再照合する（修正可能な規範不備のため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      新 Decision の決定3と REQ-048 の変更内容を、DEC-001 決定3の 8 つの安全上の不変条件、既存の受け入れ条件・検証義務と照合する。安全条件に関わる機構の変更を想定し、変更後の保護目的が未確認の場合に完了扱いできないことを、次の規範アンカーの照合から判定する: 新 Decision 決定3（変更後の適合検証の義務維持と、検証範囲の変更内容・要求される結果からの導出）、DEC-056（検証不足時の成功宣言禁止。DEC-064 決定5 により本原則と同方向）、QG モデル（Gate は状態遷移 predicate であり検証完了を完了扱いの条件として要求）。
    pass_criteria: |
      効果測定の省略を根拠として、安全条件・正規要件への適合検証を省略できる規定が存在しないこと（RU-0303 AC-02 合格基準）。保護目的が未確認の安全条件関連変更を完了扱いできないことを、上記アンカー条項の照合から判定できること。
    on_failure: |
      fix-and-reverify。検証義務を弱める文言を特定し、新 Decision・REQ-048 改訂文言を修正して再照合する。
  - id: TS-003
    target_item: AG-003
    verification: |
      処理時間・トークン消費の測定を行わずに機構を削減した事例を想定し、正規規範（新 Decision 決定4・REQ-048-016 適用後）に従った結果報告が可能か確認する。機構の削減自体は確認済みと報告でき、測定していない性能・品質・自律性への効果は未確認として扱えることを確認する。
    pass_criteria: |
      機構の削減自体は確認済みと報告できる一方、測定していない性能・品質・自律性への効果は未確認として扱う規定が新 Decision と REQ-048 に存在すること（RU-0303 AC-03 合格基準）。
    on_failure: |
      fix-and-reverify。報告様式・規定の不足を特定し、新 Decision 決定4または REQ-048-016 文言を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      Decision Lifecycle Design の部分置換規則に従い、後継 Decision の関係宣言（relations supersedes）、旧 Decision の部分置換記録（superseded_by・supersede_note、置換対象と維持対象の明記）、本文冒頭注記を照合する。新旧 Decision の相互参照（新 Decision relations supersedes と旧 Decision superseded_by）と正規文書の索引（docs/decisions/README.md・docs/README.md の Decision 系 AUTOGEN ブロック再生成後）を確認する。
    pass_criteria: |
      DEC-027・DEC-064 の置換対象が具体的に特定されていること。置換されない条項は有効なまま維持されていること。旧 Decision から新しい有効規定へ到達できること。部分置換を全面廃止と誤認させる状態がないこと（status: accepted 維持）。実測必須に関する相反する有効規定が残っていないこと（RU-0303 AC-04 合格基準）。DEC-064 決定4維持文（測定結果の不存在のみを理由とする統制削除の禁止）は新 Decision 決定2の明確化要件・決定7 の適用外方式により両立しており、相反規定に該当しないことを照合に含める。
    on_failure: |
      fix-and-reverify。frontmatter・注記・索引の不備を特定し、修正して再照合する（AUTOGEN 再生成の漏れは generate_indexes.ts 再実行で解消する）。
  - id: TS-005
    target_item: AG-006
    verification: |
      REQ-048 の改訂前後を比較（git diff）し、変更対象以外の要件行と目的の維持状況を確認する。特に、実行相関情報（REQ-048-001〜005）、評価軸（REQ-048-006〜007、009〜011）、REQ-048-015、DEC-001 の安全条件を照合する。docs/reports/ 配下の過去の実験報告が変更されていないことを確認する。
    pass_criteria: |
      今回変更する実測必須条件以外の既存能力・義務が維持され、過去の実験報告の履歴内容が変更されていないこと（RU-0303 AC-05 合格基準）。REQ-048-012 の改訂後も実験契約（実験構成要素の識別、混在禁止）と撤回条件識別が維持されていること。
    on_failure: |
      fix-and-reverify。意図しない弱化・削除を特定し、REQ-048 改訂文言を修正して再比較する。
  - id: TS-006
    target_item: AG-007
    verification: |
      変更前後の正規契約と変更された成果物を比較し、本件に由来する新規の恒久台帳、状態、検査器、品質ゲート、全変更共通の追加承認工程がないことを確認する。新 Decision のみが追加され、実行時の追加機構・一律の追加工程を要求しないことを確認する。
    pass_criteria: |
      新たに追加される恒久的な判断規範は新 Decision に収まり、実行時の追加機構・一律の追加工程を要求しないこと（RU-0303 AC-06 合格基準）。
    on_failure: |
      fix-and-reverify。追加機構・工程を特定し、新 Decision 本文と artifact_actions から除去して再確認する。
  - id: TS-007
    target_item: AG-008
    verification: |
      変更した文書・参照に関係する既存の機械的整合検査を実行する。Decision frontmatter 形式（id・status・relations・superseded_by・supersede_note）、REQ/Decision の ID とファイル名整合、README 索引（Decision 系 AUTOGEN ブロック）の再生成と鮮度、REQ-048 の ADF-COVERS 宣言を持つ Design（agentdev-workflow-templates.md 等）の covers 対応、delegation-contracts.md の REQ-048-012 参照文言（field 集合の変更は REQ-048-012 の実験契約に従い）が改訂後 REQ-048-012 と意味整合することを確認する（実験契約が「実測を伴う実験として変更を評価する場合」に条件化されたことが参照経由で届くこと。参照文言自体の書き換えは不要）。
    pass_criteria: |
      変更に由来する違反が 0 件であること（既存違反は除外して報告する）。RU-0303 検証範囲 6「変更した文書・参照に関係する既存の機械的整合検査」に対応する。
    on_failure: |
      fix-and-reverify。違反を特定し、該当文書（frontmatter・索引・参照文言）を修正して再実行する。

realization_actions:
  - id: RA-001
    concern: Decision 追加・部分置換に伴う索引・参照整合の反映
    responsibility: >-
      新 Decision の追加と DEC-027・DEC-064 の frontmatter 変更（superseded_by・supersede_note）に伴い、
      docs/decisions/README.md・docs/README.md の Decision 索引（AUTOGEN ブロック）を generate_indexes.ts で
      再生成し、新 Decision 行を反映する。注記生成は非対称であり、docs/README.md の decision サマリ表は
      status にかかわらず superseded_by + supersede_note 由来の注記を生成する一方、docs/decisions/README.md の
      status 表・superseded セクションは status: superseded の行にのみ注記を生成する（generate_indexes.ts の
      status-gated 仕様。accepted 維持の部分置換前例 DEC-028・DEC-036・DEC-045 と同じ挙動）。DEC-027・DEC-064 は
      status: accepted 維持のため docs/decisions/README.md の該当行に注記が現れないことは期待どおりの動作であり、
      generator 不具合でも AUTOGEN ブロック人手編集の対象でもない。AGENTS.md は変更不要である
      （3原則本文に DEC-027 整合説明を含まないことを機械確認済み。design-principles 節0 の更新で参照経由で追随する）。
    ownership_hints:
      - "docs/designs/integrity/index-auto-generation.md（索引類自動生成 Design。superseded_by + supersede_note 由来の注記生成規則 L200-203）"
      - "generate_indexes.ts（索引再生成スクリプト）"
      - "REQ-059（Decision と REQ の関連宣言管理）"
      - "REQ-048 の ADF-COVERS 宣言を持つ Design（docs/designs/skills/agentdev-workflow-templates.md、docs/designs/workflows/delegation-contracts.md の参照文言確認）"
    intent: >-
      部分置換関係の正規参照到達性（RU-0303 AC-04）と機械的整合検査（索引鮮度・ID 整合・covers 対応）の維持。
      手動文言修正ではなく AUTOGEN 再生成による反映が契約上の正経路である。
    verification_refs: [TS-004, TS-007]
    source_items: [AG-008]

review_dispositions:
  - id: RD-001
    source_ru: RU-0303
    source_item: RU-0303-all
    disposition: covered
    reason_code: fully_adopted
    reason: |
      RU-0303 の合意内容を本 draft に反転・弱化・省略なく反映した。要件化の方向 6.1〜6.7 は AG-001〜AG-007 に、
      対象（部分置換関係の記録、正規規範・参照関係の整合確認）は AG-008・RA-001 に、対象外（個別統制の実際の削減、
      観測能力の撤廃、REQ-048-015 の廃止、過去の実験報告の書き換え、安全上の不変条件の変更、公開コマンド・工程の
      統合削除等）は test_strategy（TS-005・TS-006）と ACT-REQ-001 の変更しない部分の明記で担保した。
      REQ-048-015 の扱いは「変更しない」と Source Summary の「別途評価」を両立する形で AG-006 に反映した。
      後続への引き継ぎの優先候補（旧版移行整理、公開コマンド統合削減、工程内重複判断削減、検証基盤運用負荷最適化）は
      本件では自動承認扱いとせず、RU-0303 第10節の記載のみを参照先として残す。
    evidence:
      path: .agentdev/backlog/req-units/RU-0303.md
      section: null
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-048.md
    target_content_sha256: 38865d892b130f38ef19ae368cb4430d80189b1f0f7424ac27263291089f8b48
    check_scope: { heading: "## 目的", start_line: 8, end_line: 21 }
    execution_conditions: { operation: replace, edit_sha256: 7414bb4fef14873522cae95297d7676096609edd64987e12409ee7fa52f0899b, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 2 }
    executed_at: "2026-11-19T05:41:42.287Z"
  - target_file: docs/requirements/REQ-048.md
    target_content_sha256: 38865d892b130f38ef19ae368cb4430d80189b1f0f7424ac27263291089f8b48
    check_scope: { heading: "## 要件", start_line: 22, end_line: 42 }
    execution_conditions: { operation: replace, edit_sha256: 1ecc81acb80a8f93c691c931a44bff4484123a24f6a67b6d114f562ca6cfaea6, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-19T04:12:55.990Z"
  - target_file: docs/requirements/REQ-048.md
    target_content_sha256: 38865d892b130f38ef19ae368cb4430d80189b1f0f7424ac27263291089f8b48
    check_scope: { heading: "## 要件", start_line: 22, end_line: 42 }
    execution_conditions: { operation: replace, edit_sha256: 55d72cdd4204faf749f4f0abc983efb59cf202696c7b03d1b749e9ee365ab0fb, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-19T04:13:32.873Z"
  - target_file: docs/decisions/DEC-027.md
    target_content_sha256: 663e9e8c10e90caa130a15087dff49c953440809dcb00402ce79cad48d5091d0
    check_scope: { heading: "# 観測ベース統制縮小評価ループ", start_line: 10, end_line: 59 }
    execution_conditions: { operation: replace, edit_sha256: 959670aa39d8af86ffdb9128669538b1e9215f64b84b7628850239e84c5db1aa, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-11-19T04:47:04.274Z"
  - target_file: docs/decisions/DEC-064.md
    target_content_sha256: 9bfc4e3989db714edc325fc5e9375a86d008dc0d2fbcf1a77baed71040ae10d3
    check_scope: { heading: "# Decision: 実験前提の恒久運用原則の採用と移行完了後レガシー資産の扱い境界", start_line: 10, end_line: 55 }
    execution_conditions: { operation: replace, edit_sha256: d33db3cb0180db9097f603169ccb2f2f660005a8977fa8c253f484420423cecc, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-11-19T04:15:23.319Z"
  - target_file: docs/designs/foundations/design-principles.md
    target_content_sha256: e2e7e2b12d20ce1611b1f56ea026cf698f1ceee529acafdc6d9f69a75cc78e3e
    check_scope: { heading: "## 0. 実験前提の3原則（最上位ルール）", start_line: 24, end_line: 35 }
    execution_conditions: { operation: replace, edit_sha256: 91406d0f819ce6a00fc4c27cd37f3262afb7271ce6efbedbefc7e83891541949, expected_old_count: 1 }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-19T04:15:23.412Z"

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0303（仮説に基づく既存統制変更原則の確立と実測必須条件の解除）を要件化した draft である。新規 Decision の作成、DEC-027・DEC-064 の部分置換（status: accepted 維持・supersede_note 記録）、REQ-048 の整合改訂（目的・REQ-048-012・REQ-048-016、REQ-048-015 は不変）、design-principles 3原則の整合説明更新からなる。変更後の適合検証義務と未測定効果の立証扱い禁止は維持する。実行経路は feature・standard・単一 Issue 構成を想定する（Issue 階層は case-open が決定する）。

既存REQ照合は Jev 先行評価を適用した（観測 20261119T035244Z-6a97、最終判断 UPDATE・追加確認不要・単一帰属）。要件展開の最終分類・Design 分離にも Jev を適用した（観測 20261119T035720Z-7c8b、REQ行・Decision操作・Design行帰属および design-principles 整合更新の Design 分離）。architecture-advisory の助言（確定事項・推定事項・ユーザー確認事項 UC-1・ブロッカーなし）を分類して採用し、UC-1 は RU 合意からの導出として CR-003 に記録した。

STEP-8 adversarial-review（独立2 stream・convergence audit 実施）の accepted finding を反映した: (1) DEC-027 置換範囲宣言の条文レベル精密化（決定1残余「機構の追加量を成果としない評価姿勢」と決定3前半「構造的冗長性を性能実験を待たず縮小候補として評価できる扱い」を維持列挙に明示。relations・決定6・supersede_note・本文注記の4箇所で統一）、(2) 新 Decision 決定2第3文への明確化要件に基づく適用範囲限定（決定7 の適用外宣言との接続を条文上完結。CR-003 方式の具体化）、(3) TS-001 への既知ヒット裁定表（DEC-064 維持文の両立扱い・注記被覆条項の有効性フィルタ・REQ-048-015 対象外）と照合対象への DEC-064 追加、(4) TS-002 への規範アンカー明記（決定3・DEC-056 検証不足時の成功宣言禁止・QG モデル）、(5) TS-004 への DEC-064 維持文両立確認の明記、(6) TS-007 への delegation-contracts 参照の意味整合確認への精密化、(7) RA-001 への注記生成非対称性（generate_indexes.ts の status-gated 仕様）の明記。partially accepted（反証により本文変更不要）: delegation-contracts.md の REQ-048-012 参照は参照先改訂による条件化が参照経由で届くため Design 側の書き換え不要。assembly_evidence の target_content_sha256 は各編集の独立検査時点における対象ファイル本文のハッシュであり、REQ-048 への3編集が同一値なのは同一現行ファイルを基準とした独立検査のため（連続適用の記録ではない）。ACT-DESIGN-001 content 内の「組立時確定の注記（CR-004）」は現行 design-principles.md 既存注記（前回変更時の整理番号）の verbatim 保存であり、本 draft の conflict_resolutions（CR-001〜003）とは無関係である。unresolved なユーザー判断事項は残っていない。

Case #4162（case-open STEP-4 機械工程）の行構造事前確認（REQ-030-030・fail-closed）による拒否（ACT-REQ-001(1) の置換後全文が旧文4行に対し3行の行統合構成）を受け、停止記録（.agentdev/blocked/case-4162-stage1-stop.md）の再開入口1として ACT-REQ-001(1) を意味維持の行保全4行構成（4行→4行の等行数更新）へ再組立した。調整は行の折返し位置のみであり、文言の変更・省略・追加は行っていない（改行を除去した文字列の完全同一を機械確認済み・318文字）。assembly_evidence を再取得した（ASM-REQ-048-PURPOSE・edit_sha256 更新）。RU-0303 の合意内容・AC-01〜06、他の artifact_actions・agreed_items・test_strategy・conflict_resolutions は一切変更していない。
