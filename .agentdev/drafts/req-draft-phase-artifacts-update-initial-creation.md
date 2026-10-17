---
draft_type: req_draft
topic_slug: phase-artifacts-update-initial-creation
status: draft
agentdev_handoff: true
created_at: "2026-10-17T14:15:00+09:00"
source_rus:
  - RU-0229
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  工程駆動経路の phase-artifacts-update に、正規成果物が存在しない新規プロジェクトでの
  REQ・Decision・Design の初回作成と、外部戻り入力を伴わない利用者の直接採用の受理を追加する。
  反映先は現在の正規成果物との照合で決定し（既存あれば増分更新、なければ新規作成、一意解決不能は保留）、
  成果物固有の作成・更新は既存の管理スキルへ委譲して既存規則（採番・配置・照合・形式・関連参照・
  インデックス・状態管理）を適用する。Decision は既存初期状態、Design は draft で作成し確定権限は
  既存経路のまま、初回作成にも部分反映・失敗報告・再投入の既存規律を適用する。
  新しい公開コマンドや管理機構は追加しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      正規成果物ゼロからの初回作成。新規プロジェクトで正規成果物が存在せず、取組・対象版・現在工程が
      一意に解決でき、利用者が採用内容の反映を指示しているとき、工程駆動の phase-artifacts-update を
      実行することで、採用された要件が適切な REQ として新規作成・保存される。既存成果物の不存在を理由に
      停止せず、変更駆動経路（req-define → case-auto）への切替を要求して初回作成できないことがない。
      正規配置に成果物が存在し、その内容が採用事項と一致し、別セッションから参照できる。
  - id: AG-002
    content: >
      外部戻り入力と直接採用の双方への対応。外部AIからの戻り入力について利用者が明示的に採用した内容を
      反映する経路と、外部戻り入力を伴わず利用者が直接提示し明示的に採用・反映を指示した内容を反映する
      経路の両方で、採用根拠（利用者の明示判断または有効な正規決定）を確認したうえで適切な正規成果物へ
      反映できる。直接採用の場合に架空の外部受領記録を作らず、外部戻り入力の場合は既存の受領・採否記録
      規則（線形走査・fail-closed・採用件数に比例する証跡量）が維持される。採用根拠がない内容や
      外部AIの自己申告だけを根拠とする内容を確定しない。
  - id: AG-003
    content: >
      既存成果物の増分更新と重複防止。対応する既存の REQ・Decision・Design が存在する状態で新たな採用内容を
      反映するとき、既存成果物との照合により適切な操作（増分更新・新規作成・保留）が選択され、既存の合意内容と
      状態を保持しながら必要な変更が反映される。既存成果物に対応する内容を不必要に別成果物として重複作成せず、
      先行合意に矛盾する内容を無断で上書きせず、既存成果物が不当に消失しない。指定されたファイルの不在だけを
      根拠に新規作成を決定せず、既存の正規成果物との内容上の対応を確認する。
  - id: AG-004
    content: >
      対象解決・採用根拠と部分反映の安全性。対象の取組・版・工程が一意に解決できない場合、採用根拠が不足する
      場合、および独立して反映可能な内容と保留すべき内容が混在する場合について、解決不能な対象へ正規成果物を
      書き込まず候補と不足を報告する、採用根拠のない部分を確定しない、安全に独立反映できる採用済み部分は
      反映する、衝突・未確認・保存失敗を区別して報告する。
  - id: AG-005
    content: >
      成果物固有の保存規則と状態管理。REQ・Decision・Design それぞれの新規作成を、当該成果物を必要とする
      採用内容で検証し、既存の管理スキル（agentdev-req-file-manager / agentdev-decision-file-manager /
      agentdev-design-file-manager）が定める採番、配置、文書形式、関連参照、インデックス更新、状態管理の
      適用結果を確認する。成果物の種類ごとに必要性を判断し、初回作成を理由として一律に作成しない。
      Decision は既存規則に従った初期状態、Design は draft で作成され、正式な昇格手続きを経ずに accepted へ
      変更されない。ファイルが作成されても、必要な関連更新や整合性確認が成立していない場合は当該作成を
      完了と判定しない。
  - id: AG-006
    content: >
      中断・失敗・再実行。初回作成の完了後に同一入力を再投入する場合、および複数の保存対象がある処理の途中で
      書込みに失敗し再実行する場合、実際の保存状態を再取得し、確定済み内容を重複作成せず、未反映部分だけを
      継続できる。既に反映された採用内容が消失せず、未反映部分と保存失敗の内容が区別される。途中失敗した処理を
      全体完了と報告せず、再投入で重複成果物を生成せず、採用済み内容を消失させない。
  - id: AG-007
    content: >
      正規利用経路での初回作成・再取得。GitHub版・Local版それぞれの正規利用経路において、正規成果物が存在しない
      新規プロジェクトから、(1) 工程駆動で取組・対象版・現在工程を特定し、(2) 利用者が採用した内容を
      phase-artifacts-update で初回作成し、(3) 正規成果物と必要な関連情報が実際に保存されていることを確認し、
      (4) 別セッションから保存済み成果物とその正しい状態を再取得し、(5) 後続の工程駆動操作から当該成果物を
      現在の正規情報として参照できる。公開コマンドの実行から成果物保存・再取得までの経路が成立すること
      （手順記述・構造検査・個別スキルの検査だけでの代替を認めない）。
  - id: AG-008
    content: >
      完遂判定。受け入れ条件1〜7（AG-001〜AG-007）のすべてについて、要求された成立条件と評価範囲に対応する
      検証証拠が確認できた場合に完遂とする。各受け入れ条件について pass / fail / blocked / not applicable を
      区別して報告し、未検証・fail・blocked が残る場合は全体の完遂を宣言しない。既存の検証手段を再利用するが、
      検証方法の都合で実利用経路の証明範囲を縮小せず、新しい品質管理機構や恒久台帳の追加を要求しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: 要件
    source_items: [AG-001, AG-003]
    content: |
      | REQ-110-008 | 採用済みの内容は、既存の有効な正規成果物へは意味のある増分として、存在しない場合は新規作成として反映し（反映先の解決は REQ-110-017、初回作成の成立条件は REQ-110-016）、変更駆動経路で確定した正規成果物と有効な合意を工程駆動経路でも参照して利用できること。先行する合意と矛盾しない範囲を保持し、矛盾する部分は根拠とともに保留できること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    target_area: 要件
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      | REQ-110-016 | 正規成果物が存在しない新規プロジェクトにおいて、操作対象の取組・対象版・現在工程が一意に解決でき、利用者が採用内容の反映を指示している場合、工程駆動の公開反映操作で REQ・Decision・Design を新規作成・保存できること。既存正規成果物の不存在を理由に反映を停止し、または変更駆動経路への切替を要求しないこと |
      | REQ-110-017 | 採用済みの内容の反映先は、現在の正規成果物との照合により決定すること。適切な既存成果物が存在する場合は既存の規律に従って増分更新し、存在しない場合は新規作成し、一意に解決できない場合は当該部分の反映を保留して候補と不足を報告すること。指定されたファイルの不在だけを根拠に新規作成を決定しないこと |
      | REQ-110-018 | 利用者が直接提示し明示的に採用・反映を指示した内容を、外部検討の戻り入力と同じ規律（採用根拠の限定、受理の線形走査、fail-closed、採用件数に比例する証跡量）で受理・反映できること。外部戻り入力が存在しない場合にその受領を必須条件とせず、架空の受領記録を作らないこと |
      | REQ-110-019 | REQ・Decision・Design の作成・更新処理は既存の成果物管理スキルへ委譲し、採番、配置、既存成果物との照合、文書形式、関連参照、インデックス更新、状態管理の既存規則を適用すること。成果物の種類ごとに必要性を判断し、初回作成を理由として REQ・Decision・Design を一律に作成しないこと |
      | REQ-110-020 | Decision の新規作成時の初期状態と Design の新規作成時の draft という既存の状態規則を維持すること。正式な昇格手続きを経ずに accepted へ変更せず、ファイル作成後も必要な関連更新と整合性確認が成立していない場合は当該作成を完了と判定しないこと |
      | REQ-110-021 | 初回作成にも既存の部分反映・失敗時報告・再投入の規律を適用すること。保存結果を実際の正規成果物から再構成し、同一入力の再実行で重複作成や採用済み内容の消失を生じないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: 受け入れ条件対応
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006, AG-008]
    content: |
      | TS-008 | REQ-110-008、REQ-110-016、REQ-110-017、REQ-110-018、REQ-110-019、REQ-110-020、REQ-110-021 | 採用済み内容の増分反映・初回作成・直接採用・保存規則・再実行の検証。検証義務は phase-artifacts-update の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-artifacts-update.yaml の verification 宣言が所有する |
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-110.md
    target_area: 適用範囲
    source_items: [AG-001, AG-002, AG-003]
    content: |
      - **対象**: 取組・対象版・現在工程の特定と再開、上流不存在時の参考テーマ形成、テーマ正本の独立更新と未決事項の引継ぎ、外部検討の持出し確認と戻り受理・採用、正規成果物への反映（既存成果物への増分更新、正規成果物の初回作成、利用者の直接採用）と部分反映、工程全体像の再構成、帰納的候補調整、外部AI戻り入力の非機能受け入れ条件
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: 工程駆動の公開操作
    source_items: [AG-001, AG-002]
    content: |
      - `phase-artifacts-update` は採用済みの内容を正規成果物へ増分反映し、正規成果物が存在しない場合は初回作成する。外部検討の戻り入力と利用者が直接採用した内容の双方を受理し、独立反映可能な項目と衝突・未確認・保存失敗を区別する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: 正規成果物への形成と全体像
    source_items: [AG-001, AG-002, AG-003]
    content: |
      採用済みの内容は、現在の正規成果物との照合により、既存の有効な正規成果物への意味のある増分または正規成果物の新規作成として反映する。入力は外部検討の戻り入力のうち採用された内容と、利用者が直接提示し明示的に採用・反映を指示した内容の双方であり、採用根拠の規律は既存のとおり利用者の明示判断または有効な正規決定に限定する。外部戻り入力が存在しない場合、その受領を必須条件とせず、架空の受領記録も作らない。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    target_area: 実行主体と責務境界
    source_items: [AG-005, AG-006]
    content: |
      工程駆動ルートでは、phase-artifacts-update が採用済み内容の保存（既存成果物への増分更新と正規成果物の初回作成）を統括し、REQ・Decision・Design の作成・更新処理は各成果物の既存管理スキル（agentdev-req-file-manager、agentdev-decision-file-manager、agentdev-design-file-manager）へ委譲する。採番、配置、既存成果物との照合、文書形式、関連参照、インデックス更新、状態管理は各管理スキルの既存規則に従い、成果物の種類ごとに必要性を判断して初回作成を理由に一律に作成しない。初回作成にも部分反映・失敗時報告・再投入の既存規律を適用する。これに対し確定（Design の draft から accepted への昇格、Decision の状態遷移）の権限と経路は変更駆動・工程駆動のいずれでも既存のまま変更しない。前段の保存・確定経路の所有境界は変更駆動側の記述であり、工程駆動側の保存実行はこの境界を再定義しない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/foundations/system.md
    target_design:
      operation: update
      domain: foundations
      slug: system
    target_area: 一覧表
    source_items: [AG-007]
    content: |
      | `/agentdev/phase-artifacts-update` | 自然言語による反映指示と採用内容（外部検討の戻り入力または利用者が直接採用した内容） | 反映の結果（反映・作成した項目と反映先、衝突・未確認・保存失敗の区別、受領記録の保存先） | phase（工程駆動） |
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_design:
      operation: update
      domain: workflows
      slug: v51-phase-driven-collaboration-model
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      <!-- ADF-COVERS(design): REQ-110-001, REQ-110-002, REQ-110-003, REQ-110-004, REQ-110-005, REQ-110-006, REQ-110-007, REQ-110-008, REQ-110-009, REQ-110-010, REQ-110-011, REQ-110-012, REQ-110-013, REQ-110-014, REQ-110-015, REQ-110-016, REQ-110-017, REQ-110-018, REQ-110-019, REQ-110-020, REQ-110-021, REQ-104-008 -->

conflict_resolutions:
  - id: CR-001
    conflict: REQ-110-008 の「既存の有効な正規成果物へ意味のある増分更新として反映」という文言が正規成果物不存在時に充足不能と読まれ、初回作成と緊張関係にある。
    resolution: >
      REQ-110-008 を「既存の有効な正規成果物へは意味のある増分として、存在しない場合は新規作成として反映し
      （反映先の解決は REQ-110-017、初回作成の成立条件は REQ-110-016）」へ更新し、増分更新と初回作成の
      二形態を行内で分離する。初回作成の成立条件・反映先解決・直接採用・保存規則・再実行は新規行
      REQ-110-016〜021 で定める。RU-0229 の合意（主対象 REQ-110-008、必要箇所に限定した改訂）に従う。
      adversarial-review F-03（REQ 行の単独読解性）を反映し、行内で REQ-110-016/017 への参照を明示した。
  - id: CR-002
    conflict: v51 Design「実行主体と責務境界」節の「保存・確定経路の所有境界は変更駆動では case-ready / case-revise が所有する」と工程駆動経路からの保存実行の追加の関係。
    resolution: >
      同節の既存文は変更駆動側の記述である。工程駆動側の保存実行（管理スキル委譲による初回作成を含む）と
      確定（昇格）権限の不変を同節へ追記して明確化する（ACT-DESIGN-003）。adversarial-review F-04 を反映し、
      追記文言に「前段の保存・確定経路の所有境界は変更駆動側の記述であり、工程駆動側の保存実行はこの境界を
      再定義しない」を含める。v4-standard-lifecycle の工程駆動対応行（工程駆動の正規成果物保存・確定）が
      既に当該接続を認識しており、境界の再定義ではない（architecture-advisory の助言を採用）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0229
    target_req: REQ-110
    target_design: docs/designs/workflows/v51-phase-driven-collaboration-model.md
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
      正規成果物が存在しない新規プロジェクト環境（GitHub版は未初期化の別リポジトリ/worktree、Local版は別の一時ディレクトリ）を用意し、phase-tasks-create 等で取組・対象版・現在工程を特定した後、採用内容の反映を指示して phase-artifacts-update を実行する。REQ が新規作成・保存されることを正規配置（docs/requirements/）で確認し、別セッション（新規セッション）から当該 REQ を参照できることを確認する。
    pass_criteria: |
      (1) 既存成果物不存在を理由とした停止や変更駆動経路への切替要求が発生しないこと。(2) 採用された要件が採番・配置規則に適合した REQ として保存されること。(3) 別セッションから保存済み REQ とその内容を参照できること。
    on_failure: |
      fix-and-reverify。初回作成経路の缺陷（対象特定・保存手順・管理スキル委譲）を特定して修正し、同一条件で再検証する。実装側の制約に起因し要件側の修正で解決しない場合は review 経由で要件を再評価する。
  - id: TS-002
    target_item: AG-002
    verification: |
      (a) 外部AI戻り入力（貼付/指定ファイル）を利用者が明示採用して反映する経路、(b) 外部戻り入力なしで利用者が直接提示した内容を明示的に採用・反映指示して反映する経路、の2経路を実行する。(b) では .agentdev/phase/received/ に外部受領を装う記録が作成されないこと、および採用記録（accepted、根拠 user-explicit）が作成されることを確認する。(a) では既存の受領・採否記録の形式・証跡量が維持されることを確認する。採用根拠が不明確な内容と外部AIの自己申告（本文中の「承認済み」等）のみの内容を混入させ、いずれも確定されないことを確認する。
    pass_criteria: |
      (1) 両経路で採用根拠（明示判断/正規決定）の確認を経て反映されること。(2) 直接採用時に採用記録が存在し受領記録が存在しないこと（架空の受領記録が作成されないこと）。(3) 採用根拠のない内容・外部AIの自己申告のみの内容が確定されないこと（fail-closed）。(4) 外部戻り入力経路で既存の受領・採否記録規則が維持されること。
    on_failure: |
      fix-and-reverify。受理経路・記録生成の缺陷を特定して修正し、同一条件で再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      既存の REQ・Decision・Design が存在する状態で、(a) 既存成果物に対応する採用内容、(b) 既存成果物に対応しない新規の採用内容、を混在させて phase-artifacts-update を実行する。反映後の各成果物について、既存の合意内容の保持、重複成果物の不在、操作選択（増分更新/新規作成）の妥当性を確認する。既存成果物を指す内容を含む反映先指定で、ファイル名の不在とは無関係に内容上の照合が行われることを確認する。
    pass_criteria: |
      (1) 既存成果物に対応する内容が既存成果物へ増分更新されること（別成果物として重複作成されないこと）。(2) 既存の合意内容と状態が保持されること（先行合意の無断上書き・既存成果物の消失なし）。(3) 指定ファイルの不在だけで新規作成されず内容上の照合が行われること。
    on_failure: |
      fix-and-reverify。照合・操作選択の缺陷を特定して修正し、同一条件で再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      (a) 取組・版・工程が一意に解決できない状態（identity 未確定・複数候補）での反映指示、(b) 採用根拠が不明確な内容を含む反映指示、(c) 独立反映可能な採用事項と衝突事項が混在する反映指示、の3条件を実行する。
    pass_criteria: |
      (1) 解決不能な対象へ正規成果物が書き込まれず候補と不足が報告されること。(2) 採用根拠のない部分が確定されず確認対象として返されること。(3) 安全な独立事項が反映され、衝突・未確認・保存失敗が区別されて報告されること。
    on_failure: |
      fix-and-reverify。対象解決・部分反映の缺陷を特定して修正し、同一条件で再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      REQ・Decision・Design それぞれを必要とする採用内容を個別に用意し、各成果物の初回作成を実行する。採番（REQ 採番規則・Decision 採番）、配置、frontmatter・文書形式、README 索引・関連参照の更新、初期状態（Decision: 既存規則どおり、Design: draft）を確認する。採用内容が Design のみを必要とする場合に REQ・Decision が作成されないことを確認する。関連更新（README 索引等）を意図的に未実施にした状態で作成完了と報告されないことを確認する。
    pass_criteria: |
      (1) 各成果物の管理スキルが定める規則の適用結果が確認できること。(2) Decision が既存規則の初期状態、Design が draft で作成され、昇格手続きを経ずに accepted とならないこと。(3) 必要のない種類の成果物が一律作成されないこと。(4) 関連更新・整合性確認が成立しないまま作成完了と判定されないこと。
    on_failure: |
      fix-and-reverify。管理スキル委譲・規則適用の缺陷を特定して修正し、同一条件で再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      (a) 初回作成完了後に同一入力を再投入する。(b) 複数保存対象の処理途中で書込みを失敗させる（保存先を読取専用化等で人為的に失敗させ、失敗を確認したら解除）して再実行する。の2条件を実行する。
    pass_criteria: |
      (1) 再投入で確定済み内容の重複作成が発生しないこと。(2) 途中失敗後の再実行で実際の保存状態から未反映分だけ継続すること。(3) 反映済み採用内容が消失しないこと。(4) 未反映部分と保存失敗が区別して報告されること。(5) 途中失敗した処理が全体完了として報告されないこと。
    on_failure: |
      fix-and-reverify。再構成・冪等化の缺陷を特定して修正し、同一条件で再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      GitHub版・Local版それぞれの正規利用経路で、正規成果物ゼロの新規プロジェクトを起点に (1) 工程駆動での対象特定 → (2) phase-artifacts-update での初回作成 → (3) 保存確認 → (4) 別セッションでの再取得 → (5) 後続の工程駆動操作からの参照、までの一連経路を実際に実行する。Local版ではローカル記録と実 Git 取り込み結果を突合する（REQ-111-011）。
    pass_criteria: |
      (1) 両版で公開コマンドの実行から成果物保存・再取得までの経路が成立すること。(2) 手順記述・構造検査・個別スキルの検査だけでは合格としないこと（実経路の実行証拠を確認すること）。(3) 検証方法の都合で実利用経路の証明範囲を縮小しないこと。
    on_failure: |
      fix-and-reverify。実行環境の制約で片版のみ実施可能な場合は blocked として報告し、縮小合格しない。
  - id: TS-008
    target_item: AG-008
    verification: |
      TS-001〜TS-007 の実行結果を集約し、RU-0229 の受け入れ条件1〜7（AG-001〜AG-007）それぞれについて pass / fail / blocked / not applicable を判定する。判定には各 TS の実行証拠（実行記録・保存済み成果物・報告）を対応付ける。
    pass_criteria: |
      (1) 全条件が pass または根拠付き not applicable であること。(2) fail・blocked・未検証が残る場合に全体完遂を宣言しないこと。(3) 各判定に対応する証拠が識別できること。
    on_failure: |
      record-in-findings。完遂判定は検証の集約規則であり、fail/blocked 残存時は全体完遂を宣言せず findings に記録して処置（修正再検証または要件再評価）へ回す。

realization_actions:
  - id: RA-001
    concern: 公開入口の入出力・不変条件へ初回作成と直接採用を反映
    responsibility: src/common/commands/agentdev/phase-artifacts-update.md の description、リード文、入力、出力、不変条件を、初回作成（既存成果物不存在時の新規作成）と直接採用（外部戻りを伴わない採用指示）を含む契約へ拡張する。出力の「受領記録の保存先」は外部戻り入力存在時に限って報告し、直接採用時は採否記録（accepted、根拠 user-explicit）の保存先を報告して受領記録の保存先を報告しない（架空の受領記録を作らない）。
    ownership_hints:
      - "src/common/commands/agentdev/phase-artifacts-update.md"
    intent: 利用者が工程駆動経路だけで初回作成・直接採用を完結できる公開契約を提示し、直接採用時の出力報告が外部受領を偽装しないようにする。
    verification_refs: [TS-001, TS-002, TS-007]
    source_items: [AG-001, AG-002, AG-007]
  - id: RA-002
    concern: 反映 workflow の制御構造へ初回作成・直接採用・管理スキル委譲を組込む
    responsibility: src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md の description、入力、出力、副作用、工程一覧（対象の特定、入力の受理、採用根拠の受領、反映先の照合、増分反映/新規作成の実行、部分反映と報告、記録の保存）、Capability Skill 連携（agentdev-req-file-manager / agentdev-decision-file-manager / agentdev-design-file-manager への委譲）を拡張する。工程一覧の最終工程「受領記録の保存」は外部戻り入力存在時に実行し、直接採用時は採否記録（accepted、根拠 user-explicit）のみを記録して受領記録を作らない。対話操作完結型・resume なしの既存構造と、テーマ正本更新を含めない既存の共通制約は維持する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md"
      - "Capability Skills: src/common/skills/agentdev-req-file-manager/, src/common/skills/agentdev-decision-file-manager/, src/common/skills/agentdev-design-file-manager/"
      - "戻り入力受理・採否記録の決定的処理: src/common/skills/agentdev-phase-theme-collaboration/"
    intent: 既存の増分反映・部分反映規律を初回作成にも適用し、成果物固有処理を管理スキルへ委譲する実行構造を確立する。直接採用時に採用記録と受領記録を区別する。
    verification_refs: [TS-001, TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-001, AG-003, AG-004, AG-005, AG-006]
  - id: RA-003
    concern: 新規要件行の traceability 対応宣言の追加
    responsibility: traceability/agentdev-workflow-phase-artifacts-update.yaml の implementation/verification 宣言へ REQ-110-016〜REQ-110-021 を追加する。あわせて v51 Design の ADF-COVERS(design) 宣言へ REQ-110-016〜021 を追加する（ACT-DESIGN-005 が Design 保存操作として実行）。
    ownership_hints:
      - "traceability/agentdev-workflow-phase-artifacts-update.yaml"
    intent: 新規要件行と workflow skill/command の対応関係、および design カバー関係を正規宣言へ反映する。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-004
    concern: 周辺案内・参照ドキュメントの追随更新
    responsibility: src/common/commands/agentdev/README.md のコマンド一覧行、docs/guides/glossary.md の phase-artifacts-update 用語記述、docs/guides/command-selection.md の選択基準行を、初回作成・直接採用を含む記述へ更新する。
    ownership_hints:
      - "src/common/commands/agentdev/README.md"
      - "docs/guides/glossary.md"
      - "docs/guides/command-selection.md"
    intent: 公開入口の案内・参照記述が拡張後の振る舞いと乖離しないようにする。
    verification_refs: [TS-007]
    source_items: [AG-007]

review_dispositions:
  - id: RD-001
    source_ru: RU-0229
    source_item: RU-0229
    disposition: covered
    reason_code: fully_covered
    reason: |
      RU-0229 の受け入れ条件1〜8（目的・対象・要件化の方向を含む）が本 draft の AG-001〜AG-008、
      artifact_actions（REQ-110-008 UPDATE、REQ-110-016〜021 APPEND、v51 Design 3操作 + ADF-COVERS 宣言、
      system.md 1操作）、test_strategy TS-001〜008、realization_actions RA-001〜004 としてすべて対応する。
      対象外（新公開コマンド追加、Design 昇格経路の整備等）は draft にも含めない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0229.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: 629e670c18bb3ac927c821dd8170fc096c9cd42dfed0ce04b2da2e7135e32711
    check_scope:
      heading: "## 要件"
      start_line: 12
      end_line: 31
    execution_conditions:
      operation: replace
      edit_sha256: bc1424b31dd8fb594c3c239128b5b9ca81487bbe69cbca0d373f4929fabf1002
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:11:40.985Z"
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: 629e670c18bb3ac927c821dd8170fc096c9cd42dfed0ce04b2da2e7135e32711
    check_scope:
      heading: "## 受け入れ条件対応"
      start_line: 32
      end_line: 46
    execution_conditions:
      operation: replace
      edit_sha256: a79c859872960d0419672acef58dae16ed20c4c3e1583bfad3bdb393a06eca1a
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:03:48.040Z"
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: 629e670c18bb3ac927c821dd8170fc096c9cd42dfed0ce04b2da2e7135e32711
    check_scope:
      heading: "## 適用範囲"
      start_line: 47
      end_line: 51
    execution_conditions:
      operation: replace
      edit_sha256: 9cc4a089bc4e33cfaff540fce6b461d5d9047b3c56dc19d933abae02f42b91ac
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:03:55.451Z"
  - target_file: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_content_sha256: 07eba7409a2d7a48e174c307ac7385f2dd146d87db53a9db0047487a7b21b5dd
    check_scope:
      heading: "## 工程駆動の公開操作"
      start_line: 23
      end_line: 29
    execution_conditions:
      operation: replace
      edit_sha256: cb7836269aab52b8ba5d05bc1cdaf423f72ca5c6f2eb9dfad691f40adbedb406
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:04:01.433Z"
  - target_file: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_content_sha256: 07eba7409a2d7a48e174c307ac7385f2dd146d87db53a9db0047487a7b21b5dd
    check_scope:
      heading: "## 正規成果物への形成と全体像"
      start_line: 56
      end_line: 61
    execution_conditions:
      operation: replace
      edit_sha256: 2b36201c8cf71e43608fc42c0e4f84ee67d8cb59dbe756f4e999c753d8b59e98
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:04:07.112Z"
  - target_file: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_content_sha256: 07eba7409a2d7a48e174c307ac7385f2dd146d87db53a9db0047487a7b21b5dd
    check_scope:
      heading: "## 実行主体と責務境界"
      start_line: 66
      end_line: 71
    execution_conditions:
      operation: append
      edit_sha256: bcecdeffd99ecc94d78ed0be19590fbdb648e6979757dab641af4bfb82e59b62
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 2, all_ok: true }
      post: { count: 2, all_ok: true }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-10-17T05:11:47.762Z"
  - target_file: docs/designs/foundations/system.md
    target_content_sha256: 1eb2c06f31046507c49fb039f40793872364f00009a75d3c6efe1c94e4b6aa96
    check_scope:
      heading: "### 一覧表"
      start_line: 119
      end_line: 146
    execution_conditions:
      operation: replace
      edit_sha256: e3785821fde5898c21a2b72725f02f489523e96cc8d4250d87629873e360371e
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: "target section only"
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-10-17T05:04:19.253Z"

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

RU-0229（工程駆動経路における正規成果物の初回作成と直接採用への対応）を要件化した。主操作は REQ-110-008 の UPDATE（増分更新と初回作成の二形態を行内分離、REQ-110-016/017 への参照明示）、従操作は REQ-110-016〜021 の6行 APPEND。Design 更新は v51 Design 3箇所と ADF-COVERS 宣言、system.md 一覧表1行。Decision は不要（禁止条件 (2)(3)(8) 該当、DEC-057/058 非置換、確定権限不変 — architecture-advisory 助言を採用）。adversarial-review 4件の accepted finding（受領記録の条件化、ADF-COVERS 追随、REQ-110-008 単独読解性、Design 追記文言条件）を反映済み。work_type: feature / scale: standard。
