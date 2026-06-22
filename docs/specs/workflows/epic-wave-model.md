---
title: Epic / Wave / Issue 実行モデル
status: accepted
created: 2026-06-21
updated: 2026-06-22
---

# Epic / Wave / Issue 実行モデル

> 本 SPEC は case-open / case-run / case-close / case-auto にまたがる Epic 実行モデルの横断契約を定義する（AG-008）。各コマンド固有の振る舞いは各 command SPEC を参照。

## 目的

OU（Operation Unit）・Epic・Wave・Issue の階層・状態遷移・実行モデルを定め、大規模機能追加（scale: large）の実行契約を明確にする。

## OU / Epic / Wave / Issue 階層

```text
OU (Operation Unit):
  要件変更の処理単位。req-define / backlog-review 由来。
  実装順序やIssue分解そのものではない。

Epic:
  case-open が OU を実行可能にするために作る上位 Issue。
  大きな OU を複数 Issue で処理する必要がある場合に作成。
  子 Issue 全体の進捗 SSoT を持つ。

Wave:
  Epic 内の実行段階。case-open が技術的依存関係から作成。
  Wave 内 Issue は同じ前提条件のもとで実行可能。
  Wave 間には順序がある。

Issue:
  case-run が1回で扱う最小実装単位。
  サブエージェント委譲の単位。PR作成・検証・case-close の単位。
```

階層パターン（2階層化・Epic は常に Wave 構造を持つ）:

| 規模 | 構成 |
|------|------|
| 単一 Issue | OU → Issue |
| 複数 Issue | OU → Epic → Wave → Issue |

Epic は常に Wave 構造を持つ。依存関係がない場合は Wave 1 に全 Issue をまとめる。

## 子Issue 実行状態 enum

| status | 意味 | 設定主体 |
|--------|------|----------|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） |
| `ready` | 依存が満たされ、case-run が実行可能と判定した状態。永続状態には書き込まれない | case-run 内部判定（永続状態に書き込まない） |
| `running` | case-run が task() 起動し実行中の状態。永続状態には書き込まれない | case-run 内部状態（永続状態に書き込まない） |
| `completed` | Issue の実装・検証・必要な case-close が完了した状態 | case-close |
| `blocked` | 要件曖昧性・外部副作用・権限不足・矛盾等により自動継続できない状態 | case-run / case-close |
| `failed` | 実装・検証・CI・PR 作成などの実行結果として失敗した状態 | case-run |

- `skipped` は採用しない（REQ-0106-030）。前提未達の Issue は `pending` のまま選択対象外となる。
- Wave 状態は保存しない。Wave 内 Issue 状態から導出する。
- OU / Epic の状態は進捗集約として扱い、主たる実行状態は Issue 状態とする。
- `ready` / `running` は case-run(#epic) の内部状態であり、Epic Issue 本文（永続状態）には書き込まれない。永続状態に書き込まれるのは `pending` → `completed` / `blocked` / `failed` の遷移のみ（case-close が単一書き手: ADR-0125）。

## case-open 構成生成基準

case-open は要件doc の operation_units を読み取り、以下を自律生成する:

- Epic 要否判定（単一 Issue で完結する場合は Epic を作成しない）
- Issue 分解（OU を実装可能なサイズに分割）
- 依存関係設定（技術的依存に基づく Wave 構成）
- 初期 status 付与（原則 `pending`）

**停止条件**: 要件が曖昧で Issue 構造を生成できない場合・operation_units の要件に矛盾が含まれる場合

**禁止事項**:
- 機能要件・非機能要件・制約・対象外・受け入れ条件の新規作成
- 実装順序・Issue分解についてのユーザー確認要求

詳細は `docs/specs/commands/case-open.md` 参照。

## Epic 検出ルール

| 条件 | 結果 |
|---|---|
| Issue に `epic` ラベルが付与されている | Epic 実行モード |
| Issue 本文に `## 実行順序` セクションがあり、Wave 列を持つ Markdown テーブルが存在する | Epic 実行モード |
| 上記いずれにも該当しない | 単一 Issue モード |

## Wave 解析プロトコル

1. Epic Issue 本文の `## 実行順序` セクションを特定
2. Wave テーブルを抽出: 列構成 `Wave / Issue / 実行方法 / 前提`
3. Wave 番号でグルーピング
4. バリデーション: 前提列に記載された Wave の完了後に後続 Wave の Issue を実行すること。1 Wave内の同時実行子Issue上限は5件

## Wave 失敗時後続制御

| 条件 | アクション |
|---|---|
| 兄弟 Issue が失敗 | 同一 Wave 内の他 Issue は継続 |
| 後続 Wave が失敗 Issue に依存しない | 後続 Wave を継続 |
| 後続 Wave が失敗 Issue に依存する | 該当 Wave をスキップ |
| 依存有無が判定不能 | 安全側: 該当 Wave をスキップ |
| 全 Issue が失敗 | 後続 Wave を実行せず集約失敗報告で停止 |

## Wave スケジューリング（多重Issueモード）

### 依存関係レベル

| レベル | 名称 | 定義 | 実行方法 |
|---|---|---|---|
| L0 | 完全独立 | 共通ファイルなし、specs更新なし、他Issueへの参照なし | 並列実行 |
| L1 | Specs共有 | 複数featureが同じspecsセクションを更新する可能性あり | 並列実行（specs更新は直列） |
| L2 | ファイル衝突 | 変更予定ファイルに重複あり | Wave分離（同一Wave並列不可） |
| L3 | 明示的依存 | Issue本文に明示的記述あり | 順次実行 |

### Wave 構成ルール

| Wave | 対象Issue | 実行方法 |
|---|---|---|
| Wave 1 | L0 + L1 Issues | 並列実行（L1はspecs更新を直列） |
| Wave 2+ | L2 Issues（1件ずつ別Wave）+ L3 Issues | 直列 |

- 制約: 最大5 Issues / 呼び出し
- specs更新は親エージェントのみ（直列・Issue番号昇順）

## case-run Epic Wave 実行モデル

case-run が Epic Issue 指定時の横断実行契約（ADR-0128 Decision #3, REQ-0130-026/027）。詳細手順は `docs/specs/commands/case-run.md` 参照。

- case-run(#epic) は Epic Issue 本文を読み込む（子Issue 一覧・Wave 構成・各子Issue status・PR 状態）
- case-run(#epic) は現在 Wave の実行可能な子Issue を内部判定する（依存関係充足確認・永続状態には書き込まない）
- case-run(#epic) は各子Issue を task() で Sisyphus-Junior(ulw-loop) に並列委譲する（最大5件・各 task() は1 Issue 処理）
- case-run(#epic) は全 task() 完了を待ち、結果を収集して return する（1 Wave のみ・マージしない）
- case-run(#epic) は再実行時、Epic Issue 本文から進行状況を判定し次 Wave を処理する（べき等）

**Epic Issue 本文の単一書き手制約**: Epic Issue 本文（ステータス追跡テーブル）の更新は case-close(#epic) のみが行う（ADR-0125）。case-run(#epic) は Epic Issue 本文を読み取るのみで書き込まない。

## case-close Epic Wave クローズモデル

case-close が Epic Issue 番号を受領した場合の PR マージ・子Issue クローズプロトコル（ADR-0128 Decision #4, REQ-0131-021〜023）。詳細は `docs/specs/commands/case-close.md` 参照。

1. Epic Issue 本文を読み取り、現在 Wave の PR作成済み子Issue を特定する
2. 各子Issue の PR マージ・子Issue クローズ・Epic status table 更新を行う（Epic Issue 本文の単一書き手は case-close のみ）
3. 最終 Wave の場合（全子Issue がクローズ完了）、Epic Issue 自体をクローズし、Epic レベルの最終処理（intake/learning capture 含む）を実行する
4. 最終 Wave でない場合、残 Wave 状況（完了 Wave・残 Wave・次実行可能 Issue）を通知する

## Epic 統率者契約（Epic Orchestrator Contract）

scale: large（Epic）の場合、case-auto は Epic Issue に対し case-run(#epic) → case-close(#epic) の委譲を反復する（REQ-0114-086）。詳細は `docs/specs/commands/case-auto.md` 参照。

- case-auto: pipeline 制御（req-save→spec-save→case-open→case-run→case-close）・Wave 反復制御・OU 逐次処理
- case-run: Epic Wave 実行時の子Issue 並列委譲・全 task() 完了待機・結果収集・Findings / Capture候補件数の集約
- case-close: Epic Wave クローズ時の PR マージ・子Issue クローズ・Epic Issue 本文ステータス追跡テーブルの単一書き手

## 結果状態遷移と出力契約

| case-run 結果 | Issue status 遷移 | case-auto アクション |
|---------------|-------------------|---------------------|
| completed(pr) | `running` → `completed` | case-close 相当処理を実行 |
| blocked | `running` → `blocked` | 停止理由を報告し再開可能コマンドを提示 |
| failed | `running` → `failed` | 正常完了した他 Issue のみ case-close 対象とする |

**親コンテキスト非累積原則**: case-auto は子 Issue の実装詳細・実装過程ログを親コンテキストに保持しない。進行状態は永続状態（Issue / PR / `.agentdev/`）から再読込する。

## case-auto 並列委譲モデル拡張（REQ-0114-087〜093）

### 独立 OU の自動 Epic 化

case-open は複数独立 OU（`depends_on` 空・L0 相当）を検出した場合、自動的に Epic Issue 化し Wave 1 に全 OU を配置する（REQ-0114-088）。これにより Standard flow と Epic flow の二系統を単一 Wave 実行モデルに統一する。

### 並列委譲上限と集約

- 独立 OU または同一 Wave 内子Issue の並列委譲は最大5件（L93, L123 準拠・REQ-0114-087）
- 直列集約対象（採番・index・draft・commit・push・Epic 本文更新）は並列委譲完了後に親コマンドが実行（REQ-0114-093）
- Epic 本文ステータス追跡テーブルの単一書き手制約（L136, ADR-0125）は集約更新で維持

## See Also

- [workflow-contracts.md](workflow-contracts.md) — ワークフロー全体契約
- [delegation-contracts.md](delegation-contracts.md) — サブエージェント委譲契約
- `docs/specs/commands/case-open.md` — Epic 構成生成
- `docs/specs/commands/case-run.md` — Epic Wave 実行
- `docs/specs/commands/case-close.md` — Epic Wave クローズ
- `docs/specs/commands/case-auto.md` — Epic pipeline 制御
- `agentdev-epic-tracker` skill — ステータス追跡テーブル
- ADR-0125 — Epic Issue 本文単一書き手
- ADR-0128 — case-run / case-close Epic Wave モデル
