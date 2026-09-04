---
draft_type: req_draft
topic_slug: req-048-rebuild-self-shrink
status: saved
created_at: 2026-09-04T23:08:21+09:00
source_rus: []
---

<!-- req-define 完了 draft（STEP-1〜11 完了。adversarial-review 反映済み） -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  REQ-048 を「第1次改善の実装方式を守る要件」から「ADF 自身を観測・評価し必要十分な制御系へ
  縮小できる最小観測・評価要件」へ全面再構築する（21行→16行）。新規 Decision「観測ベース統制縮小評価
  ループ」の作成、anti-shrink 契約の分解廃止（契約テスト2本の能力検証への再構成）、correlation field の
  structural redundancy 縮小（derivability 監査→最小相関実装）、Legacy Baseline の位置づけ明確化と
  Baseline V2 定義・測定、実験 G1〜G4 の定義を含む。横断 Design 5セクション（workflow-contracts 3、
  delegation-contracts 1、workflow-templates 1）の安定契約原則更新を伴う。本 Case は通常Caseとし、
  WP-09 実験群は実証Case候補として後続実行する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-048 を「第1次改善の実装方式を守る要件」から「ADF 自身を評価し縮小可能にする最小観測・評価要件」へ
      再構築する。新しい目的は「ADF の自己ホスト実行を観測し、品質、自律性、安全性を維持しながら、ADF が持つ
      統制・補助機構の便益と実行コストを比較し、必要十分な制御系へ縮小・統合できるための最小観測・評価契約を
      定める」ことである。structured handoff、source/projection handoff、finding 5分類、review構成、
      verification構成、subagent構成、並列度等の具体方式は、他の正規要件が所有する不変条件を除き、REQ-048
      自体では恒久方式として固定しない。再構築後の semantic target は RU 記載の REQ-048-001〜016
      （最小相関情報、機械判別可能性、harness raw telemetry の正規所有、observability gap の扱い、
      Observation Tax の最小化、評価軸、Efficiency、Quality/incremental value、Autonomy、
      Control/Coordination Cost、機構分類、実験契約、縮小判断、具体方式を観測対象へ戻す、baseline の扱い、
      評価結果の保存）とし、リポジトリの要件文書規範に合わせた文言調整は可能とする。
  - id: AG-002
    content: |
      本 Case は通常Caseとする（実証Caseとしない）。REQ-048 再構築・anti-shrink テスト契約の再構成・
      structural redundancy 縮小（WP-01〜06）は決定的な成果物変更であり、本 Case 自体の採否判断に
      実行・測定を要しない。WP-09 の各 experiment（G1: Verification Diff 縮小、G2: Structured Handoff 縮小、
      G3: source/projection 再参照の縮小、G4: Review/Verification の条件付き化）は再構築後 REQ-048 の
      評価契約（REQ-048-012）に従う後続の個別実証（実証Case候補）として扱う。WP-07 Baseline V2 実測は
      約30〜50 execution units の蓄積を要するため、本要件の完了条件は「Baseline V2 測定結果、または
      測定可能状態と observability gap の整備」までとする。
  - id: AG-003
    content: |
      RU 全体（WP-01〜WP-10）を1つの要件doc にまとめる。operation_units は Work Package ベースで構成し、
      depends_on は RU §10 の依存チェーン（WP-01→WP-02→…→WP-05→WP-06→WP-07→WP-08→WP-09-1→
      WP-09-2→WP-09-3→WP-09-4→WP-10）に従う。WP-09 の実験は同一 baseline へ複数変更を混在させない
      ため直列とする。Issue 階層・Epic/Wave 構成の決定は case-open に委譲する。
  - id: AG-004
    content: |
      新規 Decision「観測ベース統制縮小評価ループ」を作成する。原則の確立に限定し、改善中心サイクル
      （Execute → Observe → Measure → Candidate → Experiment → KEEP / NARROW / MERGE / DOWNGRADE / DELETE、
      機構の追加量を成果としない）、Benefit / Cost の対比較、structural redundancy（導出可能、実験不要の
      縮小候補）と empirical redundancy（Baseline / Guardrail 実験を要する）の分離、1 experiment = 1 major
      structural change、Safety invariant は「機構」ではなく「不変条件」の維持を評価対象とする各原則を所有する。
      hard 統制点（工程停止条件）を新設しない。評価軸・指標・機構分類の定義は REQ-048 が、実験の登録形式・
      測定手続きは Design が所有する。relates-to DEC-001（決定4「新規統制追加原則」の縮小側補完、
      supersede しない）。2026-09-04 ユーザー確定（アーキテクチャ助言: DEC-024 型を推奨、決定4は追加側のみ
      支配し縮小側の恒久手続きが憲章に不在のため）。
  - id: AG-005
    content: |
      旧 REQ-048-019 と契約テスト2本（execution_ident_contract.test.ts、verification_diff_contract.test.ts）の
      anti-shrink 契約を分解廃止する。BASELINE_REQUIRED_SECTIONS、PR_BASELINE_REQUIRED_SECTIONS、
      「既存必須セクションの削減なし」describe を削除する。機械判別可能性、harness 識別子の必須化禁止
      （FORBIDDEN_REQUIRED_KEYS）、識別情報欠落時の N/A 記録と非停止の構造 assertion は新行 REQ-048-001〜004
      準拠で残存する。adf_* field 集合と finding 5分類の集合ピン留めは「Design 現行セットとの一致検査」へ
      格下げし、REQ-048-012 の実験契約に従う変更を妨げない。テストは「過去に追加した構造が残っていること」
      ではなく新要件の意図（必要な相関・finding 比較能力の成立）を検証する。既知 RED 2件（Issue #2569、
      issue_desc_epic.md と issue_desc_child.md の配布物内部 ID 混入）は同 wave で解消する。
  - id: AG-006
    content: |
      correlation field（adf_case、adf_phase、adf_execution_unit、adf_upstream_confirmed、adf_pr、adf_delegation、
      adf_result、任意 adf_harness_ref、委譲 <delegation-ident> ブロックの adf_delegation_id / purpose / parent /
      child）について、derivability table（canonical_owner、why_needed、can_derive、derive_from、extra_write、
      extra_read、cross-artifact join value、runtime_dependency、safety_dependency、decision）を作成する。
      特に PR 本文 adf_pr（自己参照 backfill）、adf_result（生成経路で completed-pr 固定の疑い）、adf_child
      （adf_delegation_id と同値の疑い）、adf_phase（artifact type から導出可能の疑い）、adf_upstream_confirmed
      （context handoff 情報であり correlation ではない疑い）、adf_case / adf_execution_unit（Standard / Epic
      flow の artifact relation から導出可能な範囲）を検証する。structural redundancy の縮小実行条件は
      (1) canonical 成果物関係から一意に導出できる、(2) 現行 runtime / downstream が明示値へ依存しないまたは
      canonical derivation へ置換できる、(3) hard governance 不変条件を失わない、(4) correlation capability を
      失わない、(5) テストを「重複 field の存在確認」から「必要な相関が成立すること」へ変更できる、の全条件
      成立である。縮小時は source template、projection、Skill、reference、Design、checker / contract test、
      Issue / PR 生成・更新フロー、backfill WRITE、docs、ADF-COVERS を同一変更単位で整合させる。
  - id: AG-007
    content: |
      Legacy Baseline（2026-08-22、BASELINE-REQ048-REANALYSIS）は immutable な歴史証拠として保持し、
      定義上の性質（読み取りを伴う実行を論理実行単位としていたこと、read を伴う実行が97単位だったこと、
      token 総計の大部分を cache read が占めていたこと、source / projection 重複参照・path 再読込の当時定義、
      導入前は ADF 発行の machine correlation が十分でなかったこと）を明示する。frontmatter baseline_for を
      書き換え後 REQ-048 と旧→新行対応表へ再枠付けする。Baseline V2 は「本要件再構築時点の GitHub 最新 ADF
      control plane」と定義し、Phase C（structural redundancy 縮小）を Baseline V2 測定前に実施した場合は
      original start commit と structurally normalized commit のどちらを baseline としたかを commit SHA で固定
      記録する。測定指標（Outcome / Efficiency / Quality / Autonomy / Control / Observation Tax）と
      比較可能範囲・非比較範囲の境界を定義する。分析スクリプトは、定義の所有が Report 側に留まり、
      scripts 公開入口にしない、workflow gate に接続しない、新規永続 state を持たない、配布物に含めない
      境界内では実装詳細とする。恒久 checker 化・公開入口化は DEC-001 決定4 と DEC-021 の対象とする
      （baseline report の将来機械化条項が手順2〜4のスクリプト化を明文許容）。
  - id: AG-008
    content: |
      design-save は安定契約原則のみを保存する（所有境界、相関情報最小性、観測性契約、実験契約、
      比較可能性境界規則、フィールド集合・分類・表形式は現行ベースラインである旨の宣言）。
      workflow-contracts.md の「工程間構造化文脈引き継ぎ契約」「ADF 実行識別情報の記録契約」
      「source / projection 参照確認の工程契約」、delegation-contracts.md の「構造化文脈引き継ぎ（委譲時）の
      直列化契約」、agentdev-workflow-templates.md の「実行識別情報・検証差分のテンプレートセクション形式」を
      この方針で更新する。配布物参照（structured-stage-handoff.md 等）の恒久禁止文言は「Design を正とする」
      宣言があるため design-save の Design 更新で規範上の矛盾を解消し、参照文言の置換は同 wave の case で
      追従する。フィールド級の縮小は各実験の Decision 記録（KEEP / NARROW / MERGE / DOWNGRADE / DELETE）に
      基づき、実装変更と同一 changeset の design update（target_area UPDATE）として反映する。
  - id: AG-009
    content: |
      WP-07 Baseline V2 測定は比較可能 execution unit 約30〜50件の蓄積を目安とし、統計的有意性の固定基準と
      しない。対象機構の発火数が少ない場合は「サンプル不足」と明記し断定しない。本要件の完了条件は
      「Baseline V2 測定結果、または測定可能状態と observability gap の整備」までである。削減候補ランキングの
      評価軸は Frequency、Cost、Incremental Benefit、Redundancy、Safety relevance、Observability confidence
      とし、結果は既存 Report または Issue へ保存する。実験群は G1（Verification Diff の縮小）、G2
      （Structured Handoff の縮小。複数 field を無差別に削らず重複群単位の仮説で縮小）、G3（source / projection
      再参照の縮小。常に source / projection の固定化ではなく解決済み reference choice の再判断削減）、
      G4（Review / Verification の条件付き化。trigger は実測データと既存 risk / finding / modification state
      から定義）の順で各々 baseline / hypothesis / 単一主要変更 / guardrail / observation / decision を持って
      順次実行する。Observation Tax（correlation text 生成、self-reference backfill、PR / Issue extra update、
      verification diff 生成、structured handoff 構築、contract test / checker 保守、telemetry 契約起因の実行
      失敗）を明示する。
  - id: AG-010
    content: |
      行 ID 再割り当てに伴う同期義務: (1) ADF-COVERS 付替（workflow-contracts.md、delegation-contracts.md、
      agentdev-workflow-templates.md、req-048-reanalysis-baseline.md、契約テスト2本の covers 宣言）、
      (2) verification-scope-catalog.md の REQ-048 行の検証要否再登録（機械的更新）、(3) req-health-metrics.md、
      requirements/README.md、docs/README.md の行数・表題同期、(4) 旧→新行対応表の changeset 内保存
      （新001〜016 が旧001〜016 と同番号別意味になるため、過去成果物の旧行 ID 引用との衝突を対応表で解消）、
      (5) source（src/opencode）と projection（.opencode）の同期。既知 fail は base commit での再現比較により
      既存か本変更由来かを分離し、新しい fail を「既知」として扱わない。

conflict_resolutions:
  - id: CR-001
    conflict: |
      本要件を単一 Case で完結させるか、測定・実験系（WP-07〜09）を後続要件へ分離するか。
    resolution: |
      RU 全体を1つの要件doc にまとめ、Epic/Wave 分割は case-open が決定する（2026-09-04 ユーザー合意）。
      実証Case判定は通常Caseとし、WP-09 各 experiment を後続の個別実証として分離する扱いも同時に合意。
  - id: CR-002
    conflict: |
      縮小評価ループの方針を新規 Decision として所有するか、REQ-048 行のみで所有するか。
    resolution: |
      新規 Decision として作成する（2026-09-04 ユーザー確定）。アーキテクチャ助言は DEC-024 型
      （原則確立のみ・hard 統制点にしない・詳細は REQ/Design へ委譲）を推奨。DEC-001 決定4は追加側のみを
      支配し縮小側の恒久手続きが憲章に不在であるため、Decision による隙間埋めが正当化される。
  - id: CR-003
    conflict: |
      anti-shrink 契約（旧 REQ-048-019、契約テスト2本の保持 assertion）の廃止は既存 Decision と衝突するか。
    resolution: |
      衝突しない。旧019 自身が「削減要否は本要件実施後の観測結果から別途判断する」と定める一時凍結条項であり、
      廃止は 019 のライフサイクル完遂である。セクション保持の test-enforce は DEC-001 決定3（文章品質・構造は
      guidance 扱いで工程停止条件にしない）に対する過剰側であり、廃止は憲章の適用である（アーキテクチャ助言
      確定事項、REQ-048.md 旧019本文・DEC-001 本文の直接照合）。
  - id: CR-004
    conflict: |
      Baseline V2 の定量測定サイクルと「集計スクリプト新設しない」制約（baseline report、DEC-017 準拠）の衝突。
    resolution: |
      衝突しない。baseline report は「将来の機械化は、本資料の定義を変更せずに手順2〜4をスクリプト化する形で
      行える」と明文許容する。定義所有が Report 側・公開入口化しない・workflow gate 不接続・新規永続 state なし・
      配布物外の分析スクリプトは実装詳細とし、恒久 checker 化・公開入口化のみ DEC-001 決定4 と DEC-021 の
      対象とする（アーキテクチャ助言確定事項、report 本文直接照合）。

artifact_actions:
  - id: ACT-REQ-048
    artifact: req
    operation: update
    target: docs/requirements/REQ-048.md
    source_items: [AG-001, AG-002]
    content: |
      ---
      id: REQ-048
      title: "ADF 実行観測と統制縮小評価"
      created: "2026-08-23"
      updated: "2026-09-04"
      ---

      ## 目的

      ADF の自己ホスト実行を観測し、品質、自律性、安全性を維持しながら、ADF が持つ統制・補助機構の便益と
      実行コストを比較し、必要十分な制御系へ縮小・統合できるための最小観測・評価契約を定める。

      ADF の改善では機構の追加量を成果としない。ADF が既に持つ実行情報と harness 側の生実行履歴を使って
      各機構の便益・コスト・重複を評価し、Execute → Observe → Measure → Candidate → Experiment →
      KEEP / NARROW / MERGE / DOWNGRADE / DELETE のサイクルで必要十分な control plane へ収束する。
      観測のために導入した施策自身を恒久的必須契約としない。

      本要件は、旧 REQ-048（ADF 実行効率第1次改善）で導入された structured handoff、source / projection
      参照引き継ぎ、検証差分記録等の具体方式を、他の正規要件が所有する不変条件を除き、観測・評価対象として
      扱い直す。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-048-001 | ADF の実行を後から評価するため、実行単位、委譲単位、Case、GitHub Issue、GitHub PR、ADF 工程、実行結果および必要な親子実行関係を、分析に必要な最小限の識別情報で対応付けられること。既存識別体系と並行する新しい識別体系を設けず、既存成果物または関係から一意に導出できる値を重複して所有しない方向で設計すること |
      | REQ-048-002 | ADF が発行する識別情報を機械的に判別できること。自由文中に偶然出現する識別子のみに対応付けを依存させないこと |
      | REQ-048-003 | token、model、tool call、message、part、compaction、session 等の harness 生実行履歴は、harness 側の既存データを分析時に読み取り専用で利用すること。ADF 側は ADF 成果物と harness 実行を結ぶ相関情報を中心に所有すること（REQ-011-018 準拠） |
      | REQ-048-004 | harness 内部識別子は取得可能な場合の補助情報とすること。観測情報の欠落または対応付け不能は workflow の実行結果とは分離し、分析時の observability gap として扱えること |
      | REQ-048-005 | 観測のために ADF 成果物へ保存する情報は、既存情報から導出できない対応付け情報を優先すること。新しい必須 field、schema、checker、成果物種別、永続 state 等の追加判断は DEC-001 決定4（新規統制追加原則）に従うこと。本要件の観測機構自身も cost / redundancy の評価対象とすること |
      | REQ-048-006 | ADF 実行の評価では、Outcome、Efficiency、Quality、Autonomy、Control / Coordination を区別できること。単一の指標のみを理由に統制の追加・縮小を判断しないこと |
      | REQ-048-007 | 利用可能な範囲で、wall-clock、input token、output token、cache read、cache write、tool call、同一 path 再読込、子実行間の同一 path 再読込、source / projection 重複参照を評価できること。token は性質を区別し、単純合算値だけを cost として扱わないこと |
      | REQ-048-008 | review、verification、quality gate 等について、当該工程で初めて確認された actionable finding を前工程の finding と区別し、後続工程の incremental value を比較できること。全工程に一律の finding 詳細分類または特定の表形式を本要件の成立条件としないこと。REQ-003-042（審議中 finding 状態の追跡）と REQ-007-005（欠陥類型単位の修正証跡）の所有境界を変更しないこと |
      | REQ-048-009 | 利用可能な範囲で、human intervention、user-decision-required、blocked、failed、delegation-unavailable、self-heal、stop、resume を区別し、自律性への影響を評価できること |
      | REQ-048-010 | ADF 自身の制御コストを評価するため、実行を Context / Exploration、Implementation、Review、Verification、Orchestration / Recovery の意味のある処理区分へ対応付けられること。並列実行の評価では wall-clock だけでなく、追加 token、重複作業、競合、fan-in 後修正も比較できること |
      | REQ-048-011 | 評価対象機構を分析時に Safety invariant、Quality control、Efficiency support、Structure / Convenience へ分類できること。この分類は分析上の分類とし、新たな永続 state を必要条件としないこと。Safety invariant は不変条件の維持を評価対象とし、実装方式の簡素化と区別すること |
      | REQ-048-012 | ADF の統制・補助機構を変更して評価する場合、Baseline、Hypothesis、単一の主要構造変更、Guardrail、Observation、Decision を識別できること。独立した複数の主要変更を一つの実験結果へ混在させないこと |
      | REQ-048-013 | 評価結果を KEEP、NARROW、MERGE、DOWNGRADE、DELETE の判断へ整理できること。削除そのものを成功条件としないこと。条件付きで価値を持つ機構は NARROW、重複責務は MERGE、hard control が不要なものは DOWNGRADE を評価できること |
      | REQ-048-014 | structured handoff の具体 field 集合、source / projection 参照の引き継ぎ方式、検証差分の具体分類・表形式、review 回数、verification 回数、subagent 数、並列度、REQ / Decision / Design / Skill / reference の数量を、本要件の成立条件として固定しないこと。他の正規要件が所有する責務を除き、これらは観測・評価対象として扱えること |
      | REQ-048-015 | 2026-08-22 の改善前分析は歴史的比較基線（Legacy Baseline）として保持すること。当該分析の定義上の性質（読み取りを伴う実行を論理実行単位としていたこと、token 総計の大部分を cache read が占めていたこと、導入前は ADF 発行の相関情報が不足していたこと）を明示すること。新しい評価指標について baseline 定義を変更または追加した場合は、比較可能範囲と非比較範囲を区別すること |
      | REQ-048-016 | 評価結果は既存の Report、Issue 等の既存成果物へ保存し、指標定義、observability gap、候補、Guardrail、判断結果を後から確認できること。この目的だけの新規成果物種別を追加しないこと |

      ## 適用範囲

      ### 対象

      - ADF 配布物（command、skill、template）と docs（REQ、Design、Report）における実行相関情報の記録、
        実行評価の評価軸・指標、実験契約、縮小判断の各契約
      - Legacy Baseline の位置づけ明確化と Baseline V2（本要件再構築時点の GitHub 最新 ADF control plane）
        の定義・測定

      ### 対象外

      - harness 生実行履歴の ADF 側への複製保存、観測専用の新規成果物種別・実行履歴 DB の新設
      - モデル選定最適化、provider 間の費用対効果評価
      - OpenCode / harness 自体の改修を本要件の成立条件とすること
      - サブエージェント探索責務の分割実装（RU-0002 由来、別要件で再評価）
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: docs/decisions/DEC-027.md
    source_items: [AG-004]
    content: |
      # 観測ベース統制縮小評価ループ

      ## 背景

      DEC-001 決定4は新しい統制を追加する際の原則（7条件）を定めるが、追加済みの統制を評価し縮小するための
      恒久手続きは定めていない。決定4条件7が要求する「将来の削除条件または再評価条件」をどの機構で評価するかの
      正規な答えが不在であり、統制が追加のみで削減されない非対称が生じ得る。旧 REQ-048-019（一律削減なし）は
      この非対称を一時的に埋めた凍結条項であり、恒久 policy ではなかった。

      ## 決定

      1. ADF の改善中心サイクルを Execute → Observe → Measure → Candidate → Experiment →
         KEEP / NARROW / MERGE / DOWNGRADE / DELETE とする。機構の追加量を成果としない。
      2. 統制・補助機構の変更判断は、Benefit（unique outcome、unique finding、autonomy improvement、
         recovery / safety contribution）と Cost（token、wall-clock、tool call、重複読み書き、orchestration、
         maintenance / contract complexity）を対で比較する。単一指標のみを理由に判断しない。
      3. 冗長性を2種に分離する。Structural redundancy（成果物関係や既存 canonical state から一意に導出できる
         情報の重複所有）は性能実験を待たず縮小候補として評価してよい。Empirical redundancy（review、
         verification、handoff 等の品質・自律性に便益があり得る機構の重複）は Baseline と Guardrail を設定して
         実測してから縮小判断する。
      4. 実験は 1 experiment = 1 major structural change とし、Baseline、Hypothesis、単一の主要構造変更、
         Guardrail、Observation、Decision を識別する。独立した複数の主要変更を一つの実験結果へ混在させない。
      5. Safety invariant は「機構」ではなく「不変条件」の維持を評価対象とする。DEC-001 決定3の hard
         governance 8点に該当する不変条件は維持し、それを実現する重複した field、checker、document、state、
         step の縮小は評価可能である。
      6. 本 Decision は原則の確立に限定する。評価軸・指標・機構分類の定義は REQ-048 が、実験の登録形式・
         測定手続きは Design が所有する。hard 統制点（工程停止条件）を新設しない。

      ## 結果、影響

      - REQ-048 は本 Decision の第一適用対象として、ADF 実行観測と統制縮小評価の契約を所有する。
      - 今後の統制追加提案は、決定4の7条件に加え、既存機構との KEEP / NARROW / MERGE / DOWNGRADE / DELETE
        比較により簡略化できる可能性を説明できること。
      - 旧 REQ-048-019（一律削減なし）は廃止し、本ループの評価対象として扱い直す。

      ## 関連する決定

      - DEC-001: relates-to（決定4「新規統制追加原則」の縮小側補完。supersede しない）
      - DEC-017: relates-to（最小トレーサビリティモデルと同方向の最小化原則）

      ## 再評価条件

      - 本ループの運用コスト（Observation Tax、REQ-048-005）が縮小効果を上回る場合
      - 本ループの実行に新規の恒久 state、checker、公開入口を要求する状態が生じた場合（決定4の7条件を
        満たせないため）
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/workflow-contracts.md
    target_area: 工程間構造化文脈引き継ぎ契約
    result: saved
    source_items: [AG-008, AG-001]
    content: |
      ADF の工程間の引き継ぎは、委譲時の構造化文脈と同一の意味集合（目的、現在の ADF 工程、現在の実行単位、
      前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、
      計画変更を識別するための情報）を扱う。工程間の直列化形式は本 Design が所有し、委譲時の直列化
      （delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」）と意味対応を保つ。

      この意味集合を具体化する field 集合は現行ベースラインであり、REQ-048-014 のとおり REQ-048 の成立条件と
      して固定しない。field 集合の変更は REQ-048-012 の実験契約（単一の主要構造変更、Guardrail 付き）に従い、
      委譲時の直列化と意味対応を維持するため同時変更を要する。

      後工程は、引き継がれた確定済み事項を初期文脈として利用し、同じ情報をゼロから探索、再構築することを
      原則としない。独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認は維持する。

      引き継ぎ情報を REQ、Decision、Design、GitHub Issue、PR 等に代わる新たな正規情報源としない。引き継ぎ内容は
      永続的な正規成果物から再構成可能であり、会話記憶に依存する再開を許可しない（DEC-011 準拠）。

      当該作業で使用すべき解決済み参照先（正規原本、実行時投影、双方確認の別を含む）は、構造化文脈の正規参照先
      として後工程へ渡す。この参照引き継ぎの効率（同一 path 再読込、source / projection 重複参照の削減）は
      REQ-048-007 の評価対象である。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/workflow-contracts.md
    target_area: ADF 実行識別情報の記録契約
    result: saved
    source_items: [AG-008, AG-001, AG-006]
    content: |
      ADF 実行の識別情報（対象 Case、GitHub Issue、GitHub PR、ADF 工程、実行単位、実行結果、必要な親子実行関係）の
      記録先を次のとおり一意に定め、工程間で一貫させる。

      - Issue 本文: 対象 Case、ADF 工程、実行単位、前工程で確定した事項
      - PR 本文: 対象 Case、PR、実行単位、実行結果、検証種別と検証結果
      - RU / OU: 要件単位・操作単位の識別情報
      - 委譲 prompt（委譲時）: 委譲目的、委譲単位識別子、親子実行関係

      識別情報は分析に必要な最小限とし、既存識別体系と並行する新しい識別体系を設けない。既存成果物または
      成果物間関係から一意に導出できる値を識別情報として重複記録しない（REQ-048-001）。識別情報は機械的に
      判別できる形式とし、自由文中に偶然出現する識別子のみを対応付けの根拠にしない（REQ-048-002）。

      現在の adf_* field 集合（adf_case、adf_phase、adf_execution_unit、adf_upstream_confirmed、adf_pr、
      adf_delegation、adf_result、任意 adf_harness_ref、委譲 <delegation-ident> ブロック）は現行ベースラインであり、
      REQ-048 の成立条件として固定しない。field の縮小は、導出可能性監査（canonical 成果物関係から一意に導出
      できる、runtime / downstream が明示値へ依存しないまたは canonical derivation へ置換できる、hard governance
      不変条件を失わない、correlation capability を失わない、の全条件成立）に基づき実施する。

      実行単位の識別は epic-wave-model Design の execution_unit 構成の既存定義に接続する。親子実行関係は ADF が
      発行する委譲単位・実行単位識別子を正規手段とし、harness 側識別子（OpenCode session ID 等）は取得可能な
      場合の付加情報に限定する（REQ-011-018、REQ-048-003 準拠）。

      OpenCode の実行履歴と ADF の識別情報の対応付けは、実行後の分析において OpenCode セッションデータと ADF 側
      識別情報を結合して行う。識別情報の一部が取得できなくても observability gap として分析時に扱い、ADF workflow
      の実行結果とは分離し、workflow を停止させない（REQ-048-004）。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/workflow-contracts.md
    target_area: source / projection 参照確認の工程契約
    result: saved
    source_items: [AG-008, AG-001]
    content: |
      各工程における成果物参照は、実行目的に応じて正規原本（source）を確認すべき場合、実行時投影（projection）を
      確認すべき場合、双方の整合確認が必要な場合を判別して行う。「常に source のみ」「常に projection のみ」の
      ような固定ルールとしない。

      工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せる。

      source / projection 双方の確認が品質保証上必要な場合は、その確認を維持する。source / projection 責務境界
      自体の変更が必要となった場合は、当該要件の暗黙事項として扱わず、正規の設計判断を行う。

      この参照引き継ぎの具体的方式と source / projection 重複参照の効率は、REQ-048-007（Efficiency）の評価対象
      であり、引き継ぎ方式は REQ-048-014 のとおり REQ-048 の成立条件として固定しない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/workflows/delegation-contracts.md
    target_area: 構造化文脈引き継ぎ（委譲時）の直列化契約
    result: saved
    source_items: [AG-008, AG-001]
    content: |
      委譲時最小契約（inputs、side_effect_boundary、output_contract、capture_handoff）の骨格を変更せず
      （REQ-003-006 準拠）、inputs 内に構造化文脈を直列化する。構造化文脈は次の意味を扱う。

      - 目的（purpose）
      - 現在の ADF 工程（workflow_phase）
      - 現在の実行単位（execution_unit）
      - 前工程で確定した事項（resolved_context）
      - 未確定事項（open_items）
      - 正規参照先（canonical_references）
      - 停止条件（stop_conditions）
      - 期待する実行結果（expected_output）
      - 後続工程へ渡すべき成果（handoff_artifacts）
      - 計画変更を識別するための情報（plan_change）

      直列化に全文履歴や巨大な計画本文の複製を含めない。

      この意味集合および具体化する field 集合は現行ベースラインであり、REQ-048-014 のとおり REQ-048 の成立条件と
      して固定しない。field 集合の変更は REQ-048-012 の実験契約（単一の主要構造変更、Guardrail 付き）に従い、
      工程間の直列化（workflow-contracts Design「工程間構造化文脈引き継ぎ契約」）と意味対応を維持するため
      同時変更を要する。

      ADF は委譲単位識別子を発行し、親子実行関係の識別の正規手段とする。委譲 prompt には対象 Case、Issue、PR、
      ADF 工程、実行単位、委譲目的の識別情報を構造化して含める。OpenCode 等の harness 側セッション識別子は、
      取得可能な場合に付加情報として記録し、必須契約としない（REQ-011-018、REQ-048-003 準拠）。

      構造化文脈は新しい正規情報源ではない。引き継ぎ内容は永続的な正規成果物（Issue 本文、PR 本文、RU、OU 等）から
      再構成可能であること（DEC-011 準拠）。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_area: 実行識別情報・検証差分のテンプレートセクション形式
    result: saved
    source_items: [AG-008, AG-005, AG-001]
    content: |
      Issue テンプレートと PR テンプレートに、実行識別情報と検証差分を構造化して記録するセクションを定義する。

      - Issue テンプレート: 対象 Case、ADF 工程、実行単位、前工程で確定した事項を記録する識別情報セクション
      - PR テンプレート: 実行結果、検証種別、検証結果、finding 差分を記録する検証差分セクション

      検証差分セクションは、case-run の PR 本文 Findings セクション（intake / learning 小見出し）を置換せず、
      これと共存する（REQ-031-012 準拠）。

      本セクション形式は新規作成の Issue / PR に適用し、既存 Issue / PR へ遡及適用しない（REQ-017-013 準拠）。

      現在の識別情報 field 集合と検証差分の分類・表形式（8列）は現行ベースラインであり、REQ-048-008、
      REQ-048-014 のとおり REQ-048 の成立条件として固定しない。形式の変更は REQ-048-012 の実験契約に従い、
      後続工程の incremental value 比較可能性（REQ-048-008）を Guardrail として行う。

operation_units:
  - ou_id: OU-001
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs: ["REQ-048 (docs/requirements/REQ-048.md)"]
      artifact_action_mapping:
        ACT-REQ-048: docs/requirements/REQ-048.md
        ACT-DEC-001: docs/decisions/DEC-027.md
      source_ru_mapping: []
      unclassified_verification_lines: []
      consumable_by_case_open: true
  - ou_id: OU-003
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-005]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-006]
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-008
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-007]
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-009
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-008]
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-010
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-009]
    recommended_order: 10
    issue_policy: single
    result: {}
  - ou_id: OU-011
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-010]
    recommended_order: 11
    issue_policy: single
    result: {}
  - ou_id: OU-012
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-011]
    recommended_order: 12
    issue_policy: single
    result: {}
  - ou_id: OU-013
    target_req: REQ-048
    operation: update
    scale: standard
    depends_on: [OU-012]
    recommended_order: 13
    issue_policy: single
    result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-save / design-save 完了後に /repo/docs-check を実行する。REQ-048 新16行構成と
      requirements/README.md・docs/README.md の表題・行数集計、verification-scope-catalog.md の REQ-048 行再登録、
      req-health-metrics.md の要件行数整合、全 ADF-COVERS 宣言（workflow-contracts.md、delegation-contracts.md、
      agentdev-workflow-templates.md、req-048-reanalysis-baseline.md、契約テスト2本）の新行参照を確認する。
    pass_criteria: |
      docs-check の検証ブロックが新構成で合格し、旧行 ID（旧007〜021 の意味で使われていた参照）への
      covers 残存が0件であること。旧→新行対応表が changeset 内に存在すること。
    on_failure: |
      fix-and-reverify。REQ 再構築由来の不整合であるため、参照付替・索引再生成を行い再検証する。
  - id: TS-002
    target_item: AG-005
    verification: |
      契約テスト再構成後、execution_ident_contract.test.ts と verification_diff_contract.test.ts を実行する。
      構造 assertion（実行識別情報セクションの機械判別、FORBIDDEN_REQUIRED_KEYS、欠落時 N/A・非停止）の残存と、
      BASELINE_REQUIRED_SECTIONS / PR_BASELINE_REQUIRED_SECTIONS / 削減なし describe の消滅を確認する。
    pass_criteria: |
      テスト2本が合格し、旧019 由来の「既存必須セクションの削減なし」を検証対象とする assertion が残存しない
      こと。必要な相関・finding 比較能力の検証 assertion が新行参照で存在すること。
    on_failure: |
      fix-and-reverify。テストが旧構造の存続を検証している場合は新要件の意図へ書き換え、能力検証の欠落は
      追加して再検証する。
  - id: TS-003
    target_item: AG-010
    verification: |
      既知 RED 2件（Issue #2569: issue_desc_epic.md / issue_desc_child.md の配布物内部 ID（REQ-XXXX 数字つき）
      混入）の解消を確認する。テンプレートから REQ-\d パターンを除去し、該当 assertion を実行する。
    pass_criteria: |
      当該 assertion が合格し、docs/reports/integrity の監査記録上の既知 fail が解消扱いになること
      （新しい fail を「既知」として扱わない）。
    on_failure: |
      fix-and-reverify。テンプレートの ID 除去を完了し再検証する。
  - id: TS-004
    target_item: AG-006
    verification: |
      WP-04 で全 correlation field の derivability table を作成した後、WP-05 の縮小実施後に、縮小版テンプレート
      ・生成フローを用いて Issue ↔ PR ↔ 委譲 ↔ harness セッションの相関が機械判別可能であることを契約テスト
      （存在確認ではなく相関成立確認型）で検証する。repo-agentdev-integrity の full suite を実行する。
    pass_criteria: |
      縮小5条件（導出可能・runtime 依存解消・hard governance 不変条件維持・correlation capability 維持・
      テストの相関成立確認への変更）全ての成立根拠が derivability table に記録され、縮小後も相関が機械判別
      可能であること。integrity suite が新しい fail なしで合格すること。
    on_failure: |
      fix-and-reverify。相関能力または不変条件を損なう縮小は当該 field を戻し、derivability table の判定を
      再評価する。
  - id: TS-005
    target_item: AG-007
    verification: |
      baseline reframe の成果物（docs/reports/req-048-reanalysis-baseline.md の再枠付け、Baseline V2 定義 Report）
      を読み戻す。Legacy Baseline の定義的性質明記、baseline_for の再枠付け、旧→新行対応表、Baseline V2 の
      baseline commit SHA 記録手順、比較可能範囲・非比較範囲の境界記載を確認する。
    pass_criteria: |
      Legacy Baseline の実測値・定義が不変であること（歴史証拠として保存）、新指標の旧 baseline への
      retro-fit が行われていないこと、Baseline V2 の baseline 固定手順が再現可能であること。
    on_failure: |
      fix-and-reverify。歴史証拠の改変または境界記載の欠落を修正し再検証する。
  - id: TS-006
    target_item: AG-008
    verification: |
      design-save 完了後、workflow-contracts.md（3セクション）、delegation-contracts.md、
      agentdev-workflow-templates.md の各 target_area を読み戻す。新 REQ-048 行参照の使用と、field 集合・
      分類・表形式の恒久固定文言の除去（現行ベースライン宣言への置換）を確認する。docs-check の Design
      整合検査を実行する。
    pass_criteria: |
      5 Design 変更がすべて新行参照を持ち、「削除しない」「固定」等の恒久契約文言が観測対象宣言へ置換
      されていること。
    on_failure: |
      fix-and-reverify。target_area の置換漏れ・文言残存を修正し再検証する。
  - id: TS-007
    target_item: AG-001
    verification: |
      配布物変更（src/opencode/skills/agentdev-workflow-templates/ 配下テンプレート・SKILL.md、
      agentdev-workflow-lifecycle/references/structured-stage-handoff.md、case-open / case-run /
      case-run-execution-adapter の各 reference）と projection（.opencode/）の整合を docs-check
      （配布依存境界検査）で確認する。
    pass_criteria: |
      source / projection の整合が取れ、配布依存境界検査が合格すること。配布物に REQ-NNNN 数字つき ID が
      混入していないこと。
    on_failure: |
      fix-and-reverify。投影同期・ID 除去を実施し再検証する。
  - id: TS-008
    target_item: AG-009
    verification: |
      WP-07 完了時点で、Baseline V2 の測定結果または測定可能状態と observability gap の整備状況を Report で
      確認する。測定手順（評価軸、指標定義、処理区分、Observation Tax）が Report に定義されていること、
      サンプル不足の場合はその明記があることを確認する。
    pass_criteria: |
      測定結果または測定可能状態のいずれかが Report に保存され、observability gap が明記されていること。
      実測値の蓄積は運用サイクル依存であるため、測定手順の存在と再現可能性をもって WP-07 の合格とする。
    on_failure: |
      record-in-findings。実測サンプルの不足は運用サイクル依存であり実装不具合ではないため findings に
      記録する。ただし測定手順・指標定義自体の欠落は fix-and-reverify の対象とする。
  - id: TS-009
    target_item: AG-004
    verification: |
      req-save 完了後に新規 Decision ファイル（観測ベース統制縮小評価ループ）の frontmatter
      （status: proposed）、decisions/README.md への登録、relates-to DEC-001 / DEC-017 の関係宣言を
      /repo/docs-check で確認する。
    pass_criteria: |
      Decision が decisions/ の採番規則に従い作成され、インデックスに登録され、hard 統制点を新設しない
      本文（決定6）と REQ-048 行への詳細委譲（評価軸・指標・登録形式の所有不在）を維持していること。
    on_failure: |
      fix-and-reverify。Decision 本文への指標表・登録形式の混入またはインデックス不整合を修正し再検証する。
realization_actions:
  - id: RA-001
    concern: テンプレート実現面（実行識別情報セクション・検証差分セクションの現行形式）
    responsibility: |
      Issue 4種・PR テンプレートの adf_* ブロックと検証差分表の現行形式をベースラインとして維持しつつ、
      REQ-048-008/014 の観測対象宣言に整合する形式へ（恒久固定の含意を除き）更新する。WP-05 で縮小確定した
      field は template・SKILL.md 正規表から除去する。
    ownership_hints:
      - "src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md / issue_desc_bug.md / issue_desc_epic.md / issue_desc_child.md / pr_desc.md"
      - "src/opencode/skills/agentdev-workflow-templates/SKILL.md（adf_ key 正規表 L91-98、検証差分セクション規約）"
      - "正規所有 Design: docs/designs/skills/agentdev-workflow-templates.md"
    intent: |
      テンプレートを REQ の成功条件ではなく Design 現行セットの実装として扱い直す。構造縮小は derivability
      監査と実験契約に従ってのみ行う。
    verification_refs: [TS-002, TS-004, TS-007]
    source_items: [AG-005, AG-006, AG-008]
  - id: RA-002
    concern: 契約テスト実現面（anti-shrink 契約の分解廃止と能力検証への再構成）
    responsibility: |
      execution_ident_contract.test.ts・verification_diff_contract.test.ts を、セクション保持の検証から
      相関・finding 比較能力の検証へ再構成する。BASELINE_REQUIRED_SECTIONS・PR_BASELINE_REQUIRED_SECTIONS・
      削減なし describe を削除し、構造 assertion（機械判別・FORBIDDEN_REQUIRED_KEYS・N/A 非停止）は残存、
      covers 宣言を新行へ付替する。既知 RED 2件（#2569）を解消する。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/execution_ident_contract.test.ts"
      - ".opencode/skills/repo-agentdev-integrity/scripts/verification_diff_contract.test.ts"
    intent: |
      テストが「過去に追加した構造の存続」ではなく新 REQ-048 の意図を検証するようにする。新しい fail を
      既知扱いしない運用の前提を整える。
    verification_refs: [TS-002, TS-003, TS-004]
    source_items: [AG-005, AG-010]
  - id: RA-003
    concern: 実行フロー実現面（backfill WRITE・委譲識別ブロック・生成フローの整合）
    responsibility: |
      WP-05 の field 縮小に応じて、case-open の自己参照値 backfill（issue-creation-flows.md）、
      case-run-execution-adapter の <delegation-ident> ブロックと adf_delegation 転記（harness-delegation.md）、
      case-run の delegation-and-result.md の記録指示を同一変更単位で整合させる。backfill が solely for
      self-reference になっている箇所は導出へ置換する。
    ownership_hints:
      - "src/opencode/skills/agentdev-workflow-case-open/references/issue-creation-flows.md / issue-body-and-execution-contract.md"
      - "src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md / SKILL.md"
      - "src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md"
    intent: |
      structural redundancy 縮小後も correlation capability を維持し、Observation Tax（self-reference
      backfill 等）を削減する。
    verification_refs: [TS-004, TS-007]
    source_items: [AG-006]
  - id: RA-004
    concern: 配布物参照実現面（structured handoff 参照の恒久禁止文言置換）
    responsibility: |
      structured-stage-handoff.md の「キーの削除、名称変更は行わない」規定を、field 集合=現行ベースライン
      宣言と実験契約経由の変更管理規則へ置換する。Design（workflow-contracts・delegation-contracts）の
      更新に意味従属させる文言とする。
    ownership_hints:
      - "src/opencode/skills/agentdev-workflow-lifecycle/references/structured-stage-handoff.md（L4 Design 正宣言、L38-39 禁止規定）"
    intent: |
      配布物参照が Design より強い恒久制約となり、REQ-048-014 と矛盾する状態を解消する。
    verification_refs: [TS-006, TS-007]
    source_items: [AG-008]
  - id: RA-005
    concern: Report 実現面（baseline reframe・Baseline V2・ランキング・実験定義）
    responsibility: |
      req-048-reanalysis-baseline.md を immutable 歴史証拠として再枠付け（baseline_for 更新、定義的性質明記、
      境界追記）し、Baseline V2 定義・測定結果（または測定可能状態と observability gap）、削減候補ランキング、
      実験 G1〜G4 の実行可能な定義を既存 Report として保存する。分析スクリプトは Report 所有・非公開・
      非 gate の境界内に置く。Baseline V2 定義・測定結果の Report は ADF-COVERS(verification): REQ-048-015,
      REQ-048-016 を宣言し、検証対応必須行の検証対応を成立させる。
    ownership_hints:
      - "docs/reports/req-048-reanalysis-baseline.md"
      - "docs/reports/（Baseline V2・ランキング・実験定義の新規 Report。Design 索引管理外）"
    intent: |
      評価結果を既存成果物種別で追跡可能にし（REQ-048-016）、旧 67.9B token 等の誤った単純比較を防ぐ
      比較可能性境界を確立する。
    verification_refs: [TS-005, TS-008]
    source_items: [AG-007, AG-009]
  - id: RA-006
    concern: カタログ・索引・メトリクス実現面（同期義務の機械的更新）
    responsibility: |
      verification-scope-catalog.md の REQ-048 行再登録（分類方向: 記録・形式契約に該当する新001〜005・016 は
      検証対応必須行として契約テスト・Report の covers で検証し、評価軸・実験・機構分類に該当する新006〜015 は
      実行時振る舞いの任意行とする。最終分類は verification-scope-catalog の規則に従う）、req-health-metrics.md の行数集計更新、
      requirements/README.md・docs/README.md の表題同期、全 ADF-COVERS 付替、旧→新行対応表の changeset 内
      保存を実施する。
    ownership_hints:
      - "docs/designs/foundations/references/verification-scope-catalog.md（L225-228）"
      - "docs/designs/quality/req-health-metrics.md（REQ-048 行）"
      - "docs/requirements/README.md / docs/README.md（AUTOGEN ブロック）"
      - "docs/designs/workflows/workflow-contracts.md / delegation-contracts.md、docs/designs/skills/agentdev-workflow-templates.md（covers 宣言）"
    intent: |
      行 ID 再割り当てによる参照切断（依存境界リスク）を同期義務として確実に実行し、TIM check の不合格を
      防ぐ。
    verification_refs: [TS-001, TS-003]
    source_items: [AG-010]
review_dispositions: []

case_open_hints:
  epic_needed: true
  decomposition: |
    OU 構成は RU の Work Package 構造に対応する（OU-001=WP-01 Repository Baseline & Current-State Audit、
    OU-002=WP-02 REQ-048 Rewrite、OU-003=WP-03 Anti-Shrink Contract Refactor、OU-004=WP-04 Correlation
    Derivability Audit、OU-005=WP-05 Minimal Correlation Implementation、OU-006=WP-06 Baseline Documentation
    Reframe、OU-007=WP-07 Baseline V2 Measurement、OU-008=WP-08 Candidate Ranking、OU-009〜012=WP-09-1〜4
    Experiments G1〜G4、OU-013=WP-10 Dead Responsibility Cleanup）。依存は RU §10 の直列チェーンどおり。
    実行開始時は GitHub 最新 default branch を取得し baseline commit SHA を記録する（RU §1.1、Phase A）。
    旧→新行対応（WP-02 の ADF-COVERS 付替と対応表で使用）:
    旧001〜006 → 新001〜005・016（最小相関契約へ縮小維持）
    旧007〜011 → 新014・007（structured handoff は観測対象化）
    旧012〜014 → 新007・014（一般責務は workflow-contracts Design が保持し効率評価対象へ）
    旧015〜018 → 新008（incremental value 比較へ抽象化）
    旧019 → 新012・013 + 新 Decision（縮小評価契約へ置換）
    旧020 → 新004・対象外（harness 変更非依存へ吸収）
    旧021 → 新015（Legacy Baseline へ分離、Baseline V2 は対象セクションで定義）
  wave_hints:
    - "再構築系（OU-001〜006）を先頭 Wave。測定・実験系（OU-007〜012）は Baseline V2 の証拠取得後に逐次実行し、同一 baseline へ複数の主要変更を混在させない"
    - "OU-002 には req-save（REQ-048・新 Decision）と design-save（5 Design 変更）の成果が含まれる。OU-007 は 30〜50 execution units の運用蓄積を伴うため期間制約がある"
    - "OU-009〜012（実験 G1〜G4）は AG-002 のとおり実証Case候補として扱い、各 Issue で評価ブランチ・評価契約（REQ-043、DEC-018）を確定して実行する"
```

# summary

REQ-048 再構築と ADF 自己縮小実験基盤の要件doc。RU（2026-09-04 インライン提供）を入力とし、現行実装インベントリ
（契約テスト、adf_* field 配置、ADF-COVERS、verification-scope 分類、baseline report、structured handoff）
とアーキテクチャ助言（Oracle）を踏まえて確定した。主な合意: 通常Case扱い、RU 全体を1 draft に集約（OU は
WP ベース13件）、新 Decision「観測ベース統制縮小評価ループ」作成、anti-shrink 契約の分解廃止、測定スクリプト
の境界（Report 所有・非公開・非 gate）、design-save は安定契約原則のみ先行しフィールド級縮小は実験時の
同一 changeset design update で反映。実行開始時は GitHub 最新 default branch の baseline commit SHA を
記録する（OU-001）。
