---
draft_type: req_draft
topic_slug: case-run-harness-delegation
status: saved
created_at: 2026-06-20T00:00:00+09:00
source_rus:
  - RU-case-run-harness-delegation-meeting
---

<!-- req_draft（REQ-0138, ADR-0124）
     本ドラフトは RU-case-run-harness-delegation-meeting（Prometheus セッション壁打ち合意24項目）
     を入力とし、req-define が Oracle アーキテクチャ確認（agentdev-architecture-advisory）を経て
     構造化した要件ドラフトである。下流処理の正は # draft-data 内 fenced YAML である。 -->

# draft-data

```yaml
# work_type: 既存 case-run 実行モデルの改修・整理・具体化のため maintenance。
# bugfix ではなく新規アーキテクチャ判断も伴わない（ADR-0114 延長線上の精緻化）。
work_type: maintenance

# scale: 単一コマンドスコープ・8ファイル程度の変更。feature のみ正式対象だが参考値として standard。
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）。
summary: >
  case-run コマンドの実行パイプラインを oh-my-openagent に明示的に依存させ、
  ハーネス側に「詳細実行計画策定〜実装〜PR発行」までを委譲する。
  AgentDevFlow 側は Issue と worktree を用意して PR を待つだけの薄いオーケストレーターに徹する。
  ハーネス起動は CLI subprocess（bunx oh-my-openagent run）を採用し、
  ハーネス選定はプロジェクトルート AGENTS.md に記述する。
  抽象IF（SKILL.md・case-run.md・REQ）から momus 言及を削除し、
  references/oh-my-openagent.md に具象実装を分離する。
  REQ-0139-006「QG-3/QG-4 代替ではない」原則はハーネス非依存に抽象化して残留させる（安全境界維持）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される。
# Prometheus セッション24項目の合意を構造的に統合（REQ-0138-008: 必要十分な長文で保持）。
agreed_items:
  - id: AG-001
    content: >
      case-run を oh-my-openagent 明示前提に移行する（抽象「外部実行バックエンド」→具体ハーネス指定）。
      スコープは case-run のみ（case-auto は別途・委譲モデル継承で自動追従）。
      agentdev-case-run-execution-adapter は置き換えず拡張する。
  - id: AG-002
    content: >
      スキル構成は SKILL.md（抽象IF・ハーネス非依存）+ references/oh-my-openagent.md（AgentDevFlow 側が
      oh-my-openagent を呼ぶための実装ノート）の2層とする。SKILL.md は完全ハーネス非依存とし、
      将来別ハーネスを選ぶプロジェクトは references/<harness>.md 増設で対応する（ADR-0104 runtime 独立性準拠）。
  - id: AG-003
    content: >
      ハーネス起動は CLI subprocess（bunx oh-my-openagent run --directory ... --on-complete ... --json）による。
      task(subagent_type="sisyphus") は重複オーケストレーション問題（oh-my-openagent issue #4027）で不採用。
  - id: AG-004
    content: >
      ハーネスに渡す「要件」の形式は Issue 本文（SSoT 原則・ADR-0109 整合）。
      Issue 本文に req-define 壁打ち合意の実行計画方向性（参考情報・レイヤー1）が含まれ得ることは禁止しない。
  - id: AG-005
    content: >
      ハーネス側責任範囲は詳細実行計画策定（レイヤー2）を含む全工程（実行計画策定・情報収集・
      各種レビュー・実装・テスト・PR発行）。エージェント使用の自由度はハーネス側判断に委譲し抽象IFでは規定しない。
  - id: AG-006
    content: >
      AgentDevFlow 側責務は Issue 取得・worktree 準備・ハーネス起動・結果受領・QG-3・クリーンアップのみ。
      worktree 作成・クリーンアップ・blocked/failed 時の worktree 処理・QG-3（PRマージ前実装差分ゲート）は
      case-run 側維持（現状維持）。
  - id: AG-007
    content: >
      抽象IF（SKILL.md・case-run.md・REQ）から momus 言及・momus 確認用実行計画ファイル言及を削除する。
      ただし「ハーネスの実行計画確認は QG-3/QG-4 のいずれの代替にもならない」原則は、
      REQ-0139-006 にハーネス非依存に抽象化して残留させる（安全境界・REQ-0101-069 安定契約例外）。
      momus 固有の記述は references/oh-my-openagent.md のみに局所化する。
  - id: AG-008
    content: >
      「不透明な外部成果物」概念を抽象IFから削除する（PR URL 受領で最終結果は透明化）。
      ただし「plan artifact 内部構造に依存しない・永続状態としない」原則（REQ-0139-007）は維持する。
  - id: AG-009
    content: >
      worktree 隔離 + PR 発行は必須契約（メインブランチ作業禁止・PR 発行＝完了）。
      PR URL 不在時は gh pr list --head <branch> でフォールバックし PR 存在確認を行う。
      デフォルトタイムアウトは1時間。.omo/ 状態は関与しない（worktree 削除時に破棄）。
  - id: AG-010
    content: >
      ハーネス選定はプロジェクトルートの AGENTS.md に記述する（OpenCode 自動読込で確実読み込み）。
      複数プロジェクトで異なるハーネス選定が可能。oh-my-openagent 必須化（シンプルさ優先）・
      不在時は case-run がエラー停止しフォールバック経路は持たない。
      SKILL.md/case-run.md は「AGENTS.md を読んでハーネス選定を取得する」抽象規定を持つ。
  - id: AG-011
    content: >
      実行計画は2レイヤー構造。レイヤー1（req-define 壁打ち合意の方向性・参考情報）は Issue 本文に
      記述可能（ハーネスへの参考情報・束縛しない）。レイヤー2（詳細実行計画）はハーネス責務（.omo/ 等・
      AgentDevFlow 側は関与しない）。
  - id: AG-012
    content: >
      ADR-0114 は UPDATE 不要・新規 ADR 不要（REQ/SPEC/実装ファイル更新のみで対応）。
      ADR-0114 の「外部実行バックエンド委譲」判断は維持し、本要件はその延長線上の精緻化である。
      REQ-0139-006 抽象化残留により ADR-0114 65行目の REQ-0139-006 参照は有効なまま維持される（dangling 回避）。

# artifact_actions: REQ/ADR/SPEC への保存対象を1つの配列に統合（REQ-0138-009）。
# spec-save は docs/specs/** のみ編集可能（spec-save G02/G03）のため、
# SKILL.md・case-run.md・AGENTS.md・references/ の実装ファイル変更は
# artifact_actions ではなく実装スコープセクション（本文末尾）に配置する。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0130
    source_items: [AG-001, AG-003, AG-004, AG-005, AG-007, AG-009, AG-010, AG-011]
    content: |
      REQ-0130（case-run / 実装パイプライン）UPDATE:
      【削除】REQ-0130-014「case-run は oh-my-openagent 利用時・実行計画ファイル作成時に実装開始前に momus 確認を依頼すること」
      （ハーネス内部処理化により抽象IFから除去・AG-007）
      【追加要件行】以下の要件を行を REQ-0130 要件テーブルに追加:
      ・case-run は AGENTS.md で指定されたハーネス（推奨: oh-my-openagent）を前提とすること（AG-001, AG-010）
      ・ハーネス起動は CLI subprocess（bunx oh-my-openagent run --directory ... --on-complete ... --json）によること（AG-003）
      ・ハーネスに渡す「要件」は Issue 本文であり、実行計画方向性の参考情報が含まれ得ること（AG-004, AG-011）
      ・ハーネス側は詳細実行計画策定を含む全工程を担当すること（AG-005）
      ・デフォルトタイムアウトは1時間とすること（AG-009）
      ・PR URL 不在時は gh pr list --head <branch> でフォールバックして PR 存在確認を行うこと（AG-009）
      ・ハーネス不在時は case-run がエラー停止すること（AG-010）
      【適用範囲更新】対象に「ハーネス起動方式（CLI subprocess）・AGENTS.md ハーネス選定参照・PR URL フォールバック・1時間タイムアウト」を追加

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0139
    source_items: [AG-001, AG-003, AG-007, AG-008, AG-010]
    content: |
      REQ-0139（外部エージェント統合契約）UPDATE:
      【修正】REQ-0139-006 を完全削除せず、ハーネス非依存に抽象化して残留させる（AG-007・安全境界維持・REQ-0101-069）:
        旧: 「momusは実装開始前の実行計画確認を担う外部エージェントであり、QG-3（実装差分確認）・QG-4（完了条件チェックボックス最終評価）のいずれの代替にもならないこと」
        新: 「ハーネスの実行計画確認は QG-3（実装差分確認）・QG-4（完了条件チェックボックス最終評価）のいずれの代替にもならないこと。ハーネス固有の実行計画確認の取扱いは references/<harness>.md 参照」
      【追加要件行】以下の要件を行を REQ-0139 要件テーブルに追加:
      ・外部実行手段は抽象IFではハーネス非依存とし、AGENTS.md で具体ハーネスを選定する機構を要件化すること（AG-010）
      ・デフォルトハーネスとして oh-my-openagent を推奨すること（AG-001）
      ・oh-my-openagent 利用時の momus 統合等のハーネス固有詳細は references/oh-my-openagent.md に記載すること（AG-002, AG-007）
      ・CLI subprocess 契約（bunx oh-my-openagent run）を前提とすること（AG-003）
      【適用範囲更新】対象に「AGENTS.md ハーネス選定機構・CLI subprocess 契約」を追加

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0119
    source_items: [AG-002, AG-010]
    content: |
      REQ-0119（コマンド・スキル・サブエージェント責務分界）UPDATE:
      【修正】REQ-0119-031 を拡張（既存の責務限定記述に追加）:
        旧: 「agentdev-case-run-execution-adapter は case-run の外部実行手段接続に責務を限定する公開スキルであり、req-define architecture 確認・ADR 判断・workflow 状態管理・Issue 完了条件評価を対象外とすること」
        新: 上記に加え「SKILL.md はハーネス非依存の抽象IFとし、ハーネス固有の実装詳細は references/<harness>.md に配置すること。プロジェクトルートの AGENTS.md でハーネスを選定・指定すること。将来別ハーネスを選ぶプロジェクトは references 増設で対応すること」（AG-002, AG-010）

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/workflow-contracts.md
    target_area: "サブエージェントプロトコル（case-run 専用）・起動仕様（509-538行付近）"
    source_items: [AG-003, AG-010]
    content: |
      docs/specs/workflow-contracts.md「サブエージェントプロトコル（case-run 専用）」セクションの起動仕様を更新:
      【修正】起動仕様を task(category="unspecified-high", run_in_background=true, prompt="...") から
      CLI subprocess（bunx oh-my-openagent run --directory ... --on-complete ... --json）に変更（AG-003）。
      AGENTS.md で指定されたハーネスを読み込んで起動する旨を追加（AG-010）。
      プロンプト構成・親エージェント責務・フォールバック記述も CLI subprocess 起動方式に整合するよう更新。
      ※ RU は「影響確認必要」としていたが、起動仕様が CLI subprocess と直接矛盾するため確定 UPDATE（Oracle RISK A・HIGH）。

# conflict_resolutions: 壁打ち・Oracle 分析で解消された衝突の記録（REQ-0138-014）
conflict_resolutions:
  - id: CR-001
    conflict: >
      RU合意は REQ-0139-006（momus は QG-3/QG-4 代替ではない）の完全削除を指示していたが、
      完全削除すると ADR-0114 65行目の REQ-0139-006 参照が dangling reference になる。
      また「QG-3/QG-4 代替ではない」原則はハーネス非依存の安全境界（REQ-0101-069 安定契約例外）であり、
      REQ レベルから消失すると安全境界が不明確になる。
    resolution: >
      Oracle アーキテクチャ確認（HIGH）に基づき、REQ-0139-006 を完全削除せず
      ハーネス非依存に抽象化して残留させる。「QG-3/QG-4 代替ではない」原則は維持し、
      momus 固有記述のみ references/oh-my-openagent.md に局所化。
      ADR-0114 UPDATE 不要（RU合意#4維持）・dangling reference 回避・安全境界維持の三者を両立。
  - id: CR-002
    conflict: >
      RU合意は workflow-contracts.md を「影響確認必要」（UPDATE 要否不明）としていたが、
      同ファイル 509-538行の起動仕様 task(category="unspecified-high") が CLI subprocess（合意#14）と直接矛盾。
      UPDATE しないと SPEC と実装が矛盾したまま残り docs-check/inspect-skills 検出対象になる。
    resolution: >
      Oracle 確定（HIGH）に基づき、workflow-contracts.md を artifact_actions に ACT-SPEC-001 として追加。
      起動仕様セクションを CLI subprocess 起動方式に UPDATE する。
      併せて確認: case-auto.md（RISK B）・subagent-protocol.md（RISK A 延長）は UPDATE 不要を確認済み。
  - id: CR-003
    conflict: >
      RU合意の artifact_actions は SKILL.md・case-run.md・AGENTS.md・references/oh-my-openagent.md を
      artifact: spec としていたが、spec-save G02/G03 は docs/specs/** のみ編集を許可し src/ 配下・
      プロジェクトルートは編集禁止。これらを artifact: spec に配置すると spec-save が処理できない。
    resolution: >
      SKILL.md・case-run.md・AGENTS.md・references/oh-my-openagent.md の変更を artifact_actions から除外し、
      実装スコープセクション（本文末尾・Step 9-1 実装詳細の分離）に配置。
      これらは case-run が REQ 要件行 + Issue 受け入れ基準に基づき実装する。
      artifact: spec は docs/specs/ ファイル（workflow-contracts.md）のみとする。

# operation_units: 単一ケース（single Issue）で完結。REQ 操作 3件 + SPEC 操作 1件。
# 実装ファイル変更（SKILL.md・case-run.md・AGENTS.md・references/）は case-run 実装スコープ。
operation_units:
  - ou_id: OU-001
    source_ru: RU-case-run-harness-delegation-meeting
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-case-run-harness-delegation-meeting
    target_req: REQ-0139
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-case-run-harness-delegation-meeting
    target_req: REQ-0119
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-case-run-harness-delegation-meeting
    target_spec: docs/specs/workflow-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定）
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
  implementation_scope_note: >
    本ケースの実装スコープ（case-run 参照用）は本ドラフト本文末尾「実装スコープ」セクションに詳述。
    SKILL.md・case-run.md・AGENTS.md・references/oh-my-openagent.md の実装ファイル変更を含む。
```

# summary

本ドラフトは、case-run コマンドの実行パイプラインを oh-my-openagent に明示的に依存させる要件を構造化したものである。Prometheus セッションでの壁打ち合意24項目（RU-case-run-harness-delegation-meeting）を入力とし、Oracle アーキテクチャ確認を経て3点の技術的精査を反映した：

1. **REQ-0139-006 抽象化残留**（RU合意は完全削除→抽象化に修正）: 「QG-3/QG-4 代替ではない」原則はハーネス非依存の安全境界（REQ-0101-069 安定契約例外）であり REQ レベルに残留。ADR-0114 dangling reference 回避と安全境界維持を両立。

2. **workflow-contracts.md UPDATE 確定**（RU合意は「影響確認」→確定 UPDATE に格上げ）: 起動仕様 `task(category="unspecified-high")` が CLI subprocess と直接矛盾するため、ACT-SPEC-001 として artifact_actions に追加。

3. **artifact: spec スコープ修正**（RU構造の訂正）: spec-save は `docs/specs/**` のみ編集可能（G02/G03）のため、SKILL.md・case-run.md・AGENTS.md・references/ の実装ファイル変更を artifact_actions から実装スコープセクションへ分離。

ADR判断は「新規 ADR 不要・ADR-0114 UPDATE 原則不要」（Oracle 確定・RU合意#4と整合）。work_type は maintenance・scale は standard。

# 実装スコープ（case-run 参照用・Step 9-1 実装詳細の分離）

<!-- artifact_actions の content とは分離された実装詳細セクション（REQ-0102-057）。
     これらのファイル変更は spec-save 対象外（docs/specs/** 以外）のため case-run が実装する。
     REQ 要件行（REQ-0130/0139/0119 UPDATE）+ Issue 受け入れ基準に基づき実装すること。 -->

## 拡張・更新ファイル

### 1. `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`（UPDATE）

- **momus セクション削除**: 「momus を使う条件」セクション（42-49行付近）を削除。momus 確認は references/oh-my-openagent.md へ移動（AG-007）
- **「外部成果物の不透明性」セクション再作業**: 「不透明な外部成果物」概念を削除（PR URL 受領で透明化・AG-008）。ただし「plan artifact 内部構造に依存しない」原則は REQ-0139-007 参照で維持。過削除防止: (a)結果は不透明（削除対象）と (b)plan artifact 内部に依存しない（維持対象）を混同しないこと
- **抽象IF規定追加**: 「AGENTS.md で指定されたハーネスを読み込んで起動する」旨の抽象規定を追加（AG-010）
- **CLI subprocess 起動方式の抽象規定追加**: 具体コマンド（bunx ...）は references/ に委譲し、SKILL.md では「CLI subprocess によりハーネスを起動する」抽象規定にとどめる（AG-003, AG-002）
- **Issue 本文実行計画方向性**: 「Issue 本文に実行計画の方向性（参考情報）が含まれ得る」旨を明記（AG-004, AG-011）
- **ハーネス契約明確化**: 入力・出力・副作用境界・capture handoff を明確化

### 2. `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`（CREATE・新規）

AgentDevFlow 側から oh-my-openagent を呼ぶための実装ノート。RU 第5節の構成案に従う:

1. 概要（AgentDevFlow 側が oh-my-openagent を呼ぶための実装ノート）
2. 起動方式（CLI subprocess）: `bunx oh-my-openagent run --directory ... --on-complete ... --json`・task(subagent_type) 不採用理由（issue #4027）
3. worktree 取り扱い: `--directory` で worktree パス渡し・`.omo/` は関与しない（破棄）
4. PR 作成と URL 受領: プロンプトで `gh pr create` 指示・`--on-complete` で PR URL を結果ファイルに書込み・フォールバック `gh pr list --head <branch>`
5. blocked / failed 通知: 構造化結果出力（`<RESULT>...</RESULT>`）・終了コード・stderr 活用
6. タイムアウト・中断: timeout コマンドで1時間・中断時の worktree クリーンアップは case-run 側
7. 完全起動スクリプト例
8. 懸念点・未検証事項（RU 第8節の技術検証項目参照）

※ 読者は AgentDevFlow の case-run 実装者（AgentDevFlow メンテナ）。ハーネス実装者向けではない。
※ 本ファイルは oh-my-openagent 選定プロジェクトでのみ参照される。別ハーネス選定プロジェクトは対応する references/<harness>.md を作成する。

### 3. `src/opencode/commands/agentdev/case-run.md`（UPDATE）

- **G28 削除**: momus 確認ガードレール（REQ-0139-006 参照）を削除（AG-007）
- **Step 5 momus 言及削除**: 「momus 実行計画確認（oh-my-openagent 利用時）」段落（78行付近）を削除
- **G26「不透明な外部成果物」修正**: plan artifact 内部構造非依存原則は維持しつつ「不透明」概念を削除（AG-008）
- **CLI subprocess 起動方式参照追加**: Step 5 に CLI subprocess 起動方式の参照を追加（AG-003）
- **AGENTS.md ハーネス指定参照追加**: AGENTS.md のハーネス指定を参照する旨を追加（AG-010）

### 4. `AGENTS.md`（プロジェクトルート・UPDATE）

新規セクション「ハーネス選定」を追加:

- 本プロジェクトが case-run 実行ハーネスとして oh-my-openagent を選定する旨
- 起動方法の詳細は `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md` 参照の旨
- oh-my-openagent 不在時は case-run がエラー停止する旨

※ AgentDevFlow を利用する各プロジェクトは、自分の AGENTS.md でハーネスを選定する。agent-dev-flow リポジトリの AGENTS.md には、デフォルトとして oh-my-openagent を選定する旨を記述する。

### 5. `docs/specs/workflow-contracts.md`（UPDATE・spec-save 対象 ACT-SPEC-001）

※ このファイルは `docs/specs/` 配下のため spec-save が処理する（ACT-SPEC-001）。case-run は直接編集しない。

「サブエージェントプロトコル（case-run 専用）」セクション（509-538行付近）の起動仕様を更新:
- `task(category="unspecified-high", run_in_background=true)` → CLI subprocess（AGENTS.md ハーネス参照）
- プロンプト構成・親エージェント責務・フォールバック記述も CLI subprocess 起動方式に整合するよう更新

## UPDATE 不要確認済みファイル（RU 第6節懸念の解消）

| ファイル | 確認結果 |
|----------|----------|
| `src/opencode/commands/agentdev/case-auto.md` | **UPDATE 不要**（RISK B 解消）。独自の task(...)・momus 指定なし。case-run 委譲モデルを参照するのみ（Step 4・G07）。case-run.md 更新で自動追従 |
| `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` | **UPDATE 不要**（RISK A 延長 解消）。「Subagent Edit Safety Protocol」（ファイル編集安全手順）であり起動仕様記述なし |
| `docs/adr/ADR-0114.md` | **UPDATE 原則不要**（RU合意#4 維持・Oracle MEDIUM-HIGH）。65行目の意味ドリフトは「結果・影響」セクションの歴史コンテキストとして受容。REQ-0139-006 抽象化残留により参照は有効 |

## 技術検証事項（case-run 実装時に検証・RU 第8節）

1. Sisyphus の PR 発行能力: プロンプトで `gh pr create` 指示時の確実性
2. CLI subprocess と OpenCode セッションの協調安定性
3. タイムアウト到達時の Sisyphus プロセス終了と worktree クリーンアップ確実性
4. 構造化結果出力（`<RESULT>...</RESULT>`）の信頼性・フォーマット揺らぎ耐性
