---
title: Workflow Skill Model
status: draft
created: 2026-08-10
updated: 2026-08-22
---
<!-- ADF-COVERS(implementation): REQ-002-001, REQ-002-002, REQ-002-003, REQ-002-004, REQ-002-017, REQ-002-018, REQ-002-034 -->
<!-- ADF-COVERS(implementation): REQ-027-001, REQ-027-002, REQ-027-003 -->

# Workflow Skill Model

## 目的

Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約を定義する。
DEC-010（責務3層分化と1:N分割原則）の実装詳細を正規所有する。
本 Design は REQ-027-001 に基づき Capability Skill model（定義・配置・参照契約・1:N分割基準・依存方向）の正規所有者となる。
REQ-027 は境界宣言のみを持ち、本節が詳細実装を正規所有する。

## Command 責務

公開interface（入出力契約・ガードレール）、workflow dispatch。
workflow 実装本体は所有しない。

### thin Command の workflow 節標準構造

thin Command の workflow 節は次の3要素で構成する。

1. Workflow Skill 名レベルの dispatch 宣言（委譲先 Workflow Skill 名と委譲範囲の宣言。内部構造（STEP ID、reference パス）への直接依存を持たない）
2. 公開順序の要約（順序ラベル付きの見出し群。Workflow Skill 内部手順の複製ではなく、公開interface としての順序提示）
3. soft guard 宣言（Workflow Skill の単独起動防止宣言。後述「soft guard の二層様式」）

thin Command の workflow 節の順序ラベルは `authoring/command-file-format.md` が正規所有する様式（前出出力検証表、順序ラベル）に従う（Issue #2373、REQ-047-006。公開 command の `### Step N` 見出しは正規形の範囲外）。
Workflow Skill 本文（SKILL.md、references/）の工程識別子は実番号形式（`STEP-1` 等）を用い、Command 定義の順序ラベルとは形式を区別して使い分ける。
公開順序の要約の記述様式（前出出力検証表等）は `authoring/command-file-format.md` が正規所有する。詳細工程は Workflow Skill 側 STEP reference が所有し、本節は workflows 側の構成契約のみを記録する。

## Workflow Skill 責務

workflow 実装本体。
SKILL.md = control plane（STEP transition・STEP間参照）、STEP = resume point 単位。
1:1 または 1:N で Command に対応する。
1:N 分割基準: 制御構造に実質差異がある場合に分割評価。
operation 差だけの不必要分割は回避。

Workflow Skill は workflow STEP を所有し、特定 Command の制御構造を持つ（REQ-002-001、REQ-002-002）。

### Workflow 型分類と標準構成（STEP model 対象型と対象外型）

Workflow Skill は STEP model の適用有無により次の3型に分類される（REQ-027-003）。

| 型 | 対象 | STEP model | resume point / export / import |
|---|---|---|---|
| 標準型 | req-define、req-save、design-save、case-open、case-run、case-update、case-close、case-auto、intake-promote、learning-promote、backlog-review、inspect-promote | 対象 | 持つ（DEC-011） |
| capture-only 型 | intake-capture、intake-from-github | 対象外 | 持たない。工程は逐次実行し、中断時は先頭から再実行する |
| read-only-diagnostic 型 | inspect-docs、inspect-skills | 対象外 | 持たない。工程一覧のラベルは順序ラベルであり、中断時は先頭から再実行する |

read-only-diagnostic 型の SKILL.md は次の標準セクション構成を持つ。

1. 型判定節（read-only-diagnostic 型である旨と、STEP model 対象外である旨の宣言）
2. 工程一覧（STEP ラベルは順序ラベルであり resume point ではない旨の宣言を伴う）
3. 冪等性の根拠（診断が読み取りと検出事項ファイル生成のみの副作用であり、中断時は先頭から再実行できる根拠）
4. 終了条件（termination）

capture-only 型も同様に型判定節と工程一覧を持ち、保存専用 workflow であることを宣言する。

### 1:N 分割基準の適用実例（case-run）

case-run は単一 Issue 実行と Epic Wave 実行で制御構造に実質差異があるため、Workflow Skill を single workflow と epic-wave workflow の2 workflow に分離する。
両 workflow の実行契約差異は次の6軸で定義され、Workflow Skill（`agentdev-workflow-case-run`）が所有する。

| 契約軸 | single workflow | epic-wave workflow |
|---|---|---|
| target cardinality | 1 Issue | 現在 ready な Wave の子Issue 群（1 Wave 分、最大5件） |
| parallelism | 委譲1件（並列なし） | 子Issue 並列委譲（最大5件） |
| fan-out / fan-in | fan-out なし。委譲1件の result を直接処理 | fan-out（子Issue ごとの worktree と委譲起動）→ fan-in（全委譲完了待機・結果収集） |
| child task recovery | 対象外 | 委譲異常終了時の子タスク単位の回復 |
| partial result | 対象外 | 一部子Issue の blocked / failed と他の completed-pr の混在保持 |
| Wave-level completion | 対象外 | 1 Wave の完了判定と次 Wave へのべき等遷移（Wave 境界のマージは case-close 責務） |

## Capability Skill 責務

複数workflow で共通する能力を一次情報として所有する。
workflow 固有STEP から横断抽出し、workflow 制御構造を持たない（REQ-002-003、REQ-027-001、DEC-010）。

Capability Skill は workflow STEP を所有しない。
各 Workflow Skill が所有する STEP から名レベルで参照される宣言的定義、判断基準、決定的処理を提供する。

### Capability Skill の判定基準

ある skill が以下の3要件を全て満たす場合、Capability Skill として分類する。

1. **workflow STEP 非所有**: workflow の STEP transition、resume point、control plane を所有しない
2. **複数 workflow からの参照**: 2つ以上の Workflow Skill から参照される、または参照予定である
3. **workflow 制御構造からの分離**: workflow 制御（STEP 順序、分岐、停止条件）から独立して記述できる能力である

要件 1 は Workflow Skill との区別（REQ-002-018）を担保する。
要件 2 は1Workflow で完結する能力を Workflow Skill 内 `references/` 配下へ配置する基準との区別を担保する。
要件 3 は workflow 制御と混在しない単一責務境界を担保する。

### Capability Skill の配置と命名

- **配置**: `src/opencode/skills/agentdev-*/` 配下（REQ-002-008、REQ-002-019）
- **原本と投影**: 原本は `src/opencode/skills/`、実行時投影先は `.opencode/skills/`（REQ-002-007、DEC-002）
- **命名**: `agentdev-{機能領域名}` 形式を推奨する。`agentdev-workflow-*` プレフィックスは歴史的経緯で Capability Skill にも残存する（後述「workflow-* プレフィックスを持つ Capability Skill 的スキル」）。Workflow/Capability 区別は命名ではなく本節の判定基準に基づく。新規作成は機能領域名（`req-*`、`spec-*`、`intake-*`、`learning-*`、`git-*`、`gh-*`、`quality-gates` 等）を推奨する

### Capability Skill の参照契約（過剰共通 reference 化の回避）

Workflow Skill は Capability Skill を**名レベルで参照**する（REQ-002-017）。
Capability Skill の内部構造（`references/` 配下のファイル、`scripts/` 配下、protocol 名、Step 名、Section 名、見出し名）へ**直接依存しない**。

この制約は、workflow 固有STEP が過剰に共通 reference を import することを回避する（REQ-027-001）。
workflow 側は Capability Skill 名とその用途のみを知り、Capability Skill 内部の再構成は Capability Skill 側へ委ねる。

許容される参照:

- Capability Skill 名（`agentdev-req-file-manager` 等）と USE FOR に基づく起動
- Capability Skill の公開操作契約（入力、出力、停止条件）の参照

禁止される参照:

- Capability Skill の `references/*.md` 内部パスへの直接依存
- Capability Skill 内部の見出し、セクション、テーブル名への直接依存
- Capability Skill 間の内部構造結合（Capability Skill 間も名レベル参照）

Workflow Skill は主要 Capability Skill 連携セクション（`## 主要 Capability Skill 連携` 等）を通じて参照先 Capability Skill 名とその用途を公開する。
このセクションは名レベル参照契約の履行証拠となる。

### Capability Skill 間の依存

Capability Skill 同士の依存も名レベル参照とし、循環依存を禁止する。
複数 Capability Skill を協調させる workflow は Workflow Skill 側が制御する。
Capability Skill は他 Capability Skill を直接呼び出さず、呼出元 Workflow Skill が協調順序を決定する。

## Capability Skill と Workflow Skill の責務境界（REQ-002-018）

Capability Skill と Workflow Skill は異なる責務境界・判断モデルを持ち、同一 skill として混在させない（REQ-002-003、REQ-002-018）。

| 側面 | Workflow Skill | Capability Skill |
|---|---|---|
| workflow STEP | 所有する（resume point、control plane） | 所有しない |
| 対応 Command | 1:1 または 1:N | N:N（複数 Workflow Skill から参照） |
| 制御構造 | STEP 順序、分岐、停止条件 | なし（宣言的定義、判断基準、決定的処理） |
| 責務境界 | 特定 workflow の実装本体 | 複数 workflow 共通能力 |
| 判断モデル | workflow 状態遷移に基づく制御判断 | 宣言的ルール、分類基準、決定的変換 |

1つの skill が両側面を持つ場合、責務境界を明示的に分離し、2つの skill へ分割する。
新規に作成する skill は作成時にどちらの層へ属するかを判定基準（「Capability Skill の判定基準」節）に照らして確定する。

### Workflow / Capability 機械分類規則

deterministic checker（check_extensions.ts）が適用する Workflow Skill / Capability Skill の機械判定規則を次の分類表として正規所有する。
checker 実装と本表は同一規則を反映し、乖離は検査で検出対象とする。

| 判定要素 | Workflow Skill | Capability Skill |
|---|---|---|
| workflow STEP の所有 | SKILL.md に STEP 一覧と遷移を記述する | 記述しない（宣言的定義のみ） |
| 対応 Command | dispatch 元 Command を1以上に持つ | 特定 Command 固有の dispatch を持たない |
| 制御構造の記述 | STEP 順序、分岐、停止条件を本文で所有する | workflow 制御構造を本文に持たない |
| 呼称の例外 | なし | `agentdev-workflow-*` プレフィックスの一部スキルは歴史的経緯で Capability Skill として運用する（「workflow-* プレフィックスを持つ Capability Skill 的スキル」節） |

## 決定論的処理との責務接続（DEC-015）

Command / Workflow Skill / Capability Skill の3層構造（DEC-010）を維持したまま、決定論的処理を次の責務分離で接続する（DEC-015、REQ-002-035）。

| 層 | 責務 |
|---|---|
| Command | 利用者向け入口、公開契約（入出力、ガードレール）、Workflow Skill への委譲 |
| Workflow Skill | 処理手順、分岐、停止条件、処理手順上の状態遷移（STEP model） |
| Capability Skill | 複数の処理手順で共通する判断基準・能力（宣言的ルール、分類基準） |
| 決定論的処理 | 規則に基づき一意に判定・変換できるテスト可能な処理（採番、整合性検査、見出し検索等） |

- Capability Skill は決定論的処理を公開能力として所有できる（例: `agentdev-artifact-validation` の公開検証契約、`agentdev-req-file-manager` の採番スクリプト）。この場合も workflow の処理順序、分岐、停止条件の移管は行わず、それらは Workflow Skill が所有したまま参照する。
- 決定論的処理は既存の script 種別（決定的でテスト可能な実行ロジック、`scripts/` 配下の TypeScript、I/O 契約: argv/stdin → stdout JSON）へ接続し、新たな層や成果物種別を導入しない。決定論的に処理できる事項を理由なく LLM の推論だけへ委ねない（REQ-002-035）。

## Capability Skill 横断抽出（DEC-010 Inventory に基づく）

DEC-010 の Workflow Architecture Inventory が Capability Skill 横断抽出候補を裏付ける（AG-001）。
本節は候補の分類と既存 Capability Skill との対応を正規所有する。

### 共通 Capability 領域と既存 Capability Skill

複数 workflow 共通能力は既存 Capability Skill として既に集約されている領域が大半である。
新規 Capability Skill 抽出を検討する前に、既存 Capability Skill の再利用を優先する。

| 共通領域 | 既存 Capability Skill | 利用 Workflow Skill |
|---|---|---|
| git worktree 並列実行安全ステージング | `agentdev-git-worktree` | case-open、case-close、case-auto、case-run |
| project extension 読込（5セクション、fail-open） | `agentdev-project-extensions` | 全 Workflow Skill |
| commit message 規約 | `agentdev-conventional-commits` | case-close、case-run を含む全 commit 発行 workflow |
| REQ/Decision ファイル管理 | `agentdev-req-file-manager`、`agentdev-decision-file-manager` | case-open、case-close（RU 削除、Form Zero）、req-define、req-save |
| Design ファイル管理 | `agentdev-design-file-manager` | case-close（Design status 昇格）、design-save |
| 決定的検証スクリプト | `agentdev-artifact-validation` | req-save、design-save、inspect-docs を含む品質検証 workflow |
| Issue/PR I/O 境界 | `agentdev-gh-cli` | 全 GitHub 操作を行う workflow |
| Issue 操作の安全手続き | `agentdev-issue-management` | case-open、case-update、case-close |
| Epic 進捗・Wave 構成 | `agentdev-epic-tracker` | case-open、case-close、case-auto |
| 品質ゲート | `agentdev-quality-gates` | case-open（QG-2）、case-close（QG-4）、req-define |
| Capture 境界・学び検知 | `agentdev-intake-pipeline`、`agentdev-learning-capture`、`agentdev-learning-pipeline` | case-close、case-auto、intake-from-github、intake-promote |
| 対論型レビュー | `agentdev-adversarial-review` | case-open（経路F）、case-auto（経路H伝播）、req-define 等 |
| case-run 外部実行 adapter | `agentdev-case-run-execution-adapter` | case-run、case-auto |

### workflow-* プレフィックスを持つ Capability Skill 的スキル

以下のスキルは `agentdev-workflow-*` プレフィックスを持つが、実態は Capability Skill の判定基準（workflow STEP 非所有、複数 workflow からの参照、workflow 制御構造からの分離）を満たす。
各スキルは本文で「本スキル自身は workflow STEP を所有せず、各 command の Workflow Skill が所有する STEP から参照される」と宣言する。
命名は歴史的経緯で維持し、Capability Skill として運用する。
将来の rename は別 Issue スコープとする。

| スキル | 提供能力 | 参照元 Workflow Skill |
|---|---|---|
| `agentdev-workflow-lifecycle` | work_type/scale 判定、SSoT 遷移、上位引き継ぎ停止判定 | req-define、case-open、case-run、case-close、case-auto |
| `agentdev-workflow-routing` | review NG 時の次コマンド推論、拒否タイプ分類 | case-run、case-update |
| `agentdev-workflow-orchestration` | case-run 状態機械、自律修正ループ、Capture 境界、Subagent 委譲プロトコル | case-run、case-close、case-auto |
| `agentdev-workflow-templates` | Issue/PR/comment template 選定とセクション規約 | case-open、case-close、case-update |

### 新規 Capability Skill 抽出候補（将来対応）

DEC-010 Inventory が挙げる新規 Capability Skill 候補。
本 Design は候補の記録のみを所有し、個別抽出実装は別 Issue が担う。
新規 Capability Skill は「Capability Skill の判定基準」を満たす場合にのみ作成し、既存 Capability Skill の再利用を優先する。

- test strategy 定義（`req-define` STEP-4 相当）
- EC-2 必須品質統制導出（`case-open` execution contract）
- EC-6 scope-affecting impact 探索（`case-open` execution contract）
- コンフリクト Level 1 解消判断（`case-close`）
- Design status 昇格判断（`case-close`、`design-save`）
- bounded parent decision resolution 詳細（`case-auto`、DEC-008）
- Wave 反復制御詳細（`case-auto`）

抽出優先度低の workflow（`intake-capture`、`intake-from-github`、`case-update`、`inspect-skills`、`inspect-promote`）は workflow 実装が単純、または既存 Capability Skill（`agentdev-intake-pipeline`、`agentdev-workflow-routing`、`agentdev-inspect-skills`）でカバーされており、1:N 分割・新規 Capability 抽出ともに優先度が低い（DEC-010 Inventory）。

## 依存方向

Command → Workflow Skill（名レベル参照）→ STEP reference（references/ 配下）。
Workflow Skill → Capability Skill（名レベル参照）。
循環依存禁止。
Capability Skill → Capability Skill（名レベル参照、循環依存禁止）。

## soft guard の二層様式

Workflow Skill の単独起動防止（soft guard）は OpenCode 1.18.15 が skill 直接起動を機械的に防止できないため、宣言による様式で担保する。
実効層は次の2層である。

| 層 | 実装 | 全 Workflow Skill での実装有無 |
|---|---|---|
| Skill 層 | Workflow Skill description の DO NOT USE FOR に置く簡潔なトリガー項（「単独起動（対応する /agentdev/* コマンド経由で利用すること）」） | 全16 Workflow Skill で実装（実効の主層） |
| Command 層 | command 定義本文 workflow 節の soft guard 宣言節（grep 可能な `soft guard` マーカー） | core 8 Command（req-define、req-save、design-save、case-open、case-run、case-update、case-close、case-auto）と inspect 3 Command（inspect-docs、inspect-skills、inspect-promote）で実装。intake / learning / backlog 5 Command（intake-capture、intake-from-github、intake-promote、learning-promote、backlog-review）は command 定義本文に宣言節を持たず、Skill 層のみで実効する |

マーカー語、内部 ID、運用規則の散文は description に置かない。

command 定義本文に宣言節を持たない構成でも Skill 層の DO NOT USE FOR トリガーにより soft guard は実効する。
Command Design の delegated responsibility 記述は、当該 command の実効層構成（二層または Skill 層のみ）を反映する。

## artifact-contracts.md からの委譲

artifact-contracts.md の肥大化シグナル（500行超）に対応し、Workflow Skill 固有契約は本Design へ委譲する。
