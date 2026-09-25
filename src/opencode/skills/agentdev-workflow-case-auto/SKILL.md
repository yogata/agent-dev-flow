---
name: agentdev-workflow-case-auto
description: "case-auto command の workflow 実装本体。case-open → case-ready → case-run → case-close（例外経路: case-revise → case-ready → case-run → case-close）の自走 orchestration、orchestration stage モデル、クリーンアップ検証ゲート、Wave 反復制御（stage 3 共有 active Issue task 枠・空き枠補充・状態管理・再開時二重起動防止・Wave 収束と依存充足の両条件 gate・委譲前重複実行時検出）、bounded parent decision resolution、コンフリクト解消 Level 2/3、停止理由分類、adversarial-review 由来の停止伝播、resume_command: req-define 停止、結果集約を所有する。USE FOR: case-auto 実行時の workflow 制御（入力解決・工程分岐・orchestration・停止検出・停止理由分類）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）。"
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
- stage 3 の共有 active Issue task 枠（Epic・Wave・Standard Issue を横断して単一所有、上限 5）による実装実行委譲の並列起動（bg task API、起動間隔 10 秒）
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
- 現在 stage は stage cursor を新たな正規状態として保存せず、起動時対象集合と各対象の正規状態（Issue / PR / Case 等）から最も早い未収束 stage として再構成する。完了済み対象を再実行せず、同一対象だけを後続 stage へ先行させない。起動時対象集合の安定識別子は中断再開に必要な期間に限りローカル一時実行状態として保持し、draft / RU の削除によって対象を実行中の対象集合から消失させない。正規成果物から再構成できる情報を別の正規状態として重複管理しない（case-auto Design「ドラフト間並列実行モデル」）
- 停止時報告に再開点と再開可能な次コマンドを明示し、会話コンテキストの記憶に依存しない。case-ready 成功後の再開は Issue と Epic だけで成立させる（orchestration pre-reader 契約）

### 終了条件（termination）

- 正常終了: 全工程完了（OU処理ループを含む全 OU 処理完了）時の完了報告まで
- 一時ファイル残存: 正常終了の前提として、当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（STEP-8 で確認。一時ファイル cleanup 規定（workflow 側で生成した `.agentdev/tmp/` 一時ファイルは当該実行内で削除する。Custom Tool 内部の一時ファイルは Tool が操作ごとに自動削除する））
- 停止終了: 11項目の停止条件いずれかの検出時（停止理由分類済み報告、新しい意味判断時は resume_command: req-define を記録）。bounded parent decision resolution での上位合意矛盾・新規ユーザー判断。adversarial-review 由来の user-decision-required。コンフリクト Level 3 失敗
- 委譲起動不能時: `delegation-unavailable` として報告（委譲工程のインライン実行への切替えは行わない）

## orchestration stage モデル（case-auto 実行契約）

| stage | 工程 | 実行方式 | 並列性 |
|---|---|---|---|
| stage 1 | case-open（再合意済み Definition 変更の例外経路時は case-revise） | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |
| stage 2 | case-ready | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |
| stage 3 | case-run | インライン実行（実装実行委譲は共有 active Issue task 枠、上限 5） | 並列（stage 3 全体で共有 active Issue task 枠を単一所有） |
| stage 4 | case-close | 委譲起動 | stage 内最大並列（直列化要因のみ局所直列化） |

- 各 orchestration stage は stage 内最大並列・stage 間全対象収束（fan-in）で進行し、対象ごとの縦切り pipeline としない。当該 stage に属する全対象が正常完了し、または当該実行において後続 stage へ進めないことが既存契約上確定した結果（blocked / failed / delegation-unavailable 等の後続不能確定）に収束するまで次 stage を開始せず（未実行・実行中・状態不明・再試行要否未確定対象の残存は収束済みとしない）、後続不能対象を後続 stage の対象から除外しその存在だけを理由として独立した他対象の進行を停止しない（case-auto 実行契約）
- main への push、capture、commit、同一 Epic Issue 本文への更新等の競合する共有書き込みは、当該競合部分のみを必要な単位で局所的に直列化し、当該競合と無関係な対象を含む stage 全体の直列化を行わない（case-auto 実行契約）。共有資源カテゴリと直列化単位の運用表（main への merge / push はリポジトリ単位、同一 Epic Issue 本文への更新は Epic 単位の per-Epic 単一書き手、採番・AUTOGEN 索引更新はグローバル、対象固有ファイルは対象単位で並列可。lock / queue / scheduler 方式は指定しない）は case-auto Design「複数 execution_unit 並列 orchestration」節参照
- case-run internal lifecycle（state machine、self-healing loop 等）を複製せず case-run 側の正規所有に委譲する
- stage 3 の共有 active Issue task 数の上限は固定値（5、実行安全境界。1 active task = 1 Issue への実装実行委譲。Epic・Wave・Standard Issue・case-run 呼出しごとの独立実行枠を設けない）。並列実行は必須であり、実行環境由来の障害（background task の消失、親 run の中断、provider failure 等）を理由とする同期逐次実行（順次フォールバック）への切替を行わない。並列起動が当該 stage の起動可能対象集合に対して1件も成立しない場合は、直列化で完了を装わず停止理由「並列起動不能」（原因の断定を含まない）と再開可能性を報告して停止する（case-auto Design「runtime 制御契約」節）。並列起動時は委譲起動ごとに10秒の起動間隔を置き、同一Tool一括ブロックでの複数起動発行は行わない（v4-runtime-execution-model Design「runtime 制御ループ」節〔起動間隔・並列数制御〕）。起動間隔は stage 1（case-open / case-revise 委譲）・stage 2（case-ready 委譲）・stage 4（case-close 委譲）の並列委譲起動にも同一に適用する。scheduling 制約（最大同時起動数・起動間隔）による batch 分割を orchestration stage の分割として扱わない
- stage 3 の runtime 制御契約（詳細は case-auto Design「runtime 制御契約」節と v4-runtime-execution-model Design「runtime 制御ループ」節）:
  - **空き枠補充**: active Issue task 数が上限未満の場合、各 Epic の現在 Wave と Standard Issue から開始条件を満たす Issue を横断して候補として認識し、実行上の安全条件を満たす候補がある限り補充する（横断補充は best-effort でなく必須）。最初に起動した全 task の完了を待つ固定 batch 方式を取らず、起動は実行進行中に継続する。起動間隔（10 秒）と局所的な競合回避の運用は維持する
  - **状態管理**: Issue 実行の状態を pending、ready、active、実行結果確定で区別して管理する
  - **再開時の二重起動防止と上限超過防止**: 再開時は既存の active task を計上し、同一 Issue の二重起動と上限超過を防ぐ。状態不明の task は終了確認まで実行枠を解放せず、完了済み Issue を未完了に戻さない
  - **統合処理**: 統合処理（マージ・クローズ相当）は active Issue task の実行枠を消費しないが、共有書き込みの直列化点として扱う
  - **Wave 収束と依存充足の両条件 gate**: Wave 収束（当該 Wave の全子 Issue の実行結果確定、未処理・実行中・状態不明なし）と後続 Wave の依存充足（意味的依存条件の成立、必要な統合・マージの完了を含む）を区別し、次 Wave の開始は両方の成立を条件とする。blocked、failed、delegation-unavailable は収束には該当し得るが依存充足とはみなさない
  - **委譲前重複実行時検出**: stage 3 の委譲前に同一 Wave 内の子 Issue 間で変更対象ファイル集合の重複を検出し、一時直列化・変更対象の調整・merge 順序・衝突解消担当の判断に用いる（case-ready の重複前置検出の判断記録を参照し、二重検査としない）。変更対象集合が取得不能な子 Issue を含む場合は比較を省略せず検出不能として報告する（無重複扱いしない）
  - **Wave 表現**: Wave 表現は子 Issue 数の上限を持たない（Epic サイズ上限のみ適用）。runtime 上の batch や一時直列化を Wave 分割として永続化しない
- クリーンアップ検証ゲート（ドラフト残存、RU 残存の検証）を stage 2 の対象群収束後・stage 3 開始前に実行し、stage 2 を正常完了した対象について残存を検出した場合は停止する。stage 2 が blocked / failed / 中断等で正常完了していない対象について、既存 lifecycle 契約に従って保持された draft / RU を cleanup 違反として扱わない（case-auto 実行契約）
- Epic execution_unit の Wave 間および最終 Wave の case-close(#epic) は Wave 反復を進行・完結させる stage 3 内部の状態遷移処理であり、stage 4 の開始とみなさない。Epic execution_unit の stage 3 完了は後続 Wave が残存しない状態への Wave 反復の完遂であり、stage 3 完了判定は既存 Epic/Wave workflow の execution_unit 完了状態基準に従い、その内部ロジックを複製しない。stage 4 では追加の case-close を行わない。stage の分類は orchestration 上の位置づけにより行い、command 名単独では分類しない（case-auto Design「ドラフト間並列実行モデル」）

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
- **5件文脈の区別**: (1) case-auto stage 3 共有 active Issue task 数（上限 5。1 active task = 1 Issue への実装実行委譲。Epic・Wave・Standard Issue を横断して単一所有）、(2) execution_unit 全体並列（上限なし）。混同しない。case-run 独自の Wave 内子 Issue 並列枠は廃止済みであり第3の文脈として存在しない
- **OU処理ループ**: Standard flow の case-close（stage 4）完了後に未処理 OU が残存する場合は次 OU の処理を STEP-3 から開始（全 OU 処理完了時のみ全体完了報告）。起動時対象集合は case-ready が確定した全 execution_unit であり、OU の必須依存は stage 内の直列化要因である（case-auto 実行契約）。必須依存で結合した execution_unit 群は順次（stage 内局所直列化）、必須依存のない execution_unit 群は並列で処理し、OU 逐次処理は orchestration stage モデルを置き換えない
- **親コンテキスト非累積（command 不変条件）**: 委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない
- **L1 タイムスタンプ**: 開始時刻（`case_auto_started_at`）、工程別タイムスタンプ（case-open / case-ready / case-run / case-close、例外経路時は case-revise を含む）、終了時刻を記録。case-run の L2 内訳は case-run result から読み取って含める
- **既存成果物検出ガード（STEP-3 各工程起動時の前置ガード）**: 各工程の起動時に git log で当該工程成果物の既存 commit を確認する。成果物が既に commit 済みの場合は配置検証のみで pass 判定する配置検証モードへ切替え、同一成果物の二重 commit と内容衝突を予防する（未 commit の場合は通常経路で当該工程を実行する）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **Decision records**: Command / Workflow Skill / Capability Skill の責務分化、STEP resume point、bounded parent decision resolution、Definition 確定境界の正規判断
- **case-auto command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
