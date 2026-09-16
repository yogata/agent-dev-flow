---
draft_type: req_draft
topic_slug: ru0033-req-row-ref-migration
status: draft
created_at: 2026-09-16T11:41:36+09:00
source_rus:
  - RU-0033
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  RU-0033（inspect F-01）を、REQ-057 への APPEND 2行、IR-067 Design update、付け替えと baseline 消化の realization_actions として要件化した。実ファイル照合の結果、付け替え状態は REQ-057-001 が既に所有し、検査適用は REQ-010-069/068 が既に所有するため、新規 REQ（共有計画の擬似 REQ-086 予約）は作成せず REQ-057 への APPEND に修正した。IR-067 の detection_method は docs/designs・docs/decisions 本文全走査を既に含み、旧行番号引用は NG baseline（導入時点 318 件）で許容されているため、Design update は適用拡大の新規実装ではなく baseline 消化と記述現行化を担う。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      docs corpus の Design/Decision 本文に残存する旧行番号引用（REQ-002 系 23 行 ID、REQ-006 系 38 行 ID 中心、約 50 ファイル・現行根拠文脈 151 箇所）は、現行の REQ 行体系と REQ-029〜035 系への移管結果を正として、現行所有行への付け替えで解消する。履歴文脈（retired/廃止/旧/移管明示の 58 箇所）と IR-067 exemption 対象（v2: プレフィックス、code span、テンプレート領域、AUTOGEN ブロック、docs/reports/）は対象外とし、意図的な履歴参照を壊さない。付け替えは REQ-057 の mechanical-replacement-rules の3段階手順に従い、置換後語彙が検出パターンに再該当しないことを置換前に突合する。付け替え後、現行根拠文脈の旧行番号引用残存は 0 件である。
  - id: AG-002
    content: >-
      付け替え解消後、IR-067 の NG baseline（provenance issue-2383-ir067-initial-baseline、導入時点 318 件）は消化され、checker は docs/designs・docs/decisions を含む本文全走査で全件 strict 適用を継続する。検査そのものの所有は REQ-010-069（REQ 識別子実在性の機械検査）と REQ-010-068（回帰テスト義務）が保持し、本件は baseline 消化による履行完了と IR-067 Design 記述の現行化を担う。検査規則の意味変更（厳格化・緩和）は行わない。
  - id: AG-003
    content: >-
      前回診断（20260914T214425Z「dangling 0 件」）と本件の検出差異は、宣言中心走査と本文全走査の走査範囲差として IR-067 の baseline 運用記述に説明が保持される。差異説明には、baseline 消化の経過（導入時点 318 件の旧行番号引用が REQ-057 の現行化バッチにより解消されること）と、消化後の全件 strict 適用の継続が含まれる。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: 要件テーブル末尾（擬似 REQ-057-031、REQ-057-032 行として追記）
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-057-031 | IR-067 baseline（導入時点 318 件、provenance issue-2383-ir067-initial-baseline）由来の旧行番号引用残置は、Design/Decision 本文の現行根拠文脈（履歴文脈 58 箇所と IR-067 exemption 対象を除く）を対象に現行所有行への付け替えで解消され、付け替え後に現行根拠文脈の旧行番号引用残存が 0 件であること。付け替えは REQ-057-001 の履行であり、機械置換候補の列挙は診断走査結果（診断基線 commit 92c8d28b）で再現できること |
      | REQ-057-032 | 付け替え解消後は IR-067 の NG baseline が消化され、checker は本文全走査で全件 strict 適用を継続する。検査の所有は REQ-010-069 と REQ-010-068 が保持し、前回診断（20260914T214425Z dangling 0 件）との検出差異は走査範囲差（宣言中心走査と本文全走査の違い）として IR-067 Design の baseline 運用記述に説明が保持されること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md
    target_design:
      operation: update
      domain: integrity
      slug: rules/IR-067-referenced-req-row-existence
    target_area: baseline 運用（同節の記述更新と、ルール定義表 triage_action の現行化を含む）
    source_items: [AG-002, AG-003]
    content: |
      baseline 運用節の更新: 導入時点の既知違反 318 件（provenance issue-2383-ir067-initial-baseline）は、REQ-057 の docs corpus 現行化バッチによる旧行番号引用の付け替え解消と一体で消化する。消化後は baseline 登録を解除し、docs/designs・docs/decisions を含む本文全走査で全件 strict 適用を継続する。前回診断（20260914T214425Z dangling 0 件）との検出差異は、宣言中心走査と本文全走査の走査範囲差によるものである旨を明記する。

      ルール定義表 triage_action の現行化: 導入時点の既知違反の解消スコープ記述（RU-0002/RU-0001、OU-007/OU-010 スコープ）を、REQ-057 の現行化バッチ（本件の付け替え解消と baseline 消化）への接続に更新する。

conflict_resolutions:
  - id: CR-001
    conflict: 既定操作分類は REQ-086 CREATE（旧行番号引用の付け替えと検査適用拡大の実行契約を新規 REQ として所有）だったが、実ファイル照合で REQ-057-001 が「docs corpus の dangling 行参照・旧番号参照は現行所有行に整合」を既に所有し、IR-067 の triage_action も docs コーパス是正（RU-0002/RU-0001、OU-007/OU-010 スコープ）として REQ-057 バッチとの連携を記録済みである。
    resolution: REQ-086 CREATE は REQ-057-001 との重複定義となるため、REQ-057 への APPEND 2行（擬似 REQ-057-031/032）に操作分類を修正する。REQ-057 は要件テーブル 29 行であり、APPEND 後も 31 行で req-health-metrics の行数シグナル（0〜50 行は +0）に収まる。
  - id: CR-002
    conflict: 検査適用拡大（IR-067 の docs/designs・docs/decisions 本文への適用拡大）を新規 REQ 行として所有するかどうか。
    resolution: IR-067 の related_req と docs/designs/integrity/rule-ownership.md の照合で、検査の正規所有行は REQ-010-069（REQ 識別子実在性の機械検査）と REQ-010-068（回帰テスト義務）であることを確認したため、検査適用拡大の新規 REQ 行は作成しない。本件は REQ-010-069/068 の履行として baseline 消化と Design 記述の現行化で対応する。
  - id: CR-003
    conflict: RU-0033 は IR-067 の適用対象を「宣言・関連節中心から docs/designs・docs/decisions 本文へ拡大する」と記述するが、IR-067 の現行 detection_method は既に docs/designs・docs/decisions を含む本文全走査であり、旧行番号引用は導入時点の既知違反として NG baseline（318 件）で許容されている。
    resolution: 「適用拡大」の実態を「NG baseline の消化と消化後の全件 strict 適用の維持、Design 記述の現行化」として操作内容を修正する。検査規則の意味変更は行わない。
  - id: CR-004
    conflict: 共有擬似採番計画では REQ-086 が本 RU（RU-0033）に割当てられているが、APPEND 修正により CREATE 用番号が不要になる。REQ-057 の行番号は RU-0030 が擬似 REQ-057-030、RU-0029 が擬似 REQ-057-034 を使用済みである。
    resolution: REQ-086 予約は不使用とする（他バッチへの再割当は orchestrator の採番計画で扱う）。本 draft の追加行は擬似 REQ-057-031/032 を使用し、REQ-057-033 を後続バッチの予約枠として空ける。擬似採番であり、case-open が決定的採番（alloc-composite-id.ts）により最終的な行番号を確定する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0033
    target_req: REQ-057
    target_design: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      IR-067 checker（checkReferencedReqRowExistence）と同基準の本文走査を docs/designs・docs/decisions に対して実行し、現行根拠文脈の旧行番号引用を列挙する。履歴文脈（retired/廃止/旧/移管明示）と IR-067 exemption 対象（v2: プレフィックス、code span、テンプレート領域、AUTOGEN ブロック、docs/reports/）を除外した上で、付け替え後の残存を数える。
    pass_criteria: >-
      現行根拠文脈の旧行番号引用残存が 0 件である。履歴文脈 58 箇所は対象外として保持され、意図的な履歴参照が壊れていない。置換後の本文が IR-055 baseline と textlint の既存検査で新規違反を生んでいない。
    on_failure: >-
      fix-and-reverify を選択する。付け替え漏れは機械置換候補の追加適用で解消でき、残置は IR-067 の strict fail を継続させるため、記録では解消にならないため。
  - id: TS-002
    target_item: AG-002
    verification: >-
      baseline 消化後に check_integrity.test.ts の IR-067 describe（REQ-010-068 準拠の 5 種 fixture: 正常例・違反例・境界例・許容例・再現例）を実行し、docs-check full-audit で IR-067 が新規違反 0 件で合格することを確認する。
    pass_criteria: >-
      baseline 登録解除後もファントム引用が strict fail で検出され、実在行 ID の正当引用と exemption 対象が合格する。回帰テストの 5 種 fixture が全て合格する。
    on_failure: >-
      fix-and-reverify を選択する。checker の baseline 定義または fixture の修正後に再検証でき、検査の欠落は放置できないため。
  - id: TS-003
    target_item: AG-003
    verification: >-
      IR-067 Design の baseline 運用節とルール定義表 triage_action の更新後本文を読み、前回診断（20260914T214425Z dangling 0 件）との検出差異が走査範囲差（宣言中心走査と本文全走査の違い）として説明されていること、REQ-057 の現行化バッチとの接続が記述されていることを確認する。
    pass_criteria: >-
      差異の説明と消化経過の記述が存在し、本 draft ACT-REQ-001 の REQ-057 追加行および REQ-010-069 の所有関係と矛盾しない。
    on_failure: >-
      fix-and-reverify を選択する。記述の修正後に同様の読解確認を再実行できるため。

realization_actions:
  - id: RA-001
    concern: Design/Decision 本文の旧行番号引用の付け替え（約 50 ファイル・現行根拠文脈 151 箇所）
    responsibility: docs corpus の Design/Decision 本文の現行根拠文脈における行 ID 引用を、現行 REQ 行体系と REQ-029〜035 系への移管結果を正として現行所有行へ付け替える。REQ-057 の mechanical-replacement-rules の3段階手順に従い、禁止注記で旧表現の字面を引用しない。
    ownership_hints:
      - 対象集合: 診断走査（F-01）で列挙された約 50 ファイル（docs/designs・docs/decisions 中心。IR-067 affected_artifacts と同基準の走査で機械列挙可能）
      - 診断基線: RU-0033.md Sources（F-01 の引き継ぎ先。promoted 基線ファイルは backlog-review の RU 化成功後に削除済み）、基線 commit 92c8d28b
      - 運用制約: REQ-057-021（PowerShell 一括 I/O 禁止、edit ツール・node・[System.IO.File] 明示エンコーディングが標準）、REQ-057-024（配布物 Markdown 変更時の baseline 鮮度確認）、REQ-057-029（置換語彙の検出パターン事前突合の先例）
    intent: REQ-057-001 の履行として旧行番号引用残置を解消し、IR-067 baseline 消化の前置を成立させる。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: IR-067 checker の NG baseline 消化（導入時点 318 件）
    responsibility: 付け替え解消を確認した後、NG baseline additions（provenance issue-2383-ir067-initial-baseline）を消化し、checker が本文全走査で全件 strict 適用を継続することを回帰テストで維持する。検査規則の意味変更は行わない。
    ownership_hints:
      - checker 実装: check_integrity.ts の checkReferencedReqRowExistence（REQ-010 正規所有）
      - 回帰テスト: check_integrity.test.ts の IR-067 describe（REQ-010-068 準拠 5 種 fixture）
      - Design: docs/designs/integrity/rules/IR-067-referenced-req-row-existence.md（baseline 運用）、docs/designs/integrity/checker-execution-contracts.md（検出対象除外規定・階層 ID 検索の3点設計）
      - 所有 REQ 行: REQ-010-069、REQ-010-068、REQ-010-065
    intent: baseline 消化により再発（未コミット草案番号の引用残存等）を即時 strict fail として機械検出する状態を回復させる。
    verification_refs: [TS-002]
    source_items: [AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0033
    source_item: RU-0033-item-1
    disposition: covered
    reason_code: converted_to_existing_req_append
    reason: 付け替え一括是正の受け入れ条件（現行根拠文脈の残存 0 件）を REQ-057 への APPEND 行（擬似 REQ-057-031）と RA-001 に構造化した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0033.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0033
    source_item: RU-0033-item-2
    disposition: covered
    reason_code: covered_by_existing_ownership_and_design_update
    reason: 検査適用拡大（route 候補 #1）は REQ-010-069/068 の既存所有、IR-067 Design update（baseline 消化・記述現行化）、RA-002 で消化した。独立 route は作らない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0033.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints:
    - RU-0034 が docs/designs/integrity/integrity-rule-catalog.md・rule-ownership.md・check_integrity.ts 系を編集するため、付け替え対象（同ファイル群の dangling 引用を含む）との同一 Wave 並列配置を避けて直列化する。
    - RU-0022 と RU-0029 が docs/designs/responsibilities/artifact-responsibilities.md を編集するため、同ファイルの付け替えと同一 Wave 並列配置を避けて直列化する。
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-057-001/029/030 との系列連続性と、付け替え完了を前置とする baseline 消化の順序依存を確認済み）、client-server（IR-067 の検出規則と exemption は checker-execution-contracts.md と IR-067 Design が正規所有し、本件は検査規則の意味変更を行わないことを確認済み）、execution（機械置換 → 付け替え後全件走査 → baseline 消化 → 回帰テストの順序、REQ-057-021 の Windows I/O 制約と REQ-057-029 の置換語彙事前突合を確認済み）、build-runtime（check_integrity.test.ts の 5 種 fixture は baseline 登録に依存せず影響を受けないこと、integrity suite のコマンド数期待値に影響しないことを確認済み）、environment-propagation（docs 本文の付け替えが src/opencode・.opencode/commands 等の IR-067 走査対象へ引用残差を波及させないこと、履歴文脈と exemption の除外を維持することを確認済み）の5観点すべてを確認した。REQ-057 への APPEND 2行と IR-067 Design update 1件で構成し、独立した複数関心の混在はなく、SPLIT 要否: 不要。
