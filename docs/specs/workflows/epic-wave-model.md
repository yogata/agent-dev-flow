---
title: Epic / Wave / Issue 実行モデル
status: accepted
created: 2026-06-21
updated: 2026-06-26
---

# Epic / Wave / Issue 実行モデル

> 本 SPEC は case-open / case-run / case-close / case-auto にまたがる Epic 実行モデルの横断契約を定義する（AG-008）。
> 各コマンド固有の振る舞いは各 command SPEC を参照。

## 目的

OU（Operation Unit）、Epic、Wave、Issue の階層、状態遷移、実行モデルを定め、大規模機能追加（scale: large）の実行契約を明確にする。

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

階層パターン（2階層化、Epic は常に Wave 構造を持つ）:

| 規模 | 構成 |
|------|------|
| 単一 Issue | OU → Issue |
| 複数 Issue | OU → Epic → Wave → Issue |

Epic は常に Wave 構造を持つ。
依存関係がない場合は Wave 1 に全 Issue をまとめる。

## execution_unit 定義（REQ-0148-004）

**execution_unit** は case-open が OU 群から生成する実行単位であり、`standard issue` または `epic issue` のいずれかである。
Wave は execution_unit に含まず、Epic Issue 本文から読み取る内部構造として扱う。

| execution_unit | 内部構造 | 実行契約 |
|---|---|---|
| standard issue | 単一 Issue、Wave なし | case-run / case-close が単一 Issue を処理（REQ-0148-019, REQ-0148-020） |
| epic issue | Wave 構造を持つ | case-run(#epic) / case-close(#epic) が Wave 反復で処理 |

case-auto は複数 execution_unit 群を orchestration の対象とする（ADR-0129, REQ-0148-012）。
execution_unit 間の並列可否は連結成分（必須依存のみをエッジとする）で判定する。
詳細は後述「連結成分ベース execution_unit 構成モデル」セクション参照。

## 子Issue 実行状態 enum

| status | 意味 | 設定主体 |
|--------|------|----------|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） |
| `ready` | 依存が満たされ、case-run が実行可能と判定した状態。永続状態には書き込まれない | case-run 内部判定（永続状態に書き込まない） |
| `running` | case-run が task() 起動し実行中の状態。永続状態には書き込まれない | case-run 内部状態（永続状態に書き込まない） |
| `completed` | Issue の実装、検証、必要な case-close が完了した状態 | case-close |
| `blocked` | 要件曖昧性、外部副作用、権限不足、矛盾等により自動継続できない状態 | case-run / case-close |
| `failed` | 実装、検証、CI、PR 作成などの実行結果として失敗した状態 | case-run |

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

**停止条件**: 要件が曖昧で Issue 構造を生成できない場合、operation_units の要件に矛盾が含まれる場合

**禁止事項**:
- 機能要件、非機能要件、制約、対象外、受け入れ条件の新規作成
- 実装順序、Issue分解についてのユーザー確認要求

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

### 依存関係レベル（参考情報）

依存関係レベル（L0-L3）は Wave 構成の参考情報であり、直列化ゲートではない（「連結成分ベース execution_unit 構成モデル」参照）。
直列化要因は必須依存のみ。

| レベル | 名称 | 定義 | 直列化要因 |
|---|---|---|---|
| L0 | 完全独立 | 共通ファイルなし、specs更新なし、他Issueへの参照なし | 否 |
| L1 | Specs共有 | 複数featureが同じspecsセクションを更新する可能性あり | 否 |
| L2 | ファイル衝突 | 変更予定ファイルに重複あり | 否（rebase で解消、ADR-0132 Level 1） |
| L3 | 明示的依存 | Issue本文に明示的記述あり | 必須依存のみ直列化要因 |

### Wave 構成ルール

- 直列化要因は必須依存のみ。必須依存のない子Issue は同一Wave で並列実行する
- L2（ファイル衝突）は Wave 分離の理由としない。並列実行を許容し、コンフリクトは rebase で機械的解消する（ADR-0132 Level 1、REQ-0151-006）
- 最大5 Issues / 呼び出し（case-run Wave内並列上限、REQ-0130-026）。execution_unit 間並列にグローバル上限は適用しない
- specs更新は親エージェントのみ（直列、Issue番号昇順）

## case-run Epic Wave 実行モデル

case-run が Epic Issue 指定時の横断実行契約（ADR-0128 Decision #3, REQ-0130-026/027）。
詳細手順は `docs/specs/commands/case-run.md` 参照。

- case-run(#epic) は Epic Issue 本文を読み込む（子Issue 一覧、Wave 構成、各子Issue status、PR 状態）
- case-run(#epic) は現在 Wave の実行可能な子Issue を内部判定する（依存関係充足確認、永続状態には書き込まない）
- case-run(#epic) は各子Issue を task() で Sisyphus-Junior に並列委譲する（最大5件、各 task() は1 Issue 処理、委譲 prompt 内で `/ulw-loop` command を指定）
- case-run(#epic) は全 task() 完了を待ち、結果を収集して return する（1 Wave のみ、マージしない）
- case-run(#epic) は再実行時、Epic Issue 本文から進行状況を判定し次 Wave を処理する（べき等）

**Epic Issue 本文の単一書き手制約**: Epic Issue 本文（ステータス追跡テーブル）の更新は case-close(#epic) のみが行う（ADR-0125）。
case-run(#epic) は Epic Issue 本文を読み取るのみで書き込まない。

## case-close Epic Wave クローズモデル

case-close が Epic Issue 番号を受領した場合の PR マージ、子Issue クローズプロトコル（ADR-0128 Decision #4, REQ-0131-021〜023）。
詳細は `docs/specs/commands/case-close.md` 参照。

1. Epic Issue 本文を読み取り、現在 Wave の PR作成済み子Issue を特定する
2. 各子Issue の PR マージ、子Issue クローズ、Epic status table 更新を行う（Epic Issue 本文の単一書き手は case-close のみ）
3. 最終 Wave の場合（全子Issue がクローズ完了）、Epic Issue 自体をクローズし、Epic レベルの最終処理（intake/learning capture 含む）を実行する
4. 最終 Wave でない場合、残 Wave 状況（完了 Wave、残 Wave、次実行可能 Issue）を通知する

## Epic 統率者契約（Epic Orchestrator Contract）

scale: large（Epic）の場合、case-auto は Epic Issue に対し case-run(#epic) → case-close(#epic) の委譲を反復する（REQ-0114-086）。
複数 execution_unit 並列実行時は、各 execution_unit に相当する Issue または Epic Issue に対し個別に委譲する（ADR-0129, REQ-0148-012）。
詳細は `docs/specs/commands/case-auto.md` 参照。

- case-auto: pipeline 制御（req-save→spec-save→case-open→case-run→case-close）、execution_unit 群反復制御、OU 逐次処理
- case-run: Epic Wave 実行時の子Issue 並列委譲、全 task() 完了待機、結果収集、Findings / Capture候補件数の集約
- case-close: Epic Wave クローズ時の PR マージ、子Issue クローズ、Epic Issue 本文ステータス追跡テーブルの単一書き手

**per-Epic 単一書き手（ADR-0129 拡張、REQ-0148-021）**: 複数 execution_unit 並列実行時、Epic Issue 本文の単一書き手は per-Epic-Issue-body で維持される。
複数 case-close が並列実行されても、それぞれが書き込む Epic 本文は異なる。
Epic Issue 1 件あたりの単一書き手制約（ADR-0125）は維持され、Epic 間で書き込み対象が衝突しない。

## 結果状態遷移と出力契約

| case-run 結果 | Issue status 遷移 | case-auto アクション |
|---------------|-------------------|---------------------|
| completed(pr) | `running` → `completed` | case-close 相当処理を実行 |
| blocked | `running` → `blocked` | 停止理由を報告し再開可能コマンドを提示 |
| failed | `running` → `failed` | 正常完了した他 Issue のみ case-close 対象とする |

**親コンテキスト非累積原則**: case-auto は子 Issue の実装詳細、実装過程ログを親コンテキストに保持しない。
進行状態は永続状態（Issue / PR / `.agentdev/`）から再読込する。

## 連結成分ベース execution_unit 構成モデル（REQ-0148, ADR-0129）

### 連結成分アルゴリズム（REQ-0148-006）

case-open は OU 群の依存グラフから連結成分を計算し、各連結成分を Epic 候補の出発点とする。
エッジには**必須依存のみ**を含める。
技術的依存（L0-L3）、弱依存、関連依存は連結成分のエッジから外す。

依存強度の3レベル（REQ-0148-007）:

| 強度 | 定義 | 連結成分への影響 |
|---|---|---|
| 必須 | 一方が他方なしでは成立しない（インターフェース契約、データモデル依存等） | 連結成分のエッジとする |
| 弱 | 実装順序の推奨はあるが並列実行可能 | 連結成分のエッジにしない |
| 関連 | 同一機能領域だが実行上の依存はない | 連結成分のエッジにしない |

技術的依存レベル（L0-L3）は Wave 構成（Epic 内部）のための情報であり、連結成分計算と execution_unit 並列判定からは外す（REQ-0148-014）。

### 3軸判断モデル（REQ-0148-007）

連結成分を Epic 化するか、複数 Epic に分割するか、Standard flow に分散するかは、以下3軸で case-open が自律判定する。

| 軸 | 定義 | 制約 |
|---|---|---|
| 依存強度 | 連結成分内の OU 間依存強度（必須/弱/関連） | 必須依存で結合した OU 群は原則として同一 Epic。例外は REQ-0148-023 参照 |
| Epic サイズ | 1 Epic あたりの子 Issue 数 | 推奨 3-10、上限 10 ハード制約（REQ-0148-009）。上限超過時は必須依存があっても分割を検討 |
| 機能的一貫性 | 連結成分内の OU 群が単一の機能的主題を成すか | 機能的主題を欠く場合は複数 Epic へ分割、または Standard flow へ分散 |

**単独根の Standard flow 扱い**: 連結成分が 1 OU だけ（単独根）の場合、Epic 化せず Standard flow とする（REQ-0148-008）。

**必須依存がある場合の Epic 分割例外（REQ-0148-023）**: 以下のいずれかを満たす場合は必須依存があっても別 Epic への分割を許容する。

- 事前契約（SPEC 確定、インターフェース合意等）で並列実施可能な場合
- 依存先 Epic が完了済みまたは完了確定の場合
- 分割により Epic サイズが推奨範囲（3-10）に収まる場合

case-open は無関係な OU 群を単一 Epic へ機械的に集約しない（REQ-0148-010）。
Epic 構成推論の根拠を Epic Issue 本文または `case_open_hints` に記録する（REQ-0148-011, REQ-0138-020）。
3軸判断の個別エッジケース（同機能独立、共通基盤等）は LLM 推論に委ねる。
REQ/SPEC で固定するのは不変の方針（依存強度3レベル定義、Epic サイズ上限、単独根 Standard flow）のみである。

### execution_unit 並列 orchestration

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を処理対象とする（REQ-0148-012）。
必須依存（連結成分のエッジ）がない複数 execution_unit 間は並列実行できる（REQ-0148-014）。

並列実行の制約:

- 同一 Epic 内の Wave 間は直列（REQ-0148-013）
- execution_unit 間の並列可否は連結成分（必須依存）のみで判定する。技術的依存レベル（L0-L3）は並列判定軸から外し、ファイル衝突（L2）があっても並列を許容する（REQ-0148-014）
- case-auto レベルでのグローバル並列上限は設定しない（REQ-0148-018）。case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とする。N 個の execution_unit が並列実行された場合、N×5 件の task() 同時起動リスクを許容する（運用監視対象、ADR-0129）
- PR マージコンフリクト発生時は 3レベルコンフリクト解消モデル（ADR-0132、REQ-0151）に従う。Level 1 は case-close が rebase による機械的解消を試みる（REQ-0148-024、REQ-0151-001）。Level 2 は case-auto が両PRのdiffを読み取りコンフリクト文脈を付けて case-run へ再委譲する（最大2回、計3回の case-run 実行、REQ-0151-003/004）。Level 3 は case-auto がマージ順序変更、blocked 単位の隔離（REQ-0148-015 拡張）を行う。3段階すべてを試行しても解消できない場合のみ停止する（REQ-0151-006）。worktree 分離により作業自体は並列可能であり、マージコンフリクト解決コストを受容する（ADR-0129）。詳細は `docs/specs/commands/case-auto.md` コンフリクト解消モデル、`docs/specs/commands/case-close.md` Step 4-2 参照

詳細な orchestration ロジック（blocked 部分停止、ready 継続判定フロー、execution_unit 群反復制御）は `docs/specs/commands/case-auto.md` 参照。

## 前工程完了度3段階分類（REQ-0146-010）

OU 属性「前工程完了度」を追加する。
本属性は子 Issue 実行状態 enum（pending / ready / running / completed / blocked / failed）とは直交する分類であり、前工程（req-save / spec-save）の完了状況を表す。

| 前工程完了度 | 意味 | subagent の振る舞い（REQ-0146-012） |
|---|---|---|
| 完全完了 | req-save / spec-save 等の前工程で実施済み、追加作業不要 | 通常実行（acceptance criteria 順位検証を実施） |
| 検証のみ | 前工程完了を前提、acceptance criteria 順位検証のみ実施 | acceptance criteria 順位検証は必須、前工程相当作業は実施しない |
| 補完あり | 前工程に残余あり、補完実装の可能性 | 前工程相当作業の補完可能性を考慮しつつ acceptance criteria 順位検証を実施 |

case-open は子 Issue 本文に本属性を埋め込む（REQ-0146-011）。
subagent は属性に応じた振る舞い指針に従う。

## バッチ Issue 運用における OU ごとの完了判定追跡性（REQ-0146-014）

バッチ Issue 運用（複数の OU を単一 Issue または複数 Issue で処理する運用）では、各 OU の完了判定を追跡可能にすること。
以下のいずれかのパターンで OU 完了判定追跡性を確保する。

### パターン1: sub-issue 分離

- 各 OU を独立した sub-issue として分離する
- 各 sub-issue に個別の完了条件チェックボックスを持たせる
- 親 Issue（バッチ Issue 本体）は sub-issue の完了状況を集約して表示する
- **適用ケース**: 各 OU の完了判定が独立しており、個別 Issue として管理すべき場合

### パターン2: Issue 本体の完了判定表

- 単一 Issue 本体に完了判定表を含める
- 完了判定表には各 OU の完了判定を記録する
- テーブル形式で「OU ID / 完了条件 / 状態 / 検証」を管理する
- **適用ケース**: 各 OU の完了判定が強い依存関係にあり、単一 Issue 内で一括管理すべき場合

### パターン選択基準

| 判断軸 | パターン1（sub-issue 分離） | パターン2（Issue 本体の完了判定表） |
|---|---|---|
| **OU 間依存関係** | 弱い依存（独立して実行可能） | 強い依存（順序依存、状態共有） |
| **並列実行可能性** | 並列実行可能 | 並列実行困難、順次実行が必要 |
| **Issue 管理の複雑さ** | 複数 Issue 管理を許容 | 単一 Issue で一元管理したい |

Epic Issue のステータス追跡テーブルは「バッチ Issue 単位」の完了判定を管理し、各バッチ Issue 内の OU 完了判定追跡とは二重管理しない。

## See Also

- [workflow-contracts.md](workflow-contracts.md)（ワークフロー全体契約）
- [delegation-contracts.md](delegation-contracts.md)（サブエージェント委譲契約）
- `docs/specs/commands/case-open.md`（Epic 構成生成）
- `docs/specs/commands/case-run.md`（Epic Wave 実行）
- `docs/specs/commands/case-close.md`（Epic Wave クローズ）
- `docs/specs/commands/case-auto.md`（Epic pipeline 制御）
- `agentdev-epic-tracker` skill（ステータス追跡テーブル）
- ADR-0125（Epic Issue 本文単一書き手）
- ADR-0128（case-run / case-close Epic Wave モデル）
- ADR-0129（複数 execution_unit 並列実行モデル）
- ADR-0132（コンフリクト解消モデル（3レベルエスカレーションと責務割当））
