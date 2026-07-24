---
draft_type: req_draft
topic_slug: misc-individual-fixes
status: saved
created_at: 2026-07-23T00:00:00+09:00
source_rus: [RU-0005, RU-0007, RU-0010, RU-0016, RU-0017]
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- req_draft の原本は # draft-data 内の YAML コードブロックである。 -->

# draft-data

```yaml
work_type: feature
scale: standard

summary: |
  C10 は5件の個別修正を統合する。RU-0005（ADR-0137 索引）、RU-0007（SPEC status 3値）、RU-0016（REQ-0108 参照値）は現行契約で充足済みのため covered 除外。
  RU-0010（配布物参照境界是正）と RU-0017（verify-only PR 形式）のみを実行対象とする。
  RU-0017 はテンプレート単独変更ではなく、workflow-templates SPEC + pr_desc.md + case-run SPEC + case-close SPEC + QG-4 SPEC の生成側と評価側の契約を同時変更へ拡張する。
  RU-0010 は req-cross-reference-integrity（accepted docs 是正）と境界を明確化し、src/opencode/commands/** と src/opencode/skills/** の配布物へ限定する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-005
    content: |
      配布 command と skill の本文は、導入先で解決できない REQ または ADR の具体 ID に依存しない。
      具体 ID を保持する必要がない参照は、機能名または文書種別を表す抽象参照へ置換する。
      この是正は REQ-0160-005 および REQ-0108-263 の配布物参照境界に従う。

  - id: AG-006
    content: |
      配布 command と skill の本文は、プロジェクト固有の src/opencode/、docs/specs/、docs/guides/ などの具体パスに依存しない。
      参照先は当該 skill の SKILL.md、利用者向けガイド、project extension など、導入先で意味を保つ表現へ置換する。
      固定 URL が対象内に存在しないことも同じ検査で確認する。

  - id: AG-007
    content: |
      配布物参照境界違反は、full audit と baseline の差分を根拠に、実新規違反と baseline 更新漏れを区別して処理する。
      実新規違反は本文を是正し、既知違反だけで構成される差分は根拠を残して baseline を更新する。
      baseline 更新により実新規違反を許容しない。

  - id: AG-009
    content: |
      agentdev-workflow-templates の pr_desc.md は、verify-only PR を示す専用フォーマットを持つ。
      専用フォーマットには種別 verify-only と、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を明示する。
      根拠は姉妹実装 PR だけに限定せず、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。

  - id: AG-010
    content: |
      verify-only PR のフォーマットは、実装変更を含まない理由と、検証済みである範囲を記録する。
      case-run は verify-only PR 作成時に pr_desc.md の当該欄を埋める。
      case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む規則を持つ。
      「実装内容」は空欄にせず、「実装差分なし」とその理由を記録する。
      これにより files_checked: [] が正当な場合に、case-close の targeted docs guard と完了条件評価の根拠を PR 本文から確認できる。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/commands/case-run.md
    target_area: "## verification-only PR（実装差分なし、検証のみ）（REQ-0158-002）"
    source_items: [AG-009, AG-010]
    content: |
      ## verification-only PR（実装差分なし、検証のみ）（REQ-0158-002）

      case-run は実行担当サブエージェント委譲の結果、実装差分0件・検証のみで完了する PR（**verification-only PR**）を生成する場合がある。本節は verification-only PR の判定条件、PR 本文の根拠欄記入規則、GitHub の空 PR 取り扱い、case-close への引継ぎ注意事项を定める。要件の SSoT は REQ-0158-002。

      PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。pr_desc.md への verify-only 根拠欄追加は workflow-templates SPEC の変更として位置付ける。

      ### 定義

      verification-only PR は以下を全て満たす PR とする（REQ-0158-002）。

      - PR の変更ファイル数が0件（`gh pr view --json files` で `files: []`）
      - Issue の受け入れ基準が検証のみで充足された（既存実装・既存文書が要件を満たしており、追加実装を要しなかった）
      - 検証結果が PR 本文の verify-only 根拠欄に evidence として記録されている

      実行担当サブエージェントは verification-only で完了した場合も `completed-pr` を返し、PR URL を委譲 result に含める（`blocked` / `failed` にはしない）。

      ### verify-only 根拠欄の記入規則

      case-run は verify-only PR 作成時に pr_desc.md の verify-only 根拠欄へ、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。「実装内容」欄は空欄にせず、「実装差分なし」と理由を記録する。

      ### GitHub の空 PR 許容

      GitHub は空 PR（変更ファイル0件）の squash merge を許可し、空 commit を生成する（commit 2b34f8b0 で実証）。case-run は空 PR の作成・マージを GitHub の挙動に依存して実行する。squash merge で生成された空 commit は履歴に残り、`gh pr merge --squash` の通常フローに従う。

      ### case-close 引継ぎ注意事项

      verification-only PR は case-close Step 3-1 targeted docs guard で files_checked が空になるため、次の注意事项を case-close へ引き継ぐ。

      - PR 本文の verify-only 根拠欄に「実装差分を含まない理由」「根拠成果物または commit」「検証対象」「検証結果」が記録されていること（[case-close.md](case-close.md)「verification-only PR の files_checked 空確認（REQ-0158-002）」参照）
      - case-close は files_checked 空を検出した場合、REQ-0158-002 に基づき verification-only 判定ステップを経て PASS 処理する（false-clean 3層防御との相互作用は case-close SPEC 参照）
      - case-run 側は PR 作成までを責務とし、verification-only 判定自体は case-close が行う（単一書き手: case-close、ADR-0114 完了条件チェックボックス専任責務）

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/commands/case-close.md
    target_area: "#### verification-only PR の files_checked 空確認（REQ-0158-002）"
    source_items: [AG-010]
    content: |
      #### verification-only PR の files_checked 空確認（REQ-0158-002）

      verification-only PR（実装差分0件、検証のみで作成された PR）の場合、`files_checked` が空になることが正規の状態として発生する。case-close は次の手順で verification-only 判定を行い、正当と判断された場合に PASS 処理する。要件の SSoT は REQ-0158-002、verification-only PR の定義と case-run 側引継ぎ注意事项は [case-run.md](case-run.md)「verification-only PR（実装差分なし、検証のみ）（REQ-0158-002）」参照。

      PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。case-close は PR 本文の verify-only 根拠欄を読み、記載が不十分な場合は PASS としない。

      **判定基準（全て満たすこと）**:

      1. PR 変更ファイル一覧（`gh pr view <PR> --json files`）が空配列であること
      2. PR 本文の verify-only 根拠欄に実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果が記録されていること
      3. PR 本文の検証結果から、Issue の受け入れ基準が検証のみで充足されたことが確認できること

      **PASS 処理**:

      上記3項目を全て満たす場合、case-close は verification-only PR と判定し、files_checked 空の FAILURE を PASS 処理する。判定根拠（PR 本文の verify-only 根拠欄の参照、`gh pr view --json files` の空配列確認）を完了報告に記録する。根拠欄の記載が不十分な場合は PASS としない。

      **false-clean 3層防御との相互作用**:

      REQ-0158「case-close 向け false-clean 予防」節は files_checked 空を silent pass としないための3層防御（対象空時の warning 報告、`--files` 標準化、files_checked 非空の確認ステップ）を定める。REQ-0158-002 はこの3層防御を回避するものではなく、verification-only の正当性確認により3層防御の警告を吸収する経路を追加する。両者の関係は以下の通り:

      | 層 | REQ-0158 false-clean 予防節 | REQ-0158-002 による相互作用 |
      |---|---|---|
      | 第1層 | check_changed_docs.ts が files_checked 空を warning として報告 | warning を検知した case-close が verification-only 判定ステップへ進むトリガーとして扱う（silent pass しない） |
      | 第2層 | case-close は `--files <PR変更ファイル>` 指定を標準とする | verification-only PR では `--files` が空配列となり、それ自体が verification-only のシグナルとなる |
      | 第3層 | files_checked が空でないことの確認ステップを含める | 本ステップが verification-only 判定基準（3項目）の適用場所となる。3項目を満たさない場合は silent pass を許さず FAILURE を維持する |

      verification-only 判定基準3項目を満たさない files_checked 空（例: PR 本文の根拠欄に記載がない、検証 evidence がない）は silent pass を許さず、FAILURE を維持して構造化エラー停止とする。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/quality/quality-gates.md
    target_area: "### 完了条件チェックボックス評価"
    source_items: [AG-010]
    content: |
      ### 完了条件チェックボックス評価

      QG-4 は Issue 本文の完了条件セクションのチェックボックスを品質ゲートとして評価する。
      未達項目は case-run への差し戻し（G08）、または intake への逃がし禁止（G16）として扱う。

      verify-only PR（実装差分0件、検証のみ）の場合、QG-4 の完了条件評価は PR 本文の verify-only 根拠欄（実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果）を証拠ソースとして認める。verify-only PR は実装差分を含まないため、根拠欄の記載で完了条件を評価する。

      PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-workflow-templates.md
    target_area: "## 現在の動作"
    source_items: [AG-009, AG-010]
    content: |
      ## 現在の動作

      - テンプレートは Read tool で読み込み、変数部分を置換して使用
      - 変数置換後の本文は直ちに `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）により一時ファイル（`$env:TEMP/agentdev/gh-temp-{timestamp}.md` 等）へ保存し、`gh --body-file`/ `-F` で渡すこと。文字列変数での本文持ち回り、PowerShell の `Out-File`/ `Set-Content`/ `>` リダイレクトによる一時ファイル作成を禁止する（agentdev-gh-cli standard-procedures Section 1 準拠）
      - テンプレートの構造を維持する（セクションの削除、順序変更禁止）。Markdown 行構造（LF、セクション間空行、インデント）の保持を含む
      - `<!-- 【必須】 -->` マーカー付きセクションは省略不可
      - `<!-- 【任意】 -->` マーカー付きセクションは省略可能
      - 変数に該当するデータがない場合は「該当なし」と記載
      - PR テンプレート（pr_desc.md）は verify-only PR の根拠欄を含む。根拠欄には種別 verify-only、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。case-run は verify-only PR 作成時に当該欄を埋め、case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む（[case-run.md](../commands/case-run.md)「verification-only PR（実装差分なし、検証のみ）（REQ-0158-002）」、[case-close.md](../commands/case-close.md)「verification-only PR の files_checked 空確認（REQ-0158-002）」参照）

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0005 は ADR-0137 の4箇所の反映漏れを報告していた。
    resolution: |
      実ファイル確認の結果、現在の docs/adr/README.md には accepted ADR 27件、ADR-0137 の一覧、ワークフローのトピック別ビュー、REQ-0114 の関連 REQ 行が存在する。RU-0005 の要求は現行契約で充足済みのため covered 除外。AG-001/002、ACT-ADR-001、OU-001、TS-001/002 は review_dispositions へ記録。

  - id: CR-002
    conflict: |
      RU-0007 は SPEC index の2値記述と superseded warning を、RU-0016 は REQ-0108 の参照値の陳腐化を報告していた。
    resolution: |
      実ファイル確認の結果、現在の docs/specs/README.md は3 status 値（draft/accepted/superseded）を記載し、checkSpecFrontmatter は superseded と superseded_by を扱っている。req-health-metrics.md は REQ-0108 を 53 行、+1 と表示しており、RU-0016 の検出時点より後の計測結果である。RU-0007 と RU-0016 の要求は現行契約で充足済みのため covered 除外。AG-003/004/008、ACT-SPEC-001/002（旧）、OU-002/004、TS-003/004/008 は review_dispositions へ記録。

  - id: CR-003
    conflict: |
      配布物参照境界の是正と verify-only PR 形式の拡張は、既存の配布物境界および case-close 契約を補強する変更である。
    resolution: |
      新規のアーキテクチャ判断は含まれないため、ADR は作成しない。
      RU-0010 は配布 command/skill 本文の具体 ID と具体パスを抽象参照へ置換し、baseline と delta を区別する。req-cross-reference-integrity（accepted docs 是正）と境界を明確化し、src/opencode/commands/** と src/opencode/skills/** へ限定する。
      RU-0017 はテンプレート単独変更ではなく、workflow-templates SPEC + pr_desc.md + case-run SPEC + case-close SPEC + QG-4 SPEC の生成側と評価側の契約を同時変更へ拡張する。根拠は姉妹実装 PR だけに限定せず、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。

operation_units:
  - ou_id: OU-003
    source_ru: RU-0010
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    target_artifacts:
      - src/opencode/commands/agentdev/**/*.md
      - src/opencode/skills/agentdev-*/**/*.md
    result: {}

  - ou_id: OU-005
    source_ru: RU-0017
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    source_actions: [ACT-SPEC-001, ACT-SPEC-002, ACT-SPEC-003, ACT-SPEC-004]
    target_artifacts:
      - src/opencode/skills/agentdev-workflow-templates/templates/pr_desc.md
      - docs/specs/skills/agentdev-workflow-templates.md
      - docs/specs/commands/case-run.md
      - docs/specs/commands/case-close.md
      - docs/specs/quality/quality-gates.md
    result: {}

test_strategy:
  - id: TS-005
    target_item: AG-005
    verification: |
      RU-0010 の対象ファイル群に配布物参照境界検査を実行し、具体 REQ/ADR ID の delta を確認する。
    pass_criteria: |
      是正対象の具体 ID が導入先で意味を保つ抽象参照へ置換され、新規 delta が残らない。
    on_failure: |
      fix-and-reverify。具体 ID を置換または不要な参照を削除し、本文の意味を確認してから検査を再実行する。

  - id: TS-006
    target_item: AG-006
    verification: |
      RU-0010 の対象ファイル群に配布物参照境界検査を実行し、具体パスと固定 URL の delta を確認する。
    pass_criteria: |
      導入先未解決の具体パスまたは固定 URL が新規 delta として報告されず、抽象参照が対象の責務を示す。
    on_failure: |
      fix-and-reverify。具体パスまたは固定 URL を導入先で解決可能な表現へ置換し、検査と本文レビューを再実行する。

  - id: TS-007
    target_item: AG-007
    verification: |
      full audit、保存済み baseline、delta guard の各結果を比較し、各報告を実新規違反または baseline 更新漏れに分類する。
    pass_criteria: |
      baseline 更新は既知違反だけを反映し、実新規違反は本文是正後に delta から消える。
    on_failure: |
      fix-and-reverify。分類根拠を見直し、実新規違反を baseline に追加せず本文是正または検査設定修正を行って再検証する。

  - id: TS-009
    target_item: AG-009
    verification: |
      pr_desc.md の verify-only PR セクションを確認し、種別 verify-only、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果の記入欄を確認する。
    pass_criteria: |
      verify-only PR を作成する担当者が、実装差分を含まない理由と根拠（姉妹実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由のいずれか）を一意に示せるフォーマットになっている。
    on_failure: |
      fix-and-reverify。欠落した記入欄をテンプレートへ追加し、通常 PR 用の必須節と矛盾しないことを再確認する。

  - id: TS-010
    target_item: AG-010
    verification: |
      workflow-templates SPEC、case-run SPEC、case-close SPEC、QG-4 SPEC を確認し、pr_desc.md の verify-only 根拠欄が完了条件の証拠ソースとして読まれる規則が4 SPEC 間で整合していることを確認する。
      verify-only PR の記入例で、files_checked: [] の理由と完了条件の評価範囲を記載し、case-close と QG-4 が必要とする根拠を確認する。
    pass_criteria: |
      実装変更を含まない理由、根拠成果物または commit、検証対象、検証結果が PR 本文から読み取れ、case-close と QG-4 が当該欄を証拠ソースとして扱う規則が4 SPEC で矛盾しない。空の files_checked が無根拠にならない。
    on_failure: |
      fix-and-reverify。理由、評価範囲、または証拠ソース認容の規則を補い、verify-only PR の記入例で4 SPEC 間の整合を再確認する。

case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  decomposition: |
    C10 は5件の RU からなる。RU-0005（ADR-0137 索引）、RU-0007（SPEC status 3値）、RU-0016（REQ-0108 参照値）は現行契約で充足済みのため covered 除外し、Issue を作成しない。
    実行対象は RU-0010（OU-003、配布物参照境界是正）と RU-0017（OU-005、verify-only PR 形式拡張）の2件。
    OU-003（RU-0010）は配布本文の変更範囲が複数ファイルにまたがるため、当該 Issue 内で baseline と delta の判定を起点にファイル群ごとへ分割して実行する。Wave 分割は Issue の分割ではなく1 Issue 内の実行フェーズ扱いとする。
    OU-005（RU-0017）は workflow-templates SPEC、pr_desc.md テンプレート、case-run SPEC、case-close SPEC、QG-4 SPEC の5ファイルを同時に変更する。生成側と評価側の契約を同時に変更するため、1 Issue で完結させる。
    OU-005 は case-close.md を編集する。index-generation-spec（OU-005）も case-close.md の別節（L88 `### 単一 Issue クローズ`）を編集する。同一ファイル理由のみの直列指定は行わず、意味的依存がないため並列実行を許容する。case-run は実装時に default branch を再取得して target_area を再解決する。
    Epic Issue（backlog26-rus-integrated）は2件の子 Issue を束ねる親 Issue とする。
  wave_hints:
    - "OU-003 と OU-005 は対象ファイルが重ならないため並列可能。"
    - "OU-003 Wave 1: baseline と delta を確定し、case-auto.md を含む command 群の参照を是正する。"
    - "OU-003 Wave 2: agentdev-inspect-skills/SKILL.md を含む高密度 skill 群の参照を是正する。"
    - "OU-003 Wave 3: 残る対象ファイルを是正し、full audit と delta guard で Wave 1 と Wave 2 の結果を含めて確認する。"
    - "OU-005 Wave 1: workflow-templates SPEC と pr_desc.md テンプレートへ verify-only 根拠欄を追加し、case-run SPEC へ記入規則を追加する。"
    - "OU-005 Wave 2: case-close SPEC と QG-4 SPEC へ根拠欄を証拠ソースとして読む規則を追加し、5ファイル間の整合を確認する。"
  adr_candidates: |
    該当なし。
    RU-0010 は既存の配布物参照境界契約（REQ-0160-005、REQ-0108-263）の適用である。
    RU-0017 は既存の verify-only PR 契約（REQ-0158-002）の拡張であり、テンプレート、生成側、評価側の同時変更を伴うが新しい長期設計判断を含まない。

review_dispositions:
  - id: RD-001
    source_ru: RU-0005
    source_item: AG-001
    disposition: covered
    reason_code: already_satisfied
    reason: RU-0005 が報告した ADR-0137 の4箇所の反映漏れは現行契約で充足済み。CR-001 で実ファイル確認。
    evidence:
      - path: docs/adr/README.md
        section: accepted ADR 一覧、ワークフローのトピック別ビュー、関連 REQ 表
        checked_at_commit: null
    related_removed_items: [AG-002, ACT-ADR-001, OU-001, TS-001, TS-002]

  - id: RD-002
    source_ru: RU-0007
    source_item: AG-003
    disposition: covered
    reason_code: already_satisfied
    reason: RU-0007 が報告した SPEC index の2値記述と superseded warning は現行契約で充足済み。CR-002 で実ファイル確認。
    evidence:
      - path: docs/specs/README.md
        section: "## SPEC status 追跡情報源（REQ-0154-001, REQ-0154-003）"
        checked_at_commit: null
      - path: .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts
        section: checkSpecFrontmatter
        checked_at_commit: null
    related_removed_items: [AG-004, "ACT-SPEC-001（旧 RU-0007 用 docs/specs/README.md）", OU-002, TS-003, TS-004]

  - id: RD-003
    source_ru: RU-0016
    source_item: AG-008
    disposition: covered
    reason_code: already_satisfied
    reason: RU-0016 が報告した REQ-0108 参照値の陳腐化は、AUTOGEN 再生成で現行の計測値へ更新済み。CR-002 で実ファイル確認。
    evidence:
      - path: docs/specs/quality/req-health-metrics.md
        section: "## 現行 REQ の計測例（参照値）"
        checked_at_commit: null
    related_removed_items: ["ACT-SPEC-002（旧 RU-0016 用 req-health-metrics.md）", OU-004, TS-008]
```

# summary

C10 の要件ドラフト。5件の RU のうち RU-0005、RU-0007、RU-0016 は現行契約で充足済みのため covered 除外。実行対象は RU-0010 と RU-0017 の2件。

RU-0010 は配布 command/skill 本文の具体 ID と具体パスを抽象化し、baseline と delta を区別して Wave 単位で進める。req-cross-reference-integrity（accepted docs 是正）と境界を明確化し、src/opencode/commands/** と src/opencode/skills/** へ限定する。

RU-0017 は verify-only PR の正当理由と根拠を記録できる PR 本文フォーマットを追加する。テンプレート単独変更ではなく、workflow-templates SPEC + pr_desc.md + case-run SPEC + case-close SPEC + QG-4 SPEC の生成側と評価側の契約を同時変更へ拡張する。根拠は姉妹実装 PR だけに限定せず、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。
