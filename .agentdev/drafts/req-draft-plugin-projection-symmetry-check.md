---
draft_type: req_draft
topic_slug: plugin-projection-symmetry-check
status: saved
created_at: 2026-09-11
design_actions_consumed: true
source_rus: [RU-0013]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — (b) 不採用は RU が既に要件化の方向 3 で確定済み方向の継承であり、req-define が新たに導入した決定ではない。検査追加は RU 承認済み方向 1 の契約化。Decision 判断対象なし
# work_type: docs-check 系機械検査への投影対称性検査追加（検査実装追加を伴う）
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

summary: repo-local Plugin（agentdev-textlint-guard）の自己ホスト投影（.opencode/plugins/ 配下 shim とディレクトリ）の不在が契約 3 点（runtime-package-boundary.md 投影契約、plugin README 配布宣言、self-sync.ps1 動的列挙）と矛盾する inspect finding（F-01）に対し、① 投影対称性検査（正本と自己ホスト投影の対称性）を docs-check 系機械検査へ追加する要件を確定し、② 投影再同期（self-sync.ps1 再実行）は環境操作として要件範囲外とし完了報告に実行指示を含める運用後追とする、③ 意図的除外（Design 正当化記録）は事実前提が無いため不採用とした。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
  # 運用後追の実施記録（2026-09-12、Hermes Supervisor がユーザー指示で実行）:
  # `pwsh -NoProfile -File scripts/self-sync.ps1 -Mode check` で 3 divergence を検出
  # （Missing plugin loader shim: agentdev-textlint-guard.ts、stale junction: agentdev-doc-writing、
  #  投影ディレクトリ欠落）。`-Mode apply` で再同期を実施し、再検証 (`-Mode check`) で
  # 「No divergence detected」を確認。agentdev-textlint-guard の自己ホスト投影
  # （.opencode/plugins/agentdev-textlint-guard/ + loader shim .ts）は復元済み。

agreed_items:
  - id: AG-001
    content: |
      投影対称性検査（repo-local Plugin の正本と自己ホスト投影の対称性）を docs-check 系
      機械検査へ追加する。検出は [DIVERGENCE] 相当とする。検査内容: 正本
      （src/opencode/plugins/agentdev-textlint-guard/ 配下）の投影対象構造（shim、ディレクトリ）と
      自己ホスト投影（.opencode/plugins/ 配下）の構造が対称であることを検査する。
      対称性の契約は runtime-package-boundary.md の投影契約（投影対象の正本構造定義）、
      plugin README の配布宣言、self-sync.ps1 の動的列挙の 3 点で構成される。
      投影欠落・余剰（正本にない投影）・shim 内容不一致を検出対象とする。
      runtime-package-boundary.md L273 の repo-local モデル方針に従う。
  - id: AG-002
    content: |
      自己ホスト投影の再同期（self-sync.ps1 再実行）は本 RU の要件範囲外とする。
      .opencode/plugins/ は git 管理外のローカル生成物であるため、再同期は環境操作であり
      case 実行対象でない。完了報告に実行指示（self-sync.ps1 再実行）を含め、
      ユーザー環境での運用後追とする。
  - id: AG-003
    content: |
      意図的除外（投影なしを Design 側へ正当化記録する対処 (b)）は採用しない。
      投影不在が意図的な設計判断である事実前提が存在しない（inspect finding F-01 は
      契約 3 点との矛盾として検出されており、正当化記録は存在しない）。契約整合解は
      検査追加（本 AG）と再同期（AG-002 の運用後追）の組み合わせである。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: repo-local Plugin の投影契約（投影対象構造・自己ホスト投影の定義）を規定するセクション
    source_items: [AG-001, AG-003]
    content: |
      repo-local Plugin の自己ホスト投影対称性検査を機械検査契約として追加する。
      - 検査対象: 正本（src/opencode/plugins/agentdev-textlint-guard/ 配下の投影対象構造）と
        自己ホスト投影（.opencode/plugins/ 配下）の対称性（投影欠落・余剰・shim 内容不一致）
      - 検出扱い: 対称性破れは [DIVERGENCE] 相当の検出として docs-check 系検査結果に報告する
      - 対称性の契約参照: 本 Design の投影契約、plugin README の配布宣言、
        self-sync.ps1 の動的列挙の 3 点
      - 投影の再同期（self-sync.ps1 再実行）は環境操作であり、検出時の対応は環境操作として
        完了報告等に実行指示を含める運用とする（検査自体は repo 内で完結する）

conflict_resolutions:
  - id: CR-001
    conflict: 投影不在への対処として再同期（(a)）と Design 正当化記録（(b)）の選択
    resolution: |
      (a) 再同期を契約整合解とし、(b) は不採用とする。根拠: 投影不在が意図的な設計判断
      である事実前提が存在しない。契約 3 点（投影契約、配布宣言、動的列挙）が
      投影の存在を要求しており、(b) は契約を下げる変更を伴うため事実前提なしで採用できない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0013
    target_req: null
    target_design: docs/designs/local/runtime-package-boundary.md
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
      検査追加後、現行状態（投影欠落あり）で当該検査を実行し、投影対称性破れ
      （agentdev-textlint-guard Plugin の投影欠落）が [DIVERGENCE] 相当として検出されることを
      確認する。次に、self-sync.ps1 再実行（環境操作）後に再実行し、検出が解消されることを
      確認する（検出→解消の往復で検査の有効性を確認）。
    pass_criteria: |
      投影欠落状態で [DIVERGENCE] 相当の検出が発生する。
      再同期後の検査で検出が 0 件（対称）となる。
      正本にない余剰投影・shim 内容不一致も検出する（ネガティブテスト）。
    on_failure: |
      fix-and-reverify。検出パターンの不足（欠落・余剰・不一致のいずれかが検出されない）を
      修正して再検証する。検出されない（サイレント pass する）検査は合格としない。
  - id: TS-002
    target_item: AG-002
    verification: |
      case 完了報告に自己ホスト投影の再同期実行指示（self-sync.ps1 再実行）が含まれていること、
      本 case の実装スコープに .opencode/plugins/ への直接操作が含まれていないことを確認する。
    pass_criteria: |
      完了報告に実行指示が含まれる。case 実装が .opencode/plugins/ を直接変更していない
      （git 管理外のローカル生成物への変更は環境操作として分離されている）。
    on_failure: |
      fix-and-reverify。完了報告への指示追記または範囲外操作の分離を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: docs-check 系機械検査への repo-local Plugin 投影対称性検査の追加
    responsibility: |
      docs-check 系検査スクリプト群の実行契約は REQ-010（自己監査コマンド）と
      checker-execution-contracts Design が正規所有する。検査スクリプト実体は
      repo-agentdev-integrity skill 配下（.opencode/skills/repo-agentdev-integrity/scripts/
      の check_integrity.ts 等への追加）とその配布ソースが担う。
      投影契約の正は docs/designs/local/runtime-package-boundary.md
      （投影契約定義）と self-sync.ps1（動的列挙実装）。DEC-028 / REQ-052-006 / REQ-009 が
      関連契約群である。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（検査追加先）
      - docs/designs/local/runtime-package-boundary.md（投影契約、L238/L270）
      - scripts/self-sync.ps1（動的列挙、再同期手順）
      - src/opencode/plugins/agentdev-textlint-guard/（投影正本）
      - .opencode/plugins/（自己ホスト投影、git 管理外ローカル生成物）
    intent: |
      自己ホスト投影欠落のような投影構造の乖離を機械検出可能にし、同種投影欠落の
      再発を次回から検出で捕捉する（今回の finding は inspect-docs の意味診断で検出されたが、
      機械検査では未検出）。
    verification_refs: [TS-001]
    source_items: [AG-001]

review_dispositions:
  - id: RD-001
    source_ru: RU-0013
    source_item: requirements-direction-2
    disposition: covered
    reason_code: out_of_case_scope
    reason: |
      投影再同期（要件化の方向 2）は環境操作として case 範囲外に確定し、
      完了報告への実行指示運用（AG-002）として消化。auto_gate.stop_reasons に運用後追を記録済み。
    evidence:
      path: scripts/self-sync.ps1
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0013
    source_item: requirements-direction-3
    disposition: rejected
    reason_code: no_factual_basis
    reason: |
      対処 (b)（Design 正当化記録）は不採用（CR-001）。投影不在が意図的な設計判断である
      事実前提が存在しないため。
    evidence:
      path: docs/designs/local/runtime-package-boundary.md
      section: 投影契約（L238/L270）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0013（repo-local Plugin 自己ホスト投影の対称性検査追加）を maintenance として要件化した。投影対称性検査の docs-check 系機械検査への追加（[DIVERGENCE] 相当検出）と、再同期（self-sync.ps1 再実行）の環境操作としての範囲外運用（完了報告に実行指示）、対処 (b) の不採用を確定した。検出→解消の往復検証（TS-001）を検査有効性の条件とする。
