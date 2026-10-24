---
draft_type: req_draft
topic_slug: important-change-prenotification-and-result-explanation
status: draft
created_at: "2026-10-24T16:26:00+09:00"
source_rus: [RU-0246]
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: standard / large（全 work_type で設定可）
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: >-
  RU-0246（session由来、2026-10-24 合意・利用者承認済み）に基づき、重要変更の識別・事前通知・実行中の追加通知・通知の集約・
  通知と承認の区別・完了報告への反映を、REQ-108 への要件行追加（11行）と req-define・case-ready・case-run・case-auto・
  backlog-auto・phase-artifacts-update（実配置は v51 横断 Design）の各 Design への責務節追記として構造化した。
  既存要件（REQ-096・REQ-106・REQ-111・REQ-114）は再定義せず整合維持とする。変更駆動・工程駆動の両正規利用経路と
  GitHub 版・Local 版での成立を検証要件（TS-001〜TS-011）として定義した。

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
    content: >-
      重要変更の識別、事前通知、実行中の追加通知、通知の集約、通知と承認の区別、完了報告への反映を、
      利用者が ADF の自律実行中に発生する重要な変化を理解できるようにするという一つの目的に属する共通の要求として、
      主対象 REQ-108「ADF v5 有限実行とワークフロー責務再編」へ統合して定める。既存要件（REQ-096「ADF判断アーキテクチャ」、
      REQ-106「ADF v5 差分・変更影響と増分更新」、REQ-111「ADF v5.1 工程遷移・独立レビューと変更駆動併存」、
      REQ-114「backlog-auto 一気通貫実行とパッチリリース実行契約」）を再定義せず、整合を維持する。
      変更の都度利用者の承認を求める運用は ADF の自律性を損なうため採用しない。通知と承認を区別し、
      通知のみを理由に自律実行を停止しない。人間に留保された新たな判断が必要な場合は既存の判断手順に従う。
      変更の重要性はファイル数・変更行数・工程の前後ではなく、その意味と影響から判断する。
      通知は意味のある変更単位にまとめ、重複を避ける。通知は利用者の閲覧確認や新たな承認を意味しない。
      変更内容を判断する既存ワークフローが重要性と想定影響を評価し、その通知が利用者まで届く。
      case-auto や backlog-auto に全変更の意味判断を集約せず、既存の合意内容との照合、差分・影響評価、
      必要な更新・再検証を通知によって代替しない（AC10）。
  - id: AG-002
    content: >-
      重要変更の識別と事前通知（AC1〜AC3）。重要な設計方針・既存前提の変更、外部仕様・互換性・データ・セキュリティへの重要な影響、
      進行中の別作業への重大な影響、当初想定からの重大な変更などを、変更の意味と影響に基づいて識別できること。
      代表的な重要変更と、誤字修正・単純な参照修正・意味を変えない機械的更新を含む検証事例で、重要変更の通知要否を区別できること。
      ファイル数や変更行数のみから重要性を決定しないこと。重要変更が識別された場合、利用者への通知に次の内容を含めること。
      変更する理由、何をどのように変更する予定か、想定される影響、確定している事項と未確認の事項（該当する場合）、
      現在工程と過去工程の関係（工程駆動で該当する場合）。通知は変更の意味を利用者が理解できる文章とし、
      変更ファイル一覧だけで代替しないこと。重要変更が正規成果物へ反映される前に、その変更についての通知が
      利用者向けの実行出力へ提示されること。実行時の記録から、通知の提示が対象変更の正規反映より先に成立したことを確認できること。
      通知をキューに登録しただけの状態や、変更確定後に初めてまとめて提示した状態を、事前通知の達成と扱わないこと。
      作業ブランチ上での検討・編集には、この通知の完了を前提条件として要求しないこと。
  - id: AG-003
    content: >-
      通知と承認の区別（AC4）。既存の合意と委任された裁量の範囲内の重要変更では、事前通知を行ったうえで、
      追加承認なしに自律実行を継続できること。利用者に留保された新たな判断が必要な場合は、通知しただけで承認済みと扱わず、
      既存の判断手順に従って該当部分の処理を保留すること。既存の承認権限や安全境界を弱めず、
      通知のみを理由とする新たな一律停止を設けないこと。
  - id: AG-004
    content: >-
      実行中に判明した重要変更の追加通知と通知の集約（AC5、AC6）。実行開始時点では識別されていなかった重要変更が実行中に判明した場合、
      判明した内容と影響を利用者へ追加通知すること。その時点で未反映の重要変更については正規反映前に通知すること。
      判明時点ですでに反映済みの内容がある場合は、反映済みである事実を区別して説明し、事後説明を事前通知として扱わないこと。
      同一の意味を持つ重要変更が複数の成果物・工程に波及する場合、利用者が理解する変更単位で通知をまとめること。
      同じ重要変更について、ファイルごと・工程ごと・委譲先ごとに実質的に同じ通知を繰り返さないこと。
      新たな重要な影響が判明した場合は、重複通知とは区別して追加説明できること。
  - id: AG-005
    content: >-
      完了報告との対応（AC7）。重要変更を伴う実行の完了報告から、実際に変更した重要事項、事前の見込みと実績の違い、
      残る影響、未完了事項を確認できること。事前通知したが実施しなかった変更については、実施済みと報告しないこと。
      変更が一部成功、一部失敗、未確認、または中断となった場合も、実際の成立状況を区別して報告すること。
  - id: AG-006
    content: >-
      変更駆動・工程駆動の正規利用経路への適用（AC8、AC9）。直接の req-define → case-auto、および
      backlog-auto → req-define → case-auto の正規利用経路で、重要変更の事前通知、必要な追加通知、最終結果の説明が成立すること。
      工程情報が存在しないプロジェクトでも、既存の要件・設計・実装への変更として説明できること。
      backlog-auto では子ワークフローの通知が親側の実行・結果報告によって失われず、利用者に提示されること。
      phase-artifacts-update の正規利用経路で、重要変更の事前通知と結果説明が成立すること。
      完了済み過去工程の成果物を重要な内容で改訂する場合は、現在工程との関係と想定される後続影響を通知に含めること。
      既存の差分・影響評価と、現在工程を巻き戻さない規則を維持すること。
  - id: AG-007
    content: >-
      実際の利用経路での検証と留意点、未確認事項（AC11）。各要件の成立を、対象となる公開入口から実行して検証すること。
      少なくとも以下を含む代表事例で、利用者向け出力、変更確定の時点、実際の成果物、完了報告を照合すること。
      重要な変更と軽微な変更の区別、追加承認を要しない重要変更の自律継続、利用者判断を要する変更の停止、
      自律実行中に新たに判明した重要変更、複数ファイルへの波及と重複通知の抑制、backlog-auto の一気通貫経路、
      工程駆動での完了済み過去工程の成果物改訂、中断・失敗・再開時の通知と結果報告。GitHub版とLocal版それぞれの正規利用経路を対象とし、
      該当環境・権限が不足して実行できない検証は合格ではなく未検証として扱うこと。
      検証上の留意点: 重要変更の識別には意味判断が含まれるが、変更ファイル数やキーワードだけを使った機械判定に置き換えない。
      一方、通知の出力有無、実行順序、重複、実際の変更との差分、既存の承認手順との接続など、機械的に検証できる事項は機械的に確認する。
      部品試験や手順本文の存在確認のみをもって、利用者向けの事前通知が成立したと判定しない。
      未確認事項（現行実装の検証事項）: 現行の並列・委譲実行で、重要変更を正規反映前に利用者へ表示する経路が成立するか。
      変更駆動による過去工程成果物の改訂が、進行中の工程駆動へ必要な範囲で伝播するか。
      これらは現行実装の検証事項であり、新たな利用者判断が必要と判明しない限り、独立した承認手続きを設ける理由としない。
  - id: AG-008
    content: >-
      対象外。通知のための新しい承認段階、通知専用の公開コマンド、恒久的な通知台帳、変更規模を点数化する制度、
      全ファイル差分の事前提示・利用者承認、工程の自動巻き戻し、全成果物の一律再生成、既存の変更影響分析の重複実装、
      利用者が通知を実際に閲覧したことの保証、をいずれも設けない。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-108.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ### 要件テーブルへの追記（anchor: ## 要件）

      | REQ-108-014 | 重要な設計方針・既存前提の変更、外部仕様・互換性・データ・セキュリティへの重要な影響、進行中の別作業への重大な影響、当初想定からの重大な変更などを、変更の意味と影響に基づいて識別できること。代表的な重要変更と、誤字修正・単純な参照修正・意味を変えない機械的更新を含む検証事例で、重要変更の通知要否を区別できること。ファイル数や変更行数のみから重要性を決定しないこと |
      | REQ-108-015 | 重要変更が識別された場合、利用者への通知に変更する理由、何をどのように変更する予定か、想定される影響、確定している事項と未確認の事項（該当する場合）、現在工程と過去工程の関係（工程駆動で該当する場合）を含めること。通知は変更の意味を利用者が理解できる文章とし、変更ファイル一覧だけで代替しないこと |
      | REQ-108-016 | 重要変更が正規成果物へ反映される前に、その変更についての通知が利用者向けの実行出力へ提示されること。実行時の記録から、通知の提示が対象変更の正規反映より先に成立したことを確認できること。通知をキューに登録しただけの状態や、変更確定後に初めてまとめて提示した状態を、事前通知の達成と扱わないこと。作業ブランチ上での検討・編集には、この通知の完了を前提条件として要求しないこと |
      | REQ-108-017 | 既存の合意と委任された裁量の範囲内の重要変更では、事前通知を行ったうえで、追加承認なしに自律実行を継続できること。利用者に留保された新たな判断が必要な場合は、通知しただけで承認済みと扱わず、既存の判断手順に従って該当部分の処理を保留すること。既存の承認権限や安全境界を弱めず、通知のみを理由とする新たな一律停止を設けないこと |
      | REQ-108-018 | 実行開始時点では識別されていなかった重要変更が実行中に判明した場合、判明した内容と影響を利用者へ追加通知すること。その時点で未反映の重要変更については、正規反映前に通知すること。判明時点ですでに反映済みの内容がある場合は、反映済みである事実を区別して説明し、事後説明を事前通知として扱わないこと |
      | REQ-108-019 | 同一の意味を持つ重要変更が複数の成果物・工程に波及する場合、利用者が理解する変更単位で通知をまとめること。同じ重要変更について、ファイルごと・工程ごと・委譲先ごとに実質的に同じ通知を繰り返さないこと。新たな重要な影響が判明した場合は、重複通知とは区別して追加説明できること |
      | REQ-108-020 | 重要変更を伴う実行の完了報告から、実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を確認できること。事前通知したが実施しなかった変更については、実施済みと報告しないこと。変更が一部成功、一部失敗、未確認、または中断となった場合も、実際の成立状況を区別して報告すること |
      | REQ-108-021 | 直接の `req-define → case-auto`、および `backlog-auto → req-define → case-auto` の正規利用経路で、重要変更の事前通知、必要な追加通知、最終結果の説明が成立すること。工程情報が存在しないプロジェクトでも、既存の要件・設計・実装への変更として説明できること。`backlog-auto` では子ワークフローの通知が親側の実行・結果報告によって失われず、利用者に提示されること |
      | REQ-108-022 | `phase-artifacts-update` の正規利用経路で、重要変更の事前通知と結果説明が成立すること。完了済み過去工程の成果物を重要な内容で改訂する場合は、現在工程との関係と想定される後続影響を通知に含めること。既存の差分・影響評価と、現在工程を巻き戻さない規則を維持すること |
      | REQ-108-023 | 変更内容を判断する既存ワークフローが重要性と想定影響を評価し、その通知が利用者まで届くこと。`case-auto` や `backlog-auto` に全変更の意味判断を集約しないこと。既存の合意内容との照合、差分・影響評価、必要な更新・再検証を、通知によって代替しないこと |
      | REQ-108-024 | 重要変更の識別、事前通知、実行中の追加通知、通知の集約、通知と承認の区別、完了報告への反映、変更駆動と工程駆動への適用、判断・実行・通知の責務の維持の各要件の成立を、対象となる公開入口から実行して検証すること。重要な変更と軽微な変更の区別、追加承認を要しない重要変更の自律継続、利用者判断を要する変更の停止、自律実行中に新たに判明した重要変更、複数ファイルへの波及と重複通知の抑制、`backlog-auto` の一気通貫経路、工程駆動での完了済み過去工程の成果物改訂、中断・失敗・再開時の通知と結果報告を含む代表事例で、利用者向け出力、変更確定の時点、実際の成果物、完了報告を照合すること。GitHub版とLocal版それぞれの正規利用経路を対象とし、該当環境・権限が不足して実行できない検証は合格ではなく未検証として扱うこと |

      ### 適用範囲への追記（anchor: ## 適用範囲）

      - **対象（重要変更の通知と結果説明の追加分）**: 重要変更の識別、重要変更の事前通知、実行中に判明した重要変更の追加通知、複数成果物・工程への波及時の通知の集約、通知と利用者承認の区別、重要変更に関する完了報告への反映、並びに変更駆動と工程駆動の正規利用経路（GitHub 版と Local 版の双方）での成立
      - **対象外（重要変更の通知と結果説明の追加分）**: 通知のための新しい承認段階、通知専用の公開コマンド、恒久的な通知台帳、変更規模を点数化する制度、全ファイル差分の事前提示・利用者承認、工程の自動巻き戻し、全成果物の一律再生成、既存の変更影響分析の重複実装、利用者が通知を実際に閲覧したことの保証
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/req-define.md
    target_area: 重要変更の通知と結果説明
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## 重要変更の通知と結果説明

      壁打ちで合意した要件内容が既存の正規成果物（REQ・Decision・Design）への重要変更を含む場合、当該変更について、変更する理由、何をどのように変更する予定か、想定される影響、確定している事項と未確認の事項（該当する場合）を、draft 保存より前に利用者への実行出力へ通知する。通知は変更の意味を利用者が理解できる文章とし、変更ファイル一覧だけで代替しない。重要変更の識別はファイル数や変更行数ではなく変更の意味と影響に基づき、req-define 自身の判断責務として行う。

      通知と承認は区別する。合意済み要件の具体化（委譲された裁量の範囲内）は事前通知のみで継続し、壁打ちによる合意形成と既存の HITL 境界を通知で代替しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/commands/case-ready.md
    target_area: 重要変更の通知と結果説明
    source_items: [AG-002, AG-003]
    content: |
      ## 重要変更の通知と結果説明

      Definition 保存（REQ・Decision・Design の正規反映）に重要変更が含まれる場合、当該変更の理由・内容・想定影響を、保存の実行より前に利用者への実行出力へ通知する。実行時の記録から、通知の提示が正規反映より先に成立したことを確認できる形で出力する。

      Decision 受理、execution contract と実行構造の確定、lifecycle gate の各判断は維持し、通知によって代替しない。通知と承認は区別し、既存の合意と委任された裁量の範囲内の反映は通知後に追加承認なしで継続する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: append
    target: docs/designs/commands/case-run.md
    target_area: 重要変更の通知と結果説明
    source_items: [AG-001, AG-003, AG-004, AG-005]
    content: |
      ## 重要変更の通知と結果説明

      実行担当サブエージェントへの委譲契約に、重要変更の識別と報告を含める。委譲先が実行中に重要変更を判明した場合は、その内容と影響を親側へ報告させ、その時点で未反映の重要変更は正規反映前に、判明時点ですでに反映済みの内容は反映済みである事実を区別して、利用者へ追加通知する。

      完了報告には、実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。事前通知したが実施しなかった変更を実施済みと報告せず、一部成功・一部失敗・未確認・中断を区別して報告する。通知と承認は区別し、委譲された裁量の範囲内の実行は通知後に追加承認なしで継続する。既存の合意内容との照合、差分・影響評価、必要な更新・再検証を通知で代替しない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: append
    target: docs/designs/commands/case-auto.md
    target_area: 重要変更の通知と結果説明
    source_items: [AG-001, AG-004, AG-005, AG-006]
    content: |
      ## 重要変更の通知と結果説明

      子ワークフロー・委譲実行からの重要変更の通知を、結果集約と実行報告で失わずに利用者へ提示する。同一の意味を持つ重要変更が複数の成果物・工程・委譲先に波及する場合は、利用者が理解する変更単位へ通知を集約し、ファイルごと・工程ごと・委譲先ごとの実質的な重複通知を繰り返さない。新たな重要な影響の判明は、重複通知と区別して追加説明する。

      case-auto 自身は全変更の意味判断を行わず（判断の局所所有は維持）、各子ワークフロー・委譲先が判断した重要性と想定影響の評価を前提に、通知の伝達と集約だけを担う。通知と承認は区別し、通知のみを理由とする一律停止を設けない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: append
    target: docs/designs/commands/backlog-auto.md
    target_area: 重要変更の通知と結果説明
    source_items: [AG-004, AG-005, AG-006]
    content: |
      ## 重要変更の通知と結果説明

      一気通貫実行（backlog 整理サイクル、req-define、case-auto の接続を含む）において、子ワークフローの重要変更の通知が親側の実行・結果報告によって失われず、利用者に提示されることを維持する。一気通貫全体の完了報告には、重要変更に関する実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を含める。

      通知の集約は、同一の意味を持つ重要変更を利用者が理解する変更単位にまとめ、実質的な重複通知を繰り返さない。既存の利用者判断境界（backlog-review の RU 承認、req-define の壁打ち、リリース条件・公開権限の確認）は維持し、通知で代替しない。
  - id: ACT-DESIGN-006
    artifact: design
    operation: append
    target: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_area: 重要変更の通知と結果説明（phase-artifacts-update）
    source_items: [AG-001, AG-006]
    content: |
      ## 重要変更の通知と結果説明（phase-artifacts-update）

      phase-artifacts-update の正規成果物への反映において、重要変更を正規反映の前に利用者へ通知する。完了済み過去工程の成果物を重要な内容で改訂する場合は、通知に現在工程との関係と想定される後続影響を含める。反映の結果説明には、実際に変更した重要事項と事前の見込みとの違い、残る影響を含める。

      既存の差分・変更影響評価（REQ-106、REQ-111-008）と現在工程を巻き戻さない規則を維持し、通知によって代替しない。通知と承認は区別し、採用判断（利用者の明示判断）と反映作業（委譲された裁量）の既存境界を変更しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-0246 の正規所有者とアンカー節は docs/designs/commands/ 配下の phase-artifacts-update Design を
      主要な適用対象の挙動契約として挙げるが、docs/designs/commands/ 配下に phase 系 command Design は実在しない。
    resolution: >-
      実配置確認（docs/designs/commands/ の文件一覧、docs/designs/ 全域の phase-artifacts-update 検索）により、
      phase-artifacts-update の挙動契約は docs/designs/workflows/v51-phase-driven-collaboration-model.md
      （REQ-110 の design 対応、phase 系4操作の横断契約）が実在の正として所有することを確認した。
      宣言パスを採用せず、実配置の v51 横断 Design への追記（ACT-DESIGN-006）を正とした。
      新規 command Design の要否は Case 実行側の設計判断に委ねる。

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0246
    target_req: REQ-108
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      代表的事例セット（重要な設計方針変更、既存前提の変更、外部仕様・互換性・データ・セキュリティ影響、進行中の別作業への重大影響、当初想定からの重大変更、誤字修正、単純な参照修正、意味を変えない機械的更新）を用意し、req-define、case-ready、case-run、case-auto、backlog-auto、phase-artifacts-update の各実行で重要変更の通知要否の判定を観察する。実行記録と通知出力を照合する。
    pass_criteria: |
      重要変更事例で通知が出力され、軽微変更事例（誤字修正・単純な参照修正・意味を変えない機械的更新）で通知されないこと。判定が変更の意味・影響に基づいており、ファイル数・変更行数のみやキーワードだけの機械判定に置き換えられていないこと。
    on_failure: |
      fix-and-reverify。識別の判断基準または実装が要件に反するため、修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      発生した重要変更の通知出力の内容を、変更理由、変更内容（何をどのように変更する予定か）、想定される影響、確定事項と未確認事項（該当する場合）、現在工程と過去工程の関係（工程駆動で該当する場合）の各要素で検査する。
    pass_criteria: |
      該当する全要素が通知に含まれ、変更の意味を利用者が理解できる文章であり、変更ファイル一覧だけで代替されていないこと。
    on_failure: |
      fix-and-reverify。通知内容の構成が要件に反するため、修正して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      重要変更を伴う正規反映（draft 保存、Definition 保存、成果物更新、PR 等の各経路）の実行で、実行時の記録（タイムスタンプ付きログ、Issue/PR 記録等）から通知提示が正規反映より先に成立したことを確認する。
    pass_criteria: |
      全対象経路で通知提示から正規反映への順序が記録から確認できること。通知をキュー登録しただけの状態、変更確定後に初めてまとめて提示した状態が事前通知の達成として扱われていないこと。作業ブランチ上の検討・編集に通知完了が前提条件として要求されていないこと。
    on_failure: |
      fix-and-reverify。通知の順序担保が要件に反するため、修正して再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |
      既存合意・委任裁量の範囲内の重要変更で通知後に追加承認なしで自律継続すること、利用者に留保された新たな判断が必要な場合は通知のみで承認済みとせず既存判断手順で保留すること、を各正規利用経路で確認する。あわせて既存 HITL 境界（req-define 壁打ち、backlog-review RU 承認、リリース条件・公開権限確認等）の要件が本変更で変更されていないことを確認する。
    pass_criteria: |
      自律継続の事例と保留の事例が要件どおり動作すること。既存の承認権限・安全境界が弱まっていないこと。通知のみを理由とする新たな一律停止が設けられていないこと。
    on_failure: |
      fix-and-reverify。通知と承認の区別の実装が要件に反するため、修正して再検証する。
  - id: TS-005
    target_item: AG-004
    verification: |
      実行開始時に未識別の重要変更が実行中に判明する事例（実行中に重要変更が生じる条件下で実行）で、追加通知の発生・内容・順序を確認する。
    pass_criteria: |
      判明した内容と影響が追加通知されること。未反映の重要変更は正規反映前に通知されること。判明時点で反映済みの内容は反映済みである事実を区別して説明され、事後説明が事前通知として扱われていないこと。
    on_failure: |
      fix-and-reverify。追加通知の実装が要件に反するため、修正して再検証する。
  - id: TS-006
    target_item: AG-004
    verification: |
      同一の意味を持つ重要変更が複数の成果物・工程・委譲先に波及する事例（複数ファイル・並列委譲を伴う実行）で、通知のまとまりと重複を確認する。
    pass_criteria: |
      利用者が理解する変更単位で通知がまとめられていること。ファイルごと・工程ごと・委譲先ごとの実質的に同じ通知の重複がないこと。新たな重要な影響の判明が重複通知と区別されて追加説明されること。
    on_failure: |
      fix-and-reverify。通知集約の実装が要件に反するため、修正して再検証する。
  - id: TS-007
    target_item: AG-005
    verification: |
      重要変更を伴う実行の完了報告（case-run の完了報告、case-auto の結果集約、backlog-auto の一気通貫報告、phase-artifacts-update の反映結果）を、実際の変更内容および事前通知と照合する。一部失敗・中断を含む事例でも実施する。
    pass_criteria: |
      実際に変更した重要事項、事前の見込みと実績の違い、残る影響、未完了事項を完了報告から確認できること。事前通知したが実施しなかった変更が実施済みと報告されていないこと。一部成功・一部失敗・未確認・中断が実際の成立状況に応じて区別されていること。
    on_failure: |
      fix-and-reverify。完了報告の実装が要件に反するため、修正して再検証する。
  - id: TS-008
    target_item: AG-006
    verification: |
      直接の req-define → case-auto、および backlog-auto → req-define → case-auto の各正規利用経路を GitHub 版と Local 版で実際に実行する。工程情報が存在しないプロジェクトでの実行も含む。
    pass_criteria: |
      両経路・両版で重要変更の事前通知、必要な追加通知、最終結果の説明が成立すること。工程情報なしのプロジェクトでも既存の要件・設計・実装への変更として説明できること。backlog-auto で子ワークフローの通知が親側の実行・結果報告によって失われず利用者に提示されること。
    on_failure: |
      fix-and-reverify。変更駆動経路の適用が要件に反するため、修正して再検証する。
  - id: TS-009
    target_item: AG-006
    verification: |
      phase-artifacts-update の正規利用経路を GitHub 版と Local 版で実際に実行する。完了済み過去工程の成果物を重要な内容で改訂する事例を含む。
    pass_criteria: |
      重要変更の事前通知と結果説明が成立すること。過去工程改訂時に現在工程との関係と想定される後続影響が通知に含まれること。既存の差分・影響評価と現在工程を巻き戻さない規則が維持されていること。
    on_failure: |
      fix-and-reverify。工程駆動経路の適用が要件に反するため、修正して再検証する。
  - id: TS-010
    target_item: AG-001
    verification: |
      変更を実行する各ワークフローの Design と実装を確認し、通知・集約の実装が case-auto・backlog-auto への意味判断集約になっていないこと、既存の合意内容との照合・差分影響評価・更新再検証が通知で代替されていないことを確認する。
    pass_criteria: |
      各ワークフローが自分の判断責務の中で重要性と想定影響を評価し、その通知が利用者まで届くこと。case-auto や backlog-auto に全変更の意味判断が集約されていないこと。既存の照合・評価・再検証が維持されていること。
    on_failure: |
      fix-and-reverify。責務構造の実装が要件に反するため、修正して再検証する。
  - id: TS-011
    target_item: AG-007
    verification: |
      AC1〜AC10 に対応する各要件（TS-001〜TS-010）を、対象となる公開入口から実行して検証する。代表事例（重要な変更と軽微な変更の区別、追加承認を要しない重要変更の自律継続、利用者判断を要する変更の停止、自律実行中に新たに判明した重要変更、複数ファイルへの波及と重複通知の抑制、backlog-auto の一気通貫経路、工程駆動での完了済み過去工程の成果物改訂、中断・失敗・再開時の通知と結果報告）で、利用者向け出力、変更確定の時点、実際の成果物、完了報告を照合する。機械的に検証できる事項（通知の出力有無、実行順序、重複、実際の変更との差分、既存の承認手順との接続）は機械的に確認する。あわせて、現行の並列・委譲実行で重要変更を正規反映前に利用者へ表示する経路が成立するか、変更駆動による過去工程成果物の改訂が進行中の工程駆動へ必要な範囲で伝播するかを実測する（RU-0246 未確認事項2件）。
    pass_criteria: |
      全代表事例で照合が成立すること。GitHub 版と Local 版それぞれの正規利用経路で検証済みであること。該当環境・権限が不足して実行できない検証が未検証として記録され、合格扱いになっていないこと。重要変更の識別が変更ファイル数やキーワードだけの機械判定に置き換えられていないこと。部品試験や手順本文の存在確認のみで利用者向けの事前通知の成立が判定されていないこと。
    on_failure: |
      fix-and-reverify を基本とする。ただし該当環境・権限が不足して実行できない検証条件は不合格ではなく未検証として記録し、環境整備の必要性と再検証条件を record-in-findings で Findings に記録する。

# realization_actions: 実現面の変更方針（実現面変更方針の構造化ハンドオフ契約）
realization_actions:
  - id: RA-001
    concern: 配布 workflow 本文への通知挙動の組込み
    responsibility: >-
      req-define、case-ready、case-run、case-auto、backlog-auto、phase-artifacts-update の各 workflow skill
      （および接続する command 本文）に、重要変更の識別・事前通知・追加通知・完了報告への反映の挙動を組込む。
      各 workflow が既存の責務に従って実現し、case-auto・backlog-auto へ意味判断を集約しない。
    ownership_hints:
      - src/common/skills/agentdev-workflow-req-define/
      - src/common/skills/agentdev-workflow-case-ready/
      - src/common/skills/agentdev-workflow-case-run/
      - src/common/skills/agentdev-workflow-case-auto/
      - src/common/skills/agentdev-workflow-backlog-auto/
      - src/common/skills/agentdev-workflow-phase-artifacts-update/
      - src/common/skills/agentdev-case-run-execution-adapter/（委譲契約への識別・報告の組込み）
    intent: >-
      REQ-108-014〜024 の成果要件を各 workflow の実行挙動として成立させる。通知と承認の区別、
      重要性の意味・影響に基づく判断、既存判断境界の維持を配布物の振る舞いとして定着させる。
    verification_refs: [TS-001, TS-002, TS-004, TS-005, TS-008, TS-009, TS-010]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-006]
  - id: RA-002
    concern: 事前通知の順序担保と実行記録
    responsibility: >-
      重要変更の通知提示が正規成果物への反映より先に成立することを、実行時の記録から確認できる形で担保する機構を
      各 workflow の正規反映直前の位置へ組込む。通知をキュー登録だけに終わらせない。
    ownership_hints:
      - src/common/skills/agentdev-workflow-req-define/（draft 保存前）
      - src/common/skills/agentdev-workflow-case-ready/（Definition 保存前）
      - src/common/skills/agentdev-workflow-phase-artifacts-update/（正規成果物反映前）
    intent: REQ-108-016 の順序要件を機械的にも確認可能な形で実装する。
    verification_refs: [TS-003]
    source_items: [AG-002]
  - id: RA-003
    concern: 通知の集約と親経路での提示保持
    responsibility: >-
      case-auto の結果集約と backlog-auto の一気通貫報告において、子ワークフロー・委譲実行の重要変更の通知を失わずに
      利用者へ提示し、同一の意味の変更単位へ集約する。並列・委譲実行下での通知の伝達経路を成立させる。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-auto/（orchestration stage 3 の結果集約）
      - src/common/skills/agentdev-workflow-backlog-auto/（一気通貫実行の接続と報告）
      - src/common/skills/agentdev-workflow-orchestration/（委譲 protocol との接続）
    intent: >-
      REQ-108-019、REQ-108-021 の集約・伝達要件を並列実行の親経路で成立させる。RU 未確認事項
      （並列・委譲実行で正規反映前に利用者へ表示する経路の成立性）の実測対象を含む。
    verification_refs: [TS-006, TS-008, TS-011]
    source_items: [AG-004, AG-006, AG-007]
  - id: RA-004
    concern: 完了報告への重要変更の反映
    responsibility: >-
      case-run の完了報告、case-auto の結果集約、backlog-auto の一気通貫報告に、実際に変更した重要事項、
      事前の見込みと実績の違い、残る影響、未完了事項を含める。中断・失敗・再開時の通知と結果報告の様式を整える。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-run/（完了報告）
      - src/common/skills/agentdev-workflow-case-close/（内部 lifecycle の完了報告接続）
      - src/common/skills/agentdev-workflow-case-auto/（結果集約）
      - src/common/skills/agentdev-workflow-backlog-auto/（一気通貫の最終報告）
    intent: REQ-108-020 の完了報告要件を各報告経路で成立させる。
    verification_refs: [TS-007, TS-011]
    source_items: [AG-005, AG-007]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0246
    source_item: logical_key:important-change-prenotification-and-result-explanation
    disposition: covered
    reason_code: fully_structured
    reason: |-
      RU-0246 の決定的受け入れ条件 AC1〜AC11、対象外9項目、検証上の留意点、未確認事項2件を省略・弱化・反転なく
      draft-data へ構造化した（REQ-108 追加11行、適用範囲への対象・対象外追記、TS-001〜TS-011）。
      RU の正規所有者とアンカー節（主対象 REQ-108、整合維持 REQ-096/106/111/114、主要適用対象の挙動契約）を
      変更対象の特定に使用した。phase-artifacts-update の挙動契約の実配置不一致は CR-001 のとおり解決した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0246.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（1操作1エントリ）
assembly_evidence:
  - target_file: docs/requirements/REQ-108.md
    target_content_sha256: f9a1d335b8b5924c21f2af37c21b810e62b9373c993e0ba2bc6dc7ad1ff19111
    check_scope: { heading: "## 要件", start_line: 13, end_line: 30 }
    execution_conditions: { operation: append, edit_sha256: f0da63940bbc0a38fd2e7a035205af6af2f183268fa16ab47ec198ffae4253d8, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 12, added: 12, removed: 0 }
    executed_at: "2026-10-24T07:26:03.477Z"
  - target_file: docs/requirements/REQ-108.md
    target_content_sha256: f9a1d335b8b5924c21f2af37c21b810e62b9373c993e0ba2bc6dc7ad1ff19111
    check_scope: { heading: "## 適用範囲", start_line: 31, end_line: 35 }
    execution_conditions: { operation: append, edit_sha256: 2d9a444b540546f90c23803c6b58bac1a03ad6f728520afd724ff43d2e0a253d, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 3, added: 3, removed: 0 }
    executed_at: "2026-10-24T07:26:03.588Z"
  - target_file: docs/designs/commands/req-define.md
    target_content_sha256: 61ff2f6511bf8bfa8a66007c4a60e14cf04897540becee1e242cb78aceba6b6d
    check_scope: { heading: "## adversarial-review 挿入境界（req-define）", start_line: 584, end_line: 628 }
    execution_conditions: { operation: append, edit_sha256: 08d74d84c516ed87692e3b849f5975cc8609c067f35f837e27d90522bea7959d, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:03.684Z"
  - target_file: docs/designs/commands/case-ready.md
    target_content_sha256: 6f924dcd72970ed4d6b84c2e9eabaaeaacb36448a95096926ad742eb70c2d7a3
    check_scope: { heading: "## 受入検査入力と実行証拠の接続", start_line: 95, end_line: 98 }
    execution_conditions: { operation: append, edit_sha256: 21a458a897f12f238be0e3080f8c9ffed829ffce15455794d3975dfdb845abc6, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:03.766Z"
  - target_file: docs/designs/commands/case-run.md
    target_content_sha256: 9cf244cf91abdb990535edb8def2a0579afe0a9f687ca8b6622613b1e0524b40
    check_scope: { heading: "## v3 epic-wave-model Design からの吸収", start_line: 577, end_line: 583 }
    execution_conditions: { operation: append, edit_sha256: 5eed5934894b6a5ca59f160022aea96601f71feb489e68e8e3a3021fe4d8e44a, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:03.849Z"
  - target_file: docs/designs/commands/case-auto.md
    target_content_sha256: 3c919b9ca8eec0b25e361fa9e46e8bd176f4bc7edbe1a5b3b9427d48f529e260
    check_scope: { heading: "## v3 epic-wave-model Design からの吸収", start_line: 592, end_line: 599 }
    execution_conditions: { operation: append, edit_sha256: aeacd3dfbf023210db125898529817d24cc911fb07577b3ccd5b01deffbd3c71, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:03.941Z"
  - target_file: docs/designs/commands/backlog-auto.md
    target_content_sha256: 6710db51fd03af18114604062ca2d1dffd573576fd489ed2e6d5277229a1648d
    check_scope: { heading: "## 検証観点", start_line: 96, end_line: 102 }
    execution_conditions: { operation: append, edit_sha256: 7b8b2599f16d8b9f606867d85002512e84e2a9cb3d6d1beb1cf01f6c4fb6a071, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:04.029Z"
  - target_file: docs/designs/workflows/v51-phase-driven-collaboration-model.md
    target_content_sha256: da4c5262b9cd2a90752806c8149eb975eb66bb1351cf0d8af381a8e2635c8796
    check_scope: { heading: "## 検証との対応", start_line: 109, end_line: 112 }
    execution_conditions: { operation: append, edit_sha256: e550f6ed6ce573d49313f11ce81993bce50dd9b53795b3880b75c5ce4574fb34, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: "target section only" }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 6, added: 6, removed: 0 }
    executed_at: "2026-10-24T07:26:04.121Z"

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: >-
    (1) REQ-108 要件追加・適用範囲追記と 6 Design への節追記（docs 変更）、(2) 配布 workflow 本文への実装
    （6 workflow、並列化可能）、(3) AC11 の実経路検証（GitHub 版・Local 版、8代表事例）への分解候補。
    (2)(3) は (1) の確定後に着手する依存関係。v51 横断 Design のみ RU アンカーと実配置が異なる（CR-001 参照）。
  wave_hints:
    - "(1) docs 変更群（REQ-108、6 Design）"
    - "(2) 配布物実装（req-define、case-ready、case-run、case-auto、backlog-auto、phase-artifacts-update。並列化可能）"
    - "(3) E2E 検証（TS-011。GitHub 版・Local 版）"
```

# summary

RU-0246（session由来RU「重要変更の事前通知と実行結果の説明」、2026-10-24 合意・利用者承認済み）を要件定義した。

- 主対象 REQ-108 への追加として、決定的受け入れ条件 AC1〜AC11 を要件行 11 行（REQ-108-014〜024 想定）に構造化し、RU の対象・対象外を適用範囲へ追記した。いずれも省略・弱化・反転なし。
- 整合維持先（REQ-096・REQ-106・REQ-111・REQ-114）は再定義せず、各要件行が既存の判断区分・差分影響評価・巻き戻し禁止・一気通貫契約を維持・参照する形とした。
- 主要適用対象の挙動契約として、req-define・case-ready・case-run・case-auto・backlog-auto の各 command Design と、phase-artifacts-update の実配置である v51 横断 Design（CR-001）へ「重要変更の通知と結果説明」節を追記する design actions を定義した。
- 検証は TS-001〜TS-011（AC11 の実経路検証、検証上の留意点、RU 未確認事項 2 件の実測を含む）。
- work_type: feature、scale: large。Epic 構成の要否は case-open が判断する（case_open_hints 参照）。
