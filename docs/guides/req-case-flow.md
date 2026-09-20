# 要件定義 → Case実行フロー

`/agentdev/req-define` から内部 lifecycle（case-open → case-ready → case-run → case-close。実行は `/agentdev/case-auto`）までの流れを説明する。
機能追加、バグ修正ともにこの経路を通る。

## 全体の流れ

```
/agentdev/req-define → /agentdev/case-auto（内部 lifecycle: case-open → case-ready → case-run → case-close）
```

> `artifact_actions` は case-ready（内部 lifecycle 段階）の Definition action として適用する。case-ready は保存対象の有無にかかわらず実行される（case-auto が駆動）。
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

## case-open

要件docまたは REQ ファイルから GitHub Issue を作成するコマンド。

**入力**: REQ ファイル / 要件doc

**出力**: GitHub Issue

**Epic 規模判定**: 複数モジュール跨ぎ、PR 肥大化リスク、段階的リリースのいずれかを満たす場合、Epic + 子Issue 構成で実行する。

## case-ready

Definition Package を保存・確定し、Case の実行構造を確定するコマンド。

**入力**: Root Case、要件doc、`artifact_actions`

**出力**: 確定済み Definition Package、Epic / Wave / Issue の実行構造

REQ、Decision、Design の保存と Design の成熟度管理は case-ready の Definition action として扱う。保存対象がない場合も case-ready は実行し、execution contract の確定と QG 前提を整える。

## case-revise

再合意済み Definition の変更を既存 Root Case に反映するコマンド。

**入力**: 既存 Root Case、再合意済み要件doc、Amendment

**出力**: Root Case に関連付けられた Definition 変更

case-revise の後は case-ready を再実行し、変更後の Definition と実行構造を確定する。

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
5. PR 本文の `## Design確定候補` から Design 確定フローを実行（Design status の draft → accepted 昇格、または case-revise → case-ready の提案）

### Epic 自動クローズ

親 Epic 内の全子 Issue が完了している場合、Epic を自動的にクローズする。
子 Issue が残存する場合はスキップし、完了報告に状況を表示する。

## work_type 分類

Issue の work_type は参考情報であり、Definition action の適用とパイプライン分岐は case-ready が入力状態をもとに判定する。
docs 更新責務は全 work_type 共通である（bugfix も含む）。

| work_type | 名称 | ラベル | ブランチ種別 |
|-----------|------|--------|-------------|
| bugfix | バグ修正、軽微変更 | `bug`, `critical` | `fix` |
| feature | 機能追加 | `enhancement`, `feature` | `feature` |
| maintenance | リファクタリング、保守作業 | `refactor`, `maintenance` | `refactor` |
| docs_chore | ドキュメント、雑務 | `docs`, `chore` | `chore` |

**Definition action**: req_draft の `artifact_actions`（`artifact: req` / `artifact: decision` / `artifact: design`）は case-ready が適用する。いずれの action もない場合も case-ready をスキップしない。

## 最大自走モード

`/agentdev/case-auto` は、`/agentdev/req-define` 完了後の後続工程を一括実行する標準実行コマンドである。
標準ワークフロー（個別コマンドの順次実行）に並ぶ追加選択肢であり、ユーザーが明示的に指定した場合のみ使用する。

### 実行内容

入力要件docの `draft-data` を読み取り、工程を実行する。`artifact_actions` は case-ready の入力として渡す:

- case-open → case-ready → case-run → case-close（いずれも内部 lifecycle 段階）
- 再合意済み Definition 変更時は case-revise → case-ready → case-run → case-close（例外経路。case-auto が resume_command から解決）

### 自走対象

リポジトリにファイルとして残る変更に限定する。
GitHub Issue / PR / comment / merge / close、docs / REQ / Decision / Design / command reference / guide の更新を含む。
migration ファイル、IaC ファイルの作成、修正も対象。


### 自走対象外


DB マイグレーションの実行、deploy/apply、クラウドリソース操作、外部 SaaS 設定変更、課金、権限、認証情報に関わる変更、リポジトリ外の実データ操作、通知送信は対象外。
これらが必要になった時点で停止し、停止理由、現在地点、再開可能な次コマンドを報告する。

### 停止条件

case-auto の停止条件と停止理由分類の正は REQ-034（case-auto 実行契約）が所有する。

停止時は `/agentdev/case-auto` へ Root Case を指定して再開する（resume_command に基づく）。
