---
draft_type: req_draft
topic_slug: parent-epic-child-issue-title
status: draft
created_at: 2026-10-10T23:45:00+09:00
source_rus:
  - RU-0197
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  Epic 配下の子 Issue タイトルの先頭へ親 Epic 識別子を含む `[Epic #<親番号>] Wave-N: 主題`
  形式を導入する。GitHub 版・ローカル版（agentdev_gh local）の両経路に適用し、ローカル版は
  既存ローカル Issue 番号（`issue-0042` なら `42`、ゼロ埋めなし）を使用して保存識別子・採番を
  変更しない。タイトルは表示用であり、親子関係・Wave 所属・実行順序の正は Epic 本文の実行構成の
  まま維持する。生成・同期は case-ready の既存経路（issue_create / issue_update）を再利用し、
  実行状態の変化だけでは改名しない。既存 Issue の一括改名・移行は行わず、旧形式だけを理由に
  参照・再開・更新・重複判定を拒否しない。PR タイトルは Conventional Commits 契約を維持し、
  親 Epic 番号へ置換しない。REQ-100 の該当行（001/004/005/006）と適用範囲を更新し、具体書式は
  workflows/issue-title-policy Design 単一参照点の該当節（判定表・Wave 投影・除外情報・場面・生成例）
  を更新して所有する。新規管理データ・対応表・専用基盤・意味判断機構は追加しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      子 Issue タイトルの親 Epic 識別子表示（RU-0197、合意済 2026-10-10T18:43）。GitHub 版は
      `[Epic #3585] Wave-2: 差分・変更影響・増分更新を実現する` の形式（親番号は GitHub Issue 番号）。
      ローカル版は `[Epic #42] Wave-2: 主題` の形式（親 `issue-0042` なら `42`、ゼロ埋めなし・
      GitHub 番号・新しい識別子を要求しない）。保存識別子と採番は変更しない。異なる Epic に同じ
      Wave 番号の子 Issue が存在する場合も親番号表示で所属先を区別できる。
  - id: AG-002
    content: |
      表示と正規情報の分離。タイトルの親表示は表示用であり、親子関係・Wave 所属・実行順序・
      実行可否の判定は既存の正規情報（Epic 本文の実行構成）に基づく。タイトル解析から実行順序・
      親子関係を決定しない現行契約を維持する。親 Issue 番号の除外規則（REQ-100-005）は子 Issue
      タイトル先頭の `[Epic #<親番号>]` 表示に限る例外とし、他の Issue 種別（Case・Epic・Tracking）
      や主題部分への親番号付与は除外のまま。親 Epic のタイトル全体は付与しない。
  - id: AG-003
    content: |
      生成・同期は case-ready 既存経路（issue_create / issue_update）で行う。構成変更時
      （親 Epic または所属 Wave 変更）は case-ready の既存同期経路でタイトルを変更後の正規構成へ
      同期し、読み戻しで一致を確認する（不一致・更新失敗を同期完了としない）。case-run / case-close
      は状態の進行・停止・完了のみではタイトルを変更しない。case-revise へ構成再設計責務を追加
      しない（影響判定とマーキングのみ、再確定と同期は case-ready）。旧形式の既存 Issue を一括
      改名せず、旧形式だけを理由に参照・再開・更新・重複判定を壊さず、正規の構成変更対象は新形式へ
      同期し、閉鎖済み Issue は移行しない。
  - id: AG-004
    content: |
      PR タイトルの維持。新形式を入力としても、通常の PR 作成および case-auto の PR 作成代行は
      既存の Conventional Commits 契約を満たす。末尾の参照先は対象子 Issue 番号であり、タイトルに
      表示した親 Epic 番号へ置換しない（case-auto Design の PR タイトル対象外規定・PR タイトル
      生成時の書式非複製は現行どおり）。
  - id: AG-005
    content: |
      対象外（RU-0197 対象外を維持）。親 Epic 自体・Root Case・Standard Case・Tracking Issue の
      書式変更、既存 Issue の一括改名・更新、Epic・Wave 構成方法の変更、新しい親変更機能、GitHub
      親子機能・ラベル体系の導入・変更、新しい管理データ・対応表・専用基盤・意味判断処理・Plugin、
      PR 命名規則の変更（Conventional Commits は対象外）、RU 生成主体契約の変更。REQ-049-007
      （件名の論理スキーマ）、REQ-095（agentdev_gh 呼出側規律）、REQ-098（推敲）は現行のまま。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-100.md
    source_items: [AG-001, AG-002, AG-003]
    content: |
      REQ-100-001、REQ-100-004、REQ-100-005、REQ-100-006、REQ-100-007 の5行を次の文面で置き換える:
      | REQ-100-001 | ADF が起票する Issue（GitHub・ローカル版 agentdev_gh local の両経路）のタイトルは、Issue の役割に応じた書式（Root Case または Standard Case は `Case: 主題`、Epic として確定した管理 Issue は `Epic: 主題`、Epic 配下の子 Issue は `[Epic #<親番号>] Wave-N: 主題`（N は所属 Epic 内の Wave 番号、<親番号> は親 Epic の Issue 番号。ローカル版は既存ローカル Issue 番号をゼロ埋めなしで使用）、追跡Issueは `Tracking: 主題`）に従い、`Task:` 形式を使用しないこと。具体書式の正は workflows/issue-title-policy Design が単一参照点として所有すること |
      | REQ-100-004 | 子 Issue のタイトルは親 Epic 識別子（`[Epic #<親番号>]`）と確定済みの所属 Wave を先頭に置くこと。Wave 番号は所属 Epic 内でのみ有効とし、正規の構成変更で親 Epic または所属 Wave が変わった場合はタイトルを同期すること。タイトル解析から親子関係・実行順序を決定しないこと（実行構成の正は Epic 本文の実行構成） |
      | REQ-100-005 | タイトルから工程名・現在状態・進行状況・OU/RA/AG/ACT/TS の羅列・REQ/Decision 番号の羅列・親 Issue 番号・投入識別子・topic_slug・ファイル一覧・検証件数・実測値を除くこと。ただし親 Issue 番号は子 Issue タイトル先頭の `[Epic #<親番号>]` 表示に限り例外として含めること（他の Issue 種別や主題部分への付与は除外のまま）。本文が所有する情報（対象要件、親 Epic への参照、合意された実現方針）は本文の該当箇所に保持し、廃止した管理項目（現在工程、表示用の進行状態、次の行動、担当役割、最新記録参照）を保持先として復活させないこと。除外情報の除去で再開・冪等照合を壊さないこと |
      | REQ-100-006 | case-open は合意済みの対象・目的から Case のタイトルを生成し、case-ready は確定構造に沿って接頭辞を更新し子 Issue へ親 Epic 識別子と Wave を含むタイトルを付与すること。case-run / case-close は状態の進行・停止・完了のみではタイトルを変更しないこと。追跡Issueの起票・更新は確認された主題に基づいてタイトルを生成すること |
      | REQ-100-007 | タイトルの更新理由は誤記・曖昧さの修正、合意済み対象・目的の変更、役割 / 親 Epic・Wave 構成の確定または変更に限定すること。タイトルの書換えで未合意の範囲変更を隠さないこと。同じ対象の再利用は安定識別情報で行い、タイトル修正を理由に新規 Issue を作らないこと |

      あわせて適用範囲の「対象」冒頭文を次の文面で置き換える:
      - **対象**: ADF が起票・更新する GitHub Issue・ローカル版 Issue のタイトル（役割別書式（`[Epic #<親番号>] Wave-N: 主題` 形式の子 Issue タイトルを含む）、主題原則、Wave 投影、除外情報、工程別の付与・更新責任）と、その単一参照点としての workflows/issue-title-policy Design
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/issue-title-policy.md
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: "役割別書式（判定表）"
    source_items: [AG-001, AG-002]
    content: |
      | Issue の役割 | 書式 | 付与・更新の場面 |
      |---|---|---|
      | 実行構造確定前の Root Case / Standard Case | `Case: 主題` | case-open が Root Case を起票する時点 |
      | Epic として確定した管理 Issue（Root Case） | `Epic: 主題` | case-ready が Epic 構成を確定した時点（`Case:` から更新） |
      | Epic 配下の子 Issue | `[Epic #<親番号>] Wave-N: 主題` | case-ready が子 Issue を作成する時点（N = 所属 Epic 内の確定済み Wave 番号、<親番号> = 親 Epic の Issue 番号） |
      | 追跡Issue（role: tracking） | `Tracking: 主題` | 追跡Issue起票経路（/agentdev/issue、各 workflow の起票） |

      - 子 Issue の書式に `Task:` を使用しない
      - `[Epic #<親番号>]` は表示用の親 Epic 識別子である。親子関係・実行可否の正は Epic 本文の実行構成であり、タイトル解析から親子関係・実行順序を決定しない
      - `Wave-N` の N は所属表示であり、実行制御の正ではない。所属の正は Epic の実行構成が所有する
      - 実運用に別 Epic が存在する経路もこの表の役割に沿って命名する（Root Case と別 Epic の統合は本 Design の対象外）
      - 適用は GitHub・ローカル版（agentdev_gh local）の両起票経路に及ぶ。ローカル版 case file の title フィールドも同一の書式に従う。ローカル版の親番号は既存ローカル Issue 番号（`issue-0042` なら `42`）をゼロ埋めなしで使用し、GitHub 側の Issue 番号や新しい識別子を要求しない。保存識別子（`issue-0042` 等）と採番は変更しない
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/workflows/issue-title-policy.md
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: "Wave 投影"
    source_items: [AG-001, AG-002]
    content: |
      - 子 Issue には確定済みの所属 Wave を `[Epic #<親番号>] Wave-N: 主題` の形式で先頭に置いて統一する
      - `[Epic #<親番号>]` の親番号は子 Issue 作成時点の正規構成（Epic 実行構成）が示す親 Epic の番号である。複数の Epic に同じ Wave 番号の子 Issue が存在する場合も、親番号表示で所属先を区別できる
      - Wave 番号は所属 Epic 内でのみ有効。同じ Wave 内の順序・並列可否・開始条件は Epic の実行構成が所有する
      - 所属の正は Epic の実行構成であり、タイトルは所属の表示である。正規の構成変更で親 Epic または所属 Wave が変わる場合はタイトルを同期する（Epic 実行構成と子 Issue タイトルの一致）
      - 独立 Case を同じ case-auto 起動という理由だけで Wave 化しない
      - 実行枠の都合による一時分割・待機・再開は番号変更の理由にしない
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/issue-title-policy.md
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: "タイトルから除く情報"
    source_items: [AG-002]
    content: |
      工程名（case-open / case-ready 等）、現在状態（実行中・再開待ち・完了等）、OU/RA/AG/ACT/TS の羅列、REQ/Decision 番号の羅列、親 Issue 番号、投入識別子（intake/learning 等の投入元識別子）、topic_slug、ファイル一覧、検証件数、実測値。これらは本文の既存の対応欄へ保持する。識別子除去で再開・冪等照合を壊さない（冪等照合は本文の識別情報・安定した検索キーで行う）。ファイル名・コマンド名自体が主題ならその名前は残せる。

      親 Issue 番号の除去は子 Issue タイトル先頭の `[Epic #<親番号>]` 表示に限り例外とする。この例外は子 Issue の先頭表示に限定され、他の Issue 種別（Case・Epic・Tracking）のタイトルや、子 Issue の主題部分への親 Issue 番号の付与には適用しない。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/workflows/issue-title-policy.md
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: "付与と更新の場面"
    source_items: [AG-001, AG-003]
    content: |
      - case-open: 合意済みの対象・目的から `Case: 主題` を生成する
      - case-ready: 確定構造に沿って Root Case の接頭辞を更新し（Epic 確定時 `Epic: 主題` へ）、子 Issue へ `[Epic #<親番号>] Wave-N: 主題` を付与する（issue_create / issue_update の既存経路を使用）。既存の構造契約に従い、タイトル規則のために構造を変更しない
      - case-run / case-close: 状態の進行・停止・完了だけではタイトルを変更しない。case-close の PR タイトル事前変更は PR に対する操作であり、Issue タイトル不変と区別する
      - 追跡Issue起票・更新: 確認された主題に基づき `Tracking: 主題` を生成する
      - 再構成（case-ready / case-revise）: 親 Epic または所属 Wave が変わる正規の構成変更時にのみ子 Issue タイトルを同期する（case-revise は影響有無の判定とマーキングのみを担い、構成再確定とタイトル同期は case-ready が担う）。同期後は読み戻しで一致を確認し、不一致・更新失敗を同期完了としない

      更新理由は誤記・曖昧さの修正、合意済み対象・目的変更、役割 / 親 Epic・Wave 構成確定または変更に限定する。タイトルの書換えで未合意の範囲変更を隠さない。同じ対象の再利用は安定識別情報（Issue 番号・冪等キー）で行い、タイトル修正を理由に新規 Issue を作らない。
  - id: ACT-DESIGN-005
    artifact: design
    operation: update
    target: docs/designs/workflows/issue-title-policy.md
    target_design:
      operation: update
      domain: workflows
      slug: issue-title-policy
    target_area: "生成例"
    source_items: [AG-001]
    content: |
      規則の適用例である（規則の原本は本節ではなく上記の各節にあり、例が乖離する場合は各節を正とする）:

      - `Case: 再開時に既存Issueを再利用し重複作成を防ぐ`
      - `Epic: ADFをOpenCodeとSenpiで共通利用できる構成へ移行する`
      - `[Epic #3585] Wave-2: 差分・変更影響・増分更新を実現する`（GitHub 版。親 Epic #3585 の Wave-2 の子 Issue）
      - `[Epic #42] Wave-2: インストーラーを両ホストの配置に対応させる`（ローカル版。親 `issue-0042` の Wave-2 の子 Issue。親番号はゼロ埋めなしの既存ローカル番号）
      - `Tracking: 再開後に同じ変更のIssueが重複作成される`
      - `Tracking: 出力ログの文字化けの原因を調査する`（未確定原因の断定を避ける例）

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0197
    target_req: REQ-100
    target_design: docs/designs/workflows/issue-title-policy.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: ACT-REQ-001
    verification: |
      REQ-100 更新後の構造検証（artifact-validation の REQ frontmatter id↔ファイル名一致検査、要件表
      2 列構造の維持、行 ID 採番の一意性）を実行する。更新行 001/004/005/006/007 と適用範囲の新文面が
      AG-001〜003 と矛盾なく、REQ-100-002/003/008 の非更新行が現行のままであることを突合する。
      design 対応事前確認として issue-title-policy.md の ADF-COVERS(design) 宣言（REQ-100-001〜008）
      が更新後も全行を被覆していることを確認する。README の REQ 索引（AUTOGEN 表）に影響がない
      ことを突合する。
    pass_criteria: |
      構造検証の不合格 0 件。更新 5 行 + 適用範囲の文面要件（`[Epic #<親番号>] Wave-N` 子 Issue 書式、
      親/親番号除外例外の子 Issue 先頭限定、case-ready の親 Epic 識別子付与、同期条件の親 Epic または
      Wave 変更、更新理由への親 Epic・Wave 構成変更の明示）の欠落 0 件。非更新行の意図しない変更 0 件。design 被覆欠落 0 件。README 索引乖離 0 件。
    on_failure: |
      fix-and-reverify。docs 主体の構造検証であり外部要因ではない。
  - id: TS-002
    target_item: ACT-DESIGN-001〜ACT-DESIGN-005
    verification: |
      issue-title-policy.md の 5 節更新後の構造検査（見出し構造の維持、参照接続（適用面）節の参照先
      一覧との整合）と、文書生成例回帰試験（issue_title_policy_examples.test.ts）の更新・実行を行う。
      子 Issue 書式の正規表現を `/^\[Epic #\d+\] Wave-\d+: .+/` へ更新し、生成例抽出が Design の
      新生成例に追従することを確認する。新規生成・同期結果を旧書式のみで期待する検査が残らず、
      旧形式を受理する互換確認（旧形式タイトルの読取・照合を拒否しないこと）が維持されることを
      確認する。文書生成例回帰試験の成功だけを実際の作成・同期の証明として扱わない（実経路確認は
      TS-003〜TS-007 で区別する）。
    pass_criteria: |
      Design 構造検査の不合格 0 件。回帰試験の不合格 0 件（子 Issue パターンの新形式対応、他役割
      パターンの不変）。旧形式受理の互換確認の残存。実経路確認との証拠区別の明記。
    on_failure: |
      fix-and-reverify。Design と試験の追従は同一変更内で完結させる。
  - id: TS-003
    target_item: AG-001
    verification: |
      AC01・AC02。GitHub 版の既存子 Issue 作成経路（case-ready の issue_create）へ新形式タイトルを
      渡した保存後の読戻し結果を確認する。親 `#3585`・Wave 2・主題「差分・変更影響・増分更新を
      実現する」の代表例で `[Epic #3585] Wave-2: 差分・変更影響・増分更新を実現する` が生成される
      ことを確認する。異なる親 Epic で同じ Wave 番号を使う代表例を比較し、親番号・Wave・主題が
      一致することを合格基準とする。
    pass_criteria: |
      読戻しタイトルと期待形式の一致 2 例以上（異なる親 Epic 同一 Wave 番号を含む）。保存値の
      破損・切り詰めなし。
    on_failure: |
      fix-and-reverify。生成経路の修正後に再検証する。
  - id: TS-004
    target_item: AG-001
    verification: |
      AC03。GitHub 番号を使用しないローカル版の既存作成経路（agentdev_gh local）で、親
      `issue-0042` から `[Epic #42] Wave-2: 主題` が保存されることを読戻しで確認する。識別子・
      採番が不変であること（`issue-0042` 形式の保存識別子がそのまま維持され、新しい識別子が
      作られないこと）を確認する。
    pass_criteria: |
      ローカル case file の title が `[Epic #42] Wave-2: …` 形式。保存識別子・採番の変更なし。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-002
    verification: |
      AC04。他種別（Root Case・Standard Case・Epic・Tracking）の生成書式が不変であることを定義
      （REQ-100・issue-title-policy Design）・実行時手順（case-open・case-ready・追跡Issue起票）・
      既存回帰試験で確認する。親 Issue 番号の表示許可が子 Issue の先頭表示に限定され、他種別の
      タイトルや主題部分への付与へ広がらないことを確認する。
    pass_criteria: |
      他種別書式の変更 0 件。除外例外の限定記述の残存。回帰試験の他役割パターン合格。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-003
    verification: |
      AC05。既存の構成再確定・更新経路（case-ready の issue_update）で、親 Epic または Wave 所属
      変更を反映したタイトルと正規構成を読み戻して照合する。不一致・更新失敗を同期完了にしない
      こと（読戻し不一致の検出）を確認する。親変更は既存経路が正規に扱う範囲で確認し、新しい親
      変更機能を作らないこと、case-revise へ構成再設計責務が追加されていないことを差分で確認する。
    pass_criteria: |
      同期後の読戻し一致。読戻し不一致時の非完了扱い。case-revise 責務の不追加（差分 0）。
    on_failure: |
      fix-and-reverify。
  - id: TS-007
    target_item: AG-002
    verification: |
      AC06。タイトルの親表示を欠いた代表入力（旧形式 `[Epic #…]` なしの `Wave-2: 主題`、親表示
      欠落）でも、同じ正規実行構成から親子関係・Wave 所属・実行判断が解決されることを、既存の
      参照・判定経路（Epic 実行構成表の読取、wave-gate、再開時の Issue 特定）で確認する。
      タイトル解析への新しい依存が追加されていないことを差分で確認する。
    pass_criteria: |
      親表示欠落入力での正規情報による解決の成立。タイトル解析依存の新規追加 0 件。
    on_failure: |
      fix-and-reverify。
  - id: TS-008
    target_item: AG-003
    verification: |
      AC07。旧形式の既存子 Issue を残した状態で、参照・再開・状態更新・重複判定が旧形式だけを
      理由に失敗しないことを確認する。読取・再開・状態更新だけでは改名を要求しないこと、正規の
      構成変更対象となった Issue は新形式へ同期されること、閉鎖済み Issue が移行されないことを
      確認する。一括改名の実行がないことを差分で確認する。
    pass_criteria: |
      旧形式残存での参照・再開・更新・重複判定の成立。状態更新のみでの改名要求なし。閉鎖済み
      移行 0 件。一括改名コード・手順の追加 0 件。
    on_failure: |
      fix-and-reverify。
  - id: TS-009
    target_item: AG-004
    verification: |
      AC08。通常の PR 作成と case-auto の PR 作成代行で新形式の子 Issue タイトルを入力とし、
      生成 PR タイトルが既存の Conventional Commits 契約に適合すること、末尾の参照先が対象子
      Issue 番号であることを確認する。親 Epic 番号への置換を不合格とする。case-auto Design の
      PR タイトル対象外規定が変更されていないことを確認する。
    on_failure: |
      fix-and-reverify。
    pass_criteria: |
      PR タイトルの CC 契約適合。参照先の子 Issue 番号維持。親 Epic 番号置換 0 件。case-auto
      Design の対象外規定の不変。
  - id: TS-010
    target_item: AG-005
    verification: |
      AC10。差分と呼出経路を確認し、既存の Issue 作成・更新・構成管理経路（issue_create /
      issue_update・Epic 実行構成）の再利用、新しい管理機構・専用の意味判断処理・新しい親変更
      機能の不追加、親 Epic のタイトル全体の不付与、状態の進行・停止・完了だけでのタイトル不変
      を確認する。
    pass_criteria: |
      変更範囲が REQ-100・issue-title-policy Design・実行時手順の記述追従と試験更新に限定。
      新機構（管理データ・対応表・Plugin・意味評価器・Workflow）の追加 0 件。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: case-ready 実行時手順のタイトル合成文面の追従
    responsibility: |
      src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md「Epic 確定時の
      生成物」の子 Issue タイトル付与文面（`Wave-N: 主題`）を `[Epic #<親番号>] Wave-N: 主題` へ
      更新する（Epic 本文実行構成表と子 Issue タイトルの一致維持の記述はそのまま）。SKILL.md の
      Wave-N 言及（121 行目付近）も同一書式へ追従する。同期手順に読戻し確認（不一致・更新失敗を
      同期完了としない）を明記する。case-ready の issue_create / issue_update 呼出経路・構造契約
      は変更しない。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md（traceability case-ready.yaml で impl/ver: REQ-100-001/004/006）"
      - src/common/skills/agentdev-workflow-case-ready/SKILL.md
    intent: Design 更新行（REQ-100-001/004/006）と実行時手順の乖離を同時に解消し、case-ready が新形式で起票・同期する
    verification_refs: [TS-003, TS-004, TS-006]
    source_items: [AG-001, AG-003]
  - id: RA-002
    concern: 文書生成例回帰試験の新形式追従と旧形式互換の維持
    responsibility: |
      .opencode/skills/repo-agentdev-integrity/scripts/issue_title_policy_examples.test.ts の
      子 Issue 書式正規表現（`/^Wave-\d+: .+/`）を `/^\[Epic #\d+\] Wave-\d+: .+/` へ更新する。
      生成例抽出（extractExamples）は Design の新生成例へ自動追従する。新規生成・同期結果を旧書式
      のみで期待する検査を更新し、旧形式タイトルの受理（読取・照合での拒否なし）を確認する互換
      試験は削除しない。文書生成例検査の成功だけを作成・同期の証明としない運用は TS-002 の区分
      どおり。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/issue_title_policy_examples.test.ts（repo-local 検証資産。inline ADF-COVERS(verification): REQ-100-001〜004）"
    intent: Design 生成例の更新と検証資産の同期
    verification_refs: [TS-002]
    source_items: [AG-001]
  - id: RA-003
    concern: 委任・参照面の整合確認（変更不要の実証）
    responsibility: |
      local-case-file.md・agentdev-gh local case-schema（case-file.md）の title 委任記述、case-auto
      Design の PR タイトル対象外規定、impact-reassessment.md の case-revise 責務規定が本変更で
      変更不要であることを確認し、必要に応じて参照接続（適用面）節の整合のみ確認する。書式の
      複製・新規記述の追加は行わない。
    ownership_hints:
      - docs/designs/local/local-case-file.md（title 行の Design 委任）
      - src/common/tools/agentdev-gh/local/case-schema/case-file.md（case-schema title 値域）
      - docs/designs/commands/case-auto.md（状態(a) PR 作成代行の PR タイトル規定）
      - src/common/skills/agentdev-workflow-case-revise/references/impact-reassessment.md
    intent: 単一参照点構造の維持と変更範囲の限定（AC04・AC06〜AC08・AC10 の定義側確認）
    verification_refs: [TS-005, TS-007, TS-008, TS-009, TS-010]
    source_items: [AG-002, AG-004, AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0197
    source_item: parent-epic-issue-title-display
    disposition: covered
    reason_code: covered_by_req_update_and_design_update
    reason: |
      RU-0197 の要件化の方向（既存経路再利用・正本維持・Design 単一参照点・非互換移行なし・PR 契約
      維持）と決定的受け入れ条件 AC01〜AC10 をすべて反映した。AC01/AC02→REQ-100-001/004 更新 +
      issue-title-policy 判定表・Wave 投影・生成例 + TS-003、AC03→判定表のローカル版条項 + TS-004、
      AC04→REQ-100-005 の例外限定 + Design 除外情報の例外規定 + TS-005、AC05→REQ-100-004/007 の親/Wave
      同期・更新理由 + Design 場面節 + TS-006、AC06→REQ-100-004 のタイトル解析禁止 + TS-007、AC07→AG-003 +
      TS-008、AC08→AG-004 + TS-009、AC09→ACT-REQ-001/ACT-DESIGN-001〜005 + RA-001/RA-002 + TS-001/
      TS-002、AC10→AG-005 + RA-003 + TS-010。対象外（一括改名・GitHub 親子機能・PR 命名規則・
      RU 生成主体契約）は AG-005 と REQ-100 適用範囲の対象外（現行維持）で保持。旧書式のみを期待
      する検証の更新と旧形式受理互換の維持は RA-002・TS-002 に明記。
    evidence:
      path: .agentdev/backlog/req-units/RU-0197.md
      section: 決定的受け入れ条件
      checked_at_commit: 4aca4660f31e85e0246f65fada1f18ad99a349bc
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    単一 OU（OU-001: REQ-100 の 5 行更新 + 適用範囲更新 + issue-title-policy Design 5 節更新 +
    case-ready 実行時手順・試験の追従）。feature / standard / issue_policy single。RU 前書きの
    generation_actor: session-supervisor（今回限定承認済み・一般契約改訂なし）は RU 本文の記録を
    そのまま保持し、本 draft では追加の契約変更を行わない。
  wave_hints: []
```

# summary

RU-0197（子 Issue タイトルへの親 Epic 識別子表示）を要件化した。work_type は feature（表示能力の
追加と REQ-100 更新を伴うため）、scale は standard（単一 REQ・Design 1 件・関連実装面 3 件）。
REQ-100 の 001/004/005/006/007 の 5 行と適用範囲を `[Epic #<親番号>] Wave-N: 主題` 形式へ更新し、
具体書式は issue-title-policy Design 単一参照点の 5 節（判定表・Wave 投影・除外情報・場面・生成例）
を更新して所有する。ローカル版はゼロ埋めなしの既存番号で保存識別子・採番不変。生成・同期は
case-ready 既存経路の再用、旧形式一括改名なし、PR タイトルの Conventional Commits 契約維持。
実現面（case-ready 手順文面・回帰試験の正規表現更新・委任面の整合確認）は realization_actions
RA-001〜003 で後続工程へ引き継ぐ。AC01〜AC10 は TS-001〜TS-010 で全対応。
