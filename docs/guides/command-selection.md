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
| 具体的な作業候補を収集したい | `/agentdev/intake-capture` | inbox 項目 |
| クローズ済み Case Issue/PR から残課題を抽出したい | `/agentdev/intake-from-github` | inbox 項目 |
| inbox に項目がある | `/agentdev/intake-promote` | 採用済み / archive |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-promote` | 採用済み成果物 |
| 採用済み成果物（intake/learning/inspect）がある | `/agentdev/backlog-review` | `RU-*.md` |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| 未解決事項を課題として追跡したい | `/agentdev/issue` | 追跡Issue |
| third-party Skill を宣言（skills.yaml）に基づき取得、同期したい | `/agentdev/third-party-sync` | 取得結果報告 |
| docs 全体の意味整合性を検出したい | `/agentdev/inspect-docs` | 検出事項（finding） |
| Command/Skill 参照妥当性を検出したい | `/agentdev/inspect-skills` | 検出事項（finding） |
| 検出事項を分類したい | `/agentdev/inspect-promote` | 採用済み成果物 |
| 要件docから Root Case 確立〜マージまでを一括実行したい / 既存 Root Case Issue の番号、URL から再開したい | `/agentdev/case-auto` | マージ済み + クローズ済み |
| backlog整理サイクル（検出→昇格→統合）を1回で実行したい | `/agentdev/backlog-auto` | 検出事項、採用済み成果物、`RU-*.md` |

## 工程駆動実行（変更駆動経路と併存する別経路）

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 工程の検討テーマを初回形成したい | `/agentdev/phase-tasks-create` | テーマ初回形成の結果（テーマ一覧、参考候補と既知の必須事項の区別） |
| テーマの追加・具体化・分割・統合・廃止をしたい | `/agentdev/phase-tasks-update` | テーマ更新の結果（変更理由、旧新対応、未決事項の引継ぎ） |
| 外部検討の採用済みの戻り内容を正規成果物へ反映したい | `/agentdev/phase-artifacts-update` | 反映の結果と受領記録（衝突・未確認・保存失敗の区別） |
| 正規成果物群を独立レビューしたい、工程全体像を再構成したい | `/agentdev/phase-review` | 4区分に分けた所見と工程全体像（セッション内出力） |
| 工程を完了として次へ進めたい | `/agentdev/phase-transition` | 遷移の記録結果 |

> 工程駆動実行は標準経路とは別経路として併存する。後継経路の実現・採用まで現行の変更駆動経路が正であり、変更駆動の実行に工程駆動の操作や遷移を前置しない。各操作は単独で起動でき、他の工程操作や遷移操作を前置しない。

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

### 長い出力の補足

- `/agentdev/third-party-sync` の出力: 取得結果報告（対象一覧、取得成否、配置パス、管理外衝突の検出状況）。Tool 操作契約経由で行う
- `/agentdev/issue` の出力: 追跡Issue。Tool 操作契約経由で行う

### その他

- 各コマンドの入出力の詳細は [要件定義 → Case実行フロー](req-case-flow.md) を参照
- Intake / Learning パイプラインの詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) を参照
- 追跡Issue（`/agentdev/issue`）は Intake / Learning、Decision、RU とは別系統の課題管理である。詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) の「追跡Issue（別系統）」節を参照
- `/agentdev/case-auto` は標準実行コマンド。要求入口 2 つ（`/agentdev/req-define`、`/agentdev/backlog-auto`）から合流する標準経路（`/agentdev/req-define` → `/agentdev/case-auto`）を構成する
- `/agentdev/backlog-auto` は backlog 整理サイクル（検出→昇格→統合）を1回で実行する backlog-driven の要求入口。整理結果は `/agentdev/req-define` → `/agentdev/case-auto` へ接続する
- inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review は単独実行できるコマンドである
- 工程駆動実行の入口は上の「工程駆動実行（変更駆動経路と併存する別経路）」節の表である。変更駆動の実行に工程駆動の操作や遷移を前置しない
