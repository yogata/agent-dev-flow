---
draft_type: req_draft
topic_slug: textlint-design-reinforcement
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0002]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — 2クラス意味論は「ユーザー承認済み方向」（RU 明記）の Design への規範明記のみ。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: Design 文書（textlint-quality-runtime.md）への規範明記のみ。実装変更なし
work_type: docs_chore

# scale: feature のみ判定対象。docs_chore のため未設定
scale: null

summary: textlint-quality-runtime.md への2系統の規範補強を確定した。① 対象解決の2クラス加算除外意味論（node_modules は機構固定除外、歴史記録サブツリーは明示的追加設定で再包含可能）の明記、② preset 採用時の corpus 実測・option 校正工程の既存節への補強。両者とも実装は既存（targets.ts 固定除外、option 校正）であり、Design と実装の解釈差を閉じる文書変更である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      textlint-quality-runtime.md の対象解決に関する記述を、2クラス加算除外意味論として明記する。
      ① node_modules は追加対象（加算設定）があっても再包含しない機構固定除外であり、
      ② 歴史記録サブツリー（docs/reports 等の過去記録ディレクトリ群）は明示的な追加設定により
      再包含可能な対象である。現行 Design（L24〜26）の「追加対象（加算設定）は既定除外に優先し」の
      一律記述は、この2クラスを区別しないため解釈余地がある（#7、TS-004/TS-005 突合、
      targets.ts の固定除外実装との突合で判明）。Design 記述を実装（node_modules 機構固定除外）と
      一致させる。node_modules が加算設定で再包含されないことを確認するテストは既存を維持し、
      既定除外対象そのものは変更しない。
  - id: AG-002
    content: |
      preset 採用時の corpus 実測・option 校正工程を textlint-quality-runtime.md の既存
      「規則校正と移行検証」節へ補強する。内容は、① 採用前の corpus 実測値（検出件数）の取得、
      ② max 値・disableXxx option 校正後の検出件数と残存指摘の確認、を標準工程として記述する。
      汎用 preset 既定値は専門用語・定義リスト・注意喚起太字を含む本リポジトリ corpus と衝突する実績
      （#10/#11、PR #2747 で 1,856件・1,825件の誤検出を option 校正で削減）に基づく。規則全体の無効化や
      大量の手動是正を先行させない方針、および拒否対象と助言対象の分類契約は変更しない。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_design:
      operation: update
      domain: quality
      slug: textlint-quality-runtime
    target_area: 対象解決（検査対象の決定と除外）を規定するセクション（L24〜26 付近の加算除外の優先関係記述）
    source_items: [AG-001]
    content: |
      対象解決の加算除外は2クラスの意味論を持つ。
      - 機構固定除外: node_modules は依存パッケージ実装物であり、加算設定（追加対象）があっても
        再包含しない。この挙動は src/opencode/plugins/agentdev-textlint-guard/lib/targets.ts の
        固定除外実装と一致する。機構固定除外の解除は本 Design の改定を要する
      - 再包含可能な既定除外: 歴史記録サブツリー（docs/reports 等）は過去記録の誤検出防止を目的とする
        既定除外であり、明示的な加算設定により再包含できる
      加算設定は「再包含可能な既定除外」に対して既定除外に優先する。
      機構固定除外には優先しない（再包含不可）。
      node_modules が加算設定で再包含されないことを確認するテストを維持する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_design:
      operation: update
      domain: quality
      slug: textlint-quality-runtime
    target_area: 規則校正と移行検証を規定するセクション
    source_items: [AG-002]
    content: |
      preset 採用時は次の校正工程を標準として実施する。
      - 採用前に適用対象 corpus の実測値（preset 既定値による検出件数）を取得する
      - max 値・disableXxx の option 校正を実施し、校正後の検出件数と残存指摘を確認する。
        汎用 preset 既定値は専門用語・定義リスト・注意喚起太字を含む corpus で大量の誤検出を
        生む実績（1,856件・1,825件規模）があるため、実測なしの採用を行わない
      - 規則全体の無効化や大量の手動是正を校正の代替としない
      - 拒否対象（error）と助言対象（warning）の分類契約は変更しない

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: null
    target_design: docs/designs/quality/textlint-quality-runtime.md
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
      Design 変更後、textlint-quality-runtime.md の対象解決節と
      src/opencode/plugins/agentdev-textlint-guard/lib/targets.ts の固定除外実装を読み比べ、
      2クラス意味論（node_modules 機構固定除外 / 歴史記録サブツリー再包含可能）の記述が
      実装挙動と一致していることを確認する。node_modules 再包含不可を確認する既存テストを
      実行し維持されていることを確認する。
    pass_criteria: |
      Design 記述が 2クラス意味論を明記し、targets.ts の実装挙動と矛盾しない。
      既存の node_modules 固定除外テストが pass する。既定除外対象の変更が発生していない。
    on_failure: |
      fix-and-reverify。Design 記述が実装と乖離する場合は記述を修正する。
      実装が Design 記述と乖離している場合（解釈差の逆転）は当該乖離を finding として報告し、
      実装側変更の要否を含めて case-run へ持ち帰る。
  - id: TS-002
    target_item: AG-002
    verification: |
      Design 変更後、「規則校正と移行検証」節に corpus 実測値取得と option 校正後の
      検出件数・残存指摘確認の工程が記載されていることを確認する。
      拒否対象と助言対象の分類契約の記述が変更されていないことを突合する。
    pass_criteria: |
      校正工程（実測取得 → option 校正 → 件数・残存指摘確認）が節内に明記されている。
      分類契約の変更が発生していない。規則無効化・大量手動是正の禁止が維持されている。
    on_failure: |
      fix-and-reverify。記載漏れまたは既存契約との矛盾を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0002（textlint Design の2点補強）を docs_chore として要件化した。対象解決の2クラス加算除外意味論の明記（node_modules は機構固定除外・再包含不可、歴史記録サブツリーは再包含可能）と、preset 採用時の corpus 実測・option 校正工程の補強を、textlint-quality-runtime.md への Design 更新として確定。実装は既存で、文書変更のみの case。
