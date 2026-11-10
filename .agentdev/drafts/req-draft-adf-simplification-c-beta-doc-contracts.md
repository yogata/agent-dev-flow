---
draft_type: req_draft
topic_slug: adf-simplification-c-beta-doc-contracts
status: draft
created_at: "2026-11-10T10:02:00+09:00"
---

<!-- req_draft テンプレートに従う構造化引き継ぎ成果物。後続工程（case-open/case-ready/case-revise）が参照する
     原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
     soft contract（生成元側標準）。 -->

# draft-data

```yaml
# work_type: maintenance（契約間不一致の是正・保守。実装計画 v8 の C-β 文書系。bugfix でない根拠:
#   実装ロジックの欠陥修正ではなく契約記述の整合化であり、A-4/A-6 の受理面変更も正本契約への整合）
work_type: maintenance

# scale: standard（単一 Case C-β・局所的文言/受理面変更。実装スコープシグナル〔変更対象ファイル一覧〕は
#   存在するが、分解計画は利用者承認済み計画 v8 が事前所有〔A-7〜A-13 等は別 req-input〕のため large としない）
scale: standard

summary: |
  ADF全体簡素化調査（第50報告・全2,079ファイル評価）で確認された契約間不一致のうち文書系6件（A-1〜A-6）を是正する
  （実装計画第53報告 v8・2026-11-10 利用者承認の C-β）。
  (1) A-1: 委譲応答3点ゲート（REQ-031-029）を「4状態 result 必須＋状態別必須欄」へ条件化し、全列挙型再述
  （docs 2件・配布物4文件＋試験名1）を同期（ゲート名称「3点ゲート」は固有名として維持）。
  (2) A-2: REQ-015 の停止伝播記述を bounded parent decision resolution 先行の現行契約（REQ-034-032〜034・DEC-008）へ
  更新し、case-auto Design 停止伝播契約節と Workflow Skill 側（reference STEP-5・SKILL.md STEP 表・分岐・停止終了条件行）を同期。
  (3) A-3: Jev Tool 説明文4文件（入力指摘の plugin.ts・registration.ts＋実測検出の public-schema.ts・engine.ts）の
  旧「legacy LLM path 継続」記述を custom-tool-contracts「Jev 先行評価」節（REQ-103-008〜011）に整合する文言へ修正
  （not_configured〔未設定〕を no-fallback 適用に内包。配布物本文に REQ/DEC 識別子を書かない。IR-055）。
  (4) A-4/A-6: tracking labels 規定3文件（local-case-file.md・case-file.md・labels.yaml）を
  「原則空配列・通常ラベル任意付与可・値域の列挙拘束と機械検証は適用外・kind は本文項目」へ統一し、
  ローカル版実装（runner-local.ts）の起票・更新受理面（空配列のみ受理）と既存試験2件の拒否 pin を
  正本（issue-tracking Design 決定16・REQ-095-004）へ整合させる（HITL 2026-11-10 承認）。
  (5) A-5: case-auto Design「Wave 反復制御」節の旧 Wave 収束障壁を依存充足ゲート単独条件（DEC-051）へ置換
  （Epic 記録・統合処理〔REQ-034-042〕行は維持）。
  完了条件: 変更前後で各契約の意味が保存されていること（completed-pr 検査の非弱体化・review 不介入境界の維持）、
  両試験基線（ルート bun test＝2,229試験・既知不合格11件／bun test ./.opencode/＝4,750試験・既知不合格1件）で
  新規不合格0件、IR-055 差分0件、追跡 sidecar・整合性検査（QG 相当）合格。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      A-1 委譲応答3点ゲートの状態別必須欄化。REQ-031-029 の要件行 ID を不変のまま、「4状態 result を必須検査し、
      状態別の必須欄を検査する（completed-pr は commit hash・PR URL を必須とする。blocked・failed・
      delegation-unavailable は停止理由と再開情報〔SSoT 記録先を含む〕を必須とする。開始前・途中の停止結果に
      PR URL・commit hash を要求しない）」へ文言更新する。変更前後で completed-pr の検査は弱めない
      （commit hash・PR URL 必須と「要約で完結した completed-pr」拒否を維持）。verify-only closure の別経路扱いは維持する。
      同一契約の列挙型再述を実測の全箇所へ同期する: docs/designs/workflows/v4-delegation-contracts.md
      （実装委譲の受領側検査情報候補節）、src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md
      （3点ゲート節・Completion Verification）、src/common/skills/agentdev-workflow-case-run/SKILL.md
      （工程表 STEP-S5 セル・委譲応答の3点ゲート段落）、src/common/skills/agentdev-case-run-execution-adapter/SKILL.md
      （委譲結果受領の最終ゲート節）、src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md
      （result 報告義務・接合形態の self-apply 記述）。ゲート名称「3点ゲート」は固有名として維持し、名称のみ言及する箇所
      （case-run/case-auto SKILL.md の名称言及、case-run Design、adapter Design、REQ-031-033 行）は変更しない
      （HITL 2026-11-10。判断根拠: 計画 v8 の受け入れ条件「委譲結果契約（実装）と突合して矛盾なし」から列挙型再述の
      全同期は必須だが、改称は計画が要求せず追従変更のみ増大）。adapter SKILL.md の新文言は pin 試験3制約
      （「3点ゲート」名称維持、「として扱わない。実装・検証の要約は3点検査の通過を代替しない」一文の verbatim 維持、
      「4状態 result」「commit hash」「PR URL」の語の維持）を満たす（process-conformance.test.ts L73-81 を無変更で合格）。
  - id: AG-002
    content: |
      A-2 停止伝播の bounded parent decision resolution 先行化。REQ-015 の目的文と要件行 REQ-015-012 を
      「user-decision-required + decision_context を受領した場合、まず bounded parent decision resolution へ入力する
      （正規契約から導出可能なもの・委譲された裁量の範囲内のものは回答して当該下位の再開点から再開する）。
      上位合意矛盾または新規ユーザー価値判断・対象範囲変更・外部契約変更等（REQ-034-034）に限り自走停止→ユーザ提示→
      resume point から再開。review 直接起動、finding 解釈、採否、再評価を行わない」へ更新する（要件行 ID は不変）。
      docs/designs/commands/case-auto.md「停止伝播契約（REQ-015-012）」節の挙動リストを同一の優先関係へ更新し、
      src/common/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md STEP-5 の
      Purpose/Procedure を decision_context を STEP-6（bounded parent decision resolution）へ先に入力する構造へ、
      src/common/skills/agentdev-workflow-case-auto/SKILL.md の STEP 表該当行・停止伝播分岐行・停止終了条件行
      （user-decision-required を独立停止トリガとして列挙する行。bounded resolution の2分類〔上位合意矛盾・新規ユーザー判断〕
      へ帰着させる形へ統合）を同期する。review 不介入の境界（直接起動・解釈・採否・再評価の禁止）は維持する。
      正本は v4-delegation-contracts.md「case-auto による decision_context の限定的親判断解決」節・REQ-034-032〜034・
      DEC-008。DEC-008 背景節の旧引用は決定時点の歴史記録として変更対象外とする。
  - id: AG-003
    content: |
      A-3 Jev Tool 説明文の障害時契約整合化。入力が指摘した src/opencode/plugins/agentdev-jev-tool/plugin.ts と
      src/senpi/tools/agentdev-jev-tool/registration.ts の Tool 説明文に加え、実測で検出した同一の旧記述
      （legacy LLM path への fallback を示唆する文言）を持つ src/common/tools/agentdev-jev/public-schema.ts
      （公開スキーマ description）と src/common/tools/agentdev-jev/engine.ts（not_configured 失敗文言）の計4文件を、
      「not_configured は API を呼出さず構造化失敗（observation 生成なし）。評価器障害（not_configured〔未設定〕を含む）時、
      必須の閉じた意味評価は LLM 推論へ fallback せず判定を未確定とし、依存後続を抑止する（呼出元 Workflow 契約）」の旨
      （英語説明文は同旨。not_configured を no-fallback 適用の列挙に内包する構成。正本 custom-tool-contracts
      「Jev 先行評価」節は「評価器障害（未設定、利用不能、timeout 等）」と未設定を内包し、DEC-052 代替案(c) の
      未設定時 legacy 継続例外を不採用）へ修正する。配布物（src/ 配下）の本文に新規の REQ/DEC 識別子を書かない（IR-055）。
      docs 側（README 群・custom-tool-contracts Design）は既に新契約に整合しており変更対象外。
  - id: AG-004
    content: |
      A-4/A-6 tracking labels 規定の統一（規定面）。docs/designs/local/local-case-file.md（role: tracking の labels 値域行）、
      src/common/tools/agentdev-gh/local/case-schema/case-file.md（tracking の labels 値域行）、
      src/common/tools/agentdev-gh/local/case-schema/rules/labels.yaml（role_conditional_labels.tracking の制約・
      旧 tracking_label_enum ブロック・constraints 節の tracking に関する記述）を「原則空配列。通常ラベルの任意付与可
      （labels は Tool 契約上の必須フィールドであり、付与するラベル値の選択は任意、起票時の既定付与は設けない）。
      値域の列挙拘束とラベル値域の機械検証は適用しない（role: case の値域所属検証は現行どおり維持する）。
      kind は本文標準構造の kind 項目で表現し、ラベルでは表現しない」へ統一する
      （正本: agentdev-issue-tracking Design 決定5・11・13・16・REQ-095-004）。
      labels.yaml は YAML 構文正当性を維持して更新し、constraints 節の tracking に関する記述は列挙拘束なしの
      新規定へ再記述する。
  - id: AG-005
    content: |
      A-4/A-6 ローカル版実装の受理面整合。src/common/tools/agentdev-gh/local/runner-local.ts の issueCreate・issueUpdate に
      おける tracking labels「空配列のみ受理」の制限を廃止し、通常ラベルの任意受理へ変更する。tracking の labels 値域機械検証は
      localLabelValues が空集合を返す現行挙動を維持したまま、issueCreate/issueUpdate の enum 所属検査ループ
      （localLabelValues(role) の空集合による全件拒否）を tracking では適用外とし、role: case の値域所属検査は現行どおり
      維持する。値域差異を説明する JSDoc・コメント（localLabelValues 周辺・validateLocalIssue の旧検証コメント）を新規定へ
      更新する。既存試験2件（src/common/tools/agentdev-gh/local/tests/runner-local.test.ts L135-143
      「tracking の issue_create は通常ラベル指定を拒否する」と L245-259
      「issue_update は …role: tracking への通常ラベル指定を拒否する」の拒否 pin）の前提逆転修正
      （新規定の受理 pin への書換と試験名更新）および tracking labels 受理（空配列・通常ラベル付与）の追加試験を
      同一 PR で実施する（HITL 2026-11-10 承認。判断根拠: 正本〔決定16・REQ-095-004〕が通常ラベルの任意付与契約を
      定めており、規定3文件の統一だけでは規定とローカル実装の不一致が残るため実装も同一 Case で整合させる）。
  - id: AG-006
    content: |
      A-5 case-auto Design の旧 Wave 収束障壁是正。docs/designs/commands/case-auto.md「現在の動作」内
      「Wave 反復制御（Epic Issue 指定時）」の旧障壁（現 Wave 全子Issue完了待機・次 Wave 開始の二条件）を
      「子 Issue の開始条件は必要な意味的依存条件の充足のみとする（依存充足ゲート・スロット型キュー。DEC-051）。
      Wave 収束（全子 Issue の実行結果確定）を後続の子 Issue 開始の前提としない。Wave 構成は意味的依存 DAG から
      導出される実行構成の記録単位として維持する」へ置換する。実行制御の詳細の参照は語彙を分離して記載する:
      「実装本体・手順の詳細は Workflow Skill（agentdev-workflow-case-auto）が単一所有し本 Design は複製しない。
      Wave 実行制御の単一所有は case-auto orchestration stage 3（「runtime 制御契約」節・DEC-041）が担う」
      （同 Design L110〔workflow 実装本体＝Workflow Skill 所有〕と L111〔Wave 実行制御＝stage 3〕の語彙分割と整合）。
      Epic 記録・統合処理（case-close 相当・REQ-034-042）の行は維持する。
  - id: AG-007
    content: |
      完了条件・基線維持。上記5群の変更が反映され、変更前後で各契約の意味が保存されていること
      （3点ゲートは completed-pr の検査を弱めない。A-2 は review 不介入の境界を維持）。
      試験基線（2026-11-10 固定）: ルート bun test は2,229試験・既知不合格11件（scripts統合・textlint配布系）、
      bun test ./.opencode/ は4,750試験・既知不合格1件（traceability_relied_diff T6）。今回の変更による
      新しい不合格は0件（既知不合格は基線どおり。件数・対象の突合記録を残す）。配布物（src/ 配下）に
      新規の REQ/DEC 識別子参照を追加していないこと（IR-055 差分0件）。追跡 sidecar・整合性検査（QG 相当）が
      合格すること。編集は UTF-8（BOM なし）・行単位の文字列置換で行い、PowerShell 経由の全ファイル一括書込みをしない
      （AGENTS.md の文字コード規律）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-031.md
    source_items: [AG-001]
    content: |
      （要件行テーブルの REQ-031-029 行を以下へ置換。行 ID は不変）
      | REQ-031-029 | case-run は委譲結果の受領時に最終ゲートとして4状態 result（completed-pr / blocked / failed / delegation-unavailable）を必須検査し、状態別の必須欄を検査すること（completed-pr は commit hash・PR URL を必須とする。blocked・failed・delegation-unavailable は停止理由と再開情報〔SSoT 記録先を含む〕を必須とする。開始前・途中の停止結果に PR URL・commit hash を要求しない）。不足する委譲応答を completed-pr として扱わず再開（再委譲または継続指示）すること。実装・検証の要約は当該検査の通過を代替しないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-015.md
    source_items: [AG-002]
    content: |
      （1）目的節の停止伝播説明2行を以下へ置換:
      case-auto は adversarial-review の呼出元ではなく、下位工程で発生した未解決のユーザー判断を受領した場合は
      まず bounded parent decision resolution（限定的親判断解決）へ入力し、正規契約から導出可能なもの・委譲された裁量の範囲内のものは回答して当該下位の再開点から再開し、上位合意矛盾または新規ユーザー価値判断・対象範囲変更・外部契約変更等（REQ-034-034）に限り自走を停止してユーザへ提示する停止伝播として扱う（REQ-015-012）。
      （2）要件行テーブルの REQ-015-012 行を以下へ置換（行 ID は不変）:
      | REQ-015-012 | case-auto は下位 command から user-decision-required + decision_context を受領した場合、まず bounded parent decision resolution へ入力すること（正規契約から導出可能なもの・委譲された裁量の範囲内のものは回答して当該下位の再開点から再開する）。上位合意矛盾または新規ユーザー価値判断・対象範囲変更・外部契約変更等（REQ-034-034）に限り自走を停止し、ユーザへ提示し、resume point から再開すること。review 直接起動、finding 解釈、採否、再評価を行わないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: local
      slug: local-case-file
    target_area: "## role: tracking の条件付きスキーマ"
    source_items: [AG-004]
    content: |
      （target_area 内の labels 値域行を以下へ置換）
      - `labels` 値域: 原則空配列。通常ラベルの任意付与可（labels は Tool 契約上の必須フィールドであり、付与するラベル値の選択は任意、起票時の既定付与は設けない）。値域の列挙拘束とラベル値域の機械検証は適用しない（`role: case` の値域所属検証は現行どおり維持する）。kind は本文標準構造の kind 項目で表現し、ラベルでは表現しない。物理写像表の正は agentdev-issue-tracking Design
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "## 現在の動作"
    source_items: [AG-006]
    content: |
      （target_area 内「Wave 反復制御（Epic Issue 指定時）」の旧障壁3行〔現 Wave 全子Issue完了待機・統合処理・次 Wave 二条件〕を以下の3行へ置換。統合処理行は内容維持）
        - completed-pr の子Issue がある場合、case-close(#epic) 相当の統合処理を Wave 反復を進行させる stage 3 内部処理として実施（統合処理は active Issue task の実行枠を消費しないが共有書き込みの直列化点として扱う。REQ-034-042）
        - 子 Issue の開始条件は必要な意味的依存条件の充足のみとする（依存充足ゲート・スロット型キュー。DEC-051）。Wave 収束（全子 Issue の実行結果確定）を後続の子 Issue 開始の前提としない。Wave 構成は意味的依存 DAG から導出される実行構成の記録単位として維持する（REQ-035-016）
        - 実装本体・手順の詳細は Workflow Skill（`agentdev-workflow-case-auto`）が単一所有し本 Design は複製しない。Wave 実行制御の単一所有は case-auto orchestration stage 3（「runtime 制御契約」節・DEC-041）が担う
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v4-delegation-contracts
    target_area: "### 実装委譲の受領側検査情報候補（output_contract）"
    source_items: [AG-001]
    content: |
      （target_area 内の契約完了検査記述を以下へ置換）
      実装作業の委譲（case-run から実行担当サブエージェントへの委譲）では、受領側（case-run / case-auto）が契約完了検査（3点ゲート: 4状態 result 必須＋状態別必須欄。completed-pr は commit hash・PR URL、blocked・failed・delegation-unavailable は停止理由と再開情報〔SSoT 記録先を含む〕）を実行するため、委譲応答にこれらの情報候補を含める。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "### 停止伝播契約（REQ-015-012）"
    source_items: [AG-002]
    content: |
      （target_area の冒頭文と挙動リスト1〜4を以下へ置換。リスト後尾の adversarial-review 再発動要否2文は維持）
      case-auto は下位 command から user-decision-required + decision_context を受領した場合、まず bounded parent decision resolution（次節。REQ-034-032〜034、DEC-008）へ入力し、以下の優先関係で処理する。

      1. **限定的親判断解決の先行**: 正規契約から導出可能なもの・委譲された裁量の範囲内のものは、回答して当該下位の再開点（resume point）から再開する（REQ-034-032/033）
      2. **自走停止（上位合意矛盾・新規ユーザー判断等のみ）**: 上位合意矛盾、または新規ユーザー価値判断・対象範囲変更・外部契約変更等（REQ-034-034。人間に留保された判断〔REQ-096-005〕の新規確定を要する場合）に限り、対象 execution_unit（Issue）の処理を停止し、ユーザー判断を待機する。他の ready 対象の execution_unit がある場合は継続する（部分停止、REQ-034-035/016 準拠）
      3. **ユーザー提示**: decision_context（対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断）をユーザーへ提示する（decision_context 構成は v4-delegation-contracts Design が正）
      4. **resume point の記録**: 停止時の resume point を記録する。resume point は v4-lifecycle-state-machine Design に従い、case-run 起源の場合は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源の場合は当該工程の委譲起点とする
      5. **resume point から再開**: ユーザー判断の解決後、resume point から処理を再開する。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "frontmatter 直下の ADF-COVERS 宣言ブロック（`<!-- ADF-COVERS(implementation): REQ-015-012 -->` 行の直後）"
    source_items: [AG-002]
    content: |
      （case-open STEP-3 の design 対応事前確認で REQ-015-012 の design 対応欠落を coverage --req で検出したため、
      case-open Design「意味変更行の design 対応事前確認」節に従い REQ-015-012 の design 対応を本 action に組込む。
      REQ-015-012 の設計根拠は case-auto Design「停止伝播契約（REQ-015-012）」節〔ACT-DESIGN-004 で更新対象〕である）
      DefinitionEdit（旧文完全一致置換・行追加のみ）:
      - path: docs/designs/commands/case-auto.md
      - oldText: <!-- ADF-COVERS(implementation): REQ-015-012 -->
      - newText: <!-- ADF-COVERS(implementation): REQ-015-012 -->
        <!-- ADF-COVERS(design): REQ-015-012 -->

conflict_resolutions:
  - id: CR-001
    conflict: |
      A-1 の同期範囲をめぐる不一致。入力（実装計画 v8）は再述3箇所（delegation-and-result.md L99節・case-run SKILL.md
      3点ゲート段落と工程表セル）を挙げるが、実測では同一契約の列挙型再述が他にも存在する（同 references L140・
      adapter SKILL.md ゲート節・adapter harness-delegation.md L275/L346・v4-delegation-contracts.md L74）。
      また「3点ゲート」の名称は5箇所の名称のみ言及と pin 試験1件（process-conformance.test.ts）に残る。
    resolution: |
      HITL 2026-11-10（判断根拠は承認済み計画書 v8 から機械的に導出）: 列挙型再述は実測の全箇所を状態別必須欄へ
      同期する（受け入れ条件「委譲結果契約（実装）と突合して矛盾なし」から必須）。ゲート名称「3点ゲート」は固有名として
      維持する（改称は計画が要求せず、名称言及5箇所と pin 試験の追従変更を増やすだけのため）。名称のみ言及箇所と
      pin 試験本文は無変更とする（試験名 L72 の列挙表現のみ追随更新）。
  - id: CR-002
    conflict: |
      A-4/A-6 の望ましい状態「通常ラベルの任意付与可（role: case と同じ規律）」と、ローカル版実装（runner-local.ts の
      issueCreate/issueUpdate）の tracking labels「空配列のみ受理」制限（値域差異コメント付き）の不一致。
      正本（agentdev-issue-tracking Design 決定16・REQ-095-004）はラベル値選択の任意付与契約を定める。
    resolution: |
      HITL 2026-11-10（判断根拠は承認済み計画書 v8 から機械的に導出）: 規定3文件の統一に加え、runner-local.ts の
      受理面も同一 Case で整合させる（通常ラベルの任意受理へ変更、tracking の enum 所属検査は適用外、既存試験2件の
      拒否 pin を前提逆転で書換、関連試験を同一 PR で追随）。実装系是正の別 req-input（A-7〜A-13）への切り出しは行わない。

operation_units:
  - id: OU-001
    description: |
      C-β（文書系 A-1〜A-6）の是正全体。REQ-031（REQ-031-029 行）と REQ-015（目的文・REQ-015-012 行）の更新、
      Design 4操作（local-case-file.md・case-auto.md×2〔Wave 反復制御・停止伝播契約〕・v4-delegation-contracts.md）、
      実現面5群（case-run/adapter の3点ゲート再述同期、case-auto の停止伝播同期、Jev Tool 説明文4文件、
      agentdev-gh local スキーマ2文件、runner-local.ts 受理面と試験追随）を含む単一 Case。
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
      A-1 の変更対象全文（REQ-031.md REQ-031-029 行、v4-delegation-contracts.md 実装委譲の受領側検査情報候補節、
      delegation-and-result.md 3点ゲート節と Completion Verification、case-run SKILL.md 工程表 STEP-S5 セルと
      委譲応答の3点ゲート段落、adapter SKILL.md 委譲結果受領の最終ゲート節、harness-delegation.md の result 報告義務と
      接合形態記述）を変更後に読み取り、次を確認する: (1) completed-pr では commit hash・PR URL が必須のまま
      （検査の弱体化なし）で「要約で完結した completed-pr」の拒否が維持されている、(2) blocked・failed・
      delegation-unavailable では停止理由と再開情報（SSoT 記録先を含む）が必須で、PR URL・commit hash を要求していない、
      (3) verify-only closure の別経路扱いが維持されている、(4) adapter SKILL.md の新文言が pin 試験3制約
      （「3点ゲート」名称維持、「として扱わない。実装・検証の要約は3点検査の通過を代替しない」一文の verbatim 維持、
      「4状態 result」「commit hash」「PR URL」の語の維持）を満たし、process-conformance.test.ts L71-81 が無変更で合格する。
    pass_criteria: |
      全変更箇所が同一の状態別必須欄契約を表現し (1)〜(4) すべて成立。修正対象7文件内に列挙型再述
      （「3点を必須」「3点を必ず含める」「commit hash・PR URL の3点」等の全状態一律要求表現）の残存が0件。
      なお「3点ゲート」の名称言及自体は維持対象であり検出対象外。
    on_failure: |
      fix-and-reverify。文言を修正して再読取・再検証する。意味保存違反（completed-pr 検査の弱体化等）は不合格とし
      基線どおり扱いにしない。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-015.md（目的文・REQ-015-012 行）、case-auto Design 停止伝播契約節、stop-and-decision-resolution.md STEP-5
      （Purpose/Procedure/Result/Completion Verification/Resume-Idempotency）、case-auto SKILL.md の STEP 表該当行・
      停止伝播分岐行・停止終了条件行（L70。user-decision-required が bounded resolution の2分類へ帰着した形）を
      変更後に読み取り、次を確認する: (1) 受領時にまず bounded parent decision resolution へ入力する構造、
      (2) 導出可能・裁量範囲内は回答して当該下位の再開点から再開、(3) 自走停止は上位合意矛盾または新規ユーザー価値判断・
      対象範囲変更・外部契約変更等（REQ-034-034）に限定、(4) review 直接起動・finding 解釈・採否・再評価の
      不介入境界が維持、(5) v4-delegation-contracts.md「case-auto による decision_context の限定的親判断解決」節・
      REQ-034-032〜034・DEC-008 決定1〜6 と矛盾しない。
    pass_criteria: |
      (1)〜(5) すべて成立。STEP-5 の Purpose/Procedure が decision_context を STEP-6 へ先に入力する構造へ更新されている。
    on_failure: |
      fix-and-reverify。文言を修正して再読取・再検証する。review 不介入境界の侵害は不合格とする。
  - id: TS-003
    target_item: AG-003
    verification: |
      4文件（plugin.ts・registration.ts・public-schema.ts・engine.ts）の変更後文言を読み取り、
      custom-tool-contracts.md「Jev 先行評価」節の障害時契約（REQ-103-008: LLM fallback 禁止、REQ-103-009: 依存後続抑止、
      REQ-103-010: 人間判断への移行禁止、REQ-103-011: 復旧後の正規再開）と矛盾しないことを確認する。
      not_configured が「API を呼出さず構造化失敗・observation 生成なし」であること、評価器障害時の no-fallback 記述が
      not_configured（未設定）を列挙に内包していること（正典 L93 と同構成）を確認する。英語説明文
      （plugin.ts・registration.ts・public-schema.ts）と engine.ts 失敗文言が同旨であることを確認する。
      rg で src/ 配下の "legacy LLM path"（"LLM path" を含む。大文字小文字区別なし）が0件であることを確認する。
    pass_criteria: |
      4文件とも新契約に整合し、src/ 配下に旧 fallback 示唆文言の残存が0件。配布物本文に新規の REQ/DEC 識別子が
      含まれていない（IR-055）。
    on_failure: |
      fix-and-reverify。文言を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      3文件（local-case-file.md・case-file.md・labels.yaml）の変更後の tracking labels 規定を読み取り、
      「原則空配列。通常ラベルの任意付与可（値の選択は任意・既定付与なし）。値域の列挙拘束とラベル値域の機械検証は適用外
      （role: case の値域所属検証は維持）。kind は本文標準構造の kind 項目で表現し、ラベルでは表現しない」へ
      統一されていることを確認する。labels.yaml は YAML 構文検証（node によるパース等の機械的手段）で正当性を確認する。
      rg による旧規則表現（tracking_label_enum、「kind 4 値からちょうど 1 つ」、「ちょうど1つ」）の検索は
      修正対象3文件＋runner-local.ts コメントに範囲を限定して実行し、残存0件を確認する
      （正本 agentdev-issue-tracking.md 決定13は廃止宣言として旧語を正当に保持する履歴記録のため検索対象外。
      検出対象除外の正規根拠は checker 実行契約 Design「検出対象除外規定」）。正本（決定5・11・13・16・REQ-095-004）と
      矛盾しないことを確認する。
    pass_criteria: |
      3文件の規定が統一され、YAML 構文が正当。限定範囲内の旧規則表現残存が0件。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-005
    verification: |
      runner-local.ts の変更後の issueCreate・issueUpdate を読み取り、(1) tracking への空配列のみ受理制限が廃止され
      通常ラベルが受理されること、(2) 受理されたラベルが frontmatter labels へ保存されること、(3) tracking では
      enum 所属検査（localLabelValues 空集合による全件拒否ループ）が適用外となり role: case の値域所属検査が
      現行どおり維持されること、(4) localLabelValues の JSDoc・validateLocalIssue の旧検証コメントが新規定へ
      更新されていることを確認する。src/common/tools/agentdev-gh/local/tests/runner-local.test.ts の既存試験2件
      （L135-143・L245-259 の拒否 pin）が前提逆転で書換済み（新規定の受理 pin と試験名更新）であることを確認する。
      bun test ./src/common/tools/agentdev-gh/local/ を repo root を cwd として実行し、tracking labels 受理の
      追加試験を含めて合格することを確認する。
    pass_criteria: |
      (1)〜(4) が反映され、旧拒否 pin 2件の書換完了、追加試験を含む local 試験が合格。
    on_failure: |
      fix-and-reverify。実装と試験を修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      case-auto Design「現在の動作」の Wave 反復制御ブロックを変更後に読み取り、(1) 子 Issue の開始条件が
      意味的依存条件の充足のみ（DEC-051）である、(2) Wave 収束が後続の子 Issue 開始の前提とされていない、
      (3) Wave 構成が記録単位として維持されている、(4) Epic 記録・統合処理（REQ-034-042）の行が維持されている、
      (5) 実装本体・手順の詳細が Workflow Skill 単一所有への参照になっており、Wave 実行制御の単一所有が
      case-auto orchestration stage 3（「runtime 制御契約」節・DEC-041）へ語彙分離されて記載されている
      （同 Design L110/L111 の所有関係の語彙と整合）、(6) 同 Design の runtime 制御契約節・
      「workflow実装本体は Workflow Skill が所有し本 Design は複製しない」自則と矛盾しないことを確認する。
    pass_criteria: |
      (1)〜(6) すべて成立。旧障壁（全子Issue完了待機・二条件）の記述が残存していない。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-007
    verification: |
      試験基線（2026-11-10 固定・基線記録 55-baseline-test-record.md）に従い、ルート bun test
      （2,229試験・既知不合格11件〔scripts統合・textlint配布系〕）と bun test ./.opencode/
      （4,750試験・既知不合格1件〔traceability_relied_diff T6〕）を repo root を cwd として実行する
      （bun test 全体実行は timeout を明示指定。標準300〜600秒）。fail 全件の由来分類
      （既知欠陥・環境依存・当該変更起因）を行い、件数突合を記録する。bun test 実行形態は REQ-060
      （repo root を cwd にして実行・./付きパス指定）に従う。
    pass_criteria: |
      今回の変更による新しい不合格が0件。検出 fail はすべて基線の既知不合格（11件+1件）と一致し、件数突合が成立。
    on_failure: |
      fix-and-reverify。当該変更起因の不合格は実装を修正して再検証する。基線の既知不合格は不合格としない
      （基線どおり扱い。件数・対象の突合記録を残す）。
  - id: TS-008
    target_item: AG-007
    verification: |
      配布物検証: (1) 配布依存境界 gate を check_distribution_boundary.ts の --profile source と --profile link の
      双方で実行し合格すること（src/common 変更を含むため双方必須）、(2) IR-055: runtime-unresolved-reference の
      baseline 差分が0件（src/ 配下に新規 REQ/DEC 識別子参照なし。diff により配布物本文の識別子追加を機械確認）、
      (3) docs 変更を伴うため check_integrity の単独実行（bun run 形式）が合格すること、
      (4) 追跡 sidecar（traceability/*.yaml）と covers 宣言に変更が不要であること（要件行 ID は不変のため。
      REQ-031-029・REQ-015-012 の design 対応は既存〔case-auto Design ADF-COVERS、traceability/*.yaml〕で欠落なし）を確認する。
    pass_criteria: |
      (1)〜(4) すべて成立。IR-055 差分0件。
    on_failure: |
      fix-and-reverify。
  - id: TS-009
    target_item: AG-007
    verification: |
      検索系検証の網羅範囲と修正対象列挙の一致確認。本 draft の realization_actions.ownership_hints と
      artifact_actions の対象ファイル集合を修正対象列挙の正とし、検索範囲（rg パターン: "legacy LLM path"、
      "tracking_label_enum"、"kind 4"、"ちょうど 1 つ"、"3点を必須"、"3点を必ず"、"commit hash・PR URL の3点"）が
      修正対象を過不足なく覆うことを確認する。See Also 等の参照行、docs/reports/ 配下（履歴記録領域。検出対象除外の
      正規根拠は checker 実行契約 Design「検出対象除外規定」）、scripts/self/case-intake-cross-inspection/fixtures/
      （履歴 fixture）は検出対象外とする扱いを明示する。
    pass_criteria: |
      検出された旧表現がすべて修正対象ファイル由来であり、修正対象外の出所（参照行・履歴記録）である場合に
      対象外扱いが明示されている。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: A-1 委譲応答3点ゲート列挙型再述の状態別必須欄への同期（配布物）
    responsibility: |
      case-run Workflow Skill（SKILL.md 工程表 STEP-S5 セル・委譲応答の3点ゲート段落、
      references/delegation-and-result.md 3点ゲート節・Completion Verification）と case-run-execution-adapter skill
      （SKILL.md 委譲結果受領の最終ゲート（3点ゲート）節〔節名の「（3点ゲート）」は維持〕、
      references/harness-delegation.md の result 報告義務・接合形態 self-apply 記述）の委譲契約再述を
      状態別必須欄（completed-pr は commit hash・PR URL、blocked・failed・delegation-unavailable は停止理由と再開情報
      〔SSoT 記録先を含む〕、開始前・途中の停止結果に PR URL・commit hash を要求しない）へ更新する。
      verify-only closure の別経路扱いは維持する。adapter SKILL.md の新文言は pin 試験3制約
      （「3点ゲート」名称維持、「として扱わない。実装・検証の要約は3点検査の通過を代替しない」一文の verbatim 維持、
      「4状態 result」「commit hash」「PR URL」の語の維持）を満たすこと。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-run/SKILL.md（STEP-S5 セル・委譲応答の3点ゲート段落）"
      - "src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md（委譲応答の3点ゲート節・Completion Verification）"
      - "src/common/skills/agentdev-case-run-execution-adapter/SKILL.md（委譲結果受領の最終ゲート（3点ゲート）節）"
      - "src/common/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md（result 報告義務・接合形態記述）"
      - "src/common/skills/agentdev-workflow-case-run/scripts/tests/process-conformance.test.ts（試験名 L72 の列挙表現のみ追随。本文 pin 3件は無変更）"
    intent: |
      REQ-031-029 の状態別必須欄化（ACT-REQ-001・ACT-DESIGN-003）と配布物側再述の意味を一致させ、
      開始前・途中の blocked/failed 応答に存在しない PR URL・commit hash を要求する旧契約の残存を除去する。
      ゲート名称は固有名として維持する（CR-001）。
    verification_refs: [TS-001, TS-007, TS-009]
    source_items: [AG-001]
  - id: RA-002
    concern: A-2 停止伝播の bounded parent decision resolution 先行化（配布物）
    responsibility: |
      agentdev-workflow-case-auto skill の references/stop-and-decision-resolution.md STEP-5
      （Purpose・Procedure・Result・Completion Verification・Resume-Idempotency の旧一律停止構造）を、
      decision_context を STEP-6（bounded parent decision resolution）へ先に入力する構造へ更新する。
      SKILL.md の STEP 表該当行（結果セル「当該 execution_unit の自走停止、ユーザー判断待機」）、
      停止伝播分岐行（「STEP-3 → STEP-5（user-decision-required 受領時）→ ユーザー判断待機」）、
      停止終了条件行（L70。user-decision-required を独立停止トリガとして列挙する記述を bounded resolution の
      2分類〔上位合意矛盾・新規ユーザー判断〕へ帰着させる形へ統合）を新優先関係へ同期する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-auto/references/stop-and-decision-resolution.md（STEP-5）"
      - "src/common/skills/agentdev-workflow-case-auto/SKILL.md（STEP 表 STEP-5 行・停止伝播分岐行・停止終了条件行）"
    intent: |
      REQ-015（ACT-REQ-002）・case-auto Design 停止伝播契約節（ACT-DESIGN-004）と Workflow Skill 側の実行記述の
      意味を一致させる。review 不介入境界は維持する。
    verification_refs: [TS-002, TS-007]
    source_items: [AG-002]
  - id: RA-003
    concern: A-3 Jev Tool 説明文の障害時契約整合化（配布物4文件）
    responsibility: |
      agentdev-jev 関連の Tool 説明文・公開スキーマ description・not_configured 失敗文言から、
      legacy LLM path への fallback を示唆する記述を除去し、「not_configured は API を呼出さず構造化失敗
      （observation 生成なし）。評価器障害（not_configured〔未設定〕を含む）時、必須の閉じた意味評価は
      LLM 推論へ fallback せず判定を未確定とし、依存後続を抑止する（呼出元 Workflow 契約）」の旨へ更新する
      （英語説明文は同旨。not_configured を no-fallback 適用の列挙に内包する）。配布物本文に新規の REQ/DEC 識別子を
      書かない（IR-055）。
    ownership_hints:
      - "src/opencode/plugins/agentdev-jev-tool/plugin.ts（description 内の該当文）"
      - "src/senpi/tools/agentdev-jev-tool/registration.ts（description 内の該当文）"
      - "src/common/tools/agentdev-jev/public-schema.ts（AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA の description 内の該当文）"
      - "src/common/tools/agentdev-jev/engine.ts（notConfiguredFailure の detail 文言）"
    intent: |
      配布物の公開契約表明を custom-tool-contracts Design「Jev 先行評価」節（REQ-103-008〜011・DEC-052）と一致させ、
      呼出元 Workflow が説明文から誤った fallback 挙動を読み取ることを防ぐ。docs 側 README 群は既に新契約に
      整合しており変更しない。
    verification_refs: [TS-003, TS-008]
    source_items: [AG-003]
  - id: RA-004
    concern: A-4/A-6 tracking labels 規定の統一（配布物スキーマ定義2文件）
    responsibility: |
      agentdev-gh Local 実装の case-schema 定義（case-file.md の tracking labels 値域行、rules/labels.yaml の
      role_conditional_labels.tracking 制約・tracking_label_enum ブロック・constraints 節の tracking に関する記述）を、
      ACT-DESIGN-001 と同一の新規定（原則空配列・通常ラベル任意付与可・値域の列挙拘束と機械検証は適用外〔role: case の
      値域所属検証は維持〕・kind は本文項目）へ更新する。labels.yaml は YAML 構文正当性を維持する。
    ownership_hints:
      - "src/common/tools/agentdev-gh/local/case-schema/case-file.md（role: tracking の条件付きスキーマの labels 値域行）"
      - "src/common/tools/agentdev-gh/local/case-schema/rules/labels.yaml（tracking 制約・tracking_label_enum・constraints）"
    intent: |
      配布物スキーマ定義を正本 Design（ACT-DESIGN-001）・実装（RA-005）と一致させる。
    verification_refs: [TS-004, TS-007]
    source_items: [AG-004]
  - id: RA-005
    concern: A-4/A-6 ローカル版 Tool の tracking labels 受理面整合（実装変更）
    responsibility: |
      runner-local.ts の issueCreate・issueUpdate における role: tracking の「空配列のみ受理」制限
      （issueCreate の labels.length > 0 拒否、issueUpdate の同制限）を廃止し、通常ラベルの任意受理へ変更する。
      tracking の labels 値域機械検証は localLabelValues が空集合を返す現行挙動を維持したまま、
      issueCreate/issueUpdate の enum 所属検査ループ（L660-665 相当。空集合により非空ラベルが全件拒否される構造）を
      tracking では適用外とし、role: case の値域所属検査は現行どおり維持する。値域差異を説明する JSDoc・コメント
      （localLabelValues 周辺・validateLocalIssue の旧検証コメント）を新規定へ更新する。
      既存試験2件（runner-local.test.ts L135-143「tracking の issue_create は通常ラベル指定を拒否する」・
      L245-259「issue_update は …role: tracking への通常ラベル指定を拒否する」の拒否 pin）を前提逆転で書換
      （新規定の受理 pin と試験名更新）し、tracking labels 受理（空配列・通常ラベル付与）の追加試験を同一 PR で追加する。
    ownership_hints:
      - "src/common/tools/agentdev-gh/local/runner-local.ts（issueCreate・issueUpdate・localLabelValues JSDoc・検証コメント）"
      - "src/common/tools/agentdev-gh/local/tests/runner-local.test.ts（既存2試験の書換・追加試験）"
    intent: |
      正本（issue-tracking Design 決定16・REQ-095-004 の任意付与契約）と規定3文件（AG-004）へローカル版実装の
      受理面を整合させる（CR-002。HITL 2026-11-10 承認）。
    verification_refs: [TS-005, TS-007]
    source_items: [AG-005]

assembly_evidence:
  - id: AE-001
    label: op1-req031-029-row
    target_file: docs/requirements/REQ-031.md
    heading: "## 要件"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok (target_unique, old_text_expected_count, preconditions_passed)"
    checks_post: "3/3 ok (target_preserved, old_text_removed, line_count_consistent)"
    target_content_sha256: e318fc63ac354ca04cc1805458f7117aa605eca50b5bf7f9533a31395b45b9ee
    edit_sha256: 154a573ac35bba3934c9954ebb5fb3aa94d9873a603ae8d2f824a0dd652ea99a
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T00:39:17.196Z"
    written: false
  - id: AE-002
    label: op2-req015-purpose-r2
    target_file: docs/requirements/REQ-015.md
    heading: "## 目的"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: 0231276a0d22b85ccc523db59b1069f9c8115c4f391ca62db4493b637f061c78
    edit_sha256: f7ac98206a2b01f84219af127ed17c87e5e51ea218be95233d2c4f7ca6058952
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T01:01:59.683Z"
    written: false
  - id: AE-003
    label: op3-req015-012-row-r2
    target_file: docs/requirements/REQ-015.md
    heading: "## 要件"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: 0231276a0d22b85ccc523db59b1069f9c8115c4f391ca62db4493b637f061c78
    edit_sha256: ee5f38a1fecd8701b3ba0293313db075cc057e1c24644cb80251179bcd11797c
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T01:01:59.768Z"
    written: false
  - id: AE-004
    label: op4-localcasefile-labels-r2
    target_file: docs/designs/local/local-case-file.md
    heading: "## role: tracking の条件付きスキーマ"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: 59ef6e1dc5d960f5f89cc8cdf1218d73adb136e4c1b50bce3d7ffe9ef7dd2d76
    edit_sha256: 2bb2dc9e36a46700a2d3fb9ee30bd4a29310bbf8d91cc3e8abbe415c3a6261f9
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T01:01:59.847Z"
    written: false
  - id: AE-005
    label: op5-caseauto-wave-r2
    target_file: docs/designs/commands/case-auto.md
    heading: "## 現在の動作"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: a404e8a2275cfcdfe8207a925eeab848784dd094c779ab670aa914976653348c
    edit_sha256: e29a92d03ce24ce89406a34d019105e00daab7d01a954c0ded05f1f07abdbe1c
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T01:01:59.917Z"
    written: false
  - id: AE-006
    label: op6-v4delegation-l74
    target_file: docs/designs/workflows/v4-delegation-contracts.md
    heading: "### 実装委譲の受領側検査情報候補（output_contract）"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: 40ea5c2fccff8d146712830f8208d004f41efd8fa3d7303e2fc1da0da1475298
    edit_sha256: 8f2923e9b95c203121584755333cba3fb55fe461b53f7b1d19589bd9eef3317b
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T00:39:17.566Z"
    written: false
  - id: AE-007
    label: op7-caseauto-stoppropagation-r2
    target_file: docs/designs/commands/case-auto.md
    heading: "### 停止伝播契約（REQ-015-012）"
    operation: replace
    expected_old_count: 1
    match_count: 1
    replaced_count: 1
    checks_pre: "3/3 ok"
    checks_post: "3/3 ok"
    target_content_sha256: a404e8a2275cfcdfe8207a925eeab848784dd094c779ab670aa914976653348c
    edit_sha256: 0634747e3a3ce782084b4a32e468b61f7035b762d0caba25576bb7b51719d1ab
    checker: "assemble-draft-section 0.2.0 (heading_match=exact-after-normalization, old_text_count_check=true)"
    executed_at: "2026-11-10T01:01:59.986Z"
    written: false
  # note: 全操作とも組立・検査のみ（書込みなし）。AE-002〜AE-005・AE-007 は adversarial-review の accepted findings
  #   （AF-002/003/008）反映後の本文で再実行した第二代証拠。変更本文の適用は Definition 保存内部責務
  #   （case-ready / case-revise）が実行する。

case_open_hints:
  epic_needed: false
  wave_hints: []

major_change_notification:
  notified_before_save: true
  notified_at: "2026-11-10T10:02:00+09:00"
  summary: |
    REQ-031-029 行・REQ-015（目的文・REQ-015-012 行）の文言更新（状態別必須欄化・bounded resolution 先行化）と
    Design 4節（local-case-file・case-auto×2〔Wave 反復制御・停止伝播契約〕・v4-delegation-contracts）の更新、
    配布物実現面（case-run/adapter の3点ゲート再述、case-auto 停止伝播同期、Jev Tool 説明文4文件、
    agentdev-gh local スキーマ2文件、runner-local.ts 受理面と試験追随）を含む。変更理由・内容・影響・確定/未確認の
    区別は本 workflow の実行出力（ドラフト保存前に提示した事前通知）に記録した。
```

# summary

## 経緯と判断記録（人間可読補助。処理の正は上記 draft-data）

- 入力: `C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-simplification-c-beta-doc-contracts.md`（req-input・C-β 文書系 A-1〜A-6・実装計画第53報告 v8〔2026-11-10 利用者承認〕由来）。
- HITL 2件（回答根拠は承認済み計画書 v8 から機械的に導出）: CR-001（A-1 列挙型再述の全同期＋ゲート名称「3点ゲート」維持）、CR-002（A-4/A-6 実装受理面も同一 Case で整合）。
- adversarial-review（default-on）: 判定 PROCEED。accepted findings AF-001〜AF-008 をすべて反映
  （AF-001: 既存試験2件の拒否 pin 前提逆転、AF-002: tracking は enum 所属検査適用外の明記、AF-003: Workflow Skill/stage 3 の語彙分離、
  AF-004: case-auto SKILL.md L70 の同期追加、AF-005: pin 試験3制約の明示、AF-006: not_configured を no-fallback 列挙に内包、
  AF-007: rg 範囲限定、AF-008: 上位合意矛盾の停止条件明記）。rejected findings 5件（RF-001〜005）は review 報告のとおり却下。
- Jev 先行評価（Stage 1）: 既存REQ照合（obs 20261110T002423Z-4e2c）・最終分類・Design 分離（obs 20261110T002447Z-f60f）。
  最終判断は評価器結果と同一（差異理由なし）。
- work_type=maintenance（契約是正。実装ロジックの欠陥修正ではなく契約記述の整合化）、scale=standard
  （単一 Case C-β。分解計画は承認済み計画 v8 が事前所有）。
- SPLIT シグナル: REQ-031（要件行36行）・REQ-015（12行）とも UPDATE のみ（APPEND なし）のため SPLIT 提案対象外。
  生成 draft 自体も要件行新規作成なし。

## 変更誘発境界リスク分析（5観点の確認記録と test strategy 投影先）

- dependency boundary（docs 正本と配布物の規定同期漏れ）→ TS-001/TS-002/TS-004/TS-005/TS-006 の読取突合、TS-009 の検索残存確認
- client/server boundary（Tool 説明文は呼出元への契約表明。旧説明文が fallback を誘導）→ TS-003
- execution boundary（3点ゲート・停止伝播は case-run/case-auto/adapter 3技能間の実行契約。再述間不整合が実行時判断を分岐）→ TS-001/TS-002
- build/runtime boundary（plugin.ts/registration.ts の description 変更・runner-local.ts 受理面変更と型検査・pin 試験）→ TS-005/TS-007
- environment propagation boundary（src/common 正本→.opencode 投影の双方反映）→ TS-008（source/link 両 profile）

## 対象外（入力どおり）

- A-7〜A-13（実装系是正: agentdev-gh の PR 対象識別・読戻し照合・gh api 検出・textlint 追随・導入先・完了条件個別対応・停止分類）。
  別 req-input で投入する
- F-2〜F-9・E-1・B1〜B3（別 Case）
- 第43報告 P-001（revisions 許可集合）は実施済み（PR #3986）
- DEC-008 背景節の旧引用（決定時点の歴史記録）、docs/reports/ 配下（履歴記録領域）、scripts fixtures（履歴 fixture）
