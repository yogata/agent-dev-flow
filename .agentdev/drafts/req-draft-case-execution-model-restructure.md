# 要件ドラフト: case実行モデル再編成

**topic-slug**: case-execution-model-restructure
**source RU**: RU-20260618-02, RU-20260618-03
**created**: 2026-06-19

---

## 目的

AgentDevFlow の大規模 Epic 実行モデルを再編成する。現行モデルでは case-auto が case-run の Epic Orchestrator mode に Wave 単位の一括実行を委ね、req-define が execution_groups として Epic 構成提案を出力する。本変更は、(1) case-open が要件から Epic/Wave/Issue 構造を自律生成する責務を確立し、(2) case-auto を薄いオーケストレーター化して子Issue単位の委譲で進行する実行モデルに移行する。これにより、親コンテキストへの実装詳細累積を防ぎ、永続状態ベースでの進行・再開を可能にする。

---

## 壁打ち分析サマリー

### 未決分岐と解決（evidence-first, Inferred）

| 分岐 | 解決 | 根拠 |
|------|------|------|
| execution_groups / depends_on / recommended_order の扱い | **(C) execution_groups を req-define 出力から削除。operation_units・depends_on・recommended_order は REQ 操作の構成単位として維持。case-open が自律生成。** | RU-03 が case-open の自律生成を明示。REQ-0102-019 が既に case-open の責務を規定。operation_units は「どの REQ 操作を行うか」の構成単位であり実装順序ではない。execution_groups は Epic/Issue 構成（実行構造）であり case-open の責務。 |
| case-run Epic Orchestrator mode の扱い | **完全廃止。RU-02 の単一Issue実行モデルに置換。** | RU-02 受け入れ条件: 「case-run は、渡された1 Issueの実装に閉じる」。Wave 一括実行と単一Issue委譲は根本的に非互換。後方互換のレガシーモードは両 RU とも言及なし。 |
| status 体系の置き換え | **SPEC concern。REQ は原則のみ定義（実行状態ライフサイクルの存在・skipped除外・Wave status 導出）。enum 値・表示形式は SPEC が定義。** | RU-03 が status enum を SPEC concern に分類。現行 emoji ベース（workflow-contracts.md）は SPEC 更新で置き換え。REQ-0106-030 は原則レベルに UPDATE。 |

---

## 既存REQ照合結果

### Step 3-1: 定量的データ検証

active REQ 28件（REQ-0101〜REQ-0136、8件 retired）が docs/README.md 記載と一致。乖離なし。

### Step 3-2: SPLIT 予兆計測

| 対象 REQ | 要件行数 | 行数ｼｸﾞﾅﾙ | 関心分類ｼｸﾞﾅﾙ | artifact種別ｼｸﾞﾅﾙ | 合計 | 推奨 |
|----------|---------|-----------|---------------|-------------------|------|------|
| REQ-0114 | 68 | +1 | +1 (lifecycle混在) | +1 (command+skill+template) | **+3** | SPLIT推奨 |
| REQ-0104 | 52 | +1 | +1 (workflow+handoff+Issue) | +1 (command+skill+template) | **+3** | SPLIT推奨 |
| REQ-0102 | 56 | +1 | +1 (req-define+req-save) | +0 | **+2** | SPLIT検討 |
| REQ-0132 | 6 | +0 | +0 | +0 | **+0** | APPEND許可 |
| REQ-0130 | 9 | +0 | +0 | +0 | **+0** | APPEND許可 |
| REQ-0106 | 5 | +0 | +0 | +0 | **+0** | APPEND許可 |

**SPLIT 提案**: REQ-0114 と REQ-0104 は SPLIT 推奨（合計+3）である。しかし今回の変更は対象 REQ の責務領域への直接的な追加・修正であり、SPLIT は別途 requirements review 課題として扱う。本次件では UPDATE/APPEND を実施し、SPLIT を split-forecast に記録する。

---

## ADR判断

**ADR不要**。変更は command 動作仕様の変更・workflow 定義の変更・status enum の SPEC 更新であり、技術スタック選定・認証方式・データモデル変更を含まない。ADR作成不可条件（command動作仕様・workflow定義・入出力形式変更）に該当する。

---

## 要件

### OU-01: case-open 構成生成責務の自律化（from RU-20260618-03）

#### REQ-0132 への APPEND

| ID | 要件 |
|---|---|
| REQ-0132-007 | `case-open` は、要件doc の要件を満たすための GitHub Issue 構造として、Epic / Wave / Issue / 依存関係 / 初期status を自律生成すること |
| REQ-0132-008 | `case-open` は、実装順序・Issue分解・Wave構成の判断をユーザー確認事項としないこと |
| REQ-0132-009 | `case-open` は、機能要件・非機能要件・制約・対象外・受け入れ条件を新規に作成しないこと |
| REQ-0132-010 | `case-open` は、要件が曖昧で Issue 構造を生成できない場合に停止すること |

#### REQ-0104 の UPDATE

| ID | 変更後要件 |
|---|---|
| REQ-0104-029 (UPDATE) | `case-open` は複数 OU が存在する場合、要件分析に基づいて自律的に Epic Issue および子 Issue 構造を生成すること。execution_groups 提案に依存せず構成を決定できること |
| REQ-0104-039 (UPDATE) | `case-open` は要件doc の operation_units を読み取り、要件分析に基づいて Epic / Wave / Issue 構造を自律生成すること。req-define の出力は参考情報とし、case-open が最終構造を決定すること |
| REQ-0104-040 (UPDATE) | `case-open` は自律的な要件分析に基づいて Epic Issue を作成すること。ただし機能要件・非機能要件・対象外・受け入れ条件を新規に作成しないこと |
| REQ-0104-041 (UPDATE) | `case-open` は複数 OU が存在する場合、要件分析に基づいて Epic Issue および子 Issue 構造を生成すること |

#### REQ-0102 の UPDATE

| ID | 変更後要件 |
|---|---|
| REQ-0102-038 (UPDATE) | Epic / Wave / Issue 構成の生成は `case-open` の責務であり、`req-define` は execution_groups セクションを出力しないこと |

#### REQ-0106 の UPDATE

| ID | 変更後要件 |
|---|---|
| REQ-0106-030 (UPDATE) | 子Issue は実行状態ライフサイクルを持ち、⏭スキップ を終了状態として採用しないこと。Wave status は保存対象ではなく、Wave 内 Issue 状態から導出すること |

---

### OU-02: case-auto 子Issue単位オーケストレーション（from RU-20260618-02）

#### REQ-0114 の UPDATE

| ID | 変更後要件 |
|---|---|
| REQ-0114-045 (UPDATE) | `case-auto` は Epic Issue から子Issue一覧・状態を読み取り、実行可能な1子Issue を選択して `case-run` に渡すこと。Wave全体の一括実行を case-run に委ねないこと |
| REQ-0114-046 (UPDATE) | `case-auto` は `case-run` の完了後、永続状態（Issue / PR / `.agentdev/`）から子Issue の完了・失敗・停止結果を確認し、完了した子Issue に対して case-close 相当処理を順次実行すること |
| REQ-0114-047 (UPDATE) | `case-auto` は case-run が失敗・停止を報告した場合、正常完了した子Issue のみに対して case-close 相当処理を実行すること（失敗・停止された子Issue の case-close は回避すること）。部分完了の報告には成功・失敗それぞれの子Issue一覧を含めること |
| REQ-0114-048 (UPDATE) | `case-auto` は全子Issue の case-close 相当処理が完了（成功または停止条件による中断）、かつ Epic Issue の状態が更新された場合のみ全体完了とすること（未完了の子Issue が残存する状態での全体完了報告は回避すること） |

#### REQ-0114 への APPEND

| ID | 要件 |
|---|---|
| REQ-0114-073 | `case-auto` は Epic 全体の実装詳細を親コンテキストに累積させず、永続状態から進行・再開できること |
| REQ-0114-074 | `case-auto` は子Issue 完了後に永続状態を再読込し、次の実行対象を選択できること |
| REQ-0114-075 | `case-auto` は case-open が生成した Epic / Wave / Issue 構造に従って進行すること |

#### REQ-0130 への APPEND

| ID | 要件 |
|---|---|
| REQ-0130-010 | `case-run` は case-auto から指定された1 Issue の実装に閉じ、他Issue の実装履歴や Epic 全体の実装過程を前提としないこと |
| REQ-0130-011 | `case-run` は1 Issue 単位で実装作業をサブエージェントへ委譲できること |
| REQ-0130-012 | 子Issue の完了・失敗・停止結果は親コンテキストではなく永続状態（Issue / PR / `.agentdev/`）に記録されること |

---

## SPEC候補

- **SC-001**: OU / Epic / Wave / Issue の階層関係定義（小規模OU → Issue、中規模OU → Epic → Issue、大規模OU → Epic → Wave → Issue）
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: データモデル・構造定義（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「OU / Epic / Wave / Issue の関係定義」

- **SC-002**: 子Issue status enum（pending / ready / running / completed / blocked / failed）の定義と状態遷移表
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: enum 値一覧・判定表（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「子Issueのstatus enum」

- **SC-003**: skipped status 除外の機械的扱いと、Wave status を Issue 状態から導出する規則
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 判定表・ルール定義（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「skipped をstatus enumに含めない」「Wave status を保存せず、Issue状態から導出する規則」

- **SC-004**: Epic Issue 本文の状態表フォーマット（分解テーブル・Waveテーブル・ステータス追跡）
  - 想定配置先SPEC: `docs/specs/system.md`, `docs/specs/workflow-contracts.md`
  - 分離根拠: フォーマット定義・template variant（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「Epic Issue 本文の状態表」

- **SC-005**: case-open が Issue 分解を行う基準・依存関係を設定する基準・初期status を設定する規則
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 判定基準・内部アルゴリズム（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「case-open がIssue分解を行う基準」「依存関係を設定する基準」「初期statusを設定する規則」

- **SC-006**: case-open が停止する条件の詳細（要件曖昧性の具体的判定基準）
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 判定表・停止条件（REQ-0101-068）
  - 元候補: RU-20260618-03 SPEC concern「case-open が停止する条件」

- **SC-007**: case-auto が読み取る永続状態の種類・次Issueを選択する入力・case-run に渡す最小入力
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: I/O契約・内部パラメータ（REQ-0101-068）
  - 元候補: RU-20260618-02 SPEC concern「case-auto が読み取る永続状態の種類」「次Issueを選択する入力」「case-run に渡す最小入力」

- **SC-008**: case-run がサブエージェントへ渡す1 Issue単位の委譲入力・結果を Issue / PR / `.agentdev/` へ永続化する形式
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: I/O契約・内部パラメータ（REQ-0101-068）
  - 元候補: RU-20260618-02 SPEC concern「case-run がサブエージェントへ渡す1 Issue単位の入力」「結果を永続化する形式」

- **SC-009**: blocked / failed / completed の状態遷移と、親コンテキストに実装過程ログを持ち越さないための出力契約
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 判定表・出力契約（REQ-0101-068）
  - 元候補: RU-20260618-02 SPEC concern「blocked / failed / completed の扱い」「親コンテキストに持ち越さないための出力契約」

---

## 適用範囲

- **対象**:
  - case-open の自律構成生成責務（Epic / Wave / Issue / 依存関係 / 初期status）
  - case-auto の薄いオーケストレーター化（子Issue単位選択・委譲・永続状態ベース進行）
  - case-run の1 Issueスコープ実行・サブエージェント委譲
  - req-define の execution_groups 出力停止
  - ⏭スキップ終了状態の廃止・Wave status 導出化
  - 子Issue 実行状態ライフサイクルの定義
  - Epic Orchestrator mode の廃止（case-run から削除、case-auto の子Issue選択ロジックへ置換）
  - workflow-contracts.md / system.md の SPEC 更新（status enum・構造定義・状態表フォーマット）
- **対象外**:
  - コンパクション実行そのもののコマンド要件化（コンパクション耐性は永続状態契約の副次的效果）
  - 並列実行の導入
  - case-open / case-run / case-auto のコマンド定義ファイルの具体的編集（実装作業）
  - PR の具体的な差分作成手順
  - 1 Issue 内の詳細な実装手順
  - issue_desc_epic.md テンプレートの具体的編集内容（実装作業）
  - agentdev-workflow-orchestration / agentdev-epic-tracker スキルの具体的編集内容（実装作業）

---

## operation_units

```yaml
operation_units:
  - ou_id: OU-01
    source_ru: RU-20260618-03
    target_req: [REQ-0132, REQ-0104, REQ-0102, REQ-0106]
    target_spec: [docs/specs/workflow-contracts.md, docs/specs/system.md]
    operation: append, update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:

  - ou_id: OU-02
    source_ru: RU-20260618-02
    target_req: [REQ-0114, REQ-0130]
    target_spec: [docs/specs/workflow-contracts.md]
    operation: update, append
    scale: large
    depends_on: [OU-01]
    recommended_order: 2
    issue_policy: epic
    result:
```

---

## execution_groups

```yaml
execution_groups:
  - id: EG-01
    type: related-changes
    purpose: case実行モデル再編成（構成生成責務の自律化 + 子Issue単位オーケストレーション）
    included_ou: [OU-01, OU-02]
    rationale: >
      OU-01（case-open構成生成責務）と OU-02（case-auto子Issue単位オーケストレーション）は、
      大規模Epic実行モデルの再編成という共通テーマで関連する。
      ただし責務領域が明確に分離されており、個別REQ操作として独立実行可能。
      OU-02 は OU-01 の定義する Issue 構造を消費するため、OU-01 を先に処理することが推奨される。
```

---

## draft-meta

```yaml
draft-meta:
  work_type: feature
  req-operation:
    - ou_id: OU-01
      operations:
        - target_req: REQ-0132
          operation: append
          lines: [REQ-0132-007, REQ-0132-008, REQ-0132-009, REQ-0132-010]
        - target_req: REQ-0104
          operation: update
          lines: [REQ-0104-029, REQ-0104-039, REQ-0104-040, REQ-0104-041]
        - target_req: REQ-0102
          operation: update
          lines: [REQ-0102-038]
        - target_req: REQ-0106
          operation: update
          lines: [REQ-0106-030]
    - ou_id: OU-02
      operations:
        - target_req: REQ-0114
          operation: update
          lines: [REQ-0114-045, REQ-0114-046, REQ-0114-047, REQ-0114-048]
        - target_req: REQ-0114
          operation: append
          lines: [REQ-0114-073, REQ-0114-074, REQ-0114-075]
        - target_req: REQ-0130
          operation: append
          lines: [REQ-0130-010, REQ-0130-011, REQ-0130-012]
  adr-required: false
  adr-rationale: >
    command 動作仕様の変更・workflow 定義の変更・status enum の SPEC 更新。
    技術スタック選定・認証方式・データモデル変更を含まない。
    ADR作成不可条件（command動作仕様・workflow定義・入出力形式変更）に該当。
  topic-slug: case-execution-model-restructure
  scale: large
  scale-rationale: >
    複数REQ（6件）にまたがる変更。影響ファイル: case-auto.md, case-open.md, case-run.md,
    req-define.md, workflow-contracts.md, system.md, agentdev-workflow-orchestration,
    agentdev-epic-tracker, issue_desc_epic.md（9ファイル超）。
  spec-candidates:
    - sc-id: SC-001
      content: "OU / Epic / Wave / Issue の階層関係定義"
      intended_spec: docs/specs/workflow-contracts.md
      classification: データモデル・構造定義
      source: RU-20260618-03
    - sc-id: SC-002
      content: "子Issue status enum と状態遷移表"
      intended_spec: docs/specs/workflow-contracts.md
      classification: enum 値一覧・判定表
      source: RU-20260618-03
    - sc-id: SC-003
      content: "skipped除外・Wave status 導出規則"
      intended_spec: docs/specs/workflow-contracts.md
      classification: 判定表・ルール定義
      source: RU-20260618-03
    - sc-id: SC-004
      content: "Epic Issue 本文の状態表フォーマット"
      intended_spec: docs/specs/system.md, docs/specs/workflow-contracts.md
      classification: フォーマット定義
      source: RU-20260618-03
    - sc-id: SC-005
      content: "case-open の Issue 分解基準・依存関係設定基準・初期status設定規則"
      intended_spec: docs/specs/workflow-contracts.md
      classification: 判定基準・内部アルゴリズム
      source: RU-20260618-03
    - sc-id: SC-006
      content: "case-open の停止条件の詳細"
      intended_spec: docs/specs/workflow-contracts.md
      classification: 判定表・停止条件
      source: RU-20260618-03
    - sc-id: SC-007
      content: "case-auto が読み取る永続状態・次Issue選択入力・case-run への最小委譲入力"
      intended_spec: docs/specs/workflow-contracts.md
      classification: I/O契約・内部パラメータ
      source: RU-20260618-02
    - sc-id: SC-008
      content: "case-run からサブエージェントへの1 Issue単位委譲入力・結果永続化形式"
      intended_spec: docs/specs/workflow-contracts.md
      classification: I/O契約・内部パラメータ
      source: RU-20260618-02
    - sc-id: SC-009
      content: "blocked / failed / completed 状態遷移・親コンテキスト非累積の出力契約"
      intended_spec: docs/specs/workflow-contracts.md
      classification: 判定表・出力契約
      source: RU-20260618-02
  split-forecast:
    thresholds_ref: docs/specs/req-health-metrics.md
    targets:
      - target: REQ-0114
        metrics:
          requirement_lines: 68
          concern_signals: 2
          artifact_types: 3
        signals:
          line_count: +1
          concern_classification: +1
          artifact_types: +1
        total: 3
        recommended_action: SPLIT推奨（別途requirements review課題）
      - target: REQ-0104
        metrics:
          requirement_lines: 52
          concern_signals: 2
          artifact_types: 3
        signals:
          line_count: +1
          concern_classification: +1
          artifact_types: +1
        total: 3
        recommended_action: SPLIT推奨（別途requirements review課題）
      - target: REQ-0102
        metrics:
          requirement_lines: 56
          concern_signals: 2
          artifact_types: 2
        signals:
          line_count: +1
          concern_classification: +1
          artifact_types: +0
        total: 2
        recommended_action: SPLIT検討（別途requirements review課題）
      - target: draft
        metrics:
          requirement_lines: 17
          concern_signals: 1
          artifact_types: 2
        signals:
          line_count: +0
          concern_classification: +0
          artifact_types: +0
        total: 0
        recommended_action: no-action
  spec-saved: true
  status: saved
```

---

## QG-1 検証結果

| 検査観点 | 結果 | 備考 |
|----------|------|------|
| REQ/SPEC 分類 | PASS | 全要件行は外部契約・状態要件。SC-001〜009 は詳細パラメータとして SPEC 分離 |
| ADR ゲート | PASS | ADR不要（command動作仕様・workflow定義の変更） |
| チェックボックス測可能性 | PASS | 全要件行は客観的検証可能（case-open生成動作・case-auto選択動作・case-run委譲動作） |
| 必須セクション完全性 | PASS | 目的・要件・適用範囲の【必須】構造あり |
| SPEC候補分離妥当性 | PASS | SC-001〜009 は REQ-0101-068 SPEC分離基準に合致。安定契約例外（REQ-0101-069）該当なし |
