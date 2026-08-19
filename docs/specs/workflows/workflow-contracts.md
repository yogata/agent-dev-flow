---
title: ワークフロー契約（横断）
status: accepted
spec_logical_division: cross_cutting_contract
canonical_owner: workflow-contracts
created: 2026-06-21
updated: 2026-08-19
---

# ワークフロー契約（横断）

> **Scope**: 本 SPEC は agent-dev-flow リポジトリに適用される横断契約である。
> 個別 command / skill の現在動作は各 command SPEC（`docs/specs/commands/`）、各 skill SPEC（`docs/specs/skills/`）を参照のこと。
> 横断 SPEC は個別 SPEC の代替ではない。

## 目的

ワークフロー全体像、共通フェーズ、共通状態、artifact lifecycle など、複数コマンド、スキルにまたがる契約を定義する（REQ-005）。

## パイプライン概要

AgentDevFlow は 3 つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-promote | 学びの蓄積、昇華 |
| intake | intake-capture / intake-from-github → intake-promote | 改善候補の収集、昇華 |

## コマンド分類

AgentDevFlow の公開コマンドは以下の5分類のいずれかに属する（REQ-005-048）。

| 分類 | コマンド | 目的 |
|---|---|---|
| 主フロー | req-define → req-save → spec-save（SPEC候補がある場合）→ case-open → case-run → case-close → case-update | 要件定義から実装完了までの標準ワークフロー |
| 最大自走入口 | case-auto, backlog-auto | 追加入口。case-auto は req-define 完了後の後続工程を一括自走、backlog-auto は backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行。標準フローを置換しない（REQ-005-049、REQ-005-011） |
| 補助フロー | intake-capture, intake-from-github, intake-promote, learning-promote, backlog-review | 改善候補収集、学び蓄積、RU化。主フローを補完 |
| 検出フロー | inspect-docs, inspect-skills, inspect-promote | 文書、スキルの意味検出、分類、昇格 |
| リポジトリローカル検査 | /repo/docs-check | AgentDevFlow 本体リポジトリ内の機械的整合性検査 |

- case-auto は標準フロー（req-save → spec-save → case-open → case-run → case-close）を内部的に呼び出す追加入口であり、標準フローを置換、廃止しない（REQ-006-017）。spec-save は `artifact_actions` に `artifact: spec` entry が含まれる場合に実行し、旧形式 draft（同フィールドなし）は後方互換で従来順序で実行する（v2:ADR-0123, REQ-001-014）。
- backlog-auto は標準の backlog 整理フロー（inspect-docs、昇格3系統、backlog-review の個別コマンド逐次実行）を置換しない追加入口であり、backlog 整理サイクル（inspect-docs → 昇格3系統（learning-promote、intake-promote、inspect-promote）→ backlog-review）を1回起動で実行する（REQ-005-011、REQ-041）。
- 補助フロー、検出フロー、リポジトリローカル検査は、主フロー、最大自走入口とは独立して実行可能である。
- 検出フローの出力（検出事項: inspect finding）は、inspect-promote → backlog-review を経て RU 化され、req-define の入力となる。

## フェーズ定義

### マクロフェーズ

開発ワークフローを3つのマクロフェーズで定義する。

| マクロフェーズ | 定義 | 対応マイクロフェーズ |
|---|---|---|
| 壁打ち | 要件定義、分析、Issue作成前の合意形成 | requirement + analyzed |
| 構造的実行 | Issue作成後の実装、PR作成、進捗管理 | created + in_progress |
| レビュー完了 | PR作成後のレビュー、マージ、完了処理 | review + done |

### マイクロフェーズ

> **注意**: 以下の6マイクロフェーズは説明用ラベルであり、状態管理モデルではない（REQ-001-023）。
> 実際の状態管理は Issue ラベル、GitHub Project で行う。

| フェーズ | 状態 | マクロフェーズ |
|---|---|---|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了、Issue未作成 | 壁打ち |
| `created` | Issue作成済み、作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR作成済み、レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む） | レビュー完了 |

### ワークフロー状態管理

ワークフロー状態（例: "要件定義", "実装", "テスト" 等）は Issue ラベル、GitHub Project で管理する（REQ-001-037）。
REQ/SPEC 文書内には状態として埋め込まず、上記マイクロフェーズは説明目的でのみ使用する。

## SSoT 遷移規則

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ | SSoT | 説明 |
|---|---|---|
| 壁打ち | セッション会話 + draft | 壁打ちで合意形成された要件、分析 |
| 構造的実行 | Issue本文 + Work Plan | 要件doc + 実行計画 |
| レビュー完了 | PR + レビュー結果 | コードレビュー結果とマージ状態 |

### draft の位置づけ

draft（`.agentdev/drafts/req-draft-*.md`）は壁打ちフェーズ内の一時ハンドオフであり、構造的実行以降のSSoTはIssue本文とWork Planである。

- ライフサイクル: `draft` → `saved`（req-save完了）→ `issued` + 削除（case-open完了）
- 構造的実行フェーズ以降: draft は存在しない（case-open完了時に削除）

### フェーズ境界ルール

壁打ち→構造的実行の境界で満たすべき要件: 壁打ちフェーズ完了時、docs変更を必ずコミット、プッシュする。
これにより構造的実行フェーズのworktreeがdocs変更を継承する。

### Local backend の SSoT 位置づけ

Local backend（ローカル版 OpenCode）では、構造的実行以降の SSoT は GitHub Issue / PR ではなくローカル Case ファイル（`.agentdev/cases/case-{NNNN}.md`）である（REQ-009-021〜023）。

| マクロフェーズ | Local backend の SSoT |
|---|---|
| 壁打ち | セッション会話 + draft（GitHub backend と共通） |
| 構造的実行 | Case ファイル本文 |
| レビュー完了 | Case ファイル `## マージ結果` |

詳細は `docs/specs/local/local-case-file.md` を参照。

## STEP model

workflow は STEP（resume point）単位で構成する（DEC-011）。各STEP の構造・開始条件・完了判定は
step-reference-contract.md が正規所有者。Input Resolution と durable state 優先順位は
input-resolution-and-durable-state.md が正規所有者。

### 状態遷移

workflow は正常系・blocked・failed・resume の状態遷移を持つ。blocked / failed で未完了STEP を
completed と誤認しない。
中断再実行時は current STEP から安全に再開する。
外部依存取得失敗時は
状態推測せず blocked / failed 扱いとする。
no-op / empty state の外部挙動を維持する。

## コマンド I/O 契約（共通）

各コマンドの入力、出力、前提条件の詳細は各 command SPEC（`docs/specs/commands/<command>.md`）を参照。
本節は横断 I/O 契約のみを定義する。

### 参照フロー（共通）

| コマンド | specs | ADR | REQ | finding | learning | intake | integrity |
|---|---|---|---|---|---|---|---|
| `/agentdev/req-define` | - || READ | READ（明示入力時） | - || - |
| `/agentdev/req-save` | - | WRITE | WRITE | WRITE（SPLIT検出時） | - || - |
| `/agentdev/spec-save` | WRITE | - || - || - ||
| `/agentdev/case-open` | READ | READ | READ | - || - ||
| `/agentdev/case-run` | READ+WRITE | READ | READ | - || - ||
| `/agentdev/case-close` | - || READ | - | WRITE（capture） | WRITE（capture） | - |
| `/agentdev/case-auto` | READ+WRITE | READ+WRITE | READ+WRITE | - | WRITE（capture） | WRITE（capture） | - |
| `/agentdev/case-update` | - || READ+WRITE | - || - ||

## ワークフロー経路制御

work_type と scale により workflow_route を決定する。
work_type は bugfix / feature / maintenance / docs_chore の 4 値である（REQ-001-011, REQ-005-014）。
通常Caseの scale は feature のみ standard / large をとる（REQ-005-005）。
実証Case（REQ-043 の定義による）は work_type にかかわらず scale と Issue 構造を選択できる（REQ-005-005）。

| work_type | scale | workflow_route |
|---|---|---|
| feature | standard | req_backed_case |
| feature | large | epic_case |
| bugfix | - | direct_case |
| maintenance | - | direct_case |
| docs_chore | - | direct_case |

上記経路表の適用前提は通常Caseである。ラベルマッピング、規模判定条件の詳細は各 command SPEC および `agentdev-workflow-lifecycle` skill を参照。

## 実装分類（Implementation Pattern Taxonomy）

コマンドの内部構造に基づく分類軸（REQ-002-016）。
work_type とは直交する概念である。

| Pattern | 日本語名称 | 主責務 |
|---|---|---|
| wall-session | 対話セッション型 | ユーザーとの対話セッションを通じて構造化成果物を生成 |
| file-pipeline | ファイル変換パイプライン型 | 定義されたステップに従いファイルを変換、生成 |
| manager-orchestrator | 状態機械統制型 | 複数フェーズ構成の状態機械、自己修復ループ、サブエージェント |
| capture-only | データ収集型 | データを収集、記録しinboxに保存 |
| read-only-diagnostic | 検査対象を直接修正しない診断型 | アーティファクトを分析しレポートを出力 |

各コマンドがどの Pattern に属するかは各 command SPEC を参照。

## case-auto / case-run 委譲モデル

AgentDevFlow は case-auto と case-run の2階層委譲構造で大規模自走を実現する。
委譲 chain 破綻を避けるため、case-run は case-auto 内でインライン実行し、実行担当サブエージェントへの委譲起点を case-auto に集約する（委譲起点の折りたたみ）。

### case-auto 構成工程委譲

case-auto は構成工程（req-save、spec-save、case-open、case-close）を各工程の Workflow Skill を権威情報源とする委譲起動で実行する。
case-auto 本体は薄いオーケストレータに専念し、入力解決、工程分岐、工程間状態引き継ぎ、停止条件検出、完了報告、OU と子Issue ループ制御、クリーンアップ検証ゲートのみを保持し、工程内部ロジックを実行しない。

case-run は case-auto 内でインライン実行する（構成工程委譲の対象外）。
実行担当サブエージェントへの委譲を case-auto から直接行う。

各工程の委譲契約は委譲時最小契約（inputs、side_effect_boundary、output_contract）に従う。
詳細は [delegation-contracts.md](delegation-contracts.md) 参照。

委譲起動が失敗（ツール不在、ハードリジェクト）、または結果が delegation-unavailable、blocked/failed で委譲 chain 破綻に起因する場合は当該工程をインライン実行へフォールバックする。
genuine blocker（実装上の問題、スコープ外操作等）はフォールバック対象外とし停止条件として扱う。

Epic Issue 本文の単一書き手は case-close が担う。
case-auto は Epic Issue 本文の更新責務を持たない。

### case-run 実行担当サブエージェント委譲

case-run は実装作業を実行担当サブエージェントへ委譲する。
実行担当サブエージェントの選定、起動方式、timeout、retry 等の実行制御は harness 側の責務であり、配布物である case-run 本文には依存させない。

実行担当サブエージェントは委譲 prompt 内で指定された command を使用し、Issue を success criteria に分解、各 criterion に observable evidence を要求、品質ゲート（code review、QA review、gate review）を実行する。
監査トレイルは worktree 配下に配置され、worktree 削除時に破棄する。

case-run のスコープは単一 Issue または単一 Wave である。
Epic 全体（複数 Wave）は Wave 境界で PR マージ（case-close 責務）が必要なため扱わない。

### result 4状態契約

実行担当サブエージェントの result 契約は次の4状態を取る。

| 状態 | 意味 | 後続アクション |
|---|---|---|
| `completed-pr` | 実装、検証、PR 作成が完了 | case-close へ |
| `blocked` | 要件曖昧性、外部副作用、権限不足等で自動継続不能 | 停止理由を報告し再開可能コマンドを提示 |
| `failed` | 実装、検証、CI、PR 作成等の実行結果として失敗 | 正常完了した他 Issue のみ case-close 対象とする |
| `delegation-unavailable` | 実行インフラが委譲を起動できなかった状態。実行が試行されていない | インフラ修正後に再実行可能。`pending` へ戻す |

詳細な状態遷移と case-auto アクションは [epic-wave-model.md](epic-wave-model.md)「結果状態遷移と出力契約」参照。

## 共通実行契約

全公開処理は、処理の複雑さにかかわらず、実行状態、処理固有の結果、停止した場合の理由、再開可能か否かを共通して表現できる実行契約を持つ（REQ-005-025、DEC-015）。

- 実行状態と処理固有の結果を別概念として扱う。処理自体は完了したが警告あり、と、処理が中断され結果未確定、を区別し、既存処理が持つ複数次元の結果（pass / warn / fail / partial、artifact_action 適用結果、OU ライフサイクル状態等）を共通実行状態へ押し潰さない。
- 既存処理は、停止したとき、中断状態から再開するとき、正常終了または異常終了するときに、共通実行契約に基づく状態を必要な範囲で報告する。報告では実行状態、停止理由、再開可否、処理固有結果を意味的に区別する（REQ-005-028）。
- ADF 所有の決定論的判断と実行基盤への委譲境界: 実行状態の遷移、処理単位間の依存関係判定、実行可能な処理単位の判定、不正な状態遷移の拒否、再開位置の再構成、並列分岐後の合流可否判定、処理結果の集約、実行中に守るべき不変条件の検査は ADF の決定論的実行中核が所有する。実際の起動機構、エージェント数、起動 API は実行基盤（harness）への委譲対象とし、ADF の正規契約へ固定しない（DEC-015、REQ-011-019）。
- 状態機械適用の選択基準: 状態機械による制御は、複数段階からなる、中断・再開を必要とする、複数の処理単位を持つ、並列分岐・合流を持つ、処理単位間の依存関係を持つ、外部処理の完了待ちを持つ、一部成功・一部失敗を扱う、のいずれかを必要とする処理に限定する。単純な収集処理や読み取り専用診断へ一律に重い状態機械を導入しない（REQ-005-026）。再開時の正規状態優先とローカル一時実行状態の取扱いは [input-resolution-and-durable-state.md](input-resolution-and-durable-state.md)「ローカル一時実行状態と再開」節を正とする（REQ-005-027）。

## promote系判断確定とHITL境界（新規セクション）

本節は intake-promote / learning-promote / inspect-promote 共通の自律確定可否の詳細判定表を集約所有する。
REQ-003-055/056 が所有する原則の詳細判定表であり、3つの Workflow Skill・command SPEC は同一内容を重複保持しない。

### 自律確定可能要件

| # | 要件 |
|---|---|
| 1 | 適用すべき既存契約と判断根拠を特定できる |
| 2 | 選択肢間に本質的な競合が残っていない |
| 3 | ユーザー固有の目的・価値観・優先順位の推測を要しない |
| 4 | 要件・仕様の新しい対象範囲をユーザーに代わって決定しない |
| 5 | 正規情報源間に未解決の矛盾がない |
| 6 | 判断に必要な情報が欠落していない |
| 7 | 必要な対論型レビューを実施済みなら未解決の本質的争点が残っていない |
| 8 | 既存の明示的な安全境界を迂回しない |

### HITL移送条件

| # | 条件 |
|---|---|
| 1 | 複数の妥当な選択肢が残る |
| 2 | ユーザー固有の価値判断・優先順位が必要 |
| 3 | 対象範囲の新規決定 |
| 4 | 正規情報源同士の矛盾 |
| 5 | 証拠・情報不足 |
| 6 | レビュー未解決争点の残存 |
| 7 | 必須検証・外部依存の利用不能 |
| 8 | 明示承認そのものを安全境界と要求する契約 |

### 判定と運用の共通規則

- モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない
- 部分自律確定: 同一実行内に自律確定可能項目とユーザー判断必要項目が混在する場合、未決項目に依存しない項目を先行確定する
- 単純な意見差・形式的最終確認のみを理由とするHITL移送を禁止する
- 証跡（判定結果、主要根拠、HITL不要と判断した理由）は既存の評価レポート、分類結果、採用済み成果物、実行報告を利用し、新規永続成果物を必須としない
- 処理対象が空の場合はHITLを発生させず正常な「対象なし」として完了する
- inspect-promote --auto は従来どおり明示opt-inのfast pathであり、通常経路の自律確定とは別概念とする

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（REQ-001）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（REQ-001）。

## See Also

- [REQ-006](../../requirements/REQ-006.md)（Case実行オーケストレーション: case-open/case-run/case-close/case-auto 親 REQ）
- [delegation-contracts.md](delegation-contracts.md)（サブエージェント委譲契約）
- [capture-boundaries.md](capture-boundaries.md)（キャプチャ境界）
- [epic-wave-model.md](epic-wave-model.md)（Epic / Wave / Issue 実行モデル）
- [backlog-artifact-lifecycle.md](backlog-artifact-lifecycle.md)（RU / 採用済み成果物 / draft lifecycle）
- 各 command SPEC（`docs/specs/commands/`）、各 skill SPEC（`docs/specs/skills/`）
- `agentdev-workflow-routing` skill（work_type ルーティング詳細）
- `agentdev-workflow-lifecycle` skill（work_type 判定、scale 昇格）

## adversarial-review 由来の停止信号

本節は adversarial-review caller integration（REQ-014）に由来する停止信号の正規化を所有する。
result 4状態契約（completed-pr/blocked/failed/delegation-unavailable）は「result 4状態契約」節が正であり、本節は変更しない。

### user-decision-required の位置づけ（REQ-014-012）

user-decision-required は case-run result enum の第5状態ではなく、既存結果に付随する case-auto の停止理由分類である（REQ-014-012）。
adversarial-review 由来の unresolved なユーザー判断事項は、result 4状態のいずれかへ折り畳んで伝播し、新規状態を増やさない。

| 起源 | 扱う状態 | 補足情報 |
|---|---|---|
| case-run 起源 | `blocked` | adversarial-review の unresolved ユーザー判断事項は blocked の停止理由へ正規化する |
| その他の委譲（req-define、case-open、case-close 等の工程委譲） | 既存 status（pass/warn/fail/partial）+ `parent_decision_required` | delegation-contracts SPEC の review 経路での parent_decision_required / decision_context 適用に従う |

### case-auto への伝播と resume point

case-auto は user-decision-required を停止理由分類として受領した場合、対象 Issue の処理を停止し、ユーザー判断を待機する。
resume point は次のいずれかとする。

- case-run 起源の場合: 当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）
- 工程委譲起源の場合: 当該工程の委譲起点

ユーザー判断の解決後、case-auto は resume point から処理を再開し、adversarial-review の再発動要否は adversarial-review SPEC「再 review 条件」「再 review 停止条件」の各節に従う。
adversarial-review 自体を恒久的な統制ゲートとしない（REQ-014-009、adversarial-review SPEC「unresolved 時の不可逆処理回避」節参照）。

### bounded parent decision resolution と停止・resume 伝播（REQ-006-112〜114、DEC-008）

case-auto は user-decision-required + decision_context を受領した際、bounded parent decision resolution により decision_context を自律解決できる場合はユーザー停止せずに下位 command を resume させる。
本節は case-auto と下位 command 間の停止・resume 伝播契約の整合のみを規定し、解決範囲、作業仮定の明示要件、停止理由分類の詳細は case-auto SPEC「bounded parent decision resolution（REQ-006-112〜114、DEC-008）」節、delegation-contracts SPEC「case-auto による decision_context の限定的親判断解決」節が正である。

**自律解決時の resume 伝播**:

| 起源 | 自律解決時の挙動 |
|---|---|
| case-run 起源 | case-auto は回答または作業仮定を case-run へ返し、当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）から resume させる |
| 工程委譲起源 | case-auto は回答または作業仮定を当該工程へ返し、当該工程の委譲起点から resume させる |

**ユーザー停止時の伝播**: case-auto が decision_context を自律解決できない場合（上位合意矛盾、新規ユーザー判断事項）、対象 execution_unit の処理を停止し、前節「case-auto への伝播と resume point」の resume point 仕様に従い resume point を記録する。
ユーザー判断の解決後、resume point から処理を再開する点は従来の user-decision-required 停止と同一である。
bounded parent decision resolution は新規の永続結果型を導入せず、既存 resume point 機構（REQ-006-085）を再利用する（DEC-008 決定5）。

**他 execution_unit への影響**: bounded parent decision resolution による停止は部分停止（REQ-006-015/016）であり、他の ready 対象の execution_unit がある場合は継続する。
ある execution_unit の decision_context 解決で他 execution_unit がブロックされることはない。
