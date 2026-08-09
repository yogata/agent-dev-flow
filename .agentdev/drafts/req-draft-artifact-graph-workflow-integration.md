---
draft_type: req_draft
topic_slug: artifact-graph-workflow-integration
status: saved
created_at: 2026-08-10T00:00:00+09:00
source_rus:
  - RU-20260810-01
---

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  Artifact Graph を AgentDevFlow の4用途（Discovery/Impact, Diagnostics,
  Review Evidence, Verification）の共通探索基盤として実効利用する。
  既存 Project Extension の廃止済み skill 名参照を修正し、
  consumer command/skill への Graph 統合を要件化し、
  case-run での Graph 利用を REQ-017-010 境界内の補助用途に明確化し、
  workflow effectiveness 検証を新規定義する。
  Graph は候補提供者であり、決定的検査、意味診断、最終判断は既存の
  正規所有者（docs-check, inspect 系, 各 command）に残す。
  Graph は派生索引のままで SSoT 化せず、fail-open と後方互換性を維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
  resolved_stop_reasons:
    - id: RES-001
      original_stop_reason: >-
        ACT-SPEC-001: consumer 別 SPEC 更新方針（各 command SPEC への権威動作配置）が
        実装時判断になるため、case-open 時に対象 SPEC 一覧を確定する必要がある
      resolution: >-
        consumer 別 SPEC 更新方針を確定し、対象 SPEC 一覧を artifact_actions へ明示化した。
        方針: 各 consumer command/skill SPEC が当該 consumer の権威動作（利用タイミング、
        判断基準、fallback）を所有し、中央 agentdev-artifact-graph SPEC は共通利用原則の
        概要と Graph 提供能力の記述を提供する。対象 SPEC 9件（ACT-SPEC-003〜011）:
        req-define, spec-save, case-open, case-run, case-close, backlog-review,
        inspect-docs, inspect-skills (以上 commands), agentdev-adversarial-review (skills)。
        OU-004 として operation_units へ追加済み。
      resolved_at: "2026-08-10"

agreed_items:
  - id: AG-001
    content: >-
      Artifact Graph を利用するすべての現行 command, skill, Project Extension は、
      廃止済み repo-agentdev-artifact-graph を実行時委譲先として参照せず、
      現行標準 skill agentdev-artifact-graph へ統一する。
      廃止済み skill および superseded となった旧 local Artifact Graph 仕様への
      実行時依存を残さない。superseded SPEC パスを実行時 context として
      参照する Project Extension も現行 SPEC へ移行する。
      委譲先 skill の不存在を正常な Artifact Graph 利用状態として扱わない。

  - id: AG-002
    content: >-
      すべての Graph consumer は以下の判断防護原則を守る。
      Graph は派生索引であり SSoT ではない。
      Graph の結果から変更対象、要件充足、責務重複を単独で確定しない。
      Graph 取得結果の根拠となる canonical source を確認可能とし、
      必要に応じて rg, filesystem scan 等の独立手段で補完・反証する。
      Graph 不在を関連なし、影響なしの根拠にしない。
      意味的類似、意味的責務重複を Graph の明示関係と同一視しない。
      本原則は既存 REQ-012-012 の非SSoT原則を consumer 判断場面へ拡張する。

  - id: AG-003
    content: >-
      Artifact Graph が missing, stale, invalid, regeneration failure、
      consumer に対象 node type または relation type が存在しない状態であっても、
      Graph failure 自体を停止条件としない consumer では代替探索へ移行できること。
      Artifact Graph 導入によって、Artifact Graph を使用しない既存 consumer、
      AgentDevFlow 正規成果物モデルを採用しない consumer の正常動作を壊さないこと。
      本要件は既存 REQ-012-010 の fail-open を consumer 互換性へ拡張する。

  - id: AG-004
    content: >-
      req-define, spec-save, backlog-review は Artifact Graph を関連成果物候補の
      探索に利用する。req-define は既存 REQ, 関連 ADR, 関連 SPEC,
      canonical owner が関連する成果物, 構造的な所有者重複候補,
      downstream の変更影響候補を探索できる。
      spec-save は対応 REQ, 同一または関連 canonical owner を持つ SPEC,
      関連 command, skill, integrity rule を探索できる。
      backlog-review は入力成果物に含まれる REQ, ADR, SPEC, canonical owner 等の
      明示情報を起点として既存正規成果物との関係候補を取得できる。
      promoted artifact 自体を Graph の正規 node とすることは必須としない。
      すべての consumer で Graph 候補取得後に正規成果物本文および独立探索手段で
      確認してから最終判断する。CREATE, APPEND, UPDATE, SPLIT, MERGE,
      意味的重複, canonical owner, SPEC 正規配置先, target_area を
      Graph 単独で確定しない。

  - id: AG-005
    content: >-
      case-open は Issue の対象範囲, 完了条件, test strategy,
      必要な skill, 検証事項を確定する前に Artifact Graph を変更影響候補の探索に利用する。
      候補には REQ, ADR, SPEC, command, skill, extension, integrity rule,
      関連 source_file を含められる。Graph 候補は正規成果物または独立した探索手段で
      確認した上で in scope, verification only, out of scope に分類する。
      必須品質能力の導出は artifact-quality-control-routing SPEC が定める
      artifact type から品質能力キーへの変換に従い、Graph の delegates_to, governs
      関係から必須 skill を直接決定しない。Graph は変更成果物候補と関連規則候補の
      探索のみを担当する。case-run の実行方針を左右する事項は
      可能な限り case-open 時点で確定し Issue の受け入れ条件または実行条件へ反映する。

  - id: AG-006
    content: >-
      inspect-docs は Artifact Graph を構造診断候補の探索に利用する。
      候補には unresolved reference, superseded artifact への現行参照,
      dangling relation, provenance 欠落, orphan candidate,
      不自然な relation path, structural duplicate candidate を含む。
      inspect-skills は self-hosting augmentation が利用可能な場合、
      Graph を用いて command と skill 関係, command と extension と skill 関係,
      予期しない delegation, orphan skill candidate の候補を探索できる。
      ただし Graph は候補提供者であり、決定的検査（参照実在、委譲先 skill 実在、
      YAML 構文、必須 field 等）は ADR-006 が定める通り docs-check, IR-056 が所有する。
      inspect-docs は REQ-010-018〜023 が定める意味診断を、inspect-skills は
      REQ-010-024〜028 が定める意味診断を担当し、Graph 構造候補を未検証 evidence
      として意味診断の入力に利用する。構造診断と意味診断を区別し、
      SPLIT, MERGE, MOVE, DUPLICATE, RETIRE, DRIFT 等の意味判断を
      Graph の構造情報だけから確定しない。consumer 環境に対応 node type または
      relation type が存在しない場合は異常とせず従来の診断経路を継続する。

  - id: AG-007
    content: >-
      agentdev-adversarial-review は Artifact Graph をレビュー結論の確定ではなく
      レビュー対象候補, evidence の探索に利用する。
      論点候補には複数の規範的成果物から到達する対象, 複数経路, cycle,
      relation 集中ノード, isolated node, 複数 owner または governing relation を
      持つ候補を含む。Graph から得た情報は未検証 evidence として扱い、
      Reviewer または Reviewee の対論, 正規成果物確認を経ずに finding を確定しない。

  - id: AG-008
    content: >-
      case-close は Artifact Graph を変更後の関係整合性検証に利用する。
      確認対象は Graph の生成と鮮度, Graph integrity, unresolved relation,
      dangling relation, provenance defect,
      Graph と独立確認結果との差異を含む。
      Graph defect と canonical defect を区別する。
      Graph 自体の生成または問い合わせ失敗のみを理由に case-close を失敗させず、
      fail-open して従来の検証経路で継続する。
      正規成果物側の実不整合が確認された場合は既存の品質ゲート, 受け入れ条件に
      従って fail とする。

  - id: AG-009
    content: >-
      case-run での Artifact Graph 利用は REQ-017-010 が定める境界内で
      補助用途に限定される。補助用途は Issue に記録された対象から予期しない
      依存または参照が見つかった場合の補助探索, acceptance criteria の検証根拠への
      到達, case-open 時点からの関係差異確認を含む。
      Graph で発見した候補のうち、Issue scope 内の内部実装影響は case-run が
      自律処理する。scope, 完了条件, REQ, Decision, SPEC, 必須品質統制の変更が
      必要な場合は blocked として case-update 連携とする。
      証拠源（Graph, rg, filesystem scan の別）にかかわらず、
      case-run は既存 scope を超える変更を自律拡大しない。
      本要件は REQ-017-010 の境界を変更せず、Graph 利用時の適用を明確化する。

  - id: AG-010
    content: >-
      Artifact Graph の検証を2種類に分離する。
      第一は Parser/Graph regression であり、Graph parser, augmentation,
      relation extraction, provenance の正確性を検証する。
      本層は REQ-020 が所有し、既存 extension 構造等を用いた代表 fixture で維持する。
      第二は Workflow effectiveness であり、実際の AgentDevFlow workflow で
      発生する質問を対象とする。対象質問は REQ の変更影響候補,
      同一 owner の SPEC, 関連 command, skill, integrity rule,
      command から実際に委譲される skill, superseded artifact への現行参照,
      変更後の dangling relation を含む。
      Workflow effectiveness 検証は representative query suite と ground truth を
      用意し、Graph 利用時と独立探索時を次の観点で比較する。
      必要候補の recall, false candidate, canonical source 到達可否,
      Graph-only miss, independent-search-only miss, 探索操作量。
      Artifact Graph 自身の接続確認のみを workflow effectiveness の成立根拠としない。

artifact_actions:
  - id: ACT-REQ-012
    artifact: req
    operation: append
    target: docs/requirements/REQ-012.md
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-012-015 | Artifact Graph を利用する command, skill, Project Extension は廃止済み repo-agentdev-artifact-graph を実行時委譲先として参照せず、現行標準 skill agentdev-artifact-graph へ統一すること。廃止済み skill への実行時依存および superseded SPEC パスの実行時 context 参照を残さないこと。委譲先 skill の不存在を正常な Artifact Graph 利用状態として扱わないこと |
      | REQ-012-016 | すべての Graph consumer は Graph 不在を関連なしまたは影響なしの根拠にせず、意味的類似および意味的責務重複を Graph の明示関係と同一視しないこと。Graph 取得結果の根拠となる canonical source を確認可能とし、必要に応じて独立手段で補完または反証すること |
      | REQ-012-017 | Artifact Graph が missing, stale, invalid, regeneration failure, consumer に対象 node type または relation type が存在しない状態であっても、Graph failure 自体を停止条件としない consumer では代替探索へ移行できること。Artifact Graph を使用しない consumer、AgentDevFlow 正規成果物モデルを採用しない consumer が異常終了しないこと |

  - id: ACT-REQ-021
    artifact: req
    operation: create
    target: new:artifact-graph-workflow-integration
    source_items: [AG-004, AG-005, AG-006, AG-007, AG-008, AG-009, AG-010]
    content: |
      ---
      id: REQ-021
      title: "Artifact Graph ワークフロー統合"
      created: "2026-08-10"
      updated: "2026-08-10"
      ---

      ## 目的

      AgentDevFlow における成果物間の探索、影響分析、構造診断、レビュー証拠探索、変更後検証の各用途で Artifact Graph を共通探索基盤として実効利用する。Artifact Graph は候補提供者であり、決定的検査、意味診断、最終判断は既存の正規所有者に残す。Artifact Graph は派生索引のままで SSoT または意味判断エンジンにはしない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-021-001 | req-define, spec-save, backlog-review が Artifact Graph を既存 REQ, 関連 ADR, 関連 SPEC, canonical owner, 影響候補の探索に利用できること。spec-save は対応 REQ, 同一 canonical owner の SPEC, 関連 command, skill, integrity rule を、backlog-review は統合, 分割, depends_on の補助 evidence を探索できること。Graph 単独で CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner, SPEC 正規配置先, target_area を確定しないこと |
      | REQ-021-002 | case-open が Issue 対象範囲, 完了条件, test strategy の確定前に Artifact Graph による変更影響候補を評価し、候補を in scope, verification only, out of scope に分類すること。必須品質能力の導出は artifact-quality-control-routing SPEC の artifact type から品質能力キーへの変換に従い、Graph の delegates_to, governs 関係から必須 skill を直接決定しないこと |
      | REQ-021-003 | inspect-docs, inspect-skills が Artifact Graph を構造診断候補の探索に利用できること。候補には unresolved reference, superseded artifact への現行参照, dangling relation, provenance 欠落, orphan candidate, structural duplicate candidate, command と skill 関係, 予期しない delegation を含むこと。Graph は候補提供者であり、決定的検査（参照実在, 委譲先 skill 実在, YAML 構文, 必須 field）は ADR-006 が定める通り docs-check, IR-056 が所有すること。inspect-docs, inspect-skills は Graph 構造候補を未検証 evidence として意味診断の入力に利用し、構造診断と意味診断を区別すること |
      | REQ-021-004 | agentdev-adversarial-review が Artifact Graph をレビュー対象候補および evidence の探索に利用し、複数規範的成果物から到達する対象, 複数経路, cycle, relation 集中ノード, isolated node, 複数 owner または governing relation を持つ候補を探索できること。Graph から得た情報を未検証 evidence として対論または正規成果物確認を経ずに finding を確定しないこと |
      | REQ-021-005 | case-close が Artifact Graph を変更後の Graph 生成・鮮度, Graph integrity, unresolved relation, dangling relation, provenance defect, 独立確認結果との差異の検証に利用し、Graph defect と canonical defect を区別すること。Graph 生成または問い合わせ失敗のみを理由に case-close を失敗させず fail-open すること。正規成果物側の実不整合が確認された場合は既存の品質ゲート, 受け入れ条件に従って fail とすること |
      | REQ-021-006 | Artifact Graph の workflow effectiveness 検証を representative query suite と ground truth により実施し、Graph 利用時と独立探索時を recall, false candidate, canonical source 到達可否, Graph-only miss, independent-search-only miss, 探索操作量で比較できること。Parser/Graph regression は REQ-020 が所有し、本要件は workflow effectiveness のみを定義すること。Artifact Graph 自身の接続確認のみを workflow effectiveness の成立根拠としないこと |

      ## 適用範囲

      **対象**: req-define, spec-save, case-open, case-run, case-close, backlog-review, inspect-docs, inspect-skills, agentdev-adversarial-review の Artifact Graph 利用, workflow effectiveness 検証

      **対象外**: Artifact Graph 標準スキル仕様（REQ-012）, parser/graph regression 検証（REQ-020）, case-open と case-run の実行契約境界（REQ-017）, semantic embedding または vector search の新規導入, LLM による inferred relation の恒常生成, Artifact Graph の SSoT 化, Artifact Graph failure の新規必須品質ゲート化, project source code 全体の恒常的 Graph index 化, intake または learning または promoted artifact の新規 node type 化, case-run への新しい scope 決定権付与, Artifact Graph を利用しないプロジェクトへの強制適用

      ## 関連情報

      **関連 REQ**: REQ-012（Artifact Graph 標準化）, REQ-017（Issue Execution Contract）, REQ-020（Artifact Graph 解析品質と検証）, REQ-010（自己監査と診断）
      **関連 Decision**: DEC-006（inspect 3-command 構成への正規化）, DEC-007（Artifact Graph 標準化と配布スキル昇格）

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-artifact-graph
    target_area: "ワークフロー利用"
    source_items: [AG-002, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    content: |
      ## ワークフロー利用

      Artifact Graph は以下の4用途で AgentDevFlow workflow に統合する。Graph はすべての用途で候補提供者であり、決定的検査、意味診断、最終判断は各正規所有者が行う。

      ### 利用上の防護

      すべての consumer は以下を守る。

      - Graph は派生索引であり SSoT ではない。
      - Graph の結果から変更対象、要件充足、責務重複を単独で確定しない。
      - Graph 取得結果の根拠となる canonical source を確認可能とする。
      - 必要に応じて rg, filesystem scan 等の独立手段で補完・反証する。
      - Graph 不在を関連なし、影響なしの根拠にしない。
      - 意味的類似、意味的責務重複を Graph の明示関係と同一視しない。

      ### Discovery / Impact

      req-define, spec-save, backlog-review は関連成果物候補の探索に Artifact Graph を利用する。候補取得後に正規成果物本文および独立探索手段で確認してから最終判断する。

      case-open は Issue 対象範囲, 完了条件, test strategy の確定前に Artifact Graph による変更影響候補を評価する。候補は正規成果物または独立した探索手段で確認した上で in scope, verification only, out of scope に分類する。必須品質能力の導出は artifact-quality-control-routing SPEC に従い、Graph の関係から必須 skill を直接決定しない。

      ### Diagnostics

      inspect-docs は Artifact Graph を構造診断候補の探索に利用する。候補には unresolved reference, superseded artifact への現行参照, dangling relation, provenance 欠落, orphan candidate, 不自然な relation path, structural duplicate candidate を含む。決定的検査（参照実在、委譲先 skill 実在等）は ADR-006 が定める通り docs-check, IR-056 が所有し、inspect-docs は意味診断を担当する。構造候補は未検証 evidence として意味診断の入力に利用する。SPLIT, MERGE, MOVE, DUPLICATE, RETIRE, DRIFT 等の意味判断を Graph の構造情報だけから確定しない。

      inspect-skills は self-hosting augmentation が利用可能な場合、command と skill 関係, command と extension と skill 関係, 予期しない delegation, orphan skill candidate の候補を探索する。委譲先 skill 実在の決定的検査は docs-check, IR-056 が所有する。consumer 環境に対応 node type または relation type が存在しない場合は異常とせず従来の診断経路を継続する。

      ### Review Evidence

      agentdev-adversarial-review は Artifact Graph をレビュー対象候補, evidence の探索に利用する。論点候補は複数の規範的成果物から到達する対象, 複数経路, cycle, relation 集中ノード, isolated node, 複数 owner または governing relation を持つ候補である。Graph から得た情報は未検証 evidence として扱い、対論または正規成果物確認を経ずに finding を確定しない。

      ### Verification

      case-close は Artifact Graph を変更後の関係整合性検証に利用する。確認対象は Graph の生成と鮮度, Graph integrity, unresolved relation, dangling relation, provenance defect, Graph と独立確認結果との差異である。Graph defect と canonical defect を区別する。Graph 自体の生成または問い合わせ失敗のみを理由に case-close を失敗させず、fail-open する。

      ### case-run の利用制限

      case-run での Artifact Graph 利用は REQ-017-010 が定める境界内で補助用途に限定する。補助用途は予期しない依存または参照が見つかった場合の補助探索, acceptance criteria の検証根拠への到達, case-open 時点からの関係差異確認を含む。Graph で発見した候補のうち Issue scope 内の内部実装影響は case-run が自律処理し、scope, 完了条件, REQ, Decision, SPEC, 必須品質統制の変更が必要な場合は blocked として case-update 連携とする。証拠源にかかわらず case-run は既存 scope を超える変更を自律拡大しない。本制限は REQ-017-010 の境界を変更せず、Graph 利用時の適用を明確化する。

      各 consumer の権威的な動作仕様（利用タイミング、判断基準、fallback 動作）は各 command/skill SPEC が所有し、本 SPEC は Graph 提供能力と共通利用原則の概要を提供する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-artifact-graph
    target_area: "効果検証"
    source_items: [AG-010]
    content: |
      ## 効果検証

      Artifact Graph の検証を2種類に分離する。

      ### Parser / Graph regression

      Graph parser, augmentation, relation extraction, provenance の正確性を検証する。本層は REQ-020 が所有し、既存 extension 構造等を用いた代表 fixture で維持する。詳細は REQ-020 および対応 SPEC を参照。

      ### Workflow effectiveness

      実際の AgentDevFlow workflow で発生する質問を対象とする。対象質問は以下を含む。

      - REQ の変更影響候補
      - 同一 owner の SPEC
      - 関連 command, skill, integrity rule
      - command から実際に委譲される skill
      - superseded artifact への現行参照
      - 変更後の dangling relation

      representative query suite と ground truth を用意し、Graph 利用時と独立探索時を以下の観点で比較する。

      - 必要候補の recall
      - false candidate
      - canonical source 到達可否
      - Graph-only miss
      - independent-search-only miss
      - 探索操作量

      Artifact Graph 自身の接続確認のみを workflow effectiveness の成立根拠としない。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target_area: "Artifact Graph 利用"
    source_items: [AG-004]
    content: |
      ## Artifact Graph 利用

      req-define は既存 REQ、関連 Decision と SPEC、canonical owner、構造的所有者重複、downstream 変更影響候補の探索に Artifact Graph を利用できる。Graph は候補提供者であり、CREATE, APPEND, UPDATE, SPLIT, MERGE, 意味的重複, canonical owner の最終判断は正規成果物本文と独立探索手段（`glob`, `grep`, `rg` 等）での確認後に下す。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: spec-save
    target_area: "Artifact Graph 利用"
    source_items: [AG-004]
    content: |
      ## Artifact Graph 利用

      spec-save は対応 REQ、同一または関連 canonical owner を持つ SPEC、関連 command, skill, integrity rule の探索に Artifact Graph を利用できる。Graph は候補提供者であり、target_area, 正規配置先, SPEC 操作分類の最終判断は正規成果物本文と独立探索手段での確認後に下す。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: "Artifact Graph 利用"
    source_items: [AG-005]
    content: |
      ## Artifact Graph 利用

      case-open は Issue の対象範囲, 完了条件, test strategy, 必須 skill, 検証事項を確定する前に Artifact Graph による変更影響候補を評価する。候補には REQ, Decision, SPEC, command, skill, extension, integrity rule, 関連 source_file を含められる。Graph 候補は正規成果物または独立した探索手段で確認した上で in scope, verification only, out of scope に分類する。

      必須品質能力の導出は `artifact-quality-control-routing` SPEC が定める artifact type から品質能力キーへの変換に従い、Graph の delegates_to, governs 関係から必須 skill を直接決定しない。Graph は変更成果物候補と関連規則候補の探索のみを担当する。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: "Artifact Graph 利用"
    source_items: [AG-009]
    content: |
      ## Artifact Graph 利用

      case-run での Artifact Graph 利用は REQ-017-010 が定める境界内で補助用途に限定する。補助用途は Issue に記録された対象から予期しない依存または参照が見つかった場合の補助探索, acceptance criteria の検証根拠への到達, case-open 時点からの関係差異確認を含む。

      Graph で発見した候補のうち Issue scope 内の内部実装影響は case-run が自律処理する。scope, 完了条件, REQ, Decision, SPEC, 必須品質統制の変更が必要な場合は blocked として case-update 連携とする。証拠源（Graph, rg, filesystem scan の別）にかかわらず case-run は既存 scope を超える変更を自律拡大しない。本制限は REQ-017-010 の境界を変更せず、Graph 利用時の適用を明確化する。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "Artifact Graph 利用"
    source_items: [AG-008]
    content: |
      ## Artifact Graph 利用

      case-close は Artifact Graph を変更後の関係整合性検証に利用する。確認対象は Graph の生成と鮮度, Graph integrity, unresolved relation, dangling relation, provenance defect, Graph と独立確認結果との差異である。Graph defect と canonical defect を区別する。

      Graph 自体の生成または問い合わせ失敗のみを理由に case-close を失敗させず、fail-open して従来の検証経路で継続する。正規成果物側の実不整合が確認された場合は既存の品質ゲート, 受け入れ条件に従って fail とする。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: backlog-review
    target_area: "Artifact Graph 利用"
    source_items: [AG-004]
    content: |
      ## Artifact Graph 利用

      backlog-review は入力成果物に含まれる REQ, Decision, SPEC, canonical owner 等の明示情報を起点として既存正規成果物との関係候補を Artifact Graph 経由で取得できる。候補には統合, 分割, depends_on 解決の補助 evidence を含む。

      Graph は候補提供者であり、統合, 分割, depends_on, 意味的重複の最終判断は正規成果物本文と独立探索手段での確認後に下す。promoted artifact 自体を Graph の正規 node とすることは必須でない。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来の探索経路で継続し、workflow を停止しない（fail-open）。

  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: inspect-docs
    target_area: "Artifact Graph 利用"
    source_items: [AG-006]
    content: |
      ## Artifact Graph 利用

      inspect-docs は Artifact Graph を構造診断候補の探索に利用する。候補には unresolved reference, superseded artifact への現行参照, dangling relation, provenance 欠落, orphan candidate, 不自然な relation path, structural duplicate candidate を含む。

      Graph は候補提供者であり、決定的検査（参照実在, 委譲先 skill 実在, YAML 構文, 必須 field）は ADR-006 が定める通り docs-check, IR-056 が所有する。inspect-docs は REQ-010-018〜023 が定める意味診断を担当し、Graph 構造候補を未検証 evidence として意味診断の入力に利用する。構造診断と意味診断を区別し、SPLIT, MERGE, MOVE, DUPLICATE, RETIRE, DRIFT 等の意味判断を Graph の構造情報だけから確定しない。

      consumer 環境に対応 node type または relation type が存在しない場合は異常とせず従来の診断経路を継続する。

  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: inspect-skills
    target_area: "Artifact Graph 利用"
    source_items: [AG-006]
    content: |
      ## Artifact Graph 利用

      inspect-skills は self-hosting augmentation が利用可能な場合、Artifact Graph を用いて command と skill 関係, command と extension と skill 関係, 予期しない delegation, orphan skill candidate の候補を探索できる。

      Graph は候補提供者であり、委譲先 skill 実在の決定的検査は ADR-006 が定める通り docs-check, IR-056 が所有する。inspect-skills は REQ-010-024〜028 が定める意味診断を担当し、Graph 構造候補を未検証 evidence として意味診断の入力に利用する。

      consumer 環境に対応 node type または relation type が存在しない場合は異常とせず従来の診断経路を継続する。

  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-adversarial-review
    target_area: "Artifact Graph 利用"
    source_items: [AG-007]
    content: |
      ## Artifact Graph 利用

      agentdev-adversarial-review は Artifact Graph をレビュー対象候補, evidence の探索に利用する。論点候補には複数の規範的成果物から到達する対象, 複数経路, cycle, relation 集中ノード, isolated node, 複数 owner または governing relation を持つ候補を含む。

      Graph から得た情報は未検証 evidence として扱い、Reviewer または Reviewee の対論, 正規成果物確認を経ずに finding を確定しない。Graph はレビュー結論の確定ではなく evidence 探索に利用する。共通利用原則の防護事項は `agentdev-artifact-graph` SPEC「利用上の防護」を参照。

      Graph 不在、stale、consumer 環境に対応 node type または relation type が存在しない場合は、従来のレビュー経路で継続し、review を停止しない（fail-open）。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      ADR-007 L13 が歴史的経緯として repo-agentdev-artifact-graph を言及しており、
      R1 の廃止参照禁止と衝突する可能性。
    resolution: >-
      ADR-007 L13 は決定履歴の記録であり実行時参照ではない。
      R1 が対象とするのは command, skill, Project Extension の実行時委譲先参照
      および superseded SPEC パスの実行時 context 参照のみ。
      歴史的経緯を示す ADR, SPEC, ドキュメント本文中の言及は R1 の対象外。

  - id: CR-002
    conflict: >-
      case-run の Artifact Graph 利用制限を REQ-021 に新設すると、
      REQ-006-025, REQ-017-010 との三重所有になる可能性。
    resolution: >-
      REQ-021 に case-run 境界の新規要件行を作成しない。
      代わりに SPEC の case-run 利用制限セクションで REQ-017-010 境界の適用を明記する。
      REQ-017-010 が case-open と case-run の境界を正規所有し、
      REQ-021 は Graph 利用時の適用を参照する。

  - id: CR-003
    conflict: >-
      R9 の効果検証二層化の parser regression 層が既存 REQ-020 と重複する可能性。
    resolution: >-
      parser regression は REQ-020 の既存スコープ内で維持し、REQ-021 では
      再定義しない。REQ-021-006 は workflow effectiveness 層のみを定義し、
      parser regression は REQ-020 参照とする。
      SPEC では両層の分離構造を示すが parser regression の詳細は REQ-020 に委譲する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260810-01
    target_req: REQ-012
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_req_docs:
        - path: docs/requirements/REQ-012.md
          operation: append
          added_rows: [REQ-012-015, REQ-012-016, REQ-012-017]
      action_to_req_mapping:
        ACT-REQ-012: docs/requirements/REQ-012.md
      source_ru_to_operation_mapping:
        RU-20260810-01: [append REQ-012 rows 015-017]
      case_open_input:
        target_req: REQ-012
        operation: append
        rows: [REQ-012-015, REQ-012-016, REQ-012-017]

  - ou_id: OU-002
    source_ru: RU-20260810-01
    target_req: REQ-021
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_req_docs:
        - path: docs/requirements/REQ-021.md
          operation: create
          added_rows: [REQ-021-001, REQ-021-002, REQ-021-003, REQ-021-004, REQ-021-005, REQ-021-006]
      action_to_req_mapping:
        ACT-REQ-021: docs/requirements/REQ-021.md
      source_ru_to_operation_mapping:
        RU-20260810-01: [create REQ-021 rows 001-006]
      case_open_input:
        target_req: REQ-021
        operation: create
        rows: [REQ-021-001, REQ-021-002, REQ-021-003, REQ-021-004, REQ-021-005, REQ-021-006]

  - ou_id: OU-003
    source_ru: RU-20260810-01
    target_spec: docs/specs/skills/agentdev-artifact-graph.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-20260810-01
    target_specs:
      - docs/specs/commands/req-define.md
      - docs/specs/commands/spec-save.md
      - docs/specs/commands/case-open.md
      - docs/specs/commands/case-run.md
      - docs/specs/commands/case-close.md
      - docs/specs/commands/backlog-review.md
      - docs/specs/commands/inspect-docs.md
      - docs/specs/commands/inspect-skills.md
      - docs/specs/skills/agentdev-adversarial-review.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    description: >-
      9 consumer command/skill SPEC への Artifact Graph 利用セクション追加。
      各 consumer の権威動作（利用タイミング、判断基準、fallback）を当該 SPEC へ配置する。
      ACT-SPEC-003〜011 が対応。中央 agentdev-artifact-graph SPEC (OU-003) の共通利用原則を
      参照しつつ、consumer 固有の動作仕様を各 SPEC が所有する。
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      repository 全体を対象に repo-agentdev-artifact-graph の参照および
      superseded SPEC パス（docs/specs/local/artifact-graph.md）の実行時参照を検索する。
      検索対象は .agentdev/extensions/, src/opencode/commands/,
      src/opencode/skills/ の現行実行時参照（extension context.paths, skill 参照）とする。
      ADR 記述の歴史的言及、superseded SPEC 自身の自己記述は明示的に除外する。
      併せて agentdev-artifact-graph 経由で Graph build, prepare, query,
      check, verify が consumer 経路で成功することを確認する。
    pass_criteria: |
      repo-agentdev-artifact-graph を実行時委譲先とする現行参照が0件であること。
      superseded SPEC パスを実行時 context として参照する Project Extension が0件であること。
      Graph の build, prepare, query, check, verify が現行標準 skill 経由で成功すること。
    on_failure: |
      スコープ内の実装欠陥（残存参照、extension 破損）なら修正・再検証（fix-and-reverify）。
      要件変更、外部依存、設計判断が必要な場合は反復を停止し判断事項を報告（record-in-findings）。

  - id: TS-002
    target_item: AG-002
    verification: |
      Graph を利用する consumer 経路の integration test で、Graph 由来の候補が
      canonical source または独立確認手段で検証される経路を確認する。
      Graph 不在時の挙動, 意味的類似と明示関係の混同がないかを検証する。
      対象 consumer は req-define, spec-save, case-open, case-close,
      inspect-docs, inspect-skills, adversarial-review, backlog-review とする。
    pass_criteria: |
      Graph 由来の候補が最終判断前に canonical source または独立確認手段で
      検証されていること。Graph 不在が影響なしの根拠として使用されないこと。
      意味的類似が明示関係と同一視されないこと。
    on_failure: |
      スコープ内の実装欠陥（consumer Graph 利用ロジック）なら修正・再検証（fix-and-reverify）。
      設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-003
    target_item: AG-003
    verification: |
      Graph が missing, stale, invalid, regeneration failure,
      consumer に対象 node type または relation type が存在しないの各状態で
      consumer が代替探索へ移行することを確認する。
      併せて Graph 対象成果物を持たない consumer,
      self-hosting 固有 node type または relation type を持たない consumer が
      異常終了しないことを確認する。
    pass_criteria: |
      各 Graph failure 状態で代替探索へ移行し workflow が継続すること。
      Graph 対象外の consumer が異常終了しないこと。
    on_failure: |
      スコープ内の実装欠陥（fail-open ロジック、consumer 互換性処理）なら
      修正・再検査（fix-and-reverify）。設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-004
    target_item: AG-004
    verification: |
      req-define, spec-save, backlog-review の各 consumer について、
      Graph による候補探索と最終判断の分離を検証する。
      req-define は CREATE, APPEND, SPLIT, MERGE 判断が Graph 以外の情報で行われる。
      spec-save は target_area, 正規配置先判断が独立確認で行われる。
      backlog-review は統合, 分割, depends_on 判断が Graph 単独で確定されない。
      各 consumer の候補種別（REQ, ADR, SPEC, canonical owner, 影響候補,
      integrity rule 等）が探索可能であることを確認する。
    pass_criteria: |
      各 consumer が Graph を候補探索に利用できること。
      consumer 別に CREATE, APPEND, UPDATE, SPLIT, MERGE, semantic duplicate,
      canonical owner, SPEC 正規配置先, target_area が Graph 単独で確定されないこと。
    on_failure: |
      スコープ内の実装欠陥（consumer Graph 利用ロジック）なら修正・再検証（fix-and-reverify）。
      設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-005
    target_item: AG-005
    verification: |
      case-open targeted test で Issue 作成前に impact 候補が評価され、
      in scope, verification only, out of scope に分類されることを確認する。
      必須品質能力が artifact type から導出され、Graph の delegates_to, governs から
      直接決定されないことを検証する。
    pass_criteria: |
      Issue scope, acceptance criteria, test strategy の確定前に
      Graph による変更影響候補が評価されること。
      候補が3つの分類に振り分けられること。
      必須品質能力が artifact-quality-control-routing 経由で導出されること。
    on_failure: |
      スコープ内の実装欠陥（case-open Graph 利用ロジック）なら修正・再検証（fix-and-reverify）。
      設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-006
    target_item: AG-006
    verification: |
      inspect-docs が Graph 由来の構造候補（unresolved reference, dangling relation,
      provenance 欠落, orphan candidate, structural duplicate candidate）を
      未検証 evidence として意味診断に入力することを確認する。
      inspect-skills が command と skill 関係, command と extension と skill 関係,
      予期しない delegation, orphan skill candidate を探索できることを確認する。
      決定的検査（参照実在, 委譲先 skill 実在）が docs-check, IR-056 で行われ、
      inspect 系が重複所有しないことを確認する。
      consumer 環境で対応 node type 不在時に異常終了しないことを確認する。
    pass_criteria: |
      inspect-docs が structural 候補を意味診断の入力に利用し、意味診断と区別すること。
      inspect-skills が command と skill 関係, 予期しない delegation を探索できること。
      決定的検査が docs-check, IR-056 で行われ、inspect 系が重複所有しないこと。
      node type 不在時に異常終了しないこと。
    on_failure: |
      スコープ内の実装欠陥（inspect 系 Graph 利用ロジック）なら修正・再検証（fix-and-reverify）。
      ADR-006 との適合性に問題がある場合は設計判断が必要なため停止・報告（record-in-findings）。

  - id: TS-007
    target_item: AG-007
    verification: |
      adversarial-review test で Graph evidence が未検証候補として
      処理されることを確認する。Graph 由来の候補（複数経路到達, cycle,
      relation 集中ノード, isolated node, 複数 owner または governing relation）が
      対論または正規成果物確認を経ずに finding として確定されないことを検証する。
    pass_criteria: |
      Graph から得た情報が未検証 evidence として扱われること。
      指定された候補種類が探索可能であること。
      対論または正規成果物確認を経ずに finding が確定されないこと。
    on_failure: |
      スコープ内の実装欠陥（adversarial-review Graph 利用ロジック）なら
      修正・再検証（fix-and-reverify）。設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-008
    target_item: AG-008
    verification: |
      変更後の Graph check, verify で関係不整合が観測可能であることを確認する。
      defect 種別ごと（Graph defect, canonical defect）の fixture を用意し、
      原因分類が一致することを確認する。
      Graph 生成失敗時の fail-open 挙動と、canonical defect 検出時の
      既存 QG/AC による fail 挙動を分離して検証する。
    pass_criteria: |
      case-close が Graph integrity, unresolved relation, dangling relation,
      provenance defect を確認できること。
      Graph defect と canonical defect が区別されること。
      Graph 生成または問い合わせ失敗のみで case-close が失敗せず fail-open すること。
      canonical defect は既存の品質ゲート, 受け入れ条件で fail となること。
    on_failure: |
      スコープ内の実装欠陥（case-close Graph 利用、defect 分類ロジック）なら
      修正・再検証（fix-and-reverify）。設計判断が必要な場合は停止・報告（record-in-findings）。

  - id: TS-009
    target_item: AG-009
    verification: |
      case-run scope expansion negative test で、証拠源（Graph, rg, filesystem scan）
      にかかわらず case-run が既存 scope を超える変更を自律拡大しないことを確認する。
      Graph 探索で予期しない依存が見つかった場合に、Issue scope 内の内部実装影響は
      自律処理し、scope, 完了条件, REQ, Decision, SPEC, 必須品質統制の変更が必要な場合は
      blocked として case-update 連携することを確認する。
    pass_criteria: |
      証拠源にかかわらず case-run が既存 scope を超える変更を自律拡大しないこと。
      Issue scope 内の内部実装影響は自律処理されること。
      scope 変更が必要な場合は blocked として case-update 連携すること。
      REQ-017-010 の境界が維持されること。
    on_failure: |
      スコープ内の実装欠陥（case-run Graph 利用制限ロジック）なら修正・再検証（fix-and-reverify）。
      REQ-017-010 との適合性に問題がある場合は設計判断が必要なため停止・報告（record-in-findings）。

  - id: TS-010
    target_item: AG-010
    verification: |
      representative workflow query suite と ground truth を用意する。
      対象質問は REQ 変更影響候補, 同一 owner SPEC, 関連 command, skill,
      integrity rule, command から委譲される skill, superseded artifact への現行参照,
      変更後 dangling relation を含む。
      Graph 利用時と独立探索時で recall, false candidate, canonical source 到達可否,
      Graph-only miss, independent-search-only miss, 探索操作量を比較する。
      parser regression が REQ-020 で独立して実行, 判定可能なことを確認する。
    pass_criteria: |
      workflow effectiveness の比較で recall, false candidate, Graph-only miss,
      independent-search-only miss が判定可能であること。
      suite の ground truth が各質問の期待候補集合を定義していること。
      parser regression が REQ-020 で独立合否判定可能であること。
      Graph 自身の接続確認のみが workflow effectiveness の成立根拠とされていないこと。
      本検証は診断目的であり、性能閾値による合否判定は行わない。
    on_failure: |
      スコープ内の実装欠陥（suite 設計, 比較ロジック）なら修正・再検証（fix-and-reverify）。
      REQ-020 との所有境界に問題がある場合は停止・報告（record-in-findings）。

review_dispositions:
  - id: RD-001
    source_ru: RU-20260810-01
    source_item: R1
    disposition: covered
    reason_code: mapped_to_append
    reason: |
      R1 の廃止委譲先統一要件は AG-001 として ACT-REQ-012 に含まれ、
      REQ-012-015 へ追記される。不存在委譲先の扱い、superseded SPEC パスの
      実行時 context 参照除去も含む。
    evidence:
      path: docs/requirements/REQ-012.md
      section: REQ-012-015 (追記予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-002
    source_ru: RU-20260810-01
    source_item: R2
    disposition: covered
    reason_code: mapped_to_create
    reason: |
      R2 の Discovery/Impact 用途は AG-004, AG-005 として ACT-REQ-021 に含まれ、
      REQ-021-001, REQ-021-002 へ保存される。consumer 別候補種別、
      target_area 判断、統合/分割/depends_on 境界、品質能力ルーティング境界を含む。
    evidence:
      path: docs/requirements/REQ-021.md
      section: REQ-021-001, REQ-021-002 (新規作成予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-003
    source_ru: RU-20260810-01
    source_item: R3
    disposition: covered
    reason_code: mapped_to_create
    reason: |
      R3 の Diagnostics 用途は AG-006 として ACT-REQ-021 に含まれ、
      REQ-021-003 へ保存される。Graph を候補提供者とし、決定的検査は
      ADR-006 に従い docs-check, IR-056 が所有することを明記。
    evidence:
      path: docs/requirements/REQ-021.md
      section: REQ-021-003 (新規作成予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-004
    source_ru: RU-20260810-01
    source_item: R4
    disposition: covered
    reason_code: mapped_to_create
    reason: |
      R4 の Review Evidence 用途は AG-007 として ACT-REQ-021 に含まれ、
      REQ-021-004 へ保存される。具体的候補種別（複数経路到達, cycle,
      集中ノード, isolated, 複数 owner 等）を含む。
    evidence:
      path: docs/requirements/REQ-021.md
      section: REQ-021-004 (新規作成予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-005
    source_ru: RU-20260810-01
    source_item: R5
    disposition: covered
    reason_code: mapped_to_create
    reason: |
      R5 の Verification 用途は AG-008 として ACT-REQ-021 に含まれ、
      REQ-021-005 へ保存される。Graph 生成・鮮度、defect 種別の分類、
      canonical defect 時の既存 QG/AC fail 処理を含む。
    evidence:
      path: docs/requirements/REQ-021.md
      section: REQ-021-005 (新規作成予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-006
    source_ru: RU-20260810-01
    source_item: R6
    disposition: covered
    reason_code: mapped_to_spec
    reason: |
      R6 の case-run 利用制限は AG-009 として合意し、ACT-SPEC-001 の
      case-run 利用制限セクションへ配置する。REQ-021 に新規要件行を作成せず、
      REQ-017-010 境界の適用を明確化する。証拠源に依存しない表現とした。
    evidence:
      path: docs/specs/skills/agentdev-artifact-graph.md
      section: case-run の利用制限 (更新予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-007
    source_ru: RU-20260810-01
    source_item: R7
    disposition: covered
    reason_code: mapped_to_append
    reason: |
      R7 の判断防護原則は AG-002 として ACT-REQ-012 に含まれ、
      REQ-012-016 へ追記される。ACT-SPEC-001 の利用上の防護セクションにも
      共通原則として配置される。
    evidence:
      path: docs/requirements/REQ-012.md
      section: REQ-012-016 (追記予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-008
    source_ru: RU-20260810-01
    source_item: R8
    disposition: covered
    reason_code: mapped_to_append
    reason: |
      R8 の fail-open 互換性は AG-003 として ACT-REQ-012 に含まれ、
      REQ-012-017 へ追記される。invalid 状態、node/relation type 不在時の
      fallback、非 Graph consumer 互換性を含む。
    evidence:
      path: docs/requirements/REQ-012.md
      section: REQ-012-017 (追記予定)
      checked_at_commit: null
    related_removed_items: []

  - id: RD-009
    source_ru: RU-20260810-01
    source_item: R9
    disposition: covered
    reason_code: mapped_to_create
    reason: |
      R9 の効果検証二層化は AG-010 として ACT-REQ-021, ACT-SPEC-002 に含まれる。
      REQ-021-006 は workflow effectiveness 層のみを定義し、
      parser regression は REQ-020 参照とする。
    evidence:
      path: docs/requirements/REQ-021.md
      section: REQ-021-006 (新規作成予定)
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001 (APPEND REQ-012): consumer 原則要件行3行の追記。
    OU-002 (CREATE REQ-021): ワークフロー統合6要件行の新規REQ作成。
    OU-003 (UPDATE SPEC): agentdev-artifact-graph SPEC のワークフロー利用セクション拡張（利用上の防護保持, consumer 別詳細, case-run 制限）と効果検証セクション追加。OU-002 に依存。
    OU-004 (UPDATE SPEC ×9): 9 consumer command/skill SPEC への Artifact Graph 利用セクション追加。対象 SPEC:
      - docs/specs/commands/req-define.md (ACT-SPEC-003)
      - docs/specs/commands/spec-save.md (ACT-SPEC-004)
      - docs/specs/commands/case-open.md (ACT-SPEC-005)
      - docs/specs/commands/case-run.md (ACT-SPEC-006)
      - docs/specs/commands/case-close.md (ACT-SPEC-007)
      - docs/specs/commands/backlog-review.md (ACT-SPEC-008)
      - docs/specs/commands/inspect-docs.md (ACT-SPEC-009)
      - docs/specs/commands/inspect-skills.md (ACT-SPEC-010)
      - docs/specs/skills/agentdev-adversarial-review.md (ACT-SPEC-011)
      OU-002 に依存。各 consumer SPEC は権威動作（利用タイミング、判断基準、fallback）を所有し、中央 SPEC は共通利用原則の概要を提供する。
    実装作業は6 extension YAML の廃止参照修正および superseded SPEC パス移行、
    9 consumer command/skill SPEC の権威動作更新（Graph 利用セクション追加）、
    workflow effectiveness 検証インフラ追加を含む。
  wave_hints:
    - wave: 1
      description: >-
        廃止参照修正（6 extension YAML の旧 skill 名と superseded SPEC パス）と REQ/SPEC 保存。
        AC-001, AC-002, AC-011, AC-012, AC-015 に対応。
    - wave: 2
      description: >-
        ワークフロー統合実装。OU-004 として9 consumer command/skill SPEC へ Artifact Graph 利用セクション追加。
        対象: req-define, spec-save, case-open, case-run, case-close, backlog-review,
        inspect-docs, inspect-skills (commands), agentdev-adversarial-review (skill)。
        各 SPEC へ権威動作（利用タイミング、判断基準、fallback）を配置。
        AC-003 から AC-010 に対応。
      depends_on: [1]
    - wave: 3
      description: >-
        Workflow effectiveness 検証インフラ。representative query suite と ground truth 追加。
        parser regression suite は REQ-020 スコープで整理。
        AC-013, AC-014 に対応。
      depends_on: [2]
```

# summary

Artifact Graph を AgentDevFlow ワークフローの4用途（Discovery/Impact, Diagnostics, Review Evidence, Verification）の共通探索基盤として実効利用するための要件である。adversarial-review（2 stream 並列）の結果、既存の所有境界（ADR-006, REQ-017-010, REQ-010-003/020, REQ-020）を尊重するよう全面的に修正した。

主な合意内容:
- 廃止済み `repo-agentdev-artifact-graph` 参照と superseded SPEC パスを現行標準へ統一（REQ-012 APPEND）
- consumer command/skill への Graph 統合を要件化（REQ-021 CREATE 6要件行）
- Graph は候補提供者であり、決定的検査は docs-check/IR-056、意味診断は inspect 系が所有（ADR-006 適合）
- case-run の Graph 利用は REQ-017-010 境界内の補助用途に限定（SPEC で明確化、新規要件行なし）
- 必須品質能力は artifact-quality-control-routing 経由で導出（Graph から直接決定しない）
- Workflow effectiveness 検証を新規定義（parser regression は REQ-020 が既存所有）
- Graph は派生索引のままで SSoT 化せず、fail-open と後方互換性を維持

操作分類: APPEND REQ-012（3要件行）+ CREATE REQ-021（6要件行）+ UPDATE SPEC（中央 agentdev-artifact-graph SPEC 2セクション + 9 consumer command/skill SPEC の Artifact Graph 利用セクション）。ADR 不要（ADR-006/ADR-007 既有決定への適合）。

consumer SPEC 一覧確定（RES-001 解決）: ACT-SPEC-003〜011 として 9 consumer SPEC へ「Artifact Graph 利用」セクションを追加する。対象は req-define, spec-save, case-open, case-run, case-close, backlog-review, inspect-docs, inspect-skills（以上 commands）, agentdev-adversarial-review（skills）。各 consumer SPEC は権威動作（利用タイミング、判断基準、fallback）を所有し、中央 SPEC は共通利用原則の概要を提供する方針を確定した。OU-004 として operation_units へ追加済み。

adversarial-review 修正点: REQ-021-006（case-run境界）削除→SPEC配置、AG-006（候補提供者明確化）、REQ-021-006 parser regression簡略化→REQ-020参照、利用上の防護セクション保持、副要件復元、TS拡充。
