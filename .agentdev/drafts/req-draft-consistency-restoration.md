---
draft_type: req_draft
topic_slug: consistency-restoration
status: saved
created_at: "2026-08-22T10:30:00+09:00"
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  現行成果物体系全体と現在の正規契約との不一致を解消する4段階の体制を定義する。
  第一段階として網羅監査の実行契約を新規 REQ 化し（RU-0001）、第二段階として横断正規化後の
  不変条件を別 REQ として恒久化する（RU-0002）。第三段階として docs-check への機械検査クラス
  追加を REQ-010 へ追記し（RU-0003）、第四段階として規則所有権の一方向化を新規 REQ 化する
  （RU-0004）。監査は一回限りの case 実行とし、正規化・検査・一方向化の恒久契約と時命を分離する。
  Decision は不要（既存正規所有モデルの運用強化。エスカレーション条件を要件行化）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      監査対象は src/opencode/**、.opencode/**、docs/requirements/**、docs/designs/**、現行テンプレート、
      integrity 関連の検査定義・検査コード・テスト、extension 定義、現行ワークフローから直接参照される
      .agentdev/** の契約・設定とする。監査観点は、ADR から Decision への移行残存、撤去済み Artifact Graph
      への現行参照、旧 SPEC または旧 Design パス、旧 command または旧 skill 名称、未解決 ID と未解決
      プレースホルダー、Gxx の書式・開始番号・欠番・重複・本文参照整合性、手順表現と工程表現の混在、
      責務所有者の不一致、削除済み機能への現行参照、同一契約の複数箇所定義による矛盾とする。
      対象範囲内の全成果物について監査結果を pass、fail、blocked、not applicable のいずれかで記録する。
  - id: AG-002
    content: |
      各検出事項には、対象ファイル、該当箇所、現在の記述、正と判断した根拠、問題クラス、修正候補、
      再発防止可能性を記録する。検出事項は個別ファイル単位だけでなく、原因別の問題クラス一覧として
      集約する。正規契約が確定できない事項は blocked として追加で必要な判断事項を明示し、監査中に
      独断で確定しない。未監査項目が残る場合は監査完了として報告しない。
  - id: AG-003
    content: |
      監査は現行の不整合と歴史的記録を区別する。歴史的識別子として許容されるもの（v2:ADR-0123 等）は
      現行不整合として扱わない。テンプレートまたは例示における {command-name} 等のプレースホルダーは
      実行時配布対象と区別して扱う。
  - id: AG-004
    content: |
      横断正規化の安全境界として、修正方法を既存合意または正規契約から一意に導けない事項は公開挙動を
      独断で変更せず blocked として残す。意味変更が必要な事項は修正対象に含めず blocked として報告する。
      歴史的 ADR 識別子は現行語彙への置換によって変更しない。
  - id: AG-005
    content: |
      正規化の対象は、現在概念として残存する旧 ADR 表記の Decision 体系への是正、実行時配布対象に残る
      未解決プレースホルダーの解決または除去、各 command 内のガードレール番号の G01 起点の連番化と
      本文内参照の更新、公開 command の工程表形式への統一、削除済み Artifact Graph 等への現行参照の
      是正、旧パス・旧名称・旧 extension 種別の現行体系への修正とする。各修正単位について、修正前、
      正規化、既存検査、対象固有検査、差分レビューの結果を記録する。ガードレール番号変更に伴う
      変換対照表（変換前 G 番号から変換後所在）を保持する。
  - id: AG-006
    content: |
      docs-check の機械判定可能な新規検査クラスとして、公開 command 内の Gxx の開始番号・欠番・重複、
      定義されていない Gxx への本文参照、実行時配布対象に残る未解決プレースホルダー、現行概念として
      使用される廃止語彙、現行参照として残る旧パスおよび削除済み名称を検出する。検査は既存の
      integrity 基盤へ統合し、機械判定できない自然言語上の意味矛盾や責務分界の妥当性判断は検査対象と
      しない（人間によるレビューへ残す）。
  - id: AG-007
    content: |
      誤検出抑制条件として、正規テンプレート内の意図的なプレースホルダーは対象種別と許容条件に従って
      誤検出せず、許容された歴史的識別子（v2:ADR-0123 等）を誤検出しない。検査対象となる成果物種別と
      除外条件を明示し、歴史的記録、テンプレート、例示を必要な範囲で除外する。
  - id: AG-008
    content: |
      各問題クラスについて、正常例、違反例、境界例、許容例、過去に発生した再現例を検査する回帰テストを
      備える。新規検査には対応する回帰テストが存在する（REQ-010-010 準拠）。監査で確認した既知の機械
      判定可能な不整合を再現する回帰テストを含める。
  - id: AG-009
    content: |
      対象規則（command format、ガードレール番号、廃止語彙と旧パス、配布境界、同種の integrity 検査
      定義）ごとに、正規契約、機械判定可能な定義、checker、test の対応を整理し、正規所有者を一意に
      定義する。正規所有者が複数候補に分かれる場合は、契約の意味を決定する成果物を一つに定め、他の
      成果物は派生定義、実装詳細、検証資産のいずれかとして位置付ける。既存の構成を単純化するだけで
      一方向化できる場合は生成機構を新設しない。
  - id: AG-010
    content: |
      正規契約を変更した場合に、検査定義または checker の更新漏れを検出できる状態を維持する。
      対象範囲内で、検査定義と checker が同一規則を独立して所有する箇所は解消されるか、独立所有の
      理由と同期条件が明示される。
  - id: AG-011
    content: |
      既存の正常入力が、一方向化だけを理由に不要な fail へ変化しない。既存 checker の外部契約を
      必要なく変更しない。新設した仕組みが既存方式より複雑になっていないことをレビューで確認する。
      対象 command の Step 形式など、対象 command に適用される相反する正規定義が存在しない状態を
      維持する。
  - id: AG-012
    content: |
      文書種別間での正規所有権の移動など所有権モデル自体の変更、汎用ルールエンジン等の新基盤の導入、
      既存 accepted Decision の委任と衝突する所有者決定が必要になった事項は、独断で採用せず、
      Decision 要否の再判断を含む追加判断へ引き渡す。
  - id: AG-013
    content: |
      網羅監査は一回限りの監査として case 実行で行い、恒常的な診断責務として解釈しない。機械検査は
      docs-check、意味診断は inspect 系 command が担う責務境界を維持する（REQ-010-004 準拠）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:consistency-completeness-audit
    source_items: [AG-001, AG-002, AG-003, AG-013]
    content: |
      ## 目的

      現行成果物体系全体と現在の正規契約との不一致を、網羅的な監査によって特定する。個別の表記修正に
      先立ち、現行の不整合と歴史的記録を区別し、同一原因に由来する検出事項を問題クラスとして集約した
      監査結果を、横断正規化と回帰検査の入力として確定する。本 REQ は一回限りの網羅監査の実行契約を
      所有し、恒常的な診断責務を持たない（機械検査は docs-check、意味診断は inspect 系が担当する）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | {REQ-ID}-001 | 監査対象は src/opencode/**、.opencode/**、docs/requirements/**、docs/designs/**、現行テンプレート、integrity 関連の検査定義、検査コード、テスト、extension 定義、現行ワークフローから直接参照される .agentdev/** の契約・設定とすること |
      | {REQ-ID}-002 | 監査観点は、ADR から Decision への移行残存、撤去済み Artifact Graph への現行参照、旧 SPEC または旧 Design パス、旧 command または旧 skill 名称、未解決 ID と未解決プレースホルダー、Gxx の書式・開始番号・欠番・重複・本文参照整合性、手順表現と工程表現の混在、責務所有者の不一致、削除済み機能への現行参照、同一契約の複数箇所定義による矛盾とすること |
      | {REQ-ID}-003 | 対象範囲内の全成果物について、監査結果を pass、fail、blocked、not applicable のいずれかで記録すること |
      | {REQ-ID}-004 | 各検出事項に、対象ファイル、該当箇所、現在の記述、正と判断した根拠、問題クラス、修正候補、再発防止可能性を記録すること |
      | {REQ-ID}-005 | 検出事項を個別ファイル単位だけでなく、原因別の問題クラス一覧として集約すること |
      | {REQ-ID}-006 | 現行概念としての旧表記と、歴史的参照として許容される識別子を区別すること。テンプレートまたは例示におけるプレースホルダー（{command-name} 等）は実行時配布対象と区別して扱うこと |
      | {REQ-ID}-007 | 正規契約が確定できない事項は blocked として追加で必要な判断事項を明示し、監査中に独断で確定しないこと |
      | {REQ-ID}-008 | 未監査項目が残る場合、監査完了として報告しないこと |
      | {REQ-ID}-009 | 監査結果を、問題クラス、判定区分、証拠項目を含む形式で保存し、横断正規化と回帰検査の入力として引き渡せる状態にすること |

      ## 適用範囲

      - **対象**:
        - 一回限りの網羅監査の実行契約（対象範囲、監査観点、判定区分、証拠項目、問題クラス集約、blocked の扱い、未監査項目の取り扱い、監査結果の保存形式要件）
      - **対象外**:
        - 監査結果の保存形式の詳細スキーマと保存先の物理設計（Design）
        - 個別修正の実行（横断正規化の要件が所有）
        - 機械検査の実装と検査クラスの定義詳細（REQ-010 と integrity 関連 Design が所有）
        - 恒常的な意味診断の運用（inspect 系 command）
        - Git 履歴そのものの書き換え、過去 Issue または PR 本文の修正、TIM の再設計、新機能の追加、外部ツールへの置換、監査で新たに判明した設計判断の独断での確定
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:cross-cutting-normalization
    source_items: [AG-004, AG-005]
    content: |
      ## 目的

      網羅監査で fail と判定された不整合のうち、修正方法を既存合意または正規契約から一意に導ける事項に
      ついて、横断正規化後に現行成果物が満たすべき状態を所有する。現行成果物が現在の正規契約を一貫して
      表現する状態を回復し、正規化が公開挙動を独断で変更しない安全境界を維持する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | {REQ-ID}-001 | 現在概念としての旧 ADR 表記が、正規化後の対象範囲に残存しないこと |
      | {REQ-ID}-002 | 歴史的 ADR 識別子（歴史的参照として許容されるもの）が、現行語彙への置換によって変更されていないこと |
      | {REQ-ID}-003 | 実行時配布対象に未解決の DEC-{N}、REQ-{...} 等の表記が残存しないこと。ただし明示的に許容されたテンプレートまたは例示は除くこと |
      | {REQ-ID}-004 | 全対象 command のガードレール番号が G01 から Gn までの連番であり、重複がなく、同一 command 内の不存在参照がないこと |
      | {REQ-ID}-005 | ガードレール番号の変更に伴い、変更前番号から変更後所在への変換対照表が保持されていること |
      | {REQ-ID}-006 | 公開 command の前提条件、出力契約、検証基準の表現が工程表形式に統一され、公開 command に適用されない旧 Step 規則が残存しないこと |
      | {REQ-ID}-007 | 削除済み Artifact Graph 等の撤去済み機能を現在機能として参照する現行成果物が残存しないこと |
      | {REQ-ID}-008 | 旧パス、旧名称、旧 extension 種別が現行体系の表記に修正されていること |
      | {REQ-ID}-009 | 修正方法を既存合意または正規契約から一意に導けない事項、および意味変更や公開挙動の変更を伴う事項が、修正されず blocked として報告されていること |
      | {REQ-ID}-010 | 各修正単位について、修正前、正規化、既存検査、対象固有検査、差分レビューの結果が記録されていること |

      ## 適用範囲

      - **対象**:
        - 横断正規化後の状態要件（旧 ADR 表記、未解決プレースホルダー、ガードレール番号の連番と変換対照表、工程表形式、撤去済み機能参照、旧パス・旧名称・旧 extension 種別）
        - 正規化の安全境界（一意に導けない事項の blocked 処理、歴史的識別子の保持、公開挙動の意図的変更の禁止）
        - 修正検証の記録要件（修正前、正規化、既存検査、対象固有検査、差分レビュー）
      - **対象外**:
        - 新規設計判断が必要な事項（blocked として報告し対象外）
        - 要件変更、現行公開 IF の意図的変更、integrity 体系全体の再編、新しい command または skill の追加
        - 歴史的記録、過去 Issue、過去 PR の書き換え
        - 個別ファイルの編集手段、置換手順、差分の適用順（後続の Issue と作業記録）
        - 監査の実行契約（網羅監査の要件が所有）、機械検査の定義（REQ-010 と integrity 関連 Design が所有）
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-006, AG-007, AG-008]
    content: |
      ## 要件（追記行。行番号は req-save が採番時に確定する）

      | ID | 要件 |
      |---|---|
      | REQ-010-064 | docs-check は公開 command 内のガードレール番号について、開始番号（G01 起点）、欠番、重複、および定義されていないガードレール番号への本文参照を検出すること |
      | REQ-010-065 | docs-check は実行時配布対象に残る未解決プレースホルダー（DEC-{N}、REQ-{...} 等）を検出すること。ただし正規テンプレート内の意図的なプレースホルダーは、対象種別と許容条件に従って誤検出しないこと |
      | REQ-010-066 | docs-check は現行概念として使用される廃止語彙（旧 ADR 表記等）を検出すること。ただし許容された歴史的識別子（v2:ADR-0123 等）は誤検出しないこと |
      | REQ-010-067 | docs-check は現行参照として残る旧パスおよび削除済み名称を検出すること |
      | REQ-010-068 | 新規検査クラスごとに、正常例、違反例、境界例、許容例、過去に発生した再現例を含む回帰テストが存在すること（REQ-010-010 準拠） |

      ## 適用範囲（対象節への追記文）

      - **対象へ追加**: 公開 command のガードレール番号不変量検査（開始番号、欠番、重複、未定義参照）、実行時配布対象の未解決プレースホルダー検査（許容条件付き）、廃止語彙検査（歴史的識別子許容付き）、旧パス・削除済み名称検査、新規検査クラスの回帰テスト義務
      - **対象外へ追加**: 検出シグナルの正規表現、許容条件の判定実装、fixture 配置、checker 個別ルール（integrity 関連 Design と checker 実装が所有）、自然言語上の意味矛盾や責務分界の妥当性判断（意味診断は inspect 系）
  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:canonical-rule-ownership-one-way
    source_items: [AG-009, AG-010, AG-011, AG-012]
    content: |
      ## 目的

      同一規則を Design、検査用定義、checker、Skill 説明、test が独立して所有すると、変更時に一部だけ
      更新されて不整合が生じる。本 REQ は、正規契約から機械検査までの情報流を一方向とし、対象規則ごとに
      正規所有者を一意に定め、派生検査の陳腐化を検出できる状態を所有する。すべての規則を自動生成する
      ことを目的とせず、意味上の正規所有者の一意化と陳腐化検出に限る。

      ## 要件

      | ID | 要件 |
      |---|---|
      | {REQ-ID}-001 | 対象規則（command format、ガードレール番号、廃止語彙と旧パス、配布境界、同種の integrity 検査定義）ごとに、正規契約、機械判定可能な定義、checker、test の対応が整理され、正規所有者が一意に定義されていること |
      | {REQ-ID}-002 | 正規所有者が複数候補に分かれる場合は、契約の意味を決定する成果物を一つに定め、他の成果物が派生定義、実装詳細、検証資産のいずれかとして位置付けられていること |
      | {REQ-ID}-003 | 対象範囲内で、検査定義と checker が同一規則を独立して所有する箇所が解消されているか、独立所有の理由と同期条件が明示されていること |
      | {REQ-ID}-004 | 正規契約を変更した場合に、検査定義または checker の更新漏れを検出できること |
      | {REQ-ID}-005 | 既存の正常入力が、一方向化だけを理由に不要な fail へ変化しないこと。既存 checker の外部契約を必要なく変更しないこと |
      | {REQ-ID}-006 | 対象 command の Step 形式について、対象 command に適用される相反する正規定義が存在しないこと |
      | {REQ-ID}-007 | 既存の構成を単純化するだけで一方向化できる場合は生成機構を新設せず、新設した仕組みが既存方式より複雑になっていないことをレビューで確認していること |
      | {REQ-ID}-008 | 文書種別間での正規所有権の移動など所有権モデル自体の変更、汎用ルールエンジン等の新基盤の導入、既存 accepted Decision の委任と衝突する所有者決定が必要になった事項は、独断で採用せず、Decision 要否の再判断を含む追加判断へ引き渡すこと |

      ## 適用範囲

      - **対象**:
        - 対象規則の正規所有者の一意化と派生関係の位置付け（派生定義、実装詳細、検証資産）
        - 検査定義と checker の独立所有の解消または同期条件の明示
        - 正規契約変更に伴う派生定義・checker の陳腐化検出
        - 外部挙動の維持（既存の正常入力の不要な fail 化の禁止、既存 checker 外部契約の不変更）
        - 相反する正規定義の不存在、生成機構の新設禁止、追加判断への引き渡し条件
      - **対象外**:
        - すべての AgentDevFlow 契約を一つの巨大スキーマへ統合すること
        - 新規 DSL、外部ルールエンジンの導入、意味的レビューの自動化、TIM の設計変更
        - 重複が実証されていない全規則の一括再編
        - 実装の具体的な生成方式、定義ファイルの形式、checker の参照 API（正規所有者を決めた後に Design または作業記録へ分離）

conflict_resolutions:
  - id: CR-001
    conflict: work_type を maintenance（是正中心）とするか feature（REQ/Design 保存を伴う体系的改善）とするか
    resolution: |
      feature に確定した。RU-0003（機械検査クラスの REQ-010 追記）と RU-0004（一方向化の新規 REQ 化）
      は REQ/Design の保存を伴う体系的改善であり、req-save/design-save を経由しない direct_case 経路
      （maintenance）では処理できないためである。ユーザー合意済み（2026-08-22 壁打ち）。
  - id: CR-002
    conflict: RU-0001（監査）と RU-0002（正規化）を単一 REQ に統合するか分離するか
    resolution: |
      分離に確定した（4 OU 構成）。監査は一回限りで完了後 retire 候補（REQ-025/026/028 の監査 REQ 先例
      に準拠）、正規化不変条件は RU-0003 検査の正規基盤として恒久。統合すると監査側 retire 時に恒久
      不変条件も失われるため、時命差に基づき分離した。ユーザー合意済み（2026-08-22 壁打ち）。
  - id: CR-003
    conflict: RU-0004 の一方向化原則に新しい Decision が必要か
    resolution: |
      Decision 不要と判定した（agentdev-architecture-advisory の4ラベル助言を採用）。一方向化原則は
      既存正規所有モデル（REQ-001-042、REQ-010-062、rule-ownership Design、v2:ADR-0139 系譜）の
      運用強化であり、所有権モデル自体の置換を含まない。同一形状の原則は REQ-010-062 として REQ 行で
      先行実装済み。エスカレーション条件（所有権モデル自体の変更、汎用ルールエンジン等の新基盤導入、
      既存 accepted Decision との所有者衝突）を AG-012 として要件行化し、該当時に Decision 要否を
      再判断する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: new:consistency-completeness-audit
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-001
      saved_reqs: [REQ-045]
      source_ru: RU-0001
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: new:cross-cutting-normalization
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-002
      saved_reqs: [REQ-046]
      source_ru: RU-0002
  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-003
      saved_reqs: [REQ-010]
      appended_row_ids: [REQ-010-064, REQ-010-065, REQ-010-066, REQ-010-067, REQ-010-068]
      source_ru: RU-0003
  - ou_id: OU-004
    source_ru: RU-0004
    target_req: new:canonical-rule-ownership-one-way
    operation: create
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result:
      status: saved
      artifact_action: ACT-REQ-004
      saved_reqs: [REQ-047]
      source_ru: RU-0004

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      監査実行後、監査結果レポートの対象範囲チェックリストと監査観点を本要件の対象範囲・観点と照合する。
      対象範囲に挙げた全領域（src/opencode、.opencode、docs/requirements、docs/designs、現行テンプレート、
      integrity 検査定義・検査コード・テスト、extension 定義、現行ワークフローから直接参照される
      .agentdev 契約・設定）の監査結果が存在することを確認する。
    pass_criteria: |
      全対象領域について監査結果が存在し、各監査観点が全対象領域に適用されている。対象範囲の
      未実施領域が0件である。
    on_failure: |
      fix-and-reverify: 未実施領域を特定し監査を追加実行した上で再照合する。監査は網羅性が本質的
      契約であるため、部分完了の受け入れは行わない。
  - id: TS-002
    target_item: AG-002
    verification: |
      監査結果の全エントリについて、4値判定（pass/fail/blocked/not applicable）と証拠7項目（対象ファイル、
      該当箇所、現在の記述、正と判断した根拠、問題クラス、修正候補、再発防止可能性）の有無を検収する。
      問題クラス一覧の存在と blocked 項目への追加判断事項の明示を確認する。
    pass_criteria: |
      4値判定・証拠項目の欠落エントリが0件である。原因別の問題クラス一覧が存在する。blocked 項目の
      全てに追加判断事項が明示されている。
    on_failure: |
      fix-and-reverify: 欠落エントリを補完し再検収する。blocked 項目の判断事項が確定できない場合は
      監査結果を blocked として維持し、独断で確定しない。
  - id: TS-003
    target_item: AG-003
    verification: |
      検出事項のうち、歴史的識別子（v2:ADR-0123 等）とテンプレート・例示のプレースホルダー
      （{command-name} 等）が現行不整合として誤分類されていないか、許容条件との突合により検証する。
    pass_criteria: |
      歴史的識別子および許容プレースホルダーの誤分類が0件である。
    on_failure: |
      fix-and-reverify: 誤分類を訂正し再検証する。許容条件自体に欠陥がある場合は監査結果の
      該当項目を blocked に分類し直す。
  - id: TS-004
    target_item: AG-004
    verification: |
      正規化完了後、blocked として報告された項目が修正されていないことと、各 blocked 報告に
      「一意に導けない根拠」または「意味変更を伴う根拠」が付いていることを確認する。歴史的 ADR 識別子が
      変更されていないことを正規化前後の差分で検証する。
    pass_criteria: |
      blocked 項目の修正が0件であり、全 blocked 報告に根拠が付いている。許容済み歴史的識別子の変更が0件である。
    on_failure: |
      fix-and-reverify: 誤って修正された blocked 項目を差し戻し、根拠を補った上で再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      正規化完了後、全公開 command のガードレール番号が G01 起点の連番で重複がないことを検査で確認する。
      変換対照表の存在と、各修正単位の記録（修正前、正規化、既存検査、対象固有検査、差分レビュー）の
      有無を確認する。実行時配布対象の未解決プレースホルダー残存を検査で確認する。
    pass_criteria: |
      全対象 command で連番・重複0・不存在参照0である。変換対照表が存在する。全修正単位の記録が
      揃っている。許容対象以外の未解決プレースホルダーが0件である。
    on_failure: |
      fix-and-reverify: 残存不整合を修正し再検査する。修正方法が一意に導けない項目は blocked として
      報告に切り替える（修正を継続しない）。
  - id: TS-006
    target_item: AG-006
    verification: |
      各新規検査クラスの checker について、違反例を fail、正常例を pass することを確認する。
      ガードレール番号クラスは連番例の pass、欠番例・重複例・未定義参照例の fail を確認する
      （RU-0003 AC-001〜004 相当の fixture）。
    pass_criteria: |
      全新規検査クラスで正常例 pass・違反例 fail である。全 integrity 検査が pass する。
    on_failure: |
      fix-and-reverify: checker の検出ロジックを修正し再検証する。検出不能な意味論は検査対象から
      除外しレビュー扱いとする（機械検査へ無理に落とし込まない）。
  - id: TS-007
    target_item: AG-007
    verification: |
      許容 fixture（正規テンプレート内の意図的なプレースホルダー、v2:ADR-0123 等の歴史的識別子）が
      fail しないことを確認する。検査対象種別と除外条件の明示を確認する。
    pass_criteria: |
      許容 fixture の誤検出が0件である。検査対象種別と除外条件が明示されている。
    on_failure: |
      fix-and-reverify: 誤検出抑制条件を修正し再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      新規検査クラスごとの回帰テストが、正常例、違反例、境界例、許容例、過去に発生した再現例を含む
      ことを確認し、全テストを実行する。
    pass_criteria: |
      全回帰テストが pass する。5種の例を欠く検査クラスが0件である。
    on_failure: |
      fix-and-reverify: 欠落する例を追加し再実行する。
  - id: TS-009
    target_item: AG-009
    verification: |
      対象規則ごとの所有権マトリックス（rule-ownership Design 等）が更新され、各規則の正規所有者が
      一意であることを照合する。複数候補が残る規則では、意味を決定する成果物が一つに定められ、他が
      派生定義・実装詳細・検証資産のいずれかに位置付けられていることを確認する。
    pass_criteria: |
      正規所有者が一意でない規則が0件である（または独立所有の理由と同期条件が明示済みである）。
    on_failure: |
      fix-and-reverify: 所有権マトリックスを修正し再照合する。所有権モデル自体の変更が必要な項目は
      AG-012 の追加判断へ引き渡す。
  - id: TS-010
    target_item: AG-010
    verification: |
      正規契約を模擬変更したテスト条件下で、派生検査定義・checker の更新漏れ検出機構が作動することを
      確認する。
    pass_criteria: |
      更新漏れが検出される（検出なしで通過しない）。
    on_failure: |
      fix-and-reverify: 検出機構を修正し再検証する。既存方式の単純化で実現できない場合は AG-012 の
      追加判断へ引き渡す。
  - id: TS-011
    target_item: AG-011
    verification: |
      既存の正常入力に対する checker 実行結果を一方向化前後で比較する。新設した仕構えの複雑さを
      既存方式と比較してレビューする。
    pass_criteria: |
      不要な fail の増加が0件である。既存 checker の外部契約変更が0件である。新設仕組みが既存方式
      以下の複雑さであることをレビュー記録が示している。
    on_failure: |
      fix-and-reverify: 外部挙動を復元し再比較する。複雑化している場合は単純化して再レビューする。
  - id: TS-012
    target_item: AG-012
    verification: |
      一方向化の実行結果について、所有権モデル自体の変更、新基盤の導入、既存 accepted Decision との
      衝突する所有者決定が独断で採用されていないことを、追加判断記録の有無で確認する。
    pass_criteria: |
      該当事項の独断確定が0件であり、該当候補がすべて追加判断へ引き渡されている。
    on_failure: |
      fix-and-reverify: 独断確定を差し戻し追加判断へ引き渡した上で再確認する。
  - id: TS-013
    target_item: AG-013
    verification: |
      新規に作成した網羅監査 REQ の文面が恒常的な診断責務を宣言していないことを検証する。
      docs-check と inspect 系の責務境界（REQ-010-004）と突合する。
    pass_criteria: |
      恒常的診断責務を解釈させる記述が存在しない。監査の位置づけが一回限りの実行として明記されている。
    on_failure: |
      fix-and-reverify: 要件文を修正し再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001-all
    disposition: covered
    reason_code: fully_absorbed
    reason: |
      RU-0001 の目的、対象、監査観点、判定区分、証拠項目、問題クラス集約、blocked 処理、決定的受け入れ
      条件（AC-001〜010）は ACT-REQ-001（新規 REQ: consistency-completeness-audit）の要件行へ
      全て反映した。監査の位置づけ（一回限り case 実行）は AG-013 として壁打ちで確定し要件行化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002-all
    disposition: covered
    reason_code: fully_absorbed
    reason: |
      RU-0002 の正規化対象、安全境界（blocked 処理、歴史的識別子保持、公開挙動変更禁止）、検証記録、
      決定的受け入れ条件（AC-001〜010）は ACT-REQ-002（新規 REQ: cross-cutting-normalization）の
      要件行へ全て反映した。作業手段（編集手段、置換手順、適用順）は RU の対象外宣言どおり作業記録側へ
      分離した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003-all
    disposition: covered
    reason_code: fully_absorbed
    reason: |
      RU-0003 の機械検査クラス、誤検出抑制条件、回帰テスト義務、決定的受け入れ条件（AC-001〜010）は
      ACT-REQ-003（REQ-010 への追記）へ全て反映した。機械判定できない事項の除外（自然言語上の意味矛盾、
      責務分界判断）も反映している。checker 実装詳細は RU の対象外宣言どおり Design・実装側へ分離した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004-all
    disposition: covered
    reason_code: fully_absorbed
    reason: |
      RU-0004 の正規所有者一意化、派生関係の位置付け、陳腐化検出、外部挙動維持、新基盤非導入、
      決定的受け入れ条件（AC-001〜009）は ACT-REQ-004（新規 REQ: canonical-rule-ownership-one-way）へ
      全て反映した。RU 本文が要求した「正規所有者決定時の Decision 要否判断」は、architecture-advisory
      助言（Decision 不要、エスカレーション条件付き）を採用し AG-012 として要件行化した
      （CR-003 に判断根拠を記録）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    4 OU を厳密な依存連鎖（OU-001 → OU-002 → OU-003 → OU-004）として構成する。監査結果が正規化の
    入力、正規化結果が検査の許容例入力、検査と所有権整理が一方向化の対象となるため、逐次実行が必須。
    各 OU は単一 Issue（issue_policy: single）とする。
  wave_hints:
    - "Wave 1: OU-001（監査REQ作成）"
    - "Wave 2: OU-002（正規化REQ作成）"
    - "Wave 3: OU-003（REQ-010 追記）"
    - "Wave 4: OU-004（一方向化REQ作成）"
```

# summary

Phase 1〜4RU（RU-0001〜0004）を4 REQ 操作へ展開した。監査（一回限り、retire 候補）と正規化不変条件（恒久）を時命差で分離し、機械検査は REQ-010 へ追記、一方向化は新規 REQ とした。Decision は不要（CR-003 参照）。Engineering 表形式の相反（command-file-format Design の工程表 vs Step N 覚書）は監査・正規化・一方向化の各段で解消対象となることを確認済み。
