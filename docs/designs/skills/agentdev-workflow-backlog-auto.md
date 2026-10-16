---
title: agentdev-workflow-backlog-auto Design
status: accepted
created: 2026-08-17
updated: 2026-10-16
---
<!-- ADF-COVERS(implementation): REQ-041-003, REQ-041-004, REQ-041-005, REQ-041-006, REQ-041-009, REQ-041-010, REQ-041-011, REQ-041-012, REQ-041-013, REQ-041-014, REQ-041-015 -->
<!-- ADF-COVERS(implementation): REQ-041-002, REQ-041-003, REQ-041-004, REQ-041-005, REQ-041-006, REQ-041-007, REQ-041-008, REQ-041-009, REQ-041-010, REQ-041-011, REQ-041-012, REQ-041-013, REQ-041-014, REQ-041-015, REQ-041-016 -->
<!-- ADF-COVERS(design): REQ-114-001, REQ-114-002, REQ-114-003, REQ-114-004, REQ-114-005, REQ-114-006, REQ-114-007, REQ-114-008, REQ-114-009, REQ-114-010, REQ-114-011, REQ-114-012, REQ-114-013, REQ-114-014, REQ-114-015 -->

# agentdev-workflow-backlog-auto Design

## 目的

backlog-auto command の workflow 実装本体。
工程間制御（順序、並列と直列化、fan-in、停止伝播、再開）を所有し、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを保持しない。

## 適用対象

- USE FOR: `/agentdev/backlog-auto` コマンド起動時の workflow 制御（工程間順序制御、昇格3系統の並行実行と競合処理の直列化、fan-in 判定、停止伝播、再開）
- DO NOT USE FOR: 単独起動。子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの所有（各子 Workflow Skill が正規の処理主体）

## 提供する判断、操作

- orchestration stage 構成（stage 1: inspect-docs 単独直列実行、stage 2: 昇格3系統、stage 3: backlog-review、stage 4〜7: 一気通貫実行の接続）
- 直列化契約（Git 同期、commit、push、共有成果物への競合書き込み、ユーザー対話の排他）
- fan-in 判定（backlog-review 開始条件、部分停止時の独立系統継続）
- resume 契約（子ワークフローの既存再開契約の利用、トップレベル進行状態の管理）
- 停止条件の伝播（inspect-docs 失敗時の下流工程非開始、全系統完了前の backlog-review 非開始、全体完了報告の抑制）

## 参照する references

- `references/` 配下に工程別制御の詳細を配置する（orchestration stage 詳細、直列化キュー、fan-in 判定、resume 手順）

## 現在の動作

### orchestration stage 構成

- stage 1: inspect-docs（単独、直列実行）
- stage 2: 昇格3系統（learning-promote、intake-promote、inspect-promote。安全に並行可能な処理は並行実行、Git 操作、共有成果物への競合書き込み、ユーザー対話は直列化）
- stage 3: backlog-review（stage 2 全系統の正常完了または対象なし終了後に開始）
- stage 4: 要件定義接続（単一 req-define 実行、入力は一式 RU の明示列挙、単一要件doc 確定）
- stage 5: 実行接続（要件doc 明示指定の単一 case-auto 実行）
- stage 6: 全体完了判定（set-state 義務スナップショットと要件定義・実行対象・検証結果の突合）
- stage 7: リリース（基準点再確認、版番導出、タグ付与、追加公開物準備、結果記録）

### 直列化契約

- Git 同期、commit、push は直列集約ポイントで実行する
- 共有成果物（競合しうる `.agentdev/` 配下パス）への書き込みを排他する
- ユーザー対話は系統識別付きで直列化する

### fan-in 判定

- 3系統すべてが正常完了または対象なし終了: backlog-review を開始する
- 1系統でも blocked / failed / 未完了: backlog-review を開始せず、工程別結果と停止理由を報告する
- 部分停止時に独立系統を連鎖停止しない

系統別の結果状態は次の読み替え表に従って fan-in 判定へ入力する（Design 本文の契約として正規所有する）。

| 子コマンドの報告状態 | fan-in 判定上の取扱い |
|---|---|
| 正常完了（promote 採用 0 件を含む） | 正常完了 |
| 対象なし終了（inbox 不在等） | 対象なし終了 |
| learning-promote の inbox.md 不在時の子コマンドエラー報告 | 対象なし終了へ読み替える（障害扱いしない） |
| blocked（user-decision-required 含む） | blocked |
| failed（実行失敗、external failure） | failed |
| 未完了（タイムアウト、中断） | 未完了 |

直列化キューの実行単位（子ワークフロー定義の永続化ポイント = commit 単位）は各子 Workflow Skill の reference 詳細に従い、本 Design では再定義しない。

### resume 契約

- 各工程は子ワークフローの既存再開契約（durable state、STEP model）を利用する
- トップレベルの進行状態は既存 STEP model / durable state 契約に従い管理する
- inspect-docs は STEP model 対象外（中断時は先頭から再実行）

### set-state 永続化形式

- 一式識別子、必須要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報（最後の正式リリース、開始コミット ID）、進捗、リリース状態（未着手／保留理由／完了）を記録する
- 配置は `.agentdev/` 配下で req-units/drafts の外（REQ-034-020 ゲート対象外）とし、全体完了とリリース完了まで保持する

### 単一書き手規則

- set-state への書込みは同一 backlog-auto 実行に限定し、backlog-auto の二重起動に対しては既存の single-flight 保護に準じて排除する

### 基準点確認手続

- 正式 SemVer タグの列挙、リリース対象コミットの祖先到達判定、最大版算出（SemVer 順序比較）、到達可能 0 件・基準なしの場合の停止と利用者判断要求、開始コミット ID の記録を含む

### 全体完了突合手続

- set-state の義務スナップショットと、要件doc の review_dispositions・Issue 完了条件・検証証跡との突合により、過不足なく対応し必要な検証結果が成立していることを確認する
- Issue 数・PR merge 状態のみで完了判定しない

### リリース手順シーケンスと再開経路

- リリース時点の正式タグ再確認、版番導出、対象コミット確定（一式の全マージ完遂時点の main HEAD）と無関係コミット混入検知（開始コミット..対象コミットの差分と一式分実変更の突合）、タグ作成、（採用方式があれば）追加公開物、結果記録の順
- 各段階の中断・失敗時は既存結果の読み戻しにより未完了段階から再開する（タグ不移動・再作成なし・第二番号なし）
- backlog-auto 再実行は set-state から完遂済み Case を検出し全体完了判定以降から再開する
- 停止報告には case-auto 単独の再開入口（REQ-034-038）に加えて一式再開経路（backlog-auto 再実行）を併記する

### 委譲

- 子ワークフロー（req-define、case-auto、整理サイクル各コマンド）への委譲は既存の委譲契約に従う
- 公開操作のうち Custom Tool カタログに含まれない操作はワークフローが準備までを行い、実行は承認後の所定経路とする

### 実装分類

manager-orchestrator（既存の実装分類を利用する）

## 一気通貫実行の実行構造（REQ-114）

実行構造の拡張（公開 interface は commands/backlog-auto.md の所有）:
- orchestration stage 構成: 既存 stage 1〜3（inspect-docs、昇格3系統、backlog-review）に続く stage 4〜7として、要件定義接続（単一 req-define 実行、入力は一式 RU の明示列挙、単一要件doc 確定）、実行接続（要件doc 明示指定の単一 case-auto 実行）、全体完了判定（set-state 義務スナップショットと要件定義・実行対象・検証結果の突合）、リリース（基準点再確認、版番導出、タグ付与、追加公開物準備、結果記録）を追加する。
- set-state 永続化形式、単一書き手規則、基準点確認手続、全体完了突合手続、リリース手順シーケンスと再開経路、委譲: 詳細は本 Design 上段の「set-state 永続化形式」「単一書き手規則」「基準点確認手続」「全体完了突合手続」「リリース手順シーケンスと再開経路」「委譲」の各節を参照（REQ-114 実行構造の正規記述は上段個別見出し節群が所有する）。

### REQ-114-013 の共通 E2E 挙動確認の設計記録（DS17）

REQ-114-013（3 採用形態での共通 E2E 挙動確認）の実装・検証実体は、3 採用形態（ADF 本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクト）の applied-projects manifest（tests/fixtures/applied-projects/{adf-self,github-connected,local-issue}/manifest.json）と tests/end-to-end-contract.test.ts である（配置は src/common/skills/agentdev-workflow-backlog-auto/ 配下）。Design 本文はその構成と位置づけを記述する: manifest は各採用形態の入口・Issue 追跡方式・リリース条件採用・公開経路の前提を宣言する fixture であり、end-to-end-contract.test.ts が manifest 群を読んで共通の E2E 挙動契約を検証する。並列実行・中断再開も各形態の manifest 宣言に従って検証対象とする。必要な環境・権限がなく確認できない条件は合格ではなく未検証として扱う。

### 再スコープ・リリース不作成・完遂判定の規律（DS19）

- 再スコープ（REQ-114-005）: req-define の壁打ちで利用者が一式の複数要件docへの分割を判断した場合、当該判断を一式の構成変更（再スコープ）として set-state に記録し、分割後の各一式はそれぞれ独立した一気通貫ライフサイクル（基準点確定から）で扱う。
- リリース不作成と報告（REQ-114-012）: RU 0 件またはリリース対象となる実変更がない場合はリリースを作成せず報告する。正式なバージョン基準がない場合は対象プロジェクトの採用済み初期バージョン規則を確認し、確認できない場合は初期バージョン番号を決定せず停止して利用者判断を求める。公開方式・権限・必要な環境が不足する場合も対象と理由を報告し、リリース完了としない。
- 完遂判定と最終報告の所有（REQ-114-015）: 一気通貫全体の完遂判定と最終報告は REQ-114 が所有する。REQ-041 の完了扱い・全体報告に係る行は backlog 整理サイクル部分に係るものであり、両者を区別する。


## 対象外

- 子ワークフロー内部の分類基準、評価基準、昇格基準、RU 生成ロジック（各子 Workflow Skill の責務）
- 既存5コマンドの廃止、置換、単独実行契約の変更
- capture 系コマンド（learning-capture、intake-capture、intake-from-github）、inspect-skills の自動起動

## 検証観点

- 工程間の開始順序と開始条件ゲートが守られること（inspect-docs 正常終了前の昇格3系統非開始、全系統正常完了前の backlog-review 非開始）
- 競合処理の直列化と系統識別付きユーザー対話が機能すること
- 中断時・再実行時に完了済み工程の重複実行と未完了工程の誤認がないこと

## v4 責務分類

ADF v4 の責務分類（正典: DEC-048、foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本 Design の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）。語彙の原本は foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節であり、本節はその確定値を記録する。

- **意味判断担当**: 0 件
- **決定的処理委譲先**: Wave scheduling（fan-in 判定）は委譲先未整備の債務（第13段 full validation で再評価）
- **知識提供**: orchestration stage 構成・停止伝播・resume 契約
