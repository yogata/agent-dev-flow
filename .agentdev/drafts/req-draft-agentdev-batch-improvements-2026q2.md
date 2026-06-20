---
draft_type: req_draft
topic_slug: agentdev-batch-improvements-2026q2
status: saved
created_at: 2026-06-21T00:00:00+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-0009
agentdev_handoff: true
---

<!-- req_draft: 9件のRU（RU-0001〜RU-0009）を統合管理するメタ要件doc。
     元の各 RU は backlog-review で「1:1・関心領域重複なし」と判定された独立論点だが、
     ユーザー意向「case-auto で一括処理」により1要件docに統合。
     operation_units で14 OU に展開し、各 OU が対象 REQ/SPEC/command への操作を表現する。
     正は # draft-data YAML block（REQ-0138-001, ADR-0124）。 -->

# draft-data

```yaml
# work_type: feature（新規要件 APPEND を含むため。bugfix 昇格要件なし）
work_type: feature

# scale: large（9論点・複数REQ/ADR/SPEC/command にまたがる・実装詳細セクション含む）
# ユーザー意向「case-auto 一括処理」により分解せず、14 OU の operation_units で一括管理
scale: large

# agentdev_handoff: 全 RU が AgentDevFlow 本体の配布物改善を含むため true
agentdev_handoff: true

# summary: 人間可読補助（処理の正ではない・REQ-0138-002）
summary: |
  AgentDevFlow 本体の一括改善（9 RU・14操作単位）。RU-0001〜RU-0009 を統合管理し、
  case-auto で一括処理（req-save → spec-save → case-open → case-run → case-close）を想定。
  対象領域は5分野: (1) case-auto/REQ-0114 整合性是正（RU-0003, RU-0004）、
  (2) 文書品質・整備（RU-0002 DOC-MAP一覧更新, RU-0007 文書作成品質ガイド3件）、
  (3) テスト/実行インフラ（RU-0001 copyScripts本採用, RU-0009 case-run worktree・ハーネス4件）、
  (4) 記録・検出精度（RU-0005 達成記録先標準化, RU-0006 IR-044委譲exemption）、
  (5) 開発環境（RU-0008 Windows gh CLI文字化け対策）。
  全 RU に agentdev_handoff: true が設定されており、AgentDevFlow 本体の配布物
  （command/skill/SPEC/REQ）に対する改善を含む。本リポジトリは agent-dev-flow 本体そのもの
  であり、当該改善は自己ホスト環境での実装対象となる。

# auto_gate: case-auto 自走可否（REQ-0138-013）
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 9件の合意事項（REQ-0138-008: 必要十分な長文で保持）
agreed_items:
  - id: AG-001
    content: |
      [RU-0001] regression test の fixture copy は実ファイル構成の完全ミラーリング
      （全 .ts ファイルコピー）を本採用とする。手動 copy 対象更新運用は禁止し、新規モジュール
      追加時に copyScripts() が自動的に全ファイルをコピーする。シンボリックリンク・実ディレクトリ
      参照等の代替手法は Windows 互換性・実装複雑性から採用しない。テスト実行時間への影響は計測し、
      回帰テスト全体の実行時間が現状比で大幅な増加がないことを確認する。
      根拠: PR #911（Issue #898）で暫定対応として全件コピーを実装済み・実績あり。

  - id: AG-002
    content: |
      [RU-0002] docs/DOC-MAP.md の現行 REQ 一覧表に REQ-0137, REQ-0138, REQ-0139, REQ-0140,
      REQ-0141 の5件を行として追加する（各 REQ のタイトル・概要を docs/README.md および
      各 REQ ファイルから転記）。AGENTS.md「信頼できる情報源の優先順位」と docs/README.md の
      REQ レンジ記載は既に実ファイル（REQ-0101〜REQ-0141・33件・8件廃止）と整合しているため
      修正不要。これにより REQ-0101-002（定量的データ検証）が DOC-MAP についても遵守される。
      Step 3-1 で確認: 実ファイル33件、AGENTS.md/README.md 正確、DOC-MAP のみ5件未掲載。

  - id: AG-003
    content: |
      [RU-0003] case-auto G19 を「case-auto は req-save 段階（case-open 完了前）のみ draft を
      SSoT として扱う」に限定し、case-open 完了後は子Issue（Epic Issue のステータス追跡テーブル
      含む）が SSoT となることを case-auto に明記する。case-auto Step 4-1 のクリーンアップ検証
      ゲート（ドラフト削除検証）は case-open 完了後に実行するよう順序関係を整理する。
      REQ-0114-058（G19 根拠要件）の文言も上記に合わせて調整する。
      根拠: case-open Step 18「ドラフト削除」と G19「draft を SSoT」の矛盾が実行時トラブル
      （ドラフト残置）を招いた問題の解消。

  - id: AG-004
    content: |
      [RU-0004] REQ-0114 内の case-auto 工程分岐記述を ADR-0123 Decision #3 で確定した
      新ワークフロー（req-save → spec-save → case-open → case-run → case-close）に全面的に
      更新する。-065 周辺のみならず、Step 4-1, 4-2, 8-1 等の旧順序参照箇所
      （feature: req-save → case-open → …）を全て棚卸しし、spec-save を含む新ワークフローに
      揃える。REQ-0136-014（関連要件）との整合性も確認する。
      根拠: ADR-0123 accepted 後も REQ-0114 の旧順序が残存し、driver subagent が spec-save
      ステップをスキップする誤実装リスクがあった。

  - id: AG-005
    content: |
      [RU-0005] 達成状況（3層ゲート実装・稼働・再発finding対応）の正規記録先を以下に明文化する:
      (1) 3層ゲート達成状況は docs/guides/diagnostics-and-maintenance.md の3層ゲートセクション、
      (2) false positive 対応は該当 SPEC（gate-levels.md または quality-gates.md）の false positive 表、
      (3) 達成要件行は REQ-0108-153/154/155 の要件行。
      完了条件文言は「REQ-0108 Update Notes 記録」から「REQ-0108 達成状況が上記 SPEC 準拠の
      記録先に記録」へ標準化する。REQ-0101-071（active REQ の Update Notes セクション禁止）・
      REQ-0101-073（変更履歴セクション禁止・frontmatter updated のみで追跡）は現行維持とし、
      例外セクションは設けない。これは本要件の趣旨（記録先の統一）と整合する。

  - id: AG-006
    content: |
      [RU-0006] check_integrity.ts の req-spec-boundary-violation（IR-044）に委譲/集約/切り出し/
      存在確認文脈の exemption（isDelegationContext 等の述語）を isNegationContext と同列に
      追加する。これにより既存9件の false positive（委譲先・集約先・切り出し状況の検証要件・
      routing 要件の経路分類名等で SPEC キーワードが現れる文脈）が warning から消退する。
      true positive が誤って免除されないことの検証は回帰テストで実施する（既知の true positive
      が残ることを確認）。exemption 対象キーワードの精緻化・閾値設計の詳細は SPEC
      （integrity-rule-catalog.md）に配置する。既存 exempt 9件
      （.agentdev/drafts/req-spec-cleanup-plan.md）は exemption 実装後に cleanup plan から除外する。

  - id: AG-007
    content: |
      [RU-0007] 以下3本の文書作成品質ガイドを整備する。
      (1) IR ID 桁数規定の整備: docs/specs/system.md の ID 体系セクションに IR-NNN（3桁）/
      REQ-NNNN（4桁）の対比と正規表現サンプル（/^REQ-\d{4}$/, /^IR-\d{3}$/）を追記。
      (2) REQ Step 番号ガイドの実践反映: src/opencode/skills/agentdev-req-file-manager/SKILL.md
      に「REQ には振る舞いを書く」「Step 番号は command reference へ」を追記、AGENTS.md 編集
      ガードレールに要約追記、src/opencode/skills/agentdev-command-authoring/SKILL.md に責務分離
      ガイド追記。
      (3) ADR 番号推測禁止: src/opencode/commands/agentdev/req-define.md に new:{slug} 推奨と
      番号直接指定回避ガイドを追記、src/opencode/commands/agentdev/req-save.md に ADR 番号再検証
      ガイドを追記、src/opencode/skills/agentdev-adr-file-manager/SKILL.md で採番ルール
      （max+1, 欠番埋め禁止）を強調。
      REQ-0101-068 自体は現行維持（実践ガイドを補強のみ）。矛盾時は現行 REQ > ADR > SPEC > ガイド
      の順で優先。source（src/opencode/）と projection（.opencode/）の両辺を編集する。

  - id: AG-008
    content: |
      [RU-0008] src/opencode/skills/agentdev-gh-cli/SKILL.md に Windows PowerShell 環境での文字化け
      対策を追記する。Section 1（禁止事項）に「Shift-JIS コンソール（chcp 932）環境での
      --body-file / --title 直接使用禁止」を追記。Section 2（標準手順）の冒頭（Step 0 または
      Step 1 の前）にコンソールエンコーディング初期化ステップとして以下を必須で追記:
      [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
      $OutputEncoding = [System.Text.Encoding]::UTF8
      cmd /c chcp 65001 | Out-Null
      Windows 以外の環境では不要である旨を明記する。既存の [System.IO.File]::WriteAllText
      （UTF-8 BOM なし）規定との両立関係を整理する（ファイル書き出しは既存規定・コンソール
      エンコーディングは新規ステップ）。source/projection 両辺編集。

  - id: AG-009
    content: |
      [RU-0009] 以下4本の case-run worktree・ハーネス手順を整備する。
      (1) Windows+junction 制約の driver 引き継ぎルール化: src/opencode/skills/
      agentdev-workflow-orchestration/SKILL.md に driver subagent 引き継ぎプロンプトへの制約明記
      を MUST で追記、references/subagent-protocol.md の driver 起動プロンプトテンプレートに
      「worktree 内 .opencode/ は空・source/projection は手動両辺編集・同期スクリプト非依存」を
      必須項目として追記。
      (2) origin/main 鮮度確認の明示: src/opencode/skills/agentdev-git-worktree/SKILL.md に
      git fetch origin 実行と並列 Wave 実行時の origin/main 鮮度確認を追記、
      src/opencode/commands/agentdev/case-run.md Step 4 に git fetch origin を明示。
      (3) bunx → npx フォールバック経路: src/opencode/commands/agentdev/case-run.md Step 5 に
      「bunx がモジュール解決エラーで失敗した場合は npx にフォールバック」を追記、
      src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md の
      起動スクリプト例に npx フォールバック経路を追記。
      (4) タイムアウト事後処理手順の新設: src/opencode/skills/agentdev-case-run-execution-adapter/
      SKILL.md または references に「タイムアウト＝即 failed ではなく実装完了・検証未完了として
      扱う」「worktree の git status で未コミット変更を確認」「残留箇所の grep と手動修正」を規定。
      コマンドは薄く保ち詳細はスキルへ。source/projection 両辺編集。

# artifact_actions: REQ/ADR/SPEC への保存対象を1配列に統合（REQ-0138-009）
# 1 action = 1 artifact × 1 editing concern（REQ-0138-017）
# ADR action なし（Step 5 で ADR 不要と判定）
artifact_actions:
  # ===== REQ actions（11件）=====
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0108.md
    target_area: 要件テーブル（regression test 信頼性・fixture copy）
    source_items: [AG-001]
    content: |
      regression test の fixture copy は実ファイル構成の完全ミラーリング（全 .ts ファイル
      コピー）を行う。手動 copy 対象更新運用を禁止し、新規モジュール追加時に copyScripts() が
      自動的に全ファイルをコピーする。テスト実行時間への影響を計測し、回帰テスト全体の実行時間が
      現状比で大幅な増加がないことを確認する。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    target_area: G19 根拠要件（REQ-0114-058）・SSoT 遷移記述
    source_items: [AG-003]
    content: |
      REQ-0114-058（G19 根拠要件）を以下の通り更新する: case-auto は req-save 段階
      （case-open 完了前）のみ draft を SSoT として扱う。case-open 完了後は子Issue
      （Epic Issue のステータス追跡テーブル含む）が SSoT となる。case-auto Step 4-1 の
      クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行する。

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    target_area: case-auto 工程分岐記述（-065 周辺・Step 4-1/4-2/8-1 等）
    source_items: [AG-004]
    content: |
      REQ-0114 内の case-auto 工程分岐記述を ADR-0123 Decision #3 の新ワークフロー
      （req-save → spec-save → case-open → case-run → case-close）に全面的に更新する。
      旧順序参照箇所（feature: req-save → case-open → …）を spec-save を含む新ワークフロー
      に揃える。-065 周辺、Step 4-1, 4-2, 8-1 等の全箇所を棚卸し対象とする。

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-0101.md
    target_area: 達成記録先標準（文書管理基準の拡張）
    source_items: [AG-005]
    content: |
      Epic・large scale 要件の達成状況（3層ゲート実装・稼働・再発finding対応）の正規記録先を
      以下とする: (1) 3層ゲート達成状況は docs/guides/diagnostics-and-maintenance.md の3層
      ゲートセクション、(2) false positive 対応は該当 SPEC の false positive 表、(3) 達成要件行
      は当該 REQ の要件行。完了条件に Update Notes セクションへの記録を求めない
      （REQ-0101-071 遵守）。変更履歴は frontmatter updated のみで追跡する（REQ-0101-073 遵守）。

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-0136.md
    target_area: Issue #904（RU-6）完了条件文言
    source_items: [AG-005]
    content: |
      Issue #904（RU-6）の完了条件 #4「REQ-0108 の Update Notes に3層ゲート達成状況と再発finding
      対応を記録」を「REQ-0108 達成状況（3層ゲート実装・稼働・再発finding対応）が REQ-0101 拡張
      要件（ACT-REQ-004）の正規記録先に記録されていること」に標準化する。

  - id: ACT-REQ-006
    artifact: req
    operation: append
    target: docs/requirements/REQ-0108.md
    target_area: 要件テーブル（integrity 検出精度・IR-044 exemption 方針）
    source_items: [AG-006]
    content: |
      req-spec-boundary-violation（IR-044）は委譲/集約/切り出し/存在確認文脈
      （委譲先・集約先・切り出し状況の検証要件・routing 要件の経路分類名等で SPEC キーワードが
      現れる文脈）を exemption 対象とする。詳細な exemption 条件・キーワード・閾値は SPEC
      （integrity-rule-catalog.md）に配置する。true positive が誤って免除されないことを回帰テスト
      で検証する。

  - id: ACT-REQ-007
    artifact: req
    operation: append
    target: docs/requirements/REQ-0102.md
    target_area: 要件テーブル（req-define・ADR番号推測禁止）
    source_items: [AG-007]
    content: |
      req-define は ADR 番号を推測指定せず、new:{topic-slug} 形式を使用する。req-save は
      ADR ファイル保存時に agentdev-adr-file-manager の採番ルール（max+1, 欠番埋め禁止）で
      確定した番号を振る。draft 内の全 ADR 参照は req-save が確定番号で置換する。

  - id: ACT-REQ-008
    artifact: req
    operation: append
    target: docs/requirements/REQ-0107.md
    target_area: 要件テーブル（GitHub 本文品質・Windows 環境文字化け対策）
    source_items: [AG-008]
    content: |
      Windows PowerShell 環境で gh CLI の WRITE 操作（--body-file / --title）を実行する際、
      コンソールエンコーディングを UTF-8 に初期化する
      （[Console]::OutputEncoding = [System.Text.Encoding]::UTF8, cmd /c chcp 65001 | Out-Null）。
      詳細な手順は SKILL（agentdev-gh-cli）に配置する。

  - id: ACT-REQ-009
    artifact: req
    operation: append
    target: docs/requirements/REQ-0110.md
    target_area: 要件テーブル（worktree・junction 制約時の取扱）
    source_items: [AG-009]
    content: |
      Windows+junction 環境の worktree で .opencode/ が空の場合（junction 未伝播 + .gitignore
      で .opencode/agentdev-* が追跙対象外）、source/projection は手動両辺編集を行い、同期
      スクリプトに依存しない。driver subagent 引き継ぎプロンプトにこの制約を必須項目として明記
      する。詳細手順は SKILL（agentdev-workflow-orchestration）に配置する。

  - id: ACT-REQ-010
    artifact: req
    operation: append
    target: docs/requirements/REQ-0130.md
    target_area: 要件テーブル（case-run・origin/main鮮度・bunxフォールバック・タイムアウト事後処理）
    source_items: [AG-009]
    content: |
      case-run は以下を実施する: (1) 並列 Wave 実行時、各 Wave の worktree 作成前に
      git fetch origin を実行し origin/main の鮮度を確認する、(2) bunx がモジュール解決エラーで
      失敗した場合は npx にフォールバックする、(3) ハーネスタイムアウト時は即 failed ではなく
      「実装完了・検証未完了」として扱い、worktree の git status で未コミット変更を確認し、残留箇所
      の grep と手動修正を行う。詳細手順は SKILL（agentdev-git-worktree,
      agentdev-case-run-execution-adapter）に配置する。

  - id: ACT-REQ-011
    artifact: req
    operation: append
    target: docs/requirements/REQ-0137.md
    target_area: 要件テーブル（並列実行安全・Wave 間 git fetch）
    source_items: [AG-009]
    content: |
      並列 Wave 実行時、Wave 2 以降の worktree は Wave 1 の PR merge 後の origin/main を基準
      とする。Wave 間で git fetch origin を実行し、古い commit 基準の worktree による
      DIRTY/CONFLICTING を防止する。

  # ===== SPEC actions（2件）=====
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity-rule-catalog.md
    target_area: IR-044 req-spec-boundary-violation・exemption 条件詳細
    source_items: [AG-006]
    content: |
      IR-044（req-spec-boundary-violation）の exemption 条件に isDelegationContext を追加する。
      isNegationContext と同列に扱い、委譲/集約/切り出し/存在確認文脈で SPEC キーワード
      （fixture/checker 等）が現れる場合に warning から免除する。exemption 対象キーワードの
      精緻化・true positive 保護の閾値設計（否定文脈と委譲文脈の重なり・境界ケース）を記載する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/system.md
    target_area: ID 体系セクション・IR/REQ ID 桁数規定
    source_items: [AG-007]
    content: |
      ID 体系セクションに IR-NNN（3桁）/ REQ-NNNN（4桁）の対比と正規表現サンプル
      （/^REQ-\d{4}$/, /^IR-\d{3}$/）を追記する。catalog/impact-map パーサ実装で REQ ID を3桁で
      書いてマッチしない不具合（Issue #898）の再発を防止する。

# conflict_resolutions: 壁打ちで解消された衝突（REQ-0138-014）
conflict_resolutions:
  - id: CR-001
    conflict: |
      case-auto G19（draft を SSoT）と case-open Step 18（ドラフト削除）の矛盾。実行エージェント
      が case-open 完了後もドラフトを残置する誤りを発生（RU-0003）。
    resolution: |
      G19 を「req-save 段階のみ draft を SSoT」と限定し、case-open 完了後は子Issue が SSoT
      と明記。AG-003 / ACT-REQ-002 に反映。

  - id: CR-002
    conflict: |
      REQ-0114-065 の工程分岐表記が ADR-0123 Decision #3（spec-save 導入）と矛盾。旧順序
      （req-save → case-open）のまま残存（RU-0004）。
    resolution: |
      REQ-0114 内の工程分岐記述を新ワークフロー（spec-save 含む）に全面的に更新。
      AG-004 / ACT-REQ-003 に反映。

  - id: CR-003
    conflict: |
      Issue #904 完了条件 #4「REQ-0108 Update Notes 記録」と REQ-0101-071（Update Notes 禁止）・
      REQ-0101-073（変更履歴禁止）の衝突（RU-0005）。
    resolution: |
      達成記録先を SPEC/guide（diagnostics-and-maintenance.md・gate-levels.md・REQ-0108-153/154/155）
      に集約し、REQ-0101-071/073 は現行維持（例外セクション設けない）。完了条件文言を標準化。
      AG-005 / ACT-REQ-004 / ACT-REQ-005 に反映。

  - id: CR-004
    conflict: |
      IR-044 の false positive 9/15件。委譲/集約/切り出し文脈で SPEC キーワードが現れ warning が
      発生（RU-0006）。
    resolution: |
      IR-044 に isDelegationContext exemption を追加（isNegationContext と同列）。
      AG-006 / ACT-REQ-006 / ACT-SPEC-001 に反映。

# adr_judgment: ADR判断根拠（Step 5-2・REQ-0138-009 に準拠して記録）
adr_judgment:
  adr_candidates: []
  rationale: |
    全9 RU を精査し、ADR閾値（アーキテクチャ変更・複数システム影響・長期間有効・取り返し
    つかない変更）に達する判断候補なし。各 RU は既存 REQ/ADR/SPEC の範囲内の改善・是正:
    - RU-0001: テストインフラの実装選択（ADR閾値未満・単一モジュール）
    - RU-0002: 機械的ドキュメント更新（docs_chore）
    - RU-0003, RU-0004: ADR-0123（SPEC lifecycle・spec-save 導入）の範囲内の整合性是正
    - RU-0005: REQ-0101-071/073 の現行維持（例外設けず）・記録先標準化
    - RU-0006: integrity ルールの exemption 拡張（詳細実装・ADR閾値未満）
    - RU-0007: 既存 REQ-0101-068 の実践ガイド補強
    - RU-0008: SKILL 手順追加（ADR閾値未満）
    - RU-0009: case-run/worktree 手順追加（詳細実装・ADR閾値未満）
    Step 5-0（既存ADR重複確認）: accepted ADR 16件を照合、重複なし。
    Step 5-1（ADR禁止ゲート）: 全 RU REQ/SPEC 相当。
    Step 5-3（作業手段ADR拒否ゲート）: 該当なし。

# operation_units: 9 RU を14 OU に展開（複数REQ/SPECにまたがる RU を分割・REQ-0102-033〜035, REQ-0136-013）
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-0108
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-0002
    target_req: null
    target_spec: docs/DOC-MAP.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
    # 備考: docs_chore（DOC-MAP は REQ/ADR/SPEC ではない文書探索入口・ADR-0110）。
    # req-save 対象外。case-open が Issue を作成し case-run が DOC-MAP 更新を実施。

  - ou_id: OU-003
    source_ru: RU-0003
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
    # 備考: G19/SSoT 遷移の明確化。command（case-auto.md, case-open.md）の修正も含むが
    # command は反映作業のため artifact_actions 対象外。

  - ou_id: OU-004
    source_ru: RU-0004
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
    # 備考: 工程分岐表記の新ワークフロー更新。同じ REQ-0114 の編集なので OU-003 に順序依存。

  - ou_id: OU-005
    source_ru: RU-0005
    target_req: REQ-0101
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    source_ru: RU-0005
    target_req: REQ-0136
    operation: update
    scale: standard
    depends_on: [OU-005]
    recommended_order: 6
    issue_policy: single
    result: {}
    # 備考: RU-0005 の2つ目（完了条件文言標準化）。記録先標準（OU-005）に依存。

  - ou_id: OU-007
    source_ru: RU-0006
    target_req: REQ-0108
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}
    # 備考: 同じ REQ-0108 の編集なので OU-001 に順序依存。

  - ou_id: OU-008
    source_ru: RU-0006
    target_spec: docs/specs/integrity-rule-catalog.md
    operation: spec-update
    scale: standard
    depends_on: [OU-007]
    recommended_order: 8
    issue_policy: single
    result: {}
    # 備考: exemption 詳細。REQ 要件行（OU-007）に依存。

  - ou_id: OU-009
    source_ru: RU-0007
    target_req: REQ-0102
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}

  - ou_id: OU-010
    source_ru: RU-0007
    target_spec: docs/specs/system.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    result: {}
    # 備考: IR ID 桁数規定。RU-0007 は他に SKILL追記（agentdev-req-file-manager, agentdev-command-authoring,
    # agentdev-adr-file-manager）・command追記（req-define.md, req-save.md）を含むが、これらは
    # 反映作業のため artifact_actions 対象外。case-run が実施。

  - ou_id: OU-011
    source_ru: RU-0008
    target_req: REQ-0107
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    result: {}
    # 備考: RU-0008 は SKILL追記（agentdev-gh-cli）が主作業だが反映作業のため artifact_actions 対象外。

  - ou_id: OU-012
    source_ru: RU-0009
    target_req: REQ-0110
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
    result: {}

  - ou_id: OU-013
    source_ru: RU-0009
    target_req: REQ-0130
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 13
    issue_policy: single
    result: {}

  - ou_id: OU-014
    source_ru: RU-0009
    target_req: REQ-0137
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 14
    issue_policy: single
    result: {}
    # 備考: RU-0009 は他に SKILL追記（agentdev-workflow-orchestration, agentdev-git-worktree,
    # agentdev-case-run-execution-adapter）・command追記（case-run.md）を含むが、これらは
    # 反映作業のため artifact_actions 対象外。case-run が実施。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定・G13）
case_open_hints:
  epic_needed: true
  decomposition: |
    9 RU・14 OU を機能領域別に5バッチに分割可能（参考・case-open が最終決定）:
    - バッチA「case-auto/REQ-0114 整合性」: OU-003, OU-004（RU-0003, RU-0004）
    - バッチB「文書品質・整備」: OU-002, OU-009, OU-010（RU-0002, RU-0007）
    - バッチC「実行インフラ」: OU-001, OU-012, OU-013, OU-014（RU-0001, RU-0009）
    - バッチD「記録・検出精度」: OU-005, OU-006, OU-007, OU-008（RU-0005, RU-0006）
    - バッチE「開発環境」: OU-011（RU-0008）
  wave_hints: |
    技術的依存に基づく Wave 構成候補（参考・case-open が最終決定）:
    - Wave 1（独立・並列可能）: OU-002（DOC-MAP）, OU-005（REQ-0101 記録先標準）,
      OU-009（REQ-0102 ADR番号）, OU-010（system.md IR ID）, OU-011（REQ-0107 文字化け）,
      OU-012（REQ-0110 junction）
    - Wave 2（Wave 1 完了後・依存解消）: OU-001（REQ-0108 copyScripts）,
      OU-003（REQ-0114 G19/SSoT）, OU-013（REQ-0130 case-run手順）, OU-014（REQ-0137 Wave fetch）
    - Wave 3（Wave 2 完了後・同一REQ編集の順序依存）: OU-004（REQ-0114 工程分岐・OU-003依存）,
      OU-006（REQ-0136 完了条件・OU-005依存）, OU-007（REQ-0108 exemption・OU-001依存）
    - Wave 4（Wave 3 完了後）: OU-008（integrity-rule-catalog.md・OU-007依存）

# split_forecast: 生成ドラフトの健全性メトリクス（REQ-0136-011・Step 10-2）
split_forecast:
  measurement_target: draft
  metrics:
    requirement_rows: 11
    concern_categories: 5
    artifact_types: 3
  signals:
    requirement_rows_signal: 0
    concern_categories_signal: 1
    artifact_types_signal: 1
    spec_separation_violation_signal: 0
  total_signal: 2
  recommended_action: |
    合計シグナル 2 → SPLIT 検討（ユーザーへ提案）。ただし本ドラフトは複数 RU を統合管理する
    メタ要件docであり、operation_units で14 OU に分割済み。各 OU の target_req 単位で見ると
    要件行数は1〜2行（SPLIT シグナル 0）。ユーザー意向「case-auto 一括処理」を尊重し、
    ドラフト全体としては統合維持・OU 単位で req-save が処理する方針。
```

# summary

本ドラフトは9件の RU（RU-0001〜RU-0009）を統合管理するメタ要件doc。各 RU は backlog-review で「1:1・関心領域重複なし」と判定された独立論点だが、ユーザー意向「case-auto で一括処理」により1要件docに統合した。

正は `# draft-data` YAML block（REQ-0138-001, ADR-0124）。14の operation_units が各対象 REQ/SPEC への操作を表現し、case-auto が req-save → spec-save → case-open → case-run → case-close を自走する。

**SPLIT シグナル**: 合計2（SPLIT 検討レベル）。ただし各 OU 単位の要件行数は1〜2行で健全。ドラフト全体の肥大化は統合管理による構造上の帰結であり、実装時は OU 単位で処理されるため実害なし。

**ADR判断**: 全9 RU とも既存 REQ/ADR/SPEC の範囲内の改善・是正であり、新規 ADR 不要。

**agentdev_handoff**: 全 RU が AgentDevFlow 本体の配布物（command/skill/SPEC/REQ）に対する改善を含むため true。本リポジトリは agent-dev-flow 本体そのもの（自己ホスト）であり、当該改善は自己ホスト環境での実装対象。

**upstream handoff 扱い（Step 2-1）**: 各 RU は AgentDevFlow 本体・配布 command/skill/template/script の不具合または改善点を対象とするため、`agentdev_handoff: true` を設定（REQ-0102, agentdev-workflow-lifecycle）。本リポジトリは自己ホスト環境であり、upstream handoff 先＝当リポジトリ自身となる。
