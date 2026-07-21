---
draft_type: req_draft
topic_slug: req-spec-responsibility-reallocation
status: saved
created_at: 2026-07-21T22:19:31+09:00
source_rus:
  - RU-20260721-03
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: docs_chore（既存分類基盤への全量是正・運用徹底。新規関心追加なし）
work_type: docs_chore

# scale: feature 専用のため省略（docs_chore は direct_case）。
# workflow-lifecycle skill「feature のスケール（standard / large）判定基準」による。
scale:

# summary: 当該 draft が合意した1段落要約
summary: |
  現行REQ群・現行SPEC群の全要件行と全IDなし規範記述を完全性台帳へ列挙し、5状態列
  （classification_decided / destination_decided / change_applied / destination_verified /
  content_accounted）が yes になるまで完了扱いとしないという運用徹底を REQ-0101 へ APPEND する。
  REQ-0158 は段階判定（REQ-0108 統合候補の評価、SPEC/IR 移管、残存判定を経て維持または retire）、
  REQ-0161 は retire 第一候補（retired/REQ-0161.md へ移動、物理削除しない）。
  完全性台帳は case 実行 worktree 内の一時作業ファイル（commit 対象外、PR 完了まで保持、完了後削除）。
  ADR 不要（REQ-0101 + document-model.md + ADR-0103 で分類基盤確立済み）。

# auto_gate: case-auto 自走可否。REQ-0158 段階判定・SPEC/IR 移管・完全性台帳5状態管理は
# case-run 自律ループと case-close 品質ゲートで担保可能。意味レビュー等で問題時は
# case-auto が Step 7 停止条件で停止する。CR-006 で見直し経緯を記録。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      主対象 REQ は REQ-0101（文書・REQ管理基準）。REQ-0101-057「文書分類ポリシーの恒久内容が
      REQ-0101 の関心対象に含まれ」、REQ-0101-058「文書分類定義の一次所有先が REQ-0101 +
      docs/specs/foundations/document-model.md に統一されていること」に基づき、既存分類基盤への
      全量是正・運用徹底を REQ-0101 の要件行として APPEND する。新規 REQ は作成しない。
      副対象は REQ-0136（req-define/spec-save の動作変更が発生した場合のみ UPDATE）。
      REQ-0155（文書分類テスト基盤）は適用範囲の対象外に「既存REQ/SPECの初回棚卸し
      （RU-0001 第2層、別途 inspect-docs/case-open/case-run）」が明記されているため今回対象外。
      REQ-0156（SPEC ドメイン別体系化）は SPEC 配置が主題であり、REQ/SPEC 本文の責務再分類の
      所有者ではないため今回対象外。work_type は docs_chore、scale は feature 専用のため省略
      （docs_chore は direct_case）。ADR 不要（REQ-0101 + document-model.md + ADR-0103 で分類基盤確立済み）。

  - id: AG-002
    content: |
      完全性台帳は case 実行 worktree 内の一時作業ファイル（commit 対象外、PR 完了まで保持、
      完了後削除）として保持し、REQ/SPEC 配下には置かない。性質は作業記録であり、恒久成果物ではない。
      台帳は5状態列を持つ: classification_decided（分類が確定）/ destination_decided（保持先が確定）/
      change_applied（実際の編集完了）/ destination_verified（移管先の実在と内容確認）/
      content_accounted（元記述が変更後成果物に欠落なく保持）。
      編集開始条件は classification_decided=yes + destination_decided=yes + 要判断=0件。
      完了条件は change_applied=yes + destination_verified=yes + content_accounted=yes。
      台帳対象は「現行REQ 群の全要件行（ID付き要件行）+ 全IDなし規範記述（REQ-0158、REQ-0160 等、
      限定せず全件）」であり、実行開始時点で再計測して確定する。

  - id: AG-003
    content: |
      個別 REQ の取扱い。REQ-0158（Targeted Docs Integrity Guard、現要件行 REQ-0158-001/002）は
      段階判定を行う: changed docs guard の保存工程における恒久契約（変更ファイル限定検査の実施、
      strict failure 時の停止、false-clean 予防等）は REQ-0108（docs-check / Validation / Tests）との
      統合候補として評価し、統合可能なものは REQ-0108 の要件行へ移管する。CLI 引数、JSON 出力形式、
      Phase 番号、検知語リスト、判定表等の実装詳細は SPEC（targeted-docs-guard-implementation.md、
      validator-split-criteria.md 等）または IR（integrity-rule-catalog、rule-ownership 等）へ移管する。
      REQ-0108 統合および SPEC/IR 移管の完了後に REQ-0158 に独立関心が残存しない場合は retire
      （docs/requirements/retired/REQ-0158.md へ移動）、残存する場合は要約REQ として維持し移管済み
      実装詳細への相互参照を残す。
      REQ-0161（config.yaml および旧 doc-inputs 機構定義の完全削除、現要件行 REQ-0161-001〜005）
      は retire 第一候補。RU-20260721-03 が挙げる削除対象ファイル（.agentdev/config.yaml、
      docs/adr/ADR-0133.md、docs/specs/foundations/project-doc-inputs.md、retired/REQ-0157.md、
      project-doc-inputs.md）は全て現存しないことを確認済み（2026-07-21時点）。完了済み作業記録。
      REQ-0101-002「物理削除を第一選択肢とし、運用上は retired/ への移動も認める」に基づき、
      物理削除ではなく docs/requirements/retired/REQ-0161.md へ移動する（内容喪失防止）。
      恒久契約が残存する場合は現行REQへ統合し、なければそのまま retired へ移動する。

  - id: AG-004
    content: |
      case-open 構成は5 Wave の Epic flow を想定し、case-open が確定する。
      W1: 完全性台帳作成（全REQ・全要件行・全IDなし規範記述、実行時再計測で確定）。
      W2: REQ 是正（REQ-0101 APPEND 主、REQ-0158 段階判定、REQ-0161 retire、REQ-0136 必要時 UPDATE）。
      W3: SPEC 是正（document-model.md、targeted-docs-guard-implementation.md、validator-split-criteria.md、
      integrity-rule-catalog、rule-ownership 等、既存SPEC/IR への詳細移管）。
      W4: retire 処理 + docs/requirements/README.md、docs/DOC-MAP.md、mapping-table.md、相互参照の更新。
      W5: 検証（IR-044 含む docs-check、意味レビュー）。
      依存: W1 完了前に W2 以降は開始しない。W2 → W3 → W4 → W5 の直列依存。

# artifact_actions: REQ への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0101.md
    target_area: "## 要件 の表末尾（REQ-0101-069 の直後）へ新規行を追記"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-0101-070 | 現行REQ 群・現行SPEC 群の全要件行と全IDなし規範記述を完全性台帳へ列挙し、classification_decided / destination_decided / change_applied / destination_verified / content_accounted の5状態が yes になるまで完了扱いとしないこと。完全性台帳は case 実行 worktree 内の一時作業ファイル（commit 対象外、PR 完了まで保持、完了後削除）として保持し、REQ/SPEC 配下には置かないこと。編集開始条件は classification_decided=yes + destination_decided=yes + 要判断=0件、完了条件は change_applied=yes + destination_verified=yes + content_accounted=yes とすること |

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0158.md
    target_area: "ファイル末尾へ「段階的縮小と retire 判定」セクションを新設し、要件行 REQ-0158-003〜005 を追記。既存実装詳細行（CLI 引数、JSON 形式、Phase 番号、検知語等）は SPEC/IR 移管後に削除方向で整理。REQ-0158-001/002 は SPEC 移管対象"
    source_items: [AG-003]
    content: |
      ### 段階的縮小と retire 判定

      REQ-0158 は RU-20260721-03（REQ/SPEC 責務再分類と文書是正）に基づき、段階的に縮小し
      维持または retire を判定する。既存の実装詳細行（CLI 引数、JSON 出力形式、Phase 番号、
      検知語リスト、判定表等）は REQ から SPEC または IR へ移管する。

      | ID | 要件 |
      |---|---|
      | REQ-0158-003 | changed docs guard の保存工程における恒久契約（変更ファイル限定検査の実施、strict failure 時の停止、false-clean 予防等）は REQ-0108（docs-check / Validation / Tests）との統合候補として評価し、統合可能なものは REQ-0108 の要件行へ移管すること |
      | REQ-0158-004 | CLI 引数（--workflow、--files、--base-ref、--json、--fail-level、--declared-files 等）、JSON 出力形式、Phase 番号、検知語リスト、判定表、report フィールド定義等の実装詳細は SPEC（docs/specs/integrity/targeted-docs-guard-implementation.md、docs/specs/integrity/validator-split-criteria.md 等）または IR（docs/specs/integrity/rules/integrity-rule-catalog.md、docs/specs/integrity/rule-ownership.md 等）へ移管すること。REQ-0158-001/002 は SPEC 移管対象として扱うこと |
      | REQ-0158-005 | REQ-0108 統合および SPEC/IR 移管の完了後に REQ-0158 に独立した関心が残存しない場合は本 REQ を retire（docs/requirements/retired/REQ-0158.md へ移動）すること。残存する場合は本 REQ を要約REQ として維持し、移管済み実装詳細への相互参照を残すこと |

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0161.md
    target_area: "## retire 宣言 セクションを冒頭（## 概要 の直前）へ新設。ファイル自体を docs/requirements/REQ-0161.md から docs/requirements/retired/REQ-0161.md へ移動。frontmatter は id・title・created・updated を維持"
    source_items: [AG-003]
    content: |
      ## retire 宣言

      本 REQ は RU-20260721-03（REQ/SPEC 責務再分類と文書是正）に基づき retire する。

      **retire 理由**:

      - 本 REQ は完了済み作業記録であり、現行の安定契約を含まない。
      - RU-20260721-03 が挙げる削除対象ファイル（.agentdev/config.yaml、docs/adr/ADR-0133.md、docs/specs/foundations/project-doc-inputs.md、retired/REQ-0157.md、project-doc-inputs.md）は全て現存しないことを確認済み（2026-07-21 時点）。
      - 旧 doc-inputs 機構の参照は解消済み。

      **取扱い**:

      - REQ-0101-002「廃止REQは物理削除を第一選択肢とし、運用上は docs/requirements/retired/REQ-{NNNN}.md に移動して履歴参照用途に限定する選択肢も持つ」に基づき、物理削除ではなく docs/requirements/retired/REQ-0161.md へ移動する（内容喪失防止）。
      - REQ-0161-001〜005 のうち恒久契約が残存するもの（REQ-0161-005 baseline-aware strict pass 等）は現行REQへ統合し、なければそのまま retired へ移動する。統合有無は case-run 実行時に完全性台帳で確定する。

# conflict_resolutions: 壁打ちで解消された衝突
conflict_resolutions:
  - id: CR-001
    conflict: work_type と scale の組合せ。当初 docs_chore + scale=large を提案した。
    resolution: |
      棄却。agentdev-workflow-lifecycle skill に「feature のスケール（standard / large）判定基準。
      req-define Step 8 が参照する」と明記され、scale は feature 専用。docs_chore は direct_case で
      scale は省略する。ただし case-open が複数REQ/OU 構成から Epic flow を自律選択することは
      G13 と整合するため、operation_units 複数 + case_open_hints.epic_needed=true で表現する。

  - id: CR-002
    conflict: 主対象 REQ。当初 REQ-0136（REQ/SPEC 責務分離の徹底と新ワークフロー）を主対象と提案した。
    resolution: |
      棄却。REQ-0101-057「文書分類ポリシーの恒久内容が REQ-0101 の関心対象に含まれ」、
      REQ-0101-058「文書分類定義の一次所有先が REQ-0101 + document-model.md に統一」により、
      REQ-0101 が主対象。REQ-0136 は req-define/spec-save の動作変更が発生した場合のみ UPDATE 対象。
      REQ-0155 は適用範囲の対象外に「既存REQ/SPEC の初回棚卸し」が明示されており対象外、
      REQ-0156 は SPEC ドメイン別体系化が主題であり所有者ではないため対象外。

  - id: CR-003
    conflict: REQ-0158 と REQ-0161 の取扱い。当初 REQ-0158 は2行残して縮退、REQ-0161 は取扱い未規定だった。
    resolution: |
      REQ-0158 は段階判定（REQ-0108 統合候補の評価 → SPEC/IR 移管 → 残存で retire/維持判定）。
      REQ-0161 は retire 第一候補。retired/REQ-0161.md へ移動し、物理削除しない
      （REQ-0101-002 の運用選択肢を採用、内容喪失防止）。恒久契約残存確認は case-run で完全性台帳経由で実施。

  - id: CR-004
    conflict: 完全性台帳の配置。当初 .agentdev/drafts/ への配置を提案した。
    resolution: |
      棄却。.agentdev/drafts/ は case-open 完了後に削除対象（drafts は req-define 成果物の一時配置場所）。
      完全性台帳は case 実行 worktree 内の一時作業ファイル（commit 対象外、PR 完了まで保持、完了後削除）
      とする。性質は作業記録（REQ/SPEC に恒久配置しない）。

  - id: CR-005
    conflict: content_accounted の粒度。当初 content_accounted の単一状態のみを提案した。
    resolution: |
      棄却。単一状態では「分類未確定」「保持先未確定」「編集未完了」「移管先未検証」「内容欠落」の
      区別ができず、進捗管理と完了判定が曖昧になる。5状態列へ分離する:
      classification_decided / destination_decided / change_applied / destination_verified / content_accounted。
      編集開始条件（前2状態の yes + 要判断0件）と完了条件（後3状態の yes）を明確化する。

  - id: CR-006
    conflict: |
      auto_gate.auto_ready の設定。当初 auto_ready: false + stop_reasons 2件（意味レビューで人間判断必須、
      完全性台帳の5状態管理で各編集単位ごとに人間確認必須）を設定した。Step 10-2 auto_gate完了ゲートの
      手続き（stop_reasons をユーザーに提示し、解消方策を合意、または false のまま手動実行を選択）を踏み、
      ユーザー指摘により根拠の妥当性を再評価した。
    resolution: |
      auto_ready: true へ更新、stop_reasons を空にする。ユーザー合意により修正案を採用。
      根拠1「意味レビューで人間判断必須」は case-close の品質ゲートで担保され、case-auto の
      自走可能性（auto_ready）とは別軸。case-auto は Step 7 停止条件（11項目）で適宜停止可能。
      根拠2「完全性台帳の5状態管理で各編集単位ごとに人間確認必須」は過大評価。完全性台帳の状態遷移は
      ルールベースで可能、case-run 自律ループで更新可能。両根拠とも auto_ready の直接根拠として不適切。
      docs_chore でも case-auto は動作する（case-auto.md Step 3 の artifact_actions ベース分岐）。
      今回は artifact: req 3件のため、case-auto 起動時は req-save → case-open → case-run → case-close
      （spec-save スキップ）で自走する。

# operation_units: 複数REQ操作の依存構造
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260721-03
    target_req: REQ-0101
    operation: append
    scale:
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260721-03
    target_req: REQ-0158
    operation: update
    scale:
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260721-03
    target_req: REQ-0161
    operation: update
    scale:
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      (1) docs/requirements/REQ-0101.md の ## 要件 表に REQ-0101-070（完全性台帳要求）が追記されていることを確認。
      (2) 新規 REQ ファイル（docs/requirements/REQ-{新番号}.md）が作成されていないことを確認。
      (3) docs/adr/ADR-{新番号}.md が新規作成されていないことを確認。
      (4) work_type が docs_chore、scale が省略（null）であることを draft-data で確認。
      (5) REQ-0136 が artifact_actions に含まれていないことを確認（動作変更時のみ UPDATE のため）。
      (6) REQ-0155/0156 が operation_units に含まれていないことを確認。
    pass_criteria: |
      REQ-0101-070 が存在、新規REQ/ADR 0件、work_type=docs_chore、scale 省略、
      REQ-0136/0155/0156 は対象外（artifact_actions/operation_units に登場しない）。
    on_failure: |
      fix-and-reverify。REQ-0101 への APPEND 不足は追記、新規REQ/ADR が誤作成されていれば削除、
      work_type/scale の誤設定は draft-data を修正。REQ-0136/0155/0156 が誤って含まれていれば除外。

  - id: TS-002
    target_item: AG-002
    verification: |
      (1) case 実行 worktree 内に完全性台帳ファイルが存在すること（パス例: .worktree-*/completeness-ledger.md 等の作業ファイル）。
      (2) git status で当該台帳ファイルが commit 対象外（.gitignore 等で除外、または worktree 外）であることを確認。
      (3) 台帳が5状態列（classification_decided / destination_decided / change_applied / destination_verified / content_accounted）を持つことを確認。
      (4) 台帳が「全REQの全要件行 + 全IDなし規範記述」を列挙していることを確認（実行開始時点のREQファイル数と突合）。
      (5) 全行で5状態が yes であることを確認。要判断（pending）が0件であることを確認。
      (6) REQ/SPEC 配下（docs/requirements/, docs/specs/）に台帳ファイルが存在しないことを確認。
    pass_criteria: |
      台帳が worktree 内一時ファイルとして存在、commit 対象外、5状態列あり、全行 yes、
      要判断0件、REQ/SPEC 配下に台帳なし。
    on_failure: |
      fix-and-reverify。未完了行を完遂、または対象外として明示的に分類（classification_decided=no の行は
      全て yes に更新または対象外として除去）。台帳が docs/ に誤配置されていれば worktree 内へ移動。

  - id: TS-003
    target_item: AG-003
    verification: |
      (1) REQ-0158 に REQ-0158-003/004/005 が追記されていることを確認。
      (2) REQ-0158 の既存実装詳細（CLI 引数、JSON 形式、Phase 番号、検知語等）が SPEC または IR へ移管されていることを確認。
          移管先候補: docs/specs/integrity/targeted-docs-guard-implementation.md、validator-split-criteria.md、
          docs/specs/integrity/rules/integrity-rule-catalog.md、rule-ownership.md。
      (3) REQ-0108 に changed docs guard 恒久契約が統合されたことを確認（統合対象の場合）。
      (4) REQ-0158 の最終状態（維持または retire）が完全性台帳で確定していることを確認。
          retire の場合: docs/requirements/retired/REQ-0158.md が存在、docs/requirements/REQ-0158.md が存在しない。
          維持の場合: 要約REQ として残り、移管先への相互参照が残る。
      (5) REQ-0161 に retire 宣言セクションが追記されていることを確認。
      (6) docs/requirements/retired/REQ-0161.md が存在し、docs/requirements/REQ-0161.md が存在しないことを確認。
      (7) REQ-0161-001〜005 のうち恒久契約残存（REQ-0161-005 baseline-aware strict pass 等）が現行REQへ統合されていることを確認（統合対象の場合）。
    pass_criteria: |
      REQ-0158-003/004/005 追記済み、実装詳細は SPEC/IR 移管済み、REQ-0108 統合 or 個別保持の決定が台帳で確定、
      REQ-0158 の最終状態（維持/retire）が確定。REQ-0161 retire 宣言追記済み、retired/REQ-0161.md へ移動済み、
      旧 docs/requirements/REQ-0161.md は不存在、恒久契約統合（該当時）実施済み。
    on_failure: |
      fix-and-reverify。SPEC/IR 移管未実施箇所は移管を実施、REQ-0158 最終状態が未確定なら完全性台帳で確定。
      REQ-0161 の retired 移動未実施なら移動を実施。物理削除が実行されていた場合は git 履歴から復元し
      retired/ へ移動（内容喪失防止）。

  - id: TS-004
    target_item: AG-004
    verification: |
      (1) case-open が Epic Issue を生成していることを確認（case_open_hints.epic_needed=true に基づく）。
      (2) 5 Wave（W1: 台帳作成、W2: REQ是正、W3: SPEC是正、W4: retire/索引更新、W5: 検証）の子 Issue が存在すること。
      (3) Wave 間の依存（W1 完了前に W2 以降開始しない）が Issue の依存関係または順序制約で表現されていること。
      (4) W4 で docs/requirements/README.md、docs/DOC-MAP.md、docs/requirements/mapping-table.md、相互参照が更新されていること。
      (5) W5 で IR-044 を含む docs-check が pass していること。意味レビューで重複/矛盾/責務逸脱が残っていないこと。
    pass_criteria: |
      Epic Issue が存在、5 Wave の子 Issue が存在、Wave 依存が表現されている、W4 の索引類が更新済み、
      W5 で docs-check pass（IR-044 含む）、意味レビュー完了。
    on_failure: |
      fix-and-reverify。Wave 構成が守られていなければ case-update で巻戻し、Wave 順序を再適用。
      索引類の不整合は W4 で修正。docs-check の NG は原因箇所を特定して修正、意味レビュー指摘事項は
      完全性台帳へ反映して修正。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition: |
    大規模是正のため5 Wave へ分解する。各 Wave は1子Issue を基本とし、Wave 内で並列可能な作業は
    同一 Issue で扱う。完全性台帳は W1 Issue の作業ファイルとして生成し、W2 以降は同台帳を参照して進行する。
  wave_hints:
    - wave: W1
      scope: 完全性台帳作成（全REQ・全要件行・全IDなし規範記述、実行時再計測で確定）
      depends_on: []
      notes: |
        台帳は worktree 内一時作業ファイル（commit 対象外）。REQ-0158/0160 のIDなし規範記述は既知例。
        実行開始時点のREQファイル数（2026-07-21 時点で54件、RU 記載の53件は起票時スナップショット）
        とID付き要件行数（RU 記載1072行、req-health-metrics.md 計測≈890行、実行時に再計測で確定）を
        台帳の冒頭へ記録する。
    - wave: W2
      scope: REQ 是正
      depends_on: [W1]
      notes: |
        REQ-0101 APPEND（REQ-0101-070）、REQ-0158 段階判定（REQ-0158-003/004/005 追記 + 実装詳細の SPEC/IR 移管）、
        REQ-0161 retire（retire宣言 + retired/移動）、REQ-0136 UPDATE（req-define/spec-save 動作変更時のみ）。
        REQ-0158 の最終状態（維持/retire）は W2 完了時に完全性台帳で確定する。
    - wave: W3
      scope: SPEC 是正
      depends_on: [W2]
      notes: |
        document-model.md への分類基盤運用徹底（既存内容の再確認・補強）、targeted-docs-guard-implementation.md、
        validator-split-criteria.md、integrity-rule-catalog.md、rule-ownership.md 等、既存SPEC/IR への詳細移管。
        REQ-0158 から移管された実装詳細を各SPEC/IR へ統合。
    - wave: W4
      scope: retire 処理 + 索引・相互参照の更新
      depends_on: [W3]
      notes: |
        docs/requirements/README.md（現行REQ一覧から retire 分を除去）、docs/DOC-MAP.md（探索導線の更新）、
        docs/requirements/mapping-table.md（移行表の更新）、各REQ/SPEC 間の相互参照の更新。
        REQ-0161 は retired/REQ-0161.md へ移動済み（W2 で実施）、W4 で索引反映。
    - wave: W5
      scope: 検証
      depends_on: [W4]
      notes: |
        IR-044 を含む docs-check（repo-agentdev-integrity の check_integrity.ts / check_changed_docs.ts）、
        意味レビュー（重複/矛盾/責務逸脱の最終確認）、完全性台帳の全行5状態 yes の最終確認。
        W5 完了後に完全性台帳を破棄（worktree 内一時ファイルのため）。
```

# summary

本 draft は RU-20260721-03（REQ/SPEC 責務再分類と文書是正）を req-define が要件化した結果である。主対象は REQ-0101（文書・REQ管理基準、REQ-0101-057/058 に基づく分類ポリシーの一次所有先）。既存分類基盤（document-model.md + REQ-0101-055/056/067/068/069 + ADR-0103）は確立済みのため、新規REQ や新規ADR は作成せず、REQ-0101-070 として完全性台帳の運用徹底を APPEND する。

個別 REQ の取扱いは REQ-0158（段階判定: REQ-0108 統合候補評価 → SPEC/IR 移管 → 残存で retire/維持）、REQ-0161（retire 第一候補: retired/REQ-0161.md へ移動、物理削除しない）。REQ-0136/0155/0156 は今回対象外。

完全性台帳は case 実行 worktree 内の一時作業ファイル（commit 対象外、PR 完了まで保持、完了後削除）とし、5状態列（classification_decided / destination_decided / change_applied / destination_verified / content_accounted）で進捗を管理する。編集開始条件は classification_decided=yes + destination_decided=yes + 要判断=0件、完了条件は残り3状態の yes。

case-open は5 Wave（W1: 台帳作成 → W2: REQ是正 → W3: SPEC是正 → W4: retire/索引 → W5: 検証）の Epic flow を想定し、case-open が確定する。W1 完了前に W2 以降は開始しない依存を明示する。

docs_chore は direct_case で scale 省略（feature 専用のため）。case-auto 自走可（auto_ready: true）。意味レビュー等で問題時は case-auto が Step 7 停止条件で停止する（CR-006 で見直し経緯を記録）。
