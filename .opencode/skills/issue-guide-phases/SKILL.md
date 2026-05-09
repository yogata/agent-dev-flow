---
name: issue-guide-phases
description: 開発ワークフローのフェーズ定義・SSoT遷移・パターン判定基準・コマンド関連・docs構造を提供。issue-*コマンドのフェーズ判定フェーズで参照される知識ベース。
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

| マクロフェーズ       | SSoT                           | 説明                                 |
| -------------------- | ------------------------------ | ------------------------------------ |
| ①バイブス壁打ち      | Issue本文                      | 壁打ちで合意形成された要件・分析     |
| ②構造的実行          | Issue本文 + Work Plan          | 要件doc + 実行計画                   |
| ③レビュー完了        | PR + レビュー結果              | コードレビュー結果とマージ状態       |

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
| REQ（要件doc） | ユーザー視点の機能要件 | `docs/requirements/REQ-{NNNN}.md` |
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
| `issue-req` | — | — | — |
| `issue-save-req` | — | WRITE | WRITE |
| `issue-create` | READ | READ | READ |
| `issue-work` | READ+WRITE | READ | READ |
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
- **issue-backlog**: クローズ済みissue/PRから残課題を抽出し、Epic + 子Issueを作成する（ショートカット経路、specs/ADR/REQアクセスなし）
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
| `issue-backlog`       | ユーザー期間指定       | Epic + 子Issue                     | ①バイブス壁打ち     |
| `issue-next`          | 複数                   | 適切なコマンド実行                 | 依存                |

---

## ラベル体系と Pattern Registry

Issueラベルの定義、パターン判定、およびパターン固有の動作ルールを定義する。

### Pattern 定義

| Pattern | 名称 | 付与ラベル | 規模 | docs/更新 | ワークフロー経路 |
|---------|------|-----------|------|-----------|----------------|
| A | バグ修正・軽微変更 | `bug`, `critical` | 小 | なし | issue-req → issue-create → issue-work → issue-close |
| B | 機能追加 | `enhancement`, `feature` | 中 | あり | issue-req → issue-save-req → issue-create → issue-work → issue-close |

### Pattern 判定ルール

- `bug`, `critical` → Pattern A
- `enhancement`, `feature` → Pattern B
- `needs-discussion` は任意のPatternに付与可能（判定には影響しない）

### Pattern 固有の動作ルール

| 項目 | Pattern A | Pattern B |
|------|-----------|-----------|
| REQ ファイル | 作成しない | `issue-save-req` で作成 |
| ADR ファイル | 必要に応じて | `issue-save-req` で作成 |
| specs 更新 | スキップ | `issue-work` で更新 |
| ドラフト保存 | しない | `.sisyphus/drafts/` に保存 |
| issue-save-req | 実行不可 | 実行する |
| ブランチ type | `fix` | `feature` |
| Issue テンプレート | `issue_desc_bug.md` | `issue_desc_feature.md` |
| コメントテンプレート | `issue_comment_bug_analysis.md` | `issue_comment_feature_technical.md` |
| close テンプレート | `issue_comment_bug_record.md` | `issue_comment_feature_implementation.md` |
| docs 検証 (close) | スキップ | 実行する |

### ラベルマッピング

| 変更種別           | 付与ラベル                                                |
| ------------------ | --------------------------------------------------------- |
| バグ修正           | `bug`                                                     |
| バグ修正（緊急）   | `bug`, `critical`                                         |
| 機能追加           | `enhancement`, `feature`                                  |
| 機能追加（要検討） | `enhancement`, `feature`, `needs-discussion`              |

---

## docs/ 構造（5区分）

issue-*ワークフローで操作する docs/ の5区分構造。

| 区分 | パス | 役割 | 自動操作コマンド |
|------|------|------|----------------|
| guides/ | 開発ガイド（参照のみ） | setup.md, api-reference.md, testing-and-debugging.md | — |
| requirements/ | 要件管理 | README.md + REQ-{NNNN}.md | issue-save-req(CREATE), issue-create(READ), issue-update(UPDATE) |
| adr/ | ADR | README.md + ADR-{NNNN}.md | adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | issue-work(READ+WRITE), issue-close(VERIFY) |
| tips/ | 学び | inbox.md + *.md | tips-add(UPDATE), tips-refactor(CREATE) |

---

## スキル間依存関係

issue-guide-skills（phases/reports/review）は他の専門スキルが提供する知識を参照する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `req-analysis`     | 要件分析手法（機能/非機能要件の展開観点、壁打ちメソッドロジー）   |
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
- **req-analysis**: 要件分析手法（機能/非機能要件の展開観点、壁打ちメソッドロジー）
- **spec-compliance**: 仕様適合性検出（実装と要件の乖離基準、ループバック判定）
