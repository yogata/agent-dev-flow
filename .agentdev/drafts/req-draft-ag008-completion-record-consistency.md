---
draft_type: req_draft
topic_slug: ag008-completion-record-consistency
status: draft
created_at: "2026-11-15T14:44:06+09:00"
source_rus: [RU-0280]
---

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: >
  RU-0280（Epic #4054 利用者レビュー②・AG-008）として受理した、Epic #4054 完了記録と承認済み
  合格基準の不整合を整理する記録是正要件である。Epic #4054 の完了記録（コメント 6884658730）は
  full integrity suite の失敗3件を baseline 対照（7c8931e32）での同一再現確認のうえ「既知欠陥登録」として
  受理し完結したが、承認された AG-008 の合格基準は「不合格なく完了」であり既存不備の受理を認める
  条項を存在しない。完了記録への追記コメントとして、AG-008 原文と3件受理の経緯の対比、
  受理が承認基準から導かれない旨、是正の別案件化を明示する。完了判定は維持する（HITL 回答 (a)）。
  REQ操作なし（一時的な記録是正、direct_case 構成）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      完了記録への追記コメントの対比構成。Epic #4054 完了記録コメント 6884658730 への追記コメント
      （新規投稿として行い、完了記録コメント本文は歴史記録として編集しない）に、次の3つを対比して示す:
      (1) AG-008 原文（Epic #4054 本文「OU-001〜007 の横断整合条件（AG-008・TS-008）」節:
      「全7変更の適用後、check_integrity 系検査全体、受け入れ検証範囲 bun test ./src/ 全体、
      textlint 関連の配布側試験が不合格なく完了する」、および完了条件チェックボックスの
      「合格条件: 各 TS の pass_criteria を満たすこと（不成立時は fix-and-reverify）」。
      除外条項は存在しない）、(2) 3件受理の経緯（full integrity suite 3066 test 中 3063 pass / 3 fail、
      baseline commit 7c8931e32 の detached worktree で同一再現を確認、機械受理記録による既知欠陥登録、
      観測 fail 3件と分類3件の 1:1 対応・由来不明 0件）、(3) 両者の対比から、完了記録の受理が
      承認済み合格基準から導かれない受理である旨。
  - id: AG-002
    content: |
      完了判定の扱いの確定（HITL 回答 (a)。2026-11-15 確定）。Epic #4054 の完了判定は維持し、
      本追記をもって逸脱の記録として完結する。追記によって完了判定を改めず、Epic の再オープンも行わない。
      根拠: 利用者の Epic #4054 レビュー本文の指示（2026-11-15。「まず、元のAG-008の合格基準と完了判定の整合を確認すべき」
      「失敗自体の修正は必要に応じて別件とする」）、および3件が baseline 対照で本バッチ非起因と実測済みであること。
      回答は監督者が利用者の上記既存指示から機械的に導いた中継であり、利用者が上書きした場合は
      本要件の範囲を見直す（上書き前の実行で完了判定を改える操作は行わない）。
  - id: AG-003
    content: |
      3件の別案件化の明記。追記コメントに、対象3件（relied-diff T6 後続消費経路の文書接続、
      cli-e2e PowerShell entry の -BootstrapMode archive、cli-e2e PowerShell entry の -SeedMode alias）の
      修正が本記録では実施せず別案件である旨を記載する。3件の修正実施そのものは本 Case では行わない
      （必要に応じて別案件）。
  - id: AG-004
    content: |
      yomiyasu 工程と投稿経路。追記コメントの文面は yomiyasu 工程を経て（推敲・lint 実行・指摘確認）、
      Custom Tool agentdev_gh 経由で Epic #4054 へ投稿する。GitHub 文章の書込み前推敲の適用規律
      （agentdev-workflow-lifecycle「文章品質・書込み規約」節）に従う。完了記録コメント 6884658730
      そのものは編集しない（歴史記録の保持）。

conflict_resolutions:
  - id: CR-001
    conflict: >
      Epic #4054 完了記録（3件を既知欠陥登録として受理し完結）と承認済み AG-008 合格基準
      （全検査・全試験の不合格なし・on_failure は fix-and-reverify・除外条項なし）の不整合。
    resolution: >
      完了判定は維持し、逸脱の記録として完結する（HITL 回答 (a)、2026-11-15 確定）。
      根拠は利用者の Epic #4054 レビュー本文指示（基準と完了判定の整合確認を求め、失敗の修正は別件とする）
      および3件が本バッチ非起因の baseline 対照実測。回答は監督者による機械的導出の中継であるため、
      利用者が上書きした場合は本件の範囲を見直す。後続コマンドは本件を利用者へ再確認しない。

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0280
    target_req: null       # REQ操作なし（一時的な記録是正。AG-008 基準自体の変更は対象外）
    operation: update      # 実現面（GitHub 完了記録への追記コメント）の更新。REQ/Decision/Design の保存操作は伴わない
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      投稿済みの追記コメント本文を、Epic #4054 本文の AG-008 原文（不合格なく完了・不成立時は
      fix-and-reverify・除外条項なし）と、完了記録コメント 6884658730 の機械受理記録
      （3 fail・baseline 7c8931e32 detached worktree での同一再現・既知欠陥登録・1:1 対応）と照合する。
    pass_criteria: |
      (1) AG-008 原文（引用または意思を変えない要約）、(2) 3件受理の経緯（対照実測と登録内容）、
      (3) 受理が承認済み合格基準から導かれない旨、の3要素がすべて追記コメントに含まれていること。
    on_failure: |
      fix-and-reverify。文面を修正してコメント更新または追加投稿を行い、再照合する。
  - id: TS-002
    target_item: AG-002
    verification: |
      追記コメントに、完了判定は維持し本追記をもって逸脱の記録として完結する旨（Epic の再オープンを
      行わない旨を含む）と、その根拠（利用者レビュー指示・本バッチ非起因の対照実測）が記載されていることを
      確認する。Epic #4054 の状態が closed のまま維持されていることを読み取りで確認する。
    pass_criteria: |
      完了判定の扱いと根拠が明示されていること。Epic #4054 が closed 維持であること。
    on_failure: |
      fix-and-reverify。文面を修正して再確認する。Epic 状態が変わっている場合は停止して報告する。
  - id: TS-003
    target_item: AG-003
    verification: |
      追記コメントに、3件（relied-diff T6 後続消費経路・-BootstrapMode archive・-SeedMode alias）の修正が
      本記録では実施せず別案件である旨が記載されていることを確認する。本 Case の操作で3件の修正を
      実施していないことを確認する。
    pass_criteria: |
      3件が別案件扱いである旨が明記されていること。3件の修正を実施していないこと。
    on_failure: |
      fix-and-reverify。文面を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      追記コメント文面の作成過程で yomiyasu 推敲・lint 実行・指摘確認が実施された記録
      （Case Issue または完了記録の検証欄への最小記録）と、agentdev_gh 経由の投稿であることを確認する。
      完了記録コメント 6884658730 の本文が編集されていないことを読み戻しで確認する。
    pass_criteria: |
      yomiyasu 適用の記録と Tool 経由投稿の確認、6884658730 未編集の確認がすべて成立していること。
    on_failure: |
      fix-and-reverify。未実施の工程を実施し、6884658730 が編集されている場合は原文への復元を検討して報告する。

realization_actions:
  - id: RA-001
    concern: Epic #4054 完了記録と承認済み AG-008 合格基準の不整合の記録是正（追記コメントの作成・投稿）
    responsibility: >
      追記コメント文面の作成（AG-008 原文と3件受理経緯の対比、承認基準から導かれない受理である旨、
      是正の別案件化、完了判定維持の根拠）、yomiyasu 工程の適用、agentdev_gh による Epic #4054 への投稿。
      完了記録コメント 6884658730、Epic 本文、AG-008 基準自体は変更しない。
    ownership_hints:
      - "Epic #4054（完了記録コメント 6884658730）"
      - "AG-008 原文: Epic #4054 本文「対象要件」節の OU-001〜007 横断整合条件（AG-008・TS-008）と「完了条件」チェックボックス"
      - "AG-008/TS-008 定義の由来: 消費済み草案 req-draft-adf-simplification-remediation.md（commit c1ed6f143。原文確認は Epic 本文で足りるが、必要なら git 履歴を参照）"
      - "文面品質: yomiyasu スキル（GitHub 文章の書込み前推敲・lint・指摘確認）"
    intent: >
      「今回の変更で失敗を増やしていない」ことと「検査全体が不合格なく完了した」ことは別条件であり、
      合格判定と実際の検査結果に不整合があった（Epic #4054 利用者レビュー②）。承認済み基準からの逸脱と
      その扱いを記録として整理し、是正の別案件化を追跡可能にする。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-004]

review_dispositions:
  - id: RD-001
    source_ru: RU-0280
    source_item: "対象外/3件の失敗の修正実施"
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0280 が対象外と明示（必要に応じて別案件）。AG-003・TS-003 が別案件化の明記までを
      本 Case の対象として保持する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0280.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0280
    source_item: "対象外/AG-008 の基準自体の変更"
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0280 が対象外と明示（基準の改訂は本案の対象外）。本 Case は AG-008 基準を変更せず、
      基準と完了記録の不整合の記録のみを扱う。
    evidence:
      path: .agentdev/backlog/req-units/RU-0280.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0280
    source_item: "対象外/bun test ./src/（2,008件合格・失敗0）など他の検証結果の再検証"
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU-0280 が対象外と明示。他の検証結果の再検証は行わない。追記コメントは既存の完了記録の
      記載内容を引用して対比するものであり、再検証を要求しない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0280.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
  notes: >
    direct_case 構成（artifact_actions 空）。リポジトリ内ファイルの変更を伴わない GitHub 記録操作が
    主である（PR の要否・完了証拠の構成は case-open が判断）。RU-0279 由来の配布資産是正 Case
    （req-draft-ou006-distribution-reference-resolution.md）とは並行可能（RU 相互に depends_on なし）。
```

# summary

- 操作分類: REQ操作なし。Epic #4054 の一時的な記録是正であり、AG-008 基準自体の変更（規範変更）は RU-0280 の対象外。docs_chore・direct_case 構成。
- HITL 解決の記録: 「完了判定を改めるか否か」→ (a) 完了判定は維持し、逸脱の記録として完結（2026-11-15 確定、CR-001 に記録）。根拠は利用者の Epic #4054 レビュー本文指示。回答が監督者による機械的導出の中継である旨も AG-002・CR-001 に記録し、利用者上書き時は本件の範囲を見直す。
- adversarial-review（STEP-8）skip 判定: 軽量な記録是正・Decision 判断対象なし・内容が RU・確定済み HITL 回答・実取得済み一次記録（Epic 本文・完了記録コメント）からの機械的導出のため、req-define 固有 skip 条件に該当と判定した。代替自己反証として「完了判定維持の回答は監督者中継であり利用者の直接回答ではない」点を検討し、CR-001 に根拠と上書き時の見直し条件を記録した上で、draft 提示による利用者確認機会で担保した。
- 変更誘発境界リスク分析（5観点）の確認記録: dependency boundary（既存正規成果物・配布物への依存変更なし）、client/server boundary（GitHub 書込みは agentdev_gh 操作契約経由のみ。生 gh WRITE は guard 拒否対象）、execution boundary（文面作成は yomiyasu 工程必須。TS-004 で担保）、build/runtime boundary（リポジトリ内ビルド・試験への影響なし）、environment propagation boundary（該当なし。追記先は GitHub の単一正規情報源）。
