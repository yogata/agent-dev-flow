---
draft_type: req_draft
topic_slug: case-workflow-state-redesign
status: design_saved
created_at: "2026-09-14T11:30:00+09:00"
source_rus:
  - C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
split_forecast:
  new_case_ready_execution_contract:
    predicted_rows: 27
    signals: "行数 +0（27行、0-50帯）、関心分類数 2+（Definition 受入・Decision 受理・構成生成・ゲート/クリーンアップ）= +1、成果物種別数 3+（command/skill/template + REQ/Decision/Design）= +1、合計 2（SPLIT 検討域）"
    decision: >-
      統合維持。理由: CR-002 のとおり構成アルゴリズム・Decision 受理評価・検証ゲート・クリーンアップは canonical Definition 確定という単一の状態遷移（case-ready）から派生する相互依存契約であり、RU の統合理由（移行途中に整合しない公開ワークフローが成立しない）が単一 REQ を要求するため。旧 REQ-030 が同等の行群（25行）を単一 REQ で保持した実績との一貫性も維持する。
  append_targets:
    REQ-005: "+3 行 → 31 行（健全域）"
    REQ-006: "+3 行 → 9 行（健全域）"
    REQ-034: "+2 行 → 38 行（健全域）"
    REQ-035: "+3 行 → 15 行（健全域）"
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  公開ワークフローを成果物種別ではなく状態遷移中心へ再構成する。標準フローを req-define → case-open → case-ready → case-run → case-close とし、req-save / design-save を公開コマンドから廃止して保存能力を case-ready の内部責務（Capability Skill 委譲）へ再配置する。case-update を完全廃止し、Definition 変更経路を case-revise として再実装する。Case 状態モデル（open / ready / running / blocked / review / closed / cancelled）と blocked 時の resume_command を導入し、Definition 確定境界（case-ready）と実行準備完了（ready）を分離する。Definition Package / Definition PR の lifecycle、draft / RU 削除タイミングの移動、検証対応要否ゲートの移動、case-auto の新フロー対応、GitHub / local backend の上位意味論整合を含む。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      公開主フローは req-define → case-open → case-ready → case-run → case-close とする。公開コマンドは成果物種別ではなく、外部から意味のある状態遷移を所有する。
  - id: AG-002
    content: >-
      req-save、design-save は公開コマンドとして廃止する。REQ / Decision / Design の保存、コミット・プッシュに必要な保存能力のみ内部責務として維持し、保存実体は既存 Capability Skill（req-file-manager、decision-file-manager、design-file-manager、artifact-validation）への委譲とする（architecture-advisory 助言を採用。case-ready の単一責務を Definition 確定境界として保つ）。
  - id: AG-003
    content: >-
      case-update は公開コマンド、Workflow Skill、専用テンプレート、専用 Design、専用経路を含め完全に廃止する。現行文書に deprecated alias、旧経路、移行用呼称として残さず、履歴は Git 履歴のみで保持する。旧責務の移管先は Definition / REQ / Decision / Design 変更は req-define → case-revise → case-ready 経路、Case 固有状態・契約更新は所有する case-* workflow、汎用 Issue 操作は /agentdev/issue、低レベル Issue 更新は agentdev_gh.issue_update とする。/agentdev/issue-update は新設しない。
  - id: AG-004
    content: >-
      role: case の Root Case 状態は open、ready、running、blocked、review、closed、cancelled とする。open は Root Case 確立済み・Definition / execution contract 未確定・実行不可、ready は canonical Definition と execution contract が確定し実行可能、running は実行中、blocked は継続条件不足、review は実装完了・最終受入対象、closed は完了、cancelled は中止を意味する。case-run は ready からのみ実装を開始できる。case-revise 専用の状態は追加しない。
  - id: AG-005
    content: >-
      blocked の発生元ごとに状態値を増やさない。blocked の場合のみ Root Case に resume_command を保持し、停止解除後の正規再開入口を永続化する。resume_command は通常状態への遷移時にクリアする。新しい意味判断が必要な場合は req-define を指し、再合意済みで case-revise 自体の再開が必要な場合は case-revise を指せる。再開先を推測しない。
  - id: AG-006
    content: >-
      case-open は壁打ち済み内容を Case 管理下へ移す状態遷移を所有する。Root Case の確立、Definition Package の生成、canonical Definition に実変更がある場合のみ Case 単位で一つの Draft Definition PR を作成する（実変更がなければ Definition PR を作成しない）。新規 Decision は proposed のまま、execution contract を確定せず、Standard / Epic を最終確定せず、Child Issue・Wave を作成せず、draft / RU を削除しない。Root Case 作成後の状態は open とし実装開始を許可しない。
  - id: AG-007
    content: >-
      case-ready は Definition の受入と実行準備完了への状態遷移を所有する。Definition PR が存在する場合、req-define で合意済みの意味内容に対する忠実な投影であること、整合性、必要な品質検査を確認する。新しい意味判断を必要としない場合は追加の人間承認を要求せず Definition PR を自動的に確定・merge する。新しい Decision、意味変更、対象範囲拡大、意味的な不整合解消等が必要な場合は停止し HITL とする。Definition 確定後は canonical Definition を再取得し、それを基準として合意済み新規 Decision の proposed → accepted 遷移、execution contract 確定、Standard / Epic 確定（Standard は Root Case 自身を単一 execution unit、Epic は Child Issue 作成と Wave / 依存構造確定）、検証対応要否未分類の確認、ready 遷移、成功後の draft / RU 削除を行う。
  - id: AG-008
    content: >-
      新規 Decision は case-open 時点では proposed のままとし、採用が req-define で合意済みの場合のみ case-ready で accepted へ遷移する。再実行によって Decision の状態遷移・承認記録を重複生成しない。
  - id: AG-009
    content: >-
      新規 Design は Definition merge 後も draft とし、実装・検証後の case-close で accepted とする（Design lifecycle は既存契約を維持する）。
  - id: AG-010
    content: >-
      execution contract の配置は Standard Case では Root Case が Case 全体の SSoT と execution unit の双方を兼ね、儀式的な Child Issue を作成しない。Epic Case では Root Case を Case 全体・Definition 参照・対象範囲・全体制約・Issue 分解・Wave / 依存関係・全体進捗の orchestration SSoT とし、各 Child Issue を各 case-run が消費する execution contract の execution SSoT とする。各 Child Issue は親 Root Case の自由記述に依存せず、その Issue 単独で対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy を取得できる。
  - id: AG-011
    content: >-
      case-revise は既存 Case に対して req-define で再合意済みの Definition 変更を反映する状態遷移を所有し、自身では新しい要求、Decision、対象範囲を決定しない。canonical Definition に実変更がある場合のみ Definition Amendment PR を作成し、実変更がなければ case-revise を実行せず case-ready で execution contract / execution structure を再確定する。Epic の一部 Child Issue が完了済みの場合、Definition 変更の影響がある Issue のみを再評価対象とし、影響なしと確認できた完了済み Issue は維持する。
  - id: AG-012
    content: >-
      draft / RU は case-open 完了時には削除せず、case-ready が成功し Definition、execution contract、execution structure の必要情報が永続化された後に削除する。case-ready が blocked / failed / 中断した場合は保持する。
  - id: AG-013
    content: >-
      検証対応要否は req-define で可能な限り分類する。case-open は未分類を検出・記録できるが Root Case 作成自体は妨げない。実装着手前の最終ゲートは case-ready が所有し、対象要件に未分類が残る場合は ready へ遷移させない。case-run の実装・検証対応検査、case-close の最終完全性検査は既存の責務として維持する。
  - id: AG-014
    content: >-
      case-auto は新しい標準フロー case-open → case-ready → case-run → case-close を自動継続し、再合意済み Definition 変更がある場合は case-revise → case-ready → case-run → case-close を自動継続する。新しい意味判断が必要となった場合は blocked とし resume_command: req-define で停止し、req-define の壁打ちを自動化しない。
  - id: AG-015
    content: >-
      上位 Workflow は backend 固有表現に依存しない。GitHub backend では Draft Definition PR / Definition Amendment PR を使用し、local backend は同じ上位操作契約と状態遷移を提供し、Definition の「未確定 → 確定」、Case の open → ready という同じ上位意味論を表現する。local backend における PR 相当の物理表現、ファイル配置、内部写像は Design が所有する。
  - id: AG-016
    content: >-
      case-open、case-revise、case-ready は途中まで永続化された状態を再読込して不足分だけを実行できる。中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束する。Root Case、Definition PR、Definition Amendment PR、Child Issue、Wave / 依存関係、Decision の受理記録の少なくともこれらを重複生成しない。Definition PR merge 後に後続処理が失敗した場合、merge を巻き戻さず canonical Definition を基準として再開する。
  - id: AG-017
    content: >-
      新しいマクロフェーズは追加せず、既存の「構造的実行」を Root Case 確立後の Definition 確定、実行準備、実装、進捗管理まで含むものとして再定義する（壁打ち: req-define、構造的実行: open → ready → running、レビュー完了: review → closed）。
  - id: AG-018
    content: >-
      実行中の意味変更は req-define で再合意した後に case-revise へ進む。Definition 実変更がなければ case-revise および空の Definition Amendment PR は実行しない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-004
    target_area: "目的、要件行 REQ-004-011〜013・021・033・040・041・044・045、適用範囲"
    source_items: [AG-002, AG-003, AG-007]
    content: |
      目的節変更後本文:
      要件定義プロセスは、既存REQ照合、操作分類、反映作業混入防止、ユーザー合意形成を含む一貫した契約である。
      本 REQ は req-define プロセスと Definition 保存内部責務（case-ready / case-revise の委譲先 Capability Skill）の横断基本契約を定義する。

      変更後要件行:
      REQ-004-011 | Definition 保存内部責務は保存前に反映作業のみの要件行が残っていないか検査すること
      REQ-004-012 | Definition 保存内部責務は反映作業のみの要件行を検出した場合、保存を停止し、該当行、理由、移送先を報告すること
      REQ-004-013 | Definition 保存内部責務は REQ または Decision 保存後に README との整合性を確認すること
      REQ-004-021 | Definition 保存内部責務は REQ doc 保存時に Issue を作成しないこと
      REQ-004-033 | req-define および Definition 保存内部責務は、要件行候補が REQ に記述すべき外部契約、状態要件であるか、Design 等に配置すべき詳細、内部パラメータであるかを保存前に判定すること
      REQ-004-040 | Definition 保存内部責務は REQ / Decision 保存時に Design を編集しないこと
      REQ-004-041 | Design 保存は Definition 確定工程の内部責務とすること（委譲先は Design が所有）
      REQ-004-044 | Definition 保存内部責務は Decision ファイル保存時に Decision 採番ルールで確定した番号を振ること
      REQ-004-045 | Definition 保存内部責務は draft 内の全 Decision 参照を当該確定番号で置換すること

      適用範囲対象変更後: req-define コマンド、Definition 保存内部責務（case-ready / case-revise 委譲先）、要件形成プロセス全体、ユーザー合意形成プロセス
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-005
    target_area: "要件行 REQ-005-001・010・024、適用範囲"
    source_items: [AG-001, AG-017]
    content: |
      変更後要件行:
      REQ-005-001 | ワークフローは壁打ち、構造的実行、レビュー完了の3つのマクロフェーズで構成すること。構造的実行フェーズは Root Case 確立後の Definition 確定、実行準備、実装、進捗管理までを含み、Case 状態 open → ready → running で表現すること
      REQ-005-010 | 全公開 command は主フロー、最大自走入口、補助フロー、検出フロー、repo-local 検査のいずれかに分類すること。主フローは req-define → case-open → case-ready → case-run → case-close とし、成果物種別を境界とする公開 command を主フローに含めないこと
      REQ-005-024 | workflow は STEP（resume point）単位で構成し、各STEP が独立した開始・完了判定を持つこと。STEP間 handoff は会話記憶に依存せず、Input Resolution（durable state 優先順位: SSoT再構成 > identifier保持 > 最小scalar > runtime artifact）で接続すること。compaction 後も STEP識別子と durable state から current STEP と必要入力を復元できること。並列child task を持つworkflow は child identity / status の復元と fan-in 判定を support すること。正常系・blocked / failed・中断再実行・外部依存失敗・no-op の各シナリオで定義された状態遷移に従うこと。代表的なworkflow（case-run / case-auto・req-define・case-open / case-ready・case-revise・intake-promote）で新モデルの妥当性を検証すること

      適用範囲の「公開 command の分類」変更後: 公開 command の分類（主フロー、最大自走入口、補助フロー、検出フロー、repo-local 検査）と最大自走入口の位置づけ、主フローの標準経路（req-define → case-open → case-ready → case-run → case-close）と Definition 変更例外経路（req-define → case-revise → case-ready）

      適用範囲対象外変更後（該当行）:
      - 個別 command（case-open、case-ready、case-revise、case-run、case-close、case-auto）の内部実行手順と I/O 詳細（REQ-006）
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-005
    target_area: "要件セクション末尾"
    source_items: [AG-001, AG-003, AG-011, AG-015]
    content: |
      公開ワークフローの例外経路は req-define での再合意を起点とし、canonical Definition に実変更がある場合は case-revise → case-ready へ、実変更がない場合は case-ready へ進むこと。case-revise が新しい意味判断を行わないこと
      公開ワークフローと Case 状態遷移は backend 固有表現に依存せず、GitHub backend と local backend が Definition の「未確定 → 確定」、Case の open → ready という同じ上位意味論を提供すること。local backend の PR 相当の物理表現は Design が所有すること
      汎用 Issue 操作は /agentdev/issue と共通 Issue I/O 能力（agentdev_gh）で処理し、汎用 Issue 更新用の公開コマンドを新設しないこと
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-006
    target_area: "目的、要件行 REQ-006-106・107・111、適用範囲（case-update 列挙の除去を含む）"
    source_items: [AG-002, AG-003, AG-004, AG-005]
    content: |
      目的節変更後本文（該当文）:
      case-open は case-open 実行契約 REQ、case-run は case-run 実行契約 REQ、case-close は case-close 実行契約 REQ、case-ready は case-ready 実行契約 REQ、case-revise は case-revise 実行契約 REQ、case-auto は case-auto 実行契約 REQ が所有し、Epic Issue を実行順序の SSoT とする実行モデルは Epic と Wave 実行モデル REQ が所有する。
      本 REQ は Case 状態モデル（Root Case の状態、意味、resume_command 契約）を所有する。

      変更後要件行:
      REQ-006-106 | Definition 保存内部責務は REQ 再構成 intake に加え自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること
      REQ-006-107 | Definition 保存内部責務は Design 保存時に自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること
      REQ-006-111 | Definition 保存内部責務の deviation capture ガードレールは deviation capture が Skill（agentdev-learning-capture または agentdev-intake-pipeline）への委譲である旨を明示すること。責務境界は変更せず、Design 副作用セクション（capture-boundaries.md）と整合すること

      適用範囲対象外変更後（該当行）:
      - case-open、case-run、case-close、case-ready、case-revise、case-auto の各実行契約（分割先 REQ）
  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-006
    target_area: "要件セクション末尾"
    source_items: [AG-004, AG-005]
    content: |
      role: case の Root Case は open、ready、running、blocked、review、closed、cancelled の状態を持つこと。open は Root Case 確立済み・Definition / execution contract 未確定・実行不可、ready は canonical Definition と execution contract が確定し実行可能、running は実行中、blocked は継続条件不足、review は実装完了・最終受入対象、closed は完了、cancelled は中止を意味すること。closed と cancelled は終端状態とすること
      case-run は ready からのみ実装を開始できること。blocked の発生元ごとに状態値を増やさないこと
      blocked の場合のみ Root Case に resume_command を保持し、停止解除後の正規再開入口を永続化すること。resume_command は通常状態への遷移時にクリアすること。新しい意味判断が必要な場合は req-define を指し、再合意済みで case-revise 自体の再開が必要な場合は case-revise を指せること
  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-008
    target_area: "目的、要件行 REQ-008-008・010・011・014・030・031・036・037・040・045・046・050、適用範囲（対象外 bullet を含む）"
    source_items: [AG-002, AG-006, AG-007, AG-012]
    content: |
      目的節変更後本文（該当文）:
      要件定義プロセス（req-define、Definition 保存内部責務）の実行契約は REQ-004 が所有し、本 REQ は当該プロセスが生み出し消費する一時成果物の契約を定義する。

      変更後要件行:
      REQ-008-008 | req_draft は req-define が生成し、direct consumer 集合 {case-open, case-ready, case-revise} が消費する、保存前の要件合意結果であること
      REQ-008-010 | RU は case-ready 成功後（Definition、execution contract、execution structure の必要情報の永続化後）にのみ削除されること
      REQ-008-011 | case-ready の blocked、failed、中断時は RU を .agentdev/backlog/req-units/ に残存させること
      REQ-008-014 | Definition 保存内部責務は RU パスを docs 永続文書の保存対象外とすること
      REQ-008-030 | req-define は artifact_actions の content について、当該action がCREATE/APPEND/UPDATE する本文範囲の、ID採番部分を除く変更後テキストを完全に確定すること。UPDATE で対象成果物全体の全文を複製することは要求しない。変更指示・要約のみの記述は不可（REQ-008-031 維持）。Design UPDATE は対象セクションの変更後全文（REQ-008-032/033 維持）。REQ UPDATE は変更後要件行の完全な本文。Definition 保存内部責務は content の適用のみを行い、意味的な文章生成・補完を行わないこと
      REQ-008-031 | Definition 保存内部責務は content を推論で生成、修正せず、ID 参照部分（new:{slug} 形式）のみ採番結果で置換すること
      REQ-008-036 | case-ready 成功後は Issue と Epic を SSoT（唯一の情報源）とし、req_draft は削除されてよい一時成果物となること。case-ready 成功後の case-auto、case-run、case-close は invalid post-case reader として req_draft を参照しないこと
      REQ-008-037 | case-ready 成功後の case-run、case-close、case-auto は Issue と Epic 側の永続状態を SSoT とすること
      REQ-008-040 | 各 OU は result セクションを持ち、case-open、case-ready が処理結果を書き戻す先とすること
      REQ-008-045 | Definition 保存内部責務は draft 全体の REQ、Decision 対象 artifact_actions を処理し、OU ID 指定なし、OU 複数件存在を理由に停止しないこと
      REQ-008-046 | Definition 保存内部責務の実行可否は work_type ではなく、REQ、Decision 対象 artifact_actions の有無で判断すること
      REQ-008-050 | req-define が生成し Definition 保存内部責務が保存する最終 REQ ファイルは、REQ 必須セクション（目的、要件、適用範囲）を維持すること

      適用範囲変更後: req_draft の停止条件と SSoT 遷移（case-ready 成功を境界とする Issue/Epic SSoT 化）、RU ライフサイクル（配置、case-ready 成功後の削除タイミング、失敗時残存、永続文書の根拠参照対象外、セッション由来 RU の自足性と採否確定済み要件）

      適用範囲対象外変更後（該当行）:
      - req-define、Definition 保存内部責務の実行プロセス、ユーザー合意形成プロセス（REQ-004）
  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-017
    target_area: "目的、要件行 REQ-017-001・002・004・005・008・009・010・011・012・013・015・016・017、適用範囲"
    source_items: [AG-006, AG-007, AG-010, AG-011]
    content: |
      目的節変更後本文（該当文）:
      case-ready と case-run の実行契約責務境界を所有する。
      case-ready は canonical Definition 確定後に合理的に確定可能な execution contract を完成させ、Issue を case-ready 成功後の後続工程に対する SSoT として引き渡す。
      case-run は execution contract を新規設計せず、既確定契約に基づく実装、実行時観測、検証を担当する。実装時に契約変更、scope 拡大が必要と判明した場合は blocked および req-define 再合意を経た case-revise 経路へ移行する。

      変更後要件行:
      REQ-017-001 | case-ready は canonical Definition の確定後に、対象範囲、変更対象成果物、関連 REQ/Decision/Design、完了条件（成果状態）、test strategy（3要素）、必須 artifact-specific quality control、scope-affecting impact candidate、ユーザー明示 review 発動契約、work_type/scale/Issue structure を execution contract として Issue 本文に確定すること
      REQ-017-002 | case-ready は機能要件、非機能要件、制約、対象外、受け入れ条件を新規作成せず、合意済み要件doc を execution contract の各要素へ投影すること
      REQ-017-004 | 変更予定成果物の種別から必須品質統制を導出できる場合、その適用要否を case-run に委ねず、case-ready が test strategy へ反映すること。artifact type と quality control の対応は個別 command に散在させず共通規則として管理すること
      REQ-017-005 | document、Skill、Command の各変更に対し、それぞれ文書品質査読能力、Skill 品質査読能力、Command 品質査読能力に相当する必須検証を case-ready が事前確定すること。同一成果物が複数能力を必要とする場合は全て展開すること
      REQ-017-008 | case-ready は関連 Decision の拘束条件を execution contract 確定前に特定し、必要な制約を完了条件または test strategy へ反映すること。case-run は既確定 Decision への適合を確認し、新たな拘束 Decision の必要性検出時は blocked とすること
      REQ-017-009 | Issue の予定変更内容から事前判定可能な追加検証条件（関数削除時の全利用箇所検査等）は case-ready が test strategy へ展開すること。case-run は記録済み test strategy を新規設計せず実行すること
      REQ-017-010 | case-ready は execution contract 確定前に変更影響候補を探索し、scope、完了条件、test strategy に影響する候補を execution contract へ反映すること。case-run は既存 scope 内の内部実装上の影響を処理可能とし、scope 拡大が必要な場合は blocked および req-define 再合意を経た case-revise 経路に移行すること
      REQ-017-011 | case-run は work_type/scale/Issue structure を再分類して実行契約または workflow を変更しないこと。metadata、構造、実態の矛盾検出時は停止または blocked を経由した正規再開経路（resume_command）を使用すること
      REQ-017-012 | ユーザー明示指定による adversarial-review 発動契約は case-ready が Issue 本文へ永続化すること。実装方針生成と review 実行は case-run/execution adapter の責務であり、case-run は一時会話コンテキストのみを根拠に新規発動契約を追加しないこと
      REQ-017-013 | case-ready が確定する execution contract は新規 Issue および新契約へ更新済み Issue から適用し、未更新の既存 Issue には遡及適用しないこと。新契約項目欠落のみを理由に legacy Issue を一律 blocked にしないこと。case-revise → case-ready による Definition 変更反映後は新 execution contract を適用すること
      REQ-017-015 | case-ready は runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）を事前確定しようとせず、これらを case-run の安全検査として維持すること
      REQ-017-016 | case-ready 成功後の case-run は req_draft を参照して不足契約を補完せず、Issue/Epic を SSoT として処理すること（REQ-008-036, 037 参照）
      REQ-017-017 | case-ready は draft-data の realization_actions を Issue / Epic の execution contract へ投影すること。case-ready 成功後は case-run が Issue 本文だけで変更責務、変更意図、検証方針を取得できること。case-run は realization_actions に記録済みの実現面の変更方針を再決定せず、その範囲内の内部実装方針（関数配置、命名、データ構造、実現順序、具体的 diff）だけを決定すること

      適用範囲変更後: case-ready の execution contract 確定責務（対象範囲、成果物、完了条件、test strategy、必須品質統制、impact candidate、review 発動契約、work_type/scale/Issue structure の投影）、case-run の execution contract 消費責務（契約実行、blocked 遷移、req-define 再合意を経た case-revise 経路連携、runtime-only 判断維持）
  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: REQ-021
    target_area: "要件行 REQ-021-012・013・023・024、適用範囲"
    source_items: [AG-002, AG-013]
    content: |
      変更後要件行:
      REQ-021-012 | Definition 保存内部責務は正式な要件IDの保存を担当し、実装対応または検証対応を作成する責務を持たないこと。新規要件の保存時点で実装対応または検証対応が存在しないことを理由に保存を失敗させないこと
      REQ-021-013 | Design 保存内部責務は、req-define で Design action と対象要件の対応が明示的に確定している場合、その情報を利用して Design 文書と要件の対応関係を保存できること。Design 本文の自由記述から対象要件を再推論して正規の対応関係を生成せず、Design action が存在しない要件の処理を妨げないこと
      REQ-021-023 | Definition 保存内部責務は、保存対象の新規 REQ または追加要件行のうち検証対応要否が未分類（検証対応宣言が存在せず、検証対応要否カタログにも未登録）の行を検出し、未分類行として保存結果に明示的に記録すること。未分類行の存在だけを理由として保存を失敗させないこと（REQ-021-012 と整合）
      REQ-021-024 | case-open は対象要件行に未分類の行が残る場合でも Root Case の確立を妨げないこと。case-ready は対象要件行に未分類の行が残る場合 ready への遷移を拒否し、検証対応要否の分類完了を実装着手前の必須条件として扱うこと

      適用範囲対象変更後: req-define、Definition 保存内部責務、case-open、case-ready、case-run、case-close / QG-4 のトレーサビリティ能力の利用・作成・検査の割り当て、検証手段と検証実行結果の分離、診断・レビュー系コマンド（inspect-docs、inspect-skills、backlog-review、agentdev-adversarial-review、agentdev-doc-diagnostics）の旧 Artifact Graph 利用の除去と独立探索手段への切替
  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: REQ-030
    target_area: "目的、要件セクション全体、適用範囲"
    source_items: [AG-006, AG-007, AG-008, AG-016]
    content: |
      目的節変更後本文:
      case-open の実行契約を所有する。
      合意済み要件doc からの Root Case 確立、Definition Package の生成、canonical Definition に実変更がある場合の Draft Definition PR 作成を扱う。
      execution contract の確定、Standard / Epic の最終確定、Child Issue・Wave の作成、RU 削除、proposed Decision の受理評価は case-ready 実行契約 REQ が所有する。
      マクロフェーズ構成と work_type 分類は REQ-005 が、execution contract の境界定義は REQ-017 が、Case 状態モデルは REQ-006 が所有し、本 REQ は case-open の実行オーケストレーションを所有する。

      変更後要件セクション全体:
      | REQ-030-001 | case-open は合意済み要件doc を入力とし Root Case を GitHub Issue として確立し対象 REQ 番号を埋め込むこと |
      | REQ-030-002 | case-open は canonical Definition に実変更がある場合のみ、Case 単位で一つの Draft Definition PR を作成すること。canonical Definition に実変更がない場合は Definition PR を作成しないこと |
      | REQ-030-003 | case-open は壁打ち済み内容を Definition Package として生成し Root Case に関連付けること（Definition Package の構成は Design） |
      | REQ-030-004 | case-open は機能要件、非機能要件、制約、対象外、受け入れ条件を新規に作成せず合意済み入力を反映すること |
      | REQ-030-005 | case-open は新規 Decision を proposed のままにし accepted への状態遷移を実行しないこと |
      | REQ-030-006 | case-open は要件が曖昧で Root Case を確立できない場合、停止すること |
      | REQ-030-007 | case-open は draft / RU を削除しないこと |
      | REQ-030-008 | case-open は execution contract を確定せず、Standard / Epic を最終確定せず、Child Issue、Wave を作成しないこと |
      | REQ-030-009 | Root Case 確立後の状態は open とし、実装開始を許可しないこと |
      | REQ-030-010 | case-open は再実行時、既存 Root Case および既存 Draft Definition PR を再利用し、不足分だけを処理して重複生成しないこと |
      | REQ-030-011 | case-open は自工程で実観測した deviation を Split Rule で分類して intake/learning のいずれかへ保存すること（case-close への capture 委譲は廃止） |

      適用範囲変更後:
      - 対象: case-open（Root Case 確立、REQ 番号埋め込み、Definition Package 生成、実変更時のみ Draft Definition PR 作成、冪等再実行、自工程 deviation capture）
      - 対象外: execution contract の確定、Standard / Epic の最終確定、Child Issue・Wave の作成、RU 削除、proposed Decision の受理評価（case-ready 実行契約 REQ）、マクロフェーズ構成と work_type 分類（REQ-005）、委譲時の判断と承認（REQ-003）、execution contract の境界定義（REQ-017）、Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）、Definition Package の構成詳細（Design）、harness 固有詳細の配布物からの除去一般原則（REQ-002）
  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: REQ-031
    target_area: "要件行 REQ-031-004・010・011"
    source_items: [AG-003, AG-005, AG-011]
    content: |
      変更後要件行:
      REQ-031-004 | case-run は既確定 execution contract（REQ-017 参照）に基づき実行し、実装中に新たな変更影響候補を発見した場合、既存 Issue scope 内で処理可能な内部実装上の影響は自律処理し、Issue scope、完了条件、REQ/Decision/Design、必須品質統制の追加変更が必要な場合は blocked とし、Root Case の resume_command による正規再開経路（新しい意味判断が必要な場合は req-define、再合意済みの場合は case-revise）に従うこと
      REQ-031-010 | case-run は staleness check で差異を検出した場合でも Issue 本文を単独で書き換えず、差異を報告して blocked とし、Root Case の resume_command による正規再開経路に従うこと
      REQ-031-011 | case-run は PR 対象ファイルに docs 変更を含む場合 docs 整合性検査を実行し結果を PR 本文に記録して case-close へ連携すること
  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: REQ-033
    target_area: "frontmatter（status: retired）、本文冒頭履歴注記、docs/requirements/retired/ 配置"
    source_items: [AG-003, AG-018]
    content: |
      frontmatter 変更後: status: retired を追加し、docs/requirements/retired/REQ-033.md へ配置する。

      本文冒頭履歴注記（変更後本文）:
      > 履歴注記（RETIRE、status: retired、2026-09-14）:
      >
      > - 後継: Definition / REQ / Decision / Design 変更は req-define → case-revise → case-ready 経路（case-revise 実行契約 REQ、case-ready 実行契約 REQ）。Case 固有状態・契約更新は所有する case-* workflow。汎用 Issue 操作は /agentdev/issue。低レベル Issue 更新は agentdev_gh.issue_update
      > - 理由: 公開ワークフローの状態遷移中心への再構成（Decision new:case-workflow-state-redesign）により、case-update は公開コマンド、Workflow Skill、専用テンプレート、専用 Design、専用経路を含め完全廃止する。deprecated alias、旧経路、移行用呼称は残さず、履歴は Git 履歴のみで保持する
  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: REQ-034
    target_area: "要件行 REQ-034-007・008・009・018・019・020・025・031、適用範囲"
    source_items: [AG-001, AG-014, AG-016]
    content: |
      変更後要件行:
      REQ-034-007 | case-auto は workflow 実装の権威情報源として Workflow Skill を参照すること。case-open、case-ready、case-close を各 command の委譲契約に従ってサブエージェントへ委譲し、Command 定義（case-auto.md）は公開interface / dispatch のみを所有し、workflow 実装本体を複製しないこと
      REQ-034-008 | case-auto は case-run をインライン実行する。インライン実行の読込主体は case-auto 自身であり、case-run の Workflow Skill（agentdev-workflow-case-run）を権威情報源として読み込む（起動手段は harness 責務）。Command 定義（case-run.md）は公開 interface / dispatch のみを所有し、workflow 実装本体を複製しないこと。case-auto は下位 workflow（case-open / case-ready / case-revise / case-run / case-close）の契約確定後に上位 orchestrator として再設計すること。public contract（入出力契約、副作用、安全性、承認境界、stop state、ordering contract）の正規文書は Command Design（docs/designs/commands/*.md）であり、Command 定義（src/opencode/commands/agentdev/*.md）はその実行時投影である。両者不一致時は Command Design を正とする（docs/designs/foundations/system.md の Workflow Architecture Inventory と整合）
      REQ-034-009 | case-auto は case-open / case-ready / case-close の各工程を委譲先 subagent へ委譲する。委譲先 subagent は各工程の Workflow Skill を権威情報源として読み込み、工程固有手続きの再実装を回避する。Command 定義は公開 interface / dispatch のみを所有し、workflow 実装の権威情報源とはならない。case-auto は下位 workflow 詳細処理を複製しない上位 orchestrator 化すること。public contract（入出力契約、副作用、安全性、承認境界、stop state、ordering contract）の正規文書は Command Design（docs/designs/commands/*.md）であり、Command 定義（src/opencode/commands/agentdev/*.md）はその実行時投影である。両者不一致時は Command Design を正とする（docs/designs/foundations/system.md の Workflow Architecture Inventory と整合）
      REQ-034-018 | case-auto は case-ready が確定した Epic、Wave、Issue 構造に従って進行すること
      REQ-034-019 | case-auto は case-open 前だけ req_draft を orchestration pre-reader として読み、case-ready 成功後は invalid post-case reader として req_draft を読まないこと。case-ready 成功後の停止、再開、完了処理は Issue と Epic だけで成立させること
      REQ-034-020 | case-auto は case-ready 完了後にクリーンアップ検証ゲート（ドラフト残存、RU 残存の検証）を実行し残存を検出した場合停止すること
      REQ-034-025 | case-auto は orchestration stage モデル（stage 1 case-open・case-ready 順次、stage 2 case-run 並列、stage 3 case-close 順次）を採用し各 orchestration stage を前 stage 完了後に開始するとともに case-run internal lifecycle（state machine、self-healing loop 等）を複製せず case-run 側の正規所有に委譲すること
      REQ-034-031 | case-auto は、次の4状態を区別して集約・報告すること。(1) 各工程の実行結果（pass / warn / fail）(2) 各 artifact_action の適用結果（applied / skipped / failed / no-op）(3) 定義適用工程の完了状態（case-ready の Definition 保存・確定の成否）(4) OU ライフサイクルの完了状態（Issue 作成 / PR 作成 / PR マージ / Issue クローズ）。warn であっても全必須 action が applied または正当な no-op なら「警告付き工程完了」とできる。必須 action に skipped または failed が1件以上ある場合は「定義適用完了」と報告しないこと。warn を pass へ変換して集約しないこと。定義適用工程が成功していても OU ライフサイクルが完了していなければ OU 完了と報告しないこと。Phase 0 成功（artifact_actions 適用完了）と OU 完了（Issue/PR/Case 完了）は別々に報告すること

      適用範囲対象変更後: case-auto（追加入口、入力解決、artifact_actions 工程決定、自走対象と対象外、構成工程委譲と case-run インライン実行、operation_unit キュー管理、execution_unit 並列実行、Wave 間直列、blocked 部分停止、永続状態進行と再開、クリーンアップ検証ゲート、停止理由分類と再開コマンド報告、壁時計時間計測、orchestration stage モデル、4状態区別報告、background task 回復、コンフリクトエスカレーション、bounded parent decision resolution）
  - id: ACT-REQ-013
    artifact: req
    operation: append
    target: REQ-034
    target_area: "要件セクション末尾"
    source_items: [AG-014]
    content: |
      case-auto は case-open → case-ready → case-run → case-close を自動継続し、req-define で再合意済みの Definition 変更がある場合は case-revise → case-ready → case-run → case-close を自動継続すること
      case-auto は新しい意味判断が必要となった場合 blocked とし resume_command: req-define で停止すること。req-define の壁打ちを自動化しないこと
  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: REQ-035
    target_area: "目的、要件セクション末尾（3行追加）、適用範囲"
    source_items: [AG-007, AG-010, AG-016]
    content: |
      目的節変更後本文（該当文）:
      Wave 構成の生成は case-ready 実行契約 REQ が、Epic 進捗追跡テーブルの更新手続きは agentdev-epic-tracker が所有する。

      追加要件行:
      Epic Case では Root Case を Case 全体、Definition 参照、対象範囲、全体制約、Issue 分解、Wave / 依存関係、全体進捗の orchestration SSoT とし、各 Child Issue を各 case-run が消費する execution contract の execution SSoT とすること
      各 Child Issue は親 Root Case の自由記述に依存せず、その Issue 単独で対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy を取得できること
      Standard Case では Root Case 自身を単一 execution unit とし、儀式的な Child Issue を作成しないこと

      適用範囲変更後（該当行）:
      - 対象: Epic と Wave モデル（Epic Issue を実行順序 SSoT とするオーケストレーション、子 Issue 実行状態ライフサイクル、Wave 状態の Issue 状態導出、execution_unit 定義、単一書き手排他制御、別 Epic 分割許容、コンフリクト解消モデル、Wave 構成時の変更対象ファイル重複の前置検出モデル（Wave 構成の生成手順は case-ready 実行契約 REQ が所有））
      - 対象外: Wave 構成の生成（case-ready 実行契約 REQ）、Epic 進捗追跡テーブル更新手続き（agentdev-epic-tracker、Design）、execution_unit 並列モデルの内部パラメータとコンフリクト解消レベルの詳細手順（Design）、処理単位の一級概念定義（Decision「ADF決定論的実行中核と実行基盤実行機構の責務分界」、REQ-011）
  - id: ACT-REQ-015
    artifact: req
    operation: create
    target: new:case-ready-execution-contract
    source_items: [AG-007, AG-008, AG-010, AG-012, AG-013, AG-016]
    content: |
      目的:
      case-ready の実行契約を所有する。
      Definition の受入（Draft Definition PR の忠実性確認、自動確定・merge、HITL 停止）、canonical Definition の再取得、合意済み新規 Decision の accepted 遷移、execution contract と実行構造の確定（Standard / Epic 確定、Child Issue と Wave / 依存構造の作成を含む）、検証対応要否の最終ゲート、実行準備完了（ready 遷移）、draft / RU の削除を扱う。
      REQ / Decision / Design の保存実体は Capability Skill（req-file-manager、decision-file-manager、design-file-manager、artifact-validation）への委譲とし、case-ready は Definition 確定境界として単一責務を保つ。
      マクロフェーズ構成は REQ-005 が、Case 状態モデルは REQ-006 が、execution contract の境界定義は REQ-017 が、Epic/Wave 実行モデルの実行規則は Epic と Wave 実行モデル REQ が所有し、本 REQ は case-ready の実行オーケストレーションを所有する。

      要件:
      | case-ready は Definition PR が存在する場合、req-define で合意済みの意味内容に対する忠実な投影であること、整合性、必要な品質検査を確認すること |
      | case-ready は新しい意味判断を必要としない場合、追加の人間承認を要求せず Definition PR を自動的に確定・merge すること |
      | case-ready は新しい Decision、意味変更、対象範囲拡大、意味的な不整合解消等が必要な場合は停止し HITL とすること |
      | case-ready は Definition 確定後に canonical Definition を再取得し、それを基準として後続処理を行うこと。Definition PR merge 後に後続処理が失敗した場合、merge を巻き戻さず canonical Definition を基準として再開すること |
      | case-ready は req-define での採用合意済みの新規 Decision を proposed から accepted へ遷移させること |
      | case-ready は canonical Definition 確定後に execution contract を確定すること（REQ-017 参照） |
      | case-ready は canonical Definition 確定後に Standard / Epic を確定すること。Standard の場合 Root Case 自身を単一 execution unit とし、Epic の場合 Child Issue を作成し Root Case に Wave / 依存構造を確定すること |
      | case-ready は依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度、Epic サイズ、機能的一貫性の3軸で最終 Issue 構成を自律生成し複数 Standard、複数 Epic、混在のいずれも作成できること |
      | case-ready は単独根（1 operation_unit だけの連結成分）を Epic 化せず Standard flow として扱うこと |
      | case-ready は Epic サイズ上限と Wave 同時実行上限を実行安全境界として遵守すること（数値の詳細は Design） |
      | case-ready は無関係な operation_unit 群を単一 Epic へ機械的に集約しないこと |
      | case-ready は Epic 構成推論の根拠を Epic Issue 本文に記録すること |
      | case-ready は Epic Issue 本文の Wave テーブルに各子 Issue の実行方法（並列、直列）を技術的依存関係に基づいて明記すること |
      | case-ready は Epic 分解時に既存オープン Issue とのスコープ重複を検知し重複する子 Issue 生成をスキップまたはユーザー確認すること |
      | case-ready は完了条件と事前状態の記載を識別子中心とし変動しやすい実測値スナップショットは補助値とすること |
      | case-ready は完了条件を Issue 本文に展開する前に最新状態を再確認し差異がある場合は最新状態を優先すること |
      | case-ready は Issue 本文をファイル経由で扱い Markdown 行構造を保持すること（詳細は Design） |
      | case-ready は構成確定後かつ GitHub Issue 作成前に構成検証（上限、依存維持、全割当）を実行し上限超過または構成不備を検出した場合停止すること |
      | case-ready は Wave 構成時に同一 Wave 候補の子 Issue 間で変更対象ファイル集合の重複をファイル単位で前置検出し、重複時の処置（Wave 分離・変更対象分割・重複許容）を Wave 構成の判断として確定すること。比較対象の変更対象集合が取得不能またはファイル粒度に展開不能な子 Issue がある場合は比較を省略せず検出不能として報告すること |
      | case-ready は canonical Definition 確定前に、対象 REQ が Decision frontmatter の関連REQ宣言（related_reqs）に含まれ、かつ status が proposed の Decision を評価対象として特定すること。特定は正規情報源のみを用い、本文の意味・文字列類似・周辺参照等の意味推測で補完しないこと。評価対象が 0 件の場合は処理を継続できること |
      | case-ready は評価対象の各 proposed Decision について受理可否を評価し、req-define での合意内容と現行 REQ・Design・実装の状態から一意に確定できる場合は既存ライフサイクル規則と承認記録形式に従って accepted への状態遷移を実行してから処理を継続すること。一意に確定できない場合はユーザー判断を求め、受理不能または判断情報が不足する場合は proposed のまま ready へ遷移せず停止理由を報告すること |
      | case-ready は Decision 状態評価の再実行時に、既に accepted へ遷移済みの Decision に対して重複する状態遷移や承認記録を生成しないこと |
      | case-ready は検証対応要否の未分類がないことを確認し、対象要件行に未分類が残る場合は ready へ遷移させないこと |
      | case-ready は実行準備条件を満たした場合のみ Root Case を ready に遷移させること |
      | case-ready は成功後に draft / RU を削除すること。blocked、failed、中断した場合は draft / RU を保持すること |
      | case-ready は draft / RU 削除後に main ブランチの作業ディレクトリとリモートの同期を確認し、不一致を検出した場合停止すること |
      | case-ready は再実行時、merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造を再利用し、不足分だけを処理すること（Root Case、Definition PR、Child Issue、Wave / 依存関係、Decision の受理記録を重複生成しない） |
      | case-ready は Definition PR の CI / 品質検査失敗時は ready へ遷移せず、既存 PR を保持したまま再実行可能であること |

      適用範囲:
      - 対象: case-ready（Definition 受入と自動確定・merge、HITL 停止条件、canonical Definition 再取得、Decision accepted 遷移と冪等、execution contract 確定、Standard / Epic 確定と Child Issue・Wave・依存構造の自律生成、連結成分と3軸判断、スコープ重複検知、構成検証、検証対応要否最終ゲート、ready 遷移、draft / RU 削除、冪等再実行）
      - 対象外: マクロフェーズ構成と work_type 分類（REQ-005）、Case 状態モデルの値域と resume_command 契約（REQ-006）、execution contract の境界定義（REQ-017）、Epic/Wave 実行モデルの実行規則（Epic と Wave 実行モデル REQ）、Epic サイズ上限等の数値、Definition Package の構成、Definition PR のブランチ規則と冪等検索キー（Design）、保存実体の手続き（Capability Skill Design）
  - id: ACT-REQ-016
    artifact: req
    operation: create
    target: new:case-revise-execution-contract
    source_items: [AG-003, AG-011, AG-018]
    content: |
      目的:
      case-revise の実行契約を所有する。
      req-define で再合意済みの Definition 変更の既存 Case への反映、Definition Amendment PR の作成、影響再評価を扱う。
      case-revise は新しい要求、Decision、対象範囲を自身では決定しない（意味判断は req-define が所有する）。
      Definition 変更後の execution contract / execution structure の再確定は case-ready 実行契約 REQ が所有する。
      マクロフェーズ構成は REQ-005 が、Case 状態モデルは REQ-006 が所有し、本 REQ は case-revise の実行オーケストレーションを所有する。

      要件:
      | case-revise は req-define で再合意済みの Definition 変更を既存 Case へ反映する状態遷移を所有すること |
      | case-revise は新しい要求、Decision、対象範囲を自身では決定しないこと（意味判断は req-define が所有） |
      | case-revise は canonical Definition に実変更がある場合のみ Definition Amendment PR を作成すること。実変更がなければ Amendment PR を作成せず、execution contract / execution structure の再確定は case-ready が行うこと |
      | case-revise は Epic の一部 Child Issue が完了済みの場合、Definition 変更の影響がある Issue のみを再評価対象とし、影響なしと確認できた完了済み Issue を巻き戻さないこと |
      | case-revise は再実行時、同じ再合意内容に対応する既存 Definition Amendment PR を重複生成しないこと |
      | case-revise 完了後の execution contract / execution structure 再確定は case-ready を経由すること。case-revise 専用の Case 状態は追加しないこと |
      | case-revise は Case 関連 Issue 本文を更新する際、作成時のテンプレート構造と必須セクションを維持すること |
      | case-revise は中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束すること |

      適用範囲:
      - 対象: case-revise（再合意済み Definition 変更の反映、実変更時のみ Amendment PR 作成、影響ある Issue のみ再評価、完了済み Issue 維持、冪等再実行、case-ready 経由の再確定、Issue 本文更新時のテンプレート構造維持）
      - 対象外: Definition の意味判断・再合意（req-define）、execution contract / execution structure の再確定（case-ready 実行契約 REQ）、Case 状態モデル（REQ-006）、Definition Amendment PR のブランチ規則と冪等検索キー（Design）
  - id: ACT-REQ-017
    artifact: req
    operation: update
    target: REQ-027
    target_area: "目的、要件行 REQ-027-003、適用範囲"
    source_items: [AG-001, AG-002]
    content: |
      変更後本文（目的・REQ-027-003・適用範囲共通の代表ケース列挙）:
      代表ケース（case-run / case-auto・req-define・case-open / case-ready・case-revise・intake-promote）で新workflow モデルの妥当性を検証する。

      REQ-027-003 変更後:
      REQ-027-003 | 代表ケース（case-run / case-auto・req-define・case-open / case-ready・case-revise・intake-promote）で新workflow モデルの妥当性を検証すること。検証結果を pass / fail / blocked / not applicable で記録すること。capture-only型（capture・learning 等）・read-only-diagnostic型（inspect-docs・inspect-skills 等）は STEP model 対象外（resume point / export / import を持たない）とし、代表ケースから除外すること |

      適用範囲対象変更後（該当行）:
      - 代表ケース（case-run / case-auto・req-define・case-open / case-ready・case-revise・intake-promote）での新workflow モデル妥当性検証と検証結果の pass / fail / blocked / not applicable 記録
  - id: ACT-REQ-018
    artifact: req
    operation: update
    target: REQ-041
    target_area: "適用範囲"
    source_items: [AG-001, AG-002, AG-014]
    content: |
      適用範囲対象変更後（該当行）:
      - req-define、case-open / case-ready を経由した GitHub Issue / PR 作成までの自動化
  - id: ACT-REQ-019
    artifact: req
    operation: update
    target: REQ-057
    target_area: "要件行 REQ-057-018"
    source_items: [AG-002]
    content: |
      変更後要件行:
      REQ-057-018 | REQ 行 append を伴う Definition 保存内部責務の実行手順は AUTOGEN 対象索引の同 commit 再生成を前置として保持する。checker-execution-contracts は工程連動再生成前置と AG-009(a)（既存対応計画 ID）領域との整合注記を持つ |
  - id: ACT-REQ-020
    artifact: req
    operation: update
    target: REQ-059
    target_area: "要件行 REQ-059-004、適用範囲"
    source_items: [AG-002, AG-008]
    content: |
      変更後要件行:
      REQ-059-004 | Definition 保存内部責務は Decision 作成時に要件doc（draft-data）で確定した関連 REQ を当該フィールドへ保存すること |

      適用範囲対象変更後（該当行）:
      - **対象**: Decision frontmatter の関連REQ宣言、Decision 索引の関連REQ表の自動生成、未宣言検出、Definition 保存内部責務での保存
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:case-workflow-state-redesign
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-011]
    content: |
      タイトル案: 公開ワークフローの状態遷移中心再構成と Definition 確定境界の導入

      コンテキスト:
      現行の req/case ワークフローでは、要件・Decision・Design の保存（req-save / design-save）、Case Issue 作成（case-open）、実行契約確定、Issue 更新（case-update）が成果物種別・操作種別を境界とした公開コマンドとして分散している。case-open は Issue 作成に加えて Decision 受理、実行契約確定、Epic / Wave / Child Issue 構成まで担い、Case を開始する責務と実行準備を完了する責務が混在していた。Case 作成後に実装開始可能になる状態が明示されず、Definition 変更の正規経路も Definition の確定方法と一貫していなかった。

      決定:
      公開ワークフローは成果物種別ではなく、外部から意味のある状態遷移を所有する。標準フローを req-define → case-open → case-ready → case-run → case-close とする。req-save、design-save を公開コマンドから廃止し、保存能力を case-ready / case-revise の内部責務（Capability Skill 委譲）として維持する。case-update を完全廃止し、Definition 変更経路を case-revise として再実装する（新しい意味判断は req-define に戻す）。case-ready を Definition 確定境界として新設し、Definition Package を Draft Definition PR として集約、canonical Definition 確定後に execution contract と実行構造を確定して Root Case を ready へ遷移させる。Case 状態モデル（open / ready / running / blocked / review / closed / cancelled）を導入し、blocked 時の正規再開入口を Root Case の resume_command として永続化する。構成アルゴリズム（Epic / Wave / Child Issue 生成）、RU 削除、Decision 受理評価、検証対応要否の最終ゲートを case-open から case-ready へ移動する。

      帰結:
      公開コマンドは状態遷移単位で整理され、case-open は Root Case 確立に、case-ready は Definition 受入と実行準備完了に、それぞれ単一責務を持つ。Definition 変更がない Case では不要な保存工程や空の PR を作らない。GitHub backend と local backend は Definition の「未確定 → 確定」、Case の open → ready という同じ上位意味論を提供し、物理表現は backend Design が所有する。req-save / design-save / case-update の公開導線、テンプレート、Design、routing、README / glossary 参照は現行体系から除去され、deprecated alias を残さない。既存 DEC-010（3層分化）、DEC-020（GitHub Issue 共通管理単位）、DEC-008（bounded parent decision resolution）、DEC-003（req_draft ソフトコントラクト）、DEC-026（realization_actions）は維持され、本 Decision と補完的に機能する。
  - id: ACT-DES-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: commands
      slug: case-ready
    source_items: [AG-007, AG-008, AG-010, AG-012, AG-013]
    content: |
      # case-ready Command Design

      ## 目的

      case-ready の公開契約（入出力、副作用、安全性、承認境界、停止条件、順序契約）を定義する。case-ready は Definition の受入と実行準備完了への状態遷移を所有する主フローコマンドである（REQ new:case-ready-execution-contract）。

      ## 公開 interface

      - 入力: Root Case（Issue 番号または URL）、関連する req_draft（存在する場合）、Draft Definition PR（存在する場合）
      - 出力: ready 状態の Root Case、確定済み execution contract、実行構造（Standard は Root Case 単一 execution unit、Epic は Child Issue と Wave / 依存構造）
      - 副作用: Definition PR の merge、REQ / Decision / Design の保存（Capability Skill 委譲）、Decision の accepted 遷移、Child Issue / Wave の作成、draft / RU の削除、Root Case の ready 遷移

      ## 内部構成

      - Definition 受入: Draft Definition PR の忠実性確認（req-define 合意内容との投影検査）、整合性検査、品質検査。新しい意味判断が不要な場合は追加承認なしで自動確定・merge。新しい Decision、意味変更、対象範囲拡大、意味的不整合の解消が必要な場合は停止し HITL とする
      - 保存実体: REQ / Decision / Design の保存は req-file-manager、decision-file-manager、design-file-manager、artifact-validation へ委譲する。case-ready 自身は保存手続きを実装しない
      - canonical 再取得: merge 後に canonical Definition を再取得し、以降の処理基準とする
      - 実行構造確定: 連結成分、3軸判断、単独根の Standard 化、上限遵守、構成検証、Wave ファイル重複前置検出（詳細は epic-wave-model Design）
      - 検証対応要否ゲート: 未分類行残存時は ready へ遷移させない
      - クリーンアップ: 成功後に draft / RU を削除する（blocked / failed / 中断時は保持）

      ## 停止条件

      - Definition PR の CI / 品質検査失敗（ready 不遷移、既存 PR 保持で再実行可能）
      - 新しい意味判断が必要（HITL）
      - 構成検証の上限超過または構成不備
      - proposed Decision の受理が一意に確定できない（proposed のまま ready 不遷移）

      ## 冪等性

      再実行時は merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分のみ処理する。merge は巻き戻さない。
  - id: ACT-DES-002
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: commands
      slug: case-revise
    source_items: [AG-003, AG-011, AG-018]
    content: |
      # case-revise Command Design

      ## 目的

      case-revise の公開契約を定義する。case-revise は req-define で再合意済みの Definition 変更を既存 Case へ反映する主フローの例外経路コマンドである（REQ new:case-revise-execution-contract）。

      ## 公開 interface

      - 入力: Root Case、req-define で再合意済みの差分（draft）
      - 出力: Definition Amendment PR（canonical Definition に実変更がある場合のみ）、case-ready への引き継ぎ
      - 副作用: Definition Amendment PR の作成、影響ある Issue の再評価マーキング

      ## 内部構成

      - 実変更判定: canonical Definition との差分比較で実変更の有無を判定する。実変更がなければ Amendment PR を作成せず case-ready へ移行する（空の Amendment PR を作らない）
      - 影響再評価: Definition 変更の影響がある Issue のみを再評価対象とする。影響なしと確認できた完了済み Issue は維持する
      - 再確定の委譲: execution contract / execution structure の再確定は case-ready が行う（case-revise 完了後は case-ready を経由）

      ## 停止条件

      - 再合意済みでない変更の反映要求（req-define へ差し戻し）
      - 同一再合意内容に対応する既存 Amendment PR の検出（重複生成禁止、既存 PR を再利用）

      ## 冪等性

      同じ再合意内容に対応する既存 Amendment PR を重複生成しない。中断済み成果物は巻き戻さない。
  - id: ACT-DES-003
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: workflows
      slug: definition-readiness
    source_items: [AG-006, AG-007, AG-011, AG-015, AG-016]
    content: |
      # Definition Readiness Design

      ## 目的

      Definition Package、Draft Definition PR / Definition Amendment PR の lifecycle、canonical Definition の判定、冪等キー、backend 意味論の物理写像を定義する（REQ-030、REQ new:case-ready-execution-contract、REQ new:case-revise-execution-contract）。

      ## Definition Package

      - 構成: 要件行（REQ 変更後本文）、Decision、Design、Issue 構成案（operation_units、case_open_hints 由来）、受入条件一式を Case 単位で集約したパッケージ
      - 生成: case-open が req_draft から生成し Root Case に関連付ける
      - 索引・補助メタデータの具体形式は本 Design の管理下（draft の対象外）

      ## Definition PR lifecycle

      - Draft Definition PR: canonical Definition に実変更がある場合のみ case-open が Case 単位で 1 件作成する。実変更のない Case（bugfix / maintenance / docs_chore 等、REQ-005-007 系）では作成しない
      - Definition Amendment PR: case-revise が再合議済みの実変更がある場合のみ作成する
      - 確定: case-ready が忠実性・整合性・品質検査を確認し、新しい意味判断が不要な場合追加承認なしで merge する
      - merge 後: merge を巻き戻さず、canonical Definition を基準に再開する

      ## canonical Definition の判定

      - canonical: merge 済み main の docs 永続文書（REQ / Decision / Design）と Issue / Epic 構造の確定状態
      - 実変更判定: canonical との差分が空の場合は Definition PR / Amendment PR を作成しない

      ## 冪等キー

      - Root Case、Definition PR、Amendment PR、Child Issue、Wave / 依存関係、Decision 受理記録の重複生成検出に使う内部検索キー（識別子、関連付け、時点情報の組）は本 Design の管理下とする

      ## backend 意味論の物理写像

      - GitHub backend: Draft Definition PR / Definition Amendment PR を使用する
      - local backend: Definition の「未確定 → 確定」を同等に表現する PR 相当状態（ローカルIssue のマージ結果セクション等への写像）、ファイル配置、内部写像は本 Design と local-case-file Design が所有する。上位 command / workflow は物理表現を直接判別しない
  - id: ACT-DES-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: "パイプライン概要、コマンド分類、フェーズ定義（マクロフェーズ）、SSoT 遷移規則（draft の位置づけ）、コマンド I/O 契約（参照フロー表）、case-auto 構成工程委譲"
    source_items: [AG-001, AG-002, AG-003, AG-017]
    content: |
      ## パイプライン概要（変更後セクション全文）

      AgentDevFlow は 3 つのパイプラインで構成される:

      | パイプライン | コマンド | 目的 |
      |---|---|---|
      | req/case | req-define → case-open → case-ready → case-run → case-close（Definition 変更時は req-define → case-revise → case-ready 例外経路） | 要件定義から実装完了まで |
      | learning | learning-capture → learning-promote | 学びの蓄積、昇華 |
      | intake | intake-capture / intake-from-github → intake-promote | 改善候補の収集、昇華 |

      ## コマンド分類（変更後セクション全文）

      AgentDevFlow の公開コマンドは以下の5分類のいずれかに属する（REQ-005）。

      | 分類 | コマンド | 目的 |
      |---|---|---|
      | 主フロー | req-define → case-open → case-ready → case-run → case-close（例外経路: req-define → case-revise → case-ready） | 要件定義から実装完了までの標準ワークフロー |
      | 最大自走入口 | case-auto, backlog-auto | 追加入口。case-auto は req-define 完了後の後続工程を一括自走、backlog-auto は backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行。標準フローを置換しない（REQ-005-010、REQ-005-011） |
      | 補助フロー | intake-capture, intake-from-github, intake-promote, learning-promote, backlog-review | 改善候補収集、学び蓄積、RU化。主フローを補完 |
      | 検出フロー | inspect-docs, inspect-skills, inspect-promote | 文書、スキルの意味検出、分類、昇格 |
      | リポジトリローカル検査 | /repo/docs-check | AgentDevFlow 本体リポジトリ内の機械的整合性検査 |

      - case-auto は標準フロー（case-open → case-ready → case-run → case-close）を内部的に呼び出す追加入口であり、標準フローを置換、廃止しない。REQ / Decision / Design の保存は case-ready 内部の保存内部責務（Capability Skill 委譲）が実行する。
      - backlog-auto は標準の backlog 整理フロー（inspect-docs、昇格3系統、backlog-review の個別コマンド逐次実行）を置換しない追加入口であり、backlog 整理サイクル（inspect-docs → 昇格3系統（learning-promote、intake-promote、inspect-promote）→ backlog-review）を1回起動で実行する（REQ-005-011、REQ-041）。
      - 補助フロー、検出フロー、リポジトリローカル検査は、主フロー、最大自走入口とは独立して実行可能である。
      - 検出フローの出力（検出事項: inspect finding）は、inspect-promote → backlog-review を経て RU 化され、req-define の入力となる。

      ## マクロフェーズ（変更後セクション全文）

      開発ワークフローを3つのマクロフェーズで定義する。新しいマクロフェーズは追加しない。

      | マクロフェーズ | 定義 | 対応 Case 状態 |
      |---|---|---|
      | 壁打ち | 要件定義、分析、合意形成 | （Case 確立前） |
      | 構造的実行 | Root Case 確立後の Definition 確定、実行準備、実装、進捗管理 | open → ready → running |
      | レビュー完了 | 実装完了後のレビュー、マージ、完了処理 | review → closed |

      ## draft の位置づけ（変更後セクション全文）

      draft（`.agentdev/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文である。

      - ライフサイクル: `draft`（req-define完了）→ Definition Package 生成（case-open完了、保持）→ 削除（case-ready成功）
      - case-ready 成功後: draft は存在しない（case-ready 成功時に削除）。RU も case-ready 成功後に削除される
      - case-ready が blocked / failed / 中断した場合: draft / RU は保持される

      ## 参照フロー（共通）（変更後セクション全文）

      | コマンド | specs | Decision | REQ | finding | learning | intake | integrity |
      |---|---|---|---|---|---|---|---|
      | `/agentdev/req-define` | - || READ | READ（明示入力時） | - || - |
      | `/agentdev/case-open` | READ | READ | READ | - || - ||
      | `/agentdev/case-ready` | WRITE | WRITE | WRITE | WRITE（SPLIT検出時） | - || - |
      | `/agentdev/case-revise` | WRITE | WRITE | WRITE | - || - ||
      | `/agentdev/case-run` | READ+WRITE | READ | READ | - || - ||
      | `/agentdev/case-close` | - || READ | - | WRITE（capture） | WRITE（capture） | - |
      | `/agentdev/case-auto` | READ+WRITE | READ+WRITE | READ+WRITE | - | WRITE（capture） | WRITE（capture） | - |

      ## case-auto 構成工程委譲（変更後該当段落）

      case-auto は構成工程（case-open、case-ready、case-revise（req-define で再合意済みの Definition 変更がある場合）、case-close）を各工程の Workflow Skill を権威情報源とする委譲起動で実行する。
      case-auto 本体は薄いオーケストレータに専念し、入力解決、工程分岐、工程間状態引き継ぎ、停止条件検出、完了報告、OU と子Issue ループ制御、クリーンアップ検証ゲートのみを保持し、工程内部ロジックを実行しない。
  - id: ACT-DES-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: epic-wave-model
    target_area: "OU / Epic / Wave / Issue 階層、execution_unit 定義、子Issue 実行状態 enum の注記、case-open 構成生成基準"
    source_items: [AG-007, AG-010, AG-016]
    content: |
      ## OU / Epic / Wave / Issue 階層（変更後セクション全文）

      ```text
      OU (Operation Unit):
        要件変更の処理単位。req-define / backlog-review 由来。
        実装順序やIssue分解そのものではない。

      Epic:
        case-ready が canonical Definition 確定後に OU を実行可能にするために作る上位 Issue。
        大きな OU を複数 Issue で処理する必要がある場合に作成。
        子 Issue 全体の進捗 SSoT を持つ。

      Wave:
          Epic 内の実行段階。case-ready が技術的依存関係から作成。
          Wave 内 Issue は同じ前提条件のもとで実行可能。
          Wave 間には順序がある。

      Issue:
        case-run が1回で扱う最小実装単位。
        サブエージェント委譲の単位。PR作成・検証・case-close の単位。
      ```

      階層パターン（2階層化、Epic は常に Wave 構造を持つ）:

      | 規模 | 構成 |
      |------|------|
      | 単一 Issue | OU → Issue（Root Case が単一 execution unit） |
      | 複数 Issue | OU → Epic → Wave → Issue |

      Epic は常に Wave 構造を持つ。
      依存関係がない場合は Wave 1 に全 Issue をまとめる。

      ## execution_unit 定義（REQ-035-006）（変更後セクション全文）

      **execution_unit** は case-ready が canonical Definition 確定後に OU 群から生成する実行単位であり、`standard issue` または `epic issue` のいずれかである。
      Wave は execution_unit に含まず、Epic Issue 本文から読み取る内部構造として扱う。

      | execution_unit | 内部構造 | 実行契約 |
      |---|---|---|
      | standard issue | 単一 Issue、Wave なし | case-run / case-close が単一 Issue を処理（REQ-031-006） |
      | epic issue | Wave 構造を持つ | case-run(#epic) / case-close(#epic) が Wave 反復で処理 |

      case-auto は複数 execution_unit 群を orchestration の対象とする（REQ-034-018）。
      execution_unit 間の並列可否は連結成分（必須依存のみをエッジとする）で判定する。
      詳細は後述「連結成分ベース execution_unit 構成モデル」セクション参照。

      ## 子Issue 実行状態 enum への注記（追加）

      子Issue 実行状態の `ready` / `running` は case-run(#epic) の内部状態であり永続状態に書き込まれない。Root Case（role: case）の status 値域における `ready`（canonical Definition と execution contract が確定し実行可能な永続状態、REQ-006 参照）とは別概念である。両者を混同しない。

      ## case-ready 構成生成基準（旧 case-open 構成生成基準、変更後セクション全文）

      case-ready は canonical Definition 確定後に要件doc の operation_units を読み取り、以下を自律生成する:

      - Epic 要否判定（単一 Issue で完結する場合は Epic を作成しない。Standard では Root Case 自身を単一 execution unit とする）
      - Issue 分解（OU を実装可能なサイズに分割）
      - 依存関係設定（技術的依存に基づく Wave 構成）
      - 初期 status 付与（原則 `pending`）

      **停止条件**: 要件が曖昧で Issue 構造を生成できない場合、operation_units の要件に矛盾が含まれる場合

      **禁止事項**:
      - 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成
      - 実装順序、Issue分解についてのユーザー確認要求

      詳細は `docs/designs/commands/case-ready.md` 参照。
  - id: ACT-DES-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: "共通メタデータ（YAML 前書き）、status 値域（role: case）、状態遷移表（role: case）"
    source_items: [AG-004, AG-005, AG-015]
    content: |
      ## 共通メタデータ（YAML 前書き）（変更後: role: case の条件付きフィールド追記）

      role: case のローカルIssueは次の条件付きフィールドを持つ:

      | フィールド | 型 | 必須/任意 | 値域、制約 |
      |---|---|---|---|
      | `resume_command` | 文字列または空 | 条件付き必須 | status が `blocked` の場合のみ値を持つ。`req-define` / `case-revise` / `case-ready` / `case-run` / `case-close` のいずれか。通常状態への遷移時にクリアする（REQ-006 参照） |

      ## status 値域（role: case）（変更後セクション全文）

      | status | 意味 | 終端状態 |
      |---|---|---|
      | `open` | Root Case 確立済み、Definition / execution contract 未確定、実行不可 | いいえ |
      | `ready` | canonical Definition と execution contract が確定し実行可能 | いいえ |
      | `running` | 実行中 | いいえ |
      | `blocked` | 継続条件不足（resume_command を保持） | いいえ |
      | `review` | 実装完了、最終受入対象 | いいえ |
      | `closed` | 完了 | はい |
      | `cancelled` | 中止 | はい |

      `closed` と `cancelled` は終端状態とし、終端状態からの遷移は定義しない。

      ## 状態遷移表（role: case）（変更後セクション全文）

      | 操作 | 変更前 status | 変更後 status |
      |---|---|---|
      | ローカル版 `case-open` | （新規作成） | `open` |
      | ローカル版 `case-ready` 成功 | `open` / `blocked` | `ready` |
      | ローカル版 `case-run` 開始 | `ready` / `blocked` | `running` |
      | ローカル版 `case-run` 完了 | `running` | `review` |
      | ローカル版 `case-run` 停止 | `running` | `blocked`（resume_command 記録） |
      | ローカル版 `case-close` 停止 | `review` | `blocked`（resume_command 記録） |
      | ローカル版 `case-close` 再開 | `blocked` | `review` |
      | ローカル版 `case-close` 完了 | `review` | `closed` |
      | 明示中止 | `open` / `ready` / `running` / `blocked` / `review` | `cancelled` |

      再開経路と禁止遷移:

      - `case-run` 開始は `ready` からのみ許可する（`blocked` からの直接 `running` 遷移は、resume_command が指す正規再開経路（req-define / case-revise / case-ready）を経由して `ready` に復帰した後に行う）
      - `blocked` からの再開は resume_command の指す先（`req-define` / `case-revise` / `case-ready` / `case-run` / `case-close`）を正規入口とし、推測による再開を行わない
      - `blocked` から `closed` への直接遷移は禁止する。`blocked` から `closed` に至る場合は `review` を経由する
      - 通常状態への遷移時に `resume_command` をクリアする
conflict_resolutions:
  - id: CR-001
    conflict: >-
      旧フローで進行中の Case（case-open 完了済み・実行契約確定済みの Issue）の移行扱いが入力に明示されていない。
    resolution: >-
      受け入れ条件3・4（case-update 完全廃止・alias 残存禁止）と冪等再実行契約（受け入れ条件32〜38）から一意に決まる解を採用する。旧フローで確立済みの Root Case は新フローの冪等契約（既存成果物の再利用・不足分のみ実行）の適用対象となり、Definition PR を作成せず case-ready から継続できる（canonical Definition に実変更がない場合は Definition PR を作らない契約と整合）。旧コマンドを移行用に残す選択肢は受け入れ条件と矛盾するため採らない。
  - id: CR-002
    conflict: >-
      REQ-030 の構成アルゴリズム行群（連結成分、3軸判断、Wave 構成等）と Decision 受理評価行群（REQ-030-007〜025 相当）の移動先を、REQ-030 内の主語書き換えとするか、case-ready 実行契約 REQ（新規）への移管とするか。
    resolution: >-
      case-ready 実行契約 REQ への移管とする。変更後の正状態は「構成確定と Decision 受理は canonical Definition 確定後に行われる」であり、実施主体は case-ready である。REQ-030 は Root Case 確立・Definition Package 生成に縮小し、REQ-004-007（現行 REQ は現在状態のみ）に従い移動元に旧構成責務を残さない。
operation_units:
  - id: OU-001
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [REQ-005, REQ-006, new:case-workflow-state-redesign]
    target_design: [workflow-contracts, local-case-file]
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-005, REQ-006, DEC-029]
      actions_to_docs: {ACT-REQ-002: REQ-005, ACT-REQ-003: REQ-005, ACT-REQ-004: REQ-006, ACT-REQ-005: REQ-006, ACT-DEC-001: DEC-029}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: [REQ-005-029, REQ-005-030, REQ-005-031, REQ-006-112, REQ-006-113, REQ-006-114]
    content: >-
      ワークフロー契約と Case 状態モデルの基盤。REQ-005（主フロー・例外経路・backend 非依存・マクロフェーズ再定義）、REQ-006（Case 状態モデル・resume_command・capture 主語更新）、Decision new:case-workflow-state-redesign、workflow-contracts Design、local-case-file Design。
  - id: OU-002
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [REQ-008, REQ-021]
    target_design: []
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-008, REQ-021]
      actions_to_docs: {ACT-REQ-006: REQ-008, ACT-REQ-008: REQ-021}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: []
    content: >-
      一時成果物 lifecycle と検証ゲート。REQ-008（draft/RU 削除タイミングの case-ready 移動、consumer 集合更新、SSoT 境界変更）、REQ-021（保存内部責務への主語変更、検証ゲート移動）。
  - id: OU-003
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [REQ-030]
    target_design: []
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-030]
      actions_to_docs: {ACT-REQ-009: REQ-030}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: []
    content: >-
      case-open 責務縮小。REQ-030 を Root Case 確立・Definition Package 生成・実変更時のみ Draft Definition PR 作成に縮小し、構成アルゴリズム・RU 削除・Decision 受理評価の移管を反映。
  - id: OU-004
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [new:case-ready-execution-contract, REQ-017, REQ-035]
    target_design: [case-ready, definition-readiness, epic-wave-model]
    operation: create
    scale: standard
    depends_on: [OU-001, OU-003]
    recommended_order: 4
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-061, REQ-017, REQ-035]
      actions_to_docs: {ACT-REQ-015: REQ-061, ACT-REQ-007: REQ-017, ACT-REQ-014: REQ-035}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: [REQ-035-013, REQ-035-014, REQ-035-015, REQ-061-001, REQ-061-002, REQ-061-003, REQ-061-004, REQ-061-005, REQ-061-006, REQ-061-007, REQ-061-008, REQ-061-009, REQ-061-010, REQ-061-011, REQ-061-012, REQ-061-013, REQ-061-014, REQ-061-015, REQ-061-016, REQ-061-017, REQ-061-018, REQ-061-019, REQ-061-020, REQ-061-021, REQ-061-022, REQ-061-023, REQ-061-024, REQ-061-025, REQ-061-026, REQ-061-027, REQ-061-028]
    content: >-
      case-ready 実行契約。case-ready 実行契約 REQ 新規、REQ-017（execution contract 確定主体の case-ready 移動）、REQ-035（Root/Child SSoT 分離、Standard 単一 execution unit）、case-ready Design、definition-readiness Design、epic-wave-model Design 更新。
  - id: OU-005
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [new:case-revise-execution-contract, REQ-033, REQ-031]
    target_design: [case-revise]
    operation: create
    scale: standard
    depends_on: [OU-001, OU-004]
    recommended_order: 5
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-062, REQ-033, REQ-031]
      actions_to_docs: {ACT-REQ-016: REQ-062, ACT-REQ-011: "REQ-033 (retired)", ACT-REQ-010: REQ-031}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: [REQ-062-001, REQ-062-002, REQ-062-003, REQ-062-004, REQ-062-005, REQ-062-006, REQ-062-007, REQ-062-008]
    content: >-
      case-revise 実行契約と case-update 廃止。case-revise 実行契約 REQ 新規、REQ-033 廃止（retired 配置）、REQ-031（blocked・staleness・docs 連携の正規再開経路への更新）、case-revise Design。
  - id: OU-006
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    target_req: [REQ-034, REQ-004, REQ-027, REQ-041, REQ-057, REQ-059]
    target_design: []
    operation: update
    scale: standard
    depends_on: [OU-001, OU-004]
    recommended_order: 6
    issue_policy: single
    result:
      status: saved
      saved_docs: [REQ-034, REQ-004, REQ-027, REQ-041, REQ-057, REQ-059]
      actions_to_docs: {ACT-REQ-012: REQ-034, ACT-REQ-013: REQ-034, ACT-REQ-001: REQ-004, ACT-REQ-017: REQ-027, ACT-REQ-018: REQ-041, ACT-REQ-019: REQ-057, ACT-REQ-020: REQ-059}
      source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
      unclassified_rows: [REQ-034-037, REQ-034-038]
    content: >-
      case-auto・要件形成プロセス・横断旧参照整合。REQ-034（委譲対象・stage モデル・クリーンアップゲート・自動継続経路の更新）、REQ-004（Definition 保存内部責務への主語変更、Design 保存の内部責務化）、REQ-027/REQ-041/REQ-057/REQ-059（旧 req-save/design-save 参照の Definition 保存内部責務化・代表ケース更新）。
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      /repo/docs-check、integrity suite、docs 整合性検査（--files 相当の明示列挙）により、公開 command 配布物（src/opencode/commands/agentdev/）、Workflow Skill 配布物（src/opencode/skills/）、Command Design、workflow-contracts Design を含む docs/designs/** 全体（基盤・横断 Design: system、document-model、design-principles、quality-gates、workflow-skill-model、capture-boundaries、backlog-artifact-lifecycle、delegation-contracts 等）、README、guides、glossary、project extensions（.agentdev/extensions/skills/*.yaml の context・acceptance_gate 参照）を対象に req-save / design-save / case-update の公開導線参照を検索する。あわせて新標準フロー（req-define → case-open → case-ready → case-run → case-close）の記述が workflow-contracts とコマンド配布物で一意であることを確認する。
    pass_criteria: >-
      旧3コマンドの公開導線参照 0 件（deprecated alias、旧経路、移行用呼称を含む）。新標準フローがコマンド分類・パイプライン概要・各 Command Design で一意に記述されている。数値閾値: 旧コマンド名参照件数 = 0。
    on_failure: >-
      fix-and-reverify を選択。公開契約の残存は受け入れ条件3・4・39 の直接違反であり体系破壊を招くため、残存参照を全て除去してから再検証する。
  - id: TS-002
    target_item: AG-004
    verification: >-
      local-case-file Design の status 値域・状態遷移表・resume_command フィールドと、REQ-006 の Case 状態モデル行、REQ-031（case-run 開始前提）の整合を文書突合で確認する。ローカル版 Case ファイル操作の整合性検査（local-case-file スキーマ検証）を実行する。
    pass_criteria: >-
      ready 状態の定義・遷移表・resume_command のクリア規則が 3 文書間で一致している。case-run 開始の前提が ready のみに限定されている。状態遷移表に全状態（open / ready / running / blocked / review / closed / cancelled）が含まれる。
    on_failure: >-
      fix-and-reverify を選択。状態モデルの不整合は再開不能な Case を生むため、文書突合差分を全て解消してから再検証する。
  - id: TS-003
    target_item: AG-007
    verification: >-
      case-ready 実行契約 REQ と case-ready Design のシナリオ検査。（a）Definition PR あり・合意済み投影ケース: 追加承認なしで merge されること。（b）Definition PR なし（実変更なし bugfix 系）ケース: Definition PR を作らず execution contract 確定・ready 遷移すること。（c）新しい意味判断が必要なケース: HITL 停止すること。（d）CI 失敗ケース: ready 不遷移・既存 PR 保持で再実行可能なこと。docs 整合性検査とコマンド配布物の構造検査で確認する。
    pass_criteria: >-
      4 シナリオすべてが REQ・Design・実装（workflow skill 配布物）で一貫して規定されている。実変更なしケースで空の Definition PR を作る経路が存在しない。
    on_failure: >-
      fix-and-reverify を選択。Definition 確定境界の不備は実装開始制御（ready）の信頼性を損なうため、契約を修正して再検証する。
  - id: TS-004
    target_item: AG-012
    verification: >-
      REQ-008（RU 削除タイミング）、REQ-030（case-open は削除しない）、case-ready 実行契約 REQ（成功後削除・blocked 時保持）、workflow-contracts Design（draft ライフサイクル）の文書突合。.agentdev 状態表（drafts / backlog/req-units の削除条件）の整合を確認する。
    pass_criteria: >-
      「case-open 完了では保持」「case-ready 成功後に削除」「blocked / failed / 中断時は保持」が全文書で一致している。
    on_failure: >-
      fix-and-reverify を選択。削除タイミングの不整合は RU 情報喪失または残存検証ゲート誤発火を招くため、全文書を一致させて再検証する。
  - id: TS-005
    target_item: AG-013
    verification: >-
      REQ-021-024 変更後行（case-open は妨げない / case-ready は ready 拒否）と case-ready 実行契約 REQ の検証ゲート行、REQ-004-053 の投影契約参照（REQ-017-002）の整合を文書突合で確認する。
    pass_criteria: >-
      case-open の「妨げない」契約と case-ready の「ready 拒否」契約が対で規定され、検証対応要否未分類時の挙動が一意に定まる。
    on_failure: >-
      fix-and-reverify を選択。ゲート二重化または穴の両方が重大なため、契約を修正して再検証する。
  - id: TS-006
    target_item: AG-014
    verification: >-
      REQ-034 変更後行（stage モデル、自動継続経路、resume_command: req-define 停止）と case-auto Design・workflow skill 配布物の整合を確認する。case-revise → case-ready → case-run → case-close の例外経路自動継続が orchestration stage モデルと矛盾しないことを確認する。
    pass_criteria: >-
      通常継続経路と例外経路の両方が stage モデルで表現可能であり、req-define の壁打ち自動化を行う経路が存在しない。
    on_failure: >-
      fix-and-reverify を選択。自走制御の契約不整合は誤実装に直結するため、修正して再検証する。
  - id: TS-007
    target_item: AG-015
    verification: >-
      REQ-011-006/007/024（同一上位操作契約）、definition-readiness Design（backend 意味論の物理写像）、workflow-contracts Design（Local backend の SSoT 位置づけ）、local-case-file Design の文書突合。上位 command / workflow の記述に backend 固有表現（GitHub PR の物理形式等）への直接依存が混入していないことを検索確認する。
    pass_criteria: >-
      Definition の「未確定 → 確定」、Case の open → ready が backend 共通の上位意味論として規定され、物理表現が Design に分離されている。上位契約記述からの物理表現直接参照 0 件。
    on_failure: >-
      fix-and-reverify を選択。backend 依存の混入は差し替え可能性を破壊するため、Design へ分離して再検証する。
  - id: TS-008
    target_item: AG-016
    verification: >-
      case-open / case-ready / case-revise 実行契約 REQ の冪等行（既存 Root Case・Definition PR・Amendment PR・Child Issue・Wave・Decision 受理記録の重複生成禁止、merge 巻き戻し禁止）と definition-readiness Design の冪等キー節の整合を文書突合で確認する。
    pass_criteria: >-
      重複生成禁止対象の列挙が REQ と Design で一致し、merge 後再開の基準（canonical Definition）が一意に規定されている。
    on_failure: >-
      fix-and-reverify を選択。冪等性の欠落は再実行時の二重 Issue・二重 PR を生むため、修正して再検証する。
  - id: TS-009
    target_item: AG-002
    verification: >-
      REQ-004 / REQ-006 / REQ-008 / REQ-021 変更後行の保存内部責務表現と、Capability Skill（req-file-manager、decision-file-manager、design-file-manager、artifact-validation）の Design・SKILL.md の整合を文書突合で確認する。REQ 保存後の README 索引整合（REQ-004-013）の実施主体が保存内部責務であることを確認する。
    pass_criteria: >-
      req-save / design-save の公開コマンド参照が REQ 体系から除去され、保存能力の委譲先が Capability Skill に一意に特定できる。
    on_failure: >-
      fix-and-reverify を選択。保存責務の帰属不明は保存喪失を招くため、修正して再検証する。
  - id: TS-010
    target_item: AG-010
    verification: >-
      REQ-035 追加行（Root orchestration SSoT / Child execution SSoT / Standard 単一 execution unit）と REQ-017 変更後行（case-ready の realization_actions 投影）、case-ready 実行契約 REQ の Child Issue 作成行、epic-wave-model Design の文書突合。
    pass_criteria: >-
      Standard で儀式的 Child Issue を作る経路が存在せず、Epic の各 Child Issue が単独自足の execution contract 要件を満たす構成になっている。
    on_failure: >-
      fix-and-reverify を選択。SSoT 配置の不整合は case-run の実行契約取得を破壊するため、修正して再検証する。
realization_actions:
  - id: RA-001
    concern: 公開コマンド配布物の再構成
    responsibility: AgentDevFlow 配布コマンド体系
    ownership_hints:
      - "src/opencode/commands/agentdev/case-ready.md（新規）"
      - "src/opencode/commands/agentdev/case-revise.md（新規）"
      - "src/opencode/commands/agentdev/req-save.md（削除）"
      - "src/opencode/commands/agentdev/design-save.md（削除）"
      - "src/opencode/commands/agentdev/case-update.md（削除）"
      - "src/opencode/commands/agentdev/case-open.md, case-auto.md, case-run.md, case-close.md, req-define.md（更新: 新フロー・新状態遷移・blocked 正規再開経路への参照更新）"
    intent: >-
      公開 interface を状態遷移単位に再構成する。Command 定義は公開 interface / dispatch のみを所有し、workflow 実装本体は Workflow Skill に置く（DEC-010、REQ-034-007〜009 契約と整合）。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002, AG-003]
  - id: RA-002
    concern: Workflow Skill 配布物の再構成
    responsibility: AgentDevFlow 配布 Workflow Skill 体系
    ownership_hints:
      - "agentdev-workflow-case-ready（新規）"
      - "agentdev-workflow-case-revise（新規）"
      - "agentdev-workflow-req-save（削除）"
      - "agentdev-workflow-design-save（削除）"
      - "agentdev-workflow-case-update（削除）"
      - "agentdev-workflow-case-open（更新: 責務縮小）"
      - "agentdev-workflow-case-ready（Definition 受入・EC 確定・ready 遷移、保存は Capability Skill 委譲の内部 STEP 構成）"
      - "agentdev-workflow-case-auto（更新: stage モデル・自動継続経路）"
      - "agentdev-workflow-case-run（更新: blocked 正規再開経路）"
      - "agentdev-workflow-case-close（更新: 参照整合）"
      - "agentdev-workflow-req-define（更新: consumer・経路参照）"
    intent: >-
      workflow 実装本体を新コマンド構成へ対応させる。case-ready は保存実体を Capability Skill へ委譲する内部 STEP 構成とし、単一責務（Definition 確定境界）を保つ（architecture-advisory 助言の採用）。
    verification_refs: [TS-001, TS-003]
    source_items: [AG-002, AG-007]
  - id: RA-003
    concern: テンプレート配布物の再構成
    responsibility: AgentDevFlow 配布テンプレート体系
    ownership_hints:
      - "case-update 用テンプレート（削除）"
      - "case-ready / case-revise 用テンプレート（新規）"
      - "case-open 用テンプレート（更新: Root Case・Definition Package 用）"
    intent: 新コマンド構成に必要なテンプレートを整備し、廃止コマンドのテンプレートを除去する。
    verification_refs: [TS-001]
    source_items: [AG-003, AG-006, AG-007]
  - id: RA-004
    concern: Design 配布物・索引の整合更新
    responsibility: docs/designs 配布物
    ownership_hints:
      - "docs/designs/commands/req-save.md, design-save.md, case-update.md（削除: Git 履歴のみ保持、deprecated alias 残存なし）"
      - "docs/designs/commands/case-open.md, case-auto.md, case-run.md, case-close.md（更新: 新フロー・新責務境界への整合）"
      - "docs/designs/README.md（索引更新: 削除3件の除去・新規3件の追加）"
      - "docs/designs/skills/agentdev-req-file-manager.md 等の保存 Capability Skill Design（保存内部責務化に伴う参照整合）"
      - "docs/designs/foundations/system.md（Workflow Architecture Inventory・パイプライン表）, document-model.md（draft/design ライフサイクル表記）, design-principles.md（フロー図・参照）"
      - "docs/designs/quality/quality-gates.md（QG 適用主体の req-save 表記更新。QG 番号・名称は作業仮定により維持判断を後続工程へ委ねる）"
      - "docs/designs/workflows/workflow-skill-model.md, capture-boundaries.md（req-save/design-save capture 主語）, backlog-artifact-lifecycle.md（draft/RU 削除タイミング）, delegation-contracts.md（委譲対象列挙）"
    intent: >-
      Design 索引と Command Design を新公開契約へ整合させる。削除は alias を残さず Git 履歴のみで保持する。
    verification_refs: [TS-001, TS-009]
    source_items: [AG-002, AG-003]
  - id: RA-005
    concern: docs 横断の旧フロー参照除去
    responsibility: docs（guides、README、glossary、requirements README 索引）
    ownership_hints:
      - "docs/requirements/README.md（REQ-033 retired 配置反映）"
      - "docs/guides/**、README.md、用語集（旧 req-save / design-save / case-update フロー参照の除去・新フロー記述）"
      - "既存 REQ / Design 編集時の ADF-COVERS コメント行保持（制約・必須保持事項）"
    intent: >-
      受け入れ条件39（旧フロー参照が新しい公開契約と整合）を満たす。REQ 行追加・変更に伴う AUTOGEN 索引の再生成は保存内部責務が整合を保証する（制約・必須保持事項）。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-003]
  - id: RA-006
    concern: 検査・検証資産の更新
    responsibility: repo-local 検査・project extensions・.agentdev 状態表
    ownership_hints:
      - "/repo/docs-check、repo-agentdev-integrity の検査ルール（旧コマンド参照検出の追加・更新）"
      - ".agentdev/extensions/skills/agentdev-workflow-req-define.yaml 等 29件の extensions（acceptance_gate・context 参照の更新）"
      - ".agentdev 状態表（drafts/req-draft-*.md、backlog/req-units/RU-* の削除条件を case-ready 成功後へ更新）"
      - "agentdev-workflow-routing、agentdev-issue-management 等の関連 Capability Skill（旧経路参照の更新）"
    intent: >-
      機械検出により旧コマンド参照の残存を防ぎ（REQ-011-014/015 系の継続的規律と同じ精神）、workflow 実行時の参照・ゲートが新体系で一貫するようにする。
    verification_refs: [TS-001, TS-004]
    source_items: [AG-002, AG-003, AG-012]
review_dispositions:
  - id: RD-001
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "背景・問題・統合理由"
    disposition: covered
    reason_code: reflected-in-agreed-items
    reason: 背景の問題意識（文書種別境界のコマンド、case-open 責務混在、case-update 多責務、状態不明示、正規経路の不整合）は AG-001〜007 へ反映し、統合判断（単一ワークフロー再設計単位）は単一 draft・6 OU 構成で維持した。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.agreed_items / operation_units
      checked_at_commit: null
  - id: RD-002
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "Source Summary（主フロー・廃止・状態追加・backend 整合の全条項）"
    disposition: covered
    reason_code: reflected-in-agreed-items
    reason: 17条項を AG-001〜AG-018 に反映した。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.agreed_items
      checked_at_commit: null
  - id: RD-003
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "要件化の方向（req-define / case-open / case-ready / execution contract 配置 / case-revise / case-update 廃止 / Case 状態 / blocked と再開 / case-auto / draft・RU lifecycle / 検証対応要否ゲート / macro phase / backend / 冪等性）"
    disposition: covered
    reason_code: reflected-in-artifact-actions
    reason: 各セクションの要件化内容を ACT-REQ-001〜016、ACT-DEC-001、ACT-DES-001〜006 の content として変更後本文で確定した。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.artifact_actions
      checked_at_commit: null
  - id: RD-004
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "主対象REQまたは変更対象候補（REQ-004/005/006/008/017/021/030/033/034、影響確認候補 REQ-001/009/011/031、対応 Design、旧参照）"
    disposition: covered
    reason_code: dispositioned-with-rationale
    reason: 主対象9 REQ はすべて操作分類済み。影響確認の結果 REQ-031 は行変更あり（ACT-REQ-010）、REQ-032 は行変更不要（review→closed は現行 case-close 責務と整合、REQ-032-022 残留確認は維持）、REQ-011 は既存行（REQ-011-006/007/024）で backend 意味論をカバー済みのため行追加不要、REQ-001/REQ-009 は Definition PR 相当の上位意味論を workflow-contracts Design と definition-readiness Design で対応し REQ 行変更不要。adversarial-review により追加特定された横断旧参照（REQ-027、REQ-041、REQ-057、REQ-059、REQ-008-014、REQ-035 目的節、REQ-005/006 適用範囲の case-update 列挙）は ACT-REQ-006/014/017〜020 として処理する。対応 Design は ACT-DES-001〜006 と RA-004（基盤・横断 Design 8件を含む）、旧参照は RA-004/RA-005 で処理する。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.artifact_actions / realization_actions
      checked_at_commit: null
  - id: RD-005
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "対象範囲・対象外・作業仮定・制約・必須保持事項"
    disposition: covered
    reason_code: reflected-in-scope-and-tests
    reason: 対象範囲は summary・artifact_actions・realization_actions が網羅し、対象外（ブランチ命名、local 物理表現、QG 番号、内部 STEP 分割、テンプレート詳細、GitHub API 実装、実装計画）は draft で確定せず Design・後続工程へ委ねた。作業仮定は definition-readiness Design の管理事項とした。制約（ADF-COVERS 保持、AUTOGEN 索引整合、質問最小限）は RA-005・TS-009 と本 draft の対応（質問0件）で遵守した。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.summary / realization_actions / test_strategy
      checked_at_commit: null
  - id: RD-006
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "受け入れ条件 1〜40"
    disposition: covered
    reason_code: traceable-to-ag-and-actions
    reason: >-
      1→AG-001/ACT-REQ-002,003、2→AG-002/ACT-REQ-001、3・4→AG-003/ACT-REQ-011、RA-004/TS-001、5→AG-011/ACT-REQ-016、6→AG-003/ACT-REQ-003、7→AG-006/ACT-REQ-009、8→AG-006/ACT-REQ-009、9→AG-007/ACT-REQ-015、10・11→AG-007/ACT-REQ-015、12→AG-008/ACT-REQ-005,015、13→AG-009（REQ 変更不要、case-close 既存契約）、14→AG-010/ACT-REQ-014,015、15→AG-007/ACT-REQ-015、16→AG-010/ACT-REQ-014、17→AG-004/ACT-REQ-005、18・19→AG-005/ACT-REQ-005、20→AG-011/ACT-REQ-016、21→AG-011/ACT-REQ-016、22→AG-011/ACT-REQ-016、23・24→AG-012/ACT-REQ-006,015/TS-004、25→AG-013/ACT-REQ-008/TS-005、26・27・28→AG-014/ACT-REQ-013/TS-006、29・30→AG-015/ACT-REQ-003/TS-007、31→AG-017/ACT-REQ-002、32〜38→AG-016/ACT-REQ-009,015,016/TS-008、39→RA-004,005/TS-001、40→ACT-REQ-011（REQ-033 廃止レコードに横断要件の引継先を明記）。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data 全体
      checked_at_commit: null
  - id: RD-007
    source_ru: C:/Users/ogatay/desk/projects/req-input-case-workflow-redesign.md
    source_item: "検証方法（16項目の後続工程検証リスト）"
    disposition: partially_covered
    reason_code: downstream-verification
    reason: >-
      文書整合系（フロー整合、旧公開導線不存在）は TS-001〜TS-010 として draft 内で検証手順化した。動作系（Standard 正常系、Epic Case、Decision 遷移、再実行、resume_command 再開、backend 一致、case-auto 継続）は後続工程（case-ready での execution contract → case-run での test strategy 実行）における実行検証項目であり、本 draft の TS-003/006/007/008 が文書突合として先行カバーし、実動作検証は実装 Issue の test strategy で実施する。RU の検証方法リストは実行契約（ACT-REQ-015 の case-ready 実行契約、TS 群）に投影済みのため、この部分対応を理由に RU 全体の採用を損なわない。
    evidence:
      path: .agentdev/drafts/req-draft-case-workflow-state-redesign.md
      section: draft-data.test_strategy
      checked_at_commit: null
case_open_hints:
  epic_needed: true
  decomposition: >-
    単一ワークフロー再設計として相互依存が強いため、OU-001〜OU-006 を同一主題（case workflow 再設計）の単一 Epic に集約する案を推奨。OU-001（契約基盤）→ OU-002/OU-003（並行可）→ OU-004（中核）→ OU-005/OU-006（並行可）の依存構造。docs 変更（REQ/Decision/Design）と配布物変更（command/skill/template）は OU 単位で分散し、同一 OU 内で完結する。
  wave_hints: >-
    Wave 1: OU-001（ワークフロー契約と Case 状態モデル、Decision）。Wave 2: OU-002（一時成果物 lifecycle）、OU-003（case-open 縮小）の並行。Wave 3: OU-004（case-ready 実行契約）。Wave 4: OU-005（case-revise と case-update 廃止）、OU-006（case-auto・要件形成整合）の並行。Wave 間は depends_on（OU-002/003→OU-001、OU-004→OU-001,003、OU-005/006→OU-001,004）による直列化のみ。
```
