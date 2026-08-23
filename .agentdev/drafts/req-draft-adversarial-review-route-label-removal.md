---
draft_type: req_draft
topic_slug: adversarial-review-route-label-removal
status: saved
created_at: "2026-08-24T08:13:39+09:00"
source_rus:
  - RU-0001
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  対論型レビュー（agentdev-adversarial-review）呼出統合の「経路A〜H」識別子概念を廃止し、
  呼出元のコマンド名・Workflow Skill 名の固有名で識別する体系へ正規REQ（REQ-014/015/016）、
  Design、配布Workflow Skill・Capability Skill・reference・Command定義、索引を横断的に整合させる。
  case-auto は対論型レビューの呼出元ではなく停止伝播責務として分離して記述する。
  既存のレビュー発動位置・省略条件・戻り先・副作用との順序は全て維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      現行の正規REQ、Design、配布Workflow Skill、Capability Skill、reference、Command定義から
      「経路A」〜「経路H」の文字識別子を廃止する。対論型レビューの呼出統合は、呼出元のコマンド名
      または Workflow Skill 名の固有名（例: 「req-define の adversarial-review 統合」
      「case-run execution adapter の adversarial-review 統合」）で表現する。
      対論型レビュー自体は共通スキルであり、呼出元ごとに異なるレビュー種別は存在しないことを前提とする。
      変更対象の検出基準は RU の列挙リストではなく横断検索（経路A〜経路H、path-a 相当）とし、
      RU 未列挙の Capability Skill（agentdev-intake-pipeline、agentdev-learning-pipeline、
      agentdev-backlog-integration）や reference（agentdev-workflow-case-run/references/epic-wave.md 等）
      も検出対象に含む。docs/reports/** の履歴記録と .agentdev/** の過去検出事項は対象外とする。
  - id: AG-002
    content: |
      REQ-014 は「当該経路」等の表現を呼出元固有契約として再表現する（共通呼出契約自体の意味は変更しない）。
      REQ-015（主対象）はタイトルを「adversarial-review caller integration（7 caller と case-auto 停止伝播）」へ変更し、
      「7経路+case-auto」モデルを廃止して7つの具体的呼出元と case-auto 停止伝播のモデルとして再構成する。
      各呼出元固有の既存要件（REQ-015-004〜011）の意味は維持する。
      REQ-016 は「7経路 + case-auto」を「7呼出元と case-auto 停止伝播」へ再定義する。
      REQ-017 は経路識別子依存が確認済みのため変更しない。
      要件インデックス（docs/README.md、docs/requirements/README.md）の REQ-015 タイトル行も整合させる。
  - id: AG-003
    content: |
      case-auto は対論型レビューの直接呼出元として記述せず、下位工程で発生した未解決ユーザー判断
      （user-decision-required + decision_context）を受領して自走を停止し、判断内容をユーザーへ提示し、
      既存の再開点から処理を再開する orchestration 責務として記述する。
      「経路H」または A〜G と同列の対論型レビュー経路として扱う記述を残さない。
      停止・再開方式そのもの（REQ-015-012、REQ-016-004 の意味）は変更しない。
  - id: AG-004
    content: |
      経路文字の廃止によって、7呼出元（req-define、inspect-promote、intake-promote、learning-promote、
      backlog-review、case-open、case-run execution adapter）の次の既存契約を一切変更しない:
      発動位置、発動条件、省略条件、レビュー対象、採用済み指摘の反映先、反映後の戻り先、
      必要な再検証、最初の副作用（Issue 作成、要件doc保存、実装変更等）との順序、
      未解決事項の停止・伝播。変更前後でこれらが同値であることを検証で確認する。
      経路文字の削除を理由として、対論型レビュー固有ロジックを各呼出元へ複製しない。
      対論型レビュー自身の振る舞い、共通の呼出契約、各Workflow固有の挿入位置・戻り先という
      現在の責務分離を維持する。
  - id: AG-005
    content: |
      src/opencode/skills/agentdev-workflow-req-define/references/adversarial-review-path-a.md を
      adversarial-review-integration.md へ変更する（意味ベース名称）。
      ファイル名変更に伴い、参照元（同 SKILL.md の STEP-8 行、references/draft-generation.md）を全て更新する。
      旧ファイル名への現行参照が 0 件であることを確認する。
      履歴記録（監査レポート等）の旧パス言及は対象外とする。
  - id: AG-006
    content: |
      過去の監査レポート（docs/reports/**）、過去の検出事項、評価レポート、履歴記録は書き換えない。
      旧表現が残る履歴が現行実行または正規判断の参照元として使用されていないことを確認する。
      DEC-012 に残存する経路表現（1件）は、決定内容の意味を変えない表記統一として
      accepted Decision の非意味修正（直接更新）で対応する。
      直接更新の明示承認は本壁打ちでの合意（2026-08-24、Q2 に対する合意）として記録済みである。
  - id: AG-007
    content: |
      経路A〜Hの廃止に伴い、新しい識別子、別名対応表、互換レイヤーを導入しない。
      呼出元名のみで一意識別可能とする。
      TypeScript 等の実行コード変更は対象外とする（作業仮定: A〜H は Markdown 上の契約・説明用識別子であり
      実行時分岐の機械的識別子ではない）。実装時の横断検索で A〜H が実行上の識別子として
      使用されていることが判明した場合は、その事実を報告し、追加判断なしに変更範囲を拡大しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-014.md
    source_items: [AG-001, AG-002]
    content: |
      REQ-014-014 を次の本文へ更新する（「当該経路」表現の呼出元固有契約への再表現。
      共通呼出契約の意味は変更しない）:

      「REQ-014-014 | skip 条件は各呼出元の adversarial-review 統合の正規所有者で明示的かつ判定可能に定め、skip 判断のためだけに新しい HITL / 承認点を追加せず、skip 対象でもユーザーが明示的に adversarial-review を要求した場合は実行すること」

      その他の要件行、目的、適用範囲は変更しない。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-015.md
    source_items: [AG-001, AG-002, AG-003]
    content: |
      タイトルを「adversarial-review caller integration（7 caller と case-auto 停止伝播）」へ変更する。

      目的を次の本文へ更新する:

      「7コマンド（req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote,
      backlog-review）へ adversarial-review caller integration を実装する。各呼出元はコマンド名または
      Workflow Skill 名の固有名で識別する。adversarial-review は共通の対論型レビューであり、
      呼出元ごとに異なるレビュー種別は存在せず、経路文字等の別識別子を用いない。
      case-auto は adversarial-review の呼出元ではなく、下位工程で発生した未解決のユーザー判断を
      受領して自走を停止し上位へ伝播する停止伝播として扱う（REQ-015-012）。
      各 command Design が review 挿入境界（発動条件、review 対象確定位置、採用後戻り先、
      最初の副作用との順序）を正典として所有する。
      共通契約は REQ-014、横断整合は REQ-016 が所有する。」

      REQ-015-003 を次の本文へ更新する（「各経路」の「各呼出元」への再表現）:

      「REQ-015-003 | 各呼出元の正規所有者が定義した skip 条件に該当する場合、adversarial-review を省略して従来フローを継続できること」

      REQ-015-001、002、004〜012 の意味は変更しない。
      要件インデックス（docs/README.md、docs/requirements/README.md）の REQ-015 タイトル行を
      同じタイトルへ更新する。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-016.md
    source_items: [AG-002, AG-003]
    content: |
      目的冒頭「7経路 + case-auto 統合後の横断整合を確認する。」を
      「7呼出元と case-auto 停止伝播の統合後の横断整合を確認する。」へ更新する。

      REQ-016-001〜006 の「7経路 + case-auto 統合後」を
      「7呼出元と case-auto 停止伝播の統合後」へ更新する。

      適用範囲「7経路 + case-auto 統合後の横断整合確認」を
      「7呼出元と case-auto 停止伝播の統合後の横断整合確認」へ更新する。

      各要件行の意味（QG/HITL 重複なし、新規永続成果物混入なし、case-auto 伝播 regression なし、
      責務重複なし、Step 表現整合）は変更しない。REQ-016-007〜010 は経路識別子を使わないため
      変更しない。

conflict_resolutions:
  - id: CR-001
    conflict: |
      変更対象範囲の解釈について、RU 本文の列挙リストを厳密適用するか、
      横断検索の検出結果を対象とするか。
    resolution: |
      RU の受け入れ条件12（横断検索による残存確認）と整合させるため、対象範囲は横断検索ベースとする。
      RU の列挙リストは網羅確認の最小保証として扱い、検出された RU 未列挙ファイル
      （Capability Skill 3件、epic-wave.md 等）も同一原則で対象に含める。
      履歴記録（docs/reports/**、.agentdev/**）は対象外。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-014
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: { status: saved, saved_req_docs: [docs/requirements/REQ-014.md], artifact_action: ACT-REQ-001, source_ru: RU-0001, unclassified_verification_rows: [] }
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-015
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: { status: saved, saved_req_docs: [docs/requirements/REQ-015.md], artifact_action: ACT-REQ-002, source_ru: RU-0001, unclassified_verification_rows: [] }
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-016
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: { status: saved, saved_req_docs: [docs/requirements/REQ-016.md], artifact_action: ACT-REQ-003, source_ru: RU-0001, unclassified_verification_rows: [] }

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      変更後、現行正規文書・配布物（docs/requirements/**、docs/designs/**（reports は除外）、
      src/opencode/**、.agentdev/extensions/**）に対して「経路A」〜「経路H」の文字識別子と
      path-a 相当の機械的識別子を横断検索する。
    pass_criteria: |
      docs/reports/** と .agentdev/** の履歴記録を除き、検出件数が 0 件であること。
      対論型レビュー統合の記述が呼出元名で表現されていること。
    on_failure: |
      fix-and-reverify。残存箇所を特定し呼出元名表現へ修正してから再検索する。
      文言置換の機械的処理のため、修正コストは低く再検証で完了確認できる。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-014・REQ-015・REQ-016 の更新後本文と要件インデックス
      （docs/README.md、docs/requirements/README.md）を確認する。
    pass_criteria: |
      REQ-014-014 が呼出元固有契約として再表現済みであること。
      REQ-015 が7呼出元と case-auto 停止伝播のモデルで記述され、タイトル変更が両インデックスへ
      反映されていること。REQ-016-001〜006 が「7呼出元と case-auto 停止伝播」の横断整合として
      記述されていること。REQ-015-004〜011 の意味が変更前と同値であること。
    on_failure: |
      fix-and-reverify。不備のある REQ・インデックスを修正し、再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-015-012、REQ-016-004、docs/designs/commands/case-auto.md、
      agentdev-workflow-case-auto の SKILL.md・references、
      .agentdev/extensions/skills/agentdev-workflow-case-auto.yaml を確認する。
    pass_criteria: |
      case-auto が対論型レビューの直接呼出元として記述されている箇所がないこと。
      下位工程由来の未解決ユーザー判断の受領・停止・提示・再開責務として記述されていること。
      停止伝播契約（user-decision-required + decision_context 受領、resume point）の意味が
      変更前と同値であること。
    on_failure: |
      fix-and-reverify。呼出元としての記述を停止伝播責務の記述へ修正し、再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      7呼出元（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、
      case-open、case-run execution adapter）それぞれについて、変更前後の
      review 発動位置、省略条件、レビュー結果反映後の戻り先、必要な再検証、
      最初の副作用との順序を差分比較で確認する。
    pass_criteria: |
      全呼出元で比較項目の意味が変更前と同値であること。
      対論型レビュー固有ロジックの呼出元への複製が生じていないこと。
    on_failure: |
      fix-and-reverify。意味が変化した箇所を変更前の意味へ戻し、再比較する。
  - id: TS-005
    target_item: AG-005
    verification: |
      rename 後、adversarial-review-path-a の旧パス参照を横断検索する。
      新ファイル（adversarial-review-integration.md）の存在と、
      同 SKILL.md の STEP-8 参照行・references/draft-generation.md の参照更新を確認する。
    pass_criteria: |
      現行正規文書・配布物で旧パス参照が 0 件（履歴記録は除外）であること。
      新ファイルが存在し、全参照元が更新済みであること。
    on_failure: |
      fix-and-reverify。残存参照を新パスへ更新し、再検索する。
  - id: TS-006
    target_item: AG-006
    verification: |
      docs/reports/** に旧表現が残るファイルについて、現行実行・正規判断からの参照元検索を行う。
      DEC-012 の経路表現が解消されていることを確認する。
    pass_criteria: |
      旧表現を含む履歴が現行実行・正規判断の参照元として使用されていないこと。
      DEC-012 に経路表現が残っていないこと。
    on_failure: |
      fix-and-reverify。参照されている場合は参照元を現行表現へ更新する。
      DEC-012 は非意味修正として表記を解消し、再確認する。
  - id: TS-007
    target_item: AG-007
    verification: |
      変更後の差分全体を確認し、新しい経路識別子、別名対応表、互換レイヤーの導入有無を検査する。
      実行コード（TypeScript 等）に A〜H 相当の機械的識別子が使用されていないか横断検索する。
    pass_criteria: |
      新識別子・別名対応表・互換レイヤーが存在しないこと。
      実行コードでの A〜H 使用が検出されないこと（検出された場合は事実報告のみ行い、
      対象外として扱う）。
    on_failure: |
      fix-and-reverify。導入物を削除し、再検査する。実行コード検出時は報告のみとし、
      変更範囲を拡大しないため record-in-findings は使用しない。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001
    disposition: covered
    reason_code: adopted
    reason: |
      RU-0001 の要件化の方向（識別子廃止・呼出元固有契約維持・case-auto 分離・責務分離維持）、
      対象範囲、受け入れ条件1〜14をすべて本 draft の agreed_items（AG-001〜007）および
      test_strategy（TS-001〜007）へ反映した。RU 本文の列挙リストは横断検索ベースの
      対象範囲に包含される（CR-001）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    全変更（REQ 3件更新、配布 Workflow Skill・Capability Skill・reference・Command定義の更新、
    adversarial-review-integration.md への rename と参照更新、索引更新、DEC-012 非意味修正）を
    単一 Issue・単一 PR で一括実施する（壁打ち合意済み、2026-08-24）。Epic 分解しない。
  wave_hints: []
```

# summary

対論型レビュー呼出統合の「経路A〜H」識別子を廃止し、呼出元名による識別へ切り替える。
REQ-014/015/016 の3件を UPDATE し、配布物（Workflow Skill・Capability Skill・reference・Command定義）と
索引を横断検索ベースで整合させる。adversarial-review-path-a.md は adversarial-review-integration.md へ
rename する。case-auto は停止伝播責務として対論型レビューの呼出元から分離する。
既存のレビュー発動位置・省略条件・戻り先・副作用との順序は全て維持し、実証Case ではなく
通常Case（main ブランチ）で実施する。Decision は作成しない（廃止・命名規約変更は Decision 作成不可条件に該当）。
