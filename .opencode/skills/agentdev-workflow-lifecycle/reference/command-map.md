# コマンド関連マップ

AgentDevFlow の代表的な次ステップ参照情報。状態遷移エンジンとして扱わず、各フェーズで使用可能なコマンドのガイドとして利用する（REQ-0103）。

## ワークフロールート

### req/case パイプライン（開発ワークフロー）

**バグ修正・軽微変更（Pattern A）**: `/agentdev/req-define` → `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`
**機能追加（Pattern B）**: `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run` → `/agentdev/case-close`

| マクロフェーズ | コマンド | 役割 |
|---|---|---|
| 壁打ち | `/agentdev/req-define` | 要件壁打ち・分析 |
| 壁打ち | `/agentdev/req-save` | 要件doc保存（機能追加のみ） |
| 壁打ち→構造的実行境界 | `/agentdev/case-open` | Issue登録（Epic + 子Issue一括作成対応） |
| 構造的実行 | `/agentdev/case-run` | 実装パイプライン（3フェーズ構成: 準備→実装→提出） |
| 構造的実行・レビュー完了 | `/agentdev/case-update` | Issue更新（REQ/コメント/レビューNG対応） |
| レビュー完了 | `/agentdev/case-close` | 完了処理（PRマージ・記録追記・ブランチ削除） |

### learning パイプライン（学びの蓄積・分析・昇華）

**基本フロー**: 学び発生 → `learning-capture`（スキル）→ `/agentdev/learning-refine` → `/agentdev/learning-promote` → `/agentdev/req-backlog` → `/agentdev/req-define`

| コマンド | 役割 |
|---|---|
| `/agentdev/learning-refine` | 問題クラス分類→8軸評価→archive移動 |
| `/agentdev/learning-promote` | 昇華判定→promoted artifact 生成（`promoted/*.md`） |
| `/agentdev/req-backlog` | promoted artifact を読み込み、RU（Requirement Unit）を生成 |

**反映ルート**: promoted artifact → `/agentdev/req-backlog`（RU 生成）→ `/agentdev/req-define`（RU を Requirement Source として読み込み）→ `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`

### intake ワークフロー（気づき・課題の収集）

**基本フロー**: 積み残し候補発生 → `/agentdev/intake-capture` / `/agentdev/intake-from-github` → `/agentdev/intake-review` → `/agentdev/intake-promote` → `/agentdev/req-backlog` → `/agentdev/req-define`

| コマンド | 役割 |
|---|---|
| `/agentdev/intake-capture` | 手動で気づき・課題を `.agentdev/intake/inbox/` に記録 |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出 |
| `/agentdev/intake-review` | inbox の未処理エントリを一括レビューし処分判定 |
| `/agentdev/intake-promote` | review 済み intake item を promoted artifact（`promoted/*.md`）に整形 |
| `/agentdev/req-backlog` | promoted artifact（intake/learning）を読み込み、RU（Requirement Unit）を生成 |

### REQ再構成intakeワークフロー（REQ-0109）

REQ再構成intake: req-save / case-close で検知 → `inbox/req-restructure/` に保存 → intake-review で判定（通常intakeと独立基準）→ `accepted/req-restructure/` または `archive/rejected/req-restructure/` → req-backlog 除外（REQ-0109）

### REQ再構成レビューワークフロー（REQ-0109）

| コマンド | 役割 |
|---|---|
| `/agentdev/req-restructure-review` | REQ体系の健全性を6観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）で診断し推奨アクションを提示 |

### integrity ワークフロー

| コマンド | 役割 |
|---|---|
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンドの整合性を検証 |

## コマンド詳細

| コマンド | 入力SSoT | 出力SSoT | 完了後マクロフェーズ |
|---|---|---|---|
| `/agentdev/req-define` | セッション会話 | 機能追加: `.sisyphus/drafts/req-draft-*.md`、その他: セッション内要件doc | 壁打ち |
| `/agentdev/req-save` | `.sisyphus/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR, docs index | 壁打ち |
| `/agentdev/case-open` | 要件doc, specs READ, ADR READ | GitHub Issue | 定義→実行境界 |
| `/agentdev/case-run` | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ | レビュー完了 |
| `/agentdev/case-update` | GitHub Issue | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし |
| `/agentdev/case-close` | GitHub Issue + PR | なし | レビュー完了 |
| `/agentdev/learning-refine` | `.agentdev/learning/inbox.md` | `.agentdev/learning/archive.md` + `evaluation-report.md` | 学びパイプライン |
| `/agentdev/learning-promote` | `evaluation-report.md` + `.agentdev/learning/archive.md` | `.agentdev/learning/promoted/` | 学びパイプライン |
| `/agentdev/req-backlog` | `.agentdev/intake/promoted/` + `.agentdev/learning/promoted/` | `.agentdev/backlog/req-units/RU-*.md` | RU 生成 |
| `/agentdev/intake-capture` | ユーザー入力 | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-from-github` | GitHub Issue/PR | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-review` | `.agentdev/intake/inbox/` | inbox → accepted / archive/rejected ディレクトリ移動 | レビュー |
| `/agentdev/intake-promote` | review済み intake items | `.agentdev/intake/promoted/` | 昇華 |
| `/agentdev/req-backlog` | promoted artifacts（intake/learning） | `.agentdev/backlog/req-units/RU-*.md` | RU 生成 |
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンド | `.agentdev/integrity/reports/` | 整合性検証 |
| `/agentdev/req-restructure-review` | ドキュメント・REQ体系 | なし（診断結果出力のみ） | REQ再構成 |

## 参照フロー

各コマンドがどのアーティファクトをREAD/WRITEするかのマトリクス。

| コマンド | specs | ADR | REQ | finding | learning | intake | integrity |
|---|---|---|---|---|---|---|---|
| `/agentdev/req-define` | — | — | READ | READ（明示入力時） | — | — | — |
| `/agentdev/req-save` | — | WRITE | WRITE | WRITE（SPLIT検出時） | — | — | — |
| `/agentdev/case-open` | READ | READ | READ | — | — | — | — |
| `/agentdev/case-run` | READ+WRITE | READ | READ | — | — | — | — |
| `/agentdev/case-close` | — | — | READ | — | WRITE（capture） | WRITE（capture） | — |
| `/agentdev/case-update` | — | — | READ+WRITE | — | — | — | — |
| `/agentdev/learning-refine` | — | — | — | — | READ+WRITE | — | — |
| `/agentdev/learning-promote` | — | — | — | — | READ+WRITE | — | — |
| `/agentdev/intake-capture` | — | — | — | — | — | WRITE | — |
| `/agentdev/intake-from-github` | — | — | — | — | — | WRITE | — |
| `/agentdev/intake-review` | — | — | — | — | — | READ+WRITE | — |
| `/agentdev/intake-promote` | — | — | — | — | READ+WRITE | — |
| `/agentdev/req-backlog` | — | — | — | — | READ | WRITE（backlog） |
| `/agentdev/integrity-check` | — | — | — | — | — | — | WRITE |
| `/agentdev/req-restructure-review` | READ | READ | READ | — | — | — | — |

## データフロー図

```
/agentdev/req-define(draft WRITE) → /agentdev/req-save(REQ WRITE, ADR WRITE) → /agentdev/case-open(specs READ, ADR READ) → /agentdev/case-run(specs READ+WRITE, ADR READ) → TDD実装 → specs更新 → /agentdev/case-close(VERIFY)
/agentdev/case-run(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
/agentdev/req-save(SPLIT検出 → finding WRITE) → /agentdev/req-define(finding READ → 要件変更)
/agentdev/intake-capture / /agentdev/intake-from-github → .agentdev/intake/inbox/ → /agentdev/intake-review → /agentdev/intake-promote → .agentdev/intake/promoted/ → /agentdev/req-backlog → .agentdev/backlog/req-units/RU-*.md → /agentdev/req-define
/agentdev/learning-refine(inbox → archive + evaluation-report) → /agentdev/learning-promote → .agentdev/learning/promoted/ → /agentdev/req-backlog → .agentdev/backlog/req-units/RU-*.md → /agentdev/req-define
```

- **/agentdev/req-define**: 要件docを壁打ちで構築し、機能追加の場合はドラフトを保存する（draft WRITE）
- **/agentdev/req-save（SPLIT検出時）**: requirements review finding を `.sisyphus/drafts/` に保存する（finding WRITE）
- **/agentdev/req-define（finding 入力時）**: finding ファイルを明示入力として読み込み、正式な要件変更に変換する（finding READ）
- **/agentdev/case-open**: specs・ADRを読み込んでIssue本文に反映する（READ）
- **/agentdev/case-run**: specs・ADRを読み込んで実装計画を立て、実装後にspecsを更新する（READ+WRITE）
- **/agentdev/case-close**: REQを参照して完了確認・クリーンアップを行う（READ）

## 並列実行パターン

`/agentdev/case-run` は複数Issueの並列実行をサポートする。依存関係に基づくWave実行モデルを採用。

### 実行モデル

- **Hybrid**: 親エージェントが統括（依存分析・specs更新）、サブエージェントが各Issueの Phase A+B を並列実行
- **フォールバック**: Sequential Wave（親エージェントがIssueを1件ずつ順次処理）

### 依存関係レベル

| レベル | 名称 | 実行方法 |
|---|---|---|
| L0 | 完全独立 | 並列実行 |
| L1 | Specs共有 | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | Wave分離（同一Wave並列不可） |
| L3 | 明示的依存 | 順次実行 |

詳細な判定基準と手順は `agentdev-workflow-orchestration` スキルを参照。

## L2 マージ順序と共通ファイル方針

L2（ファイル衝突）を検知した場合、以下の措置を講じる。

**マージ順序の明示的指定**:
- 親エージェントはL2衝突PRのマージ順序を明示的に指定する
- 先にマージされるPRの変更をbaseとし、後続PRはその変更を取り込んでからマージする
- Issue番号の昇順をデフォルトのマージ順序とする

**共通ファイル変更方針の統一**:
- サブエージェントのプロンプトに共通ファイルの変更方針を統一する指示を含める
- 方針統一により、マージ時の競合リスクを最小化する
- 具体的な方針内容はIssue本文の要件に基づいて親エージェントが決定する

## 制約

- 最大5 Issues / 呼び出し
- 依存関係分析結果は実行前に表示するが、ユーザー承認待ちで停止しない（自律実行）
- specs更新は親エージェントのみ（直列・Issue番号昇順）

## Implementation Pattern Taxonomy

コマンドの内部構造に基づく分類軸（REQ-0103-016）。各 implementation pattern はコマンドの責務境界と許容副作用を定義し、スキル参照制約を規定する。

### Pattern A/B/C/D との区別（REQ-0103-016）

Implementation pattern は command の内部構造に基づく分類軸であり、REQ-0104 で定義される Pattern A/B/C/D（Issue 種別分類）とは直交する概念である。Pattern A/B/C/D は Issue 種別とワークフロー分岐を示し、implementation pattern は command の責務境界と許容副作用を示す。

### Pattern Definitions

| Pattern | 主責務 | 許可される副作用 | 禁止される副作用 | 参照すべき skill の性質 | 完了報告で示すべき情報 |
|---------|--------|----------------|----------------|---------------------|-------------------|
| **wall-session** | ユーザーとの対話セッションを通じて構造化成果物を生成する | ドラフトファイルの作成 (`.sisyphus/drafts/`)、任意のアーティファクトの読み取り、ユーザーへの対話的な質問・確認 | 既存アーティファクトの変更 (REQ, ADR, specs, Issue)、git操作 (commit, push, branch)、外部API呼び出しによるリソース作成 (Issue, PR) | 分析・ガイドライン・フォーマット系 skill、完了報告 skill | セッション成果の概要、生成ファイルのパス（ある場合）、推奨される次コマンド |
| **file-pipeline** | 定義されたステップに従いファイルを変換・生成するパイプライン処理 | 指定ディレクトリへのファイル作成・更新、git操作 (commit, push)、外部API呼び出し (Issue更新, PR操作)、テンプレート適用 | 大規模な状態機械の実行、サブエージェントの起動、再開ポイント検出 | ファイル管理・バリデーション・テンプレート系 skill、完了報告 skill、git/gh系 skill (外部API操作時) | 入力→出力マッピング、作成・更新ファイル一覧、git操作結果（ある場合） |
| **manager-orchestrator** | 複数フェーズ構成の状態機械・自己修復ループ・サブエージェントプロトコルによる複雑な実行管理 | すべてのファイル操作、git操作 (worktree, commit, push, merge)、外部API呼び出し (Issue, PR, CI)、サブエージェントの起動・管理、Wave scheduling | （制限なし — 最も広いスコープを持つ） | オーケストレーション系 skill、worktree/git系 skill、仕様適合性 skill、完了報告 skill | 実行フェーズ完了状況、作成・更新アーティファクト一覧、検証結果、サブエージェント実行結果（並列実行時） |
| **capture-only** | データを収集・記録し、指定 inbox に保存する（変換なし） | inbox ディレクトリへの新規ファイル作成のみ、外部APIからの読み取り | レビュー・プロモート・Issue作成、既存ファイルの変更・削除、git操作 (commit, push)、分析・評価・判定 | ライフサイクル文脈 skill、完了報告 skill | キャプチャ項目数、inbox保存パス |
| **read-only-diagnostic** | アーティファクトを分析し、結果をレポートとして出力する（一切の変更なし） | レポートファイルの新規作成 (`.agentdev/integrity/reports/` 等)、intake item の新規作成（ユーザー承認時のみ） | 検査対象アーティファクトの変更 (REQ, ADR, specs, command, skill等)、git操作 (commit, push)、外部API呼び出しによるリソース変更 | 分析・診断系 skill、完了報告 skill | 検査結果サマリ (OK/NG/Warning/Info)、検出問題一覧、レポートファイルパス |

### Command ↔ Pattern Correspondence

| コマンド | Primary Pattern | Secondary Pattern |
|---------|----------------|-------------------|
| `/agentdev/req-define` | wall-session | — |
| `/agentdev/req-save` | file-pipeline | — |
| `/agentdev/case-open` | file-pipeline | — |
| `/agentdev/case-run` | manager-orchestrator | — |
| `/agentdev/case-update` | file-pipeline | — |
| `/agentdev/case-close` | file-pipeline | — |
| `/agentdev/learning-refine` | file-pipeline | — |
| `/agentdev/learning-promote` | file-pipeline | — |
| `/agentdev/intake-capture` | capture-only | — |
| `/agentdev/intake-from-github` | capture-only | — |
| `/agentdev/intake-review` | wall-session | — |
| `/agentdev/intake-promote` | file-pipeline | — |
| `/agentdev/req-backlog` | file-pipeline | — |
| `/agentdev/integrity-check` | read-only-diagnostic | — |
| `/agentdev/req-restructure-review` | read-only-diagnostic | wall-session |

### Pattern ごとの禁止 load_skills

integrity-check による検証で使用する、各 pattern が禁止する skill セット。

| Pattern | 禁止される load_skills |
|---------|---------------------|
| capture-only | `agentdev-workflow-orchestration`, `agentdev-workflow-routing`, `agentdev-req-file-manager`, `agentdev-adr-file-manager`, `agentdev-workflow-templates`, `agentdev-spec-compliance`, `agentdev-epic-tracker`, `agentdev-learning-pipeline` |
| read-only-diagnostic | （capture-only の禁止セットに加え）`agentdev-git-worktree`, `agentdev-gh-cli`, `agentdev-conventional-commits`, `agentdev-learning-capture` |
| wall-session | `agentdev-workflow-orchestration`, `agentdev-workflow-routing`, `agentdev-gh-cli`, `agentdev-git-worktree`, `agentdev-conventional-commits` |
| file-pipeline | （なし） |
| manager-orchestrator | （なし — case-run 専用、最も広いスコープ） |

## 参照

- **フェーズ体系**: [`reference/phases.md`](./phases.md)
- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)
- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
