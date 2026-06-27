# draft-data

```yaml
status: saved
topic: guide-gh-cli-and-git-standard-procedures
work_type: maintenance
scale: standard
summary: >
  gh CLI / git 標準手続きのガードレール強化に関する2件のRU統合ドラフト。
  RU-0021（gh pr merge --delete-branch worktree占有時失敗）は case-close.md Step4 および
  standard-procedures.md への --delete-branch 非使用ガードレール追記が case-open 対象。
  RU-0022（PowerShell UTF-8 mojibake）は standard-procedures.md のコンソールエンコーディング
  初期化と verify.md のエンコーディング検証が既に実装済み、残課題は agentdev-conventional-commits
  SPEC への git commit -m ASCII-only / -F utf8-file 規定のみ。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-001
      item: RU-0021 --delete-branch ガードレールの配置先
      resolution: >
        Inferred。case-close.md Step4（command 定義）に --delete-branch 非使用の明示的注意を、
        standard-procedures.md（skill reference）PR merge 節に --delete-branch 非推奨と理由を追記する。
        根拠: 現状の case-close.md Step4 および standard-procedures.md PR merge 節は共に
        --delete-branch を使用していないが、非使用の根拠が文書化されていない。
    - id: UQ-002
      item: RU-0022 standard-procedures.md および verify.md の既存対応状況
      resolution: >
        Confirmed。standard-procedures.md L43-51（Section 2 Step 0）にコンソールエンコーディング
        初期化（[Console]::OutputEncoding = UTF8, $OutputEncoding = UTF8, chcp 65001）が既に実装済み。
        verify.md L26-30（Section 2(a)）にエンコーディング検証（日本語文字列一致、制御文字混入確認、
        非Unicode文字置換確認）が既に実装済み。RU-0022 items 1, 2 は解消済み。
    - id: UQ-003
      item: RU-0022 git commit -m mojibake の SPEC 配置先
      resolution: >
        Inferred。agentdev-conventional-commits SPEC（docs/specs/skills/agentdev-conventional-commits.md）
        に git commit -m ASCII-only / -F utf8-file 規定を追記する。根拠: 同 SPEC は
        コミットメッセージ規約を SSoT として管理しており、-m と -F の使い分け規則が不在。
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      case-close.md Step4（PRマージ）は --delete-branch フラグを使用せず、ブランチ削除は
      Step7（ブランチ、worktree削除）で独立して実施する。アクティブ worktree に checkout された
      ブランチで --delete-branch を使用すると local 削除が失敗し remote 削除フェーズへ到達しない
      ため、--delete-branch は使用禁止とする。case-close.md Step4 にこの明示的注意を追記し、
      standard-procedures.md PR merge 節に --delete-branch 非推奨と技術的根拠を追記する。
    source: RU-0021
    classification: Inferred
  - id: AG-002
    content: >
      standard-procedures.md のコンソールエンコーディング初期化（[Console]::OutputEncoding = UTF8、
      $OutputEncoding = UTF8、chcp 65001）は既に Section 2 Step 0 として実装済みであり、
      gh CLI stdout 読込時の cp932 mojibake を防止している。RU-0022 item 1 は解消済み。
    source: RU-0022
    classification: Confirmed
  - id: AG-003
    content: >
      verify.md のエンコーディング検証（Section 2(a): 日本語文字列一致、制御文字 U+0000-U+001F
      混入確認、非 Unicode 文字置換確認）は既に実装済みであり、書き込み後の mojibake を検出する。
      RU-0022 item 2 は解消済み。
    source: RU-0022
    classification: Confirmed
  - id: AG-004
    content: >
      agentdev-conventional-commits SPEC（docs/specs/skills/agentdev-conventional-commits.md）に
      git commit のメッセージ渡し規則を追記する: git commit -m は ASCII-only とし、日本語等の
      非 ASCII 文字を含むコミットメッセージは -F {utf8-file} で渡すこと。PowerShell 既定 cp932
      環境で -m に日本語を渡すとコンソールエンコーディング変換により mojibake が発生するため。
      utf8-file は UTF-8（BOMなし）、改行コード LF で作成すること。
    source: RU-0022
    classification: Inferred

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-conventional-commits.md
    target_area: "## 現在の動作"
    source_items: [AG-004]
    content: |
      ## 現在の動作

      - プロジェクト固有ルールとして日本語記述を採用
      - SemVer 準拠（feat: MINOR、fix/docs/style/refactor/perf/test/build/ci/chore/revert: PATCH）
      - フッター形式: `Refs: #N`（参照）、`Closes: #N`（クローズ）
      - **コミットメッセージ渡し規則**: `git commit -m` は ASCII-only とし、日本語等の非 ASCII 文字を含むコミットメッセージは `git commit -F {utf8-file}` で渡すこと。PowerShell 既定 cp932 環境で `-m` に日本語を渡すとコンソールエンコーディング変換により mojibake が発生する。utf8-file は UTF-8（BOMなし）、改行コード LF で作成すること（`[System.IO.File]::WriteAllText` with `UTF8Encoding($false)` 使用、agentdev-gh-cli standard-procedures.md Section 2 参照）

conflict_resolutions:
  - id: CR-001
    item: RU-0022 items 1, 2 の既存対応状況
    resolution: >
      standard-procedures.md Section 2 Step 0（L43-51）にコンソールエンコーディング初期化が、
      verify.md Section 2(a)（L26-30）にエンコーディング検証が既に実装済み。
      RU-0022 が要求する標準手続きの大部分は解消済み。残課題は agentdev-conventional-commits
      SPEC の git commit -m 規則のみ。
    classification: Confirmed

operation_units:
  - ou_id: OU-001
    source_ru: RU-0022
    target_spec: docs/specs/skills/agentdev-conventional-commits.md
    operation: spec-update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0021
    operation: case-open-only
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-004
    verification: >
      docs/specs/skills/agentdev-conventional-commits.md に git commit -m ASCII-only /
      -F utf8-file 規定が追記されていることを確認する。
    pass_criteria: >
      agentdev-conventional-commits.md の「現在の動作」セクションに -m は ASCII-only、
      非 ASCII は -F utf8-file という規則が明記されていること。
    on_failure: |
      action: fix-and-reverify
      description: 規則が未追記または不完全な場合、SPEC を修正して再確認する。
  - id: TS-002
    target_item: AG-001
    verification: >
      case-close.md Step4 に --delete-branch 非使用の明示的注意が追記されていることを確認する。
      standard-procedures.md PR merge 節に --delete-branch 非推奨と技術的根拠が追記されていることを確認する。
    pass_criteria: >
      case-close.md Step4 に --delete-branch 使用禁止の記述があること。
      standard-procedures.md PR merge 節に worktree 占有時の local 削除失敗リスクの記述があること。
    on_failure: |
      action: fix-and-reverify
      description: ガードレール追記が不完全な場合、該当ファイルを修正して再確認する。
  - id: TS-003
    target_item: AG-002
    verification: >
      standard-procedures.md Section 2 Step 0（L43-51）にコンソールエンコーディング初期化が
      存在することを確認する。verify.md Section 2(a)（L26-30）にエンコーディング検証が
      存在することを確認する。
    pass_criteria: >
      standard-procedures.md に3行のコンソールエンコーディング初期化が存在すること。
      verify.md にエンコーディング検証項目が存在すること。
    on_failure: |
      action: record-in-findings
      description: >
        本項目は既存実装の確認であり、実装不良ではなく仕様の陳腐化や認識ズレの可能性がある。
        不一致を発見した場合は Findings に記録し、別途要件化する。

case_open_hints:
  epic_needed: false
  wave_hints:
    wave_1: [OU-001, OU-002]
```

## 補助情報

### RU-0021 の位置付け

case-close.md Step4（PRマージ）および standard-procedures.md PR merge 節は共に
`--delete-branch` を使用せず、ブランチ削除を case-close.md Step7 で独立実施する設計。
しかし `--delete-branch` を使用すべきでないという明示的ガードレールが文書化されていない。
case-close.md Step4 および standard-procedures.md への追記を case-open 作業として実施する。

### RU-0022 の位置付け

RU-0022 が要求する標準手続きのうち、以下は既に実装済み:
- standard-procedures.md Section 2 Step 0（L43-51）: コンソールエンコーディング初期化
  （[Console]::OutputEncoding = UTF8, $OutputEncoding = UTF8, chcp 65001）
- verify.md Section 2(a)（L26-30）: エンコーディング検証
  （日本語文字列一致、制御文字 U+0000-U+001F 混入確認、非 Unicode 文字置換確認）

残課題は agentdev-conventional-commits SPEC への git commit -m ASCII-only /
-F utf8-file 規定のみ。PowerShell 既定 cp932 環境で `git commit -m "日本語"` を実行すると
コミットメッセージが mojibake する問題（commit 8ebe0e98 で実証）を SPEC レベルで防止する。

### REQ-0149 健全性メトリクス

REQ-0149 は8要件行（REQ-0149-001〜008）、関心分類数1、成果物種別数2。
SPLIT metrics: 0 → APPEND 許可。ただし本ドラフトは REQ-0149 APPEND を含まず、
SPEC更新（agentdev-conventional-commits.md）と case-open のみ。
