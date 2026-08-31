---
draft_type: req_draft
topic_slug: change-induced-risk-feedback
status: saved
design_saved: true
created_at: 2026-08-31T00:00:00+09:00
source_rus: []
---

# draft-data

```yaml
# work_type: ADF 本体の品質・検証プロセスへの新規能力導入と既存パイプラインの明確化 → feature
work_type: feature

# scale: 複数 REQ 操作の可能性（分割方針確定後に確定）
scale: large

# summary: staff-schedule 障害（PR #921/#924）から得た ADF フィードバック5点の要件化。
#   変更誘発境界リスク分析（FB-1）、Risk→Test Strategy 投影契約（FB-2）、
#   production-equivalent の境界再現性定義（FB-3）、技術固有知識の ADF core 非埋め込み（FB-4）、
#   learning 昇華先ルーティングの明確化（FB-5）。
#   Knowledge 独立文書種別の導入は未決事項として本要件から分離（ユーザー明示）。
summary: staff-schedule 障害からの ADF フィードバック5点（変更誘発境界リスク分析、Risk→Test Strategy 投影契約、production-equivalent 再定義、知識境界原則、learning 昇華先）の要件化。壁打ち継続中。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# STEP-2/3 で確定した照合結果の記録（合意項目は壁打ち確定後に追加）
agreed_items:
  - id: AG-001
    content: |
      変更対象の artifact 種別だけでなく、変更によって変化する依存・実行・環境境界
      （dependency boundary、client/server boundary、execution boundary、
      build/runtime boundary、environment propagation boundary）を分析し、
      change-induced risk を導出する一般能力を ADF の品質プロセスに導入すること。
      例: shared package 変更 → server 設定 API 依存経路の変化 → client から
      server env validation への到達可能性 → browser execution 失敗リスク、
      を実装差分から事前に導出できること。
  - id: AG-002
    content: |
      導出した case-specific risk を test strategy の入力とする投影契約を持つこと。
      change → risk → verification obligation → test strategy の変換経路を明示契約とし、
      QG-4（宣言済み test strategy の処理完了確認）で初めてリスクを発見する状態をなくすこと。
  - id: AG-003
    content: |
      production-equivalent verification を「本番を完全複製することではなく、
      対象リスクに関係する実行・依存・環境境界を十分再現した検証である」と定義すること。
      「常に特定環境でテストする」等のプロジェクト固有ルールではない一般原則として定義する。
  - id: AG-004
    content: |
      Project Knowledge を ADF workflow から利用可能にすること。
      ADF core（配布物）は一般規則のみを持ち、技術固有知識
      （Next.js client/server、Turbo globalEnv、Vercel prerender、Supabase 等のリスク判断知識）
      を ADF core に埋め込まない。
      技術固有知識の恒久所有構造は project-local 側
      （Design=現在のシステム事実、project-local Capability Skill=再利用可能な判断知識、
      Project Extension=判断知識を workflow 責務へ接続する機構）とし、
      workflow（変更誘発境界リスク分析を含む）から利用できること。
      知識は learning から昇華されて成長し、リスク導出規則として次の分析で使われる
      成長する資産として扱う。Knowledge 独立文書種別の導入は未決事項として本要件から分離。
  - id: AG-005
    content: |
      promoted learning を Requirement 候補に限定せず、Design・Skill・
      将来的な Knowledge 等の適切な恒久所有先へ昇華するルーティングを実体化すること。
      分類結果の消費、分類に応じた昇華先経路、RU 以外への昇華時のユーザー承認境界を含む。
      知識サイクルの「流入（learning）→ 昇華 → 保管 → 利用 → 再流入」の出口側を設計し、
      一周ごとにリスク導出規則が成長する構造を支える。
      intake は具体的作業候補の回収という現行責務を維持する。

# 操作分類確定済み（ユーザー合意 Q3/Q4/Q5/Q6）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:change-induced-boundary-risk
    source_items: [AG-001, AG-002]
    content: |
      変更誘発境界リスク分析。リスク導出規則（project-local の判断知識）を参照し、
      dependency / client-server / execution / build-runtime / environment-propagation
      境界について変更差分から change-induced risk を導出する。
      知識の参照は REQ-002-031 が正規所有する extension 読込経路とし、
      知識が不在の場合は ADF core の一般規則のみで5観点境界分析を実行する
      （分析を省略しない）。導出した case-specific risk を検証契約へ投影する
      （change → risk → verification obligation → test strategy）。
      QG-4（最終受入）で初めてリスクを発見する状態を解消する。
      本 REQ は case-open の execution contract 工程に先立つ分析能力であり、
      REQ-017-010 の探索範囲（変更影響候補）とは分析対象（5観点境界）が異なる。
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:production-equivalent-verification
    source_items: [AG-003]
    content: |
      production-equivalent verification を「本番完全複製ではなく、対象リスクに関係する
      実行・依存・環境境界を十分再現した検証」と定義する。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-002
    target_area: プロジェクト固有情報境界（REQ-002-010/030/031 近傍、禁止面の正本）
    source_items: [AG-004]
    content: |
      ADF core（配布成果物）は一般規則のみを保持し、技術固有知識を保持しないこと。
      技術固有知識の所有面の正本は project-knowledge-ownership REQ（同時 CREATE）とし、
      本行は配布成果物側の禁止面の正本として相互参照する（REQ-002-039 の例外条件に適合）。
  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-039
    target_area: 昇華先ルーティング
    source_items: [AG-005]
    content: |
      backlog-review による learning 昇華先ルーティングの実体化。
      適用対象は learning 由来の分類結果とし、intake/inspect 由来は現行の RU 化経路を維持する。
      learning-promote が渡した反映先分類結果を消費し、分類に応じて
      (a) 恒久所有先（既存 REQ/Decision/Design 反映、ガードレール移管、
      project-local Capability Skill の判断知識追加、Project Extension の接続更新）
      への昇華、(b) 通常の Issue による修正、(c) 重複・陳腐化した知識の削除、
      (d) 現時点で反映不能なものの保留、をルーティングする。
      昇華先が現行体系に存在しない知識は deferred として保留し、
      Knowledge 文書種別の導入判断と独立に扱う。
      恒久所有先のうち ADF リポジトリ外の project-local 資産への昇華は、
      backlog-review が直接書き換えず、書き込み先の実行前提（git 管理境界）を明示した
      指示を出力に含める。RU 以外への昇華もユーザー承認を経る
      （REQ-039-001 の承認原則に準拠）。
  - id: ACT-REQ-005
    artifact: req
    operation: create
    target: new:project-knowledge-ownership
    source_items: [AG-004]
    content: |
      Project Knowledge の恒久所有構造と workflow からの利用契約。
      技術固有知識（リスク判断知識）の所有先を Design（システム事実）と
      project-local 側の判断知識（project-local Capability Skill として所有され、
      REQ-002-030/031 が正規所有する Capability Skill Extension の機構経由で
      workflow 責務へ接続される）に分担させ、
      workflow（変更誘発境界リスク分析を含む）から利用できるようにする。
      本 REQ は extension 機構そのものの契約を所有せず、REQ-002-030/031 が正規所有する
      機構への名レベル参照と、技術固有知識の所有・利用契約を所有する
      （禁止面の正本は REQ-002 追加行、所有面の正本は本 REQ として相互参照する）。
      知識は learning 昇華先ルーティング（REQ-039 のルーティング契約）を経由して
      project-local 側に流入し、リスク導出規則として次の分析で使われる
      成長する資産として扱う。
      Knowledge 独立文書種別の導入は未決事項として分離し、本 REQ はこれに依存しない。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:change-induced-risk-analysis
    source_items: [AG-001, AG-002]
    content: |
      変更誘発境界リスク分析の導入と検証契約への投影を原則として確立する。
      変更から境界リスクを導出し、導出した case-specific risk を検証契約へ投影することを
      品質プロセスの第一級入力とする。本文は原則の確立に限定し、実行配置と検査詳細は
      REQ/Design へ委譲する。hard 統制点とはしない。
  - id: ACT-DES-001
    artifact: design
    operation: update
    target: docs/designs/responsibilities/artifact-quality-control-routing.md
    target_design:
      target_area: 入力源
      placement: append
    source_items: [AG-002]
    content: |
      品質能力の投影入力源として、artifact type に加えて case-specific risk
      （変更誘発境界リスク）を追加する。投影先は test strategy、検査は QG-1（投影完全性）。
      既存の合成規則（artifact type → 必須品質能力）を変更せず、入力源の追加として拡張する。
  - id: ACT-DES-002
    artifact: design
    operation: update
    target: docs/designs/quality/quality-gates.md
    target_design:
      target_area: QG-1
      placement: append
    source_items: [AG-002]
    content: |
      QG-1 に「リスク→test strategy 投影完全性」検査観点を追加する。
      新規ゲートは作らず、既存 QG-1 の検査観点の拡張として実施する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      FB-5（learning 昇華先）は現行 REQ-038-005 と部分的に重複する。
      REQ-038-005 は「反映先の評価と分類」を既に所有しており、
      learning-promote → backlog-review → RU → req-define の経路を維持すると規定済み。
    resolution: |
      FB-5 は REQ-038-005 との重複を避け、「分類結果を後続工程へ渡す」先の
      ルーティング明確化（RU 以外の恒久所有先への具体経路）に焦点を絞る。
      要件化の形式は REQ-039 への APPEND 行として合意済み。
  - id: CR-002
    conflict: |
      REQ-A（CREATE）は REQ-017-009/010（case-open が事前判定可能な追加検証条件を
      test strategy へ展開、変更影響候補を execution contract へ反映）および
      REQ-019（リファクタリング PR のテスト影響範囲検出 gate）と
      「変更 → 検証条件 → test strategy」の変換方向が重なる。
    resolution: |
      REQ-A は req-define の要件展開工程に先立つ分析能力であり、分析対象が
      REQ-017-010 の変更影響候補（artifact 差分）に対して5観点境界
      （dependency / client-server / execution / build-runtime / environment-propagation）
      の一般能力であること、REQ-019 はリファクタリング PR 限定の機械的 gate であることが
      吸収できない理由。上記差分を REQ-A 本文の目的セクションに記録する。
  - id: CR-003
    conflict: |
      REQ-B（CREATE）は REQ-007-006〜009（検証スイート合格判定、fail 由来分類、
      検証環境記録、baseline 再生成）と検証の質に関わる領域が近接する。
    resolution: |
      REQ-B は test strategy 設計時点（req-define）の検証手段の質基準、
      REQ-007-006〜009 は完了時点（case-run/case-close）の証跡契約であり、
      時点分担が分かれることが吸収できない理由。REQ-B は REQ-007 を複製せず参照に留める。
  - id: CR-004
    conflict: |
      project-knowledge-ownership REQ（CREATE）は REQ-002-030/031（Project Extensions
      機構の配置と読込境界）、REQ-027（Capability Skill 抽出契約）、
      project-extensions Design（project-local skill 委譲）と領域が近接する。
    resolution: |
      当該 REQ が所有するのは技術固有知識（リスク判断知識）の所有面の正本と
      workflow からの利用契約であり、extension 機構・Capability Skill モデルの契約は
      REQ-002-030/031・REQ-027-001（workflow-skill-model Design）が正規所有のまま。
      既存 REQ/Design に知識の所有・利用契約としての正本が存在しないことが
      吸収できない理由。REQ-002-039 の例外条件（正本一意、相互参照）に適合させる。

operation_units:
  - id: OU-001
    target_req: new:change-induced-boundary-risk
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - id: OU-002
    target_req: new:production-equivalent-verification
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - id: OU-003
    target_req: REQ-002
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - id: OU-004
    target_req: new:project-knowledge-ownership
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - id: OU-005
    target_req: REQ-039
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-A 新規 REQ 本文の横断確認。5観点境界（dependency / client-server / execution /
      build-runtime / environment-propagation）からのリスク導出契約と、project-local 判断知識
      （リスク導出規則）の参照契約が記述されていることを REQ 本文・関連 Design で確認する。
      inspect-docs（REQ 構造診断）を実行し、REQ 参照 ID 整合と第一参照導線を確認する。
    pass_criteria: |
      REQ-A 本文に5観点境界の定義とリスク導出規則の参照契約が存在する。
      参照経路が REQ-002-031 の extension 読込経路に特定され、
      知識不在時の挙動（一般規則のみで分析を実行）が明記されている。
      inspect-docs の REQ 診断で SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT が検出されない。
      REQ-017-009/010 と REQ-019 との差分（吸収できない理由）が REQ-A の目的セクションに
      明記されている。
    on_failure: fix-and-reverify  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する
  - id: TS-002
    target_item: AG-002
    verification: |
      投影契約の記述確認。change → risk → verification obligation → test strategy の
      変換経路が REQ-A 本文と artifact-quality-control-routing Design 更新に反映されていること、
      quality-gates Design の該当ゲート定義と矛盾しないことを確認する。
      Decision 本文が原則の確立に限定され（実行配置と検査詳細を含まず）、
      hard 統制点を追加していないことも確認する。
    pass_criteria: |
      投影契約の連鎖が REQ-A と Design 更新の両方で追跡可能であること。
      quality-gates Design の機械化境界表と矛盾がないこと。
      Decision 本文に実行配置・検査詳細の規範記述が含まれず、新規機械強制ゲートが
      定義されていないこと。
    on_failure: fix-and-reverify  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-B 新規 REQ 本文の確認。production-equivalent の定義が「本番完全複製ではなく
      対象リスクに関係する境界の再現性」であること、REQ-007-006〜009（完了時の由来分類・
      検証環境記録）を複製せず参照に留めることを確認する。
    pass_criteria: |
      REQ-B が検証手段の質基準を所有し、REQ-007 との時点分担（設計時 vs 完了時）が明確であること。
      REQ-002-039 正本一意性違反がないこと。
    on_failure: fix-and-reverify  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-002 APPEND 原則行と REQ-C2 新規 REQ の確認。原則行が1行に収まり、
      REQ-C2 が知識の所有構造（Design/Skill/Extension 分担）と利用契約を所有し、
      文書種別の定義を再掲しないことを確認する。Knowledge 独立文書種別への依存がないことも確認する。
    pass_criteria: |
      REQ-002 に原則行が追加され、既存 REQ-002 行との矛盾がないこと。
      REQ-002 追加行が禁止面の正本、project-knowledge-ownership REQ が所有面の正本として
      相互参照し、REQ-002-039（正本の一意性）の例外条件
      （正規所有者の一意性、正本変更の独立性）に適合していること。
      project-knowledge-ownership REQ が REQ-002-030/031 の extension 機構契約および
      workflow-skill-model Design の Capability Skill モデルを再所有せず、
      名レベル参照に留めること。
      project-knowledge-ownership REQ が文書種別責務
      （document-type-responsibilities）の定義再掲を含まないこと。
      project-knowledge-ownership REQ が Knowledge 文書種別の存在を前提としないこと。
    on_failure: fix-and-reverify  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ-039 APPEND 行の確認。REQ-038-005 が渡す分類結果を REQ-039 が消費する接続、
      昇華先経路、RU 以外昇華のユーザー承認境界、分類網羅性（昇華/Issue 修正/削除/保留）、
      適用対象の限定（learning 由来）が記述されていることを確認する。
      さらに REQ-039 のルーティング出口と project-knowledge-ownership REQ の
      保管構造（project-local 側）が接続することを確認する。
    pass_criteria: |
      REQ-038-005 と REQ-039 の接続が連続し矛盾しないこと。
      REQ-038-005 の全分類（昇華、Issue 修正、削除、保留）の受け皿が
      ルーティング契約に含まれること。
      ルーティングの適用対象が learning 由来に限定され、intake/inspect 由来の
      現行経路（RU 化）を維持すること。
      昇華先に project-local 側の保管先（Capability Skill Extension 接続経由の
      判断知識）が含まれ、ADF リポジトリ外資産への書き込み前提が明示されていること。
      REQ-039 APPEND 行が Knowledge 文書種別の存在を前提としないこと。
      ユーザー承認境界が REQ-039-001 の承認原則に準拠して記述されていること。
    on_failure: fix-and-reverify  # 選択理由: 文書整合の修復が主であるため、修復後に同検査を再実行する

review_dispositions: []

case_open_hints:
  epic_needed: false
  decomposition: |
    depends_on（必須依存のみ）上、全 OU は単独根のため連結成分モデルに従い
    Standard flow（単一 Issue 構成）を推奨。実施順序は recommended_order に従う。
  wave_hints:
    - OU-001（REQ-A CREATE + Decision + Design 更新2件）を最初に実施し、
      OU-002（REQ-B CREATE）は OU-001 のリスク概念定義を参照するため後続を推奨
      （用語参照であり必須依存ではないため、並列実行も可）
    - OU-003/OU-004/OU-005 は相互独立、任意の順序で実施可
```

# summary

壁打ち第1ラウンド前の初期確定内容を記録。
- 入力ソース: ユーザーの自然言語フィードバック（staff-schedule 障害→ADF 改善）
- self-hosting リポジトリのため `agentdev_handoff: true` 不要（通常の req/case workflow で扱う）
- Knowledge 独立文書種別導入は未決事項として分離済み
- 照合済み既存 REQ: REQ-019、REQ-007、REQ-038、REQ-004、REQ-039、REQ-027、quality-gates Design、artifact-quality-control-routing Design
- 合意済み（第1ラウンド）: Q1 分割方針（FB-1+FB-2 統合、FB-3/FB-4/FB-5 個別）、Q2 通常Case、Q3 FB-1 は CREATE（新 REQ）
- 合意済み（第2ラウンド）: Q4 FB-3 CREATE、Q5 FB-4 REQ-002 APPEND、Q6 FB-5 REQ-039 APPEND
- 合意済み（第3〜4ラウンド）: 知識サイクル（成長する資産）観点での REQ-C/D 実体化、Q11 REQ-C 2部構成、Q12 Knowledge 文書種別の追跡Issue 化、Q7 Decision 作成
- 配置判断のため REQ-002（配布成果物の責務境界）、REQ-007/027/038/039 の行レベル追加照合済み
- adversarial-review 結果の反映: ACT-DES 追加、OU 構成の Standard flow 化（単独根は Epic 化不変方針）、CR-002〜004 追加（吸収できない理由の記録）、知識参照経路の特定（REQ-002-031 準拠）と不在時挙動の明示、昇華経路と分類網羅性の明示、REQ-002 行と project-knowledge-ownership REQ の正本相互参照、TS 検証の補強
