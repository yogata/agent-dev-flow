---
draft_type: req_draft
topic_slug: adf-simplification-c-alpha2-small-fixes
status: draft
created_at: 2026-11-10T19:50:00+09:00
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: maintenance

# scale: standard / large
scale: standard

# summary: 当該 draft が合意したかの1段落要約
summary: >-
  ADF 全体簡素化・実装計画（第53報告 v8・2026-11-10 利用者承認）の C-α2 小修正 F-2〜F-9 を要件定義した。
  F-2/F-5/F-8 は一括是正REQ（仮 REQ-120・REQ-119 型3行）、F-3 は REQ-036-034 追記、F-4 は REQ-090-030 追記と
  custom-tool-contracts Design 注記、F-9 は 9 Design ファイル（document-model + 8 v4 Design）の移行期優先規則の
  歴史的説明化として保存する。F-6/F-7 は既存要件行（REQ-032-014/037/038・REQ-029-015・REQ-021-032・REQ-012-030）
  で規定済みのため反映作業のみとし要件行を追加しない。組立検査12件すべて dry-run 合格済み。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: >-
      F-2（第49報告 R-002）: trusted-distribution-gate の配置・起動・失敗時の扱い（--profile/--archive 指定、
      exit 0/1/2 の意味、検査不能時の fail-closed 扱い）を
      .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/README.md（新規）へ1ファイルとして集約する。
      内容は既存文書（repo-agentdev-integrity SKILL.md「Validator 呼び出し規約」ほか references、
      docs/designs/integrity/distribution-boundary.md 各節）からの抽出とし、新規約の創出をしない。
      trusted-distribution-gate の構成要件の所有は REQ-099-020 が正である。受け入れ条件: README の規約的表明の各行に出典が
      機械抽出可能な形で付され、リンク先がすべて実在し、既存文書と矛盾する記述がないこと。
  - id: AG-002
    content: >-
      F-3（第46報告 I-010）: inspect-docs の完了報告に、待ち行列（.agentdev/inspect/inbox の未処理検出事項）の滞留期間として
      最古エントリの経過日数を、完了報告の付帯情報として含める（REQ-036-010 の出力契約の列挙に対する診断出力の追加ではなく、
      報告付帯情報の追加と位置づける）。契約追加は最小限とし、新規の機構を作らない。変更面は inspect-docs の報告契約
      （SKILL.md 完了報告 STEP、references、完了報告 template standard.md）。
  - id: AG-003
    content: >-
      F-4（第45報告 J-002）: agentdev_jev の観測書込みは sourceRevision を次の規則の順で正規化して保存する。
      (1) 前後の空白と注釈（（…）・(…)）を除去する。(2) (1) 適用後の値が4〜40桁の16進数のとき小文字化する。
      (3) unknown・unspecified、および (1) 適用後も (2) 該当以外の作業状態記述子（working-tree@…・RU-…・main@… 等）は
      そのまま保存する（記述子の形式契約化は対象外とする）。(4) (1) の適用後に空になる値は入力事前検証失敗（invalid-input）
      として構造化失敗とし、observation を生成しない（REQ-090-002 と同じ経路）。正規化後の値は REQ-090-006 の一次事実として
      保存する sourceRevision の正規形であり、REQ-090-026 の版区切り判別を破らない。既存観測の遡及修正・移行・書換えを
      行わない。実装面は src/common/tools/agentdev-jev/observation.ts と試験。規則の確定値は入力（実装計画）から変更しない。
  - id: AG-004
    content: >-
      F-5（第46報告 B-001）: backlog-auto の evidence 保存手順（references の Evidence 節）に、保存時の拡張子規則
      「捕捉した標準出力を保存する evidence ファイルの拡張子は .txt 等、出力形式に対応するものとする」を定義する。
      規則本文の恒久所有は当該要件行とし、行本文に規則1文を verbatim で含める。既存の evidence ファイル（4件）の改名をしない。
  - id: AG-005
    content: >-
      F-6（第22報告 I-003）: case-close の完了ゲート関連文書において、検査不能時に停止（fail-closed）と代替検証のどちらを
      求めるかの関係を1箇所に明確化する。文書整理のみで実装・現行動作を変えない。この内容は既存要件行
      （REQ-032-014「検証不能は完了扱いしない」、REQ-032-037「代替検証は同等以上の観測能力・未証明範囲不増を確認できないなら
      達成証拠としない」、REQ-032-038、REQ-029-015「代替経路履行なしに検査省略して成功扱いしない」）により規定済みであり、
      新規の要件行を付けず反映作業として扱う。明確化した統合文の全要素が被覆行にトレース可能であることを検証で担保し、
      被覆されない要素が現れた場合は新規要件行へ昇格する。
  - id: AG-006
    content: >-
      F-7（第6報告 D-001）: agentdev-traceability の参照文書（references/{sidecar-and-policy,check-interpretation}.md）を、
      policy.yaml の3軸（verification/design/implementation の必須・任意）モデルに追随させた説明へ修正する。
      実装（scripts/lib/verification_scope.ts の3軸解決）は正しいため文書のみの修正。この内容は既存要件行
      （REQ-021-032 policy.yaml 3軸機構、REQ-012-030 検証対応要否は policy.yaml 所有・未指定は必須）により規定済みであり、
      新規の要件行を付けず反映作業として扱う。修正文は配布物本文に REQ/Decision 識別子を書かない（IR-055）。
  - id: AG-007
    content: >-
      F-8（第41報告 R-003）: .agentdev/README.md の状態表・樹形図について、backlog-auto/・blocked/ を記載するか主要な
      正規状態の案内に留めるかの組分けを確定し、状態表の約束対象規則を1文で明示して表の約束範囲が文書内で一意に読めるようにする。
      組分けの選択結果と理由は Definition（Case 設計）に記録する（入力が Case 設計での確定を明示）。状態表の個別規則
      （Producer/Consumer/Retention 等）をこの要件行で再述しない。受け入れ条件: .agentdev/ 直下の実在ディレクトリ列挙との機械照合で
      各ディレクトリが表記載または約束対象規則による除外のいずれかに分類でき、分類不能なディレクトリが0件であること。
  - id: AG-008
    content: >-
      F-9（第14報告 L-001）: v3→v4 移行優先規則を記述する現行 Design の当該規定を歴史的説明へ移す。対象は 9 箇所:
      docs/designs/foundations/document-model.md「信頼できる情報源の優先順位」節の移行期間規定、および 8 つの v4 Design
      （workflows/v4-standard-lifecycle、workflows/v4-lifecycle-state-machine、quality/v4-quality-gate-model、
      foundations/v4-traceability-model、foundations/v4-runtime-execution-model、foundations/v4-responsibility-boundaries、
      foundations/v4-operating-model、foundations/v4-durable-state-and-recovery）の位置づけ節の同一文。
      移行処遇記録（docs/designs/foundations/references/crosswalk-inventory.md）の全行が executed であることと照合し、
      記録上の移行完了と実際の処遇状態を区別して確認する。互換処理（v3 判定コード）自体の削除は要求しない。
      歴史的記録は REQ-103-020（過去時点の事実として保持・歴史的本文を書き換えない）の制約を維持する。
  - id: AG-009
    content: >-
      横断完了条件: (a) 試験基線（本線 2b352f7d3 時点・5,598試験・既知不合格12件〔integrity 1・src 0・plugins+scripts 11・
      変更由来0〕）に対し、Case 開始時に既知不合格テスト名リストを検証証拠として固定し、最終 pull/merge 後の merge HEAD での
      再試験の不合格名集合から当該リストを差し引いた新規不合格が0件であること（総数 drift は並行 merge 由来と commit attribution
      で説明できる限り合格阻害としない）。(b) IR-055: merge HEAD で check_integrity を実行し IR-055 baseline 差分0件であること
      （比較に用いた baseline ファイルの git リビジョンを検証証拠に記録。変更ファイルに対する grep は前置自己点検に過ぎない）。
      (c) 変更した skill/command パスの src/common 側と .opencode 側の hash が一致すること（check_integrity 投影ミラー検査合格）。
      (d) 整合性検査（QG相当）に合格すること。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adf-simplification-c-alpha2-small-fixes
    source_items: [AG-001, AG-004, AG-007]
    content: |
      ---
      id: REQ-120
      title: ADF 全体簡素化 C-α2 小修正（配布ゲート README 集約・evidence 拡張子規則・状態表約束範囲）
      created: 2026-11-10
      updated: 2026-11-10
      ---

      ## 目的

      ADF 全体簡素化・実装計画（第53報告 v8・2026-11-10 利用者承認）の C-α2（小修正 F-2〜F-9）のうち、新規の恒久命題の創出または新規成果物の作成義務に該当する 3 作業単位（配布ゲート README 集約・backlog-auto evidence 拡張子規則・.agentdev 状態表の約束範囲の一義化）の要件行を収容する。既存の要件行により既に規定される反映のみの修正（F-6・F-7）と Design 操作が主体の修正（F-9）には本 REQ は要件行を付けず、F-3（inspect-docs 報告への滞留期間）は REQ-036 へ、F-4（sourceRevision 正規化）は REQ-090 へ、それぞれ追記行として保存する。行の選別原理は「新規の恒久命題の創出または新規成果物の作成義務に行を付す。既存行により既に規定される反映のみの修正には行を付けない」である（REQ-119 型の一括是正REQの前例構成に従う）。

      ## 要件

      | 要件ID | 要件 | 受け入れ条件 | 検証 |
      |---|---|---|---|
      | REQ-120-001 | trusted-distribution-gate の配置・起動・失敗時の扱い（--profile/--archive の指定、exit 0/1/2 の意味、検査不能時の fail-closed 扱い）を `.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/README.md`（新規）へ1ファイルとして集約すること。内容は既存の配布境界文書・Validator 呼び出し規約等からの抽出とし、新規約の創出をしないこと（trusted-distribution-gate の構成要件の所有は REQ-099-020 が正である） | README の規約的表明の各行に出典（既存文書の該当箇所）が機械抽出可能な形で付され、リンク先がすべて実在すること。既存文書と矛盾する記述がないこと | TS-001 |
      | REQ-120-002 | backlog-auto の evidence 保存手順（references の Evidence 節）に、保存時の拡張子規則「捕捉した標準出力を保存する evidence ファイルの拡張子は .txt 等、出力形式に対応するものとする」を定義すること。規則本文の恒久所有は当該行とし、既存の evidence ファイルの改名をしないこと | 拡張子規則が references に定義され、git diff --name-status で既存 evidence ファイルの改名が 0 件であること | TS-004 |
      | REQ-120-003 | `.agentdev/README.md` の状態表・樹形図について、backlog-auto/・blocked/ を記載するか主要な正規状態の案内に留めるかの組分けを確定し、状態表の約束対象規則を1文で明示して表の約束範囲が文書内で一意に読めるようにすること。組分けの選択結果と理由は Definition（Case 設計）に記録すること。状態表の個別規則（Producer/Consumer/Retention 等）を本行で再述しないこと | `.agentdev/` 直下の実在ディレクトリ列挙との機械照合で、各ディレクトリが表記載または約束対象規則による除外のいずれかに分類でき、分類不能なディレクトリが 0 件であること | TS-007 |

      ## 適用範囲

      ### 対象

      - F-2（trusted-distribution-gate README 集約）
      - F-5（backlog-auto evidence 拡張子規則）
      - F-8（.agentdev/README.md 状態表の約束範囲の一義化）
      - 同一 Case 内で実施する関連修正: F-3（REQ-036-034 として規定）、F-4（REQ-090-030 として規定）、F-6・F-7（既存要件行の規定どおりの文書整理）、F-9（Design 操作）

      ### 対象外

      - A-7〜A-13（実装系是正）・E-1（参照整理）・B1〜B3（別途要求化）
      - F-1（実施済み・PR #3986）
      - F-4 の既存観測の遡及修正と作業状態記述子の形式契約化
      - F-6・F-7 の実装・現行動作の変更（文書整理のみ）
      - F-9 の互換処理（v3 判定コード）自体の削除

      ## 備考

      - 要件番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）。
      - F-6・F-7・F-9 に要件行を付けない判断の記録: F-6 は REQ-032-014（検証不能は完了扱いしない）・REQ-032-037（代替検証は同等以上の観測能力・未証明範囲不増を確認できないなら達成証拠としない）・REQ-032-038・REQ-029-015（代替経路履行なしに検査省略して成功扱いしない）により規定済み。F-7 は REQ-021-032（policy.yaml 3軸機構）・REQ-012-030（検証対応要否は policy.yaml 所有・未指定は必須）により規定済み。F-9 は Design 操作（document-model.md ほか9ファイルの歴史的説明化）が正であり、新規の恒久命題を創出しない。
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-036.md
    target_area: 要件
    source_items: [AG-002]
    content: |
      | REQ-036-034 | inspect-docs の完了報告は、待ち行列（inspect inbox の未処理検出事項）の滞留期間として最古エントリの経過日数を、完了報告の付帯情報として含めること（REQ-036-010 の出力契約の列挙に対する診断出力の追加ではなく、報告付帯情報の追加と位置づける）。契約追加は最小限とし、新規の機構を作らないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-090.md
    target_area: 要件
    source_items: [AG-003]
    content: |
      | REQ-090-030 | agentdev_jev の観測書込みは sourceRevision を次の規則の順で正規化して保存すること。(1) 前後の空白と注釈（（…）・(…)）を除去する。(2) (1) 適用後の値が4〜40桁の16進数のとき小文字化する。(3) unknown・unspecified、および (1) 適用後も (2) 該当以外の作業状態記述子（working-tree@…・RU-…・main@… 等）はそのまま保存する（記述子の形式契約化は対象外とする）。(4) (1) の適用後に空になる値は入力事前検証失敗（invalid-input）として構造化失敗とし、observation を生成しない（REQ-090-002 と同じ経路）。正規化後の値は REQ-090-006 の一次事実として保存する sourceRevision の正規形であり、REQ-090-026 の版区切り判別を破らないこと。既存観測の遡及修正・移行・書換えを行わないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: document-model
    target_area: 信頼できる情報源の優先順位
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      v4 移行期間中、accepted の v4 モデル定義 Design と未置換の v3 accepted Design の衝突は、当該 v3 Design の処遇実行段階まで v3 を正とする（v3-v4-crosswalk.md 処遇実行原則）。
      置換後（挿入文）:
      v3 → v4 移行期間中は、accepted の v4 モデル定義 Design と未置換の v3 accepted Design の衝突について、当該 v3 Design の処遇実行段階まで v3 を正とする扱いとした（v3-v4-crosswalk.md 処遇実行原則。処遇記録 crosswalk-inventory.md の全行 executed を移行完了の記録と区別して照合済み）。この規則は移行完了に伴い現行規範ではなく、歴史的説明として保持する（REQ-103-020）。
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: responsibilities
      slug: custom-tool-contracts
    target_area: 対象操作の境界（初期セット）
    source_items: [AG-003]
    content: |
      - sourceRevision の正規化: 観測書込みは sourceRevision から前後の空白と注釈を除去し、16進数の commit hash 相当は小文字化して保存する。unknown・unspecified・作業状態記述子はそのまま保存し、正規化後に空になる値は入力事前検証失敗として observation を生成しない。規則の確定値は REQ-090-030 を正とする。既存観測の遡及修正は行わない。
    application_notes: Jev 観測契約の直近へ配置し、issue_close 子節には入れない。適用時に節末尾の組立位置を確認し、子節へ入る場合は位置を修正して再検査する。ADF-COVERS(design) 宣言へ REQ-090-030 を追加する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v4-standard-lifecycle
    target_area: ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: workflows
      slug: v4-lifecycle-state-machine
    target_area: ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: quality
      slug: v4-quality-gate-model
    target_area: ADF v4 Quality / Verification / Evidence / Gate モデル
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
  - id: ACT-DESIGN-006
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-traceability-model
    target_area: ADF v4 Traceability モデル（Change / Evidence 中心）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
    application_notes: 核心文の後の個別追記事項（REQ-107/v5 語義）を保持し、核心文のみを置換する。
  - id: ACT-DESIGN-007
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-runtime-execution-model
    target_area: ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
  - id: ACT-DESIGN-008
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-responsibility-boundaries
    target_area: ADF v4 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
  - id: ACT-DESIGN-009
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-operating-model
    target_area: ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。
    application_notes: 核心文の後の個別追記事項（REQ-103-020/021 導線）を保持し、核心文のみを置換する。
  - id: ACT-DESIGN-010
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: foundations
      slug: v4-durable-state-and-recovery
    target_area: ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）
    source_items: [AG-008]
    content: |
      置換前（削除対象・原文）:
      本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。
      置換後（挿入文）:
      本 Design の規定が v3 accepted Design と衝突する場合、移行期間中は当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）まで v3 を正とし、当該段階での置換実行をもって権威は本 Design へ移行した。処遇記録（references/crosswalk-inventory.md）は全行 executed 済みであり、この移行規則は現行規範ではなく歴史的説明として保持する（REQ-103-020）。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施した。

# conflict_resolutions: 壁打ち・審議で解消された衝突の記録（後続コマンドは同じ内容をユーザーへ再確認しない）
conflict_resolutions:
  - id: CR-001
    conflict: F-8 の backlog-auto/・blocked/ を状態表・樹形図へ記載するか、主要な正規状態の案内に留めるか。
    resolution: >-
      入力（実装計画第53報告 v8）が「選択は Case の設計で確定してよい（受け入れ条件は約束範囲の一意性）」を明示しているため、
      要件行は約束範囲の一義化の完了義務に限定し、組分けの選択結果と理由は Case 設計で確定して Definition へ記録する。
      後続コマンドはこの組分けをユーザーへ再確認しない。機械照合（分類不能ディレクトリ0件）が受け入れの正。
  - id: CR-002
    conflict: F-9 の編集範囲（document-model.md 1ファイルのみか、同一文が再述される 8 v4 Design を含む 9 箇所か）。
    resolution: >-
      adversarial-review（Stream A 所見 A-1）で 1 ファイルのみでは入力の受け入れ条件「現行判断に不要な過渡条件を読ませる構造が解消」が
      成立しないことが確定したため、9 箇所すべてを歴史的説明化する（選択肢①）。既存文は REQ-103-020 の歴史保持制約の範囲で
      意味を保持したまま時制と位置づけのみを変更する。v4-traceability-model と v4-operating-model は核心文のみを置換する。
      組立検査12件（dry-run）すべて合格済み。
  - id: CR-003
    conflict: F-3 の報告項目追加と REQ-036-010（出力は最小限の診断結果、問題候補、推奨アクション、必要な場合の要件定義入力案に限定すること）の出力契約の関係。
    resolution: >-
      滞留期間は完了報告の付帯情報であり、REQ-036-010 が限定する診断出力の追加ではない、という位置づけを要件行本文に明記して
      両立する（adversarial-review Stream A 所見 A-2）。変更対象に完了報告 template（standard.md）を含める。

# operation_units: 単一構造化入力でも操作対象ごとに1件の OU として出力
operation_units:
  - ou_id: OU-001
    target_req: REQ-120
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    target_req: REQ-036
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
  - ou_id: OU-003
    target_req: REQ-090
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
  - ou_id: OU-004
    target_design: docs/designs/foundations/document-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
  - ou_id: OU-005
    target_design: docs/designs/responsibilities/custom-tool-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
  - ou_id: OU-006
    target_design: docs/designs/workflows/v4-standard-lifecycle.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
  - ou_id: OU-007
    target_design: docs/designs/workflows/v4-lifecycle-state-machine.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
  - ou_id: OU-008
    target_design: docs/designs/quality/v4-quality-gate-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
  - ou_id: OU-009
    target_design: docs/designs/foundations/v4-traceability-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
  - ou_id: OU-010
    target_design: docs/designs/foundations/v4-runtime-execution-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
  - ou_id: OU-011
    target_design: docs/designs/foundations/v4-responsibility-boundaries.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
  - ou_id: OU-012
    target_design: docs/designs/foundations/v4-operating-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
  - ou_id: OU-013
    target_design: docs/designs/foundations/v4-durable-state-and-recovery.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
result: {}

# test_strategy: 各合意項目の検証方法（3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      新規 README の規約的表明の各行に出典（既存文書の該当箇所へのリンク）が付されていることを機械的または準機械的に確認する。README 内の相対リンク・パス先がすべて実在することを検査する。記載内容を既存17文書の該当節（repo-agentdev-integrity SKILL.md「Validator 呼び出し規約」「worktree 検査実行手順」、references/{vocabulary-registry,remediation-routing,gate-levels}.md、docs/designs/integrity/distribution-boundary.md の各節、REQ-099-020 が定める構成）と突合し、矛盾する規定・新規約の創出がないことを確認する。
    pass_criteria: |
      出典付きの規約的表明が既存文書と矛盾せず、リンク切れが0件であること。新規約（既存文書に由来しない規定）が0件であること。
    on_failure: |
      fix-and-reverify: 出典の付き方・文面を既存文書に合わせて修正し再検証する（README は .opencode-only スキル配下であり投影検査対象外である点も確認する）。
  - id: TS-002
    target_item: AG-002
    verification: |
      既知日時の待ち行列（.agentdev/inspect/inbox の fixture。日時ソースは検出事項 frontmatter の日時、不在時はファイル mtime とし、基準時計は実行環境の UTC、日数丸めは日付差の整数日）を入力として完了報告を生成し、最古エントリの経過日数が正しく表示されることを確認する。模板検査（check_templates.ts）が完了報告 template の変更で失敗しないことを確認する。変更後の src/common 側と .opencode 側の該当ファイル（SKILL.md・references・templates/inspect-docs/standard.md）の hash が一致することを確認する。
    pass_criteria: |
      経過日数が期待値と一致すること。模板検査合格・投影 hash 一致であること。報告が完了報告の付帯情報として当該項を含め、診断出力の列挙を変更しないこと。
    on_failure: |
      fix-and-reverify: 経過日数の算出または模板を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      src/common/tools/agentdev-jev の試験（bun test・cwd repo root・./付きパス指定）と型検査（tsc --noEmit）を実施する。試験行列は入出力例全件（866c86aaf（main HEAD）→866c86aaf、大文字16進40桁（注釈付き）→小文字化40桁、c7905af5→c7905af5、unknown→unknown、working-tree@2026 10 17→そのまま、（メモのみ）→構造化失敗）に加え、境界値（hex4桁・41桁・既に小文字のhex・0x 付き・全角/半角混在括弧対・先頭注釈・注釈連鎖・中間括弧対・空白のみ・unspecified）を含める。既存観測ファイル全部に対して新規則を適用するシミュレーションを行い、構造化失敗となる既存観測が0件・注釈剥離が生じる観測が34件（2026-11-10 実測値。注釈付き作業状態記述子）であることを確認する。変更差分が observation.ts と試験ファイルに限られることを確認する。
    pass_criteria: |
      試験・型検査がすべて合格すること。入出力例・境界値がすべて規則どおりであること。既存観測のシミュレーションで構造化失敗0件であること。
    on_failure: |
      fix-and-reverify: 正規化実装または試験を修正して再検証する（規則の確定値自体は変更しない。確定値との矛盾が入力由来で発見された場合は Case を停止して要件確認に戻す）。
  - id: TS-004
    target_item: AG-004
    verification: |
      backlog-auto references の証跡保存を説明する正規箇所1箇所へ拡張子規則が1文で追記されたことを確認する（end-to-end-execution.md の保存手順を第一候補とする）。他の reference に同一規則を重複定義しない。git diff --name-status で evidence ファイルの改名（R ステータス）が0件であることを機械検査する。
    pass_criteria: |
      拡張子規則の1文が追記され、既存 evidence ファイル4件の改名が0件であること。
    on_failure: |
      fix-and-reverify: 追記位置・文面を修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      明確化した統合文の全要素（検査不能時の fail-closed 停止・代替検証の成立要件・報告義務）が被覆行（REQ-032-014・REQ-032-037・REQ-032-038・REQ-029-015）にトレース可能であることを、要素ごとの出典対応で照合する。実行文書（case-close SKILL.md・references/issue-resolution-and-qg4.md）・Design・実装（check まわり）の該当箇所3引用を並置した照合証拠を提示する（または definition-realization-contract-pins.test.ts への追加pin）。
    pass_criteria: |
      統合文の全要素が被覆行にトレース可能であること。三者で同じ条件が読み取れること。実装・現行動作に変更がないこと。
    on_failure: |
      被覆されない要素（新規命題）が現れた場合は新規要件行へ昇格して要件定義に差し戻す。文面の不整合は fix-and-reverify で修正する。
  - id: TS-006
    target_item: AG-006
    verification: |
      修正後の参照文書の説明と実装の一致を、traceability_policy.test.ts（.opencode/skills/repo-agentdev-integrity/scripts/tests/）の実行、または fixture policy.yaml に対する verification_scope.ts の実行出力との軸ごとの比較で確認する。修正文が配布物本文に REQ/Decision 識別子を含まないことを grep で確認する（IR-055）。変更後の src/common 側と .opencode 側の該当ファイルの hash 一致を確認する。
    pass_criteria: |
      3軸（verification/design/implementation の必須・任意）の説明が実装の解決結果と一致すること。配布物本文の REQ/Decision 識別子差分0件であること。
    on_failure: |
      fix-and-reverify: 説明文を verification_scope.ts の動作に合わせて修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      .agentdev/README.md が状態表の約束対象規則（例: 正規状態のみ約束し、実行時キャッシュである cache/tmp/config/close-acceptance は約束対象外）を1文で明示していることを確認する。.agentdev/ 直下の実ディレクトリ列挙（Get-ChildItem または同等の機械的手段）と README の記載・規則を機械照合し、各ディレクトリが「表記載」または「規則による除外」のいずれかに分類できることを確認する。
    pass_criteria: |
      分類不能なディレクトリが0件であること。約束範囲が文書内で一意に読めること。
    on_failure: |
      fix-and-reverify: 約束対象規則または表記載を修正して再照合する。組分けの選択（記載/案内）自体は Case 設計の裁量であり、失敗の是正で選択を切り替えることは妨げない。
  - id: TS-008
    target_item: AG-008
    verification: |
      移行処遇記録（docs/designs/foundations/references/crosswalk-inventory.md）の全行の確定状態が executed であることを機械検査（行カウントと executed 計数の一致、2026-11-10 時点で131行）で確認し、記録上の移行完了と実際の処遇状態を区別した対応表を提示する。9 箇所（document-model.md + 8 v4 Design）の編集後文面が対応表と対応し、いずれも「現行規範ではなく歴史的説明として保持する（REQ-103-020）」を含むことを確認する。
    pass_criteria: |
      処遇記録の全行 executed が機械検査で確認できること。9 箇所すべてが歴史的説明化され、現行規範としての過渡条件を読ませる構造が解消していること。
    on_failure: |
      非 executed 行が発見された場合はfix-and-reverify でなく Case を停止する（移行未完了なら歴史的説明化の前提が崩れるため要件定義に差し戻す）。文面の不備は fix-and-reverify で修正する。
  - id: TS-009
    target_item: AG-009
    verification: |
      (a) Case 開始時に既知不合格12件（integrity 1・src 0・plugins+scripts 11）の不合格テスト名リストを検証証拠として固定する。(b) 最終 pull/merge 後の merge HEAD で bun test を再実行し、不合格名集合から固定リストを差し引いた新規不合格が0件であることを確認する（総数 drift は commit attribution で並行 merge 由来と説明できる限り阻害しない）。(c) merge HEAD で check_integrity を実行し IR-055 baseline（baselines/ir-055-baseline.json）差分0件を確認し、比較に用いた baseline の git リビジョンを記録する（変更ファイルの grep は前置自己点検に留める）。(d) 変更した skill/command パスの src/common 側と .opencode 側の hash 一致（check_integrity 投影ミラー検査合格）を確認する。
    pass_criteria: |
      新規不合格0件・IR-055 baseline 差分0件・投影 hash 一致・整合性検査合格のすべてが成立すること。
    on_failure: |
      fix-and-reverify: 変更由来の不合格は実装を修正して再検証する。既知不合格との判別が困難な場合は commit attribution で原因を特定する。

# realization_actions: 実現面の変更方針（artifact_actions とは分離した独立構造）
realization_actions:
  - id: RA-001
    concern: F-3 inspect-docs 完了報告面への滞留期間1項追加
    responsibility: inspect-docs の完了報告契約（SKILL.md の完了報告 STEP・references・完了報告 template）に待ち行列の滞留期間（最古エントリ経過日数）を付帯情報として追加する。診断出力の列挙は変更しない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-inspect-docs/SKILL.md（STEP-4-4 完了報告）"
      - "src/common/skills/agentdev-workflow-inspect-docs/references/{scan-and-doc-diagnostics,distribution-check-and-output}.md"
      - "src/common/commands/agentdev/templates/inspect-docs/standard.md"
    intent: 報告の読み手が待ち行列の滞留を定量的に把握できるようにする。契約追加は最小限とし新規機構を作らない。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-002
    concern: F-4 sourceRevision 正規化の実装と試験
    responsibility: src/common/tools/agentdev-jev/observation.ts の観測書込み経路に AG-003 の4規則を順に適用する正規化を実装し、入出力例・境界値・既存観測シミュレーションを試験に追加する。規則④は入力事前検証失敗（invalid-input）として既存の経路（REQ-090-002）に接続する。
    ownership_hints:
      - "src/common/tools/agentdev-jev/observation.ts（validateObservation まわり）"
      - "src/common/tools/agentdev-jev/tests/{observation,index,engine}.test.ts"
      - "実行: bun test（cwd repo root・./付きパス）・tsc --noEmit"
    intent: 観測の sourceRevision を分析者が消費できる正規形で保存し、注釈付き入力の散らつきを保存時点で解消する。既存観測は変更しない。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-003
    concern: F-5 backlog-auto evidence 保存時の拡張子規則の追記
    responsibility: backlog-auto の evidence 保存手順を定める reference の正規箇所1箇所へ、拡張子規則の1文（REQ 行本文と同一文面）を追記する。既存 evidence ファイルの改名はしない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-backlog-auto/references/{stage-execution,fan-in-and-reporting,end-to-end-execution}.md（各 Evidence 節）"
    intent: evidence 保存時の拡張子選択を規則として明示し、証跡の機械分類の安定性を高める。
    verification_refs: [TS-004]
    source_items: [AG-004]
  - id: RA-004
    concern: F-6 case-close 検査不能時の扱いの明確化（文書整理のみ）
    responsibility: case-close の実行文書において、検査不能時に停止（fail-closed）と代替検証のどちらを求めるかの関係を1箇所に明確化する。SKILL と reference の文言重複（issue-resolution-and-qg4.md L80/L92 の再掲）を整理対象に含める。実装・現行動作は変更しない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-close/SKILL.md（完了判定の契約状態記録・未追跡残存検証節、トレーサビリティ能力の利用節）"
      - "src/common/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md"
    intent: 検査不能時の停止と代替検証の関係を読み手が誤読しない構造にする。被覆行（REQ-032-014/037/038・REQ-029-015）の規定のみを反映する。
    verification_refs: [TS-005]
    source_items: [AG-005]
  - id: RA-005
    concern: F-7 traceability 参照文書の3軸モデルへの追随（文書整理のみ）
    responsibility: agentdev-traceability の参照文書（sidecar-and-policy.md の検証スコープポリシー利用手順節ほか）の説明を、policy.yaml と verification_scope.ts が解決する3軸（verification/design/implementation）モデルに追随させる。実装は正しいため変更しない。修正文に REQ/Decision 識別子を書かない（IR-055）。
    ownership_hints:
      - "src/common/skills/agentdev-traceability/references/{sidecar-and-policy,check-interpretation}.md"
      - "正の実装: scripts/lib/verification_scope.ts（VerificationPolicyResolution の3軸解決）"
      - "traceability/policy.yaml（verification:/design:/implementation: の default required + optional 一覧）"
    intent: 参照文書の説明と実装の動作を一致させ、policy.yaml の3軸指定を読み手が正しく理解できるようにする。
    verification_refs: [TS-006]
    source_items: [AG-006]
  - id: RA-006
    concern: F-2 trusted-distribution-gate README の新規作成
    responsibility: .opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/README.md（新規）に、配置・起動・失敗時の扱いを出典付きで集約する。新規約の創出をしない。.opencode-only スキル配下のため投影同期対象外であることを確認する。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/README.md（新規・86エントリの既存ディレクトリ）"
      - "抽出元: .opencode/skills/repo-agentdev-integrity/SKILL.md「Validator 呼び出し規約」「worktree 検査実行手順」、references/{vocabulary-registry,remediation-routing,gate-levels}.md、docs/designs/integrity/distribution-boundary.md 各節"
    intent: gate の扱いを1ファイルから読めるようにする（現状は複数文書に分散）。構成要件の所有は REQ-099-020 が正。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-007
    concern: F-8 .agentdev/README.md 状態表の約束範囲の一義化
    responsibility: .agentdev/README.md の状態表・樹形図について backlog-auto/・blocked/ の組分けを確定（記載 or 主要正規状態の案内）し、約束対象規則を1文で明示する。必要に応じて状態表・樹形図へ追記する。選択結果と理由を Definition に記録する。
    ownership_hints:
      - ".agentdev/README.md（79行・状態表・ディレクトリ構成）"
      - "実ディレクトリ実在: backlog-auto/・blocked/ のほか cache/・close-acceptance/・config/・extensions/・tmp/ が未掲載で実在"
      - "ドメイン状態ディレクトリ所有の最近接行: REQ-002-012"
    intent: 状態表の約束範囲を文書内で一意に読めるようにし、未掲載ディレクトリの組分けを機械照合可能にする。
    verification_refs: [TS-007]
    source_items: [AG-007]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_item: F-1
    disposition: not_applicable
    reason_code: already_satisfied
    reason: |
      F-1（配布ゲートの追加是正）は実施済み（PR #3986 マージ）。C-α2 の対象外。
    evidence:
      path: docs/designs/integrity/distribution-boundary.md
      section: 事前書き込み gate と最終 gate の契約
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: out-of-scope-group-a-e-b
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      入力ファイル（req-input-adf-simplification-c-alpha2-small-fixes.md）が A-7〜A-13（実装系是正）・E-1（参照整理）・B1〜B3 を対象外と明示している。E-1 は並行セッションの req draft（adf-simplification-c-gamma-reference-cleanup）として別途進行中。F-4 の既存観測の遡及修正と作業状態記述子の形式契約化も対象外。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-simplification-c-alpha2-small-fixes.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: F-6
    disposition: covered
    reason_code: already_satisfied
    reason: |
      F-6 の内容（検査不能時の fail-closed 停止と代替検証の関係）は既存要件行 REQ-032-014・REQ-032-037・REQ-032-038・REQ-029-015 により規定済み。本 Case では規定どおりの反映作業（文書整理）のみを行い、新規の要件行を追加しない。反映の検証は TS-005 が被覆行トレース可能性で担保する。
    evidence:
      path: docs/requirements/REQ-032.md
      section: 要件（REQ-032-014・REQ-032-037・REQ-032-038）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_item: F-7
    disposition: covered
    reason_code: already_satisfied
    reason: |
      F-7 の内容（policy.yaml の3軸モデルへの参照文書の追随）は既存要件行 REQ-021-032・REQ-012-030 により規定済み。本 Case では文書整理のみを行い、新規の要件行を追加しない。反映の検証は TS-006 が実装との一致で担保する。
    evidence:
      path: docs/requirements/REQ-021.md
      section: 要件（REQ-021-032）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_item: F-9
    disposition: not_applicable
    reason_code: saved_as_design_operation
    reason: |
      F-9 は Design 操作（document-model.md と8つの v4 Design、計9ファイルの歴史的説明化）が正であり、新規の恒久命題を創出しないため REQ 行を付けない。選別原理（REQ-120 目的節）と判断記録（REQ-120 備考）に恒久保持する。保存対象は ACT-DESIGN-001 と ACT-DESIGN-003〜010（ACT-DESIGN-002 は F-4 の観測契約注記）。
    evidence:
      path: docs/designs/foundations/document-model.md
      section: 信頼できる情報源の優先順位
      checked_at_commit: null
    related_removed_items: []

# assembly_evidence: 局所修正・追記の組立検査証拠（assemble-draft-section 0.2.0・全12件 dry-run 合格）
# 再開時は scripts/src/evidence-match.ts で現在条件と照合し、一致した証拠だけを再利用する
assembly_evidence:
  - target_file: docs/requirements/REQ-036.md
    target_content_sha256: a9ceb3a036844ab81b1eaf700f37ad3ae55bdfcf2f499e4dfe269f35cfdaeda6
    check_scope: { heading: "## 要件", start_line: 16, end_line: 52 }
    execution_conditions: { operation: append, edit_sha256: d41727194e67179aad3686ee216c10fb7e2a407645ec840d8cc66ae6120a213b, expected_old_count: null }
    checker: &assembly_checker { name: assemble-draft-section, version: "0.2.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: &assembly_references { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-11-10T10:41:37.003Z"
  - target_file: docs/requirements/REQ-090.md
    target_content_sha256: a857e2385c117303bd7913e3f8b7dd9a820343ce3f3a56d99d9873386f7a38c9
    check_scope: { heading: "## 要件", start_line: 14, end_line: 45 }
    execution_conditions: { operation: append, edit_sha256: 54402bdfedb9cb3e9c07a6b21645f794939fec207bec0051722b8f9442e6514e, expected_old_count: null }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: "2026-11-10T10:41:37.115Z"
  - target_file: docs/designs/foundations/document-model.md
    target_content_sha256: 779cce9d8d93d5ef68d6629680b53f0b461e2acc918001626bee07c4608ae827
    check_scope: { heading: "## 信頼できる情報源の優先順位", start_line: 339, end_line: 349 }
    execution_conditions: { operation: replace, edit_sha256: e868edfa7cba1d588a8228143d615c7cda6cbf61158ff3470fe203216f1487c6, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:17:47.685Z"
  - target_file: docs/designs/responsibilities/custom-tool-contracts.md
    target_content_sha256: 75a58d73bf500a492940bb5b6e79c9efe9e4e113f965a433227bc8631d054c86
    check_scope: { heading: "## 対象操作の境界（初期セット）", start_line: 39, end_line: 107 }
    execution_conditions: { operation: append, edit_sha256: 25e4399ac40275f5e54f8b0b2bc147c95d7e5599cd3711ab91d7c3e770dbfef2, expected_old_count: null }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 0 }
    executed_at: "2026-11-10T10:41:37.217Z"
  - target_file: docs/designs/workflows/v4-standard-lifecycle.md
    target_content_sha256: 0e22100f67bf1d7fe20685130fc93183073b7d5edd723f09e2ce102ded66d86d
    check_scope: { heading: "# ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）", start_line: 12, end_line: 85 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.323Z"
  - target_file: docs/designs/workflows/v4-lifecycle-state-machine.md
    target_content_sha256: 0d4b5f542cb3268c6656a0ea38f0e95b55dd7c2804c91569abbb06006fcb773b
    check_scope: { heading: "# ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）", start_line: 11, end_line: 88 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.431Z"
  - target_file: docs/designs/quality/v4-quality-gate-model.md
    target_content_sha256: b7b81a3496a88a4b45f4a360a3037e9c98263d7f7b695009f1adad61705e6575
    check_scope: { heading: "# ADF v4 Quality / Verification / Evidence / Gate モデル", start_line: 13, end_line: 149 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.537Z"
  - target_file: docs/designs/foundations/v4-traceability-model.md
    target_content_sha256: fc94b0274e6bc7123238061351111f7219b2894b32b8a30c06c6b930327cf064
    check_scope: { heading: "# ADF v4 Traceability モデル（Change / Evidence 中心）", start_line: 14, end_line: 150 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.644Z"
  - target_file: docs/designs/foundations/v4-runtime-execution-model.md
    target_content_sha256: af506bf6929aca4532c11d3f1c86a880475033afebf9222eb509f50d75da6e0c
    check_scope: { heading: "# ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ）", start_line: 10, end_line: 92 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.760Z"
  - target_file: docs/designs/foundations/v4-responsibility-boundaries.md
    target_content_sha256: 5d057c6b33828c471cd544d3df0b470ae91d826ab410dacc7a671016340101f8
    check_scope: { heading: "# ADF v4 実装責務境界（意味判断 Skill / 決定的処理 code / Harness adapter / Project Extensions）", start_line: 13, end_line: 173 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.865Z"
  - target_file: docs/designs/foundations/v4-operating-model.md
    target_content_sha256: f6a8c4e1f775cfd13281e8c3dc6ba3a69bfeb5997887d207fe9d197c65d5535e
    check_scope: { heading: "# ADF v4 Operating Model（目的・三層責務・Project Contract・寿命・文書モデル）", start_line: 15, end_line: 111 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:37.971Z"
  - target_file: docs/designs/foundations/v4-durable-state-and-recovery.md
    target_content_sha256: 718314bc7f8cc6c488de3b11e20251dd5297bb9eda4cb3eb54d0e75a04fa272f
    check_scope: { heading: "# ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整）", start_line: 12, end_line: 98 }
    execution_conditions: { operation: replace, edit_sha256: acbcdbbe14185993697c9fa89c7bcafe8c03af2821b889dd2707eaecbbbc0ae0, expected_old_count: 1 }
    checker: *assembly_checker
    result_affecting_references: *assembly_references
    checks_summary: { pre: { count: 3, all_ok: true }, post: { count: 3, all_ok: true } }
    diff_compact: { changed_lines_count: 1, added: 1, removed: 1 }
    executed_at: "2026-11-10T10:41:38.073Z"

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  wave_hints: []

# important_change_notification: 既存正規成果物への重要変更を STEP-9 保存より先に利用者へ通知した事実の記録
important_change_notification:
  delivered_before_save: true
  delivered_at: 2026-11-10T19:50:00+09:00
  subjects:
    - >-
      F-9 移行期優先規則の歴史的説明化（document-model.md + 8 v4 Design の計9箇所・各1文の時制変更と
      「現行規範ではなく歴史的説明として保持する（REQ-103-020）」の明記）。理由・影響・確定事項・未確認事項を通知済み。
  non_notified_minor_changes:
    - "REQ-036・REQ-090 への追記（新規行追加・既存行変更なし）は軽微な変更として通知対象外"
```

# summary

C-α2 小修正 F-2〜F-9 の要件定義。8修正のうち新規の恒久命題・新規成果物の作成義務に該当する F-2/F-5/F-8 は一括是正REQ（仮 REQ-120・REQ-119 型3行）として新規作成し、F-3 は REQ-036-034、F-4 は REQ-090-030（と custom-tool-contracts Design 注記）として追記する。F-6/F-7 は既存要件行で規定済みのため反映作業のみ（行なし）、F-9 は 9 Design ファイルの歴史的説明化（adversarial-review で 1 ファイルから 9 箇所へ範囲確定）。すべての局所修正・追記は組立スクリプトによる dry-run 構造検査12件合格済み（証拠は assembly_evidence）。実現面は RA-001〜RA-007（skill 報告面・observation.ts 実装・references 追記・README 新規・状態表整理）、検証は TS-001〜TS-009（既知不合格12件の固定リスト差分方式・check_integrity による IR-055 実ゲート・投影 hash 一致を含む）。work_type は maintenance、scale は standard（変更ファイル数シグナルを超えるが各修正は微小で単一 Case 計画が確定済みのため非昇格）。REQ 番号 REQ-120 は仮記で、採番は alloc-req-number.ts の確定値を正とする。
