---
draft_type: req_draft
topic_slug: adf-execution-efficiency-phase1
status: saved
created_at: 2026-08-23T00:35:37+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  OpenCode セッション分析で確認された ADF 実行上の重複に対し、品質、自律性、独立検証の価値を損なわずに、実行追跡・評価可能性、工程間の構造化文脈引き継ぎ、source / projection 参照経路、検証・finding の観測可能化の4領域を第1次改善する。
  実行観測は OpenCode 内部履歴の複製ではなく、既存正規情報源（Issue 本文、PR 本文、RU、OU 等）への構造化識別情報の記録で実現する（DEC-015、DEC-017、DEC-002 の適用拡張。Decision 不作成はユーザー承認済み）。
  サブエージェント、文書、検証、レビューの一律削減は行わない。RU-0001 由来。通常Case（実証なし）、単一 REQ（21要件行）として要件化し、実装の分解は operation_units と case_open_hints に表現する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ADF が生成、委譲、処理する実行について、対象 Case、GitHub Issue、GitHub PR、ADF 工程、実行単位、委譲目的、実行結果、親子実行関係の追跡に必要な識別情報を、機械的に識別できる構造化された形式で記録すること。
      記録された識別情報は、OpenCode セッション履歴と ADF 成果物を後から安定して対応付けるために使用できること。自由文中に偶然出現する ID のみを根拠に対応付けを行わないこと。
      識別情報の記録先は、ADF が正規情報源として利用する既存成果物（Issue 本文、PR 本文、RU、OU 等）とすること。識別情報記録専用の新規成果物種別または実行履歴 DB を新設しないこと。識別情報の記録先の配置は Design が一意に定め、工程間で一貫すること。
  - id: AG-002
    content: |
      親子実行関係の識別は、ADF が発行・制御する識別情報（委譲単位・実行単位の識別子）を正規手段とすること。OpenCode 等の harness 側識別子は、取得可能な場合の付加情報に限定すること（REQ-011-018 準拠）。
      OpenCode 側の token、model、tool call、message、part、compaction 等の詳細実行履歴を ADF 側へ重複保存しないこと。ADF 側は、OpenCode の実行履歴と ADF の Case、Issue、PR、工程、実行単位を結び付けるために必要な情報を優先して保持すること。
      OpenCode または外部実行基盤から取得できない内部識別子を必須契約としないこと。識別情報の一部が取得不能であっても ADF workflow が停止しないこと。
  - id: AG-003
    content: |
      ADF の工程間、および親エージェントから実行担当サブエージェントへの委譲時に、目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報を、構造化して引き継げること。
  - id: AG-004
    content: |
      後工程は、引き継がれた確定済み事項を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としないこと。ただし、独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認を禁止しないこと。
  - id: AG-005
    content: |
      引き継ぎに全文履歴または巨大な計画本文の毎回複製を要求しないこと。
      引き継ぎ情報を、REQ、Decision、Design、GitHub Issue、PR 等に代わる新たな正規情報源としないこと。引き継ぎ内容は、永続的な正規成果物から再構成可能であること（会話記憶に依存しない再開、DEC-011 準拠）。
      委譲時最小契約の骨格（入力、副作用境界、出力契約、capture 引継ぎ。REQ-003-006）を変更しないこと。構造化文脈は、委譲時最小契約の入力内の構造化内容として直列化すること（直列化形式は Design が所有すること）。
  - id: AG-006
    content: |
      実行目的に応じて、正規原本（source）を確認すべき場合、実行時投影（projection）を確認すべき場合、双方の整合確認が必要な場合を判別できること。「常に source のみ」「常に projection のみ」のような固定ルールとしないこと。
      工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せること。
  - id: AG-007
    content: |
      source / projection 双方の確認が品質保証上必要な場合は、その確認を維持すること。source / projection 責務境界自体の変更が必要となった場合は、当該要件の暗黙事項として扱わず、正規の設計判断を行うこと。
  - id: AG-008
    content: |
      case-run、case-close、レビュー等で行われる検証について、検証種別と検証結果に加え、前段階から何が変化したかを後から判定できること。新規 finding、修正済み finding、既出 finding、撤回または無効となった finding を区別して記録できること。
      同じ種類の検証が複数工程で行われた場合、後続検証が追加価値を持ったかを後から比較できること。
  - id: AG-009
    content: |
      検証結果と finding の差分を、既存の PR 本文、GitHub Issue 本文、Issue コメント等、ADF が正規情報源として利用する成果物に記録すること。この目的だけのために独立した実行履歴 DB を新設せず、新しい正規成果物種別を追加しないこと。
      審議中の finding 状態の追跡（REQ-003-042）と、品質ゲート完了報告における欠陥類型単位の修正証跡（REQ-007-005）の所有境界を変更しないこと。
  - id: AG-010
    content: |
      本要件を根拠として、サブエージェント数、並列度、REQ、Decision、Design、Skill、reference 等の文書、case-run の検証、case-close の検証、独立レビューを一律削減しないこと。削減要否は、本要件実施後の観測結果から別途判断すること。
      OpenCode 本体の変更、harness 内部の context 管理方式変更、provider の token 計測または課金方式変更、OpenCode DB スキーマ変更を、本要件の成立条件としないこと。
  - id: AG-011
    content: |
      本要件の実施後は、論理実行単位当たり token、token 分布、同一 path 再読込、子セッション間の同一 path 再読込、source / projection 重複参照、工程間の同種検証、新規・修正・既出 finding、Case・GitHub Issue・PR・実行単位・ADF 工程の対応付け率、構造化された文脈引き継ぎの利用状況を、改善前の分析定義と比較可能な形で再分析できること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adf-execution-efficiency-phase1
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010, AG-011]
    content: |
      # REQ-{NNNN}: ADF 実行効率第1次改善（実行観測基盤）

      ## 目的

      OpenCode セッション履歴の分析で確認された ADF 実行上の重複に対し、品質、自律性、独立検証の価値を損なわずに、実行追跡・評価可能性、工程間の構造化された文脈引き継ぎ、source / projection 参照経路、検証・finding の追加価値の観測可能化を第1次改善する。

      実行観測は OpenCode 内部履歴の複製ではなく、既存の正規情報源（Issue 本文、PR 本文、RU、OU 等）への構造化識別情報の記録で実現する（DEC-015、DEC-017、DEC-002 の適用拡張）。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-NNNN-001 | ADF が生成、委譲、処理する実行について、対象 Case、GitHub Issue、GitHub PR、ADF 工程、実行単位、委譲目的、実行結果、親子実行関係の追跡に必要な識別情報を、機械的に識別できる構造化された形式で記録すること |
      | REQ-NNNN-002 | 記録された識別情報は、OpenCode セッション履歴と ADF 成果物を後から安定して対応付けるために使用できること。自由文中に偶然出現する ID のみを根拠に対応付けを行わないこと |
      | REQ-NNNN-003 | 親子実行関係の識別は、ADF が発行・制御する識別情報（委譲単位・実行単位の識別子）を正規手段とすること。OpenCode 等の harness 側識別子は、取得可能な場合の付加情報に限定すること（REQ-011-018 準拠） |
      | REQ-NNNN-004 | OpenCode 側の token、model、tool call、message、part、compaction 等の詳細実行履歴を ADF 側へ重複保存しないこと。ADF 側は、OpenCode の実行履歴と ADF の Case、Issue、PR、工程、実行単位を結び付けるために必要な情報を優先して保持すること |
      | REQ-NNNN-005 | OpenCode または外部実行基盤から取得できない内部識別子を必須契約としないこと。識別情報の一部が取得不能であっても ADF workflow が停止しないこと |
      | REQ-NNNN-006 | 識別情報の記録先は、ADF が正規情報源として利用する既存成果物（Issue 本文、PR 本文、RU、OU 等）とすること。識別情報記録専用の新規成果物種別または実行履歴 DB を新設しないこと。識別情報の記録先の配置は Design が一意に定め、工程間で一貫すること |
      | REQ-NNNN-007 | ADF の工程間、および親エージェントから実行担当サブエージェントへの委譲時に、目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報を、構造化して引き継げること |
      | REQ-NNNN-008 | 後工程は、引き継がれた確定済み事項を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としないこと。ただし、独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認を禁止しないこと |
      | REQ-NNNN-009 | 引き継ぎに全文履歴または巨大な計画本文の毎回複製を要求しないこと |
      | REQ-NNNN-010 | 引き継ぎ情報を、REQ、Decision、Design、GitHub Issue、PR 等に代わる新たな正規情報源としないこと。引き継ぎ内容は、永続的な正規成果物から再構成可能であること（DEC-011 準拠） |
      | REQ-NNNN-011 | 委譲時最小契約の骨格（入力、副作用境界、出力契約、capture 引継ぎ。REQ-003-006）を変更しないこと。構造化文脈は、委譲時最小契約の入力内の構造化内容として直列化すること（直列化形式は Design が所有すること） |
      | REQ-NNNN-012 | 実行目的に応じて、正規原本（source）を確認すべき場合、実行時投影（projection）を確認すべき場合、双方の整合確認が必要な場合を判別できること。「常に source のみ」「常に projection のみ」のような固定ルールとしないこと |
      | REQ-NNNN-013 | 工程間の文脈引き継ぎ等を利用して、当該作業で使用すべき解決済み参照先を後工程へ渡せること |
      | REQ-NNNN-014 | source / projection 双方の確認が品質保証上必要な場合は、その確認を維持すること。source / projection 責務境界自体の変更が必要となった場合は、当該要件の暗黙事項として扱わず、正規の設計判断を行うこと |
      | REQ-NNNN-015 | case-run、case-close、レビュー等で行われる検証について、検証種別と検証結果に加え、前段階から何が変化したかを後から判定できること。新規 finding、修正済み finding、既出 finding、撤回または無効となった finding を区別して記録できること |
      | REQ-NNNN-016 | 検証結果と finding の差分を、既存の PR 本文、GitHub Issue 本文、Issue コメント等、ADF が正規情報源として利用する成果物に記録すること。この目的だけのために独立した実行履歴 DB を新設せず、新しい正規成果物種別を追加しないこと |
      | REQ-NNNN-017 | 同じ種類の検証が複数工程で行われた場合、後続検証が追加価値を持ったかを後から比較できること |
      | REQ-NNNN-018 | 審議中の finding 状態の追跡（REQ-003-042）と、品質ゲート完了報告における欠陥類型単位の修正証跡（REQ-007-005）の所有境界を変更しないこと |
      | REQ-NNNN-019 | 本要件を根拠として、サブエージェント数、並列度、REQ、Decision、Design、Skill、reference 等の文書、case-run の検証、case-close の検証、独立レビューを一律削減しないこと。削減要否は、本要件実施後の観測結果から別途判断すること |
      | REQ-NNNN-020 | OpenCode 本体の変更、harness 内部の context 管理方式変更、provider の token 計測または課金方式変更、OpenCode DB スキーマ変更を、本要件の成立条件としないこと |
      | REQ-NNNN-021 | 本要件の実施後は、論理実行単位当たり token、token 分布、同一 path 再読込、子セッション間の同一 path 再読込、source / projection 重複参照、工程間の同種検証、新規・修正・既出 finding、Case・GitHub Issue・PR・実行単位・ADF 工程の対応付け率、構造化された文脈引き継ぎの利用状況を、改善前の分析定義と比較可能な形で再分析できること |

      ## 適用範囲

      ### 対象

      - ADF 配布物（command、skill、template）と docs（REQ、Design）における実行識別情報の記録、工程間・委譲時の構造化文脈引き継ぎ、source / projection 参照解決、検証結果と finding 差分の記録の各契約
      - RU-0001（OpenCode セッション分析に基づく ADF 実行効率の第1次改善）に由来する4領域の要件化

      ### 対象外

      - サブエージェント探索責務の分割実装（RU-0002 の課題管理機構導入後に再評価）
      - 検証工程の削除、文書体系の一律削減
      - モデル選択最適化、provider 間の費用対効果評価
      - OpenCode / harness 自体の改修、OpenCode 内部履歴の ADF 側への複製保存
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/workflows/delegation-contracts.md
    target_area: "## 構造化文脈引き継ぎ（委譲時）の直列化契約"
    placement: tail
    source_items: [AG-003, AG-005]
    content: |
      ## 構造化文脈引き継ぎ（委譲時）の直列化契約

      委譲時最小契約（inputs、side_effect_boundary、output_contract、capture_handoff）の骨格を変更せず、inputs 内に構造化文脈を直列化する。構造化文脈は次の意味を扱う。

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

      ADF は委譲単位識別子を発行し、親子実行関係の識別の正規手段とする。委譲 prompt には対象 Case、Issue、PR、ADF 工程、実行単位、委譲目的の識別情報を構造化して含める。OpenCode 等の harness 側セッション識別子は、取得可能な場合に付加情報として記録し、必須契約としない（REQ-011-018 準拠）。

      構造化文脈は新しい正規情報源ではない。引き継ぎ内容は永続的な正規成果物（Issue 本文、PR 本文、RU、OU 等）から再構成可能であること（DEC-011 準拠）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/workflows/workflow-contracts.md
    target_area: "## 工程間構造化文脈引き継ぎ契約"
    placement: tail
    source_items: [AG-003, AG-004, AG-005]
    content: |
      ## 工程間構造化文脈引き継ぎ契約

      ADF の工程間の引き継ぎは、委譲時の構造化文脈と同一の意味集合（目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報）を扱う。工程間の直列化形式は本 Design が所有し、委譲時の直列化（delegation-contracts Design「構造化文脈引き継ぎ（委譲時）の直列化契約」）と意味対応を保つ。

      後工程は、引き継がれた確定済み事項を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認は維持する。

      引き継ぎ情報を REQ、Decision、Design、GitHub Issue、PR 等に代わる新たな正規情報源としない。引き継ぎ内容は永続的な正規成果物から再構成可能であり、会話記憶に依存する再開を許可しない（DEC-011 準拠）。

      当該作業で使用すべき解決済み参照先（正規原本、実行時投影、双方確認の別を含む）は、構造化文脈の正規参照先として後工程へ渡す。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/workflows/workflow-contracts.md
    target_area: "## ADF 実行識別情報の記録契約"
    placement: tail
    source_items: [AG-001, AG-002, AG-011]
    content: |
      ## ADF 実行識別情報の記録契約

      ADF 実行の識別情報（対象 Case、GitHub Issue、GitHub PR、ADF 工程、実行単位、委譲目的、実行結果、親子実行関係）の記録先を次のとおり一意に定め、工程間で一貫させる。

      - Issue 本文: 対象 Case、Issue、ADF 工程、実行単位、前工程で確定した事項
      - PR 本文: 対象 Case、PR、実行単位、実行結果、検証種別と検証結果
      - RU / OU: 要件単位・操作単位の識別情報
      - 委譲 prompt（委譲時）: 委譲目的、委譲単位識別子、親子実行関係

      実行単位の識別は epic-wave-model Design の execution_unit 構成の既存定義に接続し、新規の識別体系を並立させない。親子実行関係は ADF が発行する委譲単位・実行単位識別子を正規手段とし、harness 側識別子（OpenCode session ID 等）は取得可能な場合の付加情報に限定する（REQ-011-018 準拠）。

      OpenCode の実行履歴と ADF の識別情報の対応付けは、実行後の分析において OpenCode セッションデータと ADF 側識別情報を結合して行う。再分析の比較基線として、改善前分析で用いた定義（論理実行単位、正規化 path、集計方法）を参照可能な形で保存する。識別情報の一部が取得不能でも ADF workflow は停止しない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_area: "## 実行識別情報・検証差分のテンプレートセクション形式"
    placement: tail
    source_items: [AG-001, AG-008, AG-009]
    content: |
      ## 実行識別情報・検証差分のテンプレートセクション形式

      Issue テンプレートと PR テンプレートに、実行識別情報と検証差分を構造化して記録するセクションを定義する。

      - Issue テンプレート: 対象 Case、ADF 工程、実行単位、前工程で確定した事項を記録する識別情報セクション
      - PR テンプレート: 実行結果、検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回または無効）を記録する検証差分セクション

      検証差分セクションは、case-run の PR 本文 Findings セクション（intake / learning 小見出し）を置換せず、これと共存する（REQ-031-012 準拠）。

      本セクション形式は新規作成の Issue / PR に適用し、既存 Issue / PR へ遡及適用しない（REQ-017-013 準拠）。

conflict_resolutions:
  - id: CR-001
    conflict: 実行結果・finding 差分の保持を求める本件と、最小トレーサビリティモデル（REQ-012-035、REQ-021-019 が個々の検証実行結果を TIM 非保持と規定）との潜在的衝突
    resolution: REQ-021-019 が Issue、PR、QG への実行結果記録を既に割り当てており、本件は既存正規成果物への構造化記録として層共存する。既存 REQ/Decision の UPDATE 不要（アーキテクチャ助言 A-1 確定事項、親分類で確定採用）
  - id: CR-002
    conflict: Decision 候補 D1（実行観測の記録媒体方針）・D2（引き継ぎ情報の正規情報源非代替）の Decision 要否
    resolution: D1 は Decision 不作成（作成可条件不成立、DEC-015/DEC-017/DEC-002 の適用拡張として REQ+Design で処理。将来専用永続層提案時はその時点の新規 Decision として再評価）。D2 は REQ 行として表現。いずれもユーザー承認済み（Q4）
  - id: CR-003
    conflict: 4領域を単一 REQ とする粒度（SPLIT シグナル合計2見立て）
    resolution: 単一 REQ で進行（RU-0001 は単一合意単位、横断制約が4領域を束ねる、行数21はしきい値51を下回る）。ユーザー承認済み（Q3）。split-forecast は本 draft の SPLIT 予兆計測結果として記録済み
  - id: CR-004
    conflict: Area2 の10意味と委譲時最小契約（REQ-003-006）の二重規範化リスク
    resolution: 意味集合の規範定義は本 REQ のみが所有し、骨格は REQ-003-006 が不変で保持、直列化は Design（委譲時: delegation-contracts、工程間: workflow-contracts）が所有する3層レイヤリングで解消（アーキテクチャ助言 A-5、親分類で採用）

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: new:adf-execution-efficiency-phase1
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:
      status: saved
      artifact_action: ACT-REQ-001
      saved_reqs: [REQ-048]
      source_ru: RU-0001

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      実装後の代表 Case について、Issue 本文、PR 本文、RU、OU から実行識別情報を機械的にパースし、対象 Case、GitHub Issue、GitHub PR、ADF 工程、実行単位、委譲目的、実行結果、親子実行関係を復元できることを確認する。併せて、識別情報記録専用の新規成果物種別および実行履歴 DB が存在しないことを確認する。
    pass_criteria: |
      記録先の配置が工程間で一貫しており、自由文中の偶然の ID に依存せず全ての識別意味を復元できること。新規成果物種別・実行履歴 DB が 0 件であること。
    on_failure: |
      fix-and-reverify: 記録形式または配置を修正し、再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      識別情報スキーマ（Design）が ADF 発行識別情報（委譲単位・実行単位の識別子）を正規手段とし、harness 側識別子を必須フィールドとしていないことを査読する。OpenCode 内部履歴（token、model、tool call、message、part、compaction）を ADF 側が保存する箇所が 0 件であることを確認する。識別情報の一部を欠落させた代表 Case で ADF workflow が停止しないことを確認する。
    pass_criteria: |
      harness 側識別子が必須契約でないこと、OpenCode 内部履歴の複製箇所が 0 件であること、識別情報欠落時に workflow が停止しないこと。
    on_failure: |
      fix-and-reverify: 契約または実装を修正し、再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      親エージェントから実行担当サブエージェントへの委譲 prompt の代表実例について、目的、現在の ADF 工程、現在の実行単位、前工程で確定した事項、未確定事項、正規参照先、停止条件、期待する実行結果、後続工程へ渡すべき成果、計画変更を識別するための情報の10意味が構造化されて含まれることを確認する。
    pass_criteria: |
      10意味が全て構造化形式で渡せること。全文履歴・巨大な計画本文の複製を含まないこと。
    on_failure: |
      fix-and-reverify: 直列化スキーマと委譲 prompt 生成を修正し、再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      後工程が引き継がれた確定済み事項を初期文脈として利用する代表 Case を確認する。独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認が阻害されていないことを確認する。
    pass_criteria: |
      後工程での同一情報の再探索・再構築が原則として発生していないこと。再確認目的の参照が禁止されていないこと。
    on_failure: |
      fix-and-reverify: 引き継ぎ契約と後工程の初期文脈利用を修正し、再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      引き継ぎ情報が REQ、Decision、Design、Issue、PR の正規情報源を代替していないことを査読する。中断再開の代表試験で、引き継ぎ内容が永続的な正規成果物から再構成できること（会話記憶非依存）を確認する。委譲時最小契約の骨格（REQ-003-006）が変更されていないことを確認する。
    pass_criteria: |
      再開時に会話記憶なしで引き継ぎ文脈が復元できること。REQ-003-006 の骨格（入力、副作用境界、出力契約、capture 引継ぎ）が不変であること。
    on_failure: |
      fix-and-reverify: 再構成経路または契約を修正し、再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      正規原本確認、実行時投影確認、双方整合確認の目的判別が Design・スキルに定義され、解決済み参照先が構造化文脈引き継ぎで後工程へ渡ることを代表 Case で確認する。
    pass_criteria: |
      「常に source のみ」「常に projection のみ」の固定ルールが存在しないこと。解決済み参照先が後工程で利用可能であること。
    on_failure: |
      fix-and-reverify: 参照ポリシーと引き継ぎ項目を修正し、再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      本要件実装後も、品質保証上必要な source / projection 双方確認（整合確認）が既存の検証契約から削除されていないことを実装前後の比較で確認する。
    pass_criteria: |
      既存の独立検証・整合確認の契約が維持されていること。
    on_failure: |
      fix-and-reverify: 削除された確認を復元し、再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      case-run と case-close で同種検証を行った代表 Case について、PR 本文・Issue 本文から検証種別、検証結果、新規 finding、修正済み finding、既出 finding、撤回または無効となった finding を区別して読み取れることを確認する。
    pass_criteria: |
      検証種別・結果・finding 差分の 5 分類が構造化記述で判別可能であること。後続検証の追加価値を工程間で比較できること。
    on_failure: |
      fix-and-reverify: 記録形式を修正し、再検証する。
  - id: TS-009
    target_item: AG-009
    verification: |
      検証結果と finding 差分が既存の PR 本文・Issue 本文・Issue コメントに記録されていることを確認する。専用の実行履歴 DB・新規成果物種別が 0 件であることを確認する。REQ-003-042（審議中 finding 状態）と REQ-007-005（品質ゲート完了報告の修正証跡）の所有境界が変更されていないことを査読する。
    pass_criteria: |
      新規の永続蓄積手段が 0 件であること。所有境界の変更が 0 件であること。
    on_failure: |
      fix-and-reverify: 記録先と所有境界を修正し、再検証する。
  - id: TS-010
    target_item: AG-010
    verification: |
      本要件の実装差分が、サブエージェント数、並列度、REQ、Decision、Design、Skill、reference 等の文書、case-run の検証、case-close の検証、独立レビューの削除を含まないことを実装前後の比較で確認する。
    pass_criteria: |
      一律削減に該当する変更が 0 件であること。
    on_failure: |
      fix-and-reverify: 削減を取り消し、再検証する。
  - id: TS-011
    target_item: AG-011
    verification: |
      再分析手順（スクリプトまたは手順書）が、論理実行単位当たり token、token 分布、同一 path 再読込、子セッション間の同一 path 再読込、source / projection 重複参照、工程間の同種検証、新規・修正・既出 finding、対応付け率、文脈引き継ぎ利用状況を、改善前の分析定義と同じ定義で算出できることを実データで確認する。
    pass_criteria: |
      改善前分析と同一の定義で全項目を算出できること（比較基線となる改善前分析の定義が参照可能であること）。
    on_failure: |
      fix-and-reverify: 再分析手順を修正し、再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001.section-5
    disposition: not_applicable
    reason_code: out_of_scope_by_ru
    reason: |
      サブエージェント探索責務分割は RU-0001 自身が本 RU の対象外と明示し、課題管理機構（RU-0002）導入後の再評価待ちとして管理する趣旨であるため、本要件doc の対象から除外した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: "5. 後続課題との関係"
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition:
    - "Area1 実行識別情報: 識別スキーマ、記録契約、テンプレート識別情報セクション（REQ 行 1-6、ACT-DESIGN-001/003/004）"
    - "Area2 構造化文脈引き継ぎ: 委譲時・工程間の直列化（REQ 行 7-11、ACT-DESIGN-001/002）"
    - "Area3 source/projection 参照経路: 目的判別ポリシーと解決済み参照先渡し（REQ 行 12-14）"
    - "Area4 検証差分観測: 検証種別・結果・finding 5分類のテンプレート・記録（REQ 行 15-18、ACT-DESIGN-004）"
  wave_hints:
    - "Wave 1: Area2（文脈引き継ぎ基盤）+ Area1（識別情報）— Area3/4 が依存する基盤"
    - "Wave 2: Area3（参照経路）+ Area4（検証観測）— 基盤を利用する適用層"
```

# summary

RU-0001（OpenCode セッション分析に基づく ADF 実行効率の第1次改善）を単一 REQ 21要件行として要件化した。実行観測は既存正規情報源への構造化識別情報の記録で実現し、OpenCode 内部履歴の複製・専用 DB・一律削減を行わない。Design 候補は delegation-contracts、workflow-contracts、workflow-templates の3ファイルへの追加として分離した。通常Case、feature large（Epic 構成候補）。経路A adversarial-review の accepted finding 5件を反映済み。
