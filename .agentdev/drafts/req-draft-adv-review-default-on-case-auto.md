---
draft_type: req_draft
topic_slug: adv-review-default-on-case-auto
status: saved
created_at: 2026-08-09T19:00:00+09:00
saved_at: 2026-08-09
source_rus:
  - RU-0014
spec_saved_at: 2026-08-09
spec_save_result:
  applied: []
  skipped:
    - id: ACT-SPEC-001
      target: docs/specs/skills/agentdev-adversarial-review.md
      target_area: "初期 challenge / finding lifecycle / 収束判定 / 発動契約"
      reason: target_area_not_found
    - id: ACT-SPEC-002
      target: docs/specs/commands/case-auto.md
      target_area: "bounded parent decision resolution / 停止理由分類"
      reason: target_area_not_found
    - id: ACT-SPEC-003
      target: docs/specs/workflows/delegation-contracts.md
      target_area: "decision_context / parent_decision_required / resume point"
      reason: target_area_not_found
    - id: ACT-SPEC-004
      target: docs/specs/workflows/workflow-contracts.md
      target_area: "case-auto 停止・resume 伝播"
      reason: target_area_not_found
    - id: ACT-SPEC-005
      target: docs/specs/commands/req-define.md
      target_area: "adversarial-review 挿入境界 / default-on / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-006
      target: docs/specs/commands/case-open.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-007
      target: docs/specs/commands/case-run.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-008
      target: docs/specs/commands/inspect-promote.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-009
      target: docs/specs/commands/intake-promote.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-010
      target: docs/specs/commands/learning-promote.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
    - id: ACT-SPEC-011
      target: docs/specs/commands/backlog-review.md
      target_area: "adversarial-review 挿入境界 / skip 条件"
      reason: target_area_not_found
  follow_ups:
    - "ACT-SPEC-001〜011: 全11件の target_area が既存見出しと完全一致せず（search-target-area.ts matches 空）。各 action の target_area は抽象的なトピック群（例: 『初期 challenge / finding lifecycle / 収束判定 / 発動契機』）であり、SPEC 内の実在見出しテキストではない。target-area-matching.md（見出し行全体完全一致、前方一致廃止）に従い全件スキップ。operation を spec-create（新規セクション追加）へ切り替えるか、target_area を実在見出しへ修正して再実行を推奨。各 content は『具体的な修正箇所は case-run で特定』を明示しており、case-run で SPEC への反映を実施することを想定。"
---

# draft-data

```yaml
work_type: feature
scale: large

summary: |
  adversarial-review の審議メカニズム強化（独立初期レビュー、finding 単位の構造化状態管理、semantic stagnation / convergence control）、発動方針の default-on + skip policy 化、および case-auto と両立する bounded parent decision resolution を導入する。req-define を case-auto 開始前の重点 review 地点と位置付け、各 caller command は自身の候補に対する adversarial-review の実施と finding の採否・反映責務を維持する。case-auto は中央集約 review engine とはならず、下位 command から受領した decision_context を現行正規成果物から一意に回答可能な場合はユーザー停止せず自走し、上位合意矛盾や新規ユーザー判断が必要な場合のみ停止する。adversarial-review は引き続き QG/HITL の代替にも新しい恒久統制ゲートにもならず、新しい正規 review artifact や永続 finding schema は導入しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      adversarial-review の初期 challenge は最低2系統の独立した論理 review stream で実施し、各 stream は初期 finding 生成完了前に兄弟 stream の finding を参照しないこと。独立性は物理 agent 差やモデル差ではなく、初期 finding 生成時の相互 finding 非共有によって定義すること。対象、目的、制約、確定済み review strategy は stream 間で共有してよい。各 stream は共通 strategy に不足を認めた場合、兄弟 stream の finding を見ずに補足観点を追加できること。初期 challenge 後に finding を統合し、duplicate を整理して既存 counter-challenge / convergence へ進むこと。
  - id: AG-002
    content: |
      各 finding を個別に識別し、審議状態を追跡できること。少なくとも、主張、evidence、assumptions、scope / applicability、falsification condition、現在状態、直近 disposition、解決根拠、duplicate 関係を意味的に区別できること。finding 状態は審議中の一時状態とし、新しい正規 artifact または永続 schema を導入しないこと。具体的 field 名、保存形式、内部データ構造は実装詳細とすること。
  - id: AG-003
    content: |
      審議の進展を文章表現や単純 round 数ではなく、finding の意味状態の変化で判定すること。新しい substantive finding、撤回、scope 限定、修正、candidate consensus、完了、新 evidence、新 premise、新 falsification condition、duplicate 統合等は意味的進展として扱えること。言い換え、同一 evidence の反復、根拠のない同一 finding 再起票を進展として扱わないこと。stagnation 検出時、直ちにユーザーへエスカレーションせず、duplicate 統合、非本質論点終了、追加 evidence 探索、scope 限定等の自律解決を試みること。固定 round 数を REQ / SPEC 上の収束条件にしないこと。timeout や最大 round は実装詳細として設定可能とすること。
  - id: AG-004
    content: |
      REQ-015 で定義される adversarial-review caller 対象 command では adversarial-review を原則実行すること（default-on）。ユーザー明示指定を通常発動の必須条件としないこと。review 価値が明確に低い経路では skip を許容すること。skip 条件は当該経路の正規所有者で明示的かつ判定可能に定義すること。skip 判断のためだけに新しい HITL / 承認点を追加しないこと。skip 対象でもユーザーが明示的に adversarial-review を要求した場合は実行すること。adversarial-review は QG / HITL の代替にしないこと。従来の明示呼び出しによる任意の助言手段という性質から、原則適用・skip 可能な助言手段へ方針を転換する。
  - id: AG-005
    content: |
      req-define は case-auto 対象外の対話的な要件確定フェーズとして adversarial-review を原則実施すること。adversarial-review finding を要件候補へ反映し、必要なら壁打ちを再開すること。case-auto へ引き渡せる状態では、ユーザー固有の目的、対象範囲、外部契約、重要制約その他 case-auto が新たに決定できない本質的事項を未決のまま残さないこと。adversarial-review により本質的未決事項が検出された場合、既存 auto_gate の未解決事項として扱い、別の新規承認ゲートを作らないこと。req-define でユーザーと確定した意味を、後続の正規 REQ / ADR / SPEC / Issue へ継承すること。
  - id: AG-006
    content: |
      各 caller command は自身が所有する候補について adversarial-review を実施すること。finding の意味解釈、採否、候補への反映は caller command の責務として維持すること。caller command は、自身の責務と利用可能な合意済み情報で解決できない判断事項だけを親へ返すこと。case-auto 固有の finding 採否ロジックを各 caller command に重複実装しないこと。通常単体実行と case-auto 配下実行で、各 caller command の review 対象、finding 解釈、採否、反映責務が変化しないこと。
  - id: AG-007
    content: |
      case-auto は adversarial-review を中央集約的に直接実施・解釈する review engine とならないこと。下位 command から raw finding ではなく、解決不能な判断事項を構造化した decision context として受領すること。受領した判断事項について、その時点で有効な REQ、ADR、SPEC、Issue その他の正規な合意済み情報から回答可能か確認すること。既決事項から一意に回答できる場合はユーザーへ再確認せず回答し、下位 command を resume させること。外部仕様、互換性、データ保持、セキュリティ、対象範囲、受け入れ条件等を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り合理的な作業仮定で自走できること。上位合意そのものの欠落、矛盾、曖昧性が finding の対象である場合、その問題のある上位合意を根拠に finding を自動解決しないこと。既存合意または許容内部裁量で解けない新しいユーザー価値判断、対象範囲変更、外部契約変更等が必要な場合のみユーザーへエスカレーションすること。case-auto は回答と根拠または作業仮定を下位 command へ返し、既存 resume point から処理を継続すること。adversarial-review の再実行要否は adversarial-review 側の再 review 契約に従い、case-auto 独自の再 review 条件を持たないこと。
  - id: AG-008
    content: |
      req-define の draft ファイル自体を恒久的な最上位 SSoT としないこと。req-define でユーザーと確定した意味を後続正規成果物へ継承し、各時点ではその時点の有効な正規成果物を判断根拠とすること。下位工程は既に確定済みのユーザー判断を理由なく再決定しないこと。一方、確定内容自体の矛盾、欠落、不整合を adversarial-review が発見することを妨げず、その場合は新しい finding として扱うこと。
  - id: AG-009
    content: |
      adversarial-review は QG-1〜QG-4、既存 HITL、承認ゲート、統制ゲートのいずれの代替にもならないこと。新しい恒久的な統制ゲートとして導入しないこと。新しい正規 review artifact または永続 finding schema を生成しないこと。adversarial-review 利用不能時は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持すること（REQ-014-010 と整合）。

artifact_actions:
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-003.md
    source_items: [AG-004]
    content: |
      REQ-003-035 を次へ更新する: 「原則適用・skip 可能な助言手段（対論型レビュー）がユーザー承認、および commit、push、merge、ファイル保存、Issue と PR の作成・更新・コメント、レビュー結果の自動適用の副作用権限を代行しないこと。完了時に、結果の反映、ファイル保存等を必要に応じて追加指示できることをユーザーへ明示的に促すこと。ただし、その促し自体を理由に Skill が後続操作を実行しないこと」（「明示呼び出しによる任意」から「原則適用・skip 可能」へ方針転換、副作用権限代行禁止・QG/HITL 非代替は維持）。
  - id: ACT-REQ-003-APPEND
    artifact: req
    operation: append
    target: docs/requirements/REQ-003.md
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-003-041 | adversarial-review の初期 challenge は最低2系統の独立した論理 review stream で実施し、各 stream は初期 finding 生成完了前に兄弟 stream の finding を参照しないこと。独立性は物理 agent 差やモデル差ではなく、初期 finding 生成時の相互 finding 非共有によって定義し、対象・目的・制約・確定済み review strategy は共有を許容すること。初期 challenge 後に finding を統合し duplicate を整理して既存 counter-challenge / convergence へ進むこと |
      | REQ-003-042 | 各 finding を個別に識別し、主張・evidence・assumptions・scope / applicability・falsification condition・現在状態・直近 disposition・解決根拠・duplicate 関係を意味的に区別して追跡できること。finding 状態は審議中の一時状態とし、新しい正規 artifact または永続 schema を導入せず、具体的 field 名・保存形式・内部データ構造は実装詳細とすること |
      | REQ-003-043 | 審議の進展を文章表現や単純 round 数ではなく finding の意味状態の変化で判定し、言い換え・同一 evidence 反復・根拠のない同一 finding 再起票を進展として扱わず、stagnation 検出時は直ちにユーザーへエスカレーションせず duplicate 統合・非本質論点終了・追加 evidence 探索・scope 限定等の自律解決を試みること。固定 round 数を REQ / SPEC 上の収束条件とせず、timeout や最大 round は実装詳細として設定可能とすること |
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: docs/requirements/REQ-014.md
    source_items: [AG-004]
    content: |
      REQ-014-001 を次へ更新する: 「対論型レビュー（adversarial-review）は原則適用・skip 可能な助言手段であり、新規必須工程、QG、承認ゲート、統制ゲートとして導入しないこと」（「任意助言手段」から「原則適用・skip 可能な助言手段」へ方針転換）。
  - id: ACT-REQ-014-APPEND
    artifact: req
    operation: append
    target: docs/requirements/REQ-014.md
    source_items: [AG-004]
    content: |
      | REQ-014-013 | REQ-015 で定義される adversarial-review caller 対象 command では adversarial-review を原則実行し、ユーザー明示指定を通常発動の必須条件としないこと（default-on）。ただし QG-1〜QG-4、既存 HITL、承認ゲート、統制ゲートのいずれの代替にもならず、新しい恒久統制ゲートとして導入しないこと |
      | REQ-014-014 | skip 条件は当該経路の正規所有者で明示的かつ判定可能に定義し、skip 判断のためだけに新しい HITL / 承認点を追加せず、skip 対象でもユーザーが明示的に adversarial-review を要求した場合は実行すること |
  - id: ACT-REQ-015
    artifact: req
    operation: update
    target: docs/requirements/REQ-015.md
    source_items: [AG-004, AG-005]
    content: |
      REQ-015-002 を次へ更新する: 「対象7コマンドでは adversarial-review を原則実行し、ユーザー明示指定時は必ず実行すること」（default-on を反映、従来の「ユーザー明示指定時は発動」から「原則実行 + 明示指定時は必須実行」へ）。
      REQ-015-003 を次へ更新する: 「各経路の正規所有者が定義した skip 条件に該当する場合、adversarial-review を省略して従来フローを継続できること」（従来の「条件非該当時は従来フロー」から「skip 条件該当時は省略可能」へ明確化）。
  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-006.md
    source_items: [AG-007]
    content: |
      | REQ-006-112 | case-auto は下位 command から raw finding ではなく解決不能な判断事項を構造化した decision context を受領し、現行正規成果物（REQ、ADR、SPEC、Issue その他合意済み情報）から一意に回答可能な場合はユーザー停止せず回答して下位 command を resume させること |
      | REQ-006-113 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件等を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り case-auto が作業仮定と根拠を明示した上で自走継続できること |
      | REQ-006-114 | 上位 REQ/ADR/SPEC/Issue 等の矛盾そのものが finding の対象である場合、case-auto が当該矛盾した情報を根拠として一方を勝手に採用せず、新しいユーザー価値判断・対象範囲変更・外部契約変更等が必要な場合は既存停止経路でユーザーへ返すこと |
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:case-auto-bounded-parent-decision-resolution
    source_items: [AG-007]
    content: |
      # ADR-008: case-auto の限定的親判断解決（bounded parent decision resolution）

      ## 決定

      case-auto は下位 command から受領した構造化 decision_context について、現行正規成果物（REQ/ADR/SPEC/Issue）から一意に回答可能な場合はユーザー停止せず回答して resume する。外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細は、既存契約で許容された範囲に限り作業仮定で自走する。上位合意の矛盾・欠落・曖昧性が finding の場合は当該矛盾を根拠に自動解決せず、新しいユーザー価値判断・対象範囲変更・外部契約変更が必要な場合のみ既存停止経路でユーザーへ返す。

      ## 根拠

      case-auto と adversarial-review の両立を図るため。default-on + skip policy により case-auto 配下の各 caller command で adversarial-review が原則実行されるが、各 caller command の finding 採否・反映責務を維持しつつ、case-auto を中央集約 review engine にせず、合意済み裁量境界内で継続的に再検証する機構として扱うため。

      ## 影響

      case-auto と下位 command 間の責務境界と HITL 境界に影響する。既存 REQ-006-086 の停止理由分類（合意要件逸脱、スコープ拡大、repo 外実体変更、command 契約不整合等）に「上位合意矛盾」「新規ユーザー判断事項」を統合して運用する。REQ-003-008/009/010（外部助言・ブロッカー扱い）および REQ-014-009（unresolved 時の不可逆処理回避）と整合し、ADR-003 ソフトコントラクト原則は置換しない。

      ## 関連

      - relates-to: ADR-001 決定1（namespace 一意性）、決定3（工程委譲）、決定4（case-auto 自走境界）
      - relates-to: v2:ADR-0112、v2:ADR-0138（過去版 case-auto 判断委譲に関する合意）
      - 親 REQ: REQ-006-112〜114、REQ-014-009/010
      - 副次 SPEC: docs/specs/commands/case-auto.md、docs/specs/workflows/delegation-contracts.md、docs/specs/workflows/workflow-contracts.md
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-adversarial-review
    target: docs/specs/skills/agentdev-adversarial-review.md
    target_area: 初期 challenge / finding lifecycle / 収束判定 / 発動契約
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      以下を詳細化すること。具体的な修正箇所・追記箇所は case-run で特定する。
      (1) 初期 challenge における最低2系統の独立論理 stream 実行、初期 finding 生成完了前の兄弟 stream finding 非共有、共通 strategy 共有許容、初期 challenge 後の finding 統合と duplicate 整理。
      (2) finding 単位の構造化状態管理（主張・evidence・assumptions・scope/applicability・falsification condition・現在状態・直近 disposition・解決根拠・duplicate 関係）。新規永続 schema は導入せず、審議中の一時状態として扱う。具体的 field 名・保存形式は実装詳細。
      (3) semantic stagnation / convergence control。意味状態変化による進展判定、言い換え反復の非進展扱い、stagnation 時の自律解決（duplicate 統合・非本質論点終了・追加 evidence 探索・scope 限定）、固定 round 数の収束条件非採用。
      (4) 発動契約の default-on + skip policy 明示、QG/HITL 非代替・新規統制ゲート非導入・新規永続 artifact 非生成の再確認。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target: docs/specs/commands/case-auto.md
    target_area: bounded parent decision resolution / 停止理由分類
    source_items: [AG-007]
    content: |
      bounded parent decision resolution の詳細を追記する。case-auto は raw finding を解釈・採否・候補反映せず、構造化 decision_context を受領して現行正規成果物から一意回答可能か確認、可逆的内部詳細は作業仮定で自走、上位合意矛盾・新規ユーザー判断時は既存停止経路でユーザーへ返す。既存停止理由分類（REQ-006-086）へ「上位合意矛盾」「新規ユーザー判断事項」を統合。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target: docs/specs/workflows/delegation-contracts.md
    target_area: decision_context / parent_decision_required / resume point
    source_items: [AG-007]
    content: |
      decision_context / parent_decision_required / resume point の既存契約を拡張利用し、case-auto の bounded parent decision resolution を支える。新規永続結果型は導入しない。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target: docs/specs/workflows/workflow-contracts.md
    target_area: case-auto 停止・resume 伝播
    source_items: [AG-007]
    content: |
      case-auto と下位 command 間の停止・resume 伝播契約を bounded parent decision resolution と整合させる。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target: docs/specs/commands/req-define.md
    target_area: adversarial-review 挿入境界 / default-on / skip 条件
    source_items: [AG-004, AG-005]
    content: |
      req-define を case-auto 開始前の重点 review 地点として default-on を反映し、REQ-015-004 既存の挿入境界（Scale 判断後、ADR判断前、要件doc生成前）を維持する。req-define 経路の skip 条件を正規所有者として明示的かつ判定可能に定義する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target: docs/specs/commands/case-open.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004]
    content: |
      REQ-015-009 既存の挿入境界（execution structure、Issue 本文候補、完了条件構成後、最初の GitHub Issue 作成前）を維持し、case-open 経路の skip 条件を正規所有者として定義する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target: docs/specs/commands/case-run.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004, AG-006]
    content: |
      REQ-015-010 既存の挿入境界（agentdev-case-run-execution-adapter 委譲契約内、最初の実装変更前）を維持し、case-run 経路の skip 条件を正規所有者として定義する。各 caller command の finding 採否・反映責務維持を再確認する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: inspect-promote
    target: docs/specs/commands/inspect-promote.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004]
    content: |
      REQ-015-005 既存の挿入境界（暫定分類後、HITL 前、--auto 経路は迂回）を維持し、inspect-promote 経路の skip 条件を正規所有者として定義する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: intake-promote
    target: docs/specs/commands/intake-promote.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004]
    content: |
      REQ-015-006 既存の挿入境界（暫定分類生成後、ユーザ提示前）を維持し、intake-promote 経路の skip 条件を正規所有者として定義する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: learning-promote
    target: docs/specs/commands/learning-promote.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004]
    content: |
      REQ-015-007 既存の挿入境界（既存対策確認後、判定結果提示前、review 反映時は evaluation-report 更新へ戻し関連 Step を再実行）を維持し、learning-promote 経路の skip 条件を正規所有者として定義する。具体的修正箇所は case-run で特定。
  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: backlog-review
    target: docs/specs/commands/backlog-review.md
    target_area: adversarial-review 挿入境界 / skip 条件
    source_items: [AG-004]
    content: |
      REQ-015-008 既存の挿入境界（構成、review、承認の順、矛盾は既存矛盾検出へ渡し review 内で自動解決しない）を維持し、backlog-review 経路の skip 条件を正規所有者として定義する。具体的修正箇所は case-run で特定。

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-014-001 が「adversarial-review は任意助言手段」と規定し、REQ-003-035 が「明示呼び出しによる任意のレビュー手段」と規定している。一方、RU-0014 は default-on + skip policy を要求し、ユーザー明示指定を通常発動の必須条件から外すことを求める。
    resolution: |
      REQ-014-001 と REQ-003-035 を「原則適用・skip 可能な助言手段」へ UPDATE する（Oracle bg_07a3f322 確定事項1、推定事項1）。adversarial-review は依然として QG/HITL の代替にも新的統制ゲートにもならず（REQ-014-002 維持、REQ-003-036 維持）、「任意助言手段」の本質（副作用権限代行禁止、新規必須工程化禁止）は維持する。default-on は「必須工程」ではなく「原則実行・skip 可能」を意味し、REQ-014-001 の「新規必須工程としては導入しない」とは両立する。
  - id: CR-002
    conflict: |
      REQ-015-012 と case-auto SPEC は case-auto を「純粋な停止伝播」「review 直接起動・finding 解釈・採否・再評価を行わない」と規定する。RU-0014 は case-auto が decision_context を受領して現行正規成果物から一意回答可能な場合は自走解決することを求め、責務境界の変更に見える。
    resolution: |
      case-auto は引き続き review engine ではなく raw finding を解釈・採否しない（Oracle bg_07a3f322 推定事項3）。bounded parent decision resolution は「構造化 decision_context のみを対象とし、上位合意から一意に解ける場合または既存契約内の可逆な内部事項だけを自動解決する」原則で、raw finding 解釈・REQ/ADR/SPEC 変更・下位 command 専門判断の代行を禁止したまま（ADR-008 で明記）。REQ-006-024（case-run 既存契約 scope 内自律処理）・REQ-006-025（scope 変更は blocked）とは「case-run 内部実装判断」と「case-auto が受領した親判断文脈」を分離すれば重複しない。ADR-008 として記録し、REQ-006-112〜114 へ反映する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0014
    target_req: REQ-003
    target_spec:
      - docs/specs/skills/agentdev-adversarial-review.md
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-003.md
      operations:
        - artifact_action: ACT-REQ-003
          operation: update
          target_req_doc: docs/requirements/REQ-003.md
          applied_row: REQ-003-035
          source_items: [AG-004]
        - artifact_action: ACT-REQ-003-APPEND
          operation: append
          target_req_doc: docs/requirements/REQ-003.md
          applied_rows: [REQ-003-041, REQ-003-042, REQ-003-043]
          source_items: [AG-001, AG-002, AG-003]
      source_ru_to_req:
        RU-0014: [REQ-003-035 (update), REQ-003-041, REQ-003-042, REQ-003-043]
      case_open_consumable:
        req_id: REQ-003
        req_doc: docs/requirements/REQ-003.md
        row_ids: [REQ-003-035, REQ-003-041, REQ-003-042, REQ-003-043]
        note: "default-on + skip policy への方針転換（REQ-003-035）と独立 stream / finding lifecycle / semantic stagnation の3追加要件行"
  - ou_id: OU-002
    source_ru: RU-0014
    target_req: REQ-014
    target_spec: []
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-014.md
      operations:
        - artifact_action: ACT-REQ-014
          operation: update
          target_req_doc: docs/requirements/REQ-014.md
          applied_row: REQ-014-001
          source_items: [AG-004]
        - artifact_action: ACT-REQ-014-APPEND
          operation: append
          target_req_doc: docs/requirements/REQ-014.md
          applied_rows: [REQ-014-013, REQ-014-014]
          source_items: [AG-004]
      source_ru_to_req:
        RU-0014: [REQ-014-001 (update), REQ-014-013, REQ-014-014]
      case_open_consumable:
        req_id: REQ-014
        req_doc: docs/requirements/REQ-014.md
        row_ids: [REQ-014-001, REQ-014-013, REQ-014-014]
        note: "default-on + skip policy 共通契約層への反映（REQ-014-001 update + REQ-014-013/014 append）"
  - ou_id: OU-003
    source_ru: RU-0014
    target_req: REQ-015
    target_spec:
      - docs/specs/commands/req-define.md
      - docs/specs/commands/case-open.md
      - docs/specs/commands/case-run.md
      - docs/specs/commands/inspect-promote.md
      - docs/specs/commands/intake-promote.md
      - docs/specs/commands/learning-promote.md
      - docs/specs/commands/backlog-review.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-015.md
      operations:
        - artifact_action: ACT-REQ-015
          operation: update
          target_req_doc: docs/requirements/REQ-015.md
          applied_rows: [REQ-015-002, REQ-015-003]
          source_items: [AG-004, AG-005]
      source_ru_to_req:
        RU-0014: [REQ-015-002 (update), REQ-015-003 (update)]
      case_open_consumable:
        req_id: REQ-015
        req_doc: docs/requirements/REQ-015.md
        row_ids: [REQ-015-002, REQ-015-003]
        note: "7経路 default-on + skip policy の caller integration 側反映（update のみ）"
  - ou_id: OU-004
    source_ru: RU-0014
    target_req: REQ-006
    target_spec:
      - docs/specs/commands/case-auto.md
      - docs/specs/workflows/delegation-contracts.md
      - docs/specs/workflows/workflow-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-006.md
      saved_adr_docs:
        - docs/adr/ADR-008.md
      operations:
        - artifact_action: ACT-REQ-006
          operation: append
          target_req_doc: docs/requirements/REQ-006.md
          applied_rows: [REQ-006-112, REQ-006-113, REQ-006-114]
          source_items: [AG-007]
        - artifact_action: ACT-ADR-001
          operation: create
          target_adr_doc: docs/adr/ADR-008.md
          allocated_adr_id: ADR-008
          original_target: new:case-auto-bounded-parent-decision-resolution
          source_items: [AG-007]
      source_ru_to_req:
        RU-0014: [REQ-006-112, REQ-006-113, REQ-006-114]
      source_ru_to_adr:
        RU-0014: [ADR-008]
      case_open_consumable:
        req_id: REQ-006
        req_doc: docs/requirements/REQ-006.md
        row_ids: [REQ-006-112, REQ-006-113, REQ-006-114]
        adr_ids: [ADR-008]
        adr_doc: docs/adr/ADR-008.md
        note: "case-auto bounded parent decision resolution（REQ-006 append 3件 + ADR-008 create）"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      adversarial-review SPEC（docs/specs/skills/agentdev-adversarial-review.md）と配布 SKILL（src/opencode/skills/agentdev-adversarial-review/）で初期 challenge が最低2論理 stream で実行されることを確認する。各 stream の初期 finding 完了前の兄弟 stream finding 共有有無を実行ログまたは設計資料で比較する。
    pass_criteria: |
      最低2 stream で実行され、初期 finding 生成完了前に兄弟 stream finding 共有が0件であること。
    on_failure: |
      fix-and-reverify: stream 数または独立性が満たされない場合、SPEC/SKILL を修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      複数 stream が同一 substantive finding を生成した場合の統合結果を確認する。
    pass_criteria: |
      duplicate として単一の審議対象へ整理されること。
    on_failure: |
      fix-and-reverify: duplicate 統合ロジックを修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      表面的に類似していても failure condition または scope が異なる finding の取扱いを確認する。
    pass_criteria: |
      誤同一化が0件であること。
    on_failure: |
      fix-and-reverify: 識別ロジックを修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      finding ごとに撤回・限定・修正・candidate consensus・完了・未解決等の状態遷移が独立して追跡可能か確認する。
    pass_criteria: |
      全状態遷移が finding 単位で追跡可能であること。新規永続 schema が導入されていないこと。
    on_failure: |
      fix-and-reverify: 状態管理設計を修正して再検証する。
  - id: TS-005
    target_item: AG-003
    verification: |
      同内容の言い換え反復を semantic progress として扱わないことを確認する。
    pass_criteria: |
      言い換え反復が進展として判定されないこと。
    on_failure: |
      fix-and-reverify: 収束判定ロジックを修正して再検証する。
  - id: TS-006
    target_item: AG-003
    verification: |
      新 evidence・scope 変更・premise 変更・falsification condition 変更等を semantic progress として認識できるか確認する。
    pass_criteria: |
      これらの意味状態変化が進展として認識されること。
    on_failure: |
      fix-and-reverify: 収束判定ロジックを修正して再検証する。
  - id: TS-007
    target_item: AG-003
    verification: |
      stagnation 検出時、直ちにユーザー質問へ遷移せず duplicate 統合・非本質論点終了・追加 evidence 探索・scope 限定等の自律解決を試みることを確認する。
    pass_criteria: |
      stagnation 検出時に自律解決手段を試行し、直ちにユーザー質問へ遷移しないこと。
    on_failure: |
      fix-and-reverify: stagnation 対応ロジックを修正して再検証する。
  - id: TS-008
    target_item: AG-004
    verification: |
      REQ-015 caller 7 command（req-define、case-open、case-run、inspect-promote、intake-promote、learning-promote、backlog-review）でユーザー明示指定なく adversarial-review が原則実行されることを各 command SPEC/定義で確認する。
    pass_criteria: |
      7 command 全てで default-on が規定され、ユーザー明示指定が通常発動の必須条件でないこと。
    on_failure: |
      fix-and-reverify: default-on 未規定の command SPEC/定義を修正して再検証する。
  - id: TS-009
    target_item: AG-004
    verification: |
      各経路の明示された skip 条件該当時に adversarial-review が省略され従来フローが継続することを確認する。skip 条件が当該経路の正規所有者で定義されているか確認する。
    pass_criteria: |
      7 command 全てで skip 条件が正規所有者により明示的かつ判定可能に定義され、該当時に省略可能であること。
    on_failure: |
      fix-and-reverify: skip 条件未定義の command SPEC を修正して再検証する。
  - id: TS-010
    target_item: AG-004
    verification: |
      skip 対象でユーザー明示指定時に adversarial-review が実行されることを確認する。
    pass_criteria: |
      明示指定時は必ず実行されること。
    on_failure: |
      fix-and-reverify: skip 対象の明示指定扱いを修正して再検証する。
  - id: TS-011
    target_item: AG-005
    verification: |
      req-define で adversarial-review が本質的未決事項を検出した場合、未解決のまま case-auto へ引き渡さず壁打ちまたは既存 auto_gate 解決経路へ戻ることを確認する。
    pass_criteria: |
      未決事項残存時は case-auto 不移送、壁打ち/auto_gate へ戻ること。
    on_failure: |
      fix-and-reverify: req-define の auto_gate 扱いを修正して再検証する。
  - id: TS-012
    target_item: AG-006
    verification: |
      case-auto 配下の caller command が自身で解決可能な finding を raw finding として case-auto へ転送せず自身で採否・反映できることを確認する。
    pass_criteria: |
      自身で解決可能な finding の raw finding 転送が0件であること。
    on_failure: |
      fix-and-reverify: caller command の finding 扱いを修正して再検証する。
  - id: TS-013
    target_item: AG-007
    verification: |
      下位 command から未決 decision を受領した case-auto が現行正規成果物から一意回答可能な場合、ユーザー停止せず回答して resume することを確認する。
    pass_criteria: |
      一意回答可能時はユーザー停止せず自走解決して resume すること。
    on_failure: |
      fix-and-reverify: case-auto の decision resolution ロジックを修正して再検証する。
  - id: TS-014
    target_item: AG-007
    verification: |
      可逆的内部詳細で既存契約内の裁量に収まる場合、case-auto が作業仮定と根拠を明示した上で自走継続できることを確認する。
    pass_criteria: |
      作業仮定と根拠を明示して自走継続できること。
    on_failure: |
      fix-and-reverify: case-auto の裁量判定を修正して再検証する。
  - id: TS-015
    target_item: AG-007
    verification: |
      上位 REQ/ADR/SPEC/Issue 等の矛盾が finding の場合、case-auto が当該矛盾した情報を根拠に一方を勝手に採用しないことを確認する。
    pass_criteria: |
      矛盾根拠の自動採用が0件であること。
    on_failure: |
      fix-and-reverify: 矛盾扱いロジックを修正して再検証する。
  - id: TS-016
    target_item: AG-007
    verification: |
      新規ユーザー価値判断・対象範囲変更・外部契約変更等が必要な場合、case-auto が自動決定せず既存停止経路でユーザーへ返すことを確認する。
    pass_criteria: |
      自動決定せず既存停止経路でユーザーへ返すこと。
    on_failure: |
      fix-and-reverify: エスカレーション判定を修正して再検証する。
  - id: TS-017
    target_item: AG-007
    verification: |
      case-auto が decision 解決またはユーザー判断を受けた後、記録済み resume point から再開できることを確認する。
    pass_criteria: |
      記録済み resume point から再開されること。
    on_failure: |
      fix-and-reverify: resume 機構を修正して再検証する。
  - id: TS-018
    target_item: AG-009
    verification: |
      adversarial-review 利用不能時の取扱いを確認する（silent skip 禁止、利用不能報告、従来フローと既存 QG/HITL 維持）。REQ-014-010 と整合すること。
    pass_criteria: |
      silent skip が0件、利用不能報告後に従来フロー維持されること。
    on_failure: |
      fix-and-reverify: fallback 機構を修正して再検証する。
  - id: TS-019
    target_item: AG-009
    verification: |
      新しい正規 review artifact または永続 finding schema が生成されないことを確認する。
    pass_criteria: |
      新規永続 artifact/schema が0件であること。
    on_failure: |
      fix-and-reverify: 永続化対象を削除して再検証する。
  - id: TS-020
    target_item: AG-009
    verification: |
      default-on 導入後も adversarial-review が QG-1〜QG-4 / 既存 HITL の代替または新しい恒久承認ゲートになっていないことを確認する。REQ-014-002 と整合すること。
    pass_criteria: |
      QG/HITL 代替0件、新規承認ゲート0件であること。
    on_failure: |
      fix-and-reverify: adversarial-review の位置づけを修正して再検証する。
  - id: TS-021
    target_item: AG-006
    verification: |
      case-auto 固有の finding 採否ロジックが各 caller command へ重複実装されていないことを確認する。
    pass_criteria: |
      重複実装が0件であること。
    on_failure: |
      fix-and-reverify: 重複実装を排除して再検証する。
  - id: TS-022
    target_item: AG-006
    verification: |
      通常単体実行と case-auto 配下実行で各 caller command の review 対象・finding 解釈・採否・反映責務が変化しないことを確認する。
    pass_criteria: |
      実行モード間での差異が0件であること。
    on_failure: |
      fix-and-reverify: 実行モード間差異を排除して再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0014
    source_item: AC-01
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 独立 stream 隔離検証は TS-001 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0014
    source_item: AC-02
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: duplicate 統合検証は TS-002 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0014
    source_item: AC-03
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: non-duplicate 識別検証は TS-003 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0014
    source_item: AC-04
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: finding 状態遷移追跡検証は TS-004 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0014
    source_item: AC-05
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 言い換え反復非進展検証は TS-005 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0014
    source_item: AC-06
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: semantic progress 認識検証は TS-006 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0014
    source_item: AC-07
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: stagnation 自律解決検証は TS-007 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0014
    source_item: AC-08
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: default-on 発動検証は TS-008 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0014
    source_item: AC-09
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: skip 条件検証は TS-009 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0014
    source_item: AC-10
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: skip 対象でも明示指定時は実行検証は TS-010 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0014
    source_item: AC-11
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: req-define 未決事項戻し検証は TS-011 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0014
    source_item: AC-12
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: caller command 自身での finding 解決検証は TS-012 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0014
    source_item: AC-13
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: case-auto 自走解決検証は TS-013 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0014
    source_item: AC-14
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 可逆的内部詳細自走検証は TS-014 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0014
    source_item: AC-15
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 上位合意矛盾時の非自動解決検証は TS-015 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0014
    source_item: AC-16
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 新規ユーザー判断時停止検証は TS-016 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-017
    source_ru: RU-0014
    source_item: AC-17
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: resume 検証は TS-017 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-018
    source_ru: RU-0014
    source_item: AC-18
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: review 利用不能時 fallback 検証は TS-018 へ映射。
    evidence: {path: docs/requirements/REQ-014.md, section: REQ-014-010, checked_at_commit: null}
    related_removed_items: []
  - id: RD-019
    source_ru: RU-0014
    source_item: AC-19
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 新規永続 artifact 非生成検証は TS-019 へ映射。
    evidence: {path: docs/requirements/REQ-014.md, section: REQ-014-005, checked_at_commit: null}
    related_removed_items: []
  - id: RD-020
    source_ru: RU-0014
    source_item: AC-20
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: QG/HITL 非代替検証は TS-020 へ映射。
    evidence: {path: docs/requirements/REQ-014.md, section: REQ-014-002, checked_at_commit: null}
    related_removed_items: []
  - id: RD-021
    source_ru: RU-0014
    source_item: AC-21
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: caller command 重複実装禁止検証は TS-021 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []
  - id: RD-022
    source_ru: RU-0014
    source_item: AC-22
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 通常実行と case-auto 配下の互換性検証は TS-022 へ映射。
    evidence: {path: null, section: null, checked_at_commit: null}
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    4 operation_units（REQ-003 APPEND、REQ-014 UPDATE/APPEND、REQ-015 UPDATE、REQ-006 APPEND + ADR-008 create）と11 SPEC追記、配布 SKILL 更新を含む。技術的依存（depends_on）は明示しないが、default-on 強化（REQ-003/014/015）は同時実施が自然。case-auto decision resolution（REQ-006 + ADR-008 + case-auto SPEC/delegation/workflow SPEC）は独立実施可能。各 caller command SPEC の skip 条件定義は REQ-015 UPDATE 後が自然。
  wave_hints:
    - Wave 1 候補: REQ-003/014/015 の default-on 強化 + adversarial-review SPEC（独立 stream、finding lifecycle、semantic stagnation、発動契約）
    - Wave 2 候補: REQ-006 + ADR-008 + case-auto SPEC/delegation/workflow SPEC（bounded parent decision resolution）
    - Wave 3 候補: 各 caller command SPEC の skip 条件定義（REQ-015 UPDATE 完了後）
```

# summary

RU-0014（adversarial-review 強化・原則適用・case-auto 自走統合）の要件ドラフト。adversarial-review の審議メカニズム強化（独立 stream、finding lifecycle、semantic stagnation control）、発動方針の default-on + skip policy 化、case-auto と両立する bounded parent decision resolution を導入する。work_type は feature、scale は large。REQ-003（UPDATE + APPEND 3件）、REQ-014（UPDATE + APPEND 2件）、REQ-015（UPDATE 2件）、REQ-006（APPEND 3件）、ADR-008（新規1件）、adversarial-review SPEC、case-auto SPEC、delegation-contracts SPEC、workflow-contracts SPEC、req-define/case-open/case-run/inspect-promote/intake-promote/learning-promote/backlog-review 各 command SPEC の UPDATE を含む。検証は22項目の test_strategy（TS-001〜022）で構成。Oracle bg_07a3f322 による ADR 要否確認済み（case-auto decision resolution のみ ADR-008 必須、default-on と独立 stream は REQ/SPEC 更新で対応）。
