# コマンド関連マップ

各マクロフェーズで使用可能なコマンドと入出力SSoT、並列実行パターンを定義する。

## コマンド関連マップ

各マクロフェーズで使用可能なコマンドを定義する。

| マクロフェーズ       | 使用可能なコマンド                                      | 役割                         |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| ①バイブス壁打ち      | `/issue/issue-req`, `/issue/issue-save-req`, `/issue/issue-backlog`, `/issue/issue-backlog-create`, `/issue/issue-next`        | 要件壁打ち・分析・docs保存・バックログ抽出 |
| ②構造的実行          | `/issue/issue-create`, `/issue/issue-work`（並列対応）, `/issue/issue-update`, `/issue/issue-next`            | Issue作成・実装・進捗記録    |
| ③レビュー完了        | `/issue/issue-next`, `/issue/issue-close`                             | 次アクション推論・完了処理   |

## コマンド詳細

| コマンド              | 入力SSoT               | 出力SSoT                          | 完了後マクロフェーズ |
| --------------------- | ---------------------- | --------------------------------- | -------------------- |
| `/issue/issue-req`           | セッション会話         | 要件doc                           | ①バイブス壁打ち     |
| `/issue/issue-save-req`      | `.sisyphus/drafts/req-draft-*.md` | docs/requirements/REQ, docs/adr/ADR, docs index | ①バイブス壁打ち     |
| `/issue/issue-create`        | 要件doc, specs READ, ADR READ | GitHub Issue                      | ②構造的実行         |
| `/issue/issue-work`          | GitHub Issue, specs READ+WRITE, ADR READ | GitHub PR + worktree + ブランチ   | ③レビュー完了       |
| `/issue/issue-update`        | GitHub Issue           | GitHub Issue + REQファイル（APPEND/UPDATE対応） | 変更なし            |
| `/issue/issue-close`         | GitHub Issue + PR      | なし                              | ③レビュー完了       |
| `/issue/issue-backlog`       | ユーザー期間指定       | バックログdraft（.sisyphus/drafts/） | ①バイブス壁打ち     |
| `/issue/issue-backlog-create` | backlog draft (approved) | Epic + 子Issue（backlog template）+ backlog-extracted コメント | ①バイブス壁打ち     |
| `/issue/issue-next`          | 複数                   | 適切なコマンド実行                 | 依存                |

## 参照フロー

各コマンドがどのアーティファクトをREAD/WRITEするかの明示的なマトリクス。

| コマンド | specs | ADR | REQ |
|----------|-------|-----|-----|
| `/issue/issue-req` | — | — | READ |
| `/issue/issue-save-req` | — | WRITE | WRITE |
| `/issue/issue-create` | READ | READ | READ |
| `/issue/issue-work` | READ+WRITE | READ | READ |
| `/issue/issue-close` | — | — | READ |
| `/issue/issue-update` | — | — | READ+WRITE |
| `/issue/issue-backlog` | — | — | — |
| `/issue/issue-backlog-create` | — | — | — |
| `/issue/issue-next`          | — | — | — |

## データフロー図

```
/issue/issue-req(draft WRITE) → /issue/issue-save-req(REQ WRITE, ADR WRITE) → /issue/issue-create(specs READ, ADR READ) → /issue/issue-work(specs READ+WRITE, ADR READ) → TDD実装 → specs更新 → /issue/issue-close(VERIFY)
/issue/issue-backlog(draft WRITE) → /issue/issue-backlog-create(Epic + 子Issue作成, backlog-extracted コメント投稿)
/issue/issue-work(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
```

- **/issue/issue-req**: 要件docを壁打ちで構築し、パターンBの場合はドラフトを保存する（draft WRITE）
- **/issue/issue-backlog**: クローズ済みissue/PRから残課題を抽出・分類し、解消チェック後にdraftとして保存する（ショートカット経路、specs/ADR/REQアクセスなし）
- **/issue/issue-backlog-create**: 承認済みバックログdraftを読み込み、`issue_desc_backlog_epic.md` / `issue_desc_backlog_child.md` テンプレートでEpic + 子Issueを作成し、`backlog-extracted` コメントを投稿する（specs/ADR/REQアクセスなし）
- **/issue/issue-create**: specs・ADRを読み込んでIssue本文に反映する（READ）
- **/issue/issue-work**: specs・ADRを読み込んで実装計画を立て、実装後にspecsを更新する（READ+WRITE）
- **/issue/issue-close**: REQを参照して完了確認・クリーンアップを行う（READ）

## 並列実行パターン

`/issue/issue-work` は複数Issueの並列実行をサポートする。依存関係に基づくWave実行モデルを採用。

### 実行モデル

- **Hybrid**: 親エージェントが統括（依存分析・specs更新）、サブエージェントが各Issueの Phase A+B を並列実行
- **フォールバック**: Sequential Wave（親エージェントがIssueを1件ずつ順次処理）

### 依存関係レベル

| レベル | 名称 | 実行方法 |
|--------|------|----------|
| L0 | 完全独立 | 並列実行 |
| L1 | Specs共有 | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | Wave分離（同一Wave並列不可） |
| L3 | 明示的依存 | 順次実行 |

詳細な判定基準と手順は `/issue/issue-work` コマンド定義を参照。

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

## 参照フロー図（更新）

```
/issue/issue-work(単一: specs READ+WRITE, ADR READ) → TDD実装 → specs更新
/issue/issue-work(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
```

## 参照

- **フェーズ体系**: [`reference/phases.md`](./phases.md)
- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)
- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
