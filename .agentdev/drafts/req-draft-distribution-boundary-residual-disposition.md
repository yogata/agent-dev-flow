---
draft_type: req_draft
topic_slug: distribution-boundary-residual-disposition
status: draft
created_at: 2026-10-13T12:40:00Z
source_rus:
  - RU-0222
---

# draft-data

```yaml
# check_distribution_boundary 残存 failures の処遇整理。処遇方針の決定と記録までがスコープ
work_type: maintenance

scale: standard

summary: check_distribution_boundary 残り 8 failures を個別評価し、ユーザー回答（CR-003/CR-004）により全件の処遇が確定。表現是正 6 件（THEME-001 例示値一般化、README:100 REQ-060 出典括弧削除、case-auto:129 REQ-108-006 出典括弧削除、definition-pr:50/:52/:55 出典一般化・出典情報は sidecar 保持）+ baseline 追加 0 件 + 誤参照 0 件。判定差整理方針は処遇区分のみ運用で確定（機構統合は行わない）し、処遇区分契約（表現是正区分/baseline 追加区分）を distribution-boundary Design へ追記する。表現是正の修正実装（6 行書換）は方針決定後の実行単位。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      個別処置確定分（表現是正区分、全 8 failures のうち 6 件。ユーザー回答 CR-003 により確定）:
      ① phase-theme-collaboration scripts/README.md:86（THEME-001）:
      例示値であり REQ 参照ではない（YAML frontmatter 例示の theme 識別子）。
      checker が unclassified-entry として検出している。処置: 例示値を一般化
      （THEME-001 → THEME-NNN 形式プレースホルダ）し実値の例示を排除する。
      誤参照ではなく checker 変更も不要（distribution-boundary Design L83:
      誤検出抑制は検出器の挙動であり承認例外と区別、L85: 許容領域の裸出力は対象外の契約がある）。
      ② phase-theme-collaboration scripts/README.md:100（REQ-060 参照）:
      文面は「repo root 起 cwd で実行」と自己完結済みの補助出典（REQ-060 = bun test 実行形態の統一）。
      処置: 出典括弧を削除する（distribution-boundary Design 配布物本文記述規則の
      一般化表現〔一般名詞表現への置換〕に準拠し、文面の意味を損なわない）。
      ③ case-auto SKILL.md:129（REQ-108-006 参照）:
      義務内容（再開プロトコル、正規入力と実行情報からの再開点再構成）が自己完結記載済みの出典明示。
      処置: 出典括弧を削除する（同上の記述規則準拠）。
      ④ case-open references/definition-pr-and-idempotency.md:50（REQ-021-015〔case-run の実装・検証対応の
      明示義務〕と REQ-021-018〔case-close QG-4 完全性再検査義務〕の出典明示。義務内容は詳細に
      自己完結記載）: 処置 = 表現是正（出典参照を一般化表現へ書換）。ユーザー回答により確定。
      ⑤ 同 :52（REQ-061-023〔case-ready トレーサビリティ完全性ゲート〕と REQ-021-024〔case-open 設計根拠対応
      非妨害・case-ready ready 条件〕の出典明示。工程ゲート契約と checker 検査内容の 1:1 対応）:
      処置 = 表現是正（同上）。ユーザー回答により確定。
      ⑥ 同 :55（IR-072 req-updated-freshness のルール名併記参照。計測日収束手順の正規出典）:
      処置 = 表現是正（ルール番号を除去した一般化表現〔ルール名と内容表現〕へ書換）。
      ユーザー回答により確定。
      出典情報の保持先: producer 側 traceability/ 配下 sidecar（Design 正則契約:
      対応関係は sidecar のみへ保持し、配布物へ投影しない）。
      実測根拠: 2026-10-13 の check_distribution_boundary 実行（scanned 481）で該当 failures を
      確認し、各参照先（REQ-108-006、REQ-060、REQ-021-015/018/024、REQ-061-023、IR-072、REQ-029 系）の
      実ファイル確認で誤参照 0 件を確認済み。
      処遇区分確定サマリ: 表現是正 6 件、baseline 追加 0 件、誤参照 0 件。
  - id: AG-002
    content: |
      元 HITL 対象 3 行の確定処置（CR-003 参照）:
      case-open references/definition-pr-and-idempotency.md の :50（REQ-021-015/018）、
      :52（REQ-061-023/021-024）、:55（IR-072）は、ユーザー回答により
      3 行とも表現是正（出典参照を一般化表現へ書換）で処遇確定した。
      Design 正則契約（配布物本文は一般化表現・対応関係は sidecar のみ）に従う。
      出典情報は producer 側 sidecar が保持する前提。AG-001 の ④⑤⑥ に反映済み。
  - id: AG-003
    content: |
      方針契約（確定）:
      処遇区分の契約（表現是正区分 / baseline 追加区分、配布物本文記述規則〔一般化表現、
      concrete ID 非記載〕が原則であり baseline 追加は例外、別検査機構で baseline 管理済みである
      ことだけを baseline 追加の根拠にしない）を distribution-boundary Design へ新規セクションとして
      追記する。ユーザー回答（CR-004）により、判定差整理方針は「処遇区分のみ運用」として確定した
      （check_distribution_boundary が check_integrity の baseline 管理を機械的に参照する機構統合は
      行わない。RD-001 の out_of_scope 記録どおり）。本契約は AG-001 の確定処置 6 件の適用先となる。
  - id: AG-004
    content: |
      確定済み（CR-003 参照、元 HITL 判断事項）:
      case-open reference 3 行（:50、:52、:55）は表現是正（出典参照の一般化表現への書換）で
      処遇確定した。判断根拠は Design 正則契約（配布物本文は一般化表現・対応関係は sidecar のみ）への
      準拠であり、出典情報は producer 側 sidecar が保持する。
      check_integrity approved additions 前例は baseline 追加の根拠には採用しない
      （処遇区分契約「別検査機構で baseline 管理済みであることだけを baseline 追加の根拠にしない」準拠）。
  - id: AG-005
    content: |
      確定済み（CR-004 参照、元 HITL 判断事項）:
      判定差整理方針は「処遇区分のみ運用」で確定。check_distribution_boundary と
      check_integrity baseline 管理（approved additions）の判定差は、distribution-boundary Design への
      処遇区分契約の明記で運用を正規化する。baseline 参照統合（機構統合）は行わない。
      AG-003 の Design 反映内容へ確定結果を反映済み。
  - id: AG-006
    content: |
      表現是正を選択した行の修正実装は方針決定後の実行単位として扱う（本 RU では決定と記録まで）。
      修正実装の対象候補は AG-001 の3行（確定分）と HITL 確定後の AG-004 該当行。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/integrity/distribution-boundary.md
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    target_area: "### 検査機構間の baseline 運用の整合と residual 参照の処遇区分"
    placement: tail
    anchor: "### concrete-id ベースライン再取得手順"
    canonical_owner: REQ-029
    source_items: [AG-003]
    content: |
      ### 検査機構間の baseline 運用の整合と residual 参照の処遇区分

      check_distribution_boundary と check_integrity は、重複する検出対象領域で baseline 管理（approved additions）の適用有無が分かれ得る。判定差は baseline 運用の機構統合ではなく、検出エントリごとの処遇区分で解消する。判定差の解消は baseline 参照統合（check_distribution_boundary が check_integrity の baseline を機械的に参照する方式）を行わず、処遇区分のみで運用する。

      - **表現是正区分**: 文面が自己完結しており、出典参照の除去または一般化表現への置換で consumer 解決不能性が解消できる参照。配布物本文の記述規則に従い是正する。是正完了後、baseline 残置は concrete-id ベースライン再取得手順で解消する
      - **baseline 追加区分**: 出典明示の情報価値が是正で代替できず、producer 側開発者向けの正規出典として保持する価値が明示承認された参照。個別承認例外として baseline へ登録し、検査から許容する

      配布物本文の記述規則（一般化表現、concrete ID 非記載）が原則であり、baseline 追加は例外である。該当エントリが baseline 管理済みの別検査機構で許容されていることだけを baseline 追加の根拠にしない。出典情報の正規保持先は producer 側 traceability/ 配下 sidecar であり、配布物本文へ出典番号を投影しない。

conflict_resolutions:
  - id: CR-001
    conflict: "agentdev_handoff: true の RU に対する前工程からの引き継ぎ判定"
    resolution: "本リポジトリ（自己ホスティング）では通常入力として扱い、前工程引き継ぎ停止を発動しない（Batch D 共通方針、ユーザー指示 (a)）"
  - id: CR-002
    conflict: "処遇区分の契約を distribution-boundary Design へ追記するか Decision とするか"
    resolution: "Decision は不採用。checker 個別ルール・baseline 運用契約は Design 分離基準（checker 個別ルール）該当であり、distribution-boundary Design（REQ-029 の正規 Design 対応）への反映が正規配置（STEP-5 禁止ゲート判定）。Jev 要件展開評価（20261013T123424Z-0da9）も Design 行帰属 0.99 で一致"
  - id: CR-003
    conflict: "[Batch D] HITL-REQUEST: case-open definition-pr-and-idempotency.md の 3 行（:50 REQ-021-015/018、:52 REQ-061-023/021-024、:55 IR-072）の処遇（baseline 追加か表現是正か）"
    resolution: "ユーザー回答（2026-10-13）: 3 行とも表現是正で確定。出典参照を一般化表現へ書換える処遇区分とし、Design 正則契約（配布物本文は一般化表現・対応関係は sidecar のみ）に従う。出典情報は producer 側 sidecar が保持する前提。根拠: Design 正則契約の適用が原則であり、check_integrity approved additions 前例は baseline 追加の根拠に採用しない（処遇区分契約準拠）。AG-001 ④⑤⑥・AG-002・AG-004 へ反映済み"
  - id: CR-004
    conflict: "[Batch D] HITL-REQUEST: check_distribution_boundary と check_integrity baseline 管理（approved additions）の判定差整理方針の確定（処遇区分のみ運用か baseline 参照統合か）"
    resolution: "ユーザー回答（2026-10-13）: 処遇区分のみ運用で確定。distribution-boundary Design へ処遇区分契約を明記して運用を正規化する。baseline 参照統合（機構統合）は行わない（RD-001 の out_of_scope 記録どおり）。AG-003・AG-005 へ反映済み"

operation_units:
  - ou_id: OU-001
    source_ru: RU-0222
    target_design:
      operation: update
      domain: integrity
      slug: distribution-boundary
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      Definition 保存（case-ready）後、distribution-boundary.md の新規セクション
      「### 検査機構間の baseline 運用の整合と residual 参照の処遇区分」が
      anchor「### concrete-id ベースライン再取得手順」セクション末尾に配置され、
      docs-check が合格することを確認する。HITL 確定後（AG-005）は判断結果が
      Design 反映内容と矛盾しないことを突合する。
    pass_criteria: |
      新規セクションが1件配置され、docs-check がエラー 0 件、
      HITL 確定後は処遇区分契約と判断結果が矛盾なく記載されていること。
    on_failure: |
      fix-and-reverify: Design 記述を修正して配置確認と docs-check を再実行する。
  - id: TS-002
    target_item: AG-001
    verification: |
      方針決定後に表現是正の修正実装（AG-006 の実行単位）が適用された後、
      check_distribution_boundary（repo root、profile: source）を再実行し、
      表現是正対象 6 failures（README.md:86、README.md:100、case-auto SKILL.md:129、
      definition-pr-and-idempotency.md:50、:52、:55）が解消されることを確認する。
      なお本修正の網羅範囲は修正対象列挙（4 ファイル 6 行）と一致させ、
      See Also 等の参照行は検出対象外とする扱いを明示する（対象 6 行には See Also 参照は
      含まれないことを確認済み）。
    pass_criteria: |
      表現是正対象の 6 failures が 0 件となること（baseline 追加 0 件のため全 8 failures が解消）。
    on_failure: |
      fix-and-reverify: 書換漏れの行を修正して checker を再実行する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0222
    source_item: RU-0222.判定差の機構統合による吸収（check_integrity baseline の機械参照）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      baseline 運用の機構統合（check_distribution_boundary が check_integrity baseline を
      機械的に参照する方式）は検査機構の構造変更であり、本 RU のスコープ（処遇方針の決定と記録）
      に含めない。処遇区分での運用解消に限定し、機構統合の要否は AG-005 の HITL 判断結果に従う。
    evidence:
      path: .agentdev/backlog/req-units/RU-0222.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/integrity/distribution-boundary.md
    target_content_sha256: 93eecb7a137172aa004843b54ccf0a0615fb6add98132f42d5a0608e152744e9
    check_scope:
      heading: "### concrete-id ベースライン再取得手順"
      start_line: 87
      end_line: 99
    execution_conditions:
      operation: append
      edit_sha256: 0bb61d29b23feab6c452490eeddce8432381c7a2e640fc675be55c7deaf5bc73
      expected_old_count: null
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 2
        all_ok: true
      post:
        count: 2
        all_ok: true
    diff_compact:
      changed_lines_count: 9
      added: 9
      removed: 0
    executed_at: 2026-10-13T13:09:13.333Z

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

check_distribution_boundary 残り 8 failures を個別評価し、ユーザー回答（CR-003/CR-004）により全件の処遇が確定した。THEME-001（例示値）、REQ-060、REQ-108-006、case-open reference 3 行（REQ-021-015/018、REQ-061-023/021-024、IR-072）の 6 件は表現是正区分（出典参照の一般化表現への書換、出典情報は producer 側 sidecar が保持）で確定。baseline 追加 0 件、誤参照 0 件。
判定差整理方針は「処遇区分のみ運用」で確定し（baseline 参照統合・機構統合は行わない）、処遇区分契約を distribution-boundary Design へ新規セクションとして追記する（組立検査済み、evidence 記録済み）。
表現是正の修正実装（6 行書換）は方針決定後の実行単位として扱う（本 draft では決定と記録まで）。
