---
draft_type: req_draft
topic_slug: bundle-baked-path-selfcheck
status: saved
created_at: 2026-09-11
design_actions_consumed: true
source_rus: [RU-0007]
---

# draft-data

```yaml
# work_type: vendored bundle 再生成 build スクリプトへの自己検査追加（実装変更を伴う）
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

summary: vendored engine bundle 再生成時に kuromojin 既定 dicPath 用 require.resolve 由来の絶対パスが焼き付く既知現象（実害なし・検出手段なし）に対し、build スクリプトへ焼き付き絶対パスの検出・無害化自己検査を追加することを採用した。現行受け入れではなく検査追加を採用した根拠は、実害なしからでは無く検出手段の欠如が再現時の調査コスト（環境依存 fail の原因特定）を継続発生させるため。docs/knowledge の offline bundle 知識と相互参照する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      vendored engine bundle
      （src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json）
      再生成の build スクリプトへ、bundle 内焼き付き絶対パスの検出・無害化自己検査を追加する。
      対象は kuromojin 既定 dicPath 用 require.resolve 由来の絶対パス（ビルド時 worktree パス等）。
      検出時の挙動は、機械的に無害化可能な場合は無害化してから出力し、無害化できない場合は
      build を fail させる（焼き付きパスの混入を検知できることが目的）。
      runtime は KUROMOJIN_DIC_PATH 固定経路で使用されるため実害はないが、
      ビルド時 worktree 削除後の bun test が環境依存 fail し得る現状の調査コストを低減する。
  - id: AG-002
    content: |
      bundle 再生成手順と焼き付きパス問題の運用知識を docs/knowledge/ の offline bundle 知識と
      相互参照する（runtime-package-boundary.md の本体リポジトリ sync 節と knowledge 文書の
      参照を結線する）。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: vendored bundle 再生成手順を扱うセクション（本体リポジトリ sync 節および bundle 再生成に関する記述）
    source_items: [AG-001, AG-002]
    content: |
      vendored engine bundle 再生成時は、build スクリプトに含まれる焼き付き絶対パスの
      検出・無害化自己検査を実行する。
      - 検出対象: kuromojin 既定 dicPath 用 require.resolve 由来の絶対パス等、
        ビルド環境由来の絶対パス（worktree パスを含む）
      - 挙動: 無害化可能な場合は無害化して出力、不可能な場合は build fail
        （焼き付きパス混入の検知を目的とする。runtime は KUROMOJIN_DIC_PATH 固定経路で
        使用されるため実害はないが、検出手段がないとビルド時 worktree 削除後の
        環境依存 fail の原因特定コストが残る）
      - 自己検査は docs/knowledge/ の offline bundle 運用知識と相互参照する

conflict_resolutions:
  - id: CR-001
    conflict: 自己検査追加と現行受け入れ（実害なし）の選択
    resolution: |
      自己検査追加を採用する。根拠: 実害なしとはいえ検出手段の欠如により、bundle 再生成後環境で
      bun test が fail した場合の原因特定（焼き付きパス仮説の検証）に毎回調査コストが発生する
      （PR 2730 / Issue 2725 由来の実績）。build スクリプトへの検査追加は軽微な投資で
      再現時調査を恒久低減する。現行受け入れはこのコストを残すため不採用。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0007
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
      自己検査追加後、bundle 再生成を実行し、(1) 自己検査が焼き付き絶対パスを検出・無害化する
      こと（または無害化不能時に fail すること）、(2) 再生成後の bundle に環境依存絶対パスが
      残存しないこと、を確認する。検証環境として worktree 削除後を模した環境で bun test を
      実行し環境依存 fail が発生しないことを確認する。
      模擬環境の具体手順: 一時ディレクトリで bundle 再生成 → 当該一時ディレクトリを削除 →
      bun test を実行（焼き付きパスが解決不能になる状況を再現する）。
    pass_criteria: |
      再生成後 bundle にビルド環境由来の絶対パスが焼き付いていない。
      自己検査が検出対象パターンを実際に検出する（ネガティブテスト含む）。
      bun test が環境依存 fail しない。
    on_failure: |
      fix-and-reverify。検出パターンの不足または無害化漏れを修正して再検証する。
      検出されない（サイレント pass する）自己検査は合格としない。
  - id: TS-002
    target_item: AG-002
    verification: |
      runtime-package-boundary.md の記述と docs/knowledge/ の offline bundle 知識文書が
      相互参照として結線されていることを確認する。参照先ファイルの実在と表記
      （配布物内部パス参照違反にならない docs 側正文書間参照であること）を突合する。
    pass_criteria: |
      相互参照が存在し、参照先が実在する。IR-055 等の配布依存境界検査で新規違反が 0 件。
    on_failure: |
      fix-and-reverify。参照の欠落または誤参照を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: bundle 再生成 build スクリプトへの焼き付きパス検出・無害化自己検査の実装
    responsibility: |
      vendored bundle（agentdev-textlint-guard Plugin）の再生成手順は
      docs/designs/local/runtime-package-boundary.md（実行時パッケージ境界）が正規所有する。
      build スクリプトの実装は agentdev-textlint-guard Plugin の配布ソース
      （src/opencode/plugins/agentdev-textlint-guard/ 配下の build 関連スクリプト）が担う。
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json
      - src/opencode/plugins/agentdev-textlint-guard/ 配下の bundle 再生成 build スクリプト
      - docs/knowledge/ 配下の offline bundle 運用知識文書
      - docs/designs/local/runtime-package-boundary.md
    intent: |
      焼き付きパスの検出手段がない根因を build 工程で閉じ、bundle 再生成後環境の
      bun test 環境依存 fail の調査コストを恒久低減する。
    verification_refs: [TS-001]
    source_items: [AG-001]

review_dispositions:
  - id: RD-001
    source_ru: RU-0007
    source_item: requirements-direction-2
    disposition: rejected
    reason_code: investigation_cost_persists
    reason: |
      現行受け入れ（要件化の方向 2 の選択肢）は不採用（CR-001）。
      自己検査追加を採用した根拠は CR-001 の resolution に記録済み。
    evidence:
      path: src/opencode/plugins/agentdev-textlint-guard/vendor/textlint-engine.bundle.json
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0007（vendored bundle 再生成時の焼き付きパス無害化自己検査）を maintenance として要件化した。現行受け入れではなく自己検査追加を採用（検出手段欠如が調査コストを継続発生させるため）と判断し、bundle 再生成 build スクリプトへの検出・無害化検査追加と docs/knowledge 相互参照を確定した。
