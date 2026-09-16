---
name: agentdev-workflow-case-auto
description: "case-auto command の workflow 実装本体。case-open → case-ready → case-run → case-close（例外経路: case-revise → case-ready → case-run → case-close）の自走 orchestration、orchestration stage モデル、クリーンアップ検証ゲート、Wave 反復制御、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 由来の停止伝播、resume_command: req-define 停止、結果集約を所有する。USE FOR: case-auto 実行時の workflow 制御（入力解決・工程分岐・orchestration・停止検出・停止理由分類）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
---

# case-auto workflow スキル

case-auto command の workflow 実装本体である。
要件doc または Issue番号から case-open → case-ready → case-run → case-close を順次自走し（req-define で再合意済みの Definition 変更がある場合は case-revise → case-ready → case-run → case-close の例外経路）、repo 内変更に限りマージまで完了する制御構造を所有する。
orchestration stage モデル、クリーンアップ検証ゲート、Wave 反復制御、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 由来の停止伝播を統合する。
新しい意味判断が必要となった場合は blocked とし Root Case の resume_command: req-define で停止する（req-define の壁打ちを自動化しない）。

case-auto command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する。

## 入力

- case-auto command から渡される入力（Issue番号/URL、要件doc、明示パス、セッション指定キーワード）

## 出力

- Root Case（GitHub Issue）+ 実装済みブランチ + PR + マージ済み + クローズ済み（REQ/Decision/Design の保存は case-ready / case-revise の内部責務として実行）
- 工程に応じた各工程の出力

## 副作用

- 各工程の委譲起動（case-open、case-ready、case-revise（例外経路時）、case-close）とインライン実行（case-run）
- bg task API による stage 2 並列起動（最大5件）
- GitHub Issue/PR/comment/merge/close（自走対象、command 不変条件）
- remote branch 削除（当該 case-auto/ case-run が作成した branch に限定）
- docs/ REQ/ Decision/ Design/ command reference/ guide の更新（自走対象、command 不変条件）
- 当該 Workflow Skill は worktree root 配下以外を編集しない

## 制御平面（STEP 一覧）

case-auto workflow は次の8 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ。
会話コンテキストに依存せず、永続状態（`case_auto_started_at`、L1 タイムスタンプ、orchestration stage 別結果、bg task 状態、結果状態4次元）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 入力解決・開始時刻記録 | case-auto 起動 | 入力モード確定、`case_auto_started_at` 記録 | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-2 | 工程分岐（継続工程確定） | 入力解決完了 | 工程順序確定（通常経路 / 例外経路 / Issue 再開、auto_gate preflight） | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-3 | orchestration 実行 | 工程順序確定 | 各工程の実行結果、stage モデル適用、クリーンアップ検証ゲート、Wave 反復、bg task 状態管理 | [references/input-resolution-and-orchestration.md](references/input-resolution-and-orchestration.md) |
| STEP-4 | 停止条件検出・停止理由分類 | 各工程の結果受領 | 停止判定（11項目）、停止理由分類（7軸＋上位合意矛盾/新規ユーザー判断）、resume_command 記録 | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-5 | adversarial-review 由来の停止伝播 | user-decision-required + decision_context 受領 | 当該 execution_unit の自走停止、ユーザー判断待機 | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-6 | bounded parent decision resolution | decision_context 受領 | 自律解決 / 作業仮定 / 上位合意矛盾停止 / 新規ユーザー判断停止 | [references/stop-and-decision-resolution.md](references/stop-and-decision-resolution.md) |
| STEP-7 | コンフリクト解消 Level 2/3 | case-close から Level 1 失敗エスカレーション受領 | インライン case-run 再実行（最大2回）、オーケストレーション級判断、解消 or 停止 | [references/conflict-resolution-and-reporting.md](references/conflict-resolution-and-reporting.md) |
| STEP-8 | 完了報告 | 全工程完了 or 停止 | L1 タイムスタンプ、4次元集約、OU処理ループ、tmp/ 残存確認、結果状態の分離報告 | [references/conflict-resolution-and-reporting.md](references/conflict-resolution-and-reporting.md) |

### STEP 間の依存と分岐

- **正常経路**: STEP-1 → STEP-2 → STEP-3 → STEP-8（全工程完了時）
- **停止経路**: STEP-3 → STEP-4（停止条件検出時）→ STEP-8（停止報告）
- **停止伝播**: STEP-3 → STEP-5（user-decision-required 受領時）→ ユーザー判断待機 → resume point から再開
- **bounded parent decision**: STEP-3 → STEP-6（decision_context 受領時）→ 自律解決時は STEP-3 へ戻る、上位合意矛盾/新規ユーザー判断時は STEP-4 停止経路へ
- **コンフリクトエスカレーション**: STEP-3（case-close 委譲時）→ STEP-7（Level 1 失敗時）→ 解消時は STEP-3 へ戻る、Level 3 失敗時は STEP-4 停止経路へ

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: `case_auto_started_at` と L1 工程別タイムスタンプ、Issue/PR の存在と番号、Epic Issue 本文のステータス追跡テーブル（Wave 進行）、draft の有無（case-open 完了前のみ pre-reader）、各工程の完了結果、Root Case の状態（open / ready / running / blocked / review / closed）と resume_command
- 停止時報告に再開点と再開可能な次コマンドを明示し、会話コンテキストの記憶に依存しない。case-ready 成功後の再開は Issue と Epic だけで成立させる（orchestration pre-reader 契約）

### 終了条件（termination）

- 正常終了: 全工程完了（OU処理ループを含む全 OU 処理完了）時の完了報告まで
- 一時ファイル残存: 正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-8 で確認。一時ファイル cleanup 規定（workflow 側で生成した `.agentdev/tmp/` 一時ファイルは当該実行内で削除する。Custom Tool 内部の一時ファイルは Tool が操作ごとに自動削除する））
- 停止終了: 11項目の停止条件いずれかの検出時（停止理由分類済み報告、新しい意味判断時は resume_command: req-define を記録）。bounded parent decision resolution での上位合意矛盾・新規ユーザー判断。adversarial-review 由来の user-decision-required。コンフリクト Level 3 失敗
- 委譲起動不能時: `delegation-unavailable` として報告（委譲工程のインライン実行への切替えは行わない）

## orchestration stage モデル（case-auto 実行契約）

| stage | 工程 | 実行方式 | 並列性 |
|---|---|---|---|
| stage 1 | case-open → case-ready（例外経路時は case-revise → case-ready） | 直列集約 | 単一 |
| stage 2 | case-run | bg task（最大5件） | 並列（3つの「5件」文脈の (2) に該当） |
| stage 3 | case-close | 直列集約 | 単一 |

- 各 orchestration stage を前 stage 完了後に開始する。stage 1 と stage 3 を直列集約ポイントとし、main への push、capture、commit を並列実行区間の外で処理する
- case-run internal lifecycle（state machine、self-healing loop 等）を複製せず case-run 側の正規所有に委譲する
- stage 2 の同時起動数は固定値（最大5件、実行安全境界）。順次実行はフォールバック時にのみ許可しフォールバック理由を完了報告に含める。並列起動時は委譲起動ごとに10秒の起動間隔を置き、同一Tool一括ブロックでの複数起動発行は行わない（epic-wave-model Design「並列起動の間隔」）
- case-ready 完了後（stage 1 と stage 2 の間）にクリーンアップ検証ゲート（ドラフト残存、RU 残存の検証）を実行する。残存を検出した場合は停止する（case-auto 実行契約）

## 下位 Workflow Skill 連携（上位 orchestrator）

本スキルは上位 orchestrator として次の下位 Workflow Skill を名レベルで参照する。
下位 workflow の契約詳細を複製しない。

- `agentdev-workflow-case-open`: case-open 工程（委譲起動、委譲先 subagent が権威情報源として読み込む）
- `agentdev-workflow-case-ready`: case-ready 工程（同上。Definition 保存内部責務・execution contract 確定・ready 遷移を所有）
- `agentdev-workflow-case-revise`: case-revise 工程（例外経路時のみ委譲起動。再合意済み Definition 変更の反映と Amendment PR 作成を所有）
- `agentdev-workflow-case-run`: case-run 工程（case-auto 自身がインライン実行の読込主体として読み込む、起動手段は harness 分離モデル Design 参照）
- `agentdev-workflow-case-close`: case-close 工程（委譲起動、委譲先 subagent が権威情報源として読み込む）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-workflow-orchestration`: orchestration 詳細プロトコル、bg task 破棄検知・状態別回復、capture 境界、Subagent 委譲プロトコル、停止理由分類詳細、コンフリクト解消 Level 2/3 詳細
- `agentdev-case-run-execution-adapter`: case-run 委譲契約（インライン実行時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ、コンフリクト解消 rebase パス（Level 1 は case-close、Level 2/3 は本 workflow）
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（case-auto は読取のみ、書き込みは case-close 単一書き手）
- `agentdev-workflow-lifecycle`: 引き継ぎ停止判定
- Custom Tool `agentdev_gh`: GitHub Issue/PR/comment/merge/close I/O
- `agentdev-project-extensions`: project extension 読込
- `agentdev-adversarial-review`: 停止伝播のみ受領（case-auto は直接起動しない）
- 各工程の Capability Skill を継承（case-open/case-ready/case-revise/case-run/case-close の依存スキル群）

## 共通制約

- **自走境界（ガードレール: 自走対象外・remote branch 削除限定、ほか不変条件）**: repo にファイルとして残る変更のみ自走対象。DB migration 実行、deploy/apply、クラウドリソース操作、外部SaaS 設定変更、課金、権限、認証情報、repo外実データ操作、通知送信は対象外
- **委譲・参照制約（command 不変条件、ガードレール: Epic Issue 本文書き込み禁止）**: 各工程は対応するコマンド定義を authoritative source として実行（case-auto 定義内再実装回避）。case-run はインライン実行（標準動作）。Epic Issue 本文書き込みは case-close 単一書き手（case-auto は読取のみ、`POL-epic-tracking-single-writer`）。case-auto は Issue 階層決定ロジックを持たない、Epic / Wave / Issue 構成は case-ready の確定結果に従う（command 不変条件）
- **3つの「5件」文脈の区別**: (1) case-run Wave 内子 Issue 並列、(2) case-auto stage 2 同時起動数、(3) execution_unit 全体並列（上限なし）。混同しない
- **OU処理ループ**: Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を STEP-3 から開始（全 OU 処理完了時のみ全体完了報告）
- **親コンテキスト非累積（command 不変条件）**: 委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない
- **L1 タイムスタンプ**: 開始時刻（`case_auto_started_at`）、工程別タイムスタンプ（case-open / case-ready / case-run / case-close、例外経路時は case-revise を含む）、終了時刻を記録。case-run の L2 内訳は case-run result から読み取って含める
- **既存成果物検出ガード（STEP-3 各工程起動時の前置ガード）**: 各工程の起動時に git log で当該工程成果物の既存 commit を確認する。成果物が既に commit 済みの場合は配置検証のみで pass 判定する配置検証モードへ切替え、同一成果物の二重 commit と内容衝突を予防する（未 commit の場合は通常経路で当該工程を実行する）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **Decision records**: Command / Workflow Skill / Capability Skill の責務分化、STEP resume point、bounded parent decision resolution、Definition 確定境界の正規判断
- **case-auto command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
