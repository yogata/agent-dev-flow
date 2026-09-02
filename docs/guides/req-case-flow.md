# 要件定義 → Case実行フロー

`/agentdev/req-define` から `/agentdev/case-close` までの流れを説明する。
機能追加、バグ修正ともにこの経路を通る。

## 全体の流れ

```
/agentdev/req-define → /agentdev/req-save（REQ/Decision 対象 artifact_actions がある場合）→ /agentdev/design-save（Design 対象 artifact_actions がある場合）→ /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

> 工程分岐は req_draft の `artifact_actions` 存在で動的判定する。
> draft は構造化 `draft-data` 形式（緩やかな契約：soft contract）で req-define が生成し、後続コマンドが LLM 推論で消費する。

## req-define

AI と対話して要件を整理するコマンド。

**入力**: セッション会話 / RU（Requirement Unit）

**出力**: 要件doc（draft）

**処理の流れ**:
1. 既存の REQ ファイルをスキャンし、関連する既存要件を特定する
2. 操作分類（CREATE / APPEND / UPDATE）を決定する。CREATE の前に APPEND/UPDATE 候補を評価する
3. 要件doc構造を出力する

**分類ゲート**: 既存成果物への反映作業のみを表す候補は、新規要件の独立要件行から除外する。

## req-save

要件docを REQ/Decision ファイルとして `docs/` に保存するコマンド。
REQ/Decision 対象 artifact_actions（`artifact: req` / `artifact: decision`）がある場合に実行する。

**入力**: 要件doc（REQ/Decision 対象 artifact_actions がある場合）

**出力**: REQ/Decision ファイル（commit/push まで実行）

## design-save

req-define で分離された Design 保存対象（`draft-data` の `artifact_actions` 内 `artifact: design` entry）を Design ファイルとして `docs/designs/` に保存、確定するコマンド。
Design 対象 artifact_actions がある場合に実行する（全 work_type 対象）。
req-save のファイル編集スコープ制約（Design 編集禁止）を緩和するものではなく、Design 保存を独立責務として切り出す。

**入力**: 要件doc（Design 対象 artifact_actions がある場合）

**出力**: Design ファイル（`docs/designs/**/*.md`）。新規作成時は `status: draft` を付与

**Design ライフサイクル**: Design は frontmatter `status`（`draft` / `accepted`）で成熟度を管理する。
`draft`（design-save で保存直後）→ `accepted`（case-close で実装が Design 内容を検証した旨を確認）の順で昇格する。

**スキップ条件**: `artifact: design` entry がない場合はスキップする。

## case-open

要件docまたは REQ ファイルから GitHub Issue を作成するコマンド。

**入力**: REQ ファイル / 要件doc

**出力**: GitHub Issue

**Epic 規模判定**: 複数モジュール跨ぎ、PR 肥大化リスク、段階的リリースのいずれかを満たす場合、Epic + 子Issue 構成で実行する。

## case-run

Issue に基づいて実装し、PR を作成するコマンド。
3フェーズ構成でべき等な再開ポイントを提供する。

**入力**: Issue 本文

**出力**: 実装済みブランチ + PR

### 3フェーズ構成

| フェーズ | 内容 |
|----------|------|
| 準備 | Issue 読取り、worktree 作成、Plan 策定 |
| 実装 | 実装、テスト、docs/designs 整合性確認 |
| 提出 | コミット、PR 作成 |

> **完了条件チェックボックスは case-close の責務**: case-run は完了条件チェックボックスの更新を case-close に委ねる。
> チェックボックスの評価、更新は case-close QG-4 で行う。

### 自律修正ループ

検証失敗時（ローカル検証、CI/CD 検証）、ユーザー判断を待たずに実装フェーズへループバックし修正を試みる。最大各3回。

現行の case-run STEP 構成、自律修正ループと CI 対応ループの停止条件の正は、REQ-031（case-run 実行契約）と `agentdev-workflow-orchestration` スキルが所有する。

## case-close

PR をマージし、Issue をクローズするコマンド。

**入力**: PR + Issue

**出力**: マージ済み + 記録追記済み + ブランチ削除

### 完了前検証

1. 未チェック項目の達成判定（達成済みなら `[x]` 更新）
2. 要件、Design、README 索引の整合性確認
3. Decision 作成済みかの確認
4. マージ済み PR 本文から検出事項/Intake 候補を回収し、Intake / Learning に分離して保存
5. PR 本文の `## Design確定候補` から Design 確定フローを実行（Design status の draft → accepted 昇格、または design-save 再起動の提案）

### Epic 自動クローズ

親 Epic 内の全子 Issue が完了している場合、Epic を自動的にクローズする。
子 Issue が残存する場合はスキップし、完了報告に状況を表示する。

## work_type 分類

Issue の work_type は参考情報であり、パイプライン分岐（`/agentdev/req-save` の要否）は req_draft の `artifact_actions` 存在で動的判定する。
docs 更新責務は全 work_type 共通である（bugfix も含む）。

| work_type | 名称 | ラベル | ブランチ種別 |
|-----------|------|--------|-------------|
| bugfix | バグ修正、軽微変更 | `bug`, `critical` | `fix` |
| feature | 機能追加 | `enhancement`, `feature` | `feature` |
| maintenance | リファクタリング、保守作業 | `refactor`, `maintenance` | `refactor` |
| docs_chore | ドキュメント、雑務 | `docs`, `chore` | `chore` |

**工程分岐**: req_draft の `artifact_actions` に `artifact: req` / `artifact: decision` entry が含まれれば req-save が実行され、`artifact: design` entry が含まれれば design-save が実行される。
いずれの artifact_actions もない場合は case-open から開始する。

## 最大自走モード

`/agentdev/case-auto` は、`/agentdev/req-define` 完了後の後続工程を一括実行する追加入口である。
標準ワークフロー（個別コマンドの順次実行）に並ぶ追加選択肢であり、ユーザーが明示的に指定した場合のみ使用する。

### 実行内容

入力要件docの `draft-data` の `artifact_actions` を読み取り、工程を動的判定する（`artifact_actions` 存在による判定）:

- **REQ/Decision artifact_actions あり**: `/agentdev/req-save` → `/agentdev/design-save`（Design artifact_actions がある場合）→ `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`
- **REQ/Decision artifact_actions なし**: `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`（`/agentdev/req-save` 、 `/agentdev/design-save` をスキップ）

### 自走対象

リポジトリにファイルとして残る変更に限定する。
GitHub Issue / PR / comment / merge / close、docs / REQ / Decision / Design / command reference / guide の更新を含む。
migration ファイル、IaC ファイルの作成、修正も対象。


### 自走対象外


DB マイグレーションの実行、deploy/apply、クラウドリソース操作、外部 SaaS 設定変更、課金、権限、認証情報に関わる変更、リポジトリ外の実データ操作、通知送信は対象外。
これらが必要になった時点で停止し、停止理由、現在地点、再開可能な次コマンドを報告する。

### 停止条件

case-auto の停止条件と停止理由分類の正は REQ-034（case-auto 実行契約）が所有する。

停止時は個別コマンド（`/agentdev/case-open` / `/agentdev/case-run` / `/agentdev/case-close`）から再開できる。
