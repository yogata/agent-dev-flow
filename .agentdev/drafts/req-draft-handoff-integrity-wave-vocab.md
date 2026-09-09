---
draft_type: req_draft
topic_slug: handoff-integrity-wave-vocab
status: saved
created_at: 2026-09-09T00:00:00+09:00
source_rus:
  - RU-20260908-12
  - RU-20260908-13
  - RU-20260908-14
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  移管元リポジトリ（fujoho_schedule）から移管した handoff RU 3件を agent-dev-flow
  リポジトリの通常要件として確定した。（T1）worktree 上の docs 整合性検査は host 側配置の
  検査 skill を起点とし検査対象 worktree の絶対パスを明示指定して起動する契約、
  --base-ref による変更ファイル検出のコミット後・push 前限定、files_checked 空の
  検査見逃し扱いを REQ/Design/配布 skill 手順へ反映する。（T2）Epic Wave 構成時（case-open）
  と fan-out 前（case-run）に変更対象ファイル集合の重複をファイル単位で前置検出し、
  Wave 分離・変更対象分割・重複許容（衝突解消の担当とマージ順序の事前記録）を判断する
  契約を追加する（Level 1〜3 回復契約と execution_unit 間並列判定軸は維持）。
  （T3）廃止語彙検出（IR-065/066 系）に半角・全角スペース挿入に依存しない照合を導入し、
  誤検知の除外は語彙引用・記録領域の構造的除外として宣言管理する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      worktree に対して docs 整合性検査（targeted docs guard 等）を実行する場合、検査 skill は
      host 側配置を起点として起動し、検査対象 worktree の絶対パスを明示指定（--root 相当）して
      検査対象リポジトリを解決する。検査結果は files_checked が検査対象 worktree の変更ファイルと
      一致することを確認してから採用する。検査対象 root の誤解決（配置先起点の誤リポジトリ検査）は
      検査見逃しとして扱う。
  - id: AG-002
    content: |
      --base-ref による変更ファイル検出（コミット済み差分ベース）はコミット後・push 前の実行に
      限定する。コミット前の worktree 上での変更ファイル検出は --files 等の明示ファイル指定で行い、
      列挙には untracked ファイルを含める（--base-ref のセマンティクスと混在させない）。
      モード標準の記述は targeted docs guard を利用する全 workflow（case-run、case-close、req-save、
      design-save）と guard Design で一致させる。
  - id: AG-003
    content: |
      変更ファイル限定検査で files_checked が空の場合は検査見逃しとして扱い、確認なく合格扱いに
      しない（検証モード問わず）。
  - id: AG-004
    content: |
      case-open は Wave 構成時に同一 Wave 候補の子 Issue（execution_unit）間で変更対象ファイル集合
      （realization_actions・artifact_actions の対象）の重複をファイル単位で前置検出する。
      execution_unit 間の並列可否判定軸（必須依存の連結成分のみ、REQ-034-011）は変更しない。
  - id: AG-005
    content: |
      case-run は Epic Wave の fan-out 前に現在 Wave の実行可能子 Issue の変更対象ファイル集合の
      重複をファイル単位で検出し、重複なしの場合は既存 fan-out へ進む。
  - id: AG-006
    content: |
      重複検出時は Wave 分離・変更対象分割・重複許容のいずれかを決定し、重複許容時は衝突解消の
      担当とマージ順序を事前記録する。前置検出の追加により既存の Level 1〜3 コンフリクト解消
      （回復）契約を弱めない。mergeable 作成時状態のみで Wave 安全性を判断しない。
  - id: AG-007
    content: |
      廃止語彙検出（IR-065/IR-066 系語彙パターン検査）は、語彙内への半角・全角スペース挿入の
      有無に依存しない照合を行う（例: 「本 ADR」「本　ADR」の両バリアントを検出）。
      正規化対象語彙を確定し、必要に応じて新規語彙を追加する（checker パターンと
      obsolete-vocabulary-map.yaml の同一 PR 同期を含む）。
  - id: AG-008
    content: |
      スペース正規化に伴う誤検知の除外は、語彙を引用・記録する領域を経路・領域ベースで構造的に
      除外する方式とし、個別出現箇所の allow 条件列挙で代替しない。除外対象と理由は既存の宣言構造
      （obsolete-vocabulary-map.yaml）に理由付きで記録する。
  - id: AG-009
    content: |
      Wave 構成時・fan-out 前の重複前置検出において、比較対象の子 Issue の変更対象集合が取得不能
      またはファイル粒度に展開不能な場合は、比較を省略せず検出不能として報告し判断を求める。
      case-auto 配下では decision_context として親判断解決へ委譲する（DEC-008）。

artifact_actions:
  - id: ACT-REQ-031-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-031.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-031-025 | case-run は worktree に対して docs 整合性検査を実行する場合、host 側に配置された検査 skill を起点として起動し、検査対象 worktree の絶対パスを明示指定すること。検査結果は files_checked が検査対象 worktree の変更ファイルと一致することを確認してから採用すること。検査対象 root の誤解決（配置先起点の誤リポジトリ検査）を検査見逃しとして扱うこと |
      | REQ-031-026 | case-run は docs 整合性検査の変更ファイル検出において、コミット済み差分に基づく検出（--base-ref 相当）をコミット後・push 前の実行に限定し、コミット前の検証は untracked ファイルを含む明示的なファイル列挙（--files 相当）で行うこと |
  - id: ACT-REQ-031-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-031.md
    source_items: [AG-005, AG-009]
    content: |
      | REQ-031-027 | case-run は Epic Wave の fan-out 前に現在 Wave の子 Issue 間で変更対象ファイル集合の重複をファイル単位で検出し、重複なしの場合は既存 fan-out へ進めること。重複検出時は事前記録された解消方針を参照し、方針がない場合は fan-out を停止して判断を求めること（case-auto 配下では decision_context として親判断解決へ委譲する）。変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告すること |
  - id: ACT-REQ-032-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-001, AG-003]
    content: |
      | REQ-032-023 | case-close は検査実行結果の files_checked が空の場合（REQ-010-076）または検査対象の変更ファイルと files_checked の内容が一致しない場合を検査見逃しとして扱い、確認なく合格扱いとしないこと |
  - id: ACT-REQ-010-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-010.md
    source_items: [AG-003]
    content: |
      | REQ-010-076 | 変更ファイル限定検査は files_checked が空の場合を検査見逃しとして扱い、確認なく合格扱いとしないこと（検証モード問わず） |

      適用範囲（対象）へ「変更ファイル限定検査の files_checked 空時の検査見逃し扱い」を追記する。
  - id: ACT-REQ-010-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    target_area: REQ-010-066 行
    source_items: [AG-007, AG-008]
    content: |
      REQ-010-066 を次の文言へ更新する:
      | REQ-010-066 | docs-check は現行概念として使用される廃止語彙（旧 ADR 表記等）を、語彙内への半角・全角スペース挿入の有無に依存しない照合で検出すること。ただし許容された歴史的識別子（v2:ADR-0123 等）は誤検出しないこと。検出語彙の引用・記録領域は領域ベースの構造的除外として宣言・管理することとし、個別出現箇所の許容条件列挙で代替しないこと |
  - id: ACT-REQ-030-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-030.md
    source_items: [AG-004, AG-009]
    content: |
      | REQ-030-022 | case-open は Wave 構成時に同一 Wave 候補の子 Issue 間で変更対象ファイル集合（realization_actions・artifact_actions の対象）の重複をファイル単位で前置検出し、重複時の処置（Wave 分離・変更対象分割・重複許容）を Wave 構成の判断として確定すること。比較対象の変更対象集合が取得不能またはファイル粒度に展開不能な子 Issue がある場合は比較を省略せず検出不能として報告すること |
  - id: ACT-REQ-035-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-035.md
    source_items: [AG-006]
    content: |
      | REQ-035-012 | Epic Wave モデルは同一 Wave 内の子 Issue 間の変更対象ファイル重複の前置検出とその判断記録（Wave 分離・変更対象分割・重複許容）を Wave 構成の必須判断とすること。重複許容時は衝突解消の担当とマージ順序を事前記録すること。コンフリクト解消モデル（Level 1〜3）と execution_unit 間並列可否の判定軸（必須依存の連結成分のみ）を維持すること。mergeable 作成時状態のみで Wave の安全性を判断しないこと |

      適用範囲（対象）へ「Wave 構成時の変更対象ファイル重複の前置検出モデル」を追記する
      （主語をモデル契約とし、Wave 構成の生成手順は REQ-030（case-open 実行契約）が所有する
      既存の責務分担を維持する）。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/targeted-docs-guard-implementation.md
    target_area: CLI 引数表・モード使い分け標準・files_checked 空扱い（false-clean 予防）
    source_items: [AG-001, AG-002, AG-003]
    content: |
      モード使い分け標準を更新する: コミット済み差分に基づく変更ファイル検出（--base-ref）は
      コミット後・push 前の実行に限定し、コミット前の worktree 上での検証は --files による明示
      指定（untracked ファイル含入）を標準とする。CLI 引数表へ --root 行（worktree/CI 対応の
      検査対象リポジトリルート明示指定）を追加するとともに、--files/--base-ref 行の説明列を
      新モード標準に合わせて更新する。files_checked 空の扱いを検査見逃し（成功扱い禁止）へ
      集約し、severity 統一（FAILURE 化）の可否を本 Design で判断して明記する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/integrity/checker-execution-contracts.md
    target_area: link profile 実効実行要件（worktree 実行契約）
    source_items: [AG-001, AG-003]
    content: |
      worktree を検査対象とする checker の起動契約を拡張する: 検査 skill は host 側配置を起点とし、
      検査対象 worktree の絶対パスを --root（相当の repoRoot 明示）で指定して起動する。
      検査対象 root の誤解決（配置先起点の誤リポジトリ検査）と files_checked 空を検査見逃しとして
      扱い、files_checked の内容と検査対象 worktree の変更ファイルの一致確認を結果採用前の手順と
      する。読み取り専用検査である旨の worktree 分離原則（POL-worktree-isolation）との関係も明記する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/workflows/epic-wave-model.md
    target_area: Wave 構成ルール・依存ヒントと Wave 構成判断
    source_items: [AG-004, AG-005, AG-006, AG-009]
    content: |
      依存ヒント節（L209-223）を前置検出契約へ更新する: 同一 Wave 候補の子 Issue 間の変更対象
      ファイル集合重複の検出を必須とし、Wave 分離・変更対象分割・重複許容（衝突解消の担当と
      マージ順序の事前記録）の決定肢と判断記録を必須とする。Wave 構成ルールの「L2（ファイル衝突）は
      Wave 分離の理由としない」を「L2 は単独では機械的な直列化要因とならない（並列実行は許容）。
      ただし Wave 構成時・fan-out 前のファイル重複前置検出とその判断記録を必須とし、判断の結果と
      して Wave 分離を選択できる」へ更新する。execution_unit 間並列可否の判定軸（必須依存の
      連結成分のみ、REQ-034-011）は変更しない旨、Level 1〜3 コンフリクト解消が最終回復ネット
      である旨、変更対象集合が取得不能・展開不能な子 Issue は検出不能として報告する旨
      （比較省略の禁止）、case-auto 配下では decision_context による親判断解決（DEC-008）へ
      委譲する旨を明記する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/integrity/rules/IR-065-obsolete-vocabulary-current-use.md
    target_area: 検査項目・exemption 仕様
    source_items: [AG-007, AG-008]
    content: |
      検出パターンのスペース正規化仕様を追加する: 語彙内への半角・全角スペース（U+0020/U+3000）
      挿入の有無に依存しない照合を、共通ヘルパー方式（照合時のみ正規化し報告は原文行）で実現する。
      正規化対象語彙の一覧と、必要に応じた新規語彙の追加（check_integrity.ts パターン定数と
      obsolete-vocabulary-map.yaml vocabulary[] の同一 PR 同期、REQ-047-004）を定義する。
      構造的除外の宣言仕様（理由付き・構造マーカー錨定、NG隠蔽禁止原則準拠）と、既存の行レベル免除
      （履歴マーカー、否定文脈語、retired 見出し配下）の取扱い（存続と「個別出現箇所列挙に
      該当しない」ことの整理）を明記する。行全体マッチ統一規約（checker-execution-contracts）
      との協調（既存行単位走査モデルを維持する旨）を明記する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      targeted-docs-guard-implementation.md L36・single.md L127・docs-and-design-promotion.md L61・
      req-save/references/indexes-and-persistence.md L160・design-save/references/verification-and-persistence.md L79
      が「コミット前 worktree 検証 = --base-ref 標準」と記載。実装（git diff base...HEAD は
      コミット済み差分のみ）と矛盾し、未コミット worktree で files_checked 空の検査見逃しを生む。
    resolution: |
      モード標準を「--base-ref はコミット後・push 前限定、コミット前は untracked 含入の --files
      明示指定」へ反転する。5箇所すべて（guard Design + 配布 workflow skill 4 reference）を
      同一変更で更新する。移管元 Epic #1037 全8子Issue での運用検証済み（ユーザー Q4 確定）。
  - id: CR-002
    conflict: |
      epic-wave-model.md L140「L2（ファイル衝突）は Wave 分離の理由としない（並列許容、Level 1 で
      解消）」と、T2 の前置検出（Wave 分離を決定肢に含む）が文言上衝突し得る。
    resolution: |
      並列許容・Level 1〜3 回復契約は維持したまま、「L2 は単独では機械的な直列化要因とならない。
      ただし前置検出と判断記録を必須とし、判断の結果として Wave 分離を選択できる」へ文言更新する
      （Oracle 助言・adversarial-review stream B F-8 で整合性確認済み）。
  - id: CR-003
    conflict: |
      files_checked 空の扱いが現行では非対称（--files 空 FAILURE / --base-ref 空 WARNING+確認）。
    resolution: |
      REQ-010-076 としてモード問わず「検査見逃し扱い・確認なく合格扱い禁止」の不変条件を定め、
      severity 統一（FAILURE 化）の可否は guard Design（ACT-DESIGN-001）で判断する。
  - id: CR-004
    conflict: 移管元 RU-14 が参照する ACT-DEC-003 は本リポジトリに存在しない旧 ID である。
    resolution: 現行の IR-065/IR-066 系語彙検出（REQ-010-066/067、check_integrity.ts）へ読み替えて要件化する。
  - id: CR-005
    conflict: 3 RU は agentdev_handoff: true を持つ移管元の引き継ぎ用 RU である。
    resolution: |
      agent-dev-flow リポジトリ（self-hosting）では upstream-handoff.md の定めにより
      handoff マーカーを停止条件とせず通常の req/case workflow 入力として扱い、本要件docに
      handoff マーカーを付けない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260908-12
    target_req: REQ-031
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      action_mapping:
        - { action: ACT-REQ-031-001, rows: [REQ-031-025, REQ-031-026], saved_to: docs/requirements/REQ-031.md }
        - { action: ACT-REQ-032-001, rows: [REQ-032-023], saved_to: docs/requirements/REQ-032.md }
        - { action: ACT-REQ-010-001, rows: [REQ-010-076], saved_to: docs/requirements/REQ-010.md }
      unclassified_rows: [REQ-031-025, REQ-031-026, REQ-032-023, REQ-010-076]
  - ou_id: OU-002
    source_ru: RU-20260908-13
    target_req: REQ-035
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      status: saved
      action_mapping:
        - { action: ACT-REQ-031-002, rows: [REQ-031-027], saved_to: docs/requirements/REQ-031.md }
        - { action: ACT-REQ-030-001, rows: [REQ-030-022], saved_to: docs/requirements/REQ-030.md }
        - { action: ACT-REQ-035-001, rows: [REQ-035-012], saved_to: docs/requirements/REQ-035.md }
      unclassified_rows: [REQ-031-027, REQ-030-022, REQ-035-012]
  - ou_id: OU-003
    source_ru: RU-20260908-14
    target_req: REQ-010
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      status: saved
      action_mapping:
        - { action: ACT-REQ-010-002, rows: [REQ-010-066], saved_to: docs/requirements/REQ-010.md }
      unclassified_rows: []

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      worktree を検査対象として、host 側配置の検査 skill を起点に --root（相当）付きで
      docs 整合性検査を起動する。files_checked の内容が検査対象 worktree の変更ファイルと
      一致することを確認する。
    pass_criteria: |
      files_checked が空でなく、その内容が検査対象 worktree の変更ファイル（コミット済み差分
      または列挙ファイル）と一致する。検査対象 root が worktree の絶対パスに一致する。
    on_failure: |
      起動手順の誤りを修正して再検証する（fix-and-reverify。検査見逃しに直結する起動契約の中核ため）。
  - id: TS-002
    target_item: AG-002
    verification: |
      モード標準を記述する全箇所（targeted-docs-guard-implementation.md のモード標準節と CLI 引数表
      説明列、single.md、docs-and-design-promotion.md、req-save indexes-and-persistence.md、
      design-save verification-and-persistence.md）が新標準（--base-ref コミット後・push 前限定、
      コミット前は untracked 含入の --files 明示指定）に一致することを確認する。コミット前の
      列挙手順に untracked ファイル含入の手段（git status --porcelain と git diff の和集合、
      または git ls-files -m -o --exclude-standard 相当）が明記されていることを確認する。
    pass_criteria: |
      全箇所の記述が新標準に一致し、旧標準（コミット前 = --base-ref）の記述が残存しない。
      列挙手順に untracked 含入が明記されている。
    on_failure: |
      残存する旧標準記述を修正して再検証する（fix-and-reverify。手順文書の不一致は検査見逃しの
      直接起因のため）。
  - id: TS-003
    target_item: AG-003
    verification: |
      files_checked が空になる起動（--files 誤指定等）と検査対象 root の誤解決（配置先起点での
      起動、対象外リポジトリの検査）を意図的に再現し、検査結果の扱いを確認する。
      case-close 側（REQ-032-023）の消費ゲートでも同じ扱いになることを確認する。
    pass_criteria: |
      空・root 誤解決のいずれのケースも合格扱いとならず、検査見逃しとして報告・確認待ちとなる。
    on_failure: |
      判定・報告経路を修正して再検証する（fix-and-reverify。fail-couted 動作の中核のため）。
  - id: TS-004
    target_item: AG-004
    verification: |
      合成 draft-data（OU の realization_actions/artifact_actions に重複ファイルを含む）と合成
      子 Issue 本文（変更対象成果物に重複を含む）を用意し、execution-unit-and-preflight.md の
      Wave 構成時比較手順と epic-wave.md STEP-W2 の fan-out 前検出手順を stepping-through
      （dry-run）する。重複検出・判断記録（分離/分割/許容+事前記録）・方針なし停止パス・
      比較不能報告パスを確認する。
    pass_criteria: |
      重複が検出され判断記録が出力される。方針がないケースで fan-out が停止（または
      decision_context 親解決へ委譲）される。変更対象集合が取得不能な子 Issue で比較省略なく
      検出不能として報告される。重複なしケースは既存 fan-out 経路を維持する。
    on_failure: |
      検出手順・停止条件を修正して再検証する（fix-and-reverify。前置検出の実効性の中核のため）。
  - id: TS-005
    target_item: AG-006
    verification: |
      epic-wave-model.md、case-auto-recovery.md、git-common-procedures.md §7、REQ-003-016〜018、
      REQ-032-010〜012、REQ-035-009/010 の Level 1〜3 コンフリクト解消（回復）契約が変更後も
      維持されていることを確認する。
    pass_criteria: |
      回復契約関連の記載に削除・弱体化がない。
    on_failure: |
      弱体化があれば契約を復元して再検証する（fix-and-reverify。回復契約の維持は要件の明示的
      制約のため）。
  - id: TS-006
    target_item: AG-007
    verification: |
      正規化対象語彙一覧の各語彙について、スペース挿入バリアント（半角・全角、例: 「本 ADR」
      「本　ADR」）を含む回帰テスト（正常例・違反例・境界例・許容例、REQ-010-068 準拠）を
      実行する。
    pass_criteria: |
      各語彙の両バリアント（スペースあり/なし）が検出される。既存の許容条件（v2: プレフィックス
      等の履歴識別子、構造的除外領域）で誤検出しない。
    on_failure: |
      正規化照合の実装を修正して再検証する（fix-and-reverify。検出の網羅性が要件の中核のため）。
  - id: TS-007
    target_item: AG-008
    verification: |
      obsolete-vocabulary-map-drift 検査（語彙 ID 集合と checker パターン定数の同期、REQ-047-004）
      を実行し、構造的除外領域の宣言内容を確認する。
    pass_criteria: |
      drift 検査が strict 合格する。除外領域が理由付きで宣言されており、個別出現箇所の列挙で
      代替されていない。
    on_failure: |
      yaml と checker パターンを同一 PR で同期し再検証する（fix-and-reverify。drift 不一致は
      strict fail の既存契約のため）。

realization_actions:
  - id: RA-001
    concern: case-run single.md STEP-S3-4 の worktree 検査起動例の補強
    responsibility: |
      host 側配置の検査 skill を起点とする起動例（--root 付き）、--base-ref のコミット後・push 前
      限定、コミット前の --files 明示指定（untracked 含入の列挙手段: git status --porcelain と
      git diff の和集合、または git ls-files -m -o --exclude-standard 相当）、読み取り専用検査に
      よる worktree 分離原則（POL-worktree-isolation）との関係明記を反映する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-run/references/single.md（STEP-S3-4）
    intent: worktree 実態に合った起動手順により root 誤解決と files_checked 空の検査見逃しを防ぐ
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
  - id: RA-002
    concern: case-close docs-and-design-promotion.md の確認手順統合
    responsibility: |
      既存の「files_checked 空時の確認」bullet（L65）への追記として root 誤解決確認
      （files_checked と検査対象変更ファイルの一致確認）を統合する（重複追記しない）。
      L61 のモード使い分け標準文を新標準へ更新する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md
    intent: case-close 完了判定での検査見逃し確認を手順として確立する
    verification_refs: [TS-003]
    source_items: [AG-001, AG-002, AG-003]
  - id: RA-003
    concern: repo-agentdev-integrity SKILL.md の worktree 実行手順の明記
    responsibility: |
      host 側配置と --root 指定による worktree 実行手順（検査対象 root の明示、files_checked に
      よる root 解決一致確認、--base-ref のコミット後・push 前限定）を明記する。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/SKILL.md
    intent: integrity 検査 skill の worktree 実行契約を正規手順として所有する
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]
  - id: RA-004
    concern: case-open execution-unit-and-preflight.md の Wave 構成時比較の反映
    responsibility: |
      Wave 構成前の変更対象ファイル集合比較（OU の realization_actions/artifact_actions の対象、
      ファイル単位、比較不能時の検出不能報告）を反映する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md
    intent: Wave 構成時の重複前置検出を実行手順として確立する
    verification_refs: [TS-004]
    source_items: [AG-004, AG-009]
  - id: RA-005
    concern: case-run epic-wave.md の fan-out 前検出・停止条件の反映
    responsibility: |
      fan-out 前の重複検出・停止条件（方針なし停止、case-auto 配下の decision_context 親解決、
      変更対象集合取得不能時の検出不能報告）を反映する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-run/references/epic-wave.md
    intent: fan-out 前の最終検出により Wave 内重複による CONFLICTING 連鎖を予防する
    verification_refs: [TS-004]
    source_items: [AG-005, AG-009]
  - id: RA-006
    concern: check_integrity.ts のスペース正規化照合の導入
    responsibility: |
      共通ヘルパー方式（照合時のみ正規化し報告は原文行）でスペース正規化照合を導入する。
      正規化対象語彙を確定し、必要に応じて新規語彙（例: 本ADR 自己言及）を追加する
      （IR065/IR066 パターン定数と obsolete-vocabulary-map.yaml vocabulary[] の同一 PR 同期）。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
      - docs/designs/integrity/rules/IR-065-obsolete-vocabulary-current-use.md（ACT-DESIGN-004）
    intent: スペース挿入による語彙検出の盲点を解消する
    verification_refs: [TS-006, TS-007]
    source_items: [AG-007]
  - id: RA-007
    concern: obsolete-vocabulary-map.yaml の構造的除外領域の宣言
    responsibility: |
      語彙引用・記録領域の構造的除外を理由付きで宣言する（必要に応じスキーマ拡張。個別出現箇所の
      列挙で代替しない）。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/data/obsolete-vocabulary-map.yaml
    intent: 正規化導入に伴う誤検知を構造的に抑制する
    verification_refs: [TS-007]
    source_items: [AG-008]
  - id: RA-008
    concern: スペース正規化の回帰テスト追加
    responsibility: |
      正規化対象語彙のスペース挿入バリアント（半角・全角、「本 ADR」「本　ADR」等）を含む回帰
      テスト（正常例・違反例・境界例・許容例）を追加する。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/tests/（既存テスト配置に従う）
    intent: 正規化照合の検出網羅性と誤検知抑制を機械検証可能にする
    verification_refs: [TS-006]
    source_items: [AG-007]
  - id: RA-009
    concern: req-save・design-save references のモード標準記述の更新
    responsibility: |
      req-save/references/indexes-and-persistence.md（L160）と
      design-save/references/verification-and-persistence.md（L79）のモード使い分け標準文を
      新標準（--base-ref コミット後・push 前限定、コミット前は untracked 含入の --files）へ
      更新する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-req-save/references/indexes-and-persistence.md
      - src/opencode/skills/agentdev-workflow-design-save/references/verification-and-persistence.md
    intent: モード標準の意味反転を targeted docs guard を利用する全 workflow で一貫させる
    verification_refs: [TS-002]
    source_items: [AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-20260908-12
    source_item: RU-20260908-12
    disposition: covered
    reason_code: adopted
    reason: |
      worktree integrity 検査の対象 root 指定手順について、AG-001〜003、ACT-REQ-031-001、
      ACT-REQ-032-001、ACT-REQ-010-001、ACT-DESIGN-001/002、RA-001〜003/009 で要件化・実現化した。
      RU の対象外宣言（integrity 検査スクリプト自体の実装変更・worktree への skill 複製）は
      本 draft の対象外としている。
    evidence:
      path: .agentdev/backlog/req-units/RU-20260908-12.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-20260908-13
    source_item: RU-20260908-13
    disposition: covered
    reason_code: adopted
    reason: |
      Epic Wave 変更ファイル重複の前置検出について、AG-004〜006/009、ACT-REQ-030-001、
      ACT-REQ-031-002、ACT-REQ-035-001、ACT-DESIGN-003、RA-004/005 で要件化・実現化した。
      Level 1〜3 回復契約の維持（RU の制約）は REQ-035-012 と TS-005 で担保する。
    evidence:
      path: .agentdev/backlog/req-units/RU-20260908-13.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-20260908-14
    source_item: RU-20260908-14
    disposition: covered
    reason_code: adopted
    reason: |
      語彙検証 grep のスペース正規化導入について、AG-007/008、ACT-REQ-010-002、ACT-DESIGN-004、
      RA-006〜008 で要件化・実現化した。移管元 ACT-DEC-003 は現行 IR-065/066 系へ読み替えた
      （CR-004）。誤検知の扱いは既存宣言構造と同型の構造的除外として確定した（ユーザー Q2 確定）。
    evidence:
      path: .agentdev/backlog/req-units/RU-20260908-14.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    3 operation_units は独立した関心（T1: integrity 検査起動契約、T2: Wave 重複前置検出、
    T3: 語彙正規化）で、各 OU 単独で実装可能。REQ 行・Design・実現面の対応は
    artifact_actions（11 actions）と realization_actions（RA-001〜009）に全て割り当て済み。
  wave_hints:
    - OU-001 と OU-002 は docs/requirements/REQ-031.md を共通編集対象（ACT-REQ-031-001 /
      ACT-REQ-031-002）のため、同一 Wave で並列実行すると REQ-031.md が重複変更になる。
      直列化または単一 Issue への集約を推奨する（本要件の T2 前置検出が検出すべきケースの実例）。
    - それ以外の実現面ファイル・Design の編集対象に OU 間の交叉はない。
```

# summary

移管 handoff RU 3件（worktree integrity 検査手順・Epic Wave 重複前置検出・語彙検証スペース正規化）を
agent-dev-flow リポジトリの通常要件として確定した。REQ 5件への追加・更新（7 actions）、Design 4件の
更新、実現面 9 変更（RA-001〜009）で構成する。work_type は feature、scale は large
（実装スコープシグナル: 影響ファイル 18ファイル > 10）。adversarial-review（2 stream）の受容 findings
を反映済みで、未解決事項は残っていない。
