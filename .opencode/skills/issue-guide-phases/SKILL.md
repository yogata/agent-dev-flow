---
name: issue-guide-phases
description: Provides development workflow phase definitions, SSoT transitions, pattern matching criteria, command mappings, and docs structure for the issue-* command pipeline. USE FOR: determining workflow phases, Pattern A/B classification, scale assessment, resolving command dependencies, or understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, or compliance checking.
---

# Issue Guide Phases スキル

issue-*系コマンドのフェーズ定義・SSoT遷移・コマンド関連を提供する。

- **知識ベース**: フェーズ定義、SSoT遷移、パターン判定基準、コマンド関連
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

---

## フェーズ体系

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ       | 定義                                     | 対応マイクロフェーズ |
| -------------------- | ---------------------------------------- | -------------------- |
| ①バイブス壁打ち      | 要件定義・分析・Issue作成前の合意形成    | requirement + analyzed |
| ②構造的実行          | Issue作成後の実装・PR作成・進捗管理      | created + in_progress |
| ③レビュー完了        | PR作成後のレビュー・マージ・完了処理     | review + done |

### マイクロフェーズ一覧

| フェーズ      | 状態                   | マクロフェーズ     |
| ------------- | ---------------------- | ------------------ |
| `requirement` | 要件定義中             | ①バイブス壁打ち   |
| `analyzed`    | 分析完了・Issue未作成  | ①バイブス壁打ち   |
| `created`     | Issue作成済み・作業前  | ②構造的実行       |
| `in_progress` | 実装中                 | ②構造的実行       |
| `review`      | PR作成済み・レビュー中 | ③レビュー完了     |
| `done`        | 完了                   | ③レビュー完了     |

---

## SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ       | SSoT                           | 説明                                                       |
| -------------------- | ------------------------------ | ---------------------------------------------------------- |
| ①バイブス壁打ち      | セッション会話 + draft         | 壁打ちで合意形成された要件・分析（Issue未作成のため）     |
| ②構造的実行          | Issue本文 + Work Plan          | 要件doc + 実行計画                                         |
| ③レビュー完了        | PR + レビュー結果              | コードレビュー結果とマージ状態                             |

### draft の定位

draft（`.sisyphus/drafts/req-draft-*.md`）は**①フェーズ内の一時ハンドオフ**であり、②以降のSSoTはIssue本文とWork Planである。

- **ライフサイクル**: `draft` → `saved`（issue-save-req完了）→ `issued` + 削除（issue-create完了）
- **①フェーズの役割**: issue-req → issue-save-req 間の要件引き継ぎ
- **②フェーズ以降**: draftは存在しない（issue-create完了時に削除）。SSoTはIssue本文 + Work Planに完全移行

---

## フェーズ境界ルール

マクロフェーズ間の境界で満たすべき要件を定義する。

### ①→② 境界（バイブス壁打ち → 構造的実行）

①バイブス壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を**必ずコミット・プッシュ**すること。これにより②構造的実行フェーズのworktreeがdocs変更を継承する。

**義務化の理由**: Issue #32でdocs変更がコミットされず、worktreeに継承されなかった問題を再発防止するため。

**手順**:
1. docs変更の整合性検証（REQ番号の連続性、frontmatterの`id`とファイル名の一致）
2. `conventional-commits` に従ってコミットメッセージを生成
3. mainブランチにpush

---

## Anchored Development モデル

issue-*ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
| ---------------- | ---- | ------ |
| REQ（要件doc） | ユーザー視点の要件（目的/要件/適用範囲） | `docs/requirements/REQ-{NNNN}.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | `docs/adr/ADR-*.md` |

これに加えて、システムの現在の姿を表す2つの「生きた仕様」を維持する。

| 仕様 | 役割 | 格納先 |
| ---- | ---- | ------ |
| system.md | システム全体の現在の仕様 | `docs/specs/system.md` |
| patterns.md | 実装パターン・規約 | `docs/specs/patterns.md` |

### ワークフロー

```
REQ → Issue → Work Plan（動的）→ TDD実装 → specs更新
```

- **Work Plan**: issue-work で生成・実行。Issue単位で動的に変化する。
- **specs更新**: issue-work で実装中に system.md/patterns.md を更新し、issue-close で更新内容を検証する。

### 参照フロー

各コマンドがどのアーティファクトをREAD/WRITEするかの明示的なマトリクス。

| コマンド | specs | ADR | REQ |
|----------|-------|-----|-----|
| `issue-req` | — | — | READ |
| `issue-save-req` | — | WRITE | WRITE |
| `issue-create` | READ | READ | READ |
| `issue-work` | READ+WRITE | READ+WRITE | READ |
| `issue-close` | — | — | READ |
| `issue-update` | — | — | READ+WRITE |
| `issue-backlog` | — | — | — |
| `issue-next`          | READ | READ | READ |

#### データフロー図

```
issue-req(draft WRITE) → issue-save-req(REQ WRITE, ADR WRITE) → issue-create(specs READ, ADR READ) → issue-work(specs READ+WRITE, ADR READ) → TDD実装 → specs更新 → issue-close(VERIFY)
issue-work(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
```

- **issue-req**: 要件docを壁打ちで構築し、パターンBの場合はドラフトを保存する（draft WRITE）
- **issue-backlog**: クローズ済みissue/PRから残課題を抽出し、`issue_desc_backlog_epic.md` / `issue_desc_backlog_child.md` テンプレートでEpic + 子Issueを作成する（ショートカット経路、specs/ADR/REQアクセスなし）
- **issue-create**: specs・ADRを読み込んでIssue本文に反映する（READ）
- **issue-work**: specs・ADRを読み込んで実装計画を立て、実装後にspecsを更新する（READ+WRITE）
- **issue-close**: REQを参照して完了確認・クリーンアップを行う（READ）

---

## コマンド関連マップ

各マクロフェーズで使用可能なコマンドを定義する。

| マクロフェーズ       | 使用可能なコマンド                                      | 役割                         |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| ①バイブス壁打ち      | `issue-req`, `issue-save-req`, `issue-backlog`        | 要件壁打ち・分析・docs保存・バックログ抽出 |
| ②構造的実行          | `issue-create`, `issue-work`（並列対応）, `issue-update`            | Issue作成・実装・進捗記録    |
| ③レビュー完了        | `issue-next`, `issue-close`                             | 次アクション推論・完了処理   |

### コマンド詳細

| コマンド              | 入力SSoT               | 出力SSoT                          | 完了後マクロフェーズ |
| --------------------- | ---------------------- | --------------------------------- | -------------------- |
| `issue-req`           | セッション会話         | 要件doc                           | ①バイブス壁打ち     |
| `issue-save-req`      | `.sisyphus/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR, docs index | ①バイブス壁打ち     |
| `issue-create`        | 要件doc, specs READ, ADR READ | GitHub Issue                      | ②構造的実行         |
| `issue-work`          | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ   | ③レビュー完了       |
| `issue-update`        | GitHub Issue           | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし            |
| `issue-close`         | GitHub Issue + PR      | なし                              | ③レビュー完了       |
| `issue-backlog`       | ユーザー期間指定       | Epic + 子Issue（backlog template） | ①バイブス壁打ち     |
| `issue-next`          | 複数                   | 適切なコマンド実行                 | 依存                |

---

## ラベル体系と Pattern Registry

Issueラベルの定義、パターン判定、およびパターン固有の動作ルールを定義する。

### Pattern 定義

| Pattern | 名称 | 付与ラベル | 規模 | docs/更新 | ワークフロー経路 |
|---------|------|-----------|------|-----------|----------------|
| A | バグ修正・軽微変更 | `bug`, `critical` | 小 | なし | issue-req → issue-create → issue-work → issue-close |
| B | 機能追加 | `enhancement`, `feature` | 中 | あり | issue-req → issue-save-req → issue-create → issue-work → issue-close |
| C | リファクタリング・保守作業 | `refactor`, `maintenance` | 小 | なし | issue-req → issue-create → issue-work → issue-close |
| D | ドキュメント・雑務 | `docs`, `chore` | 小 | なし | issue-req → issue-create → issue-work → issue-close |

### 規模判定 (Pattern Bのみ)

Pattern B（機能追加）の規模を判定し、Epic分割の要否を決定する。**Pattern C/DはEpic分割に対応しない**（規模判定は適用されない）。

#### 規模判定基準

以下の3つの条件のいずれか1つでも満たす場合、`scale: large`（Epic）と判定する：

1. **複数モジュールにまたがる機能追加** (e.g., UI + API + DB)
2. **1 Issue (1 issue-work) で実装しきれない規模** (PR肥大化リスク)
3. **段階的リリースが必要** (フェーズ分け・マイルストーン分割)

いずれの条件も満たさない場合、`scale: standard`（デフォルト）とする。

#### 規模値

| 値 | 説明 | 動作 |
|----|------|------|
| `standard` | 通常規模の機能追加（デフォルト） | 単一Issueとして作成・実行 |
| `large` | 大規模機能追加（Epic） | Epic + 子Issueとして分割・作成 |

#### Epic振る舞いルール (Pattern B - large)

| コマンド | 振る舞い |
|----------|----------|
| `issue-req` | 規模判定を実行し、draft-metaに `scale: standard/large` を記録 |
| `issue-create` | `scale: large` の場合、Epic + 子Issueを一括作成（`issue_desc_epic.md` / `issue_desc_child.md`） |
| `issue-backlog` | `issue_desc_backlog_epic.md` / `issue_desc_backlog_child.md` テンプレートでEpic + 子Issueを作成 |
| `issue-work` | 子Issue群を既存並列機能で一括実行 |
| `issue-close` | 既存のEpic自動クローズ機能を利用（変更なし） |

#### Epicラベル

| 側面 | 付与ラベル |
|------|-----------|
| Epic側 | `enhancement`, `feature`, `epic` |
| 子Issue側 | `enhancement`, `feature` |

### Pattern 判定ルール

- `bug`, `critical` → Pattern A
- `enhancement`, `feature` → Pattern B
- `refactor`, `maintenance` → Pattern C
- `docs`, `chore` → Pattern D
- `needs-discussion` は任意のPatternに付与可能（判定には影響しない）

### Pattern 昇格ルール（FIX-023）

Pattern A で ADR が必要な場合（`adr-guidelines` の閾値判定で「必要」となった場合）、Pattern B に昇格する。昇格時は `enhancement`, `feature` ラベルを付与し、`issue-save-req` を実行する。REQファイル・ADRファイルの作成が必要となるため。

### Pattern 固有の動作ルール

| 項目 | Pattern A | Pattern B | Pattern C | Pattern D |
|------|-----------|-----------|-----------|-----------|
| REQ ファイル | 作成しない | `issue-save-req` で作成 | 作成しない | 作成しない |
| ADR ファイル | 必要に応じて | `issue-save-req` で作成 | 必要に応じて | 必要に応じて |
| specs 更新 | スキップ | `issue-work` で更新 | スキップ | スキップ |
| ドラフト保存 | しない | `.sisyphus/drafts/` に保存 | しない | しない |
| issue-save-req | 実行不可 | 実行する | 実行不可 | 実行不可 |
| ブランチ type | `fix` | `feature` | `refactor` | `chore` |
| Issue テンプレート | `issue_desc_bug.md` | `issue_desc_feature.md` | `issue_desc_bug.md` ※ | `issue_desc_bug.md` ※ |
| コメントテンプレート | `issue_comment_bug_analysis.md` | `issue_comment_feature_technical.md` | `issue_comment_bug_analysis.md` ※ | `issue_comment_bug_analysis.md` ※ |
| close テンプレート | `issue_comment_bug_record.md` | `issue_comment_feature_implementation.md` | `issue_comment_bug_record.md` ※ | `issue_comment_bug_record.md` ※ |
| docs 検証 (close) | スキップ | 実行する | スキップ | スキップ |

#### Pattern B 固有ルール: Epic (large)

| 項目 | Epic (large) |
|------|-------------|
| Issue作成単位 | Epic + 子Issue一括作成 |
| 子Issueラベル | `enhancement`, `feature` |
| Epicラベル | `enhancement`, `feature`, `epic` |
| 実行方法 | 子Issue群を並列実行（既存並列機能を利用） |
| ドラフト保存 | `.sisyphus/drafts/` に保存（Epic + 子Issue構成） |
| 親子関係 | 子Issue本文に `Parent: #{EPI-C_ISSUE番号}` を記載 |
| 進捗追跡 | Epic本文にステータス追跡テーブル（☐/🔄/✅/❌）を配置 |
| Epicクローズ | 全子Issue完了時に自動クローズ（既存機能を利用） |

### Pattern A〜D 対応表（REQ-0001-009）

各Patternの属性対応表を定義する。

| 項目 | Pattern A | Pattern B | Pattern C | Pattern D |
|------|-----------|-----------|-----------|-----------|
| Type labels | `bug`, `critical` | `enhancement`, `feature` | `refactor`, `maintenance` | `docs`, `chore` |
| Branch type | `fix` | `feature` | `refactor` | `chore` |
| REQ要否 | 不要 | 必要 | 不要 | 不要 |
| ADR要否 | 不要（必要に応じて） | 必要 | 不要（必要に応じて） | 不要（必要に応じて） |
| specs更新要否 | 不要 | 必要 | 不要 | 不要 |
| Review focus | 修正の正確性 | 要件充足・設計妥当性 | 既存機能の非退化 | 正確性・完全性 |

### Pattern C/D テンプレート再利用

Pattern C/DはPattern Aと同等のlightweight workflowであるため、Pattern Aのテンプレートを再利用する。

- **Issue テンプレート**: `issue_desc_bug.md`
- **コメント テンプレート**: `issue_comment_bug_analysis.md`
- **close テンプレート**: `issue_comment_bug_record.md`

> **注意**: Pattern C/Dはバグ修正ではないが、専用テンプレートが存在しないためPattern Aテンプレートを再利用する。テンプレート内の「バグ」「修正」等の表現と実際の作業内容にセマンティックな不一致が生じるが、ユーザーによって許容されている。将来の改善で専用テンプレートの導入が検討される場合、この再利用関係を解消すること。

### Pattern C/D + Epic 制約

Pattern C/DはEpic分割に対応しない。規模判定はPattern B（機能追加）のみの仕組みであり、C/Dに`scale`判定は適用されない。

- `refactor`/`maintenance`/`docs`/`chore`ラベルを持つIssueに`epic`ラベルが付与された場合、エージェントはEpic分割を実行せず、ユーザーに確認すること
- C/Dは常に単一Issueとして扱う

### ラベル矛盾検知ガード節（REQ-0001-010）

コマンド実行時に、検出されたPatternとラベルが暗示するPatternが矛盾する場合、コマンドは**直ちに停止**しユーザーに確認を求める。自動推定で矛盾を解消してはならない。

**判定ロジック**: `detected_pattern ≠ label_implied_pattern` の場合に停止。

**矛盾の例**:

| 矛盾パターン | 検出ラベル | 暗示Pattern | 実際のPattern | 検知理由 |
|-------------|-----------|------------|-------------|---------|
| bug + refactor | `bug`, `refactor` | A と C が競合 | — | 複数Patternにまたがるラベル矛盾 |
| enhancement + docs | `enhancement`, `docs` | B と D が競合 | — | 機能追加とドキュメント作業の混在 |
| feature + chore | `feature`, `chore` | B と D が競合 | — | 機能追加と雑務の混在 |
| bug + enhancement | `bug`, `enhancement` | A と B が競合 | — | バグ修正と機能追加の混在 |

**参照**: REQ-0001-010「label と metadata/template-type が矛盾する場合、コマンドは停止してユーザー確認を求めなければならない（SHALL）」

### ラベルマッピング

| 変更種別           | 付与ラベル                                                |
| ------------------ | --------------------------------------------------------- |
| バグ修正           | `bug`                                                     |
| バグ修正（緊急）   | `bug`, `critical`                                         |
| 機能追加           | `enhancement`, `feature`                                  |
| 機能追加（要検討） | `enhancement`, `feature`, `needs-discussion`              |
| 機能追加（大規模/Epic） | `enhancement`, `feature`, `epic`                         |
| リファクタリング   | `refactor`                                                |
| 保守作業           | `maintenance`                                             |
| ドキュメント       | `docs`                                                    |
| 雑務               | `chore`                                                   |
| バックログEpic        | Epic: `enhancement`, `epic` / 子Issue: `enhancement`    |

---

## docs/ 構造（5区分）

issue-*ワークフローで操作する docs/ の5区分構造。

| 区分 | パス | 役割 | 自動操作コマンド |
|------|------|------|----------------|
| guides/ | 開発ガイド（参照のみ） | setup.md, api-reference.md, testing-and-debugging.md | — |
| requirements/ | 要件管理（目的/要件/適用範囲） | README.md + REQ-{NNNN}.md | issue-save-req(CREATE), issue-create(READ), issue-update(UPDATE) |
| adr/ | ADR | README.md + ADR-{NNNN}.md | adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | issue-work(READ+WRITE), issue-close(VERIFY) |
| tips/ | 学び | inbox.md + *.md | tips-add(UPDATE), tips-refactor(CREATE) |

---

## スキル間依存関係

issue-guide-skills（phases/reports/review）は他の専門スキルが提供する知識を参照する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `req-analysis`     | 要件分析手法（要件の展開観点、壁打ちメソッドロジー）   |
| `spec-compliance`    | 仕様適合性検出（実装と要件の乖離基準、ループバック判定）        |
| `adr-file-manager` | ADRファイルの作成・追記・更新操作とバリデーション               |
| `adr-guidelines`   | ADR作成の必要性判定基準・ライフサイクル定義                     |
| `req-file-manager` | REQファイルの作成・追記・更新操作とバリデーション               |

**注意**: issue-guide-phases/reports/reviewは一方向依存であり、他スキルからは参照されない。

---

## 並列実行パターン

`issue-work` は複数Issueの並列実行をサポートする。依存関係に基づくWave実行モデルを採用。

### 実行モデル

- **Hybrid**: 親エージェントが統括（依存分析・specs更新）、サブエージェントが各Issueの Phase A+B を並列実行
- **フォールバック**: Sequential Wave（親エージェントがIssueを1件ずつ順次処理）

### 依存関係レベル

| レベル | 名称 | 実行方法 |
|--------|------|----------|
| L0 | 完全独立 | 並列実行 |
| L1 | Specs共有 | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | 並列実行（specs更新は直列） |
| L3 | 明示的依存 | 順次実行 |

詳細な判定基準と手順は `issue-work` コマンド定義を参照。

### 制約

- 最大5 Issues / 呼び出し
- 依存関係判定結果はユーザー確認必須
- specs更新は親エージェントのみ（直列・Issue番号昇順）

### 参照フロー図（更新）

```
issue-work(単一: specs READ+WRITE, ADR READ) → TDD実装 → specs更新
issue-work(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
```

---

## See Also

- **issue-guide-reports**: 完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシー
- **issue-guide-review**: レビューNG時の対応フロー・issue-next推論ルール
- **adr-file-manager**: ADRファイルの作成・追記・更新操作とバリデーション
- **adr-guidelines**: ADR作成の必要性判定基準・ライフサイクル定義
- **req-file-manager**: REQファイルの作成・追記・更新操作とバリデーション
- **req-analysis**: 要件分析手法（要件の展開観点、壁打ちメソッドロジー）
- **spec-compliance**: 仕様適合性検出（実装と要件の乖離基準、ループバック判定）
