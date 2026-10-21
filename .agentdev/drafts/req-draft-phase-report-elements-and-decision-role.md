---
draft_type: req_draft
topic_slug: phase-report-elements-and-decision-role
status: draft
created_at: "2026-10-21T07:40:58+09:00"
source_rus:
  - RU-0241
  - RU-0242
agentdev_handoff: true
---

# draft-data

```yaml
# work_type: 新規の必須要素・参照契約の追加（契約欠落の補充であり、既存動作の不具合修正ではない）
work_type: feature

# scale: 実装スコープシグナル（影響ファイル一覧 18ファイル > 10）により large に昇格。
# 内訳: 配布スキル6 + 配布コマンド5 + REQ-110 + traceability sidecar 6。
# .opencode/skills は junction 投影（同一実体）のため編集実体は src/common 側のみ。
scale: large

summary: >-
  工程駆動系ワークフロー操作（phase-tasks-create、phase-tasks-update、phase-artifacts-update、
  phase-review、phase-transition、phase-theme-collaboration）の完了報告へ、保存先の一覧、
  機械検査の結果（未実行の場合はその旨）、未完了の内部処理の有無を必須要素として追加し、
  採用内容の範囲と未決事項の重なり、検討方向の差し替えに伴う旧前提の行き先（継承または破棄）を
  報告要素に含め、機械検査の合格は意味品質の保証ではない（必要条件であって十分ではない）旨を
  契約上明示する（RU-0241）。あわせて受領・テーマ・未決を扱う工程系コマンド・ワークフロースキルへ、
  decision 成果物の役割（工程をまたぐ意思決定・未解決課題の管理・方式選択を記録する成果物）と
  正本の優先度（source-of-truth priority）への参照を、実在確認できる正本への参照として追記する
  （RU-0242）。要件は REQ-110 への要件行追加（REQ-110-034〜039）として定義し、配布スキル・
  コマンド・トレーサビリティ sidecar の変更方針は realization_actions へ構造化する。
  停滞の検知と自動回復は実行基盤側の責務として対象外に維持し、既存規律の変更と
  新しい公開コマンド・恒久的な台帳・報告様式・文書・管理機構の新設を行わない。
  agentdev_handoff は true（ADF 本体向け引き継ぎマーカー）であり、本リポジトリは
  self-hosting のため後続工程は停止せず通常の req/case workflow として扱う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      工程駆動系ワークフロー操作の完了報告は、保存した成果物・記録の保存先の一覧（保存を
      行わない操作にあっては保存しない旨）、実行した機械検証とその結果（機械検証を実行して
      いない場合はその旨）、および操作の返却時点で裏で継続している処理の有無を必須要素と
      して含める。適用対象は工程駆動経路のワークフロースキル（agentdev-workflow-phase-artifacts-update、
      agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、
      agentdev-workflow-phase-review、agentdev-workflow-phase-transition、
      agentdev-phase-theme-collaboration）と対応するコマンド契約（src/common/commands/agentdev/phase-*.md）。
      既存の「反映の結果（反映した項目と反映先、衝突・未確認・保存失敗を区別した報告）」を
      土台に、機械検査の結果と未完了の内部処理の有無を同じ報告の必須要素として加える。
  - id: AG-002
    content: >-
      採用内容の範囲が未決事項と重なる場合はその旨を、検討方向の差し替えを受領する場合は
      旧方向が持っていた前提の行き先（継承または破棄）を、完了報告に含める。判断自体は
      受領処理・反映処理の既存規律（REQ-110-026〜033）が担い、本要件はその結果を完了報告へ
      含める義務のみを追加する。
  - id: AG-003
    content: >-
      機械検査の合格は意味品質の保証ではない（必要条件であって十分ではない）ことを、
      完了報告に関する契約上に明示する。報告を読む側が機械検査の合格だけで品質を判断しない
      ための文言として同じ箇所へ入れる。
  - id: AG-004
    content: >-
      維持・禁止事項: 既存の部分反映・失敗時報告・再投入の規律（REQ-110-009、REQ-110-021）、
      受領・採用根拠の既存規律（REQ-110-026〜033）、各操作の本来の責務を変更しない。
      停滞の検知と自動回復が実行基盤側の責務であり ADF の対象外であることを維持する。
      検証の権威の序列および監督再検証の要求条件の列挙は監督側の運用知識として ADF の
      操作契約に入れない。新しい公開コマンド、恒久的な台帳、報告様式を新設しない。
      未完了の内部処理の有無は「有/無」の明示であり、内部処理の完了待ち・回収の実行方法は
      規定しない（実行基盤側の責務）。
  - id: AG-005
    content: >-
      受領・テーマ・未決を扱う工程系コマンド（src/common/commands/agentdev/phase-*.md 5件）および
      ワークフロースキル（agentdev-workflow-phase-* 5件、agentdev-phase-theme-collaboration）から、
      decision 成果物の役割（工程をまたぐ意思決定・未解決課題の管理・方式選択を記録する成果物である
      こと）と正本の優先度（source-of-truth priority）への参照を辿れるようにする。作業者が
      「この判断はどこに記録し、どの正本が優先するか」を作業する場所から辿れることが目的であり、
      新しい様式・節の大規模な再編は行わない。
  - id: AG-006
    content: >-
      参照先は実在確認できる正本に限定する（参照切れのないこと）。req-define が確定した参照先は
      (1) source-of-truth priority の正本: src/common/commands/agentdev/inspect-docs.md の
      source-of-truth priority（現行 REQ > 承認済み Decision > Design > guides）の記述、
      (2) decision の役割の正本: docs/designs/foundations/document-model.md の文書種別責務における
      Decision の記録内容の規定。decision の定義本文を参照を追記する各所へ複製せず、正本を
      一元的に維持する（追記は参照の提示と役割の一行要約にとどめ、一行要約は全追記箇所で
      同一文言を使用する）。
  - id: AG-007
    content: >-
      維持・禁止事項: 「Decision、REQ、Design 等の正規成果物を直接更新しない」規律と Decision の
      既存状態規則（proposed から accepted への正式な昇格手続きを含むライフサイクル）を変更しない。
      source-of-truth priority の順序自体を変更しない。decision 成果物のライフサイクルの再設計を
      行わない。導入先プロジェクトの AGENTS.md への docs 構造・decision 説明の必須化を行わない。
      新しい公開コマンド、文書、管理機構を追加しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      要件テーブル（## 要件、2列構造 | ID | 要件 |）への追記行:

      | REQ-110-034 | 工程駆動系ワークフロー操作の完了報告は、保存した成果物・記録の保存先の一覧（保存を行わない操作にあっては保存しない旨）、実行した機械検証とその結果（機械検証を実行していない場合はその旨）、および操作の返却時点で裏で継続している処理の有無を必須要素として含めること |
      | REQ-110-035 | 採用内容の範囲が未決事項と重なる場合はその旨を、検討方向の差し替えを受領する場合は旧方向が持っていた前提の行き先（継承または破棄）を、完了報告に含めること |
      | REQ-110-036 | 完了報告に関する契約に、機械検査の合格は意味品質の保証ではなく必要条件であって十分条件ではないことを明示すること |
      | REQ-110-037 | 完了報告への必須要素の追加にあたり、既存の部分反映・失敗時報告・再投入の規律、受領・採用根拠の既存規律、および各操作の本来の責務を変更しないこと。停滞の検知と自動回復を実行基盤側の責務として本要件群の対象外に維持し、新しい公開コマンド、恒久的な台帳、報告様式を新設しないこと |

      受け入れ条件対応表（## 受け入れ条件対応、3列構造 | TS | 対象要件行 | 検証義務の所在 |）への追記行:

      | TS-011 | REQ-110-034、REQ-110-035、REQ-110-036、REQ-110-037 | 工程駆動系ワークフロー操作の完了報告の必須要素の検証。検証義務は phase 系ワークフロースキル（agentdev-workflow-phase-artifacts-update、agentdev-workflow-phase-tasks-create、agentdev-workflow-phase-tasks-update、agentdev-workflow-phase-review、agentdev-workflow-phase-transition）と agentdev-phase-theme-collaboration、および対応する command 契約（src/common/commands/agentdev/phase-*.md）の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-*.yaml 各ファイルおよび traceability/agentdev-phase-theme-collaboration.yaml の verification 宣言が所有する |

      適用範囲（## 適用範囲）への追記:

      - 対象へ追記: 工程駆動系ワークフロー操作の完了報告の必須要素（保存先の一覧、機械検査の結果、未完了の内部処理の有無、採用範囲と未決事項の重なり、検討方向の差し替えに伴う旧前提の行き先）と機械検査の合格の位置づけの明示
      - 対象外へ追記: 停滞の検知・自動回復の実行基盤側への組み込み（実行基盤側の責務）、検証の権威の序列および監督再検証の要求条件の列挙（監督側の運用知識として ADF の操作契約に入れない）、新しい公開コマンド・恒久的な台帳・報告様式の新設
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-110.md
    source_items: [AG-005, AG-006, AG-007]
    content: |
      要件テーブル（## 要件、2列構造 | ID | 要件 |）への追記行:

      | REQ-110-038 | 受領・テーマ・未決を扱う工程系コマンドおよびワークフロースキルから、decision 成果物の役割（工程をまたぐ意思決定・未解決課題の管理・方式選択を記録する成果物であること）と正本の優先度（source-of-truth priority）への参照を辿れること |
      | REQ-110-039 | decision の役割と正本の優先度への参照の参照先は実在確認できる正本に限定し、decision の定義本文を参照を追記する各所へ複製しないこと（正本の一元的維持）。「Decision を直接更新しない」規律と Decision の既存状態規則を変更せず、source-of-truth priority の順序自体を変更しないこと。新しい公開コマンド、文書、管理機構を追加しないこと |

      受け入れ条件対応表（## 受け入れ条件対応、3列構造 | TS | 対象要件行 | 検証義務の所在 |）への追記行:

      | TS-012 | REQ-110-038、REQ-110-039 | decision の役割と正本の優先度への参照の検証。検証義務は工程系コマンドおよびワークフロースキル（RU-0242 の対象と同一のファイル群）の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-*.yaml 各ファイルおよび traceability/agentdev-phase-theme-collaboration.yaml の verification 宣言が所有する |

      適用範囲（## 適用範囲）への追記:

      - 対象へ追記: 受領・テーマ・未決を扱う工程系コマンド・ワークフロースキルからの decision 成果物の役割と正本の優先度（source-of-truth priority）への参照の追記
      - 対象外へ追記: decision 成果物のライフサイクルの再設計、導入先プロジェクトの AGENTS.md への docs 構造・decision 説明の必須化、source-of-truth priority の順序自体の変更

conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-0241 は工程駆動経路に完了報告の証拠要件（変更駆動側の REQ-007-004 相当）がないことを
      問題とする。REQ-007（完了報告と成果物品質ゲート、変更駆動経路）への追記と
      REQ-110（工程駆動経路の要件群）への追記のいずれが正規所有者か。
    resolution: >-
      REQ-110 への要件行追加とする。RU-0241 が主対象を REQ-110 と明示し、REQ-007 の適用範囲は
      変更駆動実行（case-run）の機械的置換・品質ゲート・検証証跡の報告に限定されることを実測確認
      した。REQ-007-004 は参考として維持し、REQ-007 は変更しない。
  - id: CR-002
    conflict: >-
      RU-0241 と RU-0242 は相互に独立（双方 depends_on: []）だが、編集対象ファイル群
      （配布スキル6・配布コマンド5・REQ-110・traceability sidecar 6）が同一であり並行編集が競合する。
    resolution: >-
      両 RU の依存関係節のとおり、競合の扱いは case-open のスコープ判定に委ねる。本 draft は
      operation_units の recommended_order（OU-001 → OU-002）と case_open_hints.wave_hints
      （同一 Wave での並列実行を避け直列化する）で直列実行を推奨する。depends_on には
      必須依存のみ記録し（相互独立につき空）、依存を偽装しない。
  - id: CR-003
    conflict: >-
      RU-0242 が参照させようとする decision の役割の記述（工程をまたぐ意思決定・未解決課題の
      管理・方式選択）が、既存正本のいずれにも同一文言では存在しない（実測: docs/ 配下で
      「工程をまたぐ」の語なし。document-model.md の Decision 規定は「意思決定と理由のみを
      記録する」、glossary.md は「将来の設計、運用、文書システムを制約する決定とその理由」）。
    resolution: >-
      RU-0242 が req-define に与えた裁量（参照先として最も適切な正本の確定）に基づき、
      参照先を (1) source-of-truth priority: src/common/commands/agentdev/inspect-docs.md の
      当該記述、(2) decision の役割: docs/designs/foundations/document-model.md の Decision の
      記録内容の規定、に確定する。役割の文言は追記箇所での一行要約（全箇所で同一文言）として
      提示し、正本本文の複製・新設・書換えは行わない。受け入れ条件2（参照先実在）・3（複製禁止・
      一元的維持）のいずれとも整合する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0241
    target_req: REQ-110
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0242
    target_req: REQ-110
    operation: append
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正対象の配布11ファイル（src/common/skills/agentdev-workflow-phase-{artifacts-update,tasks-create,tasks-update,review,transition}/SKILL.md、src/common/skills/agentdev-phase-theme-collaboration/SKILL.md、src/common/commands/agentdev/phase-{artifacts-update,tasks-create,tasks-update,review,transition}.md）の完了報告契約を担う節（出力節、workflow model の報告 STEP、部分反映と再投入等の報告規律）に対し、(1) 保存先の一覧（保存を行わない操作にあっては保存しない旨）(2) 機械検査の結果（未実行の場合はその旨）(3) 未完了の内部処理の有無、の3要素の報告義務文言の存在を機械検索（rg）と文面確認で検証する。検索範囲は上記11ファイルに限定する（See Also 等の参照行と参照先ファイルは検出対象外とし、文言存在の確認は修正対象ファイルのみで行う）。
    pass_criteria: |
      全11ファイルの完了報告契約に3要素が報告義務として含まれていること。各操作の性質に応じた値の違い（保存を行わない操作ではその旨、機械検証未実行ではその旨）が契約上明示されていること。
    on_failure: |
      fix-and-reverify。報告義務の文言欠落は契約不備であるため、追記して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      同一の配布11ファイルの完了報告契約に対し、採用内容の範囲が未決事項と重なる場合の報告義務と、検討方向の差し替えを受領する場合の旧前提の行き先（継承または破棄）の報告義務の文言存在を機械検索（rg）と文面確認で検証する。検索範囲は修正対象11ファイルに限定する。
    pass_criteria: |
      全11ファイルの完了報告契約に2つの条件付き報告義務が含まれていること。判断自体を既存規律（REQ-110-026〜033）が担う旨の限定が維持されていること。
    on_failure: |
      fix-and-reverify。文言欠落は契約不備であるため、追記して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      同一の配布11ファイルの完了報告契約に対し、「機械検査の合格は意味品質の保証ではない」旨と「必要条件であって十分（条件）ではない」旨の文言存在を機械検索（rg）と文面確認で検証する。検索範囲は修正対象11ファイルに限定する。
    pass_criteria: |
      全11ファイルの完了報告契約に機械検査の合格の位置づけの文言が明示されていること。
    on_failure: |
      fix-and-reverify。文言欠落は契約不備であるため、追記して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      (1) docs/requirements/REQ-110.md の既存要件行（REQ-110-001〜033）と受け入れ条件対応表の既存 TS 行（TS-001〜010）が本 Case の変更で修正されていないことを差分で確認する。(2) traceability/ 配下の対象 sidecar（agentdev-workflow-phase-*.yaml 5件、agentdev-phase-theme-collaboration.yaml）の既存宣言が維持されたまま新規要件行（REQ-110-034〜039）が追加されていることを確認する。(3) 配布物全体（src/common/commands/agentdev/、src/common/skills/）に対し、停滞の検知・自動回復の実行基盤側組み込み、検証の権威の序列・監督再検証の要求条件の列挙に相当する新規契約文言が追加されていないことを機械検索（rg）で確認する。ここでの rg は新規契約文言の不在確認であり、修正対象列挙との一致要件は (1)(2) の対象ファイル確認で満たす。(4) docs/requirements/、src/common/commands/agentdev/、src/common/skills/、traceability/ に新しい公開コマンド・恒久的な台帳・報告様式に相当する新規ファイルが作成されていないことを確認する。
    pass_criteria: |
      既存の REQ-110 行・TS 行・sidecar 宣言が一切修正されていないこと（追加のみ）。停滞検知・自動回復・権威の序列・監督再検証要求条件の新規契約文言が不在であること。新設ファイルが0件であること。
    on_failure: |
      fix-and-reverify。既存規律の意図しない変更は本要件の違反であるため、変更を取り消して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      修正対象の配布11ファイル（RU-0242 の対象はコマンド5件とワークフロースキル6件で RU-0241 と同一集合）の参照箇所（正規成果物の扱いを記すガードレール節・共通制約節付近）に対し、decision の役割と source-of-truth priority への参照文言の存在を機械検索（rg）と文面確認で検証する。あわせて参照先の実在を、src/common/commands/agentdev/inspect-docs.md の source-of-truth priority 記述と docs/designs/foundations/document-model.md の Decision の記録内容の規定の実在確認（読取検証）で検証する。参照先2ファイルは読取検証対象であり修正対象ではない。
    pass_criteria: |
      全11ファイルから decision の役割と正本の優先度への参照が辿れること（参照文言の存在）。参照先2箇所が実在し参照切れがないこと。
    on_failure: |
      fix-and-reverify。参照文言の欠落または参照切れは受け入れ条件違反であるため、修正して再検証する。
  - id: TS-006
    target_item: AG-006
    verification: |
      (1) 追記した参照文言が docs/designs/foundations/document-model.md の Decision 規定本文の複製になっていないことを確認する（正本規定の全文一致検索を配布11ファイルに対して実行し、複製なしを確認。検索範囲は修正対象11ファイル）。(2) 役割の一行要約が全追記箇所で同一文言であることを機械検索で確認する。
    pass_criteria: |
      decision の定義本文の複製が0件であること。一行要約の文言が全11ファイルで同一であること。
    on_failure: |
      fix-and-reverify。複製の検出または要約文言の drift は一元性違反であるため、参照の提示へ修正して再検証する。
  - id: TS-007
    target_item: AG-007
    verification: |
      (1) 配布11ファイルの「Decision、REQ、Design 等の正規成果物を直接更新しない」規律の文言が維持されていること（phase-artifacts-update.md は当該文言の代わりに不変条件節の管理スキル委譲・状態規則維持の規定で正規成果物の扱いを定めているため、当該規定の維持を確認）を確認する。(2) src/common/commands/agentdev/inspect-docs.md の source-of-truth priority の順序（現行 REQ > 承認済み Decision > Design > guides）が本 Case の変更で修正されていないことを差分で確認する。(3) docs/、src/common/commands/agentdev/、src/common/skills/ に decision のライフサイクル再設計・新しい文書・コマンド・管理機構に相当する新規ファイル・新規契約が作成されていないことを確認する。
    pass_criteria: |
      「Decision を直接更新しない」規律と Decision の状態規則が維持されていること。source-of-truth priority の順序が不変であること。新設ファイル・新規契約が0件であること。
    on_failure: |
      fix-and-reverify。既存規律・順序の変更は受け入れ条件違反であるため、取り消して再検証する。

realization_actions:
  - id: RA-001
    concern: 工程駆動系ワークフロースキル6件の完了報告契約への必須要素の追記
    responsibility: >-
      各ワークフロースキルの完了報告を担う節が出力・報告の契約として、必須要素（保存先の一覧、
      機械検査の結果、未完了の内部処理の有無、採用範囲と未決事項の重なり、検討方向の差し替えに
      伴う旧前提の行き先）と機械検査の合格の位置づけ（意味品質の保証ではなく必要条件であって
      十分条件ではない）を含むこと。
    ownership_hints:
      - src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md（出力節の「反映の結果（…報告する）」を土台に追記。workflow model の STEP「部分反映と報告」、「部分反映と再投入」、「記録の保存」節も報告契約の所在）
      - src/common/skills/agentdev-workflow-phase-tasks-create/SKILL.md（出力節、workflow model の STEP 7「報告」）
      - src/common/skills/agentdev-workflow-phase-tasks-update/SKILL.md（出力節、workflow model の STEP 7「報告」）
      - src/common/skills/agentdev-workflow-phase-review/SKILL.md（出力節。保存を行わない操作であることに応じた「保存しない旨」の報告扱い）
      - src/common/skills/agentdev-workflow-phase-transition/SKILL.md（出力節、workflow model の STEP 6「報告と次工程への接続」）
      - src/common/skills/agentdev-phase-theme-collaboration/SKILL.md（出力節、受領・戻り受理の報告に関わる節）
      - .opencode/skills/ 配下の対応ディレクトリは src/common/skills/ の junction 投影（同一実体）であり、src/common 側の編集で伝播する
    intent: >-
      2026-10-17〜18 の staff-schedule-cf 適用で発生した4事象（内部の非同期子処理の完了待ちのまま
      制御を返したことへの監督側の誤認、処理終了後も完了報告が届かない事象等）の再発防止。
      完了報告から操作の状態を誤認させないための必須要素を、既存の報告契約（保存先の報告義務は
      存在）へ追加する。変更駆動経路の REQ-007-004 に相当する証拠要件を工程駆動経路へ拡張する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-004]
  - id: RA-002
    concern: 工程駆動系コマンド5件の公開契約（出力節）への必須要素の追記
    responsibility: >-
      各コマンドの公開契約（出力節の報告定義）が、RA-001 と同一の必須要素と機械検査の合格の
      位置づけを含むこと。RU-0241 のアンカーが対応する command 契約（src/common/commands/agentdev/phase-*.md）
      を明示していることに基づく。
    ownership_hints:
      - src/common/commands/agentdev/phase-artifacts-update.md（出力節「反映の結果（…報告する）」を土台に追記）
      - src/common/commands/agentdev/phase-tasks-create.md（出力節「テーマ初回形成の結果」）
      - src/common/commands/agentdev/phase-tasks-update.md（出力節「更新の結果」）
      - src/common/commands/agentdev/phase-review.md（出力節「独立レビュー」「工程全体像」。保存を行わない出力である旨の報告扱いを含む）
      - src/common/commands/agentdev/phase-transition.md（出力節「遷移の記録結果」）
    intent: >-
      公開入口の契約とワークフロースキルの契約で報告義務の記述が乖離しないようにする。
      監督側・利用者が読む公開契約から必須要素を確認できるようにする。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]
  - id: RA-003
    concern: 工程系コマンド5件・ワークフロースキル6件への decision の役割と source-of-truth priority への参照追記
    responsibility: >-
      各ファイルの正規成果物の扱いを記す節（コマンドはガードレール節の「Decision、REQ、Design 等
      の正規成果物を直接更新しない」等の規定付近、phase-artifacts-update.md は不変条件節の成果物
      管理スキル委譲の規定付近、スキルは共通制約節の正規成果物直接更新禁止の規定付近〔実測:
      agentdev-phase-theme-collaboration/SKILL.md 共通制約節に「正規成果物（Decision、REQ、Design 等）
      を直接更新しない」の文言あり〕）に、decision の役割の一行要約と正本への参照を追記すること。
      参照先は AG-006 が確定した2正本（src/common/commands/agentdev/inspect-docs.md の
      source-of-truth priority 記述、docs/designs/foundations/document-model.md の Decision の
      記録内容の規定）とし、参照先側は変更しない（読取専用）。
    ownership_hints:
      - src/common/commands/agentdev/phase-tasks-create.md（ガードレール節 46行目付近）
      - src/common/commands/agentdev/phase-tasks-update.md（ガードレール節 46行目付近）
      - src/common/commands/agentdev/phase-review.md（ガードレール節 49行目付近）
      - src/common/commands/agentdev/phase-transition.md（ガードレール節 48行目付近）
      - src/common/commands/agentdev/phase-artifacts-update.md（不変条件節の成果物管理委譲の規定付近。当該コマンドは「直接更新しない」文言をガードレールに持たないため不変条件節が参照箇所）
      - src/common/skills/agentdev-workflow-phase-{artifacts-update,tasks-create,tasks-update,review,transition}/SKILL.md（共通制約節）
      - src/common/skills/agentdev-phase-theme-collaboration/SKILL.md（共通制約節 104行目付近）
    intent: >-
      2026-10-18 の監督エージェントによる「判断工程」という不存在区分の誤造と2回の訂正のように、
      作業者が判断の記録先・分類を作業する場所から辿れないことで自己流の区分を作る事象を防ぐ。
      decision が工程をまたぐ関心を持つ成果物であることを作業場所から読めるようにする。
      追記に用いる役割の一行要約は全11箇所で同一文言を使用し、文言の drift を生まない。
      定義本文の複製は行わず、正本は一元的に維持する。
    verification_refs: [TS-005, TS-006, TS-007]
    source_items: [AG-005, AG-006, AG-007]
  - id: RA-004
    concern: トレーサビリティ sidecar の verification 宣言への新規要件行の追加
    responsibility: >-
      新規要件行（REQ-110-034〜039）の対応関係宣言を、REQ-110 の受け入れ条件対応表（TS-011/012）
      が指す sidecar 群の verification 宣言へ追加すること。既存の宣言行は変更しない。
    ownership_hints:
      - traceability/agentdev-workflow-phase-artifacts-update.yaml
      - traceability/agentdev-workflow-phase-tasks-create.yaml
      - traceability/agentdev-workflow-phase-tasks-update.yaml
      - traceability/agentdev-workflow-phase-review.yaml
      - traceability/agentdev-workflow-phase-transition.yaml
      - traceability/agentdev-phase-theme-collaboration.yaml
      - 追加対応は配布スキル・コマンド両ファイルの implementation/verification 宣言の形式（component: / implementation: / verification: / links: 構造。実測: agentdev-workflow-phase-artifacts-update.yaml）に従う
    intent: >-
      REQ-110 の要件行と恒常検証手段の対応関係の正本（sidecar 宣言）を新規要件行まで拡張し、
      受け入れ条件対応表の TS-011/012 の指す先を実在させる。
    verification_refs: [TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-005, AG-006]

review_dispositions:
  - id: RD-001
    source_ru: RU-0241
    source_item: phase-completion-report-required-elements
    disposition: covered
    reason_code: fully_adopted
    reason: >-
      RU-0241 の必須要素4点、機械検査の合格の位置づけの明示、維持・対象外事項のすべてを
      AG-001〜004、ACT-REQ-001（REQ-110-034〜037、TS-011、適用範囲追記）、RA-001/002/004 へ
      反映した。決定的受け入れ条件1〜6はそれぞれ AG-001（条件1）、AG-002（条件2）、AG-003（条件3）、
      AG-004（条件4〜6）が対応する。対象・対象外の省略・弱化・反転なし。
    evidence:
      path: .agentdev/drafts/req-draft-phase-report-elements-and-decision-role.md
      section: draft-data (AG-001〜AG-004, ACT-REQ-001, RA-001, RA-002, RA-004)
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0242
    source_item: decision-role-reference-in-phase-workflows
    disposition: covered
    reason_code: fully_adopted
    reason: >-
      RU-0242 の参照の追記、参照先の実在限定、正本の一元的維持、維持・対象外事項のすべてを
      AG-005〜007、ACT-REQ-002（REQ-110-038〜039、TS-012、適用範囲追記）、RA-003/004 へ反映した。
      決定的受け入れ条件1〜5はそれぞれ AG-005（条件1）、AG-006（条件2・3）、AG-007（条件4・5）
      が対応する。参照先正本は req-define の裁量（RU 本文が明示）に基づき確定した。
      対象・対象外の省略・弱化・反転なし。
    evidence:
      path: .agentdev/drafts/req-draft-phase-report-elements-and-decision-role.md
      section: draft-data (AG-005〜AG-007, ACT-REQ-002, RA-003, RA-004)
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition: >-
    RU 単位の2操作単位（OU-001: RU-0241、OU-002: RU-0242）。両 RU は相互に独立（双方
    depends_on: []）であり、それぞれ単一 Issue（issue_policy: single）で完結する。
    分解計画は RU 群の構成（利用者の 2026-10-21 処置決定で D・L の要件化として確定済み）に
    合致する。Epic 構成は不要。
  wave_hints:
    - >-
      OU-001 と OU-002 は同一ファイル群（配布スキル6・配布コマンド5・REQ-110.md・
      traceability sidecar 6）を編集するため、同一 Wave での並列実行を避け recommended_order
      の順（OU-001 → OU-002）に直列実行すること（RU 両者の依存関係節が case-open のスコープ
      判定に委ねた競合の扱い）。
```

# summary

- **出力**: REQ-110 への要件行追加（REQ-110-034〜039）と、配布スキル・コマンド・トレーサビリティ sidecar の変更方針（RA-001〜004）。Definition 保存（case-ready / case-revise の内部責務）が artifact_actions を適用する。
- **既存REQ照合（STEP-3）**: 両 RU とも REQ-110 への APPEND。Jev 先行評価・最終判断とも一致（観測: existing-req-matching、20261020T223648Z-6acc）。SPLIT 計測: 要件行数 33→39（+0、閾値51）、関心分類数 1（工程駆動コラボレーション単一、+0）、成果物種別数 2（command+skill、+0）、Design 分離違反 0、合計シグナル 0〜1 → APPEND 許可域。
- **要件展開（STEP-4）**: 全要件行候補は REQ 行帰属・Design 分離不要（観測: final-classification-design-separation、20261020T223717Z-d46b）。Design 分離基準違反残留 0 件。design 対応事前確認: 既存行の意味変更なし（新規行追記のみ）のため coverage 確認対象なし。変更誘発境界リスク分析（5観点）: dependency boundary（同一ファイル群の並行編集競合 → OU 直列化と TS-004/007 の非変更検証）、client/server boundary（該当なし。外部インターフェース変更なし）、execution boundary（停滞検知・自動回復を実行基盤側責務のまま ADF 契約に持ち込まない → TS-004）、build/runtime boundary（契約文書の文言変更でランタイム動作に影響なし。textlint 等の文章品質検査の適用対象）、environment propagation boundary（src/common が共通原本、.opencode/skills は junction 投影で同一実体。配布整合性検査で破損なしを確認）。
- **Decision判断（STEP-5）**: Decision 不要。適用基準: Decision 禁止ゲート 1（仕様変更のみ）・2（command 動作仕様）・3（workflow 定義の記述）に該当、技術的決定を含まない。既存 Decision（DEC-057 工程駆動コラボレーションモデル、DEC-058 工程遷移と双経路併存）と衝突なし（両 Decision の枠内の契約補強）。責務境界変更なし（RU が対象外として実行基盤側責務・監督側運用知識の境界維持を明示）。Decision 番号指定形式の新規採番なし。
- **adversarial-review（STEP-8）**: 対論型レビュー実施（strategy → challenge 2 stream → counter-challenge → convergence → convergence audit）。accepted finding 3件を反映: (1) 保存を行わない操作での「保存先の一覧」の扱いを REQ-110-034 へ明記、(2) 役割の一行要約の全箇所同一文言使用を AG-006/RA-003 へ明記、(3) REQ-110-038 の語を RU 原文の「成果物」に準拠。未解決のユーザー判断事項なし。
- **agentdev_handoff**: true（ADF 本体向け引き継ぎマーカー、RU frontmatter から継承）。本リポジトリは self-hosting のため case-open/case-run は停止せず通常の req/case workflow 入力として扱う（upstream-handoff 共通方針）。
- **組立検査**: artifact_actions の内容は新規行・新規文言の追記であり既存原文の置換を含まないため、モデル生成 + 対象ファイル実読による構造突合（要件表2列・受け入れ条件対応表3列・適用範囲の節構造を確認済み）で対応し、assembly_evidence は空とした。
