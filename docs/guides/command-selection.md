# コマンド選択

<!-- ADF-COVERS(implementation): REQ-001-055, REQ-111-009, REQ-111-013 -->

現在の状態から、次に実行すべきコマンドを選ぶための入口表。

## 入口表

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 要件を整理したい | `/agentdev/req-define` | 要件doc（draft） |
| 要件docから Case を開始する | `/agentdev/case-auto` | Root Case、Definition Package と実行構造 |
| REQ ファイルまたは要件docがある | `/agentdev/case-auto`（内部 lifecycle の case-open 段階） | Root Case GitHub Issue |
| Root Case Issue がある | `/agentdev/case-auto`（Root Case 指定） | 実装済みブランチ + PR |
| Root Case Issue があり PR が未マージ | `/agentdev/case-auto`（内部 lifecycle の case-close 段階） | マージ済み + クローズ済み |
| 再合意済み Definition の変更を既存 Case に反映 | `/agentdev/case-auto`（例外経路 case-revise → case-ready を駆動） | Amendment と再確定済み Definition |
| 具体的な作業候補を収集したい | 会話で intake item として蓄積（`agentdev-intake-pipeline` スキル。backlog-auto の intake 系統で処理） | inbox 項目 |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox/ エントリ |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| 未解決事項を課題として追跡したい | 会話で追跡Issue として操作（`agentdev-issue-tracking` スキル。Tool 操作契約経由） | 追跡Issue |
| 要件docから Root Case 確立〜マージまでを一括実行したい / 既存 Root Case Issue の番号、URL から再開したい | `/agentdev/case-auto` | マージ済み + クローズ済み |
| backlog整理サイクル（検出→昇格→統合）を1回で実行したい | `/agentdev/backlog-auto` | 検出事項、採用済み成果物、`RU-*.md` |
| backlog整理サイクルからパッチリリース作成までを一気通貫で接続実行したい | `/agentdev/backlog-auto`（一気通貫実行） | 一気通貫の実行結果報告（全体完了判定結果、リリース結果または保留理由） |

## 工程駆動実行（変更駆動経路と併存する別経路）

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 工程の検討テーマを初回形成したい | `/agentdev/phase-tasks-create` | テーマ初回形成の結果（テーマ一覧、参考候補と既知の必須事項の区別） |
| テーマの追加・具体化・分割・統合・廃止をしたい | `/agentdev/phase-tasks-update` | テーマ更新の結果（変更理由、旧新対応、未決事項の引継ぎ） |
| 外部検討の採用済みの戻り内容または直接採用する内容を正規成果物へ反映（増分更新・初回作成）したい | `/agentdev/phase-artifacts-update` | 反映の結果と記録（衝突・未確認・保存失敗の区別。外部戻り入力存在時は受領記録、直接採用時は採否記録） |
| 正規成果物群を独立レビューしたい、工程全体像を再構成したい | `/agentdev/phase-review` | 4区分に分けた所見と工程全体像（セッション内出力） |
| 工程を完了として次へ進めたい | `/agentdev/phase-transition` | 遷移の記録結果 |

> 工程駆動実行と変更駆動経路の関係は、[工程遷移・独立レビューと双経路併存モデル](../designs/workflows/phase-transition-and-coexistence-model.md#双経路併存と移行) を参照する。各操作は単独で起動でき、他の工程操作や遷移操作を前置しない。

## 構成移行

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| install.ps1 -Check が版不一致・旧構造痕跡・未移行を検知した | `/agentdev/migrate` | 移行の結果（適用した差分仕様、旧新対応、引き継いだ情報、決定論的検証の結果） |

> 構成移行は `/agentdev/migrate` が単独所有する。install.ps1 と通常コマンドは移行処理を持たず、検知と案内のみを行う。

## リポジトリメンテナンス（AgentDevFlow 本体リポジトリのみ）

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| ドキュメント整合性を検証したい | `/repo/docs-check` | 検証レポート |

> これらのコマンドは配布対象外であり（REQ-010、DEC-001）、AgentDevFlow 本体リポジトリでのみ利用する。

## 使い方

1. 「現在の状態」の列から今の状況に合う行を探す
2. 「次のコマンド」を実行する
3. 出力された成果物を使って、次の行に進む

## 補足

### case-ready の Definition 確定

工程分岐は req_draft の `artifact_actions` 存在で動的判定する。
work_type（bugfix / feature / maintenance / docs_chore）による固定判定は行わない。

- `artifact_actions`（`artifact: req` / `artifact: decision` / `artifact: design`）は case-ready に渡して Definition action として適用する
- 保存対象の有無で case-ready をスキップしない。case-ready が Definition 保存・確定と実行構造を担う
- 再合意済み Definition 変更は case-revise で既存 Root Case に関連付けた後、case-ready を再実行する
- バグ修正、保守作業、ドキュメント作業は保存対象を持たないため、直行の対象になる

### その他

- 各コマンドの入出力の詳細は [要件定義 → Case実行フロー](req-case-flow.md) を参照
- Intake / Learning パイプラインの詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) を参照
- 追跡Issue（会話経由の `agentdev-issue-tracking` スキル利用）は Intake / Learning、Decision、RU とは別系統の課題管理である。詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) の「追跡Issue（別系統）」節を参照
- `/agentdev/case-auto` は標準実行コマンド。要求入口 2 つ（`/agentdev/req-define`、`/agentdev/backlog-auto`）から合流する標準経路（`/agentdev/req-define` → `/agentdev/case-auto`）を構成する
- `/agentdev/backlog-auto` は backlog 整理サイクル（検出→昇格→統合）を1回で実行する backlog-driven の要求入口。承認確定した RU 一式がある場合、一気通貫実行として `/agentdev/req-define` → `/agentdev/case-auto` へ自動接続し、一式全体の完了判定とパッチリリース作成まで進める（利用者判断境界は維持。手動の `/agentdev/req-define` 起動も従来どおり利用可能）
- inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review は公開コマンドではなく、backlog-auto が Workflow Skill として駆動する内部 workflow である（単独の公開起動入口は持たない）
- 工程駆動実行の入口は上の「工程駆動実行（変更駆動経路と併存する別経路）」節の表を参照する
