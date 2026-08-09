---
title: harness 分離モデル
status: accepted
created: 2026-07-12
updated: 2026-07-27
---

# harness 分離モデル

## 目的

AgentDevFlow 配布物と harness 実行制御の責務分離モデルを定義する。
配布物は業務ワークフロー契約のみで完結し、harness 依存の具体を限定された場所へ集約する。
本 SPEC は配布物が固定してはならない harness 委譲領域と、配布物が定義してよい範囲を現行契約として確定する。

原本原則は DEC-001（AgentDevFlow 憲章）決定2（ADF が所有しない領域）に由来する。
本 SPEC は決定2を SPEC として具体化し、配布成果物の責務境界（REQ-002）と協調して配布物の harness 非依存を担保する。

## 配布物の harness 非依存性

配布物（command、skill、SPEC、template、script）は次の harness 委譲領域を固定してはならない。

- エージェント名
- モデル名
- 必須 skill 名
- timeout 値
- retry 回数
- context 管理方式
- TDD の具体手順
- コードレビューエージェントの種類と構成
- デバッグ方法
- 実装計画の内部形式
- コード構造とテスト構造
- 起動 API と実行順序

配布物は次の範囲を定義してよい。

- 「必要能力」（検証能力、回帰防止、独立レビュー等）
- 「標準方針」（実装方針の推奨）

特定のエージェント名、skill 名、起動 API、実行順序を ADF 配布物で固定しない。
「必要能力」と「標準方針」は harness、モデル、適用プロジェクトが具体化する。

## 分離原則

### 配布物側（業務ワークフロー契約）

配布物の大多数（SKILL.md 本体、command .md 本体、docs/REQ、docs/ADR、docs/SPEC、docs/guides、README）は業務ワークフロー契約のみで完結する。

- 工程の進行条件、停止条件
- 永続成果物（REQ/Decision/SPEC/Issue/PR/`.agentdev/`）
- Quality Gate
- 実行結果契約
- 副作用の許可、禁止境界

### harness 側（実行制御）

実行エージェント選定、起動方法、実行制御パラメータは harness の責務として配置する。

- プロジェクトルート `AGENTS.md`: harness 選定、エージェント型指定
- 各 skill の `references/<topic>.md`: skill 固有の実行制御具体（エージェント型名、起動方法、timeout、並列度、再試行等）

上記 harness 側の実行制御は、`responsibility-boundary-purification.md` が定義する「harness execution mechanism」（agent 起動、background task、並列実行、context 管理）として ADF 規範所有対象外である（REQ-011-018）。本 SPEC は harness execution mechanism の境界宣言のみを所有し、起動 API、並列数、timeout 等の具体は各 skill の `references/` へ集約する。external execution boundary（外部バックエンド接続）は REQ-011 が正規所有する（REQ-011-017）。

## 実行結果契約

case-run、case-auto の実行結果契約は次の4状態を区別する。

- `completed-pr`: 実装完了、PR 作成済み
- `blocked`: 回答可能な blocker に遭遇
- `failed`: 実装試行後の領域レベル失敗
- `delegation-unavailable`: 実行インフラ起動不能

`failed` と `delegation-unavailable` は異なる回復アクションを要する独立の結果状態として扱う。
結果状態の遷移機械、委譲契約、ラベル構造の詳細は `docs/specs/workflows/delegation-contracts.md` を正規所有者とし、本 SPEC は境界宣言へ縮約する。

## case-auto の orchestration stage と bg task 管理

case-auto の orchestration stage（stage 1 case-open 順次、stage 2 case-run 並列、stage 3 case-close 順次）、stage 2 の固定並列数、bg task の状態管理、破棄検知時の状態別回復（commit 済み PR 未作成、未コミット変更残存の区別）は AgentDevFlow 側の業務ワークフロー契約として所有する。
これらは後続工程が依存する安全境界と回復契約であり、配布物で共有する。

bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness 側の所有とする（harness execution mechanism、ADF 規範所有対象外、REQ-011-018）。
stage 1 と stage 3 の直列集約ポイントは main push、capture、commit を並列実行区間の外で処理する AgentDevFlow 側の契約とし、bg task API 経由の実行制御は harness 側の責務として維持する。

工程別の所有対象、非所有対象の詳細リストは `docs/specs/responsibilities/responsibility-boundary-purification.md` を正規所有者とする。

## 参照実装

`agentdev-case-run-execution-adapter` skill が本モデルの参照実装である。

- `SKILL.md`: 業務ワークフロー契約（result 4状態契約、test-fix ループ、worktree 隔離、Findings 配置等）
- `references/harness-delegation.md`: harness 固有の実行制御具体

他 skill も同一モデルへ整理する。
`agentdev-architecture-advisory` は `references/architecture-review-delegation.md` を新設し同モデルへ移行する。

## 適用基準

配布物から harness 固有の記述を分離する基準を次に示す。

| 配布物側に残す | harness 側へ分離 |
|---|---|
| サブエージェントへの委譲ステップ（業務ワークフロー契約） | サブエージェントの具体名、起動方法 |
| result 契約、ラベル構造、分類権限 | timeout、並列度、再試行等の実行制御パラメータ |
| 進行条件、停止条件、永続成果物、QG | harness 起動失敗の解析、救済手順 |

## 配布 docs の制約

配布 docs（REQ/Decision/SPEC/guides/README）は runtime workspace ディレクトリ（`.sisyphus/` 等）の管理を扱わず、業務ワークフロー契約のみを記述する。
runtime workspace 管理は harness 側の責務とする。

## 具象参照抽象化

配布物からプロジェクト固有要素を除去する方針を定める。
本 SPEC は方針のみを所有し、除去対象パターン、検出ルール、baseline の具体的な一覧は [references/concrete-abstraction.md](references/concrete-abstraction.md) へ集約する。

除去対象の核心は、配布物本文にプロジェクト固有識別子（REQ-ID、ADR-ID、IR-ID 形式）と消費プロジェクトの文書ディレクトリ内部パス（`docs/specs/**`、`docs/guides/**` 等）を残置しないことである。
識別子、パスを除去した後のトレーサビリティは git 履歴と原本側 docs/ で担保し、配布物には残置しない。

## 関連

- DEC-001（AgentDevFlow 憲章）: 決定2（ADF が所有しない領域）が本 SPEC の原本原則。
- DEC-002（OpenCode ソース・プロジェクション分離）: 本 SPEC の harness 非依存原則を原本とプロジェクションの分離によって物理層で担保する。
- REQ-002（配布成果物の責務境界）: 配布成果物側の正規所有者。本 SPEC は交叉参照として所有内容を重複しない。
- v2:ADR-0136（配布物の harness 実行制御分離）: 吸収元。決定本質は charter 決定2 に先駆的適用として含まれる。
- v2:REQ-0162（配布物の harness 実行制御分離）: 吸収元。原則の SSoT と各要件行（4状態結果契約、配布 docs 制約、ADF 可観測タイムスタンプ境界、ID 除去、パス除去）を本 SPEC および REQ-002 へ統合した。
- v2:ADR-0114（case-run 実行責務の外部実行バックエンド委譲）: 吸収元。harness 選定領域に降格された実行制御側の知見を取り込み、result 4状態契約の前身である委譲モデルを本 SPEC の前段として位置づける。
- `docs/specs/workflows/delegation-contracts.md`: 委譲契約詳細（result state machine、launch mechanism、delegation envelope）の正規所有者。
- `docs/specs/responsibilities/responsibility-boundary-purification.md`: 工程別（case-auto、case-run、execution adapter、Project Extensions、タイムスタンプ）の所有/非所有リスト詳細。
