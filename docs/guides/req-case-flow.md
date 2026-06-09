# 要件定義 → Case実行フロー

`/agentdev/req-define` から `/agentdev/case-close` までの流れを説明する。機能追加・バグ修正ともにこの経路を通る。

## 全体の流れ

```
/agentdev/req-define → /agentdev/req-save（機能追加のみ）→ /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

## req-define

AI と対話して要件を整理するコマンド。

**入力**: セッション会話 / RU（Requirement Unit）

**出力**: 要件doc（draft）

**処理の流れ**:
1. 既存の REQ ファイルをスキャンし、関連する既存要件を特定する
2. 操作分類（CREATE / APPEND / UPDATE）を決定する。CREATE の前に APPEND/UPDATE 候補を評価する
3. 要件doc構造を出力する

**分類ゲート**: 既存成果物への反映作業のみを表す候補は、新規要件の独立要件行として扱わない。

## req-save

要件docを REQ/ADR ファイルとして `docs/` に保存するコマンド。機能追加（feature）のみ対象。バグ修正・保守作業・ドキュメント作業はスキップする。

**入力**: 要件doc（feature のみ）

**出力**: REQ/ADR ファイル（commit/push まで実行）

## case-open

要件docまたは REQ ファイルから GitHub Issue を作成するコマンド。

**入力**: REQ ファイル / 要件doc

**出力**: GitHub Issue

**Epic 規模判定**: 複数モジュール跨ぎ・PR 肥大化リスク・段階的リリースのいずれかを満たす場合、Epic + 子Issue 構成で実行する。

## case-run

Issue に基づいて実装し、PR を作成するコマンド。3フェーズ構成でべき等な再開ポイントを提供する。

**入力**: Issue 本文

**出力**: 実装済みブランチ + PR

### 3フェーズ構成

| フェーズ | 内容 |
|----------|------|
| 準備 | Issue 読取り・worktree 作成・Plan 策定 |
| 実装 | 実装・テスト・docs/specs 整合性確認 |
| 提出 | コミット・PR 作成・チェックボックス更新 |

### 自律修正ループ

Step 11a（ローカル検証）と Step 11c（CI/CD検証）で検証失敗時、ユーザー判断を待たずに実装フェーズへループバックし修正を試みる。最大各3回。

停止条件（いずれかに該当で即座停止）:
- 要件・仕様・スコープの変更が必要
- REQ/ADR/specs の変更判断が必要
- 既存仕様からの逸脱
- 破壊的変更が必要
- 外部サービス・CI環境・権限不足
- flaky と判別不能
- 3回上限を超過

## case-close

PR をマージし、Issue をクローズするコマンド。

**入力**: PR + Issue

**出力**: マージ済み + 記録追記済み + ブランチ削除

### 完了前検証

1. 未チェック項目の達成判定（達成済みなら `[x]` 更新）
2. 要件・SPEC・DOC-MAP の整合性確認
3. ADR 作成済みかの確認
4. マージ済み PR 本文から Findings/Intake候補を回収し、intake item として保存

### Epic 自動クローズ

親 Epic 内の全子 Issue が完了している場合、Epic を自動的にクローズする。子 Issue が残存する場合はスキップし、完了報告に状況を表示する。

## work_type 分類

Issue の work_type に基づき、経路（`/agentdev/req-save` の要否）が変わる。docs 更新責務は全 work_type 共通である（bugfix も含む。REQ-0104-034）。

| work_type | 名称 | ラベル | REQ | ブランチ種別 |
|-----------|------|--------|-----|-------------|
| bugfix | バグ修正・軽微変更 | `bug`, `critical` | 不要 | `fix` |
| feature | 機能追加 | `enhancement`, `feature` | 必要 | `feature` |
| maintenance | リファクタリング・保守作業 | `refactor`, `maintenance` | 不要 | `refactor` |
| docs_chore | ドキュメント・雑務 | `docs`, `chore` | 不要 | `chore` |

**昇格ルール**: bugfix で ADR が必要と判定された場合、feature に昇格し `/agentdev/req-save` を実行する。

## 最大自走モード

`/agentdev/case-auto` は、`/agentdev/req-define` 完了後の後続工程を一括実行する追加入口である。標準ワークフロー（個別コマンドの順次実行）を置き換えるものではない。ユーザーが明示的に指定した場合のみ使用する。

### 実行内容

入力要件docの draft-meta から work_type を読み取り、工程を分岐する:

- **feature**: `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`
- **bugfix / maintenance / docs_chore**: `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`（`/agentdev/req-save` をスキップ）

### 自走対象

repo にファイルとして残る変更に限定する。GitHub Issue / PR / comment / merge / close、docs / REQ / ADR / SPEC / command reference / guide の更新を含む。migration ファイル・IaC ファイルの作成・修正も対象。

### 自走対象外

DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金・権限・認証情報に関わる変更、repo外の実データ操作、通知送信は対象外。これらが必要になった時点で停止し、停止理由・現在地点・再開可能な次コマンドを報告する。

### 停止条件

以下のいずれかを検出した場合、実行を停止する:

1. req-define合意要件からの逸脱
2. 要件未合意のscope拡大
3. repo外実体変更の必要性
4. DB migration実行の必要性
5. deploy/applyの必要性
6. 認証・秘密・権限変更の必要性
7. CI/test/lint失敗がself-healing不能
8. merge conflict / remote hash不一致
9. 作成元不明branch / user-owned branch / 他作業branchの削除検出
10. 未コミット変更の帰属不明

停止時は個別コマンド（`/agentdev/case-open` / `/agentdev/case-run` / `/agentdev/case-close`）から再開できる。
