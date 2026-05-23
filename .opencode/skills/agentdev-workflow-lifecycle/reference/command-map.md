# コマンド関連マップ

AgentDevFlow の代表的な次ステップ参照情報。状態遷移エンジンとして扱わず、各フェーズで使用可能なコマンドのガイドとして利用する（REQ-0017-043）。

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

**基本フロー**: 学び発生 → `learning-capture`（スキル）→ `/agentdev/learning-refine` → `/agentdev/learning-promote` → `/agentdev/req-define`（明示入力ファイル）

| コマンド | 役割 |
|---|---|
| `/agentdev/learning-refine` | 問題クラス分類→8軸評価→archive移動 |
| `/agentdev/learning-promote` | 昇華判定→Requirement Source staging stub生成 |

**反映ルート**: stagingスタブ → `/agentdev/req-define`（明示入力ファイル指定）→ `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`

### intake ワークフロー（気づき・課題の収集）

**基本フロー**: 積み残し候補発生 → `/agentdev/intake-capture` / `/agentdev/intake-from-github` → `/agentdev/intake-review` → `/agentdev/intake-promote` → `/agentdev/req-define` または `/agentdev/intake-open`

| コマンド | 役割 |
|---|---|
| `/agentdev/intake-capture` | 手動で気づき・課題を `.agentdev/intake/inbox/` に記録 |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出 |
| `/agentdev/intake-review` | inbox の未処理エントリを一括レビューし処分判定 |
| `/agentdev/intake-promote` | review 済み intake item を `/agentdev/req-define` / `/agentdev/intake-open` 用入力 artifact に整形 |
| `/agentdev/intake-open` | `/agentdev/intake-promote` 生成 artifact から GitHub Issue を作成 |

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
| `/agentdev/learning-promote` | `evaluation-report.md` + `.agentdev/learning/archive.md` | `.agentdev/learning/elevation-staging/` | 学びパイプライン |
| `/agentdev/intake-capture` | ユーザー入力 | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-from-github` | GitHub Issue/PR | `.agentdev/intake/inbox/` | 収集 |
| `/agentdev/intake-review` | `.agentdev/intake/inbox/` | inbox → accepted / archive/rejected ディレクトリ移動 | レビュー |
| `/agentdev/intake-promote` | review済み intake items | `.agentdev/intake/promoted/` | 昇華 |
| `/agentdev/intake-open` | `.agentdev/intake/promoted/` | GitHub Issue | 昇華 |
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンド | `.agentdev/integrity/reports/` | 整合性検証 |

## 参照フロー

各コマンドがどのアーティファクトをREAD/WRITEするかのマトリクス。

| コマンド | specs | ADR | REQ | finding |
|---|---|---|---|---|
| `/agentdev/req-define` | — | — | READ | READ（明示入力時） |
| `/agentdev/req-save` | — | WRITE | WRITE | WRITE（SPLIT検出時） |
| `/agentdev/case-open` | READ | READ | READ | — |
| `/agentdev/case-run` | READ+WRITE | READ | READ | — |
| `/agentdev/case-close` | — | — | READ | — |
| `/agentdev/case-update` | — | — | READ+WRITE | — |
| `/agentdev/learning-refine` | — | — | — | — |
| `/agentdev/learning-promote` | — | — | — | — |
| `/agentdev/intake-capture` | — | — | — | — |
| `/agentdev/intake-from-github` | — | — | — | — |
| `/agentdev/intake-review` | — | — | — | — |
| `/agentdev/intake-promote` | — | — | — | — |
| `/agentdev/intake-open` | — | — | — | — |
| `/agentdev/integrity-check` | — | — | — | — |

## データフロー図

```
/agentdev/req-define(draft WRITE) → /agentdev/req-save(REQ WRITE, ADR WRITE) → /agentdev/case-open(specs READ, ADR READ) → /agentdev/case-run(specs READ+WRITE, ADR READ) → TDD実装 → specs更新 → /agentdev/case-close(VERIFY)
/agentdev/case-run(並列: 複数Issue → Wave実行 → specs直列更新) → 各PR作成
/agentdev/req-save(SPLIT検出 → finding WRITE) → /agentdev/req-define(finding READ → 要件変更)
/agentdev/intake-capture / /agentdev/intake-from-github → .agentdev/intake/inbox/ → /agentdev/intake-review → /agentdev/intake-promote → .agentdev/intake/promoted/ → /agentdev/intake-open → GitHub Issue
/agentdev/learning-refine(inbox → archive + evaluation-report) → /agentdev/learning-promote → .agentdev/learning/elevation-staging/ → /agentdev/req-define(明示入力ファイル)
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

## 参照

- **フェーズ体系**: [`reference/phases.md`](./phases.md)
- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)
- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
