---
draft_type: req_draft
topic_slug: ru0022-artifact-resp-misquote
status: draft
created_at: 2026-09-16T00:00:00+09:00
source_rus:
  - RU-0022
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: docs_chore

# summary: 当該 draft が何を合意したかの1段落要約
summary: 正規成果物（responsibilities 系 Design）内の REQ 行引用が参照先 REQ 行の実本文と整合しない誤引用を、文書品質契約側の防止規定（REQ-053 への APPEND）と artifact-responsibilities.md の誤引用2箇所の実現面修正で解消する。REQ-082-004 の実本文は HITL 境界系であり、操作 skill 正規所有者台帳節の「最も安定した最小の定義元」引用は出所不明の文言であることが実ファイル照合で確定済み。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: 正規成果物（Design）本文内の REQ 行引用（REQ-NNN-MMM 形式の参照箇所）は、参照先 REQ 行の実本文と整合する文言のみを含むこと。参照先の実本文に存在しない引用文言を出所不明のまま保持せず、実本文と整合しない参照は参照先の実本文に即した表現へ修正するか、当該参照を取り除いて適切な根拠へ付け替えること。この規定は REQ-053（文書と配布物の文章品質契約）へ新規行として追加し、参照残骸（REQ-053-010）および配布 skill references の参照残骸（REQ-053-023）と同じ文書品質側の関心として扱う。根拠：docs/designs/responsibilities/artifact-responsibilities.md の操作 skill 正規所有者台帳節（L38 および L46 相当）では REQ-082-004 を「責務ごとに最も安定した最小の定義元を正規とする」の出所として引用しているが、REQ-082-004 の実本文は「技術的に決着できない優先判断、ユーザー固有の目的・価値判断、両立不能要求、必要情報不足等、エージェント間で自律解決できない争点のみをユーザーへ返し…」（HITL 境界系）であり引用文と内容が完全に異なる（docs/requirements/REQ-082.md 実査 2026-09-16）。引用文言の実出所は src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md（根拠原則節）のみであり、REQ-082 分離前から存在した dangling 解消（Case #2846 の機械的付け替え）で引用本文の意味判断が対象外と記録された残課題である。
  - id: AG-002
    content: artifact-responsibilities.md の誤引用2箇所は REQ-082-004 の実本文に即した表現へ修正し、出所不明の引用残存を 0 件にする。対象は操作 skill 正規所有者台帳節の (1) 正規所有の単位の根拠として REQ-082-004 を引用する箇所（「REQ-082-004「責務ごとに最も安定した最小の定義元を正規とする」の延長であり、適用条件を精緻化する。」の行）と (2) 関心キーの定義表の安定性基準行（「最も安定した最小の定義元を選定する（REQ-082-004）」）。修正後も正規所有の単位と安定性基準の規定自体は維持し、参照根拠だけを REQ-082-004 実本文と整合する形へ整える。REQ-082-004（HITL 境界系）が正規所有の単位の根拠として意味不適合である場合は、当該 REQ 参照を取り除き REQ-001（文書体系と持続可能な基準構造、関心キーの定義が REQ-001 を参照済み）等の適切な根拠へ付け替える。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-053.md
    source_items: [AG-001]
    content: |
      | REQ-053-040 | 正規成果物内の REQ 行引用は、参照先 REQ 行の実本文と整合する文言のみを含むこと。参照先の実本文に存在しない引用文言を出所不明のまま保持せず、実本文と整合しない参照は実本文に即した表現へ修正するか、当該参照を取り除いて適切な根拠へ付け替えること |

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 誤引用の修正手段として、(1) 2箇所の引用を REQ-082-004 実本文に即した表現へ書き換える方式と、(2) 引用文言の出所（semantic-diagnostic-perspectives.md の「正規な定義元の原則」）を正規 REQ 行へ要件化し参照先を付け替える方式の2案が存在した。
    resolution: 方式 (1) を採用する。根拠：出所の要件化は新しい品質原則を追加する意味判断を伴い、本 RU の論点（実本文と整合しない参照の解消）を超える範囲拡大になる。方式 (1) でも REQ-053-040 の防止規定により同種の誤引用の再発を抑止できる。方式 (2) は不採用とするが、REQ-082-004 が正規所有の単位の根拠として意味不適合である場合は AG-002 のとおり当該参照を取り除き REQ-001 等の既存根拠へ付け替えるため、出所文言の保持は発生しない。また RU の受け入れ条件（誤引用の解消）だけでは当該是正を REQ 体系に残す行が存在せず case-close 後の再発検知の正がなくなるため、AG-001 として REQ-053 への防止規定行の追加を本 RU の範囲として要件化した（RU は修正手段の選択を req-define に委ねており、防止規定の追加は誤引用解消の要件保存に必要な最小構成である）。
  - id: CR-002
    conflict: REQ-053 の現行最大行は REQ-053-039 であり、本 draft の APPEND 先行番号（REQ-053-040）は複数の req-define 実行間で採番衝突し得る。
    resolution: REQ-053-040 は擬似採番であり、case-open が決定的採番により再確定する。case-open 以降の工程は本 draft の行番号を直接確定値として扱わない。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0022
    target_req: REQ-053
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-053.md を再読取し、新規行（擬似 REQ-053-040、case-open の決定的採番で確定）が要件テーブルへ APPEND されていることを確認する。
      行本文が「参照先 REQ 行の実本文と整合する文言のみを含む」「出所不明の引用文言を保持しない」「実本文と整合しない参照の修正または根拠付け替え」の3点を要件行として含むことを確認する。
      行 ID と docs/requirements/README.md の AUTOGEN 索引の整合（行追加後の再生成）を check_autogen_freshness で確認する。
    pass_criteria: |
      REQ-053.md の要件テーブルに当該行が存在し、行本文が上記3点を含む。
      行 ID が REQ-053 の現行最大行の次の連番であり、AUTOGEN 索引が再生成済みで鮮度検査が exit 0 である。
    on_failure: |
      fix-and-reverify。行本文の文言修正または索引再生成の再実行で解消できる文書不備であるため、修正後に同一検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/designs/responsibilities/artifact-responsibilities.md の最終 HEAD 実ファイル全文を再読取する（REQ-053-014/015/016 に従い、作業メモや差分ではなく全文を対象とする）。
      grep により REQ-082-004 の全参照箇所を列挙し、各参照の文言が docs/requirements/REQ-082.md の REQ-082-004 行の実本文と整合するかを1箇所ずつ確認する。
      「最も安定した最小の定義元」のような REQ-082-004 実本文に存在しない引用文言の残存を検索する。
      操作 skill 正規所有者台帳節の規定（正規所有の単位、安定性基準、重複検出、命名規則）が修正後に維持されていることを確認する。
    pass_criteria: |
      REQ-082-004 参照の全箇所が REQ-082-004 行の実本文と整合する文言のみを含み、出所不明の引用残存が 0 件である。
      操作 skill 正規所有者台帳節の規定構造（正規所有の単位、安定性基準等）が維持されている。
      docs-check の該当検査（Markdown 構造、文書表層品質）が pass である。
    on_failure: |
      fix-and-reverify。2箇所の表現修正または根拠付け替えの再適用で解消できる文書不備であるため、修正後に全文再読取と grep 再実行で再検証する。

# realization_actions: 実現面の変更方針
realization_actions:
  - id: RA-001
    concern: artifact-responsibilities.md 操作 skill 正規所有者台帳節の REQ-082-004 誤引用2箇所の修正
    responsibility: 成果物責任表（responsibilities 系 Design）の本文品質は REQ-053（文書と配布物の文章品質契約）が正規所有する。本修正は REQ-053 の品質契約の適用による是正であり、Design の規定内容（正規所有の単位、安定性基準）の設計判断を変更しない。
    ownership_hints:
      - "変更対象: docs/designs/responsibilities/artifact-responsibilities.md（操作 skill 正規所有者台帳節）"
      - "修正箇所1: 正規所有の単位の根拠行「REQ-082-004「責務ごとに最も安定した最小の定義元を正規とする」の延長であり、適用条件を精緻化する。」"
      - "修正箇所2: 関心キーの定義表の安定性基準行「最も安定した最小の定義元を選定する（REQ-082-004）。仕様変更時に限定された影響範囲で済む所有責務単位を選ぶ」"
      - "REQ-082-004 実本文（HITL 境界系）: docs/requirements/REQ-082.md"
      - "引用文言の実出所（修正対象外・参考）: src/opencode/skills/agentdev-inspect-skills/references/semantic-diagnostic-perspectives.md 根拠原則節"
      - "意味不適合時の根拠付け替え先候補: REQ-001（文書体系と持続可能な基準構造、関心キーの定義表が REQ-001 を参照）"
    intent: 正規成果物内の誤引用が参照者へ REQ-082-004 の実規定（HITL 境界系）と無関係な文言を要件内容として伝える状態を解消し、REQ 行引用の実本文整合を保証する。
    verification_refs: [TS-002]
    source_items: [AG-002]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0022
    source_item: req-082-004-misquote-fix
    disposition: covered
    reason_code: requirements_mapped
    reason: |
      RU-0022 の論点（artifact-responsibilities.md の REQ-082-004 誤引用修正）は AG-001（REQ-053 への防止規定追加）と AG-002（誤引用2箇所の実現面修正）へすべて反映した。
      統合理由のとおり 1:1 の単一論点であり、分割・統合は不要である。
    evidence:
      path: docs/designs/responsibilities/artifact-responsibilities.md
      section: 操作 skill 正規所有者台帳節
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

REQ-053 への防止規定追加（擬似 REQ-053-040）と artifact-responsibilities.md の誤引用2箇所修正で構成する。
修正手段は 2箇所の引用を REQ-082-004 実本文に即した表現への書き換え（および意味不適合時の根拠付け替え）を採用した。
擬似採番 REQ-053-040 は case-open が決定的採番により確定する。
