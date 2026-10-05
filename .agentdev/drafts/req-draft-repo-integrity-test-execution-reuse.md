---
draft_type: req_draft
topic_slug: repo-integrity-test-execution-reuse
status: draft
created_at: 2026-10-05T18:55:00+09:00
source_rus:
  - RU-0160
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |-
  repo-agentdev-integrity の回帰試験（check_integrity.test.ts）について、検査ルール・検出能力・既存の確認内容・最終品質ゲートを維持したまま、同一テスト実行内で同一入力条件（対象ルート、実効引数、固定データ・定義・baseline 等の入力状態）の検査結果を共有して重複起動を削減し、指定コマンド（bun test ./.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts）の所要時間を短縮する。検査器本体（check_integrity.ts）の判定処理変更、IR-072 の Git 取得削減、非同期化・並列化は対象外。RU-0160 の generation_actor: supervisor と契約固定値 req-define-parent の差異は case-open 開始前に解決する（配置許可を契約改訂の承認として扱わない、正規契約は変更しない）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      同一テスト実行内で、対象のルート、実効引数、固定データ・定義・baseline 等の入力状態が同じテスト群だけ、1回の検査結果を共有する。既存の準備処理（beforeAll 等）と明示的な結果変数を利用し、汎用キャッシュは作らない。検査器本体の判定処理、検出能力、最終品質ゲートは変更しない。
  - id: AG-002
    content: |-
      実リポジトリ回帰の4確認は1回の検査結果を共有し、個々のテスト名と確認内容を維持して失敗箇所を識別できる。共有結果を各テストが変更して他の確認を汚染しない。
  - id: AG-003
    content: |-
      不変の固定データ（通常JSON、分類付きJSON、不正データ、IR-044、IR-072 等）は同一ルート・同一実効引数・同一入力状態の組合せごとに1回だけ検査し、対象群と起動回数を記録する。引数や入力が異なる結果を混用しない。
  - id: AG-004
    content: |-
      baseline 更新、入力編集、引数差、出力形式差、レポート保存等の操作自体を検証する試験を不変結果の共有へ混ぜない。状態変更前後は順序を維持し、変更後に新しく検査する。独立起動そのものを確認する試験の呼出しも残す。
  - id: AG-005
    content: |-
      共有対象群の各テストを選択実行しても必要な初期化が行われ、他テストの先行実行に依存せず成立する。指定ファイル単体の実行契約を維持する。
  - id: AG-006
    content: |-
      初期化失敗、子プロセス起動失敗、異常終了、JSON 解釈失敗、不完全な必須結果は明確な試験失敗とする。空の結果や既定値を作って成功にしない。確認には既存の検証手段を優先する。
  - id: AG-007
    content: |-
      実行後に元の固定データ・baseline・作業リポジトリへ意図しない変更や不要なレポートを残さない。自分の生成物だけを後片付けし、既存の未追跡ファイルを削除しない。
  - id: AG-008
    content: |-
      同一のマシン、Bun 版、検査入力、配置条件、コマンドで変更前後を複数回計測し、各実行の成功結果、所要時間、中央値・最大値、検査起動回数を記録する。中央値の短縮と重複起動の削減を確認し、最大値の変動も隠さず報告する。一時コピーでの観測値（26.0 秒等）を正式版の保証値や固定秒数の合否閾値にしない。調査時点の182テスト・450確認は照合基準とし、最新基準との差がある場合は理由と対応を記録する。件数一致だけで検出能力の同等性を証明したことにしない。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: "### check_integrity テストスイート内の結果共有契約"
    anchor: "## bun test 実行形態契約（単独実行・ファイル単体指定を含む）"
    placement: tail
    canonical_owner: "checker 実行契約と検出基盤規則（docs/designs/integrity/checker-execution-contracts.md）"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      ### check_integrity テストスイート内の結果共有契約

      check_integrity.test.ts の回帰試験群は、同一テスト実行内で対象ルート・実効引数・入力状態（固定データ、宣言的定義、baseline 等）が同じ検査について検査器起動を1回に集約し、その結果を複数の確認で共有できる。本契約はテストスイートの実行形態に関する内部契約であり、検査ルール、検出能力、既存の確認内容、最終品質ゲートを変更しない。

      - 結果共有は既存の準備処理（beforeAll 等）と明示的な結果変数で構成し、実行をまたぐ永続キャッシュや汎用キャッシュ基盤を作らない
      - 実リポジトリ回帰の4確認は1回の検査結果を共有する。個々のテスト名と確認内容を維持して失敗箇所を識別でき、共有結果を各テストが変更して他の確認を汚染しない
      - 不変の固定データは同一ルート・同一実効引数・同一入力状態の組合せごとに1回だけ検査する。引数や入力が異なる結果を混用しない
      - baseline 更新、入力編集、引数差、出力形式差、レポート保存等の状態変更操作を検証する試験は不変結果の共有へ混ぜない。状態変更前後は順序を維持し、変更後に新しく検査する。独立起動そのものを確認する試験の呼出しも維持する
      - 共有対象群の各テストは選択実行時に必要な初期化を自身で行い、他テストの先行実行に依存して成立しない（ファイル単体指定の実行契約維持）
      - 初期化失敗、子プロセス起動失敗、異常終了、JSON 解釈失敗、不完全な必須結果は明確な試験失敗とし、空の結果や既定値で成功扱いにしない
      - 実行後に元の固定データ・baseline・作業リポジトリへ意図しない変更や不要なレポートを残さない。自分の生成物だけを後片付けし、既存の未追跡ファイルを削除しない
      - 効果測定は同一条件（マシン、Bun 版、検査入力、配置、コマンド）で変更前後を複数回計測し、成功結果、所要時間、中央値・最大値、検査起動回数を記録する。件数一致だけで検出能力の同等性を証明したことにしない

conflict_resolutions:
  - id: CR-001
    conflict: |-
      既存REQ照合の Jev 先行評価は CREATE（0.79）を示したが、REQ-010-009 が checker 詳細の Design/skill/script/tests への委譲を定め、REQ-010 の適用範囲が checker 個別ルール・スクリプト内部実装を対象外としている。テストスイート内部の実行形態は REQ-004-031 の外部契約基準（外部から見える責務・公開入口・安全境界）に該当しない。
    resolution: |-
      REQ操作なし（Design append のみ）として確定した。差異理由 semantic_disagreement として Jev 観測（20261005T100150Z-4be2）へ記録済み。RU の暫定分類（挙動Design）とも一致する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0160
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      変更後に bun test ./.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts を実行し、全テストの成功、テスト数・確認内容の維持、およびテストコード上の共有構造（同一入力条件の検査起動回数の記録）を確認する。
    pass_criteria: |-
      全テストが成功する。テスト数・確認内容が照合基準（調査時点182テスト・450確認。最新基準との差がある場合は理由と対応の記録がある）から削除・弱化されていない。実リポジトリ回帰の4確認で同一条件の検査起動が1回に集約されている。
    on_failure: |-
      fix-and-reverify: 実装不良に起因するため、共有構造を修正して再検証する。
  - id: TS-002
    target_item: AG-004
    verification: |-
      baseline 更新・入力編集を伴う試験の挙動（変更後に検査が再起動され、更新後の検出結果を確認する）と、共有対象テストの単独選択実行（ファイル単体・テスト名指定）を確認する。
    pass_criteria: |-
      状態変更後の試験が更新前の共有結果で成功していない。選択実行が他テストの先行実行なしで成立し、指定ファイル単体の実行契約を維持している。
    on_failure: |-
      fix-and-reverify: 初期化・再取得の実装不良に起因するため修正して再検証する。
  - id: TS-003
    target_item: AG-006
    verification: |-
      初期化失敗、子プロセス起動失敗、JSON 解釈失敗等の異常系試験の挙動と、新規の共有経路での失敗伝播を確認する。
    pass_criteria: |-
      空の結果や既定値で成功扱いになる経路が存在しない。不完全な必須結果は明確な試験失敗となる。
    on_failure: |-
      fix-and-reverify: 失敗伝播の実装不良に起因するため修正して再検証する。
  - id: TS-004
    target_item: AG-007
    verification: |-
      テスト実行前後で固定データ・baseline・作業リポジトリの差分を確認する（git status と対象ディレクトリの比較）。
    pass_criteria: |-
      自分の生成物以外に意図しない変更や不要なレポートが残っていない。既存の未追跡ファイルを削除していない。
    on_failure: |-
      fix-and-reverify: 後片付けの実装不良に起因するため修正して再検証する。
  - id: TS-005
    target_item: AG-008
    verification: |-
      同一条件（マシン、Bun 版、検査入力、配置、コマンド）で変更前後を複数回（3回以上）計測し、各実行の成功結果、所要時間、中央値・最大値、検査起動回数を記録・報告する。入力や環境が途中で変わった比較を効果証明に使わない。
    pass_criteria: |-
      中央値の短縮と重複起動の削減が確認できる。最大値の変動も隠さず報告されている。
    on_failure: |-
      record-in-findings: 効果不足を理由に対象外の変更へ自動拡大せず、追加高速化候補を残課題として Findings に記録するため。実装不良は TS-001〜TS-004 で検出・修正する。

realization_actions:
  - id: RA-001
    concern: check_integrity.test.ts の結果共有構造の実装
    responsibility: |-
      .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts において、同一入力条件の検査結果共有（beforeAll・結果変数による共有、実リポジトリ回帰4確認の集約、不変固定データの条件別集約、状態変更試験の分離、異常時の明確な失敗、後片付け）を実装する。検査器本体（check_integrity.ts 等）の判定処理は変更しない。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts"
      - ".opencode/skills/repo-agentdev-integrity/SKILL.md（責務範囲の維持確認）"
      - "docs/designs/integrity/integrity-rule-catalog.md（check_integrity test suite 責務分担との混同防止確認）"
    intent: |-
      テスト側の重複起動のみを削減し、検査能力と確認内容を維持したまま指定コマンドの所要時間を短縮する。
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005]
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]

case_open_hints:
  epic_needed: false
  decomposition: "単一 Issue で完結（テストファイル1件と Design 1セクションの追加）。RU-0160 の generation_actor: supervisor と session由来RU 契約固定値 req-define-parent の差異は case-open 開始前に解決する。"
  wave_hints: []
```

# summary

RU-0160（収束済み検討由来）を要件化した。REQ 操作なし・Design 追記のみの構成で、checker-execution-contracts.md の bun test 実行形態契約セクション配下に「check_integrity テストスイート内の結果共有契約」を追加する。実装面（RA-001）は check_integrity.test.ts の結果共有構造のみ。維持すべき外部契約（検査ルール・検出能力・最終品質ゲート・ファイル単体実行契約）は既存 REQ-010 系行と checker 実行契約 Design が所有する。追加高速化候補（実リポジトリ依存試験の固定データ化、直接呼出し移行、Git 取得削減・並列化、共通 QG の専用手順整理）は対象外とし残課題として扱う。
