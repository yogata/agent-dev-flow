---
draft_type: req_draft
topic_slug: contract-overapplication-correction
status: saved
created_at: 2026-07-23T16:00:00+09:00
source_rus: []
agentdev_handoff: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# Session由来要件（source_type: chat, generated_by: session）。恒久契約適格性ゲート新設で feature。
work_type: feature

# scale: feature のみ standard / large。6 REQ への UPDATE/APPEND + 1 SPEC UPDATE = 7ファイル、複数REQまたがるため large。
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  Session由来要件「恒久契約の過剰適用是正とintake・learning昇格統制」の要件ドラフト。
  個別事例の恒久契約化（REQ/ADR/SPEC/command/skillへの過剰反映）を是正し、intake/learning/backlog-review/req-define/inspect-docs パイプラインに多層ゲートを追加して再発を防止する。

  レビュー合意により3点を確定した。(1) 新規ADR不要（ADR-0139/0124/0112へ relates-to）。(2) REQ-0164新規REQは新設せず、6既存REQ（REQ-0155-005、REQ-0127、REQ-0128、REQ-0129、REQ-0109-047、REQ-0140-021）へ最小分配。9 REQへの過剰分散は避け、REQ-0101/0136/0147/0140-043 は既存契約で充足されるため変更対象から除外。(3) 既存成果物の再仕訳は KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE の6処置を相互排他的処置enumとして維持。INFERENCE は「当該記述を恒久契約として明文化せず、上位原則からの実行時判断へ委ねる」処置であり、判定方法ではない。根拠方式3値enum（INFERENCE/MANUAL/RULE）は廃止し、判定根拠は REQ-0136-033 が定義する分類根拠（観測事実、適用規則、意味判断、ユーザー合意、機械検出結果等の非排他的情報）へ統合する。

  document-model.md SPEC は恒久契約適格性、6処置、診断観点対応表の共通定義のみを正規所有する（OU-001）。工程固有手順は各SPEC（intake/learning/backlog integration/req-define/inspect-docs）へ分散する。補助パイプライン（intake/learning/backlog-review）は対応要否と対応形態を分けて判定する観測可能振る舞いを各REQへ追加し（OU-002）、監査（inspect-docs）と文書レビュー（agentdev-doc-writing）は既存要件の自然な拡張として6処置と診断観点を反映する（OU-003）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      新規ADRは作成しない。本件は command 判定手順、workflow パイプライン定義、文書分類表、レビュー運用、成果物契約の具体化であり、ADR作成禁止ゲート（仕様変更/command動作仕様/workflow定義/命名規約/directory規約/artifact contract変更/運用ルール/template変更/入出力形式/非技術的合意）に強く該当する。既存ADR-0139（REQ/SPEC意味分類と正規所有モデル）、ADR-0124（req_draft soft-contract原則）、ADR-0112（サブエージェント委譲一般化と過剰適用防止）への relates-to 宣言のみで処理する。ADR-0139 は supersede 対象ではなく、本件は ADR-0139 が決定した分類根拠伝播、req-define 最終分類、spec-save 配置ゲートの具体化である。
  - id: AG-002
    content: |
      REQ-0164「恒久契約適格性と昇格統制の原則」は新規CREATEせず、6既存REQへの最小分配で対応する（レビュー合意により確定）。ADR-0139決定4「REQ拡張は新利用者要求・外部契約変更の2種別に限定」、REQ-0101-079（4妥当性基準）、REQ-0155-005（無条件自動REQ化禁止）が既存原則として存在するため、REQ-0164を新設すると重複所有になる。分配先は次の6 REQに限定する: REQ-0155-005（共通原則の正規所有者、UPDATE）、REQ-0127/0128/0129（各パイプラインの観測可能振る舞い、APPEND）、REQ-0109-047（診断観点の拡張、UPDATE）、REQ-0140-021（6処置分類の定義、UPDATE）。REQ-0101-058/0136-033/0147-010/0140-043 の4変更は既存契約で充足されるため対象外とする。
  - id: AG-003
    content: |
      既存成果物の再仕訳には KEEP / MERGE / REFERENCE / MOVE / RETIRE / INFERENCE の6処置を相互排他的な処置enumとして用いる（レビュー合意により確定）。INFERENCE は「当該記述を恒久契約として明文化せず、上位原則からの実行時判断へ委ねる」処置であり、KEEP（現在位置に残す）、MERGE（統合）、REFERENCE（参照へ縮約）、MOVE（移送）、RETIRE（廃止）と同じ軸上の成果物へのアクションである。判定方法ではない。根拠方式3値enum（INFERENCE/MANUAL/RULE）は廃止する。実際の判定では複数の根拠（観測事実、適用した既存規則、意味判断、ユーザー合意、機械検出結果）が併存するため、判定根拠は非排他的情報として REQ-0136-033 が定義する分類根拠フィールドへ記録する。REQ-0136-033 は既に変更の性質、REQ影響、ステークホルダー、外部から見える変更、SPEC区分、正式な所有対象、観測事実等の引き継ぎを要求しているため、追加の3値enumは不要である。
      intake・learning の昇格分類（対応要否: action-required/covered/duplicate/verification-only/deferred/rejected、対応形態: local-fix/example-or-test/knowledge-only/permanent-contract-candidate）は、この6処置とは別の分類として維持する。既存成果物を実際に変更する段階で、必要に応じて6処置を適用する。
  - id: AG-004
    content: |
      恒久契約適格性の不変条件（観測可能結果・安全境界）のみをREQ要件行に記述し、詳細判定表（判定項目、優先順位、例外、工程別手順、処理値のenum）はSPECに配置する。REQ要件行に書く不変条件は次の6 REQに限定する: REQ-0155-005（intake/learning/inspect由来候補の恒久契約適格性、ADR-0139決定4の要約）、REQ-0127/0128/0129（各パイプラインが対応要否と対応形態を分けて判定し恒久契約候補以外をRU化経路へ送らない観測可能振る舞い）、REQ-0109-047（個別事例一般契約化、履歴識別子混入、重複追加、推論委譲規則、REQ/SPEC/command/skill間重複所有の診断対象追加）、REQ-0140-021（agentdev-doc-writing が6処置で分類する契約）。詳細判定表、6処置の定義、対応要否/対応形態分類の定義、診断観点との対応表は document-model.md SPEC が一次所有し、工程別手順は各 command/workflow SPEC に配置する。
  - id: AG-005
    content: |
      QG-1〜QG-4（主ワークフロー品質ゲート、quality-gates.md）は現行通り主ワークフロー（req-define/req-save/spec-save/case-*）専用とし、intake/learning/backlog-review の補助パイプラインへ拡張しない。補助パイプラインには「適格性チェックポイント」を別体系として配置する。適格性チェックポイントは各補助パイプラインの HITL 確定点（REQ-0147-003〜009）で実行し、QG-1〜QG-4 の構成要素としては扱わない。
  - id: AG-006
    content: |
      全ゲートで個別の HITL を要求せず、HITL を「判断の確定」に限定する（REQ-0147-003〜009 整合）。途中結果（候補、推論結果）は候補として次工程へ伝播し、昇格・分類の最終確定点のみ HITL とする。各パイプラインの適格性チェックポイントは最終確定点で実行し、推論ベースの候補生成段階では HITL を要求しない。
  - id: AG-007
    content: |
      document-model.md SPEC（docs/specs/foundations/document-model.md）を恒久契約適格性基準、既存成果物6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）、診断観点との対応表の共通定義の正規所有先とする（レビュー合意により縮小確定）。document-model.md には共通定義のみを置き、工程固有手順は各 SPEC へ分散させる: intake の分類と振り分けは intake pipeline SPEC、learning の分類と振り分けは learning pipeline SPEC、独立再判定は backlog integration SPEC、req-define での範囲統制は req-define/req-analysis SPEC、事後監査は inspect-docs/diagnostics SPEC。REQ-0109-047 が診断観点、REQ-0140-021 が文書レビュー時の6処置分類をそれぞれ所有するが、6処置の定義本体は document-model.md へ集約し、各 REQ は参照を持つ。
  - id: AG-008
    content: |
      既存の診断観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT、REQ-0109-009/-015/-022/-039、inspect-docs 6観点）と既存成果物6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）は別軸である。診断観点は REQ/SPEC 体系の構造的問題を検出する軸、6処置は採用済み成果物へのアクションを表す軸。両者の対応表を document-model.md SPEC に配置し、混同を防止する。対応表は参照用であり、診断観点と処置は1対1対応しない。
  - id: AG-009
    content: |
      operation_units は3分割する。OU-001（基準定義）: document-model.md SPEC の恒久契約適格性基準、既存成果物6処置、診断観点対応表の共通定義の正規所有。OU-002（補助パイプライン適用）: REQ-0127/0128/0129 へ対応要否・対応形態分離判定の APPEND + REQ-0155-005 を共通原則へ UPDATE、OU-001 に必須依存。OU-003（監査・レビュー適用）: REQ-0109-047 と REQ-0140-021 の UPDATE、OU-001 に必須依存。OU-002 と OU-003 は並列実行可能。REQ-0101-058/0136-033/0147-010/0140-043 の4変更は既存契約で充足されるため対象外とする。Issue 構成の最終判断は case-open に委譲する。

# artifact_actions: REQ/ADR/SPEC への保存対象を1つの配列に統合
artifact_actions:
  # ===== OU-001: document-model.md SPEC 更新（共通定義の正規所有）=====
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/foundations/document-model.md
    target_area: "### REQ 品質維持基準"
    source_items: [AG-003, AG-004, AG-007, AG-008]
    content: |
      ### REQ 品質維持基準

      SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT は、inspect-docs の診断観点に加え、REQ 運用品質維持の恒常的基準として参照する（REQ-0109-039）。
      REQ 体系の健全性を維持するため、これらの観点で定期的に REQ 体系を評価する。

      ### 恒久契約適格性と既存成果物処置分類 <!-- REQ-0155-005, REQ-0109-047, REQ-0140-021 -->

      本節は intake / learning / diagnostics の採用済み成果物を恒久契約（REQ/ADR/SPEC/command/skill）へ昇格させる前の共通基準と、既存成果物の見直し処置の定義を正規所有する。適格性基準は ADR-0112（過剰適用防止）、ADR-0139決定4（REQ拡張は2種別に限定）、REQ-0155-005（無条件自動REQ化禁止）を具体化する。

      #### 恒久契約適格性

      intake、learning、inspect 由来の知見は、既存契約で未充足の新しいステークホルダー要求、外部から観測可能な契約変更、または明示が必要な安全境界に該当する場合だけ恒久契約候補とする。既存要求を満たすバリエーション、エッジケース、不適合修正、内部再構成、文書訂正は、既存契約が要求を保持している限り REQ を拡張しない（ADR-0139決定4の要約）。

      詳細な判定項目、優先順位、例外、工程別手順は各 command / workflow SPEC に配置する。適格性チェックポイントは QG-1〜QG-4（主ワークフロー品質ゲート）とは別体系とし、各補助パイプラインの HITL 確定点（REQ-0147-003〜009）で実行する。

      #### 既存成果物の6処置

      既存REQ、ADR、SPEC、guide、command、skill の記述を見直す際の処置は以下の6区分とする。各処置は相互排他的であり、1つの記述に対して1処置を適用する。

      | 処置 | 意味 |
      |---|---|
      | KEEP | 恒久契約として現在位置に残す |
      | MERGE | 同じ責務の正式な定義箇所へ統合する |
      | REFERENCE | 詳細を正式な定義箇所へ寄せ、現在位置は参照へ縮約する |
      | MOVE | 別の文書種、reference、test、fixture 等へ移す |
      | RETIRE | 現行契約として不要なため廃止する |
      | INFERENCE | 当該記述を恒久契約として明文化せず、上位原則からの実行時判断へ委ねる |

      INFERENCE は「明文化を残す KEEP」とも「別成果物に残す MOVE」とも異なる処置であり、個別事例ごとの適用規則が SPEC に記載されている場合に、個別規則を恒久契約から除去し上位の一般原則のみを維持して将来の個別適用を実行エージェントの意味判断へ委ねる。

      処置の判定根拠は非排他的な情報として記録する。観測事実、適用した既存規則、意味判断、ユーザー合意、機械検出結果等が併存し得る。判定根拠の伝播は REQ-0136-033 が定義する分類根拠フィールドへ統合し、INFERENCE/MANUAL/RULE のような排他的 enum は導入しない。

      #### intake・learning 昇格分類との違い

      intake・learning パイプラインの対応要否分類（action-required / covered / duplicate / verification-only / deferred / rejected）と対応形態分類（local-fix / example-or-test / knowledge-only / permanent-contract-candidate）は、本節の6処置とは別の分類である。昇格分類は採用済み成果物をどう処理するかの前段階判定であり、既存成果物を実際に変更する段階で必要に応じて6処置を適用する。

      #### 診断観点と6処置の対応表

      inspect-docs の診断観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と既存成果物6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）は別軸である。診断観点は REQ/SPEC 体系の構造的問題を検出する軸であり、6処置は採用済み成果物へのアクションを表す軸である。

      | 診断観点 | 主に対応する処置 | 関係 |
      |---|---|---|
      | SPLIT | MOVE | REQ 分割結果の配置移動 |
      | MERGE | MERGE | 複数REQ/SPECの統合 |
      | MOVE | MOVE | 配置場所変更 |
      | DUPLICATE | REFERENCE または MERGE | 重複の整理 |
      | RETIRE | RETIRE | 廃止 |
      | DRIFT | MOVE または RETIRE | 実態乖離の修正 |

      対応表は参照であり、診断観点と処置は1対1対応しない。各検出事項は個別に処置を判定する。

      #### 工程別手順の配置先

      document-model.md は共通定義のみを正規所有し、工程固有手順は各 SPEC へ分散する: intake の分類と振り分け（intake pipeline SPEC）、learning の分類と振り分け（learning pipeline SPEC）、独立再判定（backlog integration SPEC）、req-define での範囲統制（req-define / req-analysis SPEC）、事後監査（inspect-docs / diagnostics SPEC）。

  # ===== OU-002: 補助パイプライン適用（REQ APPEND + UPDATE）=====
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0127.md
    source_items: [AG-004, AG-007]
    content: |
      | REQ-0127-023 | intake-promote は対応要否と対応形態を分けて判定し、恒久契約候補以外を RU 生成経路へ送らないこと。恒久契約適格性基準は document-model.md SPEC が定義し、intake-promote はその参照を保持すること |

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0128.md
    source_items: [AG-004, AG-007]
    content: |
      | REQ-0128-010 | learning-promote は対応要否と対応形態を分けて判定し、恒久契約候補以外を RU 生成経路へ送らないこと。恒久契約適格性基準は document-model.md SPEC が定義し、learning-promote はその参照を保持すること。REQ-0155-005（無条件自動REQ化禁止）を具体化すること |

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0129.md
    source_items: [AG-004, AG-007]
    content: |
      | REQ-0129-012 | backlog-review は上流の恒久契約候補判定を独立して再評価し、恒久契約として不適格な成果物を RU 化しないこと。恒久契約適格性基準は document-model.md SPEC が定義し、backlog-review はその参照を保持すること |

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-0155.md
    source_items: [AG-002, AG-004, AG-007]
    content: |
      | REQ-0155-005 | intake、learning、inspect 由来の知見は、既存契約で未充足の新しいステークホルダー要求、外部から観測可能な契約変更、または明示が必要な安全境界に該当する場合だけ恒久契約候補とすること。既存要求を満たすバリエーション、エッジケース、不適合修正、内部再構成、文書訂正は、既存契約が要求を保持している限り REQ を拡張しないこと。恒久契約適格性基準の詳細判定表は document-model.md SPEC が一次所有する |

  # ===== OU-003: 監査・レビュー適用（REQ UPDATE）=====
  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-0109.md
    source_items: [AG-008]
    content: |
      | REQ-0109-047 | inspect-docs は、REQ/SPEC 境界違反、REQ 粒度過小、SPEC 詳細混入、外部契約と内部パラメータの誤分類に加え、個別事例の一般契約化、履歴・一時識別子の混入、既存契約で充足済みの重複追加、推論に委ねるべき個別規則、REQ・SPEC・command・skill 間の重複所有を診断観点として扱えること。REQ-0101-067〜069 の境界基準、SPEC 移管基準、安定契約例外判定を参照し、現行REQ の再分類候補抽出時の判断基準として機能すること |

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-0140.md
    source_items: [AG-003, AG-007]
    content: |
      | REQ-0140-021 | agentdev-doc-writing は、既存REQ、ADR、SPEC、guide、command、skill の記述を、KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE の処置候補に分類し、根拠と修正文案または移送先候補を提示すること。未合意事項を確定しないこと。6処置の定義と判定根拠の記録形式は document-model.md SPEC が一次所有する |

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      当初案では採用済み成果物の処置を KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE の6区分を単一 enum として定義しようとした。INFERENCE の軸（処置か判定方法か）が曖昧なままドラフト化が進み、Oracle相談（architecture-advisory bg_ebbf4c94）でも別軸分離が提案された。レビューエージェントは、INFERENCE は本来「当該記述を恒久契約として明文化せず、上位原則からの実行時判断へ委ねる」処置であり、KEEP/MERGE/REFERENCE/MOVE/RETIRE と同じ軸上の相互排他的処置として扱えると指摘した。
    resolution: |
      レビュー案を採用し（ユーザー合意済）、KEEP / MERGE / REFERENCE / MOVE / RETIRE / INFERENCE の6処置を相互排他的処置 enum として維持する（AG-003）。INFERENCE は明文化をやめて実行時判断へ委ねる処置であり、判定方法ではない。根拠方式3値enum（INFERENCE/MANUAL/RULE）は廃止する。実際の判定では複数の根拠が併存するため、判定根拠は非排他的情報（観測事実、適用規則、意味判断、ユーザー合意、機械検出結果等）として REQ-0136-033 が定義する分類根拠フィールドへ統合する。intake・learning の対応要否／対応形態分類は6処置とは別の分類として維持する（AG-003）。

  - id: CR-002
    conflict: |
      当初案では REQ-0164「恒久契約適格性と昇格統制の原則」を新規CREATEし、パイプライン横断の適格性ゲートを単一REQに集約しようとした。しかし ADR-0139決定4は「REQ拡張は新利用者要求・外部契約変更の2種別に限定」しており、REQ-0155-005 も無条件自動REQ化を禁止しているため、REQ-0164新設は重複所有になる。Oracle相談は「既存REQへの分配」を推奨したが、第1次ドラフトは9 REQへの過剰分散を含んでいた。レビューエージェントは、本ドラフトが防止しようとする「横断的な過剰展開」を自身で行っていると指摘し、REQ-0101-058/0136-033/0147-010/0140-043 の4変更は既存契約で充足されると指摘した。
    resolution: |
      レビュー案を採用し（ユーザー合意済）、REQ-0164 は新規CREATEせず、6既存REQ（REQ-0155-005、REQ-0127、REQ-0128、REQ-0129、REQ-0109-047、REQ-0140-021）への最小分配で対応する（AG-002）。REQ-0101-058（処置enum値は SPEC 分離基準 REQ-0101-068 に照らして詳細すぎ）、REQ-0136-033（既存の分類根拠引き継ぎ要求で充足）、REQ-0147-010（REQ-0147-003〜009 が HITL 判断確定限定契約を持つため重複）、REQ-0140-043（REQ-0140 は文書品質ゲートと agentdev-doc-writing の責務であり補助パイプラインQG境界は責務外）の4変更は対象外とする。共通原則は REQ-0155-005 と document-model.md SPEC が正式な定義箇所、工程別の観測可能振る舞いは REQ-0127/0128/0129、事後監査は REQ-0109-047、既存成果物6処置分類は REQ-0140-021 へそれぞれ反映する。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: session
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target: docs/specs/foundations/document-model.md
    target_area: "### REQ 品質維持基準"
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      consumed_by: spec-save
      saved_path: docs/specs/foundations/document-model.md
      artifact_action_ref: ACT-SPEC-001
  - ou_id: OU-002
    source_ru: session
    target_req: [REQ-0127, REQ-0128, REQ-0129, REQ-0155]
    operation: append-and-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: multi
    result:
      consumed_by: req-save
      saved_paths:
        - docs/requirements/REQ-0127.md
        - docs/requirements/REQ-0128.md
        - docs/requirements/REQ-0129.md
        - docs/requirements/REQ-0155.md
      artifact_action_refs: [ACT-REQ-001, ACT-REQ-002, ACT-REQ-003, ACT-REQ-004]
  - ou_id: OU-003
    source_ru: session
    target_req: [REQ-0109, REQ-0140]
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: multi
    result:
      consumed_by: req-save
      saved_paths:
        - docs/requirements/REQ-0109.md
        - docs/requirements/REQ-0140.md
      artifact_action_refs: [ACT-REQ-005, ACT-REQ-006]

# test_strategy: 各合意項目（AG-*）の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-007
    verification: |
      docs/specs/foundations/document-model.md の「### REQ 品質維持基準」セクションが spec-save で更新され、続く「### 恒久契約適格性と既存成果物処置分類」セクションが新設されていることを Read で確認する。新セクションが「恒久契約適格性」「既存成果物の6処置」「intake・learning 昇格分類との違い」「診断観点と6処置の対応表」「工程別手順の配置先」の5小節を含むことを確認する。工程別手順（intake/learning/backlog integration/req-define/inspect-docs）の記述は document-model.md に含まれず各 SPEC に分散されていることを確認する。
    pass_criteria: |
      document-model.md に「### 恒久契約適格性と既存成果物処置分類」セクションが存在すること。6処置テーブル（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）と診断観点対応表が存在すること。REQ-0155-005、REQ-0109-047、REQ-0140-021 の参照コメントが含まれること。工程別手順が document-model.md に含まれないこと。
    on_failure: |
      fix-and-reverify。spec-save の target_area「### REQ 品質維持基準」が未検出でスキップされた可能性が高い。spec-save の target_area 一致処理と document-model.md の見出し階層を確認し、spec-update を再実行する。
  - id: TS-002
    target_item: AG-003
    verification: |
      document-model.md の6処置テーブルが KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE の6行で定義されていることを確認する。INFERENCE の説明が「明文化をやめ、上位原則からの実行時判断へ委ねる」処置として記述されていることを確認する。根拠方式3値enum（INFERENCE/MANUAL/RULE）のテーブルが存在しないことを確認する。判定根拠が非排他的情報として REQ-0136-033 の分類根拠フィールドへ統合される旨が記述されていることを確認する。
    pass_criteria: |
      6処置テーブルが6行（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）で定義されていること。INFERENCE が「明文化をやめて実行時判断へ委ねる処置」として記述されること。根拠方式3値enumのテーブルが存在しないこと。
    on_failure: |
      fix-and-reverify。CR-001 の解決（6処置維持 + 根拠方式enum廃止）が content に正しく反映されていない可能性が高い。artifact_actions ACT-SPEC-001 の content と AG-003 を確認し、spec-update を再実行する。
  - id: TS-003
    target_item: AG-002
    verification: |
      REQ-0164 が docs/requirements/REQ-0164.md に存在しないことを確認する。既存6 REQ（REQ-0109/0127/0128/0129/0140/0155）への変更が完了していることを確認する。REQ-0101-058、REQ-0136-033、REQ-0147-010、REQ-0140-043 が変更されていないことを確認する。
    pass_criteria: |
      docs/requirements/REQ-0164.md が存在しないこと。REQ-0127-023/0128-010/0129-012 が append され、REQ-0109-047/0140-021/0155-005 が update されていること。REQ-0101-058、REQ-0136-033、REQ-0147-010（存在しない）、REQ-0140-043（存在しない）が変更されていないこと。
    on_failure: |
      fix-and-reverify。REQ-0164 が誤って作成された場合は削除し、分配方針（AG-002）を再確認する。各REQへの append/update が未完了の場合は req-save を再実行する。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-0127-023、REQ-0128-010、REQ-0129-012 がそれぞれ docs/requirements/REQ-0127.md、REQ-0128.md、REQ-0129.md に append され、「対応要否と対応形態を分けて判定」「恒久契約候補以外を RU 生成経路へ送らない」が記述されていることを確認する。REQ-0129-012 は加えて「上流の恒久契約候補判定を独立して再評価」が含まれることを確認する。
    pass_criteria: |
      REQ-0127-023/0128-010/0129-012 が存在し、いずれも「対応要否と対応形態を分けて判定」「恒久契約候補以外を RU 生成経路へ送らない」を含むこと。REQ-0129-012 は「独立して再評価」を含むこと。
    on_failure: |
      fix-and-reverify。req-save の APPEND 処理が未完了、または content の記述が欠落している可能性が高い。各 REQ ファイルと artifact_actions ACT-REQ-001/002/003 content を確認し、req-save を再実行する。
  - id: TS-005
    target_item: AG-004
    verification: |
      REQ-0155-005 が update され、「intake、learning、inspect 由来の知見」を含むこと、「既存要求を満たすバリエーション、エッジケース、不適合修正、内部再構成、文書訂正は REQ を拡張しない」が記述されていることを確認する。
    pass_criteria: |
      REQ-0155-005 に「intake、learning、inspect 由来」が含まれること。「バリエーション、エッジケース、不適合修正、内部再構成、文書訂正」が列挙されていること。
    on_failure: |
      fix-and-reverify。req-save の UPDATE 処理が未完了、または content が旧版のまま更新されていない可能性が高い。REQ-0155.md と artifact_actions ACT-REQ-004 content を確認し、req-save を再実行する。
  - id: TS-006
    target_item: AG-008
    verification: |
      REQ-0109-047 が update され、既存の「REQ/SPEC 境界違反、REQ 粒度過小、SPEC 詳細混入、外部契約と内部パラメータの誤分類」に加え、「個別事例の一般契約化、履歴・一時識別子の混入、既存契約で充足済みの重複追加、推論に委ねるべき個別規則、REQ・SPEC・command・skill 間の重複所有」が追加されていることを確認する。同時に document-model.md の診断観点と6処置の対応表が存在することを確認する。
    pass_criteria: |
      REQ-0109-047 に5つの追加診断観点（個別事例の一般契約化、履歴・一時識別子の混入、既存契約で充足済みの重複追加、推論に委ねるべき個別規則、REQ/SPEC/command/skill間の重複所有）が含まれること。document-model.md に診断観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）と6処置（KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE）の対応表が存在すること。
    on_failure: |
      fix-and-reverify。req-save の UPDATE 処理が未完了、または spec-save の対応表が未配置の可能性が高い。REQ-0109.md と document-model.md を確認し、req-save/spec-save を再実行する。
  - id: TS-007
    target_item: AG-003
    verification: |
      REQ-0140-021 が update され、「KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE の処置候補に分類」が記述されていることを確認する。旧版の「残す/分割/移送/削除候補」が置き換えられていることを確認する。
    pass_criteria: |
      REQ-0140-021 に「KEEP、MERGE、REFERENCE、MOVE、RETIRE、INFERENCE」の6処置が含まれること。旧版の「残す/分割/移送/削除候補」が残っていないこと。
    on_failure: |
      fix-and-reverify。req-save の UPDATE 処理が未完了、または content が旧版のまま更新されていない可能性が高い。REQ-0140.md と artifact_actions ACT-REQ-006 content を確認し、req-save を再実行する。
  - id: TS-008
    target_item: AG-001
    verification: |
      docs/adr/ に本件の新規ADRが作成されていないことを確認する。req-draft の conflict_resolutions または case-close の記録に「ADR不要、ADR-0139/0124/0112 へ relates-to」と記録されていることを確認する。
    pass_criteria: |
      新規ADRファイルが作成されていないこと。ADR-0139/0124/0112 への relates-to 宣言が記録されていること。
    on_failure: |
      record-in-findings。新規ADRが誤って作成された場合は要再検討。ただし ADR-0139 への UPDATE（relates-to 追記）は別途 inspect-docs/backlog-review で評価可能なため、直ちに削除せず Findings に記録する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  epic_slug: contract-eligibility-and-promotion-control
  referenced_reqs: [REQ-0109, REQ-0127, REQ-0128, REQ-0129, REQ-0140, REQ-0155]
  referenced_adrs: [ADR-0139, ADR-0124, ADR-0112, ADR-0103]
  implementation_notes:
    - "OU-001（document-model.md SPEC 更新）は spec-save で実施。target_area「### REQ 品質維持基準」の置換で新セクション「### 恒久契約適格性と既存成果物処置分類」を追加。共通定義のみを正規所有し、工程別手順は各 SPEC へ分散"
    - "OU-002/003 の REQ APPEND/UPDATE は req-save で実施。原本側 docs/requirements/REQ-*.md を直接編集"
    - "CR-001（6処置維持）と CR-002（6既存REQ最小分配）はレビュー合意済み。REQ-0101-058/0136-033/0147-010/0140-043 は既存契約で充足されるため変更対象外"
  wave_hints:
    - "Wave 1: OU-001（document-model.md SPEC 更新）。共通定義の正規所有を完了させ、OU-002/003 の前提を整える"
    - "Wave 2: OU-002 と OU-003 を並列実行。OU-002（REQ-0127/0128/0129 APPEND + REQ-0155 UPDATE）と OU-003（REQ-0109/0140 UPDATE）は OU-001 完了後に並列可能"

# req_save_results: req-save 処理結果（REQ/ADR artifact_actions 消費済み）
req_save_results:
  consumed_by: req-save
  saved_documents:
    - "REQ-0127 (APPEND: REQ-0127-023)"
    - "REQ-0128 (APPEND: REQ-0128-010)"
    - "REQ-0129 (APPEND: REQ-0129-012)"
    - "REQ-0155 (UPDATE: REQ-0155-005)"
    - "REQ-0109 (UPDATE: REQ-0109-047)"
    - "REQ-0140 (UPDATE: REQ-0140-021)"
  artifact_action_mapping:
    ACT-REQ-001: { target: REQ-0127, applied_id: REQ-0127-023 }
    ACT-REQ-002: { target: REQ-0128, applied_id: REQ-0128-010 }
    ACT-REQ-003: { target: REQ-0129, applied_id: REQ-0129-012 }
    ACT-REQ-004: { target: REQ-0155, applied_id: REQ-0155-005 }
    ACT-REQ-005: { target: REQ-0109, applied_id: REQ-0109-047 }
    ACT-REQ-006: { target: REQ-0140, applied_id: REQ-0140-021 }
  source_ru_to_req_mapping:
    session: [ACT-REQ-001, ACT-REQ-002, ACT-REQ-003, ACT-REQ-004, ACT-REQ-005, ACT-REQ-006]
  skipped_artifact_actions:
    ACT-SPEC-001: "spec-save 対象のため req-save は処理しない"

# spec_save_result: spec-save 処理結果（SPEC artifact_actions 消費済み）
spec_save_result:
  consumed_by: spec-save
  consumed: true
  saved_specs:
    - "docs/specs/foundations/document-model.md (UPDATE: target_area「### REQ 品質維持基準」)"
  artifact_action_mapping:
    ACT-SPEC-001: { target: docs/specs/foundations/document-model.md, operation: UPDATE }
  source_ru_to_spec_mapping:
    session: [ACT-SPEC-001]
```

# summary

Session由来要件「恒久契約の過剰適用是正とintake・learning昇格統制」の要件ドラフト。

個別事例の恒久契約化（REQ/ADR/SPEC/command/skillへの過剰反映）を是正し、intake/learning/backlog-review/req-define/inspect-docs パイプラインに多層ゲートを追加して再発を防止する。レビュー合意により3点を確定した: (1) 新規ADRは不要（ADR-0139/0124/0112へ relates-to）。(2) REQ-0164新規REQは新設せず、6既存REQ（REQ-0155-005、REQ-0127、REQ-0128、REQ-0129、REQ-0109-047、REQ-0140-021）へ最小分配。9 REQ分散ではなく4変更は既存契約で充足されるため対象外。(3) 既存成果物の再仕訳は KEEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE の6処置を相互排他的処置 enum として維持。INFERENCE は「明文化をやめ、上位原則からの実行時判断へ委ねる」処置。根拠方式3値enum（INFERENCE/MANUAL/RULE）は廃止し、判定根拠は REQ-0136-033 の分類根拠フィールドへ非排他的情報として統合する。

document-model.md SPEC は恒久契約適格性、6処置、診断観点対応表の共通定義のみを正規所有する（OU-001）。工程固有手順は各 SPEC（intake/learning/backlog integration/req-define/inspect-docs）へ分散する。補助パイプライン（REQ-0127/0128/0129）は対応要否と対応形態を分けて判定する観測可能振る舞いを追加し、REQ-0155-005 を共通原則の正規所有者として intake/learning/inspect 由来へ拡張する（OU-002）。監査（REQ-0109-047）と文書レビュー（REQ-0140-021）は既存要件の自然な拡張として6処置と診断観点を反映する（OU-003）。

CR-001（6処置維持）と CR-002（6既存REQ最小分配）はレビュー合意済み。auto_gate.auto_ready: true とし、req-save 進行可能である。
